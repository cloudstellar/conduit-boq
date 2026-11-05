# User Management UM-A and UM-B Plan

Recorded: 2026-10-24 (Asia/Bangkok)
Approval-packet update: 2026-10-26 (Asia/Bangkok)
Status: LOCAL VALIDATION COMPLETE / SOLO RELEASE PLAN FOR OWNER REVIEW — no publication/Production authority

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

For the current bounded decision, read [section 11: UM-A1 approval packet](#11-um-a1-approval-packet)
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
027–032 remain immutable/no-replay. Existing local credentials, data, nine
parity artifacts and protected archive custody remain unchanged.

The bounded S0/032 prerequisite was selected and completed separately. Remaining
proposed order is Admin-only UM-A1 / scoped NT pilot → narrow section15 UM-B
legacy affiliation confirmation → separately reviewed UM-A2 signup/confirmation
→ remaining UM-B and account-security policy. This is not a new execution
approval or a request to repeat S0. Full-site restyling remains incremental;
no additional PR process follows from this planning sequence.

## 2. Confirmed contracts and unresolved facts

| Area | Evidence and limit |
|---|---|
| Authentication | The app already uses Supabase Auth and SSR cookies; signup, password login, recovery and code exchange exist. The installed SDK also supports explicit signup-confirmation resend. No new Auth stack or package is required for this design. |
| Application authority | Current profile status/role/scope and guarded API/RPC/RLS remain authoritative. Email confirmation and application approval are separate. User-editable metadata and requested affiliations must not grant authority. |
| Admin commands | Existing RPCs approve/reject, change an active account's role and suspend/deactivate/reactivate with active-admin, target, reason and request-ID guards. They do not support choosing a new role and affiliation atomically during approval. |
| Directory | Existing get_admin_profiles_page accepts cursor and limit up to 100, orders by created_at/id descending, and supplies neither global search/filter nor exact total. |
| Legacy affiliation | One bounded Owner-approved account read on 2026-10-24 recorded active staff, missing actual organization/department/sector, and valid requested department/sector. This explains that observed requested-affiliation label, not all accounts. Absence of approval metadata/audit does not establish who changed it or whether historical approval ever occurred. No personal identifiers or raw query results belong in this plan; that read permission is consumed. |
| Later bounded read and Owner report | Section15 records the 2026-11-02 one-account READ ONLY result and the Owner's explicit prior-approval report separately. Actual affiliation remains NULL; its historical cause is unknown. The evidence does not justify automatic repair or another Production read. |
| Mail/configuration | Actual hosted confirmation settings, SMTP, templates, redirect configuration, delivery and rate limits remain unverified for UM-A. Public documentation or local mail capture is not fresh hosted evidence. |
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
| UM-A2 — user-facing Auth follow-up | Signup/confirmation/resend/error guidance, narrowly reviewed callback routing and pending/profile presentation | This reaches current users too; establish actual configuration and regression evidence under a new exact scope before implementation. It is not an Admin-only restyle. |
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

Flow: signup request → email confirmation when required by actual Auth config
→ own profile/requested affiliation → Admin review → active application access.
Handle both session-present and no-session signup results. A successful call
supports request-accepted guidance, not proof of delivery, verification, new
account creation or application approval. Do not infer account existence from
identities, profiles or lookup APIs. Map bounded error codes to safe Thai copy;
never render raw callback/provider details, tokens or passwords.

Resend is a deliberate user action through the existing Auth SDK, with busy
state and cooldown guidance; backend rate limits remain authoritative. Do not
send on page load. Preserve recovery and safe same-origin redirects.

Preserve the existing organization-email normalization in login, signup and
recovery, including both a short username and a full email address. The current
input deliberately uses type="text", autocomplete="username" and inputMode="email".
A redesign must not introduce native email validation that rejects the short
form before normalization. Keep password-manager/autofill behavior and test both
input forms through the same existing admission and Auth boundaries.

The concept button “แก้ไขอีเมล” must become “กลับไปกรอกอีเมลใหม่”: without an
authenticated session this is not an edit of an existing Auth identity. A new
address is a new signup intent and may leave an older unconfirmed account.
Show the normalized address clearly before submit; do not delete, merge or
rewrite old accounts to hide this outcome. Retention/cleanup is a later policy.

The proposed callback fix includes a narrowly recognized callback-error route
case for existing active/pending sessions, preserving cookies and blocked-account
handling. Adding a Login banner alone is insufficient because current middleware
redirects signed-in users first. Unknown error values must not loosen business
route guards or trigger automatic logout. This routing change requires explicit
regression coverage in the future candidate.

### UM-A2: Pending and profile presentation

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

UM-A2's separate possible boundary is app/login/page.tsx,
app/auth/callback/route.ts, lib/supabase/middleware.ts, app/pending/page.tsx and
app/profile/page.tsx. components/dashboard/DashboardHeader.tsx may later change
only truthful account guidance. These are not A1 paths. AuthProvider/useUser,
shared authorization logic and global layout are excluded from A1; do not expand
into them to make an Admin visual change easier.

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

After account/security minimum, wider R0/D0 precedes an operational BOQ workflow.
Real-paper approval remains with the conduit engineering section manager; the
app recorder is a separate undecided authority. Lock operational content and use
ordinary existing Copy to a new independent draft for correction. No mandatory
revision-chain/source-link/supersede engine is added. TOR three-name fields do not
create account roles. Names and wording are per-print inputs without database
persistence in the first release; exact print form and blank Excel template are
separate output decisions. Quantity Expression follows the approved numeric foundation.

## 8. Decisions and present status

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

**Current UM-B planning state:** **AUDIT_CONTRACT_DEFINED_IN_PLAN — POSITIVE_FIXTURE_HOLD_NO_LOCAL_SHAPE**.
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
| แผน/แบบ/ขอบเขต A1 | **FUNCTIONAL + SETTLED VISUAL LOCAL PASS** | New18functionalreceipt + [section14visualreceipt](../../06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md); olderFAIL/NOTRUN/rejectedimages retained; Ownerreview/productionpreflight/release still separate |
| Execution contracts R1–R7 | **LOCAL EVIDENCE RECORDED WITH LIMITS** | ใช้ผลจริงและ NOT RUN ใน receipt; closure matrix13.3 ด้านล่างเก็บเกณฑ์เดิม ไม่ใช้แทนผล runtime |
| งานที่อนุมัติอยู่ | **QUALIFICATION + READONLY PREFLIGHT COMPLETE / GRANTS CONSUMED** | Only local result/handoff/document review now;no source/package/DB/Auth/Docker/fixture/furtherProduction/stage/commit/push/deploy. Existing closed runs remain closed |
| A1 implementation | **CORRECTED LOCALLY / UNCOMMITTED / NINE HASHES UNCHANGED** | Runtime5+tests3+mockrunner1;accepted hashes match on639 baseline. No shared Auth/domain/config/package/DB-contract edit;source not changed in this refresh |
| A1 local DB/API preflight | **DATED NOV2 NEW18 PREFLIGHT + FINAL CUSTODY PASS** | Existing DB/container/volume/full service graph, actual PostgREST14.5/cap1000/exact post031 metadata unchanged; original125profiles/126Auth identities,32tables/26sessions/544Authaudits protected;143profile/6page exact traversal PASS |
| A1 test accounts/data | **OLD105 CLOSED / NEW18 FINALIZED** | Newrun `um-a1-20261102-real18` retained18Auth/profile/identity:15inactive/2pending/1suspended;0active/0new sessions/0newOwner sessions/0unresolved intents; no BOQ write or original-account repair |
| A1 mock/static/browser/API/DB acceptance | **DATED REAL FUNCTIONAL + SETTLED VISUAL PASS** | Sameapplication845tests/63files/9mockgroups;31APIchecks/13distinctfunctionalbrowsergroups remain datedsame-sourcePASS;section14 freshNode24Turbopack/TS+29PNGvisual/custody PASS. NewtoolfirstmissingimportFAILbeforeAuth preserved,fixedimportonly; CI/Production NOT RUN |
| Fixture finalization | **PASS — BOTH RUNS CLOSED / NO ACTIVE RESIDUE** | New18 independentSQL confirms0active/0sessions, originals32table digests/26sessionlinks/544Authaudits retained; old105manifest/package/027–031/parity/credential hashes unchanged; retain accounts/audit, no harddelete/reset |
| คำสั่งที่ผลไม่แน่นอน | **REAL UUID-KEYED CONTAINMENT VERIFIED** | Actual held/lost responses, sameJWTrolecycle/timeout,2UUIDsame-target,off-page warning and actorchanges passed;15UIUUIDs/8controlled transitions exactjournal/actual2xx;0serverUNKNOWN left. Exact off-page-newB-success remains mock-only; current value alone never resolves oldUUID |
| A1 publication/Production | **NOT STARTED / NOT AUTHORIZED** | ไม่มี stage/commit/push/deploy/Production operation; การอนุมัติ local ในอนาคตไม่รวม publication |
| A1 Solo proposal | **POST639 EXACT14 SOURCE QUALIFIED / OWNER REVIEW** | Runtime5/tests3/mockrunner1/docs5;fresh878/64/lint0errors3oldwarnings/TS/defaultTurbopack/mock9 PASS. Initial symlink-build FAIL retained. HostedpreflightPASS per12.5;actualA1CI/delivery NOT RUN. Excludeparity9/realrunners4/privatefixtures |
| Narrow UM-B legacy confirmation | **AUDIT CONTRACT SELECTED IN PLAN / POSITIVE FIXTURE HOLD** | Sections15–17; count completed0/0/0, no eligible shape on the verified local snapshot. New-command SQL/positive API/runtime NOT RUN; no implementation-ready claim or permission to create a fixture |
| Local aggregate-only feasibility read | **COMPLETE — READ PASS / FIXTURE HOLD** | Ownerapproved section17;2026-11-02T10:47:54Z, exactexistingDocker/RRreadonly/ROLLBACK;0eligible/0protected/0remaining,0identities. One successfulDBtransaction, earlier client failures beforeconnection retained; grantconsumed |
| Bounded legacy-account Production read | **COMPLETE / READ AUTHORITY CONSUMED** | One target,2026-11-02T08:15:31Z,READONLY:on/ROLLBACK; active/staff,actualallNULL,requestedvalid,approvalfieldsNULL/events0. Owner reports prior approval; causeunknown. NoPII/raw response inrepo; noBOQ/businessRPC/write |
| S0 bounded032 | **COMPLETED OUTSIDE UM / GRANTS CONSUMED** | See S0canonical13–14/source639closeout;keep032/031/Loginfix. No claim that broaderS0 is complete and no fresh Production observation here |
| A2 / UM-B | **SEPARATE PROPOSED WORK** | OrderA1→narrowlegacyconfirmation→A2→remainingUM-B;no new implementation/SQL/fixtures/Production grant |

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

**A1 next safe step:** Owner review the
[post-S0/032 fourteen-path Solo plan](../../07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md),
now that qualification and readonlypreflight passed. Next review/approve the
exact14 source/content envelope for one publication/finalsource-target freshness/
CI-Vercel/anonymousdelivery with optionalconditionalrollback. Source/config/
rollback drift or delay needs scoped refresh;do not assume the snapshot is
perpetual. Do not repeat S0 or reopen105/18 fixtures. Keep027–032/installedguards/
Loginfix/parity/archive/originals unchanged;no current Auth/DB/Production grant.

**UM-B next safe step:** retain the section16 contract and section17.4 actual
zero-count result, then prepare a concrete faithful-fixture/rehearsal proposal
for Owner review. No matching local shape was found; no permission to create
one, inspect more rows or borrow a protected actor. The bounded local read has
completed and grants no further DB access; no
automatic login, protected-account mutation, closed-run reuse or new test stack.
The bounded S0/032 stage is complete;current order is A1→narrow UM-B→A2→
remaining UM-B. Use S0's canonical checkpoint for its dated outcome/limits.

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
- Use one review surface: switch the existing details Sheet to an explicit
  review mode, or replace it with one dialog; avoid nested Sheet+Dialog flows.
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

**No suitable local positive legacy fixture is confirmed.** Normal signup
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
