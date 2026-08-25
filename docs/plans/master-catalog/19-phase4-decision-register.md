# Phase 4 Decision Register

> **Owner Option A / PDF presentation decision — current (2026-08-25):** The
> Owner selected **Option A** for the successor `2568.1.0` review candidate:
> use all `49` frozen P-50R external-source price corrections. D002 currently
> contains only the already reviewed ITEM-0429 correction, so this choice adds
> `48` corrections to the business scope; ITEM-0615 is specifically
> `2869/7091/9960 -> 2869/7427/10296`. This decision does not itself authorize
> applying those `48` rows to D002 or any other Production/catalog object.
>
> For PDF presentation only, rows of one display category must be contiguous;
> category order follows first occurrence in canonical global order, rows
> within a category retain canonical `display_order`, and the visible sequence
> restarts at `1` per category. A multi-page category repeats its heading with
> `(ต่อ)` while continuing the same category-local sequence. Global
> `display_order`, DB row order, canonical hashing, Excel ordering/numbering,
> identities, BOQs, and Factor F remain unchanged. Local/offline docs, code,
> tests, and review artifacts are approved; D002/Production mutation,
> candidate application, P-15, and publication are not approved here.

<!-- P50_OPTION_A_PDF_PRESENTATION_DECISION_V1 {"schema":"conduit-boq/p50-option-a-pdf-presentation-decision/v1","recordedAt":"2026-08-25","priceScope":"OPTION_A_ALL_49_FROZEN_P50R_EXTERNAL_SOURCE_CORRECTIONS","approvedPriceCorrectionCount":49,"existingD002AppliedCorrectionCount":1,"additionalApprovedBusinessScopeCount":48,"item0615CurrentPrice":[2869,7091,9960],"item0615ApprovedPrice":[2869,7427,10296],"businessScopeSelected":true,"candidateApplicationAuthorized":false,"existingD002ReviewLock":2,"result80PreservedAsImmutableHistory":true,"pdfPresentationRefinementApproved":true,"pdfGroupSameCategoryContiguously":true,"pdfCategoryOrder":"first-occurrence-in-canonical-global-order","pdfWithinCategoryOrder":"canonical-global-display-order","pdfVisibleSequence":"restart-at-1-per-category-and-continue-across-pages","pdfContinuationHeadingRequired":true,"pdfCoverageRowCount":710,"globalDisplayOrderMutated":false,"databaseOrderMutated":false,"canonicalHashContractChanged":false,"excelChanged":false,"historicalBoqRepriceAuthorized":false,"localOfflineDocsCodeTestsReviewArtifactsAuthorized":true,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"deployAuthorized":false,"p15Authorized":false,"publicationAuthorized":false,"automaticNextStep":false} -->

**Status:** Owner-approved decision source of truth for Phase 4 governance;
pending decisions still require owner resolution at the stated gate

**Prepared:** 2026-06-22

**P-50I execution result overlay — current (2026-08-24):** exact request
`P50I-REQ-20260824-V1` and Proposal #59 SHA-256 `dad63f43...` were approved
and consumed once. Preflight, exact patch application, and target hash passed.
The required local gate then stopped at `21/22` authority tests and `30/31`
exact P-50 tests: the raw marker-name count included two examples inside the
proposal's own frozen diff plus the one actual EOF marker. Anchored count `1`,
focused ESLint PASS, and deterministic P-50C PASS show a bounded assertion
defect, not data corruption. [Result
#60](./60-phase4-p50i-local-validation-failure-result-record.md) is canonical.
No stage/commit/push/new CI/Preview occurred. Local/upstream/live remote remain
`2b45f9b1679d12caac933568e89e1065d74dbd74`, index empty; the exact P-50I
test target is retained uncommitted. P-50I cannot be replayed. P-13-P-15,
database/Production, deployment, candidate application, and publication remain
unauthorized. The next decision is only review of [P-50J Proposal
#61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md).
Proposal preparation is not execution authority. This overlay supersedes live
status wording below while preserving it as chronology.

**Historical pre-P-50H authority overlay (2026-08-24; superseded by the P-50I
result overlay above):** P-12 is **COMPLETE**: exact
`017` -> `017a` -> `018`-`026`, objective closeout, and checksum-verified v7
post-`026` backup/isolated restore passed. P-13/P-14/P-14C/P-15 remain
unauthorized. The exact P-50D V3 Owner confirmation (ratification) is recorded
under [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md):
P-50D V3 is complete only within `decision-record-only` scope, and the bounded
local P-50C data candidate is accepted only as local review evidence. Published
`2568.0.0` remains unchanged; provisional `2568.1.0` still requires the fresh
registry check. The Owner later approved exact request
`P50G-REQ-20260824-V1`, bound to Proposal #55 SHA-256
`5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc`.
That one-time authority was consumed once and the offline/read-only gate passed;
see [Result #56](./56-phase4-p50g-small-repository-gate-result.md). P-50G cannot
be replayed. [P-50H Proposal #57](./57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md)
and its manifest were prepared for separate review at this checkpoint; P-50H
execution and all operational actions were unauthorized then. Historical
P-01/WP-8/PRE-P-12/HOLD/request entries below preserve chronology and do not
override the current P-50I result overlay.

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

> **P-50G result overlay (2026-08-24):** exact request
> `P50G-REQ-20260824-V1` was approved using Proposal #55 full SHA-256 and
> consumed once. [Result #56](./56-phase4-p50g-small-repository-gate-result.md)
> records PASS for `3` focused files / `30` tests, focused lint, deterministic
> P-50C check, parser syntax, and scoped diff-check. The approval cannot be
> replayed. PASS permits only preparation of P-50H Proposal #57 plus its exact
> manifest for separate Owner review. It does not authorize P-50H execution,
> protected-path access, Git stage/commit/push, CI/Preview, candidate
> application, database/Production/network, P-13 through P-15, deployment,
> publication, waiver extension, or automatic continuation.

**Reliability plan alignment recorded:** 2026-07-11 — owner instructed the
Phase 4 plan/authority documents to be aligned before further implementation to
reduce drift after production hotfix `016`. This authorizes this docs-only plan
amendment; it does not resolve pending business decisions or authorize any
Local reset or Production action.

**P-18 planning alignment recorded:** 2026-07-12 — owner authorized adding the
proposed P-18 review contract and WP-7.5 to the plan after the Admin UI review.
This records a plan path, not acceptance of the five placement business rules,
not authorization to implement migration `021`, and not a Local reset or
Production decision.

**P-30 WP-7/P-18 decision recorded:** 2026-07-15 01:37 +07 — after reviewing
the passed P-29/G4E evidence and the full-versus-limited release tradeoff, the
owner accepted WP-7 and approved all five P-18 V1 placement rules in
[Review Note #28](./28-phase4-p18-placement-governance-review-note.md). This
authorizes the bounded WP-7.5 Local-only source implementation for migration
`021`, its exact RPC/read model, Thai-first placement workspace, tests, and
authority documentation. It does not authorize adding `021` to bootstrap,
resetting or mutating Local Supabase for evidence, WP-8 execution, P-19,
Production access/write, feature enablement, publication, new Factor F work,
or expansion of hotfix `016`; those gates remain separate.

**P-31 WP-7.5 Source/Static acceptance recorded:** 2026-07-15 10:24 +07 —
after reviewing the owner/developer recommendation, the owner accepted exact
checkpoint `4e3574a31a2697f4d727acabc8f55f34a4233bff` for commit/push. Migration
`021` remains outside bootstrap and unapplied. This decision does not authorize
resetting or mutating Local Supabase, live DB/browser evidence, WP-8, P-19,
Production access/write, feature enablement, publication, new Factor F work,
or expansion of hotfix `016`; those gates remain separate.

**P-32 WP-7.5 Local live gate recorded:** 2026-07-15 — the owner explicitly
approved the warned Local reset, bootstrap through `020`, separate `021` apply,
and bounded live DB/RLS/concurrency/hash/export/browser evidence. The first
runtime attempt failed closed with PostgreSQL `42704`; cleanup restored the
baseline. The same-scope schema-qualified fix-forward and replacement clean
chain then passed on DB source `80b2574` and UI checkpoint
`99fa56c3d3c68e1886fbd308d8536e598eaee02f`, including
audited cleanup to `2568.0.0`, zero drafts, and all disabled flags. P-32 does
not add `021` to bootstrap or cross WP-8, P-19, Factor F/hotfix, feature, or
Production gates.

**P-33 WP-7.5 technical acceptance recorded:** 2026-07-15 13:54 +07 — after
reviewing the P-32 replacement evidence and the owner/developer UX analysis,
the owner accepted the exact bounded WP-7.5 technical checkpoint. This marks
WP-7.5 technically complete but does not certify intended-admin usability or
authorize `021` bootstrap inclusion, a Local reset, WP-8 execution, P-19,
feature enablement, publication, Factor F/hotfix expansion, or Production.
Truthful local dirty state, review-by-exception, keyboard equivalence, measured
710-row scale, and independent intended-admin comprehension are hard WP-8/P-14
release gates. Drag and drop remains optional; general inherited-row reorder
remains a future Change Request.

**P-34 WP-8 placement UX source gate recorded:** 2026-07-15 — the owner
authorized the recommended source-only hardening after the P-33 docs-first
review. Exact application checkpoint
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` implements truthful accepted-versus-
locally-dirty status, versioned recoverable browser choices and guarded
navigation, direct exception filters/counts, native keyboard-complete
before/after radios, complete affected-category/immediate-neighbor confirmation,
and memoized/deferred list derivation. Repository tests, TypeScript, lint, and a
network-enabled production build passed. This starts WP-8 source/static only;
it does not add `021` to bootstrap, reset or mutate Local Supabase, accept live
performance/accessibility/intended-admin UAT, enable Add/Supplement, publish,
touch Production, reopen Factor F, or expand hotfix `016`.
The direct before/after presentation in this historical checkpoint was later
rejected by the first P-37 intended-admin comprehension session and is
superseded at the presentation layer by Note #33; the accepted P-18 database
contract and P-34 technical provenance remain unchanged.

**P-35 WP-8 bootstrap source-integration gate recorded:** 2026-07-15 — after
reviewing the recommended remaining sequence, the owner instructed the team to
proceed with documentation alignment, exact `021` bootstrap source inclusion,
repository verification, commit, and push. This authorizes repository/source
work only. It does not authorize `npm run db:local:bootstrap`, any Local reset or
write, live WP-8 evidence, feature enablement, publication, Production access or
write, P-19, new Factor F work, or expansion of hotfix `016`. P-36 is reserved
for the separately warned destructive Local execution; P-37 is reserved for the
later WP-8 owner accept/hold decision. Exact source checkpoint
`01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a` subsequently passed the authorized
repository/static scope without Local DB or Production execution.

**P-36 WP-8 destructive Local execution gate recorded:** 2026-07-15 21:00 +07
— immediately after the owner was warned that `npm run db:local:bootstrap`
resets all Local Supabase, the owner explicitly instructed the team to continue.
This authorizes one integrated Local-only reset and the named WP-8 live evidence
from the exact pushed P-35 lineage, followed by audited cleanup to the disabled
baseline. It does not authorize Production access/write, feature enablement,
publication, P-19, new Factor F work, hotfix `016` expansion, P-37 acceptance,
or a source-scope change inferred from a failed gate.

**P-36 integrated Local technical result recorded:** 2026-07-15 — exact gate
and execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6` passed the
clean `009`-`015`, hotfix `016`, and Phase 4 `017`-`021` chain plus integrated
DB/RLS/concurrency/P-20/WP-7/WP-7.5/export/advisor/repository/realistic-scale
route-render and disabled-baseline cleanup evidence. Production was not
touched. Browser automation could not dispatch React/Radix client state
changes, so P-37 HOLD was recommended at that checkpoint until independent
intended-admin live interaction, keyboard, recovery, and error-comprehension
UAT passed. See
[P-36 Owner Review Note](./32-phase4-wp8-p36-owner-review-note.md). This result
does not itself record the P-37 owner decision or authorize any Production
gate.

**P-37 first intended-admin UAT result recorded:** 2026-07-17 — the owner
opened the real 710+18 Local placement route without developer or SQL guidance
and could not determine the task from the direct reference-item and
before/after controls. The session stopped before final confirmation and made
no placement RPC effect. The bounded working-tree correction replaces that
presentation with final-neighbor previews and one insertion-gap editor while
preserving the category/anchor/relation DB payload. At that historical
checkpoint P-37 was HOLD for owner re-UAT, complete native-button traversal,
exact candidate provenance, and an explicit decision. See
[P-37 UAT and UX Correction Note](./33-phase4-wp8-p37-uat-ux-correction-note.md).
Production remains unauthorized.

**P-37 Local technical continuation recorded:** 2026-07-18 — without a reset,
the corrected `2568.13.0` fixture passed controlled retryable stale-lock
rejection, one accepted 18-row placement, exact-request idempotent replay,
accepted-state desktop/mobile route readback, and audited abandon/disabled-
baseline cleanup. This closes the technical stale/confirmation/replay/cleanup
evidence only. Browser controls in the final session focused or changed native
DOM values without dispatching the React/Radix state changes, so at that
checkpoint independent keyboard and leave/reload recovery UAT was not inferred.
Corrected source
checkpoint `e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512` is pushed. P-37 remained HOLD
at that checkpoint until the Note #33 exit gates and an explicit Owner
accept/hold decision.

**P-37 final no-reset recovery re-UAT recorded:** 2026-07-18 — fresh Local
`2568.14.0` passed leave/return/reload recovery, gap-list `ArrowDown`/`Enter`,
final review, reset, and cleanup without a placement submission. Pushed source
checkpoint `96c2ac6892e8ffe9d020c2dff641a847157cd4b2` corrected and
re-verified the stale recovery alert found by reset-all. At that checkpoint,
native-button traversal and explicit owner acceptance still remained.
Production remained unauthorized.

**P-37 owner keyboard/final-presentation UAT recorded:** 2026-07-18 — fresh
no-reset Local `2568.15.0` completed visible `Tab`/`Shift+Tab`, native-button
`Enter`/`Space`, insertion-gap, same-gap sibling-order, and editor/final-review
focus-return gates without submitting the placement batch. Final review reuses
the previous/new/next preview and labels the DB-derived final position
separately from the authority-owned item name. Pushed checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` passed full verification; audited
cleanup restored the exact disabled baseline. The owner did not submit the
final placement batch through the UI. P-37 remained HOLD at that checkpoint
for that submission, broader independent core-admin UAT, three safe-error
recoveries, and named performance evidence. Production remained unauthorized.

**P-37 closure-evidence correction recorded:** 2026-07-18 — line-by-line
comparison of the WP-8 exit gate with the P-36/P-37 evidence found that the
former only-owner-decision conclusion exceeded the record. The passed source,
technical, recovery, keyboard, focus, presentation, and cleanup evidence is
retained. [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) now owns
the open final owner UI submission, broader independent UAT, three safe-error
recoveries, and named performance observations. C-12 authority alignment later
passed its executable checks. This is a docs/evidence correction only and
authorizes no Local reset or Production work.

**P-38 bounded no-reset Owner UAT continuation recorded:** 2026-07-18 — after
the C-07 through C-11 evidence gap was explained, the owner instructed the team
to continue with the recommended path. Evidence reconciliation is complete in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md).
This authorizes authority-document alignment, exact Local read-only preflight,
temporary Local admin/new-identity fixture preparation, the written Cards A-G,
response-loss fault setup, audited cleanup, verification, commit, and push.
The corrected E-01/E-02 recipes, hash-bound untracked inputs, tracked
fail-closed commands, and passing read-only baseline are recorded in
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md).
Exact P-40 checkpoint `dc83c35` is now committed/pushed and its separate
developer browser QA used the bounded no-reset fixture successfully. The first
fresh independent scored Card A later stopped under P-42 after an unintended
Local publication; Cards B-G did not continue.
It does not authorize `npm run db:local:bootstrap`, any Local reset, successful
catalog publication, P-37 acceptance, Add/Supplement Production enablement,
P-19, Production access/write, Factor F work, or hotfix `016` expansion.

**P-41 P-38 discovery correction recorded:** 2026-07-19 — the owner instructed
the team to continue with the recommended Local-only correction after guided
discovery exposed UAT-06 through UAT-08: valid full-label category keys failed
the former 64-character app ceiling, retirement-disabled Full preview was
incorrectly coupled to persistence, and draft-only withdrawal left a hidden
order gap. The bounded decision keeps the existing architecture/DB guards,
uses a shared 500-character category-key bound plus live preflight, returns a
complete read-only/no-Apply preview, rejects a gapped draft in the client, and
appends forward-only migration `025` for atomic compaction. Closing discovery
drafts, restoring the disabled baseline, incremental Local `025` apply, and
focused tests are authorized/completed. This does not accept P-37, authorize a
Local reset, clean-chain execution, Production, P-19, BOQ/Factor F work, or
hotfix expansion; those gates remain separate.

**P-42 final-review snapshot correction recorded:** 2026-07-19 — the owner
confirmed the false post-success wording **อ้างอิงเวอร์ชันฐานเก่า** and directed
the bounded correction. [Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md)
records that the review URL did not durably identify its reviewed lock and that
published review reused draft-only state. P-42 binds draft review to
`reviewLock`, hard-stops old tabs without publication controls, and renders
terminal versions as accurate read-only history. The database lock guard was
not bypassed and remains authority. Local `2568.5.0` is preserved as incident
evidence; no ad hoc reverse mutation is authorized. A new destructive Local
bootstrap requires its own warning and owner approval after the P-42 source is
verified, committed, and pushed. Production remains untouched.

**P-42 recovery execution recorded:** 2026-07-20 — after the exact correction
was pushed, the owner separately approved one warned destructive Local
bootstrap. Exact pushed source
`f8c670901997a4e6663db7c4db1218efc03d51c6` restored the canonical
`2568.0.0`/710 disabled baseline and prepared immutable session
`session-p42-scored-20260719-f8c6709.json`. Cards A-G then passed their
functional contracts with owner guidance and developer assistance for Cards
F-G. Cleanup abandoned D001/D002, retained their audit history and reusable
unissued target `2568.1.0`, and restored pointer `2568.0.0`, 710 rows, zero
working drafts, all catalog flags false, and unchanged BOQ/Factor F invariants.
This is not an independent Owner score: bounded findings P42-UAT-B01,
C01/C02, D01/D02, E01, and F02 were subsequently corrected. The completed
functional Card B-E evidence is retained; four post-correction Owner
spot-checks plus cleanup remained open at that checkpoint, so P-37 remained
**HOLD**. No full replay, further reset, or Production action was authorized.

**P-42 bounded finding correction recorded:** 2026-07-20 — the owner approved
the recommended correction rather than risk-accepting the seven named
operator findings. Exact evidence checkpoint
`1c901855a32b100013fb5c9472c2e909e3dd1c59` and exact bounded source checkpoint
`bdc104f77f18ea8fc776950259bc25e68c2fd42a` now cover allocated-code feedback,
three-step import wording, nested placement scrolling, explicit stale-choice
discard, print/save-PDF wording, and a dedicated uncertain-outcome error code
that retains the same request ID. Repository gates and clean read-only Local
status passed. This closes implementation/disposition of P42-UAT-B01,
C01/C02, D01/D02, E01, and F02; it does not close the independent Owner
evidence gate. The Owner retained the completed functional Card B-E evidence
and approved proportional revalidation of only the four corrected surfaces in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md)
Section 1.2, followed by clean disabled-baseline cleanup. No full Card B-E
replay, migration, Local reset, or Production action was authorized.

**P-42 proportional spot-check correction recorded:** 2026-07-22 — the Owner
approved the recommended bounded correction after Spot-check 2 exposed
P42-UAT-C03/G01. The real **ยืนยันและบันทึกลงฉบับร่าง** action remains hidden
after failed server validation; only the always-visible third progress label is
aligned to that exact wording. The tracked harness now binds one of two closed
scenarios into immutable schema-2 session metadata: `full-owner-uat` preserves
the historical two-attempt P-39 proof, while `bounded-spot-check` requires one
audited-abandoned attempt. A scenario cannot be changed during status or
cleanup. Exact implementation
`44f54a72b03549de995b431d6705ec1b2eeb3fa6` adds no migration, reset,
Production action, capability, or business workflow. Spot-check 1 is retained;
only Spots 2-4 and corrected cleanup are authorized on a fresh exact-source
session. The legacy D003 session remains immutable evidence: cleanup restored
flags before refusing closure, and readback confirmed pointer `2568.0.0`/710,
zero drafts, unchanged BOQ/Factor F, and Production untouched.

**P-42 D004 placement-modal correction recorded:** 2026-07-22 — D004 passed
the corrected Spot-check 2: all three import progress labels matched, E-01
returned `IMPORT_PRICE_AUTHORITY_REQUIRED`, the actual persistence action was
absent, and no import was written. Real Browser Spot-check 3 then showed that
the nested popover still did not wheel-scroll inside the placement modal. Exact
checkpoint `16e88c6487307c4bb0606a048dc53e05e9dcee18` replaces it with a
searchable list inside the modal boundary. The Owner confirmed physical wheel
scrolling and outside-click dismissal on identical tree content. D004 was
prepared from the preceding source, so that confirmation is correction
evidence and exact-source Spot-check 3 remained open at that checkpoint. D004 was
audited-abandoned; schema-2 cleanup passed with one attempt and restored pointer
`2568.0.0`/710, zero drafts, all flags false, unchanged BOQ/Factor F, and
Production untouched. The authorized next step at that checkpoint was only
exact-source Spots 3-4 plus final cleanup. This authorized no reset, migration,
publication, Production, P-19, BOQ, Factor F, or hotfix work.

**P-42 final exact-source spot-check and cleanup recorded:** 2026-07-23 —
no-reset D005 used exact pushed source
`6fe3a6a1b2c04a418187167c143960ba412672da` and immutable session
`session-p42-final-spotcheck-20260722-6fe3a6a.json`. The Owner physically
scrolled the modal-contained placement list and changed one browser-only gap
without saving a placement batch. The response-loss check retained form values
and recovered request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with the same
request/response ID, `duplicateRequest=true`, one committed version, and no
second effect. D005 was audited-abandoned; schema-2 cleanup restored pointer
`2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547, zero unversioned
BOQs, and Factor F `2569.0.0`/36 without reset or Production access.
Checkpoint `b639c03` keeps normal and recovered success feedback visible across
refresh. D005 did not separately capture the post-reload
stale-choice-discard banner before cleanup. The later authorized no-reset D007
replay on exact pushed `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`
displayed that notice, restored the current suggestion, wrote zero placement
reviews, and cleaned to the disabled baseline. C-08 is passed; P-37 remains
HOLD only for explicit Owner accept/hold. “ทำต่อ” is not recorded as
acceptance, and no
Production, P-12, deploy, enablement, publication, P-19, Factor F, or hotfix
decision is inferred.

**P-37 Full-import post-save correction authorized and recorded:** 2026-07-24
— the Owner requested a real approved-file save check. D008 completed the
710-row database apply but exposed `P37-UAT-C04`: revalidation remounted the
lock-keyed client panel before its success effect could navigate, so the form
silently returned to Step 1 and showed a misleading browser-file badge. The
Owner approved the bounded correction. Confirmed success now redirects from the
Server Action after revalidation, the selected-file badge depends on the actual
current file input, and the exact draft workspace shows durable
filename/count/revision evidence with review/re-import actions. Fresh no-reset
D009 previewed in 187 ms, applied in 275 ms, returned `303` to
`?notice=import-applied`, and displayed the expected result. D008/D009 were
audited-abandoned; final readback restored pointer `2568.0.0`/710, zero working
drafts, all flags false, unchanged BOQ/Factor F, and no Production action.
Exact correction checkpoint
`df44b827b290933463da5e14fa9125314660022a` preserves the source, tests, and
aligned authority evidence. The explicit P-37 accept/hold decision remains
separate. This adds no migration, reset, database
authority, Factor F, hotfix, or Production scope.

**P-37 Owner acceptance recorded:** 2026-07-25 — the Owner explicitly
confirmed that button-by-button live guidance during the Local UI run was
requested and intentional. The Owner accepts the combined Owner-operated
guided UI evidence and developer-operated fault-injection/cleanup evidence as
sufficient for WP-8/P-37 against exact implementation checkpoint
`df44b827b290933463da5e14fa9125314660022a`. This decision does not relabel the
evidence as independent or no-assistance, and it does not waive the database,
authorization, idempotency, audit, stale-lock, or readiness controls. No SQL,
ad hoc repair, guard bypass, Local reset, or Production action was used for
this decision. WP-8 is complete. Acceptance permits only a later P-12
readiness request; Add/Supplement remains hidden until P-14, and Production
migration/deploy/enablement/publication, P-19, Factor F, and hotfix work remain
unauthorized.

**P-12 readiness package preparation recorded:** 2026-07-25 — after WP-8/P-37
acceptance, the Owner instructed the team to proceed with the recommended
readiness preparation. Exact application checkpoint
`6827ebc1a729b7675fe91db58e129c9381b33ddb` passed 36 files/233 tests,
TypeScript, ESLint with zero warnings, authority 710/65/17, and the
network-enabled production build. Fresh Local read-only checks confirmed
pointer `2568.0.0`/710, zero drafts, all three flags false, unchanged BOQ and
Factor F baselines, RLS/direct-write boundaries, and the accepted `017`-`025`
migration hashes. [Readiness Package #39](./39-phase4-p12-production-readiness-package.md)
records a HOLD because fresh Production baseline/ledger/advisor evidence,
backup/restore proof, executor details, and an exact window approval are still
absent. This preparation authorizes no Production access or write, Local reset
or migration, deploy, enablement, publication, P-19, Factor F, or hotfix work.

**P-12 bounded readiness evidence window recorded:** 2026-07-26 — the Owner
authorized Production read-only database/ledger/advisor evidence and backup
only through an approved secure path with restore restricted to isolated
non-Production. The read-only database portion completed without a Production
write: PostgreSQL 17.6 points to `2568.0.0` with 710 complete distinct authority
rows whose value hash
`sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`
matches Local; 232 BOQs/2,183 items have no missing or cross-version catalog
link; Factor F remains `2569.0.0`/36 with no partial snapshot. The expected
`009`-`016` ledger is complete with no unexpected later entry. The actual
hotfix row is `20260706090832 hotfix_preserve_boq_item_suffix`, and the
Production function body exactly matches migration `016` at SHA-256
`7187ffb568617783146d4b5f8db8021147cd212a578e655879c49f32f9fb54f0`.
Fresh advisors were captured and classified as pre-Phase-4 baseline.

The Data API row is now Ready: an Owner-authorized Management API `GET` at
2026-07-26 19:29 +07 shows exposed schemas `public, graphql_public` and
`private_exposed=false`, without emitting a token or `jwt_secret` or changing
configuration. Exact Supabase PostgreSQL `17.6.1.063` synthetic and Local
application-only restore rehearsals also passed, and an AES-256 encrypted
off-repository sparse bundle is prepared with Keychain-held credentials.

The exact primary pooler host was subsequently read through the
Owner-authorized Management API. Frozen Supabase CLI `2.107.0` maps it to
Session target
`postgres.otlssvssvgkohqwuuiir@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`,
and a TCP-only reachability check passed without authentication.

At 2026-07-26 21:47 and 22:04 +07, two candidate database passwords supplied
one at a time through the native secure prompt and temporary login-Keychain item
failed the authentication/read-only identity query with PostgreSQL `password
authentication failed`. Each rejected item and temporary `.pgpass` was deleted
immediately.

Immediately before 2026-07-26 22:48 +07, a third Owner-entered candidate passed
the same bounded read-only identity query against Production PostgreSQL 17.6
and is retained only in the macOS login Keychain. No password was emitted or
written to Git, backup evidence, chat, command arguments, or shell history. No
password reset occurred.

The already authorized application-only readiness backup then completed with
no Production write. The AES-256 sparse bundle now contains package
`pre-p12-readiness-20260726T154815Z`: 352,642-byte custom dump SHA-256
`9d306a478b8ada65d0a32ab31bca19587c55efa3ae979ae4dd8ad5871d575932`,
234 BOQs, 2,270 BOQ items, 710 price-list rows, one catalog version, two Factor
F versions, and 73 Factor F rows. Read-only source metrics before and after the
dump were identical.

The dump restored successfully into exact image
`public.ecr.aws/supabase/postgres:17.6.1.063` in an ephemeral container with no
network or host port. Auth/Storage data remained excluded; 20 UUID-only
ephemeral Auth stubs satisfied application foreign-key validation and contained
zero sensitive payload. Comparable business counts/hashes matched and all
constraint, trigger, version-link, Factor F snapshot, and pointer checks passed.
The container was deleted. Earlier isolated failures were tooling discoveries
and failed closed; no attempt contacted or changed Production.

The evidence window remains **HOLD**, but no longer for the readiness
backup/restore. Open rows are the guarded-definer/Auth/dead-assignment and
single-device custody disposition, named executor/independent verifier/exact
execution path, exact window, and separate P-12 go/no-go. A fresh backup is
still mandatory immediately before migration because Production remains live.
This historical checkpoint was later amended by the custody and
managed-residual decisions recorded below. It is not P-12 and authorizes no
Production DDL/DML, migration, deploy, feature flag, publication, P-19,
Factor F, or hotfix change.

**PRE-P-12 recovery-custody and remote-status checkpoint recorded:**
2026-07-27 — the Owner explicitly authorized stopping Docker temporarily only
to complete the post-write encrypted-bundle custody check and then restore
Local services. Fresh inspection found Docker holding read handles. Docker was
quit gracefully; handle count reached zero; the bundle was detached without
force, reopened read-only at a newly created mount point using the Keychain-held
passphrase through standard input, and reported encrypted/read-only. All eight
portable `SHA256SUMS` entries passed. The bundle was detached again without
force and remains unmounted. Docker and all seven Local Supabase containers
returned healthy/up; read-only Local invariants repeated `2568.0.0`/710, zero
drafts, all three flags false, BOQ 198/1,547 with zero unversioned BOQs, and
Factor F `2569.0.0`/36. No Local reset or data write occurred.

At the same checkpoint, exact pushed readiness/documentation HEAD
`07d1d3399cea363a2ff923c6393d4a3259ce623c` matched the remote branch and
retained exact application candidate
`5068f944af2aa3fe8446c77c8ae8d48673cb260b` as an ancestor. Remote combined
status reported `Vercel=success`; the PR-triggered GitHub Actions run list was
empty. This truthfully closes the remote exact-head status-record gate without
claiming that GitHub Actions lint/test/build ran and without accepting a P-13
deployment artifact.

The mechanical execution freeze recorded at this historical checkpoint used
Supabase CLI `2.107.0`, PostgreSQL major 17, and the then-current ten-file
`017`, `017a`, `018`-`025` candidate. P-47 later extends the current candidate
to eleven files by appending `026` without changing any reviewed earlier hash.
The per-file transaction, 10s migration lock timeout, 60s statement timeout
except `020` at 90s, stop-after-current-file rollback, and forward-fix-only
post-commit recovery remain unchanged.
The named executor, independent verifier, exact execution path/account/client
timeout/ledger behavior, after-each-file checks, final-backup custody
disposition, maintenance window, and separate P-12 decision remained HOLD at
this checkpoint. This checkpoint authorizes no Production access or change.

**PRE-P-12 Phase 4 flag-stage gate recorded:** 2026-07-28 — flag absence is
the expected Production state before `017`; it must not be misreported as
three existing false rows. Before `017`, rows for `catalog_admin_enabled`,
`catalog_new_identity_enabled`, and `catalog_retirement_enabled` must all be
absent. After `017`, `017a`, `018`, and `019`, only
`catalog_admin_enabled` may exist and its JSON value must be boolean `false`.
After each of `020`-`026`, all three rows must exist and each JSON value must
be boolean `false`. Any boolean `true`, missing required row, or prematurely
present row stops execution. This is a mechanical stage gate only; it
authorizes no Production access, migration, flag change, deploy, enablement,
or publication.

**PRE-P-12 time-bounded backup-custody decision recorded:** 2026-07-27 — the
Owner explicitly accepts the single-device-loss residual only from the start
of an explicitly approved P-12 execution through completion of separately
approved P-15 publication verification. During that bounded sequence, fresh
encrypted application-only backups may remain on the same physical computer.
The decision does not convert readiness package
`pre-p12-readiness-20260726T154815Z` into the final rollback source and does
not waive the fresh pre-migration backup, isolated restore/checksum, manifest,
or Owner/executor/independent-verifier sign-off. After `017`, `017a`, and
`018`-`026` immediate verification passes and while all Phase 4 flags remain
disabled, a
post-migration application-only backup plus manifest is mandatory before any
P-13 request. The separately approved P-15 checkpoint still requires the final
post-publication backup and independent encrypted-copy/checksum/custody
closeout.

The same-device acceptance expires at the earlier of:

1. the start of the post-publication checkpoint after separately approved P-15
   verification; or
2. seven days (168 hours) after the recorded P-12 execution start timestamp.

If a planned pause will exceed 24 consecutive hours, an encrypted independent
copy of the latest verified rollback package must be created,
checksum-verified, and recorded before the pause. If an unplanned pause reaches
24 hours, stop before any further gate and complete that copy before resuming.
An early copy does not waive the final post-publication
backup/copy/checksum/custody gate. If the copy cannot be completed, rollout
remains stopped; this decision contains no automatic extension.

This closed only the PRE-P-12 final-backup-custody **decision** at the
2026-07-27 checkpoint. The Owner amended its absolute limit on 2026-07-28 as
recorded above. It authorizes no Production access or change.

**PRE-P-12 managed-residual decision recorded:** 2026-07-28 — the Owner
accepted the recommended bounded dispositions without authorizing P-12 or any
Production action:

1. Retain the seven currently `authenticated`-callable guarded
   `SECURITY DEFINER` functions for the P-12 through P-15 release sequence.
   Preserve `anon` denial, the current active-role/ownership/target/self guards,
   and the unexposed `private` schema. A fresh post-migration advisor diff is
   mandatory, and any new or untriaged finding stops execution. Review and
   minimize `get_user_role(uuid)` and `is_admin(uuid)` after Phase 4 with new
   RLS/regression evidence before replacement.
2. Accept disabled leaked-password protection for P-12 and P-13 only under the
   current Supabase Free plan. It is a separate Auth configuration opportunity,
   not a defect in the Phase 4 database sequence. P-14 remains blocked until the Owner
   either approves a separate plan/upgrade and enablement or explicitly accepts
   the P-14/P-15 residual after reviewing available compensating controls. This
   decision authorizes no Auth change or P-13/P-14 action.
3. Accept the unused `private.catalog_placement_state.v_row_count` assignment
   as low-risk managed code-quality debt. Do not edit accepted migration `021`
   or add migration `026` solely to remove it; remove it with the next
   substantive replacement of `catalog_placement_state`. This historical lint
   disposition authorizes no other migration and reserves no migration name.

These decisions close only the three managed-residual decision rows. At that
2026-07-28 checkpoint, the working-tree authority sync still required review
and separate Git authorization. Independent review/static checks later passed,
and P-44 froze its exact reviewed executable migration/application/bootstrap/
generator/runner content at clean pushed commit
`ed94c0304be2741217c7ea2c36322b426de1dfe5` with no GO marker, PR, or
protected-untracked-path change. Exact-head Remote evidence records
`Vercel=success` and no PR-triggered GitHub Actions run. P-45 then authorized a
bounded authority/status-only descendant commit/push from `ed94c03`; P-46
conditionally authorizes exactly one destructive Local bootstrap only after
that descendant is clean, pushed, HEAD-equal-to-upstream, and Remote-ready.
At that PRE-P-12 checkpoint, P-12 remained **HOLD** for the resulting P-45 HEAD/Remote evidence, the P-46
Local result, a
named human executor and a distinct named human independent verifier, approved
`session_user`/`current_user` and object-owner role, exact execution
path/account/client timeout and ledger behavior, after-each-file ownership/ACL
checks, exact maintenance window, and a separate P-12 go/no-go.

**PRE-P-12 disposable finding and Option B decision recorded:** 2026-07-28 — a
rehearsal-only CLI evidence kit assembled from the dirty working tree applied
`017` to a disposable, loopback-only, network-isolated PostgreSQL 17 database.
The disposable ledger recorded
`20260728001700_master_catalog_phase4_foundation`, then the mandatory
postflight hard-stopped because the private-function default ACL was absent.
No `018`-`025` migration ran, and neither Local Supabase nor Production was
migrated or written. PostgreSQL 17 confirms that the schema-scoped default
privilege revoke in reviewed `017` cannot remove the global built-in
`PUBLIC EXECUTE` default on functions. See
[Private-Function Default-Privilege Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
for the options. The Owner selected Option B for repository
design/implementation and review: a separate bridge migration ordered
immediately after `017` and before `018`; an after-`025` correction is unsafe.
Migration `018` creates twelve private `SECURITY DEFINER` helpers
without explicit per-function revokes and grants `authenticated` `USAGE` on
schema `private`; without the effective global default denial, those helpers
inherit `PUBLIC EXECUTE`. Production has not received `017`, and Production
Data API does not expose `private`, so no Production exposure was introduced;
the reviewed ACL contract fails on the historical sequence. The selected
candidate is
`017a_master_catalog_phase4_global_function_default_privileges.sql`, ledger
`20260728001730_master_catalog_phase4_global_function_default_privileges`,
SHA-256
`12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`.
It removes inherited `PUBLIC` and API-role defaults, including
`service_role`, at global, `public`, and `private` scopes. Migration `026`
remains unrelated and unreserved. This decision is repository-candidate
authority only, not P-12 or rollout authority. Do not edit `017` or `018`,
weaken the verifier, continue the historical disposable chain, apply `017a`
after Local `025`, or request P-12. At that 2026-07-28 checkpoint, independent
review and separate Git authorization were still next. The review/static checks
later passed, and P-44 froze the reviewed content at clean pushed `ed94c03`;
its Remote status is `Vercel=success` with no PR-triggered GitHub Actions run.
P-45 authorizes only the exact 11-file authority/status descendant
commit/push. That clean pushed Remote-ready descendant becomes the actual
kit-bound source/tooling HEAD while `ed94c03` remains its immutable reviewed
content-freeze ancestor. P-46 conditionally authorizes exactly one invocation
of `npm run db:local:bootstrap` at that HEAD. The command invokes
`supabase db reset --local --no-seed`, destroys/rebuilds all Local Supabase
data, then must apply `009`-`015`, `016`, `017`, `017a`, `018`-`025` and pass
consolidated security/business invariants. Production is untouched. On failure
or drift, preserve external evidence and stop; no retry, patch, or second reset
without fresh Owner approval. Kit generation, pass 1, independent contract
freeze, and pass 2 remain separately gated.

**P-46 result and P-47 repository-only correction recorded:** 2026-07-29 —
P-45 completed at pushed/upstream-equal source/tooling HEAD
`d92d8ced42fc882481ebc2c4579adcf1edbebea7`. The single P-46 authorization was
then consumed exactly once. Canonical Local bootstrap completed through `025`,
but the consolidated WP-6.5 verification failed closed when authenticated
execution of the public `SECURITY INVOKER` wrapper reached
`private.catalog_action_error(uuid,text,text,boolean,jsonb)`: the helper's
owner-only `EXECUTE` ACL correctly denied the caller. Evidence was preserved in
the external package
`p46-local-bootstrap-20260729T121635Z-d92d8ce`; the diagnosis SHA-256 is
`12d9bb1241ec7680bd00c9d2c3b41c22fd47c0180c1a9559f5cd93ec3a1027f8`
and the package-status SHA-256 is
`2a1ede2fff6b01ac951bf3f0d62d03431fe88cb26c7674d087ef08f89098d0c5`.
No retry, second reset, Local patch, kit, Production action, feature-flag
change, publication, Factor F action, or hotfix `016` action occurred.

The Owner subsequently approved the recommended P-47 repository-only
correction. P-47 authorizes design/implementation/static review of one
append-only forward migration `026` after immutable `025`, plus the minimum
bootstrap, canonical-hash, P-12 kit/runner, WP-6.5 cleanup, test, architecture,
security, and authority-document alignment required to review it. Migration
`026_master_catalog_phase4_catalog_action_error_acl.sql` uses ledger
`20260729002600_master_catalog_phase4_catalog_action_error_acl` and current
repository-candidate SHA-256
`472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`.
It is a narrowly scoped per-object correction for the pure JSON formatter:
retain its reviewed body, owner, signature, empty `search_path`, and global/
schema default-ACL contract; change it to `SECURITY INVOKER`; grant direct
`EXECUTE` only to `authenticated`; and continue to deny `PUBLIC`, `anon`, and
`service_role`. It does not replace or weaken `017a`; the earlier statement
that an after-`025` correction is unsafe applies to substituting a late fix for
the required pre-`018` global-default bridge, not to this separately reviewed
post-`025` object-specific callability fix.

P-47 repository/static closure passed on 2026-07-29. Full 38 files/287 tests,
focused migration/CLI/authority 73/73, TypeScript, full lint, script syntax,
authority 710/65/17, exact `026` hash, diff hygiene, and independent
security/runner/docs re-reviews passed. The review reconciled response-loss
cleanup and exact-overload drift findings. No database execution, Git write, or
accepted application/dependency change occurred; therefore no new application
build claim was made. The next possible action is a separate Owner decision on
exact replacement Git publication. P-48 below now records that separate
Git-only decision.

P-47 does **not** authorize applying `026`, cleaning the residual Local draft,
running a disposable database, resetting/retrying Local, building/running the
Production kit, staging/committing/pushing, opening a PR, accessing or writing
Production, deploying, enabling a flag, publishing `2568.1.0`, changing
accepted application/UI/export source, changing Factor F, changing hotfix
`016`, or removing the accepted `v_row_count` debt. The P-45 freeze rule is
suspended because P-46 exposed a new reviewed defect; a replacement
source/tooling HEAD, Remote record, separately authorized clean Local
rehearsal, and all later PRE-P-12 gates are required before P-12 may be
requested.

**P-48 exact replacement source/tooling Git publication authorized:**
2026-07-29 — from exact base
`d92d8ced42fc882481ebc2c4579adcf1edbebea7` on
`codex/master-catalog-phase4`, stage, commit once with message
`Close P-47 helper ACL correction`, and push exactly once to the existing
branch using only the exact 25-file allowlist below. The commit may contain the
already-reviewed P-47 migration, bounded
tooling/tests, architecture/security/authority alignment, Finding #44, and this
P-48 authority record. It must not include `files/`, `tmp/`, `output/`, any
other untracked path, accepted application/UI/export source, or a P-12 GO
marker. Do not create a PR. After push, verify local/upstream equality and
truthful exact-head Remote status, record the resulting SHA outside its own
commit, and stop.

P-48 authorizes no Local cleanup/application/reset/retry, disposable database,
kit generation/pass, Production access/write, deploy, flag change, publication,
Factor F mutation, hotfix `016` action, `v_row_count` change, or later
Checklist-only GO commit. A fresh destructive Local rehearsal remains a
separate Owner decision after the replacement HEAD/Remote record is available.

**Post-Phase-4 DR follow-up recorded (not a P-12 blocker):** 2026-07-28 —
after P-15 closeout, or as separate work if the rollout is abandoned, define
the required RPO/RTO; schedule recurring checksum-verified encrypted
off-device application-schema backups and restore drills; and separately
inventory Auth recovery and Storage object backup when those datasets are in
use. The application-only backup design is the approved migration-recovery
pattern, but the existing readiness rehearsal is not the final rollback source
and is not full-service DR. This follow-up does not expand P-12, block P-12, or
authorize Auth/Storage extraction or configuration changes. The bounded future
work is recorded in
[Post-Phase-4 DR Backlog #42](./42-phase4-post-phase4-disaster-recovery-backlog.md).

None of the decisions above authorizes Production access, DDL/DML, migration,
deploy, feature flag, publication, Add/Supplement release, P-19, Factor F, or
hotfix `016` action.

**Capability-completeness alignment recorded:** 2026-07-12 — owner requested a
full owner/developer audit and plan correction. Audit #29 adds WP-6.6 before
WP-7 and reserves migration `020` for fix-forward authority/workflow hardening;
P-18 placement is renumbered to planned migration `021`. This records the plan
and corrected meaning of completeness; it does not authorize implementation,
Local reset, or Production action.

**P-22 operator-workflow correction recorded:** 2026-07-12 — after reviewing
the Local admin flow as the intended operator, the owner approved the correction
plan in [Doc #31](./31-phase4-wp66-operator-workflow-correction-plan.md). V1 has
historically allowed at most one mutable working draft per base version, retains stale/abandoned
drafts read-only, requires an audited abandon path, and places an authoritative
final draft-versus-base comparison before publication. This authorizes docs and
Local-only implementation planning; it does not authorize a Local reset,
P-18/`021`, P-19, WP-7, Factor F/hotfix expansion, or Production.
The owner subsequently approved G1 separately. G1 Local DB/concurrency/P-20
input passed on final evidence commit `e463270`. Technical operator/browser
preflight then passed on executable/source checkpoint `c8f6dca` without a
reset or migration `020` change. P-23 then amended operator context/navigation,
and P-23.1 amended candidate `020` plus the create/item/restore flow. P-23.1
repository/static verification passed 2026-07-13; prior live evidence is now
historical. The owner then explicitly approved G1R, which passed on exact clean
execution checkout `721c2c2` with final migration `020` SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The owner later approved G2 separately; the second independent clean rebuild
and P-20 comparison passed on the same exact candidate. G3, G4, and every
Production action remained separate decisions. A bounded no-reset G3 real-route
technical walkthrough then passed on source HEAD `6599c30`: a lock-1 review
rejected publication after a second edit advanced lock 2, retained entered
fields, reloaded the latest review, and audited-abandoned the proof draft with
clean final invariants. P-26 then closed the high-impact confirmation gap and
was committed at `78e96ab`. The owner accepted G3/WP-6.6 on that exact
application checkpoint at 2026-07-14 23:50 +07. G4, bootstrap inclusion,
WP-7, and Production are not inferred.

**P-28/G4 repository integration recorded:** 2026-07-15 — the owner approved
the recommended repository-only sequence: add exact accepted migration `020`
to the canonical Local bootstrap source and implement the tracked WP-7
regression harness before requesting one warned destructive Local reset. This
authorizes source/tests/docs only. It does not authorize executing
`npm run db:local:bootstrap`, live WP-7 DB mutation/evidence, P-18/`021`, P-19,
WP-8, Factor F or hotfix expansion, feature enablement, publication, or any
Production access/write.

**G2 advisor disposition recorded:** 2026-07-13 — the current Local Studio
rules report eight authenticated-callable `SECURITY DEFINER` warnings. Seven
belong to baseline application RPCs; one is the active-admin/feature-flag-
guarded Master Catalog readiness facade. All deny anonymous execution. They do
not block G2. P-36 later reproduced and triaged the current baseline without a
security issue or technical rollout blocker. Least-privilege/minimization,
especially for baseline `get_user_role` and `is_admin`, remains due before
P-12. The 24 Studio performance warnings and seven unindexed-FK information
findings are also baseline items; both new authority foreign keys are covered.
This record is not a Production risk acceptance.

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation as the Phase 4 governance backbone and source of truth for
locked, pending, and deferred decisions. This approval accepts the recording
procedure and current P-01 component tracker, but it does not resolve P-02
through P-15, authorize Production migration, deploy, feature enablement, or
publication, or convert analysis memos into authority.

## 1. How to use this register

This is the single short list of decisions that implementation must not guess.
It is not a second architecture document.

- **Locked** means already agreed in the architecture/ADR and implementation
  must follow it unless an approved change updates the source document.
- **Pending** means no Production or data action may cross the stated gate until
  a named owner records the answer and evidence.
- **Deferred** means deliberately outside Phase 4 Core; it is not an unfinished
  Core requirement.

When a decision changes, update this register, its authoritative ADR/contract,
tests, and any affected reconciliation row in the same review. Do not silently
change only application code or SQL.

## 2. Locked architecture and scope decisions

| ID | Decision | Reason / authority |
|---|---|---|
| L-01 | An immutable published database version is the Master Catalog system of record | Official publication must have one unambiguous authority; [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md) |
| L-02 | System-generated Excel/PDF for a published version are official reference copies when stamp, count, and dataset hash verify; Excel independently reconstructs the canonical hash while PDF is server-verified and stamped | They can be cited immediately without overstating what the PDF alone can reconstruct |
| L-03 | Current Production `2568.0.0` is the authority for the initial 710 names, units, and prices | Candidate workbook has row and price differences |
| L-04 | The first structured-code rollout cannot change Production name/unit/price; workbook codes remain candidates until approved | Separates taxonomy adoption from price authority |
| L-05 | Raw workbook is parsed locally and retained in the physical filing system; no Supabase Storage/signed upload | Owner retains the original and online storage adds unnecessary scope |
| L-06 | Manual edits and Excel imports use the same draft, diff, reason, audit, concurrency, approval, and publish controls | Prevents an unaudited manual backdoor |
| L-07 | Published rows are immutable; correction creates a new version/change set | Protects historical BOQs and official exports |
| L-08 | Stable UUID identifies a logical item; business codes are append-only reservations and cannot move to another identity | Preserves history through recodes and prevents code reuse |
| L-09 | Display category and AAA/TTT code taxonomy are separate, versioned data; pricing never parses code segments at runtime | Codes describe business classification, not executable pricing logic |
| L-10 | K-formula fields are excluded/rejected in Phase 4 Core | Ownership, approval, and versioning are not yet approved |
| L-11 | BOQ Rebase is Phase 4.2; historical BOQs remain locked to their catalog version | Core can ship safely without rewriting existing BOQs |
| L-12 | The singleton pointer is authoritative; legacy `is_default` is a transactional compatibility mirror until later removal | Avoids dual-source ambiguity while preserving current code |
| L-13 | Catalog writes are function-only with explicit grants, RLS defense in depth, and private privileged implementation | Required audit/authorization boundary; [DB contract](./17-phase4-database-security-contract.md) |
| L-14 | Publication and pointer restore are serialized, idempotent, short transactions; parsing/export occurs outside locks | Prevents pointer races and operational blocking |
| L-15 | Dataset hash uses the fixed canonical contract; binary export hashes are separate | Separates data equivalence from file-byte identity |
| L-16 | One approved auto-detected parser profile is supported initially; no generic mapper | Keeps v1 proportionate to one known workbook format |
| L-17 | Normalized import payload is capped at 750 KB in browser and server; raw `.xlsx` is capped at 20 MB before parsing | Bounds risk while covering the verified 710-row catalog |
| L-18 | Client-side filtering remains acceptable until a version exceeds 2,000 rows or measured catalog-read payload exceeds 1 MB | Avoids premature pagination infrastructure |
| L-19 | No paid Supabase branch/project is required; rehearse against project-scoped Local Supabase and a logical backup | Meets present cost and isolation needs |
| L-20 | `/CI/` source files remain local-only; only reviewed runtime derivatives may be committed/deployed | Protects source brand assets and keeps deployed assets intentional |
| L-21 | Existing Production wording is preserved unless an explicitly approved UI/UX change says otherwise | Prevents accidental label drift during Phase 4 implementation |
| L-22 | Phase 4 does not add an export-event log table, workflow engine, background job, partitioning, or `pg_trgm` | No current scale/compliance evidence justifies the complexity |
| L-23 | Published baseline identities are never merged; an erroneous duplicate is retired in a later version while both historical identities/codes remain | Prevents ambiguous lineage and preserves published BOQ history |
| L-24 | Legacy display order comes from the verified unique numeric suffix of `ITEM-####`; clones preserve it and new items append | Produces deterministic order without trusting workbook/physical row order |
| L-25 | Full-import mass retirement begins at `max(10, ceil(2% of active base))` and requires exact owner approval evidence before apply/publish | Detects wrong-source omissions without blocking a single correction |
| L-26 | Phase 4 Core does not expose an archive transition; former current versions remain Published/Active and immutable | Avoids adding an undefined lifecycle operation while the singleton pointer already identifies Current |
| L-27 | Phase 4 Core does not rebase stale drafts; audited-abandon the stale attempt, then create a new draft from Current and deliberately reapply still-approved changes while retaining the abandoned snapshot/history | Avoids hidden three-way merge semantics, respects the one-open-draft invariant, and preserves an explicit audit trail |
| L-28 | Factor F remains outside Master Catalog price versioning and follows ADR-005; old BOQs are not backfilled with a guessed factor version | Prevents false provenance and keeps Factor F policy changes independent from price catalog publication |
| L-29 | Migration numbers follow actual execution order; Factor F applied as `012`/`013`/`014`/`015` on 2026-06-29, production hotfix `016` applied on 2026-07-06, so Master Catalog Phase 4 starts at `017+` | Prevents duplicate migration ordering and keeps deploy history truthful |
| L-30 | Catalog and Factor F version strings are independent namespaces; labels and official documents must say Catalog version vs Factor F version explicitly | Prevents mistaking catalog `2568.1.0` for Factor F `2569.0.0` |
| L-31 | No Factor F publication is part of Master Catalog Phase 4 | MC approval cannot move the Factor F pointer, change Factor F rows, or bind old BOQs by assumption |
| L-32 | Master Catalog dataset hashes and official catalog exports exclude Factor F rows, Factor F metadata, BOQ snapshots, and BOQ totals | Keeps catalog reproducibility scoped to price-list data and avoids cross-axis hash drift |
| L-33 | Add/supplement rows may be created only within the gated workflow; publication of any version containing new identities is held until its current placement batch has a matching P-18 review and DB order invariants pass | Prevents a future admin from accidentally making provisional append-at-end placement official |
| L-34 | WP-6.5 hardens the structured-code publish boundary once a draft contains any active canonical `AAA-TTT-NNN` row: active legacy `ITEM-####` rows must then be limited to the approved `ITEM-0139` exception | Prevents the P-06 exception from remaining only a reviewer checklist while preserving a valid unchanged legacy-only clone/revision path |
| L-35 | A UI operation owns one `request_id` from first submission until a definitive result; retry after an uncertain response must reuse that ID | Database uniqueness alone is not end-to-end idempotency if every retry creates a new ID |
| L-36 | Catalog version creation is reusable under ADR-003 CalVer-first rules; `2568.1.0` may be an exact rehearsal candidate but must not remain hardcoded in reusable action/RPC validation | Annual, revision, and patch releases are already approved architecture, not a future one-off code change |
| L-37 | Hotfix `016`, RLS/RPC, transaction rollback, and publish concurrency require executable Local DB behavior tests; SQL text-shape checks alone are not release evidence | Prevents implementation text from passing while runtime behavior regresses |
| L-38 | Volatile status and evidence follow the authority index in the Tracker; other plans link to that source instead of copying current commit/hash/test facts | Reduces conflicting status and stale operational instructions |
| L-39 | Export artifact verification logic is committed, semantic, and rerunnable from a clean checkout; generated files remain untracked | Prevents row-coordinate assumptions and untracked scripts from becoming release evidence |
| L-40 | A mutation request is fingerprinted by operation, actor, and canonical payload; the same request ID with changed content is rejected, and mutation-time structured aborts roll back the whole change set in a subtransaction | Prevents uncertain retries from duplicating effects and prevents a multi-row error from committing a partial draft/audit record |
| L-41 | Publish-readiness UI consumes the same database helper used by publish for P-18 and structured-code boundary counts; UI may warn earlier but never replaces the final DB invariant | Prevents duplicated business rules from drifting between browser and database |
| L-42 | Private create/apply/publish/restore functions carry bounded runtime lock and statement timeouts; a timeout is an uncertain transport outcome and the client retries with the same request ID | Keeps concurrent admin operations bounded without weakening idempotency |
| L-43 | Operator-facing Master Catalog forms are Thai-first, contain no rehearsal-only default evidence, separate draft save from whole-version publish, and keep support IDs available without making them primary content | Owner review found the technically safe Local UI confusing; WP-6.6 must close comprehension before WP-7 |
| L-44 | A capability is complete only when its exact route/UI, selected entity, Server Action, RPC/schema authority, audit/correction path, readiness/export effect, tests, and operator procedure are implemented or explicitly not applicable | Prevents a safe DB rejection or a passing component test from being mislabeled as an end-to-end operator workflow; [Audit #29](./29-phase4-owner-dev-completeness-audit.md) |
| L-45 | Ordinary item/import mutation resolves only Production-derived approved versioned categories and P-06 code groups, and uses a server-owned next-never-issued code allocator; creating future taxonomy is separate governance | Prevents free-form caller text or suffix choice from becoming catalog authority |
| L-46 | Phase 4 publication derives the publisher actor snapshot from authentication, requires a version-level physical archive reference, and exposes the same stale-base/full-quality readiness result consumed by final publish | Prevents spoofed provenance, missing manual-only filing custody, and false-green UI readiness |
| L-47 | Draft correction uses explicit audited `reactivate` and base-absent `withdraw`; identity, code reservation, and prior audit are never deleted | Gives admins a safe correction path without direct SQL or destructive undo |
| L-48 | At most one mutable `draft` may exist per `based_on_version_id`; stale and explicitly `abandoned` drafts remain immutable read-only history, and replacement requires an audited abandon rather than delete/archive reuse | Matches the intended one-release-workspace V1 while preserving stale/pointer-restore history and database-enforced concurrency safety; [P-22 plan](./31-phase4-wp66-operator-workflow-correction-plan.md) |
| L-49 | Before publication, the admin reviews an authoritative final snapshot diff of the selected draft against its exact base; review carries the expected lock into publish, and any later mutation forces a fresh review | Prevents publication from preceding catalog inspection without inventing a second-person approval engine; final publish still rechecks readiness/hash in the database |
| L-50 | Draft creation requires explicit ADR-003 annual/revision/patch business intent; the UI plans from a complete all-status version registry and the guarded DB path enforces the next reserved number | The system cannot infer business authority from the current number, and an active admin must not type or guess raw version segments |
| L-51 | Every created catalog version number remains reserved after abandon. For an owner-designated future year whose lower identifiers were reserved, the next annual candidate uses that same year, the next revision, and patch `0`; it is annual relative to the older-year base | Preserves immutable audit/no-reuse without making a cancelled `{year}.0.0` block a truthful catalog for that effective year |
| L-52 | Annual effective year is limited to base year +1 through +10, enforced consistently by UI, Server Action, and private DB transition validation | Prevents accidental or unreviewed far-future catalogs while keeping a practical planning horizon; extension requires an explicit business/ADR change |
| L-53 | Stale-sequence and annual-range failures use allowlisted stable codes with Thai operator messages; raw code/request identifiers are collapsed support details and the error remains focused across registry refresh | Gives admins a recoverable explanation without leaking backend text or losing the message during automatic refresh |
| L-54 | Production `2568.0.0` authority copy is first-rollout context, not a permanent generic label; Factor F stays secondary and outside Master Catalog workflow metrics | Prevents future-version reviewers from being shown stale authority wording and avoids reopening the completed separate Factor F workflow |
| L-55 | A successful create opens the exact draft workspace; items/actions precede detailed document metadata; pointer restore requires current-to-target confirmation and explains that historical BOQs retain their saved version | Keeps the admin flow aligned with the release workspace and adds a human safety barrier around the separate recovery operation |
| L-56 | High-impact Master Catalog actions require a separate human-intent confirmation: Recode and Retire show exact item/target/reason/impact, while Publish shows current/target version, reviewed lock, item count, BOQ effect, and requires the exact target version typed by the admin and revalidated against the DB-read version in the Server Action before the publish RPC | Reduces preventable mis-clicks without duplicating database integrity rules or adding a multi-stage approval engine; exact locks, readiness, idempotency, and RPC invariants remain authoritative |
| L-57 | P-33 technical acceptance does not equal placement UX or release acceptance. WP-8/P-14 require truthful accepted-versus-locally-dirty state, recoverable pending choices, review-by-exception, complete impact summary, keyboard-complete non-drag controls, measured 710-row plus realistic-new-batch performance, and independent intended-admin completion without developer/SQL help | Prevents a safe database mechanism or implementer-driven browser proof from being mislabeled as an operationally safe Add/Supplement workflow; arbitrary inherited-row reorder remains outside V1 |
| L-58 | P-34 source/static completion does not equal WP-8 completion. Add/Supplement stays disabled until a separately approved clean Local rehearsal proves the integrated chain, realistic placement interaction scale, accessibility/recovery behavior, and independent intended-admin comprehension | Preserves evidence provenance and prevents passing source tests/build from silently authorizing a destructive reset, feature release, or Production progression |
| L-59 | P-35 repository/bootstrap source integration is non-destructive and cannot authorize P-36 execution. The exact integration checkpoint must be committed and pushed before the owner receives the reset warning and decides P-36; P-37 acceptance follows only after all live, advisor, performance, accessibility, recovery, and independent-UAT evidence is current | Separates reviewed source provenance from destructive execution and final acceptance, preserving a reliable stop point if the integrated runtime gate fails |
| L-60 | Browser route-render/semantic evidence is not interaction acceptance when the automation runtime cannot dispatch the application's client state changes. Preserve the technical measurements, name the tooling boundary, and require independent intended-admin keyboard/pointer/recovery UAT before P-37 | Prevents a green route screenshot or RPC-created accepted state from being mislabeled as proof that the operator can safely complete the live workflow |
| L-61 | P-37 technical stale-lock rejection, one-batch acceptance, exact-request replay, accepted-state readback, and audited cleanup may close their named engineering gates without closing intended-admin keyboard or leave/reload recovery UAT | Preserves useful Local safety evidence while preventing an automation limitation or RPC-driven accepted state from silently becoming owner usability acceptance |
| L-62 | A fresh no-reset browser session may close the named leave/return/reload recovery gate independently, but partial gap-list keyboard evidence cannot close complete keyboard traversal. Recovery copy is visible only while browser-local work is still pending; reset-all must clear both the work and the recovered-state claim | Keeps gate accounting evidence-based, prevents a tooling limitation from becoming inferred accessibility acceptance, and prevents truthful-state drift after an admin discards recovered choices |
| L-63 | A controlled dialog opened without a colocated trigger must retain the exact invoking element transiently and restore focus on close. Final placement review must reuse the same previous/new/next preview as the editor and label DB-derived final position separately from the authority-owned item name | Preserves keyboard context across editor, final-review, and guarded-leave dialogs; keeps one presentation source and avoids future layout/wording changes drifting from placement logic |
| L-64 | Split technical, automation, and owner evidence must close only their named gates. P-37 cannot be accepted while the governing WP-8 exit gate still requires an owner UI submission, broader independent core-admin UAT, three safe-error recoveries, or named performance evidence | Prevents a safe RPC result plus a partial owner walkthrough from being summarized as one complete end-to-end release UAT; [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) |
| L-65 | Placement invalidation for clone/import uses statement-level transition tables plus transaction-local invalidated/no-candidate version markers; retain the placement RPC bypass and revision contract, and do not duplicate the large mutation RPC or add permanent cache state | Removes migration `021` row-trigger amplification while keeping one authoritative mutation workflow and avoiding denormalized-state debt; forward migration `024` owns the bounded correction |

## 3. Pending owner/data decisions

P-01 authorizes only local implementation/rehearsal of the reviewed
architecture and contracts. It did not itself resolve P-02 through P-22; the
current recorded resolutions below refine that original approval. Work may
continue on generic additive schema, parser/canonicalizer, UI, tests, and local
fixture rehearsal while remaining decisions are pending, but final approved
data backfill, candidate freeze, export acceptance, Production migration,
feature enablement, and publication must stop at the stated gates until the
relevant pending decisions are recorded.

Analysis memos and quick-decision guides may recommend outcomes, but they do
not become authority until the owner records the exact outcome and evidence in
this register. In particular:

- P-02 approved retaining both `ITEM-0131` and `ITEM-0139` in `2568.1.0`;
  `ITEM-0139` is only a future-retirement candidate under the recorded
  evidence gates.
- P-03 approved splitting HDPE Crossing into `CRS-H06`/`CRS-H08` and rejecting
  the prior HDPE-as-GIP classification.
- P-06 approved the 22/65 group meanings for backfill with the `ITEM-0139`
  temporary-legacy safeguard. Publication still requires the remaining
  publication gates.
- P-07 approved using Production `ITEM-0491` wording for canonical
  `FTW-CON-002`; the workbook row is a typo shadow, not a separate supplement
  candidate.
- P-08 approved truthful legacy `2568.0.0` baseline metadata: effective date
  `2026-01-01`, approval reference `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`,
  and publisher snapshot `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`.
- P-09 approved only as a limited reservation of candidate draft/rehearsal
  version string `2568.1.0`; candidate effective-date, approval, filing,
  final-hash, and publish authority remain pending.
- P-10 approved the limited runtime NT font/logo derivatives listed in
  [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); original `/CI/`
  source assets remain local-only.
- P-11 approved the field-facing export visual direction for implementation:
  A4 portrait PDF price list, no dedicated item-code column in the main PDF
  price table, exact Thai title `รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`,
  `หน่วยนับ` as the PDF item-unit column label,
  `(หน่วยเงิน: บาท)` as a repeated right-aligned note above the PDF price
  columns, price-disclaimer watermark wording/style matching
  `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf` and the exact
  three-line owner-provided wording recorded in the export spec, footer as
  department / page `x/y` / version-status or
  version-effective-date, no truncated SHA-256 in the PDF footer, no technical
   verification page appended to the field-facing PDF, and QR code deferred as
   post-Core polish unless a stable owner-approved verification URL exists.
   The editable Excel workbook uses `TH Sarabun New` on every populated cell
   with a 16-point body baseline and larger title hierarchy; the PDF retains
   embedded NT runtime fonts. The owner accepted the exact replacement
   database-generated Excel/PDF pair from `777df75` on 2026-07-11 22:20 +07;
   WP-6/P-11 is complete while Production filing remains a separate P-15 gate.
- P-12 is complete through exact `017` -> `017a` -> `018`-`026` and the
  checksum-verified v7 post-`026` backup/isolated restore. For the bounded first
  closeout under P-51, P-50R SOLO is complete; exact P-50D V3 Owner ratification
  is complete in decision-record-only scope; and the existing verified P-50C
  package is accepted only as local review evidence. P-50G later passed and its
  one-time authority was consumed. The remaining route is separate P-50H
  review/approval for local release commit/push plus CI/Preview -> one bounded
  P-13/P-14/P-14C deploy/UAT/draft window -> separate P-15 -> ordered
  closeout/custody -> P-49. P-50R completed
  `PASS_FOR_P50D_REQUEST`. Historical [P-50D Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md)
  was superseded without approval on 2026-08-23. Exact current
  [one-row Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md),
  request `P50D-REQ-20260823-V3`, is frozen and ratified only as a decision
  record under [Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
  Historical
  [baseline-first Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md)
  records the Owner's V2 selection intent but supplies no hash approval or
  mutation authority. The separately bounded offline P-50C technical build
  nevertheless occurred under the superseded same-day interpretation and is
  recorded as
  [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md),
  candidate `P50C-CANDIDATE-20260823-V1`. P-50C is accepted only as local
  review evidence; it performed no candidate application, database, Production,
  or network action and has no further execution authority.
  P-14/P-14C may share the same bounded window only after P-13 PASS and an
  explicit zero-draft/unchanged-pointer checkpoint; P-14C stops with one
  unpublished locked draft. P-15 remains a separate publication confirmation.
- **Historical PRE-P-12 fingerprint requirement (later satisfied):** P-12
  additionally required `catalogAuthorityFingerprintSha256` as a **new
  operational fingerprint**. At that checkpoint it was **UNCOMPUTED — HOLD**,
  not a recomputation
  or reuse of historical
  `sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`,
  because the historical canonical SQL was not committed. Use only the formula
  frozen in CLI Execution Runbook #41/the reviewed runner and a separately
  authorized read-only query against the encrypted Production readiness
  snapshot's isolated restore or fresh in-window Production/restore evidence.
  Record the exact value and query/evidence source in #39/#40, then bind the
  same bare lowercase 64-hex value in the external Production approval before
  any mechanically `productionEligible=true` source kit was used in Production
  or P-12 was requested. The completed P-12 record later bound
  `0fbaf215018200bacbc728af330e990b98c7e6128165982289ed429c93ad13f2`.
- **Historical PRE-P-12 CLI authority path (later completed):** the P-12 CLI
  authority record stated that P-47 independent source/security review and
  static checks passed. Historical P-45 completed at pushed/upstream-equal
  `d92d8ce`; P-46 was consumed and failed closed after applying through `025`.
  P-47 authorizes repository-only append-only `026` implementation and
  alignment, not Git or database execution. P-48 separately authorizes only
  the exact 25-file replacement commit/push; its clean source/tooling HEAD,
  upstream equality, and truthful Remote CI/status must be recorded. Only after
  that may
  a fresh explicit reset approval authorize one canonical Local bootstrap
  through `026` plus consolidated invariants. Any failure or drift stops the
  sequence and requires fresh approval before retry, patch, cleanup, or reset.
  Only after that Local gate passes may a later separately authorized exact kit drive executable
  `calibrate-schema` pass 1, independent schema-contract review, and a second
  fresh full isolated rehearsal with transitive pass-2 closeout and rotating
  advisor artifacts. Only after explicit Owner P-12 GO may Checklist #40 alone
  change at a descendant GO HEAD; Production reuses the source kit. The
  Owner-selected candidate uses exact `016`, `017`, `017a`, `018`-`026` stage
  order. P-47 itself authorizes no Git action; P-48 separately authorizes only
  the exact recorded 25-file publication. Local/disposable execution, kit,
  Production access/write, P-12, deployment, flag, publication, Factor F,
  hotfix, and `v_row_count` action remained unauthorized at that checkpoint.
- P-18 records an owner-identified governance gap discovered during WP-6
  artifact review: new/supplement items must not become official merely by
  being appended to the end of the catalog. The current Phase 4 Core contract
  has a mechanical `max(display_order) + 1` default and no placement UI; that
  remains the implemented baseline until WP-7.5 is technically accepted. Do
  not publish a version containing added/supplement rows unless its current
  placement revision has an accepted review or the add/supplement publish path
  remains held.
  Phase 4 inserted WP-6.5 to harden this boundary with a
  publish-time guard. WP-6.5 also hardens the P-06 structured-code legacy
  exception so only `ITEM-0139` may remain active as `ITEM-####` in
  `2568.1.0`. These guards are safety holds, not substitutes for the later
  placement/review workflow or final P-15 owner approval. The 2026-07-12 plan
  capability audit inserted WP-6.6 before WP-7, then proposed WP-7.5 for new
  identities only while preserving inherited relative order. P-30 accepted
  that exact five-rule V1 contract on 2026-07-15; P-32 Local evidence then
  passed and P-33 accepted the exact bounded technical checkpoint. The separate
  WP-8/P-14 UX, performance, and intended-admin release gates remain pending in
  [Review Note #28](./28-phase4-p18-placement-governance-review-note.md).

**Historical P-51 bounded closeout sequencing and absolute waiver checkpoint
recorded:**
2026-08-18 — the Owner accepts the known P-49 security risk temporarily and
directs the team to finish the first Master Catalog closeout before implementing
P-49. This waives P-49 only as the blocker for the exact first-closeout route;
it does not close the finding, declare the runtime secure, or authorize any
Production/Git/data action. The then-planned route was P-51D -> P-50R -> P-50D -> P-50C ->
identifier binding -> Git/CI/Preview -> P-13 -> P-14 -> P-14C -> P-15 ->
official artifacts/canaries/final flags/invariants/backup custody -> P-49.
Every operational step remains a separate approval gate. If the first P-15
closeout has not finished by **2026-08-25 23:59:59 +07**, the waiver requires
fresh explicit Owner reapproval before continuing; there is no automatic
extension. It ends earlier at the first P-15 closeout, a security-trigger
event, or the next unrelated Production deployment. P-49 re-entry is due
before the next Production deployment, with a target no later than seven
calendar days after P-15 closeout. See
[P-51 Closeout Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

**Historical P-50R staged-gate refinement — 2026-08-18 (superseded):** the parent P-50R gate
now expands to P-50R-I -> P-50R-O -> P-50R-X. The only next Owner decision is
approve or hold P-50R-I, which is implementation/test/freeze against synthetic
fixtures only and remains unauthorized. P-50R-O is a later separately approved
PDF-oracle capture gate; P-50R-X is a later separately approved six-input
reconciliation gate. P-50R-O and P-50R-X are not ready, not requested, and not
authorized. Completion of one stage never authorizes the next. This refinement
does not rewrite the historical P-51 parent-route record above and authorizes no
protected-source read, evidence execution, database/network/Git action, price
decision, or later gate. See
[P-50R Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md).

**Historical P-50R SOLO result and then-current P-50D stop — 2026-08-22:** the Owner confirmed that one
person operates and reviews this closeout and asked to remove unnecessary
ceremony. The unexecuted I/O/X model above is preserved as dated planning
history but is no longer current authority. Request #49 was approved and
consumed offline with 100% coverage, two byte-identical passes, and authorized
operator review of all 28 PDF pages plus every delta/exception. It completed
`PASS_FOR_P50D_REQUEST`; Owner personal result confirmation is not claimed.
The next stop is unapproved [P-50D Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md). The
then-current route was P-50R SOLO -> P-50D -> P-50C -> release commit/push and
CI/Preview -> bounded P-13/P-14/P-14C window -> separate P-15 -> closeout ->
P-49. No operational action is authorized by this simplification. The
2026-08-23 baseline-first direction immediately below supersedes only that
then-current Proposal #50 decision point; it preserves the completed P-50R
evidence and chronology.

**Historical Owner `2568.0.0` baseline-first direction — 2026-08-23:**
published/current `2568.0.0` is the authority for all 710 existing identities,
names, units, material costs, labor costs, and unit costs. The immutable P-50R
package remains comparison evidence; its frozen `proposed_confirmed_correction`
label does not approve a correction. Proposal #50 / `P50D-REQ-20260822-V1` is
superseded without approval and not approvable. Then-current
[Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) /
`P50D-REQ-20260823-V2` starts with zero approved name/unit/price changes and
offers only `BASELINE-ONLY` or a newly frozen exact `SELECTED-DELTA` subset.
The zero-name/unit/price gate remains binding. P-50C, Git, database/Production,
P-13, P-14, P-14C, P-15, and every automatic next step remain false.

**Historical Owner one-row `SELECTED-DELTA` intent — 2026-08-23:** the Owner
selected only stable UUID `f2662c71-a6e5-407e-8456-8608e304b43b` /
`ITEM-0429` / `COR-PB0-002`, retaining its exact baseline name
`งานเจาะผนังบ่อพักย่อย (PB)` and unit `จุด`, with price
`0/1763/1763 -> 0/1764/1764`. This records selection intent under V2; it does
not approve a hash that did not yet exist. Then-current
[Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) /
`P50D-REQ-20260823-V3` freezes exactly one record: manifest SHA-256
`1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`,
selected-record SHA-256
`f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df`.
The other 709 baseline rows remain unchanged. The other 48 external-source
candidates, SHA-256
`2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be`,
remain unselected/deferred, including `ITEM-0427`, `ITEM-0430`, and
`ITEM-0431`; they are distinct from the 17 authority exclusions. Historical
BOQ reprice/backfill remained false. At that checkpoint P-50D V3, P-50C, Git,
database/Production/network, mutation, P-13, P-14, P-14C, P-15, and every
automatic next step remained false pending exact Owner confirmation
(ratification).

**Historical pre-receipt P-50D V3 working record and P-50C offline result —
2026-08-23:** at this checkpoint, exact `P50D-REQ-20260823-V3` froze the one
selected UUID but remained unauthorized pending exact Owner confirmation
(ratification). The bounded offline deterministic P-50C
technical build occurred as
candidate `P50C-CANDIDATE-20260823-V1`; see
[Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md).
Candidate SHA-256 is
`d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`,
diff SHA-256 is
`72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18`,
and P-50C manifest SHA-256 is
`d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5`.
Published/current `2568.0.0` remains unchanged at `0/1763/1763`; only the
offline provisional `2568.1.0` candidate uses `0/1764/1764` for exact
`ITEM-0429`. All 709 other baseline values remain unchanged, with zero
name/unit/material changes; `ITEM-0427`, `ITEM-0430`, and `ITEM-0431` remain
unchanged and no historical BOQ is repriced. The fresh issued/claimed target
registry check remained pending. **At this historical checkpoint:**
technical/document remediation and focused validation were complete; exact
Owner confirmation (ratification) was still next. Commit/push was not the next
authorized action; only after confirmation and
a fresh passing small repository gate may a separate exact local commit/push
plus CI/Preview request be prepared.
Git, database/Production/network, candidate application, deploy, P-13, P-14,
P-14C, P-15, publication, and every automatic next step remain false.

<!-- P50D_V3_P50C_ONE_ROW_DECISION_RESULT_V1 {"schema":"conduit-boq/p50d-v3-p50c-one-row-decision-result/v1","recordedAt":"2026-08-23","p50dRequestId":"P50D-REQ-20260823-V3","p50dAuthorized":true,"selectedDeltaManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","p50cAuthorizationScope":"offline-deterministic-package-build-only","p50cOfflineBuildAuthorized":true,"p50cOfflineBuildAuthorizationConsumed":true,"p50cOfflineBuildComplete":true,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","p50cManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","publishedVersion":"2568.0.0","publishedPrice":[0,1763,1763],"provisionalTargetVersion":"2568.1.0","candidatePrice":[0,1764,1764],"candidateRowCount":710,"unchangedBaselineRowCount":709,"nameChangeCount":0,"unitChangeCount":0,"materialChangeCount":0,"adjacentFindingsUnchanged":true,"historicalBoqRepriceAuthorized":false,"targetRegistryCheckStatus":"pending","p50cCandidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false,"nextOwnerDecision":"authorize-local-commit-push-and-ci-preview"} -->

The `P50D_V3_P50C_ONE_ROW_DECISION_RESULT_V1` marker above is retained as the
same-day interpretation that triggered the independent review. The correction
below supersedes its current authority and next-decision fields; it does not
erase the completed technical build.

<!-- P50D_V3_P50C_DECISION_REVIEW_CORRECTION_V1 {"schema":"conduit-boq/p50d-v3-p50c-decision-review-correction/v1","recordedAt":"2026-08-23","supersedesCurrentAuthorityOf":"P50D_V3_P50C_ONE_ROW_DECISION_RESULT_V1","p50dRequestId":"P50D-REQ-20260823-V3","exactOwnerRatificationPending":true,"p50dAuthorized":false,"p50cTechnicalBuildOccurred":true,"p50cCandidateAccepted":false,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","p50cManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","nextOwnerDecision":"ratify-or-hold-exact-p50d-v3","localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

**Historical exact Owner ratification receipt checkpoint — 2026-08-24:** the Owner's exact
confirmation is recorded by canonical marker
`P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1` in [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
P-50D V3 is complete only in `decision-record-only` scope. P-50C is accepted
only as local review evidence and has no application/import or further execution
authority. Published `2568.0.0` is unchanged; provisional `2568.1.0` remains
registry-pending. At this checkpoint the next safe step was only a separately
authorized small repository gate. That later P-50G gate passed and is recorded
in Result #56; this receipt itself still grants no later authority.

<!-- P50D_V3_EXACT_OWNER_RATIFICATION_DECISION_REGISTER_RECEIPT_V1 {"schema":"conduit-boq/p50d-v3-exact-owner-ratification-decision-register-receipt/v1","recordedAt":"2026-08-24T00:44:15+07:00","canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","canonicalReceiptDocument":"./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md","resolvesRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dRequestId":"P50D-REQ-20260823-V3","confirmationReceived":true,"exactOwnerConfirmationPending":false,"exactOwnerRatificationPending":false,"p50dV3Ratified":true,"p50dAuthorized":true,"p50dAuthorityScope":"decision-record-only","p50dFurtherActionAuthorized":false,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cCandidateAccepted":true,"acceptsCandidateAs":"local-review-evidence-only","p50cFurtherExecutionAuthorized":false,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","currentPublishedVersion":"2568.0.0","currentPublishedCatalogChanged":false,"provisionalTargetVersion":"2568.1.0","targetRegistryCheckPending":true,"historicalBoqRepriceAuthorized":false,"nextSafeStep":"none-stop-after-recording-ratification","smallRepositoryGateRequired":false,"separateGitCiAuthorizationRequired":true,"gitCiAuthorizationGranted":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false} -->

**Historical P-50G/pre-P-50H checkpoint — 2026-08-24:** [Result #56](./56-phase4-p50g-small-repository-gate-result.md)
records exact request `P50G-REQ-20260824-V1` PASS and one-time authorization
consumption. The approval cannot be replayed. At this checkpoint P-50H
Proposal #57 plus its exact manifest were prepared for separate Owner review.
P-50H was later separately approved and consumed; Result #58 and P-50I
Proposal #59 preserve that next checkpoint. P-50I was later consumed and
Result #60 plus P-50J Proposal #61 are current.

| ID | Decision required | Current evidence/default recommendation | Owner | Due before | Status |
|---|---|---|---|---|---|
| P-01 | Approve ADR-004, Change Request, architecture Revision 8, DB/security contract, threat model, parser/hash spec, export spec, Post-Factor-F adjustment plan, and Implementation Execution Pack for implementation/local rehearsal | Approved together after owner review; this does not authorize Production migration, deploy, enablement, publication, or P-02 through P-15 data/records/visual decisions | Owner | Phase 4A implementation | Approved 2026-07-04 |
| P-02 | Decide whether `ITEM-0131` and `ITEM-0139` remain justified distinct items or which erroneous duplicate is retired in the candidate | Retain both as distinct valid items in `2568.1.0`. `ITEM-0139` is only a future-retirement candidate if live preflight confirms BOQ refs = 0 and the data custodian/owner confirms it is the erroneous duplicate; UUID/history merge remains prohibited and any future correction must be retire-only. | Owner + data custodian | Candidate reconciliation freeze | Approved 2026-07-04 |
| P-03 | Approve corrected canonical groups/codes for 16 HDPE Crossing rows | Reject `CRS-GIP-018` through `CRS-GIP-033` as GIP classifications; split HDPE Crossing into `CRS-H06` and `CRS-H08` as taxonomy recodes only. Preserve Production names, units, prices, identities, and BOQ history; defer workbook-only `CRS-GIP-025` under P-05; handle retained `ITEM-0139` under P-04; K fields remain excluded and draft code names/sequences may still be corrected before publication. | Owner + engineering data custodian | Candidate code freeze | Approved 2026-07-04 |
| P-04 | Assign/approve canonical codes and groups for 20 Production-only rows | Retain all 20 Production-only rows; assign canonical codes to 19 rows (`FTW-CON-002`, `CIC-H06-001` through `CIC-H06-010`, `JNT-PVC-013`, `RSR-PL0-040` through `RSR-PL0-046`); keep `ITEM-0139` as temporary legacy code under P-02 controls. Preserve Production names, units, costs, identities, and BOQ history; add no workbook-only rows. | Owner + data custodian | Candidate 710-row freeze | Approved 2026-07-04 |
| P-05 | Decide disposition of 18 workbook-only evidence rows | Raw workbook evidence remains 18 rows, but P-07 resolves workbook `FTW-CON-002` as a typo shadow of Production `ITEM-0491`, not a separate supplement candidate. Defer the remaining 17 unresolved workbook-only rows from `2568.1.0` and open a separate supplement intake. They are future candidates only until item authority, price authority, corrected taxonomy/code allocation, owner/data-custodian approval, import preview/reconciliation, and dataset-hash/publish verification are recorded. Default target for a true new supplement is `2568.2.0` unless approved evidence classifies the change differently under ADR-003. `CRS-GIP-025` must not publish as GIP. | Owner | First structured candidate freeze | Approved 2026-07-04 |
| P-06 | Approve all 22 work-context (`AAA`) and 65 item-type (`AAA-TTT`) group meanings | Approve the 22 `AAA` and 65 `AAA-TTT` group meanings for code-group dictionary/backfill/implementation. This is not import approval, row-count approval, workbook-only approval, K-mapping approval, or P-07 wording correction. Approve revised main codes `DRL→COR`, `FND→PAD`, and `FTP→FTW`. `ITEM-0139` is an approved temporary legacy-code exception for `2568.1.0` only; DB/publish validation must allow `code_group_id is null` only for that row and assert no other active structured-version row has a null group. If that cannot be audited, stop and return to owner; developers must not infer a canonical code. | Owner + engineering data custodian | Code-group backfill | Approved 2026-07-04 |
| P-07 | Approve correction of repeated Thai phrase in workbook `FTW-CON-002` | Use Production `ITEM-0491` wording for canonical code `FTW-CON-002`. Reject the workbook-only repeated-phrase row as a typo shadow, not a separate candidate; do not import workbook wording, do not create a duplicate item, and do not touch `ITEM-0491` identity/history because snapshot evidence shows 8 BOQ references. Any whitespace-only Production wording cleanup requires a separate wording correction/change request. | Owner | Candidate scope freeze | Approved 2026-07-04 |
| P-08 | Provide truthful baseline publication metadata for legacy `2568.0.0` | Approve legacy baseline metadata for `2568.0.0`: `effective_date = 2026-01-01` (`1 มกราคม 2569`), `approval_reference = เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`, `approval_document_date = 2025-11-27` (`27 พฤศจิกายน 2568`), and `published_by_display_name = ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`. `published_at`, `item_count`, and `dataset_hash` must be generated by trusted migration/backfill code; do not invent a historical publish timestamp or reuse any Factor F approval reference. | Owner/records custodian | Validate Phase 4 publication-completeness constraint | Approved 2026-07-04 |
| P-09 | Approve exact candidate version, effective date, approval reference, and physical archive reference | Limited approval only: reserve `2568.1.0` as the candidate draft/rehearsal version string for the Master Catalog Phase 4 structured-code rollout. This does not approve the candidate business `effective_date` (which is owner-designated and not automatically the publish/deploy date), `approval_reference`, `approval_document_date`, `physical_archive_reference`, approver/publisher snapshot, final diff/count/hash, Production publication, or P-15. Those values must be approved after candidate freeze, verification, release-note/export filing evidence, and final owner review. | Owner | Candidate draft/publish rehearsal | Partially approved 2026-07-04; publication metadata pending |
| P-10 | Approve which NT fonts/logo derivatives may be committed and deployed | Approved limited runtime CI asset scope for Master Catalog Phase 4. Owner confirms the project has rights to use all supplied NT CI assets under `/CI/` for NT business operations, including fonts, logos, guidelines, and supporting graphics. Repository/deployment approval is limited to `app/fonts/nt/NT-Regular.woff2` from `CI/NT Regular.ttf`, `app/fonts/nt/NT-Bold.woff2` from `CI/NT Bold.ttf`, `public/brand/nt/nt-logo-primary.png` from `CI/NT_1_v3.png`, and `public/brand/nt/nt-logo-company-lockup.png` from `CI/NT_4_v3.png`. Original `/CI/` source files remain local-only; existing `public/nt_logo.svg` and `public/nt_logo.png` must be replaced by approved derivatives or explicitly retained with source/provenance evidence. Implementation must follow [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md). P-11 replacement artifact acceptance was recorded on 2026-07-11; remaining app-wide asset cleanup stays under P-10. | Owner/brand custodian | Phase 4B UI implementation | Approved 2026-07-04 |
| P-11 | Approve the official Excel/PDF visual sample and field order | Direction approved for implementation: official human-facing PDF uses A4 portrait price-list layout and title `รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`; the main PDF table shows sequence, item description, counting unit, material cost, labor cost, and total unit price; PDF item-unit column label is `หน่วยนับ`; `(หน่วยเงิน: บาท)` appears as a repeated right-aligned note above the PDF price columns; field-facing PDF price pages, including the published Production PDF, must use the price-disclaimer watermark wording/style from `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf` and the exact three-line owner-provided wording recorded in the export spec; this watermark is not a Draft/Preview status mark; `item_code` is not a dedicated PDF table column; Excel remains the full 13-column canonical/business export with visible `ข้อมูลตรวจสอบ`; footer shows department, page `x/y`, and right-side version/status or version/effective-date text using the examples recorded in the export spec; no truncated SHA-256 in the field-facing PDF footer; no technical verification page in the final field-facing PDF; QR code is deferred unless a stable owner-approved verification URL exists. Owner refinement 2026-07-10: the PDF summary shows only organization, catalog version, Thai status, effective date, item count, and full dataset hash. It excludes technical `Current Default`, approval reference/date, approved-by/publisher, exported-at/by, generated-by, and export-spec fields. A non-current published version instead carries a plain Thai retrospective-reference warning. The excluded values remain in Excel metadata and the release/filing manifest. Owner refinement 2026-07-11 21:49 +07: the editable Excel export uses `TH Sarabun New` on every populated cell with a 16-point body baseline and larger title hierarchy; the PDF retains embedded NT runtime fonts. The exact replacement pair from `777df75` passed semantic, typography, five-sheet workbook, 19-page PDF, and unchanged Local readback checks. At 22:20 +07 the owner confirmed `รูปแบบ pdf excel ok เลยครับ`, accepting those exact Local binaries as final P-11/WP-6 artifact evidence. This does not approve Production filing, migration, deploy, enablement, publication, P-18/P-19, or Factor F changes. | Owner | Export implementation acceptance | Accepted 2026-07-11 22:20 +07; WP-6 complete; Production filing remains separate |
| P-12 | Approve the named Production migration window | Request only after WP-8 evidence review is complete: Local evidence green, remote migration ledger includes hotfix `016`, clean Local bootstrap has applied `009`-`015`, `016`, and the exact approved Phase 4 sequence, fresh read-only Production baseline and schema drift check match, backup/restore evidence complete, P-20 portability and reviewed migration fingerprints match, live DB/RPC/RLS/concurrency and permanent BOQ/Factor F regressions pass, advisors have no unresolved blocker, and owner gives go/no-go for the actual window. Package #39 contains the row-by-row readiness disposition. | Owner | Production migration | **COMPLETE 2026-08-17.** Production executed exact `017` -> `017a` -> `018`-`026` at execution HEAD `7c5ac6bd88677c0144bf8b8933b39293a2dee866`. Stage-`026` manifest SHA-256 is `5a029dd507471ab5d74375bd3f2afba931096e9f2c208ff836b68d1dd5881e47`; final closeout manifest SHA-256 is `2fb1259249282315750ce20d41732fd9f6c5e65998aa772fc4e387c5368d64a5`; all three Phase 4 flags remain false. The one-use post-`026` v7 encrypted application-only backup completed with runtime-status SHA-256 `72d2f10358c99565aa2853b02a6bbcf61cc8812f24f2d665498bfd13d7c98d19`, dump SHA-256 `d44286409cad41fff8f977acdafbf6eaecdecb5692381a37fdb8f8f95b9ba538`, byte-identical writeable/read-only checksum SHA-256 `95265fca040c084d70f76b3d8ed3f00beb39a6aa4e98c573dd4a7d49b70c7d0a`, matched source-before/source-after and isolated restore, and complete cleanup. No application deploy, feature enablement, publication, P-13 authorization, or automatic next step occurred. |
| P-13 | Deploy the exact application tree with flags off and pass minimum smoke | Exact P-50D V3 Owner confirmation and P-50G PASS are recorded. Only after a separately approved P-50H release commit/push passes CI/Preview may one separately authorized bounded Owner window begin at P-13. Reverify the P-12 backup checksum/custody and deployment fingerprint; deploy with all three Phase 4 flags false; smoke active-admin login, existing BOQ read/save/duplicate/export, Factor F, disabled-catalog behavior, and absence of client `service_role`/secret exposure. RLS/grants/Auth config remain unchanged. | Owner/operator | First checkpoint in the bounded deploy/UAT window | **NOT AUTHORIZED / NOT REQUESTED.** P-50G PASS does not authorize P-13. Any smoke, fingerprint, traffic, backup, auth, or invariant failure stops the window with all flags false. |
| P-14 | Run minimum-admin UAT inside the same bounded window | Advance only after P-13 PASS. Enable only `catalog_admin_enabled=true`; keep new-identity and retirement flags false. Complete one intended-admin UAT, then abandon the UAT draft and prove zero working drafts, unchanged pointer/BOQ/Factor F, and all failure-path flags false before the P-14C checkpoint. | Owner/operator | Second checkpoint in the bounded deploy/UAT window | **NOT AUTHORIZED / NOT REQUESTED.** The bounded window may pre-authorize this checkpoint, but P-13 failure or missing cleanup prevents advancement. P-14 never publishes. |
| P-14C | Create exactly one real unpublished Production draft inside the bounded window | After the explicit P-14 cleanup checkpoint, create one real draft from the approved base, apply only an exact ratified P-50D V3 selected manifest, and freeze draft reference, target, request ID, review lock, dataset hash, final diff, and review-only DRAFT artifact hashes. Keep the published pointer/versions and existing BOQs unchanged; stop unpublished with exactly one draft. | Owner/operator + price authority | Final checkpoint in the bounded deploy/UAT window; before separate P-15 | **NOT AUTHORIZED / NOT REQUESTED.** The same bounded decision may cover this checkpoint only conditionally; it does not authorize P-15. |
| P-15 | Approve atomic publication of the exact reviewed Production draft | Migration/deploy/enablement/candidate-preparation approval does not imply publish approval. The request must name the exact P-14C Production draft reference and review lock, reviewed target, pointer base/target, exact ratified P-50D V3 selected manifest, price authority, ADR-003 decision, candidate dataset hash, final diff/count, rollback target, and canary identities. It also requires the existing WP-6.5/WP-6.6/P-18/P-19/P-20 publication guards and exact metadata. Official Excel/PDF are generated and filed only after successful atomic publication from the published database version, followed in order by BOQ canaries, final flag restoration, final invariants, and post-publication encrypted backup/restore/custody. | Owner | Production publication | **NOT AUTHORIZED / NOT REQUESTED.** Any draft-reference/review-lock drift, pointer drift, or identifier mismatch is a hard stop. |
| P-16 | Schedule Supabase legacy API-key migration | Separate maintenance change; complete before provider retirement and after inventory/rehearsal | Owner + developer | Separate security window | Pending |
| P-17 | Record completed Factor F F0-F4 gates before Master Catalog Phase 4 | Completed before Master Catalog Phase 4. ADR-005 and the separate Factor F CR governed the rollout; current baseline from `FACTOR F 2566_7.PDF` is active as `2566.0.0`, the 26 June 2026 source-table annex is current default `2569.0.0`, legacy BOQs were not backfilled, and `015` repaired only missing legacy snapshot metadata without repricing or binding old BOQs. Production hotfix `016` followed as a BOQ save regression fix, not a Factor F publication. | Owner + factor data custodian | Before Master Catalog Phase 4 Production migration | Completed 2026-06-29; hotfix follow-up 2026-07-06; see Factor F closeout and migration ledger |
| P-18 | Decide display-order placement governance for newly added or supplement catalog items | Keep the proven DB hold until a supported workflow passes. Accepted V1: place only identities absent from the base; choose category plus same-category before/after anchor; confirm all pending rows in one audited batch; one active admin/data custodian may confirm under the existing publisher model; preserve inherited base relative order; arbitrary reorder remains a separate CR. Implement through append-only migration `021`, DB placement revision/review, exact RPC/RLS/audit/concurrency controls, Thai UI, and WP-8 UAT. See [Review Note #28](./28-phase4-p18-placement-governance-review-note.md). | Owner + data custodian | Before WP-7.5 implementation, before P-14 full Add/Supplement enablement, and before P-15 for any version with new identities | Accepted via P-30; P-32/P-33 technical scope and P-36 integrated technical rehearsal passed; independent intended-admin WP-8/P-14 release evidence and Production remain separate |
| P-19 | Decide official export/rendering policy for inactive or retired catalog rows | Excel already carries `ใช้งาน` / `ยกเลิกใช้`, but the field-facing PDF price table intentionally omits the status column for the baseline visual direction. Before publishing any version with inactive/retired rows, owner must approve whether the official PDF excludes retired rows, visibly marks them, or uses a separate appendix. Until then, do not file a field-facing PDF for such a version as final. | Owner + data custodian | Before P-15 for any version with inactive/retired rows | Pending; recorded 2026-07-07 |
| P-20 | Decide the cross-environment canonical hash/identity portability contract | Approved contract: initialize each legacy baseline `catalog_item_identities.id` directly from its existing immutable Production-derived `price_list.id`, then keep `identity_id` in the canonical lineage hash. The restored public snapshot carries explicit `price_list.id` values, so clean environments using the same approved snapshot have the same deterministic identity mapping. Migration `017` fails closed on nulls, duplicate/colliding mappings, incomplete coverage, or a pre-existing non-deterministic assignment; repeated execution does not replace an assigned identity. Do not introduce a second business-content hash, silently remove identity, or accept environment-specific hashes as equivalent in Phase 4. The tracked comparator first passed two owner-approved independent clean rebuilds on `1ad01b9`; the pre-P-22 `020` candidate also passed two inputs on `3bfc74e`. Final G1R/G2 on `721c2c2` reproduced the same 710-row dataset and identity hashes for the P-24 candidate and the comparator passed with no failures. P-36 then reproduced the same dataset and identity mapping after the integrated chain through `021`. | Owner + database/data-governance reviewer | Initial implementation before WP-6.5 exit (passed); amended-candidate G2 comparison (passed); integrated P-36 rerun (passed); final P-15 hash acceptance remains separate | Approved contract; final G1R/G2 comparison and P-36 integrated rerun passed; P-15 acceptance pending |
| P-21 | Approve the exact WP-6.6 capability-completeness scope, Local-only implementation, and closeout | Approved Audit #29, later extended through C-17 and Execution Pack slices A-L by P-22/P-23/P-23.1/P-24/P-26. Preserve bounded WP-6.5 evidence, use fix-forward candidate `020`, keep bootstrap at `017`-`019` until owner closeout, and hide unsupported release controls. Earlier Local evidence remains historical after each candidate amendment. Review [WP-6.6 Owner Review Note](./30-phase4-wp66-owner-review-note.md) for the recorded closeout. Acceptance does not approve P-18/`021`, WP-7 execution, Factor F workflow changes, hotfix expansion, or Production. | Owner + developer | Closeout before WP-7 starts | Complete via P-27; G3/WP-6.6 accepted on exact `78e96ab3ed9993707014c4aba1d285b7592b17a1` at 2026-07-14 23:50 +07 |
| P-22 | Approve the WP-6.6 operator workflow correction for one current-base working draft, audited abandon, full searchable item-first workspace, and authoritative pre-publish snapshot comparison | Accept [Doc #31](./31-phase4-wp66-operator-workflow-correction-plan.md): one mutable draft per base enforced in candidate `020`; stale/abandoned versions remain read-only; final diff compares database snapshots by identity and carries the exact lock into the existing one-publisher publish path. Amend the unaccepted Local-only `020`, supersede its old evidence, and rerun only after separate reset approvals. Do not create a multi-stage approval engine or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before revised WP-6.6 closeout and before WP-7 | Historical P-22 decision/evidence accepted via P-27; its per-base/stale lifecycle is superseded for future execution by P-39R |
| P-23 | Approve the bounded P-22 operator-context/navigation amendment | Preserve signed-in admin identity and account actions in the Master Catalog shell; use global destinations `บัญชีปัจจุบัน`, `ทะเบียนฉบับ`, and `ประวัติการเปลี่ยนแปลง`; move import into the exact draft workspace at `/versions/{versionId}/import`; remove the second draft selector; distinguish review-only Excel/PDF exports from the approved source-workbook import contract; use an iterative workspace rather than a one-way wizard, with a three-state import sub-flow; show `Local` only from the explicit Local environment setting. Reuse existing server reads/actions/RPCs, expected locks, idempotency, authority, and final review. Do not build a round-trip spreadsheet editor, add approval roles, or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before amended candidate closeout | Approved 2026-07-13; first working-tree checkpoint passed and is retained as historical pre-P-23.1 evidence |
| P-23.1 | Approve explicit version intent/reserved sequence and the final create/item/restore flow correction | Require annual/revision/patch business intent and owner-designated annual year; plan from a complete all-status registry; permanently reserve every created number; DB enforces the next lane sequence after replay handling and permits the next patch-0 annual revision when lower target-year identifiers are reserved. Open the exact created draft, place items before detailed metadata, and confirm current/target plus BOQ effect before restore. Amend still-unaccepted `020`; do not reset Local or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Repository/static before G1R; G1R before independent G2/G3 | Approved and repository/static-passed on exact commit `31fd689` on 2026-07-13; no reset approved; superseded as the G1R fingerprint by P-24 |
| P-24 | Approve bounded pre-G1R business/UX hardening of the P-23.1 candidate | Enforce annual base +1 through +10 in UI/server/DB; add safe stable stale/range messaging; keep errors visible and focused while registry data refreshes and after identical retries; collapse support identifiers; remove internal workflow labels from operator copy; contextualize first-rollout authority; keep Factor F secondary. Distinguish final execution `HEAD`, implementation lineage, and migration SHA in evidence. Amend still-unaccepted `020`; do not reset Local or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Repository/static, same-scope closure, and clean exact commit before G1R | Approved; base `88d0711` and closure `050c998` preserved; final G1R/G2 passed on exact `721c2c2`; G3 closeout accepted via P-27 on exact `78e96ab` |
| P-25 | Approve bounded high-volume final-review scanability before G3 closeout | Keep the existing identity-based complete snapshot diff and exact reviewed-lock publication contract. Make one-field changes compact and immediately visible; summarize compound rows with explicit expand/collapse and expand-all-on-page controls; make overlapping summary counts explicit and directly filterable; preserve search/filter/page-size/page context through exact-item edit; support 50/100 rows and direct page selection; render a stacked mobile list instead of requiring horizontal table scrolling. Require Local visual/interaction evidence for an eight-field compound row and the expected 709-change rollout scale before G3 acceptance. Do not add a data-grid dependency, DB migration, approval role, new export contract, Local reset, Production action, P-18/P-19/WP-7/Factor F, or hotfix scope. | Owner + developer | Before G3 intended-admin acceptance | Approved 2026-07-14; bounded visual and real-route evidence accepted through P-27 |
| P-26 | Approve bounded high-impact human-intent guards before G3/WP-6.6 closeout | Preserve database-owned locks, readiness, idempotency, audit, and publish invariants. Add exact summary-and-confirm dialogs for Recode and Retire. Publish requires the admin to type the target version; the Server Action reads the authoritative version string from `price_list_versions`, compares it using the shared stable error contract, and does not call the publish RPC on mismatch. Include responsive/cancel/no-write Local proof. Do not change migration `020`, reset Local, publish a version, add approval roles, or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before explicit G3/WP-6.6 accept/hold | Approved and committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; no-reset Local proof passed and P-27 accepted G3/WP-6.6 |
| P-27 | Accept the exact G3/WP-6.6 operator closeout checkpoint | Accept C-01 through C-17 based on final G1R/G2 DB evidence, P-25/G3 stale-review evidence, P-26 confirmation/cancel/cleanup evidence, and exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`. Preserve WP-8 independent UAT/accessibility/performance and advisor disposition. This decision does not authorize G4, a Local reset, adding `020` to bootstrap, WP-7, P-18/`021`, P-19, WP-8 execution, feature enablement, publication, Factor F/hotfix expansion, or Production. | Owner | WP-6.6 closeout before G4/WP-7 | Accepted 2026-07-14 23:50 +07; WP-6.6 complete; G4 and all later gates remain separate |
| P-28 | Approve G4 repository integration and WP-7 harness source without destructive execution | Add unchanged owner-accepted `020` after `019` in `scripts/bootstrap-local-db.sh`; align migration/provenance/authority contracts; add a fail-closed Local-only WP-7 harness for hotfix suffixes, catalog authority, rollback/role/version boundaries, BOQ duplicate/selected-Factor-F copy, print/export data modes, publish/restore, and BOQ/Factor F/security before-after invariants. Do not run bootstrap or the live harness until the exact source checkpoint and separate reset approval are recorded. | Owner + developer | Before the first clean `009`-`020` bootstrap and live WP-7 evidence | Approved 2026-07-15 for repository/source work only; G4 clean execution and live WP-7 remained pending at this point and were later decided under P-29 |
| P-29 | Authorize the destructive G4E clean Local execution and live WP-7 evidence | Reset only Local Supabase from exact pushed checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; apply canonical `009`-`015`, hotfix `016`, and Phase 4 `017`-`020`; run WP-6.6, WP-6.5/P-20, WP-7, lint/advisors, repository gates, and final invariant cleanup. Do not touch Production, start P-18/`021` or P-19, run WP-8 UAT, add a Factor F workflow, or expand hotfix `016`. | Owner + developer | After G4R source was committed/pushed and before the first combined clean execution | Approved and executed 2026-07-15; combined bootstrap and all named technical evidence passed; WP-7 owner accept/hold and later gates remain separate |
| P-30 | Accept WP-7 and authorize the five-rule P-18/WP-7.5 Local-only source implementation | Accept P-29/G4E as WP-7 technical closeout; implement placement only for identities absent from the base, using category plus same-category before/after anchor, one audited batch, the existing one-admin publisher model, and preserved inherited relative order. Keep Add/Supplement disabled until `021` and the supported workflow pass. Do not reorder inherited rows arbitrarily or cross P-19, WP-8 reset/evidence, Factor F, hotfix expansion, feature enablement, publication, or Production boundaries. | Owner + developer | Before creating the reviewed `021` candidate and WP-7.5 application/tests | Approved 2026-07-15 01:37 +07; WP-7 complete and WP-7.5 Local-only source work authorized; no reset or Production action authorized |
| P-31 | Accept the exact WP-7.5 Source/Static checkpoint for commit/push | Accept checkpoint `4e3574a31a2697f4d727acabc8f55f34a4233bff`, migration `021` SHA-256 `78359215f7d859d9c167db608e1e96d66712b6b06a9d103fd7b26ce781835a83`, and the recorded repository/static checks. Keep `021` outside bootstrap and unapplied until a separate warned Local gate is approved. | Owner + developer | After repository/static review and before Local reset/apply/live evidence | Approved 2026-07-15 10:24 +07 for exact tracked checkpoint commit/push only; Local DB/browser evidence, bootstrap inclusion, WP-8, Production, and adjacent domains remain separate |
| P-32 | Authorize warned WP-7.5 Local apply/live evidence and same-scope fix-forward | Reset only Local, bootstrap through `020`, apply `021` separately, run role/rollback/race/hash/export/browser evidence, restore pointer/flags/drafts, and correct defects found within the accepted placement contract. Keep `021` outside bootstrap; do not start WP-8/P-19 or touch Factor F/hotfix/Production. | Owner + developer | After P-31 and before WP-7.5 technical closeout | Approved and executed 2026-07-15; same-scope fix-forward SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` passed replacement DB/browser/export evidence and clean final invariants |
| P-33 | Accept or hold the exact WP-7.5 technical checkpoint | Accept the P-32 clean-chain evidence, amended `021` fingerprint, 713-row hash/export parity, real Thai desktop/mobile placement/final-review flow, audited abandon, and final invariant cleanup. Acceptance closes WP-7.5 technical scope only. Truthful dirty state, review-by-exception, keyboard equivalence, measured scale, and independent intended-admin comprehension remain hard WP-8/P-14 gates; bootstrap inclusion, WP-8 execution, P-19, P-14/P-15, and Production remain separate decisions. | Owner | After P-32 evidence and before WP-8/bootstrap progression | Accepted 2026-07-15 13:54 +07 for the exact bounded technical checkpoint; WP-7.5 technically complete; no bootstrap, WP-8, feature, publication, or Production authorization inferred |
| P-34 | Authorize and accept the bounded WP-8 placement UX source/static checkpoint | Implement truthful accepted-versus-dirty state from local assignment changes, versioned recoverable browser choices and guarded supported navigation, direct suggested/modified/incomplete/invalid filtering and counts, standards-complete keyboard radio behavior, deferred/memoized list work, and final affected-category/immediate-neighbor impact review. Accept exact source checkpoint `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` only after repository checks pass. Keep `021` outside bootstrap and preserve separate destructive Local rehearsal, measured browser/accessibility evidence, intended-admin UAT, P-14, and Production decisions. | Owner + developer | After P-33 and before any WP-8 reset/bootstrap/live gate | Authorized and source/static-passed 2026-07-15; historical source checkpoint only. The first P-37 intended-admin UAT later rejected its direct anchor/relation presentation; the bounded insertion-gap correction in [Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md) preserves the accepted DB contract and awaits re-UAT. |
| P-35 | Authorize exact `021` bootstrap repository integration without destructive execution | Add unchanged amended `021` SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` after `020` in the canonical Local bootstrap source; align current authority/operator documents, provenance metadata, and executable consistency tests; run repository/static verification; commit and push the exact source checkpoint. Do not run bootstrap, reset or write Local, change feature flags, run live WP-8 evidence, decide P-19, change Factor F/hotfix scope, publish, or touch Production. | Owner + developer | After P-34 and before P-36 | Approved and source/static-passed 2026-07-15 on exact checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`; P-36 remained separately gated and later passed |
| P-36 | Authorize one destructive integrated WP-8 Local reset and live evidence run | From the exact pushed P-35 checkout, warn that `npm run db:local:bootstrap` resets all Local Supabase, then apply `009`-`015`, hotfix `016`, and Phase 4 `017`-`021`; run integrated DB/RLS/concurrency/P-20/WP-7/WP-7.5/export/advisor/browser/accessibility/performance/recovery evidence and restore the disabled clean baseline. | Owner + developer | After P-35 source checkpoint is pushed | Approved and technically passed 2026-07-15 on exact gate/execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; Local only; interaction/UAT acceptance remains P-37 |
| P-37 | Accept or hold WP-8 and the Production-readiness package | Review exact P-36 execution provenance, clean final invariants, realistic-scale evidence, intended-admin UAT, advisor disposition, tracked export verification, and authority consistency. The default no-assistance scoring rule may be varied only by an explicit recorded Owner decision that preserves the truthful evidence label. Acceptance permits only a later P-12 request; it does not authorize Production migration, deploy, enablement, or publication. | Owner | After every WP-8 exit gate passes | **Accepted 2026-07-25 under the explicit guided-UAT variance against exact correction `df44b827b290933463da5e14fa9125314660022a`:** final exact-source D005 completed the bounded placement and same-request checks; D007 on exact pushed `8fb9839...` closed the stale-choice replay; D009 passed the real 710-row Full-import save and durable Server Action redirect. D008/D009 were audited-abandoned and final Local readback is clean. The Owner requested the live guidance and accepts combined Owner-operated guided UI plus developer-operated fault-injection/cleanup evidence without relabelling it independent. See [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) and [Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md). |
| P-38 | Authorize evidence reconciliation and the bounded no-reset Local Owner UAT needed to resolve P-37 | Use [Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md) and [Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md): preserve actor-independent evidence; prepare only reproducible untracked Local test inputs/faults; have the intended admin complete Cards A-G under the recorded scoring contract; audit cleanup and exact disabled-baseline readback; verify, commit, and push before requesting P-37. Any scoring variance must be an explicit Owner decision and retain the truthful evidence label. Do not reset Local, publish successfully, infer P-37, enable Production features, decide P-19, touch Production, reopen Factor F, or expand hotfix `016`. | Owner + developer | After Closure Matrix #34 reconciliation and before the final P-37 accept/hold request | Proportional exact-source D005 execution and cleanup passed. The Owner then authorized one narrow no-reset banner replay; exact D007 on `8fb9839...` displayed the stale-choice discard notice, wrote zero placement reviews, was audited-abandoned, and cleaned to pointer `2568.0.0`/710, zero drafts, and all flags false. P-38 execution is complete; P-37 was Owner-accepted on 2026-07-25 under the explicit guided-UAT variance. |
| P-39 | Separate immutable draft identity from official catalog release numbering | Accept [Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md): every draft gets immutable `{target}-D{nnn}` identity from separate target/attempt columns; a mutable draft claims a target; publication issues it; audited abandonment retains snapshot/target/reason but releases the unissued tuple for a replacement. Preserve accepted `020`/`021` and implement forward `022`; retain P-23.1 as historical evidence. | Owner + developer | Before P-38 resumes and before any P-12 request | Approved 2026-07-18 for Local-only architecture/source/migration/docs/verification. The first P39-S candidate is historical after P-39R; all corrected gates remain separate. |
| P-39R | Harden the P-39 cross-layer lifecycle and deployment contract | Amend [Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md): enforce one open draft globally; allow only audited abandonment when stale; show and persist restore impact; issue the official number only at publication even when external approval cites draft/target; separate official/target/draft identifiers in every response/read/log/export; preserve backfill timestamps; make terminal rows immutable; require complete publication metadata; remove obsolete DML policies and constrain role/state reads; persist pointer-before/pointer-after plus draft effect; define app/schema compatibility and fix-forward rollback. Supersede conflicting P-22 per-base execution and P-23.1 permanent-reservation wording while retaining point-in-time evidence. | Owner + developer | Before corrected P39R-S and every live P-39 gate | Approved 2026-07-18 for Local-only architecture/source/migration/docs/tests. P39R-S passed on `022` SHA-256 `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`. Corrected `023` applied on exact pushed `6f01457`; set-based `024` SHA-256 `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25` applied on exact `b6d58ce6`. P39R-L passed. Separately warned/approved P39R-C passed the complete clean `009`-`024` chain on exact pushed `10531610eac53a97c6ef8f9d06418766b58bee36`. P39R-U then passed with `2568.5.0-D001`/`D002` and one reused unissued target. All Production gates remain separate. |
| P-40 | Correct exploratory Owner-UAT cross-layer findings without changing the database contract | Replace native exact-format money validation with shared Thai normalization for whole/one/two-decimal values; offer units from the base catalog plus an explicit custom-unit path; after successful base-absent withdrawal, redirect server-side to the draft workspace with a durable Thai notice; accept only safe numeric or canonical text source-row/money Excel cells through the actual application parser; move E-03 before Card B structured-code additions; align tests, preflight, threat model, tracker, verification, migration ledger, and closure script. Do not add/change a migration, reset Local, touch Production, alter Factor F/hotfix `016`, bypass readiness guards, or infer P-37. | Owner + developer | After exploratory P39R-U/P-38 findings and before the fresh scored Cards A-G rerun | Approved 2026-07-19. Exact checkpoint `dc83c35602fec81d124f43013824649664b8eecb` is pushed. Real-parser inputs 708/708/693, 34 files/216 tests, TypeScript, lint 0 errors/10 existing warnings, network-enabled build, and diff check passed. Separate one-draft developer browser QA passed unit search/custom entry, Thai money normalization/error, withdrawal redirect, and notice reload; disabled Local baseline was restored without reset. At that checkpoint fresh Owner UAT remained next; P-42 later narrowed current closure to four correction spot-checks. |
| P-41 | Correct P-38 category-key, read-only Full-preview, and post-withdraw order findings without weakening accepted guards | Treat `categoryCode` as an exact versioned dictionary key/full label with a shared 500-character bound and live-max preflight; keep retirement-disabled Full validation complete and non-persistent with Apply hidden; reject preexisting order gaps in the client; preserve migrations `017`-`024` and append `025` to compact surviving draft rows atomically with relative order and one placement-revision advance. Align bootstrap, smoke, tests, authority docs, and scored Cards B-D. Do not infer P-37, reset Local without a new warning/approval, touch Production, or expand BOQ/Factor F/hotfix/P-19 scope. | Owner + developer | After continued P-38 discovery and before fresh scored Cards A-G | Approved 2026-07-19 for bounded Local correction. Migration `025` SHA-256 `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f` applied incrementally without reset after discovery cleanup. Exact pushed source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed full source and incremental smoke gates; incremental WP-6.6 evidence SHA-256 is `8d118e14c69f7ea9209123852011b1610d4c63687ff5133136bd6f15875463ed`. After a fresh reset warning/approval, exact pushed execution source `adcca3939f3080cdf64bc6ad807051e9e85fed94` passed clean bootstrap `009`-`015`, hotfix `016`, `017`-`025`, WP-6.5/WP-6.6/WP-7/WP-7.5, canonical and final disabled-baseline readback. At that checkpoint fresh Owner UAT remained pending; P-42 later retained Card B-E evidence and reduced the current pass to four spot-checks. Production touched: No. |
| P-42 | Correct final-review snapshot identity and post-publication state after the interrupted scored Card A | Bind every mutable draft review URL to its exact `reviewLock`; hard-stop a mismatched old tab without diff/publish controls; preserve reviewed lock in item return paths; show explicit latest-review recovery; restrict stale-base warning to drafts; make published/abandoned review read-only with accurate labels; replace current/draft value wording with base/this-version wording; amend Card A so the owner verifies prevention rather than submits a known-stale destructive request. Preserve DB expected-lock/idempotency authority and migrations `017`-`025`. Do not infer P-37, repair Local with ad hoc SQL, reset without a new warning/approval, or touch Production/BOQ/Factor F/hotfix/P-19. | Owner + developer | After the interrupted scored Card A and before any Cards B-G continuation | Exact final-review correction `b2500b5e...`, recovery `f8c6709...`, evidence `1c901855...`, bounded findings `bdc104f...`, modal correction `16e88c6...`, D005 source `6fe3a6a...`, durable success `b639c03`, exact stale-choice notice `8fb9839...`, and Full-import correction `df44b827...` passed their named gates. D007 closed C-08 without reset or placement write. P-37 was Owner-accepted on 2026-07-25 under the guided-UAT variance. No full replay, further reset, or Production action is authorized. See [Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md). |
| P-43 | Reconcile the PRE-P-12 authority order, corrected-Local-reset count, and independent-review trust model | Use the canonical order: source/security review and static checks; separately authorized clean source commit/push; exact-head Remote CI/status; separately authorized one-time corrected Local bootstrap and consolidated invariants; one kit; disposable pass 1; distinct named-human contract review; disposable pass 2/closeout; remaining PRE-P-12 inputs; separate P-12 GO; then a separately authorized Checklist-#40-only GO commit. Preserve the historical P-20 two-rebuild proof; `017a` is data-free/ACL-only and requires one new corrected integration bootstrap, not two. Replace free-form reviewer claims with a structured immutable GitHub pull-request-review envelope bound to the exact source HEAD, kit, pass-1 evidence, reviewed payload hash, authenticated account login, approved state, and submission time. Keep the runner offline and use an explicit authenticated human GitHub check; do not create custom signing/PKI. The accepted honest-but-fallible model excludes deliberate executor fabrication, collusion, and account compromise; if that threat model changes, require signed attestations with independent key custody before Production. | Owner + architecture/security reviewers | Before authority-sync Git authorization or any Local reset/rehearsal execution | Approved 2026-07-29 for authority-document/tooling reconciliation only. No Git action, Local reset/application, disposable pass, Production access/write, P-12 migration, deploy, flag, publication, Factor F, or hotfix authority is implied. |
| P-44 | Authorize the exact reviewed PRE-P-12 source/tooling freeze commit and push | From exact base HEAD `07d1d3399cea363a2ff923c6393d4a3259ce623c` on `codex/master-catalog-phase4`, stage, commit, and push only the reviewed 23-file candidate: 15 authority documents, the separate `017a` migration, four bounded scripts, and three tests. Checklist #40 must contain no P-12 GO marker. Explicitly exclude all untracked `files/`, `tmp/`, and `output/` content. Do not create a PR in this authorization. The resulting source/tooling HEAD is recorded outside its own commit through Git/Remote evidence and later bound by the kit and Checklist-only GO commit. | Owner + developer | After independent source/architecture/security review and static checks; before new-HEAD Remote status or any Local bootstrap | Approved 2026-07-29 for this exact commit/push only. No Local reset/application, disposable rehearsal, Production access/write, P-12, deploy, flag, publication, Factor F, hotfix, PR creation, or Checklist-only GO commit is authorized. |
| P-45 | Authorize the exact PRE-P-12 authority/status checkpoint commit and push | From exact base HEAD `ed94c0304be2741217c7ea2c36322b426de1dfe5` on `codex/master-catalog-phase4`, stage, commit, and push only these 11 reviewed files: `docs/04_data/MIGRATIONS.md`; authority documents `00`, `12`, `13`, `19`, `25`, `39`, `40`, `41`, and `43`; and `tests/master-catalog-authority-consistency.test.ts`. Record P-44 execution/Remote truth and P-45/P-46 decisions without changing any migration, application, bootstrap, generator, runner, GO marker, or protected untracked path. Do not create a PR. `ed94c03` remains the immutable reviewed content-freeze ancestor; the resulting clean pushed P-45 descendant is the sole kit-bound source/tooling HEAD and is recorded outside its own commit. | Owner + developer | After P-44 commit/push and exact-head Remote evidence; before any Local reset or kit | Approved 2026-07-29 for this exact 11-file commit/push only. No Local execution, kit, disposable pass, Production access/write, P-12, deploy, flag, publication, Factor F, hotfix, PR creation, or Checklist-only GO commit is authorized by P-45. |
| P-46 | Authorize exactly one corrected destructive Local bootstrap under fail-closed conditions | Only after the P-45 descendant is pushed, tracked-clean, equal to upstream, and has truthful exact-head Remote-ready evidence, run `npm run db:local:bootstrap` exactly once at that same HEAD. The Owner was explicitly warned that this invokes `supabase db reset --local --no-seed` and destroys/rebuilds all Local Supabase data. Apply canonical order `009`-`015`, hotfix `016`, `017`, `017a`, `018`-`025`, then run consolidated security/business invariants with all Phase 4 flags false and Production untouched. Store only secret-free immutable external evidence bound to the exact HEAD. If any precondition, migration, invariant, or evidence step fails or drifts, preserve evidence and stop; do not retry, patch Local, or reset a second time without fresh Owner approval. | Owner + developer | After successful P-45 push/Remote-ready evidence; before kit generation | Consumed exactly once 2026-07-29 at `d92d8ce`. Bootstrap completed through `025`; WP-6.5 then failed closed on private formatter callability. External evidence was preserved. No retry, cleanup, patch, reset, kit, or Production action is authorized. |
| P-47 | Authorize repository-only append-only `026` correction and static closure | Add `026_master_catalog_phase4_catalog_action_error_acl.sql` after immutable `025`, ledger `20260729002600_master_catalog_phase4_catalog_action_error_acl`, SHA-256 `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`; align bootstrap, canonical hash, kit/runner, WP-6.5 cleanup, tests, architecture/security, and authority. Preserve helper body/owner/signature/empty search path and `017a` defaults; use invoker context; grant only authenticated in addition to owner; deny PUBLIC/anon/service. | Owner + developer | After P-46 fail-closed evidence; before any new Git or database action | Approved 2026-07-29 for repository design/implementation/static review only. No Local cleanup/apply/reset/retry, disposable DB, Git stage/commit/push/PR, kit/pass, Production, accepted app/UI/export change, flags, publication, Factor F, hotfix, or `v_row_count` change. |
| P-48 | Authorize exact P-47 replacement source/tooling commit and push | From exact base `d92d8ced42fc882481ebc2c4579adcf1edbebea7` on `codex/master-catalog-phase4`, stage only the exact 25-file allowlist below, commit once as `Close P-47 helper ACL correction`, and push the same branch. Exclude protected/unrelated untracked content and do not create a PR. Verify exact local/upstream equality and truthful Remote status after push; record the resulting SHA outside its own commit. | Owner + developer | After P-47 repository/static closure; before any replacement-HEAD Local request | Approved 2026-07-29 for this exact Git-only publication. No Local/disposable/kit/Production action, PR, deploy, flag, publication, Factor F, hotfix, `v_row_count`, or Checklist-only GO commit is authorized. |
| P-49 | Decide the pending-account business-access contract and record the open authorization risk | Approved target: `pending` is an authenticated onboarding state with only auth self-service, own safe profile/onboarding fields, active org selectors, truthful waiting status, and logout. It has no Dashboard, BOQ (including retained own BOQs), Price List/Master Catalog, Factor F, raw settings, other profiles, print/export, admin, business RPC, or privileged API access. Preserve active-only catalog RLS in applied `022`/`023`; do not create a pending catalog-read compatibility migration. Cross-layer gaps remain across BOQ/Factor-F/settings/selectors, profile controls, role helpers, client/server code, and a service-role API. See [P-49 Plan #45](./45-phase4-p49-pending-authorization-hardening-plan.md). | Owner + database/security/application reviewers | Re-enter immediately after P-15 and before the next unrelated Production deploy; target within seven calendar days after closeout | **BUSINESS INTENT APPROVED; OPEN/HIGH; IMPLEMENTATION DEFERRED AND NOT AUTHORIZED.** P-51 accepts the known exposure temporarily and waives P-49 only as a blocker for the exact first Master Catalog closeout. UI-only enforcement remains insufficient; the technical target is unchanged. |
| P-49S | Authorize an exact P-49 forward-only repository/source correction package | Proposal [#47](./47-phase4-p49-forward-only-db-application-correction-proposal.md) is retained as a design record only. It must be rewritten from fresh post-P-15 live-posture evidence and a complete executable authorization/compatibility contract. No migration number or ledger value is reserved. | Owner + database/security/application reviewers | After P-15; before any P-49 implementation or later Production deployment | **DEFERRED / NOT APPROVED.** Do not implement or execute Proposal #47 as currently written. |
| P-50 | Reconcile the known `ITEM-0429` / `COR-PB0-002` external-source difference and the complete comparison set before the first publication | Preserve published/current `2568.0.0` as the 710-row before-value authority. P-50R completed the comparison; V2 recorded one-row intent; V3 freezes the exact manifest/hash and is ratified only as a decision record; bounded offline P-50C produced the complete provisional candidate/diff/manifest evidence and is accepted only as local review evidence without applying it. P-50H published that evidence package on the feature branch, but Quality failed. P-50I applied the exact hermetic-test target locally, then failed closed before Git on its new marker-count assertion. See [P-50 Plan #46](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md), [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md), [Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md), [P-50H Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md), and [P-50I Result #60](./60-phase4-p50i-local-validation-failure-result-record.md). | Owner/operator + data authority | P-50I consumed; review P-50J only | **P-50R COMPLETE; P-50D V3 RATIFIED `decision-record-only`; P-50C ACCEPTED `local-review-evidence-only`; P-50G PASS; P-50H QUALITY FAIL; P-50I LOCAL GATE FAIL/NO GIT; P-13 HARD HOLD.** Published `2568.0.0` remains unchanged; provisional candidate changes only `ITEM-0429` and remains registry-pending. Candidate application, database/Production, deployment, P-13-P-15, and publication remain unauthorized; nothing continues automatically. |
| P-50R | Authorize one offline/read-only SOLO reconciliation | Exact [Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) bound five inputs, three implementation files, a five-file evidence package, no DB/network, 100% coverage, two byte-identical passes, and all-page/all-record operator review. | Owner-authorized local operator/self-reviewer | Before P-50D | **APPROVAL CONSUMED; COMPLETE / `PASS_FOR_P50D_REQUEST`.** Review binding `55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc`; 28 pages, 67 deltas, 245 exceptions, blockers 0. Evidence only; no P-50D, mutation, Git, or later gate is implied. |
| P-50R-I | Historical staged implementation-freeze proposal | Preserved only as 2026-08-18 planning history. It was never authorized or executed and is superseded by P-50R SOLO. | Historical | Never current | **SUPERSEDED 2026-08-21 / NEVER EXECUTED.** |
| P-50R-O | Historical staged PDF-oracle proposal | Preserved only as 2026-08-18 planning history. It was never authorized or executed and is superseded by P-50R SOLO. | Historical | Never current | **SUPERSEDED 2026-08-21 / NEVER EXECUTED.** |
| P-50R-X | Historical staged reconciliation proposal | Preserved only as 2026-08-18 planning history. It was never authorized or executed and is superseded by P-50R SOLO. | Historical | Never current | **SUPERSEDED 2026-08-21 / NEVER EXECUTED.** |
| P-50D-V1 | Historical exact price/version disposition proposal | Preserve [Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) and its hashes as the unapproved 2026-08-22 proposal. Its Path A recommendation and approval sentence are disabled and may not be consumed. | Historical | Never current | **SUPERSEDED WITHOUT APPROVAL / NOT APPROVABLE.** Request `P50D-REQ-20260822-V1` generated no authority. |
| P-50D-V2 | Historical baseline-first selection proposal | Preserve [Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) as the baseline-first review that began with an empty selected set. The Owner used it to record `SELECTED-DELTA` intent for exactly `ITEM-0429`; it did not and could not approve the later manifest/hash. | Historical selection basis | Before V3 | **SELECTION INTENT RECORDED / NO HASH OR MUTATION AUTHORITY.** Request `P50D-REQ-20260823-V2` is consumed only as V3's selection basis. |
| P-50D | Record exact Owner ratification of the one-row manifest and local review package | [Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) binds one UUID-keyed price delta: manifest SHA-256 `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`; selected-record SHA-256 `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df`. [Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md) confirms those plus the three P-50C hashes. | Owner + data authority | Complete before any Git gate | **RATIFIED / DECISION-RECORD-ONLY; NO FURTHER ACTION AUTHORIZED.** Request `P50D-REQ-20260823-V3` is limited to exact `ITEM-0429`; 709 other baseline rows remain unchanged, 48 other candidates remain unselected, 17 authority exclusions remain distinct/outside scope, and historical BOQ reprice is false. `p50dAuthorized=true` means only the decision record; it does not authorize Git, application, database/Production/network, P-13-P-15, deployment, or publication. |
| P-50C | Preserve and review the non-Production candidate build | Build a deterministic offline 710-row candidate from exact P-50D V3, applying one old-value-checked UUID and proving exactly one labor/unit-cost delta, zero name/unit/material changes, 709 unchanged baseline rows, no historical BOQ reprice, and unchanged adjacent rows/exclusions. See [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md). | Owner + data/technical reviewers | Accepted as local review evidence; exact evidence bytes later entered P-50H feature-branch commit without candidate application | **TECHNICAL BUILD COMPLETE / DATA REVIEW PASSED / ACCEPTED AS LOCAL REVIEW EVIDENCE ONLY / REPOSITORY EVIDENCE PUBLISHED.** Candidate `P50C-CANDIDATE-20260823-V1`; candidate `d7a19a9...`, diff `72e950d...`, manifest `d88d3daa...`. P-50H did not apply the candidate and failed Quality. Candidate application, DB/Production, official artifact, deploy, P-13/P-14/P-14C/P-15, and publication remain unauthorized. Registry check is pending; no automatic step. |
| P-50G | Consume one post-ratification offline/read-only small repository gate | [Proposal #55](./55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md), request `P50G-REQ-20260824-V1`, bound branch/HEAD/upstream, five frozen hashes, exact focused commands, protected exclusions, result paths, and fail-closed rules. The Owner approved full proposal SHA-256 `5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc`; [Result #56](./56-phase4-p50g-small-repository-gate-result.md) records execution. | Owner + local operator | Complete before preparing P-50H | **PASS / AUTHORIZATION CONSUMED ONCE / NO REPLAY.** `3` focused files / `30` tests, lint, deterministic P-50C check, parser syntax, and scoped diff-check passed offline. No protected input, Git stage/commit/push, CI/Preview, DB/Production/network, candidate application, P-13-P-15, deploy, publication, waiver extension, or automatic continuation occurred or was authorized. |
| P-50H | Execute one exact local Git/CI Preview envelope | [Proposal #57](./57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md) and its manifest bound the non-protected payload, test alignment, validation, branch/HEAD/upstream, and publication boundary; [Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md) records the one-time execution. | Owner + local operator | Consumed once after P-50G PASS | **AUTHORIZATION CONSUMED / COMMIT+PUSH+REMOTE EQUALITY PASS / PREVIEW PASS / QUALITY FAIL / NO REPLAY.** Exact feature-branch commit `2b45f9b...`; Quality `32661774094` failed on the ignored-snapshot dependency and skipped Build. No candidate application, database/Production, P-13-P-15, deploy, or publication; P-13 remains hard-held. |
| P-50I | Correct the CI-only non-hermetic authority-test dependency and observe a fresh exact-head Quality/Preview result | [Proposal #59](./59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md) bound one forward-only test/docs commit. [Result #60](./60-phase4-p50i-local-validation-failure-result-record.md) records exact preflight/patch/hash PASS and local assertion failure before Git. | Owner + local operator | Consumed once on 2026-08-24 | **AUTHORIZATION CONSUMED / LOCAL GATE FAIL / NO REPLAY / NO STAGE-COMMIT-PUSH-CI.** Exact test target remains uncommitted. No protected input, candidate application, database/Production, P-13-P-15, deploy, or publication occurred or is authorized. |
| P-50J | Correct only the P-50I proposal-marker count and observe a fresh exact-head Quality/Preview result | [Proposal #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md) freezes one regex change from raw occurrence counting to line-start multiline counting, exact repository targets, focused checks, one additive commit/push, and automatic remote observation. | Owner + local operator | Current Owner decision; before the one-line correction or any Git/CI action | **READY FOR OWNER REVIEW / EXECUTION NOT AUTHORIZED.** Proposal preparation grants no patch, stage, commit, push, CI/Preview, Production, later-gate, or automatic-continuation authority. |
| P-51 | Accept bounded P-49 security risk and finish the first Master Catalog closeout before implementing P-49 | Follow [P-51 Closeout Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md): completed P-51D/P-50R/P-50D/P-50C/P-50G -> P-50H Quality fail -> P-50I local assertion fail before Git -> separately approved P-50J and green exact-head Quality/Preview -> bounded P-13/P-14/P-14C window -> separate P-15 -> closeout -> P-49. If P-15 closeout is incomplete at 2026-08-25 23:59:59 +07, fresh Owner reapproval is mandatory; never rush Production for the date. | Owner/operator | Review P-50J Proposal #61; waiver checkpoint remains binding | **P-50H AND P-50I CONSUMED; GATE 1 INCOMPLETE; P-50J PENDING; P-13 HARD HOLD.** No P-50J execution or operational authority; every later gate remains unauthorized and nothing advances automatically. |

The exact P-48 repository-relative allowlist is:

- `docs/04_data/MIGRATIONS.md`
- `docs/plans/master-catalog/00-phase4-review-guide.md`
- `docs/plans/master-catalog/08-phase4-architecture-ci-plan.md`
- `docs/plans/master-catalog/12-phase4-production-runbook.md`
- `docs/plans/master-catalog/13-phase4-verification-report.md`
- `docs/plans/master-catalog/17-phase4-database-security-contract.md`
- `docs/plans/master-catalog/18-phase4-threat-model.md`
- `docs/plans/master-catalog/19-phase4-decision-register.md`
- `docs/plans/master-catalog/21-phase4-architecture-review-disposition.md`
- `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md`
- `docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md`
- `docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`
- `docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md`
- `docs/plans/master-catalog/42-phase4-post-phase4-disaster-recovery-backlog.md`
- `docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md`
- `docs/plans/master-catalog/44-phase4-p46-catalog-action-error-callability-finding.md`
- `migrations/026_master_catalog_phase4_catalog_action_error_acl.sql`
- `scripts/bootstrap-local-db.sh`
- `scripts/master-catalog-local-canonical-hash.mjs`
- `scripts/prepare-master-catalog-p12-cli-kit.mjs`
- `scripts/run-master-catalog-p12-cli-step.mjs`
- `scripts/smoke-master-catalog-wp65.mjs`
- `tests/master-catalog-authority-consistency.test.ts`
- `tests/master-catalog-migrations.test.ts`
- `tests/master-catalog-p12-cli-kit.test.ts`

The exact P-45 repository-relative allowlist is:

- `docs/04_data/MIGRATIONS.md`
- `docs/plans/master-catalog/00-phase4-review-guide.md`
- `docs/plans/master-catalog/12-phase4-production-runbook.md`
- `docs/plans/master-catalog/13-phase4-verification-report.md`
- `docs/plans/master-catalog/19-phase4-decision-register.md`
- `docs/plans/master-catalog/25-phase4-execution-progress-tracker.md`
- `docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md`
- `docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`
- `docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md`
- `docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md`
- `tests/master-catalog-authority-consistency.test.ts`

P-45/P-46 intentionally stop before kit generation. A later kit/pass decision
must not reopen the 11-file source HEAD. After P-45, the only permitted tracked
authority path is Checklist #40: each later bounded action requires a new
explicit Owner decision and separate Git authorization, recorded before action
in a clean pushed/upstream-equal **PRE-GO authority checkpoint** that changes
Checklist #40 only and contains no `P12_RUNNER_AUTHORITY_V1` marker. Execute the authorized
action from a clean dedicated checkout pinned to the unchanged P-45
source/tooling HEAD. Those authority commits do not authorize Production or
become a new source head; the final runner still requires the net changed path
from the P-45 source HEAD to the eventual GO HEAD to be exactly Checklist #40.
This governance mechanism is recorded now, but no kit/pass action is approved
by it.

### P-11 cover-layout refinement (2026-07-10, revised 2026-07-11)

The owner further refines the field-facing PDF cover: use a larger top-centered
NT company lockup, then the document title and a distinct `ประจำปี {catalog
year}` title-level line of the same size and weight, with one centered
upper-middle metadata table containing
only `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full
dataset hash. Do not repeat version/status in the header or company identity in
the table. For presentation parity, Excel user-facing sheets use the same
`ฉบับบัญชีราคา` terminology and separate equal-size title/year lines; canonical
verification identifiers remain unchanged. Approval/publisher/export data remain
in Excel metadata and release/filing evidence, and the catalog dataset hash
remains unchanged.

### P-11 staged acceptance and WP-6.5 authorization (2026-07-11)

The owner accepts the P-11 visual/content direction reviewed through the final
PDF terminology/title hierarchy and later refines the editable Excel workbook
to TH Sarabun New with a 16-point body baseline. The `edf3570a` pair is
superseded by that font decision and was never filed or accepted as final. The
exact replacement pair from `777df75` now passes WP-6.5E technical evidence;
at 2026-07-11 22:20 +07 the owner confirmed `รูปแบบ pdf excel ok เลยครับ`.
P-11 and WP-6 are complete for Local artifact evidence. This acceptance does
not file the artifacts in Production or approve any Production gate.

The earlier owner authorization allowed WP-6.5 Local-only work to start while
final binary acceptance was pending and remains in force after P-11 closeout.
It includes P-20 implementation and the tracked verifier, but it does not
authorize a Local Supabase reset
without advance notice, any Production access/write, Factor F workflow change,
hotfix `016` scope expansion, placement/reorder UI, add/supplement publication,
deploy, enablement, or catalog publication.

## 4. Deferred decisions

| ID | Deferred item | Reconsider when |
|---|---|---|
| D-01 | K-formula governance/schema/import/export | Named owner, approval source, calculation semantics, and versioning contract exist |
| D-02 | BOQ Rebase UI | Phase 4 Core stable identity has completed one stable Production cycle |
| D-03 | Additional parser profiles/free-form mapping | A second approved recurring format creates measured need |
| D-04 | Server pagination/virtualization | A version crosses 2,000 rows, catalog-read payload crosses 1 MB, or measured UI performance fails |
| D-05 | Remove compatibility columns/legacy audit table | One stable Production cycle and usage/search confirms no remaining dependency |
| D-06 | Permanent export-event logging | Compliance or incident requirements need download history, not only document stamps |
| D-07 | Online source/approval document storage | Physical filing becomes inadequate and storage security/retention is approved |
| D-08 | Multi-stage in-app approval workflow | More publishers/roles or compliance rules require separation of duties in software |
| D-09 | Full Factor F admin/import UI | The F-track foundation is stable and repeated Factor F changes require a reusable admin workflow |

## 5. Decision recording procedure

For P-02 through P-07, record the final answer in:

1. this register;
2. the [Reconciliation Report](./11-phase4-reconciliation-report.md) and either
   affected rows in `evidence/phase4-reconciliation-draft.csv` or the generated
   frozen decision overlay when preserving raw evidence is required;
3. the [Code Dictionary](./10-phase4-structured-code-dictionary.md), when code
   meaning/allocation changes;
4. parser/golden fixtures and database seed/backfill generated from the frozen
   approved data.

For P-08 through P-39, record the evidence in the Change Request, Runbook,
Verification Report, and per-version Release Note as applicable. P-18 through
P-20 also require the affected architecture/spec/test contract to be updated in
the same reviewed change.

For P-17, record the evidence in ADR-005, the Factor F Change Request,
before/after factor checksums, pointer verification, and the relevant
application regression report.

Every record must include:

- decision ID and exact subject/version;
- selected outcome and reason;
- approver name/role and timestamp;
- evidence/reference;
- affected rows/files/documents;
- whether implementation, Production migration, deploy, enablement, or publish
  is authorized.

Chat acknowledgement alone should not be interpreted as approval for a later
Production gate unless it identifies the exact gate and version.

## 6. Historical P-01 component review tracker

This table preserves the 2026-07-04 implementation-start chronology. P-01,
WP-8, and P-12 were later completed; it is not current gate status.

At that checkpoint, P-01 was approved only after all required implementation/local-rehearsal
authority documents below are accepted. A component approval does not authorize
Production migration, deploy, feature enablement, or publication.

| Component | Status | Owner decision / condition | Evidence |
|---|---|---|---|
| Post-Factor-F adjustment plan | Approved for implementation/local rehearsal | Factor F pointer/rows/bindings stay unchanged; before/after assertions and `save_boq_with_routes` immutability regressions are mandatory Production gates | Owner chat approval, 2026-07-04 |
| Implementation Execution Pack | Approved for WP-0 through WP-8 implementation/local rehearsal | Historical condition: WP-9 required sequential P-12 through P-15 gates after WP-8. Current status is P-12 complete; P-13/P-14/P-14C/P-15 remain unauthorized. | Owner chat approval, 2026-07-04 |
| Architecture Revision 8 | Approved as Phase 4 Core architecture authority for implementation/local rehearsal | Production gates require rollback/fix-forward evidence plus RLS/grants, advisory lock, status-transition, export formula-safety, BOQ, and Factor F regression proof | Owner chat approval, 2026-07-04 |
| Architecture Review Disposition | Approved as supporting disposition record | Revision 8 and the contract suite remain authority; external review is input only and must not become shadow authority | Owner chat approval, 2026-07-04 |
| ADR-004 | Approved as Phase 4 governance/architecture decision for implementation/local rehearsal | Published database catalog is system of record; system-generated Excel/PDF are official only when stamp/count/hash match; Production and publish gates remain separate | Owner chat approval, 2026-07-04 |
| Phase 4 Change Request | Approved for implementation/local rehearsal | Missing decision at its due gate is a stop condition; Production migration, deploy, enablement, publication, Factor F work, and unauthorized Production name/unit/price changes remain unauthorized | Owner chat approval, 2026-07-04 |
| Database/security contract | Approved for implementation/local rehearsal | Additive `017+`, explicit grants/RLS, private definer boundary, direct-write revocation, lock order, Factor F/BOQ immutability, local DB/security/advisor verification, and forward-fix-only recovery are accepted | Owner chat approval, 2026-07-04 |
| Threat model | Approved as threat/control baseline for implementation/local rehearsal | Required security tests, advisors, malicious fixtures, BOQ/Factor F regression, residual-risk acceptance, and re-review triggers are mandatory before Production | Owner chat approval, 2026-07-04 |
| Decision Register | Approved as Phase 4 decision source of truth | Historical 2026-07-04 condition: P-02 through P-08 were approved, P-09 reserved only the `2568.1.0` draft/rehearsal version string, P-10 approved limited runtime CI assets, P-11 visual direction was approved, and P-12 through P-15 were then unresolved. Current status is P-12 complete; P-13/P-14/P-14C/P-15 remain unauthorized. | Owner chat approval, 2026-07-04 |
| Parser/hash spec | Approved for implementation/local rehearsal | Deterministic single parser profile, server revalidation, file/row/payload limits, stable error contract, K-exclusion, decimal-string money, canonical hash contract, golden/cross-runtime tests, and independent filed-source rehash before publication are accepted | Owner chat approval, 2026-07-04 |
| Official export spec | Approved for implementation/local rehearsal | Dataset-hash versus binary-hash model, selected-version server export, fail-closed count/hash checks, five-sheet Excel architecture, visible canonical verification, PDF server-verified stamp, draft markings, Factor F exclusion, accessibility, filing evidence, and failure behavior are accepted; P-11 visual direction amendment is now recorded, while final artifacts and reviewer sign-offs remain separate | Owner chat approval, 2026-07-04 |

## 7. Approval summary

| Approval package | Decision | Owner | Timestamp | Evidence |
|---|---|---|---|---|
| Architecture + local implementation/rehearsal | Approved | Owner | 2026-07-04 | P-01; P-09 version string reserved for rehearsal; Production and remaining P-09 effective/approval/filing metadata through P-15 gates remain separate |
| Frozen 710-row identity/code reconciliation | Approved | Owner | 2026-07-04 | P-02-P-07; implementation must preserve raw evidence and generated decision overlay |
| Legacy baseline publication metadata | Approved | Owner/records custodian | 2026-07-04 | P-08; `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; do not use Factor F evidence |
| Candidate draft/rehearsal version string | Partially approved | Owner | 2026-07-04 | P-09 limited approval; reserve `2568.1.0` only, with effective/reference/archive still pending |
| Runtime NT CI assets | Approved | Owner/brand custodian | 2026-07-04 | P-10 limited approval; implement with [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); `/CI/` source remains local-only; exact P-11 replacement artifacts accepted 2026-07-11 |
| Official export format | Exact TH Sarabun New 16 pt replacement pair accepted; WP-6 complete | Owner | 2026-07-11 22:20 +07 | P-11; exact replacement DB-generated Excel/PDF passed count/hash, typography, visual QA, and owner confirmation; Production filing remains separate |
| Reliability plan/authority alignment | Approved for docs-only amendment | Owner | 2026-07-11 | Add WP-6.5 end-to-end hardening, permanent hotfix regression, UAT, authority hierarchy, and P-20 decision gate; no Local reset or Production authorization |
| WP-6.6 capability scope/start | Authorized for Local-only implementation of Audit #29 C-01 through C-12 / slices A-G | Owner | 2026-07-12 | P-21; no Local reset/apply, Production, P-18/`021`, or WP-7 authorization |
| WP-6.6 operator workflow correction | Historical G0/G1/pre-G2 checkpoint completed; superseded as executable target by P-23.1 | Owner | 2026-07-12 | P-22 evidence remains history on `e463270`/`c8f6dca`; do not run the former exact-`c8f6dca` G2 plan after candidate `020` changed |
| WP-6.6 P-23.1 version/workspace correction | Bounded implementation authorized; repository/static and final G1R/G2 passed | Owner | 2026-07-13 | P-23.1/P-24 candidate executed twice on exact `721c2c2`; G3, G4, and all Production actions remain separate |
| WP-6.6 P-24/G1R | Base `88d0711`, closure `050c998`, and exact final G1R `721c2c2` passed; G2 not inferred | Owner | 2026-07-13 | Migration `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; clean Local DB/concurrency/P-20/advisor/browser evidence and cleanup passed; bootstrap/Production unchanged |
| WP-6.6 P-24/G2 | Independent second clean rebuild and P-20 comparison passed on exact final candidate `721c2c2`; G3/G4 not inferred | Owner | 2026-07-13 | Same migration SHA; WP-6.6/WP-6.5 evidence, P-20 comparator, current advisor triage, repository gates, and final cleanup passed; bootstrap/Production unchanged |
| WP-6.6 P-25 final-review presentation | Bounded repository/static and approved standalone Local visual/interaction evidence passed; G3 not inferred | Owner + developer | 2026-07-14 | Real component/design-system bundle passed 27/27 checks at 710 total/709 affected rows on 1440x1000 and 390x844; no DB reset/mutation, migration, bootstrap, Production, P-18/P-19, WP-7, Factor F, or hotfix scope |
| WP-6.6 G3 technical walkthrough | Real-route stale-after-review, fresh-review recovery, audited abandon, and final Local invariants passed; owner accept/hold not inferred | Owner-authorized execution + developer evidence | 2026-07-14 | Source `6599c30`; review lock 1, mutation lock 2, stale publish denied with retained fields and no publish effect, abandon lock 3, pointer `2568.0.0`/710, zero drafts, all flags false, BOQ and Factor F unchanged; no reset or Production action |
| WP-6.6 P-26/P-27 G3 closeout | Exact application checkpoint accepted; WP-6.6 complete | Owner | 2026-07-14 23:50 +07 | Exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; P-26 confirmation/cancel/cleanup evidence accepted. G4, reset/bootstrap/WP-7, WP-8, and Production remain separate. |
| P-28/G4 repository integration | `020` bootstrap source inclusion and WP-7 harness source authorized; destructive execution held | Owner | 2026-07-15 | Repository/tests/docs only. Exact integration commit and static gates precede a separate warned Local reset approval; no Production, P-18/P-19, Factor F, or hotfix expansion. |
| P-29/G4E clean Local execution | Combined `009`-`020` bootstrap and live WP-6.6/WP-6.5/P-20/WP-7 evidence passed; WP-7 owner acceptance not inferred | Owner-authorized execution + developer evidence | 2026-07-15 | Exact execution checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; pointer `2568.0.0`, zero drafts, all flags false, BOQ 198/1,547 and Factor F `2569.0.0`/36 preserved; Production touched: No. |
| P-30 WP-7 acceptance and P-18/WP-7.5 start | WP-7 accepted; five-rule P-18 V1 contract accepted for bounded Local-only source implementation | Owner | 2026-07-15 01:37 +07 | Migration `021`, exact RPC/read model, Thai-first placement workspace, tests, and docs are authorized. Bootstrap inclusion, Local reset/evidence, WP-8, P-19, Factor F/hotfix expansion, feature enablement, publication, and Production remain separate. |
| P-31 WP-7.5 Source/Static acceptance | Exact checkpoint accepted for commit/push; WP-7.5 remains incomplete pending live evidence | Owner | 2026-07-15 10:24 +07 | Exact `4e3574a31a2697f4d727acabc8f55f34a4233bff`; migration `021` remains outside bootstrap and unapplied. Local reset/apply/live evidence, WP-8, P-19, Factor F/hotfix expansion, feature enablement, publication, and Production remain separate. |
| P-32 WP-7.5 Local live gate | Local reset/separate apply/live evidence authorized; first attempt failed closed, then same-scope replacement evidence passed | Owner-authorized execution + developer evidence | 2026-07-15 | Error `42704` exposed an unqualified constraint under fixed search path; amended `021` then passed clean-chain DB/browser/export evidence and final cleanup. No Production action. |
| P-33 WP-7.5 exact technical acceptance | Accepted for bounded technical scope; later UX/release gates remain open | Owner | 2026-07-15 13:54 +07 | Exact P-32 package accepted. WP-8 placement UX hard gates, bootstrap inclusion, P-19, feature enablement, publication, and Production remain separate. |
| P-34 WP-8 placement UX source/static | Exact `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` accepted as a historical bounded source/static checkpoint; WP-8 remains In progress | Owner + developer | 2026-07-15 | Technical provenance remains valid. Its direct relation-control presentation was rejected by first P-37 UAT and is superseded by the Note #33 insertion-gap correction; DB contract unchanged. |
| P-35 WP-8 bootstrap source integration | Exact source checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a` passed; destructive execution was held at this checkpoint | Owner + developer | 2026-07-15 | Unchanged amended `021` is after `020`; authority and executable contracts are aligned. P-36 remained separate and later passed; P-37/Production remain separate. |
| P-36 WP-8 destructive Local execution | Approved after explicit reset warning and passed for integrated technical scope | Owner + developer | 2026-07-15 | Exact gate/execution `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; integrated DB/regression/hash/export/advisor/route-render/cleanup evidence passed. Production touched: No. |
| P-37 WP-8 owner acceptance | Accepted under an explicit guided-UAT variance; WP-8 complete | Owner | 2026-07-25 | D005 completed the exact-source placement and same-request checks. Exact D007 on `8fb9839...` closed the stale-choice visual check. D009 passed the 710-row Full-import save/redirect correction; D008/D009 were audited-abandoned and final Local readback restored the disabled baseline without reset. Requested live guidance remains disclosed and is not relabelled independent. Add/Supplement stays hidden until P-14. |
| P-38 bounded Owner UAT | Evidence reconciliation, proportional execution, cleanup, and Owner disposition complete | Owner + developer | 2026-07-18 through 2026-07-25 | Retained functional Cards B-E plus Spots 1-3 and same-request Spot 4 satisfy the bounded execution; exact D007 on `8fb9839...` closed C-08; final cleanup restored pointer `2568.0.0`/710, zero drafts, and flags false without reset. P-37 was accepted under the explicit guided-UAT variance. |
| P-39 draft identity/release number | Initial Local-only architecture/source/migration/docs candidate completed; superseded by P-39R before live apply | Owner + developer | 2026-07-18 | Historical P39-S only; no Local apply/reset or Production action. |
| P-39R lifecycle/deployment hardening | P39R-S, incremental P39R-L, clean P39R-C, and owner P39R-U passed | Owner + developer | 2026-07-19 | `022`-`024` incremental and clean evidence passed; `2568.5.0-D001`/`D002` then proved target reuse. Production untouched. |
| P-40 exploratory-UAT correction | Exact source checkpoint pushed and developer browser QA passed; scored UAT pending | Owner + developer | 2026-07-19 | `dc83c35`; money/unit/withdraw/parser/E-03 ordering corrected without migration/reset/Production/Factor F/hotfix change; real-parser inputs 708/708/693 and 34 files/216 tests passed; separate one-draft QA restored disabled baseline and is not scored evidence. |
| P-41 P-38 discovery correction | Exact source, incremental smoke, and clean integrated chain passed; P-37/scored-UAT acceptance not inferred | Owner + developer | 2026-07-19 | UAT-06/UAT-07/UAT-08; `025` passed incremental and owner-approved clean execution; exact `adcca3939f3080cdf64bc6ad807051e9e85fed94`; all four smoke suites, canonical and final baseline passed. Fresh Cards A-G were open at this checkpoint; current P-42 closure is four spot-checks plus cleanup. |
| P-42 final-review correction and recovery | Exact corrections, recovery, retained functional cards, proportional exact-source execution, and cleanup passed; the Owner later accepted P-37 on 2026-07-25 under the guided-UAT variance | Owner + developer | 2026-07-19 through 2026-07-25 | Final-review `b2500b5e...`; recovery `f8c6709...`; evidence `1c901855...`; bounded findings `bdc104f...`; modal correction `16e88c6...`; D005 source `6fe3a6a...`; durable success `b639c03`; stale-choice notice `8fb9839...`; Full-import correction `df44b827...`. Final Local is pointer `2568.0.0`/710, zero drafts, all flags false, and unchanged BOQ/Factor F invariants. C-08/C-09 are passed under the disclosed guided-evidence boundary; no full replay, further reset, or Production action is authorized. |
| P-42 proportional spot-check correction | P42-UAT-C03/G01 corrected; Spot-check 1 retained; P-37 remained HOLD at this checkpoint | Owner + developer | 2026-07-22 | Exact `44f54a72b03549de995b431d6705ec1b2eeb3fa6` aligns the third import progress label and adds immutable full/two-attempt versus bounded/one-attempt cleanup scenarios without weakening persistence guards. D003 is audited-abandoned; Local is pointer `2568.0.0`/710, zero drafts, flags false. Only Spots 2-4 and corrected cleanup remain; no reset or Production action. |
| P-42 D004 import/cleanup and placement-modal correction | Spot-check 2 and schema-2 cleanup passed; P42-UAT-D01 corrected; P-37 remained HOLD at this checkpoint | Owner + developer | 2026-07-22 | D004 safely repeated E-01 with no persistence, then exposed the real nested-popover wheel failure. Exact `16e88c6487307c4bb0606a048dc53e05e9dcee18` keeps the searchable list inside the modal. Owner confirmed wheel and outside-click behavior; D004 cleanup restored pointer `2568.0.0`/710, zero drafts, flags false. At that checkpoint Spots 1-2 were retained and only exact-source Spots 3-4 plus final cleanup remained; the later D005 row records their execution. No migration, reset, or Production action. |
| P-42 final exact-source spot-check and cleanup | Execution passed; this was the pre-decision checkpoint and P-37 was later accepted on 2026-07-25 | Owner + developer | 2026-07-23 | Exact D005 source/session passed Spot 3 and same-request Spot 4; `b639c03` keeps recovered success visible. Exact D007 on `8fb9839...` displayed the stale-choice discard notice and cleanup restored the disabled baseline without reset. Production untouched. |
| P-43 PRE-P-12 authority reconciliation | Canonical order, one new corrected Local bootstrap, and structured authenticated GitHub human-review envelope approved for working-tree authority/tooling reconciliation | Owner + architecture/security reviewers | 2026-07-29 | Honest-but-fallible operational trust model; offline runner; no custom PKI. Git, Local execution, disposable rehearsals, Production, and P-12 remain separately gated. |
| P-44 PRE-P-12 source/tooling freeze | Exact reviewed 23-file commit/push from base `07d1d33` to `codex/master-catalog-phase4` authorized; no GO marker or PR | Owner + developer | 2026-07-29 | Excludes `files/`, `tmp/`, and `output/`. Resulting HEAD/Remote status is recorded outside its own commit. Local reset/application, disposable passes, Production, P-12, deploy, flags, publication, Factor F, hotfix, and Checklist-only GO commit remain separately gated. |
| P-45 PRE-P-12 authority/status checkpoint | Exact 11-file authority/status-only descendant commit/push from base `ed94c03` | Owner + developer | 2026-07-29 | Completed at pushed/upstream-equal `d92d8ced42fc882481ebc2c4579adcf1edbebea7`; historical after P-46 exposed a new defect. Protected untracked paths and later gates remained excluded. |
| P-46 PRE-P-12 corrected Local bootstrap | Exactly one destructive Local bootstrap after P-45 proof | Owner + developer | 2026-07-29 | Consumed once at `d92d8ce`. The warned reset rebuilt Local and applied through `025`; WP-6.5 then failed closed on helper callability. Evidence/checksums are preserved, one draft remains, Production was untouched, and no retry/cleanup/reset/patch is authorized. |
| P-47 PRE-P-12 helper-callability correction | Repository-only append-only `026` implementation/static review passed | Owner + developer | 2026-07-29 | Exact `026`/`20260729002600`/`472fa04b...` after immutable `025`; preserve body/owner/signature/defaults/search path, use invoker execution, grant only authenticated in addition to owner, and deny PUBLIC/anon/service. Repository/static closure passed 38 files/287 tests, focused 73/73, TypeScript, lint, syntax, authority, diff hygiene, and independent re-reviews. No Local/disposable/Git/kit/Production or adjacent-scope action is authorized. |
| P-48 PRE-P-12 replacement source publication | Exact one-commit/one-push 25-file allowlist from base `d92d8ce`; no PR | Owner + developer | 2026-07-29 | Git-only authorization for commit message `Close P-47 helper ACL correction`; exclude `files/`, `tmp/`, `output/`, every unrelated untracked path, Local/disposable/kit/Production, and all adjacent scopes. Resulting SHA/upstream/Remote truth must be recorded outside its own commit before any later request. |
| Production migration | P-12 COMPLETE | Owner + objective machine gates | 2026-08-16 through 2026-08-17 | Exact `017` -> `017a` -> `018`-`026`, final closeout, checksum-verified encrypted post-migration backup, isolated restore, and cleanup passed. All Phase 4 flags remain false; P-13 and every later gate remain separate. |
| Private-function default privilege | OPTION B IMMUTABLE; P-12 COMPLETE | Owner + architecture/security reviewers | 2026-07-28 through 2026-08-17 | [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md) records exact `017a` after `017` and before `018`; it was applied in that exact position. Do not edit applied `017`, `017a`, or `018`; [Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md) owns append-only `026`. |
| Pending-account authorization (P-49) | Business target approved; open/high implementation deferred under P-51 | Owner | 2026-08-18 | Pending remains profile/onboarding-only. Current cross-layer gaps remain real. P-49 is waived only as blocker for the exact first closeout. If that closeout is incomplete at 2026-08-25 23:59:59 +07, fresh explicit Owner reapproval is mandatory; otherwise there is no continuation. P-49 then re-enters before another Production deploy with a seven-day post-P-15 target. |
| Historical P-50R SOLO execution and P-50D stop | Exact `P50R-SOLO-REQ-20260821-V1` approval consumed; offline reconciliation complete `PASS_FOR_P50D_REQUEST`; [P-50D Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) ready but not approved | Owner-authorized local operator; Owner P-50D pending | 2026-08-21 through 2026-08-22 | Frozen review binding `55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc`; 28/28 PDF pages, 67/67 deltas, 245/245 exceptions, zero blockers, 49 proposed corrections and 18 source-version rows pending P-50D. No DB/Production/network/source/catalog/BOQ/pointer/Factor F mutation, commit, or push occurred. At this historical checkpoint the zero-price `2568.1.0` gate remained binding and P-50D/later gates were false. |
| Historical P-50D baseline-first Owner direction | Published/current `2568.0.0`/710 is the name/unit/price authority; historical V1 superseded without approval; [Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) / `P50D-REQ-20260823-V2` became the then-current choice request | Owner; technical/data comparison prepared locally | 2026-08-23 | P-50R frozen files/hashes remain immutable comparison evidence. The proposal began with an empty selected set and 49 pending external-source candidates; the later same-day row records the Owner's one-row selection intent and the V3 request. No DB/Production/network/catalog/BOQ/pointer/Factor F mutation, commit, push, or later gate. |
| Historical P-50D one-row `SELECTED-DELTA` intent and V3 freeze checkpoint | Owner selected only UUID `f2662c71-a6e5-407e-8456-8608e304b43b` / `ITEM-0429` / `COR-PB0-002`, `0/1763/1763 -> 0/1764/1764`, under V2; [Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) / `P50D-REQ-20260823-V3` froze the later exact manifest for separate approval | Owner selection intent; technical/data manifest prepared locally | 2026-08-23 | At this checkpoint, manifest SHA-256 was `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`; one selected record SHA-256 `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df`; other 48 candidate hash `2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be`. Other 709 baseline rows remained unchanged; `ITEM-0427`/`ITEM-0430`/`ITEM-0431` remained unselected; 48 unselected candidates were distinct from 17 authority exclusions; historical BOQ reprice was false. **V3/P-50C WERE FALSE AT THIS HISTORICAL CHECKPOINT; THE NEXT ROW RECORDS THEIR LATER APPROVAL/COMPLETION.** |
| Historical P-50D V3 confirmation hold and P-50C offline technical build | At this checkpoint V3 remained unauthorized pending exact Owner confirmation (ratification). [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md) recorded technical build `P50C-CANDIDATE-20260823-V1`; acceptance only as local review evidence was pending in the same decision | Owner + local technical/data execution | 2026-08-23 | Candidate SHA-256 `d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`; diff `72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18`; manifest `d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5`. Published `2568.0.0` remained `0/1763/1763`; offline provisional `2568.1.0` changed only `ITEM-0429` to `0/1764/1764`; 709 rows, all names/units/materials, adjacent findings, and historical BOQs remained unchanged. Registry check pending. **HISTORICAL REVIEW HOLD; later rows supersede it.** |
| P-50D V3 exact Owner ratification receipt / P-50C local-evidence acceptance | [Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md) records exact `P50D-REQ-20260823-V3` ratification and accepts `P50C-CANDIDATE-20260823-V1` only as local review evidence | Owner | 2026-08-24 00:44:15 +07 | **P-50D V3 DECISION COMPLETE / `decision-record-only`; P-50C ACCEPTED / `local-review-evidence-only`.** Published `2568.0.0` remains unchanged; provisional `2568.1.0` registry check remains pending. This receipt itself authorized no application, Git/CI, database/Production/network, P-13-P-15, deploy, or publication. Later P-50G/P-50H rows record their separately approved chronology. |
| P-50G exact small repository gate | [Proposal #55](./55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md) full SHA-256 approved; [Result #56](./56-phase4-p50g-small-repository-gate-result.md) records the one offline/read-only execution | Owner + local operator | 2026-08-24 02:07:26.798 +07 | **PASS / AUTHORIZATION CONSUMED ONCE / NO REPLAY.** `3` focused files / `30` tests and every named focused check passed. This row authorized no protected path, Git/CI, database/Production/network, candidate application, P-13-P-15, deploy, or publication. P-50H was later separately approved and consumed. |
| P-50H exact feature-branch Git/CI/Preview execution | [Proposal #57](./57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md) was approved by full proposal/manifest hashes; [Result #58](./58-phase4-p50h-local-git-ci-preview-result-record.md) records the one-time result | Owner + local operator | 2026-08-24 | **COMMIT/PUSH/REMOTE EQUALITY PASS; PREVIEW PASS; QUALITY `32661774094` FAIL; AUTHORIZATION CONSUMED; NO REPLAY.** Commit `2b45f9b...` is not release-qualified. No candidate application, DB/Production, P-13-P-15, deploy, or publication. |
| P-50I CI-hermetic fixture correction execution | [Proposal #59](./59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md) was approved; [Result #60](./60-phase4-p50i-local-validation-failure-result-record.md) records exact preflight/patch/hash PASS and local assertion failure | Owner + local operator | 2026-08-24 | **AUTHORIZATION CONSUMED / `21/22` AND `30/31` / NO GIT / NO REPLAY.** The exact test target is uncommitted; no new CI/Preview or Production action. |
| P-50J one-line marker-count correction proposal | [Proposal #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md) binds the line-anchor regex correction plus one exact Git/remote Quality/Preview envelope | Owner review pending | 2026-08-24 | **READY FOR OWNER REVIEW / NOT AUTHORIZED.** Current stop is before the P-50J patch/stage/commit/push/CI. No Production or later-gate authority. |
| Historical known price erratum and candidate-gate proposal (P-50/P-50R/P-50C) | Pre-P-15 full reconciliation direction recorded; exact P-50R request prepared; execution/P-50D/P-50C were pending at this checkpoint | Owner + price authority | 2026-08-18 | Preserve frozen `ITEM-0429`/`COR-PB0-002` evidence `0/1763/1763`; proposed `0/1764/1764` and adjacent findings required 100% reconciliation, exact price authority, ADR-003 classification, then a separately approved P-50C non-Production build/refreeze. [Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) defined the exact offline evidence envelope but authorized no protected-source read or execution. |
| Historical P-50R staged-gate refinement | Parent P-50R split into P-50R-I -> P-50R-O -> P-50R-X; next Owner decision was P-50R-I only | Owner + price authority + implementation/data reviewers | 2026-08-18 | P-50R-I/P-50R-O/P-50R-X were never executed and were superseded by P-50R SOLO. This row is chronology only. |
| Historical bounded closeout sequence (P-51) | Owner accepted temporary P-49 risk for exact first closeout; docs alignment only | Owner | 2026-08-18 | P-51D -> P-50R -> P-50D -> P-50C -> identifier binding -> Git/CI/Preview -> P-13 -> P-14 -> P-14C -> P-15 -> official artifacts/canaries/final flags/invariants/backup custody -> P-49. No operational action was authorized by this sequence record. |
| Historical P-50R SOLO simplification | Unexecuted I/O/X ceremony superseded by one offline/read-only self-reviewed gate | Owner as sole operator | 2026-08-21 | Request `P50R-SOLO-REQ-20260821-V1` retained exact five input hashes/counts, 100% coverage, two identical passes, 28-page/all-delta review, no DB/network/mutation, and separate P-50D. This row is the pre-execution authorization chronology; the SOLO run later completed. |
| Deploy / feature enable / Production candidate | One bounded P-13/P-14/P-14C window may be requested; P-15 stays separate | Owner/operator | P-50I stopped before Git; require separately approved P-50J plus green exact-head Quality and non-Production Preview before any P-13 proposal | P-50D V3 ratification, P-50G PASS, P-50H Git publication, and P-50I's local patch do not grant operating authority while Gate 1 is red. P-13 would deploy exact green bytes with all flags false and smoke only after a new bounded approval. On PASS, P-14 runs minimum-admin UAT; the UAT draft is abandoned and zero drafts/unchanged pointer are re-proven before P-14C creates exactly one locked unpublished draft. Failure restores flags false and stops. No operating gate or publication is currently authorized. |
| Publish named version | P-15 not requested | Owner | After exact P-14C draft preparation and review | P-15 must name the exact Production draft reference and review lock plus the reviewed target, pointer base/target, ratified manifest, dataset hash, rollback target, and canaries. The provisional local one-row candidate does not change published `2568.0.0`; ratification alone does not let it proceed to Git or Production. Official artifacts, canaries, final flags/invariants, and backup custody follow successful publication in that order; no publication is authorized. |

## References

- [Phase 4 Architecture, CI and Official Export Plan](./08-phase4-architecture-ci-plan.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
- [Execution Progress Tracker and authority/evidence index](./25-phase4-execution-progress-tracker.md)
- [P-50R SOLO Offline Price-Reconciliation Request](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md)
- [Historical P-50D Exact Price and Version Disposition Proposal](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md)
- [Historical P-50D Baseline-First Delta Review Proposal](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md)
- [Pending-confirmation P-50D One-Row Selected-Delta Proposal](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md)
- [P-50C One-Row Offline Candidate Result](./53-phase4-p50c-one-row-offline-candidate-result-record.md)
- [NT CI Runtime Asset Analysis](./24-phase4-nt-ci-runtime-asset-analysis.md)
- [P-37 Intended-Admin UAT and Placement UX Correction Note](./33-phase4-wp8-p37-uat-ux-correction-note.md)
- [P-37 Closure Matrix](./34-phase4-wp8-p37-closure-matrix.md)
