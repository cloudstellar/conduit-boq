-- Migration: Add pending status for new users
-- Date: 2026-01-15
-- Description: New users should have status='pending' until approved by admin

-- 1. Add 'pending' to status check constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

-- 2. Update trigger to set new users as pending
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, status, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'pending',
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Existing users remain 'active', only new signups will be 'pending'

