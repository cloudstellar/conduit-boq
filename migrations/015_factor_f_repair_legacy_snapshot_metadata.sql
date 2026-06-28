-- =============================================================================
-- Migration 015: Factor F Repair Legacy Snapshot Metadata
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/factor-f/08-production-inventory-readiness.md
--
-- Purpose:
-- 1. Repair missing Factor F snapshot metadata for legacy BOQs whose saved
--    factor_f exactly matches the audited 2566.0.0 baseline.
-- 2. Preserve legacy semantics: do not bind old BOQs to a Factor F version.
-- 3. Preserve prices and totals: do not change factor_f, route rows, item rows,
--    total_with_factor_f, or total_with_vat.
--
-- This is not a reprice and not a backfill to the latest Factor F version.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

-- -----------------------------------------------------------------------------
-- 1. Fail closed unless the Factor F version tables and 2566 baseline are ready.
-- -----------------------------------------------------------------------------
DO $preflight$
DECLARE
  v_2566_version_id uuid;
  v_2569_default_id uuid;
  v_row_count integer;
  v_dataset_hash text;
  v_expected_hash constant text :=
    'sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61';
BEGIN
  IF to_regclass('public.factor_reference_versions') IS NULL
    OR to_regclass('public.factor_reference_rows') IS NULL
    OR to_regclass('public.factor_reference_default_version') IS NULL THEN
    RAISE EXCEPTION 'F4 repair blocked: Factor F version foundation tables are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'boq'
      AND column_name = 'factor_reference_version_id'
  ) THEN
    RAISE EXCEPTION 'F4 repair blocked: boq.factor_reference_version_id is missing';
  END IF;

  SELECT id
  INTO v_2566_version_id
  FROM public.factor_reference_versions
  WHERE version_string = '2566.0.0'
    AND status = 'active';

  IF v_2566_version_id IS NULL THEN
    RAISE EXCEPTION 'F4 repair blocked: active Factor F baseline 2566.0.0 is missing';
  END IF;

  SELECT dv.version_id
  INTO v_2569_default_id
  FROM public.factor_reference_default_version dv
  JOIN public.factor_reference_versions v ON v.id = dv.version_id
  WHERE dv.id = true
    AND v.version_string = '2569.0.0'
    AND v.status = 'active';

  IF v_2569_default_id IS NULL THEN
    RAISE EXCEPTION 'F4 repair blocked: default pointer is not on active 2569.0.0; run 014 first';
  END IF;

  SELECT count(*)
  INTO v_row_count
  FROM public.factor_reference_rows
  WHERE version_id = v_2566_version_id;

  IF v_row_count <> 37 THEN
    RAISE EXCEPTION 'F4 repair blocked: expected 37 rows for 2566.0.0, found %',
      v_row_count;
  END IF;

  WITH ordered_rows AS (
    SELECT jsonb_build_object(
      'cost_million', cost_million::text,
      'operation_percent', operation_percent::text,
      'interest_percent', interest_percent::text,
      'profit_percent', profit_percent::text,
      'total_expense_percent', total_expense_percent::text,
      'factor', factor::text,
      'vat_percent', vat_percent::text,
      'factor_f', factor_f::text,
      'factor_f_rain_1', factor_f_rain_1::text,
      'factor_f_rain_2', factor_f_rain_2::text
    ) AS row_payload
    FROM public.factor_reference_rows
    WHERE version_id = v_2566_version_id
    ORDER BY cost_million
  ),
  canonical AS (
    SELECT jsonb_agg(row_payload)::text AS payload
    FROM ordered_rows
  )
  SELECT 'sha256:' ||
    encode(pg_catalog.sha256(convert_to(payload, 'UTF8')), 'hex')
  INTO v_dataset_hash
  FROM canonical;

  IF v_dataset_hash IS DISTINCT FROM v_expected_hash THEN
    RAISE EXCEPTION 'F4 repair blocked: 2566.0.0 hash mismatch. expected %, got %',
      v_expected_hash,
      v_dataset_hash;
  END IF;
END;
$preflight$;

-- -----------------------------------------------------------------------------
-- 2. Build a deterministic repair source from 2566.0.0.
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE _factor_f_015_repair_source
ON COMMIT DROP
AS
WITH baseline AS (
  SELECT id
  FROM public.factor_reference_versions
  WHERE version_string = '2566.0.0'
    AND status = 'active'
),
candidates AS (
  SELECT
    b.id,
    b.total_cost,
    b.factor_f AS saved_factor_f,
    b.factor_f_raw AS existing_factor_f_raw,
    b.factor_f_lower_cost AS existing_lower_cost,
    b.factor_f_upper_cost AS existing_upper_cost,
    b.factor_f_lower_value AS existing_lower_value,
    b.factor_f_upper_value AS existing_upper_value
  FROM public.boq b
  WHERE b.factor_reference_version_id IS NULL
    AND b.factor_f IS NOT NULL
    AND COALESCE(b.total_cost, 0) > 0
    AND (
      b.factor_f_raw IS NULL
      OR b.factor_f_lower_cost IS NULL
      OR b.factor_f_upper_cost IS NULL
      OR b.factor_f_lower_value IS NULL
      OR b.factor_f_upper_value IS NULL
    )
),
calculated AS (
  SELECT
    c.id,
    c.total_cost,
    c.saved_factor_f,
    c.existing_factor_f_raw,
    c.existing_lower_cost,
    c.existing_upper_cost,
    c.existing_lower_value,
    c.existing_upper_value,
    lower_ref.cost_million AS lower_cost_million,
    lower_ref.factor AS lower_factor,
    CASE
      WHEN upper_ref.cost_million IS NULL
        OR (c.total_cost / 1000000.0) <= lower_ref.cost_million THEN lower_ref.cost_million
      ELSE upper_ref.cost_million
    END AS upper_cost_million,
    CASE
      WHEN upper_ref.cost_million IS NULL
        OR (c.total_cost / 1000000.0) <= lower_ref.cost_million THEN lower_ref.factor
      ELSE upper_ref.factor
    END AS upper_factor,
    CASE
      WHEN lower_ref.cost_million IS NULL THEN NULL::numeric
      WHEN upper_ref.cost_million IS NULL
        OR (c.total_cost / 1000000.0) <= lower_ref.cost_million THEN lower_ref.factor
      ELSE lower_ref.factor - (
        (lower_ref.factor - upper_ref.factor)
        * ((c.total_cost / 1000000.0) - lower_ref.cost_million)
        / (upper_ref.cost_million - lower_ref.cost_million)
      )
    END AS expected_raw_factor
  FROM candidates c
  CROSS JOIN baseline
  LEFT JOIN LATERAL (
    SELECT r.cost_million, r.factor
    FROM public.factor_reference_rows r
    WHERE r.version_id = baseline.id
      AND r.cost_million <= greatest(5::numeric, c.total_cost / 1000000.0)
    ORDER BY r.cost_million DESC
    LIMIT 1
  ) lower_ref ON true
  LEFT JOIN LATERAL (
    SELECT r.cost_million, r.factor
    FROM public.factor_reference_rows r
    WHERE r.version_id = baseline.id
      AND r.cost_million > (c.total_cost / 1000000.0)
    ORDER BY r.cost_million ASC
    LIMIT 1
  ) upper_ref ON true
)
SELECT
  id,
  total_cost,
  saved_factor_f,
  expected_raw_factor AS repair_factor_f_raw,
  lower_cost_million * 1000000 AS repair_lower_cost,
  upper_cost_million * 1000000 AS repair_upper_cost,
  lower_factor AS repair_lower_value,
  upper_factor AS repair_upper_value,
  trunc(expected_raw_factor, 4) AS expected_factor_f,
  expected_raw_factor IS NULL AS cannot_calculate,
  saved_factor_f IS DISTINCT FROM trunc(expected_raw_factor, 4) AS saved_factor_mismatch,
  (
    (existing_factor_f_raw IS NOT NULL AND existing_factor_f_raw IS DISTINCT FROM expected_raw_factor)
    OR (existing_lower_cost IS NOT NULL AND existing_lower_cost IS DISTINCT FROM lower_cost_million * 1000000)
    OR (existing_upper_cost IS NOT NULL AND existing_upper_cost IS DISTINCT FROM upper_cost_million * 1000000)
    OR (existing_lower_value IS NOT NULL AND existing_lower_value IS DISTINCT FROM lower_factor)
    OR (existing_upper_value IS NOT NULL AND existing_upper_value IS DISTINCT FROM upper_factor)
  ) AS existing_metadata_mismatch
FROM calculated;

-- -----------------------------------------------------------------------------
-- 3. Abort if any candidate cannot be proven equivalent to 2566.0.0.
-- -----------------------------------------------------------------------------
DO $validate_repair_source$
DECLARE
  v_candidate_count integer;
  v_cannot_calculate_count integer;
  v_saved_factor_mismatch_count integer;
  v_existing_metadata_mismatch_count integer;
BEGIN
  SELECT count(*)
  INTO v_candidate_count
  FROM _factor_f_015_repair_source;

  SELECT count(*)
  INTO v_cannot_calculate_count
  FROM _factor_f_015_repair_source
  WHERE cannot_calculate;

  SELECT count(*)
  INTO v_saved_factor_mismatch_count
  FROM _factor_f_015_repair_source
  WHERE saved_factor_mismatch;

  SELECT count(*)
  INTO v_existing_metadata_mismatch_count
  FROM _factor_f_015_repair_source
  WHERE existing_metadata_mismatch;

  IF v_cannot_calculate_count <> 0 THEN
    RAISE EXCEPTION 'F4 repair blocked: % legacy BOQs cannot be recalculated from 2566.0.0',
      v_cannot_calculate_count;
  END IF;

  IF v_saved_factor_mismatch_count <> 0 THEN
    RAISE EXCEPTION 'F4 repair blocked: % legacy BOQs have factor_f values that do not match 2566.0.0',
      v_saved_factor_mismatch_count;
  END IF;

  IF v_existing_metadata_mismatch_count <> 0 THEN
    RAISE EXCEPTION 'F4 repair blocked: % legacy BOQs have existing metadata that conflicts with 2566.0.0',
      v_existing_metadata_mismatch_count;
  END IF;

  RAISE NOTICE 'F4 repair candidates: %', v_candidate_count;
END;
$validate_repair_source$;

-- -----------------------------------------------------------------------------
-- 4. Fill only missing metadata fields; do not change Factor F, totals, or version.
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE _factor_f_015_repaired_ids
ON COMMIT DROP
AS
WITH updated AS (
  UPDATE public.boq b
  SET
    factor_f_raw = COALESCE(b.factor_f_raw, repair.repair_factor_f_raw),
    factor_f_lower_cost = COALESCE(b.factor_f_lower_cost, repair.repair_lower_cost),
    factor_f_upper_cost = COALESCE(b.factor_f_upper_cost, repair.repair_upper_cost),
    factor_f_lower_value = COALESCE(b.factor_f_lower_value, repair.repair_lower_value),
    factor_f_upper_value = COALESCE(b.factor_f_upper_value, repair.repair_upper_value)
  FROM _factor_f_015_repair_source repair
  WHERE b.id = repair.id
    AND NOT repair.cannot_calculate
    AND NOT repair.saved_factor_mismatch
    AND NOT repair.existing_metadata_mismatch
  RETURNING b.id
)
SELECT id
FROM updated;

-- -----------------------------------------------------------------------------
-- 5. Postconditions: no version backfill and all selected rows have metadata.
-- -----------------------------------------------------------------------------
DO $postconditions$
DECLARE
  v_candidate_count integer;
  v_updated_count integer;
  v_still_partial_count integer;
  v_bound_after_count integer;
BEGIN
  SELECT count(*)
  INTO v_candidate_count
  FROM _factor_f_015_repair_source;

  SELECT count(*)
  INTO v_updated_count
  FROM _factor_f_015_repaired_ids;

  IF v_updated_count <> v_candidate_count THEN
    RAISE EXCEPTION 'F4 repair postcondition failed: expected % repaired rows, updated %',
      v_candidate_count,
      v_updated_count;
  END IF;

  SELECT count(*)
  INTO v_still_partial_count
  FROM public.boq b
  JOIN _factor_f_015_repair_source repair ON repair.id = b.id
  WHERE b.factor_f_raw IS NULL
    OR b.factor_f_lower_cost IS NULL
    OR b.factor_f_upper_cost IS NULL
    OR b.factor_f_lower_value IS NULL
    OR b.factor_f_upper_value IS NULL;

  IF v_still_partial_count <> 0 THEN
    RAISE EXCEPTION 'F4 repair postcondition failed: % repaired BOQs still have partial metadata',
      v_still_partial_count;
  END IF;

  SELECT count(*)
  INTO v_bound_after_count
  FROM public.boq b
  JOIN _factor_f_015_repair_source repair ON repair.id = b.id
  WHERE b.factor_reference_version_id IS NOT NULL;

  IF v_bound_after_count <> 0 THEN
    RAISE EXCEPTION 'F4 repair postcondition failed: % repaired legacy BOQs were bound to a Factor F version',
      v_bound_after_count;
  END IF;
END;
$postconditions$;

COMMIT;
