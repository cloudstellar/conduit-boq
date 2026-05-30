# VAT and Totals
## Conduit BOQ System

**Last Updated:** 2026-05-30  
**Status:** Canonical

---

## 1. VAT Rate

**VAT is always 7%** — this is fixed and not configurable.

The rate is applied uniformly across all BOQ calculations. There is no per-project or per-route override.

---

## 2. Calculation Flow

The total for any BOQ (or route within a BOQ) follows a strict three-step pipeline:

```
Grand Total × Factor F = beforeVAT
beforeVAT × 0.07      = VAT
beforeVAT + VAT        = total
```

| Step | Formula | Example (Grand Total = 1,234,567.89, Factor F = 1.1545) |
|------|---------|----------------------------------------------------------|
| 1. Before VAT | `grandTotal × factorF` | 1,234,567.89 × 1.1545 = **1,425,302.63** |
| 2. VAT | `beforeVAT × 0.07` | 1,425,302.63 × 0.07 = **99,771.18** |
| 3. Total | `beforeVAT + VAT` | 1,425,302.63 + 99,771.18 = **1,525,073.81** |

Each intermediate value is **rounded to 2 decimal places** before proceeding to the next step (see Section 3).

---

## 3. Rounding Rules

### 3.1 The `roundMoney()` Function

All monetary rounding uses the **exponential notation** technique to avoid floating-point drift:

```typescript
function roundMoney(value: number): number {
  return Number(Math.round(Number(value + 'e2')) + 'e-2');
}
```

**Why exponential notation?** Standard `Math.round(value * 100) / 100` can produce incorrect results due to IEEE 754 floating-point representation. For example, `Math.round(1.005 * 100)` yields `100` instead of `101`. The exponential notation approach (`Number(value + 'e2')`) shifts the decimal without multiplication, avoiding this class of errors.

### 3.2 The Round-Then-Add Principle

> [!CAUTION]
> **Never add raw (unrounded) values then round at the end.** Always round each step BEFORE adding.

**Bad** — rounding drift accumulates:
```typescript
// ❌ WRONG: raw addition then single round
const total = roundMoney(beforeVAT + vat);
```

**Good** — each value is independently rounded:
```typescript
// ✅ CORRECT: round each value first, then add rounded values
const roundedBeforeVAT = roundMoney(grandTotal * factorF);
const roundedVAT = roundMoney(roundedBeforeVAT * 0.07);
const total = roundMoney(roundedBeforeVAT + roundedVAT);
```

This ensures that any sub-totals printed or stored will always add up to the final total shown.

---

## 4. Remainder Allocation for Multi-Route BOQs

When a BOQ has multiple routes, each route gets its own `beforeVAT`, `vat`, and `total` breakdown. The sum of these per-route values **must equal** the grand-level values exactly. The `allocateToRoutes()` function guarantees this using the **remainder allocation technique**:

### 4.1 Algorithm

1. **Calculate the authoritative grand total** from the sum of all route costs (raw, unrounded).
2. **Round each individual route's** `beforeVAT`, `vat`, and `total` using `roundMoney()`.
3. **Sum the rounded route values** and compare against the authoritative grand total.
4. **Adjust the LAST route** to absorb any rounding difference (penny remainder).
5. This guarantees that `Σ route.total === grandTotal` exactly.

### 4.2 Example

Given 3 routes with raw `beforeVAT` values that round individually:

| Route | Raw beforeVAT | Rounded beforeVAT |
|-------|---------------|--------------------|
| Route A | 100,000.333... | 100,000.33 |
| Route B | 200,000.666... | 200,000.67 |
| Route C | 50,000.111... | 50,000.11 |
| **Sum of rounded** | — | **350,001.11** |
| **Authoritative Grand** | 350,001.11... | **350,001.11** |

If the sum of individually rounded values is `350,001.11` but the authoritative rounded grand total is `350,001.11`, no adjustment is needed. If they differ by `0.01`, Route C's value is adjusted by `±0.01` to compensate.

### 4.3 Why the Last Route?

The last route is chosen as the adjustment target because:
- Only one route ever needs adjustment (the remainder is at most ±0.01 per field).
- The last route is a simple, deterministic choice — no ambiguity.
- The adjustment is invisible in practice (one penny on a large value).

---

## 5. Implementation

| Function | File | Purpose |
|----------|------|---------|
| `roundMoney()` | `lib/calculation.ts` | Round to 2 decimal places using exponential notation |
| `calculateVAT()` | `lib/calculation.ts` | Apply 7% VAT to a given `beforeVAT` value |
| `allocateToRoutes()` | `lib/calculation.ts` | Distribute grand totals across routes with remainder adjustment |

---

## References

- Calculation Engine: [`lib/calculation.ts`](../../lib/calculation.ts)
- Multi-Route Architecture: [MULTI_ROUTE_ARCHITECTURE.md](../03_features/MULTI_ROUTE_ARCHITECTURE.md)
- Coding Rules (Float Safety): [CODING_RULES.md](../06_engineering/CODING_RULES.md#23-float-precision-safety-v162)
