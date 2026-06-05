# Calculation Rules
## Conduit BOQ System

**Last Updated:** 2026-06-05
**Status:** Canonical

---

## 1. Calculation Philosophy

The BOQ system calculates costs using a **bottom-up aggregation** approach:

```
Items → Routes → BOQ Total → Factor F → VAT → Final Total
```

### Core Principles

1. **Standard Prices**: All unit prices come from the official price list (710 items: base 682 + PN6 28)
2. **Separation of Costs**: Material and labor costs are tracked separately
3. **Factor F**: A multiplier that accounts for overhead, profit, and interest
4. **VAT**: Always 7% on top of Factor F-adjusted total
5. **No Manual Overrides**: Calculations are automatic, not editable

---

## 2. Calculation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         BOQ                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Grand Total = Σ(Route Totals)                         │ │
│  │ Total with Factor F = Grand Total × Factor F          │ │
│  │ Total with VAT = Total with Factor F × 1.07           │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ▲                                 │
│                           │                                 │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │                    ROUTE 1                           │   │
│  │  Route Total = Σ(Item Totals in Route)               │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Item 1: qty × (material + labor) = item_total   │ │   │
│  │  │ Item 2: qty × (material + labor) = item_total   │ │   │
│  │  │ ...                                              │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    ROUTE 2                            │   │
│  │  (same structure)                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Calculation

### Step 1: Item Level

For each item in a route:

```
Material Total = Quantity × Material Cost per Unit
Labor Total    = Quantity × Labor Cost per Unit
Item Total     = Material Total + Labor Total
```

**Example:**
- Item: ท่อ PVC ขนาด 100 มม.
- Quantity: 100 เมตร
- Material Cost: 150 บาท/เมตร
- Labor Cost: 50 บาท/เมตร

```
Material Total = 100 × 150 = 15,000 บาท
Labor Total    = 100 × 50  = 5,000 บาท
Item Total     = 15,000 + 5,000 = 20,000 บาท
```

### Step 2: Route Level

Sum all items in the route:

```
Route Material Total = Σ(Item Material Totals)
Route Labor Total    = Σ(Item Labor Totals)
Route Total          = Route Material Total + Route Labor Total
```

### Step 3: BOQ Level (Grand Total)

Sum all routes:

```
Grand Material Total = Σ(Route Material Totals)
Grand Labor Total    = Σ(Route Labor Totals)
Grand Total          = Grand Material Total + Grand Labor Total
```

### Step 4: Factor F Application

```
Total with Factor F = Grand Total × Factor F
```

Factor F is read from `factor_reference.factor`, the **"รวมในรูป Factor"**
column, then looked up or interpolated from the loaded reference rows. The
system does not use `factor_reference.factor_f` as the main BOQ multiplier.

### Step 5: VAT Calculation

```
Total with VAT = Total with Factor F × 1.07
```

> **VAT is always 7%** — this is fixed and not configurable.

### Rounding Rules

| ขั้นตอน | หลักเกณฑ์ |
|---------|-----------|
| **Factor F** | Truncate (ตัดทิ้ง) เหลือ 4 ทศนิยม |
| **ค่าก่อน VAT** | ปัดเป็น 2 ทศนิยม (standard rounding) |
| **VAT 7%** | ปัดตามหลักกรมสรรพากร: ทศนิยมตำแหน่งที่ 3 < 5 ปัดทิ้ง, ≥ 5 ปัดขึ้น |
| **รวม VAT** | **ก่อน VAT (ปัดแล้ว) + VAT (ปัดแล้ว)** — ไม่คำนวณใหม่ |

> [!IMPORTANT]
> **กุญแจสำคัญ**: ต้องปัดทุกขั้นตอนก่อน แล้วนำค่าที่ปัดแล้วมาบวกกัน — ไม่ใช่บวก raw แล้วค่อยปัด

### Float Precision Safety (v1.6.2)

> [!CAUTION]
> **ห้ามใช้ `*` (JavaScript multiplication operator) ดิบกับตัวเลขเงิน/ราคาโดยเด็ดขาด**
>
> JavaScript ใช้ IEEE 754 double-precision ซึ่งทำให้ผลคูณทศนิยมเพี้ยนได้:
> ```
> 2,738,389 × 1.275 → JS ได้ 3,491,445.9749999996 (ควรเป็น .975)
> ```
>
> Excel ซ่อนปัญหานี้โดยปัดเหลือ 15 significant digits ก่อนแสดงผล
> แต่ในโค้ดของเรา ค่าที่เพี้ยนจะถูกส่งต่อไปให้ roundMoney() ทำให้ปัดผิดทิศทาง

**ทุกการคูณทศนิยมต้องผ่านฟังก์ชัน safe multiplication ใน `lib/calculation.ts`:**

| ฟังก์ชัน | ใช้สำหรับ | Decimal Precision |
|---|---|---|
| `safeMul(a, b, aDP, bDP)` | ฟังก์ชันแกนกลาง (internal) | กำหนดเอง |
| `multiplyFactor(cost, factor)` | ค่างาน × Factor F | 2dp × 4dp |
| `safeItemCalc(qty, unitCost)` | ปริมาณ × ราคาต่อหน่วย | 2dp × 2dp |
| `roundMoney(value)` | ปัดเศษ 2 ทศนิยม | exponential notation |

**หลักการทำงาน**: แปลงตัวเลขเป็นจำนวนเต็มก่อนคูณ แล้วหารกลับ → ไม่มี float error

**การบวก/ลบ** ไม่มีปัญหา float precision ไม่ต้องใช้ safe function

---

## 4. Implementation Location

| Calculation | File | Function |
|-------------|------|----------|
| Safe multiplication (core) | `lib/calculation.ts` | `safeMul()` |
| Item totals (qty × price) | `components/boq/MultiRouteEditor.tsx` | `safeItemCalc()` |
| Factor F multiplication | `lib/calculation.ts` | `multiplyFactor()` |
| VAT calculation | `lib/calculation.ts` | `calculateVAT()` → `safeMul()` |
| Rounding | `lib/calculation.ts` | `roundMoney()` |
| Route allocation | `lib/calculation.ts` | `allocateToRoutes()` |
| Factor F lookup/interpolation | `lib/factorF.ts` | `calculateInterpolatedFactorFromRefs()` |
| Factor F snapshot validation | `lib/factorF.ts` | `isFactorSnapshotUsable()` |
| Factor F live edit display | `components/boq/FactorFSummary.tsx` | Load reference rows once, then calculate locally |

---

## 5. Stored vs Calculated Values

| Field | Stored in DB | Calculated on Display |
|-------|--------------|----------------------|
| Item costs | ✅ | - |
| Route totals | ✅ (in BOQ header) | Also recalculated |
| Grand total | ✅ | Also recalculated |
| Factor F value | ✅ | Live lookup only while editing, or fallback for legacy/invalid snapshot |
| Total with Factor F | ✅ | Live calculation while editing; print/export use valid snapshot |
| Total with VAT | ✅ | Live calculation while editing; print/export use valid snapshot |

> **Note:** Stored Factor F snapshots are the historical source for print and
> export when they are valid. Live Factor F lookup is used on the edit page and
> only as a fallback for legacy or invalid snapshots.

> [!IMPORTANT]
> There is no silent default Factor F fallback. If `factor_reference` cannot be
> read, or if a nonzero BOQ total cannot be mapped to a Factor F row, the UI,
> print, and export flows must show an error instead of substituting the 5M
> factor value.

---

## 6. Validation Rules

1. **Quantity**: Must be > 0
2. **Unit costs**: From price list, not editable
3. **Factor F**: Auto-selected, not editable
4. **VAT**: Fixed at 7%, not editable
5. **Totals**: Auto-calculated, not editable

---

## References

- Factor F details: [FACTOR_F.md](./FACTOR_F.md)
- VAT rules: [VAT_AND_TOTALS.md](./VAT_AND_TOTALS.md)
- Original: [docs/legacy/ai/BOQ_CALCULATION_LOGIC.md](../legacy/ai/BOQ_CALCULATION_LOGIC.md)
