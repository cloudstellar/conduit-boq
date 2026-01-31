# Roadmap
## Conduit BOQ System

**Last Updated:** 2026-01-31

---

## Overview

```
Phase 1 (v1.2.0)   │  UI Modernization     │  Phase 2A-D           │  Phase 3+
Foundation         │  shadcn/ui            │  Versioning           │  Enhancement
───────────────────│───────────────────────│───────────────────────│────────────────
✅ Auth            │  ⏳ shadcn/ui init    │  2A: Versioning       │  Approval workflow
✅ BOQ CRUD        │  ⏳ Component migrate │  2B: Reporting        │  Notifications
✅ Multi-Route     │  ⏳ Best practices    │  2C: Estimation       │  Mobile/PWA
✅ Price List      │                       │  2D: Governance       │  Analytics
✅ RLS             │                       │                       │
✅ Admin Panel     │                       │                       │
```

---

## Phase 1: Foundation ✅ v1.2.0

- [x] Supabase Email Auth + Domain restriction (@ntplc.co.th)
- [x] RLS + RBAC
- [x] BOQ CRUD + Multi-route
- [x] Price List (518 items)
- [x] Factor F + VAT
- [x] Admin Panel + Pending user approval
- [x] Onboarding flow

---

## UI Modernization: shadcn/ui Migration ⏳ NEXT

**Strategy:** shadcn/ui + Next.js Best Practices (combined)  
**Branch:** `feature/shadcn-migration`  
**Version:** v3.6 Final

### Configuration
- Style: `default`
- Base color: `slate`
- CSS Variables: `yes`
- Dark Mode: `none` (light only)

### Critical Gates
- **GATE 1:** `npm run build` ผ่านก่อน Phase 2
- **GATE 2:** `bash scripts/print-safe.sh` ก่อน commit

### Phases
1. Setup Foundation (Day 1)
2. Component Migration (Day 2-3)
3. Page Migration (Day 4)
4. Best Practices Refactor (Day 4-5)
5. Verification (Day 5)

**See:** `docs/ai/SHADCN_MIGRATION_PLAN.md` v3.6 for details

---

## Phase 2: Versioning (AFTER shadcn)

### 2A: Foundation ⛔ Infra only
- [ ] `price_list_versions` table
- [ ] Versioned pricing (2568, 2569...)
- [ ] Immutable BOQ version
- [ ] `system_event_log`

### 2B: Reporting
- [ ] Summary per Dept/Sector
- [ ] PDF Export
- [ ] Copy/Requote

### 2C: Smart Estimation
- [ ] Model-based BOQ
- [ ] Wizard UI

### 2D: Governance
- [ ] BOQ Audit Log
- [ ] Version Comparison

---

## Phase 3+: Enhancement (FUTURE)

- [ ] Approval workflow
- [ ] Notifications
- [ ] PWA / Offline
- [ ] Analytics

---

## Key Files

| File | Purpose |
|------|---------|
| `.agent/workflows/shadcn-migration.md` | Skill: shadcn best practices |
| `docs/ai/SHADCN_MIGRATION_PLAN.md` | Detailed migration plan |
| `docs/ai/TASK_CHECKLIST.md` | Current task checklist |
