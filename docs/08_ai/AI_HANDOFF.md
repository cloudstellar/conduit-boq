# AI Handoff
## Conduit BOQ System

> **Status:** CANONICAL  
> **Last Updated:** 2026-01-22  
> **Source:** Consolidated from legacy HANDOFF.md, AI_CONTEXT.md

---

## 1. Quick Status

| Item | Status |
|------|--------|
| Phase 1 | ✅ v1.2.0 Complete |
| Phase 2 Roadmap | ✅ FROZEN |
| Documentation | ✅ Reorganized to 01-08 structure |
| Supabase Pro | ⏳ Pending upgrade |
| Phase 2A | ⏳ Ready after upgrade |

---

## 2. Reading Order

Before making ANY changes, read in this order:

| # | Doc | Location | Note |
|---|-----|----------|------|
| 1 | **Lessons Learned** | `08_ai/LESSONS_LEARNED.md` | **READ FIRST** |
| 2 | AI Handoff | `08_ai/AI_HANDOFF.md` | This file |
| 3 | Domain Rules | `03_domain/` | |
| 4 | Data Integrity | `04_data/` | |
| 5 | Tech Stack | `06_engineering/` | |
| 6 | Architecture | `02_architecture/` | |
| 7 | Calculation Rules | `05_calculation/` | |

---

## 3. Workflow Rules

### Plan → Confirm → Execute
1. **Plan:** Analyze, identify files, propose changes
2. **Confirm:** Present plan, wait for approval
3. **Execute:** Make changes after confirmation

---

## 4. Key Warnings

1. **Auth Deadlock** — use `setTimeout` in `onAuthStateChange`
2. **RLS is source of truth** — `lib/permissions.ts` is UI only
3. **Existing Copy BOQ** — currently copies snapshot prices

---

## 5. End-of-Session Protocol

Before ending:
1. Summarize what was done
2. List pending tasks
3. Document decisions made
4. Update this file if needed
5. Commit with descriptive message

---

## References
- Context: [AI_CONTEXT.md](./AI_CONTEXT.md)
- Task: [TASK_CHECKLIST.md](./TASK_CHECKLIST.md)
