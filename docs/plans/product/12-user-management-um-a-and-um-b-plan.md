> **Current navigation — 2026-11-19:** Use [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md)
> for the next product priority and the [current checkpoint](../../08_ai/AI_HANDOFF.md#current-resume-checkpoint)
> for the current task and authority. The [current UM status table](#121-current-state-and-authority)
> links the applicable results. “Current” and “next” in dated planning and
> closeout entries refer to their recorded stage.

# User Management UM-A and UM-B Plan

Recorded: 2026-10-24 (Asia/Bangkok)
Approval-packet update: 2026-10-26 (Asia/Bangkok)
Status (2026-11-14): UM-A1 RELEASED / FIRST UM-B CONFIRMATION CLOSED / UM-A2 RELEASED AND CLOSED / ADMIN ASSIGNMENT PROPOSED

Use the [current status table](#121-current-state-and-authority), the
[first UM-B Production closeout](#2020-first-round-production-closeout), the
[proposal for Admin assignment when a request is wrong](#21-admin-assignment-for-an-incorrect-affiliation-request),
and the [roadmap for groups and permission templates](#22-groups-roles-and-access-scope).
[Section 27](#27-um-a2-production-closeout) records the UM-A2 release and its
two explicitly accepted Production `NOT RUN` results.
[Section 23](#23-um-a2-implementation-review) records the reviewed UM-A2 scope.
[Section 24](#24-um-a2-solo-release-review) records the local test results and
the seven-file Solo release proposal.
[Section 25](#25-production-auth-redirect-review) records the hosted redirect
change and readback. [Section 26](#26-nt-smtp-proposal-for-um-a2) records the
NT SMTP setup and the earlier mail test on UM-B.
[Section 20.19](#2019-local-first-round-qualification--2026-11-14) preserves
the Docker and browser evidence as recorded before release.

## Post-S0/032 Solo plan refresh — 2026-11-05

Owner requested local Markdown planning only after S0 source/032/closeout
publication. The [refreshed Solo plan](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md)
uses localHEAD6393355 and a proposed14paths:runtime5/tests3/mockrunner1/Markdown5.
All9A1sourcehashes still match accepted evidence;all18oldplanningdocuments are
already tracked. Old27/base67 assumptions are dated,not current approval scope.
S0's [canonical checkpoint](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint)
owns its completed032 metadata/history result;do not duplicate that tracker.
A1 remains unreleased. Fresh exact14 quality/hosted preflight/release are NOT RUN.
No source/DB/Auth/Docker/browser/fixture/Production/staging/publication authority.

## Priority legacy affiliation planning — 2026-11-02

Owner reports having approved the selected account's affiliation request and
asked to continue planning the correction. See [section15](#15-um-b-priority-legacy-affiliation-confirmation-plan)
for the narrow UM-B substep and separated evidence. Proposed order is S0 → A1
→ UM-B legacy confirmation → A2 → remaining UM-B. This supersedes earlier
A2-before-all-UM-B ordering only. A1 source/local acceptance remains frozen;
all implementation/SQL/DB/Auth/fixtures/publication require their own scope.
The one-account Production read has completed; no further Production grant.

## Dated release planning only — 2026-11-02 (superseded by Nov5 refresh)

Owner requested the [UM-A1 Solo release proposal](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md):
exact27-file scope, preflight, risks and conditional rollback. Current work is
local Markdown/checkpoint and source/document checks only; no DB/Auth/browser/
fixture, Production, staging/commit/push/deploy or package/config operation.
All earlier bounded runtime grants below are consumed. Keep the nine parity
artifacts and four real UM local runners out of the release; both fixture runs
remain finalized. See section12 for the single current progress checkpoint.

## Later bounded local authority — 2026-11-01

Owner's “ทำต่อครับ” หลัง final readiness review อนุมัติ local candidate ตาม
sections 11/13: existing-Docker preflight, เก้า code/test/harness paths, local
quality/API/browser tests และสูงสุด 105 new run-owned synthetic accounts/
transitions พร้อม retention/finalization ที่เสนอไว้ รักษาบัญชี/password/ข้อมูลเดิม
ไม่มี reset/restore/replay027–031, schema/RPC/config/package change, Production
หรือ stage/commit/push/deploy grant ไม่รวม S0/A2/UM-B implementation
ข้อความ planning-only/NOT AUTHORIZED ด้านล่างเป็นช่วงก่อนอำนาจ local นี้
ใช้ checkpoint section12 และ local result แยกหลักฐานจริงจากแผนทุกครั้ง

For the bounded decision at the 2026-11-01 stage, read [section 11: UM-A1 approval packet](#11-um-a1-approval-packet)
first. It specifies the proposed screens, file allowlist, existing-user impact,
fixture lifecycle and acceptance. The Owner approved this Markdown refinement
only; neither S0 nor UM-A1 implementation/test writes are approved by it.
For work continuity, read/update [section 12: execution status and resume checkpoint](#12-execution-status-and-resume-checkpoint).
Progress is recorded there; a proposed next step is never execution authority.
The 2026-11-01 [final execution contracts in section 13](#13-detailed-readiness-review)
close R1–R7 at the plan level. They are ready for Owner local-scope review,
not evidence of implementation/runtime PASS or an execution grant.

## 1. Purpose and authority

Improve signup, email-confirmation guidance and existing Admin work without
replacing Supabase Auth or changing existing accounts implicitly. The Owner
has requested planning alignment and a future consistent NT brand identity
across the whole website. This authorizes local Markdown planning only.

Use [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md) for order,
[NT brand plan #11](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md) for
shared visual rules, and the [focused S0 plan](../security/05-s0-boq-writer-boundary-plan.md)
for the separately completed bounded032 rollout and its remaining limits. No code, package,
configuration, SQL, account/reference data, Docker/DB operation, staging,
commit/push/deploy or Production access follows from this plan. Migrations
027–033 remain immutable/no-replay. Existing local credentials, data, nine
parity artifacts and protected archive custody remain unchanged.

Focused S0/032, Admin-only UM-A1, the first UM-B legacy confirmation and UM-A2
are complete within their recorded gates. The
[Admin assignment proposal](#21-admin-assignment-for-an-incorrect-affiliation-request)
is deferred until an active employee with no actual affiliation has an
incorrect request and cannot access a BOQ needed for work. Follow
[Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md#product-sequencing)
for sequencing and prioritize other UM-B and account-security work by actual
need or confirmed risk.
Roll out NT branding incrementally on the affected screens.

## 2. Confirmed contracts and unresolved facts

| Area | Evidence and limit |
|---|---|
| Authentication | The app already uses Supabase Auth and SSR cookies; signup, password login, recovery and code exchange exist. The installed SDK also supports explicit signup-confirmation resend. No new Auth stack or package is required for this design. |
| Application authority | Current profile status/role/scope and guarded API/RPC/RLS remain authoritative. Email confirmation and application approval are separate. User-editable metadata and requested affiliations must not grant authority. |
| Admin commands | Existing RPCs approve/reject, change an active account's role and suspend/deactivate/reactivate with active-admin, target, reason and request-ID guards. They do not support choosing a new role and affiliation atomically during approval. |
| Directory | Existing get_admin_profiles_page accepts cursor and limit up to 100, orders by created_at/id descending, and supplies neither global search/filter nor exact total. |
| Legacy affiliation | One bounded Owner-approved account read on 2026-10-24 recorded active staff, missing actual organization/department/sector, and valid requested department/sector. This explains that observed requested-affiliation label, not all accounts. Absence of approval metadata/audit does not establish who changed it or whether historical approval ever occurred. No personal identifiers or raw query results belong in this plan; that read permission is consumed. |
| Later bounded read and Owner report | Section 15 records that actual affiliation was NULL in the 2026-11-02 read and separately records the Owner's prior-approval report. The historical cause remains unknown. The Owner then reported a successful confirmation in the [Production closeout](#2020-first-round-production-closeout). |
| Mail/configuration | The dated hosted readback verified Confirm Email, both templates, both public callback redirects and the NT SMTP host and port. One signup email arrived on UM-B. Production confirmation-link and reset behavior on UM-A2 are **NOT RUN**. See [25.5](#255-redirect-change-readback-and-auth-preflight), [26.5](#265-production-smtp-checkpoint) and [27](#27-um-a2-production-closeout). |
| Visual baseline | Master Catalog supplies the shared shell and NT-yellow accent. Its web UI currently inherits IBM Plex Sans Thai; official catalog PDF uses NT Regular/Bold. Prior concept images are not final NT CI or rendered acceptance. |

Source references: [Login](../../../app/login/page.tsx),
[callback](../../../app/auth/callback/route.ts),
[middleware](../../../lib/supabase/middleware.ts),
[current authorization](../../../lib/auth/authorization.ts),
[Admin](../../../app/admin/page.tsx), and immutable
[027 source](../../../migrations/027_p49_active_profile_authorization_hardening.sql).
Reading historical SQL is not permission to edit or replay it.

## 3. UM-A scope

UM-A is a planning umbrella over existing Auth and database contracts, not one
approved combined implementation. The Owner emphasized continuity for current
users and the back-office nature of the immediate need. Start with the bounded
Admin-only candidate below; do not carry all subsequent sections into it.

| Candidate | Proposed first scope | Explicit boundary |
|---|---|---|
| UM-A1 — Admin first | Existing /admin directory pagination, truthful affiliation labels, read-only account details and scoped NT presentation | Keep Login/callback/middleware, AuthProvider/useUser, pending/profile/dashboard, domain settings/predicate, cookies/session, shared primitives/global fonts/tokens and database contracts unchanged. |
| UM-A2 — user-facing Auth follow-up | Show the correct next step after signup and help users when a verification link fails | Use the current email input and the existing Pending/Profile pages. Keep existing password recovery in the acceptance checks. [Current scope](#23-um-a2-implementation-review) |
| Later Admin command UX | Replace native prompts if needed; strengthen actor/target binding and uncertain-command recovery using existing commands | Not part of A1. Review its actual client diff separately before new UM-B transitions; no new backend concurrency guarantees are inferred. |

UM-A1 keeps existing approval/role/status controls and RPC semantics. It does
not auto-approve, repair affiliation, reactivate, downgrade or otherwise update
any account on load, paging, opening details, retry or mounting a branded shell.
Explicit existing Admin commands still intentionally affect their chosen target;
back-office work is not a promise that an Admin action has no business effect.
Preserve current reason/request-ID rules and disclose their existing limitations.
This does not freeze optimistic client-state patches: the authoritative
post-command reread below is part of A1's data consistency, not a new command.
When paging, keep controls bound to the correct visible target, dismiss stale
edit selection, and do not apply late results to another actor/page/account.
This is preservation around pagination, not a command-workflow redesign.

The NT pilot reuses existing primitives, NT color tokens and genuine assets
through scoped Admin components/classes, inheriting the existing IBM web font.
A1 excludes new font declarations, global tokens/font swaps and changes to
the shared Button/Input/Dialog/Sheet implementations. A broader shared foundation
needs its own reviewed impact scope; it is not required to begin this pilot.
No new role, schema, RPC, RLS,
allowlist/admission policy, password policy, Auth/SMTP setting, identity link,
organization correction or account cleanup is included.

### UM-A2: Signup and confirmation

After signup, guide users to check their email when the response has no session.
When Supabase returns a session, hand off to the current route guards and
Pending/Profile path. Give users a visible next step if their confirmation
link fails. The [current scope and Docker plan](#23-um-a2-implementation-review)
cover these two changes using the existing email input and policy.

### UM-A2: Pending and profile presentation

Deferred proposal. In the first UM-A2 release, landing in the existing flow is
an acceptance check. The table below describes a later presentation change.

| Trusted profile state | UI and permitted next step |
|---|---|
| pending with rejected_at | Show reason, edit and resubmit through the existing own-profile RPC. |
| pending, no rejection, onboarding_completed | Submitted; await review, inspect own information and refresh status. |
| pending, no rejection, not completed | Complete and submit own profile/requested affiliation. |
| active | Existing business routes according to current role/scope. |
| inactive/suspended | Existing blocked flow and logout. |
| authorization/load failure | Explicit unavailable/retry state; never fabricate pending, active or no-affiliation. |

Rejection has presentation priority; it is not a new database status. Preserve
existing profile-field and signature restrictions. Do not import dated Dashboard
copy claiming pending users can start BOQs or must upload a signature.

### UM-A1: Admin directory and details

- Request 26 rows, display 25, use the 25th row's created_at/id as next cursor;
  the lookahead proves whether another page exists. Keep cursor history for Back.
- Label counts as current-page counts. Do not show fake whole-directory totals,
  numbered total pages, global search/filter, batch mutations or unsupported controls.
- Preserve raw affiliation IDs alongside resolved names. Distinguish actual NULL,
  missing/inaccessible references and lookup errors. Keep actual/requested groups separate.
- Reuse safe fields returned by the existing RPC for details and rejection metadata;
  do not query Auth admin data or add an email-verified badge without trusted evidence.
- Pending approval displays the actual current role and requested affiliation,
  uses the existing approval RPC and validates the requested hierarchy server-side.
  No pending role/organization chooser or combined role/status Save is offered.
- Active role/status actions remain separate and only offer existing legal transitions.
  Self-authority restrictions and exact legacy read-only fallback remain intact.
- Cursor/detail promises above apply to the current directory RPC. The legacy
  fallback has no cursor contract and omits raw affiliation IDs and rejection/
  update metadata. Keep its existing mutation-disabled presentation, label its
  bounded result and unavailable fields, and do not treat absent projection as
  actual NULL/no history or promise the same pagination. Do not broaden that
  fallback query or silently change its activation conditions within UM-A.
- Keep existing guarded RPC command semantics during A1 and test their correct
  target under paging/refresh. Allow the minimal post-command reconciliation
  described below. Do not turn a lookup or requested affiliation into an
  automatic mutation, role decision or approval.
- Preserve the existing Master Catalog entry on /admin and its loading, enabled,
  read-only and unavailable states. Directory pagination/dialog work must retain
  the guarded gate projection and fail-closed behavior, without enabling Catalog
  mutations or coupling a directory retry to an automatic Catalog action.
- Suspend/deactivate means application access is blocked by current-status guards;
  it is not proof of Auth ban, all-device logout or erasure of already displayed data.

### A1 architecture and post-command consistency

Keep three small feature boundaries: the existing RPC/query adapter, an explicit
fetched-record/display model, and UI components. These are functions/types within
this feature, not a new repository framework, permission engine or user store.

- Use existing UserRole/UserStatus types. Decode the selected RPC fields once,
  retain raw actual/requested IDs and supplied audit/update fields, and attach
  the source mode. Do not blindly cast every row to a complete profile or map a
  missing legacy field to a real NULL.
- Derive account status, onboarding substate and affiliation resolution
  independently in one presenter used by table, counts and details. Current
  trusted profile status/role/scope remain authority; requested IDs and display
  labels never grant permissions or create new stored statuses.
- Resolve only unique actual/requested reference IDs needed by the current page,
  plus relevant parents, through existing permitted queries. Validate lookup
  errors/completeness instead of assuming an all-reference query is uncapped.
  Unresolved/inaccessible is not evidence of invalid or unassigned data.
- Centralize cursor history, lookahead, loading/error and latest actor/request
  handling for table and drawer. Preserve the raw timestamp/ID cursor; do not
  serialize a localized date back to the RPC. No directory data persists across
  actors or beyond this workspace in a new local-storage cache.
- Capture the initiating actor, target and local generation before an Admin
  intent. After fresh requireActiveAdmin and immediately before the mutation RPC,
  compare its returned actor ID with the initiating actor and recheck the local
  generation; cancel an obsolete intent instead of sending it under another
  signed-in Admin. Invalidate pending selection on actor changes as well as
  ignoring late responses. This feature-local containment follows the existing
  L1 pattern and requires no shared Auth changes; it is not a claim of new
  server-side compare-and-swap or atomic client/session binding.
- After a confirmed command success, invalidate/re-read the authorized page and
  visible details from the existing projection. Do not fill actual IDs, names,
  approval metadata or updated_at from a cached request, client time or desired
  status. The current approve handler's partial optimistic update is insufficient
  for A1's richer data model and must not be copied into it.
- If the successful command is followed by a failed reread, distinguish
  completed command from unavailable current details. Mark stale data clearly,
  disable dependent actions and offer a read retry; do not report the mutation
  as failed or automatically issue it again. If the target is no longer on the
  reloaded authorized page, close/invalidate its detail rather than scanning
  the whole directory or inventing a new by-ID endpoint.
- For transport-uncertain command results, show uncertainty and a safe current
  read path; do not promise failure, automatically retry with a new UUID, or
  treat a refreshed desired value as proof that this intent was recorded.
  Full same-intent replay/recovery remains later bounded command-UX work.

This preserves the existing backend API and business effects while preventing
new contradictions between raw IDs, labels and details. Source evidence is
app/admin/page.tsx's role/status/approve optimistic updates and the locked
current-target reads in immutable 027. It is not fresh runtime acceptance.

For later command-UX work, bind target/action/reason/request UUID and actor
generation, reject stale dialogs/late responses, and retain UUID/payload for
recovery of the same uncertain intent. Refresh current authority/target and reload
after success. Existing RPCs lock/validate state but have no expected-version
comparison; refresh cannot eliminate all concurrent overwrites. These are future
command-UX acceptance requirements, not claims about current handlers or A1 scope.

### Existing domain policy — preserved, not redesigned in A1

The setting described historically as signup restriction is currently checked
before Login's login/signup/recovery branch and again for protected web access.
Changing it can therefore block existing out-of-domain users/Admins; it is not
an Auth ban or universal direct-API revocation. Actual hosted values/hooks are
unverified. A1 must not add, remove, toggle or reinterpret this policy, silently
turn it on, or change the underlying predicate while restyling Admin. Separating
new-account admission from existing-account access is a later security decision.

### Existing active accounts without affiliation

Show status as active and actual affiliation as not assigned; show requests in
a separate group. Do not force onboarding, reverify all old email addresses,
downgrade, reactivate, sign out or assign requested values automatically.

Use role-aware wording: Admin access does not require a sector; department-level
scope uses department_id; staff/sector-manager shared scope uses sector_id.
A blank sector is not universally an invalid account. Existing owner/assignee
access is not replaced by the new label. A true pending account apparently doing
business work is a separate security investigation, not this legacy-label case.
Preserving access here means no restriction solely because affiliation is
missing, under the approved post-S0 role/scope contract. It does not preserve
the unintended procurement direct-write paths addressed by focused S0.

## 4. Proposed file boundary

UM-A1's proposed application boundary is app/admin/page.tsx plus small Admin-only
components/pure view models and meaningful tests. Use the existing authorization
helpers and RPCs without editing their definitions. Keep the Catalog entry/gate
and legacy read-only fallback. No new settings-control or hard-delete capability.

UM-A2's proposed runtime boundary is `app/login/page.tsx`,
`app/auth/callback/route.ts`, one informational page, and the middleware rule
for that exact route. See [the proposed files](#233-proposed-files-and-user-impact).
Pending, Profile and Dashboard presentation remain future work.

Any shared visual source/font change must have a named #11 pilot surface and
regression scope before implementation approval. Master Catalog business code,
BOQ calculations/Copy/031, Print/PDF/Excel, Catalog/Factor F and package/lockfile
changes are excluded. Final file counts come from the reviewed actual diff;
this is not a grant to alter arbitrary files under these folders.

## 5. Future local acceptance and release limits

Before any approved execution, establish exact source, existing Docker target
and the relevant post-031 contracts. UM-A2 additionally needs confirmation
settings and local mail-capture behavior; A1 does not send signup/resend/recovery
mail or require an Auth configuration change just to review the directory.
Do not run the unreviewed parity/reset/bootstrap runners or change Auth config
merely to manufacture a passing test. If parity/configuration prevents a required
case, report it and propose the bounded change separately.

Fixture preparation and real signup/approval tests WRITE Auth/profile data even
though the patch has no schema change. Future approval must explicitly cover
the bounded creation/transitions, safe final states and retained synthetic rows
in [section 11.6](#116-test-data-lifecycle). Do not promise deletion of all
fixtures: profile hard-delete is denied and authorization events are append-only.
Exact IDs identify custody and permitted finalization, not permission to bypass
those guards. No new BOQ is required for A1 directory acceptance. Any chosen
write-based BOQ/Copy regression needs a separately specified run-owned graph,
request-tuple and cleanup envelope in the execution approval; it is not implicit.
Keep original account role/status/affiliation/password and existing BOQ/reference
data unchanged; no real corporate mail should be sent by fixture preparation.
No reset/restore, migration replay, original-data cleanup or Production operation.

| Gate | Required evidence after implementation approval |
|---|---|
| A1 containment | No diff to Login/callback/middleware, Auth context/hook, shared authorization/domain predicate, global layout/styles/primitives, DB/config/package or business/output source. No account update from navigation/read/retry. |
| A1 Admin | More than 100 runtime users through the supported fixture lifecycle; deterministic tied-timestamp cases use mocks unless existing local rows provide an actual tie. Cover first/last pages, lookup failure/cap vs missing IDs, read-only details, paging during commands, legal/illegal transitions and current-admin loss. Retain RPC semantics, Catalog entry/gates and mutation-disabled fallback; do not claim full uncertain-response recovery. |
| A1 canonical state | Open details then approve/change role/status: reread raw IDs, labels and metadata as one current projection. Cover mutation success + reread failure, transport uncertainty, disappeared targets and actor/page switches with late responses. Switch actors while authorization is awaiting and verify the obsolete intent sends no mutation RPC; no automatic mutation retry or fabricated approval facts. |
| A1 existing-user regression | Existing session/navigation, short username/full email, pending/inactive denial and authorized BOQ list/editor/output reads and Copy control/guard checks remain under the unchanged current contract. These checks do not invoke Save/Copy. A real Save/Copy invocation requires the additional explicitly approved run-owned graph/request/cleanup envelope in section 11.7. No forced logout/onboarding/reverification or email-policy change. |
| A2 Auth | Short username and full email normalization, autofill/password-manager behavior, signup session/no-session, known/unknown errors without enumeration, confirmation/resend, expired/reused links, recovery, logout and existing-session/cookie continuity. |
| A2 Pending | Incomplete/submitted/rejected precedence, displayed reason, correction/resubmit and existing RPC clearing of rejection fields. |
| Later command UX | Exact actor/target/action/reason/UUID, stale dialog/late response, response-loss recovery and post-action refresh; keep current server limitations explicit. |
| Existing users | Active accounts including missing-org cases retain current access; inactive/pending denial and original UUID/ownership/data invariants remain. Test relevant BOQ/Copy/output access without changing their contracts. |
| Brand/UX | Real runtime NT assets and approved typography scope, Thai wrapping, mobile layout, keyboard/focus, loading/error/empty states, no cross-user cached presentation. Static concept images are not rendered PASS. |
| Quality | Existing tests, lint, TypeScript and build on Node 24; report exact source/target, files, PASS/FAIL/NOT RUN and residuals before release approval. |

Apply the gates relevant to the named candidate; do not require new signup/mail
delivery proof for the Admin-only A1 read/presentation change. Track A2 application
UX, Auth callback and actual mail delivery separately. Local
mail success does not prove hosted delivery. Required failures/unknown relevant
parity block a release-ready claim. Any hosted read, configuration fix, real-mail
check, publication or deployment needs fresh bounded approval; old receipts and
this plan confer none. Do not reopen B Production HTTP or its closed NOT RUN decision.

## 6. UM-B and broader policy decisions

UM-B is a separate proposed trusted-transition/database work package:

**2026-11-02 priority:** take item2's narrow all-NULL active-staff case first
after S0/A1, under [section15](#15-um-b-priority-legacy-affiliation-confirmation-plan).
The list below remains the wider programme; item1/new-role design, general
transfers, Viewer, SSO and session policy are not bundled into that first case.

1. Choose final allowed role and validated affiliation before activation in one
   transaction, without temporarily granting a different role.
2. Add explicit narrowly scoped confirmation of missing legacy affiliation, with
   current-state checks, reason/audit and explanation of changed visibility.
   General organizational moves require their own policy; do not disguise them as label fixes.
3. Define who certifies personnel/affiliation, account deactivation/reactivation,
   minimum privileged recovery and the required session/offboarding behavior.
4. Design one Viewer role with bounded scope and explicit print/export permissions.
   The recommendation is operational-BOQ visibility for TOR readers; this remains
   an Owner decision, and enabling it waits for the corresponding scope/status
   contract and write-denial coverage on every entry point.

Before finalizing new activation/affiliation SQL or UI, define a reviewed-state
conflict rule: the server must reject a materially changed target/request rather
than approving a different role/affiliation from what the Admin reviewed. Choose
the exact fields/token after checking all relevant write paths; do not assume a
client refresh or row lock supplies this guarantee. Existing 027 has no expected
reviewed-state argument. Its locks serialize operations and re-read current state;
they do not retain the earlier browser review. This distinction also follows
[PostgreSQL's transaction/locking behavior](https://www.postgresql.org/docs/current/transaction-iso.html).

Preserve one request UUID/payload per command intent in the later command UX.
Existing audit idempotency identifies request/action/target and validates its
recorded payload. A successful replay means that intent was previously applied;
it does not establish the target's present role/status after subsequent commands.
Always reconcile current state after replay. Design legacy-client/endpoint
compatibility explicitly so an optional expected-state argument or an old approval
path cannot silently bypass a new required invariant. Do not replace row locks
with optimistic UI checks or redesign working locking/idempotency unnecessarily.

Use actual-time confirmation/audit for legacy affiliation. Do not invent or
backdate an old approval, infer an actor from missing audit, or populate past
approved_at/by merely to remove a label. New affiliation certification and
historical activation are distinct facts. Validate hierarchy and the approved
role/scope matrix atomically with explicit before/after visibility implications.
Existing authorization events record old/new role/status, not structured
old/new affiliation. UM-B must define the minimal structured old/new affiliation,
actor/target/time/reason/request outcome evidence and replay-payload comparison
for its new transition; human reason text alone is insufficient. Choose the SQL
shape only under later approval, preserving existing immutable events. Reuse of
a request UUID with a materially different role/affiliation/review token must
be rejected rather than treated as the same intent.

Unconfirmed-account retention/cleanup, admission versus login/recovery changes
and Auth session revocation remain policy/contract decisions, not implicit UM-A
fixes. Keep admission and ongoing-access decisions separate while retaining
one authoritative policy per action; do not create competing domain checks in
several screens. The focused S0 plan does not close all these topics.
Future SQL must be reviewed and explicitly approved; do not create/apply a migration
from this planning approval.

### Affiliation cases and proposed Admin flows

| Case | Admin action | User action | Scope |
|---|---|---|---|
| Pending account with an incorrect request | Return it with a reason. Review the revised request before approval. | Correct the department and sector in the profile and resubmit. | [Existing pending flow](#um-a2-pending-and-profile-presentation). |
| Active staff with no confirmed affiliation and a correct request | Verify the requested hierarchy, review the BOQ visibility effect and confirm with a reason. | Continue using the existing account. | [First UM-B candidate](#152-narrow-first-candidate-and-impact). |
| Active staff with no confirmed affiliation and an incorrect request | Defer confirmation and verify the correct department and sector. Existing access continues during review. | Provide the correct details to Admin through the usual contact channel. | The deferred [Admin assignment proposal](#21-admin-assignment-for-an-incorrect-affiliation-request) would retain the original request and record the verified assignment. Active-user resubmission remains an option for separate review. |
| A confirmed affiliation changes after a transfer | Verify the transfer, select the destination from the directory and review old and new affiliations and BOQ visibility before confirming with a reason. Record who confirmed the transfer and when. | Report the transfer if Admin has not already received it from the organization. Continue with the same account. | Proposed follow-on with separate approval. BOQ ownership or assignment handover is a separate action. |

## 7. SSO and subsequent business features

Current email/password use can continue while IT confirms provider/protocol and
hosting policy. Preserve Auth UUID and BOQ ownership. Do not build a second user
store, preselect SAML/OIDC, auto-link by matching email or derive roles/activation
from unapproved SSO attributes. Pilot identity continuity and offboarding after
IT decisions, under separate approval. Confirmed IT restrictions may reorder releases.

SSO-ready means a deliberate identity-continuity boundary, not a promise of
zero future migration. Supabase documents that SAML SSO accounts do not link to
existing password accounts and may share their email address; email is therefore
not a safe continuity key. See [project SAML account behavior](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml#user-accounts-and-identities).
Until IT confirms the mechanism, keep existing UUID references intact and require
an approved, rehearsed mapping/ownership plan before enabling SSO. Do not add a
speculative identity table now or silently replace BOQ/audit owners later.

Use the existing Admin review as the starting point for future SSO affiliation
review. Keep the user's request, the organization's reported affiliation and
the application's confirmed affiliation distinct. SSO can prefill profile
details and suggest a department or sector when an approved organization code
maps to a valid internal record. If data is missing, unmapped or conflicts with
the confirmed affiliation, show the reason for review and preserve current
access during affiliation review. Confirmed affiliation, application role and
account status continue to govern BOQ access. Titles and groups have no access
effect until Owner and IT approve an explicit mapping and lifecycle policy.

Before the SSO pilot, confirm the stable identity key, which attributes IT can
supply, which system owns the organization codes and how joiners, transfers
and departures are reported. Use only the approved attributes needed by the
application. Review account continuity and any automatic access changes under
the separate SSO scope.

The [first UM-B candidate](#152-narrow-first-candidate-and-impact) still confirms
only the existing valid request for active staff with no actual affiliation.
An Admin choosing a different affiliation, or an active user correcting a
request, can be reviewed separately if current cases require it.

Follow [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md#product-sequencing)
for the order of BOQ workflow review, the relevant R0/D0 criteria, and release.
Prioritize remaining account-security work by actual need or confirmed risk.
The [BOQ workflow plan #13](./13-boq-operational-workflow-plan.md) describes
paper approval and the separate roles allowed to record it in the app.
Lock operational content and use ordinary existing Copy to a new independent
draft for correction. No mandatory revision-chain/source-link/supersede engine
is added. TOR three-name fields do not
create account roles. Names and wording are per-print inputs without database
persistence in the first release; exact print form and blank Excel template are
separate output decisions. Quantity Expression follows the approved numeric foundation.

<a id="8-decisions-and-present-status"></a>
## 8. Original planning decisions and status — 2026-10-24

This records the original planning stage. See the [current UM status table](#121-current-state-and-authority)
for subsequent releases and retained limits.

Approved direction: whole-site NT brand consistency and planning alignment.
For review first: the Admin-only A1 visual/state set, scoped #11 pilot/file
boundary, preserved commands and synthetic local test-write scope. A2 Auth routing,
later command-UX changes and UM-B policies remain separate proposed scopes.
Implementation, new SQL/configuration, fixtures, runtime tests, final rendered
brand acceptance, hosted delivery and release remain NOT RUN / NOT AUTHORIZED.

## 9. Completion and retained limits

A1 is a usable directory/read-presentation milestone, not completion of user
management, legacy affiliation repair, concurrency or SSO readiness. Avoid new
foreseeable debt by building the single model/adapter and required reconciliation
in A1; do not defer those essentials as cosmetic follow-up work.

Track existing unresolved contracts to their actual closure triggers:

| Retained limit / decision | Required closure point |
|---|---|
| Existing procurement direct-write gap | Focused S0 acceptance/release before optional UM UX publication; separate SQL authority. |
| Old command uncertainty / reviewed-state mismatch | Disclose in A1; finalize conflict/replay/compatibility design and tests before enabling new UM-B authority transitions. |
| Active legacy actual affiliation missing | Explicit trusted UM-B confirmation when selected by Admin; no automatic sweep and no fictitious historical approval. |
| Signup vs ongoing email restriction and hosted mail | Keep current values/behavior in A1; settle policy/config relevance before corresponding A2/security release, with no silent existing-user lockout. |
| Legacy read-only projection | One isolated compatibility adapter with explicit missing capabilities; no new fallback path. Retire only after verified supported environments and approved removal. |
| Font rollout / SSO mapping | Named later visual/IT gates; neither is represented as implemented by A1. |

Before closing the whole UM programme, the Owner must review applicable A2/UM-B
acceptance and these retained limits. No release is called debt-free simply
because its UI looks complete or its tests/build pass. This is a bounded plan
to avoid known new debt and make existing limits reviewable, not an assertion
that all future change or risk can be eliminated.

## 10. Holistic readiness review — 2026-10-24

Compared the local application at documentation HEAD 67c1e6f (application paths
unchanged from L1 b1ce449), immutable SQL, the existing metadata-only capture
dated 2026-10-23 01:44:51 Bangkok, post-031/L1 receipts and current plans. This
review made no DB connection, Docker change, live Production inspection or
business-row read. The frozen capture is pre-031; use the separate later receipts
for 031, not a rewritten baseline or an assumed fresh local parity PASS.

The design follows the principle of minimal authority and trusted enforcement
on every action from [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
and [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
These references support the design; they do not certify this application's
current configuration, SQL or runtime behavior.

Verdict: suitable for approving a bounded next local candidate, not for starting
all UM work or claiming release readiness. Focused S0's proposed correction must
first reproduce/verify the relevant current local contract and pass its own
write-denial/allowed-flow acceptance after explicit SQL/fixture/DDL approval.
A1 has no identified need for a new database API/schema and can use existing
cursor/projection queries. Its code/visual/synthetic-test scope still needs Owner
approval; A2, UM-B and SSO remain their separate later decisions.

Current baseline-only mock/source checks passed 45/45 on Node 24: 17 existing
P-49 application-authorization checks plus 28 documentation-contract checks.
These are not new A1 browser/HTTP tests, fresh local metadata parity, mail
delivery, SQL application or Production acceptance. New S0/A1 candidate
implementation and runtime cases remain NOT RUN.

A later A1 release plan must distinguish client rollback from account recovery:
reverting UI source does not undo explicit successful Admin commands. Do not
reverse role/status/affiliation data automatically as a deployment rollback.
S0's successful security guard likewise has no automatic removal authority.

For S0 and A1 there is no need to wait for the corporate IdP or provide personal
account lists/passwords. Approve the exact local task and synthetic fixture
creation/change/finalization/retention envelope before execution. Before UM-B, the Owner must
settle who certifies actual role/affiliation, role/scope requirements and new-user
admission/exception policy; retain current users/values meanwhile. IT must later
confirm hosting/IdP/mapping for their own cutover, not as an automatic A1 blocker.
All current prohibitions in section 1 remain in force.

## 11. UM-A1 approval packet

Prepared: 2026-10-26 (Asia/Bangkok). **พร้อมให้ตรวจขอบเขต; ยังไม่อนุมัติลงมือ**

### 11.1 Decision summary

ผลลัพธ์ของ A1 คือหน้า Admin ที่อ่านทะเบียนและข้อมูลสังกัดได้ตรงความจริง
แบ่งหน้าได้ครบ และไม่แสดงข้อมูลขัดกันหลังคำสั่งเดิมของ Admin ไม่ใช่การ
เปลี่ยนระบบ Auth หรือการซ่อมบัญชีจริงทั้งระบบ

| ชุดงาน | ปัญหาที่รับผิดชอบ | สิ่งที่ A1 ไม่รับมา |
|---|---|---|
| **UM-A1 — ชุดที่เสนอครั้งนี้** | ทะเบียน Admin, รายละเอียดอ่านอย่างเดียว, actual/requested labels, แบ่งหน้าและอ่านผลล่าสุดหลังคำสั่ง, NT presentation เฉพาะหน้า | ไม่มีการเปลี่ยนสิทธิ์หรือสังกัดอัตโนมัติ |
| UM-A2 | สมัคร/ยืนยันอีเมล/ส่งซ้ำ/callback/pending/profile UX ด้วย Supabase Auth เดิม | ไม่รวมใน code/test scope ของ A1 |
| UM-B | อนุมัติพร้อมกำหนด role/สังกัดอย่างเชื่อถือได้, ยืนยันสังกัด legacy, conflict/audit/session-policy decisions | ต้องตัดสินใจกติกาและอนุมัติ SQL/implementation ใหม่ |
| Focused S0 | ช่อง procurement เขียน BOQ ผ่าน direct API ได้เกินเจตนา | เป็น security patch แยก ไม่ใช่การแก้ป้าย “(ขอ)” และไม่มี SQL ของ S0 ใน A1 |

ทำแบบและตรวจแผน A1 ได้ทันที ลำดับ S0 → A1 → A2 → B เป็นข้อเสนอ ณ วันที่
จัด packet นี้; section15/roadmap refinement 2026-11-02 ยก narrow legacy
confirmation ของ UM-B ก่อน A2 โดยไม่เปลี่ยน scope/อำนาจเดิมของ A1
ไม่ต้องรอ IdP ขององค์กรเพื่อทำ A1; คง Auth UUID/ownership เดิม และไม่สร้าง
identity store, role หรือ SSO linking เผื่อไว้ล่วงหน้า

### 11.2 UI layout and interaction

แบบต่อไปนี้เป็น wireframe และข้อกำหนดเพื่ออนุมัติทิศทาง ไม่ใช่ภาพ runtime
หรือผล NT CI/accessibility PASS ใช้ชื่อและอีเมลสมมติเท่านั้น

**Desktop — `/admin`**

```text
← กลับ                 จัดการผู้ใช้งาน
                       ตรวจสอบบัญชี สังกัด และสถานะการใช้งาน
══════════════════════ เส้น NT Yellow ══════════════════════

Master Catalog     [สถานะจาก gate เดิม]     [เปิด Master Catalog]

ทะเบียนผู้ใช้งาน                 หน้านี้ 25 คน    [โหลดใหม่]
┌───────────────┬─────────────────┬──────────┬──────────┬──────────────┐
│ ผู้ใช้         │ สังกัด          │ บทบาท    │ สถานะบัญชี│ การดำเนินการ │
├───────────────┼─────────────────┼──────────┼──────────┼──────────────┤
│ ผู้ทดสอบ ก    │ สังกัดจริง      │ พนักงาน  │ ใช้งาน ▾ │ ดูรายละเอียด │
│ อีเมลสมมติ    │ ยังไม่ได้กำหนด  │          │          │              │
│               │ สังกัดที่ยื่นขอ │          │          │              │
│               │ ฝ่าย ก / ส่วน ข│          │          │              │
└───────────────┴─────────────────┴──────────┴──────────┴──────────────┘
                              [ก่อนหน้า]      [ถัดไป]
```

- อ้างอิงโครงสร้าง Master Catalog: header ขาว, เส้น NT Yellow 4px,
  neutral canvas, `max-w-7xl`, gutters เดิม หัวข้อปรับความสูงตามข้อความ
  ใช้ IBM Plex Sans Thai และ semantic tokens/primitives ปัจจุบัน
- Header A1 ไม่เพิ่ม logo; Master Catalog web shell ปัจจุบันไม่มี logo เช่นกัน
  ไม่เพิ่ม asset/ฟอนต์/สีชุดใหม่ และไม่ import Catalog business frame/gate
  มาใช้เป็นสิทธิ์ทะเบียนผู้ใช้
- คง back navigation และ Master Catalog card/link พร้อม loading, enabled,
  read-only และ unavailable states เดิม แยกการ retry ทะเบียนจาก Catalog
- ไม่มี sidebar ใหม่, KPI tiles, global search/filter, total ทั้งระบบ,
  numbered total pages, batch action, invite/create-user หรือ domain toggle
  ปุ่ม “โหลดใหม่” อ่านหน้าปัจจุบัน; ผลแต่ละหน้าเป็นการอ่านล่าสุด ไม่ใช่ snapshot
  หากต้องการเห็นบัญชีใหม่ด้านบน ใช้ “ก่อนหน้า” จนถึงหน้าแรก
- คง role/status controls และ native confirm/reason prompts เดิม ไม่เพิ่ม
  pending role/org chooser หรือหน้าบันทึกหลายสิทธิ์พร้อมกัน ปุ่ม approve/reject
  ใช้ข้อความ “อนุมัติ” / “ส่งกลับแก้ไข” พร้อม accessible name ระบุเป้าหมาย
  โดยคงคำสั่ง/เงื่อนไขเดิม ไม่ใช้เครื่องหมายถูก/กากบาทที่ไม่มีคำอธิบาย
- “ดูรายละเอียด” เป็นปุ่มชัดเจน ไม่ทำทั้งแถวเป็นปุ่มครอบ Select/action อื่น
  ทุกปุ่มอ้างอิง target ID จริงและถูกยกเลิกเมื่อ actor/page/selection ล้าสมัย

**Mobile และรายละเอียด**

ต่ำกว่า `lg` เสนอ card list: ชื่อ/อีเมล → สถานะ/บทบาท → สังกัดจริง →
สังกัดที่ยื่นขอ → controls เดิม/ดูรายละเอียด; ตั้งแต่ `lg` ใช้ตาราง
ยืนยัน breakpoint หลัง render จริงที่ 320/390/768/1024/1280px และ zoom 200%
ห้ามให้ชื่อไทยหรืออีเมลยาวดันทั้งหน้าให้เลื่อนแนวนอน

มี query/state owner และ presenter เดียวทั้งสอง layout ไม่สร้างการโหลด
หรือ dialog/action ซ้ำตาม responsive mounts ใช้ handlers เดียวกัน
รายละเอียดมี Sheet instance เดียว เปิดจากข้อมูลในหน้าที่ได้รับสิทธิ์อยู่
ปรับเฉพาะ instance ให้เต็มความกว้างมือถือ/ประมาณ 32rem บน desktop พร้อม
scroll body และหัวข้อ/ปิดที่หาได้ง่าย ไม่แก้ `components/ui/sheet.tsx`

```text
ข้อมูลผู้ใช้งาน                         [ปิด]
ผู้ทดสอบ ก · อีเมลสมมติ

บัญชี            บทบาท / สถานะ / การส่งข้อมูลสมัคร
สังกัดจริง        ข้อมูลจริงที่อ่านได้ หรือคำอธิบายสถานะการอ่าน
สังกัดที่ยื่นขอ   แสดงแยกจากสังกัดจริงเสมอเมื่อมีข้อมูล
ข้อมูลที่บันทึก   วันสร้าง/ปรับปรุง และข้อมูลอนุมัติ/ส่งกลับที่ RPC มี
```

Sheet อ่านอย่างเดียว ไม่มี command controls ซ้ำ, ช่องแก้ไข, ปุ่มยืนยันสังกัด,
Auth-admin lookup, รูปลายเซ็น หรือข้อมูลส่วนบุคคลที่ไม่จำเป็น เช่น เบอร์โทร
และรหัสพนักงาน ไม่แสดง email-verified badge, audit timeline/count หรือชื่อ
ผู้อนุมัติที่ RPC ไม่ได้ resolve ให้; missing metadata ไม่ใช่ “ไม่เคยอนุมัติ”
ไม่เพิ่ม by-ID RPC หรือ scan ทั้ง directory เพื่อคงรายละเอียดไว้นอกหน้า

Tab order ตามลำดับข้อมูล, focus มองเห็น, controls มี label, สถานะมีข้อความ
ประกอบสี และ touch targets ตั้งเป้าประมาณ 44px ผ่าน feature-local classes
Sheet ต้องมีชื่อ/คำอธิบาย, focus containment, Escape/ปิด และคืน focus ให้ปุ่ม
ต้นทาง; หากปุ่มหายหลัง refresh ให้กลับหัวข้อทะเบียนแทน ไม่มีการขโมย focus
จากข้อความผลลัพธ์ทั่วไป ตรวจ portal, การตัดบรรทัดไทย และ reduced motion จริง
ทะเบียนมี `aria-busy` และประกาศผลอ่าน/เปลี่ยนหน้าหนึ่งข้อความแบบ polite
ไม่สร้าง live region ทุก cell หรืออ่านข้อมูลส่วนบุคคลทั้งแถวซ้ำโดยไม่จำเป็น

### 11.3 Truthful state and command contract

| ข้อมูล/เหตุการณ์ | การแสดงผลและพฤติกรรม A1 |
|---|---|
| active + actual affiliation NULL + มีคำขอ | สถานะ “ใช้งาน”; สังกัดจริง “ยังไม่ได้กำหนดสังกัด”; แสดง “สังกัดที่ยื่นขอ” แยก ไม่เปลี่ยนบัญชี |
| actual department มีค่า แต่ sector NULL | แสดงค่าจริงที่มีและคำอธิบายตามบทบาท ไม่ทำ Admin/ระดับฝ่ายเป็นบัญชีผิดเงื่อนไขเพียงเพราะไม่มี sector |
| มี ID แต่ lookup ล้มเหลว | “โหลดชื่อสังกัดไม่สำเร็จ” พร้อม read retry; คง raw ID ไม่แสดงเป็น NULL/ยังไม่ได้กำหนด |
| มี ID แต่ไม่พบในผลที่อ่านได้/ผลไม่ครบ | “ไม่พบข้อมูลสังกัดในผลที่อ่านได้” ไม่สรุปว่าเป็นสังกัดปลอมหรือถูกลบ |
| legacy projection ไม่มี field | “ข้อมูลนี้ไม่รองรับในโหมดอ่านอย่างเดียว” ไม่แปลง missing capability เป็น NULL; ไม่เปิด mutations หรือสัญญา pagination แบบ RPC ใหม่ |
| pending | คงสถานะ pending; แยก “ส่งกลับแก้ไข” ก่อน “ส่งข้อมูลแล้ว รออนุมัติ” ก่อน “ยังกรอกข้อมูลไม่ครบ” ตาม fields ที่อ่านได้ |
| loading / read error / empty | มีข้อความแยกกันและ retry เฉพาะ read; error ไม่ใช่รายชื่อว่างหรือจำนวนศูนย์ |
| actor ไม่ใช่ active Admin / ตรวจสิทธิ์ไม่ได้ | ใช้ guard เดิม ปิด commands และไม่แสดง cached directory ของ actor ก่อนหน้า |
| command สำเร็จ | แจ้งผลแล้ว reread page/details จาก canonical projection ไม่คัดลอก requested → actual หรือสร้าง approved_at/by เอง |
| command สำเร็จ แต่ reread ล้มเหลว | แจ้ง “ดำเนินการสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ”; ทำเครื่องหมาย stale/ปิด dependent actions และให้ retry read ไม่ส่งคำสั่งซ้ำ |
| ไม่ทราบผลจาก transport | แจ้ง “ยังยืนยันผลการดำเนินการไม่ได้”; มีทางอ่านสถานะ ไม่เรียกว่า FAIL ที่พิสูจน์แล้ว และไม่ออก UUID ใหม่เพื่อ retry อัตโนมัติ |

ใช้หนึ่ง fetched record + source capability + presenter สำหรับตาราง/card/
Sheet/count แยก trusted status, onboarding substate และ affiliation resolution
ไม่เพิ่มสถานะในฐานข้อมูล ไม่ใช้ requested affiliation หรือ user metadata เป็นสิทธิ์
Reference queries จำกัดเฉพาะ unique IDs ที่หน้าปัจจุบันต้องใช้และ parent ที่เกี่ยวข้อง
ตรวจ error/ความครบ ไม่ query reference ทั้งระบบแบบสมมติว่าไม่มี API cap
หากสังกัดที่ยื่นขอยัง resolve ไม่ครบ ให้คงแถว/รายละเอียดและปิดอนุมัติเฉพาะ
target นั้นตาม safeguard เดิม ไม่ใช้ raw IDs ข้ามการตรวจข้อมูลที่ Admin ต้องเห็น
ไม่ปิดคำสั่ง role/status ที่ไม่พึ่ง lookup นั้นเพียงเพราะชื่อสังกัดบางรายการโหลดไม่ได้

RPC directory ขอ 26 แสดง 25; ใช้ raw `(created_at,id)` ของแถวที่ 25 เป็น
cursor หน้าใหม่ ไม่ใช้แถว lookahead หรือวันที่ที่ format แล้ว คง cursor history
สำหรับก่อนหน้า และปิด conflicting navigation ระหว่างโหลด ไม่นับ lookahead
ในจำนวนผู้ใช้หน้านี้ เปลี่ยนหน้าแล้วปิด/ยกเลิก selection เดิม

ก่อน mutation เปรียบเทียบ initiating actor/target/generation กับผล fresh
`requireActiveAdmin` และ state ปัจจุบันอีกครั้ง Late responses ห้ามทับคน/หน้าใหม่
หลัง reread หาก target ไม่อยู่ใน authorized page ให้ปิดรายละเอียดและคืน focus
ไม่เพิ่มการ scan เพื่อหาตัวเดิม นี่เป็น client containment ไม่ใช่ server
reviewed-state compare-and-swap; ข้อจำกัด concurrent Admin/replay เดิมยังอยู่
และต้องแก้ให้ครบก่อน UM-B เพิ่ม authority transitions

### 11.4 Exact proposed file allowlist

เป็นข้อเสนอให้อนุมัติภายหลัง ยังไม่ได้สร้างไฟล์ต่อไปนี้นอกจากเอกสาร #12 เดิม
ไม่ใช่สิทธิ์แก้ทั้ง directory และไม่รวมการแก้ tests เดิมเพื่อหลบ contract

| ไฟล์ใน candidate ภายหลัง | การเปลี่ยนที่อนุญาตให้เสนอ |
|---|---|
| `app/admin/page.tsx` | Wiring authorization/Catalog gate/commands เดิม, cursor state, actor/target generation และ canonical reread |
| `app/admin/_components/AdminUsersDirectory.tsx` | Thin Admin frame, table/mobile cards, page controls และ labels ของ commands เดิม |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | Read-only details และ instance-scoped responsive/focus behavior |
| `lib/admin/users/directory.ts` | Existing RPC/reference adapter, record/capabilities, cursor และ bounded read/reconciliation helpers |
| `lib/admin/users/presentation.ts` | Presenter เดียว แยก status/onboarding/actual/requested/error |
| `tests/admin-user-directory.test.ts` | Query/cursor/cap/error/legacy, actor/generation และ reconciliation ด้วย deterministic mocks |
| `tests/admin-user-presentation.test.ts` | State/role-aware labels และ absent field vs NULL vs failed lookup |
| `tests/admin-users.test.tsx` | Static markup/labels/layout contract ด้วย React/Vitest เดิม ไม่อ้างว่าเป็น DOM/focus/browser PASS |
| `scripts/test-um-a1-local.mjs` | Local-only prepare/verify/finalize harness, default dry-run, exact-ID manifest; writes ผ่าน trusted APIs เท่านั้น และ bounded read-only metadata/custody digests ตาม R4–R6 ไม่มี DDL/reset/SQL write bypass |
| `docs/06_engineering/UM_A1_LOCAL_RESULT.md` | Receipt ภายหลัง: exact source/target/files, tests/metrics, retained fixtures และข้อจำกัด; ห้ามใส่ secrets/PII จริง |

รวมข้อเสนอ **9 code/test/harness files + 1 result document** ลดได้หากไม่จำเป็น
แต่การขยาย paths/พฤติกรรมต้องชี้เหตุผลก่อน ไม่สร้าง shared framework/store,
permission engine, route หรือ package เพื่อให้ scope นี้สำเร็จ

Artifact ภายหลังแยกจาก release source: `supabase/local/um-a1/<run-id>/manifest.json`
เก็บเฉพาะ exact synthetic IDs, run tag, lifecycle/request IDs และผล finalization
ไม่เก็บ password/token/key/cookie; เป็น local-only และไม่อยู่ใน release allowlist
ยังไม่ได้ถูก ignore อัตโนมัติ ห้าม broad stage และไม่แก้ `.gitignore` ผ่าน A1

Excluded: Login/callback/middleware, AuthProvider/useUser, authorization helpers/
domain predicate/settings, pending/profile/dashboard, global layout/CSS/fonts/
shared primitives, Catalog code/assets, BOQ/Copy/031/output code, DB/SQL/migrations,
config/package/lockfile และเก้า parity artifacts เดิมทั้งหมด

### 11.5 Existing-user and Admin impact

| กลุ่ม/เรื่อง | ผลที่ตั้งใจและสิ่งที่ต้องพิสูจน์ |
|---|---|
| ผู้ใช้ active เดิม | ไม่มี forced logout/onboarding/reverify, UUID/ownership/ข้อมูลเดิมไม่เปลี่ยน; Login แบบชื่อสั้น/อีเมลเต็มและ session เดิมยังใช้ได้ |
| active ที่ไม่มีสังกัด | เปลี่ยนคำอธิบายให้ตรงข้อมูลเท่านั้น ไม่ลดสิทธิ์เพราะ NULL และไม่กำหนด requested เป็น actual; การยืนยันจริงอยู่ UM-B |
| pending/inactive/suspended/non-admin | ไม่ได้รับ business/Admin access เพิ่ม; ใช้ guard เดิม ข้อมูลไม่ข้าม actor |
| Admin เดิม | เห็นครั้งละ 25 แทนการโหลดไม่เกิน 100 แบบหน้าเดียว, เปิดรายละเอียดได้, อาจพบ read refresh หลังคำสั่ง; คง self-authority restrictions/เหตุผล/UUID/RPC เดิม |
| คำสั่ง Admin ที่กดยืนยัน | ยังเปลี่ยน role/status/approval ของ target ตามเดิม มี business effect จริง; A1 ไม่เพิ่มคำสั่งและไม่ย้อนผลอัตโนมัติ |
| Email/domain policy | ค่า/controls/predicate เดิมไม่เปลี่ยน ไม่ถือว่า A1 แก้ข้อจำกัดอีเมลองค์กรหรือการส่งเมลแล้ว |
| BOQ/Catalog/Factor F/Print/PDF/Excel | ไม่แก้ source/ข้อมูล/การคำนวณ; regression ใช้ relevant current contracts ไม่ถือว่า source unchanged แปลว่าทดสอบผ่าน |

UI rollback คืน source หน้าจอได้ แต่ไม่ย้อนคำสั่ง Admin ที่สำเร็จแล้วและไม่ลบ
audit/fixtures การคืนข้อมูลบัญชีต้องเป็นคำสั่งที่ตรวจสิทธิ์และอนุมัติของมันเอง
ไม่ถอด S0 guard เป็น rollback ของ A1 และไม่เปิด Production เพื่อพิสูจน์แผนนี้

### 11.6 Test data lifecycle

**ขอบเขตที่ต้องอนุมัติพร้อมงาน local ภายหลัง** คือสร้างได้สูงสุด **105 บัญชี
จำลองใหม่** บน Docker local เดิม พร้อมยอมรับว่า Auth/profile และ audit บางส่วน
ต้องคงอยู่ รอบนี้ยังไม่สร้างบัญชีหรืออ่านฐานข้อมูลแม้แต่ครั้งเดียว

1. ก่อนเขียน ตรวจ source/diff, endpoint ว่าเป็น loopback ที่ผูกกับ Docker target
   เดิมจริง, metadata/post-031 ที่เกี่ยวข้อง, active Admin และ hierarchy สังกัด
   local ที่ใช้ได้ ตรวจบัญชี/ข้อมูลเดิมเพื่อเทียบก่อน–หลังโดยไม่เผยแพร่ PII
   drift/ข้อมูลตั้งต้นไม่พอให้หยุด ไม่รัน parity/reset/bootstrap/seed runner
   บันทึกว่า S0 อยู่ใน baseline จริงหรือยัง ไม่ apply S0 เองเพื่อให้ preflight ผ่าน
2. จัด run tag และบันทึก UUID ใหม่ที่จัดสรรไว้ล่วงหน้าใน manifest ก่อน create
   แต่ละครั้ง ใช้ local Auth Admin
   `createUser` ให้ trigger จริงสร้าง `staff/pending` ไม่ INSERT/UPDATE profile
   ตรง ไม่ใช้ GUC/disable trigger/เพิ่ม grant และไม่แก้เก้า parity artifacts
   ใช้ local credential เดิมผ่านวิธีที่ปกปิด key; ไม่เรียก Auth Admin Production
   SDK ที่ติดตั้งรองรับ `id`; ต้องตรวจว่า local Auth คืน ID ตรงตามที่ส่งจริง
   หากไม่ตรงให้หยุด ไม่เพิ่ม grant/config หรือเปลี่ยน server เพื่อแก้ fixture
   run tag เป็นข้อมูลระบุ fixture เท่านั้น ไม่ใช่ role/claim เพื่อให้สิทธิ์
3. ระบุ `email_confirm: true` เฉพาะ synthetic setup เพื่อไม่ส่งเมลจริง ไม่ใช่
   signup/verification PASS และไม่เปลี่ยน Auth config ใช้อีเมลสมมติที่ผ่าน
   predicate เดิม ห้าม invite/resend/recovery ไปเมลองค์กร บัญชีใหม่ใช้
   `LOCAL_TEST_PASSWORD` เดิมจาก `supabase/.env.local` ผ่าน read-only loader
   ตาม R5 ไม่สร้างไฟล์รหัสใหม่ ไม่เขียนทับค่า/ไฟล์หรือรหัสบัญชีเดิม
4. ส่วนใหญ่คง `staff/pending` ใช้กลุ่มย่อยผ่าน `update_my_profile` และ Admin
   approve/reject/set-role/status RPC เดิมเท่านั้น ใช้ reference IDs ที่มีอยู่
   และ hierarchy ตรงกันแบบ read-only ไม่สร้าง/แก้ Catalog, Factor F หรือสังกัด
5. Admin เดิมใช้เฉพาะ API-only ephemeral client สำหรับ provision/finalize
   โดยไม่เปลี่ยน role/status/สังกัด/password ของตน Browser QA/logout/actor
   switch/current-admin loss ใช้ Admin จำลองใหม่ที่เตรียมผ่าน RPC เดิมเท่านั้น
   คำสั่งบน fixtures สร้าง append-only audit ตามจริง ไม่ย้อน/backdate
6. Finalize ด้วย trusted RPC: บัญชีใหม่ที่ยัง active เปลี่ยนเป็น inactive;
   inactive/suspended คงสถานะปิดนั้น pending/rejected คง pending ไม่อนุมัติ
   หรือ reactivate เพียงเพื่อทำ cleanup ล้างเฉพาะ session/browser state/
   temporary secrets ของรอบนี้โดยไม่ logout บัญชี Owner เดิมทั้งระบบ
   ใช้ Admin อีกบัญชีที่ยัง active เป็น finalizer เพราะ RPC ห้ามเปลี่ยน
   authority ของตนเอง; คง Admin เดิมไว้ทำขั้นสุดท้ายโดย profile/password ไม่เปลี่ยน
7. เก็บ Auth/profile rows, audit และ manifest รายงานจำนวน/สถานะคงเหลือจริง
   ไม่ใช้ Auth delete ที่อาจ cascade ไปติด profile guard หาก finalize ไม่ครบ
   ให้รายงาน FAIL พร้อม exact local IDs ใน manifest ห้ามกลบผลหรือ reset

ตัวเลข 105 เป็นเพดานต่อรอบ ไม่ใช่ให้สร้างใหม่ทุก retry เปิด manifest เดิม
ก่อน resume; ถ้าผล create ไม่แน่นอนให้ตรวจ local Auth ด้วย exact UUID ที่จองไว้
แล้วเทียบ UUID + synthetic email + run tag ให้ตรงทั้งหมดก่อน resume
ห้ามรับบัญชีเดิมมาเป็น fixture เพียงเพราะ email ตรง หรือออก identity ใหม่ทุก retry
การตรวจ custody นี้ไม่ใช่กติกา SSO/account linking
ไม่เปลี่ยนบัญชีเก่าหรือทำลายหลักฐานเดิมเพื่อให้ทดสอบผ่าน

**หลักฐานที่ต้องแยก**

| กรณี | วิธีทดสอบและข้อจำกัด |
|---|---|
| >100 users / API cursor จริง | ใช้ runtime fixtures ใหม่ข้างต้น อ่านครบทุกหน้า เทียบ exact IDs/count/order กับ manifest; ข้อมูลเดิมที่อ่านได้ต้องยังครบ |
| timestamp เท่ากันพอดี | deterministic mocks ครอบคลุม boundary และตรวจ comparator ใน 027 เป็น source contract; Auth/profile API ไม่เปิดให้กำหนด/แก้ created_at จึงไม่บังคับทำ timestamp จริงให้ซ้ำ |
| active + actual NULL | mock ครบรูปแบบ และ runtime read-only เฉพาะ local row ที่มีอยู่และเหมาะสม ไม่สร้างด้วย SQL/GUC หรือแก้บัญชีเก่าให้เป็น legacy |
| error/cap/legacy/races | deterministic mocks และ bounded browser/network fault injection เฉพาะ local runtime แยกจากผล API ปกติ ไม่มีการแก้ DB config เพื่อจำลอง |
| no-residue | หมายถึงคำสั่งที่ถูกปฏิเสธไม่มี unauthorized mutation/event ไม่ได้แปลว่าทั้งรอบไม่มี synthetic rows หรือ audit ที่สำเร็จ |

หากไม่พบ runtime tied/legacy case ที่สร้างได้อย่างถูกกติกา ให้ระบุเคสนั้น
NOT RUN พร้อม mock/source evidence ไม่เรียกว่าผ่าน DB จริง ความจำกัดนี้ต้อง
อยู่ใน release review; ไม่ bypass guard เพื่อปิดช่องในตารางผลทดสอบ
หากไม่ยอมรับ retained synthetic rows ให้หยุดก่อน fixture creation และใช้
mock/source review เท่านั้น โดยยังอ้าง runtime acceptance ครบไม่ได้

เหตุผลจาก immutable [027 source](../../../migrations/027_p49_active_profile_authorization_hardening.sql):
`p49_reject_authorization_event_mutation` / `trg_p49_authorization_events_immutable`
ห้ามแก้/ลบ audit, `p49_guard_user_profile_mutation` ห้าม profile DELETE และแก้
identity/created_at, `handle_new_user` สร้าง profile ผ่าน signup path และ
`get_admin_profiles_page` ใช้ `(created_at,id)` ไม่ใช่ลำดับจาก UI
การอ่าน source นี้ไม่ใช่การสร้างหรือ replay migration

### 11.7 Acceptance and evidence

ทุกแถวด้านล่างเป็น **planned / NOT RUN สำหรับ A1 candidate** ไม่ใช้ผล
baseline tests เก่าหรือ local parity รุ่นก่อนแทนการทดสอบ candidate ใหม่

| Acceptance หลังอนุมัติลงมือ | เกณฑ์และหลักฐาน |
|---|---|
| Scope/preflight | Exact source/target + no prohibited diff; relevant current local contract ผ่านก่อน API writes; เก็บ hash เก้า parity artifacts และ 027–031 ไม่เปลี่ยน |
| Paging | Runtime >100, 25/26 boundary, หน้าแรก/กลาง/สุดท้าย/ย้อนกลับ/refresh, ไม่มี missing/duplicate IDs ระหว่างไล่ชุดข้อมูลคงที่; แยก concurrent inserts ออกจาก snapshot guarantee |
| Reads/metrics | หนึ่ง directory RPC ต่อ read attempt; reference batch สูงสุดหนึ่งครั้งต่อตารางใน allowlist R7; pre/post authority และ initial Catalog gate นับแยก เปิด Sheet/responsive ไม่โหลดเพิ่ม ใช้ budgets/method ที่กำหนดล่วงหน้าใน R7 |
| Labels/details | ทุก state ใน 11.3, role-aware NULL, long Thai/email, projection missing fields; table/card/Sheet ตรงกัน ไม่มี fabricated verification/approval/history |
| Commands/races | Existing allowed/denied transitions, self restriction, paging/actor switch ระหว่าง authorization, obsolete intent ไม่ส่ง RPC, late result ไม่เปลี่ยน target ใหม่ |
| Reconciliation | Success+reread, reread failure, transport unknown, target หายจากหน้า; ไม่มี automatic mutation retry/UUID ใหม่ และแยก stale data ชัด |
| Guards/Catalog | Non-admin/pending/inactive/suspended denial, Admin loss, legacy mutation-disabled fallback, Master Catalog entry/gate ทั้งสี่ states เดิม |
| Existing users | Original UUID/role/status/affiliation/password/BOQ/reference data ไม่เปลี่ยน; existing session, short/full login และ relevant authorized BOQ/output reads ยังทำงาน |
| BOQ write regression | Save/Copy เป็น optional additional local write envelope ที่ต้องระบุ synthetic graph/request tuples ก่อนอนุมัติรัน ไม่แก้ข้อมูลเดิมหรือเข้า Production และไม่ถือว่าเป็น A1 fixture cleanup ปกติ |
| Browser/brand | 320/390/768/1024/1280px, 200% zoom, keyboard/Sheet focus/return/Escape, Thai wraps/contrast และ no page-wide overflow; ใช้ theme/font เดิม Static markup ไม่แทน browser proof |
| Quality | Existing + focused tests, lint, TypeScript และ build บน Node 24 ด้วย packages เดิม ไม่เพิ่ม DOM testing package; mock/static/browser/API แยกผล |
| Finalization | Compare original-data/contracts, run manifest ครบ, active synthetic targets ปิดสิทธิ์แล้วหรือรายงาน FAIL, retained rows/events ตามจริง ไม่มี reset/delete/bypass |

Required FAIL หรือ unknown relevant parity ห้ามเรียก release-ready บันทึก
PASS/FAIL/NOT RUN รายเคส โดยเฉพาะ runtime ties/legacy, concurrency limitations,
hosted mail/SSO และ Production ที่ไม่ได้ตรวจ ไม่ reopen B Production HTTP
ซึ่งปิดงานด้วย NOT RUN แล้ว A1 ไม่ต้องส่งเมลหรือพิสูจน์ hosted Auth เพื่อ
ทดสอบ directory และไม่ถือว่าการไม่แตะ source Auth แทน regression PASS

### 11.8 Approval boundary and next execution

**สิ่งที่เสนอให้ Owner อนุมัติในขั้นถัดไป**: UI/UX/ขอบเขต A1 ตาม 11.2–11.5,
9 code/test/harness files + 1 local result document, local-only manifest และ
วงจรสูงสุด 105 synthetic accounts/retained audit ตาม 11.6 พร้อมการทดสอบ
ที่แยก mock/browser/API ตาม 11.7 ไม่จำเป็นต้องตัดสิน role ใหม่ทั้งหมดตอนนี้
R1–R7 ปิดในระดับแผนแล้วตาม section 13 และรวมอยู่ในขอบเขตที่เสนอให้ตรวจ
การยืนยัน effective local cap/credential/UUID support/browser isolation เป็น
runtime preflight gates หลังได้รับอำนาจที่ครอบคลุม ไม่ใช่เรื่องที่ต้องเลือก
design ใหม่ และไม่ใช้ความพร้อมของแผนแทนผลทดสอบจริง

หลังได้รับอนุมัติครบขอบเขตนั้นจึงทำตามลำดับ: source/local preflight → bounded
implementation → pure/mock/static tests → trusted local fixture preparation →
real API/browser regression → finalize/compare originals → quality checks และ
สรุป actual diff/results/risks ให้ตรวจก่อน release ยังไม่มี stage/commit/push/
deploy หรือ Production grant จาก local implementation approval

S0 ต้องมี approval ของ SQL/DB/test envelope แยก; A2 และ UM-B ไม่ถูกพ่วงมา
ด้วย ถ้าพบว่าต้องแก้ Auth/shared styles/DB/schema/package หรือใช้ข้อมูลทดสอบ
นอก envelope ให้หยุดส่วนนั้นและเสนอเหตุผล ไม่ขยายเอง ไม่ reset/restore/replay
027–031, ไม่แตะ archive/บัญชีเดิม/Catalog/Factor F และไม่แก้ประวัติให้ดูเป็น
ผลปัจจุบัน

**ผลรอบเอกสารนี้**: แก้แผน #12 เท่านั้น; ไม่มี implementation, fixture,
DB/Auth/Docker operation, Production access, staging/commit/push/deploy
การตรวจเอกสารและผลการทดสอบเดิมใน section 10 ไม่ใช่ fresh A1 runtime PASS

Documentation-only verification, 2026-10-26: local Markdown links **310** และ
anchors **33** ผ่านใน 12 planning/handoff documents; existing documentation
contracts **28/28** ใน 2 files ผ่านบน Node **24.2.0**, `git diff --check` ผ่าน
ไฟล์ค้างเดิมอีก **20** ไฟล์รวมเก้า parity artifacts มี SHA-256 ไม่เปลี่ยน;
HEAD/index และ app/package/lockfile/migrations ไม่เปลี่ยนจากก่อนรอบนี้
ผลเหล่านี้ไม่ใช่ A1 implementation/browser/API/DB acceptance

## 12. Execution status and resume checkpoint

The entries before the [current UM status table](#121-current-state-and-authority)
preserve their earlier planning, qualification and approval stages. For the
active task and authority, use the [current handoff](../../08_ai/AI_HANDOFF.md#current-resume-checkpoint).

**Latest read-only Production preflight — 2026-11-05:** Owner explicitly approved
source/config/metadata/rollback only for14paths. Completed PASS with recorded
limits at04:08UTC:source639/VercelCurrent7d9/config/APIcap1000,19function/4relation
contracts,031/032policies/history and healthy639rollbackcandidate. See
[Solo4.4](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md#44-actual-read-only-production-preflight--2026-11-05)
and12.5 below. No accounts/BOQs/businessRPC/Auth/DBwrites/replay or publication.
Grant complete/consumed;current work local result/handoff/document review only.
Next Owner approval is14-file publication/finalfreshness/CI-Vercel/delivery and
optionalconditionalrollback,not another fixture or default AdminHTTP test.

**Earlier source-only qualification — 2026-11-05:** Owner explicitly approved
639+14 on Node24 for tests/lint/TS/Turbopack/mock only;completed PASS878/64,
lint0errors3oldwarnings,standaloneTS,fresh defaultTurbopack and9mockgroups.
See [Solo4.3](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md#43-actual-post-s0-source-qualification--2026-11-05)
and section12.4 below. Initial symlink-build FAIL retained;physical existing
installed dependency copy resolved the temporary root issue without source/
package/config changes. Mock=WebpackDEV/fakebackend,not realDB/Production.
Grant complete/consumed,no owned processes/listeners remain. Only local result/
handoff/document review now;no Production/preflight/Auth/DB/fixture/publication.

**Earlier post-S0 planning pointer — 2026-11-05:** Owner authorized the local
[14-path Solo refresh](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md) only.
Base639335546b018bdfbf6e37e854af308693158a53/tree2dce4710c113adc507d9b29d9df14c0ef07b1642;
application baseline4dfdc44. S0/032 and its five-document closeout are complete;
A1ninepaths remain unchanged/uncommitted,old105/new18 fixtures closed. Keep
all installed032guards/history and Loginprefetchfalse. New exact-candidate
Node24tests/lint/TS/defaultTurbopack/mock integration and future metadata-only
Production preflight/actualCI/hosting/delivery are NOT RUN. No automatic new
DB/Auth/fixture run or Production Admin/business RPC test. Current work edits
only five planning/handoff documents and performs document/source-hash checks.
No source/package/config/DB/Production/stage/commit/push/deploy in this refresh.

**Dated release-sequencing pointer — 2026-11-04:** [S0 Solo proposal](../../07_process/S0_SOLO_RELEASE_PLAN_20261104.md)
is local source/document planning after S0's separately approved tests. Use
[S0's canonical checkpoint](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint)
for actual S0status/limits;do not duplicate its tracker here. A1stays locally
validated/unreleased with closedfixtures/unchangedruntime. S0's proposed25paths
exclude all9A1code/test/mock paths;UM/NTMarkdown are dependency closure only.
After S0publication refresh A1base/allowlist/rollback;keep032protection. UM-B
positivefixtureHOLD and SSO/A2 scope are unchanged. No publication/Production/
DB/Auth/fixtures or new UMimplementation authority follows. Earlier milestones
below retain their dated stages.

Last updated: **2026-11-05 (Asia/Bangkok)**. Recorded by: repository assistant.
Current milestone: **SOURCE_QUALIFIED_READONLY_PREFLIGHT_PASS — OWNER_RELEASE_APPROVAL_PENDING — GRANTS_CONSUMED**.

**Earlier S0 closeout pointer — 2026-11-03:** local032 applied once; verification
HOLD, not release-ready. The Owner's separately approved recovery is complete;
run finalized and dedicated sessions/tokens gone. Use [S0's checkpoint](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint)
and [receipt](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md) for its
exact evidence/remaining gates. Both execution/recovery grants are consumed;
source/docs/checks only, no new DB/Auth/fixture/migration/Production/publication.
A1 remains locally validated/unreleased with unchanged source and closed runs;
UM-B's positive fixture HOLD is unchanged. No affiliation repair or UM release
is implied. Earlier S0 authority/build stages below remain dated history.

**Earlier S0 authority correction — 2026-11-03:** first `prepare` was rejected
by automatic approval review for missing explicit trusted Auth/fixture scope.
It did not run. Earlier continuation/execution interpretation below is
corrected; use [S0's checkpoint](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint).
Current authority is source/docs/checks only; no Auth/fixture/032 operation
until explicit bounded approval. A1/UM-B state and original data remain intact.

**Later S0-only local continuation — 2026-11-03:** Owner's “ทำต่อครับ” after
the exact final readiness packet authorizes only S0's section7 local lifecycle.
Use [S0's canonical checkpoint](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint)
for progress, gates and limits. This does not reopen A1 fixtures, change its
runtime hashes, authorize publication or start UM-B affiliation repair. The
earlier S0-approval-pending wording below retains its dated planning stage.
S0's subsequent build-environment HOLD is recorded only in that checkpoint and
its [intermediate receipt](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md);
no Auth/fixture/032application ran. A1 stays validated locally and unreleased.

**Dated UM-B planning state — 2026-11-02:** **AUDIT_CONTRACT_DEFINED_IN_PLAN — POSITIVE_FIXTURE_HOLD_NO_LOCAL_SHAPE**.
The later [section16 contract](#16-legacy-confirmation-audit-and-replay-contract)
selects the outcome/audit approach; SQL and runtime are NOT RUN. The
[section17 aggregate-only local packet](#17-local-aggregate-only-fixture-feasibility-packet)
was subsequently approved and completed:0eligible/0protected/0remaining in one
successful local read-only transaction; see section17.4. That read grant is
consumed. No primary positive fixture, implementation or further DB access is
established by this result.
Owner continuation covers [section15](#15-um-b-priority-legacy-affiliation-confirmation-plan)
and roadmap/handoff documentation only. The prior single-account read is
completed/consumed; no further Production, DB/Auth, fixture or SQL operation.
The earlier S0-first sequencing is now fulfilled for bounded032;its canonical
checkpoint records actual scope/limits. This UM-B plan does not grant A1 work
or replace UM-B's missing primary positive fixture with S0 edge-case waivers.
The later isolated target and release are recorded in the
[local qualification](#2019-local-first-round-qualification--2026-11-14)
and [Production closeout](#2020-first-round-production-closeout).

**Later sequencing/planning step — 2026-11-02:** Owner agreed to prepare the
focused S0 local scope first. Use [S0#05 checkpoint/packet](../security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint)
for its actual state and authority; no S0 implementation/SQL/DB/Auth is approved.
A1 remains locally validated with unchanged runtime hashes and closed fixtures.
Its release proposal waits for the S0 path; after S0 publication, recalculate
the actual A1 base/diff/allowlist/count/rollback rather than reuse27/67c1e6f.
Do not copy the S0 progress table here or reopen A1 tests/fixtures automatically.

The [current14-path Solo plan](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md)
recalculates the envelope on6393355;dated pre-S0 functional/visual receipts stay
unchanged. Fresh candidate qualification and hosted preflight/publication/
delivery/conditionalrollback remain NOT RUN and need separate scope. Current
work is Markdown/source-hash/document checks only;no DB/Auth/browser/fixture/
Production or staging. Settled visual acceptance stays closed,no session reuse.

The approved section14 review has completed:29/29 original PNGs inspected by
root and an independent reviewer **beforecleanup**, then exact scope:local
sign-out and full read-only custody PASS. The previous resting-image gap is
closed by this [new visual receipt](../../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md),
not by changing rejected historical images. One dedicated existing-Admin
session was used;0newsession/refreshtoken remain, all original data/authority/
sessions retained. The bounded Auth/browser grant is consumed; no additional
session/fixture/application/Production/publication operation is authorized.

**Completed execution scope:** latest explicit Owner approval covered section14 visual-only tooling/build,
existinglocalAdmin in one new dedicated session, normal Auth bookkeeping,
read-only capture/custody and scope:local cleanup. This is the narrow R5 browser
exception for this task, not account/business/authority mutation. Both fixture
runs stay closed; no Production or staging/commit/push/deploy. Actual visual
runtime was NOT RUN at approval; actual completed results are recorded above.

**Previous planning stage:** request was planning only for the desktop/mobile visual gap. The
[visual approval packet in section14](#14-um-a1-settled-visual-review-approval-packet)
does not grant login, browser, fixture, DB or release execution. Both finalized
runs remain closed; the proposed existing-Admin browser exception and normal
Auth bookkeeping require explicit approval before use.

Earlier bounded local approval — 2026-11-02: one NEW18-account run `um-a1-20261102-real18` against
the existing Docker target, using the unchanged local password; canonical
built-app/Auth/API validation and run-owned trusted transitions/finalization.
All earlier accounts/data, including the finalized105-fixture run, are protected
originals. No reopening that run, reset/restore, migration creation/application
or replay027–031, Production, package/config or stage/commit/push/deploy.
Preflight and current-data custody must pass before creating the new fixtures.
Actual results are appended in the [new18 real Docker receipt](../../06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md);
pending items there are not PASS or release authority.
The new18 run is now finalized with no active account/session residue; its
fixture authority is consumed. Do not reopen it or the old105 run. Functional
acceptance and primary-font loading passed; that run's resting screenshots remain
unaccepted because they caught a closing overlay. The later separate section14
review closes the gap with new images; the old images are not relabeled PASS.

**Dated corrective-client stage:** later Owner approval covers all three reviewed client findings, integration tests
and this checkpoint. The three findings are now corrected and verified against
mocked real-page integration; use the [corrective result](../../06_engineering/UM_A1_CORRECTIVE_LOCAL_RESULT.md). Keep submitted-command ownership independent of view resets,
retain UUID-keyed UNKNOWN notices independently of transient command results, and
announce every read lifecycle. Mock Auth/API integration only in this patch;
no DB/Auth operation or reopening the finalized run, Production or publication.
The826-test/DB/browser receipt below is dated initial-candidate evidence, not proof
of these newly found interleavings. Preserve it and append corrective results.

บันทึกนี้เป็นจุดเดียวสำหรับสถานะงาน UM-A1 ใช้คู่กับ
[approval packet ใน section 11](#11-um-a1-approval-packet)
โดย AGENTS/AI_HANDOFF ลิงก์เข้ามา ไม่สร้าง tracker อีกชุดหรือคัดลอกทั้งบทสนทนา
สถานะความคืบหน้า การอนุมัติ และหลักฐานเป็นคนละเรื่อง ต้องไม่อนุมานแทนกัน

### 12.1 Current state and authority

| รายการ | สถานะที่เกิดขึ้นจริง | อำนาจ/หลักฐานและขั้นถัดไป |
|---|---|---|
| แผน/แบบ/ขอบเขต A1 | **FUNCTIONAL + SETTLED VISUAL LOCAL PASS** | New18 functional receipt and [section 14 visual receipt](../../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md) record the dated local qualification, including the earlier FAIL/NOT RUN results and rejected images. See [12.7](#127-post-release-checkpoint--2026-11-06) for the later release. |
| Execution contracts R1–R7 | **LOCAL EVIDENCE RECORDED WITH LIMITS** | ใช้ผลจริงและ NOT RUN ใน receipt; closure matrix13.3 ด้านล่างเก็บเกณฑ์เดิม ไม่ใช้แทนผล runtime |
| งานที่อนุมัติอยู่ | [Current handoff](../../08_ai/AI_HANDOFF.md#current-resume-checkpoint) | Use the checkpoint and the Owner's latest scope for the active task. Previous release and rollback authority is consumed. |
| A1 implementation | **RELEASED IN `a588bfe`** | Admin directory and details with the scoped NT pilot. Shared Auth, domain policy and existing Admin command semantics were preserved. |
| A1 local DB/API preflight | **DATED NOV2 NEW18 PREFLIGHT + FINAL CUSTODY PASS** | Existing DB/container/volume/full service graph, actual PostgREST14.5/cap1000/exact post031 metadata unchanged; original125profiles/126Auth identities,32tables/26sessions/544Authaudits protected;143profile/6page exact traversal PASS |
| A1 test accounts/data | **OLD105 CLOSED / NEW18 FINALIZED** | Newrun `um-a1-20261102-real18` retained18Auth/profile/identity:15inactive/2pending/1suspended;0active/0new sessions/0newOwner sessions/0unresolved intents; no BOQ write or original-account repair |
| A1 mock/static/browser/API/DB acceptance | **DATED REAL FUNCTIONAL + SETTLED VISUAL PASS** | Sameapplication845tests/63files/9mockgroups;31APIchecks/13distinctfunctionalbrowsergroups remain datedsame-sourcePASS;section14 freshNode24Turbopack/TS+29PNGvisual/custody PASS. NewtoolfirstmissingimportFAILbeforeAuth preserved,fixedimportonly; CI/Production NOT RUN in that local qualification |
| Fixture finalization | **PASS — BOTH RUNS CLOSED / NO ACTIVE RESIDUE** | New18 independentSQL confirms0active/0sessions, originals32table digests/26sessionlinks/544Authaudits retained; old105manifest/package/027–031/parity/credential hashes unchanged; retain accounts/audit, no harddelete/reset |
| คำสั่งที่ผลไม่แน่นอน | **REAL UUID-KEYED CONTAINMENT VERIFIED** | Actual held/lost responses, sameJWTrolecycle/timeout,2UUIDsame-target,off-page warning and actorchanges passed;15UIUUIDs/8controlled transitions exactjournal/actual2xx;0serverUNKNOWN left. Exact off-page-newB-success remains mock-only; current value alone never resolves oldUUID |
| A1 publication/Production | **RELEASED** | CI, Vercel and anonymous Login smoke passed at delivery. The earlier release evidence and authenticated-check limit are in [12.7](#127-post-release-checkpoint--2026-11-06). |
| A1 exact-14 source qualification | **PASS — DATED EVIDENCE** | [12.4](#124-post-s0-source-qualification-result--2026-11-05) retains Node 24 tests/lint/TypeScript/Turbopack/mock results and the initial symlink-build failure. |
| First UM-B legacy confirmation | **CLOSED — RELEASED / FIRST ADMIN CONFIRMATION PASS** | [20.20](#2020-first-round-production-closeout) records 033, the exact seven-file release and the Owner's first-account observation. User-side Production BOQ visibility remains **NOT RUN**. |
| Local aggregate-only feasibility read | **COMPLETE — READ PASS / FIXTURE HOLD** | Ownerapproved section17;2026-11-02T10:47:54Z, exactexistingDocker/RRreadonly/ROLLBACK;0eligible/0protected/0remaining,0identities. One successfulDBtransaction, earlier client failures beforeconnection retained; grantconsumed |
| Bounded legacy-account Production read | **COMPLETE / READ AUTHORITY CONSUMED** | One target,2026-11-02T08:15:31Z,READONLY:on/ROLLBACK; active/staff,actualallNULL,requestedvalid,approvalfieldsNULL/events0. Owner reports prior approval; causeunknown. NoPII/raw response inrepo; noBOQ/businessRPC/write |
| S0 bounded032 | **COMPLETED OUTSIDE UM / GRANTS CONSUMED** | See S0canonical13–14/source639closeout;keep032/031/Loginfix. No claim that broaderS0 is complete and no fresh Production observation here |
| UM-A2 | **RELEASED AND CLOSED** | Exact seven-file `33a0f42`. CI, Vercel and anonymous no-write smoke **PASS**. Real Production confirmation-link and password-reset journeys **NOT RUN** by Owner choice for this release. [Closeout](#27-um-a2-production-closeout) |
| Auth redirects for UM-A2 | **CONFIG PASS / REAL UM-A2 CALLBACK NOT RUN** | [Section 25.5](#255-redirect-change-readback-and-auth-preflight) records the callback rules and [section 27](#27-um-a2-production-closeout) separates the no-write smoke from the real link. |
| NT SMTP | **CONFIG PASS / ONE UM-B SIGNUP EMAIL DELIVERED** | [Section 26.5](#265-production-smtp-checkpoint) records where the earlier Production test stopped. |
| Admin assignment when the request is wrong | **DEFERRED / NOT STARTED** | Revisit when an active employee with no actual affiliation has an incorrect request and cannot access a BOQ needed for work. [Section 21](#21-admin-assignment-for-an-incorrect-affiliation-request) retains the proposal. |
| Remaining UM-B and account security | **SEPARATE PRODUCT DECISIONS** | Confirmed-affiliation correction/transfer, role and affiliation during activation, and account lifecycle policy remain open. IT-dependent identity and hosting decisions are tracked separately. |

**Pre-implementation source checkpoint — dated stage:** ตรวจแบบ read-only
วันที่ 2026-11-01: canonical checkout
`/Users/cloud/Cloudstellar/conduit-boq`, branch `main`, HEAD
`67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`, ไม่มี staged files และไม่มี
tracked app/package/lockfile/migration diff จาก HEAD มี planning/handoff
Markdown ค้าง 12 ไฟล์และเก้า parity artifacts แยกอยู่ สถานะนี้ไม่ใช่ fresh
remote/Production observation และห้ามใช้แทน preflight รอบที่จะลงมือจริง

หลัง bounded execution: HEAD/index คงเดิม แต่มี tracked Admin page diff และ
ไฟล์ code/test/harness ใหม่ตาม allowlist รวมเก้าไฟล์ พร้อม receipt และสาม
status/handoff updates ใช้ exact SHA ใน local result เป็น current candidate
ไม่ใช้ข้อความไม่มี app diff ของ pre-implementation stage แทนสถานะนี้

**Dated pre-S0 custody note:** ไฟล์ #11/#12/S0 ยังเป็น untracked local drafts บันทึกจึงอ่านต่อได้จาก checkout
นี้ แต่ยังไม่อยู่ใน Git commit/remote/new worktree โดยอัตโนมัติ ห้าม clean,
ย้าย/ทิ้ง dirty work หรือเริ่มจาก checkout อื่นโดยสมมติว่าแผนตามไปแล้ว
หากเปลี่ยนเครื่อง/worktree ต้องส่งมอบและตรวจไฟล์ภายใต้ขอบเขตที่อนุมัติก่อน
ไม่ commit/push เพียงเพื่อ sync checkpoint โดยไม่มีอำนาจเผยแพร่

**Current Nov5 custody:** those planning files/receipts are now tracked in HEAD639;
A1ninecode/test/mockpaths remain local and unreleased. Do not use the dated
untracked-note above as current Git state or a reason to republish unchanged files.

### 12.2 Evidence and decision log

คงวันที่และขอบเขตหลักฐานเดิม เพิ่มรายการใหม่เมื่อเกิดเหตุการณ์สำคัญจริง
ไม่แก้ FAIL/NOT RUN หรือ rewrite ประวัติเก่าให้กลายเป็นผลปัจจุบัน

| วันที่ / เหตุการณ์ | ผลและข้อจำกัด |
|---|---|
| 2026-11-05 — Read-only Production preflight | Owner approved source/config/metadata/rollback only. Source639/Current7d9/settings/APIcap1000,19function+4relationcontracts/031/032history PASS;rollbackfutureeligibility conditional. No account/BOQ/RPC/Auth/DBwrite/replay/publication. One RRREADONLY/ROLLBACK catalog/history query. Grant consumed |
| 2026-11-05 — Source-only qualification | Owner approved639+14/Node24 only. Tests878/64,lint0errors3warnings,TS,defaultTurbopack andmock9 PASS;symlink-build FAIL retained then NEWphysical-dependency build PASS without source/package changes. FakeAPI/Web listeners/owned processes absent. Mock3generic503 messages consistent with3intentionalfaults,not zero-console proof. No DB/Authจริง/Production/publication |
| 2026-11-05 — Post-S0 Solo refresh | Owner approved fiveMarkdown edits only. Base639/tree2dce,exact14 proposal,all9sourcehashes unchanged;S0/032 complete per separate checkpoint. Dated old27/839/API/visual evidence preserved. Document6tests/20files601links213anchors/whitespace PASS;fresh candidate quality/Production/publication NOT RUN. No source/DB/Auth/fixture change |
| 2026-10-26 — เตรียม approval packet A1 | Section 11 พร้อมรีวิว: แบบเป็น wireframe, runtime/code/test-write ยังไม่อนุมัติ |
| 2026-10-26 — ตรวจเอกสาร | 28/28 documentation tests, 310 links/33 anchors และ diff checks ผ่านตาม receipt ท้าย section 11; เป็นผลเอกสารวันนั้น ไม่ใช่ fresh A1 runtime |
| 2026-11-01 — ทบทวนความพร้อม | ตรวจ Git/แผนในเครื่องแบบ read-only; application/migrations ไม่เปลี่ยนและไม่มี staged files; ไม่เข้า DB/Docker/Production |
| 2026-11-01 — เพิ่มบันทึกสถานะ | เพิ่ม canonical checkpoint นี้และ pointers ใน AGENTS/AI_HANDOFF เท่านั้น; ไม่มี implementation หรือข้อมูลทดสอบใหม่ |
| 2026-11-01 — ตรวจ checkpoint เอกสาร | 28/28 existing documentation tests, 315 relative links/38 anchors ใน 12 planning/handoff files และ diff/Markdown checks ผ่าน; ไม่ใช่ A1 runtime หรือ DB PASS |
| 2026-11-01 — ตรวจแผนรอบลึก | เทียบ source/immutable SQL/หลักฐานเดิมและแยกทบทวน Auth, paging/UI และ fixture custody; พบ R1–R7 ใน section 13 เปลี่ยน milestone เป็น PLAN_REVIEW_FINDINGS_OPEN ไม่ใช่การพบ Production exploit หรือ runtime FAIL ที่ reproduce แล้ว |
| 2026-11-01 — ตรวจเอกสารหลังบันทึก R1–R7 | Existing documentation contracts 28/28, 317 relative links/40 anchors และ diff/Markdown checks ผ่าน; ไม่ใช่ A1 command/paging/fixture runtime acceptance |
| 2026-11-01 — ปิดรายละเอียดแผน R1–R7 | Owner ขอให้ดำเนินการปิดรายละเอียดเอกสาร; เลือก final contracts/acceptance ใน section 13 เปลี่ยน milestone เป็น PLAN_FINAL_FOR_OWNER_LOCAL_SCOPE_REVIEW โดย implementation/fixtures/runtime/release ยังไม่อนุมัติและไม่เริ่ม |
| 2026-11-01 — ตรวจ final contracts | แยกทบทวน state/Auth/paging, fixture/custody และ performance ไม่พบ blocking correction ระดับแผน; existing documentation tests 28/28, 317 relative links/40 anchors และ diff/Markdown checks ผ่านบน Node24.2.0; runtime ทุกข้อยัง NOT RUN |
| 2026-11-01 — อนุมัติ bounded local ต่อ | Owner “ทำต่อครับ” หลัง readiness verdict; เริ่ม local candidate/fixture envelope ตาม sections11/13 โดย no Production/publication/reset/replay/package/config/DB-contract change |
| 2026-11-01 — Core local preflight | Read-only capture30relations/96functions/27triggers: app metadata ตรง capture ยกเว้น exact031 definitionSHA508f7069…; common actor roles/approved platform role-membership sets ตรงกัน; existing20profiles/2activeAdmins/3coherentsectorchains คงเป็น originals ไม่มี fixture ของ A1 ถูกสร้าง |
| 2026-11-01 — Local candidate/test/retention | Implement9allowlist files; create105owned fixtures run `um-a1-20261101-l1`; ordered125-profile traversal, actual same-JWT revoke, existing active/NULL2profiles, commands/recovery/faults/performance/browser ผ่านตาม receipt;826tests/63files/TypeScript/webpack ผ่าน; defaultTurbopack IPC environmentalFAIL แยกไว้ |
| 2026-11-01 — Final custody | Finalizer trusted RPC run เดิมผ่าน:14inactive/1suspended/90pending, retained105Auth/identity/profile,0active/0owned sessions; original32tables/26sessions/285Auth audits และ metadata/027–031/password/package/parity hashes ไม่เปลี่ยน; no Production/publication |
| 2026-11-02 — Corrective review/approval | พบ2P2ด้าน submitted lifetime/UNKNOWN notices และ1P3ด้าน live announcement; Ownerอนุมัติแพตช์3ข้อ+integration+checkpoint โดย noDB/Auth/fixture/Production/publication |
| 2026-11-02 — Corrective verification | 7code/testpaths:845tests/63files,35UI/34controller tests,9/9actual-page mockedAuth/API groups; TypeScript/webpack PASS, lint0errors/3oldwarnings; freshTurbopack IPC FAIL แยก; protected17hashes unchanged, no realDB/fixture operation; use corrective receipt |
| 2026-11-02 — Native default build | Later Ownerอนุมัติnpm run buildบนNode24/testAPI only; Terminalใหม่00:35น. Node24.2.0/npm11.3.0/Next16.4.2Turbopack exit0 รวมTypeScript/routes/proxy;19source/config/index+17protectedhashes unchanged; noDB/fixture/Production/publication. PriorIPC FAILคงประวัติ; cache retained, notCI/coldbuild |
| 2026-11-02 — New18 real Docker approval | Ownerอนุมัติrunใหม่18บัญชี `um-a1-20261102-real18` ใช้Docker/passwordเดิม รักษาข้อมูลเดิมรวมold105fixtures; บันทึกsource freezeก่อนpreflight; ยังไม่สร้างบัญชีหรือเรียกAuth; no reset/replay027–031/Production/publication |
| 2026-11-02 — New18 preparation/build | Read-only target/metadata/custody PASS; prepare exactly18 through existing Auth/profile/Admin RPCs, allconfirmed/0unknowns; retainedoriginal32tables/26sessions/544Authaudits. Directory143profiles/6pages exactordering and roledenials PASS. Native Node24 defaultTurbopack build with actual localAPI PASS; canonical next start loopback43180; no source/config/package changes. Independent SQL:18Auth/profile/identity,12active/4pending/1inactive/1suspended,0new/Owner sessions afterprepare; finalization pending |
| 2026-11-02 — New18 direct API |31checks PASS: trusted transitions/exact audit,nonAdmin/self/incomplete denials,UUID replay/mismatch and sameJWTrole-loss/restoration;B1RPC first/middle/last5warm+20sample p95 2.00/1.20/1.52ms.11newfixture sessions signedout;independentSQL0new/Owner sessions,26original retained;49confirmed/14denied/0unresolved intents. Browser/finalization pending |
| 2026-11-02 — Browser01 bounded stop |8groups PASS including corrective races/UNKNOWN/actor changes. Case9 retainedFAIL: harness expected automatic retry after post-read authority loss/restoration while sharedAuthcachedvalues stayedadmin/active; app correctly cleared rows and offered explicitretry perR2. Independent source/evidence review confirms test-only expectation correction, noappfix. Allrequestssettled/0unresolved/0new or Owner sessions/26original retained; resumeonlycase9 onward, never rerun8confirmed groups |
| 2026-11-02 — Browser02/final retention | Resumeonlycase9 onward:5groupsPASS/8NOTRUN preserved; combined13distinctgroups covered,3freshcontexts PASS; page-ready p95first/mid/last167/169/267ms, actualprimaryIBMloaded, responsive/keyboard/requestguards/no-writeBOQreads PASS. Finalizeexact18once:15inactive/2pending/1suspended,0active/0new or Owner sessions,0unknown;32originaltable digests/26sessions/544Authaudits retained; noappsource/DBcontract/package/publication change |
| 2026-11-02 — Resting visual evidence gap | Independent final image review afterfinalization found desktop/mobile caughtclosingoverlay; mobilealso repeatedheaderstrip. Thoseimages retained/unaccepted forrestinglayout; notconfirmedappregression. Do not reopenfinalizedrun toreshoot. Testdriverwait-for-detachment correction may be checkedoffline, but its realvisualacceptance remainsNOTRUN; close before claimingrelease-ready |
| 2026-11-02 — Final local closeout checks | Capturewait testdriverfix syntax/lint/dryrun PASS, runtimeNOTRUN; exactexecutedbrowser02source retained;28doccontracts/373relative links/46anchors in16Markdownfiles anddiffchecks PASS.17protectedhashes/288preexistingfiles checked,app/password/config/package/oldrun unchanged. NewrunmanifestSHA c7784afe…;taskNext/browser stopped,Docker retained;HEAD/index unchanged/noProduction/publication |
| 2026-11-02 — Settled visual plan | Owner requested desktop/mobile plan without reopening runs/data changes/Production/publication. Added section14 approval packet: existingactiveAdmin/newdedicatedsession proposed, explicit Authbookkeeping exception required, allapplicationwrites blocked, fresh desktop/mobile contexts and reviewed PNGs beforecleanup. Source/currentcapturefix/twofinalmanifests hashes rechecked unchanged; no Docker/API/Auth/browser execution |
| 2026-11-02 — Visual plan verification | Independent read-only review found no blocking scope/safety correction; specified sequential contexts/ephemeral auth options/bounded review beforecleanup.28doccontracts,378relative links/50anchors in16Markdownfiles anddiffchecks PASS; runtime/Auth/DB/visual results remainNOTRUN for this proposed review |
| 2026-11-02 — Settled visual execution approval | Owner explicitlyapproved section14 existingAdminbrowser/newdedicatedsession/normalAuthbookkeeping. Froze340source/protectedfiles onmain67c1e6f/indexempty; authoringvisual-onlydriver/privateREADONLYcustodyhelper. NoAuth/DB/browser operation yet; bothfixturemanifests unchanged |
| 2026-11-02 — Settled visual preflight | FreshreadOnlyfullgraph/actualREST14.5/cap1000/exactpost031metadata PASS;original143profiles/144Auth/identities,32tabledigests,26sessions/29refreshtokens/662Authaudits frozen. ExistingAdmin uniquelyactive/admin;no singlesession/timebox/inactivity override,JWT3600/FKcascadeverified. NativeNode24Turbopack+TS PASS;newvisualdriver46eff76d…independentreview/syntax/lint/dryrun PASS;abouttooneAuthsession,novisualPASSyet |
| 2026-11-02 — Visual tool early failure/correction | First invocation46eff76d…stoppedbeforelogin atsave():missingwriteFileimport;0API/Auth/browserdispatch. Keptfailure/source/emptyoutput;fixedonlyimport,newdriverd7913cf7…syntax/lint/CLIstrictno-undef/dryrun PASS;freshbrowser02output,sameimmutablepreAuthbaseline,noaccount/app/configchange |
| 2026-11-02 — Settled visual accepted/cleanup | Actual02:01:24–02:05:14Bangkok,Chrome156.0.8078.76/Node24,29/29PNGs root+independentinspectedbeforeaccept-all;desktop/mobile/Sheet/1023→1024/boundary/reflow/activeNULL2 PASS;0writeattempts/originblocks/routefailures/pageconsoleerrors. OneexistingAdminnewsessionlocallysignedout;afterREADONLY32projections/26oldsessions/29oldrefreshtokens/662oldauditrows retained,0newsession/refreshtokenleft,only1login+1logout audit. Originaltwofixturemanifests unchanged;gapCLOSEDbynewreceipt,noreleaseauthority |
| 2026-11-02 — Visual final source/doc checks |340existingfilehasheschecked,onlyauthorizedAGENTSdocchangedinthatset;17protectedhashes/app/password/closedmanifests unchanged. Newdriverd7913cf7…andall29PNG/reporthashesverified;strictCLI-no-undef/lint/dryrun/syntax,28doccontracts,384links/50anchorsin17Markdownfiles/diffchecks PASS. Noapp/config/package/SQLchange,HEAD67c1e6f/indexempty;taskNext/browserclosed,Dockerrunning;noProduction/publication |
| 2026-11-02 — Solo proposal preparation | Ownerrequested planonly; freshlocalmain==localorigin/main67c1e6f/indexempty, nofetch/hosted/DB check. Preparing27-path allowlist with coherenthandoff/receipts; parity9/realrunners4/privatefixtures excluded. Proposedfreshpre-A1 rollback + oneforwardcode-onlyrollback; noimplementation/account/DB/Auth/Production/staging/publication |
| 2026-11-02 — Solo prospective source checks | HEAD+exact27paths inprivatearchiveprojection, installeddependencies only/noinstall. Node24.2.0:839/839tests62files,lint0errors/3existingwarnings,tsc-noEmit PASS;394links/51anchors18MD PASS;27protectedhashes/ninecodehashes unchanged,indexempty. Initial836PASS/3oldcatalogFAILfrommissing.git retained; secondfullsuiteusedreadonlyGitmetadataandpassed,notapp/testfix. Projectionbuild/CI/hostedpreflight/smoke NOT RUN; noDB/Auth/browser/fixture/Production/staging/publication |
| 2026-11-02 — Solo final review | Independentreviewers confirmed27pathclosure/exclusions/authority. Addedbatch-completeness gate(actual+requested references mayreach50IDs,expectedcap1000) andexplicitnointerveningcommit/deploymentrollbackguards. Final22authority/documentationcontracts PASS; old28-test visualcloseout remainsitsdatedgroup. OnlyMarkdownchangedinthisrequest:plan/checkpoint/pointers plus4format-only hard-break/EOF cleanups; outcomes/history retained. Runtime9/parity9/027–031/package/closedmanifestsunchanged |
| 2026-11-02 — Bounded legacy-account read | Owner explicitlyapproved one selectedProductionaccount status/actual/requested/approvalhistory read. READONLY:on/ROLLBACK at08:15:31Z;matched1active/staff,actualallNULL,requestedhierarchyvalid,approvedfieldsNULL/targetevents0. NoBOQ/businessRPC/write/publication. Owner confirms prior approval separately; historicalcauseunknown; readgrantconsumed; noPII/raw response inrepo |
| 2026-11-02 — Priority UM-B legacy plan | Owner requested planningcontinuation; addedsection15 andalignedroadmap/handoff only. ProposedS0→A1→narrowlegacyconfirmation→A2→remainingUM-B. Source/UX/lock/audit reviews foundpositivefixtureandphysicalaudit/replaygatesOPEN; noSQL/fixture/DB/Auth/furtherProduction/publication. CurrentA1code/protectedartifacts retained; document checks follow |
| 2026-11-02 — Priority legacy plan verification | Threeindependentread-onlyreviews PASSatplanlevel; clarifiedschema-forbiddennegativefixtures/privacyclaim. Node24documentcontracts22/22,424relative links/67anchors across18MD anddiffchecks PASS;36protectedhashes unchanged,HEAD67c1e6f/indexempty. Only5Markdownfiles changed; noSQL/DB/Auth/Production/publication. Fixtureandphysicalaudit/replaygates remainOPEN, notimplementationready |
| 2026-11-02 — Audit contract and aggregate packet | Ownercontinuedplanning; selectedsection16privateimmutableAPPLIED/DENIEDoutcome/audit model preservingold8eventactions/RPCs, versionedintentbinding/strictBdecoder andorderedlocks. Threeindependentreviewsrefinedreplayarrivalorder/canonicalization and count-onlyprivacy. Section17localaggregate-onlyscopeprepared, NOTRUN/requiresapproval; noDocker/DB/Auth/SQL/Production/publication. PositivefixturegateOPEN; source/documentcheckresults appendedbelow |
| 2026-11-02 — Audit/count packet document verification | Node24authority/documentcontracts22/22PASS;432relative links/75anchors across18MD PASS;36protectedhashes unchanged and123closedfixtureUUIDs/oneOwneractorprotectioninputs verifiedoffline. Only5Markdownfileschanged;HEAD67c1e6f/indexempty; noDocker/DB/Auth/SQL/Production/publication. AuditcontractdefinedINPLAN only; countandcorepositiveAPI remainNOTRUN |
| 2026-11-02 — Approved local count closeout | Ownerapproved section17 via explicitcount-onlyrequest/ทำต่อ. Exactexistinglocaltarget preflightPASS; one successfulRRreadonly/ROLLBACK at10:47:54Z returned0eligible/0protected/0remaining,0identities. Sandboxsocket/clientemptyservice failures beforeDB retained; child-client-onlycorrection/samequeryhash, noDBconfigchange. Sourceprotected36 unchanged; noAuth/BOQ/events/businessRPC/DDL/fixture/Production/publication. ReadPASS/primaryfixtureHOLD, grantconsumed; nofurtherqueries |

Later bounded local approval/execution ด้านบนครอบคลุม lifecycle105บัญชีแล้ว
ไม่ใช่อำนาจ release หรือเริ่ม S0/A2/UM-B; ยังไม่ต้องสรุป role ใหม่/SSO เพื่อ
รีวิว A1 แต่ต้องปิดกติกาที่เกี่ยวข้องก่อน UM-B/SSO Runtime active/NULL มีเคสจริง
สองบัญชีและผ่านแบบอ่านอย่างเดียว; real timestamp tie ไม่พบจึง NOT RUN แยก
ไม่สร้างข้อมูลด้วยการข้าม guard ใช้ [receipt](../../06_engineering/UM_A1_LOCAL_RESULT.md)
เป็นหลักฐาน actual source/target/results/limits และไม่ replay fixture run

### 12.3 Update and resume rules

อัปเดต checkpoint หลังจบช่วงงานสำคัญ ก่อนเปลี่ยนขั้นที่มีผลข้างเคียง และ
ก่อนส่งมอบ/จบ session โดยบันทึกเฉพาะสิ่งที่เกิดขึ้นจริง:

- ขั้นล่าสุดที่เสร็จ งานระหว่างทำ/ค้าง และ exact files/source ที่เกี่ยวข้อง
- อำนาจที่ Owner ให้ไว้ รวม source/target/scope และส่วน one-shot ที่ใช้แล้ว
  แยกจากอำนาจที่ยังไม่มี ไม่เขียนเพียง “อนุมัติแล้ว” โดยไม่ระบุขอบเขต
- คำสั่ง/การทดสอบที่รันจริง วันที่/source/target, PASS/FAIL/NOT RUN และ evidence
  ถ้าผลยังไม่ทราบให้เป็น UNKNOWN ไม่ใช้ unit/build PASS แทน API/DB/browser
- หากมี synthetic writes: run ID/manifest path, exact owned IDs/request UUIDs,
  outcome และ finalization/retained-state ที่ยืนยันได้; ไม่ใส่ secrets/PII จริง
  หรือทำสำเนา password/token/cookie ลง Markdown
- Next safe step และเหตุที่ยังทำส่วนอื่นไม่ได้; ไม่ต้องเพิ่ม approval ceremony
  สำหรับ routine steps ที่อยู่ในอำนาจเดิมและยังไม่ถูกใช้หมด

เมื่อกลับมาทำต่อให้อ่าน AGENTS + เอกสารบังคับ + checkpoint/approval packet
แล้วตรวจ Git/dirty diff/staging และขอบเขต Owner สดก่อนตัดสินใจ ขั้นถัดไปใน
ตารางไม่ใช่คำสั่งอนุมัติให้รัน หากมีอำนาจครอบคลุมอยู่แล้วให้ทำต่อในขอบเขตนั้น
ไม่ขอซ้ำเพียงเพราะเปลี่ยน session; หากอำนาจไม่มี/ใช้หมดหรือมี drift ให้หยุด
ส่วนที่ขึ้นกับเงื่อนไขนั้นและรายงาน ไม่ reset/restore/replay เพื่อแก้ให้ตรงเอง

ถ้ามีงานค้างที่เขียนข้อมูลแล้ว ต้องอ่าน manifest/outcome ก่อนสร้าง fixture
หรือส่ง mutation อีกครั้ง เก็บ request UUID/intent เดิมสำหรับตรวจ reconciliation
ตาม contract ที่รองรับ ไม่ส่งซ้ำอัตโนมัติ ไม่อ้างว่า A1 มี full command recovery
ที่ยังไม่ได้ implement และไม่เปลี่ยน UNKNOWN เป็น failed เพียงเพราะรอนาน

**Dated A1 pre-release step:** Owner review the
[post-S0/032 fourteen-path Solo plan](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md),
now that qualification and readonlypreflight passed. Next review/approve the
exact14 source/content envelope for one publication/finalsource-target freshness/
CI-Vercel/anonymousdelivery with optionalconditionalrollback. Source/config/
rollback drift or delay needs scoped refresh;do not assume the snapshot is
perpetual. Do not repeat S0 or reopen105/18 fixtures. Keep027–032/installedguards/
Loginfix/parity/archive/originals unchanged;no current Auth/DB/Production grant.

**Dated UM-B local qualification — 2026-11-14:** the
[local qualification checkpoint](#2019-local-first-round-qualification--2026-11-14)
records the isolated target results and the gate remaining at that stage. The
previous 0/0/0 result remains the dated result for the existing local DB.
The [Production closeout](#2020-first-round-production-closeout) records the
later release under its own approval. Use [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md)
for current sequencing and the [current handoff](../../08_ai/AI_HANDOFF.md#current-resume-checkpoint)
for the active task and authority.

### 12.4 Post-S0 source qualification result — 2026-11-05

Source snapshot=HEAD639+14 at
`/private/tmp/um-a1-source-qualification-20261105-bz0w0chz`.
Tests878/64,lint0errors3oldwarnings,standaloneTS/defaultTurbopack/fakeintegration9
PASS on Node24.2.0. Exact9A1source/package/lock/CI/Login/027–032 unchanged.
Two source projections retain the same568inputs;only dependency layout differs
for the successful hermetic Turbopack root. No installed package/version change.

Tests used readonly Git metadata and explicitdummyAPI;real runners/parity9/
privatefixtures/localenvfiles absent. The freshbuild has no prior.next/cache.
Initial Pythoncache syntax-check permission failure preceded applicationchecks;
initial defaultbuild then failed externalnode_modules symlink resolution. Both
remain retained setup outcomes;new APFS-cloned installed dependencies inside
NEWroot allowed defaultTurbopackPASS,without config/font/bundler/source edits.

Existing unmodified mock runner6f2c6db2… uses newfake memory-only Auth/Data API,
synthetic users/tokens,NextWebpackDEV and fresh browsercontexts.9/9functional
cases PASS,0unknownAPI/blockedbrowserorigins/uncaughtpageerrors. Three console
503messages are consistent with3intentionalfault responses;individual console
URL/time mapping unretained. Development blocked registry/font hosts/fallback
is not Production font/NTvisual proof. Root reviewed desktop/mobile mock PNGs;
prior29settledreal-font images retain their separate dated acceptance.

Supervisor confirms no observed owned processes;API51193/WEB51194 listener
absence checked. This is temporary mock process cleanup,not realAuth/DB state
inspection. No real account/session creation,DB/Docker/Production access,
closed-run operation or migration/publication. HTTP/HTTPS/fetch/dummyenv/browser
origin fences are not a full OS network audit. Final five Markdown checkpoint
updates are separate document checks;application9 bytes remain the tested ones.

Final five-document closeout checks:6existing document contracts,20Markdown/
605links/217anchors/whitespace PASS. No application input changed after testing.

Qualification grant complete/consumed. A1 remains uncommitted/unreleased;future
hosted contract/cap/rollback preflight,actualA1commitCI/Vercel/delivery and
Production businessHTTP are NOT RUN. Next approval must cover only the reviewed
release/preflight/delivery/conditionalrollback scope;do not infer another
qualification/fixture/Auth/DB/Production operation from a prior completed grant.

### 12.5 Read-only Production preflight result — 2026-11-05

Exact14envelope/localHEAD639/indexempty/source9unchanged;all568qualification
inputs differ only in five Markdown result updates. LiveGitHubmain639/quality
success;Vercel639/dpl_7d9EfUvHhTpKtEEBprybrb8waCn3 ReadyCurrent,expectedrepo/main/
domains/Node24/defaultcommands/rootempty/autoassignON. No deploymentchecks;
actualA1commit must pass both Quality andVercel after separate release approval.

One catalog/history query captured04:08:13.642277UTC withRRREADONLY/ROLLBACK,
no applicationrows/functions. Exactly19expected profiles/directory/sixcommands/
currentactive/transition/cataloggate signatures/fullhashes/owner/config/ACL match;
no extraoverloads,effectiveEXECUTE matchesrolegrants. Fourprofile/referenceRLS/
ACL contracts match datedacceptedlocalmetadata. Directory24fields/rawcursor/
limit contract verified from unchanged definitions;not invoked. Independent
file-only reviewer recomputed comparisonsPASS,no second Productioncaller.

DataAPI dashboard cap1000≥26directory/50referenceIDs;public+graphql_public
exposed/privateoff,autoexposeNewTablesoff;no settings/key reveal. Dashboard
aggregate counters exclude custom least-privilege grants and must not be
"fixed" by toggling broad permissions;officialsource rationale inSolo4.4.
This is configuration/metadata proof,not actual gateway/AdminHTTP behavior.
PublicVercelenv value remains acceptedunobserved;names/scopes/Jan19updateddate
observed,no OTP reveal gate added.

Normalizedpost031hash1df6… matches;Copy031/24policies/authenticatedposture and
all32migrationfullrowhashes identical toactual032postflight. Exact032version
20261105001914/name/singlepayloadSHA9cc46… retained. No replay or DB correction.
Rollbackcandidate639/dpl7d9 remainshealthyCurrent;Hobby/30dayretention observed.
If A1 is nextCurrent with no interveningdeployment,it can be immediatepredecessor;
recheck eligibility at action time. No rollback/promotion/conditionalgrant tested
or supplied by readonlypreflight.

Private evidence:`/private/tmp/um-a1-production-preflight-20261105-_t3ipi6z`.
No accounts/BOQs/Authsessions/businessRPC/DBwrites/fixtures/Docker/sourcechange/
stage/commit/push/deploy in this operation. Grant complete/consumed;current
local result/handoff checks only. ActualA1CI/Vercel/delivery/rollback and
ProductionAdminbusinessHTTP NOT RUN. KeepS0/closedrun/evidence limits intact;
no additional sourcequalification required absent relevantdrift.

### 12.6 Solo publication checkpoint — 2026-11-05

Owner approved one Solo release of the exact 14 files in the UM-A1 plan.
Fresh source, hosted config, Data API cap, backend metadata and rollback
preflight passed against base 6393355. The approved release includes GitHub
Quality, Vercel Current, anonymous Login smoke and conditional rollback
under the plan. Keep S0/031/032 and the Login fix. Exclude parity tooling,
private fixtures and real local runners. No DB changes, migration replay,
account or BOQ reads, or authenticated Production Admin test.

The published envelope remains five runtime paths, three tests, one mock
runner and five Markdown paths. The nine qualified inputs match byte for
byte. The Production metadata comparison at 08:17:33 UTC matched all 19
function contracts, four relations, 24 policies and 32 migration history
rows. The Data API cap is 1,000 and the expected predecessor is Vercel
`dpl_7d9EfUvHhTpKtEEBprybrb8waCn3` at `6393355`. Recheck eligibility if a
rollback trigger occurs.

The actual commit, Quality, Vercel, anonymous delivery and any rollback
outcome belong in the private receipt `/private/tmp/um-a1-solo-release-20261105-PQgbTOVA/release-result.json`.
This checkpoint records approval and preflight only. Use the receipt to
verify publication and grant consumption before resuming. Production
authenticated Admin behavior remains NOT RUN.

### 12.7 Post-release checkpoint — 2026-11-06

The release receipt records UM-A1 `a588bfe` as released on November 5. GitHub
Quality, Vercel Production and the anonymous Login smoke passed. The release
grant is consumed. An authenticated Production Admin check remains `NOT RUN`
in the receipt. See the private receipt in [section 12.6](#126-solo-publication-checkpoint--2026-11-05).

Next is the narrow UM-B confirmation for active staff with a valid requested
hierarchy and no actual affiliation. A current active Admin reviews the
requested hierarchy before confirming. The proposed confirmation can add
shared-sector BOQ visibility through the existing access rules. See the
[eligibility and impact](#152-narrow-first-candidate-and-impact).

At this checkpoint the UM-A2 draft covered signup, confirmation and pending
presentation. The working order was narrow UM-B, then UM-A2, then the rest of
UM-B. The Owner deferred IT coordination. See the [current UM-A2 review](#23-um-a2-implementation-review)
for the narrowed first-release scope.

This continuation prepared the [fixture feasibility proposal](#18-um-b-fixture-feasibility-proposal--2026-11-06)
from source and dated receipts. Candidate existence and runtime remain `NOT RUN`.
The subsequent [inventory review and schema capture proposal](#19-um-b-fixture-inventory-and-schema-capture-proposal--2026-11-06)
found no documented disposable inventory and narrowed the next proposed action
to one catalog-only read on the existing local target.
The [preflight result](#193-preflight-and-offline-result--2026-11-06) records the
initial stop before SQL. The later [one-shot catalog result](#194-approved-unix-socket-catalog-result--2026-11-06)
records the completed read and comparison. Use the
[researched delivery plan](#20-um-b-researched-delivery-plan--2026-11-06) for
the stages after this checkpoint, the [private review packet](#204-private-review-packet--2026-11-06)
for the fixture proposal and [Master Catalog visual alignment](#205-master-catalog-visual-alignment--2026-11-06)
for the revised design. The [first-round readiness review](#206-first-round-readiness-and-isolated-docker-review--2026-11-06)
records the proposed execution gates. The [offline Docker packet](#207-owner-scope-and-offline-docker-review-packet--2026-11-08)
records the Owner decision. The [Docker configuration review](#208-local-docker-metadata-and-configuration-review--2026-11-08)
records the checked host and image identities. The [isolation and bootstrap
packet](#209-isolation-and-native-auth-bootstrap-review--2026-11-08) records
the revised API-only setup and proof gates. The [API-only setup
result](#2010-api-only-bootstrap-held-at-egress--2026-11-08) records the
settled original canary hold. The [route lookup result](#2011-route-lookup-passed-native-extension-hold--2026-11-08)
records the later egress proof. The [pg_net-only exception result](#2012-pg_net-only-exception-passed-app-pre-data-hold--2026-11-08)
records the accepted exception and app pre-data hold. The [role inventory
review](#2013-isolated-role-inventory-and-renderer-adjustment-plan--2026-11-08)
records the exact role differences. The [private renderer result](#2014-private-isolated-renderer-offline-result--2026-11-08)
records the offline patch. The [ACL read-only result](#2015-isolated-acl-read-only-query-hold--2026-11-08)
records the one-shot query failure and the corrected review SQL.
The [ACL v2 result](#2016-isolated-acl-v2-read-passed-coverage-hold--2026-11-08)
records the replacement read and its dated coverage HOLD. The later
[L1 baseline result](#2017-l1-isolated-api-baseline-pass--2026-11-14) records
what was resolved and what remains open for implementation.

## 13. Detailed readiness review

Reviewed and finalized in Markdown: **2026-11-01 (Asia/Bangkok)**.
**R1–R7: CLOSED_IN_PLAN — CONTRACT_DEFINED; RUNTIME_NOT_RUN.**

ผลตรวจรอบลึกถูกเปลี่ยนเป็นข้อกำหนดที่เลือกแล้วด้านล่าง ใช้กับ approval packet
section 11 และ checkpoint section 12 ไม่เหลือ design choice ของ R1–R7 ให้
ตัดสินขณะรันทดสอบ ส่วน running-target cap/credential/UUID support/browser
availability เป็น preflight gates ที่มีเงื่อนไขหยุดชัด ไม่ใช่ผลที่ผ่านแล้ว

Owner ขอให้ปิดรายละเอียดแผนเท่านั้น ไม่มี code, DB/Auth/fixtures, Production
หรือ publication grant ไม่เพิ่ม schema/RPC/package/shared Auth/global UI
ขอบเขตยังเป็น 9 code/test/harness files + 1 result document ตาม 11.4

### 13.1 Final execution contracts

**R1 — One in-flight command and uncertain outcome**

- ใช้ controller เดียวทั้ง table/mobile/Sheet จับ synchronous in-flight lock
  ก่อน `await` ไม่ใช้ React busy state อย่างเดียว เก็บ actor/target/action/
  exact reason/payload/request UUID/generation ของ intent นั้น
- ล็อก mutations ทั้ง directory ระหว่าง authorizing/submitting และ canonical
  reread หลัง success หาก actor/page/generation เปลี่ยนก่อน submit ให้ยกเลิก
  โดยไม่เรียก mutation RPC Late responses ไม่มีสิทธิ์เปลี่ยน target/page ใหม่
- Success → canonical reread → คืน controls; success+reread failure ยังคงเป็น
  success แต่ปิด dependent actions พร้อม “โหลดข้อมูลล่าสุด” ซึ่งเป็น read เท่านั้น
- UNKNOWN/timeout → จบ in-flight state แต่เก็บ warning/intent เดิมว่า unresolved
  และปิด authority commands ของ target นั้น ไม่มีปุ่ม mutation “ลองใหม่”
  ไม่ส่งซ้ำอัตโนมัติ ไม่ถือว่า abort ทำให้ server rollback
- ทางออกที่เลือกคือ **explicit read retry → R2 authority/page/details อ่านสำเร็จ
  → ทบทวนใหม่ผ่าน native confirm/reason prompt เดิม** ข้อความต้องบอกว่า
  “ผลคำสั่งก่อนหน้ายังยืนยันไม่ได้ การดำเนินการนี้เป็นคำสั่งใหม่” และระบุ target/
  current state/action ที่เพิ่งอ่านได้ Cancel ไม่ส่ง RPC หลังยืนยันจึงสร้าง
  UUID ของ new intent ไม่เรียกว่ากู้หรือ replay คำสั่งเดิม
- Warning ของ intent เก่าไม่ถูกเปลี่ยนเป็น failed/success เพียงเพราะ current
  value ตรงกับที่ต้องการ หาก target ไม่อยู่ใน authorized page ให้ปิด details
  และคงข้อความผลไม่แน่นอนระดับ workspace ไม่ scan directory หรือเพิ่ม by-ID RPC
- ขอบเขตนี้อยู่ใน workspace ที่เปิดอยู่ ไม่มี persisted recovery ข้าม reload/
  session; เมื่อโหลดใหม่ต้องเริ่มจาก fresh authority/canonical state และ existing
  explicit prompts ไม่อ้างว่าได้ resolve historical UNKNOWN แล้ว ส่วน full
  same-intent recovery/reviewed-state concurrency ยังเป็นงานแยกตาม section 3/6

Acceptance: double click, role+status, approve+reject และสอง responsive layouts
ต้องส่งได้เพียงหนึ่ง mutation ระหว่าง in-flight; cancel/obsolete intent ไม่ส่ง
RPC; UNKNOWN ไม่มีทางข้าม read+new-review ไป retry; success+reread failure
ไม่ออก UUID หรือส่ง mutation เพิ่ม นี่เป็น client containment ไม่เปลี่ยน RPC

**R2 — Read-side authorization loss**

ใช้ choreography เดียวกับ initial load, Next, Back, Refresh และ read retry:

1. จับ actor/generation/requested cursor และปิด commands ระหว่างอ่าน
2. เรียก `requireActiveAdmin` ก่อน directory request
3. อ่านหนึ่ง directory RPC และ bounded reference batches ตาม R3/R7
4. เรียก `requireActiveAdmin` อีกครั้งก่อน commit/publish และตรวจ actor/
   generation/source mode ตรงกับชุดที่เริ่มอ่าน
5. จึง commit page/details/history; source mode เปลี่ยนระหว่างอ่านให้ discard
   ชุดนั้นแล้วเสนอ explicit read retry ไม่ผสม v2 กับ legacy projection

Denied/unavailable หรือ actor เปลี่ยน → ซ่อน/ล้าง directory, details, counts,
selection/history และปิด commands แสดง forbidden/unavailable ตามผล guard
ไม่แปล `200 []` เป็น empty โดยข้าม postcheck และไม่คง stale controls ไว้
Reference lookup ผิดพลาดอย่างเดียวไม่ใช่ authority failure: คงแถวพร้อม error
และปิด approve เฉพาะ target ที่ข้อมูลคำขอไม่ครบตาม safeguard เดิม

Acceptance: same-user/same-JWT ถูกถอน Admin หลัง precheck ก่อน RPC และหลัง
RPC ก่อน publish, postcheck network failure, actor switch/late response ต้อง
ไม่ publish stale data หรือเปิด commands ข้าม authority checks
สอง guard invocations ต้องนับเป็น authorization traffic แยกจาก directory RPC

Evidence: SQL027 ใช้ `WHERE current_active_admin()` จึงอาจคืน `[]` เมื่อสิทธิ์
หาย ไม่มี polling/global Auth change/instant-revocation guarantee หรือ atomic
read snapshot และไม่รับประกันลบข้อมูลที่ผู้ใช้เคยเห็นไปแล้ว หลักการตรวจทุก
request อ้างอิง [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request)

**R3 — Pagination cap and failed navigation**

- Preflight ที่อนุมัติในอนาคตต้องยืนยัน **effective running-target API cap ≥26**
  จาก runtime configuration/metadata ที่เกี่ยวข้อง unknown/<26 ให้หยุดก่อน
  fixture preparation/รับรอง pagination ไม่ปรับ config หรือเข้า Production เอง
  Future release ใช้ configuration evidence ภายใต้อำนาจ release นั้น
- cap1000 ใน `supabase/config.toml` และ receipt L1 วันที่ 23 ต.ค. เป็น dated
  source/evidence ไม่ใช่ fresh confirmation ผล 25 แถวอย่างเดียวแยก last page
  จริงจาก cap25 ไม่ได้ จึงไม่บังคับให้ UI เดาข้อมูลที่ response ไม่บอก
- Request26/show25; next cursor จากแถว25 เก็บ raw timestamp/ID โดยไม่ format/
  round ผ่าน JavaScript Date Cursor ต้องครบทั้งคู่หรือ NULL ทั้งคู่ malformed/
  partial cursor ให้ fail ก่อนส่ง RPC; ไม่ใช้ lookahead row เป็น next cursor
- แยก requested cursor จาก committed page/history Commit เมื่อ page-core
  read และ R2 postcheck ล่าสุดผ่านเท่านั้น ตรวจ schema/order/unique IDs ของ
  page result ก่อนใช้เป็น navigation; reference errors commit เป็น explicit
  partial-reference state ได้โดยไม่เปิด approve ที่ยัง review คำขอไม่ได้
- Next/Back failure → คง committed rows/history พร้อมข้อความว่าโหลดหน้าใหม่
  ไม่สำเร็จ; Retry ใช้ requested cursor เดิม; Cancel กลับ committed page โดย
  ไม่มี push/pop เพิ่ม Refresh หน้าปัจจุบันไม่เปลี่ยน history Actor change/
  authority failure ล้าง state ตาม R2; history เป็น cursor สำหรับอ่านใหม่
  ไม่ใช่ snapshot ของข้อมูลเก่า

Acceptance: >100 runtime users ไล่ครบเทียบ manifest, 25/26 boundary, หน้าแรก/
กลาง/สุดท้าย, Next/Back failure→retry/cancel, partial cursor และ stale response
cap25 case ต้อง fail preflight/harness acceptance ไม่ใช่ genuine last-page PASS
ไม่เพิ่ม count RPC; existing SQL027 ยอมกลับหน้าแรกเมื่อ cursor ขาดค่าใดค่าหนึ่ง
ส่วน [PostgREST db-max-rows](https://docs.postgrest.org/en/v14/references/configuration.html#db-max-rows)
ครอบคลุม function results ด้วย

**R4 — Crash-safe fixture manifest**

- Acquire single-writer lock ต่องาน A1 บน local target เดียวกันก่อน prepare/
  verify/finalize เก็บ target fingerprint/run ID/process identity ไม่ปลด lock
  เพราะเวลาผ่านไปอย่างเดียว Resume ต้องยืนยัน process เดิมจบและ manifest valid
- Manifest path ตาม 11.4; directory0700/file0600 เขียน temporary file ใน
  directory เดียวกัน → flush/fsync → atomic rename → fsync directory ไม่มี
  secrets หรือ raw Auth rows และไม่แก้ `.gitignore`/เก้า parity artifacts
- ก่อนทุก write ตรวจ target เป็น loopback ของ existing `conduit-boq-local`
  ที่ยืนยัน runtime/container mapping แล้ว ไม่รับ URL ปลายทางภายนอกหรือ
  redirect ไปภายนอก หาก target/source/manifest fingerprint ไม่ตรงให้หยุด
- จอง Auth UUID/slot + unique synthetic email/run tag และ persist ก่อน create
  ใช้ first owned fixture ตรวจว่า local Auth คง UUID ที่ส่งจริงก่อน bulk
  first create response ไม่แน่นอนให้ reconcile exact reserved UUID ก่อนทำต่อ
  server ไม่คง UUID/manifest หายหรือเสียให้หยุด ไม่สร้างทดแทน/รับบัญชีตาม email
- RESERVED/UNKNOWN create slots นับรวมในเพดาน105ของ run เดียว retry/resume
  ไม่เริ่ม run ใหม่เพื่อหลบเพดาน; UNKNOWN transition ไม่ใช้ account slot ใหม่
- ก่อน transition persist actor/action/target/actual RPC args/exact reason/
  request UUID แล้วบันทึก outcome ตามจริง Normalize ค่าเพียงก่อนสร้าง intent
  ไม่ trim/rewrite payload หรือเปลี่ยน UUID หลัง UNKNOWN เพื่อให้ replay ผ่าน
- Resume ตรวจ UUID + synthetic email + run tag ตรงทั้งหมด สำหรับ UNKNOWN
  transition ตรวจ current state/audit outcome ผ่าน trusted paths; จะ replay
  ได้เฉพาะ same intent/exact payload ที่ contract/อำนาจรองรับ ไม่ auto-replay
  migration หรือเดาว่า current value พิสูจน์ historical intent
- Finalize ตาม 11.6 ด้วย original Admin API-only: active ใหม่ → inactive,
  pending/rejected/suspended คง safe state ไม่ reactivate/approve เพื่อ cleanup
  เก็บ rows/events/manifest; finalize ไม่ครบเป็น FAIL ไม่มี Auth/profile delete

Acceptance: interrupt ก่อนส่ง/หลังส่งก่อนบันทึกผล, process restart, runnerซ้อน,
stale lock, manifestเสีย/หาย และ payload mismatch ต้องไม่เพิ่ม identity/UUID
หรือเกิน105 ไม่แตะบัญชีเดิม SQL027 เปรียบเทียบ replay actor/reason/status/role
จริง; นี่เป็น harness contract ไม่ใช่ full recovery UX ของ A1

**R5 — Selected fixture credential and session custody**

- **เลือกใช้ `LOCAL_TEST_PASSWORD` เดิมจาก `supabase/.env.local` สำหรับบัญชี
  จำลองใหม่ทุกบัญชีของรอบนี้** อ่านผ่าน pure `scripts/local-env.mjs` loader
  เดิมโดยไม่แก้ loader/ไฟล์นั้น ไม่ import/run parity/bootstrap/seed runner
- ก่อนใช้ credential ตรวจ canonical local path/target; ไม่อ่านไฟล์ที่ชี้ออก
  checkout/เข้า protected archive เก็บ fingerprint ของ credential-source file
  ใน local-only manifest สำหรับตรวจ resume ไม่เก็บ password/password hash
  ของค่าทดสอบหรือพิมพ์ config contents ใน log/Markdown
- ไม่มี key/ค่ารหัสที่ถูกอ่านในรอบเอกสารนี้ Future preflight หาก key หาย,
  parse ambiguous หรือ source fingerprint เปลี่ยนให้หยุด ไม่มี random fallback,
  password file ใหม่, private secret artifact ใหม่ หรือ Auth password reset
  และไม่เขียนทับค่าหรือเปลี่ยน password ของบัญชีเดิม
- Original Owner Admin ใช้ **API-only ephemeral client** สำหรับ provision/
  finalize; ตั้ง `autoRefreshToken:false`, `persistSession:false`,
  `detectSessionInUrl:false` ไม่ใช้ identity นี้ใน browser QA/logout/actor switch
  cleanup เฉพาะ session ที่ client สร้างด้วย `signOut({scope:'local'})`
- Browser QA/actor switch/revocation/UI logout ใช้ **new synthetic Admin**
  ใน ephemeral isolated browser context/profile เท่านั้น ไม่แตะ Owner context
  ถ้า available browser tooling สร้าง isolated context ไม่ได้ ให้หยุด browser
  cases เป็น NOT RUN ไม่ install package/เปลี่ยน config หรือใช้ Owner session
- เหตุผล: `lib/hooks/useUser.ts` เรียก `signOut()` และ installed Auth SDK
  default เป็น global Browser isolation อย่างเดียวไม่ป้องกัน logout ทุก session
  ของ Owner identity จึงห้ามใช้ Owner identity ใน browser testing นี้
  ไม่แก้ shared Auth hook; UI logout ของ synthetic identity กระทบได้เฉพาะ
  run-owned sessions ของ identity นั้นซึ่งต้องบันทึกแยกตามจริง

Acceptance: resume ใช้ input เดิมได้โดยไม่เก็บ secrets เพิ่ม, missing/changed
sourceหยุด, Owner profile/password/session custodyไม่เสีย, browser cookiesไม่
ปะปน, cleanupไม่ sign out Owner ทุก session และไม่ mutate Auth config/บัญชีเดิม
การทดสอบ short/full Login ใช้ synthetic identities; hosted mail/SSO ยังนอก A1

**R6 — Selected original-data comparison projection**

ก่อน first write freeze original ID sets/counts/digests และ projection names
แบบ aggregate; new fixture/event IDs แยกจากชุดเดิม ไม่อ่านแล้วรับค่าเปลี่ยน
เป็น baseline ใหม่ขณะรันทดสอบ:

| ชุดข้อมูล local | สิ่งที่ต้องเทียบหลังรัน |
|---|---|
| Original `public.user_profiles` | Full rows ทุก field รวม profile `updated_at`, UUID/role/status/affiliation; ไม่มี exception สำหรับ profile |
| Original `auth.users` | Full rows ยกเว้น **เฉพาะ** `last_sign_in_at` และ `updated_at` ของ Auth table; password hash/email/confirmation/ban/metadata/UUID ต้องตรง |
| Original `auth.identities` | Full original rows/stable mappings; ยกเว้นเฉพาะสอง bookkeeping timestamps ข้างต้นหาก schema มี field เหล่านั้น โดย freeze projection ก่อนรัน |
| Original BOQ/routes/items, Catalog/Factor F/reference และ private Copy ledger | Original rows/count/digests ตรง ไม่มี Save/Copy/BOQ write ใน core A1 ไม่มี reference/ราคา mutation |
| Original authorization events | Full original rows/count/digests ตรง; new events ต้องผูก exact new target/request UUID ใน manifest ไม่อนุญาตเพียงเพราะ actor เป็น Admin เดิม |
| Original sessions/Auth audit | Original entries/identity links ไม่ถูกลบหรือย้าย; new run-owned sessions/audit แยกนับ และ cleanup session จำกัดของรอบนี้ ไม่ลบประวัติให้ hash ตรง |

Trusted APIs เท่านั้นสำหรับ writes อนุญาต bounded **read-only metadata/custody
aggregate queries** ใน harness ตาม local scope ที่จะขออนุมัติ ห้าม DDL/SQL
write/trigger bypass ไม่สร้าง SQL artifact/migration ไม่ส่ง raw Auth rows,
`encrypted_password`, token/cookie หรือ personal identifiers ลง stdout,
Markdown หรือ non-secret manifest เก็บเพียง aggregate digests/counts/projection
names ส่วน configured password source ตรวจไม่เปลี่ยนตาม R5

หากมี original-data difference ที่นอก allowlist นี้หรือ concurrent external
writes ให้หยุด preservation PASS และรายงาน ไม่เพิ่ม exclusion ย้อนหลัง
ห้ามลบ original sessions/audits หรือแก้ข้อมูลกลับเพื่อซ่อน delta
Custody pattern อ้าง [L1 local result](../../06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md#5-cleanup-and-original-data-custody)
โดยไม่อ้างว่าผล L1 คือผล A1

**R7 — Selected local request/performance/timeout budgets**

ตัวเลขต่อไปนี้เป็น **เกณฑ์ engineering local ที่ประกาศก่อนทดสอบ** เสนอพร้อม
local scope ไม่ใช่ค่าที่วัดแล้วหรือ Production SLA ไม่มีการปรับเกณฑ์หลังเห็น
ผลเพื่อให้ผ่าน; FAIL ให้รายงาน/แก้ใน scope หรือเสนอ exception ก่อน release

| Metric บน local ปกติ | เกณฑ์ที่เลือก |
|---|---|
| Directory RPC transport `p_limit=26` | warm p95 ≤250ms |
| Page navigation → authorized page พร้อมใช้งาน | warm p95 ≤2,000ms รวม pre/post authority, reference และ render |
| เปิด `/admin` ใน fresh browser context | 3 samples ทุก sample ≤5,000ms บน Next ที่ build/เปิด server แล้ว |
| Read attempt ทั้งชุด | deadline15s → read/unavailable state และ discard late result |
| Submitted mutation HTTP | deadline20s → UNKNOWN ไม่ใช่ rollback/failure ที่พิสูจน์แล้ว ไม่ส่งซ้ำ |
| Canonical reread หลัง success | deadline15s → success + refresh failure ไม่เปลี่ยนเป็น mutation failure |

- Node24, built/running local Next และ target/dataset/browser/hardware เดิม
  กลุ่ม normal performance ไม่มี injected faults ไม่วัด compilation เป็น page
  latency และไม่ reset/restart DB/server เพื่อทำ cold test
- 5 warmups +20 recorded samples ต่อ workload หน้าแรก/กลาง/สุดท้ายด้วย raw
  cursors จาก traversal จริง รวมอย่างน้อยหนึ่งหน้าที่ต้อง resolve references
  รายงาน p50/p95/max/response bytes; p95 ใช้ nearest-rank ลำดับ ceil(0.95×N)
  “cold” หมายถึง fresh browser context เท่านั้น ไม่ใช่ cold DB/build/server
- Baseline B0: old HEAD UI observations ก่อนเปลี่ยน app source หากยังเก็บได้
  ภายใต้อำนาจที่อนุมัติ เป็น observation ไม่ใช่ prerequisite ให้สร้าง checkout
  ใหม่ B1: หลัง approved fixture preparation ใช้ RPC เดิม `p_limit=26`/
  raw cursors เดิมบน fixed >100 users ก่อน candidate runtime acceptance
  Old UI fetch100 กับ new25 ห้ามสรุป speedup แบบ like-for-like
- One directory RPC/read attempt; reference allowlist **organizations,
  departments, sectors** สูงสุดหนึ่ง ID-scoped batch ต่อตารางที่ต้องใช้ ไม่
  per-user/whole-table queries ไม่ query ถ้า ID set ว่าง ตรวจ completeness
- Pre/post authority invocations, AuthProvider/background token refresh,
  initial Catalog gate และ explicit retry/reconciliation แยกประเภทใน receipt
  initial gateไม่ต้องโหลดใหม่ทุก page; เปิด Sheet/เปลี่ยน responsive layout
  ต้องไม่เพิ่ม directory/reference/profile/signature requests
- Error/timeout/revocation/disconnect/fault injection แยกจาก normal p95 group
  ต้องผ่าน bounded feedback/no duplicate mutation/stale-result rejection
  โดยใช้ feature-owned deadline/generation guard และ abort เมื่อ SDK รองรับ
  helper ที่ abort ไม่ได้ต้อง discard late result ไม่แก้ shared Auth settings
- Empty API case ใช้ authorized cursor หลังแถวสุดท้าย ไม่ลบข้อมูลเพื่อสร้าง
  empty dataset; active Admin หน้าแรกปกติมี profile ของตนเอง ต้องไม่ fabricate
  runtime empty-first-page PASS หรืออ้าง pure mock เป็น DB proof

### 13.2 Covered boundaries and retained limits

แผนคง actual/requested/NULL/error, canonical reread, actor/target binding,
legacy read-only, scoped NT/IBM, existing-user continuity, no-auto repair,
retained fixtures/audit และ durable status เดิม โดย R1–R7 เพิ่มรายละเอียด
ภายใน file allowlist ไม่เพิ่ม foundation/framework หรือ approval ceremony

Reviewed-state conflict ระหว่าง Admin หลายคนยังเป็น retained backend limit
ของ UM-B; refresh/row lock ไม่ปิดทั้งหมด S0 procurement direct-write แยก
A1 ไม่แก้ช่องนั้น Signup/mail อยู่ A2 และ SSO ต้องตัดสิน identity continuity
ภายหลัง ไม่ทำให้ A1 ต้องรอ IdP แต่ไม่สัญญาว่า future migration/linking ไม่จำเป็น

### 13.3 Plan closure matrix and runtime gates

| Finding | สถานะแผน / สิ่งที่เลือกแล้ว | หลักฐานที่ยังต้องมีหลังอนุมัติ |
|---|---|---|
| R1 | CLOSED_IN_PLAN — single-flight + explicit read/new-intent path, no generic retry | Double submit/cross-action/UNKNOWN/cancel/reread-failure cases |
| R2 | CLOSED_IN_PLAN — pre/post authority and actor/source checks | Same-JWT revocation interleavings/postcheck failure/actor switch |
| R3 | CLOSED_IN_PLAN — cap≥26 gate + requested/committed cursor/history | Running cap, >100 traversal, failed navigation/cursor/cap cases |
| R4 | CLOSED_IN_PLAN — target lock/atomic manifest/exact payload/105 slots | Crash/restart/lock/UNKNOWN/capacity/replay-payload cases |
| R5 | CLOSED_IN_PLAN — existing configured password, API-only Owner, isolated synthetic browser | Credential input/UUID support/tool isolation/cookie/session custody |
| R6 | CLOSED_IN_PLAN — exact projections and declared Auth-only deltas | Before/after aggregate custody and retained-data report |
| R7 | CLOSED_IN_PLAN — fixed budgets/deadlines/sample/request method | Baseline/normal/fault metrics with exact source/target |

**Dated plan-stage matrix:** Runtime ยัง NOT RUN ณ เวลาปิดแผนส่วนนี้;
ภายหลัง local execution/ผลจริง/NOT RUN ที่ยังเหลือถูกบันทึกใน checkpoint12
และ [local result](../../06_engineering/UM_A1_LOCAL_RESULT.md) ไม่แก้เกณฑ์ย้อนหลัง
เพื่อปิดตารางนี้ Effective cap, existing credential input, custom Auth UUID,
isolated browser และ relevant local parity เป็น preflight gates ที่เลือก
วิธีแล้ว หากไม่ผ่านให้หยุดงานที่ขึ้นกับ gate/รายงานตามจริง ไม่เปลี่ยน DB/config/
package/สิทธิ์หรือสร้าง target ใหม่เพื่อทำให้ผ่านโดยพลการ

Milestone ณ ตอนปิดแผนคือ **PLAN_FINAL_FOR_OWNER_LOCAL_SCOPE_REVIEW** การอนุมัติ
ปิดรายละเอียด Markdown ครั้งนี้ไม่ใช่ Owner approval สำหรับ local code/DB/
fixtures/tests runtime และไม่รวม staging/commit/push/deploy/Production

## 14. UM-A1 settled visual review approval packet

Prepared **2026-11-02**, **PLAN ONLY / EXECUTION NOT AUTHORIZED**.
This is the dated approval packet. The later Owner approved its bounded
execution, now completed in the [settled visual receipt](../../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md)
and checkpoint12; proposed/unapproved wording below records the packet stage,
not a fresh runtime grant or a reason to repeat the completed session.
Target flow: canonical built `/admin` → read directory/page/details → close Sheet
→ inspect settled desktop/mobile images. This closes the specific screenshot
gap in the [new18 receipt](../../06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md),
not a new functional, Auth, brand-restyle or release project.

### 14.1 Recommended identity and exact data boundary

ใช้ **Admin local เดิมที่ยัง active หนึ่งบัญชี** เป็น proposed browser persona
เช่น `local.admin@ntplc.co.th` หลัง fresh read-only preflight ยืนยัน exact UUID/
active/admin แล้ว ใช้ session ใหม่ที่แยกเฉพาะตรวจภาพหนึ่ง session ร่วมกันใน
isolated contexts ไม่ใช้ browser profile/cookie/session เดิมของ Owner ไม่สร้าง
บัญชีใหม่ ไม่เปิด/activate/approve/login ด้วยบัญชีจาก run105 หรือ run18
การอ่าน retained fixture rows ใน directory ไม่ใช่การเปิด fixture run กลับมา

**ยังไม่อนุมัติข้อยกเว้นนี้:** R5 กำหนด Owner Admin เป็น API-only เพราะ
`lib/hooks/useUser.ts` ใช้ `supabase.auth.signOut()` แบบไม่ระบุ scope ซึ่งอาจ
logout session อื่นด้วย การขอแผนครั้งนี้ไม่ใช่ permission ให้ใช้ identity นั้น
ใน browser หรือทำ Auth operation จึงไม่เริ่ม sign-in จากเอกสารนี้

การ login จริงย่อมสร้าง session/Auth audit และอาจเปลี่ยน Auth
`last_sign_in_at`/`updated_at` ตามปกติ **ไม่ใช่ zero-DB-write** ขอบเขตที่เสนอ
ต้องให้ Owner ยอมรับเฉพาะ Auth bookkeeping นี้ รวม refresh ของ session ใหม่
หากเกิดขึ้น และ `scope:local` cleanup โดยมีข้อกำหนดดังนี้:

- ทุก profile field รวม `updated_at`, UUID/email/password/confirmation/ban/
  role/status/actual-requested affiliation/settings และข้อมูลธุรกิจเดิมคงเดิม
- Auth timestamp exceptions จำกัดเฉพาะ identity ที่เลือกและ identity mapping
  ของบัญชีนั้น; Auth rows อื่นคงเต็มแถว ไม่มี password reset หรือ account repair
- Original sessions/identity links/audit entries ต้องไม่ถูกลบหรือย้าย ไม่ใช้
  `global`/`others` logout และไม่ลบ audit เพื่อทำให้ digest ตรง
- ถ้า Owner หมายถึงห้ามแม้แต่ Auth bookkeeping ให้คง actual authenticated
  visual review เป็น NOT RUN; ไม่เปลี่ยนไปสร้างบัญชีหรือใช้ mock แล้วนับเป็น
  real-built/API PASS โดยอัตโนมัติ ไม่คัดลอก session เดิมมาเลี่ยงเงื่อนไข

ไม่มี fixture fallback อัตโนมัติ หากบัญชีที่เสนอใช้ไม่ได้ให้หยุดเสนอทางเลือก
ใหม่ ไม่เปลี่ยนสิทธิ์/สถานะหรือเปิด run ที่ปิดแล้วเพื่อทำให้ทดสอบต่อได้

### 14.2 Preflight and proposed implementation scope

หลังได้รับอนุมัติเท่านั้น:

1. ตรวจ Git/empty index, dirty-work custody และ application fingerprints เทียบ
   new18 receipt; current capture-helper source SHA
   `14f7fb48fa5bb3ff2f829861d30ca811eec54eb6802298b62996e697b03ca2c5`
   ผ่าน offline checks แล้ว แต่ภาพหลังแก้ยัง NOT RUN
2. ตรวจ existing `conduit-boq-local` API55321/container-volume/service graph,
   REST14.5/cap1000/post031 metadata แบบ read-only เทียบ recorded local evidence
   ไม่อ่าน Production ไม่ตีความเป็น fresh Production parity; drift ให้หยุด
3. Freeze all current profile/business/reference/authorization-event rows,
   Auth stable projections และ original session/audit ID sets ก่อน sign-in;
   compare source/password inputs,027–031,nineparity artifacts และ two finalized
   manifests before/after โดยไม่เปลี่ยน baseline ระหว่างรัน
4. ใช้ canonical build รวม root proxy บน Node24/explicit local public API env;
   reuse ได้เมื่อ provenance/source/local URL ยืนยันครบ มิฉะนั้น build
   Turbopack ใหม่โดยไม่ install/change package/config/CI หรือ reset Docker
5. ทำ runner ขนาดเล็ก **visual-only** ที่
   `scripts/test-um-a1-visual-local.mjs`, default dry-run/explicit execute และ
   bounded reads; ใช้ pure local-env loader/installed browser tooling เดิม
   ห้าม import/run `runUmA1`, fixture modes, full real-browser runner หรือ
   `--from-case` เพราะ guard เดิมต้อง OPEN/PREPARED18 และมี mutation cases

Proposed file allowlist หลังอนุมัติ: runner ใหม่ข้างต้น,
`docs/06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md`, checkpointนี้ และ
AGENTS/AI_HANDOFF pointers เท่านั้น; private PNG/JSON evidence อยู่นอก tracked
source ไม่มี application/shared-auth/component/font/asset/package/lock/config/
SQL/migration change และไม่แก้ frozen receipts/สอง finalized manifests

Browser plugin/skill หากไม่มี ให้ใช้ installed Playwright/Chrome isolated
contexts ตามทางเดิมและบันทึกเหตุผล ไม่ติดตั้ง tooling เพิ่ม ไม่ใช้ Owner Chrome
profile หรือ extension-backed session ที่แยกไม่ได้

### 14.3 Mutation firewall and session custody

- Install network guard **ก่อน navigation**: เฉพาะ loopback app และ API55321,
  deny redirects/non-local origins และ unexpected web API routes
- Data API อนุญาตเฉพาะ required GET/OPTIONS และ POST read RPC allowlist:
  `get_my_profile_v2`, `get_admin_profiles_page`, `get_my_catalog_admin_gate`,
  `is_signup_email_allowed`; read RPC ต้องไม่ถูกเรียกรวมว่า business write
- Block ทุก Admin command, Save/Copy/business mutation, direct table writes,
  account settings/update/delete, signup/invite และ browser logout ทุก scope
  เก็บ attempted-write count; ถ้ามีให้หยุด แม้ guard ป้องกันการส่งได้
- Bootstrap Auth ผ่าน ephemeral client หนึ่งตัวด้วย public anon key/password
  เดิมใน memory ไม่ใช้ service-role key; verify exact chosen UUID/session_id
  แล้วให้ isolated contexts ใช้เฉพาะ session ใหม่นี้ ไม่ทำ actor switch หรือ
  role/status/revocation tests ไม่กด UI logout
- Node bootstrap client ตั้ง `autoRefreshToken:false`, `persistSession:false`,
  `detectSessionInUrl:false`; contexts ทำทีละชุดตามลำดับ ไม่ให้แชร์ refresh
  token พร้อมกัน ตรวจ token lifetime พอสำหรับกรอบ reviewไม่เกิน20นาที
  ถ้าไม่พอ/ใกล้หมดให้หยุดcleanup ไม่เปลี่ยน Auth config หรือล็อกอินวนซ้ำ
- Auth bootstrap/refresh ต้อง pin local origin; refresh ถ้ามีต้องเป็น session
  ของรอบนี้เท่านั้น Browser firewall ไม่ครอบคลุม server fetch จึงต้องตรวจ
  canonical server env/proxy ด้วย ไม่ให้ Next โหลด Production credentials
- ไม่เก็บ token/cookie/password/headers/HAR ลงรูปหรือรายงาน ถ้า login/cleanup
  UNKNOWN ให้หยุด/reconcile exact session ผ่าน read-only evidence ก่อน ไม่
  login ซ้ำหรือใช้ global logout เพื่อเก็บกวาด

### 14.4 Capture matrix and settled-state requirements

ใช้ **fresh desktop context1280×900 และ fresh mobile context390×844 ที่ DPR1**
เป็นภาพหลัก แยกจาก context ตรวจ boundary/reflow; ไม่ใช้ CDP override/reset
ปนกับ primary contexts เพื่อเลี่ยง ambiguity ของภาพก่อนหน้า

| ชุดภาพ/การตรวจ | สิ่งที่ต้องเห็นและตรวจ |
|---|---|
| Desktop1280×900 +1440px | Resting directory/table,หัวหน้าและ NT-yellow frame,columns/names/emails/status/affiliation/actions,topและpagination/footer;viewport+full-pageตามขนาดที่เหมาะสม |
| Mobile390×844 +320px | Resting cards,ข้อความไทย/emailยาวไม่ล้น,controlsไม่ทับกัน,top/middle/bottomและpaginationกดอ่านได้,ไม่มี header strip ซ้ำ |
| Tablet768px / boundary1023–1024px | Actual source breakpointคือ1024px:1023cards/1024table;ไม่มีทั้งสองชุดซ้อนหรือmissing rows;ตรวจ1024อย่างเดียวไม่พิสูจน์ทั้งสองข้าง |
| Sheet desktop/mobile | Read-only detailsเมื่อเปิด,header/close/scroll contentไม่ถูกตัด,Tab focusอยู่ในSheet; Escape/ปิดแล้วfocusคืนtriggerและภาพrestingสะอาด |
| ข้อมูลสถานะที่มีอยู่จริง | อ่าน pending/inactive/suspended/active และ actual/requested/unassigned labels ตามข้อมูลปัจจุบัน;active/NULLสองเคสเดิมไม่ถูกแสดงเป็นpending;ไม่เปลี่ยนข้อมูลเพื่อสร้างกรณี |
| Reflow/reduced motion |640CSSpx@DPR2ใช้contextแยก;labelเป็นreflow emulationไม่ใช่actualbrowserzoom;ตรวจเปิด/ปิดSheetทั้งnormalและreducedmotionโดยไม่เพิ่มAPIreads |

ก่อน **ทุก resting PNG** ต้องผ่าน: directory/authorityพร้อม,ไม่loading/stale,
`document.fonts.ready` และprimary IBM font loadedโดยไม่ใช่fallback-only,
Sheet content/overlay/dialog **detachedจริง**, body/root pointer-eventsคืนเดิม
และไม่เป็นnone, expected viewport/DPR/scroll positionตรง และรอสอง animation
frames ใช้ตรรกะ `sheetClosed`/`restingCapture` ที่แก้ไว้ ไม่ใช้ sleepอย่างเดียว
ภาพmiddle/bottomบันทึกscrollตำแหน่งจริง;ภาพtopต้องscroll0

จากนั้นตรวจ PNG จริงทุกภาพด้วยสายตา รวมdesktop/mobilerestingและSheetclose
ให้เสร็จ **ก่อน cleanup/ปิดรอบ** ไม่ใช้ DOM/font/assertion PASS แทนรูปที่เห็น
ตัวrunnerต้องมีช่วงรอreviewก่อนsign-out โดยคง dedicated session ในmemory
และมีbounded timeout/finallycleanup; ไม่ปิดsessionอัตโนมัติทันทีที่ไฟล์รูปเขียน
ครบ หากหมดเวลาก่อนreviewเสร็จให้cleanupและบันทึกNOTRUN/partialตามจริง
หากภาพยัง dim/headerซ้ำ ให้เก็บภาพเดิมและตรวจด้วยfreshcontextแบบread-only
หนึ่งครั้งเพื่อแยก capture/compositorจากproduct;ห้ามcrop/editเพื่อซ่อนปัญหา
ถ้ายังอธิบายไม่ได้ให้เป็นFAIL/openfinding ไม่แก้CSS/appหรือcaptureวนจนผ่าน

### 14.5 Acceptance, cleanup and retained limits

Visual closure ต้องมีครบ: required PNGs inspectedPASS,primaryfont/Thai glyphs/
wrap/focus/contrast/themeกลมกลืนกับexisting NT frame,ไม่overlayค้าง/headerซ้ำ/
horizontaloverflow,zero Admin/business/direct-write attempts,zero unexpected
page/console errors,source/DBmetadata/protecteddata unchanged และsessioncleanup
ยืนยันได้ ไม่รับรองsitewideNT CI/NTfontrollout/Safari/realdevice/audible
screenreaderหรือactualbrowserzoomจากChrome viewportemulation

เมื่อภาพครบและreviewแล้วจึงปิดcontextsทั้งหมดและใช้ephemeral client
`signOut({scope:'local'})` **เฉพาะsessionใหม่ของรอบนี้** ตรวจDBแบบread-onlyว่า
sessionนั้นหมดจริงและoriginalsessions/links/auditsยังอยู่ เทียบfullprofiles/
business/password/authority digests พร้อมAuth-only exceptionsที่ประกาศไว้
ไม่มี profile finalizer/deactivate/delete เพราะไม่ได้สร้างfixtureในรอบนี้
ถ้าหลักฐานล้มเหลวให้cleanupsessionอย่างปลอดภัยเช่นกัน และคงFAIL/UNKNOWN
ไม่เปิดrun105/run18เพื่อทดแทนหรือเก็บกวาด

รายงาน exact source/build/target/browser/viewports,PNG paths+hashes,per-image
PASS/FAIL/NOT RUN,normalAuthbookkeeping deltas,attempted-write counts,original
data/session custody และcleanup outcomeในreceiptใหม่ แล้วอัปเดตcheckpoint
โดยคงภาพไม่ผ่าน/13functionalgroups/31APIchecksและBHTTPNOTRUNตามประวัติเดิม
ไม่รัน845tests/functional mutationsซ้ำเพื่อปิดช่องว่างภาพเมื่อappsourceไม่เปลี่ยน
toolingใหม่ต้องsyntax/lint/dryrunและdocchecksที่เกี่ยวข้องผ่านก่อนexecute

การอนุมัติที่ต้องมีสำหรับขั้นถัดไปมีเพียง bounded local visual execution นี้:
newvisual-onlytooling/buildถ้าจำเป็น,chosenexistingAdmin browserpersonaและ
**normalAuthbookkeeping/local-onlycleanup exception** พร้อมread-onlycustody
และimages ไม่รวมapplicationfix/fixture/release/Production/stage/commit/push/
deploy หากไม่ยอมรับAuth exceptionให้คงขั้นruntimeNOTRUNโดยไม่แก้ข้อมูลเดิม

## 15. UM-B priority legacy affiliation confirmation plan

Prepared: **2026-11-02 (Asia/Bangkok)**. **PLAN ONLY — LOCAL IMPLEMENTATION
NOT APPROVED.** Later section16 selects the audit contract in plan; the positive
fixture gate remains OPEN. The initial two-gate stage is retained in chronology.
Progress/authority stays in [section12](#12-execution-status-and-resume-checkpoint).
This is a small first part of UM-B, after focused S0/A1 and before A2/broader
UM-B in the proposed order. It does not start S0 or reopen its approval packet,
change the accepted A1 runtime, or require all future roles/SSO decisions first.

### 15.1 Evidence, Owner report and current authority

Keep the following separate; this planning record stores no real person's
name/email/UUID or raw response:

| Source | What it establishes | What it does not establish |
|---|---|---|
| Owner statement in this conversation | Owner confirms having approved the selected account's requested affiliation after its information was updated | No reconstructed historical timestamp, request UUID, database event or original execution path |
| Earlier bounded read,2026-10-24 | Selected account was active/staff with missing actual affiliation and valid requested references | Not prevalence across users or proof of never-approved history |
| New explicitly approved bounded Production read,2026-11-02T08:15:31Z (15:15Bangkok) | Exactly1account; active/staff; actual org/dept/sector IDs allNULL; requested hierarchy found/coherent/active; approved_at/by NULL;0target authorization events and no truncation | Does not disprove Owner's action, establish who changed what, or identify why actual affiliation is absent |
| Existing source | Old Admin renders requested affiliation with “(ขอ)” when actual name is absent; normal approval code sets active plus actual affiliation together | Not evidence that current approval RPC produced the historical inconsistency |

The new query ran in an explicitly READ ONLY transaction (`on`) ending in
ROLLBACK. Only the selected profile, its referenced hierarchy and target-filtered
authorization history were read. No BOQ, business RPC, account mutation or
publication occurred. That bounded inspection is complete and its authority
consumed. This planning continuation authorizes Markdown/source/document checks
only; no local/Production DB/Auth/fixture operation, SQL artifact/number,
package/config work or stage/commit/push/deploy.

The confirmed problem is **prior approval reported by Owner, while the current
stored actual affiliation remains absent**. A1's truthful labels alone do not
complete the data correction. Do not rewrite this as “Owner never approved”,
erase the user's report, or claim that the exact old failure has been traced.

### 15.2 Narrow first candidate and impact

Propose one explicit trusted **legacy affiliation confirmation**, with no
hardcoded person/email/UUID. Initial eligibility is all of:

- Current target is **active staff**, distinct from the acting current active
  Admin. UUID, role, status and existing account remain the same.
- Actual `org_id`, `department_id`, `sector_id` are **allNULL**. Partial or
  nonNULL affiliation is outside this candidate; no overwriting/moves.
- Requested department/sector are both present and currently valid, active,
  related to each other and to an active organization.
- Admin has reviewed that exact target/current request and explicitly confirms
  the actual affiliation, with a nonempty reason and a bound command UUID.

Only actual org/dept/sector and `updated_at` may change. Preserve requested IDs,
role/status/identity, original approval/rejection fields, onboarding flag,
personal data and existing `admin_note`. Store the new reason/time/actor in the
new confirmation evidence; do not backfill or backdate `approved_at/by`.

| Surface | Intended effect / compatibility requirement |
|---|---|
| Selected account | Remains active staff with the same Auth UUID/password/sessions; no signup, onboarding restart or active→pending cycle |
| BOQ access | New sector affiliation can add shared-sector visibility under existing post-S0 RLS. Role unchanged does **not** mean access unchanged; Admin must review the scope implication |
| Existing BOQs | IDs, owner/assignee, stored hierarchy, prices, Catalog/Factor bindings and contents stay unchanged; no BOQ backfill/retagging |
| Write boundary | Preserve S0 procurement denial and existing staff ownership/assignment limits; confirmation must not grant a new role or general same-sector write authority |
| Ordinary new-user approval | Existing pending→active RPC behavior stays unchanged and gets explicit persistent-state regression coverage |
| Already-open user UI | May show cached profile labels until normal reload/profile reread; verify that path without forced logout/password reset. Create already rereads current authorization at submit; do not invent a stale-Create-ID defect |
| Admin UI | A1 remains frozen now. A later separately approved B client adds only the confirmation/review/outcome path and current-state rereads |

Not included: partial-affiliation repair, general transfers, choosing another
department than requested, active-user request editing, manager/Admin/procurement
targets, role redesign, batch cleanup, SSO/identity linking, domain/SMTP/admission,
session revocation policy, Viewer/TOR, operational BOQ or global NT restyling.
If another case is needed, review its authority/visibility matrix separately;
do not expand eligibility merely to make a test fixture convenient.

### 15.3 Trusted command, reviewed state and compatibility

This requires a **new reviewed forward contract**, not direct SQL repair or
reuse of approve/reactivate. Current027 allows only named exact profile deltas;
normal approval requires pending→active with valid actual=requested IDs, and
active users cannot alter requested affiliations through the existing self RPC.
See [profile guard](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L1543)
and [approval update](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L2322).
Do not set internal action GUCs externally, disable triggers/constraints or
replay/edit027–031. A narrow new trusted guard action/command must preserve all
old action deltas and deny direct authenticated profile-field updates.

Required server contract before implementation approval:

1. Authenticate the current caller and require current active Admin. Bind
   actor/target to the command; no user metadata or cached JWT-role authority.
   Keep existing Admin lock compatibility: actor/target profile locks in
   **ascending UUID order**, as [027 currently does](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L2154).
   Do not replace this with actor-first locking.
2. Validate the exact reviewed target role/status, all actual IDs, requested
   IDs and hierarchy state. A material change after review is a conflict,
   requiring a fresh review; a row lock alone does not retain the earlier
   browser snapshot. Finalize the snapshot transport and compatible reference
   lock/version rule before SQL, including concurrent hierarchy deactivation.
3. Define one command identity from actor+request UUID and normalized action,
   target, reviewed fields, proposed affiliation and reason. Same identity with
   changed payload must reject. Successful replay returns its recorded outcome
   without another update/event, followed by a separate canonical current read.
   Revalidate current actor authority even when reading/replaying an old result.
4. Exact replay lookup must not fail merely because the first success filled
   the formerlyNULL actual fields. New intents still require all initial
   eligibility checks. Two Admins/new UUIDs racing on one target must produce
   one valid first confirmation and a deterministic stale/ineligible outcome,
   never a second overwrite or a different affiliation than reviewed.
5. Apply only the permitted profile delta and structured outcome/audit atomically.
   A rejected/stale request must not change affiliation. Specify whether denied
   outcomes are persisted/replayed and how payload reuse is enforced for them;
   do not promise that guarantee from a success-only audit table.
6. Define distinct non-retrying business-conflict/outcome contracts before API
   tests. Do not use a transaction-retry SQLSTATE for an expected stale review
   or treat every HTTP409 as the same failure. A transport timeout is UNKNOWN;
   preserve UUID/payload, reconcile the exact outcome, never infer success from
   current affiliation alone or submit a replacement UUID automatically.

**Audit/outcome design gate — initial stage, refined by section16:** current `user_authorization_events` accepts only
the old eight actions and stores role/status transitions, not structured
affiliation/reviewed state. See [immutable audit source](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L1479).
Logging this as old action `approved` or hiding before/after IDs in reason text
would confuse history and old replay semantics.

Minimum new structured evidence is distinct confirmation type, actor/target,
command UUID and normalized payload/review hash, old/new org/dept/sector IDs,
unchanged role/status, reason, actual new confirmation time and recorded outcome.
It must be append-only and readable only through authorized Admin paths.

Before SQL, compare a backward-compatible extension of existing audit with a
narrow structured command outcome/audit store. Prefer reuse where old function,
ACL, action/replay and immutable-row semantics can stay correct; use a distinct
store only with a documented compatibility/read-model reason. Choose **one**
authoritative outcome source for this command, not competing ledgers. Physical
schema, denied-outcome semantics, unique constraints and old-client compatibility
were an explicit design gate at this section15 stage. Section16 now selects
one private immutable outcome/audit store and fixes the logical contracts;
SQL/DDL/runtime remain unapproved and NOT RUN. No table/column/function/migration
is created or named as an approved implementation by this planning document.

Old approve/reactivate/role endpoints must retain their existing bounds and
cannot become a bypass of the new active-staff confirmation review. Validate
all relevant grants/definer owners/search_path and guard actions on the eventual
local target. Do not widen unrelated account management to implement this case.

### 15.4 Proposed Admin UI/UX

Retain Master Catalog's restrained structural reference, current NT tokens,
IBM Plex Sans Thai and existing primitives. No font/global styling change.
This is a future B candidate; current A1 code and read-only Sheet stay intact.

- Show **“ยืนยันสังกัด”** only from a fresh eligible/capability-supported Admin
  projection. An unavailable/new RPC must disable only this new action safely;
  do not fall back to a different mutating endpoint or change old commands.
- Use one review surface by switching the existing details Sheet to an
  explicit review mode.
  Identity, existing active/staff status, actual missing fields and exact
  requested organization/department/sector remain visible and read-only.
- Explain plainly that this sets actual affiliation and may add access to
  shared BOQs in that sector. No reading/counting real BOQs is needed for this
  generic scope explanation. Require a reason; label final action **“ยืนยันสังกัด”**,
  provide Cancel, keyboard/focus support and mobile wrapping.
- Bind dialog/review to actor, target, current snapshot and UUID. In-flight
  commands are single-flight; navigation/actor changes must not rebind a late
  response or silently clear UNKNOWN. Reuse the A1 lifecycle protections after
  reviewing the actual new command integration.
- After confirmed success or replay, reread current page/details/profile
  projection. If reread fails, distinguish applied command from unavailable
  current view, mark stale and disable dependent actions. Keep unknown command
  evidence separate from normal notices. Refreshing a view never confirms or
  repairs an account automatically.

Do not label an active legacy account “waiting for activation” because actual
affiliation is absent. A new confirmation event records the correction now;
it does not replace the Owner's report of an earlier approval with a fictional
history. General employee-affiliation certification authority still needs the
Owner's explicit selection for this narrow action.

### 15.5 Positive fixture gate and required acceptance

**Dated existing-local finding.** The bounded check in section 17 found no
suitable legacy fixture in the existing local DB. The later, separate
[isolated L1 run](#2017-l1-isolated-api-baseline-pass--2026-11-14) proves the
eligible starting shape and baseline visibility. The acceptance below applies
to the new UM-B command. Normal signup
creates pending/staff; approval requires nonNULL actual affiliation; later
current exact deltas prevent clearing it. Creating eleven more normal actors
does not generate the primary case. Existing captured NULL-scope fixtures are
managers and their staged INSERT omits requested affiliation too; role change
alone does not make them valid targets for section15.2.

Do not reopen either finalized UM run, use the real Production account for
rehearsal, mutate protected original accounts, clear affiliations, disable
triggers, use internal GUC bootstrap, reset/replay or add a test backdoor to
the product. Pure mocks, SQL-claims simulation and normal pending approval are
useful named evidence, but cannot replace this command's positive real-Auth/API
and persisted-state acceptance. S0's unrelated edge NOT RUN allowance does not
carry to UM-B's core behavior.

Proposed first feasibility step, after a new explicit **local read-only**
approval: select only existing non-UM synthetic candidate metadata and fixture
custody, exclude Owner operational accounts/closed UM IDs, and verify the full
eligibility shape. No login/update or original-account use is included in that
selection. If no suitable candidate exists, return to Owner with a concrete
rehearsal/fixture proposal and its impact before any data/schema operation;
there is no automatic second DB, restore, broader eligibility or bypass.

Close the faithful fixture strategy **before local implementation approval**.
Then define exact new-run/candidate IDs, session/bookkeeping permission,
allowed writes/retention/finalization and original-data exceptions, if any,
before tests. No existing fixture or account is implicitly available to borrow.

Required future acceptance:

| Group | Mandatory evidence |
|---|---|
| Ordinary approval regression | New pending user submits valid request → existing Admin approval → canonical reread/reload; active plus actual=requested and normal approval metadata persist; replay does not duplicate the recorded transition |
| Primary legacy confirmation | Faithful eligible synthetic actor; new command succeeds once, actual matches reviewed valid request, UUID/role/status/requested/oldapproval/personal/BOQ data unchanged; one structured new confirmation outcome |
| Scope and existing session | Owned/assigned reads remain; expected shared-sector reads change under existing post-S0 rules; no broader staff writes or procurement regression; normal profile reload reflects new affiliation without forced logout |
| Denials | NonAdmin/nonactive/missing/unsupported callers; target not active staff, partial/nonNULL actual, absent/broken/inactive hierarchy, self target and material stale review; unchanged persisted target |
| Races and replay | Two Admins, same/different UUIDs/payloads, role/status/request/hierarchy changes, late responses/actor switches; current-authority recheck; exactly one effect and correct historical outcome versus present state |
| Uncertain result | Held/lost responses, exact outcome lookup/replay, persisted profile/event consistency; no new UUID or automatic repair; typed conflict/denial versus UNKNOWN and stale reread |
| Compatibility/custody | Old approve/reject/role/status contracts and all action deltas preserved; direct profile update still denied; structured evidence append-only, old audit rows untouched; sessions/passwords/owned BOQs/Catalog/Factor/source hashes retained |
| Quality | Actual approved source/target on Node24, focused meaningful tests, lint/TypeScript/default build and real local API/browser acceptance. New mock/static PASS alone is not the positive legacy acceptance |

For missing-profile/unsupported-role negative actors, separate feasible real
Auth cases from predicate/model evidence. Never weaken schema constraints or
profile guards to manufacture those states. This classification does not waive
the command's faithful positive legacy API case.

Current results for this new command are **NOT RUN**. No future implementation
is release-ready while its primary positive case or required audit/replay
semantics remain unproved.

### 15.6 Recovery, decisions and next step

Client rollback leaves any already-confirmed actual affiliation and resulting
visibility in place. No automatic clearing, active→pending cycle, audit deletion
or down migration is included. A later correction needs its own reviewed,
audited trusted transition; this initial missing-only command is not an undo or
transfer engine. Atomic failed transactions and uncertain commits must be
classified from actual evidence; do not guess or replay migrations.

Before implementation, close these decisions in this order:

1. Owner accepts the proposed first **active staff/allactualNULL/validrequest**
   eligibility and current active Admin as the authority to certify it, with
   the stated visibility effect. This is not a new global role framework.
2. Resolve the faithful positive fixture strategy under an explicit bounded
   local read-only selection first; any additional custody change needs a
   concrete separate proposal. No such DB read is authorized by current docs.
3. Review the selected section16 audit/outcome/review/replay and concurrency
   contract, then resolve the positive fixture and exact source/file/SQL scope/
   predecessor/successor before bounded local implementation/test approval.

**Dated Nov2 sequencing, superseded by current section12 for S0:**
Current next execution candidate remains focused S0 under its existing packet,
then A1 publication under refreshed source/rollback gates. The prioritized UM-B
substep can be designed meanwhile. An unresolved UM-B fixture is not a blanket
ban on independently approved A2 corrections; any execution-order change should
be explicit, not silently bundle A2 or broaden this candidate.

This section grants no DB/Auth/fixtures/SQL, further Production access,
publication, package/lockfile/config or archive operation. Preserve all existing
local accounts/passwords/data, parity9, closed UM evidence and immutable027–031.

## 16. Legacy confirmation audit and replay contract

Updated: **2026-11-02**. **CONTRACT DEFINED IN PLAN; SQL/RUNTIME NOT RUN.**
This closes the section15 audit-design choice at the proposal level only.
Owner execution approval, faithful positive fixture and live-local predecessor
checks are still required. No existing A1 code or database contract changes now.

### 16.1 Chosen storage and compatibility

Use **one new private append-only outcome/audit store for this command**.
It records terminal `APPLIED` or `DENIED` for an admitted command; no committed
PENDING row, second success-event copy or new identity/user store. Actual SQL
identifiers and the new forward migration are not created/reserved here.

Keep existing `public.user_authorization_events`, its eight actions, rows,
constraints, ACL and old RPC replay behavior unchanged. It is a success-event
model for old commands, without affiliation/review fields or durable denials.
Changing it into the new outcome model would alter those meanings/consumers.
The dedicated record permits strict payload/replay and durable denial semantics
while preserving the accepted old contracts. This choice adds one bounded
store, not a general workflow/event framework.

| Logical fields / invariant | Selected rule |
|---|---|
| Command identity | Unique current actor UUID + request UUID across this new command's targets; command type/version is explicit |
| Normalized intent | Target UUID, expected role/status, actual/requested IDs, reviewed hierarchy IDs/parents/names/active flags, derived proposed affiliation and trimmed reason; exact key/type/version validation |
| Payload binding | Store full normalized intent plus server-computed versioned SHA-256; compare full intent as well as fingerprint, not only a hash |
| Outcome evidence | APPLIED/DENIED, typed code, observed before/after affiliation and role/status, decision time/actor/reason and request identity |
| Authority history | APPLIED is a new “ยืนยันสังกัด” event at its real recorded time; DENIED is no authority change, never an approval or account rejection |
| Append-only | No UPDATE/DELETE/retention cleanup or credential/token values; profile actor/target references must not cascade-delete records |
| Access | Private/unexposed store, no direct anon/authenticated/service-role table grants; narrow server command/read projections, current active Admin authority checked explicitly |

Require the unique actor/request access path and a bounded target/time/history
index for its actual read projections. Enable RLS on the new private store as
defense in depth without granting client table access. New read projections
are STABLE/read-only; the new mutation is VOLATILE/POST. Do not change old RPC
volatility, grants, schema exposure or Auth settings to implement this choice.

The proposed normalized reason is trimmed, nonempty and at most1000characters;
apply this only to the new command. Versioned server canonicalization must be
fixed/tested before SQL acceptance. The browser need not reproduce PostgreSQL's
JSON text hashing: validate the full echoed normalized intent on first response,
retain the returned fingerprint, and compare it on later outcome reads/replays.
Canonicalize the **submitted reviewed intent** and explicit version, not values
reconstructed from the now-current profile/reference rows. A later affiliation
fill, rename or role change must not make an identical historic replay appear
to have a different payload; current-state checks are separate.
Do not claim a signed/tamper-proof snapshot; current Admin authority and server
state comparison supply authorization, separately from payload identity.

A profile-trigger forward extension is still necessary for the new trusted
action; allow only actual affiliation+updated_at and preserve all old exact
deltas/guards. Old approval/role/status endpoints remain unchanged. Do not write
an old `approved` event or fill old `approved_at/by` to represent confirmation.

### 16.2 Admitted commands, transaction and replay

Basic malformed input, unauthenticated/nonAdmin caller, or a nonexistent target
is rejected before command admission, without a durable new outcome. This also
avoids storing a missing target behind an unconditional profile foreign key.
Do not confuse rejection of that attempt with a verdict on an older UNKNOWN
intent using the same UUID. An existing outcome is immutable in every case.

For a structurally valid request by current active Admin against an existing
target:

1. Derive actor from authenticated identity. Lock actor/target profile rows in
   ascending UUID order, matching current027; recheck current Admin authority.
2. Look up actor/request identity. If found, require exact normalized intent;
   mismatch rejects without overwriting/reclassifying that original outcome.
   Exact replay returns its historic APPLIED or DENIED result, even if target
   is no longer eligible or currently has different values. Recheck actor
   authority, but do not rerun eligibility to defeat a valid replay.
3. For a new intent, compare the reviewed material state with locked current
   state. New eligibility remains active staff/allactualNULL/validrequest.
   Acquire the reviewed organization→department→sector rows explicitly in
   that order using share row locks, then revalidate hierarchy/active flags and
   displayed names. Do not assume a join's planner order or chase new parents
   out of order; changed/missing references cause a typed business denial.
4. On APPLIED, update only the allowed profile delta and insert the structured
   APPLIED outcome in the same transaction. On a defined business denial,
   change no profile fields and insert a terminal DENIED outcome, then return
   it normally. Do not raise a transaction-aborting exception after inserting
   the denial and pretend it was persisted.
5. Unexpected constraint/SQL/timeout/deadlock errors abort the transaction;
   do not catch arbitrary errors after partial work and label them DENIED.
   Verify the actual rollback/commit through acceptance evidence. No automatic
   retry or new UUID. Same-actor duplicate calls serialize through the actor
   lock and unique command key; two Admins also serialize through target locks.

Ordinary reference access is SELECT-only in the inspected source; no live
reference-writer inventory is claimed. Share row locks protect non-key active
flags as well as IDs, but privileged external writers may use another order.
Require relevant writer/lock review and bounded lock/statement timeouts before
SQL; no universal deadlock-free or immediate-revocation guarantee. These lock
and abort choices follow [PostgreSQL17 row locking](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)
and [PostgREST14 transaction semantics](https://docs.postgrest.org/en/v14/references/transactions.html#transaction-end).
Actual POST commit behavior, relevant target config and rollback paths still
need real local tests; no API/config change is authorized now.

### 16.3 Transport, outcome read and UI integration

The new POST returns a **versioned typed envelope** for admitted APPLIED/DENIED
business outcomes. Use normal HTTP2xx for both so a durable business denial is
not coupled to a raised transaction error. No custom response-status override
is required. The client must interpret the envelope, not HTTP success alone.

Envelope binding includes version, actor/request/target, full normalized intent,
server fingerprint, outcome/code, recorded time and replay flag. A separate
error plane handles malformed input, authorization, missing target, payload
reuse and unexpected failures; those responses do not overwrite an existing
outcome or resolve another UNKNOWN command automatically.

**Verified integration requirement:** A1's current handler treats
`!result.error` as success before interpreting data. Future B must introduce a
strict decoder/adapter **before** terminal command classification. Do not plug
this new RPC into the old void-RPC handler unchanged. Keep all nine accepted A1
code/test/mock paths untouched in this planning task; later B client changes
need a separate exact reviewed scope.

| Event | Client/result rule |
|---|---|
| Validation stopped before dispatch | Show the input issue; no submitted UNKNOWN command |
| Valid bound APPLIED envelope | Record historic success once; canonical reread for present profile/page/details |
| Valid bound DENIED envelope | Show business reason/review requirement; no success notice or approval-count change; preserve the recorded denied intent |
| Malformed/unbound response after dispatch, lost response or timeout | UNKNOWN; retain UUID/payload outside closing Sheet/dialog; no automatic replacement/retry |
| UUID with different payload | Reject the new attempt; never relabel the original APPLIED/DENIED/UNKNOWN record |
| Outcome lookup finds immutable result | Validate full binding and use that recorded result; current-state reread is separate |
| Outcome lookup says NOT_RECORDED | No committed row visible now, not proof the old request cannot still run; remain UNKNOWN, same UUID only |
| DENIED replay after target becomes eligible | Return the original DENIED; a new explicit review and new intent are required |

No durable PENDING means an outcome lookup can overtake the original command.
Exact-intent replay enters the same serialized critical section: whichever
valid invocation reaches it first may apply the fixed intent, and later ones
return its immutable outcome. There is no network-arrival-order guarantee.
Never create a new UUID merely because lookup returned no record. Read-only
lookup cannot apply anything; a POST replay can apply the still-uncommitted
intent and therefore needs an explicit Admin action, not a background “check”.
Do not enable another confirmation of that target while its submitted
intent is unresolved. Closing/Cancel after dispatch does not cancel server work.

Read projections have separate purposes: a current review projection, an exact
same-actor/request outcome lookup, and an Admin history projection combining
old events with **APPLIED** new confirmations using distinct source/type IDs.
History is not the reconciliation endpoint because it omits DENIED. All reads
require current active Admin; capability absence disables only the new action,
without fallback to old approval/reactivation or direct private-table access.

Additional mandatory acceptance: HTTP200/DENIED, malformed2xx/binding mismatch,
APPLIED and DENIED replay, concurrent same UUID, payload mismatch, audit insert
failure atomicity, lookup overtaking a delayed write, reference deactivation/
reparenting, and current-authority loss before outcome read/replay. None has
run for this new command. This contract is not evidence that the feature works
or is release-ready, and does not negate historical A1 acceptance.

## 17. Local aggregate-only fixture feasibility packet

**BOUNDED READ COMPLETE — COUNT PASS / POSITIVE FIXTURE HOLD.** Owner later
approved section17's aggregate-only local read. Section17.4 records execution;
the proposed packet below preserves the reviewed scope. Its read authority is
now consumed, with no further Docker/DB/Auth/fixture or implementation grant.

### 17.1 Why count first

No eligible primary synthetic target has been established. The old sanitized
baseline actor registry is absent at its recorded private location; actor UUIDs
were dynamic. Known NULL-scope baseline records also have wrong role/request
shape. Do not reconstruct a registry from credential files or infer permission
from an email prefix/run marker.

Both immutable UM manifests provide123distinct closed fixture UUIDs and one
Owner actor UUID; the existing sanitized local guide/acceptance metadata lists
seven normal local accounts. These are **protection inputs**, not candidate
permission or reason to open a finalized run. Keep those identifiers private.

A nonidentifying whole-result count can establish whether the eligible shape
exists without returning an account or claiming it is synthetic. At packet
preparation it required a new approval; section17.4 records the later approved,
completed read. No second read follows from that completion.

### 17.2 Exact proposed read and output

After that approval only:

1. Verify the existing local Unix Docker context, DB container
   `supabase_db_conduit-boq-local`, expected ID
   `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`
   and matching volume/project. Inspect only identity/mount/socket fields, not
   full environment/secrets. Wrong/stopped/unknown target means HOLD; no start,
   restart, restore or reconfiguration.
2. Use the existing container's `psql`, fixed local postgres DB/role and no
   startup script. One REPEATABLE READ READ ONLY transaction, bounded timeouts,
   same-session database/readonly checks and ROLLBACK; no HTTP/Auth or external
   connection. No key/password file is needed or read.
3. Evaluate only profile role/status, all actual IDs NULL, requested IDs and
   corresponding organization/department/sector parent/active validity.
   Compare known protected IDs and normal-account emails internally solely
   for exclusion; return none of those values. Read no Auth/event/BOQ tables,
   business RPCs, profile names/phones/signatures, or application settings.
4. Output only three scalar counts: **all eligible shape**, **known protected
   eligible matches**, and **remaining eligible shape**. Count the whole
   matching set in that snapshot; no LIMIT/Data API cap or row export.
5. Stop after the result. Remaining0 means no unexcluded shape found/HOLD.
   Remaining>0 proves shape only, not synthetic provenance or permission to
   log in/use/change it. A later exact identity/provenance/custody proposal
   requires its own concrete scope before any fixture is borrowed.

This read covers matching local profile metadata, not only actors already
proved synthetic; the approval wording must say so. It returns no names,
emails, UUIDs, raw rows, keys/tokens or Production data. No login/normal Auth
bookkeeping, fixture creation, account transition, DDL/migration, extra DB/stack,
reset/restore/replay027–031, archive access or publication is included.

### 17.3 Resume and readiness

Record exact local target/transaction/counts and source/protected hashes; no
account identifiers in repo. Failed target/query/readonly checks remain HOLD/
UNKNOWN, no auto broadening or retry into another environment. The current
Production-account read permission is consumed and cannot authorize this or
another project read. Canonical progress stays in section12.

The audit contract is selected **in plan**; the actual zero-count result leaves
the primary fixture on HOLD. A scalar count cannot close positive real-Auth/API
acceptance or grant local implementation. Choose the next bounded fixture
proposal from actual evidence while retaining S0-first/A1 release boundaries.

### 17.4 Approved count result — 2026-11-02

Owner's “ทำต่อครับ” followed the explicit request to execute this existing-local
count-only packet. It approved that bounded read, not new accounts/fixtures,
DDL/SQL implementation, Auth login, BOQ/business RPCs or Production. The task
stopped after the count; no further row lookup or test-user selection occurred.

| Check | Actual result |
|---|---|
| Target | PASS, local Unix Docker socket; exact DB containerID above, project `conduit-boq-local`, named DB volume unchanged/running |
| Successful count interval | HostUTC2026-11-02T10:47:54.325761–10:47:54.392257 (17:47Bangkok) |
| Same-session checks | PASS, postgres DB/current+session role; transaction_read_only=on and repeatable-read isolation gated in the same aggregate SELECT |
| Eligible shape | **0** |
| Known protected eligible matches | **0** |
| Remaining eligible shape | **0**; total=protected+remaining verified |
| Transaction/output | PASS, one successful READONLY transaction,psql exit0/ROLLBACK; only three scalar counts,0identity rows |
| Exclusion inputs |123closed UM IDs+oneOwner ID and seven normal local account emails used privately; NULL-safe boolean classification, no join multiplication or count limit |
| Auth/BOQ/events/business RPCs/writes | NOT RUN / EXCLUDED; no account login/session, data/schema/config/reset/replay or Production operation |
| New UM-B feature / positive fixture | NOT RUN / **HOLD**; zero count is not a feature PASS |

Retained tooling chronology: default sandbox denied Docker socket access before
any DB dispatch. The authorized escalated read-only preflight then passed.
The first psql invocation failed **before connecting** because the private
client command set PGSERVICE to an empty value; no query ran in that attempt.
Corrected only the child client's service environment by unsetting it, retained
the first proof, and used the identical count-query hash against the same exact
container. The successful invocation above executed one read-only transaction.
No container/database config or credential file was changed/read to fix this.

Private proof: `/private/tmp/um-legacy-local-count-5qx2looa/`, including preflight,
initial failure/correction, reviewed private executor and `client02/result.json`.
Do not publish this directory or its private protection inputs. Migration027–031,
parity9, package/lockfile, A1 source and both closed manifests remained unchanged.

**Interpretation:** the full snapshot had no active-staff/allactualNULL/valid
requested-hierarchy shape. This does not mean there are no users in local, and
does not permit changing eligibility, reconstructing the real Production account,
modifying protected accounts, weakening triggers or starting another stack.
Prepare a separately reviewed faithful-fixture/rehearsal plan before any such
scope is considered. **Dated Nov2 sequencing:** S0 was the first separate
implementation candidate at that read;its later bounded completion is recorded
in the current section12/S0 checkpoint. That read supplied no S0 approval.
No further local/Production access,
stage/commit/push/deploy or fixture write is authorized by this closeout.

## 18. UM-B fixture feasibility proposal — 2026-11-06

The November 2 count found zero profiles with the complete active-staff shape.
It did not count inactive or suspended staff with the same affiliation state.
Current signup creates pending staff and normal approval fills the actual
affiliation. The existing Admin reactivation command takes inactive or
suspended profiles to active and leaves role and affiliation fields intact.
It also updates the Admin note and records a reactivation event. That gives a
possible preparation path **if** an eligible disposable synthetic profile
already exists. See the [signup guard and hook](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L1542)
and [transition code](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L2306).

**First proposal for review.** Run one repeatable-read, read-only transaction
on the existing `conduit-boq-local` target after confirming its identity and
matching profile, hierarchy and reactivation metadata. Use only an explicit
inventory of disposable synthetic profiles whose provenance and current
custody can be verified. Operational accounts, the Owner and all finalized UM
and S0 run IDs are excluded. With no verifiable inventory, stop before a query.
Count two disjoint groups within the approved inventory and return only counts:

1. Active staff with all three actual affiliation IDs NULL and a valid requested
   department and sector under an active organization. The organization,
   department and sector must all be active and the links must agree.
2. Inactive or suspended staff with the same actual and requested affiliation
   shape. Keep this count separate because using such a profile requires an
   existing Admin reactivation before the rehearsal can begin.

The read ends with `ROLLBACK`. It supplies candidate feasibility only. A
positive count still needs a separately reviewed exact synthetic target,
proof of its Auth binding and custody, and a bounded rehearsal scope. With
zero matches or uncertain provenance, the existing-local fixture stays on
hold. A normal signup and approval can cover the separate approval regression.

**If the read finds a disposable candidate.** Prefer an already-active match.
For an inactive or suspended match, a later approved rehearsal may use one
ordinary audited `admin_reactivate_user` with its own request UUID and record.
Take the comparison snapshot after that preparation. The confirmation must
preserve the setup audit, Admin note and old approval fields. The profile
shape can match the target case even though its audit history differs. A
successful confirmation consumes this fixture because it fills the missing
fields. Finalize the exact synthetic profile in an approved inactive or
suspended state, close its test sessions and retain its audit and resulting
affiliation. Do not clear affiliation fields to recycle the fixture.

**If there is no candidate.** An isolated, disposable environment seeded only
with synthetic Auth identities, profiles and BOQs is a separate feasibility
option. It needs a reviewed schema-only post-032 baseline with independently
verified post-initialization guards, RLS, grants, Auth hooks and Copy/Save
contracts. Seed the historical shape before initial attachment of the guards,
with application and Data API access closed until contract verification passes.
Use isolated ports, volumes and keys. The older checked-in baseline, current
fixed-port configuration and existing reset/bootstrap runners are unsuitable.
Record schema provenance separately from migration history and review how a
future migration would verify its predecessor on this target. Keep this option
on hold until its inputs and lifecycle are reviewed. See the
[baseline note](../../../supabase/migrations/README.md) and the
[PostgreSQL restore stages](https://www.postgresql.org/docs/current/app-pgrestore.html).

Any eventual positive rehearsal needs real local Auth and API evidence. With
the same staff session, compare owned, assigned, shared-sector and outside-scope
synthetic BOQs before and after confirmation. Verify persisted profile fields,
one confirmation outcome per admitted request, replay and conflict behavior,
direct-write denials and the existing pending approval path. The full acceptance
matrix remains in [section 15.5](#155-positive-fixture-gate-and-required-acceptance).
No local or Production operation, fixture creation or migration replay 027–032
is covered by this planning checkpoint.

## 19. UM-B fixture inventory and schema capture proposal — 2026-11-06

### 19.1 Inventory review

**No reusable inventory could be verified from source and dated receipts.**
The seven original local personas are protected. Earlier parity fixtures
covered authorization cases but the receipt does not identify a disposable
staff profile that can be consumed by UM-B. The old seed and P-49 smoke sources
describe setup and test personas. Neither supplies current custody evidence
for a reusable target. All finalized UM-A1 and S0 runs stay closed. See the
[parity receipt](../../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md) and
[UM-A1 release evidence limits](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md#4-evidence-and-remaining-gates).

The section 18 inventory gate therefore stops before querying account rows.
The November 2 result remains zero active matches on that snapshot. The
inactive or suspended group remains `NOT RUN`. The next proposal evaluates
the isolated synthetic route and does not change the UM-B eligibility rules.

### 19.2 Proposed scope for one catalog capture

The historical parity baseline predates 031 and 032. The later R5 receipt
records a post-032 metadata digest, but the producer kept the current raw
definitions in memory. A digest verifies a known payload and cannot supply the
definitions to build a new target. Obtain one fresh schema-only package from
the existing local database to determine whether an isolated rehearsal is
feasible. See the [R5 local result](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md#r5-desktop-flow-and-cleanup--2026-11-04)
and [metadata producer notes](../security/05-s0-boq-writer-boundary-plan.md#97-fresh-preflight-producer-preparation--2026-11-04).

1. Confirm the existing `conduit-boq-local` project, local Docker Unix socket,
   `supabase_db_conduit-boq-local` container and named volume, database
   `postgres` and expected loopback bindings. Use only narrowly formatted
   identity checks. Stop on a different target, network binding, unknown
   identity or missing container. Avoid full Docker or environment dumps.
2. Prepare a new private copy of the existing `supabase/local/parity-capture.sql`
   catalog projection (current SHA-256
   `198ec2316f1f17e505b71ad32de24c1ce4bb16d315c21faa4eb81a0c4f148577`).
   Preserve the projection. Add fixed statement and lock timeouts and
   same-result database, session role, read-only and isolation checks.
   Record the exact derived query hash before dispatch. Run once with
   `psql -X` and `ON_ERROR_STOP` in a repeatable-read read-only transaction
   ending in `ROLLBACK`.
3. Read only PostgreSQL catalogs for app-owned `public` and `private`
   definitions, constraints, triggers, RLS, grants, roles, default privileges,
   extensions and the app-owned trigger attachments on Auth tables. The capture
   excludes table rows, accounts, BOQ/Catalog/Factor values, credentials and
   migration history. It calls PostgreSQL catalog functions only. No Auth or
   application endpoints belong to this scope.
4. Offline, compare the complete capture to the reviewed parity baseline and
   the known successors. Require the Copy 031 definition, the nine exact 032
   restrictions and all 24 target policies. Compare owners, grants, function
   definitions, trigger attachments and constraints. Document any reviewed
   platform differences. Treat unknown drift, unsupported dependencies or
   sensitive material in a definition as `HOLD` before generating a baseline.
   The portable digest excluding the nine guards alone is insufficient.
5. Keep the raw result in a new restricted local evidence directory. Record
   the exact query and result SHA-256, a stable comparison hash, target/session
   checks, object counts and unexplained differences in the manifest. Report
   a redacted summary in the checkpoint. A successful capture qualifies the
   definitions for review. The isolated environment, synthetic accounts and
   real Auth/API tests each remain `NOT RUN` after this step.

**Decision for the Owner.** Review one catalog-only capture on the existing
local target. Setup or cleanup of an isolated stack, fixture writes, SQL for
the UM-B feature, any application migration and Production work remain separate
decisions. Migrations 027–032 are immutable. The capture and all later fixture
options must avoid replaying them.

### 19.3 Preflight and offline result — 2026-11-06

Owner continued with the catalog-only proposal. The Docker identity check
matched the recorded running local database container and named data volume.
It also found the API host port `55321` and PostgreSQL host port `55322`
published on `0.0.0.0` and `::`. The documented API URL `127.0.0.1:55321` is
the local client destination. It does not establish the host bind address.
The historical S0 source used Docker's local Unix socket and PostgreSQL's Unix
socket inside the container. Historical port bindings were not established by
this inspection. External reachability was not tested. See the
[S0 runner transport](../../../scripts/test-s0-boq-writer-boundary-local.mjs#L151)
and [Docker port publishing](https://docs.docker.com/engine/network/port-publishing/).

The published bindings fail the loopback condition in section 19.2. Status
is `HOLD` before SQL dispatch. The exact alternative under review is to retain
the existing bindings and allow one query through the two local Unix sockets
only, with the target IDs, port mapping and same-result Unix socket evidence
checked. Until that change in scope is agreed, the capture stays `NOT RUN`.
An offline capture packet is prepared under
`/private/tmp/um-b-schema-review-20261106-Asq9NfK9`. Five simulated runner
cases passed for successful capture, binding drift, missing read-only proof,
query hash mismatch and refusal to dispatch a second attempt.

Offline, the frozen snapshot plus the exact Copy 031 text replacement and
nine 032 policies produced the expected 30 relations, 96 routines, 27 app
triggers and 24 policies across the three BOQ tables. The Copy definition
matched `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`.
The materializer accepted this shape in memory. The comparison rejected both
a missing guard and a modified role literal. This is an expected model for
comparison. Live parity and fixture feasibility remain unverified.

### 19.4 Approved Unix socket catalog result — 2026-11-06

The Owner explicitly approved one catalog-only read through the existing local
Unix sockets despite the known Docker port publications in section 19.3.
The runner rechecked the exact local container, volume and mappings before
dispatch. One query completed at 01:41:15 Bangkok in a repeatable-read,
read-only `postgres` session. The returned transport check confirmed a
PostgreSQL Unix socket. The pinned script reached `ROLLBACK` and exited zero.
The one-shot approval is consumed.

The capture contains two app schemas, 30 relations, 96 routines and 27 app
triggers. The offline semantic comparison passed against the frozen baseline
plus exact Copy 031 and the nine 032 policies. The three BOQ tables each have
eight policies. Ordered routine configuration matched. The only accepted
differences were the three previously recorded platform mappings for
extensions, role memberships and role inventory. No unexplained difference or
unsupported object was reported in this projection. An independent file-only
comparator also passed, with 16 offline self-tests and identical expected and
captured normalized SHA-256 `218521b65fc599ac7d1acd8a241dda71dac0c0cbdad1a5d6d323b3abca563795`.
The result qualifies the
captured app metadata as input to review. Building the isolated target and
running Auth/API acceptance remain `NOT RUN`.

Private evidence is under `/private/tmp/um-b-schema-review-20261106-Asq9NfK9`
and `/private/tmp/um-b-review-delivery-20261106-KpS9YR29`. The pinned query SHA-256
is `c11beb574ddcc8f9833ef9b6e6eaa2652f899ee0e4de9db79c03c73dafd318b5`. The raw
capture SHA-256 is `a47a085689739a91d3b854e1573510a32d4ba42383b6c056ef195c5f04c65b47`.
Only catalog definitions and privileges were read. No application table rows,
account or BOQ data, credentials or migration ledger rows were read. The
published-port configuration was left in place and external reachability
was not tested.

## 20. UM-B researched delivery plan — 2026-11-06

### 20.1 International patterns and decisions for this application

| Reference pattern | Decision for UM-B |
|---|---|
| Microsoft Entra separates request review from access delivery. Okta shows request details, activity and a decision field before approval. [Entra review](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-approve) · [Entra delivery](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-process) · [Okta review](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-tasks.htm) | Use one review in the existing A1 details Sheet. Show actual and requested affiliation, the possible addition of shared-sector BOQ visibility and a required reason. Show a successful confirmation after a bound `APPLIED` response or confirmed outcome lookup. Keep canonical reread separate. A queue, multiple approval stages and identity-provider integration are outside this candidate. |
| NIST ABAC evaluates subject, object and action attributes. OWASP calls for server authorization on each request and verifying the transaction data that the user reviewed. [NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) · [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) · [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) | Keep current active Admin as the proposed certifier. Recheck the live actor, target, requested hierarchy and the exact reviewed state under the existing lock-order rules. Use the confirmed sector with existing BOQ policies. Never infer scope from the displayed request or a role claim alone. |
| AWS uses caller-supplied IDs bound to intent and records the ID with the mutation in one transaction. NIST addresses attributable audit records and protection against alteration. [AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) · [NIST SP 800-53 Rev. 5, AU-3/AU-9](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) | Use the private outcome store and typed envelope in section 16. Replay only the same intent and UUID with current Admin authority. Store admitted business denials separately from transport uncertainty. Keep the outcome and exact profile delta atomic and expose history through bounded Admin reads. |
| OWASP organizes authorization tests by role, operation and data. Supabase distinguishes database-level policy tests from application-level tests using the real client. [OWASP authorization testing](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html) · [Supabase testing overview](https://supabase.com/docs/guides/local-development/testing/overview) | Use both SQL-level invariants and real Auth/API acceptance with synthetic rows. Check the same staff session before and after confirmation and read back committed state. Base acceptance on observed permissions, including denials and out-of-scope data. |

An offline bulk backfill would assign access without a verified per-account
decision. A manual database correction would bypass the reviewed workflow and
normal reconciliation. Use one explicit Admin confirmation on an eligible
account. A broader identity-governance workflow can be reconsidered when there
is a defined request for delegation, periodic recertification or transfers.

### 20.2 Work sequence and checkpoints

| Stage | Work and completion evidence |
|---|---|
| 0. Qualify schema source | Complete for the scoped local catalog projection. The approved Unix socket read and offline comparison are recorded in section 19.4. |
| 1. Prove the isolated fixture | **PASS for the baseline on November 14.** See [section 20.17](#2017-l1-isolated-api-baseline-pass--2026-11-14) for the retained disposable target, actual harness isolation, post-031/032 catalog/ACL, eligible L1 profile and exact pre-confirmation BOQ read. |
| 2. Review the implementation | Owner confirms current active Admin as certifier and the possible additional shared-sector visibility. Review exact source, tests and one new forward migration, capability handshake with A1, stored outcome shape and rollback boundaries. Review the Thai copy and desktop/mobile flow in section 20.3 with synthetic data. Preserve ordinary approval and other existing account actions. Keep 027–032 immutable. |
| 3. Build and qualify locally | Verify the permitted profile delta and one atomic outcome. Cover non-Admin and self denial, stale reviewed data, invalid hierarchy, changed status and two Admins racing. Cover same UUID replay, different payload, audit write failure, lost response and read-back. Check owned and assigned BOQ reads, newly eligible shared-sector reads, denied cross-scope access, direct-write denial and normal pending approval. Run focused unit and API tests, real Auth/browser checks, lint, TypeScript and build. Capture the UI acceptance evidence in section 20.3. Retain cleanup and zero unknown intents as explicit evidence. |
| 4. Review and release | Propose a Solo release only after local acceptance. Database-first is a candidate only if compatibility with the existing A1 client and the database-only intermediate state are demonstrated. Review and authorize Production preflight, a single new migration application with exact ledger and policy postflight, then exact source publication with CI, Vercel and anonymous smoke. Keep an action-disabled client rollback and preserve audit. A database or unresolved request issue uses separately reviewed forward recovery. |
| 5. Decide on live use and move to A2 | A real legacy confirmation is a separate deliberate Admin action for the reviewed account. Record the reason and compare the committed outcome and scope. After UM-B closeout, refine A2 as a separate signup, verification and pending-flow release. SMTP delivery and expired-link tests belong to A2. Hosting and SSO remain parked per Owner direction. |

For a pause between stages, retain the commit, input hashes, verified target,
exact approved scope, evidence path and the next decision. Record `PASS`,
`HOLD`, `UNKNOWN` and `NOT RUN` separately. A transport `UNKNOWN` after a write
stops new writes for that intent until exact reconciliation. Published client
rollback does not undo a stored affiliation or remove its audit history.

### 20.3 UI/UX review and acceptance

Use the existing UM-A1 directory and details Sheet. The new action opens a
review mode in that Sheet with the same typography, spacing, buttons and NT
accents as the current Admin and Master Catalog surfaces. The directory keeps
its existing table/card behavior. Use synthetic examples for the design and
rendered review. See the [current details Sheet](../../../app/admin/_components/AdminUserDetailsSheet.tsx#L23)
and [NT design plan](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md).

The review shows the account name, its current status and role, then **สังกัดจริง**
and **สังกัดที่ยื่นขอ**. In an eligible case, the actual affiliation reads
**ยังไม่ได้กำหนด**. Show the exact organization, department and sector that
will be assigned. Put the scope message next to the required **เหตุผลที่ยืนยัน**
field. Match the trimmed 1,000-character limit in section 16.1 and show any
input error next to the field. Suggested copy is **บัญชีนี้อาจเห็น BOQ ที่แชร์ในส่วนงานนี้เพิ่มขึ้น**.
Use **กลับไปดูรายละเอียด** and **ยืนยันสังกัด** as distinct actions. The final
button becomes available after the current data is verified and a reason is
entered. A known ineligible account stays in details mode. When current data
or the new server capability is unavailable, show why confirmation is blocked
and offer a read retry where it can resolve the issue.

| State | What the Admin sees and can do |
|---|---|
| Sending | **กำลังยืนยันสังกัด…** with the target still visible. Prevent a duplicate submission and preserve the command when the Sheet closes. |
| Applied | **ยืนยันสังกัดแล้ว** after a bound committed outcome. Refresh actual affiliation from the server. If that read fails, show **ยืนยันสังกัดแล้ว แต่ยังโหลดข้อมูลล่าสุดไม่ได้** with a read retry. |
| Stale or denied | Explain the specific reason in Thai. For a changed profile or hierarchy, offer **โหลดข้อมูลล่าสุด** and require a fresh review. Keep the old command's result distinct from any later intent. |
| Unknown after dispatch | **ยังตรวจผลการยืนยันไม่ได้** stays visible for this account when the Sheet is reopened. **ตรวจผลคำสั่ง** performs a read using the original request ID. Any permitted resend of that exact intent is a separate deliberate action. |

Define how the unresolved intent survives reload and stays bound to its
original Admin before approving implementation. The current A1 in-memory
ledger clears on disposal or actor change. For UM-B, a fresh profile read
alone must never unlock a new confirmation for a target with an unresolved
intent. Acceptance covers closing and reopening the Sheet, reloading and
switching Admin without showing another Admin's unresolved request. See the
[A1 command lifecycle](../../../lib/admin/users/directory.ts#L301).

Before implementation, review the flow and copy at desktop and mobile sizes.
For local acceptance, capture the existing A1 view and the rendered review
at 1440 and 390 CSS pixels and verify reflow at 320 CSS pixels. Test long Thai
hierarchy names, readable status text without relying on color and actions that
stay reachable with the mobile keyboard open. Match the existing 44 CSS pixel
touch controls. With keyboard only, focus the review heading first, keep Tab
navigation inside the open Sheet and restore focus to the invoking control or
a logical fallback on close. Enter in the reason field adds a line. Closing
before submit leaves the account untouched. Verify that a screen reader announces
progress and outcome messages without moving focus away from the task. Check
the normal, changed-data, unknown and applied-with-refresh-failure states in
the browser. See [W3C dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
[WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
and [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

The separate UM-A2 draft at this checkpoint covered signup, verification,
resend and pending screens. The [current UM-A2 review](#23-um-a2-implementation-review)
records the narrower scope and its acceptance checks.

### 20.4 Private review packet — 2026-11-06

The Owner approved the one-shot catalog read and private preparations. The
first design draft approximated the directory and one details Sheet, with synthetic
records and local-only state. The three scenario controls show ready to confirm,
changed data and an unknown outcome. The ready scenario also demonstrates a
simulated success. The unknown scenario's check is a read-only simulation.

Chrome with its normal sandbox passed 11 checks on the standalone HTML at
1440×900, 390×844 and 320×740. The desktop and mobile flow checks include the
required reason, stale refresh and review, and unknown outcome on Sheet reopen.
Desktop keyboard focus returned to the initiating control. The page loaded
only the local file and the runner recorded no page errors or warnings. This
was mock UI verification. The mock falls back to a local Thai font when IBM
Plex Sans Thai is unavailable. A live screen-reader run, a physical mobile
keyboard and actual app and Auth acceptance are still `NOT RUN`.

Review `final-design/index.html` and `final-design/verification.json` in the
private delivery directory named in section 19.4. The desktop and mobile
captures are in the same directory. The `isolated-test-plan.md` proposal
defines target separation, phased scope, synthetic data and session ceilings,
acceptance and teardown. Review the setup packet with concrete target, image,
port and fixture pins before authorizing a new stack. The certifier and the
shared-sector BOQ visibility consequence still need the Owner's decision before
implementation. The design draft and successful catalog read do not authorize
stack setup, migration or product changes.

### 20.5 Master Catalog visual alignment — 2026-11-06

The Owner identified Master Catalog as the visual reference for the current
application. The first mock reproduced the directory by hand and introduced
a dark scenario bar, a compressed Master Catalog card and different account
status styling. It also used the machine's Thai font fallback. Keep the first
mock as dated evidence and review the source-based revision for appearance.

The revision renders the checked-in A1 directory and account detail content
with the shared Sheet, Card, Button, Badge and Alert components. The preview
copies the Master Catalog entry from the A1 source and uses the exact CSS and
local IBM Plex Sans Thai assets from the qualified A1 build. The desktop table,
mobile cards, NT header rule and action styling follow the existing components.
The UM-B work is limited to the new action and its review and outcome views in
the same Sheet. Test scenarios open as separate private files.

Review `index.html`, `review.html`, `stale.html` and `unknown.html` in
`/private/tmp/um-b-design-fidelity-20261106-VgcXog9E`. The asset and source
manifests in that directory record the build provenance. The
`qa-run-qkb7AZ/verification.json` receipt and eight screenshots record
desktop 1280×900 and mobile 390×844 with no horizontal overflow, three
loaded Thai font faces per view and no disallowed page requests. On desktop,
mouse click and Enter opened the existing details Sheet, Tab stayed inside,
and Escape restored focus. The simulated confirmation required a reason and
showed the confirmed state. Earlier harness attempts remain in separate
receipts. Physical mobile input, a screen reader and the actual app and Auth
acceptance remain `NOT RUN`. This work changed only the private draft and
this plan.

### 20.6 First-round readiness and isolated Docker review — 2026-11-06

**Ready for Owner scope review and offline setup preparation. Implementation
and runtime acceptance are on hold.** The [catalog comparison](#194-approved-unix-socket-catalog-result--2026-11-06)
passed for the scoped app metadata after 031/032, and the revised design
passed standalone mock checks. A deployable schema-only baseline, new Docker
target, faithful legacy fixture and real Auth/API/browser acceptance remain
`NOT RUN`. The earlier one-shot catalog permission was consumed. Review uses
its saved metadata and the current source at `a588bfe`.

**Owner decision now.** Confirm the existing active Admin as certifier for
an active staff account whose actual organization, department and sector are
all unset, with a valid requested hierarchy that the Admin has verified.
Accept that confirmed affiliation can add shared-sector BOQ visibility under
the existing rules. Use the revised Master Catalog-style review with one
required reason. The [first candidate](#152-narrow-first-candidate-and-impact)
covers this exact request. Admin assignment to a different affiliation,
resubmission by an active user, transfers, UM-A2 and SSO have separate scopes.

| Order | Proposed work and gate |
|---|---|
| 1. Review setup files offline | Prepare an isolated setup manifest from the saved catalog proof. Pin the new project/run, Docker Engine/context and image digests, container/network/volume identities, loopback-only app/API ports, internal DB access, fresh keys and test origins. Include dependency order, provisioner, baseline/seed/checker hashes, stop and teardown rules. Verify ingress and restrict egress from app, browser and services. Keep the existing Docker target outside the allowlist. The old bootstrap and parity CLI are outside this route. Exact setup inputs remain open. See [Docker port publishing](https://docs.docker.com/engine/network/port-publishing/#publishing-ports). |
| 2. Qualify the isolated predecessor and fixture | After setup approval, initialize only the new resources. Provision genuine synthetic Auth identities through the reviewed internal bootstrap path and seed the legacy profile shape before initial app guard attachment, with app and normal Data API access closed. Verify the complete relevant guard/hook, constraint, grant/RLS and Save/Copy contract before opening the test routes. Compare actual post-init definitions, including Copy 031 and nine exact 032 guards. Prove that an eligible synthetic account can sign in and that its persisted profile has all actual IDs NULL and a coherent valid request. Record schema provenance separately from migration history. Preserve 027–032 and all existing stacks and records. |
| 3. Review the exact implementation | Once the isolated fixture is proven, review a small allowlist covering the existing Admin details Sheet, the new command adapter, focused tests and one forward migration. Close the reviewed snapshot and normalization rules, relevant reference writers and lock/timeouts, capability detection, versioned outcome decoding and same-actor unresolved-intent recovery across reload. The [transaction and outcome contract](#16-legacy-confirmation-audit-and-replay-contract) governs the one permitted profile delta and atomic private audit. Select exact paths, predecessor/successor assertions and hashes before any migration is applied. |
| 4. Apply once and qualify on the isolated target | After approval of the candidate and exact target, verify predecessor again, apply only the new migration once and verify the expected schema delta. Run the acceptance below against the same target. Setup and implementation grants are separate. |

The private Docker proposal at
`/private/tmp/um-b-review-delivery-20261106-KpS9YR29/isolated-test-plan.md`
sets review ceilings of 13 synthetic identities, 12 cumulative sessions and
5 BOQs / 5 routes / 5 items, with at most 24 terminal outcomes including at
most three `APPLIED`. Pin exact cases and expected writes in the execution
manifest. Provisioning and failure injection are limited to the disposable
environment and use reviewed mechanisms that preserve the product guards.

Local acceptance must show the same synthetic staff session before and after
confirmation. Owned/assigned reads remain, eligible shared-sector reads appear
and outside-scope reads remain denied. Read back that only the three actual
affiliation IDs and `updated_at` changed, with one committed audit outcome.
Check stale review, unauthorized actor, invalid hierarchy, direct writes,
concurrent Admins, replay/payload mismatch and atomic rollback. Exercise
ordinary pending approval and the S0 BOQ write boundary. Check real Auth/Data
API/browser, Node 24 tests, lint, TypeScript, default Turbopack build, and the
existing Sheet's desktop/mobile and keyboard behavior.

If target identity, parity, fixture or expected writes fail, stop and retain
evidence. If a dispatched write is `UNKNOWN`, stop writes, retain its exact
intent and reconcile by outcome read before disposing of evidence. On a settled
run, close its sessions, verify zero residue and remove only its approved
disposable resources. Record results and limits in the resume checkpoint.
This review authorizes no setup, app or database change, Production access,
migration replay or publication.

### 20.7 Owner scope and offline Docker review packet — 2026-11-08

The Owner approved first-round UM-B scope and offline preparation only. A
current active Admin may certify the valid existing request for an active staff
account whose three actual affiliation IDs are unset. The review includes the
possible gain in shared-sector BOQ visibility and one required reason. Setup,
app implementation, database work and publication are separate approvals.

The private packet is at `/private/tmp/um-b-offline-docker-20261108-OB1M7wm3`.
Start with `REVIEW.md`. The setup and fixture review manifests identify the
proposed new project, services, resources, loopback ports and synthetic-only
caps. The two app-schema SQL review files were rendered deterministically
from the pinned section 19.4 capture. The independent file-only verifier
passed 36 checks on inputs, exact definitions, the fixture model and setup
limits, including all 24 BOQ policies and the nine 032 writer guards. The
`SHA256SUMS` file is pinned at
`1a5661dccf9099a3e3dc98ab5b86b80ba568b56cee7442263abb4a480c942c01`.
The fixture model expects the same staff session to read two of five BOQs
before confirmation and three after it. Real Auth and RLS behavior remain
`NOT RUN`.

Before setup, confirm Docker Engine/context, exact local image IDs and
repository digests, architecture and port/resource availability. Review native
Auth bootstrap and platform roles, exact service configuration, installation
and synthetic provisioning files, independent parity verification and
project-scoped cleanup. The scoped catalog covers app definitions. Its
offline rendering does not qualify native Auth, a runnable Compose setup or
post-initialization parity. Submit the exact setup packet for approval before
creating any resources. Keep the source capture and 027–032 immutable.

### 20.8 Local Docker metadata and configuration review — 2026-11-08

The Owner authorized a read-only local Docker check and a configuration review
packet. At 12:04:24 Bangkok, the Unix socket for `desktop-linux` identified
Docker Desktop Engine 29.8.0 on Linux arm64. Compose reported 5.5.1. Four
existing image tags and their registry digest references resolved to the same
local image IDs. The host TCP and Docker publication inventories showed ports
3041 and 55481 free, with no matching resource names or project labels.
Availability is a point-in-time result. Recheck it before any future setup.

The packet at `/private/tmp/um-b-docker-final-20261108-OupvGnKa` starts with
`REVIEW.md`. It includes exact digest-pinned Compose and Kong configuration,
native password and synthetic domain review SQL, host metadata and a review
lock that binds the previous schema and fixture artifacts. Compose schema
validation and 19 independent static checks passed. `SHA256SUMS` is pinned at
`f361dff24be2d54cea12d6ddef7b00700b0f3f3a5528dc93dbff4dc67f4ef223`.
Docker runtime, Auth/API and any SQL execution remain `NOT RUN`.

Setup remains on hold before resource creation. The next execution proposal
needs explicit ingress and egress enforcement and proof, verified native
bootstrap and role privileges, exact synthetic provisioning and cleanup
inputs, and fresh approval for the disposable target. Disabling masquerade in
the reviewed ingress bridge is not egress proof. Keep browser and offline
font/build qualification separate from the initial API-only fixture check.
The review did not pull images, create resources, connect to either database,
alter app source, replay 027–032 or publish anything.

### 20.9 Isolation and native Auth bootstrap review — 2026-11-08

The Owner requested an offline egress and fixture bootstrap packet for review.
The API-only candidate uses one IPv4 internal bridge in isolated mode and no
published ports. It keeps the same four locally verified digests and uses
the Docker Desktop Unix socket for a bounded stdio request to the verified
Auth container. The exact transport sends native Auth Admin requests only
to container loopback and later ordinary API requests only to the internal
Gateway. The prior ingress bridge is absent. Web and browser proof have a
separate outbound allowlist gate.

The private packet is at `/private/tmp/um-b-isolation-bootstrap-20261108-bZcDzqJa`.
Start with `REVIEW.md`. It includes Compose, the bounded transport and network
checks, native preflight and readback SQL, a synthetic seed renderer and an
order-sensitive parity comparator. The seed sample contains fabricated Auth
UUIDs. The proposed setup binds only Auth-returned UUIDs for 12 synthetic
identities, loads five isolated BOQ graphs, attaches the captured app guards
once and verifies the predecessor after 031/032. The first API proof permits
one L1 password session and requires an exact local logout and zero remaining
sessions and refresh tokens. Pending signup and UM-B confirmation belong to
later tests. `SHA256SUMS` is pinned at
`7b9f1b2f13757c59a4b7ecc3f56eebe1fa4f2c0d6fd7202e5d7bb50f4860f2ed`.

Compose validation and 15 offline tests passed. The candidate requires fresh
target and image checks, actual network/namespace and stdio proof, native role
privileges, exact catalog parity, persisted fixture readback and explicit
approval before setup. Runtime, Auth/API, SQL and cleanup remain `NOT RUN`.
This work wrote only private review files and this plan. The exact request,
actor and effects must be reconciled on UNKNOWN before further writes or
cleanup. Keep 027–032 and the existing local and Production targets out of
the setup scope.

### 20.10 API-only bootstrap held at egress — 2026-11-08

The Owner authorized this API-only run on the new disposable project. Fresh
Docker context, local image/digest, source and resource preflight passed. The
native DB started on the new volume. An initial runner check incorrectly
required the process name to be `postgres`. The same isolated DB was
restarted after a settled stop. Its fresh PID 1 log and Unix-socket readiness
both passed, and the original probe showed the packaged `.postgres-wrapp`
name. A continuation-script import error occurred before dispatch and was
corrected without touching Docker.

The exact DB/Auth target reached the reserved-address canary after network
membership, zero published ports and namespace route checks. The canary
failed to report the required `ENETUNREACH`. A same-target, no-provision
diagnostic reproduced exit 1 with empty stdout and stderr, so the result
remains `HOLD`. The run dispatched zero app SQL, native Auth requests,
account creations or L1 logins. L1 logout had no session to close. Native
permission, app catalog parity and real fixture/API acceptance remain
`NOT RUN`. There is no unresolved Auth or SQL write.

The private evidence is at `/private/tmp/um-b-api-bootstrap-20261108-7y7gma8s`.
`closeout.json` SHA-256 is
`21f8926483bedd7e239b750db8cd375267f31997c2f55c7b70eca2376c21749c`.
Postflight verified both exact DB/Auth containers stopped cleanly, no REST
or Gateway container, no published ports and zero active network members.
The isolated native volume is retained. Existing local and Production
targets, app source and 027–032 were outside all runtime actions.

Before resuming, review a replacement read-only canary that reports a
kernel route result. The proposed `/bin/busybox ip route get 192.0.2.1`
requires explicit `Network unreachable` from the same verified Auth
namespace, after repeating identity, route and port guards. BusyBox's route
lookup uses a kernel route request, so this proposal sends no IP packet to
the reserved address. Require a positive lookup to the exact internal peer
as well. Missing applet, timeout, ambiguous output or any usable route
keeps HOLD. Retain the original nc evidence and obtain approval for the
replacement check before provisioning. [BusyBox route lookup](https://github.com/mirror/busybox/blob/master/networking/libiproute/iproute.c#L912)

### 20.11 Route lookup passed, native extension hold — 2026-11-08

The Owner approved the replacement route lookup and conditional API-only
continuation on the exact retained isolated DB/Auth containers. Fresh local
context, image digests, source, resource identity and mounts passed. The
Auth namespace's positive kernel lookup selected the verified DB peer on
the connected interface. The approved reserved lookup returned exit 2 and
`ip: RTNETLINK answers: Network unreachable`. Namespace routes, peer DNS,
zero published ports and native DB readiness passed. GoTrue 2.190.0 passed
the internal health check.

The read-only native database preflight then held because the disposable
database did not have `pg_net` 0.20.3 installed in `extensions`, as required
by the post-032 reference. The other native preflight assertions matched the
reference in an offline comparison of the observed result. Available
extension versions and preload configuration have not been checked. Auth
counts were zero for users, identities, sessions and refresh tokens. App
SQL, 12-account provisioning and the L1 proof were not dispatched. There
are no unknown writes. Both isolated containers stopped cleanly, the
network has zero active members and the disposable volume is retained.

Evidence is at `/private/tmp/um-b-api-route-resume-20261108-T4Q38ICD`.
`closeout.json` SHA-256 is
`cf8a6d4a3c430b98402672a08d9d304520e29f63f16ea573fb2a335c16ef6482`.
The proposed next scope is one read-only isolated check using
`pg-net-availability.review.sql` after approval. Verify whether the pinned
image supplies the exact version and preload requirements before proposing
any isolated change. No extension installation, fallback version, preload
change or relaxation of parity follows from this stopped run. Keep the
existing local and Production targets, app source and 027–032 out of scope.
See [available extension metadata](https://www.postgresql.org/docs/17/view-pg-available-extension-versions.html)
and [pg_net setup](https://github.com/supabase/pg_net#installation).

### 20.12 pg_net-only exception passed, app pre-data hold — 2026-11-08

The Owner approved a read-only dependency audit and the exact missing
`pg_net` exception for this disposable API-only continuation. The pinned
audit covered 148 tracked source files, 96 captured routines, 27 triggers,
30 relations and the bounded test path. It found no references or dynamic
dispatch that depends on `pg_net` in this scope. Earlier parity evidence
records the local-only extension. The isolated gate accepts only the missing
reference entry `pg_net` 0.20.3 in `extensions`, owned by `supabase_admin`.
The raw comparator and its observed data stay intact. Six offline tests
passed, including rejection of another extension difference, ACL drift,
Copy 031, S0 032 and routine configuration order changes.

An initial private runner transcribed a truncated network ID and held before
dispatch. A read-only check matched the full ID. The replacement reads that
ID from the pinned receipt and verified the exact retained resources. Fresh
egress, native Auth health and native preflight passed, with only the
approved `pg_net` exception. The first app pre-data transaction then failed
on missing `supabase_functions_admin`. The renderer references that role
at line 10 of the pre-data file as part of a broad default privilege revoke.
The pinned DDL uses one transaction. `psql` exited 3 with ON_ERROR_STOP and
the transaction rolled back. An independent catalog readback after rollback
is `NOT RUN`. No synthetic Auth request or L1 login was dispatched.

The captured app-owned definitions, ACLs and default privileges contain no
reference to that role. It is a known platform-only role in the earlier
local comparison. The native preflight checked selected roles and missed
this broader renderer dependency. Review the full role/membership inventory
on the same isolated volume before a new rendering decision. Do not assume
that this was the only role gap. No other exception, role creation or grant
change was approved. Keep 031/032 and the app ACL/RLS checks exact.

Both containers stopped cleanly with no published ports and zero active
network members. The isolated volume is retained and no unknown write
remains. The private evidence is at
`/private/tmp/um-b-api-pgnet-exception-20261108-TV8dsYxR/qualified-sX7OujjU`.
`closeout.json` SHA-256 is
`538088bbb696ecef7c6408d0b66017022552bf9a630a28632ef1d06808186284`.
The unexecuted `role-inventory.review.sql` proposes a read-only check for
role attributes, memberships and absence of app tables. Existing local and
Production targets and migration files 027–032 remain outside scope.

### 20.13 Isolated role inventory and renderer adjustment plan — 2026-11-08

The Owner approved one read-only dispatch of the pinned role inventory SQL
on the existing isolated DB. At 13:07:16 Bangkok, the exact DB Unix socket
returned no `public.user_profiles` or `public.boq` table and zero Auth users,
sessions or refresh tokens. These checks corroborate the recorded pre-data
transaction rollback. A full post-rollback catalog read remains `NOT RUN`.
Auth stayed stopped. The DB stopped cleanly afterward and the isolated
network had zero active members. The isolated volume is retained.

The app role and membership projection used the same seeds and closure as
the pinned capture. It found 15 roles and 21 memberships, compared with
17 and 23. The two absent roles are `supabase_functions_admin` and
`supabase_realtime_admin`. The two absent edges are `postgres` membership
in each role with grantor `supabase_admin`, ADMIN false, INHERIT true and
SET true. There were no additional or changed rows in the projected roles
or edges. Both roles are absent from the full observed inventory as well.
The app-owned ACL, owners and RLS reference contains neither name. Earlier
local parity records these as platform-only differences.

The proposed change uses a new private renderer copy with an exact isolated
inventory gate. After approval, remove only the two verified absent names
from broad revoke recipient lists in both phases, retain PUBLIC and all
actual required principals, and preserve every grant, grantor, option,
owner, app definition and RLS/031/032 clause. Confirm the pre-existing
schema and default ACLs on the target before any future apply. Fail on
unexpected principals or membership changes. The catalog gate must retain
the raw comparison and allow only explicitly approved platform differences.
No renderer, role, membership or permission changed in this review.

The private packet is at `/private/tmp/um-b-role-inventory-20261108-HEMLxvSd`.
`renderer-adjustment-plan.md` SHA-256 is
`f44be74ef79b5e9e36699ae7bce413e1060f99d05f9083c2a0c5b62eaa7a3932`.
The one-read `closeout.json` SHA-256 is
`d178af9eacd4909d6cbe45b17267615995a4e1bd5d2a601e2d7b964b139a5091`.
The role query grant was consumed. A private renderer patch and later
runtime execution each need separate scope. Preserve existing local and
Production targets and migration files 027–032.

### 20.14 Private isolated renderer offline result — 2026-11-08

The Owner approved a private isolated renderer copy and offline checks only.
The optional isolated path binds the pinned role evidence and omits only
`supabase_functions_admin` and `supabase_realtime_admin` from the recipients
of `REVOKE ALL PRIVILEGES`. Default output is byte-identical to the original.
The repository renderer and all source inputs remain unchanged.

The independent comparison verified exactly 24 pre-data and 474 post-data
revoke lines changed. Every other byte matched, including GRANT and grantor
semantics, owners, constraints, triggers, Copy 031 and nine S0 032 writer
policies. Both SQL review outputs are deterministic. Seven Node 24 offline
tests passed, including rejected exclusions of app roles, another absent
role, present excluded role, additional membership and changed membership
flags or grantor. The saved role projection was independently reproducible.

The packet is at `/private/tmp/um-b-renderer-patch-20261108-gzSNZCai`.
Start with `REVIEW.md`. `SHA256SUMS` SHA-256 is
`9e63ae0d3e2ac74f0ce31b7b54ec7f988eb1098a2743b402cb53cb6127b8362d`.
The next gate is a reviewed read-only check of current role/membership and
pre-existing schema/default ACLs on the exact isolated volume. A later
apply needs its own authorization and exact app catalog verification.
SQL execution, role creation, permission or DB changes, Auth/API and
Production access were outside this offline scope.

### 20.15 Isolated ACL read-only query hold — 2026-11-08

The Owner approved one read-only dispatch for role/membership, schema ACLs
and default ACLs on the exact isolated DB. Target and volume checks passed.
Auth stayed stopped. At 13:24:32 Bangkok the query ran through the isolated
Unix socket in a repeatable-read read-only transaction and exited 3 with
`ACL arrays must be one-dimensional`. The query passed an empty ACL array
directly to `aclexplode`, including the branch for an absent schema. No
catalog result was returned, so the fresh role and ACL gate remains HOLD.
Both DB and Auth were verified stopped with zero active network members.
No schema, default privileges or roles changed.

The one-shot authorization is consumed. The failed source and receipt are
preserved in `/private/tmp/um-b-schema-acl-preflight-20261108-dOnM2M3c`.
`closeout.json` SHA-256 is
`1d6756ef966418c604f22295c7e70582ee48b8153aeae7c03965a795854117db`.
The corrected review file `acl-preflight-v2.review.sql` SHA-256 is
`1e6d04c23dfd925c98e1f2c9caec05a71c33fb974ead217e19d61bd2ca4e4e62`.
It normalizes empty arrays to NULL at the three `aclexplode` call sites,
retaining the original read-only transaction and result scope. The
correction was checked by file diff only and remains `NOT RUN`. A new
approval is required for one replacement read. API-only execution planning
remains gated on a valid ACL receipt. Pre/post-data, existing databases and
Production remain outside the read scope.

### 20.16 Isolated ACL v2 read passed, coverage HOLD — 2026-11-08

The Owner approved one dispatch of the exact v2 file on the existing
isolated Docker DB. The target check passed. At 13:29:45 Bangkok the query
returned one catalog result through the Unix socket under repeatable-read,
read-only transaction framing with `ROLLBACK`. The inventory matched all
29 roles and 21 memberships. `public` schema coverage passed and `private`
remains absent. The gate evaluated six explicit default ACL scopes and 15
built-in global scopes.

Overall pre-apply coverage is **HOLD**. Three explicit `supabase_admin`
default ACLs in `public` fall outside the reviewed renderer's managed scopes:
tables (`r`), sequences (`S`) and functions (`f`). Each grants defaults to
`postgres`, `anon`, `authenticated` and `service_role` without grant options.
This is a comparison of defaults for future objects created by that role.
The read does not establish any drift in effective privileges on app objects.
Resolve the exact scope against the reviewed schema capture before considering
any change to the renderer or a later apply.

The one-shot grant is consumed. DB and Auth were verified stopped with no
active isolated network members. No further SQL was dispatched. API-only
planning stays gated. No pre/post-data, Auth/fixtures, account or BOQ reads,
migration replay, existing local DB access or Production access occurred.
Private evidence is in `/private/tmp/um-b-schema-acl-v2-20261108-DEFzvVkX`.
`closeout.json` SHA-256 is
`bd99ccb77804a82448485bb60caebed8c54d136876e7db84840a03f4f75bcd4d`.
`acl-comparison.json` SHA-256 is
`d4bb3e89e5433a0239056d2e399934a82d1acdff70cff85801abcb93e38f5704`.

### 20.17 L1 isolated API baseline PASS — 2026-11-14

**PASS for the starting fixture and pre-confirmation visibility.** The later
API-only continuation verified the final post-031/032 app catalog and ACLs,
12 synthetic Auth identities, 11 profiles and five BOQ/route/item graphs.
Its original summary held the HTTP 200 BOQ result without an exact row-set
verdict. The focused L1 run settled that missing check on the same isolated
project and retained volume, `conduit-boq-um-b-20261108-r1`.

| Check | Verified result |
|---|---|
| Preflight | Exact isolated Docker target, platform ACL and app catalog, eligible L1 profile, synthetic fixture and zero prior sessions/tokens passed. L1 is active staff with all three actual affiliation IDs unset and a valid requested hierarchy. |
| Auth and profile | Across both attempts, one native password update for synthetic L1 (`200`), one login (`200`) and one profile read (`200`). Account readback and the scoped profile comparison passed. |
| BOQ Data API | One read (`200`) returned exactly B01 (owned) and B02 (assigned). B03 (same requested sector), B04 (other sector) and B05 (outside organization) were absent. The runner recorded the exact set verdict before cleanup. |
| Cleanup | One exact local logout (`204`), followed by 0 sessions / 0 refresh tokens. All four services verified stopped, with zero active network members. PostgREST reported exit 255 during shutdown. The cause of that code was not established. |

The first attempt stopped before opening Auth when Python 3.9 rejected a valid
five-digit fractional timestamp. The private successor corrected timestamp
parsing, verified the first attempt's DB-only start/stop and reran preflight.
There was no additional Auth or business API dispatch. The L1 grant is consumed.
The existing local database and Production were outside both attempts. No app
change, SQL write, migration replay or publication took place. The isolated
volume remains stopped and retained; its synthetic password update and normal
Auth bookkeeping belong to this test run.

Private evidence is in `/private/tmp/um-b-l1-r2-run-20261114`.
`verified-summary.json` SHA-256 is
`a1cc65d7e2c16555565bb450660224216d003deabc52b7808205fb38a928073e`.
`result.json` SHA-256 is
`36d725796ccbef5f2d5fa771820da70369ff1003ed28c32bfeb618dff175ca3a`.
The first HOLD receipt is `/private/tmp/um-b-l1-approve-20261114-01/result.json`
(SHA-256 `42b45da5cdc3c7588509caa0ed6a6cf79b4bb076d90c646656daac5e4c24a4c5`).
The earlier [existing-local count](#174-approved-count-result--2026-11-02)
and [ACL coverage HOLD](#2016-isolated-acl-v2-read-passed-coverage-hold--2026-11-08)
remain dated evidence for their own stages.

### 20.18 First-round implementation and test review — 2026-11-14

**Ready to start the first local source candidate after Owner approval.** The
isolated L1 baseline closes the fixture prerequisite. The new command, its
forward migration, post-confirmation access, live UI and release acceptance
remain `NOT RUN`. The [scope approved for planning](#207-owner-scope-and-offline-docker-review-packet--2026-11-08)
still applies.

#### Proposed source boundary

1. A current active Admin confirms the valid existing request of a different
   active staff account whose actual org/department/sector are all unset. The
   account keeps its UUID, role, status, credentials, existing sessions and
   original approval fields. The command sets only the three actual affiliation
   IDs and `updated_at` on the profile. The Admin reviews the potential gain
   in shared-sector BOQ visibility. BOQ records and write policies stay intact.
2. Prepare one new forward migration under `migrations/` for the narrow profile
   guard extension, one private append-only outcome store and the bounded
   Admin review, confirmation, outcome and history functions in
   [section 16](#16-legacy-confirmation-audit-and-replay-contract). Keep existing
   RPCs and audit rows and preserve 027–032. Freeze the reviewed snapshot,
   typed response, current authority checks, compatible reference locks and
   bounded timeouts. Apply the profile change and its `APPLIED` outcome in one
   transaction; enforce exact actor/request UUID and payload binding.
3. Integrate with the [Admin page](../../../app/admin/page.tsx) and its
   [existing details Sheet](../../../app/admin/_components/AdminUserDetailsSheet.tsx),
   using a dedicated typed adapter under `lib/admin/users/` and focused tests.
   Keep Master Catalog styling and use one required trimmed reason (maximum
   1,000 characters). Show actual versus requested affiliation, the change in
   visibility and the current status. Absence of the new capability disables
   only confirmation. A bound `DENIED` response can be HTTP 200. Separate
   applied, stale and unknown states. Freeze how the same Admin can recover an
   unresolved intent after reload, which fields are retained and when they are
   cleared. Use the original UUID to inspect the result; any exact resend needs
   an explicit action. The [UI acceptance](#203-uiux-review-and-acceptance)
   governs copy, responsive behavior and focus.

The exact allowlist, filename, predecessor/successor assertions and test
inputs are review outputs of the source candidate. This round leaves ordinary
A1 approval paths in place. General affiliation assignment, correction to a
different requested hierarchy, transfers, batch repair, role changes, A2, SSO,
sitewide styling, package/lockfile changes and Production are outside scope.

#### Proposed local qualification after candidate review

| Order | Test and acceptance |
|---|---|
| 1. Verify isolated predecessor | Reuse the retained synthetic-only target if exact services, volume, isolation, post-031/032 metadata, L1 eligibility and zero sessions/tokens still match. Review the exact session budget, credential lifecycle, fault injection and browser ingress before runtime. Add no identities or rows by default. Review any additional fixture needed for a negative case before using it. |
| 2. Apply the reviewed candidate once | After explicit approval for the target and exact file, apply only the new forward migration on isolated Docker. Check the expected DB delta and rollback on forced mid-command failure. Check that the existing A1 client still works against the migrated DB, and that the B client hides/disables its action against the predecessor. |
| 3. Prove the positive case | Use the same L1 staff session to read exactly B01/B02 before confirmation and B01/B02/B03 after an active synthetic Admin confirms once. B04/B05 stay hidden. Verify the three profile IDs and timestamp, one committed `APPLIED` outcome, unchanged requested and old approval data, unchanged BOQ graphs and unchanged write scope. Refresh the L1 profile normally in the same session. |
| 4. Prove denials and recovery | Use synthetic actors for unauthenticated, nonactive/non-Admin, self, wrong target and stale profile/hierarchy checks. Exercise two Admins racing, same UUID with same and different payloads, current authority loss, durable `DENIED`, direct profile write denial, malformed response, lost response and exact outcome read after reload. Verify that a failed audit write rolls back the profile change. Exercise existing pending approval and S0 staff/procurement write limits. Use source/predicate evidence for states that supported fixtures cannot represent. |
| 5. Verify UI and quality | Check the real Admin Sheet at 1440/390 px and reflow at 320 px, Thai text and existing fonts, keyboard/focus, accessible status, confirmation, changed data, unknown and applied-but-refresh-failed screens. Run focused tests, lint, TypeScript and default Turbopack build on Node 24. |
| 6. Close the test run | Retain exact receipts by case. Close only test sessions, verify 0 sessions / 0 refresh tokens and no unresolved intents in a settled run, then verify isolated services stopped. Stop on preflight drift. If a write result is `UNKNOWN`, stop further writes and reconcile the exact intent before continuing. Preserve the volume and evidence for review. |

The Owner's next decision is whether to start this local source candidate.
The candidate and its exact isolated runtime scope return for review before
any application of the new migration or synthetic mutation. The present
checkpoint changes the plan only. Release and any real-account confirmation
remain later, separate decisions.

### 20.19 Local first-round qualification — 2026-11-14

The Owner authorized implementation and testing through completion on the
retained isolated Docker project `conduit-boq-um-b-20261108-r1`, including
one application of the new migration. The target, fixture and post-032
preflight passed. `033_um_b_confirm_legacy_affiliation.sql` committed once
through the isolated Unix socket. SHA-256
`453c31e163d864bd8a04db276b50167d7f403e2edd0dd913a57cdd9f57c1bf4c`.
Postflight verified the exact profile guard change, four public RPCs, three
private helpers and the expected private outcome store. Applying the file
changed no account or application fixture rows. Local socket application
does not establish a hosted migration history entry.

Using the same synthetic L1 staff session, the Data API returned B01/B02
before confirmation and B01/B02/B03 after it. B04/B05 remained outside L1's
read scope. The run recorded one committed `APPLIED` and two `DENIED`
outcomes. Competing Admins produced one confirmation. Replaying the same
UUID returned its stored result, a different payload with that UUID was
rejected, and a different Admin could not retrieve the exact request outcome.
Forced failure inserting the outcome rolled the profile change back. S0
write-boundary checks and the existing pending onboarding/approval replay
passed. BOQ, Catalog and Factor fixture fingerprints stayed equal. The old
approval path added its expected two audit events to the synthetic pending
fixture. The original seven test sessions were closed and both session/token
counts returned to zero. All four services stopped.

The original run is recorded as **API PASS / browser HOLD**. The real app
blocked the test email at the existing domain gate. It recorded no browser
business writes. The private run directory is
`/private/tmp/um-b-first-round-results-20261114-0m5n5w_n` and its
`result.json` SHA-256 is
`04f8eb0bb6eb724980bc53468f21d01202f7abb281e51c90b2455fd3e442fa24`.
Any browser continuation uses this settled result and the installed 033,
with no replay or repeat confirmation. The existing local DB, Production,
packages and migrations 027–032 were outside execution scope.

**Browser and source-qualified result.** After the first browser hold, the
loopback harness supplied the domain-gate answer only for the exact signed-in
synthetic Admin. The application and underlying Auth, directory, reference,
and confirmed affiliation/history reads were real. To exercise the review
after L1 was confirmed, the harness reconstructed the eligible L1 input from
pinned before/after evidence and intercepted mutations, including stale,
unknown across reload, and saved-but-refresh-failed responses. It also mocked
the missing-RPC response for predecessor compatibility. Those browser cases
sent no business writes to the backend. The actual before/after persistence,
concurrency, replay and rollback evidence came from the separate real API run.

The rendered app kept the existing Admin details Sheet, shared controls and
IBM Plex Sans Thai. Review passed at 1440 and 390 CSS pixels and reflow passed
at 320. Keyboard focus stayed in the open Sheet and returned to the trigger.
The confirmed view loaded actual audit date/reason on demand. The final
settled browser run had no unhandled page exceptions or unexpected console
errors. Physical mobile keyboard and screen-reader execution were not tested.
An actual predecessor database browser run was not repeated. The failure
paths used controlled test responses, including the stale snapshot check,
with no live concurrent organization hierarchy writer.

Final browser evidence is in
`/private/tmp/um-b-browser-final-results-20261114-kg8f60oz`.
`result.json` SHA-256
`7c82f56b2452901d6a5e1f50e5c69300035a6ac767f963e5a42912981eddcea9`.
The browser reruns made one synthetic Admin session each. Final readback shows
0 sessions and refresh tokens, 4 services stopped and 0 active members of the
isolated network. Retained business and fixture fingerprints matched the API
run. PostgREST's stopped process reported exit 255. The isolated volume retains
033 and the synthetic test results. No credentials or raw evidence are part of
the proposed release.

Node 24.2.0 passed 892 tests in 66 files, lint with zero errors and three old
warnings, standalone TypeScript and the default Turbopack build. The private
build used the installed dependencies and copies of the app's existing font
assets served through loopback. Source and font-loader configuration were
unchanged by that build harness. Review the seven-file Solo proposal at
`/private/tmp/um-b-first-round-20261114/SOLO_RELEASE_REVIEW.md`. It proposes
an independently authorized read-only hosted preflight, database-first apply
and postflight, then exact source release and conditional client rollback.
The hosted MCP execution payload and the migration ledger are separate from
the local socket receipt. At this checkpoint, Production preflight, apply,
publication and use on any real account each awaited separate authorization.
The subsequent results are recorded in [20.20](#2020-first-round-production-closeout).

### 20.20 First-round Production closeout

On 2026-11-14 (Asia/Bangkok), UM-B released the first Admin action for
confirming a valid existing request for an active staff account with no actual
affiliation. The database application, app delivery and first Admin use have
separate evidence.

| Gate | Recorded outcome |
|---|---|
| Migration 033 | **PASS.** Applied once through Supabase MCP at 18:59 Bangkok. History increased from 32 to 33. Supabase recorded `20261114115939 / um_b_confirm_legacy_affiliation`. All 32 prior row hashes matched and the stored SQL matched the submitted payload hash. The scoped postflight verified the four public RPCs, private audit store and ACL/RLS, existing Copy 031 and all nine 032 guards. Management OpenAPI showed the four routes and no private audit-table endpoint. |
| Exact Solo release | **PASS.** Seven files in `e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac`, parent `a588bfeb9d15c189293d0c0ec53585b988f10668`. [GitHub Quality](https://github.com/cloudstellar/conduit-boq/actions/runs/43593324859) passed. [Vercel deployment](https://vercel.com/cloudwho-2662s-projects/conduit-boq/R8ZZVx4oqC4MY12f1b99YGiJZaizRX) was Ready and Current for `boq.ntconduit.com` at release verification. Rollback was not triggered. |
| Anonymous Login and static assets | **PASS.** 26 same-origin GET requests returned HTTP 200 in a clean browser. No Auth/Data API requests, console errors or page errors were observed. Earlier harness issues are retained in the release receipt. |
| First Production Admin confirmation | **PASS — Owner-observed.** For one existing staff account, the Owner confirmed that the displayed actual affiliation was correct, the account stayed active and its history showed one new confirmation entry. Private account identifiers, the reason entered and the exact event timestamp are kept in the system audit. |
| Production BOQ visibility after confirmation | **NOT RUN.** The first-account observation covers the Admin view. The user-side BOQ visibility test used synthetic data on isolated Docker in [20.19](#2019-local-first-round-qualification--2026-11-14). Neither the apply nor the release automation invoked a business RPC. |

Private receipt paths for traceability are
`/private/tmp/um-b-prod033-20261114-apply/result.json` and
`/private/tmp/um-b-solo-release-20261114/release-result.json`.
The release and migration grants were consumed. This checkpoint closes the
first confirmation scope. Admin assignment when the request is wrong, changes
to an existing affiliation and UM-A2 remain tracked in [12.1](#121-current-state-and-authority).

## 21. Admin assignment for an incorrect affiliation request

**Status: DEFERRED / NOT STARTED.** Revisit under
[Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md#product-sequencing)
when an active employee with no actual affiliation has an incorrect request
and cannot access a BOQ needed for work. Review the account scope and
affiliation evidence with the Owner if that case arises.

The current Admin action confirms a correct request. If the request is wrong,
Admin can leave it unconfirmed while the employee or their unit provides the
correct details through the existing contact channel. The employee keeps
working with their current access. Pending accounts use the existing
return-and-resubmit flow.

### 21.1 Proposed scope and Admin flow

1. In the existing Admin details Sheet, offer **กำหนดสังกัดที่ตรวจสอบแล้ว**
   to a current active Admin reviewing another active staff account with all
   three actual affiliation IDs empty and an existing, structurally valid
   request for the wrong affiliation. Keep **ยืนยันสังกัด** for the correct
   original request.
2. Display **สังกัดจริง**, **สังกัดที่ยื่นขอ** and **สังกัดที่จะกำหนด**.
   Select an active department and then an active sector from the existing
   directory, clearing the sector when the department changes. The server
   derives the organization. Allow a different sector in the same department
   or a different department in the same organization.
3. Before **บันทึกสังกัด**, show the selected account and destination.
   Suggested review text is “ผู้ใช้อาจเปิดดู พิมพ์ ส่งออก หรือคัดลอก BOQ ที่เข้าเกณฑ์
   ในส่วนใหม่ตามสิทธิ์เดิม ฉบับร่างที่สร้างหรือคัดลอกใหม่จะใช้สังกัดใหม่”.
   Require a short reason recording who or what verified the affiliation, such
   as the responsible unit or an authoritative staff directory. An optional
   reference may go in the reason. Give Admin a clear way back from review.
4. After success, reread actual affiliation and history. Show the retained
   request as **คำขอเดิม** and mark the case resolved. If the reviewed data
   changes, require a fresh review. If the save response is uncertain, look up
   the same request. If the save is confirmed and the refresh fails, show the
   confirmed outcome and offer to reload.

Keep the action in the current Sheet on desktop. On mobile stack the three
affiliation values and keep review and save reachable without horizontal
scrolling. Reuse the existing Admin controls and Master Catalog NT styling.
Test keyboard selection, focus return and readable loading and error states.

The operation updates the existing account's three actual affiliation IDs
and `updated_at`, plus one audit event. It preserves the original request,
approval evidence, role, account status, identity, credentials and sessions.
Own and assigned BOQ access follows existing rules. Eligible shared BOQs in
the destination sector can become available to view, print, export or Copy,
subject to existing rules. Existing BOQ rows and ownership stay as recorded.
New drafts from Create or Copy use the verified affiliation on the current
profile, which can affect visibility to eligible colleagues.
[BOQ read policy](../../../migrations/009_master_catalog_p0_containment.sql#L259)
· [Create](../../../app/boq/create/page.tsx#L129)
· [Copy](../../../migrations/029_atomic_boq_duplicate.sql#L1425)

The first release covers one account per action. Missing or invalid requests,
partially or fully filled actual affiliation, post-assignment corrections,
cross-organization moves and active-user resubmission require separate scope
decisions. The employee supplies or confirms details if asked. Admin records
the verified assignment using the existing account.

### 21.2 Proposed implementation boundary

- **Database.** One forward migration adds a distinct Admin command and
  narrowly scoped profile-guard action. Keep 027–033 byte-for-byte. Under a
  deterministic lock order compatible with 033, revalidate authority from
  the current profile, eligibility, reviewed original request, and active
  destination hierarchy. Require the destination to be a different pair in
  the same organization. Save the profile and audit outcome atomically.
  Restrict function execution and verify active Admin inside the command.
  The existing 033 operation binds actual department/sector to the original
  request. [Existing guard](../../../migrations/033_um_b_confirm_legacy_affiliation.sql#L453)
  · [Supabase function privileges](https://supabase.com/docs/guides/database/functions#function-privileges)
- **History and recovery.** Record a distinct private event with actor, target,
  time, reason, original requested IDs, previous and resulting actual IDs,
  and request UUID. The current store requires version 1 and the existing
  history labels its successful rows as confirmation. Reuse the store if a
  version-aware extension preserves the old history and outcome contracts.
  Keep the v1 confirmation filter ahead of its history limit and preserve the
  v1 outcome envelope for existing clients.
  Otherwise review separate private storage and a typed combined history for
  the new client. Bind the UUID to actor, target, command, reviewed state,
  destination and reason. Serialize confirm and assign for the same target.
  Look up the original outcome after a lost response before attempting any
  new write. Keep unresolved legacy confirmation recovery working.
  [History projection](../../../migrations/033_um_b_confirm_legacy_affiliation.sql#L390)
  · [Client outcome adapter](../../../lib/admin/users/affiliation-confirmation.ts#L195)
- **Application and tests.** Keep changes within the existing Admin page,
  details/affiliation components, the typed adapter under `lib/admin/users/`,
  one reviewed forward migration and focused tests. Use bounded, ordered
  directory lookups and discard stale sector responses when the department
  changes. Confirm the exact allowlist before implementation. Signup, SSO,
  Auth settings, groups, shared styling, and BOQ policies have separate scopes.

### 21.3 Local acceptance and release review

Use an approved isolated Docker target after checking the post-033 baseline.
Create a fresh run with synthetic staff, Admin and BOQs, including the
requested sector, verified destination and out-of-scope controls. Keep prior
runs closed and preserve existing data. Qualify the new migration on that
target only under separate authorization.

| Case | Acceptance evidence |
|---|---|
| Correct assignment | Actual IDs equal the reviewed destination. Original request, approval metadata, status and role stay the same. Exactly one typed audit event. With the same staff session, compare owned, assigned, eligible destination and out-of-scope BOQ reads and verify that editing others' BOQs remains denied. Cover eligible saved output and synthetic Create/Copy into the new scope. Existing rows retain their recorded affiliation and ownership. |
| Wrong actor, target or destination | Deny anonymous, non-Admin or revoked Admin with an old session, self, nonstaff, nonactive, partially or fully set actual affiliation, invalid requests and inactive, mismatched, original-pair or cross-organization destinations. Direct profile writes remain denied. |
| Stale review and concurrent actions | Changing eligibility, original request or destination hierarchy requires re-review. Assignment versus assignment and assignment versus 033 confirmation for one target yield at most one successful change. |
| Replay and failure | Same UUID and same intent return its outcome. Reusing the UUID for another intent is denied. A lost response is resolved by lookup. Forced audit failure leaves the profile unchanged. |
| Compatibility and delivery | Verify 033 confirmation/history/recovery, pending approval, normal BOQ access and 031/032. Test the UM-A2 app with the successor schema before and after a synthetic assignment so an app rollback can still open the details Sheet and show actual affiliation and ordinary history. The new typed audit stays stored and is visible through the new history reader. Run focused tests, lint, TypeScript, Node 24 build and keyboard/desktop/mobile checks. |

Suggested order is approve the scope, qualify the patch on isolated Docker,
then review a separate Production release plan and refresh the exact
predecessor. App rollback restores the old UI. Correcting an assigned scope
requires a separate authorized business-data correction. The planning
estimate is **2–4 focused workdays through local verification** once the
isolated baseline is available.

Owner decisions are the proposed eligibility limits, whether any current
active account makes this work urgent, and the minimum verification evidence.
Recommended authority and evidence are a current active Admin acting on
confirmation from the responsible unit or an authoritative staff directory,
with a short required reason. This uses existing Supabase Auth while IT
considers SSO. This section is for review before implementation, Docker
execution or any Production operation.

## 22. Groups, roles and access scope

**Status: product direction proposed for review.** Develop account management
with the existing Supabase Auth identities while IT evaluates SSO and hosting.
Define access for each BOQ workflow as it is planned. Introduce Admin-managed
access groups when a specific recurring workflow needs the same access granted
and revoked for several people. Defer a general editor for permission templates
until multiple recurring workflows justify it.

### 22.1 Industry comparison and fit

| Product | Documented behavior | Implication for Conduit BOQ |
|---|---|---|
| Procore | Project permission templates can be global or project-specific, with a level per tool and selected supported granular actions. Estimating has an action-by-action matrix, including export. [Project templates](https://support.procore.com/products/online/user-guide/company-level/permissions/tutorials/create-a-project-permissions-template) · [Estimating permissions](https://en-ca.support.procore.com/products/online/user-guide/project-level/estimating/permissions) | Define reusable roles for known actions with an explicit scope. Model print and export separately from view and edit. |
| Autodesk Cost Management | Assigns a module-level permission to members, companies or roles. Some modules have `Collaborate` for assigned items. [Cost Management permissions](https://help.autodesk.com/cloudhelp/ENU/Build-Cost/files/setup-cost/manage-settings/Cost_Permission_Management.html) | Keep an organizational affiliation and an assignment to particular work distinct. The permission set can be small when the workflow is small. |
| Bluebeam Studio Projects | Project owners can manage and add groups within a project and set permissions. Group overlap has explicit conflict rules. [Studio Projects permissions](https://support.bluebeam.com/user-manual/menus/window/manage-projects-permissions.html) | Start with named project/BOQ scope. Define and test the effective result when access comes from more than one source before enabling that combination. |

### 22.2 Recommended sequence

1. **Improve account management as cases require.** Keep the existing account
   ID, five roles and current authorization checks. With UM-A2 released, use
   [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md) to prioritize
   other account changes. Revisit [section 21](#21-admin-assignment-for-an-incorrect-affiliation-request)
   when its trigger is met.
   If the directory gets difficult to operate, consider server-side search and
   filtering by current affiliation, role and status. The current directory
   paginates. A filter limited to its visible page would give incomplete results.
   Filters use existing attributes and grant no access. Review any search work
   as an independent candidate.
2. **Define the access matrix alongside each BOQ workflow.** Separate account
   state and identity, confirmed affiliation, role (allowed actions), and
   assignment or group membership (the documents covered by a grant). Record
   who may view drafts or operational BOQs and who may create, edit, Copy,
   record approved operational status, print or export. Keep the selected
   paper approval authority for operational BOQ. Use the matrix consistently
   in the UI, trusted APIs, RLS, and in-app print/export entry points.
3. **Start with one explicit access group when the workflow is ready.** A
   candidate is the TOR committee for a named project or reviewed BOQ set, once
   operational BOQs and Viewer policy are settled. An authorized Admin manages
   members from existing accounts and sees the documents and effective actions
   before granting access. Propose viewing only assigned operational BOQs.
   Decide in-app TOR printing and Excel export separately. The committee grant
   gives no draft, edit or approval access. Keep a change history and define
   when membership is removed or expires. Tests must separate access from the
   committee grant from any rights a member already has through their job.
4. **Consider configurable templates when needs repeat.** Start with supported
   action and scope combinations. Before offering an Admin editor, agree who
   can delegate each grant, how overlapping role/group grants resolve, how to
   protect against self-escalation, what template edits do to current members,
   and how revocation is verified for existing sessions. Validate denied and
   allowed cases across direct APIs, document reads and output routes. Use
   policy changes to extend the current authorization model. S0/032 names the
   BOQ writer roles in database guards, so adding a new writer role is a
   separate access-policy change. [Current roles](../../../lib/types/auth.ts#L2) · [Writer guard](../../../migrations/032_s0_boq_writer_boundary.sql#L204)

For the first group UI, keep the existing Admin details design and show the
source of each grant alongside the scope and allowed actions. The group view
should let Admin review members, covered BOQs and expiry, and show the effect
of adding or removing a member before saving. This helps explain why someone
can still access a BOQ through their existing role after a group grant ends.

IT decides the provider, stable identity key, source of group membership and
approved mapping before an organizational SSO pilot. Retain existing account
IDs and references. Incoming group names or affiliation claims are suggestions
until a reviewed mapping and lifecycle policy authorize their use. The
application controls access to its documents throughout the transition. Keep
SSO, hosting, access groups and permission templates out of the section 21
release. This section records a proposed sequence and review conditions.

## 23. UM-A2 implementation review

Prepared 2026-11-14 (Asia/Bangkok). **Narrowed for Owner review.** The first
UM-A2 release addresses what a user sees after signup and when the confirmation
link cannot be used. It uses existing Supabase Auth and the recorded post-033
contract for baseline app `e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac`.
This section records the approved implementation scope. The outcome of the
local implementation and Docker checks is in [section 24](#24-um-a2-solo-release-review).

### 23.1 Current behavior and scope

- A successful `signUp()` now shows the same check-email message for both
  kinds of response. Branch on the actual session result. A usable session
  continues through the normal app route and its authorization guards.
  Pending users reach the existing `/pending` page with a link to `/profile`.
  [Signup source](../../../app/login/page.tsx#L66) ·
  [Pending source](../../../app/pending/page.tsx#L11)
- Invalid or failed callbacks redirect to `/login?error=auth_callback_error`.
  Login ignores that flag and Proxy redirects signed-in users away from Login.
  Use a single informational page for callback failure. Its neutral wording
  gives instructions for both signup confirmation and password recovery.
  [Callback](../../../app/auth/callback/route.ts#L5) ·
  [Proxy logic](../../../lib/supabase/middleware.ts#L36)
- Preserve the current email field, labels, validation, autofill, automatic
  `@ntplc.co.th` completion on blur and submit, and the existing admission check
  in Login, Signup and Forgot. Pending/Profile redesign, Admin changes and
  resend are deferred. The proposal needs no package, Auth provider setting,
  email template or database change. Preserve migrations 027–033.

### 23.2 UI/UX for review

Use the current Login card, genuine NT logo, neutral surfaces, IBM Plex Sans
Thai and existing buttons. The private static mockup is
`/private/tmp/uma2-review-20261114/um-a2-ui-review.html`.
[NT brand baseline](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md#3-brand-and-visual-rules)

| State | What the user sees and does |
|---|---|
| Signup accepted without a session | **ตรวจสอบอีเมล** shows the exact address sent in this attempt. It tells the user to check the inbox and spam folder, then open the confirmation link in the browser used to sign up. Offer **กลับไปกรอกอีเมลใหม่** and **กลับไปเข้าสู่ระบบ**. Keep the address only in the current screen state and clear the password. Returning to the form requires a new deliberate submit. |
| Signup returns a session or the original link exchanges successfully | Continue to the normal app entry route and let existing guards decide where to send the user. An eligible pending account reaches the existing **บัญชีอยู่ระหว่างรอการอนุมัติ** page and can open its own profile. A blocked or unavailable account follows the existing route guard. |
| Link cannot be used | **ใช้ลิงก์นี้ไม่ได้** with the next step. For signup, try the latest link in the original browser. If the address was already confirmed, sign in. If the link still fails or never arrives, contact Admin. For password reset, request a fresh link through **ลืมรหัสผ่าน**. A **กลับไปเข้าสู่ระบบ** link uses the existing route. Signed-in users continue with their current account. |

The check-email screen reports the signup response without claiming delivery,
new account creation or application approval. Keep provider error text and
credentials out of the messages. Use a clear heading at each state, keyboard
focus, and status text alongside color. Check long Thai copy and email reflow
at 320, 390 and 1440 CSS pixels.
[GOV.UK confirmation pattern](https://design-system.service.gov.uk/patterns/confirm-an-email-address/)

### 23.3 Proposed files and user impact

Propose seven paths, four runtime files and three tests. The existing browser
SDK, Auth provider settings, callback URL and route protection remain the basis
for signup and password recovery.

| Proposed file | Purpose |
|---|---|
| [`app/login/page.tsx`](../../../app/login/page.tsx) | Handle the two signup results. Use the existing submitted address for the check-email state. Keep Login, Forgot and the existing email field and handling. |
| [`app/auth/callback/route.ts`](../../../app/auth/callback/route.ts) | Map unsuccessful exchanges or missing codes to the informational page. Preserve the successful same-origin exchange and existing recovery destination `/profile`. |
| `app/auth/callback-error/page.tsx` (new) | Show a neutral recovery message and ordinary navigation. It reads no account data and issues no Auth commands. |
| [`lib/supabase/middleware.ts`](../../../lib/supabase/middleware.ts) | Allow the exact informational path for all visitors. Keep normal route guards in effect for all other paths. |
| [`tests/auth-missing-session.test.ts`](../../../tests/auth-missing-session.test.ts), `tests/um-a2-auth-flow.test.tsx` and `tests/um-a2-auth-callback.test.ts` (new) | Check that the path exception is exact, both signup outcomes render correctly and callback failure stays separate from recovery success. Run the existing email and authorization suites. |

Risk to current users is concentrated in the shared signup/reset callback.
Use fixed same-origin failure destinations and a small set of safe UI messages.
Treat `next` only as a checked navigation hint. Let existing guards decide
business access. On the failure path, use a no-store response and no-referrer
policy. Make the redirect explicitly replace any incoming fragment so the
browser Auth client on the error page cannot process old credentials. Check
that a failed link leaves the original signed-in session usable and never
triggers another exchange or signup. If the shared callback cannot meet those
criteria within these paths, record the reproduced case for review before
changing session behavior.
[HTTP redirect semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.2) ·
[Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow)

### 23.4 Docker and acceptance

Use a fresh, synthetic-only Docker project with separate volumes and a reviewed
post-033 baseline. Before testing, confirm the Docker target, image/digest,
volume, loopback ports and exact callback allowlist. Block external egress and
prove the local mail sink can capture mail without a relay. Exercise both
Confirm Email settings in the isolated configuration. The checked-in local
config currently disables it. Hold runtime checks if target, mail isolation
or baseline cannot be verified without replay or using the regular local DB.
[Checked-in auth settings](../../../supabase/config.toml#L219) ·
[Supabase local Auth tests](https://supabase.com/docs/guides/auth/testing-auth-flows)

| Check | Required result |
|---|---|
| Confirm Email off | One fresh signup gets a session and goes through the existing route to Pending/Profile. No confirmation mail is captured and no application access is granted by the signup result alone. |
| Confirm Email on | Signup shows **ตรวจสอบอีเมล** with the exact submitted address. The original captured email opens successfully in the initiating browser, verifies the same synthetic UID and reaches Pending/Profile through existing guards. Returning to edit leaves the request count unchanged until a deliberate submit. |
| Unusable link | Probe an already-used, expired, malformed and wrong-browser link. Use separate mail samples/browser contexts where a probe can consume a link or verifier. Check provider email confirmation and browser sign-in separately. Confirm safe next steps, fixed same-origin failure redirect, no token or raw provider text in the destination, no second browser exchange and no automatic mail. Exercise a bad external `next` and verify that only the exact informational path is public. Verify that failed links preserve the original active or pending session, including a failed link from a different account. Identify provider observations and mock-injected cases separately. |
| Existing Login, Forgot and recovery | Short names and full emails still work through the current field, blur/submit completion and admission check. Open a captured original reset link, verify it reaches `/profile`, set a new password for one synthetic user and verify sign-in. Check unusable reset links retain an intelligible route to request a new one. |
| Access and UI | Pending users can open their own Profile and remain denied on BOQ/Admin routes and representative API reads. Current active staff and Admin retain their normal navigation, blocked users remain blocked. No BOQ writes or approval/resubmission tests are needed. Run relevant existing and new tests, lint, TypeScript and default Turbopack build on Node 24. Verify the three screen widths, keyboard and focus in a real local browser. |
| Fixtures and closeout | Propose up to four new signups, one with Confirm Email off and up to three on, plus three synthetic regression accounts for active staff, Admin and blocked access. Count captured messages and run-owned sessions, close those sessions and stop the isolated services. Record case, final route and outcome. Keep passwords, tokens, raw links and session cookies out of evidence. An uncertain write stops the run for read-only reconciliation. |

Resend is deferred. The pinned SDK can send the resend link without the PKCE
challenge used for the original signup link. A future resend proposal needs
its own delivered-link compatibility evidence.
[Supabase resend change](https://github.com/supabase/supabase-js/pull/2144)

Any later release review must establish the hosted Confirm Email, redirect and
delivery settings separately. Local mail capture proves delivery inside the
test stack.
[Supabase email link guidance](https://supabase.com/docs/guides/deployment/going-into-prod#email-link-validity)

### 23.5 Skills and review decisions

The Owner approved the seven paths and the isolated synthetic run. The results
and the approval needed for publication are in [section 24](#24-um-a2-solo-release-review).

Supabase and Next.js guidance cover signup, callback and cookies. Product
Design, shadcn/ui and the existing NT guide inform local layout and copy. UI UX
Pro Max and the Vercel and W3C guidelines inform keyboard, feedback and touch
checks. The existing app components provide the visual baseline.
[Skills article](https://xiengperm.dev/posts/agent-skills-for-ui-ux-th/) ·
[Vercel guidelines](https://github.com/vercel-labs/web-interface-guidelines) ·
[W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)

## 24. UM-A2 Solo release review

2026-11-14 (Asia/Bangkok). **Local checks complete with the recorded harness
limits. Production preflight and publication await Owner approval.**
This is the pre-release checkpoint. The later approval and results are in
[section 27](#27-um-a2-production-closeout).

### 24.1 Source and exact release files

The local `main` and local `refs/remotes/origin/main` both point to
`e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac`, with base tree
`77f13370794d972f9da26ac00f36ed1145782bd3` and an empty index at review. The
candidate is that base plus these four modified files and three new files.
The expected Git tree is `eaa3cd678fe32f4a70483451b96af2c14614862f`, computed
from the base and the seven verified files without writing to the index.
Recheck the live remote and all seven byte hashes before publication.

| Change | Exact path | SHA-256 of tested file |
|---|---|---|
| Modify | `app/login/page.tsx` | `d43ef3a8499c592e3dbd0bc45ae308cff444d2c4f85b750e0f62aefc3ad40d6c` |
| Modify | `app/auth/callback/route.ts` | `3a2465248e553d0bed71818d6a11e7c3a50e7171b342ab3fa422481c18043329` |
| Add | `app/auth/callback-error/page.tsx` | `b856a92607f91d3dda37fbe9814e6301011b6b7a168e0b1b4323803017a8cf66` |
| Modify | `lib/supabase/middleware.ts` | `7987ce14eae158c26b74e736c9a6739a515e4b9ee5e58a474d1083bdd0882455` |
| Modify | `tests/auth-missing-session.test.ts` | `4e095831124fce138742d22022e2ade11abd60b36f10d65ea0a0db1ea1ba560b` |
| Add | `tests/um-a2-auth-callback.test.ts` | `67da24cf57230041e21a93bd8391b8ef7d989ff21365e1b63d116259f32c66b1` |
| Add | `tests/um-a2-auth-flow.test.tsx` | `0912178446d792669470de0aea78792a343f4e574572533e49824e05c0473efd` |

The allowlist excludes this document, other local planning changes, tooling and
baseline files, screenshots and private receipts, environment and CI config,
packages/lockfile, and all SQL/migrations. The app release preserves the
existing email form, Admin features and installed 031–033 contracts. It needs
no DB operation, settings change or outage window.

### 24.2 Local test decision

| Result | Evidence and release implication |
|---|---|
| **PASS** | Node 24.2.0 ran 918 tests across 68 suites. Lint had 0 errors and 3 existing warnings. TypeScript and the default Turbopack build passed in a clean copy using locally cached font assets. |
| **PASS by case** | In isolated Docker, Confirm Email on yielded one successfully confirmed signup and access to its own Profile, with BOQ and Admin access denied as expected. A different browser without the signup verifier did not gain a session. Real expired, used and malformed links reached the help screen. Real reset mail reached Profile, the password changed, and the same identity signed in with the new password. Confirm Email off reached Pending without generating mail. |
| **Historical harness FAIL retained** | The first Confirm-on run stopped at the harness's Enter activation. Chromium later passed Tab and Enter in a separate run with stubbed signup responses. The successor recorded all eight functional check groups, then reported a blocked request and one unsuccessful logout attempt. The exact blocked path and logout error cause were not retained in that run. |
| **PASS on focused regression and custody** | A later diagnostic named the read RPC `get_my_catalog_admin_gate` the harness blocked. The corrected existing-account rerun passed for staff, Admin and inactive staff with no denied requests. The empty Catalog fixture still had console errors on existing active/Admin Dashboard flows. Separate read-only reconciliation confirmed 0 sessions and 0 refresh tokens, including after the reported logout failure. Four signup attempts and three regression accounts were accounted for. All owned services were stopped and the original synthetic UM-B source remained stopped. |

Keep the aggregate Confirm-on result as `FAIL`, with individual outcomes above.
Recommend no full Docker rerun for this result. Repeat only the affected path
if the source hashes or relevant provider behavior change, or if new evidence
shows a real regression. [Section 26.5](#265-production-smtp-checkpoint) records
the later hosted delivery check and its limits. The local reports are in
`/private/tmp/conduit-uma2-bhcFb7Lv/RESULT.md`, `browser-on-functional-result.json`,
`browser-existing-result.json`, `backend-final-audit.json` and `backend-stopped.json`.

### 24.3 Preflight and Solo sequence after approval

1. **Source and Vercel.** Verify live `main`, an empty index and the seven
   hashes before staging. Confirm `cloudstellar/conduit-boq`, Vercel project
   `conduit-boq`, Production branch `main`, domain `boq.ntconduit.com`, and
   current Production source `e497ffa…`. Check actual build command, root,
   Node/runtime, Production Supabase binding and auto-assignment. Establish
   which Vercel deployment is healthy and eligible for rollback on the plan in
   use. The completed UM-B receipt records `dpl_R8ZZVx4oqC4MY12f1zD3Tzb39weu`
   and Quality `43593324859`. Some local notes contain a different ID. Accept
   the target only after a fresh match of full source, deployment and domain.
   [Vercel Git deployments](https://vercel.com/docs/git) ·
   [Vercel rollback eligibility](https://vercel.com/docs/instant-rollback)
2. **Supabase Auth read-only.** Confirm the project binding, email/password
   provider, actual Confirm Email setting, Site URL and effective redirect
   allowlist for the public origin with `/auth/callback` and
   `/auth/callback?next=/profile`. Inspect signup and recovery templates for
   compatibility with the current PKCE `code` callback. Review SMTP and recent
   delivery health using configuration or aggregate evidence when visible.
   Record only redacted decisions, never secrets, account/BOQ rows, or raw mail
   links. Reuse recorded post-033 evidence for this app-only release. If there
   is relevant backend drift, obtain scoped metadata review before publishing.
   A different link flow, unverified material settings, or an ineligible
   rollback target holds publication. Resolve drift in a separate decision.
   [Supabase redirect settings](https://supabase.com/docs/guides/auth/redirect-urls) ·
   [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow) ·
   [Supabase email considerations](https://supabase.com/docs/guides/deployment/going-into-prod#email-link-validity)
3. **One Solo push.** Recheck predecessor and index. Stage the seven named
   paths explicitly. Verify the staged paths, hashes and expected tree before
   committing. Confirm the resulting commit's parent and tree before one normal
   push to `main`. Verify
   the exact commit's GitHub Quality result and Vercel Ready/Current source and
   domain. The repository's Quality workflow uses Node 22, distinct from local
   Node 24 evidence. Vercel can assign the deployment before CI completes,
   so track both. Stop progress on drift, failed checks or an uncertain push
   result until the actual remote and deployment state is known.
4. **Anonymous no-write smoke.** Use a fresh browser and same-origin GETs for
   Login, assets and the malformed/missing-code callback. With an inert test
   marker, verify the `307` relative Location `/auth/callback-error#link`, the
   final help page `200`, no inherited credentials or provider text, and
   `private, no-store` and `no-referrer`. Confirm that the path exception is
   exact with one adjacent route. Block Auth/Data API requests and form
   submission. Capture redacted result, SHA, run ID and deployment ID. Leave
   hosted mail delivery and authenticated behavior marked **NOT RUN**.

### 24.4 Conditional rollback for Owner review

Trigger on a new failure in Login, verification/reset routing, session
continuity, route authorization or response privacy, or a failed required
delivery check that makes the release unacceptable. Capture the exact source,
deployment, symptom and affected route. If UM-A2 has never served Production,
leave the healthy Current artifact in place and hold publication. A verified
failure after it becomes Current can trigger one approved Vercel rollback to
the freshly confirmed UM-B artifact from section 24.3. Confirm the domain and
source after the rollback and repeat the applicable anonymous Login check.

If `main` still points to the exact UM-A2 commit, one authorized forward
rollback commit can restore the four modified files from `e497ffa…` and remove
the three paths added by this release. A new commit on `main`, unexpected file
content or an ineligible deployment requires review before acting. Use a
normal push and verify CI, Vercel and the domain. Vercel disables production
domain auto-assignment after Instant Rollback. If needed, promote only the
verified forward-rollback deployment under the same explicit approval.
Application rollback preserves the installed 031–033 migrations and all
stored accounts, sessions and data. It cannot retract an email or undo a
completed Auth action. [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)

The next Owner decision is whether to accept the local per-case evidence and
authorize the bounded read-only preflight, or authorize the Solo publication
and named conditional rollback together after a passing preflight. This local
review did not access Production or stage, commit, push or deploy.

## 25. Production Auth redirect review

2026-11-14 (Asia/Bangkok). **Initial redirect check was HOLD.** The approved
read-only preflight found that the `Conduit Price List` Production project had
Site URL `https://conduit-boq-cloudwho-2662s-projects.vercel.app/` and the four
Redirect URLs below. Both public-domain callbacks are outside that scope.
Vercel showed UM-B `e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac` as Ready and Current
on `boq.ntconduit.com`. The live Git branch and remaining Auth settings were
not verified in that preflight. This section proposes a separate settings
change for Owner review.

### 25.1 Exact before and after

Keep the recorded Site URL and all four existing entries. Compare their exact
values, not just the displayed count, immediately before any approved edit.

```text
https://conduit-boq-cloudwho-2662s-projects.vercel.app/
https://conduit-boq-cloudwho-2662s-projects.vercel.app/**
https://conduit-*-boq-cloudwho-2662s-projects.vercel.app
https://conduit-*-boq-cloudwho-2662s-projects.vercel.app/**
```

Add exactly the two values below in **Authentication → URL Configuration →
Redirect URLs** on the verified Production project. Both are used by the
application already running. UM-A2 does not need to be deployed for the setting
to affect future requests. [Existing Signup and Forgot calls](../../../app/login/page.tsx#L111)

| Flow | URL requested by the browser | Value to store in Supabase |
|---|---|---|
| Signup, when confirmation is enabled | `https://boq.ntconduit.com/auth/callback` | `https://boq.ntconduit.com/auth/callback` |
| Password recovery | `https://boq.ntconduit.com/auth/callback?next=/profile` | `https://boq.ntconduit.com/auth/callback\?next=/profile` |

The single backslash in the second **setting** makes the `?` literal in the
Supabase glob matcher. The actual browser URL still contains an ordinary `?`.
The matcher checks the original requested redirect. Supabase then appends the
PKCE `code` on a successful verification, so the setting uses `/profile`
literally and omits `code` or percent-encoded alternatives. Check that the
Dashboard accepts and preserves the backslash. If it rejects, strips or changes
it, stop and review a supported way to store the same pattern.
[Supabase redirect matching](https://supabase.com/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) ·
[Auth matcher source](https://github.com/supabase/auth/blob/v2.190.0/internal/utilities/request.go#L89-L130) ·
[Auth PKCE redirect source](https://github.com/supabase/auth/blob/v2.190.0/internal/api/verify.go#L500-L508)

### 25.2 Effect on users

- Existing password login, sessions, account status and BOQ permissions use
  their current rules. The proposal adds two approved destinations after an
  Auth email flow. No planned downtime is needed for that addition.
- A newly requested link from the public domain can send the user back to the
  same origin as the browser that started the flow, provided that the provider,
  template and delivery work. Requests with no accepted redirect still fall
  back to the existing Site URL. An email already sent retains the URL in it.
  If an earlier link went to the wrong host, request a fresh link using the
  browser that started the new request.
  [Supabase redirect settings](https://supabase.com/docs/guides/auth/redirect-urls) ·
  [PKCE browser requirements](https://supabase.com/docs/guides/auth/sessions/pkce-flow#limitations)

### 25.3 Proposed execution and verification after approval

1. Confirm the exact project and Production branch. Reload URL Configuration
   and check the original Site URL, the four entries above and the absence of
   the two proposed entries. Ask the operator to avoid parallel Auth config
   edits during this short change. Stop on drift. The Dashboard appends the
   values by updating the whole redirect list, so a stale screen could
   overwrite another edit. [Dashboard save source](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/Auth/RedirectUrls/AddNewURLModal.tsx)
2. Use **Add URL** to enter both values and review them before selecting
   **Save URLs** once, if the live Dashboard supports a two-row form. If not,
   check the fresh list after each save. Leave the Site URL form untouched.
   If the response is ambiguous, reload and establish what was saved before
   attempting a further change.
3. Reload and verify that the list is exactly the previous four plus these
   two, including the literal separator pattern, and Site URL matches its
   prior value. The change then has **CONFIG PASS**. If a later approval also
   covers the remaining UM-A2 preflight, review actual Confirm Email, the two
   templates, email provider and SMTP or email hook without sending mail.
   Verify Git and rollback eligibility under that preflight as well.
4. Configuration readback does not exercise real email or PKCE. Leave both
   hosted flows **NOT RUN** unless a separate test is approved. If end-to-end
   proof is requested, use an agreed test mailbox and account. From
   `boq.ntconduit.com`, check that each new mail link returns to that origin,
   with `next=/profile` retained for recovery, and open the link in the same
   browser. Test signup only if the actual project requires confirmation.
   Record the route and outcome without saving the token or raw link. It is
   possible to leave UM-A2 held while this settings change is verified.

### 25.4 Configuration rollback for review

If post-save readback shows an incorrect addition or the new setting causes a
verified regression, inspect the latest list. Under explicit rollback
approval, remove only the entries added by this operation. Compare with the
recorded original list and Site URL, and preserve independently added settings.
If another edit changed the same rows, ownership is uncertain, or a pre-existing
row has gone missing, stop for review instead of restoring a stale snapshot.
An already sent mail keeps its original link. This rollback concerns Supabase
redirect settings. The Vercel app rollback is separate, in section 24.4.

### 25.5 Redirect change readback and Auth preflight

On 2026-11-14, under a separate approval, both public-domain entries were saved
and verified after reloading the Dashboard. All four original entries and the
Site URL matched the before state. The recovery entry retained `\?` in the
stored pattern. The follow-up read-only preflight verified that Email,
signup and Confirm Email were enabled, both templates linked through
`{{ .ConfirmationURL }}`, and Custom SMTP was off with no Send Email Hook.
GitHub `main` and the Vercel UM-B Current source matched `e497ffa…`. The
preflight stopped at mail delivery. Keep the approved redirect settings as the
SMTP baseline. Hosted signup, password recovery and email delivery remain
**NOT RUN**. Final Vercel release and rollback checks remain in section 24.3.

## 26. NT SMTP proposal for UM-A2

2026-11-14 (Asia/Bangkok). **Proposal for Owner review.** NT's mail setup sheet
lists `mail.ntplc.co.th`, TCP `465`, implicit TLS (labeled SSL) and authenticated
SMTP. Supabase documents hosted Custom SMTP on port 465. The NT relay's
reachability and relay policy for Supabase Cloud have yet to be verified.
The current default Supabase service restricts delivery to project team
addresses. This blocks signup confirmation and recovery for normal users on
the existing app as well as UM-A2. The proposed SMTP change can be reviewed
and verified separately while UM-B remains deployed.
[Supabase port 465 example](https://supabase.com/kb/troubleshooting/using-google-smtp-with-supabase-custom-smtp-ZZzU4Y) ·
[Supabase SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp)

### 26.1 Information to request from IT

| Ask IT to confirm or provide | Acceptance before changing Production |
|---|---|
| Network and TLS | Confirm that **hosted Supabase Auth** may connect to `mail.ntplc.co.th:465` over implicit TLS from outside NT. Identify any VPN, source-IP allowlist or relay requirements. If IT needs fixed egress IPs, get a project-specific answer from Supabase before assuming they exist. The host must present a trusted certificate for the configured hostname. |
| Sending account | Provide a dedicated SMTP credential for Conduit BOQ, the full SMTP username, approved From address and whether the From must match the username. Confirm the supported authentication method, credential expiry and who handles rotation. Enter the credential through an approved secret-handling channel. Keep it out of chat, Git and evidence. |
| Recipients and mail handling | Confirm authorized recipients, starting with `@ntplc.co.th`, sending limits and any restrictions on keeping or processing addresses and Auth links in the hosted service. Ask IT to verify the required sender/domain protections and provide a way to look up accepted, deferred or quarantined delivery using a message ID or timestamp. Avoid email link tracking that rewrites the Auth link. |
| Test and support | Select one controlled NT mailbox outside the Supabase project team for test signup and reset. Agree who can confirm relay results or revoke the SMTP credential if needed. If hosted Supabase cannot use this relay under NT policy, ask IT for an approved relay for this source. |

The intended connection is from Supabase Auth to NT over TLS. Port 465 is the
proposal. The unencrypted port 25 option in the NT sheet is outside the plan.
[Implicit TLS on port 465](https://www.rfc-editor.org/rfc/rfc8314.html#section-3.3) ·
[Supabase SMTP settings and sending guidance](https://supabase.com/docs/guides/auth/auth-smtp)

### 26.2 Proposed settings change and readback

1. After IT confirmation and explicit Owner approval, open the verified
   Production project **Conduit Price List → Authentication → Emails → SMTP
   Settings**. Verify the baseline from section 25.5, including Custom SMTP
   off and no Send Email Hook. Record the email rate limits and compare
   Confirm Email, email templates, Site URL and six redirect entries. Stop
   for review if there is material drift. Record only the configuration
   needed for comparison.
2. Set Custom SMTP host `mail.ntplc.co.th`, port `465`, the dedicated SMTP
   username and secret, the IT-approved From address and sender display name
   `Conduit BOQ` if IT agrees. Use the SMTP settings form to save once. Keep
   Confirm Email on and preserve the current templates, Site URL, redirects,
   and sign-in configuration. Review the effective mail rate limits after
   enabling Custom SMTP. Supabase documents that enabling it can change the
   effective default. An additional manual rate-limit change is a separate
   decision. [Supabase SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp#how-to-set-up-a-custom-smtp-server)
3. Reload and compare the intended public settings with the readback. Inspect
   settings and mail status without exposing credentials. If the save times
   out or the result is uncertain, read back the actual state before any
   further write. A successful save proves configuration only. The new relay
   can take effect for real signup and reset requests as soon as it is saved,
   so choose a quiet window when IT can help verify or revert. Existing
   password sessions, BOQ access and account rights do not use this setting.

### 26.3 Proposed Production acceptance using one controlled account

Approve the test separately from configuration, including the exact test
mailbox, temporary test credentials, permitted Auth actions and closeout. The
preferred scope uses one new controlled NT account for both flows. Its status
stays pending under the current Admin rules. No BOQ or Admin business action
is needed. Perform each of these steps once and retain only redacted outcomes.

| Test | Steps and required result |
|---|---|
| Signup confirmation | Start from `https://boq.ntconduit.com/login` in a clean browser profile and submit the controlled mailbox. Confirm actual receipt and the approved From. Open the link in the same profile and verify that the callback returns to `boq.ntconduit.com`, confirms the intended identity and reaches the existing pending flow. Email confirmation alone does not grant application access. |
| Password reset | Sign out of the test session, then request one reset from the public domain for the same account. Confirm actual receipt. Open the link in the initiating browser profile. Verify the callback stays on the public origin, preserves application destination `/profile`, and lets the authorized test operator set a new password. Sign out, then sign in with the new test password to verify the same identity and its pending status. |
| Closeout | Sign out the test sessions through the normal flow. Record how the test account will be retained as pending or closed under the separately approved procedure. Record delivery, redirect, verification and password change as distinct results. Capture time, route and a redacted delivery outcome. Exclude passwords, email links, Auth codes and session tokens. |

An email arriving does not prove the link works. If mail is missing, distinguish
relay rejection, delayed or quarantined mail, and a link or browser failure.
Avoid repeating a request whose result is uncertain. If a mail gateway consumes
or rewrites the one-time link, have IT confirm that behavior before changing a
template or security control.
[PKCE browser requirements](https://supabase.com/docs/guides/auth/sessions/pkce-flow#limitations) ·
[Supabase email link validity](https://supabase.com/docs/guides/deployment/going-into-prod#email-link-validity)

### 26.4 Rollback and release decision

If IT reports unauthorized relay activity, a TLS or authentication failure,
or sender/delivery problems introduced by the change, stop further test sends.
Read the current settings and, with explicit rollback authority, restore the
observed prior SMTP mode by turning **Custom SMTP** back off. Reload and
verify that mode, existing mail limits, Confirm Email, templates, Site URL and
all six redirect entries. If a rate limit differs after reverting, report the
actual difference for review. Ask IT to revoke the dedicated credential if it
is exposed or the relay use is abandoned. Previously issued mail and completed
account actions are outside what switching SMTP can undo.

The default service's team-recipient restriction returns on rollback. Keep
UM-A2 on **HOLD** until the approved mail checks pass, then refresh the
remaining Solo release checks from section 24.3 and seek publication approval.
This is the proposed gate at the time of the SMTP review. See the
[later release decision](#27-um-a2-production-closeout) for the accepted
exception and final status.

### 26.5 Production SMTP checkpoint

On 2026-11-14 (Asia/Bangkok), the Owner saved Custom SMTP in the Production
Supabase Dashboard. Readback showed Custom SMTP enabled and
`mail.ntplc.co.th:465`. The Dashboard masked the sender address, username and
password. This evidence covers the saved host and port and does not establish
the IT approval status or the exact sending credential.

On the deployed UM-B app, the Owner submitted one authorized signup. The UI
showed the check-email message. Scoped read-only Auth logs recorded
`user_confirmation_requested` and status `200` around 22:38. The Owner then
provided a screenshot showing the confirmation email in the NT mailbox at
22:38. This records **PASS for delivery of that signup email**. Keep the
recipient and raw link out of the repository. No hosted callback was
verified. The Owner stopped the test because the mailbox holder was no longer
available. No reset request was sent and UM-A2 was not published.

| Check | Result |
|---|---|
| Hosted signup email arrival | **PASS**, one authorized test on the deployed UM-B app. |
| Hosted confirmation link returns to the public BOQ domain and establishes the expected session | **NOT VERIFIED**, user stopped the test. |
| Hosted reset email, link to `/profile`, password change and sign-in using the new password | **NOT RUN**. |
| Isolated Docker signup callback and reset through sign-in with the new password | **PASS by case** on the seven-file candidate. See section 24.2 for the historical harness results. |

The local source hashes still match the tested seven files at this checkpoint.
Do not reopen the stopped test or reuse the mailbox without a new decision.
UM-A2 remains on hold under the current release plan. The Owner can later
choose a fresh authorized mailbox for the outstanding hosted checks. If the
Owner instead accepts the specific missing hosted evidence as an exception
for this seven-file release, record both outstanding cases as such and retain
the full local evidence. This would leave a risk that the hosted mail or
callback behaves differently from Docker. Refresh the remaining read-only
release preflight and verify the exact UM-B rollback target before any
authorized publication. [Solo release process](../../07_process/RELEASE_PROCESS.md)

This checkpoint predates the Owner's option 2 decision and the completed
[UM-A2 release](#27-um-a2-production-closeout).

## 27. UM-A2 Production closeout

The Owner chose option 2 for the exact seven-file UM-A2 release. The real
confirmation link and password-reset flow would remain **NOT RUN** on
Production. Read-only preflight confirmed local and GitHub `main` and
Vercel Current at UM-B `e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac`. The
seven hashes and candidate tree matched [section 24](#24-um-a2-solo-release-review).
The released build's public assets confirmed the expected Supabase binding.

| Gate | Outcome on 2026-11-14 (Asia/Bangkok) |
|---|---|
| Source | **PASS.** One Solo commit on `main`: `33a0f426842c1c0ec69abd23b95d7c8bbf93dda5`. Parent was the exact UM-B commit above. Tree `eaa3cd678fe32f4a70483451b96af2c14614862f` contains the seven approved changes. |
| GitHub Quality | **PASS.** Run [43614551139](https://github.com/cloudstellar/conduit-boq/actions/runs/43614551139) passed lint, tests and build. |
| Vercel | **PASS.** [`dpl_ANBpWZ16EHX6uZTbsTNHyDuDMKuy`](https://vercel.com/cloudwho-2662s-projects/conduit-boq/ANBpWZ16EHX6uZTbsTNHyDuDMKuy) was Ready/Current on `boq.ntconduit.com` for that exact source. |
| Anonymous no-write smoke | **PASS.** Login and public assets loaded. Both missing-code and inert malformed callbacks returned the expected relative redirect and privacy headers. The help page rendered, its fragment became `#link`, and an adjacent URL redirected to Login. The isolated browser made zero Auth/Data or non-GET requests. The initial raw-HTML check wrongly required the client-rendered Login form in the server HTML; the corrected HTTP check and independent browser check passed. |
| Real Production confirmation link and session | **NOT RUN** for UM-A2, per the Owner's release decision. |
| Real Production password reset and sign-in with the replacement password | **NOT RUN** for UM-A2, per the same decision. |
| Rollback | Available in the approved release window against the verified immediate predecessor `dpl_R8ZZVx4oqC4MY12f1zD3Tzb39weu` (UM-B). Conditions did not trigger. |

The prior UM-B test verified one signup email arrived, with that confirmation
callback **NOT VERIFIED** and reset **NOT RUN**. The isolated Docker
per-case passes and historical harness FAIL remain as recorded in
[24.2](#242-local-test-decision) and [26.5](#265-production-smtp-checkpoint).
The seven-file deployment sent no additional emails and made no DB or
configuration changes. Its publication and conditional rollback authority
are consumed. The private release receipt is
`/private/tmp/um-a2-solo-release-20261114-njymacek/release-result.json`.

This closes UM-A2 within the recorded gates. Review [Admin assignment when
a request is wrong](#21-admin-assignment-for-an-incorrect-affiliation-request)
next. This closeout records prior results and was prepared locally.
