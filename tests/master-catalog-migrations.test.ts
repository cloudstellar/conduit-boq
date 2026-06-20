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
  })
})
