# Phase 4 WP-8 P-37 Evidence Reconciliation and Owner UAT Script

**Status:** The proportional post-correction execution and final cleanup are
complete. The 2026-07-24 real Full-import continuation also passed after a
bounded post-save feedback correction. P-37 remains **HOLD only for an explicit
Owner accept/hold decision** against exact correction
`df44b827b290933463da5e14fa9125314660022a`.
Exact pushed source `6fe3a6a1b2c04a418187167c143960ba412672da`
prepared immutable no-reset session
`tmp/master-catalog/p38-owner-uat/session-p42-final-spotcheck-20260722-6fe3a6a.json`
and draft `2568.1.0-D005`. The Owner physically scrolled the modal-contained
gap list and changed one browser-only placement without confirming a batch.
The response-loss check then retained the edit fields, returned
`CATALOG_OUTCOME_UNCERTAIN`, and recovered request
`533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` with the same request/response ID,
`duplicateRequest=true`, one committed version, and no second effect.

D005 was audited-abandoned with a specific Local-only reason. Schema-2 cleanup
passed with pointer `2568.0.0`/710, canonical hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
zero working drafts, all three catalog flags `false`, BOQ 198/1,547, zero
unversioned BOQs, Factor F `2569.0.0`/36, no Local reset, and no Production
action. Follow-up application checkpoint `b639c03` makes definitive normal and
same-request-recovery success feedback durable across the required server
refresh; it changes no migration or database authority.

That final visual observation is now closed. Exact pushed checkpoint
`8fb9839a6c9d169dd8c48bd5314d96c2801a28fa` preserves the discard notice
across development Strict Mode effect replay. No-reset bounded session
`tmp/master-catalog/p38-owner-uat/session-p42-banner-replay-final-20260723-8fb9839.json`
created only `2568.1.0-D007`; after one browser-only placement choice and a
second-tab lock advance, the page displayed
**ยกเลิกตัวเลือกเดิมที่อ้างอิงฉบับร่างเก่าแล้ว**, restored the current system
suggestion, and showed **ปรับในหน้านี้ 0**. D007 was audited-abandoned and
cleanup restored pointer `2568.0.0`/710, zero working drafts, all flags false,
zero placement reviews, no reset, and no Production action. The response-loss
test and full Card B-E flow were not repeated. See
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md) and
[Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md).
The untracked consolidated evidence index is
`tmp/master-catalog/p38-owner-uat/p42-owner-uat-functional-summary.json`; it is
Local evidence and must not be staged or committed.

The later D008 Full-import observation exposed UAT-11: the database apply
succeeded, but client navigation was lost when revalidation remounted the
lock-keyed import panel. Exact correction
`df44b827b290933463da5e14fa9125314660022a` moves success navigation into the
Server Action and makes the browser file-selection badge truthful.
Fresh no-reset D009 then passed the approved 710-row Full preview, apply, `303`
redirect, and durable workspace notice with filename/count/revision and
review/re-import actions. D008 and D009 were audited-abandoned; final readback
again showed pointer `2568.0.0`/710, zero working drafts, all catalog flags
`false`, BOQ 198/1,547 with zero unversioned BOQs, Factor F `2569.0.0`/36, no
Local reset, and no Production action.

**Environment:** Local only. The separately approved P-42 recovery reset is
complete; Cards A-G themselves performed no reset. No further reset is
authorized. Production access/write, successful publication or pointer
movement during UAT, feature enablement outside the temporary Local fixture,
P-19, Factor F work, and hotfix `016` expansion remain prohibited.

**Owner decision boundary:** Execution findings, including C-08, are disposed
and cleanup is complete, but “ทำต่อ” is not recorded as P-37 acceptance. The
Owner explicitly accepts or holds P-37 against the complete bounded evidence
and exact correction `df44b827b290933463da5e14fa9125314660022a`. Neither choice
authorizes Production, P-12, deploy, feature enablement, publication, P-19,
Factor F work, or hotfix expansion.

## 1. Reconciliation conclusion

The retained evidence is valid and should not be rerun merely to obtain newer
screenshots. It proves the integrated database, security, idempotency,
placement, export, and realistic-scale application contracts. It does not
prove an action that the intended admin did not perform.

The proportional post-correction check has four points. Spot-checks 1-2 remain
passed and retained. Exact-source Spot-check 3 and the same-request portion of
Spot-check 4 passed, and final cleanup passed. The later exact-source no-reset
D007 replay captured the separately visible stale-choice-discard banner and
cleaned successfully. Prior Card B-E functionality, scale, hashes, and error
recovery remain retained rather than replayed.

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
- UAT-11: after a successful 710-row import apply, revalidation changed the
  draft lock and remounted the keyed client import panel before its success
  effect could navigate. The form silently returned to Step 1 and the badge
  implied that a browser-local source file remained selected even though the
  file input was empty.

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
Their final bounded results are recorded below; they do not invalidate
completed Card B-E evidence.

| Finding | Bounded correction | Gate state |
|---|---|---|
| `P42-UAT-B01` | After a successful manual add, the server action reads the audited `catalog_change_items` add snapshot and returns the allocated code/identity for a direct item link; allocation remains database-owned and the current list context is preserved | Passed in retained Spot-check 1 |
| `P42-UAT-C01` | Card C now names **เตรียมรายการตรวจสอบ** as browser-only preparation and **ให้เซิร์ฟเวอร์ตรวจผลต่าง** as the point where server authority/retirement rules run | Passed in retained Spot-check 2 rerun |
| `P42-UAT-C02` | Owner-facing instructions use the visible Thai action **ยืนยันและบันทึกลงฉบับร่าง** and no longer use “Apply” | Passed in retained Spot-check 2 rerun |
| `P42-UAT-C03` | The always-visible third progress step now uses the exact action wording **ยืนยันและบันทึกลงฉบับร่าง**; E-01 verifies that server rejection leaves the real persistence action absent rather than asking the Owner to find an impossible disabled button | Exact `44f54a72b03549de995b431d6705ec1b2eeb3fa6`; passed in retained Spot-check 2 rerun |
| `P37-UAT-C04` | Confirmed import success now redirects from the Server Action after revalidation, opens the exact draft workspace, and displays filename/count/revision plus review/re-import actions. The selected-file badge exists only while the current browser file input contains a selection. | D008 exposed UAT-11; fresh D009 passed the 710-row preview/apply/redirect path on exact correction `df44b827b290933463da5e14fa9125314660022a` |
| `P42-UAT-D01` | Real Browser testing showed the nested popover remained outside the modal scroll boundary despite local wheel interception. Exact `16e88c6487307c4bb0606a048dc53e05e9dcee18` keeps the searchable gap list inline inside the dialog with native overflow/overscroll containment and standard selection, `Esc`, focus-out, and outside-click dismissal | Passed on exact-source D005 Spot-check 3; no placement batch was submitted |
| `P42-UAT-D02` | Browser-only placement storage is schema 3, records whether the admin actually changed a suggestion, discards stale lock/revision keys, and shows an explicit warning before any fresh confirmation | Lock/revision discard remains covered by retained Card D and automated contracts; the final visible discard banner is the one bounded Owner-disposition item |
| `P42-UAT-E01` | The export menu says **เปิดหน้าพิมพ์/บันทึก PDF**, matching the browser print/save-PDF behavior | Passed in retained Spot-check 1 |
| `P42-UAT-F02` | Uncertain transport outcomes use diagnostic code `CATALOG_OUTCOME_UNCERTAIN` while retaining the same request ID and replay-safe input; `b639c03` preserves definitive recovered-success feedback across refresh | Passed on D005 with one reused request and one effect |
| `P42-UAT-G01` | Session schema 2 binds a closed `full-owner-uat` or `bounded-spot-check` scenario at prepare time; cleanup keeps the historical two-attempt replacement proof for full UAT and requires exactly one audited-abandoned attempt for the bounded spot-check | D004 and final D005 schema-2 cleanup each passed with one audited-abandoned attempt |
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
its flags were restored after the application source advanced. Final D005 then
used the fresh exact-source no-reset session recorded at the top of this note.

### 1.2 Minimal post-correction Owner spot-check

This is the immutable Owner execution record. Do not repeat the full Card B-E
procedures in Section 5. Spot-checks 1-2 are retained, D005 completed the
bounded execution, and cleanup passed. The written steps and outcomes are:

1. **Add result + PDF wording - passed, do not repeat:** add one Local-only item. Confirm the success
   message shows its allocated code and a direct item link. Open
   **ส่งออกเพื่อตรวจ** and confirm the PDF command says
   **เปิดหน้าพิมพ์/บันทึก PDF**; do not generate a new acceptance artifact.
2. **Import wording and safe stop - passed, do not repeat:** open **นำเข้าชุดข้อมูล** and confirm the
   three progress labels are **เลือกไฟล์และหลักฐาน** →
   **ตรวจผลต่างกับเซิร์ฟเวอร์** → **ยืนยันและบันทึกลงฉบับร่าง**. With E-01,
   click **เตรียมรายการตรวจสอบ**, then **ให้เซิร์ฟเวอร์ตรวจผลต่าง**. Confirm
   `IMPORT_PRICE_AUTHORITY_REQUIRED` is visible and the actual
   **ยืนยันและบันทึกลงฉบับร่าง** action is absent because validation did not
   pass. Do not enter authority evidence and do not save an import.
3. **Placement scroll + stale choice - passed:** the Owner opened the
   insertion-gap list, wheel-scrolled it, changed one gap, and left it visibly
   **ปรับในหน้านี้ 1 / ยังไม่บันทึก** without confirming a placement batch.
4. **Uncertain retry and stale-choice notice - passed:** after the developer switches the Local app to the
   response-loss proxy, use a second tab to submit the designated harmless edit
   once. Confirm code `CATALOG_OUTCOME_UNCERTAIN`, retained form values, and one
   same-request retry succeeds without a second effect. This passed with request
   `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1`. The separate post-reload banner
   **ยกเลิกตัวเลือกเดิมที่อ้างอิงฉบับร่างเก่าแล้ว** later passed in exact
   no-reset D007 on `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`; the
   response-loss path was not repeated.

The execution and tracked cleanup are complete. Existing Card B-E counts,
timing, placement acceptance, hashes, exports, and safe errors remain
authoritative. P-37 now needs only the explicit Owner disposition described
above; no full rerun is justified.

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
| `tmp/master-catalog/p38-owner-uat/session-p42-banner-replay-final-20260723-8fb9839.json` | `9e1a036514fb6eb082ed40e5b4a233d0fe2a5fbe4ba5c4ba2ec8fe73b4cd115b` | Exact-source D007 banner replay, audited abandonment, zero placement reviews, and disabled-baseline cleanup without reset | P-37 Owner accept/hold decision |
| `tmp/master-catalog/p38-owner-uat/p42-stale-choice-banner-final-20260723-8fb9839.png` | `c0d48ecabcbab4f8c5d92c1c496d6f035b977dd48a7d1f358ca6eb534d7f8d23` | Visible stale-choice discard notice and restored current system suggestion | Production readiness or feature enablement |
| `tmp/wp4-import-manual-proof.xlsx` | `0f45289d34b42ae3029b386ddcf4af0867e8b4a5de7416ed7ff554eb4b99d34f` | Owner used the binary file picker and validated one Supplement row on the historical global import route | Current exact-draft route, Full 710-row preview, or several new identities |

## 3. Reconciled closure map

| Gate | Reused evidence | Remaining scored evidence | Status before UAT |
|---|---|---|---|
| C-07 complete placement | P-42 recovery retained one stale rejection with zero effect and exactly one accepted UI batch/change set; exact-source D005 also proved the corrected list physically scrolls without submitting another batch | None | Passed |
| C-08 stale placement | Retained two-tab recovery and accepted-state readback remain valid; exact no-reset D007 displayed the discard banner, restored the current suggestion, wrote zero placement reviews, and cleaned to the disabled baseline | None | Passed |
| C-09 core-admin UAT | Functional Cards A-G, complete Card B-E workflows, Spots 1-3, same-request Spot 4, and final cleanup are retained | Explicit P-37 accept/hold decision | Ready for Owner decision |
| C-10 three safe recovery states | Card A stale-review, Card C E-01/E-02, Card D stale placement, and D005 uncertain-response recovery passed without unintended writes | None | Passed |
| C-11 710-row baseline | P-36 timings, P-42 Card C phases under 1 second, Card E about 1 second, Spot-check 1 export wording, and Spot-check 2 import wording are retained | No scale measurement rerun remains | Passed |

## 4. Developer preflight - completed, not scored

These steps were completed for the immutable D005 session. They remain an
audit/reproducibility record and are not the next action. Do not run them again
unless the Owner requests the one narrow banner replay.

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
4. Run `npm run db:local:p38:prepare -- --session "$P38_SESSION" --scenario bounded-spot-check`
   using the same recorded new path. The tracked harness
   must bind that closed scenario into the immutable session, then enable only the
   temporary Local admin and new-identity capabilities needed by the script.
   Before changing flags, `prepare` must prove the longest live category key
   fits the shared 500-character application contract.
   Keep the retirement capability disabled; retirement is previewed as a safe
   hold and is never applied. The harness must not create or abandon the Owner
   test draft.
5. Record the exact signed-in active-admin email, browser/version, device,
   viewport, Local URL, source HEAD, and start time.
6. Reverify the retained official/E-01/E-02 input hashes through
   `verify-inputs`, but hand the browser only E-01 for Spot-check 2. The E-01
   rejection must leave the real persistence action absent; the always-visible
   progress label is the wording evidence. Do not rerun the Full or E-02
   workflow. Production `2568.0.0` remains authority for names, units, and
   prices.
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
For current closure, Section 1.2 records what was executed; do not rerun this
section without a new explicit Owner request.

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
| Post-correction Spot-check 1 | Passed and retained | Add success showed allocated `CIC-GIP-010` with **เปิดรายการนี้**; export menu showed **เปิดหน้าพิมพ์/บันทึก PDF** | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-spotcheck-1a-add-success-fd36be2.png`; `p42-spotcheck-1b-pdf-wording-fd36be2.png` |
| Post-correction Spot-check 2 | HOLD on bounded findings; no import persisted | E-01 showed `IMPORT_PRICE_AUTHORITY_REQUIRED`; actual save action was absent as designed, while the third progress label omitted **และ**; D003 was abandoned and Local returned to the disabled baseline | Local in-app Browser + tracked cleanup/readback | `tmp/master-catalog/p38-owner-uat/p42-spotcheck-2a-stepper-wording-fd36be2.png`; `p42-spotcheck-2b-e01-hidden-action-fd36be2.png`; session `session-p42-spotcheck-20260720-fd36be2.json` |
| Post-correction Spot-check 2 rerun / D004 correction round | Spot-check 2 passed and is retained; Spot-check 3 stopped on real wheel behavior, then the bounded UI correction was Owner-confirmed but not scored against the old session HEAD | The three labels matched; E-01 returned `IMPORT_PRICE_AUTHORITY_REQUIRED`; the real save action was absent; no import persisted. The nested popover would not wheel-scroll, while exact tree content later committed as `16e88c6` scrolled natively and dismissed on outside click. D004 was audited-abandoned and schema-2 cleanup restored the disabled baseline | Local in-app Browser + tracked cleanup/readback | Session `tmp/master-catalog/p38-owner-uat/session-p42-spotcheck-20260722-2160815.json`; failure screenshot `p42-spotcheck-3-wheel-failure-2160815.png`; exact application/test correction `16e88c6487307c4bb0606a048dc53e05e9dcee18` |
| Final exact-source Spot-check 3 / D005 | Passed | Modal-contained list wheel-scrolled; one gap changed locally; page showed **ปรับในหน้านี้ 1** and **ยังไม่บันทึก**; no placement review/change set was written | Local in-app Browser | Exact source `6fe3a6a1b2c04a418187167c143960ba412672da`; session `tmp/master-catalog/p38-owner-uat/session-p42-final-spotcheck-20260722-6fe3a6a.json`; Owner screenshot `codex-clipboard-0ff9582c-a3c7-4366-9954-534e9bad217b.png` remains untracked |
| Final exact-source Spot-check 4 / D005 | Same-request transport and one-effect checks passed; stale-choice banner not separately captured | First response was intentionally lost after upstream HTTP 200; fields remained; retry reused request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1`, returned `duplicateRequest=true`, and recovered the same version without a second effect. Follow-up `b639c03` makes definitive recovered success visible after refresh | Local response-loss proxy + in-app Browser | `tmp/master-catalog/wp65-evidence/p42-final-spot4-20260722-6fe3a6a-01.json`; application checkpoint `b639c03` |
| Final bounded cleanup / D005 | Passed | D005 audited-abandoned; pointer `2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547, Factor F `2569.0.0`/36; no reset and Production untouched | Local in-app Browser + tracked cleanup | Session `tmp/master-catalog/p38-owner-uat/session-p42-final-spotcheck-20260722-6fe3a6a.json`, status `cleaned` |
| Final stale-choice replay / D007 | Passed | After one unsaved gap choice and a second-tab lock advance, the page displayed **ยกเลิกตัวเลือกเดิมที่อ้างอิงฉบับร่างเก่าแล้ว**, returned to **ระบบจัดให้ 1 / ปรับในหน้านี้ 0**, and wrote zero placement reviews | Local in-app Browser + tracked cleanup | Exact `8fb9839a6c9d169dd8c48bd5314d96c2801a28fa`; session `tmp/master-catalog/p38-owner-uat/session-p42-banner-replay-final-20260723-8fb9839.json`; screenshot `p42-stale-choice-banner-final-20260723-8fb9839.png` |
| Full-import post-save correction / D008-D009 | Passed on exact correction `df44b827b290933463da5e14fa9125314660022a` | D008 completed a real 710-row apply but silently remounted to Step 1. Fresh D009 previewed 709 recodes/one unchanged row in 187 ms, applied in 275 ms, returned `303` to `?notice=import-applied`, and showed filename, resulting draft count 710, revision 1, **ตรวจรายการที่เปลี่ยน**, and **นำเข้าไฟล์อื่นเพิ่ม**. Both drafts were audited-abandoned; final status is pointer `2568.0.0`/710, zero drafts, flags false, unchanged BOQ/Factor F. | Local in-app Browser + server operation log + read-only Local status | Exact source/tests/docs checkpoint `df44b827b290933463da5e14fa9125314660022a`. The old one-version session remains `prepared` because strict cleanup refused to certify the deliberate second attempt, but its fail-safe restored flags. |
| A / C-09/C-10 draft lifecycle + stale-review prevention | Functional pass; strict score HOLD because live guidance was used | D001 abandoned; D002 reused target `2568.1.0`; old review lock `0` hard-stopped after lock `1`; no publish | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-a-owner-evidence.json` |
| B / C-09 browse/manual/withdraw | Functional pass retained; B01 correction passed in Spot-check 1 | Search/history passed; allocated `CIC-GIP-007`/`008`/`009`; withdrew `007`; later Spot-check 1 showed the allocated code and direct link | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-b-owner-evidence.json`; `p42-spotcheck-1a-add-success-fd36be2.png` |
| C / C-09/C-10/C-11 import + E-01/E-02 | Functional pass, corrected wording, real Full save, and post-save feedback passed | Retained client/server phases each under 1 second; complete read-only preview; E-01 authority and E-02 retirement holds recovered without persistence. D009 then completed the 710-row Full save and durable result redirect after UAT-11 correction. | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-c-owner-evidence.json`; D004 session and D008-D009 row above |
| D / C-07/C-08 placement | Passed | Stale lock rejected with zero effect; exactly one batch accepted; final order `ITEM-0011 → CIC-GIP-008 → CIC-GIP-009 → ITEM-0012`; D005 physically scrolled and changed one unsaved gap; D007 displayed the stale-choice discard notice and restored the current suggestion without another placement write | Local in-app Browser | `tmp/master-catalog/p38-owner-uat/p42-card-d-owner-evidence.json`; exact `16e88c6487307c4bb0606a048dc53e05e9dcee18`; exact D007 session above |
| E / C-09/C-11 review/readiness/export | Functional pass retained; E01 correction passed in Spot-check 1 | Review about 1 second; 712 rows; readiness blocked truthfully; Excel/PDF and canonical/binary hashes verified; later Spot-check 1 confirmed print/save-PDF wording | Local in-app Browser + independent artifact inspection | `tmp/master-catalog/p38-owner-uat/p42-card-e-owner-evidence.json`; `p42-spotcheck-1b-pdf-wording-fd36be2.png` |
| F / C-09 uncertain response | Functional pass retained; exact-source same-request Spot-check 4 passed | D005 request `533ad2d2-c2b4-4207-8f72-1c8b8b8692b1` retained fields and recovered one effect without duplication; `b639c03` keeps definitive success visible | Local proxy + in-app Browser | `tmp/master-catalog/wp65-evidence/p42-final-spot4-20260722-6fe3a6a-01.json` |
| G / safe close | Functional pass retained; D005 and latest D009 readback passed | D005 tracked cleanup remains the scored closeout. After the deliberate D008/D009 correction attempts, both were audited-abandoned and independent status again showed zero drafts, flags false, pointer `2568.0.0`, and unchanged BOQ/Factor F. | Local in-app Browser + tracked cleanup/read-only status | Final D005 session plus D008-D009 row above; the older D008 session is not relabeled as cleaned |

Misunderstood wording, hesitation that changes the intended action, or any
developer-only recovery is a finding, not operator error. Stop the spot-check,
record the exact screen/state, and correct only that bounded surface; do not
discard or replay unrelated completed Card B-E evidence.

## 8. Developer cleanup and final gate update

After Spot-check 4:

**Completed 2026-07-23:** all steps below passed for D005 and the immutable
`bounded-spot-check` session named above. The cleanup result recorded four
change sets, zero placement reviews, zero imports, one audited-abandoned
version, restored all temporary flags, and did not reset Local or touch
Production.

1. Abandon the test draft through the UI with a specific Local spot-check
   cleanup reason; verify it becomes read-only and the current pointer did not
   move.
2. Run `npm run db:local:p38:cleanup -- --session "$P38_SESSION"` with the
   exact path used by `prepare`. Cleanup must read the immutable
   `bounded-spot-check` scenario from session metadata, require exactly one new
   audited-abandoned attempt, restore all temporary Local feature flags, and
   fail closed rather than abandon an Owner draft.
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
