import { createHash } from 'node:crypto'
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
      '020',
      '021',
      '022',
      '023',
      '024',
      '025',
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
      '`022_master_catalog_phase4_draft_identity_and_release_number.sql`',
      '`023_master_catalog_phase4_published_code_rls_scope.sql`',
      '`024_master_catalog_phase4_set_based_placement_invalidation.sql`',
      '`025_master_catalog_phase4_withdraw_order_compaction.sql`',
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
      '## 16. WP-8 clean local rehearsal',
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
    expect(tracker).toContain(
      '| Current work package | P-12 readiness evidence window partially complete; HOLD pending Data API configuration, backup/isolated restore, security-residual disposition, and executor/window evidence |',
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
      '| Current environment | Authorized Production read-only evidence at 2026-07-26 09:53 +07: PostgreSQL 17.6; pointer/default `2568.0.0`',
    )
    expect(tracker).toMatch(/zero\s+working drafts with all catalog flags false/)
    expect(tracker).toContain(
      'Owner decisions needed: authorize a Data API settings read; choose a secure logical-dump path or separately cost-confirmed platform restore; decide residual timing; this is not migration approval',
    )
    expect(tracker).toContain(
      'sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5',
    )
    expect(verificationReport).toContain(
      '20260706090832 hotfix_preserve_boq_item_suffix',
    )
    expect(verificationReport).toContain(
      '| Production Data API schemas | Platform configuration proves `private` is not exposed |',
    )
    expect(verificationReport).toContain(
      'No backup or restore was attempted',
    )
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
      'Status: WP-8/P-37 remains Owner-accepted under the guided-UAT variance; readiness baseline 6827ebc and the later uncommitted user-visibility candidate passed their named gates',
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
    expect(changeRequest).toContain('Current P-37 disposition (2026-07-25)')
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

  it('keeps core authority links resolvable', () => {
    const threatModel = read(
      'docs/plans/master-catalog/18-phase4-threat-model.md',
    )
    const threatIds = [...threatModel.matchAll(/^\| (T-\d+) \|/gm)]
      .map((match) => match[1])
    expect(new Set(threatIds).size).toBe(threatIds.length)

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
      'docs/plans/master-catalog/32-phase4-wp8-p36-owner-review-note.md',
      'docs/plans/master-catalog/33-phase4-wp8-p37-uat-ux-correction-note.md',
      'docs/plans/master-catalog/34-phase4-wp8-p37-closure-matrix.md',
      'docs/plans/master-catalog/35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md',
      'docs/plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md',
      'docs/plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md',
      'docs/plans/master-catalog/38-phase4-p42-final-review-snapshot-binding-incident-note.md',
      'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
    ]) {
      expectRelativeMarkdownLinksToExist(path)
      expectMarkdownTablesToBeWellShaped(path)
    }
  })
})
