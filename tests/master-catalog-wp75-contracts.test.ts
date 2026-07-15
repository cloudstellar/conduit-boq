import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Master Catalog WP-7.5 live evidence contracts', () => {
  it('wires a Local-only, clean-tree, evidence-producing harness', () => {
    const packageJson = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>
    }
    const smoke = read('scripts/smoke-master-catalog-wp75.mjs')

    expect(packageJson.scripts['db:local:smoke-master-catalog-wp75']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp75.mjs',
    )
    expect(smoke).toContain('readLoopbackOrigin')
    expect(smoke).toContain('assertTrackedTreeClean()')
    expect(smoke).toContain('tmp/master-catalog/wp75-evidence')
    expect(smoke).toContain('productionTouched: false')
    expect(smoke).toContain("includedInBootstrapSource: true")
    expect(smoke).toContain("bootstrapExecutionProvenance: 'external-p36-gate'")
    expect(smoke).not.toContain('supabase db reset')
    expect(smoke).not.toContain('db:local:bootstrap')
  })

  it('covers schema, least privilege, role denial, and the temp-aware lint exception', () => {
    const smoke = read('scripts/smoke-master-catalog-wp75.mjs')

    expect(smoke).toContain('readSchemaContract()')
    expect(smoke).toContain('readTempAwarePlacementLint()')
    expect(smoke).toContain('CREATE TEMP TABLE catalog_placement_input')
    expect(smoke).toContain('CREATE TEMP TABLE catalog_placement_target')
    expect(smoke).toContain('plpgsql_check_function')
    expect(smoke).toContain('tempAwareLintFindings.length === 0')
    expect(smoke).toContain('assertDirectReviewWritesDenied()')
    expect(smoke).toContain("'inactive admin placement'")
    expect(smoke).toContain("'staff placement'")
    expect(smoke).toContain('Anonymous caller executed placement')
  })

  it('covers invalid placement, rollback, concurrency, replay, and stale review recovery', () => {
    const smoke = read('scripts/smoke-master-catalog-wp75.mjs')
    const migration = read('migrations/021_master_catalog_phase4_placement_governance.sql')

    for (const code of [
      'PLACEMENT_SCOPE_INVALID',
      'PLACEMENT_ORDER_INVALID',
      'PLACEMENT_ANCHOR_INVALID',
      'DRAFT_LOCK_CONFLICT',
      'PLACEMENT_REVISION_CONFLICT',
      'REQUEST_ID_PAYLOAD_MISMATCH',
    ]) {
      expect(smoke).toContain(`'${code}'`)
    }

    expect(smoke).toContain('installInjectedFailureTrigger()')
    expect(smoke).toContain('Injected placement failure left a partial mutation')
    expect(smoke).toContain('Promise.all(raceAttempts.map')
    expect(smoke).toContain('winnerIndexes.length === 1')
    expect(smoke).toContain('replay.duplicateRequest')
    expect(smoke).toContain('Prior placement stayed current after a new add')
    expect(smoke).toContain('Normal edit invalidated placement')
    expect(migration).toContain(
      'SET CONSTRAINTS public.uq_price_list_version_display_order DEFERRED;',
    )
    expect(migration).not.toContain(
      'SET CONSTRAINTS uq_price_list_version_display_order DEFERRED;',
    )
  })

  it('proves ordered audit, publication hash, pointer restoration, and domain isolation', () => {
    const smoke = read('scripts/smoke-master-catalog-wp75.mjs')

    expect(smoke).toContain('assertPlacementResult')
    expect(smoke).toContain('Placement changed inherited relative order')
    expect(smoke).toContain('Shifted/new row audit is incomplete')
    expect(smoke).toContain('readIndependentCanonicalHash')
    expect(smoke).toContain('Independent canonical hash differs from publication')
    expect(smoke).toContain('assertPublishedReviewImmutable')
    expect(smoke).toContain('WP-7.5 did not restore 2568.0.0')
    expect(smoke).toContain('WP-7.5 changed BOQ bindings')
    expect(smoke).toContain('WP-7.5 changed Factor F state')
    expect(smoke).toContain('workingDraftCount === 0')
    expect(smoke).toContain("featureFlagsRestored: true")
    expect(smoke).toContain("Admin flag was not restored")
  })
})
