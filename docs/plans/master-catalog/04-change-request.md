# Change Request: Master Catalog v26 Rollout

**Status:** Draft for owner review
**Requested date:** 2026-06-01
**Change type:** Database security containment and phased catalog versioning
**Production project:** `otlssvssvgkohqwuuiir`

## Summary

Deploy the DB-verified Master Catalog v26 plan in controlled phases. The first
phase closes an existing anonymous `SECURITY DEFINER` RPC exposure. Later phases
add versioned price catalogs while preserving compatibility with the current
application during rollout.

## References

- [Technical proposal](./01-proposal.md)
- [Implementation plan](./02-implementation.md)
- [Review audit trail](./03-audit-trail.md)
- [Verification report](./05-verification-report.md)
- [ADR-002](../../02_architecture/ADR/ADR-002-versioned-master-catalog.md)

## Scope

| Phase | Migration | Purpose | Production gate |
|---|---|---|---|
| P0 containment | `migrations/009_master_catalog_p0_containment.sql` | Close anonymous RPC access, revoke unsafe privileges, tighten BOQ RLS | Execute first |
| Phase 1A | `migrations/010_master_catalog_phase1a_versioning.sql` | Add nullable catalog versioning, backfill data, deploy full RPC | Execute after P0 verification |
| Phase 1A indexes | `migrations/010a_master_catalog_phase1a_indexes.sql` | Create and verify FK indexes one statement at a time outside an explicit transaction | Execute after Phase 1A |
| Phase 2 | Application PR | Update create, copy, edit, print, dashboard, and price-list flows | Deploy after Phase 1A verification |
| Phase 1B | `migrations/011_master_catalog_phase1b_hardening.sql` | Enforce BOQ version `NOT NULL` and immutable version trigger | Execute after Phase 2 verification |
| Phase 4 | Future change request | Admin catalog UI, import, clone, swap, audit triggers | Explicitly excluded |

## Execution Strategy

Treat P0 containment as an independent security hotfix. It uses the current
production schema and may be executed before the Master Catalog application
work after its own backup, non-production rehearsal, approval, verification,
and smoke tests complete.

Do not start Phase 1A until the repository quality baseline is established:

- `npm run lint` passes.
- `npm run build` passes.
- Automated regression tests and CI are present and passing.
- Production dependency audit findings are remediated or explicitly accepted.
- The full `010 -> 010a -> Phase 2 -> 011` path has been rehearsed on a
  non-production database.

## Production Evidence

Read-only DB inspection on 2026-06-01 confirmed:

| Metric | Value |
|---|---:|
| BOQs | 168 |
| BOQ items | 1364 |
| BOQ routes | 195 |
| Price list rows | 710 |
| Legacy BOQs (`created_by IS NULL`) | 24 |
| Pending users | 4 |
| Procurement users | 0 |
| Duplicate `price_list.item_code` values | 0 |
| Dangling `boq_items.price_list_id` rows | 0 |

Production `price_list` RLS currently uses the policy names
`price_list_select`, `price_list_insert`, `price_list_update`, and
`price_list_delete`. Migration 010 explicitly removes these production names
before installing the versioned-catalog policy allowlist.

The current `public.save_boq_with_routes(uuid,jsonb,jsonb)` function is
`SECURITY DEFINER`, has no internal auth guard, and is executable by `PUBLIC`
and `anon`. P0 containment is therefore required before catalog work.

## P0 Hotfix Preconditions

- [ ] Owner reviewed this change request and migration drafts.
- [ ] Owner approved the P0 production execution window.
- [ ] Latest Supabase restore point confirmed in Dashboard.
- [ ] Logical schema backup completed.
- [ ] Logical data backup completed.
- [ ] Baseline queries recorded in [05-verification-report.md](./05-verification-report.md).
- [ ] `git diff --check` passes.
- [ ] Migration `009_master_catalog_p0_containment.sql` tested on a
  non-production database.

## P0 Hotfix Rollout

1. Run `009_master_catalog_p0_containment.sql`.
2. Run the P0 verification section. Stop unless all P0 gates pass.
3. Run the P0 smoke tests. Stop and forward-fix if any test fails.
4. Record the production result before starting Master Catalog Phase 1A.

## Master Catalog Preconditions

- [ ] P0 hotfix has passed production verification and smoke tests.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Automated regression tests and CI are present and passing.
- [ ] `npm run audit:prod` findings are remediated or explicitly accepted.
- [ ] The full Master Catalog rollout has been tested on a non-production
  database.
- [ ] Owner approved the Master Catalog production execution window.
- [ ] No `price_list` or `factor_reference` changes are scheduled during the
  rollout window.

## Master Catalog Rollout

1. Run `010_master_catalog_phase1a_versioning.sql`.
2. Run each statement in `010a_master_catalog_phase1a_indexes.sql` separately
   and outside an explicit transaction.
3. Run Phase 1A post-verification. Stop unless all Phase 1A gates pass.
4. Deploy the Phase 2 application PR.
5. Run automated regression tests, user-flow smoke tests, and delta backfill
   verification.
6. Run `011_master_catalog_phase1b_hardening.sql`.
7. Run Phase 1B post-verification.

## Rollback Decision

| Failure | Response |
|---|---|
| P0 SQL fails before commit | Transaction rollback; inspect error and forward-fix |
| P0 verification fails after commit | Keep anonymous access closed; forward-fix only |
| Phase 1A DDL fails before commit | Transaction rollback for the failing block; forward-fix and rerun under preflight |
| Phase 1A backfill produces incorrect data | Stop rollout and restore from the approved snapshot |
| Phase 2 application fails | Revert application commit; Phase 1A nullable schema remains compatible |
| Phase 1B assertions fail | Do not harden; repair data and rerun assertions |

## Approval

| Role | Name | Decision | Timestamp |
|---|---|---|---|
| Owner |  | Pending |  |
| Executor |  | Pending |  |
| Verifier |  | Pending |  |
