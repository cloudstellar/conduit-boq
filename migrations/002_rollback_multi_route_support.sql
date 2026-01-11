-- ============================================================================
-- ROLLBACK: Remove Multi-Route Support from BOQ System
-- Created: 2026-01-11
-- Description: Reverts migration 002 - USE WITH CAUTION!
-- ============================================================================
-- ⚠️ WARNING: This will remove all route data created after migration
-- ⚠️ Make sure to backup before running this rollback
-- ============================================================================

-- ============================================================================
-- STEP 1: BACKUP FIRST! (Run these queries and save the results)
-- ============================================================================
-- Export current data before rollback:
-- SELECT * FROM boq_routes;
-- SELECT id, route_id FROM boq_items WHERE route_id IS NOT NULL;
-- ============================================================================

-- ============================================================================
-- STEP 2: REMOVE FOREIGN KEY AND DATA
-- ============================================================================

-- 2.1 Remove route_id from boq_items (set all to NULL first, then drop column)
UPDATE public.boq_items SET route_id = NULL;

-- 2.2 Drop the route_id column from boq_items
ALTER TABLE public.boq_items DROP COLUMN IF EXISTS route_id;

-- ============================================================================
-- STEP 3: DROP boq_routes TABLE
-- ============================================================================

-- 3.1 Drop trigger first
DROP TRIGGER IF EXISTS update_boq_routes_updated_at ON public.boq_routes;

-- 3.2 Drop function
DROP FUNCTION IF EXISTS public.update_boq_routes_updated_at();

-- 3.3 Drop policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.boq_routes;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.boq_routes;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.boq_routes;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.boq_routes;

-- 3.4 Drop the table (this will cascade delete all route data)
DROP TABLE IF EXISTS public.boq_routes;

-- ============================================================================
-- STEP 4: REMOVE Factor F COLUMNS FROM boq TABLE (OPTIONAL)
-- ============================================================================
-- Uncomment these if you also want to remove Factor F columns:

-- ALTER TABLE public.boq DROP COLUMN IF EXISTS factor_f;
-- ALTER TABLE public.boq DROP COLUMN IF EXISTS total_with_factor_f;
-- ALTER TABLE public.boq DROP COLUMN IF EXISTS total_with_vat;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
    '✅ Rollback completed!' as status,
    NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boq_routes') as routes_table_removed,
    NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boq_items' AND column_name = 'route_id') as route_id_removed;

