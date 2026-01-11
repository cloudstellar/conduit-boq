-- ============================================================================
-- STEP 1: BACKUP & VERIFICATION QUERIES
-- ============================================================================
-- Run these queries BEFORE migration and save the results
-- Copy-paste each query into Supabase SQL Editor and save the output
-- ============================================================================

-- Query 1: Count all BOQ records
SELECT 'Total BOQ Count' as metric, COUNT(*) as count FROM boq;

-- Query 2: Count all BOQ Items
SELECT 'Total BOQ Items Count' as metric, COUNT(*) as count FROM boq_items;

-- Query 3: List all BOQs with their item counts and totals
SELECT 
    b.id,
    b.boq_number,
    b.project_name,
    b.route,
    b.total_material_cost,
    b.total_labor_cost,
    b.total_cost,
    COUNT(bi.id) as items_count,
    b.created_at
FROM boq b
LEFT JOIN boq_items bi ON bi.boq_id = b.id
GROUP BY b.id, b.boq_number, b.project_name, b.route, 
         b.total_material_cost, b.total_labor_cost, b.total_cost, b.created_at
ORDER BY b.created_at DESC;

-- Query 4: Verify data integrity - sum of items should match BOQ total
SELECT 
    b.id,
    b.project_name,
    b.total_cost as boq_total,
    COALESCE(SUM(bi.total_cost), 0) as items_sum,
    b.total_cost - COALESCE(SUM(bi.total_cost), 0) as difference,
    CASE 
        WHEN ABS(b.total_cost - COALESCE(SUM(bi.total_cost), 0)) < 0.01 THEN '✓ OK'
        ELSE '⚠ MISMATCH'
    END as status
FROM boq b
LEFT JOIN boq_items bi ON bi.boq_id = b.id
GROUP BY b.id, b.project_name, b.total_cost
ORDER BY b.created_at DESC;

-- Query 5: Check for any existing routes (should be empty before migration)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boq_routes')
        THEN 'Table exists'
        ELSE 'Table does not exist (expected before migration)'
    END as boq_routes_status;

-- Query 6: Check for route_id column in boq_items (should not exist before migration)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'boq_items' AND column_name = 'route_id'
        )
        THEN 'Column exists'
        ELSE 'Column does not exist (expected before migration)'
    END as route_id_column_status;

-- ============================================================================
-- SAVE THESE RESULTS BEFORE PROCEEDING TO MIGRATION!
-- ============================================================================
-- After running all queries above, proceed to:
-- migrations/002_add_multi_route_support.sql
-- ============================================================================

