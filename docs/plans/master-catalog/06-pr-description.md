# PR Draft: Prepare Master Catalog v26 Rollout Artifacts

## Summary

Prepare reviewable execution artifacts for the DB-verified Master Catalog v26
rollout. This PR does not apply migrations or change production data.

## Changes

- Add P0 containment migration draft.
- Add Phase 1A nullable versioning migration draft.
- Add Phase 1A concurrent index runbook draft.
- Add Phase 1B hardening migration draft.
- Add change request and rollout verification template.
- Add ADR-002 for versioned catalog and singleton default-pointer decisions.

## Review Order

1. `docs/plans/master-catalog/04-change-request.md`
2. `migrations/009_master_catalog_p0_containment.sql`
3. `docs/plans/master-catalog/05-verification-report.md`
4. `migrations/010_master_catalog_phase1a_versioning.sql`
5. `migrations/010a_master_catalog_phase1a_indexes.sql`
6. `migrations/011_master_catalog_phase1b_hardening.sql`
7. `docs/02_architecture/ADR/ADR-002-versioned-master-catalog.md`

## Production Safety

- [ ] No migration has been applied by this PR.
- [ ] P0 containment is reviewed independently from Phase 1A.
- [ ] Backups and PITR restore point are confirmed before execution.
- [ ] Migration drafts are tested on a non-production database.
- [ ] Owner approval is recorded in the change request.
- [ ] Verification report is completed during rollout.

## Related Documents

- [Proposal](./01-proposal.md)
- [Implementation plan](./02-implementation.md)
- [Audit trail](./03-audit-trail.md)
- [Change request](./04-change-request.md)
- [Verification report](./05-verification-report.md)
