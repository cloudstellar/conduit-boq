# Dependency security — local candidate and acceptance follow-up

**Recorded:** 2026-10-23 (Asia/Bangkok)  
**Status:** LOCAL CANDIDATE / NOT RELEASE READY — stale-Copy HTTP gate remains FAIL

**Later A-only Production closeout — 2026-10-23:** the Owner subsequently
approved the exact A8 Solo publication with the named stale-Copy exception.
Commit `a3114fc` is on main and Vercel Production Ready/Current; Quality643,
additional Node24 host/native checks and production audit0 passed. Use the
[A release receipt](./DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
for hosted/public-HTTP evidence and NOT RUN limits. This document's candidate
status above is the earlier local-test instant. Stale Copy remains FAIL; A's
exception/publication authority are consumed. B/031 remain unapproved and no
DB operation/migration occurred. These closeout docs are local, not a second push.

**Later explicit A-only exception accepted — 2026-10-23:** the Owner accepted
the preserved stale-Copy FAIL for this exact dependency release and requested
A first, B separately. The historical failed result above remains unchanged;
the exception decision is no longer pending and must not be requested again.
Use the [review plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md)
for frozen A8, expiry/stop conditions and steps. No other failed/new gate is
waived; no commit/push/deploy or Production access is authorized by acceptance.
Earlier pending/no-exception statements below preserve their dated chronology.

**Later source separation — 2026-10-23:** [local release preparation](./LOCAL_RELEASE_CANDIDATES_20261023.md)
records an exact A-only snapshot: 643 tests, lint, TypeScript and default build
PASS; fresh Production audit 0; actual Linux x64 Production-only install and
Sharp native smoke PASS. The lower test count excludes six separate baseline
tooling tests. No DB-write test, migration or Production access occurred in
this continuation. The predecessor stale-Copy FAIL still needs the Owner's
named decision before a dependency-first release; no exception is inferred.

**Later separate local correction:** [031/client result](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md)
records fresh **49/49 API PASS** and real two-tab recovery on captured baseline
plus 031. This does not rewrite the predecessor failure reported here or merge
the RPC correction into the isolated dependency release. Combined working-tree
tests pass; separate release order/any named exception is still undecided and
no publication or Production operation is authorized.

The Owner approved the bounded package/lockfile patch, then seven lint fixes in
five application files, testing against the existing Docker local target, and
the subsequent real-Next Placement verification. No commit/push/deploy or
Production access is authorized. No database reset, schema/RPC change, Catalog
or Factor mutation, account change, or replay of migrations 027–030 occurred in
these dependency/lint/follow-up tasks. The earlier separately approved baseline
rebuild remains recorded in [Local Parity Result](./LOCAL_DATABASE_PARITY_RESULT.md).

## Candidate source and scope

- Repository: `/Users/cloud/Cloudstellar/conduit-boq`, `main` at
  `b144bcae98b543ab231c503f435f261f946b9f89`; candidate remains uncommitted.
- Packages: `next` and `eslint-config-next` **16.2.9 → 16.4.2**; PostCSS
  override **8.5.15 → 8.5.23**. The npm-generated lock also resolves Sharp
  **0.34.5 → 0.35.5** and reviewed vulnerable transitive nodes. No audit-fix
  command, forced downgrade or broad package update was used.
- React/React DOM remain `19.2.3` in the manifest/lock. App Router uses Next's
  bundled React runtime; that distinction matters for the Placement follow-up.
- Lint fixes cover Placement restore/success cleanup, Create loading/profile
  defaults, Price List filter/page reset, mobile subscription and Dashboard
  loading/request completion. Queries, calculations, permissions and RPC
  contracts remain unchanged. One existing source-contract test was adjusted.
  No ESLint rule was disabled, and `eslint.config.mjs` remains unchanged.
- Existing roadmap/docs/baseline work is separate and preserved. The following
  eight files identify the application candidate; they do not include that
  separate documentation/tooling changeset.

| Candidate file | SHA-256 |
|---|---|
| `package.json` | `5b6668e82f9919b3058b87cbaec47d294abd8d46d6f7444cffa62bf0686d8c05` |
| `package-lock.json` | `fa4f316d70a37b972f7b4b26755e2dbf712f22bdcc519ac99aa890ac25fcbc2f` |
| `app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx` | `829caf312287ba9fe4474ea829abe4464fb2bec3c18bd5dfed70ea5d213aa912` |
| `app/boq/create/page.tsx` | `f176207b6f28db8e02e1571db4df4d525d739cadd980a7dbf7787ab3e3dfd501` |
| `app/price-list/page.tsx` | `17406caaaac508bb136b234632284ff477d8d4b62e70489233fedfbcaf956636` |
| `hooks/use-mobile.ts` | `f881bf529556614edecaadafdb8c9fc096bc7027687bf72444f78ab8dc34bf55` |
| `lib/hooks/useDashboardData.ts` | `5cae24d49fbb8ab9ad2c9a4e414d46423e67795e6420c10177ab75c22f915b29` |
| `tests/master-catalog-operator-workflow.test.ts` | `33c46a28e186f1d009ed66b2bb572c716b038019ed5c8b69e02f7b07e9f4f497` |

The eight-file `git diff` receipt has SHA-256
`980b461642e740eca5363e4f2fbaa48c30c9188921e11260fc5a25143575b6d9`.

## Executed checks and boundaries

| Check | Actual result / limit |
|---|---|
| Install and runtime | Clean `npm ci` PASS on temporary official Node 22.23.4; no global Node installation change |
| Production dependency audit | **0 findings** on the resolved package graph, before the lint-only source fixes; manifest/lock hashes remain identical |
| Full dependency audit | **11 findings** remain, classified as development dependencies; no blanket security PASS |
| Production-only native dependencies | Darwin arm64 and Linux arm64 Sharp encode/decode PASS; Linux amd64 NOT RUN |
| Latest full lint | **PASS: 0 errors / 3 previously reported warnings** outside the approved seven-error scope |
| Latest unit suite | **57 files / 649 tests PASS**; the first run's obsolete source-assertion failure is preserved separately |
| TypeScript and application build | **PASS**; Next 16.4.2 production Turbopack build, public Supabase configuration pinned to loopback |
| Existing Docker target | `conduit-boq-local`, API `http://127.0.0.1:55321`, DB port 55322; same container `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966` |
| Relevant local metadata before/after lint UI checks | **PASS:** captured application contracts match with the same three exact platform mappings; 0 unexplained differences |
| Actual post-lint Docker browser flows | Dashboard own/team/catalog data; Create → real local insert → editor → reload; active Price List search; read-only Admin overview **PASS**; no unexpected console errors |
| Synthetic BOQ created in that UI check | `a9585879-4745-48a3-a8e8-ef081d97057e`, project `LOCAL LINT 20261023 Create regression`; remains local test data |
| Actual browser size | Measured 654 × 762; requested viewport overrides did not alter that measurement, so no separate desktop/mobile-size PASS is claimed |
| Actual-hook browser harness | **9 PASS:** loading, metrics, stale request/user changes, retry, inactive profile, 767/768 boundary and listener cleanup; backend responses mocked |
| Create/Price List browser harness | Error/retry, profile arrival/refresh, project-field preservation, changed Catalog pointer denial before insert, and search/category page reset **PASS**; backend responses mocked |
| Existing real JWT/API/RPC acceptance | **46 PASS / 1 stale-Copy FAIL**, preserved from the earlier dependency/baseline receipts; the known hanging request was not repeated |

## Placement uncertainty resolved in real Next.js

The earlier Vite harness cleared the uncontrolled reason after a simulated
error in both unchanged HEAD and the lint-fixed component. That result remains
in the earlier evidence; it is not rewritten as an application regression or
as a passing database test.

The follow-up ran a temporary **production-mode Next 16.4.2 App Router** app
with real `use server` actions and a synthetic in-memory server ledger. Current
and HEAD Placement components, their unchanged operation hook and error alert
were copied and checked byte-for-byte. Next used its normal bundled React
`19.3.0-canary-278794d7-20261002`; there was no React alias to the standalone
Vite runtime, no package installation and no repository application edit.

**14/14 checks PASS: seven checks for each component**:

1. Reason remains visible/live after the real Server Action returns error.
2. Native reset is cancelled: `defaultPrevented=true` at bubble and after the
   microtask, with the same connected form and unchanged live reason value.
3. Retry succeeds without retyping.
4. Request ID remains identical across the two server calls.
5. Placement payload remains identical across the two server calls.
6. Successful result closes confirmation.
7. Successful result clears the synthetic storage scope.

No console warnings/errors were captured. This closes the reason-retention
UI uncertainty without a further application fix. It compares old/new component
code on the **same current Next runtime**, not old/new Production deployments.
Initial child SSR, actual Catalog persistence/authorization and database
idempotency are outside this temporary harness. Local has zero Catalog drafts;
none was created to expand the test scope.

Source inspection explains the earlier harness difference: standalone
`react-dom@19.2.3` resets forms while synthetic event dispatch is disabled;
Next's bundled React temporarily enables it around reset, allowing the existing
`onReset` cancellation hook to work. [React's form documentation](https://react.dev/reference/react-dom/components/form)
describes automatic reset of uncontrolled fields after a resolved Action;
returning an application error object still requires the application's reset
handling. Live `.value`, default value and the HTML attribute were recorded
separately to avoid confusing a DOM snapshot with the current input property.

## Earlier stale-Copy finding and proposed discovery

The following records the state before the separately approved metadata read
and local 14.5 retest below. Preserve the earlier 14.13 failure as chronology;
the later result supersedes the UNKNOWN version and proposed-discovery state.

The deterministic stale-source guard uses SQLSTATE `40001` before copy inserts.
Local PostgREST **14.13** retries it indefinitely; the browser/SDK cannot receive
the intended reload-source error. The [official Supabase explanation](https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions)
documents this behavior and its PostgREST 16 correction. The captured Production
metadata records **PostgreSQL 17.6**, not the PostgREST binary version;
Production transport version and impact remain **UNKNOWN**.

The smallest proposed next discovery is one separately approved, read-only
[Management OpenAPI request](https://supabase.com/docs/reference/api/v1-get-database-openapi)
with `schema=public`, using existing authorized `database:read` access. The
response contains schema metadata; retain only `info.version` and sanitized
provenance, not business rows or credentials. No such request has been made. An absent or
customized version must remain UNKNOWN; do not infer it from PostgreSQL or
probe a business RPC. Do not change permissions to obtain the specification.

After discovery, choose one bounded scope before changing anything:

- If a fixed Production transport is confirmed, review matching the existing
  local REST service/configuration without a DB reset or schema/RPC change.
- Alternatively, separately approve a forward RPC/client contract correction
  using a non-retrying business-conflict code and staged legacy `40001`
  compatibility. Preserve identity, ACL/configuration, locking, idempotency,
  prices and calculations. Never edit/replay 029 or treat every HTTP 409 as stale.

Real local JWT/HTTP acceptance must then prove a prompt stale error, correct
reload action, no copy/route/item/ledger residue or surviving retry activity,
and normal/idempotent/selected-Factor Copy regressions. No exception has been
granted for this candidate, and no RPC/platform fix is authorized by this result.

## PostgREST 14.5 alignment and stale-Copy retest — 2026-10-23

**Result: local runtime alignment PASS; one fresh stale-Copy HTTP case FAIL.**
The candidate remains **NOT RELEASE READY**. This is one new case, not a fresh
47-case run; the historical 46 PASS / 1 FAIL evidence remains unchanged.

The Owner separately approved one read-only Production Management OpenAPI
request. At `2026-10-23 03:35:43 +07`, exactly one GET returned HTTP 200 and
direct `info.version` **14.5** with the normal Swagger 2.0 marker. The full
192,260-byte specification remained in memory; retained response SHA-256 is
`89a171ac6bc0bc319e155ca470c4b868aa1aa31431f249888c4a3a3f88af84b1`.
This is the version reported by metadata, not executable inspection; a custom
root specification can override it. No business rows/RPC or Production writes
were involved. That one-request authority is consumed, not standing access.

The Owner then approved replacing only the existing local REST service with
14.5 and rerunning stale Copy, without DB reset, migration replay or Production
access. Actual target and results:

| Check | Observed result |
|---|---|
| Local REST | `supabase_rest_conduit-boq-local`, container `c02ea22b2f5d843cf670ba711a53741100caaa6b9c4d08a844b14fa33fd80c2c`; actual binary `PostgREST 14.5` |
| Image | `public.ecr.aws/supabase/postgrest:v14.5`, image/digest `sha256:b574528fe109c8343c1247155734d03df8c34b462f342dca0ccc20244fc36ef9`, Linux arm64 |
| Runtime preservation | Same env, command, user, HostConfig, network and `rest` alias; original endpoint IP `172.19.0.5` retained explicitly. Image-provided OCI labels follow the new image. All six remaining containers, including DB, retain their identity/configuration; DB start time and volume are unchanged |
| Schema/security before and after | Existing semantic verifier PASS against the captured contract: 30 tables, 96 functions, 27 triggers, with the same three accepted platform mappings and no unexplained drift |
| Real JWT preflight | Existing synthetic owner login/profile and owned source visibility PASS; no account/fixture seeding or password replacement |
| Stale request | Exactly one actual `duplicate_boq_atomic` POST, fresh request UUID, existing synthetic source `94166ac6-d198-4b96-94a0-a4241331728a`, expected token `2000-01-01T00:00:00Z`, preserve mode |
| Required error | **FAIL:** timed out after 15,003 ms; SDK status `0`, empty error code, no HTTP response or required `40001` delivered |
| Residue and cleanup | All 30 public/private table counts and fingerprints unchanged, including source/BOQ/routes/items/copy ledger/authorization events, Catalog/Factor/profiles/settings. Continuing Copy activity was sampled after timeout; restarting only the new REST ended it. No surviving Copy backend; authenticated source read PASS afterward; test session signed out |

The first replacement attempt stopped on a strict config comparison and
successfully restored the original REST. Docker had merged an image-provided
OCI label. The second attempt kept exact runtime settings and checked the new
image's metadata separately; it passed. Both attempts are retained. The old,
stopped REST container was removed only after postflight, without volumes;
the old image remains cached. No DB service was stopped or recreated.

The existing CLI version cache `supabase/.temp/rest-version` now contains
`v14.5` (ignored locally). CLI 2.107.0 uses that cache for this PostgreSQL 17
project when creating REST; it does not alter a running service. A future
`supabase link`/cache refresh can overwrite it, so verify the actual binary
before future acceptance. No CLI stop/start/link/reset was run here.

Application/package/lockfile and migration 027–030 hashes are unchanged by
this task. No migration/schema/RPC correction, BOQ/reference/profile mutation,
Production request, Git publication or deployment occurred in the local retest.
Normal Auth session bookkeeping is separate from the unchanged application
table fingerprints. The PDF deferral remains intact.

Matching 14.5 did not resolve the failed contract. A separately approved
forward RPC/client correction using a non-retrying business-conflict code is
the proposed next small scope, preserving ACL/configuration, locks, idempotency,
prices/calculations and legacy compatibility. Never edit/replay 029 or treat
every HTTP 409 as stale. Production business impact remains untested; this
result does not authorize another Production read, write or platform upgrade.

Host-local evidence:

- `/private/tmp/conduit-boq-prod-postgrest-metadata-20261023-ondy26w3/receipt.json`
- `/private/tmp/conduit-boq-local-parity-rest145-20261023-9_gxyjcd/`: `switch-result.json`,
  `stale-copy-result.json`, `verify-before.json`, `verify-receipt.json`,
  `final-runtime-verification.json`, `data-before.json`, `stale-data-final.json`,
  `version-cache-receipt.json`, and preserved `switch-attempt1-evidence/`.

## Owner PDF decision

The Owner reports that a long typed note overflows and produces the column
misalignment, while their usual Production documents have normal columns.
The Owner explicitly chose **no print/PDF layout fix** because this case is
rarely used. Preserve this deferral; do not reopen it as a prerequisite or infer
that every Production PDF is defective. Print source remains unchanged.
Earlier numerical/output PASS and the observed local layout issue retain their
original scopes; neither receipt is rewritten to erase the other.

## Exact host-local receipts

- Dependency graph/audit evidence:
  `/private/tmp/conduit-boq-dependency-patch-20261023-eEhFu9/patch-result.json`.
- Lint candidate/source and Docker browser evidence:
  `/private/tmp/conduit-boq-lint-fix-20261023-9tz3ggq5/result.json`.
- Real Next follow-up:
  `/private/tmp/conduit-boq-placement-next-qa-20261023-m63_tubh/browser-acceptance.json`,
  `current-error.json`, `current-retry-success.json`, `head-error.json`, and
  `head-retry-success.json` in that same directory.
- Byte/runtime build provenance:
  `/private/tmp/conduit-boq-placement-next-20261023-bk361s7k/source-manifest.json`
  and `pre-browser-receipt.json`.

These are dated host-local receipts, not a new Production release or standing
authority. Existing baseline metadata remains in the repository. Migrations
027–030, protected archive and Owner backup files are untouched.
