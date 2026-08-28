# Release Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-06-22

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
