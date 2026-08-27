# Migrations
## Conduit BOQ System

**Last Updated:** 2026-08-28
**Status:** Canonical

> **Current-state supersession (2026-08-28):** P-13/P-14/P-14C/P-15 are
> complete and must not be replayed. Migration 027 was applied exactly once as
> ledger `20260827174634/p49_active_profile_authorization_hardening` and remains
> immutable. Migration 028 is now a Local-only, function/ACL-only candidate;
> it leaves all catalog flags false and changes no Master Catalog, pointer, BOQ,
> or Factor F data. Its reviewed feature-branch commit/push is authorized;
> merge/push to `main`, Production application, matching Production deployment,
> and later flag change remain separate gates under
> [Plan #105](../plans/master-catalog/105-phase4-master-catalog-admin-edit-completion-plan.md).

> **Current Production overlay (supersedes stale pre-execution status and
> authority text below):**
> P-12 completed exact Production sequence `017` -> `017a` -> `018`-`026`
> during 2026-08-16/17 and passed final closeout plus the post-`026` v7
> encrypted backup/isolated restore/read-only checksum. All older “Local
> only”, “not Production-applied”, “P-12 HOLD”, future-gate, and
> no-approved-window/path prose in this document—including narrative outside
> the inventory rows—is preserved only as point-in-time pre-execution history,
> not current status or runnable authority. Current execution and closeout
> authority is [Owner Checklist #40](../plans/master-catalog/40-phase4-p12-owner-decision-checklist.md)
> together with [Verification Report #13](../plans/master-catalog/13-phase4-verification-report.md).
> Applied migration bytes remain immutable.
>
> P-49 preserves active-only catalog RLS in `022`/`023` and rejects any
> migration that widens pending catalog reads. Its separate forward-only BOQ/
> profile/Factor-F/API correction remains required but is deferred until after
> P-15 under P-51. Proposal #47 is unapproved and reserves no filename/number.
> P-51 authorizes no migration or database action. See
> [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

---

## 1. Migration History

### Root Migrations (`migrations/`)

| File | Description | Status |
|------|-------------|--------|
| `001_backup_before_migration.sql` | Pre-migration backup queries | **Backup/Utility** |
| `002_add_multi_route_support.sql` | Multi-route tables, data migration | **Applied** |
| `002_rollback_multi_route_support.sql` | Rollback script for 002 | **Rollback Utility** |
| `003_add_construction_area_to_routes.sql` | Add `construction_area` to `boq_routes` | **Applied** |
| `004_phase1a_auth_ownership.sql` | Auth columns (`created_by`, `assigned_to`, org refs) | **Applied** |
| `005_phase1a_seed_and_rls.sql` | Seed org/dept/sector data, initial RLS policies | **Applied** (partially superseded by 008) |
| `006_phase1a_rls_write_and_approval.sql` | RLS write/approval policies | **Applied** (partially superseded by 008) |
| `007_add_requested_org_columns.sql` | Onboarding `requested_*` columns (v1.2.0) | **Applied** |
| `007_app_settings.sql` | Create `app_settings` table, seed domain keys | **Applied** |
| `007b_add_onboarding_completed.sql` | Add `onboarding_completed` column | **Applied (Manual Supplement)** |
| `008_pending_user_status.sql` | Add `pending` to user status check constraint | **Applied** |
| `008_rls_and_trigger.sql` | Consolidated RLS + org-lock trigger + admin RPC | **Applied** |
| `009_master_catalog_p0_containment.sql` | Master Catalog v26 RPC containment + BOQ RLS tightening | **Applied to Production 2026-06-21** (`20260621045208`) |
| `010_master_catalog_phase1a_versioning.sql` | Master Catalog v26 nullable versioning + historical backfill | **Applied to Production 2026-06-21** (`20260621052517`) |
| `010a_master_catalog_phase1a_indexes.sql` | Master Catalog v26 concurrent index runbook | **Applied operationally 2026-06-21** (4 indexes valid/ready) |
| `011_master_catalog_phase1b_hardening.sql` | Master Catalog v26 BOQ version contract hardening | **Applied to Production 2026-06-21** (`20260621104056`) |
| `012_factor_f_version_foundation.sql` | Factor F version tables, singleton pointer, `boq.factor_reference_version_id`, RLS/grants/triggers | **Applied to Production 2026-06-29** (`20260628190218`) |
| `013_factor_f_seed_current_baseline.sql` | Seed audited current 37-row `factor_reference` baseline as Factor F `2566.0.0` and move the default pointer | **Applied to Production 2026-06-29** (`20260628190357`) — no legacy BOQ backfill |
| `014_factor_f_publish_2569_0_0.sql` | Publish Factor F `2569.0.0` from กค 0433.2/ว 481 and move the default pointer | **Applied to Production 2026-06-29** (`20260628190621`) — no legacy BOQ backfill |
| `015_factor_f_repair_legacy_snapshot_metadata.sql` | Repair missing legacy Factor F snapshot metadata for BOQs whose saved `factor_f` exactly matches `2566.0.0`; does not bind legacy BOQs to a version | **Applied to Production 2026-06-29** (`20260628190757`) — no reprice and no legacy version backfill |
| `016_hotfix_preserve_boq_item_suffix.sql` | Redeploy `save_boq_with_routes` to preserve approved BOQ item suffix labels while keeping catalog-backed unit, price, category, and version checks authoritative | **Applied to Production 2026-07-06** (`20260706090832`; fresh read-only ledger and exact function-body hash reverified 2026-07-26) |
| `017_master_catalog_phase4_foundation.sql` | Master Catalog Phase 4 additive governance foundation, including P-20 deterministic baseline identity from Production-derived `price_list.id`, request fingerprints, RLS/grants, and disabled feature flag | **Draft — Local only, not applied to Production. A 2026-07-28 dirty-tree rehearsal-only CLI kit applied `017` to a disposable network-isolated PostgreSQL 17 database, then hard-stopped before `018` because the intended private-function default ACL was absent. PostgreSQL's global `PUBLIC EXECUTE` default cannot be removed by the schema-scoped default revoke in this reviewed file. Do not edit `017`; the Owner-selected Option B correction is the separate `017a` candidate below.** |
| `017a_master_catalog_phase4_global_function_default_privileges.sql` | PRE-P-12 Option B bridge: establish owner-only global function defaults, remove additive `public`/`private` API-role defaults including `service_role`, normalize the four `017` stubs, and fail closed before any private Phase 4 helper exists | **Owner-selected immutable bridge; exact ledger `20260728001730 master_catalog_phase4_global_function_default_privileges`; SHA-256 `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`; required order is `017` → `017a` → `018`; independent source/architecture/security review and static checks passed. P-45 completed at pushed/upstream-equal `d92d8ced42fc882481ebc2c4579adcf1edbebea7`; the consumed P-46 Local run applied this bridge and continued through `025` before failing on the distinct helper-callability defect. Do not edit or rerun it incrementally; it remains required in every fresh canonical chain. It is not applied to Production, and P-12 remains HOLD.** |
| `018_master_catalog_phase4_draft_mutation.sql` | Draft create/manual/import RPCs with actor+payload request fingerprints, per-request/per-code locks, bounded runtime timeouts, full-payload preflight, audited mutation subtransaction rollback, and reusable ADR-003 transitions | **Draft — Local only, not applied to Production** |
| `019_master_catalog_phase4_publish_pointer.sql` | Publish/restore, shared admin publish-readiness RPC, P-18 and structured-rollout boundary guards, P-19 inactive-row filing warning, catalog-only DB count/hash, runtime timeouts, and published immutability | **Draft — Local only, not applied to Production** |
| `020_master_catalog_phase4_admin_workflow_hardening.sql` | WP-6.6 frozen first-rollout authority, resolve-only dictionaries/server allocator, exact read registers, readiness/provenance parity, correction path, schema hardening, P-22 working-draft lifecycle, P-23.1 reserved version sequence, P-24 annual-year range guard, and covering indexes for both frozen-authority foreign keys | **Owner-accepted Local-only migration in bootstrap source; SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; G1R/G2 separate-apply evidence passed on exact checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; G3/WP-6.6 accepted on `78e96ab3ed9993707014c4aba1d285b7592b17a1`; owner-approved G4E combined clean bootstrap through `020` passed on exact execution checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; not Production-approved** |
| `021_master_catalog_phase4_placement_governance.sql` | P-18/WP-7.5 new-identity placement revision/review and atomic order contract | **Owner-accepted Local-only migration in bootstrap source under P-35 on exact source checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`; SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`; P-32 separate-apply evidence/P-33 technical acceptance/P-34 historical UX source-static/P-36 integrated technical evidence passed; first P-37 intended-admin UAT failed comprehension, while corrected technical/recovery evidence and the final owner keyboard/focus/presentation UAT later passed on pushed checkpoint `f36d896d672609653de6634e307dcc44bce6d519`; exact-source D005 then passed the bounded placement and same-request checks, and exact no-reset D007 on pushed `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa` closed C-08 and restored the disabled baseline; P-37 was Owner-accepted on 2026-07-25 under the explicitly recorded guided-UAT variance against exact implementation checkpoint `df44b827b290933463da5e14fa9125314660022a`; evidence remains labelled guided rather than independent; DB contract unchanged; not Production-approved** |
| `022_master_catalog_phase4_draft_identity_and_release_number.sql` | P-39R forward-only separation of immutable `{target}-D{nnn}` draft references from claimed/issued catalog versions; one open draft globally; audited stale/current abandonment; pointer/effect audit; hardened lifecycle/RLS/publication metadata | **P39R-S passed on Local-only source SHA-256 `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`; incrementally applied to Local on exact source `7997387`; backfill, pointer, catalog, BOQ, and Factor F invariants passed; incremental P39R-L and clean-chain P39R-C later passed through `024`; not Production-applied** |
| `023_master_catalog_phase4_published_code_rls_scope.sql` | P-39R forward-only RLS correction: active staff may read a code only when the exact `(identity_id, item_code)` pair occurs in an active/archived issued snapshot; active admins retain complete registry/history access | **Local-only SHA-256 `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88`; first apply from `072294d` failed only its textual policy postcondition and rolled back completely; corrected exact source `6f01457` applied transactionally without reset; exact clean execution source `10531610eac53a97c6ef8f9d06418766b58bee36` repeated the RLS/role/history suite; not Production-applied** |
| `024_master_catalog_phase4_set_based_placement_invalidation.sql` | P-39R forward-only execution-shape correction: replace migration `021` row-level placement invalidation with three transition-table statement triggers and transaction-local positive/negative version caches | **Local-only SHA-256 `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25`; committed/pushed/applied incrementally on exact `b6d58ce6cfedafa5812821edb49b897c2856f049`; WP-6.6/WP-7.5, canonical `017`-`024`, trigger inventory 3/0, and adjacent-data invariants passed in P39R-L and clean-chain P39R-C on exact `10531610eac53a97c6ef8f9d06418766b58bee36`; not Production-applied** |
| `025_master_catalog_phase4_withdraw_order_compaction.sql` | P-41 forward-only correction: compact a draft's `display_order` atomically after never-published-row withdrawal while preserving relative order and one placement-revision advance per transaction | **Local-only SHA-256 `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f`; incrementally applied without reset on 2026-07-19; exact pushed source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed 34 files/220 tests and incremental smoke; owner-approved exact execution source `adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied `009`-`015`, hotfix `016`, and `017`-`025`; later P-42 recovery, proportional D005 execution, exact D007 stale-choice replay, and D009 Full-import correction passed against the unchanged chain and restored `2568.0.0`/710, zero drafts, and flags false; P-37 was Owner-accepted on 2026-07-25 under the recorded guided-UAT variance; not Production-applied** |
| `026_master_catalog_phase4_catalog_action_error_acl.sql` | P-47 forward-only per-object callability correction: retain the pure `private.catalog_action_error` body/owner/signature/empty search path, change it to `SECURITY INVOKER`, and grant `EXECUTE` only to `authenticated` while denying `PUBLIC`, `anon`, and `service_role` | **Repository/static review passed; P-48 exact Git-only publication authorized; ledger `20260729002600 master_catalog_phase4_catalog_action_error_acl`; SHA-256 `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`; required after immutable `025`; no table/data/default-privilege change; not applied to Local or Production; replacement Git/Remote result, separately authorized clean Local rehearsal, two-pass evidence, and P-12 remain HOLD** |
| `027_p49_active_profile_authorization_hardening.sql` | P-49 current-active authorization, profile protection, bounded settings projections, and least-privilege API/RLS hardening | **Applied to Production exactly once as `20260827174634 p49_active_profile_authorization_hardening`; SHA-256 `7b96ac17aefc96ee7a788327ddee7508e15eaec73c54f609b44adccf8159eabe`; immutable/no replay** |
| `028_master_catalog_admin_gate_projection.sql` | Add a private active-Admin gate projection and public security-invoker wrapper without changing flags or business data | **Local-only SHA-256 `6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3` under Plan #105; reviewed feature-branch commit/push authorized; apply only after exact 027 while all three catalog flags are false; not merged to `main` or Production-applied** |
| `017+_master_catalog_phase4_*.sql` | Umbrella reference for the Local-only Phase 4 range; canonical bootstrap source applies `017`, `017a`, then `018`-`026` after hotfix `016` | **Current candidate range — prior clean runs through `025` are historical evidence. P-46 completed the exact chain but WP-6.5 then exposed the formatter callability defect and stopped fail-closed. `017a` remains the required pre-`018` global-default bridge; `026` is a distinct, narrowly scoped post-`025` object exception and does not rewrite any reviewed migration. Repository/static review passed and P-48 authorizes exact Git-only publication; replacement Git/Remote result, separately authorized clean Local rehearsal, isolated pass 1, independent contract review, pass 2, and closeout remain mandatory. Every Production approval remains absent.** |

The 2026-07-28 disposable rehearsal does not supersede the prior Local
functional evidence. It exposed a Production-readiness security blocker: the
old `017`-`025` CLI sequence did not pass, no `018`-`025` was run in that
disposable database, and no Local or Production database was touched. The
Owner subsequently selected Option B for repository-only implementation.
Migration `017a` is the resulting candidate; creating it is not P-12 approval.
Independent source/architecture/security review and static checks passed for
that bridge. P-45 then completed at pushed/upstream-equal `d92d8ce`; the single
P-46 canonical Local bootstrap completed through `025`, but WP-6.5 failed
closed when an authenticated public invoker wrapper reached the owner-only
private JSON formatter. P-47 therefore adds append-only `026` after `025`.
P-12 remains HOLD until the new exact sequence is reviewed, passes a fresh
separately authorized Local rehearsal and both isolated rehearsals, and closes
the remaining Package #39 gates.

The P-47 CLI candidate makes future evidence executable but does not authorize
Production, disposable-pass execution, Local cleanup/application, or a reset.
The earlier P-44/P-45 freeze is historical because P-46 exposed a new defect.
A replacement exact source/tooling HEAD must be reviewed, separately
authorized for Git publication, pushed/upstream-equal, and Remote-recorded.
The destructive Local bootstrap still resets and rebuilds all Local Supabase
data and therefore requires a fresh explicit Owner authorization; P-46 cannot
be reused. Only after that new Local gate passes may a later separately
authorized step build its exact kit and run
`calibrate-schema` pass 1 one stage at a time, require independent contract
review, and run a second fresh full isolated rehearsal with a transitive pass-2
closeout. The candidate stage order is `017`, `017a`, `018`-`026`; `018`
cannot follow `017` directly and `026` cannot precede or replace `025`. Only
after explicit Owner P-12 GO may Checklist #40
alone create the descendant GO HEAD; Production must reuse the source kit.

### Local Schema Baseline (`supabase/local/`)

| File | Description | Status |
|------|-------------|--------|
| `production-baseline.sql` | Schema-only snapshot pulled from current Production for deterministic Local rebuilds | **Local Baseline Only — never a remote migration** |

### Preserved Legacy Artifacts (`supabase/legacy_migrations/`)

| File | Description | Status |
|------|-------------|--------|
| `20250115_rls_policies.sql` | Early RLS policy set | **Applied Legacy Artifact** (superseded in part by 008 migrations) |
| `20260317_factor_f_supplement.sql` | Factor F snapshot columns + `save_boq_with_routes` RPC | **Applied Legacy Artifact** |

### Naming Convention

The root `migrations/` sequence is the reviewed Production rollout ledger. The
Production schema snapshot lives under `supabase/local/`, deliberately outside
the Supabase CLI remote migration ledger, and exists only to rebuild Local
Supabase. Previously applied timestamped scripts are preserved under
`supabase/legacy_migrations/` for audit context and do not reserve the root
migration number `009`. The Master Catalog rollout therefore starts with
`migrations/009_master_catalog_p0_containment.sql`.

Supabase MCP verified Production on 2026-06-29 after Factor F rollout:
remote migrations `012` through `015` are applied, current default Factor F is
`2569.0.0`, historical baseline `2566.0.0` remains active, `bound_boq_count = 0`
for legacy BOQs, and partial legacy Factor F snapshots remaining is `0`. The
post-rollout closeout is recorded in
[10-production-rollout-closeout.md](../plans/factor-f/10-production-rollout-closeout.md).
Hotfix `016` is a production issue patch that runs before Master Catalog Phase
4. Master Catalog Phase 4 database migrations start at `017+` after Phase 4
rebases/merges this hotfix from `main`.

WP-6.5 reliability evidence for `017`-`019` passed its bounded Local scope.
[Completeness Audit #29](../plans/master-catalog/29-phase4-owner-dev-completeness-audit.md)
then found operator/authority gaps that require additive WP-6.6 work before
WP-7. Preserve the reviewed `017`-`019` files. The owner authorized WP-6.6
Local-only implementation and candidate migration `020`; two separately
approved clean Local rebuilds on `3bfc74e` applied the canonical bootstrap
through `019`, applied that candidate `020` separately, and passed its named
DB/RLS/concurrency/browser/P-20 evidence.

P-22 later placed closeout on Hold and approved the bounded correction in
[Operator Workflow Correction Plan #31](../plans/master-catalog/31-phase4-wp66-operator-workflow-correction-plan.md).
Commit `ac31feb` amended the still-unaccepted Local-only `020` before
fingerprint freeze to add the one-current-base-working-draft and
audited-abandon contract. Owner-approved G1 then clean-bootstrapped through
`019`, applied `020` separately, and passed replacement DB/concurrency evidence.
G1 also found and fixed WP-6.5 fixture cleanup at `17ec6cc` and corrected the
date parser volatility at `e463270`; final G1 harnesses, DB lint, and security
advisors passed on `e463270`. The `3bfc74e` results remain historical evidence
for the old candidate. Pre-G2 operator/browser QA then passed on UI/source
checkpoint `c8f6dca`; migration `020` did not change, both proof drafts were
audited-abandoned, all three catalog flags were restored to `false`, and the
Local pointer/invariants remained unchanged. P-23 then approved a bounded
operator-context/navigation amendment without changing migration `020`.
P-23.1 subsequently amended the candidate to require explicit business intent,
the next all-status reserved version number, and a truthful same-year annual
replacement after a lower identifier is abandoned. That content change makes
`e463270`, `c8f6dca`, and the first P-23 working-tree checkpoint historical for
the amended candidate. Repository/static verification passed 2026-07-13. P-24
then added the approved annual effective-year horizon of base +1 through +10
and a stable out-of-range failure before any clean rebuild. This changes the
candidate fingerprint again but does not change its migration number or
bootstrap status. The same-scope P-24 error-focus/provenance closure did not
alter `020`. During the separately owner-approved G1R execution, the clean
rebuild exposed stale smoke-harness assumptions and two missing foreign-key
covering indexes. The harness was corrected without weakening a guard, and
migration `020` received the two additive indexes before the final exact clean
candidate was named. G1R passed on execution checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd` with migration SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The separately owner-approved G2 repeated the clean bootstrap through `019`,
applied the same `020` separately on the same exact checkout, and passed the
WP-6.6/WP-6.5 harnesses, P-20 G1R-versus-G2 comparison, repository gates,
advisor triage, and final invariant readback. Bootstrap remained at
`017`-`019` through those evidence runs. The no-reset G3 real-route technical
walkthrough passed on source `6599c30`, and the owner accepted G3/WP-6.6 on
exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`
on 2026-07-14; G4/WP-7 sequencing remained a separate decision at that
checkpoint.
On 2026-07-15 the owner approved G4 repository integration and WP-7 harness
source work without a Local reset. The canonical bootstrap source now applies
`020` after `019`. The owner then separately approved P-29/G4E, and one clean
Local reset on exact checkout
`15b707d443bec701f6b3a86aa7675ca1266604ba` applied the combined authority
sequence `009`-`015`, hotfix `016`, and Phase 4 `017`-`020`. Bootstrap smoke,
WP-6.6, WP-6.5/P-20, WP-7, schema lint, advisors, repository gates, and final
Local invariants passed. The catalog pointer returned to `2568.0.0`, all three
catalog flags returned to `false`, BOQ/Factor F authority remained unchanged,
and Production was not touched. P-30 accepted WP-7 and the five-rule P-18 V1
contract on 2026-07-15 01:37 +07. WP-8 and every Production gate remain
separate. Placement source work now uses reserved migration `021`. P-31
accepted the repository/static checkpoint `4e3574a` at SHA-256 `78359215...`;
P-32 then authorized the warned Local-only reset/apply/live gate. The first
runtime calls failed closed with PostgreSQL `42704` because a
fixed-empty-search-path function deferred
`uq_price_list_version_display_order` without schema qualification.
The bounded fix produced SHA-256
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`.
A fresh canonical reset through `020`, separate amended `021` apply, and the
tracked WP-7.5 harness then passed on source checkpoint `80b2574`. Retained
evidence `tmp/master-catalog/wp75-evidence/20260715-clean-chain-80b2574.json`
has SHA-256
`875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`.
Role/direct-write denial, rollback/replay/stale-lock/race/order invariants,
713-row canonical hash/export parity, and pointer/draft/flag/BOQ/Factor F
cleanup passed. Browser evidence on exact UI checkpoint `99fa56c` proved the
Thai add, batch placement, server-accepted-state, final-review, desktop/mobile,
and audited-abandon paths. P-33 accepted that bounded technical checkpoint at
2026-07-15 13:54 +07 while retaining truthful local dirty state, review-by-
exception, keyboard equivalence, measured scale, and independent intended-admin
comprehension as WP-8/P-14 gates. At that P-33 checkpoint, migration `021`
stayed outside bootstrap pending a separate decision.
P-34 subsequently passed the bounded placement UX source/static checkpoint on
exact application commit `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` without
editing this migration or bootstrap and without resetting or mutating Local
Supabase. This source result does not authorize `021` bootstrap inclusion, the
destructive WP-8 clean rehearsal, feature enablement, or Production.
P-35 was then authorized on exact gate commit
`43b75e3f0b0643d6f4e741fcc81ea8b0a6311a13` and places the unchanged amended
`021` after `020` in the canonical Local bootstrap source. Exact source
checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a` passed the recorded
repository/static gates. P-35 was repository integration only, so the owner
received a fresh destructive-reset warning before separately approving P-36.
P-36 then clean-executed the integrated chain on exact checkout
`910cc3cc74660beecf18655d39cd0b0c085d1fc6`. WP-6.6, WP-6.5/P-20, WP-7,
WP-7.5, export verification, advisors, repository gates, realistic-scale route
rendering, and disabled-baseline cleanup passed. The final pointer is
`2568.0.0`/710 rows with canonical hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`;
all catalog flags are `false`, BOQ and Factor F invariants are unchanged, and
Production was not touched. The browser automation runtime could not dispatch
React/Radix state-changing events, so independent intended-admin interaction,
keyboard, and error-recovery UAT remain a P-37/P-14 release gate. See
[P-36 Owner Review Note](../plans/master-catalog/32-phase4-wp8-p36-owner-review-note.md).
The first later P-37 intended-admin session failed the presentation
comprehension gate before confirmation. Its bounded insertion-gap correction
later passed Local stale rejection, one acceptance, exact replay, accepted-state
readback, and cleanup without changing migration `021`; corrected source
checkpoint `e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512` is pushed. Later
no-reset sessions passed leave/return/reload recovery and the complete owner
keyboard/focus/presentation path; final corrective checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` is pushed. The owner did not submit
the final batch through the UI, and broader independent WP-8 evidence remains
open under Closure Matrix #34 before any P-37 decision. The evidence is recorded in
[P-37 UAT and UX Correction Note](../plans/master-catalog/33-phase4-wp8-p37-uat-ux-correction-note.md);
the remaining gates are in
[P-37 Closure Matrix](../plans/master-catalog/34-phase4-wp8-p37-closure-matrix.md).
P-38 completed evidence reconciliation and authorized only the bounded no-reset
Local continuation in
[Owner UAT Script #35](../plans/master-catalog/35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md).
[Preflight Note #36](../plans/master-catalog/36-phase4-wp8-p38-no-reset-owner-uat-preflight.md)
records parser-aware E-01/E-02 inputs and a tracked fail-closed harness. The
first Card A run was later stopped and safely cleaned after the owner identified
that abandoned draft attempts could create unexplained gaps in official release
numbers. P-39 supersedes the P-23.1 permanent all-status reservation rule for
future execution while preserving its evidence as history. Forward migration
`022` introduces immutable draft references, retains a draft's target in audit,
and releases the unissued official tuple on abandonment. See
[Correction Plan #37](../plans/master-catalog/37-phase4-p39-draft-identity-release-number-correction-plan.md).
P-39R further replaces the per-base draft invariant with one open draft
globally, permits audited abandonment of a stale draft, records restore impact
and pointer transitions durably, and hardens RLS/lifecycle/publication metadata.
The separately approved incremental P39R-L apply of `022` preserved the current
catalog, BOQ, and Factor F hashes but exposed that the code-registry staff policy
matched only identity while its contract requires the exact code pair used in
an issued snapshot. Preserve applied `022`; forward migration `023` owns that
policy correction and the accumulated-history harness now derives published
identity/code counts instead of assuming a clean 710-row registry. Corrected
`023` then applied transactionally from exact pushed source `6f01457` without
reset and preserved the same disabled baseline. The full WP-6.6 rerun continued
to draft creation and safely timed out while the migration `021` row trigger
repeated candidate/base scans for each of the 710 cloned rows. Cleanup restored
zero drafts, all flags false, pointer `2568.0.0`/710, and unchanged BOQ/Factor F.
Preserve applied `022`/`023`; bounded forward migration `024` replaces only that
trigger execution shape with statement-level transition tables and a
transaction-local cache. It does not replace the large mutation RPC or add
permanent derived state. Exact pushed `b6d58ce` applied `024` transactionally
without reset. WP-6.6 and WP-7.5 both passed, including the prior clone point,
placement revision/race/replay/rollback/order semantics, and cleanup. Canonical
evidence detected `017`-`024`, three statement triggers and zero legacy row
triggers, pointer `2568.0.0`/710, and unchanged catalog/BOQ/Factor F hashes.
P39R-L passed. Separately approved P39R-C then passed a clean `009`-`024`
bootstrap and the full live/export/advisor/invariant suite on exact pushed
`10531610eac53a97c6ef8f9d06418766b58bee36`. Owner P39R-U later passed distinct
draft identity plus reusable unissued target behavior. The exploratory P-38
continuation found application/parser/UAT-order issues corrected and pushed at
P-40 checkpoint `dc83c35` without adding or changing a migration. Separate
no-reset developer browser QA passed the corrected money/unit/withdraw paths
and restored the disabled Local baseline; a fresh scored Cards A-G rerun
remains pending before P-37.

P-41 records three additional P-38 discovery findings. First,
`categoryCode` is the official versioned category dictionary key and may be the
full Thai authority label; the current Local maximum is 96 characters, so the former
64-character application ceiling was drift, not invalid authority. Second, a
Full import with retirements must still produce a complete read-only preview
when retirement capability is disabled, without creating an import/change set
or exposing Apply. Third, withdrawing a never-published row could leave a
hidden `display_order` gap: the client preview silently resequenced while the
database correctly failed closed. Application validation now rejects a gapped
draft, and forward-only migration `025` owns atomic post-delete compaction.
`025` was applied incrementally to the disabled Local baseline without reset.
Exact pushed source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed the
full source gates and incremental WP-6.6 smoke. The owner then approved one
warned destructive Local reset. Exact pushed execution source
`adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied `009`-`015`, hotfix
`016`, and Phase 4 `017`-`025`. WP-6.5, WP-6.6, WP-7, and WP-7.5 evidence
SHA-256 values are respectively
`4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245`,
`e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251`,
`5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195`, and
`0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240`.
The evidence files remain untracked under `tmp/master-catalog/`. Final readback
repeated pointer `2568.0.0`/710, canonical hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
zero working drafts, all flags false, BOQ 198/1,547, and Factor F
`2569.0.0`/36. Fresh scored Owner UAT remains open.

The first fresh scored Card A then exposed P-42: final-review URLs did not bind
the reviewed lock, and a successful Local publication was followed by the
false draft-only warning **ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า**. Read-only
evidence shows one current-lock publication effect, not a stale-lock bypass.
Local `2568.5.0` is now published/default with 710 rows; scored Cards B-G are
stopped. P-42 binds draft review URLs to `reviewLock`, hard-stops stale tabs,
and makes published review read-only with accurate labels. It changes no SQL,
migration order, DB guard, BOQ, Factor F, or hotfix. See
[P-42 Incident Note #38](../plans/master-catalog/38-phase4-p42-final-review-snapshot-binding-incident-note.md).
Exact P-42 application/docs checkpoint
`b2500b5e6859a915bfa3f70d558934f252943f82` is pushed. The Owner subsequently
approved one warned Local recovery bootstrap. Exact pushed source `f8c6709`
restored canonical `2568.0.0`/710, applied the unchanged `009`-`015`, hotfix
`016`, and `017`-`025` chain, and prepared an immutable UAT session. Cards A-G
passed functionally with live guidance/developer assistance; both D001/D002
attempts were audited-abandoned and cleanup restored zero working drafts and
all flags false. Strict independent evidence remains open; no further reset is
authorized.
No Production, BOQ, Factor F, or hotfix scope was authorized.
Applied hotfix `016` must not be edited.
This is not a new Production hotfix and must not be applied to Production
without the normal Phase 4 P-12+ approvals.

`010a_master_catalog_phase1a_indexes.sql` is an operational runbook rather than
a transactional migration. Run its `CREATE INDEX CONCURRENTLY` statements one
at a time outside an explicit transaction.

---

## 2. Migration Process

### Local rehearsal

After telling the owner that the command destroys/rebuilds the whole Local
Supabase stack and receiving explicit approval, use
`npm run db:local:bootstrap`. It resets Local Supabase to the schema-only
Production baseline, restores scrubbed snapshots, applies root migrations
`009` and `010`, applies all four `010a` concurrent indexes individually, then
applies `011`, Factor F `012` through `015`, hotfix `016`, the draft
local-only Phase 4 scripts `017`, `017a`, then `018` through `026`, and runs
the bootstrap smoke tests. Source inclusion is not clean-execution evidence:
record the exact integration commit and receive a separate owner approval
before running this destructive command.

After that approved clean bootstrap, run the tracked WP-7 regression harness
with
`npm run db:local:smoke-master-catalog-wp7 -- --output tmp/master-catalog/wp7-evidence/<run>.json`.
It is regression-only and must leave the catalog pointer, BOQ baseline, Factor
F authority, grants/RLS, and binding triggers at their required final state. It
must not create a Factor F workflow or expand hotfix `016`.

The historical P-20 two-rebuild comparison already passed for the data-bearing
chain through `025`. Both `017a` and `026` are data-free ACL-only changes, so
PRE-P-12 does not repeat that historical two-reset portability proof. After one
fresh separately approved corrected integration bootstrap, run
`npm run db:local:smoke-master-catalog-wp65 -- --output tmp/master-catalog/wp65-evidence/<run>.json`
once to capture request fingerprint, rollback, role, readiness,
publish/restore race, P-20 mapping, BOQ, Factor F, and final security evidence.
Retain the already accepted independent two-rebuild JSON comparison as
historical portability authority. A second new Local reset is permitted only
if source that can affect data/identity changes or the corrected integration
run fails, and in either case requires a fresh explicit Owner reset approval.
Disposable CLI pass 1 and pass 2 are separate fresh PostgreSQL targets; they
are not additional Local Supabase resets.

The CLI remains intentionally unlinked from Production. Do not use `db push`,
`db pull`, or linked diff commands from this worktree. Local migration history
contains no rollout scripts because both the baseline and root Master Catalog
scripts are applied explicitly by the bootstrap script. That script is the
canonical Local rehearsal ledger for this rollout.

### Production execution

Production execution is authorized only by the owning reviewed runbook; this
inventory is not executor approval. Historical `009`-`016` ledger records and
the operational `010a` index evidence remain unchanged.

For Master Catalog Phase 4 P-12,
[Package #39 section 4.1](../plans/master-catalog/39-phase4-p12-production-readiness-package.md)
and [Production Runbook section 9](../plans/master-catalog/12-phase4-production-runbook.md)
supersede any generic SQL Editor or MCP copy/paste procedure. Apply one
immutable reviewed file at a time in exact `017`, `017a`, `018`-`026` order, preserve one
identifiable remote migration-ledger row per file, use the same frozen
`current_user`/object-owner role, and perform the reviewed after-file ledger,
ownership, and ACL checks. SQL Editor, MCP, or direct `psql` is not acceptable
merely because it can execute SQL; the exact path must be selected, rehearsed
for `020`, and approved. No Production path, executor, verifier, object-owner
role, or P-12 window is currently approved.

The current worktree must not use `db push`, `db pull`, linked diff, or
Production MCP migration execution. The fresh encrypted backup/restore,
checksum, custody, and sign-off gate in Package #39 and Runbook section 8
replaces the generic `001_backup_before_migration.sql` reminder for P-12.

The Factor F no-maintenance runbook is retained as executed historical
evidence:
[09-production-no-maintenance-runbook.md](../plans/factor-f/09-production-no-maintenance-runbook.md).

---

## 3. Rollback Procedures

Currently, only one rollback script exists:

- **`002_rollback_multi_route_support.sql`**: Removes `boq_routes` table and `route_id` from `boq_items`, restoring the system to single-route mode. Any multi-route BOQs created after migration 002 will be lost.

For every other applied Production migration, do not improvise a manual reverse
operation. Follow the owning runbook: keep/disable the feature flag, restore an
audited business pointer when applicable, revert the compatible application
deployment when needed, and fix forward with a separately reviewed migration.
A destructive rollback is allowed only when an explicit rollback migration or
script has been reviewed, restore-tested, fingerprinted, and approved for that
exact incident/window. Never edit an applied migration file.

---

## 4. Status Legend

| Status | Meaning |
|--------|---------|
| **Applied** | Successfully run on production database |
| **Applied (superseded)** | Applied but later migrations override some policies |
| **Applied Supplement** | Applied as an additive change to existing schema |
| **Applied (Manual Supplement)** | Applied manually outside normal migration sequence |
| **Applied Legacy Artifact** | Historical script preserved outside the active Local migration directory |
| **Applied operationally** | Nontransactional runbook statements executed and verified outside the remote migration ledger |
| **Local Baseline Only** | Schema snapshot used only to rebuild Local Supabase; never push to Production |
| **Backup/Utility** | Not a schema change; diagnostic/backup queries |
| **Rollback Utility** | Reversal script, run only if rollback is needed |
| **Draft** | Review and test before applying to production |
| **Planned** | Reserved future work; not implemented or applied |
| **Historical pre-execution status** | Row text preserved from before a later overlay/completion; read the dated overlay before treating it as current |

---

## References

- Historical multi-route guide: [migrations/README.md](../../migrations/README.md)
- Master Catalog change request: [04-change-request.md](../plans/master-catalog/04-change-request.md)
- Master Catalog verification report: [05-verification-report.md](../plans/master-catalog/05-verification-report.md)
- Phase 4 change request: [09-phase4-change-request.md](../plans/master-catalog/09-phase4-change-request.md)
- Factor F no-maintenance runbook: [09-production-no-maintenance-runbook.md](../plans/factor-f/09-production-no-maintenance-runbook.md)
- Factor F rollout closeout: [10-production-rollout-closeout.md](../plans/factor-f/10-production-rollout-closeout.md)
- Database Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
