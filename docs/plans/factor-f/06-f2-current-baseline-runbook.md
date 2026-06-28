# F2 Current Baseline Seed Runbook

**Status:** Draft runbook — migration `013_factor_f_seed_current_baseline.sql`
must not be created with final values until owner confirms the baseline version
identity and approval text.

**Production effect when executed later:** Seed the currently deployed
`public.factor_reference` table into Factor F version tables and move
`factor_reference_default_version` to that baseline. No legacy BOQ backfill.

## 1. Production Baseline Evidence

Read-only Production MCP audit on 2026-06-28:

| Check | Result |
|---|---|
| Source table | `public.factor_reference` |
| Row count | 37 |
| Duplicate `cost_million` thresholds | 0 |
| Invalid required rows | 0 |
| Min/max `cost_million` | 5.0000 / 700.0000 |
| Canonical dataset hash | `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |

Canonical hash input uses rows ordered by `cost_million` and includes:

- `cost_million`
- `operation_percent`
- `interest_percent`
- `profit_percent`
- `total_expense_percent`
- `factor`
- `vat_percent`
- `factor_f`
- `factor_f_rain_1`
- `factor_f_rain_2`

## 2. Known Current-System Condition Text

The current print/export code historically used:

- advance payment: `0.00 %`
- retention: `0.00 %`
- loan interest: `7.00 % ต่อปี`
- VAT display: `7.00 %`

These are current-system output metadata, not proof of the original government
source document for the legacy baseline.

## 3. Required Owner Decisions Before Migration 013

| Decision | Recommended if source is unknown | Alternative if owner has evidence |
|---|---|---|
| Baseline version string | `0.0.0` as technical legacy baseline | `2568.0.0` or another BE-year version only if owner confirms the source/effective year |
| `effective_date` | `NULL` | Confirmed source effective date |
| `source_reference` | `Existing production public.factor_reference baseline captured by F2 preflight on 2026-06-28; original external source/effective date not asserted.` | Official source document/reference |
| `approval_reference` | Owner-approved F2 baseline seed from existing production behavior | Formal approval memo/reference |
| `name` | `Legacy production Factor F baseline (pre-versioning)` | Owner-approved source name |

Do not infer the legacy source effective date from the Master Catalog year,
current date, file timestamps, or the new ว481 source.

## 4. Migration 013 Contract

When owner decisions are complete, migration `013_factor_f_seed_current_baseline.sql`
should:

1. Fail closed unless migration 012 tables and `boq.factor_reference_version_id`
   exist.
2. Fail closed unless current `factor_reference` row count is exactly 37.
3. Fail closed unless duplicate thresholds and invalid required row counts are 0.
4. Insert one `factor_reference_versions` row for the baseline.
5. Copy all current `factor_reference` rows into `factor_reference_rows` with
   deterministic `display_order`.
6. Store row count and canonical dataset hash.
7. Set version status to `active`.
8. Insert/update `factor_reference_default_version`.
9. Verify no legacy BOQ is backfilled.

## 5. Post-F2 Verification

- `factor_reference_default_version` has exactly one row.
- Pointer references the active baseline version.
- `factor_reference_rows` count equals 37 for the baseline version.
- Dataset hash equals
  `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61`.
- `select count(*) from public.boq where factor_reference_version_id is not null`
  remains unchanged immediately after F2.
- A new empty BOQ draft binds the baseline version through
  `trigger_set_default_factor_reference_version`.
