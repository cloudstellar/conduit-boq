# AI Handoff — Conduit BOQ

> **Status:** CANONICAL REPOSITORY ENTRY POINT
>
> **Aligned:** 2026-09-01
>
> **Latest Production closeout evidence:** 2026-08-31 — DUP-1
>
> **Latest independent read-only postflight:** 2026-08-31 00:55:26 UTC;
> no Production mutation
>
> **Latest repository-custody evidence:** 2026-08-31 — post-DUP-1 docs
> closeout and exact branch cleanup

## Start here

1. Read this handoff and [AI Context](./AI_CONTEXT.md).
2. Read [Lessons Learned](./LESSONS_LEARNED.md) for durable implementation
   constraints.
3. For Master Catalog status, use [Canonical Final Handoff
   #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
   and [Final Closeout Result
   #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
4. For the current product release, read [DUP-1 Production Release
   Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
5. For the later documentation merge and branch cleanup, read [Post-DUP-1
   Repository Custody Result](../plans/product/05-post-dup1-repository-custody-result.md).

The files under [`docs/ai/`](../ai/README.md) are legacy Phase 1/2 context.
They are useful history, but they are not the current session handoff.

## Current product release — DUP-1

`DUP-1_PRODUCTION_CLOSEOUT_20260831`

Atomic BOQ Duplicate is live in Production. The exact release is recorded in
[DUP-1 Production Release Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md):

- feature commit `bc357dbc7a8bd8d696c19550f57452f79a6a4372` was merged through
  [PR #9](https://github.com/cloudstellar/conduit-boq/pull/9) as `main` commit
  `0e76ed39e68746c9bd6003da69a03f096ae482a3` and deployed successfully by
  Vercel;
- migration `029_atomic_boq_duplicate.sql`, SHA-256
  `748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`,
  is applied exactly once as
  `20260831004110/atomic_boq_duplicate`;
- normal **คัดลอก** is an atomic/idempotent preserve copy: it keeps the source
  Catalog, items, quantities, prices, Factor F snapshot/provenance, and cost
  basis while resetting instance/workflow identity to a new draft;
- eligible Factor-unbound legacy BOQs use the separate **คัดลอกและเลือก Factor
  F** flow. It preserves old Catalog/items/prices, clears old Factor-derived
  state, and blocks Print/PDF/Excel until trusted review/save succeeds;
- current Catalog/default prices require a clean **สร้างใหม่** flow; DUP-1 does
  not requote, reprice, rebase, repair, or backfill a source BOQ;
- Production outer-transaction proof passed for both `preserve` and
  `select_factor`, rendered desktop/mobile QA passed, and an expected live
  PostgREST mixed-graph probe failed closed with Create New recovery; all left
  no persistent copy; and
- final database state was `263` BOQs, `326` routes, `2,617` items, and `0`
  idempotency-ledger rows. Catalog `2568.1.0` (`710` active rows) and default
  Factor F `2569.0.0` (`36` rows, VAT 7) retained their exact hashes/pointers.

The independent read-only postflight timestamped above reconfirmed the 029
ledger/object/ACL posture, all five BOQ policy fingerprints, zero request-ledger
rows, the same BOQ graph counts, and unchanged Catalog/Factor anchors. It grants
no future write authority.

Migration 029 is a separate product release after the completed Master Catalog
phase. Statements below that “029 was not required” or that the ledger ended at
028 are dated Master Catalog/repository-convergence facts, not the current
Production migration inventory. Migrations 027, 028, and 029 are all immutable
applied-once/no-replay artifacts.

## Post-DUP-1 repository custody

`POST_DUP1_REPOSITORY_CUSTODY_20260831`

[Post-DUP-1 Repository Custody Result
#05](../plans/product/05-post-dup1-repository-custody-result.md) records the
later repository-only closeout:

- documentation commit `654ba7674707fec2151ed510ce478bb4135d48c5`
  merged through [PR #10](https://github.com/cloudstellar/conduit-boq/pull/10)
  as `07dd75558b513037a1d38b576ffe03be356623c2`, with exact tree
  `c6750930f23982ec08dab27bcb4da26d961411ea`;
- GitHub Quality run `33349901736` completed successfully;
- Vercel deployment `BQyAnbjjbBfYYWXLznsLSbKFo7yY` was observed as
  Production, Ready, and Current from that merge commit;
- the separately approved cleanup removed local and remote refs for exactly
  `codex/atomic-boq-duplicate`, `codex/atomic-boq-duplicate-closeout`, and
  `codex/main-convergence`; and
- final branch evidence at that instant showed a clean canonical checkout on
  `main`, equality with `origin/main`, no matching remote refs for those three
  names, and no other local branch.

This repository operation did not change application runtime code, database
state, migrations, Catalog, Factor F, BOQs, accounts, or the protected archive.
Its authority is consumed. Result #04's `branchDeleted: false` remains correct
for the earlier frozen DUP-1 release instant; Result #05 is the later custody
overlay. Git and deployment state are mutable, so verify their live identity
instead of treating `07dd755...` or the observed deployment as perpetual.

## Current Master Catalog state

The closeout evidence in #106/#107 records:

- Master Catalog is complete end-to-end at `2568.1.0`, with `710` active rows;
- `ITEM-0429` / `COR-PB0-002` is `0/1764/1764`;
- `ITEM-0615` / `LVU-MH0-002` is `2869/7427/10296`;
- the full audited Admin draft workflow is live;
- migrations 027 and 028 were applied exactly once, and migration 029 was not
  required for that Master Catalog closeout;
- P-49 technical implementation and formal closeout are complete;
- no publication, catalog-pointer movement, BOQ repricing/backfill, or Factor F
  change occurred during the final rollout; and
- the unrun expanded Production persona rehearsal remains `accepted residual
  — not PASS`.

These are recorded closeout facts, not permission for a new operation. Any
claim about mutable live state requires fresh read-only evidence.

The dated 2026-08-29 Master Catalog reconfirmation verified ledger 027 then 028
with no 029 at that time; catalog `2568.1.0` at `710/710`, hash
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
- the frozen DUP-1 application release was deployed from merge commit
  `0e76ed39e68746c9bd6003da69a03f096ae482a3`; the later docs-only PR #10
  deployment was observed from `07dd75558b513037a1d38b576ffe03be356623c2`;
  neither SHA should be assumed to be the perpetual current Git/Vercel source;
- `package.json` version `1.2.0`, the README release badge `1.4.0`, and
  historical implementation-plan labels such as `1.6.0` are retained
  application/document metadata, not Master Catalog or deployment authority.

Do not normalize those application labels during repository convergence. A
future application-version decision is separate work with separate approval.

## No-replay boundary

Do not replay P-13, P-14, P-14C, P-15, migrations 027/028/029, R-01 through
R-05, or disposable Production QA. Migration 029 was not needed merely to
align documentation or Git; it was later created and applied only for the
separately authorized DUP-1 product release. A future catalog Publish/Restore
or database change is a separate release requiring its own explicit approval
and a new forward migration when schema change is required.

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
- At this 2026-08-29 handoff, no branch had yet been deleted and local
  `codex/main-convergence` remained at the pushed convergence commit. The later
  separately approved exact cleanup is recorded in Post-DUP-1 Repository
  Custody Result #05; do not rewrite this dated observation as if cleanup had
  already happened on 2026-08-29.

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
2. Classify or prune any further old branches/worktrees only under a new,
   explicit cleanup approval. The exact three-branch cleanup in Result #05 is
   complete and its permission is consumed.
3. Run the expanded Production persona rehearsal only as a newly authorized
   security-review task. Until then its status remains `accepted residual — not
   PASS`.
4. Normalize application-version labels only as a separate product/versioning
   decision; it is unrelated to Master Catalog `2568.1.0`.

For product development, the recommended next decision is `LIST-1B`: bounded
server-side numbered BOQ pages, whole-result search/filter/sort, RLS-correct
count, batched route loading, and trusted duplicate eligibility projection.
After the calculation-safety baseline, Quantity Expression remains the next
larger feature: canonical `*`, input aliases `x`/`X`/`×`, persisted normalized
formula visible only in the quantity editor, and numeric-only Print/PDF/Excel.
Authentication/security (`S0`) is a separate parallel decision lane. None of
these items has implementation or Production authority yet.

For a new AI session: work from the canonical checkout, read this file plus
`AGENTS.md`, `AI_CONTEXT.md`, Master Catalog #106/#107, and
[`DUP-1 Production Release Result`](../plans/product/04-atomic-boq-duplicate-production-release-result.md)
and [`Post-DUP-1 Repository Custody Result`](../plans/product/05-post-dup1-repository-custody-result.md),
then inspect Git status before any change. Do not enter or inventory the
archive unless the Owner explicitly asks.
