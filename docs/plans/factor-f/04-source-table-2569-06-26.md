# Factor F Source Table Candidate: 26 June 2026

**Status:** Owner-confirmed source; published to Production as `2569.0.0` via migration `014`. This file is source review evidence, not executable SQL.
**Date recorded:** 2026-06-28
**Effective date:** 2026-06-26, confirmed by owner on 2026-06-28
**Source reference:** หนังสือกรมบัญชีกลาง ด่วนที่สุด ที่ กค 0433.2/ว 481 ลงวันที่ 26 มิถุนายน 2569
**Evidence retention:** Official PDF is retained outside the repository by the
owner/NT. Local review copies under `files/` are not repository artifacts unless
a separate approval says to commit them.
**Local review files:** `files/factorF_26มิย69.jpg` and
`files/ว481ลว26มิย69-ตารางFactorดอกเบี้ยเงินกู้ร้อยละ6.pdf`
**Related plan:** [Factor F Versioning Implementation Plan](./03-implementation-plan.md)
**Owner/data reviewer:** Owner will review the row-level source transcription,
diff, and dataset hash before F3 publication.

## 1. Source Reading

The owner supplied an image of `ตาราง Factor F งานก่อสร้างทาง`.

Visible source details from the image:

| Field | Value read from image | F3 handling |
|---|---|---|
| Table type | งานก่อสร้างทาง | Store in version metadata/name |
| Source document date | 26 มิถุนายน 2569 | Confirmed by owner as the effective date for this Factor F version |
| Visible reference | หนังสือกรมบัญชีกลาง ด่วนที่สุด ที่ กค 0433.2/ว 481 ลงวันที่ 26 มิถุนายน 2569 | Confirmed by owner; local PDF review also shows the same reference |
| อัตราเงินจ่ายล่วงหน้า | 0% | Store as version-level source metadata |
| อัตราเงินประกันผลงาน | 0% | Store as version-level source metadata |
| อัตราดอกเบี้ยเงินกู้ | 6% ต่อปี | Store as version-level source metadata; do not infer per-row operation/profit values |
| VAT | 7% | Store as version-level source metadata. Preserve row `vat_percent = 1.0700` to match the existing reference-table contract. |

Version string is reserved as `2569.0.0` because the owner confirmed the
effective date is 26 June 2026 / BE 2569 and this is the first planned Factor F
version for that effective year. The current baseline from `FACTOR F 2566_7.PDF`
is reserved as `2566.0.0`.

The local PDF review shows this 54-page official source contains multiple
Factor F table families. The `งานก่อสร้างทาง` section appears on PDF pages
16-28, with the table pages beginning at PDF page 17. F3 must use the
`งานก่อสร้างทาง` rows only.

## 2. Calculation Contract

The BOQ multiplier is the Thai column `รวมในรูป Factor`, mapped to
`factor_reference_rows.factor`.

Do not use these columns as the main BOQ multiplier:

- `Factor F` -> `factor_f`
- `Factor F ฝนชุก 1` -> `factor_f_rain_1`
- `Factor F ฝนชุก 2` -> `factor_f_rain_2`

Those values should be stored for reference/export/provenance if the schema
keeps them, but current BOQ calculation uses `factor`.

Threshold handling:

- The `≤ 5` row is stored as `cost_million = 5`; any cost up to 5 million uses
  this row.
- The `≥ 700` row is stored as `cost_million = 700`; any cost at or above
  700 million uses this row.
- Costs between thresholds use the existing interpolation formula over
  `factor`, truncated to four decimal places.

## 3. Schema Implication From This Source

This image does not show row-level `operation_percent`, `profit_percent`, or
`total_expense_percent`. Implementation must not invent these values.

F1 should therefore treat row-level component percent fields that are not
present in the approved source as nullable/source-derived legacy fields, or
obtain a separate authoritative source before making them `NOT NULL`.

Required calculation/reference fields for this source are:

- `cost_million`
- `factor`
- `vat_percent`
- `factor_f`
- `factor_f_rain_1`
- `factor_f_rain_2`

`interest_percent` can be stored from the visible 6% source metadata only if
the data model explicitly defines whether it is version-level metadata,
row-level duplicated metadata, or both.

For the current plan, the 6% loan interest belongs to version-level source
metadata for print/export text. Do not duplicate it into every row unless a
separate implementation decision explicitly chooses that compatibility shape.
The W481 source displays VAT as 7%, but the row-level `vat_percent` column
keeps the legacy table contract value `1.0700`; the human-readable VAT percent
is stored in `factor_reference_versions.vat_percent`.

## 4. Candidate Row Set

Expected row count from the supplied image is 36. The owner will review and
confirm the final row transcription, row-level diff, and dataset hash before
F3 publication.

| display_order | cost_million | source_label | factor | factor_f | factor_f_rain_1 | factor_f_rain_2 |
|---:|---:|---|---:|---:|---:|---:|
| 1 | 5 | ≤ 5 | 1.2733 | 1.3624 | 1.3821 | 1.4018 |
| 2 | 10 | 10 | 1.2258 | 1.3116 | 1.3319 | 1.3522 |
| 3 | 20 | 20 | 1.1713 | 1.2532 | 1.2715 | 1.2897 |
| 4 | 30 | 30 | 1.1405 | 1.2203 | 1.2367 | 1.2531 |
| 5 | 40 | 40 | 1.1343 | 1.2137 | 1.2316 | 1.2495 |
| 6 | 50 | 50 | 1.1294 | 1.2084 | 1.2264 | 1.2445 |
| 7 | 60 | 60 | 1.1237 | 1.2023 | 1.2203 | 1.2382 |
| 8 | 70 | 70 | 1.1184 | 1.1966 | 1.2150 | 1.2334 |
| 9 | 80 | 80 | 1.1152 | 1.1932 | 1.2117 | 1.2301 |
| 10 | 90 | 90 | 1.1097 | 1.1873 | 1.2052 | 1.2230 |
| 11 | 100 | 100 | 1.1066 | 1.1840 | 1.2015 | 1.2190 |
| 12 | 110 | 110 | 1.0979 | 1.1747 | 1.1918 | 1.2089 |
| 13 | 120 | 120 | 1.0972 | 1.1740 | 1.1913 | 1.2086 |
| 14 | 130 | 130 | 1.0944 | 1.1710 | 1.1880 | 1.2050 |
| 15 | 140 | 140 | 1.0932 | 1.1697 | 1.1868 | 1.2040 |
| 16 | 150 | 150 | 1.0918 | 1.1682 | 1.1852 | 1.2021 |
| 17 | 160 | 160 | 1.0908 | 1.1671 | 1.1842 | 1.2013 |
| 18 | 170 | 170 | 1.0900 | 1.1663 | 1.1833 | 1.2003 |
| 19 | 180 | 180 | 1.0894 | 1.1656 | 1.1825 | 1.1995 |
| 20 | 190 | 190 | 1.0875 | 1.1636 | 1.1815 | 1.1994 |
| 21 | 200 | 200 | 1.0874 | 1.1635 | 1.1814 | 1.1992 |
| 22 | 210 | 210 | 1.0867 | 1.1627 | 1.1808 | 1.1988 |
| 23 | 220 | 220 | 1.0856 | 1.1615 | 1.1794 | 1.1973 |
| 24 | 230 | 230 | 1.0848 | 1.1607 | 1.1784 | 1.1962 |
| 25 | 240 | 240 | 1.0836 | 1.1594 | 1.1770 | 1.1945 |
| 26 | 250 | 250 | 1.0825 | 1.1582 | 1.1756 | 1.1930 |
| 27 | 260 | 260 | 1.0815 | 1.1572 | 1.1744 | 1.1916 |
| 28 | 270 | 270 | 1.0805 | 1.1561 | 1.1732 | 1.1903 |
| 29 | 280 | 280 | 1.0797 | 1.1552 | 1.1722 | 1.1891 |
| 30 | 290 | 290 | 1.0789 | 1.1544 | 1.1712 | 1.1880 |
| 31 | 300 | 300 | 1.0781 | 1.1535 | 1.1702 | 1.1869 |
| 32 | 350 | 350 | 1.0777 | 1.1531 | 1.1697 | 1.1864 |
| 33 | 400 | 400 | 1.0764 | 1.1517 | 1.1685 | 1.1854 |
| 34 | 450 | 450 | 1.0762 | 1.1515 | 1.1683 | 1.1851 |
| 35 | 500 | 500 | 1.0751 | 1.1503 | 1.1671 | 1.1839 |
| 36 | 700 | ≥ 700 | 1.0727 | 1.1477 | 1.1641 | 1.1805 |

## 5. F3 Review Requirements

Before F3 publication:

1. Confirm all transcribed values against the official source retained outside
   the repository.
2. Confirm the expected row count is 36, or update this annex with the complete
   approved source if review finds a discrepancy.
3. Owner reviews the row transcription, preferably with independent reviewer
   sign-off if available.
4. Generate the canonical dataset hash from the reviewed row payload.
5. Compare the new row set against the F2 baseline and approve the exact
   diff/count/hash before pointer movement.
