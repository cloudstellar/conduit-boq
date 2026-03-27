# Changelog
## NT Conduit BOQ Documentation

---

## [v1.6.3] - 2026-03-27 (Category-Based Item Sorting)

### 🔧 ปัญหา: รายการที่เพิ่มทีหลังตกท้ายเอกสาร

20 รายการ PN8 กลบทราย ถูกเพิ่มเข้า `price_list` เป็น **ITEM-0663~0682** (category `2.3.`) แต่ `item_order` ที่ derive จาก `item_code` ทำให้ sort ตกท้ายเอกสาร (order 669 > 662 ซึ่งเป็นรายการสุดท้ายของชุดเดิม)

### 🛡️ การแก้ไข: Sort by Category → item_order

เปลี่ยนจาก sort by `item_order` อย่างเดียว เป็น **sort by `category` (natural sort) → `item_order`** ภายใน category เดียวกัน:

```typescript
function sortItemsByCategory(items) {
  return items.sort((a, b) => {
    const cmp = a.category.localeCompare(b.category, undefined, { numeric: true });
    if (cmp !== 0) return cmp;           // "2.3." < "10.2." (natural sort)
    return a.item_order - b.item_order;   // ภายใน category เดียวกัน
  });
}
```

**วิธีดึง category:** Join `price_list(category)` ผ่าน FK `boq_items.price_list_id` — ไม่ต้อง migration

### 📦 ไฟล์ที่เปลี่ยน (4 ไฟล์)

| ไฟล์ | เปลี่ยนแปลง |
|------|-----------|
| `LineItemsTable.tsx` | เพิ่ม `category?` ใน `LineItem` interface |
| `MultiRouteEditor.tsx` | Join price_list, แนบ category, sort ก่อนแสดงผล |
| `print/page.tsx` | Join price_list, sort route + consolidated pages |
| `exportBoqExcel.ts` | เพิ่ม category ใน ExportBOQItem, sort route + consolidated |

### ⚠️ หลักการสำคัญ (สำหรับ AI session ถัดไป)

1. **item_order ไม่ใช่ลำดับจริง** — เป็นแค่ตัวเลขจาก item_code (ITEM-0669 → 669) ใช้เรียงภายใน category เดียวกันเท่านั้น
2. **category เป็น sort key หลัก** — ดึงจาก `price_list` ผ่าน FK `price_list_id` ไม่ได้เก็บใน `boq_items`
3. **ใช้ `localeCompare` กับ `{ numeric: true }`** — เพื่อให้ `"2.3."` มาก่อน `"10.2."`
4. **ไม่มี migration** — ทำง่ายเมื่อทำระบบ category/item_code ใหม่ในอนาคต เปลี่ยน sort logic ได้เลย
5. **BOQ เก่าก็ได้ประโยชน์** — พิมพ์ใหม่เมื่อไร ก็เรียงถูกเลย (แต่เลขลำดับอาจเปลี่ยน)

---

## [v1.6.2] - 2026-03-18 (Comprehensive Float Precision Safety)

### 🔢 ปัญหา: JavaScript Floating-Point Precision

JavaScript ใช้ IEEE 754 double-precision ในการเก็บตัวเลข ทำให้การคูณทศนิยมบางชุดได้ผลลัพธ์เพี้ยน:

```
2,738,389 × 1.275 → JS ได้ 3,491,445.9749999996 (ควรเป็น .975)
```

ต่างจาก Excel ที่ซ่อนความเพี้ยนโดยปัดเหลือ 15 significant digits ก่อนแสดงผล

### 🛡️ การแก้ไข: Integer Math ทุกจุดคูณ

สร้าง `safeMul()` เป็นฟังก์ชันแกนกลาง แปลงตัวเลขเป็น **จำนวนเต็ม** ก่อนคูณ:

| จุดคำนวณ | ฟังก์ชัน | Precision |
|---|---|---|
| ค่างาน × Factor F | `multiplyFactor()` | 2dp × 4dp |
| ปริมาณ × ราคา/หน่วย | `safeItemCalc()` | 2dp × 2dp |
| ค่าก่อน VAT × 0.07 | `safeMul()` (ใน `calculateVAT`) | 2dp × 4dp |
| ปัดเศษ 2 ทศนิยม | `roundMoney()` | exponential notation |

### ⚠️ เจตนารมณ์ (สำหรับ AI session ถัดไป)

> **ห้ามใช้ `*` ดิบในการคูณตัวเลขที่เกี่ยวกับเงิน/ราคาโดยเด็ดขาด**
>
> ทุกการคูณทศนิยมต้องผ่าน `safeMul()`, `multiplyFactor()`, หรือ `safeItemCalc()` เท่านั้น
> การบวก/ลบ (addition/subtraction) ไม่มีปัญหา ไม่ต้องใช้ safe function

### 📁 Files Changed
- `lib/calculation.ts` — เพิ่ม `safeMul()`, `safeItemCalc()`, ปรับ `calculateVAT()` ให้ใช้ `safeMul()`
- `components/boq/FactorFSummary.tsx` — ใช้ `multiplyFactor()` แทน `*`
- `components/boq/MultiRouteEditor.tsx` — ใช้ `safeItemCalc()` แทน `quantity * unit_cost`
- `app/boq/[id]/print/page.tsx` — ใช้ `multiplyFactor()` แทน `*`

---

## [v1.6.1] - 2026-03-18 (Rounding Precision Fix - Partial)

> **Note**: v1.6.1 แก้ได้แค่บางกรณี (exponential notation ในขั้นปัด) ยังไม่ครอบคลุมขั้นคูณ ดู v1.6.2 สำหรับการแก้ไขสมบูรณ์

### 🐛 Bug Fix
- **Float Precision in `roundMoney`**: Switched from `Math.round(value * 100) / 100` to exponential notation
- **FactorFSummary Display Consistency**: ใช้ `totalWithFactor` ที่ปัดแล้ว แทน raw `grandTotalCost * factor`

### 📁 Files
- `lib/calculation.ts` — `roundMoney()` implementation fix
- `components/boq/FactorFSummary.tsx` — display consistency fix

---

## [v1.6.0] - 2026-03-17 (Excel Export)

### 📊 Excel Export (ปร.4)
- **Export to Excel Button**: Added "Excel" button (with FileSpreadsheet icon) next to the "พิมพ์" button on the BOQ print preview page.
- **Route Detail Sheets** (`ปร.4 เส้นทาง N`): One sheet per route with 2-row merged headers, styled cells, and all item data.
- **Consolidated Sheet** (`ปร.4 รวมทุกเส้นทาง`): For multi-route BOQs, merges items with the same name across all routes (summed quantities and costs). Only appears when routes > 1.
- **Summary Sheet** (`สรุปรวม`): Factor F columns (≤5M / >5M), allocated route costs with VAT, Thai baht text (`numberToThaiText`), conditions, notes, and estimator signature.
- **Factor F Supplement Sheet** (`Factor F`): Formula display, variables A-E with values, calculation steps (raw → truncated), and signature.

### 🎨 Styling
- **Font**: TH Sarabun New applied globally via `defaultFont()` helper (fallback to system font if not installed).
- **Colors**: Header fill `#FFFDE7`, total row fill `#FFFDE7`, highlight-box `#FFEB3B` — all matching print preview CSS exactly.
- **Page Setup**: A4 landscape with fit-to-width for route/summary sheets, A4 portrait for Factor F sheet.

### 🔒 Data Correctness
- **Single Source of Truth**: Export uses the same React state as print preview — no separate DB query.
- **Checksum Validation**: Verifies route totals match sum of item totals before generating file (tolerance ≤ 0.01 baht).
- **Raw Numbers**: Sends actual numbers to Excel (not formatted strings) to preserve calculation precision.

### 🔧 Technical
- **Dynamic Import**: `exceljs` and `file-saver` loaded via `import()` on button click — zero impact on initial page bundle.
- **Dependencies Added**: `exceljs@4.4.0`, `file-saver@2.0.5`, `@types/file-saver`.
- **Branch**: Developed on `feat/excel-export`, merged to `main` via fast-forward.

### 📁 Files
- `lib/exportBoqExcel.ts` — 894 lines, core export module
- `app/boq/[id]/print/page.tsx` — +27 lines (button + handler)

---

## [v1.5.1] - 2026-03-17 (BOQ Remarks)

### 📝 Remarks Feature
- **Item-Level Remarks**: Added remarks input field in the line items editor (`LineItemsTable.tsx`).
- **Route-Level Remarks**: Repurposed `route_description` field in `MultiRouteEditor.tsx` as "หมายเหตุเส้นทาง (แสดงในหน้าสรุปรวม ปร.4)".
- **Print Layout**: Both remark columns set to symmetrical `120px` width in print CSS.
- **No Migration**: Used existing `remarks` column in `boq_items` and `route_description` in `boq_routes`.

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
