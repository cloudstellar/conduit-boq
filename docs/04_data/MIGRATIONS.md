# Migrations
## Conduit BOQ System

> **Status:** DRAFT – CANONICAL SKELETON  
> **Last Updated:** 2026-01-22  
> **Source:** Referenced from `migrations/README.md`

---

## 1. Migration History

| File | Description | Status |
|------|-------------|--------|
| `001_backup_before_migration.sql` | Backup queries | ✅ Applied |
| `002_add_multi_route_support.sql` | Multi-route tables | ✅ Applied |
| `003_add_construction_area_to_routes.sql` | Route areas | ✅ Applied |
| `004_phase1a_auth_ownership.sql` | Auth & ownership | ✅ Applied |
| `005_phase1a_seed_and_rls.sql` | Seed data & RLS | ✅ Applied |
| `006_phase1a_rls_write_and_approval.sql` | RLS write policies | ✅ Applied |
| `007_add_requested_org_columns.sql` | Onboarding v1.2.0 | ✅ Applied |
| `008_rls_and_trigger.sql` | RLS + Trigger + RPC | ✅ Applied |

## 2. Migration Process

<!-- TODO: Absorb from migrations/README.md -->

## 3. Rollback Procedures

<!-- TODO: Absorb from migrations/README.md Rollback section -->

---

## References
- Migration Guide: [migrations/README.md](../../migrations/README.md)
