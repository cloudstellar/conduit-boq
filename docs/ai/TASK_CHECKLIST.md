# Task Checklist

> [!NOTE]
> Historical shadcn migration checklist. For Master Catalog execution, use
> [`docs/plans/master-catalog/02-implementation.md`](../plans/master-catalog/02-implementation.md).

**Last Updated:** 2026-02-01  
**Version:** 3.7  
**Branch:** `feature/shadcn-migration`

---

## 🛑 CRITICAL GATES
- **GATE 1:** Phase 1 ต้อง `npm run build` ผ่านก่อน Phase 2
- **GATE 2:** ใช้ `bash scripts/print-safe.sh` ก่อน commit ทุก batch

---

## ✅ Documentation (DONE)
- [x] Finalize Phase 2 Roadmap
- [x] Create `/shadcn-migration` skill
- [x] Update `SHADCN_MIGRATION_PLAN.md` v3.6
- [x] Create `scripts/print-safe.sh`

---

## ✅ shadcn/ui Migration (DONE)

### Phase 1: Setup (M1-M2)
- [x] **M1:** Path verify + `npx shadcn@latest init`
- [x] **M1:** Install dependencies (clsx, tailwind-merge, cva, lucide, animate)
- [x] **M1:** Create `lib/utils.ts` + Install 15 components
- [x] **M2:** � `npm run build` — **PASSED!**
- [x] **M2:** Commit + Tag + Push: `v1.2.1-shadcn-phase1` ✅

### Phase 2: Component Migration (M3-M6)
- [x] **M3:** 🔍 PRINT SCAN → `docs/print-deps.txt` ✅ (0 conflicts!)
- [x] **M4:** Low-risk (1-4): TotalsSummary, BOQAccessBanner, ProjectInfoForm, UserBadge ✅
- [x] **M5:** Medium-risk (5-10) + `npm run build` ✅
- [x] **M6:** MultiRouteEditor → Tag: `v1.2.1-shadcn-phase2` ✅

### Phase 3: Page Migration (M7)
- [x] **M7:** Login, Profile, Admin, Price List, Home, BOQ pages ✅
- [x] ❌ Skip `/boq/[id]/print` (as planned)

### Phase 4: Best Practices
- [x] Fix barrel imports → direct ✅ (none found)
- [x] `Promise.all()` for parallel fetches ✅ (already implemented)

### Phase 5: Verification (M8)
- [x] **M8:** `npm run lint` + `npm run build` ✅
- [x] **M8:** Tag + Push: `v1.2.1-shadcn-done` ✅

---

## ✅ BOQ List UX Improvements (2026-02-01)

### Route Badge + Dialog
- [x] Create `RouteBadge.tsx` component
- [x] Badge shows "N เส้นทาง" 
- [x] Click opens Dialog with full route names
- [x] Clean table layout (no route name clutter)

### Factor F Snapshot
- [x] Add `onFactorCalculated` callback to `FactorFSummary.tsx`
- [x] Pass callback through `MultiRouteEditor.tsx`
- [x] Receive values in `edit/page.tsx`
- [x] Update RPC `save_boq_with_routes` to save `factor_f`, `total_with_factor_f`, `total_with_vat`
- [x] Display "ก่อน VAT" column using snapshot value

### Table Layout (7 columns)
- [x] โครงการ (380px, line-clamp-4)
- [x] เส้นทาง (100px, badge)
- [x] ผู้ประมาณราคา (150px, full name)
- [x] ก่อน VAT (140px, snapshot)
- [x] สถานะ (90px, badge)
- [x] วันที่ (100px)
- [x] จัดการ (120px, icon buttons)

---

## ⏳ Phase 2A: Database Versioning (PENDING)
- [ ] Create `price_list_versions` + seed "2568"
- [ ] Add `version_id` to `price_list`
- [ ] Add `price_list_version_id` to `boq`
- [ ] Create `price_list_default_version` singleton pointer
- [ ] Create `price_list_audit_logs` table (audit triggers in Phase 4)

---

## ⏳ Phase 2B-D (PENDING)
- [ ] Reporting, Copy/Requote
- [ ] Smart Estimation, Wizard
- [ ] Governance, Audit Log
