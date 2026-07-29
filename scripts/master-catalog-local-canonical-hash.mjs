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
  'schema', json_build_object(
    'phase4_global_function_default_acl', EXISTS (
      SELECT 1
      FROM pg_catalog.pg_default_acl default_acl
      WHERE default_acl.defaclrole = to_regrole('postgres')
        AND default_acl.defaclnamespace = 0
        AND default_acl.defaclobjtype = 'f'
        AND (
          SELECT count(*)
          FROM aclexplode(default_acl.defaclacl)
        ) = 1
        AND EXISTS (
          SELECT 1
          FROM aclexplode(default_acl.defaclacl) privilege
          WHERE privilege.grantor = to_regrole('postgres')
            AND privilege.grantee = to_regrole('postgres')
            AND privilege.privilege_type = 'EXECUTE'
            AND NOT privilege.is_grantable
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_catalog.pg_default_acl schema_default
          JOIN pg_catalog.pg_namespace namespace
            ON namespace.oid = schema_default.defaclnamespace
          WHERE schema_default.defaclrole = to_regrole('postgres')
            AND namespace.nspname IN ('public', 'private')
            AND schema_default.defaclobjtype = 'f'
            AND (
              (
                SELECT count(*)
                FROM aclexplode(schema_default.defaclacl)
              ) <> 1
              OR NOT EXISTS (
                SELECT 1
                FROM aclexplode(schema_default.defaclacl) privilege
                WHERE privilege.grantor = to_regrole('postgres')
                  AND privilege.grantee = to_regrole('postgres')
                  AND privilege.privilege_type = 'EXECUTE'
                  AND NOT privilege.is_grantable
              )
            )
        )
    ),
    'p39r_identity_columns', (
      SELECT count(*)
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
        )
    ),
    'p39r_identity_trigger_function',
      to_regprocedure('private.prepare_catalog_version_identity()') IS NOT NULL,
    'p39r_published_code_policy_scoped', EXISTS (
      SELECT 1
      FROM pg_catalog.pg_policies policy
      WHERE policy.schemaname = 'public'
        AND policy.tablename = 'catalog_item_codes'
        AND policy.policyname = 'catalog_item_codes_select'
        AND policy.qual ILIKE '%catalog_row.identity_id = catalog_item_codes.identity_id%'
        AND policy.qual ILIKE '%catalog_row.item_code%::text = catalog_item_codes.item_code%'
        AND policy.qual ILIKE '%version.status%active%archived%'
    ),
    'p39r_placement_statement_triggers', (
      SELECT count(*)
      FROM pg_catalog.pg_trigger trigger_row
      WHERE trigger_row.tgrelid = 'public.price_list'::regclass
        AND trigger_row.tgname IN (
          'trigger_touch_catalog_placement_revision_insert',
          'trigger_touch_catalog_placement_revision_update',
          'trigger_touch_catalog_placement_revision_delete'
        )
        AND trigger_row.tgfoid =
          'private.touch_catalog_placement_revision()'::regprocedure
        AND (trigger_row.tgtype & 1) = 0
        AND trigger_row.tgenabled = 'O'
        AND NOT trigger_row.tgisinternal
    ),
    'p39r_placement_row_triggers', (
      SELECT count(*)
      FROM pg_catalog.pg_trigger trigger_row
      WHERE trigger_row.tgrelid = 'public.price_list'::regclass
        AND trigger_row.tgfoid =
          'private.touch_catalog_placement_revision()'::regprocedure
        AND (trigger_row.tgtype & 1) = 1
        AND trigger_row.tgenabled = 'O'
        AND NOT trigger_row.tgisinternal
    ),
    'phase4_withdraw_order_compaction_triggers', (
      SELECT count(*)
      FROM pg_catalog.pg_trigger trigger_row
      WHERE trigger_row.tgrelid = 'public.price_list'::regclass
        AND trigger_row.tgname = 'trigger_compact_catalog_draft_order_delete'
        AND trigger_row.tgfoid =
          to_regprocedure('private.compact_catalog_draft_order_after_delete()')
        AND (trigger_row.tgtype & 1) = 0
        AND (trigger_row.tgtype & 66) = 0
        AND (trigger_row.tgtype & 60) = 8
        AND trigger_row.tgoldtable = 'deleted_rows'
        AND trigger_row.tgnewtable IS NULL
        AND trigger_row.tgenabled = 'O'
        AND NOT trigger_row.tgisinternal
    )
  ),
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
  const { schema, version, quality, rows } = snapshot
  const failures = []

  const isPreP39r = schema?.p39r_identity_columns === 0
    && schema?.p39r_identity_trigger_function === false
  const isPostP39r = schema?.p39r_identity_columns === 6
    && schema?.p39r_identity_trigger_function === true
  const hasPublishedCodeScope = schema?.p39r_published_code_policy_scoped === true
  const hasLegacyPlacementTrigger = schema?.p39r_placement_statement_triggers === 0
    && schema?.p39r_placement_row_triggers === 1
  const hasSetBasedPlacementTriggers = schema?.p39r_placement_statement_triggers === 3
    && schema?.p39r_placement_row_triggers === 0
  const withdrawCompactionTriggerCount = schema?.phase4_withdraw_order_compaction_triggers
  const hasWithdrawOrderCompaction = withdrawCompactionTriggerCount === 1

  if (schema?.phase4_global_function_default_acl !== true) {
    failures.push('migration 017a global function default ACL is missing or inconsistent')
  }

  if ((!isPreP39r && !isPostP39r) || (isPreP39r && hasPublishedCodeScope)) {
    failures.push('migration 022 schema markers are partial or inconsistent')
  }

  if (!hasLegacyPlacementTrigger && !hasSetBasedPlacementTriggers) {
    failures.push('migration 024 placement-trigger markers are partial or inconsistent')
  }

  if (hasSetBasedPlacementTriggers && (!isPostP39r || !hasPublishedCodeScope)) {
    failures.push('migration 024 placement triggers exist without migrations 022/023')
  }

  if (![0, 1].includes(withdrawCompactionTriggerCount)) {
    failures.push('migration 025 withdraw-order compaction trigger inventory is inconsistent')
  }

  if (hasWithdrawOrderCompaction && !hasSetBasedPlacementTriggers) {
    failures.push('migration 025 withdraw-order compaction exists without migration 024')
  }

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

  if (JSON.stringify(first.schema) !== JSON.stringify(second.schema)) {
    throw new Error('Catalog schema markers changed across repeat Local DB reads')
  }

  const migration022Detected = first.schema.p39r_identity_columns === 6
    && first.schema.p39r_identity_trigger_function === true
  const migration017aDetected =
    first.schema.phase4_global_function_default_acl === true
  const migration023Detected = migration022Detected
    && first.schema.p39r_published_code_policy_scoped === true
  const migration024Detected = migration023Detected
    && first.schema.p39r_placement_statement_triggers === 3
    && first.schema.p39r_placement_row_triggers === 0
  const migration025Detected = migration024Detected
    && first.schema.phase4_withdraw_order_compaction_triggers === 1
  const phase4Range = migration025Detected
    ? '017, 017a, 018-025'
    : migration024Detected
    ? '017, 017a, 018-024'
    : migration023Detected
    ? '017, 017a, 018-023'
    : migration022Detected
    ? '017, 017a, 018-022'
    : '017, 017a, 018-021'

  return {
    source:
      `Local Supabase schema includes root migrations 009-015, hotfix 016, and detected Phase 4 ${phase4Range}`,
    productionAuthorityVersion: '2568.0.0',
    localDbContainer: DB_CONTAINER,
    migration017aDetected,
    migration022Detected,
    migration023Detected,
    migration024Detected,
    migration025Detected,
    schema: first.schema,
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
