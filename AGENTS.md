# Conduit BOQ — Repository Handoff

## Current handoff — C documentation alignment after L1, 2026-10-23

Latest recorded application release is LIST-1B L1, exact commit
`b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`, tree
`bc47a60a9d97f2ba655f7bafedd4f0a3154a20d7`. The
[L1 Production receipt](docs/06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md)
records exact 15-file Solo publication, Quality 762 tests, Vercel Ready/Current
and approximately 14 minutes of bounded no-write smoke PASS. This is dated
release evidence, not a fresh Production inspection or full business-write PASS.

Dependency [A](docs/06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
(`a3114fc`) and [B](docs/06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md)
(client `42e01c5` plus Production 031 ledger
`20261023063934/boq_duplicate_stale_conflict_guard`) are closed separately.
B Production HTTP remains **NOT RUN**, not PASS or a mandatory pending probe.
Migrations **027–031 are immutable/no-replay**; all completed release and
conditional rollback authority is consumed without a general future grant.

Current Owner approval covers local alignment/review of the existing **48
Markdown C documents**, link checks and documentation contract tests only.
The **nine local parity tooling/baseline files** remain separate and unchanged.
No staging, commit/push/deploy, Production read/write, DB reset/restore,
migration, account/reference, Catalog/Factor F or package/lockfile operation is
authorized. Preserve original local accounts/passwords, dirty work and archive
custody. Documentation-only work needs no Docker reset or database tests.

L1's 25-row server pages, authorized whole-result search/sort/count, one complete
page-route batch and actor-scoped session search are released. Search text can
still appear in Data API URLs/logs. L1.1/L2, S0/SSO, wider R0/D0, W-H and
Expression remain unapproved work under [Roadmap #09](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md).
The dated execution records below preserve earlier approval stages; their
"current", "pending" and "unapproved" wording applies at those stages, not
instead of this handoff or the linked final receipts.

Read these files before changing this repository:

1. [`docs/08_ai/AI_HANDOFF.md`](docs/08_ai/AI_HANDOFF.md)
2. [`docs/08_ai/AI_CONTEXT.md`](docs/08_ai/AI_CONTEXT.md)
3. [`docs/08_ai/LESSONS_LEARNED.md`](docs/08_ai/LESSONS_LEARNED.md)

## B release closeout — 2026-10-23, completed before L1

The Owner closed exact B (client `42e01c5` plus Production 031 ledger
`20261023063934/boq_duplicate_stale_conflict_guard`) using the recorded local
integration, quality/deployment and metadata/ledger evidence, and chose not to
run an additional Production HTTP probe. Use the [B final closeout](docs/06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md).
Production HTTP remains **NOT RUN**, not PASS or a required pending B task.
Do not automatically ask for the same probe again or carry this decision into
LIST-1B test requirements. All execution/publication authority is consumed;
027–031 remain immutable/no-replay. At that closeout, the next step was local
documentation/LIST-1B review; the later L1 release is recorded above.

## Production 031 closeout — 2026-10-23, earlier execution

The Owner later explicitly approved one Production 031 application inside the
confirmed Copy/no-other-DDL window. Preflight passed; the migration executor
was called once and returned success. Actual ledger identity is
`20261023063934/boq_duplicate_stale_conflict_guard`; successor definition SHA
`508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`,
OID `112777`, non-source metadata/comment/security and related contracts passed
postflight and independent review. Use the [031 Production receipt](docs/06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md).
No business RPC ran: Production stale HTTP remains NOT RUN, not full behavior
PASS. No commit/push/deploy occurred. Migrations 027–031 are immutable/no-replay;
execution authority is consumed, with no further Production operation authorized.
Local closeout docs/C work remain uncommitted. Earlier B/031-pending passages
below preserve their stages and are superseded only for this completed DB step.

## B client publication closeout — 2026-10-23, earlier execution

The Owner's later explicit Solo approval published only exact B4 as commit
`42e01c56fe2eacb5239abc8d296ca1848c48a03b`, tree
`6283410f997d00fc808cd9d8f7153b9bc381786f`. Quality passed 658 tests and
Vercel Production is Ready/current from that source. Use the
[B client receipt](docs/06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md).
At this client-publication stage, 031 was committed SQL source only: no DB
connection, mutation or migration ran in that publication.
The stale-Copy database correction is still open; 031 Production execution and
business RPC proof remain unapproved. Do not replay 027–031. This client
publication authority is consumed; closeout docs and existing C work remain
local, with no second push authority. Earlier no-publication/B-unapproved text
below records prior stages and does not erase this bounded later execution.

## Working agreement — 2026-10-15

Follow the [release working agreement](docs/07_process/RELEASE_PROCESS.md#working-agreement-20261015)
for every task: inspect existing work first, stay within the approved small
scope, test affected DB-backed flows on local Docker against the relevant
current Production contracts, and report exact source/target/results/limits
before proposing release. CI/build/unit-test PASS is not database-flow PASS.
Unknown relevant parity or failed required tests must not be presented as
release-ready. Existing release exceptions apply only to their named release.
Documentation-only work does not need Docker tests. Do not invent extra PRs,
test-DB backups, stacks or repeated approvals inside an already approved scope.
This agreement authorizes no implementation, DB reset, publication or
Production operation. The later bounded execution below supersedes the earlier
documentation-only session limit only for that task.

## Local database parity execution — 2026-10-23

The Owner's later "ดำเนินการเลยครับ" authorized the previously described
local baseline work: fresh read-only Production schema/metadata capture, tooling,
reset/restore of the existing `conduit-boq-local` test target, synthetic reference
and Auth fixtures, and real local API/browser tests. This supersedes the earlier
documentation-only limit only for that bounded task. It authorizes no product
behavior fix, dependency update, commit/push/deploy, Production write or migration
replay. Preserve the existing local usernames and configured `LOCAL_TEST_PASSWORD`;
do not replace the Owner's password file with random test credentials.

Use the [local parity result](docs/06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
for actual execution/evidence and the remaining release blocker. A matched schema
does not make failed HTTP/browser acceptance PASS. Migrations 027–030 stay
immutable/no-replay; a discovered product defect needs a separately approved fix.

The preparation task is now recorded as **PARTIAL**, with 46/47 API cases
passing and the stale-Copy transport case failing. All seven original local
accounts use the unchanged configured password. The completed task is not
standing permission for another reset or a product/platform correction.

## Local dependency candidate follow-up — 2026-10-23

The Owner later approved the bounded package/lockfile patch, seven lint fixes
in five application files, existing-Docker tests and real-Next Placement
verification. Use the [local candidate result](docs/06_engineering/DEPENDENCY_SECURITY_LOCAL_RESULT.md)
for exact source, tests and limits. Lint has zero errors; the real Next
error/retry comparison passed 14 checks without another application fix.
The later Owner-approved one-shot metadata read reported Production PostgREST
14.5. A separately approved REST-only local alignment now runs actual 14.5;
one fresh stale Copy still timed out at 15 seconds with no application residue.
Use the same result's 14.5 addendum: DB/container/volume and schema contracts
were preserved; no DB reset or migration ran. The metadata-read and local
alignment tasks are complete and grant no further Production access, RPC fix,
reset, migration or publication. The Owner explicitly deferred the long-note PDF column-layout
issue; preserve print code and do not reopen that work without a new request.

## Local stale-Copy correction — 2026-10-23, later follow-up

The Owner's later request to continue while away followed the proposed bounded
RPC/client correction. Use the [local conflict-fix result](docs/06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md):
new forward 031 was applied once to the existing local DB; fresh API **49/49**,
two-tab stale denial/reload/fresh Copy, 664 tests, lint, TypeScript and build
passed. Local is now **captured Production baseline plus 031 candidate**, not
the unchanged Production contract. The frozen baseline remains unchanged.
Historical 46/47 and 14.5 timeout failures remain their dated results.

This bounded local task is complete. Keep the dependency/lint and conflict-fix
changesets separate; release order/any named exception still needs the Owner's
decision. No further Production read/write, commit/push/deploy, reset, migration
application or account/reference operation is authorized. Do not replay local
031; migrations 027–030 remain immutable/no-replay. Preserve existing dirty work,
test records, original credentials and the PDF deferral.

## 031 authority correction — 2026-10-23, after the read-only audit

031 was created and applied locally without explicit migration approval: the
request to continue while the Owner was away was overinterpreted. The Owner's
later approval permits local continuation prospectively; it does not
retroactively approve that earlier operation. Preserve its actual receipts and
chronology; see the [canonical 031 result](docs/06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).

The current step is documentation and local release-source validation. Keep
031 SQL and the existing DB state unchanged: no reset, replay/application of
031, account/reference mutation, Production read/write, staging, commit, push or
deployment. No named stale-failure release waiver is inferred. Any future 031
execution requires an exclusive window with no concurrent DDL on the target
function or its security metadata; its advisory lock alone does not ensure this.

## Dependency A Production closeout — 2026-10-23, earlier execution

The Owner subsequently approved A-only Solo preflight/commit/push/deploy. Exact
A8 commit `a3114fc0eda2eb8d898ad2949ebc71250515df1f`, tree
`8ef2acfacf3f22179c278070a4234ad81b3b9bee`, is on main and was verified as
Vercel Production Ready/Current. Quality passed 643 tests; fresh production audit
was zero; additional Node 24 checks passed after live configuration inspection.
Use the [A release receipt](docs/06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
for exact evidence and limits. No authenticated BOQ/Print or Production DB check
was run. The known stale-Copy FAIL remains tracked; its A-only exception and A
publication authority are now consumed. B/client/031 remain unapproved and local.

Only A8 was committed/pushed. Closeout docs and existing C work remain local;
there is no second docs push authority. No DB mutation/reset or migration ran.
027–030 remain immutable/no-replay and local 031 must not be replayed. The
earlier PLAN/DOCS-only and no-execution passages below are their dated stages,
superseded only by this completed A release, not by standing future authority.

## A-first release plan — 2026-10-23, earlier Owner decision

The Owner explicitly said: “ยอมรับ stale Copy FAIL ชั่วคราวเฉพาะ dependency
release นี้ครับ เตรียมแผนปล่อย dependency ก่อน แล้วตามด้วย stale Copy แยกชุด
ให้ผมตรวจก่อน โดยยังไม่ commit/push/deploy หรือแตะ Production”. Use the
[two-release plan](docs/07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md):
exact reviewed eight-file dependency/lint candidate A first, then stale-Copy B
separately. The named predecessor stale-Copy exception is **ACCEPTED for A
only**; do not ask for it again. It is consumed at A closeout and does not carry
to B or another release. Earlier no-waiver/order-undecided text is chronology.

Current scope is **PLAN/DOCS ONLY**: no code, DB test, runtime change, reset,
migration application/replay, staging/commit/push/deploy or Production access.
Keep existing DB/source state frozen apart from these documentation updates.
The 031 authority correction remains valid; this decision is not retroactive
approval or execution/publication authority.

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

## BOQ Save NULL authorization guard current boundary

`BOQ_SAVE_NULL_AUTHORIZATION_GUARD_PRODUCTION_CLOSEOUT_20261012`

- The reviewed security source is commit
  `cb2bb60eed7ea3d72149df4a4273d8fe1bfdf3c1` on `main`; use the
  [Production Release Result](docs/plans/security/04-boq-save-null-authorization-production-release-result.md)
  as the execution receipt.
- Migration 030 was applied exactly once as
  `20261012100608/boq_save_null_authorization_guard`. It changes only the final
  Save guard from `IF NOT v_is_authorized` to
  `IF v_is_authorized IS NOT TRUE` and preserves function identity, ACL,
  configuration and business calculations.
- Migrations 027, 028, 029 and 030 are immutable/no-replay. A later database
  correction requires a new forward migration and fresh explicit approval.
- The generic advisor warning for authenticated execution of the intentional
  `SECURITY DEFINER` Save RPC remains accepted for this bounded release. Other
  existing advisor findings remain separate work and are not fixed by 030.
- The release authority is consumed. It does not authorize Quantity runtime,
  LIST-1, broader Auth/Security work, Catalog/Factor/BOQ data operations,
  account changes, another deployment or Production mutation.

## Quantity Input Safety Production boundary

`R0A_QUANTITY_INPUT_SAFETY_PRODUCTION_CLOSEOUT_20261012`

- Quantity Input Safety is live in Production from exact source
  `4d285f81fa7ad418039ccd8428c2e55ac1e65ce8`, tree
  `4a2a2fa8ba848de2c367420e43ad2c765efdc95b`. Use
  [Production Result #08](docs/plans/product/08-r0a-quantity-input-safety-production-release-result.md)
  as the execution receipt; [Preview Result #07](docs/plans/product/07-r0a-quantity-input-safety-preview-result.md)
  remains the frozen Q-A chronology.
- The runtime/tests change is
  `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc`. The later commits carried the
  reviewed runtime through Preview and direct fast-forward integration without
  adding a migration or changing runtime behavior.
- The release keeps Quantity numeric-only, recalculates valid drafts in real
  time, retains invalid operator text visibly, prevents `5x2`/`5*2` from
  becoming `52`, and restores saved values on Escape/Cancel/reload. It is not
  Quantity Expression and adds no formula persistence, schema/RPC change,
  migration, Catalog/Factor mutation, BOQ backfill, or account change.
- Authenticated no-write Production QA, a clean browser console, saved-version
  Print, and a read-only database check passed. No Save, database mutation, or
  migration occurred. Migrations 027–030 remain immutable/no-replay.
- Production confirmed one bounded RouteBadge mismatch: multi-route BOQ
  `UI Test #5` showed `1` in `/boq` while its editor/database had two rows. A
  genuine one-route BOQ showing `1` is expected and is not evidence of this
  issue. Code confirms per-row requests, ignored query errors, legacy fallback,
  and duplicate responsive mounts; request logs separately confirm high
  amplification, but the exact trigger for that mismatched badge observation was not
  captured. Treat it as a pre-existing LIST-1B residual, not a Quantity
  regression. Do not restore comma-splitting; names may contain commas. Fix it
  through one embedded/batched current-page route load plus explicit error
  state.
- Q-A and Q-B authorities are complete/consumed. This result grants no further
  commit, push, deployment, Production write, branch cleanup, LIST-1B, wider R0,
  R1/R2 Quantity Expression, or wider S0 Auth/Security authority.

## Historical dependency-security boundary — before A

The findings and proposed versions below are the dated pre-A observations.
A's final receipt above records the later patch and audit result. Future audit
claims require fresh evidence; no audit/network operation is part of C alignment.

- The successful Quantity Quality run covered install, lint, tests, and build;
  it did not run the repository's `audit:prod` script.
- A fresh `npm audit --omit=dev` on 2026-10-12 reported six Production
  dependency findings: one critical, four high, and one moderate. Direct
  `next@16.2.9` was critical; npm offered `16.4.0` as a non-major fix path at
  that check. Use #09's dated evidence and reverify before choosing a patch.
- Next.js announced another out-of-band security update for 2026-10-14. Prefer
  one isolated dependency-security release after that version is available for
  this Solo workflow unless the Owner chooses immediate remediation followed by
  a second update.
- Do not run `npm audit fix` blindly or mix the dependency patch into LIST-1B,
  Quantity Expression, database work, or a docs-only closeout. Align `next`,
  `eslint-config-next`, PostCSS override intent, Sharp, and the lockfile under a
  fresh reviewed release.

<!-- INTEGRATED_ROADMAP_PLANNING_20261014 -->
## Integrated roadmap and IT decision boundary — 2026-10-14

- Use [Integrated Roadmap #09](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
  for current proposed sequencing and IT/SSO readiness. It selectively
  supersedes older ordering, provisioning and approval-authority-discovery
  recommendations, not frozen release evidence or technical invariants.
- The proposed main order is dependency security -> LIST-1B -> S0/user minimum
  -> wider R0/D0 -> W-H external signed-paper revisions -> R1/R2 Expression.
  Start IT hosting/SSO discovery now; release ordering depends on confirmed IT
  policy. No implementation is authorized by this roadmap.
- The Owner confirmed that an operational BOQ is approved on real paperwork by
  the conduit engineering section manager. W-H is the proposed fit; recorder
  rights, evidence, revision/correction and legacy handling remain undecided.
- Corporate SSO exists, but IdP/protocol are unknown. Internal hosting of the
  entire system is a preliminary Owner assumption, not confirmed IT policy.
  Do not preselect SAML, build Invite/password flows by default, or assume SSO
  automatically links old Auth UUIDs or grants application roles/AAL2.
- This session authorizes local documentation alignment only. It grants no
  package/lockfile/runtime change, schema/RPC/migration, account/data operation,
  commit/push/deployment or archive access. Migrations 027–030 remain no-replay.
- The Owner deferred the three extra market-research proposals: Excel intake,
  additional business-scope/quantity provenance, and extra pre-issue
  quality/stale-save enhancements. See #09 section 8.1. Do not reintroduce
  them as prerequisites under another name; keep original S0/D0/W-H contracts.
  [Research/Backlog #10](docs/plans/product/10-global-estimating-research-and-capability-backlog.md)
  preserves ideas and official comparisons without approving their delivery.
- [Local Database Parity Plan](docs/06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
  is plan-only. The 2026-10-15 refinement proposes rebuilding the existing local
  test DB after execution approval; recreatable test data needs no mandatory
  backup or separate stack. Owner backup files remain untouched and are not a
  prerequisite unless selected as input. Capture/setup/test need approval. Never
  run the old 030 Docker runner or rename/bundle 027–030 as a replay workaround.

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
