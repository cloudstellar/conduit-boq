# Phase 4 P-49 Pending-Account Authorization Hardening Plan

> **Current Master Catalog end-to-end closeout (2026-08-28):**
> Data/publication remains complete at `2568.1.0` / `710` active rows with
> reviewed ITEM-0429 and ITEM-0615 values, reviewed XLSX/PDF, no historical BOQ
> reprice, and no Factor F change. P-13/P-14/P-14C/P-15 are complete; they
> must not be replayed. Exact release commit `f3ccc6e...` is on `github/main` and its
> Vercel Production deployment is `Ready`. Migration 028 was applied exactly
> once as `20260828070433/master_catalog_admin_gate_projection`; migrations
> 027 and 028 are immutable/no-replay.
> [Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md)
> retains the invariant and recovery contract. The full audited Admin draft
> workflow is live with Admin/New identity/Retirement exact boolean
> `true/true/true`; published rows remain immutable. Stages A/B/C passed and
> both disposable drafts are `abandoned`, leaving zero working drafts. P-49
> technical implementation and formal closeout are complete. Its unrun expanded
> Production persona rehearsal remains an accepted residual, never a
> retrospective PASS. [Result #107](./107-phase4-p49-master-catalog-final-closeout-result.md)
> is the final Production receipt. `APPROVE MASTER CATALOG FINAL` is consumed;
> there is no open release block, replay, or automatic next step. No catalog
> publication/restore, pointer movement, BOQ mutation, or Factor F mutation
> occurred during this final rollout.
> This overlay supersedes all prior live Status/Current/next-action wording;
> all dated text below is retained as historical evidence only.

<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V2 {"schema":"conduit-boq/master-catalog-admin-edit-status/v2","recordedAt":"2026-08-28T14:32:33+07:00","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"migration028AppliedOnceNoReplay":true,"migration028Ledger":"20260828070433/master_catalog_admin_gate_projection","readOnlyAdminUiLive":false,"fullAdminDraftUiLive":true,"endToEndComplete":true,"p49FormalCloseoutComplete":true,"expandedProductionPersonaTestAcceptedResidual":true,"plan":"105-phase4-master-catalog-admin-edit-completion-plan.md","closeoutResult":"107-phase4-p49-master-catalog-final-closeout-result.md","target":"full-active-admin-draft-workflow","targetAchieved":true,"publishedHardDeleteAllowed":false,"p19Policy":"official-pdf-active-only-draft-pdf-mark-inactive","p19ImplementationComplete":true,"p19RenderedFixturesVerified":true,"p19LocalTestResult":"48-files-444-tests-pass","migration028Required":true,"migration029Required":false,"catalogAdminEnabledCurrent":true,"catalogNewIdentityEnabledCurrent":true,"catalogRetirementEnabledCurrent":true,"catalogAdminEnabledTarget":true,"catalogNewIdentityEnabledTarget":true,"catalogRetirementEnabledTarget":true,"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe","releaseCommit":"f3ccc6ec389d4ae7d09f75e15d0857c45515c96e","vercelProductionReady":true,"productionQaResult":"pass","workingDraftCount":0,"openWorkIds":[],"planDocsAmendmentAuthorized":true,"planDocsAmendmentComplete":true,"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL","finalReleaseAuthorizationConsumed":true,"applicationCodeAuthorized":false,"commitAuthorized":false,"pushAuthorized":false,"mainMergeAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"deployAuthorized":false,"flagChangeAuthorized":false,"automaticNextStep":false} -->


**Status:** OPEN SECURITY RISK; BUSINESS TARGET RETAINED; REMEDIATION DEFERRED
UNTIL AFTER THE FIRST P-15 CLOSEOUT UNDER THE TIME-BOUND P-51 WAIVER;
IMPLEMENTATION NOT AUTHORIZED
**Recorded:** 2026-08-17 02:58 +07
**Repository evidence HEAD:**
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443` (pre-P-49 implementation)
**Production access for this decision review:** None

<!-- P49_PENDING_AUTHORIZATION_DECISION_V1 {"schema":"conduit-boq/p49-pending-authorization-decision/v1","recordedAt":"2026-08-17T02:58:08+07:00","businessIntent":"pending-profile-onboarding-only","masterCatalogRls":"preserve-022-023-active-only","catalogReadWideningAuthorized":false,"decisionRecordLocalCommitAuthorized":true,"historicalTestCommentAuthorized":true,"externalGitPublicationAuthorized":false,"implementationAuthorized":false,"databaseHardeningRequired":true,"p13Authorized":false,"automaticNextStep":false} -->

<!-- P49_P51_WAIVER_DISPOSITION_V1 {"schema":"conduit-boq/p49-p51-waiver-disposition/v1","recordedAt":"2026-08-18","p49RiskOpen":true,"businessTargetRetained":true,"remediationDeferred":true,"deferredUntil":"after-first-p15-closeout","waiver":"P-51","waiverScope":"first-p13-through-p15-closeout-only","waiverExpires":"immediately-on-first-p15-closeout","calendarReapprovalRequiredAt":"2026-08-25T23:59:59+07:00","p49ReentryDeadline":"before-next-production-deploy-and-target-within-7-calendar-days-after-p15","p49ImplementationAuthorized":false,"migrationReserved":false,"proposal47Approved":false,"automaticNextStep":false} -->

## Current P-51 supersession

P-51 accepts the documented P-49 residual risk only for the bounded first
Phase 4 closeout sequence through P-15. It changes the timing of remediation;
it does not close, downgrade, disprove, or remediate any finding in this plan.
P-49 therefore no longer independently hard-stops consideration of the first
P-13, P-14, and P-15 decisions, but none of those decisions is authorized by
P-51 or by this document. Every existing gate still requires its own exact
Owner decision and evidence.

The waiver requires fresh Owner reapproval if the first P-15 closeout has not
finished by 2026-08-25 23:59:59 +07; it has no automatic calendar extension.
It expires immediately when the first P-15 backup/closeout is recorded. After
that point, P-49 returns to the active remediation queue and requires a fresh
authorized read-only live-posture review followed by a rewritten exact
proposal. Re-entry must occur before the next Production deployment, with a
target of completing the re-entry decision no later than seven calendar days
after P-15 closeout. The waiver does not cover a second release/publication,
scope expansion, a new privileged surface, or continued deferral after that
closeout. Evidence of exploitation, unauthorized disclosure/escalation, or
failure of an existing active-only catalog control ends reliance on the waiver
and is an immediate stop/escalation condition.

## 1. Owner decision and authority boundary

The Owner accepted the safest business outcome: `pending` means an
authenticated but not-yet-approved identity. It is an onboarding state, not a
business-operation role. A pending user should see a truthful waiting-for-
approval experience and may use only authentication self-service plus the
minimum profile/onboarding surface described below.

The active-only Master Catalog RLS installed by applied migrations `022` and
`023` remains the intended catalog boundary. A migration whose purpose is to
restore issued-catalog access to pending users is rejected and must not be
created. In particular, the earlier proposed filename
`027_master_catalog_pending_issued_read_compatibility.sql` is withdrawn.

The Owner's original UI/permissions direction was a business-intent decision.
The subsequent cross-layer review found that an application-only correction
cannot enforce it. P-49 therefore records the intended outcome and the newly
discovered blocker; it does **not** authorize implementation.

The original P-49 decision authorized only its bounded decision-recording
package. P-51 supersedes only the former timing/hard-stop disposition for the
first P-13-through-P-15 closeout sequence. It authorizes no P-49
application/runtime/migration implementation, Local or Production database
query/write, external Git publication/push, PR, `main` merge, deploy, feature
flag, or automatic next step. Any P-49 posture read, forward-only database
correction, matching application work, or external publication requires a
separate exact Owner decision after the first P-15 closeout unless P-51 is
itself explicitly superseded.

## 2. Why UI-only enforcement is unsafe

ADR-001 makes PostgreSQL RLS the primary authorization layer because browser
clients call Supabase directly. Supabase/Postgres best practice likewise
requires deny-by-default database enforcement and least-privilege grants; UI
navigation is not a security boundary.

The repository and frozen Production-baseline evidence show these unresolved
cross-layer paths:

1. `022`/`023` correctly require `status='active'` for all seven Master Catalog
   read surfaces, so pending catalog reads already fail closed.
2. Applied BOQ policies in `009` still allow an owner branch without a current
   active-status requirement. Pending, inactive, suspended, missing-profile, or
   unknown-status owners may therefore retain direct BOQ/header/child access.
3. The current `SECURITY DEFINER` `save_boq_with_routes` body in `016` accepts
   `active` or `pending` and permits a pending owner to save.
4. Frozen `app_settings_select USING (true)` plus table grants permit anonymous
   and authenticated reads; insert/update policies check stored admin role
   without current active status. If login/onboarding needs public config, it
   requires a bounded safe projection rather than raw settings.
5. Factor F policies expose both the legacy `factor_reference` surface and the
   versioned `012` tables to authenticated tokens without the P-49 active-status
   boundary; views and RPCs must be inventoried with them rather than testing
   only one table family.
6. The frozen baseline policy `Users can view all profiles` permits every
   authenticated token to select every `user_profiles` row. Pending, inactive,
   and suspended identities may therefore be able to read other-user profile/
   PII data directly.
7. The same baseline grants `authenticated` broad table privileges on
   `user_profiles`. `Users can insert own profile` checks only `auth.uid() = id`
   while `status` defaults to `active`; own-row UPDATE constrains the row ID but
   not protected columns; `Admins can update all profiles` trusts stored role
   without active status; and `lock_org_fields_after_onboarding()` does not
   guard `role` or `status`. A missing-profile caller may therefore self-create
   an active/admin profile, and an existing caller may self-promote.
   Exact current Production grants/policies must be verified read-only before
   claiming either live exploit as confirmed. These remain open security risks;
   P-51 accepts them only for its bounded first-closeout window and does not
   convert them into a safe baseline.
8. Organization/department/sector policies expose all selector rows to every
   authenticated status without an `is_active` predicate. P-49 permits pending
   only the active selector subset and permits inactive/suspended users none.
9. Authenticated callers retain EXECUTE on `can_approve_boq(uuid)`, which reads
   stored role without active status, and on `get_user_role(uuid)` /
   `is_admin(uuid)`, which expose arbitrary users' role/admin state rather than
   a self-scoped result.
10. `/api/admin/users/[id]` checks `role='admin'` without also requiring
   `status='active'`, then invokes a service-role user deletion. Pending
   middleware blocks `/admin/**`, not `/api/admin/**`.
11. Current client permissions, profile copy, and export code still describe
   pending catalog/own-BOQ access, producing a confusing partial failure after
   P-12 rather than a truthful waiting state.

Evidence bytes reviewed at the recorded HEAD:

| Evidence | SHA-256 |
|---|---|
| `migrations/005_phase1a_seed_and_rls.sql` | `767009873242d7c74d652343290af34ed906e4fc6b92339244a75b9c22aeeded` |
| `migrations/007_app_settings.sql` | `2f1c6200248c3bfa86fd93ae08ea9867fd45a76d1d3970cd2b6c831b9a06069d` |
| `migrations/008_rls_and_trigger.sql` | `63ec56740e9b7940bf7e312d2f33154acbbb3794bbb8646a6fddb5115f66d811` |
| `migrations/009_master_catalog_p0_containment.sql` | `6d18fd4365b0f4ca8cb69582a276cd1b3e48c01b01bc7046c5306746719b57d2` |
| `migrations/012_factor_f_version_foundation.sql` | `dd574de138bcfa3bfb3495ed5c216a66ab1d3c844a0cdd12af7bd35f21fa5bd1` |
| `migrations/016_hotfix_preserve_boq_item_suffix.sql` | `23067432081325a423355cd5dddc3166e2b7312e2a13c74c36458a818b5a505d` |
| `migrations/022_master_catalog_phase4_draft_identity_and_release_number.sql` | `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3` |
| `migrations/023_master_catalog_phase4_published_code_rls_scope.sql` | `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88` |
| `supabase/local/production-baseline.sql` | `4aad05cdd2b790b4b7d7459aa874422d53871caee3be243b30307a59048a443d` |
| `lib/permissions.ts` | `0084726044dbff81026b9f0925d6399b2f302cc8c1bbfe15292dc8bf08f34baa` |
| `lib/supabase/middleware.ts` | `2b42d35c2596c10df4d2b86c14e46fd9151dd56b8193d34c5ccbfe29741aa0ce` |
| `app/api/admin/users/[id]/route.ts` | `bfa515ec3b073341897f8a313d2c47411e556c306d63043d0af091f58a7418be` |
| `app/profile/page.tsx` | `e242da508a1f0ec01795d0f3a832502d732c1f13653c6dde0d973e30f546ee58` |
| `lib/master-catalog/export/data.ts` | `08758042cd0112e4f30554ddc2ff18f60cf0bec3248d1954e262b3f6d89bb5f3` |

## 3. Canonical target matrix

This table is the approved target, **not** a statement that implementation has
already passed.

| Resource/action | Anonymous | Pending, any role | Active non-admin | Active admin | Inactive/suspended |
|---|---:|---:|---:|---:|---:|
| Login/signup/reset/session callback | As applicable | Yes | Yes | Yes | As applicable |
| Logout/change password | No session | Yes | Yes | Yes | Yes |
| Read own profile/status | No | Yes | Yes | Yes | Yes |
| Update own safe profile/onboarding fields | No | Yes | Yes | Yes | No |
| Change `role`, `status`, actual org, approval/audit, identity, email, or timestamps | No | No | No | Active-admin workflow/RPC only | No |
| Read active organization/department/sector onboarding selectors | No | Yes | Yes | Yes | No |
| Dashboard/business navigation | No | No | Yes | Yes | No |
| Own or other BOQ read/create/update/delete/duplicate/print/export | No | No | Existing role rules | Existing role/SoD rules | No |
| Published Price List/Master Catalog read/export | No | No | Yes | Yes | No |
| Catalog draft/audit/frozen-authority/admin RPCs | No | No | No | Existing flag plus active-admin rules | No |
| Factor F read/write | No | No | Existing active read; no direct write | Existing approved contract | No |
| Other profiles and settings | No | No | Preserve the separately approved role-scoped active-user contract; do not broaden or silently narrow it in P-49 | Existing active-admin contract | No |
| User management and privileged APIs | No | No | No | Active admin only | No |

Safe pending-owned BOQ custody is invariant: existing rows are retained without
deletion, reassignment, repricing, or mutation. They are invisible and
inoperable while the owner is pending and become available again only after an
authorized transition to `active`, subject to normal active-role rules.

Safe pending profile fields are limited to `first_name`, `last_name`, `title`,
`position`, `employee_id`, `phone`, the requested department/sector fields, and
the bounded onboarding-submission transition needed by the approved flow.
Protected identity, authority, organization, role/status, approval/rejection,
and audit fields are never self-service. The implementation design must resolve
rejection/resubmission explicitly; copy must not promise a resubmission path
that the database trigger rejects.

Unknown status, missing profile, stale authorization state, or an unclassified
route/resource/action fails closed. A role stored on a pending profile grants no
business authority until the current database status is `active`.

The target state machine is explicit: trusted signup/onboarding enters `pending`;
activation occurs only through the audited active-admin approval workflow;
rejection keeps the identity non-active while recording rejection metadata and
must use a defined resubmission transition. A generic status/role editor must
not substitute for approval. An `active` account is revoked with `inactive` or
`suspended`, never downgraded to `pending`. Direct or invalid transitions fail
atomically.

## 4. Deferred forward-only correction after the first P-15 closeout

The exact implementation remains unapproved and is deliberately deferred under
P-51. After the first P-15 closeout, a fresh authorized read-only live-posture
inventory must precede a rewritten proposal. That later proposal must preserve
applied migrations and use whatever append-only ledger entry is next and
unreserved at that future review point to:

1. require a current active profile for BOQ header/child visibility and every
   BOQ mutation path, including `save_boq_with_routes`; missing, unknown,
   pending, inactive, and suspended profiles must fail closed;
2. deny non-active access to legacy and versioned Factor F tables, views, RPCs,
   and other business-data reads while preserving the approved active-user
   contract;
3. replace broad profile SELECT/INSERT/UPDATE grants and policies with a scoped
   status/role row boundary plus safe-field mutation boundary; profile creation
   occurs only through the trusted signup/onboarding path and creates `pending`;
   deny other-user reads to non-active identities, prevent self-mutation of
   protected fields, and reject role-only admin UPDATE;
4. expose only active organization/department/sector rows to pending onboarding
   and deny selector access to inactive/suspended/missing/unknown profiles;
5. restrict `app_settings` and all role/status/profile helpers to their exact
   approved audiences; self-scope role lookup where possible and remove
   arbitrary-user metadata disclosure from non-admin callers;
6. require current `status='active'` plus the exact approved role/scope in every
   business or privileged RPC, API route, and server action before any
   service-role operation;
7. align `can()`, middleware, page/server loaders, export/print, navigation,
   copy, and error behavior with an exact pending allowlist;
8. provide a dedicated waiting-for-approval state that performs no business
   queries and offers only truthful profile/onboarding, status/contact, password,
   and logout actions; and
9. preserve all approved active-user, BOQ, catalog, and Factor F data and
   behavior; any unrelated active-profile minimization requires its own decision.

This plan deliberately does not reserve a migration filename or ledger value.
“No pending catalog compatibility migration” does not mean “no database
hardening migration.” The exact number, bytes, rollback/fix-forward contract,
and execution authority must be derived from the post-P-15 live posture and
then approved as a later reviewed change.

## 5. Post-waiver remediation acceptance gates

### 5.1 Database and real-session authorization

- Run a clean isolated Supabase/PostgreSQL chain with actual authenticated
  sessions/Data API/RPC calls for anonymous, pending, active roles, inactive,
  suspended, missing-profile, and invalid/unknown-status personas.
- Pending/inactive/suspended/anonymous receive zero business rows and cannot
  write BOQ, BOQ items/routes, catalog, Factor F, settings, or admin data.
- Anonymous/pending/inactive/suspended cannot read raw `app_settings`; no
  non-active stored admin role can insert/update settings or pass
  `can_approve_boq`. Any public onboarding config is an explicit safe projection.
- Pending/inactive/suspended cannot select any other-user profile row through
  direct Data API/RPC access; inactive/suspended cannot update their own
  onboarding/profile fields.
- A missing-profile token cannot INSERT its own row, choose `role`/`status`, or
  exploit the `active` column default; trusted signup yields the exact pending
  profile shape only.
- Pending receives only active org/department/sector onboarding selectors;
  inactive/suspended/missing/unknown profiles receive none.
- `get_user_role`/`is_admin` cannot expose arbitrary-user role/admin metadata to
  a pending, inactive, suspended, anonymous, or ordinary non-admin caller.
- Pending own/other BOQ read/insert/update/delete and
  `save_boq_with_routes` all fail with zero partial effect.
- Pending safe-profile updates pass; every protected-column mutation,
  especially self-`role='admin'` or self-`status='active'`, fails.
- Active-admin approval/rejection and permitted role/status administration are
  atomic and audited; inactive admin and every non-admin are denied.
- Generic status editing cannot perform pending -> active, active -> pending, or
  any other transition that bypasses the approved state machine; revocation and
  rejection/resubmission follow their exact audited paths.
- Existing active staff/admin behavior, BOQ/Factor F bindings, catalog pointer,
  Phase 4 flags, and hashes remain unchanged.
- Capture exact grants, policies, function ACL/body hashes, advisors, before/
  after counts, and rollback/fix-forward evidence.

### 5.2 Application and server boundary

- Pending `can()` permissions are profile/onboarding-only.
- Pending page navigation uses an exact allowlist; every business deep link is
  denied or redirected to the waiting state without leaking data.
- Missing profile, unknown status, profile-fetch failure, and stale role/status
  fail closed before any business query. Pages show a bounded recovery/error
  state; `/api/**` returns stable `403` JSON rather than continuing or redirecting
  to HTML.
- `/api/**` denials are stable `403` JSON, not an HTML redirect.
- Every privileged API/server action checks current database role and
  `status='active'`; service-role use occurs only after that check.
- Pending catalog export/print, Factor F, BOQ loaders/actions, and admin APIs are
  denied server-side.
- The waiting page makes no Dashboard/catalog/BOQ/Factor F query and contains
  no business action/link. Profile copy no longer says a pending user can create
  a BOQ.

### 5.3 State-transition and custody E2E

- Signup -> pending -> profile/onboarding submission -> waiting state.
- Pending -> active by an active admin -> fresh authorization on the next
  request/profile refresh -> normal permitted application access.
- Rejection/resubmission matches both UI copy and database transition rules.
- Revocation while an editor is open causes the next save to fail atomically.
- Pre-existing pending-owned BOQ counts/hashes stay unchanged while hidden and
  become accessible after valid activation without data migration.

### 5.4 Release evidence

- Unit, integration, direct Data API/RPC, route/API, and browser tests cover the
  complete status x resource x action matrix.
- Clean bootstrap, append-only correction, advisors, TypeScript, lint, full
  tests, build, exact remote CI, and Preview pass on one frozen commit.
- Canonical security docs, Decision Register, Verification, Tracker, runbook,
  handoff, and implementation inventory agree on the same matrix.
- Separate Owner authority is recorded for Local/live correction evidence and
  for any later Production database action.

## 6. First-closeout waiver and post-P-15 disposition

P-12 and its post-`026` backup remain complete and immutable. This finding does
not rerun or roll back migrations `017`-`026` and is not evidence of catalog,
BOQ, or Factor F row corruption.

P-49 remains an **OPEN SECURITY RISK**. Under P-51 it is not, by itself, a
hard-stop on the separately gated first P-13-through-P-15 closeout sequence.
The Quality/Preview evidence on
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443` remains historical pre-P-49
evidence and is not automatically an approved deployment candidate. P-51 does
not waive exact-source, CI/Preview, deployment-fingerprint, smoke, backup, or
Owner-decision requirements at P-13, P-14, or P-15.

The deferral requires fresh Owner reapproval at 2026-08-25 23:59:59 +07 if the
first P-15 closeout has not finished, and ends immediately at that closeout.
The next P-49 action after that milestone is not implementation: it is a
separately authorized read-only live-posture capture, including policies,
grants, functions, overloads, views, service-role surfaces, current application
dependencies, and affected account/data-state counts. Proposal #47 is deferred
and must be rewritten from that evidence before any source, Local, Git, or
Production correction request. Re-entry is required before the next Production
deployment, with a target of completing its decision within seven calendar days
after the P-15 closeout.

## 7. Historical-record rule

Do not edit applied migrations `005`, `007`, `008`, `009`, `012`, `016`, `022`, or
`023`, and do not rewrite P-12 evidence. Older documents and tests that record
the former “pending owns BOQ” contract remain historical evidence only; add a
P-49 supersession note rather than relabelling their past result. The P39R
active-only catalog rule remains current and is not weakened.
