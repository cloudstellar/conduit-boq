# Change Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Aligned:** 2026-10-23 — local documentation only

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

Use [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
for current proposed work and Owner/IT decisions. This process describes later
approved work; the current authorization covers local documentation alignment
only, with no commit/push, deployment, package/runtime, account/data or database
operation. A plan or local edit never supplies the next operation's authority.

---

## 1. Database Changes

### Migration Workflow
Migrations 027–031 are applied-once immutable/no-replay artifacts. A later
database change needs fresh approval and a new forward migration; use an
approved current-equivalent test baseline rather than replaying these files.

1. Create and review the migration file in `/migrations/`.
2. Rehearse on a non-production database.
3. Record applicable backup/recovery evidence, preflight results and Owner
   approval. Recreating local synthetic test data does not itself require a
   new backup or a separate test stack.
4. Apply the approved migration to Production DB in its execution window.
5. Run post-migration verification and smoke tests immediately.

The completed 031 window is not reusable authority. Its advisory key did not
exclude unrelated privileged function/security DDL; any separately approved
future forward correction needs the applicable concurrency and recovery guards,
not a replay of 031 or an automatically scheduled new DB task.

### Guardrails
- Backfill BEFORE `SET NOT NULL`
- Log columns NOT NULL: `action`, `table_name`, `created_at`
- Atomic transactions for schema changes
- Repository merge and Vercel deploy do not apply Supabase migrations.

## 2. Code Changes

### Review and Integration Workflow
1. Agree a bounded local candidate, target environment and applicable approvals.
2. Prepare the diff and run checks appropriate to its actual risks; preserve
   evidence limits and required existing checks.
3. Review the concrete candidate and select the integration path with the Owner.
   Use a pull request when it adds value or is required; a scoped Solo path may
   use direct integration under separate explicit approval.
4. Commit/push/integrate only the reviewed source within the approved scope.
   Local implementation permission does not authorize these external steps.
5. Verify the resulting CI and deployment identities separately. With the
   recorded Vercel setup, a `main` push may deploy automatically, including a
   docs-only push; confirm behavior/target before publication.

A pull request is a review checkpoint when selected, not an extra mandatory
process for every Solo release. Neither integration path applies database
migrations unless a separate explicitly approved execution occurs. Hosting and
SSO cutovers have their own acceptance under #09; this process does not select
their future target or authorize either cutover.

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
