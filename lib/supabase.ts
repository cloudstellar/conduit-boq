import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface PriceListItem {
  id: string;
  item_code: string;
  item_name: string;
  unit: string;
  material_cost: number;
  labor_cost: number;
  unit_cost: number;
  remarks: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BOQ {
  id: string;
  boq_number: string | null;
  estimator_name: string;
  document_date: string;
  project_name: string;
  route: string | null;
  construction_area: string | null;
  department: string | null;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  factor_f: number | null;
  total_with_factor_f: number;
  total_with_vat: number;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface BOQItem {
  id: string;
  boq_id: string;
  route_id: string | null;
  item_order: number;
  price_list_id: string | null;
  item_name: string;
  quantity: number;
  unit: string;
  material_cost_per_unit: number;
  labor_cost_per_unit: number;
  unit_cost: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface BOQRoute {
  id: string;
  boq_id: string;
  route_order: number;
  route_name: string;
  route_description: string | null;
  construction_area: string | null;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  cost_with_factor_f: number;
  created_at: string;
  updated_at: string;
}

export interface FactorReference {
  id: string;
  cost_million: number;
  operation_percent: number;
  interest_percent: number;
  profit_percent: number;
  total_expense_percent: number;
  factor: number;
  vat_percent: number;
  factor_f: number;
  factor_f_rain_1: number;
  factor_f_rain_2: number;
  created_at: string;
}
