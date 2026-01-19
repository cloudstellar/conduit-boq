# Task Checklist

**Last Updated:** 2026-01-20

---

## ✅ Documentation (DONE)
- [x] Finalize Phase 2 Roadmap
- [x] Update docs for AI continuity
    - [x] `IMPLEMENTATION_PLAN.md`
    - [x] `ai/HANDOFF.md`
    - [x] `ai/PHASE2_PLAN.md`
    - [x] `DATABASE_SCHEMA.md`
    - [x] `PRD.md`
    - [x] `README.md`

---

## 🔄 Phase 2A: Foundation (NEXT)
- [ ] Install `shadcn/ui`
- [ ] Create `price_list_versions` + seed "2568"
- [ ] Add `version_id` to `price_list` + backfill + unique
- [ ] Add `price_list_version_id` to `boq` + backfill + NOT NULL
- [ ] Create `system_event_log`
- [ ] Add triggers (active-only, immutable) + logging
- [ ] UI header: Version + Year + Status
- [ ] PDF footer: Version + Year + Generated at

---

## ⏳ Phase 2B: Reporting (PENDING)
- [ ] Summary per Dept/Sector
- [ ] Copy/Requote dropdown
- [ ] Requote logic + missing_price

---

## ⏳ Phase 2C: Estimation (PENDING)
- [ ] Wizard UI
- [ ] Model CRUD

---

## ⏳ Phase 2D: Governance (FUTURE)
- [ ] BOQ Audit Log
- [ ] Version Comparison
