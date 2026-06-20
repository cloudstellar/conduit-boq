-- =============================================================================
-- Migration 010: Master Catalog Phase 1A - Nullable Versioning
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/master-catalog/01-proposal.md (Revised v26)
--
-- Prerequisites:
-- 1. Run and verify migration 009_master_catalog_p0_containment.sql.
-- 2. Confirm the Phase 0 baseline and logical backup.
-- 3. Confirm there are no duplicate public.price_list.item_code values.
--
-- Purpose:
-- 1. Add catalog version tables and nullable compatibility columns.
-- 2. Seed the existing 2568.0.0 price list version and singleton pointer.
-- 3. Backfill legacy data while the existing application remains compatible.
-- 4. Deploy the full version-aware save_boq_with_routes RPC.
-- 5. Apply read-only catalog grants for authenticated users.
--
-- Phase 1B NOT NULL hardening is intentionally deferred to migration 011.
-- Phase 4 admin catalog functions and triggers are intentionally excluded.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Default privilege hardening and price list versions table
-- -----------------------------------------------------------------------------
BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON TABLES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
DO $default_privileges$
BEGIN
  IF current_user = 'supabase_admin'
     OR pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
      REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
      ON TABLES FROM PUBLIC, anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
      REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated';
  ELSE
    RAISE NOTICE 'Skipping supabase_admin defaults: % is not a member', current_user;
  END IF;
END;
$default_privileges$;

CREATE TABLE IF NOT EXISTS public.price_list_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  major integer NOT NULL CHECK (major >= 0),
  minor integer NOT NULL DEFAULT 0 CHECK (minor >= 0),
  patch integer NOT NULL DEFAULT 0 CHECK (patch >= 0),
  version_string text GENERATED ALWAYS AS (
    major::text || '.' || minor::text || '.' || patch::text
  ) STORED,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  -- Deprecated after Phase 4. The singleton pointer is the source of truth.
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_is_default_active
    CHECK (NOT is_default OR status = 'active'),
  CONSTRAINT uq_major_minor_patch UNIQUE (major, minor, patch)
);

ALTER TABLE public.price_list_versions ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_default_active_version
  ON public.price_list_versions (is_default)
  WHERE is_default = true
    AND status = 'active';

COMMIT;

-- -----------------------------------------------------------------------------
-- 2. Price list audit table
-- -----------------------------------------------------------------------------
BEGIN;

CREATE TABLE IF NOT EXISTS public.price_list_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid
    REFERENCES public.price_list_versions(id) ON DELETE SET NULL,
  item_code text NOT NULL,
  action text NOT NULL
    CHECK (action IN ('update_price', 'add_item', 'delete_item')),
  old_values jsonb,
  new_values jsonb,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_list_audit_logs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Nullable compatibility columns
-- -----------------------------------------------------------------------------
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';

  ALTER TABLE public.price_list
    ADD COLUMN IF NOT EXISTS version_id uuid
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT;

  ALTER TABLE public.boq
    ADD COLUMN IF NOT EXISTS price_list_version_id uuid
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT;

  ALTER TABLE public.boq_items
    ADD COLUMN IF NOT EXISTS category text DEFAULT NULL;
COMMIT;

-- -----------------------------------------------------------------------------
-- 4. Seed the historical 2568.0.0 catalog and singleton pointer
-- -----------------------------------------------------------------------------
INSERT INTO public.price_list_versions (
  major,
  minor,
  patch,
  name,
  status,
  is_default
) VALUES (
  2568,
  0,
  0,
  'บัญชีราคามาตรฐาน ปี 2568 (ประกาศฉบับหลัก)',
  'active',
  true
)
ON CONFLICT ON CONSTRAINT uq_major_minor_patch DO NOTHING;

BEGIN;

CREATE TABLE IF NOT EXISTS public.price_list_default_version (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  version_id uuid NOT NULL
    REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_list_default_version ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read to authenticated"
  ON public.price_list_default_version;
CREATE POLICY "Allow read to authenticated"
  ON public.price_list_default_version
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow write to admin only"
  ON public.price_list_default_version;
CREATE POLICY "Allow write to admin only"
  ON public.price_list_default_version
  FOR ALL TO authenticated
  USING (
    (
      SELECT role
      FROM public.user_profiles
      WHERE id = auth.uid()
        AND status = 'active'
    ) = 'admin'
  )
  WITH CHECK (
    (
      SELECT role
      FROM public.user_profiles
      WHERE id = auth.uid()
        AND status = 'active'
    ) = 'admin'
  );

GRANT SELECT
  ON TABLE public.price_list_default_version
  TO authenticated;

REVOKE INSERT, UPDATE, DELETE
  ON TABLE public.price_list_default_version
  FROM PUBLIC, authenticated, anon;

INSERT INTO public.price_list_default_version (id, version_id)
SELECT true, v.id
FROM public.price_list_versions v
WHERE v.major = 2568
  AND v.minor = 0
  AND v.patch = 0
  AND v.status = 'active'
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- -----------------------------------------------------------------------------
-- 5. Phase 1A trigger helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_delete_default_pointer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RAISE EXCEPTION 'ห้ามลบ singleton row ของ price_list_default_version ให้ UPDATE version_id แทน';
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_delete_default_pointer()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_delete_default_pointer
  ON public.price_list_default_version;
CREATE TRIGGER trigger_prevent_delete_default_pointer
  BEFORE DELETE ON public.price_list_default_version
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_delete_default_pointer();

CREATE OR REPLACE FUNCTION public.validate_default_pointer_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.price_list_versions
    WHERE id = NEW.version_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'pointer ต้องชี้ไปเวอร์ชันที่ status = active เท่านั้น';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.validate_default_pointer_active()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_validate_default_pointer_active
  ON public.price_list_default_version;
CREATE TRIGGER trigger_validate_default_pointer_active
  BEFORE INSERT OR UPDATE ON public.price_list_default_version
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_default_pointer_active();

CREATE OR REPLACE FUNCTION public.check_default_version_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  default_count int;
BEGIN
  SELECT count(*)
  INTO default_count
  FROM public.price_list_default_version dv
  JOIN public.price_list_versions v ON v.id = dv.version_id
  WHERE v.status = 'active'
    AND dv.id = true;

  IF default_count = 0 THEN
    RAISE EXCEPTION 'ต้องมีอย่างน้อยหนึ่งเวอร์ชันที่เป็น active และเป็นค่าเริ่มต้นเสมอ';
  END IF;

  RETURN NULL;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.check_default_version_exists()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_check_default_version_exists
  ON public.price_list_versions;
CREATE TRIGGER trigger_check_default_version_exists
  AFTER UPDATE OR DELETE ON public.price_list_versions
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.check_default_version_exists();

CREATE OR REPLACE FUNCTION public.set_default_price_list_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.price_list_version_id IS NULL THEN
    SELECT dv.version_id
    INTO NEW.price_list_version_id
    FROM public.price_list_default_version dv
    JOIN public.price_list_versions v ON v.id = dv.version_id
    WHERE v.status = 'active'
      AND dv.id = true;

    IF NEW.price_list_version_id IS NULL THEN
      RAISE EXCEPTION 'ไม่พบเวอร์ชันราคากลางเริ่มต้น กรุณาติดต่อผู้ดูแลระบบ';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_default_price_list_version()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_set_default_price_list_version
  ON public.boq;
CREATE TRIGGER trigger_set_default_price_list_version
  BEFORE INSERT ON public.boq
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_price_list_version();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_updated_at()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_set_updated_at
  ON public.price_list_versions;
CREATE TRIGGER trigger_set_updated_at
  BEFORE UPDATE ON public.price_list_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. Historical backfill and version-scoped item code constraint
-- -----------------------------------------------------------------------------
UPDATE public.price_list
SET version_id = (
  SELECT id
  FROM public.price_list_versions
  WHERE version_string = '2568.0.0'
  LIMIT 1
)
WHERE version_id IS NULL;

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';

  ALTER TABLE public.price_list
    DROP CONSTRAINT IF EXISTS price_list_item_code_key;

  ALTER TABLE public.price_list
    ALTER COLUMN version_id SET NOT NULL;

  ALTER TABLE public.price_list
    DROP CONSTRAINT IF EXISTS uq_version_item_code;

  ALTER TABLE public.price_list
    ADD CONSTRAINT uq_version_item_code UNIQUE (version_id, item_code);
COMMIT;

UPDATE public.boq
SET price_list_version_id = (
  SELECT id
  FROM public.price_list_versions
  WHERE version_string = '2568.0.0'
  LIMIT 1
)
WHERE price_list_version_id IS NULL;

UPDATE public.boq_items bi
SET category = pl.category
FROM public.price_list pl
WHERE bi.price_list_id = pl.id
  AND bi.price_list_id IS NOT NULL
  AND bi.category IS NULL;

-- -----------------------------------------------------------------------------
-- 7. Full version-aware BOQ save RPC
-- -----------------------------------------------------------------------------
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
  v_pl_item_name text;
  v_pl_unit text;
  v_pl_material numeric;
  v_pl_labor numeric;
  v_pl_unit_cost numeric;
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
      ELSE
        v_pl_item_name := v_item->>'item_name';
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
        v_pl_item_name,
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
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)
  TO authenticated;

-- -----------------------------------------------------------------------------
-- 8. Catalog RLS and least-privilege grants
-- -----------------------------------------------------------------------------
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';

  ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Allow read to authenticated"
    ON public.price_list_versions;
  CREATE POLICY "Allow read to authenticated"
    ON public.price_list_versions
    FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Allow write to admin only"
    ON public.price_list_versions;
  CREATE POLICY "Allow write to admin only"
    ON public.price_list_versions
    FOR ALL TO authenticated
    USING (
      (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND status = 'active'
      ) = 'admin'
    )
    WITH CHECK (
      (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND status = 'active'
      ) = 'admin'
    );

  DROP POLICY IF EXISTS "Allow public read access"
    ON public.price_list;
  DROP POLICY IF EXISTS "Allow public insert"
    ON public.price_list;
  DROP POLICY IF EXISTS "Allow public update"
    ON public.price_list;
  DROP POLICY IF EXISTS "Allow public delete"
    ON public.price_list;
  -- Current production policy names, verified against pg_policies on 2026-06-01.
  DROP POLICY IF EXISTS "price_list_select"
    ON public.price_list;
  DROP POLICY IF EXISTS "price_list_insert"
    ON public.price_list;
  DROP POLICY IF EXISTS "price_list_update"
    ON public.price_list;
  DROP POLICY IF EXISTS "price_list_delete"
    ON public.price_list;
  DROP POLICY IF EXISTS "Allow select to authenticated"
    ON public.price_list;

  CREATE POLICY "Allow select to authenticated"
    ON public.price_list
    FOR SELECT TO authenticated
    USING (true);

  DROP POLICY IF EXISTS "Allow write to admin only"
    ON public.price_list;
  CREATE POLICY "Allow write to admin only"
    ON public.price_list
    FOR ALL TO authenticated
    USING (
      (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND status = 'active'
      ) = 'admin'
    )
    WITH CHECK (
      (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND status = 'active'
      ) = 'admin'
    );

  DROP POLICY IF EXISTS "Allow read and write audit logs for admin only"
    ON public.price_list_audit_logs;
  DROP POLICY IF EXISTS "Allow read audit logs for admin only"
    ON public.price_list_audit_logs;

  CREATE POLICY "Allow read audit logs for admin only"
    ON public.price_list_audit_logs
    FOR SELECT TO authenticated
    USING (
      (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND status = 'active'
      ) = 'admin'
    );

  REVOKE INSERT, UPDATE, DELETE
    ON TABLE
      public.price_list_versions,
      public.price_list,
      public.price_list_audit_logs
    FROM PUBLIC, authenticated, anon;

  GRANT SELECT ON TABLE public.price_list_versions TO authenticated;
  GRANT SELECT ON TABLE public.price_list TO authenticated;
  GRANT SELECT ON TABLE public.price_list_audit_logs TO authenticated;

  GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.price_list_versions
    TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.price_list
    TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.price_list_audit_logs
    TO service_role;
COMMIT;
