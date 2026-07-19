-- =============================================================================
-- Migration 025: Master Catalog Phase 4 - Withdraw Order Compaction
-- Status: DRAFT - LOCAL ONLY; REVIEW AND TEST BEFORE PRODUCTION EXECUTION
--
-- Purpose:
-- 1. Keep draft display_order contiguous after withdrawing never-published rows.
-- 2. Preserve the relative order of every remaining inherited and new identity.
-- 3. Reuse the set-based placement invalidation contract from migration 024 so
--    one withdrawal transaction advances placement_revision at most once.
-- 4. Keep the existing placement RPC guard strict; ordinary draft mutation must
--    not leave an order gap for the placement flow to repair later.
--
-- This migration installs DDL only. It requires the catalog release gate closed
-- and no mutable draft, and it does not rewrite catalog, BOQ, or Factor F rows.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  DO $phase4_withdraw_compaction_preflight$
  DECLARE
    v_statement_trigger_count integer;
    v_order_constraint_count integer;
    v_disabled_flag_count integer;
    v_working_draft_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_statement_trigger_count
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.price_list'::regclass
      AND trigger_row.tgname IN (
        'trigger_touch_catalog_placement_revision_insert',
        'trigger_touch_catalog_placement_revision_update',
        'trigger_touch_catalog_placement_revision_delete'
      )
      AND trigger_row.tgfoid =
        'private.touch_catalog_placement_revision()'::regprocedure
      AND (trigger_row.tgtype & 1) = 0
      AND trigger_row.tgenabled = 'O'
      AND NOT trigger_row.tgisinternal;

    SELECT count(*)::integer
    INTO v_order_constraint_count
    FROM pg_catalog.pg_constraint constraint_row
    WHERE constraint_row.conrelid = 'public.price_list'::regclass
      AND constraint_row.conname = 'uq_price_list_version_display_order'
      AND constraint_row.contype = 'u'
      AND constraint_row.condeferrable;

    SELECT count(*)::integer
    INTO v_disabled_flag_count
    FROM public.app_settings setting
    WHERE setting.key IN (
        'catalog_admin_enabled',
        'catalog_new_identity_enabled',
        'catalog_retirement_enabled'
      )
      AND setting.value = 'false'::jsonb;

    SELECT count(*)::integer
    INTO v_working_draft_count
    FROM public.price_list_versions version
    WHERE version.status = 'draft';

    IF v_statement_trigger_count <> 3
       OR v_order_constraint_count <> 1
       OR to_regprocedure('private.catalog_placement_state(uuid)') IS NULL THEN
      RAISE EXCEPTION
        'Withdraw compaction blocked: migrations 021/024 are incomplete';
    END IF;

    IF v_disabled_flag_count <> 3 THEN
      RAISE EXCEPTION
        'Withdraw compaction blocked: all catalog feature flags must be false';
    END IF;

    IF v_working_draft_count <> 0 THEN
      RAISE EXCEPTION
        'Withdraw compaction blocked: mutable drafts must be closed before installation';
    END IF;
  END;
  $phase4_withdraw_compaction_preflight$;

  CREATE OR REPLACE FUNCTION private.compact_catalog_draft_order_after_delete()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_version_id uuid;
    v_remaining_count integer;
  BEGIN
    IF current_setting('catalog.placement_write', true) = 'on' THEN
      RETURN NULL;
    END IF;

    SET CONSTRAINTS public.uq_price_list_version_display_order DEFERRED;

    FOR v_version_id IN
      SELECT DISTINCT deleted.version_id
      FROM deleted_rows deleted
      JOIN public.price_list_versions version
        ON version.id = deleted.version_id
      WHERE version.status = 'draft'
        AND version.based_on_version_id IS NOT NULL
      ORDER BY deleted.version_id
    LOOP
      PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          'master_catalog_order:' || v_version_id::text,
          0
        )
      );

      WITH ranked AS (
        SELECT
          candidate.id,
          row_number() OVER (
            ORDER BY candidate.display_order, candidate.identity_id
          )::integer - 1 AS target_display_order
        FROM public.price_list candidate
        WHERE candidate.version_id = v_version_id
      )
      UPDATE public.price_list candidate
      SET
        display_order = ranked.target_display_order,
        updated_at = now()
      FROM ranked
      WHERE candidate.id = ranked.id
        AND candidate.display_order IS DISTINCT FROM ranked.target_display_order;

      SELECT count(*)::integer
      INTO v_remaining_count
      FROM public.price_list candidate
      WHERE candidate.version_id = v_version_id;

      IF v_remaining_count > 0 AND NOT EXISTS (
        SELECT 1
        FROM public.price_list candidate
        WHERE candidate.version_id = v_version_id
        HAVING min(candidate.display_order) = 0
           AND max(candidate.display_order) = count(*) - 1
           AND count(DISTINCT candidate.display_order) = count(*)
      ) THEN
        RAISE EXCEPTION
          'CATALOG_DRAFT_ORDER_COMPACTION_FAILED for version %',
          v_version_id;
      END IF;
    END LOOP;

    RETURN NULL;
  END;
  $function$;

  REVOKE EXECUTE ON FUNCTION private.compact_catalog_draft_order_after_delete()
    FROM PUBLIC, anon, authenticated, service_role;

  DROP TRIGGER IF EXISTS trigger_compact_catalog_draft_order_delete
    ON public.price_list;

  CREATE TRIGGER trigger_compact_catalog_draft_order_delete
    AFTER DELETE ON public.price_list
    REFERENCING OLD TABLE AS deleted_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION private.compact_catalog_draft_order_after_delete();

  DO $phase4_withdraw_compaction_postconditions$
  DECLARE
    v_compaction_trigger_count integer;
    v_statement_trigger_count integer;
    v_disabled_flag_count integer;
    v_working_draft_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_compaction_trigger_count
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.price_list'::regclass
      AND trigger_row.tgname = 'trigger_compact_catalog_draft_order_delete'
      AND trigger_row.tgfoid =
        'private.compact_catalog_draft_order_after_delete()'::regprocedure
      AND (trigger_row.tgtype & 1) = 0
      AND (trigger_row.tgtype & 2) = 0
      AND (trigger_row.tgtype & 8) = 8
      AND trigger_row.tgnewtable IS NULL
      AND trigger_row.tgoldtable = 'deleted_rows'
      AND trigger_row.tgenabled = 'O'
      AND NOT trigger_row.tgisinternal;

    SELECT count(*)::integer
    INTO v_statement_trigger_count
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.price_list'::regclass
      AND trigger_row.tgname IN (
        'trigger_touch_catalog_placement_revision_insert',
        'trigger_touch_catalog_placement_revision_update',
        'trigger_touch_catalog_placement_revision_delete'
      )
      AND trigger_row.tgfoid =
        'private.touch_catalog_placement_revision()'::regprocedure
      AND (trigger_row.tgtype & 1) = 0
      AND trigger_row.tgenabled = 'O'
      AND NOT trigger_row.tgisinternal;

    IF v_compaction_trigger_count <> 1 OR v_statement_trigger_count <> 3 THEN
      RAISE EXCEPTION
        'Withdraw compaction postcondition failed: trigger inventory is incomplete';
    END IF;

    IF has_function_privilege(
         'anon',
         'private.compact_catalog_draft_order_after_delete()',
         'EXECUTE'
       )
       OR has_function_privilege(
         'authenticated',
         'private.compact_catalog_draft_order_after_delete()',
         'EXECUTE'
       )
       OR has_function_privilege(
         'service_role',
         'private.compact_catalog_draft_order_after_delete()',
         'EXECUTE'
       ) THEN
      RAISE EXCEPTION
        'Withdraw compaction postcondition failed: trigger function is overexposed';
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

    SELECT count(*)::integer
    INTO v_working_draft_count
    FROM public.price_list_versions version
    WHERE version.status = 'draft';

    IF v_disabled_flag_count <> 3 OR v_working_draft_count <> 0 THEN
      RAISE EXCEPTION
        'Withdraw compaction postcondition failed: release-gate state changed';
    END IF;
  END;
  $phase4_withdraw_compaction_postconditions$;

COMMIT;
