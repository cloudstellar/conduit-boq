# Phase 4 Parser, Payload, Error, and Canonical Hash Specification

**Status:** Owner-approved implementation contract for implementation/local
rehearsal; Production import/publication remains separately gated
**Prepared:** 2026-06-22
**Purpose:** Make import, publish, Excel, and PDF verification deterministic

**Portability note:** P-20 was approved on 2026-07-11. Legacy baseline stable
identities initialize directly from the immutable Production-derived
`price_list.id`, and `identity_id` remains in the canonical lineage hash.
Clean-reset/cross-environment equality is not accepted until WP-6.5C proves the
mapping and resulting hash across the approved independent rebuild scope.

**WP-6.6 completeness amendment:** 2026-07-12 — server validation must return
the complete authoritative diff/omission result and support real new-row price
authority evidence. Client diagnostics remain advisory. See
[Audit #29](./29-phase4-owner-dev-completeness-audit.md).

**P-41 authority-key/read-only-preview amendment:** 2026-07-19 —
`categoryCode` is the key of the versioned authority dictionary and may be the
full official category label, not a short display prefix. Its bounded payload
limit is 500 characters; Local preflight must prove the longest live key fits
that contract (current maximum 89). When Full validation detects retirements
while retirement capability is disabled, the server still returns the complete
read-only diff/omission preview without persisting an import/change set or
exposing Apply. Validation and mutation remain separate operations.

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation for implementation/local rehearsal. This approval accepts the
deterministic parser profile, file/row/payload limits, browser-as-convenience
and server-as-authority boundary, stable `CatalogActionResult`/error-code
contract, K-field exclusion, decimal-string money handling, shared canonical
hash contract, and golden/cross-runtime tests. It does not authorize Production
import, publication, global Next.js body-limit changes, generic column mapping,
additional parser profiles, or any price/name/unit change outside approved
gates. Before Production publication, the implementation must reproduce the
golden hash, pass malicious/Unicode/money/payload/security tests, independently
verify the filed source workbook SHA-256 when an import contributes to the
version, and prove Excel/PDF count/hash controls.

## 1. Boundaries

- Raw `.xlsx` is opened only in the admin's browser.
- Raw workbook bytes are not sent to the application server or Supabase.
- Browser parsing is convenience, not trust.
- The server validates the normalized payload from first principles.
- The database version, not the workbook, becomes authoritative after publish.
- K-formula sheets/fields are excluded from Phase 4 Core.

## 2. File and payload limits

| Limit | Value | Result when exceeded |
|---|---:|---|
| Raw workbook size | 20 MB | `IMPORT_FILE_TOO_LARGE` before parsing |
| Parsed item rows | 1,500 | `IMPORT_ROW_LIMIT_EXCEEDED` |
| Normalized request body | 750 KB UTF-8 | `IMPORT_PAYLOAD_TOO_LARGE` |
| Cell text after trim | Field-specific; max 500 chars for item name | Field validation error |

Next.js 16.2.9 defaults Server Action request bodies to 1 MB. Do not increase
`experimental.serverActions.bodySizeLimit` for Phase 4. The application cap is
intentionally lower at 750 KB and must be checked before submission and again
on the server. The current 710-row normalized payload is approximately 299 KB.

If future normalized payloads exceed the application cap, design a reviewed
chunked/staging API. Do not silently raise the global limit.

## 3. Parser profile location and interface

Store profiles under:

```text
lib/master-catalog/import/parser-profiles/
  index.ts
  nt-item-master-2568-v1.ts
```

Required interface:

```ts
export interface CatalogParserProfile {
  id: string
  version: string
  displayName: string
  acceptedExtensions: readonly ['.xlsx']
  requiredSheet: string
  headerRow: number
  firstDataRow: number
  maxRows: number
  requiredHeaders: Readonly<Record<CanonicalImportField, string>>
  optionalHeaders: Readonly<Partial<Record<CanonicalImportField, string>>>
  ignoredHeaders: readonly string[]
  detect: (workbookInfo: WorkbookInfo) => ProfileDetection
  normalizeRow: (row: UnknownWorkbookRow, context: ParseContext) =>
    NormalizedCatalogRowCandidate
}

export interface ProfileDetection {
  matched: boolean
  confidence: 'exact' | 'none'
  errors: ParserDiagnostic[]
}
```

The first profile is:

```text
id: nt-item-master-2568
version: 1
required sheet: 01_Item_Master_Final
header row: 1
first data row: 2
```

Required source headers:

- `item_code`
- `AAA`
- `AAA_name_th`
- `TTT`
- `TTT_name_th`
- `description_th`
- `unit`
- `material_cost`
- `labor_cost`
- `total_cost`
- `source_sheet`
- `source_row`

`item_id` is read only for source diagnostics and is never identity or a join
key. `k_formula_id`, `k_formula_name_th`, `is_k_exempt`, `k_mapping_method`,
`k_mapping_basis`, and `k_mapping_note` are explicitly ignored and must not
appear in the normalized server payload.

## 4. Auto-detection

Detection is deterministic:

1. File extension must be `.xlsx` (case-insensitive).
2. Required sheet name must match exactly after trimming.
3. All required headers must appear exactly once on row 1.
4. No duplicate header is allowed.
5. A visible candidate data row must exist at row 2 or later.
6. No fallback profile or user column mapper is offered in v1.

Failure returns `IMPORT_PROFILE_NOT_RECOGNIZED` with missing/duplicate sheet or
header diagnostics. The UI never guesses a near profile.

## 5. Normalized payload

```ts
export interface CatalogImportPayloadV1 {
  schemaVersion: 'catalog-import-payload/1'
  parserProfileId: 'nt-item-master-2568'
  parserProfileVersion: '1'
  mode: 'full' | 'supplement'
  versionId: string
  expectedLockVersion: number
  requestId: string
  reason: string
  source: {
    filename: string
    sizeBytes: number
    sha256: string
    physicalArchiveReference: string
  }
  priceAuthorityReference: string | null
  retirementApprovalReference: string | null
  retirementConfirmedCount: number | null
  rows: NormalizedCatalogRowCandidate[]
}

export interface CatalogImportApplyPayloadV1 extends CatalogImportPayloadV1 {
  validatedImportId: string
  applyRequestId: string
}

export interface NormalizedCatalogRowCandidate {
  sourceRow: number
  sourceReference: string
  legacyItemCode: string | null
  canonicalCode: string
  workContextCode: string
  workContextNameTh: string
  itemTypeCode: string
  itemTypeNameTh: string
  itemName: string
  unit: string
  materialCost: string
  laborCost: string
  unitCost: string
  categoryCode: string
  identityOutcome: 'retain' | 'recode' | 'candidate_add' | 'retire'
  priceAuthorityReference: string | null
}
```

`priceAuthorityReference` is a bounded batch default for approved new rows.
`NormalizedCatalogRowCandidate.priceAuthorityReference` is an explicit override
only when a row has different evidence. Effective authority is the row override
or batch default; a `candidate_add` with neither is rejected. The server and DB
store the effective reference in the validated/audited outcome rather than
trusting a browser-only lookup map.

`CatalogImportPayloadV1.requestId` identifies the server-validation request.
`CatalogImportApplyPayloadV1.applyRequestId` identifies the later mutation
request. Apply resubmits the normalized rows and source metadata instead of
loading raw workbook bytes or reading a hidden staging table; the server
recomputes the normalized payload hash and compares it with the previously
validated `catalog_imports.normalized_payload_hash` before it mutates the
draft.

Rows are untrusted source observations plus requested outcomes, not final
business authority. Omitted-row retirements in Full mode are computed by the
server diff and are not inferred merely from a missing row in the client
payload. Client-supplied identity outcomes, price authority references, and
retirement confirmations are accepted only when they match the approved
reconciliation, code registry, draft state, and server-computed counts.

`categoryCode` identifies an exact row in the versioned category dictionary.
It is not assumed to be an abbreviated machine code: an approved dictionary
may use the complete official Thai label as its stable key. The parser/server
therefore enforce the shared 500-character bound and exact dictionary match;
the P-38 preflight compares the longest live key with this same constant so a
dictionary/application contract drift fails before Owner UAT.

Money fields are decimal strings, never JavaScript floating-point numbers.
Accepted syntax is `^(0|[1-9][0-9]*)\.[0-9]{2}$`. Negative, exponent, comma,
currency symbol, formula cell, Boolean, error, or date values are rejected.

## 6. Browser validation

The browser reports fast diagnostics for:

- file/profile/row/payload limits;
- blank required cells;
- duplicate candidate codes;
- invalid code and decimal formats;
- formula/error cells in required fields;
- material + labor != unit cost;
- excluded K columns being selected for payload;
- source SHA-256 calculation failure.

Browser success means “ready for server validation,” not “approved.”

The browser-computed source size/SHA-256 are supporting provenance metadata.
Because raw bytes do not reach the server, server validation can confirm only
their schema/format, not whether they describe the filed workbook. An
independent verifier must recompute the filed source SHA-256 before publication
when an import contributes to the version.

### 6.1 Preview and persisted status

- File selection, Web Crypto hashing, and client diff progress are transient
  UI states; they do not create `catalog_imports` rows.
- `previewCatalogImportAction` performs server validation. It records
  `validated` on success or `rejected` with bounded diagnostics on failure. A
  successful result includes bounded totals and the complete paged/expandable
  add/update/recode/retire/unchanged diff plus exact Full-import omissions; the
  UI must display this server result before Apply.
- The payload `requestId` identifies that validation request.
- `applyCatalogImportAction` accepts the validated import ID, a new apply
  request ID, and the normalized payload/source metadata again. It recomputes
  the normalized payload hash, compares it with the validated import record,
  atomically creates the change set, and moves the import once to `applied`.
- No `previewing` database status exists because Phase 4 has no uploaded file,
  background parser, or resumable job.

This separation keeps request idempotency unambiguous: retrying validation and
retrying mutation are different operations with different effects.

If validation is otherwise complete but would retire rows while
`catalog_retirement_enabled` is false, return the authoritative preview as a
successful read-only result. It must include all counts/omissions and explain
why Apply is unavailable. Do not call the persistence RPC, create
`catalog_imports`/change-set rows, or manufacture a partial diff merely to
avoid the disabled capability.

## 7. Server validation

The server must independently:

1. authenticate current user and require an active admin profile;
2. parse the request with an explicit schema; reject unknown keys;
3. enforce byte/row/text limits;
4. normalize Unicode strings to NFC, trim surrounding whitespace, reject
   remaining control characters, and preserve internal meaningful whitespace;
5. validate UUID, request ID, version/draft status, expected lock version;
6. validate decimal strings without `Number` conversion;
7. validate code registry and identity ownership;
8. validate category and code group against database rows;
9. enforce Production-price precedence when no separate price authority exists;
10. exclude all K fields;
11. rebuild Full/Supplement diff from current database rows;
12. apply reconciliation gates and calculate the Full-import retirement count;
    when `retire_count >= max(10, ceil(active_base_item_count * 0.02))`, require
    a nonblank `retirementApprovalReference` and
    `retirementConfirmedCount === retire_count`;
13. resolve effective batch/per-row price authority for every new row and reject
    missing or unapproved evidence;
14. return the complete authoritative diff/omission result and recompute the
    normalized payload hash;
15. call the exact database mutation function only after validation passes.

Step 3 validates source metadata shape and declared limits but does not claim
to rehash unseen raw workbook bytes.

## 8. Action result and error codes

```ts
export type CatalogActionResult<T> =
  | { ok: true; data: T; requestId: string }
  | {
      ok: false
      requestId: string
      error: {
        code: CatalogErrorCode
        message: string
        retryable: boolean
        fieldErrors?: Record<string, string[]>
        diagnostics?: Array<{
          row?: number
          field?: string
          code: string
          message: string
        }>
      }
    }
```

Required stable codes:

| Code | Meaning | Retryable |
|---|---|---|
| `AUTH_REQUIRED` | No authenticated server identity | No |
| `FORBIDDEN` | Not an active admin | No |
| `VALIDATION_FAILED` | Field/cross-row validation failed | No |
| `IMPORT_FILE_TOO_LARGE` | Raw client file cap exceeded | No |
| `IMPORT_ROW_LIMIT_EXCEEDED` | More than 1,500 rows | No |
| `IMPORT_PAYLOAD_TOO_LARGE` | Normalized body exceeds 750 KB | No |
| `IMPORT_PROFILE_NOT_RECOGNIZED` | Sheet/header contract mismatch | No |
| `IMPORT_PRICE_AUTHORITY_REQUIRED` | Unauthorized price delta | No |
| `IMPORT_RECONCILIATION_REQUIRED` | Identity/code outcome unresolved | No |
| `IMPORT_RETIREMENT_APPROVAL_REQUIRED` | Full-import retirement count reaches the greater-of-10-or-2% threshold without exact owner approval evidence | No |
| `CATALOG_CODE_CAPACITY_REVIEW_REQUIRED` | Approved AAA-TTT group sequence has reached 900 and needs an owner capacity decision | No |
| `DRAFT_NOT_FOUND` | Draft no longer exists/visible | No |
| `DRAFT_NOT_EDITABLE` | Version is not draft | No |
| `DRAFT_LOCK_CONFLICT` | Expected lock version is stale | Yes, after refresh |
| `DRAFT_BASE_STALE` | Current pointer differs from draft base | No |
| `REQUEST_ALREADY_PROCESSED` | Same request ID already succeeded | No; return prior result when safe |
| `PUBLISH_EVIDENCE_REQUIRED` | Approval metadata incomplete | No |
| `PUBLISH_VALIDATION_FAILED` | Database publish invariant failed | No |
| `EXPORT_HASH_MISMATCH` | Generated export does not match DB | Yes after investigation |
| `INTERNAL_ERROR` | Unexpected failure; no sensitive details | Yes |

Log technical context server-side with request ID. User messages must not expose
SQL, secrets, stack traces, or raw unescaped workbook content.

## 9. Supabase and Next.js implementation boundary

- Reuse `lib/supabase/server.ts` for cookie-aware server access.
- Reuse `lib/supabase/client.ts` only in Client Components.
- Generate database types into one reviewed file (proposed
  `lib/types/database.generated.ts`) and type both clients.
- Server Components perform version/item/history reads.
- Server Actions perform clone/manual/import-apply/publish/restore mutations.
- Excel binary export uses a Node.js Route Handler.
- Browser parser/ExcelJS loads dynamically on import interaction.
- Server Actions call server identity (`getUser()` when a fresh user record is
  needed, or the approved verified-claims pattern), load active profile, and
  rely on RLS/database authorization as defense in depth.
- Existing client-side `getSession()` UI state is not Phase 4 authorization.

## 10. Canonical dataset contract

### 10.1 Included row fields and order

Every row is an object whose keys occur in this exact order:

1. `identity_id`
2. `item_code`
3. `item_name`
4. `unit`
5. `material_cost`
6. `labor_cost`
7. `unit_cost`
8. `category_code`
9. `category_name`
10. `work_context_code`
11. `work_context_name_th`
12. `item_type_code`
13. `item_type_name_th`
14. `is_active`
15. `display_order`

No version metadata, timestamp, actor, version-row UUID such as
`price_list.id`, or export timestamp is included. Stable logical
`identity_id` is included as field 1 and is part of lineage equivalence.

### 10.2 Value rules

- Strings are stored/serialized in Unicode NFC.
- Validation trims required strings before database storage.
- Optional absent values are JSON `null`; keys are never omitted and empty
  string is not a substitute for null.
- Money is a two-decimal string such as `"125.00"`.
- Boolean is JSON `true`/`false`.
- `display_order` is a nonnegative JSON integer.
- For publishable versions, `display_order` is unique within the version and the
  complete row set forms a contiguous zero-based range. If P-18 is accepted,
  inserting a new identity may shift inherited numeric values; every shifted
  value is part of the canonical dataset and audit.
- Work-context/item-type codes and Thai names come from the same version's
  approved code-group row. All four are JSON `null` only for a legacy version
  that explicitly permits no structured group.

### 10.3 Row ordering

Sort with byte-stable ascending comparison of normalized `item_code`. Use
`identity_id` ascending as the final tie-breaker. Duplicate item code within one
version is a validation failure; the tie-breaker still makes diagnostics and
test fixtures deterministic.

Do not use locale-aware collation, database default collation, physical row
order, or workbook row order.

### 10.4 Serialization and hash

1. Build the ordered row array using the exact object key order above.
2. Serialize compact JSON equivalent to JavaScript `JSON.stringify` with no
   indentation and no BOM.
3. Append exactly one LF byte (`0x0A`).
4. Encode as UTF-8.
5. Compute SHA-256.
6. Store/display as `sha256:<64 lowercase hexadecimal characters>`.

The shared canonicalizer is used by publication, Excel verification, PDF
verification, and tests. Export presentation formatting is never hashed.
Exact official workbook sheets, PDF presentation, binary-file hash handling,
and visual acceptance are defined in the
[Official Export Specification](./20-phase4-official-export-spec.md).

### 10.5 Golden fixture

```json
[{"identity_id":"00000000-0000-0000-0000-000000000001","item_code":"AAA-BBB-001","item_name":"รายการทดสอบ 1","unit":"ม.","material_cost":"100.00","labor_cost":"25.00","unit_cost":"125.00","category_code":"1.1","category_name":"หมวดทดสอบ","work_context_code":"AAA","work_context_name_th":"กลุ่มงานทดสอบ","item_type_code":"BBB","item_type_name_th":"ชนิดทดสอบ","is_active":true,"display_order":1},{"identity_id":"00000000-0000-0000-0000-000000000002","item_code":"AAA-BBB-002","item_name":"รายการทดสอบ 2","unit":"จุด","material_cost":"0.00","labor_cost":"75.50","unit_cost":"75.50","category_code":"1.1","category_name":"หมวดทดสอบ","work_context_code":"AAA","work_context_name_th":"กลุ่มงานทดสอบ","item_type_code":"BBB","item_type_name_th":"ชนิดทดสอบ","is_active":false,"display_order":2}]
```

After the final LF, expected hash is:

```text
sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5
```

Implementations in browser/server/database test tooling must reproduce it
exactly before Production publication is allowed.

### 10.6 Cross-environment identity portability

The canonical algorithm is deterministic only when its input identities are
deterministic. Migration `017` now initializes the baseline identity from the
Production-derived version-row UUID. Earlier random-identity Local evidence is
superseded; the current P-20 contract below is authoritative.

P-20 selects one model for Phase 4: deterministically initialize each legacy
baseline stable identity directly from the existing immutable
Production-derived `price_list.id`, then keep `identity_id` in this lineage
hash. Migration `017` must reject a non-empty non-baseline input, an already
assigned non-deterministic baseline identity, target-ID collision, incomplete
coverage, or any postcondition where baseline `identity_id <> price_list.id`.
Cloned versions continue to reuse the baseline identity rather than their new
version-row UUID.

Do not add a second business-content hash, silently remove `identity_id`,
reinterpret the current hash, or use an environment-specific hash as proof
that two independently rebuilt datasets are business-equivalent. The approved
mapping updates this spec, DB contract, migrations, export verification,
fixtures, and Verification Report together. WP-6.5C passed two independent
approved clean rebuilds; rerun remains mandatory after any migration change and
at WP-8/P-15.

### 10.7 P-18 placement and hash behavior

P-18 does not create a second catalog-equivalence hash. The proposed placement
revision is workflow freshness only. The existing dataset hash changes whenever
any canonical row's `display_order` changes, including inherited rows shifted by
inserting a new identity.

“Preserve inherited relative order” means that after filtering new identities
out of the candidate, the remaining identity sequence equals the base sequence.
It does not mean inherited numeric `display_order` values remain unchanged.
Publish, Excel, PDF, and the tracked verifier must use the exact final accepted
values.

## 11. Required tests

- Exact and rejected profile detection
- Duplicate/missing headers and formula/error cells
- Raw file, row, and normalized-byte limits
- Thai Unicode NFC equivalence
- Decimal formatting and no floating-point drift
- Full versus Supplement omission semantics
- Complete server diff totals/rows and exact Full-import omission set
- Batch/per-row price-authority resolution and K-field rejection
- Client-tampered payload rejection
- Stable error-code mapping without sensitive details
- Canonical key/order/null/decimal/LF behavior
- Golden fixture hash in every runtime using the canonicalizer
- 710-row Production clone hash stable across repeat reads with the same frozen
  identity mapping
- P-20 clean-reset/cross-environment fixture proves the selected identity/hash
  portability model
- After P-18 acceptance, insertion/renumber fixtures prove unique contiguous
  order, preserved inherited relative order, and a matching changed dataset hash
- Excel `_canonical_row_json` reconstructs the published database hash
- PDF generation rechecks database count/hash and prints the matching values
