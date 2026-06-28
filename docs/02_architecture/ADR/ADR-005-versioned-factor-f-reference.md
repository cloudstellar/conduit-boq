# ADR-005: Versioned Factor F Reference and Legacy Snapshot Policy

**Status:** Accepted — F0 approved on 2026-06-28 for F1/F2 foundation; F3 requires separate approval
**Date:** 2026-06-28
**Decision makers:** Owner, Development Team
**Related change request:** [Versioned Factor F Change Request](../../plans/factor-f/01-versioned-factor-f-change-request.md)

## Context

The BOQ application already stores Factor F calculation snapshots on `boq`
(`factor_f`, totals, raw/interpolation values) and the calculation code uses
`factor_reference.factor` as the BOQ multiplier. This protects printed/exported
BOQs from some future reference-table changes.

However, `factor_reference` is currently a single live reference table. If an
admin updates that table in place, new calculations can change while the system
cannot clearly explain which approved Factor F table was used by each BOQ.
Backfilling old BOQs with a current factor version would also create false
provenance when the original source table is unknown.

The owner now expects Factor F to change before the full Master Catalog Phase 4
admin workflow is complete. The architecture therefore needs a small, explicit
Factor F track that can run independently from Master Catalog price governance.

## Decision

Factor F is separate reference data. It is not part of `price_list_versions`
and must not be versioned by the Master Catalog version number.

Factor F version strings use the same three-part `major.minor.patch` shape as
the Master Catalog convention for readability and sortable review. The first
segment should be the owner-approved effective BE year unless the Factor F
source authority requires a different documented naming convention. Do not use
a fourth version segment without a separate schema decision.

Create a dedicated Factor F version model:

- `factor_reference_versions`: version metadata, status, source/effective
  date, approval evidence, row count, canonical dataset hash, and source
  condition parameters used for print/export text such as advance payment,
  retention, loan interest, and VAT.
- `factor_reference_rows`: row data scoped by `version_id`, preserving the
  current calculation contract: `cost_million`, `factor`, `vat_percent`,
  `factor_f`, `factor_f_rain_1`, and `factor_f_rain_2`. Legacy/source-derived
  component columns such as `operation_percent`, `interest_percent`,
  `profit_percent`, and `total_expense_percent` may be retained as nullable
  metadata when the approved source does not provide row-level values. Add
  `display_order` only for deterministic review/export; do not use it for
  calculation.
- `factor_reference_default_version`: singleton pointer table, matching the
  proven `price_list_default_version` pattern rather than a mutable
  `is_default` flag.
- nullable `boq.factor_reference_version_id`

New empty BOQs created after the Factor F default pointer is seeded must bind
to the current `factor_reference_default_version` at creation time. F1 may be
deployed as a pointer-optional foundation, but F1 and F2 should run in the same
approved window when users need to create BOQs with line items immediately
after rollout. Print/export/edit calculation for version-bound BOQs must use
the BOQ's bound factor version, not an unscoped live table.

Existing BOQs must not be backfilled with `factor_reference_version_id` unless
there is row-level evidence that identifies the exact Factor F source used by
that BOQ. In the normal rollout, legacy BOQs remain `snapshot-only`:

- saved Factor F snapshot values remain the authority;
- old BOQs are not auto-repriced;
- missing or invalid snapshots fail closed instead of silently using the
  current Factor F table;
- using a new Factor F table for old project data requires creating a new BOQ
  copy/revision with explicit user action.

Published Factor F rows are immutable. A Factor F change creates a draft
version, records source/approval/checksum evidence, validates the full table,
publishes the version, and moves the singleton default pointer. Dataset hashes
use `sha256:` plus 64 lowercase hexadecimal characters over a canonical JSON
payload sorted by `cost_million` and containing only the approved reference
columns. Publication does not rewrite historical BOQs.

Draft BOQs also do not auto-update when a new Factor F version is published.
The application may offer an explicit action such as "create a new estimate
with latest Factor F" or "recalculate this draft with current Factor F", but the
action must be audited and must change the bound factor version deliberately.

## Immediate Factor F Change Sequence

Because the owner wants to adjust Factor F now, do not update
`factor_reference` in place. Use this sequence:

| Step | Purpose | Production effect |
|---|---|---|
| F0 | Approve this ADR, source document, effective date, and owner evidence for the Factor F change | No data change |
| F1 | Deploy additive Factor F version foundation and compatible app changes | New BOQs can bind a factor version; old BOQs stay snapshot-only |
| F2 | Seed the audited current Factor F table as the initial published factor version for future BOQs only | No legacy BOQ backfill |
| F3 | Create and publish the new Factor F version, then move the factor default pointer | New BOQs use the new Factor F version |
| F4 | Add or refine duplicate/reprice UX for old project data | Users create a new estimate instead of mutating history |

The first F4 UX path is deliberately narrow: from an edit page, users can
create a new BOQ copy bound to a selected active Factor F version. The default
choice is the current pointer, but users may choose the old published baseline
when the work must continue under the old-factor policy. The source BOQ remains
unchanged, the new copy resets Factor F snapshot fields, and the user must
review and save the new BOQ before it becomes the durable calculation record.
This is not a blanket backfill.

F1 and F2 should happen before the live Factor F values are changed. F3 is the
actual Factor F policy change.

If the Factor F policy change is urgent, F3 may run before Master Catalog
Phase 4 publication as a separate approved window after F1/F2 are verified. If
there is no urgency, delaying F3 until after the Phase 4 application work can
reduce repeated `save_boq_with_routes` coordination. In either case, F3 must
not share a silent combined window with Master Catalog publication.

## Consequences

### Positive

- Historical BOQs remain explainable and stable.
- Factor F can change without forcing a Master Catalog price version bump.
- New BOQs can cite the exact Factor F reference version used.
- Old BOQs avoid false provenance caused by current-version backfill.
- Duplicate/reprice becomes an explicit user action rather than a hidden data
  rewrite.

### Negative

- One more version/pointer model must be implemented and tested.
- Legacy BOQs without complete snapshots may remain limited until a new BOQ is
  created from them.
- Users need clear labels explaining "snapshot-only" versus version-bound BOQs.
- A later full Factor F admin UI is still needed if frequent changes are
  expected.

## Operational Rules

1. Do not update published Factor F rows in place.
2. Do not include Factor F rows in `price_list_versions`.
3. Do not backfill old BOQs with a factor version by assumption.
4. Do not auto-reprice submitted, approved, printed, or exported BOQs.
5. Do not let a BOQ mix one price catalog version with an unbound live Factor F
   table after F1.
6. A Factor F correction requires owner approval, a source reference, full-table
   validation, dataset hash, and a publish/pointer audit entry.
7. If an old BOQ needs the latest Factor F, create a new estimate/revision and
   keep the original unchanged.
8. The existing interpolation formula remains
   `D - ((D - E) * (A - B) / (C - B))` with Factor F truncated to four decimal
   places unless a separately approved calculation-rule ADR changes it.
9. F1 must update edit, print, and Excel export paths together so legacy BOQs
   without valid snapshots fail closed instead of falling back to the latest
   live reference table.
10. The BOQ multiplier source is the Thai column `รวมในรูป Factor`, stored as
    `factor`. The Thai column `Factor F` is stored as `factor_f` for
    provenance/reference and is not the main multiplier unless a separate
    calculation-rule decision changes that behavior.

## References

- [ADR-002: Versioned Master Catalog With Singleton Default Pointer](./ADR-002-versioned-master-catalog.md)
- [ADR-003: Master Catalog Rollout and Version Numbering](./ADR-003-master-catalog-rollout-and-version-numbering.md)
- [ADR-004: Phase 4 Master Catalog Governance and Official Publication](./ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Versioned Factor F Change Request](../../plans/factor-f/01-versioned-factor-f-change-request.md)
- [26 June 2026 Factor F Source Table Candidate](../../plans/factor-f/04-source-table-2569-06-26.md)
- [Master Catalog Phase 4 Change Request](../../plans/master-catalog/09-phase4-change-request.md)
