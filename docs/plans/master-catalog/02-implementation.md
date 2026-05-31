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
    4.  **ตรวจสอบการมีอยู่และขนาดยอดข้อมูลของดัชนี (Foreign Key Indexing Audit)**:
        *   ประเมินดัชนีปลายทางเพื่อตัดสินใจความจำเป็นในการรัน `CREATE INDEX CONCURRENTLY` ในลำดับถัดไปบนตารางใหญ่ ได้แก่:
            - `boq(price_list_version_id)`
            - `boq_items(price_list_id)`
            - `boq_items(boq_id)` (สำคัญมากเพราะ RPC ทำงานหลักคือลบด้วย `boq_id`)
            - `price_list_audit_logs(version_id)` (สำหรับ Phase 4)
    5.  **ตรวจสอบสิทธิ์การใช้งาน RPC ฟังก์ชันดั้งเดิม (RPC Privilege Audit)**:
        *   ตรวจสอบสิทธิ์ execute ของฟังก์ชัน `save_boq_with_routes` เพื่อค้นหาช่องโหว่ default PUBLIC execute
    6.  **สำรองข้อมูลก่อน Migration (Backup)**:
        *   ตรวจ latest restore point ผ่าน Supabase Dashboard > Database > Backups (PITR)
        *   รันคำสั่ง Supabase CLI เพื่อสำรองทั้งโครงสร้างตาราง (Schema) และข้อมูลดิบจริงเก็บไว้ในโลคอล (Logical Backup):
            ```bash
            supabase db dump --linked -f backup_schema.sql
            supabase db dump --linked --data-only --use-copy -f backup_data.sql
            ```
        *   รัน [001_backup_before_migration.sql](file:///Users/cloud/Cloudstellar/conduit-boq/migrations/001_backup_before_migration.sql) ถ้ามี
        *   Export ผล preflight queries ทั้งหมดเป็น baseline report (เก็บไฟล์ไว้เทียบกับหลัง migration)
    7.  **Rollback Decision Tree**:
        *   ถ้า Phase 1A DDL พัง (เช่น duplicate item_code) → **forward-fix**: แก้ข้อมูลแล้วรันใหม่
        *   ถ้า Phase 1A backfill พัง (ข้อมูลเสียหาย) → **restore** จาก snapshot
        *   ถ้า Phase 2 code deploy พัง → **revert git** + DB ยังใช้ได้ (เพราะ columns เป็น nullable)
*   **คำสั่งตรวจสอบ SQL**:
    ```sql
    -- 1. ตรวจสอบจำนวนแถว BOQ และไอเทมปัจจุบัน
    SELECT count(*) AS total_boqs FROM boq;
    SELECT count(*) AS total_boq_items FROM boq_items;
    
    -- 2. ค้นหาจำนวนรายการ Custom Item หรือรายการที่ไม่ได้โยงราคากลาง (เพื่อเก็บ baseline metric - ปกติสำหรับรายการ Custom)
    SELECT count(*) AS custom_items 
    FROM public.boq_items 
    WHERE price_list_id IS NULL;
    
    -- 3. ค้นหา boq_items.price_list_id ที่ชี้ไป price_list.id ที่ไม่มีจริง (Dangling FK)
    SELECT count(*) AS dangling_fk_items
    FROM public.boq_items bi
    LEFT JOIN public.price_list pl ON bi.price_list_id = pl.id
    WHERE bi.price_list_id IS NOT NULL AND pl.id IS NULL;
    
    -- 4. [CRITICAL] ตรวจหา duplicate item_code ก่อนเพิ่ม UNIQUE constraint
    SELECT item_code, count(*) AS dup_count
    FROM public.price_list
    GROUP BY item_code
    HAVING count(*) > 1;
    
    -- 5. ตรวจสอบ RLS ที่มีอยู่ (รวม boq_routes) พร้อมเงื่อนไข WITH CHECK
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('price_list', 'boq', 'boq_items', 'boq_routes');
    
    -- 6. ตรวจชื่อ unique constraint/index จริงบน price_list.item_code
    -- ถ้าชื่อไม่ใช่ 'price_list_item_code_key' → ต้องแก้ proposal DROP CONSTRAINT
    SELECT conname, contype
    FROM pg_constraint
    WHERE conrelid = 'public.price_list'::regclass AND contype = 'u';
    
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'price_list' AND indexdef LIKE '%item_code%';

    -- 7. [NEW] ตรวจสอบสิทธิ์ฟังก์ชัน RPC เดิมในระบบจริง (ตรวจช่องโหว่ default PUBLIC EXECUTE)
    -- Gate Criteria:
    --   - public_exec = false
    --   - anon_exec = false
    --   - authenticated_exec = true (หรือตามความเหมาะสม)
    -- ⚠️ หากพบว่า public_exec = true หรือ anon_exec = true ให้หยุดรันเฟสถัดไป และสั่งถอนสิทธิ์ความปลอดภัยทันทีเพื่อปิดช่องโหว่ก่อน:
    --    REVOKE EXECUTE ON FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb) FROM PUBLIC, anon;
    --    GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb) TO authenticated;
    SELECT
      has_function_privilege('PUBLIC', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE') AS public_exec,
      has_function_privilege('anon', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE') AS anon_exec,
      has_function_privilege('authenticated', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE') AS authenticated_exec;

    -- 8. [NEW] ตรวจสอบการมีอยู่ของ FK Indexes ดั้งเดิมในระบบ
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename IN ('boq', 'boq_items', 'price_list_audit_logs')
      AND indexdef LIKE ANY(ARRAY['%price_list_version_id%', '%price_list_id%', '%boq_id%', '%version_id%']);
    
    -- 9. ตรวจว่า price_list_versions มีหรือยัง และ assert 2568.0.0 (รันเป็น block เดียว paste-run ได้ทันที)
    DO $$
    DECLARE
      v_table regclass;
      v_row_exists BOOLEAN;
      v_other_default_exists BOOLEAN;
    BEGIN
      v_table := to_regclass('public.price_list_versions');
      IF v_table IS NULL THEN
        RAISE NOTICE 'price_list_versions ยังไม่มี (ปกติสำหรับครั้งแรก)';
        RETURN;
      END IF;

      -- [NEW ASSERTION] ตรวจว่ามีเวอร์ชันอื่นที่เป็น active default อยู่แล้วหรือไม่ (กันชน idx_only_one_default_active_version)
      SELECT EXISTS(
        SELECT 1 FROM public.price_list_versions
        WHERE is_default = true AND status = 'active'
          AND NOT (major = 2568 AND minor = 0 AND patch = 0)
      ) INTO v_other_default_exists;

      IF v_other_default_exists THEN
        RAISE EXCEPTION 'พบเวอร์ชันอื่นที่เป็น active default อยู่แล้วในระบบ การสร้าง 2568.0.0 เป็น active default จะชน unique index — ต้องตรวจสอบ active default ทั้งหมดก่อนดำเนินการ';
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
    > ⚠️ **หมายเหตุเชิงปฏิบัติสำหรับดัชนี (Post-Verification Indexing Audit)**: เนื่องจากคอลัมน์ `boq(price_list_version_id)` และ `price_list_audit_logs(version_id)` เพิ่งถูกสร้างขึ้นใหม่ ให้ทำการตรวจเช็คการมีอยู่จริงของดัชนีปลายทางทั้ง 4 ตัวที่ระบุใน Phase 0 อีกครั้งหลังรัน DDL เสร็จสิ้น เพื่อยืนยันความพร้อมใช้งาน
    > 
    > ⚠️ **คำสั่งสร้างดัชนีภายนอกธุรกรรม (CREATE INDEX CONCURRENTLY Runbook)**: หากผลการประเมินขนาดข้อมูลใน Phase 0 พบว่าตารางมีขนาดใหญ่มากและต้องสร้างดัชนี ให้รันคำสั่งเหล่านี้ภายนอก Transaction block ทีละคำสั่งบนเครื่องมือ CLI (Supabase CLI) หรือ SQL Editor:
    > ```sql
    > CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_price_list_version_id ON public.boq(price_list_version_id);
    > CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_price_list_id ON public.boq_items(price_list_id);
    > CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_boq_id ON public.boq_items(boq_id);
    > CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_list_audit_logs_version_id ON public.price_list_audit_logs(version_id);
    > ```
    > ⚠️ **คำเตือน SRE**: คำสั่ง `CREATE INDEX CONCURRENTLY` อาจทำงานล้มเหลวเงียบ (เช่น จาก lock timeout) และสร้าง invalid index ทิ้งไว้ในระบบ ซึ่ง `IF NOT EXISTS` จะมองข้ามแต่คิวรี่แพลนเนอร์จะไม่หยิบไปใช้งาน ให้รันคิวรี่ตรวจหาและยืนยันสถานะความสมบูรณ์ (`indisvalid = true`) เสมอหลังรันเสร็จสิ้น:
    > ```sql
    > SELECT indexrelid::regclass AS index_name, indisvalid
    > FROM pg_index
    > WHERE indexrelid::regclass::text IN ('idx_boq_price_list_version_id', 'idx_boq_items_price_list_id', 'idx_boq_items_boq_id', 'idx_price_list_audit_logs_version_id');
    > ```
    > (⚠️ **Expected Result**: ผลลัพธ์ต้องปรากฏ **ครบถ้วนทั้ง 4 rows** และทุก row ต้องมีค่า `indisvalid = true` หากมีจำนวนแถวน้อยกว่า 4 แสดงว่ามีบาง index ที่หายไป/ไม่ถูกสร้างขึ้นมา ให้ทำการตรวจสอบและ rebuild index ตัวที่ขาด)
    ```sql
    -- 10. [CRITICAL] ตรวจ boq.price_list_version_id IS NULL หลัง backfill
    -- ถ้าผลลัพธ์ > 0 แสดงว่า Phase 1B (SET NOT NULL) จะ FAIL!
    SELECT count(*) AS unlinked_boqs
    FROM public.boq
    WHERE price_list_version_id IS NULL;
    
    -- 11. [NEW] ตรวจ cross-version mismatch ระหว่าง boq_items กับ boq
    SELECT count(*) AS mismatched_items
    FROM public.boq_items bi
    JOIN public.price_list pl ON bi.price_list_id = pl.id
    JOIN public.boq b ON bi.boq_id = b.id
    WHERE pl.version_id IS DISTINCT FROM b.price_list_version_id;

    -- 12. ตรวจ write privileges ของ authenticated (หลัง REVOKE ต้องไม่มี INSERT/UPDATE/DELETE)
    -- ใช้ information_schema.table_privileges เพื่อตรวจจับสิทธิ์ที่สืบทอดมาจาก pseudo-role 'PUBLIC' ได้อย่างครบถ้วน
    SELECT grantee, table_schema, table_name, privilege_type
    FROM information_schema.table_privileges
    WHERE table_schema = 'public'
      AND table_name IN ('price_list_versions', 'price_list', 'price_list_audit_logs')
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
        *   ปลดบล็อกข้อจำกัดความไม่ซ้ำซ้อนเดิม (Drop global unique key `price_list_item_code_key`) และแทนที่ด้วยความปลอดภัยแบบจัดกลุ่ม `UNIQUE (version_id, item_code)` — ครอบทั้ง DROP/ADD ใน transaction block (ถ้ารันผ่าน Supabase SQL Editor ให้ใช้ transaction wrapper (`BEGIN;...COMMIT;`) ตามสคริปต์ในเอกสารได้เลย ส่วนกรณีใช้ Supabase CLI / migration runner ต้องนำสคริปต์ไปแยกไฟล์และทดสอบกับ Local environment ก่อนใช้งานจริง เพื่อหลีกเลี่ยงพฤติกรรมการครอบ transaction ซ้อนที่อาจเกิดขึ้นใน runner)
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
    1.  **การทำ Delta Category Backfill (SRE Gate)**:
        *   เนื่องจากมีช่วงเวลาต่างกัน (Time lag) ระหว่างการรันฐานข้อมูล Phase 1A กับการเดปลอยโค้ด Phase 2 ผู้ใช้อาจสั่ง Duplicate BOQ ผ่านระบบเดิมทำให้เกิดไอเทมที่มี `category` เป็น `NULL` ค้างได้
        *   ก่อนเริ่มการดีพลอยโค้ดหน้าบ้านและถอด Dynamic JOIN ให้ทำการรันคิวรี backfill ซ้ำอีกครั้ง:
            ```sql
            UPDATE public.boq_items bi
            SET category = pl.category
            FROM public.price_list pl
            WHERE bi.price_list_id = pl.id AND bi.price_list_id IS NOT NULL AND bi.category IS NULL;
            ```
        *   แล้วทำการ Assert ยอดสะสมเป็น baseline metric ว่าต้องได้ยอดเป็น 0:
            ```sql
            SELECT count(*) AS invalid_null_categories
            FROM public.boq_items
            WHERE price_list_id IS NOT NULL AND category IS NULL;
            ```
            (คิวรีต้องได้ผลลัพธ์เป็น 0 ก่อนจะถอดโค้ด Dynamic JOIN ออกเพื่อไม่ให้หมวดหมู่ประวัติศาสตร์สูญหายบนหน้าจอ)
    2.  **TypeScript Type Update (ต้องทำก่อนแก้ component)**:
        *   เพิ่มฟิลด์ใหม่ใน [lib/supabase.ts](file:///Users/cloud/Cloudstellar/conduit-boq/lib/supabase.ts):
            *   `PriceListItem` → เพิ่ม `version_id: string`
            *   `BOQ` → เพิ่ม `price_list_version_id: string | null` (จะเป็น Nullable จนกว่าจะจบ Phase 3 เพื่อหลีกเลี่ยง Type Mismatch กับ Legacy BOQ)
            *   `BOQItem` → เพิ่ม `category: string | null`
        *   สร้าง type ใหม่ `PriceListVersion` (id, major, minor, patch, version_string, name, status, is_default, created_at, updated_at)
    3.  **RPC Update**: โค้ดฐานข้อมูลใน Phase 1A ได้เพิ่มฟิลด์ `category` และกลไกดึงข้อมูลอัตโนมัติ (Fallback) ไว้เรียบร้อยแล้ว ฝั่งหน้าบ้านจะทำการส่งออบเจกต์ที่มี `category: item.category` ไปด้วยใน JSON ของ `save_boq_with_routes` เพื่อเก็บบันทึกตรงลงฟิลด์ `category` ของตาราง `boq_items`
    4.  **Prop-based Version Filtering (ปิดจุดรั่วไหลของรุ่น)**:
        *   ปรับปรุง `app/boq/[id]/edit/page.tsx` และ `components/boq/MultiRouteEditor.tsx` ให้โหลดค่า `price_list_version_id` ของใบงาน BOQ ปัจจุบันขึ้นมาจากฐานข้อมูล และนำมากำหนดสถานะตัวแปร `priceListVersionId`
        *   ส่งต่อตัวแปร `priceListVersionId` เป็น Prop ผ่านคอมโพเนนต์: `MultiRouteEditor` -> `LineItemsTable` -> `ItemSearch`
        *   แก้ไขคอมโพเนนต์ `components/boq/ItemSearch.tsx` ให้รับ Prop `priceListVersionId` และแก้ไขคิวรีค้นหาตาราง `price_list` ทั้งสองจุด (การโหลดหมวดหมู่บรรทัดที่ 76-79 และคิวรีค้นหารายการบรรทัดที่ 107-110) ให้พ่วงเงื่อนไข `.eq('version_id', priceListVersionId)` เสมอ ป้องกันไม่ให้แอดมินหรือผู้กรอกสืบค้นเจอราคากลางเล่มอื่นปะปน
        *   ใน `ItemSearch.tsx` ปรับปรุงให้เป็น **Fail-Closed เสมอ (100% Fail-Closed)**: เนื่องจากฟลอว์การสร้าง BOQ ของแอปจะทำการบันทึกข้อมูลและ Redirect ไปยังหน้า Edit เสมอ ดังนั้นคอมโพเนนต์ค้นหารายการ (`ItemSearch`) จะรับ Prop `priceListVersionId` มาโดยตรงจากหน้า Edit เสมอ หาก Prop นี้หายไป ให้ระบบทำการ Fail-Closed (แสดงข้อผิดพลาดและบล็อกการค้นหาราคา) เพื่อตัดความซับซ้อนในการทำ React component fallback ออก และมอบหน้าที่จัดการ default version ให้เป็นของ Database Trigger ตอน INSERT และ Backend แทน
    5.  **Create / Copy Page Update**:
        *   แก้ไข `app/boq/create/page.tsx` ให้ค้นหารุ่นราคามาตรฐานฉบับหลักที่เป็น `is_default = true` และ `status = 'active'` ผ่าน Supabase แล้วระบุส่งฟิลด์ `price_list_version_id` ในตอน Insert ใบงานใหม่
        *   แก้ไขฟังก์ชันโคลนใบงานประมาณราคาใน `app/boq/page.tsx` (`handleDuplicate`):
            *   บรรทัดที่ 121 (Insert BOQ ใหม่): ให้ดึงคัดลอกคอลัมน์ `price_list_version_id` จากใบงานเก่าไปด้วย
            *   บรรทัดที่ 193 (Insert BOQ Items ใหม่): ให้คัดลอกคอลัมน์ Snapshot `category` ไปสู่รายการโคลนใหม่ทั้งหมด ห้ามปล่อยเป็น Null เด็ดขาด
    6.  **Edit / Print Page Update (ยกเลิก JOIN ไดนามิก)**:
        *   แก้ไข `app/boq/[id]/edit/page.tsx` ให้ส่งค่า `category: item.category` ไปพร้อมกับชุดรายการเพื่อส่งต่อให้ RPC `save_boq_with_routes` บันทึกในคราวเดียว
        *   ลบคำสั่ง JOIN `price_list(category)` ออกจากโค้ดโหลดข้อมูลในหน้าบรรณาธิการ `components/boq/MultiRouteEditor.tsx` โดยดึงค่าตรงๆ จากคอลัมน์ `category` ของตาราง `boq_items` ที่ทำ Snapshot ไว้แล้ว
        *   แก้ไขหน้าพิมพ์และหน้าพรีวิว `app/boq/[id]/print/page.tsx` ทั้งจุดโหลดข้อมูลเส้นทางและชุดประวัติศาสตร์ ให้ยกเลิกการ JOIN ตารางราคากลางมาตรฐาน `.select('*, price_list(category)')` และหันมาคิวรีเฉพาะจากตาราง `boq_items` ตรงๆ เพื่อความถูกต้อง 100% ทางประวัติศาสตร์บัญชี และการรักษาความปลอดภัยของ RLS
    7.  **Dashboard & Standard Filtering Update**:
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
    4.  **Audit Logs Tracker & Trigger & DB Validation** (เลื่อนมาจาก Phase 1A ตามข้อตกลง):
         *   ติดตั้ง audit trigger บนตาราง `price_list` ให้ auto-INSERT เข้า `price_list_audit_logs` เมื่อมีการ UPDATE/DELETE — ทำพร้อมหน้า admin GUI เพื่อลดความเสี่ยง migration
         *   ติดตั้ง cross-version isolation trigger บนตาราง `boq_items` เพื่อยืนยันว่า `price_list_id` ของแต่ละรายการชี้ไปยังเวอร์ชันที่ตรงกับ `price_list_version_id` ของใบงาน BOQ แม่เสมอ (ป้องกัน direct SQL write หรือ client bypass)
         *   นำตารางประวัติ `price_list_audit_logs` มาจัดแสดงผลในระบบตรวจสอบของผู้ดูแลระบบ
    5.  **Admin Writes Strategy**:
        *   Phase 4 migration จะ GRANT INSERT/UPDATE/DELETE ให้ `authenticated` พร้อมกับติดตั้ง clone/swap functions
        *   การนำเข้า/แก้ไขราคากลาง ดำเนินการผ่าน Next.js Server Actions โดยใช้สิทธิ์ authenticated session
        *   RLS policy "Allow write to admin only" ทำหน้าที่กรองไม่ให้ non-admin เขียนได้
*   **ไฟล์ที่เกี่ยวข้อง**:
    *   [NEW] [app/admin/price-list/page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/admin/price-list/page.tsx)
    *   [NEW] [app/actions/price-list.ts](file:///Users/cloud/Cloudstellar/conduit-boq/app/actions/price-list.ts)
