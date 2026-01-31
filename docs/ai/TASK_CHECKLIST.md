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

### Phase 1: Setup
- [ ] Path verify: `ls app/globals.css tailwind.config.ts`
- [ ] `npx shadcn@latest init` (default, slate, CSS vars)
- [ ] Install `clsx`, `tailwind-merge`
- [ ] Create `lib/utils.ts` with `cn()`
- [ ] Install components (button, card, input, table, etc.)
- [ ] **🛑 `npm run build` — ต้องผ่านก่อนไปต่อ!**
- [ ] Commit + Tag + Push: `v1.2.1-shadcn-phase1`

### Phase 2: Component Migration
- [ ] **🔍 PRINT SCAN:** `grep -nE "^import" app/boq/\[id\]/print/page.tsx`
- [ ] Low-risk (1-4): TotalsSummary, BOQAccessBanner, ProjectInfoForm, UserBadge
- [ ] Medium-risk (5-10): UserMenu, BOQPageHeader, RouteManager, FactorFSummary, LineItemsTable, ItemSearch
- [ ] **Build gate:** `npm run build` หลัง Batch 2
- [ ] High-risk (11): MultiRouteEditor
- [ ] Tag + Push: `v1.2.1-shadcn-phase2`

### Phase 3: Page Migration
- [ ] Login, Profile
- [ ] Admin, Price List
- [ ] Home, BOQ List, Create, Edit
- [ ] ❌ Skip `/boq/[id]/print`

### Phase 4: Best Practices
- [ ] Fix barrel imports → direct
- [ ] Add `Promise.all()` for parallel fetches

### Phase 5: Verification
- [ ] `npm run lint` + `npm run build`
- [ ] Manual test: 375px, 768px, 1280px
- [ ] Verify print page NOT affected
- [ ] Tag + Push: `v1.2.1-shadcn-done`

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
