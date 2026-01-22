# Documentation Migration Map
## NT Conduit BOQ — Canonical Documentation Structure

**Migration Date:** 2026-01-22  
**Status:** Complete (Skeleton Phase)

---

## Files Created

| Canonical File | Location |
|----------------|----------|
| DOMAIN_RULES.md | `/docs/canonical/DOMAIN_RULES.md` |
| DATA_INTEGRITY.md | `/docs/canonical/DATA_INTEGRITY.md` |
| CALCULATION_RULES.md | `/docs/canonical/CALCULATION_RULES.md` |
| TECH_STACK.md | `/docs/canonical/TECH_STACK.md` |
| ARCHITECTURE.md | `/docs/canonical/ARCHITECTURE.md` |
| AI_HANDOFF.md | `/docs/canonical/AI_HANDOFF.md` |

---

## Migration Mapping: Old → New

| Legacy File | Canonical Destination | Status |
|-------------|----------------------|--------|
| `docs/DATABASE_SCHEMA.md` | `docs/canonical/DATA_INTEGRITY.md` | ⚠️ Skeleton |
| `docs/TECHNICAL.md` | `docs/canonical/ARCHITECTURE.md` | ⚠️ Skeleton |
| `docs/ai/DOMAIN_MODEL.md` | `docs/canonical/DOMAIN_RULES.md` | ⚠️ Skeleton |
| `docs/ai/SYSTEM_ARCHITECTURE.md` | `docs/canonical/ARCHITECTURE.md` | ⚠️ Skeleton |
| `docs/ai/BOQ_CALCULATION_LOGIC.md` | `docs/canonical/CALCULATION_RULES.md` | ⚠️ Skeleton |
| `docs/ai/AI_CONTEXT.md` | `docs/canonical/AI_HANDOFF.md` | ⚠️ Skeleton |
| `docs/ai/HANDOFF.md` | `docs/canonical/AI_HANDOFF.md` | ⚠️ Skeleton |
| `docs/ai/PROJECT_CONTEXT.md` | `docs/canonical/DOMAIN_RULES.md` | ⚠️ Skeleton |

---

## Files NOT Migrated (Retained in Place)

| File | Reason |
|------|--------|
| `docs/README.md` | Index file, update links later |
| `docs/PRD.md` | Product doc, still authoritative |
| `docs/SECURITY.md` | Already concise, no duplication |
| `docs/KNOWLEDGE_BASE.md` | User guide, different audience |
| `docs/IMPLEMENTATION_PLAN.md` | Active planning doc |
| `docs/ai/ROADMAP.md` | Active planning doc |
| `docs/ai/PHASE2_PLAN.md` | Active planning doc (FROZEN) |
| `docs/ai/TASK_CHECKLIST.md` | Session-specific |
| `docs/ai/DECISIONS/*` | ADRs, referenced not absorbed |
| `migrations/README.md` | Migration-specific, referenced |

---

## Next Steps (Soft Absorb Phase)

When ready to complete migration:

1. **Copy content** from legacy files into canonical skeletons
2. **Replace TODO markers** with actual content
3. **Update cross-references** in remaining docs
4. **Test all links** in canonical files

---

## Ambiguities for Owner Review

| Item | Issue | Resolution Needed |
|------|-------|-------------------|
| **CODING_RULES.md** | Not created per original spec | Create later or merge into AI_HANDOFF? |
| **CHANGE_PROCESS.md** | Not created per original spec | Create later or keep in migrations/README? |
| **Soft absorb timing** | Skeletons have TODOs | When to populate full content? |

---

## Git History

All legacy files moved using `git mv` to preserve commit history.

```
git mv docs/DATABASE_SCHEMA.md docs/legacy/
git mv docs/TECHNICAL.md docs/legacy/
git mv docs/ai/DOMAIN_MODEL.md docs/legacy/ai/
git mv docs/ai/SYSTEM_ARCHITECTURE.md docs/legacy/ai/
git mv docs/ai/BOQ_CALCULATION_LOGIC.md docs/legacy/ai/
git mv docs/ai/AI_CONTEXT.md docs/legacy/ai/
git mv docs/ai/HANDOFF.md docs/legacy/ai/
git mv docs/ai/PROJECT_CONTEXT.md docs/legacy/ai/
```
