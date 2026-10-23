# LIST-1B L1 Production release result — 2026-10-23

**Result: RELEASED. Exact 15-file L1 source, Quality and Vercel PASS;
bounded Production no-write smoke PASS with the cosmetic residual below.**

The Owner explicitly approved the Solo release, remaining read-only preflight,
use of direct Data API 14.5 evidence, and conditional client rollback. This
receipt records the completed execution; the committed release plan retains
its earlier proposed-stage wording as historical evidence. This new receipt
remains local and uncommitted, with no second documentation push authorized.

## Exact source and target

| Item | Observed result |
|---|---|
| Base / parent, exact B | `42e01c56fe2eacb5239abc8d296ca1848c48a03b` |
| L1 commit | `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f` |
| L1 tree | `bc47a60a9d97f2ba655f7bafedd4f0a3154a20d7` |
| Publication | One commit and one normal fast-forward push to `origin/main`; no PR/branch or force push |
| Push | 2026-10-23 11:38 UTC / 18:38 Bangkok |
| Vercel project | `cloudwho-2662s-projects/conduit-boq` |
| Deployment | `47nXCLuL9ZhXLkDiGWaEfqGhx5df` |
| Hosted status | Production **Ready / Current**, exact L1 source; checked again after smoke |
| Build completion | 2026-10-23 18:38:57 Bangkok, 35 seconds |
| Primary domain | `https://boq.ntconduit.com` |

See the [exact commit](https://github.com/cloudstellar/conduit-boq/commit/b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f),
[Quality run](https://github.com/cloudstellar/conduit-boq/actions/runs/39947480932)
and [Vercel deployment](https://vercel.com/cloudwho-2662s-projects/conduit-boq/47nXCLuL9ZhXLkDiGWaEfqGhx5df).

Actual commit bytes matched the frozen 532-file candidate manifest, SHA-256
`594218cd791aa06b9bfe22fa92edced9398b96774141efc499273f7d34ae1108`.
The 15-path relative-path/SHA-256 map digest was
`170aadaf8a205f50984e6533f76859d9c0bd4748d6946bf721516609b1d6deb8`.
Runtime/test 13-file digest remained
`00032d9199e7a9e8f11aa925174b60cf6f90e5ec518f24e2f76ebc7b794a32a8`.
Digests use sorted compact JSON maps encoded as UTF-8.

## Published scope: exactly 15 files

| Group | Paths |
|---|---|
| Runtime (6) | `app/boq/page.tsx`, `components/boq/RouteBadge.tsx`, `lib/hooks/useUser.ts`, `lib/boq/list.ts`, `lib/boq/listSession.ts`, `lib/boq/useBOQList.ts` |
| Tests (7) | `tests/boq-list.test.ts`, `tests/boq-list-session.test.ts`, `tests/route-badge.test.tsx`, `tests/master-catalog-admin-edit-completion.test.ts`, `tests/master-catalog-phase2-contracts.test.ts`, `tests/master-catalog-wp7-contracts.test.ts`, `tests/p49-application-authorization.test.ts` |
| Frozen L1 documents (2) | `docs/06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md`, `docs/07_process/LIST_1B_L1_SOLO_RELEASE_PLAN_20261023.md` |

No C files, package/lockfile, workflow, migration, editor/Print implementation,
Catalog, Factor F or account changes were included. Existing C work was retained
locally. Two staged whitespace-check notices were intentional Markdown hard
breaks in the frozen local-result document; bytes were preserved and no lint
rule was disabled.

## Preflight and validation

| Gate | Result and evidence |
|---|---|
| Source / custody | **PASS** — main, index and fresh remote matched B before staging; exact allowlist/commit bytes verified; existing 56 C paths preserved |
| Hosted configuration | **PASS** — correct GitHub repo/main, Next preset, Node 24.x, empty root, build/install/output overrides off, ignored-build Automatic, Production domain assignment enabled; no configuration or secret values changed |
| Relevant DB contracts | **PASS** — one fresh read-only catalog transaction at 11:32:36 UTC, rollback; 5 relations, 63 selected columns, 23 FKs, 9 policies and 6 function contracts matched; no business rows/RPC read or write |
| Production 031 | **PASS** — OID `112777`, definition SHA `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`; ledger `20261023063934/boq_duplicate_stale_conflict_guard` exactly once; no replay/application |
| API version / cap | **PASS** — reused Owner-approved direct Data API OpenAPI GET reporting **14.5**; fresh Dashboard Max rows **1000**; no repeat root GET or cap change |
| Exact-source local quality | **PASS** — Node 24.2.0, 762 tests / 59 files, lint 0 errors / 3 existing warnings, standalone TypeScript and build TypeScript, default warm-cache build |
| Existing Docker integration | **PASS, reused** — unchanged runtime/contracts: API 31/31, Copy API 4/4, final browser normal 10/10 and error/race 15/15; >1,000 synthetic BOQs and cleanup evidence remain in the local result; no release-time DB test/reset/reseed |
| Fresh CI | **PASS** — Quality run `39947480932` / #69, exact L1, all steps successful; 762 tests / 59 files, lint 0 errors / 3 warnings, Next 16.4.2 build and build TypeScript; completed 11:39:25 UTC |
| Deployment | **PASS** — exact L1 Ready / Current on the approved Production target and domains |
| Conditional rollback | **NOT RUN** — exact B artifact retained and preflight reviewed; no rollback trigger met |

CI used the unchanged Node 22.23.3 workflow; Vercel used the approved Node 24.x
configuration. CI's full install graph reported 11 advisories (3 moderate,
8 high); this is not a new `audit:prod` result. No fresh production-dependency
audit or dependency patch was performed in L1.

The approved direct metadata request returned HTTP 200 / OpenAPI `info.version`
14.5 at 11:29:20 UTC, body SHA-256
`89a171ac6bc0bc319e155ca470c4b868aa1aa31431f249888c4a3a3f88af84b1`.
Dashboard General's separate 14.1 display remains an unexplained reporting
difference. The Owner expressly selected API 14.5 evidence for this release;
this does not claim an executable binary attestation or authorize another probe.

## Bounded Production no-write smoke

Observed 11:42:33–11:56:34 UTC / 18:42:33–18:56:34 Bangkok, approximately
14 minutes, using the existing Owner's normal authenticated Admin session.
No new account or login was needed. No private BOQ contents, search text,
credentials or raw API payloads are published in this receipt.

| Check | Result |
|---|---|
| Authorized list / numbered pages | **PASS** — 305 visible-to-actor results, page 1 rows 1–25 and page 2 rows 26–50, 25 rows each |
| Search / sort / history | **PASS** — one harmless search found 2 results, project ordering worked, Back returned correctly, search/sort survived return from Print |
| Historical multi-route mismatch case | **PASS** — list badge **2**, dialog **2** route entries; Escape closed it; opening the dialog added **zero** Data API requests |
| Empty route presentation | **PASS** — an existing no-route record showed the explicit empty state |
| Saved Print | **PASS** — one existing saved document rendered, 8 tables, no framework overlay; Back returned to the list |
| Request budget | **PASS** — domain-filtered observations of page return/search/sort/clear/default restoration each showed **1 BOQ page/count GET + 1 route-batch GET**; HTTP 200/206 as appropriate |
| Final UI state | **PASS** — query empty, page 1, `created_desc`; temporary Network filter cleared and DevTools closed |
| Application errors | **PASS with cosmetic residual** — no application JavaScript error observed; native Console showed three `/favicon.ico` 404 messages |

Request counts separate the normal read-only Auth/profile calls, CORS OPTIONS
preflights and Next.js route prefetches. Normal `get_my_profile_v2` profile RPC
was observed; no mutating business RPC was called. An initial count using a
virtualized unfiltered DevTools table was incomplete and excluded; subsequent
domain-filtered counts are the evidence used above.

Both exact B and L1 lack `favicon.ico` and use unchanged `/favicon.svg` layout
metadata. This supports a pre-existing source condition, not a claim that an
earlier Production HTTP 404 was recorded. No icon fix or scope expansion was
made; no rollback criterion was met. Private route/Print screenshots remain
outside the repository and are not release artifacts for publication.

## Limits and closeout boundary

- Search remains session-only per actor and is cleared on logout. Search text
  can still appear in Data API request URLs/logs as previously accepted.
- Offset traversal and separate list/routes requests are not one frozen DB
  snapshot during concurrent edits. Local latency results are not a hosted SLA.
- Route API overflow remains fail-closed; the 1,001-route case was tested
  locally, not forced on Production. Production prevalence is unknown.
- Live smoke covered one existing persona. Other roles, races, error states,
  responsive/keyboard behavior and Copy regressions use their recorded local
  tests; they were not exhaustively repeated on Production.
- Fresh-cache default build was not proven in the restricted local sandbox.
  The reviewed exact-source warm-cache build, CI build and hosted build passed.
  Standalone TypeScript and build TypeScript passed; no stronger claim about
  the standalone command's ordering after the warm build is made.
- Create, Save, Copy, Delete, status changes, data cleanup and write probes were
  **NOT RUN** on Production. B stale-Copy Production HTTP remains **NOT RUN**
  under its completed Owner closeout; it is not an additional pending L1 gate.
- No database, account, Catalog, Factor F, package/lockfile or migration changes
  occurred. Migrations 027–031 remain immutable/no-replay. No reset/restore ran.
- No new implementation or publication is authorized by this receipt. C and
  documentation convergence remain local work for a later bounded decision.
  Unused conditional rollback was not exercised and grants no general future
  deployment authority.

Execution evidence is retained locally under
`/private/tmp/conduit-L1-solo-execution-pn57rmrv/`; it is outside the release
commit and contains no retained credential values. Do not bulk-stage or upload
temporary evidence or the protected archive.
