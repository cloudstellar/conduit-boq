# Conduit BOQ — Repository Handoff

Read these files before changing this repository:

1. [`docs/08_ai/AI_HANDOFF.md`](docs/08_ai/AI_HANDOFF.md)
2. [`docs/08_ai/AI_CONTEXT.md`](docs/08_ai/AI_CONTEXT.md)
3. [`docs/08_ai/LESSONS_LEARNED.md`](docs/08_ai/LESSONS_LEARNED.md)

For the completed Master Catalog phase, the current Production authority is:

- [Canonical Final Handoff #106](docs/plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
- [Final Closeout Result #107](docs/plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)

Older `HOLD`, `pending`, `unauthorized`, and `current` statements under
`docs/plans/master-catalog/` are dated audit history unless #106 or #107
explicitly adopts them. Do not rewrite historical evidence to make it look
current.

## Master Catalog no-replay boundary

- Production evidence recorded in #106/#107 shows Master Catalog `2568.1.0`
  complete with `710` active rows and the full audited Admin draft workflow
  live.
- Migrations 027 and 028 were applied exactly once. Do not edit, retry, or
  replay them. The completed Master Catalog repository convergence did not
  require migration 029.
- Do not replay P-13, P-14, P-14C, P-15, or R-01 through R-05.
- Do not mutate or republish the catalog, reprice/backfill existing BOQs, move
  the catalog pointer, or change Factor F as a documentation/repository
  alignment step.
- A future Publish or Restore is a new business release with new explicit
  approval; it is not continuation of the completed phase.
- The expanded Production persona rehearsal remains an accepted residual,
  **not PASS**.

## Atomic BOQ Duplicate current boundary

`DUP-1_PRODUCTION_CLOSEOUT_20260831`

- Atomic BOQ Duplicate is live in Production from merge commit
  `0e76ed39e68746c9bd6003da69a03f096ae482a3`; use
  [DUP-1 Production Release Result](docs/plans/product/04-atomic-boq-duplicate-production-release-result.md)
  as the execution receipt.
- Migration 029 was later applied exactly once as the separate product release
  `20260831004110/atomic_boq_duplicate`. It was not needed for Master Catalog
  convergence, and it does not change that historical statement.
- Migrations 027, 028, and 029 are all immutable/no-replay. A later database
  change requires fresh explicit approval and a new forward migration.
- Normal Copy preserves Catalog/items/prices and Factor F. The separate
  selected-Factor path is only for eligible legacy BOQs and blocks official
  output until trusted review/save. Current prices require Create New.
- DUP-1 authority is consumed. It does not authorize LIST-1, Quantity
  Expression, Catalog/Factor operations, account changes, another deployment,
  or Production mutation.

## Post-DUP-1 repository custody

`POST_DUP1_REPOSITORY_CUSTODY_20260831`

- Use [Post-DUP-1 Repository Custody Result
  #05](docs/plans/product/05-post-dup1-repository-custody-result.md) for the
  later documentation-closeout and branch-cleanup receipt.
- Documentation PR #10 merged as
  `07dd75558b513037a1d38b576ffe03be356623c2`. At the recorded Vercel
  observation, its docs-only deployment was Production, Ready, and Current.
  This did not replace the frozen DUP-1 application-release identity above.
- The separately approved cleanup removed local and remote refs for exactly
  `codex/atomic-boq-duplicate`, `codex/atomic-boq-duplicate-closeout`, and
  `codex/main-convergence`. The frozen Result #04 `branchDeleted: false` value
  remains correct for its earlier release-closeout instant.
- The exact commit/push/merge/deployment-observation and branch-deletion
  permissions are consumed. Any later branch/worktree deletion or external
  operation needs fresh explicit approval.
- Git branch, HEAD, upstream, worktree, and deployment state remain mutable;
  verify them live rather than treating the dated receipt as a perpetual
  current-state guarantee.

Production facts in #106/#107 are evidence as recorded on 2026-08-28. If a
task needs a claim about live mutable state, obtain fresh read-only evidence.
Never infer current operational authority from an old approval receipt or from
this file.

## Host-local workspace and archive custody

`LOCAL_WORKSPACE_HANDOFF_20260829`

- The canonical checkout on this host is
  `/Users/cloud/Cloudstellar/conduit-boq`. At the 2026-08-29 custody handoff it
  was clean on `main` at the pushed convergence baseline
  `f89511767d8d5e9207a61f851c9e6f3f97b42cf7`. Always verify the current branch,
  HEAD, upstream, and worktree status instead of assuming they remain unchanged.
- The former dirty checkout was preserved whole at
  `/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829`, on
  `codex/p51-option-a-closeout` at
  `1dd98ee16af02f89ab413c614e04df7960b42563`. It is an archive, not the source
  checkout for new work.
- That archive contains protected Owner evidence under `files/`, `output/`,
  `outputs/`, `tmp/`, and `.private-local-archive/`, plus ignored local secrets
  and session material. Do not edit, move, delete, stage, commit, clean, upload,
  or share it. Never run `git clean -fdX`, `git clean -fdx`, or another broad
  cleanup there.
- The archived repository's linked worktree at
  `/Users/cloud/.codex/worktrees/1ede/conduit-boq` was repaired after the move.
  It remains part of the archive lineage and is not the canonical checkout.
- At the 2026-08-29 custody handoff, no branch had yet been deleted. The later
  exact cleanup is recorded in Post-DUP-1 Repository Custody Result #05. Any
  further branch/worktree pruning or archive-retention action requires fresh
  explicit approval; it is not Master Catalog completion work.
- The Owner's 2026-08-29 `MAIN CONVERGENCE` commit/push permission was one-shot
  and is consumed. This handoff does not authorize another commit, push,
  deployment, Production operation, or branch deletion.
