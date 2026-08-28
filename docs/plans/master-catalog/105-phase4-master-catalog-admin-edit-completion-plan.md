# Phase 4 Master Catalog Full Admin Completion Plan - Amendment V2

**Status:** COMPLETE 2026-08-28; R-01 THROUGH R-05 PASSED; NO REPLAY; NO
CATALOG PUBLICATION, BOQ CHANGE, OR FACTOR F CHANGE DURING FINAL ROLLOUT

**Amended:** 2026-08-28 (+07)

**Feature branch:** `codex/master-catalog-admin-edit`

**Deployed release commit:**
`f3ccc6ec389d4ae7d09f75e15d0857c45515c96e`

<!-- MASTER_CATALOG_ADMIN_EDIT_PLAN_V2 {"schema":"conduit-boq/master-catalog-admin-edit-plan/v2","recordedAt":"2026-08-28T14:32:33+07:00","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"migration028AppliedOnceNoReplay":true,"migration028Ledger":"20260828070433/master_catalog_admin_gate_projection","readOnlyAdminUiLive":false,"fullAdminDraftUiLive":true,"endToEndComplete":true,"p49FormalCloseoutComplete":true,"expandedProductionPersonaTestAcceptedResidual":true,"target":"full-active-admin-draft-workflow","targetAchieved":true,"publishedRowsDirectlyMutable":false,"publishedHardDeleteAllowed":false,"draftOnlyWithdrawAllowed":true,"p19Policy":"official-pdf-active-only-draft-pdf-mark-inactive","p19DirectionApproved":true,"p19ImplementationComplete":true,"p19RenderedFixturesVerified":true,"p19LocalTestResult":"48-files-444-tests-pass","migration028Required":true,"migration029Required":false,"catalogAdminEnabledCurrent":true,"catalogNewIdentityEnabledCurrent":true,"catalogRetirementEnabledCurrent":true,"catalogAdminEnabledTarget":true,"catalogNewIdentityEnabledTarget":true,"catalogRetirementEnabledTarget":true,"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe","releaseCommit":"f3ccc6ec389d4ae7d09f75e15d0857c45515c96e","vercelProductionReady":true,"productionQaResult":"pass","workingDraftCount":0,"openWorkIds":[],"planDocsAmendmentAuthorized":true,"planDocsAmendmentComplete":true,"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL","finalReleaseAuthorizationConsumed":true,"applicationCodeAuthorized":false,"commitAuthorized":false,"pushAuthorized":false,"mainMergeAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"deployAuthorized":false,"flagChangeAuthorized":false,"automaticNextStep":false} -->

> **Volatile status authority:** [Canonical Handoff #106](./106-phase4-master-catalog-exact-remaining-work-handoff.md)
> owns current completion/no-replay status and the final result. This Plan
> owns the target, invariants, validation contract,
> rollout order, and recovery rules.

## 1. Final current truth

The Master Catalog data and publication are complete:

- current/default version is `2568.1.0` with `710` active rows;
- dataset hash is
  `sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`
  at review lock `4`;
- ITEM-0429 is `0/1764/1764` and ITEM-0615 is `2869/7427/10296`;
- reviewed XLSX/PDF outputs passed;
- existing BOQs were not repriced or backfilled; and
- Factor F remains `2569.0.0`, `36` rows, dataset hash
  `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`.

P-13, P-14, P-14C, and P-15 are complete and must not be replayed. Migration
`027_p49_active_profile_authorization_hardening.sql` was applied exactly once
as ledger `20260827174634/p49_active_profile_authorization_hardening` and is
immutable.

P-49's database correction and formal closeout are complete. The expanded
Production persona rehearsal that was not run remains an accepted residual,
not a PASS.

The deployed application now exposes the full audited Master Catalog draft
workflow. All three runtime settings are exact JSON boolean `true`:

- `catalog_admin_enabled=true`;
- `catalog_new_identity_enabled=true`; and
- `catalog_retirement_enabled=true`.

Exact release commit
`f3ccc6ec389d4ae7d09f75e15d0857c45515c96e` is on `github/main` and its
Vercel Production deployment is `Ready`. Migration 028 is live exactly once as
`20260828070433/master_catalog_admin_gate_projection`. Stages A/B/C and cleanup
passed; both disposable drafts are `abandoned` and the working-draft count is
`0`.

Therefore the data/publication milestone and the full end-to-end operating
target are complete. [Result #107](./107-phase4-p49-master-catalog-final-closeout-result.md)
records the final Production evidence.

## 2. Owner-approved operating target — achieved

The final steady state is one audited draft workflow for an authenticated,
currently active Admin with all three capability settings enabled:

- `catalog_admin_enabled=true`;
- `catalog_new_identity_enabled=true`; and
- `catalog_retirement_enabled=true`.

These values are both the approved target and the current Production state.
They were released in the staged order in Section 7 and were never changed
together in one database statement.

### 2.1 Action semantics

| Admin action | Intended behavior | Required capability |
|---|---|---|
| Edit | Change name, unit, category, or price only inside the working draft with required authority evidence | Admin |
| Recode | Allocate the next valid never-reused code and retain the old code in history | Admin |
| Add/Supplement | Create a new immutable identity in the draft, allocate its code server-side, and complete placement review before publication | Admin + New identity |
| Withdraw | Remove only a never-published, draft-only row while preserving its reserved identity/code/audit history | Admin + eligible draft-only/never-published state guard |
| Retire | Set an inherited published identity inactive in a new draft; never hard-delete it | Admin + Retirement |
| Reactivate | Reverse an eligible erroneous retirement inside the draft with audit evidence | Admin + eligible inherited inactive-in-draft state guard |
| Abandon draft | Close the disposable or unwanted draft with a reason and keep its audit record | Admin |
| Publish/restore | Publish the exact reviewed draft or restore a prior published version only under the normal release approval/reference | Admin plus release approval |

A published version is immutable. A published catalog identity must never be
hard-deleted, merged into another UUID, or edited in place. Existing BOQs keep
their bound snapshot, and Factor F remains a separate versioned domain.

Each future publish or pointer restore needs the normal business approval for
that release. It does not replay P-13, P-14, P-14C, or P-15.

## 3. P-19 inactive/retired PDF policy

The Owner accepts the following simple policy direction for implementation:

1. A published or archived field-facing official PDF shows only rows where
   `is_active=true`.
2. A draft review PDF shows every draft row. Any inactive row is visibly marked
   `ยกเลิกใช้` so the reviewer can verify the proposed retirement.
3. Excel, database history, the Admin UI, the canonical dataset, and the
   canonical dataset hash retain both active and inactive rows with status.
4. Filtering occurs only in PDF presentation after the complete dataset count
   and canonical hash have been validated. It must not alter the export data
   loader, stored `display_order`, version metadata, or canonicalization.
5. An official PDF containing a version with retired rows shows these separate
   counts:
   - rows displayed in the PDF (active);
   - total rows in the complete version; and
   - inactive rows excluded from the price table.
6. The PDF hash label must state that the SHA-256 covers the complete version,
   including inactive rows. Do not create or substitute an active-only hash.
7. After filtering, empty categories are omitted and the visible sequence
   restarts at `1` inside each remaining category without changing stored
   order. Category continuation across pages remains continuous.
8. The release/filing manifest records the canonical dataset hash, PDF binary
   hash, total/active/inactive counts, and the active-only presentation policy.

Until this behavior and its tests/render QA pass on the exact release commit,
`catalog_retirement_enabled` must remain `false`.

## 4. Technical delta

### 4.1 Database and migration posture

Migration 028 is the only schema migration required for this completion. Apply
the reviewed `028_master_catalog_admin_gate_projection.sql` exactly once while
all three capability settings are exact JSON boolean `false`.

Migration 028 must remain unchanged. It adds only:

- `private.catalog_admin_gate_projection()`; and
- `public.get_my_catalog_admin_gate()`.

It must not enable or modify a flag and must not mutate catalog, pointer, BOQ,
or Factor F data. Do not create migration 029 for capability transitions, and
do not edit, replace, delete, or replay migrations 020, 021, 027, or 028.

After 028 and the matching application deployment pass flags-off verification,
each `app_settings` transition is an operational configuration change, not a
schema migration. Each transition receipt records approval reference, actor,
timestamp, exact key, typed before/after value, exactly one affected row,
application commit, database ledger checkpoint, verification, and recovery.

The existing database RPCs remain final authority and already enforce:

- current active-Admin authorization;
- `catalog_admin_enabled` for every new mutation request;
- `catalog_new_identity_enabled` for Add/Supplement and placement;
- `catalog_retirement_enabled` for explicit or Full-import retirement;
- Admin plus database state/eligibility guards for never-published Withdraw and
  Reactivate recovery actions; these two recovery actions do not require a
  later capability flag;
- expected locks, idempotency, immutable published versions, RLS, grants, and
  audit evidence.

### 4.2 Application work completed locally

The existing Admin application already supports Edit, Recode, Add, placement,
Retire, Reactivate, eligible Withdraw, import review, publication, and audited
abandon. Do not rewrite that workflow.

The completed local application delta is bounded to:

- the P-19 PDF presentation contract in Section 3;
- replacement of the pending P-19 warning with approved-policy copy;
- unchanged complete Excel and canonical dataset behavior;
- focused all-capabilities, exact PDF-to-Excel parity, and P-19 tests; and
- rendered and inspected all-active published, mixed published, and mixed
  draft PDF fixtures.

No direct client table-write path, new approval engine, new branch, new schema
migration, historical BOQ repricing, pointer mutation, publication, or Factor F
change belongs to this implementation step.

### 4.3 Shared Admin gate

Migration 028 and baseline commit `705eeca...` add one shared fail-closed gate
used by Master Catalog pages, every Server Action, the `/admin` entry card, and
draft XLSX/PDF export. Zero rows, multiple rows, malformed configuration,
missing RPC, permission error, or transport failure must remain disabled.

The raw `app_settings` table is not a client API. The database RPCs recheck the
current actor and configuration inside each mutation transaction. There is no
raw `app_settings` fallback that can enable the Admin gate.

## 5. Invariants that must not change

This completion must not:

- edit an active/archived published version in place;
- hard-delete a published identity or reuse a retired/withdrawn code;
- reprice or backfill an existing BOQ;
- change current/default catalog data before an approved future publication;
- change Factor F;
- weaken RLS, RPC ownership, grants, expected locks, idempotency, audit, or
  publication readiness;
- modify or replay the completed P-13/P-14/P-14C/P-15 sequence; or
- claim an unrun database, browser, PDF render, or capability test as PASS.

## 6. Local validation completed before Git publication

The final release implementation passed:

1. existing migration 028 and Admin-gate contract tests unchanged;
2. one capability projection test for exact `true/true` Add/Retire values and
   fail-closed malformed/missing/multiple-row behavior;
3. UI/action tests showing Add only when New identity is enabled and Retire
   only when Retirement is enabled;
4. database/UI contract assertions proving Add/placement require New identity,
   Retire requires Retirement, and eligible Reactivate/never-published Withdraw
   remain Admin recovery actions guarded by row state rather than those later
   flags;
5. published/archived PDF active-only filtering and draft PDF inactive marking;
6. all-active, mixed published, and mixed draft count/hash-label tests;
7. first/middle/last inactive row, fully inactive category, per-category
   sequence, and continued-page pagination tests;
8. exact parity between official PDF and Excel for active row identities/order
   plus the fields actually presented in the PDF: description, unit,
   material/labor/unit costs, and category grouping where applicable;
9. Excel retention of all inactive rows and their status;
10. rendered PNG review of at least all-active published, mixed published, and
    mixed draft PDFs, including overflow, Thai fonts, headers, footers,
    category breaks, marks, and page numbering;
11. existing Master Catalog, P-49, BOQ snapshot, export, and Factor F regression
    tests;
12. TypeScript, ESLint, production build, and `git diff --check`; and
13. independent application/PDF, database/security, and documentation reviews.

The baseline `48` files / `426` tests recorded in Section 9 prove only the
Admin-gate package at `705eeca...`. They must not be relabelled as evidence for
the later P-19 amendment; the separate final local evidence is recorded in
Section 9.1.

## 7. Completed Production rollout order - authorized 2026-08-28

The Owner approved one bounded Production window covering all stages in
advance. Execution advanced only after each stage passed its exact readback
and denial checks. The procedure below is retained as the completed release
record and recovery contract; it is not authority to replay any step.

Every setting transition is a conditional compare-and-set against its exact
typed expected-before value, changes one key in one transaction, and returns
the exact key plus before/after value. A mismatched before value, affected-row
count other than one, or uncertain response closes the global Admin gate and
stops without retry.

### 7.1 Flags-off deployment

1. freeze the exact reviewed application commit, unchanged migration-028
   SHA-256, and intended migration ledger version/name;
2. confirm the exact applied migration-027 ledger/fingerprint, Production
   drift posture, and `false/false/false` settings;
3. apply migration 028 exactly once while all three settings remain false;
4. verify the ledger, function owner/search path/ACL, catalog RLS/direct-DML
   posture, Admin/non-Admin projection, and unchanged false settings;
5. merge/push the exact reviewed commit to `main` once, which triggers the
   Production Vercel auto-deployment;
6. wait for that exact deployment to be Ready; and
7. verify the Admin UI remains read-only and catalog/pointer/BOQ/Factor F data
   remain unchanged while all settings are false.

### 7.2 Stage A - existing-row Admin workflow

1. conditionally set only `catalog_admin_enabled=false -> true`;
2. read back `true/false/false`, the exact transition, and exactly one affected
   setting row;
3. verify active Admin can create/manage a disposable draft and Edit/Recode;
4. verify non-Admin mutation is denied; and
5. verify Add and Retire remain denied at both UI and database boundaries.

### 7.3 Stage B - Add/Supplement

1. after Stage A passes, conditionally set only
   `catalog_new_identity_enabled=false -> true`;
2. read back `true/true/false`, the exact transition, and exactly one affected
   setting row;
3. verify one disposable Add uses server code allocation;
4. verify placement review is required before publication readiness;
5. verify eligible never-published Withdraw and its audit/order compaction; and
6. abandon the disposable draft and confirm no pointer/BOQ/Factor F change.

### 7.4 Stage C - Retirement

Stage C starts only after the P-19 application/tests/render QA in Sections 3
and 6 pass on the exact deployed commit.

1. conditionally set only `catalog_retirement_enabled=false -> true`;
2. read back `true/true/true`, the exact transition, and exactly one affected
   setting row;
3. create a new disposable draft, then Retire one eligible inherited item;
4. before Reactivate, export that draft once and verify its PDF visibly marks
   the inactive row `ยกเลิกใช้`;
5. Reactivate the row and verify its audit/state recovery;
6. abandon the disposable draft and confirm no pointer/BOQ/Factor F change; and
7. bind the already-passed local exact tests/render fixtures proving the
   published/archived active-only PDF, counts, and full-dataset hash label to
   the deployed commit. Do not create a live mixed-status publication merely
   for smoke testing.

The full Admin capability target is operationally complete only after Stage C
passes. Master Catalog end-to-end closeout additionally requires the P-49
formal record to be updated from the actual rollout evidence. The expanded
Production persona rehearsal that was not run remains an accepted residual and
must never be relabelled retrospectively as PASS. No smoke step publishes or
restores a version unless a separate exact release approval explicitly
authorizes that business mutation.

## 8. Recovery and hard-stop rules

On any authorization, configuration, mutation, cleanup, or invariant failure:

1. first set `catalog_admin_enabled=false` as the global database-enforced kill
   switch for new mutation requests;
2. verify database denial before attempting application rollback;
3. restore `catalog_new_identity_enabled=false`, read it back, then restore
   `catalog_retirement_enabled=false` in a separate statement and read it back;
4. record the final exact `false/false/false` readback; and
5. preserve evidence and prepare a forward fix plus a fresh window.

An already-running transaction may finish; the kill switch does not cancel it.
Do not delete or roll back migration 028.

Stop immediately on any of the following:

- flag value/type/count drift or more than one flag changed in one stage;
- migration ledger, function fingerprint, owner, search path, ACL, RLS, or
  direct-DML drift;
- deployed commit mismatch or deployment not Ready;
- active Admin wrongly denied or non-Admin mutation allowed;
- Add bypasses server allocation, price authority, placement, or publish hold;
- Retirement starts before P-19 implementation/render evidence passes;
- unexpected catalog, pointer, BOQ, or Factor F mutation;
- disposable draft cleanup failure; or
- an uncertain response or affected-row count other than exactly one.

Do not retry inside the failed window. Close the gate, retain evidence, and use
a fresh reviewed continuation.

## 9. Retained baseline implementation evidence - 2026-08-28

The Admin-gate preparation at exact commit
`705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe` remains valid for its bounded
scope:

- migration 028 adds only the bounded Admin-gate projection and leaves all
  three settings false;
- the shared application loader protects the Master Catalog workspace,
  `/admin` entry card, and draft XLSX/PDF export;
- malformed, missing, unauthorized, or failed gate reads fail closed;
- `48` test files / `426` tests passed;
- TypeScript, ESLint, production build, and `git diff --check` passed;
- independent application, database/security, and documentation reviews passed;
  and
- migration 028 source SHA-256 is
  `6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3`.

The Local Supabase database was a pre-027 environment, so the exact
post-027/028 persona rehearsal was not run. That remains an accepted residual,
not a PASS, and belongs to the flags-off rollout verification.

This retained evidence does not by itself prove the later V2 P-19 work. The
separate evidence below does. Production capability enablement later passed as
recorded in [Result #107](./107-phase4-p49-master-catalog-final-closeout-result.md).

### 9.1 Completed local P-19 release evidence - 2026-08-28

On the cleaned isolated worktree after temporary fixture-route and auth-bypass
removal:

- `48` test files / `444` tests passed;
- ESLint, production build, and `git diff --check` passed;
- exact PDF-to-canonical-Excel parity is fail-closed across identity, order,
  description, unit, material/labor/unit costs, category, display order,
  category-local sequence, and active state;
- the all-active published, mixed-status published, and mixed-status draft
  fixtures each rendered as four A4 pages and passed first/middle/last-page
  visual inspection; and
- their PDF SHA-256 values are respectively
  `7d99d558ddb1985ad51538217f5566a870d342ebc8b2b7af71f1a7717d10cd63`,
  `2ebe6f7071dc19199c486becdbd00a5ddaf46ee16267282a24cb9e9eb6d75205`,
  and `00443751be15f7a4a31c364e0cffd01e1fc7605a95abed25d7cf6a2940b6a3e2`.

No mixed-status version was created or published in Production.

## 10. Final release authority snapshot - 2026-08-28

The Owner's `APPROVE MASTER CATALOG FINAL` instruction authorized the exact
staged R-02 through R-05 route: feature commit/push, one fresh Production
preflight, unchanged migration 028 once with no retry, exact `main` push and
flags-off Vercel deployment, three one-by-one capability transitions with
disposable-draft QA/cleanup, and short P-49 closeout. That authority is now
consumed and grants no replay or automatic continuation.

The instruction does not authorize a catalog publication, pointer restore,
BOQ mutation, Factor F mutation, migration replay, or retry after uncertainty.
For the final execution state and no-replay boundary, use [Canonical Handoff
#106](./106-phase4-master-catalog-exact-remaining-work-handoff.md) and [Result
#107](./107-phase4-p49-master-catalog-final-closeout-result.md); do not infer
current state from an earlier dated snapshot.
