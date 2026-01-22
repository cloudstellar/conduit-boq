-- =============================================================================
-- Migration 007b: Add onboarding_completed column
-- Version: v1.2.0-admin-security
-- Status: DOCUMENTATION ONLY - Column already exists in production
-- =============================================================================
-- NOTE: This migration documents a column that was applied manually.
-- The column already exists in production database.
-- This file is for migration history completeness.
-- =============================================================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update existing pending users to have onboarding_completed = false
-- (already done in production)
UPDATE public.user_profiles 
SET onboarding_completed = false 
WHERE onboarding_completed IS NULL;
