# Implementation Plan
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📋 Project Overview

**Current Version:** v1.6.0 (Added Excel export via `exceljs`)  
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

- [x] Price list (682 items, 52 categories)
- [x] BOQ with multi-route support
- [x] Organizations, Departments, Sectors
- [x] Supabase Auth (Email/Password) + Auto-create profile
- [x] RLS policies + RBAC
- [x] Admin: approve/reject pending users
- [x] Onboarding flow with requested_* fields
- [x] PDF/Excel export with premium templates (`exceljs`)

---

## 🚧 Phase 2: Modernization & Versioning (SRE-Hardened - PLANNED)

**Strategy:** Quality Baseline → P0 Containment → Foundation (DB) → Integration (Codebase) → Hardening (Locks) → Governance (Admin GUI)

**Current rollout state (2026-06-02):** Repository quality baseline merged to
`main` via [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1) at
`6d607f9`; [GitHub Actions Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106)
and Vercel Production deploy passed. No Master Catalog migration has been
applied to the Production DB.

### 🔐 Key Integrity & Security Rules (Revised v26)

**Rule A: Versioning & State Control**
- **One active default**: `price_list_default_version` is the singleton source of truth.
- **Default = active**: Checked by the pointer validation trigger.
- **Switch default = atomic**: Phase 4 `make_version_default` updates the singleton pointer.
- **Never 0 defaults**: Ensured by AFTER STATEMENT trigger `trigger_check_default_version_exists`.
- **Active-only BOQ**: New BOQs auto-bind to the default active version.
- **Immutable version_id**: Trigger `trigger_prevent_boq_version_modification` locks BOQ versioning post-hardening.
- **No duplicate items in version**: Guaranteed by composite unique key `UNIQUE (version_id, item_code)` after dropping global `price_list_item_code_key`.
- **Compatibility flag**: `price_list_versions.is_default` remains temporarily but is deprecated.

**Rule B: Snapshot Shield**
- **No auto-update**: Category and prices are snapshotted in `boq_items.category` at insert.
- **Automatic Fallback Snapshot**: Database RPC `save_boq_with_routes` automatically falls back to retrieve and snapshot categories from `price_list` if client parameters are empty.
- **Duplication safety**: Existing BOQ duplication must preserve version and item snapshot state.

**Rule C: SECURITY DEFINER RPC Hardening**
- **Auth verification inside RPC**: `clone_price_list_version` and `make_version_default` enforce admin roles, and `save_boq_with_routes` mirrors `permissions.ts` logic (allowing owners, assigned users, sector/department managers, and admins).
- **Execution privilege boundaries**: Explicitly revoke execute privileges from `PUBLIC`/`anon` and grant exclusively to `authenticated` role.
- **Cross-Version Isolation**: RPC strictly checks that every inserted `price_list_id` belongs to the BOQ's current `price_list_version_id`.

---

### 📅 Phase 2 Rollout Plan (5-Step Roadmap)

#### **Phase 0: Preflight Verification**
- Run counts and integrity checks on current production BOQ rows.
- Verify existing RLS structures.

#### **Phase 1A: Database Setup (Defensive Nullable Setup)**
- Run rerunnable DDL scripts to create `price_list_versions`, `price_list_default_version`, and `price_list_audit_logs`.
- Add nullable version columns and drop old global item code unique constraint.
- Deploy SRE triggers, RPCs, fallback snapshotters, and explicit role permissions (`GRANT`/`REVOKE`).
- Run historical backfill and snapshot recovery scripts.

#### **Phase 2: Codebase Deployment & Integration**
- Propagate version ID: `MultiRouteEditor` -> `LineItemsTable` -> `ItemSearch` (with version search constraints).
- Update BOQ duplication in `app/boq/page.tsx` to copy `price_list_version_id` and snapshotted categories.
- Remove dynamic `.select('*, price_list(category)')` JOIN from print page (`print/page.tsx`) and editor (`MultiRouteEditor.tsx`).
- Update dashboard hook (`useDashboardData.ts`) and `/price-list` page queries to filter by active default version.

#### **Phase 3: Database Hardening (Phase 1B)**
- Verify zero NULL snapshots via SRE-corrected query (excluding manual custom items).
- Set `boq.price_list_version_id` to `NOT NULL`.
- Enable `trigger_prevent_boq_version_modification` to seal historical BOQ version states.

#### **Phase 4: Admin GUI & Governance Tools**
- Build admin price upload and Excel parsing preview (using deterministic index-based array parser).
- Connect high-performance DB functions `clone_price_list_version` and `make_version_default` to admin state buttons.
- Display `price_list_audit_logs` tracking price change histories.

---

## 🔮 Phase 3: Enhancement (FUTURE)

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
