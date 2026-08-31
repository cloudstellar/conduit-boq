# Release Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-08-31

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current Master Catalog release state:** Phase 4 and P-49 are complete
> end-to-end; see [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed 027
> then 028 with no 029, `2568.1.0` at `710/710`, reviewed prices, unchanged
> Factor F, the three catalog flags plus migration-028 functions/raw
> `app_settings` ACL, and `0` working drafts at that instant; it made no write.
> Older rollout checklists and gates below are historical
> chronology for their release windows, not permission to replay them.

---

## 1. Deployment

Production application deployment is automated by Vercel after a reviewed
pull request is merged into `main`.

Supabase Production DB migrations are separate operations. A code merge or
Vercel deploy must never be treated as evidence that a migration was applied.

### DUP-1 release record — 2026-08-31

Atomic BOQ Duplicate is released and verified. Exact migration 029 was applied
once as `20260831004110/atomic_boq_duplicate` (SHA-256
`748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`),
then PR [#9](https://github.com/cloudstellar/conduit-boq/pull/9) was merged as
`0e76ed39e68746c9bd6003da69a03f096ae482a3` and the matching Vercel Production
deployment reached success.

Database evidence and application evidence were checked separately. Isolated
PostgreSQL, CI, rollback-scoped Production functional proof, desktop/mobile
rendered QA, an expected live PostgREST fail-closed probe, and final
`263/326/2617/0` BOQ/route/item/request-ledger no-residue postflight passed.
Catalog and Factor F hashes/pointers remained unchanged. The complete receipt
and residuals are in the
[DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).

That one-shot release authority is consumed. Do not replay migration 029 or
infer authority for LIST-1, Quantity Expression, another deploy, or another
Production write.

## 2. Pre-Release Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Migration execution window approved separately (if any)
- [ ] Owner approval

## 3. Master Catalog Baseline

As of 2026-06-21, Production Master Catalog Phase 0 → 1A → 2 → 1B is complete.
Migrations `009`, `010`, four operational `010a` indexes, and `011` were
applied/verified; Phase 2 was merged through PR #2 and deployed by Vercel.
See the [verification report](../plans/master-catalog/05-verification-report.md).

**Historical pre-Phase-4 snapshot:** At this document's 2026-06-22 baseline,
Phase 4 administration/publication had not started and was governed by the
[Change Request](../plans/master-catalog/09-phase4-change-request.md). That
dated boundary is retained as release chronology; current completion and
no-replay authority are #106/#107 above.

## 4. Versioning

Historical application-version snapshot (2026-06-22): **v1.2.0**

---

## References
- Roadmap: [01_overview/ROADMAP.md](../01_overview/ROADMAP.md)
