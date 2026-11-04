# UM-A1 — Solo release review plan

Prepared: **2026-11-02 (Asia/Bangkok)**. Status: **PLAN ONLY / OWNER REVIEW**.

**Later S0 release proposal — 2026-11-04:** use the [S0 Solo plan](./S0_SOLO_RELEASE_PLAN_20261104.md)
and S0canonical checkpoint for actual progress/limits. A1remains locally
validated/unreleased,its9sourcepaths excluded from S0. The27-path/67baseline
below is dated pre-S0 planning,not a current A1publication envelope. After any
S0publication,recalculate A1changedpaths/quality/rollback;never remove032 in
A1clientrollback. No A1runtime/fixture/publication authority is added here.

**Later S0-first planning decision — 2026-11-02:** Owner agreed to prepare
[focused S0 local scope](../plans/security/05-s0-boq-writer-boundary-plan.md#7-local-approval-packet--2026-11-02)
before A1 publication. This is planning only, not S0 implementation/release
authority. This A1 proposal is held for that path;27files/67c1e6f below retain
their reviewed pre-S0 stage. After S0 publication, derive the actual A1 changed
paths/count, source/contracts and healthy rollback target again; some shared
documents may already be in HEAD. Keep all accepted A1 runtime hashes/evidence,
and keep S0 policies in any later A1 client rollback. Section8's order options
record the earlier proposal; do not repeatedly ask the same order question.

Owner requested this local release proposal. No staging, commit, push,
deployment, Production access, DB/Auth/fixture operation or configuration change
is authorized. The future operations below are conditional proposals, not work
already performed. Progress/authority remains in the [canonical UM checkpoint](../plans/product/12-user-management-um-a-and-um-b-plan.md#12-execution-status-and-resume-checkpoint).

## 1. Release purpose and existing-user impact

Release the completed **Admin-only UM-A1** directory, read-only user details and
truthful labels. Account status and actual/requested/missing affiliation are
shown separately. Active accounts without actual affiliation stay active under
their existing role/scope; loading or retrying does not repair or approve them.

The directory shows25 records with a26-row cursor request, complete current-page
reference batches, explicit unavailable/legacy states and one responsive action
tree. Commands retain current server RPC semantics; actor/request guards and
canonical rereads prevent stale dialogs/responses from patching the wrong row.
UNKNOWN outcomes retain their request UUID; a timeout does not prove failure.

Ordinary users keep the same Login, email confirmation, profile/pending flow,
roles/scopes, BOQ list/editor/Copy and accepted Print/PDF/Excel. Admins get a new
directory layout, page navigation and details Sheet; existing commands still
write only when an Admin deliberately submits them. Existing accounts/passwords
are not migrated. This is a bounded impact assessment, not a zero-risk promise.

Not included: S0 policies, signup/email improvements (A2), trusted affiliation
repair (UM-B), new roles, SSO, domain policy, workflow/TOR, Quantity Expression,
global fonts/tokens/primitives, Catalog/Factor F or any schema/RPC/migration.
Use [UM #12](../plans/product/12-user-management-um-a-and-um-b-plan.md) for the
remaining backend conflict/idempotency and identity-management decisions.

## 2. Exact source, target and stop conditions

Fresh **local** inspection for this proposal:

- Checkout `/Users/cloud/Cloudstellar/conduit-boq`, branch `main`.
- HEAD = local `origin/main` = `67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`;
  tree `ec3dc96e53a27c59612b2670ed57d49d0c807584`, upstream `origin/main`,
  local ahead/behind0/0, index empty. No fetch or hosted observation was made.
- This is docs-C baseline. Its application/package/CI paths match recorded L1
  `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`; that does not establish what
  Production is running now.
- Proposed source is that HEAD **plus only the27 paths in section3**. Actual
  commit/tree SHA does not exist yet. Freeze all27 path/blob hashes before
  staging; the reviewed application hashes below must still match local tests.
- Future target, subject to fresh confirmation: GitHub `origin/main`, Vercel
  `cloudwho-2662s-projects/conduit-boq`, Production domains
  `boq.ntconduit.com` and `conduit-boq.vercel.app`.
- Expected rollback is the healthy **current pre-A1 deployment at exact67c1e6f**,
  only if fresh source/config/eligibility checks confirm it. Never substitute
  older L1/B/A deployments automatically. Drift means stop and report.

Source hashes accepted by the local functional and settled visual receipts:

| Runtime path | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `6b5e83d1507f4232b8d74aa555c21d5d14e65a65fa389de2440fe3a7039c096a` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `ca63e328c36654a838ee269ee87019d054cae85c0425d80bab9604c981a69a29` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `1233a51aeeee7b81d1aa9a4038fb35875703f3662263f423152f0bfb76f51d8b` |
| `lib/admin/users/directory.ts` | `c363f884e80178401f1e12b37f0a521e9cb4b60b0da73b7eaff67c4e64464d09` |
| `lib/admin/users/presentation.ts` | `528a460dd26855377e643dd160b8f5570b4abc75ace4462687717a3f9f619b96` |

## 3. Exact27-file allowlist

**Runtime5**:

1. `app/admin/page.tsx`
2. `app/admin/_components/AdminUsersDirectory.tsx`
3. `app/admin/_components/AdminUserDetailsSheet.tsx`
4. `lib/admin/users/directory.ts`
5. `lib/admin/users/presentation.ts`

**Tests3 + mocked integration runner1**:

6. `tests/admin-user-directory.test.ts`
7. `tests/admin-user-presentation.test.ts`
8. `tests/admin-users.test.tsx`
9. `scripts/test-um-a1-client.mjs`

The mock runner uses only temporary copies and in-memory fake Auth/Data API.
It defaults to dry-run, adds no package and is not automatically run by CI.
Its optional installed Playwright requirement and development-font fallback are
documented limits; it is not a Production smoke or real-DB runner.

**Planning/handoff/receipts18**:

10. `AGENTS.md`
11. `docs/07_process/RELEASE_PROCESS.md`
12. `docs/08_ai/AI_CONTEXT.md`
13. `docs/08_ai/AI_HANDOFF.md`
14. `docs/08_ai/LESSONS_LEARNED.md`
15. `docs/LOCAL_SUPABASE.md`
16. `docs/ai/UX_GUIDELINES.md`
17. `docs/plans/product/01-conduit-boq-product-evolution-decision-plan.md`
18. `docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md`
19. `docs/plans/product/10-global-estimating-research-and-capability-backlog.md`
20. `docs/plans/product/11-nt-brand-system-and-sitewide-ui-rollout-plan.md`
21. `docs/plans/product/12-user-management-um-a-and-um-b-plan.md`
22. `docs/plans/security/05-s0-boq-writer-boundary-plan.md`
23. `docs/06_engineering/UM_A1_LOCAL_RESULT.md`
24. `docs/06_engineering/UM_A1_CORRECTIVE_LOCAL_RESULT.md`
25. `docs/06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md`
26. `docs/06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md`
27. `docs/07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md`

The18 documents keep current handoff, roadmap and linked evidence together;
otherwise a fresh clone would lose linked local plans/receipts. Publishing NT,
S0 or UM-B **plans** does not approve their implementation. Preserve historical
FAIL, dated observations and B Production HTTP **NOT RUN/closed**. Private paths
in receipts are evidence references, not files to upload or links to expose.

### 3.1 Explicit exclusions and custody

Keep these **nine parity tooling/baseline files** local, byte-identical and
unstaged; they are not prerequisites to publish with A1:

1. `scripts/local-db-parity-fixtures.mjs`
2. `scripts/local-db-parity-schema.mjs`
3. `scripts/local-db-parity.mjs`
4. `scripts/local-db-parity.test.mjs`
5. `supabase/local/parity-capture.sql`
6. `supabase/local/baselines/20261023-production-contract/acceptance.json`
7. `supabase/local/baselines/20261023-production-contract/manifest.json`
8. `supabase/local/baselines/20261023-production-contract/platform-differences.json`
9. `supabase/local/baselines/20261023-production-contract/source.json`

Also exclude `scripts/test-um-a1-local.mjs`, `scripts/test-um-a1-real-api.mjs`,
`scripts/test-um-a1-real-local.mjs`, `scripts/test-um-a1-visual-local.mjs` and
all `supabase/local/um-a1/**`. These real local runners depend on private/parity
or finalized-run custody; they are not fresh-clone release smoke tools. Do not
ship their prerequisites to make them executable or reopen either fixture run.

No `.env*`, passwords/keys, raw profiles/Auth responses, cookies/tokens, private
screenshots/traces/reports, backups, ignored build/output files or archive
content. No package/lockfile, CI/Vercel/Supabase configuration, shared Auth,
global theme/fonts/assets or migration changes. Migrations027–031 remain
immutable/no-replay. Do not use `git add -A`, broad cleanup, reset or force push.

## 4. Evidence and remaining gates

| Check | Result and boundary |
|---|---|
| Corrected client/controllers/presenter/UI unit/static suite | Historical PASS845tests/63files in dirty workspace; includes excluded parity6tests/1file. This is not the prospective release count. |
| Corrective actual-page fake API integration | PASS9groups; actor/reread/UNKNOWN/request lifetimes and announcements; fake backend only. [Corrective receipt](../06_engineering/UM_A1_CORRECTIVE_LOCAL_RESULT.md). |
| Actual existing Docker functional acceptance | PASS31APIchecks/13distinct browsergroups,143profiles across6pages; current authorization, command UUID/replay/timeout/races and unchanged originals. [Real Docker receipt](../06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md). |
| Default Turbopack / TypeScript on Node24 | PASS on canonical application bytes, native Node24.2.0/npm11.3.0/Next16.4.2. No source/config workaround. Cached build, not CI/cold-build proof. |
| Settled desktop/mobile visual/custody | PASS29/29 actual PNGs inspected by two reviewers; specific resting-layout gap closed. [Visual receipt](../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md). |
| Retained fixtures/sessions | Old105 and new18 finalized, no reactivation/login/reopening authority. Dedicated visual session cleaned; originals retained. |
| Exact27-path prospective source static/unit checks | PASS839tests/62files; lint0errors/3existing warnings; standalone TypeScript PASS on Node24. No DB/Auth/browser operation. Details below. |
| Prospective Markdown link closure / documentation contracts | PASS394relative links/51anchors across18Markdownfiles;22authority/documentation contracts included in the839-test suite and rechecked after final plan/checkpoint edits. |
| Fresh remote/Vercel/config/Admin contracts/rollback | NOT RUN; no Production access authorized in this planning request. |
| Actual release commit Quality/Vercel and Production smoke | NOT RUN / publication NOT AUTHORIZED. |

The visual receipt does not certify Safari/real devices/actual browser zoom,
audible screen readers, full WCAG or sitewide NT-font adoption. Timestamp ties
are covered by focused tests; no real timestamp-tie fixture was manufactured.
A1 tests did not issue BOQ Save/Copy writes. B Production HTTP remains closed
NOT RUN; another B business probe is not a release gate for this UI release.

CI currently uses **Node22**, Ubuntu, `npm ci`, lint, Vitest and default build;
local acceptance used **Node24**. CI has no standalone `tsc`, Docker suite or
audit step. Future actual-commit CI must pass on its current configuration;
do not change Node/CI/package/lockfile silently. `npm ci` is only the existing
future CI step, not permission to install/update local dependencies now.

### 4.1 Local planning verification and retained failures

Prepared an isolated file projection from `git archive HEAD` plus exactly the27
allowlisted files, using a symlink to already installed dependencies. No Git
worktree/index was created or staged; no package install/update occurred.
Only unchanged tracked public `.env.example` was copied, never local env/secrets.
Tests used explicit dummy API `http://127.0.0.1:9` and placeholder anon value.
The four real runners, parity9 and all fixture/evidence directories are absent.

Final all-path whitespace review also replaced four Markdown hard-break spaces
with equivalent backslashes in NT#11/S0#05 and removed an extra EOF blank line
from each new18/visual receipt. Recorded outcomes/history were not changed.

Actual Node24.2.0 checks: `npm test` **839/839 in62files PASS**, `npm run lint`
**0errors/3existing warnings**, `tsc --noEmit --incremental false` **PASS**.
The excluded parity suite explains845→839; no test was disabled or rewritten.
Lint warnings remain in unchanged blocked-page/useUser navigation code.

First projection test invocation retained **836PASS/3FAIL** because three old
catalog tests run read-only `git ls-tree/show/grep` and an archive has no`.git`.
After inspecting their calls, the second run provided read-only Git metadata
via `GIT_DIR`/`GIT_WORK_TREE`, with optional locks disabled; all839passed. No app,
test or repository metadata changed. Two earlier projection-setup guards also
stopped before tests (public example-env refusal, unsupported Python tar filter);
their history remains private. These are tooling failures, not DB-flow failures.

Private planning proof: `/private/tmp/um-a1-release-plan-ea0mk6d3/` contains
allowlist/content manifests, both test logs, lint/TypeScript/link results and
protected-hash checks. Do not publish that directory. The prospective build
itself was **NOT RUN** here; the same five runtime hashes retain actual native
default Turbopack/TypeScript PASS in the visual receipt. Exact-source build and
actual hosted CI remain pre-publication/post-push gates respectively. No Docker,
API/Auth/browser/Production call was made to validate this plan.

## 5. Proposed preflight after explicit execution approval

Do local checks first, then only the approved read-only hosted checks. A failed
gate stops publication; do not repair drift or widen data access automatically.

1. **Source/custody:** reread checkpoint and authority; fresh branch/HEAD/upstream,
   index/diff, remote main and exact27-path content manifest. Require main and
   remote expected67c1e6f, empty index, unchanged accepted runtime hashes and
   protected nine parity/package/lockfile/027–031/finalized-manifest hashes.
   Inspect content for secrets/PII and verify the staged tree cannot include
   excluded files. Do not change ignored local credentials or old data.
2. **Prospective quality:** use HEAD+exact27 files with installed dependencies
   and explicit dummy test API values; tests, lint, TypeScript and default
   Turbopack build must be accounted for. Prior native build/Docker/visual
   receipts remain applicable only while relevant app/config/contracts match.
   Re-run a needed source-only check without opening fixtures; if fresh DB/Auth
   testing is needed, stop and propose that bounded scope before doing it.
3. **Hosted source/config/rollback:** read exact GitHub main and Vercel project,
   Production Current deployment commit/artifact, domains, Node24.x/build/env
   mapping and rollback eligibility. Never print credential values. Require
   the expected pre-A1 source and compatible recorded settings; retain exact
   deployment ID/URL/source as rollback target. No config/env edits or promotion
   occur in preflight. If retained artifact is ineligible, hold for a revised
   rollback plan rather than assume the button will work.
4. **Relevant backend metadata only:** after separately scoped approval, read
   definitions/signatures/owner/ACL/config and relevant policies/helpers for
   `get_my_profile_v2`, `get_admin_profiles_page`, the six existing Admin
   commands (`admin_approve_user`, `admin_reject_user`, `admin_set_user_role`,
   `admin_deactivate_user`, `admin_suspend_user`, `admin_reactivate_user`) and
   organization/department/sector reference reads. Check active-Admin/current
   role guards, cursor raw timestamp/ID descending, returned fields and directory
   limit≥26. Confirm effective API cap matches accepted local1000; the complete
   reference batches can contain **50 distinct IDs** per department/sector
   request (actual+requested for25users), so cap≥26 alone is insufficient.
   A lower/unverified cap means HOLD, not a configuration change or presumed
   missing affiliation. Compare to accepted local contracts; record
   actual PostgREST version separately from any dashboard label. Do not infer
   parity from version alone or read unrelated accounts/BOQs.
5. **Post031 invariant:** narrowly verify metadata/ledger against the recorded
   031 receipt, including definition SHA
   `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`
   and ledger `20261023063934/boq_duplicate_stale_conflict_guard`. No business
   RPC, DDL, schema repair or migration application/replay. This is not B HTTP
   behavior testing or a full database/parity recapture.

No Production check in this plan has run. Future authorization must expressly
cover these hosted reads; failure/unknown relevant parity means HOLD, not PASS.

## 6. Proposed Solo publication and bounded smoke

One exact27-file commit on `main`, normal push, existing Quality and Vercel
auto-deployment. No extra PR/branch/process is required for this sole maintainer.
Only after all preflight gates and explicit publication approval:

1. Stage the27 named paths individually; inspect staged names/stat/full diff,
   `diff --check` and protected hashes. If any path is extra/missing, stop before
   commit. Freeze the exact candidate commit/tree and retain the previous HEAD.
2. Normal push only. Monitor **both** Quality and Vercel for the same commit;
   Production may become Current before CI finishes because the existing
   workflow is not a deployment gate. Require Quality PASS and Vercel
   Ready/Production/Current with exact source/domains/config.
3. In a low-use period, avoid interrupting a submitted Admin command. There is
   no Copy/DDL outage for this client-only release. A browser already open on
   old assets may need a reload after its command has settled.
4. Perform a bounded approximately10–15minute **business-no-write smoke**:
   Login/normal navigation, Admin first/next/back/refresh, read-only details,
   desktop/mobile/keyboard, truthful status/affiliation, current-page reference
   completeness, console/network and request counts. Existing non-Admin role
   checks may use an already available authorized session; do not create users,
   change roles or represent an unavailable persona check as PASS. Ordinary BOQ
   list/editor/saved Print reads only if explicitly included in the approved
   smoke; no Save/Copy request or output-state mutation.
5. Existing Admin commands remain live but **must not be exercised on real
   accounts for smoke**: no approve/reject/role/status/affiliation/domain setting
   action. All six mutating Admin RPCs and BOQ business writes are excluded.
   Only current-page profile fields needed by the approved Admin smoke may be
   read; redact email/name/UUID/notes from published screenshots/logs. Do not
   export a whole directory. Local test limits must remain visible in receipt.
6. Authentication may create/refresh sessions and audit timestamps. It is not
   literal zero-DB-write. Future approval must identify existing account/session
   custody and permit normal Auth bookkeeping. Prefer an existing Owner session;
   if a dedicated new session is approved, retain its identity and use only
   validated `scope:'local'` cleanup. No UI/global logout or removal of old
   sessions. If safe cleanup cannot be established, stop before new login.
7. Record exact commit/tree/deployment/CI URLs, PASS/FAIL/NOT RUN and known limits.
   Update the canonical checkpoint and a new dated receipt locally. A second
   documentation commit/push is not implicit in the one-release approval.

No whole-table DB snapshot, new fixture run, password reset, account repair,
Catalog/Factor mutation or backup operation is needed for this release.

## 7. Risks, protections and rollback

| Risk | Prevention / stop condition |
|---|---|
| Admin directory unavailable or data visible to wrong actor | Fresh relevant contract/ACL checks; existing active-Admin guards, generation/actor isolation; rollback on confirmed new unauthorized visibility or wrong-target behavior. Do not gather unrelated user data to demonstrate it. |
| Stale/late/unknown command response | Single flight, UUID ledger, canonical reread; no automatic repeat or optimistic authority repair. Freeze commands if outcome is unknown; preserve UUID and seek a bounded audit review if necessary. |
| Actual/requested affiliation mistaken for authority | Separate labels/read-only details; no auto-backfill. UM-B is still required for separately reviewed trusted corrections. |
| Concurrent changes by two Admins | Current backend semantics unchanged; A1 is not reviewed-state conflict control. Keep as documented UM-B residual; do not claim client guards solve it. |
| Cursor membership changes while browsing | Deterministic created_at/id order, fresh authorization and explicit refresh; not a frozen DB snapshot/global search/total count. |
| CI/build/runtime or deployment drift | Exact source projection and real commit CI; current Vercel Node/config/rollback checks. No silent package/config/DB fix. |
| Private tooling/data published accidentally | Exact27 allowlist/content review; parity9, real runners4 and private fixtures/reports excluded; no blanket staging. |
| Remaining S0 writer-boundary gap | Separate confirmed source/captured-metadata issue, not fixed by A1. Recommend focused S0 first; Owner must explicitly choose order. No fresh Production exploit/prevalence claim or inferred waiver. |

### 7.1 Conditional rollback proposal — new approval required

Trigger: confirmed A1 regression denying existing Admin use, wrong-account action,
unauthorized directory exposure, persistent material page/error/render regression,
or actual-source Quality/Vercel failure. Stop new Admin commands and preserve
evidence. A command already accepted by the server may still complete; client
rollback cannot cancel it or undo account changes. Never guess a new request UUID
or delete/repair data as part of rollback.

1. If A1 became Production Current and **that exact A1 deployment is still
   Current immediately before action**, use **one conditional hosted rollback** to
   the fresh verified healthy pre-A1 exact deployment from preflight. Check
   eligibility and current traffic/source immediately before action. If A1
   never became Current, keep the healthy Current deployment; do not perform
   an unnecessary hosted rollback. No DB/DNS/config mutation is included.
2. Freeze other `main` pushes, including documentation, until hosted/Git source
   convergence. Require remote/main still exactly the A1 commit and no competing
   edits to the nine paths; an intervening commit/deployment means HOLD and
   review, not overwriting somebody else's work. Restore Git convergence with
   **one forward rollback commit** against the
   exact A1 commit: restore `app/admin/page.tsx` to pre-A1 HEAD and remove the
   other eight new code/test/mock paths in section3. Preserve all18 Markdown
   plans/receipts and record rollback chronology. Do not revert the entire27-file
   commit, erase history, force push or stage unrelated work.
3. Verify restored runtime equals the approved pre-A1 runtime, run relevant
   quality checks, normal push/deploy and confirm CI/Vercel/source. If hosted
   rollback changed auto-assignment behavior, use only the explicitly approved
   promotion of this exact verified healthy forward-rollback deployment. Never
   promote an unrelated build to make Git and hosting appear aligned.
4. Verify bounded no-write health as authorized, record residuals and stop.
   No reset/restore, role/status/affiliation undo or migration replay. If source,
   rollback eligibility/config or required checks no longer match, stop and
   propose the concrete next step rather than improvising another release.

Future Solo approval may cover this one hosted rollback and one forward rollback
with normal publication/promotion when the above criteria are met. Earlier
A/B/L1 rollback permissions are consumed and cannot be reused. Neither rollback
nor release execution is approved by preparation of this plan. A future
conditional rollback grant expires at the release's recorded closeout; it is
not standing permission for a later unrelated regression or deployment.

## 8. Owner decisions before execution

1. Accept the exact27-file envelope and retained local evidence limits; keep
   parity9, real runners4, fixture manifests and private evidence out.
2. Choose **focused S0 before A1 (recommended)**, or explicitly release the
   completed A1 first while retaining the separate S0 residual. No S0 source,
   SQL or DB operation is authorized by either this plan or its documentation.
   If S0 ships first, this plan's predecessor/target/contracts must be refreshed
   before A1; exact67c1e6f is then no longer an acceptable unchanged base.
3. Authorize a future bounded preflight/publication/smoke envelope, including
   read-only hosted metadata, current-page Admin data and normal Auth session
   bookkeeping if needed, plus the conditional rollback above if desired.

**Current action stops at local plan/checkpoint review.** No permission is
inferred from a proposed checkbox or a previous completed local test.
