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
