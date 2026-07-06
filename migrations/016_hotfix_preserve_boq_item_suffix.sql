-- =============================================================================
-- Migration 016: Hotfix Preserve BOQ Item Suffix Labels
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: Production issue reported 2026-07-06
--
-- Purpose:
-- 1. Preserve BOQ-specific item labels such as "(Main Duct)", "(Riser)",
--    "(Steel Pole)", and "(Riser Service)" when saving via save_boq_with_routes.
-- 2. Keep catalog-backed unit, price, and category authoritative from price_list.
-- 3. Avoid touching BOQ rows, route rows, item rows, price_list rows, Factor F
--    versions, or Factor F defaults.
--
-- This production hotfix occupies migration number 016 before Master Catalog
-- Phase 4. Phase 4 migrations must be rebased/renumbered to 017+ after this
-- hotfix lands on main.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

CREATE OR REPLACE FUNCTION public.save_boq_with_routes(
  p_boq_id uuid,
  p_boq_data jsonb,
  p_routes jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_route jsonb;
  v_item jsonb;
  v_inserted_route_id uuid;
  v_route_index int := 0;
  v_category text;
  v_target_boq_version uuid;
  v_item_version uuid;
  v_requested_item_name text;
  v_item_name_to_save text;
  v_pl_item_name text;
  v_pl_unit text;
  v_pl_material numeric;
  v_pl_labor numeric;
  v_pl_unit_cost numeric;
  v_allowed_special_suffixes constant text[] := ARRAY[
    ' (Main Duct)',
    ' (Riser)',
    ' (Steel Pole)',
    ' (Riser Service)'
  ];
  v_caller_role text;
  v_caller_status text;
  v_caller_sector uuid;
  v_caller_dept uuid;
  v_boq_created_by uuid;
  v_boq_assigned_to uuid;
  v_boq_sector uuid;
  v_boq_dept uuid;
  v_is_authorized boolean := false;
BEGIN
  SELECT
    price_list_version_id,
    created_by,
    assigned_to,
    sector_id,
    department_id
  INTO
    v_target_boq_version,
    v_boq_created_by,
    v_boq_assigned_to,
    v_boq_sector,
    v_boq_dept
  FROM public.boq
  WHERE id = p_boq_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ไม่พบใบประมาณราคา BOQ ที่ระบุ (boq_id: %)', p_boq_id;
  END IF;

  IF v_target_boq_version IS NULL THEN
    RAISE EXCEPTION 'ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง (boq_id: %)', p_boq_id;
  END IF;

  SELECT role, status, sector_id, department_id
  INTO v_caller_role, v_caller_status, v_caller_sector, v_caller_dept
  FROM public.user_profiles
  WHERE id = auth.uid()
    AND status IN ('active', 'pending');

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'ไม่พบบัญชีผู้ใช้ที่ยังเปิดใช้งานอยู่ในระบบ';
  END IF;

  IF v_boq_created_by IS NULL
    AND v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'ใบงานประวัติศาสตร์แก้ไขได้เฉพาะผู้ดูแลระบบ';
  END IF;

  IF v_caller_status = 'pending' THEN
    IF auth.uid() = v_boq_created_by THEN
      v_is_authorized := true;
    END IF;
  ELSIF v_caller_role = 'admin' THEN
    v_is_authorized := true;
  ELSIF v_caller_role = 'staff' THEN
    IF auth.uid() = v_boq_created_by
      OR auth.uid() = v_boq_assigned_to THEN
      v_is_authorized := true;
    END IF;
  ELSIF v_caller_role = 'sector_manager' THEN
    IF v_caller_sector IS NOT NULL
      AND v_caller_sector = v_boq_sector THEN
      v_is_authorized := true;
    END IF;
  ELSIF v_caller_role = 'dept_manager' THEN
    IF v_caller_dept IS NOT NULL
      AND v_caller_dept = v_boq_dept THEN
      v_is_authorized := true;
    END IF;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'คุณไม่มีสิทธิ์แก้ไขใบประมาณราคานี้';
  END IF;

  UPDATE public.boq
  SET
    estimator_name = p_boq_data->>'estimator_name',
    document_date = (p_boq_data->>'document_date')::date,
    project_name = p_boq_data->>'project_name',
    route = p_boq_data->>'route',
    construction_area = p_boq_data->>'construction_area',
    department = p_boq_data->>'department',
    total_material_cost = (p_boq_data->>'total_material_cost')::numeric,
    total_labor_cost = (p_boq_data->>'total_labor_cost')::numeric,
    total_cost = (p_boq_data->>'total_cost')::numeric,
    factor_f = (p_boq_data->>'factor_f')::numeric,
    total_with_factor_f = (p_boq_data->>'total_with_factor_f')::numeric,
    total_with_vat = (p_boq_data->>'total_with_vat')::numeric,
    factor_f_raw = (p_boq_data->>'factor_f_raw')::numeric,
    factor_f_lower_cost = (p_boq_data->>'factor_f_lower_cost')::numeric,
    factor_f_upper_cost = (p_boq_data->>'factor_f_upper_cost')::numeric,
    factor_f_lower_value = (p_boq_data->>'factor_f_lower_value')::numeric,
    factor_f_upper_value = (p_boq_data->>'factor_f_upper_value')::numeric,
    updated_at = now()
  WHERE id = p_boq_id;

  DELETE FROM public.boq_items
  WHERE boq_id = p_boq_id;

  DELETE FROM public.boq_routes
  WHERE boq_id = p_boq_id;

  FOR v_route IN
    SELECT *
    FROM jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO public.boq_routes (
      boq_id,
      route_order,
      route_name,
      route_description,
      construction_area,
      total_material_cost,
      total_labor_cost,
      total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::numeric,
      (v_route->>'total_labor_cost')::numeric,
      (v_route->>'total_cost')::numeric
    )
    RETURNING id INTO v_inserted_route_id;

    FOR v_item IN
      SELECT *
      FROM jsonb_array_elements(v_route->'items')
    LOOP
      IF (v_item->>'price_list_id') IS NOT NULL THEN
        SELECT version_id
        INTO v_item_version
        FROM public.price_list
        WHERE id = (v_item->>'price_list_id')::uuid;

        IF v_item_version IS DISTINCT FROM v_target_boq_version THEN
          RAISE EXCEPTION 'รายการ % ไม่อยู่ในเวอร์ชันราคากลางของ BOQ นี้',
            v_item->>'price_list_id';
        END IF;

        SELECT
          item_name,
          unit,
          material_cost,
          labor_cost,
          unit_cost,
          category
        INTO
          v_pl_item_name,
          v_pl_unit,
          v_pl_material,
          v_pl_labor,
          v_pl_unit_cost,
          v_category
        FROM public.price_list
        WHERE id = (v_item->>'price_list_id')::uuid;

        IF v_pl_item_name IS NULL THEN
          RAISE EXCEPTION 'price_list_id % ไม่พบในฐานข้อมูล',
            v_item->>'price_list_id';
        END IF;

        v_requested_item_name := nullif(btrim(v_item->>'item_name'), '');

        IF v_requested_item_name IS NULL THEN
          v_item_name_to_save := v_pl_item_name;
        ELSIF v_requested_item_name = v_pl_item_name THEN
          v_item_name_to_save := v_requested_item_name;
        ELSIF EXISTS (
          SELECT 1
          FROM unnest(v_allowed_special_suffixes) AS allowed_suffix(suffix)
          WHERE v_requested_item_name = v_pl_item_name || allowed_suffix.suffix
        ) THEN
          v_item_name_to_save := v_requested_item_name;
        ELSE
          RAISE EXCEPTION 'รายการ % มีชื่อไม่ตรงกับบัญชีราคากลางของ BOQ นี้',
            v_item->>'price_list_id';
        END IF;
      ELSE
        v_item_name_to_save := v_item->>'item_name';
        v_pl_unit := v_item->>'unit';
        v_pl_material := (v_item->>'material_cost_per_unit')::numeric;
        v_pl_labor := (v_item->>'labor_cost_per_unit')::numeric;
        v_pl_unit_cost := (v_item->>'unit_cost')::numeric;
        v_category := v_item->>'category';
      END IF;

      INSERT INTO public.boq_items (
        boq_id,
        route_id,
        item_order,
        price_list_id,
        item_name,
        quantity,
        unit,
        material_cost_per_unit,
        labor_cost_per_unit,
        unit_cost,
        total_material_cost,
        total_labor_cost,
        total_cost,
        remarks,
        category
      ) VALUES (
        p_boq_id,
        v_inserted_route_id,
        (v_item->>'item_order')::int,
        (v_item->>'price_list_id')::uuid,
        v_item_name_to_save,
        (v_item->>'quantity')::numeric,
        v_pl_unit,
        v_pl_material,
        v_pl_labor,
        v_pl_unit_cost,
        v_pl_material * (v_item->>'quantity')::numeric,
        v_pl_labor * (v_item->>'quantity')::numeric,
        v_pl_unit_cost * (v_item->>'quantity')::numeric,
        v_item->>'remarks',
        v_category
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'boq_id', p_boq_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)
  TO authenticated;

DO $postcondition$
DECLARE
  v_definition text;
  v_is_security_definer boolean;
  v_config text[];
BEGIN
  SELECT
    pg_get_functiondef(p.oid),
    p.prosecdef,
    COALESCE(p.proconfig, ARRAY[]::text[])
  INTO
    v_definition,
    v_is_security_definer,
    v_config
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.oid = 'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure;

  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: save_boq_with_routes was not found';
  END IF;

  IF NOT v_is_security_definer THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: save_boq_with_routes is not SECURITY DEFINER';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM unnest(v_config) AS config
    WHERE config IN ('search_path=', 'search_path=""')
  ) THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: save_boq_with_routes search_path is not pinned';
  END IF;

  IF has_function_privilege(
    'anon',
    'public.save_boq_with_routes(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: anon can execute save_boq_with_routes';
  END IF;

  IF NOT has_function_privilege(
    'authenticated',
    'public.save_boq_with_routes(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: authenticated cannot execute save_boq_with_routes';
  END IF;

  IF v_definition NOT LIKE '%v_allowed_special_suffixes%'
    OR v_definition NOT LIKE '%v_item_name_to_save%'
    OR v_definition NOT LIKE '%v_requested_item_name = v_pl_item_name || allowed_suffix.suffix%'
    OR v_definition NOT LIKE '%v_pl_material%'
    OR v_definition NOT LIKE '%v_pl_labor%'
    OR v_definition NOT LIKE '%v_pl_unit_cost%'
  THEN
    RAISE EXCEPTION 'Hotfix 016 postcondition failed: suffix preservation or catalog-cost authority logic is missing';
  END IF;
END;
$postcondition$;

COMMIT;
