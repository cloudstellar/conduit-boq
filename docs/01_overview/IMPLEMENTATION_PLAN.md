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

**Strategy:** Quality Baseline → P0 Containment → Nullable DB Setup → Application Integration → DB Hardening → Future Governance

**Current rollout state (2026-06-02):** Repository quality baseline merged to
`main` via [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1) at
`6d607f9`; [GitHub Actions Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106)
and Vercel Production deploy passed. No Master Catalog migration has been
applied to the Production DB.

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

1. ✅ Merge repository quality baseline: lint, build, automated tests, and CI workflow.
2. Apply P0 RPC containment and tightened BOQ RLS.
3. Confirm latest `main` CI and dependency-audit disposition before catalog schema work.
4. Apply Phase 1A nullable catalog schema, pointer table, backfill, and version-aware RPC.
5. Create concurrent indexes from the separate `010a` runbook.
6. Deploy create, duplicate, edit, print, dashboard, and price-list integration updates.
7. Run smoke tests and delta backfill verification.
8. Apply Phase 1B `NOT NULL` and immutable-version hardening.

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
