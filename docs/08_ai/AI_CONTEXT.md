# AI Context — Mandatory Agent Rules

> **Status:** CANONICAL  
> **Aligned:** 2026-08-29

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
- repository/document convergence requires no migration 029;
- P-13, P-14, P-14C, P-15 and R-01 through R-05 are complete and no-replay;
- existing BOQs and Factor F must not be changed by convergence work; and
- the accepted expanded-persona residual must never be relabelled PASS.

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

## Source-of-truth map

| Topic | Canonical location |
|---|---|
| Current repository handoff | [`08_ai/AI_HANDOFF.md`](./AI_HANDOFF.md) |
| Master Catalog final state | [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) |
| Database schema | [`04_data/DATABASE_SCHEMA.md`](../04_data/DATABASE_SCHEMA.md) |
| Production migration ledger | [`04_data/MIGRATIONS.md`](../04_data/MIGRATIONS.md) |
| Current security model | [`04_data/SECURITY_MODEL.md`](../04_data/SECURITY_MODEL.md) |
| Historical integrity guidance | [`04_data/DATA_INTEGRITY.md`](../04_data/DATA_INTEGRITY.md) (dated gaps are historical; use #106/#107 for completion) |
| Domain entities | [`03_domain/DOMAIN_MODEL.md`](../03_domain/DOMAIN_MODEL.md) |
| Calculation rules | [`05_calculation/CALCULATION_RULES.md`](../05_calculation/CALCULATION_RULES.md) |
| Engineering patterns | [`06_engineering/`](../06_engineering/) |

When documentation and mutable Production state might differ, do not guess.
Use the latest durable result for historical truth and obtain separately
authorized fresh read-only evidence for a live claim.

For this repository convergence, Production was reconfirmed read-only at
`2026-08-29 01:38:54 +07` against the closeout state summarized in
[AI Handoff](./AI_HANDOFF.md). The check made no Production mutation and does
not authorize a later write, migration, deployment, or replay.

## Completion check

- Run checks proportionate to the change and report what actually ran.
- Do not claim an unrun suite or live verification as PASS.
- Preserve historical records; add a supersession pointer instead of rewriting
  their chronology.
- Update the canonical handoff when the durable current state genuinely changes.
