# Stale Copy B — client Production release result, 2026-10-23

**Status: CLIENT STAGE COMPLETE; 031 DATABASE STAGE NOT RUN.**

The Owner approved Solo commit/push/deploy of exact B source and CI/Vercel
verification, expressly excluding 031 application, database changes and replay
of migrations 027–031. This receipt closes that client publication only.
The complete stale-Copy correction remains open until its separately approved
database stage and applicable acceptance checks are completed.

## Exact source and publication

- Branch: `main`, direct fast-forward Solo push; no PR or additional branch.
- Parent: `a3114fc0eda2eb8d898ad2949ebc71250515df1f` (completed dependency A).
- Commit: [`42e01c56fe2eacb5239abc8d296ca1848c48a03b`](https://github.com/cloudstellar/conduit-boq/commit/42e01c56fe2eacb5239abc8d296ca1848c48a03b).
- Tree: `6283410f997d00fc808cd9d8f7153b9bc381786f`.
- Exactly four changed files, 779 insertions / 5 deletions:

| File | SHA-256 |
|---|---|
| `lib/boq/duplicate.ts` | `bc0acb8d0b673987e12e6d3ca7f69c46c30254151a556c4ae4050e8f88f4b771` |
| `tests/duplicate-boq-client.test.ts` | `354e9071b667ce553a605cea298604c56c2c54f101a5fc33280ce96963c52901` |
| `migrations/031_boq_duplicate_stale_conflict_guard.sql` | `34c67a8d505c107a2fc86e1ecf8a9ed48a3c94a31d6d169ca016e5921463adef` |
| `scripts/smoke-local-db-parity.mjs` | `8fac98b2e1e90b4e5fac5f47cac8d6abac5254f75c1a885f45154251fec4d872` |

All 524 committed file contents matched the exact A+B snapshot tested on
Node 24, manifest SHA-256
`837a71f4b720eb6449040332d1a6bdbedbdfab441e48d2324fd874ac47f1ad9c`.
Independent reviews before and after commit found no scope/hash difference.
Package/lockfile, existing application files outside B and migrations 027–030
were unchanged. The whole new smoke harness was reviewed; it exports a runner
without top-level execution and needs no C restore/fixture implementation.

The client preserves legacy `40001` handling and additionally recognizes only
`PT409` with exact `details = BOQ_SOURCE_STALE`. It changes no RPC payload,
request-key, source token, authorization or automatic-retry contract.
031 was published as frozen SQL source only. Repository Quality, package
lifecycle and live Vercel build settings contain no automatic migration step.

## Actual checks and target

| Gate | Result / evidence |
|---|---|
| Before push | Remote main was still exact A; B4 staged hashes and diff check passed; other local work preserved |
| Local Node 24 quality, earlier this day | Node 24.2.0 Darwin arm64; 56 files / 658 tests, lint 0 errors / 3 existing warnings, standalone TypeScript and default Next production build PASS |
| GitHub Quality | [Run 39911370798](https://github.com/cloudstellar/conduit-boq/actions/runs/39911370798), job `120274907179`: completed/success, every step success |
| Actual CI log | Exact B commit; Node 22.23.3 / npm 10.9.9; 56 files / 658 tests PASS; lint 0 errors / 3 existing warnings; Next 16.4.2 Turbopack build and its TypeScript phase PASS |
| Vercel | [Deployment Gf8gmTN8H5k7dYebeEzRwV5DwjW5](https://vercel.com/cloudwho-2662s-projects/conduit-boq/Gf8gmTN8H5k7dYebeEzRwV5DwjW5), exact B source, Production Ready and current in project Overview |
| Production domains | `boq.ntconduit.com`, `conduit-boq.vercel.app` point to the observed B Production deployment |
| Deployment URL | `conduit-1kpuj84wj-cloudwho-2662s-projects.vercel.app` |
| Live configuration | Node 24.x; Next.js preset; build/install overrides off; root directory empty; ignored build Automatic; no deployment checks configured; no setting saved |
| Vercel build | 24-second deployment; cached unchanged dependencies; `npm run build` → `next build`, Next 16.4.2 Turbopack, compile/TypeScript/static generation and deployment completed |
| Final Git observation | Local HEAD/upstream/fresh remote main all `42e01c56fe2eacb5239abc8d296ca1848c48a03b`; index empty |

CI and Vercel ran in parallel after the approved Solo push. CI was not a
pre-Production deployment gate. CI still does not run Docker integration,
`audit:prod`, or standalone `tsc`; their separate dated evidence stays separate.
CI install reported 11 findings (3 moderate / 8 high), consistent with the
tracked development findings on the unchanged lockfile. No new production
audit was run for this client-only publication. Vercel emitted three npm
configuration/install-script warnings; its build completed successfully.
The hosted Node patch was not exposed; the local Node 24 result is representative.

Observed publication/CI/Production evidence was collected around 13:24–13:29
Bangkok on 2026-10-23. Before local closeout documentation, all 542 canonical
nonignored file bytes and the path inventory matched the preflight snapshot;
only Git commit/ref/index state changed as authorized. Existing C changes were
preserved. This receipt and latest-status pointers are subsequent local-only
documentation, outside the published B4 commit. No second commit/push follows.

## Database and acceptance limits

No local or Production database connection/query, business RPC, account or
reference operation, schema/data/ledger write, reset or migration execution
occurred in this publication task. No 027–031 replay, restart or termination
occurred. The earlier read-only preflight is dated evidence, not a new DB
observation after deployment. At that preflight Production was predecessor
`d3c422a78c2434ad40c932250b734871608282bc41dce3097a853ddcc1637910`,
OID `112777`, ledger 30 rows ending at 030, with no 031.

Production stale HTTP behavior, authenticated BOQ/Copy/Save, app console and
Print acceptance were **NOT RUN** here. The predecessor stale-Copy timeout
remains tracked; client publication alone cannot fix the PostgREST retry.
The A-only exception was already consumed and is not extended to B.
The dated 49/49 local API and two-tab preserve recovery results apply to local
captured baseline **plus 031**; they are not Production acceptance. Selected-Factor
stale browser recovery remains NOT RUN and browser POST-count/UUID continuity
remains NOT PROVEN. No normal Copy/Save or stale business probe was added here.

## Next boundary

The client publication authority is complete/consumed. 031 remains unapproved
for Production and must not be replayed locally. Future database execution
requires explicit approval and the [B plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md#6-ขั้นตอน-b--client-ก่อน-แล้ว-031-ใน-window-เฉพาะ):
an Owner-selected quiet Copy / single-operator / no-concurrent-DDL window,
fresh immediate predecessor/role/security/ledger/activity checks, one exact
migration execution and guarded postflight. A live stale RPC proof needs its
own named actor/sample/request scope. An uncertain executor result requires
inspection of function and ledger, never blind retry, inverse/replay or repair.

The [031 authority correction](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md)
and all frozen historical evidence remain unchanged. This release does not
retroactively approve the earlier local 031 operation.

Private host-local artifacts:
`/private/tmp/conduit-boq-B-client-release-20261023-skrcboc_/` (custody, commit,
CI/deployment receipt and screenshot),
`/private/tmp/conduit-boq-B-node24-20261023-lo4rdyw7/result.json` (Node 24), and
`/private/tmp/conduit-boq-B-prod-preflight-20261023-9zph8vnz/result.json`
(earlier read-only preflight). Temporary artifacts are not durable published
evidence; the IDs, bounded results and limitations above are the local handoff.
