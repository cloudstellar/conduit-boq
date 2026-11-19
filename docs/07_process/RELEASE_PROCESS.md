# Release Process — Current Methods

> **Current method index — 2026-11-19.** Choose the previously successful
> procedure that fits the task. This index records reusable methods, not a
> standing execution, Production or publication grant. Start with the
> [current handoff](../08_ai/AI_HANDOFF.md#current-resume-checkpoint),
> [current rules](../08_ai/AI_CONTEXT.md#current-agent-rules) and
> [Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md).
> The dated record below is preserved as history. Its old uses of “current”,
> approval windows and pending gates do not supersede this index or the latest
> Owner instruction.

<a id="current-method-selection"></a>
## Select the method for the task

Inspect the relevant existing source, runner and accepted result before
proposing another method. Reuse a matching procedure when its inputs, baseline,
target and safeguards still apply. Different tasks need different methods;
neither a full Docker rehearsal nor a new isolated stack is mandatory for all
work. A previous PASS proves its recorded cases and source only.

| Task and method | Established procedure and reference | Preconditions, effects and stopping point |
|---|---|---|
| Local documentation | Check the diff, links, referenced facts and affected documentation contracts. See the [working agreement](#working-agreement-20261015). | Preserve historical evidence and unrelated changes. No app build, Docker, Auth or DB operation is needed merely to edit Markdown. Report checks performed. |
| Source qualification | Use installed dependencies on Node 24 for the affected tests, lint, TypeScript and default Turbopack build. See [UM-A1 source qualification](../plans/product/12-user-management-um-a-and-um-b-plan.md#124-post-s0-source-qualification-result--2026-11-05) and [UM-A2 local decision](../plans/product/12-user-management-um-a-and-um-b-plan.md#242-local-test-decision). | Use the approved test API/build environment and keep Production credentials out of the candidate. Report source-only coverage; it does not prove DB/Auth flows. Stop the affected gate on failure. |
| Mocked browser integration | Use the fake Auth/Data API approach in [the checked-in UM-A1 client runner](../../scripts/test-um-a1-client.mjs), after checking its current compatibility and output path. | The runner starts local processes and writes QA artifacts; it is not a real DB test. Keep fake origins and network guards intact, close its processes, and report mock coverage separately. A source or browser-tool mismatch needs a documented correction. |
| Real DB-backed application flow | Select the appropriate existing local target, check the relevant schema/RPC/permission/API baseline, then use fresh synthetic fixtures and the reviewed API/browser procedure. References: [local parity result](../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md), [S0 local result](../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md) and [UM-B local qualification](../plans/product/12-user-management-um-a-and-um-b-plan.md#2019-local-first-round-qualification--2026-11-14). | Auth, fixture writes and cleanup must fit the approved scope. Preserve original accounts, passwords and business data. Current-equivalent means relevant contracts, not copying all Production rows. An unknown write outcome stops mutation and requires scoped read-only reconciliation. |
| Signup, confirmation and password recovery | Follow the [UM-A2 Docker acceptance procedure](../plans/product/12-user-management-um-a-and-um-b-plan.md#234-docker-and-acceptance), using the reviewed Auth configuration and local mail capture. | An isolated target is justified when testing configuration variants or fixture shapes safely requires it. Approve the exact target, accounts, sessions and cleanup. Captured local mail does not prove delivery through Production SMTP; real mail has its own explicit scope. |
| New DB change and rehearsal | Check the relevant predecessor, rehearse only the newly reviewed forward change on the approved local target, then verify the affected metadata, authority and user flows. See [UM-B qualification and delivery](../plans/product/12-user-management-um-a-and-um-b-plan.md#2018-first-round-implementation-and-test-review--2026-11-14). | Applying a new migration is a DB operation requiring explicit authority. Do not reset/restore or replay 027–033. Review the actual new payload and transaction behavior; an old migration's wrapper is not a universal template. Stop on predecessor drift or an uncertain apply result. |

For the selected method, put a short execution note in the active plan/checkpoint:
the problem and acceptance cases; the accepted procedure being reused; exact
source/runner and target; required baseline and approved side effects; stop and
cleanup behavior; and the resulting PASS/FAIL/NOT RUN limits. Refer to the
canonical method instead of copying changing commands across handoff files.
Routine steps already covered by the Owner's approval do not need another
approval ceremony.

If an accepted runner or private input is unavailable, report exactly what is
missing. Verify available source/hash evidence before preparing a replacement
within the authorized scope. Do not silently switch transport, create a stack,
alter configuration or select another database. A local baseline gap does not
automatically authorize a fresh Production read.

<a id="ai-sdlc-feedback"></a>
## AI-assisted SDLC: context, diagnosis and feedback

Apply these practices through the selected method and existing plan/result.
The lifecycle guidance supplements this repository's process; it does not
require new intent/spec/plan files, an ADR for every task, additional approvals,
tools, stacks, CI jobs, hooks or autonomous Production work.

1. **Connect intent to proof.** Link the user outcome and acceptance criteria
   in the active plan to applicable ADRs, affected source/contracts, the reviewed
   diff and its test/release result. Use the
   [documentation ownership map](../README.md#single-source-of-truth-map) rather
   than copying the same mutable facts into multiple files. Retrieve relevant
   context within the approved read scope; a missing link grants no broader
   access to accounts, BOQs, secrets, private evidence or Production.
2. **Diagnose before another attempt.** Retain bounded expected-versus-actual
   evidence, source/target and the failure point. Classify the cause as product,
   test harness, environment or unresolved when supported by evidence. Check
   whether the test's expectation matches the accepted product contract before
   changing the app. Do not weaken a check or change business behavior merely
   to obtain PASS. Explain what a proposed correction/retry will resolve and
   stay within its authorized scope. Existing UNKNOWN reconciliation and
   closed-run rules still apply; a suspected cause is not an established one.
3. **Measure useful outcomes lightly.** Use existing task/run records to note
   whether a fresh assistant identifies the checkpoint, method/target and next
   action correctly, and what causes rework or repeated failed test attempts.
   Separate product defects from harness/environment failures and record
   unresolved cases honestly. Capture elapsed work/wait time only when actually
   observed; otherwise say not measured. Pair speed with correctness and
   residuals instead of using code volume or task counts alone. No new dashboard
   or retrospective invented baseline is required.
4. **Feed the result back.** At a meaningful closeout, update the owning result
   and current checkpoint with actual outcomes, limits, cleanup and next steps.
   Update the established method only when the evidence justifies it; record
   reusable lessons and review triggers for retained risks or temporary targets.
   Validate changed agent guidance with an appropriate bounded read-only handoff
   check when needed. This is not a reason to repeat completed runtime tests
   merely because a new session starts or to reopen a closed run.

These are the local adaptations of the playbooks linked in
[Lessons learned](../08_ai/LESSONS_LEARNED.md#official-guidance-consulted--2026-11-19).
Product-specific automation examples and reported vendor gains do not establish
compatibility, authority or performance for Conduit BOQ.

<a id="engineering-decision-review"></a>
## Material engineering decisions and tradeoffs

Use this review before a choice materially changes business behavior, architecture,
authorization/security, data/schema or infrastructure. Start from the actual user
problem, current implementation and binding constraints. Existing procedures and
accepted decisions are evidence-bearing starting points; recheck their assumptions
when the requirements or environment change. A new technique is not inherently
better because it is newer or more generic.

Record the review in the active plan, using the smallest useful format:

1. **Problem and acceptance:** the user/business outcome, existing behavior,
   in-scope and out-of-scope work, mandatory constraints and observable success
   cases. Separate confirmed facts, assumptions and important unknowns.
2. **Viable alternatives:** include reuse, a small change, keeping the current
   system or deferring work when reasonable. Compare on the same relevant
   criteria. Do not invent alternatives, numerical scores or certainty to fill
   a template. If only one option meets the constraints, explain why.
3. **Tradeoffs and recommendation:** explain advantages, disadvantages, failure
   modes, implementation effort and ongoing cost/complexity for the Owner. State
   why the recommended approach is sufficient and what evidence could change it.
4. **Proof and recovery:** identify affected contracts, acceptance/negative cases,
   authorized test target, remaining uncertainty and a realistic stop/recovery
   path. Resolve unknowns before execution when they could change the choice
   or invalidate a required safety/compatibility condition; a prototype or read
   still needs the appropriate scope. Client rollback does not undo DB/data.
5. **Decision and follow-through:** record who decided, when, the rationale,
   retained limits and a review trigger. Keep Proposed / Accepted / Deferred /
   Superseded distinct from Not started / Implemented / Tested / Released.
   Acceptance of a direction does not grant a DB operation or publication.

Before comparing material design alternatives, consult the
[existing ADR index](../02_architecture/ADR/README.md), discover the records
currently present, and read applicable decisions with their later amendments
and closeouts. State what the proposal preserves or would supersede. ADR-001 is
the existing authorization decision, not a general template to overwrite or an
identifier to allocate again. Its dated policy list is not a current role matrix.

For a consequential architectural choice that spans features or will be costly
to reverse, use the established record structure in the existing ADRs and link
the proposed new record from the plan. Check for an unused identifier first.
Preserve accepted rationale; a later reviewed decision supersedes it with a
dated linked record. Smaller choices can stay in the plan.
Do not require a new ADR, PR, weighted matrix or Owner approval for
every routine implementation detail already within the approved scope.

### Engineering review dimensions

Apply the dimensions that affect this change; explain a consequential exclusion.
This is a review guide, not a demand for every test or platform on every task.

| Principle | Practical check for Conduit BOQ |
|---|---|
| Business outcome and invariants | Define what users must achieve and what must remain true. Link the requirement to the acceptance cases; code, UI or build completion alone does not establish the business result. |
| Existing-user compatibility | Review existing accounts/status/scope, old BOQs and client/API contracts, plus Print/PDF/Excel and numeric outputs when affected. For a DB change, check the supported app/DB combinations and the actual rollback behavior. A UI-only task does not authorize redesigning access or data. |
| Trusted authorization and privacy | Keep eligibility display separate from authoritative server/DB checks; validate the actor, current status, action and resource scope at the trusted boundary. Assess negative access cases and sensitive data/log exposure. These are design checks against current contracts, not permission to change roles or policies. |
| State and data integrity | For writes or state transitions, identify transaction boundaries, partial-failure behavior, concurrency/stale-state conflicts and duplicate-request handling. Reuse applicable Save/Copy/031/032/033 contracts. Uncertain outcomes follow the existing UNKNOWN stop/reconciliation rule; do not add new business behavior by implication. |
| Simple, maintainable design | Prefer clear responsibilities and existing conventions; keep authoritative business rules in their appropriate layer and avoid competing copies. Assess lifecycle cost, dependencies and cleanup. Support known extension points without building speculative SSO, a permission engine or generic workflow machinery before requirements justify it. |
| Useful evidence and review | Select tests that could detect the actual failure, including denied/error/retry cases when relevant. Inspect rendered UI for affected user flows and retain the established NT patterns. Review the focused diff for regressions; a second technical review can be useful without a mandatory extra PR or new role. |
| Small changes and recoverability | Keep each release coherent and limited in effect. Identify detectable failure conditions and recovery compatible with any state already written. Report residual risk rather than guaranteeing zero risk or zero technical debt; record its impact, mitigation, Owner acceptance when required, and a condition/date for review in the active plan. |

These dimensions add no implementation or runtime authority. Existing method
selection, test evidence, approval, preservation and checkpoint rules still apply.
Do not reopen an accepted historical decision merely to repeat analysis when its
assumptions still hold; do not treat a known defect as acceptable solely because
an old procedure once passed.

## Source commands and runner selection

[package.json](../../package.json) currently defines `npm test`, `npm run lint`
and `npm run build`; the build script is `next build` (default Turbopack).
The installed TypeScript entry point is `./node_modules/.bin/tsc --noEmit`.
Select focused tests appropriate to the change. These are reference commands;
execute only checks appropriate to the current approved task. This documentation
refresh uses static document checks and focused document contract tests, without
full application qualification, package installation or lockfile changes.

Local source qualification has used **Node 24**. The checked-in
[Quality workflow](../../.github/workflows/quality.yml) currently specifies
**Node 22**, with install, lint, tests and build. Report the actual local,
CI and hosted runtime observations separately; do not claim they are aligned
or change CI as part of a documentation task. CI does not automatically run
the local Docker acceptance suite.

Existing scripts are an inventory, not an execution allowlist:

- [UM-A1 mock client](../../scripts/test-um-a1-client.mjs) exercises fake
  in-memory Auth/Data responses. Its result cannot stand for real DB behavior.
- [S0 local runner](../../scripts/test-s0-boq-writer-boundary-local.mjs) pins
  historical target metadata and private evidence. Its execution writes bounded
  fixtures/Auth state; confirm compatibility and fresh authority before deriving
  a new run. Never reopen its finalized runs or assume its private paths remain.
- [Local parity smoke](../../scripts/smoke-local-db-parity.mjs) and
  [Auth smoke](../../scripts/smoke-local-auth.mjs) are real-backend procedures;
  inspect their reads, writes, credentials, fixtures and cleanup against the
  successor schema before choosing them for a task.
- [Bootstrap](../../scripts/bootstrap-local-db.sh) resets and seeds a database;
  [seed users](../../scripts/seed-local-users.mjs) writes Auth/profile fixtures.
  Neither is an automatic pre-test step. Old migration/seed helpers do not
  authorize replay, a new reset or changes to existing passwords.

Use `conduit-boq-local` as the existing primary local test target when suitable.
Verify the target and relevant baseline for the selected method, including the
approved connection route; do not infer suitability solely from its name or
that Docker is running. Preserve original usernames, password custody, account
authority, Catalog/Factor F and existing data. Temporary test targets need a
recorded purpose and retention/cleanup decision. Owner backup/snapshot files
and protected archive are outside ordinary fixture cleanup. There is no
mandatory extra PR, test-DB backup or second Docker stack.

## Solo application publication

The established recent route is the [UM-A2 Solo sequence](../plans/product/12-user-management-um-a-and-um-b-plan.md#243-preflight-and-solo-sequence-after-approval).
For a newly approved exact release:

1. Check fresh Git source/base, the exact file allowlist, exclusions and local
   test evidence. Under the named hosted read scope, verify Vercel's current
   source/configuration/domain and the eligible exact rollback target. Stop on
   drift. A docs-only push may also trigger Vercel.
2. With explicit publication authority, stage/commit only that allowlist and
   push the reviewed `main` source through the established Vercel integration.
   Keep unrelated work out of the release; a new PR or manual deployment route
   is not an added default requirement.
3. Verify that commit's GitHub Quality result and Vercel **Ready/Current**, exact
   source and intended domain. Run only the approved smoke; anonymous no-write
   checks do not authorize Login, account/BOQ reads, email or business RPCs.
4. Record the exact commit, CI/deployment identities, smoke outcomes and limits.
   Use conditional client rollback only when the current release approval names
   it and its eligibility/trigger conditions still hold. Publication and rollback
   grants end with their bounded operation.

For the latest recorded release and retained limits, use the
[current checkpoint](../08_ai/AI_HANDOFF.md#current-resume-checkpoint),
which links its canonical result. The UM-A2 closeout above is a dated example
of the method, not another maintained latest-status register or a fresh hosted
observation. Earlier accepted exceptions apply only to their named release.

## Production DB application is a separate method

The established 032/033 route used the **existing Supabase MCP connection**,
with a separately approved one-shot apply and explicit operating window. Use
the [032 application record](../plans/security/05-s0-boq-writer-boundary-plan.md#13-production032-one-shot-application--2026-11-05)
and [033 closeout](../plans/product/12-user-management-um-a-and-um-b-plan.md#2020-first-round-production-closeout)
as procedural evidence; their grants are consumed and their migrations remain
immutable/no-replay.

For any future approved migration, first verify the exact hosted target,
source/payload mapping, predecessor contracts, migration history and approved
write pause. Submit the reviewed new payload once through the approved MCP
route. Then verify the expected metadata delta, actual history version/name/
stored SQL and preservation of earlier ledger entries, plus the scoped
postflight. A deployment does not apply a DB migration. A response timeout or
uncertain write is **UNKNOWN**: stop and reconcile read-only within authority;
do not retry, repair the history ledger or infer rollback. Any forward recovery
needs its own reviewed scope. Do not substitute a CLI reset/push or another
transport merely because it is available.

## Historical record — preserved before the 2026-11-19 method index

The original text follows unchanged, including dated approvals and wording
that was current at its recorded time. Use the current method index and handoff
for today's procedure and authority. Historical 027–030/031/032 ranges do not
relax the current preservation of **027–033**.

<!-- RELEASE_PROCESS_HISTORICAL_ORIGINAL_START -->
# Release Process
## Conduit BOQ System

> **S0 source publication approval — 2026-11-05:** Owner approved exact25paths,
> fresh readonlypreflight,CI/Vercel/anonymous no-write smoke and conditional
> clientrollback under the [Solo plan](./S0_SOLO_RELEASE_PLAN_20261104.md).
> Actual outcome/grant consumption is in S0's canonical checkpoint. Existing
> MCP transaction contract is documented-supported with limits,not runtimePASS.
> Production032apply/DBmutation/replay027–032 remain forbidden;A1/parity9 excluded.

> **Later S0 Solo proposal — 2026-11-04:** [Exact S0 plan](./S0_SOLO_RELEASE_PLAN_20261104.md)
> proposes25paths (5source+20linkedMarkdown),excluding A1application/parity9.
> R5scopeddesktop/cleanupPASS carries mobile/evidence limits. Source publication
> and one-shotProduction032 are distinct explicit gates;neither is authorized
> by local planning. After S0,refresh A1's base/allowlist/rollback and keep032.

> **Status:** CANONICAL
> **Last Updated:** 2026-10-23

> **Later local release proposal — 2026-11-02:** [UM-A1 Solo plan](./UM_A1_SOLO_RELEASE_PLAN_20261102.md)
> proposes exactly27 paths and a fresh pre-A1 rollback target. It is planning
> only: no Production/DB/Auth, staging or publication. Local functional/settled
> visual evidence is not actual-commit CI or a fresh hosted preflight. Parity9,
> real local UM runners4 and private fixture/evidence files stay separate.
> S0 and future UM/NT implementation remain outside A1 release scope.

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current Master Catalog release state:** Phase 4 and P-49 are complete
> end-to-end; see [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed 027
> then 028 with no 029, `2568.1.0` at `710/710`, reviewed prices, unchanged
> Factor F, the three catalog flags plus migration-028 functions/raw
> `app_settings` ACL, and `0` working drafts at that instant; it made no write.
> Older rollout checklists and gates below are historical
> chronology for their release windows, not permission to replay them.

---

<a id="working-agreement-20261015"></a>
## Working agreement — clarified 2026-10-15

**Earlier bounded B closeout — 2026-10-23:** Owner chose no additional
Production HTTP probe and closed B on the recorded evidence; see the
[final receipt](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md).
Production HTTP stays NOT RUN. It is not a mandatory pending B task or a full
behavior PASS. Do not repeat that optional-probe approval request automatically
or apply this choice to future releases. Authority is consumed; current work is
local documentation/LIST-1B review only with no external operation.

**Latest 031 DB execution — 2026-10-23:** the later explicit one-shot approval
was completed in the confirmed Copy/no-other-DDL window. Ledger
`20261023063934/boq_duplicate_stale_conflict_guard`, exact successor and unchanged
security/non-source metadata/related contracts passed postflight and independent
review. See the [031 receipt](../06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md).
No business RPC or commit/push/deploy ran. Production stale HTTP remains NOT RUN;
metadata PASS is not full business-flow PASS. 027–031 are immutable/no-replay,
execution authority is consumed, and closeout docs remain local. Earlier
031-unapproved passages below preserve their preceding stages.

**Earlier B client execution — 2026-10-23:** separately approved Solo B4
publication completed at `42e01c5`; Quality658 PASS and Vercel Production
Ready/current. See the [B client receipt](../06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md).
031 was published as SQL source only; no DB operation/migration ran. Database
execution and Production stale-RPC proof remain unapproved. Client publication
authority is consumed; closeout documentation remains local with no second
push. Earlier A-only/B-unapproved passages below are dated stages.

**Later A execution closeout — 2026-10-23:** the Owner separately approved
the A-only Solo route. Exact A8 commit `a3114fc` is now on main and Vercel
Production Ready/Current; see the [A release receipt](../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md).
The named stale-Copy exception/publication authority are consumed. B and 031
remain unapproved; no DB operation or migration was part of A. The earlier
planning-only paragraph below remains its dated stage, not standing authority.

**Named exception recorded later — 2026-10-23:** the Owner accepted the
preserved stale-Copy FAIL for the exact dependency release A only, then B as a
separate next release. The [A/B review plan](./DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md)
binds the exception to source, scope and A closeout. It is not a general waiver
or publication/Production authority; no repeated request for this A exception
is needed. The current request authorizes plan/documentation work only.

L1 followed the separately approved Solo path: one exact 15-file commit/push,
CI and Vercel checks, then a bounded no-write smoke. Its source was `b1ce449`;
normal Auth/profile reads were distinct from excluded mutating business RPCs.
No rollback ran. The prior conditional rollback authority is not a standing
future deployment permission. A later docs-only push may also auto-deploy and
needs its own reviewed source/target and explicit publication approval.

This records the Owner's expectation of testing locally before Production.
It is documentation of how later approved work is handled, not approval to
reset Docker, implement a feature, publish Git changes or operate Production.

1. **Inspect first.** Read the mandatory handoff and inspect relevant source,
   Git state and test target read-only. Identify what already exists before
   proposing new work. Do not require a Production inspection for every task.
2. **Agree one small scope.** Explain the concrete problem, proposed change,
   affected files/targets and intended tests in plain language. Continue within
   the approved scope without asking again for routine steps it already covers.
   Local implementation, an exact local reset/fixture setup and test writes may
   be approved together. No such execution is authorized by this agreement.
3. **Test before proposing release.** For application changes that use the
   database, run the affected user flows against local Docker with the relevant
   current Production schema, RPCs, permissions and behavior verified. For a
   new DB change, establish that baseline, then rehearse the approved change
   and its affected flows. Use recreatable synthetic data; copying all real
   BOQs/accounts is unnecessary. An isolated SQL fixture proves its named SQL
   cases, not full Auth/API/browser integration. An unrelated service or full
   parity programme must not become a prerequisite for every small task.
4. **Report evidence before release approval.** State the exact source/diff,
   test target/baseline, cases run, PASS/FAIL/NOT RUN and limitations. Lint,
   unit tests, build or CI success alone is not a Docker/database-flow PASS.
   The current Quality workflow does not run Docker integration automatically.
   If a required test fails or its relevant baseline is unknown, continue the
   authorized correction work and hold the release recommendation. Any proposed
   exception must be explicit and accepted by the Owner for that release;
   a historical accepted residual is not permission to skip a new test.
5. **Publish only within explicit authority.** Present the tested change and
   remaining risks before asking to commit/push/integrate/deploy or operate
   Production. The Owner can authorize named operations together; do not add
   redundant approval steps. Local approval never implies those operations.
   Verify deployed source and bounded post-release behavior afterward, with
   Production writes only when expressly included in the approved scope.

Keep the Solo workflow simple: no mandatory extra PR, test-DB backup or second
Docker stack. Owner backup/snapshot files remain separate and untouched. A
documentation-only edit needs appropriate diff/link checks, not an unnecessary
DB rehearsal. Migrations 027–030 remain immutable/no-replay; use the
[Local Database Parity Plan](../06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
and [Local Parity Result](../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
for the prepared baseline and remaining stale-Copy failed gate. These safeguards
do not change #09's
product release order or turn proposed plans into approved implementation.

## NT brand and UM planning boundary — 2026-10-24

The Owner selected a future consistent NT identity across web surfaces and
approved local plan alignment. Use [brand #11](../plans/product/11-nt-brand-system-and-sitewide-ui-rollout-plan.md),
[UM #12](../plans/product/12-user-management-um-a-and-um-b-plan.md) and
[Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md).
This is no runtime, asset/config/package, DB/Auth/fixture, Production or Git
publication grant. Existing nine parity artifacts remain separate; 027–031
remain immutable/no-replay. Documentation-only work needs diff/link and affected
documentation contract checks, not Docker or a test-database backup.

Future visual candidates must name affected routes and any shared/global
font/token/component change. Use real NT assets with recorded provenance,
measure Thai text/wrapping and state/focus/mobile behavior in the rendered app,
and distinguish web acceptance from Print/PDF/Excel acceptance. Concept images
are not final CI or accessibility PASS. Do not bundle accounting, authority,
Catalog/Factor or migration changes into a restyle. Focused S0 is separate and
must not wait for the full-site restyle; a minimal reviewed NT pilot may be
included with UM-A instead of inventing another mandatory release/PR.

Current proposed first UI candidate is Admin-only UM-A1: directory/read-only
details/labels and scoped NT presentation. Keep shared Auth/Login/callback/
middleware/context/hooks, pending/profile, domain policy, global styles/fonts/
primitives and existing RPC command semantics unchanged. A1 includes canonical
post-command reread and truthful completed/refresh-unavailable/transport-uncertain
states; preserving old partial optimistic updates is not a release invariant.
A2 signup/confirmation and
later command-UX are separately reviewed scopes. Back-office navigation must
not auto-update accounts; explicit existing Admin commands retain their intended
targeted effects. Do not require A2 mail-delivery proof for A1 presentation.
Before a new UM-B authority transition, review server-side expected-review/conflict,
same-intent replay/current-state and legacy-client compatibility. Keep these
limits visible in #12's completion register; do not close all UM with A1 alone.

Actual signup/approval tests write synthetic local Auth/profile data. Future
approval must cover exact fixture creation/cleanup and relevant DB-backed flows;
preserve original usernames/passwords, account authority and data. No reset or
Auth/SMTP configuration change is inferred. Report UX, callback and real-mail
delivery separately; local mail capture is not hosted delivery proof. Required
unknown/failed gates hold release-ready claims. Publication and any hosted
preflight remain separate explicitly approved operations.

## 1. Deployment

**Current planning overlay (2026-10-14):**
[Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
governs proposed sequencing and IT/SSO readiness. Choose the simplest adequate
review/integration path for each newly approved release; a PR is conditional,
not a new requirement for every Solo task. The completed Quantity Solo path
below is a receipt whose authority is consumed, not permission to reuse it.
Internal target and SSO cutover remain unapproved and need separate acceptance.

The recorded Production application deployment is automated by Vercel from
`main`; verify its live configuration before publishing, since a docs-only push
may trigger deployment too. A reviewed pull request is one integration path.
For the completed Quantity release only, the Owner selected a Solo path: exact
local commits and local checks formed the pre-publish review package, the
feature branch was pushed directly for Preview without a PR or separate CI
gate, and a later explicit Q-B approval authorized the exact fast-forward to
`main` and matching Production deployment. The existing workflow after the
`main` push remained enabled and passed.

Supabase Production DB migrations are separate operations. A code merge or
Vercel deploy must never be treated as evidence that a migration was applied.

### DUP-1 release record — 2026-08-31

Atomic BOQ Duplicate is released and verified. Exact migration 029 was applied
once as `20260831004110/atomic_boq_duplicate` (SHA-256
`748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`),
then PR [#9](https://github.com/cloudstellar/conduit-boq/pull/9) was merged as
`0e76ed39e68746c9bd6003da69a03f096ae482a3` and the matching Vercel Production
deployment reached success.

Database evidence and application evidence were checked separately. Isolated
PostgreSQL, CI, rollback-scoped Production functional proof, desktop/mobile
rendered QA, an expected live PostgREST fail-closed probe, and final
`263/326/2617/0` BOQ/route/item/request-ledger no-residue postflight passed.
Catalog and Factor F hashes/pointers remained unchanged. The complete receipt
and residuals are in the
[DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).

That one-shot release authority is consumed. Do not replay migration 029 or
infer authority for LIST-1, Quantity Expression, another deploy, or another
Production write.

### BOQ Save NULL authorization guard record — 2026-10-12

Migration 030 was applied exactly once as
`20261012100608/boq_save_null_authorization_guard`, after the reviewed source
commit `cb2bb60`. Exact postflight and limitations are recorded in [Security
Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md),
and the repository closeout is `7c09ab8`. Migrations 027–030 are
immutable/no-replay and this release authority is consumed.

Quantity Input Safety was not part of the security release above. It later
completed Q-A and Q-B under [Product Plan
#06](../plans/product/06-r0a-quantity-input-safety-release-plan.md),
[Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md),
and [Production Result #08](../plans/product/08-r0a-quantity-input-safety-production-release-result.md).
Runtime/tests `b18e69a` reached Production through exact `main` source
`4d285f8`; GitHub Quality, Vercel Ready, authenticated no-write QA, console,
Print, and read-only database verification passed. Q-A/Q-B authorities are
consumed. A Production write test still needs its own named data and authority.

## 2. Pre-Release Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Migration execution window approved separately (if any)
- [ ] Owner approval

## 3. Master Catalog Baseline

As of 2026-06-21, Production Master Catalog Phase 0 → 1A → 2 → 1B is complete.
Migrations `009`, `010`, four operational `010a` indexes, and `011` were
applied/verified; Phase 2 was merged through PR #2 and deployed by Vercel.
See the [verification report](../plans/master-catalog/05-verification-report.md).

**Historical pre-Phase-4 snapshot:** At this document's 2026-06-22 baseline,
Phase 4 administration/publication had not started and was governed by the
[Change Request](../plans/master-catalog/09-phase4-change-request.md). That
dated boundary is retained as release chronology; current completion and
no-replay authority are #106/#107 above.

## 4. Versioning

Historical application-version snapshot (2026-06-22): **v1.2.0**

---

## References
- Roadmap: [01_overview/ROADMAP.md](../01_overview/ROADMAP.md)
