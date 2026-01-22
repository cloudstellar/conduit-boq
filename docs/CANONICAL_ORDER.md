# Canonical Order
## NT Conduit BOQ Documentation Structure

**Last Updated:** 2026-01-22  
**Status:** DRAFT – Establishing canonical structure

---

## Reading Order (01 → 08)

| # | Folder | Purpose | Start Here |
|---|--------|---------|------------|
| 01 | `01_overview/` | Product vision, roadmap, implementation | ✅ New users |
| 02 | `02_architecture/` | System layers, decisions | Developers |
| 03 | `03_domain/` | Business rules, entities | Domain experts |
| 04 | `04_data/` | Schema, RLS, migrations | DB engineers |
| 05 | `05_calculation/` | BOQ math, Factor F, VAT | Calculation logic |
| 06 | `06_engineering/` | Tech stack, coding rules | Implementation |
| 07 | `07_process/` | Change process, releases | Operations |
| 08 | `08_ai/` | AI handoff, context | AI agents |

---

## Document Mapping Table

### Original → Target Mapping

| Original Path | Primary Topic | Target Folder | Canonical File |
|---------------|---------------|---------------|----------------|
| `docs/README.md` | Docs index | Root | `README.md` (update) |
| `docs/PRD.md` | Product requirements | `01_overview/` | `PRD.md` |
| `docs/IMPLEMENTATION_PLAN.md` | Phase overview | `01_overview/` | `IMPLEMENTATION_PLAN.md` |
| `docs/KNOWLEDGE_BASE.md` | User guide | `01_overview/` | `KNOWLEDGE_BASE.md` |
| `docs/SECURITY.md` | Access model | `04_data/` | `SECURITY_MODEL.md` |
| `docs/ai/ROADMAP.md` | Phase roadmap | `01_overview/` | `ROADMAP.md` |
| `docs/ai/PHASE2_PLAN.md` | Phase 2 details | `07_process/` | `PHASE_GUARDRAILS.md` |
| `docs/ai/DECISIONS/ADR-001-*.md` | RLS decision | `02_architecture/ADR/` | `ADR-001-*.md` |
| `docs/legacy/DATABASE_SCHEMA.md` | Schema reference | `04_data/` | `DATABASE_SCHEMA.md` |
| `docs/legacy/TECHNICAL.md` | Developer guide | `02_architecture/` | `SYSTEM_LAYERS.md` |
| `docs/legacy/ai/DOMAIN_MODEL.md` | Entity model | `03_domain/` | `DOMAIN_MODEL.md` |
| `docs/legacy/ai/SYSTEM_ARCHITECTURE.md` | Architecture | `02_architecture/` | `ARCHITECTURE.md` |
| `docs/legacy/ai/BOQ_CALCULATION_LOGIC.md` | Calculation | `05_calculation/` | `CALCULATION_RULES.md` |
| `docs/legacy/ai/AI_CONTEXT.md` | AI rules | `08_ai/` | `AI_CONTEXT.md` |
| `docs/legacy/ai/HANDOFF.md` | Session state | `08_ai/` | `AI_HANDOFF.md` |
| `docs/legacy/ai/PROJECT_CONTEXT.md` | Business context | `03_domain/` | `DOMAIN_RULES.md` |
| `docs/canonical/*` | Previous migration | Superseded | → New 01-08 structure |

---

## Canonical Files per Folder

### 01_overview/
- [ ] `PROJECT_OVERVIEW.md` — NEW
- [ ] `PRD.md` ← docs/PRD.md
- [ ] `ROADMAP.md` ← docs/ai/ROADMAP.md
- [ ] `IMPLEMENTATION_PLAN.md` ← docs/IMPLEMENTATION_PLAN.md
- [ ] `KNOWLEDGE_BASE.md` ← docs/KNOWLEDGE_BASE.md

### 02_architecture/
- [ ] `ARCHITECTURE.md` ← legacy/ai/SYSTEM_ARCHITECTURE.md
- [ ] `SYSTEM_LAYERS.md` ← legacy/TECHNICAL.md
- [ ] `ADR/ADR-001-supabase-rls-authorization.md` ← docs/ai/DECISIONS/

### 03_domain/
- [ ] `DOMAIN_RULES.md` ← legacy/ai/PROJECT_CONTEXT.md
- [ ] `DOMAIN_MODEL.md` ← legacy/ai/DOMAIN_MODEL.md
- [ ] `ACCESS_MODEL.md` — NEW (from SECURITY.md roles)

### 04_data/
- [ ] `DATA_INTEGRITY.md` — NEW (summary)
- [ ] `DATABASE_SCHEMA.md` ← legacy/DATABASE_SCHEMA.md
- [ ] `SECURITY_MODEL.md` ← docs/SECURITY.md
- [ ] `MIGRATIONS.md` — NEW (from migrations/README.md)

### 05_calculation/
- [ ] `CALCULATION_RULES.md` ← legacy/ai/BOQ_CALCULATION_LOGIC.md
- [ ] `FACTOR_F.md` — NEW (extracted section)
- [ ] `VAT_AND_TOTALS.md` — NEW (extracted section)

### 06_engineering/
- [ ] `TECH_STACK.md` ← canonical/TECH_STACK.md
- [ ] `CODING_RULES.md` — NEW
- [ ] `PERMISSION_PATTERNS.md` — NEW (from lib/permissions.ts docs)

### 07_process/
- [ ] `CHANGE_PROCESS.md` — NEW
- [ ] `RELEASE_PROCESS.md` — NEW
- [ ] `PHASE_GUARDRAILS.md` ← docs/ai/PHASE2_PLAN.md

### 08_ai/
- [ ] `AI_HANDOFF.md` ← legacy/ai/HANDOFF.md
- [ ] `AI_CONTEXT.md` ← legacy/ai/AI_CONTEXT.md
- [ ] `TASK_CHECKLIST.md` ← docs/ai/TASK_CHECKLIST.md
- [ ] `PROMPTS/` — NEW folder for reusable prompts

---

## Files to Remain in Place

| File | Reason |
|------|--------|
| `docs/README.md` | Update with new structure |
| `docs/MIGRATION_MAP.md` | Historical reference |
| `migrations/README.md` | Migration-specific |

---

## Previous /docs/canonical/ → New Structure

The previous `/docs/canonical/` folder will be absorbed:

| Previous Canonical | New Location |
|-------------------|--------------|
| `canonical/TECH_STACK.md` | `06_engineering/TECH_STACK.md` |
| `canonical/ARCHITECTURE.md` | `02_architecture/ARCHITECTURE.md` |
| `canonical/DOMAIN_RULES.md` | `03_domain/DOMAIN_RULES.md` |
| `canonical/DATA_INTEGRITY.md` | `04_data/DATA_INTEGRITY.md` |
| `canonical/CALCULATION_RULES.md` | `05_calculation/CALCULATION_RULES.md` |
| `canonical/AI_HANDOFF.md` | `08_ai/AI_HANDOFF.md` |
