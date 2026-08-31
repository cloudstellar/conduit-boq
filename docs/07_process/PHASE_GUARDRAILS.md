# Phase Guardrails
## Conduit BOQ System

> **Status:** CANONICAL - MASTER CATALOG v26
> **Last Updated:** 2026-06-21
> **Source:** `docs/plans/master-catalog/02-implementation.md`

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current-state addendum (2026-08-29):** Master Catalog Phase 4 and P-49 are
> complete end-to-end. See [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed 027
> then 028 with no 029, `2568.1.0` at `710/710`, reviewed prices, unchanged
> Factor F, the three catalog flags plus migration-028 functions/raw
> `app_settings` ACL, and `0` working drafts at that instant; it made no write.
> The v26 state, counts, and phase gates below are retained as
> historical chronology and do not override the current no-replay boundary.

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> **Later product release:** Atomic BOQ Duplicate is live through migration 029
> and merge `0e76ed39e68746c9bd6003da69a03f096ae482a3`; see
> [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The dated “no 029” line above remains Master Catalog chronology. Migrations
> 027/028/029 are all applied-once/no-replay, and this v26 checklist does not
> authorize another operation.

---

## Master Catalog v26 Rollout

**Strategy:** P0 Containment Hotfix → Quality Baseline → Phase 1A Nullable Setup → Phase 2 Application → Phase 1B Hardening

### Current State

- [x] Repository quality baseline merged into `main` via [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1), merge commit `6d607f9`
- [x] Phase 2 merged via [PR #2](https://github.com/cloudstellar/conduit-boq/pull/2), merge commit `1439a7a`
- [x] Lint, automated tests, build, [GitHub Actions Quality run #15](https://github.com/cloudstellar/conduit-boq/actions/runs/27901449961), and Vercel Production deployment passed
- [x] Hardcoded legacy Supabase `anon` key removed from utility scripts in current HEAD
- [x] Production DB P0 containment migration `009` applied and verified
- [x] Master Catalog migrations `010`, `010a`, and `011` applied and verified

Production rollout through Phase 1B is complete. Final state is 198 BOQs, 1,547
items, 217 routes, and 710 prices with zero invalid version/category rows.

### Live Data Rule

- Normal BOQ create, edit, and duplicate activity before the execution window
  does not require migration draft changes.
- Refresh preflight counts, integrity queries, and backups immediately before
  P0 and again before Phase 1A.
- During the Phase 1A to Phase 2 cutover, run delta category backfill and its
  zero-row assertion before and immediately after the Phase 2 deploy.
- Prefer a brief BOQ write pause during cutover. If writes cannot be paused,
  repeat reconciliation until the assertion returns zero before Phase 1B.

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
8. Run delta category backfill and its zero-row assertion before the Phase 2
   deploy.
9. Deploy the application integration PR.
10. Run delta category backfill and its zero-row assertion again immediately
    after deploy, then run automated tests plus smoke tests.
11. Apply `011_master_catalog_phase1b_hardening.sql`.

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
