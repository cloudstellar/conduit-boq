-- =============================================================================
-- P-49 V2 PROVISIONAL OFFLINE DATABASE CANDIDATE
-- =============================================================================
-- This file is intentionally outside migrations/. It has no migration number,
-- no ledger identity, and no execution authority.
--
-- IMPORTANT: the fail-closed sentinel below aborts before the advisory lock,
-- DDL, DML, ACL, policy, or function changes. Removing or replacing that
-- sentinel is allowed only by a later Owner-approved source-freeze decision
-- after Proposal #47 Section 14 external bindings and a fresh exact Production
-- predecessor inventory have been recorded.
--
-- P49 CONTRACT: current-active-first
-- P49 CONTRACT: profile-protected-fields
-- P49 CONTRACT: deterministic-lock-order
-- P49 CONTRACT: audit-immutable-idempotent
-- P49 CONTRACT: master-catalog-preserved
-- P49 CONTRACT: no-hard-delete
-- P49 CONTRACT: exact-predecessor-policy-semantics
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL idle_in_transaction_session_timeout = '90s';

-- -----------------------------------------------------------------------------
-- 0. Mandatory non-executable sentinel
-- -----------------------------------------------------------------------------
DO $p49_fresh_bind_required$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'P49 candidate is non-executable: fresh-bind-required',
    DETAIL = 'Section 14 deployed-commit/Data-API binding plus a fresh exact ledger, policy, ACL, trigger, view, overload, and function predecessor manifest are not frozen.',
    HINT = 'Do not remove or replace this sentinel without a later Owner-approved source-freeze decision.';
END;
$p49_fresh_bind_required$;

-- Nothing below can run while the sentinel is present.
-- A later frozen migration must put the advisory lock before every mutable
-- operation and must replace both fresh-bind-required manifest placeholders
-- with exact reviewed values. Repository-derived guesses are prohibited.
SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:p49-authorization-v2', 0)
);

-- -----------------------------------------------------------------------------
-- 1. Exact predecessor preflight (provisional; still contains binding slots)
-- -----------------------------------------------------------------------------
DO $p49_identity_and_ledger_preflight$
DECLARE
  v_latest_version text;
  v_latest_name text;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'P49 preflight blocked: session_user/current_user must both be postgres (got %/%)',
      session_user,
      current_user;
  END IF;

  IF to_regrole('anon') IS NULL
     OR to_regrole('authenticated') IS NULL
     OR to_regrole('service_role') IS NULL THEN
    RAISE EXCEPTION 'P49 preflight blocked: required Supabase API roles are missing';
  END IF;

  IF to_regnamespace('private') IS NULL
     OR pg_catalog.pg_get_userbyid(
          (SELECT n.nspowner
           FROM pg_catalog.pg_namespace n
           WHERE n.oid = to_regnamespace('private'))
        ) IS DISTINCT FROM 'postgres' THEN
    RAISE EXCEPTION 'P49 preflight blocked: private schema is missing or not postgres-owned';
  END IF;

  SELECT m.version, m.name
  INTO v_latest_version, v_latest_name
  FROM supabase_migrations.schema_migrations m
  ORDER BY m.version DESC
  LIMIT 1;

  IF v_latest_version IS DISTINCT FROM '20260729002600'
     OR v_latest_name IS DISTINCT FROM 'master_catalog_phase4_catalog_action_error_acl' THEN
    RAISE EXCEPTION
      'P49 preflight blocked: expected exact 026 predecessor, got %/%',
      v_latest_version,
      v_latest_name;
  END IF;

  IF NOT has_schema_privilege('authenticated', 'private', 'USAGE')
     OR has_schema_privilege('anon', 'private', 'USAGE') THEN
    RAISE EXCEPTION 'P49 preflight blocked: private schema API-role posture drifted';
  END IF;
END;
$p49_identity_and_ledger_preflight$;

DO $p49_known_function_fingerprint_preflight$
DECLARE
  v_binding record;
  v_actual text;
BEGIN
  FOR v_binding IN
    SELECT *
    FROM (VALUES
      ('public.admin_approve_user(uuid)', '2fa3555cdf88bdf3a2018d917d2be714020794d8c80a5a389c8cde8a0a9aedba'),
      ('public.admin_reject_user(uuid,text)', 'fef479a6c2e324ec5b76936a2b395e88abe4ad473b728bc8a1edeae9478a61ff'),
      ('public.can_approve_boq(uuid)', 'b5407ad1e4c5a6585905b2e2057259b2367fbb91588782bad5cfd74574a77830'),
      ('public.get_my_profile()', '336d743f881986e79ea128a42a29868b396dedd16269fff6bcac0e035dd1be5e'),
      ('public.get_user_role(uuid)', '38f05c7e6c70c9759410adc610a8eccb3c1c4372b52509ad0dac055d80f70166'),
      ('public.handle_new_user()', '280a512a3d3cd89834529653cc2e17d0bf6e8a574d702cb641084801757e3855'),
      ('public.is_admin(uuid)', '45c147e6fb6a983f52993b5df63df1b6b06935af6b2aacb33d152033a1944f44'),
      ('public.lock_org_fields_after_onboarding()', 'c9876135ddfba9296d4510e947f92a32a0fca4efae957f014cabcc355589ceb6'),
      ('public.save_boq_with_routes(uuid,jsonb,jsonb)', '0b768c6442d805b7de4849ae7b3b845bf2e11bb72905b4365169c9125900709b')
    ) AS expected(signature, sha256)
  LOOP
    IF to_regprocedure(v_binding.signature) IS NULL THEN
      RAISE EXCEPTION 'P49 preflight blocked: required predecessor function % is missing',
        v_binding.signature;
    END IF;

    SELECT pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.pg_get_functiondef(to_regprocedure(v_binding.signature)),
          'UTF8'
        )
      ),
      'hex'
    )
    INTO v_actual;

    IF v_actual IS DISTINCT FROM v_binding.sha256 THEN
      RAISE EXCEPTION
        'P49 preflight blocked: function fingerprint drift for % (expected %, got %)',
        v_binding.signature,
        v_binding.sha256,
        v_actual;
    END IF;
  END LOOP;
END;
$p49_known_function_fingerprint_preflight$;

DO $p49_default_acl_preflight$
DECLARE
  v_global_default_rows integer;
  v_global_default_entries integer;
  v_invalid_global_default_entries integer;
  v_public_default_rows integer;
  v_public_default_entries integer;
  v_private_default_rows integer;
  v_private_default_entries integer;
  v_invalid_schema_default_entries integer;
BEGIN
  SELECT count(*)
  INTO v_global_default_rows
  FROM pg_catalog.pg_default_acl d
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND d.defaclnamespace = 0;

  SELECT
    count(*),
    count(*) FILTER (
      WHERE privilege.grantee <> to_regrole('postgres')
         OR privilege.grantor <> to_regrole('postgres')
         OR privilege.privilege_type <> 'EXECUTE'
         OR privilege.is_grantable
    )
  INTO v_global_default_entries, v_invalid_global_default_entries
  FROM pg_catalog.pg_default_acl d
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND d.defaclnamespace = 0;

  SELECT count(*)
  INTO v_public_default_rows
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'public';

  SELECT count(*)
  INTO v_public_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'public';

  SELECT count(*)
  INTO v_private_default_rows
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'private';

  SELECT count(*)
  INTO v_private_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'private';

  SELECT count(*)
  INTO v_invalid_schema_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname IN ('public', 'private')
    AND (
      privilege.grantee <> to_regrole('postgres')
      OR privilege.grantor <> to_regrole('postgres')
      OR privilege.privilege_type <> 'EXECUTE'
      OR privilege.is_grantable
    );

  IF v_global_default_rows <> 1
     OR v_global_default_entries <> 1
     OR v_invalid_global_default_entries <> 0
     OR v_public_default_rows > 1
     OR v_public_default_entries <> v_public_default_rows
     OR v_private_default_rows > 1
     OR v_private_default_entries <> v_private_default_rows
     OR v_invalid_schema_default_entries <> 0 THEN
    RAISE EXCEPTION
      'P49 preflight blocked: migration-017a owner-only function defaults drifted';
  END IF;
END;
$p49_default_acl_preflight$;

-- These two exact manifests were not captured as durable V2 evidence. They are
-- deliberately NULL so this draft remains fail closed even if the top sentinel
-- were accidentally removed. A later source-freeze must replace them with the
-- reviewed exact live rows; it must not infer them from repository migrations.
DO $p49_exact_live_policy_acl_binding$
DECLARE
  v_exact_live_policy_manifest jsonb := NULL; -- fresh-bind-required
  v_exact_live_acl_manifest jsonb := NULL;    -- fresh-bind-required
BEGIN
  IF v_exact_live_policy_manifest IS NULL OR v_exact_live_acl_manifest IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 preflight blocked: exact live policy/ACL manifest is fresh-bind-required';
  END IF;
END;
$p49_exact_live_policy_acl_binding$;

DO $p49_data_state_preflight$
DECLARE
  v_flag_rows integer;
  v_false_flags integer;
  v_profile_constraint_count integer;
  v_profile_constraint_sha256 text;
BEGIN
  SELECT
    count(*)::integer,
    pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(COALESCE(
          pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'name', c.conname,
              'type', c.contype,
              'definition', pg_catalog.pg_get_constraintdef(c.oid, true)
            ) ORDER BY c.conname, c.oid
          )::text,
          '[]'
        ), 'UTF8')
      ),
      'hex'
    )
  INTO v_profile_constraint_count, v_profile_constraint_sha256
  FROM pg_catalog.pg_constraint c
  WHERE c.conrelid = 'public.user_profiles'::regclass;

  IF v_profile_constraint_count <> 11
     OR v_profile_constraint_sha256 IS DISTINCT FROM
       '061827adeb6324696a07a41c67e07829266d904cc047cd887990de7a3fb51420' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 preflight blocked: exact user_profiles constraint manifest drifted',
      DETAIL = pg_catalog.format(
        'rows=%s sha256=%s',
        v_profile_constraint_count,
        v_profile_constraint_sha256
      );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_my_catalog_capabilities'
  ) THEN
    RAISE EXCEPTION 'P49 preflight blocked: an unbound get_my_catalog_capabilities overload already exists';
  END IF;

  IF to_regclass('public.user_authorization_events') IS NOT NULL THEN
    RAISE EXCEPTION 'P49 preflight blocked: user_authorization_events already exists';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.role IS NULL
       OR p.role NOT IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
       OR p.status IS NULL
       OR p.status NOT IN ('active', 'inactive', 'suspended', 'pending')
  ) THEN
    RAISE EXCEPTION 'P49 preflight blocked: null or unknown profile authority state exists';
  END IF;

  IF EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN public.user_profiles p ON p.id = u.id
    WHERE p.id IS NULL
  ) OR EXISTS (
    SELECT 1 FROM public.user_profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE u.id IS NULL
  ) THEN
    RAISE EXCEPTION 'P49 preflight blocked: Auth/profile coverage is not exact';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE s.value = 'false'::jsonb)
  INTO v_flag_rows, v_false_flags
  FROM public.app_settings s
  WHERE s.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );

  IF v_flag_rows <> 3 OR v_false_flags <> 3 THEN
    RAISE EXCEPTION 'P49 preflight blocked: all three Master Catalog flags must exist and be false';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_views v
    WHERE v.schemaname IN ('public', 'private')
      AND (
        v.definition ILIKE '%factor_reference%'
        OR v.definition ILIKE '%user_profiles%'
        OR v.definition ILIKE '%app_settings%'
      )
  ) THEN
    RAISE EXCEPTION 'P49 preflight blocked: an unbound profile/settings/Factor-F view exists';
  END IF;
END;
$p49_data_state_preflight$;

-- P49 CONTRACT: master-catalog-preserved
-- Result #100 is durable authority for this exact published/default state. This
-- is a read-only binding: P-49 must neither revise the catalog nor move its
-- singleton pointer.
DO $p49_master_catalog_authority_preflight$
DECLARE
  v_pointer_rows integer;
  v_version_id uuid;
  v_version_string text;
  v_status text;
  v_is_default boolean;
  v_dataset_hash text;
  v_item_count integer;
  v_lock_version integer;
  v_total_rows bigint;
  v_active_rows bigint;
  v_inactive_rows bigint;
BEGIN
  SELECT count(*)::integer
  INTO v_pointer_rows
  FROM public.price_list_default_version dv
  WHERE dv.id = true;

  IF v_pointer_rows <> 1 THEN
    RAISE EXCEPTION
      'P49 preflight blocked: expected exactly one Master Catalog default pointer, got %',
      v_pointer_rows;
  END IF;

  SELECT
    v.id,
    v.version_string,
    v.status,
    v.is_default,
    v.dataset_hash,
    v.item_count,
    v.lock_version
  INTO
    v_version_id,
    v_version_string,
    v_status,
    v_is_default,
    v_dataset_hash,
    v_item_count,
    v_lock_version
  FROM public.price_list_default_version dv
  JOIN public.price_list_versions v ON v.id = dv.version_id
  WHERE dv.id = true;

  IF v_version_id IS DISTINCT FROM 'ad957c94-a6ed-488b-8181-32333d4ab0ed'::uuid
     OR v_version_string IS DISTINCT FROM '2568.1.0'
     OR v_status IS DISTINCT FROM 'active'
     OR v_is_default IS DISTINCT FROM true
     OR v_dataset_hash IS DISTINCT FROM
       'sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733'
     OR v_item_count IS DISTINCT FROM 710
     OR v_lock_version IS DISTINCT FROM 4 THEN
    RAISE EXCEPTION
      'P49 preflight blocked: published/default Master Catalog authority binding drifted';
  END IF;

  SELECT
    count(*)::bigint,
    count(*) FILTER (WHERE pl.is_active = true)::bigint,
    count(*) FILTER (WHERE pl.is_active = false)::bigint
  INTO v_total_rows, v_active_rows, v_inactive_rows
  FROM public.price_list pl
  WHERE pl.version_id = v_version_id;

  IF v_total_rows <> 710 OR v_active_rows <> 710 OR v_inactive_rows <> 0 THEN
    RAISE EXCEPTION
      'P49 preflight blocked: 2568.1.0 row posture drifted (total %, active %, inactive %)',
      v_total_rows,
      v_active_rows,
      v_inactive_rows;
  END IF;
END;
$p49_master_catalog_authority_preflight$;

-- Capture rollback-independent in-transaction preservation fingerprints. Counts
-- are fresh values, never hardcoded Production counts.
CREATE TEMP TABLE p49_preserve_fingerprints (
  object_name text PRIMARY KEY,
  row_count bigint NOT NULL,
  row_sha256 text NOT NULL
) ON COMMIT DROP;

DO $p49_capture_preserve_fingerprints$
DECLARE
  v_object text;
  v_count bigint;
  v_hash text;
BEGIN
  FOREACH v_object IN ARRAY ARRAY[
    'public.user_profiles',
    'public.app_settings',
    'public.organizations',
    'public.departments',
    'public.sectors',
    'public.boq',
    'public.boq_items',
    'public.boq_routes',
    'public.factor_reference',
    'public.factor_reference_versions',
    'public.factor_reference_rows',
    'public.factor_reference_default_version',
    'public.price_list_versions',
    'public.price_list',
    'public.price_list_audit_logs',
    'public.price_list_default_version',
    'public.catalog_item_identities',
    'public.catalog_item_codes',
    'public.price_list_categories',
    'public.catalog_code_groups',
    'public.catalog_imports',
    'public.catalog_change_sets',
    'public.catalog_change_items',
    'public.catalog_code_group_dictionary',
    'public.catalog_first_rollout_mappings',
    'public.catalog_first_rollout_source_exclusions',
    'public.catalog_placement_reviews',
    'private.catalog_code_sequences'
  ]
  LOOP
    IF to_regclass(v_object) IS NULL THEN
      RAISE EXCEPTION 'P49 preflight blocked: preserve-set table % is missing', v_object;
    END IF;

    EXECUTE pg_catalog.format(
      'SELECT count(*)::bigint, encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(string_agg(to_jsonb(t)::text, '''' ORDER BY to_jsonb(t)::text), ''''), ''UTF8'')), ''hex'') FROM %s t',
      v_object
    ) INTO v_count, v_hash;

    INSERT INTO p49_preserve_fingerprints(object_name, row_count, row_sha256)
    VALUES (v_object, v_count, v_hash);
  END LOOP;
END;
$p49_capture_preserve_fingerprints$;

CREATE TEMP TABLE p49_catalog_policy_fingerprint
ON COMMIT DROP
AS
SELECT pg_catalog.encode(
  pg_catalog.sha256(
    pg_catalog.convert_to(
      coalesce(
        pg_catalog.string_agg(
          pg_catalog.concat_ws('|', schemaname, tablename, policyname,
            permissive, cmd, roles::text, qual, with_check),
          E'\n' ORDER BY schemaname, tablename, policyname
        ),
        ''
      ),
      'UTF8'
    )
  ),
  'hex'
) AS sha256
FROM pg_catalog.pg_policies
WHERE (
    schemaname = 'public'
    AND tablename IN (
      'price_list_versions', 'price_list', 'price_list_audit_logs',
      'price_list_default_version', 'catalog_item_identities',
      'catalog_item_codes', 'price_list_categories', 'catalog_code_groups',
      'catalog_imports', 'catalog_change_sets', 'catalog_change_items',
      'catalog_code_group_dictionary', 'catalog_first_rollout_mappings',
      'catalog_first_rollout_source_exclusions', 'catalog_placement_reviews'
    )
  )
  OR (schemaname = 'private' AND tablename = 'catalog_code_sequences');

CREATE TEMP TABLE p49_catalog_function_fingerprint
ON COMMIT DROP
AS
SELECT pg_catalog.encode(
  pg_catalog.sha256(
    pg_catalog.convert_to(
      coalesce(
        pg_catalog.string_agg(
          pg_catalog.concat_ws('|', n.nspname,
            p.oid::regprocedure::text,
            pg_catalog.pg_get_userbyid(p.proowner),
            p.prosecdef::text,
            p.proconfig::text,
            p.proacl::text,
            pg_catalog.pg_get_functiondef(p.oid)),
          E'\n' ORDER BY n.nspname, p.oid::regprocedure::text
        ),
        ''
      ),
      'UTF8'
    )
  ),
  'hex'
) AS sha256
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private')
  AND p.proname ILIKE '%catalog%'
  AND p.oid IS DISTINCT FROM to_regprocedure('public.get_my_catalog_capabilities()');

-- -----------------------------------------------------------------------------
-- 2. Canonical current-caller helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.p49_current_profile_recognized()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
      AND p.status IN ('active', 'inactive', 'suspended', 'pending')
  );
$function$;

CREATE OR REPLACE FUNCTION private.p49_current_profile_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
      AND p.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION private.p49_current_active_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT p.role
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.status = 'active'
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement');
$function$;

CREATE OR REPLACE FUNCTION private.p49_current_active_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT p.department_id
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.status = 'active'
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement');
$function$;

CREATE OR REPLACE FUNCTION private.p49_current_selector_reader()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
      AND p.status IN ('active', 'pending')
  );
$function$;

CREATE OR REPLACE FUNCTION private.p49_current_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
      AND p.status = 'active'
  );
$function$;

ALTER FUNCTION private.p49_current_profile_recognized() OWNER TO postgres;
ALTER FUNCTION private.p49_current_profile_active() OWNER TO postgres;
ALTER FUNCTION private.p49_current_active_role() OWNER TO postgres;
ALTER FUNCTION private.p49_current_active_department_id() OWNER TO postgres;
ALTER FUNCTION private.p49_current_selector_reader() OWNER TO postgres;
ALTER FUNCTION private.p49_current_active_admin() OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION private.p49_current_profile_recognized()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.p49_current_profile_active()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.p49_current_active_role()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.p49_current_active_department_id()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.p49_current_selector_reader()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.p49_current_active_admin()
  FROM PUBLIC, anon, authenticated, service_role;

-- Exact RLS dependencies require authenticated execution. Each helper exposes
-- only the current caller's state and accepts no user-supplied identity.
GRANT EXECUTE ON FUNCTION private.p49_current_profile_recognized() TO authenticated;
GRANT EXECUTE ON FUNCTION private.p49_current_profile_active() TO authenticated;
GRANT EXECUTE ON FUNCTION private.p49_current_active_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.p49_current_active_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.p49_current_selector_reader() TO authenticated;
GRANT EXECUTE ON FUNCTION private.p49_current_active_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. Profile default, protected-field guard, and append-only audit
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_profiles
  ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.user_profiles
  ALTER COLUMN status SET NOT NULL;

CREATE TABLE public.user_authorization_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  target_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN (
    'onboarding_submitted',
    'onboarding_resubmitted',
    'approved',
    'rejected',
    'suspended',
    'deactivated',
    'reactivated',
    'role_changed'
  )),
  old_role text,
  new_role text,
  old_status text,
  new_status text,
  reason text NOT NULL CHECK (pg_catalog.btrim(reason) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_authorization_events_idempotency
    UNIQUE (request_id, action, target_id)
);

ALTER TABLE public.user_authorization_events OWNER TO postgres;
ALTER TABLE public.user_authorization_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_authorization_events_target_created_idx
  ON public.user_authorization_events (target_id, created_at DESC);
CREATE INDEX user_authorization_events_actor_created_idx
  ON public.user_authorization_events (actor_id, created_at DESC);

CREATE OR REPLACE FUNCTION private.p49_reject_authorization_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'user authorization events are append-only';
END;
$function$;

ALTER FUNCTION private.p49_reject_authorization_event_mutation() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION private.p49_reject_authorization_event_mutation()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER trg_p49_authorization_events_immutable
BEFORE UPDATE OR DELETE ON public.user_authorization_events
FOR EACH ROW EXECUTE FUNCTION private.p49_reject_authorization_event_mutation();

CREATE POLICY p49_user_authorization_events_admin_select
ON public.user_authorization_events
FOR SELECT TO authenticated
USING ((SELECT private.p49_current_active_admin()));

REVOKE ALL ON TABLE public.user_authorization_events
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.user_authorization_events TO authenticated;

CREATE OR REPLACE FUNCTION private.p49_guard_user_profile_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_action text := current_setting('conduit.p49_profile_action', true);
BEGIN
  -- P49 CONTRACT: no-hard-delete
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'user hard delete is disabled';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF v_action IS DISTINCT FROM 'signup'
       OR NEW.role IS DISTINCT FROM 'staff'
       OR NEW.status IS DISTINCT FROM 'pending'
       OR NEW.org_id IS NOT NULL
       OR NEW.department_id IS NOT NULL
       OR NEW.sector_id IS NOT NULL
       OR NEW.approved_at IS NOT NULL
       OR NEW.approved_by IS NOT NULL
       OR NEW.rejected_at IS NOT NULL
       OR NEW.rejected_by IS NOT NULL
       OR NEW.admin_note IS NOT NULL
       OR COALESCE(NEW.onboarding_completed, false) THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'untrusted profile creation is denied';
    END IF;
    RETURN NEW;
  END IF;

  IF v_action IS NULL OR v_action NOT IN (
    'self_profile_update', 'onboarding_submitted', 'onboarding_resubmitted',
    'admin_approved', 'admin_rejected', 'admin_suspended',
    'admin_deactivated', 'admin_reactivated', 'admin_role_changed'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'direct profile update is denied';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile identity fields are immutable';
  END IF;

  -- P49 CONTRACT: exact-profile-transition-deltas
  -- Compare the whole row after removing only the columns that the selected
  -- bounded action is allowed to write. This also protects columns introduced
  -- by later schema changes instead of silently allowing them through.
  IF v_action = 'self_profile_update'
     AND (
       to_jsonb(NEW) - ARRAY[
         'first_name', 'last_name', 'title', 'position', 'employee_id',
         'phone', 'updated_at'
       ]::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY[
         'first_name', 'last_name', 'title', 'position', 'employee_id',
         'phone', 'updated_at'
       ]::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'self profile update exceeded its exact column delta';
  ELSIF v_action IN ('onboarding_submitted', 'onboarding_resubmitted')
     AND (
       to_jsonb(NEW) - ARRAY[
         'first_name', 'last_name', 'title', 'position', 'employee_id',
         'phone', 'requested_department_id', 'requested_sector_id',
         'onboarding_completed', 'rejected_at', 'rejected_by', 'admin_note',
         'updated_at'
       ]::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY[
         'first_name', 'last_name', 'title', 'position', 'employee_id',
         'phone', 'requested_department_id', 'requested_sector_id',
         'onboarding_completed', 'rejected_at', 'rejected_by', 'admin_note',
         'updated_at'
       ]::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'onboarding submission exceeded its exact column delta';
  ELSIF v_action = 'admin_approved'
     AND (
       to_jsonb(NEW) - ARRAY[
         'org_id', 'department_id', 'sector_id', 'status', 'approved_at',
         'approved_by', 'rejected_at', 'rejected_by', 'admin_note',
         'updated_at'
       ]::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY[
         'org_id', 'department_id', 'sector_id', 'status', 'approved_at',
         'approved_by', 'rejected_at', 'rejected_by', 'admin_note',
         'updated_at'
       ]::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'approval exceeded its exact column delta';
  ELSIF v_action = 'admin_rejected'
     AND (
       to_jsonb(NEW) - ARRAY[
         'approved_at', 'approved_by', 'rejected_at', 'rejected_by',
         'admin_note', 'updated_at'
       ]::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY[
         'approved_at', 'approved_by', 'rejected_at', 'rejected_by',
         'admin_note', 'updated_at'
       ]::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'rejection exceeded its exact column delta';
  ELSIF v_action IN ('admin_suspended', 'admin_deactivated', 'admin_reactivated')
     AND (
       to_jsonb(NEW) - ARRAY['status', 'admin_note', 'updated_at']::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY['status', 'admin_note', 'updated_at']::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'status transition exceeded its exact column delta';
  ELSIF v_action = 'admin_role_changed'
     AND (
       to_jsonb(NEW) - ARRAY['role', 'admin_note', 'updated_at']::text[]
     ) IS DISTINCT FROM (
       to_jsonb(OLD) - ARRAY['role', 'admin_note', 'updated_at']::text[]
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'role transition exceeded its exact column delta';
  END IF;

  IF v_action IN ('self_profile_update', 'onboarding_submitted', 'onboarding_resubmitted') THEN
    IF (SELECT auth.uid()) IS DISTINCT FROM OLD.id
       OR OLD.status NOT IN ('active', 'pending')
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.org_id IS DISTINCT FROM OLD.org_id
       OR NEW.department_id IS DISTINCT FROM OLD.department_id
       OR NEW.sector_id IS DISTINCT FROM OLD.sector_id
       OR NEW.signature_url IS DISTINCT FROM OLD.signature_url
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'protected profile fields cannot be self-updated';
    END IF;

    IF OLD.status = 'active' AND (
      NEW.requested_department_id IS DISTINCT FROM OLD.requested_department_id
      OR NEW.requested_sector_id IS DISTINCT FROM OLD.requested_sector_id
      OR NEW.onboarding_completed IS DISTINCT FROM OLD.onboarding_completed
      OR NEW.rejected_at IS DISTINCT FROM OLD.rejected_at
      OR NEW.rejected_by IS DISTINCT FROM OLD.rejected_by
      OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active profile organization request is locked';
    END IF;

    IF v_action = 'self_profile_update' AND (
      NEW.requested_department_id IS DISTINCT FROM OLD.requested_department_id
      OR NEW.requested_sector_id IS DISTINCT FROM OLD.requested_sector_id
      OR NEW.onboarding_completed IS DISTINCT FROM OLD.onboarding_completed
      OR NEW.rejected_at IS DISTINCT FROM OLD.rejected_at
      OR NEW.rejected_by IS DISTINCT FROM OLD.rejected_by
      OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'onboarding state requires the bounded submit action';
    END IF;

    IF v_action IN ('onboarding_submitted', 'onboarding_resubmitted') AND (
      OLD.status <> 'pending'
      OR NOT COALESCE(NEW.onboarding_completed, false)
      OR NEW.requested_department_id IS NULL
      OR NEW.requested_sector_id IS NULL
      OR NEW.rejected_at IS NOT NULL
      OR NEW.rejected_by IS NOT NULL
      OR NEW.admin_note IS NOT NULL
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid onboarding submission state';
    END IF;

    RETURN NEW;
  END IF;

  -- All authority transitions are executed only by postgres-owned audited RPCs.
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile authority transition is owner-only';
  END IF;

  IF v_action = 'admin_approved' AND NOT (
    OLD.status = 'pending' AND NEW.status = 'active'
    AND NEW.role IS NOT DISTINCT FROM OLD.role
    AND NEW.requested_department_id IS NOT NULL
    AND NEW.requested_sector_id IS NOT NULL
    AND NEW.department_id IS NOT DISTINCT FROM NEW.requested_department_id
    AND NEW.sector_id IS NOT DISTINCT FROM NEW.requested_sector_id
    AND NEW.approved_at IS NOT NULL AND NEW.approved_by = (SELECT auth.uid())
    AND NEW.rejected_at IS NULL AND NEW.rejected_by IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid pending-to-active transition';
  ELSIF v_action = 'admin_rejected' AND NOT (
    OLD.status = 'pending' AND NEW.status = 'pending'
    AND NEW.role IS NOT DISTINCT FROM OLD.role
    AND NEW.rejected_at IS NOT NULL AND NEW.rejected_by = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid rejection transition';
  ELSIF v_action = 'admin_suspended' AND NOT (
    OLD.status = 'active' AND NEW.status = 'suspended'
    AND NEW.role IS NOT DISTINCT FROM OLD.role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid suspension transition';
  ELSIF v_action = 'admin_deactivated' AND NOT (
    OLD.status = 'active' AND NEW.status = 'inactive'
    AND NEW.role IS NOT DISTINCT FROM OLD.role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid deactivation transition';
  ELSIF v_action = 'admin_reactivated' AND NOT (
    OLD.status IN ('inactive', 'suspended') AND NEW.status = 'active'
    AND NEW.role IS NOT DISTINCT FROM OLD.role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid reactivation transition';
  ELSIF v_action = 'admin_role_changed' AND NOT (
    OLD.status = 'active' AND NEW.status = 'active'
    AND NEW.role IS DISTINCT FROM OLD.role
    AND NEW.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid role transition';
  END IF;

  RETURN NEW;
END;
$function$;

ALTER FUNCTION private.p49_guard_user_profile_mutation() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION private.p49_guard_user_profile_mutation()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_lock_org ON public.user_profiles;
DROP TRIGGER IF EXISTS trg_p49_guard_user_profile_mutation ON public.user_profiles;
REVOKE EXECUTE ON FUNCTION public.lock_org_fields_after_onboarding()
  FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION public.lock_org_fields_after_onboarding();
CREATE TRIGGER trg_p49_guard_user_profile_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION private.p49_guard_user_profile_mutation();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM pg_catalog.set_config('conduit.p49_profile_action', 'signup', true);

  INSERT INTO public.user_profiles (
    id, email, first_name, last_name, status, role, onboarding_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'pending',
    'staff',
    false
  );

  RETURN NEW;
END;
$function$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_profile_v2()
RETURNS TABLE (
  id uuid,
  employee_id text,
  title text,
  first_name text,
  last_name text,
  position text,
  org_id uuid,
  department_id uuid,
  sector_id uuid,
  role text,
  email text,
  phone text,
  signature_url text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  requested_department_id uuid,
  requested_sector_id uuid,
  approved_at timestamptz,
  approved_by uuid,
  rejected_at timestamptz,
  rejected_by uuid,
  admin_note text,
  onboarding_completed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    p.id, p.employee_id, p.title, p.first_name, p.last_name, p.position,
    p.org_id, p.department_id, p.sector_id, p.role, p.email, p.phone,
    p.signature_url, p.status, p.created_at, p.updated_at,
    p.requested_department_id, p.requested_sector_id,
    p.approved_at, p.approved_by, p.rejected_at, p.rejected_by,
    p.admin_note, p.onboarding_completed
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
    AND p.status IN ('active', 'inactive', 'suspended', 'pending');
$function$;

CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_first_name text,
  p_last_name text,
  p_title text,
  p_position text,
  p_employee_id text,
  p_phone text,
  p_requested_department_id uuid,
  p_requested_sector_id uuid,
  p_submit_onboarding boolean,
  p_request_id uuid
)
RETURNS TABLE (
  id uuid,
  employee_id text,
  title text,
  first_name text,
  last_name text,
  position text,
  org_id uuid,
  department_id uuid,
  sector_id uuid,
  role text,
  email text,
  phone text,
  signature_url text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  requested_department_id uuid,
  requested_sector_id uuid,
  approved_at timestamptz,
  approved_by uuid,
  rejected_at timestamptz,
  rejected_by uuid,
  admin_note text,
  onboarding_completed boolean
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
SET lock_timeout = '5s'
SET statement_timeout = '15s'
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_profile public.user_profiles%ROWTYPE;
  v_action text := 'self_profile_update';
  v_prior_request_action text;
BEGIN
  IF v_actor_id IS NULL OR p_request_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'authenticated actor and request ID are required';
  END IF;

  -- P49 CONTRACT: deterministic-lock-order (single profile lock).
  SELECT p.* INTO v_profile
  FROM public.user_profiles p
  WHERE p.id = v_actor_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_profile.role NOT IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
     OR v_profile.status NOT IN ('active', 'pending') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'profile update is not authorized';
  END IF;

  SELECT e.action
  INTO v_prior_request_action
  FROM public.user_authorization_events e
    WHERE e.request_id = p_request_id
      AND e.target_id = v_actor_id
      AND e.action IN ('onboarding_submitted', 'onboarding_resubmitted')
  ORDER BY e.created_at, e.id
  LIMIT 1;

  IF v_prior_request_action IS NOT NULL THEN
    IF NOT COALESCE(p_submit_onboarding, false)
       OR v_profile.first_name IS DISTINCT FROM COALESCE(p_first_name, '')
       OR v_profile.last_name IS DISTINCT FROM COALESCE(p_last_name, '')
       OR v_profile.title IS DISTINCT FROM p_title
       OR v_profile.position IS DISTINCT FROM p_position
       OR v_profile.employee_id IS DISTINCT FROM p_employee_id
       OR v_profile.phone IS DISTINCT FROM p_phone
       OR v_profile.requested_department_id IS DISTINCT FROM p_requested_department_id
       OR v_profile.requested_sector_id IS DISTINCT FROM p_requested_sector_id
       OR NOT COALESCE(v_profile.onboarding_completed, false)
       OR v_profile.rejected_at IS NOT NULL
       OR v_profile.rejected_by IS NOT NULL
       OR v_profile.admin_note IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23505',
        MESSAGE = 'request ID replay payload does not match the recorded onboarding submission';
    END IF;

    RETURN QUERY
    SELECT
      p.id, p.employee_id, p.title, p.first_name, p.last_name, p.position,
      p.org_id, p.department_id, p.sector_id, p.role, p.email, p.phone,
      p.signature_url, p.status, p.created_at, p.updated_at,
      p.requested_department_id, p.requested_sector_id,
      p.approved_at, p.approved_by, p.rejected_at, p.rejected_by,
      p.admin_note, p.onboarding_completed
    FROM public.user_profiles p
    WHERE p.id = v_actor_id;
    RETURN;
  END IF;

  IF COALESCE(p_submit_onboarding, false) THEN
    IF v_profile.status <> 'pending'
       OR p_requested_department_id IS NULL
       OR p_requested_sector_id IS NULL
       OR NOT EXISTS (
         SELECT 1
         FROM public.departments d
         JOIN public.organizations o ON o.id = d.org_id
         JOIN public.sectors s ON s.department_id = d.id
         WHERE d.id = p_requested_department_id
           AND s.id = p_requested_sector_id
           AND COALESCE(o.is_active, false)
           AND COALESCE(d.is_active, false)
           AND COALESCE(s.is_active, false)
       ) THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'active hierarchical onboarding selectors are required';
    END IF;

    v_action := CASE
      WHEN COALESCE(v_profile.onboarding_completed, false)
        OR v_profile.rejected_at IS NOT NULL
      THEN 'onboarding_resubmitted'
      ELSE 'onboarding_submitted'
    END;
  END IF;

  PERFORM pg_catalog.set_config('conduit.p49_profile_action', v_action, true);

  UPDATE public.user_profiles p
  SET first_name = COALESCE(p_first_name, ''),
      last_name = COALESCE(p_last_name, ''),
      title = p_title,
      position = p_position,
      employee_id = p_employee_id,
      phone = p_phone,
      requested_department_id = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN p_requested_department_id
        ELSE p.requested_department_id
      END,
      requested_sector_id = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN p_requested_sector_id
        ELSE p.requested_sector_id
      END,
      onboarding_completed = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN true
        ELSE p.onboarding_completed
      END,
      rejected_at = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN NULL
        ELSE p.rejected_at
      END,
      rejected_by = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN NULL
        ELSE p.rejected_by
      END,
      admin_note = CASE
        WHEN COALESCE(p_submit_onboarding, false) THEN NULL
        ELSE p.admin_note
      END,
      updated_at = now()
  WHERE p.id = v_actor_id;

  IF COALESCE(p_submit_onboarding, false) THEN
    INSERT INTO public.user_authorization_events (
      request_id, actor_id, target_id, action,
      old_role, new_role, old_status, new_status, reason
    ) VALUES (
      p_request_id, v_actor_id, v_actor_id, v_action,
      v_profile.role, v_profile.role, v_profile.status, v_profile.status,
      CASE WHEN v_action = 'onboarding_resubmitted'
        THEN 'profile onboarding resubmitted'
        ELSE 'profile onboarding submitted'
      END
    );
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.employee_id, p.title, p.first_name, p.last_name, p.position,
    p.org_id, p.department_id, p.sector_id, p.role, p.email, p.phone,
    p.signature_url, p.status, p.created_at, p.updated_at,
    p.requested_department_id, p.requested_sector_id,
    p.approved_at, p.approved_by, p.rejected_at, p.rejected_by,
    p.admin_note, p.onboarding_completed
  FROM public.user_profiles p
  WHERE p.id = v_actor_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_authorized_profiles_page(
  p_limit integer DEFAULT 50,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid, employee_id text, title text, first_name text, last_name text,
  position text, org_id uuid, department_id uuid, sector_id uuid, role text,
  email text, phone text, signature_url text, status text,
  created_at timestamptz, updated_at timestamptz,
  requested_department_id uuid, requested_sector_id uuid,
  approved_at timestamptz, approved_by uuid,
  rejected_at timestamptz, rejected_by uuid,
  admin_note text, onboarding_completed boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_actor public.user_profiles%ROWTYPE;
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
BEGIN
  SELECT p.* INTO v_actor
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
    AND p.status = 'active';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.employee_id, p.title, p.first_name, p.last_name, p.position,
    p.org_id, p.department_id, p.sector_id, p.role, p.email, p.phone,
    p.signature_url, p.status, p.created_at, p.updated_at,
    p.requested_department_id, p.requested_sector_id,
    p.approved_at, p.approved_by, p.rejected_at, p.rejected_by,
    p.admin_note, p.onboarding_completed
  FROM public.user_profiles p
  WHERE (
      p.id = v_actor.id
      OR (
        v_actor.status = 'active'
        AND v_actor.role = 'admin'
      )
      OR (
        v_actor.status = 'active'
        AND v_actor.role IN ('dept_manager', 'sector_manager')
        AND v_actor.department_id IS NOT NULL
        AND p.department_id = v_actor.department_id
      )
    )
    AND (
      p_cursor_created_at IS NULL
      OR p_cursor_id IS NULL
      OR (p.created_at, p.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT v_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_profiles_page(
  p_limit integer DEFAULT 50,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid, employee_id text, title text, first_name text, last_name text,
  position text, org_id uuid, department_id uuid, sector_id uuid, role text,
  email text, phone text, signature_url text, status text,
  created_at timestamptz, updated_at timestamptz,
  requested_department_id uuid, requested_sector_id uuid,
  approved_at timestamptz, approved_by uuid,
  rejected_at timestamptz, rejected_by uuid,
  admin_note text, onboarding_completed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    p.id, p.employee_id, p.title, p.first_name, p.last_name, p.position,
    p.org_id, p.department_id, p.sector_id, p.role, p.email, p.phone,
    p.signature_url, p.status, p.created_at, p.updated_at,
    p.requested_department_id, p.requested_sector_id,
    p.approved_at, p.approved_by, p.rejected_at, p.rejected_by,
    p.admin_note, p.onboarding_completed
  FROM public.user_profiles p
  WHERE (SELECT private.p49_current_active_admin())
    AND (
      p_cursor_created_at IS NULL
      OR p_cursor_id IS NULL
      OR (p.created_at, p.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$function$;

-- Owner-only transition core. Actor and target profiles are always locked in
-- ascending UUID order before either is re-read or mutated.
CREATE OR REPLACE FUNCTION private.p49_admin_transition(
  p_target_id uuid,
  p_action text,
  p_new_role text,
  p_reason text,
  p_request_id uuid
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
SET lock_timeout = '5s'
SET statement_timeout = '15s'
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_actor public.user_profiles%ROWTYPE;
  v_target public.user_profiles%ROWTYPE;
  v_org_id uuid;
  v_new_status text;
  v_event_action text;
  v_guard_action text;
  v_expected_replay_status text;
  v_existing_event public.user_authorization_events%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL OR p_target_id IS NULL OR p_request_id IS NULL
     OR NULLIF(btrim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor, target, request ID, and reason are required';
  END IF;

  -- P49 CONTRACT: deterministic-lock-order
  PERFORM p.id
  FROM public.user_profiles p
  WHERE p.id IN (v_actor_id, p_target_id)
  ORDER BY p.id
  FOR UPDATE;

  SELECT p.* INTO v_actor FROM public.user_profiles p WHERE p.id = v_actor_id;
  SELECT p.* INTO v_target FROM public.user_profiles p WHERE p.id = p_target_id;

  IF v_actor.id IS NULL OR v_actor.status <> 'active' OR v_actor.role <> 'admin' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;
  IF v_target.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'target profile was not found';
  END IF;
  IF v_target.id = v_actor.id THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'self authority transition is denied';
  END IF;

  v_event_action := CASE p_action
    WHEN 'approve' THEN 'approved'
    WHEN 'reject' THEN 'rejected'
    WHEN 'suspend' THEN 'suspended'
    WHEN 'deactivate' THEN 'deactivated'
    WHEN 'reactivate' THEN 'reactivated'
    WHEN 'set_role' THEN 'role_changed'
    ELSE NULL
  END;
  v_guard_action := CASE p_action
    WHEN 'approve' THEN 'admin_approved'
    WHEN 'reject' THEN 'admin_rejected'
    WHEN 'suspend' THEN 'admin_suspended'
    WHEN 'deactivate' THEN 'admin_deactivated'
    WHEN 'reactivate' THEN 'admin_reactivated'
    WHEN 'set_role' THEN 'admin_role_changed'
    ELSE NULL
  END;

  IF v_event_action IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown profile transition';
  END IF;

  IF p_action = 'set_role' THEN
    IF p_new_role IS NULL
       OR p_new_role NOT IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a recognized new role is required';
    END IF;
  ELSIF p_new_role IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'new role is valid only for role changes';
  END IF;

  v_expected_replay_status := CASE p_action
    WHEN 'approve' THEN 'active'
    WHEN 'reject' THEN 'pending'
    WHEN 'suspend' THEN 'suspended'
    WHEN 'deactivate' THEN 'inactive'
    WHEN 'reactivate' THEN 'active'
    WHEN 'set_role' THEN 'active'
  END;

  SELECT e.* INTO v_existing_event
  FROM public.user_authorization_events e
    WHERE e.request_id = p_request_id
      AND e.action = v_event_action
      AND e.target_id = p_target_id;

  IF FOUND THEN
    IF v_existing_event.actor_id IS DISTINCT FROM v_actor_id
       OR v_existing_event.reason IS DISTINCT FROM p_reason
       OR v_existing_event.new_status IS DISTINCT FROM v_expected_replay_status
       OR (
         p_action = 'set_role'
         AND v_existing_event.new_role IS DISTINCT FROM p_new_role
       ) THEN
      RAISE EXCEPTION USING
        ERRCODE = '23505',
        MESSAGE = 'request ID replay payload does not match the recorded transition';
    END IF;
    RETURN;
  END IF;

  IF p_action = 'approve' THEN
    IF v_target.status <> 'pending'
       OR NOT COALESCE(v_target.onboarding_completed, false)
       OR v_target.requested_department_id IS NULL
       OR v_target.requested_sector_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'only a complete pending profile can be approved';
    END IF;

    SELECT d.org_id INTO v_org_id
    FROM public.departments d
    JOIN public.organizations o ON o.id = d.org_id
    JOIN public.sectors s ON s.department_id = d.id
    WHERE d.id = v_target.requested_department_id
      AND s.id = v_target.requested_sector_id
      AND COALESCE(o.is_active, false)
      AND COALESCE(d.is_active, false)
      AND COALESCE(s.is_active, false);

    IF v_org_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'requested organization hierarchy is not active';
    END IF;
    v_new_status := 'active';
  ELSIF p_action = 'reject' THEN
    IF v_target.status <> 'pending' THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'only a pending profile can be rejected';
    END IF;
    v_new_status := 'pending';
  ELSIF p_action = 'suspend' THEN
    IF v_target.status <> 'active' THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'only an active profile can be suspended';
    END IF;
    v_new_status := 'suspended';
  ELSIF p_action = 'deactivate' THEN
    IF v_target.status <> 'active' THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'only an active profile can be deactivated';
    END IF;
    v_new_status := 'inactive';
  ELSIF p_action = 'reactivate' THEN
    IF v_target.status NOT IN ('inactive', 'suspended') THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'only inactive or suspended profile can be reactivated';
    END IF;
    v_new_status := 'active';
  ELSE
    IF v_target.status <> 'active'
       OR p_new_role NOT IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
       OR p_new_role IS NOT DISTINCT FROM v_target.role THEN
      RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'role change requires an active target and a different recognized role';
    END IF;
    v_new_status := v_target.status;
  END IF;

  PERFORM pg_catalog.set_config('conduit.p49_profile_action', v_guard_action, true);

  IF p_action = 'approve' THEN
    UPDATE public.user_profiles p
    SET org_id = v_org_id,
        department_id = v_target.requested_department_id,
        sector_id = v_target.requested_sector_id,
        status = 'active',
        approved_at = now(),
        approved_by = v_actor_id,
        rejected_at = NULL,
        rejected_by = NULL,
        admin_note = p_reason,
        updated_at = now()
    WHERE p.id = p_target_id;
  ELSIF p_action = 'reject' THEN
    UPDATE public.user_profiles p
    SET status = 'pending',
        rejected_at = now(),
        rejected_by = v_actor_id,
        approved_at = NULL,
        approved_by = NULL,
        admin_note = p_reason,
        updated_at = now()
    WHERE p.id = p_target_id;
  ELSIF p_action IN ('suspend', 'deactivate', 'reactivate') THEN
    UPDATE public.user_profiles p
    SET status = v_new_status,
        admin_note = p_reason,
        updated_at = now()
    WHERE p.id = p_target_id;
  ELSE
    UPDATE public.user_profiles p
    SET role = p_new_role,
        admin_note = p_reason,
        updated_at = now()
    WHERE p.id = p_target_id;
  END IF;

  INSERT INTO public.user_authorization_events (
    request_id, actor_id, target_id, action,
    old_role, new_role, old_status, new_status, reason
  ) VALUES (
    p_request_id, v_actor_id, p_target_id, v_event_action,
    v_target.role,
    CASE WHEN p_action = 'set_role' THEN p_new_role ELSE v_target.role END,
    v_target.status, v_new_status, p_reason
  );
END;
$function$;

ALTER FUNCTION private.p49_admin_transition(uuid,text,text,text,uuid) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION private.p49_admin_transition(uuid,text,text,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_approve_user(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_reject_user(uuid,text)
  FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION public.admin_approve_user(uuid);
DROP FUNCTION public.admin_reject_user(uuid,text);

CREATE FUNCTION public.admin_approve_user(
  p_target_id uuid,
  p_request_id uuid,
  p_reason text
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'approve', NULL, p_reason, p_request_id);
$function$;

CREATE FUNCTION public.admin_reject_user(
  p_target_id uuid,
  p_reason text,
  p_request_id uuid
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'reject', NULL, p_reason, p_request_id);
$function$;

CREATE FUNCTION public.admin_suspend_user(
  p_target_id uuid,
  p_reason text,
  p_request_id uuid
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'suspend', NULL, p_reason, p_request_id);
$function$;

CREATE FUNCTION public.admin_deactivate_user(
  p_target_id uuid,
  p_reason text,
  p_request_id uuid
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'deactivate', NULL, p_reason, p_request_id);
$function$;

CREATE FUNCTION public.admin_reactivate_user(
  p_target_id uuid,
  p_reason text,
  p_request_id uuid
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'reactivate', NULL, p_reason, p_request_id);
$function$;

CREATE FUNCTION public.admin_set_user_role(
  p_target_id uuid,
  p_new_role text,
  p_reason text,
  p_request_id uuid
)
RETURNS void LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT private.p49_admin_transition(p_target_id, 'set_role', p_new_role, p_reason, p_request_id);
$function$;

-- Legacy helper signatures are either revoked or made self/current-active only.
REVOKE EXECUTE ON FUNCTION public.get_my_profile()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT p.role
  FROM public.user_profiles p
  WHERE user_id = (SELECT auth.uid())
    AND p.id = (SELECT auth.uid())
    AND p.status = 'active'
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement');
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'admin'
        AND p.status = 'active'
    ),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_approve_boq(p_boq_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_actor public.user_profiles%ROWTYPE;
  v_boq public.boq%ROWTYPE;
BEGIN
  SELECT p.* INTO v_actor
  FROM public.user_profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.status = 'active'
    AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement');
  IF NOT FOUND THEN RETURN false; END IF;

  SELECT b.* INTO v_boq FROM public.boq b WHERE b.id = p_boq_id;
  IF NOT FOUND OR v_boq.created_by = v_actor.id THEN RETURN false; END IF;

  IF v_actor.role = 'admin' THEN RETURN true; END IF;
  IF v_actor.role = 'sector_manager'
     AND v_boq.sector_id = v_actor.sector_id
     AND v_boq.status = 'pending_review' THEN RETURN true; END IF;
  IF v_actor.role = 'dept_manager'
     AND v_boq.department_id = v_actor.department_id
     AND v_boq.status = 'pending_approval' THEN RETURN true; END IF;
  RETURN false;
END;
$function$;

ALTER FUNCTION public.get_my_profile_v2() OWNER TO postgres;
ALTER FUNCTION public.update_my_profile(text,text,text,text,text,text,uuid,uuid,boolean,uuid) OWNER TO postgres;
ALTER FUNCTION public.get_authorized_profiles_page(integer,timestamptz,uuid) OWNER TO postgres;
ALTER FUNCTION public.get_admin_profiles_page(integer,timestamptz,uuid) OWNER TO postgres;
ALTER FUNCTION public.admin_approve_user(uuid,uuid,text) OWNER TO postgres;
ALTER FUNCTION public.admin_reject_user(uuid,text,uuid) OWNER TO postgres;
ALTER FUNCTION public.admin_suspend_user(uuid,text,uuid) OWNER TO postgres;
ALTER FUNCTION public.admin_deactivate_user(uuid,text,uuid) OWNER TO postgres;
ALTER FUNCTION public.admin_reactivate_user(uuid,text,uuid) OWNER TO postgres;
ALTER FUNCTION public.admin_set_user_role(uuid,text,text,uuid) OWNER TO postgres;
ALTER FUNCTION public.get_user_role(uuid) OWNER TO postgres;
ALTER FUNCTION public.is_admin(uuid) OWNER TO postgres;
ALTER FUNCTION public.can_approve_boq(uuid) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.get_my_profile_v2()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.update_my_profile(text,text,text,text,text,text,uuid,uuid,boolean,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_authorized_profiles_page(integer,timestamptz,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_admin_profiles_page(integer,timestamptz,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_approve_user(uuid,uuid,text)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_reject_user(uuid,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_suspend_user(uuid,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_deactivate_user(uuid,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_reactivate_user(uuid,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.can_approve_boq(uuid)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_my_profile_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_my_profile(text,text,text,text,text,text,uuid,uuid,boolean,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_authorized_profiles_page(integer,timestamptz,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_profiles_page(integer,timestamptz,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_user(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_user(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_suspend_user(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_deactivate_user(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reactivate_user(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_approve_boq(uuid) TO authenticated;

-- Replace every bound predecessor policy with one row-scope allowlist. The
-- fresh manifest preflight must prove the exact inventory before this loop is
-- eligible to run.
DO $p49_drop_profile_policies$
DECLARE v_policy record;
BEGIN
  FOR v_policy IN
    SELECT policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE pg_catalog.format(
      'DROP POLICY %I ON public.user_profiles', v_policy.policyname
    );
  END LOOP;
END;
$p49_drop_profile_policies$;

CREATE POLICY p49_user_profiles_scoped_select
ON public.user_profiles
FOR SELECT TO authenticated
USING (
  (
    (SELECT private.p49_current_profile_recognized())
    AND id = (SELECT auth.uid())
  )
  OR (
    (SELECT private.p49_current_profile_active())
    AND (SELECT private.p49_current_active_role()) = 'admin'
  )
  OR (
    (SELECT private.p49_current_profile_active())
    AND (SELECT private.p49_current_active_role()) IN ('dept_manager', 'sector_manager')
    AND department_id IS NOT NULL
    AND department_id = (SELECT private.p49_current_active_department_id())
  )
);

REVOKE ALL ON TABLE public.user_profiles
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.user_profiles TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Bounded settings projection and active selector hierarchy
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_signup_email_allowed(p_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_restrict jsonb;
  v_domains jsonb;
  v_domain text;
BEGIN
  SELECT s.value INTO v_restrict
  FROM public.app_settings s
  WHERE s.key = 'restrict_email_domain';

  -- Malformed restriction state fails closed. A valid unrestricted setting is
  -- self-contained and intentionally does not depend on a domains row.
  IF v_restrict IS NULL
     OR pg_catalog.jsonb_typeof(v_restrict) <> 'boolean' THEN
    RETURN false;
  END IF;

  -- The RPC remains a bounded email predicate even when domain restriction is
  -- disabled; null or malformed direct inputs never report as allowed.
  IF p_email IS NULL
     OR p_email !~ '^[^@[:space:]]+@[^@[:space:]]+$' THEN
    RETURN false;
  END IF;

  IF v_restrict = 'false'::jsonb THEN
    RETURN true;
  END IF;

  SELECT s.value INTO v_domains
  FROM public.app_settings s
  WHERE s.key = 'allowed_email_domains';

  -- Restriction-enabled configuration and the submitted email both fail
  -- closed on ambiguity. Every configured domain must be a non-empty JSON
  -- string without an at-sign or whitespace.
  IF v_domains IS NULL
     OR pg_catalog.jsonb_typeof(v_domains) <> 'array'
     OR pg_catalog.jsonb_array_length(v_domains) = 0
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.jsonb_array_elements(v_domains) configured(value)
       WHERE pg_catalog.jsonb_typeof(configured.value) <> 'string'
          OR pg_catalog.btrim(configured.value #>> '{}') = ''
          OR configured.value #>> '{}' ~ '[@[:space:]]'
     ) THEN
    RETURN false;
  END IF;

  v_domain := lower(pg_catalog.split_part(pg_catalog.btrim(p_email), '@', 2));
  RETURN EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements_text(v_domains) allowed(domain)
    WHERE lower(pg_catalog.btrim(allowed.domain)) = v_domain
      AND pg_catalog.btrim(allowed.domain) <> ''
  );
END;
$function$;

ALTER FUNCTION public.is_signup_email_allowed(text) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.is_signup_email_allowed(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_signup_email_allowed(text)
  TO anon, authenticated;

-- Active administrators receive only the two Master Catalog capability
-- booleans used by the item workspace. The catalog-admin gate remains false and
-- read-only under this candidate; enabling it is a separate Owner decision.
CREATE OR REPLACE FUNCTION public.get_my_catalog_capabilities()
RETURNS TABLE (
  new_identity_enabled boolean,
  retirement_enabled boolean,
  configuration_valid boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_flag_rows integer;
  v_distinct_keys integer;
  v_boolean_rows integer;
BEGIN
  IF NOT private.p49_current_active_admin() THEN
    RETURN;
  END IF;

  SELECT
    count(*)::integer,
    count(DISTINCT s.key)::integer,
    (count(*) FILTER (
      WHERE pg_catalog.jsonb_typeof(s.value) = 'boolean'
    ))::integer
  INTO v_flag_rows, v_distinct_keys, v_boolean_rows
  FROM public.app_settings s
  WHERE s.key IN (
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );

  IF v_flag_rows <> 2
     OR v_distinct_keys <> 2
     OR v_boolean_rows <> 2 THEN
    RETURN QUERY SELECT false, false, false;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(pg_catalog.bool_or(
      s.key = 'catalog_new_identity_enabled'
      AND s.value = 'true'::jsonb
    ), false),
    COALESCE(pg_catalog.bool_or(
      s.key = 'catalog_retirement_enabled'
      AND s.value = 'true'::jsonb
    ), false),
    true
  FROM public.app_settings s
  WHERE s.key IN (
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );
END;
$function$;

ALTER FUNCTION public.get_my_catalog_capabilities() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.get_my_catalog_capabilities()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_catalog_capabilities()
  TO authenticated;

-- Raw settings are not a client API. Existing postgres-owned catalog routines
-- retain owner access; service_role posture must be bound by the later exact ACL
-- manifest and is not broadened here.
REVOKE ALL ON TABLE public.app_settings FROM PUBLIC, anon, authenticated;

-- P49 CONTRACT: exact-predecessor-policy-semantics
-- Selector policies remain a source-freeze template until their exact live
-- predecessor rows are bound. The frozen transformation must preserve active
-- admin's prior row scope, restrict pending/active non-admin callers to an
-- is_active=true and valid organization hierarchy, and return zero rows for
-- inactive/suspended/missing/unknown profiles. It may not drop or replace a
-- live policy based only on repository history.
DO $p49_selector_policy_binding_required$
DECLARE
  v_exact_selector_policy_manifest jsonb := NULL; -- fresh-bind-required
BEGIN
  IF v_exact_selector_policy_manifest IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 selector policy source freeze blocked: exact-predecessor-policy-semantics is fresh-bind-required';
  END IF;
END;
$p49_selector_policy_binding_required$;

-- -----------------------------------------------------------------------------
-- 5. BOQ header/child policy source-freeze template
-- -----------------------------------------------------------------------------
-- P49 CONTRACT: exact-predecessor-policy-semantics
--
-- No BOQ/boq_items/boq_routes policy is dropped or recreated in this provisional
-- candidate. The exact live USING/WITH CHECK expressions were not captured as
-- durable evidence. A later source-freeze must bind each exact predecessor row,
-- then add the current-active predicate as the first conjunct without removing,
-- widening, or narrowing any sector/department/role/owner/assignee/legacy/SoD
-- branch. Repository migration text is not a substitute for that live binding.
--
-- Required source-freeze transformation for every command:
--   USING (
--     (SELECT private.p49_current_profile_active())
--     AND (<exact freshly-bound predecessor USING expression>)
--   )
--   WITH CHECK (
--     (SELECT private.p49_current_profile_active())
--     AND (<exact freshly-bound predecessor WITH CHECK expression>)
--   )
--
-- A predecessor command with no WITH CHECK must be reviewed explicitly; it must
-- not be guessed from USING. The frozen policy manifest owns that decision.
DO $p49_boq_policy_binding_required$
DECLARE
  v_exact_boq_policy_manifest jsonb := NULL; -- fresh-bind-required
BEGIN
  IF v_exact_boq_policy_manifest IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 BOQ policy source freeze blocked: exact-predecessor-policy-semantics is fresh-bind-required';
  END IF;
END;
$p49_boq_policy_binding_required$;

-- Replace the immutable migration-016 behavior
-- lock and current-active gate before the BOQ lock. Suffix preservation,
-- catalog version binding, and catalog-authoritative price/unit fields remain.
CREATE OR REPLACE FUNCTION public.save_boq_with_routes(
  p_boq_id uuid,
  p_boq_data jsonb,
  p_routes jsonb
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
SET lock_timeout = '5s'
SET statement_timeout = '30s'
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
GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid,jsonb,jsonb)
  TO authenticated;

-- -----------------------------------------------------------------------------
-- -----------------------------------------------------------------------------
-- 6. Legacy and versioned Factor F policy source-freeze template
-- -----------------------------------------------------------------------------
-- P49 CONTRACT: exact-predecessor-policy-semantics
-- Exact live Factor F policy and ACL rows are fresh-bind-required. The later
-- frozen transformation must preserve every predecessor version/status/default
-- pointer and active-admin mutation predicate, while adding current-active as
-- the first conjunct for authenticated reads and writes. It may not infer a
-- replacement from migration 012 or the schema-only baseline.
DO $p49_factor_f_policy_binding_required$
DECLARE
  v_exact_factor_f_policy_manifest jsonb := NULL; -- fresh-bind-required
BEGIN
  IF v_exact_factor_f_policy_manifest IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 Factor F policy source freeze blocked: exact-predecessor-policy-semantics is fresh-bind-required';
  END IF;
END;
$p49_factor_f_policy_binding_required$;

-- -----------------------------------------------------------------------------
-- 7. Intended postconditions (also require exact frozen policy/ACL manifest)
-- -----------------------------------------------------------------------------
DO $p49_exact_policy_postcondition_binding$
DECLARE
  v_exact_frozen_postcondition_manifest jsonb := NULL; -- fresh-bind-required
BEGIN
  IF v_exact_frozen_postcondition_manifest IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 postconditions blocked: exact frozen policy/ACL manifest is fresh-bind-required';
  END IF;
END;
$p49_exact_policy_postcondition_binding$;

DO $p49_function_acl_postconditions$
DECLARE
  v_expected record;
  v_oid oid;
BEGIN
  FOR v_expected IN
    SELECT * FROM (VALUES
      ('private.p49_current_profile_recognized()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_current_profile_active()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_current_active_role()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_current_active_department_id()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_current_selector_reader()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_current_active_admin()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('private.p49_admin_transition(uuid,text,text,text,uuid)', true,
        ARRAY['search_path=""','lock_timeout=5s','statement_timeout=15s']::text[], false, false),
      ('private.p49_guard_user_profile_mutation()', false,
        ARRAY['search_path=""']::text[], false, false),
      ('private.p49_reject_authorization_event_mutation()', false,
        ARRAY['search_path=""']::text[], false, false),
      ('public.handle_new_user()', true,
        ARRAY['search_path=""']::text[], false, false),
      ('public.get_my_profile_v2()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.get_my_catalog_capabilities()', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.update_my_profile(text,text,text,text,text,text,uuid,uuid,boolean,uuid)', true,
        ARRAY['search_path=""','lock_timeout=5s','statement_timeout=15s']::text[], true, false),
      ('public.get_authorized_profiles_page(integer,timestamptz,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.get_admin_profiles_page(integer,timestamptz,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_approve_user(uuid,uuid,text)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_reject_user(uuid,text,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_suspend_user(uuid,text,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_deactivate_user(uuid,text,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_reactivate_user(uuid,text,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.admin_set_user_role(uuid,text,text,uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.get_user_role(uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.is_admin(uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.can_approve_boq(uuid)', true,
        ARRAY['search_path=""']::text[], true, false),
      ('public.is_signup_email_allowed(text)', true,
        ARRAY['search_path=""']::text[], true, true),
      ('public.save_boq_with_routes(uuid,jsonb,jsonb)', true,
        ARRAY['search_path=""','lock_timeout=5s','statement_timeout=30s']::text[], true, false)
    ) AS expected(
      signature,
      security_definer,
      expected_proconfig,
      authenticated_execute,
      anon_execute
    )
  LOOP
    v_oid := to_regprocedure(v_expected.signature);
    IF v_oid IS NULL OR NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc p
      WHERE p.oid = v_oid
        AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
        AND p.prosecdef = v_expected.security_definer
        AND p.proconfig IS NOT DISTINCT FROM v_expected.expected_proconfig
    ) THEN
      RAISE EXCEPTION 'P49 postcondition failed: function posture mismatch for %',
        v_expected.signature;
    END IF;

    IF has_function_privilege('public', v_oid, 'EXECUTE')
       OR has_function_privilege('service_role', v_oid, 'EXECUTE')
       OR has_function_privilege('authenticated', v_oid, 'EXECUTE')
          IS DISTINCT FROM v_expected.authenticated_execute
       OR has_function_privilege('anon', v_oid, 'EXECUTE')
          IS DISTINCT FROM v_expected.anon_execute THEN
      RAISE EXCEPTION 'P49 postcondition failed: exact function EXECUTE ACL mismatch for %',
        v_expected.signature;
    END IF;
  END LOOP;

  IF to_regprocedure('public.admin_approve_user(uuid)') IS NOT NULL
     OR to_regprocedure('public.admin_reject_user(uuid,text)') IS NOT NULL
     OR to_regprocedure('public.lock_org_fields_after_onboarding()') IS NOT NULL THEN
    RAISE EXCEPTION 'P49 postcondition failed: obsolete authority overload/function remains';
  END IF;

  IF has_function_privilege('authenticated', 'public.get_my_profile()', 'EXECUTE') THEN
    RAISE EXCEPTION 'P49 postcondition failed: legacy get_my_profile remains callable';
  END IF;

  IF NOT has_function_privilege('anon', 'public.is_signup_email_allowed(text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.is_signup_email_allowed(text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.get_my_profile_v2()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.get_my_catalog_capabilities()', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.update_my_profile(text,text,text,text,text,text,uuid,uuid,boolean,uuid)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'P49 postcondition failed: required bounded RPC EXECUTE is missing';
  END IF;
END;
$p49_function_acl_postconditions$;

DO $p49_profile_audit_postconditions$
DECLARE
  v_status_default text;
  v_profile_constraint_count integer;
  v_profile_constraint_sha256 text;
BEGIN
  SELECT
    count(*)::integer,
    pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(COALESCE(
          pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'name', c.conname,
              'type', c.contype,
              'definition', pg_catalog.pg_get_constraintdef(c.oid, true)
            ) ORDER BY c.conname, c.oid
          )::text,
          '[]'
        ), 'UTF8')
      ),
      'hex'
    )
  INTO v_profile_constraint_count, v_profile_constraint_sha256
  FROM pg_catalog.pg_constraint c
  WHERE c.conrelid = 'public.user_profiles'::regclass;

  IF v_profile_constraint_count <> 11
     OR v_profile_constraint_sha256 IS DISTINCT FROM
       '061827adeb6324696a07a41c67e07829266d904cc047cd887990de7a3fb51420' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'P49 postcondition failed: exact user_profiles constraint manifest drifted',
      DETAIL = pg_catalog.format(
        'rows=%s sha256=%s',
        v_profile_constraint_count,
        v_profile_constraint_sha256
      );
  END IF;

  SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid)
  INTO v_status_default
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_attrdef d
    ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attrelid = 'public.user_profiles'::regclass
    AND a.attname = 'status';

  IF v_status_default NOT IN ('''pending''::text', '''pending''')
     OR EXISTS (
       SELECT 1 FROM pg_catalog.pg_attribute a
       WHERE a.attrelid = 'public.user_profiles'::regclass
         AND a.attname = 'status'
         AND NOT a.attnotnull
     ) THEN
    RAISE EXCEPTION 'P49 postcondition failed: profile status is not pending-by-default/non-null';
  END IF;

  IF has_table_privilege('anon', 'public.user_profiles', 'SELECT')
     OR has_table_privilege('authenticated', 'public.user_profiles', 'INSERT')
     OR has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.user_profiles', 'DELETE')
     OR has_table_privilege('service_role', 'public.user_profiles', 'INSERT')
     OR has_table_privilege('service_role', 'public.user_profiles', 'UPDATE')
     OR has_table_privilege('service_role', 'public.user_profiles', 'DELETE') THEN
    RAISE EXCEPTION 'P49 postcondition failed: direct profile mutation/read ACL is too broad';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.user_profiles', 'SELECT')
     OR (SELECT count(*) FROM pg_catalog.pg_policies p
         WHERE p.schemaname = 'public' AND p.tablename = 'user_profiles') <> 1
     OR NOT EXISTS (
       SELECT 1 FROM pg_catalog.pg_policies p
       WHERE p.schemaname = 'public'
         AND p.tablename = 'user_profiles'
         AND p.policyname = 'p49_user_profiles_scoped_select'
         AND p.cmd = 'SELECT'
         AND p.roles = ARRAY['authenticated'::name]
         AND p.qual ILIKE '%p49_current_profile_recognized%'
         AND p.qual ILIKE '%p49_current_active_department_id%'
     ) THEN
    RAISE EXCEPTION 'P49 postcondition failed: recursion-free scoped profile projection is incomplete';
  END IF;

  IF (SELECT count(*) FROM public.user_authorization_events) <> 0
     OR (SELECT count(*) FROM pg_catalog.pg_policies p
         WHERE p.schemaname = 'public'
           AND p.tablename = 'user_authorization_events') <> 1
     OR has_table_privilege('anon', 'public.user_authorization_events', 'SELECT')
     OR has_table_privilege('authenticated', 'public.user_authorization_events', 'INSERT')
     OR has_table_privilege('authenticated', 'public.user_authorization_events', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.user_authorization_events', 'DELETE')
     OR has_table_privilege('service_role', 'public.user_authorization_events', 'INSERT')
     OR has_table_privilege('service_role', 'public.user_authorization_events', 'UPDATE')
     OR has_table_privilege('service_role', 'public.user_authorization_events', 'DELETE') THEN
    RAISE EXCEPTION 'P49 postcondition failed: append-only authorization audit posture is incomplete';
  END IF;

  IF has_table_privilege('anon', 'public.app_settings', 'SELECT')
     OR has_table_privilege('authenticated', 'public.app_settings', 'SELECT')
     OR has_table_privilege('authenticated', 'public.app_settings', 'INSERT')
     OR has_table_privilege('authenticated', 'public.app_settings', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.app_settings', 'DELETE') THEN
    RAISE EXCEPTION 'P49 postcondition failed: raw settings remain client-callable';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    WHERE t.tgrelid = 'public.user_profiles'::regclass
      AND t.tgname = 'trg_p49_guard_user_profile_mutation'
      AND NOT t.tgisinternal
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    WHERE t.tgrelid = 'public.user_authorization_events'::regclass
      AND t.tgname = 'trg_p49_authorization_events_immutable'
      AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'P49 postcondition failed: protected-field/audit trigger is missing';
  END IF;
END;
$p49_profile_audit_postconditions$;

DO $p49_preservation_postconditions$
DECLARE
  v_expected record;
  v_count bigint;
  v_hash text;
  v_policy_hash text;
  v_function_hash text;
  v_flag_rows integer;
  v_false_flags integer;
BEGIN
  FOR v_expected IN SELECT * FROM p49_preserve_fingerprints
  LOOP
    EXECUTE pg_catalog.format(
      'SELECT count(*)::bigint, encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(string_agg(to_jsonb(t)::text, '''' ORDER BY to_jsonb(t)::text), ''''), ''UTF8'')), ''hex'') FROM %s t',
      v_expected.object_name
    ) INTO v_count, v_hash;

    IF v_count IS DISTINCT FROM v_expected.row_count
       OR v_hash IS DISTINCT FROM v_expected.row_sha256 THEN
      RAISE EXCEPTION 'P49 postcondition failed: preserved data changed for %',
        v_expected.object_name;
    END IF;
  END LOOP;

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        coalesce(
          pg_catalog.string_agg(
            pg_catalog.concat_ws('|', schemaname, tablename, policyname,
              permissive, cmd, roles::text, qual, with_check),
            E'\n' ORDER BY schemaname, tablename, policyname
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  ) INTO v_policy_hash
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'price_list_versions', 'price_list', 'price_list_default_version',
      'catalog_item_identities', 'catalog_item_codes', 'price_list_categories',
      'catalog_code_groups', 'catalog_imports', 'catalog_change_sets',
      'catalog_change_items', 'catalog_code_group_dictionary',
      'catalog_first_rollout_mappings', 'catalog_first_rollout_source_exclusions',
      'catalog_placement_reviews'
    );

  IF v_policy_hash IS DISTINCT FROM
     (SELECT p.sha256 FROM p49_catalog_policy_fingerprint p) THEN
    RAISE EXCEPTION 'P49 postcondition failed: Master Catalog policies changed';
  END IF;

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        coalesce(
          pg_catalog.string_agg(
            pg_catalog.concat_ws('|', n.nspname,
              p.oid::regprocedure::text,
              pg_catalog.pg_get_userbyid(p.proowner),
              p.prosecdef::text,
              p.proconfig::text,
              p.proacl::text,
              pg_catalog.pg_get_functiondef(p.oid)),
            E'\n' ORDER BY n.nspname, p.oid::regprocedure::text
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  ) INTO v_function_hash
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private')
    AND p.proname ILIKE '%catalog%'
    AND p.oid IS DISTINCT FROM to_regprocedure('public.get_my_catalog_capabilities()');

  IF v_function_hash IS DISTINCT FROM
     (SELECT f.sha256 FROM p49_catalog_function_fingerprint f) THEN
    RAISE EXCEPTION 'P49 postcondition failed: Master Catalog functions/ACLs changed';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE s.value = 'false'::jsonb)
  INTO v_flag_rows, v_false_flags
  FROM public.app_settings s
  WHERE s.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );
  IF v_flag_rows <> 3 OR v_false_flags <> 3 THEN
    RAISE EXCEPTION 'P49 postcondition failed: Master Catalog flags changed';
  END IF;
END;
$p49_preservation_postconditions$;

-- Reassert the exact durable Result #100 authority boundary after every
-- candidate operation. Generic table fingerprints above detect any other row
-- delta; this assertion makes the business-critical pointer/hash/count state
-- independently legible and fail closed.
DO $p49_master_catalog_authority_postcondition$
DECLARE
  v_pointer_rows integer;
  v_version_id uuid;
  v_version_string text;
  v_status text;
  v_is_default boolean;
  v_dataset_hash text;
  v_item_count integer;
  v_lock_version integer;
  v_total_rows bigint;
  v_active_rows bigint;
  v_inactive_rows bigint;
BEGIN
  SELECT count(*)::integer
  INTO v_pointer_rows
  FROM public.price_list_default_version dv
  WHERE dv.id = true;

  IF v_pointer_rows <> 1 THEN
    RAISE EXCEPTION
      'P49 postcondition failed: Master Catalog default pointer row count is %',
      v_pointer_rows;
  END IF;

  SELECT
    v.id,
    v.version_string,
    v.status,
    v.is_default,
    v.dataset_hash,
    v.item_count,
    v.lock_version
  INTO
    v_version_id,
    v_version_string,
    v_status,
    v_is_default,
    v_dataset_hash,
    v_item_count,
    v_lock_version
  FROM public.price_list_default_version dv
  JOIN public.price_list_versions v ON v.id = dv.version_id
  WHERE dv.id = true;

  IF v_version_id IS DISTINCT FROM 'ad957c94-a6ed-488b-8181-32333d4ab0ed'::uuid
     OR v_version_string IS DISTINCT FROM '2568.1.0'
     OR v_status IS DISTINCT FROM 'active'
     OR v_is_default IS DISTINCT FROM true
     OR v_dataset_hash IS DISTINCT FROM
       'sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733'
     OR v_item_count IS DISTINCT FROM 710
     OR v_lock_version IS DISTINCT FROM 4 THEN
    RAISE EXCEPTION
      'P49 postcondition failed: published/default Master Catalog authority binding changed';
  END IF;

  SELECT
    count(*)::bigint,
    count(*) FILTER (WHERE pl.is_active = true)::bigint,
    count(*) FILTER (WHERE pl.is_active = false)::bigint
  INTO v_total_rows, v_active_rows, v_inactive_rows
  FROM public.price_list pl
  WHERE pl.version_id = v_version_id;

  IF v_total_rows <> 710 OR v_active_rows <> 710 OR v_inactive_rows <> 0 THEN
    RAISE EXCEPTION
      'P49 postcondition failed: 2568.1.0 row posture changed (total %, active %, inactive %)',
      v_total_rows,
      v_active_rows,
      v_inactive_rows;
  END IF;
END;
$p49_master_catalog_authority_postcondition$;

DO $p49_default_acl_postcondition$
DECLARE
  v_global_default_rows integer;
  v_global_default_entries integer;
  v_invalid_global_default_entries integer;
  v_public_default_rows integer;
  v_public_default_entries integer;
  v_private_default_rows integer;
  v_private_default_entries integer;
  v_invalid_schema_default_entries integer;
BEGIN
  SELECT count(*)
  INTO v_global_default_rows
  FROM pg_catalog.pg_default_acl d
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND d.defaclnamespace = 0;

  IF v_global_default_rows <> 1 THEN
    RAISE EXCEPTION
      'P49 postcondition failed: expected one postgres global function default ACL, found %',
      v_global_default_rows;
  END IF;

  SELECT
    count(*),
    count(*) FILTER (
      WHERE privilege.grantee <> to_regrole('postgres')
         OR privilege.grantor <> to_regrole('postgres')
         OR privilege.privilege_type <> 'EXECUTE'
         OR privilege.is_grantable
    )
  INTO v_global_default_entries, v_invalid_global_default_entries
  FROM pg_catalog.pg_default_acl d
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND d.defaclnamespace = 0;

  IF v_global_default_entries <> 1
     OR v_invalid_global_default_entries <> 0 THEN
    RAISE EXCEPTION
      'P49 postcondition failed: postgres global function defaults are not owner-only EXECUTE';
  END IF;

  SELECT count(*)
  INTO v_public_default_rows
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'public';

  SELECT count(*)
  INTO v_public_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'public';

  IF v_public_default_rows > 1
     OR v_public_default_entries <> v_public_default_rows THEN
    RAISE EXCEPTION
      'P49 postcondition failed: postgres public-schema function defaults are not absent or owner-only EXECUTE';
  END IF;

  SELECT count(*)
  INTO v_private_default_rows
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'private';

  SELECT count(*)
  INTO v_private_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname = 'private';

  IF v_private_default_rows > 1
     OR v_private_default_entries <> v_private_default_rows THEN
    RAISE EXCEPTION
      'P49 postcondition failed: postgres private-schema function defaults are not absent or owner-only EXECUTE';
  END IF;

  SELECT count(*)
  INTO v_invalid_schema_default_entries
  FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) privilege
  WHERE d.defaclrole = to_regrole('postgres')
    AND d.defaclobjtype = 'f'
    AND n.nspname IN ('public', 'private')
    AND (
      privilege.grantee <> to_regrole('postgres')
      OR privilege.grantor <> to_regrole('postgres')
      OR privilege.privilege_type <> 'EXECUTE'
      OR privilege.is_grantable
    );

  IF v_invalid_schema_default_entries <> 0 THEN
    RAISE EXCEPTION 'P49 postcondition failed: migration-017a owner-only function defaults changed';
  END IF;
END;
$p49_default_acl_postcondition$;

COMMIT;
