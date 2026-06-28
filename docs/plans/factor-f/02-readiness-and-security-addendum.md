# Factor F Track Readiness and Security Addendum

**Status:** Draft companion checklist for F0-F3
**Date:** 2026-06-28
**Authority:** [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md)
and the [Factor F Change Request](./01-versioned-factor-f-change-request.md)
**Implementation plan:** [Factor F Versioning Implementation Plan](./03-implementation-plan.md)
**F3 source candidate:** [26 June 2026 Factor F Source Table Candidate](./04-source-table-2569-06-26.md)

## 1. Readiness interpretation

The Factor F track has two different readiness levels:

| Gate | Meaning | Can proceed without new Factor F values? |
|---|---|---|
| F0 | Approve the policy, scope, and evidence requirements | Yes, if the owner accepts the policy and records pending business inputs |
| F1 | Implement additive schema/app compatibility | Yes, using the current table as the only source |
| F2 | Seed the audited current baseline for future BOQs | Yes, after baseline checksum/count verification |
| F3 | Publish a new Factor F table | No; requires the approved new table, effective date, source, and owner approval |

Therefore the track is not ready for F3 until the business evidence is complete,
but F1/F2 planning can proceed after F0 policy approval.

Do not treat any remembered row count as authority. The baseline count becomes
authoritative only when the Production preflight query is recorded for F2.

Read-only Supabase MCP inspection on 2026-06-28 recorded the current
Production state:

| Check | Production result |
|---|---|
| Latest migration ledger | `20260621104056_master_catalog_phase1b_hardening` / root migration `011` |
| `factor_reference` rows | 37 |
| Duplicate `cost_million` thresholds | 0 |
| Invalid required Factor F rows | 0 |
| Factor F version tables | Not present |
| `boq.factor_reference_version_id` | Not present |
| BOQs with complete Factor F snapshots | 70 |
| BOQs with incomplete/invalid Factor F snapshots | 136 |
| Legacy `factor_reference` grants | Broad grants exist for `anon`, `authenticated`, and `service_role`; do not copy to new tables |

Re-run these checks immediately before F2/Production execution; these recorded
values are planning evidence, not a substitute for execution-window preflight.
The owner confirmed `FACTOR F 2566_7.PDF` as the current baseline source and
`2566.0.0` as the current baseline identity on 2026-06-28.

## 2. Business inputs required before F3

| Input | Required before | Notes |
|---|---|---|
| Current baseline export | F2 | Current Production `factor_reference` rows and checksum; local F2 rehearsal uses owner-confirmed baseline `2566.0.0` |
| New Factor F table | F3 | Current owner-supplied candidate is the 26 June 2026 source table annex; do not type values manually without independent review |
| Effective date | F3 | Confirmed by owner on 2026-06-28 as 2026-06-26 for the 26 June 2026 candidate |
| Source/approval reference | F3 | Confirmed by owner: กค 0433.2/ว 481 ลงวันที่ 26 มิถุนายน 2569; official PDF retained outside repository by owner/NT |
| Data custodian | F3 | Owner will review row-level transcription, diff, and hash before publication |
| Expected row count | F3 | Supplied image has 36 visible rows; must reconcile with source document |
| Source condition parameters | F3 | Confirm advance payment 0%, retention 0%, loan interest 6% per year, and VAT 7% for the 26 June 2026 candidate |
| Calculation formula decision | F3 | Existing interpolation and truncate-to-4-decimals remain unless separately approved |
| VAT decision | F3 | Confirm whether `vat_percent` remains 7% |
| Column decision | F3 | Confirm `รวมในรูป Factor -> factor` is the BOQ multiplier; confirm `factor_f_rain_1` and `factor_f_rain_2` remain required; do not invent row-level component percentages missing from the source |

## 3. Technical preflight before F1

Run and record these checks before any F1 migration.

```sql
-- Current Factor F row and duplicate check.
select
  count(*) as factor_rows,
  count(distinct cost_million) as distinct_cost_thresholds,
  count(*) - count(distinct cost_million) as duplicate_thresholds
from public.factor_reference;
```

```sql
-- Required numeric values must be present and positive.
select count(*) as invalid_factor_rows
from public.factor_reference
where cost_million is null
   or operation_percent is null
   or interest_percent is null
   or profit_percent is null
   or total_expense_percent is null
   or factor is null
   or vat_percent is null
   or factor_f is null
   or factor_f_rain_1 is null
   or factor_f_rain_2 is null
   or cost_million <= 0
   or factor <= 0
   or factor_f <= 0
   or factor_f_rain_1 <= 0
   or factor_f_rain_2 <= 0;
```

```sql
-- BOQ Factor F snapshot coverage. These rows remain legacy/snapshot-only;
-- do not backfill a factor version by assumption.
select
  count(*) as total_boqs,
  count(*) filter (
    where factor_f is not null
      and factor_f_lower_cost is not null
      and factor_f_upper_cost is not null
      and factor_f_lower_value is not null
      and factor_f_upper_value is not null
      and factor_f > 0
      and factor_f_lower_cost > 0
      and factor_f_upper_cost > 0
      and factor_f_lower_value > 0
      and factor_f_upper_value > 0
  ) as snapshot_complete,
  count(*) filter (
    where factor_f is null
       or factor_f_lower_cost is null
       or factor_f_upper_cost is null
       or factor_f_lower_value is null
       or factor_f_upper_value is null
       or factor_f <= 0
       or factor_f_lower_cost <= 0
       or factor_f_upper_cost <= 0
       or factor_f_lower_value <= 0
       or factor_f_upper_value <= 0
  ) as snapshot_incomplete
from public.boq;
```

```sql
-- Privilege snapshot for legacy factor_reference. RLS is still required, but
-- broad grants should not be carried forward to new Factor F tables.
select
  grantee::regrole::text as grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'factor_reference'
order by grantee, privilege_type;
```

## 4. F1 database security contract

F1 creates new objects with tighter privileges than the legacy
`factor_reference` grants.

### `factor_reference_versions`

- RLS enabled immediately.
- `authenticated` may select published/active versions.
- Active admins may manage draft/publish only through reviewed functions.
- No direct `INSERT`, `UPDATE`, or `DELETE` grant to `PUBLIC`, `anon`, or
  broad application roles.
- Published metadata is immutable except pointer movement does not mutate it.

### `factor_reference_rows`

- RLS enabled immediately.
- `authenticated` may select rows for published/active versions.
- Draft mutation occurs only through reviewed admin functions.
- Published rows are immutable.
- Required constraints:
  - `version_id` FK to `factor_reference_versions` with `ON DELETE RESTRICT`;
  - `UNIQUE (version_id, cost_million)`;
  - positive checks for `cost_million`, `factor`, `factor_f`,
    `factor_f_rain_1`, and `factor_f_rain_2`;
  - nonnegative `display_order` if present.

### `factor_reference_default_version`

- Singleton row with `id boolean primary key default true check (id = true)`.
- Pointer must reference a published/active factor version.
- Delete is blocked by trigger/function.
- Pointer update requires active-admin authorization and an audit/reason path.

### `boq.factor_reference_version_id`

- Nullable FK to `factor_reference_versions`.
- New empty BOQs after F2/default pointer setup must bind the current factor
  pointer.
- Existing BOQs remain null unless exact source evidence exists.
- Later RPC replacements, including Master Catalog Phase 4 functions, must
  preserve or deliberately set this column.

## 5. F1 application coupling checklist

F1 is not complete until all of these are true:

- BOQ create preserves existing/legacy nulls and binds
  `factor_reference_version_id` from `factor_reference_default_version` once F2
  has seeded the active pointer.
- BOQ edit and `FactorFSummary` read factor rows by the BOQ-bound version.
- `save_boq_with_routes` preserves/writes `factor_reference_version_id`.
- Print uses bound factor rows for version-bound BOQs.
- Print uses valid saved snapshots for legacy BOQs and fails closed when the
  snapshot is incomplete or invalid.
- Excel export follows the same rules as print.
- Print and Excel condition text reads Factor F version metadata instead of
  hardcoded source parameters such as loan interest.
- No user-facing print/export path falls back to the latest live factor table
  for a legacy BOQ with invalid snapshots.

## 6. Minimum F1 tests

| Test | Type |
|---|---|
| New empty BOQ receives `factor_reference_version_id` after F2/default pointer setup | Integration |
| Legacy BOQ remains null and snapshot-only | DB/integration |
| Version-bound BOQ reads the bound factor rows | Integration |
| Valid legacy snapshot prints/exports successfully | Integration |
| Invalid legacy snapshot fails closed | Unit/integration |
| Print/Excel condition text uses version metadata for loan interest/VAT | Snapshot/integration |
| `save_boq_with_routes` preserves the factor version | DB |
| Publishing a new factor version does not change existing BOQ totals | Integration |
| Singleton pointer cannot be deleted or point to draft | DB |
| Non-admin cannot mutate Factor F version tables | Security |
| Baseline seed row count equals approved current row count | Migration |
