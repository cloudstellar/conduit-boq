# Phase Guardrails
## Conduit BOQ System

> **Status:** CANONICAL - MASTER CATALOG v26
> **Last Updated:** 2026-06-02
> **Source:** `docs/plans/master-catalog/02-implementation.md`

---

## Master Catalog v26 Rollout

**Strategy:** P0 Containment Hotfix → Quality Baseline → Phase 1A Nullable Setup → Phase 2 Application → Phase 1B Hardening

### Current State

- [x] Repository quality baseline merged into `main` via [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1), merge commit `6d607f9`
- [x] Lint, automated tests, build, [GitHub Actions Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106), and Vercel Production deployment passed
- [x] Hardcoded legacy Supabase `anon` key removed from utility scripts in current HEAD
- [ ] Production DB P0 containment migration `009` applied
- [ ] Master Catalog migrations `010`, `010a`, and `011` applied

Merging the quality baseline changed repository code and triggered Vercel
deployment. It did not apply any Production DB migration.

1. Rehearse `009_master_catalog_p0_containment.sql` on non-production.
2. Apply `009_master_catalog_p0_containment.sql` as an independent production
   security hotfix and stop unless P0 gates and smoke tests pass.
3. Confirm the repository quality baseline: lint, build, automated tests,
   latest `main` CI, and dependency-audit disposition must pass.
4. Rehearse the full Master Catalog rollout on non-production.
5. Apply `010_master_catalog_phase1a_versioning.sql`.
6. Run each `010a_master_catalog_phase1a_indexes.sql` statement separately
   outside an explicit transaction.
7. Stop unless Phase 1A gates pass.
8. Deploy the application integration PR and run automated tests plus smoke
   tests.
9. Run delta category backfill verification.
10. Apply `011_master_catalog_phase1b_hardening.sql`.

Admin import, clone, default swap, and audit-trigger flows remain Phase 4 scope.

---

## Key Integrity Rules

### Rule A: Versioning
| Rule | Implementation |
|------|----------------|
| One active default | Singleton pointer table `price_list_default_version` |
| Default = active | Pointer validation trigger |
| Switch default = atomic | Scoped Phase 4 RPC updates the pointer |
| Active-only BOQ binding | BOQ insert trigger reads the pointer |
| Immutable BOQ version | Phase 1B trigger after smoke tests |

### Rule B: Snapshot
- No auto-update: Changes don't affect existing BOQs
- Standard item category is snapshotted in `boq_items.category`
- Version-aware RPC rejects cross-version item writes

---

## References
- [Master Catalog implementation plan](../plans/master-catalog/02-implementation.md)
- [Change request](../plans/master-catalog/04-change-request.md)
- [Verification report](../plans/master-catalog/05-verification-report.md)
