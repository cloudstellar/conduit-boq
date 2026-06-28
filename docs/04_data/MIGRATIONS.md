# Migrations
## Conduit BOQ System

**Last Updated:** 2026-06-29
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
| `010_master_catalog_phase1a_versioning.sql` | Master Catalog v26 nullable versioning + historical backfill | **Applied to Production 2026-06-21** (`20260621052517`) |
| `010a_master_catalog_phase1a_indexes.sql` | Master Catalog v26 concurrent index runbook | **Applied operationally 2026-06-21** (4 indexes valid/ready) |
| `011_master_catalog_phase1b_hardening.sql` | Master Catalog v26 BOQ version contract hardening | **Applied to Production 2026-06-21** (`20260621104056`) |
| `012_factor_f_version_foundation.sql` | Factor F version tables, singleton pointer, `boq.factor_reference_version_id`, RLS/grants/triggers | **Applied to Production 2026-06-29** (`20260628190218`) |
| `013_factor_f_seed_current_baseline.sql` | Seed audited current 37-row `factor_reference` baseline as Factor F `2566.0.0` and move the default pointer | **Applied to Production 2026-06-29** (`20260628190357`) — no legacy BOQ backfill |
| `014_factor_f_publish_2569_0_0.sql` | Publish Factor F `2569.0.0` from กค 0433.2/ว 481 and move the default pointer | **Applied to Production 2026-06-29** (`20260628190621`) — no legacy BOQ backfill |
| `015_factor_f_repair_legacy_snapshot_metadata.sql` | Repair missing legacy Factor F snapshot metadata for BOQs whose saved `factor_f` exactly matches `2566.0.0`; does not bind legacy BOQs to a version | **Applied to Production 2026-06-29** (`20260628190757`) — no reprice and no legacy version backfill |
| `016+_master_catalog_phase4_*.sql` | Master Catalog Phase 4 database migrations | **Planned — next database migration range after completed Factor F rollout** |

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

Supabase MCP verified Production on 2026-06-29 after Factor F rollout:
remote migrations `012` through `015` are applied, current default Factor F is
`2569.0.0`, historical baseline `2566.0.0` remains active, `bound_boq_count = 0`
for legacy BOQs, and partial legacy Factor F snapshots remaining is `0`. The
post-rollout closeout is recorded in
[10-production-rollout-closeout.md](../plans/factor-f/10-production-rollout-closeout.md).
Master Catalog Phase 4 database migrations start at `016+`.

`010a_master_catalog_phase1a_indexes.sql` is an operational runbook rather than
a transactional migration. Run its `CREATE INDEX CONCURRENTLY` statements one
at a time outside an explicit transaction.

---

## 2. Migration Process

### Local rehearsal

Use `npm run db:local:bootstrap`. It resets Local Supabase to the schema-only
Production baseline, restores scrubbed snapshots, applies root migrations
`009` and `010`, applies all four `010a` concurrent indexes individually, then
applies `011`, Factor F `012` through `015`, and runs the Phase 2 smoke tests.

The CLI remains intentionally unlinked from Production. Do not use `db push`,
`db pull`, or linked diff commands from this worktree. Local migration history
contains no rollout scripts because both the baseline and root Master Catalog
scripts are applied explicitly by the bootstrap script. That script is the
canonical Local rehearsal ledger for this rollout.

### Production execution

Production migrations are run only during an approved execution window through
the reviewed SQL Editor/MCP runbook. Master Catalog `009`, `010`, all four
`010a` indexes, and `011` completed on 2026-06-21; Factor F `012` through `015`
completed on 2026-06-29 without legacy BOQ version backfill. For future
migrations:

1. Open [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Open the migration file
3. Copy entire contents and paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify output messages

> [!IMPORTANT]
> Always run `001_backup_before_migration.sql` queries first to record the current state before applying any new migration.

The Factor F no-maintenance runbook is retained as executed historical
evidence:
[09-production-no-maintenance-runbook.md](../plans/factor-f/09-production-no-maintenance-runbook.md).

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
| **Applied operationally** | Nontransactional runbook statements executed and verified outside the remote migration ledger |
| **Local Baseline Only** | Schema snapshot used only to rebuild Local Supabase; never push to Production |
| **Backup/Utility** | Not a schema change; diagnostic/backup queries |
| **Rollback Utility** | Reversal script, run only if rollback is needed |
| **Draft** | Review and test before applying to production |
| **Planned** | Reserved future work; not implemented or applied |

---

## References

- Historical multi-route guide: [migrations/README.md](../../migrations/README.md)
- Master Catalog change request: [04-change-request.md](../plans/master-catalog/04-change-request.md)
- Master Catalog verification report: [05-verification-report.md](../plans/master-catalog/05-verification-report.md)
- Phase 4 change request: [09-phase4-change-request.md](../plans/master-catalog/09-phase4-change-request.md)
- Factor F no-maintenance runbook: [09-production-no-maintenance-runbook.md](../plans/factor-f/09-production-no-maintenance-runbook.md)
- Factor F rollout closeout: [10-production-rollout-closeout.md](../plans/factor-f/10-production-rollout-closeout.md)
- Database Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
