# แผนการพัฒนาการจัดการระบบแคตล็อกหลัก (Master Catalog Implementation Plan - Revised)

แผนพัฒนานี้จัดทำขึ้นจากข้อกำหนดการทบทวนของระบบและปรับโครงสร้างการเปลี่ยนผ่านทั้งหมดให้มี **ความปลอดภัยเป็นอันดับหนึ่ง (SRE-First Rollout)** เพื่อให้มั่นใจได้ 100% ว่าการจัดทำและเปลี่ยนผ่านระบบจะไม่ทำให้ผู้ใช้เดิมสร้าง คัดลอก หรือคำนวณราคาใบงานสะดุดล้มระหว่างช่วงเดปลอยการทำงาน

---

## 🎯 ลำดับขั้นตอนการดำเนินงานจริง (Development Roadmap)

การดำเนินการจะเรียงลำดับใหม่ทั้งหมดตามข้อเสนอแนะเพื่อให้ได้ความมั่นคงสูงสุด:

```
[เฟส 0: Preflight] ────────> [เฟส 1A: DB Setup] ────────> [เฟส 2: Code Deploy] 
 นับจำนวน/ตรวจสอบ           สร้างตาราง/ยึด RLS/               เขียนข้อมูล/บันทึก/
 และสำรองข้อมูล             ทริกเกอร์/ทำ Backfill             พิมพ์/Dashboard แยกเล่ม

                                   │
                                   ▼
[เฟส 4: GUI/Logs] <──────── [เฟส 3: Hardening] <────────┘
 สร้างระบบพรีวิว Excel       สั่งปรับ NOT NULL/ 
 คัดกรองราคาขยับเล่ม         ป้องกันเปลี่ยนรุ่น
```

---

## 🛠️ รายละเอียดการเปลี่ยนแปลงและแผนการดำเนินงานรายเฟส

### เฟส 0: การตรวจสอบสภาวะและความปลอดภัยเริ่มต้น (Preflight Verification & Production Readiness Report)
*   **วัตถุประสงค์**: ตรวจทานข้อมูลเดิม สำรองข้อมูล และสร้าง rollback plan ก่อนเริ่ม migration
*   **งานปฏิบัติ**:
    1.  รันคำสั่ง SQL นับและตรวจสอบใบงาน `boq` และรายการไอเทม `boq_items` ในปัจจุบัน
    2.  ตรวจสอบหาไอเทมประวัติศาสตร์ที่คอลัมน์ `price_list_id` มีค่าเป็น `NULL` หรือชี้ไปที่ไอดีที่ไม่มีอยู่จริง
    3.  ตรวจสอบ RLS ปัจจุบันรวม `boq_routes` และตรวจสิทธิ์ของผู้ใช้งานในระบบจริง
    4.  **สำรองข้อมูลก่อน Migration (Backup)**:
        *   ตรวจ latest restore point ผ่าน Supabase Dashboard > Database > Backups (PITR)
        *   รัน `supabase db dump` หรือ `pg_dump` เก็บ logical backup ไว้
        *   รัน [001_backup_before_migration.sql](file:///Users/cloud/Cloudstellar/conduit-boq/migrations/001_backup_before_migration.sql) ถ้ามี
        *   Export ผล preflight queries ทั้งหมดเป็น baseline report (เก็บไฟล์ไว้เทียบกับหลัง migration)
    5.  **Rollback Decision Tree**:
        *   ถ้า Phase 1A DDL พัง (เช่น duplicate item_code) → **forward-fix**: แก้ข้อมูลแล้วรันใหม่
        *   ถ้า Phase 1A backfill พัง (ข้อมูลเสียหาย) → **restore** จาก snapshot
        *   ถ้า Phase 2 code deploy พัง → **revert git** + DB ยังใช้ได้ (เพราะ columns เป็น nullable)
*   **คำสั่งตรวจสอบ SQL**:
    ```sql
    -- 1. ตรวจสอบจำนวนแถว BOQ และไอเทมปัจจุบัน
    SELECT count(*) AS total_boqs FROM boq;
    SELECT count(*) AS total_boq_items FROM boq_items;
    
    -- 2. ค้นหารายการไอเทมที่มีปัญหาเรื่องคีย์เชื่อมโยงราคากลางสูญหาย
    SELECT count(*) AS orphaned_items 
    FROM boq_items 
    WHERE price_list_id IS NULL;
    
    -- 3. ค้นหา boq_items.price_list_id ที่ชี้ไป price_list.id ที่ไม่มีจริง (Dangling FK)
    SELECT count(*) AS dangling_fk_items
    FROM boq_items bi
    LEFT JOIN price_list pl ON bi.price_list_id = pl.id
    WHERE bi.price_list_id IS NOT NULL AND pl.id IS NULL;
    
    -- 4. [CRITICAL] ตรวจหา duplicate item_code ก่อนเพิ่ม UNIQUE constraint
    SELECT item_code, count(*) AS dup_count
    FROM price_list
    GROUP BY item_code
    HAVING count(*) > 1;
    
    -- 5. ตรวจสอบ RLS ที่มีอยู่ (รวม boq_routes)
    SELECT tablename, policyname, permissive, roles, cmd, qual 
    FROM pg_policies 
    WHERE tablename IN ('price_list', 'boq', 'boq_items', 'boq_routes');
    
    -- 6. ตรวจชื่อ unique constraint/index จริงบน price_list.item_code
    -- ถ้าชื่อไม่ใช่ 'price_list_item_code_key' → ต้องแก้ proposal DROP CONSTRAINT
    SELECT conname, contype
    FROM pg_constraint
    WHERE conrelid = 'price_list'::regclass AND contype = 'u';
    
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'price_list' AND indexdef LIKE '%item_code%';
    
    -- 7. ตรวจว่า price_list_versions มีหรือยัง และ assert 2568.0.0 (รันเป็น block เดียว paste-run ได้ทันที)
    DO $$
    DECLARE
      v_table regclass;
      v_row_exists BOOLEAN;
    BEGIN
      v_table := to_regclass('public.price_list_versions');
      IF v_table IS NULL THEN
        RAISE NOTICE 'price_list_versions ยังไม่มี (ปกติสำหรับครั้งแรก)';
        RETURN;
      END IF;

      -- ตรวจว่า row 2568.0.0 มีหรือยัง
      SELECT EXISTS(
        SELECT 1 FROM public.price_list_versions
        WHERE major = 2568 AND minor = 0 AND patch = 0
      ) INTO v_row_exists;

      IF NOT v_row_exists THEN
        RAISE NOTICE '2568.0.0 ยังไม่มี — seed จะสร้างให้ (ปกติ)';
        RETURN;
      END IF;

      -- row มีอยู่ → ต้องตรวจว่า status/is_default ถูกต้อง
      PERFORM 1 FROM public.price_list_versions
      WHERE major = 2568 AND minor = 0 AND patch = 0
        AND status = 'active' AND is_default = true;
      IF NOT FOUND THEN
        RAISE EXCEPTION '2568.0.0 มีอยู่แต่ status หรือ is_default ไม่ตรง — ต้องแก้มือก่อน migration (ON CONFLICT DO NOTHING จะไม่ซ่อม)';
      END IF;

      RAISE NOTICE '2568.0.0 พร้อมใช้งาน';
    END $$;
    ```
*   **คำสั่งตรวจสอบ SQL หลัง Backfill (Phase 1A Post-Verification)**:
    ```sql
    -- 8. [CRITICAL] ตรวจ boq.price_list_version_id IS NULL หลัง backfill
    -- ถ้าผลลัพธ์ > 0 แสดงว่า Phase 1B (SET NOT NULL) จะ FAIL!
    SELECT count(*) AS unlinked_boqs
    FROM boq
    WHERE price_list_version_id IS NULL;
    
    -- 9. [NEW] ตรวจ cross-version mismatch ระหว่าง boq_items กับ boq
    SELECT count(*) AS mismatched_items
    FROM boq_items bi
    JOIN price_list pl ON bi.price_list_id = pl.id
    JOIN boq b ON bi.boq_id = b.id
    WHERE pl.version_id IS DISTINCT FROM b.price_list_version_id;

    -- 10. ตรวจ write privileges ของ authenticated (หลัง REVOKE ต้องไม่มี INSERT/UPDATE/DELETE)
    SELECT grantee, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_name IN ('price_list_versions', 'price_list', 'price_list_audit_logs')
      AND grantee IN ('PUBLIC', 'authenticated', 'anon')
      AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE');
    -- ถ้ามีผลลัพธ์ → REVOKE ยังไม่ทำงาน ต้องแก้
    ```

---

### เฟส 1A: การปรับโครงสร้างฐานข้อมูลและ Backfill (Defensive Database Schema & Backfill)
*   **วัตถุประสงค์**: สร้างส่วนขยายแบบ **Nullable (ผ่อนปรน)** และฝังข้อมูลประวัติศาสตร์โดยไม่รบกวนหน้าเว็บปัจจุบัน
*   **งานปฏิบัติ**:
    1.  รันคำสั่ง SQL เพื่อสร้างตารางเล่มเวอร์ชัน `price_list_versions` และประวัติการเปลี่ยนแปลงราคา `price_list_audit_logs` (อย่างปลอดภัยและ rerunnable ภายใต้ preflight assertions)
    2.  เพิ่มคอลัมน์ `version_id` ใน `price_list`, `price_list_version_id` ใน `boq` และ `category` ใน `boq_items` เป็นแบบ **Nullable** และใช้กฎ `ON DELETE RESTRICT` เพื่อป้องกันข้อมูลหายย้อนหลัง
    3.  ติดตั้ง RLS แบบปลอดภัย บังคับอ่านเฉพาะสมาชิกที่ลงทะเบียนใช้งานระบบแล้ว (`TO authenticated`) และกำหนดสิทธิ์การเข้าถึงผ่านคำสั่ง `GRANT` อย่างโปร่งใส
    4.  สร้างและลงทะเบียนฟังก์ชันทริกเกอร์ `trigger_set_default_price_list_version` บนตาราง `boq` เพื่อรองรับการตั้งค่าราคาเวอร์ชันหลัก `2568.0.0` อัตโนมัติในกรณีไม่มีการระบุค่ามาตอนอินเสิร์ต
    5.  ติดตั้งทริกเกอร์ป้องกันการปิด/ลบเวอร์ชันเริ่มต้นใช้งานบนตาราง `price_list_versions` (`trigger_check_default_version_exists`) เพื่อเสถียรภาพระบบ 100%
    6.  ติดตั้งฟังก์ชัน `set_updated_at()` trigger บนตาราง `price_list_versions` เพื่อ auto-update `updated_at` ทุกครั้งที่มีการแก้ไข (Data Hygiene — เล็ก ปลอดภัย ช่วยตรวจสอบย้อนหลัง)
    7.  ทำ **Backfilling**:
        *   เชื่อมราคากลางประวัติศาสตร์ทั้งหมดเข้าสู่ไอดีรุ่นราคา `2568.0.0`
        *   ปลดบล็อกข้อจำกัดความไม่ซ้ำซ้อนเดิม (Drop global unique key `price_list_item_code_key`) และแทนที่ด้วยความปลอดภัยแบบจัดกลุ่ม `UNIQUE (version_id, item_code)` — ครอบทั้ง DROP/ADD ใน transaction block (ถ้ารันผ่าน SQL Editor ใช้ `BEGIN;...COMMIT;` / ถ้ารันผ่าน Supabase migration runner ไม่ต้องใส่เพราะ runner wrap transaction ให้อยู่แล้ว)
        *   เชื่อมโยงใบงานเดิมทั้งหมดในตาราง `boq` สู่ `2568.0.0`
        *   Snapshot ก๊อปปี้หมวดหมู่จาก `price_list.category` ลงสู่ฟิลด์ `boq_items.category` สำหรับข้อมูลเก่าทั้งหมดในอดีตทันที
*   **ผลลัพธ์**: ข้อมูลประวัติศาสตร์ทั้งหมดถูกเปลี่ยนรูปอย่างสมบูรณ์ โค้ดเดิมและแอปเดิมสามารถใช้งานได้ต่อเนื่อง ไร้ปัญหา RLS ขวางกั้น
*   **การป้องกัน Lock (สำคัญ)**:
    *   รันนอก peak hours (ก่อน 8:00 หรือหลัง 18:00)
    *   ตั้ง timeout ก่อนรัน DDL (ใช้ `SET LOCAL` ไม่ใช่ `SET` เพื่อไม่ให้รั่วไป backfill):
        ```sql
        SET LOCAL lock_timeout = '10s';
        SET LOCAL statement_timeout = '30s';
        -- ... DDL statements ...
        -- หลัง COMMIT:
        RESET lock_timeout;
        RESET statement_timeout;
        ```
*   **User Flow Verification หลัง RLS Deploy**:
    *   ทดสอบ 4 สถานะก่อนเดปลอยจริง:
        *   `admin` → อ่าน price_list ได้ / เขียนตรงถูกบล็อก (ต้องผ่าน RPC ใน Phase 1A) ✅
        *   `staff` → อ่าน price_list ได้ / เขียนถูกบล็อก ✅
        *   `inactive/suspended` user → ถูกบล็อกที่ middleware/UI layer (ไม่ใช่ RLS SELECT เพราะ SELECT policy เป็น `USING(true)` สำหรับ authenticated) ✅
        *   `anon` (ไม่ login) → ถูกบล็อกที่ RLS (`TO authenticated` ไม่รวม anon) ✅
    *   **หมายเหตุ**: inactive/suspended ถูกบล็อกการเขียนที่ RPC level (`status IN ('active','pending')` โดย pending ได้เฉพาะ BOQ ของตัวเอง) และ RLS write (WITH CHECK) แต่ยังอ่าน price_list ได้ผ่าน RLS SELECT — การบล็อกอ่านต้องทำที่ middleware/auth guard
    *   **Phase 1A Verification**: หลัง REVOKE write แล้ว admin direct-write (ผ่าน Supabase client ไม่ผ่าน RPC) จะถูกบล็อกที่ privilege level ด้วย — admin ต้องเขียนผ่าน RPC เท่านั้น จนกว่า Phase 4 จะเปิด write grants ให้

---

### เฟส 2: การพัฒนาและอัปเดตโค้ดหน้าเว็บ (Code base Deployment & Integration)
*   **วัตถุประสงค์**: แก้ไขโปรแกรมฝั่งหน้าบ้านและโมดูลการคำนวณทั้งหมดให้ทำงานสอดคล้องกับโครงสร้างเวอร์ชันและระบบ Snapshot หมวดหมู่ใหม่ โดยไม่มีปัญหาเรื่องรุ่นรั่วไหล (Version Leak)
*   **งานปฏิบัติ**:
    1.  **TypeScript Type Update (ต้องทำก่อนแก้ component)**:
        *   เพิ่มฟิลด์ใหม่ใน [lib/supabase.ts](file:///Users/cloud/Cloudstellar/conduit-boq/lib/supabase.ts):
            *   `PriceListItem` → เพิ่ม `version_id: string`
            *   `BOQ` → เพิ่ม `price_list_version_id: string`
            *   `BOQItem` → เพิ่ม `category: string | null`
        *   สร้าง type ใหม่ `PriceListVersion` (id, major, minor, patch, version_string, name, status, is_default, created_at, updated_at)
    2.  **RPC Update**: โค้ดฐานข้อมูลใน Phase 1A ได้เพิ่มฟิลด์ `category` และกลไกดึงข้อมูลอัตโนมัติ (Fallback) ไว้เรียบร้อยแล้ว ฝั่งหน้าบ้านจะทำการส่งออบเจกต์ที่มี `category: item.category` ไปด้วยใน JSON ของ `save_boq_with_routes` เพื่อเก็บบันทึกตรงลงฟิลด์ `category` ของตาราง `boq_items`
    3.  **Prop-based Version Filtering (ปิดจุดรั่วไหลของรุ่น)**:
        *   ปรับปรุง `app/boq/[id]/edit/page.tsx` และ `components/boq/MultiRouteEditor.tsx` ให้โหลดค่า `price_list_version_id` ของใบงาน BOQ ปัจจุบันขึ้นมาจากฐานข้อมูล และนำมากำหนดสถานะตัวแปร `priceListVersionId`
        *   ส่งต่อตัวแปร `priceListVersionId` เป็น Prop ผ่านคอมโพเนนต์: `MultiRouteEditor` -> `LineItemsTable` -> `ItemSearch`
        *   แก้ไขคอมโพเนนต์ `components/boq/ItemSearch.tsx` ให้รับ Prop `priceListVersionId` และแก้ไขคิวรีค้นหาตาราง `price_list` ทั้งสองจุด (การโหลดหมวดหมู่บรรทัดที่ 76-79 และคิวรีค้นหารายการบรรทัดที่ 107-110) ให้พ่วงเงื่อนไข `.eq('version_id', priceListVersionId)` เสมอ ป้องกันไม่ให้แอดมินหรือผู้กรอกสืบค้นเจอราคากลางเล่มอื่นปะปน
        *   ใน `ItemSearch.tsx` เพิ่มระบบ Fallback (SRE Defense) เพื่อดึงไอดีเวอร์ชันเริ่มต้น (Default Active Version) อัตโนมัติในกรณีที่หน้าบ้านไม่ได้ระบุ Prop เพื่อความยืดหยุ่น 100%
    4.  **Create / Copy Page Update**:
        *   แก้ไข `app/boq/create/page.tsx` ให้ค้นหารุ่นราคามาตรฐานฉบับหลักที่เป็น `is_default = true` และ `status = 'active'` ผ่าน Supabase แล้วระบุส่งฟิลด์ `price_list_version_id` ในตอน Insert ใบงานใหม่
        *   แก้ไขฟังก์ชันโคลนใบงานประมาณราคาใน `app/boq/page.tsx` (`handleDuplicate`):
            *   บรรทัดที่ 121 (Insert BOQ ใหม่): ให้ดึงคัดลอกคอลัมน์ `price_list_version_id` จากใบงานเก่าไปด้วย
            *   บรรทัดที่ 193 (Insert BOQ Items ใหม่): ให้คัดลอกคอลัมน์ Snapshot `category` ไปสู่รายการโคลนใหม่ทั้งหมด ห้ามปล่อยเป็น Null เด็ดขาด
    5.  **Edit / Print Page Update (ยกเลิก JOIN ไดนามิก)**:
        *   แก้ไข `app/boq/[id]/edit/page.tsx` ให้ส่งค่า `category: item.category` ไปพร้อมกับชุดรายการเพื่อส่งต่อให้ RPC `save_boq_with_routes` บันทึกในคราวเดียว
        *   ลบคำสั่ง JOIN `price_list(category)` ออกจากโค้ดโหลดข้อมูลในหน้าบรรณาธิการ `components/boq/MultiRouteEditor.tsx` โดยดึงค่าตรงๆ จากคอลัมน์ `category` ของตาราง `boq_items` ที่ทำ Snapshot ไว้แล้ว
        *   แก้ไขหน้าพิมพ์และหน้าพรีวิว `app/boq/[id]/print/page.tsx` ทั้งจุดโหลดข้อมูลเส้นทางและชุดประวัติศาสตร์ ให้ยกเลิกการ JOIN ตารางราคากลางมาตรฐาน `.select('*, price_list(category)')` และหันมาคิวรีเฉพาะจากตาราง `boq_items` ตรงๆ เพื่อความถูกต้อง 100% ทางประวัติศาสตร์บัญชี และการรักษาความปลอดภัยของ RLS
    6.  **Dashboard & Standard Filtering Update**:
        *   ปรับปรุงหน้ารายการราคากลางหลัก `/price-list` และสถิติ Dashboard (`useDashboardData.ts`) ให้ทำคิวรีหารุ่นค่าเริ่มต้นของระบบ (Default Active Version) ก่อนทุกครั้ง จากนั้นจึงกำหนดเงื่อนไขตัวกรอง `.eq('version_id', defaultVersionId)` เพื่อไม่ให้นับราคากลางข้ามหลาย SemVer
*   **ไฟล์ที่เกี่ยวข้อง**:
    *   [MODIFY] [lib/supabase.ts](file:///Users/cloud/Cloudstellar/conduit-boq/lib/supabase.ts)
    *   [MODIFY] [app/boq/create/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/boq/create/page.tsx)
    *   [MODIFY] [app/boq/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/boq/page.tsx)
    *   [MODIFY] [app/boq/[id]/edit/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/boq/%5Bid%5D/edit/page.tsx)
    *   [MODIFY] [components/boq/MultiRouteEditor.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/components/boq/MultiRouteEditor.tsx)
    *   [MODIFY] [components/boq/LineItemsTable.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/components/boq/LineItemsTable.tsx)
    *   [MODIFY] [components/boq/ItemSearch.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/components/boq/ItemSearch.tsx)
    *   [MODIFY] [app/boq/[id]/print/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/boq/%5Bid%5D/print/page.tsx)
    *   [MODIFY] [app/price-list/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/price-list/page.tsx)
    *   [MODIFY] [lib/hooks/useDashboardData.ts](file:///Users/cloud/Cloudstellar/conduit-boq/lib/hooks/useDashboardData.ts)

---

### เฟส 3: การรัดกุมความแข็งแรงระดับตารางฐานข้อมูล (Database Hardening - Phase 1B)
*   **วัตถุประสงค์**: ล๊อคความปลอดภัยและความถูกต้องของข้อมูลหลังเดปลอยโปรแกรมเรียบร้อยแล้ว
*   **งานปฏิบัติ**:
    1.  **Re-verification ก่อน Hardening (ตรวจซ้ำข้อมูลที่เกิดระหว่าง Phase 1A → Phase 2)**:
        *   รันซ้ำ preflight queries 3 ตัวก่อน SET NOT NULL:
            ```sql
            -- 1. ตรวจ boq.price_list_version_id IS NULL (ถ้า > 0 → SET NOT NULL จะ FAIL)
            SELECT count(*) AS unlinked_boqs
            FROM boq WHERE price_list_version_id IS NULL;
            
            -- 2. ตรวจ cross-version mismatch (ข้อมูลใหม่ที่เกิดระหว่าง deploy)
            SELECT count(*) AS mismatched_items
            FROM boq_items bi
            JOIN price_list pl ON bi.price_list_id = pl.id
            JOIN boq b ON bi.boq_id = b.id
            WHERE pl.version_id IS DISTINCT FROM b.price_list_version_id;
            
            -- 3. ตรวจ category null (Phase 1A backfill + Phase 2 save)
            SELECT count(*) AS invalid_null_categories 
            FROM boq_items 
            WHERE price_list_id IS NOT NULL AND category IS NULL;
            ```
        *   ทั้ง 3 queries ต้องคืนค่า 0 ทั้งหมดจึงจะดำเนินการ Hardening ต่อได้
    2.  **ยึดสัญญาข้อมูล (Data Contract Hardening)**:
        *   รันสคริปต์ SQL ของ Phase 1B เพื่อกระทำคำสั่ง `ALTER TABLE boq ALTER COLUMN price_list_version_id SET NOT NULL;`
    3.  **ติดตั้งเกราะล็อกเวอร์ชัน**:
        *   ลงทะเบียนฟังก์ชันทริกเกอร์ `trigger_prevent_boq_version_modification` เพื่อป้องกันไม่ให้ผู้ใช้คนใดเปลี่ยนเล่มราคากลางข้ามเวอร์ชันสำหรับเอกสารที่ทำการสร้างและยืนยันไปแล้ว ช่วยรักษาเสถียรภาพทางบัญชีและหลีกเลี่ยงผลกระทบต่อรายงานทางการเงินย้อนหลัง

---

### เฟส 4: การจัดทำเครื่องมือสำหรับฝ่ายธุรการและแอดมิน (Admin Catalog GUI & Excel Parser)
*   **วัตถุประสงค์**: สร้างหน้าจอการนำเข้า Excel ตรวจสอบ เปรียบเทียบราคาสองรุ่น และจัดการเลขรุ่นเวอร์ชันอย่างสมบูรณ์แบบ
*   **งานปฏิบัติ**:
    1.  **Excel Parser (Deterministic Index-based)**:
        *   สร้างระบบตรวจสอบไฟล์นำเข้า Excel หน้าร้านของ NT โดยใช้กลไกวิเคราะห์ข้อมูลระบุคอลัมน์จากตำแหน่งดัชนีอาร์เรย์ (`header: 1`) เพื่อหลีกเลี่ยงความไม่คงเส้นคงวาและชื่อหัวข้อใน Excel ที่ไม่สม่ำเสมอ
    2.  **Version Bump & Cloner Integration**:
        *   พัฒนาปุ่มอัปเกรดรุ่น SemVer โดยเมื่อผู้ใช้กดขยับรุ่น หน้าหลังบ้านจะเรียกใช้ Database Function `clone_price_list_version` (ติดตั้งพร้อม Phase 4 migration)
    3.  **State Swap integration** (ติดตั้งพร้อม Phase 4 migration):
        *   พัฒนาปุ่มสลับเวอร์ชันเริ่มต้น ผ่าน Database Function `make_version_default` (ติดตั้งพร้อม Phase 4 migration)
    4.  **Audit Logs Tracker & Trigger** (เลื่อนมาจาก Phase 1A ตามข้อตกลง):
         *   ติดตั้ง audit trigger บนตาราง `price_list` ให้ auto-INSERT เข้า `price_list_audit_logs` เมื่อมีการ UPDATE/DELETE — ทำพร้อมหน้า admin GUI เพื่อลดความเสี่ยง migration
         *   นำตารางประวัติ `price_list_audit_logs` มาจัดแสดงผลในระบบตรวจสอบของผู้ดูแลระบบ
    5.  **Admin Writes Strategy**:
        *   Phase 4 migration จะ GRANT INSERT/UPDATE/DELETE ให้ `authenticated` พร้อมกับติดตั้ง clone/swap functions
        *   การนำเข้า/แก้ไขราคากลาง ดำเนินการผ่าน Next.js Server Actions โดยใช้สิทธิ์ authenticated session
        *   RLS policy "Allow write to admin only" ทำหน้าที่กรองไม่ให้ non-admin เขียนได้
*   **ไฟล์ที่เกี่ยวข้อง**:
    *   [NEW] [app/admin/price-list/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/admin/price-list/page.tsx)
    *   [NEW] [app/actions/price-list.ts](file:///Users/cloud/Cloudstellar/conduit-boq/app/actions/price-list.ts)
