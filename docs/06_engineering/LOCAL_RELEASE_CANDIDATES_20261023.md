# Separate local release candidates — 2026-10-23

> **Later orientation — C documentation alignment, 2026-10-23:** the original
> preparation and A-stage addendum below are retained unchanged as chronology.
> [A](./DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md),
> [B client/031 final closeout](./STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) and
> [L1 Production](./LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) subsequently
> completed. Latest recorded app source is `b1ce449`; B Production HTTP remains
> **NOT RUN**, closed rather than a pending mandatory probe. 027–031 are
> immutable/no-replay. Current approval is local alignment of 48 Markdown files
> and doc checks only; nine parity tooling/baseline artifacts remain excluded
> and unchanged. No publication, Production or DB operation is authorized.

**Status:** LOCAL SOURCE VALIDATION PASS; NO PUBLICATION/PRODUCTION AUTHORITY

**Later A-only publication:** the Owner subsequently approved the Solo A route.
Exact A8 commit `a3114fc` is now on main and Vercel Production Ready/Current;
see the [A release receipt](./DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md).
Its named stale-Copy exception/publication authority are consumed; B/031 remain
local/unapproved. This document's preparation/plan-only passages below preserve
their earlier stage. The published commit excludes this document and all C work.

## Later Owner decision — A exception accepted; plan only

The Owner explicitly accepted the preserved stale-Copy FAIL temporarily for the
exact dependency release A, and selected A first then B separately. This is now
**ACCEPTED**, not a pending exception. Use the [two-release plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md)
for its exact source, bounds, consumption at A closeout, steps and remaining
execution approvals. Do not ask again for the same A exception or carry it to
B. Earlier no-waiver/order-undecided statements below record the preparation
instant before this later decision. No publication, Production operation,
runtime change, DB test/reset or migration is authorized in this planning step.

After the [read-only 031 audit and authority correction](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md#authority-correction-and-prospective-continuation--2026-10-23),
the Owner permitted local continuation prospectively. This work corrected the
authority record, documented the future 031 execution conditions and tested
separate source snapshots. It did not change 031 SQL, application source,
package/lockfile, current Docker DB, accounts or reference data. No reset,
migration application/replay, staging, commit/push/deploy or Production access
occurred. The earlier unapproved 031 operation remains recorded as such.

## Source separation

Base is `main` HEAD `b144bcae98b543ab231c503f435f261f946b9f89`.
The canonical checkout remains dirty with the existing work preserved; nothing
was staged. Temporary source copies came from `git archive HEAD` plus exact
allowlisted current files. They are not Git worktrees or new database stacks.
All other snapshot source files retain the HEAD bytes. Dependencies were
copied locally for checks; no package install changed the canonical checkout.

| Candidate | Exact contents and limit |
|---|---|
| **A: dependency/lint only** | HEAD plus the original eight-file candidate listed below. No 031 or stale-client patch. This is the first proposed release |
| **A+B: stale-Copy successor** | A plus `lib/boq/duplicate.ts`, `tests/duplicate-boq-client.test.ts`, and new `migrations/031_boq_duplicate_stale_conflict_guard.sql`. It also carries the exact local API harness file for evidence; its successor-specific changes belong to B while the shared baseline harness belongs to C |
| **C: baseline/roadmap/documentation tooling** | Existing separate uncommitted work. Not automatically included in A or B. Its six local-parity tests explain the earlier suite count difference |

A's eight files, with hashes frozen in the [dependency result](./DEPENDENCY_SECURITY_LOCAL_RESULT.md#candidate-source-and-scope):

- `package.json`, `package-lock.json`.
- `app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx`.
- `app/boq/create/page.tsx`, `app/price-list/page.tsx`.
- `hooks/use-mobile.ts`, `lib/hooks/useDashboardData.ts`.
- `tests/master-catalog-operator-workflow.test.ts`.

Snapshot manifests contain 522 source files for A and 524 for A+B. They include
the unchanged HEAD documentation/configuration as comparison context; their
file inventory is not a proposal to republish all documentation. The manifest
SHA-256 hashes sorted relative paths and file hashes; it is not a Git tree or
commit identity:

- A: `af0ffb577e929aa0442b849d5b97358e3534896865299dad3b93a1f2ea0f5303`.
- A+B: `837a71f4b720eb6449040332d1a6bdbedbdfab441e48d2324fd874ac47f1ad9c`.

The only A → A+B file differences are the three B files above and
`scripts/smoke-local-db-parity.mjs`. Preserve that support-file distinction
when reviewing/staging later; an untracked shared harness must not accidentally
pull the whole baseline programme into an application release.

## Fresh validation on the separated sources

| Check | A | A+B |
|---|---|---|
| Vitest | **56 files / 643 tests PASS** | **56 files / 658 tests PASS** |
| ESLint | **0 errors / 3 existing warnings** | **0 errors / 3 existing warnings** |
| TypeScript | **PASS**, `tsc --noEmit --incremental false` | **PASS**, same command |
| Next production build | **PASS**, actual Next 16.4.2 default Turbopack build | **PASS**, same framework/runtime |
| Public Supabase environment | Explicit loopback `http://127.0.0.1:55321` | Same |
| Database-write/browser acceptance in this continuation | **NOT RUN** | **NOT RUN** |

The earlier 649/664 tests include six tests of C's local parity tooling. Their
absence in these exact source copies is intentional, not six skipped/failing
product tests. No test/rule was disabled. The existing warnings remain in
`app/blocked/page.tsx` and `lib/hooks/useUser.ts`.

A's first temporary-source check preserved three failures because historical
source-closure tests needed read-only Git HEAD metadata; a read-only Git
context fixed that environment without source edits. The first build also
failed to fetch Google Fonts under restricted networking. A subsequent build
hit a Turbopack worker bind failure. Both attempts/logs remain preserved. A
fresh temporary build output, Git context scoped only to tests, and the
required network/loopback worker access produced the passing default build.
No application change, font replacement, mock font or webpack substitution
was used. A+B passed its separated-source checks without those failures.

The native/dependency gap was also checked independently from the unchanged
package/lockfile:

- Fresh `npm audit --omit=dev`: **0 findings**, no audit-fix command.
  The earlier 11 development findings remain separate; this is not a blanket
  security PASS or proof against every unpublished advisory.
- Official Node `22.23.4-bookworm-slim`, pinned manifest digest
  `sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d`.
- Actual container runtime **Linux x64 / Node v22.23.4**: fresh
  `npm ci --omit=dev`, resolved Production graph, Sharp native PNG resize and
  decode all **PASS**. Next 16.4.2, PostCSS 8.5.23 and Sharp 0.35.5 resolve as
  intended; development-only ESLint/Vite/Vitest/XLSX are absent.
- Package/lock hashes stayed exact. This used one disposable Node process
  container, mounted only to its temporary dependency folder, with no secrets,
  DB volume or Docker socket. It was removed on exit; Supabase was not changed.
- Linux amd64 ran through Docker Desktop on this arm64 host. This proves the
  tested native runtime/architecture smoke, not the current Vercel machine,
  deployment configuration, all image formats or Production workload.

## Existing Docker state and reused DB evidence

At `2026-10-23T04:20:17Z` / **23 October 11:20 Bangkok**, a repeatable-read
READ ONLY inspection verified the existing DB/container/start and actual REST
14.5. All **30 application-table fingerprints** still matched the prior
postflight. 031's exact successor function definition and every recorded
`pg_proc` field matched the prior result; active Copy backends were **0**.
No DB-write test ran in this continuation. No test records, credentials,
Catalog/Factor values, pointers or migration ledger were changed.

Current local is still **captured Production baseline plus 031 candidate**.
The frozen source is unchanged. Do not use A-only against that DB to claim
acceptance on the predecessor contract. The earlier pre-031 evidence remains
**46 API PASS / 1 stale-Copy FAIL**, without repeating the known hanging call.

The [031 result](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md) retains the
49 fresh API PASS and real-browser recovery on the combined A+B runtime.
Current source hashes match those receipts. Those observations are reused as
dated evidence, not relabelled as a new API/browser run. The full 664-test
receipt does not itself execute 031 SQL; separate SQL application/refusal
receipts cover that implementation. Selected-Factor stale browser recovery and
browser request-count/token tracing remain outside the captured evidence.

## What is ready, and what remains undecided

The two source candidates and future 031 execution conditions are now
reviewable locally. This is **not blanket release readiness**:

1. Proposed order remains **A first, then B separately** to avoid delaying the
   security update. A first still needs the Owner's explicit named decision
   about the preserved predecessor stale-Copy failure. This continuation grants
   no exception or release permission. Keep the FAIL and its receipts intact.
2. If B is chosen before A, a B-only release on the old dependency tree has
   not been certified. Do not use A+B acceptance as that proof or silently
   reverse the order. No vulnerable old-dependency runtime was installed here.
3. Publication must identify the exact selected files/source and exclude
   unrelated C work. A small direct Solo path can be selected when approved;
   no extra PR, backup, second DB stack or branch cleanup is mandatory.
4. Future 031 execution must follow the [explicit conditions](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md#required-conditions-for-any-later-separately-approved-031-window):
   compatible client first, exact fresh target/predecessor/security checks,
   one operator with no concurrent DDL, a controlled Copy window and no
   unresolved retrying backends. Session termination/restart and Production
   checks require their applicable authority; no automatic reverse or replay.
5. Verify the relevant actual deployment runtime/configuration within the later
   approved release scope. This local work made no current Production claim
   and accessed no Vercel/Supabase/GitHub project or account.

## Host-local receipts

Directory: `/private/tmp/conduit-boq-local-release-prep-20261023-ld_2almp/`.

- `source-preparation.json`, `candidate-A-manifest.json`,
  `candidate-B-manifest.json` and final source/protection verification.
- A: preserved `attempt1-*` / `attempt2-*`, passing `A-vitest.log`,
  `A-lint.log`, `A-build3-build.log`, `A-build3-tsc.log`;
  `quality-A.json` retains the second attempt's FAIL, while
  `quality-A-build3.json` records the successful build/typecheck follow-up.
- A+B: `quality-B-split.json`, `B-split-*.log`.
- `A-audit-production.json`; `linux-amd64/production-runtime-receipt.json`,
  `npm-ci.log`, `linux-command-results.json` and graph/runtime logs.
- `local-readonly-final.json`; the prior protected receipts remain in their
  original directories and were not overwritten.

The canonical runtime/package files, migration 031, migrations 027–030 and
frozen baseline remain unchanged by this continuation. Documentation changes
record the new authority correction and actual result without erasing history.
