# Coding Rules
## Conduit BOQ System

**Last Updated:** 2026-05-30  
**Status:** Canonical

---

## 1. Forbidden Actions

Without explicit owner permission, DO NOT:

| Category | ❌ Forbidden Actions |
|----------|---------------------|
| **Git** | push, merge, rebase |
| **Deployment** | Production deploys |
| **Database** | Migrations on production |
| **Dependencies** | Add/remove npm packages |
| **Files** | Delete any files |

---

## 2. Critical Patterns

### 2.1 Auth Deadlock Prevention

> [!CAUTION]
> Making async Supabase calls inside `onAuthStateChange` will cause a deadlock!

```typescript
// ❌ WRONG - Will hang forever
supabase.auth.onAuthStateChange(async (event, session) => {
  const { data } = await supabase.from('user_profiles').select() // HANGS!
})

// ✅ CORRECT - Use setTimeout
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => {
    handleSession(session)
  }, 0)
})
```

**Why?** The callback blocks while waiting for async operations. If those operations need the callback to complete first, you get a deadlock.

### 2.2 RLS is Source of Truth

```typescript
// ✅ Client-side check for UI display
if (can(user, 'update', 'boq', context)) {
  showEditButton()
}

// ✅ BUT actual security is enforced by RLS
// Even if can() returns true, RLS will block unauthorized access
```

### 2.3 Float Precision Safety (v1.6.2)

> [!CAUTION]
> **Never use raw `*` multiplication for financial math.** IEEE 754 floating-point arithmetic can silently produce incorrect results (e.g., `0.1 * 0.2 === 0.020000000000000004`).

**Required:** Use the safe multiplication functions from `lib/calculation.ts`:

| Function | Use Case |
|----------|----------|
| `multiplyFactor()` | Multiply a value by Factor F |
| `safeItemCalc()` | Calculate a single BOQ item's cost (quantity × unit price) |
| `safeMul()` | General-purpose safe multiplication |

```typescript
// ❌ WRONG - raw multiplication
const cost = quantity * unitPrice;
const withFactor = grandTotal * factorF;

// ✅ CORRECT - safe functions
const cost = safeItemCalc(quantity, unitPrice);
const withFactor = multiplyFactor(grandTotal, factorF);
```

> [!NOTE]
> **Addition and subtraction are safe** — they do not suffer from the same class of floating-point errors as multiplication. You do not need safe wrappers for `+` or `-` operations.

### 2.4 BOQ Item Sort Order (v1.6.3)

> [!IMPORTANT]
> BOQ items must be sorted by **`category` (natural sort) FIRST**, then by **`item_order`** within the same category. This applies to the MultiRouteEditor, print page, and Excel export.

```typescript
// Sort by category (natural/numeric sort), then by item_order within category
items.sort((a, b) => {
  const catCmp = a.category.localeCompare(b.category, undefined, { numeric: true });
  if (catCmp !== 0) return catCmp;
  return a.item_order - b.item_order;
});
```

**Why natural sort for category?** Categories like `"1"`, `"2"`, `"10"` must sort as 1 → 2 → 10, not the lexicographic 1 → 10 → 2. The `{ numeric: true }` option in `localeCompare` handles this correctly.

**Why `item_order` second?** The `item_order` field is derived from `item_code` numbers in the `price_list` table (via foreign key), not from user-defined display order. Sorting by `item_order` within a category preserves the price-list sequence.

---

## 3. Code Style

### Language
- **Code:** English
- **Comments:** English
- **User-facing text:** Thai
- **Technical docs:** English

### TypeScript
- Use strict mode
- No `any` unless unavoidable
- Prefer interfaces over types

### File Structure
```
app/           # Next.js pages
components/    # React components
lib/           # Utilities and hooks
  hooks/       # Custom React hooks
  supabase/    # Supabase clients
  permissions.ts
```

---

## 4. Pre-Code Checklist

Before writing code:
- [ ] Read existing code in the area
- [ ] Check for existing patterns to follow
- [ ] Verify database schema assumptions
- [ ] Identify all files that need changes

---

## 5. Post-Code Checklist

After writing code:
- [ ] Code compiles without TypeScript errors
- [ ] Matches existing code style
- [ ] No hardcoded values
- [ ] Error handling present
- [ ] User-facing text in Thai
- [ ] Documentation updated if needed

---

## References

- Tech Stack: [TECH_STACK.md](./TECH_STACK.md)
- Architecture: [02_architecture/ARCHITECTURE.md](../02_architecture/ARCHITECTURE.md)
