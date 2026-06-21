# Remote migrations

This directory intentionally contains no SQL migrations for the current
Master Catalog rollout. Production execution uses the reviewed scripts under
`/migrations` through the approved SQL Editor/MCP runbook.

The schema snapshot used for Local Supabase is stored at
`../local/production-baseline.sql` so `supabase db push` cannot mistake it for a
remote migration.
