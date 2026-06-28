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

- [x] Price list (710 items: base 682 + PN6 28, 52 categories)
- [x] BOQ with multi-route support
- [x] Organizations, Departments, Sectors
- [x] Supabase Auth (Email/Password) + Auto-create profile
- [x] RLS policies + RBAC
- [x] Admin: approve/reject pending users
- [x] Onboarding flow with requested_* fields
- [x] PDF/Excel export with premium templates (`exceljs`)

---

## ✅ Phase 2: Modernization & Versioning (COMPLETED 2026-06-21)

**Strategy:** Quality Baseline → P0 Containment → Foundation (DB) → Integration (Codebase) → Hardening (Locks) → Governance (Admin GUI)

**Current rollout state (2026-06-22):** P0 → Phase 1A → Phase 2 → Phase 1B is
complete in Production. Active/default version `2568.0.0` contains 710 rows;
the version-aware application and hardening are deployed and verified. See the
[Production verification report](./plans/master-catalog/05-verification-report.md).

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

**Rule D: Reference Data Freeze and Factor F Separation**
- **Price catalog baseline**: Current documented `price_list` count is 710
  rows, including the PN6 addition (`ITEM-0683` through `ITEM-0710`).
- **Factor F outside price catalog versioning**: Factor F is not cloned into
  `price_list_versions`; future Factor F changes follow
  [ADR-005](./02_architecture/ADR/ADR-005-versioned-factor-f-reference.md) and
  the separate Factor F Change Request.
- **No guessed legacy backfill**: Existing BOQs must not be backfilled with a
  current Factor F version unless exact source/version evidence exists.
- **Fail-closed calculation**: The app must not save, print, or export nonzero
  BOQs with a silent Factor F default when `factor_reference` is unreadable.

---

### 📅 Phase 2 Rollout Plan (5-Step Roadmap)

#### **Phase 0: Preflight Verification — completed**
- Run counts and integrity checks on current production BOQ rows.
- Refresh `price_list` count, including PN6 rows, through authenticated
  Supabase SQL/MCP immediately before P0 and again before Phase 1A.
- Verify full `factor_reference` integrity through authenticated SQL/MCP:
  row count, duplicate/null checks, ordered thresholds, positive factor values,
  and the approved full-table checksum. The 30M/40M Surin-range values are only
  a smoke example, not the whole gate.
- Verify existing RLS structures.

#### **Phase 1A: Database Setup — completed**
- Run rerunnable DDL scripts to create `price_list_versions`, `price_list_default_version`, and `price_list_audit_logs`.
- Add nullable version columns and drop old global item code unique constraint.
- Deploy SRE triggers, RPCs, fallback snapshotters, and explicit role permissions (`GRANT`/`REVOKE`).
- Run historical backfill and snapshot recovery scripts.

#### **Phase 2: Codebase Deployment & Integration — completed**
- Propagate version ID: `MultiRouteEditor` -> `LineItemsTable` -> `ItemSearch` (with version search constraints).
- Update BOQ duplication in `app/boq/page.tsx` to copy `price_list_version_id` and snapshotted categories.
- Remove dynamic `.select('*, price_list(category)')` JOIN from print page (`print/page.tsx`) and editor (`MultiRouteEditor.tsx`).
- Update dashboard hook (`useDashboardData.ts`) and `/price-list` page queries to filter by active default version.

#### **Phase 1B: Database Hardening — completed**
- Verify zero NULL snapshots via SRE-corrected query (excluding manual custom items).
- Set `boq.price_list_version_id` to `NOT NULL`.
- Enable `trigger_prevent_boq_version_modification` to seal historical BOQ version states.

#### **Phase 4: Catalog Administration & Official Publication — planned**

The earlier three-bullet GUI sketch is superseded by the reviewed
[Revision 8 architecture plan](./plans/master-catalog/08-phase4-architecture-ci-plan.md)
and [Phase 4 Change Request](./plans/master-catalog/09-phase4-change-request.md).
Phase 4 now includes stable identity, manual and fixed-profile Excel changes,
full item history, immutable publish, official hashed Excel/PDF, and audited
pointer restore. It has not started and requires owner approval.

#### **Factor F Change Track — owner-selected before Master Catalog Phase 4**

Factor F changes are separate from Master Catalog Phase 4. Owner direction on
2026-06-28 is to run the F-track before Master Catalog Phase 4 and before
changing live Factor F values:

1. F0: approve
   [ADR-005](./02_architecture/ADR/ADR-005-versioned-factor-f-reference.md),
   the Factor F Change Request, source document, and effective date.
2. F1: deploy additive Factor F version foundation and app compatibility.
3. F2: seed the current Factor F table as the initial published factor version
   for future BOQs only; do not backfill old BOQs.
4. F3: publish the new Factor F version and move the factor default pointer.
5. F4: add duplicate/reprice UX so old project data can become a new BOQ with
   the latest Factor F by explicit user action. This is being pulled forward
   as a narrow edit-page action because local testing showed that legacy BOQs
   without `factor_reference_version_id` otherwise have no user-visible path
   out of the fail-closed calculation state. The action must create a new BOQ
   copy and let the user choose an active Factor F version, such as `2566.0.0`
   for continuing old-factor work or `2569.0.0` for the new table. Do not run a
   blanket legacy backfill.

The current F3 source candidate is the 26 June 2026 Factor F table recorded in
[docs/plans/factor-f/04-source-table-2569-06-26.md](./plans/factor-f/04-source-table-2569-06-26.md).
Owner confirmed effective date 2026-06-26 and source reference กค
0433.2/ว 481 on 2026-06-28. F3 still needs final row transcription review,
diff/hash approval, and a separate Production window after F1/F2 are verified.
Production Factor F publication and Master Catalog publication should use
separate approval windows.

Migration numbering follows execution order. Supabase MCP verified Production
on 2026-06-28: the latest applied ledger entry is
`20260621104056_master_catalog_phase1b_hardening`, corresponding to
`migrations/011_master_catalog_phase1b_hardening.sql`. Because Factor F is now
owner-selected before Master Catalog Phase 4, reserve:

- `migrations/012_factor_f_version_foundation.sql`
- `migrations/013_factor_f_seed_current_baseline.sql`
- `migrations/014_factor_f_publish_2569_0_0.sql`
- `migrations/015_factor_f_repair_legacy_snapshot_metadata.sql`

Master Catalog Phase 4 database migrations must therefore start at `016+`.
Local implementation does not affect users; Production F1/F2 should be a
controlled additive migration/deploy window, and F3 changes only the default
Factor F for newly created BOQs.

Detailed execution is governed by
[docs/plans/factor-f/03-implementation-plan.md](./plans/factor-f/03-implementation-plan.md).

---

## 🔮 Product Enhancement Track (FUTURE; separate from Catalog Phase 4)

- [ ] Full Factor F admin/import UI after the F-track foundation proves stable
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
