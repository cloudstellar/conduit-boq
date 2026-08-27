# Master Catalog Phase 4 Production Runbook

> **Current Master Catalog admin-edit completion overlay (2026-08-28):** The
> data/publication milestone is complete (`2568.1.0`, `710` rows, reviewed
> ITEM-0429/ITEM-0615 values, XLSX/PDF passed, no historical BOQ reprice, no
> Factor F change), and P-13/P-14/P-14C/P-15 are complete and must not be
> replayed. Migration 027 was applied once and is immutable. The deployed Admin
> UI is intentionally read-only, so end-to-end completion remains pending.
> [Plan #105](./105-phase4-master-catalog-admin-edit-completion-plan.md) restores
> the original active-Admin draft workflow through a new forward-only 028 gate
> projection while keeping published rows immutable and new-identity/
> retirement capabilities disabled. Current authority covers local docs, code,
> tests, and the reviewed package commit/push only to
> `codex/master-catalog-admin-edit`; no merge/push to `main`, Production
> write, flag change, Production deploy, or automatic next step is authorized.
> This overlay supersedes all prior live Status/Current/next-action wording;
> all dated text below is retained as historical evidence only.

<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V1 {"schema":"conduit-boq/master-catalog-admin-edit-status/v1","recordedAt":"2026-08-28","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"readOnlyAdminUiLive":true,"endToEndComplete":false,"plan":"105-phase4-master-catalog-admin-edit-completion-plan.md","target":"active-admin-draft-workflow","migration028Required":true,"catalogNewIdentityEnabledTarget":false,"catalogRetirementEnabledTarget":false,"localDocsCodeTestsAuthorized":true,"featureBranchGitPublicationAuthorized":true,"featureBranch":"codex/master-catalog-admin-edit","commitAuthorized":true,"pushAuthorized":true,"mainMergeAuthorized":false,"productionWriteAuthorized":false,"deployAuthorized":false,"automaticNextStep":false} -->


**Status:** Retained execution/closeout runbook. P-12 **COMPLETE** on
2026-08-17 in exact order `017` -> `017a` -> `018`-`026`, with the
checksum-verified v7 post-`026` backup/isolated restore complete.
P-13/P-14/P-14C/P-15 remain unauthorized.
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Default posture:** Feature flag disabled; stop on any failed gate

> **Current pre-Production stop (2026-08-24):** P-50I preflight and exact patch
> target passed, then fail-fast local validation stopped at `21/22` authority
> tests and `30/31` exact P-50 tests because the raw P-50I marker-name regex
> counted two frozen-diff examples plus the one actual EOF marker. The anchored
> count is one; lint and deterministic P-50C checks passed. [Result
> #60](./60-phase4-p50i-local-validation-failure-result-record.md) is the
> canonical receipt. No stage, commit, push, new CI/Preview, database, or
> Production action occurred; HEAD/upstream/remote remain `2b45f9b...` and the
> exact P-50I target is retained uncommitted. This runbook remains stopped
> before P-13. Only [P-50J Proposal
> #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md)
> is current, and it is review-only until separately approved. Earlier P-50H
> and P-50I-pending wording below is historical.
> Historical bindings remain [P-50H Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md),
> [P-50I Proposal #59](./59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md),
> and failed Quality run `32661774094`; none grants current authority.

**Historical pre-P-50G/P-50H ratification checkpoint (2026-08-24; superseded
by the current stop above):** exact P-50D V3 Owner confirmation
(ratification) was recorded under [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md),
and the bounded local P-50C candidate is accepted only as local review evidence.
At that checkpoint the next safe step was the small repository gate. P-50G and
P-50H chronology is recorded by Result #58. P-50I was later approved and
stopped locally as recorded by Result #60; P-50J Proposal #61 is now the only
current review.

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

**Historical P-37 disposition (2026-07-25; superseded by completed P-12):**
WP-8 is Owner-accepted under the
explicit guided-UAT variance recorded in the Decision Register against exact
checkpoint `df44b827b290933463da5e14fa9125314660022a`. This permits only a
later P-12 readiness request. It is not permission to run any Production step,
open Add/Supplement before P-14, decide P-19, or change Factor F/hotfix scope.

**Historical PRE-P-12 readiness disposition (2026-07-28; later satisfied):**
the readiness package was
prepared at
[P-12 Production Readiness Package #39](./39-phase4-p12-production-readiness-package.md).
Its verdict is HOLD. The authorized Production database/ledger/advisor
read-only evidence is complete without a Production write. The Data API
exposed-schema proof is also complete. Exact Supabase PostgreSQL 17 synthetic
and Local application-only restore rehearsals passed without Production
access. A third Owner-entered credential passed after two rejected candidates
were deleted, and the authorized encrypted Production application-only
readiness backup plus exact-image network-isolated restore passed with no
Production write. The Owner-authorized post-write non-force detach/read-only reopen/full
checksum passed, Local services were restored without reset, and exact pushed
HEAD `07d1d3399cea363a2ff923c6393d4a3259ce623c` records remote
`Vercel=success` with no PR-triggered GitHub Actions run claimed.
A later dirty-tree, rehearsal-only CLI kit applied `017` only to a disposable
network-isolated PostgreSQL 17 database and hard-stopped because the
private-function default ACL was absent; it did not start `018` and touched
neither Local Supabase nor Production. Do not edit `017` or infer exact-path
acceptance. [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
records the Owner-selected Option B repository candidate: separate migration
`017a_master_catalog_phase4_global_function_default_privileges.sql`, ledger
`20260728001730_master_catalog_phase4_global_function_default_privileges`,
SHA-256
`12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`,
ordered immediately after `017` and before `018`. Independent review and a
fresh two-pass exact-source disposable rehearsal remain mandatory. An
after-`025` correction cannot substitute for this bridge: `018` creates twelve private
`SECURITY DEFINER` helpers without explicit per-function revokes and grants
`authenticated` `USAGE` on schema `private`; without the effective global
default denial, those helpers inherit `PUBLIC EXECUTE`. Production has not
received `017`, and its Data API does not expose `private`, so the finding has
not introduced Production exposure; the reviewed ACL/defense-in-depth contract
still fails on the historical sequence. The earlier runner correctly stopped
after `017`. The bridge
candidate removes global and schema-specific inherited function EXECUTE,
including `service_role`, and reasserts only the intended public-stub grants.
Do not edit `017` or `018` or apply `017a` to an existing post-`025` database.

P-45 subsequently completed at pushed/upstream-equal
`d92d8ced42fc882481ebc2c4579adcf1edbebea7`. The one P-46 Local bootstrap
authorization was consumed: the canonical chain completed through `025`, then
WP-6.5 stopped fail-closed because the authenticated public
`SECURITY INVOKER` wrapper could not execute the owner-only pure formatter
`private.catalog_action_error(uuid,text,text,boolean,jsonb)`. P-47 authorizes
repository-only migration
`026_master_catalog_phase4_catalog_action_error_acl.sql`, ledger
`20260729002600_master_catalog_phase4_catalog_action_error_acl`, SHA-256
`472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`.
This distinct post-`025` per-object fix retains the reviewed body, owner,
signature, and empty search path; changes the pure helper to `SECURITY
INVOKER`; grants only `authenticated`; and denies `PUBLIC`, `anon`, and
`service_role`. It does not replace `017a`, change defaults/data, or authorize
Local application/reset, Production, or P-12.
The Owner accepted the three managed-residual recommendations and
single-device-loss risk only for the bounded P-12-through-P-15 sequence. The
custody exception expires at the earlier of the post-publication checkpoint or
168 hours after P-12 starts and carries the 24-hour pause rule below. Those
decisions are recorded in the reviewed source/tooling candidate. P-44 froze
the executable migration/application/bootstrap/generator/runner content at
clean pushed commit
`ed94c0304be2741217c7ea2c36322b426de1dfe5`; its Remote record is
`Vercel=success`, with no PR-triggered GitHub Actions run. That freeze and the
P-45/P-46 source HEAD are historical after the fail-closed P-46 result. The
P-47 candidate passed independent review/static closure. P-48 authorizes only
its exact 25-file commit/push, with no PR. The replacement clean pushed/
upstream-equal source/tooling HEAD and Remote record, then fresh explicit Owner
authorization are still required before any destructive Local bootstrap. No
cleanup, retry, patch, or reset is currently authorized.
Replacement-HEAD/Remote evidence, corrected
Local/two-pass evidence, exact
executor/verifier/path/`current_user`/object-owner/window record, and explicit
P-12 approval remain open.
Leaked-password protection requires a separate decision before P-14. This
readiness evidence and custody decision do not authorize further Production
access or any Production write.

**Historical PRE-P-12 operational-fingerprint note (later satisfied):** the
required runner approval field `catalogAuthorityFingerprintSha256` was a
**new operational fingerprint**, not a recomputation of the historical
`sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`;
the historical canonical SQL was not committed. Its formula is frozen only in
[CLI Execution Runbook #41](./41-phase4-p12-cli-execution-runbook.md) and the
reviewed runner. At that historical checkpoint, the value was **UNCOMPUTED —
HOLD**; the completed P-12 record later bound
`0fbaf215018200bacbc728af330e990b98c7e6128165982289ed429c93ad13f2`.
The historical instruction was to derive it only through a
separately authorized read-only query against the encrypted Production
readiness snapshot's isolated restore or fresh in-window Production/restore
evidence. Record the value and exact query/evidence source in Package #39 and
Checklist #40, then bind the exact bare lowercase 64-hex value in the external
Production approval. Until that binding is exact, even a mechanically
`productionEligible=true` source kit must not be used in Production and P-12
must not be requested.

**Historical PRE-P-12 CLI evidence order (later completed):** the exact CLI
evidence order was fail-closed. After P-47 source/static
closure it is: exact P-48 Git-only publication; replacement clean pushed/
upstream-equal source/tooling HEAD; truthful Remote CI/status for that exact
HEAD; a fresh separately authorized canonical Local bootstrap plus
consolidated smoke/invariants; one later-authorized external kit;
executable `calibrate-schema` pass 1; independent contract review; a second
fresh full isolated rehearsal and transitive pass-2 closeout with rotating
advisor artifacts; then the remaining PRE-P-12 gates. A failed or drifting
Local run stops the sequence and cannot be retried or patched without fresh
Owner approval.
Only after explicit Owner P-12 GO and separate Git authorization may a
descendant Checklist-#40-only GO HEAD and external approval be created. The
same source kit is reused. The candidate stage order is exact `016`, `017`,
`017a`, `018`-`026`; none of the replacement-HEAD Remote/Local/pass-1/contract/pass-2/GO
bindings is complete.

Independent review uses schema-contract v3 with a structured immutable GitHub
PR-review envelope and exact reviewed-payload marker, not free-form reviewer
text. A distinct human checks the review in an authenticated GitHub session
before contract freeze and again after pass 2 immediately before GO; external
approval v3 records `githubReviewCheckedAt`. The runner remains offline and
validates structure/hash/identity/chronology only. GitHub account compromise,
deliberate fabrication/collusion, and post-check review deletion are explicit
honest-but-fallible residuals; if malicious-operator resistance is required,
stop and introduce independently custodied signed attestations before
Production rather than pretending the current check provides non-repudiation.

## 1. Safety statement

This runbook is an execution checklist, not standing permission to change
Production. Implementation approval, Production migration approval,
application-deploy approval, feature enablement, and catalog publication are
separate decisions.

Never paste a migration into Production before confirming the reviewed file
fingerprint and current schema preflight. Never edit or delete a published
catalog to roll back.

## 2. Roles

| Role | Responsibility | May also be |
|---|---|---|
| Owner | Approves scope, Production window, and named catalog publication | Business approver |
| Executor | Runs migration/deploy/flag/publish steps and records evidence | Developer/admin |
| Verifier | Independently checks counts, security, UI, exports, and rollback | For P-12, a named human distinct from the Executor; different person where practical elsewhere |
| Taxonomy reviewer | Approves AAA/TTT and row-level mapping | Domain engineer/data steward |
| Price authority | Confirms price basis and no unauthorized changes | Owner delegate |

## 3. Required artifacts

- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [Code Dictionary](./10-phase4-structured-code-dictionary.md)
- [Reconciliation Report](./11-phase4-reconciliation-report.md)
- [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Decision Register](./19-phase4-decision-register.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
- [Architecture Review Disposition](./21-phase4-architecture-review-disposition.md)
- [Post-Factor-F Adjustment Plan](./22-phase4-post-factor-f-adjustment-plan.md)
- [Implementation Execution Pack](./23-phase4-implementation-execution-pack.md)
- [Owner/Developer Capability Completeness Audit](./29-phase4-owner-dev-completeness-audit.md)
- [P-18 Placement Governance Review Note](./28-phase4-p18-placement-governance-review-note.md)
- [WP-8 P-37 Closure Matrix](./34-phase4-wp8-p37-closure-matrix.md)
- [P-39 Draft Identity and Release-Number Correction Plan](./37-phase4-p39-draft-identity-release-number-correction-plan.md)
- [P-12 Production Readiness Package](./39-phase4-p12-production-readiness-package.md)
- [P-12 Owner Decision Checklist](./40-phase4-p12-owner-decision-checklist.md)
- [P-12 CLI Execution Runbook](./41-phase4-p12-cli-execution-runbook.md)
- [Post-Phase-4 Whole-Service DR Backlog](./42-phase4-post-phase4-disaster-recovery-backlog.md)
- [Execution Progress Tracker authority/evidence index](./25-phase4-execution-progress-tracker.md)
- [Verification Report](./13-phase4-verification-report.md)
- [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md)
- Reviewed migration SQL and file SHA-256
- Supabase security/performance advisor baseline with known findings triaged
- Fresh logical backup manifest and tested restore log
- Approved runtime CI assets via P-10 and
  [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); `/CI/` source
  remains local-only

## 4. Stop conditions applying to every phase

Stop immediately when any of these occurs:

- current Production counts/invariants differ without explanation;
- a reviewed file fingerprint differs;
- the new operational `catalogAuthorityFingerprintSha256` or its authorized
  query/evidence source/external Production approval binding is missing,
  unreviewed, or unequal to the live runner readback;
- the separately reviewed bridge immediately after `017` and before `018` is
  absent/unapproved, its filename/ledger version-name/SHA-256 is not frozen, or
  the approved order attempts to continue directly from `017` to `018`;
- backup or restore test is incomplete;
- the approved `session_user`/`current_user` or object-owner role is missing,
  changes between files, or differs from the recorded execution identity;
- the one-row-per-file ledger, after-file ownership/ACL delta, or final
  owner/ACL/RLS inventory is missing or differs from the reviewed postcondition;
- the Production DB credential fails authentication, is guessed, or a password
  reset is proposed without a separate Owner approval and external direct/
  intermittent consumer update plan;
- reconciliation does not cover all 710 Production UUIDs;
- a Production price/name/unit changes during code-only rollout;
- a code maps to multiple identities or an identity duplicates inside a version;
- a published baseline identity/code history would be merged or rewritten;
- current catalog pointer is missing, duplicated, or not the expected base;
- Factor F default pointer, active-version row count/hash, grants, RLS, or
  immutability trigger changes during a Master Catalog step;
- an existing BOQ `factor_reference_version_id` mutates, or a legacy BOQ is
  backfilled with a guessed Factor F version;
- a Master Catalog export or canonical dataset hash includes Factor F rows,
  Factor F metadata, BOQ snapshots, or BOQ totals;
- anonymous/non-admin access succeeds unexpectedly;
- migration, test, build, smoke, hash, or export gate fails;
- approved P-20 identity/hash implementation or independent clean-rebuild
  evidence is missing/mismatched when clean-rehearsal or migration-fingerprint
  evidence is being accepted;
- a retryable UI/action path generates a fresh request ID after an uncertain
  response;
- reusable version logic remains hardcoded to `2568.1.0` contrary to ADR-003;
- version intent is not explicitly approved, the issued/currently-claimed
  registry is incomplete, the reviewed target is no longer next, a published or
  archived number would be reused, or an abandoned attempt still consumes its
  unissued target;
- live DB/RPC/RLS/concurrency, tracked artifact verification, admin UAT, or
  documented recovery evidence required for the next gate is missing;
- any Audit #29 C-01 through C-17 capability is visible as supported without
  its authoritative WP-6.6 implementation/evidence;
- an item/import path creates free-form taxonomy, accepts caller-owned code
  allocation/publisher identity, silently chooses a draft, or presents partial
  diff/readiness as final authority;
- two mutable drafts can exist globally, a draft/abandon action loses audit
  history, or publication can proceed without the exact final snapshot/lock
  state the operator reviewed;
- Recode/Retire can cross the mutation boundary without their exact summary,
  or Publish can call its RPC without a server-validated exact DB-read target
  version confirmation;
- Supabase advisors show a new or untriaged security/performance finding for
  the Phase 4 change set;
- unexpected active admin activity or simultaneous catalog edit is detected;
- owner approval is absent for the next Production action.

## 5. Phase 4-0 — documentation and data decisions

1. Confirm Factor F rollout closeout and production hotfix `016` before
   scheduling any Master Catalog Phase 4 database migration. Factor F `012`
   through `015` completed on 2026-06-29; hotfix
   `016_hotfix_preserve_boq_item_suffix.sql` completed on 2026-07-06; current
   default Factor F is `2569.0.0`, legacy BOQs were not version backfilled, and
   Master Catalog Phase 4 migrations must start at `017+`.
   Live BOQ counts may drift after the closeout; record current counts at every
   Production gate instead of reusing the closeout count.
2. Record owner approval of ADR-004 and implementation/local-rehearsal CR gate.
3. Review the 728-record reconciliation draft.
4. Resolve `ITEM-0131` / `ITEM-0139`: retain both distinct identities or retire
   the erroneous duplicate in the candidate; never merge UUID/history.
5. Correct/reject all 16 HDPE Crossing taxonomy conflicts.
6. Allocate approved treatment for 20 Production-only rows.
7. Keep the 17 unresolved supplement candidates deferred unless separate price
   authority exists; treat workbook `FTW-CON-002` only as P-07 typo-shadow
   evidence for Production `ITEM-0491`.
8. Approve the complete AAA/TTT dictionary and allocation rules.
9. Approve parser, payload, error-code, and canonical-hash contract.
10. Approve database/security, threat, and official-export contracts.
11. Use P-08 truthful publication metadata for legacy `2568.0.0`: effective
    `2026-01-01`, approval reference `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`,
    approval document date `2025-11-27`, and publisher snapshot
    `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`; do not invent generated backfill fields
    or reuse Factor F evidence.
12. Confirm `/CI/` is excluded from commits and identify approved derivative
   fonts/logo assets.
13. Complete the Phase 4 verification template baseline section.
14. Verify P-27 owner acceptance of Audit #29 C-01 through C-17 on exact
    application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`;
    this did not itself authorize G4, migration/bootstrap, or reset. Then verify
    P-28/G4 repository integration separately: bootstrap source includes exact
    accepted `020`. Finally verify P-29/G4E separately: exact checkout
    `15b707d443bec701f6b3a86aa7675ca1266604ba` passed the combined Local
    `009`-`020` bootstrap and live WP-7 technical evidence. This is not WP-8 or
    Production approval. Finally verify P-35 separately: unchanged amended
    `021` is now in bootstrap source after `020`. P-36 was separately approved
    after the reset warning and the integrated Local technical rehearsal passed
    on exact checkout `910cc3c`. Corrected intended-admin interaction/recovery
    and complete owner keyboard/focus/presentation UAT later passed on pushed
    checkpoint `f36d896d672609653de6634e307dcc44bce6d519`. That historical
    no-assistance scoring gap is retained in the evidence. The Owner later
    accepted the combined guided UI and developer fault-injection/cleanup
    package under an explicit variance on 2026-07-25; do not relabel it as
    independent. Verify the accepted rows in
    [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) before any
    separate P-12/P-14 request. See also
    [P-37 UAT/UX Note](./33-phase4-wp8-p37-uat-ux-correction-note.md).
15. Verify P-39R separately: the P-38 Card A session was safely cleaned and
    P-23.1 permanent reservation is historical. Corrected `022`, forward
    code-RLS correction `023`, and set-based placement invalidation correction
    `024` passed P39R-S, incremental P39R-L on exact pushed `b6d58ce6`, and the
    separately approved destructive P39R-C clean chain on exact pushed
    `10531610eac53a97c6ef8f9d06418766b58bee36`. Do not request P-37/P-12
    until owner P39R-U passes. Confirm one open draft globally, stale-draft
    abandonment, restore effect/pointer audit, role/state RLS, complete
    publication metadata, and replay identity. The completed P39R-C approval
    does not authorize a later reset or any Production action.

**Exit gate:** All documents have owner/reviewer decisions; no unresolved row
or taxonomy blocker.

## 6. Local foundation rehearsal

### 6.1 Refresh and restore evidence

1. Refresh a read-only Production schema/data snapshot using the approved
   process. Exclude password hashes, sessions, refresh tokens, OTP, MFA, and
   sensitive auth/audit payloads.
2. Record source counts and table checksums in the verification report.
3. Restore into the project-scoped Local Supabase environment.
4. Confirm the Local project identity and ports before running any SQL.
5. Confirm Local counts/checksums match the snapshot.

Use the installed Supabase CLI `--help` for exact current command syntax. Do not
guess CLI flags. Supabase's June 2026 self-hosted images default toward
Postgres 17; pin/rehearse the project's supported version and never point a new
major image at an incompatible existing data directory.

### 6.2 Rehearse additive migration

1. After explicit warning and owner approval for the destructive Local reset,
   start from the canonical bootstrap source that applies root `009`-`015`,
   production hotfix `016`, and Phase 4 `017`, `017a`, `018`-`026` in that
   order. Older pre-P-46 clean-chain evidence is post-`025` pre-bridge state
   and cannot be patched with `017a`. Current P-46 Local is bridge-aware
   through `025` but stopped with one evidence draft; do not clean it or patch
   it with `026`. A fresh explicitly approved reset is required. G4 repository
   integration placed accepted `020` in source on 2026-07-15, and P-29/G4E
   subsequently passed the combined clean execution. P-32 separately applied
   and proved amended P-18/WP-7.5 `021`; P-35 later placed that unchanged file
   in source. P-36 later supplied separate integrated execution evidence on
   exact `910cc3c` after explicit owner warning/approval. P39R-C later repeated
   the complete `009`-`024` chain on exact `10531610` after its own warning and
   approval. Its bootstrap, DB/RLS/concurrency/export/advisor/invariant evidence
   passed. P-41 then appended forward-only `025`; the separately warned and
   approved clean `009`-`015`, `016`, `017`-`025` execution passed on exact
   `adcca3939f3080cdf64bc6ad807051e9e85fed94`. Any future destructive rerun
   still requires a fresh warning and approval; none of these earlier decisions
   is reusable blanket reset permission.
2. If applying SQL manually for a focused rehearsal, apply hotfix `016` before
   any reviewed Phase 4A migration(s).
3. Verify all new tables, constraints, indexes, grants, RLS policies, functions,
   and triggers.
4. Confirm explicit Data API grants for required roles; new Supabase tables may
   not inherit automatic grants.
5. Confirm private-schema mutation functions are not exposed.
6. Backfill exactly 710 stable identities and legacy codes.
7. Backfill exactly 52 display categories or document the refreshed expected
   count.
8. Confirm pointer and legacy `is_default` mirror agree.
9. Run security and performance advisors.

### 6.3 Rehearse application workflow

With feature flag disabled by default:

1. Deploy/run the Phase 4 application locally.
2. Choose the approved annual/revision/patch intent. An annual effective year
   must be within base year +1 through +10 and must match the approved business
   year; do not bypass this guard with direct SQL. For the first structured
   rollout choose revision from `2568.0.0`, review the complete issued/currently-
   claimed registry, and accept `2568.1.0` only when it remains the system-planned
   target. Record the immutable draft reference separately.
3. Assert all 710 name/unit/material/labor/unit values are identical.
4. Apply approved code/category decisions; K fields must remain absent.
5. Complete WP-6.6 before WP-7: load/search the full catalog; expose exact item
   history/diff; open the one exact current-base workspace; make stale drafts read-only;
   resolve only approved versioned category/P-06 group IDs; allocate codes on
   the server; show complete
   server import diff/omissions with supported price evidence; derive publisher
   identity; require version archive reference; align readiness with publish;
   prove reactivate/withdraw and required schema constraints.
6. Test one manual add, edit, retire, recode, reactivate, and eligible withdraw
   with reasons.
7. Test Full and Supplement imports, including complete authoritative diff,
   exact omissions, and approved/missing new-row price evidence.
8. Before WP-7, run the implemented WP-6.5 P-18 guard and prove it rejects
   publishing any draft with
   add/supplement identities absent from the base version, returning
   `P18_PLACEMENT_REVIEW_REQUIRED` without pointer movement.
9. Before WP-7, prove an unchanged legacy-only clone can publish, then prove
   the WP-6.5 structured-code guard activates once the draft contains an active
   canonical `AAA-TTT-NNN` code and rejects a candidate whose active legacy
   `ITEM-####` rows exceed the recorded `ITEM-0139` exception.
10. Test duplicate request ID, stale lock version, stale base pointer, invalid
   price delta, invalid identity/code reuse, and unauthorized role.
11. Simulate an uncertain response after commit and prove the UI/action retry
    reuses the same operation ID and returns the prior result.
12. Run two-session publish/restore contention and bounded timeout fixtures.
13. Verify item history across a recode and correction action.
14. Prove all ADR-003 lanes, incomplete/stale sequence rejection, draft-reference
    uniqueness, target claim, audited target release and reuse after abandonment,
    permanent published/archived reservation, create race, and same-request replay.
15. P-18 is accepted and the P-32 placed-new-identity technical path has passed.
    Repeat that path in the separately approved WP-8 scope, generate Excel/PDF,
    and compare count/hash before any release-readiness claim.
16. Test audited pointer restore and verify historical BOQs are unchanged.
17. Rebuild from a clean Local reset and repeat the critical path only after
    the owner approves the Local Supabase reset.
18. Run
    `npm run db:local:smoke-master-catalog-wp7 -- --output tmp/master-catalog/wp7-evidence/<run>.json`
    and the focused WP-7 print/export contracts. Require all four approved
    suffixes, invalid/cross-version atomic rollback, anonymous/non-authorized
    denial, duplicate and selected-Factor-F copy behavior, publish/restore BOQ
    invariants, and exact Factor F/grant/RLS before/after evidence.

### 6.4 Repository gates

Run and record:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run audit:prod`
- database/security tests
- live DB/RPC/RLS/concurrency and timeout tests
- desktop/mobile browser QA
- tracked semantic Excel/PDF visual/hash verification
- documentation/authority consistency verification
- intended-admin UAT and 710-row performance evidence

**Exit gate:** Rehearsal and fresh reset both pass; no unresolved advisor or
regression blocker.

### 6.5 Historical Production readiness review after WP-8

This section preserves the PRE-P-12 entry checklist. P-12 later completed on
2026-08-17 in exact order `017` -> `017a` -> `018`-`026`, followed by the
checksum-verified v7 post-`026` backup/isolated restore. Do not rerun P-12 from
this historical checklist; P-13/P-14/P-14C/P-15 remain separate and
unauthorized.

After Local evidence is green, pause before Production and review the evidence
as a separate readiness package. This gives the owner, executor, and verifier
time to decide whether the rollout is truly ready before requesting P-12.

Before requesting P-12, record:

- WP-8 verification report evidence for clean Local reset and full workflow;
- current branch/commit, migration filename, migration SHA-256, and deployable
  application build evidence; record the actual deployed artifact fingerprint
  later at P-13 before accepting the deployment;
- hotfix `016` evidence in the remote ledger and clean Local bootstrap path
  before any Phase 4 `017+` evidence is accepted;
- fresh read-only Production baseline and schema drift result;
- validated secure custody of the existing Production DB credential, or a
  separately approved controlled reset with direct/intermittent consumer
  inventory and credential-update verification;
- fresh logical backup manifest plus restore-test evidence;
- BOQ regression evidence, including price-list version links and Factor F
  version/snapshot invariants;
- Factor F before/after assertion plan showing no Master Catalog step mutates
  Factor F default pointer, rows, hashes, grants, RLS, or BOQ bindings;
- stable operation-ID timeout/retry, structured log, and two-session
  concurrency evidence;
- P-20 clean-reset identity/hash portability evidence;
- ADR-003 reusable version evidence beyond the exact first candidate;
- tracked semantic artifact-verifier output;
- route failure-state, Thai recovery message, intended-admin UAT, and 710-row
  performance evidence;
- Audit #29 capability matrix showing C-01 through C-17 implemented/evidenced
  or an affected control explicitly excluded from release visibility;
- authority/document consistency result;
- security/performance advisor results with no unresolved Phase 4 blocker;
- migration-stage feature-flag evidence proving the Phase 4 UI remains
  disabled: all three Phase 4 rows absent before `017`, only
  `catalog_admin_enabled=false` after `017`, `017a`, `018`, and `019`, and all
  three rows present with boolean `false` after `020`-`026`;
- the new operational `catalogAuthorityFingerprintSha256`, derived only under
  separate read-only authorization from the allowed Production snapshot
  restore or fresh in-window Production/restore evidence, with its exact
  query/evidence source and external Production approval binding;
- owner go/no-go for P-12 Production migration.

Record these rows in
[P-12 Production Readiness Package #39](./39-phase4-p12-production-readiness-package.md).
Package preparation is not P-12 approval.

P-13 deploy, P-14 feature enablement, and P-15 publication are requested only
after the immediately preceding gate passes. P-15 remains separate and requires
the exact final catalog metadata, diff/count/hash, export, and filing evidence.

Do not request or run P-12 if any evidence is missing, stale, failed,
ambiguous, or different from the reviewed plan.

## 7. Production preflight — read only

Run immediately before the approved window and record exact output:

```sql
select count(*) as price_rows,
       count(distinct item_code) as distinct_codes,
       count(*) filter (where item_code is null or btrim(item_code) = '') as missing_codes,
       count(*) filter (where item_name is null or btrim(item_name) = '') as missing_names,
       count(*) filter (where unit is null or btrim(unit) = '') as missing_units,
       count(*) filter (where material_cost is null or labor_cost is null or unit_cost is null) as missing_costs,
       count(*) filter (where unit_cost is distinct from material_cost + labor_cost) as unit_cost_mismatches
from public.price_list;
```

```sql
select v.version_string, v.status, v.is_default, d.version_id
from public.price_list_default_version d
join public.price_list_versions v on v.id = d.version_id;
```

Expected baseline at document preparation: 710 rows, 710 codes, zero missing or
mismatch rows, and one `2568.0.0` active/default pointer. Live approved changes
must be reconciled; never force a stale expectation.

Record the post-Factor-F baseline in the same preflight:

```sql
select
  (select v.version_string
   from public.factor_reference_default_version d
   join public.factor_reference_versions v on v.id = d.version_id) as factor_default_version,
  (select count(*) from public.factor_reference_versions) as factor_version_count,
  (select count(*) from public.factor_reference_rows) as factor_reference_rows,
  (select count(*) from public.boq) as boq_count,
  (select count(*) from public.boq where price_list_version_id is null) as boq_missing_price_version,
  (select count(*) from public.boq where factor_reference_version_id is not null) as boq_bound_factor_version;
```

Also capture the mixed BOQ population:

```sql
with classified as (
  select
    b.id,
    fv.version_string as factor_version,
    case
      when b.factor_reference_version_id is not null then 'version_bound'
      when b.factor_f is null then 'legacy_missing_factor_f'
      when b.factor_f_raw is not null
        and b.factor_f_lower_cost is not null
        and b.factor_f_upper_cost is not null
        and b.factor_f_lower_value is not null
        and b.factor_f_upper_value is not null
        and (
          (b.factor_f_lower_cost = 5000000 and b.factor_f_upper_cost = 5000000)
          or (b.factor_f_lower_cost = 700000000 and b.factor_f_upper_cost = 700000000)
          or b.factor_f_lower_cost < b.factor_f_upper_cost
        )
        then 'legacy_usable_snapshot'
      else 'legacy_partial_snapshot'
    end as factor_state
  from public.boq b
  left join public.factor_reference_versions fv
    on fv.id = b.factor_reference_version_id
)
select factor_state, coalesce(factor_version, '-') as factor_version, count(*) as boq_count
from classified
group by factor_state, factor_version
order by factor_state, factor_version;
```

Expected policy, not fixed counts:

- current Factor F default is an active version, currently `2569.0.0`;
- `boq_missing_price_version = 0`;
- legacy BOQs may remain unbound to Factor F by design;
- version-bound BOQs may exist and must keep their current
  `factor_reference_version_id`;
- no Phase 4 step may backfill or mutate legacy Factor F version bindings.

Also verify:

- migration ledger matches repository history;
- no Phase 4 object already exists unexpectedly;
- all current RLS/security invariants from Phase 1B remain intact;
- no Factor F change is scheduled or bundled into this Master Catalog window;
- `factor_reference_versions`, `factor_reference_rows`,
  `factor_reference_default_version`, and BOQ Factor F immutability triggers are
  present and will not be modified by the Master Catalog migration;
- no unexpected active admin session is editing catalog data.

## 8. Backup gate

1. Before requesting P-12, prove the recovery procedure with one authorized
   read-only Production application-only backup and an isolated PostgreSQL 17
   restore. This readiness rehearsal passed on 2026-07-26 and is not the final
   rollback source.
2. Inside the separately approved P-12 window, create a fresh encrypted logical
   backup immediately before migration because Production remains live.
3. Include application schemas `public, private`; retain the
   `public.price_list_audit_logs` definition but exclude its data; do not dump
   Auth or Storage data.
4. Create a manifest with timestamp, source project, scope, row counts, source
   before/after hashes, dump SHA-256, tool/image versions, and exclusions.
5. Restore into an ephemeral non-Production PostgreSQL 17 target with no
   network or host port. If Auth data remains excluded, use only UUID-only
   ephemeral stubs needed to validate application foreign keys; do not treat
   them as an Auth recovery.
6. Require matching comparable business counts/hashes, validated constraints,
   enabled triggers, valid catalog/BOQ/Factor F links, and valid default
   pointers.
7. Record backup location by reference; do not commit secrets or Production
   dumps. The 2026-07-27 Owner decision permits encrypted same-device custody
   only from approved P-12 execution through completion of separately approved
   P-15 publication verification. It does not waive fresh capture,
   restore/checksum, manifest, or sign-off.
8. Owner/executor/independent verifier sign the final in-window backup gate.
9. After `017`, `017a`, and `018`-`026` and the immediate
   ledger/identity/owner/ACL/RLS/advisor/BOQ/Factor-F/flag verification pass,
   create and checksum-verify a
   post-migration application-only backup plus manifest while all Phase 4 flags
   remain disabled. Complete this checkpoint before requesting P-13.

No verified restore means no Production migration.

The 2026-07-27 readiness-custody check is complete: after the Owner explicitly
authorized a temporary Docker stop, the encrypted bundle was detached without
force, reopened read-only from Keychain custody, and all eight
`SHA256SUMS` entries passed. It was detached again without force and remains
unmounted. Docker and the seven Local Supabase containers returned healthy/up;
read-only Local invariants remained `2568.0.0`/710, zero drafts, all flags
false, BOQ 198/1,547 with zero unversioned BOQs, and Factor F
`2569.0.0`/36. This closes only the readiness-rehearsal custody check. The
fresh final in-window backup, restore/checksum, manifest, and sign-off remain
mandatory. The time-bounded single-device-loss acceptance expires when the
earlier of (a) the start of the post-publication checkpoint after separately
approved P-15 verification or (b) seven days (168 hours) after the recorded
P-12 execution start timestamp. If a planned pause will exceed 24 consecutive
hours, create and checksum-verify an encrypted independent copy of the latest
verified rollback package before the pause. If an unplanned pause reaches 24
hours, stop before any further gate and complete that copy before resuming. An
early copy does not waive the final post-publication backup/copy/checksum/
custody gate. If the copy cannot be completed, rollout remains stopped; there
is no automatic extension.

### Post-Phase 4 DR follow-up (not a P-12 blocker)

After P-15 closeout, or as separate work if the rollout is abandoned, define
business-approved RPO/RTO, recurring checksum-verified encrypted off-device
application-database backups, retention, monitoring, and restore drills.
Separately inventory Auth recovery/session implications and Storage object
bytes when those services are in use. The current application-only package is
not full-service DR. This follow-up neither expands nor blocks P-12 and
authorizes no Production/Auth/Storage access; use
[Backlog #42](./42-phase4-post-phase4-disaster-recovery-backlog.md) for the
future decision record.

## 9. Historical P-12 execution procedure — additive database migration

This procedure is retained as the immutable operational record of the one
completed P-12 execution. The exact `017` -> `017a` -> `018`-`026` chain and v7
post-`026` backup/isolated restore passed. Do not rerun it; the next Production
gates are P-13/P-14/P-14C/P-15, and none is authorized.

### Before execution

- Confirm explicit owner approval for this migration window.
- Confirm reviewed migration filename and SHA-256.
- Confirm the migration-stage flag contract before and after every file:
  before `017`, rows for `catalog_admin_enabled`,
  `catalog_new_identity_enabled`, and `catalog_retirement_enabled` are all
  absent; after `017`, `017a`, `018`, and `019`, only
  `catalog_admin_enabled` exists and its JSON value is boolean `false`; after
  each of `020`-`026`, all three rows exist and each JSON value is boolean
  `false`. At no checkpoint may any of the three values be boolean `true`.
- Record `session_user`, `current_user`, and the approved Production
  object-owner role before `017`. The same `current_user` must execute
  `017`, `017a`, and `018`-`026` because default privileges are scoped to the
  executing role. Any identity/owner drift stops execution; do not improvise
  `ALTER OWNER` or ACL changes.
- Freeze Supabase CLI `2.107.0`, PostgreSQL major `17`, and the exact execution
  path/account/client timeout. Do not upgrade or improvise the tool path inside
  the window.
- Confirm each reviewed file keeps its own `BEGIN`/`COMMIT`, 10s migration
  `lock_timeout`, and 60s `statement_timeout`, except `020` at 90s.
- Confirm exact `017`, `017a`, `018`-`026` contains no
  concurrent/nontransactional index operation.
- Confirm the chosen path handles the 394,076-byte `020`, records one
  identifiable remote migration-ledger row per file, and has safe
  cancel/failure semantics. For P-12, Production SQL Editor, MCP, direct
  `psql`, `db push`, `db pull`, and linked diff are prohibited. Follow the
  exact reviewed CLI path in
  [Runbook #41](./41-phase4-p12-cli-execution-runbook.md) only after its human
  and window fields are approved.
- Review the exact freeze and rollback procedure in
  [Package #39 section 4.1](./39-phase4-p12-production-readiness-package.md).

### Execute

1. Apply exactly one reviewed file at a time through the approved Supabase path
   in `017`, `017a`, `018` through `026` order.
2. Do not modify the SQL interactively except to stop safely.
3. After each committed file, record tool, executor, start/end time, result,
   remote migration ledger ID, unchanged session identity, and the object
   ownership/ACL delta for every object created or replaced by that file. The
   record must also prove the stage-appropriate flag state: admin-only and
   false after `017`, `017a`, `018`, and `019`, then all three present and
   false after `020`-`026`. After `017`, prove the transient global function
   default is absent and no private routine exists. After `017a`, prove exact
   global owner-only function defaults, owner-only-or-absent `public`/`private`
   schema defaults, intended owner-plus-`authenticated` public-stub grants, and
   denial of `PUBLIC`, `anon`, and `service_role`. From `018` onward, retain
   those denials on every Phase 4 routine. The independent verifier approves
   that record before the executor prepares the next file.
4. On an error before `COMMIT`, a missing/unexpected flag row, or any Phase 4
   flag value of boolean `true`, stop immediately. Treat a pre-commit SQL error
   as rolling back the current file.
   Previously committed files remain applied; do not run reverse SQL or continue
   to the next file.

### Immediate verification

- New tables/columns/constraints/indexes match the reviewed schema.
- RLS enabled on every new `public` table.
- Required `authenticated` grants exist; `anon`/`PUBLIC` writes do not.
- The final full owner/ACL/RLS inventory matches the reviewed postconditions:
  `PUBLIC`/`anon` denial and exact `authenticated`/`service_role` grants; no
  object or default privilege was created under an unapproved owner.
- Backfill covers exactly 710 identities and legacy codes.
- No duplicate version/code or version/identity pairs.
- Current `2568.0.0` pointer and current application behavior are unchanged.
- After `026`, all three Phase 4 flag rows exist and each JSON value is boolean
  `false`.
- `is_default` mirror equals the singleton pointer.
- Existing BOQ counts/version links are unchanged.
- Existing `boq.factor_reference_version_id` values and legacy nulls are
  unchanged.
- Factor F default pointer, published rows, and dataset hashes are unchanged.
- Security/performance advisors have no new blocker.

If a post-commit issue exists, keep the flag disabled and forward-fix with a
new reviewed migration. Do not edit the applied migration file.

### Post-migration backup handoff before P-13

After immediate P-12 verification passes and while all Phase 4 flags remain
disabled, create the post-migration application-only logical backup and
manifest using the same `public, private` scope and
`public.price_list_audit_logs` data exclusion as the pre-migration package.
Exclude all Auth and Storage data. Checksum-verify the package and record its
custody. Do not request P-13 until this checkpoint passes.

This handoff is not a prerequisite to begin an approved P-12 migration and does
not authorize P-13. It is a hard precondition for the separate P-13 request.

### Historical P-50D V3/P-50C gate before P-50G and P-50H

**Canonical sequence marker:** `P51_CANONICAL_PRODUCTION_SEQUENCE_V3`

Route recorded at this historical checkpoint: `P-51D -> P-50R SOLO complete -> one exact P-50D V3 Owner
confirmation (ratification), also accepting existing verified P-50C only as
local review evidence -> separately authorized local release commit/push +
CI/Preview -> P-13/P-14/P-14C bounded window -> P-15 -> closeout -> P-49`.

If the first P-15 closeout has not finished by 2026-08-25 23:59:59 +07,
stop before continuing this sequence and obtain fresh explicit Owner reapproval
of the P-51 waiver. No calendar extension is automatic.

P-50R SOLO and the bounded P-50C technical/data review were complete. The one
pending decision at this checkpoint was exact Owner confirmation (ratification) of the frozen V3
UUID/hashes, which also accepts the existing P-50C package only as local review
evidence. There is no separate future P-50C build gate in the current route.
The confirmation does not authorize candidate application, a rebuild, Git/CI,
database/Production/network, or any P-13 through P-15 action. Any byte, scope,
or target drift requires a new bounded review and explicit authority.

For the current package, preserve the baseline value binding,
comparison-evidence-set hash, selected delta-manifest hash, Owner authority,
ADR-003 decision and derived target, repository/source-tree identity, candidate
dataset hash, complete diff/counts, and reproducibility results. For the solo
pre-Git P-50C checkpoint, deterministic JSON candidate/diff/manifest evidence
plus the focused invariant test is sufficient. Generate review-only Excel/PDF
marked `DRAFT – ห้ามใช้อ้างอิง` from the later exact application/Production
draft before P-15; official exports remain post-publication only.

The completed P-50C technical build must not be extended to read or mutate
Production, create a Production draft, publish,
move the pointer, change BOQ/Factor F data or flags, or overwrite historical
evidence. Freeze the identifier-binding manifest before the separately
authorized local release commit/push and CI/Preview gate. Technical completion
or later local-evidence acceptance does not authorize that Git publication or
the bounded P-13/P-14/P-14C window.

Historical working result: exact P-50D request `P50D-REQ-20260823-V3` freezes only
UUID `f2662c71-a6e5-407e-8456-8608e304b43b` and at this checkpoint remained unauthorized pending
exact Owner confirmation (ratification). Offline candidate
`P50C-CANDIDATE-20260823-V1` was technically built, but acceptance only as local
review evidence is pending. Its 710-row candidate SHA-256 is
`d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`;
its one-row diff SHA-256 is
`72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18`;
and its manifest SHA-256 is
`d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5`.
The other 709 authority-value rows are unchanged, and name/unit/material
changes are zero. Published/current `2568.0.0` remains unchanged at
`0/1763/1763`; only the provisional local `2568.1.0` candidate has
`0/1764/1764`. A fresh issued/claimed registry check remains required. See
[P-50C Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md).
The candidate exists and technical/document remediation is complete, but the
repository remains on review HOLD until the Owner provides exact P-50D V3
confirmation (ratification). Commit/push is not the next authorized action.
Only after confirmation and a
fresh passing small repository gate may a separate local commit/push and
CI/Preview request be prepared.

<!-- P50C_RUNBOOK_CURRENT_RESULT_V1 {"schema":"conduit-boq/p50c-runbook-current-result/v1","currentAsOf":"2026-08-23","p50dRequestId":"P50D-REQ-20260823-V3","p50dApproved":true,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cOfflineBuildComplete":true,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","changedValueRowCount":1,"unchangedValueRowCount":709,"publishedCatalogChanged":false,"targetRegistryCheckPending":true,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

The `P50C_RUNBOOK_CURRENT_RESULT_V1` marker above is retained as the same-day
interpretation that triggered the independent review. The correction below
supersedes its current authority without rewriting the completed technical
build.

<!-- P50C_RUNBOOK_REVIEW_CORRECTION_V1 {"schema":"conduit-boq/p50c-runbook-review-correction/v1","recordedAt":"2026-08-23","supersedesCurrentAuthorityOf":"P50C_RUNBOOK_CURRENT_RESULT_V1","p50dRequestId":"P50D-REQ-20260823-V3","exactOwnerRatificationPending":true,"p50dApproved":false,"p50cTechnicalBuildOccurred":true,"p50cCandidateAccepted":false,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","nextOwnerDecision":"ratify-or-hold-exact-p50d-v3","localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## 10. Production application deployment

One exact bounded-window decision may cover the sequential P-13 flags-off
deploy/smoke, P-14 minimum-admin UAT, and P-14C creation/review of exactly one
real unpublished Production draft. It must name every sub-scope, role, window,
flag matrix, stop condition, and rollback action. Each checkpoint advances only
on PASS; authority for the bounded window never includes P-15.

P-13 must name the exact application/source commit, deployment fingerprint,
active administrator, low-traffic window, rollback owner, monitoring interval,
and stop conditions. Before any deploy:

1. Capture a fresh read-only Production state/traffic manifest covering the
   migration ledger and reviewed migration hashes, current catalog pointer/
   version/count/dataset hash, zero working drafts, all three exact Phase 4 flag
   rows, BOQ and Factor F invariants, current deployment fingerprint, active-user
   posture, and monitoring baseline.
2. Reverify the checksum, isolated-restore evidence, location, access, and
   custody of the existing P-12 post-`026` application-only backup. P-13 does
   **not** authorize creating another logical backup, refreshing its contents,
   or changing any database/configuration state during this preflight.
3. Confirm the fresh manifest matches the expected P-12 closeout and that
   `catalog_admin_enabled=false`, `catalog_new_identity_enabled=false`, and
   `catalog_retirement_enabled=false` as JSON booleans.
4. Confirm CI/Preview passed on the exact deployment commit and that the
   deployment fingerprint binds to those same reviewed bytes and the accepted
   P-50C package.
5. Deploy the compatible application with all three Phase 4 flags false.
6. Smoke current Dashboard, Price List, BOQ list/search/create/edit/duplicate,
   print “แบบ ปร.1”, and exports.
7. Smoke one version-bound BOQ and one legacy snapshot-only BOQ where available;
   confirm Factor F version labels/snapshot behavior are unchanged.
8. Confirm labels/metrics outside approved Phase 4 UI are unchanged.
9. Confirm no browser console/server error and no secret in client bundles.
10. Run active-admin Phase 4 read smoke while the feature remains hidden from
   ordinary users.

On failure, revert the application deployment. The additive database schema is
left in place and the feature flag stays disabled.

## 11. Feature enablement

Within the bounded P-13/P-14/P-14C window, the P-14 checkpoint must name both
the temporary matrix and the final success/failure matrix. For the current
first-publication path, the exact temporary matrix is:

- `catalog_admin_enabled=true`;
- `catalog_new_identity_enabled=false`; and
- `catalog_retirement_enabled=false`.

The exact final matrix after failure or completed P-15 closeout is all three
flags boolean `false`. If the accepted candidate actually needs new-identity or
retirement capability, stop and obtain an amended P-14 decision naming the
different exact matrix and its prerequisite governance; do not infer it.

1. Obtain explicit Owner approval for those exact temporary and final matrices,
   including authority to restore the final matrix on failure or after closeout.
2. Enable exactly the approved temporary matrix for the named active admins.
3. Verify route/menu authorization, empty/loading/error states, responsive UI,
   keyboard/focus behavior, and NT CI assets.
4. Verify Thai failure/recovery messages and request-ID support correlation.
5. Have an intended admin complete the approved UAT script without developer or
   SQL assistance.
6. Create the P-14 UAT test draft using the guarded ADR-003 planner; do not move
   the Production pointer or apply real candidate content.
7. Audited-abandon that UAT draft with a specific reason. Record its immutable
   draft reference, request/audit IDs, terminal lock, and released unissued
   target; never delete or silently reuse the draft.
8. Prove zero working drafts, unchanged current pointer/version/count/hash,
   unchanged BOQ/Factor F invariants, and the exact temporary flag matrix before
   advancing to P-14C.
9. Verify non-admin users cannot access admin data/actions.

If any smoke test or cleanup check fails, stop and restore the exact final
all-false matrix under the P-14 authority. P-14 does not authorize preparation
of the real Production candidate, publication, or a pointer change.

## 12. P-14C Production candidate preparation and P-15 request gate

P-14C is the Production data-write checkpoint in the same bounded window, and
it may begin only after P-14 passes and proves its UAT draft was audited-
abandoned, zero working drafts remain, and the current pointer/version/count/
hash is unchanged. The bounded-window decision must name the approved base/
pointer, ratified P-50D V3 disposition and exact selected manifest, accepted
P-50C candidate package, guarded ADR-003 target decision, operator/verifier,
permitted mutation operations, and stop/
cleanup contract. P-14C authorizes exactly one real Production draft, its
reviewed mutations, and review-only DRAFT artifacts. It does not authorize
publication, pointer movement, official exports, BOQ repricing/backfill, Factor
F mutation, or a flag change.

At entry, re-prove zero working drafts, the expected pointer/count/hash, the
accepted P-50C identifier-binding manifest, and the exact P-14 temporary flag
matrix. Then execute the following only within the approved P-14C scope:

1. Select the owner-approved business intent and let the guarded planner clone
   current `2568.0.0` into the displayed target. Expect `2568.1.0` only when it
   is not issued or currently claimed; record both the immutable draft reference
   and target for every later step. Publication, not draft creation, issues it.
2. Run the 710-row preservation assertion before applying codes.
3. Apply the approved reconciliation only.
4. Confirm Full/Supplement mode and row outcomes.
5. Review the complete server-recomputed diff for
   add/update/retire/recode/unchanged/price and exact Full omissions.
6. For Full import, confirm every omission. If retirement count reaches
   `max(10, ceil(2% of active base))`—15 for 710 rows—match the typed count and
   stored owner approval reference.
7. Require the price-change set to equal the exact ratified P-50D V3 manifest:
   only UUID `f2662c71-a6e5-407e-8456-8608e304b43b`, labor/unit
   `1763/1763 -> 1764/1764`, with material unchanged at `0`. Reject every
   adjacent, missing, or extra price delta and use only the accepted P-50C
   candidate evidence.
8. Complete approval reference, approval document date, effective date,
   version-level physical archive reference, reason, and any separately governed
   business approver. Confirm the publisher actor snapshot comes from the
   authenticated active-admin profile.
9. If import was used, have the verifier independently hash the filed source
   workbook and match the recorded client-computed fingerprint.
10. If add/supplement/new identity rows are present, require accepted P-18,
    WP-7.5 placement revision/review, inherited-relative-order and exact export
    evidence. Otherwise keep publication blocked by the WP-6.5 guard and hide
    Add/Supplement at feature enablement.
11. If any inactive/retired rows are present, confirm P-19 official PDF
    rendering/exclusion policy before filing field-facing artifacts.
12. If the exact candidate begins structured-code rollout, confirm the WP-6.5
    guard evidence, including the approved temporary `ITEM-0139` exception and
    no other active legacy `ITEM-####` rows. Do not apply this rollout-specific
    rule to an unchanged legacy-only clone.
13. Confirm expected lock version and current pointer/base match.
14. Confirm P-20 identity/hash portability evidence matches the exact reviewed
    migration/candidate contract.
15. Confirm the reusable version path follows ADR-003 and the exact candidate
    version is supplied by approved release metadata, not a code constant.
16. Generate review-only Excel/PDF artifacts marked
    `DRAFT – ห้ามใช้อ้างอิง`; record their binary hashes separately from and
    bind them to the exact candidate dataset hash. Do not label, file, or
    distribute them as official exports.
17. Freeze the exact Production draft reference, target, base/pointer,
    mutation request IDs, final `reviewLock`, dataset hash, complete diff/counts,
    approval/source identifiers, and DRAFT artifact hashes in the P-14C
    evidence. Any later mutation invalidates this review and requires a new
    review lock and evidence package.
18. Prepare a separate P-15 request naming that exact immutable draft reference
    and final reviewed lock, including any mass-retirement total. Stop with the
    draft unpublished until P-15 is explicitly approved.

Before this P-15 can be requested, consume the completed P-50R evidence and an
exact ratified P-50D decision. Request `P50R-SOLO-REQ-20260821-V1` completed
offline with `PASS_FOR_P50D_REQUEST`; its immutable package covers 28/28 PDF
pages, 67 deltas, 245 exceptions, and zero blockers. Published/current
`2568.0.0` remains authority for all 710 current names, units, and prices and
remains unchanged. Once exactly ratified, P-50D V3 limits `SELECTED-DELTA` to UUID
`f2662c71-a6e5-407e-8456-8608e304b43b`, and P-50C offline candidate
`P50C-CANDIDATE-20260823-V1` passed with exactly one money delta:
`0/1763/1763 -> 0/1764/1764`. The other 709 rows retain baseline values; the
other 48 external-source candidates remain unselected. Apply only that hashed
subset after the exact old-value check and reproduce the accepted candidate
and diff before entering P-14C. P-14C must regenerate its own complete
diff/count/hash/review evidence and DRAFT-only artifacts. Official exports and
the post-publication backup
do not exist until the P-15 closeout. See
[P-50 Plan #46](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md),
[consumed P-50R Request/Result #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md),
[historical P-50D Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md),
[consumed baseline-first Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md),
[consumed exact Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md),
[P-50C Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md), and
[P-51 Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).
Any adjacent, missing, or extra price delta is a hard stop.

## 13. Publish and immediate closeout

P-15 is a separate confirmation outside the bounded P-13/P-14/P-14C window; no
earlier PASS authorizes it. P-15 must name the exact Production draft reference
and final `reviewLock`,
reviewed target, current base/pointer, exact approved selected manifest or
approved empty baseline set, rollback target, named canaries, exact temporary/final flag matrices, and
one publish operation request ID. Re-read the draft immediately before submit;
any reference, lock, pointer, dataset hash, or manifest mismatch is a hard stop.

1. Publish the exact reviewed draft and switch the pointer atomically once with
   the approved operation request ID. If the response is uncertain, preserve
   that ID and inspect audit/state before retry; never create a second ID for
   the same intended publish.
2. Record the result, published version ID, pointer change-set/audit ID, item
   count, dataset hash, authenticated actor snapshot, version archive reference,
   and timestamp. Verify one singleton pointer to the exact approved result and
   synchronized legacy flags.
3. Verify the prior published version remains readable and immutable.
4. Generate official Excel and PDF only from the published database version.
5. Reconstruct the Excel dataset hash from `ข้อมูลตรวจสอบ`; verify PDF
   generation rechecked and printed the same database item count/dataset hash.
6. Visually inspect stamp, page headers, Thai font, totals/numeric cells, and
   clipping. Compute the final Excel and saved-PDF binary SHA-256 values and
   record them separately from the canonical dataset hash.
7. File the official exports and physical approval/source evidence.
8. Run the named new/old/duplicate/open-tab BOQ canaries. Prove a new BOQ binds
   to the new current catalog as approved; existing and duplicated BOQs retain
   their source catalog/Factor F bindings and snapshots; an already open create
   tab revalidates the pointer before save; and edit/print/export remain usable.
9. Restore and verify the exact final flag matrix:
   `catalog_admin_enabled=false`, `catalog_new_identity_enabled=false`, and
   `catalog_retirement_enabled=false`.
10. Record the final invariant snapshot: singleton pointer plus published
    version/count/dataset hash, zero working drafts, publish audit/change set,
    unchanged historical BOQ bindings/snapshots, unchanged Factor F pointer/
    rows/hash, unchanged grants/RLS, and no monitored auth/profile/RPC drift.
11. Only after Steps 1-10 pass, create the post-publication encrypted logical
    backup and manifest, copy it to the approved independent Owner-controlled
    failure domain, verify the package checksum, complete and verify the
    isolated restore, and record access/custody. This is where the time-bounded
    single-device-loss residual expires.
12. Complete the verification report and release note. A failed export, canary,
    flag restoration, or invariant stops closeout; do not certify or take the
    final backup as successful closeout evidence until the approved response
    and full ordered verification pass.

## 14. Rollback and recovery

| Situation | Response |
|---|---|
| Migration fails before commit | Transaction rolls back; stop and investigate |
| Additive schema issue after commit | Flag disabled; reviewed forward-fix migration |
| Application regression | Revert deployment; schema remains compatible |
| Feature-only UI issue | Disable feature flag |
| Candidate validation fails | Keep draft; correct through audited change; do not publish |
| Add/supplement/new identity rows lack P-18 placement approval | Keep draft reviewable; do not publish; guard must reject with `P18_PLACEMENT_REVIEW_REQUIRED` |
| Structured-code candidate has unapproved active legacy `ITEM-####` rows | Keep draft; correct mappings or return to owner; do not publish |
| Inactive/retired rows lack P-19 PDF policy | Do not file official field-facing PDF; get owner/data-custodian policy first |
| Publish fails in transaction | No pointer change; inspect request/result and retry only when safe with the same operation ID for the same intended payload |
| Publish response is lost after commit | Inspect pointer/change set by request ID; retry only with the same ID so the prior result is returned |
| Published version is business-invalid | Audited pointer restore to prior published version; create correction version |
| Export hash mismatch | Do not distribute; investigate canonicalizer/export and regenerate |

Pointer restore must:

- accept request ID, reason, and target published version;
- lock and update pointer plus legacy `is_default` mirror atomically;
- append a restore change set;
- leave published rows and historical BOQs untouched.

## 15. Closeout evidence

- Completed [verification report](./13-phase4-verification-report.md)
- Completed [release note](./16-phase4-release-note-template.md)
- Migration/deployment identifiers and file/commit fingerprints
- Authority/document consistency result and tracked artifact-verifier version
- Pre/post row counts and invariant results
- Advisor results and accepted exceptions
- Feature flag and pointer final state
- Official Excel/PDF names, hashes, and physical file references
- Full-import retirement count and owner approval reference, when threshold
  applies
- Pre-migration, post-migration, and post-publication logical-backup manifests,
  plus final external-copy checksum/custody evidence
- Owner/executor/verifier signatures
- UAT reviewer, representative task results, error-recovery result, and
  performance baseline

## 16. P-50D V3 exact Owner ratification receipt mirror — 2026-08-24

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

<!-- P50D_V3_RUNBOOK_RATIFICATION_RECEIPT_V1 {"schema":"conduit-boq/p50d-v3-runbook-ratification-receipt/v1","recordedAt":"2026-08-24T00:44:15+07:00","canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","canonicalReceiptDocument":"./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md","resolvesRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dRequestId":"P50D-REQ-20260823-V3","confirmationReceived":true,"exactOwnerConfirmationPending":false,"exactOwnerRatificationPending":false,"p50dDecisionApproved":true,"p50dV3Confirmed":true,"p50dV3Ratified":true,"p50dAuthorized":true,"p50dAuthorityScope":"decision-record-only","p50dFurtherActionAuthorized":false,"selectedIdentityId":"f2662c71-a6e5-407e-8456-8608e304b43b","selectedLegacyItemCode":"ITEM-0429","selectedTargetItemCode":"COR-PB0-002","baselinePrice":[0,1763,1763],"candidatePrice":[0,1764,1764],"p50dManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cTechnicalBuildOccurred":true,"p50cDataReviewPassed":true,"p50cCandidateAccepted":true,"acceptsCandidateAs":"local-review-evidence-only","p50cFurtherExecutionAuthorized":false,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","unchangedBaselineRowCount":709,"unselectedExternalCandidateCount":48,"retainBaselineEvidenceCount":18,"authorityExclusionCount":17,"explicitlyUnselectedAdjacentItems":["ITEM-0427","ITEM-0430","ITEM-0431"],"rowClassification":"same-basis-correction","overallReleaseClassification":"structured-code-revision-with-one-selected-price-delta","currentPublishedVersion":"2568.0.0","currentPublishedCatalogChanged":false,"provisionalTargetVersion":"2568.1.0","targetRegistryCheckPending":true,"historicalZeroPriceGateSupersededForSelectedLocalCandidateUuidOnly":true,"historicalBoqRepriceAuthorized":false,"changesPriorBusinessIntent":false,"nextSafeStep":"none-stop-after-recording-ratification","smallRepositoryGateRequired":false,"separateGitCiAuthorizationRequired":true,"gitCiAuthorizationGranted":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"sourceMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"supersedesCurrentAuthorityOf":"P50C_RUNBOOK_REVIEW_CORRECTION_V1"} -->
