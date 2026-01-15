-- ============================================
-- App Settings Table
-- ============================================

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "app_settings_select" ON app_settings FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Only admin can update settings
CREATE POLICY "app_settings_update" ON app_settings FOR UPDATE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "app_settings_insert" ON app_settings FOR INSERT WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Seed default settings
INSERT INTO app_settings (key, value, description) VALUES
  ('restrict_email_domain', 'false', 'จำกัดการสมัครเฉพาะอีเมล @ntplc.co.th'),
  ('allowed_email_domains', '["ntplc.co.th"]', 'รายชื่อ domain ที่อนุญาต')
ON CONFLICT (key) DO NOTHING;

