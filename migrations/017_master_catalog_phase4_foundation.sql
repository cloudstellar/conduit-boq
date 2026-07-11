-- =============================================================================
-- Migration 017: Master Catalog Phase 4 Foundation
-- Status: DRAFT - LOCAL REHEARSAL ONLY UNTIL OWNER PRODUCTION GATE
-- Source: docs/plans/master-catalog/17-phase4-database-security-contract.md
--
-- Purpose:
-- 1. Add Phase 4 catalog governance columns and tables additively.
-- 2. Backfill stable identities, legacy code reservations, categories, and
--    deterministic display order for the current catalog rows.
-- 3. Install explicit RLS/grants for the new public tables.
-- 4. Seed the disabled catalog admin feature flag.
-- 5. Reserve public RPC names with rejecting SECURITY INVOKER stubs only.
--
-- Non-goals:
-- - No Production execution without the separate owner gate.
-- - No Factor F rows, pointers, BOQ bindings, or backfill are touched.
-- - No publish/pointer movement or feature enablement occurs here.
-- =============================================================================

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '60s';

  -- ---------------------------------------------------------------------------
  -- 1. Readiness assertions for the local rehearsal source state
  -- ---------------------------------------------------------------------------
  DO $phase4_preflight$
  DECLARE
    v_catalog_rows integer;
    v_distinct_codes integer;
    v_missing_required_values integer;
    v_cost_mismatches integer;
    v_bad_item_codes integer;
    v_duplicate_display_suffixes integer;
    v_default_catalog_pointers integer;
    v_active_default_versions integer;
  BEGIN
    SELECT
      count(*),
      count(DISTINCT item_code),
      count(*) FILTER (
        WHERE item_code IS NULL
          OR btrim(item_code::text) = ''
          OR item_name IS NULL
          OR btrim(item_name) = ''
          OR unit IS NULL
          OR btrim(unit::text) = ''
          OR material_cost IS NULL
          OR labor_cost IS NULL
          OR unit_cost IS NULL
      ),
      count(*) FILTER (
        WHERE material_cost < 0
          OR labor_cost < 0
          OR unit_cost < 0
          OR unit_cost IS DISTINCT FROM material_cost + labor_cost
      ),
      count(*) FILTER (WHERE item_code !~ '^ITEM-[0-9]{4}$')
    INTO
      v_catalog_rows,
      v_distinct_codes,
      v_missing_required_values,
      v_cost_mismatches,
      v_bad_item_codes
    FROM public.price_list;

    IF v_catalog_rows = 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: public.price_list is empty';
    END IF;

    IF v_catalog_rows <> v_distinct_codes THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: duplicate item_code count detected (% rows, % distinct codes)',
        v_catalog_rows, v_distinct_codes;
    END IF;

    IF v_missing_required_values <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: % catalog rows have missing required values',
        v_missing_required_values;
    END IF;

    IF v_cost_mismatches <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: % catalog rows have invalid or mismatched costs',
        v_cost_mismatches;
    END IF;

    IF v_bad_item_codes <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: % catalog rows do not match ITEM-####',
        v_bad_item_codes;
    END IF;

    SELECT count(*)
    INTO v_duplicate_display_suffixes
    FROM (
      SELECT substring(item_code from '^ITEM-([0-9]{4})$')::integer AS suffix
      FROM public.price_list
      GROUP BY substring(item_code from '^ITEM-([0-9]{4})$')::integer
      HAVING count(*) > 1
    ) duplicate_suffixes;

    IF v_duplicate_display_suffixes <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: duplicate ITEM numeric suffixes found';
    END IF;

    SELECT count(*)
    INTO v_default_catalog_pointers
    FROM public.price_list_default_version dv
    JOIN public.price_list_versions v ON v.id = dv.version_id
    WHERE dv.id = true
      AND v.status = 'active';

    SELECT count(*)
    INTO v_active_default_versions
    FROM public.price_list_versions
    WHERE is_default = true
      AND status = 'active';

    IF v_default_catalog_pointers <> 1 OR v_active_default_versions <> 1 THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: catalog default pointer/default mirror is not singular';
    END IF;

    IF to_regclass('public.factor_reference_versions') IS NULL
       OR to_regclass('public.factor_reference_rows') IS NULL
       OR to_regclass('public.factor_reference_default_version') IS NULL THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: Factor F foundation tables are missing';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'boq'
        AND column_name = 'factor_reference_version_id'
    ) THEN
      RAISE EXCEPTION 'Phase 4 foundation blocked: boq.factor_reference_version_id is missing';
    END IF;
  END;
  $phase4_preflight$;

  -- ---------------------------------------------------------------------------
  -- 2. Private schema posture
  -- ---------------------------------------------------------------------------
  CREATE SCHEMA IF NOT EXISTS private;

  REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
  GRANT USAGE ON SCHEMA private TO postgres, service_role;

  ALTER DEFAULT PRIVILEGES IN SCHEMA private
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

  -- ---------------------------------------------------------------------------
  -- 3. Additive existing-table columns
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.price_list_versions
    ADD COLUMN IF NOT EXISTS based_on_version_id uuid,
    ADD COLUMN IF NOT EXISTS effective_date date,
    ADD COLUMN IF NOT EXISTS approval_reference text,
    ADD COLUMN IF NOT EXISTS approval_document_date date,
    ADD COLUMN IF NOT EXISTS published_at timestamptz,
    ADD COLUMN IF NOT EXISTS published_by uuid,
    ADD COLUMN IF NOT EXISTS published_by_display_name text,
    ADD COLUMN IF NOT EXISTS dataset_hash text,
    ADD COLUMN IF NOT EXISTS item_count integer,
    ADD COLUMN IF NOT EXISTS lock_version integer NOT NULL DEFAULT 0;

  ALTER TABLE public.price_list
    ADD COLUMN IF NOT EXISTS identity_id uuid,
    ADD COLUMN IF NOT EXISTS category_id uuid,
    ADD COLUMN IF NOT EXISTS code_group_id uuid,
    ADD COLUMN IF NOT EXISTS display_order integer;

  -- ---------------------------------------------------------------------------
  -- 4. New Phase 4 governance tables
  -- ---------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS public.catalog_item_identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS public.catalog_item_codes (
    item_code text PRIMARY KEY,
    identity_id uuid NOT NULL
      REFERENCES public.catalog_item_identities(id) ON DELETE RESTRICT,
    code_kind text NOT NULL
      CHECK (code_kind IN ('legacy', 'canonical')),
    first_seen_version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT uq_catalog_item_codes_item_identity UNIQUE (item_code, identity_id),
    CONSTRAINT check_catalog_item_codes_format CHECK (
      (code_kind = 'legacy' AND item_code ~ '^ITEM-[0-9]{4}$')
      OR
      (code_kind = 'canonical' AND item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$')
    )
  );

  CREATE TABLE IF NOT EXISTS public.price_list_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    code text NOT NULL CHECK (btrim(code) <> ''),
    name text NOT NULL CHECK (btrim(name) <> ''),
    display_order integer NOT NULL CHECK (display_order >= 0),
    CONSTRAINT uq_price_list_categories_version_code UNIQUE (version_id, code),
    CONSTRAINT uq_price_list_categories_version_id UNIQUE (version_id, id)
  );

  CREATE TABLE IF NOT EXISTS public.catalog_code_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    work_context_code text NOT NULL
      CHECK (work_context_code ~ '^[A-Z0-9]{3}$'),
    item_type_code text NOT NULL
      CHECK (item_type_code ~ '^[A-Z0-9]{3}$'),
    work_context_name_th text NOT NULL CHECK (btrim(work_context_name_th) <> ''),
    work_context_name_en text,
    item_type_name_th text NOT NULL CHECK (btrim(item_type_name_th) <> ''),
    item_type_name_en text,
    display_order integer NOT NULL CHECK (display_order >= 0),
    CONSTRAINT uq_catalog_code_groups_version_codes
      UNIQUE (version_id, work_context_code, item_type_code),
    CONSTRAINT uq_catalog_code_groups_version_id UNIQUE (version_id, id)
  );

  CREATE TABLE IF NOT EXISTS public.catalog_imports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    mode text NOT NULL CHECK (mode IN ('full', 'supplement')),
    parser_profile_id text NOT NULL CHECK (btrim(parser_profile_id) <> ''),
    parser_profile_version text NOT NULL CHECK (btrim(parser_profile_version) <> ''),
    source_filename text NOT NULL CHECK (
      btrim(source_filename) <> ''
      AND position('/' in source_filename) = 0
      AND position(chr(92) in source_filename) = 0
    ),
    source_file_size bigint NOT NULL
      CHECK (source_file_size > 0 AND source_file_size <= 20971520),
    source_file_sha256 text NOT NULL
      CHECK (source_file_sha256 ~ '^[0-9a-f]{64}$'),
    physical_archive_reference text NOT NULL
      CHECK (btrim(physical_archive_reference) <> '' AND length(physical_archive_reference) <= 500),
    retirement_approval_reference text
      CHECK (retirement_approval_reference IS NULL OR btrim(retirement_approval_reference) <> ''),
    normalized_payload_hash text NOT NULL
      CHECK (normalized_payload_hash ~ '^[0-9a-f]{64}$'),
    status text NOT NULL CHECK (status IN ('validated', 'applied', 'rejected')),
    error_summary jsonb,
    request_id uuid NOT NULL,
    request_fingerprint text NOT NULL
      CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    applied_at timestamptz,
    CONSTRAINT uq_catalog_imports_request_id UNIQUE (request_id),
    CONSTRAINT check_catalog_imports_error_summary CHECK (
      error_summary IS NULL
      OR (
        jsonb_typeof(error_summary) = 'object'
        AND octet_length(error_summary::text) <= 16000
      )
    ),
    CONSTRAINT check_catalog_imports_applied_at CHECK (
      (status = 'applied' AND applied_at IS NOT NULL)
      OR
      (status <> 'applied' AND applied_at IS NULL)
    )
  );

  CREATE TABLE IF NOT EXISTS public.catalog_change_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
      REFERENCES public.price_list_versions(id) ON DELETE RESTRICT,
    import_id uuid REFERENCES public.catalog_imports(id) ON DELETE RESTRICT,
    change_type text NOT NULL
      CHECK (change_type IN ('clone', 'import', 'manual', 'publish', 'restore')),
    reason text NOT NULL CHECK (btrim(reason) <> '' AND length(reason) <= 500),
    request_id uuid NOT NULL,
    request_fingerprint text NOT NULL
      CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
    actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    actor_display_name text NOT NULL
      CHECK (btrim(actor_display_name) <> '' AND length(actor_display_name) <= 200),
    before_lock_version integer CHECK (before_lock_version IS NULL OR before_lock_version >= 0),
    after_lock_version integer CHECK (after_lock_version IS NULL OR after_lock_version >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_catalog_change_sets_request_id UNIQUE (request_id),
    CONSTRAINT check_catalog_change_sets_import_link CHECK (
      (change_type = 'import' AND import_id IS NOT NULL)
      OR
      (change_type <> 'import' AND import_id IS NULL)
    )
  );

  CREATE TABLE IF NOT EXISTS public.catalog_change_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    change_set_id uuid NOT NULL
      REFERENCES public.catalog_change_sets(id) ON DELETE RESTRICT,
    identity_id uuid NOT NULL
      REFERENCES public.catalog_item_identities(id) ON DELETE RESTRICT,
    action text NOT NULL CHECK (action IN ('add', 'update', 'retire', 'recode')),
    old_values jsonb,
    new_values jsonb,
    CONSTRAINT check_catalog_change_items_snapshots CHECK (
      (action = 'add' AND old_values IS NULL AND new_values IS NOT NULL)
      OR
      (action = 'retire' AND old_values IS NOT NULL AND new_values IS NULL)
      OR
      (action IN ('update', 'recode') AND old_values IS NOT NULL AND new_values IS NOT NULL)
    )
  );

  -- ---------------------------------------------------------------------------
  -- 5. Feature flag remains disabled by default
  -- ---------------------------------------------------------------------------
  INSERT INTO public.app_settings (key, value, description)
  VALUES (
    'catalog_admin_enabled',
    'false'::jsonb,
    'Master Catalog Phase 4 admin UI/RPC feature flag. Must remain false until approved owner gate.'
  )
  ON CONFLICT (key) DO UPDATE
  SET description = COALESCE(public.app_settings.description, EXCLUDED.description);

  -- ---------------------------------------------------------------------------
  -- 6. Deterministic local backfill for legacy rows
  -- ---------------------------------------------------------------------------
  UPDATE public.price_list
  SET display_order = substring(item_code from '^ITEM-([0-9]{4})$')::integer - 1
  WHERE display_order IS NULL;

  DO $phase4_identity_preflight$
  DECLARE
    v_price_rows integer;
    v_baseline_rows integer;
    v_nondeterministic_baseline_rows integer;
    v_identity_collisions integer;
  BEGIN
    SELECT
      count(*)::integer,
      count(*) FILTER (WHERE v.version_string = '2568.0.0')::integer
    INTO v_price_rows, v_baseline_rows
    FROM public.price_list pl
    LEFT JOIN public.price_list_versions v ON v.id = pl.version_id;

    IF v_price_rows = 0 OR v_baseline_rows <> v_price_rows THEN
      RAISE EXCEPTION
        'P20 deterministic identity blocked: expected only the non-empty 2568.0.0 baseline before Phase 4 identity initialization (baseline %, total %)',
        v_baseline_rows,
        v_price_rows;
    END IF;

    SELECT count(*)::integer
    INTO v_nondeterministic_baseline_rows
    FROM public.price_list pl
    JOIN public.price_list_versions v ON v.id = pl.version_id
    WHERE v.version_string = '2568.0.0'
      AND pl.identity_id IS NOT NULL
      AND pl.identity_id IS DISTINCT FROM pl.id;

    IF v_nondeterministic_baseline_rows <> 0 THEN
      RAISE EXCEPTION
        'P20 deterministic identity blocked: % baseline rows already have non-deterministic identities; use an approved clean rebuild instead of rewriting lineage',
        v_nondeterministic_baseline_rows;
    END IF;

    SELECT count(*)::integer
    INTO v_identity_collisions
    FROM public.price_list pl
    JOIN public.price_list_versions v ON v.id = pl.version_id
    JOIN public.catalog_item_identities identity_row ON identity_row.id = pl.id
    WHERE v.version_string = '2568.0.0'
      AND pl.identity_id IS NULL;

    IF v_identity_collisions <> 0 THEN
      RAISE EXCEPTION
        'P20 deterministic identity blocked: % baseline price_list.id values collide with pre-existing unassigned identities',
        v_identity_collisions;
    END IF;
  END;
  $phase4_identity_preflight$;

  CREATE TEMP TABLE phase4_identity_backfill
  ON COMMIT DROP
  AS
  SELECT
    pl.id AS price_list_id,
    pl.id AS identity_id
  FROM public.price_list pl
  JOIN public.price_list_versions v ON v.id = pl.version_id
  WHERE v.version_string = '2568.0.0'
    AND pl.identity_id IS NULL
  ORDER BY pl.version_id, pl.item_code;

  INSERT INTO public.catalog_item_identities (id, created_by)
  SELECT identity_id, NULL
  FROM phase4_identity_backfill
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.price_list pl
  SET identity_id = b.identity_id
  FROM phase4_identity_backfill b
  WHERE pl.id = b.price_list_id
    AND pl.identity_id IS NULL;

  INSERT INTO public.catalog_item_codes (
    item_code,
    identity_id,
    code_kind,
    first_seen_version_id,
    created_by
  )
  SELECT
    pl.item_code::text,
    pl.identity_id,
    'legacy',
    pl.version_id,
    NULL
  FROM public.price_list pl
  WHERE pl.identity_id IS NOT NULL
  ON CONFLICT (item_code) DO NOTHING;

  WITH category_source AS (
    SELECT
      version_id,
      btrim(category::text) AS category_code,
      min(display_order) AS first_display_order
    FROM public.price_list
    WHERE category IS NOT NULL
      AND btrim(category::text) <> ''
    GROUP BY version_id, btrim(category::text)
  ),
  ranked_categories AS (
    SELECT
      version_id,
      category_code,
      row_number() OVER (
        PARTITION BY version_id
        ORDER BY first_display_order, category_code
      ) - 1 AS display_order
    FROM category_source
  )
  INSERT INTO public.price_list_categories (version_id, code, name, display_order)
  SELECT version_id, category_code, category_code, display_order
  FROM ranked_categories
  ON CONFLICT (version_id, code) DO UPDATE
  SET
    name = EXCLUDED.name,
    display_order = EXCLUDED.display_order;

  UPDATE public.price_list pl
  SET category_id = c.id
  FROM public.price_list_categories c
  WHERE c.version_id = pl.version_id
    AND c.code = btrim(pl.category::text)
    AND pl.category_id IS NULL;

  UPDATE public.price_list_versions v
  SET
    effective_date = COALESCE(v.effective_date, DATE '2026-01-01'),
    approval_reference = COALESCE(
      v.approval_reference,
      'เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568'
    ),
    approval_document_date = COALESCE(v.approval_document_date, DATE '2025-11-27'),
    published_by_display_name = COALESCE(
      v.published_by_display_name,
      'ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)'
    ),
    item_count = COALESCE(v.item_count, counts.item_count),
    updated_at = now()
  FROM (
    SELECT version_id, count(*)::integer AS item_count
    FROM public.price_list
    GROUP BY version_id
  ) counts
  WHERE counts.version_id = v.id
    AND v.version_string = '2568.0.0';

  -- ---------------------------------------------------------------------------
  -- 7. Constraints that PostgreSQL cannot express with IF NOT EXISTS
  -- ---------------------------------------------------------------------------
  DO $phase4_constraints$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_versions_based_on_version'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT fk_price_list_versions_based_on_version
        FOREIGN KEY (based_on_version_id)
        REFERENCES public.price_list_versions(id)
        ON DELETE RESTRICT
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_versions_published_by'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT fk_price_list_versions_published_by
        FOREIGN KEY (published_by)
        REFERENCES auth.users(id)
        ON DELETE SET NULL
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_versions_lock_version'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_lock_version
        CHECK (lock_version >= 0)
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_versions_dataset_hash'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_dataset_hash
        CHECK (dataset_hash IS NULL OR dataset_hash ~ '^sha256:[0-9a-f]{64}$')
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_versions_item_count'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_item_count
        CHECK (item_count IS NULL OR item_count > 0)
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_versions_approval_reference'
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_approval_reference
        CHECK (
          approval_reference IS NULL
          OR (btrim(approval_reference) <> '' AND length(approval_reference) <= 500)
        )
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_identity'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT fk_price_list_identity
        FOREIGN KEY (identity_id)
        REFERENCES public.catalog_item_identities(id)
        ON DELETE RESTRICT
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_item_code_identity'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT fk_price_list_item_code_identity
        FOREIGN KEY (item_code, identity_id)
        REFERENCES public.catalog_item_codes(item_code, identity_id)
        ON DELETE RESTRICT
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_version_category'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT fk_price_list_version_category
        FOREIGN KEY (version_id, category_id)
        REFERENCES public.price_list_categories(version_id, id)
        ON DELETE RESTRICT
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_price_list_version_code_group'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT fk_price_list_version_code_group
        FOREIGN KEY (version_id, code_group_id)
        REFERENCES public.catalog_code_groups(version_id, id)
        ON DELETE RESTRICT
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'uq_price_list_version_identity'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT uq_price_list_version_identity
        UNIQUE (version_id, identity_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_display_order'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_display_order
        CHECK (display_order IS NULL OR display_order >= 0)
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_nonnegative_costs'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_nonnegative_costs
        CHECK (
          material_cost IS NULL OR material_cost >= 0
        )
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_labor_nonnegative'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_labor_nonnegative
        CHECK (
          labor_cost IS NULL OR labor_cost >= 0
        )
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_unit_nonnegative'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_unit_nonnegative
        CHECK (
          unit_cost IS NULL OR unit_cost >= 0
        )
        NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'check_price_list_unit_cost_matches_parts'
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_unit_cost_matches_parts
        CHECK (
          material_cost IS NULL
          OR labor_cost IS NULL
          OR unit_cost IS NULL
          OR unit_cost = material_cost + labor_cost
        )
        NOT VALID;
    END IF;
  END;
  $phase4_constraints$;

  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT fk_price_list_versions_based_on_version;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT fk_price_list_versions_published_by;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_price_list_versions_lock_version;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_price_list_versions_dataset_hash;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_price_list_versions_item_count;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_price_list_versions_approval_reference;

  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT fk_price_list_identity;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT fk_price_list_item_code_identity;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT fk_price_list_version_category;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT fk_price_list_version_code_group;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_display_order;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_nonnegative_costs;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_labor_nonnegative;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_unit_nonnegative;
  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_unit_cost_matches_parts;

  -- ---------------------------------------------------------------------------
  -- 8. Index contract
  -- ---------------------------------------------------------------------------
  CREATE INDEX IF NOT EXISTS idx_price_list_versions_based_on_version
    ON public.price_list_versions (based_on_version_id);

  CREATE INDEX IF NOT EXISTS idx_price_list_versions_created_by
    ON public.price_list_versions (created_by);

  CREATE INDEX IF NOT EXISTS idx_price_list_versions_published_by
    ON public.price_list_versions (published_by);

  CREATE INDEX IF NOT EXISTS idx_catalog_item_codes_identity
    ON public.catalog_item_codes (identity_id);

  CREATE INDEX IF NOT EXISTS idx_catalog_item_codes_first_seen_version
    ON public.catalog_item_codes (first_seen_version_id);

  CREATE INDEX IF NOT EXISTS idx_catalog_item_identities_created_by
    ON public.catalog_item_identities (created_by);

  CREATE INDEX IF NOT EXISTS idx_catalog_item_codes_created_by
    ON public.catalog_item_codes (created_by);

  CREATE INDEX IF NOT EXISTS idx_price_list_identity_id
    ON public.price_list (identity_id);

  CREATE INDEX IF NOT EXISTS idx_price_list_item_code_identity
    ON public.price_list (item_code, identity_id);

  CREATE INDEX IF NOT EXISTS idx_price_list_version_category
    ON public.price_list (version_id, category_id);

  CREATE INDEX IF NOT EXISTS idx_price_list_version_code_group
    ON public.price_list (version_id, code_group_id);

  CREATE INDEX IF NOT EXISTS idx_price_list_version_active_display_code
    ON public.price_list (version_id, is_active, display_order, item_code);

  CREATE INDEX IF NOT EXISTS idx_price_list_categories_version_display
    ON public.price_list_categories (version_id, display_order);

  CREATE INDEX IF NOT EXISTS idx_catalog_code_groups_version_display
    ON public.catalog_code_groups (version_id, display_order);

  CREATE INDEX IF NOT EXISTS idx_catalog_imports_version_created
    ON public.catalog_imports (version_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_catalog_imports_created_by
    ON public.catalog_imports (created_by);

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_version_created
    ON public.catalog_change_sets (version_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_import
    ON public.catalog_change_sets (import_id);

  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_actor
    ON public.catalog_change_sets (actor_id);

  CREATE INDEX IF NOT EXISTS idx_catalog_change_items_change_set
    ON public.catalog_change_items (change_set_id);

  CREATE INDEX IF NOT EXISTS idx_catalog_change_items_identity_change_set
    ON public.catalog_change_items (identity_id, change_set_id);

  -- ---------------------------------------------------------------------------
  -- 9. Explicit RLS and grants
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.catalog_item_identities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_item_codes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.price_list_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_code_groups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_imports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_change_sets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_change_items ENABLE ROW LEVEL SECURITY;

  REVOKE ALL
    ON TABLE
      public.catalog_item_identities,
      public.catalog_item_codes,
      public.price_list_categories,
      public.catalog_code_groups,
      public.catalog_imports,
      public.catalog_change_sets,
      public.catalog_change_items
    FROM PUBLIC, anon, authenticated;

  GRANT SELECT
    ON TABLE
      public.catalog_item_identities,
      public.catalog_item_codes,
      public.price_list_categories,
      public.catalog_code_groups,
      public.catalog_imports,
      public.catalog_change_sets,
      public.catalog_change_items
    TO authenticated;

  GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE
      public.catalog_item_identities,
      public.catalog_item_codes,
      public.price_list_categories,
      public.catalog_code_groups,
      public.catalog_imports,
      public.catalog_change_sets,
      public.catalog_change_items
    TO service_role;

  DROP POLICY IF EXISTS "catalog_item_identities_select"
    ON public.catalog_item_identities;
  CREATE POLICY "catalog_item_identities_select"
    ON public.catalog_item_identities
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
      OR EXISTS (
        SELECT 1
        FROM public.price_list pl
        JOIN public.price_list_versions v ON v.id = pl.version_id
        WHERE pl.identity_id = catalog_item_identities.id
          AND pl.is_active = true
          AND v.status IN ('active', 'archived')
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
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
      OR EXISTS (
        SELECT 1
        FROM public.price_list_versions v
        WHERE v.id = catalog_item_codes.first_seen_version_id
          AND v.status IN ('active', 'archived')
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
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
      OR EXISTS (
        SELECT 1
        FROM public.price_list_versions v
        WHERE v.id = price_list_categories.version_id
          AND v.status IN ('active', 'archived')
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
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
      OR EXISTS (
        SELECT 1
        FROM public.price_list_versions v
        WHERE v.id = catalog_code_groups.version_id
          AND v.status IN ('active', 'archived')
      )
    );

  DROP POLICY IF EXISTS "catalog_imports_admin_select"
    ON public.catalog_imports;
  CREATE POLICY "catalog_imports_admin_select"
    ON public.catalog_imports
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
    );

  DROP POLICY IF EXISTS "catalog_change_sets_admin_select"
    ON public.catalog_change_sets;
  CREATE POLICY "catalog_change_sets_admin_select"
    ON public.catalog_change_sets
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
    );

  DROP POLICY IF EXISTS "catalog_change_items_admin_select"
    ON public.catalog_change_items;
  CREATE POLICY "catalog_change_items_admin_select"
    ON public.catalog_change_items
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'admin'
          AND p.status = 'active'
      )
    );

  -- ---------------------------------------------------------------------------
  -- 10. Reserve RPC names with rejecting stubs only
  -- ---------------------------------------------------------------------------
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
    PERFORM
      p_base_version_id,
      p_version_major,
      p_version_minor,
      p_version_patch,
      p_name,
      p_reason,
      p_request_id;

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: create_catalog_draft is reserved by migration 017 and disabled until Phase 4 mutation implementation is reviewed';
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
    PERFORM
      p_version_id,
      p_change_payload,
      p_expected_lock_version,
      p_reason,
      p_request_id,
      p_import_id;

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: apply_catalog_changes is reserved by migration 017 and disabled until Phase 4 mutation implementation is reviewed';
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

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: publish_catalog_version is reserved by migration 017 and disabled until Phase 4 publish implementation is reviewed';
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

    RAISE EXCEPTION 'CATALOG_RPC_NOT_IMPLEMENTED: restore_catalog_pointer is reserved by migration 017 and disabled until Phase 4 pointer restore implementation is reviewed';
  END;
  $function$;

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

  -- ---------------------------------------------------------------------------
  -- 11. Foundation postconditions
  -- ---------------------------------------------------------------------------
  DO $phase4_postconditions$
  DECLARE
    v_price_rows integer;
    v_identity_rows integer;
    v_code_rows integer;
    v_missing_identity integer;
    v_nondeterministic_baseline_identity integer;
    v_missing_category integer;
    v_missing_display_order integer;
  BEGIN
    SELECT count(*) INTO v_price_rows FROM public.price_list;
    SELECT count(*) INTO v_identity_rows FROM public.catalog_item_identities;
    SELECT count(*) INTO v_code_rows FROM public.catalog_item_codes;

    SELECT count(*)
    INTO v_missing_identity
    FROM public.price_list
    WHERE identity_id IS NULL;

    SELECT count(*)
    INTO v_nondeterministic_baseline_identity
    FROM public.price_list pl
    JOIN public.price_list_versions v ON v.id = pl.version_id
    WHERE v.version_string = '2568.0.0'
      AND pl.identity_id IS DISTINCT FROM pl.id;

    SELECT count(*)
    INTO v_missing_category
    FROM public.price_list
    WHERE category IS NOT NULL
      AND btrim(category::text) <> ''
      AND category_id IS NULL;

    SELECT count(*)
    INTO v_missing_display_order
    FROM public.price_list
    WHERE display_order IS NULL;

    IF v_missing_identity <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: % price rows lack identity_id',
        v_missing_identity;
    END IF;

    IF v_nondeterministic_baseline_identity <> 0 THEN
      RAISE EXCEPTION
        'P20 deterministic identity postcondition failed: % baseline rows do not use price_list.id as identity_id',
        v_nondeterministic_baseline_identity;
    END IF;

    IF v_missing_category <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: % price rows lack category_id',
        v_missing_category;
    END IF;

    IF v_missing_display_order <> 0 THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: % price rows lack display_order',
        v_missing_display_order;
    END IF;

    IF v_identity_rows < v_price_rows THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: identities % < price rows %',
        v_identity_rows, v_price_rows;
    END IF;

    IF v_code_rows < v_price_rows THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: code registry rows % < price rows %',
        v_code_rows, v_price_rows;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.app_settings
      WHERE key = 'catalog_admin_enabled'
        AND value = 'false'::jsonb
    ) THEN
      RAISE EXCEPTION 'Phase 4 foundation postcondition failed: catalog_admin_enabled is not false';
    END IF;
  END;
  $phase4_postconditions$;
COMMIT;
