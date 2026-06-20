-- =============================================================================
-- RLS Policies Migration
-- Generated: 2025-01-15
-- Description: Row Level Security policies for all tables
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USER_PROFILES TABLE
-- -----------------------------------------------------------------------------
-- Users can view all profiles (for directory/team features)
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admins can update any profile (for role/status management)
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- -----------------------------------------------------------------------------
-- 2. ORGANIZATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Organizations are viewable by authenticated users" ON organizations
  FOR SELECT TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- 3. DEPARTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Departments are viewable by authenticated users" ON departments
  FOR SELECT TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- 4. SECTORS TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Sectors are viewable by authenticated users" ON sectors
  FOR SELECT TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- 5. APP_SETTINGS TABLE
-- -----------------------------------------------------------------------------
-- Everyone can read settings
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT USING (true);

-- Only admins can insert settings
CREATE POLICY "app_settings_insert" ON app_settings
  FOR INSERT WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can update settings
CREATE POLICY "app_settings_update" ON app_settings
  FOR UPDATE USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- -----------------------------------------------------------------------------
-- 6. PRICE_LIST TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Allow public read access" ON price_list
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON price_list
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON price_list
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON price_list
  FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 7. BOQ TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Allow public access to boq" ON boq
  FOR ALL USING (true);

CREATE POLICY "Allow public delete boq" ON boq
  FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 8. BOQ_ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Allow public access to boq_items" ON boq_items
  FOR ALL USING (true);

CREATE POLICY "Allow public select boq_items" ON boq_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert boq_items" ON boq_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update boq_items" ON boq_items
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete boq_items" ON boq_items
  FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 9. BOQ_ROUTES TABLE
-- -----------------------------------------------------------------------------
CREATE POLICY "Enable read access for all users" ON boq_routes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON boq_routes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON boq_routes
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON boq_routes
  FOR DELETE USING (true);

-- =============================================================================
-- NOTES:
-- =============================================================================
--
-- To apply these policies to a fresh database:
-- 1. First enable RLS on each table:
--    ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
--
-- 2. Then run this migration file
--
-- To reset policies on a table:
--    DROP POLICY IF EXISTS "policy_name" ON table_name;
--
-- Current policy summary:
-- - user_profiles: Users can view all, edit own. Admins can edit all.
-- - organizations/departments/sectors: Read-only for authenticated users
-- - app_settings: Read-only for all, write for admins only
-- - price_list/boq/boq_items/boq_routes: Full public access (to be tightened later)
--
-- TODO: Consider restricting boq/price_list access to authenticated users only
-- =============================================================================
