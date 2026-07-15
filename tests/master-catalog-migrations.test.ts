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
    expect(bootstrap).toContain('migrations/016_hotfix_preserve_boq_item_suffix.sql')
    expect(bootstrap).toContain('migrations/017_master_catalog_phase4_foundation.sql')
    expect(bootstrap).toContain('migrations/018_master_catalog_phase4_draft_mutation.sql')
    expect(bootstrap).toContain('migrations/019_master_catalog_phase4_publish_pointer.sql')
    expect(bootstrap).toContain('migrations/020_master_catalog_phase4_admin_workflow_hardening.sql')
    expect(bootstrap).toContain('supabase/local/production-baseline.sql')
    expect(bootstrap).toContain('PUBLIC_DATA_SNAPSHOT=')
    expect(bootstrap).toContain('docker cp "$PUBLIC_DATA_SNAPSHOT"')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/011.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/014.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/015.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/016.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/017.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/018.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/019.sql')
    expect(bootstrap).toContain('psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/020.sql')
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

  it('preserves BOQ item special suffixes while keeping catalog values authoritative', () => {
    const sql = readMigration('016_hotfix_preserve_boq_item_suffix.sql')

    expect(sql).toContain('Migration 016: Hotfix Preserve BOQ Item Suffix Labels')
    expect(sql).toContain('Phase 4 migrations must be rebased/renumbered to 017+')
    expect(sql).toContain("v_allowed_special_suffixes constant text[] := ARRAY[")
    expect(sql).toContain("' (Main Duct)'")
    expect(sql).toContain("' (Riser)'")
    expect(sql).toContain("' (Steel Pole)'")
    expect(sql).toContain("' (Riser Service)'")
    expect(sql).toContain("v_requested_item_name = v_pl_item_name")
    expect(sql).toContain("v_requested_item_name = v_pl_item_name || allowed_suffix.suffix")
    expect(sql).toContain("RAISE EXCEPTION 'รายการ % มีชื่อไม่ตรงกับบัญชีราคากลางของ BOQ นี้'")
    expect(sql).toContain('v_item_name_to_save,')
    expect(sql).toContain('v_pl_unit,')
    expect(sql).toContain('v_pl_material,')
    expect(sql).toContain('v_pl_labor,')
    expect(sql).toContain('v_pl_unit_cost,')
    expect(sql).toContain('v_category')
    expect(sql).toContain('Hotfix 016 postcondition failed: save_boq_with_routes was not found')
    expect(sql).toContain("has_function_privilege(\n    'anon',")
    expect(sql).toContain("has_function_privilege(\n    'authenticated',")
    expect(sql).toContain("WHERE config IN ('search_path=', 'search_path=\"\"')")
    expect(sql).not.toContain('UPDATE public.price_list')
    expect(sql).not.toContain('UPDATE public.factor_reference_default_version')
    expect(sql).not.toContain('SET factor_reference_version_id')
  })

  it('adds the Phase 4 foundation without publishing or touching Factor F', () => {
    const sql = readMigration('017_master_catalog_phase4_foundation.sql')

    expect(sql).toContain('Migration 017: Master Catalog Phase 4 Foundation')
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

    expect(sql).toContain('DO $phase4_identity_preflight$')
    expect(sql).toContain("v.version_string = '2568.0.0'")
    expect(sql).toContain('pl.id AS identity_id')
    expect(sql).not.toContain('gen_random_uuid() AS identity_id')
    expect(sql).toContain('P20 deterministic identity blocked: expected only the non-empty 2568.0.0 baseline')
    expect(sql).toContain('P20 deterministic identity blocked: % baseline rows already have non-deterministic identities')
    expect(sql).toContain('P20 deterministic identity blocked: % baseline price_list.id values collide')
    expect(sql).toContain('P20 deterministic identity postcondition failed')

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
    const sql = readMigration('018_master_catalog_phase4_draft_mutation.sql')

    expect(sql).toContain('Migration 018: Master Catalog Phase 4 Draft Mutation')
    expect(sql).toContain("SET LOCAL lock_timeout = '10s'")
    expect(sql).toContain("SET LOCAL statement_timeout = '60s'")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.create_catalog_draft_impl')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.apply_catalog_changes_impl')
    expect(sql.match(/SET lock_timeout = '5s'/g)).toHaveLength(2)
    expect(sql.match(/SET statement_timeout = '30s'/g)).toHaveLength(2)
    expect(sql).toContain('SECURITY DEFINER')
    expect(sql).toContain("SET search_path = ''")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.create_catalog_draft')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.apply_catalog_changes')
    expect(sql).toContain('SECURITY INVOKER')
    expect(sql).toContain('catalog_admin_enabled')
    expect(sql).toContain('private.catalog_version_transition_valid')
    expect(sql).toContain('VERSION_TRANSITION_INVALID')
    expect(sql).toContain("v_existing_change.change_type IS DISTINCT FROM (\n             CASE")
    expect(sql).not.toContain('Only rehearsal catalog version 2568.1.0')
    expect(sql).toContain('DRAFT_LOCK_CONFLICT')
    expect(sql).toContain('IMPORT_RETIREMENT_APPROVAL_REQUIRED')
    expect(sql).toContain('CATALOG_CODE_CAPACITY_REVIEW_REQUIRED')
    expect(sql).toContain('catalog_change_sets')
    expect(sql).toContain('catalog_change_items')
    expect(sql).toContain('catalog_imports')
    expect(sql).toContain('Change payload assigns the same canonical code more than once')
    expect(sql).toContain("'master_catalog_code:' || v_new_code")
    expect(sql).toContain("RAISE EXCEPTION 'CATALOG_MUTATION_ABORT'")
    expect(sql).toContain('WHEN raise_exception THEN')
    expect(sql).toContain('so this subtransaction removes the change set and every partial row write')
    const mutationWriteStart = sql.indexOf('so this subtransaction removes the change set')
    const mutationAbortHandler = sql.indexOf('WHEN raise_exception THEN', mutationWriteStart)
    expect(mutationWriteStart).toBeGreaterThan(-1)
    expect(mutationAbortHandler).toBeGreaterThan(mutationWriteStart)
    expect(sql.slice(mutationWriteStart, mutationAbortHandler)).not.toContain(
      'RETURN private.catalog_action_error',
    )
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

  it('implements WP-5 publish and pointer restore without BOQ or Factor F writes', () => {
    const sql = readMigration('019_master_catalog_phase4_publish_pointer.sql')

    expect(sql).toContain('Migration 019: Master Catalog Phase 4 Publish and Pointer Restore')
    expect(sql).toContain("SET LOCAL lock_timeout = '10s'")
    expect(sql).toContain("SET LOCAL statement_timeout = '60s'")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_compute_version_dataset')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_publish_readiness')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.get_catalog_publish_readiness')
    expect(sql).toContain('extensions.digest(pg_catalog.convert_to')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.publish_catalog_version_impl')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.restore_catalog_pointer_impl')
    expect(sql.match(/SET lock_timeout = '5s'/g)).toHaveLength(2)
    expect(sql.match(/SET statement_timeout = '30s'/g)).toHaveLength(2)
    expect(sql).toContain("pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('master_catalog_publish_pointer', 0))")
    expect(sql).toContain('p_expected_lock_version integer')
    expect(sql).toContain('Expected lock version is required')
    expect(sql).toContain('DRAFT_BASE_STALE')
    expect(sql).toContain('DRAFT_LOCK_CONFLICT')
    expect(sql).toContain('PUBLICATION_METADATA_REQUIRED')
    expect(sql).toContain('PUBLICATION_VALIDATION_FAILED')
    expect(sql).toContain('P18_PLACEMENT_REVIEW_REQUIRED')
    expect(sql).toContain('STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED')
    expect(sql).toContain("'structuredCodeGuardApplies', COALESCE(v_active_canonical_code_count, 0) > 0")
    expect(sql).toContain("'retiredPdfPolicyRequired', COALESCE(v_inactive_row_count, 0) > 0")
    expect(sql).toContain("candidate.item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'")
    expect(sql).toContain("candidate.item_code <> 'ITEM-0139'")
    expect(sql).toContain('base.identity_id = candidate.identity_id')
    expect(sql).toContain('v_readiness := private.catalog_publish_readiness(p_version_id)')
    expect(sql).toContain('REVOKE EXECUTE ON FUNCTION private.catalog_publish_readiness(uuid)')
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.get_catalog_publish_readiness(uuid)')
    expect(sql).toContain('private.catalog_request_fingerprint')
    expect(sql).toContain("'master_catalog_request:' || p_request_id::text")
    expect(sql).toContain('REQUEST_ID_PAYLOAD_MISMATCH')
    expect(sql).toContain('VERSION_TRANSITION_INVALID')
    expect(sql).not.toContain('Only rehearsal catalog version 2568.1.0')
    expect(sql).toContain('UPDATE public.price_list_default_version')
    expect(sql).toContain('SET\n      is_default = false')
    expect(sql).toContain('SET\n      is_default = true')
    expect(sql).toContain("change_type,\n      reason,\n      request_id")
    expect(sql).toContain("'publish'")
    expect(sql).toContain("'restore'")
    expect(sql).toContain('trigger_prevent_published_catalog_row_mutation')
    expect(sql).toContain('trigger_prevent_published_catalog_version_metadata_mutation')
    expect(sql).toContain('CATALOG_PUBLISHED_ROW_IMMUTABLE')
    expect(sql).toContain('CATALOG_PUBLISHED_VERSION_IMMUTABLE')
    expect(sql).toContain("WHERE version_string = '2568.0.0'")
    expect(sql).toContain("'catalog_admin_enabled'")
    expect(sql).toContain('FROM PUBLIC, anon')
    expect(sql).toContain('TO authenticated')

    expect(sql).not.toContain('CATALOG_RPC_NOT_IMPLEMENTED')
    expect(sql).not.toContain("'catalog_admin_enabled',\n    'true'::jsonb")
    expect(sql).not.toContain('ALTER TABLE public.boq')
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.boq\b/i)
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.factor_/i)
    expect(sql).not.toContain('SET factor_reference_version_id')
  })

  it('hardens the complete WP-6.6 admin workflow without widening Production scope', () => {
    const sql = readMigration('020_master_catalog_phase4_admin_workflow_hardening.sql')

    expect(sql).toContain('Migration 020: Master Catalog Phase 4 Admin Workflow Hardening')
    expect(sql).toContain('28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a')
    expect(sql).toContain("IF v_mapping_count <> 710 OR v_group_count <> 65 OR v_exclusion_count <> 17")
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.catalog_code_group_dictionary')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.catalog_first_rollout_mappings')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_catalog_first_rollout_mappings_legacy_identity')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_catalog_first_rollout_mappings_group')
    expect(sql).toContain('frozen authority foreign-key indexes are missing')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS private.catalog_code_sequences')
    expect(sql).toContain('ALTER TABLE public.catalog_first_rollout_mappings ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain("'catalog_new_identity_enabled',\n      'false'::jsonb")
    expect(sql).toContain("'catalog_retirement_enabled',\n      'false'::jsonb")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_capability_enabled')
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS uq_price_list_versions_one_draft_per_base')
    expect(sql).toContain("CHECK (status IN ('draft', 'active', 'archived', 'abandoned'))")
    expect(sql).toContain("CHECK (change_type IN ('clone', 'import', 'manual', 'abandon', 'publish', 'restore'))")
    expect(sql).toContain('multiple mutable drafts')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.create_catalog_draft_guarded_impl')
    expect(sql).toContain("'DRAFT_ALREADY_EXISTS'")
    expect(sql).toContain("v_constraint_name = 'uq_price_list_versions_one_draft_per_base'")
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_version_transition_valid')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_version_candidate_is_next')
    expect(sql).toContain('p_candidate_major > p_base_major\n          AND p_candidate_major::bigint <= p_base_major::bigint + 10')
    expect(sql).toContain("'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE'")
    expect(sql).toContain("'VERSION_SEQUENCE_STALE'")
    expect(sql).toContain("v_result #>> '{error,code}' = 'VALIDATION_FAILED'")
    expect(sql).toContain("v_constraint_name = 'uq_major_minor_patch'")
    expect(sql).toContain('FROM public.price_list_versions version\n            WHERE version.major = p_candidate_major')
    expect(sql).toContain('version planning guard is invalid or exposed')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.abandon_catalog_draft_impl')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.abandon_catalog_draft')
    expect(sql).toContain("'abandon_draft'")
    expect(sql).toContain("status = 'abandoned'")
    expect(sql).toContain("v_existing_change.change_type IS DISTINCT FROM 'abandon'")
    expect(sql).toContain('CATALOG_ABANDONED_VERSION_IMMUTABLE')
    expect(sql).toContain("v_old_status IN ('active', 'archived', 'abandoned')")

    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_resolve_category')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_resolve_code_group')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.catalog_allocate_code')
    expect(sql).toContain('FROM private.catalog_code_sequences code_sequence')
    expect(sql).toContain('FOR UPDATE;')
    expect(sql).toContain('v_next_sequence >= 900')
    expect(sql).toContain('CATALOG_CODE_SERVER_ALLOCATION_REQUIRED')
    expect(sql).toContain('Explicit recode is allowed only for the frozen first-rollout mapping')
    expect(sql).toContain("private.catalog_capability_enabled('catalog_new_identity_enabled')")
    expect(sql).toContain("private.catalog_capability_enabled('catalog_retirement_enabled')")
    expect(sql).toContain('CATALOG_NEW_IDENTITY_DISABLED')
    expect(sql).toContain('CATALOG_RETIREMENT_DISABLED')

    expect(sql).toContain("'reactivate',")
    expect(sql).toContain("'withdraw',")
    expect(sql).toContain("ELSIF v_action = 'reactivate' THEN")
    expect(sql).toContain("ELSIF v_action = 'withdraw' THEN")
    expect(sql).toContain('Only a never-published identity created in this draft can be withdrawn')
    expect(sql).toContain("(action = 'withdraw' AND old_values IS NOT NULL AND new_values IS NULL)")
    expect(sql).toContain("action = 'retire'")
    expect(sql).toContain("new_values->>'isActive' = 'false'")
    expect(sql).toContain("(action IN ('update', 'recode', 'reactivate')")
    expect(sql).toContain('DELETE FROM public.price_list')
    expect(sql).not.toContain('DELETE FROM public.catalog_item_identities')
    expect(sql).not.toContain('DELETE FROM public.catalog_item_codes')

    const rowValidation = sql.indexOf('FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows)')
    const validatedInsert = sql.indexOf('INSERT INTO public.catalog_imports', rowValidation)
    expect(rowValidation).toBeGreaterThan(-1)
    expect(validatedInsert).toBeGreaterThan(rowValidation)
    expect(sql).toContain("v_payload_schema NOT IN ('catalog-import-payload/1', 'catalog-import-payload/2')")
    expect(sql).toContain('price_authority_reference text')

    expect(sql).toContain("'baseIsCurrent', v_base_is_current")
    expect(sql).toContain("'qualityPassed', v_quality_passed")
    expect(sql).toContain("v_dataset := v_readiness->'dataset'")
    expect(sql).toContain('published_by = v_actor_id')
    expect(sql).toContain('published_by_display_name = v_actor_display_name')
    expect(sql).toContain('physical_archive_reference = v_physical_archive_reference')
    expect(sql).toContain('private.catalog_parse_iso_date')
    expect(sql).toMatch(
      /CREATE OR REPLACE FUNCTION private\.catalog_parse_iso_date[\s\S]*?LANGUAGE plpgsql\s+STABLE\s+SECURITY DEFINER/,
    )
    expect(sql).not.toContain("p_approval_metadata->>'publishedByDisplayName'")

    for (const rpc of [
      'get_catalog_versions_page',
      'get_catalog_imports_page',
      'get_catalog_change_sets_page',
      'get_catalog_identity_history_page',
    ]) {
      expect(sql).toContain(`CREATE OR REPLACE FUNCTION public.${rpc}`)
    }
    expect(sql.match(/SECURITY INVOKER/g)?.length).toBeGreaterThanOrEqual(4)
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_price_list_versions_created_id')
    expect(sql).toContain('ADD CONSTRAINT uq_price_list_version_display_order')
    expect(sql).toContain('ADD CONSTRAINT uq_catalog_change_items_set_identity')
    expect(sql).toContain('duplicate change-set/identity audit entries exist')
    expect(sql).toContain('ALTER COLUMN identity_id SET NOT NULL')
    expect(sql).toContain('published derived versions need an audited physical archive reference or a clean Local rebuild')
    expect(sql).toContain('frozen authority admin-select policies are incomplete')
    expect(sql).toContain("AND value = 'false'::jsonb")
    expect(sql).toContain('catalog capability flags are missing or not disabled')
    expect(sql).toContain('one-draft-per-base index is missing')
    expect(sql).toContain('abandon grants are not least privilege')
    expect(sql).toContain('guarded draft creation can be bypassed')

    expect(sql).not.toContain("'catalog_admin_enabled',\n    'true'::jsonb")
    expect(sql).not.toContain('ALTER TABLE public.boq')
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.boq\b/i)
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.factor_/i)
    expect(sql).not.toContain('SET factor_reference_version_id')
  })

  it('implements bounded WP-7.5 placement governance without enabling or applying it', () => {
    const sql = readMigration('021_master_catalog_phase4_placement_governance.sql')

    expect(sql).toContain('Migration 021: Master Catalog Phase 4 Placement Governance')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS placement_revision integer NOT NULL DEFAULT 0')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.catalog_placement_reviews')
    expect(sql).toContain('placement_payload jsonb NOT NULL')
    expect(sql).toContain('affected_row_count integer NOT NULL')
    expect(sql).toContain('FROM PUBLIC, anon, authenticated, service_role')
    expect(sql).toContain("has_table_privilege('service_role', 'public.catalog_placement_reviews', 'INSERT')")
    expect(sql).toContain("'placement'")
    expect(sql).toContain("'place'")
    expect(sql).toContain('DEFERRABLE INITIALLY IMMEDIATE')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.place_catalog_items_impl')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.place_catalog_items')
    expect(sql).toContain("'master_catalog_request:' || p_request_id::text")
    expect(sql).toContain('p_expected_placement_revision integer')
    expect(sql).toContain('PLACEMENT_REVISION_CONFLICT')
    expect(sql).toContain('PLACEMENT_ANCHOR_INVALID')
    expect(sql).toContain('PLACEMENT_ORDER_INVALID')
    expect(sql).toContain('P18_PLACEMENT_REVIEW_REQUIRED')
    expect(sql).toContain('trigger_touch_catalog_placement_revision')
    expect(sql).toContain('trigger_prevent_catalog_placement_review_mutation')
    expect(sql).toContain('NEW.placement_revision IS DISTINCT FROM OLD.placement_revision')
    expect(sql).toContain("current_setting('catalog.placement_write', true)")
    expect(sql).toContain("IF TG_OP IN ('INSERT', 'DELETE') THEN")
    expect(sql).toContain("current_setting('catalog.placement_invalidated_versions', true)")
    expect(sql).toContain("WHEN length(value->>'batchOrder') > 10 THEN NULL")
    expect(sql).toContain("setting.value = 'false'::jsonb")
    expect(sql).not.toContain("'catalog_new_identity_enabled',\n    'true'::jsonb")
    expect(sql).not.toContain('ALTER TABLE public.boq')
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.boq\b/i)
    expect(sql).not.toMatch(/\b(?:UPDATE|INSERT INTO|DELETE FROM)\s+public\.factor_/i)
    expect(sql).not.toContain('SET factor_reference_version_id')

    const bootstrap = readFileSync(resolve(process.cwd(), 'scripts/bootstrap-local-db.sh'), 'utf8')
    expect(bootstrap).not.toContain('021_master_catalog_phase4_placement_governance.sql')
    expect(bootstrap).not.toContain('/tmp/021.sql')
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
