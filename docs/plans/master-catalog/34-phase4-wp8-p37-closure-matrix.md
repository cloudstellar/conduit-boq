# Phase 4 WP-8 P-37 Closure Matrix

**Status:** P-37 remains **HOLD for unresolved closure evidence**. The corrected
placement UI on exact pushed source
`f36d896d672609653de6634e307dcc44bce6d519` passed its named technical,
recovery, realistic-scale, keyboard, focus-return, and presentation checks.
Those checks are retained. They do not by themselves satisfy every WP-8 exit
gate because the owner keyboard session deliberately did not submit the final
placement batch, and the broader independent core-admin UAT, three safe-error
recoveries, and named import-preview/publish-readiness interaction baselines do
not yet have complete closure evidence.

**Decision posture:** Do not accept P-37, request P-12, enable
Add/Supplement, or infer Production readiness until every open row below is
closed or carries an explicit owner risk acceptance with rationale, owner, and
due date.

**Current continuation:** The first P-38 Card A run was stopped and safely
cleaned after the owner identified unexplained official-release gaps caused by
permanently reserving abandoned draft numbers. P-39R corrected that contract,
and P39R-U later passed with distinct `2568.5.0-D001`/`D002` references and the
same reusable unissued target. The live-collaboration continuation was
exploratory rather than scored; it found UAT-01 through UAT-05 and passed Card F
before exact disabled-baseline cleanup. Exact P-40 correction `dc83c35` is
pushed and separate one-draft developer browser QA passed its corrected unit,
money, and withdrawal paths before disabled-baseline readback. That assisted QA
did not close any independent row at that checkpoint. The later P-42 recovery
run and bounded-correction decision supersede that former full-rerun posture.
The evidence reconciliation remains complete in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md).
P-38 originally authorized bounded no-reset Local preparation and scored Owner
UAT. The
earlier P39-S result is historical; corrected P39R-S,
incremental P39R-L, and the separately approved P39R-C clean chain passed. The
clean execution source is exact pushed
`10531610eac53a97c6ef8f9d06418766b58bee36`.
The tracked harness, corrected E-01/E-02 input recipes, binary hashes, and
read-only disabled-baseline proof are recorded in
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md).
It does not authorize Local reset, successful publication, Production access,
Factor F work, hotfix expansion, or P-19.

Continued P-38 discovery then found UAT-06 through UAT-08. P-41 corrects the
category-key bound, retirement-disabled read-only Full preview, and
post-withdraw order compaction. Discovery drafts were closed and Local returned
to the disabled baseline before incremental `025` apply. Exact pushed source
`bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed the full source gates and
live WP-6.6 smoke. The owner then approved the warned Local reset; exact pushed
`adcca3939f3080cdf64bc6ad807051e9e85fed94` passed the clean `009`-`015`,
hotfix `016`, `017`-`025` chain, all four integrated smoke suites, canonical
verification, and final disabled-baseline readback. The failed discovery
placement attempt still does not close C-07; scored C-07 through C-11 remain
open. The first fresh scored Card A then stopped under P-42: an unbound
final-review URL allowed an old-looking tab to use the current lock, Local
`2568.5.0-D002` was published as `2568.5.0`, and the terminal page displayed
the false draft-only warning **อ้างอิงเวอร์ชันฐานเก่า**. Audit/gateway evidence
shows one current-lock publication, not a DB guard bypass. Cards B-G did not
continue. [Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md)
owns the source/UAT correction. The Owner subsequently approved the warned
clean recovery. Exact pushed source `f8c6709` restored `2568.0.0`/710 and
prepared a new immutable session. Cards A-G all passed functionally, but live
guidance and developer-operated Cards F-G mean the run is not strict
independent Owner evidence. D001/D002 were audited-abandoned and cleanup
restored zero drafts/all flags false. At that checkpoint P-37 remained HOLD
while bounded UX/procedure findings were corrected or explicitly disposed and
their corrected surfaces were independently checked.

The Owner approved the recommended bounded finding corrections on 2026-07-20.
Exact evidence checkpoint `1c901855a32b100013fb5c9472c2e909e3dd1c59`
preserves the completed recovery run, and exact source checkpoint
`bdc104f77f18ea8fc776950259bc25e68c2fd42a` implements all seven findings
without a migration or Local reset. Repository gates and clean read-only Local
status passed. The Owner retained the completed Card B-E functional evidence
and selected proportional revalidation: only the four post-correction Owner spot-checks
in Note #35 Section 1.2 plus cleanup remain. This does not change
the P-37 HOLD until those checks pass.

The proportional run on exact `fd36be2` passed Spot-check 1 and stopped during
Spot-check 2 on P42-UAT-C03/G01. E-01 correctly left the persistence action
absent, but the written check asked the Owner to find it and the step label
omitted **และ**. D003 was audited-abandoned. Legacy cleanup restored all Local
flags, then refused evidence closure because it required the historical
two-attempt Card A/G shape. Readback confirmed pointer `2568.0.0`/710, zero
drafts, flags false, unchanged BOQ/Factor F, and Production untouched. Exact
implementation `44f54a72b03549de995b431d6705ec1b2eeb3fa6` aligns the import label
and binds cleanup to immutable full/two-attempt or bounded/one-attempt
scenarios. Spot-check 1 remains valid; only Spots 2-4 and corrected cleanup are
open.

## 1. Why this matrix exists

The final P-37 owner session proved that the corrected placement interaction is
usable by keyboard and that the previous/new/next summary is understandable.
However, the controlling WP-8 plan still requires:

- independent admin UAT without developer or SQL assistance, including
  recovery from at least three safe validation errors;
- one complete placement task, including one UI batch confirmation and the
  accepted-state result;
- named 710-row import-preview, publish-readiness, export, and admin interaction
  baselines;
- authority documents whose current status agrees with those facts.

Review Note #33 truthfully records that the dangerous
**ยืนยันและบันทึกตำแหน่ง** action was never activated. Therefore its former
conclusion that no further placement submission was required exceeded the
recorded evidence. This matrix corrects only the gate accounting; it does not
invalidate the source fix, DB evidence, owner usability findings, or clean
Local cleanup.

## 2. Gate-to-evidence matrix

| ID | WP-8/P-37 gate | Current evidence | Status | Required closure |
|---|---|---|---|---|
| C-01 | Clean integrated Local chain through the current Phase 4 migration | Owner-approved exact pushed `adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied `009`-`015`, hotfix `016`, and `017`-`025`; canonical detected the complete range | Passed after P-41 | Preserve P39R-C as historical `024` evidence and P-41 as current `025` evidence; every future reset remains separately gated |
| C-02 | DB/RLS/role/rollback/race/idempotency/P-20/BOQ/Factor F invariants | Clean WP-6.5/WP-6.6/WP-7/WP-7.5 passed trigger inventory, post-withdraw `0..N-1`, relative order, exactly-one revision, rollback/race/replay, role/RLS, pointer, BOQ, Factor F, suffix, and no-Production assertions; evidence SHA-256 `4b69e44dde915ca25c3f78379a1c45b002b31cb8aebcbf361ec3b58670f9e245`, `e9e28eb1bb6f312a4638c0d67b00cb420864d5433295ffb80a95a12ee9e14251`, `5b6a01837d2836a33a000489ff6dad4519ca40ca67e48464cc384b84721c8195`, `0fd213f5ace8e077790d81a1c49b78a3fff3f1912a01aef5b52b7df6d1460240` | Passed after P-41 clean chain | Rerun affected harnesses only after later source/migration changes |
| C-03 | Tracked official export verification | P-11 exact pair was owner-accepted; P-36 regenerated and independently verified the active 710-row Excel/PDF evidence | Passed | Production filing remains P-15, not P-37 |
| C-04 | Security/performance advisor blocker review | P-36 returned no security blocker; baseline performance findings and the unused `v_row_count` are assigned to P-12 with owners and rationale | Passed for P-37 | Reassess/minimize before P-12; this is not a Production waiver |
| C-05 | Repository/source quality | Earlier exact recovery, bounded, and responsive checkpoints remain retained. Exact `44f54a72b03549de995b431d6705ec1b2eeb3fa6` corrects P42-UAT-C03/G01 and passed focused 2 files/22 tests, full 36 files/230 tests, TypeScript, lint 0 errors/10 existing warnings, authority 710/65/17, script syntax, network-enabled production build, and diff check | Passed for corrected source | Complete Spots 2-4 and corrected cleanup; no additional build is required unless application, dependency, or migration source changes again |
| C-06 | Placement comprehension, review by exception, keyboard, focus, and final presentation | Owner passed all named overview/gap/sibling/leave-reload/keyboard/focus/previous-new-next checks on no-reset `2568.15.0` | Passed for the exercised path | Do not repeat these controls unless the UI changes |
| C-07 | One complete independent placement task | P-42 recovery Card D functionally recorded one stale rejection with zero effect and exactly one accepted UI batch/change set. Exact `bdc104f77...` corrects D01 wheel scrolling and D02 stale-user-choice disclosure while preserving DB authority | Partial | Complete Spot-check 3; retain the accepted batch/current-order evidence without replaying it |
| C-08 | Stale-placement recovery inside the independent owner task | The prior Card D functionally passed two-tab stale rejection, fresh recovery, one accepted batch, and current-state readback. Exact `bdc104f77...` adds explicit stale-choice discard feedback | Partial | Complete Spot-check 3 without developer/SQL repair |
| C-09 | Independent core-admin UAT | Functional Cards B-E and accepted responsive finding P42-UAT-OV01 remain retained; Spot-check 1 passed on `fd36be2`; P42-UAT-C03/G01 are corrected by exact `44f54a7` without weakening guards | Open | Prepare one fresh exact-source `bounded-spot-check` fixture; complete Spots 2-4 and cleanup |
| C-10 | At least three safe validation-error/prevention recoveries | Retained safe recoveries remain valid. The latest E-01 run again returned `IMPORT_PRICE_AUTHORITY_REQUIRED` with no persistence; exact `44f54a7` corrects only the procedure/observability contract | Partial | Complete Spots 2-4; retain prior safe-error counts and zero-write evidence |
| C-11 | 710-row performance baseline | Retained P-36/P-42 measurements remain valid. Spot-check 1 passed add/PDF wording; Spot-check 2 stopped on action observability rather than performance | Partial | Rerun Spot-check 2 wording only; preserve existing measurements and export evidence |
| C-12 | Documentation consistency | Exact `44f54a7` aligns UI/test/harness contracts; Note #35, Preflight #36, Verification, Decision Register, Tracker, and this matrix record C03/G01 and proportional retention | Passed for current checkpoint | Preserve alignment after Spots 2-4; continue excluding `files/`, `tmp/`, and `output/` from commits |
| C-13 | Disabled clean Local baseline | Historical scored cleanup remains passed. Interrupted D003 closeout restored pointer `2568.0.0`/710, zero drafts, all flags false, and unchanged BOQ/Factor F; the legacy session remains unclosed evidence because its version-count assertion failed closed | Passed baseline; new scenario cleanup pending | Prove one successful schema-2 `bounded-spot-check` cleanup; every reset remains separately gated |

## 3. Minimal closure sequence

### A. Evidence reconciliation - complete, no database action

The manifest and gate map in Note #35 retain actor-independent evidence and do
not relabel implementer-driven RPC or route rendering as independent operator
interaction. No C-07 through C-11 gate was closed by reconciliation alone.

### B. Current source and Local recovery gates

Exact source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` is pushed and its
incremental Local smoke passed. After the explicit reset warning and approval,
exact execution source `adcca3939f3080cdf64bc6ad807051e9e85fed94`
clean-applied `009`-`015`, hotfix `016`, and Phase 4 `017`-`025`; all integrated
harnesses and the disabled-baseline readback passed. That evidence remains
valid for the unchanged DB contract, but the current Local environment is no
longer the scored baseline after P-42.

Exact P-42 source/docs/browser checkpoint
`b2500b5e6859a915bfa3f70d558934f252943f82` passed and is pushed. The Owner
then received the destructive-Local warning and approved one recovery
bootstrap. Exact pushed source `f8c6709` restored `2568.0.0`/710, zero drafts,
all flags false, BOQ 198/1,547, Factor F `2569.0.0`/36, pinned inputs
708/708/693, and live category maximum 96 under the 500-character contract.
The completed session was cleaned back to that baseline. No further reset is
authorized; a later independent rerun requires a new exact-source session and
its own reset decision only if the baseline has first become unsuitable.

Exact evidence checkpoint `1c901855a32b100013fb5c9472c2e909e3dd1c59`, bounded
source checkpoint `bdc104f77f18ea8fc776950259bc25e68c2fd42a`, and
Owner-accepted responsive checkpoint
`bcc041772b3f537de66b655c5115c4e3c2da9325` are the current correction basis.
They add no migration and did not reset Local. Source gates, a network-enabled
build, clean-baseline readback, and authenticated desktop/mobile containment
checks passed. Spot-check 1 then passed on exact `fd36be2`; exact `44f54a7`
corrects the bounded findings exposed in Spot-check 2 and closeout. Prepare a
fresh exact-source schema-2 `bounded-spot-check` session before Spots 2-4.

### C. One bounded no-reset Local owner spot-check

Use Note #35 Section 1.2 as the sole current script. Spot-check 1 is passed and
retained. It separates developer preflight from the remaining Spots 2-4 and
retains completed Card B-E functional, scale, error-recovery,
placement-acceptance, and export evidence.

Before handing over the browser, use Note #36 and the tracked
`db:local:p38:*` commands. The harness verifies inputs/baseline, never creates
or abandons an Owner draft, and keeps retirement disabled.

The scored UAT itself does not reset Local Supabase. The separately approved
P-42 recovery reset completed before session
`session-p42-scored-20260719-f8c6709.json` was prepared. That run passed
functionally but was guided/developer-assisted. Prepare one fresh exact-source
session with `--scenario bounded-spot-check` for only Spots 2-4 and cleanup;
this does not imply another reset or another full Card B-E run.

### D. Evidence and owner decision

1. Rerun focused authority/operator tests, the full suite, TypeScript, lint,
   authority check, production build when source changed, and diff checks.
2. Update Tracker, Verification Report, Decision Register, and this matrix with
   exact evidence and cleanup facts.
3. Commit and push the exact source/document checkpoint.
4. Ask the owner to accept or hold P-37 against that exact pushed checkpoint.

P-37 acceptance would close WP-8 and permit only a later P-12 request. It would
not authorize Production migration, deployment, feature enablement,
publication, P-19, Factor F work, or hotfix expansion.

## 4. Recorded non-blocking debt

| Debt | Current control | Owner | Due |
|---|---|---|---|
| Placement workspace is a large client component | Shared pure placement helpers, memoized derived maps, versioned browser storage, and one shared previous/new/next preview limit behavioral drift | Developer | Decompose only after P-37 and before adding another placement feature; do not destabilize the closing UAT candidate |
| Some UI regression assertions inspect source shape | DB/runtime tests plus owner keyboard UAT cover current behavior | Developer | Add component-level interaction coverage before the next focus/dialog/placement refactor |
| Existing lint/advisor findings and unused `v_row_count` | Zero lint errors; advisor findings and database warning have rationale, owner, and forward-fix rule | Developer + database/security reviewer | Before P-12 as recorded in the Verification Report |

These items are visible and assigned, so they are managed debt rather than a
hidden release assumption. None authorizes scope expansion before the open
P-37 evidence is closed.
