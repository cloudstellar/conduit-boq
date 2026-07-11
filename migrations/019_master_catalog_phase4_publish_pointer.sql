-- Migration 019: Master Catalog Phase 4 Publish and Pointer Restore
-- Scope:
-- - Implements local-rehearsal publish and pointer-restore RPCs.
-- - Computes catalog-only count/hash from database rows.
-- - Backfills trusted local metadata for legacy catalog 2568.0.0.
-- - Adds immutability guards for published catalog versions.
-- - Does not deploy, enable Production features, publish Production, touch BOQs,
--   or touch Factor F rows/pointers/bindings/backfill.

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  CREATE SCHEMA IF NOT EXISTS private;

  REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
  GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated;

  CREATE OR REPLACE FUNCTION private.catalog_json_text(p_value text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT COALESCE(to_json(p_value)::text, 'null');
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_compute_version_dataset(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_row_count integer;
    v_distinct_item_codes integer;
    v_active_rows integer;
    v_inactive_rows integer;
    v_missing_identity_id integer;
    v_missing_category_id integer;
    v_missing_display_order integer;
    v_missing_required_text integer;
    v_missing_money integer;
    v_cost_mismatches integer;
    v_invalid_item_codes integer;
    v_missing_canonical_code_group integer;
    v_canonical_code_group_mismatch integer;
    v_legacy_active_rows integer;
    v_rows_json text;
    v_canonical_json text;
    v_dataset_hash text;
  BEGIN
    WITH rows AS (
      SELECT
        pl.identity_id::text AS identity_id,
        pl.item_code::text AS item_code,
        pl.item_name::text AS item_name,
        pl.unit::text AS unit,
        to_char(pl.material_cost, 'FM999999999999990.00') AS material_cost,
        to_char(pl.labor_cost, 'FM999999999999990.00') AS labor_cost,
        to_char(pl.unit_cost, 'FM999999999999990.00') AS unit_cost,
        c.code::text AS category_code,
        c.name::text AS category_name,
        cg.work_context_code::text AS work_context_code,
        cg.work_context_name_th::text AS work_context_name_th,
        cg.item_type_code::text AS item_type_code,
        cg.item_type_name_th::text AS item_type_name_th,
        pl.is_active,
        pl.display_order,
        pl.category_id,
        pl.code_group_id,
        pl.material_cost AS material_cost_amount,
        pl.labor_cost AS labor_cost_amount,
        pl.unit_cost AS unit_cost_amount
      FROM public.price_list pl
      LEFT JOIN public.price_list_categories c
        ON c.version_id = pl.version_id
       AND c.id = pl.category_id
      LEFT JOIN public.catalog_code_groups cg
        ON cg.version_id = pl.version_id
       AND cg.id = pl.code_group_id
      WHERE pl.version_id = p_version_id
    ),
    quality AS (
      SELECT
        count(*)::integer AS row_count,
        count(DISTINCT item_code)::integer AS distinct_item_codes,
        count(*) FILTER (WHERE is_active = true)::integer AS active_rows,
        count(*) FILTER (WHERE is_active = false)::integer AS inactive_rows,
        count(*) FILTER (WHERE identity_id IS NULL)::integer AS missing_identity_id,
        count(*) FILTER (WHERE category_id IS NULL)::integer AS missing_category_id,
        count(*) FILTER (WHERE display_order IS NULL)::integer AS missing_display_order,
        count(*) FILTER (
          WHERE item_code IS NULL OR btrim(item_code) = ''
             OR item_name IS NULL OR btrim(item_name) = ''
             OR unit IS NULL OR btrim(unit) = ''
        )::integer AS missing_required_text,
        count(*) FILTER (
          WHERE material_cost_amount IS NULL OR labor_cost_amount IS NULL OR unit_cost_amount IS NULL
        )::integer AS missing_money,
        count(*) FILTER (
          WHERE material_cost_amount IS NOT NULL
            AND labor_cost_amount IS NOT NULL
            AND unit_cost_amount IS NOT NULL
            AND material_cost_amount + labor_cost_amount <> unit_cost_amount
        )::integer AS cost_mismatches,
        count(*) FILTER (
          WHERE item_code IS NULL
             OR (
               item_code !~ '^ITEM-[0-9]{4}$'
               AND item_code !~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
             )
        )::integer AS invalid_item_codes,
        count(*) FILTER (
          WHERE is_active = true
            AND item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
            AND code_group_id IS NULL
        )::integer AS missing_canonical_code_group,
        count(*) FILTER (
          WHERE is_active = true
            AND item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
            AND code_group_id IS NOT NULL
            AND (
              work_context_code IS DISTINCT FROM substring(item_code from '^([A-Z0-9]{3})-')
              OR item_type_code IS DISTINCT FROM substring(item_code from '^[A-Z0-9]{3}-([A-Z0-9]{3})-')
            )
        )::integer AS canonical_code_group_mismatch,
        count(*) FILTER (
          WHERE is_active = true
            AND item_code ~ '^ITEM-[0-9]{4}$'
        )::integer AS legacy_active_rows
      FROM rows
    ),
    canonical AS (
      SELECT
        item_code,
        identity_id,
        (
          '{"identity_id":' || private.catalog_json_text(identity_id) ||
          ',"item_code":' || private.catalog_json_text(item_code) ||
          ',"item_name":' || private.catalog_json_text(item_name) ||
          ',"unit":' || private.catalog_json_text(unit) ||
          ',"material_cost":' || private.catalog_json_text(material_cost) ||
          ',"labor_cost":' || private.catalog_json_text(labor_cost) ||
          ',"unit_cost":' || private.catalog_json_text(unit_cost) ||
          ',"category_code":' || private.catalog_json_text(category_code) ||
          ',"category_name":' || private.catalog_json_text(category_name) ||
          ',"work_context_code":' || private.catalog_json_text(work_context_code) ||
          ',"work_context_name_th":' || private.catalog_json_text(work_context_name_th) ||
          ',"item_type_code":' || private.catalog_json_text(item_type_code) ||
          ',"item_type_name_th":' || private.catalog_json_text(item_type_name_th) ||
          ',"is_active":' || CASE
            WHEN is_active IS TRUE THEN 'true'
            WHEN is_active IS FALSE THEN 'false'
            ELSE 'null'
          END ||
          ',"display_order":' || COALESCE(display_order::text, 'null') ||
          '}'
        ) AS row_json
      FROM rows
    )
    SELECT
      q.row_count,
      q.distinct_item_codes,
      q.active_rows,
      q.inactive_rows,
      q.missing_identity_id,
      q.missing_category_id,
      q.missing_display_order,
      q.missing_required_text,
      q.missing_money,
      q.cost_mismatches,
      q.invalid_item_codes,
      q.missing_canonical_code_group,
      q.canonical_code_group_mismatch,
      q.legacy_active_rows,
      COALESCE(string_agg(c.row_json, ',' ORDER BY c.item_code COLLATE "C", c.identity_id COLLATE "C"), '')
    INTO
      v_row_count,
      v_distinct_item_codes,
      v_active_rows,
      v_inactive_rows,
      v_missing_identity_id,
      v_missing_category_id,
      v_missing_display_order,
      v_missing_required_text,
      v_missing_money,
      v_cost_mismatches,
      v_invalid_item_codes,
      v_missing_canonical_code_group,
      v_canonical_code_group_mismatch,
      v_legacy_active_rows,
      v_rows_json
    FROM quality q
    LEFT JOIN canonical c ON true
    GROUP BY
      q.row_count,
      q.distinct_item_codes,
      q.active_rows,
      q.inactive_rows,
      q.missing_identity_id,
      q.missing_category_id,
      q.missing_display_order,
      q.missing_required_text,
      q.missing_money,
      q.cost_mismatches,
      q.invalid_item_codes,
      q.missing_canonical_code_group,
      q.canonical_code_group_mismatch,
      q.legacy_active_rows;

    v_canonical_json := '[' || COALESCE(v_rows_json, '') || ']' || chr(10);
    v_dataset_hash := 'sha256:' || encode(
      extensions.digest(pg_catalog.convert_to(v_canonical_json, 'UTF8'), 'sha256'),
      'hex'
    );

    RETURN jsonb_build_object(
      'itemCount', COALESCE(v_row_count, 0),
      'activeItemCount', COALESCE(v_active_rows, 0),
      'inactiveItemCount', COALESCE(v_inactive_rows, 0),
      'datasetHash', v_dataset_hash,
      'canonicalJsonBytes', octet_length(v_canonical_json),
      'quality', jsonb_build_object(
        'rowCount', COALESCE(v_row_count, 0),
        'distinctItemCodes', COALESCE(v_distinct_item_codes, 0),
        'activeRows', COALESCE(v_active_rows, 0),
        'inactiveRows', COALESCE(v_inactive_rows, 0),
        'missingIdentityId', COALESCE(v_missing_identity_id, 0),
        'missingCategoryId', COALESCE(v_missing_category_id, 0),
        'missingDisplayOrder', COALESCE(v_missing_display_order, 0),
        'missingRequiredText', COALESCE(v_missing_required_text, 0),
        'missingMoney', COALESCE(v_missing_money, 0),
        'costMismatches', COALESCE(v_cost_mismatches, 0),
        'invalidItemCodes', COALESCE(v_invalid_item_codes, 0),
        'missingCanonicalCodeGroup', COALESCE(v_missing_canonical_code_group, 0),
        'canonicalCodeGroupMismatch', COALESCE(v_canonical_code_group_mismatch, 0),
        'legacyActiveRows', COALESCE(v_legacy_active_rows, 0)
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_publish_readiness(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version public.price_list_versions%ROWTYPE;
    v_new_identity_count integer;
    v_active_canonical_code_count integer;
    v_unapproved_legacy_active_count integer;
    v_inactive_row_count integer;
  BEGIN
    SELECT *
    INTO v_version
    FROM public.price_list_versions
    WHERE id = p_version_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'versionFound', false,
        'versionStatus', null,
        'basedOnVersionId', null,
        'newIdentityCount', 0,
        'activeCanonicalCodeCount', 0,
        'structuredCodeGuardApplies', false,
        'unapprovedLegacyActiveCount', 0,
        'inactiveRowCount', 0,
        'retiredPdfPolicyRequired', false,
        'canPublish', false
      );
    END IF;

    SELECT
      count(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.price_list base
          WHERE base.version_id = v_version.based_on_version_id
            AND base.identity_id = candidate.identity_id
        )
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^ITEM-[0-9]{4}$'
          AND candidate.item_code <> 'ITEM-0139'
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = false
      )::integer
    INTO
      v_new_identity_count,
      v_active_canonical_code_count,
      v_unapproved_legacy_active_count,
      v_inactive_row_count
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id;

    RETURN jsonb_build_object(
      'versionFound', true,
      'versionStatus', v_version.status,
      'basedOnVersionId', v_version.based_on_version_id,
      'newIdentityCount', COALESCE(v_new_identity_count, 0),
      'activeCanonicalCodeCount', COALESCE(v_active_canonical_code_count, 0),
      'structuredCodeGuardApplies', COALESCE(v_active_canonical_code_count, 0) > 0,
      'unapprovedLegacyActiveCount', CASE
        WHEN COALESCE(v_active_canonical_code_count, 0) > 0
          THEN COALESCE(v_unapproved_legacy_active_count, 0)
        ELSE 0
      END,
      'inactiveRowCount', COALESCE(v_inactive_row_count, 0),
      'retiredPdfPolicyRequired', COALESCE(v_inactive_row_count, 0) > 0,
      'canPublish',
        v_version.status = 'draft'
        AND v_version.based_on_version_id IS NOT NULL
        AND COALESCE(v_new_identity_count, 0) = 0
        AND (
          COALESCE(v_active_canonical_code_count, 0) = 0
          OR COALESCE(v_unapproved_legacy_active_count, 0) = 0
        )
    );
  END;
  $function$;

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
    v_published_by_display_name text;
    v_current_version_id uuid;
    v_draft public.price_list_versions%ROWTYPE;
    v_base public.price_list_versions%ROWTYPE;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_request_fingerprint text;
    v_change_set_id uuid;
    v_snapshot jsonb;
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
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Active admin profile is required', false);
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false);
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_request_id IS NULL OR v_reason IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false);
    END IF;

    IF p_expected_lock_version IS NULL OR p_expected_lock_version < 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Expected lock version is required', false);
    END IF;

    IF p_approval_metadata IS NULL OR jsonb_typeof(p_approval_metadata) <> 'object' THEN
      RETURN private.catalog_action_error(p_request_id, 'PUBLICATION_METADATA_REQUIRED', 'Publication approval metadata is required', false);
    END IF;

    v_approval_reference := NULLIF(btrim(p_approval_metadata->>'approvalReference'), '');
    v_published_by_display_name := NULLIF(btrim(p_approval_metadata->>'publishedByDisplayName'), '');

    IF (p_approval_metadata->>'effectiveDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       OR (p_approval_metadata->>'approvalDocumentDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       OR v_approval_reference IS NULL
       OR length(v_approval_reference) > 500
       OR v_published_by_display_name IS NULL
       OR length(v_published_by_display_name) > 200 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_METADATA_REQUIRED',
        'Effective date, approval reference, approval document date, and publisher snapshot are required',
        false
      );
    END IF;

    v_effective_date := (p_approval_metadata->>'effectiveDate')::date;
    v_approval_document_date := (p_approval_metadata->>'approvalDocumentDate')::date;

    v_request_fingerprint := private.catalog_request_fingerprint(
      'publish',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'approvalMetadata', p_approval_metadata,
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

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('master_catalog_publish_pointer', 0));

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
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_FOUND', 'Catalog version was not found', false);
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_PUBLISHABLE', 'Only draft catalog versions can be published', false);
    END IF;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Draft base is no longer the current catalog default', false);
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true);
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
    v_new_identity_count := COALESCE((v_readiness->>'newIdentityCount')::integer, 0);

    IF v_new_identity_count <> 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'P18_PLACEMENT_REVIEW_REQUIRED',
        'New or supplement catalog identities require approved placement review before publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'displayOrder',
          'code', 'P18_PLACEMENT_REVIEW_REQUIRED',
          'message', 'Keep the draft for placement review; no pointer or publication metadata was changed',
          'newIdentityCount', v_new_identity_count
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

    v_snapshot := private.catalog_compute_version_dataset(p_version_id);
    v_quality := v_snapshot->'quality';

    IF (v_snapshot->>'itemCount')::integer <= 0
       OR (v_snapshot->>'activeItemCount')::integer <= 0
       OR (v_quality->>'rowCount')::integer <> (v_quality->>'distinctItemCodes')::integer
       OR (v_quality->>'missingIdentityId')::integer <> 0
       OR (v_quality->>'missingCategoryId')::integer <> 0
       OR (v_quality->>'missingDisplayOrder')::integer <> 0
       OR (v_quality->>'missingRequiredText')::integer <> 0
       OR (v_quality->>'missingMoney')::integer <> 0
       OR (v_quality->>'costMismatches')::integer <> 0
       OR (v_quality->>'invalidItemCodes')::integer <> 0
       OR (v_quality->>'missingCanonicalCodeGroup')::integer <> 0
       OR (v_quality->>'canonicalCodeGroupMismatch')::integer <> 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_VALIDATION_FAILED',
        'Catalog version is not complete enough to publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'catalogDataset',
          'code', 'PUBLICATION_VALIDATION_FAILED',
          'message', 'Count, identity, category, code, money, and canonical group checks must pass',
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
      published_at = now(),
      published_by = v_actor_id,
      published_by_display_name = v_published_by_display_name,
      dataset_hash = v_snapshot->>'datasetHash',
      item_count = (v_snapshot->>'itemCount')::integer,
      lock_version = v_after_lock,
      updated_at = now()
    WHERE id = p_version_id;

    UPDATE public.price_list_default_version
    SET
      version_id = p_version_id,
      updated_at = now()
    WHERE id = true;

    UPDATE public.price_list_versions
    SET
      is_default = false,
      updated_at = now()
    WHERE is_default = true
      AND id <> p_version_id;

    UPDATE public.price_list_versions
    SET
      is_default = true,
      updated_at = now()
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
    )
    VALUES (
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
        'itemCount', (v_snapshot->>'itemCount')::integer,
        'activeItemCount', (v_snapshot->>'activeItemCount')::integer,
        'datasetHash', v_snapshot->>'datasetHash',
        'canonicalJsonBytes', (v_snapshot->>'canonicalJsonBytes')::integer,
        'duplicateRequest', false
      )
    );
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
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_request_fingerprint text;
    v_change_set_id uuid;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Active admin profile is required', false);
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false);
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_request_id IS NULL OR v_reason IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false);
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

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'targetVersionId', v_existing_change.version_id::text,
            'targetVersionString', v_target.version_string,
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

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('master_catalog_publish_pointer', 0));

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
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_FOUND', 'Target catalog version was not found', false);
    END IF;

    IF v_target.status <> 'active'
       OR v_target.published_at IS NULL
       OR v_target.dataset_hash IS NULL
       OR v_target.item_count IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_RESTORABLE', 'Target catalog version must be active and published', false);
    END IF;

    IF v_current_version_id IS NOT DISTINCT FROM p_target_version_id THEN
      RETURN private.catalog_action_error(p_request_id, 'POINTER_ALREADY_CURRENT', 'Target catalog version is already current', false);
    END IF;

    UPDATE public.price_list_default_version
    SET
      version_id = p_target_version_id,
      updated_at = now()
    WHERE id = true;

    UPDATE public.price_list_versions
    SET
      is_default = false,
      updated_at = now()
    WHERE is_default = true
      AND id <> p_target_version_id;

    UPDATE public.price_list_versions
    SET
      is_default = true,
      updated_at = now()
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
      after_lock_version
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
      NULL
    )
    RETURNING id INTO v_change_set_id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'targetVersionId', p_target_version_id::text,
        'targetVersionString', v_target.version_string,
        'previousVersionId', v_current_version_id::text,
        'changeSetId', v_change_set_id::text,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.prevent_published_catalog_row_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_old_status text;
    v_new_status text;
  BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      SELECT status
      INTO v_old_status
      FROM public.price_list_versions
      WHERE id = OLD.version_id;

      IF v_old_status IN ('active', 'archived') THEN
        RAISE EXCEPTION 'CATALOG_PUBLISHED_ROW_IMMUTABLE: published catalog rows cannot be changed';
      END IF;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      SELECT status
      INTO v_new_status
      FROM public.price_list_versions
      WHERE id = NEW.version_id;

      IF v_new_status IN ('active', 'archived') THEN
        RAISE EXCEPTION 'CATALOG_PUBLISHED_ROW_IMMUTABLE: published catalog rows cannot be changed';
      END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
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
         OR NEW.published_at IS DISTINCT FROM OLD.published_at
         OR NEW.published_by IS DISTINCT FROM OLD.published_by
         OR NEW.published_by_display_name IS DISTINCT FROM OLD.published_by_display_name
         OR NEW.dataset_hash IS DISTINCT FROM OLD.dataset_hash
         OR NEW.item_count IS DISTINCT FROM OLD.item_count
         OR NEW.lock_version IS DISTINCT FROM OLD.lock_version THEN
        RAISE EXCEPTION 'CATALOG_PUBLISHED_VERSION_IMMUTABLE: published catalog metadata cannot be changed';
      END IF;
    END IF;

    RETURN NEW;
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
  BEGIN
    RETURN private.publish_catalog_version_impl(
      p_version_id,
      p_expected_lock_version,
      p_approval_metadata,
      p_reason,
      p_request_id
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_publish_readiness(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_actor_id uuid;
  BEGIN
    SELECT actor_id
    INTO v_actor_id
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RAISE EXCEPTION 'CATALOG_FORBIDDEN: active admin profile is required';
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RAISE EXCEPTION 'CATALOG_FORBIDDEN: Master Catalog admin gate is disabled';
    END IF;

    RETURN private.catalog_publish_readiness(p_version_id);
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.restore_catalog_pointer(
    p_target_version_id uuid,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
  BEGIN
    RETURN private.restore_catalog_pointer_impl(
      p_target_version_id,
      p_reason,
      p_request_id
    );
  END;
  $function$;

  DO $baseline_hash$
  DECLARE
    v_base_id uuid;
    v_snapshot jsonb;
  BEGIN
    SELECT id
    INTO v_base_id
    FROM public.price_list_versions
    WHERE version_string = '2568.0.0';

    IF v_base_id IS NULL THEN
      RAISE EXCEPTION 'Phase 4 publish blocked: legacy catalog 2568.0.0 not found';
    END IF;

    v_snapshot := private.catalog_compute_version_dataset(v_base_id);

    IF (v_snapshot->>'itemCount')::integer <= 0 THEN
      RAISE EXCEPTION 'Phase 4 publish blocked: legacy catalog 2568.0.0 has no rows';
    END IF;

    UPDATE public.price_list_versions
    SET
      item_count = (v_snapshot->>'itemCount')::integer,
      dataset_hash = v_snapshot->>'datasetHash',
      published_at = COALESCE(published_at, now()),
      updated_at = now()
    WHERE id = v_base_id
      AND (
        item_count IS DISTINCT FROM (v_snapshot->>'itemCount')::integer
        OR dataset_hash IS DISTINCT FROM v_snapshot->>'datasetHash'
        OR published_at IS NULL
      );
  END;
  $baseline_hash$;

  DROP TRIGGER IF EXISTS trigger_prevent_published_catalog_row_mutation
    ON public.price_list;
  CREATE TRIGGER trigger_prevent_published_catalog_row_mutation
    BEFORE INSERT OR UPDATE OR DELETE ON public.price_list
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_published_catalog_row_mutation();

  DROP TRIGGER IF EXISTS trigger_prevent_published_catalog_version_metadata_mutation
    ON public.price_list_versions;
  CREATE TRIGGER trigger_prevent_published_catalog_version_metadata_mutation
    BEFORE UPDATE ON public.price_list_versions
    FOR EACH ROW
    EXECUTE FUNCTION private.prevent_published_catalog_version_metadata_mutation();

  REVOKE EXECUTE ON FUNCTION private.catalog_json_text(text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_compute_version_dataset(uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_publish_readiness(uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION private.restore_catalog_pointer_impl(
    uuid, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_row_mutation()
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_version_metadata_mutation()
    FROM PUBLIC, anon, authenticated;

  GRANT EXECUTE ON FUNCTION private.publish_catalog_version_impl(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION private.restore_catalog_pointer_impl(
    uuid, text, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.get_catalog_publish_readiness(uuid)
    FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) FROM PUBLIC, anon;

  GRANT EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.get_catalog_publish_readiness(uuid)
    TO authenticated;
  GRANT EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) TO authenticated;

  DO $phase4_publish_postconditions$
  DECLARE
    v_baseline public.price_list_versions%ROWTYPE;
    v_factor_default_before text;
  BEGIN
    SELECT *
    INTO v_baseline
    FROM public.price_list_versions
    WHERE version_string = '2568.0.0';

    IF v_baseline.dataset_hash IS NULL
       OR v_baseline.published_at IS NULL
       OR v_baseline.item_count IS NULL THEN
      RAISE EXCEPTION 'Phase 4 publish postcondition failed: 2568.0.0 publication metadata remains incomplete';
    END IF;

    SELECT v.version_string
    INTO v_factor_default_before
    FROM public.factor_reference_default_version dv
    JOIN public.factor_reference_versions v ON v.id = dv.version_id
    WHERE dv.id = true;

    IF v_factor_default_before IS NULL THEN
      RAISE EXCEPTION 'Phase 4 publish postcondition failed: Factor F default pointer is missing';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.app_settings
      WHERE key = 'catalog_admin_enabled'
        AND value <> 'false'::jsonb
    ) THEN
      RAISE EXCEPTION 'Phase 4 publish postcondition failed: catalog_admin_enabled is not false';
    END IF;
  END;
  $phase4_publish_postconditions$;
COMMIT;
