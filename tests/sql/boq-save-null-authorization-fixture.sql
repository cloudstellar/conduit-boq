\set ON_ERROR_STOP on

-- SYNTHETIC ISOLATED FIXTURE ONLY. Never run on Production or an existing app DB.
-- Use a fresh PG17 database named conduit_boq_save_null_auth_<suffix>, ideally
-- in a disposable container with no network. This is NOT a Supabase bootstrap
-- and does not replay migrations 027, 028, or 029.
-- The Save definition below is the exact read-only capture from 2026-09-08
-- 01:48:01.443092 UTC. Source/body identity was checked against immutable 027.
-- Everything else is minimal synthetic test support, not full Production parity.
-- Auth is a transaction-local claim stub, not a real user/session/JWT service.
BEGIN;
DO $isolated_empty_database_only$
BEGIN
  IF current_database() !~ '^conduit_boq_save_null_auth_[a-z0-9_]+$'
     OR session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION 'A fresh explicitly named isolated postgres test database is required';
  END IF;
  IF to_regclass('public.boq') IS NOT NULL
     OR to_regclass('public.user_profiles') IS NOT NULL
     OR to_regprocedure('auth.uid()') IS NOT NULL THEN
    RAISE EXCEPTION 'Refusing to overwrite an existing database fixture';
  END IF;
END;
$isolated_empty_database_only$;

DO $synthetic_api_roles$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END;
$synthetic_api_roles$;

CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $uid$
  SELECT NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), '')::uuid;
$uid$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;

CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')),
  -- 027 explicitly establishes this NOT NULL/default contract; do not reuse the
  -- older bootstrap's nullable status shape for this authorization regression.
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active', 'pending', 'inactive', 'suspended')),
  sector_id uuid,
  department_id uuid
);
CREATE TABLE public.price_list (
  id uuid PRIMARY KEY,
  version_id uuid NOT NULL,
  item_name text NOT NULL,
  unit text NOT NULL,
  material_cost numeric(12,2) NOT NULL,
  labor_cost numeric(12,2) NOT NULL,
  unit_cost numeric(12,2) NOT NULL,
  category text
);
CREATE TABLE public.boq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimator_name text NOT NULL,
  document_date date NOT NULL DEFAULT CURRENT_DATE,
  project_name text NOT NULL,
  route text,
  construction_area text,
  department text,
  total_material_cost numeric(15,2) DEFAULT 0,
  total_labor_cost numeric(15,2) DEFAULT 0,
  total_cost numeric(15,2) DEFAULT 0,
  status varchar(20) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  assigned_to uuid,
  org_id uuid,
  department_id uuid,
  sector_id uuid,
  price_list_version_id uuid NOT NULL,
  factor_reference_version_id uuid,
  factor_f numeric(10,4),
  total_with_factor_f numeric(15,2) DEFAULT 0,
  total_with_vat numeric(15,2) DEFAULT 0,
  factor_f_raw numeric,
  factor_f_lower_cost numeric,
  factor_f_upper_cost numeric,
  factor_f_lower_value numeric,
  factor_f_upper_value numeric
);
CREATE TABLE public.boq_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.boq(id) ON DELETE CASCADE,
  route_order integer NOT NULL DEFAULT 1,
  route_name text NOT NULL,
  route_description text,
  construction_area text,
  total_material_cost numeric(15,2) DEFAULT 0,
  total_labor_cost numeric(15,2) DEFAULT 0,
  total_cost numeric(15,2) DEFAULT 0,
  cost_with_factor_f numeric(15,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (boq_id, route_order)
);
CREATE TABLE public.boq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.boq(id) ON DELETE CASCADE,
  route_id uuid REFERENCES public.boq_routes(id) ON DELETE CASCADE,
  item_order integer NOT NULL,
  price_list_id uuid REFERENCES public.price_list(id),
  item_name text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  unit varchar(50) NOT NULL,
  material_cost_per_unit numeric(12,2) DEFAULT 0,
  labor_cost_per_unit numeric(12,2) DEFAULT 0,
  unit_cost numeric(12,2) DEFAULT 0,
  total_material_cost numeric(15,2) DEFAULT 0,
  total_labor_cost numeric(15,2) DEFAULT 0,
  total_cost numeric(15,2) DEFAULT 0,
  remarks text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deliberately deny direct API-table access through RLS, while permitting the
-- SELECT privilege needed to observe zero visible rows. This isolates the RPC
-- predicate: its SECURITY DEFINER postgres owner bypasses this synthetic RLS.
-- These are not reproductions of the full Production policy set.
ALTER TABLE public.boq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boq_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.boq, public.boq_routes, public.boq_items TO authenticated;

-- Exact captured predecessor definition; do not edit this body when fixing it.
CREATE OR REPLACE FUNCTION public.save_boq_with_routes(p_boq_id uuid, p_boq_data jsonb, p_routes jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
 SET lock_timeout TO '5s'
 SET statement_timeout TO '30s'
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
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'authentication required';
  END IF;

  -- P49 CONTRACT: deterministic-lock-order (actor profile before BOQ).
  SELECT p.role, p.status, p.sector_id, p.department_id
  INTO v_caller_role, v_caller_status, v_caller_sector, v_caller_dept
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
  FOR UPDATE;

  IF NOT FOUND OR v_caller_status <> 'active'
     OR v_caller_role NOT IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active profile is required';
  END IF;

  SELECT
    b.price_list_version_id,
    b.created_by,
    b.assigned_to,
    b.sector_id,
    b.department_id
  INTO
    v_target_boq_version,
    v_boq_created_by,
    v_boq_assigned_to,
    v_boq_sector,
    v_boq_dept
  FROM public.boq b
  WHERE b.id = p_boq_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ไม่พบใบประมาณราคา BOQ ที่ระบุ (boq_id: %)', p_boq_id;
  END IF;
  IF v_target_boq_version IS NULL THEN
    RAISE EXCEPTION 'ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง (boq_id: %)', p_boq_id;
  END IF;
  IF v_boq_created_by IS NULL AND v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'ใบงานประวัติศาสตร์แก้ไขได้เฉพาะผู้ดูแลระบบ';
  END IF;

  IF v_caller_role = 'admin' THEN
    v_is_authorized := true;
  ELSIF v_caller_role = 'staff' THEN
    v_is_authorized := (
      (SELECT auth.uid()) = v_boq_created_by
      OR (SELECT auth.uid()) = v_boq_assigned_to
    );
  ELSIF v_caller_role = 'sector_manager' THEN
    v_is_authorized := (
      v_caller_sector IS NOT NULL AND v_caller_sector = v_boq_sector
    );
  ELSIF v_caller_role = 'dept_manager' THEN
    v_is_authorized := (
      v_caller_dept IS NOT NULL AND v_caller_dept = v_boq_dept
    );
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'คุณไม่มีสิทธิ์แก้ไขใบประมาณราคานี้';
  END IF;

  UPDATE public.boq
  SET estimator_name = p_boq_data->>'estimator_name',
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

  DELETE FROM public.boq_items WHERE boq_id = p_boq_id;
  DELETE FROM public.boq_routes WHERE boq_id = p_boq_id;

  FOR v_route IN SELECT * FROM pg_catalog.jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO public.boq_routes (
      boq_id, route_order, route_name, route_description, construction_area,
      total_material_cost, total_labor_cost, total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::numeric,
      (v_route->>'total_labor_cost')::numeric,
      (v_route->>'total_cost')::numeric
    ) RETURNING id INTO v_inserted_route_id;

    FOR v_item IN
      SELECT * FROM pg_catalog.jsonb_array_elements(v_route->'items')
    LOOP
      IF (v_item->>'price_list_id') IS NOT NULL THEN
        SELECT pl.version_id
        INTO v_item_version
        FROM public.price_list pl
        WHERE pl.id = (v_item->>'price_list_id')::uuid;

        IF v_item_version IS DISTINCT FROM v_target_boq_version THEN
          RAISE EXCEPTION 'รายการ % ไม่อยู่ในเวอร์ชันราคากลางของ BOQ นี้',
            v_item->>'price_list_id';
        END IF;

        SELECT
          pl.item_name, pl.unit, pl.material_cost, pl.labor_cost,
          pl.unit_cost, pl.category
        INTO
          v_pl_item_name, v_pl_unit, v_pl_material, v_pl_labor,
          v_pl_unit_cost, v_category
        FROM public.price_list pl
        WHERE pl.id = (v_item->>'price_list_id')::uuid;

        IF v_pl_item_name IS NULL THEN
          RAISE EXCEPTION 'price_list_id % ไม่พบในฐานข้อมูล',
            v_item->>'price_list_id';
        END IF;

        v_requested_item_name := nullif(
          pg_catalog.btrim(v_item->>'item_name'), ''
        );

        IF v_requested_item_name IS NULL THEN
          v_item_name_to_save := v_pl_item_name;
        ELSIF v_requested_item_name = v_pl_item_name THEN
          v_item_name_to_save := v_requested_item_name;
        ELSIF EXISTS (
          SELECT 1
          FROM pg_catalog.unnest(v_allowed_special_suffixes) AS allowed_suffix(suffix)
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
        boq_id, route_id, item_order, price_list_id, item_name, quantity, unit,
        material_cost_per_unit, labor_cost_per_unit, unit_cost,
        total_material_cost, total_labor_cost, total_cost, remarks, category
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

  RETURN pg_catalog.jsonb_build_object('success', true, 'boq_id', p_boq_id);
END;
$function$;

ALTER FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb) TO authenticated;

DO $exact_captured_predecessor$
BEGIN
  IF encode(sha256(convert_to(pg_get_functiondef(
       'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure), 'UTF8')), 'hex')
     <> 'aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9' THEN
    RAISE EXCEPTION 'Synthetic fixture does not contain the exact captured predecessor definition';
  END IF;
END;
$exact_captured_predecessor$;
COMMIT;
