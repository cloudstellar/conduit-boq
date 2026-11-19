# Conduit BOQ — Agent entry point

Durable repository guidance, revised 2026-11-19. Read this file before work.
The Owner's latest explicit instructions determine the current scope; a plan,
old approval, successful method or historical receipt grants no new operation.

## Start a session

Read the current entry sections of these mandatory documents before changing
the repository; consult their dated history when relevant to the task:

1. [AI_HANDOFF — current checkpoint](docs/08_ai/AI_HANDOFF.md#current-resume-checkpoint):
   current work, last closed result, open decisions and authority.
2. [AI_CONTEXT — current rules](docs/08_ai/AI_CONTEXT.md#current-agent-rules):
   durable execution and evidence rules.
3. [LESSONS_LEARNED](docs/08_ai/LESSONS_LEARNED.md): applicable lessons and
   known mistakes.
4. [Release process — method selection](docs/07_process/RELEASE_PROCESS.md#current-method-selection):
   established procedures, prerequisites, runners and delivery checks.

Verify local Git branch, HEAD, upstream/tracking refs and worktree read-only.
Existing uncommitted files belong to the Owner; preserve unrelated work.
Local tracking refs are observations, not a fresh remote or hosted check.

Before execution, briefly state the task, applicable established method,
runner/source, target/baseline, acceptance checks and approved side effects.
Choose the previously successful method that fits this task and still meets
its prerequisites. Different tasks can use different methods. Inspect the
existing source, scripts and available evidence before proposing a replacement.
If it no longer fits, explain the actual gap, proposed alternative and effects
before changing approach; seek approval only for additional scope that needs it.
Continue routine steps already included in the Owner's approval.

## Engineering decisions

Read the applicable [existing ADRs](docs/02_architecture/ADR/README.md) and
their later amendments before proposing a material design change. State which
decisions the proposal follows or would supersede. Discover existing identifiers
before proposing a new ADR; never reuse a number or overwrite an accepted
decision with a different one.

Before a material business, architecture, security, data or infrastructure
decision, define the problem and acceptance criteria, inspect current contracts,
and compare viable alternatives on consistent criteria, including keeping or
deferring the current approach when reasonable. Explain benefits, costs, risks,
effects on existing users and long-term maintenance; recommend a proportionate
solution and record the Owner's decision and open questions before execution.
Use the [engineering decision review](docs/07_process/RELEASE_PROCESS.md#engineering-decision-review)
in the active plan. Accepted direction is separate from implementation authority
and tested/released status. Routine choices inside an approved scope need no
new comparison ceremony. Keep design simple, trusted authorization and data
integrity explicit, and evidence appropriate to the risk.

## Working boundaries

- Keep the Solo workflow proportionate. No mandatory extra PR, test-DB backup,
  full Production data copy or second Docker stack for every task.
- Documentation needs diff/link and relevant document checks. Source/build,
  mock integration, real DB/Auth/API/browser flows, mail delivery, app release
  and DB application have distinct methods and evidence requirements.
- Use relevant current schema/RPC/permission/behavior contracts for DB-backed
  testing. A running container or CI/build PASS alone is not that proof.
- Preserve original local usernames/passwords, account authority and data.
  Fixture/session creation and cleanup must have an approved target and scope.
  Never reopen finalized runs. Unknown write outcomes stop further mutations;
  reconcile within the permitted read scope before retry or cleanup.
- Preserve migrations **027–033** as immutable/no-replay. Do not reset, restore,
  reseed, apply migrations or alter DB/Auth/configuration without explicit scope.
  A later correction uses a newly reviewed forward change.
- Preserve Catalog, Factor F and existing BOQ/account data. A documentation or
  UI task does not authorize Catalog publication, repricing or data repair.
- Production reads/writes, email tests, stage/commit/push/deploy and rollback
  require the current task's explicit authority. Existing MCP/Git/Vercel
  procedures are reusable knowledge; their old grants are consumed.
- Report exact source/target, PASS/FAIL/HOLD/NOT RUN, cleanup and limitations.
  Keep historical failures and accepted residuals truthful. Do not present a
  proposed direction or metadata check as runtime acceptance.
- Use existing installed dependencies and the selected method's recorded
  commands. Do not install/update packages, alter lockfiles, disable rules or
  substitute a bundler merely to make a failed gate appear to pass.
- At a meaningful checkpoint or pause, update current status and link evidence
  within the authorized scope. Keep reusable non-secret procedures in the repo;
  do not rely on temporary paths as the only long-term record or store secrets
  in Git. A missing private artifact is a gap to report.

## Documentation ownership and product references

Use the [documentation ownership map](docs/README.md#single-source-of-truth-map)
to locate the one maintained source for each kind of information. Update that
source and link to it from other entry points; historical snapshots are retained
as history, not synchronized as competing current documents.

- [Roadmap #09](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
  owns sequencing; [UM #12](docs/plans/product/12-user-management-um-a-and-um-b-plan.md)
  owns its closeouts and remaining scopes; [BOQ workflow #13](docs/plans/product/13-boq-operational-workflow-plan.md)
  is a design proposal. Current status and pending decisions are in the handoff.
- [NT brand #11](docs/plans/product/11-nt-brand-system-and-sitewide-ui-rollout-plan.md)
  governs future visual work; inspect current Master Catalog/app patterns first.
- Master Catalog completion/no-replay authority:
  [Handoff #106](docs/plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
  and [Result #107](docs/plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
  Older phase HOLD/pending statements retain their recorded dates.
- R0A remains numeric-only. Quantity Expression, SSO, broader roles and workflow
  implementation require their own reviewed scope; a roadmap is not that grant.

## Workspace and protected archive

`LOCAL_WORKSPACE_HANDOFF_20260829`: the canonical checkout is
`/Users/cloud/Cloudstellar/conduit-boq`. The protected historical checkout is
`/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829`, with its linked
archive worktree at `/Users/cloud/.codex/worktrees/1ede/conduit-boq`.
Do not inspect, edit, move, delete, clean, stage, upload or share that archive
or its protected evidence/secrets. Owner backup/snapshot files are separate
from the test DB and outside ordinary cleanup. No broad cleanup or pruning is
authorized by this guidance.

## Preserved history

The complete pre-refactor AGENTS text is retained byte-for-byte in
[AGENTS_HISTORY_20261118.txt](docs/08_ai/AGENTS_HISTORY_20261118.txt).
It is a plain-text historical snapshot; its relative links refer to the repo
root, where the original lived. Its approvals and “current” wording describe
past stages. Use the current entry points above for new work.
Snapshot SHA-256:
`5c3a6119cd43aca89dfc3a5ce9541cccedbaf1b92ee85f016926c962ec7139d7`.
