# Phase 4 P-50J Marker-Count Correction and CI Authorization Proposal

**Status:** READY FOR OWNER REVIEW / EXECUTION NOT AUTHORIZED / P-13 HARD HOLD

**Prepared:** 2026-08-24

**Request:** `P50J-REQ-20260824-V1`

**Base branch:** `codex/p12-production-authority-r2`

**Required local/upstream/remote HEAD:**
`2b45f9b1679d12caac933568e89e1065d74dbd74`

## 1. Why P-50J is the smallest safe next step

[P-50I Result #60](./60-phase4-p50i-local-validation-failure-result-record.md)
records a safe fail-fast stop. The exact approved P-50I patch was applied and
matched its target hash, but local validation returned `21/22` authority tests
and `30/31` tests in the exact P-50 set. No staging, commit, push, new CI run,
Preview, database, or Production action occurred.

The failure is narrower than the P-50I fixture correction. Proposal #59 is a
reviewable document that contains its own frozen test diff. Therefore the raw
regex counted the P-50I marker name twice inside that diff and once in the real
line-start EOF marker. Independent read-only checks proved:

- raw marker-name count: `3`;
- line-start marker count: `1`;
- actual EOF marker parse: valid;
- P-50C deterministic check: PASS, `710` rows / one selected price delta;
- focused ESLint: PASS.

From the Owner perspective, the simplest reliable correction is one two-byte
regex extension: require the marker to start a line and enable multiline mode.
It preserves the human-readable proposal, avoids weakening the uniqueness
assertion, and does not add another broad test system.

From the developer perspective, this corrects the assertion's intended
boundary without changing the tracked CSV parser, value binding, P-50C data,
application code, package/workflow, or any runtime behavior. An independent
in-memory projection of exactly this line passed the authority test (`22/22`)
and the exact P-50 set (`3` files / `31` tests).

## 2. Exact frozen repository envelope

The envelope separates pre-mutation state from the post-patch target. Before
mutation, the branch/Git/result fields, test preimage, path list, Proposal #61
approved SHA/mode, and the eleven unchanged non-proposal document targets must
match. The test target and aggregate target-content root are verified only
after the one-line patch and again after staging.

| Field | Required value |
|---|---|
| Branch | `codex/p12-production-authority-r2` |
| Local/upstream/live remote HEAD | `2b45f9b1679d12caac933568e89e1065d74dbd74` |
| Ahead/behind | `0/0` |
| Index | empty |
| P-50I approved proposal | SHA-256 `dad63f43fc384ffb2a13296153fde23aa631356835b16d22eb1578f9dc53c523` |
| P-50I result marker | exact Result #60 EOF JSON; authorization consumed/no replay; no Git/new CI |
| Test preimage | `207633` bytes / `cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4` |
| Test target (post-patch/staged) | `207635` bytes / `95f4066942db57828a4c0101c5469dad389a0465bfe7838576fd657eb0a7831a` |
| Prospective commit paths | exactly `13`; no protected path |
| Commit-path-list SHA-256 | `52c8c675b857ccaeca531aec7c0aca6596ac8bfe31a2ad00e8fda6deaf5ba5bc` |
| Non-proposal target-content root (post-patch/staged) | `471ccb3e65cc0317d578c89c137a4d945ba59e3dc6e7010a543d15bd32609ec7` |

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
11. `docs/plans/master-catalog/60-phase4-p50i-local-validation-failure-result-record.md`
12. `docs/plans/master-catalog/61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md`
13. `tests/master-catalog-authority-consistency.test.ts`

Proposal #61 is self-excluded from the target-content root and is instead
bound by the Owner's full proposal SHA-256 approval. Its required staged Git
mode is `100644`. The other twelve frozen targets are:

The eleven document rows must already match before mutation. The test row is
the required result after Section 3, not a preflight precondition.

| Target path | Mode | Bytes | Target SHA-256 |
|---|---:|---:|---|
| `docs/plans/master-catalog/00-phase4-review-guide.md` | `100644` | `48328` | `18415013e829ce8c3f7632364c44b9a2703c2a6d213324fbda298067ef8afc09` |
| `docs/plans/master-catalog/12-phase4-production-runbook.md` | `100644` | `72645` | `e8d109125a9ac5b240904782af07e00fd7387e97ae2b63eaff3818ac2584dbfc` |
| `docs/plans/master-catalog/13-phase4-verification-report.md` | `100644` | `215899` | `941d8363c3597805e99e7b71bfc704279c71544e7c499a1cbdab5f3001c37d11` |
| `docs/plans/master-catalog/15-phase4-admin-operating-procedure.md` | `100644` | `58471` | `1dad0b55616f5067095ca78d0763096bca4bf901bde09c4f8dd7d07806c92892` |
| `docs/plans/master-catalog/19-phase4-decision-register.md` | `100644` | `194865` | `152377976f6ebe95faf6abce2fc93ab98058be75c7e4a56198e6edc0bfeb0598` |
| `docs/plans/master-catalog/23-phase4-implementation-execution-pack.md` | `100644` | `92702` | `b107a3c3ff2d452b867b87260bdeb2db84bca976b42796951936e99fc030d0ed` |
| `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md` | `100644` | `267532` | `92feac44692b0476cf2c7e4be6e054b25be6e0302fe291a2668ec62702867a2f` |
| `docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md` | `100644` | `49136` | `72cacf9ff9563e6192c1987f2e8dbaabe08e3ff4963408f2e7cbc682fcfaeb89` |
| `docs/plans/master-catalog/58-phase4-p50h-local-git-ci-preview-result-record.md` | `100644` | `8711` | `ce0a54092c3853e8c76d35b1ca1b67f4da96cceb027e75bcd42cefd83bfd011d` |
| `docs/plans/master-catalog/59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md` | `100644` | `25304` | `dad63f43fc384ffb2a13296153fde23aa631356835b16d22eb1578f9dc53c523` |
| `docs/plans/master-catalog/60-phase4-p50i-local-validation-failure-result-record.md` | `100644` | `5826` | `9f6fe78c0ffaee4104325d2beee2856568fd0730b354d2d0ea39d0d2c94ca1a9` |
| `tests/master-catalog-authority-consistency.test.ts` | `100644` | `207635` | `95f4066942db57828a4c0101c5469dad389a0465bfe7838576fd657eb0a7831a` |

Any extra, missing, protected, mode-drifted, byte-drifted, or hash-drifted path
is HOLD.

The aggregate hashes are reproducible as follows:

- `commitPathListSha256` hashes UTF-8 bytes of the 13 repository-relative paths
  sorted by bytewise path order, each followed by one LF;
- `targetContentManifestSha256` hashes UTF-8 bytes of the twelve non-proposal
  entries in the same order, each serialized as
  `<lowercase-sha256><two ASCII spaces><path><LF>`.

## 3. Exact one-line correction

Only the following test line may change. The standard three-line-context diff
must pass ordinary `git apply --check -` before it may be applied once with
ordinary `git apply -`. The preimage and target hashes above prevent a match to
a different source state.

```diff
--- a/tests/master-catalog-authority-consistency.test.ts
+++ b/tests/master-catalog-authority-consistency.test.ts
@@ -4716,7 +4716,7 @@ describe('Master Catalog authority consistency', () => {
     ).toHaveLength(1)
     expect(
       proposal.match(
-        /<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 /g,
+        /^<!-- P50I_QUALITY_FIXTURE_REMEDIATION_AUTHORIZATION_PROPOSAL_V1 /gm,
       ),
     ).toHaveLength(1)
     expect(resultMatch).not.toBeNull()
```

No other test, application, script, dependency, package, lockfile, workflow,
evidence artifact, migration, or database file may change.

## 4. Exact future execution and validation

If and only if the Owner returns the exact Section 7 approval while its window
is open, one fail-fast P-50J run may:

1. recheck the exact approval hash, time, branch/HEAD/upstream/live remote,
   ahead/behind, empty index, Result #60, test preimage, exact path list, and
   every unchanged Section 2 document target path/mode/byte/hash;
2. extract only the Section 3 fenced diff, pass ordinary `git apply --check`,
   apply it once, and verify exact test target bytes/SHA-256 plus the full
   non-proposal target-content root;
3. run locally without dependency installation or protected-source access:
   - authority test only, expected `1` file / `22` passing tests;
   - exact P-50 set:
     `tests/master-catalog-authority-consistency.test.ts`,
     `tests/master-catalog-p50r-reconciliation.test.ts`, and
     `tests/master-catalog-p50c-candidate.test.ts`, expected `3` files / `31`
     passing tests;
   - focused ESLint on the changed authority test;
   - `node scripts/build-master-catalog-p50c.mjs --check`, expected `710` rows
     and exactly one value delta;
   - explicit-path whitespace checks over only the 13 frozen paths;
4. stage exactly the 13 paths, verify the staged modes/bytes/hashes—including
   Proposal #61 mode `100644` and its approved full SHA-256—then run
   `git diff --cached --check`;
5. create one additive commit with parent `2b45f9b...` and message
   `test: anchor P-50I proposal marker count`; verify exact commit paths and a
   clean index;
6. non-force push only `HEAD` to
   `origin/codex/p12-production-authority-r2`;
7. observe the repository's automatic `Quality` push workflow and configured
   non-Production `Preview` for that exact new SHA. Quality must complete
   `npm ci`, lint, full test, and build successfully; Preview must be bound to
   the same SHA and explicitly non-Production. Then stop.

Any local or remote failure is report-only: no amendment, retry, rerun,
force-push, rollback, second patch, or next gate is authorized. Green Quality
and Preview permit only result/handoff recording and preparation of a separate
P-13/P-14/P-14C proposal. They do not authorize Production.

## 5. Owner and developer risk view

| View | Benefit | Cost / residual |
|---|---|---|
| Owner | One understandable line fixes the gate without broadening scope | Requires one more explicit approval because P-50I was already consumed |
| Developer | Preserves a real uniqueness check and matches the document's line-start EOF marker boundary | Remote Quality is still required to prove clean-checkout lint/test/build |
| Data integrity | Changes no catalog/candidate/source value; `2568.0.0` and P-50C hashes stay unchanged | `2568.1.0` still needs a fresh registry check later |
| Release safety | Produces one exact green feature-branch SHA before any Production proposal | P-51 deadline remains independent and must not be rushed |

This is proportionate for a solo project: one focused local gate and the
existing remote Quality workflow, with no new test framework or ceremony.

## 6. Excluded scope and stop conditions

This proposal does not currently authorize execution. Even a matching future
approval would not authorize:

- reading/traversing repository `files/`, `output/`, `outputs/`, or `tmp/`, or
  reading the ignored snapshot;
- local dependency installation, workflow/package/lockfile edits, amend,
  reset, rebase, force-push, or rerunning an unchanged failed commit;
- `main` mutation, pull-request open/merge, Production deployment, or
  Production Preview configuration;
- candidate application, registry mutation, official Excel/PDF, catalog/BOQ/
  pointer/Factor-F mutation, or historical BOQ repricing;
- database/Production read/write, flags, P-13, P-14, P-14C, P-15, P-49
  implementation, publication, or automatic continuation.

The execution window begins only at the matching Owner approval timestamp and
ends at `2026-08-25T23:00:00+07:00`. This does not extend the P-51 waiver,
which still expires at `2026-08-25T23:59:59+07:00`. Any mismatch or expiry is
HOLD and requires a freshly reviewed proposal.

The remote workflow's automatic `npm ci` is an expected side effect of the
exact authorized push. It does not authorize local installation, workflow or
dependency edits, arbitrary network use, or a manual workflow rerun.

## 7. Simple Owner response

The review handoff must provide the current full SHA-256 of this proposal. To
approve Sections 2-6 exactly, the Owner may reply with one line:

> APPROVE P-50J — P50J-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF

No long approval paragraph is required. Any partial hash, changed bytes,
expired window, or different request ID is HOLD.

<!-- P50J_MARKER_COUNT_CORRECTION_AUTHORIZATION_PROPOSAL_V1 {"schema":"conduit-boq/p50j-marker-count-correction-authorization-proposal/v1","preparedAt":"2026-08-24","requestId":"P50J-REQ-20260824-V1","status":"ready-for-owner-review","ownerApprovalPending":true,"proposalSha256BindingMode":"external-owner-approval","ownerApprovalForm":"short-hash-bound-v1","shortApprovalTemplate":"APPROVE P-50J — P50J-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF","approvalRequiresExactRequestId":true,"approvalRequiresFullProposalSha256":true,"branch":"codex/p12-production-authority-r2","localHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","upstreamHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","remoteHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","branchAheadBy":0,"branchBehindBy":0,"p50iRequestId":"P50I-REQ-20260824-V1","p50iApprovedProposalSha256":"dad63f43fc384ffb2a13296153fde23aa631356835b16d22eb1578f9dc53c523","p50iAuthorizationConsumed":true,"p50iReplayAllowed":false,"p50iExactPatchApplied":true,"p50iLocalGatePassed":false,"p50iGitStageOccurred":false,"p50iCommitOccurred":false,"p50iPushOccurred":false,"p50iNewQualityRunOccurred":false,"failureClassification":"proposal-self-marker-name-count-not-line-anchored","rawMarkerNameCount":3,"anchoredMarkerCount":1,"authorityTestPreimageBytes":207633,"authorityTestPreimageSha256":"cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4","authorityTestTargetBytes":207635,"authorityTestTargetSha256":"95f4066942db57828a4c0101c5469dad389a0465bfe7838576fd657eb0a7831a","prospectiveCommitPathCount":13,"proposalStagedMode":"100644","commitPathListSerialization":"utf8-sorted-path-lf-v1","commitPathListSha256":"52c8c675b857ccaeca531aec7c0aca6596ac8bfe31a2ad00e8fda6deaf5ba5bc","targetContentManifestSerialization":"utf8-sorted-sha256-two-spaces-path-lf-v1","targetContentManifestSha256":"471ccb3e65cc0317d578c89c137a4d945ba59e3dc6e7010a543d15bd32609ec7","expectedAuthorityTestFileCount":1,"expectedAuthorityTestCount":22,"expectedFocusedTestFileCount":3,"expectedFocusedTestCount":31,"localValidationScope":"focused-explicit-path-only","remoteQualityNpmCiExpected":true,"remoteQualityFullSuiteExpected":true,"commitMessage":"test: anchor P-50I proposal marker count","pushTarget":"origin/codex/p12-production-authority-r2","windowBegins":"exact-owner-approval-message-timestamp","windowEnds":"2026-08-25T23:00:00+07:00","p51WaiverExtended":false,"p50jExecutionAuthorized":false,"testMutationAuthorized":false,"docsAlignmentCommitAuthorized":false,"gitStageAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"networkAuthorized":false,"ciPreviewAuthorized":false,"localDependencyInstallAuthorized":false,"protectedPathAccessAuthorized":false,"candidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"applicationMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"mainMutationAuthorized":false,"pullRequestAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"nextOwnerDecision":"approve-or-hold-p50j"} -->
