# Implementation Plan
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📋 Project Overview

**Current Version:** v1.2.0  
**Production URL:** Deployed on Vercel  

---

## 🏗️ Architecture

```
Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
                    │
                    ▼
             SUPABASE (Auth + PostgreSQL + RLS)
                    │
                    ▼
                 VERCEL
```

---

## ✅ Phase 1: Foundation (COMPLETED v1.2.0)

- [x] Price list (682 items, 52 categories)
- [x] BOQ with multi-route support
- [x] Organizations, Departments, Sectors
- [x] Supabase Auth (Email/Password) + Auto-create profile
- [x] RLS policies + RBAC
- [x] Admin: approve/reject pending users
- [x] Onboarding flow with requested_* fields

---

## 🚧 Phase 2: Modernization & Versioning (MASTER CATALOG v26 - PLANNED)

**Strategy:** P0 Containment → Nullable DB Setup → Application Integration → DB Hardening → Future Governance

Detailed execution plan: [Master Catalog v26](../plans/master-catalog/02-implementation.md)

### 🔐 Key Integrity Rules

| Rule | Implementation |
|------|----------------|
| One active default | Singleton pointer table `price_list_default_version` |
| Default must be active | Pointer validation trigger |
| Switch default = atomic | Scoped Phase 4 RPC updates the singleton pointer |
| Active-only BOQ binding | BOQ insert trigger reads the singleton pointer |
| Immutable BOQ version | Phase 1B trigger after application rollout |
| No duplicate items | `UNIQUE (version_id, item_code)` |
| Historical category snapshot | `boq_items.category` |

### 📅 Controlled Rollout

1. Apply P0 RPC containment and tightened BOQ RLS.
2. Apply Phase 1A nullable catalog schema, pointer table, backfill, and version-aware RPC.
3. Create concurrent indexes from the separate `010a` runbook.
4. Deploy create, duplicate, edit, print, dashboard, and price-list integration updates.
5. Run smoke tests and delta backfill verification.
6. Apply Phase 1B `NOT NULL` and immutable-version hardening.

### 🔐 Future Governance

Admin import, catalog clone, default swap, and audit-trigger flows require a
separate Phase 4 change request.

---

## 🔮 Phase 3: Enhancement (FUTURE)

- [ ] Approval workflow (draft → approved)
- [ ] Notifications
- [ ] PDF/Excel export with template
- [ ] PWA / Offline support
- [ ] Mobile-optimized UI

---

## 🗄️ Database Migrations

| File | Description | Status |
|------|-------------|--------|
| 001-006 | Phase 1 foundation | ✅ |
| 007 | Onboarding columns | ✅ v1.2.0 |
| 008 | RLS + Trigger + RPC | ✅ v1.2.0 |
| 20260317_factor_f_supplement | Factor F Supplement snapshot | ✅ v1.5.0 |
| 009_master_catalog_p0_containment | Master Catalog v26 RPC containment + BOQ RLS tightening | 📝 Draft |
| 010_master_catalog_phase1a_versioning | Master Catalog v26 nullable versioning + historical backfill | 📝 Draft |
| 010a_master_catalog_phase1a_indexes | Master Catalog v26 concurrent index runbook | 📝 Draft |
| 011_master_catalog_phase1b_hardening | Master Catalog v26 BOQ version contract hardening | 📝 Draft |

---

## 🚀 Deployment

```bash
npm run dev      # Development
vercel --prod    # Production
```
