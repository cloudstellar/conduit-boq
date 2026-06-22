# Implementation Plan
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📋 Project Overview

**Current Version:** v1.6.0 (Excel export + Factor F correction)
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

## ✅ Phase 1: Foundation (COMPLETED v1.6.0)

- [x] Price list (710 items: base 682 + PN6 28, 52 categories)
- [x] BOQ with multi-route support
- [x] Organizations, Departments, Sectors
- [x] Supabase Auth (Email/Password) + Auto-create profile
- [x] RLS policies + RBAC
- [x] Admin: approve/reject pending users
- [x] Onboarding flow with requested_* fields
- [x] PDF/Excel export with Factor F snapshots

---

## ✅ Phase 2: Modernization & Versioning (MASTER CATALOG v26 - COMPLETED)

**Strategy:** Quality Baseline → P0 Containment → Nullable DB Setup → Application Integration → DB Hardening → Future Governance

**Current rollout state (2026-06-22):** Production P0 → Phase 1A → Phase 2 →
Phase 1B completed on 2026-06-21. The active/default version is `2568.0.0`
with 710 rows. Migrations `009`, `010`, four operational `010a` indexes, and
`011` are applied and verified; the version-aware Phase 2 application was
merged through PR #2 and deployed to Vercel Production.

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
| Factor F outside catalog versioning | `factor_reference` remains stable/read-only and is verified separately |

### 📅 Controlled Rollout

1. ✅ Merge repository quality baseline: lint, build, automated tests, and CI workflow.
2. ✅ Refresh authenticated preflight counts for BOQ, `price_list` 710 rows, PN6
   28 rows, and full `factor_reference` table integrity.
3. ✅ Apply P0 RPC containment and tightened BOQ RLS.
4. ✅ Confirm `main` CI and remediate Production dependency audit.
5. ✅ Apply Phase 1A nullable catalog schema, pointer, backfill, and RPC.
6. ✅ Create and verify four concurrent indexes from `010a`.
7. ✅ Deploy version-aware create/duplicate/edit/print/dashboard/price-list flows.
8. ✅ Run smoke tests and delta reconciliation.
9. ✅ Apply Phase 1B `NOT NULL` and immutable-version hardening.

### 🚧 Phase 4: Catalog Administration and Official Publication (PLANNED)

Admin manual change/import, stable identity, item history, catalog publish,
official stamped Excel/PDF, and audited pointer restore require the separate
[Phase 4 Change Request](../plans/master-catalog/09-phase4-change-request.md).
Implementation/local rehearsal, Production migration, deploy, enablement, and
publication each have explicit approval gates.

Start review from the
[Phase 4 Review Guide](../plans/master-catalog/00-phase4-review-guide.md).

---

## 🔮 Product Enhancement Track (FUTURE; separate from Catalog Phase 4)

- [ ] Approval workflow (draft → approved)
- [ ] Notifications
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
| 009_master_catalog_p0_containment | Master Catalog v26 RPC containment + BOQ RLS tightening | ✅ Production 2026-06-21 |
| 010_master_catalog_phase1a_versioning | Master Catalog v26 nullable versioning + historical backfill | ✅ Production 2026-06-21 |
| 010a_master_catalog_phase1a_indexes | Master Catalog v26 concurrent index runbook | ✅ 4 indexes valid/ready 2026-06-21 |
| 011_master_catalog_phase1b_hardening | Master Catalog v26 BOQ version contract hardening | ✅ Production 2026-06-21 |

---

## 🚀 Deployment

```bash
npm run dev      # Development
vercel --prod    # Production
```
