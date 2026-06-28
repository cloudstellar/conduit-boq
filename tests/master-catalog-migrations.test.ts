import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readMigration(name: string): string {
  return readFileSync(resolve(process.cwd(), 'migrations', name), 'utf8')
}

describe('Master Catalog migration contracts', () => {
  it('keeps P0 containment independent from catalog schema changes', () => {
    const sql = readMigration('009_master_catalog_p0_containment.sql')

    expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)\n  FROM PUBLIC, anon, authenticated;")
    expect(sql).toContain("IF auth.uid() IS NULL THEN")
    expect(sql).toContain("SET search_path = ''")
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)\n  TO authenticated;")
    expect(sql).toContain("pg_has_role(current_user, 'supabase_admin', 'MEMBER')")
    expect(sql).toContain("SET LOCAL lock_timeout = '10s'")
    expect(sql).toContain("SET LOCAL statement_timeout = '60s'")
    expect(sql).not.toContain('CREATE TABLE IF NOT EXISTS public.price_list_versions')
  })

  it('keeps Phase 1A nullable and rejects cross-version catalog writes', () => {
    const sql = readMigration('010_master_catalog_phase1a_versioning.sql')

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.price_list_versions')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.price_list_default_version')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS price_list_version_id uuid')
    expect(sql).not.toContain('ALTER COLUMN price_list_version_id SET NOT NULL')
    expect(sql).toContain('IF v_item_version IS DISTINCT FROM v_target_boq_version THEN')
    expect(sql).toContain("pg_has_role(current_user, 'supabase_admin', 'MEMBER')")
    expect(sql).toContain('REVOKE INSERT, UPDATE, DELETE')
  })

  it('keeps concurrent indexes outside transaction blocks', () => {
    const sql = readMigration('010a_master_catalog_phase1a_indexes.sql')

    expect(sql.match(/^CREATE INDEX CONCURRENTLY/gm)).toHaveLength(4)
    expect(sql).not.toMatch(/^\s*BEGIN\s*;/m)
    expect(sql).not.toMatch(/^\s*COMMIT\s*;/m)
  })

  it('hardens only after fail-closed assertions pass', () => {
    const sql = readMigration('011_master_catalog_phase1b_hardening.sql')

    expect(sql).toContain("RAISE EXCEPTION 'Phase 1B blocked:")
    expect(sql).toContain('ALTER COLUMN price_list_version_id SET NOT NULL')
    expect(sql).toContain('CREATE TRIGGER trigger_prevent_boq_version_modification')
    expect(sql).toContain('IF OLD.price_list_version_id IS DISTINCT FROM NEW.price_list_version_id THEN')
    expect(sql).toContain('SECURITY INVOKER')
    expect(sql).not.toContain('SECURITY DEFINER')
    expect(sql.match(/^BEGIN;/gm)).toHaveLength(1)
    expect(sql.match(/^COMMIT;/gm)).toHaveLength(1)
    expect(sql.indexOf('CREATE TRIGGER trigger_prevent_boq_version_modification'))
      .toBeLessThan(sql.indexOf('COMMIT;'))
  })

  it('keeps the canonical Local bootstrap on the fully rehearsed path', () => {
    const bootstrap = readFileSync(resolve(process.cwd(), 'scripts/bootstrap-local-db.sh'), 'utf8')

    expect(bootstrap).toContain('migrations/011_master_catalog_phase1b_hardening.sql')
    expect(bootstrap).toContain('migrations/012_factor_f_version_foundation.sql')
    expect(bootstrap).toContain('migrations/013_factor_f_seed_current_baseline.sql')
    expect(bootstrap).toContain('migrations/014_factor_f_publish_2569_0_0.sql')
    expect(bootstrap).toContain('migrations/015_factor_f_repair_legacy_snapshot_metadata.sql')
    expect(bootstrap).toContain('supabase/local/production-baseline.sql')
    expect(bootstrap).toContain('PUBLIC_DATA_SNAPSHOT=')
    expect(bootstrap).toContain('docker cp "$PUBLIC_DATA_SNAPSHOT"')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/011.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/014.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/015.sql')
    expect(bootstrap).toContain("'factor_f_default_version'")
    expect(bootstrap).toContain("'factor_f_2569_row_count'")
    expect(bootstrap).toContain("'factor_f_partial_legacy_snapshots_remaining'")
    expect(bootstrap).toContain('npm run db:local:smoke-master-catalog')
  })

  it('publishes Factor F 2569 without backfilling existing BOQs', () => {
    const sql = readMigration('014_factor_f_publish_2569_0_0.sql')

    expect(sql).toContain('Migration 014: Factor F Publish 2569.0.0')
    expect(sql).toContain("'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6'")
    expect(sql).toContain('WHERE factor_reference_version_id IS NOT NULL')
    expect(sql).toContain('F3 postcondition failed: BOQ factor version bindings changed')
    expect(sql).toContain("WHERE v.version_string = '2569.0.0'")
    expect(sql).toContain("WHERE version_string = '2569.0.0'")
    expect(sql).toContain('IF v_row_count <> 36 THEN')
    expect(sql).toContain('WHERE cost_million = 600')
    expect(sql).toContain('(36, 700, 1.0727, 1.1477, 1.1641, 1.1805)')
    expect(sql).not.toContain('UPDATE public.boq\nSET factor_reference_version_id')
  })

  it('repairs legacy Factor F snapshot metadata without binding old BOQs to a version', () => {
    const sql = readMigration('015_factor_f_repair_legacy_snapshot_metadata.sql')

    expect(sql).toContain('Migration 015: Factor F Repair Legacy Snapshot Metadata')
    expect(sql).toContain("'sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61'")
    expect(sql).toContain("v.version_string = '2569.0.0'")
    expect(sql).toContain("version_string = '2566.0.0'")
    expect(sql).toContain('saved_factor_f IS DISTINCT FROM trunc(expected_raw_factor, 4)')
    expect(sql).toContain('factor_f_raw = COALESCE(b.factor_f_raw, repair.repair_factor_f_raw)')
    expect(sql).toContain('factor_f_lower_cost = COALESCE(b.factor_f_lower_cost, repair.repair_lower_cost)')
    expect(sql).toContain('F4 repair blocked: % legacy BOQs have factor_f values that do not match 2566.0.0')
    expect(sql).toContain('F4 repair postcondition failed: % repaired legacy BOQs were bound to a Factor F version')
    expect(sql).not.toContain('SET factor_reference_version_id')
    expect(sql).not.toContain('total_with_factor_f =')
    expect(sql).not.toContain('total_with_vat =')
  })

  it('keeps the Production snapshot outside the Supabase remote migration ledger', () => {
    const baseline = resolve(process.cwd(), 'supabase', 'local', 'production-baseline.sql')
    const remoteMigrationPath = resolve(
      process.cwd(),
      'supabase',
      'migrations',
      '20260620100634_production_baseline.sql',
    )

    expect(() => readFileSync(baseline, 'utf8')).not.toThrow()
    expect(() => readFileSync(remoteMigrationPath, 'utf8')).toThrow()
  })
})
