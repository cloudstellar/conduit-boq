# Phase Guardrails
## Conduit BOQ System

> **Status:** CANONICAL - MASTER CATALOG v26
> **Last Updated:** 2026-06-01
> **Source:** `docs/plans/master-catalog/02-implementation.md`

---

## Master Catalog v26 Rollout

**Strategy:** P0 Containment → Phase 1A Nullable Setup → Phase 2 Application → Phase 1B Hardening

1. Apply `009_master_catalog_p0_containment.sql` and stop unless P0 gates pass.
2. Apply `010_master_catalog_phase1a_versioning.sql`.
3. Run each `010a_master_catalog_phase1a_indexes.sql` statement separately
   outside an explicit transaction.
4. Stop unless Phase 1A gates pass.
5. Deploy the application integration PR and run smoke tests.
6. Run delta category backfill verification.
7. Apply `011_master_catalog_phase1b_hardening.sql`.

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
