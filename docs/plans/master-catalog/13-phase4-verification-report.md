# Master Catalog Phase 4 Verification Report

> **Current Master Catalog end-to-end closeout (2026-08-28):**
> Data/publication remains complete at `2568.1.0` / `710` active rows with
> reviewed ITEM-0429 and ITEM-0615 values, reviewed XLSX/PDF, no historical BOQ
> reprice, and no Factor F change. P-13/P-14/P-14C/P-15 are complete; they
> must not be replayed. Exact release commit `f3ccc6e...` is on `github/main` and its
> Vercel Production deployment is `Ready`. Migration 028 was applied exactly
> once as `20260828070433/master_catalog_admin_gate_projection`; migrations
> 027 and 028 are immutable/no-replay.
> [Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md)
> retains the invariant and recovery contract. The full audited Admin draft
> workflow is live with Admin/New identity/Retirement exact boolean
> `true/true/true`; published rows remain immutable. Stages A/B/C passed and
> both disposable drafts are `abandoned`, leaving zero working drafts. P-49
> technical implementation and formal closeout are complete. Its unrun expanded
> Production persona rehearsal remains an accepted residual, never a
> retrospective PASS. [Result #107](./107-phase4-p49-master-catalog-final-closeout-result.md)
> is the final Production receipt. `APPROVE MASTER CATALOG FINAL` is consumed;
> there is no open release block, replay, or automatic next step. No catalog
> publication/restore, pointer movement, BOQ mutation, or Factor F mutation
> occurred during this final rollout.
> This overlay supersedes all prior live Status/Current/next-action wording;
> all dated text below is retained as historical evidence only.

<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V2 {"schema":"conduit-boq/master-catalog-admin-edit-status/v2","recordedAt":"2026-08-28T14:32:33+07:00","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"migration028AppliedOnceNoReplay":true,"migration028Ledger":"20260828070433/master_catalog_admin_gate_projection","readOnlyAdminUiLive":false,"fullAdminDraftUiLive":true,"endToEndComplete":true,"p49FormalCloseoutComplete":true,"expandedProductionPersonaTestAcceptedResidual":true,"plan":"105-phase4-master-catalog-admin-edit-completion-plan.md","closeoutResult":"107-phase4-p49-master-catalog-final-closeout-result.md","target":"full-active-admin-draft-workflow","targetAchieved":true,"publishedHardDeleteAllowed":false,"p19Policy":"official-pdf-active-only-draft-pdf-mark-inactive","p19ImplementationComplete":true,"p19RenderedFixturesVerified":true,"p19LocalTestResult":"48-files-444-tests-pass","migration028Required":true,"migration029Required":false,"catalogAdminEnabledCurrent":true,"catalogNewIdentityEnabledCurrent":true,"catalogRetirementEnabledCurrent":true,"catalogAdminEnabledTarget":true,"catalogNewIdentityEnabledTarget":true,"catalogRetirementEnabledTarget":true,"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe","releaseCommit":"f3ccc6ec389d4ae7d09f75e15d0857c45515c96e","vercelProductionReady":true,"productionQaResult":"pass","workingDraftCount":0,"openWorkIds":[],"planDocsAmendmentAuthorized":true,"planDocsAmendmentComplete":true,"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL","finalReleaseAuthorizationConsumed":true,"applicationCodeAuthorized":false,"commitAuthorized":false,"pushAuthorized":false,"mainMergeAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"deployAuthorized":false,"flagChangeAuthorized":false,"automaticNextStep":false} -->


> **Current P-50I verification result (2026-08-24):** the exact P-50I approval
> was consumed; preflight, patch application, and target hash passed. Local
> validation then failed closed at `21/22` authority tests and `30/31` exact
> P-50 tests because a raw marker-name count included two examples embedded in
> Proposal #59's frozen diff plus the actual EOF marker. The anchored count is
> one; focused ESLint and deterministic P-50C checks passed. [Result
> #60](./60-phase4-p50i-local-validation-failure-result-record.md) is canonical.
> No stage/commit/push/new CI/Preview occurred; HEAD/upstream/remote remain
> `2b45f9b...`, the index is empty, and Production is untouched. P-13 remains
> hard-held. [P-50J Proposal
> #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md)
> freezes only the line-anchor correction and is not execution authority.
> Earlier P-50H/P-50I-pending status text is chronology.
> Historical bindings remain [P-50H Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md),
> [P-50I Proposal #59](./59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md),
> and failed Quality run `32661774094`; none grants current authority.

> **Historical pre-P-50G/P-50H ratification checkpoint (2026-08-24;
> superseded by the current result above):** exact P-50D V3 Owner
> confirmation (ratification) was recorded under [Review Remediation
> #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md),
> and the 710-row P-50C package is accepted only as local review evidence.
> At that checkpoint the small repository gate was next. P-50G and P-50H
> chronology is recorded by Result #58. P-50I was later approved and stopped
> locally as recorded by Result #60; P-50J Proposal #61 is now current.

> **Canonical term:** **exact Owner confirmation (ratification)** has the single
> meaning defined in [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md):
> confirm the post-build UUID and named SHA-256 values and accept P-50C only as
> local review evidence. It authorizes no candidate application, Git/CI,
> database/Production/network, P-13/P-14/P-14C/P-15, deploy, or publication.

> **P-50D V3 ratification stop boundary — reached (2026-08-24):**
> [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)
> records the exact Owner ratification and then stops. No small repository
> gate, Git/CI request, candidate application, database/Production/network
> action, P-13 through P-15, deploy, or publication is authorized. This
> supersedes live wording below that names any next step; every later action
> requires a new explicit Owner instruction.

**Current P-12 disposition (2026-08-17):** **Complete.** Production executed
the exact `017` -> `017a` -> `018`-`026` sequence at execution HEAD
`7c5ac6bd88677c0144bf8b8933b39293a2dee866`; final read-only closeout and the
one-use v7 encrypted application-only backup/isolated restore/read-only
checksum passed. All three Phase 4 flags remain boolean `false`.
**P-49 business intent is approved; risk remains open/high and remediation is
deferred under P-51. P-13 is not authorized, but P-49 is no longer its sole
blocker for the exact first closeout.** P-50R SOLO is complete with
`PASS_FOR_P50D_REQUEST`; P-50D Proposal #50 is superseded without approval.
Published/current `2568.0.0` remains the 710-row name/unit/price authority.
Proposal #51 / `P50D-REQ-20260823-V2` records the Owner's one-row
`SELECTED-DELTA` intent only. Exact Proposal #52 /
`P50D-REQ-20260823-V3` is frozen and its exact ratification is recorded above.
The local offline P-50C technical build occurred and its data result is recorded
in [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md),
and the candidate is accepted only as local review evidence. That acceptance
alone did not authorize Git or an operating gate; P-50G and P-50H were later
separately authorized and are recorded in Results #56/#58.
Published `2568.0.0` remains unchanged; provisional target `2568.1.0` still
requires a fresh registry check. The pre-P-49 CI/Preview result is historical
only. P-50H later created and pushed exactly one feature-branch evidence
commit, but Quality failed. No `main` merge, candidate application,
database/Production mutation, deployment, feature enablement, or publication
is implied.

**Current P-37 disposition (2026-07-25):** **Accepted by the Owner under an
explicit guided-UAT variance** against exact implementation checkpoint
`df44b827b290933463da5e14fa9125314660022a`. The Owner requested and
intentionally used button-by-button live guidance, and accepts the combined
Owner-operated guided UI evidence plus developer-operated fault-injection and
cleanup evidence. The evidence is not relabelled independent/no-assistance.
WP-8 is complete; Add/Supplement remains hidden until P-14, and P-12 plus every
Production action remain separate.

**Historical P-12 readiness disposition (2026-07-28):** desk review, Local
read-only verification, and the Owner-authorized Production read-only
database/ledger/advisor window are complete on exact implementation checkpoint
`6827ebc1a729b7675fe91db58e129c9381b33ddb`.
[P-12 Production Readiness Package #39](./39-phase4-p12-production-readiness-package.md)
is HOLD. Management API has proven that Production Data API does not expose
`private`, and exact Supabase PostgreSQL 17 synthetic plus Local
application-only restore rehearsals passed. The encrypted Production readiness
backup/isolated restore and post-write non-force detach/read-only reopen/full
checksum passed. Exact pushed readiness/documentation HEAD
`07d1d3399cea363a2ff923c6393d4a3259ce623c` records remote
`Vercel=success`; no PR-triggered GitHub Actions run is claimed. The fresh
in-window rollback backup remains an execution gate; a post-migration
application-only backup/manifest must also pass after `017`, `017a`, and
`018`-`026` verification and before any P-13 request. The Owner has accepted
same-device-loss risk only for approved P-12 execution through separately
approved P-15 verification, amended to expire at the earlier of the
start of the post-publication checkpoint after separately approved P-15
verification or 168 hours after the recorded P-12 start. If a planned pause
will exceed 24 consecutive hours, create and checksum-verify an independent
encrypted copy before the pause. If an unplanned pause reaches 24 hours, stop
before any further gate and complete that copy before resuming. The Owner
accepted the three
managed-residual recommendations for the bounded scope; leaked-password
protection remains a separate P-14 Auth gate. P-44 froze the exact reviewed
executable migration/application/bootstrap/generator/runner content at clean
pushed commit
`ed94c0304be2741217c7ea2c36322b426de1dfe5`; its Remote record is
`Vercel=success` and no PR-triggered GitHub Actions run exists. P-45 completed
at pushed/upstream-equal `d92d8ced42fc882481ebc2c4579adcf1edbebea7`.
The one P-46 Local authorization was consumed: canonical bootstrap completed
through `025`, then WP-6.5 failed closed because an authenticated public
invoker wrapper could not execute owner-only
`private.catalog_action_error(uuid,text,text,boolean,jsonb)`. P-47 authorizes
only repository implementation/static review of append-only `026` and its
required tooling/test/authority alignment; that repository/static closure has
passed. No Local cleanup/application/reset/retry, disposable execution, Git
write, kit/pass, or Production action is authorized. Replacement
source/tooling HEAD/Remote evidence, a fresh
separately authorized corrected Local result, exact named-human
executor and distinct named-human independent verifier,
path/`current_user`/object-owner/window, and exact P-12 decision remain open.
P-12 is not requested.

The required `catalogAuthorityFingerprintSha256` is also **UNCOMPUTED — HOLD**.
It is a new operational fingerprint defined by CLI Execution Runbook #41 and
the reviewed runner, not a recomputation of the historical
`sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`,
because the historical canonical SQL was not committed. A separately
authorized read-only query must derive it from the encrypted Production
readiness snapshot's isolated restore or fresh in-window Production/restore
evidence. Package #39 and Checklist #40 must record the exact value and
query/evidence source, and the external Production approval must bind the same
bare lowercase 64-hex value before a mechanically
`productionEligible=true` source kit may be used in Production or P-12 may be
requested.

The P-47 CLI candidate continues to separate the future clean pushed
source/tooling HEAD from the later Checklist-#40-only GO HEAD. Because P-46
exposed a new defect, the P-44/P-45 freeze is historical. After independent
review/static closure passed, P-48 separately authorized the exact 25-file
Git-only publication. Its replacement clean pushed HEAD and exact Remote record
are required. Local bootstrap
resets/rebuilds all Local Supabase data and therefore needs fresh explicit
Owner authorization; P-46 cannot be reused. Only after that corrected run
passes may a later
separately authorized source kit drive executable
`calibrate-schema` pass 1, independent contract
review, and a second fresh full isolated rehearsal with a transitive pass-2
closeout and fresh advisor rotation. Production reuses that same kit. The Owner
selected exact Option B bridge
candidate `017a_master_catalog_phase4_global_function_default_privileges.sql`,
ledger `20260728001730_master_catalog_phase4_global_function_default_privileges`,
SHA-256
`12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`,
in `017` -> `017a` -> `018` order. The distinct P-47 candidate
`026_master_catalog_phase4_catalog_action_error_acl.sql`, ledger
`20260729002600_master_catalog_phase4_catalog_action_error_acl`, SHA-256
`472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`,
follows immutable `025`; it preserves the helper body/owner/signature/empty
search path, uses invoker context, grants only authenticated, and changes no
data/default privileges. The authenticated schema-contract review
and both rehearsal passes remain open; no pass-1 completion, pass-2 manifest,
or GO HEAD is claimed.

P-43 replaces free-form schema-contract reviewer claims with contract v3's
structured immutable GitHub PR-review envelope and exact payload marker. A
distinct human must check the review while authenticated before contract freeze
and again after pass 2 immediately before GO; approval v3 records
`githubReviewCheckedAt`. The offline runner validates canonical
structure/hash/identity/chronology but does not authenticate GitHub or prove
non-repudiation. No custom signing/PKI is added under the accepted
honest-but-fallible operator model.

**Disposable finding and selected candidate (2026-07-28):** a rehearsal-only CLI
evidence kit assembled from the dirty working tree targeted a disposable,
loopback-only, network-isolated PostgreSQL 17 database. Supabase CLI `2.107.0`
committed `017` and recorded only disposable ledger row
`20260728001700_master_catalog_phase4_foundation`, then the mandatory postflight
hard-stopped with `Private-schema function default ACL is missing`. No
`018`-`025` migration ran, and neither Local Supabase nor Production was
migrated or written. PostgreSQL 17's global built-in `PUBLIC EXECUTE` default
cannot be removed by the schema-scoped revoke in reviewed `017`; the resulting
absent default-ACL row is recorded in
[Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md).
Do not edit `017`, weaken the verifier, continue the disposable sequence, or
claim exact-path acceptance. The Owner selected a separately reviewed Option B
bridge ordered immediately after `017` and before `018`; a late correction
cannot substitute for that global-default bridge. Migration `018` creates
twelve private `SECURITY DEFINER` helpers without explicit per-function
revokes and grants `authenticated` `USAGE` on schema `private`; without the
effective global default denial, those helpers inherit `PUBLIC EXECUTE`.
Production has not received `017`, and Production Data API does not expose
`private`, so no Production exposure was introduced, but the reviewed ACL
contract still fails. The current bridge-aware runner requires the absent
global default ACL as the transient post-`017` state and enforces the
`017` -> `017a` -> `018` handoff. The historical runner correctly stopped
after `017`. The selected candidate has the exact filename/ledger/hash above,
removes `PUBLIC` and API-role defaults including `service_role` at global,
`public`, and `private` scopes. The later `026` is not the bridge; it is the
separate P-46 callability correction described above. This is
repository-candidate authority only. Do not edit `017` or `018`, or apply
`017a` to the existing post-`025` Local. Independent
review of the bridge passed and P-44 froze it at `ed94c03`; P-46 then exposed
the distinct helper issue. Review/freeze a replacement P-47 source/tooling
HEAD, record its Remote status, and obtain fresh reset approval before a
corrected Local bootstrap. A failed or drifting run stops without retry or
patch until fresh approval.
Kit generation, pass 1, independent contract freeze, and pass 2 on fresh
disposable targets remain later separately gated steps.

The P-12 flag gate is stage-aware. Before `017`, rows for
`catalog_admin_enabled`, `catalog_new_identity_enabled`, and
`catalog_retirement_enabled` must all be absent. After `017`, `017a`, `018`,
and `019`, only `catalog_admin_enabled` may exist and its JSON value must be
boolean `false`. After each of `020`-`026`, all three rows must exist and each
JSON value must be boolean `false`. No Phase 4 flag may be boolean `true` at
any checkpoint.

**Historical implementation chronology (superseded by the current dispositions
above):** WP-6/P-11 complete; WP-6.5 passed its bounded
reliability scope. P-22 placed WP-6.6 closeout on Hold and supersedes the
`3bfc74e` candidate evidence for revised closeout while preserving it as
historical evidence. Repository/static correction passed on `ac31feb`; G1
Local DB/concurrency/P-20 input passed on `e463270`; the pre-amendment
operator/browser preflight passed on `c8f6dca`, and the first P-23 working-tree
checkpoint passed. P-23.1 then amended candidate `020` for explicit version
intent and reserved-number sequencing and added the item-first/create/restore
correction. All earlier `020` live evidence is historical for the amended
candidate. Repository/static verification passed on exact P-23.1 commit
`31fd689`. P-24 then approved bounded annual-range, safe-error, durable-focus,
contextual-authority, and Factor F hierarchy hardening; exact implementation
commit `88d0711` passed the repository/static gate before G1R. The separately
owner-approved G1R clean DB/concurrency/P-20/advisor/browser gate passed on
exact execution checkout `721c2c2`, with final Local cleanup. The separately
owner-approved independent G2 clean rebuild and P-20 comparison then passed on
the same exact executable candidate. P-25 repository/static and approved
standalone Local visual evidence then passed for the 709-change final-review
presentation without DB mutation. A bounded no-reset G3 walkthrough then
passed the real-route stale-after-review guard, fresh-review recovery, audited
abandon, and final Local invariant readback on source `6599c30`. Explicit owner
accept/hold remained pending at that checkpoint. P-26 then added and proved the separate
high-impact human-intent guard for Publish, Recode, and Retire on a working-tree
candidate based on `2fd438d`; no publication occurred and Local returned to its
disabled baseline. P-26 was committed at exact
`78e96ab3ed9993707014c4aba1d285b7592b17a1`, and the owner accepted
G3/WP-6.6 on that checkpoint at 2026-07-14 23:50 +07. G4/bootstrap inclusion,
WP-7, proposed WP-7.5, WP-8, and Production gates remained separate at that
checkpoint. P-28 then approved G4 repository integration and WP-7 harness
source on 2026-07-15 without authorizing a Local reset or live DB execution.
P-29 then separately authorized one warned G4E Local reset on exact pushed
checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; the combined `009`-`020`
bootstrap, live WP-6.6/WP-6.5/P-20/WP-7 evidence, advisors, repository gates,
and final invariants passed. WP-7 is ready for owner review; WP-7.5, WP-8, and
Production remain separate.
P-30 then accepted WP-7 and all five P-18 V1 rules at 2026-07-15 01:37 +07,
authorizing bounded WP-7.5 Local-only source implementation. The repository/
static candidate passed at historical migration `021` SHA-256 `78359215...`.
P-32 then authorized Local reset/apply/live evidence; the first runtime calls
failed closed with `42704` and cleanup restored all invariants. The
schema-qualified amendment is SHA-256
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`.
A replacement clean chain, DB/RLS/concurrency/hash/export harness, Thai
desktop/mobile browser workflow, artifact verification, and audited cleanup
passed. P-33 accepted the exact bounded WP-7.5 technical checkpoint on
2026-07-15 13:54 +07. P-34 then authorized and passed the bounded WP-8
placement UX source/static checkpoint on exact
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a`. P-35 integrated unchanged `021`
into bootstrap source. After a separate reset warning/approval, P-36 passed the
integrated Local technical rehearsal on exact checkout
`910cc3cc74660beecf18655d39cd0b0c085d1fc6`, including DB/RLS/concurrency,
P-20, WP-7/WP-7.5, export, advisor, repository, realistic-scale route-render,
and clean final-invariant evidence. The Browser runtime could not dispatch
React/Radix client state changes, so independent intended-admin interaction,
keyboard/recovery/error-comprehension UAT remained open. The first no-reset
intended-admin session on 2026-07-17 then failed comprehension before any
placement confirmation. The corrected source presents the unchanged placement
contract as one insertion-gap choice with truthful local state and bounded
impact review; real-route desktop/mobile interaction QA passed. A 2026-07-18
Local continuation then passed retryable stale-lock rejection, one accepted
18-row placement, exact-request idempotent replay, accepted-state route
readback, audited disabled-baseline cleanup, and post-evidence repository
checks. Corrected-flow checkpoint `e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512`
is pushed. Later no-reset sessions passed leave/return/reload recovery and the
complete owner keyboard/focus/presentation path; final pushed checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` passed verification and cleanup.
The owner did not submit the final placement batch through the UI. Broader
independent core-admin UAT, three safe-error recoveries, and named import-
preview/publish-readiness interaction baselines also remained open at that
checkpoint. WP-8 was In progress and P-37 remained HOLD; Production remained
unauthorized. See
[Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md) and
[Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md). P-38 subsequently
authorized evidence reconciliation and one bounded no-reset continuation.
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md)
now preserves the reusable evidence boundary and defines the pending Cards
A-G, E-01/E-02/E-03, named performance budget, stop rules, and cleanup. No
Local DB command or Production action was run during that reconciliation.
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md)
subsequently corrected E-01 to an unmapped Local candidate, verified the
hash-bound E-01/E-02 binaries through the application ExcelJS dependency, and
added fail-closed no-reset prepare/status/cleanup tooling. Read-only Local
status matched the disabled baseline. The first Card A run was later stopped
and safely cleaned after the owner identified that permanent reservation could
create unexplained official release gaps. P-39 now supersedes that numbering
rule through [Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md).
The pre-P-39R P39-S source/static result is historical. Corrected P39R-S passed
with migration `022` SHA-256
`9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`,
33 files/189 tests, TypeScript, lint with 0 errors/10 existing warnings,
authority 710/65/17, script syntax, network-enabled production build, and diff
checks. Exact source commits through `7997387` are pushed. Incremental Local
`022` then passed backfill/release and pointer/catalog/BOQ/Factor F/flag
invariants without reset. Corrected policy-only `023` later applied from exact
pushed `6f01457` and preserved the same baseline. The resumed live harness
passed the accumulated-history/RLS boundary, then safely timed out in migration
`021` row-level placement invalidation while cloning 710 rows. Cleanup passed.
Owner-approved bounded forward `024` replaced only that trigger execution shape
with statement-level transition tables and transaction-local caches. Exact
pushed `b6d58ce6cfedafa5812821edb49b897c2856f049` applied without reset;
WP-6.6, WP-7.5, canonical, cleanup, and adjacent exact hashes passed. P39R-L is
passed. Separately approved P39R-C then clean-bootstrapped `009`-`024` and
repeated DB/RLS/concurrency/export/advisor/invariant evidence on exact pushed
`10531610eac53a97c6ef8f9d06418766b58bee36`. The final canonical hash remained
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`
for 710 rows/471,777 bytes, with three statement placement triggers, zero row
placement triggers, zero drafts, and all flags false. Production remains
untouched. P39R-U later passed with `2568.5.0-D001`/`D002` and one reused
unissued target. The exploratory Cards B-F passed Card F, found UAT-01 through
UAT-05, and were safely cleaned, but live collaboration means they do not close
the scored UAT. Exact pushed P-40 checkpoint `dc83c35` corrects those findings
without a migration; separate one-draft developer browser QA passed and
disabled-baseline readback was restored. At that P-40 checkpoint, fresh scored
Cards A-G remained pending; the later P-42 recovery run is recorded below and
now supplies retained Card B-E functional evidence. At that recovery
checkpoint only the four post-correction Owner spot-checks and cleanup
remained open; final D005 is recorded below. Before
P-39, the historical
P-38 focused checks passed 3
files/17 tests; the full suite passed 33 files/185 tests; script syntax,
TypeScript, lint with 0 errors/10 existing warnings, authority 710/65/17, exact
pinned-input/provenance/cleanup contracts, and diff check passed. No build was
rerun at that historical checkpoint because its application, dependency, and
migration source were unchanged.

P-41 now owns UAT-06 through UAT-08 from the continued P-38 discovery:
versioned category keys may be full authority labels (current Local maximum 96), a
retirement-disabled Full import must remain a complete non-persistent preview,
and draft-only withdrawal must not leave a hidden order gap. The bounded source
correction and migration `025` SHA-256
`00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f`
are present; `025` was incrementally applied to the disabled Local baseline
without reset. Exact pushed source
`bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed 34 files/220 tests,
TypeScript, lint 0 errors/10 existing warnings, authority/input checks, script
syntax, network-enabled build, diff checks, and live WP-6.6 smoke. The smoke
evidence SHA-256 is
`8d118e14c69f7ea9209123852011b1610d4c63687ff5133136bd6f15875463ed`.
After a fresh warning and owner approval, exact pushed execution source
`adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied `009`-`015`, hotfix
`016`, and `017`-`025`. WP-6.5/WP-6.6/WP-7/WP-7.5 passed with evidence
SHA-256 `4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245`,
`e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251`,
`5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195`,
and `0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240`.
Canonical verification detected `017`-`025`, placement triggers 3/0 plus one
compaction trigger, exact hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
and 471,777 bytes. Final readback repeated pointer `2568.0.0`/710, zero working
drafts, all flags false, BOQ 198/1,547, zero unversioned BOQs, and Factor F
`2569.0.0`/36. Fresh scored Cards A-G remain pending.
The first post-evidence `prepare` on exact pushed checkpoint
`2c39dddd10c361bd1244292f4bd79e06f167c919` failed closed before session or
feature-flag mutation because the new Local category preflight referenced an
undefined `rows` helper. Immediate readback confirmed the exact disabled
baseline. The bounded correction uses the Supabase result array directly and
adds an authority regression assertion; no migration, reset, draft, BOQ,
Factor F, hotfix, or Production action is involved.
Discovery drafts are not scored Owner evidence.

Exact pushed `d00c941ac11a271c2a149bc016da045cea870a26` then passed the
prepared-session correction and created one immutable scored session. Card A
stopped under P-42 after `2568.5.0-D002` validly issued Local `2568.5.0` through
a current-lock request. The terminal route then displayed the false draft-only
warning **อ้างอิงเวอร์ชันฐานเก่า**. Read-only session/audit/gateway evidence
shows one publication RPC/effect and no stale-lock bypass. Current Local has
pointer/default `2568.5.0`/710, dataset hash
`sha256:46b4b61abdb8cee77065ae979b85ae6df39b4dcc0a6c9ff083aa3f768d202912`,
zero drafts, admin/new-identity flags true, retirement false, BOQ 198/1,547,
Factor F `2569.0.0`/36, and Production untouched. Cards B-G did not continue.

Exact pushed P-42 checkpoint `b2500b5e6859a915bfa3f70d558934f252943f82`
binds mutable review routes to `reviewLock`, makes a
mismatch a hard stale state with no diff/publish panel, retains the lock in
item return paths, restricts stale-base warnings to drafts, and renders terminal
review with accurate read-only/base-versus-this-version wording. Focused 3
files/26 tests, full 35 files/225 tests, TypeScript, lint 0 errors/10 existing
warnings, authority/input checks, network-enabled build, diff check, and
published-route browser QA passed. Because the issued Local
version must remain immutable evidence, clean recovery requires a separately
warned/approved Local bootstrap, not pointer-only restore or ad hoc SQL. See
[P-42 Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md).

The Owner then approved one warned P-42 recovery bootstrap. Exact pushed source
`f8c670901997a4e6663db7c4db1218efc03d51c6` restored canonical Local
`2568.0.0`/710, verified inputs 708/708/693 and authority 710/65/17, and
prepared immutable session
`tmp/master-catalog/p38-owner-uat/session-p42-scored-20260719-f8c6709.json`.
Cards A-G all passed functionally. Card F reused request
`35defa1c-4195-4177-bb7e-8f9981662e57` after an intentionally lost response
and read-only verification found one change set and one item effect. Card G
audited-abandoned D002 at lock `8 → 9`; cleanup confirmed D001/D002 abandoned
against target `2568.1.0`, zero working drafts, all catalog flags false, pointer
`2568.0.0`/710, canonical hash `sha256:2e3571...`, unchanged BOQ/Factor F
invariants, no post-prepare reset, and no Production action. Because live
guidance and developer-operated Cards F-G were used, this is functional
evidence rather than strict independent Owner-scored closure. At that
checkpoint P-37 remained HOLD for bounded finding disposition/correction and
proportional rendered revalidation.

The Owner then approved the recommended bounded finding corrections. Exact
evidence checkpoint `1c901855a32b100013fb5c9472c2e909e3dd1c59` preserves the
functional P-42 recovery record, and exact application/test/procedure
checkpoint `bdc104f77f18ea8fc776950259bc25e68c2fd42a` corrects
P42-UAT-B01, C01/C02, D01/D02, E01, and F02 without a migration. Focused
action-model/placement-storage/operator-workflow tests passed 3 files/31 tests;
the full suite passed 36 files/229 tests; TypeScript, lint with 0 errors/10
existing warnings, authority 710/65/17, real-parser inputs 708/708/693,
network-enabled production build, and diff checks passed. Read-only Local
status remained pointer `2568.0.0`/710, zero working drafts, all catalog flags
false, unchanged BOQ/Factor F invariants, and Production untouched. A rendered
post-correction spot-check pass is not claimed: the controlled browser had
no authenticated Local session and the clean Local baseline intentionally has
no working draft. The Owner retained completed Card B-E evidence; only the four
post-correction spot-checks in Note #35 Section 1.2 and cleanup remained at
that checkpoint. No reset was implied.

Final no-reset D005 on exact pushed execution source
`6fe3a6a1b2c04a418187167c143960ba412672da` completed the proportional
execution. The Owner physically scrolled the modal-contained placement list,
changed one gap without saving a placement batch, and observed
**ปรับในหน้านี้ 1 / ยังไม่บันทึก**. The response-loss check retained the
form and recovered request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with
`duplicateRequest=true`, the same request/response ID, one committed version,
and no second effect. D005 was audited-abandoned and schema-2 cleanup restored
pointer `2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547, zero
unversioned BOQs, and Factor F `2569.0.0`/36 without a Local reset or
Production action. Follow-up application checkpoint `b639c03` keeps normal
and recovered success feedback visible across refresh. The exact post-reload
stale-choice-discard banner was not separately captured before that cleanup.
Exact pushed checkpoint `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`
then corrected the development Strict Mode notice replay and passed one narrow
no-reset D007 visual replay. The page displayed
**ยกเลิกตัวเลือกเดิมที่อ้างอิงฉบับร่างเก่าแล้ว**, restored the current system
suggestion, wrote zero placement reviews, and cleaned to pointer
`2568.0.0`/710, zero drafts, and all flags false. Execution evidence is
complete. At that checkpoint P-37 remained HOLD only for the explicit Owner
accept/hold decision; the 2026-07-25 decision above supersedes that current
status without rewriting the historical evidence.

**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Candidate version:** System-planned ADR-003 number; `2568.1.0` only when still
unreserved (publication metadata/P-15 pending)

## 1. How to use this report

Fill every applicable evidence cell. Use `Passed`, `Failed`, `Blocked`, or
`Not applicable` with a reason; do not leave an executed gate ambiguous.
Point-in-time counts must include timestamp/time zone and source. A failed
blocking gate stops the rollout.

Use the authority/evidence index in the
[Execution Progress Tracker](./25-phase4-execution-progress-tracker.md). This
report owns detailed executed results, commands, counts, and hashes; other plans
should link here rather than copy volatile evidence.

## 2. Execution summary

| Phase | Environment | Executor | Started | Completed | Result | Evidence |
|---|---|---|---|---|---|---|
| 4-0 documents/data decisions | Repository | Owner + developer | 2026-07-04 |  | In progress | P-01 through P-11/P-17/P-18/P-20 approved as recorded; P-09 publication metadata, P-19, and Production gates remain separate |
| 4A additive schema | Local | Codex + owner/developer | 2026-07-05 | 2026-07-15 | G4E combined Local execution passed | Final `020` passed separate Local apply twice on exact candidate `721c2c2`; P-28 placed unchanged `020` after `019` in bootstrap source; P-29 then passed the combined clean chain on exact `15b707d`. Production remains unapproved. |
| 4B application/workflows | Local | Codex + owner/developer | 2026-07-05 | 2026-07-14 | G3/WP-6.6 accepted | Version planning, item-first edit, final review, import, abandon, restore-confirmation, real-route stale-after-review recovery, and high-impact confirmation/cancel behavior passed; broader independent UAT remains WP-8. |
| WP-6.6 admin workflow/authority hardening | Local | Codex + owner/developer | 2026-07-12 | 2026-07-14 | Accepted/Complete | Exact G1R/G2 evidence passed on `721c2c2`; P-25/G3/P-26 passed; the owner accepted exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`. |
| WP-7 permanent BOQ/hotfix/Factor F regression | Local | Codex + owner/developer | 2026-07-15 | 2026-07-15 | Accepted/Complete | P-29/G4E clean bootstrap and tracked live harness passed on exact `15b707d`; owner accepted via P-30 at 2026-07-15 01:37 +07. |
| WP-7.5 P-18 placement | Local | Codex + owner/developer | 2026-07-15 | 2026-07-15 | Accepted/Complete for bounded technical scope | P-32 replacement evidence passed with amended `021` SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`; DB source `80b2574`, evidence JSON SHA-256 `875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`, artifact source `7d60ab60`, and UI checkpoint `99fa56c`. P-33 accepted this exact technical checkpoint at 2026-07-15 13:54 +07. |
| 4C clean rehearsal | Local | Codex + owner/developer | 2026-07-15 | 2026-07-25 | P-36 integrated rehearsal and named P-37 technical/recovery/owner gates passed; WP-8 complete and P-37 Owner-accepted under the explicit guided-UAT variance | Exact checkout `910cc3c` passed the integrated chain through `021`, DB/RLS/concurrency/P-20/WP-7/WP-7.5, export/advisors/repository gates, realistic scale, and disabled-baseline cleanup. Later no-reset continuations passed stale/replay/accepted-state/recovery, keyboard/focus/presentation review, proportional D005 placement and same-request checks, exact D007 stale-choice notice recovery on pushed `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`, and D009 Full-import correction on exact `df44b827b290933463da5e14fa9125314660022a`. The Owner accepted the disclosed guided evidence on 2026-07-25; final baseline is pointer `2568.0.0`/710, zero drafts, and all flags false. |
| WP-8 P-42 bounded findings | Repository + read-only Local | Codex | 2026-07-20 | 2026-07-20 | Source correction passed; four post-correction Owner spot-checks and cleanup were pending at this checkpoint | Evidence checkpoint `1c901855a32b100013fb5c9472c2e909e3dd1c59` and bounded source checkpoint `bdc104f77f18ea8fc776950259bc25e68c2fd42a`; focused 3 files/31 tests, full 36 files/229 tests, TypeScript, lint 0 errors/10 existing warnings, authority/input checks, network-enabled build, and clean Local status passed. Completed functional Card B-E evidence is retained. No migration, reset, or Production action. |
| WP-8 P-42 D004 correction round | Local + repository | Owner + Codex | 2026-07-22 | 2026-07-22 | Spot-check 2 and D004 cleanup passed; placement control corrected; exact-source Spots 3-4 plus final cleanup were pending at this checkpoint | D004 returned `IMPORT_PRICE_AUTHORITY_REQUIRED` with no import persistence and passed schema-2 bounded cleanup. Real Browser Spot-check 3 exposed nested-popover wheel failure. Exact `16e88c6487307c4bb0606a048dc53e05e9dcee18` moves the searchable list inside the modal; Owner confirmed physical wheel scrolling and outside-click dismissal. Full gates passed; no migration, reset, or Production action. |
| WP-8 P-42 final exact-source D005 and cleanup | Local + repository | Owner + Codex | 2026-07-22 | 2026-07-23 | Execution and cleanup passed; later D007 closed the remaining visual evidence | Exact source `6fe3a6a1b2c04a418187167c143960ba412672da`; Spot-check 3 passed without a placement write; Spot-check 4 recovered request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with one effect; D005 cleanup restored the disabled baseline without reset; `b639c03` adds durable recovered-success feedback. Production untouched. |
| WP-8 P-42 exact-source D007 stale-choice replay and cleanup | Local + repository | Owner + Codex | 2026-07-23 | 2026-07-23 | C-08 passed; at this checkpoint P-37 awaited explicit Owner accept/hold | Exact pushed source `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`; the page displayed **ยกเลิกตัวเลือกเดิมที่อ้างอิงฉบับร่างเก่าแล้ว**, restored the current system suggestion, wrote zero placement reviews, audited-abandoned D007, and restored pointer `2568.0.0`/710, zero drafts, and all flags false without reset. Production untouched. |
| 4A migration | Production |  |  |  | Not authorized |  |
| Application deploy, flag off | Production |  |  |  | Not authorized |  |
| Feature enablement | Production |  |  |  | Not authorized |  |
| Publish `2568.1.0` | Production |  |  |  | Not authorized |  |
| Closeout | Production |  |  |  | Pending |  |

## 3. Approval gates

| Gate | Approver | Decision | Timestamp | Reference |
|---|---|---|---|---|
| Architecture Revision 8 | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Architecture Review Disposition | Owner | Approved as supporting disposition record | 2026-07-04 | External review is input only; Revision 8 remains authority |
| ADR-004 | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Phase 4 Change Request | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Decision Register | Owner | Approved as Phase 4 decision source of truth | 2026-07-04 | Owner chat approval; P-02 through P-08 recorded separately; P-09 version string, P-10 runtime CI assets, and P-11 export direction recorded separately; P-09 publication metadata plus final P-11 artifacts and P-12 through P-15 remain separate |
| Implement/local rehearsal | Owner | Approved via P-01 | 2026-07-04 | Architecture/contract package approved; local implementation only |
| DB/security contract | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; technical verification and Production migration separate |
| Threat model | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; reviewer verification and Production change separate |
| Parser/hash specification | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production import/publication and final data freeze separate |
| Official export specification | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; P-10/P-11, reviewer sign-offs, and Production publication separate |
| Post-Factor-F Adjustment Plan reviewed | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Implementation Execution Pack reviewed | Owner | Approved for WP-0 through WP-8 | 2026-07-04 | Owner chat approval; Production gates remain separate |
| Reliability plan/authority alignment | Owner | Approved for docs-only alignment | 2026-07-11 | Expanded WP-6.5/WP-7/WP-8 gates and P-20; no Local reset or Production authorization |
| Capability-completeness plan alignment | Owner | Requested full audit and documentation correction | 2026-07-12 | Audit #29 adds WP-6.6, reserves `020`, moves proposed placement to `021`; no reset/implementation/Production authorization |
| P-21 WP-6.6 Local-only implementation start | Owner | Authorized | 2026-07-12 | Owner approved Audit #29 C-01 through C-12/slices A-G; does not imply Local reset/apply, P-18/`021`, WP-7, or Production |
| WP-6.6 destructive Local evidence runs | Owner | Authorized and completed | 2026-07-12 | Canonical bootstrap through `019`, separate Local-only `020` apply, retained DB/concurrency/P-20 evidence, and browser technical QA completed on `3bfc74e`; Production touched: No |
| P-22 operator-workflow correction G0 | Owner | Authorized for docs and Local-only source implementation | 2026-07-12 | [Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md); no Local reset, WP-7, P-18/`021`, P-19, Factor F/hotfix expansion, or Production |
| P-22 repository/static checkpoint | Codex | Passed on exact commit `ac31feb`; G1 not inferred | 2026-07-12 13:18 +07 | 29 files/147 tests, TypeScript, lint 0 errors/10 existing warnings, build with `/review`, smoke syntax, and `git diff --check`; no Local DB mutation or Production access |
| P-22 G1 first Local evidence run | Owner | Authorized and completed; G2 not inferred | 2026-07-12 22:23 +07 | Canonical reset through `019`, separate candidate `020` apply, DB/concurrency/P-20 input, lint/advisors, invariant readback, and repository checks passed on final `e463270`; Production touched: No |
| P-22 pre-G2 operator/UI checkpoint | Codex + owner/developer | Technical preflight passed; G2/G3 not inferred | 2026-07-12 23:33 +07 | Exact source `c8f6dca`; no reset and no `020` change. One-draft/edit/review/audited-abandon flow, Thai/accessibility/responsive checks, 30 files/152 tests, TypeScript, lint, build, and final Local cleanup passed; Production touched: No |
| P-23 operator-context/navigation amendment | Owner | Authorized for docs and Local-only UI/static/browser implementation; no reset inferred | 2026-07-13 | Persistent admin/account context, information-only global nav, exact-draft import route, approved-input versus review-export semantics, three-state import sub-flow, and explicit Local marker. Migration `020`, G1 evidence, P-18/P-19, WP-7, Factor F, hotfix `016`, and Production unchanged. |
| P-23.1 version-intent/item-first correction | Owner | Authorized for bounded docs/application/candidate-`020`/test work; no reset inferred | 2026-07-13 | Explicit annual/revision/patch intent, complete reserved registry, DB next sequence and annual void-number recovery, exact post-create route, item-before-metadata, and restore confirmation. Prior `020` evidence becomes historical; G1R/G2 require separate approvals. |
| P-23.1 repository/static checkpoint | Codex | Passed on exact commit `31fd689`; Local reset/apply not inferred | 2026-07-13 07:55 +07 | 30 files/159 tests, focused contracts 5 files/47 tests including a 1,001-version paged-registry fixture, TypeScript, lint 0 errors/10 existing warnings, authority 710/65/17, smoke-script syntax, network-enabled production build, and `git diff --check` passed. Read-only in-app browser smoke passed Local/disabled/account context and zero console warnings/errors. At that checkpoint the amended mutable flow still awaited G1R, and `020` remained unapplied and outside bootstrap/Production; the later result is recorded below. |
| P-24 pre-G1R hardening | Owner | Authorized; repository/static passed on exact implementation commit `88d0711`; no reset inferred | 2026-07-13 | Annual base +1 through +10, safe stale/range errors, durable focused Thai feedback, collapsed support IDs, contextual first-rollout authority, accessible pagination, and secondary Factor F context. At that checkpoint G1R remained separate; the later result is recorded below. |
| P-24 same-scope pre-G1R closure | Owner + Codex | Repeated-identical-error focus and execution provenance corrected; committed on exact closure-lineage commit `050c998`; no reset inferred | 2026-07-13 | Focused operator/authority contracts 2 files/16 tests; full suite 30 files/161 tests; TypeScript; focused/full lint 0 errors and 10 existing warnings; authority 710/65/17; smoke syntax; network-enabled production build; and `git diff --check` passed. Migration `020` remained unchanged at SHA-256 `c8fa5e7191e17ebc3a00fd18b40f38d1cd4f9e5a6db40f758f3ee5867a064d17`, unapplied, and outside bootstrap/Production. At that checkpoint, final clean G1R execution `HEAD` remained runtime evidence and still required separate approval; that approval and result are recorded in the next row. |
| P-24/G1R exact Local evidence | Owner + Codex | Explicitly authorized and passed; G2/G3 not inferred | 2026-07-13 | Exact execution checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; final migration `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`. Clean bootstrap through `019`, separate `020`, WP-66/WP-65/P-20 input, DB lint/security/performance review, repository gates, bounded browser flow, and final cleanup passed. Production touched: No. |
| P-24/G2 independent Local evidence | Owner + Codex | Explicitly authorized and passed; G3/G4 not inferred | 2026-07-13 | Repeated the clean bootstrap through `019` and separate unchanged `020` on exact checkout `721c2c2`; WP-66/WP-65, P-20 G1R-versus-G2 comparison, DB lint/current advisors, repository gates, and final invariant readback passed. Production touched: No. |
| P-25/G3 real-route technical walkthrough | Codex + owner/developer | Passed technically; owner accept/hold not inferred | 2026-07-14 | No-reset Local run on source `6599c30`: review lock 1, second edit lock 2, stale publish denied with Thai recovery and retained fields, fresh review lock 2, audited abandon lock 3, zero publish effects, clean final invariants. Production touched: No. |
| P-26 high-impact human-intent guard | Owner + Codex | Authorized and passed technically; owner G3 accept/hold not inferred | 2026-07-14 | No-reset Local real-route proof on a candidate based on `2fd438d`: Recode/Retire exact summaries inspected and cancelled; Publish mismatch `2568.0.2` disabled, exact DB-owned `2568.0.3` enabled, then cancelled; 390x844 title/action layout passed; proof draft audited-abandoned at lock 2; pointer `2568.0.0`/710, zero drafts, flags false, BOQ 198/1,547, Factor F `2569.0.0`/36; `publish=0`. Migration `020` and Production untouched. |
| WP-6.6 owner closeout / P-27 G3 | Owner | Accepted exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; WP-6.6 complete | 2026-07-14 23:50 +07 | [WP-6.6 Owner Review Note](./30-phase4-wp66-owner-review-note.md); G4, WP-7, WP-8, and Production remain separate |
| P-28/G4 repository integration | Owner | Authorized unchanged `020` bootstrap source inclusion and tracked WP-7 harness source; passed on exact `2c43f6b0e644171b1ecba60c14566e5856a94b63`; no reset/live execution inferred | 2026-07-15 | Focused 3 files/24 tests and full 31 files/169 tests passed with TypeScript, syntax, lint 0 errors/10 existing warnings, authority 710/65/17, network-enabled build, fingerprint, and diff checks. G4E reset remained pending at this point and was later decided under P-29; Production touched: No. |
| P-29/G4E clean Local execution | Owner + Codex | Explicitly authorized and passed technically; WP-7 owner acceptance not inferred | 2026-07-15 | Exact pushed checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; combined `009`-`020` bootstrap, WP-6.6, WP-6.5/P-20, WP-7, DB lint/advisors, repository gates, and final cleanup passed. Pointer `2568.0.0`, zero drafts, all flags false, BOQ 198/1,547, Factor F `2569.0.0`/36. Production touched: No. |
| P-30 WP-7 acceptance and P-18/WP-7.5 start | Owner | WP-7 accepted; all five P-18 V1 rules accepted; bounded Local-only source work authorized | 2026-07-15 01:37 +07 | Implement migration `021`, exact RPC/read model, Thai-first placement workspace, tests, and aligned docs. Do not add `021` to bootstrap, reset/apply Local, start WP-8/P-19, alter Factor F/hotfix scope, or touch Production without separate approval. |
| P-32 WP-7.5 Local technical evidence | Owner + Codex | Explicitly authorized and passed after same-scope fix-forward; P-33 acceptance not inferred | 2026-07-15 | Fresh bootstrap through `020`, separate amended `021`, role/direct-write denial, rollback/replay/stale/race/order/hash/export evidence, Thai desktop/mobile workflow, final-review scale, and audited abandon passed. Retained JSON SHA-256 `875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`; final Local pointer `2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547, Factor F `2569.0.0`/36. Production touched: No. |
| P-33 WP-7.5 exact technical accept/hold | Owner | Accepted for bounded technical scope; later UX/release gates remain open | 2026-07-15 13:54 +07 | Exact P-32 evidence package accepted. WP-8 placement UX hardening/UAT/performance, `021` bootstrap inclusion, P-19, feature enablement, publication, and Production remain separate. |
| P-34 WP-8 placement UX source/static | Owner + Codex | Authorized and passed for exact bounded source/static checkpoint; live/release acceptance not inferred | 2026-07-15 14:58 +07 | Exact `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a`; focused 2 files/20 tests, full 33 files/183 tests, TypeScript, focused/full lint 0 errors/10 existing warnings, `git diff --check`, and network-enabled production build passed. Local browser confirmed only the disabled baseline; no feature flag or DB state changed. |
| P-35 WP-8 bootstrap source integration | Owner + Codex | Passed on exact source checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`; P-36 remained separately gated and later passed | 2026-07-15 15:42 +07 | Gate commit `43b75e3f0b0643d6f4e741fcc81ea8b0a6311a13`; unchanged amended `021` SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` is after `020`. Shell/Node syntax, focused 3 files/25 tests, full 33 files/183 tests, TypeScript, lint 0 errors/10 existing warnings, authority 710/65/17, dependency audit 0 vulnerabilities, diff check, and network-enabled build passed. No Local DB command or Production action. |
| P-36 WP-8 destructive Local execution | Owner + Codex | Approved after explicit destructive-reset warning and passed for integrated technical scope | 2026-07-15 | Exact gate/execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; integrated bootstrap through `021`, named DB/regression/export/advisor/repository gates, realistic-scale route rendering, and disabled-baseline cleanup passed. Production touched: No. |
| P-37 WP-8 accept/hold | Owner | Accepted under the explicit guided-UAT variance | 2026-07-25 | Exact D005 completed placement interaction and same-request recovery. Exact D007 on pushed `8fb9839...` displayed the stale-choice discard notice and completed disabled-baseline cleanup without reset. D009 passed the Full-import correction on `df44b827...`. The Owner requested live guidance and accepted the combined evidence without relabelling it independent. Add/Supplement stays hidden until P-14. See [P-37 UAT/UX Note](./33-phase4-wp8-p37-uat-ux-correction-note.md) and [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md). |
| P-38 P-37 evidence reconciliation and bounded Owner UAT continuation | Owner + Codex | Interrupted on Card A; safe no-reset cleanup passed; P-37 not inferred | 2026-07-18 | [Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md) and [Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md) retain the evidence. Attempts `2568.16.0`/`2568.17.0` were audited-abandoned; pointer/flags/BOQ/Factor F baseline restored. Resume only after P-39. |
| Historical P-39 source/static candidate | Owner + Codex | Passed under the earlier contract; superseded before live apply | 2026-07-18 | Migration `022` SHA-256 `c517dc24ca16a7b32f32c5f7998668fe79135901e44e27defb43f6ec1df6de09`; 33 files/188 tests and named repository checks passed. Retained only as history; no Local apply/reset or Production action inferred. |
| P-39R source/static lifecycle/deployment correction | Owner + Codex | P39R-S passed at this checkpoint; later live evidence is recorded in the next row | 2026-07-18 | Corrected `022` SHA-256 `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`; global draft scope, stale abandonment, pointer/effect audit, lifecycle/publication/RLS hardening, explicit identifiers, compatibility rules, 33 files/189 tests, TypeScript, lint, authority, syntax, build, and diff checks passed. No Local/Production action occurred at this checkpoint. |
| P-39R incremental `022`-`024` fix-forward | Owner + Codex | P39R-L passed; P39R-C/P39R-U remain separate | 2026-07-19 | Exact pushed `7997387`, `6f01457`, and `b6d58ce6cfedafa5812821edb49b897c2856f049` applied `022`-`024` incrementally without reset. WP-6.6 and WP-7.5 passed in 2.46s/2.29s total. Canonical detected `017`-`024`, trigger inventory 3/0, pointer `2568.0.0`/710, hash `sha256:2e3571...`, 471,777 bytes, zero drafts, flags false, and exact BOQ/BOQ-item/Factor F pre/post hashes. No Production action. |
| P-39R clean integrated chain | Owner + Codex | P39R-C passed; P39R-U remains separate | 2026-07-19 | After a fresh destructive-Local-reset warning and approval, exact pushed `10531610eac53a97c6ef8f9d06418766b58bee36` clean-applied `009`-`015`, hotfix `016`, and Phase 4 `017`-`024`. WP-6.5/WP-6.6/WP-7/WP-7.5, canonical, five-sheet Excel/19-page PDF, independent artifact verification, security/performance advisors, repository checks, and final disabled-baseline invariants passed. The first bootstrap exposed a PostgREST schema-cache startup race fixed at `b79992f`; the first WP-6.5 rerun exposed a stale test assumption fixed at `1053161`. Neither correction added or changed a migration. No Production action. |
| P39R-U/P-38 exploratory UAT and P-40 correction | Owner + Codex | P39R-U passed; exact correction checkpoint pushed and separate developer browser QA passed; scored P-37 evidence remains open | 2026-07-19 | `2568.5.0-D001`/`D002` proved target reuse; Card F same-request recovery passed once; UAT-01 through UAT-05 found money-language, unit-drift, withdrawal-route, numeric-Excel-cell, and E-03 ordering defects. Cleanup restored pointer `2568.0.0`/710, zero drafts, flags false, BOQ 198/1,547, and Factor F `2569.0.0`/36 without reset. Exact P-40 source `dc83c35602fec81d124f43013824649664b8eecb` is pushed; real-parser verification passed 708/708/693 rows; 34 files/216 tests, TypeScript, lint 0 errors/10 existing warnings, network-enabled build, and diff check passed. Separate one-draft developer browser QA passed existing/custom unit selection, Thai money normalization/error, add/withdraw redirect, and notice reload; `2568.5.0-D003` was abandoned and disabled-baseline readback passed. The harness restored flags but did not close scored evidence because only one draft existed. No migration/Production/Factor F/hotfix change. |
| P-41 P-38 discovery correction and clean chain | Owner + Codex | Exact source, incremental smoke, and clean integrated execution passed; scored P-37 evidence not inferred | 2026-07-19 | UAT-06 found the 64-character `categoryCode` ceiling below a real full-label authority key; the latest clean Local preflight measures 96 characters under the shared 500-character contract. UAT-07 found retirement-disabled Full preview incorrectly coupled to persistence; UAT-08 found base-absent withdrawal left a hidden `display_order` gap that the client masked and the DB rejected. The app uses the bounded contract plus live dictionary preflight, exposes a complete read-only/no-Apply preview, rejects gapped placement input, and appends migration `025` SHA-256 `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f`. Exact source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed source and incremental smoke gates. After a fresh reset warning/approval, exact pushed `adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied `009`-`015`, hotfix `016`, `017`-`025`; WP-6.5/WP-6.6/WP-7/WP-7.5 evidence SHA-256 `4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245`, `e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251`, `5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195`, and `0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240`; canonical/final disabled-baseline readback passed. At this checkpoint fresh scored Cards A-G remained pending; the later P-42 recovery run is recorded separately. Production touched: No. |
| P-42 final-review snapshot binding and incident correction | Owner + Codex | Exact source/docs checkpoint pushed; interrupted scored Card A remains invalid, while recovery is recorded separately | 2026-07-19 | Exact prepared source `d00c941` issued Local `2568.5.0` through a current-lock request, then terminal review displayed false draft-only stale-base wording. No DB lock bypass or Production action. Exact pushed correction `b2500b5e6859a915bfa3f70d558934f252943f82` binds review URLs to `reviewLock`, hard-stops mismatch without publish controls, and makes terminal review read-only. Focused 3 files/26 tests, full 35 files/225 tests, TypeScript, lint 0 errors/10 existing warnings, authority/input/build/diff/browser checks passed. See Note #38. |
| P-42 recovery and Cards A-G functional run | Owner + Codex | Recovery, functional cards, and cleanup passed; strict independent score and P-37 remain HOLD | 2026-07-20 | Exact pushed `f8c6709`; session `session-p42-scored-20260719-f8c6709.json`; D001/D002 abandoned against target `2568.1.0`; Card C phases each under 1 second; Card E about 1 second; Card F exactly one same-request effect; final pointer `2568.0.0`/710, zero drafts, flags false, BOQ/Factor F unchanged. Findings B01, C01/C02, D01/D02, E01, and F02 were recorded and are corrected by the following checkpoint. Production touched: No. |
| P-42 bounded finding correction | Owner + Codex | Source/procedure correction passed; four correction spot-checks and P-37 remained HOLD at this checkpoint | 2026-07-20 | Exact evidence `1c901855a32b100013fb5c9472c2e909e3dd1c59`; exact bounded source `bdc104f77f18ea8fc776950259bc25e68c2fd42a`; focused 3 files/31 tests, full 36 files/229 tests, TypeScript, lint 0 errors/10 existing warnings, authority/input checks, network-enabled build, and clean read-only Local status passed. Completed Card B-E evidence was retained. No migration, reset, or Production action. |
| P-42 final exact-source spot-check and cleanup | Owner + Codex | Execution passed; this was the pre-decision checkpoint and the Owner later accepted P-37 on 2026-07-25 | 2026-07-23 | Exact D005 session/source and one-effect request are recorded above; `b639c03` preserves recovered success. Exact D007 on `8fb9839...` closed the stale-choice banner check and cleanup passed without reset. No Production, migration, publication, P-19, Factor F, or hotfix action. |
| P-11 exact artifact acceptance | Owner | Accepted exact TH Sarabun New 16 pt replacement PDF/Excel pair; WP-6 complete | 2026-07-11 22:20 +07 | Owner confirmed `รูปแบบ pdf excel ok เลยครับ` for the `777df75` pair after semantic and visual file QA; Production filing and P-12-P-15 remain separate |
| P-20 identity/hash portability | Owner | Approved deterministic baseline identity from immutable Production-derived `price_list.id`; retain `identity_id` in lineage hash | 2026-07-11 12:11 +07 | WP-6.5C and final G1R/G2 comparison passed; P-36 repeated the same 710-row dataset/mapping after integrated `021`. Final P-15 acceptance remains separate. |
| WP-6.5 Local-only start | Owner | Authorized | 2026-07-11 12:11 +07 | No unannounced Local reset, Production access/write, Factor F workflow change, hotfix scope expansion, placement UI, deploy, enablement, or publication |
| WP-6.5 destructive Local rebuilds | Owner | Two separate clean Local resets authorized | 2026-07-11 | Both approved rebuilds completed on exact commit `1ad01b9`; evidence provenance and hashes are recorded in Section 6.4 and the Tracker; Production touched: No |
| P-11 clean Local artifact rebuild | Owner | One additional clean Local reset authorized and completed | 2026-07-11 | Reset at `edf3570a` restored a no-audit canonical baseline before exact artifact generation; no WP-6.5 harness rerun and no Production access/write |
| Code dictionary | Owner | Approved as candidate dictionary/governance framework; P-02 through P-07 row/code decisions now recorded separately | 2026-07-04 | Owner chat approval; publication gates separate |
| Row reconciliation | Owner | Approved as draft evidence/framework; P-02 through P-07 row-level outcomes now recorded separately | 2026-07-04 | Owner chat approval; raw CSV is evidence, not import authority |
| Legacy `2568.0.0` publication metadata | Owner/records custodian | Approved via P-08 for baseline metadata backfill | 2026-07-04 | Effective `2026-01-01`; approval ref `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; approval doc date `2025-11-27`; publisher `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)` |
| NT CI runtime asset scope | Owner/brand custodian | Approved via P-10 for limited runtime derivatives | 2026-07-04 | Use [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); owner confirms NT CI asset rights for business use; `/CI/` source remains local-only; exact P-11 pair accepted 2026-07-11 |
| Production migration | Owner | Not requested; request after WP-8 evidence review |  | P-12 requires green evidence, fresh baseline/drift check, backup/restore, reviewed fingerprints, and owner go/no-go |
| Application deployment | Owner | Not requested; request after migration verification and post-migration backup/manifest |  | P-13 requires the post-migration application-only backup/manifest, CI/deployment fingerprint, disabled feature flag, smoke checks, and owner go/no-go |
| Feature enablement | Owner | Not requested; request after deploy/admin-only smoke verification |  | P-14 requires authorization checks, non-admin denial tests, and owner go/no-go |
| Publish named version |  | Not requested |  |  |

### 3.1 WP-7.5 exact P-32 evidence

The replacement run used a fresh canonical Local reset through `020`, then
applied amended `021` separately. Migration `021` SHA-256 is
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`.
The tracked harness passed on source checkpoint `80b2574bbaccc5bb14093aa204a46fcc50ba1d5c`.
Retained JSON:
`tmp/master-catalog/wp75-evidence/20260715-clean-chain-80b2574.json`; file
SHA-256:
`875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`.

The harness proved role/direct-write denial, request replay/mismatch, stale
lock, invalid anchor/order/base-reorder rejection, injected rollback, and a
two-session placement race with one deterministic winner and no partial state.
Candidate `d887b28e-0486-408f-955b-9c5206dd4166` (`2568.1.0`) contained 713
rows and produced canonical hash
`sha256:c6baec46d90642dd27f2968328d9a3aacd9d70830f109ad2f80c6d935df552a6`.
The selected-version database export, five-sheet Excel, 19-page PDF, and
tracked verifier agreed on count/order/hash. Artifact proof source was
`7d60ab60e5c7a9f80f4bb40faa665eee88423923`; rendered cover, first price page,
and final page had no clipping, overlap, missing border, or sequence gap.

The real Local admin flow passed on UI checkpoint
`99fa56c3d3c68e1886fbd308d8536e598eaee02f`: create one draft,
add two rows, place both against one inherited anchor, change sibling order,
confirm the complete batch, inspect an accepted state without a redundant
confirm action, and review 700 affected rows (2 new and 698 inherited shifts)
with field expansion/filtering. Desktop and 390x844 mobile layouts had no
page-level horizontal overflow. The proof draft was audited-abandoned. Final
readback restored pointer `2568.0.0`/710, zero working drafts, all catalog flags
`false`, BOQ 198/1,547, and Factor F `2569.0.0`/36. Production touched: No.

Standard DB lint retains one known static-analysis finding against the
transaction-local temporary table used by the function. A transaction-scoped,
temp-aware `plpgsql_check` run returned zero findings; this limitation is
documented rather than suppressed. P-33 technical acceptance passed. Adding
`021` to bootstrap, WP-8, P-19, feature enablement, publication, and Production
are not inferred.

#### 3.1.1 P-34 WP-8 placement UX source/static evidence

Exact application checkpoint:
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a`.

Implemented and source-verified:

- accepted placement plus any local category, anchor, relation, or sibling-order
  change immediately becomes **ยังไม่ยืนยัน**, including a relation change that
  happens to produce the same final draft order;
- the former server-only accepted banner no longer contradicts the live
  workspace state;
- schema-versioned session recovery is bound to exact version/lock/placement
  revision; supported same-origin navigation is guarded and reload/close uses
  the native warning without claiming a database save;
- suggested/accepted, admin-modified, incomplete, invalid, and combined
  attention states are counted and directly filterable;
- before/after uses native keyboard radio behavior with visible focus; the
  non-drag up/down path remains authoritative;
- confirmation includes new rows, shifted inherited rows, all affected
  categories, incomplete/invalid counts, and every new row's final immediate
  neighbors;
- query projection is deferred, reusable maps/groups are memoized, and visible
  rows remain bounded to 50 per page.

Verification: focused 2 files/20 tests and full 33 files/183 tests passed;
TypeScript passed; focused and full lint exited 0 with 10 existing unrelated
warnings; `git diff --check` passed; network-enabled Next.js production build
passed. In-app Local login showed the expected disabled baseline and one known
`/nt_logo.svg` LCP warning. No flag, migration, Local DB state, Production,
Factor F, or hotfix state changed. This is source/static evidence only; live
integrated scale/accessibility/recovery evidence and independent intended-admin
UAT remain unexecuted.

### 3.1.2 P-36 integrated Local technical rehearsal

After the owner was explicitly warned that bootstrap resets all Local Supabase,
P-36 ran on exact pushed checkout
`910cc3cc74660beecf18655d39cd0b0c085d1fc6`. The canonical bootstrap applied
`009`-`015`, production hotfix `016`, and Phase 4 `017`-`021`. Production was
not accessed or written.

Retained untracked harness evidence:

| Harness | File SHA-256 | Result |
|---|---|---|
| `tmp/master-catalog/wp66-evidence/20260715-p36-910cc3c.json` | `cfe8e86107e032111eccdbf0dfad981a3a6e830d9ed83670caf2971b42f276e4` | Passed WP-6.6 authority/workflow contracts |
| `tmp/master-catalog/wp65-evidence/20260715-p36-910cc3c.json` | `65ca478b90dc4c0c598698c46bad93bb513ab0c503c058f58c540ce5b56ba0d8` | Passed WP-6.5/P-20 reliability and portability contracts |
| `tmp/master-catalog/wp7-evidence/20260715-p36-910cc3c.json` | `2a521c1025ce9cb9e044ec1b6aa507d5424d7f7a5fc42ce5065a93724fcd9a37` | Passed permanent BOQ suffix/hotfix/Factor F regressions |
| `tmp/master-catalog/wp75-evidence/20260715-p36-910cc3c.json` | `eb8e4266929f6e09d736a9246035b82bc5f775923f4fd5cfe0eb0c381e514f45` | Passed placement role/rollback/replay/stale/race/order/hash contracts |

All inputs reproduced baseline dataset hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`
and identity mapping SHA-256
`5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`.
The active `2568.0.0` export manifest at
`output/master-catalog/review-artifacts/20260715T143822711Z-910cc3cc/artifact-manifest.json`
has file SHA-256
`10f3f103780cab2c76672d80d260039f186047a0aa00a9cfb95707798be530e5`.
Its five-sheet Excel and 19-page PDF passed the tracked independent verifier;
this rerun verifies the current path and does not replace the P-11 accepted
binaries. Explicit draft export failed closed as required.

The realistic-scale Local fixture used 710 inherited rows plus 18 new rows.
Accepted placement contained 728 total rows, 18 new rows, 698 shifted inherited
rows, and 716 affected rows. Measured route render/navigation ranged from
607 ms to 1,136 ms across desktop `1440x1000` and mobile `390x844`, including
deep order page 7 at 100 rows/page. No page-level horizontal overflow, console
error, error overlay, duplicate ID, or unlabeled visible input was observed.
The external screenshot manifest has SHA-256
`e6c1a00c51f14791de9dc37e4a5bffc8b953a37b90ec7011320b38eda9a5a944`.

The in-app Browser runtime did not dispatch state-changing events into this
React/Radix client. Accepted placement was therefore created through the same
public Local admin RPC and inspected on real routes, but filter/paging/relation/
dialog interaction, keyboard traversal, leave/reload recovery, stale-error
comprehension, and independent intended-admin completion were not accepted by
that P-36 evidence. Later P-37 evidence below closes its named interaction and
recovery gates independently; it does not rewrite the historical P-36 result.

The 2026-07-18 P-37 continuation repeated the safety-critical boundary on the
corrected no-reset fixture: stale expected lock `1` was rejected after a
controlled update moved the draft to lock `2`; current placement accepted 18
rows/716 affected rows at lock/revision `3/2`; exact replay returned
`duplicateRequest = true` without changing either version counter or audit IDs;
and the route displayed the accepted state before audited abandon restored
pointer `2568.0.0`/710, zero drafts, all flags `false`, BOQ 198/1,547, and
Factor F `2569.0.0`/36. This closes the technical stale/confirmation/replay/
cleanup bullets only, not the operator keyboard/leave-reload bullets.

The later no-reset P-37 sessions passed leave/return/reload recovery and the
complete owner keyboard-only flow without a placement submission. The owner
used visible `Tab`/`Shift+Tab`, native-button `Enter`/`Space`, same-gap moves,
and verified editor/final-review focus return. Final checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` also separates authority-owned item
names from DB-preview-derived final positions. This closes the named keyboard,
focus, and presentation checks, but not the plan's final owner UI submission,
broader independent core-admin UAT, three safe-error recoveries, or remaining
named interaction baselines. Add/Supplement stays hidden; see
[Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md).

Security advisor returned zero issues. Performance advisor reproduced the
triaged baseline of 19 auth RLS init-plan, 5 multiple-permissive-policy, and 7
unindexed-FK information findings; both `020` authority FKs remain indexed.
DB lint also reports one low-risk unused assignment, `v_row_count`, in
`private.catalog_placement_state`. Preserve accepted migration `021`; the
recommended disposition is to retain this as managed code-quality debt and
remove it only with the next substantive reviewed function replacement. If the
Owner rejects that residual, P-12 remains HOLD and a separate forward migration
with repeated fingerprints/harnesses is required.

Final cleanup restored pointer `2568.0.0`/710, zero working drafts, all three
catalog flags `false`, 198 BOQs/1,547 items with zero unversioned BOQs, Factor F
`2569.0.0`/36 rows, and zero temporary P-36 failure triggers. The repeat
canonical hash matched. Production touched: No. Detailed owner disposition is
in [P-36 Owner Review Note](./32-phase4-wp8-p36-owner-review-note.md).

### 3.2 G1R/G2 exact evidence

The separately owner-approved G1R and independent G2 runs used the same exact
clean execution checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd`. Each canonical bootstrap applied
`009`-`015`, hotfix `016`, and `017`-`019`; candidate `020` was applied
separately and remained outside bootstrap. Its final SHA-256 is
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.

Retained untracked evidence:

| Gate | Evidence | SHA-256 | Result |
|---|---|---|---|
| G1R | `tmp/master-catalog/wp66-evidence/20260713-g1r-p24-721c2c2.json` | `98eca768bfc8334bcf6fe4ee423468bae74f69a1d5bc39ae7bdcb6d100c2e7a8` | Passed exact schema/RLS/grant/authority/allocation/import/readiness/publish/restore/abandon/BOQ/Factor F checks |
| G1R | `tmp/master-catalog/wp65-evidence/20260713-g1r-p24-721c2c2.json` | `aa6791ff6b06359cb857ae3e8e2aea1504f93ee2fe34fa5da2bd7d6666053280` | Passed lifecycle/race/one-draft/P-20 input and invariant checks |
| G2 | `tmp/master-catalog/wp66-evidence/20260713-g2-p24-721c2c2.json` | `d5da2ceeb5871160ac8cdf8dfe34ffdee220e20c8880e001e42c0bbaaea13f43` | Independently repeated the final WP-6.6 DB/RLS/concurrency/invariant suite |
| G2 | `tmp/master-catalog/wp65-evidence/20260713-g2-p24-721c2c2.json` | `98b9f5fb9e0135ea35a716c87e1f4916e7aa1d186ce68ed067ea02d81b0bce42` | Independently repeated lifecycle/race/one-draft/P-20 input and invariant checks |

Diagnostic attempts on `7150764`, `f9f0bd7`, `bfccbb3`, `be157d4`, and
`2b1ccec` were not relabeled as passes. They exposed stale harness allocation,
one-draft precedence, invalid-transition ordering, annual void-number recovery,
and missing FK-index coverage. Fixes landed at `f9f0bd7`, `bfccbb3`,
`be157d4`, `2b1ccec`, and final `721c2c2`.

Both final P-20 inputs reproduced baseline `2568.0.0`/710 rows, dataset hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
identity mapping SHA-256
`5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`,
and frozen authority 710 mappings/65 groups/17 exclusions with SHA-256
`28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`.
The tracked comparator confirmed the same reviewed commit, dataset, mapping,
and no failures.

Local DB lint returned no schema error. The current Local Studio advisor rule
set reported eight security `WARN` findings for authenticated-callable
`SECURITY DEFINER` functions: seven are pre-existing baseline application RPCs,
and one is the Phase 4 readiness facade
`get_catalog_publish_readiness`. Anonymous execution is denied for all eight;
the readiness facade additionally requires the enabled feature flag and active
admin context. These warnings are triaged as nonblocking for G2, but WP-8 must
record the final least-privilege/minimization disposition, with explicit review
of baseline `get_user_role` and `is_admin`. Performance review retained 24
pre-existing baseline policy warnings: 19 auth RLS init-plan and five
multiple-permissive-policy findings. Seven unindexed-FK information findings
are also pre-existing baseline relations; neither new frozen-authority FK is in
that list because both covering indexes are valid. No new untriaged G2 blocker
remained.

Repository gates passed on the exact executable candidate: 30 test files/161
tests, TypeScript, lint with 0 errors/10 existing warnings, authority check,
both smoke-script checks, `audit:prod` with 0 vulnerabilities, production
build, and `git diff --check`.

Bounded G1R browser QA used the signed-in Local admin and covered explicit
revision planning to system-reserved `2568.7.0`, the complete 710-row workspace,
first/middle/last search, exact `ITEM-0355` edit, complete draft-versus-base
review, exact-draft import, audited abandon/read-only retention, and
current-to-target restore confirmation. Restore was cancelled and no publish
was submitted. Desktop passed visual review. At bounded mobile width,
`scrollWidth = clientWidth` and the wide comparison table stayed inside its
intended horizontal scroll container. Focus-visible on the labelled search was
verified, but full keyboard traversal and independent UAT are not claimed. The
only console warning was the existing `/nt_logo.svg` LCP warning. G2 was the
independent DB/reproducibility gate and did not repeat browser acceptance.

Final G2 Local readback: pointer `2568.0.0`, 710 current rows, zero working
drafts, all three catalog flags false, 198 BOQs, 1,547 BOQ items, Factor F
`2569.0.0`/36 current rows, and two authority FK indexes. Production touched:
No.

### 3.2 G3 real-route technical evidence

The owner authorized a bounded Local-only G3 run without resetting Local
Supabase. The run used source HEAD
`6599c306207c2d1e15342c398888b56513f9bb0a`, intended admin
`local.admin@ntplc.co.th`, the real Next.js admin routes, and Local API
`http://127.0.0.1:55321`. The selected in-app Browser rejected `localhost`
under its URL policy; the previously owner-approved Playwright fallback drove
the real application route rather than the standalone P-25 component harness.

| Check | Result |
|---|---|
| Baseline | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36 |
| Capability boundary | Temporarily enabled only `catalog_admin_enabled`; new identity and retirement remained false |
| Reviewed state | Created correction draft `2568.0.2`; `ITEM-0001` first edit advanced lock 0 to 1; final review bound exact lock 1 |
| Stale trigger | Second audited edit advanced lock 1 to 2 while the lock-1 review stayed open |
| Guard result | Stale publish returned the expected Thai `DRAFT_LOCK_CONFLICT` recovery message; all publication fields remained; no publish change set; pointer unchanged |
| Recovery | Reloaded final review at lock 2 with the latest value |
| Cleanup | UI abandon advanced lock 2 to 3; version retained 710 read-only rows; change sets `clone=1`, `manual=2`, `abandon=1`, `publish=0` |
| Final invariants | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36; five required constraints; valid one-draft index; two authority FK indexes; zero nullable required columns |

Closing repository verification passed the focused authority-consistency
contract (1 file/6 tests), the full suite (30 files/162 tests), TypeScript,
lint with 0 errors/10 existing warnings, frozen authority 710/65/17, the
network-enabled production build, evidence-manifest checksum verification, and
`git diff --check`.

The report and screenshots remain untracked at
`output/master-catalog/g3-owner-review/20260714-6599c30-stale-after-review/`
under repository policy. Technical result: **Passed**. Owner accept/hold:
**Pending at this technical checkpoint; subsequently accepted via P-27 on
exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`**. No reset, migration
change, bootstrap change, WP-7/WP-8 action, or Production access/write
occurred.

### 3.3 P-26 high-impact human-intent evidence

The owner authorized a bounded no-reset Local proof against a working-tree
candidate based on `2fd438dd3417850faca572b9e5e5561e944df345`. The real admin
routes were used; no publish command was submitted.

| Check | Result |
|---|---|
| Recode | Dialog showed exact `ITEM-0001`, selected target group, reason, and BOQ/audit effect; cancelled with no recode change set |
| Retire | Retirement flag was enabled only for the bounded check; dialog showed exact item, result, reason, and BOQ/audit effect; cancelled; flag restored false |
| Publish mismatch | Typed `2568.0.2` against DB-owned target `2568.0.3`; input marked invalid and final button disabled |
| Publish exact | Typed exact `2568.0.3`; final button enabled; chose **กลับไปตรวจ**, so no publish request/effect occurred |
| Responsive | Desktop passed; at 390x844 the initial title was too close to the close control, title clearance was added, and the repeated screenshot passed without overlap |
| Cleanup | Proof draft `2568.0.3` audited-abandoned at lock 2 with 710 retained rows and `clone=1`, `manual=1`, `abandon=1`, `publish=0` |
| Final invariants | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36; Production touched: No |

Screenshots, SHA-256 values, and `qa-report.json` remain untracked at
`output/master-catalog/g3-owner-review/20260714-p26-human-intent/` under
repository policy. Migration `020` was neither changed nor applied and the
Local stack was not reset. Technical result: **Passed**. Owner G3 accept/hold:
**Accepted via P-27 at 2026-07-14 23:50 +07 on exact
`78e96ab3ed9993707014c4aba1d285b7592b17a1`**.

### 3.4 P-37 first intended-admin UAT and bounded correction

The first no-reset intended-admin session on 2026-07-17 opened the real Local
710+18 placement route and failed the comprehension gate before confirmation.
The direct `รายการอ้างอิง` plus before/after controls exposed the persistence
model, and the local-change label could be mistaken for a saved state. No final
reason was entered, no placement RPC was called, and Production was untouched.

The bounded corrected source preserves the P-18 category,
same-category inherited anchor, relation, batch-order, RPC, readiness, audit,
and concurrency contracts. It presents actual previous/new/next neighbors,
uses one insertion-gap editor mapped back to the accepted payload, labels local
changes as not saved, and keeps final confirmation as one batch. Real-route
pointer interaction and desktop/mobile containment passed on the retained
fixture. The later Local continuation passed technical stale rejection,
accepted-state, exact replay, cleanup, and post-evidence repository checks.
Corrected source checkpoint `e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512`
is pushed. Later no-reset evidence passed leave/return/reload recovery and the
complete owner keyboard/focus/presentation UAT at pushed checkpoint
`f36d896d672609653de6634e307dcc44bce6d519`. At that checkpoint P-37 remained
**HOLD** for explicit Owner accept/hold or one requested narrow no-reset
stale-choice-banner replay. D007 and the 2026-07-25 Owner decision supersede
that open status.
Full evidence and screenshot paths are in
[Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md).

## 4. Known preparation baseline

Read-only Supabase MCP evidence on 2026-06-22:

| Check | Preparation baseline |
|---|---:|
| Price rows / distinct item codes | 710 / 710 |
| Missing code / name-unit / costs | 0 / 0 / 0 |
| Unit-cost mismatch | 0 |
| Version rows / active versions / pointers | 1 / 1 / 1 |
| Current version | `2568.0.0` active/default |
| BOQs / BOQ items / routes | 198 / 1,547 / 217 |

This is not a substitute for live preflight.

Post-Factor-F rollout closeout evidence on 2026-06-29 from
`docs/plans/factor-f/10-production-rollout-closeout.md`:

| Check | Observed result |
|---|---:|
| Latest migration ledger | `20260628190757_factor_f_repair_legacy_snapshot_metadata` |
| Price rows / default version | 710 / `2568.0.0` |
| Factor F default version | `2569.0.0` |
| Factor F active versions | `2566.0.0`, `2569.0.0` |
| BOQs / BOQs with price version gap | 206 / 0 at closeout only |
| Legacy BOQs bound to Factor F version by migration | 0 at closeout only |
| Legacy usable Factor F snapshots | 127 at closeout only |
| Legacy BOQs missing Factor F snapshot | 79 at closeout only |

These are point-in-time observations. Use them to understand the mixed BOQ
population, not as fixed rollout expectations. Users may create BOQs after
closeout, so every Phase 4 Production gate must use the live preflight table
below as the source of truth for total BOQs, bound Factor F BOQs, and legacy
snapshot states.

Production hotfix `016_hotfix_preserve_boq_item_suffix.sql` was applied and
merged into the Phase 4 branch on 2026-07-06 after PR #6 merged to `main`.
Post-hotfix Phase 4 evidence must prove the clean Local path applies
`009`-`015`, then hotfix `016`, then Phase 4 `017+`; pre-hotfix Local evidence
is not sufficient for WP-7/WP-8 readiness.

## 5. Fresh Production preflight

| Check | Expected | Actual | Timestamp/source | Result |
|---|---|---|---|---|
| Price rows | Approved live baseline |  |  | Pending |
| Distinct item codes | Equals price rows |  |  | Pending |
| Missing required values | 0 |  |  | Pending |
| Unit-cost mismatch | 0 |  |  | Pending |
| Duplicate item codes | 0 |  |  | Pending |
| Current active/default version | One expected version |  |  | Pending |
| Default pointer rows | 1 |  |  | Pending |
| BOQ version gaps/cross-version items | 0 |  |  | Pending |
| Factor F default version | Active expected default |  |  | Pending |
| Factor F version row counts/hashes | Match published metadata |  |  | Pending |
| BOQ Factor F binding split | Recorded live; no unexplained mutation |  |  | Pending |
| Legacy Factor F snapshot states | Recorded live; no partial repair regression |  |  | Pending |
| Factor F pointer mutation plan | No Phase 4 step may change it |  |  | Pending |
| Supabase advisor baseline | No new or untriaged Phase 4 security/performance finding |  |  | Pending |
| Unexpected active admin activity | 0 |  |  | Pending |
| Migration ledger drift | Latest includes Factor F `015` and hotfix `016`; no unexpected newer migration |  |  | Pending |

## 6. Backup and restore

| Check | Evidence | Result |
|---|---|---|
| Pre-migration encrypted logical backup |  | Pending |
| Application backup scope | Exact schemas `public, private`; retain the `public.price_list_audit_logs` definition but exclude its table data | Pending |
| Auth/Storage exclusion | Exclude all Auth and Storage data; any isolated-restore Auth dependency uses UUID-only ephemeral stubs with no email, password, or metadata payload | Pending |
| Isolated restore target | Ephemeral network-isolated non-Production PostgreSQL 17; never Local Supabase | Pending |
| Restored counts/checksums match |  | Pending |
| Rollback/fix-forward plan documented |  | Pending |
| Post-migration application-only backup/manifest | After `017`, `017a`, and `018`-`026` immediate verification and before requesting P-13, while all Phase 4 flags remain disabled | Pending |
| Post-publication backup/external copy | After separately approved P-15 verification; checksum and record independent Owner-controlled custody | Pending |

## 6.4 WP-6.5 implementation and live Local checkpoint

The initial 2026-07-11 14:09 +07 implementation checkpoint changed Local draft
migrations and code only; no Local reset or Production access occurred at that
point. After two explicit owner approvals, two separate clean Local rebuilds ran
on exact commit `1ad01b9268cec64c621266c3eb33b16a4325e627`. Each applied
`009`-`015`, hotfix `016`, and Phase 4 `017`-`019` in authority order. Production
was not accessed or written.

The first attempted bootstrap stopped fail-closed in `018` before `019` because
Postgres parsed an unparenthesized `IS DISTINCT FROM CASE ... END THEN`
condition ambiguously. Commit `f00cc20` parenthesized the expression. Harness
diagnostics were then hardened in `d95b04b`, `784700a`, and `1ad01b9`; those
diagnostic attempts are not retained evidence. Both named clean runs below
completed only after the fixes.

| Slice | Implemented evidence | Executed result | Remaining live/owner gate |
|---|---|---|---|
| A Idempotency | Stable client operation IDs; fingerprints/locks; same-ID mismatch; definitive/uncertain tests; tracked loopback-only response-loss proxy outside app/RPC paths | Live replay/mismatch/races and transport/browser recovery passed; P-36 repeated the integrated DB contract. | Passed technically; independent recovery comprehension remains in UAT |
| B Guards/readiness | Shared private readiness helper/public admin RPC; P-18 new-identity guard; structured guard activates only after canonical rollout starts; inactive-row P-19 filing warning; import/publish Thai warnings | Live unchanged legacy-only clone passed; P-18 add and structured-recode drafts were blocked; rejected publication left status/metadata/pointer unchanged; passed twice | Rerun on the final structured candidate; intended-admin UAT remains WP-8 |
| C P-20 | `017` maps baseline identity to `price_list.id`, fails on mismatch/collision/coverage defects, retains lineage hash; tracked two-run comparator | Independent G1R/G2 and P-36 integrated `021` run reproduced base `2568.0.0`, 710 rows, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` | Final P-15 acceptance only, unless migration input changes |
| D ADR-003 lifecycle | Generic version fields and reusable DB transition helper; annual/revision/patch, duplicate/backward/mixed tests | Live positive/negative paths passed previously; P-36 repeated integrated version planning/lifecycle contracts | Technical rerun passed; P-14 operator acceptance separate |
| E Export evidence | Tracked clean-tree atomic generator and semantic verifier | Owner-accepted `777df75` pair remains preserved; P-36 active-baseline five-sheet Excel/19-page PDF verifier rerun passed without replacing it | Passed P-36 technical rerun; P-15 filing separate |
| F DB/concurrency | Tracked Local-only harness covers P-20 mapping, role denial, fingerprints, partial-write counts, readiness, races, timeouts, pointer/BOQ/Factor F invariants | Independent rebuilds and P-36 integrated `021` run passed; final pointer, 198 BOQs/1,547 items, and Factor F `2569.0.0`/36 remained exact | Passed P-36 technical rerun |
| G UX/observability | Route loading/error/not-found; safe Thai recovery; bounded logs/correlation; current-base selection; warnings | Unit/type/build passed. In-app browser recovery on `9becdf6` used uniquely labelled controls, preserved the attempted values through the red uncertain state, retried without refilling, showed one success/change set at lock 4, and produced no browser warning/error. | Passed WP-6.5G technical gate; independent intended-admin UAT and accessibility/recovery rerun remain WP-8 |
| H Documentation | Decision/architecture/DB/export/runbook/tracker/report alignment plus tracked consistency test | P-36 closeout records exact execution/evidence boundaries and P-37 HOLD recommendation | Final closeout repository consistency rerun |
| Cross-cutting atomicity | Complete payload preflight, duplicate desired code rejection, per-code lock, mutation write subtransaction and structured abort | Passed previously and repeated by P-36 WP-6.5/WP-7/WP-7.5 rollback/atomic-negative harnesses | Passed P-36 technical rerun |

WP-6.5 evidence remains valid for the rows above. It does not prove the complete
operator capability matrix added after owner review; in particular, the former
WP-6.5G browser evidence proves uncertain-response recovery for one form, not
full 710-row browse/history, one-working-draft lifecycle, import completion, or
publication provenance.

### 6.4.1 WP-6.6 capability completeness checkpoint

| Audit finding | Required evidence | Result |
|---|---|---|
| C-01 full browse/item history | First/middle/last-row search, filters, exact item route, stable-identity field diff, and >1,000-row paged-read fixture proving no API-cap truncation | Passed: deterministic 1,201-row `500/500/201` fixture plus Local browser first/middle/last search, exact item route, and identity/code history |
| C-02 exact draft/stale state | One mutable draft globally; a stale draft permits inspection and audited abandon only; abandoned history is immutable | Final G1R/G2 on `721c2c2` and G3 proved the historical per-base P-22 contract. Corrected P39R-S, incremental P39R-L, clean-chain P39R-C, and owner P39R-U passed the amended global live contract; broader scored WP-8 UAT remains separate. |
| C-03/C-04 dictionary and allocator | P-06 seed/freeze, unknown-entry denial, next-never-issued concurrency/gap/900 fixtures | Passed Local DB: 710 mappings/65 groups/17 exclusions, role/unknown/caller-code denial, two unique concurrent allocations, never-reuse, and capacity boundary |
| C-05 import diff/evidence | Complete server add/update/recode/retire/unchanged diff, exact omissions, approved/missing price evidence | Passed Local DB: complete 710-row first rollout, 709 changed/structured rows plus approved `ITEM-0139` legacy row, stable validation replay; browser required explicit draft selection. Full intended-admin import UAT remains WP-8. |
| C-06/C-07 publication provenance | Authenticated actor snapshot and required version archive reference including manual-only publication | Passed Local DB/browser: authenticated publisher snapshot, physical archive reference, invalid-date and missing-archive denials, and rendered provenance/readiness state |
| C-08 readiness parity | Same stale-base/full-quality/P-18/structured result in readiness and publish | Passed Local DB: one full 710-row canonical-quality result fed readiness/publication; pointer restored after physical-archive publish proof |
| C-09/C-10 correction/editor | Prefilled exact item; field-aware authority; reactivate/base-absent withdraw with preserved identity/code/audit | Passed Local DB/browser: retire/reactivate, inherited-withdraw denial, exact inactive item/action, and preserved identity/code/history |
| C-11/C-12 UX/schema | Thai-first/no synthetic defaults/support details plus zero-null/order constraint compatibility | Passed technical gate: `020` constraints/RLS/grants/role denial, Thai desktop/mobile render with no page overflow, and no app console error. Formal accessibility/intended-admin UAT remains WP-8. |
| C-13 final snapshot review | Item-first full workspace; complete identity-based draft/base diff; compound/reverted/incomplete-read fixtures; exact reviewed-lock publish and stale-review recovery | G1R/G2 passed the DB contract, P-25 passed compound/high-volume presentation, and G3 independently rejected a stale lock-1 publish after lock advanced to 2, retained fields, created no publish effect, and reloaded the latest review. Accepted for WP-6.6; broader UAT stays WP-8. |
| C-14 version intent/draft identity/release number | Explicit annual/revision/patch intent; owner year; immutable draft reference; complete issued/currently-claimed registry; claim/issue/release lifecycle; next-sequence DB guard | Historical G1R/G2/P39-S evidence remains valid only for its old contract. P39R-S, incremental P39R-L, clean-chain P39R-C, and owner P39R-U passed retained abandoned audit, target reuse, global draft scope, and restore-effect contracts. |
| C-15 create/item/restore flow | Exact post-create navigation; compact actions/counts then item workspace; document metadata after items; current-to-target restore confirmation with BOQ effect | G1R passed the full bounded route and G3 independently exercised real create/workspace/item/review/abandon routes. Accepted for WP-6.6; broader responsive UAT stays WP-8. |
| C-16 pre-G1R business/UX guard | Annual base +1 through +10 at UI/server/DB; safe stale/range mapping; durable focused Thai error; collapsed support IDs; no internal workflow labels; contextual authority; accessible icon pagination; secondary Factor F context | G1R/G2/P-25 passed contracts and presentation; G3 independently observed the durable Thai stale error, retained inputs, Local/account context, and disabled-gate cleanup. Accepted for WP-6.6; formal accessibility stays WP-8. |
| C-17 high-impact human-intent guard | Exact Recode/Retire summary and explicit confirm; Publish current/target/lock/count/BOQ summary; exact typed DB-read target enforced before RPC; cancel/no-write and responsive behavior | P-26 code/tests and no-reset Local proof passed. Mismatch `2568.0.2` stayed disabled, exact `2568.0.3` enabled, no Publish/Recode/Retire command was confirmed, mobile title overlap was corrected, proof draft was audited-abandoned, and Local returned to zero drafts/all flags false. Accepted for WP-6.6; rerun supported workflow at WP-8. |

Historical rows retain useful point-in-time evidence. The final DB-dependent
results were rerun under G1R/G2 on exact candidate `721c2c2`; the later P-25,
G3, and P-26 application/browser results close their bounded presentation,
recovery, and human-intent contracts without changing migration `020`.

Current P-22 G1 evidence (untracked under `tmp/` by repository policy):

- WP-6.6 DB/concurrency run:
  `tmp/master-catalog/wp66-evidence/20260712-g1-p22-e463270.json`, generated
  `2026-07-12T15:17:18.267Z`, exact commit
  `e463270dfb9f23332559f31591cf338b8eeada3c`, file SHA-256
  `9ccfe240772cb75b4103534d44c12d39600e2ead0ff699020ac5b6751056392d`;
- WP-6.5/P-20 G1 input:
  `tmp/master-catalog/wp65-evidence/20260712-g1-p22-e463270.json`, generated
  `2026-07-12T15:17:32.371Z`, file SHA-256
  `d4750d495adf660c3938062dd0e2e1922d350f72fb7fcb8503afb895f211ec5a`;
- the input reproduced base `2568.0.0`, 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- DB lint and security advisors returned no findings. Performance advisors
  returned 24 pre-existing policy warnings on baseline tables only (19 auth
  init-plan and 5 multiple-permissive-policy); no `020` authority table was
  listed;
- final readback restored pointer `2568.0.0`/710 rows, zero working drafts,
  all three catalog flags `false`, 198 BOQs/1,547 items, and Factor F
  `2569.0.0`/36 rows. Production touched: No.

The initial G1 reset preceded two bounded source fixes found during the run:
WP-6.5 fixture cleanup at `17ec6cc` and truthful date-parser volatility at
`e463270`. Final G1 harnesses and repository checks remain attached to
`e463270`. The later UI/source checkpoint `c8f6dca` did not change migration
`020`; P-23.1/P-24 later superseded that prospective target. Final G1R/G2
instead clean-rebuilt exact executable candidate `721c2c2` and the independent
P-20 comparison passed. Those technical gates do not infer G3 owner acceptance;
the later P-27 decision records that acceptance on exact `78e96ab`.

The following is historical pre-P-22 evidence. After separate owner
authorization, the canonical bootstrap through `019` was
run on two independent clean Local rebuilds at exact commit
`3bfc74ea00843033ad3cfd2afac43820b18c0124`; `020` was then applied separately
for evidence. P-22 now amends candidate `020`, so these results are superseded
for revised closeout. At that historical checkpoint migration `020` remained
outside bootstrap. P-28 later integrated the final unchanged accepted file into
bootstrap source. P-29/G4E later passed the integrated chain through `020`, and
P-36 later passed the integrated chain through `021`; neither migration has
been applied to Production.

Retained Local evidence outputs (untracked by policy):

- WP-6.6 DB run:
  `tmp/master-catalog/wp66-evidence/20260712-clean-a-3bfc74e.json`, generated
  `2026-07-12T03:21:47.395Z`, exact commit
  `3bfc74ea00843033ad3cfd2afac43820b18c0124`, file SHA-256
  `be9ffe9b0f9dc597e6152ec6151388df1b761598b2bb5a0f1b96f334ebcc2552`,
  status `passed`, environment `local`, and `productionTouched=false`;
- post-`020` P-20 input A:
  `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-a-3bfc74e.json`, file
  SHA-256
  `e3919de8dbb313d85a24025c7388d0c3a6a91d353cad90c0c75eb9c73a57587e`;
- post-`020` P-20 input B:
  `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-b-3bfc74e.json`, file
  SHA-256
  `4d3158cfa254f47527ccaa347a8ec4738c11c70bac83b68382f6b9242e2738da`;
- the post-`020` comparator passed at `2026-07-12T03:23:09.116Z` with the same
  reviewed commit, no failures, base `2568.0.0`, 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- Local browser technical QA on the same implementation covered five version
  rows, exact `2568.103.0` draft with 710 selected rows, first/middle/last item
  search, exact inactive item/history/reactivate path, explicit import draft
  selection, history register, 1440x900 desktop and 390x844 mobile without
  page overflow, and no app console error. The existing Next image LCP warning
  for `/nt_logo.svg` remained non-blocking;
- Local login follow-up commit
  `59b17d3c3e7ed6180445ac5dc5e0b75db9fe9452` rejects ambiguous unquoted `#`
  in guarded Local secrets. Focused tests and `npm run db:local:smoke-auth`
  passed, and normal password login worked without Magic Link. The ignored
  `supabase/.env.local` was not staged.

- run 1: `tmp/master-catalog/wp65-evidence/rebuild-1.json`, generated
  `2026-07-11T11:55:57.332Z`, file SHA-256
  `0662ff7a106e6fd9874ee4c722326cd23bdccb6643a280474e3e3abe0be47506`;
- run 2: `tmp/master-catalog/wp65-evidence/rebuild-2.json`, generated
  `2026-07-11T12:33:25.580Z`, file SHA-256
  `d7f1bedd73dbb8a771d0881370ff3936f31a6be5a9adbc5241d430ca521ca4fe`;
- comparator: passed at `2026-07-11T12:33:31.404Z`, same reviewed commit,
  no comparison failures; the separate owner approvals and rebuild provenance
  are recorded in the Tracker.
- lifecycle/DB run: `tmp/master-catalog/wp65-evidence/20260711T232920-5423373.json`,
  generated `2026-07-11T16:29:49.671Z`, file SHA-256
  `8c687f63e11cc07ea4a56fe9e961b76e439c1c3b1ac0e68b7ce8a88d9c96752f`;
  all prior harness checks and four lifecycle negatives passed;
- response-loss transport run:
  `tmp/master-catalog/wp65-evidence/20260711T234500-transport-response-loss-e782459.json`,
  first commit/retry at `2026-07-11T16:47:37Z`, file SHA-256
  `41f75d046c6deafe3d2526294e712a6415e5ed6bde1149c4d91732109e10a2cf`;
  matching request/response IDs, upstream HTTP 200, same version, and
  `duplicateRequest=true` passed. Earlier proxy starts that never reached a
  committed target response are diagnostics, not retained evidence.
- browser same-ID/input-preservation run:
  `tmp/master-catalog/wp65-evidence/20260712T001809-browser-input-preserve-9becdf6.json`,
  commit `9becdf675386b03a3aeff717cebccd6e88f8b664`, first commit/retry at
  `2026-07-12 00:20`/`00:21 +07`, file SHA-256
  `1d10690f6d487d1188a221e5d484fb30db278da1236fce05cb00302aadf5b029`;
  matching request/response ID `18c669c5-a60f-498a-9f68-986fa346b0cb`, upstream
  HTTP 200, same version, and `duplicateRequest=true` passed. The uncertain-state
  screenshot retained Reason and `ITEM-0004` without refilling, SHA-256
  `9422237bea8c65c69bf49f2cba8f995e5b75fd726cd5e4e8399458359c2aed29`;
  the reset-after-success screenshot SHA-256 is
  `d4764d9d4137d0c95dfa1442118bbf1285ed88f4efecb8c0441ce929dfbea515`.
  The earlier `8558652` browser diagnostic proved same-ID recovery only after
  manual field reconstruction; it exposed the reset defect and is superseded
  as UI acceptance evidence.

P-11 replacement and superseded Local artifact evidence (untracked by policy):

- a first post-harness pair under `20260711T125426128Z-edf3570a/` correctly
  showed two WP-6.5 restore audit rows and was rejected/superseded as
  owner-acceptance evidence;
- after a separate explicit owner approval, a clean bootstrap at
  `edf3570a86300036cc4c16c82f5459282cde4cab` applied `009`-`015`, hotfix
  `016`, then `017`-`019`, passed bootstrap smoke, and restored zero change
  sets/items/imports before generation;
- the pair under
  `output/master-catalog/review-artifacts/20260711T141050812Z-edf3570a/`
  passed embedded and independent semantic verification with no failures, but
  was superseded before owner acceptance by the Excel TH Sarabun New 16 pt
  refinement;
- the exact replacement pair under
  `output/master-catalog/review-artifacts/20260711T145832108Z-777df759/`
  came from commit `777df7598c8aa96a17f3665db5131e5fb5397b96` without
  another DB reset or harness run and passed embedded/independent semantic,
  five-sheet workbook, typography, and 19-page PDF QA;
- post-export Local readback remained zero change sets/items/imports with
  pointer `2568.0.0`, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  feature flag disabled, 198 BOQs/1,547 BOQ items, and Factor F default
  `2569.0.0`; Production was not accessed or written.

## 6.5 Production readiness review

Use this section after WP-8 and before requesting P-12. Any missing, stale,
failed, ambiguous, or mismatched row blocks the Production request until it is
fixed and reviewed.

| Check | Expected | Evidence | Result |
|---|---|---|---|
| WP-8 clean Local rehearsal | Passed with no unresolved execution blocker | P-36 technical rehearsal, retained functional Card B-E evidence, proportional Spots 1-3, same-request Spot 4, final D005 cleanup, exact D007 stale-choice-banner replay, and D009 Full-import correction passed. Local is pointer `2568.0.0`/710, zero drafts, and flags false. | P-37 Owner-accepted 2026-07-25 under the guided-UAT variance; P-12 remains a separate request |
| WP-6.6 capability matrix | Audit #29 C-01 through C-17 implemented/evidenced, or unsupported controls removed from release visibility | Final G1R/G2/P-25/G3/P-26 path was owner-accepted at `78e96ab`; P-36 integrated rerun passed. The later Owner decision accepts WP-8 under the explicitly labelled guided-UAT variance rather than relabelling it independent. | Accepted/Complete for WP-6.6 and WP-8/P-37 under the recorded variance |
| Reviewed migration fingerprint | Every filename and SHA-256 matches the accepted manifest | Package #39 records exact hashes for the eleven-file candidate `017`, `017a`, `018`-`025`, and append-only `026`; all earlier reviewed hashes remain unchanged and `026` is fixed at `472fa04b...`. P-47 repository/static review passed; P-48 authorizes its exact Git publication, while the resulting replacement source/tooling HEAD remains unrecorded. | Repository/static Ready — P-48 publication result and fresh Local gates HOLD |
| Migration execution freeze | Exact tool versions, per-file transaction/timeouts, identity/owner continuity, stop behavior, and rollback are recorded before naming the window | Package #39 section 4.1 freezes Supabase CLI `2.107.0`, PostgreSQL major 17, eleven candidate hashes, one transaction/file, 10s migration lock timeout, 60s statement timeout except `020` at 90s, no concurrent operation, one ledger row/file, the same `current_user`/object-owner for `017`, `017a`, and `018`-`026`, stage-aware default/routine ACL verification, per-file ownership/ACL deltas, final owner/ACL/RLS inventory, stop-after-current-file rollback, and forward-fix-only post-commit recovery. | Paper/static Ready; exact-path acceptance awaits replacement Git/Remote, corrected Local integration, pass 1, authenticated schema-contract review, and pass 2 |
| Disposable PostgreSQL 17 CLI rehearsal | Complete approved migration sequence passes all mandatory per-file postflights on fresh disposable targets | Historical rehearsal applied `017` and correctly stopped before `018` on Finding #43. P-46 later completed the canonical Local chain through `025` and failed closed on helper callability; its evidence is preserved. Append-only `026` has not been applied to Local, disposable, or Production. See [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md) and [Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md). | HOLD — replacement source freeze, fresh authorized Local proof, pass 1, independent schema-contract freeze, and pass 2 remain |
| Repository/deployment fingerprint | Exact branch/commit and deployable build pass before P-12; actual deployed artifact is recorded at P-13 | Exact baseline `6827ebc1a729b7675fe91db58e129c9381b33ddb` and bounded application candidate `5068f944af2aa3fe8446c77c8ae8d48673cb260b` passed their recorded gates. Historical readiness/P-44 records remain valid. P-45 completed at pushed/upstream-equal `d92d8ce`, but P-46 exposed the new helper-callability defect. P-48 authorizes the exact replacement publication; its source/tooling HEAD and truthful Remote CI/status remain unrecorded. | Historical application/readiness evidence Ready; P-48 publication authorized, replacement Git/Remote result HOLD. Deployed artifact remains P-13 |
| Fresh Production preflight | Live counts, pointer, Factor F, BOQ split, drift, and the pre-`017` flag stage recorded | Owner-authorized read-only evidence at 2026-07-26 09:53 +07 found PostgreSQL 17.6, pointer/default `2568.0.0`, 710 complete distinct authority rows, and value hash `sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`, exactly matching Local. Production has 232 BOQs/2,183 items with zero missing or cross-version catalog links. Factor F remains `2569.0.0`/36 with no partial snapshot. Phase 4 objects/settings, including all three Phase 4 flag rows, are absent as expected before `017`. | Ready for database scope; no Production write occurred |
| Production Data API schemas | Platform configuration proves `private` is not exposed | Owner-authorized Management API `GET` at 2026-07-26 19:29 +07 returned exposed schemas `public, graphql_public`, extra search path `public, extensions`, and `private_exposed=false`. No token or `jwt_secret` was emitted or persisted; no setting changed. | Ready |
| Operational catalog-authority fingerprint | Bind the runner's new `catalogAuthorityFingerprintSha256`; historical `ecd457...` is not reusable because its canonical SQL was not committed | Derive only through a separately authorized read-only query from the encrypted readiness snapshot's isolated restore or fresh in-window Production/restore evidence. Record the exact value/source in #39/#40 and bind the same value in external Production approval. | HOLD — UNCOMPUTED; a mechanically `productionEligible=true` kit is not authorized for Production and P-12 request remains prohibited |
| Backup/restore gate | Fresh encrypted backup manifest and isolated PostgreSQL 17 restore test pass | After two rejected candidates were deleted, a third secure Owner-entered credential passed the bounded read-only identity query. At 22:48 +07 the encrypted Production application-only dump captured 234 BOQs/2,270 items and 710 catalog rows with identical source-before/after metrics. Custom dump SHA-256 is `9d306a478b8ada65d0a32ab31bca19587c55efa3ae979ae4dd8ad5871d575932`. Exact image `public.ecr.aws/supabase/postgres:17.6.1.063` restored it in a network-isolated ephemeral container using 20 UUID-only Auth dependency stubs with zero sensitive payload. Comparable counts/hashes matched; constraints, triggers, version links, Factor F snapshots, and pointers passed; container removed. On 2026-07-27 the Owner-authorized non-force detach/read-only reopen passed all eight `SHA256SUMS` entries; the bundle was detached again, Docker/Local returned healthy, and Local invariants remained exact without reset. This readiness rehearsal is not the final rollback source. Same-device acceptance expires at the earlier of the start of the post-publication checkpoint after separately approved P-15 verification or seven days (168 hours) after the recorded P-12 start. If a planned pause will exceed 24 consecutive hours, create and checksum-verify an independent encrypted copy before the pause. If an unplanned pause reaches 24 hours, stop before any further gate and complete that copy before resuming. Production writes 0. | Passed readiness rehearsal, post-write custody check, and PRE-P-12 custody decision content. Fresh in-window rollback backup/restore/sign-off, a named-human executor and distinct named-human independent verifier, the post-migration application-only backup/manifest before P-13, and final external-copy closeout remain required |
| Hotfix `016` / migration order | Remote ledger includes `016`; a corrected clean bootstrap must apply `009`-`015`, hotfix `016`, then exact `017`, `017a`, `018`-`025`, and `026` before P-12 evidence is accepted | Production ledger contains exact `20260706090832 hotfix_preserve_boq_item_suffix` within the expected `009`-`016` set and no unexpected later row. The deployed hotfix body remains exact and must not be rerun. P-46 consumed one Local reset, reached `025`, and failed closed; no cleanup/retry is authorized. P-47 preserves every reviewed prior migration and appends only `026`; its repository/static review passed. A replacement clean pushed source/tooling HEAD plus fresh explicit reset approval is required before one new canonical Local run through `026`; failure/drift stops without retry, patch, or cleanup. | HOLD for replacement Git/Remote, fresh Local evidence, kit, and pass-1/contract/pass-2 evidence |
| End-to-end request idempotency | UI/action/DB reuse one operation ID after timeout; changed payload with same ID rejects | Prior DB/transport/browser recovery passed; P-36 repeated replay/mismatch/race contracts; D005 recovered request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with one effect and no duplicate | Passed Local technical and intended-admin recovery scope |
| Live DB integration/concurrency | Migrations, RPC/RLS/roles, rollback, two-session races, and lock timeouts pass | P-36 integrated through `021` and passed WP-6.6/WP-6.5/WP-7.5 role/rollback/race/timeout/final-cleanup evidence | Passed P-36 technical gate |
| P-20 hash portability | Approved clean-reset/cross-environment identity/hash model passes | Final G1R/G2 comparison and P-36 integrated run reproduced 710 rows, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` | Passed WP-8 technical rerun; P-15 acceptance pending |
| ADR-003 reusable version lifecycle | Another valid annual/revision/patch version passes; no reusable hardcoding to `2568.1.0` | Generic positive/negative fixtures passed and P-36 repeated integrated version-planning/lifecycle contracts | Passed technical rerun; P-14 operator acceptance separate |
| Tracked export verifier | Clean-checkout semantic Excel/PDF verification passes | Exact `777df75` replacement pair remains owner-accepted; P-36 generated a separate active-baseline pair on `910cc3c` and its embedded/independent verifier passed with 710 rows and the same P-20 hash | Passed/accepted P-11 and passed P-36 rerun |
| Admin UAT and recovery | Default rule: intended admin completes core workflow and representative failures without developer/SQL assistance; an Owner variance must be explicit and preserve the truthful evidence label | Placement overview/gap/sibling/leave-reload/keyboard/focus/presentation checks passed across bounded sessions. Functional Cards B-E, Spots 1-3, same-request Spot 4, final D005 cleanup, exact D007 stale-choice-banner replay, and D009 Full-import correction passed. The Owner requested live guidance and accepted the combined evidence without relabelling it independent. | Passed under the 2026-07-25 guided-UAT Owner variance; Closure Matrix #34 C-08/C-09 passed |
| 710-row performance baseline | Import preview, readiness, export, and admin interactions meet reviewed budget | P-36 recorded 710+18 route render/deep paging/export measurements; P-42 recorded Card C phases under 1 second, Card E about 1 second, and retained export behavior. No scale measurement rerun remains. | Passed: Closure Matrix #34 C-11 |
| Authority/document consistency | Migration/WP order, decision IDs, authority links, current status, and Markdown table shapes agree | P-37 closure remains accepted. Decision Register #19, Tracker #25, this report, Package #39, Checklist #40, CLI Runbook #41, Findings #43/#44, and architecture/security amendments record the same immutable `017a` bridge, P-46 fail-closed result, append-only `026` contract, P-47 static closure, and exact P-48 Git-only authority. Kit/pass 1/authenticated review/pass 2 and all later gates remain separate. | P-47 repository/static Ready; P-48 Git-only publication authorized; P-12 remains HOLD and unrequested |
| General-user catalog-version visibility | Current/default pages show pointer-derived year/version; a new BOQ discloses and rechecks its pending binding; existing BOQ edit/print/Excel show the immutable bound version rather than the later current pointer | Local staff desktop/mobile Browser smoke showed current `2568.0.0` on dashboard, price list, and create; an existing BOQ edit/read-only page showed bound `2568.0.0`. Printed pages preserve the official `บัญชีราคา` heading and carry a small bottom-right bound-version stamp. No horizontal overflow or console error was observed. Binary Excel verification checks route and summary labels. Invalid/unpublished bindings fail closed. | Candidate passed; no data mutation, migration, reset, Production access, Factor F, or hotfix change |
| BOQ regression | Current BOQ flows and historical version links unchanged | P-29/G4E permanent suffix/save/print/export and binding-copy harness passed; P-36 repeated it after integrated `021`; final baseline remains 198 BOQs/1,547 items with zero unversioned BOQs | Passed WP-7 and P-36 Local rerun |
| Factor F before/after assertion | Pointer, rows, hashes, grants, RLS, and BOQ bindings unchanged | P-29/G4E structural/regression harness passed; P-36 and final P-37 cleanup retained default `2569.0.0` with 36 rows and unchanged BOQ bindings | Passed WP-7 and later Local reruns; no new Factor F scope |
| Advisors | No unresolved Phase 4 blocker | Fresh Production security output has seven authenticated-callable baseline definers plus disabled leaked-password protection. All seven deny `anon`; mutating facades retain internal authorization, while `get_user_role(uuid)`/`is_admin(uuid)` remain post-Phase-4 minimization candidates. Performance output has 19 init-plan, 5 multiple-permissive-policy, 8 unindexed-FK, and 16 unused-index baseline findings. The Owner accepted the guarded-definer and `v_row_count` dispositions and accepts leaked-password protection disabled for P-12/P-13 only. | Ready for PRE-P-12 content; fresh post-migration diff mandatory and P-14 Auth decision remains HOLD |
| Feature-flag lifecycle | Before `017`: all three rows absent. After `017`, `017a`, `018`, and `019`: only `catalog_admin_enabled` exists and is boolean `false`. After `020`-`026`: all three rows exist and are boolean `false`. No stage permits boolean `true`. | Fresh Production preflight is at the expected pre-`017` absent state; P-46's post-`025` Local state retained all three false. A fresh authorized corrected-chain run must prove the same state after `026`. | Stage contract Ready; corrected-chain live after-file verification remains mandatory and deploy/enablement remain P-13/P-14 |
| P-12 readiness package | Evidence reviewed before Production migration request | [Package #39](./39-phase4-p12-production-readiness-package.md) contains exact source/build, eleven-file candidate manifest, historical and P-46 Local evidence, security/debt disposition, `017a` and `026` contracts, remaining evidence, and stop conditions | HOLD; replacement Git/Remote, fresh Local, and two-pass rehearsal remain; P-12 not requested |
| P-13 readiness package | Evidence reviewed after migration verification and the post-migration application-only backup/manifest, before deploy request |  | Pending |
| P-14 readiness package | Evidence reviewed after deploy/admin smoke and before enablement request |  | Pending |
| P-15 separation | Publication not implied; final metadata/diff/count/hash/export approval still separate |  | Pending |

## 7. Reconciliation and code governance

| Check | Expected | Actual | Result |
|---|---:|---:|---|
| Production UUID coverage | 710 |  | Pending |
| Workbook rows with outcome | 708 |  | Pending |
| Exact price matches reproduced | 648 |  | Pending |
| Price-difference matches reproduced | 42 |  | Pending |
| Production-only decisions | 20 | P-04 owner decision: retain all 20 Production-only rows; assign 19 canonical codes and keep `ITEM-0139` as temporary legacy code under P-02 controls | Approved |
| Workbook-only deferred/approved decisions | 18 raw / 17 unresolved | P-05/P-07 owner decisions: raw workbook evidence has 18 workbook-only rows; workbook `FTW-CON-002` is a typo shadow of Production `ITEM-0491`, so only 17 unresolved supplement candidates remain deferred with item authority, price authority, corrected taxonomy/code, approval, import preview/reconciliation, and hash/publish verification gates | Approved |
| HDPE Crossing blockers unresolved | 0 | P-03 owner decision: reject GIP classification; split HDPE Crossing to `CRS-H06`/`CRS-H08`; defer workbook-only `CRS-GIP-025`; `ITEM-0139` handled under P-04 | Approved |
| Duplicate identity decision unresolved | 0 | P-02 owner decision: retain both `ITEM-0131` and `ITEM-0139`; `ITEM-0139` future retirement requires live BOQ refs = 0 plus owner/data-custodian confirmation; no UUID/history merge | Approved |
| AAA/TTT group meanings approved | 22 `AAA` / 65 `AAA-TTT` | P-06 owner decision: approve group meanings for dictionary/backfill; not import, row-count, workbook-only, K-mapping, or P-07 wording approval | Approved |
| Temporary legacy-code null group exceptions | 1 | P-06 owner decision: only `ITEM-0139` in `2568.1.0` may have `code_group_id is null`; assert no other active structured-version row has a null group | Approved |
| `FTW-CON-002` wording disposition | 1 | P-07 owner decision: use Production `ITEM-0491` wording for canonical `FTW-CON-002`; reject workbook repeated-phrase row as typo shadow; do not import workbook wording, create a duplicate item, change identity/history, or clean Production whitespace without a separate wording correction | Approved |
| Canonical code reused across identity | 0 |  | Pending |
| Missing reviewer/date on exceptions | 0 |  | Pending |

Approved reconciliation fingerprint: `____________________________`

Approved dictionary fingerprint: `_______________________________`

## 8. Local schema verification

| Check | Expected | Actual/evidence | Result |
|---|---|---|---|
| Clean reset + migrations | Success, including `009`-`015`, hotfix `016`, and Phase 4 `017+` in order | G1R/G2 separate-apply evidence passed on `721c2c2`; migration SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`. P-29/G4E then passed the combined `009`-`020` bootstrap on exact `15b707d`. | Passed combined G4E Local execution |
| 710 identities/legacy code registrations | Exact | Both retained runs read 710 baseline rows and proved every baseline `identity_id` equals its immutable Production-derived `price_list.id`; mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` | Passed P-20 identity scope |
| Published baseline identity merges | 0 | Deterministic one-row-to-one-identity mapping covered all 710 baseline rows in both clean rebuilds; no identity merge step exists in the P-20 mapping | Passed WP-6.5 |
| Category backfill | Approved count |  | Pending |
| P-06 code-group dictionary | Exact approved 22/65 meanings frozen; ordinary mutation cannot create unknown entries | Frozen authority readback passed 710 mappings/65 groups/17 exclusions; unknown category/group and caller-selected code were denied | Passed Local DB |
| Display-order backfill | Unique `ITEM-####` numeric suffix; 710 covered | Full 710-row readiness readback had `missingDisplayOrder=0`; migration `020` required-order constraint passed | Passed Local DB |
| New-item display order | Mechanical maximum + 1 remains draft allocation only; publish requires a current accepted WP-7.5 placement review for every identity absent from the base | Amended `021`, P-32/P-33 technical evidence, and P-36 integrated role/race/order/hash/export plus 710+18 route rendering passed. Later owner keyboard/focus/presentation checks passed, but the owner did not submit the final UI batch. | Integrated technical gate passed; final independent UI submission remains P-37/P-14 |
| Import parser profile ID/version stored | Exact |  | Pending |
| Code allocation at sequence 900 | Blocking capacity-review error | Local WP-6.6 capacity-boundary fixture passed | Passed Local DB |
| Next-code allocator | Group-locked next never-issued sequence; retired gaps not reused; concurrent callers deterministic | Two concurrent calls allocated distinct `CIC-GIP-007`/`008`; withdrawal followed by allocation produced `009`, proving no reuse | Passed Local DB |
| New structured version rows | 710 before approved add/retire | Full rollout contained 710 rows: 709 canonical structured rows plus approved temporary legacy `ITEM-0139`; readiness found no unapproved legacy active rows | Passed Local DB |
| New foreign keys indexed | All |  | Pending |
| Unique version/code and version/identity | Enforced |  | Pending |
| Unit-cost check validated | Enforced |  | Pending |
| Required nullability/order constraints | Zero-null compatibility proof then enforced by fix-forward migration `020` | `required_constraints=3`, `nullable_required_columns=0`, and 710-row readiness had no missing required text/category/identity/order | Passed Local DB |
| Published row/metadata immutability | Enforced |  | Pending |
| Pointer/legacy `is_default` consistency | Exact | Concurrent publish/restore and cleanup restored one pointer/default to `2568.0.0` in both retained runs | Passed WP-6.5 |
| New catalog capability values/defaults | JSON boolean / `false` for admin, new identity, and retirement | Post-`020` schema evidence counted all three disabled; final cleanup readback returned all three `false` | Passed WP-6.6 |
| Private mutation functions unexposed | Confirmed | Authenticated role could not execute the private allocator; anonymous could not execute version registers; role-denial fixtures passed | Passed Local DB |
| Data API grants explicit | Confirmed | All three frozen authority tables had RLS and exact policies; authenticated register execution was present while anonymous execution was absent | Passed Local DB |
| Publish/restore advisory lock behavior | Serialized; no competing pointer mutation | Two-client publish and restore races each produced one winner and one stable rejection/lock outcome; exact duplicate winner request returned the prior result; pointer remained singular and was restored | Passed WP-6.5 |
| `boq.factor_reference_version_id` FK/index/immutability trigger | Preserved | G4E WP-7 verified current binding, selected-Factor-F copy behavior, immutability trigger, and unchanged historical bindings; final default remained `2569.0.0` | Passed WP-7 technical gate |
| Factor F version tables/pointer/RLS/grants | Unchanged by Phase 4 migration | P-36 integrated before/after evidence preserved default `2569.0.0` with 36 current rows, RLS/grants, anon denial, and binding/immutability triggers; no Factor F workflow was added or changed | Passed integrated P-36 technical gate |
| `save_boq_with_routes` replacement, if any | Preserves price version, Factor F version, and hotfix `016` BOQ item suffix contracts | G4E WP-7 passed all four approved suffixes plus unsuffixed names, catalog-authoritative unit/cost/category fields, invalid-suffix atomic rejection, cross-version rejection, and role denial; BOQ count/items returned to 198/1,547 | Passed WP-7 technical gate |

## 9. RLS and authorization matrix

| Actor | Read published catalog | Read admin audit | Mutate draft | Publish/restore | Result |
|---|---|---|---|---|---|
| Anonymous | No | No | No | No | Live draft-create and exact-register execution denials passed; full release matrix reruns at WP-8 |
| Authenticated non-admin | Approved published read only | No | No | No | Staff mutation/readiness denials and WP-6.6 authority/register role boundaries passed; full release matrix reruns at WP-8 |
| Pending/inactive admin profile | No admin access | No | No | No | Pending |
| Active admin | Yes | Yes | Yes | Yes | Two active-admin sessions exercised allocation, import, correction, publication/readiness/registers, and pointer restore live; broader independent core-admin/read-audit UAT remains WP-8 under Closure Matrix #34 |
| Direct REST/private function bypass | N/A | N/A | Rejected | Rejected | Frozen authority RLS/policies and private allocator execution denial passed; complete direct-write matrix reruns at WP-8 |

Also verify:

- update policies have required select visibility;
- policy columns/functions use appropriate indexes and `(select auth.uid())`
  pattern where applicable;
- no `user_metadata` controls authorization;
- no secret/service-role key in client bundle;
- public wrappers revoke `PUBLIC` and `anon` execution;
- definer functions have empty `search_path`, fully qualified objects, approved
  owner, and unexposed private schema;
- direct authenticated table writes fail even for active admin;
- feature flag never substitutes for role/status authorization.

## 10. Parser and import verification

| Test | Expected | Result/evidence |
|---|---|---|
| Exact workbook/profile | Detected | Pending |
| Wrong sheet/header/profile | Clear rejection | Pending |
| Formula/error/nonnumeric required cell | Rejected | Pending |
| Macro/external link/embedded object | Never executed or persisted | Pending |
| File >20 MB | Client rejection | Pending |
| Rows >1,500 | Rejected | Pending |
| Normalized body >750 KB | Client and server rejection | Pending |
| K fields | Excluded/rejected | Pending |
| Full omission | Retires only after warning/approval | Pending |
| Full retirement below threshold | Warning + exact diff; no bulk approval required | Pending |
| Full retirement at `max(10, ceil(2%))` | Apply blocked without typed count and owner reference | Pending |
| Supplement omission | Leaves unchanged | Pending |
| Complete server diff | Add/update/recode/retire/unchanged rows and totals displayed from authoritative validation | Passed technical WP-6.6 gate: full Local rollout returned complete authoritative results for 710 rows, including 709 changed/structured rows and the approved legacy exception; browser import required explicit exact-draft selection. Full intended-admin import UAT remains WP-8. |
| Exact Full omissions | Every omitted identity and count displayed before Apply | Passed reviewed rollout case: full 710-row first-rollout input had zero silent omissions; exact omission/diff contracts passed static tests. Representative operator omission UAT remains WP-8. |
| Approved new-row price authority | Batch default/per-row override resolves and persists; missing/mismatched evidence rejects | Correct fail-closed state: price-authority contracts passed and amended WP-7.5 placement evidence passed P-32/P-33. New-identity execution remains capability-denied and hidden pending WP-8/P-14 release acceptance. |
| Reconciliation authority | Runtime does not treat `docs/*draft.csv` as mutable business authority; first rollout is frozen/reviewed and later imports use exact draft/dictionaries | Passed: generated authority check and Local DB readback returned 710 mappings/65 groups/17 exclusions with SHA-256 `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`. |
| Unauthorized price delta | Rejected | Pending |
| Client-tampered payload | Server rejection | Pending |
| Duplicate request ID | One effect/consistent result | Local WP-4 import duplicate evidence passed; WP-6.5 create/manual apply/publish/restore exact replay also passed twice |
| Timeout after import apply commit | Retry reuses same client-owned apply ID and returns prior result | The shared `apply_catalog_changes` transport and stable-operation form path passed timeout-after-commit through manual apply; import exact replay/mismatch passed live. Retest the import-status-specific UI path during WP-8 full workflow. |
| Import status lifecycle | UI-only preview; `validated/rejected`; one transition to `applied` | Passed technical gate: full rollout validation/apply completed once and validation replay returned the prior result; browser Apply stayed disabled until a draft was selected. Intended-admin UAT remains WP-8. |
| Import invalid status transition | Rejected without partial apply | Pending |
| Validation/apply request IDs | Separate and idempotent | Passed Local DB: WP-6.6 validation replay was stable with normalized payload hash `0a912360d4c9c64502081eb6f81b6519c50d9bb25fbbadf458e73c1066534416`; shared apply idempotency remained green. |
| Import full old/new snapshots | Complete | Pending |
| Filed source independently rehashed | Matches recorded client fingerprint | Pending |

## 11. Manual change and history

| Test | Expected | Result/evidence |
|---|---|---|
| Manual add/edit/retire/recode/reactivate/eligible withdraw on exact draft | Success with reason and complete audit | Passed supported WP-6.6 actions: retire/reactivate and eligible base-absent withdraw behavior passed Local DB; inherited withdraw was denied; browser exact inactive-item/reactivate/history path passed. Add remains hidden/DB-denied pending P-18. |
| Same actions on published version | Rejected | Pending |
| Blank reason | Rejected | Pending |
| Stale lock version | `DRAFT_LOCK_CONFLICT`; UI-bound old review cannot publish | DB/G3 technical rejection passed. P-42 binding/source tests pass; fresh Owner Card A must reload the old `reviewLock` URL, observe hidden publication controls, and recover to latest after clean Local preparation. |
| Stale base version | Old draft inspect/audited-abandon only; then recreate from Current and reapply | Pending |
| History through recode | Same identity timeline | Passed technical gate: exact registers and browser item detail preserved stable identity/code history across the rollout/correction evidence. |
| Full browse/item detail | All selected-version rows searchable/filterable; exact identity route shows field-level old/new history | Passed technical gate: source 1,201-row fixture plus browser 710-row first/middle/last search and exact inactive-item route/history. Operator UAT remains WP-8. |
| Multiple/stale drafts | Explicit selection; stale draft controls disabled/read-only before submit | Passed technical gate: multiple exact draft rows and explicit selection passed browser QA; stale fail-closed tests passed. Stale-recovery comprehension remains WP-8. |
| Withdraw preservation | Base-absent draft row removed; identity/code reservation/prior audit retained | Passed Local DB: eligible withdraw and inherited-withdraw denial passed; allocator never reused the withdrawn code. |
| Actor/display name/timestamp/source | Complete | Passed Local DB: authenticated Local admin snapshot and exact correction/import/publication registers passed. |
| Audit update/delete | Rejected | Passed technical gate: frozen authority/audit role-denial and append-only register contracts passed. Full direct-write matrix reruns WP-8. |
| Manual/create uncertain retry | Same operation ID, payload, effect, and audit result after timeout; changed payload with same ID rejected | Database replay/mismatch, transport commit/504 recovery, and browser manual retry passed. The UI retained Reason/target, required no refilling, reused request `18c669c5...`, returned the prior result, and produced one lock `3 → 4` change set. Create uses the same tracked form-operation hook; rerun the representative recovery set at WP-8. |

## 12. Publication tests

| Test | Expected | Result/evidence |
|---|---|---|
| Missing approval evidence | Rejected | Passed in Local WP-5 smoke: `PUBLICATION_METADATA_REQUIRED`; pointer stayed on `2568.0.0` |
| Caller-authored publisher spoof | Ignored/rejected; actor/display snapshot derived from authenticated active-admin profile | Passed Local DB: publication recorded the authenticated `Local admin` display snapshot rather than caller-authored authority. |
| Impossible publication date | Stable validation rejection before DB cast/write | Passed Local DB: invalid semantic date was denied without publication. |
| Missing version archive reference | Phase 4-created manual/import publication rejected | Passed Local DB: missing archive reference was denied; accepted proof stored `local/master-catalog/wp66/rehearsal-only`. |
| Readiness/publish parity | Same stale-base and complete canonical-quality result; no false green | Passed Local DB: one complete 710-row quality/readiness result produced `canPublish=true`, then publication stored the same 710 count/hash before pointer restore. |
| Stale base pointer | `DRAFT_BASE_STALE` | Passed in Local WP-5 smoke: a transient local-only active pointer fixture moved the singleton pointer under an existing draft; publish returned `DRAFT_BASE_STALE`, did not move the fixture pointer, and cleanup restored the pointer to `2568.0.0` before the real local publish |
| Duplicate publish request ID | No duplicate effect | Passed in Local WP-5 smoke; duplicate publish returned `duplicateRequest=true` |
| UI/action publish retry after uncertain response | Same client-owned request ID reaches DB and returns the prior result | DB publish replay/mismatch passed; transport and browser lost-response proof passed on the shared operation-ID/form path using manual apply. Retest the publish-specific UI path during WP-8 full workflow. |
| Two-session publish/restore race | One deterministic outcome, one stable conflict/timeout, singleton pointer remains exact | Passed twice on independent clean Local rebuilds; one winner, one stable rejection/lock outcome, exact duplicate replay, and pointer cleanup to `2568.0.0` |
| Publish transaction | Atomic | Passed in Local WP-5 smoke and browser proof; rejected publish attempts did not move pointer, successful publish moved pointer/metadata/audit together, and the admin UI showed publish change-set evidence after submit |
| Publish invalid status transition | Rejected without pointer movement | Passed in Local WP-5 smoke: active-version republish rejected as `VERSION_NOT_PUBLISHABLE` |
| P-18 add/supplement publish guard | Draft with any `identity_id` absent from its base version rejects with `P18_PLACEMENT_REVIEW_REQUIRED`; no pointer, metadata, BOQ, or Factor F state changes | Passed twice live: one-new-identity draft had `canPublish=false`, rejected with the expected code, stayed draft with null publication metadata, and left pointer/BOQ/Factor F state unchanged |
| Structured-code legacy exception guard | Guard activates when any active canonical structured code exists, then rejects if active legacy `ITEM-####` rows exceed `ITEM-0139`; unchanged legacy-only clone remains valid | Passed twice live: unchanged legacy-only clone remained publishable; structured recode activated the guard, counted unapproved legacy rows, and publication rejected atomically. Final candidate rerun remains required. |
| Dataset count/hash from DB | Stored | Historical WP-5/browser proof used pre-P-20 clean-reset hash `sha256:4a2a5fcc75f1510c5e037426a19c3110234856485157e5de6f3bd2eee459d1e8`. The approved deterministic P-20 model reproduced `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` in both clean rebuilds, and the exact P-11 pair now uses that value. |
| ADR-003 reusable version path | Create/publish validation supports another valid annual/revision/patch fixture without reusable `2568.1.0` hardcoding | Generic/unit and live high-revision paths passed; duplicate, backward annual, mixed annual, and mixed revision/patch attempts rejected atomically. |
| Pointer and `is_default` sync | Exact | Passed in Local WP-5 smoke and browser proof: publish moved pointer/default to `2568.1.0`; restore moved both back to `2568.0.0` |
| Previous version remains readable | Yes | Passed in Local WP-5 smoke: former current `2568.0.0` remained `active` and readable |
| Former current version after publish | Still Published/Active; immutable; not automatically archived | Passed in Local WP-5 smoke: `2568.0.0` stayed `active`, non-default after publish, then restored |
| Published row mutation | Rejected | Passed in Local WP-5 smoke: service-role row update blocked by `CATALOG_PUBLISHED_ROW_IMMUTABLE` |
| Pointer restore | Audited; BOQs unchanged | Passed in Local WP-5 smoke and browser proof: restore change set inserted, pointer returned to `2568.0.0`, `2568.1.0` remained active/non-default, and BOQ count stayed `198` |
| Factor F pointer after catalog publish | Unchanged from preflight | Passed in Local WP-5 smoke and browser proof: Factor F default/version/hash/count unchanged (`2569.0.0`, 36 rows, `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`) |
| BOQ Factor F bindings after catalog publish | No mutation | Passed in Local WP-5 smoke and browser proof: BOQ count and catalog/factor binding split unchanged; final readback after browser publish/restore showed BOQ count `198` |

## 13. Canonical hash and export

| Check | Expected | Actual | Result |
|---|---|---|---|
| Golden fixture hash | `sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5` | Passed in canonical hash tests; full suite includes the golden fixture | Passed |
| P-20 identity/hash portability | Approved deterministic `price_list.id` baseline identity and lineage hash reproduce across clean approved environments | Final same-commit G1R/G2 comparison and P-36 integrated `021` execution reproduced 710 identities, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`. | Passed P-36 technical rerun; P-15 acceptance pending |
| Published item count | Approved count | Exact Local P-11 pair for selected `2568.0.0` contains 710 workbook price rows, 710 verification rows, and 710 PDF DOM rows; selected-version data loader fails closed on item-count mismatch | Passed/accepted P-11 |
| Published dataset hash | One stored value | Exact Local P-11 pair and manifest contain `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`; workbook reconstruction, PDF proof, DB readback, and tracked verifier agree. Historical pre-P-20 visual hashes are superseded for final acceptance. | Passed/accepted P-11 |
| Selected-version export paging | No silent fixed-limit truncation before count/hash verification | Export data loader now reads selected price rows, categories, code groups, change sets, imports, and change items through deterministic paged queries; `tests/master-catalog-export-data.test.ts` covers a 1,001-row selected version and verifies all rows are counted/hashed | Passed automated fixture |
| Excel visible business-row count/order | Exact match | Exact replacement workbook under `review-artifacts/20260711T145832108Z-777df759/` has 710 price data rows and 710 verification rows; all five expected sheets are visible and ordered; `priceSequenceBreakCount=0`; the clean change summary has no WP-6.5 harness audit rows | Passed/accepted P-11 |
| Excel `_canonical_row_json` reconstruction | Exact UTF-8 dataset hash | Tracked verifier reconstructs `[` + ordered `_canonical_row_json` + `]\n`; exact workbook rehash matched `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` | Passed automated fixture and exact Local artifact inspection |
| PDF server-verified printed count/hash/order | Exact match | Exact replacement PDF proof loaded Local `2568.0.0`, DOM row count 710, first/last sequence 1/710, unique sequence count 710, `sequenceBreakCount=0`, 18 price sections/19 physical pages, title/full hash/watermark present, and embedded verifier passed | Passed/accepted P-11 |
| New/supplement item placement acceptance | Owner/data-custodian approved position before publish; no official version relies only on append-at-end ordering for added/supplement rows | P-18 V1 is accepted; amended `021`, its separate P-32 Local placement evidence, and P-33 technical acceptance passed. The guard remains release-authoritative until WP-8/P-14 UX, performance, and intended-admin gates pass. | Technical Local gate accepted; release acceptance pending WP-8/P-14 |
| Inactive/retired row official PDF policy | Any version with inactive/retired rows has an approved field-facing PDF rendering/exclusion policy before final filing | P-19 recorded 2026-07-07. Current 710-row `2568.0.0` proof has no inactive rows; future retired-row versions require owner/data-custodian policy before P-15 filing | Pending P-19 when applicable |
| Structured-code completeness before candidate publication | Once a draft contains an active canonical `AAA-TTT-NNN` code, active rows have approved code groups except the recorded temporary `ITEM-0139` exception; no other active legacy `ITEM-####` row may publish | Live unchanged-clone positive control and structured-recode rejection passed twice. The approved final structured candidate must still be validated against the exact dictionary/data fingerprint before P-15. | WP-6.5 guard passed; final candidate pending |
| Older-version export | Uses selected version | `tests/master-catalog-export-data.test.ts` now covers requesting an older selected published version while the current pointer remains on another version; the loader keeps `version.id`, `versionString`, count/hash, Current Default status, and filename tied to the explicit selected version | Passed automated fixture |
| Draft export status mark | `DRAFT – ห้ามใช้อ้างอิง` | `tests/master-catalog-export-data.test.ts` covers active-admin draft export as non-official with a `DRAFT-` filename; `tests/master-catalog-export-excel.test.ts` verifies the workbook document sheet and price sheet include `DRAFT – ห้ามใช้อ้างอิง` plus non-official draft hash wording | Passed automated fixture |
| PDF price-disclaimer watermark | Matches approved three-line wording and style from `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf`: `รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง`; `แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น`; `(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)` | Exact retained PDF has no cover watermark and one three-line red overlay watermark per price page; all 19 pages were rendered, inspected, and found free of clipping/blank-page anomalies | Passed/accepted P-11 |
| Published stamp | Field-facing PDF cover shows organization, `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. It excludes Current Default, approval reference/date, approved-by/publisher, exported at/by, generated-by, and export-spec fields; a non-current published version instead shows a Thai retrospective-reference warning. | Fresh Local route/PDF proof on 2026-07-11 confirmed only retained fields appear; count/hash/order/watermark checks passed. | Passed/accepted P-11 |
| PDF cover layout refinement | Larger top-centered NT company lockup, document title, and a distinct `ประจำปี 2568` line of the same title size and weight; a separate centered upper-middle metadata table contains only `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. No duplicate company/status text appears in the header. | Exact replacement Local `2568.0.0` PDF passed route/render proof: 19 pages/18 price sections, 710 rows, sequence 1-710 without breaks, full hash, watermark, and no clipping regression. All rendered pages were byte-identical to the prior visual proof. PDF SHA-256 is `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff`. | Passed/accepted P-11 |
| Excel numeric cell types | Numeric, formatted | `tests/master-catalog-export-excel.test.ts` confirms price cost cells are numeric and formatted `#,##0.00` | Passed automated fixture |
| Excel exact 5 sheets/headers; no formulas/external links | Exact | `tests/master-catalog-export-excel.test.ts` confirms exact five sheets/order, business headers, verification headers, and no formula/hyperlink cell values | Passed automated fixture |
| Tracked semantic artifact verifier | Runs from clean checkout; finds headers by name; derives ranges; verifies schema/sheets/count/order/hash/types/visible-field consistency/formulas/links/PDF pages and binary hashes | Exact `777df75` manifest remains accepted; P-36 manifest `20260715T143822711Z-910cc3cc` also passed embedded and independent verification with empty failures | Passed/accepted P-11 and passed P-36 rerun |
| Excel document-language and typography alignment | Thai title/year hierarchy, Thai user-facing metadata labels, canonical verification identifiers unchanged, and every populated cell uses TH Sarabun New with body size at least 16 pt | Artifact-tool rendered all five sheets without formula errors or clipping. Direct binary inspection found 20,808 populated cells, all TH Sarabun New, minimum 16 pt, zero bad typography/formulas/hyperlinks, verification fixed row height 22, and actual blank structured cells remained empty. Excel SHA-256 is `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07`. | Passed/accepted P-11 |
| Formula-control text safety | Malicious strings remain inert text | `tests/master-catalog-export-excel.test.ts` covers formula-looking item text and confirms no formula/hyperlink cell values | Passed automated fixture |
| PDF Thai font/header/page/clipping | Correct | Exact PDF metadata shows A4, 19 pages, tagged, and no form/JavaScript/encryption. Resources include embedded/subset `/NTRegular`, `/NTBold`, and `/Menlo-Regular`. All 19 Poppler-rendered pages stayed inside safe bounds with no edge clipping or anomalous blank page; inspected content retains lockup, title, repeated headers, Thai footer/page numbers, row 527 on one line, and acceptable final-page whitespace. | Passed/accepted P-11 |
| Short dataset hash | Exactly `sha256:` + first 12 hex + `…`; full hash also present | Admin/export short-hash helper now preserves the `sha256:` prefix and emits only the first 12 hash hex characters plus `…` for dataset hashes, while full hashes remain on the version detail/export stamp and official Excel/PDF proof artifacts; covered by `tests/master-catalog-admin-read-model.test.ts` | Passed automated fixture |
| Catalog export dataset/hash excludes Factor F rows | Confirmed | `tests/master-catalog-export-data.test.ts` verifies the selected-version export loader calls no BOQ or Factor F tables in the normal published export path | Passed automated fixture |
| BOQ print/export regression | Catalog version and Factor F version/snapshot labels still correct | G4E WP-7 passed bound-version rows, usable legacy snapshot fallback, and fail-closed missing-legacy-snapshot data contracts. Full rendered UI/export UAT remains WP-8. | Passed WP-7 data contract; WP-8 UI rerun pending |
| BOQ item suffix preservation | Saving BOQ items preserves approved suffix labels such as `(Main Duct)` and `(Riser)` while catalog unit, price, and category remain authoritative | G4E WP-7 passed `(Main Duct)`, `(Riser)`, `(Steel Pole)`, `(Riser Service)`, and unsuffixed cases through the real Local RPC; invalid suffix and cross-version batches rejected atomically. | Passed WP-7 technical gate |

Official export file/reference and binary SHA-256 (different from dataset hash):

The following exact Local P-11 replacement pair is technically verified and
owner-accepted as WP-6 artifact evidence. Preserve these binaries and hashes
without regeneration. This is not a Production filing; filing remains a later
P-15/release gate.

- directory: `output/master-catalog/review-artifacts/20260711T145832108Z-777df759/`
- source commit: `777df7598c8aa96a17f3665db5131e5fb5397b96`
- Excel: `NT-Master-Catalog-v2568.0.0-20260101.xlsx`
- Excel binary SHA-256: `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07`
- PDF: `NT-Master-Catalog-v2568.0.0-20260101.pdf`
- PDF binary SHA-256: `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff`
- print HTML SHA-256: `58fbbff501f97d8b4c64c03b4b481098af1bc429269ad3cabc06e7e155bbeeff`
- dataset hash: `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`

The earlier post-harness pair under `20260711T125426128Z-edf3570a/` is rejected
because its workbook correctly includes two WP-6.5 restore audit rows. The
later `20260711T141050812Z-edf3570a/` pair passed technically but is superseded
by the approved Excel typography refinement. Historical hashes elsewhere in
this report remain point-in-time history and must not be substituted for the
exact replacement pair above.

## 14. Application regression and UI/UX

| Flow/check | Desktop | Mobile | Result/evidence |
|---|---|---|---|
| Dashboard |  |  | Pending |
| Price List search/count |  |  | Pending |
| BOQ list/search |  |  | Pending |
| Create BOQ |  |  | Pending |
| Edit/save BOQ |  |  | Pending |
| BOQ item suffix preservation on save | P-36 real Local RPC preserved all approved suffixes and catalog-authoritative fields | No BOQ UI source changed in this placement slice; repository tests/build passed | Passed integrated P-36 regression gate |
| Duplicate Preserve |  |  | Pending |
| Print “แบบ ปร.1” |  |  | Pending |
| Existing BOQ export |  |  | Pending |
| Existing version-bound BOQ Factor F label | P-36 data-mode contract loaded bound `2569.0.0` rows | No BOQ UI source changed in this placement slice; repository tests/build passed | Passed integrated P-36 regression gate |
| Existing legacy snapshot-only BOQ print/export | P-36 data-mode contract used the saved usable legacy snapshot without claiming current Factor F | No BOQ UI source changed in this placement slice; repository tests/build passed | Passed integrated P-36 regression gate |
| Existing legacy missing-Factor-F BOQ failure state | P-36 data-mode contract failed closed when required legacy snapshot fields were missing | No BOQ UI source changed in this placement slice; repository tests/build passed | Passed integrated P-36 regression gate |
| Catalog version list/detail | Five exact version rows, Thai statuses, current marker, selected 710-row draft, readiness, and exact item route rendered | Version/item pages at 390x844 had `scrollWidth=clientWidth=390` and no overlap | Passed WP-6.6 technical QA |
| Import/diff/manual/history | Import required explicit draft selection and stayed disabled before selection; exact item correction/history and append-only register rendered; P-40 verifies pinned source/E-01/E-02 through the actual application adapter/profile | Numeric Excel source-row/money cells normalize safely; formula/date/boolean/fraction/unsafe cells remain rejected. On 2026-07-24 D009 completed a real 710-row Full binary import: 709 recodes, one unchanged row, one apply, durable post-save redirect/notice, and audited abandonment. | Passed technical/source and Owner-operated guided functional path; C-09 accepted under the disclosed guided-UAT variance |
| Complete catalog search/filter + item history | Browser found first `ITEM-0001`, middle `ITEM-0355`, and last `ITEM-0710`; exact inactive-item route showed stable identity/code history | Exact item page remained readable without page overflow at 390x844 | Passed WP-6.6 technical QA and the Owner-approved guided C-09 evidence |
| One working draft + stale/abandoned history | One mutable draft globally; same-base/cross-base concurrent create denied; current/stale audited abandon; abandoned views immutable | Prior G1R/G2/G3 and P-36 remain historical per-base evidence. Corrected P39R-S plus P39R-L/P39R-C live evidence covers the global technical contract | Passed technically through P39R-C and accepted in the Owner-guided C-09 package |
| Final snapshot review + reviewed-lock publish | Complete cumulative draft/base diff, compound/reverted behavior, high-volume scanability, readiness/warnings, edit return path, and stale-review recovery | Prior exact-lock/stale recovery passed; P-36 rendered 716 affected rows, 50/100 paging, and deep page 7 without overflow/error. | Technical render/scale and Owner-guided final-review/readiness use passed; C-09 accepted without claiming independence |
| New-identity placement workspace | Source implements one complete pending batch, search/paging, a category plus insertion-gap UI mapped to same-category inherited anchor/relation, same-gap sibling order, final neighbors/shift count, one reasoned confirmation, and stale-state recovery | P-36 rendered the 710+18 technical fixture. After the first P-37 comprehension failure, corrected no-reset sessions passed stale/replay/accepted-state/recovery plus complete owner keyboard/focus/final-presentation UAT. Shared previous/new/next review now labels the DB-derived final position separately from the authority item name. Final D005/D007 evidence and cleanup are recorded in Closure Matrix #34. | Passed under the explicit guided-UAT Owner variance for C-07 through C-09; evidence is not relabelled independent |
| Thai-first forms/no rehearsal defaults/support details | Thai navigation/status/action/readiness/error copy rendered; Local synthetic defaults were absent from operator fields | P-40 replaces native English money-pattern failure with shared Thai whole/one/two-decimal normalization and offers base-catalog units plus an explicit custom-unit path. Developer browser QA observed existing-unit search, custom entry, `1250` normalization, and Thai rejection of `1250.001`; prior placement keyboard/focus evidence remains retained. | Passed source, developer browser QA, and the Owner-approved guided C-09 package |
| Add/retire blocker shown before apply/publish | With capability flags false, Add was absent, retirement controls were hidden/denied, and the inactive item exposed only Reactivate; readiness showed the separate P-19 warning | Exact inactive-item action remained responsive. P-18 is now decided and its `021` source keeps Add/Supplement hidden until live placement evidence passes. | Passed release-visibility gate; P-19 remains separate |
| Loading/error/not-found and retry/back paths | Route states implemented; user-opened Local tab completed response-loss recovery on `9becdf6`; exploratory P-38 exposed a successful withdrawal left on the removed item route | P-40 server-redirects successful withdrawal to the safe draft workspace and renders a durable Thai item-code notice; stale review, E-01/E-02, stale placement, and same-request recovery passed without unintended writes | Technical/source and guided safe-error recoveries passed; C-10 accepted without claiming independent/no-assistance evidence |
| Thai user message + safe code/request ID | Browser showed the red Thai uncertain message and short request ID `18c669c5`; proxy/server logs matched the full ID | Same-ID retry returned one success/change set with no duplicate effect | Passed WP-6.5 technical checkpoint; include or map this evidence explicitly before closing C-10 |
| Keyboard/focus/errors/contrast | Placement category, insertion-gap combobox, paging, sibling order, and confirmation require visible focus and complete keyboard behavior using standards-complete controls | Owner used visible `Tab`/`Shift+Tab`, native-button `Enter`/`Space`, combobox arrows/search, sibling moves, and immediate-`Enter` dialog reopen. Exact opener focus is restored for editor/final/guarded-leave dialogs. | Independent Local placement keyboard/focus path passed on `f36d896`; that evidence is retained under C-06 and does not close C-07 through C-10 |
| Font/logo/color/spacing | Local export artifact proof | PDF uses `next/font/local` NT Regular/Bold derivatives and the full NT company lockup; approved Excel exception uses TH Sarabun New with a 16 pt body baseline while preserving dataset-hash semantics | P-11 PDF/Excel visual proof accepted; app-wide/primary-logo provenance reconciliation remains under P-10 |
| Browser console/server errors | P-36 desktop/mobile realistic-scale routes had empty warning/error logs and no Next error overlay | No page-level horizontal overflow, clipped content, or material layout shift was observed across the 710+18 placement/final-review states; later owner interaction found no material stutter | Passed for exercised states; final UI submission remains C-07 |
| Intended-admin UAT without developer/SQL help | Intended admin must distinguish system-arranged, locally adjusted, incomplete/invalid, unconfirmed, and accepted states; filter when needed; explain shifted sequence numbers; recover stale placement and leave/reload state; reach final review without irreversible error | Retained functional Cards A-G, one accepted placement batch, Spots 1-3, same-request Spot 4, exact D007 stale-choice discard, and D009 Full-import post-save evidence now cover the bounded workflow. Findings were corrected as product defects rather than attributed to the operator. | Execution evidence passed; C-09 is ready only for explicit Owner accept/hold |
| 710-row interaction/import/export performance | Measure 710 inherited rows plus an agreed realistic new-item batch for render, search, insertion-gap selection, preview recalculation, paging, sibling movement, confirmation, import, and export on a named browser/device | P-36 measured server navigation/render for 710 inherited + 18 new rows at 607-1,136 ms, deep 100-row paging at 746 ms, and independently verified baseline export. Corrected P-37 sessions exercised search, preview, sibling movement, final review, recovery, and focus at the same scale. D009 server preview completed in 187 ms and apply in 275 ms; the apply POST returned `303` to the durable workspace result. | Passed C-11 for the named Local baseline; preserve measurements unless source/input/device assumptions change |

Structured log review must show operation, outcome, duration, version and
request ID for representative failure/success cases without raw workbook rows,
normalized payload, cookie/key, SQL, or approval-document content.

Dashboard personal/system labels must remain unchanged unless a separate change
request approves them.

## 15. Quality and advisor gates

| Gate | Expected | Actual | Result |
|---|---|---|---|
| `npm test` | Exit 0 | P-36 exact checkout `910cc3c`: 33 files/183 tests passed. Exact import-feedback correction `df44b827b290933463da5e14fa9125314660022a` passed 36 files/233 tests, including focused navigation/operator regressions. | Passed exact correction checkpoint |
| `npx tsc --noEmit --pretty false` | Exit 0 | P-36 exact checkout, final placement checkpoint `f36d896`, and exact import-feedback correction `df44b827b290933463da5e14fa9125314660022a` passed. | Passed exact correction checkpoint |
| `npm run lint` | Exit 0 | The 2026-07-24 import-feedback correction exited 0 with the same 10 existing application warnings outside this scope. | Passed with existing warnings |
| `npm run build` | Exit 0 | The 2026-07-24 import-feedback correction compiled, typechecked, and generated all routes with network-enabled font access; it retained only the existing middleware-to-proxy deprecation warning. | Passed current working tree with existing warning |
| `npm run catalog:authority:check` | 710 mappings / 65 groups / 17 exclusions and frozen hash agree | P-37 correction passed with SHA-256 `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`. | Passed |
| `node --check scripts/smoke-master-catalog-wp66.mjs` | Exit 0 | Harness syntax passed; live execution passed again during G4E | Passed |
| `git diff --check` | Exit 0 | Passed after the final 2026-07-24 source, test, Operating Procedure, Tracker, Verification, Review Note, Owner Script, and Closure Matrix alignment. | Passed current working tree |
| In-app browser G1R | Local/admin version planning, workspace, item edit, final review, import, abandon, restore confirmation, responsive containment, and cleanup pass | Bounded flow passed; no publish/restore pointer change; final disabled screen restored. One existing `/nt_logo.svg` LCP warning; full keyboard traversal and independent UAT not claimed. | Passed G1R / later UAT pending |
| P-25 standalone visual/interaction harness | Real final-review component at 710 total/709 affected rows; eight-field compound row; desktop 1440x1000 and mobile 390x844; no console/page error or overflow | Browser plugin runtime was unavailable with `Cannot redefine property: process`; the owner-approved Playwright fallback compiled the real component and project CSS, mocked only Next routing contexts, and passed 27/27 checks. No Local DB reset/mutation, migration, bootstrap, or Production action occurred. | Passed P-25 presentation scope; real-route stale-after-review/G3 not inferred |
| P-26 in-app browser proof | Real Recode/Retire/Publish confirmation and cancellation, mismatched/exact target typing, desktop/390x844 layout, audited cleanup, and final disabled page | Passed on real Local routes; no Recode/Retire/Publish effect, proof draft abandoned, zero drafts/all flags false, pointer/BOQ/Factor F unchanged | Passed and owner-accepted via P-27 |
| `npm run audit:prod` | No unaccepted Production vulnerability | P-36 `npm audit --omit=dev --audit-level=moderate` passed with 0 vulnerabilities | Passed |
| WP-7.5 repository/static candidate | Exact migration/RPC/readiness/publish/UI/release-gating contracts compile and preserve adjacent authority | Historical SHA-256 `78359215...` passed static checks; P-32 runtime exposed `42704`. Amended schema-qualified SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` then passed replacement clean-chain source/live gates. Migration `020` remains unchanged. | Accepted via P-33 for bounded technical scope; old static checkpoint is historical; WP-8/P-14 UX evidence remains |
| Live Local DB integration/concurrency | Migration/RPC/RLS/role/rollback/race/timeout gates pass | P-36 exact checkout `910cc3c` clean-applied through `021`; WP-6.6, WP-6.5/P-20, and WP-7.5 harnesses passed with final cleanup. | Passed integrated P-36 technical scope |
| Permanent hotfix `016`/BOQ/Factor F suite | Real RPC behavior and pre/post invariants pass | P-36 retained WP-7 JSON passed all suffix/catalog authority/atomic negative/binding/copy/print-export/publish-restore/security cases; final BOQ and Factor F invariants were restored | Passed integrated P-36 technical scope |
| WP-6.6 capability suite | Audit #29 C-01 through C-17 DB/UI/browser evidence pass | Final G1R/G2 passed on `721c2c2`; P-25 presentation and G3 real-route stale recovery/cleanup passed on `6599c30`; P-26 confirmation/cancel/cleanup proof is committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`. | Accepted/Complete via P-27 |
| Tracked export artifact verification | Semantic verifier passes from clean checkout | P-36 regenerated active `2568.0.0` proof on exact `910cc3c`; five-sheet Excel/19-page PDF/hash/order and independent verifier passed. It does not replace the exact owner-accepted P-11 pair. | Passed P-36 rerun and preserved P-11 acceptance |
| Documentation consistency | Authority links/table shapes, migration order, WP order, decisions, and execution provenance agree | Exact recovery `1c901855...`, bounded source `bdc104f...`, C03/G01 `44f54a7...`, modal correction `16e88c6...`, final execution `6fe3a6a...`, durable success `b639c03`, exact stale-choice replay `8fb9839...`, exact Full-import post-save correction `df44b827b290933463da5e14fa9125314660022a`, and the 2026-07-25 guided-UAT Owner decision are reflected across Verification, Decision Register, Tracker, Review Note, Owner Script, Closure Matrix, and Operating Procedure. | Passed; P-37 Owner-accepted and WP-8 complete |
| Historical P39-S source/static candidate | Pre-P-39R forward migration, target-scoped draft identity, release lifecycle, application/export language, read models, smoke contracts, authority documents, and repository gates agreed | Migration `022` SHA-256 `c517dc24ca16a7b32f32c5f7998668fe79135901e44e27defb43f6ec1df6de09`; 33 files/188 tests and named checks passed | Superseded before live apply; does not pass P39R-S |
| P39R-S corrected source/static candidate | Global draft scope, stale abandonment, pointer/effect audit, lifecycle/publication/RLS hardening, explicit identifiers, deployment compatibility, and repository gates agree | Migration `022` SHA-256 `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`; 33 files/189 tests; TypeScript; lint 0 errors/10 existing warnings; authority 710/65/17; Node/shell syntax; network-enabled build; diff check | Passed and pushed through `7997387`; P39R-L live discovery is tracked separately |
| P39R-L published-code RLS correction | Exact published identity/code pair, accumulated-history expectations, transient draft-only denial, and forward migration provenance agree | Corrected migration `023` SHA-256 `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88`; exact pushed `6f01457` applied without reset; exact clean source `1053161` repeated the full role/state/history suite | Passed incremental and clean-chain scopes |
| P39R-L set-based placement invalidation | Clone/import avoids per-row whole-draft scans while add/update/delete invalidation and placement-RPC bypass semantics remain exact | Migration `024` SHA-256 `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25`; exact pushed `b6d58ce`; three transition-table statement triggers; transaction-local invalidated/no-candidate markers; no persistent cache or duplicated apply RPC; WP-6.6/WP-7.5 and final invariants passed again on clean source `1053161` | Passed incremental and clean-chain scopes |
| P39R-C clean chain | Canonical bootstrap through `024`, corrected lifecycle/RLS/placement runtime, export, advisors, and cleanup all agree on one exact pushed source | `10531610eac53a97c6ef8f9d06418766b58bee36`; evidence SHA-256: WP-6.5 `ad0a76be...`, WP-6.6 `7fb1dd57...`, WP-7 `1e2f17cf...`, WP-7.5 `eb35fa03...`; canonical `sha256:2e3571...`; artifact manifest `2b455b74...`; final pointer `2568.0.0`/710, zero drafts, flags false, BOQ 198/1,547, Factor F `2569.0.0`/36 | Passed; owner P39R-U later passed separately |
| P-40 exploratory-UAT correction | UI normalization, unit governance, withdrawal recovery, actual-parser Excel compatibility, and UAT ordering agree without changing DB behavior | Exact pushed `dc83c35`; real-parser pinned inputs 708/708/693; 34 files/216 tests; TypeScript; lint 0 errors/10 existing warnings; network-enabled build; diff check; separate no-reset developer browser QA and disabled-baseline readback; no migration/reset/Production/Factor F/hotfix change | Passed source/docs and separate developer browser QA. Fresh scored Cards A-G were pending at this checkpoint; the later P-42 functional run does not close independent evidence |
| P-41 category/preview/withdraw-order correction | Authority-key bounds, read-only preview semantics, gap rejection, post-withdraw compaction, and one-revision transaction semantics agree across app, migration, bootstrap, smoke, tests, and authority docs | Migration `025` SHA-256 `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f`; exact source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22`; clean execution `adcca3939f3080cdf64bc6ad807051e9e85fed94`; WP-6.5 `4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245`, WP-6.6 `e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251`, WP-7 `5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195`, WP-7.5 `0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240`; live category maximum 96 under contract 500; canonical `sha256:2e3571...`; final pointer `2568.0.0`/710, zero drafts, flags false, BOQ 198/1,547, Factor F `2569.0.0`/36 | Exact source, incremental smoke, clean `017`-`025`, P-42 recovery preflight, and later proportional execution passed |
| P-42 review snapshot/terminal-state correction and recovery | Draft review URL identity, stale hard stop, terminal read-only wording, preserved return context, DB-guard authority, incident evidence, recovery baseline, retained functional cards, compact-overview containment, and cleanup agree | Incident `d00c941`; correction `b2500b5e...`; recovery `f8c6709...`; bounded findings `bdc104f...`; responsive correction `bcc0417...`; final execution `6fe3a6a...`; durable success `b639c03`; stale-choice `8fb9839...`; Full-import `df44b827...`; inputs 708/708/693; authority 710/65/17; clean pointer `2568.0.0`/710, zero drafts, flags false | Source correction, approved recovery, retained functional A-G, proportional exact-source execution, final cleanup, and P-37 guided-UAT Owner acceptance passed |
| P-42 proportional spot-check and placement-modal correction | Import wording/guard, modal-contained scrolling, one unsaved placement, same-request recovery, stale-choice discard, and scenario-bound cleanup agree without changing DB authority | Spots 1-2 retained. Exact D005 source `6fe3a6a...` passed physical Spot 3 with no placement write and Spot 4 request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with one effect; `b639c03` preserves definitive recovered success. Exact D007 on `8fb9839...` displayed the discard notice and cleanup restored pointer `2568.0.0`/710, zero drafts, and flags false without reset. | Execution and cleanup passed; C-08 passed; P-37 accepted 2026-07-25 under the guided-UAT variance |
| P-37 Full-import post-save correction | A confirmed import must leave the import form through Post/Redirect/Get, show durable filename/count/revision evidence, expose review/re-import actions, and never claim a browser-local file remains selected after remount/refresh | D008 exposed the silent remount after a successful 710-row apply. Exact correction `df44b827b290933463da5e14fa9125314660022a` moved success redirect into `applyCatalogImportAction`, added `catalogImportSuccessHref`, conditioned the file badge on the current selection, and enriched the workspace notice. Fresh D009 previewed in 187 ms, applied in 275 ms, returned `303` to `?notice=import-applied`, and displayed the required evidence/actions. D008/D009 were abandoned; final readback restored pointer `2568.0.0`/710, zero drafts, all flags false, BOQ/Factor F unchanged. | Passed Local E2E and repository gates on the exact correction checkpoint; no migration/reset/Production action |
| Standard DB lint + temp-aware placement lint | Genuine PL/pgSQL findings fail; the known analyzer inability to resolve a function-created `pg_temp` table is not mistaken for runtime evidence | Current standard CLI repeated the documented `pg_temp.catalog_placement_input` false positive and unused `v_row_count` warning. The unchanged migration hash preserves the prior transaction-scoped temp-aware zero-finding result and full runtime evidence. The Owner accepted the dead assignment as managed debt; no edit to `021` or stand-alone `026` is authorized. | No runtime blocker; remove at the next substantive function replacement |
| Security advisor | No new or untriaged blocker | Local ACL evidence remains green. Fresh Production output has seven authenticated-callable baseline definers and disabled leaked-password protection. All seven deny `anon`; mutating functions retain internal authorization checks. Management API proves `private` is not exposed. The Owner accepted these definers for this release sequence and leaked-password protection disabled for P-12/P-13 only; `get_user_role(uuid)`/`is_admin(uuid)` remain post-Phase-4 minimization candidates. | Ready for PRE-P-12 content; post-migration diff mandatory and P-14 Auth decision remains HOLD |
| Performance advisor | No rollout blocker | Fresh Production output has 19 RLS init-plan warnings, 5 multiple-permissive-policy warnings, 8 unindexed-FK information findings, and 16 unused-index information findings. Phase 4 objects are absent, so this is the pre-migration baseline. Both reviewed Local authority FKs have covering indexes; do not add or remove indexes without a measured post-migration diff. | Baseline captured; no Phase 4 blocker established |
| CI exact commit | Exact remote status is recorded without overstating unavailable checks | Readiness baseline `6827ebc1a729b7675fe91db58e129c9381b33ddb` and bounded application candidate `5068f944af2aa3fe8446c77c8ae8d48673cb260b` passed their local repository/build gates. Exact pushed readiness/documentation head `07d1d3399cea363a2ff923c6393d4a3259ce623c` reports remote `Vercel=success`. The PR-triggered GitHub Actions run list for that head is empty. | Passed remote exact-head status-record gate; remote GitHub Actions lint/test/build is not claimed |
| Vercel Preview/Production | Record actual deployed artifact only after P-12 at the separate P-13 gate | Exact-head Vercel status exists, but no P-13 deployment acceptance has been requested | Pending P-13 |

P-36-confirmed warnings are recorded below as an existing baseline, not as a
Production waiver. Formal minimization/remediation remains a P-12 readiness
review unless an earlier gate explicitly changes that due date.

| Warning | Rationale | Owner | Due date |
|---|---|---|---|
| Production: 7 authenticated-callable public `SECURITY DEFINER` functions | Owner accepted the current guarded set for P-12 through P-15. All deny `anon`; mutating admin/BOQ facades retain internal role/ownership checks; `get_my_profile` is self-scoped. Compare advisor/function-body/ACL evidence after migration and review `get_user_role(uuid)`/`is_admin(uuid)` after Phase 4 with new RLS/regression evidence. | Developer + security reviewer + owner | Accepted 2026-07-28 for this sequence; fresh P-12 diff and post-Phase-4 minimization remain |
| Supabase Auth leaked-password protection disabled | Genuine global Auth hardening opportunity, but not a Phase 4 database migration defect. Owner accepts disabled state for P-12/P-13 only under the Free plan; this authorizes no Auth change or purchase. | Security reviewer + owner | Separate decision before P-14 |
| Production: 19 auth RLS init-plan and 5 multiple-permissive-policy warnings | Fresh pre-Phase-4 Production baseline; Phase 4 objects are absent. Compare again after migration and stop on any unreviewed Phase 4 addition. | Developer + owner | Post-migration advisor diff at P-12 verification |
| Production: 8 unindexed-FK information findings | Pre-existing baseline relations; all four `010a` operational indexes are valid/ready and both reviewed Local authority FKs have covering indexes. Add no speculative index without measured workload value. | Developer + database reviewer | Post-migration/workload review; no current blocker |
| `private.catalog_placement_state.v_row_count` assigned but never read | Genuine low-risk code-quality debt with no behavior effect. Owner accepted it as managed debt; do not rewrite accepted `021` or add a full function-redeploy `026` solely to remove one assignment. | Developer + database reviewer + owner | Remove during the next substantive function replacement |

G4E Local closeout at 2026-07-15 01:11 +07: pointer `2568.0.0` and legacy
default agree; zero working drafts; all three catalog flags `false`; 198 BOQs
and 1,547 items; zero unversioned BOQs or cross-version item bindings; Factor F
default `2569.0.0` with 36 current rows/73 total rows; zero partial legacy
Factor F snapshots. Published G4E fixtures remain immutable non-default Local
history. This is not the Phase 4 final release state and does not fill the
Production sign-off table below.

P-36 Local technical closeout later supersedes the current integrated evidence
state without rewriting that G4E history: exact checkout `910cc3c` passed the
clean chain through `021` and restored pointer `2568.0.0`/710, zero working
drafts, all three flags `false`, BOQ 198/1,547 with zero unversioned BOQs, and
Factor F `2569.0.0`/36. The canonical hash repeated exactly and Production was
not touched. A later no-reset P-37 UAT session intentionally opened temporary
draft `2568.13.0`/728 and enabled only the Local admin/new-identity flags. Its
first comprehension gate failed before confirmation. The corrected UI later
passed technical stale/confirmation/replay/accepted-state evidence; the draft
was audited-abandoned and Local returned to the exact disabled baseline. A
final `2568.15.0` no-reset session completed owner keyboard/focus/presentation
UAT and cleanup on `f36d896d672609653de6634e307dcc44bce6d519`. At that
checkpoint P-37 remained HOLD for explicit Owner accept/hold under
[Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md); the Owner later
accepted P-37 on 2026-07-25 under the recorded guided-UAT variance.

The later 2026-07-24 no-reset Full-import path added D008/D009 evidence without
changing the pointer or authority. D008 exposed a successful database apply
followed by a silent client remount. The bounded source correction moved
success navigation to the Server Action and made the browser-file state
truthful. Fresh D009 completed the 710-row preview/apply/redirect path, showed
durable filename/count/revision and review/re-import actions, then was
audited-abandoned. Final read-only status is pointer `2568.0.0`/710, zero
working drafts, all flags false, BOQ 198/1,547, Factor F `2569.0.0`/36, no
reset, and Production untouched. Review Note #33 remains the detailed
authority for the completed placement and import-feedback UX checks.

## 16. Final state

| State | Expected | Actual | Result |
|---|---|---|---|
| Feature flag | Approved final value |  | Pending |
| Current pointer | Approved version |  | Pending |
| Pointer row count | 1 |  | Pending |
| Legacy flag agreement | Exact |  | Pending |
| Historical BOQs rewritten | 0 |  | Pending |
| Historical BOQ `factor_reference_version_id` mutations | 0 |  | Pending |
| Factor F default pointer/hash changed by Phase 4 | 0 |  | Pending |
| Pre-migration backup/manifest filed | Yes |  | Pending |
| Post-migration application-only backup/manifest filed before P-13 | Yes |  | Pending |
| Post-publication backup plus external-copy checksum/custody filed | Yes |  | Pending |
| Official Excel/PDF filed | Yes |  | Pending |
| Release note complete | Yes |  | Pending |

## 17. Sign-off

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Owner |  | Pending |  |  |
| Executor |  | Pending |  |  |
| Verifier |  | Pending |  |  |
| Taxonomy reviewer |  | Pending |  |  |
| Price authority |  | Pending |  |  |

Final decision: `Pending / Accepted / Accepted with exceptions / Rejected`

## 18. P-12 Production verification overlay — 2026-08-17

This section supersedes only the P-12-related `Pending` cells and historical
readiness status above. The overall Phase 4 final decision, P-13 deployment,
P-14/P-15 state, official Production exports, release note, and
post-publication custody remain pending.

### 18.1 Migration and closeout

| Evidence | Result |
|---|---|
| Execution/application | Execution HEAD `7c5ac6bd88677c0144bf8b8933b39293a2dee866`; application candidate `5068f944af2aa3fe8446c77c8ae8d48673cb260b` |
| Final stage | `026`; ordered ledger, schema shape, ownership/ACL/RLS, function posture, hotfix `016`, BOQ/Factor F invariants, and all-disabled flags passed |
| Stage-`026` manifest | `5a029dd507471ab5d74375bd3f2afba931096e9f2c208ff836b68d1dd5881e47` |
| Stage-`026` outcome/postflight | `1e407941d20cd4811638d3196cfa3b7f6253b87a841e9333286e9c634ea252b9` / `89cfba517f9157c7f4e0bb1448c05fb5c86a09135b5b5418df828fff6fe28a75` |
| Final machine gate | `33fdccc0c6b1e58e2b919c5bf246b62a5b2558461c70b2a329b11a10e9ad3085` |
| Final closeout outcome/manifest | `6c37bbe99c1babccbdc17667b2b468763643befbb52f3c4f73b7edd59033f144` / `2fb1259249282315750ce20d41732fd9f6c5e65998aa772fc4e387c5368d64a5` |
| Advisor disposition | Exact known temporary-table false positive only; findings fingerprint `468af0cb31e757f8316f0ef22249cf04dc58219eaea50b01787bd54fd572f846`; no other finding accepted |
| Closeout boundary | Read-only; no migration in closeout; all Phase 4 flags `false`; `p13Authorized=false`; no automatic next step |

### 18.2 Post-`026` application-only backup

| Evidence | Result |
|---|---|
| Attempt | `p12-post026-backup-v7-fddaaef72c5ff80c`; completed `2026-08-16T17:42:03Z` |
| Runtime/status | Runtime `d8e7fe310ed3033b26cafb37ce6c404e0a4bcdcd4a465636fc5c197390f15d66`; status `72d2f10358c99565aa2853b02a6bbcf61cc8812f24f2d665498bfd13d7c98d19` |
| Dump | `d44286409cad41fff8f977acdafbf6eaecdecb5692381a37fdb8f8f95b9ba538`; 776850 bytes; empty `pg_dump` stderr |
| Source before/after | Identical canonical SHA-256 `e10c528af9a3453dcd855752f7b63714b80cdf9b1d54d2dfaf7c6df5236ff833` |
| Source/restored normalized data | Identical SHA-256 `eb5118bedd3d4064b2df98af4e681626c12a9a3f73373588fefb958a2e83e4db` |
| Source/restored structural schema | Identical SHA-256 `e3d56e868ed7048ad19649a48954aeb63e617baa8f8f25b474ec2e18094a7ba2` |
| Restored integrity | Result SHA-256 `1c6af1a06a335ac29d43321d3241e63872d56858827647f18864c03fb1f74629`; `invalid_code_group_state_count=0`; empty verifier stderr |
| Encryption/checksum | Encrypted bundle; writeable capture followed by read-only reopen; all 10 package entries passed; read-only checksum-result SHA-256 `95265fca040c084d70f76b3d8ed3f00beb39a6aa4e98c573dd4a7d49b70c7d0a`; final detach passed |
| Scope | Application schemas only; Auth/Storage payload excluded; no migration rerun; no Production mutation; no P-13 or automatic next step |

P-12 is **Complete**. P-49 does not reopen or invalidate its migration/backup
evidence.

## 19. P-49 pending-account authorization overlay — 2026-08-17

This is the point-in-time P-49 decision record. Section 21 supersedes only its
current release ordering; the target, risk evidence, and non-authority remain.

This section supersedes only the former pending-user business-access target and
the P-13 readiness statement above. It does not rewrite P-12 evidence or claim
that the P-49 target has been implemented.

### 19.1 Decision and current evidence

| Item | Result |
|---|---|
| Business target | `pending = profile/onboarding-only`: authenticated but unapproved, with auth self-service, own safe profile/onboarding, required org selectors, waiting status, and logout only |
| Business denial | No Dashboard, BOQ (including retained own BOQ), Price List/Master Catalog, Factor F, print/export, admin, business RPC, or privileged API |
| Catalog RLS | Applied `022`/`023` active-only policies remain correct and immutable; pending catalog-read widening withdrawn |
| Current BOQ/RPC mismatch | `009` BOQ owner access lacks a current active-profile requirement and `016` still authorizes pending saves; non-active/missing/unknown-status paths must fail closed |
| Current Factor F mismatch | Legacy `factor_reference` plus versioned `012` tables are authenticated-readable without the P-49 active-status boundary; views/RPCs still require inventory |
| Current profile risk | Frozen baseline `Users can view all profiles` exposes all rows to authenticated; own-row INSERT can exploit the `active` default; broad own-row UPDATE, role-only admin UPDATE, and the current trigger do not protect `role`/`status`; exact live posture requires read-only verification, but source-derived privacy/self-creation/escalation paths are blockers |
| Current selector risk | Org/department/sector policies expose all rows to every authenticated status without `is_active`; pending should receive only active onboarding selectors and inactive/suspended none |
| Current settings/helper risk | Frozen baseline raw `app_settings` is anonymous/authenticated-readable and role-only writable; authenticated `can_approve_boq` lacks active status and `get_user_role`/`is_admin` expose arbitrary-user role state |
| Current privileged API risk | `/api/admin/users/[id]` requires admin role but not active status before service-role deletion; pending middleware does not cover `/api/admin/**` |
| Current application mismatch | permissions, middleware/navigation/copy, and export still encode the former pending business contract |
| Data integrity disposition | No row corruption inferred; existing pending-owned BOQs must remain byte/row unchanged while hidden |
| Authority | P-49 permits only canonical docs, a comment-only supersession on the historical RLS test, the executable authority-consistency test, and one local handoff commit; application/runtime/migration implementation, DB access, external Git publication/push, PR, merge, and deploy authority are false |

### 19.2 Required verification before P-13

- A separately approved append-only correction must align grants, RLS,
  protected profile columns, BOQ policies/RPC, Factor F, privileged API/server
  actions, middleware, permissions, loaders/export, waiting-state UI, and copy.
- Real sessions must prove the complete anonymous/pending/active/inactive/
  suspended/missing-profile/unknown-status x resource x action matrix through
  Data API, RPC, page deep links, and API routes.
- Pending safe-profile fields must remain usable while self-`role`, self-
  `status`, actual-org, identity/email, approval/rejection, and audit changes
  fail. Active-admin transitions must be atomic/audited; inactive admins and
  non-admins must fail.
- Pending/inactive/suspended must receive zero other-user profile rows, and
  inactive/suspended must not update their own onboarding/profile fields.
- Pending/inactive/suspended cannot read internal `app_settings`, pass BOQ
  approval helpers, or access legacy/versioned Factor F tables/views/RPCs;
  arbitrary-user role/admin lookup is unavailable to ordinary callers.
- Generic status edits must not bypass pending approval, turn active back into
  pending, or skip the audited rejection/resubmission/revocation state machine.
- Pending BOQ/catalog/Factor-F reads and writes must return zero/denied with no
  partial effect; active users, existing BOQ/Factor F bindings, pointer, flags,
  and hashes must remain unchanged.
- The exact correction commit must pass clean bootstrap, advisors, full tests,
  TypeScript, lint, build, remote CI, and Preview. A fresh deployment fingerprint
  and separate Owner P-13 decision remain mandatory.

Detailed evidence inventory, target matrix, historical-record rules, and
non-authority boundaries are in
[P-49 Plan #45](./45-phase4-p49-pending-authorization-hardening-plan.md).

### 19.3 P-13 disposition

**P-13 HARD-STOP — PENDING CROSS-LAYER AUTHORIZATION ALIGNMENT; NOT
AUTHORIZED.** Branch HEAD
`6f0953b19c25f6f96b1d2d11ee99ff43c33c5443` and its Quality/Preview evidence
predate P-49 implementation and are not an approved deployment candidate. No
`main` merge or Vercel Production deploy may proceed from that evidence.

## 20. P-50 known-price-erratum overlay — recorded 2026-08-17; reframed 2026-08-18

This is a decision/evidence record only. P-51 changes sequencing but not P-49's
technical target or P-13 authority. This section does not reopen P-12 or claim
that a catalog draft or Production row was changed.

| Verification item | Current result / future gate |
|---|---|
| Exact identity | `f2662c71-a6e5-407e-8456-8608e304b43b`; `ITEM-0429` -> `COR-PB0-002`; `งานเจาะผนังบ่อพักย่อย (PB)` |
| Frozen first-rollout value | Material/labor/unit `0/1763/1763`; preserve reconciliation CSV row 430 and first-rollout authority bytes |
| Owner-reported value | Proposed `0/1764/1764`; source PDF SHA-256 `5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b`, page 24; durable price-authority filing still required |
| Historical first-candidate gate | `2568.1.0` remains price-change total `0` until an exact P-50D Owner/price-authority manifest and ADR-003 decision explicitly supersede it |
| Adjacent source findings | `ITEM-0427`, `ITEM-0430`, and `ITEM-0431` have apparent source/baseline differences; unresolved and not authorized |
| Required reconciliation | Before P-15, complete a 100%-coverage filed-source versus current/candidate comparison by stable identity and every money field; classify every delta before any correction mutation |
| Release decision | `BASELINE-ONLY` requires zero name/unit/price deltas across all 710 rows. `SELECTED-DELTA` requires an exact new Owner-selected manifest/hash, ADR-003 classification, and full evidence rebuild. Neither is approved. |
| Non-authority | No P-50R/P-50D/P-50C execution, current catalog mutation, BOQ reprice/backfill, candidate rebaseline, P-13, P-14, P-14C, P-15, publish, commit, push, or automatic next step authorized |

A future correction verification must prove the approved correction manifest equals
the entire price delta exactly; names, units, categories, identities, order,
Factor F, BOQ bindings, flags, and every non-approved price remain unchanged.
It must record old/new snapshots, approval/source references, request/draft/lock
IDs, candidate and published dataset hashes, pre-P-15 review-only DRAFT artifact
hashes, post-P-15 official export hashes, old BOQ immutability, fresh-BOQ
corrected value, and encrypted post-publication backup/restore/checksum custody.
No P-50C or P-14C artifact is official before publication. See
[P-50 Plan #46](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md)
and the prepared, unapproved
[P-50R Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md).

## 21. P-51 bounded closeout overlay — 2026-08-18

P-51 supersedes Sections 19.3 and the original P-50 release ordering only for
current sequencing; their dated evidence remains historical. P-51 records
sequencing and risk acceptance, not execution evidence.

**Canonical sequence marker:** `P51_CANONICAL_PRODUCTION_SEQUENCE_V2`

If the first P-15 closeout has not finished by 2026-08-25 23:59:59 +07,
verification must stop and require fresh explicit Owner reapproval of the P-51
waiver before this sequence continues; there is no automatic extension.

The exact route is:

1. separately approved P-50R-I synthetic implementation freeze, then P-50R-O
   PDF-only independent oracle, then P-50R-X six-input full source-price
   reconciliation; no stage inherits authority from the previous stage;
2. P-50D `BASELINE-ONLY` empty-set decision or exact `SELECTED-DELTA`
   manifest/Owner-authority/ADR-003 decision;
3. separately approved P-50C non-Production baseline rebuild or selected-delta refreeze,
   with only review-only artifacts marked `DRAFT – ห้ามใช้อ้างอิง`;
4. one identifier-binding manifest, then exact Git/CI/Preview and deployment
   fingerprint gates;
5. separately approved P-13 using a fresh **read-only** Production state/traffic
   manifest and reverification of the existing P-12 v7 backup checksum/restore/
   custody evidence; P-13 does not authorize a new backup;
6. separately approved P-14 with exact temporary
   `{catalog_admin_enabled=true, catalog_new_identity_enabled=false,
   catalog_retirement_enabled=false}` and final success/failure all-false
   matrices; audited-abandon the UAT draft and prove zero working drafts;
7. separately approved P-14C to prepare exactly one real Production candidate,
   freeze its exact draft reference/final `reviewLock`/dataset hash/diff, and
   generate only review-only DRAFT artifacts;
8. separately approved P-15 naming that exact Production draft reference and
   final `reviewLock`, then one atomic publication/pointer switch; and
9. ordered closeout: official exports from the published database, named new/
   old/duplicate/open-tab BOQ canaries, exact final all-false flag restoration,
   final invariants, and only then encrypted backup/isolated restore/checksum/
   custody. Re-enter P-49 before another Production deploy, targeting its
   decision within seven calendar days after closeout.

The verification record must keep distinct and bind, never conflate, the
application/source commit SHA, filed-source-set hash, approved delta-manifest
hash (or exact empty Path B set), ADR-003 target decision, non-Production
candidate hash, DRAFT artifact hashes, deployment fingerprint, Production draft
reference/final review lock, published version/dataset hash, and official
artifact hashes.

| Gate | Required fresh verification | Explicit non-authority |
|---|---|---|
| P-50R-I | Five implementation files, exact runtimes/dependency inventories, sandbox profile/direct vectors, synthetic-only tests, three-file review package, independent PASS | No protected-source read, real reconciliation, DB/network/Git, or automatic P-50R-O |
| P-50R-O | Exact PDF/helper/runtime/profile hashes, 28-page independent row oracle, human all-page attestation, three-file review package | No other source read, primary reconciliation, delta decision, or automatic P-50R-X |
| P-50R-X | Six exact inputs including the frozen oracle, complete internal/oracle counts, cross-source equality, dual-pass bytes, eight-file evidence package | No price approval, mutation, P-50D, Git, or later gate |
| P-50C | Path-specific non-Production refreeze, complete diff/count/hash, reproducibility, DRAFT artifact hashes | No Production read/write, official export, Git, or later gate |
| P-13 | Read-only state/traffic manifest; existing P-12 backup checksum/restore/custody reverified; all flags false; exact deployment fingerprint | No new backup, catalog draft, flag write, or automatic P-14 |
| P-14 | Exact temporary/final flag matrices; named UAT; audited-abandoned UAT draft; zero working drafts; unchanged pointer/BOQ/Factor F | No real candidate preparation, publish, or pointer move |
| P-14C | Exact real draft reference/target/base, request IDs, final `reviewLock`, dataset hash, complete diff, DRAFT artifact hashes | No publish, official export, pointer/BOQ/Factor F/final-flag change |
| P-15 | Exact draft reference/final `reviewLock`, target/base, manifest, rollback target, canaries, one operation ID | No substitution of another draft, lock, target, or manifest |
| Closeout | Publish result; official exports; canaries; final all-false flags; invariants; then backup/restore/checksum/custody | No successful-closeout claim when order or any result differs |

At this checkpoint, P-50R-I/P-50R-O/P-50R-X/P-50D/P-50C execution, identifier-binding execution,
database access, Production write, catalog/BOQ/pointer mutation, commit/push,
deploy, flags, P-13, P-14, P-14C, P-15, official artifacts, and automatic next
step all remain unauthorized. See
[P-51 Closeout Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

## 22. P-50R staged exact evidence-scope request preparation — 2026-08-18

[P-50R Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md)
is prepared and remains unexecuted. It closes the code-before-review gap by
splitting P-50R into P-50R-I synthetic implementation freeze, P-50R-O PDF-only
independent oracle capture, and P-50R-X six-input exact reconciliation. Only the
P-50R-I decision block is ready for Owner review; P-50R-O/P-50R-X are not ready
or requested. Every stage remains unauthorized.

| Verification item | Result |
|---|---|
| Request marker | `P50R_EXACT_EVIDENCE_SCOPE_REQUEST_V1` parsed exactly; stage order is I -> O -> X; only I is review-ready; I/O/X execution and every operational/later-gate flag remain false or null |
| Frozen tracked evidence | Existing reconciliation CSV SHA-256 `4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a` and first-rollout authority SHA-256 `62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8` recomputed by the authority test; historical bytes unchanged |
| P-50R-I | Future five implementation files plus one `p50r-i/` directory/three review files are exact; synthetic inputs only; runtime/parser/sandbox bytes must be independently frozen before any source gate |
| P-50R-O | Future exact-PDF-only oracle stage and three outputs are defined but not ready/requested; its hash-bound 28-page inventory becomes the sixth execution input only after PASS |
| P-50R-X | Future six inputs, eight `p50r-x/` outputs, cross-source equality, deterministic dual pass, and acyclic hash graph are defined but not ready/requested |
| Protected/ignored inputs | No protected read is requested by P-50R-I; future O/X exact paths/hashes are recorded only as non-authorizing contracts; no protected source was opened or enumerated |
| Environment | No Local/Production database, Supabase operation, network, dependency install, or Production access |
| Mutation | No runner/helper/profile/test/evidence output created; no catalog, BOQ, pointer, Factor F, migration, runtime, application, source, or protected path changed by P-50R preparation |
| Git | No stage, commit, push, PR, merge, or publication performed or authorized |
| Validation | `npm test` passed 38 files / 298 tests; `npx tsc --noEmit --pretty false`, `npm run lint`, and `git diff --check` exited 0 |

This evidence proves only that the request contract and current authority
documents are internally consistent. It does not prove the protected input
hashes by fresh read, implementation readiness, source completeness, reconciliation coverage, a correction
manifest, price authority, Path A/Path B, P-50D/P-50C, or any P-13/P-14/P-14C/
P-15 authority.

## 23. Historical P-50R SOLO simplification overlay — 2026-08-21

The Owner asked to reduce the control ceremony for a one-person project while
retaining the controls that prevent an incorrect catalog or accidental
Production change. [P-50R Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md)
now prepares one exact `P50R-SOLO-REQ-20260821-V1` offline reconciliation
decision. It supersedes the current interpretation of Sections 21 and 22 only.
Those dated sections remain immutable history: P-50R-I/P-50R-O/P-50R-X were
planned but never executed, and no protected source was read under them.

Current canonical route (the later overlays in this report record the completed
P-50R/P-50C work and the exact confirmation hold):

`P-51D -> P-50R SOLO complete -> one exact P-50D V3 Owner confirmation
(ratification) that also accepts the verified offline P-50C package only as
local review evidence -> separately authorized local release commit/push +
CI/Preview -> P-13/P-14/P-14C bounded window -> separate P-15 -> closeout ->
P-49`

The simplified route has three operating gates: completed offline reconciliation
and candidate evidence followed by the pending exact Owner confirmation and a
separate Git/CI/Preview decision; one fail-closed P-13/P-14/P-14C
deploy/UAT/draft window; and a separate P-15 publication/closeout gate. Within
the bounded window each checkpoint advances only on PASS, and P-14C must stop
with exactly one locked unpublished draft. P-15 remains a new explicit
decision.

| Verification item | Current result |
|---|---|
| SOLO marker | `P50R_SOLO_RECONCILIATION_REQUEST_V1` parses as request `P50R-SOLO-REQ-20260821-V1`; Owner review is ready, while execution and every later authority flag remain false |
| Exact inputs | Five explicit paths/hashes/scopes are bound without a directory scan: frozen SQL snapshot, all 28 filed-PDF pages, the named workbook range, immutable reconciliation CSV, and immutable rollout-authority JSON |
| Implementation/write scope | Three proposed implementation files and five new evidence files only; all evidence targets must be absent before a separately authorized run |
| Coverage and arithmetic | 100% bidirectional source/current/candidate coverage by stable UUID, every PDF row classified exactly once, and `material + labor = unit cost` checked for every representation |
| Determinism | Two fresh in-memory passes must produce byte-identical canonical reconciliation, delta-manifest, and exception outputs before the first evidence write |
| Solo review | Owner/operator must review all 28 PDF pages plus every unmatched, duplicate, ambiguous, arithmetic, precedence, and price-delta result; the record must say self-reviewed, not independently reviewed |
| Environment boundary | Offline only; no Local/Production database, Supabase operation, network, credential, dependency install, source/catalog/BOQ/pointer/Factor F/migration/runtime mutation, or write outside the exact evidence allowlist |
| Later gates | P-50D, P-50C, release commit/push, CI/Preview, P-13, P-14, P-14C, P-15, publication, and P-49 remediation all remain separately unauthorized |
| Historical stages | P-50R-I/P-50R-O/P-50R-X were never executed and are superseded prospectively; their 2026-08-18 records remain point-in-time evidence only |
| Validation | `npm test` passed 38 files / 298 tests; `npx tsc --noEmit --pretty false`, `npm run lint`, and `git diff --check` exited 0; exact new P-50/P-51/P-50R plan files also passed trailing-whitespace/conflict-marker checks |

This documentation update did not open or enumerate the protected input
directory, access a database or network, create implementation/evidence files,
or perform a Git stage, commit, push, PR, merge, deploy, flag write, or
publication. Preparing or validating the request is not approval to execute it.

## 24. P-50R SOLO completion and P-50D request overlay — 2026-08-22

Section 23 is preserved as the truthful pre-execution checkpoint. The Owner's
exact approval for request `P50R-SOLO-REQ-20260821-V1` was later consumed within
its bounded window. The offline run completed with `PASS_FOR_P50D_REQUEST` and
stopped at `STOP_AT_P50D_OWNER_DECISION_REQUEST`.

| Verification item | Current result |
|---|---|
| Frozen result | [P-50R Request/Result #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) and the immutable [`p50r-solo` summary](./evidence/p50r-solo/summary.json) bind the consumed request and evidence package |
| Coverage | 28/28 PDF pages reviewed; 67 deltas and 245 exceptions reviewed; blocking exceptions `0` |
| Delta disposition | The frozen label `proposed_confirmed_correction` identifies 49 external-source comparison candidates only; 18 rows retain current and 17 remain excluded. No record is approved for mutation. |
| Current decision | Historical [Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) is superseded without approval. [Baseline-first Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md), request `P50D-REQ-20260823-V2`, is current and **not approved**. |
| Binding candidate rule | `2568.1.0` remains name/unit/price-change total `0`; current `2568.0.0` is the authority unless an exact selected-delta decision explicitly supersedes a field. |
| Environment and mutation | P-50R used no Local/Production database or network and made no source/catalog/BOQ/pointer/Factor F mutation |
| Later authority | P-50D, P-50C, Git, P-13, P-14, P-14C, P-15, deploy, flags, Production draft creation, and publication remain false/unauthorized |

P-50R completion is reconciliation evidence only. It does not approve a price,
release target, BASELINE-ONLY/SELECTED-DELTA disposition, candidate build/refreeze, commit or
push, database/Production action, or automatic next step.

## 25. P-50D exact one-row selected-delta approval request — 2026-08-23

Section 24 remains the completed P-50R and V2 preparation record. The Owner
subsequently selected `SELECTED-DELTA` intent for only the original P-50 row;
because another comparison candidate also has value `1764`, the selection is
bound by UUID and code rather than price alone.

| Verification item | Current result |
|---|---|
| Then-current request | [Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md), exact request `P50D-REQ-20260823-V3`; exact approval was pending at this checkpoint |
| Selected identity | UUID `f2662c71-a6e5-407e-8456-8608e304b43b`; `ITEM-0429` -> `COR-PB0-002`; unchanged name `งานเจาะผนังบ่อพักย่อย (PB)` and unit `จุด` |
| Selected price | `0/1763/1763 -> 0/1764/1764`; material delta `0`, labor delta `+1`, unit-cost delta `+1`; arithmetic passes |
| Manifest binding | File SHA-256 `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`; one selected record SHA-256 `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df` |
| Retained scope | The other 709 baseline rows remain unchanged. The other 48 P-50R candidates remain unselected under SHA-256 `2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be`; this explicitly includes `ITEM-0427`, `ITEM-0430`, and `ITEM-0431`. |
| Binding candidate rule | The historical zero-name/unit/price gate remains binding until exact V3 approval; selection intent alone does not supersede it |
| Later authority | P-50D, P-50C, Local/Production database, network, catalog/candidate/BOQ/pointer/Factor F mutation, Git, P-13, P-14, P-14C, P-15, deploy, flags, and publication remain false/unauthorized |

The V3 proposal and manifest are approval inputs only. They did not mutate the
published catalog, a candidate, a BOQ, the pointer, or Factor F and did not use
a database, Production, or network connection. After exact V3 approval, the
next possible action is a separately requested P-50C non-Production build/
refreeze; there is no automatic next gate.

## 26. Superseded same-day interpretation and P-50C technical result — 2026-08-23

Section 25 is retained as the truthful pre-confirmation request. A same-day
interpretation treated the one-row business intent as approval of exact
`P50D-REQ-20260823-V3` and triggered the bounded local offline P-50C technical
build. Independent review later found that interpretation did not satisfy the
exact UUID/hash contract; [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)
supersedes it for current authority. The technical evidence remains in [P-50C
Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md).

| Verification item | Current result |
|---|---|
| P-50D V3 | **EXACT OWNER CONFIRMATION (RATIFICATION) PENDING / NOT AUTHORIZED.** Frozen to UUID `f2662c71-a6e5-407e-8456-8608e304b43b` / `ITEM-0429` / `COR-PB0-002`, unchanged name/unit/material, `0/1763/1763 -> 0/1764/1764` |
| P-50C status | **TECHNICAL BUILD COMPLETE / DATA REVIEW PASSED / LOCAL-EVIDENCE ACCEPTANCE PENDING.** No residual execution authority |
| Candidate identity | `P50C-CANDIDATE-20260823-V1`; provisional target `2568.1.0` pending a fresh issued/claimed registry check |
| Candidate SHA-256 | `d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611` |
| Complete diff SHA-256 | `72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18` |
| Candidate-manifest SHA-256 | `d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5` |
| Published baseline | `2568.0.0` remains published/current and unchanged; this UUID remains `0/1763/1763` there |
| Candidate delta | Only the local provisional candidate carries this UUID at `0/1764/1764`; name/unit/material delta `0` and the other 709 baseline authority rows are unchanged |
| Excluded scope | The other 48 candidates and adjacent `ITEM-0427`, `ITEM-0430`, `ITEM-0431` remain unchanged; the 17 authority exclusions remain distinct; no BOQ reprice/backfill |
| Remaining authority | Database/Production/network/application mutation, commit, push, CI, deploy, flags, P-13, P-14, P-14C, P-15, and publication remain false/unauthorized |

The local candidate demonstrates the selected UUID delta, but the historical
zero-price authority has not yet been superseded by exact Owner confirmation.
The candidate is not permission to edit
published `2568.0.0`, expand to another source candidate, or alter historical
BOQs. The next decision is confirm/ratify or hold Review Remediation #54. That
confirmation accepts the package only as local review evidence and does not
authorize commit/push, CI, or any operating gate.

## 27. Historical P-50D V3 ratification mirror before P-50G/P-50H — 2026-08-24

This append-only successor supersedes only the live pending interpretation
above. The canonical authority remains the exact receipt and marker in
[Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
Exact P-50D V3 ratification is recorded, and
`P50C-CANDIDATE-20260823-V1` is accepted only as local review evidence.
Published/current `2568.0.0` remains unchanged, including `ITEM-0429` at
`0/1763/1763`; provisional local `2568.1.0` review evidence contains the
selected row at `0/1764/1764` and still requires a fresh issued/claimed
registry check.

This receipt authorizes no candidate application, source/catalog/BOQ/pointer/
Factor F mutation, commit, push, CI/Preview, database, Production, network,
P-13, P-14, P-14C, P-15, deployment, or publication. The next safe step is
the required small repository gate. Only after it passes may a separate exact
local commit/push and CI/Preview authorization request be prepared; nothing
continues automatically.

<!-- P50D_V3_VERIFICATION_RATIFICATION_RECEIPT_V1 {"schema":"conduit-boq/p50d-v3-verification-ratification-receipt/v1","recordedAt":"2026-08-24T00:44:15+07:00","canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","canonicalReceiptDocument":"./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md","resolvesRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dRequestId":"P50D-REQ-20260823-V3","confirmationReceived":true,"exactOwnerConfirmationPending":false,"exactOwnerRatificationPending":false,"p50dDecisionApproved":true,"p50dV3Confirmed":true,"p50dV3Ratified":true,"p50dAuthorized":true,"p50dAuthorityScope":"decision-record-only","p50dFurtherActionAuthorized":false,"selectedIdentityId":"f2662c71-a6e5-407e-8456-8608e304b43b","selectedLegacyItemCode":"ITEM-0429","selectedTargetItemCode":"COR-PB0-002","baselinePrice":[0,1763,1763],"candidatePrice":[0,1764,1764],"p50dManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cTechnicalBuildOccurred":true,"p50cDataReviewPassed":true,"p50cCandidateAccepted":true,"acceptsCandidateAs":"local-review-evidence-only","p50cFurtherExecutionAuthorized":false,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","unchangedBaselineRowCount":709,"unselectedExternalCandidateCount":48,"retainBaselineEvidenceCount":18,"authorityExclusionCount":17,"explicitlyUnselectedAdjacentItems":["ITEM-0427","ITEM-0430","ITEM-0431"],"rowClassification":"same-basis-correction","overallReleaseClassification":"structured-code-revision-with-one-selected-price-delta","currentPublishedVersion":"2568.0.0","currentPublishedCatalogChanged":false,"provisionalTargetVersion":"2568.1.0","targetRegistryCheckPending":true,"historicalZeroPriceGateSupersededForSelectedLocalCandidateUuidOnly":true,"historicalBoqRepriceAuthorized":false,"changesPriorBusinessIntent":false,"nextSafeStep":"none-stop-after-recording-ratification","smallRepositoryGateRequired":false,"separateGitCiAuthorizationRequired":true,"gitCiAuthorizationGranted":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"sourceMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"supersedesCurrentAuthorityOf":"section-26-current-p50-review-correction"} -->
