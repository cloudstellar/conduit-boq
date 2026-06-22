# Release Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-06-22

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

Phase 4 administration/publication has not started. It has a separate
[Change Request](../plans/master-catalog/09-phase4-change-request.md), owner
approval gates, feature flag, rehearsal, migration, deploy, and publication
decisions. Approval of Phase 4 planning does not authorize Production work.

## 4. Versioning

Current: **v1.2.0**

---

## References
- Roadmap: [01_overview/ROADMAP.md](../01_overview/ROADMAP.md)
