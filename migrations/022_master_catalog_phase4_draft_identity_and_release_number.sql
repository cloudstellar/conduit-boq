-- =============================================================================
-- Migration 022: Master Catalog Phase 4 - Draft Identity and Release Number
-- Status: DRAFT - LOCAL ONLY; REVIEW AND TEST BEFORE PRODUCTION EXECUTION
--
-- Purpose:
-- 1. Give every working/abandoned draft an immutable internal reference.
-- 2. Treat the catalog version on a draft as a publication target, not an
--    externally issued number.
-- 3. Release an unissued target when its draft is abandoned while preserving
--    the complete snapshot, target, reason, and audit history.
-- 4. Allow at most one open draft across the whole catalog workflow.
-- 5. Keep published/archived version tuples globally unique and immutable.
-- 6. Tighten catalog RLS and persist pointer before/after audit evidence.
--
-- This migration is forward-only. It preserves the reviewed 020/021 files and
-- overlays their draft lifecycle without changing Production by itself.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  DO $p39r_preflight$
  DECLARE
    v_open_draft_count integer;
    v_incomplete_published_count integer;
    v_invalid_name_count integer;
    v_unexpected_policy_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_open_draft_count
    FROM public.price_list_versions
    WHERE status = 'draft';

    IF v_open_draft_count > 1 THEN
      RAISE EXCEPTION
        'P-39R preflight blocked: % mutable drafts exist; resolve to one before applying 022',
        v_open_draft_count;
    END IF;

    SELECT count(*)::integer
    INTO v_incomplete_published_count
    FROM public.price_list_versions
    WHERE based_on_version_id IS NOT NULL
      AND status IN ('active', 'archived')
      AND (
        effective_date IS NULL
        OR NULLIF(btrim(approval_reference), '') IS NULL
        OR approval_document_date IS NULL
        OR NULLIF(btrim(physical_archive_reference), '') IS NULL
        OR published_at IS NULL
        OR published_by IS NULL
        OR NULLIF(btrim(published_by_display_name), '') IS NULL
        OR dataset_hash IS NULL
        OR dataset_hash !~ '^sha256:[0-9a-f]{64}$'
        OR item_count IS NULL
        OR item_count <= 0
      );

    IF v_incomplete_published_count <> 0 THEN
      RAISE EXCEPTION
        'P-39R preflight blocked: % derived published versions have incomplete publication evidence',
        v_incomplete_published_count;
    END IF;

    SELECT count(*)::integer
    INTO v_invalid_name_count
    FROM public.price_list_versions
    WHERE NULLIF(btrim(name), '') IS NULL
       OR length(name) > 200;

    IF v_invalid_name_count <> 0 THEN
      RAISE EXCEPTION
        'P-39R preflight blocked: % catalog version names are blank or exceed 200 characters',
        v_invalid_name_count;
    END IF;

    SELECT count(*)::integer
    INTO v_unexpected_policy_count
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename IN (
        'price_list_versions',
        'price_list',
        'price_list_default_version',
        'catalog_item_identities',
        'catalog_item_codes',
        'price_list_categories',
        'catalog_code_groups'
      )
      AND NOT (
        (policy.tablename = 'price_list_versions'
          AND policy.policyname IN (
            'Allow read to authenticated',
            'Allow write to admin only',
            'catalog_versions_state_scoped_select'
          ))
        OR (policy.tablename = 'price_list'
          AND policy.policyname IN (
            'Allow select to authenticated',
            'Allow write to admin only',
            'catalog_price_rows_state_scoped_select'
          ))
        OR (policy.tablename = 'price_list_default_version'
          AND policy.policyname IN (
            'Allow read to authenticated',
            'Allow write to admin only',
            'catalog_default_pointer_active_select'
          ))
        OR (policy.tablename = 'catalog_item_identities'
          AND policy.policyname = 'catalog_item_identities_select')
        OR (policy.tablename = 'catalog_item_codes'
          AND policy.policyname = 'catalog_item_codes_select')
        OR (policy.tablename = 'price_list_categories'
          AND policy.policyname = 'price_list_categories_select')
        OR (policy.tablename = 'catalog_code_groups'
          AND policy.policyname = 'catalog_code_groups_select')
      );

    IF v_unexpected_policy_count <> 0 THEN
      RAISE EXCEPTION
        'P-39R preflight blocked: % unexpected catalog RLS policies require explicit review',
        v_unexpected_policy_count;
    END IF;
  END;
  $p39r_preflight$;

  -- Backfill must not rewrite business timestamps merely because 022 adds
  -- identity columns. A catalog-specific trigger is restored below.
  DROP TRIGGER IF EXISTS trigger_set_updated_at
    ON public.price_list_versions;

  ALTER TABLE public.price_list_versions
    ADD COLUMN IF NOT EXISTS target_major integer,
    ADD COLUMN IF NOT EXISTS target_minor integer,
    ADD COLUMN IF NOT EXISTS target_patch integer,
    ADD COLUMN IF NOT EXISTS draft_attempt integer;

  ALTER TABLE public.price_list_versions
    ADD COLUMN IF NOT EXISTS target_version_string text GENERATED ALWAYS AS (
      target_major::text || '.' || target_minor::text || '.' || target_patch::text
    ) STORED,
    ADD COLUMN IF NOT EXISTS draft_reference text GENERATED ALWAYS AS (
      CASE
        WHEN draft_attempt IS NULL THEN NULL
        ELSE
          target_major::text || '.' || target_minor::text || '.' ||
          target_patch::text || '-D' || lpad(
            draft_attempt::text,
            GREATEST(3, length(draft_attempt::text)),
            '0'
          )
      END
    ) STORED;

  ALTER TABLE public.catalog_change_sets
    ADD COLUMN IF NOT EXISTS pointer_before_version_id uuid
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS pointer_after_version_id uuid
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS affected_draft_version_id uuid
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS draft_effect text;

  DROP TRIGGER IF EXISTS trigger_prevent_published_catalog_version_metadata_mutation
    ON public.price_list_versions;

  UPDATE public.price_list_versions
  SET
    target_major = major,
    target_minor = minor,
    target_patch = patch
  WHERE target_major IS NULL
     OR target_minor IS NULL
     OR target_patch IS NULL;

  WITH ranked_attempts AS (
    SELECT
      version.id,
      row_number() OVER (
        PARTITION BY
          version.target_major,
          version.target_minor,
          version.target_patch
        ORDER BY version.created_at, version.id
      )::integer AS draft_attempt
    FROM public.price_list_versions version
    WHERE version.status IN ('draft', 'abandoned')
       OR version.based_on_version_id IS NOT NULL
  )
  UPDATE public.price_list_versions version
  SET draft_attempt = ranked_attempts.draft_attempt
  FROM ranked_attempts
  WHERE version.id = ranked_attempts.id
    AND version.draft_attempt IS NULL;

  ALTER TABLE public.price_list_versions
    ALTER COLUMN major DROP NOT NULL,
    ALTER COLUMN minor DROP NOT NULL,
    ALTER COLUMN patch DROP NOT NULL,
    ALTER COLUMN target_major SET NOT NULL,
    ALTER COLUMN target_minor SET NOT NULL,
    ALTER COLUMN target_patch SET NOT NULL,
    ALTER COLUMN target_version_string SET NOT NULL;

  -- Abandoned drafts keep their target tuple but relinquish the official tuple.
  -- The existing unique constraint therefore protects only issued/claimed tuples.
  UPDATE public.price_list_versions
  SET
    major = NULL,
    minor = NULL,
    patch = NULL
  WHERE status = 'abandoned';

  ALTER TABLE public.price_list_versions
    DROP CONSTRAINT IF EXISTS check_catalog_target_version,
    DROP CONSTRAINT IF EXISTS check_catalog_official_version_lifecycle,
    DROP CONSTRAINT IF EXISTS check_catalog_draft_reference,
    DROP CONSTRAINT IF EXISTS check_catalog_version_name,
    DROP CONSTRAINT IF EXISTS check_catalog_derived_publication_metadata;

  ALTER TABLE public.price_list_versions
    ADD CONSTRAINT check_catalog_target_version CHECK (
      target_major >= 0
      AND target_minor >= 0
      AND target_patch >= 0
    ),
    ADD CONSTRAINT check_catalog_official_version_lifecycle CHECK (
      (
        status = 'abandoned'
        AND major IS NULL
        AND minor IS NULL
        AND patch IS NULL
      )
      OR
      (
        status IN ('draft', 'active', 'archived')
        AND major IS NOT NULL
        AND minor IS NOT NULL
        AND patch IS NOT NULL
        AND major = target_major
        AND minor = target_minor
        AND patch = target_patch
      )
    ),
    ADD CONSTRAINT check_catalog_draft_reference CHECK (
      (
        draft_attempt IS NULL
        OR draft_attempt > 0
      )
      AND (
        (based_on_version_id IS NULL AND draft_attempt IS NULL)
        OR (based_on_version_id IS NOT NULL AND draft_attempt IS NOT NULL)
      )
    ),
    ADD CONSTRAINT check_catalog_version_name CHECK (
      btrim(name) <> '' AND length(name) <= 200
    ),
    ADD CONSTRAINT check_catalog_derived_publication_metadata CHECK (
      based_on_version_id IS NULL
      OR status IN ('draft', 'abandoned')
      OR (
        status IN ('active', 'archived')
        AND effective_date IS NOT NULL
        AND NULLIF(btrim(approval_reference), '') IS NOT NULL
        AND approval_document_date IS NOT NULL
        AND NULLIF(btrim(physical_archive_reference), '') IS NOT NULL
        AND published_at IS NOT NULL
        AND published_by IS NOT NULL
        AND NULLIF(btrim(published_by_display_name), '') IS NOT NULL
        AND dataset_hash ~ '^sha256:[0-9a-f]{64}$'
        AND item_count > 0
      )
    );

  ALTER TABLE public.catalog_change_sets
    DROP CONSTRAINT IF EXISTS check_catalog_change_sets_pointer_audit,
    DROP CONSTRAINT IF EXISTS check_catalog_change_sets_draft_effect;

  ALTER TABLE public.catalog_change_sets
    ADD CONSTRAINT check_catalog_change_sets_pointer_audit CHECK (
      (pointer_before_version_id IS NULL AND pointer_after_version_id IS NULL)
      OR (
        pointer_before_version_id IS NOT NULL
        AND pointer_after_version_id IS NOT NULL
        AND pointer_before_version_id <> pointer_after_version_id
      )
    ),
    ADD CONSTRAINT check_catalog_change_sets_draft_effect CHECK (
      (
        draft_effect IS NULL
        AND affected_draft_version_id IS NULL
      )
      OR (
        draft_effect = 'none'
        AND affected_draft_version_id IS NULL
      )
      OR (
        draft_effect IN (
          'becomes_current',
          'becomes_stale',
          'remains_stale'
        )
        AND affected_draft_version_id IS NOT NULL
      )
    );

  DROP INDEX IF EXISTS public.uq_price_list_versions_one_draft_per_base;
  DROP INDEX IF EXISTS public.uq_price_list_versions_one_open_draft;

  CREATE UNIQUE INDEX uq_price_list_versions_one_open_draft
    ON public.price_list_versions (status)
    WHERE status = 'draft';

  CREATE UNIQUE INDEX IF NOT EXISTS uq_price_list_versions_target_draft_attempt
    ON public.price_list_versions (
      target_major,
      target_minor,
      target_patch,
      draft_attempt
    )
    WHERE draft_attempt IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_pointer_before
    ON public.catalog_change_sets (pointer_before_version_id)
    WHERE pointer_before_version_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_pointer_after
    ON public.catalog_change_sets (pointer_after_version_id)
    WHERE pointer_after_version_id IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_affected_draft
    ON public.catalog_change_sets (affected_draft_version_id)
    WHERE affected_draft_version_id IS NOT NULL;

  CREATE OR REPLACE FUNCTION private.prepare_catalog_version_identity()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_next_draft_attempt integer;
  BEGIN
    IF TG_OP = 'INSERT' THEN
      IF NEW.status IS DISTINCT FROM 'draft'
         OR NEW.based_on_version_id IS NULL THEN
        RAISE EXCEPTION
          'CATALOG_DRAFT_LIFECYCLE_INVALID: new catalog versions must begin as derived drafts';
      END IF;

      IF NEW.major IS NULL OR NEW.minor IS NULL OR NEW.patch IS NULL THEN
        RAISE EXCEPTION
          'CATALOG_TARGET_VERSION_REQUIRED: a new catalog version requires a target tuple';
      END IF;

      NEW.target_major := NEW.major;
      NEW.target_minor := NEW.minor;
      NEW.target_patch := NEW.patch;

      IF NEW.draft_attempt IS NOT NULL THEN
        RAISE EXCEPTION
          'CATALOG_DRAFT_ATTEMPT_SERVER_ALLOCATED: draft attempt is assigned by the database';
      END IF;

      PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          'master_catalog_draft_attempt:' ||
          NEW.target_major::text || '.' ||
          NEW.target_minor::text || '.' ||
          NEW.target_patch::text,
          0
        )
      );

      SELECT COALESCE(MAX(version.draft_attempt), 0) + 1
      INTO v_next_draft_attempt
      FROM public.price_list_versions version
      WHERE version.target_major = NEW.target_major
        AND version.target_minor = NEW.target_minor
        AND version.target_patch = NEW.target_patch;

      NEW.draft_attempt := v_next_draft_attempt;

      RETURN NEW;
    END IF;

    IF OLD.status = 'draft' THEN
      IF NEW.target_major IS DISTINCT FROM OLD.target_major
         OR NEW.target_minor IS DISTINCT FROM OLD.target_minor
         OR NEW.target_patch IS DISTINCT FROM OLD.target_patch
         OR NEW.draft_attempt IS DISTINCT FROM OLD.draft_attempt
         OR NEW.based_on_version_id IS DISTINCT FROM OLD.based_on_version_id THEN
        RAISE EXCEPTION
          'CATALOG_DRAFT_IDENTITY_IMMUTABLE: draft reference, target version, and base cannot be changed';
      END IF;

      IF NEW.status = 'abandoned' THEN
        NEW.major := NULL;
        NEW.minor := NULL;
        NEW.patch := NULL;
      ELSIF NEW.status IN ('draft', 'active') THEN
        IF NEW.major IS DISTINCT FROM OLD.target_major
           OR NEW.minor IS DISTINCT FROM OLD.target_minor
           OR NEW.patch IS DISTINCT FROM OLD.target_patch THEN
          RAISE EXCEPTION
            'CATALOG_DRAFT_TARGET_MISMATCH: claimed version must match the immutable target';
        END IF;
      ELSE
        RAISE EXCEPTION
          'CATALOG_DRAFT_LIFECYCLE_INVALID: unsupported draft status transition';
      END IF;
    END IF;

    RETURN NEW;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.prevent_published_catalog_version_metadata_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    IF OLD.status = 'abandoned' THEN
      RAISE EXCEPTION
        'CATALOG_ABANDONED_VERSION_IMMUTABLE: abandoned catalog metadata cannot be changed';
    END IF;

    IF OLD.status IN ('active', 'archived') THEN
      IF NEW.major IS DISTINCT FROM OLD.major
         OR NEW.minor IS DISTINCT FROM OLD.minor
         OR NEW.patch IS DISTINCT FROM OLD.patch
         OR NEW.target_major IS DISTINCT FROM OLD.target_major
         OR NEW.target_minor IS DISTINCT FROM OLD.target_minor
         OR NEW.target_patch IS DISTINCT FROM OLD.target_patch
         OR NEW.draft_attempt IS DISTINCT FROM OLD.draft_attempt
         OR NEW.name IS DISTINCT FROM OLD.name
         OR NEW.status IS DISTINCT FROM OLD.status
         OR NEW.created_by IS DISTINCT FROM OLD.created_by
         OR NEW.created_at IS DISTINCT FROM OLD.created_at
         OR NEW.based_on_version_id IS DISTINCT FROM OLD.based_on_version_id
         OR NEW.effective_date IS DISTINCT FROM OLD.effective_date
         OR NEW.approval_reference IS DISTINCT FROM OLD.approval_reference
         OR NEW.approval_document_date IS DISTINCT FROM OLD.approval_document_date
         OR NEW.physical_archive_reference IS DISTINCT FROM OLD.physical_archive_reference
         OR NEW.published_at IS DISTINCT FROM OLD.published_at
         OR NEW.published_by IS DISTINCT FROM OLD.published_by
         OR NEW.published_by_display_name IS DISTINCT FROM OLD.published_by_display_name
         OR NEW.dataset_hash IS DISTINCT FROM OLD.dataset_hash
         OR NEW.item_count IS DISTINCT FROM OLD.item_count
         OR NEW.lock_version IS DISTINCT FROM OLD.lock_version
         OR NEW.placement_revision IS DISTINCT FROM OLD.placement_revision
         OR (
           NEW.updated_at IS DISTINCT FROM OLD.updated_at
           AND NEW.is_default IS NOT DISTINCT FROM OLD.is_default
         )
         OR NEW.is_default IS NOT DISTINCT FROM OLD.is_default THEN
        RAISE EXCEPTION
          'CATALOG_PUBLISHED_VERSION_IMMUTABLE: published catalog metadata cannot be changed';
      END IF;
    END IF;

    RETURN NEW;
  END;
  $function$;

  DROP TRIGGER IF EXISTS trigger_catalog_version_prepare_identity
    ON public.price_list_versions;
  CREATE TRIGGER trigger_catalog_version_prepare_identity
    BEFORE INSERT OR UPDATE ON public.price_list_versions
    FOR EACH ROW
    EXECUTE FUNCTION private.prepare_catalog_version_identity();

  CREATE TRIGGER trigger_prevent_published_catalog_version_metadata_mutation
    BEFORE UPDATE ON public.price_list_versions
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_published_catalog_version_metadata_mutation();

  CREATE OR REPLACE FUNCTION private.set_catalog_version_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    IF OLD.status IN ('active', 'archived') THEN
      NEW.updated_at := OLD.updated_at;
    ELSE
      NEW.updated_at := now();
    END IF;

    RETURN NEW;
  END;
  $function$;

  CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON public.price_list_versions
    FOR EACH ROW
    EXECUTE FUNCTION private.set_catalog_version_updated_at();

  CREATE OR REPLACE FUNCTION private.prepare_catalog_pointer_audit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_publish_base_id uuid;
    v_current_pointer_id uuid;
    v_affected_draft_base_id uuid;
    v_affected_draft_status text;
  BEGIN
    IF NEW.change_type IN ('publish', 'restore') THEN
      SELECT pointer.version_id
      INTO v_current_pointer_id
      FROM public.price_list_default_version pointer
      WHERE pointer.id = true;
    END IF;

    IF NEW.change_type = 'publish' THEN
      SELECT based_on_version_id
      INTO v_publish_base_id
      FROM public.price_list_versions
      WHERE id = NEW.version_id;

      NEW.pointer_before_version_id := COALESCE(
        NEW.pointer_before_version_id,
        v_publish_base_id
      );
      NEW.pointer_after_version_id := COALESCE(
        NEW.pointer_after_version_id,
        NEW.version_id
      );

      IF NEW.pointer_before_version_id IS DISTINCT FROM v_publish_base_id
         OR NEW.pointer_after_version_id IS DISTINCT FROM NEW.version_id
         OR v_current_pointer_id IS DISTINCT FROM NEW.pointer_after_version_id
         OR NEW.affected_draft_version_id IS NOT NULL
         OR NEW.draft_effect IS NOT NULL THEN
        RAISE EXCEPTION
          'CATALOG_POINTER_AUDIT_INVALID: publish pointer evidence does not match the draft base';
      END IF;
    ELSIF NEW.change_type = 'restore' THEN
      IF NEW.pointer_before_version_id IS NULL
         OR NEW.pointer_after_version_id IS DISTINCT FROM NEW.version_id
         OR NEW.draft_effect IS NULL
         OR (
           NEW.draft_effect = 'none'
           AND NEW.affected_draft_version_id IS NOT NULL
         )
         OR (
           NEW.draft_effect <> 'none'
           AND NEW.affected_draft_version_id IS NULL
         ) THEN
        RAISE EXCEPTION
          'CATALOG_POINTER_AUDIT_INVALID: restore pointer and draft-effect evidence are required';
      END IF;

      IF v_current_pointer_id IS DISTINCT FROM NEW.pointer_after_version_id THEN
        RAISE EXCEPTION
          'CATALOG_POINTER_AUDIT_INVALID: restore pointer-after evidence is not current';
      END IF;

      IF NEW.draft_effect <> 'none' THEN
        SELECT version.based_on_version_id, version.status
        INTO v_affected_draft_base_id, v_affected_draft_status
        FROM public.price_list_versions version
        WHERE version.id = NEW.affected_draft_version_id;

        IF v_affected_draft_status IS DISTINCT FROM 'draft'
           OR (
             NEW.draft_effect = 'becomes_current'
             AND v_affected_draft_base_id IS DISTINCT FROM NEW.pointer_after_version_id
           )
           OR (
             NEW.draft_effect = 'becomes_stale'
             AND v_affected_draft_base_id IS DISTINCT FROM NEW.pointer_before_version_id
           )
           OR (
             NEW.draft_effect = 'remains_stale'
             AND (
               v_affected_draft_base_id IS NOT DISTINCT FROM NEW.pointer_before_version_id
               OR v_affected_draft_base_id IS NOT DISTINCT FROM NEW.pointer_after_version_id
             )
           ) THEN
          RAISE EXCEPTION
            'CATALOG_POINTER_AUDIT_INVALID: restore draft effect does not match the affected draft base';
        END IF;
      END IF;
    ELSIF NEW.pointer_before_version_id IS NOT NULL
       OR NEW.pointer_after_version_id IS NOT NULL
       OR NEW.affected_draft_version_id IS NOT NULL
       OR NEW.draft_effect IS NOT NULL THEN
      RAISE EXCEPTION
        'CATALOG_POINTER_AUDIT_INVALID: pointer evidence is allowed only for publish or restore';
    END IF;

    RETURN NEW;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.prevent_catalog_audit_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    RAISE EXCEPTION
      'CATALOG_AUDIT_IMMUTABLE: catalog change history is append-only';
  END;
  $function$;

  DROP TRIGGER IF EXISTS trigger_prepare_catalog_pointer_audit
    ON public.catalog_change_sets;
  CREATE TRIGGER trigger_prepare_catalog_pointer_audit
    BEFORE INSERT ON public.catalog_change_sets
    FOR EACH ROW
    EXECUTE FUNCTION private.prepare_catalog_pointer_audit();

  DROP TRIGGER IF EXISTS trigger_prevent_catalog_change_set_mutation
    ON public.catalog_change_sets;
  CREATE TRIGGER trigger_prevent_catalog_change_set_mutation
    BEFORE UPDATE OR DELETE ON public.catalog_change_sets
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_catalog_audit_mutation();

  DROP TRIGGER IF EXISTS trigger_prevent_catalog_change_item_mutation
    ON public.catalog_change_items;
  CREATE TRIGGER trigger_prevent_catalog_change_item_mutation
    BEFORE UPDATE OR DELETE ON public.catalog_change_items
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_catalog_audit_mutation();

  DROP POLICY IF EXISTS "Allow read to authenticated"
    ON public.price_list_versions;
  DROP POLICY IF EXISTS "Allow write to admin only"
    ON public.price_list_versions;
  DROP POLICY IF EXISTS "catalog_versions_state_scoped_select"
    ON public.price_list_versions;
  CREATE POLICY "catalog_versions_state_scoped_select"
    ON public.price_list_versions
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.status = 'active'
          AND (
            profile.role = 'admin'
            OR price_list_versions.status IN ('active', 'archived')
          )
      )
    );

  DROP POLICY IF EXISTS "Allow select to authenticated"
    ON public.price_list;
  DROP POLICY IF EXISTS "Allow write to admin only"
    ON public.price_list;
  DROP POLICY IF EXISTS "catalog_price_rows_state_scoped_select"
    ON public.price_list;
  CREATE POLICY "catalog_price_rows_state_scoped_select"
    ON public.price_list
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
              FROM public.price_list_versions version
              WHERE version.id = price_list.version_id
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

  DROP POLICY IF EXISTS "Allow read to authenticated"
    ON public.price_list_default_version;
  DROP POLICY IF EXISTS "Allow write to admin only"
    ON public.price_list_default_version;
  DROP POLICY IF EXISTS "catalog_default_pointer_active_select"
    ON public.price_list_default_version;
  CREATE POLICY "catalog_default_pointer_active_select"
    ON public.price_list_default_version
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.status = 'active'
      )
    );

  DROP POLICY IF EXISTS "catalog_item_identities_select"
    ON public.catalog_item_identities;
  CREATE POLICY "catalog_item_identities_select"
    ON public.catalog_item_identities
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
              WHERE catalog_row.identity_id = catalog_item_identities.id
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

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
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

  DROP POLICY IF EXISTS "price_list_categories_select"
    ON public.price_list_categories;
  CREATE POLICY "price_list_categories_select"
    ON public.price_list_categories
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
              FROM public.price_list_versions version
              WHERE version.id = price_list_categories.version_id
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

  DROP POLICY IF EXISTS "catalog_code_groups_select"
    ON public.catalog_code_groups;
  CREATE POLICY "catalog_code_groups_select"
    ON public.catalog_code_groups
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
              FROM public.price_list_versions version
              WHERE version.id = catalog_code_groups.version_id
                AND version.status IN ('active', 'archived')
            )
          )
      )
    );

  CREATE OR REPLACE FUNCTION private.abandon_catalog_draft_impl(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_request_fingerprint text;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_draft public.price_list_versions%ROWTYPE;
    v_change_set_id uuid;
    v_after_lock integer;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(
        p_request_id, 'FORBIDDEN', 'Active admin profile is required', false
      );
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(
        p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false
      );
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_version_id IS NULL
       OR p_request_id IS NULL
       OR p_expected_lock_version IS NULL
       OR p_expected_lock_version < 0
       OR v_reason IS NULL
       OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VALIDATION_FAILED',
        'Draft, expected lock version, reason, and request ID are required',
        false
      );
    END IF;

    v_request_fingerprint := private.catalog_request_fingerprint(
      'abandon_draft',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'reason', v_reason
      )
    );

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_request:' || p_request_id::text, 0)
    );

    SELECT *
    INTO v_existing_change
    FROM public.catalog_change_sets
    WHERE request_id = p_request_id;

    IF FOUND THEN
      IF v_existing_change.change_type IS DISTINCT FROM 'abandon'
         OR v_existing_change.actor_id IS DISTINCT FROM v_actor_id
         OR v_existing_change.request_fingerprint IS DISTINCT FROM v_request_fingerprint THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'REQUEST_ID_PAYLOAD_MISMATCH',
          'Request ID was already used with a different catalog operation or payload',
          false
        );
      END IF;

      SELECT *
      INTO v_draft
      FROM public.price_list_versions
      WHERE id = v_existing_change.version_id;

      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'versionId', v_existing_change.version_id::text,
          'officialVersionString', NULL,
          'targetVersionString', v_draft.target_version_string,
          'draftReference', v_draft.draft_reference,
          'status', v_draft.status,
          'lockVersion', v_existing_change.after_lock_version,
          'changeSetId', v_existing_change.id::text,
          'duplicateRequest', true
        )
      );
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.catalog_imports WHERE request_id = p_request_id
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    SELECT *
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(
        p_request_id, 'DRAFT_NOT_FOUND', 'Draft catalog version was not found', false
      );
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(
        p_request_id, 'DRAFT_NOT_EDITABLE', 'Only a mutable draft can be abandoned', false
      );
    END IF;

    IF v_draft.lock_version IS DISTINCT FROM p_expected_lock_version THEN
      RETURN private.catalog_action_error(
        p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true
      );
    END IF;

    v_after_lock := v_draft.lock_version + 1;

    INSERT INTO public.catalog_change_sets (
      version_id,
      change_type,
      reason,
      request_id,
      request_fingerprint,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version
    )
    VALUES (
      v_draft.id,
      'abandon',
      v_reason,
      p_request_id,
      v_request_fingerprint,
      v_actor_id,
      v_actor_display_name,
      v_draft.lock_version,
      v_after_lock
    )
    RETURNING id INTO v_change_set_id;

    UPDATE public.price_list_versions
    SET
      status = 'abandoned',
      lock_version = v_after_lock,
      updated_at = now()
    WHERE id = v_draft.id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', v_draft.id::text,
        'officialVersionString', NULL,
        'targetVersionString', v_draft.target_version_string,
        'draftReference', v_draft.draft_reference,
        'status', 'abandoned',
        'lockVersion', v_after_lock,
        'changeSetId', v_change_set_id::text,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.create_catalog_draft(
    p_base_version_id uuid,
    p_version_major integer,
    p_version_minor integer,
    p_version_patch integer,
    p_name text,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
  DECLARE
    v_constraint_name text;
    v_result jsonb;
    v_version public.price_list_versions%ROWTYPE;
    v_version_id uuid;
  BEGIN
    IF NULLIF(btrim(p_name), '') IS NULL
       OR length(btrim(p_name)) > 200
       OR NULLIF(btrim(p_reason), '') IS NULL
       OR length(btrim(p_reason)) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VALIDATION_FAILED',
        'Draft name and reason are required and exceed no allowed length',
        false
      );
    END IF;

    BEGIN
      v_result := private.create_catalog_draft_guarded_impl(
        p_base_version_id,
        p_version_major,
        p_version_minor,
        p_version_patch,
        btrim(p_name),
        btrim(p_reason),
        p_request_id
      );
    EXCEPTION
      WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_constraint_name = CONSTRAINT_NAME;

        IF v_constraint_name = 'uq_price_list_versions_one_open_draft' THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'DRAFT_ALREADY_EXISTS',
            'One mutable catalog draft is already open; resolve it before creating another',
            false
          );
        END IF;

        RAISE;
    END;

    IF v_result ->> 'ok' = 'false'
       AND v_result #>> '{error,code}' = 'DRAFT_ALREADY_EXISTS' THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_ALREADY_EXISTS',
        'One mutable catalog draft is already open; resolve it before creating another',
        false
      );
    END IF;

    IF v_result ->> 'ok' = 'true' THEN
      v_version_id := NULLIF(v_result #>> '{data,versionId}', '')::uuid;

      SELECT *
      INTO v_version
      FROM public.price_list_versions
      WHERE id = v_version_id;

      IF FOUND THEN
        v_result := jsonb_set(
          v_result,
          '{data}',
          (COALESCE(v_result->'data', '{}'::jsonb) - 'versionString') || jsonb_build_object(
            'officialVersionString', CASE
              WHEN v_version.status IN ('active', 'archived')
                THEN v_version.version_string
              ELSE NULL
            END,
            'targetVersionString', v_version.target_version_string,
            'draftReference', v_version.draft_reference,
            'status', v_version.status
          ),
          true
        );
      END IF;
    END IF;

    RETURN v_result;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.publish_catalog_version(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_approval_metadata jsonb,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
  DECLARE
    v_result jsonb;
    v_version public.price_list_versions%ROWTYPE;
  BEGIN
    v_result := private.publish_catalog_version_impl(
      p_version_id,
      p_expected_lock_version,
      p_approval_metadata,
      p_reason,
      p_request_id
    );

    IF v_result ->> 'ok' = 'true' THEN
      SELECT *
      INTO v_version
      FROM public.price_list_versions
      WHERE id = p_version_id;

      IF FOUND THEN
        v_result := jsonb_set(
          v_result,
          '{data}',
          (COALESCE(v_result->'data', '{}'::jsonb) - 'versionString') || jsonb_build_object(
            'officialVersionString', v_version.version_string,
            'targetVersionString', v_version.target_version_string,
            'draftReference', v_version.draft_reference,
            'status', v_version.status
          ),
          true
        );
      END IF;
    END IF;

    RETURN v_result;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.restore_catalog_pointer_impl(
    p_target_version_id uuid,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_current_version_id uuid;
    v_target public.price_list_versions%ROWTYPE;
    v_open_draft public.price_list_versions%ROWTYPE;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_request_fingerprint text;
    v_change_set_id uuid;
    v_affected_draft_id uuid;
    v_affected_draft_reference text;
    v_affected_draft_target text;
    v_draft_effect text;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(
        p_request_id, 'FORBIDDEN', 'Active admin profile is required', false
      );
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(
        p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false
      );
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_target_version_id IS NULL
       OR p_request_id IS NULL
       OR v_reason IS NULL
       OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VALIDATION_FAILED',
        'Target version, reason, and request ID are required',
        false
      );
    END IF;

    v_request_fingerprint := private.catalog_request_fingerprint(
      'restore',
      jsonb_build_object(
        'targetVersionId', p_target_version_id,
        'reason', v_reason
      )
    );

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_request:' || p_request_id::text, 0)
    );

    SELECT *
    INTO v_existing_change
    FROM public.catalog_change_sets
    WHERE request_id = p_request_id;

    IF FOUND THEN
      IF v_existing_change.change_type = 'restore'
         AND v_existing_change.actor_id IS NOT DISTINCT FROM v_actor_id
         AND v_existing_change.request_fingerprint IS NOT DISTINCT FROM v_request_fingerprint THEN
        SELECT *
        INTO v_target
        FROM public.price_list_versions
        WHERE id = v_existing_change.version_id;

        SELECT *
        INTO v_open_draft
        FROM public.price_list_versions
        WHERE id = v_existing_change.affected_draft_version_id;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'versionId', v_existing_change.version_id::text,
            'targetVersionId', v_existing_change.version_id::text,
            'officialVersionString', v_target.version_string,
            'targetVersionString', v_target.version_string,
            'previousVersionId', v_existing_change.pointer_before_version_id::text,
            'currentPointerVersionId', v_existing_change.pointer_after_version_id::text,
            'affectedDraftVersionId', v_existing_change.affected_draft_version_id::text,
            'affectedDraftReference', v_open_draft.draft_reference,
            'affectedDraftTargetVersionString', v_open_draft.target_version_string,
            'draftEffect', COALESCE(v_existing_change.draft_effect, 'none'),
            'changeSetId', v_existing_change.id::text,
            'duplicateRequest', true
          )
        );
      END IF;

      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    IF EXISTS (SELECT 1 FROM public.catalog_imports WHERE request_id = p_request_id) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_publish_pointer', 0)
    );

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true
    FOR UPDATE;

    SELECT *
    INTO v_target
    FROM public.price_list_versions
    WHERE id = p_target_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VERSION_NOT_FOUND', 'Target catalog version was not found', false
      );
    END IF;

    IF v_target.status <> 'active'
       OR v_target.published_at IS NULL
       OR v_target.dataset_hash IS NULL
       OR v_target.item_count IS NULL THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VERSION_NOT_RESTORABLE',
        'Target catalog version must be active and published',
        false
      );
    END IF;

    IF v_current_version_id IS NOT DISTINCT FROM p_target_version_id THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'POINTER_ALREADY_CURRENT',
        'Target catalog version is already current',
        false
      );
    END IF;

    SELECT *
    INTO v_open_draft
    FROM public.price_list_versions
    WHERE status = 'draft'
    ORDER BY created_at, id
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      v_affected_draft_id := v_open_draft.id;
      v_affected_draft_reference := v_open_draft.draft_reference;
      v_affected_draft_target := v_open_draft.target_version_string;

      IF v_open_draft.based_on_version_id = p_target_version_id THEN
        v_draft_effect := 'becomes_current';
      ELSIF v_open_draft.based_on_version_id = v_current_version_id THEN
        v_draft_effect := 'becomes_stale';
      ELSE
        v_draft_effect := 'remains_stale';
      END IF;
    ELSE
      v_draft_effect := 'none';
    END IF;

    UPDATE public.price_list_default_version
    SET version_id = p_target_version_id, updated_at = now()
    WHERE id = true;

    UPDATE public.price_list_versions
    SET is_default = false
    WHERE is_default = true
      AND id <> p_target_version_id;

    UPDATE public.price_list_versions
    SET is_default = true
    WHERE id = p_target_version_id;

    INSERT INTO public.catalog_change_sets (
      version_id,
      change_type,
      reason,
      request_id,
      request_fingerprint,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version,
      pointer_before_version_id,
      pointer_after_version_id,
      affected_draft_version_id,
      draft_effect
    )
    VALUES (
      p_target_version_id,
      'restore',
      v_reason,
      p_request_id,
      v_request_fingerprint,
      v_actor_id,
      v_actor_display_name,
      NULL,
      NULL,
      v_current_version_id,
      p_target_version_id,
      v_affected_draft_id,
      v_draft_effect
    )
    RETURNING id INTO v_change_set_id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', p_target_version_id::text,
        'targetVersionId', p_target_version_id::text,
        'officialVersionString', v_target.version_string,
        'targetVersionString', v_target.version_string,
        'previousVersionId', v_current_version_id::text,
        'currentPointerVersionId', p_target_version_id::text,
        'affectedDraftVersionId', v_affected_draft_id::text,
        'affectedDraftReference', v_affected_draft_reference,
        'affectedDraftTargetVersionString', v_affected_draft_target,
        'draftEffect', v_draft_effect,
        'changeSetId', v_change_set_id::text,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_versions_page(
    p_limit integer,
    p_before_created_at timestamptz,
    p_before_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  SET statement_timeout = '10s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_page jsonb;
    v_rows jsonb;
    v_has_more boolean;
    v_next_cursor jsonb;
  BEGIN
    SELECT actor_id
    INTO v_actor_id
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL OR NOT private.catalog_admin_enabled() THEN
      RAISE EXCEPTION 'CATALOG_FORBIDDEN: active enabled admin profile is required';
    END IF;

    IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
      RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: page limit must be between 1 and 100';
    END IF;

    IF (p_before_created_at IS NULL) <> (p_before_id IS NULL) THEN
      RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: both cursor values are required together';
    END IF;

    SELECT COALESCE(
      jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC, page.id DESC),
      '[]'::jsonb
    )
    INTO v_page
    FROM (
      SELECT
        version.id,
        version.version_string,
        version.target_version_string,
        version.draft_reference,
        version.name,
        version.status,
        version.is_default,
        version.based_on_version_id,
        version.effective_date,
        version.approval_reference,
        version.approval_document_date,
        version.physical_archive_reference,
        version.published_at,
        version.published_by_display_name,
        version.dataset_hash,
        version.item_count,
        version.lock_version,
        version.created_at,
        version.updated_at
      FROM public.price_list_versions version
      WHERE p_before_created_at IS NULL
         OR version.created_at < p_before_created_at
         OR (
           version.created_at = p_before_created_at
           AND version.id < p_before_id
         )
      ORDER BY version.created_at DESC, version.id DESC
      LIMIT p_limit + 1
    ) page;

    v_has_more := jsonb_array_length(v_page) > p_limit;

    SELECT COALESCE(jsonb_agg(entry.value ORDER BY entry.ordinality), '[]'::jsonb)
    INTO v_rows
    FROM jsonb_array_elements(v_page) WITH ORDINALITY AS entry(value, ordinality)
    WHERE entry.ordinality <= p_limit;

    IF v_has_more THEN
      v_next_cursor := jsonb_build_object(
        'createdAt', v_rows->(p_limit - 1)->>'created_at',
        'id', v_rows->(p_limit - 1)->>'id'
      );
    ELSE
      v_next_cursor := NULL;
    END IF;

    RETURN jsonb_build_object('rows', v_rows, 'nextCursor', v_next_cursor);
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_versions_page(
    p_limit integer DEFAULT 50,
    p_before_created_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.catalog_versions_page(
      p_limit,
      p_before_created_at,
      p_before_id
    );
  $function$;

  REVOKE EXECUTE ON FUNCTION private.prepare_catalog_version_identity()
    FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_version_metadata_mutation()
    FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.set_catalog_version_updated_at()
    FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.prepare_catalog_pointer_audit()
    FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.prevent_catalog_audit_mutation()
    FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.create_catalog_draft_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon, authenticated, service_role;
  REVOKE EXECUTE ON FUNCTION private.create_catalog_draft_guarded_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION private.abandon_catalog_draft_impl(uuid, integer, text, uuid)
    FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION private.restore_catalog_pointer_impl(uuid, text, uuid)
    FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION private.catalog_versions_page(integer, timestamptz, uuid)
    FROM PUBLIC, anon, service_role;

  GRANT EXECUTE ON FUNCTION private.create_catalog_draft_guarded_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION private.abandon_catalog_draft_impl(uuid, integer, text, uuid)
    TO authenticated;
  GRANT EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION private.restore_catalog_pointer_impl(uuid, text, uuid)
    TO authenticated;
  GRANT EXECUTE ON FUNCTION private.catalog_versions_page(integer, timestamptz, uuid)
    TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.abandon_catalog_draft(
    uuid, integer, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) FROM PUBLIC, anon, service_role;
  REVOKE EXECUTE ON FUNCTION public.get_catalog_versions_page(
    integer, timestamptz, uuid
  ) FROM PUBLIC, anon, service_role;

  GRANT EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.abandon_catalog_draft(
    uuid, integer, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.get_catalog_versions_page(
    integer, timestamptz, uuid
  ) TO authenticated;

  DO $postconditions$
DECLARE
  v_bad_rows integer;
  v_definition text;
BEGIN
  IF lpad('1', GREATEST(3, length('1')), '0') <> '001'
     OR lpad('1000', GREATEST(3, length('1000')), '0') <> '1000' THEN
    RAISE EXCEPTION
      'P-39 postcondition failed: draft reference attempt formatting is unsafe';
  END IF;

  SELECT count(*)
  INTO v_bad_rows
  FROM public.price_list_versions version
  WHERE version.target_version_string IS NULL
     OR (
       version.status = 'abandoned'
       AND (
         version.version_string IS NOT NULL
         OR version.draft_reference IS NULL
       )
     )
     OR (
       version.status IN ('draft', 'active', 'archived')
       AND version.version_string IS DISTINCT FROM version.target_version_string
     )
     OR (
       version.draft_attempt IS NOT NULL
       AND version.draft_reference !~
         '^[0-9]+\.[0-9]+\.[0-9]+-D[0-9]{3,}$'
     )
     OR (
       version.draft_attempt IS NOT NULL
       AND version.draft_reference IS DISTINCT FROM
         version.target_version_string || '-D' || lpad(
           version.draft_attempt::text,
           GREATEST(3, length(version.draft_attempt::text)),
           '0'
         )
     );

  IF v_bad_rows <> 0 THEN
    RAISE EXCEPTION
      'P-39 postcondition failed: % catalog versions violate draft/release identity',
      v_bad_rows;
  END IF;

  SELECT count(*)::integer
  INTO v_bad_rows
  FROM public.price_list_versions
  WHERE status = 'draft';

  IF v_bad_rows > 1 THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: % mutable drafts remain open',
      v_bad_rows;
  END IF;

  SELECT count(*)
  INTO v_bad_rows
  FROM pg_catalog.pg_attribute attribute
  WHERE attribute.attrelid = 'public.price_list_versions'::regclass
    AND attribute.attname IN ('target_version_string', 'draft_reference')
    AND attribute.attgenerated = 's'
    AND NOT attribute.attisdropped;

  IF v_bad_rows <> 2 THEN
    RAISE EXCEPTION
      'P-39 postcondition failed: generated target/draft references are incomplete';
  END IF;

  SELECT pg_catalog.pg_get_expr(definition.adbin, definition.adrelid)
  INTO v_definition
  FROM pg_catalog.pg_attribute attribute
  JOIN pg_catalog.pg_attrdef definition
    ON definition.adrelid = attribute.attrelid
   AND definition.adnum = attribute.attnum
  WHERE attribute.attrelid = 'public.price_list_versions'::regclass
    AND attribute.attname = 'target_version_string'
    AND attribute.attgenerated = 's';

  IF v_definition IS NULL
     OR v_definition NOT LIKE '%target_major%'
     OR v_definition NOT LIKE '%target_minor%'
     OR v_definition NOT LIKE '%target_patch%' THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: target version generated expression drifted';
  END IF;

  SELECT pg_catalog.pg_get_expr(definition.adbin, definition.adrelid)
  INTO v_definition
  FROM pg_catalog.pg_attribute attribute
  JOIN pg_catalog.pg_attrdef definition
    ON definition.adrelid = attribute.attrelid
   AND definition.adnum = attribute.attnum
  WHERE attribute.attrelid = 'public.price_list_versions'::regclass
    AND attribute.attname = 'draft_reference'
    AND attribute.attgenerated = 's';

  IF v_definition IS NULL
     OR v_definition NOT LIKE '%draft_attempt%'
     OR v_definition NOT LIKE '%lpad%'
     OR v_definition NOT LIKE '%target_major%'
     OR v_definition NOT LIKE '%target_minor%'
     OR v_definition NOT LIKE '%target_patch%' THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: draft reference generated expression drifted';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_rows
  FROM pg_catalog.pg_index index_row
  JOIN pg_catalog.pg_class index_relation
    ON index_relation.oid = index_row.indexrelid
  JOIN pg_catalog.pg_attribute attribute
    ON attribute.attrelid = index_row.indrelid
   AND attribute.attnum = ANY(index_row.indkey)
  WHERE index_row.indrelid = 'public.price_list_versions'::regclass
    AND index_relation.relname = 'uq_price_list_versions_one_open_draft'
    AND index_row.indisunique
    AND index_row.indnkeyatts = 1
    AND attribute.attname = 'status'
    AND pg_catalog.pg_get_expr(index_row.indpred, index_row.indrelid)
      = '(status = ''draft''::text)';

  IF v_bad_rows <> 1 THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: global one-open-draft index is missing or drifted';
  END IF;

  SELECT count(DISTINCT attribute.attname)::integer
  INTO v_bad_rows
  FROM pg_catalog.pg_index index_row
  JOIN pg_catalog.pg_class index_relation
    ON index_relation.oid = index_row.indexrelid
  JOIN pg_catalog.pg_attribute attribute
    ON attribute.attrelid = index_row.indrelid
   AND attribute.attnum = ANY(index_row.indkey)
  WHERE index_row.indrelid = 'public.price_list_versions'::regclass
    AND index_relation.relname = 'uq_price_list_versions_target_draft_attempt'
    AND index_row.indisunique
    AND index_row.indisvalid
    AND index_row.indnkeyatts = 4
    AND attribute.attname IN (
      'target_major',
      'target_minor',
      'target_patch',
      'draft_attempt'
    )
    AND pg_catalog.pg_get_expr(index_row.indpred, index_row.indrelid)
      = '(draft_attempt IS NOT NULL)';

  IF v_bad_rows <> 4 THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: target-scoped draft-attempt index is missing or drifted';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_rows
  FROM pg_catalog.pg_index index_row
  JOIN pg_catalog.pg_class index_relation
    ON index_relation.oid = index_row.indexrelid
  WHERE index_row.indrelid = 'public.catalog_change_sets'::regclass
    AND index_relation.relname IN (
      'idx_catalog_change_sets_pointer_before',
      'idx_catalog_change_sets_pointer_after',
      'idx_catalog_change_sets_affected_draft'
    )
    AND index_row.indisvalid;

  IF v_bad_rows <> 3 THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: pointer/draft-effect audit indexes are incomplete';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_rows
  FROM pg_catalog.pg_policies policy
  WHERE policy.schemaname = 'public'
    AND (
      (
        policy.tablename = 'price_list_versions'
        AND policy.policyname = 'catalog_versions_state_scoped_select'
      )
      OR (
        policy.tablename = 'price_list'
        AND policy.policyname = 'catalog_price_rows_state_scoped_select'
      )
      OR (
        policy.tablename = 'price_list_default_version'
        AND policy.policyname = 'catalog_default_pointer_active_select'
      )
      OR (
        policy.tablename = 'catalog_item_identities'
        AND policy.policyname = 'catalog_item_identities_select'
      )
      OR (
        policy.tablename = 'catalog_item_codes'
        AND policy.policyname = 'catalog_item_codes_select'
      )
      OR (
        policy.tablename = 'price_list_categories'
        AND policy.policyname = 'price_list_categories_select'
      )
      OR (
        policy.tablename = 'catalog_code_groups'
        AND policy.policyname = 'catalog_code_groups_select'
      )
    )
    AND policy.cmd = 'SELECT'
    AND policy.roles = ARRAY['authenticated'::name]
    AND policy.qual ILIKE '%status%active%';

  IF v_bad_rows <> 7 OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename IN (
        'price_list_versions',
        'price_list',
        'price_list_default_version'
      )
      AND policy.policyname IN (
        'Allow read to authenticated',
        'Allow select to authenticated',
        'Allow write to admin only'
      )
  ) THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: catalog RLS policies are incomplete or legacy DML remains';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies policy
    WHERE policy.schemaname = 'public'
      AND policy.tablename IN (
        'price_list_versions',
        'price_list',
        'price_list_default_version',
        'catalog_item_identities',
        'catalog_item_codes',
        'price_list_categories',
        'catalog_code_groups'
      )
      AND NOT (
        (policy.tablename = 'price_list_versions'
          AND policy.policyname = 'catalog_versions_state_scoped_select')
        OR (policy.tablename = 'price_list'
          AND policy.policyname = 'catalog_price_rows_state_scoped_select')
        OR (policy.tablename = 'price_list_default_version'
          AND policy.policyname = 'catalog_default_pointer_active_select')
        OR (policy.tablename = 'catalog_item_identities'
          AND policy.policyname = 'catalog_item_identities_select')
        OR (policy.tablename = 'catalog_item_codes'
          AND policy.policyname = 'catalog_item_codes_select')
        OR (policy.tablename = 'price_list_categories'
          AND policy.policyname = 'price_list_categories_select')
        OR (policy.tablename = 'catalog_code_groups'
          AND policy.policyname = 'catalog_code_groups_select')
      )
  ) THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: unexpected catalog RLS policies remain';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      VALUES
        ('public.price_list_versions'),
        ('public.price_list'),
        ('public.price_list_default_version'),
        ('public.catalog_item_identities'),
        ('public.catalog_item_codes'),
        ('public.price_list_categories'),
        ('public.catalog_code_groups'),
        ('public.catalog_imports'),
        ('public.catalog_change_sets'),
        ('public.catalog_change_items'),
        ('public.catalog_placement_reviews')
    ) AS catalog_table(table_name)
    WHERE has_table_privilege('authenticated', catalog_table.table_name, 'INSERT')
       OR has_table_privilege('authenticated', catalog_table.table_name, 'UPDATE')
       OR has_table_privilege('authenticated', catalog_table.table_name, 'DELETE')
  ) THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: authenticated catalog DML grants remain';
  END IF;

  SELECT count(*)::integer
  INTO v_bad_rows
  FROM pg_catalog.pg_trigger trigger_row
  WHERE trigger_row.tgrelid IN (
      'public.price_list_versions'::regclass,
      'public.catalog_change_sets'::regclass,
      'public.catalog_change_items'::regclass
    )
    AND trigger_row.tgname IN (
      'trigger_catalog_version_prepare_identity',
      'trigger_prevent_published_catalog_version_metadata_mutation',
      'trigger_set_updated_at',
      'trigger_prepare_catalog_pointer_audit',
      'trigger_prevent_catalog_change_set_mutation',
      'trigger_prevent_catalog_change_item_mutation'
    )
    AND trigger_row.tgenabled = 'O'
    AND NOT trigger_row.tgisinternal;

  IF v_bad_rows <> 6 THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: lifecycle or append-only triggers are incomplete';
  END IF;

  IF has_function_privilege(
       'authenticated',
       'private.prepare_catalog_version_identity()',
       'EXECUTE'
     )
     OR has_function_privilege(
       'authenticated',
       'private.create_catalog_draft_impl(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.create_catalog_draft_impl(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'private.create_catalog_draft_guarded_impl(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.create_catalog_draft_guarded_impl(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'private.catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'private.abandon_catalog_draft_impl(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.abandon_catalog_draft_impl(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'private.publish_catalog_version_impl(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.publish_catalog_version_impl(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'private.restore_catalog_pointer_impl(uuid,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.restore_catalog_pointer_impl(uuid,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'authenticated',
       'private.prepare_catalog_pointer_audit()',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'private.prevent_catalog_audit_mutation()',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'public.abandon_catalog_draft(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'public.publish_catalog_version(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'public.restore_catalog_pointer(uuid,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'anon',
       'public.get_catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'public.abandon_catalog_draft(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'public.publish_catalog_version(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'public.restore_catalog_pointer(uuid,text,uuid)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'service_role',
       'public.get_catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'P-39 postcondition failed: catalog RPC or private lifecycle functions are overexposed';
  END IF;

  IF NOT has_function_privilege(
       'authenticated',
       'private.create_catalog_draft_guarded_impl(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'private.catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'private.abandon_catalog_draft_impl(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'private.publish_catalog_version_impl(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'private.restore_catalog_pointer_impl(uuid,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'public.abandon_catalog_draft(uuid,integer,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'public.publish_catalog_version(uuid,integer,jsonb,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'public.restore_catalog_pointer(uuid,text,uuid)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'authenticated',
       'public.get_catalog_versions_page(integer,timestamp with time zone,uuid)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION
      'P-39 postcondition failed: authenticated wrappers cannot reach private implementations';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc function_row
    WHERE function_row.oid IN (
      'public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)'::regprocedure,
      'public.abandon_catalog_draft(uuid,integer,text,uuid)'::regprocedure,
      'public.publish_catalog_version(uuid,integer,jsonb,text,uuid)'::regprocedure,
      'public.restore_catalog_pointer(uuid,text,uuid)'::regprocedure,
      'public.get_catalog_versions_page(integer,timestamp with time zone,uuid)'::regprocedure
    )
      AND function_row.prosecdef
  ) THEN
    RAISE EXCEPTION
      'P-39R postcondition failed: public catalog wrappers must remain security invoker';
  END IF;

END;
$postconditions$;

COMMIT;
