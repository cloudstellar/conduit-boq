# Phase 4 WP-8 P-37 Evidence Reconciliation and Owner UAT Script

**Status:** Evidence reconciliation and the fail-closed developer preflight are
complete; P-37 remains **HOLD**. After the P-42 incident, the Owner separately
approved one warned recovery bootstrap. Exact pushed source
`f8c670901997a4e6663db7c4db1218efc03d51c6` restored the canonical Local
`2568.0.0`/710 baseline and prepared immutable session
`tmp/master-catalog/p38-owner-uat/session-p42-scored-20260719-f8c6709.json`.
Cards A-G then passed their functional contracts, including stale-review
prevention, three-add/one-withdraw, 710-row read-only import checks, one stale
and one accepted placement batch, final review/export, same-request
response-loss recovery, and safe abandonment. The Owner received live guidance
and the developer operated parts of Cards F-G, so this run is product and
functional evidence rather than strict independent Owner-scored closure.

Both test drafts, `2568.1.0-D001` and `2568.1.0-D002`, are audited-abandoned
against the same unissued target `2568.1.0`. Cleanup passed with pointer
`2568.0.0`/710, canonical hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
zero working drafts, all three catalog flags `false`, unchanged BOQ/Factor F
invariants, no post-prepare reset, and no Production action. Bounded source and
procedure corrections for findings P42-UAT-B01, C01/C02, D01/D02, E01, and
F02 are recorded in Section 1.1. The completed Card B-E functional evidence
remains valid; only the four bounded post-correction spot-checks in Section 1.2
remain. See
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md) and
[Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md).
The untracked consolidated evidence index is
`tmp/master-catalog/p38-owner-uat/p42-owner-uat-functional-summary.json`; it is
Local evidence and must not be staged or committed.

**Environment:** Local only. The separately approved P-42 recovery reset is
complete; Cards A-G themselves performed no reset. No further reset is
authorized. Production access/write, successful publication or pointer
movement during UAT, feature enablement outside the temporary Local fixture,
P-19, Factor F work, and hotfix `016` expansion remain prohibited.

**Owner decision boundary:** The Owner approved the recovery reset and later
delegated developer-assisted completion of the remaining functional checks.
That delegation does not accept P-37 or waive independent Owner evidence. P-37
can be accepted or explicitly risk-accepted only after findings are disposed,
the four correction surfaces are checked by the Owner from the written script
on a fresh exact-source fixture, cleanup passes again, and the
evidence/docs/repository checkpoint is complete. The full Card B-E workflows
must not be repeated merely to replace valid evidence.

## 1. Reconciliation conclusion

The retained evidence is valid and should not be rerun merely to obtain newer
screenshots. It proves the integrated database, security, idempotency,
placement, export, and realistic-scale application contracts. It does not
prove an action that the intended admin did not perform.

The remaining work is one written, independently executed four-point
post-correction check. The developer may prepare Local state, test workbooks,
fault injection, recording, and cleanup checks. The Owner uses only the UI and
Section 1.2; prior Card B-E functionality, scale, hashes, and error recovery are
retained rather than replayed.

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
- UAT-06: `categoryCode` was treated as a short code even though the versioned
  authority dictionary uses full labels (current Local maximum 96 characters).
- UAT-07: a Full preview with retirement effects failed while retirement was
  disabled instead of returning a complete read-only diff with
  **ยืนยันและบันทึกลงฉบับร่าง** hidden.
- UAT-08: withdrawing a draft-only row left a `display_order` gap; the client
  masked it by resequencing while the database placement guard correctly
  rejected the batch.
- UAT-09: final-review URLs did not preserve the reviewed lock, so an old tab
  could silently become current and make the scripted stale submission valid.
- UAT-10: after successful publication, draft-only stale-base and comparison
  wording remained visible and made success look like rejection.

P-40 corrects those findings without a migration: shared Thai money
normalization, a base-version unit chooser with an explicit custom-unit path,
server-side withdrawal redirect and durable notice, safe numeric Excel-cell
normalization through the application parser, and E-03 moved into Card A before
Card B creates structured codes.

P-41 keeps the accepted guards and adds a shared 500-character category-key
contract with live maximum preflight, non-persistent read-only preview
semantics, client gap rejection, and forward-only `025` compaction.

P-42 adds no migration. It binds mutable review routes to `reviewLock`, blocks
a mismatched old tab without diff/publish controls, preserves lock context on
return, restricts stale-base wording to drafts, and renders terminal review as
read-only history. The DB stale-lock guard remains final authority; the Owner
script no longer asks a user to submit a request already known to be stale.

### 1.1 Bounded P-42 finding corrections

The following corrections stay inside the existing Phase 4 architecture and
add no migration, capability, Production action, or new business workflow.
They require only the matching spot-check in Section 1.2 before the finding can
close; they do not invalidate completed Card B-E evidence.

| Finding | Bounded correction | Gate state |
|---|---|---|
| `P42-UAT-B01` | After a successful manual add, the server action reads the audited `catalog_change_items` add snapshot and returns the allocated code/identity for a direct item link; allocation remains database-owned and the current list context is preserved | Implemented; Spot-check 1 pending |
| `P42-UAT-C01` | Card C now names **เตรียมรายการตรวจสอบ** as browser-only preparation and **ให้เซิร์ฟเวอร์ตรวจผลต่าง** as the point where server authority/retirement rules run | Procedure corrected; Spot-check 2 pending |
| `P42-UAT-C02` | Owner-facing instructions use the visible Thai action **ยืนยันและบันทึกลงฉบับร่าง** and no longer use “Apply” | Procedure corrected; Spot-check 2 pending |
| `P42-UAT-D01` | The insertion-gap list handles wheel/trackpad movement on its actual scroll container before modal body-scroll containment consumes the event; scrollbar dragging and keyboard behavior remain unchanged | Implemented; Spot-check 3 pending |
| `P42-UAT-D02` | Browser-only placement storage is schema 3, records whether the admin actually changed a suggestion, discards stale lock/revision keys, and shows an explicit warning before any fresh confirmation | Implemented; Spot-check 3 pending |
| `P42-UAT-E01` | The export menu says **เปิดหน้าพิมพ์/บันทึก PDF**, matching the browser print/save-PDF behavior | Implemented; Spot-check 1 pending |
| `P42-UAT-F02` | Uncertain transport outcomes use diagnostic code `CATALOG_OUTCOME_UNCERTAIN` while retaining the same request ID and replay-safe input | Implemented; Spot-check 4 pending |
| `P42-UAT-OV01` | The fixed 380 px overview activity rail now renders compact imports/change sets as stacked lists, applies `min-width: 0` through the rail, and keeps generic tables inside an overflow container | Exact `bcc041772b3f537de66b655c5115c4e3c2da9325`; Owner accepted before Spot-check 1 |

The added-code confirmation is presentation enrichment from the immutable
audit effect; failure of that follow-up read cannot reverse or duplicate the
already committed mutation. Placement recovery remains session storage only,
and database lock/revision checks remain the final authority.

`P42-UAT-OV01` was found before a test draft was created. At the Owner's
1,443 px viewport, the 380 px card contained a 543 px table and expanded the
document beyond the viewport. After exact `bcc0417`, the card and content have
equal contained widths, the document has no horizontal overflow, and the
390 x 844 mobile check also has no overflow. The Owner confirmed **อยู่ในกรอบแล้ว**.
This accepted pre-check does not add a fifth spot-check or invalidate retained
Card B-E evidence. The initial prepared session at `738be76` created no draft;
its flags were restored after the application source advanced, so a fresh
exact-source no-reset session is required before Step 1.

### 1.2 Minimal post-correction Owner spot-check

This is the current Owner script. Do not repeat the full Card B-E procedures in
Section 5. The developer prepares one no-reset draft and performs cleanup; the
Owner checks only these four visible outcomes without live developer or SQL guidance.
The written steps may be reviewed before starting:

1. **Add result + PDF wording:** add one Local-only item. Confirm the success
   message shows its allocated code and a direct item link. Open
   **ส่งออกเพื่อตรวจ** and confirm the PDF command says
   **เปิดหน้าพิมพ์/บันทึก PDF**; do not generate a new acceptance artifact.
2. **Import wording:** open **นำเข้าชุดข้อมูล** and confirm the visible order is
   **เตรียมรายการตรวจสอบ** → **ให้เซิร์ฟเวอร์ตรวจผลต่าง** →
   **ยืนยันและบันทึกลงฉบับร่าง**. Use E-01 only when needed to expose the final
   disabled action; do not save an import.
3. **Placement scroll + stale choice:** open placement, open the insertion-gap
   list, and wheel/trackpad-scroll it. Change one gap without confirming and
   keep this tab open. Do not confirm a new placement batch.
4. **Uncertain retry:** after the developer switches the Local app to the
   response-loss proxy, use a second tab to submit the designated harmless edit
   once. Confirm code `CATALOG_OUTCOME_UNCERTAIN`, retained form values, and one
   same-request retry succeeds without a second effect. Return to the placement
   tab, reload, and confirm the page explicitly says the old browser choice was
   discarded because the edit advanced the draft lock.

Pass requires four concise Owner observations plus tracked cleanup. Existing
Card B-E counts, timing, placement acceptance, hashes, exports, and safe errors
remain authoritative and are not repeated.

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
| C-07 complete placement | P-42 recovery retained one stale rejection with zero effect and exactly one accepted UI batch/change set | Spot-check 3 verifies the corrected insertion-gap scroll without submitting another batch | Partial |
| C-08 stale placement | The retained two-tab recovery and accepted-state readback passed | Spots 3-4 verify that a real lock advance explicitly discards the stale browser-only choice | Partial |
| C-09 core-admin UAT | Functional Cards A-G, including complete Card B-E workflows, are retained | Four Owner-visible correction spot-checks plus clean closeout | Open |
| C-10 three safe recovery states | Card A stale-review, Card C E-01/E-02, Card D stale placement, and Card F uncertain-response recovery passed without unintended writes | Spots 2-4 verify only the corrected wording, stale-choice disclosure, and uncertain-outcome code | Partial |
| C-11 710-row baseline | P-36 timings plus P-42 Card C phases under 1 second and Card E about 1 second are retained | Spots 1-2 verify only corrected import/export wording; do not rerun scale measurements | Partial |

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
   Confirm the canonical detector reports Phase 4 `017`-`025` and the exact
   withdraw-compaction trigger before preparing the scored fixture.
4. Run `npm run db:local:p38:prepare -- --session "$P38_SESSION"` using the
   same recorded new path. The tracked harness must enable only the
   temporary Local admin and new-identity capabilities needed by the script.
   Before changing flags, `prepare` must prove the longest live category key
   fits the shared 500-character application contract.
   Keep the retirement capability disabled; retirement is previewed as a safe
   hold and is never applied. The harness must not create or abandon the Owner
   test draft.
5. Record the exact signed-in active-admin email, browser/version, device,
   viewport, Local URL, source HEAD, and start time.
6. Reverify the retained official/E-01/E-02 input hashes through
   `verify-inputs`, but hand the browser only E-01 if Spot-check 2 needs a
   prepared preview to expose the final disabled action. Do not rerun the Full
   or E-02 workflow. Production `2568.0.0` remains authority for names, units,
   and prices.
7. Keep every derivative marked `LOCAL-UAT-ONLY-NOT-AUTHORITY`; never click
   **ยืนยันและบันทึกลงฉบับร่าง**. The exact recipes/hashes and compatibility
   verification remain controlled by
   [Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md).
8. Prepare the tracked response-loss proxy for Spot-check 4, but do not inject
   a failure into setup or Spots 1-3.
9. Prepare one cleanup path that abandons the test draft through the UI after
   the Owner observations, then runs the tracked cleanup/readback harness.

If any baseline value is wrong, the tracked tree is dirty, or the input
manifest cannot be reproduced, stop. Do not repair with ad hoc SQL.

## 5. Owner UAT - scored UI tasks

This section preserves the completed full-run contract and evidence lineage.
For the current post-correction session, use only Section 1.2.

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
   review/publish context. Record the `reviewLock` in the URL and the matching
   **ฉบับตรวจ รุ่นแก้ไข** value on the page, then keep that tab open.
6. In a second UI tab, edit one inherited item's non-identity field with a
   clearly Local-only authority reference. Save and record the newer lock.
7. Return to the original review tab and reload that same URL. Only when the
   two locks visibly differ, confirm that the page says the tab is an old review,
   shows both lock values, does not display the diff or publication form, and
   offers **เปิดฉบับตรวจล่าสุด**. Do not attempt to publish from this tab. If
   the locks do not differ or publication controls remain visible, stop.
8. Use **เปิดฉบับตรวจล่าสุด** and confirm the URL/page uses the newer lock.
   Confirm the Local pointer/version did not move. Do not perform a successful
   publication.

Pass: the Owner can explain one-working-draft, draft reference, target versus
official version, base-version, and abandoned/read-only behavior; the stale
review is prevented and recovered before structured-code additions, the DB
stale guard remains covered by retained technical evidence, and no irreversible
action occurs.

### Card B - browse, history, manual add, and withdraw

1. Search the complete selected version using the supplied first, middle, and
   last examples; open one item and inspect field-level history.
2. Add three Local-only test identities through the UI using one approved
   existing category/code group, explicit UAT reason, and
   `LOCAL-UAT-ONLY-NOT-AUTHORITY` price reference.
3. Withdraw one never-published test identity through the UI. Explain that the
   temporary row is gone while identity, reserved code, and audit history are
   retained. Confirm the workspace returns safely and placement can later load
   without an order-gap warning.
4. Confirm two new identities remain and that ordinary users/current BOQs are
   unaffected because the draft is not published/current.

Pass: complete search/history is understood, three adds produce three audited
effects, one withdraw produces one audited effect, no inherited identity is
retired/deleted, and the surviving draft order remains contiguous.

### Card C - import, 710-row measurement, and safe errors E-01/E-02

1. Open **นำเข้าชุดข้อมูล** from the exact replacement draft. Optionally select
   the official review-export workbook and confirm the Thai wrong-profile
   message explains that review export is not an import template.
2. Select the approved Full input. Explain **ครบทั้งบัญชี** versus
   **เฉพาะรายการเพิ่มเติม**. Click **เตรียมรายการตรวจสอบ** first; this reads
   and normalizes the file in the browser and does not yet test it against the
   draft. After preparation succeeds, click **ให้เซิร์ฟเวอร์ตรวจผลต่าง**;
   server-side authority, retirement, and draft rules are evaluated only at
   this step. Record browser-prepare and server-review elapsed time, total,
   add/update/recode/retire/unchanged/omission counts, authority-field count,
   and source/payload hashes. The two Local-only identities added in Card B are
   intentionally absent from the 710-row authority payload and must therefore
   be visible as draft-only Full-import retire/omission candidates. The one
   inherited edit used for E-03 must also be visible as a reconciliation
   candidate. Do not click **ยืนยันและบันทึกลงฉบับร่าง**.
3. E-01: select the invalid-authority derivative with no authority reference.
   It replaces mapped `CIC-PVC-001` with unmapped Local candidate
   `CIC-PVC-998`; it does not merely change a trusted mapped price. Record the
   Thai `IMPORT_PRICE_AUTHORITY_REQUIRED` rejection and zero-write state. Add
   the clearly Local-only authority reference, click
   **เตรียมรายการตรวจสอบ** again and then **ให้เซิร์ฟเวอร์ตรวจผลต่าง**.
   Confirm that retirement remains disabled and
   **ยืนยันและบันทึกลงฉบับร่าง** is unavailable, then stop.
4. E-02: select the retirement-hold derivative with no retirement approval or
   confirmed count. It omits 15 frozen-mapped rows; after Card B the expected
   server count is 17 because the two remaining Local-only identities are also
   absent. Record the Thai rejection and zero-write state. Enter the exact
   count displayed by the server plus Local-only approval reference, click
   **เตรียมรายการตรวจสอบ** again and then **ให้เซิร์ฟเวอร์ตรวจผลต่าง**.
   Confirm **ยืนยันและบันทึกลงฉบับร่าง** remains unavailable for this UAT.
5. Return to the draft workspace without clicking
   **ยืนยันและบันทึกลงฉบับร่าง**.

Pass: the Owner can explain source authority, Full/Supplement, omissions,
price authority, and dataset-versus-file hash; E-01/E-02 each show a durable
Thai error, a deliberate recovery, and no unintended write.

### Card D - placement, same-session stale recovery, and one accepted batch

1. Open **จัดตำแหน่งรายการใหม่**. Confirm only the two remaining new identities
   need placement; do not approve 710 inherited rows individually. If the page
   reports a preexisting order gap or cannot build the preview, stop Card D and
   record the failure; do not bypass or repair it manually.
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
| Overview / responsive containment | Passed after bounded correction | **รายการล่าสุด** remains inside its card without window resizing; compact activity is a readable vertical list | Local in-app Browser at 1,443 px and 390 x 844 | Exact `bcc041772b3f537de66b655c5115c4e3c2da9325`; Owner confirmation 2026-07-20 |
| A / C-09/C-10 draft lifecycle + stale-review prevention | Functional pass; strict score HOLD because live guidance was used | D001 abandoned; D002 reused target `2568.1.0`; old review lock `0` hard-stopped after lock `1`; no publish | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-a-owner-evidence.json` |
| B / C-09 browse/manual/withdraw | Functional pass retained; only B01 Spot-check 1 remains | Search/history passed; allocated `CIC-GIP-007`/`008`/`009`; withdrew `007`; add-success omitted allocated code/direct link | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-b-owner-evidence.json` |
| C / C-09/C-10/C-11 import + E-01/E-02 | Functional pass retained; only C01/C02 Spot-check 2 remains | Client and server phases each under 1 second; complete read-only preview; E-01 authority and E-02 retirement holds recovered without persistence | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-c-owner-evidence.json` |
| D / C-07/C-08 placement | Functional pass retained; only D01/D02 Spot-check 3 remains | Stale lock rejected with zero effect; exactly one batch accepted; final order `ITEM-0011 → CIC-GIP-008 → CIC-GIP-009 → ITEM-0012` | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-d-owner-evidence.json` |
| E / C-09/C-11 review/readiness/export | Functional pass retained; only E01 Spot-check 1 remains | Review about 1 second; 712 rows; readiness blocked truthfully; Excel/PDF and canonical/binary hashes verified | Local in-app Browser + independent artifact inspection | `tmp/master-catalog/p38-owner-uat/p42-card-e-owner-evidence.json` |
| F / C-09 uncertain response | Functional pass; strict score HOLD because the developer operated the fault proxy/UI | Request `35defa1c-4195-4177-bb7e-8f9981662e57` retried unchanged; one change set and one item effect; fields retained until definitive success | Local proxy + in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-f-owner-evidence.json` |
| G / safe close | Functional pass; strict score HOLD because the developer performed closeout | D002 abandoned at lock `8 → 9`; D001/D002 immutable; cleanup left zero drafts, flags false, pointer `2568.0.0` | Local in-app Browser + tracked cleanup harness | `tmp/master-catalog/p38-owner-uat/p42-card-g-owner-evidence.json` |

Misunderstood wording, hesitation that changes the intended action, or any
developer-only recovery is a finding, not operator error. Stop the spot-check,
record the exact screen/state, and correct only that bounded surface; do not
discard or replay unrelated completed Card B-E evidence.

## 8. Developer cleanup and final gate update

After Spot-check 4:

1. Abandon the test draft through the UI with a specific Local spot-check
   cleanup reason; verify it becomes read-only and the current pointer did not
   move.
2. Run `npm run db:local:p38:cleanup -- --session "$P38_SESSION"` with the
   exact path used by `prepare`. It must restore all temporary Local feature
   flags and must fail closed rather than abandon an Owner draft.
3. Read back pointer `2568.0.0`/710, zero working drafts, all catalog flags
   `false`, unchanged BOQ/BOQ-item invariants, and Factor F `2569.0.0`/36.
4. Confirm the uncertain retry produced one effect, no new placement batch was
   submitted, the test draft is audited-abandoned, and the current pointer did
   not move.
5. Record fixture/input/evidence hashes. Keep `files/`, `tmp/`, and `output/`
   untracked unless the Owner separately approves a tracked artifact.
6. Update Closure Matrix #34, Tracker, Verification Report, Decision Register,
   and this evidence table. Do not close a row with a partial or technically
   substituted result.
7. Run focused authority/operator tests, full tests, TypeScript, lint,
   authority check, build when application/dependency source changed, and diff
   checks. Commit and push the exact evidence checkpoint.
8. Only then ask the Owner to accept or hold P-37. Acceptance permits a later
   P-12 request only; it does not authorize any Production action.

Cards A-G require no reset after preparation. The one separately warned and
approved P-42 recovery bootstrap is complete. Do not run
`npm run db:local:bootstrap` again without a new destructive-Local warning,
explicit Owner approval, exact pushed source, and a new immutable session path.
