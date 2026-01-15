-- ============================================
-- Phase 1A: Authentication & Core Ownership
-- ============================================
-- This migration adds:
-- 1. Organizations table
-- 2. Departments table (ฝ่าย)
-- 3. Sectors table (ส่วน)
-- 4. User profiles with roles
-- 5. BOQ ownership columns
-- 6. Audit fields
-- 7. RLS policies
-- ============================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Departments (ฝ่าย)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_dept_code_per_org UNIQUE (org_id, code)
);

-- 3. Sectors (ส่วน)
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_sector_code_per_dept UNIQUE (department_id, code)
);

-- 4. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  employee_id TEXT,
  title TEXT,
  first_name TEXT NOT NULL DEFAULT 'User',
  last_name TEXT NOT NULL DEFAULT '',
  
  -- Position
  position TEXT,
  
  -- Organization
  org_id UUID REFERENCES organizations(id),
  department_id UUID REFERENCES departments(id),
  sector_id UUID REFERENCES sectors(id),
  
  -- Role
  role TEXT NOT NULL DEFAULT 'staff' 
    CHECK (role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')),
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Signature (future use)
  signature_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add ownership columns to BOQ
ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS sector_id UUID REFERENCES sectors(id);

-- 6. Add audit fields to BOQ
ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 7. Create indexes for ownership columns (CRITICAL for RLS performance)
CREATE INDEX IF NOT EXISTS idx_boq_created_by ON boq(created_by);
CREATE INDEX IF NOT EXISTS idx_boq_assigned_to ON boq(assigned_to);
CREATE INDEX IF NOT EXISTS idx_boq_sector_id ON boq(sector_id);
CREATE INDEX IF NOT EXISTS idx_boq_department_id ON boq(department_id);
CREATE INDEX IF NOT EXISTS idx_boq_org_id ON boq(org_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_boq_sector_status ON boq(sector_id, status);
CREATE INDEX IF NOT EXISTS idx_boq_department_status ON boq(department_id, status);
CREATE INDEX IF NOT EXISTS idx_boq_created_by_status ON boq(created_by, status);

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sector ON user_profiles(sector_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department_id);

-- Sector/Department indexes
CREATE INDEX IF NOT EXISTS idx_sectors_department ON sectors(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(org_id);

-- 8. Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

