# PR Record: Master Catalog Quality Baseline

**Status:** Merged to `main` on 2026-06-02
**Merged PR:** [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1)
**Merge commit:** `6d607f9`

## Summary

The merged baseline prepares the repository for the DB-verified Master Catalog
v26 rollout. It does not apply migrations or change production data.

## Merged Changes

- Add automated regression tests and the `npm test` command.
- Add `.github/workflows/quality.yml` for lint, tests, and build checks.
- Fix baseline lint errors required for the quality gate.
- Update rollout guardrails and verification documents.
- Remove hardcoded legacy Supabase `anon` credentials from utility scripts;
  scripts now read environment variables.

## Next Production Review Order

1. `docs/plans/master-catalog/04-change-request.md`
2. `migrations/009_master_catalog_p0_containment.sql`
3. `docs/plans/master-catalog/05-verification-report.md`
4. `migrations/010_master_catalog_phase1a_versioning.sql`
5. `migrations/010a_master_catalog_phase1a_indexes.sql`
6. `migrations/011_master_catalog_phase1b_hardening.sql`
7. `docs/02_architecture/ADR/ADR-002-versioned-master-catalog.md`
8. `docs/02_architecture/ADR/ADR-003-master-catalog-rollout-and-version-numbering.md`

## Production Safety

- [x] No migration was applied by this PR.
- [x] [GitHub Actions Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106) passed on `main`.
- [x] Vercel Production deployment passed after merge.
- [x] Current HEAD contains no hardcoded JWT literal and no tracked `.env`.
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
