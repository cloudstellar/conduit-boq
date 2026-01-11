-- ============================================================================
-- Migration: Add Multi-Route Support to BOQ System
-- Created: 2026-01-11
-- Description: Adds boq_routes table and migrates existing data safely
-- ============================================================================
-- IMPORTANT: This migration is SAFE for existing data
-- - All schema changes use IF NOT EXISTS / IF EXISTS
-- - route_id in boq_items is NULLABLE (backward compatible)
-- - Existing BOQ items will be migrated to default routes
-- ============================================================================

-- ============================================================================
-- PHASE 1: PRE-MIGRATION VERIFICATION (Run these SELECT queries first)
-- ============================================================================
-- Run these queries to record current state BEFORE migration:
--
-- SELECT COUNT(*) as boq_count FROM boq;
-- SELECT COUNT(*) as boq_items_count FROM boq_items;
-- SELECT boq_id, COUNT(*) as items_per_boq FROM boq_items GROUP BY boq_id;
-- ============================================================================

-- ============================================================================
-- PHASE 2: SCHEMA MIGRATION
-- ============================================================================

-- 2.1 Create boq_routes table
CREATE TABLE IF NOT EXISTS public.boq_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    boq_id UUID NOT NULL REFERENCES public.boq(id) ON DELETE CASCADE,
    route_order INTEGER NOT NULL DEFAULT 1,
    route_name TEXT NOT NULL,
    route_description TEXT,
    total_material_cost DECIMAL(15,2) DEFAULT 0,
    total_labor_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    cost_with_factor_f DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_boq_route_order UNIQUE (boq_id, route_order)
);

-- 2.2 Add route_id column to boq_items (NULLABLE for backward compatibility)
-- ⚠️ This will NOT affect existing data - old items will have route_id = NULL
ALTER TABLE public.boq_items
ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES public.boq_routes(id) ON DELETE CASCADE;

-- 2.3 Add Factor F columns to boq table (for storing calculated values)
ALTER TABLE public.boq
ADD COLUMN IF NOT EXISTS factor_f DECIMAL(10,4) DEFAULT NULL;

ALTER TABLE public.boq
ADD COLUMN IF NOT EXISTS total_with_factor_f DECIMAL(15,2) DEFAULT 0;

ALTER TABLE public.boq
ADD COLUMN IF NOT EXISTS total_with_vat DECIMAL(15,2) DEFAULT 0;

-- 2.4 Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_boq_routes_boq_id ON public.boq_routes(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_routes_order ON public.boq_routes(boq_id, route_order);
CREATE INDEX IF NOT EXISTS idx_boq_items_route_id ON public.boq_items(route_id);

-- 2.5 Enable Row Level Security (RLS)
ALTER TABLE public.boq_routes ENABLE ROW LEVEL SECURITY;

-- 2.6 Create RLS policies for boq_routes
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.boq_routes;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.boq_routes;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.boq_routes;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON public.boq_routes;

    -- Create new policies
    CREATE POLICY "Enable read access for all users" ON public.boq_routes
        FOR SELECT USING (true);
    CREATE POLICY "Enable insert access for all users" ON public.boq_routes
        FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update access for all users" ON public.boq_routes
        FOR UPDATE USING (true);
    CREATE POLICY "Enable delete access for all users" ON public.boq_routes
        FOR DELETE USING (true);
END $$;

-- 2.7 Create function to update boq_routes updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_boq_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.8 Create trigger for updated_at
DROP TRIGGER IF EXISTS update_boq_routes_updated_at ON public.boq_routes;
CREATE TRIGGER update_boq_routes_updated_at
    BEFORE UPDATE ON public.boq_routes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_boq_routes_updated_at();

-- ============================================================================
-- PHASE 3: DATA MIGRATION (Migrate existing BOQ items to default routes)
-- ============================================================================

-- 3.1 Create default routes for all existing BOQs that have items but no routes
INSERT INTO public.boq_routes (boq_id, route_order, route_name, route_description,
                               total_material_cost, total_labor_cost, total_cost)
SELECT DISTINCT
    b.id as boq_id,
    1 as route_order,
    COALESCE(NULLIF(b.route, ''), 'เส้นทางหลัก') as route_name,
    'สร้างอัตโนมัติจาก migration' as route_description,
    b.total_material_cost,
    b.total_labor_cost,
    b.total_cost
FROM public.boq b
INNER JOIN public.boq_items bi ON bi.boq_id = b.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.boq_routes br WHERE br.boq_id = b.id
)
GROUP BY b.id, b.route, b.total_material_cost, b.total_labor_cost, b.total_cost;

-- 3.2 Update boq_items to link to the default route for each BOQ
UPDATE public.boq_items bi
SET route_id = br.id
FROM public.boq_routes br
WHERE bi.boq_id = br.boq_id
  AND bi.route_id IS NULL
  AND br.route_order = 1;

-- ============================================================================
-- PHASE 4: POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run these queries to verify migration success:

-- 4.1 Check all items now have route_id (should match pre-migration count)
SELECT
    'boq_items with route_id' as check_name,
    COUNT(*) as count,
    COUNT(route_id) as with_route_id,
    COUNT(*) - COUNT(route_id) as without_route_id
FROM public.boq_items;

-- 4.2 Check routes were created for all BOQs with items
SELECT
    'BOQs with routes' as check_name,
    (SELECT COUNT(DISTINCT boq_id) FROM public.boq_items) as boqs_with_items,
    (SELECT COUNT(DISTINCT boq_id) FROM public.boq_routes) as boqs_with_routes;

-- 4.3 Verify data integrity - totals should match
SELECT
    b.id,
    b.project_name,
    b.total_cost as boq_total,
    br.total_cost as route_total,
    CASE WHEN b.total_cost = br.total_cost THEN '✓ OK' ELSE '⚠ MISMATCH' END as status
FROM public.boq b
INNER JOIN public.boq_routes br ON br.boq_id = b.id
WHERE br.route_order = 1
LIMIT 10;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.boq_routes IS 'Stores multiple routes/sections for each BOQ project';
COMMENT ON COLUMN public.boq_routes.route_order IS 'Display order of routes within a BOQ (1 = primary)';
COMMENT ON COLUMN public.boq_routes.route_name IS 'Name/identifier of the route';
COMMENT ON COLUMN public.boq_items.route_id IS 'Reference to boq_routes - migrated items linked to default route';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT '✅ Migration completed successfully!' as status,
       (SELECT COUNT(*) FROM public.boq_routes) as routes_created,
       (SELECT COUNT(*) FROM public.boq_items WHERE route_id IS NOT NULL) as items_migrated;

