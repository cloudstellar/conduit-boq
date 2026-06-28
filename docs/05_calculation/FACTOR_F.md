# Factor F
## Conduit BOQ System

**Last Updated:** 2026-06-05
**Status:** Canonical

---

## 1. What is Factor F?

**Factor F (ค่าสัมประสิทธิ์ปรับราคา)** is a multiplier that accounts for:
- Overhead costs (ค่าดำเนินการ)
- Profit margin (กำไร)
- Interest (ดอกเบี้ย)

It is applied to the Grand Total before VAT.

---

## 2. Source Table: `factor_reference`

ระบบนี้ใช้คอลัมน์ `factor` เป็นค่า **"รวมในรูป Factor"** จากตาราง Factor F งานก่อสร้างทาง
เช่น ช่วงค่างาน 30-40 ล้านบาทใช้ `factor` ไม่ใช่คอลัมน์ `factor_f`.

> Pending 2026-06-28 Factor F update:
> the owner supplied a 26 June 2026 source candidate. It keeps the same
> calculation contract: use `รวมในรูป Factor` as `factor`; do not use the Thai
> column `Factor F` as the main BOQ multiplier. The candidate is recorded in
> [docs/plans/factor-f/04-source-table-2569-06-26.md](../plans/factor-f/04-source-table-2569-06-26.md).

| cost_million | factor | factor_f |
|--------------|--------|----------|
| 5            | 1.2750 | 1.3642   |
| 10           | 1.2274 | 1.3133   |
| 20           | 1.1730 | 1.2551   |
| 30           | 1.1422 | 1.2221   |
| 40           | 1.1359 | 1.2154   |
| 50           | 1.1310 | 1.2101   |
| ...          | ...    | ...      |

---

## 3. Lookup Rules

1. **Find lower bound:** Largest `cost_million` ≤ actual cost (in millions)
2. **Find upper bound:** Smallest `cost_million` > actual cost
3. **Interpolate** if between two values

---

## 4. Interpolation Formula

```
Given:
  A = actual cost in millions
  B = lower threshold
  C = upper threshold
  D = factor at lower threshold
  E = factor at upper threshold

Interpolated Factor F = D - ((D - E) × (A - B) / (C - B))
```

### Example

If Grand Total = 34,444,444.444444 บาท (34.444444 million):

```
A = 34.444444 (actual cost)
B = 30 (lower threshold)
C = 40 (upper threshold)
D = 1.1422 (factor at 30M)
E = 1.1359 (factor at 40M)

Factor F = 1.1422 - ((1.1422 - 1.1359) × (34.444444 - 30) / (40 - 30))
         = 1.1422 - (0.0063 × 0.444444)
         = 1.1422 - 0.0028
         = 1.1394
```

---

## 5. Edge Cases

| Condition | Behavior |
|-----------|----------|
| cost ≤ 5 million | Use `factor` for 5 million (1.2750) |
| cost > max threshold | Use `factor` for max threshold |
| Exact match | Use exact `factor`, no interpolation |

### Decimal Handling

> [!IMPORTANT]
> **Truncate ไม่ใช่ Round!**

ถ้าค่า Factor F ที่คำนวณได้มีทศนิยมมากกว่า 4 ตำแหน่ง → **ตัดหลักที่เกินออก (truncate)**

```typescript
// Implementation in code:
Math.floor(interpolatedFactor * 10000) / 10000
```

**ตัวอย่าง:**
- `1.05376789` → `1.0537` (ตัด `6789` ออก)
- `1.02599999` → `1.0259` (ไม่ปัดเป็น `1.0260`)

---

## 6. Implementation

| File | Function |
|------|----------|
| `lib/factorF.ts` | `calculateInterpolatedFactorFromRefs()` |
| `lib/factorF.ts` | `isFactorSnapshotUsable()` |
| `components/boq/FactorFSummary.tsx` | Load reference rows once, live edit display |
| `app/boq/[id]/print/page.tsx` | Use valid saved snapshot before live fallback |
| `lib/exportBoqExcel.ts` | Use valid saved snapshot before live fallback |

---

## 7. Runtime Behavior

After the 2026-06-05 correction, Factor F handling follows these rules:

1. The edit page loads `factor_reference` once and calculates the displayed
   Factor F immediately in the browser from the loaded rows.
2. Saving a BOQ stores the full Factor F snapshot:
   `factor_f`, `factor_f_raw`, lower/upper cost, lower/upper factor values,
   `total_with_factor_f`, and `total_with_vat`.
3. Print and Excel export use the saved snapshot first when it is complete and
   internally consistent with the BOQ total.
4. Live lookup on print/export is only a fallback for legacy or invalid
   snapshots.
5. If the Factor F table cannot be read or no matching factor can be calculated
   for a nonzero BOQ total, the system shows an error and blocks saving instead
   of substituting a default value.
6. A legacy BOQ with no `factor_reference_version_id` is not silently rebound
   to the latest table. In edit mode it is treated as snapshot-only/read-only
   for line-item changes. To continue work, the user creates a new BOQ copy,
   chooses the intended active Factor F version, reviews it, and saves a new
   snapshot.

### Verification Caveat

The full `factor_reference` table must be verified through authenticated
Supabase SQL/MCP access before the Master Catalog execution window. Anonymous
REST/Data API checks can return `0` rows under RLS and are not an authoritative
count source.

The 2026-06-05 Supabase MCP recheck confirmed 37 `factor_reference` rows and
the full numeric reference checksum
`e8040ffbf82beebd61bbb9c2652dd41a`. The 30M = `1.1422` and 40M = `1.1359`
values are useful smoke examples for the Surin interpolation case, but the
approval gate must validate every row.

---

## References

- Calculation flow: [CALCULATION_RULES.md](./CALCULATION_RULES.md)
- VAT rules: [VAT_AND_TOTALS.md](./VAT_AND_TOTALS.md)
