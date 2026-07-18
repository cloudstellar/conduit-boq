-- =============================================================================
-- Migration 023: Master Catalog Phase 4 - Published Code RLS Scope
-- Status: DRAFT - LOCAL ONLY; REVIEW AND TEST BEFORE PRODUCTION EXECUTION
--
-- Purpose:
-- 1. Preserve staff access to codes used by published/archived snapshots.
-- 2. Prevent a code that exists only in a draft from becoming visible merely
--    because its stable identity appeared in an earlier published snapshot.
-- 3. Keep active-admin history access and all RPC-owned mutation boundaries.
--
-- This is a forward-only correction after Local migration 022. It changes one
-- SELECT policy and does not mutate catalog rows, BOQs, or Factor F data.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  DO $p39r_code_rls_preflight$
  DECLARE
    v_identity_column_count integer;
    v_policy_count integer;
    v_disabled_flag_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_identity_column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'price_list_versions'
      AND column_name IN (
        'target_major',
        'target_minor',
        'target_patch',
        'draft_attempt',
        'target_version_string',
        'draft_reference'
      );

    IF v_identity_column_count <> 6
       OR to_regprocedure('private.prepare_catalog_version_identity()') IS NULL THEN
      RAISE EXCEPTION
        'P-39R code RLS preflight blocked: migration 022 identity contract is incomplete';
    END IF;

    SELECT count(*)::integer
    INTO v_policy_count
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename = 'catalog_item_codes';

    IF v_policy_count <> 1 OR NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_policies policy
      WHERE policy.schemaname = 'public'
        AND policy.tablename = 'catalog_item_codes'
        AND policy.policyname = 'catalog_item_codes_select'
        AND policy.cmd = 'SELECT'
        AND policy.roles = ARRAY['authenticated'::name]
    ) THEN
      RAISE EXCEPTION
        'P-39R code RLS preflight blocked: catalog_item_codes policy inventory drifted';
    END IF;

    SELECT count(*)::integer
    INTO v_disabled_flag_count
    FROM public.app_settings setting
    WHERE setting.key IN (
        'catalog_admin_enabled',
        'catalog_new_identity_enabled',
        'catalog_retirement_enabled'
      )
      AND setting.value = 'false'::jsonb;

    IF v_disabled_flag_count <> 3 THEN
      RAISE EXCEPTION
        'P-39R code RLS preflight blocked: all catalog feature flags must be false';
    END IF;
  END;
  $p39r_code_rls_preflight$;

  DROP POLICY IF EXISTS "catalog_item_codes_select"
    ON public.catalog_item_codes;
  CREATE POLICY "catalog_item_codes_select"
    ON public.catalog_item_codes
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.status = 'active'
          AND (
            profile.role = 'admin'
            OR EXISTS (
              SELECT 1
              FROM public.price_list catalog_row
              JOIN public.price_list_versions version
                ON version.id = catalog_row.version_id
              WHERE catalog_row.identity_id = catalog_item_codes.identity_id
                AND catalog_row.item_code = catalog_item_codes.item_code
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

  DO $p39r_code_rls_postconditions$
  DECLARE
    v_policy_count integer;
    v_disabled_flag_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_policy_count
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename = 'catalog_item_codes';

    IF v_policy_count <> 1 OR NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_policies policy
      WHERE policy.schemaname = 'public'
        AND policy.tablename = 'catalog_item_codes'
        AND policy.policyname = 'catalog_item_codes_select'
        AND policy.permissive = 'PERMISSIVE'
        AND policy.cmd = 'SELECT'
        AND policy.roles = ARRAY['authenticated'::name]
        AND policy.qual ILIKE '%profile.status = ''active''%'
        AND policy.qual ILIKE '%profile.role = ''admin''%'
        AND policy.qual ILIKE '%catalog_row.identity_id = catalog_item_codes.identity_id%'
        AND policy.qual ILIKE '%catalog_row.item_code%::text = catalog_item_codes.item_code%'
        AND policy.qual ILIKE '%version.status%active%archived%'
    ) THEN
      RAISE EXCEPTION
        'P-39R code RLS postcondition failed: published code-pair scope is incomplete';
    END IF;

    IF has_table_privilege('authenticated', 'public.catalog_item_codes', 'INSERT')
       OR has_table_privilege('authenticated', 'public.catalog_item_codes', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.catalog_item_codes', 'DELETE') THEN
      RAISE EXCEPTION
        'P-39R code RLS postcondition failed: authenticated catalog code DML remains';
    END IF;

    SELECT count(*)::integer
    INTO v_disabled_flag_count
    FROM public.app_settings setting
    WHERE setting.key IN (
        'catalog_admin_enabled',
        'catalog_new_identity_enabled',
        'catalog_retirement_enabled'
      )
      AND setting.value = 'false'::jsonb;

    IF v_disabled_flag_count <> 3 THEN
      RAISE EXCEPTION
        'P-39R code RLS postcondition failed: catalog feature flags changed';
    END IF;
  END;
  $p39r_code_rls_postconditions$;

COMMIT;
