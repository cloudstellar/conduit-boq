# UM-A1 — New18 real Docker local validation

Date: 2026-11-02 (Asia/Bangkok). **FUNCTIONAL LOCAL PASS / RESTING VISUAL EVIDENCE OPEN — not release-ready.**

## Authority and custody

The Owner explicitly approved one new18-account run against the existing Docker
target, using the existing local password. Run `um-a1-20261102-real18` may create
and transition only its own synthetic identities through existing Auth/profile/
Admin APIs, exercise the canonical built application and retain/finalize these
identities and audit. No existing identity, BOQ, Catalog or Factor F mutation;
no reset/restore, migration creation/application/replay027–031, Production,
package/config change or stage/commit/push/deploy.

The finalized105-fixture run `um-a1-20261101-l1` stays closed and is included in
the protected original-data baseline of this new run. Its dated receipt and the
[corrective client result](UM_A1_CORRECTIVE_LOCAL_RESULT.md) remain unchanged.
The [canonical checkpoint](../plans/product/12-user-management-um-a-and-um-b-plan.md#12-execution-status-and-resume-checkpoint)
owns current progress. A/B/031/L1 closeouts remain closed; B Production HTTP
stays NOT RUN.

## Exact source and target

- Canonical checkout `/Users/cloud/Cloudstellar/conduit-boq`, `main` at
  `67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`, existing uncommitted corrected A1.
  Source/config/package/protected-file fingerprints were frozen before this run.
- Existing API `http://127.0.0.1:55321`; existing DB container ID
  `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`,
  container/volume `supabase_db_conduit-boq-local`. Gateway/Auth/REST/database
  network bindings verified, REST14.5, cap1000 and exact post031 contract.
- Relevant metadata digest
  `cd0035a3742c2cc747b1a8da474791f089881e515fc432b38971bcff493a794d`.
  Frozen metadata reference is local recorded evidence; no Production capture.
- Host Node24.2.0/npm11.3.0, Next16.4.2. Canonical `npm run build` used
  Turbopack and the actual local public API/key, followed by `next start` on
  `http://127.0.0.1:43180`, including the existing root proxy. Existing build
  cache retained; no CI/Production or cold-build claim.
- Run manifest:
  `supabase/local/um-a1/um-a1-20261102-real18/manifest.json`.
  Password/key/token/cookie values are not copied into this receipt.
- Detailed private evidence: `/private/tmp/um-a1-real18-dRnd8I/`.

## Completed evidence

| Check | Actual result |
|---|---|
| Fresh read-only target/metadata/credential-source preflight | PASS, no Auth login or fixture creation in preflight |
| Original-data capture | 125profiles,126Auth users/identities;32table digests,26session links,544Auth audits |
| New fixture preparation | PASS: exactly18 identities, all confirmed,0unknown creates/intents |
| Preparation/session cleanup | PASS; independent SQL finds0new-fixture/0newOwner sessions; original26sessions retained |
| Initial new statuses | Dated preparation state:12active/4pending/1inactive/1suspended; superseded by retained final states below |
| Directory traversal | PASS:143profiles/6pages, exact SQL ordering/unique IDs/all18present |
| Non-Admin/anonymous directory denial | PASS through actual local Data API |
| Original custody after preparation/directory verification | PASS,32tables/26original sessions/544Authaudits retained |
| Native actual-local default Turbopack build | PASS,2026-11-02 00:56:08–00:56:11 Bangkok,exit0 |
| Post-build frozen source check | 288previously present files checked;only authorized AGENTS documentation changed |
| Direct command/replay/denial acceptance | PASS,31checks: current-profile role/status denial,self-denial,incomplete approval denial,canonical transitions/audit,exact UUID replay/payload mismatch,same-JWT authority loss/restoration |
| B1 actual directory RPC timing | PASS,5warmups+20samples each first/middle/last;nearest-rank p95 2.00/1.20/1.52ms;response bytes20042/15302/15134 |
| Direct API session/outcome check | PASS,11new-fixture sessions locally signed out;independentSQL0new/Owner sessions,26original retained,0unresolved intents |
| Corrective real-browser races/UNKNOWN/recovery | Functional PASS across13distinct groups:browser01 first8PASS/case9harnessFAIL retained;browser02 skips8asNOTRUN and passes remaining5; no application fix or prior-group mutation replay |
| Request/performance/responsive/keyboard assertions | PASS;exact ID-scoped complete reference batches,zero Sheet/resize API reads,320/390/768/1024/1280/1440px,640CSSpx@DPR2 reflow,focus/Escape/reduced motion; actual browser zoom/audible screen reader NOT RUN |
| Existing active/NULL presentation | PASS,2original local records show active and unassigned affiliation truthfully; no login or mutation of those identities |
| Primary runtime font | PASS,actual IBM Plex Sans Thai FontFaces loaded; fallback face unloaded; not a sitewide NT CI/NT-font rollout claim |
| No-write business regression | PASS,list/editor/Print and Copy dialog open/cancel; no Save/Copy RPC,BOQ/reference writes or stale-Copy business replay |
| Run-owned retained-state finalization | PASS,exact18Auth/profile/identity retained:15inactive/2pending/1suspended;84exact new authorization events/98intents including14denials;0unresolved intents |
| Final independent SQL | PASS,0new active/0new-fixture sessions/0newOwner sessions; original26session links/544Authaudits and32table digests retained; BOQ34/routes66/items66 unchanged |
| Frozen source/protected custody | PASS,288previous files checked;only authorized AGENTS doc changed within that set;17protected hashes including027–031/nineparity/package/oldmanifest unchanged;local credential input digests unchanged |
| Test tooling/documentation checks | PASS,syntax/scopedESLint/defaultdryrun for both new drivers;28existing documentation contracts;373relative links/46anchors across16Markdown files;git diff/whitespace checks clean |
| Settled resting desktop/mobile screenshots | **OPEN / UNACCEPTED**:captured closing overlay;mobile also repeats a header strip;not a confirmed application regression |
| Screenshot wait correction | Tooling-only syntax/lint/dryrun PASS;**real capture NOT RUN**,no fixture reopening |
| CI/Production/publication | NOT RUN / NOT AUTHORIZED |

### Local timings and request accounting

Five warmups and20recorded samples per workload; nearest-rank p95. Same raw
cursor pages1/4/6,143profiles. The first-page payload changed during approved
synthetic transitions, so B1/candidate values are budget observations, not a
like-for-like speedup claim.

| Workload | B1 RPC p95/ms | Browser RPC p95/ms | Authorized page ready p95/ms | Browser response bytes |
|---|---:|---:|---:|---:|
| First,page1 |2.00|3.81|167.13|20921|
| Middle,page4 |1.20|2.57|168.66|15302|
| Last,page6 |1.52|11.89|267.28|15134|

All pass the predeclared RPC250ms/page2000ms budgets. Three fresh browser
contexts took308.12/306.81/307.67ms, each below5000ms; login precedes timing.
Maximum page-ready sample818.82ms. These are local measurements, not a Production
SLA or cold server/DB/build result. API/B1 raw sample arrays and per-sample
page-ready durations are not retained; executed code and summaries support the
calculation, while browser reports retain per-request RPC timings.

Each normal directory read uses one pageRPC(`p_limit=26`) and at most one
`id,name` batch per required organizations/departments/sectors table, scoped to
the exact visible25 IDs. Pre/post authority/Auth invocations, shared AuthProvider
reference lookups and initial Catalog gate are separate; this is not a claim of
one total network request for the entire page. Fault groups are excluded from
normal timing.15UIrequestUUIDs and8controlled role transitions have exact
pre-dispatch journals and observed server2xx; lost client responses retain
CONFIRMED server outcomes separately from visible UNKNOWN notices. No blocked
origin, route guard failure, uncaught page error, unresolved transport or pending
outcome remained. Console errors correspond to explicit503/lost-response/legacy
fault injections. No unknown real command was guessed or retried.

### Retained files and exact execution identities

This task changes only these source/tooling/documentation paths, plus five new
run-owned evidence files listed below; previous dirty work stays separate:

- `scripts/test-um-a1-real-api.mjs`
- `scripts/test-um-a1-real-local.mjs`
- `docs/06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md`
- `docs/plans/product/12-user-management-um-a-and-um-b-plan.md`
- `AGENTS.md`
- `docs/08_ai/AI_HANDOFF.md`
- Under `supabase/local/um-a1/um-a1-20261102-real18/`: `manifest.json`,
  `real-api-report.json`, `real-api-attempts.jsonl`,
  `real-browser-01-report.json`, `real-browser-02-report.json`.

Browser JSON copies were checked for credential/JWT content before retention;
original FAIL/NOT RUN values were preserved. Screenshots and executed-browser02
driver bytes remain in the private evidence directory.35harness session records,
11API sessions and4browser sessions all have local-only sign-out evidence; final
independent SQL is the actual zero-session proof. Original Auth sign-in/update
timestamps and new Auth audit entries are normal login bookkeeping; original
password/identity/application-profile/authority/business digests remain unchanged.

| Source/evidence | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `6b5e83d1507f4232b8d74aa555c21d5d14e65a65fa389de2440fe3a7039c096a` |
| `lib/admin/users/directory.ts` | `c363f884e80178401f1e12b37f0a521e9cb4b60b0da73b7eaff67c4e64464d09` |
| `lib/admin/users/presentation.ts` | `528a460dd26855377e643dd160b8f5570b4abc75ace4462687717a3f9f619b96` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `ca63e328c36654a838ee269ee87019d054cae85c0425d80bab9604c981a69a29` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `1233a51aeeee7b81d1aa9a4038fb35875703f3662263f423152f0bfb76f51d8b` |
| `scripts/test-um-a1-local.mjs` | `72848e734ab06d9e54b6696bafd830924e8b05dedc32071bd886d5cc32bfab7a` |
| `scripts/test-um-a1-real-api.mjs` | `a9bae8c493f7406bfc90745f6aea992884f7fb97dc1dc7055fe90fa329e89357` |
| Browser01 executed driver | `dafaa9062bb255816e0c1b8d7e0e85718d2fbc799356dbbe5b6f750108b6cd7b` |
| Browser02 executed driver | `896627ba43912ceaf199a4d86bfb8b5229c80f72dd87757ea159e1f4bc181f19` |
| Current browser driver,capture-wait fix NOT RUN | `14f7fb48fa5bb3ff2f829861d30ca811eec54eb6802298b62996e697b03ca2c5` |
| Final new18 `manifest.json` | `c7784afe96708c4de0a9fdcfb8e54f9b1e174b33fe503b5c005d2b4ce2185ff6` |

The application hashes are unchanged from the corrected source with845tests/
63files,TypeScript/webpack and9mock-browser groups in the corrective receipt.
That full suite was not rerun for these new test-tooling/doc-only changes;
the fresh actual-local Turbopack build included TypeScript. Existing main-source
lint3warnings remain historical; new-driver scoped lint is clean. No CI change:
repository Quality still specifies Node22; local runtime is Node24. No fresh
Vercel observation or Production version assertion is made.

## Limits and finalization gates

Browser01 stopped at case9 after eight successful groups. Revocation during the
post-read authority check correctly cleared rows and denied the same JWT. Role
restoration was confirmed, but the driver incorrectly expected automatic retry:
shared AuthContext had stayed at the same UUID/admin/active values throughout.
The page retained its explicit retry panel as required by R2. Independent source
review confirmed a test expectation correction, with no app change. Keep
`browser-01/report.json` and `failure-9.png`; resume only case9 onward with an
explicit read-only retry and no extra Admin mutation. Independent SQL after this
stop confirms0new/Owner sessions,26original sessions retained,18new identities
and0unresolved intents. Earlier eight confirmed command groups are not rerun.

The later resumed run passed case9 using explicit read-only retry with unchanged
mutation count, then passed the remaining behavioral groups. Final image review
after retention found the closing-overlay/compositor ambiguity in both resting
captures. The coordinator finalized before completing that image review; this
ordering mistake is retained here. Do not recapture by reactivating the now-closed
run. A subsequent test-tooling-only correction waits for dialog/overlay DOM
detachment, restored pointer events, DPR reset, scroll0 and two animation frames;
its syntax/lint/dryrun pass does not prove fresh visual acceptance.

- All18new fixtures are on page1. Preserve existing timestamp/data geometry;
  actual off-page warning persistence and Back/unrelated-command behavior are
  separate from the exact off-page-new-target-B-success case in the mock proof.
- No actual tied timestamps exist. Deterministic mock/source ordering evidence
  does not become a real tied-timestamp PASS.
- Every actual mutation must have its actor/target/payload/requestUUID recorded
  before dispatch. Settle/reconcile every held request and require no unresolved
  intents before finalizing. UI UNKNOWN and known server2xx are separate facts.
- Existing harness finalization alone is insufficient zero-session proof.
  Independently inspect all18owned session/profile states plus new Owner sessions
  and original session links. Auth timeout uncertainty must be reconciled.
- A1 validation does not close A2 signup/email delivery, UM-B trusted-affiliation,
  SSO, focused S0, audible screen-reader acceptance, CI or Production acceptance.

## Closeout and next safe step

Both fixture runs are finalized and must stay closed. The task-created Next
server and isolated browsers were stopped; the existing Docker stack remains
running. No new secret file, database reset, migration, package/config change,
Production operation, staging, commit, push or deploy occurred. HEAD/index stay
unchanged; local docs/test/evidence changes remain uncommitted.

Owner review may use this receipt and checkpoint. Before claiming release-ready,
close the settled resting-layout visual gap through a separately bounded review
scope; do not infer another Auth/fixture run or use Owner Admin as an unapproved
browser persona. Existing local login guidance remains in
[LOCAL_SUPABASE](../LOCAL_SUPABASE.md#test-users). Any eventual release still needs
its own Solo preflight/approval; S0/A2/UM-B are not started by this closeout.
