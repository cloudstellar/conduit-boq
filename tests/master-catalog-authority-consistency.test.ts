import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

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

function expectP12ProductionAuthorityConsumed(source: string) {
  const markers = [
    ...source.matchAll(
      /<!-- P12_RUNNER_AUTHORITY_CONSUMED_V1 (\{[^\n]+\}) -->/g,
    ),
  ]

  expect(markers).toHaveLength(1)
  expect(JSON.parse(markers[0][1])).toEqual({
    executionGitHead: 'b8a80d24ccd4e205f349216d22dac0cfef714ebe',
    approvalRecordSha256:
      '30bd194cae9f885d2cb71d9f3497153ff6731ea2b1ccaa752f31a07dc4dd887f',
    attemptedStep: '017',
    evidenceManifestSha256:
      '87533c8a8795d00ad1934a80c71540eab21df40cb424b538cc6758a3581acb1c',
    outcomeSha256:
      '8ace5309120c4cb257fa4fe1ad49262dd4bb6b6cee448e111280e34c9e68ad45',
    afterStateSha256:
      'da7ec851e800a4579dc56c80809cebdba352437ba1d06eec25312a5933ced342',
    verifiedStageAfter: '016',
    disposition: 'hard-stop-consumed-no-retry-authority',
    productionMutationObserved: false,
    retryAuthorized: false,
    freshGoRequired: true,
  })
  expect(source).toContain(
    'The native CLI stopped before applying that migration\nbecause the frozen workdir omitted seven older versions already present in the\nProduction migration ledger.',
  )
  expect(source).toContain('no Production mutation was observed.')
  expect(source).toContain(
    'until a fresh\nOwner GO and new `P12_RUNNER_AUTHORITY_V2` checkpoint.',
  )
  const completedAuthorityMarkers = [
    ...source.matchAll(
      /<!-- P12_RUNNER_AUTHORITY_CONSUMED_V2 (\{[^\n]+\}) -->/g,
    ),
  ]
  const productionCloseoutMarkers = [
    ...source.matchAll(
      /<!-- P12_PRODUCTION_CLOSEOUT_V1 (\{[^\n]+\}) -->/g,
    ),
  ]
  const backupCloseoutMarkers = [
    ...source.matchAll(
      /<!-- P12_POST026_BACKUP_CLOSEOUT_V1 (\{[^\n]+\}) -->/g,
    ),
  ]

  expect(completedAuthorityMarkers).toHaveLength(1)
  expect(productionCloseoutMarkers).toHaveLength(1)
  expect(backupCloseoutMarkers).toHaveLength(1)
  expect(JSON.parse(completedAuthorityMarkers[0][1])).toMatchObject({
    decision: 'GO_CONSUMED_COMPLETE',
    executionGitHead: '7c5ac6bd88677c0144bf8b8933b39293a2dee866',
    stage026EvidenceManifestSha256:
      '5a029dd507471ab5d74375bd3f2afba931096e9f2c208ff836b68d1dd5881e47',
    finalCloseoutEvidenceManifestSha256:
      '2fb1259249282315750ce20d41732fd9f6c5e65998aa772fc4e387c5368d64a5',
    phase4FlagsRemainFalse: true,
    p12Complete: true,
    p13Authorized: false,
    automaticNextStep: false,
  })
  expect(JSON.parse(productionCloseoutMarkers[0][1])).toMatchObject({
    schema: 'conduit-boq/master-catalog-p12-production-closeout/v1',
    status: 'COMPLETE',
    finalMachineGateSha256:
      '33fdccc0c6b1e58e2b919c5bf246b62a5b2558461c70b2a329b11a10e9ad3085',
    finalCloseoutEvidenceManifestSha256:
      '2fb1259249282315750ce20d41732fd9f6c5e65998aa772fc4e387c5368d64a5',
    verificationMode: 'owner-authorized-objective-machine-gates',
    newIndependentVerifierClaim: false,
    phase4FlagsRemainFalse: true,
    p12Complete: true,
    p13Authorized: false,
    automaticNextStep: false,
  })
  expect(JSON.parse(backupCloseoutMarkers[0][1])).toMatchObject({
    schema: 'conduit-boq/master-catalog-p12-post026-backup-closeout/v1',
    status: 'COMPLETE',
    attemptId: 'p12-post026-backup-v7-fddaaef72c5ff80c',
    runtimeStatusSha256:
      '72d2f10358c99565aa2853b02a6bbcf61cc8812f24f2d665498bfd13d7c98d19',
    dumpSha256:
      'd44286409cad41fff8f977acdafbf6eaecdecb5692381a37fdb8f8f95b9ba538',
    dumpBytes: 776850,
    checksumEntriesPassed: 10,
    previousAttemptReused: false,
    productionMutationAuthorized: false,
    migrationPerformed: false,
    encrypted: true,
    readonlyReopenVerified: true,
    detached: true,
    p12SidePrerequisitesComplete: true,
    p13Authorized: false,
    automaticNextStep: false,
  })
  expectInOrder(source, [
    'P12_RUNNER_AUTHORITY_CONSUMED_V1',
    'P12_RUNNER_AUTHORITY_CONSUMED_V2',
    'P12_PRODUCTION_CLOSEOUT_V1',
    'P12_POST026_BACKUP_CLOSEOUT_V1',
  ])
  expect(source).not.toMatch(/<!-- P12_RUNNER_AUTHORITY_V[12] /)
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
    const appliedMigrations = [...bootstrap.matchAll(/-f \/tmp\/(\d{3}[a-z]?)\.sql/g)]
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
      '017a',
      '018',
      '019',
      '020',
      '021',
      '022',
      '023',
      '024',
      '025',
      '026',
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
      '`017a_master_catalog_phase4_global_function_default_privileges.sql`',
      '`018_master_catalog_phase4_draft_mutation.sql`',
      '`019_master_catalog_phase4_publish_pointer.sql`',
      '`020_master_catalog_phase4_admin_workflow_hardening.sql`',
      '`021_master_catalog_phase4_placement_governance.sql`',
      '`022_master_catalog_phase4_draft_identity_and_release_number.sql`',
      '`023_master_catalog_phase4_published_code_rls_scope.sql`',
      '`024_master_catalog_phase4_set_based_placement_invalidation.sql`',
      '`025_master_catalog_phase4_withdraw_order_compaction.sql`',
      '`026_master_catalog_phase4_catalog_action_error_acl.sql`',
    ])

    expect(migrations).toContain(
      '**Owner-accepted Local-only migration in bootstrap source; SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; G1R/G2 separate-apply evidence passed on exact checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; G3/WP-6.6 accepted on `78e96ab3ed9993707014c4aba1d285b7592b17a1`; owner-approved G4E combined clean bootstrap through `020` passed on exact execution checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; not Production-approved**',
    )
    expect(migrations).toContain(
      'P-32 separate-apply evidence/P-33 technical acceptance/P-34 historical UX source-static/P-36 integrated technical evidence passed; first P-37 intended-admin UAT failed comprehension, while corrected technical/recovery evidence and the final owner keyboard/focus/presentation UAT later passed',
    )
    expect(migrations).toContain(
      'exact no-reset D007 on pushed `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa` closed C-08 and restored the disabled baseline; P-37 was Owner-accepted on 2026-07-25 under the explicitly recorded guided-UAT variance against exact implementation checkpoint `df44b827b290933463da5e14fa9125314660022a`; evidence remains labelled guided rather than independent; DB contract unchanged; not Production-approved',
    )
    expect(existsSync(resolve(
      root,
      'migrations/020_master_catalog_phase4_admin_workflow_hardening.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/021_master_catalog_phase4_placement_governance.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/022_master_catalog_phase4_draft_identity_and_release_number.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/023_master_catalog_phase4_published_code_rls_scope.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/024_master_catalog_phase4_set_based_placement_invalidation.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/025_master_catalog_phase4_withdraw_order_compaction.sql',
    ))).toBe(true)
    expect(existsSync(resolve(
      root,
      'migrations/026_master_catalog_phase4_catalog_action_error_acl.sql',
    ))).toBe(true)
    const migration022Sha256 = createHash('sha256')
      .update(read('migrations/022_master_catalog_phase4_draft_identity_and_release_number.sql'))
      .digest('hex')
    for (const authorityPath of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
    ]) {
      expect(read(authorityPath)).toContain(migration022Sha256)
    }
    const migration024Sha256 = createHash('sha256')
      .update(read('migrations/024_master_catalog_phase4_set_based_placement_invalidation.sql'))
      .digest('hex')
    for (const authorityPath of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
    ]) {
      expect(read(authorityPath)).toContain(migration024Sha256)
    }
    const migration025Sha256 = createHash('sha256')
      .update(read('migrations/025_master_catalog_phase4_withdraw_order_compaction.sql'))
      .digest('hex')
    for (const authorityPath of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md',
    ]) {
      expect(read(authorityPath)).toContain(migration025Sha256)
    }
    const migration026Sha256 = createHash('sha256')
      .update(read('migrations/026_master_catalog_phase4_catalog_action_error_acl.sql'))
      .digest('hex')
    for (const authorityPath of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/08-phase4-architecture-ci-plan.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
      'docs/plans/master-catalog/44-phase4-p46-catalog-action-error-callability-finding.md',
    ]) {
      expect(read(authorityPath)).toContain(migration026Sha256)
    }

    const packageJson = JSON.parse(read('package.json')) as {
      scripts?: Record<string, string>
    }
    expect(packageJson.scripts?.['db:local:smoke-master-catalog-wp66']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp66.mjs',
    )
    expect(packageJson.scripts?.['db:local:smoke-master-catalog-wp7']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp7.mjs',
    )
    expect(packageJson.scripts?.['db:local:smoke-master-catalog-wp75']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp75.mjs',
    )
    expect(packageJson.scripts?.['db:local:p38:verify-inputs']).toBe(
      'node scripts/manage-master-catalog-p38-owner-uat.mjs verify-inputs',
    )
    expect(packageJson.scripts?.['db:local:p38:prepare']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/manage-master-catalog-p38-owner-uat.mjs prepare',
    )
    expect(packageJson.scripts?.['db:local:p38:status']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/manage-master-catalog-p38-owner-uat.mjs status',
    )
    expect(packageJson.scripts?.['db:local:p38:cleanup']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/manage-master-catalog-p38-owner-uat.mjs cleanup',
    )
    expect(existsSync(resolve(
      root,
      'scripts/smoke-master-catalog-wp66.mjs',
    ))).toBe(true)
    const wp66Smoke = read('scripts/smoke-master-catalog-wp66.mjs')
    expect(wp66Smoke).toContain('schemaContract.authority_fk_indexes === 2')
    expect(wp66Smoke).toContain("'VERSION_SEQUENCE_STALE'")
    expect(wp66Smoke).toContain('sameCandidateRaceNormalized: true')
    expect(wp66Smoke).toContain('releasedTargetReused: true')
    expect(wp66Smoke).toContain('draft_reference_index === true')
    expect(wp66Smoke).toContain('draft_identity_generated_columns === 2')
    expect(existsSync(resolve(
      root,
      'scripts/smoke-master-catalog-wp7.mjs',
    ))).toBe(true)
    const wp7Smoke = read('scripts/smoke-master-catalog-wp7.mjs')
    expect(wp7Smoke).toContain('approvedSuffixesPassed: true')
    expect(wp7Smoke).toContain('crossVersionItemRejectedAtomically: true')
    expect(wp7Smoke).toContain('productionTouched: false')
    expect(existsSync(resolve(
      root,
      'scripts/manage-master-catalog-p38-owner-uat.mjs',
    ))).toBe(true)
    const p38Harness = read('scripts/manage-master-catalog-p38-owner-uat.mjs')
    expect(p38Harness).toContain("const MARKER = 'LOCAL-UAT-ONLY-NOT-AUTHORITY'")
    expect(p38Harness).toContain('assertTrackedTreeClean()')
    expect(p38Harness).toContain('assertHeadPushed()')
    expect(p38Harness).toContain('P-38 prepare requires branch codex/master-catalog-phase4')
    expect(p38Harness).toContain('P-38 requires HEAD to match the pushed upstream checkpoint')
    expect(p38Harness).toContain('metadata.sourceHead === gitHead()')
    expect(p38Harness).toContain(
      '1296f1056f6c1cd768b23c5ac3e6c00462dce018c3bb7710f62c067ee0e63b92',
    )
    expect(p38Harness).toContain(
      'sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8',
    )
    expect(p38Harness).toContain("catalog_retirement_enabled: false")
    expect(p38Harness).toContain("'full-owner-uat'")
    expect(p38Harness).toContain("'bounded-spot-check'")
    expect(p38Harness).toContain('expectedCreatedVersions: 2')
    expect(p38Harness).toContain('expectedCreatedVersions: 1')
    expect(p38Harness).toContain('scenarioContract.expectedCreatedVersions')
    expect(p38Harness).toContain('scenarioContract.requiresReplacementPair')
    expect(p38Harness).toContain("metadata.schemaVersion === LEGACY_SESSION_SCHEMA")
    expect(p38Harness).toContain("version.status === 'abandoned'")
    expect(p38Harness).toContain('version.version_string === null')
    expect(p38Harness).toContain('version.draft_reference')
    expect(p38Harness).toContain('version.target_version_string')
    expect(p38Harness).toContain(
      'cleanup restored Local flags before refusing evidence closure',
    )
    expect(p38Harness).toContain('must be a loopback URL for Local-only P-38 work')
    expect(p38Harness).toContain('createViteServer')
    expect(p38Harness).toContain("server.ssrLoadModule('/lib/master-catalog/import/workbookAdapter.ts')")
    expect(p38Harness).toContain('applicationParser.profile.normalizeRow')
    expect(p38Harness).toContain('Application parser row count differs')
    expect(p38Harness).toContain('const categories = data ?? []')
    expect(p38Harness).not.toContain('rows(data)')
    expect(p38Harness).not.toContain(".rpc(")
    expect(p38Harness).not.toContain('create_catalog_draft')
    expect(p38Harness).not.toContain('abandon_catalog_draft')
    expect(p38Harness).not.toContain('db:local:bootstrap')
  })

  it('keeps Phase 4 feature-flag gates aligned to migration stage', () => {
    const stageAuthorityPaths = [
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    ]

    for (const authorityPath of stageAuthorityPaths) {
      const authority = read(authorityPath)
      expect(authority).toContain('before `017`')
      expect(authority).toMatch(
        /after[\s\S]{0,80}`017`[\s\S]{0,40}`017a`[\s\S]{0,40}`018`[\s\S]{0,40}`019`/i,
      )
      expect(authority).toMatch(/after(?: each of)? `020`-`026`/i)
      expect(authority).toContain('`catalog_admin_enabled`')
      expect(authority).toContain('`catalog_new_identity_enabled`')
      expect(authority).toContain('`catalog_retirement_enabled`')
      expect(authority).toContain('boolean `false`')
      expect(authority).toMatch(/boolean\s+`true`/)
    }

    const migration017 = read(
      'migrations/017_master_catalog_phase4_foundation.sql',
    )
    const migration020 = read(
      'migrations/020_master_catalog_phase4_admin_workflow_hardening.sql',
    )

    expect(migration017).toContain("'catalog_admin_enabled'")
    expect(migration017).not.toContain("'catalog_new_identity_enabled'")
    expect(migration017).not.toContain("'catalog_retirement_enabled'")
    expect(migration020).toContain("'catalog_new_identity_enabled'")
    expect(migration020).toContain("'catalog_retirement_enabled'")
  })

  it('keeps work-package sequencing and owner decisions explicit', () => {
    const reviewGuide = read(
      'docs/plans/master-catalog/00-phase4-review-guide.md',
    )
    const executionPack = read(
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
    )
    expect(reviewGuide).toContain('WP-0 ถึง WP-8 complete')
    expect(reviewGuide).toContain('guided-UAT variance')
    expect(reviewGuide).not.toContain('WP-8 ยัง In progress')
    expectInOrder(executionPack, [
      '## 11. WP-6 official Excel/PDF export',
      '## 12. WP-6.5 reliability and publish-boundary hardening',
      '## 13. WP-6.6 admin workflow completeness and authority hardening',
      '## 14. WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation',
      '## 15. WP-7.5 P-18 new-identity placement governance',
      '## 16. Historical WP-8 clean local rehearsal',
    ])
    for (const contract of [
      'Placement UX hard gates for the full Add/Supplement release',
      '**Truthful local state:**',
      '**Safe continuation:**',
      '**Review by exception:**',
      '**Impact before commit:**',
      '**Keyboard and pointer equivalence:**',
      '**Measured scale:**',
      '**Independent comprehension:**',
    ]) {
      expect(executionPack).toContain(contract)
    }

    const decisions = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    expect(decisions).toContain(
      'Accepted 2026-07-11 22:20 +07; WP-6 complete; Production filing remains separate',
    )
    expect(decisions).toContain(
      'Accepted via P-30; P-32/P-33 technical scope and P-36 integrated technical rehearsal passed; independent intended-admin WP-8/P-14 release evidence and Production remain separate',
    )
    expect(decisions).toContain('P-19')
    expect(decisions).toContain('Pending; recorded 2026-07-07')
    expect(decisions).toContain(
      'Approved contract; final G1R/G2 comparison and P-36 integrated rerun passed; P-15 acceptance pending',
    )
    expect(decisions).toContain(
      'WP-6.6 P-24/G1R',
    )
    expect(decisions).toContain(
      'final G1R/G2 passed on exact `721c2c2`; G3 closeout accepted via P-27 on exact `78e96ab`',
    )
    expect(decisions).toContain(
      'bounded visual and real-route evidence accepted through P-27',
    )
    expect(decisions).toContain('| L-56 |')
    expect(decisions).toContain('| P-26 |')
    expect(decisions).toContain('| P-27 |')
    expect(decisions).toContain('| P-28 |')
    expect(decisions).toContain('| P-29 |')
    expect(decisions).toContain('| P-30 |')
    expect(decisions).toContain('| P-31 |')
    expect(decisions).toContain('| P-32 |')
    expect(decisions).toContain('| P-33 |')
    expect(decisions).toContain('| P-34 |')
    expect(decisions).toContain('| P-35 |')
    expect(decisions).toContain(
      '01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a',
    )
    expect(decisions).toContain('| P-36 |')
    expect(decisions).toContain('| P-37 |')
    expect(decisions).toContain('| P-38 |')
    expect(decisions).toContain('| P-39 |')
    expect(decisions).toContain(
      'P-37 first intended-admin UAT result recorded',
    )
    expect(decisions).toContain(
      'The bounded working-tree correction replaces that',
    )
    expect(decisions).toContain(
      'preserving the category/anchor/relation DB payload',
    )
    expect(decisions).toContain(
      'Accepted 2026-07-15 13:54 +07 for the exact bounded technical checkpoint; WP-7.5 technically complete; no bootstrap, WP-8, feature, publication, or Production authorization inferred',
    )
    expect(decisions).toContain(
      'Authorized and source/static-passed 2026-07-15; historical source checkpoint only',
    )
    expect(decisions).toContain(
      'Approved and source/static-passed 2026-07-15 on exact checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`; P-36 remained separately gated and later passed',
    )
    expect(decisions).toContain(
      'Approved and technically passed 2026-07-15 on exact gate/execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; Local only; interaction/UAT acceptance remains P-37',
    )
    expect(decisions).toContain(
      'fresh independent scored Card A later stopped under P-42 after an unintended',
    )
    expect(decisions).toContain(
      'P-42 later retained Card B-E evidence and reduced the current pass to four spot-checks',
    )
    expect(decisions).toContain(
      'Approved 2026-07-18 for Local-only architecture/source/migration/docs/verification',
    )
    expect(decisions).toContain('| L-57 |')
    expect(decisions).toContain('| L-58 |')
    expect(decisions).toContain('| L-60 |')
    expect(decisions).toContain('| L-63 |')
    expect(decisions).toContain('| L-64 |')
    expect(decisions).not.toContain('and documentation alignment remain open')
    expect(decisions).toContain('review-by-exception')
    expect(decisions).toContain(
      'Accepted 2026-07-14 23:50 +07; WP-6.6 complete; G4 and all later gates remain separate',
    )
    expect(decisions).toContain(
      'Approved 2026-07-15 for repository/source work only; G4 clean execution and live WP-7 remained pending at this point and were later decided under P-29',
    )
    expect(decisions).toContain(
      'Approved and executed 2026-07-15; combined bootstrap and all named technical evidence passed; WP-7 owner accept/hold and later gates remain separate',
    )
    expect(decisions).toContain(
      'Approved 2026-07-15 01:37 +07; WP-7 complete and WP-7.5 Local-only source work authorized; no reset or Production action authorized',
    )
    expect(decisions).toContain(
      'Approved 2026-07-15 10:24 +07 for exact tracked checkpoint commit/push only; Local DB/browser evidence, bootstrap inclusion, WP-8, Production, and adjacent domains remain separate',
    )
    expect(decisions).toContain('DB-read version in the Server Action before the publish RPC')
    expect(decisions).toContain('| P-41 |')
    expect(decisions).toContain('| P-42 |')
    expect(decisions).toContain('P37-UAT-C04')
    expect(decisions).toMatch(/Fresh no-reset\s+D009/)
    expect(decisions).toContain('df44b827b290933463da5e14fa9125314660022a')
    expect(decisions).toContain('Bind every mutable draft review URL to its exact `reviewLock`')
    expect(decisions).toContain('Migration `025` SHA-256')
    expect(decisions).toContain(
      'bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22',
    )
    expect(decisions).toContain(
      '8d118e14c69f7ea9209123852011b1610d4c63687ff5133136bd6f15875463ed',
    )
    expect(decisions).toContain(
      'adcca3939f3080cdf64bc6ad807051e9e85fed94',
    )

    const tracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    const normalizedTracker = tracker.replace(/\s+/g, ' ')
    const verificationReport = read(
      'docs/plans/master-catalog/13-phase4-verification-report.md',
    )
    expect(tracker).toMatch(/\| WP-5 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(/\| WP-6\.5 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(/\| WP-6\.6 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(/\| WP-7 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(/\| WP-7\.5 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(/\| WP-8 \|[^\n]+\| Complete \|/)
    expect(tracker).toMatch(
      /Owner accepted P-37 on 2026-07-25 under an explicit guided-UAT variance/,
    )
    expect(tracker).toContain('| Production write allowed | No |')
    expect(tracker).toMatch(
      /P-33 accepted that\s+exact bounded WP-7\.5 technical checkpoint at 2026-07-15 13:54 \+07/,
    )
    expect(normalizedTracker).toMatch(
      /P-50D V3[^.]{0,180}(?:received|complete)[^.]{0,180}decision-record-only/i,
    )
    expect(normalizedTracker).toMatch(
      /P-50C[^.]{0,180}accepted only as local review evidence/i,
    )
    expect(tracker).toContain('P42-UAT-C03')
    expect(tracker).toContain('P42-UAT-G01')
    expect(tracker).toContain('b2500b5e6859a915bfa3f70d558934f252943f82')
    expect(tracker).toContain('f8c670901997a4e6663db7c4db1218efc03d51c6')
    expect(tracker).toContain('1c901855a32b100013fb5c9472c2e909e3dd1c59')
    expect(tracker).toContain('bdc104f77f18ea8fc776950259bc25e68c2fd42a')
    expect(tracker).toContain('bcc041772b3f537de66b655c5115c4e3c2da9325')
    expect(tracker).toContain('P42-UAT-OV01')
    expect(tracker).toContain(
      '16e88c6487307c4bb0606a048dc53e05e9dcee18',
    )
    expect(tracker).toContain(
      '| Current environment | P-12 checkpoint evidence (not a live count invariant):',
    )
    expect(tracker).toContain(
      'the v7 post-`026` encrypted application-only backup are',
    )
    expect(normalizedTracker).toMatch(
      /P-50D V3 ratification stop boundary — reached/i,
    )
    expect(normalizedTracker).toMatch(
      /no small repository\s*>?\s*gate(?:,| and no)\s*>?\s*Git\/CI (?:authorization )?request[^.]{0,240}(?:is|are) authorized/i,
    )
    expect(tracker).toContain('P50C-CANDIDATE-20260823-V1')
    expect(tracker).toContain(
      '`0fbaf215018200bacbc728af330e990b98c7e6128165982289ed429c93ad13f2`',
    )
    expect(verificationReport).toContain(
      '20260706090832 hotfix_preserve_boq_item_suffix',
    )
    expect(verificationReport).toContain(
      '| Production Data API schemas | Platform configuration proves `private` is not exposed |',
    )
    expect(verificationReport).toContain(
      '9d306a478b8ada65d0a32ab31bca19587c55efa3ae979ae4dd8ad5871d575932',
    )
    expect(verificationReport).toContain(
      'Owner-authorized non-force detach/read-only reopen passed all eight `SHA256SUMS` entries',
    )
    expect(decisions).toContain(
      '**PRE-P-12 time-bounded backup-custody decision recorded:** 2026-07-27',
    )
    expect(decisions).toContain(
      '**PRE-P-12 managed-residual decision recorded:** 2026-07-28',
    )
    expect(decisions).toContain('seven days (168 hours)')
    expect(decisions).toContain('planned pause will exceed 24 consecutive hours')
    const ownerChecklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )
    expect(ownerChecklist).toContain(
      '- [x] Accept the seven currently `authenticated`-callable guarded',
    )
    expect(ownerChecklist).toContain(
      '- [x] Accept disabled leaked-password protection for P-12 and P-13 only',
    )
    expect(ownerChecklist).toContain(
      '- [x] Accept the unused `v_row_count` assignment as low-risk managed',
    )
    expect(ownerChecklist).toContain(
      '- [x] Name the migration executor: `Suthorn Kaewkorn`.',
    )
    expect(ownerChecklist).toContain(
      '- [x] Name an independent verifier: GitHub login `Lukkxh`;',
    )
    expect(ownerChecklist).toContain(
      '- [x] Record the required Production `session_user`, `current_user`, and',
    )
    expect(ownerChecklist).toContain(
      '- [x] Propose the maintenance window: Saturday 2026-08-01,',
    )
    expectP12ProductionAuthorityConsumed(ownerChecklist)
    expect(ownerChecklist).toContain(
      '- [x] P-47 authorizes repository-only migration `026` plus required bootstrap',
    )
    expect(decisions).toContain(
      '| P-45 | Authorize the exact PRE-P-12 authority/status checkpoint commit and push |',
    )
    expect(decisions).toContain(
      '| P-46 | Authorize exactly one corrected destructive Local bootstrap under fail-closed conditions |',
    )
    expect(decisions).toContain(
      '| P-47 | Authorize repository-only append-only `026` correction and static closure |',
    )
    expect(decisions).toContain(
      '| P-48 | Authorize exact P-47 replacement source/tooling commit and push |',
    )
    expect(decisions).toContain(
      'The exact P-48 repository-relative allowlist is:',
    )
    const p48DecisionSection = decisions.slice(
      decisions.indexOf(
        '**P-48 exact replacement source/tooling Git publication authorized:**',
      ),
      decisions.indexOf(
        '**Post-Phase-4 DR follow-up recorded (not a P-12 blocker):**',
      ),
    )
    expect(p48DecisionSection).toContain(
      '`d92d8ced42fc882481ebc2c4579adcf1edbebea7`',
    )
    expect(p48DecisionSection).toContain(
      '`Close P-47 helper ACL correction`',
    )
    expect(p48DecisionSection).toContain('push exactly once')
    expect(p48DecisionSection).toContain('Do not create a PR.')
    expect(p48DecisionSection).toContain(
      'It must not include `files/`, `tmp/`, `output/`, any',
    )
    expect(p48DecisionSection).toContain('other untracked path')
    const p48AllowlistSection = decisions.slice(
      decisions.indexOf('The exact P-48 repository-relative allowlist is:'),
      decisions.indexOf('The exact P-45 repository-relative allowlist is:'),
    )
    const p48Allowlist = [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/08-phase4-architecture-ci-plan.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/21-phase4-architecture-review-disposition.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
      'docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md',
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
      'docs/plans/master-catalog/44-phase4-p46-catalog-action-error-callability-finding.md',
      'migrations/026_master_catalog_phase4_catalog_action_error_acl.sql',
      'scripts/bootstrap-local-db.sh',
      'scripts/master-catalog-local-canonical-hash.mjs',
      'scripts/prepare-master-catalog-p12-cli-kit.mjs',
      'scripts/run-master-catalog-p12-cli-step.mjs',
      'scripts/smoke-master-catalog-wp65.mjs',
      'tests/master-catalog-authority-consistency.test.ts',
      'tests/master-catalog-migrations.test.ts',
      'tests/master-catalog-p12-cli-kit.test.ts',
    ]
    const recordedP48Paths = Array.from(
      p48AllowlistSection.matchAll(/^- `([^`]+)`$/gm),
      (match) => match[1],
    )
    expect(recordedP48Paths).toEqual(p48Allowlist)
    expect(new Set(recordedP48Paths).size).toBe(25)
    expect(ownerChecklist).toContain(
      '- [x] P-48 authorizes exactly one commit/push from base `d92d8ce`',
    )
    expect(ownerChecklist).toContain(
      '- [x] P-48 executed exactly once at replacement clean pushed/upstream-equal',
    )
    expect(decisions).toContain(
      '`ed94c0304be2741217c7ea2c36322b426de1dfe5`',
    )
    expect(decisions).toContain(
      'do not retry, patch Local, or reset a second time without fresh Owner approval',
    )
    for (const path of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
      'tests/master-catalog-authority-consistency.test.ts',
    ]) {
      expect(decisions).toContain(`- \`${path}\``)
    }
    const readinessPackage = read(
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    )
    expect(readinessPackage).toContain(
      '| Source/tooling and GO authority sync |',
    )
    expect(readinessPackage).toContain('two operational binding HEADs')
    expect(readinessPackage).not.toContain('uses two Git commits')
    expect(ownerChecklist).toContain(
      'This consumed authority permits no retry or\nalternate path.',
    )
    expect(ownerChecklist).toContain(
      '`supabase db reset --local --no-seed`',
    )
    for (const authority of [decisions, readinessPackage]) {
      expect(authority).toContain('PRE-GO authority checkpoint')
      expect(authority).toMatch(
        /clean\s+dedicated\s+(?:execution\s+)?checkout/,
      )
      expect(authority).toMatch(/net\s+changed\s+path/)
    }
    expect(ownerChecklist).toMatch(/PRE-GO\s+authority checkpoint/)
    expect(ownerChecklist).toMatch(
      /clean\s+dedicated\s+(?:execution\s+)?checkout/,
    )
    expect(ownerChecklist).toMatch(/net\s+changed\s+path/)
    expect(readinessPackage).toContain(
      'The same `current_user` must execute `017`,\n  `017a`, and `018`-`026` because `ALTER DEFAULT PRIVILEGES`',
    )
    expect(readinessPackage).toMatch(
      /object\s+ownership\/ACL delta for objects created or replaced by that file/,
    )
    expect(readinessPackage).toContain(
      'full\n  owner/ACL/RLS inventory',
    )
    const migrationsAuthority = read('docs/04_data/MIGRATIONS.md')
    const productionExecutionSection = migrationsAuthority
      .split('### Production execution')[1]
      ?.split('## 3. Rollback Procedures')[0] ?? ''
    expect(productionExecutionSection).not.toContain(
      'Copy entire contents and paste into SQL Editor',
    )
    expect(productionExecutionSection).toContain(
      'one\nidentifiable remote migration-ledger row per file',
    )
    expect(productionExecutionSection).toContain(
      'same frozen\n`current_user`/object-owner role',
    )
    expect(productionExecutionSection).toContain(
      '39-phase4-p12-production-readiness-package.md',
    )
    const productionRunbook = read(
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
    )
    expect(productionRunbook).toContain(
      'Post-Phase 4 DR follow-up (not a P-12 blocker)',
    )
    expect(productionRunbook).toContain('business-approved RPO/RTO')
    expect(productionRunbook).toContain('Auth recovery/session implications')
    expect(productionRunbook).toContain('Storage object')
    expect(productionRunbook).toContain('not full-service DR')
    const drBacklog = read(
      'docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md',
    )
    expect(drBacklog).toContain('BACKLOG ONLY')
    expect(drBacklog).toContain('not a PRE-P-12 blocker')
    expect(drBacklog).toContain('Auth sessions and signing material')
    expect(drBacklog).toContain('Storage object bytes')
    expect(drBacklog).toContain('RPO')
    expect(drBacklog).toContain('RTO')
    expect(tracker).toContain(
      '[P-12 Readiness Package #39](./39-phase4-p12-production-readiness-package.md)',
    )
    expect(tracker).toContain(
      '0780925aca8fa7ebbf8abbaf2b7cf151b39b676a',
    )
    expect(tracker).toContain('### 3.3 WP-8 placement UX hard gates')
    expect(tracker).toContain('Truthful accepted/dirty state')
    expect(tracker).toContain('Review by exception')
    expect(tracker).toContain('Keyboard/pointer equivalence')
    expect(tracker).toContain('Measured realistic scale')

    const operatorProcedure = read(
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
    )
    expect(operatorProcedure).toContain('The page opens on **ทั้งหมด**')
    expect(operatorProcedure).toContain('select one insertion gap')
    expect(operatorProcedure).toContain('must immediately show **ปรับในหน้านี้ · ยังไม่บันทึก**')
    expect(operatorProcedure).toContain('keyboard-incomplete required control blocks P-14')
    expect(operatorProcedure).toContain(
      'durable success notice shows the source filename, resulting draft row count',
    )
    expect(operatorProcedure).toContain(
      'If the form silently returns to Step 1 without the success notice',
    )

    const threatModel = read(
      'docs/plans/master-catalog/18-phase4-threat-model.md',
    )
    expect(threatModel).toContain('| T-49 |')
    expect(threatModel).toContain('| T-50 |')
    expect(threatModel).toContain('| T-54 |')
    expect(threatModel).toContain('| T-55 |')
    expect(threatModel).toContain('| T-60 |')
    expect(threatModel).toContain('| T-61 |')
    expect(tracker).toContain(
      '80b2574bbaccc5bb14093aa204a46fcc50ba1d5c',
    )
    expect(tracker).toContain(
      '875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602',
    )
    expect(tracker).toContain(
      '99fa56c3d3c68e1886fbd308d8536e598eaee02f',
    )
    expect(tracker).toContain(
      '4e3574a31a2697f4d727acabc8f55f34a4233bff',
    )
    expect(tracker).toContain(
      '2c43f6b0e644171b1ecba60c14566e5856a94b63',
    )
    expect(tracker).toContain(
      '15b707d443bec701f6b3a86aa7675ca1266604ba',
    )
    expect(tracker).toContain(
      '910cc3cc74660beecf18655d39cd0b0c085d1fc6',
    )
    expect(tracker).toContain(
      'cfe8e86107e032111eccdbf0dfad981a3a6e830d9ed83670caf2971b42f276e4',
    )
    expect(tracker).toContain(
      '65ca478b90dc4c0c598698c46bad93bb513ab0c503c058f58c540ce5b56ba0d8',
    )
    expect(tracker).toContain(
      '2a521c1025ce9cb9e044ec1b6aa507d5424d7f7a5fc42ce5065a93724fcd9a37',
    )
    expect(tracker).toContain(
      'eb8e4266929f6e09d736a9246035b82bc5f775923f4fd5cfe0eb0c381e514f45',
    )
    expect(tracker).toContain(
      'e6c1a00c51f14791de9dc37e4a5bffc8b953a37b90ec7011320b38eda9a5a944',
    )
    expect(tracker).toContain(
      '2e57892c5649fe10e9dc44a885d105066261e5226fd5a23d67ec05bfa4a83e1f',
    )
    expect(tracker).toContain(
      '6d9f9b50381f503fee59a54f993647e4efa4df05f19d4542703efa281a83dd60',
    )
    expect(tracker).toContain(
      'aafb8282e3a3485b606b086e6a718bed60689104e1305272553a94ac7f37b220',
    )
    expect(tracker).toContain(
      '42399c16108e2f7688a53d70464e743559cd705a51e0fb2509831ec1c647a8c8',
    )
    expect(tracker).toContain(
      'Migration 020 SHA-256: e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93',
    )
    expect(tracker).toContain(
      '78359215f7d859d9c167db608e1e96d66712b6b06a9d103fd7b26ce781835a83',
    )
    expect(tracker).toContain(
      'e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714',
    )
    expect(tracker).toContain(
      '721c2c2c4a234a4fd00e5686383be9af87ee15dd',
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
    expect(tracker).toContain('closure-lineage commit `050c998`')
    expect(tracker).not.toContain('Blockers: exact candidate commit;')
    expect(tracker).not.toContain('Blockers: clean correction commit')
    expect(tracker).not.toContain('Commit the closure before requesting G1R')
    expect(tracker).not.toContain('must be committed before G1R')
    expect(tracker).not.toContain('review/commit P-23.1 working-tree candidate')
    expect(tracker).toMatch(
      /pre-amendment operator\/browser preflight passed on\s+`c8f6dca`/,
    )
    expect(tracker).toContain(
      'Status: P-12 COMPLETE; exact Production sequence 017 -> 017a -> 018-026 and v7 backup remain valid; all Phase 4 flags false. P-49 OPEN/HIGH AND DEFERRED UNTIL AFTER P-15 UNDER P-51. P-13 NOT AUTHORIZED; P-49 IS NOT THE SOLE BLOCKER FOR THE EXACT FIRST CLOSEOUT',
    )
    expect(decisions).toContain(
      'accepts combined Owner-operated guided UI plus developer-operated fault-injection/cleanup evidence',
    )
    expect(tracker).toContain('no Production action authorized')
    expect(tracker).toContain('2c39dddd10c361bd1244292f4bd79e06f167c919')
    expect(verificationReport).toContain('undefined `rows` helper')
    expect(verificationReport).toContain(
      'Passed under the 2026-07-25 guided-UAT Owner variance; Closure Matrix #34 C-08/C-09 passed',
    )
    expect(verificationReport).toContain(
      'The evidence is not relabelled independent/no-assistance.',
    )
    expect(verificationReport).toContain(
      'Passed: Closure Matrix #34 C-11',
    )
    for (const cleanEvidenceHash of [
      '4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245',
      'e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251',
      '5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195',
      '0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240',
    ]) {
      expect(verificationReport).toContain(cleanEvidenceHash)
    }
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/32-phase4-wp8-p36-owner-review-note.md',
    ))).toBe(true)
    const p36OwnerReview = read(
      'docs/plans/master-catalog/32-phase4-wp8-p36-owner-review-note.md',
    )
    expect(p36OwnerReview).toContain('**P-37 HOLD is')
    expect(p36OwnerReview).toContain('Production touched: **No**')
    expect(p36OwnerReview).toContain(
      '`v_row_count` is assigned but never read',
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/33-phase4-wp8-p37-uat-ux-correction-note.md',
    ))).toBe(true)
    const p37Correction = read(
      'docs/plans/master-catalog/33-phase4-wp8-p37-uat-ux-correction-note.md',
    )
    expect(p37Correction).toContain(
      'P-37 Owner-accepted on 2026-07-25 under the explicit guided-UAT',
    )
    expect(p37Correction).toContain('This is a genuine UAT failure, not operator error')
    expect(p37Correction).toContain('insertion gap')
    expect(p37Correction).toContain('keeps the DB/RPC/readiness/audit/concurrency contract')
    expect(p37Correction).toContain('unchanged and replaces only the operator translation')
    expect(p37Correction).toContain('Production touched: **No**')
    expect(p37Correction).toContain('leave/return/reload recovery')
    expect(p37Correction).toContain(
      '96c2ac6892e8ffe9d020c2dff641a847157cd4b2',
    )
    expect(p37Correction).toContain(
      'f36d896d672609653de6634e307dcc44bce6d519',
    )
    expect(p37Correction).toContain('Owner keyboard and final-presentation re-UAT')
    expect(p37Correction).toMatch(
      /the owner\s+session\s+explicitly did not activate \*\*ยืนยันและบันทึกตำแหน่ง\*\*/,
    )
    expect(p37Correction).toContain('Closure Matrix #34')
    expect(p37Correction).toContain(
      'C-12 authority alignment subsequently passed its executable checks',
    )
    expect(p37Correction).not.toContain(
      'The owner does not need another Local fixture, reset, or placement submission',
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/34-phase4-wp8-p37-closure-matrix.md',
    ))).toBe(true)
    const p37Closure = read(
      'docs/plans/master-catalog/34-phase4-wp8-p37-closure-matrix.md',
    )
    for (const contract of [
      'Accepted by the Owner on 2026-07-25 under an explicit guided-UAT',
      '| C-07 | One complete Owner-operated guided placement task |',
      '| C-09 | Owner-approved guided core-admin UAT |',
      '| C-10 | At least three safe validation-error/prevention recoveries |',
      '| C-11 | 710-row performance baseline |',
      '| C-12 | Documentation consistency |',
      '| C-13 | Disabled clean Local baseline |',
      '| Passed against the exact correction checkpoint |',
      'one stale rejection with zero effect and exactly one accepted UI batch/change set',
      'bdc104f77f18ea8fc776950259bc25e68c2fd42a',
      'bcc041772b3f537de66b655c5115c4e3c2da9325',
      'P42-UAT-OV01',
      'four post-correction Owner spot-checks',
      'same-request portion of Spot-check 4, and cleanup passed',
    ]) {
      expect(p37Closure).toContain(contract)
    }
    expect(p37Closure).not.toContain(
      '| C-07 | One complete independent placement task |',
    )
    expect(p37Closure).not.toContain(
      '| C-09 | Independent core-admin UAT |',
    )
    expect(p37Closure).toMatch(
      /The evidence\s+must not be relabelled as independent or no-assistance\./,
    )
    expect(p37Closure).toContain(
      'adcca3939f3080cdf64bc6ad807051e9e85fed94',
    )
    expect(p37Closure).toContain(
      'e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251',
    )
    expect(p37Closure).toMatch(/No further reset is\s+authorized/)
    expect(p37Closure).not.toContain('recovery reset must finish')
    expect(executionPack).toContain(
      'record comprehension and recovery from at least three safe',
    )
    expect(executionPack).toContain(
      'an intended admin/data custodian completes the',
    )
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md',
    ))).toBe(true)
    const p37OwnerUat = read(
      'docs/plans/master-catalog/35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md',
    )
    expect(p37OwnerUat).toMatch(
      /P-37 was Owner-accepted on 2026-07-25\s+under an explicit guided-UAT variance/,
    )
    for (const contract of [
      'Card C E-01/E-02',
      'P-42 recovery retained one stale rejection with zero effect and exactly one accepted UI batch',
      'Spots 1-3, same-request Spot 4, and final cleanup are retained',
      'No scale measurement rerun remains',
      'CATALOG_OUTCOME_UNCERTAIN',
      '**ปรับในหน้านี้ · ยังไม่บันทึก**',
      'Full 710-row client preparation plus server diff',
    ]) {
      expect(p37OwnerUat).toContain(contract)
    }
    expect(p37OwnerUat).toContain('strict score HOLD because live guidance was used')
    expect(p37OwnerUat).toMatch(
      /no evidence is relabelled\s+independent or no-assistance/,
    )
    expect(p37OwnerUat).toContain('Cards A-G require no reset after preparation')
    expect(p37OwnerUat).toContain('npm run db:local:p38:verify-inputs')
    expect(p37OwnerUat).toContain(
      'npm run db:local:p38:prepare -- --session "$P38_SESSION" --scenario',
    )
    expect(p37OwnerUat).toContain('bounded-spot-check')
    expect(p37OwnerUat).toContain('npm run db:local:p38:cleanup -- --session "$P38_SESSION"')
    expect(p37OwnerUat).toContain('P42-UAT-C03')
    expect(p37OwnerUat).toContain('P42-UAT-G01')
    expect(p37OwnerUat).toContain(
      '16e88c6487307c4bb0606a048dc53e05e9dcee18',
    )
    expect(p37OwnerUat).toContain(
      'D004 and final D005 schema-2 cleanup each passed with one audited-abandoned attempt',
    )
    expect(p37OwnerUat).toMatch(
      /actual\s+\*\*ยืนยันและบันทึกลงฉบับร่าง\*\* action is absent/,
    )
    expect(p37OwnerUat).toContain('CIC-PVC-998')
    expect(p37OwnerUat).toContain('does not merely change a trusted mapped price')
    expect(p37OwnerUat).toMatch(/Production `2568\.0\.0`\s+remains authority/)
    expect(p37OwnerUat).toMatch(/Do not perform a\s+successful\s+publication/)
    const scoredCards = p37OwnerUat.slice(p37OwnerUat.indexOf('### Card A'))
    expectInOrder(scoredCards, [
      '### Card A',
      'reload that same URL',
      '### Card B',
      '### Card E',
    ])
    expect(scoredCards).not.toContain('complete the old publish-confirmation form and submit')
    const cardE = scoredCards.slice(
      scoredCards.indexOf('### Card E'),
      scoredCards.indexOf('### Card F'),
    )
    expect(cardE).not.toContain('complete the old publish-confirmation form')
    expect(p37OwnerUat).toMatch(/Do not run\s+`npm run db:local:bootstrap`/)
    expect(p37OwnerUat).not.toContain('technical evidence is accepted as Owner evidence')
    expect(tracker).toContain('Discovery drafts were audited-abandoned')
    expect(verificationReport).toContain('P-38 P-37 evidence reconciliation')
    expect(threatModel).toContain('| T-52 |')
    expect(threatModel).toContain('| T-53 |')
    expect(threatModel).toContain('| T-58 |')
    expect(threatModel).toContain('| T-59 |')
    expect(threatModel).toContain('Owner UAT Script #35')
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md',
    ))).toBe(true)
    const p38Preflight = read(
      'docs/plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md',
    )
    for (const contract of [
      'IMPORT_PRICE_AUTHORITY_REQUIRED',
      'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
      '`CIC-PVC-998`',
      'npm run db:local:p38:verify-inputs',
      'npm run db:local:p38:cleanup',
      'test ! -e "$P38_SESSION"',
      '--session "$P38_SESSION"',
      '--scenario bounded-spot-check',
      'full-owner-uat',
      'schema-2',
      'No Local reset',
      'Production touched',
    ]) {
      expect(p38Preflight).toContain(contract)
    }
    expect(p38Preflight).toContain(
      'Current P-37 disposition (2026-07-25)',
    )
    expect(p38Preflight).toContain(
      'guided-UAT variance',
    )
    expect(p38Preflight).toMatch(
      /It never\s+creates,\s+edits,\s+publishes,\s+or abandons a draft/,
    )
    expect(p38Preflight).toContain('P-41 discovery correction gate')
    expect(p38Preflight).toContain('P-42 recovery execution')
    expect(p38Preflight).toMatch(/clean\s+`017`-`025` chain/)
    expect(p38Preflight).toContain(
      '**Passed:** after a new warning and Owner approval',
    )
    expect(p37OwnerUat).toContain('UAT-06')
    expect(p37OwnerUat).toContain('UAT-07')
    expect(p37OwnerUat).toContain('UAT-08')
    expect(p37OwnerUat).toContain('UAT-09')
    expect(p37OwnerUat).toContain('UAT-10')
    expect(p37OwnerUat).toContain('reports a preexisting order gap')
    expect(existsSync(resolve(
      root,
      'docs/plans/master-catalog/38-phase4-p42-final-review-snapshot-binding-incident-note.md',
    ))).toBe(true)
    const p42Incident = read(
      'docs/plans/master-catalog/38-phase4-p42-final-review-snapshot-binding-incident-note.md',
    )
    expect(p42Incident).toMatch(
      /Production was not\s+accessed or\s+changed/,
    )
    expect(p42Incident).toContain('b2500b5e6859a915bfa3f70d558934f252943f82')
    expect(p42Incident).toContain('f8c670901997a4e6663db7c4db1218efc03d51c6')
    expect(p42Incident).toContain('reviewLock={current_lock}')
    expect(p42Incident).toMatch(/does\s+not render the diff\/publish panel/)
    expect(p42Incident).toContain('Pointer restore alone')
    expect(p42Incident).toContain('functional Cards A-G')
    expect(p42Incident).toContain('No further reset')
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
    expect(ownerReview).toContain(
      '**Accepted G3/WP-6.6 application checkpoint:**',
    )
    expect(ownerReview).toContain(
      'The owner **accepted G3** on exact checkpoint',
    )
    expect(ownerReview).toContain('**Subsequent P-28 decision (2026-07-15):**')
    expect(ownerReview).toContain('**Subsequent P-29/G4E result (2026-07-15):**')
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
    expect(correctionPlan).toContain(
      '**Subsequent owner decision:** at 2026-07-14 23:50 +07',
    )
    expect(correctionPlan).toContain('| G4R | Passed by P-28 on 2026-07-15')
    expect(correctionPlan).toContain('| G4E | Owner-approved and passed 2026-07-15')
    expect(correctionPlan).toContain('## 21. P-28 G4 repository integration')
    expect(correctionPlan).toContain('## 22. P-29 G4E clean Local execution')
    expect(correctionPlan).toContain('P-42 final-review amendment')
    expect(correctionPlan).toContain('`reviewLock={expected_lock_version}`')
  })

  it('records P-12 completion without authorizing P-13', () => {
    const authorityPaths = [
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    ]

    for (const path of authorityPaths) {
      const authority = read(path)
      expect(authority).toContain(
        '7c5ac6bd88677c0144bf8b8933b39293a2dee866',
      )
      expect(authority).toContain(
        '5a029dd507471ab5d74375bd3f2afba931096e9f2c208ff836b68d1dd5881e47',
      )
      expect(authority).toContain(
        '2fb1259249282315750ce20d41732fd9f6c5e65998aa772fc4e387c5368d64a5',
      )
      expect(authority).toContain(
        '72d2f10358c99565aa2853b02a6bbcf61cc8812f24f2d665498bfd13d7c98d19',
      )
      expect(authority).toContain(
        'd44286409cad41fff8f977acdafbf6eaecdecb5692381a37fdb8f8f95b9ba538',
      )
      expect(authority).toMatch(
        /P-13[\s\S]{0,500}(?:NOT\s+AUTHORIZED|not\s+authorized)/i,
      )
    }

    expectP12ProductionAuthorityConsumed(
      read('docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md'),
    )
  })

  it('records P-49 pending profile-only intent without claiming implementation or P-13 authority', () => {
    const p49Path =
      'docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md'
    const p49 = read(p49Path)
    const markerMatch = p49.match(
      /<!-- P49_PENDING_AUTHORIZATION_DECISION_V1 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    expect(JSON.parse(markerMatch![1])).toEqual({
      schema: 'conduit-boq/p49-pending-authorization-decision/v1',
      recordedAt: '2026-08-17T02:58:08+07:00',
      businessIntent: 'pending-profile-onboarding-only',
      masterCatalogRls: 'preserve-022-023-active-only',
      catalogReadWideningAuthorized: false,
      decisionRecordLocalCommitAuthorized: true,
      historicalTestCommentAuthorized: true,
      externalGitPublicationAuthorized: false,
      implementationAuthorized: false,
      databaseHardeningRequired: true,
      p13Authorized: false,
      automaticNextStep: false,
    })

    const waiverMarkerMatch = p49.match(
      /<!-- P49_P51_WAIVER_DISPOSITION_V1 (\{[^\n]+\}) -->/,
    )
    expect(waiverMarkerMatch).not.toBeNull()
    expect(JSON.parse(waiverMarkerMatch![1])).toEqual({
      schema: 'conduit-boq/p49-p51-waiver-disposition/v1',
      recordedAt: '2026-08-18',
      p49RiskOpen: true,
      businessTargetRetained: true,
      remediationDeferred: true,
      deferredUntil: 'after-first-p15-closeout',
      waiver: 'P-51',
      waiverScope: 'first-p13-through-p15-closeout-only',
      waiverExpires: 'immediately-on-first-p15-closeout',
      calendarReapprovalRequiredAt: '2026-08-25T23:59:59+07:00',
      p49ReentryDeadline:
        'before-next-production-deploy-and-target-within-7-calendar-days-after-p15',
      p49ImplementationAuthorized: false,
      migrationReserved: false,
      proposal47Approved: false,
      automaticNextStep: false,
    })

    const currentAuthorityPaths = [
      p49Path,
      'docs/SECURITY.md',
      'docs/04_data/SECURITY_MODEL.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    ]

    for (const path of currentAuthorityPaths) {
      const authority = read(path)
      expect(authority).toContain('P-49')
      expect(authority).toMatch(/profile\/onboarding-only/i)
      expect(authority).toContain('P-51')
      expect(authority).toMatch(/(?:open\/high|OPEN SECURITY RISK|open high)/i)
      expect(authority).toMatch(/deferred/i)
      expect(authority).toContain('P-13')
      expect(authority).toMatch(/not authorized/i)
    }

    for (const path of [
      'docs/03_domain/ACCESS_MODEL.md',
      'docs/04_data/DATA_INTEGRITY.md',
      'docs/04_data/DATABASE_SCHEMA.md',
      'docs/06_engineering/PERMISSION_PATTERNS.md',
      'docs/02_architecture/ADR/ADR-001-supabase-rls-authorization.md',
      'docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
    ]) {
      const authority = read(path)
      expect(authority).toContain('P-49')
      expect(authority).toMatch(/profile\/onboarding-only/i)
    }

    expect(p49).toMatch(/`009`[\s\S]{0,180}`016`/)
    expect(p49).toContain('Factor F')
    expect(p49).toContain('Users can view all profiles')
    expect(p49).toContain('app_settings_select USING (true)')
    expect(p49).toContain('can_approve_boq(uuid)')
    expect(p49).toContain('get_user_role(uuid)')
    expect(p49).toContain('is_admin(uuid)')
    expect(p49).toContain('status` defaults to `active')
    expect(p49).toContain('missing-profile')
    expect(p49).toContain('unknown-status')
    expect(p49).toContain('inactive/suspended')
    expect(p49).toContain('active -> pending')
    expect(p49).toContain('self-`role=\'admin\'`')
    expect(p49).toContain('self-`status=\'active\'`')
    expect(p49).toContain('`/api/admin/users/[id]`')
    expect(p49).toMatch(/existing rows are retained/i)
    expect(p49).toContain('P-51 supersedes only the former timing/hard-stop')
    expect(p49).toContain('It authorizes no P-49')
    expect(p49).toContain('external Git publication/push')
    expect(p49).toContain(
      'externalGitPublicationAuthorized":false',
    )

    const historicalRlsTest = read('scripts/test-rls-security.sql')
    expect(historicalRlsTest).toContain('HISTORICAL ONLY (P-49, 2026-08-17)')
    expect(historicalRlsTest).toContain('pending = profile/onboarding-only')
    expect(historicalRlsTest).toContain('Do not run this script as P-49 evidence')

    expect(
      existsSync(
        resolve(
          root,
          'migrations/027_master_catalog_pending_issued_read_compatibility.sql',
        ),
      ),
    ).toBe(false)

    const frozenP49Evidence = new Map<string, string>([
      [
        'migrations/005_phase1a_seed_and_rls.sql',
        '767009873242d7c74d652343290af34ed906e4fc6b92339244a75b9c22aeeded',
      ],
      [
        'migrations/007_app_settings.sql',
        '2f1c6200248c3bfa86fd93ae08ea9867fd45a76d1d3970cd2b6c831b9a06069d',
      ],
      [
        'migrations/008_rls_and_trigger.sql',
        '63ec56740e9b7940bf7e312d2f33154acbbb3794bbb8646a6fddb5115f66d811',
      ],
      [
        'migrations/009_master_catalog_p0_containment.sql',
        '6d18fd4365b0f4ca8cb69582a276cd1b3e48c01b01bc7046c5306746719b57d2',
      ],
      [
        'migrations/012_factor_f_version_foundation.sql',
        'dd574de138bcfa3bfb3495ed5c216a66ab1d3c844a0cdd12af7bd35f21fa5bd1',
      ],
      [
        'migrations/016_hotfix_preserve_boq_item_suffix.sql',
        '23067432081325a423355cd5dddc3166e2b7312e2a13c74c36458a818b5a505d',
      ],
      [
        'migrations/022_master_catalog_phase4_draft_identity_and_release_number.sql',
        '9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3',
      ],
      [
        'migrations/023_master_catalog_phase4_published_code_rls_scope.sql',
        'cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88',
      ],
      [
        'supabase/local/production-baseline.sql',
        '4aad05cdd2b790b4b7d7459aa874422d53871caee3be243b30307a59048a443d',
      ],
      [
        'lib/permissions.ts',
        '0084726044dbff81026b9f0925d6399b2f302cc8c1bbfe15292dc8bf08f34baa',
      ],
      [
        'lib/supabase/middleware.ts',
        '2b42d35c2596c10df4d2b86c14e46fd9151dd56b8193d34c5ccbfe29741aa0ce',
      ],
      [
        'app/api/admin/users/[id]/route.ts',
        'bfa515ec3b073341897f8a313d2c47411e556c306d63043d0af091f58a7418be',
      ],
      [
        'app/profile/page.tsx',
        'e242da508a1f0ec01795d0f3a832502d732c1f13653c6dde0d973e30f546ee58',
      ],
      [
        'lib/master-catalog/export/data.ts',
        '08758042cd0112e4f30554ddc2ff18f60cf0bec3248d1954e262b3f6d89bb5f3',
      ],
    ])

    for (const [path, expectedSha256] of frozenP49Evidence) {
      expect(createHash('sha256').update(read(path)).digest('hex')).toBe(
        expectedSha256,
      )
      expect(p49).toContain(`| \`${path}\` | \`${expectedSha256}\` |`)
    }

    const threatModel = read(
      'docs/plans/master-catalog/18-phase4-threat-model.md',
    )
    expect(threatModel).toContain('| T-65 |')
    expect(threatModel).toContain(
      '**Open / High; temporarily accepted and deferred under P-51 for the exact first closeout.**',
    )
  })

  it('keeps Proposal #47 deferred, unreserved, and non-executable under P-51', () => {
    const proposal = read(
      'docs/plans/master-catalog/47-phase4-p49-forward-only-db-application-correction-proposal.md',
    )
    const markerMatch = proposal.match(
      /<!-- P49_FORWARD_ONLY_CORRECTION_PROPOSAL_V1 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    expect(JSON.parse(markerMatch![1])).toEqual({
      schema: 'conduit-boq/p49-forward-only-correction-proposal/v1',
      preparedAt: '2026-08-18',
      baseCommit: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
      businessIntent: 'pending-profile-onboarding-only',
      status: 'deferred-not-approved',
      deferredUnder: 'P-51',
      deferredUntil: 'after-first-p15-closeout',
      p49ReentryDeadline:
        'before-next-production-deploy-and-target-within-7-calendar-days-after-p15',
      currentExecutionPlan: false,
      proposedMigrationNumber: null,
      proposedLedgerVersion: null,
      migrationReserved: false,
      proposalDecisionPending: false,
      implementationAuthorized: false,
      localDatabaseAuthorized: false,
      productionReadAuthorized: false,
      productionWriteAuthorized: false,
      localCommitAuthorized: false,
      externalGitPublicationAuthorized: false,
      p13Authorized: false,
      p14Authorized: false,
      p15Authorized: false,
      mustReReviewLivePosture: true,
      mustRewriteProposal: true,
      automaticNextStep: false,
    })
    expect(proposal).toContain('NOT A CURRENT EXECUTION PLAN')
    expect(proposal).toContain('withdrawn and unreserved')
    expect(proposal).toContain('read-only live-posture capture')
    expect(proposal).toContain('Do not approve P-49S from this document')
  })

  it('records one bounded P-51 SOLO closeout route without authorizing operational work', () => {
    const p51 = read(
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
    )
    const markerMatch = p51.match(
      /<!-- P51_RISK_ACCEPTED_MASTER_CATALOG_CLOSEOUT_V2 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    const marker = JSON.parse(markerMatch![1])
    expect(marker).toMatchObject({
      schema: 'conduit-boq/p51-risk-accepted-master-catalog-closeout/v2',
      recordedAt: '2026-08-18',
      soloSimplifiedAt: '2026-08-21',
      scope: 'exact-first-master-catalog-closeout-only',
      ownerSoloOperator: true,
      operatingGateModel:
        'data->bounded-deploy-uat->separate-publish-closeout',
      formerP50rStageModel: 'P-50R-I->P-50R-O->P-50R-X',
      formerP50rStagesExecuted: false,
      currentDecisionId: 'P50R-SOLO-REQ-20260821-V1',
      currentDecision: 'approve-or-hold-p50r-solo-only',
      p50rSoloRequestReady: true,
      p50rSoloOfflineOnly: true,
      p50rSoloCoverageRequirement: '100-percent-bidirectional',
      p50rSoloDeterministicRunCount: 2,
      ownerAcceptsTemporaryP49SecurityRisk: true,
      p49ImplementationDeferredUntilAfterP15: true,
      p49CurrentReleaseBlockerWaived: true,
      waiverCalendarReapprovalAt: '2026-08-25T23:59:59+07:00',
      supabaseRlsGrantsAuthMustRemainUnchanged: true,
      clientServiceRoleForbidden: true,
      zeroPriceRequirementAutomaticallySuperseded: false,
    })
    for (const field of [
      'p50rSoloAuthorized',
      'p50rSoloDatabaseAccessAuthorized',
      'p50rSoloNetworkAccessAuthorized',
      'p50rSoloSourceMutationAuthorized',
      'p50PriceMutationAuthorized',
      'p50dAuthorized',
      'p50cAuthorized',
      'gitCiAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'databaseAccessAuthorized',
      'productionWriteAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(marker[field]).toBe(false)
    }

    const historicalCurrentMarkerMatch = p51.match(
      /<!-- P51_CURRENT_GATE_OVERLAY_V1 (\{[^\n]+\}) -->/,
    )
    expect(historicalCurrentMarkerMatch).not.toBeNull()
    const historicalCurrentMarker = JSON.parse(
      historicalCurrentMarkerMatch![1],
    )
    expect(historicalCurrentMarker).toMatchObject({
      schema: 'conduit-boq/p51-current-gate-overlay/v1',
      currentAsOf: '2026-08-22',
      p50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rCompleted: true,
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      currentDecisionId: 'P50D-REQ-20260822-V1',
      currentDecision: 'approve-or-hold-p50d-only',
      p50dProposalReady: true,
      historicalZeroPriceGateStillBinding: true,
    })
    expect(p51).toContain(
      'The overlay above is retained as the 2026-08-22 point-in-time state',
    )
    expect(p51).toContain('superseded without approval')
    for (const field of [
      'p50dAuthorized',
      'p50cAuthorized',
      'gitCiAuthorized',
      'databaseAccessAuthorized',
      'productionWriteAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(historicalCurrentMarker[field]).toBe(false)
    }

    const currentMarkerMatch = p51.match(
      /<!-- P51_CURRENT_GATE_OVERLAY_V2 (\{[^\n]+\}) -->/,
    )
    expect(currentMarkerMatch).not.toBeNull()
    const currentMarker = JSON.parse(currentMarkerMatch![1])
    expect(currentMarker).toMatchObject({
      schema: 'conduit-boq/p51-current-gate-overlay/v2',
      currentAsOf: '2026-08-23',
      p50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rCompleted: true,
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      p50rEvidenceComparisonOnly: true,
      supersededDecisionId: 'P50D-REQ-20260822-V1',
      supersededDecisionApproved: false,
      currentDecisionId: 'P50D-REQ-20260823-V2',
      currentDecision: 'select-baseline-only-or-selected-delta-or-hold',
      baselineVersion: '2568.0.0',
      baselineRowCount: 710,
      baselineAuthorityFields: [
        'item_name',
        'unit',
        'material_cost',
        'labor_cost',
        'unit_cost',
      ],
      initialApprovedChangeCount: 0,
      p50dProposalReady: true,
      historicalZeroPriceGateStillBinding: true,
    })
    for (const field of [
      'p50dAuthorized',
      'p50cAuthorized',
      'gitCiAuthorized',
      'databaseAccessAuthorized',
      'productionWriteAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(currentMarker[field]).toBe(false)
    }

    const currentReviewMarkerMatch = p51.match(
      /<!-- P51_CURRENT_GATE_OVERLAY_V5 (\{[^\n]+\}) -->/,
    )
    expect(currentReviewMarkerMatch).not.toBeNull()
    const currentReviewMarker = JSON.parse(currentReviewMarkerMatch![1])
    expect(currentReviewMarker).toMatchObject({
      schema: 'conduit-boq/p51-current-gate-overlay/v5',
      currentAsOf: '2026-08-23',
      supersedesLiveAcceptanceAndNextActionOf:
        'P51_CURRENT_GATE_OVERLAY_V4',
      preservesPriorMarkersAsHistory: true,
      p50dV3RequestId: 'P50D-REQ-20260823-V3',
      p50dV3ManifestSha256:
        '1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429',
      selectedIdentityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      selectedLegacyItemCode: 'ITEM-0429',
      selectedTargetItemCode: 'COR-PB0-002',
      baselinePrice: [0, 1763, 1763],
      candidatePrice: [0, 1764, 1764],
      p50cCandidateId: 'P50C-CANDIDATE-20260823-V1',
      candidateSha256:
        'd7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611',
      diffSha256:
        '72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18',
      candidateManifestSha256:
        'd88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5',
      candidateDataQualityReviewPassed: true,
      candidateRole: 'review-oracle-not-direct-import-payload',
      soloPreGitPackage: [
        'candidate.json',
        'diff.json',
        'manifest.json',
        'focused-deterministic-test',
      ],
      preGitExcelPdfRequired: false,
      draftExcelPdfDeferredTo: 'exact-p14c-production-draft',
      exactOwnerRatificationPending: true,
      candidateAccepted: false,
      gitScopeRequiresSeparateExplicitStatement: true,
    })
    for (const field of [
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciAuthorized',
      'previewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'applicationMutationAuthorized',
      'sourceMutationAuthorized',
      'catalogMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(currentReviewMarker[field]).toBe(false)
    }

    const canonicalRoute = p51
      .split('\n')
      .find((line) => line.startsWith('`P-51D -> Gate 1'))
    expect(canonicalRoute).toContain(
      'P-50R-SOLO complete -> one exact P-50D V3 Owner confirmation (ratification), also accepting existing verified P-50C only as local review evidence -> separately authorized Git/CI/Preview',
    )
    expect(canonicalRoute).not.toContain('P-50D -> P-50C')
    expect(canonicalRoute).toContain(
      'Gate 2 [P-13 -> P-14 checkpoint -> P-14C STOP UNPUBLISHED]',
    )
    expect(canonicalRoute).toContain(
      'Gate 3 [P-15 -> ordered closeout/custody]',
    )
    expectInOrder(p51, [
      '### 2.1 Gate 1',
      '#### P-50R-SOLO',
      '#### P-50D checkpoint',
      '#### P-50C and Git/CI checkpoint',
      '### 2.2 Gate 2 — bounded P-13/P-14/P-14C window',
      '### 2.3 Gate 3 — separate P-15 publication and closeout',
    ])
    const boundedWindowSection = p51.slice(
      p51.indexOf('### 2.2 Gate 2'),
      p51.indexOf('### 2.3 Gate 3'),
    )
    expect(boundedWindowSection).toContain('P-14 checkpoint')
    expect(boundedWindowSection).toContain('Gate 2 must end')
    expect(boundedWindowSection).toContain(
      'one P-14C draft **unpublished**',
    )
    const publicationSection = p51.slice(
      p51.indexOf('### 2.3 Gate 3'),
      p51.indexOf('## 3. Minimal identifier bindings'),
    )
    expect(publicationSection).toContain(
      'P-15 requires a new explicit decision',
    )
    expect(p51).toMatch(/100% of both source and\s+catalog\/candidate rows/)
    expect(p51).toContain(
      'two fresh deterministic runs whose canonical result hashes are identical',
    )
    expect(p51).toContain(
      'Owner self-review of every delta and exception',
    )
    expect(p51).toMatch(
      /Security-risk acceptance under P-51 does\s+not\s+accept\s+price, accounting,\s+(?:source-authority|evidence-precedence), or data-quality risk\./,
    )
    expect(p51).toContain(
      'P-50R-SOLO and P-50C use no Supabase client',
    )
    expect(p51).toContain('2026-08-25 23:59:59 +07')
    expect(p51).toMatch(
      /P-50D, P-50C, Git\/CI\/Preview, P-13, P-14, P-14C, and P-15 remain false/,
    )

    for (const path of [
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
    ]) {
      const operationalContract = read(path)
      expect(operationalContract).toContain('P-50R SOLO')
      expect(operationalContract).toContain(
        'P-13/P-14/P-14C bounded window',
      )
      expect(operationalContract).toMatch(/P-15[\s\S]{0,180}separate/i)
      expect(operationalContract).toContain('DRAFT – ห้ามใช้อ้างอิง')
      expect(operationalContract).toMatch(/official Excel\/PDF/i)
      expect(operationalContract).toMatch(
        /post-publication[^\n]{0,120}backup/i,
      )
    }
  })

  it('records P-50 as a pre-P-15 one-row candidate without authorizing Production or publication', () => {
    const p50Path =
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md'
    const p50 = read(p50Path)
    const markerMatch = p50.match(
      /<!-- P50_CATALOG_PRICE_ERRATUM_PRE_P15_DECISION_V2 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    expect(JSON.parse(markerMatch![1])).toEqual({
      schema: 'conduit-boq/p50-catalog-price-erratum-pre-p15-decision/v2',
      recordedAt: '2026-08-17T23:44:12+07:00',
      reframedAt: '2026-08-18',
      disposition:
        'pre-p15-full-source-price-reconciliation-required-release-path-owner-decision-pending',
      ownerReleasePathDecisionPending: true,
      currentPublishedVersion: '2568.0.0',
      firstStructuredCandidate: '2568.1.0',
      historicalCandidatePriceGate: 'zero-price-change',
      historicalCandidatePriceGateStillBinding: true,
      historicalCandidatePriceGateSupersessionAuthorized: false,
      fullSourcePriceReconciliationBeforeP15Required: true,
      reconciliationExecutionAuthorized: false,
      sourceFileAccessAuthorized: false,
      databaseAccessAuthorized: false,
      productionReadAuthorized: false,
      exactCorrectionManifestApproved: false,
      durablePriceAuthorityApproved: false,
      adr003VersionDecisionApproved: false,
      correctionAuthorized: false,
      rebaselineAuthorized: false,
      securityRiskAcceptanceCoversPriceOrDataQuality: false,
      p15Hold: true,
      separatePriceRiskDecisionMayReleaseP15Hold: true,
      identityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      legacyItemCode: 'ITEM-0429',
      candidateStructuredCode: 'COR-PB0-002',
      materialBefore: '0.00',
      materialAfter: '0.00',
      laborBefore: '1763.00',
      laborProposed: '1764.00',
      unitBefore: '1763.00',
      unitProposed: '1764.00',
      sourcePdfSha256:
        '5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b',
      sourcePdfPage: 24,
      rawReconciliationSha256:
        '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
      firstRolloutAuthoritySha256:
        '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
      rawReconciliationPreserved: true,
      adjacentFindingsAuthorized: false,
      existingBoqRepriceAuthorized: false,
      currentCatalogMutationAuthorized: false,
      p13Authorized: false,
      p14Authorized: false,
      p15Authorized: false,
      localCommitAuthorized: false,
      externalGitPublicationAuthorized: false,
      automaticNextStep: false,
    })

    const historicalResultMarkerMatch = p50.match(
      /<!-- P50_P50R_RESULT_OVERLAY_V1 (\{[^\n]+\}) -->/,
    )
    expect(historicalResultMarkerMatch).not.toBeNull()
    const historicalResultMarker = JSON.parse(historicalResultMarkerMatch![1])
    expect(historicalResultMarker).toMatchObject({
      schema: 'conduit-boq/p50-p50r-result-overlay/v1',
      currentAsOf: '2026-08-22',
      p50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rCompleted: true,
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      reviewBindingSha256:
        '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      p50dProposalId: 'P50D-REQ-20260822-V1',
      p50dProposalReady: true,
      historicalZeroPriceGateStillBinding: true,
    })
    for (const field of [
      'p50dAuthorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionWriteAuthorized',
      'catalogMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(historicalResultMarker[field]).toBe(false)
    }

    const currentMarkerMatch = p50.match(
      /<!-- P50_BASELINE_FIRST_AUTHORITY_OVERLAY_V1 (\{[^\n]+\}) -->/,
    )
    expect(currentMarkerMatch).not.toBeNull()
    const currentMarker = JSON.parse(currentMarkerMatch![1])
    expect(currentMarker).toMatchObject({
      schema: 'conduit-boq/p50-baseline-first-authority-overlay/v1',
      currentAsOf: '2026-08-23',
      currentPublishedVersion: '2568.0.0',
      currentPublishedRowCount: 710,
      baselineAuthorityFields: [
        'item_name',
        'unit',
        'material_cost',
        'labor_cost',
        'unit_cost',
      ],
      p50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      p50rReviewBindingSha256:
        '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      p50rOutputsRole: 'immutable-comparison-evidence-only',
      historicalTechnicalCandidateCount: 49,
      historicalRetainEvidenceCount: 18,
      historicalCandidateLabelsApproveCorrections: false,
      p50dV1RequestId: 'P50D-REQ-20260822-V1',
      p50dV1Superseded: true,
      currentP50dRequestId: 'P50D-REQ-20260823-V2',
      currentP50dProposalNumber: 51,
      currentOutcomes: ['BASELINE-ONLY', 'SELECTED-DELTA'],
      defaultOutcome: 'BASELINE-ONLY',
      defaultNameDeltaCount: 0,
      defaultUnitDeltaCount: 0,
      defaultPriceDeltaCount: 0,
      selectedDeltaRequiresExactOwnerSelection: true,
      selectedDeltaNameUnitMutationAuthorized: false,
    })
    for (const field of [
      'p50dV2Authorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(currentMarker[field]).toBe(false)
    }

    const p50AuthorityPaths = [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    ]

    for (const path of p50AuthorityPaths) {
      const authority = read(path)
      expect(authority).toContain('P-50')
      expect(authority).toContain(
        './46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      )
      expect(authority).toContain('2568.0.0')
      expect(authority).toMatch(
        /(?:before[^\n]{0,60}P-15|pre-P-15)/i,
      )
      expect(authority).toContain(
        './53-phase4-p50c-one-row-offline-candidate-result-record.md',
      )
      expect(authority).toContain('P50C-CANDIDATE-20260823-V1')
    }

    expect(p50).toContain('ITEM-0427')
    expect(p50).toContain('ITEM-0430')
    expect(p50).toContain('ITEM-0431')
    expect(p50).toMatch(/ITEM-0427[\s\S]{0,240}1801[\s\S]{0,80}6871[\s\S]{0,160}1802[\s\S]{0,80}6872/)
    expect(p50).toMatch(/ITEM-0430[\s\S]{0,240}1763[\s\S]{0,160}1764/)
    expect(p50).toMatch(/ITEM-0431[\s\S]{0,240}3526[\s\S]{0,160}3528/)
    expect([
      ...p50.matchAll(
        /historical technical candidate; not selected\/authorized/g,
      ),
    ]).toHaveLength(3)
    expect(p50).toMatch(
      /100% of both source and catalog(?:\/candidate)?\s+rows/i,
    )
    expect(p50).toContain(
      'ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b',
    )
    expect(p50).toContain('workbook row 620/source row 782')
    expect(p50).not.toContain('2568.0.1')
    expect(p50).toContain('`BASELINE-ONLY` — current default')
    expect(p50).toContain('`SELECTED-DELTA` — optional exact Owner selection')
    expect(p50).toContain(
      'Proposal #50 Path A and Path B are superseded',
    )
    expect(p50).toContain(
      'security-risk acceptance cannot authorize,\nwaive, or absorb a price/data-quality discrepancy',
    )
    expect(p50).toContain(
      'Any import after a final selected money edit invalidates',
    )

    const runbook = read(
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
    )
    expect(runbook).toContain(
      'Require the price-change set to equal the exact ratified P-50D V3 manifest',
    )

    const reconciliationPath =
      'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv'
    const reconciliation = read(reconciliationPath)
    expect(createHash('sha256').update(reconciliation).digest('hex')).toBe(
      '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
    )
    expect(reconciliation).toContain(
      '"f2662c71-a6e5-407e-8456-8608e304b43b","ITEM-0429","COR-PB0-002"',
    )
    expect(reconciliation).toContain(
      '"0","0","1763","1763","1763","1763","recode","preserve_production"',
    )

    const firstRolloutAuthority = read(
      'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
    )
    expect(
      createHash('sha256').update(firstRolloutAuthority).digest('hex'),
    ).toBe(
      '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
    )

    const decisionRegister = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    expect(decisionRegister).toMatch(
      /\| Publish named version \| P-15 not requested \|/,
    )
    expect(decisionRegister).toMatch(/\| P-51 \|/)
    expect(decisionRegister).toContain(
      'waives P-49 only as a blocker for the exact first Master Catalog closeout',
    )
    expect(
      existsSync(
        resolve(
          root,
          'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-post-p15-correction-plan.md',
        ),
      ),
    ).toBe(false)
  })

  it('preserves the exact consumed P-50R SOLO request contract as historical authority', () => {
    const requestPath =
      'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md'
    const request = read(requestPath)
    const markerMatch = request.match(
      /<!-- P50R_SOLO_RECONCILIATION_REQUEST_V1 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    const marker = JSON.parse(markerMatch![1])
    expect(marker).toMatchObject({
      schema: 'conduit-boq/p50r-solo-reconciliation-request/v1',
      preparedAt: '2026-08-21',
      requestId: 'P50R-SOLO-REQ-20260821-V1',
      baseCommit: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
      status: 'ready-for-owner-review-execution-not-authorized',
      mode: 'solo-operator',
      supersedesStageModel: 'P-50R-I->P-50R-O->P-50R-X',
      stagedModelExecuted: false,
      stagedModelSuperseded: true,
      ownerReviewReady: true,
      ownerDecisionPending: true,
      soloOperatorSelfReviewAccepted: true,
      requestedScope: 'one-offline-read-only-full-reconciliation',
      sourceReadRequested: true,
      boundedEvidenceWriteRequested: true,
      inputCount: 5,
      implementationFileCount: 3,
      evidenceFileCount: 5,
      coverageRequirement: '100-percent-bidirectional',
      deterministicPassCount: 2,
      pdfPageCount: 28,
      manualAllPageReviewRequired: true,
      exactDeltaReviewRequired: true,
      identityKey: 'stable-identity-id',
      currentPublishedVersion: '2568.0.0',
      firstStructuredCandidate: '2568.1.0',
      historicalZeroPriceGateStillBinding: true,
      identityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      legacyItemCode: 'ITEM-0429',
      candidateStructuredCode: 'COR-PB0-002',
      frozenPriceTriple: '0/1763/1763',
      proposedPriceTriple: '0/1764/1764',
      productionSnapshotSha256:
        'a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570',
      taxonomyWorkbookSha256:
        'ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b',
      sourcePdfSha256:
        '5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b',
      rawReconciliationSha256:
        '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
      firstRolloutAuthoritySha256:
        '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
      reconciliationCompleted: false,
      reconciliationResultSha256: null,
    })

    for (const field of [
      'executionBaselineFrozen',
      'priceSourceAuthorityFiled',
      'protectedSourceReadAuthorized',
      'sourceDirectoryEnumerationAuthorized',
      'runnerImplementationAuthorized',
      'reconciliationExecutionAuthorized',
      'evidenceWriteAuthorized',
      'localDatabaseAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'dependencyInstallAuthorized',
      'sourceMutationAuthorized',
      'historicalEvidenceMutationAuthorized',
      'protectedUntrackedMutationAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'exactCorrectionManifestApproved',
      'durablePriceAuthorityApproved',
      'adr003VersionDecisionApproved',
      'adjacentFindingsAuthorized',
      'p50dAuthorized',
      'p50cAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(marker[field]).toBe(false)
    }

    const consumedOverlayMatch = request.match(
      /<!-- P50R_CONSUMED_BASELINE_FIRST_OVERLAY_V1 (\{[^\n]+\}) -->/,
    )
    expect(consumedOverlayMatch).not.toBeNull()
    const consumedOverlay = JSON.parse(consumedOverlayMatch![1])
    expect(consumedOverlay).toMatchObject({
      schema: 'conduit-boq/p50r-consumed-baseline-first-overlay/v1',
      currentAsOf: '2026-08-23',
      p50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rConsumed: true,
      p50rCompleted: true,
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      p50rResidualAuthority: false,
      reviewBindingSha256:
        '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      reconciliationSha256:
        '4bd5c30fa60b323164eb0303d211ae31f211bbdb337f2236ed15970b63912bee',
      deltaManifestSha256:
        'c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47',
      exceptionsSha256:
        '93e179ef906849bcd5c383986aaf560f84e6242a815c2d2649e3d8b78142600b',
      summarySha256:
        '7cc7cf4bbe1fea8783e5cc6fa736e018591d461325a43ed7570c26e015fe8d3d',
      sha256sumsSha256:
        '35485e1a862e9894a6e51def37b4a2df5300b23578e157e9dbd79ced54efc3ff',
      publishedCurrentBaseline: '2568.0.0',
      publishedCurrentRowCount: 710,
      baselineAuthorityFields: [
        'item_name',
        'unit',
        'material_cost',
        'labor_cost',
        'unit_cost',
      ],
      p50rOutputsRole: 'immutable-comparison-evidence-only',
      historicalTechnicalCandidateCount: 49,
      historicalTechnicalCandidatesApproved: false,
      historicalSourceVersionDifferenceCount: 18,
      p50dV1RequestId: 'P50D-REQ-20260822-V1',
      p50dV1Superseded: true,
      currentP50dRequestId: 'P50D-REQ-20260823-V2',
      currentP50dProposalNumber: 51,
      defaultOutcome: 'BASELINE-ONLY',
      defaultNameDeltaCount: 0,
      defaultUnitDeltaCount: 0,
      defaultPriceDeltaCount: 0,
      selectedDeltaRequiresExactStableIdentitiesAndTriples: true,
    })
    for (const field of [
      'p50dV2Authorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(consumedOverlay[field]).toBe(false)
    }

    const exactInputs = [
      [
        'supabase/.snapshots/public-data-20260621-post009.sql',
        'a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570',
      ],
      [
        'files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf',
        '5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b',
      ],
      [
        'files/NT_Item_Code_Master_K_Mapping_2568.xlsx',
        'ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b',
      ],
      [
        'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
        '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
      ],
      [
        'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
        '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
      ],
    ]
    const inputSection = request.slice(
      request.indexOf('## 2. Exact five-input read contract'),
      request.indexOf('## 3. One runner, one focused test, one evidence package'),
    )
    expect(
      [
        ...inputSection.matchAll(
          /^\| `([^`]+)` \| SHA-256 `([a-f0-9]{64})`;/gm,
        ),
      ].map((match) => [match[1], match[2]]),
    ).toEqual(exactInputs)
    expect(exactInputs.every(([path]) => !/[?*\[\]{}]/.test(path))).toBe(true)
    expect(inputSection).toContain('12 frozen columns and 710 active rows')
    expect(inputSection).toContain('all 28 pages')
    expect(inputSection).toContain(
      'range `A1:AE709`, 31 headers, 708 data rows',
    )
    expect(inputSection).toContain(
      '27 columns and 728 records: 710 `production`, 18 `workbook_candidate`',
    )
    expect(inputSection).toContain(
      '710 mappings, 17 exclusions, 65 groups',
    )
    expect(inputSection).toContain(
      'No directory listing, glob, recursive scan, sibling-file read',
    )
    expect(inputSection).toContain('Recompute all five hashes after the run')

    const implementationPaths = [
      'scripts/reconcile-master-catalog-p50r.mjs',
      'scripts/reconcile-master-catalog-p50r-pdf.py',
      'tests/master-catalog-p50r-reconciliation.test.ts',
    ]
    const implementationSection = request.slice(
      request.indexOf('### 3.1 Implementation allowlist'),
      request.indexOf('### 3.2 Evidence write allowlist'),
    )
    expect(
      [...implementationSection.matchAll(/^\d+\. `([^`]+)`/gm)].map(
        (match) => match[1],
      ),
    ).toEqual(implementationPaths)

    const evidencePaths = [
      'docs/plans/master-catalog/evidence/p50r-solo/reconciliation.csv',
      'docs/plans/master-catalog/evidence/p50r-solo/proposed-delta-manifest.json',
      'docs/plans/master-catalog/evidence/p50r-solo/exceptions.json',
      'docs/plans/master-catalog/evidence/p50r-solo/summary.json',
      'docs/plans/master-catalog/evidence/p50r-solo/SHA256SUMS',
    ]
    const evidenceSection = request.slice(
      request.indexOf('### 3.2 Evidence write allowlist'),
      request.indexOf('## 4. Minimum reconciliation and self-review contract'),
    )
    expect(
      [...evidenceSection.matchAll(/^\d+\. `([^`]+)`/gm)].map(
        (match) => match[1],
      ),
    ).toEqual(evidencePaths)
    expect(evidenceSection).toContain('All targets must be absent')
    expect(evidenceSection).toContain('No existing evidence')
    expect(evidenceSection).toContain(
      'synthetic in-memory inputs only',
    )

    expect(request).toContain('Coverage must be 100% bidirectional')
    expect(request).toContain('Stable UUID identity is primary')
    expect(request).toContain('Never use price as an identity key')
    expect(request).toContain('material + labor = unit cost')
    expect(request).toContain(
      'SQL 710 rows must equal CSV 710 Production rows',
    )
    expect(request).toContain(
      'Workbook 708 rows must reconcile exactly',
    )
    expect(request).toContain(
      'JSON 710 mappings/17 exclusions/65 groups must reconcile',
    )
    expect(request).toContain(
      'Every PDF row on every page must appear exactly once',
    )
    for (const itemCode of ['ITEM-0429', 'ITEM-0427', 'ITEM-0430', 'ITEM-0431']) {
      expect(request).toContain(itemCode)
    }

    const deterministicSection = request.slice(
      request.indexOf('### 4.2 Two-pass determinism'),
      request.indexOf('### 4.3 Solo manual review'),
    )
    expect(deterministicSection).toContain(
      'execute two independent\nin-memory passes',
    )
    expect(deterministicSection).toContain(
      'compare exact canonical\nbytes',
    )
    expect(deterministicSection).toContain(
      'Any difference is `HOLD` before the first evidence write',
    )
    for (const output of evidencePaths.slice(0, 3)) {
      expect(deterministicSection).toContain(
        '`' + output.split('/').at(-1) + '`',
      )
    }

    const manualReviewSection = request.slice(
      request.indexOf('### 4.3 Solo manual review'),
      request.indexOf('## 5. Hard stops and explicit non-authority'),
    )
    expect(manualReviewSection).toContain('all 28 PDF pages')
    expect(manualReviewSection).toContain(
      'every proposed price delta, including adjacent findings',
    )
    expect(manualReviewSection).toContain(
      'every unmatched, duplicate, ambiguous, arithmetic, and source-precedence',
    )
    expect(manualReviewSection).toContain('`pending_p50d`')
    expect(manualReviewSection).toContain('`PASS_FOR_P50D_REQUEST` or `HOLD`')

    expect(request).toContain(
      'offline/read-only source access with no database or network connection',
    )
    expect(request).toContain(
      'Local or Production DB access/write',
    )
    expect(request).toContain(
      'editing the source inputs, published catalog, candidate, pointer, BOQ',
    )
    expect(request).toContain(
      'P-50D/P-50C/Git/P-13/P-14/P-14C/P-15=false',
    )
    const normalizedRequest = request.replace(/\s+/g, ' ')
    expect(normalizedRequest).toContain(
      'P-51D -> P-50R SOLO complete -> one exact P-50D V3 Owner confirmation (ratification) that also accepts the verified offline P-50C package only as local review evidence -> separately authorized local release commit/push + CI/Preview -> P-13/P-14/P-14C bounded window -> separate P-15 -> closeout -> P-49',
    )
    expect(normalizedRequest).not.toContain(
      'The canonical solo route is: `P-51D -> P-50R SOLO -> P-50D -> P-50C',
    )
    expect(request).toContain(
      'P-15 remains a separate confirmation',
    )
    expect(request).toContain('HISTORICAL REQUEST CONSUMED; P-50R COMPLETE')
    expect(request).toContain(
      '## 10. Superseded same-day downstream interpretation — 2026-08-23',
    )
    expect(request).toContain(
      '## 11. Current downstream authority correction — 2026-08-24',
    )

    const trackedReconciliation = read(
      'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
    )
    expect(
      createHash('sha256').update(trackedReconciliation).digest('hex'),
    ).toBe(exactInputs[3][1])
    const trackedAuthority = read(
      'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
    )
    expect(createHash('sha256').update(trackedAuthority).digest('hex')).toBe(
      exactInputs[4][1],
    )

    for (const path of [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
    ]) {
      expect(read(path)).toContain(
        './49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
      )
    }

    const decisionRegister = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    const p50rRow = decisionRegister
      .split('\n')
      .find((line) => line.startsWith('| P-50R |'))
    expect(p50rRow).toMatch(/offline\/read-only SOLO reconciliation/i)
    expect(p50rRow).toMatch(/APPROVAL CONSUMED/i)
    expect(p50rRow).toContain('PASS_FOR_P50D_REQUEST')
    expect(p50rRow).toMatch(/no P-50D, mutation, Git, or later gate/i)

    const tracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    const normalizedTracker = tracker.replace(/\s+/g, ' ')
    expect(tracker).toContain('P50R-SOLO-REQ-20260821-V1')
    expect(normalizedTracker).toMatch(
      /P-50D V3[^.]{0,180}(?:received|complete)[^.]{0,180}decision-record-only/i,
    )
    expect(normalizedTracker).toMatch(
      /P-50C[^.]{0,180}accepted only as local review evidence/i,
    )
    expect(normalizedTracker).toMatch(
      /P-50D V3 ratification stop boundary — reached/i,
    )
    expect(normalizedTracker).toMatch(
      /no small repository\s*>?\s*gate(?:,| and no)\s*>?\s*Git\/CI (?:authorization )?request[^.]{0,240}(?:is|are) authorized/i,
    )
    expect(tracker).toContain('P50D-REQ-20260823-V2')
    expect(tracker).toMatch(
      /P50D-REQ-20260822-V1[^\n]{0,160}superseded without approval/i,
    )
    const canonicalRoute = tracker
      .split('\n')
      .find((line) => line.startsWith('| Canonical first-closeout route |'))
    expect(canonicalRoute).toContain(
      'P-51D -> P-50R SOLO complete -> V2 one-row selection intent -> P-50D V3 exact Owner ratification complete/P-50C accepted only as local review evidence -> P-50G PASS/authorization consumed -> review separately prepared P-50H proposal',
    )
    expect(canonicalRoute).toContain(
      'P-50G PASS/authorization consumed',
    )
    expect(canonicalRoute).toContain(
      'P-50H execution, P-13/P-14/P-14C, P-15',
    )
    expect(tracker).toMatch(/P-15[^\n]*separate/i)
  })

  it('preserves superseded P-50D V1 and binds current baseline-first V2 without authority', () => {
    const historicalProposalPath =
      'docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md'
    const currentProposalPath =
      'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md'
    const evidenceRoot = 'docs/plans/master-catalog/evidence/p50r-solo'
    const historicalProposal = read(historicalProposalPath)
    const currentProposal = read(currentProposalPath)
    const supersessionMatch = historicalProposal.match(
      /<!-- P50D_V1_SUPERSESSION_OVERLAY_V1 (\{[^\n]+\}) -->/,
    )

    expect(supersessionMatch).not.toBeNull()
    const supersession = JSON.parse(supersessionMatch![1])
    expect(supersession).toMatchObject({
      schema: 'conduit-boq/p50d-v1-supersession-overlay/v1',
      recordedAt: '2026-08-23',
      supersededRequestId: 'P50D-REQ-20260822-V1',
      supersededWithoutApproval: true,
      approvable: false,
      replacementRequestId: 'P50D-REQ-20260823-V2',
      replacementProposal:
        './51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      ownerBaselineVersion: '2568.0.0',
      ownerBaselineFieldAuthority: [
        'item_name',
        'unit',
        'material_cost',
        'labor_cost',
        'unit_cost',
      ],
      p50rEvidencePreserved: true,
      p50rEvidenceComparisonOnly: true,
      historicalV1MarkerPreserved: true,
      historicalZeroPriceGateStillBinding: true,
    })
    for (const field of [
      'p50dAuthorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(supersession[field]).toBe(false)
    }
    expect(historicalProposal).toContain(
      'SUPERSEDED WITHOUT APPROVAL / NOT APPROVABLE',
    )
    expect(historicalProposal).toContain(
      'Everything below this notice is retained as the historical, unapproved V1',
    )

    const markerMatch = historicalProposal.match(
      /<!-- P50D_OWNER_DECISION_PROPOSAL_V1 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    const marker = JSON.parse(markerMatch![1])
    expect(marker).toMatchObject({
      schema: 'conduit-boq/p50d-owner-decision-proposal/v1',
      preparedAt: '2026-08-22',
      requestId: 'P50D-REQ-20260822-V1',
      consumesP50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      p50rReviewBindingSha256:
        '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      deltaManifestSha256:
        'c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47',
      deltaRecordCount: 67,
      recommendedPath: 'A',
      recommendedRowBasis: 'same-filed-2568-basis-source-restoration',
      recommendedReleaseIntent: 'revision',
      recommendedTarget: '2568.1.0',
      recommendedCorrectionCount: 49,
      recommendedCorrectionSetSha256:
        '42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0',
      cohortACount: 25,
      cohortASetSha256:
        '95ca7c3c77b5697c64d099a186f17e9116b7eff54409f6fea2a7a3dd8d5a7ec5',
      cohortBCount: 24,
      cohortBSetSha256:
        '5b7be022a56c8b361671a0c6ba5e1c22234d1e0e41b6e7ed5d0f5a00976b3dd0',
      retainSourceVersionCount: 18,
      retainSourceVersionSetSha256:
        '489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2',
      authorityExclusionCount: 17,
      p51WaiverReapprovalAt: '2026-08-25T23:59:59+07:00',
      ownerPersonalResultConfirmationClaimed: false,
      historicalZeroPriceGateStillBinding: true,
    })

    for (const field of [
      'historicalZeroPriceGateSupersessionAuthorized',
      'exactCorrectionManifestApproved',
      'p50dAuthorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(marker[field]).toBe(false)
    }

    const currentMarkerMatch = currentProposal.match(
      /<!-- P50D_BASELINE_FIRST_OWNER_REVIEW_PROPOSAL_V2 (\{[^\n]+\}) -->/,
    )
    expect(currentMarkerMatch).not.toBeNull()
    const currentMarker = JSON.parse(currentMarkerMatch![1])
    expect(currentMarker).toMatchObject({
      schema: 'conduit-boq/p50d-baseline-first-owner-review-proposal/v2',
      preparedAt: '2026-08-23',
      requestId: 'P50D-REQ-20260823-V2',
      supersedesRequestId: 'P50D-REQ-20260822-V1',
      supersededRequestApproved: false,
      baselineVersion: '2568.0.0',
      baselineRowCount: 710,
      baselineSnapshotSha256:
        'a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570',
      baselineValueBindingSha256:
        '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
      baselineAuthorityFields: [
        'item_name',
        'unit',
        'material_cost',
        'labor_cost',
        'unit_cost',
      ],
      consumesP50rRequestId: 'P50R-SOLO-REQ-20260821-V1',
      p50rResult: 'PASS_FOR_P50D_REQUEST',
      p50rReviewBindingSha256:
        '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      p50rDeltaManifestSha256:
        'c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47',
      p50rEvidenceComparisonOnly: true,
      externalSourcePriceCandidateCount: 49,
      externalSourcePriceCandidateSetSha256:
        '42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0',
      retainBaselineCount: 18,
      retainBaselineSetSha256:
        '489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2',
      authorityExclusionCount: 17,
      proposedNameChangeCount: 0,
      proposedUnitChangeCount: 0,
      proposedMaterialChangeCount: 0,
      initialApprovedChangeCount: 0,
      initialApprovedSetSha256:
        '37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570',
      ownerChoices: ['BASELINE-ONLY', 'SELECTED-DELTA'],
      historicalZeroPriceGateStillBinding: true,
      historicalZeroPriceGateSupersessionAuthorized: false,
      exactSelectedDeltaManifestApproved: false,
    })
    for (const field of [
      'p50dAuthorized',
      'p50cAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'catalogMutationAuthorized',
      'candidateMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'gitPublicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(currentMarker[field]).toBe(false)
    }

    const baselineInputPath =
      'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv'
    const baselineInputBytes = readFileSync(resolve(root, baselineInputPath))
    expect(createHash('sha256').update(baselineInputBytes).digest('hex')).toBe(
      '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
    )
    const baselineWorkbook = XLSX.read(baselineInputBytes, {
      type: 'buffer',
      codepage: 65001,
      raw: false,
    })
    const baselineWorksheet =
      baselineWorkbook.Sheets[baselineWorkbook.SheetNames[0]]
    const baselineValueRecords = XLSX.utils
      .sheet_to_json<Record<string, unknown>>(baselineWorksheet, {
        defval: '',
        raw: true,
      })
      .filter((row) => String(row.record_scope) === 'production')
      .map((row) => ({
        identity_id: String(row.production_uuid),
        legacy_item_code: String(row.legacy_item_code),
        item_name: String(row.production_name),
        unit: String(row.production_unit),
        material_cost: Number(row.production_material_cost),
        labor_cost: Number(row.production_labor_cost),
        unit_cost: Number(row.production_unit_cost),
      }))
      .sort((left, right) =>
        left.legacy_item_code.localeCompare(right.legacy_item_code, 'en'),
      )
    expect(baselineValueRecords).toHaveLength(710)
    expect(baselineValueRecords[0]?.legacy_item_code).toBe('ITEM-0001')
    expect(baselineValueRecords.at(-1)?.legacy_item_code).toBe('ITEM-0710')
    expect(
      createHash('sha256')
        .update(JSON.stringify(baselineValueRecords) + '\n')
        .digest('hex'),
    ).toBe(currentMarker.baselineValueBindingSha256)
    const p50rChecksums = read(`${evidenceRoot}/SHA256SUMS`)
    expect(p50rChecksums).toContain(
      `${currentMarker.baselineSnapshotSha256}  supabase/.snapshots/public-data-20260621-post009.sql`,
    )
    expect(
      createHash('sha256').update(JSON.stringify([]) + '\n').digest('hex'),
    ).toBe(currentMarker.initialApprovedSetSha256)

    const evidenceHashes = {
      'reconciliation.csv':
        '4bd5c30fa60b323164eb0303d211ae31f211bbdb337f2236ed15970b63912bee',
      'proposed-delta-manifest.json':
        'c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47',
      'exceptions.json':
        '93e179ef906849bcd5c383986aaf560f84e6242a815c2d2649e3d8b78142600b',
      'summary.json':
        '7cc7cf4bbe1fea8783e5cc6fa736e018591d461325a43ed7570c26e015fe8d3d',
      SHA256SUMS:
        '35485e1a862e9894a6e51def37b4a2df5300b23578e157e9dbd79ced54efc3ff',
    }
    for (const [name, sha256] of Object.entries(evidenceHashes)) {
      expect(
        createHash('sha256')
          .update(read(`${evidenceRoot}/${name}`))
          .digest('hex'),
      ).toBe(sha256)
    }

    const summary = JSON.parse(read(`${evidenceRoot}/summary.json`))
    expect(summary).toMatchObject({
      request_id: 'P50R-SOLO-REQ-20260821-V1',
      result: 'PASS_FOR_P50D_REQUEST',
      next_step: 'STOP_AT_P50D_OWNER_DECISION_REQUEST',
      review_binding: {
        digest:
          '55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc',
      },
      delta_review: {
        record_count: 67,
        every_record_pending_p50d: true,
        mutation_authorized: false,
      },
      exception_review: {
        record_count: 245,
        blocking_count: 0,
      },
      authority: {
        p50d_authorized: false,
        p50c_authorized: false,
        automatic_next_step: false,
      },
    })
    expect(summary.page_review.status).toBe('reviewed_all_28_pages')

    const manifest = JSON.parse(
      read(`${evidenceRoot}/proposed-delta-manifest.json`),
    )
    const cohortA = manifest.records.filter(
      (record: Record<string, unknown>) =>
        record.classification === 'proposed_confirmed_correction' &&
        record.sql_vs_xlsx === 'equal' &&
        record.xlsx_vs_pdf === 'different',
    )
    const cohortB = manifest.records.filter(
      (record: Record<string, unknown>) =>
        record.classification === 'proposed_confirmed_correction' &&
        record.sql_vs_xlsx === 'different' &&
        record.xlsx_vs_pdf === 'equal',
    )
    const retain = manifest.records.filter(
      (record: Record<string, unknown>) =>
        record.classification === 'source_version_difference',
    )
    const digest = (records: Array<Record<string, unknown>>) =>
      createHash('sha256')
        .update(JSON.stringify(records) + '\n')
        .digest('hex')

    expect(manifest).toMatchObject({
      record_count: 67,
      status: 'evidence_only_pending_p50d',
      price_mutation_authorized: false,
    })
    expect(
      new Set(
        manifest.records.map(
          (record: { identity_key: string }) => record.identity_key,
        ),
      ).size,
    ).toBe(67)
    expect(
      manifest.records.every(
        (record: { decision_status: string }) =>
          record.decision_status === 'pending_p50d',
      ),
    ).toBe(true)
    expect(
      manifest.records.every(
        (record: { proposed_action: string }) =>
          record.proposed_action === 'none',
      ),
    ).toBe(true)
    expect(cohortA).toHaveLength(25)
    expect(cohortB).toHaveLength(24)
    expect(retain).toHaveLength(18)
    expect(digest([...cohortA, ...cohortB])).toBe(
      marker.recommendedCorrectionSetSha256,
    )
    expect(digest(cohortA)).toBe(marker.cohortASetSha256)
    expect(digest(cohortB)).toBe(marker.cohortBSetSha256)
    expect(digest(retain)).toBe(marker.retainSourceVersionSetSha256)
    expect(digest([...cohortA, ...cohortB])).toBe(
      currentMarker.externalSourcePriceCandidateSetSha256,
    )
    expect(digest(retain)).toBe(currentMarker.retainBaselineSetSha256)

    const firstRolloutAuthority = JSON.parse(
      read(
        'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
      ),
    )
    expect(firstRolloutAuthority.mappings).toHaveLength(710)
    expect(firstRolloutAuthority.source_exclusions).toHaveLength(17)
    expect(currentMarker.authorityExclusionCount).toBe(
      firstRolloutAuthority.source_exclusions.length,
    )

    expect(historicalProposal).toContain('ITEM-0623 +855')
    expect(historicalProposal).toContain('ITEM-0637 -460')
    expect(historicalProposal).toContain(
      'if it is\n   absent, `HOLD` and return to P-50D instead of using target `2568.1.0`',
    )
    expect(historicalProposal).toContain(
      'Until the Owner records the complete\nSection 7 decision',
    )
    expect(currentProposal).toContain('HISTORICAL V2 SELECTION BASIS CONSUMED')
    expect(currentProposal).toContain('P50D-REQ-20260823-V2')
    expect(currentProposal).toContain(
      'P-50R remains immutable comparison evidence',
    )
    expect(currentProposal).toContain('| Approved name changes | `0` |')
    expect(currentProposal).toContain('| Approved unit changes | `0` |')
    expect(currentProposal).toContain(
      '| Approved material-price changes | `0` |',
    )
    expect(currentProposal).toContain(
      '| Approved labor-price changes | `0` |',
    )
    expect(currentProposal).toContain(
      '| Approved unit-cost changes | `0` |',
    )
    expect(currentProposal).toContain(
      'P-50C/DB/Production/network/mutation/Git/P-13/P-14/P-14C/P-15 remain false',
    )

    for (const path of [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
      historicalProposalPath,
    ]) {
      const authority = read(path)
      expect(authority).toContain(
        './51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      )
      expect(authority).toContain('2568.0.0')
    }

    const tracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    expect(tracker).toContain('P50D-REQ-20260823-V2')
    expect(tracker).toMatch(
      /P50D-REQ-20260822-V1[^\n]{0,160}superseded without approval/i,
    )
  })

  it('preserves the original P-50C interpretation and binds the reviewed candidate evidence', () => {
    const resultPath =
      'docs/plans/master-catalog/53-phase4-p50c-one-row-offline-candidate-result-record.md'
    const result = read(resultPath)
    const resultMarkerMatch = result.match(
      /<!-- P50C_ONE_ROW_OFFLINE_CANDIDATE_RESULT_V1 (\{[^\n]+\}) -->/,
    )

    expect(resultMarkerMatch).not.toBeNull()
    const marker = JSON.parse(resultMarkerMatch![1])
    expect(marker).toMatchObject({
      schema: 'conduit-boq/p50c-one-row-offline-candidate-result/v1',
      recordedAt: '2026-08-23',
      p50dRequestId: 'P50D-REQ-20260823-V3',
      p50dDecision: 'SELECTED-DELTA',
      p50dApproved: true,
      p50dManifestSha256:
        '1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429',
      selectedRecordCount: 1,
      selectedRecordsSha256:
        'f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df',
      selectedIdentityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      selectedLegacyItemCode: 'ITEM-0429',
      selectedTargetItemCode: 'COR-PB0-002',
      baselinePrice: [0, 1763, 1763],
      candidatePrice: [0, 1764, 1764],
      p50cCandidateId: 'P50C-CANDIDATE-20260823-V1',
      p50cOfflineBuildAuthorized: true,
      p50cOfflineBuildAuthorityConsumed: true,
      p50cOfflineBuildComplete: true,
      candidateSha256:
        'd7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611',
      diffSha256:
        '72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18',
      candidateManifestSha256:
        'd88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5',
      candidateRowCount: 710,
      identityRecodeCount: 709,
      identityRetainCount: 1,
      changedAuthorityValueRowCount: 1,
      unchangedAuthorityValueRowCount: 709,
      nameChangeCount: 0,
      unitChangeCount: 0,
      materialChangeCount: 0,
      laborChangeCount: 1,
      unitCostChangeCount: 1,
      unselectedExternalCandidateCount: 48,
      authorityExclusionCount: 17,
      historicalBoqRepriceAuthorized: false,
      currentPublishedVersion: '2568.0.0',
      currentPublishedCatalogChanged: false,
      provisionalTargetVersion: '2568.1.0',
      targetRegistryCheckPending: true,
      historicalZeroPriceGateSupersededOnlyForSelectedUuidInLocalCandidate: true,
    })
    expect(result).toContain('Independent-review correction')
    const reviewCorrectionMatch = result.match(
      /<!-- P50C_RESULT_REVIEW_CORRECTION_V1 (\{[^\n]+\}) -->/,
    )
    expect(reviewCorrectionMatch).not.toBeNull()
    const reviewCorrection = JSON.parse(reviewCorrectionMatch![1])
    expect(reviewCorrection).toMatchObject({
      schema: 'conduit-boq/p50c-result-review-correction/v1',
      supersedesCurrentAuthorityOf: 'P50C_ONE_ROW_OFFLINE_CANDIDATE_RESULT_V1',
      p50dRequestId: 'P50D-REQ-20260823-V3',
      exactOwnerRatificationPending: true,
      p50dAuthorized: false,
      p50cTechnicalBuildOccurred: true,
      p50cDataReviewPassed: true,
      p50cCandidateAccepted: false,
      nextOwnerDecision: 'ratify-or-hold-exact-p50d-v3',
    })
    for (const field of [
      'p50cCandidateApplicationAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'publishedCatalogMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(marker[field]).toBe(false)
    }

    const artifactHashes = {
      'docs/plans/master-catalog/evidence/p50d-v3/p50d-selected-delta-manifest.json':
        marker.p50dManifestSha256,
      'docs/plans/master-catalog/evidence/p50c-v1/candidate.json':
        marker.candidateSha256,
      'docs/plans/master-catalog/evidence/p50c-v1/diff.json':
        marker.diffSha256,
      'docs/plans/master-catalog/evidence/p50c-v1/manifest.json':
        marker.candidateManifestSha256,
      'scripts/build-master-catalog-p50c.mjs':
        'd4ffac6f0f377dbb7586324c76b9d078c4679059167d5f48edd4de7535556957',
      'tests/master-catalog-p50c-candidate.test.ts':
        '351ac25144b5bcf267764c16d3e448dacc856c632319963a7325a95a7e109e1f',
    }
    for (const [path, sha256] of Object.entries(artifactHashes)) {
      expect(createHash('sha256').update(read(path)).digest('hex')).toBe(
        sha256,
      )
    }

    const candidate = JSON.parse(
      read('docs/plans/master-catalog/evidence/p50c-v1/candidate.json'),
    )
    const diff = JSON.parse(
      read('docs/plans/master-catalog/evidence/p50c-v1/diff.json'),
    )
    const candidateManifest = JSON.parse(
      read('docs/plans/master-catalog/evidence/p50c-v1/manifest.json'),
    )
    expect(candidate).toMatchObject({
      candidate_id: 'P50C-CANDIDATE-20260823-V1',
      baseline_version: '2568.0.0',
      provisional_target_version: '2568.1.0',
      target_version_registry_check_status: 'pending',
      row_count: 710,
    })
    expect(candidate.rows).toHaveLength(710)
    expect(candidate.rows.map((row: { display_order: number }) => row.display_order))
      .toEqual(Array.from({ length: 710 }, (_, index) => index))
    expect(diff).toMatchObject({
      candidate_id: 'P50C-CANDIDATE-20260823-V1',
      record_count: 1,
      records: [
        {
          stable_identity_id: 'f2662c71-a6e5-407e-8456-8608e304b43b',
          legacy_item_code: 'ITEM-0429',
          target_item_code: 'COR-PB0-002',
          change_fields: ['labor_cost', 'unit_cost'],
          before: { material_cost: 0, labor_cost: 1763, unit_cost: 1763 },
          after: { material_cost: 0, labor_cost: 1764, unit_cost: 1764 },
          delta: { material_cost: 0, labor_cost: 1, unit_cost: 1 },
        },
      ],
    })
    expect(candidateManifest).toMatchObject({
      status: 'candidate-built-not-authorized-for-application',
      counts: {
        candidate_row_count: 710,
        baseline_authority_value_changed_row_count: 1,
        baseline_authority_value_unchanged_row_count: 709,
        item_name_changed_row_count: 0,
        unit_changed_row_count: 0,
        material_cost_changed_row_count: 0,
        historical_boq_repriced_row_count: 0,
      },
      release: {
        target_version_is_official: false,
        fresh_issued_claimed_registry_check_status: 'pending',
      },
    })

    const currentAuthorityPaths = [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
      'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
      'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      'docs/plans/master-catalog/52-phase4-p50d-one-row-selected-delta-approval-proposal.md',
    ]
    for (const path of currentAuthorityPaths) {
      const authority = read(path)
      expect(authority).toContain(
        './53-phase4-p50c-one-row-offline-candidate-result-record.md',
      )
      expect(authority).toContain('P50C-CANDIDATE-20260823-V1')
      expect(authority).toContain(marker.candidateSha256)
      expect(authority).toContain(marker.candidateManifestSha256)
    }
  })

  it('records exact P-50D V3 Owner ratification while holding every execution gate', () => {
    const remediationPath =
      'docs/plans/master-catalog/54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md'
    const remediation = read(remediationPath)

    // Preserve the pre-receipt request, term, and validation markers as dated
    // history. The append-only receipt below is the current authority state.
    const confirmationTermMatch = remediation.match(
      /<!-- P50D_V3_EXACT_OWNER_CONFIRMATION_TERM_V1 (\{[^\n]+\}) -->/,
    )

    expect(confirmationTermMatch).not.toBeNull()
    const confirmationTerm = JSON.parse(confirmationTermMatch![1])
    expect(confirmationTerm).toMatchObject({
      schema: 'conduit-boq/p50d-v3-exact-owner-confirmation-term/v1',
      recordedAt: '2026-08-24',
      canonicalTerm: 'exact Owner confirmation (ratification)',
      thaiMeaning:
        'การยืนยันรายละเอียดแบบเจาะจงโดย Owner หลังสร้างหลักฐานแล้ว',
      legacyCommandLabel: 'RATIFY',
      requestId: 'P50D-V3-RATIFY-REQ-20260823-V1',
      p50dRequestId: 'P50D-REQ-20260823-V3',
      selectedIdentityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      selectedLegacyItemCode: 'ITEM-0429',
      selectedTargetItemCode: 'COR-PB0-002',
      baselinePrice: [0, 1763, 1763],
      candidatePrice: [0, 1764, 1764],
      p50dManifestSha256:
        '1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429',
      selectedRecordsSha256:
        'f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df',
      p50cCandidateId: 'P50C-CANDIDATE-20260823-V1',
      candidateSha256:
        'd7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611',
      diffSha256:
        '72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18',
      candidateManifestSha256:
        'd88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5',
      confirmsBindings: [
        'selected-uuid',
        'p50d-manifest-sha256',
        'selected-records-sha256',
        'p50c-candidate-sha256',
        'p50c-diff-sha256',
        'p50c-manifest-sha256',
      ],
      unchangedBaselineRowCount: 709,
      unselectedExternalCandidateCount: 48,
      retainBaselineEvidenceCount: 18,
      authorityExclusionCount: 17,
      explicitlyUnselectedAdjacentItems: [
        'ITEM-0427',
        'ITEM-0430',
        'ITEM-0431',
      ],
      rowClassification: 'same-basis-correction',
      overallReleaseClassification:
        'structured-code-revision-with-one-selected-price-delta',
      candidateRole: 'local-review-evidence-only',
      acceptsCandidateAs: 'local-review-evidence-only',
      currentPublishedVersion: '2568.0.0',
      currentPublishedCatalogChanged: false,
      provisionalTargetVersion: '2568.1.0',
      targetRegistryCheckPending: true,
      historicalBoqRepriceAuthorized: false,
      changesPriorBusinessIntent: false,
      confirmationReceived: false,
      exactOwnerConfirmationPending: true,
      exactOwnerRatificationPending: true,
    })
    for (const field of [
      'candidateApplicationAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'deployAuthorized',
      'publicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(confirmationTerm[field], field).toBe(false)
    }

    const markerMatch = remediation.match(
      /<!-- P50C_REVIEW_REMEDIATION_RATIFICATION_REQUEST_V1 (\{[^\n]+\}) -->/,
    )

    expect(markerMatch).not.toBeNull()
    const marker = JSON.parse(markerMatch![1])
    expect(marker).toMatchObject({
      schema: 'conduit-boq/p50c-review-remediation-ratification-request/v1',
      recordedAt: '2026-08-23',
      requestId: 'P50D-V3-RATIFY-REQ-20260823-V1',
      p50dRequestId: 'P50D-REQ-20260823-V3',
      reviewResult: 'data-pass-governance-remediation-required',
      ownerBusinessIntentRecorded: true,
      exactOwnerRatificationPending: true,
      p50dAuthorized: false,
      p50cTechnicalBuildOccurred: true,
      p50cCandidateAccepted: false,
      p50cCandidateId: 'P50C-CANDIDATE-20260823-V1',
      p50dManifestSha256:
        '1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429',
      selectedRecordsSha256:
        'f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df',
      candidateSha256:
        'd7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611',
      diffSha256:
        '72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18',
      candidateManifestSha256:
        'd88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5',
      selectedIdentityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
      selectedLegacyItemCode: 'ITEM-0429',
      selectedTargetItemCode: 'COR-PB0-002',
      baselinePrice: [0, 1763, 1763],
      candidatePrice: [0, 1764, 1764],
      unchangedBaselineRowCount: 709,
      currentPublishedVersion: '2568.0.0',
      currentPublishedCatalogChanged: false,
      provisionalTargetVersion: '2568.1.0',
      targetRegistryCheckPending: true,
      nextOwnerDecision: 'ratify-or-hold-exact-p50d-v3',
    })
    for (const field of [
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'candidateApplicationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(marker[field]).toBe(false)
    }

    expect(remediation).toContain(
      'EXACT P-50D V3 OWNER CONFIRMATION (RATIFICATION) RECORDED',
    )
    expect(remediation).toContain(
      'P-50C ACCEPTED AS LOCAL REVIEW EVIDENCE ONLY',
    )
    const validationMatch = remediation.match(
      /<!-- P50C_REVIEW_REMEDIATION_VALIDATION_RESULT_V1 (\{[^\n]+\}) -->/,
    )
    expect(validationMatch).not.toBeNull()
    const validation = JSON.parse(validationMatch![1])
    expect(validation).toMatchObject({
      schema: 'conduit-boq/p50c-review-remediation-validation-result/v1',
      requestId: 'P50D-V3-RATIFY-REQ-20260823-V1',
      remediationComplete: true,
      typescriptPassed: true,
      eslintPassed: true,
      candidateCheckPassed: true,
      focusedTestFileCount: 3,
      focusedTestCount: 30,
      fullTestFileCount: 40,
      fullTestCount: 310,
      diffCheckPassed: true,
      focusedTestFileSha256:
        '351ac25144b5bcf267764c16d3e448dacc856c632319963a7325a95a7e109e1f',
      exactOwnerRatificationPending: true,
      p50dAuthorized: false,
      p50cCandidateAccepted: false,
    })
    for (const field of [
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'automaticNextStep',
    ]) {
      expect(validation[field]).toBe(false)
    }

    const receiptMatches = [
      ...remediation.matchAll(
        /<!-- P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1 (\{[^\n]+\}) -->/g,
      ),
    ]
    expect(receiptMatches).toHaveLength(1)
    const receiptMatch = receiptMatches[0]

    const receipt = JSON.parse(receiptMatch[1])
    expect(receipt).toMatchObject({
      schema: 'conduit-boq/p50d-v3-exact-owner-ratification-receipt/v1',
      recordedAt: '2026-08-24T00:44:15+07:00',
      decision: 'ratified',
      resolvesRequestId: confirmationTerm.requestId,
      p50dRequestId: confirmationTerm.p50dRequestId,
      confirmationReceived: true,
      exactOwnerConfirmationPending: false,
      exactOwnerRatificationPending: false,
      p50dDecisionApproved: true,
      p50dV3Confirmed: true,
      p50dV3Ratified: true,
      p50dAuthorized: true,
      p50dAuthorityScope: 'decision-record-only',
      p50dFurtherActionAuthorized: false,
      selectedIdentityId: confirmationTerm.selectedIdentityId,
      selectedLegacyItemCode: confirmationTerm.selectedLegacyItemCode,
      selectedTargetItemCode: confirmationTerm.selectedTargetItemCode,
      baselinePrice: confirmationTerm.baselinePrice,
      candidatePrice: confirmationTerm.candidatePrice,
      p50dManifestSha256: confirmationTerm.p50dManifestSha256,
      selectedRecordsSha256: confirmationTerm.selectedRecordsSha256,
      confirmedBindings: confirmationTerm.confirmsBindings,
      p50cCandidateId: confirmationTerm.p50cCandidateId,
      p50cTechnicalBuildOccurred: true,
      p50cDataReviewPassed: true,
      p50cCandidateAccepted: true,
      acceptsCandidateAs: 'local-review-evidence-only',
      p50cFurtherExecutionAuthorized: false,
      candidateSha256: confirmationTerm.candidateSha256,
      diffSha256: confirmationTerm.diffSha256,
      candidateManifestSha256: confirmationTerm.candidateManifestSha256,
      unchangedBaselineRowCount: confirmationTerm.unchangedBaselineRowCount,
      unselectedExternalCandidateCount:
        confirmationTerm.unselectedExternalCandidateCount,
      retainBaselineEvidenceCount:
        confirmationTerm.retainBaselineEvidenceCount,
      authorityExclusionCount: confirmationTerm.authorityExclusionCount,
      explicitlyUnselectedAdjacentItems:
        confirmationTerm.explicitlyUnselectedAdjacentItems,
      rowClassification: confirmationTerm.rowClassification,
      overallReleaseClassification:
        confirmationTerm.overallReleaseClassification,
      currentPublishedVersion: confirmationTerm.currentPublishedVersion,
      currentPublishedCatalogChanged: false,
      provisionalTargetVersion: confirmationTerm.provisionalTargetVersion,
      targetRegistryCheckPending: true,
      historicalZeroPriceGateSupersededForSelectedLocalCandidateUuidOnly: true,
      historicalBoqRepriceAuthorized: false,
      changesPriorBusinessIntent: false,
      nextSafeStep: 'none-stop-after-recording-ratification',
      smallRepositoryGateRequired: false,
      separateGitCiAuthorizationRequired: true,
      gitCiAuthorizationGranted: false,
      stopBoundaryReached: true,
    })
    for (const field of [
      'p50dFurtherActionAuthorized',
      'p50cFurtherExecutionAuthorized',
      'gitCiAuthorizationGranted',
      'candidateApplicationAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'sourceMutationAuthorized',
      'catalogMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'deployAuthorized',
      'publicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(receipt[field], field).toBe(false)
    }

    expect(remediation).not.toContain(
      'P50D_V3_POST_RATIFICATION_SMALL_REPOSITORY_GATE_V1',
    )
    expect(remediation.trimEnd().endsWith(receiptMatch[0])).toBe(true)

    for (const hash of [
      marker.p50dManifestSha256,
      marker.selectedRecordsSha256,
      marker.candidateSha256,
      marker.diffSha256,
      marker.candidateManifestSha256,
    ]) {
      expect(remediation).toContain(hash)
    }
    expect(remediation).toContain(
      'candidate.json` is not a direct application/import payload',
    )
    expect(remediation).toContain(
      'RATIFY P-50D V3 — P50D-REQ-20260823-V3',
    )

    const correctedAuthorityPaths = [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
      'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
      'docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md',
      'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      'docs/plans/master-catalog/52-phase4-p50d-one-row-selected-delta-approval-proposal.md',
      'docs/plans/master-catalog/53-phase4-p50c-one-row-offline-candidate-result-record.md',
      remediationPath,
    ]
    expect(correctedAuthorityPaths).toHaveLength(17)
    const historicalV1ProposalPath =
      'docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md'
    for (const path of correctedAuthorityPaths) {
      const authority = read(path)
      const normalizedAuthority = authority.replace(/\s+/g, ' ')
      expect(authority).toContain('exact Owner confirmation (ratification)')
      expect(normalizedAuthority).toMatch(
        /(?:exact(?:ly)? )?(?:P-50D V3 )?(?:Owner(?:'s)? )?(?:confirmation \(ratification\)|ratification|confirmed\/ratified)[^.]{0,160}(?:received|recorded|complete)|exactly confirmed\/ratified/i,
      )
      expect(normalizedAuthority).toMatch(
        /P-?50C(?:-CANDIDATE-[^ ]+)?[^.]{0,240}(?:is )?accepted (?:only )?as local review evidence(?: only)?/i,
      )
      if (path === historicalV1ProposalPath) {
        expect(normalizedAuthority).toContain(
          'That receipt grants no candidate application, Git/CI, database/Production/network, P-13 through P-15, deploy, or publication.',
        )
      } else {
        expect(normalizedAuthority).toContain('decision-record-only')
        expect(normalizedAuthority).toMatch(
          /(?:P-50D V3 ratification|Owner) stop boundary[^.]{0,80}reached/i,
        )
        expect(normalizedAuthority).toMatch(
          /no small repository\s*>?\s*gate(?:,| and no)\s*>?\s*Git\/CI (?:authorization )?request[^.]{0,240}(?:is|are) authorized/i,
        )
      }
      expect(normalizedAuthority).toMatch(
        /nothing continues automatically|no automatic next (?:step|action)|"automaticNextStep":false/i,
      )
      if (path !== remediationPath) {
        expect(authority).toContain(
          './54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md',
        )
      }
    }

    for (const [path, markerName, approvalField] of [
      [
        'docs/plans/master-catalog/12-phase4-production-runbook.md',
        'P50C_RUNBOOK_REVIEW_CORRECTION_V1',
        'p50dApproved',
      ],
      [
        'docs/plans/master-catalog/19-phase4-decision-register.md',
        'P50D_V3_P50C_DECISION_REVIEW_CORRECTION_V1',
        'p50dAuthorized',
      ],
      [
        'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
        'P50C_EXECUTION_PACK_REVIEW_CORRECTION_V1',
        'p50dApproved',
      ],
    ] as const) {
      const authority = read(path)
      const correctionMatch = authority.match(
        new RegExp(`<!-- ${markerName} (\\{[^\\n]+\\}) -->`),
      )
      expect(correctionMatch).not.toBeNull()
      const correction = JSON.parse(correctionMatch![1])
      expect(correction.exactOwnerRatificationPending).toBe(true)
      expect(correction[approvalField]).toBe(false)
      expect(correction.p50cTechnicalBuildOccurred).toBe(true)
      expect(correction.p50cCandidateAccepted).toBe(false)
      expect(correction.nextOwnerDecision).toBe('ratify-or-hold-exact-p50d-v3')
      expect(correction.localCommitAuthorized).toBe(false)
      expect(correction.p13Authorized).toBe(false)
      expect(correction.p15Authorized).toBe(false)
    }

    for (const [
      path,
      markerName,
      schema,
      supersedesCurrentAuthorityOf,
      approvalField,
      receiptMarkerName,
    ] of [
      [
        'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
        'P50C_RECONCILIATION_REVIEW_CORRECTION_V1',
        'conduit-boq/p50c-reconciliation-review-correction/v1',
        'section-5.4-same-day-approval-interpretation',
        'p50dApproved',
        'P50D_V3_RECONCILIATION_RATIFICATION_RECEIPT_V1',
      ],
      [
        'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
        'P50C_ADMIN_PROCEDURE_REVIEW_CORRECTION_V1',
        'conduit-boq/p50c-admin-procedure-review-correction/v1',
        'P50C_ADMIN_PROCEDURE_CURRENT_OVERLAY_V1',
        'p50dApproved',
        'P50D_V3_ADMIN_PROCEDURE_RATIFICATION_RECEIPT_V1',
      ],
      [
        'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
        'P50C_TRACKER_CURRENT_AUTHORITY_CORRECTION_V1',
        'conduit-boq/p50c-tracker-current-authority-correction/v1',
        'P50D_V3_P50C_ONE_ROW_TRACKER_RESULT_V1',
        'p50dAuthorized',
        'P50D_V3_EXACT_OWNER_RATIFICATION_TRACKER_RECEIPT_V1',
      ],
      [
        'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
        'P50_P50D_P50C_REVIEW_CORRECTION_V1',
        'conduit-boq/p50-p50d-p50c-review-correction/v1',
        'P50_P50D_P50C_RESULT_OVERLAY_V1',
        'p50dAuthorized',
        'P50_P50D_P50C_RATIFICATION_RECEIPT_V1',
      ],
      [
        'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
        'P50R_DOWNSTREAM_REVIEW_CORRECTION_V1',
        'conduit-boq/p50r-downstream-review-correction/v1',
        'P50R_DOWNSTREAM_DISPOSITION_OVERLAY_V1',
        'p50dAuthorized',
        'P50R_DOWNSTREAM_RATIFICATION_RECEIPT_V1',
      ],
      [
        'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
        'P50D_V2_SUCCESSOR_REVIEW_CORRECTION_V1',
        'conduit-boq/p50d-v2-successor-review-correction/v1',
        'P50D_V2_SUCCESSOR_COMPLETION_OVERLAY_V1',
        'p50dAuthorized',
        'P50D_V2_SUCCESSOR_RATIFICATION_RECEIPT_V1',
      ],
    ] as const) {
      const authority = read(path)
      const correctionMatch = authority.match(
        new RegExp(`<!-- ${markerName} (\\{[^\\n]+\\}) -->`),
      )
      expect(correctionMatch, markerName).not.toBeNull()
      expect(
        authority.indexOf(correctionMatch![0]),
        `${markerName} remains before the current ratification receipt`,
      ).toBeLessThan(
        authority.indexOf(`<!-- ${receiptMarkerName} `),
      )

      const correction = JSON.parse(correctionMatch![1])
      expect(correction).toMatchObject({
        schema,
        recordedAt: '2026-08-24',
        supersedesCurrentAuthorityOf,
        p50dRequestId: 'P50D-REQ-20260823-V3',
        exactOwnerConfirmationPending: true,
        exactOwnerRatificationPending: true,
        p50cTechnicalBuildOccurred: true,
        p50cDataReviewPassed: true,
        p50cCandidateAccepted: false,
        p50cCandidateRole: 'unaccepted-local-review-evidence',
        p50cCandidateId: 'P50C-CANDIDATE-20260823-V1',
        candidateSha256: confirmationTerm.candidateSha256,
        diffSha256: confirmationTerm.diffSha256,
        candidateManifestSha256: confirmationTerm.candidateManifestSha256,
        nextOwnerDecision: 'confirm-ratify-or-hold-exact-p50d-v3',
      })
      expect(correction[approvalField], `${markerName}.${approvalField}`).toBe(
        false,
      )
      for (const field of [
        'candidateApplicationAuthorized',
        'localCommitAuthorized',
        'externalGitPublicationAuthorized',
        'ciPreviewAuthorized',
        'databaseAccessAuthorized',
        'productionReadAuthorized',
        'productionWriteAuthorized',
        'networkAuthorized',
        'p13Authorized',
        'p14Authorized',
        'p14cAuthorized',
        'p15Authorized',
        'automaticNextStep',
      ]) {
        expect(correction[field], `${markerName}.${field}`).toBe(false)
      }
    }

    const p50gProposalPath =
      'docs/plans/master-catalog/55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md'
    const p50gProposal = read(p50gProposalPath)
    const p50gPreparationMatch = p50gProposal.match(
      /<!-- P50G_PROPOSAL_PREPARATION_RECORD_V1 (\{[^\n]+\}) -->/,
    )
    expect(
      p50gProposal.match(/<!-- P50G_PROPOSAL_PREPARATION_RECORD_V1 /g),
    ).toHaveLength(1)
    expect(p50gPreparationMatch).not.toBeNull()
    const p50gPreparation = JSON.parse(p50gPreparationMatch![1])
    expect(p50gPreparation).toMatchObject({
      schema: 'conduit-boq/p50g-proposal-preparation-record/v1',
      recordedAt: '2026-08-24',
      requestId: 'P50G-REQ-20260824-V1',
      ownerContinuationInstructionReceived: true,
      instructionText: 'ทำต่อครับ',
      interpretation: 'prepare-p50g-proposal-only',
      proposalPreparationAuthorized: true,
      p50gGateAuthorized: false,
    })

    const p50gProposalMatch = p50gProposal.match(
      /<!-- P50G_SMALL_REPOSITORY_GATE_AUTHORIZATION_PROPOSAL_V1 (\{[^\n]+\}) -->/,
    )
    expect(
      p50gProposal.match(
        /<!-- P50G_SMALL_REPOSITORY_GATE_AUTHORIZATION_PROPOSAL_V1 /g,
      ),
    ).toHaveLength(1)
    expect(p50gProposalMatch).not.toBeNull()
    const p50g = JSON.parse(p50gProposalMatch![1])
    expect(p50g).toMatchObject({
      schema:
        'conduit-boq/p50g-small-repository-gate-authorization-proposal/v1',
      recordedAt: '2026-08-24',
      requestId: 'P50G-REQ-20260824-V1',
      status: 'ready-for-owner-review',
      ownerApprovalPending: true,
      p50gGateAuthorized: false,
      canonicalReceiptMarker: 'P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1',
      p50dRequestId: confirmationTerm.p50dRequestId,
      p50cCandidateId: confirmationTerm.p50cCandidateId,
      p50dManifestSha256: confirmationTerm.p50dManifestSha256,
      selectedRecordsSha256: confirmationTerm.selectedRecordsSha256,
      candidateSha256: confirmationTerm.candidateSha256,
      diffSha256: confirmationTerm.diffSha256,
      candidateManifestSha256: confirmationTerm.candidateManifestSha256,
      branch: 'codex/p12-production-authority-r2',
      localHead: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
      upstreamHead: '6f0953b19c25f6f96b1d2d11ee99ff43c33c5443',
      branchAheadBy: 1,
      shellFailFastRequired: true,
      proposalSha256BindingMode: 'external-owner-approval',
      ownerApprovalForm: 'short-hash-bound-v1',
      shortApprovalTemplate:
        'APPROVE P-50G — P50G-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF',
      approvalRequiresExactRequestId: true,
      approvalRequiresFullProposalSha256: true,
      shortApprovalExpandsToSections2Through6: true,
      longApprovalRequired: false,
      gitStatePreflightRequired: true,
      indexMustBeEmpty: true,
      preGateTrackedPathAllowlistRequired: true,
      preGateRelevantUntrackedPathAllowlistRequired: true,
      trackedPathListSha256:
        '38342e79f7a1138b689ac81141cc3a53fe848618f2819ad2b1af21890441f30a',
      preGateSafeUntrackedPathCount: 24,
      safeUntrackedPathListSha256:
        'e9ab9f0eb33e2aa65e27c906771e0e618cbd69cc033264822c9327fd9357cf5a',
      fullPayloadByteHashInventoryDeferredToP50h: true,
      unexpectedPathInventoryDeferredToP50h: false,
      prospectiveSafePathCount: 48,
      trackedModifiedPathCount: 25,
      untrackedSafePathCount: 23,
      focusedTestFileCount: 3,
      expectedFocusedTestCount: 30,
      offlineOnly: true,
      readOnlyGate: true,
      dependencyInstallAuthorized: false,
      protectedPathAccessAuthorized: false,
      realP50rReplayAuthorized: false,
      broadTypeScriptScanIncluded: false,
      broadTypeScriptScanAuthorized: false,
      testMutationAfterGateAuthorized: false,
      resultRecordPath:
        'docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md',
      onPassPreparationOnly: [
        'docs/plans/master-catalog/57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md',
        'docs/plans/master-catalog/evidence/p50h-v1/git-payload-manifest.json',
      ],
      windowBegins: 'exact-owner-approval-message-timestamp',
      windowEnds: '2026-08-25T23:00:00+07:00',
      p51WaiverExtended: false,
      nextOwnerDecision: 'approve-or-hold-p50g',
    })
    for (const field of [
      'p50gGateAuthorized',
      'dependencyInstallAuthorized',
      'protectedPathAccessAuthorized',
      'realP50rReplayAuthorized',
      'broadTypeScriptScanIncluded',
      'broadTypeScriptScanAuthorized',
      'longApprovalRequired',
      'testMutationAfterGateAuthorized',
      'unexpectedPathInventoryDeferredToP50h',
      'p51WaiverExtended',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'gitStageAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'candidateApplicationAuthorized',
      'applicationMutationAuthorized',
      'catalogMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'deployAuthorized',
      'publicationAuthorized',
      'p50hExecutionAuthorized',
      'automaticNextStep',
    ]) {
      expect(p50g[field], `P50G.${field}`).toBe(false)
    }
    expect(p50gProposal.trimEnd().endsWith(p50gProposalMatch![0])).toBe(true)
    expect(p50gProposal).toContain(
      'APPROVE P-50G — P50G-REQ-20260824-V1',
    )
    expect(p50gProposal).toContain(
      'APPROVE P-50G — P50G-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF',
    )
    expect(p50gProposal).toContain('No long approval paragraph is required')
    expect(p50gProposal).toContain('approve Sections 2-6 exactly')
    expect(p50gProposal).not.toContain(
      'P50G-REQ-20260824-V1; approve reviewed Proposal #55',
    )
    expect(p50gProposal).toContain('without executing P-50H')
    expect(p50gProposal).toMatch(/including no[^\n]{0,80}\binstall\b/)
    expect(p50gProposal).toContain('Git stage/commit/push')
    expect(p50gProposal).toContain('set -euo pipefail')
    expect(p50gProposal).toContain('test "$(git branch --show-current)"')
    expect(p50gProposal).toContain(
      'test -z "$(git diff --cached --name-only)"',
    )
    expect(p50gProposal).toContain('git diff --cached --check')
    expect(p50gProposal).toMatch(/compare\s+the staged paths to its allowlist/)
    expect(p50gProposal).toContain('exact-manifest staging')
    expect(p50gProposal).toContain(
      'PROPOSAL_SHA256_FROM_EXACT_OWNER_APPROVAL',
    )
    expect(p50gProposal).toContain(
      'PROPOSAL_SHA256_FROM_REVIEW_HANDOFF',
    )
    expect(p50gProposal).not.toContain('./node_modules/.bin/tsc')
    expect(p50g.prospectivePackageContentManifestSha256).toMatch(
      /^[a-f0-9]{64}$/,
    )
    expect(p50gProposal).not.toContain(
      '- update `tests/master-catalog-authority-consistency.test.ts`.',
    )
    expect(p50gProposal).not.toContain('documentation/test outputs')

    const p50gResultPath =
      'docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md'
    const p50gResult = read(p50gResultPath)
    const p50gResultMatch = p50gResult.match(
      /<!-- P50G_SMALL_REPOSITORY_GATE_RESULT_V1 (\{[^\n]+\}) -->/,
    )
    expect(
      p50gResult.match(/<!-- P50G_SMALL_REPOSITORY_GATE_RESULT_V1 /g),
    ).toHaveLength(1)
    expect(p50gResultMatch).not.toBeNull()
    const p50gResultRecord = JSON.parse(p50gResultMatch![1])
    expect(p50gResultRecord).toMatchObject({
      schema: 'conduit-boq/p50g-small-repository-gate-result/v1',
      requestId: 'P50G-REQ-20260824-V1',
      approvedProposalSha256:
        '5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc',
      approvalValid: true,
      authorizationConsumed: true,
      authorizationReplayAllowed: false,
      gateExecuted: true,
      gatePassed: true,
      focusedTestFileCount: 3,
      focusedTestCount: 30,
      postResultAuthorityTestAlignmentRequired: true,
      commitReady: false,
      p50hProposalPreparationAuthorized: true,
      p50hProposalPrepared: true,
      p50hExecutionAuthorized: false,
      nextOwnerDecision: 'review-p50h-proposal',
    })
    for (const field of [
      'authorizationReplayAllowed',
      'protectedPathAccessed',
      'candidateApplied',
      'commitReady',
      'p50hExecutionAuthorized',
      'gitStageAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'ciPreviewAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'networkAuthorized',
      'applicationMutationAuthorized',
      'catalogMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'deployAuthorized',
      'publicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(p50gResultRecord[field], `P50G result.${field}`).toBe(false)
    }
    expect(p50gResult.trimEnd().endsWith(p50gResultMatch![0])).toBe(true)
    expect(p50gResult).toContain('not commit-ready')

    const p50gProspectivePaths = [
      'docs/02_architecture/ADR/ADR-001-supabase-rls-authorization.md',
      'docs/03_domain/ACCESS_MODEL.md',
      'docs/04_data/DATABASE_SCHEMA.md',
      'docs/04_data/DATA_INTEGRITY.md',
      'docs/04_data/MIGRATIONS.md',
      'docs/04_data/SECURITY_MODEL.md',
      'docs/06_engineering/PERMISSION_PATTERNS.md',
      'docs/08_ai/LESSONS_LEARNED.md',
      'docs/CODEBASE_DATABASE_MAP.md',
      'docs/SECURITY.md',
      'docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md',
      'docs/plans/master-catalog/05-verification-report.md',
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
      'docs/plans/master-catalog/18-phase4-threat-model.md',
      'docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md',
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/09-phase4-change-request.md',
      'docs/plans/master-catalog/11-phase4-reconciliation-report.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      'docs/plans/master-catalog/47-phase4-p49-forward-only-db-application-correction-proposal.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
      'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
      'docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md',
      'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      'docs/plans/master-catalog/52-phase4-p50d-one-row-selected-delta-approval-proposal.md',
      'docs/plans/master-catalog/53-phase4-p50c-one-row-offline-candidate-result-record.md',
      'docs/plans/master-catalog/54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md',
      'docs/plans/master-catalog/evidence/p50r-solo/SHA256SUMS',
      'docs/plans/master-catalog/evidence/p50r-solo/exceptions.json',
      'docs/plans/master-catalog/evidence/p50r-solo/proposed-delta-manifest.json',
      'docs/plans/master-catalog/evidence/p50r-solo/reconciliation.csv',
      'docs/plans/master-catalog/evidence/p50r-solo/summary.json',
      'docs/plans/master-catalog/evidence/p50d-v3/p50d-selected-delta-manifest.json',
      'docs/plans/master-catalog/evidence/p50c-v1/candidate.json',
      'docs/plans/master-catalog/evidence/p50c-v1/diff.json',
      'docs/plans/master-catalog/evidence/p50c-v1/manifest.json',
      'scripts/build-master-catalog-p50c.mjs',
      'scripts/reconcile-master-catalog-p50r.mjs',
      'scripts/reconcile-master-catalog-p50r-pdf.py',
      'tests/master-catalog-authority-consistency.test.ts',
      'tests/master-catalog-p50r-reconciliation.test.ts',
      'tests/master-catalog-p50c-candidate.test.ts',
    ]
    expect(p50gProspectivePaths).toHaveLength(48)
    expect(new Set(p50gProspectivePaths).size).toBe(48)
    for (const path of p50gProspectivePaths) {
      expect(existsSync(resolve(root, path)), path).toBe(true)
      expect(p50gProposal, path).toContain(`\`${path}\``)
    }

    const trackerAfterP50gPreparation = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    const decisionRegisterAfterP50gPreparation = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    for (const authority of [
      read('docs/plans/master-catalog/00-phase4-review-guide.md'),
      trackerAfterP50gPreparation,
      decisionRegisterAfterP50gPreparation,
    ]) {
      expect(authority).toContain('P50G-REQ-20260824-V1')
      expect(authority).toContain(
        './55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md',
      )
      expect(authority).toContain(
        './56-phase4-p50g-small-repository-gate-result.md',
      )
      expect(authority).toMatch(/P-50G[\s\S]{0,240}(?:PASS|passed)/i)
      expect(authority).toMatch(
        /P-50G[\s\S]{0,300}(?:consumed once|authorization consumed)/i,
      )
    }
    expect(trackerAfterP50gPreparation).toMatch(
      /P-50G[^\n]{0,240}PASS\/authorization consumed/i,
    )
    expect(trackerAfterP50gPreparation).not.toMatch(
      /documentation\/test(?: result)? outputs/i,
    )
    expect(decisionRegisterAfterP50gPreparation).toContain(
      '**PASS / AUTHORIZATION CONSUMED ONCE / NO REPLAY.**',
    )
  })

  it('keeps PRE-P-12 backup, custody, restore, and verifier gates synchronized', () => {
    const backupAuthorityPaths = [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md',
    ]

    for (const path of backupAuthorityPaths) {
      const authority = read(path)
      expect(authority).toMatch(/post-migration/i)
      expect(authority).toContain('application-only')
      expect(authority).toContain('P-13')
      expect(authority).toMatch(/post-publication/i)
      expect(authority).toMatch(/168 (?:hours|ชั่วโมง)/)
      expect(authority).toContain('24')
    }
    for (const path of backupAuthorityPaths.slice(0, -1)) {
      const authority = read(path)
      expect(authority).toContain('`017a`')
      expect(authority).toContain('`018`-`026`')
    }

    const exactCustodyPaths = backupAuthorityPaths.slice(1)
    for (const path of exactCustodyPaths) {
      const authority = read(path)
      expect(authority).toMatch(
        /start of the post-publication\s+checkpoint after separately\s+approved P-15\s+verification[\s\S]{0,160}168 hours/i,
      )
      expect(authority).toMatch(
        /planned\s+pause\s+(?:will\s+exceed|exceeding)\s+24 consecutive\s+hours/i,
      )
      expect(authority).toMatch(
        /unplanned\s+pause\s+reaches\s+24\s+hours/i,
      )
    }

    for (const path of [
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md',
    ]) {
      expect(read(path)).toMatch(
        /readiness[\s\S]{0,160}not the\s+final\s+rollback source/i,
      )
    }

    const verificationReport = read(
      'docs/plans/master-catalog/13-phase4-verification-report.md',
    )
    expect(verificationReport).not.toContain('Restore to clean Local')
    expect(verificationReport).toContain(
      'Ephemeral network-isolated non-Production PostgreSQL 17; never Local Supabase',
    )
    expect(verificationReport).toContain('Exact schemas `public, private`')
    expect(verificationReport).toContain('Exclude all Auth and Storage data')
    expect(verificationReport).toContain('UUID-only ephemeral stubs')
    expect(verificationReport).toMatch(
      /At that\s+checkpoint P-37 remained HOLD/,
    )
    expect(verificationReport).not.toMatch(
      /P-37 remains\s+HOLD for bounded finding disposition/,
    )

    const runbook = read(
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
    )
    expect(runbook).toContain(
      'For P-12, a named human distinct from the Executor',
    )

    const ownerChecklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )
    expect(ownerChecklist).toContain(
      'the verifier is a named human distinct from the executor',
    )

    const readinessPackage = read(
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    )
    expect(readinessPackage).toContain(
      'distinct named-human independent verifier',
    )
    expect(readinessPackage).toContain('**Status:** HOLD')
    expect(ownerChecklist).toContain('**Status:** P-12 COMPLETE')

    const decisions = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    expect(decisions).not.toContain(
      'The current application-only backup remains a migration rollback source',
    )

    const findingPath =
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md'
    const findingLink =
      './43-phase4-p12-private-function-default-privilege-finding.md'
    const finding = read(findingPath)
    expect(finding).toMatch(
      /\*\*Status:\*\* OPTION B\/`017a` REMAINS REQUIRED; P-45 COMPLETED AT `d92d8ce`;\s+P-46 CONSUMED AND FAILED CLOSED; P-47 REPOSITORY-ONLY `026` CORRECTION\s+AUTHORIZED; P-12 HOLD; no Production approval/,
    )
    expect(finding).toContain(
      'The first isolated PostgreSQL 17 CLI rehearsal applied only migration `017`',
    )
    expect(finding).toContain(
      'no `pg_default_acl` row for `postgres` functions in `private`',
    )
    expect(finding).toContain('did not start `018`')
    expect(finding).toContain(
      'No Local Supabase reset/write and no Production access/write occurred.',
    )
    expect(finding).toContain(
      '### Option B - Forward migration with a global function default revoke',
    )
    expect(finding).toContain(
      'The candidate must execute after `017` and before `018`; do not',
    )
    expect(finding).toContain('edit either reviewed migration.')
    expect(finding).toMatch(
      /twelve private\s+`SECURITY DEFINER` helpers without an explicit per-function revoke/,
    )
    expect(finding).toContain(
      'Migration `018` also grants `authenticated` usage on schema `private`.',
    )
    expect(finding).toMatch(
      /An after-`025`-only correction \*\*of this\s+default-privilege defect\*\* is unsafe/,
    )
    expect(finding).toContain(
      'The Owner authorized repository-only design and implementation of Option B',
    )
    expect(finding).toContain(
      '`017a_master_catalog_phase4_global_function_default_privileges.sql`',
    )
    expect(finding).toContain('`20260728001730`')
    expect(finding).toContain(
      '`12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`',
    )

    for (const path of [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    ]) {
      const authority = read(path)
      expect(authority).toContain(findingLink)
      expect(authority).toContain('P-12')
      expect(authority).toMatch(/HOLD/)
      expect(authority).toMatch(
        /after\s+`017`[\s\S]{0,40}before\s+`018`|หลัง `017` และก่อน\s+`018`/,
      )
      expect(authority).toMatch(
        /after-`025`|after `025`|หลัง `025`|follows immutable `025`/,
      )
      expect(authority).toContain('SECURITY DEFINER')
      expect(authority).toContain('PUBLIC EXECUTE')
      expect(authority).toContain(
        '017a_master_catalog_phase4_global_function_default_privileges.sql',
      )
      expect(authority).toContain('20260728001730')
      expect(authority).toContain(
        '12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7',
      )
      expect(authority).toMatch(
        /not Production-approved|no Production approval|not P-12|ไม่ใช่ P-12|repository(?:-| )candidate/i,
      )
    }

    for (const path of [
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    ]) {
      const authority = read(path)
      expect(authority).toContain('`026` solely')
      expect(authority).not.toMatch(
        /security migration whose working name is[\s\S]{0,80}`026`/,
      )
    }
  })

  it('keeps the new P-12 operational catalog fingerprint fail closed', () => {
    const fingerprintAuthorityPaths = [
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    ]
    const historicalAuthorityHash =
      'sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5'

    for (const path of fingerprintAuthorityPaths) {
      const authority = read(path)
      expect(authority).toContain('`catalogAuthorityFingerprintSha256`')
      expect(authority).toMatch(/new\s+operational\s+fingerprint/i)
      expect(authority).toMatch(/UNCOMPUTED\s+—\s+HOLD/)
      expect(authority).toContain(historicalAuthorityHash)
      expect(authority).toMatch(
        /historical canonical SQL was not committed/i,
      )
      expect(authority).toMatch(
        /separately\s+authorized read-only query/i,
      )
      expect(authority).toMatch(
        /encrypted\s+Production\s+readiness\s+snapshot's\s+isolated\s+restore/i,
      )
      expect(authority).toMatch(
        /fresh\s+in-window\s+Production\/restore\s+evidence/i,
      )
      expect(authority).toMatch(/external\s+Production approval/i)
      expect(authority).toContain('`productionEligible=true`')
      expect(authority).toContain('P-12')
    }

    const currentTracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    expect(currentTracker).toContain(
      '| Operational catalog-authority fingerprint | Complete and immutable for the P-12 execution:',
    )
    expect(currentTracker).toContain(
      '`0fbaf215018200bacbc728af330e990b98c7e6128165982289ed429c93ad13f2`',
    )
    expect(currentTracker).toContain('| P-12 exact CLI evidence chain | **COMPLETE.**')

    const readinessPackage = read(
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    )
    const ownerChecklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )

    expect(ownerChecklist).toContain('`catalogAuthorityFingerprintSha256`')
    expect(ownerChecklist).toMatch(/new\s+operational\s+fingerprint/i)
    expect(ownerChecklist).toContain(historicalAuthorityHash)
    expect(ownerChecklist).toMatch(
      /historical canonical SQL was not committed/i,
    )
    expect(ownerChecklist).toMatch(
      /separately\s+authorized\s+read-only (?:query|derivation)/i,
    )
    expect(ownerChecklist).toMatch(
      /encrypted\s+Production\s+readiness\s+snapshot's\s+isolated\s+restore/i,
    )
    expect(ownerChecklist).toMatch(
      /fresh encrypted Production\s+application backup passed isolated PostgreSQL 17 restore\/checksum/i,
    )
    expect(ownerChecklist).toMatch(/external\s+Production approval/i)
    expect(ownerChecklist).toContain('`productionEligible=true`')
    expect(ownerChecklist).toContain('P-12')

    expect(readinessPackage).toContain('UNCOMPUTED — HOLD')
    expect(readinessPackage).toContain('UNRECORDED — HOLD')
    expect(readinessPackage).toContain('UNBOUND — HOLD')
    expect(ownerChecklist).toContain(
      '`0fbaf215018200bacbc728af330e990b98c7e6128165982289ed429c93ad13f2`',
    )
    expectP12ProductionAuthorityConsumed(ownerChecklist)

    expect(readinessPackage).toContain(
      'These placeholders are deliberately invalid approval values.',
    )
    expect(ownerChecklist).toContain(
      'P-12 must not be requested.',
    )
  })

  it('keeps schema-shape and advisor evidence independently hash-bound', () => {
    const readinessPackage = read(
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    )
    const ownerChecklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )
    const cliRunbook = read(
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
    )

    for (const authority of [
      readinessPackage,
      ownerChecklist,
      cliRunbook,
    ]) {
      expect(authority).toContain('schemaShapeContractSha256')
      expect(authority).toContain('advisor artifact')
      expect(authority).toContain('calibrate-schema')
      expect(authority).toMatch(/source\/tooling HEAD/)
      expect(authority).toMatch(/pass-1/i)
      expect(authority).toMatch(/pass-2/i)
      expect(authority).toMatch(/step `017` only/)
      expect(authority).toMatch(/fresh post-previous-step advisor artifact/i)
      expect(authority).toMatch(/SHA-256/)
      expect(authority).toMatch(/independent verifier/i)
      expect(authority).toMatch(/second\s+fresh\s+full\s+isolated rehearsal/i)
      expect(authority).toContain('P-12')
    }

    expect(ownerChecklist).toContain(
      'reviewed schema contract SHA-256 is\n`06f46916609afa80fde75cf8d0f4cbf0a63a1b65fc2f69abffda398c6dea3912`',
    )
    expect(ownerChecklist).toContain(
      'fresh Pass-2 final closeout manifest SHA-256 is\n`f4f0fdcdee44562afab3c7f6e96b7a8e0fbad9b1c37ea0fb28adee0898a8f603`',
    )
    expect(ownerChecklist).toMatch(/fresh Production advisor\s+returned no findings/)
    expectP12ProductionAuthorityConsumed(ownerChecklist)
    expect(cliRunbook).toContain(
      'conduit-boq/master-catalog-p12-schema-shape-contract/v3',
    )
    expect(cliRunbook).toContain(
      'conduit-boq/master-catalog-p12-production-approval/v3',
    )
    expect(cliRunbook).toContain('githubReviewCheckedAt')
    expect(cliRunbook).toContain('--schema-shape-contract')
    expect(cliRunbook).toContain('--advisor-artifact-sha256')
    expect(cliRunbook).toContain(
      '`pass2VerificationEvidenceManifestSha256`',
    )
    expect(cliRunbook).toMatch(
      /Execution starts with `017`, which must not receive\s+`--prior-step-signoff`\./,
    )
    expect(cliRunbook).toMatch(
      /Every subsequent migration—`017a` and `018` through\s+`026`—must add:/,
    )
    expect(cliRunbook).toMatch(
      /Migration\s+execution begins with `017`, which has no previous Phase 4 migration\./,
    )
    expect(cliRunbook).not.toContain('Steps `017a`-`026` must add:')
    expect(cliRunbook).toContain('21 minutes 15 seconds')
    expect(cliRunbook).toContain('12 minutes 30 seconds')
    expect(cliRunbook).toContain('8 minutes 45 seconds')
    expect(cliRunbook).toContain('8 minutes 50 seconds')
    expect(cliRunbook).toMatch(
      /Do\s+not regenerate it after the GO-marker commit\./,
    )
    for (const authority of [
      readinessPackage,
      ownerChecklist,
      cliRunbook,
    ]) {
      expect(authority).toMatch(
        /before any post-CLI\s+evidence-file write/i,
      )
      expect(authority).toContain('05-evidence-manifest.json')
      expect(authority).toMatch(/evidence-medium/)
      expect(authority).toMatch(/atomic rename/)
      expect(authority).toMatch(/uncertain/i)
    }
    expect(ownerChecklist).not.toContain('P12_RUNNER_AUTHORITY_V1')

    for (const path of [
      'docs/04_data/MIGRATIONS.md',
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
    ]) {
      const authority = read(path)
      expect(authority).toMatch(/source\/tooling HEAD/)
      expect(authority).toContain('calibrate-schema')
      expect(authority).toMatch(/second\s+fresh\s+full\s+isolated rehearsal/i)
      expect(authority).toMatch(/pass-2/i)
      expect(authority).toMatch(/GO\s+HEAD/)
      expect(authority).toMatch(/HOLD/)
    }

    const completedTracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    expect(completedTracker).toMatch(/source\/tooling HEAD/)
    expect(completedTracker).toContain('| P-12 exact CLI evidence chain | **COMPLETE.**')
    expect(completedTracker).toContain('P-13 NOT AUTHORIZED')
    expect(completedTracker).toContain(
      'P-49 IS NOT THE SOLE BLOCKER FOR THE EXACT FIRST CLOSEOUT',
    )
  })

  it('keeps the P-43 authority order, one-reset rule, and review trust boundary explicit', () => {
    const decisionRegister = read(
      'docs/plans/master-catalog/19-phase4-decision-register.md',
    )
    const tracker = read(
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
    )
    const readinessPackage = read(
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    )
    const ownerChecklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )
    const cliRunbook = read(
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
    )
    const threatModel = read(
      'docs/plans/master-catalog/18-phase4-threat-model.md',
    )
    const runner = read('scripts/run-master-catalog-p12-cli-step.mjs')

    const p43TrackerRow = tracker
      .split(/\r?\n/)
      .find((line) => line.includes('PRE-P-12/P-43'))
    expect(p43TrackerRow).toBeDefined()
    const p43Resolution = p43TrackerRow!.split('|')[4]
    expectInOrder(p43Resolution, [
      'review',
      'commit/push',
      'Remote status',
      'corrected Local bootstrap',
      'kit',
      'pass 1',
      'GitHub review',
      'pass 2',
      'P-12 GO',
      'Checklist-only GO commit',
    ])

    const requestGate = ownerChecklist.slice(
      ownerChecklist.indexOf(
        '- [x] Complete P-47 `026` independent architecture/security/source review',
      ),
      ownerChecklist.indexOf(
        '- [ ] Owner receives a separate exact P-12 go/no-go request.',
      ),
    ).replace(/\s+/g, ' ')
    expectInOrder(requestGate, [
      'review',
      'commit/push',
      'Remote status',
      'corrected Local',
      'Build and hash-bind',
      'pass 1',
      'GitHub contract review',
      'pass 2',
    ])
    expectInOrder(ownerChecklist, [
      '## 3. P-12 request gate',
      '## 4. Explicit exclusions',
      '## 5. Final P-12 Production GO overlay — 2026-08-09',
      '## 6. P-12 Production attempt hard-stop — 2026-08-09',
      'P12_RUNNER_AUTHORITY_CONSUMED_V1',
    ])
    expectP12ProductionAuthorityConsumed(ownerChecklist)

    for (const authority of [
      decisionRegister,
      tracker,
      readinessPackage,
      ownerChecklist,
      cliRunbook,
    ]) {
      expect(authority).toMatch(
        /one (?:new |fresh )?corrected Local|exactly one corrected|one-time corrected|fresh(?:ly)?[\s\S]{0,50}authorized[\s\S]{0,30}Local|fresh explicit reset approval/i,
      )
      expect(authority).toMatch(/separate Git authorization|separately authorized/i)
      expect(authority).toMatch(/Remote (?:CI\/)?status/i)
      expect(authority).toMatch(/honest-but-fallible/i)
      expect(authority).toMatch(/custom (?:signing\/)?PKI/i)
    }

    expect(decisionRegister).toContain('| P-43 |')
    expect(threatModel).toContain('| T-63 |')
    expect(threatModel).toMatch(/account compromise/i)
    expect(threatModel).toMatch(/signed attestations/i)
    expect(readinessPackage).toContain('P12_SCHEMA_REVIEW_V1')
    expect(ownerChecklist).toContain('githubReviewCheckedAt')
    expect(cliRunbook).toContain('githubReviewCheckedAt')
    expect(runner).toContain(
      'conduit-boq/master-catalog-p12-schema-shape-contract/v4',
    )
    expect(runner).toContain(
      'conduit-boq/master-catalog-p12-schema-shape-contract/v3',
    )
    expect(runner).toContain(
      'conduit-boq/master-catalog-p12-production-approval/v4',
    )
    expect(runner).not.toContain('api.github.com')
    expect(runner).not.toMatch(/\bgh\s+api\b/)
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

    const artifactGenerator = read('scripts/generate-master-catalog-artifact-proof.mjs')
    expect(artifactGenerator).toContain('MASTER_CATALOG_PROOF_VERSION_ID')
    expect(artifactGenerator).toContain("'explicit-version-id'")
    expect(artifactGenerator).toContain("'current-default-pointer'")
    expect(artifactGenerator).toContain('Explicit Local version is not active')
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

  it('keeps P-39 version planning, draft identity, and operator recovery aligned', () => {
    const adr = read(
      'docs/02_architecture/ADR/ADR-003-master-catalog-rollout-and-version-numbering.md',
    )
    const contract = read(
      'docs/plans/master-catalog/17-phase4-database-security-contract.md',
    )
    const procedure = read(
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
    )
    const architecture = read(
      'docs/plans/master-catalog/08-phase4-architecture-ci-plan.md',
    )
    const changeRequest = read(
      'docs/plans/master-catalog/09-phase4-change-request.md',
    )
    const executionPack = read(
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
    )
    const correction = read(
      'docs/plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md',
    )
    const p39 = read(
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
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
    for (const source of [adr, contract, procedure, p39]) {
      expect(source).toContain('draft reference')
      expect(source).toContain('target')
    }
    expect(adr).toContain('releases the unissued target')
    expect(adr).toContain('2568.1.0-D001')
    expect(contract).toContain('target-scoped transaction advisory lock')
    expect(contract).toContain('reuses an abandoned unissued target under a new draft reference')
    expect(contract).toContain('exact one-policy-per-table')
    expect(contract).toContain('no user-command RPC execute')
    expect(contract).toContain('Do not treat `service_role` as a')
    expect(contract).toContain('surrogate admin user')
    expect(contract).toContain('At most one mutable `draft` may exist globally')
    expect(contract).toContain('Permit either a current-base or stale draft to be')
    expect(contract).not.toContain(
      'At most one mutable `draft` may exist for the same `based_on_version_id`',
    )
    expect(procedure).toContain('The only allowed command is audited abandon')
    expect(architecture).toContain(
      'A partial unique constraint prevents more than one mutable draft globally',
    )
    expect(changeRequest).toContain(
      'One mutable draft globally plus audited current/stale abandon history',
    )
    expect(changeRequest).toContain('Historical P-37 disposition (2026-07-25;')
    expect(changeRequest).toContain(
      'Owner-accepted under the explicit guided-UAT variance',
    )
    expect(executionPack).toContain(
      'a second mutable draft from the same or a different base',
    )
    expect(p39).toContain('P39-S')
    expect(p39).toContain('P39R-S')
    expect(p39).toContain('P39R-L')
    expect(p39).toContain('P39R-C')
    expect(p39).toContain('P39R-U')
    expect(p39).toContain('### 6.4 P39R-C clean-chain closure')
    expect(p39).toContain(
      '10531610eac53a97c6ef8f9d06418766b58bee36',
    )
    expect(p39).toContain('prior published/active version')
    expect(p39).not.toContain('Restoring an archived version')
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
    expect(audit).toContain('| C-18 |')
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
    expect(mutationPanel).toContain('พิมพ์ {draftVersion.targetVersionString} เพื่อยืนยัน')
    expect(itemEditor).toContain("action !== 'recode' && action !== 'retire'")
    expect(itemEditor).toContain('ประวัติและ BOQ เดิมไม่ถูกเขียนทับ')
  })

  it('records P-50H fail-closed and keeps P-50I non-operational', () => {
    const resultPath =
      'docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md'
    const proposalPath =
      'docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md'
    const result = read(resultPath)
    const proposal = read(proposalPath)
    const resultMatch = result.match(
      /<!-- P50H_LOCAL_GIT_CI_PREVIEW_RESULT_V1 (\{[^\n]+\}) -->/,
    )
    const proposalMatch = proposal.match(
      /<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 (\{[^\n]+\}) -->/,
    )
    expect(
      result.match(/<!-- P50H_LOCAL_GIT_CI_PREVIEW_RESULT_V1 /g),
    ).toHaveLength(1)
    expect(
      proposal.match(
        /^<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 /gm,
      ),
    ).toHaveLength(1)
    expect(resultMatch).not.toBeNull()
    expect(proposalMatch).not.toBeNull()

    const receipt = JSON.parse(resultMatch![1])
    expect(receipt).toMatchObject({
      schema: 'conduit-boq/p50h-local-git-ci-preview-result/v1',
      requestId: 'P50H-REQ-20260824-V1',
      authorizationConsumed: true,
      authorizationReplayAllowed: false,
      commitSha: '2b45f9b1679d12caac933568e89e1065d74dbd74',
      parentSha: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
      commitPathCount: 52,
      pushSucceeded: true,
      remoteBranchEqual: true,
      qualityRunId: 32661774094,
      qualityConclusion: 'failure',
      qualityTestPassed: false,
      qualityBuildSkipped: true,
      qualityFailureCode: 'ENOENT',
      qualityFailureClassification:
        'non-hermetic-local-only-snapshot-dependency',
      previewEnvironment: 'Preview',
      previewStatus: 'success',
      previewDoesNotOverrideQualityFailure: true,
      gatePassed: false,
      releaseQualified: false,
      publishedVersion: '2568.0.0',
      publishedVersionMutated: false,
      provisionalTargetVersion: '2568.1.0',
      targetRegistryCheckStatus: 'pending',
      p50iProposalPrepared: true,
      p50iExecutionAuthorized: false,
      nextOwnerDecision: 'review-p50i-proposal',
    })
    expect(result.trimEnd().endsWith(resultMatch![0])).toBe(true)
    expect(result).toContain('QUALITY FAIL')
    expect(result).toContain('P-13 HARD HOLD')

    const p50i = JSON.parse(proposalMatch![1])
    expect(p50i).toMatchObject({
      schema:
        'conduit-boq/p50i-quality-fixture-remediation-authorization-proposal/v1',
      requestId: 'P50I-REQ-20260824-V1',
      status: 'ready-for-owner-review',
      ownerApprovalPending: true,
      branch: 'codex/p12-production-authority-r2',
      localHead: '2b45f9b1679d12caac933568e89e1065d74dbd74',
      upstreamHead: '2b45f9b1679d12caac933568e89e1065d74dbd74',
      failedQualityRunId: 32661774094,
      failedQualityConclusion: 'failure',
      rootCause: 'non-hermetic-local-only-snapshot-dependency',
      trackedBaselineSha256:
        '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
      baselineRowCount: 710,
      baselineValueBindingSha256:
        '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
      authorityTestPreimageSha256:
        '012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a',
      prospectiveCommitPathCount: 11,
      proposalStagedMode: '100644',
      commitPathListSerialization: 'utf8-sorted-path-lf-v1',
      targetContentManifestSerialization:
        'utf8-sorted-sha256-two-spaces-path-lf-v1',
      expectedAuthorityTestCount: 22,
      expectedFocusedTestFileCount: 3,
      expectedFocusedTestCount: 31,
      p50hAuthorizationConsumed: true,
      p50hReplayAllowed: false,
      p50iExecutionAuthorized: false,
      localDependencyInstallAuthorized: false,
      remoteQualityNpmCiExpected: true,
      nextOwnerDecision: 'approve-or-hold-p50i',
    })
    expect(p50i.authorityTestTargetSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(p50i.commitPathListSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(p50i.targetContentManifestSha256).toMatch(/^[a-f0-9]{64}$/)
    for (const field of [
      'p50hReplayAllowed',
      'p50iExecutionAuthorized',
      'testMutationAuthorized',
      'docsAlignmentCommitAuthorized',
      'gitStageAuthorized',
      'localCommitAuthorized',
      'externalGitPublicationAuthorized',
      'networkAuthorized',
      'ciPreviewAuthorized',
      'localDependencyInstallAuthorized',
      'protectedPathAccessAuthorized',
      'candidateApplicationAuthorized',
      'databaseAccessAuthorized',
      'productionReadAuthorized',
      'productionWriteAuthorized',
      'applicationMutationAuthorized',
      'catalogMutationAuthorized',
      'boqMutationAuthorized',
      'pointerMutationAuthorized',
      'factorFMutationAuthorized',
      'mainMutationAuthorized',
      'pullRequestAuthorized',
      'p13Authorized',
      'p14Authorized',
      'p14cAuthorized',
      'p15Authorized',
      'deployAuthorized',
      'publicationAuthorized',
      'automaticNextStep',
    ]) {
      expect(p50i[field], `P50I.${field}`).toBe(false)
    }
    expect(proposal.trimEnd().endsWith(proposalMatch![0])).toBe(true)

    for (const path of [
      'docs/plans/master-catalog/00-phase4-review-guide.md',
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
      'docs/plans/master-catalog/13-phase4-verification-report.md',
      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
      'docs/plans/master-catalog/19-phase4-decision-register.md',
      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
    ]) {
      const authority = read(path)
      expect(authority).toContain(
        './58-phase4-p50h-local-git-ci-preview-result-record.md',
      )
      expect(authority).toContain(
        './59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md',
      )
      expect(authority).toContain('32661774094')
    }
  })

  it('keeps core authority links resolvable', () => {
    const threatModel = read(
      'docs/plans/master-catalog/18-phase4-threat-model.md',
    )
    const productionRunbook = read(
      'docs/plans/master-catalog/12-phase4-production-runbook.md',
    )
    const ownerP12Checklist = read(
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
    )
    const threatIds = [...threatModel.matchAll(/^\| (T-\d+) \|/gm)]
      .map((match) => match[1])
    expect(new Set(threatIds).size).toBe(threatIds.length)
    expect(productionRunbook).toContain(
      'The authorized Production database/ledger/advisor\nread-only evidence is complete without a Production write.',
    )
    expect(productionRunbook).not.toContain(
      'Fresh Production baseline/ledger/advisor evidence',
    )
    for (const checkpoint of [
      'Readiness rehearsal before requesting P-12',
      'Final pre-migration backup',
      'Post-migration checkpoint',
      'Post-publication checkpoint',
    ]) {
      expect(ownerP12Checklist).toContain(checkpoint)
    }

    for (const path of [
      'docs/SECURITY.md',
      'docs/CODEBASE_DATABASE_MAP.md',
      'docs/02_architecture/ADR/ADR-001-supabase-rls-authorization.md',
      'docs/03_domain/ACCESS_MODEL.md',
      'docs/04_data/DATABASE_SCHEMA.md',
      'docs/04_data/DATA_INTEGRITY.md',
      'docs/04_data/MIGRATIONS.md',
      'docs/04_data/SECURITY_MODEL.md',
      'docs/06_engineering/PERMISSION_PATTERNS.md',
      'docs/08_ai/LESSONS_LEARNED.md',
      'docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md',
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
      'docs/plans/master-catalog/32-phase4-wp8-p36-owner-review-note.md',
      'docs/plans/master-catalog/33-phase4-wp8-p37-uat-ux-correction-note.md',
      'docs/plans/master-catalog/34-phase4-wp8-p37-closure-matrix.md',
      'docs/plans/master-catalog/35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md',
      'docs/plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md',
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
      'docs/plans/master-catalog/38-phase4-p42-final-review-snapshot-binding-incident-note.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
      'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
      'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
      'docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md',
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
      'docs/plans/master-catalog/44-phase4-p46-catalog-action-error-callability-finding.md',
      'docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md',
      'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md',
      'docs/plans/master-catalog/47-phase4-p49-forward-only-db-application-correction-proposal.md',
      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
      'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md',
      'docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md',
      'docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md',
      'docs/plans/master-catalog/52-phase4-p50d-one-row-selected-delta-approval-proposal.md',
      'docs/plans/master-catalog/53-phase4-p50c-one-row-offline-candidate-result-record.md',
      'docs/plans/master-catalog/54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md',
      'docs/plans/master-catalog/55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md',
      'docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md',
      'docs/plans/master-catalog/57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md',
      'docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md',
      'docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md',
    ]) {
      expectRelativeMarkdownLinksToExist(path)
      expectMarkdownTablesToBeWellShaped(path)
    }
  })
})
