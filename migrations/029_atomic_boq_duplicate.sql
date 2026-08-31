-- =============================================================================
-- Migration 029: Atomic BOQ Duplicate
-- =============================================================================
-- Forward-only feature migration after immutable migrations 027 and 028.
--
-- Purpose:
-- 1. Restore BOQ copy through one idempotent database transaction.
-- 2. Preserve the source Catalog, item prices, quantities, and Factor F
--    snapshot for ordinary, version-bound BOQs.
-- 3. Preserve Catalog/items/prices but bind an explicitly selected active
--    Factor F version and reset Factor F calculation snapshots only for
--    eligible legacy (unbound) BOQs.
-- 4. Keep current-active authorization, source visibility, ownership, graph
--    validation, deterministic locking, and RPC ACL enforcement in PostgreSQL.
--
-- This migration never reprices/rebases a BOQ, never changes the source BOQ,
-- and never edits or replays migrations 027/028.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL idle_in_transaction_session_timeout = '90s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:atomic-boq-duplicate-v1', 0)
);

-- -----------------------------------------------------------------------------
-- 1. Exact predecessor and runtime-shape preflight
-- -----------------------------------------------------------------------------
DO $atomic_boq_duplicate_preflight$
DECLARE
  v_latest_version text;
  v_latest_name text;
  v_missing_columns integer;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: session/current user must be postgres (got %/%)',
      session_user,
      current_user;
  END IF;

  IF to_regrole('anon') IS NULL
     OR to_regrole('authenticated') IS NULL
     OR to_regrole('service_role') IS NULL THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: required Supabase API roles are missing';
  END IF;

  SELECT migration.version, migration.name
  INTO v_latest_version, v_latest_name
  FROM supabase_migrations.schema_migrations migration
  ORDER BY migration.version DESC
  LIMIT 1;

  IF v_latest_version IS DISTINCT FROM '20260828070433'
     OR v_latest_name IS DISTINCT FROM 'master_catalog_admin_gate_projection' THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: expected exact migration 028 predecessor, got %/%',
      v_latest_version,
      v_latest_name;
  END IF;

  IF to_regnamespace('private') IS NULL
     OR to_regclass('public.boq') IS NULL
     OR to_regclass('public.boq_routes') IS NULL
     OR to_regclass('public.boq_items') IS NULL
     OR to_regclass('public.price_list') IS NULL
     OR to_regclass('public.price_list_versions') IS NULL
     OR to_regclass('public.factor_reference_versions') IS NULL
     OR to_regclass('public.factor_reference_rows') IS NULL
     OR to_regclass('public.user_profiles') IS NULL
     OR to_regprocedure('private.p49_current_profile_active()') IS NULL
     OR to_regprocedure('public.get_my_catalog_admin_gate()') IS NULL THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: required post-028 objects are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc function_row
    WHERE function_row.oid =
      to_regprocedure('private.p49_current_profile_active()')
      AND pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
      AND function_row.prosecdef
      AND function_row.provolatile = 's'
      AND function_row.proconfig IS NOT DISTINCT FROM
        ARRAY['search_path=""']::text[]
      AND pg_catalog.encode(
        pg_catalog.sha256(
          pg_catalog.convert_to(function_row.prosrc, 'UTF8')
        ),
        'hex'
      ) = 'bbfaa7c54c6c149cd3a29f4cb62d3a7bfbd19a25dc48a831e37016e220e18079'
  ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: active-profile helper posture drifted';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc function_row
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        function_row.proacl,
        pg_catalog.acldefault('f', function_row.proowner)
      )
    ) privilege
    WHERE function_row.oid =
      to_regprocedure('private.p49_current_profile_active()')
      AND privilege.privilege_type = 'EXECUTE'
      AND privilege.grantee NOT IN (
        function_row.proowner,
        'authenticated'::regrole::oid
      )
  )
     OR NOT pg_catalog.has_function_privilege(
       'authenticated',
       'private.p49_current_profile_active()',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: active-profile helper ACL drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace namespace_row
    WHERE namespace_row.nspname = 'private'
      AND pg_catalog.pg_get_userbyid(namespace_row.nspowner) = 'postgres'
  )
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.pg_namespace namespace_row
       CROSS JOIN LATERAL pg_catalog.aclexplode(
         COALESCE(
           namespace_row.nspacl,
           pg_catalog.acldefault('n', namespace_row.nspowner)
         )
       ) privilege
       WHERE namespace_row.nspname = 'private'
         AND privilege.privilege_type IN ('USAGE', 'CREATE')
         AND privilege.grantee NOT IN (
           namespace_row.nspowner,
           'authenticated'::regrole::oid,
           'service_role'::regrole::oid
         )
     )
     OR pg_catalog.has_schema_privilege('anon', 'private', 'USAGE')
     OR pg_catalog.has_schema_privilege('anon', 'private', 'CREATE')
     OR NOT pg_catalog.has_schema_privilege(
       'authenticated', 'private', 'USAGE'
     )
     OR pg_catalog.has_schema_privilege(
       'authenticated', 'private', 'CREATE'
     )
     OR NOT pg_catalog.has_schema_privilege(
       'service_role', 'private', 'USAGE'
     )
     OR pg_catalog.has_schema_privilege(
       'service_role', 'private', 'CREATE'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: private-schema owner or ACL drifted';
  END IF;

  IF to_regclass('private.boq_copy_requests') IS NOT NULL
     OR to_regprocedure('private.boq_copy_graph_sha256(uuid,boolean)') IS NOT NULL
     OR to_regprocedure(
       'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)'
     ) IS NOT NULL THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: migration 029 objects already exist';
  END IF;

  WITH required_columns(table_name, column_name) AS (
    VALUES
      ('boq', 'id'),
      ('boq', 'estimator_name'),
      ('boq', 'document_date'),
      ('boq', 'project_name'),
      ('boq', 'route'),
      ('boq', 'construction_area'),
      ('boq', 'department'),
      ('boq', 'total_material_cost'),
      ('boq', 'total_labor_cost'),
      ('boq', 'total_cost'),
      ('boq', 'factor_f'),
      ('boq', 'factor_f_raw'),
      ('boq', 'factor_f_lower_cost'),
      ('boq', 'factor_f_upper_cost'),
      ('boq', 'factor_f_lower_value'),
      ('boq', 'factor_f_upper_value'),
      ('boq', 'total_with_factor_f'),
      ('boq', 'total_with_vat'),
      ('boq', 'price_list_version_id'),
      ('boq', 'factor_reference_version_id'),
      ('boq', 'status'),
      ('boq', 'created_by'),
      ('boq', 'assigned_to'),
      ('boq', 'org_id'),
      ('boq', 'department_id'),
      ('boq', 'sector_id'),
      ('boq', 'updated_at'),
      ('boq_routes', 'id'),
      ('boq_routes', 'boq_id'),
      ('boq_routes', 'route_order'),
      ('boq_routes', 'route_name'),
      ('boq_routes', 'route_description'),
      ('boq_routes', 'construction_area'),
      ('boq_routes', 'total_material_cost'),
      ('boq_routes', 'total_labor_cost'),
      ('boq_routes', 'total_cost'),
      ('boq_routes', 'cost_with_factor_f'),
      ('boq_items', 'id'),
      ('boq_items', 'boq_id'),
      ('boq_items', 'route_id'),
      ('boq_items', 'item_order'),
      ('boq_items', 'price_list_id'),
      ('boq_items', 'item_name'),
      ('boq_items', 'quantity'),
      ('boq_items', 'unit'),
      ('boq_items', 'material_cost_per_unit'),
      ('boq_items', 'labor_cost_per_unit'),
      ('boq_items', 'unit_cost'),
      ('boq_items', 'total_material_cost'),
      ('boq_items', 'total_labor_cost'),
      ('boq_items', 'total_cost'),
      ('boq_items', 'remarks'),
      ('boq_items', 'category'),
      ('price_list', 'id'),
      ('price_list', 'version_id'),
      ('price_list', 'item_name'),
      ('price_list', 'unit'),
      ('price_list', 'material_cost'),
      ('price_list', 'labor_cost'),
      ('price_list', 'unit_cost'),
      ('price_list', 'category'),
      ('price_list_versions', 'id'),
      ('price_list_versions', 'status'),
      ('factor_reference_versions', 'id'),
      ('factor_reference_versions', 'version_string'),
      ('factor_reference_versions', 'status'),
      ('factor_reference_versions', 'source_reference'),
      ('factor_reference_versions', 'approval_reference'),
      ('factor_reference_versions', 'vat_percent'),
      ('factor_reference_versions', 'published_at'),
      ('factor_reference_versions', 'row_count'),
      ('factor_reference_versions', 'dataset_hash'),
      ('factor_reference_rows', 'version_id'),
      ('factor_reference_rows', 'cost_million'),
      ('factor_reference_rows', 'operation_percent'),
      ('factor_reference_rows', 'interest_percent'),
      ('factor_reference_rows', 'profit_percent'),
      ('factor_reference_rows', 'total_expense_percent'),
      ('factor_reference_rows', 'factor'),
      ('factor_reference_rows', 'vat_percent'),
      ('factor_reference_rows', 'factor_f'),
      ('factor_reference_rows', 'factor_f_rain_1'),
      ('factor_reference_rows', 'factor_f_rain_2'),
      ('user_profiles', 'id'),
      ('user_profiles', 'role'),
      ('user_profiles', 'status'),
      ('user_profiles', 'org_id'),
      ('user_profiles', 'department_id'),
      ('user_profiles', 'sector_id'),
      ('user_profiles', 'title'),
      ('user_profiles', 'first_name'),
      ('user_profiles', 'last_name'),
      ('user_profiles', 'email')
  )
  SELECT count(*)::integer
  INTO v_missing_columns
  FROM required_columns required
  LEFT JOIN information_schema.columns actual
    ON actual.table_schema = 'public'
   AND actual.table_name = required.table_name
   AND actual.column_name = required.column_name
  WHERE actual.column_name IS NULL;

  IF v_missing_columns <> 0 THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: % required source columns are missing',
      v_missing_columns;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class relation_row
    WHERE relation_row.oid = 'public.boq'::regclass
      AND relation_row.relrowsecurity
  )
     OR (
       SELECT count(*)
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
     ) <> 5
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
         AND policy.polname NOT IN (
           'boq_select',
           'boq_insert',
           'boq_update',
           'boq_delete',
           'p49_boq_current_active'
         )
     )
     OR NOT EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
         AND policy.polname = 'boq_select'
         AND policy.polcmd = 'r'
         AND policy.polpermissive
         AND policy.polroles = ARRAY[
           'authenticated'::regrole::oid
         ]
         AND pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(
               COALESCE(
                 pg_catalog.pg_get_expr(policy.polqual, policy.polrelid),
                 ''
               ) || E'\n' || COALESCE(
                 pg_catalog.pg_get_expr(policy.polwithcheck, policy.polrelid),
                 ''
               ),
               'UTF8'
             )
           ),
           'hex'
         ) = 'f615d1347a593816b0e70ac2a8a7e3836b2ad8be7e50ef08e1f95a342b26e640'
     )
     OR NOT EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
        AND policy.polname = 'boq_insert'
         AND policy.polcmd = 'a'
         AND policy.polpermissive
         AND policy.polroles = ARRAY[
           'authenticated'::regrole::oid
         ]
         AND pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(
               COALESCE(
                 pg_catalog.pg_get_expr(policy.polqual, policy.polrelid),
                 ''
               ) || E'\n' || COALESCE(
                 pg_catalog.pg_get_expr(policy.polwithcheck, policy.polrelid),
                 ''
               ),
               'UTF8'
             )
           ),
           'hex'
         ) = 'e5feef33dc014eadcf0502618c7d2edcbd62c53b38a5f5660d90b9cc9037858c'
     )
     OR NOT EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
         AND policy.polname = 'boq_update'
         AND policy.polcmd = 'w'
         AND policy.polpermissive
         AND policy.polroles = ARRAY[
           'authenticated'::regrole::oid
         ]
     )
     OR NOT EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
         AND policy.polname = 'boq_delete'
         AND policy.polcmd = 'd'
         AND policy.polpermissive
         AND policy.polroles = ARRAY[
           'authenticated'::regrole::oid
         ]
     )
     OR NOT EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policy policy
       WHERE policy.polrelid = 'public.boq'::regclass
         AND policy.polname = 'p49_boq_current_active'
         AND policy.polcmd = '*'
         AND NOT policy.polpermissive
         AND policy.polroles = ARRAY[
           'authenticated'::regrole::oid
         ]
         AND pg_catalog.encode(
           pg_catalog.sha256(
             pg_catalog.convert_to(
               COALESCE(
                 pg_catalog.pg_get_expr(policy.polqual, policy.polrelid),
                 ''
               ) || E'\n' || COALESCE(
                 pg_catalog.pg_get_expr(policy.polwithcheck, policy.polrelid),
                 ''
               ),
               'UTF8'
             )
           ),
           'hex'
         ) = '80b240149ece218e9fce4bbf8e7a4ad6aa2cf62dcc0eb2c6edc9765f71989655'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate preflight blocked: BOQ RLS policy posture drifted';
  END IF;
END;
$atomic_boq_duplicate_preflight$;

-- -----------------------------------------------------------------------------
-- 2. Private idempotency ledger
-- -----------------------------------------------------------------------------
CREATE TABLE private.boq_copy_requests (
  actor_id uuid NOT NULL,
  request_id uuid NOT NULL,
  source_boq_id uuid NOT NULL,
  expected_source_updated_at timestamptz NOT NULL,
  mode text NOT NULL CHECK (mode IN ('preserve', 'select_factor')),
  requested_factor_reference_version_id uuid,
  source_graph_sha256 text NOT NULL
    CHECK (source_graph_sha256 ~ '^[0-9a-f]{64}$'),
  result_boq_id uuid NOT NULL,
  result_factor_reference_version_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.statement_timestamp(),
  PRIMARY KEY (actor_id, request_id),
  UNIQUE (result_boq_id),
  CHECK (
    (mode = 'preserve' AND requested_factor_reference_version_id IS NULL)
    OR
    (mode = 'select_factor' AND requested_factor_reference_version_id IS NOT NULL)
  )
);

ALTER TABLE private.boq_copy_requests OWNER TO postgres;
ALTER TABLE private.boq_copy_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.boq_copy_requests
  FROM PUBLIC, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. Canonical semantic fingerprint for a BOQ route/item graph
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.boq_copy_graph_sha256(
  p_boq_id uuid,
  p_reset_factor_totals boolean
) RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        pg_catalog.jsonb_build_object(
          'routes', COALESCE((
            SELECT pg_catalog.jsonb_agg(
              route_payload.payload
              ORDER BY route_payload.payload::text
            )
            FROM (
              SELECT pg_catalog.jsonb_build_object(
                'routeOrder', route_row.route_order,
                'routeName', route_row.route_name,
                'routeDescription', route_row.route_description,
                'constructionArea', route_row.construction_area,
                'totalMaterialCost', route_row.total_material_cost,
                'totalLaborCost', route_row.total_labor_cost,
                'totalCost', route_row.total_cost,
                'costWithFactorF', CASE
                  -- jsonb text preserves numeric scale; match the destination
                  -- numeric(15,2) column so selected-Factor fingerprints do
                  -- not compare source JSON `0` against destination `0.00`.
                  WHEN p_reset_factor_totals THEN 0::numeric(15, 2)
                  ELSE route_row.cost_with_factor_f
                END
              ) AS payload
              FROM public.boq_routes route_row
              WHERE route_row.boq_id = p_boq_id
            ) route_payload
          ), '[]'::jsonb),
          'items', COALESCE((
            SELECT pg_catalog.jsonb_agg(
              item_payload.payload
              ORDER BY item_payload.payload::text
            )
            FROM (
              SELECT pg_catalog.jsonb_build_object(
                'routeOrder', route_row.route_order,
                'itemOrder', item_row.item_order,
                'priceListId', item_row.price_list_id,
                'itemName', item_row.item_name,
                'quantity', item_row.quantity,
                'unit', item_row.unit,
                'materialCostPerUnit', item_row.material_cost_per_unit,
                'laborCostPerUnit', item_row.labor_cost_per_unit,
                'unitCost', item_row.unit_cost,
                'totalMaterialCost', item_row.total_material_cost,
                'totalLaborCost', item_row.total_labor_cost,
                'totalCost', item_row.total_cost,
                'remarks', item_row.remarks,
                'category', item_row.category
              ) AS payload
              FROM public.boq_items item_row
              LEFT JOIN public.boq_routes route_row
                ON route_row.id = item_row.route_id
               AND route_row.boq_id = item_row.boq_id
              WHERE item_row.boq_id = p_boq_id
            ) item_payload
          ), '[]'::jsonb)
        )::text,
        'UTF8'
      )
    ),
    'hex'
  );
$function$;

ALTER FUNCTION private.boq_copy_graph_sha256(uuid, boolean)
  OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION private.boq_copy_graph_sha256(uuid, boolean)
  FROM PUBLIC, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. One public, idempotent, atomic copy RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.duplicate_boq_atomic(
  p_source_boq_id uuid,
  p_request_id uuid,
  p_expected_source_updated_at timestamptz,
  p_mode text DEFAULT 'preserve',
  p_factor_reference_version_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
SET lock_timeout = '5s'
SET statement_timeout = '30s'
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_actor_role text;
  v_actor_status text;
  v_actor_org_id uuid;
  v_actor_department_id uuid;
  v_actor_sector_id uuid;
  v_actor_title text;
  v_actor_first_name text;
  v_actor_last_name text;
  v_actor_email text;
  v_estimator_name text;
  v_mode text := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_mode, '')));
  v_source public.boq%ROWTYPE;
  v_result public.boq%ROWTYPE;
  v_existing private.boq_copy_requests%ROWTYPE;
  v_target_factor_version_id uuid;
  v_target_factor_version_string text;
  v_target_factor_dataset_hash text;
  v_actual_factor_dataset_hash text;
  v_target_factor_vat_percent numeric;
  v_expected_factor_lower_cost numeric;
  v_expected_factor_upper_cost numeric;
  v_expected_factor_lower_value numeric;
  v_expected_factor_upper_value numeric;
  v_expected_factor_raw numeric;
  v_expected_factor_rows integer;
  v_actual_factor_rows integer;
  v_bad_item_route_count integer;
  v_bad_catalog_item_count integer;
  v_bad_catalog_snapshot_count integer;
  v_bad_item_math_count integer;
  v_bad_route_math_count integer;
  v_bad_header_math boolean;
  v_bad_factor_snapshot boolean;
  v_source_route_count integer;
  v_source_item_count integer;
  v_inserted_route_count integer := 0;
  v_inserted_item_count integer := 0;
  v_source_graph_before text;
  v_source_graph_after text;
  v_result_graph text;
  v_route public.boq_routes%ROWTYPE;
  v_new_route_id uuid;
  v_route_map jsonb := '{}'::jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'authentication required';
  END IF;

  IF p_source_boq_id IS NULL
     OR p_request_id IS NULL
     OR p_expected_source_updated_at IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'source BOQ id, request id, and expected source write token are required';
  END IF;

  IF v_mode NOT IN ('preserve', 'select_factor') THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'copy mode must be preserve or select_factor';
  END IF;

  IF (v_mode = 'preserve' AND p_factor_reference_version_id IS NOT NULL)
     OR (v_mode = 'select_factor' AND p_factor_reference_version_id IS NULL) THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'Factor F version argument does not match the requested copy mode';
  END IF;

  -- Deterministic lock order starts with the current actor profile, matching
  -- migration 027's current-active-first BOQ mutation contract.
  SELECT
    profile.role,
    profile.status,
    profile.org_id,
    profile.department_id,
    profile.sector_id,
    profile.title,
    profile.first_name,
    profile.last_name,
    profile.email
  INTO
    v_actor_role,
    v_actor_status,
    v_actor_org_id,
    v_actor_department_id,
    v_actor_sector_id,
    v_actor_title,
    v_actor_first_name,
    v_actor_last_name,
    v_actor_email
  FROM public.user_profiles profile
  WHERE profile.id = v_actor_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_actor_status <> 'active'
     OR v_actor_role NOT IN (
       'admin', 'dept_manager', 'sector_manager', 'staff', 'procurement'
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'current active profile is required';
  END IF;

  -- Mirror the current BOQ INSERT/create contract as an allowlist. This keeps
  -- procurement and any future unsupported role fail-closed in definer code.
  IF v_actor_role NOT IN (
    'admin', 'dept_manager', 'sector_manager', 'staff'
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'current role cannot create a BOQ copy';
  END IF;

  -- The actor row already serializes supported same-actor calls. Keep an
  -- explicit request-scoped transaction lock as the idempotency boundary too,
  -- so the exact actor/request pair is locked before the ledger lookup even if
  -- a future revision narrows the profile lock.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'conduit-boq:atomic-copy-request:'
        || v_actor_id::text || ':' || p_request_id::text,
      0
    )
  );

  SELECT request_row.*
  INTO v_existing
  FROM private.boq_copy_requests request_row
  WHERE request_row.actor_id = v_actor_id
    AND request_row.request_id = p_request_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.source_boq_id IS DISTINCT FROM p_source_boq_id
       OR v_existing.expected_source_updated_at
          IS DISTINCT FROM p_expected_source_updated_at
       OR v_existing.mode IS DISTINCT FROM v_mode
       OR v_existing.requested_factor_reference_version_id
          IS DISTINCT FROM p_factor_reference_version_id THEN
      RAISE EXCEPTION USING
        ERRCODE = '22023',
        MESSAGE = 'request id was already used with different copy parameters';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.boq result_row
      WHERE result_row.id = v_existing.result_boq_id
        AND result_row.created_by = v_actor_id
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = '55000',
        MESSAGE = 'the idempotent copy result no longer exists; use a new request id';
    END IF;

    RETURN pg_catalog.jsonb_build_object(
      'success', true,
      'boq_id', v_existing.result_boq_id,
      'source_boq_id', v_existing.source_boq_id,
      'mode', v_existing.mode,
      'factor_reference_version_id',
        v_existing.result_factor_reference_version_id,
      'duplicateRequest', true
    );
  END IF;

  -- The source header is the second lock. save_boq_with_routes takes the same
  -- actor-profile -> BOQ order, preventing mixed snapshots through that path.
  SELECT source_row.*
  INTO v_source
  FROM public.boq source_row
  WHERE source_row.id = p_source_boq_id
    AND (
      v_actor_role = 'admin'
      OR source_row.created_by = v_actor_id
      OR source_row.assigned_to = v_actor_id
      OR (
        source_row.created_by IS NOT NULL
        AND v_actor_role IN ('staff', 'sector_manager')
        AND v_actor_sector_id IS NOT NULL
        AND source_row.sector_id = v_actor_sector_id
      )
      OR (
        source_row.created_by IS NOT NULL
        AND v_actor_role = 'dept_manager'
        AND v_actor_department_id IS NOT NULL
        AND source_row.department_id = v_actor_department_id
      )
    )
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0002',
      MESSAGE = 'source BOQ was not found or is not available';
  END IF;

  -- The supported application save protocol advances boq.updated_at while it
  -- holds this header lock. Direct child-table DML is outside that supported
  -- path; it remains a release residual because DUP-1 does not broaden into a
  -- child-ACL or whole-graph revision migration. The child locks plus the
  -- before/after digest below still reject writes that overlap this copy.
  IF v_source.updated_at IS DISTINCT FROM p_expected_source_updated_at THEN
    RAISE EXCEPTION USING
      ERRCODE = '40001',
      MESSAGE = 'source BOQ changed after it was loaded; reload before copying';
  END IF;

  IF v_source.price_list_version_id IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public.price_list_versions catalog_version
       WHERE catalog_version.id = v_source.price_list_version_id
         AND catalog_version.status IN ('active', 'archived')
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ does not have a valid issued Catalog version';
  END IF;

  IF v_mode = 'preserve' THEN
    IF v_source.factor_reference_version_id IS NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '22023',
        MESSAGE = 'legacy BOQ requires select_factor mode';
    END IF;
    v_target_factor_version_id := v_source.factor_reference_version_id;
  ELSE
    IF v_source.factor_reference_version_id IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '22023',
        MESSAGE = 'select_factor mode is only available for an unbound legacy BOQ';
    END IF;
    v_target_factor_version_id := p_factor_reference_version_id;
  END IF;

  -- A reset selected-Factor copy must remain output-blocked until its first
  -- trusted save. The current UI can distinguish that reset state only when
  -- base total is positive; an unbound zero-total source would be
  -- indistinguishable from a valid bound zero-total preserve snapshot.
  IF v_mode = 'select_factor'
     AND (v_source.total_cost IS NULL OR v_source.total_cost <= 0) THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'legacy BOQ must have a positive base total before selecting Factor F';
  END IF;

  -- Factor version is the third lock. Only published active versions are
  -- accepted, and their declared row count must match the immutable data.
  SELECT
    factor_version.version_string,
    factor_version.row_count,
    factor_version.dataset_hash,
    factor_version.vat_percent
  INTO
    v_target_factor_version_string,
    v_expected_factor_rows,
    v_target_factor_dataset_hash,
    v_target_factor_vat_percent
  FROM public.factor_reference_versions factor_version
  WHERE factor_version.id = v_target_factor_version_id
    AND factor_version.status = 'active'
    AND factor_version.published_at IS NOT NULL
    AND NULLIF(pg_catalog.btrim(factor_version.source_reference), '') IS NOT NULL
    AND NULLIF(pg_catalog.btrim(factor_version.approval_reference), '') IS NOT NULL
    AND factor_version.dataset_hash ~ '^sha256:[0-9a-f]{64}$'
    AND factor_version.vat_percent IS NOT NULL
    AND factor_version.vat_percent >= 0
  FOR KEY SHARE;

  IF NOT FOUND OR v_expected_factor_rows IS NULL OR v_expected_factor_rows <= 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'selected Factor F version is not active or complete';
  END IF;

  SELECT count(*)::integer
  INTO v_actual_factor_rows
  FROM public.factor_reference_rows factor_row
  WHERE factor_row.version_id = v_target_factor_version_id;

  IF v_actual_factor_rows <> v_expected_factor_rows THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'selected Factor F version row count does not match its published metadata';
  END IF;

  WITH ordered_rows AS (
    SELECT pg_catalog.jsonb_build_object(
      'cost_million', factor_row.cost_million::text,
      'operation_percent', factor_row.operation_percent::text,
      'interest_percent', factor_row.interest_percent::text,
      'profit_percent', factor_row.profit_percent::text,
      'total_expense_percent', factor_row.total_expense_percent::text,
      'factor', factor_row.factor::text,
      'vat_percent', factor_row.vat_percent::text,
      'factor_f', factor_row.factor_f::text,
      'factor_f_rain_1', factor_row.factor_f_rain_1::text,
      'factor_f_rain_2', factor_row.factor_f_rain_2::text
    ) AS row_payload
    FROM public.factor_reference_rows factor_row
    WHERE factor_row.version_id = v_target_factor_version_id
    ORDER BY factor_row.cost_million
  ), canonical AS (
    SELECT pg_catalog.jsonb_agg(ordered_rows.row_payload)::text AS payload
    FROM ordered_rows
  )
  SELECT 'sha256:' || pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(canonical.payload, 'UTF8')
    ),
    'hex'
  )
  INTO v_actual_factor_dataset_hash
  FROM canonical;

  IF v_actual_factor_dataset_hash IS DISTINCT FROM v_target_factor_dataset_hash THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'selected Factor F version dataset hash does not match its published metadata';
  END IF;

  IF v_target_factor_vat_percent::text IN ('NaN', 'Infinity', '-Infinity')
     OR EXISTS (
       SELECT 1
       FROM public.factor_reference_rows factor_row
       WHERE factor_row.version_id = v_target_factor_version_id
         AND ARRAY[
           factor_row.cost_million::text,
           factor_row.operation_percent::text,
           factor_row.interest_percent::text,
           factor_row.profit_percent::text,
           factor_row.total_expense_percent::text,
           factor_row.factor::text,
           factor_row.vat_percent::text,
           factor_row.factor_f::text,
           factor_row.factor_f_rain_1::text,
           factor_row.factor_f_rain_2::text
         ]::text[] && ARRAY['NaN', 'Infinity', '-Infinity']::text[]
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'selected Factor F version contains non-finite numeric data';
  END IF;

  -- Lock the source graph in stable table/id order. Route-less legacy items
  -- are valid and remain route-less in the result.
  PERFORM route_row.id
  FROM public.boq_routes route_row
  WHERE route_row.boq_id = p_source_boq_id
  ORDER BY route_row.id
  FOR UPDATE;

  PERFORM item_row.id
  FROM public.boq_items item_row
  WHERE item_row.boq_id = p_source_boq_id
  ORDER BY item_row.id
  FOR UPDATE;

  IF EXISTS (
    SELECT 1
    FROM public.boq_routes route_row
    WHERE route_row.boq_id = p_source_boq_id
  ) AND EXISTS (
    SELECT 1
    FROM public.boq_items item_row
    WHERE item_row.boq_id = p_source_boq_id
      AND item_row.route_id IS NULL
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ mixes routed and route-less items and cannot be copied safely';
  END IF;

  -- PostgreSQL numeric accepts NaN and infinities. Ordinary comparisons and
  -- round/sum can otherwise make a self-consistent non-finite graph look valid.
  IF ARRAY[
       v_source.total_material_cost::text,
       v_source.total_labor_cost::text,
       v_source.total_cost::text,
       v_source.factor_f::text,
       v_source.factor_f_raw::text,
       v_source.factor_f_lower_cost::text,
       v_source.factor_f_upper_cost::text,
       v_source.factor_f_lower_value::text,
       v_source.factor_f_upper_value::text,
       v_source.total_with_factor_f::text,
       v_source.total_with_vat::text
     ]::text[] && ARRAY['NaN', 'Infinity', '-Infinity']::text[]
     OR EXISTS (
       SELECT 1
       FROM public.boq_routes route_row
       WHERE route_row.boq_id = p_source_boq_id
         AND ARRAY[
           route_row.total_material_cost::text,
           route_row.total_labor_cost::text,
           route_row.total_cost::text,
           route_row.cost_with_factor_f::text
         ]::text[] && ARRAY['NaN', 'Infinity', '-Infinity']::text[]
     )
     OR EXISTS (
       SELECT 1
       FROM public.boq_items item_row
       WHERE item_row.boq_id = p_source_boq_id
         AND ARRAY[
           item_row.quantity::text,
           item_row.material_cost_per_unit::text,
           item_row.labor_cost_per_unit::text,
           item_row.unit_cost::text,
           item_row.total_material_cost::text,
           item_row.total_labor_cost::text,
           item_row.total_cost::text
         ]::text[] && ARRAY['NaN', 'Infinity', '-Infinity']::text[]
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ graph contains non-finite numeric data';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_item_route_count
  FROM public.boq_items item_row
  WHERE item_row.boq_id = p_source_boq_id
    AND item_row.route_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.boq_routes route_row
      WHERE route_row.id = item_row.route_id
        AND route_row.boq_id = p_source_boq_id
    );

  IF v_bad_item_route_count <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ contains items linked to a route outside its graph';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_catalog_item_count
  FROM public.boq_items item_row
  LEFT JOIN public.price_list catalog_item
    ON catalog_item.id = item_row.price_list_id
  WHERE item_row.boq_id = p_source_boq_id
    AND item_row.price_list_id IS NOT NULL
    AND (
      catalog_item.id IS NULL
      OR catalog_item.version_id IS DISTINCT FROM v_source.price_list_version_id
    );

  IF v_bad_catalog_item_count <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ contains Catalog items outside its bound version';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_catalog_snapshot_count
  FROM public.boq_items item_row
  JOIN public.price_list catalog_item
    ON catalog_item.id = item_row.price_list_id
  WHERE item_row.boq_id = p_source_boq_id
    AND (
      item_row.unit IS DISTINCT FROM catalog_item.unit
      OR item_row.material_cost_per_unit
         IS DISTINCT FROM catalog_item.material_cost
      OR item_row.labor_cost_per_unit
         IS DISTINCT FROM catalog_item.labor_cost
      OR item_row.unit_cost IS DISTINCT FROM catalog_item.unit_cost
      OR item_row.category IS DISTINCT FROM catalog_item.category
      OR NOT (
        item_row.item_name = catalog_item.item_name
        OR item_row.item_name = catalog_item.item_name || ' (Main Duct)'
        OR item_row.item_name = catalog_item.item_name || ' (Riser)'
        OR item_row.item_name = catalog_item.item_name || ' (Steel Pole)'
        OR item_row.item_name = catalog_item.item_name || ' (Riser Service)'
      )
    );

  IF v_bad_catalog_snapshot_count <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ contains Catalog-backed item snapshots that drifted from its issued version';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_item_math_count
  FROM public.boq_items item_row
  WHERE item_row.boq_id = p_source_boq_id
    AND (
      item_row.quantity < 0
      OR item_row.material_cost_per_unit IS NULL
      OR item_row.material_cost_per_unit < 0
      OR item_row.labor_cost_per_unit IS NULL
      OR item_row.labor_cost_per_unit < 0
      OR item_row.unit_cost IS NULL
      OR item_row.unit_cost < 0
      OR item_row.total_material_cost IS NULL
      OR item_row.total_material_cost < 0
      OR item_row.total_labor_cost IS NULL
      OR item_row.total_labor_cost < 0
      OR item_row.total_cost IS NULL
      OR item_row.total_cost < 0
      OR item_row.unit_cost IS DISTINCT FROM pg_catalog.round(
        item_row.material_cost_per_unit + item_row.labor_cost_per_unit,
        2
      )
      OR item_row.total_material_cost IS DISTINCT FROM pg_catalog.round(
        item_row.quantity * item_row.material_cost_per_unit,
        2
      )
      OR item_row.total_labor_cost IS DISTINCT FROM pg_catalog.round(
        item_row.quantity * item_row.labor_cost_per_unit,
        2
      )
      OR item_row.total_cost IS DISTINCT FROM pg_catalog.round(
        item_row.quantity * item_row.unit_cost,
        2
      )
    );

  IF v_bad_item_math_count <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ contains invalid quantity, unit-price, or item-total snapshots';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_route_math_count
  FROM public.boq_routes route_row
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(pg_catalog.sum(item_row.total_material_cost), 0::numeric)
        AS stored_material_cost,
      COALESCE(pg_catalog.sum(item_row.total_labor_cost), 0::numeric)
        AS stored_labor_cost,
      COALESCE(pg_catalog.sum(item_row.total_cost), 0::numeric)
        AS stored_total_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(
            item_row.quantity * item_row.material_cost_per_unit
          ),
          0::numeric
        ),
        2
      ) AS raw_material_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(
            item_row.quantity * item_row.labor_cost_per_unit
          ),
          0::numeric
        ),
        2
      ) AS raw_labor_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(item_row.quantity * item_row.unit_cost),
          0::numeric
        ),
        2
      ) AS raw_total_cost
    FROM public.boq_items item_row
    WHERE item_row.boq_id = p_source_boq_id
      AND item_row.route_id = route_row.id
  ) item_totals ON true
  WHERE route_row.boq_id = p_source_boq_id
    AND NOT (
      (
        route_row.total_material_cost
          IS NOT DISTINCT FROM item_totals.stored_material_cost
        AND route_row.total_labor_cost
          IS NOT DISTINCT FROM item_totals.stored_labor_cost
        AND route_row.total_cost
          IS NOT DISTINCT FROM item_totals.stored_total_cost
      )
      OR
      (
        route_row.total_material_cost
          IS NOT DISTINCT FROM item_totals.raw_material_cost
        AND route_row.total_labor_cost
          IS NOT DISTINCT FROM item_totals.raw_labor_cost
        AND route_row.total_cost
          IS NOT DISTINCT FROM item_totals.raw_total_cost
      )
    );

  IF v_bad_route_math_count <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ route totals do not match their routed item snapshots';
  END IF;

  SELECT NOT (
    (
      v_source.total_material_cost
        IS NOT DISTINCT FROM item_totals.stored_material_cost
      AND v_source.total_labor_cost
        IS NOT DISTINCT FROM item_totals.stored_labor_cost
      AND v_source.total_cost IS NOT DISTINCT FROM item_totals.stored_total_cost
    )
    OR
    (
      v_source.total_material_cost
        IS NOT DISTINCT FROM item_totals.raw_material_cost
      AND v_source.total_labor_cost
        IS NOT DISTINCT FROM item_totals.raw_labor_cost
      AND v_source.total_cost IS NOT DISTINCT FROM item_totals.raw_total_cost
    )
  )
  INTO v_bad_header_math
  FROM (
    SELECT
      COALESCE(pg_catalog.sum(item_row.total_material_cost), 0::numeric)
        AS stored_material_cost,
      COALESCE(pg_catalog.sum(item_row.total_labor_cost), 0::numeric)
        AS stored_labor_cost,
      COALESCE(pg_catalog.sum(item_row.total_cost), 0::numeric)
        AS stored_total_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(
            item_row.quantity * item_row.material_cost_per_unit
          ),
          0::numeric
        ),
        2
      ) AS raw_material_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(
            item_row.quantity * item_row.labor_cost_per_unit
          ),
          0::numeric
        ),
        2
      ) AS raw_labor_cost,
      pg_catalog.round(
        COALESCE(
          pg_catalog.sum(item_row.quantity * item_row.unit_cost),
          0::numeric
        ),
        2
      ) AS raw_total_cost
    FROM public.boq_items item_row
    WHERE item_row.boq_id = p_source_boq_id
  ) item_totals;

  IF v_bad_header_math IS NOT FALSE THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ header totals do not match its item snapshots';
  END IF;

  IF v_mode = 'preserve' AND v_source.total_cost > 0 THEN
    SELECT
      factor_row.cost_million * 1000000::numeric,
      factor_row.factor
    INTO
      v_expected_factor_lower_cost,
      v_expected_factor_lower_value
    FROM public.factor_reference_rows factor_row
    WHERE factor_row.version_id = v_target_factor_version_id
      AND factor_row.cost_million * 1000000::numeric
          <= CASE
            WHEN v_source.total_cost > 5000000::numeric
              THEN v_source.total_cost
            ELSE 5000000::numeric
          END
    ORDER BY factor_row.cost_million DESC
    LIMIT 1;

    SELECT
      factor_row.cost_million * 1000000::numeric,
      factor_row.factor
    INTO
      v_expected_factor_upper_cost,
      v_expected_factor_upper_value
    FROM public.factor_reference_rows factor_row
    WHERE factor_row.version_id = v_target_factor_version_id
      AND factor_row.cost_million * 1000000::numeric > v_source.total_cost
    ORDER BY factor_row.cost_million
    LIMIT 1;

    IF v_expected_factor_lower_cost IS NOT NULL AND (
      v_source.total_cost <= v_expected_factor_lower_cost
      OR v_expected_factor_upper_cost IS NULL
    ) THEN
      v_expected_factor_upper_cost := v_expected_factor_lower_cost;
      v_expected_factor_upper_value := v_expected_factor_lower_value;
      v_expected_factor_raw := v_expected_factor_lower_value;
    ELSIF v_expected_factor_lower_cost IS NOT NULL
          AND v_expected_factor_upper_cost IS NOT NULL THEN
      v_expected_factor_raw := v_expected_factor_lower_value
        - (
          (v_expected_factor_lower_value - v_expected_factor_upper_value)
          * (v_source.total_cost - v_expected_factor_lower_cost)
          / (v_expected_factor_upper_cost - v_expected_factor_lower_cost)
        );
    END IF;
  END IF;

  -- factor_f_raw is an audit value serialized from JavaScript binary floating
  -- point. Requiring exact equality with PostgreSQL's rational interpolation
  -- would reject valid values such as 1.2732984953900002 versus canonical
  -- numeric 1.27329849539. Pin the adjacent reference rows exactly, require
  -- both canonical and stored-raw truncation to reach the same four-decimal
  -- Factor F, and keep the derived money checks exact.
  v_bad_factor_snapshot := v_mode = 'preserve'
    AND (
      (
        v_source.total_cost > 0
        AND (
          v_source.factor_f IS NULL OR v_source.factor_f <= 0
          OR v_source.factor_f_raw IS NULL OR v_source.factor_f_raw <= 0
          OR v_source.factor_f_lower_cost IS NULL
          OR v_source.factor_f_lower_cost <= 0
          OR v_source.factor_f_upper_cost IS NULL
          OR v_source.factor_f_upper_cost <= 0
          OR v_source.factor_f_lower_value IS NULL
          OR v_source.factor_f_lower_value <= 0
          OR v_source.factor_f_upper_value IS NULL
          OR v_source.factor_f_upper_value <= 0
          OR v_expected_factor_lower_cost IS NULL
          OR v_expected_factor_upper_cost IS NULL
          OR v_expected_factor_lower_value IS NULL
          OR v_expected_factor_upper_value IS NULL
          OR v_expected_factor_raw IS NULL
          OR v_source.factor_f_lower_cost
             IS DISTINCT FROM v_expected_factor_lower_cost
          OR v_source.factor_f_upper_cost
             IS DISTINCT FROM v_expected_factor_upper_cost
          OR v_source.factor_f_lower_value
             IS DISTINCT FROM v_expected_factor_lower_value
          OR v_source.factor_f_upper_value
             IS DISTINCT FROM v_expected_factor_upper_value
          OR v_source.factor_f IS DISTINCT FROM pg_catalog.trunc(
            v_expected_factor_raw,
            4
          )
          OR v_source.factor_f IS DISTINCT FROM pg_catalog.trunc(
            v_source.factor_f_raw,
            4
          )
          OR v_source.total_with_factor_f IS DISTINCT FROM pg_catalog.round(
            v_source.total_cost * v_source.factor_f,
            2
          )
          OR v_source.total_with_vat IS DISTINCT FROM pg_catalog.round(
            v_source.total_with_factor_f
              + pg_catalog.round(
                v_source.total_with_factor_f
                  * v_target_factor_vat_percent / 100::numeric,
                2
              ),
            2
          )
        )
      )
      OR (
        v_source.total_cost = 0
        AND (
          COALESCE(v_source.factor_f, 0::numeric) <> 0
          OR COALESCE(v_source.factor_f_raw, 0::numeric) <> 0
          OR COALESCE(v_source.factor_f_lower_cost, 0::numeric) <> 0
          OR COALESCE(v_source.factor_f_upper_cost, 0::numeric) <> 0
          OR COALESCE(v_source.factor_f_lower_value, 0::numeric) <> 0
          OR COALESCE(v_source.factor_f_upper_value, 0::numeric) <> 0
          OR v_source.total_with_factor_f IS DISTINCT FROM 0::numeric
          OR v_source.total_with_vat IS DISTINCT FROM 0::numeric
        )
      )
    );

  IF v_bad_factor_snapshot IS NOT FALSE THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ Factor F snapshot is incomplete or inconsistent with its bound version';
  END IF;

  SELECT count(*)::integer
  INTO v_source_route_count
  FROM public.boq_routes route_row
  WHERE route_row.boq_id = p_source_boq_id;

  SELECT count(*)::integer
  INTO v_source_item_count
  FROM public.boq_items item_row
  WHERE item_row.boq_id = p_source_boq_id;

  v_source_graph_before := private.boq_copy_graph_sha256(
    p_source_boq_id,
    v_mode = 'select_factor'
  );

  v_estimator_name := NULLIF(
    pg_catalog.btrim(
      pg_catalog.concat_ws(
        ' ',
        NULLIF(
          pg_catalog.btrim(
            pg_catalog.concat_ws('', v_actor_title, v_actor_first_name)
          ),
          ''
        ),
        NULLIF(pg_catalog.btrim(v_actor_last_name), '')
      )
    ),
    ''
  );
  v_estimator_name := COALESCE(
    v_estimator_name,
    NULLIF(pg_catalog.split_part(COALESCE(v_actor_email, ''), '@', 1), ''),
    v_source.estimator_name,
    'ไม่ระบุ'
  );

  INSERT INTO public.boq (
    estimator_name,
    document_date,
    project_name,
    route,
    construction_area,
    department,
    total_material_cost,
    total_labor_cost,
    total_cost,
    factor_f,
    factor_f_raw,
    factor_f_lower_cost,
    factor_f_upper_cost,
    factor_f_lower_value,
    factor_f_upper_value,
    total_with_factor_f,
    total_with_vat,
    price_list_version_id,
    factor_reference_version_id,
    status,
    created_by,
    assigned_to,
    org_id,
    department_id,
    sector_id
  ) VALUES (
    v_estimator_name,
    (pg_catalog.statement_timestamp() AT TIME ZONE 'Asia/Bangkok')::date,
    CASE
      WHEN v_mode = 'preserve'
        THEN v_source.project_name || ' (สำเนา)'
      ELSE v_source.project_name || ' (Factor F '
        || v_target_factor_version_string || ')'
    END,
    v_source.route,
    v_source.construction_area,
    v_source.department,
    v_source.total_material_cost,
    v_source.total_labor_cost,
    v_source.total_cost,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f_raw ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f_lower_cost ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f_upper_cost ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f_lower_value ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.factor_f_upper_value ELSE NULL END,
    CASE WHEN v_mode = 'preserve' THEN v_source.total_with_factor_f ELSE 0 END,
    CASE WHEN v_mode = 'preserve' THEN v_source.total_with_vat ELSE 0 END,
    v_source.price_list_version_id,
    v_target_factor_version_id,
    'draft',
    v_actor_id,
    NULL,
    v_actor_org_id,
    v_actor_department_id,
    v_actor_sector_id
  )
  RETURNING * INTO v_result;

  FOR v_route IN
    SELECT route_row.*
    FROM public.boq_routes route_row
    WHERE route_row.boq_id = p_source_boq_id
    ORDER BY route_row.route_order, route_row.id
  LOOP
    INSERT INTO public.boq_routes (
      boq_id,
      route_order,
      route_name,
      route_description,
      construction_area,
      total_material_cost,
      total_labor_cost,
      total_cost,
      cost_with_factor_f
    ) VALUES (
      v_result.id,
      v_route.route_order,
      v_route.route_name,
      v_route.route_description,
      v_route.construction_area,
      v_route.total_material_cost,
      v_route.total_labor_cost,
      v_route.total_cost,
      CASE WHEN v_mode = 'preserve' THEN v_route.cost_with_factor_f ELSE 0 END
    )
    RETURNING id INTO v_new_route_id;

    v_route_map := v_route_map || pg_catalog.jsonb_build_object(
      v_route.id::text,
      v_new_route_id::text
    );
    v_inserted_route_count := v_inserted_route_count + 1;
  END LOOP;

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
  )
  SELECT
    v_result.id,
    CASE
      WHEN item_row.route_id IS NULL THEN NULL
      ELSE (v_route_map ->> item_row.route_id::text)::uuid
    END,
    item_row.item_order,
    item_row.price_list_id,
    item_row.item_name,
    item_row.quantity,
    item_row.unit,
    item_row.material_cost_per_unit,
    item_row.labor_cost_per_unit,
    item_row.unit_cost,
    item_row.total_material_cost,
    item_row.total_labor_cost,
    item_row.total_cost,
    item_row.remarks,
    item_row.category
  FROM public.boq_items item_row
  WHERE item_row.boq_id = p_source_boq_id
  ORDER BY item_row.id;

  GET DIAGNOSTICS v_inserted_item_count = ROW_COUNT;

  IF v_inserted_route_count <> v_source_route_count
     OR v_inserted_item_count <> v_source_item_count THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'BOQ copy graph count postcondition failed';
  END IF;

  v_source_graph_after := private.boq_copy_graph_sha256(
    p_source_boq_id,
    v_mode = 'select_factor'
  );
  v_result_graph := private.boq_copy_graph_sha256(
    v_result.id,
    false
  );

  IF v_source_graph_after IS DISTINCT FROM v_source_graph_before THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source BOQ graph changed during copy; no copy was saved';
  END IF;

  IF v_result_graph IS DISTINCT FROM v_source_graph_before THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'BOQ copy graph fingerprint postcondition failed';
  END IF;

  IF v_result.created_by IS DISTINCT FROM v_actor_id
     OR v_result.assigned_to IS NOT NULL
     OR v_result.status IS DISTINCT FROM 'draft'
     OR v_result.total_material_cost
        IS DISTINCT FROM v_source.total_material_cost
     OR v_result.total_labor_cost
        IS DISTINCT FROM v_source.total_labor_cost
     OR v_result.total_cost IS DISTINCT FROM v_source.total_cost
     OR v_result.price_list_version_id
        IS DISTINCT FROM v_source.price_list_version_id
     OR v_result.factor_reference_version_id
        IS DISTINCT FROM v_target_factor_version_id THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'BOQ copy header ownership/version postcondition failed';
  END IF;

  IF v_mode = 'preserve' AND (
    v_result.factor_f IS DISTINCT FROM v_source.factor_f
    OR v_result.factor_f_raw IS DISTINCT FROM v_source.factor_f_raw
    OR v_result.factor_f_lower_cost IS DISTINCT FROM v_source.factor_f_lower_cost
    OR v_result.factor_f_upper_cost IS DISTINCT FROM v_source.factor_f_upper_cost
    OR v_result.factor_f_lower_value IS DISTINCT FROM v_source.factor_f_lower_value
    OR v_result.factor_f_upper_value IS DISTINCT FROM v_source.factor_f_upper_value
    OR v_result.total_with_factor_f IS DISTINCT FROM v_source.total_with_factor_f
    OR v_result.total_with_vat IS DISTINCT FROM v_source.total_with_vat
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'preserve copy changed the Factor F snapshot or totals';
  END IF;

  IF v_mode = 'select_factor' AND (
    v_result.factor_f IS NOT NULL
    OR v_result.factor_f_raw IS NOT NULL
    OR v_result.factor_f_lower_cost IS NOT NULL
    OR v_result.factor_f_upper_cost IS NOT NULL
    OR v_result.factor_f_lower_value IS NOT NULL
    OR v_result.factor_f_upper_value IS NOT NULL
    OR v_result.total_with_factor_f IS DISTINCT FROM 0::numeric
    OR v_result.total_with_vat IS DISTINCT FROM 0::numeric
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'select_factor copy did not reset every Factor F snapshot field';
  END IF;

  INSERT INTO private.boq_copy_requests (
    actor_id,
    request_id,
    source_boq_id,
    expected_source_updated_at,
    mode,
    requested_factor_reference_version_id,
    source_graph_sha256,
    result_boq_id,
    result_factor_reference_version_id
  ) VALUES (
    v_actor_id,
    p_request_id,
    p_source_boq_id,
    p_expected_source_updated_at,
    v_mode,
    p_factor_reference_version_id,
    v_source_graph_before,
    v_result.id,
    v_target_factor_version_id
  );

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'boq_id', v_result.id,
    'source_boq_id', p_source_boq_id,
    'mode', v_mode,
    'factor_reference_version_id', v_target_factor_version_id,
    'duplicateRequest', false
  );
END;
$function$;

ALTER FUNCTION public.duplicate_boq_atomic(
  uuid, uuid, timestamptz, text, uuid
)
  OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.duplicate_boq_atomic(
  uuid, uuid, timestamptz, text, uuid
)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.duplicate_boq_atomic(
  uuid, uuid, timestamptz, text, uuid
)
  TO authenticated;

COMMENT ON FUNCTION public.duplicate_boq_atomic(
  uuid, uuid, timestamptz, text, uuid
) IS
  'Atomically creates an idempotent BOQ draft copy. preserve keeps Catalog/prices/Factor snapshots; select_factor is only for unbound legacy BOQs and resets Factor calculation snapshots.';

-- -----------------------------------------------------------------------------
-- 5. Object posture and ACL postconditions
-- -----------------------------------------------------------------------------
DO $atomic_boq_duplicate_postcondition$
DECLARE
  v_rpc pg_catalog.pg_proc%ROWTYPE;
  v_helper pg_catalog.pg_proc%ROWTYPE;
  v_ledger pg_catalog.pg_class%ROWTYPE;
BEGIN
  SELECT function_row.*
  INTO v_rpc
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid =
    to_regprocedure(
      'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)'
    );

  SELECT function_row.*
  INTO v_helper
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid =
    to_regprocedure('private.boq_copy_graph_sha256(uuid,boolean)');

  SELECT relation_row.*
  INTO v_ledger
  FROM pg_catalog.pg_class relation_row
  WHERE relation_row.oid = 'private.boq_copy_requests'::regclass;

  IF v_rpc.oid IS NULL
     OR pg_catalog.pg_get_userbyid(v_rpc.proowner) <> 'postgres'
     OR NOT v_rpc.prosecdef
     OR v_rpc.provolatile <> 'v'
     OR NOT (
       ARRAY[
         'search_path=""',
         'lock_timeout=5s',
         'statement_timeout=30s'
       ]::text[] <@ COALESCE(v_rpc.proconfig, ARRAY[]::text[])
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate postcondition failed: public RPC posture is invalid';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.aclexplode(
      COALESCE(v_rpc.proacl, pg_catalog.acldefault('f', v_rpc.proowner))
    ) privilege
    WHERE privilege.privilege_type = 'EXECUTE'
      AND privilege.grantee NOT IN (
        v_rpc.proowner,
        'authenticated'::regrole::oid
      )
  )
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.aclexplode(
         COALESCE(v_rpc.proacl, pg_catalog.acldefault('f', v_rpc.proowner))
       ) privilege
       WHERE privilege.grantee = 'authenticated'::regrole::oid
         AND privilege.privilege_type = 'EXECUTE'
         AND privilege.is_grantable
  )
     OR pg_catalog.has_function_privilege(
       'anon',
       'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)',
       'EXECUTE'
     )
     OR NOT pg_catalog.has_function_privilege(
       'authenticated',
       'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)',
       'EXECUTE'
     )
     OR pg_catalog.has_function_privilege(
       'service_role',
       'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate postcondition failed: public RPC ACL is invalid';
  END IF;

  IF v_helper.oid IS NULL
     OR pg_catalog.pg_get_userbyid(v_helper.proowner) <> 'postgres'
     OR v_helper.prosecdef
     OR v_helper.provolatile <> 's'
     OR v_helper.proconfig IS DISTINCT FROM ARRAY['search_path=""']::text[]
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.aclexplode(
         COALESCE(
           v_helper.proacl,
           pg_catalog.acldefault('f', v_helper.proowner)
         )
       ) privilege
       WHERE privilege.privilege_type = 'EXECUTE'
         AND privilege.grantee <> v_helper.proowner
     )
     OR pg_catalog.has_function_privilege(
       'anon', 'private.boq_copy_graph_sha256(uuid,boolean)', 'EXECUTE'
     )
     OR pg_catalog.has_function_privilege(
       'authenticated',
       'private.boq_copy_graph_sha256(uuid,boolean)',
       'EXECUTE'
     )
     OR pg_catalog.has_function_privilege(
       'service_role',
       'private.boq_copy_graph_sha256(uuid,boolean)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate postcondition failed: private helper posture is invalid';
  END IF;

  IF v_ledger.oid IS NULL
     OR pg_catalog.pg_get_userbyid(v_ledger.relowner) <> 'postgres'
     OR NOT v_ledger.relrowsecurity
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.aclexplode(
         COALESCE(
           v_ledger.relacl,
           pg_catalog.acldefault('r', v_ledger.relowner)
         )
       ) privilege
       WHERE privilege.grantee <> v_ledger.relowner
         AND privilege.privilege_type IN (
           'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
           'REFERENCES', 'TRIGGER', 'MAINTAIN'
         )
     )
     OR EXISTS (
       SELECT 1
       FROM (VALUES
         ('anon'),
         ('authenticated'),
         ('service_role')
       ) api_role(role_name)
       CROSS JOIN (VALUES
         ('SELECT'),
         ('INSERT'),
         ('UPDATE'),
         ('DELETE'),
         ('TRUNCATE'),
         ('REFERENCES'),
         ('TRIGGER'),
         ('MAINTAIN')
       ) api_privilege(privilege_name)
       WHERE pg_catalog.has_table_privilege(
         api_role.role_name,
         'private.boq_copy_requests',
         api_privilege.privilege_name
       )
     )
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.pg_policies policy
       WHERE policy.schemaname = 'private'
         AND policy.tablename = 'boq_copy_requests'
     ) THEN
    RAISE EXCEPTION
      'Atomic BOQ duplicate postcondition failed: private ledger posture is invalid';
  END IF;
END;
$atomic_boq_duplicate_postcondition$;

COMMIT;
