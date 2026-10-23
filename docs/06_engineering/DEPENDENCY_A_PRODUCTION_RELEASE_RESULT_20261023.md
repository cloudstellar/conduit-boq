# Dependency security A — Production release result, 2026-10-23

**Status: A RELEASE COMPLETE — exact source deployed; bounded checks PASS;
known stale-Copy FAIL accepted for A only.** Authenticated BOQ/Print acceptance
was not run in this release. This receipt and handoff updates remain local and
uncommitted; the single published commit contains only the approved A8 files.

## Authority and exact source

The Owner explicitly approved preflight, commit/push/deploy **A only** through
the Solo main route, accepting the known predecessor stale-Copy timeout FAIL
for this release. B and migration 031 remain **NOT APPROVED**. The A exception
is now **CONSUMED**; the defect remains tracked until the separate correction
succeeds. No authority or exception carries into B or another release.

| Identity | Verified value |
| --- | --- |
| Repository / branch | `cloudstellar/conduit-boq` / `main` |
| Parent | `b144bcae98b543ab231c503f435f261f946b9f89` |
| Published A commit | [`a3114fc0eda2eb8d898ad2949ebc71250515df1f`](https://github.com/cloudstellar/conduit-boq/commit/a3114fc0eda2eb8d898ad2949ebc71250515df1f) |
| Git tree | `8ef2acfacf3f22179c278070a4234ad81b3b9bee` |
| Frozen A manifest SHA-256, not a Git ID | `af0ffb577e929aa0442b849d5b97358e3534896865299dad3b93a1f2ea0f5303` |
| GitHub Quality | [run `39907043530`](https://github.com/cloudstellar/conduit-boq/actions/runs/39907043530), job `120261276165`: **SUCCESS** |
| Vercel deployment | [`6WnAcbAV88JxGJ7bHsW5Jgy85pCz`](https://vercel.com/cloudwho-2662s-projects/conduit-boq/6WnAcbAV88JxGJ7bHsW5Jgy85pCz): **Production / Ready / Current** |
| Production domains | `boq.ntconduit.com`, `conduit-boq.vercel.app` |

The commit changes exactly these eight paths; every approved SHA-256 still
matches the [A/B plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md):

- `package.json`, `package-lock.json`.
- `app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx`.
- `app/boq/create/page.tsx`, `app/price-list/page.tsx`.
- `hooks/use-mobile.ts`, `lib/hooks/useDashboardData.ts`.
- `tests/master-catalog-operator-workflow.test.ts`.

The other 514 committed files and source inventory are unchanged. Independent
review verified the parent, tree, allowlist and hashes before push. All 541
inspected working-file bytes were preserved through publication, before these
local closeout-document updates. B/031 and documentation/parity work C were
excluded; the checkout intentionally remains dirty and the index is empty.

Next.js and eslint-config-next are `16.4.2`, PostCSS override `8.5.23`, and
resolved Sharp `0.35.5`. React/React DOM remain `19.2.3`. The reviewed lint
corrections preserve existing behavior; no business or database change is included.

## Preflight and tests

- Fresh `npm audit --omit=dev`: **0 findings**; npm `next` latest was `16.4.2`.
  This is a dated advisory result, not a blanket security certification.
- Exact A snapshot on macOS arm64 Node `24.2.0` / npm `11.3.0`: **56 files /
  643 tests PASS**, lint **0 errors / 3 existing warnings**, default Next
  Turbopack production build and standalone TypeScript **PASS**.
- Six source checks verified all 522 snapshot files against the frozen A
  manifest and parent plus A8, with zero mismatches. Package/lock bytes stayed exact.
- The first restricted-network build failed fetching three public Google Fonts.
  Its receipt remains intact. The unchanged-source rerun with font-network and
  worker access passed; no font mock or alternate bundler was used.
- Linux x64 Node `24.22.1`: production-only clean install, resolved dependency
  graph and Sharp PNG resize/decode **PASS**. Official Node image was pinned to
  `node@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205`.
  Docker Desktop ran x64 through arm64-host emulation. The disposable container
  mounted only its test folder; the existing Supabase containers were unchanged.
- Prior exact-source Node 22 checks and dated Docker/API/browser receipts remain
  valid only within their original scope. No DB-backed acceptance was rerun here.
  Current local DB is captured baseline **plus 031 candidate**, not predecessor
  acceptance. Historical 46 PASS / 1 stale-Copy FAIL is not relabelled PASS.

Read-only Vercel preflight confirmed project/repository, Production branch main,
prior deployment `ru9CP1TCT64BRUa8qgpVX2QZf2ag` from `b144bca`, Node `24.x`,
default Next install/build/output settings and main-push auto-deploy. No settings
were changed. There are no configured deployment checks: the approved Solo route
starts CI and Vercel in parallel, without a CI-before-Production guarantee.

## Hosted result and limits

Quality completed successfully at `2026-10-23T05:41:56Z`, using Node `22.23.3`:
install, lint, **56 files / 643 tests**, and Next `16.4.2` build all passed.
Its full-install log still reports **11 development findings: 8 high / 3 moderate**,
distinct from the fresh production-only audit of zero. Lint retains three known
warnings in the unchanged blocked-page/user-hook code.

Vercel completed deployment at approximately `2026-10-23T05:41:14Z` / **12:41
Bangkok**. The detail page showed Production/Ready and the main domain; the
Overview subsequently identified this exact deployment and commit as the
Production Deployment. Build log explicitly reports Next `16.4.2`, `npm run
build`, build completion and deployment completion. The log's three warnings
concern Vercel npm `cache-dir` configuration and `unrs-resolver` install-script
allowlisting; no npm approval or platform configuration was changed.

Project Node major `24.x` was verified, but the exact hosted patch was not
exposed in the inspected UI/logs. Host/native checks are representative Node 24
compatibility evidence, not a claim about an inspected hosted executable.

| Postflight | Actual result |
| --- | --- |
| Public login before / after | **200 / 200**, title `Conduit BOQ`; HTTP HTML only, no cookies or login submission |
| One same-origin Next script observed in the postflight HTML | **200**, non-empty JavaScript |
| Git state | Local HEAD, upstream and fresh remote main match exact A; no staged changes |
| Authenticated BOQ, saved Print, app browser/console acceptance | **NOT RUN**; no QA actor/sample authorized; Vercel's thumbnail is not browser acceptance |
| Production stale-Copy / Save / normal Copy probe | **NOT RUN**; no business RPC authorized |
| Fresh Production database-state certification | **NOT RUN**; no Supabase/DB access in this release |

## Closeout and next boundary

The release is complete within the approved A scope. The known stale-Copy
timeout remains **FAIL — accepted residual for A**, and this release's exception
is consumed. B remains a separate local candidate, with client publication and
031 execution both unapproved. No second commit/push/deploy follows this receipt.

No database mutation/reset, migration application/replay, account/reference
operation, Catalog/Factor operation or BOQ write was executed. Migrations
027–030 remain immutable/no-replay; 031 was not published or applied/replayed.
Its prior authority correction and the Owner's PDF-layout deferral remain valid.
No rollback/redeploy was performed. Future recovery or B execution needs its
own named scope; reverting to the prior deployment would reopen vulnerabilities.

Host-local evidence: `/private/tmp/conduit-boq-release-A-20261023-77bhpl7q/`,
including `preflight-final.json`, `commit-verification.json`, `release-result.json`,
`audit-production.json`, `github-quality-current.json`, `github-quality-job.log`,
Node 24 host/native receipts, `public-login-before.json`, `public-login-after.json`
and `production-A-ready.png`. Earlier failed and passing evidence remains intact.
