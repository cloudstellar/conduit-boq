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
      '**G1R/G2-passed Local-only candidate on exact execution checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; P-20 comparison and no-reset G3 technical route passed; explicit G3 owner accept/hold and G4 remain required; not in bootstrap or Production**',
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
    const wp66Smoke = read('scripts/smoke-master-catalog-wp66.mjs')
    expect(wp66Smoke).toContain('schemaContract.authority_fk_indexes === 2')
    expect(wp66Smoke).toContain("'VERSION_SEQUENCE_STALE'")
    expect(wp66Smoke).toContain('sameCandidateRaceNormalized: true')
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
      'Approved contract; final G1R/G2 comparison passed; WP-8/P-15 reruns pending',
    )
    expect(decisions).toContain(
      'WP-6.6 P-24/G1R',
    )
    expect(decisions).toContain(
      'final G1R/G2 passed on exact `721c2c2`; G3 technical execution passed on `6599c30`; owner accept/hold remains separate',
    )
    expect(decisions).toContain(
      'bounded implementation/visual evidence passed; independent real-route stale-after-review technical UAT also passed on `6599c30`; explicit G3 owner acceptance remains pending',
    )
    expect(decisions).toContain('| L-56 |')
    expect(decisions).toContain('| P-26 |')
    expect(decisions).toContain('DB-read version in the Server Action before the publish RPC')

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
      'P-26 bounded application/tests/docs and no-reset Local human-intent proof were authorized on 2026-07-14',
    )
    expect(tracker).toContain(
      'P-26 typed Publish plus Recode/Retire confirmations passed on a candidate based on `2fd438d`',
    )
    expect(tracker).toContain(
      'Migration 020 SHA-256: e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93',
    )
    expect(tracker).toContain(
      'G1R/G2 exact checkout 721c2c2c4a234a4fd00e5686383be9af87ee15dd',
    )
    expect(tracker).toContain(
      'd5da2ceeb5871160ac8cdf8dfe34ffdee220e20c8880e001e42c0bbaaea13f43',
    )
    expect(tracker).toContain(
      '98b9f5fb9e0135ea35a716c87e1f4916e7aa1d186ce68ed067ea02d81b0bce42',
    )
    expect(tracker).toContain(
      'Evidence: `output/master-catalog/g3-owner-review/20260714-p25-final-review/qa-report.json`',
    )
    expect(tracker).toContain(
      'full suite passed 30 files/162 tests',
    )
    expect(tracker).toContain(
      '050c998361f3372bd3bf9fb6645dc4abd1c0bf2b` is the exact P-24 same-scope closure-lineage checkpoint',
    )
    expect(tracker).not.toContain('Blockers: exact candidate commit;')
    expect(tracker).not.toContain('Blockers: clean correction commit')
    expect(tracker).not.toContain('Commit the closure before requesting G1R')
    expect(tracker).not.toContain('must be committed before G1R')
    expect(tracker).not.toContain('review/commit P-23.1 working-tree candidate')
    expect(tracker).toMatch(
      /pre-amendment operator\/browser preflight passed on\s+`c8f6dca`/,
    )
    expect(tracker).toContain(
      'P-26 high-impact confirmation/cancel/cleanup proof passed on a candidate based on 2fd438d; candidate 020 remains outside bootstrap; explicit G3 owner decision and G4 remain pending',
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/30-phase4-wp66-owner-review-note.md',
    ))).toBe(true)
    const ownerReview = read(
      'docs/plans/master-catalog/30-phase4-wp66-owner-review-note.md',
    )
    expect(ownerReview).not.toContain('A new exact commit,')
    expect(ownerReview).toContain(
      '**Current migration `020` SHA-256:** `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`',
    )
    expect(ownerReview).toContain(
      '**P-24 closure-lineage checkpoint:** `050c998361f3372bd3bf9fb6645dc4abd1c0bf2b`',
    )
    expect(ownerReview).toContain(
      '**G1R execution checkout:** `721c2c2c4a234a4fd00e5686383be9af87ee15dd`',
    )
    expect(ownerReview).toContain(
      '**G2 execution checkout:** `721c2c2c4a234a4fd00e5686383be9af87ee15dd`',
    )
    expect(ownerReview).toContain(
      '**G3 source HEAD:** `6599c306207c2d1e15342c398888b56513f9bb0a`',
    )
    expect(ownerReview).toContain(
      '**P-26 source base HEAD:** `2fd438dd3417850faca572b9e5e5561e944df345`',
    )
    expect(ownerReview).toMatch(
      /technical recommendation is\s+\*\*Accept G3\*\*/,
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    ))).toBe(true)
    const correctionPlan = read(
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    )
    expect(correctionPlan).toContain(
      'Passed and committed on exact closure-lineage commit `050c998`',
    )
    expect(correctionPlan).toContain(
      '| G1R | Explicitly owner-approved and passed 2026-07-13',
    )
    expect(correctionPlan).toContain(
      '| G2 | Explicitly owner-approved and passed 2026-07-13',
    )
    expect(correctionPlan).toContain(
      'G2 independent reproducibility result',
    )
    expect(correctionPlan).toContain(
      'This passes the G3 technical walkthrough. It does not infer the owner\'s',
    )
    expect(correctionPlan).toContain('## 20. P-26 high-impact human-intent guard')
    expect(correctionPlan).toContain('This closes Audit #29 C-17 technically.')
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

  it('keeps P-23.1/P-24 version planning and operator recovery aligned', () => {
    const adr = read(
      'docs/02_architecture/ADR/ADR-003-master-catalog-rollout-and-version-numbering.md',
    )
    const contract = read(
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
    )
    const procedure = read(
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
    )
    const correction = read(
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    )

    for (const source of [adr, contract, correction]) {
      expect(source).toContain('annual')
      expect(source).toContain('revision')
      expect(source).toContain('patch')
      expect(source).toContain('reserved')
    }
    expect(contract).toContain('VERSION_SEQUENCE_STALE')
    expect(contract).toContain('VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE')
    expect(adr).toContain('10 years after that base')
    expect(procedure).toContain('สร้างและเปิดพื้นที่ทำงาน')
    expect(procedure).toContain('historical BOQs do not change')
    expect(correction).toContain('| G1R |')
    expect(correction).toContain('| G2 |')
  })

  it('keeps P-26 human-intent guards aligned across code and operator authority', () => {
    const audit = read(
      'docs/plans/master-catalog/29-phase4-owner-dev-completeness-audit.md',
    )
    const executionPack = read(
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
    )
    const procedure = read(
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
    )
    const actions = read('app/admin/master-catalog/actions.ts')
    const actionModel = read('lib/master-catalog/admin/actionModel.ts')
    const mutationPanel = read(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    )
    const itemEditor = read(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    )

    expect(audit).toContain('| C-17 |')
    expect(audit).toContain('- L: high-impact human-intent confirmation')
    expect(executionPack).toContain('| L High-impact human-intent confirmation |')
    expect(procedure).toContain('**ยืนยันและเผยแพร่** disabled')
    expect(actionModel).toContain('PUBLICATION_CONFIRMATION_MISMATCH')
    expect(actionModel).toContain('validateCatalogPublishVersionConfirmation')
    expectInOrder(actions, [
      ".from('price_list_versions')",
      'validateCatalogPublishVersionConfirmation(',
      "supabase.rpc('publish_catalog_version'",
    ])
    expect(mutationPanel).toContain('name="confirmedVersionString"')
    expect(mutationPanel).toContain('พิมพ์ {draftVersion.versionString} เพื่อยืนยัน')
    expect(itemEditor).toContain("action !== 'recode' && action !== 'retire'")
    expect(itemEditor).toContain('ประวัติและ BOQ เดิมไม่ถูกเขียนทับ')
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
      'docs/plans/master-catalog/30-phase4-wp66-owner-review-note.md',
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    ]) {
      expectRelativeMarkdownLinksToExist(path)
      expectMarkdownTablesToBeWellShaped(path)
    }
  })
})
