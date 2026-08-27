-- =============================================================================
-- MASTER CATALOG ACTIVE-ADMIN GATE PROJECTION
-- =============================================================================
-- Forward-only compatibility bridge after immutable migration 027.
--
-- This migration adds a bounded read projection only. It does not enable any
-- feature flag and does not mutate Master Catalog, BOQ, or Factor F data.
-- Apply exactly once while all three catalog flags remain false.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '60s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:master-catalog-admin-gate-v1', 0)
);

-- -----------------------------------------------------------------------------
-- 1. Exact predecessor and disabled-state preflight
-- -----------------------------------------------------------------------------
DO $master_catalog_admin_gate_preflight$
DECLARE
  v_latest_version text;
  v_latest_name text;
  v_flag_rows integer;
  v_distinct_keys integer;
  v_boolean_rows integer;
  v_enabled_rows integer;
  v_public_settings_privilege boolean;
  v_public_private_privilege boolean;
  v_catalog_relation_count integer;
  v_catalog_rls_count integer;
  v_catalog_policy_hash text;
  v_catalog_function_hash text;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: session/current user must be postgres (got %/%)',
      session_user,
      current_user;
  END IF;

  IF to_regrole('anon') IS NULL
     OR to_regrole('authenticated') IS NULL
     OR to_regrole('service_role') IS NULL THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: required Supabase API roles are missing';
  END IF;

  SELECT migration.version, migration.name
  INTO v_latest_version, v_latest_name
  FROM supabase_migrations.schema_migrations migration
  ORDER BY migration.version DESC
  LIMIT 1;

  IF v_latest_version IS DISTINCT FROM '20260827174634'
     OR v_latest_name IS DISTINCT FROM 'p49_active_profile_authorization_hardening' THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: expected exact migration 027 predecessor, got %/%',
      v_latest_version,
      v_latest_name;
  END IF;

  IF to_regnamespace('private') IS NULL
     OR to_regclass('public.app_settings') IS NULL
     OR to_regprocedure('private.p49_current_active_admin()') IS NULL
     OR to_regprocedure('private.catalog_admin_context()') IS NULL
     OR to_regprocedure('private.catalog_admin_enabled()') IS NULL
     OR to_regprocedure('public.get_my_catalog_capabilities()') IS NULL THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: required migration 027 objects are missing';
  END IF;

  IF to_regprocedure('private.catalog_admin_gate_projection()') IS NOT NULL
     OR to_regprocedure('public.get_my_catalog_admin_gate()') IS NOT NULL THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: migration 028 functions already exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc function_row
    WHERE function_row.oid = to_regprocedure('private.p49_current_active_admin()')
      AND pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
      AND function_row.prosecdef
      AND function_row.provolatile = 's'
      AND function_row.proconfig IS NOT DISTINCT FROM
        ARRAY['search_path=""']::text[]
      AND pg_catalog.encode(
        pg_catalog.sha256(
          pg_catalog.convert_to(
            pg_catalog.pg_get_functiondef(function_row.oid),
            'UTF8'
          )
        ),
        'hex'
      ) = '2b84600847ed9c3bd0065c1bc09fdb633c8ba393e98623f3d6265c6797e586ec'
  ) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: active-admin predicate posture drifted';
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
      to_regprocedure('private.p49_current_active_admin()')
      AND privilege.grantee = 0
      AND privilege.privilege_type = 'EXECUTE'
  )
     OR pg_catalog.has_function_privilege(
       'anon', 'private.p49_current_active_admin()', 'EXECUTE'
     )
     OR NOT pg_catalog.has_function_privilege(
       'authenticated', 'private.p49_current_active_admin()', 'EXECUTE'
     )
     OR pg_catalog.has_function_privilege(
       'service_role', 'private.p49_current_active_admin()', 'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: active-admin predicate ACL drifted';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace namespace_row
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        namespace_row.nspacl,
        pg_catalog.acldefault('n', namespace_row.nspowner)
      )
    ) privilege
    WHERE namespace_row.nspname = 'private'
      AND privilege.grantee = 0
      AND privilege.privilege_type IN ('USAGE', 'CREATE')
  )
  INTO v_public_private_privilege;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace namespace_row
    WHERE namespace_row.nspname = 'private'
      AND pg_catalog.pg_get_userbyid(namespace_row.nspowner) = 'postgres'
  )
     OR v_public_private_privilege
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
     OR pg_catalog.has_schema_privilege('service_role', 'private', 'CREATE') THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: private-schema ACL drifted';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class relation_row
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        relation_row.relacl,
        pg_catalog.acldefault('r', relation_row.relowner)
      )
    ) privilege
    WHERE relation_row.oid = 'public.app_settings'::regclass
      AND privilege.grantee = 0
      AND privilege.privilege_type IN (
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
        'REFERENCES', 'TRIGGER'
      )
  )
  INTO v_public_settings_privilege;

  IF v_public_settings_privilege
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'SELECT')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'INSERT')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'UPDATE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'DELETE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'TRUNCATE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'REFERENCES')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'TRIGGER')
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'SELECT'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'INSERT'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'UPDATE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'DELETE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'TRUNCATE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'REFERENCES'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'TRIGGER'
     ) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: raw app_settings ACL drifted';
  END IF;

  WITH target_relations(relation_name) AS (
    VALUES
      ('price_list_versions'),
      ('price_list'),
      ('price_list_audit_logs'),
      ('price_list_default_version'),
      ('catalog_item_identities'),
      ('catalog_item_codes'),
      ('price_list_categories'),
      ('catalog_code_groups'),
      ('catalog_imports'),
      ('catalog_change_sets'),
      ('catalog_change_items'),
      ('catalog_code_group_dictionary'),
      ('catalog_first_rollout_mappings'),
      ('catalog_first_rollout_source_exclusions'),
      ('catalog_placement_reviews')
  )
  SELECT
    count(*)::integer,
    (count(*) FILTER (WHERE relation_row.relrowsecurity))::integer
  INTO v_catalog_relation_count, v_catalog_rls_count
  FROM target_relations target
  JOIN pg_catalog.pg_namespace namespace_row
    ON namespace_row.nspname = 'public'
  JOIN pg_catalog.pg_class relation_row
    ON relation_row.relnamespace = namespace_row.oid
   AND relation_row.relname = target.relation_name;

  IF v_catalog_relation_count <> 15 OR v_catalog_rls_count <> 15 THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: catalog RLS posture drifted';
  END IF;

  IF EXISTS (
    WITH target_relations(relation_name) AS (
      VALUES
        ('price_list_versions'),
        ('price_list'),
        ('price_list_audit_logs'),
        ('price_list_default_version'),
        ('catalog_item_identities'),
        ('catalog_item_codes'),
        ('price_list_categories'),
        ('catalog_code_groups'),
        ('catalog_imports'),
        ('catalog_change_sets'),
        ('catalog_change_items'),
        ('catalog_code_group_dictionary'),
        ('catalog_first_rollout_mappings'),
        ('catalog_first_rollout_source_exclusions'),
        ('catalog_placement_reviews')
    )
    SELECT 1
    FROM target_relations target
    JOIN pg_catalog.pg_namespace namespace_row
      ON namespace_row.nspname = 'public'
    JOIN pg_catalog.pg_class relation_row
      ON relation_row.relnamespace = namespace_row.oid
     AND relation_row.relname = target.relation_name
    WHERE EXISTS (
      SELECT 1
      FROM pg_catalog.aclexplode(
        COALESCE(
          relation_row.relacl,
          pg_catalog.acldefault('r', relation_row.relowner)
        )
      ) privilege
      WHERE privilege.grantee = 0
        AND privilege.privilege_type IN (
          'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
        )
    )
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'INSERT')
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'UPDATE')
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'DELETE')
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'TRUNCATE')
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'REFERENCES')
       OR pg_catalog.has_table_privilege('anon', relation_row.oid, 'TRIGGER')
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'INSERT'
       )
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'UPDATE'
       )
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'DELETE'
       )
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'TRUNCATE'
       )
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'REFERENCES'
       )
       OR pg_catalog.has_table_privilege(
         'authenticated', relation_row.oid, 'TRIGGER'
       )
  ) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate preflight blocked: direct catalog DML ACL drifted';
  END IF;

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        COALESCE(
          pg_catalog.string_agg(
            pg_catalog.concat_ws(
              '|', schemaname, tablename, policyname, permissive, cmd,
              roles::text, qual, with_check
            ),
            E'\n' ORDER BY schemaname, tablename, policyname
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  )
  INTO v_catalog_policy_hash
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

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        COALESCE(
          pg_catalog.string_agg(
            pg_catalog.concat_ws(
              '|', namespace_row.nspname, function_row.oid::regprocedure::text,
              pg_catalog.pg_get_userbyid(function_row.proowner),
              function_row.prosecdef::text, function_row.proconfig::text,
              function_row.proacl::text,
              pg_catalog.pg_get_functiondef(function_row.oid)
            ),
            E'\n' ORDER BY namespace_row.nspname,
              function_row.oid::regprocedure::text
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  )
  INTO v_catalog_function_hash
  FROM pg_catalog.pg_proc function_row
  JOIN pg_catalog.pg_namespace namespace_row
    ON namespace_row.oid = function_row.pronamespace
  WHERE namespace_row.nspname IN ('public', 'private')
    AND function_row.proname ILIKE '%catalog%'
    AND function_row.oid IS DISTINCT FROM
      to_regprocedure('public.get_my_catalog_capabilities()');

  IF v_catalog_policy_hash IS DISTINCT FROM
       '8d0853a2224cf9c9044fcd1bfdc24282d4f476fb4fd78d481238b3a93992ebf0'
     OR v_catalog_function_hash IS DISTINCT FROM
       'da43534fa761a19bb89f9cf3a1fc220d8a74e27e99e30ecb8955d14369eaf663' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'Master Catalog admin gate preflight blocked: catalog authorization boundary drifted',
      DETAIL = pg_catalog.format(
        'policy_sha256=%s function_sha256=%s',
        v_catalog_policy_hash,
        v_catalog_function_hash
      );
  END IF;

  SELECT
    count(*)::integer,
    count(DISTINCT setting.key)::integer,
    (count(*) FILTER (
      WHERE pg_catalog.jsonb_typeof(setting.value) = 'boolean'
    ))::integer,
    (count(*) FILTER (
      WHERE setting.value = 'true'::jsonb
    ))::integer
  INTO v_flag_rows, v_distinct_keys, v_boolean_rows, v_enabled_rows
  FROM public.app_settings setting
  WHERE setting.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );

  IF v_flag_rows <> 3
     OR v_distinct_keys <> 3
     OR v_boolean_rows <> 3
     OR v_enabled_rows <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'Master Catalog admin gate preflight blocked: catalog flags must be exact JSON false/false/false',
      DETAIL = pg_catalog.format(
        'rows=%s distinct=%s booleans=%s enabled=%s',
        v_flag_rows,
        v_distinct_keys,
        v_boolean_rows,
        v_enabled_rows
      );
  END IF;
END;
$master_catalog_admin_gate_preflight$;

-- -----------------------------------------------------------------------------
-- 2. Private privileged projection and public invoker wrapper
-- -----------------------------------------------------------------------------
CREATE FUNCTION private.catalog_admin_gate_projection()
RETURNS TABLE (
  admin_enabled boolean,
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
    count(DISTINCT setting.key)::integer,
    (count(*) FILTER (
      WHERE pg_catalog.jsonb_typeof(setting.value) = 'boolean'
    ))::integer
  INTO v_flag_rows, v_distinct_keys, v_boolean_rows
  FROM public.app_settings setting
  WHERE setting.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );

  IF v_flag_rows <> 3
     OR v_distinct_keys <> 3
     OR v_boolean_rows <> 3 THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(pg_catalog.bool_or(
      setting.key = 'catalog_admin_enabled'
      AND setting.value = 'true'::jsonb
    ), false),
    true
  FROM public.app_settings setting
  WHERE setting.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );
END;
$function$;

CREATE FUNCTION public.get_my_catalog_admin_gate()
RETURNS TABLE (
  admin_enabled boolean,
  configuration_valid boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT projection.admin_enabled, projection.configuration_valid
  FROM private.catalog_admin_gate_projection() projection;
$function$;

ALTER FUNCTION private.catalog_admin_gate_projection() OWNER TO postgres;
ALTER FUNCTION public.get_my_catalog_admin_gate() OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION private.catalog_admin_gate_projection()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_my_catalog_admin_gate()
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION private.catalog_admin_gate_projection()
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_catalog_admin_gate()
  TO authenticated;

COMMENT ON FUNCTION private.catalog_admin_gate_projection() IS
  'Bounded active-admin projection of the Master Catalog operational gate; malformed configuration fails closed.';
COMMENT ON FUNCTION public.get_my_catalog_admin_gate() IS
  'Authenticated Data API wrapper for the bounded Master Catalog active-admin gate projection.';

-- -----------------------------------------------------------------------------
-- 3. Function posture, ACL, and unchanged-flag postconditions
-- -----------------------------------------------------------------------------
DO $master_catalog_admin_gate_postconditions$
DECLARE
  v_expected record;
  v_oid oid;
  v_public_execute boolean;
  v_flag_rows integer;
  v_boolean_rows integer;
  v_enabled_rows integer;
  v_public_settings_privilege boolean;
  v_public_private_privilege boolean;
  v_catalog_policy_hash text;
  v_catalog_function_hash text;
BEGIN
  FOR v_expected IN
    SELECT * FROM (VALUES
      (
        'private.catalog_admin_gate_projection()',
        true,
        ARRAY['search_path=""']::text[]
      ),
      (
        'public.get_my_catalog_admin_gate()',
        false,
        ARRAY['search_path=""']::text[]
      )
    ) AS expected(signature, security_definer, expected_proconfig)
  LOOP
    v_oid := to_regprocedure(v_expected.signature);

    IF v_oid IS NULL OR NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc function_row
      WHERE function_row.oid = v_oid
        AND pg_catalog.pg_get_userbyid(function_row.proowner) = 'postgres'
        AND function_row.prosecdef = v_expected.security_definer
        AND function_row.provolatile = 's'
        AND function_row.proconfig IS NOT DISTINCT FROM
          v_expected.expected_proconfig
    ) THEN
      RAISE EXCEPTION
        'Master Catalog admin gate postcondition failed: function posture mismatch for %',
        v_expected.signature;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc function_row
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        COALESCE(
          function_row.proacl,
          pg_catalog.acldefault('f', function_row.proowner)
        )
      ) privilege
      WHERE function_row.oid = v_oid
        AND privilege.grantee = 0
        AND privilege.privilege_type = 'EXECUTE'
    )
    INTO v_public_execute;

    IF v_public_execute
       OR pg_catalog.has_function_privilege('anon', v_oid, 'EXECUTE')
       OR NOT pg_catalog.has_function_privilege(
         'authenticated', v_oid, 'EXECUTE'
       )
       OR pg_catalog.has_function_privilege('service_role', v_oid, 'EXECUTE') THEN
      RAISE EXCEPTION
        'Master Catalog admin gate postcondition failed: function ACL mismatch for %',
        v_expected.signature;
    END IF;
  END LOOP;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace namespace_row
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        namespace_row.nspacl,
        pg_catalog.acldefault('n', namespace_row.nspowner)
      )
    ) privilege
    WHERE namespace_row.nspname = 'private'
      AND privilege.grantee = 0
      AND privilege.privilege_type IN ('USAGE', 'CREATE')
  )
  INTO v_public_private_privilege;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace namespace_row
    WHERE namespace_row.nspname = 'private'
      AND pg_catalog.pg_get_userbyid(namespace_row.nspowner) = 'postgres'
  )
     OR v_public_private_privilege
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
     OR pg_catalog.has_schema_privilege('service_role', 'private', 'CREATE') THEN
    RAISE EXCEPTION
      'Master Catalog admin gate postcondition failed: private-schema ACL drifted';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class relation_row
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        relation_row.relacl,
        pg_catalog.acldefault('r', relation_row.relowner)
      )
    ) privilege
    WHERE relation_row.oid = 'public.app_settings'::regclass
      AND privilege.grantee = 0
      AND privilege.privilege_type IN (
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
        'REFERENCES', 'TRIGGER'
      )
  )
  INTO v_public_settings_privilege;

  IF v_public_settings_privilege
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'SELECT')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'INSERT')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'UPDATE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'DELETE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'TRUNCATE')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'REFERENCES')
     OR pg_catalog.has_table_privilege('anon', 'public.app_settings', 'TRIGGER')
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'SELECT'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'INSERT'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'UPDATE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'DELETE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'TRUNCATE'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'REFERENCES'
     )
     OR pg_catalog.has_table_privilege(
       'authenticated', 'public.app_settings', 'TRIGGER'
     ) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate postcondition failed: raw app_settings ACL drifted';
  END IF;

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        COALESCE(
          pg_catalog.string_agg(
            pg_catalog.concat_ws(
              '|', schemaname, tablename, policyname, permissive, cmd,
              roles::text, qual, with_check
            ),
            E'\n' ORDER BY schemaname, tablename, policyname
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  )
  INTO v_catalog_policy_hash
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

  SELECT pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        COALESCE(
          pg_catalog.string_agg(
            pg_catalog.concat_ws(
              '|', namespace_row.nspname, function_row.oid::regprocedure::text,
              pg_catalog.pg_get_userbyid(function_row.proowner),
              function_row.prosecdef::text, function_row.proconfig::text,
              function_row.proacl::text,
              pg_catalog.pg_get_functiondef(function_row.oid)
            ),
            E'\n' ORDER BY namespace_row.nspname,
              function_row.oid::regprocedure::text
          ),
          ''
        ),
        'UTF8'
      )
    ),
    'hex'
  )
  INTO v_catalog_function_hash
  FROM pg_catalog.pg_proc function_row
  JOIN pg_catalog.pg_namespace namespace_row
    ON namespace_row.oid = function_row.pronamespace
  WHERE namespace_row.nspname IN ('public', 'private')
    AND function_row.proname ILIKE '%catalog%'
    AND function_row.oid IS DISTINCT FROM
      to_regprocedure('public.get_my_catalog_capabilities()')
    AND function_row.oid IS DISTINCT FROM
      to_regprocedure('private.catalog_admin_gate_projection()')
    AND function_row.oid IS DISTINCT FROM
      to_regprocedure('public.get_my_catalog_admin_gate()');

  IF v_catalog_policy_hash IS DISTINCT FROM
       '8d0853a2224cf9c9044fcd1bfdc24282d4f476fb4fd78d481238b3a93992ebf0'
     OR v_catalog_function_hash IS DISTINCT FROM
       'da43534fa761a19bb89f9cf3a1fc220d8a74e27e99e30ecb8955d14369eaf663' THEN
    RAISE EXCEPTION
      'Master Catalog admin gate postcondition failed: catalog authorization boundary changed';
  END IF;

  SELECT
    count(*)::integer,
    (count(*) FILTER (
      WHERE pg_catalog.jsonb_typeof(setting.value) = 'boolean'
    ))::integer,
    (count(*) FILTER (
      WHERE setting.value = 'true'::jsonb
    ))::integer
  INTO v_flag_rows, v_boolean_rows, v_enabled_rows
  FROM public.app_settings setting
  WHERE setting.key IN (
    'catalog_admin_enabled',
    'catalog_new_identity_enabled',
    'catalog_retirement_enabled'
  );

  IF v_flag_rows <> 3 OR v_boolean_rows <> 3 OR v_enabled_rows <> 0 THEN
    RAISE EXCEPTION
      'Master Catalog admin gate postcondition failed: migration changed or invalidated catalog flags';
  END IF;

  IF EXISTS (SELECT 1 FROM private.catalog_admin_gate_projection()) THEN
    RAISE EXCEPTION
      'Master Catalog admin gate postcondition failed: null-auth session received a gate row';
  END IF;
END;
$master_catalog_admin_gate_postconditions$;

COMMIT;
