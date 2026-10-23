# Local Supabase for Conduit BOQ

Local Supabase uses project ID `conduit-boq-local` and the dedicated port range
`55320-55329`, so it does not collide with the default `5432x` ports used by
other Supabase projects.

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

The existing test target remains the captured baseline plus the applied-once
031 successor. The frozen capture is still its historical source before 031,
not a new full Production snapshot after 031. Relevant contracts were checked
for L1; this documentation task performs no inspection/reset/restore/test.
Original local usernames and `LOCAL_TEST_PASSWORD`, Owner backup/snapshot files
and the protected archive remain untouched. Local PostgREST is recorded actual
14.5; direct Production OpenAPI reported 14.5, while Dashboard 14.1 remains an
unexplained display difference, not permission to change local runtime.

## Current development and hosting boundary — 2026-10-14

The dated overlays and command examples below record earlier preparation
stages. Historical PARTIAL/FAIL results and the local 031 authority correction
remain intact; later release receipts above do not relabel those results. The
unpublished baseline runner is not a restore/test runbook for the current target
after 031.

**Earlier planning decision — 2026-10-23:** the Owner accepted stale-Copy FAIL
temporarily for exact dependency release A and selected A → B separately; see
the [review plan](./07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md).
This supersedes earlier no-waiver status below only for A. It authorizes no
reset, replay, migration, DB test/write or Production operation. Keep local
baseline +031 unchanged; do not roll it back merely to prepare A.

**Later local preparation — 2026-10-23:** see [separate release candidates](./06_engineering/LOCAL_RELEASE_CANDIDATES_20261023.md).
The earlier 031 application lacked explicit migration approval; the Owner's
later permission permits local continuation prospectively. 031 SQL/current DB
remain frozen. Source-only A and A+B checks and Linux x64 native smoke passed;
a READ ONLY postflight matched all 30 table fingerprints and exact 031 metadata.
There was no reset, migration, new DB test data or Production access. Future
031 use needs an exclusive no-concurrent-DDL window and the recorded execution
conditions; there is no stale-failure waiver or publication authority.

**Earlier local conflict candidate — 2026-10-23:** new forward 031 was applied
once on the existing DB and client handling was made compatible. Fresh API
49/49, real two-tab stale denial/reload/new Copy, 664 tests, lint, TypeScript
and build passed. See the [bounded result](./06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).
Local is now **captured baseline plus 031 candidate**, not unchanged Production.
The frozen source is unchanged; a direct baseline-only verification will
correctly detect the intentional function difference. Candidate verification
uses an exact explicit overlay. No reset, 027–030 replay or Production call
occurred; this is not permission to rerun 031, bootstrap or publish anything.

**Later REST-only alignment — 2026-10-23:** existing local REST now runs
`public.ecr.aws/supabase/postgrest:v14.5`, actual binary 14.5, matching the
version reported by the separately approved Production metadata read. All six
remaining containers, including DB, retain their identities/configuration;
DB start/volume, application-data fingerprints and schema contracts were kept.
One fresh stale-Copy HTTP case still FAILed at 15 seconds; the candidate remains
NOT RELEASE READY. See the [canonical result](./06_engineering/DEPENDENCY_SECURITY_LOCAL_RESULT.md#postgrest-145-alignment-and-stale-copy-retest--2026-10-23).
The ignored local CLI cache `supabase/.temp/rest-version` contains `v14.5`;
a future link/cache refresh can overwrite it. Verify the running binary before
acceptance. This follow-up ran no CLI stop/start/link, DB reset or migration.

**Later local execution — 2026-10-23: PARTIAL / NOT RELEASE READY.** The Owner
authorized the bounded local baseline rebuild and testing. Use the
[execution result](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md) and
`scripts/local-db-parity.mjs`; the old bootstrap below is historical. Captured
application contracts match **30 tables, 96 functions and 27 triggers** with
three exact platform mappings. API evidence is **46 PASS / 1 FAIL**; stale Copy
remains a failed gate. Original seven `local.*` logins/profile checks passed
with the existing `LOCAL_TEST_PASSWORD`, and the password/config files were
not changed. Browser Save/reload, saved Print, actual PDF numeric/render checks and the
downloaded Excel were exercised; see the result for their precise limits.
This does not approve Git publication, Production changes or migration replay.

This is a CLI development/test guide, not an internal Production installation
plan. Supabase distinguishes its local CLI stack from hardened self-hosted
Production; see [official self-hosting guidance](https://supabase.com/docs/guides/self-hosting).
[Integrated Roadmap #09](./plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
tracks the unconfirmed IT data boundary, organizational SSO and operational
ownership/restore/cutover decisions. The 2026-10-23 approval covers the named
local preparation and tests, superseding the earlier documentation-only limit
for that scope. Commands are not standing approval for a later reset, broader
account/data work, publication or Production operation.

**Earlier 2026-10-14/15 plan:** the Owner requested a plan for a current-equivalent local baseline, without
changing any database or replaying 027–030. Use
[Local Database Parity Plan](./06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
for final-state capture/materialization, synthetic fixtures and acceptance.
The 2026-10-15 refinement proposes rebuilding the existing `conduit-boq-local`
after execution approval. Recreating synthetic test data does not require a
backup or a separate stack. The Owner's backup/snapshot files remain separate
and untouched; their location/date matters only if selected as restore input.

<a id="current-final-state-runner"></a>
## Historical final-state runner — unpublished preparation tooling

This section preserves the earlier runner modes and original anchor for
reference. The host-local `scripts/local-db-parity.mjs` and its support/capture
files are unpublished and excluded from this documentation alignment. The
examples are not instructions to run a reset or verification against the
current target after 031. Use the [recorded parity result](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
for what actually ran and its limits. Any future use requires a separately
reviewed compatible target/source and applicable approval.

The earlier runner targeted `/Users/cloud/Cloudstellar/conduit-boq` and the
existing `conduit-boq-local` stack. It pins the local Unix Docker endpoint,
container/project identity, database port `55322` and matching API gateway port
`55321`; it rejects archive checkouts and non-local targets. It does not link
the CLI to Production or execute migration files. Evidence/credentials use a
new `/private/tmp/conduit-boq-local-parity-*` directory with restricted modes;
do not put credentials in the repository or print them.

The following historical examples describe the tool's modes; they carry no
execution authority. Do not run a reset or baseline-only verify as a routine
status check on the intentional target after 031.

```bash
PARITY_ARTIFACTS=/private/tmp/conduit-boq-local-parity-YYYYMMDD-RUN
PARITY_SOURCE=supabase/local/baselines/20261023-production-contract/source.json

node scripts/local-db-parity.mjs inspect --artifacts "$PARITY_ARTIFACTS"
node scripts/local-db-parity.mjs prepare --source "$PARITY_SOURCE" --artifacts "$PARITY_ARTIFACTS"
node scripts/local-db-parity.mjs verify --source "$PARITY_SOURCE" --artifacts "$PARITY_ARTIFACTS"
```

`inspect` captures local metadata. `prepare` validates/materializes the source
without restoring it. `verify` compares local contracts without business writes.
These modes write local evidence files. The earlier capture used host-local,
unpublished `supabase/local/parity-capture.sql`; a
Production source must come from approved repeatable-read **READ ONLY** catalog
inspection with explicit project/timestamp provenance, never Auth/business
rows, password hashes, sessions or secrets. Review exact platform differences
instead of normalizing them away. The host-local, unpublished baseline manifest
`supabase/local/baselines/20261023-production-contract/manifest.json` records
source/capture hashes and scope. The [parity result](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
preserves its recorded evidence; this capture before 031 alone is not current
release parity after 031 or authority to recapture/rebuild anything.

The earlier destructive local rebuild mode required named local reset authority;
no such operation is authorized now:

```bash
node scripts/local-db-parity.mjs restore --source "$PARITY_SOURCE" --artifacts "$PARITY_ARTIFACTS" --reset-local-test-data
```

It replaces local `public`/`private` application state and local Auth test users,
restores final definitions, loads synthetic reference/legacy data before final
guards attach, then creates Auth/personas and runs API tests. It leaves Owner
backup files and the protected archive untouched. It uses no `027–030` replay,
fabricated local migration ledger or test-only authorization bypass. No second
stack or mandatory backup of recreatable test data is required.

The earlier test-resume syntax referred to that restored target and its same
private credential/evidence directory; it is preserved here as history:

```bash
node scripts/local-db-parity.mjs test --source "$PARITY_SOURCE" --artifacts "$PARITY_ARTIFACTS"
```

`restore` and `test` create real local Auth sessions and business test writes;
they are not read-only checks. Preserve failed receipts. A prior
`stale-copy-diagnostic.json` is retained as **FAIL**, not converted to PASS by
avoiding a repeated request known to hang. Without that diagnostic, the stale
request can reproduce the transport timeout. `PARTIAL`/nonzero exit is not
release readiness, and browser/output evidence is recorded separately.

## Historical commands through migration 026 — not current parity

The commands and bootstrap chronology below describe the older development
baseline. Do not run these seeds/smokes/bootstrap as the canonical current path;
inspect an old script's writes and successor-guard compatibility before proposing
its separate use. The unpublished runner examples above also describe an earlier
preparation stage before 031, not current reset/test instructions.

```bash
npm run db:local:start
npm run db:local:status
npm run db:local:smoke-auth
npm run db:local:smoke-master-catalog
npm run db:local:stop
```

The Master Catalog smoke test refuses non-local Supabase URLs, signs in as the
local admin, exercises create/save/duplicate version and category contracts,
and removes every BOQ, route, and item that it creates.

The historical `npm run db:local:bootstrap` rebuilt the local database
from an older captured production snapshot. It is destructive for the Local
Supabase database: it resets the local stack, restores business data and
scrubbed auth metadata, applies `009` and `010`, the four operational
`010a`-equivalent concurrent indexes, `011` through `015`, production hotfix
`016`, `017`, `017a`, and the explicit Phase 4 local chain `018` through `026`,
seeds local-only role accounts, then runs auth and Master Catalog workflow smoke
tests. The executable ledger is
[`scripts/bootstrap-local-db.sh`](../scripts/bootstrap-local-db.sh); if this
paragraph and the script differ, stop and inspect the script rather than
guessing. It is not the approved final-state restore path and must not be used
to repair the current baseline.

```bash
npm run db:local:bootstrap
```

To rehearse a specific git-ignored public-data snapshot without replacing the
default snapshot file:

```bash
PUBLIC_DATA_SNAPSHOT=supabase/.snapshots/public-data-20260621-post009.sql \
  npm run db:local:bootstrap
```

## Local URLs

- Web app and browser UAT: `http://localhost:3000`
- App-facing API: `http://127.0.0.1:55321`
- Database: `postgresql://postgres:postgres@127.0.0.1:55322/postgres`
- Studio: `http://127.0.0.1:55323`
- Mailpit: `http://127.0.0.1:55324`

`npm run dev` reads `.env.development.local`, so development points to this
local stack. Production environment variables are not changed.

Use one origin consistently for the web app, login and browser UAT. The
2026-10-23 acceptance run used `http://127.0.0.1:3000` throughout and passed the
bounded UI checks. The historical default above is `localhost`; cookies/site
data differ by origin, so switching requires a fresh login. Development
resource-origin failures must be checked if a different host is used. The Local
Supabase API remains `127.0.0.1:55321`.

## CLI target safety

This workspace must remain **unlinked** from the Production Supabase project.
Use Supabase MCP for approved Production inspection or execution, and use only
commands with an explicit `--local` flag for CLI database work in this repo.

Do not run `supabase link`, `supabase db push`, `supabase db pull`, or
`supabase db diff --linked` from this worktree. A missing-project-ref error from
`--linked` commands is the expected safe state.

The current Local rebuild is `scripts/local-db-parity.mjs restore` under its
bounded reset authority. The **historical** schema-only snapshot is stored at
`supabase/local/production-baseline.sql`, outside the
Supabase CLI migration directory, so `db push` cannot treat it as a Production
migration. The bootstrap script applies `009`, `010`, the four operational
`010a`-equivalent concurrent indexes, `011` through `015`, production hotfix
`016_hotfix_preserve_boq_item_suffix.sql`, then
`017_master_catalog_phase4_foundation.sql`,
`017a_master_catalog_phase4_global_function_default_privileges.sql`, and the
explicit Phase 4 local chain `018` through
`026_master_catalog_phase4_catalog_action_error_acl.sql`.
Consequently, `supabase db diff --local` will show the rehearsed schema as drift
from an empty CLI migration ledger. Do not generate a new migration from that
expected diff.

## Applied 027–030 and Local parity boundary

The historical bootstrap stops at root migration 026. It establishes neither
post-028, post-029 nor post-030 parity and it does not include migrations 027,
028, `029_atomic_boq_duplicate.sql`, or
`030_boq_save_null_authorization_guard.sql`.

The 2026-10-14 read-only local metadata probes found PostgreSQL 17.6 and the Save
RPC, but no matched final 030 NULL guard, Atomic Duplicate RPC or Admin paging
RPC. These bounded observations are not a full schema inventory. The proposed
preparation path was later executed on 2026-10-23 with the partial result
linked above. Do not patch it with consumed migrations or run the bootstrap above
unchanged; no backup or second stack is mandatory for recreatable test data.

- Production evidence records 027 and 028 as applied exactly once. DUP-1
  migration 029 is also applied exactly once as
  `20260831004110/atomic_boq_duplicate`, source SHA-256
  `748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`.
  Migration 030 was later applied once as
  `20261012100608/boq_save_null_authorization_guard`; see [Security Result
  #04](./plans/security/04-boq-save-null-authorization-production-release-result.md).
  All four migrations 027–030 are immutable/no-replay; do not append them to
  this bootstrap.
- Migration 029 is a separate product release, not a Master Catalog
  convergence migration. Its application and postflight are complete in the
  [DUP-1 Production Result](./plans/product/04-atomic-boq-duplicate-production-release-result.md);
  that receipt grants no authority to apply it again.
- Migration 030 is a separate security correction, not a DUP-1 or Quantity
  migration. Its receipt grants no authority to apply it again or to release
  another change. Quantity Input Safety later reached Production without a
  database change; see [Production Result #08](./plans/product/08-r0a-quantity-input-safety-production-release-result.md).
- Do not add 029 to `db:local:bootstrap` while its input database still stops at
  026. A green run over the wrong predecessor schema would not be valid DUP-1
  evidence.

**Historical DUP-1 rehearsal guidance — non-executable for current work:**
The following two instructions record the predecessor rehearsal method. Their
release authority is consumed; they do not authorize applying 029 again or
destroying any existing target/evidence. Current work must use an approved,
sanitized post-030-equivalent baseline and keep 027–030 immutable/no-replay.

- Before testing 029, create a disposable isolated database from an approved,
  sanitized post-028-equivalent schema/contract fixture. Verify the expected
  predecessor tables, columns, functions, triggers, RLS, grants, owners and ACL
  fingerprints; then apply 029 separately and run its migration, persona,
  atomicity, idempotency, concurrency, rollback and output-parity tests.
- Destroy or reset that disposable target after evidence capture. Do not point
  it at Production, do not import Production users/sessions/tokens/secrets, and
  do not treat isolated rehearsal as deployment authorization.

The 2026-10-23 final-state runner replaces the older bootstrap for current
preparation. Keep the 009–026 script unchanged as historical tooling; do not
extend it with 027–030. The 029-specific predecessor instructions above remain
historical DUP-1 evidence. Current application contracts match the captured
baseline, while the stale-Copy API failure still prevents overall acceptance.

## Test users

All accounts below use the existing local-only `LOCAL_TEST_PASSWORD` stored in
the git-ignored `supabase/.env.local` file. The 2026-10-23 final local run verified
all seven logins and current profiles. Account UUIDs are recreated local fixtures;
usernames/password remain usable. The password file was not rewritten.
Pending/suspended users retain their restricted application state.

Quote the complete value when `LOCAL_TEST_PASSWORD` or
`LOCAL_SUPABASE_SECRET_KEY` contains a literal `#`, for example
`LOCAL_TEST_PASSWORD="value-with-#-inside"`. An unquoted `#` can be interpreted
as an inline-comment delimiter by Node env-file semantics. Local scripts fail
closed on an ambiguous guarded secret instead of seeding one password and
testing another. Never commit `supabase/.env.local`.

- `local.admin@ntplc.co.th`
- `local.staff@ntplc.co.th`
- `local.sector-manager@ntplc.co.th`
- `local.dept-manager@ntplc.co.th`
- `local.procurement@ntplc.co.th`
- `local.pending@ntplc.co.th`
- `local.suspended@ntplc.co.th`

The current baseline contains synthetic Catalog/Factor/organization/BOQ graphs
and local Auth identities. No Production password hashes, sessions, OTPs, MFA
data, refresh tokens or business/account rows were imported. Earlier snapshot
rehearsals retained Production UUIDs and relationships; that describes those
historical inputs, not this synthetic final-state baseline.

## Historical snapshot custody and local network safety

The historical data files under `supabase/.snapshots/` are permission mode `600` and ignored
by Git. They are a convenient local rehearsal snapshot, not a replacement for a
verified encrypted production backup and restore process.

Those rollout snapshots used a companion manifest containing source project,
capture point, table counts, row checksums and SQL SHA-256; their historical
data-fidelity gate required Local restore/checksum comparison. The current
synthetic baseline instead records application-contract equivalence and actual
flow results. It does not import those Owner snapshots or claim official data
fidelity, and those files are not a prerequisite for recreatable test data.

Supabase CLI currently publishes local ports on all host interfaces. Run this
stack only on a trusted network and stop it when not in use.
