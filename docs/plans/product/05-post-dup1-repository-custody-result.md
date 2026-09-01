# Post-DUP-1 Repository Custody Result

**Status:** COMPLETE — DOCUMENTATION CLOSEOUT MERGED; NAMED BRANCHES REMOVED

**Custody event:** 2026-08-31 (Asia/Bangkok)

**Documented:** 2026-09-01 (Asia/Bangkok)

<!-- POST_DUP1_REPOSITORY_CUSTODY_V1 {"result":"pass","docsCommit":"654ba7674707fec2151ed510ce478bb4135d48c5","docsPr":10,"docsMergeCommit":"07dd75558b513037a1d38b576ffe03be356623c2","gitTree":"c6750930f23982ec08dab27bcb4da26d961411ea","qualityRun":33349901736,"vercelDeployment":"BQyAnbjjbBfYYWXLznsLSbKFo7yY","vercelEnvironment":"production","vercelReadyAtObservation":true,"vercelCurrentAtObservation":true,"deletedBranches":["codex/atomic-boq-duplicate","codex/atomic-boq-duplicate-closeout","codex/main-convergence"],"matchingRemoteRefCountAfterCleanup":0,"archiveTouched":false,"databaseTouched":false,"migrationRun":false,"authorityConsumed":true} -->

## 1. Result

The DUP-1 documentation closeout was merged through
[#10 — docs(product): close atomic duplicate release](https://github.com/cloudstellar/conduit-boq/pull/10).
The separately approved repository cleanup then removed the exact three named
local and remote branches listed below and returned the canonical checkout to
`main`.

This is a repository-custody receipt, not a new application or database
release. It does not replace the frozen DUP-1 execution identities in
[Production Result #04](./04-atomic-boq-duplicate-production-release-result.md).

## 2. Dated repository and deployment evidence

| Evidence | Recorded identity/result |
|---|---|
| Documentation commit | `654ba7674707fec2151ed510ce478bb4135d48c5` |
| Documentation pull request | [#10](https://github.com/cloudstellar/conduit-boq/pull/10) |
| Documentation merge commit | `07dd75558b513037a1d38b576ffe03be356623c2` |
| Documentation commit/merge tree | `c6750930f23982ec08dab27bcb4da26d961411ea`; exact tree equality passed |
| GitHub Quality run | `33349901736`; completed `success` |
| Vercel deployment | `BQyAnbjjbBfYYWXLznsLSbKFo7yY` |
| Vercel observation | `Production`, `Ready`, `Current`; source `main` at `07dd75558b513037a1d38b576ffe03be356623c2` |

The Vercel observation is evidence at the recorded time, not a promise that
this SHA or deployment will remain current forever. Any later
documentation-only merge can move `main` and create a newer deployment without
changing DUP-1 runtime behavior. Verify Git and Vercel afresh whenever the
current deployed source identity matters.

## 3. Exact branch cleanup

The Owner separately authorized cleanup after the relevant work was fully
merged. The operation removed only these branches:

1. `codex/atomic-boq-duplicate` — feature commit
   `bc357dbc7a8bd8d696c19550f57452f79a6a4372`, already contained by PR #9
   merge `0e76ed39e68746c9bd6003da69a03f096ae482a3`;
2. `codex/atomic-boq-duplicate-closeout` — documentation commit
   `654ba7674707fec2151ed510ce478bb4135d48c5`, already contained by PR #10
   merge `07dd75558b513037a1d38b576ffe03be356623c2`; and
3. `codex/main-convergence` — older convergence commit
   `f89511767d8d5e9207a61f851c9e6f3f97b42cf7`, already an ancestor of `main`.

For each target, ancestry and worktree ownership were checked before safe
deletion. The feature branch was deleted first; after PR #10 and the Production
deployment passed, the closeout and convergence branches were deleted. Final
`git ls-remote --heads` returned no matching remote ref for any of the three.
At the final observation, the canonical checkout was clean on `main`, local
`main` equalled `origin/main` at `07dd75558b513037a1d38b576ffe03be356623c2`,
and no other local branch remained.

No other or unrelated historical remote branch, worktree, or archived branch
was included in this cleanup.

## 4. Frozen chronology

Production Result #04 correctly records `branchDeleted: false` and states that
the feature branch was retained at the earlier DUP-1 release-closeout instant.
Do not rewrite that frozen receipt. This later document is the superseding
authority only for repository custody after the separately approved cleanup.

Likewise, the 2026-08-29 handoff statement that no branch had yet been deleted
remains valid chronology for that dated custody event. It is not the current
post-cleanup branch inventory.

## 5. Protected boundaries and authority

The documentation merge and cleanup made no application runtime, database,
schema, migration, Catalog, Factor F, BOQ, account, or permission change.
Migrations 027, 028, and 029 remain immutable and no-replay. The protected
archive at `/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829` was not
entered, inventoried, changed, uploaded, or deleted.

The commit/push/merge/deployment-observation and exact branch-deletion
permissions used for this closeout are consumed. This receipt grants no
authority for another branch/worktree deletion, commit, push, deployment,
Production operation, database access, migration, or archive action.
