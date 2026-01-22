# Changelog
## NT Conduit BOQ Documentation

---

## [2026-01-22] Documentation Reorganization

### Added
- Created 01-08 numbered canonical folder structure
- Created `CANONICAL_ORDER.md` with mapping table
- Created `CHANGELOG.md` (this file)

### Structure Created
```
/docs
├── 01_overview/
├── 02_architecture/
│   └── ADR/
├── 03_domain/
├── 04_data/
├── 05_calculation/
├── 06_engineering/
├── 07_process/
├── 08_ai/
│   └── PROMPTS/
└── legacy/
```

### Migration Status
- Previous `/docs/canonical/` files being migrated to numbered structure
- Legacy files preserved in `/docs/legacy/`
- All original files retained for traceability

---

## [2026-01-22] Owner Decisions Applied

### Decisions
- **A1:** Version consistency — all docs updated to Next.js 16
- **B1:** Legacy BOQ access — documented as admin-only (RLS enforced)
- **C1:** "rejected" status — deferred to Phase 3
- **D1:** Procurement scope — clarified as approved-only

### Files Updated
- `README.md`, `docs/PRD.md` — version numbers
- `docs/SECURITY.md` — legacy access note
- `docs/ai/PROJECT_CONTEXT.md` — rejected status moved
- `docs/KNOWLEDGE_BASE.md` — procurement clarification
