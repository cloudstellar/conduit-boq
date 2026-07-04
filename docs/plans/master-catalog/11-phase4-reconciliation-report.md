# Master Catalog Phase 4 Reconciliation Report

**Status:** Owner-approved as draft evidence and decision framework; not
approved for candidate freeze, import, or publication
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Target use:** First structured-code candidate `2568.1.0`

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation as evidence framework only. The owner accepts the method,
counts, CSV field contract, Production price precedence, workbook-only deferral
default, Production-only retention, UUID/history merge prohibition, current
HDPE-as-GIP rejection, and approval rules. P-02 through P-07 row-level decisions
are recorded below as separate owner decisions. This report still does not make
the CSV an import file, authorize Production candidate freeze, or authorize
publication.

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
| Workbook-only rows | 18 raw / 17 unresolved | Raw workbook evidence has 18 rows; P-07 resolves workbook `FTW-CON-002` as a typo shadow of Production `ITEM-0491`, leaving 17 supplement candidates deferred |
| HDPE Crossing taxonomy conflicts | 16 | Correct/reject `CRS-GIP-018`-`033`; do not publish as GIP |
| Decision records in attached CSV | 728 | 710 Production + 18 raw workbook-only records |

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

**Owner decision recorded:** 2026-07-04 — retain both `ITEM-0131` and
`ITEM-0139` as distinct valid items in the candidate. No available evidence
identifies which historical row, if either, is erroneous; legacy creation audit
is unavailable and BOQ reference impact has not been proven. Retaining both is
reversible in a later approved version, while retiring the wrong identity would
create unnecessary operational and audit risk. No UUID/history merge, price
change, name change, unit change, or implicit retirement is authorized by this
decision.

**Future-retirement note:** `ITEM-0139` may be proposed for retirement in a
subsequent approved version only if live preflight confirms BOQ references are
zero, the data custodian/owner confirms it is the erroneous duplicate, and the
change is recorded as a `retire` outcome for that identity only. UUID/history
merge remains prohibited. The 2026-06-21 snapshot check found zero BOQ item
references for both `ITEM-0131` and `ITEM-0139`, but that snapshot is
supporting evidence, not a substitute for live preflight before a future
retirement.

### 6.2 HDPE Crossing rows

Sixteen descriptions identify HDPE but candidate codes
`CRS-GIP-018` through `CRS-GIP-033` classify them as GIP and map them toward
GIP formula `K(5.6)`. These rows require corrected `AAA-TTT` codes or explicit
rejection. Phase 4 does not import K fields.

**Owner decision recorded:** 2026-07-04 — reject `CRS-GIP-018` through
`CRS-GIP-033` as GIP classifications and split the HDPE Crossing candidates
into HDPE Crossing subtypes following the existing `H06`/`H08` convention:
`CRS-H06` for HDPE PN6 Crossing and `CRS-H08` for HDPE PN8 Crossing. This is a
taxonomy recode only; Production names, units, material costs, labor costs,
unit costs, identities, and BOQ history are unchanged. Workbook-only
`CRS-GIP-025` remains deferred/not publishable under P-05 because it has no
Production identity or separate price authority. Retained duplicate
`ITEM-0139` is handled under P-04 as a Production-only row that needs its own
canonical-code or temporary legacy-code decision. K-formula fields remain
excluded from Phase 4 Core. Exact draft code names/sequences may still be
corrected before publication under the Code Dictionary governance rule that
draft codes may be corrected before publication.

### 6.3 Production-only 20 rows

Every row remains in the candidate catalog. The owner must either:

- allocate a canonical `AAA-TTT-###` code and code group; or
- approve temporary continued use of its legacy `ITEM-####` code for this
  version with a reason and follow-up owner.

**Owner decision recorded:** 2026-07-04 — retain all 20 Production-only rows
in `2568.1.0` and preserve Production names, units, material costs, labor
costs, unit costs, identities, and BOQ history. Nineteen rows receive canonical
codes now. `ITEM-0139` keeps temporary legacy code `ITEM-0139` in this version
because P-02 retains both duplicate identities and allows future retirement only
with live BOQ-reference evidence plus owner/data-custodian confirmation.

| Legacy item | Approved code for `2568.1.0` | Decision note |
|---|---|---|
| `ITEM-0139` | `ITEM-0139` | Temporary legacy code; future retirement candidate under P-02 controls |
| `ITEM-0491` | `FTW-CON-002` | Use Production wording; do not import workbook typo |
| `ITEM-0683` | `CIC-H06-001` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0684` | `CIC-H06-002` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0685` | `CIC-H06-003` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0686` | `CIC-H06-004` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0687` | `CIC-H06-005` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0688` | `CIC-H06-006` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0689` | `CIC-H06-007` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0690` | `CIC-H06-008` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0691` | `CIC-H06-009` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0692` | `CIC-H06-010` | HDPE PN6 concrete-encased communication conduit |
| `ITEM-0699` | `JNT-PVC-013` | Next never-issued PVC joint code |
| `ITEM-0700` | `RSR-PL0-040` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0701` | `RSR-PL0-041` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0702` | `RSR-PL0-042` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0707` | `RSR-PL0-043` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0708` | `RSR-PL0-044` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0709` | `RSR-PL0-045` | Pole riser; skip deferred workbook-only draft gaps |
| `ITEM-0710` | `RSR-PL0-046` | Pole riser; skip deferred workbook-only draft gaps |

### 6.4 Workbook-only raw 18 rows / 17 supplement candidates

Default decision is `candidate_add` + `deferred_not_publishable`. Adding one
requires approved name/unit/price authority, an allocated identity/code, and a
reviewed change request. Candidate presence in the workbook is insufficient.

**Owner decision recorded:** 2026-07-04 — the raw reconciliation keeps 18
workbook-only evidence rows, but P-07 resolves workbook `FTW-CON-002` as a typo
shadow of Production `ITEM-0491`, not a separate supplement candidate. Defer the
remaining 17 unresolved workbook-only rows from `2568.1.0` and open them as a
separate supplement intake. This is not an abandonment of the rows; it keeps the
first structured-code release clean as a 710-row Production clone/recode while
preserving the unresolved rows as future candidates with explicit gates. The
default target for a true new supplement is `2568.2.0`; a different version
classification is allowed only if approved evidence classifies the change
differently under ADR-003.

The 17 unresolved supplement candidates may be published only after all of the
following are recorded:

1. item authority for the new standard item or omission;
2. price authority for material, labor, and unit cost;
3. corrected taxonomy and non-conflicting code allocation;
4. owner/data-custodian approval;
5. import preview and reconciliation evidence;
6. dataset hash and publish verification.

Additional P-05 constraints:

- `CRS-GIP-025` must not publish as GIP because its description is HDPE.
- Workbook `FTW-CON-002` must not be imported as a new item. After removing the
  repeated Thai phrase and normalizing whitespace, it maps to Production
  `ITEM-0491`; P-04/P-07 assign canonical code `FTW-CON-002` to that Production
  identity and wording.
- `RSR-PL0-010`-`013`, `018`-`020`, and `029`-`031` remain deferred gaps and
  must not be reused by the `2568.1.0` Production-only recode.
- Snapshot review supports deferral for the 17 unresolved supplement candidates,
  but does not replace live preflight before any future supplement.

### 6.5 `FTW-CON-002`

**Owner decision recorded:** 2026-07-04 — approve `FTW-CON-002` as the
canonical code for Production `ITEM-0491` using the existing Production wording,
unit, material cost, labor cost, unit cost, identity, and BOQ history. Reject the
workbook-only `FTW-CON-002` row as a typo shadow caused by the repeated phrase
`งานซ่อมทางเท้างานซ่อมทางเท้าด้วย`; it is not a separate catalog candidate and
must not be imported over the Production wording.

The 2026-06-21 snapshot shows 8 `boq_items` references to Production
`ITEM-0491`, so Phase 4 must not replace or merge its identity/history.
Production also contains a double space in the retained wording. Any future
whitespace-only cleanup is a separate wording correction/change request and is
not part of P-07 or the `2568.1.0` taxonomy-only rollout.

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
