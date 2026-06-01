# Change Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-06-02

---

## 1. Database Changes

### Migration Workflow
1. Create and review the migration file in `/migrations/`.
2. Rehearse on a non-production database.
3. Record backups, preflight results, rollback plan, and owner approval.
4. Apply the approved migration to Production DB in its execution window.
5. Run post-migration verification and smoke tests immediately.

### Guardrails
- Backfill BEFORE `SET NOT NULL`
- Log columns NOT NULL: `action`, `table_name`, `created_at`
- Atomic transactions for schema changes
- Repository merge and Vercel deploy do not apply Supabase migrations.

## 2. Code Changes

### Branch and Pull Request Workflow
1. Create a scoped branch.
2. Commit and push the reviewed changes.
3. Open a pull request targeting `main`.
4. Review diff and required quality checks.
5. Merge the pull request only after approval.
6. Vercel deploys Production automatically from `main`.

The pull request is a review checkpoint. It does not change Production until
merged, and it does not apply database migrations unless an explicitly
approved migration command is run separately.

### Before Writing Code
- [ ] Read relevant existing code
- [ ] Check for existing patterns
- [ ] Verify database schema assumptions
- [ ] Identify downstream changes

### After Writing Code
- [ ] Verify no TypeScript errors
- [ ] Check imports are correct
- [ ] Ensure consistency with patterns
- [ ] Update tests if applicable

---

## References
- Migration Guide: [04_data/MIGRATIONS.md](../04_data/MIGRATIONS.md)
