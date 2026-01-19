-- =============================================================================
-- RLS Security Regression Tests for v1.2.0
-- Run these tests after applying 008_rls_and_trigger.sql
-- =============================================================================

-- Setup: Create test users (run as admin/service role)
-- Assumes you have test users with these characteristics

-- Test Case 1: Pending user sees only own BOQ
-- Expected: Only BOQs where created_by = pending_user_id
DO $$
DECLARE
  v_count int;
BEGIN
  -- Set session as pending user (replace with actual test)
  -- SELECT * FROM boq; should return only own
  RAISE NOTICE 'Test 1: Pending user own-only - MANUAL TEST REQUIRED';
END $$;

-- Test Case 2: Pending user with assigned_to should NOT see
-- Expected: assigned_to alone does not grant access to pending user
DO $$
BEGIN
  RAISE NOTICE 'Test 2: Pending + assigned_to blocked - MANUAL TEST REQUIRED';
END $$;

-- Test Case 3: sector_manager cross-sector blocked
-- Expected: sector_manager cannot see BOQ from different sector in same dept
DO $$
BEGIN
  RAISE NOTICE 'Test 3: sector_manager cross-sector - MANUAL TEST REQUIRED';
END $$;

-- Test Case 4: dept_manager sees all sectors in department
-- Expected: dept_manager can see all BOQs where boq.department_id matches
DO $$
BEGIN
  RAISE NOTICE 'Test 4: dept_manager all sectors - MANUAL TEST REQUIRED';
END $$;

-- Test Case 5: Active user with null org sees own only
-- Expected: Active user without dept/sector assigned sees only own BOQ
DO $$
BEGIN
  RAISE NOTICE 'Test 5: Active null org own-only - MANUAL TEST REQUIRED';
END $$;

-- Test Case 6: Legacy BOQ (null owner) admin-only
-- Expected: Only admin can see BOQ where created_by IS NULL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM boq WHERE created_by IS NULL)
    THEN 'Test 6: Legacy BOQs exist - verify admin-only access'
    ELSE 'Test 6: No legacy BOQs found'
  END AS test_result;

-- Test Case 7: API bypass blocked by RLS
-- Expected: Direct query from pending user with sector_id still blocked
DO $$
BEGIN
  RAISE NOTICE 'Test 7: API bypass blocked - MANUAL TEST REQUIRED';
END $$;

-- Test Case 8: Trigger blocks org edit after onboarding
-- Expected: UPDATE user_profiles SET sector_id = '...' should fail
DO $$
BEGIN
  -- This should raise exception
  -- UPDATE user_profiles SET sector_id = 'other-sector' WHERE id = 'onboarded-user';
  RAISE NOTICE 'Test 8: Trigger lock - MANUAL TEST REQUIRED';
END $$;

-- Test Case 9: Legacy BOQ WITH sector_id blocked for non-admin
-- Expected: Non-admin cannot see legacy BOQ even if sector_id matches
DO $$
BEGIN
  RAISE NOTICE 'Test 9: Legacy with sector_id - MANUAL TEST REQUIRED';
END $$;

-- Test Case 10: Staff querying null owner blocked
-- Expected: Staff cannot see BOQ where created_by IS NULL
DO $$
BEGIN
  RAISE NOTICE 'Test 10: Staff null owner blocked - MANUAL TEST REQUIRED';
END $$;

-- =============================================================================
-- Summary: Run each test by impersonating different user roles
-- Use Supabase Dashboard > SQL Editor > Set role to test
-- =============================================================================
