import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

function expectInOrder(source: string, tokens: string[]) {
  let previousIndex = -1

  for (const token of tokens) {
    const index = source.indexOf(token)
    expect(index).toBeGreaterThan(previousIndex)
    previousIndex = index
  }
}

function expectRelativeMarkdownLinksToExist(path: string) {
  const source = read(path)
  const sourceDirectory = dirname(resolve(root, path))

  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim().split(/\s+['"]/)[0]
    target = target.replace(/^<|>$/g, '')

    if (/^(?:https?:|mailto:|#)/.test(target)) continue

    const fileTarget = decodeURIComponent(target.split('#')[0].split('?')[0])
    if (!fileTarget) continue

    expect(existsSync(resolve(sourceDirectory, fileTarget))).toBe(true)
  }
}

function markdownTableCells(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let inCode = false
  let escaped = false

  for (const character of line.trim()) {
    if (escaped) {
      cell += character
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      cell += character
      continue
    }
    if (character === '`') {
      inCode = !inCode
      cell += character
      continue
    }
    if (character === '|' && !inCode) {
      cells.push(cell.trim())
      cell = ''
      continue
    }
    cell += character
  }
  cells.push(cell.trim())

  if (cells[0] === '') cells.shift()
  if (cells.at(-1) === '') cells.pop()
  return cells
}

function expectMarkdownTablesToBeWellShaped(path: string) {
  const lines = read(path).split(/\r?\n/)

  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = markdownTableCells(lines[index])
    const separator = markdownTableCells(lines[index + 1])
    if (
      header.length === 0
      || separator.length !== header.length
      || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))
    ) {
      continue
    }

    let rowIndex = index + 2
    while (rowIndex < lines.length && lines[rowIndex].trim().startsWith('|')) {
      expect(markdownTableCells(lines[rowIndex])).toHaveLength(header.length)
      rowIndex += 1
    }
    index = rowIndex - 1
  }
}

describe('Master Catalog authority consistency', () => {
  it('keeps the canonical Local migration path in the approved order', () => {
    const bootstrap = read('scripts/bootstrap-local-db.sh')
    const appliedMigrations = [...bootstrap.matchAll(/-f \/tmp\/(\d{3})\.sql/g)]
      .map((match) => match[1])

    expect(appliedMigrations).toEqual([
      '009',
      '010',
      '011',
      '012',
      '013',
      '014',
      '015',
      '016',
      '017',
      '018',
      '019',
    ])

    expectInOrder(bootstrap, [
      '-f /tmp/010.sql',
      'idx_boq_price_list_version_id',
      '-f /tmp/011.sql',
    ])

    const migrations = read('docs/04_data/MIGRATIONS.md')
    expectInOrder(migrations, [
      '`016_hotfix_preserve_boq_item_suffix.sql`',
      '`017_master_catalog_phase4_foundation.sql`',
      '`018_master_catalog_phase4_draft_mutation.sql`',
      '`019_master_catalog_phase4_publish_pointer.sql`',
      '`020_master_catalog_phase4_admin_workflow_hardening.sql`',
      '`021_master_catalog_phase4_placement_governance.sql`',
    ])

    expect(migrations).toContain(
      '**P-22-amended candidate on `ac31feb`; repository/static passed, G1/G2 replacement Local evidence pending; not in bootstrap or Production**',
    )
    expect(migrations).toContain(
      '**Proposed only — P-18 pending; file does not exist; not in bootstrap**',
    )
    expect(existsSync(resolve(
      root,
      'migrations/020_master_catalog_phase4_admin_workflow_hardening.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/021_master_catalog_phase4_placement_governance.sql',
    ))).toBe(false)

    const packageJson = JSON.parse(read('package.json')) as {
      scripts?: Record<string, string>
    }
    expect(packageJson.scripts?.['db:local:smoke-master-catalog-wp66']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp66.mjs',
    )
    expect(existsSync(resolve(
      root,
      'scripts/smoke-master-catalog-wp66.mjs',
    ))).toBe(true)
  })

  it('keeps work-package sequencing and owner decisions explicit', () => {
    const executionPack = read(
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
    )
    expectInOrder(executionPack, [
      '## 11. WP-6 official Excel/PDF export',
      '## 12. WP-6.5 reliability and publish-boundary hardening',
      '## 13. WP-6.6 admin workflow completeness and authority hardening',
      '## 14. WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation',
      '## 15. WP-7.5 P-18 new-identity placement governance',
      '## 16. WP-8 clean local rehearsal',
    ])

    const decisions = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    expect(decisions).toContain(
      'Accepted 2026-07-11 22:20 +07; WP-6 complete; Production filing remains separate',
    )
    expect(decisions).toContain(
      'Proposed V1 documented 2026-07-12; owner/data-custodian acceptance pending; current Local guard evidence passed',
    )
    expect(decisions).toContain('P-19')
    expect(decisions).toContain('Pending; recorded 2026-07-07')
    expect(decisions).toContain(
      'Approved; WP-6.5C and post-`020` WP-6.6 reruns passed; WP-8/P-15 reruns pending',
    )
    expect(decisions).toContain(
      'Implementation/Local evidence passed 2026-07-12; owner closeout pending',
    )
    expect(decisions).toContain(
      'G0 approved 2026-07-12; source/static passed on `ac31feb`; G1/G2 Local resets and G3 closeout pending',
    )

    const tracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    expect(tracker).toMatch(/\| WP-6\.5 \|[^\n]+\| Ready for owner review \|/)
    expect(tracker).toMatch(/\| WP-6\.6 \|[^\n]+\| In progress \|/)
    expect(tracker).toMatch(/\| WP-7 \|[^\n]+\| Not started \|/)
    expect(tracker).toMatch(/\| WP-7\.5 \|[^\n]+\| Not started \|/)
    expect(tracker).toMatch(/\| WP-8 \|[^\n]+\| Not started \|/)
    expect(tracker).toContain('independent intended-admin UAT remains WP-8')
    expect(tracker).toContain('| Production write allowed | No |')
    expect(tracker).toContain(
      'P-22/G0 accepted for docs and Local-only implementation',
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/30-phase4-wp66-owner-review-note.md',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    ))).toBe(true)
  })

  it('keeps reliability commands and route recovery files tracked by contract', () => {
    const packageJson = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts).toMatchObject({
      'db:local:smoke-master-catalog-wp65': expect.stringContaining(
        'scripts/smoke-master-catalog-wp65.mjs',
      ),
      'db:local:proxy-master-catalog-wp65-response-loss': expect.stringContaining(
        'scripts/proxy-master-catalog-wp65-response-loss.mjs',
      ),
      'db:local:verify-master-catalog-p20': expect.stringContaining(
        'scripts/verify-master-catalog-p20-evidence.mjs',
      ),
      'catalog:authority:check': expect.stringContaining(
        'scripts/generate-master-catalog-wp66-authority.mjs --check',
      ),
      'artifacts:master-catalog:generate': expect.stringContaining(
        'scripts/generate-master-catalog-artifact-proof.mjs',
      ),
      'artifacts:master-catalog:verify': expect.stringContaining(
        'scripts/verify-master-catalog-artifacts.mjs',
      ),
    })

    for (const path of [
      'app/admin/master-catalog/loading.tsx',
      'app/admin/master-catalog/error.tsx',
      'app/admin/master-catalog/versions/[versionId]/not-found.tsx',
      'scripts/smoke-master-catalog-wp65.mjs',
      'scripts/proxy-master-catalog-wp65-response-loss.mjs',
      'scripts/verify-master-catalog-p20-evidence.mjs',
      'scripts/generate-master-catalog-artifact-proof.mjs',
      'scripts/verify-master-catalog-artifacts.mjs',
    ]) {
      expect(existsSync(resolve(root, path))).toBe(true)
    }

    const wp65Harness = read('scripts/smoke-master-catalog-wp65.mjs')
    expect(wp65Harness).toContain("args[0] !== '--output'")
    expect(wp65Harness).toContain("flag: 'wx'")
    expect(wp65Harness).toContain('formatHarnessError(currentStage, error)')
    expect(wp65Harness).toContain("select('*', { count: 'exact', head: true })")

    const responseLossProxy = read('scripts/proxy-master-catalog-wp65-response-loss.mjs')
    expect(responseLossProxy).toContain("state.status = 'awaiting_same_id_retry'")
    expect(responseLossProxy).toContain('state.sameRequestId')
    expect(responseLossProxy).toContain('state.responseRequestIdMatches')
    expect(responseLossProxy).toContain('state.duplicateRequest')
    expect(responseLossProxy).toContain('assertTrackedTreeClean()')
    expect(responseLossProxy).toContain("'apply_catalog_changes'")
    expect(responseLossProxy).toContain('ALLOWED_RPC_NAMES.has(value)')
  })

  it('keeps WP-6.6 runtime authority explicit, frozen, and fail-closed', () => {
    const importContext = read('lib/master-catalog/admin/importContext.ts')
    const capabilities = read('lib/master-catalog/admin/capabilities.ts')
    const versionWorkspace = read(
      'app/admin/master-catalog/_components/MasterCatalogVersionWorkspace.tsx',
    )
    const itemEditor = read(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    )
    const importPanel = read(
      'app/admin/master-catalog/_components/MasterCatalogImportPanel.tsx',
    )

    expect(importContext).toContain(".from('catalog_first_rollout_mappings')")
    expect(importContext).toContain(".from('catalog_first_rollout_source_exclusions')")
    expect(importContext).not.toMatch(/(?:node:fs|readFile|phase4-reconciliation-draft\.csv)/)
    expect(importContext).toContain('selectedDraftId')
    expect(importContext).not.toContain('selectWorkingCatalogDraft')

    expect(capabilities).toContain('newIdentityEnabled: false')
    expect(capabilities).toContain('retirementEnabled: false')
    expect(versionWorkspace).toContain('allowAdd')
    expect(versionWorkspace).toContain('{editable && allowAdd ? (')
    expect(itemEditor).toContain('item.capabilities.retirementEnabled')
    expect(importPanel).toContain('key={prepared.normalizedPayloadHash}')
    const adminViews = read(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    )
    expect(adminViews).toContain("key={`${importContext.draft?.id ?? 'no-draft'}:${importContext.draft?.lockVersion ?? 0}`}")

    expect(existsSync(resolve(
      root,
      'app/admin/master-catalog/versions/[versionId]/items/[identityId]/page.tsx',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'app/admin/master-catalog/versions/[versionId]/items/[identityId]/not-found.tsx',
    ))).toBe(true)
    const itemRoute = read(
      'app/admin/master-catalog/versions/[versionId]/items/[identityId]/page.tsx',
    )
    expect(itemRoute).toContain('loadCatalogItemDetail(supabase, versionId, identityId)')
  })

  it('keeps core authority links resolvable', () => {
    for (const path of [
      'docs/01_overview/IMPLEMENTATION_PLAN.md',
      'docs/01_overview/ROADMAP.md',
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/08-phase4-architecture-ci-plan.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/16-phase4-release-note-template.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/20-phase4-official-export-spec.md',
      'docs/plans/master-catalog/21-phase4-architecture-review-disposition.md',
      'docs/plans/master-catalog/22-phase4-post-factor-f-adjustment-plan.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/27-phase4-wp6-owner-review-note.md',
      'docs/plans/master-catalog/28-phase4-p18-placement-governance-review-note.md',
      'docs/plans/master-catalog/29-phase4-owner-dev-completeness-audit.md',
    ]) {
      expectRelativeMarkdownLinksToExist(path)
      expectMarkdownTablesToBeWellShaped(path)
    }
  })
})
