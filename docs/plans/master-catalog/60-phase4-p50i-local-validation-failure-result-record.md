# Phase 4 P-50I Local Validation Failure Result Record

**Status:** AUTHORIZATION CONSUMED ONCE / PREFLIGHT PASS / EXACT PATCH APPLIED /
TARGET HASH PASS / LOCAL GATE FAIL / NO STAGE OR GIT PUBLICATION / P-13 HARD
HOLD

**Recorded:** 2026-08-24

**Request:** `P50I-REQ-20260824-V1`

**Approved Proposal SHA-256:**
`dad63f43fc384ffb2a13296153fde23aa631356835b16d22eb1578f9dc53c523`

## 1. Exact preflight result

The Owner's exact approval was observed inside the authorized window at
`2026-08-24T11:35:44+07:00`. Before mutation, all frozen conditions passed:

- branch `codex/p12-production-authority-r2`;
- local, upstream, and live remote HEAD
  `2b45f9b1679d12caac933568e89e1065d74dbd74`;
- ahead/behind `0/0`; index empty;
- failed Quality run `32661774094` was the completed `push` run for that exact
  branch/SHA with conclusion `failure`;
- Proposal #59, its 11-path list, the ten-entry content root, every frozen
  mode/byte/hash, and the authority-test preimage all matched exactly.

No protected path or ignored snapshot was opened. Network use before the
failure was limited to the approved read-only remote/run identity checks.

## 2. Exact mutation and target proof

The Section 3 zero-context patch was checked and applied once with the approved
`--recount --unidiff-zero` semantics. Only
`tests/master-catalog-authority-consistency.test.ts` changed.

| Field | Value |
|---|---|
| Preimage | `200931` bytes / `012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a` |
| Applied target | `207633` bytes / `cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4` |
| Target match | PASS |

The target remains an uncommitted working-tree change. It was not staged.

## 3. Fail-fast local validation result

| Check | Result |
|---|---|
| Authority test | **FAIL:** `22` total; `21` passed / `1` failed |
| P-50 set | **FAIL:** `3` files / `31` tests; `2` files and `30` tests passed, the same authority test failed |
| Focused ESLint | PASS |
| Deterministic P-50C check | PASS: `710` rows / exactly `1` value delta / candidate `d7a19a9d...` |
| Remaining whitespace/staging checks | NOT RUN after the required local gate failed |

The failing assertion expected one occurrence of the P-50I proposal marker
name, but Proposal #59 truthfully contains three textual occurrences:

1. the marker parser shown inside its frozen diff;
2. the marker-count regex shown inside the same frozen diff;
3. the actual EOF marker.

Independent read-only proof returned `rawCount=3`, `anchoredCount=1`, and a
valid JSON EOF marker. This is a self-reference/counting defect in the new test,
not a data-binding, CSV, candidate, application, or Production defect.

## 4. Stop boundary and repository state

The failed required check stopped P-50I before staging. No commit, push,
automatic new-SHA Quality run, new Preview, amend, force-push, rollback, or
rerun occurred. Local HEAD, upstream, and live remote remain `2b45f9b...`; the
index remains empty.

P-50I authorization is consumed and cannot be replayed. The applied test target
is retained uncommitted so that a separately reviewed forward correction can
bind its exact preimage. Published/current `2568.0.0`, the P-50C evidence,
catalog/BOQ/pointer/Factor F, database, Production, flags, and historical BOQs
remain unchanged.

P-13/P-14/P-14C/P-15, candidate application, Production access, deployment,
publication, and automatic continuation remain unauthorized. The next Owner
decision is only the separately frozen [P-50J repository correction Proposal
#61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md).

<!-- P50I_LOCAL_VALIDATION_FAILURE_RESULT_V1 {"schema":"conduit-boq/p50i-local-validation-failure-result/v1","recordedAt":"2026-08-24T11:37:42+07:00","requestId":"P50I-REQ-20260824-V1","approvedProposalSha256":"dad63f43fc384ffb2a13296153fde23aa631356835b16d22eb1578f9dc53c523","authorizationConsumed":true,"authorizationReplayAllowed":false,"preflightPassed":true,"branch":"codex/p12-production-authority-r2","baseHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","liveRemoteHeadMatched":true,"failedQualityRunId":32661774094,"exactPatchApplied":true,"authorityTestPreimageBytes":200931,"authorityTestPreimageSha256":"012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a","authorityTestAppliedTargetBytes":207633,"authorityTestAppliedTargetSha256":"cdcd110e82b0a4bfe0f1f7f27dfda00a2bd18133d985477a447a08ad56144ea4","authorityTestPassed":false,"authorityTestPassCount":21,"authorityTestFailCount":1,"focusedTestFileCount":3,"focusedTestCount":31,"focusedTestPassCount":30,"focusedTestFailCount":1,"focusedEslintPassed":true,"p50cCheckPassed":true,"failureClassification":"proposal-self-marker-name-count-not-line-anchored","rawMarkerNameCount":3,"anchoredMarkerCount":1,"dataBindingFailure":false,"catalogCorruption":false,"testWorkingTreeTargetRetained":true,"gitStageOccurred":false,"localCommitOccurred":false,"externalGitPublicationOccurred":false,"newQualityRunOccurred":false,"newPreviewOccurred":false,"indexEmpty":true,"currentHead":"2b45f9b1679d12caac933568e89e1065d74dbd74","p50jProposalPrepared":true,"p50jExecutionAuthorized":false,"protectedPathAccessOccurred":false,"ignoredSnapshotReadOccurred":false,"candidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"applicationMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"mainMutationAuthorized":false,"pullRequestAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"nextOwnerDecision":"review-p50j-proposal"} -->
