# Phase 4 P-50G Post-Ratification Small Repository Gate Authorization Proposal

**Status:** READY FOR OWNER REVIEW / P-50G NOT AUTHORIZED / NO GATE EXECUTED

**Prepared:** 2026-08-24

**Request ID:** `P50G-REQ-20260824-V1`

**Consumes only:** canonical P-50D V3 decision receipt
`P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1` in
[Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)

**Current branch / local HEAD / upstream:**
`codex/p12-production-authority-r2` /
`a12b022247d75d7e006fac890fc123e9c0a8e168` /
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443`

**Database, Production, network, Git write, or CI used to prepare this
proposal:** None

## 1. Why this proposal exists

The Owner's exact P-50D V3 ratification instructed the repository to stop
immediately after recording the decision. That stop remains authoritative.
The later Owner message `ทำต่อครับ` is interpreted narrowly as permission to
prepare this proposal for review, not as approval to execute a gate or any Git,
CI, application, database, or Production action.

P-50G separates three decisions that must not be collapsed:

1. prepare this proposal — completed locally by documentation/test-only edits;
2. authorize and run one offline/read-only small repository gate — pending the
   exact Owner approval in Section 7; and
3. authorize local commit/push and CI/Preview — a later P-50H decision that may
   only be prepared after P-50G passes and is never implied by P-50G.

<!-- P50G_PROPOSAL_PREPARATION_RECORD_V1 {"schema":"conduit-boq/p50g-proposal-preparation-record/v1","recordedAt":"2026-08-24","requestId":"P50G-REQ-20260824-V1","ownerContinuationInstructionReceived":true,"instructionText":"ทำต่อครับ","interpretation":"prepare-p50g-proposal-only","proposalPreparationAuthorized":true,"p50gGateAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"candidateApplicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false} -->

## 2. Frozen decision and data bindings

P-50G does not reopen price selection or candidate review. It consumes these
exact frozen bindings only:

| Binding | Frozen value |
|---|---|
| P-50D request | `P50D-REQ-20260823-V3` |
| P-50D manifest SHA-256 | `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429` |
| Selected-record SHA-256 | `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df` |
| Selected identity | `f2662c71-a6e5-407e-8456-8608e304b43b` / `ITEM-0429` / `COR-PB0-002` |
| Approved value delta | `0/1763/1763 -> 0/1764/1764`; name, unit, and material unchanged |
| P-50C candidate | `P50C-CANDIDATE-20260823-V1` |
| Candidate SHA-256 | `d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611` |
| Diff SHA-256 | `72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18` |
| Candidate-manifest SHA-256 | `d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5` |
| Retained scope | 709 other baseline rows; 48 unselected candidates; 18 retain-baseline evidence rows; 17 exclusions |
| Published / provisional | `2568.0.0` unchanged / `2568.1.0` provisional and registry-pending |
| Historical BOQ reprice | false |

The gate may verify these bindings but may not rebuild P-50R, select another
row, change a value, accept the target registry, apply the candidate, or create
an application/import payload.

## 3. Current prospective Git candidate inventory — evidence only

Read-only inventory found one coherent prospective package of `48` safe paths:
`25` tracked modifications and `23` untracked files. This is evidence for the
later P-50H proposal, not authority to stage or commit anything.

### 3.1 P-49/P-51 support documents — 15

- `docs/02_architecture/ADR/ADR-001-supabase-rls-authorization.md`
- `docs/03_domain/ACCESS_MODEL.md`
- `docs/04_data/DATABASE_SCHEMA.md`
- `docs/04_data/DATA_INTEGRITY.md`
- `docs/04_data/MIGRATIONS.md`
- `docs/04_data/SECURITY_MODEL.md`
- `docs/06_engineering/PERMISSION_PATTERNS.md`
- `docs/08_ai/LESSONS_LEARNED.md`
- `docs/CODEBASE_DATABASE_MAP.md`
- `docs/SECURITY.md`
- `docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md`
- `docs/plans/master-catalog/05-verification-report.md`
- `docs/plans/master-catalog/17-phase4-database-security-contract.md`
- `docs/plans/master-catalog/18-phase4-threat-model.md`
- `docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md`

### 3.2 P-50/P-51 authority-chain documents — 18

- `docs/plans/master-catalog/00-phase4-review-guide.md`
- `docs/plans/master-catalog/09-phase4-change-request.md`
- `docs/plans/master-catalog/11-phase4-reconciliation-report.md`
- `docs/plans/master-catalog/12-phase4-production-runbook.md`
- `docs/plans/master-catalog/13-phase4-verification-report.md`
- `docs/plans/master-catalog/15-phase4-admin-operating-procedure.md`
- `docs/plans/master-catalog/19-phase4-decision-register.md`
- `docs/plans/master-catalog/23-phase4-implementation-execution-pack.md`
- `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md`
- `docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md`
- `docs/plans/master-catalog/47-phase4-p49-forward-only-db-application-correction-proposal.md`
- `docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md`
- `docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md`
- `docs/plans/master-catalog/50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md`
- `docs/plans/master-catalog/51-phase4-p50d-2568-baseline-first-delta-review-proposal.md`
- `docs/plans/master-catalog/52-phase4-p50d-one-row-selected-delta-approval-proposal.md`
- `docs/plans/master-catalog/53-phase4-p50c-one-row-offline-candidate-result-record.md`
- `docs/plans/master-catalog/54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md`

### 3.3 Frozen evidence — 9

- `docs/plans/master-catalog/evidence/p50r-solo/SHA256SUMS`
- `docs/plans/master-catalog/evidence/p50r-solo/exceptions.json`
- `docs/plans/master-catalog/evidence/p50r-solo/proposed-delta-manifest.json`
- `docs/plans/master-catalog/evidence/p50r-solo/reconciliation.csv`
- `docs/plans/master-catalog/evidence/p50r-solo/summary.json`
- `docs/plans/master-catalog/evidence/p50d-v3/p50d-selected-delta-manifest.json`
- `docs/plans/master-catalog/evidence/p50c-v1/candidate.json`
- `docs/plans/master-catalog/evidence/p50c-v1/diff.json`
- `docs/plans/master-catalog/evidence/p50c-v1/manifest.json`

### 3.4 Offline scripts — 3

- `scripts/build-master-catalog-p50c.mjs`
- `scripts/reconcile-master-catalog-p50r.mjs`
- `scripts/reconcile-master-catalog-p50r-pdf.py`

### 3.5 Tests — 3

- `tests/master-catalog-authority-consistency.test.ts`
- `tests/master-catalog-p50r-reconciliation.test.ts`
- `tests/master-catalog-p50c-candidate.test.ts`

Do not use `git add .`. The prospective package intentionally excludes every
application/runtime/catalog/BOQ/pointer/Factor-F/Supabase/migration file,
`package.json`, lockfiles, official Excel/PDF files, and every path not named
above. Proposal/result/envelope files created after this inventory must be
listed and hash-bound separately by P-50H.

The pre-gate envelope contains one additional safe untracked path: this
Proposal #55. Therefore Section 4 expects exactly `25` tracked non-protected
drift paths with canonical newline-sorted path-list SHA-256
`38342e79f7a1138b689ac81141cc3a53fe848618f2819ad2b1af21890441f30a`,
and exactly `24` relevant safe untracked paths with path-list SHA-256
`e9ab9f0eb33e2aa65e27c906771e0e618cbd69cc033264822c9327fd9357cf5a`.
The latter is the `23` paths above plus this proposal. The `48` paths above
also have one canonical content-manifest SHA-256
`e758209a16bf4092458e3bab0fb945d138e15c888a094fe9b13bd6ad3d78fbca`; Proposal #55 is excluded from that
content manifest to avoid self-reference and is bound externally by the exact
Owner approval.

## 4. Exact P-50G command allowlist

If and only if the Owner returns the exact approval from Section 7 within the
window, replace the one proposal-hash placeholder below with the exact hash in
that approval, then run this whole block once as one non-interactive Bash
process, offline, from repository root. Do not run selected lines separately.
`set -euo pipefail` makes every failed preflight/check stop the block before any
later command runs.

```bash
set -euo pipefail

p50g_owner_approved_proposal_sha256="PROPOSAL_SHA256_FROM_EXACT_OWNER_APPROVAL"
test "$p50g_owner_approved_proposal_sha256" != "PROPOSAL_SHA256_FROM_EXACT_OWNER_APPROVAL"
test "$(shasum -a 256 docs/plans/master-catalog/55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md | awk '{print $1}')" = "$p50g_owner_approved_proposal_sha256"

test "$(git branch --show-current)" = "codex/p12-production-authority-r2"
test "$(git rev-parse HEAD)" = "a12b022247d75d7e006fac890fc123e9c0a8e168"
test "$(git rev-parse @{upstream})" = "6f0953b19c25f6f96b1d2d11ee99ff43c33c5443"
test "$(git rev-list --count @{upstream}..HEAD)" = "1"
test -z "$(git diff --cached --name-only)"

p50g_tracked_paths="$(
  git diff --name-only --no-ext-diff -- . \
    ':(top,exclude)files/**' \
    ':(top,exclude)output/**' \
    ':(top,exclude)outputs/**' \
    ':(top,exclude)tmp/**' |
    LC_ALL=C sort
)"
test "$(printf '%s\n' "$p50g_tracked_paths" | wc -l | tr -d ' ')" = "25"
test "$(printf '%s\n' "$p50g_tracked_paths" | shasum -a 256 | awk '{print $1}')" = "38342e79f7a1138b689ac81141cc3a53fe848618f2819ad2b1af21890441f30a"

p50g_safe_untracked_paths="$(
  git ls-files --others --exclude-standard -- \
    docs scripts tests \
    ':(top,glob)vitest.config.*' \
    ':(top,glob)vitest.workspace.*' \
    ':(top,glob)vite.config.*' \
    ':(top,glob)eslint.config.*' \
    ':(top,glob).eslintrc*' \
    ':(top,glob)tsconfig*.json' \
    ':(top)package.json' \
    ':(top)package-lock.json' |
    LC_ALL=C sort
)"
test "$(printf '%s\n' "$p50g_safe_untracked_paths" | wc -l | tr -d ' ')" = "24"
test "$(printf '%s\n' "$p50g_safe_untracked_paths" | shasum -a 256 | awk '{print $1}')" = "e9ab9f0eb33e2aa65e27c906771e0e618cbd69cc033264822c9327fd9357cf5a"

p50g_base_untracked_paths="$(
  printf '%s\n' "$p50g_safe_untracked_paths" |
    grep -Fvx 'docs/plans/master-catalog/55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md'
)"
p50g_base_content_manifest_sha256="$(
  printf '%s\n%s\n' "$p50g_tracked_paths" "$p50g_base_untracked_paths" |
    xargs shasum -a 256 |
    shasum -a 256 |
    awk '{print $1}'
)"
test "$p50g_base_content_manifest_sha256" = "e758209a16bf4092458e3bab0fb945d138e15c888a094fe9b13bd6ad3d78fbca"

./node_modules/.bin/vitest run \
  tests/master-catalog-authority-consistency.test.ts \
  tests/master-catalog-p50r-reconciliation.test.ts \
  tests/master-catalog-p50c-candidate.test.ts

./node_modules/.bin/eslint \
  tests/master-catalog-authority-consistency.test.ts \
  tests/master-catalog-p50r-reconciliation.test.ts \
  tests/master-catalog-p50c-candidate.test.ts \
  scripts/build-master-catalog-p50c.mjs \
  scripts/reconcile-master-catalog-p50r.mjs

node scripts/build-master-catalog-p50c.mjs --check

python3 -c 'import ast, pathlib; ast.parse(pathlib.Path("scripts/reconcile-master-catalog-p50r-pdf.py").read_text())'

git diff --check -- . \
  ':(top,exclude)files/**' \
  ':(top,exclude)output/**' \
  ':(top,exclude)outputs/**' \
  ':(top,exclude)tmp/**'
```

Expected focused result is `3` test files / `30` tests and deterministic P-50C
output of `710` rows / `1` value delta with candidate SHA-256
`d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`.

The command allowlist does not include the real P-50R reconciler,
`SHA256SUMS` verification against source inputs, a dependency install, a full
build, Git staging, or any remote command. Those omissions are intentional:
real P-50R replay would require protected source inputs, and Git/CI belongs to
P-50H. A broad repository TypeScript scan is also intentionally omitted: the
current `tsconfig.json` uses repository-wide globs that could traverse protected
directories. The three explicit TypeScript test files are instead compiled by
Vitest and linted by ESLint within this bounded gate.

## 5. Access, mutation, and result-recording boundary

P-50G is offline and read-only with respect to application, data, Git, and
external systems. It may read repository source/configuration needed by the
listed tools and installed local dependencies. It must not read or traverse:

- `files/`
- `output/`
- `outputs/`
- `tmp/`

After the commands finish, P-50G may make only these documentation outputs:

- create `docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md`;
- update `docs/plans/master-catalog/00-phase4-review-guide.md`;
- update `docs/plans/master-catalog/19-phase4-decision-register.md`;
- update `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md`.

The authority test is deliberately excluded from post-gate result recording.
P-50G must not change any test, script, application, runtime, migration, or
data/evidence byte after the listed checks pass. P-50H preparation may propose
a later exact test/document alignment, but it must validate that separately.

On PASS only, P-50G may additionally prepare, but not execute:

- `docs/plans/master-catalog/57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md`;
- `docs/plans/master-catalog/evidence/p50h-v1/git-payload-manifest.json`.

P-50H must bind the complete prospective commit path/hash manifest and the
whole pushed ancestry. The current branch is already one commit ahead, so a
normal push would publish both existing unpushed commit
`a12b022247d75d7e006fac890fc123e9c0a8e168` and the later atomic evidence
commit relative to upstream
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443`. P-50G does not authorize either
commit or that push. P-50H must also require exact-manifest staging, compare
the staged paths to its allowlist, and run `git diff --cached --check` so
untracked files are covered only after separately authorized staging.

## 6. Fail-closed rules and time boundary

Stop without correction, continuation, staging, or remote access if any of the
following occurs:

- branch, local HEAD, or upstream differs from the values at the top;
- exact Owner approval is absent, ambiguous, expired, or narrower than this
  request;
- a listed command needs an install or network access;
- any check fails or any frozen identifier/hash/count differs;
- either canonical path-list hash or the 48-path content-manifest hash differs;
- protected source input or a real P-50R replay becomes necessary;
- a security trigger or unrelated Production deployment ends the P-51 waiver;
- the authorization window or the P-51 waiver expires.

P-50G rejects drift in every tracked non-protected path and in every relevant
safe untracked `docs`/`scripts`/`tests` or root tool-config path before loading
the test/lint tools. It also binds the bytes of all `48` pre-proposal package
paths. These checks use Git pathspecs that exclude protected directories and
must not traverse them. Full commit-envelope byte hashing, including Proposal
#55 and later result/envelope files, remains deferred to P-50H, where separately
authorized exact staging must cover every byte. P-50G may not stage anything.

Requested P-50G window begins at the timestamp of the exact Owner approval and
ends at **2026-08-25 23:00:00 +07**, before the P-51 calendar ceiling of
**2026-08-25 23:59:59 +07**. This proposal does not renew or extend P-51. If
the gate is incomplete at the earlier boundary, stop and obtain fresh Owner
direction; do not rush or infer an extension.

On FAIL, record only the truthful P-50G result and stop. On PASS, record the
truthful result and prepare P-50H/its manifest only. PASS does not authorize
P-50H execution or any other gate.

## 7. Short hash-bound Owner decision

Because a document cannot embed its own SHA-256 without changing that hash,
the review handoff reports Proposal #55's final SHA-256 externally. Replace
`PROPOSAL_SHA256_FROM_REVIEW_HANDOFF` below with that exact 64-hex value.

The only Owner text required is this one-line short form:

> APPROVE P-50G — P50G-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF

No long approval paragraph is required. If and only if the request ID and the
full 64-hex SHA-256 exactly match the current reviewed Proposal #55, that short
form means all of the following without requiring the Owner to repeat them:

- approve Sections 2-6 exactly;
- start the one-time authorization window at the approval-message timestamp and
  end it at `2026-08-25 23:00:00 +07`;
- authorize only the one offline/read-only Section 4 gate and Section 5
  documentation/result preparation;
- retain every Section 5-6 exclusion and fail-closed rule, including no protected-path access, install, network,
  DB/Production, source/data/candidate
  application, Git stage/commit/push, CI/Preview, P-13/P-14/P-14C/P-15,
  deployment, publication, waiver extension, or automatic continuation; and
- on FAIL, record the truthful result and stop; on PASS, record it and prepare
  P-50H plus its exact manifest for separate review without executing P-50H.

A missing/wrong request ID, abbreviated/wrong hash, extra authority, expired
window, or any other approval wording is not sufficient and must fail closed.
The short form authorizes no action beyond the exact Proposal #55 bytes it
hash-binds.

<!-- P50G_SMALL_REPOSITORY_GATE_AUTHORIZATION_PROPOSAL_V1 {"schema":"conduit-boq/p50g-small-repository-gate-authorization-proposal/v1","recordedAt":"2026-08-24","requestId":"P50G-REQ-20260824-V1","status":"ready-for-owner-review","ownerApprovalPending":true,"p50gGateAuthorized":false,"canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","p50dRequestId":"P50D-REQ-20260823-V3","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50dManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","branch":"codex/p12-production-authority-r2","localHead":"a12b022247d75d7e006fac890fc123e9c0a8e168","upstreamHead":"6f0953b19c25f6f96b1d2d11ee99ff43c33c5443","branchAheadBy":1,"shellFailFastRequired":true,"proposalSha256BindingMode":"external-owner-approval","ownerApprovalForm":"short-hash-bound-v1","shortApprovalTemplate":"APPROVE P-50G — P50G-REQ-20260824-V1 — SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF","approvalRequiresExactRequestId":true,"approvalRequiresFullProposalSha256":true,"shortApprovalExpandsToSections2Through6":true,"longApprovalRequired":false,"gitStatePreflightRequired":true,"indexMustBeEmpty":true,"preGateTrackedPathAllowlistRequired":true,"preGateRelevantUntrackedPathAllowlistRequired":true,"trackedPathListSha256":"38342e79f7a1138b689ac81141cc3a53fe848618f2819ad2b1af21890441f30a","preGateSafeUntrackedPathCount":24,"safeUntrackedPathListSha256":"e9ab9f0eb33e2aa65e27c906771e0e618cbd69cc033264822c9327fd9357cf5a","prospectivePackageContentManifestSha256":"e758209a16bf4092458e3bab0fb945d138e15c888a094fe9b13bd6ad3d78fbca","fullPayloadByteHashInventoryDeferredToP50h":true,"unexpectedPathInventoryDeferredToP50h":false,"prospectiveSafePathCount":48,"trackedModifiedPathCount":25,"untrackedSafePathCount":23,"focusedTestFileCount":3,"expectedFocusedTestCount":30,"offlineOnly":true,"readOnlyGate":true,"dependencyInstallAuthorized":false,"protectedPathAccessAuthorized":false,"realP50rReplayAuthorized":false,"broadTypeScriptScanIncluded":false,"broadTypeScriptScanAuthorized":false,"testMutationAfterGateAuthorized":false,"resultRecordPath":"docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md","onPassPreparationOnly":["docs/plans/master-catalog/57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md","docs/plans/master-catalog/evidence/p50h-v1/git-payload-manifest.json"],"windowBegins":"exact-owner-approval-message-timestamp","windowEnds":"2026-08-25T23:00:00+07:00","p51WaiverExtended":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"gitStageAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"candidateApplicationAuthorized":false,"applicationMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"p50hExecutionAuthorized":false,"automaticNextStep":false,"nextOwnerDecision":"approve-or-hold-p50g"} -->
