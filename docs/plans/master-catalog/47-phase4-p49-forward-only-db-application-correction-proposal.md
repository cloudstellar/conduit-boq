# Phase 4 P-49 Deferred Forward-Only Database/Application Correction Draft

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


**Status:** DEFERRED UNDER P-51; NOT APPROVED; NOT A CURRENT EXECUTION PLAN;
NO MIGRATION NUMBER/LEDGER RESERVED; NO IMPLEMENTATION, DATABASE ACTION,
COMMIT, OR PUSH AUTHORIZED

**Prepared:** 2026-08-18

**Proposal base:** `a12b022247d75d7e006fac890fc123e9c0a8e168`
(local-only P-49 decision record; upstream remains
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443`)

**Production access for this proposal:** None

<!-- P49_FORWARD_ONLY_CORRECTION_PROPOSAL_V1 {"schema":"conduit-boq/p49-forward-only-correction-proposal/v1","preparedAt":"2026-08-18","baseCommit":"a12b022247d75d7e006fac890fc123e9c0a8e168","businessIntent":"pending-profile-onboarding-only","status":"deferred-not-approved","deferredUnder":"P-51","deferredUntil":"after-first-p15-closeout","p49ReentryDeadline":"before-next-production-deploy-and-target-within-7-calendar-days-after-p15","currentExecutionPlan":false,"proposedMigrationNumber":null,"proposedLedgerVersion":null,"migrationReserved":false,"proposalDecisionPending":false,"implementationAuthorized":false,"localDatabaseAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p15Authorized":false,"mustReReviewLivePosture":true,"mustRewriteProposal":true,"automaticNextStep":false} -->

## 1. Current disposition — no decision requested

P-51 defers P-49 remediation until after the first P-15 backup/closeout while
retaining P-49 as an open security risk and retaining the approved business
target. This document was prepared before that sequencing decision. It is now
a historical design draft only: it is **not approved**, is not the current
execution plan, and requests no Owner implementation decision.

The former candidate filename
`027_pending_account_authorization_hardening.sql` and ledger value
`20260818002700` are withdrawn and unreserved. They must not be inferred from
this file, created, added to bootstrap/ledger wiring, or protected from use by
another authorized change. The eventual migration number and ledger value must
be selected from the then-current append-only chain after the post-P-15 review.

No P-49 source/static work, Local or Production database read/write, shared test
persona, commit, push, PR, merge, deploy, feature flag, or automatic next step
is authorized here. P-51 only bounds the temporary risk acceptance for the
first closeout; it does not approve this draft or any P-49 implementation. If
that closeout is not finished by 2026-08-25 23:59:59 +07, continued deferral
requires fresh Owner reapproval under P-51; no extension or P-49 action becomes
automatic.

After the first P-15 closeout, the required first step is a separately
authorized read-only live-posture capture. The replacement proposal must be
rewritten from that evidence and independently re-reviewed before any source
implementation request. At minimum it must resolve the exact account state
machine/audit model, safe profile row-and-column projections, signup/default and
selector hierarchy invariants, complete exposed-object/overload/ACL manifest,
RLS `USING`/`WITH CHECK` and concurrency rules, currently deployed application
compatibility, migration rerun semantics, and service-role/Auth-admin race
boundaries. P-49 re-entry is required before the next Production deployment,
with a target of completing the re-entry decision no later than seven calendar
days after P-15 closeout.

Sections 2–7 below are retained only as design inputs for that future rewrite.
Imperative wording in those sections is not current authority or an approved
technical contract.

## 2. Retained target and historical non-goals

Any future rewritten proposal must preserve this P-49 target:

- `pending` is authentication plus own safe profile/onboarding, active selector
  rows, waiting status/contact, password, and logout only;
- `inactive`, `suspended`, missing-profile, unknown-status, stale-profile, and
  profile-read-error callers receive no business access;
- only a current `active` profile may reach business data, with the existing
  active role/organization/SoD rules preserved;
- a stored `admin` role has no authority unless the same current row is
  `status='active'`;
- existing pending-owned BOQs remain byte-for-byte in custody but are invisible
  and inoperable until valid activation; and
- applied migrations `005`, `007`, `008`, `009`, `012`, `016`, `017`-`026`,
  P-12 evidence, catalog pointer/data, Factor F data, and BOQs are immutable.

The future correction must not widen pending Master Catalog access, redesign active-user
authorization, reprice or migrate BOQs, alter Factor F business values, solve
P-50, or authorize P-13/P-14/P-15.

## 3. Historical database design input — rewrite required

A future migration was expected to be transactional, fail closed on unexpected
policy/function/grant shape, and contain no unauthorized data rewrite. Its
exact contract, number, rerun semantics, object inventory, and replacement
order must be redesigned from the post-P-15 live posture; this section cannot
be implemented as written.

### 3.1 Canonical predicates

Create narrowly owned, fixed-search-path helpers for the current caller:

- current profile exists and has a recognized status;
- current profile is `active`;
- current profile is active with a required role; and
- current caller may read only its own safe profile projection.

Revoke `PUBLIC`/`anon` execution. Grant only the roles required by the calling
RLS/RPC contract. Helpers must not accept an arbitrary user ID from ordinary
authenticated callers and must not expose another user's role or status.

### 3.2 Profiles and state transitions

- Remove broad authenticated `user_profiles` INSERT/UPDATE/SELECT behavior.
- Permit self-read of the exact own row; other-profile reads keep only the
  previously approved active role-scoped/admin contract.
- Disallow direct authenticated INSERT. Trusted signup creates exactly a
  `pending` profile through one audited server/database path and does not accept
  caller-supplied role, status, identity, actual organization, approval, audit,
  email, or timestamp values.
- Self-update may change only `first_name`, `last_name`, `title`, `position`,
  `employee_id`, `phone`, `requested_department_id`,
  `requested_sector_id`, and the single bounded onboarding-submission field.
  Every other changed column fails atomically.
- Approval, rejection, resubmission, suspension, reactivation, and revocation
  use explicit audited functions. Pending-to-active requires an active admin;
  active-to-pending is invalid; inactive/suspended callers cannot self-update.
- Replace or supersede `lock_org_fields_after_onboarding()` so role/status and
  every protected field are guarded regardless of onboarding state.

### 3.3 BOQ and child custody

Replace all BOQ, `boq_items`, and `boq_routes` SELECT/INSERT/UPDATE/DELETE
policies so every branch first requires the caller's current active profile,
then applies the existing owner/assignee/sector/department/admin/SoD rule.
Recreate `save_boq_with_routes` from immutable `016` semantics with an active-
only caller gate before validation or writes. A denial or mid-session
revocation produces zero header, item, route, audit, or sequence effect.

### 3.4 Factor F and other business reads

Inventory and bind both legacy `factor_reference` and versioned
`factor_reference_versions`, `factor_reference_rows`, default-pointer views,
and callable RPCs to the active-profile boundary. Preserve current active read
and admin mutation semantics exactly. No Factor F row, pointer, hash, or BOQ
binding changes.

### 3.5 Settings, selectors, and role helpers

- Remove raw anonymous and non-active `app_settings` reads/writes. If login
  needs an email-domain value, expose one allowlisted scalar projection that
  cannot enumerate keys or reveal feature/operational settings.
- Pending and active callers may read only `is_active=true` organization,
  department, and sector selector rows required by onboarding; inactive,
  suspended, missing, and unknown profiles read none.
- Restrict `can_approve_boq(uuid)` to current active callers and preserve its
  normal BOQ/SoD result. Replace arbitrary-user `get_user_role(uuid)` and
  `is_admin(uuid)` exposure with self-scoped results or active-admin-only
  variants. Revoke obsolete signatures when no approved caller remains.
- Reconcile table/view/function grants with the new RLS contract; no broad
  grant may be justified solely because RLS exists.

### 3.6 Migration assertions

Before commit, the migration must assert the exact expected predecessor
objects from Production-applied `026`. After replacement it must assert the
allowlisted policies, grants, function owners/signatures/search paths, and
absence of legacy policies or authenticated direct profile creation. Any
unexpected object is an exception and rolls back the whole migration.

## 4. Historical application/server design input — rewrite required

A future rewritten repository package is expected to address these coordinated
areas, subject to fresh application dependency and compatibility review:

- `lib/permissions.ts`: pending returns true only for own profile read/update;
  inactive/suspended return own profile read only, not update; unknown status
  returns false.
- `lib/supabase/middleware.ts`: distinguish document navigation from `/api/**`;
  use an exact auth/profile/onboarding allowlist; missing/error/unknown profile
  fails closed; business deep links redirect to the waiting/error surface;
  APIs return stable JSON `401`/`403`, never HTML redirects.
- `app/profile/page.tsx`: submit only safe fields, render truthful pending/
  rejected/inactive/suspended states, and match the database resubmission rule.
- add a dedicated waiting-for-approval page that performs no Dashboard, BOQ,
  catalog, Factor F, raw-settings, or other-profile query and exposes no
  business action.
- every BOQ loader/action, catalog and Factor F export/print path, admin loader,
  and server action must validate a freshly loaded current profile before its
  first business query; database RLS remains the final boundary.
- `app/api/admin/users/[id]/route.ts`: require current active admin before any
  target lookup or service-role client creation; return stable JSON denial;
  preserve self-delete and BOQ-custody safeguards.
- centralize server authorization so service-role operations cannot rely on
  middleware, client state, or a caller-supplied role/status.
- remove copy/navigation that promises pending BOQ or price-list access.

No application fallback may treat profile-fetch failure as active, reuse a
stale profile after revocation, or broaden access because a database query
returns an empty set.

## 5. Historical repository scope — not authorized

The deferred draft anticipated the following file classes; they are not an
approved allowlist and must be re-established by the replacement proposal:

- a future unreserved append-only migration selected after the live-posture
  review, plus its canonical bootstrap/ledger/hash wiring;
- authorization helpers, middleware, profile/waiting UI, affected server
  loaders/actions/APIs, and permission copy;
- focused migration/static/unit/API tests plus a new real-session matrix
  harness source; and
- security architecture, DB contract, threat model, runbook, verification,
  decision register, tracker, and handoff alignment.

Any new data model, business role, public endpoint, data rewrite, active-user
scope change, or file outside those classes is a scope change and hard stop.

## 6. Required post-P-15 replanning sequence

This draft's former P-49S/P-49L/P-49G/P-49P sequence is withdrawn as a current
execution plan. After the first P-15 closeout, the sequence restarts at design:

1. obtain exact Owner authority for read-only Production posture capture;
2. compare live policies, grants, functions/overloads, views, service-role
   surfaces, data-state compatibility, and deployed application dependencies
   with the repository and the retained P-49 target;
3. rewrite this proposal with a then-current unreserved migration number,
   exact state/column/ACL/concurrency/compatibility contracts, rollback and
   fix-forward rules, test personas, file allowlist, and deployment ordering;
4. obtain new independent DB/security, application/API, and test/operations
   reviews and a new Owner source decision; and
5. only then define separately gated source, Local, Git, Production, and deploy
   steps. No former gate name or approval may be reused automatically.

Forward-only recovery remains a design requirement, but no migration-specific
rollback or fix-forward procedure is approved until the replacement proposal
exists.

## 7. Retained acceptance targets for future redesign

Any replacement proposal must preserve and make testable all of the following:

- non-active personas receive zero business rows and zero mutation effect by
  direct table, view, RPC, API, server action, deep link, print, and export;
- pending can read/update only its own allowed profile fields and active
  onboarding selectors; every protected-field attempt fails;
- missing-profile cannot create a profile or exploit a default active status;
- no caller can self-promote or bypass the audited state machine;
- inactive/suspended cannot update onboarding/profile fields;
- active-admin operations require current active status at both DB and server
  boundary; inactive stored-admin and non-admin callers fail;
- revocation during an open editor causes the next write to fail atomically;
- pending-owned BOQ counts and hashes do not change while hidden and become
  available after valid activation without migration;
- existing active-role BOQ behavior, SoD, catalog reads/admin flags, Factor F,
  published pointer, version/item counts, dataset hashes, and all three Phase 4
  flags are unchanged; and
- policy/grant/function inventories and before/after application fingerprints
  match the approved manifests exactly.

## 8. No current Owner approval request

Do not approve P-49S from this document. The current disposition is
**DEFERRED / NOT APPROVED** under P-51 until the first P-15 closeout. At that
point, request only the exact read-only live-posture review first; then replace
this draft and seek a new decision on the rewritten proposal before the next
Production deployment, targeting completion of that re-entry decision within
seven calendar days after P-15 closeout.

No wording such as “continue,” completion of P-15, or expiry of P-51 creates
automatic authority for Production access, source implementation, migration
number reservation, Git publication, deployment, or any later P-49 gate.
