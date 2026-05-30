# Migrations
## Conduit BOQ System

**Last Updated:** 2026-05-30  
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

### Supabase Migrations (`supabase/migrations/`)

| File | Description | Status |
|------|-------------|--------|
| `20250115_rls_policies.sql` | Early RLS policy set | **Applied** (superseded in part by 008 migrations) |
| `20260317_factor_f_supplement.sql` | Factor F snapshot columns + `save_boq_with_routes` RPC | **Applied Supplement** |

---

## 2. Migration Process

All migrations are run manually via the **Supabase SQL Editor**:

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
| **Backup/Utility** | Not a schema change; diagnostic/backup queries |
| **Rollback Utility** | Reversal script, run only if rollback is needed |

---

## References

- Migration Guide: [migrations/README.md](../../migrations/README.md)
- Database Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
