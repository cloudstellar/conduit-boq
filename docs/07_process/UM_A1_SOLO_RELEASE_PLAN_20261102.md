# UM-A1 — Solo release review plan

Prepared: **2026-11-02 (Asia/Bangkok)**. Refreshed: **2026-11-05**.
Status: **EXACT14 SOLO RELEASE APPROVED — FRESH PREFLIGHT PASS WITH RECORDED LIMITS**.

Current proposal is **14 paths: runtime5 + tests3 + mockrunner1 + Markdown5**
on local HEAD6393355. The old27-path/base67 proposal is dated pre-S0 planning;
its18 documents are already tracked in HEAD. Do not republish unchanged paths
or use the old rollback assumption. Progress/authority belongs to
[UM checkpoint section12](../plans/product/12-user-management-um-a-and-um-b-plan.md#12-execution-status-and-resume-checkpoint).

The Owner subsequently approved the exact 14-file Solo release, actual CI,
Vercel, anonymous Login delivery and the conditional rollback in section 7.1.
Fresh preflight matched source 6393355, the same Vercel artifact and config,
Data API cap 1,000 and the 19 functions, four relations, 24 policies and 32
ledger rows in section 4.4. The metadata read finished at 08:17:33 UTC.
See the [current release checkpoint](../plans/product/12-user-management-um-a-and-um-b-plan.md#126-solo-publication-checkpoint--2026-11-05)
for the private receipt. Publication and smoke results are recorded there
after verification. Production Admin behavior remains NOT RUN.

The initial request authorized local Markdown refresh. Owner later explicitly
approved14-path source-only Node24 tests/lint/TS/defaultTurbopack/mock integration;
that qualification is complete/consumed (section4.3). Owner then approved only
read-only Production source/config/metadata/rollback preflight;completed in4.4.
No source/package/lockfile/DB changes,real Auth/Docker/fixtures/account or BOQ
reads/businessRPC or publication were authorized.
All old A1 fixtures stay finalized;027–032 immutable/no-replay.
S0 source/032 application and closeout-document grants are complete/consumed;
use [S0 section13](../plans/security/05-s0-boq-writer-boundary-plan.md#13-production032-one-shot-application--2026-11-05)
for the dated Production metadata/history outcome, not permission to read it again.

## 1. Release purpose and existing-user impact

Publish the completed **Admin-only UM-A1** directory/details and truthful labels.
Account status, actual affiliation and requested affiliation are distinct.
The directory uses25 records/26-row cursor reads, complete current-page reference
batches, explicit error/legacy states and one responsive action tree. Actor,
request-generation and dialog ownership guards protect against stale responses.
Existing command UUID/canonical-reread semantics remain unchanged.

| Audience or case | Resulting behavior / limit |
|---|---|
| Ordinary existing users | Same Login/email confirmation/profile/pending flow, roles/scopes and BOQ list/editor/Copy/outputs. No account/password/session migration or new signup/domain policy |
| Existing Admin | New NT-compatible directory, cursor navigation and read-only details Sheet. Six existing account commands remain deliberate actions; page load/refresh/Sheet does not submit them |
| Active account with no actual affiliation | Shows active plus unassigned actual affiliation and separately requested values. It stays active under existing scope;A1 does not approve/backfill affiliation, change its role or repair old approval history |
| Pending complete/incomplete/rejected account | Truthful existing-state labels and existing eligible command rules. Active legacy accounts do not become pending to make the approval action available |
| Requested affiliation seen as orange in old UI | A1 clarifies what is actual versus requested. Trusted correction of the underlying NULL affiliation remains the narrow UM-B release after A1 |
| Corporate-email restriction | Existing Admin option and Supabase Auth behavior remain unchanged; no new mandatory @ntplc.co.th policy or silent change affecting existing users |

This is a bounded impact assessment, not a zero-risk promise. Multi-Admin server
conflict control, durable cross-reload command recovery and trusted legacy
confirmation are UM-B work. UNKNOWN is not failed; preserve its existing UUID,
do not retry with another UUID or infer an approval from the current row alone.

Not included: A2 signup/email improvements, UM-B SQL/repair, new roles/Viewer,
SSO, workflow/TOR, Quantity Expression, global theme/fonts/tokens, Catalog/Factor F,
shared Auth/domain settings, schema/RPC/migration or package/lockfile/config changes.

## 2. Exact source, target and stop conditions

Fresh **local-only** inspection for this refresh:

- Checkout `/Users/cloud/Cloudstellar/conduit-boq`,branch `main`,upstream `origin/main`.
- HEAD = local `origin/main` = `639335546b018bdfbf6e37e854af308693158a53`;
  tree `2dce4710c113adc507d9b29d9df14c0ef07b1642`,ahead/behind0/0,index empty.
  The initial plan refresh was local-only. Later Owner-approved hosted preflight
  confirmed GitHub main and Vercel Current at this exact639;see4.4. Existing
  A1/parity/private work retained.
- Application content at this base equals S0 source release
  `4dfdc44c1a8ce0e0310f466f7568e5d83240e77c`;6393355 changes only five closeout documents.
  Keep the Login logo `prefetch={false}` fix and all source027–032 intact.
- Proposed candidate is **HEAD6393355 plus exactly14 paths in section3**.
  Actual candidate commit/tree and fresh quality results do not exist yet.
  Freeze final path/content hashes after all allowed document edits and before staging.
- Future target, subject to a separately approved fresh check:GitHub
  `cloudstellar/conduit-boq`/main,Vercel `cloudwho-2662s-projects/conduit-boq`,
  domains `boq.ntconduit.com`/`conduit-boq.vercel.app`.
- Read-only preflight confirmed the healthy pre-A1 rollback candidate onNov5:
  `dpl_7d9EfUvHhTpKtEEBprybrb8waCn3`,source6393355,
  `https://conduit-dr43fe3w9-cloudwho-2662s-projects.vercel.app`.
  Refresh actual Current/source/config/eligibility before release. Do not use67,
  older L1/B/A or pre-S0 application code as substitutes.

All nine A1 hashes still match the frozen accepted candidate:

| Path | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `6b5e83d1507f4232b8d74aa555c21d5d14e65a65fa389de2440fe3a7039c096a` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `ca63e328c36654a838ee269ee87019d054cae85c0425d80bab9604c981a69a29` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `1233a51aeeee7b81d1aa9a4038fb35875703f3662263f423152f0bfb76f51d8b` |
| `lib/admin/users/directory.ts` | `c363f884e80178401f1e12b37f0a521e9cb4b60b0da73b7eaff67c4e64464d09` |
| `lib/admin/users/presentation.ts` | `528a460dd26855377e643dd160b8f5570b4abc75ace4462687717a3f9f619b96` |
| `tests/admin-user-directory.test.ts` | `71f19226928d3fc351fcc356247570420a21cfffe45935d10aeb6d61ac502bbd` |
| `tests/admin-user-presentation.test.ts` | `138f700867e00aa401d73e318defb8c3adebeecbda5a3fd35b34d1924c7b17ae` |
| `tests/admin-users.test.tsx` | `2e593f97d8168ff5fd0ae4623b4e0dbb1895f823c2b9e99e75f7d8883257c50f` |
| `scripts/test-um-a1-client.mjs` | `6f2c6db2d7449c8e58369776ed250ab26c5a33e2206f78e23cf557165535323e` |

Hash equality preserves evidence identity; it is not a new runtime PASS.
Unknown source/base/config/backend-contract drift stops publication. Do not
repair parity, change packages or widen DB/Auth tests automatically.

## 3. Exact14-file allowlist

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

**Planning/handoff5**, the only documents changed in this refresh:

10. `AGENTS.md`
11. `docs/08_ai/AI_CONTEXT.md`
12. `docs/08_ai/AI_HANDOFF.md`
13. `docs/plans/product/12-user-management-um-a-and-um-b-plan.md`
14. `docs/07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md`

Existing linked receipts/roadmap/brand/S0 documents are already in HEAD. Keep
their dated evidence unchanged; they need not be staged for link closure.
The mock runner uses temporary copies/in-memory fake Auth/Data API, defaults
to dry-run, adds no package and is not a Production or real-DB smoke tool.
Installed Playwright and font-fallback limits remain explicit; a new mock run
must use new output paths and cannot reopen real fixture runs.

### 3.1 Explicit exclusions and custody

Keep these nine parity tooling/baseline files byte-identical and unstaged:

1. `scripts/local-db-parity-fixtures.mjs`
2. `scripts/local-db-parity-schema.mjs`
3. `scripts/local-db-parity.mjs`
4. `scripts/local-db-parity.test.mjs`
5. `supabase/local/parity-capture.sql`
6. `supabase/local/baselines/20261023-production-contract/acceptance.json`
7. `supabase/local/baselines/20261023-production-contract/manifest.json`
8. `supabase/local/baselines/20261023-production-contract/platform-differences.json`
9. `supabase/local/baselines/20261023-production-contract/source.json`

Also exclude the four real local runners:`scripts/test-um-a1-local.mjs`,
`scripts/test-um-a1-real-api.mjs`,`scripts/test-um-a1-real-local.mjs`,
`scripts/test-um-a1-visual-local.mjs`,and every `supabase/local/um-a1/**` file. Do not ship their
private prerequisites or reopen finalized105/18 runs. Preserve credentials,
original data,closed-run receipts and protected archives; do not inspect archives.

No `.env*`,keys/passwords/PII/raw Auth/profile responses,cookies/tokens,private
screenshots/traces/backup/output/pdf/dependencies. No package/lockfile,CI/Vercel/
Supabase/Docker config,global UI/Auth/Catalog/Factor F or migrations027–032.
No blanket staging/reset/restore/reseed/force-push. Extra required files mean
stop and revise the reviewed envelope,not silently add a fifteenth path.

## 4. Evidence and remaining gates

| Evidence | Actual state and boundary |
|---|---|
| A1 nine source hashes | MATCH accepted candidate in this local refresh;no source edits |
| Pre-S0 source/unit quality | DATED845/63 dirty workspace included parity6/1;DATED839/62 exact27 projection excluded parity. Neither is fresh post639 quality |
| Actual-page fake backend integration | DATED PASS9groups;actor/reread/UNKNOWN/request lifetimes and announcements. Fake backend only;[corrective receipt](../06_engineering/UM_A1_CORRECTIVE_LOCAL_RESULT.md) |
| Real existing-Docker acceptance | DATED PASS31APIchecks/13distinctbrowsergroups/143profiles6pages;current authority/UUID/replay/races/custody. [Real Docker receipt](../06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md) |
| A1 default Turbopack/TypeScript | DATED native Node24.2.0 cached-build PASS on five runtime hashes;not a fresh post-S0 candidate build |
| Settled visual/custody | DATED PASS29/29 reviewed PNGs;[visual receipt](../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md). Not Safari/real device/actual zoom/audible screen-reader/full WCAG/sitewide NT-font certification |
| Old105/new18 fixtures | FINALIZED;no reuse/reactivation/login/new Auth authority. Old FAIL/HOLD/rejected images preserved |
| S0/032 compatibility | Local source/evidence review supports reuse of dated A1 evidence:032 adds only nine BOQ-write policies;selected Admin/profile helpers unchanged in its normalized metadata check. This does not cover every Admin dependency or current live metadata |
| Baseline639 Quality/Vercel | Recorded PASS801tests/61files,lint0errors3warnings,TypeScript/build;Vercel Ready/current at closeout. Excludes unpublished A1;not an A1 acceptance result |
| Post639 exact14 source qualification | PASS on Node24.2.0:878tests/64files,lint0errors/3oldwarnings,standaloneTypeScript,fresh defaultTurbopackbuild and9/9mockgroups. Section4.3 retains initial symlink-build FAIL and mock limits;no real DB/Production acceptance |
| Read-only Production preflight | PASS with recorded limits:source639/config,19function contracts/4profile-reference relations,APIcap1000,031/032policies/history and healthy639 rollback candidate. No account/BOQ/RPC read;future rollback eligibility conditional. See4.4 |
| Actual A1 commit CI/Vercel/anonymous delivery | NOT RUN / NOT AUTHORIZED |
| Production authenticated Admin/business HTTP/RPC | NOT RUN;not a mandatory new write test. All six mutating commands and real-account changes excluded from default smoke |

A1 did not issue BOQ Save/Copy writes. B Production HTTP remains NOT RUN/closed;
S0 Production business HTTP remains NOT RUN. No new calculation/Copy/fixture
programme follows from this UI release. Existing active-NULL presentation is
covered by dated original-record reads;that is not permission to log in as them.

CI's existing Node22 `npm ci→lint→test→build` and local Node24 acceptance are
distinct. CI has no standalone tsc,Docker suite or audit step. Do not alter CI,
Node settings,dependencies or lockfile;local installation is not authorized.

### 4.1 Local planning verification and retained failures

**DATED PRE-S0 RECORD — 2026-11-02, retained verbatim below.** Exact27/base67
and839 counts describe that projection only,not this14-path candidate.


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


### 4.2 This refresh and source-quality decision

**Earlier planning-only stage — 2026-11-05:** this refresh changed only the five
Markdown paths in section3. It read local source/receipts and hashes;no application
tests/lint/tsc/build/mock browser or
DB/Auth/Docker/Production operation runs. Document/link/whitespace checks and
custody results are recorded in the canonical UM checkpoint/private planning
receipt. No runtime PASS is inferred from those checks.

Actual planning checks on Nov5:6existing documentation contracts PASS;
20Markdown/601relative links/213anchors PASS;whitespace/source-hash/custody
checks PASS. This is documentation verification,not the fresh14-path quality
gate. Private proof:`/private/tmp/um-a1-post-s0-plan-20261105-k0r3erzd`.

That proposed source-only qualification was subsequently explicitly approved
and completed in section4.3. Do not ask to repeat it merely because the next
phase begins. Use its source hashes and dated Docker/visual evidence while
relevant inputs/contracts match. A demonstrated drift/coverage gap requires a
new bounded proposal,not reopening old runs or silently fixing source/DB.

### 4.3 Actual post-S0 source qualification — 2026-11-05

Owner approved source-only14 on Node24,including tests/lint/TypeScript/default
Turbopack/mock integration;no source/package/lockfile/DB/oldfixture/Production/
publication. Exact snapshot=HEAD639+14;five subsequent checkpoint edits are
verified separately as Markdown. All nine application/test/mock bytes remain
identical to the qualification snapshot;no application rebuild is needed just
for recording these results. Fresh final release hashes must still be frozen.

| Check | Actual result |
|---|---|
| Node/source | Node24.2.0,HEAD639+14;568 frozen input files,new temporary projection,existing installed dependencies,dummyAPI127.0.0.1:9,no local env/credentials |
| Tests | PASS878/878 in64files;includes A1 plus S0 source/safety tests,excludes local parity6/1. Readonly Git metadata supplied for existing catalog tests |
| Lint | PASS0errors/3existing warnings in blocked/useUser navigation code;no disabled rules |
| Standalone TypeScript | PASS,`--noEmit --incremental false` |
| Initial Turbopack attempt | FAIL:node_modules symlink resolved outside hermetic workspace root. Retained as qualification setup failure,not relabeled PASS or attributed to an application defect |
| Fresh physical-dependency Turbopack build | PASS:defaultNext16.4.2/Turbopack,no-cache/fresh.next,compile4.1s/TypeScript3.9s,12static pages. Existing installed dependency files APFS-cloned inside NEWroot;no install/update/config/font/bundler/package/lockfile change |
| Mock integration | PASS9/9 groups using existing unchanged runner6f2c6db2…;fake memory-only API/Auth and synthetic tokens. Pagination/read budgets,cancel/double submit,actorepochs/held responses/UNKNOWN/canonical reread cases passed |
| Mock runtime / render | Webpack development,separate from Turbopack build. Root reviewed desktop1280x900/mobile390x844 PNGs:meaningful directory/status/affiliation/table-card layout,no error overlay;devindicator normal. Not new NT-font/full visual certification |
| Fault/console evidence | 0unknownfakeAPIrequests/0blockedbrowserorigins/0uncaughtpageerrors. Three genericHTTP503 console messages match the count of two intentional UNKNOWN faults and one canonical-read fault;console-to-request timing/URL mapping was not retained,so no blanket zero-console-error claim |
| Network limits | Mock child denied registry/font hosts and may use developmentfont fallback. Fresh browser routes allowed only own fakeAPI/WEB;no backend forwarding. HTTP/HTTPS/fetch fence/dummyenv/excludedenvfiles are evidence,not a fullOS network audit |
| Cleanup | PASS:supervisor observed0remaining owned PIDs;fakeAPI51193/web51194 listeners absent via lsof. No real account/session/DB cleanup was performed or needed |
| Custody | Nine A1 files,package/lock/CI/Login/027–032/four dated receipts/privateparity/closedruns unchanged;indexempty/HEAD639. No DB/Docker/Production access,reset or migration operation |

Private evidence:`/private/tmp/um-a1-source-qualification-20261105-bz0w0chz`.
Initial Python py_compile cache-permission failure was before any test dispatch;
in-memory syntax validation passed. Both that setup error and the initial
symlink-build FAIL remain separate evidence. Completed checks left no owned
process/server/browser. Prior real-Docker/29-image evidence keeps its dates;
new mock evidence does not upgrade real DB/Production businessHTTP from NOT RUN.
Final checkpoint-only checks:6existing document contracts and20Markdown/
605relative links/217anchors/whitespace PASS. Updated five documents do not
change the nine tested application/test/mock inputs.
The qualification grant is consumed. Next is Owner review/future approved
metadata-only hosted preflight/release/delivery/conditionalrollback scope.

### 4.4 Actual read-only Production preflight — 2026-11-05

Owner explicitly approved source/config/metadata/rollback checks for14paths,
without accounts/BOQs/businessRPC,DB changes/replay or staging/publication.
The bounded preflight is complete/consumed;it does not authorize release.

| Gate | Actual evidence |
|---|---|
| Source/quality | LocalHEAD/remoteGitHub6393355/tree2dce…;indexempty. Nine qualified inputs unchanged;only five Markdown closeout differences across568qualified inputs. No fresh full qualification rerun needed. Current639Quality/Vercel status success,not actualA1commitCI |
| Vercel source/config | CurrentReady639/dpl_7d9EfUvHhTpKtEEBprybrb8waCn3,expected project/repo/main/domains,Next.js/Node24/default build-output-install-dev/rootempty/autoassignON. No deployment checks;futureA1mustpass both CI andVercel. No settings/env changes or key reveal;public env value remains accepted unobserved limit |
| Intended database | otlssvssvgkohqwuuiir/Conduit Price List ACTIVE_HEALTHY;metadata transaction at2026-11-05T04:08:13.642277Z,postgres database/session/current user,RR READONLY→ROLLBACK with8sstatement/2slock/30sidle bounds |
| Admin/profile contracts | Exactly19 expected signatures/no extra overloads;all definitionSHA/owner/security/config/ACL match accepted dated local metadata. Includes profileV2,directory,sixAdmincommands,current-active/transition helpers and public/privateCataloggate;effective anon/authenticated/service EXECUTE agrees with ACL |
| Reference/profile contracts | Fourselected relations have expected RLS/grants/policies;no account/reference/business rows read. Directory signature/default/order contract and24returnfields match;no actual RPC called |
| Data API configuration | Dashboard Max rows1000,adequate for26directoryrows/up to50referenceIDs;public+graphql_public exposed/private unexposed;autoexposeNewTablesOFF. No configuration edits. This is configuration proof,not an authenticated gateway-response test |
| S0 invariants | Normalized portablehash1df6… unchanged;Copy031definition/owner/ACL/config same;all24targetpolicies and32ledgerfullrowhashes equal actual032postflight. Exact032version/name20261105001914/s0_boq_writer_boundary,one storedpayloadhash9cc46… |
| Rollback | Fresh healthy639 artifact/URL confirmed,Productionretention30days/Hobby. It can be immediate predecessor if A1 becomes nextCurrent without interveningdeployment. Eligibility must be rechecked then;no rollback/promotion test or standing grant |
| Independent review | File-only recomputationPASS for19functions/4relations/031/032 and source/exclusions;no second Production actor |
| Not performed | No account/Auth/BOQ/Catalog/Factor rows,applicationRPC,Authsession,DB mutation/replay,AdminHTTP/anonymoussmoke,stage/commit/push/deploy or rollback |

The Dashboard's aggregate exposure counters do not replace per-role ACLs.
Official [counter logic](https://github.com/supabase/supabase/blob/ab54becc60debd614a4496742d5fcf787be4bb60/packages/pg-meta/src/sql/studio/database/privileges.ts#L64-L79)
counts full standard grants;valid custom authenticated-only grants can be
excluded. Its [selector mutation](https://github.com/supabase/supabase/blob/ab54becc60debd614a4496742d5fcf787be4bb60/apps/studio/data/privileges/update-exposed-entities-mutation.ts#L28-L54)
changes ordinary GRANT/REVOKE. Observed0/30tables and1/96functions is therefore
consistent with the verified least-privilege ACLs;do not toggle it to inflate
counts or broaden access. Public source does not establish the hosted UI's
exact deployed revision or actual authenticated HTTP behavior.

Private evidence:`/private/tmp/um-a1-production-preflight-20261105-_t3ipi6z`.
Metadata read SQL SHA635a3ef56a1db8934cbe96a4e0ce9fde0cd3ac1da01887db5aaf9bd68b6e8fcd;
one successful bounded catalog/history query,no application function execution.
Freshness is a snapshot,not a perpetual pass. Next Owner grant must expressly
cover14-file publication/finalsource-target checks/CI-Vercel/delivery and any
conditionalrollback. Stop on drift;do not repeat DB reads under this consumed
grant or infer a new account/business smoke. All old evidence limits remain.

## 5. Proposed preflight after explicit execution approval

Section4.4 records the completed read-only preflight. These remain the release
procedure/stop rules;finalsource-target/candidate-content freshness belongs in
the later publication grant. No release authority or standing DB-read grant is
created by that snapshot. A failed/unknown gate stops publication.

1. **Source/custody:** refresh main/HEAD/upstream/index/remote and exact14 hashes.
   Expected base6393355;empty index;all9 accepted A1 hashes unchanged. Freeze
   candidate content after edits;check exclusions/PII and unchanged packages,
   S0 Login fix and027–032. If main advances,refresh this base/allowlist/rollback.
2. **Candidate qualification:** section4.3 now supplies fresh878/64/lint/TS/
   defaultTurbopack/mock PASS. Verify unchanged nine source paths and relevant
   package/config/build inputs. Markdown-only checkpoint edits use document
   checks;do not automatically repeat the full build/test/fixture programme.
   Unexplained relevant drift means HOLD/review;no source/package/DB repair or
   rerun is inferred. Keep the original failed attempts and all result limits.
3. **Hosted source/config:** future approved reads confirm GitHub/main and
   Vercel Current at expected639,project/domains/Node24/default build/root and
   auto-assignment. Public env value remains a recorded unobserved limit;do
   not add OTP/key reveal as a new routine gate. Stop on actual contradictory
   binding/config evidence. No secrets/settings edits or manual redeploy.
4. **Relevant backend metadata only:** inspect definitions/signatures/owner/
   ACL/config/RLS/grants/current-active helpers for`get_my_profile_v2`,
   `get_admin_profiles_page`,six Admin commands (`admin_approve_user`,
   `admin_reject_user`,`admin_set_user_role`,`admin_deactivate_user`,
   `admin_suspend_user`,`admin_reactivate_user`) and organization/department/
   sector reference SELECT. Include `get_my_catalog_admin_gate` metadata,
   because Admin mount calls it and032's selected-function hash does not cover
   it. Do not invoke those RPCs or read accounts/BOQs to perform preflight.
5. **Paging/cap:** confirm cursor raw timestamp+uniqueID descending,required
   return fields and directory26-row limit. Reference batches may need50
   distinct actual+requested IDs per department/sector request;API cap must
   support that,not merely26. Preserve complete-result checks/error states.
   Effective cap unknown/too low means HOLD,no config change. A recorded
   PostgREST version or dashboard label alone does not establish contract parity;
   do not add a credential-bearing version probe without separate approval.
6. **Keep031/032:** metadata/history checks retain Copy031 definitionSHA
   `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`,
   ledger`20261023063934/boq_duplicate_stale_conflict_guard`,all9exact032guards/
   target24policies and ledger`20261105001914/s0_boq_writer_boundary` with
   source592872b3…/storedpayload9cc46a3d… as recorded. No businessRPC,wholeDB
   parity capture,DDL/historyrepair or replay. Client rollback must retain these.
7. **Rollback eligibility:** refresh exact healthy pre-A1 artifact/source/URL.
   Last candidate is639/dpl_7d9EfUvHhTpKtEEBprybrb8waCn3;Hobby's immediately
   previous Production constraint requires no intervening deployment. If that
   cannot be established,hold and revise rollback before pushing.

## 6. Proposed Solo publication and bounded smoke

After exact-candidate quality and separately approved preflight/publication,
one14-file commit on main/normal push/existing CI and Vercel auto-deployment.
No PR/extra branch/process or database outage is required for the sole maintainer.

1. Stage only14 named paths;inspect staged path/content/hash/whitespace and
   exclusions. Retain pre-A1 parent and actual candidate commit/tree. No broad add.
2. Require both actual-commit Quality PASS and Vercel Ready/Production/Current
   at exact source/domain. Auto-assignment may make Current before GitHub CI
   finishes;do not treat one green service as both gates.
3. Choose low use;let an existing Admin command settle before reload. A release
   does not cancel a submitted server request. No new Copy/DDL/write pause,
   account/session reset or migration application is part of this client release.
4. **Recommended default delivery check,only if approved:** fresh anonymous
   context,Login/static same-origin GET only;block Auth/Data/RPC/BOQ/Admin paths,
   redirects to them and submissions;review console/network/render/empty storage
   and close context. It proves public delivery,not authenticated Admin behavior.
   This task does not run it. Do not reuse an old smoke run/output directory.
5. **Production Admin behavior stays NOT RUN by default.** No automated login,
   profile-directory export or real-account command trial is needed. Owner may
   inspect Admin in normal use;any agent-assisted authenticated smoke needs
   separate explicit account/session/read-data/Auth-bookkeeping/cleanup scope.
   Do not silently add that scope or treat unavailable personas as PASS.
6. No approve/reject/role/status/affiliation/domain-setting action or BOQ
   Save/Copy/write RPC. No new identities/fixtures/Catalog/Factor changes.
7. Record actual commit/tree/CI/deployment,PASS/FAIL/NOT RUN and limitations in
   a private release receipt;point the prepared committed checkpoint to it.
   Do not create a recursive second documentation commit from the same grant.

## 7. Risks, protections and rollback

| Risk | Protection / residual |
|---|---|
| Admin data unavailable/visible to wrong actor | Fresh contract/ACL checks,current-active Admin guard,actor/generation isolation;confirmed wrong visibility/target is rollback trigger. No unrelated user data collection to prove it |
| Late/UNKNOWN command | Single-flight/UUID containment/canonical reread;no automatic repeat or authority repair. Current UI is not durable cross-reload recovery or server conflict control |
| Actual/requested affiliation confused | Separate labels and read-only details;active legacy NULL remains active/unassigned. Trusted correction is narrow UM-B;no auto-backfill |
| Two Admins change same account | Existing server semantics unchanged;reviewed-state conflict control remains UM-B residual |
| Cursor membership changes | Deterministic created_at/id/fresh authorization/refresh;not a frozen snapshot/global search/total count |
| Cap/reference reads incomplete | Whole-page reference ID completeness;cap≥50;error/legacy not invented authority |
| Build/source/hosting drift | Fresh exact14 qualification plus actual-commit CI/hosting;stop instead of package/config/DB repair |
| Private evidence accidentally published | Exact14 manifest;parity9/realrunners4/privatefixtures/output excluded |
| Regression loses S0 protection | Keep Login prefetch=false,027–032 and all installed032guards/history;no pre-S0 rollback or whole14-file revert |
| Remaining security/lifecycle scope | 032 metadata/history PASS closes the bounded installed-guard rollout only;broaderS0/SSO/Viewer/workflow/R0-D0 still separate. Production business HTTP remains NOT RUN |

### 7.1 Conditional rollback proposal — new approval required

Triggers:confirmed new Admin unavailability,wrong-account action,unauthorized
exposure,persistent material page/render regression,or actual candidate CI/
Vercel failure. Stop new Admin commands and retain evidence. A server-accepted
command may still complete;rollback cannot undo account changes or resolve
UNKNOWN. Preserve request UUID;any audit/data correction needs new scope.

1. If exact A1 is still Production Current,one **separately approved** hosted
   client rollback may target the freshly verified immediately previous healthy
   artifact (expected639/dpl_7d9…,not67/L1/B/A). Recheck source/eligibility at
   action time. If A1 never became Current,keep healthy Current;no needless action.
2. Freeze competing main pushes until convergence. Remote main must still be
   exact A1 commit and nine paths uncontested. For one separately approved
   forward rollback,restore`app/admin/page.tsx` from pre-A1 HEAD639 and remove
   only the other8 new code/test/mock paths listed in section3. Unexpected
   pre-existing paths or new main commits mean HOLD,not overwrite/force push.
3. Preserve the five Markdown paths in the14-file release and previously published S0 source/
   closeout documents. Specifically keep Login`prefetch={false}`,immutable032,
   installed restrictive policies/history and031. Never revert the whole
   14-file commit,drop guards,restore DB,repair ledger or replay migrations.
4. Verify restored application equals the pre-A1 application,run needed quality,
   normal push and verify actual commit CI/Vercel. If hosted rollback altered
   auto-assignment,promotion of only that verified forward-rollback artifact
   must be explicitly included in approval;no unrelated deployment promotion.
5. Record chronology/health within the approved delivery scope and stop.
   Hosted/client rollback grants do not allow any account/BOQ/DB undo.

Future approval may cover one hosted rollback + one forward rollback and the
conditional exact-artifact promotion above. All old A/B/L1/S0/apply/closeout
rollback grants are consumed;none authorizes this A1 release. A future grant
expires at its recorded closeout,not standing permission for another incident.

## 8. Owner decisions before execution

1. Review the recalculated14 paths,Admin-only impact and dated evidence limits.
   Accept excluded parity9/realrunners4/privatefixtures and all closed-run custody.
2. Review completed qualification4.3 and its initial setup failures/mock-font/
   console limits. No repeat source qualification or real-Docker/Auth fixture
   run is automatically required while relevant inputs remain unchanged.
3. Review completed metadata-only preflight4.4,then separately approve one14-file
   publication/finalsource-target checks/CI-Vercel/boundedanonymousdelivery,if
   desired. Delayed/changed source/config/rollback needs scoped refresh. Default
   authenticated Admin/businessHTTP stays NOT RUN;no new DB migration or account test.
4. Decide whether that future Solo grant includes the conditional client/forward
   rollback and promotion scope in7.1. No rollback is authorized by this plan.

S0-before-A1 was selected and completed for the bounded032 rollout;do not ask
that order question again. Next order remains **A1 → narrow UM-B legacy
confirmation → A2 → remaining UM-B**. Current work ends at local Markdown,
source/evidence review and document checks after completed source qualification;
no release/Production authority.

## 9. Historical proposal and evidence custody

The full pre-S0 plan is preserved at
[commit6393355's original proposal](https://github.com/cloudstellar/conduit-boq/blob/639335546b018bdfbf6e37e854af308693158a53/docs/07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md).
Its27-file/base67/rollback67 assumptions are dated,not current release gates.
Section4.1 retains its original source-check chronology;all four dated local
receipts and FAIL/HOLD/NOT RUN evidence remain unchanged. This refresh changes
prospective planning/status only and does not rewrite historical outcomes.
