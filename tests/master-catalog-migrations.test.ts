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
    expect(bootstrap).toContain('migrations/016_master_catalog_phase4_foundation.sql')
    expect(bootstrap).toContain('migrations/017_master_catalog_phase4_draft_mutation.sql')
    expect(bootstrap).toContain('supabase/local/production-baseline.sql')
    expect(bootstrap).toContain('PUBLIC_DATA_SNAPSHOT=')
    expect(bootstrap).toContain('docker cp "$PUBLIC_DATA_SNAPSHOT"')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/011.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/014.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/015.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/016.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/017.sql')
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

  it('adds the Phase 4 foundation without publishing or touching Factor F', () => {
    const sql = readMigration('016_master_catalog_phase4_foundation.sql')

    expect(sql).toContain('Migration 016: Master Catalog Phase 4 Foundation')
    expect(sql).toContain("SET LOCAL lock_timeout = '10s'")
    expect(sql).toContain("SET LOCAL statement_timeout = '60s'")

    expect(sql).toContain('ADD COLUMN IF NOT EXISTS based_on_version_id uuid')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS effective_date date')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS dataset_hash text')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS lock_version integer NOT NULL DEFAULT 0')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS identity_id uuid')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS category_id uuid')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS code_group_id uuid')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS display_order integer')

    for (const table of [
      'catalog_item_identities',
      'catalog_item_codes',
      'price_list_categories',
      'catalog_code_groups',
      'catalog_imports',
      'catalog_change_sets',
      'catalog_change_items',
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`)
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`)
    }

    expect(sql).toContain('REVOKE ALL\n    ON TABLE\n      public.catalog_item_identities')
    expect(sql).toContain('GRANT SELECT\n    ON TABLE\n      public.catalog_item_identities')
    expect(sql).toContain("p.id = (SELECT auth.uid())")
    expect(sql).toContain("p.role = 'admin'")
    expect(sql).toContain("p.status = 'active'")

    for (const index of [
      'idx_price_list_versions_created_by',
      'idx_price_list_versions_published_by',
      'idx_catalog_item_identities_created_by',
      'idx_catalog_item_codes_created_by',
      'idx_catalog_imports_created_by',
      'idx_catalog_change_sets_actor',
      'idx_price_list_identity_id',
      'idx_price_list_item_code_identity',
    ]) {
      expect(sql).toContain(`CREATE INDEX IF NOT EXISTS ${index}`)
    }

    expect(sql).toContain("'catalog_admin_enabled'")
    expect(sql).toContain("'false'::jsonb")
    expect(sql).toContain("WHERE key = 'catalog_admin_enabled'")

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.create_catalog_draft')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.apply_catalog_changes')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.publish_catalog_version')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.restore_catalog_pointer')
    expect(sql.match(/^\s+SECURITY INVOKER$/gm)).toHaveLength(4)
    expect(sql).not.toContain('SECURITY DEFINER')
    expect(sql).toContain('CATALOG_RPC_NOT_IMPLEMENTED')
    expect(sql).toContain('FROM PUBLIC, anon')
    expect(sql).toContain('TO authenticated')

    expect(sql).toContain("v.version_string = '2568.0.0'")
    expect(sql).not.toContain("version_string = '2568.1.0'")
    expect(sql).not.toContain('ALTER TABLE public.boq')
    expect(sql).not.toContain('UPDATE public.price_list_default_version')
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.factor_/i)
    expect(sql).not.toContain('SET factor_reference_version_id')
  })

  it('implements WP-4 draft mutation without publish, pointer, BOQ, or Factor F writes', () => {
    const sql = readMigration('017_master_catalog_phase4_draft_mutation.sql')

    expect(sql).toContain('Migration 017: Master Catalog Phase 4 Draft Mutation')
    expect(sql).toContain("SET LOCAL lock_timeout = '10s'")
    expect(sql).toContain("SET LOCAL statement_timeout = '60s'")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.create_catalog_draft_impl')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.apply_catalog_changes_impl')
    expect(sql).toContain('SECURITY DEFINER')
    expect(sql).toContain("SET search_path = ''")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.create_catalog_draft')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.apply_catalog_changes')
    expect(sql).toContain('SECURITY INVOKER')
    expect(sql).toContain('catalog_admin_enabled')
    expect(sql).toContain('Only rehearsal catalog version 2568.1.0')
    expect(sql).toContain('DRAFT_LOCK_CONFLICT')
    expect(sql).toContain('IMPORT_RETIREMENT_APPROVAL_REQUIRED')
    expect(sql).toContain('CATALOG_CODE_CAPACITY_REVIEW_REQUIRED')
    expect(sql).toContain('catalog_change_sets')
    expect(sql).toContain('catalog_change_items')
    expect(sql).toContain('catalog_imports')
    expect(sql).toContain('publish_catalog_version remains disabled until WP-5')
    expect(sql).toContain('restore_catalog_pointer remains disabled until WP-5')
    expect(sql).toContain('FROM PUBLIC, anon')
    expect(sql).toContain('TO authenticated')

    expect(sql).not.toContain("'catalog_admin_enabled',\n    'true'::jsonb")
    expect(sql).not.toContain('UPDATE public.price_list_default_version')
    expect(sql).not.toContain('ALTER TABLE public.boq')
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.factor_/i)
    expect(sql).not.toContain('SET factor_reference_version_id')
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
