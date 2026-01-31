# Task Checklist

**Last Updated:** 2026-01-31

---

## ✅ Documentation (DONE)
- [x] Finalize Phase 2 Roadmap
- [x] Create `/shadcn-migration` skill
- [x] Update `SHADCN_MIGRATION_PLAN.md` v3.0

---

## 🔄 shadcn/ui + Best Practices Migration (NEXT)

### Phase 1: Setup
- [ ] `npx shadcn@latest init` (default, slate, CSS vars)
- [ ] Install `clsx`, `tailwind-merge`
- [ ] Create `lib/utils.ts` with `cn()`
- [ ] Install components (button, card, input, table, etc.)

### Phase 2: Component Migration
- [ ] Low-risk: TotalsSummary, BOQAccessBanner, ProjectInfoForm, UserBadge
- [ ] Medium-risk: UserMenu, RouteManager, BOQPageHeader, FactorFSummary, ItemSearch
- [ ] High-risk: LineItemsTable, MultiRouteEditor

### Phase 3: Page Migration
- [ ] Login, Profile, Admin, Price List
- [ ] Home, BOQ List, Create, Edit

### Phase 4: Best Practices
- [ ] Fix barrel imports → direct
- [ ] Add `Promise.all()` for parallel fetches

### Phase 5: Verification
- [ ] `npm run lint` + `npm run build`
- [ ] Manual test 3 breakpoints

---

## ⏳ Phase 2A: Database Versioning (AFTER shadcn)
- [ ] Create `price_list_versions` + seed "2568"
- [ ] Add `version_id` to `price_list`
- [ ] Add `price_list_version_id` to `boq`
- [ ] Create `system_event_log`
- [ ] Add triggers + logging
- [ ] UI/PDF version display

---

## ⏳ Phase 2B-D (PENDING)
- [ ] Reporting, Copy/Requote
- [ ] Smart Estimation, Wizard
- [ ] Governance, Audit Log
