# ADR-003: Master Catalog Rollout Start and Version Numbering

**Status:** Accepted for planning; production rollout still requires execution approval
**Date:** 2026-06-05
**Decision Makers:** Owner, Development Team
**Implementation status:** Documentation preflight refreshed from current
codebase and Supabase MCP evidence. Production DB migrations `009`-`011` have
not been applied.

---

## Context

The system is preparing to start the Master Catalog rollout described in
[ADR-002](./ADR-002-versioned-master-catalog.md). The current production
catalog state has been rechecked through Supabase MCP:

- `price_list` has 710 rows: the previous 682-row baseline plus PN6 28 rows
  (`ITEM-0683` through `ITEM-0710`).
- `factor_reference` has 37 rows and is excluded from price-list catalog
  versioning.
- The Factor F correction on `main` now uses `factor_reference.factor`
  ("รวมในรูป Factor"), validates saved snapshots, and fails closed when
  reference rows are unavailable.

Before versioning is enabled, the project needs a stable and auditable catalog
version-numbering convention. The convention must be easy for Thai procurement
users to understand, compatible with the existing schema, and predictable for
future annual price books, mid-year supplements, and correction releases.

The current migration schema stores catalog versions as:

```text
major.minor.patch
```

with `version_string` generated from the `major`, `minor`, and `patch` integer
columns in `price_list_versions`.

## Decision

Start the first Master Catalog version as:

```text
2568.0.0
```

Use a **CalVer-first, SemVer-shaped** convention:

```text
<thai_budget_year>.<revision>.<patch>
```

where:

| Segment | Meaning | Example |
|---|---|---|
| `thai_budget_year` | Thai Buddhist Era year of the official price catalog baseline, not the deployment date | `2568` |
| `revision` | Approved catalog revision within that year | `0`, `1`, `2` |
| `patch` | Errata or correction release within the same year and revision | `0`, `1`, `2` |

The first production backfill links all current standard items and historical
BOQs to `2568.0.0`. The singleton `price_list_default_version` pointer makes
`2568.0.0` the active default after Phase 1A until a later approved catalog
version is promoted.

Do not use a four-part primary version such as `2568.x.y.z` in the current
schema. International SemVer uses three numeric identifiers, and the existing
database schema already enforces `major.minor.patch`. If the project later
needs release metadata, store it in dedicated metadata fields or audit logs
instead of changing the primary sortable version key.

## Version Increment Rules

| Change type | New version | Reason |
|---|---|---|
| Initial Master Catalog baseline from the current 710-row production price list | `2568.0.0` | First approved catalog version for the 2568 baseline |
| New annual official price book | `2569.0.0` | The official catalog year changes |
| Approved mid-year supplement that changes prices, adds/removes standard items, or materially changes item definitions | `2568.1.0` | New catalog revision within the same year |
| Another approved supplement in the same year | `2568.2.0` | Next revision within the same year |
| Errata, typo fix, category correction, unit-label correction, or data-entry correction within the same approved revision | `2568.0.1` | Correction release, not a new official price basis |
| Documentation-only change, application-only change, or rollout procedure change | No catalog version bump | Catalog data did not change |
| Factor F reference change | No `price_list` catalog version bump | Factor F is a separate calculation reference and requires its own change request and full-table verification |

If a correction changes a numeric price because the previously entered value was
wrong, classify it as a patch only when the correction restores the same
approved official price basis. If the change represents a newly approved price
or policy, classify it as a revision and increment the middle segment.

## Rationale

### Procurement Readability

Using the Thai Buddhist Era year as the first segment makes the version
recognizable to users who work with official Thai price books. `2568.0.0`
communicates that the catalog belongs to the 2568 baseline without needing a
separate lookup table or naming convention.

### International Compatibility

The version string remains three numeric dot-separated identifiers. That shape
is compatible with common SemVer expectations for sorting, uniqueness, and
human review, while the first segment follows Calendar Versioning practice by
encoding the catalog year.

### Auditability

Every BOQ stores `price_list_version_id`, and every standard item belongs to a
specific catalog version. That creates a stable audit trail:

- Historical BOQs stay linked to the version used at creation time.
- New BOQs use the active default pointer.
- Admins can explain whether a change was an annual baseline, a mid-year
  revision, or a correction release.

### Controlled Rollout

Starting at `2568.0.0` matches the current migration drafts and preflight
assertions. Changing to a four-part version now would require schema and
migration changes before rollout, without adding enough value for the first
production release.

## Consequences

### Positive

- Version numbers are readable by both domain users and engineers.
- The convention works with the existing `price_list_versions` schema.
- Future annual catalog updates and supplements have clear bump rules.
- Historical BOQs remain stable even when the active default catalog changes.
- Factor F remains outside catalog versioning but is still protected by a
  separate full-table integrity gate.

### Negative

- `2568.0.0` is CalVer-first rather than pure SemVer, so engineers must not
  interpret `2568` as a software-breaking-change major version.
- A future requirement for four-part versions would need a schema migration.
- The team must classify corrections carefully: patch for official errata,
  revision for newly approved price policy.

## Operational Rules

1. Do not edit rows in an active catalog version directly after Phase 4 admin
   tooling exists. Create a draft clone, apply changes, verify, then promote it.
2. Do not change `boq.price_list_version_id` for historical BOQs after Phase 1B
   hardening.
3. Do not include `factor_reference` in `price_list_versions`. Treat Factor F as
   separate reference data with full-table integrity verification.
4. Do not promote a new default version without an audit log entry and owner
   approval.
5. If catalog data changes but the version number does not, stop the rollout or
   release process and correct the versioning decision before promotion.

## References

- [ADR-002: Versioned Master Catalog With Singleton Default Pointer](./ADR-002-versioned-master-catalog.md)
- [Master Catalog implementation plan](../../plans/master-catalog/02-implementation.md)
- [Master Catalog change request](../../plans/master-catalog/04-change-request.md)
- [Master Catalog verification report](../../plans/master-catalog/05-verification-report.md)
- [Semantic Versioning](https://semver.org/)
- [Calendar Versioning](https://calver.org/)
