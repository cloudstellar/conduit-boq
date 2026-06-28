# Change Request: Versioned Factor F Reference and Immediate Factor F Update

**Status:** Draft for owner review — no Factor F data change authorized
**Requested date:** 2026-06-28
**Change type:** Additive Factor F reference versioning, compatible BOQ
calculation behavior, and controlled Factor F publication
**Related ADR:** [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md)
**Readiness addendum:** [Factor F Track Readiness and Security Addendum](./02-readiness-and-security-addendum.md)
**Implementation plan:** [Factor F Versioning Implementation Plan](./03-implementation-plan.md)

## 1. Decision requested

Approve a separate Factor F change track before changing live Factor F values.
This approval is independent from Master Catalog Phase 4 price/catalog
publication.

This CR can be approved at different depths. F1/F2 foundation work can start
after the owner approves the policy and current-baseline verification approach.
F3 publication cannot start until the new Factor F table, effective date,
source reference, expected row count, formula/VAT decisions, and data custodian
are recorded.

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

## 2. Recommended sequence for changing Factor F now

| Step | Purpose | Production effect |
|---|---|---|
| F0 — Approval and freeze | Approve ADR-005, this CR, source document, effective date, and validation method | No data change |
| F1 — Version foundation | Add `factor_reference_versions`, `factor_reference_rows`, `factor_reference_default_version`, and nullable `boq.factor_reference_version_id`; update app reads to use bound version when present | Existing BOQs remain compatible; new BOQs can bind factor version |
| F2 — Current baseline seed | Copy the audited current `factor_reference` table into the initial published factor version and point the singleton default there | No old BOQ backfill |
| F3 — New Factor F publication | Create a new draft factor version from the baseline, apply approved row changes, validate full-table checksum, publish, and move the pointer | New BOQs use new Factor F |
| F4 — Duplicate/reprice UX | Offer explicit "create new estimate with latest Factor F" behavior for old project data | Old BOQs remain unchanged |

Do F1 and F2 before changing any live Factor F values. F3 is the actual Factor F
change.

F3 can be scheduled before or after Master Catalog Phase 4 depending on business
urgency. If the new Factor F is needed now, run F3 in its own approved window
after F1/F2 verification. If it can wait, run Master Catalog Phase 4 application
work first and publish the new Factor F afterward to reduce repeated RPC
coordination. Do not silently combine Factor F publication with Master Catalog
publication.

The current baseline row count is not a planning assumption. It must be
recorded from the Production preflight query before F2; if the result differs
from the expected current table, stop and reconcile before seeding.

## 3. In scope

- Additive Factor F version schema and singleton pointer.
- `factor_reference_rows` preserves the current `factor_reference` numeric
  columns: `cost_million`, `operation_percent`, `interest_percent`,
  `profit_percent`, `total_expense_percent`, `factor`, `vat_percent`,
  `factor_f`, `factor_f_rain_1`, and `factor_f_rain_2`.
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
- Source/approval/effective-date metadata for published Factor F versions.
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
- [ ] The new Factor F source document/effective date is approved.
- [ ] Row-level diff from current baseline is reviewed.
- [ ] Full-table validation and dataset hash pass.
- [ ] Expected row count for the new source table is recorded and reconciled
      against the approved source document.
- [ ] Owner explicitly approves publishing the named Factor F version.

## 8. Acceptance criteria

- New BOQs created after F1 have `factor_reference_version_id`.
- Legacy BOQs are not backfilled by assumption.
- Print/export for version-bound BOQs uses the bound Factor F version.
- Print/export for legacy BOQs uses valid saved snapshots or fails closed.
- Publishing a new Factor F version changes only new BOQ default behavior.
- Existing BOQ totals do not change merely because Factor F was published.
- Verification report records before/after factor checksums and pointer state.
- Database security review confirms RLS/grants/function boundaries follow the
  [Phase 4 Database and Security Contract](../master-catalog/17-phase4-database-security-contract.md)
  companion boundary.

## 9. Approval record

| Gate | Role | Name | Decision | Timestamp | Evidence/reference |
|---|---|---|---|---|---|
| F0 approve ADR/CR | Owner |  | Pending |  |  |
| F1 implement foundation | Owner |  | Not requested |  |  |
| F2 seed current baseline | Owner |  | Not requested |  |  |
| F3 publish new Factor F | Owner |  | Not requested |  |  |
| Execution | Executor |  | Pending |  |  |
| Independent verification | Verifier |  | Pending |  |  |
