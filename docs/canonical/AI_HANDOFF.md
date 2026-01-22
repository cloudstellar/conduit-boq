# AI Handoff
## Conduit BOQ System — Canonical Reference

**Last Updated:** 2026-01-22  
**Status:** Canonical  
**Source:** Migrated from `docs/ai/HANDOFF.md`, `docs/ai/AI_CONTEXT.md`, `docs/ai/TASK_CHECKLIST.md`

---

## 1. Quick Status

> **Source:** [HANDOFF.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/HANDOFF.md)

| Item | Status |
|------|--------|
| Phase 1 | ✅ v1.2.0 Complete |
| Phase 2 Roadmap | ✅ FROZEN |
| Documentation | ✅ Migrated to canonical structure |
| Supabase Pro | ⏳ Pending upgrade |
| Phase 2A | ⏳ Ready after upgrade |

---

## 2. Reading Order

> **Source:** [AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md) Section "Mandatory Reading Order"

Before making ANY changes, read in this order:

1. **AI_HANDOFF.md** (this file) — Current state
2. **DOMAIN_RULES.md** — Business logic
3. **DATA_INTEGRITY.md** — Schema, RLS
4. **TECH_STACK.md** — Versions, dependencies
5. **ARCHITECTURE.md** — System structure
6. **CALCULATION_RULES.md** — BOQ math

---

## 3. Workflow Rules

> **Source:** [AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md) Section "Workflow Rules"

### Plan → Confirm → Execute
1. **Plan:** Analyze, identify files, propose changes
2. **Confirm:** Present plan, wait for approval
3. **Execute:** Make changes after confirmation

---

## 4. Forbidden Actions

> **Source:** [AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md) Section "Forbidden Actions"

Without explicit permission:
- Git push/merge/rebase
- Production deployments
- Database migrations on production
- Adding/removing npm packages
- Deleting files

---

## 5. Critical Patterns

> **Source:** [AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md) Section "Critical Patterns"

### Auth Deadlock Prevention
```typescript
// ✅ CORRECT
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => { handleSession(session) }, 0)
})
```

### RLS is Source of Truth
- `can()` function = UI only
- RLS policies = actual security

---

## 6. Key Warnings

> **Source:** [HANDOFF.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/HANDOFF.md) Section "Watch Out For"

1. **Existing Copy BOQ** — currently copies snapshot prices
2. **Auth Deadlock** — use `setTimeout` in `onAuthStateChange`
3. **RLS is source of truth** — `lib/permissions.ts` is UI only

---

## 7. End-of-Session Protocol

> **Source:** [AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md) Section "End-of-Session Protocol"

Before ending:
1. Summarize what was done
2. List pending tasks
3. Document decisions made
4. Update this file if needed
5. Commit with descriptive message

---

## References

- Original: [docs/ai/HANDOFF.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/HANDOFF.md)
- Original: [docs/ai/AI_CONTEXT.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/AI_CONTEXT.md)
- Original: [docs/ai/TASK_CHECKLIST.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/TASK_CHECKLIST.md)
