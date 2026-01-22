# VAT and Totals
## Conduit BOQ System

> **Status:** DRAFT – CANONICAL SKELETON  
> **Last Updated:** 2026-01-22

---

## 1. VAT Rate

**VAT is always 7%** — this is fixed and not configurable.

## 2. Total Calculations

```
Total with Factor F = Grand Total × Factor F
Total with VAT = Total with Factor F × 1.07
```

## 3. Example

| Field | Value |
|-------|-------|
| Grand Total | 1,000,000 บาท |
| Factor F | 1.0537 |
| Total with Factor F | 1,053,700 บาท |
| Total with VAT (7%) | 1,127,459 บาท |

---

## References
- Source: [legacy/ai/BOQ_CALCULATION_LOGIC.md](../legacy/ai/BOQ_CALCULATION_LOGIC.md)
