# AI Context
## Mandatory Reading for AI Agents

> **Status:** CANONICAL  
> **Last Updated:** 2026-01-22  
> **Source:** Migrated from legacy AI_CONTEXT.md

---

## 1. Forbidden Actions

Without explicit permission:
- Git push/merge/rebase
- Production deployments
- Database migrations on production
- Adding/removing npm packages
- Deleting files

## 2. Critical Patterns

### Auth Deadlock Prevention
```typescript
// ✅ CORRECT - Use setTimeout
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => { handleSession(session) }, 0)
})
```

### RLS is Source of Truth
- `can()` function = UI only
- RLS policies = actual security

## 3. Source of Truth Mapping

| Topic | Canonical Location |
|-------|--------------------|
| Business requirements | `01_overview/PRD.md` |
| Domain entities | `03_domain/DOMAIN_MODEL.md` |
| Database schema | `04_data/DATABASE_SCHEMA.md` |
| Calculation logic | `05_calculation/CALCULATION_RULES.md` |
| Permissions | `06_engineering/PERMISSION_PATTERNS.md` |
| Tech stack | `06_engineering/TECH_STACK.md` |
| Roadmap | `01_overview/ROADMAP.md` |

## 4. Quality Checklist

Before completing any task:
- [ ] Code compiles without errors
- [ ] Changes match existing code style
- [ ] No hardcoded values
- [ ] Error handling present
- [ ] User-facing text in Thai
- [ ] Documentation updated

---

## References
- Handoff: [AI_HANDOFF.md](./AI_HANDOFF.md)
