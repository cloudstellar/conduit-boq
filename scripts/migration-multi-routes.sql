-- Migration: Add Multi-Route Support for BOQ
-- Run this migration in Supabase SQL Editor

-- 1. Create boq_routes table
CREATE TABLE IF NOT EXISTS boq_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id UUID NOT NULL REFERENCES boq(id) ON DELETE CASCADE,
  route_order INTEGER NOT NULL DEFAULT 1,
  route_name VARCHAR(255) NOT NULL,
  route_description TEXT,
  total_material_cost DECIMAL(15,2) DEFAULT 0,
  total_labor_cost DECIMAL(15,2) DEFAULT 0,
  total_cost DECIMAL(15,2) DEFAULT 0,
  cost_with_factor_f DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add route_id column to boq_items (nullable for backward compatibility)
ALTER TABLE boq_items 
ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES boq_routes(id) ON DELETE CASCADE;

-- 3. Add factor_f columns to boq table for storing calculated values
ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS factor_f DECIMAL(10,4) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_with_factor_f DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_with_vat DECIMAL(15,2) DEFAULT 0;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_boq_routes_boq_id ON boq_routes(boq_id);
CREATE INDEX IF NOT EXISTS idx_boq_routes_order ON boq_routes(boq_id, route_order);
CREATE INDEX IF NOT EXISTS idx_boq_items_route_id ON boq_items(route_id);

-- 5. Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for boq_routes updated_at
DROP TRIGGER IF EXISTS update_boq_routes_updated_at ON boq_routes;
CREATE TRIGGER update_boq_routes_updated_at
  BEFORE UPDATE ON boq_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable RLS (Row Level Security) on boq_routes
ALTER TABLE boq_routes ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for boq_routes (allow all for anon users - adjust as needed)
CREATE POLICY "Allow all access to boq_routes" ON boq_routes
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the migration
SELECT 'Migration completed successfully!' as status;

