# BOQ Calculation Logic
## Conduit BOQ System

**Last Updated:** 2026-01-19

---

## 1. Calculation Philosophy

The BOQ system calculates costs using a **bottom-up aggregation** approach:

```
Items → Routes → BOQ Total → Factor F → VAT → Final Total
```

### Core Principles

1. **Standard Prices**: All unit prices come from the official price list (518 items)
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

Factor F is looked up or interpolated from `factor_reference` table.

### Step 5: VAT Calculation

```
Total with VAT = Total with Factor F × 1.07
```

---

## 4. Factor F Lookup Logic

### Source Table: `factor_reference`

| cost_million | factor | factor_f |
|--------------|--------|----------|
| 5            | 1.2750 | 1.0537   |
| 10           | 1.2413 | 1.0259   |
| 20           | 1.2261 | 1.0133   |
| ...          | ...    | ...      |

### Lookup Rules

1. **Find lower bound**: Largest `cost_million` ≤ actual cost (in millions)
2. **Find upper bound**: Smallest `cost_million` > actual cost
3. **Interpolate** if between two values

### Interpolation Formula

```
Given:
  A = actual cost in millions
  B = lower threshold
  C = upper threshold
  D = factor at lower threshold
  E = factor at upper threshold

Interpolated Factor = D - ((D - E) × (A - B) / (C - B))
```

### Edge Cases

- If cost ≤ 5 million: Use factor for 5 million
- If cost > max threshold: Use factor for max threshold
- Round to 4 decimal places (floor)

---

## 5. Implementation Location

| Calculation | File | Function/Component |
|-------------|------|-------------------|
| Item totals | `app/boq/[id]/page.tsx` | Form submission handler |
| Route totals | `app/boq/[id]/page.tsx` | Form submission handler |
| Factor F lookup | `components/boq/FactorFSummary.tsx` | `calculateInterpolatedFactor()` |
| VAT | `components/boq/FactorFSummary.tsx` | Inline (`× 1.07`) |

---

## 6. Stored vs Calculated Values

| Field | Stored in DB | Calculated on Display |
|-------|--------------|----------------------|
| Item costs | ✅ | - |
| Route totals | ✅ (in BOQ header) | Also recalculated |
| Grand total | ✅ | Also recalculated |
| Factor F value | ✅ | Also from lookup |
| Total with Factor F | ✅ | Also recalculated |
| Total with VAT | ✅ | Also recalculated |

**Note:** Values are stored for historical reference but may be recalculated for display to reflect current Factor F rates.

---

## 7. Validation Rules

1. **Quantity**: Must be > 0
2. **Unit costs**: From price list, not editable
3. **Factor F**: Auto-selected, not editable
4. **VAT**: Fixed at 7%, not editable
5. **Totals**: Auto-calculated, not editable

