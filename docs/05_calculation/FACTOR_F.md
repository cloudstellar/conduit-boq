# Factor F
## Conduit BOQ System

**Last Updated:** 2026-01-22  
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
| `components/boq/FactorFSummary.tsx` | Factor F reference lookup |

---

## References

- Calculation flow: [CALCULATION_RULES.md](./CALCULATION_RULES.md)
- VAT rules: [VAT_AND_TOTALS.md](./VAT_AND_TOTALS.md)
