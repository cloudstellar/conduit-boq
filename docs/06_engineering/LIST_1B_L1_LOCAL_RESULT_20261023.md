# LIST-1B L1 — Local Implementation and Test Result

**Date:** 2026-10-23 (Asia/Bangkok)  
**Status:** bounded local candidate PASS; Owner release review pending  
**Publication / Production:** NOT RUN; not authorized

## 1. Authority, source and target

The Owner explicitly approved L1 source changes and tests on the existing
Docker local target, including run-owned synthetic fixtures and their cleanup.
This supersedes the prior docs-only stage only for L1. No package/lockfile,
reset/restore, schema/RPC definition or migration operation was permitted.
Production was not accessed, read or written. No stage/commit/push/deploy ran.
Migrations 027–031 were neither edited nor applied/replayed.

- Canonical checkout: `/Users/cloud/Cloudstellar/conduit-boq`, branch `main`.
- Base HEAD and locally recorded upstream: `42e01c56fe2eacb5239abc8d296ca1848c48a03b`.
  These are local observations, not a fresh remote/deployment verification.
- Git index SHA-256 remains
  `22c28b56eb4d93f19786b21b7048d61107766cc2563359020388ba085470a9d2`;
  staged files zero. Source custody found no unexpected changes outside the
  13 L1 files and seven closeout documents; earlier dirty C work was preserved.
- Final tested source: uncommitted 551-file snapshot; SHA-256
  `b2365a9a5f54d169d6e88138ea32a85a80ada568bbddf2fddb07ddb90e21ea2d`.
- Exact 13-file L1 source/test allowlist SHA-256:
  `00032d9199e7a9e8f11aa925174b60cf6f90e5ec518f24e2f76ebc7b794a32a8`.
  Both manifest digests hash UTF-8 JSON of the relative-path/SHA-256 map,
  sorted keys, compact separators. Later closeout edits affect documentation
  only; they are not part of the tested 551-file snapshot.
- Runtime: native Node `v24.2.0`, existing installed dependencies, Next `16.4.2`.
  No install or package update. Default Next production build was tested in an
  isolated source copy; app served on `http://127.0.0.1:3112`.
- Database: existing `supabase_db_conduit-boq-local`, PostgreSQL `17.6`,
  Data API `http://127.0.0.1:55321`, PostgREST `14.5`.
- Local 031 definition SHA-256:
  `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`,
  OID `51020`, ACL/config/security unchanged. This matches the already-recorded
  post-031 definition evidence; no new Production parity claim is made.
- Local migration ledger relation remains absent in this materialized baseline;
  no ledger was created or altered. Original Docker/DB target was preserved.

Full manifest/log evidence is host-local under
`/private/tmp/conduit-boq-LIST-L1-source-y2s0zxsv`; API/fixture receipts under
`/private/tmp/conduit-boq-LIST-L1-integration-hg0fi0kj`. These temporary paths
are not durable repository evidence and must not be bulk published: private
browser Auth state exists alongside sanitized reports.

## 2. Implemented behavior and exact source files

| Files | Result |
|---|---|
| `lib/boq/list.ts` (new) | 25-row server page + exact count in one request; full authorized search/sort before range; explicit fields including Copy token/Factor snapshots/permission fields; stable null/ID ordering; complete route batch with count/shape guards |
| `lib/boq/listSession.ts` (new) | Actor-separated session query/page/sort units, safe storage fallback, History integration preserving Next state, logout clearing; shared search URL without its matching session resets safely |
| `lib/boq/useBOQList.ts` (new) | One desktop/mobile data controller, 300ms search debounce, abort/generation guards, main/route/auth errors, range recovery, History failure handling, actor identity guards |
| `app/boq/page.tsx` | Numbered pages, server result count, three approved sorts, explicit loading/empty/error, guarded row actions and Copy intent/recovery, allowed Delete refetch/clamp, keyboard/focus and responsive controls |
| `components/boq/RouteBadge.tsx` | Parent-fed render only; child rows authoritative, comma names unsplit, marked legacy fallback only after successful empty child result, unavailable on failure, one parent batch retry |
| `lib/hooks/useUser.ts` | Clear list sessions on sign-out even when list page is unmounted; existing Auth behavior retained |
| `tests/boq-list.test.ts`, `tests/boq-list-session.test.ts`, `tests/route-badge.test.tsx` (new) | Adapter/completeness/order/search, session/History and badge contracts |
| `tests/master-catalog-phase2-contracts.test.ts`, `tests/master-catalog-wp7-contracts.test.ts`, `tests/p49-application-authorization.test.ts` | Preserve Copy ID + request UUID + source token assertions against the captured intent |
| `tests/master-catalog-admin-edit-completion.test.ts` | Inspect unique named authority callouts instead of arbitrary first-character limits; original authority/history assertions retained |

Living handoff updates: `AGENTS.md`, `docs/08_ai/AI_HANDOFF.md`,
`docs/08_ai/AI_CONTEXT.md`, `docs/08_ai/LESSONS_LEARNED.md`, Product Plans #02/#09
and this result. Other pre-existing C documentation/tooling remains separate.
No print/editor code, Catalog, Factor F, account, policy or permission model
change. Delete's visible gate follows existing active-Admin/creator-draft RLS;
this is not a broader permission expansion.

Search covers project name, BOQ number, estimator and legacy `boq.route`.
Canonical child-route search remains excluded. `%`, `_`, `*` and regex/parser
punctuation are literal text: escaped `imatch` is used because real PostgREST
14.5 `ilike` translates `*` even inside quoted values. No raw regex is accepted;
search length is capped at 200. New Mine/status/unit filters, last-edited/amount
sort, eligibility projection, SSO, workflow and Quantity Expression remain deferred.

## 3. Test results and evidence boundaries

| Check | Result | Evidence / limits |
|---|---|---|
| Unit/contract suite | PASS — 768 tests / 60 files | Final exact snapshot; `quality-tests.log` |
| Lint | PASS — 0 errors, 3 existing warnings | Existing internal location navigation warnings in blocked page/useUser; no rules disabled |
| TypeScript / default Next build | PASS / PASS | Final exact snapshot, Node 24; standalone `tsc --noEmit --incremental false` |
| Real Data API adapter | PASS — 31/31 | 1,153 synthetic BOQs plus existing local data; 14 existing personas with genuine JWTs; full traversal/count/RLS, three sorts/ties/nulls, beyond-1,000 search, literal punctuation, API range/cap and Copy projection |
| Real Copy API | PASS — 4/4 | Preserve graph, same-UUID retry, stale HTTP409/PT409 with no residue, selected-Factor path; existing sources unchanged |
| Final normal browser | PASS — 10/10 | Production-mode final snapshot: request cap, badge/dialog keyboard, debounce/sort, pages/Back/Forward/session, 390/768/1024/1440px, 44px control height, editor/saved Print/return |
| Final browser error/race suite | PASS — 15/15 | Main/route errors, real route cap, delayed replies/retry, auth/actor/logout guards, 416/invalid page, off-list logout, rejected History writes including combined 416 recovery failure |
| Browser Copy/Delete/Create navigation | PASS — 5/5 | Earlier production-mode L1 snapshot before final touch/History fixes: actual Save in second tab → stale denial/reload; actual server Copy + injected lost response + query change/token-refresh → same UUID/token, one destination; allowed Delete → honest empty; Create form navigation |
| Final fixture/data/schema custody | PASS | All 38 fingerprint entries / 28 public tables exact; original private Copy ledger exact; zero run-owned remnants |
| Closeout documentation | PASS | Affected authority tests 28/28 rerun after overlays; 199 relative Markdown destinations exist; `git diff --check` clean |
| Production HTTP/DB/deployment | NOT RUN | Excluded by approval; B Production HTTP remains separately closed as NOT RUN |
| Fresh complete Create/Save; selected-Factor browser review/save; native browser zoom/full accessibility audit; server revocation/offboarding | NOT RUN | Form navigation/API path/effective-width/client-event tests do not prove these broader flows |

The API adapter did not change after its real-API test. Final browser suites and
quality were rerun after the bounded History fixes; independent source review
confirmed the 13 final files match the snapshot. Earlier browser Copy evidence
is identified by phase rather than relabelled as a run against the final build.
Browser plugin/skill was absent, so existing bundled Playwright used installed
Google Chrome `155.0.8059.85`, with external hosts blocked. Normal console and
runtime errors were zero. Final fault-suite console failures were deliberately
injected HTTP500/401/416; runtime exceptions/external requests/writes were zero.

Earlier failures are retained: obsolete-server/early-assertion/selector fixture
harness attempts, isolated dependency-symlink build attempt, genuine local
History/Copy-intent defects and their subsequent fixes. They were not deleted
or converted into historical PASS. No required final L1 test remains FAIL.

## 4. Requests and measured local latency

Normal nonempty page: exactly **one BOQ page/count GET + one route-batch GET**.
Empty main result needs no route GET. Auth/profile calls are counted separately;
retries/refresh/navigation are new attempts. Desktop/mobile do not multiply
data requests and opening a badge performs no query.

20 samples per workload, loopback warm local Data API; milliseconds below are
transport timings, excluding browser render, Auth/profile and 300ms debounce.

| Persona/page | Main p50/p95 | Routes p50/p95 | Sequential total p50/p95 | Median combined bytes |
|---|---:|---:|---:|---:|
| Admin / 1 | 9.13 / 11.76 | 2.60 / 4.28 | 11.89 / 15.66 | 33,067 |
| Admin / 47 | 7.88 / 8.50 | 2.33 / 2.59 | 10.18 / 10.91 | 7,985 |
| Owner / 1 | 14.73 / 15.76 | 3.42 / 3.86 | 18.15 / 19.61 | 33,775 |
| Owner / 26 | 17.26 / 35.79 | 3.74 / 19.06 | 20.94 / 51.52 | 30,369 |

Owner page 26 correctly returned an empty route batch. Owner page 27 contained
the deliberate 1,001-route fixture: main/count succeeded but route completeness
rejected the capped response. The first diagnostic receipt remains FAIL for
that attempted complete-route workload; no successful route latency is claimed
for it. The summary preserves it as an expected cap limit, not a corrected
successful page. Earlier fixed-dataset main-only Admin/Owner deep-page timings
remain their own API-stage measurements.

Paired Admin page-one diagnostic (20/mode): exact-count p50/p95 7.97/8.69ms;
without count 6.95/8.77ms. This does not isolate SQL CPU or establish Production
capacity. Proposed local regression budget for Owner review: main p95 ≤100ms,
main+route p95 ≤200ms on these normal fixtures; measured values fit. This is
not an approved Production SLA. No new index/schema change is justified by
these measurements alone; scale beyond measured page 47 is unmeasured.

## 5. Cleanup and original-data custody

Cleanup used exact manifest BOQ UUIDs and actor/request/source/result tuples,
never broad table deletion. Across **1,158 ever-created run-owned BOQ IDs and
7 Copy request UUIDs**, remaining BOQs/routes/items/private request rows are
all **zero**. Existing **34 BOQs / 66 routes / 66 items**, all 28 public-table
hashes, profiles, Auth account/password projection, policies, function/security
metadata and 031 are unchanged. Original private Copy ledger remains 23 rows,
MD5 `5b4f8ec68a0460d97b4b521bbb244d44`; existing legacy source graph is exact.

Local sign-ins legitimately change Auth session/audit/sign-in metadata;
`last_sign_in_at` and `updated_at` are excluded from the Auth-user comparison.
Original sessions/audits were not deleted. Configured passwords and account
rows were preserved. Owner snapshots/protected archive were not accessed.

## 6. Release review limits and next decision

- Search remains absent from shared app URLs but **may appear in Data API
  URLs/logs**. Session storage is not encryption; this is the policy the Owner
  selected, not an end-to-end confidentiality claim.
- Offset pages can shift under concurrent inserts/deletes. Separate BOQ/route
  requests are not a shared DB snapshot. Stable ID ordering prevents fixed-
  dataset ties from causing missing/duplicate rows, not all live-data churn.
- More than the configured API cap of visible routes in one page intentionally
  shows unavailable badges, with good BOQ rows retained. Retry cannot remove a
  persistent cap; supporting that case needs separately approved query work.
- Auth notifications/cookie-clear checks prove client guards, not server
  revocation or S0/offboarding. Effective 200% layout width is not native zoom
  or full accessibility certification. Local timing is not a hosted SLA.
- This candidate is for Owner review. Publication scope must explicitly select
  L1 files/docs and preserve other dirty C work; no migration is required or
  authorized. Local evidence does not authorize Production preflight/access or
  commit/push/deploy. Do not reopen B's optional Production HTTP probe.

## 7. Later Solo release planning — 2026-10-23

The Owner subsequently requested a release plan for review, still excluding
publication and all Production access. Use the
[Solo release plan](../07_process/LIST_1B_L1_SOLO_RELEASE_PLAN_20261023.md)
for the proposed 15-file publication boundary, clean HEAD+L1 source validation,
future preflight/no-write smoke and client-only rollback. Earlier local test
results above retain their exact source and phase; the planning request does
not authorize execution.

The separate clean HEAD + exact13 release projection (530 files, manifest
`3592e8cc08167fc8dd4506f7c858dc1b78777fa8aa61297920a5be74bb1c3bbd`)
passed 762 tests/59 files, lint (0 errors/3 existing warnings), standalone
TypeScript and default Node24 build using the final L1 app's normal compiler
cache. Fresh-cache attempts hit Google Fonts/worker-port sandbox errors and
remain their recorded failures; fresh-cache success is not claimed. No source,
configuration, bundler, package or DB change was used. Client output was checked
for the CI placeholder backend, not prior local-backend cache values. The six
tests omitted from 768 belong to unpublished C tooling, not skipped L1 tests.
Adding the two self-contained L1 documents creates the proposed 15-file/532-file
publication source; cumulative C entrypoints stay local.
