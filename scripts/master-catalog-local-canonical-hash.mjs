#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { canonicalizeCatalogDatasetRows, hashCanonicalCatalogDatasetRows } from '../lib/master-catalog/hash/canonicalDataset.ts'

const DB_CONTAINER = process.env.MASTER_CATALOG_LOCAL_DB_CONTAINER ?? 'supabase_db_conduit-boq-local'

const CATALOG_SQL = String.raw`
WITH default_version AS (
  SELECT
    v.id,
    v.version_string,
    v.status,
    v.item_count,
    v.dataset_hash,
    v.published_at
  FROM public.price_list_default_version dv
  JOIN public.price_list_versions v ON v.id = dv.version_id
  WHERE dv.id = true
),
rows AS (
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
    pl.display_order
  FROM public.price_list pl
  JOIN default_version dv ON dv.id = pl.version_id
  LEFT JOIN public.price_list_categories c
    ON c.version_id = pl.version_id
   AND c.id = pl.category_id
  LEFT JOIN public.catalog_code_groups cg
    ON cg.version_id = pl.version_id
   AND cg.id = pl.code_group_id
)
SELECT json_build_object(
  'version', (
    SELECT json_build_object(
      'id', id::text,
      'version_string', version_string,
      'status', status,
      'item_count', item_count,
      'dataset_hash', dataset_hash,
      'published_at', published_at
    )
    FROM default_version
  ),
  'quality', (
    SELECT json_build_object(
      'row_count', count(*),
      'distinct_item_codes', count(DISTINCT item_code),
      'active_rows', count(*) FILTER (WHERE is_active = true),
      'inactive_rows', count(*) FILTER (WHERE is_active = false),
      'missing_identity_id', count(*) FILTER (WHERE identity_id IS NULL),
      'missing_category_code', count(*) FILTER (WHERE category_code IS NULL),
      'missing_display_order', count(*) FILTER (WHERE display_order IS NULL),
      'missing_required_text', count(*) FILTER (
        WHERE item_code IS NULL OR btrim(item_code) = ''
           OR item_name IS NULL OR btrim(item_name) = ''
           OR unit IS NULL OR btrim(unit) = ''
      ),
      'missing_money', count(*) FILTER (
        WHERE material_cost IS NULL OR labor_cost IS NULL OR unit_cost IS NULL
      ),
      'cost_mismatches', count(*) FILTER (
        WHERE (material_cost::numeric + labor_cost::numeric) <> unit_cost::numeric
      )
    )
    FROM rows
  ),
  'rows', (
    SELECT COALESCE(
      json_agg(
        json_build_object(
          'identity_id', identity_id,
          'item_code', item_code,
          'item_name', item_name,
          'unit', unit,
          'material_cost', material_cost,
          'labor_cost', labor_cost,
          'unit_cost', unit_cost,
          'category_code', category_code,
          'category_name', category_name,
          'work_context_code', work_context_code,
          'work_context_name_th', work_context_name_th,
          'item_type_code', item_type_code,
          'item_type_name_th', item_type_name_th,
          'is_active', is_active,
          'display_order', display_order
        )
        ORDER BY item_code, identity_id
      ),
      '[]'::json
    )
    FROM rows
  )
);
`

function queryLocalCatalogSnapshot() {
  const result = spawnSync('docker', [
    'exec',
    DB_CONTAINER,
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-tA',
    '-c',
    CATALOG_SQL,
  ], {
    encoding: 'utf8',
    maxBuffer: 25 * 1024 * 1024,
  })

  if (result.status !== 0) {
    throw new Error([
      'Failed to query Local Supabase catalog snapshot.',
      `Container: ${DB_CONTAINER}`,
      result.stderr.trim(),
    ].filter(Boolean).join('\n'))
  }

  return JSON.parse(result.stdout.trim())
}

function assertQuality(snapshot) {
  const { version, quality, rows } = snapshot
  const failures = []

  if (version?.version_string !== '2568.0.0') {
    failures.push(`default version is ${version?.version_string ?? 'missing'}, expected 2568.0.0`)
  }

  if (version?.status !== 'active') {
    failures.push(`default version status is ${version?.status ?? 'missing'}, expected active`)
  }

  if (quality.row_count !== 710) {
    failures.push(`row_count is ${quality.row_count}, expected Production authority count 710`)
  }

  if (quality.distinct_item_codes !== quality.row_count) {
    failures.push(`distinct_item_codes ${quality.distinct_item_codes} does not equal row_count ${quality.row_count}`)
  }

  for (const field of [
    'missing_identity_id',
    'missing_category_code',
    'missing_display_order',
    'missing_required_text',
    'missing_money',
    'cost_mismatches',
  ]) {
    if (quality[field] !== 0) {
      failures.push(`${field} is ${quality[field]}, expected 0`)
    }
  }

  if (!Array.isArray(rows) || rows.length !== quality.row_count) {
    failures.push(`rows array length ${Array.isArray(rows) ? rows.length : 'missing'} does not equal row_count ${quality.row_count}`)
  }

  if (failures.length > 0) {
    throw new Error(`Catalog canonical snapshot quality failed:\n- ${failures.join('\n- ')}`)
  }
}

async function buildEvidence() {
  const first = queryLocalCatalogSnapshot()
  const second = queryLocalCatalogSnapshot()

  assertQuality(first)
  assertQuality(second)

  const firstCanonicalJson = canonicalizeCatalogDatasetRows(first.rows)
  const secondCanonicalJson = canonicalizeCatalogDatasetRows(second.rows)
  const firstHash = await hashCanonicalCatalogDatasetRows(first.rows)
  const secondHash = await hashCanonicalCatalogDatasetRows(second.rows)

  if (firstCanonicalJson !== secondCanonicalJson || firstHash !== secondHash) {
    throw new Error('Catalog canonical hash is not stable across repeat Local DB reads')
  }

  return {
    source:
      'Local Supabase restored from production-derived public snapshot plus root migrations 009-015, hotfix 016, and Phase 4 017-021',
    productionAuthorityVersion: '2568.0.0',
    localDbContainer: DB_CONTAINER,
    version: first.version,
    quality: first.quality,
    canonicalHash: firstHash,
    canonicalJsonBytes: Buffer.byteLength(firstCanonicalJson, 'utf8'),
    repeatHashMatched: true,
    productionTouched: false,
  }
}

buildEvidence()
  .then((evidence) => {
    console.log(JSON.stringify(evidence, null, 2))
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
