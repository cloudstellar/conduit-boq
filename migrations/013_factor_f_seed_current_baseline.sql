-- =============================================================================
-- Migration 013: Factor F Seed Current Baseline
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/factor-f/06-f2-current-baseline-runbook.md
--
-- Purpose:
-- 1. Seed the currently deployed public.factor_reference table as version 2566.0.0.
-- 2. Move factor_reference_default_version to that audited baseline.
-- 3. Keep legacy BOQs unmodified; this migration must not backfill BOQs.
--
-- Production baseline audit used for this migration:
-- - row_count: 37
-- - duplicate cost thresholds: 0
-- - invalid required rows: 0
-- - dataset_hash:
--   sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61
--
-- The baseline version identity is owner-approved as 2566.0.0. The source is
-- the Comptroller General Department 7% Factor F source PDF from 2023-08-24,
-- circulated by KorKhor 0433.2/W499 on 2023-08-28.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

CREATE TEMP TABLE _factor_f_f2_preflight
ON COMMIT DROP
AS
SELECT count(*) AS bound_boq_count
FROM public.boq
WHERE factor_reference_version_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 1. Fail closed unless the F1 foundation and source baseline are exactly ready.
-- -----------------------------------------------------------------------------
DO $preflight$
DECLARE
  v_row_count integer;
  v_duplicate_thresholds integer;
  v_invalid_rows integer;
  v_dataset_hash text;
  v_expected_hash constant text :=
    'sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61';
BEGIN
  IF to_regclass('public.factor_reference_versions') IS NULL
    OR to_regclass('public.factor_reference_rows') IS NULL
    OR to_regclass('public.factor_reference_default_version') IS NULL THEN
    RAISE EXCEPTION 'F2 blocked: Factor F version foundation tables are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'boq'
      AND column_name = 'factor_reference_version_id'
  ) THEN
    RAISE EXCEPTION 'F2 blocked: boq.factor_reference_version_id is missing';
  END IF;

  SELECT count(*)
  INTO v_row_count
  FROM public.factor_reference;

  SELECT count(*)
  INTO v_duplicate_thresholds
  FROM (
    SELECT cost_million
    FROM public.factor_reference
    GROUP BY cost_million
    HAVING count(*) > 1
  ) duplicates;

  SELECT count(*)
  INTO v_invalid_rows
  FROM public.factor_reference
  WHERE cost_million <= 0
    OR factor <= 0
    OR vat_percent < 0
    OR factor_f <= 0
    OR factor_f_rain_1 <= 0
    OR factor_f_rain_2 <= 0;

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
    FROM public.factor_reference
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

  IF v_row_count <> 37 THEN
    RAISE EXCEPTION 'F2 blocked: expected 37 Factor F rows, found %',
      v_row_count;
  END IF;

  IF v_duplicate_thresholds <> 0 THEN
    RAISE EXCEPTION 'F2 blocked: % duplicate cost_million thresholds found',
      v_duplicate_thresholds;
  END IF;

  IF v_invalid_rows <> 0 THEN
    RAISE EXCEPTION 'F2 blocked: % invalid Factor F rows found',
      v_invalid_rows;
  END IF;

  IF v_dataset_hash IS DISTINCT FROM v_expected_hash THEN
    RAISE EXCEPTION 'F2 blocked: Factor F baseline hash mismatch. expected %, got %',
      v_expected_hash,
      v_dataset_hash;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.factor_reference_versions
    WHERE major = 2566
      AND minor = 0
      AND patch = 0
  ) THEN
    RAISE EXCEPTION 'F2 blocked: Factor F version 2566.0.0 already exists';
  END IF;
END;
$preflight$;

-- -----------------------------------------------------------------------------
-- 2. Insert baseline metadata as draft first, then copy rows while mutable.
-- -----------------------------------------------------------------------------
INSERT INTO public.factor_reference_versions (
  major,
  minor,
  patch,
  name,
  status,
  effective_date,
  source_document_date,
  source_reference,
  approval_reference,
  advance_payment_percent,
  retention_percent,
  loan_interest_percent,
  vat_percent,
  approved_by_display_name,
  row_count,
  dataset_hash
) VALUES (
  2566,
  0,
  0,
  'CGD Factor F road construction 7 percent baseline (2566.0.0)',
  'draft',
  DATE '2023-08-24',
  DATE '2023-08-24',
  'Comptroller General Department Factor F road construction table, announcement dated 2023-08-24, circulated by KorKhor 0433.2/W499 dated 2023-08-28; local review copy FACTOR F 2566_7.PDF.',
  'Owner confirmed FACTOR F 2566_7.PDF as the current baseline source and approved version identity 2566.0.0 on 2026-06-28 before publishing Factor F 2569.0.0.',
  0,
  0,
  7,
  7,
  'Owner',
  37,
  'sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61'
);

INSERT INTO public.factor_reference_rows (
  version_id,
  display_order,
  cost_million,
  operation_percent,
  interest_percent,
  profit_percent,
  total_expense_percent,
  factor,
  vat_percent,
  factor_f,
  factor_f_rain_1,
  factor_f_rain_2
)
SELECT
  v.id,
  row_number() OVER (ORDER BY fr.cost_million)::integer AS display_order,
  fr.cost_million,
  fr.operation_percent,
  fr.interest_percent,
  fr.profit_percent,
  fr.total_expense_percent,
  fr.factor,
  fr.vat_percent,
  fr.factor_f,
  fr.factor_f_rain_1,
  fr.factor_f_rain_2
FROM public.factor_reference fr
CROSS JOIN public.factor_reference_versions v
WHERE v.version_string = '2566.0.0'
ORDER BY fr.cost_million;

-- -----------------------------------------------------------------------------
-- 3. Publish the baseline and point the singleton default at it.
-- -----------------------------------------------------------------------------
UPDATE public.factor_reference_versions
SET
  status = 'active',
  approved_at = now(),
  published_at = now(),
  published_by_display_name = 'Migration 013',
  updated_at = now()
WHERE version_string = '2566.0.0'
  AND status = 'draft';

INSERT INTO public.factor_reference_default_version (id, version_id)
SELECT true, id
FROM public.factor_reference_versions
WHERE version_string = '2566.0.0'
  AND status = 'active'
ON CONFLICT (id) DO UPDATE
SET version_id = excluded.version_id;

-- -----------------------------------------------------------------------------
-- 4. Postconditions: row count, pointer, hash, and no BOQ backfill.
-- -----------------------------------------------------------------------------
DO $postconditions$
DECLARE
  v_version_id uuid;
  v_row_count integer;
  v_dataset_hash text;
  v_bound_boq_before bigint;
  v_bound_boq_after bigint;
  v_expected_hash constant text :=
    'sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61';
BEGIN
  SELECT id
  INTO v_version_id
  FROM public.factor_reference_versions
  WHERE version_string = '2566.0.0'
    AND status = 'active';

  IF v_version_id IS NULL THEN
    RAISE EXCEPTION 'F2 postcondition failed: active 2566.0.0 version missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_default_version
    WHERE id = true
      AND version_id = v_version_id
  ) THEN
    RAISE EXCEPTION 'F2 postcondition failed: default pointer does not reference 2566.0.0';
  END IF;

  SELECT count(*)
  INTO v_row_count
  FROM public.factor_reference_rows
  WHERE version_id = v_version_id;

  IF v_row_count <> 37 THEN
    RAISE EXCEPTION 'F2 postcondition failed: expected 37 seeded rows, found %',
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
    WHERE version_id = v_version_id
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
    RAISE EXCEPTION 'F2 postcondition failed: seeded row hash mismatch. expected %, got %',
      v_expected_hash,
      v_dataset_hash;
  END IF;

  SELECT bound_boq_count
  INTO v_bound_boq_before
  FROM _factor_f_f2_preflight;

  SELECT count(*)
  INTO v_bound_boq_after
  FROM public.boq
  WHERE factor_reference_version_id IS NOT NULL;

  IF v_bound_boq_after <> v_bound_boq_before THEN
    RAISE EXCEPTION 'F2 postcondition failed: BOQ factor version bindings changed from % to %',
      v_bound_boq_before,
      v_bound_boq_after;
  END IF;
END;
$postconditions$;

COMMIT;
