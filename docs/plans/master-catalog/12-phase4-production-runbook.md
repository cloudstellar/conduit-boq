# Master Catalog Phase 4 Production Runbook

**Status:** Draft — execution requires explicit owner approvals
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Default posture:** Feature flag disabled; stop on any failed gate

**Current P-37 disposition (2026-07-25):** WP-8 is Owner-accepted under the
explicit guided-UAT variance recorded in the Decision Register against exact
checkpoint `df44b827b290933463da5e14fa9125314660022a`. This permits only a
later P-12 readiness request. It is not permission to run any Production step,
open Add/Supplement before P-14, decide P-19, or change Factor F/hotfix scope.

## 1. Safety statement

This runbook is an execution checklist, not standing permission to change
Production. Implementation approval, Production migration approval,
application-deploy approval, feature enablement, and catalog publication are
separate decisions.

Never paste a migration into Production before confirming the reviewed file
fingerprint and current schema preflight. Never edit or delete a published
catalog to roll back.

## 2. Roles

| Role | Responsibility | May also be |
|---|---|---|
| Owner | Approves scope, Production window, and named catalog publication | Business approver |
| Executor | Runs migration/deploy/flag/publish steps and records evidence | Developer/admin |
| Verifier | Independently checks counts, security, UI, exports, and rollback | Different person where practical |
| Taxonomy reviewer | Approves AAA/TTT and row-level mapping | Domain engineer/data steward |
| Price authority | Confirms price basis and no unauthorized changes | Owner delegate |

## 3. Required artifacts

- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [Code Dictionary](./10-phase4-structured-code-dictionary.md)
- [Reconciliation Report](./11-phase4-reconciliation-report.md)
- [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Decision Register](./19-phase4-decision-register.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
- [Architecture Review Disposition](./21-phase4-architecture-review-disposition.md)
- [Post-Factor-F Adjustment Plan](./22-phase4-post-factor-f-adjustment-plan.md)
- [Implementation Execution Pack](./23-phase4-implementation-execution-pack.md)
- [Owner/Developer Capability Completeness Audit](./29-phase4-owner-dev-completeness-audit.md)
- [P-18 Placement Governance Review Note](./28-phase4-p18-placement-governance-review-note.md)
- [WP-8 P-37 Closure Matrix](./34-phase4-wp8-p37-closure-matrix.md)
- [P-39 Draft Identity and Release-Number Correction Plan](./37-phase4-p39-draft-identity-release-number-correction-plan.md)
- [Execution Progress Tracker authority/evidence index](./25-phase4-execution-progress-tracker.md)
- [Verification Report](./13-phase4-verification-report.md)
- [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md)
- Reviewed migration SQL and file SHA-256
- Supabase security/performance advisor baseline with known findings triaged
- Fresh logical backup manifest and tested restore log
- Approved runtime CI assets via P-10 and
  [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); `/CI/` source
  remains local-only

## 4. Stop conditions applying to every phase

Stop immediately when any of these occurs:

- current Production counts/invariants differ without explanation;
- a reviewed file fingerprint differs;
- backup or restore test is incomplete;
- reconciliation does not cover all 710 Production UUIDs;
- a Production price/name/unit changes during code-only rollout;
- a code maps to multiple identities or an identity duplicates inside a version;
- a published baseline identity/code history would be merged or rewritten;
- current catalog pointer is missing, duplicated, or not the expected base;
- Factor F default pointer, active-version row count/hash, grants, RLS, or
  immutability trigger changes during a Master Catalog step;
- an existing BOQ `factor_reference_version_id` mutates, or a legacy BOQ is
  backfilled with a guessed Factor F version;
- a Master Catalog export or canonical dataset hash includes Factor F rows,
  Factor F metadata, BOQ snapshots, or BOQ totals;
- anonymous/non-admin access succeeds unexpectedly;
- migration, test, build, smoke, hash, or export gate fails;
- approved P-20 identity/hash implementation or independent clean-rebuild
  evidence is missing/mismatched when clean-rehearsal or migration-fingerprint
  evidence is being accepted;
- a retryable UI/action path generates a fresh request ID after an uncertain
  response;
- reusable version logic remains hardcoded to `2568.1.0` contrary to ADR-003;
- version intent is not explicitly approved, the issued/currently-claimed
  registry is incomplete, the reviewed target is no longer next, a published or
  archived number would be reused, or an abandoned attempt still consumes its
  unissued target;
- live DB/RPC/RLS/concurrency, tracked artifact verification, admin UAT, or
  documented recovery evidence required for the next gate is missing;
- any Audit #29 C-01 through C-17 capability is visible as supported without
  its authoritative WP-6.6 implementation/evidence;
- an item/import path creates free-form taxonomy, accepts caller-owned code
  allocation/publisher identity, silently chooses a draft, or presents partial
  diff/readiness as final authority;
- two mutable drafts can exist globally, a draft/abandon action loses audit
  history, or publication can proceed without the exact final snapshot/lock
  state the operator reviewed;
- Recode/Retire can cross the mutation boundary without their exact summary,
  or Publish can call its RPC without a server-validated exact DB-read target
  version confirmation;
- Supabase advisors show a new or untriaged security/performance finding for
  the Phase 4 change set;
- unexpected active admin activity or simultaneous catalog edit is detected;
- owner approval is absent for the next Production action.

## 5. Phase 4-0 — documentation and data decisions

1. Confirm Factor F rollout closeout and production hotfix `016` before
   scheduling any Master Catalog Phase 4 database migration. Factor F `012`
   through `015` completed on 2026-06-29; hotfix
   `016_hotfix_preserve_boq_item_suffix.sql` completed on 2026-07-06; current
   default Factor F is `2569.0.0`, legacy BOQs were not version backfilled, and
   Master Catalog Phase 4 migrations must start at `017+`.
   Live BOQ counts may drift after the closeout; record current counts at every
   Production gate instead of reusing the closeout count.
2. Record owner approval of ADR-004 and implementation/local-rehearsal CR gate.
3. Review the 728-record reconciliation draft.
4. Resolve `ITEM-0131` / `ITEM-0139`: retain both distinct identities or retire
   the erroneous duplicate in the candidate; never merge UUID/history.
5. Correct/reject all 16 HDPE Crossing taxonomy conflicts.
6. Allocate approved treatment for 20 Production-only rows.
7. Keep the 17 unresolved supplement candidates deferred unless separate price
   authority exists; treat workbook `FTW-CON-002` only as P-07 typo-shadow
   evidence for Production `ITEM-0491`.
8. Approve the complete AAA/TTT dictionary and allocation rules.
9. Approve parser, payload, error-code, and canonical-hash contract.
10. Approve database/security, threat, and official-export contracts.
11. Use P-08 truthful publication metadata for legacy `2568.0.0`: effective
    `2026-01-01`, approval reference `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`,
    approval document date `2025-11-27`, and publisher snapshot
    `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`; do not invent generated backfill fields
    or reuse Factor F evidence.
12. Confirm `/CI/` is excluded from commits and identify approved derivative
   fonts/logo assets.
13. Complete the Phase 4 verification template baseline section.
14. Verify P-27 owner acceptance of Audit #29 C-01 through C-17 on exact
    application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`;
    this did not itself authorize G4, migration/bootstrap, or reset. Then verify
    P-28/G4 repository integration separately: bootstrap source includes exact
    accepted `020`. Finally verify P-29/G4E separately: exact checkout
    `15b707d443bec701f6b3a86aa7675ca1266604ba` passed the combined Local
    `009`-`020` bootstrap and live WP-7 technical evidence. This is not WP-8 or
    Production approval. Finally verify P-35 separately: unchanged amended
    `021` is now in bootstrap source after `020`. P-36 was separately approved
    after the reset warning and the integrated Local technical rehearsal passed
    on exact checkout `910cc3c`. Corrected intended-admin interaction/recovery
    and complete owner keyboard/focus/presentation UAT later passed on pushed
    checkpoint `f36d896d672609653de6634e307dcc44bce6d519`. That historical
    no-assistance scoring gap is retained in the evidence. The Owner later
    accepted the combined guided UI and developer fault-injection/cleanup
    package under an explicit variance on 2026-07-25; do not relabel it as
    independent. Verify the accepted rows in
    [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) before any
    separate P-12/P-14 request. See also
    [P-37 UAT/UX Note](./33-phase4-wp8-p37-uat-ux-correction-note.md).
15. Verify P-39R separately: the P-38 Card A session was safely cleaned and
    P-23.1 permanent reservation is historical. Corrected `022`, forward
    code-RLS correction `023`, and set-based placement invalidation correction
    `024` passed P39R-S, incremental P39R-L on exact pushed `b6d58ce6`, and the
    separately approved destructive P39R-C clean chain on exact pushed
    `10531610eac53a97c6ef8f9d06418766b58bee36`. Do not request P-37/P-12
    until owner P39R-U passes. Confirm one open draft globally, stale-draft
    abandonment, restore effect/pointer audit, role/state RLS, complete
    publication metadata, and replay identity. The completed P39R-C approval
    does not authorize a later reset or any Production action.

**Exit gate:** All documents have owner/reviewer decisions; no unresolved row
or taxonomy blocker.

## 6. Local foundation rehearsal

### 6.1 Refresh and restore evidence

1. Refresh a read-only Production schema/data snapshot using the approved
   process. Exclude password hashes, sessions, refresh tokens, OTP, MFA, and
   sensitive auth/audit payloads.
2. Record source counts and table checksums in the verification report.
3. Restore into the project-scoped Local Supabase environment.
4. Confirm the Local project identity and ports before running any SQL.
5. Confirm Local counts/checksums match the snapshot.

Use the installed Supabase CLI `--help` for exact current command syntax. Do not
guess CLI flags. Supabase's June 2026 self-hosted images default toward
Postgres 17; pin/rehearse the project's supported version and never point a new
major image at an incompatible existing data directory.

### 6.2 Rehearse additive migration

1. After explicit warning and owner approval for the destructive Local reset,
   start from the canonical bootstrap source that applies root `009`-`015`,
   production hotfix `016`, and Phase 4 `017`-`024` in that order. G4 repository
   integration placed accepted `020` in source on 2026-07-15, and P-29/G4E
   subsequently passed the combined clean execution. P-32 separately applied
   and proved amended P-18/WP-7.5 `021`; P-35 later placed that unchanged file
   in source. P-36 later supplied separate integrated execution evidence on
   exact `910cc3c` after explicit owner warning/approval. P39R-C later repeated
   the complete `009`-`024` chain on exact `10531610` after its own warning and
   approval. Its bootstrap, DB/RLS/concurrency/export/advisor/invariant evidence
   passed. Any future destructive rerun still requires a fresh warning and
   approval; neither P-36 nor P39R-C is reusable blanket reset permission.
2. If applying SQL manually for a focused rehearsal, apply hotfix `016` before
   any reviewed Phase 4A migration(s).
3. Verify all new tables, constraints, indexes, grants, RLS policies, functions,
   and triggers.
4. Confirm explicit Data API grants for required roles; new Supabase tables may
   not inherit automatic grants.
5. Confirm private-schema mutation functions are not exposed.
6. Backfill exactly 710 stable identities and legacy codes.
7. Backfill exactly 52 display categories or document the refreshed expected
   count.
8. Confirm pointer and legacy `is_default` mirror agree.
9. Run security and performance advisors.

### 6.3 Rehearse application workflow

With feature flag disabled by default:

1. Deploy/run the Phase 4 application locally.
2. Choose the approved annual/revision/patch intent. An annual effective year
   must be within base year +1 through +10 and must match the approved business
   year; do not bypass this guard with direct SQL. For the first structured
   rollout choose revision from `2568.0.0`, review the complete issued/currently-
   claimed registry, and accept `2568.1.0` only when it remains the system-planned
   target. Record the immutable draft reference separately.
3. Assert all 710 name/unit/material/labor/unit values are identical.
4. Apply approved code/category decisions; K fields must remain absent.
5. Complete WP-6.6 before WP-7: load/search the full catalog; expose exact item
   history/diff; open the one exact current-base workspace; make stale drafts read-only;
   resolve only approved versioned category/P-06 group IDs; allocate codes on
   the server; show complete
   server import diff/omissions with supported price evidence; derive publisher
   identity; require version archive reference; align readiness with publish;
   prove reactivate/withdraw and required schema constraints.
6. Test one manual add, edit, retire, recode, reactivate, and eligible withdraw
   with reasons.
7. Test Full and Supplement imports, including complete authoritative diff,
   exact omissions, and approved/missing new-row price evidence.
8. Before WP-7, run the implemented WP-6.5 P-18 guard and prove it rejects
   publishing any draft with
   add/supplement identities absent from the base version, returning
   `P18_PLACEMENT_REVIEW_REQUIRED` without pointer movement.
9. Before WP-7, prove an unchanged legacy-only clone can publish, then prove
   the WP-6.5 structured-code guard activates once the draft contains an active
   canonical `AAA-TTT-NNN` code and rejects a candidate whose active legacy
   `ITEM-####` rows exceed the recorded `ITEM-0139` exception.
10. Test duplicate request ID, stale lock version, stale base pointer, invalid
   price delta, invalid identity/code reuse, and unauthorized role.
11. Simulate an uncertain response after commit and prove the UI/action retry
    reuses the same operation ID and returns the prior result.
12. Run two-session publish/restore contention and bounded timeout fixtures.
13. Verify item history across a recode and correction action.
14. Prove all ADR-003 lanes, incomplete/stale sequence rejection, draft-reference
    uniqueness, target claim, audited target release and reuse after abandonment,
    permanent published/archived reservation, create race, and same-request replay.
15. P-18 is accepted and the P-32 placed-new-identity technical path has passed.
    Repeat that path in the separately approved WP-8 scope, generate Excel/PDF,
    and compare count/hash before any release-readiness claim.
16. Test audited pointer restore and verify historical BOQs are unchanged.
17. Rebuild from a clean Local reset and repeat the critical path only after
    the owner approves the Local Supabase reset.
18. Run
    `npm run db:local:smoke-master-catalog-wp7 -- --output tmp/master-catalog/wp7-evidence/<run>.json`
    and the focused WP-7 print/export contracts. Require all four approved
    suffixes, invalid/cross-version atomic rollback, anonymous/non-authorized
    denial, duplicate and selected-Factor-F copy behavior, publish/restore BOQ
    invariants, and exact Factor F/grant/RLS before/after evidence.

### 6.4 Repository gates

Run and record:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run audit:prod`
- database/security tests
- live DB/RPC/RLS/concurrency and timeout tests
- desktop/mobile browser QA
- tracked semantic Excel/PDF visual/hash verification
- documentation/authority consistency verification
- intended-admin UAT and 710-row performance evidence

**Exit gate:** Rehearsal and fresh reset both pass; no unresolved advisor or
regression blocker.

### 6.5 Production readiness review after WP-8

After Local evidence is green, pause before Production and review the evidence
as a separate readiness package. This gives the owner, executor, and verifier
time to decide whether the rollout is truly ready before requesting P-12.

Before requesting P-12, record:

- WP-8 verification report evidence for clean Local reset and full workflow;
- current branch/commit, migration filename, migration SHA-256, and deployment
  artifact fingerprint;
- hotfix `016` evidence in the remote ledger and clean Local bootstrap path
  before any Phase 4 `017+` evidence is accepted;
- fresh read-only Production baseline and schema drift result;
- fresh logical backup manifest plus restore-test evidence;
- BOQ regression evidence, including price-list version links and Factor F
  version/snapshot invariants;
- Factor F before/after assertion plan showing no Master Catalog step mutates
  Factor F default pointer, rows, hashes, grants, RLS, or BOQ bindings;
- stable operation-ID timeout/retry, structured log, and two-session
  concurrency evidence;
- P-20 clean-reset identity/hash portability evidence;
- ADR-003 reusable version evidence beyond the exact first candidate;
- tracked semantic artifact-verifier output;
- route failure-state, Thai recovery message, intended-admin UAT, and 710-row
  performance evidence;
- Audit #29 capability matrix showing C-01 through C-17 implemented/evidenced
  or an affected control explicitly excluded from release visibility;
- authority/document consistency result;
- security/performance advisor results with no unresolved Phase 4 blocker;
- feature flag state proving the Phase 4 UI remains disabled by default;
- owner go/no-go for P-12 Production migration.

P-13 deploy, P-14 feature enablement, and P-15 publication are requested only
after the immediately preceding gate passes. P-15 remains separate and requires
the exact final catalog metadata, diff/count/hash, export, and filing evidence.

Do not request or run P-12 if any evidence is missing, stale, failed,
ambiguous, or different from the reviewed plan.

## 7. Production preflight — read only

Run immediately before the approved window and record exact output:

```sql
select count(*) as price_rows,
       count(distinct item_code) as distinct_codes,
       count(*) filter (where item_code is null or btrim(item_code) = '') as missing_codes,
       count(*) filter (where item_name is null or btrim(item_name) = '') as missing_names,
       count(*) filter (where unit is null or btrim(unit) = '') as missing_units,
       count(*) filter (where material_cost is null or labor_cost is null or unit_cost is null) as missing_costs,
       count(*) filter (where unit_cost is distinct from material_cost + labor_cost) as unit_cost_mismatches
from public.price_list;
```

```sql
select v.version_string, v.status, v.is_default, d.version_id
from public.price_list_default_version d
join public.price_list_versions v on v.id = d.version_id;
```

Expected baseline at document preparation: 710 rows, 710 codes, zero missing or
mismatch rows, and one `2568.0.0` active/default pointer. Live approved changes
must be reconciled; never force a stale expectation.

Record the post-Factor-F baseline in the same preflight:

```sql
select
  (select v.version_string
   from public.factor_reference_default_version d
   join public.factor_reference_versions v on v.id = d.version_id) as factor_default_version,
  (select count(*) from public.factor_reference_versions) as factor_version_count,
  (select count(*) from public.factor_reference_rows) as factor_reference_rows,
  (select count(*) from public.boq) as boq_count,
  (select count(*) from public.boq where price_list_version_id is null) as boq_missing_price_version,
  (select count(*) from public.boq where factor_reference_version_id is not null) as boq_bound_factor_version;
```

Also capture the mixed BOQ population:

```sql
with classified as (
  select
    b.id,
    fv.version_string as factor_version,
    case
      when b.factor_reference_version_id is not null then 'version_bound'
      when b.factor_f is null then 'legacy_missing_factor_f'
      when b.factor_f_raw is not null
        and b.factor_f_lower_cost is not null
        and b.factor_f_upper_cost is not null
        and b.factor_f_lower_value is not null
        and b.factor_f_upper_value is not null
        and (
          (b.factor_f_lower_cost = 5000000 and b.factor_f_upper_cost = 5000000)
          or (b.factor_f_lower_cost = 700000000 and b.factor_f_upper_cost = 700000000)
          or b.factor_f_lower_cost < b.factor_f_upper_cost
        )
        then 'legacy_usable_snapshot'
      else 'legacy_partial_snapshot'
    end as factor_state
  from public.boq b
  left join public.factor_reference_versions fv
    on fv.id = b.factor_reference_version_id
)
select factor_state, coalesce(factor_version, '-') as factor_version, count(*) as boq_count
from classified
group by factor_state, factor_version
order by factor_state, factor_version;
```

Expected policy, not fixed counts:

- current Factor F default is an active version, currently `2569.0.0`;
- `boq_missing_price_version = 0`;
- legacy BOQs may remain unbound to Factor F by design;
- version-bound BOQs may exist and must keep their current
  `factor_reference_version_id`;
- no Phase 4 step may backfill or mutate legacy Factor F version bindings.

Also verify:

- migration ledger matches repository history;
- no Phase 4 object already exists unexpectedly;
- all current RLS/security invariants from Phase 1B remain intact;
- no Factor F change is scheduled or bundled into this Master Catalog window;
- `factor_reference_versions`, `factor_reference_rows`,
  `factor_reference_default_version`, and BOQ Factor F immutability triggers are
  present and will not be modified by the Master Catalog migration;
- no unexpected active admin session is editing catalog data.

## 8. Backup gate

1. Create an encrypted logical schema/data backup immediately before migration.
2. Create a manifest with timestamp, source project, included tables, excluded
   auth fields, row counts, and SHA-256 fingerprints.
3. Restore the backup into clean Local and run critical checks.
4. Record backup location by reference; do not commit secrets or production
   dumps.
5. Owner/executor/verifier sign the backup gate.

No verified restore means no Production migration.

## 9. Production Phase 4A — additive database migration

### Before execution

- Confirm explicit owner approval for this migration window.
- Confirm reviewed migration filename and SHA-256.
- Confirm feature flag remains disabled.
- Set bounded `lock_timeout` and `statement_timeout` inside the reviewed SQL.
- Confirm whether any concurrent index statement must run outside a transaction.

### Execute

1. Apply the reviewed additive migration through the approved Supabase path.
2. Do not modify the SQL interactively except to stop safely.
3. Record tool, executor, start/end time, result, and remote migration ledger ID.

### Immediate verification

- New tables/columns/constraints/indexes match the reviewed schema.
- RLS enabled on every new `public` table.
- Required `authenticated` grants exist; `anon`/`PUBLIC` writes do not.
- Backfill covers exactly 710 identities and legacy codes.
- No duplicate version/code or version/identity pairs.
- Current `2568.0.0` pointer and current application behavior are unchanged.
- `is_default` mirror equals the singleton pointer.
- Existing BOQ counts/version links are unchanged.
- Existing `boq.factor_reference_version_id` values and legacy nulls are
  unchanged.
- Factor F default pointer, published rows, and dataset hashes are unchanged.
- Security/performance advisors have no new blocker.

If a post-commit issue exists, keep the flag disabled and forward-fix with a
new reviewed migration. Do not edit the applied migration file.

## 10. Production application deployment

1. Confirm CI passed on the exact deployment commit.
2. Deploy the compatible application with Phase 4 flag disabled.
3. Smoke current Dashboard, Price List, BOQ list/search/create/edit/duplicate,
   print “แบบ ปร.1”, and exports.
4. Smoke one version-bound BOQ and one legacy snapshot-only BOQ where available;
   confirm Factor F version labels/snapshot behavior are unchanged.
5. Confirm labels/metrics outside approved Phase 4 UI are unchanged.
6. Confirm no browser console/server error and no secret in client bundles.
7. Run active-admin Phase 4 read smoke while the feature remains hidden from
   ordinary users.

On failure, revert the application deployment. The additive database schema is
left in place and the feature flag stays disabled.

## 11. Feature enablement

1. Obtain explicit owner approval.
2. Enable for active admins only.
3. Verify route/menu authorization, empty/loading/error states, responsive UI,
   keyboard/focus behavior, and NT CI assets.
4. Verify Thai failure/recovery messages and request-ID support correlation.
5. Have an intended admin complete the approved UAT script without developer or
   SQL assistance.
6. Create and discard a test draft using an ADR-003-valid version; do not move
   the Production pointer.
7. Verify non-admin users cannot access admin data/actions.

Disable the flag immediately if any smoke test fails.

## 12. Candidate preparation and publish gate

1. Select the owner-approved business intent and let the guarded planner clone
   current `2568.0.0` into the displayed target. Expect `2568.1.0` only when it
   is not issued or currently claimed; record both the immutable draft reference
   and target for every later step. Publication, not draft creation, issues it.
2. Run the 710-row preservation assertion before applying codes.
3. Apply the approved reconciliation only.
4. Confirm Full/Supplement mode and row outcomes.
5. Review the complete server-recomputed diff for
   add/update/retire/recode/unchanged/price and exact Full omissions.
6. For Full import, confirm every omission. If retirement count reaches
   `max(10, ceil(2% of active base))`—15 for 710 rows—match the typed count and
   stored owner approval reference.
7. Require price-change total = 0 for this rollout.
8. Complete approval reference, approval document date, effective date,
   version-level physical archive reference, reason, and any separately governed
   business approver. Confirm the publisher actor snapshot comes from the
   authenticated active-admin profile.
9. If import was used, have the verifier independently hash the filed source
   workbook and match the recorded client-computed fingerprint.
10. If add/supplement/new identity rows are present, require accepted P-18,
    WP-7.5 placement revision/review, inherited-relative-order and exact export
    evidence. Otherwise keep publication blocked by the WP-6.5 guard and hide
    Add/Supplement at feature enablement.
11. If any inactive/retired rows are present, confirm P-19 official PDF
    rendering/exclusion policy before filing field-facing artifacts.
12. If the exact candidate begins structured-code rollout, confirm the WP-6.5
    guard evidence, including the approved temporary `ITEM-0139` exception and
    no other active legacy `ITEM-####` rows. Do not apply this rollout-specific
    rule to an unchanged legacy-only clone.
13. Confirm expected lock version and current pointer/base match.
14. Confirm P-20 identity/hash portability evidence matches the exact reviewed
    migration/candidate contract.
15. Confirm the reusable version path follows ADR-003 and the exact candidate
    version is supplied by approved release metadata, not a code constant.
16. Generate pre-publish verification preview.
17. Obtain explicit owner approval to publish the exact system-planned candidate
    shown in the final review, including any mass-retirement total.

## 13. Publish and immediate closeout

1. Prepare one operation request ID before publish and execute once. If the
   response is uncertain, preserve that ID and inspect audit/state before retry;
   never generate a second ID for the same intended publish.
2. Record result, item count, dataset hash, authenticated actor snapshot,
   version archive reference, and timestamp.
3. Verify one singleton pointer to the exact approved candidate and synchronized
   legacy flags.
4. Verify the prior version remains readable and immutable.
5. Generate official Excel and PDF from the published database version.
6. Reconstruct the Excel dataset hash from `ข้อมูลตรวจสอบ`; verify PDF
   generation rechecked and printed the same database item count/dataset hash.
7. Visually inspect stamp, page headers, Thai font, totals/numeric cells, and
   clipping.
8. Compute the final Excel and saved-PDF binary SHA-256 values, then record
   them separately from the canonical dataset hash.
9. File exports and physical approval/source evidence.
10. Create a post-publish logical backup and manifest.
11. Test existing BOQ edit/print/export and new BOQ creation.
12. Complete verification report and release note.

## 14. Rollback and recovery

| Situation | Response |
|---|---|
| Migration fails before commit | Transaction rolls back; stop and investigate |
| Additive schema issue after commit | Flag disabled; reviewed forward-fix migration |
| Application regression | Revert deployment; schema remains compatible |
| Feature-only UI issue | Disable feature flag |
| Candidate validation fails | Keep draft; correct through audited change; do not publish |
| Add/supplement/new identity rows lack P-18 placement approval | Keep draft reviewable; do not publish; guard must reject with `P18_PLACEMENT_REVIEW_REQUIRED` |
| Structured-code candidate has unapproved active legacy `ITEM-####` rows | Keep draft; correct mappings or return to owner; do not publish |
| Inactive/retired rows lack P-19 PDF policy | Do not file official field-facing PDF; get owner/data-custodian policy first |
| Publish fails in transaction | No pointer change; inspect request/result and retry only when safe with the same operation ID for the same intended payload |
| Publish response is lost after commit | Inspect pointer/change set by request ID; retry only with the same ID so the prior result is returned |
| Published version is business-invalid | Audited pointer restore to prior published version; create correction version |
| Export hash mismatch | Do not distribute; investigate canonicalizer/export and regenerate |

Pointer restore must:

- accept request ID, reason, and target published version;
- lock and update pointer plus legacy `is_default` mirror atomically;
- append a restore change set;
- leave published rows and historical BOQs untouched.

## 15. Closeout evidence

- Completed [verification report](./13-phase4-verification-report.md)
- Completed [release note](./16-phase4-release-note-template.md)
- Migration/deployment identifiers and file/commit fingerprints
- Authority/document consistency result and tracked artifact-verifier version
- Pre/post row counts and invariant results
- Advisor results and accepted exceptions
- Feature flag and pointer final state
- Official Excel/PDF names, hashes, and physical file references
- Full-import retirement count and owner approval reference, when threshold
  applies
- Pre/post logical backup manifests
- Owner/executor/verifier signatures
- UAT reviewer, representative task results, error-recovery result, and
  performance baseline
