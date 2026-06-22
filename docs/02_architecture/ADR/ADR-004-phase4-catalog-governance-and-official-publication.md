# ADR-004: Phase 4 Master Catalog Governance and Official Publication

**Status:** Proposed — owner approval required before implementation
**Date:** 2026-06-22
**Decision makers:** Owner, Development Team
**Related change request:** [Phase 4 Change Request](../../plans/master-catalog/09-phase4-change-request.md)

## Context

Production completed Master Catalog Phase 0 → 1A → 2 → 1B on 2026-06-21.
The current catalog has one active/default version, `2568.0.0`, containing 710
version-locked price rows. Read-only Supabase MCP verification on 2026-06-22
confirmed 710 distinct item codes, no missing required name/unit/cost values,
and no `unit_cost != material_cost + labor_cost` rows.

Phase 4 must add safe catalog administration without weakening historical BOQ
correctness. The owner also requires published data to be usable immediately as
an official reference through system-generated Excel and PDF exports.

The candidate workbook contains a useful `AAA-TTT-###` taxonomy, but it has 708
rows rather than Production's 710. Reconciliation found 42 price differences,
18 workbook-only rows, 20 Production-only rows, and 16 HDPE Crossing rows whose
GIP code/K mapping conflicts with their descriptions. Therefore the workbook
cannot be promoted as a replacement price source.

## Decision

### 1. Official source of truth

The immutable published database catalog is the system of record. A draft is
not official. After publication, Excel and PDF generated from the selected
database version are official reference copies when their version stamp,
item count, and dataset hash match the published version.

The Excel verification sheet can independently reconstruct the canonical
dataset hash. PDF generation rechecks the selected database version on the
server and prints the verified count/hash; the PDF is not claimed to contain
enough canonical fields to reconstruct that hash independently.

The physical approval/source workbook remains supporting evidence and is filed
outside the application. Phase 4 does not upload raw source files to Supabase
Storage.

### 2. Price and first-rollout precedence

Production `2568.0.0` is authoritative for current item name, unit, material
cost, labor cost, and unit cost. The first structured-code candidate is
`2568.1.0`, cloned from all 710 Production rows. The mapping workbook supplies
candidate codes and classifications only. It cannot change item names, units,
or any price field in this rollout.

Any later price change requires explicit price authority, reviewed price diff,
approval reference, and a new catalog version.

### 3. Stable identity and code governance

Each logical item receives an immutable UUID identity. Business codes are held
in an append-only registry and point to that identity. Legacy `ITEM-####` and
approved canonical `AAA-TTT-###` codes may identify the same item across
versions. A retired code is never reused or reassigned.

Two identities that coexist in a published baseline are never merged or
rewritten. When one row is an erroneous duplicate, a later version retires that
identity while retaining both historical identities, codes, audit, and BOQ
references. This avoids ambiguous lineage and preserves the published record.

Item history follows the UUID identity, not only the current code. Published
rows are never rewritten to repair lineage.

### 4. Versioned display category and code taxonomy

Display categories and `AAA/TTT` taxonomy are separate versioned concepts.
Pricing logic does not parse business-code segments. A structured-code version
cannot publish unless each active row has an approved code group.

K-formula mapping remains outside Phase 4 Core until its ownership, approval,
and versioning contract is separately approved. Phase 4 must neither infer nor
publish K mappings from the candidate workbook.

### 5. One controlled change path

Excel Full import, Excel Supplement import, manual add, edit, retire, recode,
publish, and pointer restore use the same controls:

- draft-only mutation;
- active-admin authorization;
- nonblank reason;
- request idempotency;
- expected lock version;
- complete old/new row snapshots;
- actor and immutable display-name snapshot;
- approval evidence before publication.

There is no unaudited manual-edit backdoor.

### 6. Import trust boundary

The browser reads and normalizes the approved workbook profile locally. Raw
files are not uploaded. The server treats the normalized payload as untrusted,
revalidates every field and cross-row invariant, recomputes hashes/diffs, and
applies changes only through database functions.

The first parser profile is fixed and auto-detected. Phase 4 does not build a
generic spreadsheet-mapping product.

### 7. Publication transaction

Publication is one short database transaction that:

1. authenticates and authorizes the active admin;
2. obtains a transaction-scoped publish lock;
3. verifies request ID, expected lock version, and draft status;
4. rejects a stale draft when `based_on_version_id` differs from the current
   singleton pointer;
5. validates counts, identity, codes, categories, code groups, costs, and
   approval evidence;
6. computes canonical dataset hash and item count from database rows;
7. marks the version published/active;
8. moves the singleton pointer;
9. synchronizes legacy `is_default` flags while that column remains;
10. appends the publish change set.

Phase 4 Core does not rebase stale drafts. The admin creates a new draft from
Current and reapplies still-approved changes through new audited change sets.

External calls, workbook parsing, PDF generation, and Excel generation do not
run inside this transaction.

### 8. Authorization and database boundary

RLS remains the primary database authorization layer under
[ADR-001](./ADR-001-supabase-rls-authorization.md) and provides defense in depth
behind the server identity/profile checks required for high-impact catalog
operations.
All new `public` tables enable RLS and receive explicit least-privilege grants;
Phase 4 does not rely on Supabase's historical automatic Data API grants.

Catalog mutation functions are kept in an unexposed private schema. Any public
wrapper has a fixed empty `search_path`, fully qualified objects, internal
active-admin checks, exact grants, and revoked `PUBLIC`/`anon` execution.
Service-role or secret keys never enter browser code.

The application reuses the existing cookie-aware server client in
`lib/supabase/server.ts`. Server authorization uses authenticated server
identity/profile checks plus RLS; client session state is not an authorization
boundary.

### 9. Application and export boundary

Server Components perform catalog reads. Server Actions perform internal UI
mutations. A Node.js Route Handler handles Excel export when streaming/binary
response behavior is needed. Browser-only Excel parsing is dynamically loaded
only when the admin starts import.

Generated Supabase database types and a stable `ActionResult`/error-code
contract are required before Phase 4 UI implementation.

### 10. Deliberate simplifications

Phase 4 Core does not add Supabase Storage, a paid Supabase branch, background
jobs, generic mapping UI, server pagination at the current 710-row scale, BOQ
rebase, unrelated CI redesign, or destructive one-click undo.

These omissions are intentional scope control, not missing architecture.

## Consequences

### Positive

- Official catalogs and Excel verification data are independently
  hash-verifiable; PDF is server-verified and stamped with the matching
  published count/hash.
- Historical BOQs and prior catalog versions remain stable.
- Small corrections no longer require uploading a whole workbook.
- Item history survives recoding.
- Workbook taxonomy can be adopted without silently repricing Production.
- Security controls are enforced both in the server path and database.
- The design remains small enough for the current user/data scale.

### Negative

- The first release requires a complete 710-row reconciliation and owner code
  decisions before schema backfill.
- Publication is operationally stricter and requires approval evidence.
- Compatibility columns, including `is_default`, must be synchronized until a
  later removal migration is approved.
- Official export reproducibility requires a precise canonicalization contract
  and golden tests.
- Full-row audit snapshots increase retained database data with each real
  catalog change; this is accepted at the current scale and must be monitored
  before introducing high-volume automation.
- The stricter draft/reason/diff/approval/publish workflow requires admin
  training and disciplined evidence entry compared with direct edits.
- A later K-formula feature needs its own governance decision.

## Alternatives rejected

| Alternative | Reason rejected |
|---|---|
| Treat the candidate workbook as the new price authority | It differs from Production in rows and prices and contains taxonomy conflicts |
| Store only `item_code` history | Recoding would break logical item history |
| Upload source workbooks to Supabase Storage | The owner files originals physically; Storage adds controls with no current benefit |
| Edit the active catalog directly | It would invalidate official exports and historical audit |
| Use application-only authorization | RLS/database functions are required defense in depth |
| Parse `AAA/TTT` at runtime for pricing | Codes are business identifiers, not executable pricing logic |
| Add a workflow engine or multi-stage approval subsystem now | One authorized publisher plus real approval evidence meets the present requirement |

## Implementation conditions

Implementation may start only after:

1. this ADR and the Phase 4 Change Request are owner-approved;
2. the code dictionary and all row-level reconciliation decisions are approved;
3. local reset/rehearsal, logical backup, and abort procedures are verified;
4. database/security, threat, parser/hash, and official-export contracts and
   verification templates are accepted;
5. no unresolved security or data-integrity blocker remains.

Production migration, feature enablement, and catalog publication each require
separate explicit owner approval. Approval of this ADR alone does not authorize
Production execution.

## References

- [ADR-002: Versioned Master Catalog](./ADR-002-versioned-master-catalog.md)
- [ADR-003: Rollout and Version Numbering](./ADR-003-master-catalog-rollout-and-version-numbering.md)
- [Phase 4 architecture plan](../../plans/master-catalog/08-phase4-architecture-ci-plan.md)
- [Phase 4 reconciliation report](../../plans/master-catalog/11-phase4-reconciliation-report.md)
- [Parser and canonical hash specification](../../plans/master-catalog/14-phase4-parser-and-canonical-hash-spec.md)
- [Database and security contract](../../plans/master-catalog/17-phase4-database-security-contract.md)
- [Lean threat model](../../plans/master-catalog/18-phase4-threat-model.md)
- [Decision register](../../plans/master-catalog/19-phase4-decision-register.md)
- [Official export specification](../../plans/master-catalog/20-phase4-official-export-spec.md)
- [Architecture review disposition](../../plans/master-catalog/21-phase4-architecture-review-disposition.md)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
