# Documentation Migration Map
## NT Conduit BOQ — Canonical Documentation Structure

**Migration Date:** 2026-01-22  
**Status:** Complete (Skeleton Phase)

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

> **Historical navigation note (2026-10-14):** this is the 2026-01-22
> documentation-move record, not a database migration ledger or current task
> list. The former `docs/canonical/` structure and “active/authoritative” labels
> below are retained chronology. Use the [Documentation Index](./README.md),
> [AI Handoff](./08_ai/AI_HANDOFF.md) and [Integrated Roadmap #09](./plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
> for present navigation/planning; database history is in [Migration Ledger](./04_data/MIGRATIONS.md).
> No file move, cleanup, migration or implementation is authorized by this map.

---

The recorded application succession A (`a3114fc`) → B (`42e01c5`) → L1
(`b1ce449`) is release chronology, not a reason to execute this old file-move
plan. Database031 belongs to [Migrations](./04_data/MIGRATIONS.md); documentation
convergence neither moves protected evidence nor applies migrations.

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
