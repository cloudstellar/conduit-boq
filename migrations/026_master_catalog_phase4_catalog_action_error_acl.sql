-- =============================================================================
-- Migration 026: Master Catalog Phase 4 - Catalog Action Error ACL
-- Status: CANDIDATE - LOCAL/ISOLATED REHEARSAL ONLY UNTIL OWNER P-12 GATE
--
-- Required order:
--   025_master_catalog_phase4_withdraw_order_compaction.sql
--   026_master_catalog_phase4_catalog_action_error_acl.sql
--
-- Purpose:
-- 1. Keep private.catalog_action_error as a pure, caller-context JSON formatter.
-- 2. Allow the reviewed authenticated public SECURITY INVOKER wrapper to call it.
-- 3. Retain owner execution for reviewed private SECURITY DEFINER callers.
-- 4. Keep PUBLIC, anon, and service_role denied.
--
-- Non-goals:
-- - This migration does not create or replace a function or change its body.
-- - This migration does not change global or schema default privileges.
-- - This migration does not write catalog, BOQ, Factor F, Auth, or Storage data.
-- - This migration does not enable a feature flag or authorize Production.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  DO $catalog_action_error_acl_preflight$
  DECLARE
    v_target oid := to_regprocedure(
      'private.catalog_action_error(uuid,text,text,boolean,jsonb)'
    );
    v_overload_count integer;
    v_acl_entries integer;
    v_invalid_acl_entries integer;
    v_flag_rows integer;
    v_false_flag_rows integer;
    v_global_default_rows integer;
    v_global_default_entries integer;
    v_invalid_global_default_entries integer;
    v_invalid_schema_default_entries integer;
  BEGIN
    IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: session_user/current_user must both be postgres (got %/%)',
        session_user,
        current_user;
    END IF;

    IF to_regrole('anon') IS NULL
       OR to_regrole('authenticated') IS NULL
       OR to_regrole('service_role') IS NULL THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: required Supabase roles are missing';
    END IF;

    IF to_regnamespace('private') IS NULL
       OR pg_get_userbyid(
            (SELECT n.nspowner
             FROM pg_namespace n
             WHERE n.oid = to_regnamespace('private'))
          ) IS DISTINCT FROM 'postgres' THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: private schema is missing or not owned by postgres';
    END IF;

    IF v_target IS NULL THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: exact helper signature is missing';
    END IF;

    SELECT count(*)
    INTO v_overload_count
    FROM pg_proc p
    WHERE p.pronamespace = to_regnamespace('private')
      AND p.proname = 'catalog_action_error';

    IF v_overload_count <> 1 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: expected one helper overload, found %',
        v_overload_count;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_language l ON l.oid = p.prolang
      WHERE p.oid = v_target
        AND p.prokind = 'f'
        AND pg_get_userbyid(p.proowner) = 'postgres'
        AND l.lanname = 'sql'
        AND p.prorettype = 'jsonb'::regtype
        AND NOT p.proretset
        AND p.prosecdef
        AND NOT p.proleakproof
        AND NOT p.proisstrict
        AND p.provolatile = 'v'
        AND p.proparallel = 'u'
        AND p.pronargdefaults = 2
        AND pg_get_expr(p.proargdefaults, 0) = 'false, NULL::jsonb'
        AND p.proconfig IS NOT DISTINCT FROM ARRAY['search_path=""']::text[]
        AND encode(
              pg_catalog.sha256(pg_catalog.convert_to(p.prosrc, 'UTF8')),
              'hex'
            ) =
              '4c912b7a1bef09fff13735c9d676aff310f638eb3f08e6ba529f387b31909646'
    ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: helper owner/body/metadata differs from reviewed migration-018 state';
    END IF;

    SELECT
      count(*),
      count(*) FILTER (
        WHERE privilege.grantee <> p.proowner
           OR privilege.grantor <> p.proowner
           OR privilege.privilege_type <> 'EXECUTE'
           OR privilege.is_grantable
      )
    INTO v_acl_entries, v_invalid_acl_entries
    FROM pg_proc p
    CROSS JOIN LATERAL aclexplode(
      coalesce(p.proacl, acldefault('f', p.proowner))
    ) privilege
    WHERE p.oid = v_target
    GROUP BY p.proowner;

    IF v_acl_entries <> 1 OR v_invalid_acl_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: expected exact owner-only helper ACL';
    END IF;

    IF has_function_privilege('public', v_target, 'EXECUTE')
       OR has_function_privilege(
            to_regrole('anon'), v_target, 'EXECUTE'
          )
       OR has_function_privilege(
            to_regrole('authenticated'), v_target, 'EXECUTE'
          )
       OR has_function_privilege(
            to_regrole('service_role'), v_target, 'EXECUTE'
          ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: effective pre-state is not exact API-role denial';
    END IF;

    IF NOT has_schema_privilege(
             to_regrole('authenticated'),
             to_regnamespace('private'),
             'USAGE'
           )
       OR has_schema_privilege(
            to_regrole('anon'),
            to_regnamespace('private'),
            'USAGE'
          ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: private-schema usage differs from reviewed post-018 state';
    END IF;

    SELECT
      count(*),
      count(*) FILTER (WHERE value = 'false'::jsonb)
    INTO v_flag_rows, v_false_flag_rows
    FROM public.app_settings
    WHERE key IN (
      'catalog_admin_enabled',
      'catalog_new_identity_enabled',
      'catalog_retirement_enabled'
    );

    IF v_flag_rows <> 3 OR v_false_flag_rows <> 3 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: all three Phase 4 flags must exist and remain false';
    END IF;

    SELECT count(*)
    INTO v_global_default_rows
    FROM pg_default_acl d
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    SELECT
      count(*),
      count(*) FILTER (
        WHERE privilege.grantee <> to_regrole('postgres')
           OR privilege.grantor <> to_regrole('postgres')
           OR privilege.privilege_type <> 'EXECUTE'
           OR privilege.is_grantable
      )
    INTO v_global_default_entries, v_invalid_global_default_entries
    FROM pg_default_acl d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    IF v_global_default_rows <> 1
       OR v_global_default_entries <> 1
       OR v_invalid_global_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: migration-017a global owner-only default drifted';
    END IF;

    SELECT count(*)
    INTO v_invalid_schema_default_entries
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND n.nspname IN ('public', 'private')
      AND d.defaclobjtype = 'f'
      AND (
        privilege.grantee <> to_regrole('postgres')
        OR privilege.grantor <> to_regrole('postgres')
        OR privilege.privilege_type <> 'EXECUTE'
        OR privilege.is_grantable
      );

    IF v_invalid_schema_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction blocked: migration-017a schema defaults drifted';
    END IF;
  END;
  $catalog_action_error_acl_preflight$;

  ALTER FUNCTION private.catalog_action_error(
    uuid, text, text, boolean, jsonb
  ) SECURITY INVOKER;

  REVOKE EXECUTE ON FUNCTION private.catalog_action_error(
    uuid, text, text, boolean, jsonb
  ) FROM PUBLIC, anon, authenticated, service_role;

  GRANT EXECUTE ON FUNCTION private.catalog_action_error(
    uuid, text, text, boolean, jsonb
  ) TO authenticated;

  DO $catalog_action_error_acl_postconditions$
  DECLARE
    v_target oid := to_regprocedure(
      'private.catalog_action_error(uuid,text,text,boolean,jsonb)'
    );
    v_acl_entries integer;
    v_owner_entries integer;
    v_authenticated_entries integer;
    v_invalid_acl_entries integer;
    v_flag_rows integer;
    v_false_flag_rows integer;
    v_global_default_rows integer;
    v_global_default_entries integer;
    v_invalid_global_default_entries integer;
    v_invalid_schema_default_entries integer;
  BEGIN
    IF v_target IS NULL OR NOT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_language l ON l.oid = p.prolang
      WHERE p.oid = v_target
        AND p.prokind = 'f'
        AND pg_get_userbyid(p.proowner) = 'postgres'
        AND l.lanname = 'sql'
        AND p.prorettype = 'jsonb'::regtype
        AND NOT p.proretset
        AND NOT p.prosecdef
        AND NOT p.proleakproof
        AND NOT p.proisstrict
        AND p.provolatile = 'v'
        AND p.proparallel = 'u'
        AND p.pronargdefaults = 2
        AND pg_get_expr(p.proargdefaults, 0) = 'false, NULL::jsonb'
        AND p.proconfig IS NOT DISTINCT FROM ARRAY['search_path=""']::text[]
        AND encode(
              pg_catalog.sha256(pg_catalog.convert_to(p.prosrc, 'UTF8')),
              'hex'
            ) =
              '4c912b7a1bef09fff13735c9d676aff310f638eb3f08e6ba529f387b31909646'
    ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: helper is not the reviewed SECURITY INVOKER definition';
    END IF;

    SELECT
      count(*),
      count(*) FILTER (WHERE privilege.grantee = p.proowner),
      count(*) FILTER (
        WHERE privilege.grantee = to_regrole('authenticated')
      ),
      count(*) FILTER (
        WHERE privilege.grantee NOT IN (
                p.proowner,
                to_regrole('authenticated')
              )
           OR privilege.grantor <> p.proowner
           OR privilege.privilege_type <> 'EXECUTE'
           OR privilege.is_grantable
      )
    INTO
      v_acl_entries,
      v_owner_entries,
      v_authenticated_entries,
      v_invalid_acl_entries
    FROM pg_proc p
    CROSS JOIN LATERAL aclexplode(
      coalesce(p.proacl, acldefault('f', p.proowner))
    ) privilege
    WHERE p.oid = v_target
    GROUP BY p.proowner;

    IF v_acl_entries <> 2
       OR v_owner_entries <> 1
       OR v_authenticated_entries <> 1
       OR v_invalid_acl_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: direct ACL is not exact owner plus authenticated';
    END IF;

    IF has_function_privilege('public', v_target, 'EXECUTE')
       OR has_function_privilege(
            to_regrole('anon'), v_target, 'EXECUTE'
          )
       OR has_function_privilege(
            to_regrole('service_role'), v_target, 'EXECUTE'
          )
       OR NOT has_function_privilege(
            to_regrole('authenticated'), v_target, 'EXECUTE'
          )
       OR has_function_privilege(
            to_regrole('authenticated'),
            v_target,
            'EXECUTE WITH GRANT OPTION'
          ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: effective API-role privileges are not exact';
    END IF;

    IF NOT has_schema_privilege(
             to_regrole('authenticated'),
             to_regnamespace('private'),
             'USAGE'
           ) THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: authenticated lacks private-schema USAGE';
    END IF;

    SELECT
      count(*),
      count(*) FILTER (WHERE value = 'false'::jsonb)
    INTO v_flag_rows, v_false_flag_rows
    FROM public.app_settings
    WHERE key IN (
      'catalog_admin_enabled',
      'catalog_new_identity_enabled',
      'catalog_retirement_enabled'
    );

    IF v_flag_rows <> 3 OR v_false_flag_rows <> 3 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: Phase 4 flags changed';
    END IF;

    SELECT count(*)
    INTO v_global_default_rows
    FROM pg_default_acl d
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    SELECT
      count(*),
      count(*) FILTER (
        WHERE privilege.grantee <> to_regrole('postgres')
           OR privilege.grantor <> to_regrole('postgres')
           OR privilege.privilege_type <> 'EXECUTE'
           OR privilege.is_grantable
      )
    INTO v_global_default_entries, v_invalid_global_default_entries
    FROM pg_default_acl d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    IF v_global_default_rows <> 1
       OR v_global_default_entries <> 1
       OR v_invalid_global_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: migration-017a global default changed';
    END IF;

    SELECT count(*)
    INTO v_invalid_schema_default_entries
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND n.nspname IN ('public', 'private')
      AND d.defaclobjtype = 'f'
      AND (
        privilege.grantee <> to_regrole('postgres')
        OR privilege.grantor <> to_regrole('postgres')
        OR privilege.privilege_type <> 'EXECUTE'
        OR privilege.is_grantable
      );

    IF v_invalid_schema_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Catalog action-error ACL correction postcondition failed: migration-017a schema defaults changed';
    END IF;
  END;
  $catalog_action_error_acl_postconditions$;
COMMIT;
