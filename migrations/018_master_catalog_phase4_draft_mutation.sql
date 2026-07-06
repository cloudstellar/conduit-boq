-- Migration 018: Master Catalog Phase 4 Draft Mutation
-- Scope:
-- - Implements local-rehearsal draft create and draft mutation/import audit RPCs.
-- - Keeps publish and pointer restore disabled for WP-5.
-- - Does not move the catalog pointer, publish 2568.1.0, touch BOQ rows, or
--   touch Factor F rows/pointers/bindings/backfill.

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  CREATE SCHEMA IF NOT EXISTS private;

  REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
  GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated;

  CREATE OR REPLACE FUNCTION private.catalog_action_error(
    p_request_id uuid,
    p_code text,
    p_message text,
    p_retryable boolean DEFAULT false,
    p_diagnostics jsonb DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT jsonb_strip_nulls(jsonb_build_object(
      'ok', false,
      'requestId', p_request_id::text,
      'error', jsonb_build_object(
        'code', p_code,
        'message', p_message,
        'retryable', p_retryable,
        'diagnostics', p_diagnostics
      )
    ));
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_action_success(
    p_request_id uuid,
    p_data jsonb
  )
  RETURNS jsonb
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT jsonb_build_object(
      'ok', true,
      'requestId', p_request_id::text,
      'data', p_data
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_is_uuid(p_value text)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT COALESCE(
      p_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
      false
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_is_money(p_value text)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT COALESCE(
      p_value ~ '^(0|[1-9][0-9]*)\.[0-9]{2}$',
      false
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_money_text(p_value numeric)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT to_char(p_value, 'FM999999999999990.00');
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_admin_context()
  RETURNS TABLE(actor_id uuid, actor_display_name text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT
      p.id,
      COALESCE(
        NULLIF(btrim(concat_ws(' ', p.first_name, p.last_name)), ''),
        NULLIF(btrim(p.email), ''),
        p.id::text
      )
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
      AND p.status = 'active'
    LIMIT 1;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_admin_enabled()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT COALESCE((
      SELECT s.value = 'true'::jsonb
      FROM public.app_settings s
      WHERE s.key = 'catalog_admin_enabled'
    ), false);
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_price_row_snapshot(p_row public.price_list)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT jsonb_build_object(
      'rowId', p_row.id::text,
      'identityId', p_row.identity_id::text,
      'itemCode', p_row.item_code,
      'itemName', p_row.item_name,
      'unit', p_row.unit,
      'materialCost', private.catalog_money_text(p_row.material_cost),
      'laborCost', private.catalog_money_text(p_row.labor_cost),
      'unitCost', private.catalog_money_text(p_row.unit_cost),
      'category', p_row.category,
      'categoryId', p_row.category_id::text,
      'codeGroupId', p_row.code_group_id::text,
      'isActive', p_row.is_active,
      'displayOrder', p_row.display_order
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_ensure_category(
    p_version_id uuid,
    p_category_code text
  )
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_category_id uuid;
    v_category_code text;
  BEGIN
    v_category_code := NULLIF(btrim(p_category_code), '');

    IF v_category_code IS NULL THEN
      RETURN NULL;
    END IF;

    SELECT id
    INTO v_category_id
    FROM public.price_list_categories
    WHERE version_id = p_version_id
      AND code = v_category_code;

    IF v_category_id IS NOT NULL THEN
      RETURN v_category_id;
    END IF;

    INSERT INTO public.price_list_categories (
      version_id,
      code,
      name,
      display_order
    )
    VALUES (
      p_version_id,
      v_category_code,
      v_category_code,
      COALESCE((
        SELECT max(display_order) + 1
        FROM public.price_list_categories
        WHERE version_id = p_version_id
      ), 0)
    )
    RETURNING id INTO v_category_id;

    RETURN v_category_id;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_ensure_code_group(
    p_version_id uuid,
    p_work_context_code text,
    p_item_type_code text,
    p_work_context_name_th text,
    p_item_type_name_th text
  )
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_group_id uuid;
    v_work_context_code text;
    v_item_type_code text;
    v_work_context_name_th text;
    v_item_type_name_th text;
  BEGIN
    v_work_context_code := NULLIF(btrim(p_work_context_code), '');
    v_item_type_code := NULLIF(btrim(p_item_type_code), '');
    v_work_context_name_th := NULLIF(btrim(p_work_context_name_th), '');
    v_item_type_name_th := NULLIF(btrim(p_item_type_name_th), '');

    IF v_work_context_code IS NULL OR v_item_type_code IS NULL THEN
      RETURN NULL;
    END IF;

    SELECT id
    INTO v_group_id
    FROM public.catalog_code_groups
    WHERE version_id = p_version_id
      AND work_context_code = v_work_context_code
      AND item_type_code = v_item_type_code;

    IF v_group_id IS NOT NULL THEN
      RETURN v_group_id;
    END IF;

    IF v_work_context_name_th IS NULL OR v_item_type_name_th IS NULL THEN
      RETURN NULL;
    END IF;

    INSERT INTO public.catalog_code_groups (
      version_id,
      work_context_code,
      item_type_code,
      work_context_name_th,
      item_type_name_th,
      display_order
    )
    VALUES (
      p_version_id,
      v_work_context_code,
      v_item_type_code,
      v_work_context_name_th,
      v_item_type_name_th,
      COALESCE((
        SELECT max(display_order) + 1
        FROM public.catalog_code_groups
        WHERE version_id = p_version_id
      ), 0)
    )
    RETURNING id INTO v_group_id;

    RETURN v_group_id;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.create_catalog_draft_impl(
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
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_name text;
    v_base public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_existing_version public.price_list_versions%ROWTYPE;
    v_new_version_id uuid;
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
    v_name := NULLIF(btrim(p_name), '');

    IF p_request_id IS NULL OR v_reason IS NULL OR v_name IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Draft name, reason, and request ID are required', false);
    END IF;

    IF p_version_major <> 2568 OR p_version_minor <> 1 OR p_version_patch <> 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Only rehearsal catalog version 2568.1.0 is approved for Phase 4 draft work', false);
    END IF;

    SELECT v.*
    INTO v_existing_version
    FROM public.catalog_change_sets cs
    JOIN public.price_list_versions v ON v.id = cs.version_id
    WHERE cs.request_id = p_request_id
      AND cs.change_type = 'clone';

    IF FOUND THEN
      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'versionId', v_existing_version.id::text,
          'versionString', v_existing_version.version_string,
          'lockVersion', v_existing_version.lock_version,
          'duplicateRequest', true
        )
      );
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.catalog_change_sets WHERE request_id = p_request_id
      UNION ALL
      SELECT 1 FROM public.catalog_imports WHERE request_id = p_request_id
    ) THEN
      RETURN private.catalog_action_error(p_request_id, 'REQUEST_ALREADY_PROCESSED', 'Request ID already belongs to another catalog operation', false);
    END IF;

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true
    FOR UPDATE;

    SELECT *
    INTO v_base
    FROM public.price_list_versions
    WHERE id = p_base_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Base catalog version was not found', false);
    END IF;

    IF v_current_version_id IS DISTINCT FROM p_base_version_id OR v_base.status <> 'active' THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Drafts can only be created from the current active catalog default', false);
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.price_list_versions
      WHERE major = p_version_major
        AND minor = p_version_minor
        AND patch = p_version_patch
    ) THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Catalog version string already exists', false);
    END IF;

    INSERT INTO public.price_list_versions (
      major,
      minor,
      patch,
      name,
      status,
      is_default,
      created_by,
      based_on_version_id,
      lock_version,
      item_count
    )
    VALUES (
      p_version_major,
      p_version_minor,
      p_version_patch,
      v_name,
      'draft',
      false,
      v_actor_id,
      p_base_version_id,
      0,
      v_base.item_count
    )
    RETURNING id INTO v_new_version_id;

    INSERT INTO public.price_list_categories (version_id, code, name, display_order)
    SELECT v_new_version_id, code, name, display_order
    FROM public.price_list_categories
    WHERE version_id = p_base_version_id
    ORDER BY display_order, code;

    INSERT INTO public.catalog_code_groups (
      version_id,
      work_context_code,
      item_type_code,
      work_context_name_th,
      work_context_name_en,
      item_type_name_th,
      item_type_name_en,
      display_order
    )
    SELECT
      v_new_version_id,
      work_context_code,
      item_type_code,
      work_context_name_th,
      work_context_name_en,
      item_type_name_th,
      item_type_name_en,
      display_order
    FROM public.catalog_code_groups
    WHERE version_id = p_base_version_id
    ORDER BY display_order, work_context_code, item_type_code;

    INSERT INTO public.price_list (
      item_code,
      item_name,
      unit,
      material_cost,
      labor_cost,
      unit_cost,
      remarks,
      category,
      is_active,
      version_id,
      identity_id,
      category_id,
      code_group_id,
      display_order
    )
    SELECT
      pl.item_code,
      pl.item_name,
      pl.unit,
      pl.material_cost,
      pl.labor_cost,
      pl.unit_cost,
      pl.remarks,
      pl.category,
      pl.is_active,
      v_new_version_id,
      pl.identity_id,
      new_category.id,
      new_group.id,
      pl.display_order
    FROM public.price_list pl
    LEFT JOIN public.price_list_categories old_category
      ON old_category.id = pl.category_id
    LEFT JOIN public.price_list_categories new_category
      ON new_category.version_id = v_new_version_id
     AND new_category.code = old_category.code
    LEFT JOIN public.catalog_code_groups old_group
      ON old_group.id = pl.code_group_id
    LEFT JOIN public.catalog_code_groups new_group
      ON new_group.version_id = v_new_version_id
     AND new_group.work_context_code = old_group.work_context_code
     AND new_group.item_type_code = old_group.item_type_code
    WHERE pl.version_id = p_base_version_id
    ORDER BY pl.display_order, pl.item_code;

    INSERT INTO public.catalog_change_sets (
      version_id,
      change_type,
      reason,
      request_id,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version
    )
    VALUES (
      v_new_version_id,
      'clone',
      v_reason,
      p_request_id,
      v_actor_id,
      v_actor_display_name,
      NULL,
      0
    )
    RETURNING id INTO v_change_set_id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', v_new_version_id::text,
        'versionString', p_version_major::text || '.' || p_version_minor::text || '.' || p_version_patch::text,
        'lockVersion', 0,
        'changeSetId', v_change_set_id::text,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.apply_catalog_changes_impl(
    p_version_id uuid,
    p_change_payload jsonb,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid,
    p_import_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_operation text;
    v_payload jsonb;
    v_rows jsonb;
    v_source jsonb;
    v_mode text;
    v_normalized_hash text;
    v_import public.catalog_imports%ROWTYPE;
    v_draft public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_change_set_id uuid;
    v_before_lock integer;
    v_after_lock integer;
    v_changed_count integer := 0;
    v_seen_identity_ids uuid[] := ARRAY[]::uuid[];
    v_validation_seen_identity_ids uuid[] := ARRAY[]::uuid[];
    v_active_count integer;
    v_retire_count integer := 0;
    v_retire_threshold integer;
    v_retirement_reference text;
    v_retirement_confirmed integer;
    v_row jsonb;
    v_action text;
    v_identity_outcome text;
    v_legacy_code text;
    v_new_code text;
    v_existing public.price_list%ROWTYPE;
    v_after public.price_list%ROWTYPE;
    v_existing_code_identity_id uuid;
    v_identity_id uuid;
    v_category_id uuid;
    v_code_group_id uuid;
    v_item_name text;
    v_unit text;
    v_material_text text;
    v_labor_text text;
    v_unit_text text;
    v_material numeric(12,2);
    v_labor numeric(12,2);
    v_unit_cost numeric(12,2);
    v_category_code text;
    v_work_context_code text;
    v_item_type_code text;
    v_work_context_name_th text;
    v_item_type_name_th text;
    v_price_authority text;
    v_code_suffix integer;
    v_old_snapshot jsonb;
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

    IF p_change_payload IS NULL OR jsonb_typeof(p_change_payload) <> 'object' THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Change payload must be a JSON object', false);
    END IF;

    v_operation := p_change_payload->>'operation';

    IF v_operation NOT IN ('manual', 'import_validate', 'import_apply') THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Change operation is not recognized', false);
    END IF;

    IF v_operation = 'import_validate' THEN
      SELECT *
      INTO v_import
      FROM public.catalog_imports
      WHERE request_id = p_request_id;

      IF FOUND THEN
        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'importId', v_import.id::text,
            'versionId', v_import.version_id::text,
            'status', v_import.status,
            'normalizedPayloadHash', v_import.normalized_payload_hash,
            'duplicateRequest', true
          )
        );
      END IF;
    ELSE
      SELECT *
      INTO v_existing_change
      FROM public.catalog_change_sets
      WHERE request_id = p_request_id;

      IF FOUND THEN
        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'changeSetId', v_existing_change.id::text,
            'versionId', v_existing_change.version_id::text,
            'lockVersion', v_existing_change.after_lock_version,
            'duplicateRequest', true
          )
        );
      END IF;
    END IF;

    SELECT *
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_NOT_FOUND', 'Draft catalog version was not found', false);
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_NOT_EDITABLE', 'Only draft catalog versions can be changed', false);
    END IF;

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Draft base is no longer the current catalog default', false);
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true);
    END IF;

    IF v_operation IN ('import_validate', 'import_apply') THEN
      v_payload := p_change_payload->'payload';

      IF v_payload IS NULL OR jsonb_typeof(v_payload) <> 'object' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload is required', false);
      END IF;

      IF v_payload->>'versionId' IS DISTINCT FROM p_version_id::text THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload version does not match the draft', false);
      END IF;

      IF (v_payload->>'expectedLockVersion')::integer IS DISTINCT FROM p_expected_lock_version THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload lock version does not match the request', false);
      END IF;

      v_mode := v_payload->>'mode';

      IF v_mode NOT IN ('full', 'supplement') THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import mode is not recognized', false);
      END IF;

      v_normalized_hash := p_change_payload->>'normalizedPayloadHash';

      IF v_normalized_hash IS NULL OR v_normalized_hash !~ '^[0-9a-f]{64}$' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Normalized payload hash must be 64 lowercase hex characters', false);
      END IF;

      v_source := v_payload->'source';

      IF v_source IS NULL OR jsonb_typeof(v_source) <> 'object' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import source metadata is required', false);
      END IF;
    END IF;

    IF v_operation = 'import_validate' THEN
      IF v_payload->>'requestId' IS DISTINCT FROM p_request_id::text THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import validation request ID mismatch', false);
      END IF;

      INSERT INTO public.catalog_imports (
        version_id,
        mode,
        parser_profile_id,
        parser_profile_version,
        source_filename,
        source_file_size,
        source_file_sha256,
        physical_archive_reference,
        retirement_approval_reference,
        normalized_payload_hash,
        status,
        request_id,
        created_by
      )
      VALUES (
        p_version_id,
        v_mode,
        v_payload->>'parserProfileId',
        v_payload->>'parserProfileVersion',
        v_source->>'filename',
        (v_source->>'sizeBytes')::bigint,
        v_source->>'sha256',
        v_source->>'physicalArchiveReference',
        NULLIF(btrim(v_payload->>'retirementApprovalReference'), ''),
        v_normalized_hash,
        'validated',
        p_request_id,
        v_actor_id
      )
      RETURNING * INTO v_import;

      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'importId', v_import.id::text,
          'versionId', v_import.version_id::text,
          'status', v_import.status,
          'normalizedPayloadHash', v_import.normalized_payload_hash,
          'duplicateRequest', false
        )
      );
    END IF;

    IF v_operation = 'manual' THEN
      v_rows := p_change_payload->'changes';
      v_mode := 'supplement';
    ELSE
      IF p_import_id IS NULL THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Validated import ID is required for import apply', false);
      END IF;

      SELECT *
      INTO v_import
      FROM public.catalog_imports
      WHERE id = p_import_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Validated import was not found', false);
      END IF;

      IF v_import.status <> 'validated' THEN
        RETURN private.catalog_action_error(p_request_id, 'REQUEST_ALREADY_PROCESSED', 'Import has already been applied or rejected', false);
      END IF;

      IF v_import.version_id IS DISTINCT FROM p_version_id
         OR v_import.normalized_payload_hash IS DISTINCT FROM v_normalized_hash THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import apply payload does not match the validated import record', false);
      END IF;

      v_rows := v_payload->'rows';
    END IF;

    IF v_rows IS NULL OR jsonb_typeof(v_rows) <> 'array' OR jsonb_array_length(v_rows) = 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'At least one draft change row is required', false);
    END IF;

    IF v_mode = 'full' THEN
      FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
        v_identity_outcome := v_row->>'identityOutcome';

        IF v_identity_outcome IS DISTINCT FROM 'candidate_add' THEN
          v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
          v_new_code := NULLIF(btrim(COALESCE(v_row->>'canonicalCode', v_row->>'itemCode')), '');

          SELECT *
          INTO v_existing
          FROM public.price_list
          WHERE version_id = p_version_id
            AND (
              (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
              OR (v_new_code IS NOT NULL AND item_code = v_new_code)
            )
          ORDER BY CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
          LIMIT 1;

          IF FOUND THEN
            IF NOT (v_existing.identity_id = ANY(v_seen_identity_ids)) THEN
              v_seen_identity_ids := array_append(v_seen_identity_ids, v_existing.identity_id);
            ELSE
              RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Import payload references the same catalog identity more than once', false);
            END IF;
          END IF;
        END IF;
      END LOOP;

      SELECT count(*)
      INTO v_active_count
      FROM public.price_list
      WHERE version_id = p_version_id
        AND is_active = true;

      SELECT count(*)
      INTO v_retire_count
      FROM public.price_list
      WHERE version_id = p_version_id
        AND is_active = true
        AND NOT (identity_id = ANY(v_seen_identity_ids));

      v_retire_threshold := greatest(10, ceil(v_active_count * 0.02)::integer);
      v_retirement_reference := NULLIF(btrim(v_payload->>'retirementApprovalReference'), '');
      v_retirement_confirmed := NULLIF(btrim(v_payload->>'retirementConfirmedCount'), '')::integer;

      IF v_retire_count >= v_retire_threshold
         AND (
           v_retirement_reference IS NULL
           OR v_retirement_confirmed IS DISTINCT FROM v_retire_count
         ) THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
          'Full import retirement count requires exact owner approval evidence',
          false,
          jsonb_build_array(jsonb_build_object(
            'field', 'retirementConfirmedCount',
            'code', 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
            'message', 'Confirmed retirement count must match the server-computed count'
          ))
        );
      END IF;
    END IF;

    v_validation_seen_identity_ids := ARRAY[]::uuid[];

    FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
      v_identity_outcome := v_row->>'identityOutcome';
      v_action := COALESCE(NULLIF(btrim(v_row->>'action'), ''), CASE
        WHEN v_identity_outcome = 'candidate_add' THEN 'add'
        WHEN v_identity_outcome = 'retire' THEN 'retire'
        WHEN v_identity_outcome = 'recode' THEN 'recode'
        ELSE 'update'
      END);
      v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
      v_new_code := NULLIF(btrim(COALESCE(v_row->>'canonicalCode', v_row->>'itemCode')), '');
      v_price_authority := NULLIF(btrim(v_row->>'priceAuthorityReference'), '');

      IF v_action NOT IN ('add', 'update', 'retire', 'recode') THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Draft change action is not recognized', false);
      END IF;

      IF v_new_code IS NOT NULL THEN
        IF v_new_code !~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$' THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Canonical item code is not in the approved format', false);
        END IF;

        v_code_suffix := substring(v_new_code from '-([0-9]{3})$')::integer;

        IF v_code_suffix >= 900 THEN
          RETURN private.catalog_action_error(p_request_id, 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED', 'Catalog code sequence capacity review is required', false);
        END IF;
      END IF;

      IF v_action = 'add' THEN
        IF v_new_code IS NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows require a canonical item code', false);
        END IF;

        IF v_price_authority IS NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'New catalog rows require price authority evidence', false);
        END IF;

        SELECT identity_id
        INTO v_existing_code_identity_id
        FROM public.catalog_item_codes
        WHERE item_code = v_new_code;

        IF FOUND THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Catalog code is already allocated to an identity', false);
        END IF;

        v_item_name := NULLIF(btrim(v_row->>'itemName'), '');
        v_unit := NULLIF(btrim(v_row->>'unit'), '');
        v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
        v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
        v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

        IF v_item_name IS NULL OR v_unit IS NULL
           OR NOT private.catalog_is_money(v_material_text)
           OR NOT private.catalog_is_money(v_labor_text)
           OR NOT private.catalog_is_money(v_unit_text) THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows require complete item, unit, and money fields', false);
        END IF;

        v_material := v_material_text::numeric;
        v_labor := v_labor_text::numeric;
        v_unit_cost := v_unit_text::numeric;

        IF v_material + v_labor <> v_unit_cost THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
        END IF;
      ELSE
        SELECT *
        INTO v_existing
        FROM public.price_list
        WHERE version_id = p_version_id
          AND (
            (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
            OR (v_new_code IS NOT NULL AND item_code = v_new_code)
          )
        ORDER BY CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
        LIMIT 1;

        IF NOT FOUND THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Existing draft row could not be resolved from the supplied code', false);
        END IF;

        IF v_existing.identity_id = ANY(v_validation_seen_identity_ids) THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Change payload references the same catalog identity more than once', false);
        END IF;

        v_validation_seen_identity_ids := array_append(
          v_validation_seen_identity_ids,
          v_existing.identity_id
        );

        IF v_action <> 'retire' THEN
          v_item_name := COALESCE(NULLIF(btrim(v_row->>'itemName'), ''), v_existing.item_name);
          v_unit := COALESCE(NULLIF(btrim(v_row->>'unit'), ''), v_existing.unit);
          v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
          v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
          v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

          IF (v_material_text IS NOT NULL AND NOT private.catalog_is_money(v_material_text))
             OR (v_labor_text IS NOT NULL AND NOT private.catalog_is_money(v_labor_text))
             OR (v_unit_text IS NOT NULL AND NOT private.catalog_is_money(v_unit_text)) THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Money fields must be two-decimal strings', false);
          END IF;

          v_material := COALESCE(v_material_text::numeric, v_existing.material_cost);
          v_labor := COALESCE(v_labor_text::numeric, v_existing.labor_cost);
          v_unit_cost := COALESCE(v_unit_text::numeric, v_existing.unit_cost);

          IF v_material + v_labor <> v_unit_cost THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
          END IF;

          IF (
            v_item_name IS DISTINCT FROM v_existing.item_name
            OR v_unit IS DISTINCT FROM v_existing.unit
            OR v_material IS DISTINCT FROM v_existing.material_cost
            OR v_labor IS DISTINCT FROM v_existing.labor_cost
            OR v_unit_cost IS DISTINCT FROM v_existing.unit_cost
          ) AND v_price_authority IS NULL THEN
            RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'Name, unit, or price changes require explicit authority evidence', false);
          END IF;

          IF v_new_code IS NOT NULL AND v_new_code IS DISTINCT FROM v_existing.item_code THEN
            SELECT identity_id
            INTO v_existing_code_identity_id
            FROM public.catalog_item_codes
            WHERE item_code = v_new_code;

            IF FOUND AND v_existing_code_identity_id IS DISTINCT FROM v_existing.identity_id THEN
              RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Catalog code is already allocated to a different identity', false);
            END IF;
          END IF;
        END IF;
      END IF;
    END LOOP;

    v_before_lock := v_draft.lock_version;
    v_after_lock := v_before_lock + 1;

    INSERT INTO public.catalog_change_sets (
      version_id,
      import_id,
      change_type,
      reason,
      request_id,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version
    )
    VALUES (
      p_version_id,
      CASE WHEN v_operation = 'import_apply' THEN p_import_id ELSE NULL END,
      CASE WHEN v_operation = 'import_apply' THEN 'import' ELSE 'manual' END,
      v_reason,
      p_request_id,
      v_actor_id,
      v_actor_display_name,
      v_before_lock,
      v_after_lock
    )
    RETURNING id INTO v_change_set_id;

    FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
      v_identity_outcome := v_row->>'identityOutcome';
      v_action := COALESCE(NULLIF(btrim(v_row->>'action'), ''), CASE
        WHEN v_identity_outcome = 'candidate_add' THEN 'add'
        WHEN v_identity_outcome = 'retire' THEN 'retire'
        WHEN v_identity_outcome = 'recode' THEN 'recode'
        ELSE 'update'
      END);
      v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
      v_new_code := NULLIF(btrim(COALESCE(v_row->>'canonicalCode', v_row->>'itemCode')), '');
      v_price_authority := NULLIF(btrim(v_row->>'priceAuthorityReference'), '');

      IF v_action NOT IN ('add', 'update', 'retire', 'recode') THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Draft change action is not recognized', false);
      END IF;

      IF v_new_code IS NOT NULL THEN
        IF v_new_code !~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$' THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Canonical item code is not in the approved format', false);
        END IF;

        v_code_suffix := substring(v_new_code from '-([0-9]{3})$')::integer;

        IF v_code_suffix >= 900 THEN
          RETURN private.catalog_action_error(p_request_id, 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED', 'Catalog code sequence capacity review is required', false);
        END IF;
      END IF;

      IF v_action = 'add' THEN
        IF v_new_code IS NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows require a canonical item code', false);
        END IF;

        IF v_price_authority IS NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'New catalog rows require price authority evidence', false);
        END IF;

        SELECT identity_id
        INTO v_existing_code_identity_id
        FROM public.catalog_item_codes
        WHERE item_code = v_new_code;

        IF FOUND THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Catalog code is already allocated to an identity', false);
        END IF;

        v_item_name := NULLIF(btrim(v_row->>'itemName'), '');
        v_unit := NULLIF(btrim(v_row->>'unit'), '');
        v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
        v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
        v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

        IF v_item_name IS NULL OR v_unit IS NULL
           OR NOT private.catalog_is_money(v_material_text)
           OR NOT private.catalog_is_money(v_labor_text)
           OR NOT private.catalog_is_money(v_unit_text) THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows require complete item, unit, and money fields', false);
        END IF;

        v_material := v_material_text::numeric;
        v_labor := v_labor_text::numeric;
        v_unit_cost := v_unit_text::numeric;

        IF v_material + v_labor <> v_unit_cost THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
        END IF;

        v_category_code := NULLIF(btrim(v_row->>'categoryCode'), '');
        v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
        v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');
        v_work_context_name_th := NULLIF(btrim(v_row->>'workContextNameTh'), '');
        v_item_type_name_th := NULLIF(btrim(v_row->>'itemTypeNameTh'), '');
        v_category_id := private.catalog_ensure_category(p_version_id, v_category_code);
        v_code_group_id := private.catalog_ensure_code_group(
          p_version_id,
          v_work_context_code,
          v_item_type_code,
          v_work_context_name_th,
          v_item_type_name_th
        );

        INSERT INTO public.catalog_item_identities (created_by)
        VALUES (v_actor_id)
        RETURNING id INTO v_identity_id;

        INSERT INTO public.catalog_item_codes (
          item_code,
          identity_id,
          code_kind,
          first_seen_version_id,
          created_by
        )
        VALUES (
          v_new_code,
          v_identity_id,
          'canonical',
          p_version_id,
          v_actor_id
        );

        INSERT INTO public.price_list (
          item_code,
          item_name,
          unit,
          material_cost,
          labor_cost,
          unit_cost,
          category,
          is_active,
          version_id,
          identity_id,
          category_id,
          code_group_id,
          display_order
        )
        VALUES (
          v_new_code,
          v_item_name,
          v_unit,
          v_material,
          v_labor,
          v_unit_cost,
          v_category_code,
          true,
          p_version_id,
          v_identity_id,
          v_category_id,
          v_code_group_id,
          COALESCE((
            SELECT max(display_order) + 1
            FROM public.price_list
            WHERE version_id = p_version_id
          ), 0)
        )
        RETURNING * INTO v_after;

        INSERT INTO public.catalog_change_items (
          change_set_id,
          identity_id,
          action,
          old_values,
          new_values
        )
        VALUES (
          v_change_set_id,
          v_identity_id,
          'add',
          NULL,
          private.catalog_price_row_snapshot(v_after)
        );

        v_changed_count := v_changed_count + 1;
        v_seen_identity_ids := array_append(v_seen_identity_ids, v_identity_id);
      ELSE
        SELECT *
        INTO v_existing
        FROM public.price_list
        WHERE version_id = p_version_id
          AND (
            (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
            OR (v_new_code IS NOT NULL AND item_code = v_new_code)
          )
        ORDER BY CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
        LIMIT 1
        FOR UPDATE;

        IF NOT FOUND THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Existing draft row could not be resolved from the supplied code', false);
        END IF;

        IF v_action = 'retire' THEN
          v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

          UPDATE public.price_list
          SET
            is_active = false,
            updated_at = now()
          WHERE id = v_existing.id
          RETURNING * INTO v_after;

          INSERT INTO public.catalog_change_items (
            change_set_id,
            identity_id,
            action,
            old_values,
            new_values
          )
          VALUES (
            v_change_set_id,
            v_existing.identity_id,
            'retire',
            v_old_snapshot,
            NULL
          );

          v_changed_count := v_changed_count + 1;
          v_seen_identity_ids := array_append(v_seen_identity_ids, v_existing.identity_id);
        ELSE
          v_item_name := COALESCE(NULLIF(btrim(v_row->>'itemName'), ''), v_existing.item_name);
          v_unit := COALESCE(NULLIF(btrim(v_row->>'unit'), ''), v_existing.unit);
          v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
          v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
          v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

          IF (v_material_text IS NOT NULL AND NOT private.catalog_is_money(v_material_text))
             OR (v_labor_text IS NOT NULL AND NOT private.catalog_is_money(v_labor_text))
             OR (v_unit_text IS NOT NULL AND NOT private.catalog_is_money(v_unit_text)) THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Money fields must be two-decimal strings', false);
          END IF;

          v_material := COALESCE(v_material_text::numeric, v_existing.material_cost);
          v_labor := COALESCE(v_labor_text::numeric, v_existing.labor_cost);
          v_unit_cost := COALESCE(v_unit_text::numeric, v_existing.unit_cost);

          IF v_material + v_labor <> v_unit_cost THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
          END IF;

          IF (
            v_item_name IS DISTINCT FROM v_existing.item_name
            OR v_unit IS DISTINCT FROM v_existing.unit
            OR v_material IS DISTINCT FROM v_existing.material_cost
            OR v_labor IS DISTINCT FROM v_existing.labor_cost
            OR v_unit_cost IS DISTINCT FROM v_existing.unit_cost
          ) AND v_price_authority IS NULL THEN
            RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'Name, unit, or price changes require explicit authority evidence', false);
          END IF;

          v_category_code := COALESCE(NULLIF(btrim(v_row->>'categoryCode'), ''), v_existing.category);
          v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
          v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');
          v_work_context_name_th := NULLIF(btrim(v_row->>'workContextNameTh'), '');
          v_item_type_name_th := NULLIF(btrim(v_row->>'itemTypeNameTh'), '');
          v_category_id := COALESCE(
            private.catalog_ensure_category(p_version_id, v_category_code),
            v_existing.category_id
          );
          v_code_group_id := COALESCE(
            private.catalog_ensure_code_group(
              p_version_id,
              v_work_context_code,
              v_item_type_code,
              v_work_context_name_th,
              v_item_type_name_th
            ),
            v_existing.code_group_id
          );

          IF v_new_code IS NULL THEN
            v_new_code := v_existing.item_code;
          END IF;

          IF v_new_code IS DISTINCT FROM v_existing.item_code THEN
            SELECT identity_id
            INTO v_existing_code_identity_id
            FROM public.catalog_item_codes
            WHERE item_code = v_new_code;

            IF FOUND AND v_existing_code_identity_id IS DISTINCT FROM v_existing.identity_id THEN
              RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Catalog code is already allocated to a different identity', false);
            END IF;

            INSERT INTO public.catalog_item_codes (
              item_code,
              identity_id,
              code_kind,
              first_seen_version_id,
              created_by
            )
            VALUES (
              v_new_code,
              v_existing.identity_id,
              'canonical',
              p_version_id,
              v_actor_id
            )
            ON CONFLICT (item_code) DO NOTHING;

            v_action := 'recode';
          END IF;

          v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

          UPDATE public.price_list
          SET
            item_code = v_new_code,
            item_name = v_item_name,
            unit = v_unit,
            material_cost = v_material,
            labor_cost = v_labor,
            unit_cost = v_unit_cost,
            category = v_category_code,
            category_id = v_category_id,
            code_group_id = v_code_group_id,
            updated_at = now()
          WHERE id = v_existing.id
          RETURNING * INTO v_after;

          INSERT INTO public.catalog_change_items (
            change_set_id,
            identity_id,
            action,
            old_values,
            new_values
          )
          VALUES (
            v_change_set_id,
            v_existing.identity_id,
            CASE WHEN v_action = 'recode' THEN 'recode' ELSE 'update' END,
            v_old_snapshot,
            private.catalog_price_row_snapshot(v_after)
          );

          v_changed_count := v_changed_count + 1;
          v_seen_identity_ids := array_append(v_seen_identity_ids, v_existing.identity_id);
        END IF;
      END IF;
    END LOOP;

    IF v_mode = 'full' AND v_retire_count > 0 THEN
      FOR v_existing IN
        SELECT *
        FROM public.price_list
        WHERE version_id = p_version_id
          AND is_active = true
          AND NOT (identity_id = ANY(v_seen_identity_ids))
        ORDER BY display_order, item_code
        FOR UPDATE
      LOOP
        v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

        UPDATE public.price_list
        SET
          is_active = false,
          updated_at = now()
        WHERE id = v_existing.id
        RETURNING * INTO v_after;

        INSERT INTO public.catalog_change_items (
          change_set_id,
          identity_id,
          action,
          old_values,
          new_values
        )
        VALUES (
          v_change_set_id,
          v_existing.identity_id,
          'retire',
          v_old_snapshot,
          NULL
        );

        v_changed_count := v_changed_count + 1;
      END LOOP;
    END IF;

    IF v_changed_count = 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Draft mutation did not produce any audited item changes', false);
    END IF;

    UPDATE public.price_list_versions
    SET
      lock_version = v_after_lock,
      item_count = (
        SELECT count(*)::integer
        FROM public.price_list
        WHERE version_id = p_version_id
      ),
      updated_at = now()
    WHERE id = p_version_id;

    IF v_operation = 'import_apply' THEN
      UPDATE public.catalog_imports
      SET
        status = 'applied',
        applied_at = now()
      WHERE id = p_import_id;
    END IF;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', p_version_id::text,
        'changeSetId', v_change_set_id::text,
        'lockVersion', v_after_lock,
        'changedItems', v_changed_count,
        'retiredByFullImportOmission', CASE WHEN v_mode = 'full' THEN v_retire_count ELSE 0 END,
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
  BEGIN
    RETURN private.create_catalog_draft_impl(
      p_base_version_id,
      p_version_major,
      p_version_minor,
      p_version_patch,
      p_name,
      p_reason,
      p_request_id
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.apply_catalog_changes(
    p_version_id uuid,
    p_change_payload jsonb,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid,
    p_import_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
  BEGIN
    RETURN private.apply_catalog_changes_impl(
      p_version_id,
      p_change_payload,
      p_expected_lock_version,
      p_reason,
      p_request_id,
      p_import_id
    );
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
    PERFORM
      p_version_id,
      p_expected_lock_version,
      p_approval_metadata,
      p_reason,
      p_request_id;

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: publish_catalog_version remains disabled until WP-5 publish implementation is reviewed';
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
    PERFORM
      p_target_version_id,
      p_reason,
      p_request_id;

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: restore_catalog_pointer remains disabled until WP-5 pointer restore implementation is reviewed';
  END;
  $function$;

  REVOKE EXECUTE ON FUNCTION private.create_catalog_draft_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION private.apply_catalog_changes_impl(
    uuid, jsonb, integer, text, uuid, uuid
  ) FROM PUBLIC, anon;

  GRANT EXECUTE ON FUNCTION private.create_catalog_draft_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION private.apply_catalog_changes_impl(
    uuid, jsonb, integer, text, uuid, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.apply_catalog_changes(
    uuid, jsonb, integer, text, uuid, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(
    uuid, integer, jsonb, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.restore_catalog_pointer(
    uuid, text, uuid
  ) FROM PUBLIC, anon;

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
COMMIT;
