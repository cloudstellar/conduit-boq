# Lessons Learned

## shadcn/ui Migration (2026-01-31)

### ⚠️ Radix Select: Empty Value Not Allowed

**Bug:** Migrated `<select>` with empty option `<option value="">` to shadcn `<SelectItem value="">` caused client-side crash.

**Cause:** Radix UI Select **does not allow empty string** as `value` prop. TypeScript doesn't catch this because `value: string` is technically valid.

**Fix:** Use sentinel value pattern:

```tsx
// ❌ BAD - will crash
<SelectItem value="">ทั้งหมด</SelectItem>

// ✅ GOOD - use sentinel
const selectValue = selectedCategory || '__ALL__';
const handleChange = (value: string) => {
  setSelectedCategory(value === '__ALL__' ? '' : value);
};

<Select value={selectValue} onValueChange={handleChange}>
  <SelectItem value="__ALL__">ทั้งหมด</SelectItem>
</Select>
```

**Prevention:**
1. Always test interactive components after migration, not just run build
2. Search for `value=""` after shadcn Select migration
3. Reference: [Radix UI Select Issue](https://github.com/radix-ui/primitives/issues/1569)

---

### ✅ Best Practices Confirmed

| Pattern | Status |
|---------|--------|
| `cn()` utility for class merging | ✅ Working |
| lucide-react icons | ✅ Working |
| Dialog for modals | ✅ Working |
| Command for autocomplete | ✅ Working |
| Tabs for route switching | ✅ Working |

---

*Last updated: 2026-01-31*

---

## Session 2026-02-01: Factor F Snapshot & BOQ List UX

### ⚠️ React Hooks: No Hooks After Early Return

**Bug:** Added `useEffect` after `if (isLoading) return <Loading />` which caused client-side exception.

**Cause:** React hooks rules require all hooks to be called unconditionally before any early returns.

**Fix:**
```tsx
// ❌ BAD - hook after early return
export function Component() {
  if (isLoading) return <Loading />; // early return
  
  useEffect(() => {...}, [deps]); // ❌ CRASH
}

// ✅ GOOD - all hooks before early returns
export function Component() {
  const value = calculateValue();
  
  useEffect(() => {...}, [deps]); // ✅ hooks first
  
  if (isLoading) return <Loading />; // early return after hooks
}
```

**Prevention:** When adding hooks, always verify they're before any conditional returns.

---

### ⚠️ PostgreSQL Functions: Must Replace Entire Function

**Issue:** Wanted to add 3 fields to RPC but had to provide entire function.

**Cause:** PostgreSQL doesn't support partial function updates - must use `CREATE OR REPLACE FUNCTION` with complete function body.

**Lesson:** For small changes to Supabase RPCs, still need full function definition. Keep RPC definitions documented or in migration files.

---

### ✅ Factor F Snapshotting Decision

**Decision:** Store `factor_f`, `total_with_factor_f`, `total_with_vat` at save time, not calculated realtime.

**Rationale:**
- Historical accuracy - if factor_reference table changes, old BOQs shouldn't change
- Performance - no need to recalculate on list view
- Audit trail - know exact values at time of creation

**Implementation:**
1. `FactorFSummary.tsx` - `onFactorCalculated` callback
2. `MultiRouteEditor.tsx` - passes callback through
3. `edit/page.tsx` - receives values, includes in `boqData`
4. RPC `save_boq_with_routes` - updated to save 3 new fields

---

### ✅ BOQ List Table: UX Decisions

| Decision | Rationale |
|----------|-----------|
| Route column → Badge "N เส้นทาง" | Table clutter reduction; click to see full list |
| Badge → Dialog for route details | Clean pattern: summary in table, details on demand |
| "ก่อน VAT" column | More meaningful than raw total_cost; shows post-Factor F amount |
| Actions column on right | Standard position; easier to find |
| Actions as icon buttons | Save space; tooltips for clarity |
| Estimator full name visible | line-clamp-2; shows complete info |
| Project name line-clamp-4 | Balance between visibility and space |

---

*Last updated: 2026-02-01*
