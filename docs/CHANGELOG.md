# Changelog
## NT Conduit BOQ Documentation

---

## [v1.5.0] - 2026-03-17 (Factor F Supplement Page)

### 📄 Document Printing
- **Factor F Supplement Page**: Added a new final page to the print output showing the exact formula, variables, and calculation steps for Factor F interpolation.
- **Space Optimization**: Removed redundant Factor F conditions from individual item page footers to allow more rows per page. Conditions now only show on the summary page.

### 💾 Data & Calculation
- **Factor F Snapshots**: Added 5 new snapshot columns (`factor_f_raw`, `factor_f_lower_cost`, `factor_f_upper_cost`, `factor_f_lower_value`, `factor_f_upper_value`) to preserve exact interpolation variables at the time of BOQ creation.
- **Fallback Logic**: For legacy BOQs without snapshots, the system dynamically queries the `factor_reference` table during printing to construct the calculation page.
- **RPC Update**: Updated `save_boq_with_routes` to persist the new snapshot columns securely.

### 🎨 UX Improvements
- **Quick Print**: Added a "Print" button immediately next to the primary "Save" button in the BOQ editor for faster workflow.
- **Global Cursors**: Enforced `cursor: pointer` globlally on all buttons and interactive elements.

---

## [v1.4.0] - 2026-02-01 (shadcn/ui Migration Complete)

### 🎨 UI/UX Improvements

#### shadcn/ui Integration
- Migrated to shadcn/ui component library (Button, Card, Input, Table, Dialog, etc.)
- Professional design tokens with consistent styling
- Improved accessibility and keyboard navigation

#### Multi-Route Editor
- **Custom Collapsible Sidebar** replacing shadcn Sidebar (fixed positioning issue)
  - Collapsed width: 64px (route numbers as circled badges)
  - Expanded width: 240px (full route names)
  - State persistence via localStorage
  - Smooth transition animation (duration-300)
- Sticky header with toggle button + route context
- Route total summary always visible in header

#### BOQ List Table
- 7-column optimized layout
- Route badge with click-to-expand dialog
- "ก่อน VAT" column using snapshotted `total_with_factor_f`
- Icon action buttons (View, Edit, Print, Delete)

### 🔧 Technical Improvements

#### Factor F Snapshotting
- Factor values (factor_f, total_with_factor_f, total_with_vat) now saved at BOQ creation
- Historical accuracy preserved even when Factor F rates change

#### Component Architecture
- New `RouteBadge.tsx` component for route count display
- Improved props typing with TypeScript

### 📌 Migration Tags
- `v1.2.1-shadcn-phase1` → Phase 1 complete
- `v1.2.1-shadcn-phase2` → Phase 2 complete
- `v1.2.1-shadcn-done` → All migration complete
- `v1.3.0` → Factor F snapshotting
- `v1.4.0` → Custom collapsible sidebar + final polish

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
