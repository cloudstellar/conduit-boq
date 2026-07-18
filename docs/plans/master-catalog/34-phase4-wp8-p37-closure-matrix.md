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
    permanently reserving abandoned draft numbers. P-39R now blocks continuation
until immutable draft references and reusable unissued targets pass the gates in
[Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md).
The evidence reconciliation remains complete in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md).
P-38 authorizes its bounded no-reset Local preparation and scored Owner UAT only
after the remaining P39R-L/P39R-C/P39R-U gates pass. The earlier P39-S result is
historical; corrected P39R-S passed on the current working-tree candidate.
The tracked harness, corrected E-01/E-02 input recipes, binary hashes, and
read-only disabled-baseline proof are recorded in
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md).
It does not authorize Local reset, successful publication, Production access,
Factor F work, hotfix expansion, or P-19.

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
| C-01 | Clean integrated Local chain through the current Phase 4 migration | P-36 exact checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6` passed through `021`; P-39R adds lifecycle `022` and published-code RLS correction `023` | Reopened for P39R-C | After complete P39R-S/P39R-L, run one separately approved clean bootstrap through `023` and retain the prior `021` evidence as historical |
| C-02 | DB/RLS/role/rollback/race/idempotency/P-20/BOQ/Factor F invariants | P-36 harnesses passed; later P-37 technical continuation proved stale rejection, one acceptance, exact replay, accepted readback, and cleanup | Passed technically | Retain; the owner UI path remains separate under C-07 |
| C-03 | Tracked official export verification | P-11 exact pair was owner-accepted; P-36 regenerated and independently verified the active 710-row Excel/PDF evidence | Passed | Production filing remains P-15, not P-37 |
| C-04 | Security/performance advisor blocker review | P-36 returned no security blocker; baseline performance findings and the unused `v_row_count` are assigned to P-12 with owners and rationale | Passed for P-37 | Reassess/minimize before P-12; this is not a Production waiver |
| C-05 | Repository/source quality | Exact source `f36d896d672609653de6634e307dcc44bce6d519` passed 33 files/184 tests, TypeScript, lint with 0 errors/10 existing warnings, authority 710/65/17, production build, and diff check | Passed | Rerun after any source change |
| C-06 | Placement comprehension, review by exception, keyboard, focus, and final presentation | Owner passed all named overview/gap/sibling/leave-reload/keyboard/focus/previous-new-next checks on no-reset `2568.15.0` | Passed for the exercised path | Do not repeat these controls unless the UI changes |
| C-07 | One complete independent placement task | Technical automation/RPC submitted and read back one accepted batch; the owner UI session reached final review but never activated **ยืนยันและบันทึกตำแหน่ง** | Open | In Card D of Note #35, record one rejected stale attempt with zero effect, then exactly one accepted UI batch/change set; observe accepted state and prove a later local edit returns to **ยังไม่บันทึก** |
| C-08 | Stale-placement recovery inside the independent owner task | Technical continuation proved stale rejection; owner separately proved leave/reload recovery and final review | Partial | Complete Note #35 Card D using two UI tabs in the same independent task without developer/SQL intervention |
| C-09 | Independent core-admin UAT | G1R/G3/P-26 and P-36 prove version planning, item edit, import context, final review, publish guards, export, abandon, and recovery technically; WP-4 proves a historical one-row file-picker preview | Open | Evidence reconciliation is complete. The intended admin must complete Note #35 Cards A-G on current routes without live developer help |
| C-10 | At least three safe validation-error recoveries | Several technical error paths exist, but no current WP-8 record identifies three errors completed by the intended admin in the independent session | Open | Record Note #35 E-01 invalid authority, E-02 retirement hold, and E-03 stale final review; stale placement and uncertain response remain separate evidence |
| C-11 | 710-row performance baseline | P-36 measured 710+18 placement/final-review routes at 607-1,136 ms, deep paging at 746 ms, and verified export; P-37 exercised search/preview/sibling/focus without material stutter | Partial | Reuse those named results and complete Note #35's Full 710-row import-preview plus publish-readiness/current-interaction measurements against the written budget |
| C-12 | Documentation consistency | P-39R authority amendment aligns ADR-003/004, plans, contracts, runbook, tracker, UAT, migration ledger, threat model, compatibility matrix, and executable checks | Passed for P39R-S; monitor | Authority consistency and full repository checks passed; rerun after any P39R-L/P39R-C/P39R-U evidence update |
| C-13 | Disabled clean Local baseline | Pointer `2568.0.0`/710, zero working drafts, all three catalog flags false, BOQ 198/1,547, Factor F `2569.0.0`/36; Production untouched | Passed | Repeat exact readback after the final bounded UAT fixture is audited-abandoned |

## 3. Minimal closure sequence

### A. Evidence reconciliation - complete, no database action

The manifest and gate map in Note #35 retain actor-independent evidence and do
not relabel implementer-driven RPC or route rendering as independent operator
interaction. No C-07 through C-11 gate was closed by reconciliation alone.

### B. One bounded no-reset Local owner UAT

Use Note #35 as the sole scored script. It separates developer preflight from
Owner Cards A-G, names the three non-destructive errors, clarifies that a stale
placement attempt must have zero effect before exactly one accepted batch, and
defines the measurement/cleanup record.

Before handing over the browser, use Note #36 and the tracked
`db:local:p38:*` commands. The harness verifies inputs/baseline, never creates
or abandons an Owner draft, and keeps retirement disabled.

This sequence does not require `npm run db:local:bootstrap` and must not reset
Local Supabase. If Note #35 preflight shows that a clean reset is actually
required, stop and obtain a new explicit destructive-reset approval first.

### C. Repository and owner decision

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
