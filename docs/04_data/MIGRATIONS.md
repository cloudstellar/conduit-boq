# Migrations
## Conduit BOQ System

**Last Updated:** 2026-06-21
**Status:** Canonical

---

## 1. Migration History

### Root Migrations (`migrations/`)

| File | Description | Status |
|------|-------------|--------|
| `001_backup_before_migration.sql` | Pre-migration backup queries | **Backup/Utility** |
| `002_add_multi_route_support.sql` | Multi-route tables, data migration | **Applied** |
| `002_rollback_multi_route_support.sql` | Rollback script for 002 | **Rollback Utility** |
| `003_add_construction_area_to_routes.sql` | Add `construction_area` to `boq_routes` | **Applied** |
| `004_phase1a_auth_ownership.sql` | Auth columns (`created_by`, `assigned_to`, org refs) | **Applied** |
| `005_phase1a_seed_and_rls.sql` | Seed org/dept/sector data, initial RLS policies | **Applied** (partially superseded by 008) |
| `006_phase1a_rls_write_and_approval.sql` | RLS write/approval policies | **Applied** (partially superseded by 008) |
| `007_add_requested_org_columns.sql` | Onboarding `requested_*` columns (v1.2.0) | **Applied** |
| `007_app_settings.sql` | Create `app_settings` table, seed domain keys | **Applied** |
| `007b_add_onboarding_completed.sql` | Add `onboarding_completed` column | **Applied (Manual Supplement)** |
| `008_pending_user_status.sql` | Add `pending` to user status check constraint | **Applied** |
| `008_rls_and_trigger.sql` | Consolidated RLS + org-lock trigger + admin RPC | **Applied** |
| `009_master_catalog_p0_containment.sql` | Master Catalog v26 RPC containment + BOQ RLS tightening | **Applied to Production 2026-06-21** (`20260621045208`) |
| `010_master_catalog_phase1a_versioning.sql` | Master Catalog v26 nullable versioning + historical backfill | **Draft** |
| `010a_master_catalog_phase1a_indexes.sql` | Master Catalog v26 concurrent index runbook | **Draft** |
| `011_master_catalog_phase1b_hardening.sql` | Master Catalog v26 BOQ version contract hardening | **Draft** |

### Local Schema Baseline (`supabase/local/`)

| File | Description | Status |
|------|-------------|--------|
| `production-baseline.sql` | Schema-only snapshot pulled from current Production for deterministic Local rebuilds | **Local Baseline Only — never a remote migration** |

### Preserved Legacy Artifacts (`supabase/legacy_migrations/`)

| File | Description | Status |
|------|-------------|--------|
| `20250115_rls_policies.sql` | Early RLS policy set | **Applied Legacy Artifact** (superseded in part by 008 migrations) |
| `20260317_factor_f_supplement.sql` | Factor F snapshot columns + `save_boq_with_routes` RPC | **Applied Legacy Artifact** |

### Naming Convention

The root `migrations/` sequence is the reviewed Production rollout ledger. The
Production schema snapshot lives under `supabase/local/`, deliberately outside
the Supabase CLI remote migration ledger, and exists only to rebuild Local
Supabase. Previously applied timestamped scripts are preserved under
`supabase/legacy_migrations/` for audit context and do not reserve the root
migration number `009`. The Master Catalog rollout therefore starts with
`migrations/009_master_catalog_p0_containment.sql`.

`010a_master_catalog_phase1a_indexes.sql` is an operational runbook rather than
a transactional migration. Run its `CREATE INDEX CONCURRENTLY` statements one
at a time outside an explicit transaction.

---

## 2. Migration Process

### Local rehearsal

Use `npm run db:local:bootstrap`. It resets Local Supabase to the schema-only
Production baseline, restores scrubbed snapshots, applies root migrations
`009` and `010`, applies all four `010a` concurrent indexes individually, then
applies `011` and runs the Phase 2 smoke tests.

The CLI remains intentionally unlinked from Production. Do not use `db push`,
`db pull`, or linked diff commands from this worktree. Local migration history
contains no rollout scripts because both the baseline and root Master Catalog
scripts are applied explicitly by the bootstrap script. That script is the
canonical Local rehearsal ledger for this rollout.

### Production execution

Production migrations are run only during an approved execution window through
the reviewed SQL Editor/MCP runbook:

1. Open [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Open the migration file
3. Copy entire contents and paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify output messages

> [!IMPORTANT]
> Always run `001_backup_before_migration.sql` queries first to record the current state before applying any new migration.

---

## 3. Rollback Procedures

Currently, only one rollback script exists:

- **`002_rollback_multi_route_support.sql`**: Removes `boq_routes` table and `route_id` from `boq_items`, restoring the system to single-route mode. Any multi-route BOQs created after migration 002 will be lost.

For other migrations, rollback must be performed manually by reversing the specific DDL/DML changes.

---

## 4. Status Legend

| Status | Meaning |
|--------|---------|
| **Applied** | Successfully run on production database |
| **Applied (superseded)** | Applied but later migrations override some policies |
| **Applied Supplement** | Applied as an additive change to existing schema |
| **Applied (Manual Supplement)** | Applied manually outside normal migration sequence |
| **Applied Legacy Artifact** | Historical script preserved outside the active Local migration directory |
| **Local Baseline Only** | Schema snapshot used only to rebuild Local Supabase; never push to Production |
| **Backup/Utility** | Not a schema change; diagnostic/backup queries |
| **Rollback Utility** | Reversal script, run only if rollback is needed |
| **Draft** | Review and test before applying to production |

---

## References

- Historical multi-route guide: [migrations/README.md](../../migrations/README.md)
- Master Catalog change request: [04-change-request.md](../plans/master-catalog/04-change-request.md)
- Master Catalog verification report: [05-verification-report.md](../plans/master-catalog/05-verification-report.md)
- Database Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
