# Phase 4 P-51 Public-Safe Git Authorization Receipt

**Status:** PUBLIC-REPOSITORY SAFETY GATE APPLIED / EXACT 15-PATH RELEASE
PACKAGE AUTHORIZED / NO COMMIT OR PUSH YET / STOP BEFORE DATA WRITE OR P-15

**Request:** `P51GIT-SAFE-REQ-20260826-V1`

**Recorded:** `2026-08-26T02:42:32+07:00`

## 1. Why the package was reduced

The Owner authorized continuing when the checks pass. The first staged package
contained `56` paths. An independent pre-commit review then confirmed that the
GitHub repository is public and found newly added operator identity and live
Production account/BOQ identifiers in the historical P-13 evidence chain.
Those values are not credentials, but committing them would retain personal and
operational data permanently in public Git history.

The first package therefore did **not** pass the public-repository safety gate.
No commit or push occurred and the one-use Git authority was not consumed. This
receipt narrows the release to the coherent P-51 print-layout and offline
candidate package below. The excluded local records remain uncommitted and are
not part of this public release.

## 2. Exact release binding

| Binding | Exact value |
|---|---|
| Required local base `HEAD` | `c78cfca4624075053c5f5d3a2210ca9fac225cb4` |
| Required fetched `origin/main` preimage | `c78cfca4624075053c5f5d3a2210ca9fac225cb4` |
| Current local branch | `codex/p51-option-a-closeout`; upstream `origin/main` |
| Result #81 | `8834` bytes / SHA-256 `2f8145704284057fa12f83296c3c1ebd57a19b4e4851635fd8498d92c5d99b04` |
| Final public-safe package | exactly `15` paths |
| Commit shape | one non-merge commit whose first parent is the required base |
| Push | one non-force `HEAD:refs/heads/main` attempt only |

## 3. Exact public-safe path set

Only these paths may be staged and committed:

1. `app/admin/master-catalog/versions/[versionId]/print/PrintDocument.tsx`
2. `app/admin/master-catalog/versions/[versionId]/print/page.tsx`
3. `docs/plans/master-catalog/19-phase4-decision-register.md` — only the
   public-safe Option A/PDF decision block is staged; the other local deltas in
   this file remain unstaged
4. `docs/plans/master-catalog/20-phase4-official-export-spec.md`
5. `docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md`
6. `docs/plans/master-catalog/81-phase4-p51-option-a-local-successor-candidate-result.md`
7. `docs/plans/master-catalog/82-phase4-p51-git-only-owner-authorization-receipt.md`
8. `docs/plans/master-catalog/evidence/p51-option-a-v1/candidate.json`
9. `docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json`
10. `docs/plans/master-catalog/evidence/p51-option-a-v1/manifest.json`
11. `lib/master-catalog/export/pdfLayout.ts`
12. `scripts/build-master-catalog-p51-option-a-candidate.mjs`
13. `tests/master-catalog-p51-option-a-candidate.test.ts`
14. `tests/master-catalog-pdf-layout.test.ts`
15. `tests/master-catalog-print-draft-contract.test.ts`

The protected roots `files/`, `output/`, `outputs/`, and `tmp/` remain outside
the path set. Broad staging commands remain prohibited. The older P-13
discovery/result documents, normalized live evidence, Gate 2 binary artifacts,
large cross-cutting trackers, and unrelated utilities/tests are deliberately
excluded from this public release. Their exclusion does not reverse or replay
any completed Production operation; it only prevents unsafe public retention.

## 4. Required checks before commit

The exact staged snapshot—not the broader local working file—must pass:

1. staged-path equality with the 15-path list and exact public-safe staged blob
   verification for the intentionally partial-staged Decision Register;
2. zero protected paths;
3. no newly introduced personal name, credential, or Production account/BOQ
   identifier compared with the existing public `origin/main` snapshot;
4. `git diff --cached --check`;
5. candidate freshness and deterministic fail-closed checks;
6. focused tests for candidate generation, PDF category grouping/local
   numbering, and the print contract;
7. full tests, TypeScript, and ESLint from the exact staged snapshot;
8. a fresh remote-main race check.

### Completed pre-commit evidence — `2026-08-26T03:15:29+07:00`

- staged path set matched `15/15`; protected paths `0`;
- direct new personal/secret findings `0`; newly introduced UUIDs `0`;
- staged diff check passed;
- deterministic candidate check passed at `710` rows / `49` baseline changes /
  `48` D002-additional changes;
- focused validation passed `3` files / `23` tests;
- full exact-snapshot validation passed `43` files / `334` tests;
- TypeScript and ESLint passed.

Only the final fresh remote-main race check remains before commit. Commit
metadata must use the public repository identity
`Cloudstellar <cloudstellar@users.noreply.github.com>` for this commit so no
new personal author metadata is introduced.

If any check fails or `origin/main` moves, stop before push. No rebase, merge,
force operation, rollback, replacement push, or path expansion is allowed.

## 5. What may happen after a pass

After the checks pass, one commit and one non-force push to GitHub `main` may be
performed. The automatic Vercel deployment caused by the GitHub push is
allowed; direct Vercel commands are not. Post-deployment verification is
read-only and limited to confirming the deployed page loads, authentication is
still enforced, category-code headings/grouping/local numbering are present,
and no framework or console error appears.

If deployment verification passes, preparation of the next exact D002
read-only/application proposal may continue locally. This receipt does not
authorize reading or writing the database, applying any candidate, changing
D002, feature flags, BOQs, pointers, Factor F, Auth/RLS, entering P-15, or
publishing the catalog.

<!-- P51_PUBLIC_SAFE_GIT_AUTHORIZATION_RECEIPT_V1 {"schema":"conduit-boq/p51-public-safe-git-authorization-receipt/v1","recordNumber":82,"requestId":"P51GIT-SAFE-REQ-20260826-V1","recordedAt":"2026-08-26T02:42:32+07:00","sourceAuthority":"OWNER_MESSAGES_AFTER_RESULT_81_CONTINUE_WHEN_CHECKS_PASS","status":"AUTHORIZED_PUBLIC_SAFE_SUBSET_NOT_COMMITTED_OR_PUSHED","initialPackagePathCount":56,"initialPublicRepositorySafetyGatePassed":false,"initialCommitCreated":false,"initialPushAttempted":false,"initialAuthorityConsumed":false,"publicRepositoryConfirmed":true,"publicRepositoryUrl":"https://github.com/cloudstellar/conduit-boq","safetyAction":"REDUCE_TO_COHERENT_P51_PUBLIC_SAFE_SUBSET","excludedPathCount":41,"excludedLocalRecordsRemainUncommitted":true,"result81Path":"docs/plans/master-catalog/81-phase4-p51-option-a-local-successor-candidate-result.md","result81Sha256":"2f8145704284057fa12f83296c3c1ebd57a19b4e4851635fd8498d92c5d99b04","result81Bytes":8834,"baseHead":"c78cfca4624075053c5f5d3a2210ca9fac225cb4","remoteMainPreimage":"c78cfca4624075053c5f5d3a2210ca9fac225cb4","branch":"codex/p51-option-a-closeout","upstream":"origin/main","authorizedPathCount":15,"authorizedPaths":["app/admin/master-catalog/versions/[versionId]/print/PrintDocument.tsx","app/admin/master-catalog/versions/[versionId]/print/page.tsx","docs/plans/master-catalog/19-phase4-decision-register.md","docs/plans/master-catalog/20-phase4-official-export-spec.md","docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md","docs/plans/master-catalog/81-phase4-p51-option-a-local-successor-candidate-result.md","docs/plans/master-catalog/82-phase4-p51-git-only-owner-authorization-receipt.md","docs/plans/master-catalog/evidence/p51-option-a-v1/candidate.json","docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json","docs/plans/master-catalog/evidence/p51-option-a-v1/manifest.json","lib/master-catalog/export/pdfLayout.ts","scripts/build-master-catalog-p51-option-a-candidate.mjs","tests/master-catalog-p51-option-a-candidate.test.ts","tests/master-catalog-pdf-layout.test.ts","tests/master-catalog-print-draft-contract.test.ts"],"exactPathStagingRequired":true,"broadStagingAuthorized":false,"precommitValidationAt":"2026-08-26T03:15:29+07:00","stagedPathSetPassed":true,"protectedPathStagedCount":0,"directNewPersonalOrSecretFindingCount":0,"newlyIntroducedUuidCount":0,"stagedDiffCheckPassed":true,"candidateFreshnessPassed":true,"candidateRowCount":710,"baselineChangeCount":49,"d002AdditionalChangeCount":48,"focusedTestFileCount":3,"focusedTestCount":23,"focusedTestsPassed":true,"fullTestFileCount":43,"fullTestCount":334,"fullTestsPassed":true,"typescriptPassed":true,"eslintPassed":true,"commitIdentity":"Cloudstellar <cloudstellar@users.noreply.github.com>","oneNonMergeCommitAuthorized":true,"commitCreated":false,"nonForceHeadToMainPushAuthorized":true,"pushAttempted":false,"forcePushAuthorized":false,"leaseForceAuthorized":false,"finalRemoteMainRaceCheckRequired":true,"stopIfRemoteMainMoved":true,"rebaseAuthorized":false,"mergeAuthorized":false,"rollbackAuthorized":false,"gitNetworkAuthorized":true,"automaticDeploymentAllowed":true,"directVercelActionAuthorized":false,"deploymentStatusReadOnlyVerificationAuthorized":true,"nextLocalProposalPreparationAuthorized":true,"databaseAccessAuthorized":false,"productionDataReadAuthorized":false,"productionDataWriteAuthorized":false,"candidateApplicationAuthorized":false,"draftMutationAuthorized":false,"flagMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"authMutationAuthorized":false,"rlsGrantMutationAuthorized":false,"p15Authorized":false,"publicationAuthorized":false,"protectedRootAccessAuthorized":false,"protectedRoots":["files/","output/","outputs/","tmp/"],"authorityConsumed":false,"consumeCondition":"SUCCESSFUL_SINGLE_COMMIT_THEN_FIRST_NON_FORCE_HEAD_TO_MAIN_PUSH_ATTEMPT","automaticProductionDataGateAuthorized":false} -->
