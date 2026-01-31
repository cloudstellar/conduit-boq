# Task Checklist

**Last Updated:** 2026-01-31  
**Version:** 3.6 Final  
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

## 🔄 shadcn/ui Migration (NEXT)

### Phase 1: Setup (M1-M2)
- [ ] **M1:** Path verify + `npx shadcn@latest init`
- [ ] **M1:** Install dependencies (clsx, tailwind-merge, cva, lucide, animate)
- [ ] **M1:** Create `lib/utils.ts` + Install components
- [ ] **M2:** 🛑 `npm run build` — ต้องผ่านก่อนไปต่อ!
- [ ] **M2:** Commit + Tag + Push: `v1.2.1-shadcn-phase1`

### Phase 2: Component Migration (M3-M6)
- [ ] **M3:** 🔍 PRINT SCAN → บันทึกผลที่ `docs/print-deps.txt`
- [ ] **M4:** Low-risk (1-4): TotalsSummary, BOQAccessBanner, ProjectInfoForm, UserBadge
- [ ] **M5:** Medium-risk (5-10) + `npm run build`
- [ ] **M6:** MultiRouteEditor → Tag: `v1.2.1-shadcn-phase2`

### Phase 3: Page Migration (M7)
- [ ] **M7:** Login, Profile, Admin, Price List, Home, BOQ pages
- [ ] ❌ Skip `/boq/[id]/print`

### Phase 4: Best Practices
- [ ] Fix barrel imports → direct
- [ ] `Promise.all()` for parallel fetches

### Phase 5: Verification (M8)
- [ ] **M8:** `npm run lint` + `npm run build` + manual test
- [ ] **M8:** Tag + Push: `v1.2.1-shadcn-done`

---

## ⏳ Phase 2A: Database Versioning (AFTER shadcn)
- [ ] Create `price_list_versions` + seed "2568"
- [ ] Add `version_id` to `price_list`
- [ ] Add `price_list_version_id` to `boq`
- [ ] Create `system_event_log`

---

## ⏳ Phase 2B-D (PENDING)
- [ ] Reporting, Copy/Requote
- [ ] Smart Estimation, Wizard
- [ ] Governance, Audit Log
