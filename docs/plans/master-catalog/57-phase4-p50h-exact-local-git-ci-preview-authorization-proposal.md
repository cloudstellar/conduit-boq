# Phase 4 P-50H Exact Local Git/CI Preview Authorization Proposal

**Status:** READY FOR OWNER REVIEW / EXECUTION NOT AUTHORIZED / CURRENT TREE
NOT COMMIT-READY

**Prepared:** 2026-08-24

**Request ID:** `P50H-REQ-20260824-V1`

**Manifest:**
[`evidence/p50h-v1/git-payload-manifest.json`](./evidence/p50h-v1/git-payload-manifest.json)

## 1. Decision in plain language

P-50G passed, but its truthful result synchronization changed the current
status wording after the gate. Proposal #55 explicitly prohibited changing the
authority test during result recording. The repository is therefore expected
to be one exact test-alignment patch away from a releasable Git payload.

This proposal asks for one later, explicit P-50H decision that would authorize
only this sequence:

1. verify the exact current branch, commit, manifest, and test preimage;
2. apply the exact authority-test patch in Section 5;
3. run the small focused validation in Section 6;
4. stage only the manifest's `52` non-protected paths;
5. create one local commit with the exact message in Section 6;
6. push that commit to the current feature branch and observe the resulting
   Quality/Preview status;
7. stop.

Nothing in this prepared proposal authorizes that sequence yet.

## 2. Frozen basis

- [P-50G Proposal #55](./55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md)
  SHA-256:
  `5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc`.
- [P-50G Result #56](./56-phase4-p50g-small-repository-gate-result.md):
  `PASS`, authorization consumed once, replay forbidden.
- Branch: `codex/p12-production-authority-r2`.
- Local HEAD: `a12b022247d75d7e006fac890fc123e9c0a8e168`.
- Upstream: `origin/codex/p12-production-authority-r2` at
  `6f0953b19c25f6f96b1d2d11ee99ff43c33c5443`.
- Local branch is ahead by `1`; a future push would publish the existing
  unpushed `a12b022` decision-record commit as well as the new P-50H commit.
- Index must remain empty until the exact staging step.
- Published/current Master Catalog remains `2568.0.0` at
  `ITEM-0429 = 0/1763/1763`.
- `P50C-CANDIDATE-20260823-V1` remains provisional local review evidence only,
  with `ITEM-0429 = 0/1764/1764` and the registry check still pending.

## 3. Exact manifest and no-cycle binding

The manifest contains the complete sorted list of `52` prospective commit
paths. It carries exact Git mode, byte length, and target SHA-256 for `51`
paths. The manifest deliberately excludes only its own byte hash to avoid a
self-reference cycle.

The binding is:

```text
exact Section 5 patch + current payload bytes -> 51 target entry hashes
51 target entries + complete 52-path inventory -> manifest bytes
exact Owner approval -> SHA-256(Proposal #57) + SHA-256(manifest)
```

Proposal #57 itself is one of the `51` hashed manifest entries. The manifest
path is the fifty-second commit path and its full hash must be supplied by the
external Owner approval. Thus every prospective commit byte is covered without
either file hashing itself.

Current manifest state is intentionally:

- `workspaceMatchesTarget: false`;
- `pendingTargetPaths` contains only
  `tests/master-catalog-authority-consistency.test.ts`;
- `commitReady: false`;
- P-50H execution and every Git/network permission are `false`.

## 4. Exact authority-test target

| Field | Exact value |
|---|---|
| Path | `tests/master-catalog-authority-consistency.test.ts` |
| Current/preimage bytes | `198366` |
| Current/preimage SHA-256 | `0af6c62224b7db661f10822c70ee63a34f24f904e9645896105646e1a03abf88` |
| Target bytes | `200931` |
| Target SHA-256 | `012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a` |
| Permitted semantic change | Replace stale P-50G-pending assertions with P-50G PASS/consumed assertions; verify Result #56; include #56/#57 in authority-link checks |

Any preimage, patch result, byte length, or target-hash mismatch is a hard stop.

## 5. Exact test-alignment patch

Only the following patch may be applied. No production code, script, existing
evidence, candidate, migration, catalog, BOQ, pointer, or Factor F byte may be
changed.

```diff
--- a/tests/master-catalog-authority-consistency.test.ts
+++ b/tests/master-catalog-authority-consistency.test.ts
@@
-      'P-51D -> P-50R SOLO complete -> V2 one-row selection intent -> P-50D V3 exact Owner ratification complete/P-50C accepted only as local review evidence -> P-50G proposal ready / await exact Owner approval',
+      'P-51D -> P-50R SOLO complete -> V2 one-row selection intent -> P-50D V3 exact Owner ratification complete/P-50C accepted only as local review evidence -> P-50G PASS/authorization consumed -> review separately prepared P-50H proposal',
@@
-      'Only a later approved P-50G may prepare P-50H',
+      'P-50G PASS/authorization consumed',
@@
-      'P-50H, P-13/P-14/P-14C, P-15',
+      'P-50H execution, P-13/P-14/P-14C, P-15',
@@
     expect(p50gProposal).not.toContain('documentation/test outputs')
-
+
+    const p50gResultPath =
+      'docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md'
+    const p50gResult = read(p50gResultPath)
+    const p50gResultMatch = p50gResult.match(
+      /<!-- P50G_SMALL_REPOSITORY_GATE_RESULT_V1 (\{[^\n]+\}) -->/,
+    )
+    expect(
+      p50gResult.match(/<!-- P50G_SMALL_REPOSITORY_GATE_RESULT_V1 /g),
+    ).toHaveLength(1)
+    expect(p50gResultMatch).not.toBeNull()
+    const p50gResultRecord = JSON.parse(p50gResultMatch![1])
+    expect(p50gResultRecord).toMatchObject({
+      schema: 'conduit-boq/p50g-small-repository-gate-result/v1',
+      requestId: 'P50G-REQ-20260824-V1',
+      approvedProposalSha256:
+        '5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc',
+      approvalValid: true,
+      authorizationConsumed: true,
+      authorizationReplayAllowed: false,
+      gateExecuted: true,
+      gatePassed: true,
+      focusedTestFileCount: 3,
+      focusedTestCount: 30,
+      postResultAuthorityTestAlignmentRequired: true,
+      commitReady: false,
+      p50hProposalPreparationAuthorized: true,
+      p50hProposalPrepared: true,
+      p50hExecutionAuthorized: false,
+      nextOwnerDecision: 'review-p50h-proposal',
+    })
+    for (const field of [
+      'authorizationReplayAllowed',
+      'protectedPathAccessed',
+      'candidateApplied',
+      'commitReady',
+      'p50hExecutionAuthorized',
+      'gitStageAuthorized',
+      'localCommitAuthorized',
+      'externalGitPublicationAuthorized',
+      'ciPreviewAuthorized',
+      'databaseAccessAuthorized',
+      'productionReadAuthorized',
+      'productionWriteAuthorized',
+      'networkAuthorized',
+      'applicationMutationAuthorized',
+      'catalogMutationAuthorized',
+      'boqMutationAuthorized',
+      'pointerMutationAuthorized',
+      'factorFMutationAuthorized',
+      'p13Authorized',
+      'p14Authorized',
+      'p14cAuthorized',
+      'p15Authorized',
+      'deployAuthorized',
+      'publicationAuthorized',
+      'automaticNextStep',
+    ]) {
+      expect(p50gResultRecord[field], `P50G result.${field}`).toBe(false)
+    }
+    expect(p50gResult.trimEnd().endsWith(p50gResultMatch![0])).toBe(true)
+    expect(p50gResult).toContain('not commit-ready')
+
@@
       expect(authority).toContain(
         './55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md',
       )
+      expect(authority).toContain(
+        './56-phase4-p50g-small-repository-gate-result.md',
+      )
+      expect(authority).toMatch(/P-50G[\s\S]{0,240}(?:PASS|passed)/i)
       expect(authority).toMatch(
-        /one-line[\s\S]{0,120}(?:full[- ]hash|full[\s\S]{0,20}SHA-256)/i,
+        /P-50G[\s\S]{0,300}(?:consumed once|authorization consumed)/i,
       )
@@
-      /P-50G[^\n]{0,240}(?:not approved|pending exact Owner approval)/i,
+      /P-50G[^\n]{0,240}PASS\/authorization consumed/i,
@@
-      '**READY FOR OWNER REVIEW / NOT AUTHORIZED / NOT EXECUTED.**',
+      '**PASS / AUTHORIZATION CONSUMED ONCE / NO REPLAY.**',
@@
       'docs/plans/master-catalog/55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md',
+      'docs/plans/master-catalog/56-phase4-p50g-small-repository-gate-result.md',
+      'docs/plans/master-catalog/57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md',
```

## 6. Exact future execution envelope

This section is a request, not current authority. If and only if the Owner
returns the exact Section 8 approval while the window is open, one P-50H run
may do the following in order:

1. Verify the exact request ID, full Proposal #57 SHA-256, full manifest
   SHA-256, branch, local HEAD, upstream HEAD, ahead count `1`, and empty index.
2. Verify all current manifest entries and the authority-test preimage hash.
3. Apply only Section 5; verify the target byte length/SHA-256 and confirm that
   all `52` manifest paths now match their target state.
4. Run only this small local validation:

   - Vitest:
     `tests/master-catalog-authority-consistency.test.ts`,
     `tests/master-catalog-p50r-reconciliation.test.ts`, and
     `tests/master-catalog-p50c-candidate.test.ts`; expected `3` files / `30`
     tests;
   - ESLint on those three tests plus
     `scripts/build-master-catalog-p50c.mjs` and
     `scripts/reconcile-master-catalog-p50r.mjs`;
   - `node scripts/build-master-catalog-p50c.mjs --check`;
   - Python AST syntax parse of
     `scripts/reconcile-master-catalog-p50r-pdf.py`;
   - scoped `git diff --check` over the exact manifest paths.

5. Stage exactly the manifest's `52` paths. Compare the staged path list,
   modes, byte lengths, and hashes to the manifest plus the externally approved
   manifest hash. Any extra, missing, protected, or mismatched path stops the
   run before commit.
6. Create exactly one commit with message:
   `master-catalog: record P-50 reconciliation package`.
7. Verify the new commit has parent
   `a12b022247d75d7e006fac890fc123e9c0a8e168`, contains exactly those `52`
   paths, and matches the staged target hashes.
8. Push only `HEAD` to
   `origin/codex/p12-production-authority-r2`. This publishes both the existing
   unpushed `a12b022` commit and the one new P-50H commit; it does not update
   `main` or open/merge a pull request.
9. Observe the repository's `Quality` workflow for the exact new commit. That
   workflow runs `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
   An already configured non-Production Preview status may be observed
   read-only; P-50H does not authorize Production deployment or configuration
   changes.
10. Stop after reporting the exact commit SHA, remote branch equality, and
    Quality/Preview outcome. Do not start P-13 or any other gate.

The execution window would begin at the timestamp of the matching Owner
approval and end at `2026-08-25T23:00:00+07:00`. It does not extend the P-51
waiver deadline.

## 7. Fail-closed and excluded scope

Stop without commit/push if any approval hash, branch, HEAD, upstream, path,
mode, byte length, content hash, validation, staged diff, or CI condition
differs. A failed or interrupted push may be retried only if the local commit
and remote branch still prove the same exact state and the window remains open;
otherwise obtain fresh Owner authority.

Even a future matching P-50H approval would not authorize:

- reading/traversing or staging protected `files/`, `output/`, `outputs/`, or
  `tmp/`;
- applying/importing the P-50C candidate or changing any catalog, BOQ, pointer,
  Factor F, runtime, migration, database, or Production state;
- changing the target registry, creating official Excel/PDF, or publishing a
  catalog;
- modifying `main`, opening/merging a PR, deploying, or changing feature flags;
- P-13, P-14, P-14C, P-15, P-49 implementation, waiver extension, or any
  automatic next step.

## 8. Simple Owner response

The review handoff must report the current full SHA-256 of this proposal and
the current full SHA-256 of the manifest. To approve Sections 2-7 exactly, the
Owner may reply with one line:

> APPROVE P-50H — P50H-REQ-20260824-V1 — PROPOSAL SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF — MANIFEST SHA-256 MANIFEST_SHA256_FROM_REVIEW_HANDOFF

Both values must be full lowercase 64-hex SHA-256 values and match the exact
reviewed files. No long approval paragraph is required. Any other response,
partial hash, expired window, or byte drift is HOLD.

<!-- P50H_EXACT_LOCAL_GIT_CI_PREVIEW_AUTHORIZATION_PROPOSAL_V1 {"schema":"conduit-boq/p50h-exact-local-git-ci-preview-authorization-proposal/v1","recordedAt":"2026-08-24","requestId":"P50H-REQ-20260824-V1","status":"ready-for-owner-review","ownerApprovalPending":true,"proposalSha256BindingMode":"external-owner-approval","manifestSha256BindingMode":"external-owner-approval","ownerApprovalForm":"short-dual-hash-bound-v1","shortApprovalTemplate":"APPROVE P-50H — P50H-REQ-20260824-V1 — PROPOSAL SHA-256 PROPOSAL_SHA256_FROM_REVIEW_HANDOFF — MANIFEST SHA-256 MANIFEST_SHA256_FROM_REVIEW_HANDOFF","approvalRequiresExactRequestId":true,"approvalRequiresFullProposalSha256":true,"approvalRequiresFullManifestSha256":true,"branch":"codex/p12-production-authority-r2","localHead":"a12b022247d75d7e006fac890fc123e9c0a8e168","upstream":"origin/codex/p12-production-authority-r2","upstreamHead":"6f0953b19c25f6f96b1d2d11ee99ff43c33c5443","branchAheadBy":1,"indexMustBeEmpty":true,"commitPathCount":52,"manifestPayloadEntryCount":51,"manifestSelfExcluded":true,"manifestPath":"docs/plans/master-catalog/evidence/p50h-v1/git-payload-manifest.json","authorityTestPath":"tests/master-catalog-authority-consistency.test.ts","authorityTestPreimageSha256":"0af6c62224b7db661f10822c70ee63a34f24f904e9645896105646e1a03abf88","authorityTestTargetSha256":"012cf89cc9521618571b8640e599c568ff4cbb326682b5ed6a3752030df1950a","authorityTestPreimageBytes":198366,"authorityTestTargetBytes":200931,"workspaceMatchesTarget":false,"pendingTargetPathCount":1,"commitReady":false,"expectedFocusedTestFileCount":3,"expectedFocusedTestCount":30,"commitMessage":"master-catalog: record P-50 reconciliation package","pushTarget":"origin/codex/p12-production-authority-r2","pushPublishesExistingUnpushedCommit":true,"qualityWorkflow":".github/workflows/quality.yml","qualityCommands":["npm ci","npm run lint","npm test","npm run build"],"windowBegins":"exact-owner-approval-message-timestamp","windowEnds":"2026-08-25T23:00:00+07:00","p51WaiverExtended":false,"authorityTestAlignmentAuthorized":false,"p50hExecutionAuthorized":false,"gitStageAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"networkAuthorized":false,"ciPreviewAuthorized":false,"protectedPathAccessAuthorized":false,"candidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"applicationMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"mainMutationAuthorized":false,"pullRequestAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"p49ImplementationAuthorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"nextOwnerDecision":"approve-or-hold-p50h"} -->
