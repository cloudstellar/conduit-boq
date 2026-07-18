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

**Environment:** Documentation/evidence reconciliation only. No Local reset,
Local database mutation, feature enablement, publication, Production access,
Factor F work, hotfix expansion, or P-19 decision is authorized by this note.

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
| C-01 | Clean integrated Local chain through `021` | P-36 exact checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6` applied `009`-`015`, hotfix `016`, and Phase 4 `017`-`021` | Passed | No rerun unless migration/bootstrap/toolchain source changes |
| C-02 | DB/RLS/role/rollback/race/idempotency/P-20/BOQ/Factor F invariants | P-36 harnesses passed; later P-37 technical continuation proved stale rejection, one acceptance, exact replay, accepted readback, and cleanup | Passed technically | Retain; the owner UI path remains separate under C-07 |
| C-03 | Tracked official export verification | P-11 exact pair was owner-accepted; P-36 regenerated and independently verified the active 710-row Excel/PDF evidence | Passed | Production filing remains P-15, not P-37 |
| C-04 | Security/performance advisor blocker review | P-36 returned no security blocker; baseline performance findings and the unused `v_row_count` are assigned to P-12 with owners and rationale | Passed for P-37 | Reassess/minimize before P-12; this is not a Production waiver |
| C-05 | Repository/source quality | Exact source `f36d896d672609653de6634e307dcc44bce6d519` passed 33 files/184 tests, TypeScript, lint with 0 errors/10 existing warnings, authority 710/65/17, production build, and diff check | Passed | Rerun after any source change |
| C-06 | Placement comprehension, review by exception, keyboard, focus, and final presentation | Owner passed all named overview/gap/sibling/leave-reload/keyboard/focus/previous-new-next checks on no-reset `2568.15.0` | Passed for the exercised path | Do not repeat these controls unless the UI changes |
| C-07 | One complete independent placement task | Technical automation/RPC submitted and read back one accepted batch; the owner UI session reached final review but never activated **ยืนยันและบันทึกตำแหน่ง** | Open | In one bounded owner session, submit once through the UI, observe the accepted state, then prove a later local edit returns to **ยังไม่บันทึก** without duplicate effects |
| C-08 | Stale-placement recovery inside the independent owner task | Technical continuation proved stale rejection; owner separately proved leave/reload recovery and final review | Partial | Include one safe stale response and recovery in the same independent UAT session without developer/SQL intervention |
| C-09 | Independent core-admin UAT | G1R/G3/P-26 and P-36 prove version planning, item edit, import context, final review, publish guards, export, abandon, and recovery technically; current authority still labels broader independent UAT incomplete | Open | Reconcile existing evidence, then have the intended admin complete only the missing create/import/manual/history/final-review/publish-readiness/review-export steps from an approved script without live developer help |
| C-10 | At least three safe validation-error recoveries | Several technical error paths exist, but no current WP-8 record identifies three errors completed by the intended admin in the independent session | Open | Record three named non-destructive errors, the Thai message shown, operator recovery, and proof of no unintended write |
| C-11 | 710-row performance baseline | P-36 measured 710+18 placement/final-review routes at 607-1,136 ms, deep paging at 746 ms, and verified export; P-37 exercised search/preview/sibling/focus without material stutter | Partial | Name or measure the remaining 710-row import-preview, publish-readiness, and admin interaction observations required by the Execution Pack; accept any exception explicitly |
| C-12 | Documentation consistency | Tracker, Verification Report, Decision Register, migration ledger, review notes, and Note #34 now distinguish retained evidence from C-07 through C-11; executable authority checks passed 1 file/7 tests and the full suite passed 33 files/184 tests | Passed | Keep the consistency assertions green after every current-status or gate change |
| C-13 | Disabled clean Local baseline | Pointer `2568.0.0`/710, zero working drafts, all three catalog flags false, BOQ 198/1,547, Factor F `2569.0.0`/36; Production untouched | Passed | Repeat exact readback after the final bounded UAT fixture is audited-abandoned |

## 3. Minimal closure sequence

### A. Evidence reconciliation - no database action

1. Map every prior G1R/G2/G3/P-26/P-36/P-37 artifact to C-07 through C-11.
2. Reuse evidence only when it names the same route, actor type, expected
   behavior, and recovery outcome required by the gate.
3. Do not relabel implementer-driven RPC or route rendering as independent
   operator interaction.
4. Produce the short owner UAT script only for rows that remain open.

### B. One bounded no-reset Local owner UAT

The developer may prepare the Local fixture, approved input workbook, and
written Thai script before the session. During the scored session the intended
admin must not need live developer or SQL assistance.

1. Confirm signed-in admin identity, Local environment, Current version, and
   the exact working draft.
2. Complete the missing version/create/import/manual/history/final-review/
   publish-readiness/review-export steps identified by reconciliation.
3. Recover from three preselected safe validation errors. Record the visible
   Thai message, the admin's next action, and proof that no unintended write
   occurred.
4. On the 710+realistic-new-row placement workspace, inspect system suggestions,
   filter exceptions, adjust one gap and sibling order, leave/reload, and
   recover one stale-placement response.
5. Review the complete impact, enter a real UAT reason, and activate
   **ยืนยันและบันทึกตำแหน่ง** exactly once through the UI.
6. Verify the accepted state and exact batch result. Make one browser-local
   adjustment afterward and verify the accepted claim is replaced by
   **ปรับในหน้านี้ · ยังไม่บันทึก**.
7. Record the remaining import-preview, publish-readiness, export, and admin
   interaction observations against the 710-row baseline.
8. Audited-abandon the fixture and repeat the exact disabled-baseline readback.

This sequence does not require `npm run db:local:bootstrap` and must not reset
Local Supabase. If evidence reconciliation shows that a clean reset is actually
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
