# Master Catalog Phase 4 Reconciliation Report

**Status:** Draft evidence for owner review — not approved for import/publish
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Target use:** First structured-code candidate `2568.1.0`

## 1. Purpose

This report reconciles the current Production catalog with the candidate
structured-code workbook. It prevents a taxonomy workbook from silently
deleting Production rows, adding unapproved prices, or attaching an incorrect
business classification.

The attached CSV is a decision draft, not an import file and not an approval
record:

- [728-record reconciliation draft](./evidence/phase4-reconciliation-draft.csv)
- CSV SHA-256:
  `4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a`

## 2. Evidence sources

| Source | Role | Fingerprint/state |
|---|---|---|
| Production Supabase | Authoritative current catalog | Read-only MCP check 2026-06-22 |
| `supabase/.snapshots/public-data-20260621-post009.sql` | Row-level Production evidence used for reproducible comparison | SHA-256 `a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570` |
| `files/NT_Item_Code_Master_K_Mapping_2568.xlsx` | Candidate codes/classification | SHA-256 `ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b` |

Fresh MCP evidence confirmed that Production remains at 710 rows and that its
latest catalog update is still 2026-05-31 18:15:26 ICT. Therefore no catalog
row drift was observed between the snapshot and this review. A fresh baseline
and fingerprint must still be repeated immediately before implementation and
publication.

## 3. Method

1. Read the 710 Production `price_list` rows with UUID, legacy code, name, unit,
   category, and all price fields.
2. Read the 708 rows from workbook sheet `01_Item_Master_Final`.
3. Normalize Unicode to NFKC for matching only, remove zero-width characters,
   collapse whitespace, and trim.
4. Group both sources by normalized item name plus normalized unit.
5. Within each group, pair exact material/labor/unit price tuples first.
6. Pair remaining same-name/unit rows one-to-one and flag price differences.
7. Never use workbook `item_id` as identity; its values change when sorted.
8. Preserve source text and prices in separate columns so normalization cannot
   hide a business difference.

Fuzzy matching was not used to make decisions. A future tool may suggest fuzzy
matches, but an owner/reviewer must approve them explicitly.

## 4. Reconciliation result

| Outcome | Count | Required treatment |
|---|---:|---|
| Production rows | 710 | All must remain represented |
| Workbook rows | 708 | All must have a recorded outcome |
| Name+unit one-to-one matches | 690 | Candidate code may be reviewed |
| Exact material/labor/unit cost matches | 648 | Preserve Production values |
| Same name+unit but different costs | 42 | Preserve Production; not a price-change request |
| Production-only rows | 20 | Retain; assign approved code or document temporary legacy code |
| Workbook-only rows | 18 | Defer; not publishable without separate price authority |
| HDPE Crossing taxonomy conflicts | 16 | Correct/reject `CRS-GIP-018`–`033`; do not publish as GIP |
| Decision records in attached CSV | 728 | 710 Production + 18 workbook-only candidates |

## 5. Locked price decision

For the first structured-code release:

- `price_outcome = preserve_production` for every matched Production row;
- all 42 workbook price differences are informational only;
- workbook-only prices have no authority and are excluded;
- `2568.1.0` must first clone all 710 Production names, units, material costs,
  labor costs, and unit costs exactly;
- any price delta after clone is a blocking error unless a separate approved
  price change request is linked.

## 6. Required owner decisions

### 6.1 Duplicate `ITEM-0131` / `ITEM-0139`

The two Production rows are identical. Until the owner decides otherwise, they
remain two historical identities because historical BOQs must not be rewritten.

Choose and record one outcome:

- retain both as distinct valid items;
- retain one and retire the erroneous row in `2568.1.0`.

Both rows receive distinct stable identities in baseline `2568.0.0` because
they coexist in an already published version. No automatic or manual UUID
merge is allowed in Phase 4 Core. Retiring one row creates a `retire` change
item for that identity; its legacy code, prior rows, audit history, and BOQ
references remain intact. The surviving row is unchanged unless another field
has its own approved change.

**Reason:** Mapping two rows in the same published version to one identity
would violate `UNIQUE (version_id, identity_id)` or require rewriting history.
Retirement in a new version expresses the business correction without either
problem.

### 6.2 HDPE Crossing rows

Sixteen descriptions identify HDPE but candidate codes
`CRS-GIP-018` through `CRS-GIP-033` classify them as GIP and map them toward
GIP formula `K(5.6)`. These rows require corrected `AAA-TTT` codes or explicit
rejection. Phase 4 does not import K fields.

### 6.3 Production-only 20 rows

Every row remains in the candidate catalog. The owner must either:

- allocate a canonical `AAA-TTT-###` code and code group; or
- approve temporary continued use of its legacy `ITEM-####` code for this
  version with a reason and follow-up owner.

### 6.4 Workbook-only 18 rows

Default decision is `candidate_add` + `deferred_not_publishable`. Adding one
requires approved name/unit/price authority, an allocated identity/code, and a
reviewed change request. Candidate presence in the workbook is insufficient.

### 6.5 `FTW-CON-002`

The candidate wording contains a repeated Thai phrase. Production wording is
preserved in the first clone. A later wording correction must be explicit and
audited.

## 7. CSV field contract

| Field group | Fields | Meaning |
|---|---|---|
| Scope/identity | `record_scope`, `production_uuid`, `legacy_item_code`, `canonical_code_candidate` | What row/identity is being decided |
| Source trace | `workbook_row`, `workbook_source_row` | Candidate workbook location |
| Matching | `match_status`, `match_method`, `confidence` | How the candidate was paired |
| Text/unit | Production/workbook name and unit columns | Side-by-side source values |
| Price | Production/workbook material, labor, unit cost | Side-by-side numeric evidence |
| Outcomes | `identity_outcome`, `price_outcome`, `taxonomy_status` | Proposed controlled result |
| Approval | `decision_status`, `decision_reason`, `reviewer`, `reviewed_at`, `notes` | Human decision evidence |

Allowed final identity outcomes are:

- `retain`
- `recode`
- `candidate_add`
- `retire`
- `reject_source_row`

The draft value `duplicate_treatment_pending_owner` must be replaced by
`retain` or `retire` before approval.

Allowed first-release price outcome for a Production row is only
`preserve_production`.

## 8. Approval rules

A row is not approved when:

- reviewer or review date is missing for a non-exact/exception row;
- the identity outcome is not final;
- a Production row has no identity/code treatment;
- a canonical code is duplicated or reused for another identity;
- a code group conflicts with its canonical code;
- a workbook-only row lacks separate price authority;
- any Production price would change;
- K-formula data is present in the import payload.

The final approved artifact must satisfy:

| Gate | Expected |
|---|---:|
| Production UUID coverage | 710 / 710 |
| Unique Production UUIDs | 710 |
| Unique final legacy codes | 710 |
| Missing final identity outcomes | 0 |
| Reused canonical code across identities | 0 |
| Unauthorized price outcomes | 0 |
| Unresolved taxonomy blockers | 0 |
| Unreviewed exception rows | 0 |

## 9. Sign-off

| Role | Name | Decision | Timestamp | Note/reference |
|---|---|---|---|---|
| Catalog owner |  | Pending |  |  |
| Taxonomy reviewer |  | Pending |  |  |
| Price authority |  | Pending |  | Confirms Production precedence/no price change |
| Technical verifier |  | Pending |  | Confirms counts, uniqueness, and hashes |

Until all sign-offs are complete, this report blocks Phase 4A backfill and any
publication of structured codes.
