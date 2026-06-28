# F2 Current Baseline Seed Runbook

**Status:** Owner-confirmed PDF-backed baseline identity; migration
`013_factor_f_seed_current_baseline.sql` created and local-verified on
2026-06-28. Production execution is still pending a separate approved window.

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

The current print/export code historically used, and the 2023-08-24 source PDF
confirms:

- advance payment: `0.00 %`
- retention: `0.00 %`
- loan interest: `7.00 % ต่อปี`
- VAT display: `7.00 %`

Source review on 2026-06-28:

| Evidence | Result |
|---|---|
| Local review file | `/Users/cloud/Cloudstellar/conduit-boq/files/FACTOR F 2566_7.PDF` |
| Official announcement | ประกาศกรมบัญชีกลาง เรื่อง อัตราดอกเบี้ยเงินกู้สำหรับใช้เป็นเกณฑ์ในการคำนวณราคากลางงานก่อสร้าง |
| Announcement date | 24 สิงหาคม 2566 / 2023-08-24 |
| Circular letter | ที่ กค 0433.2/ว 499 ลงวันที่ 28 สิงหาคม 2566 |
| Table shown | ตาราง Factor F งานก่อสร้างทาง |
| Source conditions | เงินล่วงหน้า 0%, เงินประกันผลงาน 0%, ดอกเบี้ยเงินกู้ 7% ต่อปี, VAT 7% |
| Sample row match | Local rows for 5, 10, 30, 500, and 700 million match the PDF values reviewed from page 5 |

## 3. Owner Decisions Recorded For Migration 013

| Decision | Recorded value |
|---|---|
| Baseline version string | `2566.0.0` |
| Reason | Owner confirmed the current baseline source is `FACTOR F 2566_7.PDF`; version major follows the source BE year rather than rollout year |
| `effective_date` | `2023-08-24`, using the official announcement date |
| `source_document_date` | `2023-08-24` |
| `source_reference` | Comptroller General Department Factor F road construction table, announcement dated 2023-08-24, circulated by KorKhor 0433.2/W499 dated 2023-08-28; local review copy `FACTOR F 2566_7.PDF` |
| `approval_reference` | Owner confirmed `FACTOR F 2566_7.PDF` as the current baseline source and approved version identity `2566.0.0` on 2026-06-28 before publishing Factor F `2569.0.0` |
| `name` | `CGD Factor F road construction 7 percent baseline (2566.0.0)` |

Do not infer the baseline version from the Master Catalog year, current date,
file timestamps, or the new ว481 source.

## 4. Migration 013 Contract

Migration `013_factor_f_seed_current_baseline.sql` must:

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

Local verification on 2026-06-28 passed:

| Check | Local result |
|---|---|
| Active baseline version | `2566.0.0` |
| Version row count | 37 |
| Dataset hash | `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |
| Default pointer | Points to active `2566.0.0` |
| Backfilled legacy BOQs | 0 |
| New BOQ rollback test | New empty BOQ bound `2566.0.0`; transaction rolled back |

Before Production execution, rerun the migration preflight against Production
and stop if row count, duplicate thresholds, invalid rows, or dataset hash no
longer match the recorded baseline.

- `factor_reference_default_version` has exactly one row.
- Pointer references the active baseline version.
- `factor_reference_rows` count equals 37 for the baseline version.
- Dataset hash equals
  `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61`.
- `select count(*) from public.boq where factor_reference_version_id is not null`
  remains unchanged immediately after F2.
- A new empty BOQ draft binds the baseline version through
  `trigger_set_default_factor_reference_version`.
