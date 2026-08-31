# Local Supabase for Conduit BOQ

Local Supabase uses project ID `conduit-boq-local` and the dedicated port range
`55320-55329`, so it does not collide with the default `5432x` ports used by
other Supabase projects.

## Daily commands

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

Run `npm run db:local:bootstrap` only when the local database should be rebuilt
from the captured production snapshot. This is destructive for the Local
Supabase database: it resets the local stack, restores business data and
scrubbed auth metadata, applies `009` and `010`, the four operational
`010a`-equivalent concurrent indexes, `011` through `015`, production hotfix
`016`, `017`, `017a`, and the explicit Phase 4 local chain `018` through `026`,
seeds local-only role accounts, then runs auth and Master Catalog workflow smoke
tests. The executable ledger is
[`scripts/bootstrap-local-db.sh`](../scripts/bootstrap-local-db.sh); if this
paragraph and the script differ, stop and inspect the script rather than
guessing. Get fresh owner approval before a destructive rebuild when existing
Local state or evidence must be preserved.

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

Use `http://localhost:3000` consistently for the web app, login, and browser
UAT. Do not switch the app origin to `http://127.0.0.1:3000` mid-session:
cookies/site data are origin-bound, and Next development resources can reject
the alternate origin while still rendering server HTML, which leaves a page
visible but not interactive. The Local Supabase API itself remains on
`127.0.0.1:55321` as configured above.

## CLI target safety

This workspace must remain **unlinked** from the Production Supabase project.
Use Supabase MCP for approved Production inspection or execution, and use only
commands with an explicit `--local` flag for CLI database work in this repo.

Do not run `supabase link`, `supabase db push`, `supabase db pull`, or
`supabase db diff --linked` from this worktree. A missing-project-ref error from
`--linked` commands is the expected safe state.

The canonical Local rebuild is `npm run db:local:bootstrap`. The schema-only
snapshot is stored at `supabase/local/production-baseline.sql`, outside the
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

## Applied DUP-1/029 and Local parity boundary

The current bootstrap stops at root migration 026. It establishes neither
post-028 nor post-029 parity and it does not include migration 027, 028, or
`029_atomic_boq_duplicate.sql`.

- Production evidence records 027 and 028 as applied exactly once. DUP-1
  migration 029 is also applied exactly once as
  `20260831004110/atomic_boq_duplicate`, source SHA-256
  `748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`.
  All three are immutable/no-replay; do not append them to this bootstrap.
- Migration 029 is a separate product release, not a Master Catalog
  convergence migration. Its application and postflight are complete in the
  [DUP-1 Production Result](./plans/product/04-atomic-boq-duplicate-production-release-result.md);
  that receipt grants no authority to apply it again.
- Do not add 029 to `db:local:bootstrap` while its input database still stops at
  026. A green run over the wrong predecessor schema would not be valid DUP-1
  evidence.
- Before testing 029, create a disposable isolated database from an approved,
  sanitized post-028-equivalent schema/contract fixture. Verify the expected
  predecessor tables, columns, functions, triggers, RLS, grants, owners and ACL
  fingerprints; then apply 029 separately and run its migration, persona,
  atomicity, idempotency, concurrency, rollback and output-parity tests.
- Destroy or reset that disposable target after evidence capture. Do not point
  it at Production, do not import Production users/sessions/tokens/secrets, and
  do not treat isolated rehearsal as deployment authorization.

Updating the canonical bootstrap beyond 026—to a reviewed post-028-equivalent
baseline and, only if deliberately included, exact 029/post-029 parity—is a
separate reviewed change. Until that parity contract exists and is approved,
keep the current 009–026 bootstrap unchanged and keep 029 rehearsal explicit.

## Test users

All accounts below use the local-only password stored in the git-ignored
`supabase/.env.local` file.

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

Production password hashes, sessions, OTPs, MFA data, and refresh tokens are not
stored in the local database. Production UUIDs and business relationships are
retained for realistic migration rehearsal.

## Snapshot safety

The data files under `supabase/.snapshots/` are permission mode `600` and ignored
by Git. They are a convenient local rehearsal snapshot, not a replacement for a
verified encrypted production backup and restore process.

Each fresh rollout snapshot has a companion manifest containing source project,
capture point, table counts, row checksums, and SQL SHA-256. A snapshot is not
accepted for a Production gate until it restores in Local and its common-schema
checksums match Production.

Supabase CLI currently publishes local ports on all host interfaces. Run this
stack only on a trusted network and stop it when not in use.
