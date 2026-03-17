-- Migration for Factor F Supplement Page Snapshot Columns
-- Created: 2026-03-17

-- 1. Add 5 snapshot columns for Factor F to the boq table
ALTER TABLE boq 
ADD COLUMN IF NOT EXISTS factor_f_raw NUMERIC(15,4),
ADD COLUMN IF NOT EXISTS factor_f_lower_cost NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS factor_f_upper_cost NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS factor_f_lower_value NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS factor_f_upper_value NUMERIC(10,4);

COMMENT ON COLUMN boq.factor_f_raw IS 'Un-truncated raw Factor F value (e.g., 1.254687)';
COMMENT ON COLUMN boq.factor_f_lower_cost IS 'B: Lower cost bracket for interpolation';
COMMENT ON COLUMN boq.factor_f_upper_cost IS 'C: Upper cost bracket for interpolation';
COMMENT ON COLUMN boq.factor_f_lower_value IS 'D: Factor F value for lower cost bracket';
COMMENT ON COLUMN boq.factor_f_upper_value IS 'E: Factor F value for upper cost bracket';

-- 2. Update the RPC function to save these 5 snapshot columns during standard save/update
CREATE OR REPLACE FUNCTION save_boq_with_routes(
  p_boq_id UUID,
  p_boq_data JSONB,
  p_routes JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_route JSONB;
  v_item JSONB;
  v_inserted_route_id UUID;
  v_route_index INT := 0;
BEGIN
  UPDATE boq SET
    estimator_name = p_boq_data->>'estimator_name',
    document_date = (p_boq_data->>'document_date')::DATE,
    project_name = p_boq_data->>'project_name',
    route = p_boq_data->>'route',
    construction_area = p_boq_data->>'construction_area',
    department = p_boq_data->>'department',
    total_material_cost = (p_boq_data->>'total_material_cost')::NUMERIC,
    total_labor_cost = (p_boq_data->>'total_labor_cost')::NUMERIC,
    total_cost = (p_boq_data->>'total_cost')::NUMERIC,
    factor_f = (p_boq_data->>'factor_f')::NUMERIC,
    total_with_factor_f = (p_boq_data->>'total_with_factor_f')::NUMERIC,
    total_with_vat = (p_boq_data->>'total_with_vat')::NUMERIC,
    -- Factor F snapshot fields
    factor_f_raw = (p_boq_data->>'factor_f_raw')::NUMERIC,
    factor_f_lower_cost = (p_boq_data->>'factor_f_lower_cost')::NUMERIC,
    factor_f_upper_cost = (p_boq_data->>'factor_f_upper_cost')::NUMERIC,
    factor_f_lower_value = (p_boq_data->>'factor_f_lower_value')::NUMERIC,
    factor_f_upper_value = (p_boq_data->>'factor_f_upper_value')::NUMERIC,
    updated_at = NOW()
  WHERE id = p_boq_id;

  DELETE FROM boq_items WHERE boq_id = p_boq_id;
  DELETE FROM boq_routes WHERE boq_id = p_boq_id;

  FOR v_route IN SELECT * FROM jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO boq_routes (
      boq_id, route_order, route_name, route_description, construction_area,
      total_material_cost, total_labor_cost, total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::NUMERIC,
      (v_route->>'total_labor_cost')::NUMERIC,
      (v_route->>'total_cost')::NUMERIC
    ) RETURNING id INTO v_inserted_route_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_route->'items')
    LOOP
      INSERT INTO boq_items (
        boq_id, route_id, item_order, price_list_id, item_name, quantity, unit,
        material_cost_per_unit, labor_cost_per_unit, unit_cost,
        total_material_cost, total_labor_cost, total_cost, remarks
      ) VALUES (
        p_boq_id,
        v_inserted_route_id,
        (v_item->>'item_order')::INT,
        (v_item->>'price_list_id')::UUID,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        v_item->>'unit',
        (v_item->>'material_cost_per_unit')::NUMERIC,
        (v_item->>'labor_cost_per_unit')::NUMERIC,
        (v_item->>'unit_cost')::NUMERIC,
        (v_item->>'total_material_cost')::NUMERIC,
        (v_item->>'total_labor_cost')::NUMERIC,
        (v_item->>'total_cost')::NUMERIC,
        v_item->>'remarks'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'boq_id', p_boq_id);

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
