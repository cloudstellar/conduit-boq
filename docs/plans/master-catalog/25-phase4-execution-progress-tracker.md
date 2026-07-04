# Master Catalog Phase 4 Execution Progress Tracker

**Status:** Not started
**Purpose:** Owner-facing progress tracker for Master Catalog Phase 4 local
implementation and rehearsal. This file is for quick status review; authority
remains in the Decision Register, Execution Pack, DB Contract, Runbook, and
Verification Report.

## 1. Update rules

Update this tracker whenever work pauses, a work package changes status, a
blocker appears, or evidence is produced.

Do not mark a work package complete unless its exit gate is satisfied and the
evidence reference is recorded here or in the Verification Report.

Allowed statuses:

- `Not started`
- `In progress`
- `Blocked`
- `Ready for owner review`
- `Complete`

## 2. Current dashboard

| Field | Current value |
|---|---|
| Current branch | Pending |
| Current commit | Pending |
| Current work package | WP-0 |
| Current environment | Local only |
| Production write allowed | No |
| Feature flag default | Disabled |
| Latest owner decision needed | None before WP-0 readiness report |
| Next owner review point | WP-0 readiness report before WP-1 starts |
| Last updated | Pending |

## 3. Work package checklist

| WP | Scope | Status | Exit evidence | Owner review |
|---|---|---|---|---|
| WP-0 | Branch, dependency, codebase, docs, and read-only DB readiness | Not started | Branch name, git state, doc/code/db facts, blockers | Required before WP-1 |
| WP-1 | Additive database foundation `016+` on Local | Not started | Local migration, schema/RLS/grants/function tests | Review if DB contract mismatch |
| WP-2 | Parser and canonical hash implementation | Not started | Golden fixtures, cross-runtime hash tests, validation tests | Review if parser profile changes |
| WP-3 | Admin read/draft UI shell behind disabled flag | Not started | Local UI smoke, auth/role behavior, responsive checks | Review if UX scope changes |
| WP-4 | Draft mutation, import, manual edit, and history | Not started | Draft apply tests, audit snapshots, stale/duplicate request tests | Review on data-contract mismatch |
| WP-5 | Publish, pointer restore, and audit on Local | Not started | Local publish/restore tests, pointer/immutability checks | Review before treating publish path as ready |
| WP-6 | Official Excel/PDF export | Not started | DB-generated export, count/hash, visual/accessibility checks | Final P-11 artifact acceptance pending |
| WP-7 | BOQ and Factor F regression preservation | Not started | BOQ save/print/export regression, Factor F before/after assertions | Required before WP-8 complete |
| WP-8 | Clean Local rehearsal and Verification Report | Not started | Clean reset, full workflow, test/lint/build/advisor evidence | Required before any P-12 request |
| WP-9 | Production migration/deploy/enable/publish | Not authorized | P-12 through P-15 sequential approvals | Separate Production readiness review required |

## 4. Owner pause points

| Pause point | Trigger | Required owner action |
|---|---|---|
| WP-0 readiness | Before writing WP-1 migration | Review branch/git/db/doc findings and blockers |
| DB contract conflict | Code/database reality contradicts approved contract | Decide whether to amend plan or implementation |
| Data decision conflict | Reconciliation or live DB contradicts P-02 through P-11 | Decide before freezing candidate data |
| P-11 final artifact | Real DB-generated Excel/PDF exists | Accept/reject final visual/export artifacts |
| WP-8 completion | Clean Local rehearsal passes | Review readiness evidence before any P-12 request |
| P-12 | Production migration window requested | Approve or reject Production migration |
| P-13 | Deploy requested after migration verification | Approve or reject deployment |
| P-14 | Feature enablement requested after admin smoke | Approve or reject enablement |
| P-15 | Exact named version publication requested | Approve or reject publication metadata, diff/count/hash, and filing evidence |

## 5. Evidence log

| Date/time | WP | Evidence | Result | Notes |
|---|---|---|---|---|
| Pending | WP-0 |  |  |  |

## 6. Blocker log

| Date/time | WP | Blocker | Decision needed | Status |
|---|---|---|---|---|
| Pending |  |  |  |  |

## 7. Handoff note template

Use this template at the end of each implementation session:

```text
Current WP:
Status:
Branch:
Latest commit:
Files changed:
Evidence produced:
Tests/checks run:
Blockers:
Owner decisions needed:
Next safe step:
Production touched: No
```
