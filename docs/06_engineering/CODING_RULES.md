# Coding Rules
## Conduit BOQ System

**Last Updated:** 2026-01-22  
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
