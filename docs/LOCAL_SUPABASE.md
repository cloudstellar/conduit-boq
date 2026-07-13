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
scrubbed auth metadata, applies the canonical root chain `009` through `015`,
production hotfix `016`, and the current Phase 4 local scripts `017` through
`019`, seeds local-only role accounts, then runs auth and Master Catalog
workflow smoke tests. Get owner approval before using this command as evidence
when preserving existing Local state matters.

WP-6.6 migration `020_master_catalog_phase4_admin_workflow_hardening.sql` passed
the separately owner-approved G1R and independent G2 clean Local
DB/concurrency evidence runs on exact execution checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd`, with SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The P-20 G1R-versus-G2 comparison passed. It remains outside this canonical
bootstrap until the WP-6.6 G3/G4 closeout is accepted. Do not append `020` to
the bootstrap command ad hoc.

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

- App-facing API: `http://127.0.0.1:55321`
- Database: `postgresql://postgres:postgres@127.0.0.1:55322/postgres`
- Studio: `http://127.0.0.1:55323`
- Mailpit: `http://127.0.0.1:55324`

`npm run dev` reads `.env.development.local`, so development points to this
local stack. Production environment variables are not changed.

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
migration. The bootstrap script applies the explicit root sequence `009` through
`015`, then production hotfix `016_hotfix_preserve_boq_item_suffix.sql`, then
the current Phase 4 scripts `017_master_catalog_phase4_foundation.sql`,
`018_master_catalog_phase4_draft_mutation.sql`, and
`019_master_catalog_phase4_publish_pointer.sql`.
Consequently, `supabase db diff --local` will show the rehearsed schema as drift
from an empty CLI migration ledger. Do not generate a new migration from that
expected diff.

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
