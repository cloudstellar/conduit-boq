import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'migrations/029_atomic_boq_duplicate.sql',
)
const concurrencyHarnessPath = resolve(
  process.cwd(),
  'scripts/smoke-atomic-boq-duplicate-concurrency.mjs',
)

function migration(): string {
  return readFileSync(migrationPath, 'utf8')
}

function expectInOrder(source: string, tokens: string[]) {
  let previous = -1

  for (const token of tokens) {
    const current = source.indexOf(token)
    expect(current).toBeGreaterThan(previous)
    previous = current
  }
}

describe('atomic BOQ duplicate migration contract', () => {
  it('is a forward-only post-028 migration with one bounded public RPC', () => {
    const sql = migration()

    expect(sql).toContain('Migration 029: Atomic BOQ Duplicate')
    expect(sql).toContain("v_latest_version IS DISTINCT FROM '20260828070433'")
    expect(sql).toContain(
      "v_latest_name IS DISTINCT FROM 'master_catalog_admin_gate_projection'",
    )
    expect(sql).toContain(
      'Atomic BOQ duplicate preflight blocked: private-schema owner or ACL drifted',
    )
    expect(sql).toContain(
      'Atomic BOQ duplicate preflight blocked: active-profile helper posture drifted',
    )
    expect(sql).toContain(
      'bbfaa7c54c6c149cd3a29f4cb62d3a7bfbd19a25dc48a831e37016e220e18079',
    )
    expect(sql).toContain(
      'CREATE OR REPLACE FUNCTION public.duplicate_boq_atomic(',
    )
    expect(sql).toContain('p_source_boq_id uuid')
    expect(sql).toContain('p_request_id uuid')
    expect(sql).toContain('p_expected_source_updated_at timestamptz')
    expect(sql).toContain("p_mode text DEFAULT 'preserve'")
    expect(sql).toContain('p_factor_reference_version_id uuid DEFAULT NULL')
    expect(sql.match(/^CREATE OR REPLACE FUNCTION public\./gm)).toHaveLength(1)
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION public.save_boq_with_routes')
  })

  it('locks active actor, request, source, Factor F, routes, and items in order', () => {
    const fullSql = migration()
    const sql = fullSql.slice(
      fullSql.indexOf('CREATE OR REPLACE FUNCTION public.duplicate_boq_atomic('),
    )

    expectInOrder(sql, [
      'FROM public.user_profiles profile',
      'FOR UPDATE;',
      'FROM private.boq_copy_requests request_row',
      'FROM public.boq source_row',
      'FROM public.factor_reference_versions factor_version',
      'FROM public.boq_routes route_row',
      'FROM public.boq_items item_row',
    ])
    expect(sql).toContain("v_actor_status <> 'active'")
    expect(sql).toContain(
      "v_actor_role NOT IN (\n    'admin', 'dept_manager', 'sector_manager', 'staff'",
    )
    expect(sql).toContain("ERRCODE = '42501'")
    expectInOrder(sql, [
      'FROM public.user_profiles profile',
      "'conduit-boq:atomic-copy-request:'",
      'FROM private.boq_copy_requests request_row',
    ])
  })

  it('mirrors source read scope instead of trusting SECURITY DEFINER access', () => {
    const sql = migration()
    const sourceLock = sql.slice(
      sql.indexOf('-- The source header is the second lock.'),
      sql.indexOf('-- The supported application save protocol advances'),
    )

    expect(sql).toContain("v_actor_role = 'admin'")
    expect(sql).toContain('source_row.created_by = v_actor_id')
    expect(sql).toContain('source_row.assigned_to = v_actor_id')
    expect(sql).toContain("v_actor_role IN ('staff', 'sector_manager')")
    expect(sql).toContain('source_row.sector_id = v_actor_sector_id')
    expect(sql).toContain("v_actor_role = 'dept_manager'")
    expect(sql).toContain('source_row.department_id = v_actor_department_id')
    expect(sourceLock).toContain('source_row.created_by IS NOT NULL')
    expectInOrder(sourceLock, [
      'FROM public.boq source_row',
      "v_actor_role = 'admin'",
      'FOR UPDATE;',
      'IF NOT FOUND THEN',
      "ERRCODE = 'P0002'",
    ])
    expect(sql).toContain('source BOQ was not found or is not available')
  })

  it('rejects a stale authorized source before copying any graph row', () => {
    const fullSql = migration()
    const sql = fullSql.slice(
      fullSql.indexOf('CREATE OR REPLACE FUNCTION public.duplicate_boq_atomic('),
    )

    expect(fullSql).toContain('expected_source_updated_at timestamptz NOT NULL')
    expect(sql).toContain(
      'v_existing.expected_source_updated_at\n          IS DISTINCT FROM p_expected_source_updated_at',
    )
    expect(sql).toContain(
      'v_source.updated_at IS DISTINCT FROM p_expected_source_updated_at',
    )
    expect(sql).toContain("ERRCODE = '40001'")
    const sourceLockAndValidation = sql.slice(
      sql.indexOf('-- The source header is the second lock.'),
    )
    expectInOrder(sourceLockAndValidation, [
      'IF NOT FOUND THEN',
      'v_source.updated_at IS DISTINCT FROM p_expected_source_updated_at',
      'FROM public.factor_reference_versions factor_version',
      'FROM public.boq_routes route_row',
    ])
  })

  it('keeps preserve and legacy select-factor semantics mutually exclusive', () => {
    const sql = migration()

    expect(sql).toContain("v_mode NOT IN ('preserve', 'select_factor')")
    expect(sql).toContain(
      "v_mode = 'preserve' AND p_factor_reference_version_id IS NOT NULL",
    )
    expect(sql).toContain(
      "v_mode = 'select_factor' AND p_factor_reference_version_id IS NULL",
    )
    expect(sql).toContain('legacy BOQ requires select_factor mode')
    expect(sql).toContain(
      'select_factor mode is only available for an unbound legacy BOQ',
    )
    expect(sql).toContain(
      'legacy BOQ must have a positive base total before selecting Factor F',
    )
    expect(sql).toContain("factor_version.status = 'active'")
    expect(sql).toContain('v_actual_factor_rows <> v_expected_factor_rows')

    for (const snapshot of [
      'factor_f',
      'factor_f_raw',
      'factor_f_lower_cost',
      'factor_f_upper_cost',
      'factor_f_lower_value',
      'factor_f_upper_value',
      'total_with_factor_f',
      'total_with_vat',
    ]) {
      expect(sql).toContain(`v_result.${snapshot}`)
      expect(sql).toContain(`v_source.${snapshot}`)
    }

    expect(sql).toContain(
      "CASE WHEN v_mode = 'preserve' THEN v_route.cost_with_factor_f ELSE 0 END",
    )
    expect(sql).toContain('WHEN p_reset_factor_totals THEN 0::numeric(15, 2)')
    expect(sql).toContain(
      "IF v_mode = 'select_factor' AND (",
    )
  })

  it('copies stored item snapshots, supports pure route-less graphs, and rejects mixed graphs', () => {
    const sql = migration()

    expect(sql).toContain('source BOQ contains items linked to a route outside its graph')
    expect(sql).toContain(
      'source BOQ mixes routed and route-less items and cannot be copied safely',
    )
    expect(sql).toContain('source BOQ contains Catalog items outside its bound version')
    expect(sql).toContain(
      'catalog_item.version_id IS DISTINCT FROM v_source.price_list_version_id',
    )
    expect(sql).toContain('WHEN item_row.route_id IS NULL THEN NULL')
    expect(sql).toContain("(v_route_map ->> item_row.route_id::text)::uuid")

    for (const column of [
      'price_list_id',
      'item_name',
      'quantity',
      'unit',
      'material_cost_per_unit',
      'labor_cost_per_unit',
      'unit_cost',
      'total_material_cost',
      'total_labor_cost',
      'total_cost',
      'remarks',
      'category',
    ]) {
      expect(sql).toContain(`item_row.${column}`)
    }

    expect(sql).not.toContain('UPDATE public.price_list')
    expect(sql).not.toContain('UPDATE public.factor_reference_default_version')
    expect(sql).not.toContain('UPDATE public.boq\n')
    expect(sql).not.toContain('DELETE FROM public.boq')
  })

  it('fails closed on Catalog, item, route, header, and Factor provenance drift', () => {
    const sql = migration()

    expect(sql).toContain('v_bad_catalog_snapshot_count')
    expect(sql).toContain('source BOQ contains Catalog-backed item snapshots')
    expect(sql).toContain('v_bad_item_math_count')
    expect(sql).toContain('pg_catalog.round(\n        item_row.quantity * item_row.unit_cost')
    expect(sql).toContain('v_bad_route_math_count')
    expect(sql).toContain('AS stored_material_cost')
    expect(sql).toContain('AS raw_material_cost')
    expect(sql).toContain(
      'route_row.total_material_cost\n          IS NOT DISTINCT FROM item_totals.stored_material_cost',
    )
    expect(sql).toContain(
      'route_row.total_material_cost\n          IS NOT DISTINCT FROM item_totals.raw_material_cost',
    )
    expect(sql).toContain('source BOQ header totals do not match its item snapshots')
    expect(sql).toContain('v_bad_factor_snapshot')
    expect(sql).toContain('factor_row.cost_million * 1000000::numeric')
    expect(sql).not.toContain(
      'v_source.factor_f_raw IS DISTINCT FROM v_expected_factor_raw',
    )
    expect(sql).toContain('v_expected_factor_raw,\n            4')
    expect(sql).toContain('v_source.factor_f_raw,\n            4')
    expect(sql).toContain(
      "ARRAY['NaN', 'Infinity', '-Infinity']::text[]",
    )
    expect(sql).toContain('source BOQ graph contains non-finite numeric data')
    expect(sql).toContain(
      'selected Factor F version contains non-finite numeric data',
    )
    expect(sql).toContain(
      'COALESCE(v_source.factor_f_raw, 0::numeric) <> 0',
    )
    expect(sql).toContain('v_target_factor_vat_percent / 100::numeric')
    expect(sql).toContain('v_actual_factor_dataset_hash')
    expect(sql).toContain('dataset hash does not match its published metadata')
  })

  it('uses a private idempotency ledger and verifies source/result graphs', () => {
    const sql = migration()

    expect(sql).toContain('CREATE TABLE private.boq_copy_requests')
    expect(sql).toContain('PRIMARY KEY (actor_id, request_id)')
    expect(sql).toContain('UNIQUE (result_boq_id)')
    expect(sql).toContain('ALTER TABLE private.boq_copy_requests ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain("'duplicateRequest', true")
    expect(sql).toContain("'duplicateRequest', false")
    expect(sql).toContain(
      'request id was already used with different copy parameters',
    )
    expect(sql).toContain("'conduit-boq:atomic-copy-request:'")
    expect(sql).toContain(
      'CREATE OR REPLACE FUNCTION private.boq_copy_graph_sha256(',
    )
    expect(sql).toContain(
      'v_source_graph_after IS DISTINCT FROM v_source_graph_before',
    )
    expect(sql).toContain('v_result_graph IS DISTINCT FROM v_source_graph_before')
  })

  it('pins privileged code and exposes execute only to authenticated', () => {
    const sql = migration()

    expect(sql).toContain('SECURITY DEFINER')
    expect(sql).toContain("SET search_path = ''")
    expect(sql).toContain("SET lock_timeout = '5s'")
    expect(sql).toContain("SET statement_timeout = '30s'")
    expect(sql).toContain(
      'uuid, uuid, timestamptz, text, uuid',
    )
    expect(sql).toContain('FROM PUBLIC, anon, authenticated, service_role;')
    expect(sql).toContain(
      "privilege.grantee NOT IN (\n        v_rpc.proowner,\n        'authenticated'::regrole::oid",
    )
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.duplicate_boq_atomic(')
    expect(sql).toContain(
      "'public.duplicate_boq_atomic(uuid,uuid,timestamp with time zone,text,uuid)',",
    )
    expect(sql).toContain('Atomic BOQ duplicate postcondition failed: public RPC ACL is invalid')
    expect(sql).toContain('Atomic BOQ duplicate postcondition failed: private ledger posture is invalid')
    expect(sql).toContain(
      'Atomic BOQ duplicate preflight blocked: BOQ RLS policy posture drifted',
    )
    expect(sql).toContain("policy.polname = 'boq_select'")
    expect(sql).toContain("policy.polname = 'boq_insert'")
    expect(sql).toContain("policy.polname = 'p49_boq_current_active'")
    expect(sql).toContain("('MAINTAIN')")
    expect(sql).toContain("policy.tablename = 'boq_copy_requests'")
  })

  it('ships a real two-session idempotency and rollback harness', () => {
    const harness = readFileSync(concurrencyHarnessPath, 'utf8')

    expect(harness).toContain('Promise.all([')
    expect(harness).toContain("'docker'")
    expect(harness).toContain("'psql'")
    expect(harness).toContain('same actor/request concurrent calls')
    expect(harness).toContain('response-loss retry')
    expect(harness).toContain('different request ids')
    expect(harness).toContain('canceling statement due to lock timeout')
    expect(harness).toContain('timed-out copy left an idempotency ledger row')
    expect(harness).toContain('timed-out copy left a destination BOQ row')
    expect(harness).toContain(
      'ATOMIC_COPY_SMOKE_DB must name a disposable',
    )
  })
})
