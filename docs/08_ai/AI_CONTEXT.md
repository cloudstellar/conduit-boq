# AI Context — Mandatory Agent Rules

> **Status:** CANONICAL  
> **Aligned:** 2026-09-01

Read [AI Handoff](./AI_HANDOFF.md) first. For Master Catalog current-state and
no-replay decisions, [Handoff
#106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
and [Result
#107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
override dated status prose in older plan records.

## Authority and safety

Without explicit current permission, do not commit/push/merge/rebase, deploy, mutate
Production, apply a migration, change runtime flags, publish/restore a catalog,
add/remove packages, or delete files. An approval recorded in a historical
result proves what happened then; it does not authorize another run. A one-shot
authorization is consumed by its recorded operation and cannot be reused.

For the completed Master Catalog phase:

- migrations 027 and 028 are immutable, applied-once, no-replay artifacts;
- the completed Master Catalog repository/document convergence did not require
  migration 029; 029 was later applied only for DUP-1 as described below;
- P-13, P-14, P-14C, P-15 and R-01 through R-05 are complete and no-replay;
- existing BOQs and Factor F must not be changed by convergence work; and
- the accepted expanded-persona residual must never be relabelled PASS.

For the completed Atomic BOQ Duplicate release:

- migration 029 is a new product migration after 028, applied exactly once as
  `20260831004110/atomic_boq_duplicate`; it was not a Master Catalog
  convergence migration;
- migrations 027, 028, and 029 are immutable/no-replay;
- normal Copy preserves the source Catalog, items, prices, Factor provenance,
  and cost basis; selected-Factor Copy is a separate eligible-legacy flow;
- current Catalog/default prices require Create New; never silently requote,
  reprice, repair, rebase, or backfill a copied/source BOQ; and
- the authoritative execution receipt is [DUP-1 Production Release
  Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).

For the later repository-only closeout, use [Post-DUP-1 Repository Custody
Result](../plans/product/05-post-dup1-repository-custody-result.md). It records
docs PR #10, the dated Production deployment observation, and the separately
approved deletion of exactly the two atomic branches plus
`codex/main-convergence`. Result #04's earlier `branchDeleted: false` remains
frozen chronology. The cleanup permission is consumed and grants no authority
for another branch/worktree or archive operation.

## Critical implementation patterns

### Auth deadlock prevention

Never call async Supabase work directly inside `onAuthStateChange`; defer it:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => { handleSession(session) }, 0)
})
```

### Authorization is cross-layer

UI permission helpers are not security boundaries. Align product rules,
middleware/routes, server actions, grants, RLS, protected columns, RPC bodies
and ACLs, service-role paths, and real authenticated tests. Database controls
remain authoritative for direct Data API/RPC access.

For DUP-1, the typed client and visible Copy actions are UX contracts only.
`public.duplicate_boq_atomic` must re-check `auth.uid()`, active allowed role,
source scope, mode/Factor eligibility, graph integrity, expected source token,
and request-key reuse inside the database. Never reproduce that full predicate
client-side and treat it as authorization.

## Source-of-truth map

| Topic | Canonical location |
|---|---|
| Current repository handoff | [`08_ai/AI_HANDOFF.md`](./AI_HANDOFF.md) |
| Host-local canonical checkout and archive custody | [AI Handoff — Host-local workspace handoff](./AI_HANDOFF.md#host-local-workspace-handoff--2026-08-29) |
| Master Catalog final state | [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) |
| Atomic BOQ Duplicate Production result | [`plans/product/04-atomic-boq-duplicate-production-release-result.md`](../plans/product/04-atomic-boq-duplicate-production-release-result.md) |
| Post-DUP-1 repository custody | [`plans/product/05-post-dup1-repository-custody-result.md`](../plans/product/05-post-dup1-repository-custody-result.md) |
| Database schema | [`04_data/DATABASE_SCHEMA.md`](../04_data/DATABASE_SCHEMA.md) |
| Production migration ledger | [`04_data/MIGRATIONS.md`](../04_data/MIGRATIONS.md) |
| Current security model | [`04_data/SECURITY_MODEL.md`](../04_data/SECURITY_MODEL.md) |
| Historical integrity guidance | [`04_data/DATA_INTEGRITY.md`](../04_data/DATA_INTEGRITY.md) (dated gaps are historical; use #106/#107 for completion) |
| Domain entities | [`03_domain/DOMAIN_MODEL.md`](../03_domain/DOMAIN_MODEL.md) (dated reference baseline; current schema/access docs override) |
| Calculation rules | [`05_calculation/CALCULATION_RULES.md`](../05_calculation/CALCULATION_RULES.md) |
| Engineering patterns | [`06_engineering/`](../06_engineering/) |

When documentation and mutable Production state might differ, do not guess.
Use the latest durable result for historical truth and obtain separately
authorized fresh read-only evidence for a live claim.

The canonical checkout/archive paths in AI Handoff are observations about this
host, not portable application or Production state. Start normal work only in
the canonical checkout. Do not inspect, copy, clean, upload, or delete the
archive or its protected contents without fresh explicit approval.

For this repository convergence, Production was reconfirmed read-only at
`2026-08-29 01:38:54 +07` against the closeout state summarized in
[AI Handoff](./AI_HANDOFF.md). The check made no Production mutation and does
not authorize a later write, migration, deployment, or replay.

That dated convergence observation ended at migration 028. DUP-1 was later
separately authorized, applied, deployed, and closed on 2026-08-31. Its latest
independent read-only postflight at `2026-08-31 00:55:26 UTC` reconfirmed 029,
zero private request-ledger rows, `263/326/2617` BOQ/route/item counts, unchanged
Catalog/Factor hashes and pointers, and unchanged BOQ policy fingerprints. It
also grants no future write, migration, deployment, or replay authority.

The later repository-custody observation recorded docs PR #10 merge
`07dd75558b513037a1d38b576ffe03be356623c2`, its Ready/Current Production
deployment at that instant, and absence of the three explicitly deleted branch
refs. Those Git/Vercel facts are dated evidence, not perpetual current state.
Always inspect the live checkout/upstream and deployment when present identity
matters; do not replace the frozen DUP-1 application merge
`0e76ed39e68746c9bd6003da69a03f096ae482a3` with a docs-only merge.

## Completion check

- Run checks proportionate to the change and report what actually ran.
- Do not claim an unrun suite or live verification as PASS.
- Preserve historical records; add a supersession pointer instead of rewriting
  their chronology.
- Update the canonical handoff when the durable current state genuinely changes.
