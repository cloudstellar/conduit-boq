-- ============================================
-- Phase 1A: Seed Data & RLS Policies
-- ============================================

-- 1. Seed default organization, department, and sector
DO $$
DECLARE
  v_org_id UUID;
  v_dept_id UUID;
  v_sector_id UUID;
BEGIN
  -- Create default org if not exists
  INSERT INTO organizations (name, code)
  VALUES ('บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)', 'NT')
  ON CONFLICT (code) DO NOTHING;
  SELECT id INTO v_org_id FROM organizations WHERE code = 'NT';
  
  -- Create default department (ฝ่าย)
  INSERT INTO departments (org_id, code, name, full_name)
  VALUES (v_org_id, 'ทฐฐ.', 'ฝ่ายท่อร้อยสาย', 'ฝ่ายท่อร้อยสาย (ทฐฐ.)')
  ON CONFLICT (org_id, code) DO NOTHING;
  SELECT id INTO v_dept_id FROM departments WHERE code = 'ทฐฐ.' LIMIT 1;
  
  -- Create default sector (ส่วน)
  IF v_dept_id IS NOT NULL THEN
    INSERT INTO sectors (department_id, code, name, full_name)
    VALUES (v_dept_id, 'วทฐฐ.', 'ส่วนวิศวกรรมท่อร้อยสาย', 'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)')
    ON CONFLICT (department_id, code) DO NOTHING;
    SELECT id INTO v_sector_id FROM sectors WHERE code = 'วทฐฐ.' LIMIT 1;
  END IF;
  
  -- Backfill legacy BOQs with default department/sector
  UPDATE boq 
  SET 
    org_id = v_org_id,
    department_id = v_dept_id,
    sector_id = v_sector_id
  WHERE sector_id IS NULL AND department_id IS NULL;
  
  RAISE NOTICE 'Seeded: org=%, dept=%, sector=%', v_org_id, v_dept_id, v_sector_id;
  RAISE NOTICE 'Backfilled % legacy BOQs', (SELECT COUNT(*) FROM boq WHERE sector_id = v_sector_id);
END $$;

-- 2. Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- 3. Helper function: Get current user's profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  sector_id UUID,
  department_id UUID,
  org_id UUID
) AS $$
  SELECT id, role, sector_id, department_id, org_id 
  FROM user_profiles 
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. RLS Policies for user_profiles
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (
  -- Users can see their own profile
  id = auth.uid()
  OR
  -- Admin can see all
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Managers can see profiles in their department
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('dept_manager', 'sector_manager')
    AND up.department_id = user_profiles.department_id
  )
);

DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (
  id = auth.uid()
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. RLS Policies for organizations/departments/sectors (read-only for all authenticated)
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "dept_select" ON departments;
CREATE POLICY "dept_select" ON departments FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "sector_select" ON sectors;
CREATE POLICY "sector_select" ON sectors FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. RLS Policies for BOQ - SELECT
DROP POLICY IF EXISTS "boq_select" ON boq;
CREATE POLICY "boq_select" ON boq FOR SELECT USING (
  -- Legacy BOQ (no owner) - accessible by all authenticated
  created_by IS NULL
  OR
  -- Admin: see everything
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  OR
  -- dept_manager: see entire department
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'dept_manager'
    AND department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid())
  )
  OR
  -- sector_manager: see sector + read department
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'sector_manager'
    AND (
      sector_id = (SELECT sector_id FROM user_profiles WHERE id = auth.uid())
      OR department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid())
    )
  )
  OR
  -- staff: own + assigned + same sector
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'staff'
    AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
      OR sector_id = (SELECT sector_id FROM user_profiles WHERE id = auth.uid())
    )
  )
  OR
  -- procurement: read all in department
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'procurement'
    AND department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid())
  )
);

