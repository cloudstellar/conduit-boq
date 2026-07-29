-- =============================================================================
-- Migration 017a: Global function default-privilege guard
-- Status: CANDIDATE - LOCAL/ISOLATED REHEARSAL ONLY UNTIL OWNER P-12 GATE
-- Source:
-- docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md
--
-- Required order:
--   017_master_catalog_phase4_foundation.sql
--   017a_master_catalog_phase4_global_function_default_privileges.sql
--   018_master_catalog_phase4_draft_mutation.sql
--
-- Purpose:
-- 1. Remove PostgreSQL's global PUBLIC EXECUTE default for every function
--    subsequently created by the Phase 4 object-owner role.
-- 2. Make omitted routine grants fail closed.
-- 3. Preserve the four reviewed authenticated-only rejecting RPC stubs from
--    migration 017.
--
-- Non-goals:
-- - This migration does not create or replace a function.
-- - This migration does not enable a feature flag.
-- - This migration does not change catalog, BOQ, Factor F, Auth, or Storage
--   data.
-- - This migration is not Production approval.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  -- The default privilege belongs to the exact role that creates later
  -- routines. Fail before changing it if the execution identity or the
  -- reviewed 017 hand-off is not exact.
  DO $phase4_global_function_acl_preflight$
  DECLARE
    v_private_owner text;
    v_private_routine_count integer;
    v_global_function_default_count integer;
    v_unexpected_schema_default_entries integer;
    v_invalid_public_rpc_count integer;
  BEGIN
    IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: session_user/current_user must both be postgres (got %/%)',
        session_user,
        current_user;
    END IF;

    IF to_regrole('anon') IS NULL
       OR to_regrole('authenticated') IS NULL
       OR to_regrole('service_role') IS NULL THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: required Supabase roles are missing';
    END IF;

    IF to_regnamespace('private') IS NULL THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: private schema from migration 017 is missing';
    END IF;

    SELECT pg_get_userbyid(n.nspowner)
    INTO v_private_owner
    FROM pg_namespace n
    WHERE n.oid = to_regnamespace('private');

    IF v_private_owner IS DISTINCT FROM 'postgres' THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: private schema owner is %, expected postgres',
        v_private_owner;
    END IF;

    SELECT count(*)
    INTO v_private_routine_count
    FROM pg_proc p
    WHERE p.pronamespace = to_regnamespace('private');

    IF v_private_routine_count <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: expected zero private routines after migration 017, found %',
        v_private_routine_count;
    END IF;

    SELECT count(*)
    INTO v_global_function_default_count
    FROM pg_default_acl d
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    IF v_global_function_default_count <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: the global postgres function default changed before the reviewed 017a bridge';
    END IF;

    SELECT count(*)
    INTO v_unexpected_schema_default_entries
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND n.nspname IN ('public', 'private')
      AND d.defaclobjtype = 'f'
      AND (
        privilege.grantor <> to_regrole('postgres')
        OR privilege.privilege_type <> 'EXECUTE'
        OR privilege.is_grantable
        OR privilege.grantee NOT IN (
          0,
          to_regrole('postgres'),
          to_regrole('anon'),
          to_regrole('authenticated'),
          to_regrole('service_role')
        )
      );

    IF v_unexpected_schema_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: public/private function defaults contain an unexpected grantee, grantor, privilege, or grant option';
    END IF;

    WITH expected(signature) AS (
      VALUES
        ('public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)'),
        ('public.apply_catalog_changes(uuid,jsonb,integer,text,uuid,uuid)'),
        ('public.publish_catalog_version(uuid,integer,jsonb,text,uuid)'),
        ('public.restore_catalog_pointer(uuid,text,uuid)')
    )
    SELECT count(*)
    INTO v_invalid_public_rpc_count
    FROM expected e
    LEFT JOIN pg_proc p ON p.oid = to_regprocedure(e.signature)
    WHERE p.oid IS NULL
       OR pg_get_userbyid(p.proowner) IS DISTINCT FROM 'postgres'
       OR p.prosecdef
       OR p.proconfig IS DISTINCT FROM ARRAY['search_path=""']::text[]
       OR NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
       OR has_function_privilege('anon', p.oid, 'EXECUTE');

    IF v_invalid_public_rpc_count <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard blocked: % migration-017 public RPC stubs differ from the reviewed owner/security/grant posture',
        v_invalid_public_rpc_count;
    END IF;
  END;
  $phase4_global_function_acl_preflight$;

  -- Omitting IN SCHEMA is intentional and required. PostgreSQL applies a
  -- schema-scoped default on top of the global default, so it cannot remove
  -- the built-in global PUBLIC EXECUTE grant.
  ALTER DEFAULT PRIVILEGES
    REVOKE EXECUTE ON FUNCTIONS
    FROM PUBLIC, anon, authenticated, service_role;

  -- Supabase's baseline may contain explicit schema-level function defaults
  -- for API roles. Remove those additive grants as part of the same owner
  -- contract; otherwise they would re-add EXECUTE after the global revoke.
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    REVOKE EXECUTE ON FUNCTIONS
    FROM PUBLIC, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA private
    REVOKE EXECUTE ON FUNCTIONS
    FROM PUBLIC, anon, authenticated, service_role;

  -- Reassert denial on every private routine that exists at this exact
  -- hand-off. The preflight currently requires zero, making unexpected drift
  -- a hard stop instead of silently legitimizing it.
  REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA private
    FROM PUBLIC, anon, authenticated, service_role;

  -- Reassert the only intended executable RPCs at this stage. The global
  -- default change does not remove privileges from existing routines, but
  -- keeping the explicit policy in the same transaction makes the hand-off
  -- independently reviewable.
  REVOKE EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.apply_catalog_changes(
    uuid, jsonb, integer, text, uuid, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) FROM PUBLIC, anon, service_role;

  GRANT EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.apply_catalog_changes(
    uuid, jsonb, integer, text, uuid, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) TO authenticated;

  DO $phase4_global_function_acl_postconditions$
  DECLARE
    v_global_default_rows integer;
    v_global_default_entries integer;
    v_invalid_global_default_entries integer;
    v_public_default_rows integer;
    v_public_default_entries integer;
    v_invalid_schema_default_entries integer;
    v_private_routine_count integer;
    v_invalid_public_rpc_count integer;
  BEGIN
    SELECT count(*)
    INTO v_global_default_rows
    FROM pg_default_acl d
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    IF v_global_default_rows <> 1 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: expected one postgres global function default ACL, found %',
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
    INTO
      v_global_default_entries,
      v_invalid_global_default_entries
    FROM pg_default_acl d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND d.defaclnamespace = 0
      AND d.defaclobjtype = 'f';

    IF v_global_default_entries <> 1
       OR v_invalid_global_default_entries <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: postgres global function defaults are not owner-only EXECUTE';
    END IF;

    SELECT count(*)
    INTO v_public_default_rows
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    WHERE d.defaclrole = to_regrole('postgres')
      AND n.nspname = 'public'
      AND d.defaclobjtype = 'f';

    IF v_public_default_rows > 1 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: duplicate postgres public-schema function default ACL rows found (%)',
        v_public_default_rows;
    END IF;

    SELECT count(*)
    INTO v_public_default_entries
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    CROSS JOIN LATERAL aclexplode(d.defaclacl) privilege
    WHERE d.defaclrole = to_regrole('postgres')
      AND n.nspname = 'public'
      AND d.defaclobjtype = 'f';

    IF v_public_default_entries <> v_public_default_rows THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: postgres public-schema function defaults are not absent or owner-only EXECUTE';
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
        'Phase 4 global function ACL guard postcondition failed: public/private schema defaults add non-owner function EXECUTE';
    END IF;

    SELECT count(*)
    INTO v_private_routine_count
    FROM pg_proc p
    WHERE p.pronamespace = to_regnamespace('private');

    IF v_private_routine_count <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: unexpected private routines appeared during the bridge';
    END IF;

    WITH expected(signature) AS (
      VALUES
        ('public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)'),
        ('public.apply_catalog_changes(uuid,jsonb,integer,text,uuid,uuid)'),
        ('public.publish_catalog_version(uuid,integer,jsonb,text,uuid)'),
        ('public.restore_catalog_pointer(uuid,text,uuid)')
    )
    SELECT count(*)
    INTO v_invalid_public_rpc_count
    FROM expected e
    LEFT JOIN pg_proc p ON p.oid = to_regprocedure(e.signature)
    WHERE p.oid IS NULL
       OR pg_get_userbyid(p.proowner) IS DISTINCT FROM 'postgres'
       OR p.prosecdef
       OR p.proconfig IS DISTINCT FROM ARRAY['search_path=""']::text[]
       OR NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
       OR has_function_privilege('anon', p.oid, 'EXECUTE')
       OR has_function_privilege('service_role', p.oid, 'EXECUTE')
       OR EXISTS (
         SELECT 1
         FROM aclexplode(
           coalesce(p.proacl, acldefault('f', p.proowner))
         ) privilege
         WHERE privilege.privilege_type = 'EXECUTE'
           AND (
             privilege.grantee NOT IN (
               p.proowner,
               to_regrole('authenticated')
             )
             OR privilege.grantor <> p.proowner
             OR privilege.is_grantable
           )
       );

    IF v_invalid_public_rpc_count <> 0 THEN
      RAISE EXCEPTION
        'Phase 4 global function ACL guard postcondition failed: % public RPC stubs differ from the exact authenticated-only posture',
        v_invalid_public_rpc_count;
    END IF;
  END;
  $phase4_global_function_acl_postconditions$;
COMMIT;
