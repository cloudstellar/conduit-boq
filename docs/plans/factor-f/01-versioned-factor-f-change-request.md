# Change Request: Versioned Factor F Reference and Immediate Factor F Update

**Status:** F1/F2 local implementation in progress — no Production Factor F
data change authorized
**Requested date:** 2026-06-28
**Change type:** Additive Factor F reference versioning, compatible BOQ
calculation behavior, and controlled Factor F publication
**Related ADR:** [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md)
**Readiness addendum:** [Factor F Track Readiness and Security Addendum](./02-readiness-and-security-addendum.md)
**Implementation plan:** [Factor F Versioning Implementation Plan](./03-implementation-plan.md)
**F3 source candidate:** [26 June 2026 Factor F Source Table Candidate](./04-source-table-2569-06-26.md)

## 1. Decision requested

Approve a separate Factor F change track before changing live Factor F values.
This approval is independent from Master Catalog Phase 4 price/catalog
publication.

This CR can be approved at different depths. F1/F2 foundation work can start
after the owner approves the policy and current-baseline verification approach.
F3 publication cannot start until the new Factor F table, effective date,
source reference, expected row count, formula/VAT decisions, data custodian,
and final row-level diff/hash approval are recorded.

The owner is asked to confirm:

1. Factor F changes do not bump `price_list_versions`.
2. Existing BOQs are not backfilled with the current factor version by
   assumption.
3. Legacy BOQs use saved snapshots only unless exact source evidence exists.
4. New BOQs must bind a Factor F reference version after the foundation is
   deployed.
5. Applying a new Factor F table to old project data requires a new BOQ
   copy/revision, not mutation of the old BOQ.
6. The specific new Factor F table/source/effective date is approved before
   publication.

Owner confirmations recorded on 2026-06-28:

- Effective date for the 26 June 2026 source candidate is confirmed as
  2026-06-26.
- Source reference is confirmed as หนังสือกรมบัญชีกลาง ด่วนที่สุด ที่ กค
  0433.2/ว 481 ลงวันที่ 26 มิถุนายน 2569.
- Owner will act as the row-level reviewer/data custodian for the F3 source
  transcription, diff, and hash approval.
- Official source document is retained outside the repository by owner/NT;
  local files under `files/` are review copies and are not approved for commit
  by this CR.
- Baseline source for the existing current table is confirmed as
  `FACTOR F 2566_7.PDF`, so the baseline version identity is `2566.0.0`;
  the new ว481 Factor F table is reserved as `2569.0.0`.

## 2. Recommended sequence for changing Factor F now

| Step | Purpose | Production effect |
|---|---|---|
| F0 — Approval and freeze | Approve ADR-005, this CR, source document, effective date, and validation method | No data change |
| F1 — Version foundation | Add `factor_reference_versions`, `factor_reference_rows`, `factor_reference_default_version`, and nullable `boq.factor_reference_version_id`; update app reads to use bound version when present | Existing BOQs remain compatible; new empty BOQs can bind once F2 creates the default pointer |
| F2 — Current baseline seed | Copy the audited current `factor_reference` table into the initial published factor version and point the singleton default there | New empty BOQs bind the baseline factor version; no old BOQ backfill |
| F3 — New Factor F publication | Create a new draft factor version from the baseline, apply approved row changes, validate full-table checksum, publish, and move the pointer | New BOQs use new Factor F |
| F4 — Duplicate/reprice UX | Offer explicit "create new estimate with latest Factor F" behavior for old project data | Old BOQs remain unchanged |

Do F1 and F2 before changing any live Factor F values. F3 is the actual Factor F
change.

Owner direction on 2026-06-28 is to do Factor F before Master Catalog Phase 4.
Therefore the recommended path is F0 -> F1 -> F2 -> F3, then Master Catalog
Phase 4. F3 still requires its own approved window after F1/F2 verification.
Do not silently combine Factor F publication with Master Catalog publication.

The current baseline row count is not a planning assumption. It must be
recorded from the Production preflight query before F2; if the result differs
from the expected current table, stop and reconcile before seeding.

Supabase MCP verified Production on 2026-06-28: latest migration ledger is
`20260621104056_master_catalog_phase1b_hardening` (`011`), `factor_reference`
has 37 rows with no duplicate thresholds and no invalid required values, and
Factor F version tables do not yet exist. Because Factor F is owner-selected
before Master Catalog Phase 4, reserve:

- `012_factor_f_version_foundation.sql`
- `013_factor_f_seed_current_baseline.sql`
- `014_factor_f_publish_2569_0_0.sql`
- `015_factor_f_repair_legacy_snapshot_metadata.sql`

Master Catalog Phase 4 database migrations therefore start at `016+`.

## 3. In scope

- Additive Factor F version schema and singleton pointer.
- `factor_reference_rows` preserves the calculation/reference columns required
  by the source table: `cost_million`, `factor`, `vat_percent`, `factor_f`,
  `factor_f_rain_1`, and `factor_f_rain_2`. Legacy/source-derived component
  columns such as `operation_percent`, `interest_percent`, `profit_percent`,
  and `total_expense_percent` may be retained as nullable metadata, but must
  not be invented when absent from the approved source.
- Initial current Factor F baseline version for future provenance.
- New BOQ binding to the current Factor F pointer.
- Calculation reads by `boq.factor_reference_version_id` when present.
- Snapshot-only legacy behavior when `factor_reference_version_id` is null.
- Full-table validation: row count, duplicate threshold check, null check,
  positive numeric values, ordered `cost_million`, and dataset hash.
- Canonical dataset hash uses SHA-256 with the same `sha256:<64 hex>` display
  convention as Master Catalog publication.
- The current interpolation formula and four-decimal truncation remain
  unchanged unless a separate calculation-rule decision approves otherwise.
- The BOQ multiplier is the Thai source column `รวมในรูป Factor`, stored as
  `factor`. The Thai source column `Factor F` is stored as `factor_f` for
  reference/provenance and is not the main BOQ multiplier.
- Source/approval/effective-date metadata for published Factor F versions.
- Version-level source condition metadata for print/export text: advance
  payment, retention, loan interest, and VAT.
- Clear user-facing labels for legacy snapshot-only BOQs.

## 4. Explicitly out of scope

- Master Catalog item/price changes.
- Backfilling old BOQs with a guessed Factor F version.
- Auto-repricing old, submitted, approved, printed, or exported BOQs.
- Rewriting saved Factor F snapshots.
- Full spreadsheet import UI for repeated Factor F administration unless a
  later CR approves it.
- Changing VAT policy.

## 5. User behavior

During local implementation and rehearsal, users can continue using the
Production system because no Production object is changed. During Production
F1/F2 deployment, the work should be scheduled as a controlled additive
migration/deploy window; existing BOQ totals are not rewritten, and feature
visibility should remain compatible with the current workflow. During F3, only
the default Factor F version for newly created BOQs changes after the pointer
move. Existing BOQs remain unchanged, but users may see legacy/snapshot-only
labels or a fail-closed message for old BOQs whose saved Factor F snapshot is
incomplete.

After F3:

- Creating a new BOQ uses the newly current Factor F version.
- Opening an old BOQ preserves the old totals and shows it as
  `legacy snapshot-only` when no factor version is bound.
- If a user needs the same project with the new Factor F, they create a new
  estimate/revision from the old BOQ. The new BOQ binds the current price
  catalog and current Factor F version and recalculates totals.
- Draft BOQs do not change silently. Any recalculation to the latest Factor F
  must be an explicit user action with audit evidence.

## 6. Preconditions before F1

- [ ] ADR-005 is approved.
- [ ] This Factor F CR is approved for implementation/local rehearsal.
- [ ] The
      [Readiness and Security Addendum](./02-readiness-and-security-addendum.md)
      is accepted for F1.
- [ ] The [Implementation Plan](./03-implementation-plan.md) is accepted for
      F1/F2.
- [ ] Current `factor_reference` row count and checksum are recorded.
- [ ] BOQ Factor F snapshot completeness is audited and recorded.
- [ ] Migration/app changes have rollback/forward-fix instructions.
- [ ] Tests cover new version-bound BOQ behavior and legacy snapshot-only
      behavior.
- [ ] Print and Excel export no longer use the current live factor table as a
      fallback for legacy BOQs without valid snapshots.
- [ ] `save_boq_with_routes` and any later Master Catalog RPC replacement
      preserve `boq.factor_reference_version_id`.

## 7. Preconditions before F3

- [ ] F1 schema and app behavior are deployed and verified.
- [ ] F2 current baseline version is seeded and pointer verification passes.
- [x] The new Factor F source document/effective date is approved for planning.
      The current F3 candidate is the 26 June 2026 source table annex, and the
      owner confirmed source/effective date as 2026-06-26.
- [ ] Row-level diff from current baseline is reviewed.
- [ ] Full-table validation and dataset hash pass.
- [ ] Expected row count for the new source table is recorded and reconciled
      against the approved source document. The supplied image has 36 visible
      rows; this must be confirmed against the official source before publish.
- [ ] Owner explicitly approves publishing the named Factor F version.

## 8. Acceptance criteria

- New empty BOQs created after F2/default pointer setup have
  `factor_reference_version_id`.
- Legacy BOQs are not backfilled by assumption.
- Print/export for version-bound BOQs uses the bound Factor F version.
- Print/export for legacy BOQs uses valid saved snapshots or fails closed.
- Publishing a new Factor F version changes only new BOQ default behavior.
- Existing BOQ totals do not change merely because Factor F was published.
- Verification report records before/after factor checksums and pointer state.
- Database security review confirms RLS/grants/function boundaries follow the
  [Phase 4 Database and Security Contract](../master-catalog/17-phase4-database-security-contract.md)
  companion boundary.

Implementation actions are tracked in the
[Factor F Implementation Log](./05-implementation-log.md).

## 9. Approval record

| Gate | Role | Name | Decision | Timestamp | Evidence/reference |
|---|---|---|---|---|---|
| F0 approve ADR/CR | Owner | Owner | Approve F0 for Factor F F1/F2 foundation only. F3 publication requires separate approval after production baseline audit, row-level diff, dataset hash, and final owner review. | 2026-06-28T20:08+07:00 | ADR-005, CR, Readiness Addendum, Implementation Plan reviewed and accepted. Source/effective date 2026-06-26, reference กค 0433.2/ว 481 confirmed. Owner as data custodian. |
| F1 implement foundation | Owner |  | Not requested |  |  |
| F2 seed current baseline | Owner | Owner | Confirm `FACTOR F 2566_7.PDF` as current baseline source, approve version identity `2566.0.0`, and authorize local migration/rehearsal only. Production execution remains pending a separate approved window. | 2026-06-28T21:43+07:00 | Production MCP baseline audit: 37 rows, 0 duplicates, 0 invalid rows, hash `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61`; local PDF review and migration 013 verification passed. |
| F3 publish new Factor F | Owner |  | Not requested |  |  |
| Execution | Executor |  | Pending |  |  |
| Independent verification | Verifier |  | Pending |  |  |
