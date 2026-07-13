# ADR-003: Master Catalog Rollout Start and Version Numbering

**Status:** Accepted; Production baseline rollout implemented; version-intent,
reserved-number, and bounded annual-year amendments accepted 2026-07-13
**Date:** 2026-06-05
**Decision Makers:** Owner, Development Team
**Implementation status:** Production `2568.0.0`, singleton pointer, Phase 2
application, and Phase 1B hardening were applied/deployed and verified on
2026-06-21. The first proposed structured-code release `2568.1.0` remains
unpublished Phase 4 scope under ADR-004 and requires owner approval.

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
- Future Factor F changes are governed by
  [ADR-005](./ADR-005-versioned-factor-f-reference.md). Factor F remains
  separate from Master Catalog price versioning, but new BOQs should bind to a
  dedicated Factor F reference version after that foundation is deployed.

Before versioning is enabled, the project needs a stable and auditable catalog
version-numbering convention. The convention must be easy for Thai procurement
users to understand, compatible with the existing schema, and predictable for
future effective-year price books, supplements, and correction releases.

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
<effective_be_year>.<revision>.<patch>
```

where:

| Segment | Meaning | Example |
|---|---|---|
| `effective_be_year` | Thai Buddhist Era year that the owner designates as the catalog's effective usage year; it is not automatically the preparation, publication, or deployment year | `2568`, `2570` |
| `revision` | Approved catalog revision within that year | `0`, `1`, `2` |
| `patch` | Errata or correction release within the same year and revision | `0`, `1`, `2` |

The first production backfill links all current standard items and historical
BOQs to `2568.0.0`. The singleton `price_list_default_version` pointer makes
`2568.0.0` the active default after Phase 1A until a later approved catalog
version is promoted.

Future catalog versions may be prepared before their effective year. For
example, a price book prepared in BE 2569 but approved to start use in BE 2570
should be versioned as `2570.0.0`. It can exist as a draft before the effective
date, but new BOQs must not use it until the owner approves promotion through
the singleton default pointer.

Do not use a four-part primary version such as `2568.x.y.z` in the current
schema. International SemVer uses three numeric identifiers, and the existing
database schema already enforces `major.minor.patch`. If the project later
needs release metadata, store it in dedicated metadata fields or audit logs
instead of changing the primary sortable version key.

## Version Increment Rules

| Change type | New version | Reason |
|---|---|---|
| Initial Master Catalog baseline from the current 710-row production price list | `2568.0.0` | First approved catalog version for the current effective 2568 baseline |
| Catalog prepared in BE 2569 but approved to start use in BE 2570 | `2570.0.0` | The owner-designated effective usage year is 2570 |
| New annual official price book for the next effective year | `2569.0.0` or `2570.0.0` | The effective usage year changes according to owner approval |
| Approved mid-year supplement that changes prices, adds/removes standard items, or materially changes item definitions | `2568.1.0` | New catalog revision within the same year |
| Another approved supplement in the same year | `2568.2.0` | Next revision within the same year |
| Errata, typo fix, category correction, unit-label correction, or data-entry correction within the same approved revision | `2568.0.1` | Correction release, not a new official price basis |
| Documentation-only change, application-only change, or rollout procedure change | No catalog version bump | Catalog data did not change |
| Factor F reference change | No `price_list` catalog version bump | Factor F is a separate calculation reference governed by ADR-005; it requires its own version, change request, approval evidence, and full-table verification |

### Version planning and reserved numbers

The application must not infer `revision` merely because it is the most common
next number. Before a draft is created, the active admin records one business
intent:

1. `annual` — a new owner-designated effective usage year;
2. `revision` — newly approved prices, items, definitions, or policy within the
   current effective year; or
3. `patch` — a correction that restores the same approved official basis.

The owner-designated year is required for `annual` and must be from the year
after the current base through 10 years after that base, inclusive. For example,
a `2568.x.x` base permits `2569` through `2578`. This catches accidental or
unreviewed far-future values while retaining a practical planning horizon; a
need beyond that range requires an explicit ADR/business-rule amendment rather
than a UI bypass. The system derives the other segments from the complete version registry. Every created version number
is permanently reserved across `draft`, `active`, `archived`, and `abandoned`
states. A number is never deleted or reused to hide a cancelled attempt.

For the selected lane, the server chooses the next number after every reserved
number, not merely after the current pointer:

- annual: selected effective year plus the next unused revision and patch `0`;
- revision: current effective year plus the next revision and patch `0`; and
- patch: current effective year/revision plus the next patch.

Normally a new annual catalog is `{year}.0.0`. If `{year}.0.0` or another lower
revision was already reserved by an abandoned or historical attempt, the next
annual candidate may be `{year}.1.0`, `{year}.2.0`, and so on. Relative to a
base from an earlier effective year this remains an `annual` transition; the
nonzero middle segment records the reserved-number history and does not mean the
system guessed a mid-year policy change. A year-changing candidate with a
nonzero patch remains invalid.

The UI displays the allowed annual-year range, proposed number, and any earlier
reserved numbers before confirmation. The application and database both
recheck the annual-year range; the database also rechecks the current base,
transition shape, and next reserved sequence atomically enough to reject stale
or tampered plans.

If a correction changes a numeric price because the previously entered value was
wrong, classify it as a patch only when the correction restores the same
approved official price basis. If the change represents a newly approved price
or policy, classify it as a revision and increment the middle segment.

## Item Code Governance

`item_code` is a catalog business key, not a display-order mechanism. The
Master Catalog schema enforces uniqueness within a version through
`UNIQUE (version_id, item_code)`, and the governance rules are:

1. An active catalog version must not have `item_code` edited in place.
2. Do not reuse a retired `item_code` for a different item meaning, even in a
   later version.
3. If a new official standard item is added, assign a new `item_code` according
   to the approved numbering rule and release it through a new catalog version.
4. Future catalogs may adopt a structured code taxonomy, such as
   `CIC-PVC-001` for a "conduit in concrete / PVC / sequence 001" family, as
   long as the format is owner-approved, documented, and validated during import.
5. If an existing item is intentionally recoded from a legacy sequential code
   such as `ITEM-0683` to a structured code such as `CIC-PVC-001`, release a new
   catalog version and preserve the old-code to new-code mapping.
6. If an existing item is intentionally renumbered, release a new catalog
   version and record the old-code to new-code relationship in the change
   request, import preview, or audit log. Do not silently update historical
   rows.
7. If an `item_code` was entered incorrectly and the correction restores the
   same approved source document, treat it as a patch release after owner
   approval.
8. If item ordering changes only for presentation, do not encode that by
   renumbering `item_code`. Use deterministic sorting or a future explicit
   `display_order` field.
9. Physical row order in the database has no meaning. Print, export, and admin
   import previews must use explicit ordering rules.

Structured item codes should be designed as human-readable taxonomy, not as
hidden logic that the application must parse for pricing. For example:

```text
CIC-PVC-001
```

can be interpreted operationally as:

| Segment | Example | Meaning |
|---|---|---|
| Work context | `CIC` | Conduit in concrete |
| Material/family | `PVC` | PVC item family |
| Sequence | `001` | Stable sequence within that family |

The exact segment dictionary must be approved before the first structured-code
catalog is promoted. If the project needs to query by these segments later,
add explicit metadata columns such as `work_context`, `material_family`, or
`display_order` in a future migration rather than relying on ad hoc string
parsing of `item_code`.

Examples:

| Change | Version impact | Reason |
|---|---|---|
| Add a new PN supplement item after `2568.0.0` is active | `2568.1.0` | New approved catalog content |
| Add an item that was accidentally omitted from the same approved baseline | `2568.0.1` | Import/data correction to restore the approved source |
| Start a future catalog with structured codes such as `CIC-PVC-001` | New effective-year or revision version, such as `2570.0.0` or `2568.1.0` | New approved item-code scheme |
| Recode legacy `ITEM-0683` to structured `CIC-PVC-001` after active use | New version with mapping | Prevents historical ambiguity and supports audit |
| Correct a mistyped `item_code` before the draft is promoted | No bump | Draft is not active yet |
| Correct a mistyped `item_code` after the version is active | `2568.0.1` | Active catalog identity changed and must be auditable |
| Renumber items only to change printed order | No code change; use sort/display metadata | `item_code` is identity, not presentation order |
| Retire an item and introduce a replacement with different meaning | New `item_code`, usually `2568.1.0` | Prevents historical ambiguity |

## Rationale

### Procurement Readability

Using the owner-designated effective Thai Buddhist Era year as the first
segment makes the version recognizable to users who work with official Thai
price books. `2568.0.0` communicates that the catalog is the baseline in use for
the effective 2568 period without needing a separate lookup table or naming
convention.

### International Compatibility

The version string remains three numeric dot-separated identifiers. That shape
is compatible with common SemVer expectations for sorting, uniqueness, and
human review, while the first segment follows Calendar Versioning practice by
encoding the catalog's effective usage year.

### Auditability

Every BOQ stores `price_list_version_id`, and every standard item belongs to a
specific catalog version. That creates a stable audit trail:

- Historical BOQs stay linked to the version used at creation time.
- New BOQs use the active default pointer.
- Admins can explain whether a change was an effective-year baseline, a
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
- Item code changes become auditable catalog decisions instead of silent edits.
- Future structured item-code schemes can be introduced without changing the
  versioning model.
- Factor F remains outside Master Catalog price versioning. Under ADR-005, it
  receives its own versioned reference/pointer model, and historical BOQs are
  not backfilled with a guessed factor version.

### Negative

- `2568.0.0` is CalVer-first rather than pure SemVer, so engineers must not
  interpret `2568` as a software-breaking-change major version.
- A future requirement for four-part versions would need a schema migration.
- The team must classify corrections carefully: patch for official errata,
  revision for newly approved price policy.
- The team must maintain an explicit import/audit trail for item-code
  renumbering or replacement.
- Cancelled draft numbers remain visible as reserved gaps; the version register
  and operator procedure must explain why they were not reused.
- If structured codes become query dimensions, they may require future metadata
  columns instead of parsing `item_code` strings in application code.
- The effective year is a business decision, so it must be recorded in the
  change request or approval record instead of being inferred automatically from
  preparation or deployment dates.

## Operational Rules

1. Do not edit rows in an active catalog version directly after Phase 4 admin
   tooling exists. Create a draft clone, apply changes, verify, then promote it.
2. Record the owner-approved effective usage year before creating or promoting
   a new annual baseline version.
3. Do not change `boq.price_list_version_id` for historical BOQs after Phase 1B
   hardening.
4. Do not change or reuse active `item_code` values without a new catalog
   version and audit trail.
5. Do not introduce a new structured item-code scheme without an approved
   segment dictionary and import validation.
6. Select and record annual/revision/patch business intent before creating a
   draft; do not ask an admin to type raw version segments as the primary flow.
7. Treat all created version numbers as reserved. If a lower annual identifier
   was abandoned, use the next revision in the same owner-designated year rather
   than reusing the old number or changing the effective year.
8. Do not include `factor_reference` in `price_list_versions`. Treat Factor F as
   separate reference data with its own ADR-005 versioning/change process.
9. Do not promote a new default version without an audit log entry and owner
   approval.
10. If catalog data changes but the version number does not, stop the rollout or
   release process and correct the versioning decision before promotion.
11. Do not backfill historical BOQs with a Factor F version unless exact
   source/version evidence exists for those BOQs.

## References

- [ADR-002: Versioned Master Catalog With Singleton Default Pointer](./ADR-002-versioned-master-catalog.md)
- [ADR-004: Phase 4 Catalog Governance and Official Publication](./ADR-004-phase4-catalog-governance-and-official-publication.md)
- [ADR-005: Versioned Factor F Reference and Legacy Snapshot Policy](./ADR-005-versioned-factor-f-reference.md)
- [Master Catalog implementation plan](../../plans/master-catalog/02-implementation.md)
- [Master Catalog change request](../../plans/master-catalog/04-change-request.md)
- [Master Catalog verification report](../../plans/master-catalog/05-verification-report.md)
- [Semantic Versioning](https://semver.org/)
- [Calendar Versioning](https://calver.org/)
