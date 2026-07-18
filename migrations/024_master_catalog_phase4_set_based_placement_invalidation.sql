-- =============================================================================
-- Migration 024: Master Catalog Phase 4 - Set-Based Placement Invalidation
-- Status: DRAFT - LOCAL ONLY; REVIEW AND TEST BEFORE PRODUCTION EXECUTION
--
-- Purpose:
-- 1. Preserve the placement-review invalidation contract from migration 021.
-- 2. Replace the per-row trigger's repeated candidate/base scans with one
--    transition-table calculation per INSERT, UPDATE, or DELETE statement.
-- 3. Cache both invalidated and confirmed-no-candidate versions for the current
--    transaction so multi-statement imports do not repeat whole-draft scans.
-- 4. Keep one placement-revision increment per draft/version/transaction.
--
-- This is a forward-only correction after Local migration 023. It changes
-- trigger execution shape only and does not mutate catalog, BOQ, or Factor F
-- business rows during migration execution.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  DO $p39r_placement_preflight$
  DECLARE
    v_identity_column_count integer;
    v_published_code_policy_count integer;
    v_legacy_trigger_count integer;
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

    SELECT count(*)::integer
    INTO v_published_code_policy_count
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename = 'catalog_item_codes'
      AND policy.policyname = 'catalog_item_codes_select'
      AND policy.cmd = 'SELECT'
      AND policy.roles = ARRAY['authenticated'::name]
      AND policy.qual ILIKE '%catalog_row.identity_id = catalog_item_codes.identity_id%'
      AND policy.qual ILIKE '%catalog_row.item_code%::text = catalog_item_codes.item_code%'
      AND policy.qual ILIKE '%version.status%active%archived%';

    IF v_identity_column_count <> 6
       OR to_regprocedure('private.prepare_catalog_version_identity()') IS NULL
       OR v_published_code_policy_count <> 1 THEN
      RAISE EXCEPTION
        'P-39R placement preflight blocked: migrations 022/023 are incomplete';
    END IF;

    SELECT count(*)::integer
    INTO v_legacy_trigger_count
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.price_list'::regclass
      AND trigger_row.tgname = 'trigger_touch_catalog_placement_revision'
      AND (trigger_row.tgtype & 1) = 1
      AND trigger_row.tgenabled = 'O'
      AND NOT trigger_row.tgisinternal;

    IF v_legacy_trigger_count <> 1
       OR to_regprocedure('private.touch_catalog_placement_revision()') IS NULL THEN
      RAISE EXCEPTION
        'P-39R placement preflight blocked: migration 021 row trigger drifted';
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
        'P-39R placement preflight blocked: all catalog feature flags must be false';
    END IF;
  END;
  $p39r_placement_preflight$;

  DROP TRIGGER IF EXISTS trigger_touch_catalog_placement_revision
    ON public.price_list;
  DROP TRIGGER IF EXISTS trigger_touch_catalog_placement_revision_insert
    ON public.price_list;
  DROP TRIGGER IF EXISTS trigger_touch_catalog_placement_revision_update
    ON public.price_list;
  DROP TRIGGER IF EXISTS trigger_touch_catalog_placement_revision_delete
    ON public.price_list;

  CREATE OR REPLACE FUNCTION private.touch_catalog_placement_revision()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version_id uuid;
    v_base_version_id uuid;
    v_direct_new_identity boolean;
    v_has_new_identity boolean;
    v_invalidated_versions text;
    v_no_candidate_versions text;
    v_updated_count integer;
  BEGIN
    IF current_setting('catalog.placement_write', true) = 'on' THEN
      RETURN NULL;
    END IF;

    v_invalidated_versions := COALESCE(
      current_setting('catalog.placement_invalidated_versions', true),
      ''
    );
    v_no_candidate_versions := COALESCE(
      current_setting('catalog.placement_no_candidate_versions', true),
      ''
    );

    IF TG_OP IN ('INSERT', 'DELETE') THEN
      FOR v_version_id, v_base_version_id, v_direct_new_identity IN
        WITH changed_versions AS (
          SELECT
            version.id AS version_id,
            version.based_on_version_id,
            bool_or(base.id IS NULL) AS direct_new_identity
          FROM changed_rows changed
          JOIN public.price_list_versions version
            ON version.id = changed.version_id
          LEFT JOIN public.price_list base
            ON base.version_id = version.based_on_version_id
           AND base.identity_id = changed.identity_id
          WHERE version.status = 'draft'
            AND version.based_on_version_id IS NOT NULL
            AND position(
              '|' || version.id::text || '|'
              IN v_invalidated_versions
            ) = 0
          GROUP BY version.id, version.based_on_version_id
        )
        SELECT
          changed_version.version_id,
          changed_version.based_on_version_id,
          changed_version.direct_new_identity
        FROM changed_versions changed_version
        ORDER BY changed_version.version_id
      LOOP
        IF v_direct_new_identity THEN
          v_has_new_identity := true;
        ELSIF position(
          '|' || v_version_id::text || '|'
          IN v_no_candidate_versions
        ) > 0 THEN
          v_has_new_identity := false;
        ELSE
          SELECT EXISTS (
            SELECT 1
            FROM public.price_list candidate
            WHERE candidate.version_id = v_version_id
              AND NOT EXISTS (
                SELECT 1
                FROM public.price_list base
                WHERE base.version_id = v_base_version_id
                  AND base.identity_id = candidate.identity_id
              )
          )
          INTO v_has_new_identity;

          IF NOT v_has_new_identity THEN
            v_no_candidate_versions :=
              v_no_candidate_versions || '|' || v_version_id::text || '|';
            PERFORM set_config(
              'catalog.placement_no_candidate_versions',
              v_no_candidate_versions,
              true
            );
          END IF;
        END IF;

        IF v_has_new_identity THEN
          UPDATE public.price_list_versions
          SET
            placement_revision = placement_revision + 1,
            updated_at = now()
          WHERE id = v_version_id
            AND status = 'draft';

          GET DIAGNOSTICS v_updated_count = ROW_COUNT;
          IF v_updated_count = 1 THEN
            v_invalidated_versions :=
              v_invalidated_versions || '|' || v_version_id::text || '|';
            PERFORM set_config(
              'catalog.placement_invalidated_versions',
              v_invalidated_versions,
              true
            );
          END IF;
        END IF;
      END LOOP;
    ELSIF TG_OP = 'UPDATE' THEN
      FOR v_version_id, v_base_version_id, v_direct_new_identity IN
        WITH changed_version_rows AS (
          SELECT new_row.version_id, new_row.identity_id
          FROM new_rows new_row
          JOIN old_rows old_row ON old_row.id = new_row.id
          WHERE old_row.version_id IS DISTINCT FROM new_row.version_id
             OR old_row.identity_id IS DISTINCT FROM new_row.identity_id
             OR old_row.category_id IS DISTINCT FROM new_row.category_id
             OR old_row.display_order IS DISTINCT FROM new_row.display_order
             OR old_row.is_active IS DISTINCT FROM new_row.is_active
          UNION
          SELECT old_row.version_id, old_row.identity_id
          FROM new_rows new_row
          JOIN old_rows old_row ON old_row.id = new_row.id
          WHERE old_row.version_id IS DISTINCT FROM new_row.version_id
             OR old_row.identity_id IS DISTINCT FROM new_row.identity_id
             OR old_row.category_id IS DISTINCT FROM new_row.category_id
             OR old_row.display_order IS DISTINCT FROM new_row.display_order
             OR old_row.is_active IS DISTINCT FROM new_row.is_active
        ),
        changed_versions AS (
          SELECT
            version.id AS version_id,
            version.based_on_version_id,
            bool_or(base.id IS NULL) AS direct_new_identity
          FROM changed_version_rows changed
          JOIN public.price_list_versions version
            ON version.id = changed.version_id
          LEFT JOIN public.price_list base
            ON base.version_id = version.based_on_version_id
           AND base.identity_id = changed.identity_id
          WHERE version.status = 'draft'
            AND version.based_on_version_id IS NOT NULL
            AND position(
              '|' || version.id::text || '|'
              IN v_invalidated_versions
            ) = 0
          GROUP BY version.id, version.based_on_version_id
        )
        SELECT
          changed_version.version_id,
          changed_version.based_on_version_id,
          changed_version.direct_new_identity
        FROM changed_versions changed_version
        ORDER BY changed_version.version_id
      LOOP
        IF v_direct_new_identity THEN
          v_has_new_identity := true;
        ELSIF position(
          '|' || v_version_id::text || '|'
          IN v_no_candidate_versions
        ) > 0 THEN
          v_has_new_identity := false;
        ELSE
          SELECT EXISTS (
            SELECT 1
            FROM public.price_list candidate
            WHERE candidate.version_id = v_version_id
              AND NOT EXISTS (
                SELECT 1
                FROM public.price_list base
                WHERE base.version_id = v_base_version_id
                  AND base.identity_id = candidate.identity_id
              )
          )
          INTO v_has_new_identity;

          IF NOT v_has_new_identity THEN
            v_no_candidate_versions :=
              v_no_candidate_versions || '|' || v_version_id::text || '|';
            PERFORM set_config(
              'catalog.placement_no_candidate_versions',
              v_no_candidate_versions,
              true
            );
          END IF;
        END IF;

        IF v_has_new_identity THEN
          UPDATE public.price_list_versions
          SET
            placement_revision = placement_revision + 1,
            updated_at = now()
          WHERE id = v_version_id
            AND status = 'draft';

          GET DIAGNOSTICS v_updated_count = ROW_COUNT;
          IF v_updated_count = 1 THEN
            v_invalidated_versions :=
              v_invalidated_versions || '|' || v_version_id::text || '|';
            PERFORM set_config(
              'catalog.placement_invalidated_versions',
              v_invalidated_versions,
              true
            );
          END IF;
        END IF;
      END LOOP;
    END IF;

    RETURN NULL;
  END;
  $function$;

  REVOKE EXECUTE ON FUNCTION private.touch_catalog_placement_revision()
    FROM PUBLIC, anon, authenticated, service_role;

  CREATE TRIGGER trigger_touch_catalog_placement_revision_insert
    AFTER INSERT ON public.price_list
    REFERENCING NEW TABLE AS changed_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION private.touch_catalog_placement_revision();

  CREATE TRIGGER trigger_touch_catalog_placement_revision_update
    AFTER UPDATE ON public.price_list
    REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION private.touch_catalog_placement_revision();

  CREATE TRIGGER trigger_touch_catalog_placement_revision_delete
    AFTER DELETE ON public.price_list
    REFERENCING OLD TABLE AS changed_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION private.touch_catalog_placement_revision();

  DO $p39r_placement_postconditions$
  DECLARE
    v_statement_trigger_count integer;
    v_legacy_trigger_count integer;
    v_disabled_flag_count integer;
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
      AND (trigger_row.tgtype & 1) = 0
      AND trigger_row.tgenabled = 'O'
      AND NOT trigger_row.tgisinternal
      AND trigger_row.tgfoid =
        'private.touch_catalog_placement_revision()'::regprocedure
      AND (
        (
          trigger_row.tgname = 'trigger_touch_catalog_placement_revision_insert'
          AND trigger_row.tgnewtable = 'changed_rows'
          AND trigger_row.tgoldtable IS NULL
          AND (trigger_row.tgtype & 4) = 4
          AND (trigger_row.tgtype & 24) = 0
        )
        OR (
          trigger_row.tgname = 'trigger_touch_catalog_placement_revision_update'
          AND trigger_row.tgnewtable = 'new_rows'
          AND trigger_row.tgoldtable = 'old_rows'
          AND (trigger_row.tgtype & 16) = 16
          AND (trigger_row.tgtype & 12) = 0
        )
        OR (
          trigger_row.tgname = 'trigger_touch_catalog_placement_revision_delete'
          AND trigger_row.tgnewtable IS NULL
          AND trigger_row.tgoldtable = 'changed_rows'
          AND (trigger_row.tgtype & 8) = 8
          AND (trigger_row.tgtype & 20) = 0
        )
      );

    SELECT count(*)::integer
    INTO v_legacy_trigger_count
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.price_list'::regclass
      AND trigger_row.tgfoid =
        'private.touch_catalog_placement_revision()'::regprocedure
      AND (trigger_row.tgtype & 1) = 1
      AND NOT trigger_row.tgisinternal;

    IF v_statement_trigger_count <> 3 OR v_legacy_trigger_count <> 0 THEN
      RAISE EXCEPTION
        'P-39R placement postcondition failed: set-based trigger inventory is incomplete';
    END IF;

    IF has_function_privilege(
         'anon',
         'private.touch_catalog_placement_revision()',
         'EXECUTE'
       )
       OR has_function_privilege(
         'authenticated',
         'private.touch_catalog_placement_revision()',
         'EXECUTE'
       )
       OR has_function_privilege(
         'service_role',
         'private.touch_catalog_placement_revision()',
         'EXECUTE'
       ) THEN
      RAISE EXCEPTION
        'P-39R placement postcondition failed: trigger function is overexposed';
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
        'P-39R placement postcondition failed: catalog feature flags changed';
    END IF;
  END;
  $p39r_placement_postconditions$;

COMMIT;
