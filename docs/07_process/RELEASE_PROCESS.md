# Release Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-06-02

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

As of 2026-06-02, [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1)
has been merged to `main` at `6d607f9`, and Vercel Production deployment
passed. [GitHub Actions Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106)
also passed. Master Catalog migrations `009`-`011` have not been applied.

## 4. Versioning

Current: **v1.2.0**

---

## References
- Roadmap: [01_overview/ROADMAP.md](../01_overview/ROADMAP.md)
