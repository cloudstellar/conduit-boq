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

## Host-local workspace handoff — 2026-08-29

`LOCAL_WORKSPACE_HANDOFF_20260829`

- The canonical checkout on this host is
  `/Users/cloud/Cloudstellar/conduit-boq`. It was observed clean on `main` at
  `f89511767d8d5e9207a61f851c9e6f3f97b42cf7`, equal to `origin/main`, before
  this local handoff-document alignment. Verify `git status`, branch, HEAD, and
  upstream at the start of every new session.
- The complete former checkout was archived, not deleted, at
  `/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829`. Its recorded
  branch/HEAD are `codex/p51-option-a-closeout` and
  `1dd98ee16af02f89ab413c614e04df7960b42563`.
- The archive is intentionally dirty and contains protected evidence, ignored
  secrets, and local session material. It must remain local and must not be
  cleaned, staged, committed, uploaded, or shared. Do not use it as the normal
  workspace for new changes.
- The archived repository's linked worktree at
  `/Users/cloud/.codex/worktrees/1ede/conduit-boq` was repaired after the move;
  it remains archive lineage, not canonical `main`.
- No branch was deleted. The local `codex/main-convergence` branch remains at
  the same pushed convergence commit. Branch deletion was deliberately left
  outside this operation.

This section records host-local custody, not portable Production truth. On a
different host, verify paths independently. Its preparation grants no commit,
push, deploy, database, publication, or deletion authority.

## What remains

There is **no required Master Catalog execution work** and no open R-01 through
R-05 item. Do not replay the completed release, migrations, disposable QA, or
closeout.

Only these independent optional maintenance decisions remain:

1. Keep the local archive as-is unless the Owner later approves a specific
   encrypted backup, retention, or removal operation.
2. Classify or prune old branches/worktrees only under a new, explicit cleanup
   approval. Keeping them is safe and does not block normal work on `main`.
3. Run the expanded Production persona rehearsal only as a newly authorized
   security-review task. Until then its status remains `accepted residual — not
   PASS`.
4. Normalize application-version labels only as a separate product/versioning
   decision; it is unrelated to Master Catalog `2568.1.0`.

For a new AI session: work from the canonical checkout, read this file plus
`AGENTS.md`, `AI_CONTEXT.md`, #106, and #107, then inspect Git status before any
change. Do not enter or inventory the archive unless the Owner explicitly asks.
