-- ============================================
-- Phase 1A: RLS Write Policies & Approval Functions
-- ============================================

-- 1. RLS Policies for BOQ - INSERT
DROP POLICY IF EXISTS "boq_insert" ON boq;
CREATE POLICY "boq_insert" ON boq FOR INSERT WITH CHECK (
  -- Anyone authenticated can create (except procurement)
  auth.uid() IS NOT NULL
  AND (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'procurement'
);

-- 2. RLS Policies for BOQ - UPDATE
DROP POLICY IF EXISTS "boq_update" ON boq;
CREATE POLICY "boq_update" ON boq FOR UPDATE USING (
  -- Legacy BOQ (no owner)
  created_by IS NULL
  OR
  -- Admin: update everything
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  OR
  -- dept_manager: update entire department
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'dept_manager'
    AND department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid())
  )
  OR
  -- sector_manager: update sector
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'sector_manager'
    AND sector_id = (SELECT sector_id FROM user_profiles WHERE id = auth.uid())
  )
  OR
  -- staff: own only (draft status or assigned)
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'staff'
    AND (created_by = auth.uid() OR assigned_to = auth.uid())
  )
);

-- 3. RLS Policies for BOQ - DELETE
DROP POLICY IF EXISTS "boq_delete" ON boq;
CREATE POLICY "boq_delete" ON boq FOR DELETE USING (
  -- Admin can delete all
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  OR
  -- Owner can delete own draft
  (created_by = auth.uid() AND status = 'draft')
);

-- 4. RLS for BOQ Items (follows parent BOQ)
DROP POLICY IF EXISTS "boq_items_select" ON boq_items;
CREATE POLICY "boq_items_select" ON boq_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM boq WHERE boq.id = boq_items.boq_id)
);

DROP POLICY IF EXISTS "boq_items_insert" ON boq_items;
CREATE POLICY "boq_items_insert" ON boq_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_items.boq_id
    AND (boq.created_by = auth.uid() OR boq.assigned_to = auth.uid() OR boq.created_by IS NULL)
  )
);

DROP POLICY IF EXISTS "boq_items_update" ON boq_items;
CREATE POLICY "boq_items_update" ON boq_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_items.boq_id
    AND (boq.created_by = auth.uid() OR boq.assigned_to = auth.uid() OR boq.created_by IS NULL
         OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'dept_manager', 'sector_manager'))
  )
);

DROP POLICY IF EXISTS "boq_items_delete" ON boq_items;
CREATE POLICY "boq_items_delete" ON boq_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_items.boq_id
    AND (boq.created_by = auth.uid() OR boq.created_by IS NULL
         OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
  )
);

-- 5. RLS for BOQ Routes (same as items)
DROP POLICY IF EXISTS "boq_routes_select" ON boq_routes;
CREATE POLICY "boq_routes_select" ON boq_routes FOR SELECT USING (
  EXISTS (SELECT 1 FROM boq WHERE boq.id = boq_routes.boq_id)
);

DROP POLICY IF EXISTS "boq_routes_insert" ON boq_routes;
CREATE POLICY "boq_routes_insert" ON boq_routes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_routes.boq_id
    AND (boq.created_by = auth.uid() OR boq.assigned_to = auth.uid() OR boq.created_by IS NULL)
  )
);

DROP POLICY IF EXISTS "boq_routes_update" ON boq_routes;
CREATE POLICY "boq_routes_update" ON boq_routes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_routes.boq_id
    AND (boq.created_by = auth.uid() OR boq.assigned_to = auth.uid() OR boq.created_by IS NULL
         OR (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'dept_manager', 'sector_manager'))
  )
);

DROP POLICY IF EXISTS "boq_routes_delete" ON boq_routes;
CREATE POLICY "boq_routes_delete" ON boq_routes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM boq 
    WHERE boq.id = boq_routes.boq_id
    AND (boq.created_by = auth.uid() OR boq.created_by IS NULL
         OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
  )
);

-- 6. Approval function with Separation of Duties (SoD)
CREATE OR REPLACE FUNCTION can_approve_boq(p_boq_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_my_sector UUID;
  v_my_department UUID;
  v_boq_created_by UUID;
  v_boq_sector UUID;
  v_boq_department UUID;
  v_boq_status TEXT;
BEGIN
  -- Get my info
  SELECT role, sector_id, department_id 
  INTO v_role, v_my_sector, v_my_department
  FROM user_profiles WHERE id = auth.uid();
  
  -- Get BOQ info
  SELECT created_by, sector_id, department_id, status
  INTO v_boq_created_by, v_boq_sector, v_boq_department, v_boq_status
  FROM boq WHERE id = p_boq_id;
  
  -- SoD: Creator cannot approve own BOQ
  IF v_boq_created_by = auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Admin can approve anything (except own)
  IF v_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- sector_manager: approve sector BOQs at pending_review stage
  IF v_role = 'sector_manager' 
     AND v_boq_sector = v_my_sector 
     AND v_boq_status = 'pending_review' THEN
    RETURN TRUE;
  END IF;
  
  -- dept_manager: approve department BOQs at pending_approval stage
  IF v_role = 'dept_manager' 
     AND v_boq_department = v_my_department 
     AND v_boq_status = 'pending_approval' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

