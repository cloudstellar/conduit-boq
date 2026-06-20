# Local Supabase for Conduit BOQ

Local Supabase uses project ID `conduit-boq-local` and the dedicated port range
`55320-55329`, so it does not collide with the default `5432x` ports used by
other Supabase projects.

## Daily commands

```bash
npm run db:local:start
npm run db:local:status
npm run db:local:stop
```

Run `npm run db:local:bootstrap` only when the local database should be rebuilt
from the captured production snapshot. It resets the local database, restores
business data and scrubbed auth metadata, applies Master Catalog migrations
`009`, `010`, and `010a`, seeds local-only role accounts, and runs an auth smoke
test. Migration `011` is intentionally excluded until the Phase 2 application
is implemented and verified.

```bash
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

The canonical Local rebuild is `npm run db:local:bootstrap`. Migration history
shows only `20260620100634_production_baseline.sql`; Master Catalog scripts
`009`, `010`, and the four `010a` index statements are deliberately applied by
the bootstrap script so they remain staged rollout artifacts rather than being
mistaken for Production migration history. Consequently, `supabase db diff
--local` will show the rehearsed Master Catalog schema as drift from the
baseline. Do not generate a new migration from that expected diff.

## Test users

All accounts below use the local-only password stored in the git-ignored
`supabase/.env.local` file.

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

Supabase CLI currently publishes local ports on all host interfaces. Run this
stack only on a trusted network and stop it when not in use.
