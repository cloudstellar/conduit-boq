# Roadmap
## Conduit BOQ System

**Last Updated:** 2026-01-20

---

## Overview

```
Phase 1 (v1.2.0)   │  Phase 2 (FROZEN)           │  Phase 3+
Foundation         │  Modernization              │  Enhancement
───────────────────│─────────────────────────────│────────────────
✅ Auth            │  2A: Foundation             │  Approval workflow
✅ BOQ CRUD        │  2B: Reporting              │  Notifications
✅ Multi-Route     │  2C: Smart Estimation       │  Mobile/PWA
✅ Price List      │  2D: Governance             │  Analytics
✅ Factor F        │                             │
✅ RLS             │                             │
✅ Admin Panel     │                             │
```

---

## Phase 1: Foundation ✅ v1.2.0

- [x] Google OAuth + Domain restriction
- [x] RLS + RBAC
- [x] BOQ CRUD + Multi-route
- [x] Price List (518 items)
- [x] Factor F + VAT
- [x] Admin Panel + Pending user approval
- [x] Onboarding flow

---

## Phase 2: Modernization (FROZEN)

**Strategy:** Foundation → Output → Input → Governance

### 2A: Foundation ⛔ Infra only
- [ ] shadcn/ui + Sidebar layout
- [ ] `price_list_versions` table
- [ ] Versioned pricing (2568, 2569...)
- [ ] Immutable BOQ version
- [ ] `system_event_log` for triggers

### 2B: Reporting
- [ ] Summary per Dept/Sector
- [ ] PDF Export
- [ ] Copy/Requote dropdown
- [ ] Missing price handling

### 2C: Smart Estimation
- [ ] Model-based BOQ generation
- [ ] Wizard UI
- [ ] Output overridable

### 2D: Governance
- [ ] BOQ Audit Log
- [ ] Version Comparison

---

## Phase 3+: Enhancement (FUTURE)

- [ ] Approval workflow (draft → submitted → approved/rejected)
- [ ] Notifications
- [ ] PWA / Offline
- [ ] Analytics

---

## Key Integrity Rules (Phase 2)

**Rule A: Versioning**
- One default, must be active
- Active-only BOQ creation
- Immutable version_id
- UNIQUE (version_id, item_code)

**Rule B: Snapshot**
- BOQ = Frozen after creation
- Model changes don't affect existing BOQs
