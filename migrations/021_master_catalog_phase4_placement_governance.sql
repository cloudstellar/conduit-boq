-- =============================================================================
-- Migration 021: Master Catalog Phase 4 Placement Governance
-- =============================================================================
-- Scope: P-18 / WP-7.5 Local-only source candidate.
-- - Adds revisioned, append-only placement review for draft-only new identities.
-- - Preserves inherited relative order and audits every shifted row.
-- - Does not enable any feature flag, publish a catalog, touch BOQ/Factor F,
--   reset Local Supabase, or authorize Production execution.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

  -- ---------------------------------------------------------------------------
  -- 1. Additive placement schema and exact constraints
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.price_list_versions
    ADD COLUMN IF NOT EXISTS placement_revision integer NOT NULL DEFAULT 0;

  DO $phase4_p18_constraints$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'public.price_list_versions'::regclass
        AND conname = 'check_price_list_versions_placement_revision'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_placement_revision
        CHECK (placement_revision >= 0);
    END IF;
  END;
  $phase4_p18_constraints$;

  ALTER TABLE public.price_list
    DROP CONSTRAINT IF EXISTS uq_price_list_version_display_order;
  ALTER TABLE public.price_list
    ADD CONSTRAINT uq_price_list_version_display_order
    UNIQUE (version_id, display_order)
    DEFERRABLE INITIALLY IMMEDIATE;

  ALTER TABLE public.catalog_change_sets
    DROP CONSTRAINT IF EXISTS catalog_change_sets_change_type_check;
  ALTER TABLE public.catalog_change_sets
    ADD CONSTRAINT catalog_change_sets_change_type_check
    CHECK (change_type IN (
      'clone', 'import', 'manual', 'abandon', 'publish', 'restore', 'placement'
    ));

  ALTER TABLE public.catalog_change_items
    DROP CONSTRAINT IF EXISTS catalog_change_items_action_check;
  ALTER TABLE public.catalog_change_items
    DROP CONSTRAINT IF EXISTS check_catalog_change_items_snapshots;
  ALTER TABLE public.catalog_change_items
    ADD CONSTRAINT catalog_change_items_action_check
    CHECK (action IN (
      'add', 'update', 'retire', 'recode', 'reactivate', 'withdraw', 'place'
    ));
  ALTER TABLE public.catalog_change_items
    ADD CONSTRAINT check_catalog_change_items_snapshots CHECK (
      (action = 'add' AND old_values IS NULL AND new_values IS NOT NULL)
      OR
      (action = 'withdraw' AND old_values IS NOT NULL AND new_values IS NULL)
      OR
      (
        action = 'retire'
        AND old_values IS NOT NULL
        AND (
          new_values IS NULL
          OR new_values->>'isActive' = 'false'
        )
      )
      OR
      (
        action IN ('update', 'recode', 'reactivate', 'place')
        AND old_values IS NOT NULL
        AND new_values IS NOT NULL
      )
    );

  CREATE TABLE IF NOT EXISTS public.catalog_placement_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    placement_revision integer NOT NULL CHECK (placement_revision >= 0),
    change_set_id uuid NOT NULL UNIQUE
      REFERENCES public.catalog_change_sets(id) ON DELETE RESTRICT,
    new_identity_count integer NOT NULL CHECK (new_identity_count > 0),
    placement_payload jsonb NOT NULL CHECK (
      jsonb_typeof(placement_payload) = 'array'
      AND jsonb_array_length(placement_payload) > 0
      AND jsonb_array_length(placement_payload) <= 1000
      AND octet_length(placement_payload::text) <= 262144
    ),
    affected_row_count integer NOT NULL CHECK (affected_row_count > 0),
    affected_start_order integer NOT NULL CHECK (affected_start_order >= 0),
    affected_end_order integer NOT NULL CHECK (
      affected_end_order >= affected_start_order
    ),
    request_id uuid NOT NULL UNIQUE,
    actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    actor_display_name text NOT NULL CHECK (
      btrim(actor_display_name) <> '' AND length(actor_display_name) <= 200
    ),
    reason text NOT NULL CHECK (btrim(reason) <> '' AND length(reason) <= 500),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_catalog_placement_reviews_version_revision
      UNIQUE (version_id, placement_revision)
  );

  CREATE INDEX IF NOT EXISTS idx_catalog_placement_reviews_actor
    ON public.catalog_placement_reviews (actor_id);
  CREATE INDEX IF NOT EXISTS idx_catalog_placement_reviews_version_created
    ON public.catalog_placement_reviews (version_id, created_at DESC);

  -- ---------------------------------------------------------------------------
  -- 2. RLS, least privilege, and append-only review history
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.catalog_placement_reviews ENABLE ROW LEVEL SECURITY;

  REVOKE ALL ON TABLE public.catalog_placement_reviews
    FROM PUBLIC, anon, authenticated, service_role;
  GRANT SELECT ON TABLE public.catalog_placement_reviews
    TO authenticated, service_role;

  DROP POLICY IF EXISTS "catalog_placement_reviews_admin_select"
    ON public.catalog_placement_reviews;
  CREATE POLICY "catalog_placement_reviews_admin_select"
    ON public.catalog_placement_reviews
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.role = 'admin'
          AND profile.status = 'active'
      )
    );

  CREATE OR REPLACE FUNCTION private.prevent_catalog_placement_review_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    RAISE EXCEPTION
      'CATALOG_PLACEMENT_REVIEW_IMMUTABLE: accepted placement reviews are append-only';
  END;
  $function$;

  -- ---------------------------------------------------------------------------
  -- 3. Publish remains the final placement authority
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.publish_catalog_version_impl(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_approval_metadata jsonb,
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
    v_effective_date date;
    v_approval_reference text;
    v_approval_document_date date;
    v_physical_archive_reference text;
    v_normalized_approval_metadata jsonb;
    v_current_version_id uuid;
    v_draft public.price_list_versions%ROWTYPE;
    v_base public.price_list_versions%ROWTYPE;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_request_fingerprint text;
    v_change_set_id uuid;
    v_dataset jsonb;
    v_quality jsonb;
    v_readiness jsonb;
    v_new_identity_count integer;
    v_unapproved_legacy_active_count integer;
    v_before_lock integer;
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
    IF p_request_id IS NULL OR v_reason IS NULL OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false
      );
    END IF;

    IF p_expected_lock_version IS NULL OR p_expected_lock_version < 0 THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VALIDATION_FAILED', 'Expected lock version is required', false
      );
    END IF;

    IF p_approval_metadata IS NULL OR jsonb_typeof(p_approval_metadata) <> 'object' THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_METADATA_REQUIRED',
        'Publication approval metadata is required',
        false
      );
    END IF;

    v_effective_date := private.catalog_parse_iso_date(
      p_approval_metadata->>'effectiveDate'
    );
    v_approval_reference := NULLIF(
      btrim(p_approval_metadata->>'approvalReference'),
      ''
    );
    v_approval_document_date := private.catalog_parse_iso_date(
      p_approval_metadata->>'approvalDocumentDate'
    );
    v_physical_archive_reference := NULLIF(
      btrim(p_approval_metadata->>'physicalArchiveReference'),
      ''
    );

    IF v_effective_date IS NULL
       OR v_approval_reference IS NULL
       OR length(v_approval_reference) > 500
       OR v_approval_document_date IS NULL
       OR v_physical_archive_reference IS NULL
       OR length(v_physical_archive_reference) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_METADATA_REQUIRED',
        'Effective date, approval reference/date, and version archive reference are required',
        false
      );
    END IF;

    v_normalized_approval_metadata := jsonb_build_object(
      'effectiveDate', to_char(v_effective_date, 'YYYY-MM-DD'),
      'approvalReference', v_approval_reference,
      'approvalDocumentDate', to_char(v_approval_document_date, 'YYYY-MM-DD'),
      'physicalArchiveReference', v_physical_archive_reference
    );

    v_request_fingerprint := private.catalog_request_fingerprint(
      'publish',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'approvalMetadata', v_normalized_approval_metadata,
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
      IF v_existing_change.change_type = 'publish'
         AND v_existing_change.actor_id IS NOT DISTINCT FROM v_actor_id
         AND v_existing_change.request_fingerprint IS NOT DISTINCT FROM v_request_fingerprint THEN
        SELECT *
        INTO v_draft
        FROM public.price_list_versions
        WHERE id = v_existing_change.version_id;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'versionId', v_existing_change.version_id::text,
            'versionString', v_draft.version_string,
            'lockVersion', v_existing_change.after_lock_version,
            'changeSetId', v_existing_change.id::text,
            'itemCount', v_draft.item_count,
            'datasetHash', v_draft.dataset_hash,
            'publisherDisplayName', v_draft.published_by_display_name,
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
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VERSION_NOT_FOUND', 'Catalog version was not found', false
      );
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VERSION_NOT_PUBLISHABLE',
        'Only draft catalog versions can be published',
        false
      );
    END IF;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_BASE_STALE',
        'Draft base is no longer the current catalog default',
        false
      );
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(
        p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true
      );
    END IF;

    SELECT *
    INTO v_base
    FROM public.price_list_versions
    WHERE id = v_draft.based_on_version_id;

    IF NOT FOUND OR NOT private.catalog_version_transition_valid(
      v_base.major,
      v_base.minor,
      v_base.patch,
      v_draft.major,
      v_draft.minor,
      v_draft.patch
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VERSION_TRANSITION_INVALID',
        'Catalog version must be a later ADR-003 annual, revision, or patch transition from its base',
        false
      );
    END IF;

    v_readiness := private.catalog_publish_readiness(p_version_id);
    v_new_identity_count := COALESCE(
      (v_readiness->>'newIdentityCount')::integer,
      0
    );

    IF v_new_identity_count > 0
       AND COALESCE((v_readiness->>'placementReviewCurrent')::boolean, false) IS NOT TRUE THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'P18_PLACEMENT_REVIEW_REQUIRED',
        'New catalog identities require a current accepted placement review before publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'displayOrder',
          'code', 'P18_PLACEMENT_REVIEW_REQUIRED',
          'message', 'Keep the draft and confirm the current placement batch before publishing',
          'newIdentityCount', v_new_identity_count,
          'placementRevision', v_readiness->'placementRevision',
          'acceptedPlacementRevision', v_readiness->'acceptedPlacementRevision'
        ))
      );
    END IF;

    IF COALESCE((v_readiness->>'orderContiguous')::boolean, false) IS NOT TRUE
       OR COALESCE((v_readiness->>'inheritedOrderPreserved')::boolean, false) IS NOT TRUE
       OR (
         v_new_identity_count > 0
         AND COALESCE((v_readiness->>'expectedOrderMatches')::boolean, false) IS NOT TRUE
       ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_ORDER_INVALID',
        'Catalog order is not contiguous or does not match the accepted placement contract',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'displayOrder',
          'code', 'PLACEMENT_ORDER_INVALID',
          'message', 'Reload the draft and resolve placement order before publishing'
        ))
      );
    END IF;

    v_unapproved_legacy_active_count := COALESCE(
      (v_readiness->>'unapprovedLegacyActiveCount')::integer,
      0
    );

    IF v_unapproved_legacy_active_count <> 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
        'Active structured catalog rows may retain only the approved ITEM-0139 legacy exception',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'itemCode',
          'code', 'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
          'message', 'Resolve every other active ITEM-#### code before publish',
          'unapprovedLegacyActiveCount', v_unapproved_legacy_active_count
        ))
      );
    END IF;

    v_dataset := v_readiness->'dataset';
    v_quality := v_dataset->'quality';

    IF COALESCE((v_readiness->>'baseIsCurrent')::boolean, false) IS NOT TRUE
       OR COALESCE((v_readiness->>'qualityPassed')::boolean, false) IS NOT TRUE THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_VALIDATION_FAILED',
        'Catalog version is not complete enough to publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'catalogDataset',
          'code', 'PUBLICATION_VALIDATION_FAILED',
          'message', 'Current base, count, identity, category, code, money, and canonical group checks must pass',
          'baseIsCurrent', v_readiness->'baseIsCurrent',
          'quality', v_quality
        ))
      );
    END IF;

    v_before_lock := v_draft.lock_version;
    v_after_lock := v_before_lock + 1;

    UPDATE public.price_list_versions
    SET
      status = 'active',
      effective_date = v_effective_date,
      approval_reference = v_approval_reference,
      approval_document_date = v_approval_document_date,
      physical_archive_reference = v_physical_archive_reference,
      published_at = now(),
      published_by = v_actor_id,
      published_by_display_name = v_actor_display_name,
      dataset_hash = v_dataset->>'datasetHash',
      item_count = (v_dataset->>'itemCount')::integer,
      lock_version = v_after_lock,
      updated_at = now()
    WHERE id = p_version_id;

    UPDATE public.price_list_default_version
    SET version_id = p_version_id, updated_at = now()
    WHERE id = true;

    UPDATE public.price_list_versions
    SET is_default = false, updated_at = now()
    WHERE is_default = true
      AND id <> p_version_id;

    UPDATE public.price_list_versions
    SET is_default = true, updated_at = now()
    WHERE id = p_version_id;

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
    ) VALUES (
      p_version_id,
      'publish',
      v_reason,
      p_request_id,
      v_request_fingerprint,
      v_actor_id,
      v_actor_display_name,
      v_before_lock,
      v_after_lock
    )
    RETURNING id INTO v_change_set_id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', p_version_id::text,
        'versionString', v_draft.version_string,
        'previousVersionId', v_current_version_id::text,
        'lockVersion', v_after_lock,
        'changeSetId', v_change_set_id::text,
        'itemCount', (v_dataset->>'itemCount')::integer,
        'activeItemCount', (v_dataset->>'activeItemCount')::integer,
        'datasetHash', v_dataset->>'datasetHash',
        'canonicalJsonBytes', (v_dataset->>'canonicalJsonBytes')::integer,
        'publisherDisplayName', v_actor_display_name,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.prevent_published_catalog_version_metadata_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    IF OLD.status = 'abandoned' AND NEW IS DISTINCT FROM OLD THEN
      RAISE EXCEPTION
        'CATALOG_ABANDONED_VERSION_IMMUTABLE: abandoned catalog metadata cannot be changed';
    END IF;

    IF OLD.status IN ('active', 'archived') THEN
      IF NEW.major IS DISTINCT FROM OLD.major
         OR NEW.minor IS DISTINCT FROM OLD.minor
         OR NEW.patch IS DISTINCT FROM OLD.patch
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
         OR NEW.placement_revision IS DISTINCT FROM OLD.placement_revision THEN
        RAISE EXCEPTION
          'CATALOG_PUBLISHED_VERSION_IMMUTABLE: published catalog metadata cannot be changed';
      END IF;
    END IF;

    RETURN NEW;
  END;
  $function$;


  -- ---------------------------------------------------------------------------
  -- 4. Atomic, idempotent placement confirmation
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.place_catalog_items_impl(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_expected_placement_revision integer,
    p_placements jsonb,
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
    v_entry jsonb;
    v_entry_key_count integer;
    v_identity_text text;
    v_category_text text;
    v_anchor_text text;
    v_relation text;
    v_batch_order_text text;
    v_input_count integer;
    v_new_identity_count integer;
    v_current_version_id uuid;
    v_draft public.price_list_versions%ROWTYPE;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_existing_review public.catalog_placement_reviews%ROWTYPE;
    v_request_fingerprint text;
    v_normalized_placements jsonb;
    v_before_lock integer;
    v_after_lock integer;
    v_before_revision integer;
    v_after_revision integer;
    v_change_set_id uuid;
    v_review_id uuid;
    v_affected_row_count integer;
    v_affected_start_order integer;
    v_affected_end_order integer;
    v_target_count integer;
    v_before_state jsonb;
    v_abort_code text;
    v_abort_message text;
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
    IF p_request_id IS NULL OR v_reason IS NULL OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false
      );
    END IF;

    IF p_expected_lock_version IS NULL OR p_expected_lock_version < 0 THEN
      RETURN private.catalog_action_error(
        p_request_id, 'VALIDATION_FAILED', 'Expected lock version is required', false
      );
    END IF;

    IF p_expected_placement_revision IS NULL OR p_expected_placement_revision < 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VALIDATION_FAILED',
        'Expected placement revision is required',
        false
      );
    END IF;

    IF p_placements IS NULL
       OR jsonb_typeof(p_placements) <> 'array'
       OR jsonb_array_length(p_placements) < 1
       OR jsonb_array_length(p_placements) > 1000
       OR octet_length(p_placements::text) > 262144 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_SCOPE_INVALID',
        'Placement payload must contain between 1 and 1000 bounded rows',
        false
      );
    END IF;

    CREATE TEMP TABLE IF NOT EXISTS pg_temp.catalog_placement_input (
      identity_id uuid PRIMARY KEY,
      category_id uuid NOT NULL,
      anchor_identity_id uuid NOT NULL,
      relation text NOT NULL CHECK (relation IN ('before', 'after')),
      batch_order integer NOT NULL UNIQUE CHECK (batch_order >= 0)
    ) ON COMMIT DROP;
    TRUNCATE pg_temp.catalog_placement_input;

    FOR v_entry IN SELECT value FROM jsonb_array_elements(p_placements)
    LOOP
      IF jsonb_typeof(v_entry) <> 'object' THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'PLACEMENT_SCOPE_INVALID',
          'Every placement row must be a JSON object',
          false
        );
      END IF;

      SELECT count(*)::integer
      INTO v_entry_key_count
      FROM jsonb_object_keys(v_entry) AS key_row(key_name)
      WHERE key_name IN (
        'identityId', 'categoryId', 'anchorIdentityId', 'relation', 'batchOrder'
      );

      IF v_entry_key_count <> 5
         OR (
           SELECT count(*)
           FROM jsonb_object_keys(v_entry) AS key_row(key_name)
         ) <> 5 THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'PLACEMENT_SCOPE_INVALID',
          'Placement rows must contain only the five approved fields',
          false
        );
      END IF;

      v_identity_text := v_entry->>'identityId';
      v_category_text := v_entry->>'categoryId';
      v_anchor_text := v_entry->>'anchorIdentityId';
      v_relation := v_entry->>'relation';
      v_batch_order_text := v_entry->>'batchOrder';

      IF v_identity_text IS NULL
         OR v_category_text IS NULL
         OR v_anchor_text IS NULL
         OR v_relation IS NULL
         OR v_batch_order_text IS NULL
         OR v_identity_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
         OR v_category_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
         OR v_anchor_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
         OR v_relation NOT IN ('before', 'after')
         OR jsonb_typeof(v_entry->'batchOrder') <> 'number'
         OR v_batch_order_text !~ '^(0|[1-9][0-9]*)$' THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'PLACEMENT_SCOPE_INVALID',
          'Placement identity, category, anchor, relation, or batch order is invalid',
          false
        );
      END IF;

      IF length(v_batch_order_text) > 10
         OR (v_batch_order_text::numeric) > 2147483647 THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'PLACEMENT_SCOPE_INVALID',
          'Placement batch order is out of range',
          false
        );
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_temp.catalog_placement_input input
        WHERE input.identity_id = v_identity_text::uuid
           OR input.batch_order = v_batch_order_text::integer
      ) THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'PLACEMENT_SCOPE_INVALID',
          'Placement identities and batch orders must be unique',
          false
        );
      END IF;

      INSERT INTO pg_temp.catalog_placement_input (
        identity_id,
        category_id,
        anchor_identity_id,
        relation,
        batch_order
      ) VALUES (
        v_identity_text::uuid,
        v_category_text::uuid,
        v_anchor_text::uuid,
        v_relation,
        v_batch_order_text::integer
      );
    END LOOP;

    SELECT count(*)::integer
    INTO v_input_count
    FROM pg_temp.catalog_placement_input;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_temp.catalog_placement_input
      HAVING min(batch_order) = 0
         AND max(batch_order) = count(*) - 1
         AND count(DISTINCT batch_order) = count(*)
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_ORDER_INVALID',
        'Placement batch order must be contiguous from zero',
        false
      );
    END IF;

    SELECT jsonb_agg(
      jsonb_build_object(
        'identityId', input.identity_id::text,
        'categoryId', input.category_id::text,
        'anchorIdentityId', input.anchor_identity_id::text,
        'relation', input.relation,
        'batchOrder', input.batch_order
      )
      ORDER BY input.batch_order
    )
    INTO v_normalized_placements
    FROM pg_temp.catalog_placement_input input;

    v_request_fingerprint := private.catalog_request_fingerprint(
      'placement',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'expectedPlacementRevision', p_expected_placement_revision,
        'placements', v_normalized_placements,
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
      IF v_existing_change.change_type = 'placement'
         AND v_existing_change.actor_id IS NOT DISTINCT FROM v_actor_id
         AND v_existing_change.request_fingerprint IS NOT DISTINCT FROM v_request_fingerprint THEN
        SELECT *
        INTO v_existing_review
        FROM public.catalog_placement_reviews review
        WHERE review.change_set_id = v_existing_change.id;

        IF NOT FOUND THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'INTERNAL_ERROR',
            'Prior placement request is missing its accepted review',
            false
          );
        END IF;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'versionId', v_existing_change.version_id::text,
            'changeSetId', v_existing_change.id::text,
            'placementReviewId', v_existing_review.id::text,
            'lockVersion', v_existing_change.after_lock_version,
            'placementRevision', v_existing_review.placement_revision,
            'newIdentityCount', v_existing_review.new_identity_count,
            'affectedRows', v_existing_review.affected_row_count,
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

    IF NOT private.catalog_capability_enabled('catalog_new_identity_enabled') THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'CATALOG_NEW_IDENTITY_DISABLED',
        'New-identity placement is disabled for this release gate',
        false
      );
    END IF;

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true;

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
        p_request_id, 'DRAFT_NOT_EDITABLE', 'Only draft catalog versions can be placed', false
      );
    END IF;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_BASE_STALE',
        'Draft base is no longer the current catalog default',
        false
      );
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(
        p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true
      );
    END IF;

    IF v_draft.placement_revision <> p_expected_placement_revision THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_REVISION_CONFLICT',
        'Draft placement revision is stale',
        true
      );
    END IF;

    PERFORM 1
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id
    ORDER BY candidate.identity_id
    FOR UPDATE;

    v_before_state := private.catalog_placement_state(p_version_id);
    IF COALESCE((v_before_state->>'orderContiguous')::boolean, false) IS NOT TRUE
       OR COALESCE((v_before_state->>'inheritedOrderPreserved')::boolean, false) IS NOT TRUE THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_ORDER_INVALID',
        'Draft order is not contiguous or inherited order has changed',
        false
      );
    END IF;

    v_new_identity_count := COALESCE(
      (v_before_state->>'newIdentityCount')::integer,
      0
    );
    IF v_new_identity_count = 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_NOT_REQUIRED',
        'Draft has no new identities requiring placement',
        false
      );
    END IF;

    IF v_input_count <> v_new_identity_count
       OR EXISTS (
         SELECT 1
         FROM pg_temp.catalog_placement_input input
         FULL JOIN (
           SELECT candidate.identity_id
           FROM public.price_list candidate
           WHERE candidate.version_id = p_version_id
             AND NOT EXISTS (
               SELECT 1
               FROM public.price_list base
               WHERE base.version_id = v_draft.based_on_version_id
                 AND base.identity_id = candidate.identity_id
             )
         ) pending USING (identity_id)
         WHERE input.identity_id IS NULL OR pending.identity_id IS NULL
       ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_SCOPE_INVALID',
        'Placement batch must cover every pending new identity exactly once',
        false
      );
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_temp.catalog_placement_input input
      LEFT JOIN public.price_list_categories category
        ON category.version_id = p_version_id
       AND category.id = input.category_id
      LEFT JOIN public.price_list anchor_candidate
        ON anchor_candidate.version_id = p_version_id
       AND anchor_candidate.identity_id = input.anchor_identity_id
      LEFT JOIN public.price_list anchor_base
        ON anchor_base.version_id = v_draft.based_on_version_id
       AND anchor_base.identity_id = input.anchor_identity_id
      WHERE category.id IS NULL
         OR anchor_candidate.identity_id IS NULL
         OR anchor_base.identity_id IS NULL
         OR anchor_candidate.category_id IS DISTINCT FROM input.category_id
         OR input.identity_id = input.anchor_identity_id
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_ANCHOR_INVALID',
        'Every placement requires an inherited anchor in the selected draft category',
        false
      );
    END IF;

    CREATE TEMP TABLE IF NOT EXISTS pg_temp.catalog_placement_target (
      identity_id uuid PRIMARY KEY,
      old_category_id uuid NOT NULL,
      old_display_order integer NOT NULL,
      old_snapshot jsonb NOT NULL,
      target_category_id uuid NOT NULL,
      target_category_code text NOT NULL,
      target_display_order integer NOT NULL UNIQUE,
      is_new_identity boolean NOT NULL
    ) ON COMMIT DROP;
    TRUNCATE pg_temp.catalog_placement_target;

    INSERT INTO pg_temp.catalog_placement_target (
      identity_id,
      old_category_id,
      old_display_order,
      old_snapshot,
      target_category_id,
      target_category_code,
      target_display_order,
      is_new_identity
    )
    WITH sequence_rows AS (
      SELECT
        base.identity_id,
        base.display_order AS anchor_order,
        1 AS relation_order,
        0 AS batch_order,
        NULL::uuid AS target_category_id,
        false AS is_new_identity
      FROM public.price_list base
      WHERE base.version_id = v_draft.based_on_version_id
      UNION ALL
      SELECT
        input.identity_id,
        anchor_base.display_order AS anchor_order,
        CASE input.relation WHEN 'before' THEN 0 ELSE 2 END AS relation_order,
        input.batch_order,
        input.category_id,
        true AS is_new_identity
      FROM pg_temp.catalog_placement_input input
      JOIN public.price_list anchor_base
        ON anchor_base.version_id = v_draft.based_on_version_id
       AND anchor_base.identity_id = input.anchor_identity_id
    ),
    ranked AS (
      SELECT
        sequence_rows.*,
        row_number() OVER (
          ORDER BY
            anchor_order,
            relation_order,
            batch_order,
            identity_id
        )::integer - 1 AS target_display_order
      FROM sequence_rows
    )
    SELECT
      candidate.identity_id,
      candidate.category_id,
      candidate.display_order,
      private.catalog_price_row_snapshot(candidate),
      COALESCE(ranked.target_category_id, candidate.category_id),
      category.code,
      ranked.target_display_order,
      ranked.is_new_identity
    FROM ranked
    JOIN public.price_list candidate
      ON candidate.version_id = p_version_id
     AND candidate.identity_id = ranked.identity_id
    JOIN public.price_list_categories category
      ON category.version_id = p_version_id
     AND category.id = COALESCE(ranked.target_category_id, candidate.category_id);

    SELECT count(*)::integer
    INTO v_target_count
    FROM pg_temp.catalog_placement_target;

    IF v_target_count <> (
      SELECT count(*)::integer
      FROM public.price_list
      WHERE version_id = p_version_id
    ) OR NOT EXISTS (
      SELECT 1
      FROM pg_temp.catalog_placement_target
      HAVING min(target_display_order) = 0
         AND max(target_display_order) = count(*) - 1
         AND count(DISTINCT target_display_order) = count(*)
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PLACEMENT_ORDER_INVALID',
        'Placement target does not produce one complete contiguous catalog order',
        false
      );
    END IF;

    v_before_lock := v_draft.lock_version;
    v_after_lock := v_before_lock + 1;
    v_before_revision := v_draft.placement_revision;
    v_after_revision := v_before_revision + 1;

    BEGIN
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
      ) VALUES (
        p_version_id,
        'placement',
        v_reason,
        p_request_id,
        v_request_fingerprint,
        v_actor_id,
        v_actor_display_name,
        v_before_lock,
        v_after_lock
      )
      RETURNING id INTO v_change_set_id;

      PERFORM set_config('catalog.placement_write', 'on', true);
      SET CONSTRAINTS public.uq_price_list_version_display_order DEFERRED;

      UPDATE public.price_list candidate
      SET
        category_id = target.target_category_id,
        category = target.target_category_code,
        display_order = target.target_display_order,
        updated_at = now()
      FROM pg_temp.catalog_placement_target target
      WHERE candidate.version_id = p_version_id
        AND candidate.identity_id = target.identity_id
        AND (
          candidate.category_id IS DISTINCT FROM target.target_category_id
          OR candidate.category IS DISTINCT FROM target.target_category_code
          OR candidate.display_order IS DISTINCT FROM target.target_display_order
        );

      INSERT INTO public.catalog_change_items (
        change_set_id,
        identity_id,
        action,
        old_values,
        new_values
      )
      SELECT
        v_change_set_id,
        target.identity_id,
        'place',
        target.old_snapshot,
        private.catalog_price_row_snapshot(candidate)
      FROM pg_temp.catalog_placement_target target
      JOIN public.price_list candidate
        ON candidate.version_id = p_version_id
       AND candidate.identity_id = target.identity_id
      WHERE target.is_new_identity
         OR target.old_category_id IS DISTINCT FROM target.target_category_id
         OR target.old_display_order IS DISTINCT FROM target.target_display_order
      ORDER BY target.target_display_order;

      GET DIAGNOSTICS v_affected_row_count = ROW_COUNT;

      SELECT
        min(target.target_display_order),
        max(target.target_display_order)
      INTO v_affected_start_order, v_affected_end_order
      FROM pg_temp.catalog_placement_target target
      WHERE target.is_new_identity
         OR target.old_category_id IS DISTINCT FROM target.target_category_id
         OR target.old_display_order IS DISTINCT FROM target.target_display_order;

      IF v_affected_row_count < v_new_identity_count
         OR v_affected_start_order IS NULL
         OR v_affected_end_order IS NULL THEN
        v_abort_code := 'PLACEMENT_ORDER_INVALID';
        v_abort_message := 'Placement audit did not cover every new or shifted row';
        RAISE EXCEPTION 'CATALOG_PLACEMENT_ABORT';
      END IF;

      UPDATE public.price_list_versions
      SET
        lock_version = v_after_lock,
        placement_revision = v_after_revision,
        item_count = v_target_count,
        updated_at = now()
      WHERE id = p_version_id;

      INSERT INTO public.catalog_placement_reviews (
        version_id,
        placement_revision,
        change_set_id,
        new_identity_count,
        placement_payload,
        affected_row_count,
        affected_start_order,
        affected_end_order,
        request_id,
        actor_id,
        actor_display_name,
        reason
      ) VALUES (
        p_version_id,
        v_after_revision,
        v_change_set_id,
        v_new_identity_count,
        v_normalized_placements,
        v_affected_row_count,
        v_affected_start_order,
        v_affected_end_order,
        p_request_id,
        v_actor_id,
        v_actor_display_name,
        v_reason
      )
      RETURNING id INTO v_review_id;

      IF NOT EXISTS (
        SELECT 1
        FROM public.catalog_placement_reviews review
        WHERE review.id = v_review_id
          AND review.version_id = p_version_id
          AND review.placement_revision = v_after_revision
          AND review.new_identity_count = v_new_identity_count
      ) OR EXISTS (
        SELECT 1
        FROM pg_temp.catalog_placement_target target
        LEFT JOIN public.price_list candidate
          ON candidate.version_id = p_version_id
         AND candidate.identity_id = target.identity_id
        WHERE candidate.identity_id IS NULL
           OR candidate.category_id IS DISTINCT FROM target.target_category_id
           OR candidate.display_order IS DISTINCT FROM target.target_display_order
      ) OR NOT EXISTS (
        SELECT 1
        FROM public.price_list candidate
        WHERE candidate.version_id = p_version_id
        HAVING count(*) = v_target_count
           AND min(candidate.display_order) = 0
           AND max(candidate.display_order) = count(*) - 1
           AND count(DISTINCT candidate.display_order) = count(*)
      ) OR (
        SELECT COALESCE(array_agg(base.identity_id ORDER BY base.display_order), ARRAY[]::uuid[])
        FROM public.price_list base
        WHERE base.version_id = v_draft.based_on_version_id
      ) IS DISTINCT FROM (
        SELECT COALESCE(array_agg(candidate.identity_id ORDER BY candidate.display_order), ARRAY[]::uuid[])
        FROM public.price_list candidate
        WHERE candidate.version_id = p_version_id
          AND EXISTS (
            SELECT 1
            FROM public.price_list base
            WHERE base.version_id = v_draft.based_on_version_id
              AND base.identity_id = candidate.identity_id
          )
      ) THEN
        v_abort_code := 'PLACEMENT_ORDER_INVALID';
        v_abort_message := 'Accepted placement failed its final database invariants';
        RAISE EXCEPTION 'CATALOG_PLACEMENT_ABORT';
      END IF;

      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'versionId', p_version_id::text,
          'changeSetId', v_change_set_id::text,
          'placementReviewId', v_review_id::text,
          'lockVersion', v_after_lock,
          'placementRevision', v_after_revision,
          'newIdentityCount', v_new_identity_count,
          'affectedRows', v_affected_row_count,
          'duplicateRequest', false
        )
      );
    EXCEPTION
      WHEN raise_exception THEN
        IF SQLERRM = 'CATALOG_PLACEMENT_ABORT' THEN
          RETURN private.catalog_action_error(
            p_request_id,
            v_abort_code,
            v_abort_message,
            false
          );
        END IF;
        RAISE;
    END;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.place_catalog_items(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_expected_placement_revision integer,
    p_placements jsonb,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.place_catalog_items_impl(
      p_version_id,
      p_expected_lock_version,
      p_expected_placement_revision,
      p_placements,
      p_reason,
      p_request_id
    );
  $function$;


  DROP TRIGGER IF EXISTS trigger_prevent_catalog_placement_review_mutation
    ON public.catalog_placement_reviews;
  CREATE TRIGGER trigger_prevent_catalog_placement_review_mutation
    BEFORE UPDATE OR DELETE ON public.catalog_placement_reviews
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_catalog_placement_review_mutation();

  -- ---------------------------------------------------------------------------
  -- 5. Placement revision invalidation
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.touch_catalog_placement_revision()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version_id uuid;
    v_base_version_id uuid;
    v_status text;
    v_identity_id uuid;
    v_relevant boolean := false;
    v_invalidated_versions text;
  BEGIN
    IF current_setting('catalog.placement_write', true) = 'on' THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      RETURN NEW;
    END IF;

    v_version_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.version_id ELSE NEW.version_id END;
    v_identity_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.identity_id ELSE NEW.identity_id END;

    SELECT version.based_on_version_id, version.status
    INTO v_base_version_id, v_status
    FROM public.price_list_versions version
    WHERE version.id = v_version_id;

    IF v_status IS DISTINCT FROM 'draft' OR v_base_version_id IS NULL THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      RETURN NEW;
    END IF;

    IF TG_OP IN ('INSERT', 'DELETE') THEN
      v_relevant := NOT EXISTS (
        SELECT 1
        FROM public.price_list base
        WHERE base.version_id = v_base_version_id
          AND base.identity_id = v_identity_id
      ) OR EXISTS (
        SELECT 1
        FROM public.price_list candidate
        WHERE candidate.version_id = v_version_id
          AND NOT EXISTS (
            SELECT 1
            FROM public.price_list base
            WHERE base.version_id = v_base_version_id
              AND base.identity_id = candidate.identity_id
          )
      );
    ELSE
      v_relevant := (
        OLD.category_id IS DISTINCT FROM NEW.category_id
        OR OLD.display_order IS DISTINCT FROM NEW.display_order
        OR OLD.is_active IS DISTINCT FROM NEW.is_active
      ) AND EXISTS (
        SELECT 1
        FROM public.price_list candidate
        WHERE candidate.version_id = v_version_id
          AND NOT EXISTS (
            SELECT 1
            FROM public.price_list base
            WHERE base.version_id = v_base_version_id
              AND base.identity_id = candidate.identity_id
          )
      );
    END IF;

    IF v_relevant THEN
      v_invalidated_versions := COALESCE(
        current_setting('catalog.placement_invalidated_versions', true),
        ''
      );

      IF position('|' || v_version_id::text || '|' IN v_invalidated_versions) = 0 THEN
        -- Bulk import may touch many rows. Advance once per version/transaction
        -- while retaining fail-closed invalidation for every reviewed write path.
        UPDATE public.price_list_versions
        SET
          placement_revision = placement_revision + 1,
          updated_at = now()
        WHERE id = v_version_id
          AND status = 'draft';

        PERFORM set_config(
          'catalog.placement_invalidated_versions',
          v_invalidated_versions || '|' || v_version_id::text || '|',
          true
        );
      END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END;
  $function$;

  DROP TRIGGER IF EXISTS trigger_touch_catalog_placement_revision
    ON public.price_list;
  CREATE TRIGGER trigger_touch_catalog_placement_revision
    AFTER INSERT OR UPDATE OR DELETE ON public.price_list
    FOR EACH ROW
    EXECUTE FUNCTION private.touch_catalog_placement_revision();

  -- ---------------------------------------------------------------------------
  -- 6. Shared placement state used by readiness and publish
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.catalog_placement_state(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version public.price_list_versions%ROWTYPE;
    v_review public.catalog_placement_reviews%ROWTYPE;
    v_row_count integer := 0;
    v_new_identity_count integer := 0;
    v_order_contiguous boolean := false;
    v_inherited_order_preserved boolean := false;
    v_payload_valid boolean := false;
    v_exact_coverage boolean := false;
    v_anchor_contract_valid boolean := false;
    v_expected_order_matches boolean := false;
    v_base_order uuid[] := ARRAY[]::uuid[];
    v_candidate_inherited_order uuid[] := ARRAY[]::uuid[];
    v_candidate_order uuid[] := ARRAY[]::uuid[];
    v_expected_order uuid[] := ARRAY[]::uuid[];
    v_review_current boolean := false;
  BEGIN
    SELECT *
    INTO v_version
    FROM public.price_list_versions version
    WHERE version.id = p_version_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'placementGovernanceAvailable', true,
        'placementRevision', 0,
        'acceptedPlacementRevision', null,
        'placementReviewId', null,
        'placementChangeSetId', null,
        'placementReviewRequired', false,
        'placementReviewCurrent', false,
        'newIdentityCount', 0,
        'orderContiguous', false,
        'inheritedOrderPreserved', false,
        'expectedOrderMatches', false
      );
    END IF;

    SELECT
      count(*)::integer,
      count(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.price_list base
          WHERE base.version_id = v_version.based_on_version_id
            AND base.identity_id = candidate.identity_id
        )
      )::integer,
      (
        count(*) > 0
        AND min(candidate.display_order) = 0
        AND max(candidate.display_order) = count(*) - 1
        AND count(DISTINCT candidate.display_order) = count(*)
      )
    INTO v_row_count, v_new_identity_count, v_order_contiguous
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id;

    SELECT COALESCE(array_agg(base.identity_id ORDER BY base.display_order), ARRAY[]::uuid[])
    INTO v_base_order
    FROM public.price_list base
    WHERE base.version_id = v_version.based_on_version_id;

    SELECT COALESCE(array_agg(candidate.identity_id ORDER BY candidate.display_order), ARRAY[]::uuid[])
    INTO v_candidate_inherited_order
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id
      AND EXISTS (
        SELECT 1
        FROM public.price_list base
        WHERE base.version_id = v_version.based_on_version_id
          AND base.identity_id = candidate.identity_id
      );

    SELECT COALESCE(array_agg(candidate.identity_id ORDER BY candidate.display_order), ARRAY[]::uuid[])
    INTO v_candidate_order
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id;

    v_inherited_order_preserved := v_base_order = v_candidate_inherited_order;

    SELECT review.*
    INTO v_review
    FROM public.catalog_placement_reviews review
    WHERE review.version_id = p_version_id
      AND review.placement_revision = v_version.placement_revision
    LIMIT 1;

    IF FOUND THEN
      WITH payload_raw AS (
        SELECT entry.value
        FROM jsonb_array_elements(v_review.placement_payload) AS entry(value)
      ),
      payload AS (
        SELECT
          CASE
            WHEN value->>'identityId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
              THEN (value->>'identityId')::uuid
          END AS identity_id,
          CASE
            WHEN value->>'categoryId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
              THEN (value->>'categoryId')::uuid
          END AS category_id,
          CASE
            WHEN value->>'anchorIdentityId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
              THEN (value->>'anchorIdentityId')::uuid
          END AS anchor_identity_id,
          value->>'relation' AS relation,
          CASE
            WHEN jsonb_typeof(value->'batchOrder') <> 'number' THEN NULL
            WHEN value->>'batchOrder' !~ '^(0|[1-9][0-9]*)$' THEN NULL
            WHEN length(value->>'batchOrder') > 10 THEN NULL
            WHEN (value->>'batchOrder')::numeric > 2147483647 THEN NULL
            ELSE (value->>'batchOrder')::integer
          END AS batch_order
        FROM payload_raw
      ),
      pending AS (
        SELECT candidate.identity_id, candidate.category_id
        FROM public.price_list candidate
        WHERE candidate.version_id = p_version_id
          AND NOT EXISTS (
            SELECT 1
            FROM public.price_list base
            WHERE base.version_id = v_version.based_on_version_id
              AND base.identity_id = candidate.identity_id
          )
      ),
      payload_stats AS (
        SELECT
          count(*)::integer AS row_count,
          count(DISTINCT identity_id)::integer AS identity_count,
          count(DISTINCT batch_order)::integer AS batch_order_count,
          min(batch_order) AS min_batch_order,
          max(batch_order) AS max_batch_order,
          bool_and(
            identity_id IS NOT NULL
            AND category_id IS NOT NULL
            AND anchor_identity_id IS NOT NULL
            AND relation IN ('before', 'after')
            AND batch_order IS NOT NULL
          ) AS fields_valid
        FROM payload
      ),
      sequence_rows AS (
        SELECT
          base.identity_id,
          base.display_order AS anchor_order,
          1 AS relation_order,
          0 AS batch_order
        FROM public.price_list base
        WHERE base.version_id = v_version.based_on_version_id
        UNION ALL
        SELECT
          payload.identity_id,
          anchor_base.display_order AS anchor_order,
          CASE payload.relation WHEN 'before' THEN 0 ELSE 2 END AS relation_order,
          payload.batch_order
        FROM payload
        JOIN public.price_list anchor_base
          ON anchor_base.version_id = v_version.based_on_version_id
         AND anchor_base.identity_id = payload.anchor_identity_id
      )
      SELECT
        stats.fields_valid
          AND stats.row_count = v_new_identity_count
          AND stats.identity_count = stats.row_count
          AND stats.batch_order_count = stats.row_count
          AND stats.min_batch_order = 0
          AND stats.max_batch_order = stats.row_count - 1,
        NOT EXISTS (
          SELECT 1 FROM payload
          FULL JOIN pending USING (identity_id)
          WHERE payload.identity_id IS NULL OR pending.identity_id IS NULL
        ),
        NOT EXISTS (
          SELECT 1
          FROM payload
          LEFT JOIN pending new_item ON new_item.identity_id = payload.identity_id
          LEFT JOIN public.price_list anchor_candidate
            ON anchor_candidate.version_id = p_version_id
           AND anchor_candidate.identity_id = payload.anchor_identity_id
          LEFT JOIN public.price_list anchor_base
            ON anchor_base.version_id = v_version.based_on_version_id
           AND anchor_base.identity_id = payload.anchor_identity_id
          WHERE new_item.identity_id IS NULL
             OR new_item.category_id IS DISTINCT FROM payload.category_id
             OR anchor_candidate.identity_id IS NULL
             OR anchor_base.identity_id IS NULL
             OR anchor_candidate.category_id IS DISTINCT FROM payload.category_id
        ),
        COALESCE(
          array_agg(
            sequence_rows.identity_id
            ORDER BY
              sequence_rows.anchor_order,
              sequence_rows.relation_order,
              sequence_rows.batch_order,
              sequence_rows.identity_id
          ),
          ARRAY[]::uuid[]
        )
      INTO
        v_payload_valid,
        v_exact_coverage,
        v_anchor_contract_valid,
        v_expected_order
      FROM payload_stats stats
      LEFT JOIN sequence_rows ON true
      GROUP BY
        stats.fields_valid,
        stats.row_count,
        stats.identity_count,
        stats.batch_order_count,
        stats.min_batch_order,
        stats.max_batch_order;

      v_expected_order_matches := v_expected_order = v_candidate_order;
      v_review_current :=
        v_review.new_identity_count = v_new_identity_count
        AND v_payload_valid
        AND v_exact_coverage
        AND v_anchor_contract_valid
        AND v_order_contiguous
        AND v_inherited_order_preserved
        AND v_expected_order_matches;
    END IF;

    RETURN jsonb_build_object(
      'placementGovernanceAvailable', true,
      'placementRevision', v_version.placement_revision,
      'acceptedPlacementRevision', CASE
        WHEN v_review.id IS NULL THEN null
        ELSE v_review.placement_revision
      END,
      'placementReviewId', CASE WHEN v_review.id IS NULL THEN null ELSE v_review.id END,
      'placementChangeSetId', CASE
        WHEN v_review.id IS NULL THEN null
        ELSE v_review.change_set_id
      END,
      'placementReviewRequired', v_new_identity_count > 0,
      'placementReviewCurrent', CASE
        WHEN v_new_identity_count = 0 THEN true
        ELSE v_review_current
      END,
      'newIdentityCount', v_new_identity_count,
      'orderContiguous', v_order_contiguous,
      'inheritedOrderPreserved', v_inherited_order_preserved,
      'expectedOrderMatches', CASE
        WHEN v_new_identity_count = 0 THEN v_inherited_order_preserved
        ELSE v_expected_order_matches
      END
    );
  END;
  $function$;

  -- ---------------------------------------------------------------------------
  -- 7. Publish readiness now recognizes a current accepted placement review
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.catalog_publish_readiness(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_new_identity_count integer;
    v_active_canonical_code_count integer;
    v_unapproved_legacy_active_count integer;
    v_inactive_row_count integer;
    v_dataset jsonb;
    v_quality jsonb;
    v_quality_passed boolean;
    v_base_is_current boolean;
    v_placement jsonb;
  BEGIN
    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true;

    SELECT *
    INTO v_version
    FROM public.price_list_versions
    WHERE id = p_version_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'versionFound', false,
        'versionStatus', null,
        'basedOnVersionId', null,
        'currentVersionId', v_current_version_id,
        'baseIsCurrent', false,
        'newIdentityCount', 0,
        'activeCanonicalCodeCount', 0,
        'structuredCodeGuardApplies', false,
        'unapprovedLegacyActiveCount', 0,
        'inactiveRowCount', 0,
        'retiredPdfPolicyRequired', false,
        'placementGovernanceAvailable', true,
        'placementRevision', 0,
        'acceptedPlacementRevision', null,
        'placementReviewId', null,
        'placementChangeSetId', null,
        'placementReviewRequired', false,
        'placementReviewCurrent', false,
        'orderContiguous', false,
        'inheritedOrderPreserved', false,
        'expectedOrderMatches', false,
        'qualityPassed', false,
        'dataset', null,
        'canPublish', false
      );
    END IF;

    v_placement := private.catalog_placement_state(p_version_id);
    v_new_identity_count := COALESCE((v_placement->>'newIdentityCount')::integer, 0);

    SELECT
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^ITEM-[0-9]{4}$'
          AND candidate.item_code <> 'ITEM-0139'
      )::integer,
      count(*) FILTER (WHERE candidate.is_active = false)::integer
    INTO
      v_active_canonical_code_count,
      v_unapproved_legacy_active_count,
      v_inactive_row_count
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id;

    v_dataset := private.catalog_compute_version_dataset(p_version_id);
    v_quality := v_dataset->'quality';
    v_quality_passed :=
      COALESCE((v_dataset->>'itemCount')::integer, 0) > 0
      AND COALESCE((v_dataset->>'activeItemCount')::integer, 0) > 0
      AND COALESCE((v_quality->>'rowCount')::integer, 0)
        = COALESCE((v_quality->>'distinctItemCodes')::integer, -1)
      AND COALESCE((v_quality->>'missingIdentityId')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingCategoryId')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingDisplayOrder')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingRequiredText')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingMoney')::integer, -1) = 0
      AND COALESCE((v_quality->>'costMismatches')::integer, -1) = 0
      AND COALESCE((v_quality->>'invalidItemCodes')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingCanonicalCodeGroup')::integer, -1) = 0
      AND COALESCE((v_quality->>'canonicalCodeGroupMismatch')::integer, -1) = 0;
    v_base_is_current :=
      v_version.based_on_version_id IS NOT NULL
      AND v_version.based_on_version_id IS NOT DISTINCT FROM v_current_version_id;

    RETURN jsonb_build_object(
      'versionFound', true,
      'versionStatus', v_version.status,
      'basedOnVersionId', v_version.based_on_version_id,
      'currentVersionId', v_current_version_id,
      'baseIsCurrent', v_base_is_current,
      'newIdentityCount', v_new_identity_count,
      'activeCanonicalCodeCount', COALESCE(v_active_canonical_code_count, 0),
      'structuredCodeGuardApplies', COALESCE(v_active_canonical_code_count, 0) > 0,
      'unapprovedLegacyActiveCount', CASE
        WHEN COALESCE(v_active_canonical_code_count, 0) > 0
          THEN COALESCE(v_unapproved_legacy_active_count, 0)
        ELSE 0
      END,
      'inactiveRowCount', COALESCE(v_inactive_row_count, 0),
      'retiredPdfPolicyRequired', COALESCE(v_inactive_row_count, 0) > 0,
      'placementGovernanceAvailable', true,
      'placementRevision', v_placement->'placementRevision',
      'acceptedPlacementRevision', v_placement->'acceptedPlacementRevision',
      'placementReviewId', v_placement->'placementReviewId',
      'placementChangeSetId', v_placement->'placementChangeSetId',
      'placementReviewRequired', v_placement->'placementReviewRequired',
      'placementReviewCurrent', v_placement->'placementReviewCurrent',
      'orderContiguous', v_placement->'orderContiguous',
      'inheritedOrderPreserved', v_placement->'inheritedOrderPreserved',
      'expectedOrderMatches', v_placement->'expectedOrderMatches',
      'qualityPassed', v_quality_passed,
      'dataset', v_dataset,
      'canPublish',
        v_version.status = 'draft'
        AND v_base_is_current
        AND COALESCE((v_placement->>'placementReviewCurrent')::boolean, false)
        AND COALESCE((v_placement->>'orderContiguous')::boolean, false)
        AND COALESCE((v_placement->>'inheritedOrderPreserved')::boolean, false)
        AND (
          COALESCE(v_active_canonical_code_count, 0) = 0
          OR COALESCE(v_unapproved_legacy_active_count, 0) = 0
        )
        AND v_quality_passed
    );
  END;
  $function$;

  -- ---------------------------------------------------------------------------
  -- 8. Exact privileges and fail-closed postconditions
  -- ---------------------------------------------------------------------------
  REVOKE EXECUTE ON FUNCTION private.place_catalog_items_impl(
    uuid, integer, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION private.place_catalog_items_impl(
    uuid, integer, integer, jsonb, text, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.place_catalog_items(
    uuid, integer, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION public.place_catalog_items(
    uuid, integer, integer, jsonb, text, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION private.catalog_placement_state(uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_publish_readiness(uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.prevent_catalog_placement_review_mutation()
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.touch_catalog_placement_revision()
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_version_metadata_mutation()
    FROM PUBLIC, anon, authenticated;

  REVOKE EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;

  DO $phase4_p18_postconditions$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns column_row
      WHERE column_row.table_schema = 'public'
        AND column_row.table_name = 'price_list_versions'
        AND column_row.column_name = 'placement_revision'
        AND column_row.is_nullable = 'NO'
    ) OR EXISTS (
      SELECT 1
      FROM public.price_list_versions version
      WHERE version.placement_revision < 0
    ) THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: placement revision is missing, nullable, or negative';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.price_list'::regclass
        AND constraint_row.conname = 'uq_price_list_version_display_order'
        AND constraint_row.convalidated
        AND constraint_row.condeferrable
    ) THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: display-order uniqueness is not deferrable';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_class table_row
      JOIN pg_namespace schema_row ON schema_row.oid = table_row.relnamespace
      WHERE schema_row.nspname = 'public'
        AND table_row.relname = 'catalog_placement_reviews'
        AND table_row.relrowsecurity
    ) OR NOT EXISTS (
      SELECT 1
      FROM pg_policies policy
      WHERE policy.schemaname = 'public'
        AND policy.tablename = 'catalog_placement_reviews'
        AND policy.policyname = 'catalog_placement_reviews_admin_select'
    ) THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: placement-review RLS contract is incomplete';
    END IF;

    IF has_table_privilege('authenticated', 'public.catalog_placement_reviews', 'INSERT')
       OR has_table_privilege('authenticated', 'public.catalog_placement_reviews', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.catalog_placement_reviews', 'DELETE')
       OR has_table_privilege('service_role', 'public.catalog_placement_reviews', 'INSERT')
       OR has_table_privilege('service_role', 'public.catalog_placement_reviews', 'UPDATE')
       OR has_table_privilege('service_role', 'public.catalog_placement_reviews', 'DELETE')
       OR has_table_privilege('anon', 'public.catalog_placement_reviews', 'SELECT') THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: placement-review direct privileges are too broad';
    END IF;

    IF to_regprocedure(
      'public.place_catalog_items(uuid,integer,integer,jsonb,text,uuid)'
    ) IS NULL OR to_regprocedure(
      'private.place_catalog_items_impl(uuid,integer,integer,jsonb,text,uuid)'
    ) IS NULL THEN
      RAISE EXCEPTION 'WP-7.5 postcondition failed: placement functions are missing';
    END IF;

    IF NOT has_function_privilege(
      'authenticated',
      'public.place_catalog_items(uuid,integer,integer,jsonb,text,uuid)',
      'EXECUTE'
    ) OR has_function_privilege(
      'anon',
      'public.place_catalog_items(uuid,integer,integer,jsonb,text,uuid)',
      'EXECUTE'
    ) OR has_function_privilege(
      'anon',
      'private.place_catalog_items_impl(uuid,integer,integer,jsonb,text,uuid)',
      'EXECUTE'
    ) THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: placement function grants are not least privilege';
    END IF;

    IF (
      SELECT count(*)
      FROM pg_trigger trigger_row
      WHERE NOT trigger_row.tgisinternal
        AND trigger_row.tgname IN (
          'trigger_touch_catalog_placement_revision',
          'trigger_prevent_catalog_placement_review_mutation'
        )
    ) <> 2 THEN
      RAISE EXCEPTION 'WP-7.5 postcondition failed: placement triggers are missing';
    END IF;

    IF (
      SELECT count(*)
      FROM public.app_settings setting
      WHERE setting.key IN (
        'catalog_admin_enabled',
        'catalog_new_identity_enabled',
        'catalog_retirement_enabled'
      )
        AND setting.value = 'false'::jsonb
    ) <> 3 THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: catalog feature flags must remain disabled';
    END IF;

    IF EXISTS (SELECT 1 FROM public.catalog_placement_reviews) THEN
      RAISE EXCEPTION
        'WP-7.5 postcondition failed: migration must not fabricate placement acceptance';
    END IF;
  END;
  $phase4_p18_postconditions$;

COMMIT;
