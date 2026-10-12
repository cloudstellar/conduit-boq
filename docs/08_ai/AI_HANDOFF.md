# AI Handoff — Conduit BOQ

> **Status:** CANONICAL REPOSITORY ENTRY POINT
>
> **Aligned:** 2026-10-12
>
> **Latest Production closeout:** 2026-10-12 — BOQ Save NULL authorization
> guard, migration 030; `PRODUCTION PASS`, authority consumed
>
> **Pre-alignment dated Git observation (mutable):** branch
> `codex/quantity-input-safety`; clean
> `HEAD == a467d385041d4d5b05d7a539ac28269a252b3f6d`; no upstream;
> `origin/main == 7c09ab8214c4d2d213349b3281680aef653e5109`; branch was zero
> behind and two commits ahead. This file's status-only alignment is a later
> descendant, so reverify its live HEAD before acting.
>
> **Later Quantity Preview observation (mutable):** exact application source
> `5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3`, tree
> `66b83f60482da3ca6c6e9390113452180cef0d47`, matched local HEAD and
> `origin/codex/quantity-input-safety`; `origin/main` remained `7c09ab8` and the
> local branch still had no configured upstream. The Vercel environment was
> Preview, not Production. See [Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md).

## Current work register — 2026-10-12

| Work | Status | Durable authority / next boundary |
|---|---|---|
| Master Catalog Phase 4 / P-49 | **PRODUCTION PASS** | [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md); migrations 027/028 no-replay; expanded persona rehearsal remains accepted residual, not PASS |
| Atomic BOQ Duplicate (DUP-1) | **PRODUCTION PASS** | [Product Result #04](../plans/product/04-atomic-boq-duplicate-production-release-result.md); migration 029 no-replay; release authority consumed |
| Editor-load/Save guard and signed-out login correction (PR #12) | **REPOSITORY COMPLETE** | merged as `c0cb6451c4d9924f69de93df4eee80abb6cca3c9`; do not infer a current deployment identity without fresh evidence |
| BOQ Save NULL authorization guard | **PRODUCTION PASS** | [Security Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md); migration 030 applied once as `20261012100608/boq_save_null_authorization_guard`; source `cb2bb60`, closeout `7c09ab8`; authority consumed |
| Quantity Input Safety (R0A core plus editor/Save coordination) | **PREVIEW-VERIFIED CANDIDATE** | [Plan #06](../plans/product/06-r0a-quantity-input-safety-release-plan.md) and [Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md); exact source `5527fe9` passed local gates and authenticated no-write Preview QA; persistence/console/Excel-PDF residuals recorded; not merged or Production-deployed |
| LIST-1B BOQ register scaling | **PROPOSED** | [Plan #02](../plans/product/02-boq-list-scaling-decision-plan.md); no implementation authority |
| Wider R0/D0 accounting contract | **PROPOSED** | rounding/parity and related decisions remain open; do not fold them into the Quantity safety release |
| R1/R2 Quantity Expression | **PROPOSED** | canonical `*`, aliases `x`/`X`/`×`, editor-only expression and numeric-only output direction retained; implementation not authorized |
| Wider S0 Auth/Security | **PROPOSED, separate lane** | migration 030 fixed one NULL guard only; admission/recovery/MFA/session decisions remain separate |

### Immediate Owner decisions

1. **Q-A phase 1 — complete/consumed:** the exact local freeze created
   runtime/tests commit `b18e69a` and docs commit `a467d38`; final clean-HEAD
   checks passed. This later status-only documentation alignment records that
   outcome without changing the runtime candidate.
2. **Q-A phase 2 — complete/consumed:** exact source `5527fe9` was pushed and
   verified in Vercel Preview under the Owner-selected Solo path, with no PR,
   separate CI, Save, merge, or Production deployment.
3. Accept the documented current-schema persistence plus console/Preview
   Excel-PDF residuals, or authorize a bounded additional evidence pass.
4. **Q-B:** separately authorize reviewed integration/push to `main` and the
   matching Production deployment.
5. After Quantity closes, decide LIST-1B Level-A scope. Wider R0/D0,
   Quantity Expression and S0 remain later/separate decisions.

Q-A phase 1 and the phase 2 branch-publication/Preview authorities are
complete/consumed. The previously approved Q-A plan leaves exactly one local
documentation-only closeout commit containing Result #07 and the synchronized
status files; it must not change runtime and grants no push or another Preview.
After that exact closeout commit, do not create or amend another commit, push,
Preview, integrate, deploy, mutate the database, change an account, or write to
Production without fresh explicit authority. Historical approvals and
completed release receipts cannot be reused.

## BOQ Save authorization correction — preparation and closeout

`BOQ_SAVE_NULL_AUTHORIZATION_LOCAL_20260908`

A separately approved read-only Production metadata capture at
`2026-09-08T01:48:01.443092+00:00` found a NULL authorization defect in the
existing Save RPC. The monetary write section matches the tested local
contract, but the authorization behavior does not: `IF NOT v_is_authorized`
does not reject NULL scope comparisons. This is not caused by the local
quantity changes, and no Production business rows or unauthorized Save were
accessed to establish the finding.

The Owner then approved preparing the narrow patch, a new forward migration
030, and isolated tests. The patch and local SQL regression now pass: 63 cases
reproduced three predecessor bypasses, then the same 63 cases gave 17 valid
saves and 46 denials with zero known bypasses after 030. Drift and replay
refusals preserved snapshots. The new network-disabled test container was
removed; the existing local app database was not changed. Combined-working-tree
checks passed: Vitest 643 tests / 56 files, ESLint, TypeScript and production
build. Each separated immutable release candidate still requires its own rerun.
Those results were the pre-release local evidence, not by themselves a
Production fix or full Supabase Auth/HTTP/concurrency acceptance. See the
canonical [plan
and local result](../plans/security/02-boq-save-null-authorization-guard-plan-and-result.md)
for exact hashes, evidence and limitations.
The separate [Production release runbook](../plans/security/03-boq-save-null-authorization-production-runbook.md)
records the fresh 2026-10-12 preflight and executed two-stage release. The
exact migration was applied once as
`20261012100608/boq_save_null_authorization_guard`; postflight passed and the
closeout is [Security Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
Migrations 027–030 are immutable/no-replay. This completed release grants no
authority for Quantity, broader S0, another deployment, or Production change.

## Local quantity safety work — 2026-09-08

`QUANTITY_INPUT_SAFETY_LOCAL_20260908`

The [R0A release candidate plan](../plans/product/06-r0a-quantity-input-safety-release-plan.md)
records the separate application-release boundary and its fresh 2026-10-12
validation. It records the local freeze and completed Preview; neither it nor
[Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md)
authorizes another push or Preview, integration, or deployment. The exact
local Result #07/status-alignment commit is the final approved bookkeeping
step described above.

This later checkpoint supersedes the dated “proposed / pending Owner decision”
wording below **only for the local work described here**. The Owner approved
incremental local implementation and testing, including rejecting newly entered
quantities with more than two decimal places. That 2026-09-08 approval did not
authorize commit, push, Preview, deployment, database changes, or Production
operations; the later local-freeze authority is recorded separately below.

- Original local-work base: `c0cb6451c4d9924f69de93df4eee80abb6cca3c9`
  (PR #12, complete editor loading/save guard plus the missing-auth-session
  login correction). The current dated base is `7c09ab8` after the independent
  security 030 source and closeout entered `origin/main`.
- **Local freeze checkpoint (2026-10-12):** runtime/tests commit
  `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc` is followed by documentation
  commit `a467d385041d4d5b05d7a539ac28269a252b3f6d`. Final `HEAD` was clean at
  `a467d38`, with no upstream, zero commits behind and two ahead of
  `origin/main`. The exact HEAD passed 643 tests in 56 files, ESLint,
  TypeScript, production build and `git diff --check`.
- Local branch: `codex/quantity-input-safety`; verify HEAD, worktree and upstream
  live. This work is not a release receipt.
- **Owner correction after local trial (2026-09-08):** restore calculation
  while typing. Valid numeric drafts now update quantities, item/route totals,
  and Factor F immediately. Enter/Tab/blur ends the edit session; Escape or the
  visible Cancel restores its starting quantity and totals. Invalid/incomplete
  text retains the latest valid preview and blocks Save. This correction does
  not change the other local behaviors listed below or grant release authority.
  Unsupported syntax stays visible with an error;
  `5*2` / `5x2` cannot become `52`. Blank / `.` are incomplete; explicit `0` is
  allowed. New input accepts at most 2 decimal places, `0..9999999999.99`, with
  a decimal point and no comma, exponent, sign, or operators. There is no silent
  rounding. Untouched loaded values are not normalized or backfilled.
- Drafts belong to BOQ/route/item IDs. Save validates all routes and captures
  quantities, item/route totals, and the matching Factor result together. It
  waits for the exact BOQ/revision/total/reference-version result, locks edits,
  and stops on failure, cancellation, or timeout; late results do not restart
  a stopped Save. Once the save request starts, cancellation is not promised.
- Page state is keyed by BOQ ID, so a newly opened BOQ cannot use the previous
  header, permissions, or reference version while loading.
- Both editor Print buttons say **พิมพ์ฉบับที่บันทึกแล้ว** and block invalid
  quantity drafts. They open saved data; direct Print URLs continue to read the
  saved database record. This is not automatic Save-and-Print or an output lock
  on other sessions.
- Existing calculation functions, money/Factor rounding rules, Catalog/Factor
  data, schema, RLS, RPC, and migrations remain unchanged. This does not close
  wider R0/D0 accounting parity or authorize LIST-1B / Quantity Expression.
- Validation of the initial local version: **608 tests in 55 files**, ESLint, TypeScript,
  production build, and `git diff --check` passed. The build used a loopback
  placeholder Supabase URL/key; Google Fonts access was needed to build.
- CUA tested the actual editor and edit page with synthetic auth/data at
  desktop and 390 × 844 browser sizes: typed/pasted invalid syntax, retained
  precision errors, Tab/Enter/Escape/Cancel, stepping from a draft, hidden-route
  validation, item deletion retaining other drafts, explicit zero/empty-route
  save, immediate Save, delayed auth/Factor, failure/manual retry, cancellation,
  timeout, stale reference replies and BOQ/header navigation. Matching payloads
  and zero saves after a stopped preparation were observed. Both Print buttons
  blocked invalid drafts; top Print opened the saved-data path without Save.
  Route-reorder identity is covered by state tests, not a completed rendered
  drag-and-drop acceptance. Expected injected failures were the only console
  errors in the editor harness; the actual-page harness had none.
- This is browser-size QA, not physical touch-device acceptance. The existing
  wide table still needs horizontal scrolling/sidebar collapse on mobile; a
  wider mobile layout redesign remains outside this change. No live BOQ was
  saved, copied, or used as a write-test fixture; no live DB verification is
  claimed for this local implementation.
- **Real-time correction validation (2026-09-08):** **617 tests in 55 files**,
  ESLint, TypeScript, and production build passed using the same loopback build
  configuration. State tests cover preview/confirm/cancel, exact legacy-value
  restoration, route/item identity, and stale Factor rejection after a preview
  or cancellation. Independent source review found no regression blocker.
  CUA on the actual edit page with synthetic data confirmed that typing `5`
  while the input remains focused changes cost from `100.00` to `250.00`,
  Factor total to `275.00`, and VAT total to `294.25`. Continuing to `5x2`
  retains that preview and blocks Save; Escape and visible Cancel restore the
  starting values. Tab/Enter retain the current calculation. Immediate Save
  after entering `4.25`, with auth deliberately held, produced exactly one
  mock request containing quantity `4.25`, cost `212.50`, Factor total
  `233.75`, and VAT total `250.11`; editing stayed locked while waiting.
  The actual-page harness had no console warnings/errors. The owner demo at
  `http://127.0.0.1:4180/demo.html` was updated for this correction; it uses
  synthetic data and depends on a host-local server, not a Preview deployment.
- **Evidence correction after Owner challenge (2026-09-08):** the original
  demo A/B used constant reference factors `1.1000` / `1.3000`. That evidence
  established changing totals with a fixed multiplier, not a changing Factor
  coefficient while typing. The 617-test count must not substitute for that
  missing UI scenario. A separately labelled synthetic C was added only to
  the temporary harness, using reference points `(5M,1.2)`, `(10M,1.1)`,
  `(20M,1.05)`, `(700M,1.01)` with the unchanged application calculations.
  CUA verified focused-input quantities `100000`, `150000`, `200000`,
  `300000`, `123456` at unit cost `50` yield respectively `1.2000`,
  `1.1500`, `1.1000`, `1.0750`, `1.1765`, with matching Factor/VAT totals.
  Expected values were independently derived. Immediate mock Save for
  `123456` contained cost `6172800`, Factor `1.1765`, after-Factor cost
  `7262299.20`, and VAT total `7770660.14`. Console warnings/errors were
  absent. This is synthetic UI/mock-request evidence only; it does not prove
  live reference contents, database persistence, or Print/PDF/Excel parity.
  No application runtime or calculation-rule change was made for this demo.

### Local behavior review and open decisions — 2026-09-08

This compares the local changeset with HEAD `c0cb6451`. It is an acceptance
checklist, not an assertion that every row was newly approved or tested live.

| User action / condition | HEAD behavior | Current local behavior |
|---|---|---|
| Type a valid quantity | Calculate during typing | Calculate during typing; restored after Owner correction |
| Type or paste `5x2` / `5*2` | Could remove the operator and publish `52` | Retain rejected text, show error, reject Save; retain latest valid numeric preview |
| Leave blank or `.` | Convert to zero on blur | Remain incomplete; require explicit zero or cancellation |
| Enter more than 2 decimal places | Accept, while displaying 2 places | Reject new input; no silent rounding |
| Focus/blur an untouched loaded `1.234` | Could republish displayed `1.23` | Preserve original numeric value; show source-value hint and block steppers until valid replacement |
| Escape / visible Cancel | No cancellation contract | Restore quantity and item totals from start of that edit session |
| Use +/- | Operate on numeric value | Operate once from valid draft; block invalid/incomplete/boundary input |
| Switch routes / delete an item | Local drafts could disappear | Retain drafts by stable IDs; prune only deleted objects |
| Copy a route | Copy current values | Require source-route drafts to be confirmed/cancelled |
| Save | Graph and Factor callback updated separately | Validate every route; capture matching graph/Factor; lock edits; stop preparation on error/cancel/timeout |
| Print from editor | Open saved BOQ, label “พิมพ์” | Still open saved BOQ; explicit saved-version label; block invalid drafts and pending Save |
| Open another BOQ | Reuse page component state | Reset the edit session by BOQ ID |
| Quantity control layout | One control row | Reserve an extra Cancel row; show validation/source hints |
| Load a BOQ with stale route summaries | Recompute active route only | Active-route behavior restored after explicit Owner approval; preserve unopened route summaries |

The earlier local load behavior was material: if active A totals `100`, and hidden B
stores `999` while its items sum to `210`, HEAD initially totals `1099` while
the earlier local implementation totalled `310`. A metadata-only Save could
therefore send a changed hidden-route summary. **The Owner explicitly selected
restoring the earlier loading/total behavior on 2026-09-08.** That correction
is now implemented: load synchronizes only the selected route, item edits
synchronize their route, and selecting another route synchronizes that route
before an immediate Save can run. Other loaded summaries remain unchanged.
This preserves existing behavior; it does not repair inconsistent stored data.

Read-only review also identified a **pre-existing accounting parity risk** from
unchanged repository contracts: quantity `2.50` × unit cost `19.99` produces
raw `49.975`. Two one-item routes total `99.95` in the editor; persisting each
route to `numeric(15,2)` can produce `49.98` each, whose sum is `99.96`.
Migration 027's Save function also derives item amounts from bound catalog
prices independently of browser header/route totals. Print reads the persisted
header and separately allocates across saved route totals. This is an inference
from schema/RPC/source, **not a live database observation**, and is not fixed by
the numeric guard. Preserve migrations 027/028/029/030 and existing rounding rules;
wider R0/D0 policy and isolated persistence/output verification remain open.

Existing output checks have limited scope: the Excel suite creates and reads
workbook buffers. Its 8.25% fixture now uses matching input amounts and asserts
actual route/total/summary cells `34266000`, `2826945`, `37092945`; this verifies
the exporter preserves the supplied amounts. Some other Print/VAT contracts
only inspect source text. Neither those checks nor synthetic mock Save prove real Save/reload,
Print/PDF/Excel accounting parity. Physical-device input, rendered route
drag-and-drop acceptance, and large-BOQ typing performance also remain open.

After the restoration, CUA observed an unopened synthetic B summary of `999`
remain unchanged through A's realtime edit, Cancel, and metadata-only mock Save
(A `15` + B `999` = `1014`). Selecting B then immediately saving used its
item sum `30` and grand total `45`, with Factor `1.3` / after-Factor `58.50` /
VAT total `62.60`. The active-route deletion browser attempt stopped at a
browser-control timeout and is **not a rendered PASS**; deletion and successor
selection are covered by state tests. The separate owner page remained usable:
C's focused input `150000` produced Factor `1.1500`, rejected `150000x2`
blocked Save, and Cancel restored the original quantity. Its console was clean.

Earlier in this review, the delayed-reference harness verified total `7500000`
waits for A's Factor `1.25` before one mock Save; cancelling preparation leaves
zero Saves after A arrives. When B is selected, late A is ignored, and only B's
Factor `1.45` / VAT `10%` completes Save. These are synthetic response controls,
not network/production observations.

**Final local validation after Owner-approved restoration:** `639` tests in
`55` files, full ESLint, TypeScript, production build with the loopback
Supabase placeholder, and `git diff --check` passed. The additional tests
include 11 composed Factor bracket/interpolation cases and 11 route-summary
preservation cases. Independent final source review found no blocker in the
restoration. HEAD remains `c0cb6451c4d9924f69de93df4eee80abb6cca3c9` on
`codex/quantity-input-safety` without an upstream at this observation. Changes
remain local and uncommitted. These checks do not close the open live-data,
output, physical-device, rendered deletion/reorder, or scale checks above.

### Isolated local persistence checkpoint — 2026-09-08

The Owner's later continuation was used for dedicated local test records in
the already-running loopback Supabase (`127.0.0.1:55321`, database port
`55322`). No database was bootstrapped/reset, no migration was applied or
replayed, and no schema, reference data, account configuration, or Production
operation was performed. This extends local test evidence only.

**Environment limitation:** the observed local database has active Catalog
`2568.0.0` (710 rows), Factor reference `2569.0.0` (36 rows, VAT 7%), no
`supabase_migrations.schema_migrations` table and no `duplicate_boq_atomic`.
Its existing Save RPC is an older pre-P49 implementation (definition MD5
`f8c84210351e72e63143a0e36af07226`), including older authorization behavior.
It is not the recorded Production schema/reference state and must not be
upgraded by replaying migrations 027/028/029/030 for this test.

The actual editor state, quantity parser, Factor/calculation and payload/loader
helpers were used with a signed-in existing active local admin. The unexported
page header mapping was mirrored in a temporary script. Five actual Save RPC
calls and fresh database reloads matched independently calculated expectations:

| Local case | Quantity | Base cost | Factor F | Before VAT | VAT | Final |
|---|---:|---:|---:|---:|---:|---:|
| ITEM-0001 | 2.50 | 4,420.00 | 1.2733 | 5,627.99 | 393.96 | 6,021.95 |
| ITEM-0025 below 5M | 441.61 | 4,999,908.42 | 1.2733 | 6,366,383.39 | 445,646.84 | 6,812,030.23 |
| ITEM-0025 above 5M | 441.62 | 5,000,021.64 | 1.2732 | 6,366,027.55 | 445,621.93 | 6,811,649.48 |
| ITEM-0025 near 7.5M | 662.43 | 7,500,032.46 | 1.2495 | 9,371,290.56 | 655,990.34 | 10,027,280.90 |
| Two ITEM-0001 routes | 2.50 each | 8,840.00 | 1.2733 | 11,255.97 | 787.92 | 12,043.89 |

All sent header/item fields, including Factor raw/bracket snapshot values,
matched the reload. Child identity was compared by route/item order because
Save recreates child UUIDs. This is **actual helpers → authenticated local
predecessor RPC → database reload**, not rendered browser Save coordination.
The small final-total drop immediately above 5M follows the unchanged Factor
truncation policy; this test did not change that policy.

Before/after row fingerprints matched for all original 198 BOQs, 217 routes
and 1,547 items. Full-table fingerprints matched for Catalog rows/versions/
default pointer, Factor rows/versions/default pointer, user profiles and app
settings. These fingerprints cover the named tables, not every account or
external service setting. Exactly three dedicated BOQs (four routes/items)
were added and retained for local browser review:

- normal: `25b912e9-bf5b-4db8-af37-201adf1fd287`
- factor-bracket: `916bfd9d-6a64-4bbf-8b97-eb162180d0df`
- two-routes: `aa4634bb-0480-43e6-8ff9-11bc0c01dcbb`

Their names start with `LOCAL QA quantity 20260908`; any later test writes or
cleanup must use the exact IDs above, never a broad name-based mutation. Safe
temporary receipts were recorded under `/tmp/conduit-boq-persistence-qa/` at
that checkpoint; the directory was no longer present on 2026-10-12. They were
never durable published release evidence.

Actual local columns confirm quantity `numeric(12,2)` and money
`numeric(15,2)`. All 710 active local Catalog rows have whole-baht unit,
material and labor prices. The fractional-price route/header discrepancy
described above therefore was **not reproduced with this reference data**;
no Catalog row or unsupported quantity was fabricated to force it.

At that checkpoint, browser Save/reload and Print/PDF/download acceptance were
pending local browser authentication. The local application was opened at
`http://127.0.0.1:3000/login` with an explicit loopback environment override.
It is separate from the synthetic demo at port 4180 and is not a deployment.
Current-Production-schema acceptance remains a separate uncompleted gate.

**Excel artifact check:** the unchanged exporter generated five workbooks from
the actual saved/reloaded snapshots above. In a non-browser test context only
`file-saver` was captured, and the actual local Factor conditions were read.
An independent audit checked 110 exact numeric cells for quantity, prices,
item/route totals, Factor, VAT, consolidation and summary. All matched. For
the two-route workbook, `สรุปรวม!F7:H7` contains
`5627.99 / 393.96 / 6021.95`, `F8:H8` contains
`5627.98 / 393.96 / 6021.94`, and `F9:H9` contains
`11255.97 / 787.92 / 12043.89`. This confirms the existing last-route remainder
allocation for this case. It does not establish browser download/auth,
rendered Print, PDF layout or native Excel rendering. The temporary receipt was
recorded at `/tmp/conduit-boq-persistence-qa/export-receipts.json`; it is no
longer present. No application runtime, test suite, or calculation rule was
changed for this checkpoint.

**Later authenticated browser check (2026-09-08):** after the Owner signed in,
CUA exercised the actual local Next.js app in the in-app browser, using only
the three dedicated fixtures above:

- Normal: while the quantity input retained focus, `4.25` changed base cost
  to `7514`, after-Factor cost to `9567.58`, and VAT total to `10237.31`.
  Entering `5x2` and clicking Save showed validation errors; a fresh database
  read still showed the saved `2.50` and total `6021.95`. Both Print buttons
  were disabled. Save itself remains clickable so it can identify errors.
  Escape and visible Cancel restored the starting values. Entering `4.25`
  and clicking Save without an intervening state read persisted the matching
  graph/snapshot. Database read, editor reload and actual Print DOM all
  matched `4.25 / 7514 / 1.2733 / 9567.58 / 669.73 / 10237.31`.
- Bracket: focused input values `441.61` and `441.62` displayed Factor
  `1.2733` and `1.2732` with the expected totals. An immediate Save after
  the change to `441.62`, a database read, editor reload and Print DOM all
  matched `5000021.64 / 1.2732 / 6366027.55 / 445621.93 / 6811649.48`.
- Two routes: an invalid `5x2` draft in route 2 remained actionable after
  selecting route 1. Save returned to the erroneous route and rejected the
  operation; database read still showed both quantities `2.50`. After Cancel
  and Save, reload and Print DOM showed consolidated quantity `5.00`, base
  cost `8840`, route final amounts `6021.95 / 6021.94`, and the matching
  total `12043.89`.
- Five successful browser Saves include restoring normal to `2.50`, restoring
  bracket to `662.43`, and saving the resolved two-route fixture. No additional
  BOQ was created. A fresh post-browser fingerprint comparison preserved all
  original 198 BOQs / 217 routes / 1547 items and all eight named reference/
  profile/settings fingerprints. Evidence was recorded in temporary
  `browser-save-*.json`, `browser-hidden-invalid-reload.json`, and
  `after-browser-raw.txt` / `browser-invariants.json` receipts, which are no
  longer present on this host.

Page identity, meaningful content, no framework error overlay, and numerical
interaction checks passed for these local editor/Print pages. Their sampled
warning/error console logs were empty. The dev-server log separately contained
a home-page logo LCP recommendation; it is not a quantity failure. Screenshots
were observed, but the narrow in-app panel horizontally clips the fixed-width
Print page, and a full-page capture contained repeated content whose cause was
not resolved. The two-route Print DOM has five landscape pages, each about
1122.5 × 793.7 pixels, with no vertical content overflow at that observation.
Neither screenshot is proof of a clean generated PDF.

**Output gate at the in-app browser checkpoint:** clicking Excel did not yield a download event
within 15 seconds, no matching fixture workbook was found in Downloads, and
no page error was recorded. Clicking Print did not expose an accessible print
dialog. The cause is unresolved between browser capability and application
behavior; this is not a browser download or PDF PASS. The earlier 110-cell
exporter-artifact result remains valid within its narrower scope. No runtime
fix was made on the basis of this uncertainty. Current-schema acceptance,
physical-device/reorder/deletion and scale residuals remain open as above.

**Owner-approved Chrome output follow-up (2026-09-08):** the Owner authorized
continuing in Chrome and completed the local login there. The Chrome browser
connector was unavailable, so CUA's native Chrome accessibility controls opened
a new tab at the same loopback app. No extension, browser setting, package,
runtime code, database data or schema was changed for this output check.

Actual Excel clicks produced completed Chrome downloads for the two-route and
factor-bracket fixtures. Copies were inspected under the former temporary path
`/tmp/conduit-boq-persistence-qa/`, which is no longer present:

| Downloaded file | Exact workbook checks | Observed result |
|---|---|---|
| `chrome-two-routes.xlsx` | Five sheets, 34 cells (33 numeric plus VAT label) | Quantities 2.50 each / consolidated 5; Factor 1.2733; before/VAT/final 11255.97 / 787.92 / 12043.89; route allocation 6021.95 + 6021.94 |
| `chrome-factor-bracket.xlsx` | Three sheets, 28 cells (19 numeric plus nine text/blank) | Quantity 662.43; Factor 1.2495 in the >5M column; 5M/10M references, raw 1.24954969163; before/VAT/final 9371290.56 / 655990.34 / 10027280.90 |

Independent arithmetic matched and neither workbook contained Excel error
cells. These 62 actual-download cell checks are separate from the earlier
110-cell non-browser exporter check. The original downloads remain in the
host Downloads folder with the `BOQ_LOCAL QA quantity 20260908 ...` filenames.
The former temporary `chrome-xlsx-receipt.json` and
`chrome-factor-bracket-xlsx-receipt.json` recorded exact cells and SHA-256
hashes; those receipt files are no longer present.

Both actual Chrome Print dialogs selected Save as PDF, all pages, one page per
sheet and no margins. The saved PDFs were read, rendered with Poppler, and
**every page was visually inspected**:

- `chrome-two-routes.pdf`: five A4 landscape pages (two routes, consolidation,
  summary, Factor supplement). Quantities, per-route allocation and the final
  `12043.89` agree with database/Print/Excel evidence.
- `chrome-factor-bracket.pdf`: three A4 landscape pages (route, summary,
  Factor supplement). The >5M column, interpolation references/raw/truncated
  Factor and final `10027280.90` agree with database/Print/Excel evidence.
- No blank/duplicated page, clipped text/table, or broken Thai glyph was found
  in these eight PDF pages. Document page counters and reference-version
  footers were present. The earlier in-app full-page capture's repeated content
  did not appear in these generated PDFs. PDF text/numeric/hash receipts were
  recorded as `chrome-pdf-receipt.json` and
  `chrome-factor-pdf-receipt.json`; those temporary files are no longer present.

This closes actual Chrome download/PDF verification **for these two saved local
fixtures**. The in-app browser behavior remains unresolved, but it did not
prevent the unchanged app from producing correct files in Chrome. Native
Excel rendering, long multi-page BOQs, physical-device/drag-and-drop/scale
residuals and acceptance against a current-Production-equivalent test schema
remain outside this result. No release, commit or deployment is authorized by
this checkpoint. At that checkpoint the temporary directory also contained the
Owner-requested local password display file. The directory is no longer
present; if equivalent evidence is recreated, never upload or share the whole
directory. Only specifically reviewed fixture artifacts/receipts may be used as
output evidence.

All earlier Master Catalog / DUP-1 receipts and archive custody boundaries
remain historical authority for their exact operations; migrations 027, 028,
and 029 remain immutable/no-replay.

## Start here

1. Read this handoff and [AI Context](./AI_CONTEXT.md).
2. Read [Lessons Learned](./LESSONS_LEARNED.md) for durable implementation
   constraints.
3. For Master Catalog status, use [Canonical Final Handoff
   #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
   and [Final Closeout Result
   #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
4. For the current product release, read [DUP-1 Production Release
   Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
5. For the later documentation merge and branch cleanup, read [Post-DUP-1
   Repository Custody Result](../plans/product/05-post-dup1-repository-custody-result.md).
6. For proposed next product work, read the [Product Evolution Decision
   Plan](../plans/product/01-conduit-boq-product-evolution-decision-plan.md) and
   [LIST-1 Decision Plan](../plans/product/02-boq-list-scaling-decision-plan.md).

The files under [`docs/ai/`](../ai/README.md) are legacy Phase 1/2 context.
They are useful history, but they are not the current session handoff.

## Current product release — DUP-1

`DUP-1_PRODUCTION_CLOSEOUT_20260831`

Atomic BOQ Duplicate is live in Production. The exact release is recorded in
[DUP-1 Production Release Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md):

- feature commit `bc357dbc7a8bd8d696c19550f57452f79a6a4372` was merged through
  [PR #9](https://github.com/cloudstellar/conduit-boq/pull/9) as `main` commit
  `0e76ed39e68746c9bd6003da69a03f096ae482a3` and deployed successfully by
  Vercel;
- migration `029_atomic_boq_duplicate.sql`, SHA-256
  `748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`,
  is applied exactly once as
  `20260831004110/atomic_boq_duplicate`;
- normal **คัดลอก** is an atomic/idempotent preserve copy: it keeps the source
  Catalog, items, quantities, prices, Factor F snapshot/provenance, and cost
  basis while resetting instance/workflow identity to a new draft;
- eligible Factor-unbound legacy BOQs use the separate **คัดลอกและเลือก Factor
  F** flow. It preserves old Catalog/items/prices, clears old Factor-derived
  state, and blocks Print/PDF/Excel until trusted review/save succeeds;
- current Catalog/default prices require a clean **สร้างใหม่** flow; DUP-1 does
  not requote, reprice, rebase, repair, or backfill a source BOQ;
- Production outer-transaction proof passed for both `preserve` and
  `select_factor`, rendered desktop/mobile QA passed, and an expected live
  PostgREST mixed-graph probe failed closed with Create New recovery; all left
  no persistent copy; and
- final database state was `263` BOQs, `326` routes, `2,617` items, and `0`
  idempotency-ledger rows. Catalog `2568.1.0` (`710` active rows) and default
  Factor F `2569.0.0` (`36` rows, VAT 7) retained their exact hashes/pointers.

The independent read-only postflight timestamped above reconfirmed the 029
ledger/object/ACL posture, all five BOQ policy fingerprints, zero request-ledger
rows, the same BOQ graph counts, and unchanged Catalog/Factor anchors. It grants
no future write authority.

Migration 029 is a separate product release after the completed Master Catalog
phase. Statements below that “029 was not required” or that the ledger ended at
028 are dated Master Catalog/repository-convergence facts, not the current
Production migration inventory. Migrations 027, 028, and 029 are all immutable
applied-once/no-replay artifacts. Migration 030 was later applied once for the
independent Save NULL-authorization correction described in the current work
register; it is also immutable/no-replay.

## Post-DUP-1 repository custody

`POST_DUP1_REPOSITORY_CUSTODY_20260831`

[Post-DUP-1 Repository Custody Result
#05](../plans/product/05-post-dup1-repository-custody-result.md) records the
later repository-only closeout:

- documentation commit `654ba7674707fec2151ed510ce478bb4135d48c5`
  merged through [PR #10](https://github.com/cloudstellar/conduit-boq/pull/10)
  as `07dd75558b513037a1d38b576ffe03be356623c2`, with exact tree
  `c6750930f23982ec08dab27bcb4da26d961411ea`;
- GitHub Quality run `33349901736` completed successfully;
- Vercel deployment `BQyAnbjjbBfYYWXLznsLSbKFo7yY` was observed as
  Production, Ready, and Current from that merge commit;
- the separately approved cleanup removed local and remote refs for exactly
  `codex/atomic-boq-duplicate`, `codex/atomic-boq-duplicate-closeout`, and
  `codex/main-convergence`; and
- final branch evidence at that instant showed a clean canonical checkout on
  `main`, equality with `origin/main`, no matching remote refs for those three
  names, and no other local branch.

This repository operation did not change application runtime code, database
state, migrations, Catalog, Factor F, BOQs, accounts, or the protected archive.
Its authority is consumed. Result #04's `branchDeleted: false` remains correct
for the earlier frozen DUP-1 release instant; Result #05 is the later custody
overlay. Git and deployment state are mutable, so verify their live identity
instead of treating `07dd755...` or the observed deployment as perpetual.

## Later handoff-publication checkpoint

`NEXT_SESSION_REPOSITORY_CHECKPOINT_20260905`

The repository later published Result #05 and its cross-references through
[PR #11](https://github.com/cloudstellar/conduit-boq/pull/11):

- documentation commit `0feba13611c8816baab6402ec2ef400bf1d326cf`
  merged into `main` as
  `a3deb9cc0c2a7930dd3036196afedb04550bfb25`;
- the merge and head trees both equal
  `ababa45e02f9a22c6805ce8716c9f64cfeaf0685`;
- this was a seven-Markdown-file publication of the already recorded custody
  event, not a new application feature or database release; and
- a read-only local check on 2026-09-05 observed the canonical checkout clean
  on `main`, equal to its local `origin/main` tracking ref, with only local
  branch `main`.

The prior session observed Vercel deployment
`FLEShkQ4m6e5nuFat9PpgSuCJC4a` from the PR #11 merge as Production, Ready, and
Current on 2026-09-01. That observation was not independently rechecked on
2026-09-05 and must not be treated as a perpetual live-state claim. This
checkpoint grants no commit, push, deployment, branch deletion, database, or
Production authority.

### Handoff-alignment changeset — 2026-09-05

The clean observation above predates preparation of this next-session handoff.
This documentation-only alignment changes exactly these eight files:

- `README.md`;
- `docs/README.md`;
- `docs/01_overview/ROADMAP.md`;
- `docs/08_ai/AI_HANDOFF.md`;
- `docs/08_ai/AI_CONTEXT.md`;
- `docs/08_ai/LESSONS_LEARNED.md`;
- `docs/plans/product/01-conduit-boq-product-evolution-decision-plan.md`; and
- `docs/plans/product/02-boq-list-scaling-decision-plan.md`.

They are the Owner-requested handoff/plan-alignment edits. Git state is mutable:
the changes may be committed and the worktree clean, or part of the changeset
may still be local. The next session must run `git status`, verify HEAD/upstream,
inspect any remaining diff, and preserve uncommitted handoff work unless the
Owner directs otherwise. This record itself grants no later commit, push, PR,
merge, deployment, database, or Production authority.

## Current Master Catalog state

The closeout evidence in #106/#107 records:

- Master Catalog is complete end-to-end at `2568.1.0`, with `710` active rows;
- `ITEM-0429` / `COR-PB0-002` is `0/1764/1764`;
- `ITEM-0615` / `LVU-MH0-002` is `2869/7427/10296`;
- the full audited Admin draft workflow is live;
- migrations 027 and 028 were applied exactly once, and migration 029 was not
  required for that Master Catalog closeout;
- P-49 technical implementation and formal closeout are complete;
- no publication, catalog-pointer movement, BOQ repricing/backfill, or Factor F
  change occurred during the final rollout; and
- the unrun expanded Production persona rehearsal remains `accepted residual
  — not PASS`.

These are recorded closeout facts, not permission for a new operation. Any
claim about mutable live state requires fresh read-only evidence.

The dated 2026-08-29 Master Catalog reconfirmation verified ledger 027 then 028
with no 029 at that time; catalog `2568.1.0` at `710/710`, hash
`8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`, lock
`4`, `ITEM-0429` at `0/1764/1764`, and `ITEM-0615` at
`2869/7427/10296`; Factor F `2569.0.0` at `36` rows, hash
`4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`;
all three Admin capability flags `true`; the migration-028 function
owner/volatility/search-path/security/execute posture; raw `app_settings`
denied to `anon` and `authenticated`; and `0` working drafts. It performed no
write and grants no new operational authority. It was not a fresh replay of
the complete P-49 persona, policy, or predicate suite.

## Version labels

Keep the repository's different version domains separate:

- `2568.1.0` is the current Master Catalog business-data version;
- the frozen DUP-1 application release was deployed from merge commit
  `0e76ed39e68746c9bd6003da69a03f096ae482a3`; the later docs-only PR #10
  deployment was observed from `07dd75558b513037a1d38b576ffe03be356623c2`;
  neither SHA should be assumed to be the perpetual current Git/Vercel source;
- `package.json` version `1.2.0` and historical implementation-plan labels such
  as `1.6.0` are retained application/document metadata, not Master Catalog or
  deployment authority. The root README does not currently declare a separate
  application-release badge.

Do not normalize those application labels during repository convergence. A
future application-version decision is separate work with separate approval.

## No-replay boundary

Do not replay P-13, P-14, P-14C, P-15, migrations 027/028/029/030, R-01 through
R-05, or disposable Production QA. Migration 029 was not needed merely to
align documentation or Git; it was later created and applied only for the
separately authorized DUP-1 product release. A future catalog Publish/Restore
or database change is a separate release requiring its own explicit approval
and a new forward migration when schema change is required.

## Working rule

Use `main` plus the handoff above as the repository source of truth. Preserve
dated plans/results as audit chronology; a historical `HOLD`, `pending`, or
`unauthorized` statement does not override #106/#107. Never infer current
commit, push, deploy, database, or publication authority from a historical
approval receipt.

## Host-local workspace handoff — 2026-08-29

`LOCAL_WORKSPACE_HANDOFF_20260829`

- The canonical checkout on this host is
  `/Users/cloud/Cloudstellar/conduit-boq`. It was observed clean on `main` at
  `f89511767d8d5e9207a61f851c9e6f3f97b42cf7`, equal to `origin/main`, before
  this local handoff-document alignment. Verify `git status`, branch, HEAD, and
  upstream at the start of every new session.
- The complete former checkout was archived, not deleted, at
  `/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829`. Its recorded
  branch/HEAD are `codex/p51-option-a-closeout` and
  `1dd98ee16af02f89ab413c614e04df7960b42563`.
- The archive is intentionally dirty and contains protected evidence, ignored
  secrets, and local session material. It must remain local and must not be
  cleaned, staged, committed, uploaded, or shared. Do not use it as the normal
  workspace for new changes.
- The archived repository's linked worktree at
  `/Users/cloud/.codex/worktrees/1ede/conduit-boq` was repaired after the move;
  it remains archive lineage, not canonical `main`.
- At this 2026-08-29 handoff, no branch had yet been deleted and local
  `codex/main-convergence` remained at the pushed convergence commit. The later
  separately approved exact cleanup is recorded in Post-DUP-1 Repository
  Custody Result #05; do not rewrite this dated observation as if cleanup had
  already happened on 2026-08-29.

This section records host-local custody, not portable Production truth. On a
different host, verify paths independently. Its preparation grants no commit,
push, deploy, database, publication, or deletion authority.

## What remains

This section is the Master Catalog/custody residual list. It does not replace
the 2026-10-12 current work register above; Quantity Q-A phases 1–2, Q-B
Production integration and later product decisions are tracked there, in
Product Plan #06, and in Preview Result #07.

There is **no required Master Catalog execution work** and no open R-01 through
R-05 item. Do not replay the completed release, migrations, disposable QA, or
closeout.

Only these independent optional maintenance decisions remain:

1. Keep the local archive as-is unless the Owner later approves a specific
   encrypted backup, retention, or removal operation.
2. Classify or prune any further old branches/worktrees only under a new,
   explicit cleanup approval. The exact three-branch cleanup in Result #05 is
   complete and its permission is consumed.
3. Run the expanded Production persona rehearsal only as a newly authorized
   security-review task. Until then its status remains `accepted residual — not
   PASS`.
4. Normalize application-version labels only as a separate product/versioning
   decision; it is unrelated to Master Catalog `2568.1.0`.

## Next product decision handoff — 2026-09-05

`R0A_LIST1_NEXT_DECISION_HANDOFF_20260905`

This section is a **HISTORICAL** 2026-09-05 decision snapshot. The Owner later
authorized local Quantity implementation/testing, followed by the separately
authorized local freeze at `b18e69a` + `a467d38`. The current work register and
[Product Plan #06](../plans/product/06-r0a-quantity-input-safety-release-plan.md)
plus [Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md)
govern the resulting `PREVIEW-VERIFIED CANDIDATE`.
LIST-1B, wider R0/D0, Quantity Expression and S0 remain proposed. Nothing in
this dated section is current commit, Preview, migration, account, deployment,
or Production authority.

### Confirmed code risks

- [QuantityEditor](../../components/boq/QuantityEditor.tsx) removes every
  character except digits and a decimal point, then immediately publishes the
  sanitized number. Inputs such as `5*2`, `5x2`, `5X2`, and `5×2` can therefore
  become `52` without an error. Quantity Expression is not implemented; the
  current repository persists numeric quantity only.
- The [`/boq` register](../../app/boq/page.tsx) makes an unpaginated BOQ
  request, filters only the rows returned to browser memory, labels the
  returned array length as the total, lacks a deterministic ID tie-breaker,
  mounts separate mobile and desktop result trees, and lets each mounted
  [`RouteBadge`](../../components/boq/RouteBadge.tsx) issue its own route query.
  The recorded `263`-BOQ / approximately `527`-request estimate is dated
  2026-08-31 evidence, not a live count for 2026-09-05.

### Recommended order, still unapproved

1. Close the Level-A product decisions for both the narrow `R0A` guard and
   `LIST-1B` without changing code or external state.
2. Release `R0A` separately: keep numeric-only entry, retain invalid draft text,
   explain unsupported input, and never update the last committed quantity or
   totals from a destructively sanitized value. It adds no parser, formula
   persistence, schema change, or migration.
3. Implement `LIST-1B` as the next substantial feature: initial fixed 25-row
   server-numbered pages, whole-result server search/filter/sort, exact
   RLS-visible count, deterministic ordering after preflight, safe URL/session
   state, and one bounded route batch.
4. Complete the wider `R0` accounting/calculation contract, then proceed to
   `R1`/`R2` Quantity Expression. The selected direction remains canonical `*`,
   aliases `x`/`X`/`×`, persisted normalized expression plus canonical numeric
   result, editor-only formula visibility, and numeric-only Print/PDF/Excel.
5. Run authentication/security `S0` as a separate parallel lane with its own
   approvals and releases.

This refines the earlier Result #04 recommendation by placing only the small
fail-closed `R0A` guard before LIST-1 implementation. Result #04 remains frozen
chronology and must not be rewritten. The Owner may instead keep LIST-1 first
or run R0A in parallel; the next session must record that choice before
implementation.

### Pending LIST-1 choices

The recommended Level-A defaults are `LIST-1B`, 25 rows, exact visible count,
`updated_at DESC, id DESC` after a fresh semantics/distribution preflight,
structured non-sensitive state in the URL, free-text `q` in same-session state,
and one embedded/batched route request for the current page. Search, filters,
sort, and RLS must apply before range.

Do not add an index, listing RPC, or migration without query-plan evidence and
fresh authority. Keep `public.duplicate_boq_atomic` as the final Copy authority.
Whether a trusted batched duplicate-eligibility projection belongs in first
release `L1` or a later `L1.1` is still an explicit Owner scope decision; do not
silently expand LIST-1 into new privileged database work. Do not change
Procurement visibility or any RLS policy as pagination cleanup.

### Authentication nuance

The source contains a password-recovery path: login requests a recovery email,
the callback exchanges the code for a session, and Profile calls
`auth.updateUser({ password })`. It is therefore incorrect to declare recovery
broken from source inspection alone. It also has no end-to-end recovery proof:
test email delivery/configuration, redirect, expired/reused links, recovery
session behavior, and successful password change before claiming PASS. The
same signup-eligibility precheck currently gates login, signup, and recovery;
the callback error query is not currently surfaced on the login page; and the
intended recovery behavior for inactive or suspended accounts remains a policy
decision. Separating account admission from authentication/recovery remains
proposed S0 work.

### Historical first-safe-action guidance

Re-read the mandatory files and verify Git/worktree state. The R0A local
implementation and Q-A Preview steps named here have since occurred, while the
residual and Q-B release decisions remain open. Follow the current register,
Product Plan #06 and Preview Result #07 for Quantity;
follow Product Plan #02 for LIST-1. Any new database object or forward
migration and every Production/account operation still require explicit
current authorization.

For a new AI session: work from the canonical checkout, read this file plus
`AGENTS.md`, `AI_CONTEXT.md`, Master Catalog #106/#107, and
[`DUP-1 Production Release Result`](../plans/product/04-atomic-boq-duplicate-production-release-result.md)
and [`Post-DUP-1 Repository Custody Result`](../plans/product/05-post-dup1-repository-custody-result.md),
then inspect Git status before any change. Do not enter or inventory the
archive unless the Owner explicitly asks.
