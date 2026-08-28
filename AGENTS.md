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
  replay them. Repository convergence does not require migration 029.
- Do not replay P-13, P-14, P-14C, P-15, or R-01 through R-05.
- Do not mutate or republish the catalog, reprice/backfill existing BOQs, move
  the catalog pointer, or change Factor F as a documentation/repository
  alignment step.
- A future Publish or Restore is a new business release with new explicit
  approval; it is not continuation of the completed phase.
- The expanded Production persona rehearsal remains an accepted residual,
  **not PASS**.

Production facts in #106/#107 are evidence as recorded on 2026-08-28. If a
task needs a claim about live mutable state, obtain fresh read-only evidence.
Never infer current operational authority from an old approval receipt or from
this file.

## Local evidence custody

- Treat untracked/ignored `files/`, `output/`, `tmp/`, and
  `.private-local-archive/` as protected Owner evidence. Do not edit, move,
  delete, stage, commit, or clean these roots.
- Never run `git clean -fdX`, `git clean -fdx`, or another broad cleanup in a
  checkout that may contain protected evidence.
- Branch/worktree cleanup is a separate explicitly approved task. Confirm
  archive custody and classify every dirty/untracked path before removing any
  branch or worktree.
- The Owner's 2026-08-29 `MAIN CONVERGENCE` commit/push permission is one-shot.
  After the convergence main push, treat it as consumed; it never authorizes a
  later push, deployment, or branch deletion.
