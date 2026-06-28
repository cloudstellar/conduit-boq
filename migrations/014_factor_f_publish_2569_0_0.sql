-- =============================================================================
-- Migration 014: Factor F Publish 2569.0.0
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/factor-f/07-f3-2569-owner-review.md
--
-- Purpose:
-- 1. Seed the owner-reviewed W481 Factor F table as version 2569.0.0.
-- 2. Publish 2569.0.0 as an active version and move the default pointer to it.
-- 3. Keep existing BOQs unmodified; this migration must not backfill BOQs.
--
-- Source basis:
-- - Comptroller General Department urgent circular KorKhor 0433.2/W481.
-- - Source/effective date: 2026-06-26.
-- - Road construction table, 0% advance, 0% retention, 6% loan interest,
--   VAT display 7%.
-- - Row-level vat_percent remains 1.0700 to preserve the existing
--   factor_reference row contract; version metadata vat_percent is 7.0000.
--
-- Dataset hash:
--   sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

CREATE TEMP TABLE _factor_f_f3_preflight
ON COMMIT DROP
AS
SELECT count(*) AS bound_boq_count
FROM public.boq
WHERE factor_reference_version_id IS NOT NULL;

CREATE TEMP TABLE _factor_f_2569_rows (
  display_order integer NOT NULL,
  cost_million numeric(10,4) NOT NULL,
  factor numeric(10,4) NOT NULL,
  factor_f numeric(10,4) NOT NULL,
  factor_f_rain_1 numeric(10,4) NOT NULL,
  factor_f_rain_2 numeric(10,4) NOT NULL
) ON COMMIT DROP;

INSERT INTO _factor_f_2569_rows (
  display_order,
  cost_million,
  factor,
  factor_f,
  factor_f_rain_1,
  factor_f_rain_2
) VALUES
  (1, 5, 1.2733, 1.3624, 1.3821, 1.4018),
  (2, 10, 1.2258, 1.3116, 1.3319, 1.3522),
  (3, 20, 1.1713, 1.2532, 1.2715, 1.2897),
  (4, 30, 1.1405, 1.2203, 1.2367, 1.2531),
  (5, 40, 1.1343, 1.2137, 1.2316, 1.2495),
  (6, 50, 1.1294, 1.2084, 1.2264, 1.2445),
  (7, 60, 1.1237, 1.2023, 1.2203, 1.2382),
  (8, 70, 1.1184, 1.1966, 1.2150, 1.2334),
  (9, 80, 1.1152, 1.1932, 1.2117, 1.2301),
  (10, 90, 1.1097, 1.1873, 1.2052, 1.2230),
  (11, 100, 1.1066, 1.1840, 1.2015, 1.2190),
  (12, 110, 1.0979, 1.1747, 1.1918, 1.2089),
  (13, 120, 1.0972, 1.1740, 1.1913, 1.2086),
  (14, 130, 1.0944, 1.1710, 1.1880, 1.2050),
  (15, 140, 1.0932, 1.1697, 1.1868, 1.2040),
  (16, 150, 1.0918, 1.1682, 1.1852, 1.2021),
  (17, 160, 1.0908, 1.1671, 1.1842, 1.2013),
  (18, 170, 1.0900, 1.1663, 1.1833, 1.2003),
  (19, 180, 1.0894, 1.1656, 1.1825, 1.1995),
  (20, 190, 1.0875, 1.1636, 1.1815, 1.1994),
  (21, 200, 1.0874, 1.1635, 1.1814, 1.1992),
  (22, 210, 1.0867, 1.1627, 1.1808, 1.1988),
  (23, 220, 1.0856, 1.1615, 1.1794, 1.1973),
  (24, 230, 1.0848, 1.1607, 1.1784, 1.1962),
  (25, 240, 1.0836, 1.1594, 1.1770, 1.1945),
  (26, 250, 1.0825, 1.1582, 1.1756, 1.1930),
  (27, 260, 1.0815, 1.1572, 1.1744, 1.1916),
  (28, 270, 1.0805, 1.1561, 1.1732, 1.1903),
  (29, 280, 1.0797, 1.1552, 1.1722, 1.1891),
  (30, 290, 1.0789, 1.1544, 1.1712, 1.1880),
  (31, 300, 1.0781, 1.1535, 1.1702, 1.1869),
  (32, 350, 1.0777, 1.1531, 1.1697, 1.1864),
  (33, 400, 1.0764, 1.1517, 1.1685, 1.1854),
  (34, 450, 1.0762, 1.1515, 1.1683, 1.1851),
  (35, 500, 1.0751, 1.1503, 1.1671, 1.1839),
  (36, 700, 1.0727, 1.1477, 1.1641, 1.1805);

-- -----------------------------------------------------------------------------
-- 1. Fail closed unless F1/F2 are ready and the source dataset is unchanged.
-- -----------------------------------------------------------------------------
DO $preflight$
DECLARE
  v_row_count integer;
  v_duplicate_thresholds integer;
  v_duplicate_display_orders integer;
  v_invalid_rows integer;
  v_dataset_hash text;
  v_expected_hash constant text :=
    'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6';
BEGIN
  IF to_regclass('public.factor_reference_versions') IS NULL
    OR to_regclass('public.factor_reference_rows') IS NULL
    OR to_regclass('public.factor_reference_default_version') IS NULL THEN
    RAISE EXCEPTION 'F3 blocked: Factor F version foundation tables are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'boq'
      AND column_name = 'factor_reference_version_id'
  ) THEN
    RAISE EXCEPTION 'F3 blocked: boq.factor_reference_version_id is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_versions
    WHERE version_string = '2566.0.0'
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'F3 blocked: active Factor F baseline 2566.0.0 is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_default_version dv
    JOIN public.factor_reference_versions v ON v.id = dv.version_id
    WHERE dv.id = true
      AND v.version_string = '2566.0.0'
      AND v.status = 'active'
  ) THEN
    RAISE EXCEPTION 'F3 blocked: default pointer is not on active 2566.0.0 before publication';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.factor_reference_versions
    WHERE major = 2569
      AND minor = 0
      AND patch = 0
  ) THEN
    RAISE EXCEPTION 'F3 blocked: Factor F version 2569.0.0 already exists';
  END IF;

  SELECT count(*)
  INTO v_row_count
  FROM _factor_f_2569_rows;

  SELECT count(*)
  INTO v_duplicate_thresholds
  FROM (
    SELECT cost_million
    FROM _factor_f_2569_rows
    GROUP BY cost_million
    HAVING count(*) > 1
  ) duplicates;

  SELECT count(*)
  INTO v_duplicate_display_orders
  FROM (
    SELECT display_order
    FROM _factor_f_2569_rows
    GROUP BY display_order
    HAVING count(*) > 1
  ) duplicates;

  SELECT count(*)
  INTO v_invalid_rows
  FROM _factor_f_2569_rows
  WHERE display_order <= 0
    OR cost_million <= 0
    OR factor <= 0
    OR factor_f <= 0
    OR factor_f_rain_1 <= 0
    OR factor_f_rain_2 <= 0;

  WITH ordered_rows AS (
    SELECT jsonb_build_object(
      'cost_million', cost_million::text,
      'operation_percent', NULL,
      'interest_percent', NULL,
      'profit_percent', NULL,
      'total_expense_percent', NULL,
      'factor', factor::text,
      'vat_percent', 1.0700::numeric(10,4)::text,
      'factor_f', factor_f::text,
      'factor_f_rain_1', factor_f_rain_1::text,
      'factor_f_rain_2', factor_f_rain_2::text
    ) AS row_payload
    FROM _factor_f_2569_rows
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

  IF v_row_count <> 36 THEN
    RAISE EXCEPTION 'F3 blocked: expected 36 W481 Factor F rows, found %',
      v_row_count;
  END IF;

  IF v_duplicate_thresholds <> 0 THEN
    RAISE EXCEPTION 'F3 blocked: % duplicate cost_million thresholds found',
      v_duplicate_thresholds;
  END IF;

  IF v_duplicate_display_orders <> 0 THEN
    RAISE EXCEPTION 'F3 blocked: % duplicate display_order values found',
      v_duplicate_display_orders;
  END IF;

  IF v_invalid_rows <> 0 THEN
    RAISE EXCEPTION 'F3 blocked: % invalid W481 Factor F rows found',
      v_invalid_rows;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM _factor_f_2569_rows
    WHERE cost_million = 600
  ) THEN
    RAISE EXCEPTION 'F3 blocked: W481 source review approved no 600M row, but one is present';
  END IF;

  IF v_dataset_hash IS DISTINCT FROM v_expected_hash THEN
    RAISE EXCEPTION 'F3 blocked: W481 Factor F hash mismatch. expected %, got %',
      v_expected_hash,
      v_dataset_hash;
  END IF;
END;
$preflight$;

-- -----------------------------------------------------------------------------
-- 2. Insert W481 metadata as draft first, then insert rows while mutable.
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
  dataset_hash,
  based_on_version_id
) SELECT
  2569,
  0,
  0,
  'CGD Factor F road construction 6 percent W481 (2569.0.0)',
  'draft',
  DATE '2026-06-26',
  DATE '2026-06-26',
  'Comptroller General Department Factor F road construction table, urgent circular KorKhor 0433.2/W481 dated 2026-06-26; local review copies W481 PDF and factorF_26มิย69.jpg.',
  'Owner approved W481 source, version identity 2569.0.0, 0% advance, 0% retention, 6% loan interest, 7% VAT display, 36 rows, no 600M row, and row vat_percent=1.0700 compatibility contract on 2026-06-28.',
  0,
  0,
  6,
  7,
  'Owner',
  36,
  'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6',
  baseline.id
FROM public.factor_reference_versions baseline
WHERE baseline.version_string = '2566.0.0'
  AND baseline.status = 'active';

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
  source_rows.display_order,
  source_rows.cost_million,
  NULL::numeric(10,4) AS operation_percent,
  NULL::numeric(10,4) AS interest_percent,
  NULL::numeric(10,4) AS profit_percent,
  NULL::numeric(10,4) AS total_expense_percent,
  source_rows.factor,
  1.0700::numeric(10,4) AS vat_percent,
  source_rows.factor_f,
  source_rows.factor_f_rain_1,
  source_rows.factor_f_rain_2
FROM _factor_f_2569_rows source_rows
CROSS JOIN public.factor_reference_versions v
WHERE v.version_string = '2569.0.0'
ORDER BY source_rows.display_order;

-- -----------------------------------------------------------------------------
-- 3. Publish W481 and point the singleton default at 2569.0.0.
-- -----------------------------------------------------------------------------
UPDATE public.factor_reference_versions
SET
  status = 'active',
  approved_at = now(),
  published_at = now(),
  published_by_display_name = 'Migration 014',
  updated_at = now()
WHERE version_string = '2569.0.0'
  AND status = 'draft';

INSERT INTO public.factor_reference_default_version (id, version_id)
SELECT true, id
FROM public.factor_reference_versions
WHERE version_string = '2569.0.0'
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
    'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6';
BEGIN
  SELECT id
  INTO v_version_id
  FROM public.factor_reference_versions
  WHERE version_string = '2569.0.0'
    AND status = 'active';

  IF v_version_id IS NULL THEN
    RAISE EXCEPTION 'F3 postcondition failed: active 2569.0.0 version missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_default_version
    WHERE id = true
      AND version_id = v_version_id
  ) THEN
    RAISE EXCEPTION 'F3 postcondition failed: default pointer does not reference 2569.0.0';
  END IF;

  SELECT count(*)
  INTO v_row_count
  FROM public.factor_reference_rows
  WHERE version_id = v_version_id;

  IF v_row_count <> 36 THEN
    RAISE EXCEPTION 'F3 postcondition failed: expected 36 seeded rows, found %',
      v_row_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.factor_reference_rows
    WHERE version_id = v_version_id
      AND cost_million = 600
  ) THEN
    RAISE EXCEPTION 'F3 postcondition failed: 2569.0.0 unexpectedly contains a 600M row';
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
    RAISE EXCEPTION 'F3 postcondition failed: seeded row hash mismatch. expected %, got %',
      v_expected_hash,
      v_dataset_hash;
  END IF;

  SELECT bound_boq_count
  INTO v_bound_boq_before
  FROM _factor_f_f3_preflight;

  SELECT count(*)
  INTO v_bound_boq_after
  FROM public.boq
  WHERE factor_reference_version_id IS NOT NULL;

  IF v_bound_boq_after <> v_bound_boq_before THEN
    RAISE EXCEPTION 'F3 postcondition failed: BOQ factor version bindings changed from % to %',
      v_bound_boq_before,
      v_bound_boq_after;
  END IF;
END;
$postconditions$;

COMMIT;
