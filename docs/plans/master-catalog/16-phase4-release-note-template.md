# Master Catalog Version Release Note

**Status:** Template
**Catalog version:** `________________`
**Based on version:** `________________`
**Effective date:** `________________`
**Published at (ICT):** `________________`
**Published by (authenticated actor snapshot):** `________________`

## Approval and source

| Field | Value |
|---|---|
| Approval reference |  |
| Approval document date |  |
| Business approver/authority, if separately required |  |
| Physical archive reference |  |
| Change Request |  |
| Reconciliation fingerprint |  |
| Source filename/SHA-256, if imported |  |
| Parser profile/version, if imported |  |
| Full-import retirement total, if applicable |  |
| Mass-retirement approval reference, if applicable |  |

## Official dataset

| Metric | Value |
|---|---:|
| Published item count |  |
| Active items |  |
| Retired items in this release |  |
| Dataset hash | `sha256:________________` |
| Official Excel filename/reference |  |
| Official Excel embedded dataset hash | `sha256:________________` |
| Official Excel binary file SHA-256 | `________________` |
| Official PDF filename/reference |  |
| Official PDF printed dataset hash | `sha256:________________` |
| Official PDF binary file SHA-256 | `________________` |

## Change summary

| Change type | Count | Summary/reference |
|---|---:|---|
| Added |  |  |
| Updated description/unit/category |  |  |
| Recoded |  |  |
| Retired |  |  |
| Reactivated |  |  |
| Withdrawn before first publication |  |  |
| Placement/order rows changed, if P-18 applies |  |  |
| Material price changed |  |  |
| Labor price changed |  |  |
| Unit price changed |  |  |

## Important decisions

- `____________________________________________________________`
- `____________________________________________________________`

## Known exclusions or deferred items

- `____________________________________________________________`
- `____________________________________________________________`

## Compatibility statement

- Historical BOQs remain linked to their original catalog version: `Yes / No`
- Previous published version remains readable/exportable: `Yes / No`
- Factor F reference changed by this release: `No` unless separately approved
- K-formula mapping included: `No` for Phase 4 Core
- Existing BOQ regression suite passed: `Yes / No`
- WP-6.6 capability matrix passed for every visible release action: `Yes / No`
- P-18 placement review current or Add/Supplement hidden: `Yes / No / N/A`
- P-19 active-only official PDF policy implemented and verified, or Retirement
  hidden: `Yes / No / N/A`

## P-19 export summary

Complete this section for every release; use zero for an all-active version.

| Field | Value |
|---|---|
| Complete canonical row count |  |
| Active rows displayed in official PDF |  |
| Inactive rows excluded from official PDF |  |
| Draft PDF visibly marks inactive rows | `Yes / No / N/A` |
| Excel includes active and inactive rows with status | `Yes / No` |
| Canonical SHA-256 scope | `Complete version including inactive rows` |
| Official PDF binary SHA-256 |  |
| P-19 policy | `official-pdf-active-only-draft-pdf-mark-inactive` |

## Rollback/current-pointer information

| Field | Value |
|---|---|
| Previous current version |  |
| New current version |  |
| Pointer verification timestamp |  |
| Audited restore target if needed |  |

## Verification and sign-off

| Role | Name | Decision | Timestamp | Reference |
|---|---|---|---|---|
| Catalog owner |  | Pending |  |  |
| Price authority |  | Pending |  |  |
| Executor |  | Pending |  |  |
| Verifier |  | Pending |  |  |

This release note is valid only when its version, complete item count, and
complete-version dataset hash match the published database version and Excel,
and the official PDF active/excluded counts plus binary hash match its recorded
P-19 presentation projection.

Dataset SHA-256 proves catalog-data equivalence. Each binary SHA-256 proves an
exact filed file copy and is calculated after that final file exists, following
the [Official Export Specification](./20-phase4-official-export-spec.md).
