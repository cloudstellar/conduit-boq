# ข้อกำหนดทางเทคนิคและการจัดทำระบบจัดการแคตตาล็อกหลัก (Master Catalog Technical Spec & Blueprint - Revised v6 — Final)

เอกสารฉบับนี้คือ **Technical Specification (ข้อกำหนดคุณสมบัติทางเทคนิคฉบับผ่านการตรวจสอบระดับความปลอดภัยสูงสุด)** และพิมพ์เขียวในการดำเนินการจริงสำหรับระบบจัดการ **Master Catalog (บัญชีราคามาตรฐาน)** ของโครงการ Conduit BOQ โดยแก้ไขและปิดจุดบกพร่องเชิงโครงสร้างและความปลอดภัยฐานข้อมูล 4 ประเด็นสำคัญตามคำแนะนำอย่างละเอียดถี่ถ้วน เพื่อให้มั่นใจในเสถียรภาพและความปลอดภัยระดับสูงสุดบนระบบโปรดักชัน (Production-Grade Security & High Availability via Lock Timeouts and Atomic Rollbacks)

---

## 🛡️ 1. ปิดจุดเสี่ยงและปรับสถาปัตยกรรมความปลอดภัยขั้นสูง (Advanced Security Adjustments)

เราได้วิเคราะห์และยกระดับพิมพ์เขียวความปลอดภัยของฐานข้อมูลในทุกมิติ ดังนี้:

### 1.1 การแก้ปัญหาการชนกันระหว่างฟังก์ชันสลับและทริกเกอร์ตารางเวอร์ชัน (State Swap Resolved)
*   **ปัญหา**: เดิมทีตัวทริกเกอร์ `check_default_version_exists` ตรวจสอบแบบทีละแถว (`FOR EACH ROW`) ซึ่งจะขวางไม่ให้ปลดสถานะ `is_default` ของแถวเดิมระหว่างฟังก์ชัน `make_version_default` ทำงาน ส่งผลให้กระบวนการสลับค่าเริ่มต้นพังลง
*   **แนวทางการแก้ไข**: ปรับทริกเกอร์ให้เป็นแบบ **`AFTER UPDATE OR DELETE ... FOR EACH STATEMENT` (การตรวจสอบหลังจบคิวรี)** ซึ่งช่วยให้ฟังก์ชันสามารถทำการสลับค่าเริ่มต้นระหว่างแถวในประโยคคำสั่งเดียวได้อย่างราบรื่น และทำการรับประกันความถูกต้องในตอนท้ายสุดว่ามีเล่ม Active Default คงเหลืออยู่อย่างน้อยหนึ่งเล่มเสมอ

### 1.2 ยกระดับสิทธิ์และการเข้าถึงฟังก์ชัน `SECURITY DEFINER` (RPC Security Hardening)
*   **ปัญหา**: ฟังก์ชันระดับฐานข้อมูลที่มีคำสั่ง `SECURITY DEFINER` จะทำงานด้วยสิทธิ์แอดมินสูงสุด หากไม่คัดกรองตัวผู้เรียกใช้อาจเปิดช่องโหว่ให้ผู้ใช้ทั่วไปหรือบุคคลภายนอกที่ไม่ได้รับอนุญาตสามารถดึงข้อมูล สลับเวอร์ชัน หรือทำลายเอกสารได้
*   **แนวทางการแก้ไข**:
    1.  ฝังการตรวจสอบสิทธิ์ความปลอดภัยในฟังก์ชัน: 
        *   `clone_price_list_version` และ `make_version_default` จะขวางทันทีหากผู้เรียกใช้ไม่ใช่บทบาท `'admin'` ในระบบจริง
        *   `save_boq_with_routes` จะตรวจสอบสิทธิ์ผู้เซฟให้ตรงกับ `SECURITY.md` + `permissions.ts` ทุกบทบาท: `pending` (เฉพาะ BOQ ที่ตัวเอง `created_by`), `admin` (ทุกใบงาน), `staff` (เฉพาะ `created_by` / `assigned_to`), `sector_manager` (เซกเตอร์เดียวกัน), `dept_manager` (ดีพาร์ตเมนต์เดียวกัน) — Legacy BOQ (`created_by IS NULL`) แก้ได้เฉพาะ admin, บทบาทอื่น (`procurement`, ไม่มี role) จะถูกปฏิเสธโดยอัตโนมัติ
    2.  ใช้คำสั่งถอนและมอบสิทธิ์อย่างจำเพาะเจาะจง:
        ```sql
        REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION ... TO authenticated;
        ```

### 1.3 การรับประกันความเข้ากันได้ของไอเทมและใบงานประมาณราคา (Cross-Version Isolation)
*   **ปัญหา**: ป้องกันกรณีโปรแกรมฝั่งหน้าบ้านเกิดข้อผิดพลาดในการโหลดแคช หรือระบบถูกแทรกแซงโดยเจตนาส่งราคาไอเทมจากเล่มเวอร์ชันเก่าและใหม่ปนกันเข้ามาในใบงานเดียว
*   **แนวทางการแก้ไข**: เพิ่มคำสั่งตรวจสอบภายในฟังก์ชัน `save_boq_with_routes` เพื่อไล่เช็คทุก `price_list_id` ที่ฝั่งหน้าบ้านส่งเข้ามา หากพบว่ามีรายการราคาใดชี้ไปยังไอดีที่มี `version_id` ไม่ตรงกับ `price_list_version_id` ของตัวใบงานหลัก ระบบจะทำแท้ง (Abort) ธุรกรรมและปฏิเสธการเซฟทันที

### 1.4 ควบคุมความสมบูรณ์ในการคัดลอกราคากลางข้ามรุ่น (Clone Safety Protection)
*   **ปัญหา**: ป้องกันความเสียหายกรณีผู้ดูแลระบบเผลอกดเบิ้ล (Double-Click) บนหน้าเมนู หรือสั่งคัดลอกราคากลางเข้าสู่ตารางเวอร์ชันเป้าหมายที่มีรายการอยู่แล้ว ซึ่งจะส่งผลเสียต่อการชนของข้อมูลแบบ Unique
*   **แนวทางการแก้ไข**: ในตัวฟังก์ชัน `clone_price_list_version` ได้ฝังระบบตรวจสอบเงื่อนไขดังนี้:
    *   เวอร์ชันปลายทางต้องมีสถานะเป็น `'draft'` เท่านั้น (ห้ามโคลนทับเวอร์ชันที่ใช้งานจริงแล้ว)
    *   เวอร์ชันปลายทางต้องเป็นตารางเปล่าที่ไม่มีข้อมูลราคากลางอยู่ก่อน (ห้ามเขียนซ้ำซ้อน)
    *   ฝังเงื่อนไข `ON CONFLICT (version_id, item_code) DO NOTHING` และคืนค่าตัวเลขจำนวนแถวที่คัดลอกได้จริงกลับไปยังระบบเพื่อตรวจสอบความสมบูรณ์

---

## 💾 2. พิมพ์เขียว SQL สำหรับรันใน Supabase (Production-Safe DDL Spec - Revised)

ด้านล่างนี้คือสคริปต์ DDL ที่ได้รับการรับรองความปลอดภัย ออกแบบให้ rerunnable ภายใต้ preflight assertions (ต้องรัน Phase 0 ตรวจสอบก่อนเสมอ):

```sql
-- ============================================================================
-- [PHASE 1A] สร้างโครงสร้างยืดหยุ่นรองรับการเปลี่ยนผ่าน (Nullable Versioning)
-- ============================================================================

-- 1. สร้างตารางราคามาตรฐานเล่มใหญ่และรุ่นย่อย (Price List Versions)
-- [FIX: Security Exposure Gap] ครอบด้วย transaction block เพื่อให้การสร้างตารางและ ENABLE RLS เกิดขึ้นพร้อมกันทันที ป้องกัน gap ก่อนรัน RLS
BEGIN;
  CREATE TABLE IF NOT EXISTS public.price_list_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      major INTEGER NOT NULL CHECK (major >= 0),
      minor INTEGER NOT NULL DEFAULT 0 CHECK (minor >= 0),
      patch INTEGER NOT NULL DEFAULT 0 CHECK (patch >= 0),
      version_string TEXT GENERATED ALWAYS AS (major::text || '.' || minor::text || '.' || patch::text) STORED,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT check_is_default_active CHECK (NOT is_default OR status = 'active'),
      CONSTRAINT uq_major_minor_patch UNIQUE (major, minor, patch)
  );

  -- [BEST PRACTICE] เปิด RLS ทันทีหลังสร้างตาราง ไม่ทิ้ง gap
  ALTER TABLE public.price_list_versions ENABLE ROW LEVEL SECURITY;

  -- ดัชนีรับประกันความมีหนึ่งเดียวของค่าเริ่มต้นเวอร์ชันใช้งานจริง
  CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_default_active_version 
  ON public.price_list_versions (is_default) 
  WHERE is_default = true AND status = 'active';
COMMIT;

-- 2. สร้างตารางประวัติการตรวจสอบการแก้ไขราคา (Price Audit Logs)
-- [FIX: Security Exposure Gap] ครอบด้วย transaction block เพื่อให้การสร้างตารางและ ENABLE RLS เกิดขึ้นพร้อมกันทันที ป้องกัน gap ก่อนรัน RLS
BEGIN;
  CREATE TABLE IF NOT EXISTS public.price_list_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      version_id UUID REFERENCES public.price_list_versions(id) ON DELETE SET NULL,
      item_code TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('update_price', 'add_item', 'delete_item')),
      old_values JSONB, 
      new_values JSONB, 
      performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- [BEST PRACTICE] เปิด RLS ทันทีหลังสร้างตาราง
  ALTER TABLE public.price_list_audit_logs ENABLE ROW LEVEL SECURITY;
COMMIT;

-- 3. ปรับโครงสร้างตารางเดิมให้รองรับเวอร์ชันแบบผ่อนปรน (ON DELETE RESTRICT เพื่อความปลอดภัยสูงสุด)
-- [FIX: Lock Guardrail] ครอบด้วย transaction block และตั้ง lock_timeout เพื่อความปลอดภัยสูงสุดบนโปรดักชัน
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';
  ALTER TABLE public.price_list ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES public.price_list_versions(id) ON DELETE RESTRICT;
  ALTER TABLE public.boq ADD COLUMN IF NOT EXISTS price_list_version_id UUID REFERENCES public.price_list_versions(id) ON DELETE RESTRICT;
  ALTER TABLE public.boq_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;
COMMIT;
RESET lock_timeout;
RESET statement_timeout;

-- ============================================================================
-- [DATA SEED] ต้อง seed ก่อนติดตั้ง fail-closed trigger
-- ⚠️ ลำดับสำคัญ: ถ้าสลับกัน จะเกิด outage window — BOQ ใหม่สร้างไม่ได้
-- ============================================================================

-- 1. บันทึกรุ่นดั้งเดิม 2568.0.0 สู่ฐานข้อมูล
-- ⚠️ หมายเหตุ: ON CONFLICT DO NOTHING จะไม่ซ่อม row ที่มีอยู่แต่ status/is_default ผิด
-- Phase 0 preflight ต้อง assert ก่อนว่า 2568.0.0 ยังไม่มี หรือมีแบบ status='active', is_default=true
INSERT INTO price_list_versions (major, minor, patch, name, status, is_default)
VALUES (2568, 0, 0, 'บัญชีราคามาตรฐาน ปี 2568 (ประกาศฉบับหลัก)', 'active', true)
ON CONFLICT ON CONSTRAINT uq_major_minor_patch DO NOTHING;

-- ============================================================================
-- [PHASE 1A - TRIGGERS & FUNCTIONS] ฟังก์ชันป้องกันและทริกเกอร์ SRE-First
-- ============================================================================

-- 2. ฟังก์ชันป้องกันการลบหรือยกเลิกเวอร์ชันเริ่มต้น (Default Active Version - Statement Level AFTER Check)
CREATE OR REPLACE FUNCTION check_default_version_exists()
RETURNS TRIGGER AS $$
DECLARE
    default_count INT;
BEGIN
    SELECT COUNT(*) INTO default_count
    FROM public.price_list_versions
    WHERE is_default = true AND status = 'active';
    
    IF default_count = 0 THEN
        RAISE EXCEPTION 'ต้องมีอย่างน้อยหนึ่งเวอร์ชันที่เป็น active และเป็นค่าเริ่มต้น (default) เสมอ เพื่อป้องกันไม่ให้ระบบสร้างใบงานพัง';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_check_default_version_exists ON price_list_versions;
CREATE TRIGGER trigger_check_default_version_exists
AFTER UPDATE OR DELETE ON price_list_versions
FOR EACH STATEMENT
EXECUTE FUNCTION check_default_version_exists();

-- 3. ทริกเกอร์กำหนดค่าเริ่มต้นเวอร์ชันให้อัตโนมัติในระดับ DB กรณีสร้างใบงานใหม่แบบไม่ระบุฟิลด์ราคา
CREATE OR REPLACE FUNCTION set_default_price_list_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price_list_version_id IS NULL THEN
        SELECT id INTO NEW.price_list_version_id
        FROM public.price_list_versions
        WHERE is_default = true AND status = 'active'
        LIMIT 1;
        -- [FAIL-CLOSED] ถ้าไม่พบ active default → RAISE แทนปล่อย NULL ผ่าน
        IF NEW.price_list_version_id IS NULL THEN
            RAISE EXCEPTION 'ไม่พบเวอร์ชันราคากลางเริ่มต้น (active default) ในระบบ กรุณาติดต่อผู้ดูแลระบบ';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_set_default_price_list_version ON boq;
CREATE TRIGGER trigger_set_default_price_list_version
BEFORE INSERT ON boq
FOR EACH ROW
EXECUTE FUNCTION set_default_price_list_version();

-- 4. ฟังก์ชัน Auto-Update Timestamp สำหรับ price_list_versions (Data Hygiene)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON price_list_versions;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON price_list_versions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- [DATA BACKFILLING & MIGRATION] เคลื่อนย้ายข้อมูลอย่างราบรื่น
-- ============================================================================

-- 5. เชื่อมรายการราคากลางประวัติศาสตร์เข้าสู่รุ่น 2568.0.0
UPDATE price_list 
SET version_id = (SELECT id FROM price_list_versions WHERE version_string = '2568.0.0' LIMIT 1)
WHERE version_id IS NULL;

-- 6. การปลดบล็อกการรองรับเวอร์ชันในอนาคต (สำคัญมาก!)
-- [FIX: Transaction Block] ครอบ DROP/ADD constraint ใน transaction เดียวเพื่อป้องกัน concurrent INSERT
-- ⚠️ หมายเหตุ: ถ้ารันผ่าน Supabase migration runner ให้ถอด BEGIN/COMMIT ออก
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';
  ALTER TABLE price_list DROP CONSTRAINT IF EXISTS price_list_item_code_key;
  ALTER TABLE price_list ALTER COLUMN version_id SET NOT NULL;
  ALTER TABLE price_list DROP CONSTRAINT IF EXISTS uq_version_item_code;
  ALTER TABLE price_list ADD CONSTRAINT uq_version_item_code UNIQUE (version_id, item_code);
COMMIT;
RESET lock_timeout;
RESET statement_timeout;

-- 7. เชื่อมโยงใบงานเดิมทั้งหมดในระบบเข้ากับรุ่นราคา 2568.0.0
UPDATE boq 
SET price_list_version_id = (SELECT id FROM price_list_versions WHERE version_string = '2568.0.0' LIMIT 1)
WHERE price_list_version_id IS NULL;

-- 8. Snapshot Backfill: ก๊อปปี้หมวดหมู่ประวัติศาสตร์ลงในระดับตารางใบรายการย่อยทั้งหมดทันที
UPDATE boq_items bi
SET category = pl.category
FROM price_list pl
WHERE bi.price_list_id = pl.id AND bi.price_list_id IS NOT NULL AND bi.category IS NULL;

-- ============================================================================
-- [ATOMIC DATABASE FUNCTIONS] ฟังก์ชันธุรกรรมระดับฐานข้อมูลเพื่อความปลอดภัยและประสิทธิภาพ
-- ============================================================================

-- 1. ฟังก์ชันบันทึก BOQ พร้อมโครงสร้างเส้นทางและ Snapshot ของหมวดหมู่ (แก้ไขเพิ่มระบบคัดกรองความปลอดภัยและการแยกแยะเวอร์ชัน)
CREATE OR REPLACE FUNCTION save_boq_with_routes(
  p_boq_id UUID,
  p_boq_data JSONB,
  p_routes JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_route JSONB;
  v_item JSONB;
  v_inserted_route_id UUID;
  v_route_index INT := 0;
  v_category TEXT;
  v_target_boq_version UUID;
  v_item_version UUID;
  
  -- ตัวแปรตรวจสอบสิทธิ์ความปลอดภัยที่สอดคล้องกับ permissions.ts
  v_caller_role TEXT;
  v_caller_status TEXT;
  v_caller_sector UUID;
  v_caller_dept UUID;
  v_boq_created_by UUID;
  v_boq_assigned_to UUID;
  v_boq_sector UUID;
  v_boq_dept UUID;
  v_is_authorized BOOLEAN := FALSE;
BEGIN
  -- ดึงข้อมูลรุ่นเล่มราคาและโครงสร้างสิทธิ์ของ BOQ เป้าหมายมาเก็บไว้ตรวจสอบ
  SELECT price_list_version_id, created_by, assigned_to, sector_id, department_id 
  INTO v_target_boq_version, v_boq_created_by, v_boq_assigned_to, v_boq_sector, v_boq_dept
  FROM public.boq
  WHERE id = p_boq_id
  FOR UPDATE;  -- [FIX: Row Lock] ป้องกัน race condition กรณี 2 คนกด save พร้อมกัน

  -- [FIX: BOQ Existence Check] แยกกรณี "ไม่พบ BOQ" ออกจาก "BOQ มีแต่ยังไม่ผูก version"
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ไม่พบใบประมาณราคา (BOQ) ที่ระบุในระบบ (boq_id: %)', p_boq_id;
  END IF;

  IF v_target_boq_version IS NULL THEN
    RAISE EXCEPTION 'ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง (boq_id: %)', p_boq_id;
  END IF;

  -- [SECURITY CHECK - POLICY 1] ตรวจสอบสิทธิ์ผู้เซฟอย่างละเอียดตรงตาม permissions.ts + SECURITY.md
  -- รับทั้ง active และ pending (pending มีสิทธิ์จำกัด)
  -- บล็อก inactive/suspended แม้ token ยังใช้ได้
  SELECT role, status, sector_id, department_id 
  INTO v_caller_role, v_caller_status, v_caller_sector, v_caller_dept
  FROM public.user_profiles
  WHERE id = auth.uid() AND status IN ('active', 'pending');

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'ไม่พบบัญชีผู้ใช้ที่ยังเปิดใช้งานอยู่ในระบบ (อาจถูกระงับหรือปิดการใช้งาน)';
  END IF;

  -- [FIX: Legacy Guard] SECURITY.md L38: Legacy BOQ (created_by IS NULL) = Admin-only
  -- ต้องตรวจก่อน role check เพราะ RPC เป็น SECURITY DEFINER (bypass RLS)
  -- RLS 008 มี created_by IS NOT NULL กันไว้ แต่ RPC ต้องกันเองด้วย
  IF v_boq_created_by IS NULL AND v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'ใบงานประวัติศาสตร์ (Legacy BOQ) สามารถแก้ไขได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น';
  END IF;

  -- [FIX: Pending User] SECURITY.md L28: pending = Own-only (created_by เท่านั้น ไม่รวม assigned_to)
  IF v_caller_status = 'pending' THEN
    IF auth.uid() = v_boq_created_by THEN
      v_is_authorized := TRUE;
    END IF;
  ELSIF v_caller_role = 'admin' THEN
    v_is_authorized := TRUE;
  ELSIF v_caller_role = 'staff' THEN
    -- Staff แก้ไขได้เฉพาะใบงานที่ตัวเองสร้างหรือได้รับมอบหมาย
    IF auth.uid() = v_boq_created_by OR auth.uid() = v_boq_assigned_to THEN
      v_is_authorized := TRUE;
    END IF;
  ELSIF v_caller_role = 'sector_manager' THEN
    -- Sector Manager แก้ไขได้ในเซกเตอร์เดียวกัน
    -- [FIX: Legacy BOQ] SECURITY.md L38: Legacy = Admin-only (ลบ OR v_boq_created_by IS NULL)
    IF v_caller_sector IS NOT NULL AND v_caller_sector = v_boq_sector THEN
      v_is_authorized := TRUE;
    END IF;
  ELSIF v_caller_role = 'dept_manager' THEN
    -- Dept Manager แก้ไขได้ในดีพาร์ตเมนต์เดียวกัน
    -- [FIX: Legacy BOQ] SECURITY.md L38: Legacy = Admin-only (ลบ OR v_boq_created_by IS NULL)
    IF v_caller_dept IS NOT NULL AND v_caller_dept = v_boq_dept THEN
      v_is_authorized := TRUE;
    END IF;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'คุณไม่มีสิทธิ์ทางกฎหมายการทำงานในการเข้าถึงและแก้ไขใบประมาณราคานี้';
  END IF;

  -- บันทึกข้อมูลตารางหลัก BOQ
  UPDATE public.boq SET
    estimator_name = p_boq_data->>'estimator_name',
    document_date = (p_boq_data->>'document_date')::DATE,
    project_name = p_boq_data->>'project_name',
    route = p_boq_data->>'route',
    construction_area = p_boq_data->>'construction_area',
    department = p_boq_data->>'department',
    total_material_cost = (p_boq_data->>'total_material_cost')::NUMERIC,
    total_labor_cost = (p_boq_data->>'total_labor_cost')::NUMERIC,
    total_cost = (p_boq_data->>'total_cost')::NUMERIC,
    factor_f = (p_boq_data->>'factor_f')::NUMERIC,
    total_with_factor_f = (p_boq_data->>'total_with_factor_f')::NUMERIC,
    total_with_vat = (p_boq_data->>'total_with_vat')::NUMERIC,
    factor_f_raw = (p_boq_data->>'factor_f_raw')::NUMERIC,
    factor_f_lower_cost = (p_boq_data->>'factor_f_lower_cost')::NUMERIC,
    factor_f_upper_cost = (p_boq_data->>'factor_f_upper_cost')::NUMERIC,
    factor_f_lower_value = (p_boq_data->>'factor_f_lower_value')::NUMERIC,
    factor_f_upper_value = (p_boq_data->>'factor_f_upper_value')::NUMERIC,
    updated_at = NOW()
  WHERE id = p_boq_id;

  -- ลบรายการเก่าของ BOQ นี้ออกเพื่อบันทึกใหม่
  DELETE FROM public.boq_items WHERE boq_id = p_boq_id;
  DELETE FROM public.boq_routes WHERE boq_id = p_boq_id;

  FOR v_route IN SELECT * FROM jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO public.boq_routes (
      boq_id, route_order, route_name, route_description, construction_area,
      total_material_cost, total_labor_cost, total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::NUMERIC,
      (v_route->>'total_labor_cost')::NUMERIC,
      (v_route->>'total_cost')::NUMERIC
    ) RETURNING id INTO v_inserted_route_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_route->'items')
    LOOP
      -- [CROSS-VERSION PROTECTION] ตรวจสอบความถูกต้องของไอเทมราคากลางเทียบกับรุ่นของ BOQ
      IF (v_item->>'price_list_id') IS NOT NULL THEN
        SELECT version_id INTO v_item_version
        FROM public.price_list
        WHERE id = (v_item->>'price_list_id')::UUID;

        IF v_item_version IS DISTINCT FROM v_target_boq_version THEN
          RAISE EXCEPTION 'รายการรหัสไอดี % ไม่ได้อยู่ในเวอร์ชันราคากลางที่ผูกไว้กับใบงานนี้ (ข้อมูลไม่เข้าคู่กัน)', (v_item->>'price_list_id');
        END IF;
      END IF;

      -- ดึงหมวดหมู่ (Category Snapshot)
      IF (v_item->>'price_list_id') IS NOT NULL THEN
        -- Standard item: อ่านจากฐานข้อมูลเสมอ เพื่อความถูกต้องของข้อมูล (ห้ามเชื่อใจค่าจาก client เพื่อป้องกันการ mismatch หรือ client bypass)
        SELECT category INTO v_category FROM public.price_list WHERE id = (v_item->>'price_list_id')::UUID;
      ELSE
        -- Custom item: ใช้หมวดหมู่จาก client
        v_category := v_item->>'category';
      END IF;

      INSERT INTO public.boq_items (
        boq_id, route_id, item_order, price_list_id, item_name, quantity, unit,
        material_cost_per_unit, labor_cost_per_unit, unit_cost,
        total_material_cost, total_labor_cost, total_cost, remarks, category
      ) VALUES (
        p_boq_id,
        v_inserted_route_id,
        (v_item->>'item_order')::INT,
        (v_item->>'price_list_id')::UUID,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        v_item->>'unit',
        (v_item->>'material_cost_per_unit')::NUMERIC,
        (v_item->>'labor_cost_per_unit')::NUMERIC,
        (v_item->>'unit_cost')::NUMERIC,
        (v_item->>'total_material_cost')::NUMERIC,
        (v_item->>'total_labor_cost')::NUMERIC,
        (v_item->>'total_cost')::NUMERIC,
        v_item->>'remarks',
        v_category
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'boq_id', p_boq_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- [CRITICAL SECURITY] Revoke ทันทีหลัง CREATE FUNCTION (ไม่รอท้าย script)
REVOKE EXECUTE ON FUNCTION save_boq_with_routes(UUID, JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION save_boq_with_routes(UUID, JSONB, JSONB) TO authenticated;


-- ============================================================================
-- [RLS TIGHTENING & AUTHORIZATION MANAGEMENT]
-- ============================================================================

-- [FIX: RLS Atomicity Transaction Block] ครอบด้วย transaction block เพื่อให้การสลับ RLS, policy และ grant ทำงานแบบ all-or-nothing ป้องกัน outage ระหว่าง deploy
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';

  -- 1. เปิดใช้การป้องกันความปลอดภัยระดับ RLS ทุกลำวดับอย่างเข้มงวด
  -- price_list_versions และ price_list_audit_logs: ENABLE RLS ย้ายไปติดกับ CREATE TABLE แล้ว (L66, L87)
  ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

  -- 2. นโยบาย RLS สำหรับตารางรุ่นเล่มราคา (price_list_versions)
  -- [DESIGN DECISION: Read Exposure]
  -- authenticated อ่านได้ทุกเวอร์ชัน (draft/active/archived) ผ่าน API
  -- ตัดสินใจ: ยอมรับได้ เพราะราคากลาง NT เป็นข้อมูลสาธารณะ ไม่ใช่ความลับทางการค้า
  -- ถ้าอนาคตต้องการปิดบัง draft → เปลี่ยน SELECT USING เป็น (status = 'active')
  DROP POLICY IF EXISTS "Allow read to authenticated" ON public.price_list_versions;
  CREATE POLICY "Allow read to authenticated" ON public.price_list_versions
      FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Allow write to admin only" ON public.price_list_versions;
  CREATE POLICY "Allow write to admin only" ON public.price_list_versions
      FOR ALL TO authenticated
      USING (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      )
      WITH CHECK (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      );

  -- 3. นโยบาย RLS สำหรับตารางราคาหลัก (price_list)
  DROP POLICY IF EXISTS "Allow public read access" ON public.price_list;
  DROP POLICY IF EXISTS "Allow public insert" ON public.price_list;
  DROP POLICY IF EXISTS "Allow public update" ON public.price_list;
  DROP POLICY IF EXISTS "Allow public delete" ON public.price_list;

  DROP POLICY IF EXISTS "Allow select to authenticated" ON public.price_list;
  CREATE POLICY "Allow select to authenticated" ON public.price_list
      FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Allow write to admin only" ON public.price_list;
  CREATE POLICY "Allow write to admin only" ON public.price_list
      FOR ALL TO authenticated
      USING (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      )
      WITH CHECK (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      );

  -- 4. นโยบาย RLS สำหรับตารางประวัติราคา (price_list_audit_logs)
  DROP POLICY IF EXISTS "Allow read and write audit logs for admin only" ON public.price_list_audit_logs;
  CREATE POLICY "Allow read and write audit logs for admin only" ON public.price_list_audit_logs
      FOR ALL TO authenticated
      USING (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      )
      WITH CHECK (
          (SELECT role FROM user_profiles WHERE id = auth.uid() AND status = 'active') = 'admin'
      );

  -- ============================================================================
  -- [PHASE 1A GRANTS & REVOKE] สิทธิ์ขั้นต่ำ — SELECT เท่านั้น
  -- ============================================================================

  -- [EXPLICIT REVOKE] ถอน write privilege ให้ชัดเจน (GRANT เป็น additive ไม่ลบของเดิม)
  REVOKE INSERT, UPDATE, DELETE
  ON TABLE public.price_list_versions, public.price_list, public.price_list_audit_logs
  FROM PUBLIC, authenticated, anon;

  -- Phase 1A: อ่านอย่างเดียว (RPC ทำงานผ่าน SECURITY DEFINER ไม่ต้องใช้ write grant)
  GRANT SELECT ON TABLE public.price_list_versions TO authenticated;
  GRANT SELECT ON TABLE public.price_list TO authenticated;
  GRANT SELECT ON TABLE public.price_list_audit_logs TO authenticated;

  -- Service role: Full access (สำหรับ migration/backfill)
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.price_list_versions TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.price_list TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.price_list_audit_logs TO service_role;

COMMIT;
RESET lock_timeout;
RESET statement_timeout;

-- [KNOWN RISK: BOQ Direct-Write RLS]
-- ตาราง boq, boq_items, boq_routes ยังมี policy USING(true) อยู่ (เปิดกว้าง)
-- นี่เป็นปัญหาที่มีอยู่เดิม ไม่ได้เกิดจาก migration นี้
```

> **Design Decisions (ไม่ใช่ SQL)**
> - `SECURITY DEFINER` + `search_path = ''` + fully-qualified table names — ตาม [Supabase best practice](https://supabase.com/docs/guides/database/functions)
> - BOQ direct-write RLS เปิดกว้าง — ปัญหาเดิม ควร tighten ใน sprint ถัดไป

---

## 🔒 3. การรัดกุมฐานข้อมูลหลังจากปรับแต่งโปรแกรมเสร็จสิ้น (Phase 1B - Database Hardening)

รันหลังจาก Phase 2 deploy code เสร็จแล้ว:

```sql
-- ============================================================================
-- [PHASE 1B] รัดกุมข้อตกลงสัญญาข้อมูล (Data Contract Hardening)
-- ============================================================================

-- 1. ปรับค่าเวอร์ชันเป็น NOT NULL
-- [FIX: Lock Guardrail] ครอบด้วย transaction block และตั้ง lock_timeout เนื่องจากคำสั่ง ALTER COLUMN SET NOT NULL ต้องสแกนตาราง boq ทั้งใบและขอ ACCESS EXCLUSIVE lock
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';
  ALTER TABLE public.boq ALTER COLUMN price_list_version_id SET NOT NULL;
COMMIT;
RESET lock_timeout;
RESET statement_timeout;

-- 2. ทริกเกอร์ป้องกันการดัดแปลงเลขรุ่นย้อนหลัง
CREATE OR REPLACE FUNCTION prevent_boq_version_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.price_list_version_id IS DISTINCT FROM NEW.price_list_version_id THEN
        RAISE EXCEPTION 'การดัดแปลงรุ่นเล่มราคามาตรฐานของใบงานประมาณราคาที่ระบุไปแล้วเป็นสิ่งต้องห้ามอย่างเด็ดขาด';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_prevent_boq_version_modification ON boq;
CREATE TRIGGER trigger_prevent_boq_version_modification
BEFORE UPDATE ON boq
FOR EACH ROW
EXECUTE FUNCTION prevent_boq_version_modification();
```

---

## 🔧 4. ฟังก์ชัน Phase 4 — Admin GUI (ห้ามรันใน Phase 1A)

ฟังก์ชันด้านล่างสำหรับ Phase 4 เท่านั้น เมื่อมี Admin GUI พร้อม:

```sql
-- ============================================================================
-- [PHASE 4] ฟังก์ชัน Admin — ติดตั้งพร้อม GUI deploy เท่านั้น
-- ============================================================================

CREATE OR REPLACE FUNCTION clone_price_list_version(
  p_source_version_id UUID, p_target_version_id UUID
) RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin' AND status = 'active') THEN
    RAISE EXCEPTION 'Admin only'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.price_list_versions WHERE id = p_source_version_id) OR
     NOT EXISTS (SELECT 1 FROM public.price_list_versions WHERE id = p_target_version_id) THEN
    RAISE EXCEPTION 'Invalid version'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.price_list_versions WHERE id = p_target_version_id AND status = 'draft') THEN
    RAISE EXCEPTION 'Target must be draft'; END IF;
  IF EXISTS (SELECT 1 FROM public.price_list WHERE version_id = p_target_version_id) THEN
    RAISE EXCEPTION 'Target not empty'; END IF;

  INSERT INTO public.price_list (version_id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, remarks, category, is_active)
  SELECT p_target_version_id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, remarks, category, is_active
  FROM public.price_list WHERE version_id = p_source_version_id
  ON CONFLICT (version_id, item_code) DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;
REVOKE EXECUTE ON FUNCTION clone_price_list_version(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION clone_price_list_version(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION make_version_default(p_version_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin' AND status = 'active') THEN
    RAISE EXCEPTION 'Admin only'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.price_list_versions WHERE id = p_version_id AND status = 'active') THEN
    RAISE EXCEPTION 'Version must be active'; END IF;
  UPDATE public.price_list_versions SET is_default = (id = p_version_id)
  WHERE is_default = true OR id = p_version_id;
END; $$;
REVOKE EXECUTE ON FUNCTION make_version_default(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION make_version_default(UUID) TO authenticated;

-- 3. ตรวจจับและบันทึกประวัติการเปลี่ยนแปลงราคามาตรฐาน (Audit Trail Trigger)
CREATE OR REPLACE FUNCTION audit_price_list_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.material_cost IS DISTINCT FROM NEW.material_cost OR 
       OLD.labor_cost IS DISTINCT FROM NEW.labor_cost OR
       OLD.unit_cost IS DISTINCT FROM NEW.unit_cost OR
       OLD.item_name IS DISTINCT FROM NEW.item_name OR
       OLD.category IS DISTINCT FROM NEW.category OR
       OLD.is_active IS DISTINCT FROM NEW.is_active THEN
       
      INSERT INTO public.price_list_audit_logs (
        version_id, item_code, action, old_values, new_values, performed_by
      ) VALUES (
        NEW.version_id,
        NEW.item_code,
        'update_price',
        jsonb_build_object(
          'item_name', OLD.item_name,
          'material_cost', OLD.material_cost,
          'labor_cost', OLD.labor_cost,
          'unit_cost', OLD.unit_cost,
          'category', OLD.category,
          'is_active', OLD.is_active
        ),
        jsonb_build_object(
          'item_name', NEW.item_name,
          'material_cost', NEW.material_cost,
          'labor_cost', NEW.labor_cost,
          'unit_cost', NEW.unit_cost,
          'category', NEW.category,
          'is_active', NEW.is_active
        ),
        auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.price_list_audit_logs (
      version_id, item_code, action, old_values, performed_by
    ) VALUES (
      OLD.version_id,
      OLD.item_code,
      'delete_item',
      jsonb_build_object(
        'item_name', OLD.item_name,
        'material_cost', OLD.material_cost,
        'labor_cost', OLD.labor_cost,
        'unit_cost', OLD.unit_cost,
        'category', OLD.category,
        'is_active', OLD.is_active
      ),
      auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_audit_price_list_changes ON price_list;
CREATE TRIGGER trigger_audit_price_list_changes
AFTER UPDATE OR DELETE ON price_list
FOR EACH ROW
EXECUTE FUNCTION audit_price_list_changes();

-- 4. ตรวจจับการเขียนตรงที่เวอร์ชันของรายการราคากลางไม่เข้าคู่กับเวอร์ชันของ BOQ หลัก (Cross-Version Isolation Trigger)
CREATE OR REPLACE FUNCTION validate_boq_item_version()
RETURNS TRIGGER AS $$
DECLARE
  v_boq_version UUID;
  v_item_version UUID;
BEGIN
  IF NEW.price_list_id IS NOT NULL THEN
    -- ดึงเวอร์ชันของ BOQ
    SELECT price_list_version_id INTO v_boq_version
    FROM public.boq
    WHERE id = NEW.boq_id;
    
    -- ดึงเวอร์ชันของรายการราคากลาง
    SELECT version_id INTO v_item_version
    FROM public.price_list
    WHERE id = NEW.price_list_id;
    
    IF v_boq_version IS DISTINCT FROM v_item_version THEN
      RAISE EXCEPTION 'เวอร์ชันของรายการราคากลาง (%) ไม่ตรงกับเวอร์ชันของใบงาน BOQ (%)', v_item_version, v_boq_version;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trigger_validate_boq_item_version ON boq_items;
CREATE TRIGGER trigger_validate_boq_item_version
BEFORE INSERT OR UPDATE ON boq_items
FOR EACH ROW
EXECUTE FUNCTION validate_boq_item_version();

-- เปิด write grants สำหรับ Admin GUI
GRANT INSERT, UPDATE, DELETE ON TABLE price_list_versions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE price_list TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE price_list_audit_logs TO authenticated;
```
