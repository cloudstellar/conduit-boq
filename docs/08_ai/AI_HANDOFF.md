# AI Handoff — Conduit BOQ

> **Status:** CANONICAL REPOSITORY ENTRY POINT
>
> **Aligned:** 2026-08-29
>
> **Production closeout evidence:** 2026-08-28
>
> **Read-only reconfirmation:** 2026-08-29 01:38:54 +07; no Production mutation

## Start here

1. Read this handoff and [AI Context](./AI_CONTEXT.md).
2. Read [Lessons Learned](./LESSONS_LEARNED.md) for durable implementation
   constraints.
3. For Master Catalog status, use [Canonical Final Handoff
   #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
   and [Final Closeout Result
   #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).

The files under [`docs/ai/`](../ai/README.md) are legacy Phase 1/2 context.
They are useful history, but they are not the current session handoff.

## Current Master Catalog state

The closeout evidence in #106/#107 records:

- Master Catalog is complete end-to-end at `2568.1.0`, with `710` active rows;
- `ITEM-0429` / `COR-PB0-002` is `0/1764/1764`;
- `ITEM-0615` / `LVU-MH0-002` is `2869/7427/10296`;
- the full audited Admin draft workflow is live;
- migrations 027 and 028 were applied exactly once, and migration 029 is not
  required for this closeout;
- P-49 technical implementation and formal closeout are complete;
- no publication, catalog-pointer movement, BOQ repricing/backfill, or Factor F
  change occurred during the final rollout; and
- the unrun expanded Production persona rehearsal remains `accepted residual
  — not PASS`.

These are recorded closeout facts, not permission for a new operation. Any
claim about mutable live state requires fresh read-only evidence.

The dated read-only reconfirmation above verified ledger 027 then 028 with no
029; catalog `2568.1.0` at `710/710`, hash
`8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`, lock
`4`, `ITEM-0429` at `0/1764/1764`, and `ITEM-0615` at
`2869/7427/10296`; Factor F `2569.0.0` at `36` rows, hash
`4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`;
all three Admin capability flags `true`; the migration-028 function
owner/volatility/search-path/security/execute posture; raw `app_settings`
denied to `anon` and `authenticated`; and `0` working drafts. It performed no
write and grants no new operational authority. It was not a fresh replay of
the complete P-49 persona, policy, or predicate suite.

## Version labels

Keep the repository's different version domains separate:

- `2568.1.0` is the current Master Catalog business-data version;
- the exact Git `main` SHA is the deployed-source identity;
- `package.json` version `1.2.0`, the README release badge `1.4.0`, and
  historical implementation-plan labels such as `1.6.0` are retained
  application/document metadata, not Master Catalog or deployment authority.

Do not normalize those application labels during repository convergence. A
future application-version decision is separate work with separate approval.

## No-replay boundary

Do not replay P-13, P-14, P-14C, P-15, migrations 027/028, R-01 through R-05,
or the disposable Production QA. Do not create migration 029 merely to align
documentation or Git. A future catalog Publish/Restore is a separate business
release requiring its own explicit approval.

## Working rule

Use `main` plus the handoff above as the repository source of truth. Preserve
dated plans/results as audit chronology; a historical `HOLD`, `pending`, or
`unauthorized` statement does not override #106/#107. Never infer current
commit, push, deploy, database, or publication authority from a historical
approval receipt.

## Repository-only residual

Master Catalog completion does not authorize branch/worktree cleanup. The
shared legacy checkout and its protected local evidence remain untouched;
inventory, archive custody, and any branch deletion require a separate explicit
approval. This repository housekeeping is not an open R-01 through R-05 item
and does not reopen the completed Master Catalog release.
