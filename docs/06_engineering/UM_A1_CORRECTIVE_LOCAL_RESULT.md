# UM-A1 corrective client result

Recorded: 2026-11-02 (Asia/Bangkok); work/approval began2026-11-01.
Status: **CORRECTIVE CLIENT VALIDATED WITH LIMITS — OWNER REVIEW; NOT RELEASED**.

## Authority and source

Owner approved the three reviewed A1 corrections, integration tests and checkpoint
updates. This is client/UI/test/documentation work only: no DB/Auth operation,
fixture run, migration/replay027–031, Production or stage/commit/push/deploy.
Package/lockfile/config/shared Auth/fonts/primitives remain unchanged.

Canonical checkout `/Users/cloud/Cloudstellar/conduit-boq`, `main` at
`67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`, index empty. Existing initial A1 and
planning/parity dirty work was inspected and retained. This corrective source is
uncommitted; it has no release/deployment identity or fresh Production observation.

[Initial A1 result](UM_A1_LOCAL_RESULT.md) remains its dated source/test/custody
receipt. Its826 tests and real local DB/browser evidence do not prove the newly
reviewed interleavings. Preserve that receipt and its historical SHA/results.
Baseline freeze: `/private/tmp/um-a1-followup-freeze.hrw34v8n/baseline.json`.

## Findings and correction

1. Same-actor role changes invalidated submitted-command tracking together with
   view generation. Command identity now uses actor/workspace epoch plus UUID,
   independently of view/read generation. Same-actor authority loss hides the
   directory but retains the submitted intent/lock. Restoration reads queue;
   success starts a new canonical read under lock. Actual actor switch/unmount
   invalidates ownership so old outcomes/finalizers cannot affect another epoch.
2. A transient notice replaced UNKNOWN history when another command started.
   Exact command intents/payloads are now retained per request UUID. Persistent
   workspace/row/Sheet warnings derive from unresolved records; fresh-read
   eligibility is separate from unresolved status. Multiple UNKNOWNs on one target
   do not overwrite each other. Current values and later commands do not resolve
   older outcomes. Actual response evidence belongs only to its exact UUID.
   Late actual HTTP outcomes invalidate old page/review freshness and initiate a
   guarded reread; UUID-bound transient notices cannot overwrite another result.
3. Full25-row pages repeated the same live-region message. Each attempt now
   announces loading and its requested page, then committed page/count or error.
   Initial loading has real text; no additional API request or total-count claim.

Existing command RPCs, reasons, self/role/status guards, numeric/BOQ business
behavior and actual/requested affiliation semantics remain unchanged. No new
server transition, role, user store, persistent recovery, SSO or trusted repair.

## Files

Corrective code/test files:

- `app/admin/page.tsx`
- `lib/admin/users/directory.ts`
- `app/admin/_components/AdminUsersDirectory.tsx`
- `app/admin/_components/AdminUserDetailsSheet.tsx`
- `tests/admin-user-directory.test.ts`
- `tests/admin-users.test.tsx`
- `scripts/test-um-a1-client.mjs` — new repeatable mocked-browser integration tool

Documentation: this receipt, initial receipt's dated pointer, checkpoint#12,
and authority/resume pointers in AGENTS/AI_HANDOFF. Other dirty work is separate.

## Final validation

| Check | Result |
|---|---|
| Full Vitest | PASS —845 tests/63 files on Node24.2.0;19 added cases over the dated826 baseline |
| Controller | PASS —34 tests including deferred submitted outcomes, queued reads, UUID history, late settlement, actor epochs and disposal |
| Scoped UI | PASS —35 tests including independent warning/blocking states, off-page/authority-loss generic notices and Sheet truthfulness |
| TypeScript | PASS —noEmit and final webpack build typecheck |
| ESLint | PASS —0errors/3 unchanged blocked/useUser warnings;0warnings in corrective files including runner |
| Mocked real-page integration | PASS —9/9 final frozen-source groups, actual AuthProvider/AdminPage/Radix; no real Auth/DB/Production service |
| Webpack build | PASS —final source on Node24.2.0/Next16.4.2; explicit loopback API placeholder/public key, no real Supabase connection |
| Default Turbopack | PASS —later authorized native Terminal run on Node24.2.0, npm run build, exit0; earlier Codex IPC/EPERM FAIL remains dated history below |
| Documentation | PASS —28 existing documentation contracts;349 relative links/42 anchors in14 planning/handoff/result files;diff checks clean |
| Real DB/Auth/fixture/Production/CI | NOT RUN —outside this approval |

## Integration method and boundaries

The new tool is dry-run by default. `--run` copies only application source and
unchanged config/public files into a temporary directory; it excludes env files
and uses an installed Playwright runtime supplied explicitly if not resolvable.
It runs real Next/AuthProvider/AdminPage/Radix against a fresh in-memory loopback
Auth/Data mock. There is no forwarding to Supabase, SQL, Docker or a real account.
Browser origin allowlist and child Node network guard prevent outside requests;
unknown mock requests fail closed. All tokens/passwords/profiles are synthetic.

Existing Next fonts may use development fallback under the no-external-network
browser run. Behavioral screenshots are not NT font/CI, built Production visual
or database acceptance. Actual webpack build is a separate check. No package,
lockfile, config, font or shared component is changed to enable tests.

## Retention, limits and next step

The finalized `um-a1-20261101-l1` run remains closed. No harness invocation,
reactivation, creation, deletion, original-data operation or fresh DB inspection
ran. Existing fixture status/custody evidence remains the initial receipt's dated
result; this patch will compare the manifest bytes without claiming fresh DB PASS.
Migrations027–031 and nine parity artifacts must retain their pre-patch hashes.

Owner review is the next step; no release or Production action is authorized.
Default Turbopack limitation and any later release/real-DB regression scope remain
explicit. Mocked integration is not fresh real-DB acceptance. S0/A2/UM-B remain
separate work; no new fixture run is inferred from this completion.


## Frozen source fingerprints

| Corrective path | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `6b5e83d1507f4232b8d74aa555c21d5d14e65a65fa389de2440fe3a7039c096a` |
| `lib/admin/users/directory.ts` | `c363f884e80178401f1e12b37f0a521e9cb4b60b0da73b7eaff67c4e64464d09` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `ca63e328c36654a838ee269ee87019d054cae85c0425d80bab9604c981a69a29` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `1233a51aeeee7b81d1aa9a4038fb35875703f3662263f423152f0bfb76f51d8b` |
| `tests/admin-user-directory.test.ts` | `71f19226928d3fc351fcc356247570420a21cfffe45935d10aeb6d61ac502bbd` |
| `tests/admin-users.test.tsx` | `2e593f97d8168ff5fd0ae4623b4e0dbb1895f823c2b9e99e75f7d8883257c50f` |
| `scripts/test-um-a1-client.mjs` | `6f2c6db2d7449c8e58369776ed250ab26c5a33e2206f78e23cf557165535323e` |

## Mounted-browser evidence

Final report: `/private/tmp/um-a1-followup-freeze.hrw34v8n/run-05/report.json`.
All173 copied application/config/public source hashes and runner hash match the
current candidate. Nine completed groups cover:

- Next/Back/Refresh loading→page-specific full25-row results, directory/reference request budgets.
- Native cancel sends0mutation; approve double-click sends1mutation.
- Actual mounted actor change during held authorization sends0mutation.
- Held-before-execution success across same UUID Admin→staff→Admin; no actionable pre-settlement page; canonical read gates controls.
- Actual20s deadline, explicit fresh read while execution still held, then unrelated same-actor command success followed by the old actual2xx; exact UUID resolves, controls wait for reread, newer notice stays intact.
- Two UNKNOWN UUIDs on one target survive fresh read, off-page navigation and unrelated success.
- Actor A→B→A ignores old-epoch outcome/read publication until explicit refresh.
- Old actor A outcome does not overwrite B's newer success notice or trigger B reads.
- Known success+reread failure stays success; read retry sends no additional mutation.

Zero unrecognized mock requests, zero external browser-origin attempts and zero
uncaught page errors. Three browser503 console errors are intentional fault
injections, not a clean-console claim. Node blocked external npm update/font
checks before connection; development used existing-font fallback. The screenshots
prove scoped rendered behavior, not NT font or Production visual acceptance.

The runner uses fake cookies/tokens only and never creates a real account/session.
Temporary Next/mock/browser processes stopped. Earlier run02 had a test wait race;
its7/8 result remains preserved, followed by8/8 and9/9 reports and this final9/9.
The initial sandbox loopback bind failure was an environment limitation; approved
local-listener escalation succeeded. No automatic approval rejection occurred.

Repeat without installing packages:
`UM_A1_PLAYWRIGHT_MODULE=/absolute/path/to/installed/playwright/index.mjs node scripts/test-um-a1-client.mjs --run`.
It defaults to dry-run without `--run`; syntax and dry-run passed. Output is a
fresh temp source copy/report. Source/output archive or source-symlink paths are
refused before copying. The optional runtime module is tooling, not a new app
dependency or a package/lockfile change.

## Final custody and source check

Filesystem comparison to the pre-patch freeze passed: all nine parity artifacts,
all five027–031 migration files, package.json/package-lock.json and the finalized
fixture manifest (17 protected hashes) are unchanged. Manifest SHA remains
`c1865de37b0a65f2a8fb573145ad9c39c92a4b631c239660a92b1b2c25031b3a`.
This is filesystem evidence; no fresh DB/profile/session claim is made.
Unrelated existing source/documentation dirty work is preserved; only the seven
corrective paths and five authorized status/result documents changed/appeared in
this follow-up. HEAD/index remain unchanged. Private QA copies/logs are not release
source. No package install/config/migration/archive or external publication ran.


## Later native Turbopack verification — 2026-11-02

Owner subsequently approved default `npm run build` on Node24 using test API
settings, with no source/package/lockfile/CI change, DB/Production, old fixture run
or publication. The canonical checkout was built in a fresh native Terminal
session outside Codex IPC restrictions, not with a webpack override.

At00:35:37–00:35:41 Asia/Bangkok: Node24.2.0, npm11.3.0, Next16.4.2
**Turbopack PASS**, exit0. Compilation, TypeScript, static page generation and
route/proxy build completed. Existing build cache was retained; this is not a
clean-cache or CI result. Earlier sandbox IPC/EPERM failures remain their actual
results; native execution establishes PASS for this same candidate outside that
restriction without a source/config workaround.

The build process used a minimal environment and explicit
`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9`, synthetic anon placeholder,
local APP_ENV and telemetry disabled. Those values take precedence over Next's
automatic dotenv loading. No app server, Docker, Auth/DB operation or old fixture
runner was started. Build artifacts contain the placeholder API and are for this
build check only; real Docker acceptance must rebuild with approved local values.

Evidence outside repo: `/private/tmp/um-a1-native-build-freeze.hAXd26/`:
`preflight.json`, `started.json`, `build.log`, `result.json`, `postflight.json`.
All19 frozen source/config/package/proxy/CI/index/next-env hashes and all17
protected filesystem hashes match before/after; no staged files. Only ignored
build output and host-local result artifacts were generated. This later receipt
and checkpoint update record the result without changing application source.

Default Node24 build blocker is closed. Corrected real Docker/Auth/API acceptance,
Node22 CI execution and fresh hosted checks remain NOT RUN; no release or fixture
write authority is inferred. The finalized105-account run remains closed.
