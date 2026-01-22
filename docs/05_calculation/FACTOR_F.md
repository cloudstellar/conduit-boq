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

| cost_million | factor | factor_f |
|--------------|--------|----------|
| 5            | 1.2750 | 1.0537   |
| 10           | 1.2413 | 1.0259   |
| 20           | 1.2261 | 1.0133   |
| 30           | 1.2178 | 1.0064   |
| 40           | 1.2128 | 1.0023   |
| 50           | 1.2094 | 0.9994   |
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
  D = factor_f at lower threshold
  E = factor_f at upper threshold

Interpolated Factor F = D - ((D - E) × (A - B) / (C - B))
```

### Example

If Grand Total = 15,000,000 บาท (15 million):

```
A = 15 (actual cost)
B = 10 (lower threshold)
C = 20 (upper threshold)
D = 1.0259 (factor_f at 10M)
E = 1.0133 (factor_f at 20M)

Factor F = 1.0259 - ((1.0259 - 1.0133) × (15 - 10) / (20 - 10))
         = 1.0259 - (0.0126 × 0.5)
         = 1.0259 - 0.0063
         = 1.0196
```

---

## 5. Edge Cases

| Condition | Behavior |
|-----------|----------|
| cost ≤ 5 million | Use factor_f for 5 million (1.0537) |
| cost > max threshold | Use factor_f for max threshold |
| Exact match | Use exact factor_f, no interpolation |

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
| `components/boq/FactorFSummary.tsx` | `calculateInterpolatedFactor()` |

---

## References

- Calculation flow: [CALCULATION_RULES.md](./CALCULATION_RULES.md)
- VAT rules: [VAT_AND_TOTALS.md](./VAT_AND_TOTALS.md)
