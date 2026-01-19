-- =============================================================================
-- Migration 007: Add Requested Org Columns for Onboarding
-- Version: v1.2.0-admin-security
-- =============================================================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS requested_department_id uuid REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS requested_sector_id uuid REFERENCES public.sectors(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_note text;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_requested_dept ON public.user_profiles(requested_department_id) WHERE requested_department_id IS NOT NULL;
