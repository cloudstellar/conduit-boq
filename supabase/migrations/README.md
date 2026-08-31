# Remote migrations

This directory intentionally contains no SQL migrations for the current
Master Catalog rollout. Production execution uses the reviewed scripts under
`/migrations` through the approved SQL Editor/MCP runbook.

The schema snapshot used for Local Supabase is stored at
`../local/production-baseline.sql` so `supabase db push` cannot mistake it for a
remote migration.

Migration 029 was later applied exactly once from the root `/migrations`
directory as `20260831004110/atomic_boq_duplicate`. It remains a reviewed root
artifact and must not be moved here, edited, or replayed. The Local
baseline/bootstrap still stops at 026 and has neither post-028 nor post-029
parity. See [Local Supabase](../../docs/LOCAL_SUPABASE.md) and the
[DUP-1 Production Result](../../docs/plans/product/04-atomic-boq-duplicate-production-release-result.md).
