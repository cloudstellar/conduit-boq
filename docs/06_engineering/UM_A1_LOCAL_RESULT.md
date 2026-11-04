# UM-A1 bounded local result

Later review found three client gaps outside the initial acceptance cases. The
Owner approved a bounded client-only correction on2026-11-01; use the
[corrective receipt](UM_A1_CORRECTIVE_LOCAL_RESULT.md) and #12 checkpoint for
current progress. The source hashes, tests and custody below remain the dated
initial-candidate evidence; no old result is rewritten as corrective PASS.

Recorded: 2026-11-01 (Asia/Bangkok).
Status: **LOCAL CANDIDATE VALIDATED WITH LIMITS — OWNER REVIEW; NOT RELEASED**.

## Authority, source and target

The Owner's later “ทำต่อครับ”, following the final readiness verdict, authorized
[UM #12](../plans/product/12-user-management-um-a-and-um-b-plan.md) sections11/13:
nine code/test/harness files, local quality/API/browser tests and up to105 new
run-owned synthetic accounts/transitions, retained history and finalization.
No Production access, stage/commit/push/deploy, package/config/schema/RPC/migration
change, reset/restore or027–031 replay ran. Existing local credentials/data and
archive custody remain protected.

Source: uncommitted on `main`, HEAD
`67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`. Latest recorded application release
remains L1 `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`; this candidate has no
commit/deployment identity. These are local observations, not remote/Production.
Index remains empty. Twelve planning/handoff drafts and nine parity artifacts
already existed. Only AGENTS, AI_HANDOFF and #12 were updated for execution status;
other nine drafts and all nine parity artifacts remain byte-for-byte unchanged.

Runtime: Node24.2.0, Next16.4.2; API `http://127.0.0.1:55321`, temporary web
`http://127.0.0.1:3001`. Existing DB container
`4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`, volume
`supabase_db_conduit-boq-local`, PostgreSQL image17.6.1.136, REST14.5. Actual
Docker gateway→Auth/REST→DB/network/volume binding was checked, including parsed
upstream DB URLs without printing credentials. No container/volume reset,
replacement or platform alignment ran. Temporary web process was stopped.

## Delivered behavior and existing-user impact

Admin directory shows25 records using26-row lookahead and raw timestamp/UUID
cursors. Each attempt uses one directory RPC and at most one ID-scoped batch per
required reference table. Pre/post authority checks distinguish revoked Admin
rights from genuine empty results. Lookup errors, missing IDs and actual NULL
have distinct labels. One presenter feeds one responsive action tree and one
read-only details Sheet. Scoped NT frame inherits existing IBM font/tokens;
no global fonts/assets/primitives or accepted exports changed. Action accessible
names include email (ID fallback); keyboard return/fallback focus and scoped
reduced motion were verified.

Existing RPC command semantics, reasons and UUIDs remain. A synchronous lock
prevents double submit. Confirmed commands reread canonical state; no fabricated
optimistic approval/audit fields. Success remains success when reread fails.
Uncertain delivery stays UNKNOWN until a fresh read and explicit new-intent
review before a new UUID. No automatic mutation retry, account repair or approval
occurs during loading/navigation/retry.

Login/callback/middleware, AuthProvider/useUser, pending/profile, email-domain
policy, existing Auth UUIDs/passwords and database permissions are unchanged.
Two real existing local active/NULL-affiliation profiles were read through
API/UI: both remain “ใช้งาน” and “ยังไม่ได้กำหนดสังกัด”, without approval or
reclassification. A1 corrects presentation; trusted affiliation repair remains
UM-B. No S0, A2, UM-B, signup/email configuration or SSO implementation ran.

## Exact candidate files

| File | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `12acb73781e09b27f3cfe04f44b203118a9e4aad67d17f959f6fef2c12e57688` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `00e17b0ccb81d59bc73d9280807c25bc4203969bd798e6f8a594e3cf088b3262` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `15df9f99adf63fb9eb05733ea4cccb3b3426be87f8ae5364079b63d14109326e` |
| `lib/admin/users/directory.ts` | `9d794555ab4ce2ae6beeec911c33ff6e67b54b8580bbbe7502acc700ad069f13` |
| `lib/admin/users/presentation.ts` | `528a460dd26855377e643dd160b8f5570b4abc75ace4462687717a3f9f619b96` |
| `tests/admin-user-directory.test.ts` | `b6cdda51aca43be1c5ac805671cbaad06f37a703bf8830a217d798fb985993ba` |
| `tests/admin-user-presentation.test.ts` | `138f700867e00aa401d73e318defb8c3adebeecbda5a3fd35b34d1924c7b17ae` |
| `tests/admin-users.test.tsx` | `04876fa2a660f99177f51f3fe2bca3de4f2d7f47796ca0b49d9ebecdde51083c` |
| `scripts/test-um-a1-local.mjs` | `72848e734ab06d9e54b6696bafd830924e8b05dedc32071bd886d5cc32bfab7a` |

This receipt and status updates in AGENTS/AI_HANDOFF/#12 are documentation changes.
Run manifest/private QA artifacts are local evidence, not release files. Do not
broadly stage `supabase/local/` or unrelated dirty work.

## Verification

| Check | Actual result and limit |
|---|---|
| Contract preflight | PASS —30relations/96functions/27triggers; schema/RLS/grants/config match frozen baseline plus exact031 definition; approved platform role/membership sets match |
| Post-031 SHA | PASS —`508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`; metadata only, no replay |
| Row caps | PASS —REST1000/no lower role override; directory SQL separately clamps100; candidate requests26 |
| Ordered traversal | PASS —125 profiles/five25-row pages, exact persisted ordering, no duplicate/omission, last-next disabled; genuine authorized after-last empty cursor |
| Role/status denial | PASS —seven non-Admin role/status directory cases plus anon; synthetic non-Admins cannot invoke Admin commands; server self-deactivation denied42501 |
| Idempotency | PASS —exact UUID/payload replay leaves one audit event and unchanged profile; mismatch denied23505 without persisted change |
| Harness fault controls | PASS —15 isolated dependency-injection cases: atomic old/new complete JSON, concurrent/stale lock refusal, capacity106 rejection, exact identity adoption/UNKNOWN block/mismatch refusal, confirmed skip/payload conflict/explicit exact resume. No real network/Auth/DB/fixture operations; not physical power-loss proof |
| Browser commands | PASS —approve double-click sends one RPC; role/deactivate/reactivate/reject reread canonical state |
| UNKNOWN/recovery | PASS —actual server2xx then lost delivery and20s deadline; no resend, read/new-intent/new UUID; warning survives same-actor authority failure/late success |
| Authority | PASS —real same-JWT Admin→staff between directory/postcheck hides rows despite SQL200[]; injected postcheck failure;15s pre-authorization timeout clears cached rows |
| Reads/navigation | PASS —failed Next/cancel preserves committed cursor/page; correct next after refresh;15s read deadline/late result discarded; confirmed success+reread failure keeps success and read-only retry |
| Reference errors/cap | PASS —real page batches; injected unavailable lookup; missing/capped/completeness cases in adapter tests; no live cap/config changed |
| Legacy | PASS WITH INJECTION —known missing-profile RPC gives read-only cursor pages; both exact missing RPCs use explicit noncursor fallback; no real RPC removed |
| Keyboard/responsive | PASS —single action tree; Sheet trap/Escape/return/fallback;320/390/768/1024/1280/1440px; long Thai mocked fixture;640CSSpx/2x reflow; final reduced-motion computed styles disabled |
| Detail/resize requests | PASS —zero additional API requests |
| BOQ reads | PASS —local list/saved editor/Print and open/cancel Copy dialog; no Save/Copy RPC |
| Full tests | PASS —826 tests/63 files, including58 focused adapter/presenter/UI tests; Catalog source-contract tests remain enabled |
| ESLint | PASS —0errors,3 existing warnings in unchanged blocked/useUser;0candidate warnings |
| TypeScript | PASS —standalone noEmit and webpack typecheck on Node24 |
| Documentation | PASS —344 relative links/42 anchors across13 current planning/handoff/result files; final full suite includes existing documentation contracts; diff checks clean |
| Webpack build | PASS —explicit `next build --webpack`; existing config/packages; local public URL/anon/APP_ENV forced for build/run |
| Default Turbopack | BLOCKED/FAIL environmental —IPC port-binding EPERM; earlier sandbox attempt also could not fetch existing fonts. No config/font workaround; default build is not PASS |
| Production/CI/deploy | NOT RUN —no access/publication authorized |
| Real timestamp ties | NOT RUN —readonly aggregate found0 tied groups; microsecond/UUID ties tested purely, no timestamp fixture hack |
| Full business writes/exports | NOT RUN —no BOQ Save/Copy, Catalog/Factor mutation or new Excel/PDF generation; source tests/read-only checks are separate evidence |

Browser plugin was unavailable; bundled Playwright used preinstalled Google Chrome
in isolated ephemeral contexts. No package/browser install. Before first navigation
an origin allowlist blocked everything outside local55321/3001: zero external
business requests and zero uncaught page errors in completed groups. Owner browser
identity and global logout were never used.

Historical local failures are retained. Catalog source-contract compatibility and
an integration prop/type mismatch were corrected. Temporary QA assumptions about
Sheet exit timing, hidden mobile links and SQL cap100 were fixed in QA code.
Reduced motion really failed initially; feature-only classes were corrected and
fresh computed styles passed. The earlier combined auth-deadline group has a
passed15s timeout assertion and a failed animation assertion; final animation
PASS does not erase that historical group. B0 old-rendered UI was NOT RUN.

## Local performance

Final built server/fixed125 profiles:5 warmups+20 recorded samples per first/middle/
last page; nearest-rank p95; faults excluded. Directory timing measures intercepted
local HTTP fetch; page-ready includes browser, pre/post auth, references and render.

| Page | Ready p50/p95/max ms | Directory p50/p95/max ms | Response bytes | Reference batches |
|---|---|---|---|---|
| 1 | 148.93/165.00/165.33 | 2.67/3.22/3.29 | 15,302 | 0 |
| 3 | 147.87/149.07/149.18 | 2.50/2.79/3.96 | 15,306 | 0 |
| 5 | 148.71/165.44/165.87 | 2.58/2.87/4.30 | 21,134 | 1each:organizations/departments/sectors |

PASS: directory p95≤250ms and ready p95≤2000ms. Each warm attempt has one directory
RPC plus two current-profile RPCs and their Auth user checks, separately counted.
Catalog gate is initial-only; AuthProvider/background requests are not hidden in
a one-request claim. Three fresh browser-context login→authorized Admin samples:
365.04/337.80/366.71ms, all≤5000ms. Includes login; not cold DB/build/server.
Old100-row UI versus new25 is not a like-for-like speedup or Production SLA.
B1 real RPC26 traversal was captured before browser acceptance.

## Retention and final custody

Run `um-a1-20261101-l1`:105 custom UUIDs created exactly once. Trusted transitions
and browser commands journal exact actor/target/UUID/payload. Sixteen deliberate
denial intents, zero unresolved creates/server outcomes. Client UNKNOWN history
remains even when interceptor observed a real server2xx.

Finalization **PASS**: retain105 Auth users/105 identities/105 profiles;
**14inactive,1suspended,90pending;0active profiles;0owned Auth sessions**.
No delete/reset/history rewrite. Existing password and all original accounts
remain: actual original set20profiles/21Auth users, not just historical seven.

Custody **PASS** across32 tables, including original34BOQs/66routes/66items and
23private Copy ledger rows. Original profile/Auth/identity digests match, excluding
only declared Auth last-sign-in/updated timestamps. Original26sessions/285Auth audit
entries retained. New authz events match exact fixture intents; no original event
changed/deleted. Security/schema metadata unchanged. Harness38 API sessions and
separate browser/API QA sessions signed out with scope:local and no UNKNOWN;
final database count confirms zero Auth sessions for all105 fixture IDs.

027–031, package/lockfile, existing local env/password files and nine parity
artifacts unchanged; no archive access or old runner import/execution. Evidence:
`/private/tmp/um-a1-preflight.0OzzLK/`; restricted run manifest:
`supabase/local/um-a1/um-a1-20261101-l1/manifest.json`. No copied token/password/
cookie artifact; private custody/run evidence is excluded from future release.

## Remaining limits and next step

Owner can review local diff/scoped NT UI before requesting a release plan. No
publication authority follows. Default Turbopack/CI needs resolution or explicitly
bounded treatment in a later release preflight; no fresh Production claim.

A1 is not full UM: trusted affiliation/activation, new roles, SSO identity linking,
server reviewed-state CAS/conflict, full persistent recovery and offboarding remain
separate. Legacy fallback is limited/read-only. S0 procurement writer-boundary
remains unimplemented; S0-first publication recommendation is not execution
permission. A2/signup/email and UM-B need separate scope. A/B/031/L1 stay closed;
B Production HTTP remains **NOT RUN**, not a new pending probe.
