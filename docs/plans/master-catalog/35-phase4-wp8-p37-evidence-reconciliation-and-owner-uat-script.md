# Phase 4 WP-8 P-37 Evidence Reconciliation and Owner UAT Script

**Status:** Evidence reconciliation and the fail-closed developer preflight
design are complete; P-37 remains **HOLD**. P39R-U Card A passed in the later
no-reset Local session: `2568.5.0-D001` was audited-abandoned and replacement
`2568.5.0-D002` received a new immutable draft reference while reclaiming the
same unissued target. The exploratory continuation used live developer
collaboration, discovered UAT-01 through UAT-05, and therefore does not close
the scored Cards A-G. Card F response-loss recovery passed as retained
discovery evidence; cleanup restored the disabled baseline. Exact P-40 source
checkpoint `dc83c35602fec81d124f43013824649664b8eecb` is pushed. A separate
one-draft developer browser QA then passed governed/custom unit selection,
Thai whole-number money normalization and invalid-money guidance, successful
withdrawal redirect, and notice persistence after reload. That assisted QA is
not scored Owner evidence; a fresh scored rerun remains required. See
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md). This
note defines the smallest current-route Owner UAT that can close Closure Matrix
#34 C-07 through C-11 without repeating evidence that already proves the same
actor-independent contract.

**Environment:** Local only, no reset. Production access/write, successful
publication or pointer movement, feature enablement outside the temporary Local
fixture, P-19, Factor F work, and hotfix `016` expansion are prohibited.

**Owner decision boundary:** P-38 authorizes documentation alignment and
preparation/execution of this bounded no-reset Local UAT. It does not accept
P-37. P-37 can be accepted or held only after the scored Owner tasks, cleanup,
evidence update, exact repository verification, commit, and push are complete.

## 1. Reconciliation conclusion

The retained evidence is valid and should not be rerun merely to obtain newer
screenshots. It proves the integrated database, security, idempotency,
placement, export, and realistic-scale application contracts. It does not
prove an action that the intended admin did not perform.

The remaining work is one written, independently executed Owner UAT. The
developer may prepare Local state, test workbooks, fault injection, recording,
and cleanup checks. During each scored task the Owner must use only the UI and
this written script, without live developer or SQL guidance.

The 2026-07-19 exploratory continuation is evidence for product correction,
not gate closure. It found:

- UAT-01: native exact-two-decimal validation produced an English browser
  message for otherwise safe whole-number prices;
- UAT-02: free-text units could drift from units already governed by the base
  catalog;
- UAT-03: successful withdrawal removed the row but left the operator on a
  now-missing item route;
- UAT-04: approved Excel cells store `source_row` and money as numbers, while
  the parser accepted only text representations;
- UAT-05: E-03 was sequenced after new structured codes made its publish action
  unreachable through the independent structured-code guard.

P-40 corrects those findings without a migration: shared Thai money
normalization, a base-version unit chooser with an explicit custom-unit path,
server-side withdrawal redirect and durable notice, safe numeric Excel-cell
normalization through the application parser, and E-03 moved into Card A before
Card B creates structured codes.

## 2. Retained evidence manifest

These paths remain reference/evidence artifacts and must not be staged merely
because this note cites them.

| Evidence | SHA-256 | Reusable conclusion | Does not close |
|---|---|---|---|
| `tmp/master-catalog/wp66-evidence/20260715-p36-910cc3c.json` | `cfe8e86107e032111eccdbf0dfad981a3a6e830d9ed83670caf2971b42f276e4` | Integrated WP-6.6 DB/RLS/workflow contracts | Independent operator behavior |
| `tmp/master-catalog/wp65-evidence/20260715-p36-910cc3c.json` | `65ca478b90dc4c0c598698c46bad93bb513ab0c503c058f58c540ce5b56ba0d8` | Reliability, replay, race, and P-20 contracts | Owner uncertain-response recovery |
| `tmp/master-catalog/wp7-evidence/20260715-p36-910cc3c.json` | `2a521c1025ce9cb9e044ec1b6aa507d5424d7f7a5fc42ce5065a93724fcd9a37` | BOQ suffix/hotfix/Factor F regressions | New hotfix or Factor F scope |
| `tmp/master-catalog/wp75-evidence/20260715-p36-910cc3c.json` | `eb8e4266929f6e09d736a9246035b82bc5f775923f4fd5cfe0eb0c381e514f45` | Placement roles, rollback, stale, replay, race, order, and hash | Final Owner UI placement commit |
| `output/master-catalog/review-artifacts/20260715T143822711Z-910cc3cc/artifact-manifest.json` | `10f3f103780cab2c76672d80d260039f186047a0aa00a9cfb95707798be530e5` | Active 710-row Excel/PDF generation and independent verification | Current draft review-export use by Owner |
| P-36 browser evidence recorded in Review Note #32 | `e6c1a00c51f14791de9dc37e4a5bffc8b953a37b90ec7011320b38eda9a5a944` | 710+18 placement/final-review/deep-page routes at 607-1,136 ms with no material stutter, overflow, or app error | Named import-preview and publish-readiness measurements |
| `output/master-catalog/g3-owner-review/20260714-6599c30-stale-after-review/qa-report.json` | `904989f6cfd480430d8059308df54794fbbbe007a7b6cdcbea76be24e64a26c1` | Real-route stale final-review rejection and recovery mechanics | Current independent Owner recovery |
| `output/master-catalog/g3-owner-review/20260714-p26-human-intent/qa-report.json` | `c26f3deafc06d2f14cba8c669232b9cead703e31307756606bdb467ff12dd233` | Publish/Recode/Retire confirmation guards | Owner completion of the current flow |
| `tmp/master-catalog/wp65-evidence/20260712T001809-browser-input-preserve-9becdf6.json` | `1d10690f6d487d1188a221e5d484fb30db278da1236fce05cb00302aadf5b029` | Same-request response-loss recovery and retained input mechanics | Owner recognizing and completing that recovery |
| `tmp/wp4-import-manual-proof.xlsx` | `0f45289d34b42ae3029b386ddcf4af0867e8b4a5de7416ed7ff554eb4b99d34f` | Owner used the binary file picker and validated one Supplement row on the historical global import route | Current exact-draft route, Full 710-row preview, or several new identities |

## 3. Reconciled closure map

| Gate | Reused evidence | Remaining scored evidence | Status before UAT |
|---|---|---|---|
| C-07 complete placement | C-02/C-06 technical, keyboard, focus, and presentation evidence | One current UI batch: one rejected stale attempt with zero effect, then exactly one accepted UI batch/change set; observe accepted state and accepted-to-local-dirty transition | Open |
| C-08 stale placement | Technical stale rejection plus separate Owner leave/reload recovery | Owner creates and recovers the stale response in the same placement task using two UI tabs, without developer/SQL action | Partial |
| C-09 core-admin UAT | G1R/G3/P-26 contracts and historical WP-4 picker proof | Current UI draft lifecycle, complete browse/history, manual add/withdraw, import review, placement, final review/readiness, review export, stale final review, and uncertain response | Open |
| C-10 three safe errors | Technical negative-path coverage | Owner recovers Card A E-03 stale final review before any structured-code add, then Card C E-01 invalid authority and E-02 retirement hold; stale placement and uncertain response are recorded separately and are not double-counted | Open |
| C-11 710-row baseline | P-36 placement/final-review/deep-page/export timings and P-37 no-stutter observations | Name and measure Full 710-row import preview, publish-readiness/final-review load, and current Owner interactions | Partial |

## 4. Developer preflight - not scored

Run this section before handing the browser to the Owner.

1. Confirm branch `codex/master-catalog-phase4`, exact pushed HEAD, and a clean
   tracked tree. Ignore and do not stage `files/`, `tmp/`, or `output/`. Run
   `npm run db:local:p38:verify-inputs`. Set `P38_SESSION` to a new untracked
   path under `tmp/master-catalog/p38-owner-uat/` as shown in Note #36, confirm
   it does not exist, and run `status` with that path; input verification and
   the read-only baseline must pass before `prepare`. Never overwrite a prior
   session record.
2. Read the Local baseline without mutation: pointer `2568.0.0`, 710 rows, zero
   working drafts, all catalog flags `false`, BOQ/BOQ-item counts unchanged,
   and Factor F default `2569.0.0` with 36 rows.
3. Confirm Local Supabase and the Local app are healthy. Do not run
   `npm run db:local:bootstrap`; this UAT must not reset Local Supabase.
4. Run `npm run db:local:p38:prepare -- --session "$P38_SESSION"` using the
   same recorded new path. The tracked harness must enable only the
   temporary Local admin and new-identity capabilities needed by the script.
   Keep the retirement capability disabled; retirement is previewed as a safe
   hold and is never applied. The harness must not create or abandon either
   Owner draft.
5. Record the exact signed-in active-admin email, browser/version, device,
   viewport, Local URL, source HEAD, and start time.
6. Prepare untracked, hash-recorded test inputs:
   - the approved Full reconciliation source
     `files/NT_Item_Code_Master_K_Mapping_2568.xlsx`; its 708 raw rows plus the
     frozen reconciliation context must resolve to the 710-row authority
     payload, while Production `2568.0.0` remains authority for names, units,
     and prices;
   - E-01, a Local-only derivative that replaces one frozen-mapped source code
     with one valid but unmapped candidate code; changing only a known mapped
     name/unit/price is not a valid test because the parser replaces those
     fields with Production authority;
   - E-02, a Local-only derivative with at least the exact retirement-threshold
     number of mapped identities omitted;
   - one official review-export workbook for the optional wrong-profile check.
7. Mark every derivative `LOCAL-UAT-ONLY-NOT-AUTHORITY`; never apply E-01 or
   E-02. Record file SHA-256 values and the expected diagnostic before use.
   The exact recipes/hashes and compatibility verification are controlled by
   [Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md).
   `verify-inputs` must execute the application's workbook adapter and
   `nt-item-master-2568` profile over every retained row; opening the files with
   ExcelJS alone is not sufficient parser evidence.
8. Supply three exact existing search examples representing the first, middle,
   and last portions of the 710-row catalog. Do not tell the Owner where the UI
   controls are or what result to select.
9. Prepare the tracked response-loss proxy for the later uncertain-response
   card, but do not inject failures into any other task.

If any baseline value is wrong, the tracked tree is dirty, or the input
manifest cannot be reproduced, stop. Do not repair with ad hoc SQL.

## 5. Owner UAT - scored UI tasks

The Owner reads this section and works without live assistance. Record the
visible Thai wording and outcome; support IDs are evidence aids, not business
approval.

### Card A - identity and draft lifecycle

1. Confirm the header shows the intended active admin and Local environment.
2. Open **บัญชีปัจจุบัน**, identify `2568.0.0` as Current, and explain why an
   existing working draft must be opened instead of creating a competing one.
3. Create a **ปรับปรุง/เพิ่มเติม** test draft, record its immutable draft
   reference and target version, then abandon it with a specific Local UAT
   reason.
4. Confirm the abandoned draft remains read-only under that reference and the
   target was not issued. Create a replacement and confirm it receives a new
   draft reference while reclaiming the same target.
5. Before adding any structured-code identity, open the replacement's final
   review/publish context, record the reviewed lock, and keep that tab open.
6. In a second UI tab, edit one inherited item's non-identity field with a
   clearly Local-only authority reference. Save and record the newer lock.
7. Return to the old review tab. Only when the two locks visibly differ,
   complete the old publish-confirmation form and submit. E-03 must return the
   durable Thai stale-review error, retain the entered form values, and produce
   no publication or pointer movement. If the locks do not differ, stop.
8. Load a fresh review and confirm it uses the newer lock. Do not perform a
   successful publication.

Pass: the Owner can explain one-working-draft, draft reference, target versus
official version, base-version, and abandoned/read-only behavior; E-03 is
recovered before structured-code additions and no irreversible action occurs.

### Card B - browse, history, manual add, and withdraw

1. Search the complete selected version using the supplied first, middle, and
   last examples; open one item and inspect field-level history.
2. Add three Local-only test identities through the UI using one approved
   existing category/code group, explicit UAT reason, and
   `LOCAL-UAT-ONLY-NOT-AUTHORITY` price reference.
3. Withdraw one never-published test identity through the UI. Explain that the
   temporary row is gone while identity, reserved code, and audit history are
   retained.
4. Confirm two new identities remain and that ordinary users/current BOQs are
   unaffected because the draft is not published/current.

Pass: complete search/history is understood, three adds produce three audited
effects, one withdraw produces one audited effect, and no inherited identity is
retired or deleted.

### Card C - import, 710-row measurement, and safe errors E-01/E-02

1. Open **นำเข้าชุดข้อมูล** from the exact replacement draft. Optionally select
   the official review-export workbook and confirm the Thai wrong-profile
   message explains that review export is not an import template.
2. Select the approved Full input. Explain **ครบทั้งบัญชี** versus
   **เฉพาะรายการเพิ่มเติม**, then prepare and ask the server to review the
   complete diff. Record client-prepare and server-review elapsed time, total,
   add/update/recode/retire/unchanged/omission counts, authority-field count,
   and source/payload hashes. The two Local-only identities added in Card B are
   intentionally absent from the 710-row authority payload and must therefore
   be visible as draft-only Full-import retire/omission candidates. The one
   inherited edit used for E-03 must also be visible as a reconciliation
   candidate. Do not apply the import.
3. E-01: select the invalid-authority derivative with no authority reference.
   It replaces mapped `CIC-PVC-001` with unmapped Local candidate
   `CIC-PVC-998`; it does not merely change a trusted mapped price. Record the
   Thai `IMPORT_PRICE_AUTHORITY_REQUIRED` rejection and zero-write state. Add
   the clearly Local-only authority reference, rerun server review, confirm
   that retirement remains disabled and Apply is unavailable, then stop.
4. E-02: select the retirement-hold derivative with no retirement approval or
   confirmed count. It omits 15 frozen-mapped rows; after Card B the expected
   server count is 17 because the two remaining Local-only identities are also
   absent. Record the Thai rejection and zero-write state. Enter the exact
   count displayed by the server plus Local-only approval reference, rerun
   validation, and confirm Apply remains unavailable for this UAT.
5. Return to the draft workspace without applying any import.

Pass: the Owner can explain source authority, Full/Supplement, omissions,
price authority, and dataset-versus-file hash; E-01/E-02 each show a durable
Thai error, a deliberate recovery, and no unintended write.

### Card D - placement, same-session stale recovery, and one accepted batch

1. Open **จัดตำแหน่งรายการใหม่**. Confirm only the two remaining new identities
   need placement; do not approve 710 inherited rows individually.
2. Inspect system suggestions, filter exceptions, change one insertion gap,
   set the two-row order within the same gap, use the supported leave/reload
   recovery, and return to final placement review.
3. Keep that placement page open. In a second UI tab, edit a descriptive or
   price field on one Local-only new identity with a UAT authority reference,
   save, and note that the draft lock advanced.
4. Return to the old placement tab and submit. Record the stale Thai message
   and confirm there is no placement change set/review from this rejected
   attempt.
5. Reload, review the current two-row batch, enter a real UAT placement reason,
   and submit. This must create exactly one accepted placement batch/change
   set. Observe the accepted state and final previous/new/next positions.
6. Change one browser-local insertion gap after acceptance. Confirm the page
   immediately replaces the accepted claim with
   **ปรับในหน้านี้ · ยังไม่บันทึก**. Do not submit this local-only adjustment.

Pass: stale recovery uses only the UI, one and only one batch is accepted, no
duplicate effect occurs, and accepted-to-dirty truthfulness is unmistakable.

### Card E - final review, readiness, and review export

1. Open the authoritative final comparison and record its load time, reviewed
   lock, row totals, compound changes, reverted/unchanged behavior, and
   publication-readiness result.
2. Confirm the current structured-code readiness blocker is visible after Card
   B and is consistent with the database guard. Do not bypass the blocker or
   attempt a successful publication.
3. Reload a fresh final review and verify that the displayed lock and totals
   remain current after the Card D placement acceptance.
4. Export the draft for review. In Excel/PDF locate version, draft status, row
   count, dataset hash, and binary file hash, and explain why those hashes have
   different purposes.

Pass: readiness truthfully explains the current blocker, fresh review matches
the current lock, and the review export is not mistaken for an import or
official published document.

### Card F - uncertain response

1. With the prepared response-loss proxy active, submit the designated harmless
   Local-only manual edit once.
2. Record the red Thai uncertain-response message. Confirm the entered target,
   reason, and authority fields remain present.
3. Retry without reconstructing the form. Confirm the same request ID returns
   the prior successful result, reports no second effect, and clears the form
   only after success.

Pass: the Owner recognizes uncertainty rather than failure, reuses the same
request, and observes exactly one change set/effect.

### Card G - safe close

1. Return to the replacement draft, inspect its audit history, and abandon it
   with a specific UAT cleanup reason.
2. Return to **บัญชีปัจจุบัน** and confirm `2568.0.0` is still Current.

Pass: no UAT draft remains mutable, no test version is published/current, and
the Owner reaches a safe screen without developer intervention.

## 6. Measurement and acceptance budget

Record raw timings; do not hide a slow result by reporting only subjective
language.

| Interaction | Recommended Local UAT budget | Required evidence |
|---|---|---|
| Search/filter/gap/sibling controls | Visible response without a repeated perceptible stall; investigate a repeated response above 250 ms | Observation plus measured sample when available |
| Final-review/publish-readiness route | Complete within 2,000 ms and no unexplained regression from the comparable P-36 1,086 ms route | Browser/device, elapsed time, row/affected count |
| Full 710-row client preparation plus server diff | Each phase completes within 5,000 ms, shows progress, and does not freeze navigation | Separate client/server elapsed times, total/diff counts |
| Review export | Reuse P-36 generation/verifier evidence; Owner must still locate version/status/count/dataset hash/binary hash | Current Owner observation plus retained P-36 manifest |

A single cold outlier may be repeated once. Two results above budget, material
stutter, focus loss, contradictory state, layout break, timeout, or app error
keeps C-11 open unless the Owner records an explicit accepted-risk rationale,
remediation owner, and due date.

## 7. Evidence record

| Card/gate | Result | Visible Thai message or key observation | Elapsed/browser | Evidence reference |
|---|---|---|---|---|
| A / C-09/C-10 draft lifecycle + E-03 | Pending scored rerun; P39R-U discovery passed |  |  |  |
| B / C-09 browse/manual/withdraw | Pending |  |  |  |
| C / C-09/C-10/C-11 import + E-01/E-02 | Pending |  |  |  |
| D / C-07/C-08 placement | Pending |  |  |  |
| E / C-09/C-11 review/readiness/export | Pending |  |  |  |
| F / C-09 uncertain response | Pending scored rerun; exploratory Card F passed |  |  | `tmp/master-catalog/wp65-evidence/p39ru-card-f-20260719-v2.json` |
| G / safe close | Pending |  |  |  |

Misunderstood wording, hesitation that changes the intended action, or any
developer-only recovery is a finding, not operator error. Stop the scored task,
record the exact screen/state, correct the product or procedure, and rerun only
the affected card on a fresh bounded fixture.

## 8. Developer cleanup and final gate update

After Card G:

1. Run `npm run db:local:p38:cleanup -- --session "$P38_SESSION"` with the
   exact path used by `prepare`. It must restore all temporary Local feature
   flags and must fail closed rather than abandon an Owner draft.
2. Read back pointer `2568.0.0`/710, zero working drafts, all catalog flags
   `false`, unchanged BOQ/BOQ-item invariants, and Factor F `2569.0.0`/36.
3. Confirm every rejected error produced zero unintended effect, the placement
   path produced exactly one accepted change set/review, uncertain retry
   produced one effect, both test drafts are audited-abandoned, their draft
   references differ, and their retained target is the same.
4. Record fixture/input/evidence hashes. Keep `files/`, `tmp/`, and `output/`
   untracked unless the Owner separately approves a tracked artifact.
5. Update Closure Matrix #34, Tracker, Verification Report, Decision Register,
   and this evidence table. Do not close a row with a partial or technically
   substituted result.
6. Run focused authority/operator tests, full tests, TypeScript, lint,
   authority check, build when application/dependency source changed, and diff
   checks. Commit and push the exact evidence checkpoint.
7. Only then ask the Owner to accept or hold P-37. Acceptance permits a later
   P-12 request only; it does not authorize any Production action.

This UAT requires no clean reset. If preparation discovers that a reset is
necessary, stop and obtain a new explicit destructive Local reset approval
before running `npm run db:local:bootstrap`.
