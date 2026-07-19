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
does not close any independent row; a fresh scored Cards A-G rerun remains.
The evidence reconciliation remains complete in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md).
P-38 authorizes its bounded no-reset Local preparation and scored Owner UAT. The
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
owns the source/UAT correction and separately approved clean-recovery gate.

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
| C-05 | Repository/source quality | Exact pushed `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passed 34 files/220 tests, TypeScript, lint 0 errors/10 existing warnings, authority/input checks, syntax, network-enabled build, diff check, and Local smoke. Exact pushed `d00c941` corrected the prepare normalizer and produced the interrupted scored session. Exact pushed P-42 `b2500b5e6859a915bfa3f70d558934f252943f82` passed focused 3 files/26 tests, full 35 files/225 tests, TypeScript, lint, authority/input checks, network-enabled build, diff check, and published-state browser QA | Passed for P-42 source | Require successful clean recovery and new immutable prepare before scoring; rerun source gates after later evidence changes |
| C-06 | Placement comprehension, review by exception, keyboard, focus, and final presentation | Owner passed all named overview/gap/sibling/leave-reload/keyboard/focus/previous-new-next checks on no-reset `2568.15.0` | Passed for the exercised path | Do not repeat these controls unless the UI changes |
| C-07 | One complete independent placement task | Earlier technical acceptance remains valid; P-41 discovery reached placement but DB rejected a hidden post-withdraw order gap, correctly producing no accepted batch | Open | Card D must open without a gap warning, record one rejected stale attempt with zero effect, then exactly one accepted UI batch/change set and accepted-to-dirty state |
| C-08 | Stale-placement recovery inside the independent owner task | Technical continuation proved stale rejection; owner separately proved leave/reload recovery and final review | Partial | Complete Note #35 Card D using two UI tabs in the same independent task without developer/SQL intervention |
| C-09 | Independent core-admin UAT | Retained evidence remains valid; P-38 discovery through UAT-08 used live collaboration, and the first scored P-42 Card A is invalid because it ended in successful Local publication | Open | After exact P-42 and separately approved clean recovery, the intended admin must restart Note #35 Cards A-G from Card A without live developer help |
| C-10 | At least three safe validation-error/prevention recoveries | Technical `DRAFT_LOCK_CONFLICT` evidence remains valid. P-42 shows that requiring an intended admin to submit a known-stale destructive form is the wrong product gate | Open | Record Card A's URL-bound stale-review hard stop, hidden publication controls, latest-review recovery, and zero effect; then Card C E-01 invalid authority and E-02 retirement hold. Stale placement and uncertain response remain separate evidence |
| C-11 | 710-row performance baseline | P-36 measured 710+18 placement/final-review routes at 607-1,136 ms, deep paging at 746 ms, and verified export; P-37 exercised search/preview/sibling/focus without material stutter | Partial | Reuse those named results and complete Note #35's Full 710-row import-preview plus publish-readiness/current-interaction measurements against the written budget |
| C-12 | Documentation consistency | P-41 alignment passed. Exact pushed P-42 `b2500b5e6859a915bfa3f70d558934f252943f82` aligns the incident, review-lock contract, safer Card A, current Local state, and reset gate across Note #38 and the authority set; executable consistency/full repository checks passed | Passed for P-42 checkpoint | Rerun after scored evidence update |
| C-13 | Disabled clean Local baseline | P-41 clean-chain evidence remains valid historically, but current Local points to issued `2568.5.0`/710 with admin/new-identity flags true after interrupted Card A; Production is untouched | Open after P-42 incident | Obtain a new destructive-reset approval, bootstrap to pointer `2568.0.0`/710 with zero drafts/all flags false, and repeat exact readback after final scored cleanup |

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
`b2500b5e6859a915bfa3f70d558934f252943f82` passed and is pushed. Warn that
`npm run db:local:bootstrap` destroys the whole Local Supabase
stack and obtain a new explicit owner approval. Pointer restore alone is not a
clean scored recovery because issued Local `2568.5.0` would remain in history.
After an approved bootstrap, require exact `2568.0.0`/710, zero drafts, all
flags false, BOQ 198/1,547, Factor F `2569.0.0`/36, pinned-input verification,
and a new immutable prepared-session path.

### C. One bounded no-reset Local owner UAT

Use Note #35 as the sole scored script. It separates developer preflight from
Owner Cards A-G, places stale-review prevention in Card A before structured-code
additions, names the three non-destructive recovery states, clarifies that a stale
placement attempt must have zero effect before exactly one accepted batch, and
defines the measurement/cleanup record.

Before handing over the browser, use Note #36 and the tracked
`db:local:p38:*` commands. The harness verifies inputs/baseline, never creates
or abandons an Owner draft, and keeps retirement disabled.

The scored UAT itself does not reset Local Supabase. The separately approved
P-42 recovery reset must finish before the new session is prepared and handed
to the owner.

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
