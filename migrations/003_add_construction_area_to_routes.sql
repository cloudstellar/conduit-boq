-- ============================================================================
-- Migration: Add construction_area to boq_routes
-- Created: 2026-01-11
-- Description: Allows each route to have its own construction area
-- ============================================================================

-- Add construction_area column to boq_routes
ALTER TABLE public.boq_routes 
ADD COLUMN IF NOT EXISTS construction_area TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.boq_routes.construction_area IS 'Construction area specific to this route (e.g., "ถนนพระราม 4", "ถนนสุขุมวิท")';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'boq_routes' 
  AND column_name = 'construction_area';

-- Success message
SELECT '✅ Added construction_area column to boq_routes table' as status;

