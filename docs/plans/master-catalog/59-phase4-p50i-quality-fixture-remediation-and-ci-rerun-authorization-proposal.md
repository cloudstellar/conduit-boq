# Phase 4 P-50I Quality Fixture Remediation and CI Rerun Authorization Proposal

**Status:** READY FOR OWNER REVIEW / EXECUTION NOT AUTHORIZED / P-13 HARD HOLD

**Prepared:** 2026-08-24

**Request:** `P50I-REQ-20260824-V1`

**Base branch:** `codex/p12-production-authority-r2`

**Required local/upstream HEAD:**
`2b45f9b1679d12caac933568e89e1065d74dbd74`

## 1. Why this small correction is recommended

[P-50H Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md)
records a truthful split outcome: exact commit/push/remote equality and
non-Production Preview succeeded, but required Quality run `32661774094`
failed in Test and skipped Build. P-50H is consumed and cannot be replayed.

From the Owner perspective, bypassing a deterministic red Quality gate would
save one small repository step but would make the future Production decision
depend on a commit that never completed the repository's own release checks.
That is poor evidence even for a one-person project. A bounded forward-only
test correction is the least complex reliable path.

From the developer perspective, the failure is reproducible from repository
bytes: `tests/master-catalog-authority-consistency.test.ts` unconditionally
reads `supabase/.snapshots/public-data-20260621-post009.sql`, while
`supabase/.gitignore` excludes `.snapshots`. Local succeeds only because the
offline snapshot exists outside Git; a clean Actions checkout cannot contain
it. This is a hermeticity defect, not catalog-data corruption.

The recommended fix preserves the strong invariant without adding or exposing
the ignored Production-derived snapshot. It derives the same 710-row baseline
binding from the already tracked, hash-bound
`docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv`, using the
same parser and field mapping already exercised by P-50C. It also records the
P-50H failure receipt and current overlays in the same additive commit.

Rejected shortcuts:

- do not conditionally skip the assertion when the snapshot is absent;
- do not force-add or upload the ignored snapshot;
- do not inject a secret CI-only fixture;
- do not amend/force-push `2b45f9b...`;
- do not rerun the unchanged failing commit.

## 2. Exact frozen repository envelope

Execution requires all of the following to match before any mutation:

| Field | Required value |
|---|---|
| Branch | `codex/p12-production-authority-r2` |
| Local HEAD | `2b45f9b1679d12caac933568e89e1065d74dbd74` |
| Upstream/remote HEAD | `2b45f9b1679d12caac933568e89e1065d74dbd74` |
| Ahead/behind | `0/0` |
| Index | empty |
| Failed Quality run | `32661774094`, exact HEAD, conclusion `failure` |
| Test preimage | `200931` bytes / `012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a` |
| Test target | `207633` bytes / `cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4` |
| Prospective commit paths | exactly `11`; no protected path |
| Commit-path-list SHA-256 | `280be4e4d5700139149573800205dee68f64f27f04436b7c20a99f068b4e8aa1` |
| Non-proposal target-content root | `99babeb12419a472d4de56912894bcbd55420db08e4e2d2539cd57b701e43d1f` |

The exact prospective paths are:

1. `docs/plans/master-catalog/00-phase4-review-guide.md`
2. `docs/plans/master-catalog/12-phase4-production-runbook.md`
3. `docs/plans/master-catalog/13-phase4-verification-report.md`
4. `docs/plans/master-catalog/15-phase4-admin-operating-procedure.md`
5. `docs/plans/master-catalog/19-phase4-decision-register.md`
6. `docs/plans/master-catalog/23-phase4-implementation-execution-pack.md`
7. `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md`
8. `docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md`
9. `docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md`
10. `docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md`
11. `tests/master-catalog-authority-consistency.test.ts`

The proposal file is self-excluded from the target-content root and is instead
bound by the Owner's full SHA-256 approval. Its required staged Git mode is
`100644`; approval binds its bytes, and the execution preflight must bind both
that approved SHA-256 and this mode. The other ten frozen targets are:

| Target path | Mode | Bytes | Target SHA-256 |
|---|---:|---:|---|
| `docs/plans/master-catalog/00-phase4-review-guide.md` | `100644` | `47597` | `c8e55a17b36b97dbb2b4957d259130a582a9747e5a47f4b7aef02630a2974f6c` |
| `docs/plans/master-catalog/12-phase4-production-runbook.md` | `100644` | `72174` | `7c7cfebc43105b4350b455c87626854cefe53ba517d096cf029d5d63c98cbc00` |
| `docs/plans/master-catalog/13-phase4-verification-report.md` | `100644` | `215443` | `ceeceecd1040af9d3e21f8971887a2a2dfbcf60f006b72b7fc2c7e4698d35342` |
| `docs/plans/master-catalog/15-phase4-admin-operating-procedure.md` | `100644` | `58032` | `19a6be8b74dde9099d8c39cf62ca3500de459cd7888216946fc82d01972b82ce` |
| `docs/plans/master-catalog/19-phase4-decision-register.md` | `100644` | `193513` | `0ec7b70d928900c33bd47b786605236a44437c647efa503e698f6e4434ec823f` |
| `docs/plans/master-catalog/23-phase4-implementation-execution-pack.md` | `100644` | `91911` | `665d5b63b0b377c26d3b68595aa291bcb742edc3f14423210d2c4bf12ebf43da` |
| `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md` | `100644` | `266784` | `5bdfee9719dbceb5a36d63ddc3cc24d7584fc49eb0d288f8b01a1c20ca45a68b` |
| `docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md` | `100644` | `47044` | `b690c062462ba2ff9d0a7459c25b8ec6c48f95d4e85643f51e1284c61136f9a0` |
| `docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md` | `100644` | `8711` | `ce0a54092c3853e8c76d35b1ca1b67f4da96cceb027e75bcd42cefd83bfd011d` |
| `tests/master-catalog-authority-consistency.test.ts` | `100644` | `207633` | `cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4` |

Any extra, missing, protected, mode-drifted, byte-drifted, or hash-drifted
path is HOLD.

The aggregate hashes are reproducible as follows:

- `commitPathListSha256` hashes UTF-8 bytes of the 11 repository-relative
  paths sorted by bytewise path order, each followed by one LF;
- `targetContentManifestSha256` hashes UTF-8 bytes of the ten non-proposal
  entries in the same path order, each serialized as
  `<lowercase-sha256><two ASCII spaces><path><LF>`.

## 3. Exact authority-test correction

Only the following test behavior may change:

1. import `xlsx` in the authority consistency test;
2. replace the runtime read/parser for the ignored snapshot with a read of the
   tracked reconciliation CSV;
3. assert the tracked CSV SHA-256
   `4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a`;
4. filter the 710 `record_scope=production` rows, project the exact authority
   fields, retain first/last code checks, and reproduce baseline binding
   `6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a`;
5. retain the ignored snapshot SHA as a committed receipt binding through
   P-50R `SHA256SUMS`, without opening that snapshot;
6. add one P-50H/P-50I authority-consistency case and add Documents #58/#59 to
   the core-link/table check.

The exact patch is frozen by the preimage/target hashes in Section 2 and by the
following intentionally zero-context unified diff. Because ordinary
`git apply` rejects zero-context patches by default, a future approved run must
pipe these exact fenced bytes first to
`git apply --check --recount --unidiff-zero -` and only after PASS to
`git apply --recount --unidiff-zero -`. The already verified exact preimage
hash prevents the reduced context from matching a different source state.

```diff
--- a/tests/master-catalog-authority-consistency.test.ts
+++ b/tests/master-catalog-authority-consistency.test.ts
@@ -4,0 +5 @@
+import * as XLSX from 'xlsx'
@@ -2742,2 +2743,5 @@
-    const baselineSnapshot = read(
-      'supabase/.snapshots/public-data-20260621-post009.sql',
+    const baselineInputPath =
+      'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv'
+    const baselineInputBytes = readFileSync(resolve(root, baselineInputPath))
+    expect(createHash('sha256').update(baselineInputBytes).digest('hex')).toBe(
+      '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
@@ -2745,20 +2749,13 @@
-    expect(createHash('sha256').update(baselineSnapshot).digest('hex')).toBe(
-      currentMarker.baselineSnapshotSha256,
-    )
-    const priceListMatches = [
-      ...baselineSnapshot.matchAll(
-        /^INSERT INTO public\.price_list\r?\nSELECT \* FROM jsonb_populate_recordset\(NULL::public\.price_list,\r?\n\$snapshot_20260621\$(\[[^\r\n]*\])\$snapshot_20260621\$::jsonb\);$/gm,
-      ),
-    ]
-    expect(priceListMatches).toHaveLength(1)
-    const baselineRows = JSON.parse(priceListMatches[0]![1]) as Array<{
-      id: string
-      item_code: string
-      item_name: string
-      unit: string
-      material_cost: number
-      labor_cost: number
-      unit_cost: number
-    }>
-    const baselineValueRecords = [...baselineRows]
-      .sort((left, right) => left.item_code.localeCompare(right.item_code, 'en'))
+    const baselineWorkbook = XLSX.read(baselineInputBytes, {
+      type: 'buffer',
+      codepage: 65001,
+      raw: false,
+    })
+    const baselineWorksheet =
+      baselineWorkbook.Sheets[baselineWorkbook.SheetNames[0]]
+    const baselineValueRecords = XLSX.utils
+      .sheet_to_json<Record<string, unknown>>(baselineWorksheet, {
+        defval: '',
+        raw: true,
+      })
+      .filter((row) => String(row.record_scope) === 'production')
@@ -2766,7 +2763,7 @@
-        identity_id: row.id,
-        legacy_item_code: row.item_code,
-        item_name: row.item_name,
-        unit: row.unit,
-        material_cost: row.material_cost,
-        labor_cost: row.labor_cost,
-        unit_cost: row.unit_cost,
+        identity_id: String(row.production_uuid),
+        legacy_item_code: String(row.legacy_item_code),
+        item_name: String(row.production_name),
+        unit: String(row.production_unit),
+        material_cost: Number(row.production_material_cost),
+        labor_cost: Number(row.production_labor_cost),
+        unit_cost: Number(row.production_unit_cost),
@@ -2773,0 +2771,3 @@
+      .sort((left, right) =>
+        left.legacy_item_code.localeCompare(right.legacy_item_code, 'en'),
+      )
@@ -2781,0 +2782,4 @@
+    const p50rChecksums = read(`${evidenceRoot}/SHA256SUMS`)
+    expect(p50rChecksums).toContain(
+      `${currentMarker.baselineSnapshotSha256}  supabase/.snapshots/public-data-20260621-post009.sql`,
+    )
@@ -4697,0 +4702,153 @@
+  it('records P-50H fail-closed and keeps P-50I non-operational', () => {
+    const resultPath =
+      'docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md'
+    const proposalPath =
+      'docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md'
+    const result = read(resultPath)
+    const proposal = read(proposalPath)
+    const resultMatch = result.match(
+      /<!-- P50H_LOCAL_GIT_CI_PREVIEW_RESULT_V1 (\{[^\n]+\}) -->/,
+    )
+    const proposalMatch = proposal.match(
+      /<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 (\{[^\n]+\}) -->/,
+    )
+    expect(
+      result.match(/<!-- P50H_LOCAL_GIT_CI_PREVIEW_RESULT_V1 /g),
+    ).toHaveLength(1)
+    expect(
+      proposal.match(
+        /<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 /g,
+      ),
+    ).toHaveLength(1)
+    expect(resultMatch).not.toBeNull()
+    expect(proposalMatch).not.toBeNull()
+
+    const receipt = JSON.parse(resultMatch![1])
+    expect(receipt).toMatchObject({
+      schema: 'conduit-boq/p50h-local-git-ci-preview-result/v1',
+      requestId: 'P50H-REQ-20260824-V1',
+      authorizationConsumed: true,
+      authorizationReplayAllowed: false,
+      commitSha: '2b45f9b1679d12caac933568e89e1065d74dbd74',
+      parentSha: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
+      commitPathCount: 52,
+      pushSucceeded: true,
+      remoteBranchEqual: true,
+      qualityRunId: 32661774094,
+      qualityConclusion: 'failure',
+      qualityTestPassed: false,
+      qualityBuildSkipped: true,
+      qualityFailureCode: 'ENOENT',
+      qualityFailureClassification:
+        'non-hermetic-local-only-snapshot-dependency',
+      previewEnvironment: 'Preview',
+      previewStatus: 'success',
+      previewDoesNotOverrideQualityFailure: true,
+      gatePassed: false,
+      releaseQualified: false,
+      publishedVersion: '2568.0.0',
+      publishedVersionMutated: false,
+      provisionalTargetVersion: '2568.1.0',
+      targetRegistryCheckStatus: 'pending',
+      p50iProposalPrepared: true,
+      p50iExecutionAuthorized: false,
+      nextOwnerDecision: 'review-p50i-proposal',
+    })
+    expect(result.trimEnd().endsWith(resultMatch![0])).toBe(true)
+    expect(result).toContain('QUALITY FAIL')
+    expect(result).toContain('P-13 HARD HOLD')
+
+    const p50i = JSON.parse(proposalMatch![1])
+    expect(p50i).toMatchObject({
+      schema:
+        'conduit-boq/p50i-quality-fixture-remediation-authorization-proposal/v1',
+      requestId: 'P50I-REQ-20260824-V1',
+      status: 'ready-for-owner-review',
+      ownerApprovalPending: true,
+      branch: 'codex/p12-production-authority-r2',
+      localHead: '2b45f9b1679d12caac933568e89e1065d74dbd74',
+      upstreamHead: '2b45f9b1679d12caac933568e89e1065d74dbd74',
+      failedQualityRunId: 32661774094,
+      failedQualityConclusion: 'failure',
+      rootCause: 'non-hermetic-local-only-snapshot-dependency',
+      trackedBaselineSha256:
+        '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
+      baselineRowCount: 710,
+      baselineValueBindingSha256:
+        '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
+      authorityTestPreimageSha256:
+        '012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a',
+      prospectiveCommitPathCount: 11,
+      proposalStagedMode: '100644',
+      commitPathListSerialization: 'utf8-sorted-path-lf-v1',
+      targetContentManifestSerialization:
+        'utf8-sorted-sha256-two-spaces-path-lf-v1',
+      expectedAuthorityTestCount: 22,
+      expectedFocusedTestFileCount: 3,
+      expectedFocusedTestCount: 31,
+      p50hAuthorizationConsumed: true,
+      p50hReplayAllowed: false,
+      p50iExecutionAuthorized: false,
+      localDependencyInstallAuthorized: false,
+      remoteQualityNpmCiExpected: true,
+      nextOwnerDecision: 'approve-or-hold-p50i',
+    })
+    expect(p50i.authorityTestTargetSha256).toMatch(/^[a-f0-9]{64}$/)
+    expect(p50i.commitPathListSha256).toMatch(/^[a-f0-9]{64}$/)
+    expect(p50i.targetContentManifestSha256).toMatch(/^[a-f0-9]{64}$/)
+    for (const field of [
+      'p50hReplayAllowed',
+      'p50iExecutionAuthorized',
+      'testMutationAuthorized',
+      'docsAlignmentCommitAuthorized',
+      'gitStageAuthorized',
+      'localCommitAuthorized',
+      'externalGitPublicationAuthorized',
+      'networkAuthorized',
+      'ciPreviewAuthorized',
+      'localDependencyInstallAuthorized',
+      'protectedPathAccessAuthorized',
+      'candidateApplicationAuthorized',
+      'databaseAccessAuthorized',
+      'productionReadAuthorized',
+      'productionWriteAuthorized',
+      'applicationMutationAuthorized',
+      'catalogMutationAuthorized',
+      'boqMutationAuthorized',
+      'pointerMutationAuthorized',
+      'factorFMutationAuthorized',
+      'mainMutationAuthorized',
+      'pullRequestAuthorized',
+      'p13Authorized',
+      'p14Authorized',
+      'p14cAuthorized',
+      'p15Authorized',
+      'deployAuthorized',
+      'publicationAuthorized',
+      'automaticNextStep',
+    ]) {
+      expect(p50i[field], `P50I.${field}`).toBe(false)
+    }
+    expect(proposal.trimEnd().endsWith(proposalMatch![0])).toBe(true)
+
+    for (const path of [
+      'docs/plans/master-catalog/00-phase4-review-guide.md',
+      'docs/plans/master-catalog/12-phase4-production-runbook.md',
+      'docs/plans/master-catalog/13-phase4-verification-report.md',
+      'docs/plans/master-catalog/15-phase4-admin-operating-procedure.md',
+      'docs/plans/master-catalog/19-phase4-decision-register.md',
+      'docs/plans/master-catalog/23-phase4-implementation-execution-pack.md',
+      'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
+      'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
+    ]) {
+      const authority = read(path)
+      expect(authority).toContain(
+        './58-phase4-p50h-local-git-ci-preview-result-record.md',
+      )
+      expect(authority).toContain(
+        './59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md',
+      )
+      expect(authority).toContain('32661774094')
+    }
+  })
+
@@ -4786,0 +4944,2 @@
+      'docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md',
+      'docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md',
```

No application, script, package, lockfile, workflow, evidence artifact,
snapshot, migration, or database file may change.

## 4. Exact future validation

If and only if the Owner returns the exact Section 7 approval while the window
is open, one fail-fast P-50I run may:

1. recheck the exact approval hash, time, branch/HEAD/upstream/ahead/index,
   failed run identity, and every Section 2 path/mode/byte/hash;
2. extract only the Section 3 fenced diff; prove it with
   `git apply --check --recount --unidiff-zero -`, apply it once with the same
   `--recount --unidiff-zero` semantics, and verify the exact target
   bytes/SHA-256;
3. run locally, without dependency installation or protected-source access:
   - the authority test alone; expected `22` tests;
   - the P-50 authority set; expected `3` files / `31` tests;
   - focused ESLint on the changed test;
   - deterministic `node scripts/build-master-catalog-p50c.mjs --check`;
   - explicit-path worktree/new-file whitespace checks over only the 11 frozen
     paths;
4. stage exactly the 11 paths from Section 2; verify staged modes/bytes/hashes,
   including Proposal #59 mode `100644` and its approved SHA-256; then run
   `git diff --cached --check` before creating one additive commit with message
   `test: make master catalog authority check CI-hermetic`;
5. verify parent `2b45f9b...`, exact paths, clean index, and unchanged protected/
   operational scope;
6. non-force push only `HEAD` to
   `origin/codex/p12-production-authority-r2`;
7. observe the repository's existing Quality workflow and already configured
   non-Production Preview for the exact new commit. The clean remote Quality
   job is expected to run its existing `npm ci`, lint, full test, and build
   steps; this is the only full-suite validation in scope. Then stop.

CI failure after push is report-only: no amend, force-push, patch, rerun,
rollback, or next gate is authorized. Quality PASS would permit only result/
handoff preparation and a later separate P-13/P-14/P-14C proposal; it would
not authorize Production.

## 5. Owner and developer risk view

| View | Benefit | Cost / residual |
|---|---|---|
| Owner | Keeps the path simple: one small forward fix, one commit, one CI observation | Requires one more explicit approval before Production planning |
| Developer | Clean checkout becomes deterministic while preserving the 710-row binding | Adds `xlsx` parsing to one more test, but uses an existing pinned dependency and source contract |
| Data integrity | Does not alter P-50C, `2568.0.0`, the one selected delta, or evidence bytes | The ignored snapshot remains offline evidence and is not independently re-opened by CI |
| Release safety | A future P-13 proposal can bind a genuinely green Quality SHA | P-51 waiver time still expires independently |

The extra step is justified: a red CI commit is not a sound pre-Production
fingerprint, even when the failure is test infrastructure rather than runtime
code.

## 6. Excluded scope and stop conditions

This proposal does not currently authorize execution. Even a matching future
approval would not authorize:

- reading/traversing repository `files/`, `output/`, `outputs/`, or `tmp/`, or
  reading the ignored snapshot;
- local/operator dependency installation, workflow/package/lockfile changes,
  a rerun of the unchanged failed commit, amend, reset, rebase, or force-push;
- `main` mutation, pull request open/merge, Production Preview configuration,
  or Production deployment;
- P-50C application, registry mutation, official Excel/PDF, catalog/BOQ/
  pointer/Factor-F mutation, or historical BOQ repricing;
- database/Production read/write, flags, P-13, P-14, P-14C, P-15, P-49
  implementation, publication, or automatic continuation.

The execution window begins only at the matching Owner approval timestamp and
ends at `2026-08-25T23:00:00+07:00`. This does not extend the P-51 waiver,
which still expires at `2026-08-25T23:59:59+07:00`. Any mismatch or expiry is
HOLD and requires a freshly reviewed proposal.

The existing remote Quality workflow's automatic `npm ci` is an expected and
allowed CI side effect of the exact future push/observation authority. It does
not authorize a local install, workflow/package/lockfile edit, arbitrary
network action, or rerun of the unchanged failed commit.

## 7. Simple Owner response

The review handoff must provide the current full SHA-256 of this proposal. To
approve Sections 2-6 exactly, the Owner may reply with one line:

> APPROVE P-50I — P50I-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF

No long approval paragraph is required. Any partial hash, changed bytes,
expired window, or different wording is HOLD.

<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 {"schema":"conduit-boq/p50i-quality-fixture-remediation-authorization-proposal/v1","preparedAt":"2026-08-24","requestId":"P50I-REQ-20260824-V1","status":"ready-for-owner-review","ownerApprovalPending":true,"proposalSha256BindingMode":"external-owner-approval","ownerApprovalForm":"short-hash-bound-v1","shortApprovalTemplate":"APPROVE P-50I — P50I-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF","approvalRequiresExactRequestId":true,"approvalRequiresFullProposalSha256":true,"branch":"codex/p12-production-authority-r2","localHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","upstreamHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","branchAheadBy":0,"failedQualityRunId":32661774094,"failedQualityConclusion":"failure","rootCause":"non-hermetic-local-only-snapshot-dependency","ignoredSnapshotPath":"supabase/.snapshots/public-data-20260621-post009.sql","ignoredSnapshotReadAuthorized":false,"trackedBaselinePath":"docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv","trackedBaselineSha256":"4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a","baselineRowCount":710,"baselineValueBindingSha256":"6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a","authorityTestPreimageBytes":200931,"authorityTestPreimageSha256":"012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a","authorityTestTargetBytes":207633,"authorityTestTargetSha256":"cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4","prospectiveCommitPathCount":11,"proposalStagedMode":"100644","commitPathListSerialization":"utf8-sorted-path-lf-v1","commitPathListSha256":"280be4e4d5700139149573800205dee68f64f27f04436b7c20a99f068b4e8aa1","targetContentManifestSerialization":"utf8-sorted-sha256-two-spaces-path-lf-v1","targetContentManifestSha256":"99babeb12419a472d4de56912894bcbd55420db08e4e2d2539cd57b701e43d1f","expectedAuthorityTestCount":22,"expectedFocusedTestFileCount":3,"expectedFocusedTestCount":31,"localValidationScope":"focused-explicit-path-only","remoteQualityNpmCiExpected":true,"remoteQualityFullSuiteExpected":true,"commitMessage":"test: make master catalog authority check CI-hermetic","pushTarget":"origin/codex/p12-production-authority-r2","windowBegins":"exact-owner-approval-message-timestamp","windowEnds":"2026-08-25T23:00:00+07:00","p51WaiverExtended":false,"p50hAuthorizationConsumed":true,"p50hReplayAllowed":false,"p50iExecutionAuthorized":false,"testMutationAuthorized":false,"docsAlignmentCommitAuthorized":false,"gitStageAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"networkAuthorized":false,"ciPreviewAuthorized":false,"localDependencyInstallAuthorized":false,"protectedPathAccessAuthorized":false,"candidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"applicationMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"mainMutationAuthorized":false,"pullRequestAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"nextOwnerDecision":"approve-or-hold-p50i"} -->
