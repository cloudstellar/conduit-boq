# Conduit BOQ Product Evolution Decision Plan

**Status:** PROPOSED ROADMAP — D2, D3, AND D9 OWNER DIRECTIONS RECORDED;
DUP-1 RELEASED AND VERIFIED 2026-08-31; REMAINING OWNER DECISIONS REQUIRED

**Prepared:** 2026-08-30; final evidence review plus D2/D3/D9 scope updates
2026-08-31; next-session R0A/LIST-1 analysis refinement 2026-09-05
(Asia/Bangkok)

**Initial planning repository snapshot (before this plan/feature work):** `main` at
`c41495ae9c1007cd3f147df9d0791e2a27a1adad`, equal to `origin/main` before
this document and its evidence images were added

**DUP-1 release result:** feature `bc357dbc7a8bd8d696c19550f57452f79a6a4372`,
merged/deployed `0e76ed39e68746c9bd6003da69a03f096ae482a3`, migration
`20260831004110/atomic_boq_duplicate`; see
[Production Result #04](./04-atomic-boq-duplicate-production-release-result.md)

**Scope:** Product direction, UI/UX, calculation integrity, database design,
BOQ-register scalability, account/login security, governed BOQ workflow, and a
gated 0–24 month roadmap

**Decision focus:** How to restore whole-BOQ duplication safely, whether and
how to support quantity expressions such as canonical `5*2 = 10`, how to scale
the growing Admin BOQ/project register, and which foundations must precede
those features

## 1. Authority and non-authority

This is a decision document, not an execution receipt. Preparing or approving
the product direction does **not** by itself authorize code changes, a database
migration, deployment, Production write, catalog Publish/Restore, BOQ
backfill/repricing, Factor F change, commit, or push.

On 2026-08-31 the Owner first instructed this session to update the plan and
implement `DUP-1` locally. Later in the same session the Owner explicitly
instructed: update the documents and plan, and restore the Copy button in
Production. That later instruction supersedes the narrower local-only boundary
for this exact DUP-1 release and authorizes its scoped read-only preflight,
forward migration 029, source commit/push/merge/deployment, and bounded
Production verification. It does not authorize Catalog or Factor F
publication/default-pointer changes, repricing/rebasing/backfill, mutation of a
source/historical BOQ, replay of migrations 027/028, LIST-1, or Quantity
Expression. That exact `DUP-1` release and postflight are now complete under
[Result #04](./04-atomic-boq-duplicate-production-release-result.md), and its
one-shot authority is consumed.

The completed Master Catalog boundary remains exactly as recorded in
[Canonical Final Handoff #106](../master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
and
[Final Closeout Result #107](../master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md):

- Master Catalog `2568.1.0` and its `710` active rows are completed Production
  history, not work to replay.
- Migrations 027, 028, and the later DUP-1 migration 029 were applied exactly
  once. Do not edit, retry, or replay them. A future database change must be a
  newly approved forward migration after 029.
- Do not replay P-13, P-14, P-14C, P-15, or R-01 through R-05.
- Do not move the Catalog or Factor F default pointer, change/publish reference
  data, republish the Catalog, or mutate/reprice/backfill historical BOQs as
  part of this product work. D9 permits only an explicit selected Factor-version
  binding on a new eligible legacy copy; it does not alter reference data or a
  default pointer.
- Quantity Expression means arithmetic used to enter a BOQ quantity. It does
  not authorize or redefine the separate K-formula schema, mapping,
  governance, import/export, or publication boundary.
- The expanded Production persona rehearsal remains an accepted residual, not
  PASS.

Production counts below are a fresh read-only observation from exactly
2026-08-30 17:01:54.898366 UTC (2026-08-31 00:01:54 +07). Metric definitions,
aggregate results, query hash, and limitations are preserved in the
[sanitized Production evidence](./evidence/2026-08-30-quantity-entry/03-production-readonly-aggregate-evidence.md).
They help prioritize work but expire as a claim about mutable live state and do
not replace a new preflight at implementation or release time.

## 2. Executive recommendation

**Atomic BOQ Duplicate** is now released and verified. The next recommended
decision closeout covers both the narrow `R0A` safety guard and `LIST-1B`.
Latest source review recommends releasing only the small fail-closed R0A guard
before LIST-1 implementation because current quantity input can destructively
sanitize an expression into another number. `LIST-1B` remains the next
substantial feature because the growing Admin register still makes an
unpaginated request and per-rendered-row route queries. The exact R0A/LIST
ordering remains an Owner choice and neither item has implementation authority.
Full Quantity Expression still must not begin as a UI-only calculator: the
current UI, client calculation, database precision, and save RPC can interpret
the same value differently. Its later R0–R2 work must first make the saved
result authoritative.

Recommended decision bundle:

| Decision | Recommended choice | Why |
|---|---|---|
| Immediate safety | `R0A` fail-closed input guard, then the wider `R0` integrity baseline | Stop destructive input conversion first; then align one numeric result across UI, save, reload, print, and Excel before expression work. |
| Whole-BOQ copy | `DUP-1` atomic normal copy plus a separate eligible-legacy selected-Factor path | Restore Copy without partial records; preserve Catalog/items/prices; make every Factor change deliberate; current prices require a clean Create New flow. |
| Quantity UI | `UI-2` expression-aware field | Shows the expression and preview only inside the quantity editor; committed/read-only/output surfaces show the numeric result. |
| Pilot grammar | `G1` multiplication-only | Uses `*` as the canonical operator, accepts `x`, `X`, and `×` as input aliases, and reopens a normalized form such as `5*2`. |
| Pilot data model | `DB-1` persisted normalized expression + canonical numeric result | The Owner requires the formula to be available again when editing the quantity after save/reload/reopen, but not in Print/PDF/Excel. |
| Production save | New forward RPC hardening change | Normalize quantity once, recompute/reject totals server-side, and retain all P-49 authorization controls. |
| Mobile | Responsive release, or an explicitly desktop-only named pilot | The current 390 px layout clips the work area; Owner must choose whether mobile blocks only Production or also the pilot. |
| Account admission | Admin invite/pre-provision next | Better fit for a small internal user base than long-term self-signup. |
| Authenticator | Password + MFA now; enterprise SSO later if ready | SSO is an authentication option, not an account-admission policy, and should not block calculator work. |
| Privileged security | MFA/AAL2 for Admin/Approver plus session controls | Reduces account-takeover impact on high-risk actions. |
| BOQ/project register | `LIST-1B` server-side numbered pages, initial fixed 25-row default, server search/filter/sort, and batched routes | Admin already sees 263 BOQs; the current unbounded list and per-row route requests are a present usability/performance problem. The page size is a measured Conduit v1 choice, not a universal constant. |
| BOQ authority | Discovery first; then `W1` internal approval or `W-H` external-authority handoff | `263 draft` rows show no stored non-draft lifecycle in this app, but do not prove where formal approval currently happens. |
| Long-term data | `DB-2` only when measurements become audit evidence | Structured provenance needs stable line identity and append-only revisions; it should not be bolted onto transient item IDs. |

The recommended sequence is:

```text
Documentation and recorded decisions
  -> DUP-1 Atomic BOQ Duplicate [complete 2026-08-31]
  -> joint Level-A closeout for R0A and LIST-1B [Owner choice pending]
  -> R0A smallest silent-input guard [recommended first; separately released]
  -> LIST-1 bounded BOQ register implementation
  -> approved post-029-equivalent test baseline
  -> R0 calculation contract completion
  -> R1 expression pilot + chosen desktop/mobile scope
  -> R2 trusted save/reload/print/export release
  -> R3 governed lifecycle: internal W1 or external-authority W-H
  -> R4 immutable revisions, diff, reporting, and optional SSO
  -> R5 procurement handoff/integration
  -> R6A field execution and GIS/as-built
  -> R6B evidence-grounded AI as an independent decision gate
```

`S0` security baseline work should run in parallel with R0/R1, with MFA/AAL2
enforced before privileged approval is introduced. Invite/pre-provision and SSO
remain separable identity changes. Every security change needs its own change
request, tests, rollback, and release window rather than being bundled into the
calculator release.

### 2.1 Owner decision dashboard

The detailed analysis follows, but these are the decisions that control scope.
`TBD` means this document recommends a direction without authorizing it.

| ID | Decision | Options | Recommendation | Owner choice |
|---|---|---|---|---|
| D0 | Calculation authority | precision, normalization, component/item/route rounding stage, Factor F verification, maximum, fixtures | Quantity and money 2 dp with accounting-approved decimal rounding; normalize once; verify the full chain | `TBD` |
| D1 | Quantity interaction | UI-0 / UI-1 / UI-2 / UI-3 | UI-2, preceded by UI-0 | `TBD` |
| D2 | Formula persistence | DB-0 result / DB-1 expression + result / DB-2 structured measurements | DB-1: persist a bounded normalized expression beside canonical numeric quantity; render it only in the quantity editor | `DB-1; Print/PDF/Excel numeric-only — selected 2026-08-31` |
| D3 | Pilot grammar | G1 multiplication / G2 basic arithmetic | G1 with `*` canonical and `x`/`X`/`×` input aliases | `G1; normalized reopen such as 5*2 — selected 2026-08-31` |
| D4 | Incomplete/zero by action | edit / draft save / preview / print-Excel / submit / approve | Never coerce blank to zero; allow explicit zero only in incomplete draft; block official output/submit/approve until resolved | `TBD` |
| D5a | Account provisioning | self-signup + pending / invite-pre-provision / IdP-managed | invite/pre-provision | `TBD` |
| D5b | Authenticator | password + MFA / SAML SSO | password + MFA now; SSO strategic | `TBD` |
| D5c | Privileged/session policy | AAL level, lifetime, inactivity, concurrency, revocation SLA | AAL2 inside every privileged trusted boundary; explicit timeout/revocation | `TBD` |
| D6 | Formal BOQ authority | W0 estimate only / W-H external approval / W1 in-app approval / W2 engine | discovery gate, then W-H or W1 according to the real authority | `TBD` |
| D7 | Mobile release scope | desktop-only named pilot / responsive pilot / responsive Production | desktop-only pilot is acceptable only when visibly unsupported on mobile; responsive required before general Production claim | `TBD` |
| D8 | BOQ/project list scale | client pages / server numbered pages / cursor-load more / infinite scroll | `LIST-1B`: initial fixed 25-row server numbered pages + whole-result search/filter/sort + batched routes | `TBD — see LIST-1 plan and research` |
| D9 | Whole-BOQ Duplicate | old multi-request client copy / atomic preserve copy / eligible-legacy selected-Factor copy / catalog requote-rebase | `DUP-1`: normal atomic preserve copy; separate selected-Factor copy only for eligible legacy BOQs; current prices require clean Create New; no catalog requote/rebase | `Released and verified 2026-08-31 — Result #04; authority consumed` |

Dependencies that can reverse the roadmap:

- If another system or signed paper process is the legal/formal approval
  authority, implement W-H before or instead of W1.
- D2 is now resolved: formulas must survive save/reload/reopen, so the first
  Production expression release uses DB-1. Formula visibility is limited to
  the quantity editor during entry/re-edit; read-only UI, Print/PDF, and Excel
  show only the canonical number. This records product direction only; it does
  not authorize schema or code changes.
- If measurement provenance supports contracts or claims, stop at DB-2 design
  before implementing transient expression storage.
- D9 is resolved: `DUP-1` precedes Quantity Expression. Normal Copy preserves
  the source Catalog, items, quantities, prices, Factor binding/snapshots, and
  calculated cost provenance. A separate selected-Factor action is available
  only for an eligible legacy BOQ; it preserves the old Catalog/items/prices,
  binds an explicitly selected active Factor F version, clears the old Factor
  snapshot/derived totals, and requires review/save before official output.
  Neither path uses current Catalog prices. Users needing current prices start
  with Create New. Catalog Requote/Reprice/Rebase is not in this release.
- If mobile is part of the pilot cohort, responsive route and item work enters
  R1; otherwise it gates general Production, not the desktop-only pilot.
- LIST-1 is independent of DB-1. Now that DUP-1 is complete, close the R0A and
  LIST-1 Level-A decisions together. Latest source review recommends shipping
  only the narrow R0A silent-input guard before LIST-1 implementation; the Owner
  may retain LIST-1 first or run R0A in parallel. In every case the wider R0
  calculation safety/test baseline must precede the larger expression release,
  and LIST-1 has no DB-1 dependency.

Detailed D8 evidence, alternatives, UX/data contracts, and gates are in the
[BOQ / Project List Scaling Decision Plan](./02-boq-list-scaling-decision-plan.md),
supported by the
[BOQ Register Pagination Best-Practice Research](./03-boq-list-pagination-best-practice-research.md).

Planning ranges assume one product owner/accounting decision-maker, one
frontend engineer, one database/backend engineer, and shared QA/design access.
Smaller capacity, external identity/procurement dependencies, or delayed
accounting decisions extend the ranges; they do not justify skipping gates.

### 2.2 Authorization levels

These levels are independent. Approval of a lower level never implies a higher
one.

| Level | What it permits | Current status |
|---|---|---|
| A — Direction/documentation | Record decisions, refine flows, prepare plans/evidence | This document only; no implementation authorization |
| B — Local implementation | Edit code/tests locally; no commit, push, Preview, DB migration, or external state | Executed and consumed for exact DUP-1 only |
| C — Source/Preview | Commit, push, and deploy a named candidate | Executed and consumed for exact DUP-1 only |
| D — Database design | Draft a new forward migration/RPC and rehearsal plan without applying it | Executed and consumed for exact DUP-1 migration 029 only |
| E — Production release | Apply approved forward change, deploy, flag rollout, Production QA/rollback | Executed, verified, and consumed for exact DUP-1 on 2026-08-31 |

The current-session exception came from the separate Owner instructions, not
from this table: DUP-1 alone executed scoped Levels B–E through bounded
Production verification. That authority is consumed and does not transfer to
another roadmap item or reference-data operation.

Migration 027/028/029 execution is excluded from every future level. Migration
029's one-shot DUP-1 execution is consumed; no level permits replaying any of
those artifacts.

## 3. What the application is becoming

The current product is strongest as an internal, catalog-governed BOQ creation
tool for conduit work:

- select controlled material and labor prices from a published Master Catalog;
- organize work into routes and line items;
- calculate material, labor, route, BOQ, and Factor F amounts;
- save, reload, use the browser print/Save-to-PDF view, and export Excel;
- restrict access by authenticated profile and role; and
- administer catalog drafts through an audited workflow.

The next defensible product position is **a trustworthy source of BOQ
calculation and versioned handoff**. It may also become the approval system of
record if the authority discovery proves that role belongs here; otherwise it
should preserve an immutable package and reference the external approval
authority. It should not try to become a full construction ERP, GIS,
field-management suite, procurement platform, and AI product at the same time.

Long-term product principles:

1. **Correct before clever.** A saved quantity and amount must mean the same
   thing everywhere.
2. **Explicit before automatic.** Formula results, validation, approvals, and
   revisions must be visible to the user.
3. **Immutable after approval.** Corrections create a new revision; they do not
   rewrite approved history.
4. **Server-authoritative for business invariants.** Client UI improves speed,
   but the trusted save boundary proves quantity, totals, authorization, and
   catalog binding.
5. **Progressive complexity.** Start with a small explicit handoff/lifecycle
   and expression grammar; add configurability only when repeated real use
   demands it.
6. **Integration at controlled boundaries.** Send versioned approved packages
   outward rather than letting external systems edit BOQ internals freely.
7. **AI after evidence.** Suggestions require stable revisions, outcomes,
   feedback, and clear human approval.

## 4. Verified current state and key discovery

### 4.1 Current quantity behavior

The present quantity editor is numeric-only. Its sanitizer removes every
character except digits and a decimal point. As a result, entering `5x2` or
`5*2` can become `52`, not `10` and not an error. See
[QuantityEditor.tsx](../../../components/boq/QuantityEditor.tsx#L17-L23).

The editor formats to two decimal places on blur, but the React state may still
contain the higher-precision value entered before blur. The client calculation
rounds quantity internally, while the save RPC multiplies the raw JSON
quantity. The database column then stores quantity as `numeric(12,2)`. See:

- [QuantityEditor.tsx](../../../components/boq/QuantityEditor.tsx#L57-L80)
- [calculation.ts](../../../lib/calculation.ts#L22-L43)
- [edit page save payload](../../../app/boq/%5Bid%5D/edit/page.tsx#L205-L285)
- [migration 027 save RPC](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L2959-L3073)
- [Production baseline data types](../../../supabase/local/production-baseline.sql#L413-L430)

Illustrative failure mode under the current contracts:

```text
Input                         1.234
Client calculation quantity  1.23
Unit price                    100.00
Visible client amount        123.00
RPC raw multiplication       123.40
Stored quantity              1.23
Possible stored item amount  123.40
```

This example explains the structural risk; it is not a claim that this exact
row exists. It shows why the product must normalize once and use that same
value throughout.

### 4.2 Fresh Production read-only observations

| Area | Observation at 2026-08-31 00:01 +07 | Interpretation |
|---|---:|---|
| BOQs | `263`; all observed stored status `draft` | This snapshot contains no stored evidence of a non-draft lifecycle in Conduit BOQ; it does not prove that approval is absent from other systems or paper processes. |
| Routes | `326` | Route grouping is established domain structure. |
| BOQ items | `2,617` | Enough real data exists to characterize safely before changing the calculation contract. |
| Quantity zero | `11` rows | [Calculation rules](../../05_calculation/CALCULATION_RULES.md#L197-L205) say quantity must be greater than zero, while UI/database permit zero; D4 must define each action without changing legacy rows. |
| Quantity negative | `0` rows | Negative quantities are not currently observed and should remain disallowed unless a formal variation model is designed. |
| Component recomputation differences | `14` rows above ฿0.01; `2` above ฿1; maximum ฿1.47 | Small discrepancies exist and require classification; do not rewrite history automatically. |
| Item total vs. components | `2` rows, both exactly ฿0.01 | Likely rounding-edge behavior; the target contract must define where rounding occurs. |
| Route vs. linked items | `2` routes; maximum absolute field difference ฿1,372,001 | Both have no linked items while their BOQs have legacy unlinked items (`5` unlinked item rows overall). A later DUP-1 preflight found one unbound BOQ that mixes real routes with unlinked items; because the current editor/output path hides those unlinked rows when routes exist, DUP-1 fails that mixed graph closed rather than relinking or copying it. |
| BOQ vs. routes | `0` observed mismatches | Header/route aggregation currently agrees in the observed snapshot. |
| Catalog | `710` active rows; `0` working drafts | Completed Master Catalog authority remains intact and out of scope. |

The correct response is characterization and a forward contract—not a data
cleanup. Existing rows must not be recalculated, relinked, or backfilled as an
incidental release step.

### 4.3 Fresh authentication observations

| Area | Observation at 2026-08-31 00:01 +07 | Product implication |
|---|---:|---|
| Auth users / profiles | `20` non-deleted Auth users and `20` profiles; `0` orphan rows in either direction | An invite/pre-provision workflow is operationally realistic at this scale. |
| Profile state | `16 active`, `4 pending` | Pending approval is already an important lifecycle state. |
| Identity provider | All `20` observed identities use provider `email`; `19` non-deleted Auth users are email-confirmed | Provider `email` does not by itself distinguish password from magic-link/OTP, but the current application path is email/password. |
| MFA factors | `0` | No observed second factor protects Admin/approval actions. |
| Sessions | `73` rows currently present in `auth.sessions` across `12` users; all AAL1; `19` refreshed within 30 days | These are database rows, not proof that 73 browser sessions are concurrently usable; privileged step-up should still be deliberate. |
| Session expiry field | All `73` observed `not_after` values are null | This does not prove the project’s global Auth configuration. Time-box, inactivity, and single-session settings must be read directly and reverified; Supabase evaluates relevant controls on refresh, subject to JWT lifetime. |
| Password protection advisor | Leaked-password protection disabled | This is a concrete near-term hardening opportunity. |

The application already checks an authoritative current profile state and
blocks pending, inactive, or suspended users through middleware and guarded
database functions. That is a strong foundation. The remaining question is
how accounts should be created, how privileged actions step up, and how quickly
sessions are revoked when a person is suspended or leaves the organization.
The exact aggregates and definitions are in the
[read-only evidence appendix](./evidence/2026-08-30-quantity-entry/03-production-readonly-aggregate-evidence.md).

## 5. UI/UX audit of the current BOQ editor

These screenshots were captured read-only from the current Production editor
and cropped to remove personal/project identity. No field was changed and no
save was performed.

### Step 1 — Desktop quantity entry

**Health:** AMBER — usable, but missing a safe expression contract and explicit
feedback.

![Current desktop quantity entry](./evidence/2026-08-30-quantity-entry/01-current-quantity-entry-desktop.png)

What works:

- the quantity control is close to the selected item and its totals;
- the line-item hierarchy and cost breakdown are understandable on desktop;
- plus/minus controls make small numeric adjustments fast; and
- calculated totals remain visible while editing.

What needs improvement:

- there is no visible indication whether arithmetic is supported;
- invalid text has no preserved draft, preview, or inline error state;
- silently deleting characters can turn a typo or formula into a different
  valid number;
- the quantity input lacks an explicit field label and calculation preview;
- icon-only controls should have Thai-visible labels/tooltips and accessible
  names consistent with the surrounding language; and
- screenshot inspection cannot prove keyboard, focus, screen-reader, or error
  announcement behavior, so those require interaction testing.

### Step 2 — Mobile quantity entry at a 390 × 844 viewport

**Health:** RED — not acceptable as a supported mobile quantity-entry flow.

![Sanitized crop of the current mobile quantity entry at a 390 by 844 viewport](./evidence/2026-08-30-quantity-entry/02-current-quantity-entry-mobile-390x844.png)

The evidence image is a sanitized 390 × 700 crop from the 390 × 844 viewport;
the crop removes identity-bearing header content while retaining the complete
visible layout problem.

The fixed 240 px route sidebar and a line-item table with a minimum width of
800 px push the working area outside the viewport. The quantity control and
totals are effectively off-canvas. The relevant layout is in
[MultiRouteEditor.tsx](../../../components/boq/MultiRouteEditor.tsx#L506-L528)
and
[MultiRouteEditor.tsx](../../../components/boq/MultiRouteEditor.tsx#L672-L686).

Recommended mobile baseline:

- replace the persistent route sidebar with a top route selector, bottom
  sheet, or collapsible drawer;
- present each line item as a card or responsive grid instead of requiring an
  800 px table;
- keep quantity, unit, amount, and validation together in the visible card;
- make primary touch targets at least 44 × 44 CSS px;
- provide an operator bar for canonical `*` because a decimal mobile keyboard
  often does not expose it; and
- use a sticky bottom action area only after ensuring it does not hide the
  focused field or error message.

## 6. Decision A — Quantity-entry UI

### UI-0 — Safety guard only

Reject unsupported characters immediately and stop `5x2` from becoming `52`,
but retain numeric-only entry.

**Advantages**

- smallest and fastest risk reduction;
- no parser or schema design required;
- can be released independently before the calculator feature.

**Disadvantages**

- does not satisfy the desired canonical `5*2 = 10` workflow;
- users still calculate elsewhere and retype the result.

**Risks**

- if error feedback is weak, users may think the field is broken;
- it does not repair server/client rounding on its own.

**Recommendation:** mandatory first guard, even if every later feature is
deferred.

### UI-1 — Result-on-blur calculator

Accept an expression in the current compact field and replace it with the
numeric result on blur or Enter.

**Advantages**

- compact and low visual change;
- quicker to learn for experienced desktop users;
- works with a result-only database model.

**Disadvantages**

- the original expression disappears;
- the transition can feel magical and is hard to audit;
- errors are easy to miss in a dense table;
- mobile input still needs operator controls.

**Risks**

- users may not notice an unintended but valid result;
- later requirements to show formula provenance would force redesign.

**Recommendation:** acceptable only for a tightly observed prototype, not the
preferred Production interaction.

### UI-2 — Expression-aware field with explicit preview

Use a single compact control with distinct editing and committed states. Inside
the active quantity editor it should have a visible “จำนวน” label, an `fx`
affordance, the canonical editable expression such as `5*2`, and a nearby preview such
as “= 10.00 หน่วย”. Outside that editor, show only the committed numeric value
`10.00`; the formula is not general display or document content. The exact
visual layout should be explored against the current design system before
implementation rather than inferred from this prose.

Interaction contract:

- plain numeric entry remains the default and stays fast;
- typing a supported alias or choosing canonical `*` enters expression mode;
- the persisted normalized expression remains visible while entering or
  re-editing the quantity;
- a live preview appears only when the complete expression is valid;
- Enter or blur commits the normalized numeric quantity;
- after leaving the quantity editor, the normal cell/read-only display shows
  only the committed numeric result;
- Escape restores the previous committed value;
- an invalid or incomplete expression never changes quantity or totals;
- Save, Print, Export, route switch, and page leave either block with a clear
  error or ask to discard the draft; and
- on mobile, a small operator bar supplies canonical `*` without changing to a full text
  keyboard.

**Advantages**

- the user can verify intent before committing;
- errors are visible and recoverable;
- supports accessible state announcements and deterministic testing;
- preserves editing context without adding formula noise to summaries or
  official outputs.

**Disadvantages**

- more component state and interaction tests;
- needs careful handling of steppers, focus, route switching, and undo;
- occupies slightly more vertical space in a dense editor.

**Risks**

- unclear distinction between draft and committed value could still create
  confusion;
- users may assume richer spreadsheet grammar than the product supports.

**Recommendation:** **choose UI-2**.

### UI-3 — Structured measurement builder

Open a drawer or modal for structured dimensions such as length, width, count,
unit, source, and notes, then produce the quantity.

**Advantages**

- best provenance and domain clarity;
- makes unit conversion and measurement audit possible;
- can support templates/assemblies and field evidence later.

**Disadvantages**

- too slow for simple edits;
- substantially larger data, workflow, and migration scope;
- requires stable line identity and revision semantics.

**Risks**

- premature complexity before actual measurement patterns are known;
- a modal-heavy flow may hurt high-volume desktop entry.

**Recommendation:** defer until users need audit-grade measurements, then offer
it alongside—not instead of—fast direct quantity entry.

## 7. Decision B — Expression grammar and calculation UX

### G1 — Multiplication-only pilot (recommended)

Allow:

- non-negative decimal numbers;
- whitespace;
- canonical multiplication operator `*`;
- input aliases `x`, `X`, and `×`, normalized to `*` after commit/reopen; and
- chained terms such as `2.5*4*3`.

Do not allow in the pilot:

- `+`, `-`, `/`, `%`, exponentiation, parentheses, variables, units, commas,
  localized free text, or function names;
- unary negative values;
- empty terms such as `5xx2`; or
- implicit multiplication such as `5(2)`.

**Pros:** small attack surface, simple mental model, directly covers the stated
need, easy mobile operator bar, and easier deterministic testing.

**Cons:** cannot sum route segments or divide packages; some users will still
need a separate calculator.

### G2 — Basic arithmetic

Add `+`, `-`, `/`, and parentheses with standard precedence.

**Pros:** behaves more like a calculator and covers more real-world formulas.

**Cons:** meaning, division-by-zero, negative intermediate values, rounding,
parentheses depth, mobile keyboard, and error education all become more
complex.

**Recommendation:** collect rejected-input telemetry and user interviews during
G1; adopt G2 only if repeated real tasks justify it.

### Parser safety contract

Whichever grammar is chosen:

1. Build a pure allow-listed tokenizer/parser. Never use `eval`,
   `new Function`, dynamic SQL, or a general-purpose script engine.
2. Reject unknown characters. Never strip them and continue.
3. Bound expression length, token count, term count, numeric magnitude, and
   result magnitude.
4. Reject non-finite results, overflow, negative output, and disallowed zero.
5. Use decimal arithmetic with a documented rounding mode; do not rely on
   binary floating-point for the persisted business result.
6. Version parser semantics if the expression is ever persisted.
7. Treat an incomplete expression as UI draft state—not quantity `0`.
8. Preserve the previous committed value until the new expression passes all
   checks.

Proposed G1 limits for Owner confirmation:

| Rule | Proposed value |
|---|---:|
| Expression length | 64 characters |
| Multiplicative terms | 8 |
| Quantity scale | 2 decimal places |
| Quantity minimum | greater than `0` for submission; optionally `0` while draft |
| Quantity maximum | use a named domain limit after analyzing observed maximum `69,690`; do not copy the database type ceiling blindly |
| Rounding | decimal half-up to 2 places for non-negative quantity and money |

## 8. Decision C — Calculation authority

Before expression support reaches Production, all layers should implement this
single contract:

```text
canonical_quantity = round_half_up(validated_input_result, 2)

material_amount = round_half_up(canonical_quantity * material_unit_price, 2)
labor_amount    = round_half_up(canonical_quantity * labor_unit_price, 2)
item_total      = material_amount + labor_amount
route_total     = sum(item_total for linked items)
boq_total       = sum(route_total)
```

The Owner/accounting authority must approve the exact rounding mode and stage.
Once approved, the same fixture vectors must run in the parser/domain library,
save RPC, reload, print view/controlled PDF capture, and Excel tests.

The contract then continues through the existing version-bound Factor F and
VAT rules without changing their business meaning:

- select the BOQ-bound Factor F reference version and exact lower/upper rows;
- derive the raw interpolated factor and truncate—not round—the factor to four
  decimal places under the canonical Factor F rule;
- derive VAT from the BOQ-bound Factor-version metadata (current published
  versions and explicit legacy fallback are 7%), then round the amount before
  VAT, VAT, and final total at the documented stages;
- apply the existing deterministic multi-route remainder allocation; and
- reject any client-supplied reference version, bracket, raw/truncated factor,
  Factor F total, VAT, or final total that does not match the trusted result.

See [Factor F](../../05_calculation/FACTOR_F.md) and
[VAT and totals](../../05_calculation/VAT_AND_TOTALS.md). This is validation of
the current contract, not authority to alter Factor F or historical snapshots.

### Trusted save boundary

The save API/RPC should:

- authenticate the caller and require the current active profile;
- verify BOQ ownership/role scope and editability;
- normalize each quantity exactly once;
- reject negative, disallowed zero, overflow, excess scale, or malformed input;
- derive item, route, and BOQ totals, or reject a client payload that differs;
- verify the version-bound Factor F snapshot, interpolation boundaries, factor,
  and downstream totals rather than merely accepting those client fields;
- preserve published catalog binding and current historical Factor F semantics;
- save atomically with no partial route/item state;
- retain empty `search_path`, explicit schema qualification, lock timeout,
  statement timeout, and least-privilege execute ACL from P-49; and
- emit safe diagnostic/audit metadata without logging expression content if it
  could contain unexpected sensitive text.

This must be a newly approved forward change after immutable migration 029. It
must not modify or replay migrations 027, 028, or 029.

RLS answers which rows a caller may access; it does not by itself prove the
quantity/amount invariant. This is true for DB-0 as well as DB-1/DB-2 because
authenticated direct table DML currently exists. Q4 must inventory every
write path and choose one enforceable boundary:

- revoke direct item/route mutation and require the trusted RPC, while moving
  only inventoried header mutations into an appropriate trusted boundary; do
  not broadly revoke `boq` header DML until current create/delete consumers are
  migrated; or
- enforce row invariants on every write with constraints/triggers while the
  trusted transaction derives cross-row route/header totals.

A simple `CHECK` cannot enforce sums across child rows. No database option is
Production-ready while an allowed direct write can bypass normalization or
aggregate reconciliation.

This separation follows Supabase's current guidance: Data API grants and RLS
are distinct controls, while callable database functions need explicit execute
privileges and trusted function design. See
[Securing your API](https://supabase.com/docs/guides/api/securing-your-api) and
the announced
[default Data API exposure/grant change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

### Print-view, controlled PDF, and Excel integrity

The current browser print page and Excel export consume saved values; the app
does not generate a deterministic PDF artifact itself. Excel checks route
totals against linked item totals within a tolerance, but the full quantity →
components → item → route → BOQ → Factor F → VAT chain is not enforced
everywhere. See
[exportBoqExcel.ts](../../../lib/exportBoqExcel.ts#L303-L347) and
[exportBoqExcel.ts](../../../lib/exportBoqExcel.ts#L841-L853).

Target behavior:

- Save prevents new inconsistent records.
- Reload verifies and surfaces a safe non-mutating warning for legacy data.
- Print/Export fail closed for inconsistent stored data, with an
  explainable message and support reference.
- Historical legacy rows are reported/classified, not silently repaired.
- “PDF parity” is claimed only after a controlled browser/version/Save-to-PDF
  fixture is defined; until then the test target is print-view data parity.

## 9. Decision D — Database model

### DB-0 — Canonical numeric result only (not selected)

Keep `boq_items.quantity` as the only persisted quantity result. The expression
exists only while editing; after commit/reload the user sees the numeric value.

This means no BOQ table-column change. A Production-grade pilot still needs a
separately approved forward database change to harden the trusted save
function, unless an equally authoritative server boundary is introduced.

**Advantages**

- smallest reversible data-model change;
- legacy rows and consumers remain compatible;
- feature flag can be disabled without data conversion;
- avoids storing formula text before its business meaning is established.

**Disadvantages**

- original formula cannot be restored after reload, copy, print, or export;
- no provenance explaining how the user reached the quantity;
- changing the result requires retyping the expression.

**Risks and controls**

- Risk: users assume the formula was saved. Control: state clearly that this is
  a calculator convenience and show “บันทึกเป็น 10.00”.
- Risk: parser/client result tampering. Control: send canonical numeric input
  through a trusted server normalization and total-recalculation contract.

**Choose when:** the requirement is exactly “let me calculate while entering a
quantity.” The Owner confirmed on 2026-08-31 that the formula must survive
save/reload/reopen, so DB-0 remains a documented alternative but is not the
selected direction.

### DB-1 — Persist expression beside the canonical result (selected)

Keep the current numeric quantity authoritative and add the smallest nullable
metadata set in a newly approved forward migration after 029:

```text
quantity_expression     bounded normalized arithmetic text or NULL
quantity_parser_version arith-v1 or NULL
quantity                numeric(12,2), unchanged canonical result
```

Derive direct versus expression mode from whether `quantity_expression` is
NULL. Do not add `quantity_input_mode` unless a later requirement proves that
legacy/direct/cleared-expression states must be distinguished; omitting it
removes a redundant state that could disagree with the other fields. Do not
turn `quantity` into text, and do not invent or backfill expressions for
historical rows.

The first-release display contract is **editor-only semantic preservation**,
not exact keystroke preservation: canonical input `5*2` and accepted aliases
such as `5x2`, `5X2`, or `5×2` reopen inside the quantity editor as normalized
`5*2`, with `= 10.00` beside it. Normal/read-only screens,
Print/PDF, and Excel show only `10.00`; they never render the formula. Whitespace
and operator aliases need not be reproduced byte for byte. Exact raw keystroke
retention would require storing raw text instead of the normalized form, or an
additional field if both are required, plus a privacy/retention decision and
tests; it is not recommended for G1.

DB-1 invariants:

- NULL expression means a direct numeric quantity and requires a NULL parser
  version.
- A non-NULL expression requires a known parser version, and the trusted
  evaluator's normalized/rounded result must equal `quantity` under D0.
- Editing an expression may update both expression and parser version; an old
  saved expression is never silently reinterpreted using a newer parser.
- An unknown parser version fails closed: inside the quantity editor, show the
  stored expression and canonical number read-only, but do not recalculate or
  overwrite it. Other surfaces continue to show only the canonical number.
- Switching an expression-backed line to direct typing or using a stepper is an
  explicit conversion that visibly clears the expression; it must never leave
  a stale formula beside a different number.
- Save, reload, reopen, route duplicate, normal Atomic Preserve Copy, and
  eligible-legacy Selected-Factor Copy preserve the expression/version/result
  tuple once DB-1 exists. The Factor choice changes only Factor binding and
  downstream Factor-derived snapshots, never quantity semantics. Print/PDF,
  Excel, read-only summaries, and review surfaces render only the canonical
  numeric quantity and must not receive expression text in their view models.

**Advantages**

- reopen and edit the same normalized mathematical expression inside the
  quantity editor;
- keep summaries and official outputs simple and numeric-only;
- parser-version history makes future semantic changes manageable;
- the existing numeric column and downstream arithmetic remain compatible;
- nullable additive fields require no formula backfill for legacy BOQs; and
- a feature flag can disable new expression entry without destroying saved
  formulas.

**Disadvantages**

- expression/result consistency becomes a permanent database invariant;
- copy, revision, export, and migration semantics all expand;
- readers of the row can see the expression, so grammar must remain strictly
  bounded and not become a notes field;
- every write and copy path must carry or deliberately clear the tuple;
- supported historical parser versions must remain reproducible; and
- rollback is retain-and-fix-forward, not drop-columns-and-forget.

**Risks and controls**

- Direct authenticated table DML can bypass a check implemented only in the
  RPC. Choose either a trusted trigger/constraint for every write or inventory
  all write paths and revoke direct mutation so writes must use the RPC.
- A future parser can reinterpret old text differently. Store an immutable
  parser version and verify expression/result server-side.
- The current save pattern replaces child rows, so an old client or payload
  that knows only `quantity` can erase formula metadata silently. Deploy a
  compatible reader first, introduce a versioned trusted save contract, and
  reject/retire stale write paths before enabling DB-1 writes.
- Two current tabs can otherwise overwrite each other even when both speak the
  new protocol. Require an expected BOQ write version/precondition and return a
  recoverable conflict before mutation instead of silent last-write-wins.
- UI and server parsers can disagree. Use the same approved fixtures in both
  implementations and require 100% result/error parity; the server independently
  evaluates rather than trusting the browser result.
- Direct edit or stepper use can leave a stale expression. Make conversion to
  direct mode visible, atomic, and covered by transition tests.
- Formula text copied into spreadsheet or print output would violate the
  selected display scope and could introduce formula-injection risk. Exclude
  expression fields from output view models and assert their absence in
  regression tests.
- Dropping the columns on rollback destroys evidence. Roll back application
  dual-write/read through a forward change and retain the data.

**Decision:** selected by the Owner on 2026-08-31 because users must recover the
formula when returning to edit the quantity. Formula visibility is explicitly
limited to the quantity editor; Print/PDF, Excel, read-only summaries, and
review surfaces remain numeric-only. Do not ship DB-0 and later fabricate
formula history. DB-1 is persistent editing context, not immutable audit
evidence; formal contractual/claims provenance requires DB-2 revision identity
and append-only retention.

#### DB-1 difficulty and planning range

DB-1 is **medium-high complexity but controllable** with the G1
multiplication-only grammar. Adding two nullable columns is the small part; the
hard part is proving that expression, parser version, and numeric quantity
remain one atomic truth in every client, RPC, copy, reload, and output path.

Planning ranges below are estimates, not implementation authority or delivery
commitments. They assume the staffing in Section 2.1 and can overlap:

| Work | Relative difficulty | Indicative effort |
|---|---|---|
| Finalize D0/D2 contract and fixtures | Medium | 2–4 working days |
| UI parser, preview, reopen, and mode transitions | Medium | 4–7 working days |
| Forward schema/RPC design and independent trusted evaluator | High | 5–10 working days |
| Read/copy/output compatibility and stale-client cutover | High | 3–7 working days |
| Automated parity, tamper, regression, rollback, Preview, and UAT evidence | High | 5–10 working days |

DB-1 adds roughly 10–20 engineer-days beyond the result-only alternative once
the shared trusted-save foundation is counted separately. The complete
Production-grade R0–R2 scope is approximately 30–50 engineer-days. With
frontend and database/backend specialists proceeding in parallel, allow about
4–7 weeks to a controlled candidate plus 1–2 weeks of UAT/observation. A solo
implementation is closer to 7–11 weeks. The safer calendar range therefore
remains 1–3 months and must not be compressed by skipping migration,
stale-client, persona, or rollback gates.

#### DB-1 safest implementation order

1. Close D0; D2 already selects normalized semantic persistence and editor-only
   display, while D3 selects canonical `*` with input aliases. Freeze shared
   G1 fixtures, including decimal and rounding edges.
2. Establish an approved post-029-equivalent local test baseline without
   editing or replaying migrations 027/028/029.
3. Build the pure TypeScript parser, UI states, and DB-1-compatible types
   behind a flag, with all database expression writes still disabled.
4. Draft and rehearse a new additive forward schema change with nullable
   fields, named coherence constraints, no backfill, and the flag still off.
5. Deploy/read-test compatibility for legacy NULL, known expression version,
   and unknown-version rows before any writer can create expressions.
6. Introduce the independent trusted evaluator and versioned save successor;
   add the old-protocol guard and expected-write-version check before the
   existing child delete/reinsert step.
7. Migrate every editor, route-duplicate, both DUP-1 modes, output, and test
   harness path; refetch canonical saved state after each successful save.
8. Close or guard direct child-table DML only after the complete consumer
   inventory, then run invariant, persona, atomicity, concurrency, and rollback
   rehearsals in Local/CI/Preview.
9. Seek a separate exact Production authorization, apply the forward change
   once with the feature off, complete read-only postflight, and then enable a
   small named cohort.

#### DB-1 GO/STOP gate

GO only when all of the following are evidenced:

- UI and trusted server produce identical results and typed error reasons for
  every approved and fuzzed G1 fixture.
- Save/reload/reopen/route duplicate and both DUP-1 modes preserve formula,
  parser version, and numeric result.
- Direct edit, stepper, Escape, route switch, and page leave have deterministic
  tested semantics.
- Unknown parser versions fail closed, and historical NULL rows remain valid.
- No permitted direct DML or stale client can save a mismatch or erase a
  formula silently.
- The feature-flag rollback disables new entry while retaining readable saved
  expressions and canonical quantities.

STOP the release on the first silent formula loss/change, UI/server mismatch,
formula/quantity disagreement, stale-client overwrite, output injection, or
rollback design that requires dropping columns or rewriting historical BOQs.

### DB-2 — Structured measurement provenance and save revisions

Introduce append-only save revisions and structured measurements, conceptually:

```text
boq_save_revisions
  boq_id, revision_no, request_id, actor_id, parser_version, created_at

boq_item_measurements
  revision_id, stable_line_key, raw_expression, normalized_expression,
  validated_components_or_ast, exact_result, unit, source

boq_items
  canonical quantity plus stable_line_key/current revision reference
```

This model needs a stable logical line key because the current save path
deletes and reinserts route/item rows, so `boq_items.id` is not durable across
saves.

**Advantages**

- strongest audit, revision diff, measurement source, and dispute support;
- enables unit-aware measurements, field evidence, and later AI explanations;
- supports idempotent/replay-safe save requests when designed correctly.

**Disadvantages**

- highest schema, RLS, migration, storage, copy, and workflow cost;
- requires stable identity and append-only retention before useful UI can ship;
- larger privacy and audit-retention responsibilities.

**Risks and controls**

- Do not attach provenance only to transient item IDs.
- Enable RLS and revoke client mutation when creating the tables.
- Prefer server-only/private or otherwise unexposed tables for append-only
  evidence. If client reads are required, grant only explicit operations, use
  parent-BOQ-scoped RLS, and index foreign-key/policy predicates.
- Write revisions atomically through a versioned RPC such as a new `v2` name;
  avoid ambiguous overloaded PostgREST signatures.
- Use request IDs, uniqueness constraints, and concurrent-save tests.

**Choose when:** measurement provenance affects formal review, contracts,
claims, or field verification.

### DB-X — Put the expression in remarks (reject)

**Perceived advantage:** no migration.

**Why it should not be chosen:** remarks are unstructured, cannot prove the
numeric result, can drift during copy/edit, complicate privacy/search, and mix
business evidence with free text. It creates technical debt without delivering
real provenance.

### DB-DUP — Atomic whole-BOQ duplicate (D9 released and verified)

The former disabled multi-request browser copy was not restored as-is. `DUP-1`
replaces it with one trusted atomic database operation and two deliberately
different user actions:

1. **Copy — preserve source** is the normal action for a BOQ already bound to
   an active Factor F version. It preserves the source Catalog/version, routes,
   items, quantities, categories, snapshotted unit material/labor prices,
   Factor F binding/snapshot, and calculated cost provenance. An unbound legacy
   BOQ never silently enters this mode, even if some old snapshot fields exist.
2. **Copy with selected Factor F** is a separate action available only for an
   eligible positive-total legacy BOQ whose `factor_reference_version_id` is
   NULL. It preserves
   the old Catalog/items/quantities/prices, binds an explicitly selected active
   published Factor F version, clears all old Factor/interpolation/allocation/
   VAT-derived snapshots and totals, and creates an incomplete draft that must
   be reviewed and saved through the trusted calculation path before Print/PDF/
   Excel is allowed.

The selected-Factor action is not an automatic fallback and is not part of the
normal Copy confirmation. The UI may preselect the current Factor F pointer for
convenience, but it must show the exact version and require explicit user
confirmation. It must never silently substitute the pointer when the selected
version is absent, inactive, unpublished, or changes during the request.

Both actions preserve the source price basis. Neither action selects a newer
Catalog or updates item prices. A user who needs current Catalog prices uses
**Create New** and selects items cleanly from the current defaults. Catalog
Requote, Reprice, Rebase, item remapping, and mixed old-structure/current-price
copy are out of scope.

#### Atomic and authorization contract

The trusted operation must:

- authenticate the actor, require an active profile and BOQ-create permission,
  and re-authorize source visibility inside the database operation;
- use a transaction-consistent source snapshot and a deterministic lock order
  so header, routes, and items cannot come from different save moments;
- accept a unique request/idempotency key and an expected source-write token;
  the same actor/request/source returns one destination, while key reuse for a
  different source or mode fails closed;
- create new BOQ, route, and item IDs and remap every route reference, including
  custom items and a pure route-less legacy graph; fail closed when real routes
  and unlinked items coexist because the current editor/save/output path cannot
  preserve that mixed graph end to end;
- set the destination to `draft`, set creator/owner and current organizational
  scope from the authorized actor under the approved policy, use new timestamps
  and document identity, and clear assignment, approval, submission, external
  handoff, and audit state that belongs to the source instance;
- leave the source and every source child unchanged;
- roll back the entire destination, idempotency record, and related evidence if
  any authorization, eligibility, constraint, timeout, or copy step fails;
- use an explicit column allow-list rather than `INSERT ... SELECT *`; and
- preserve the hardened empty `search_path`, explicit schema qualification,
  bounded timeouts, function ownership, and least-privilege execute ACL. Any
  privileged core must perform its own `auth.uid()`/profile/role/source checks;
  `SECURITY DEFINER` must not be used merely to bypass RLS.

#### Eligibility and fail-closed behavior

Normal preserve Copy requires a source whose Catalog/item/route provenance,
active Factor binding, and stored Factor snapshot are usable under the same
integrity contract as edit/Print/Excel. It must not repair, normalize, relink,
or backfill the source to make it copyable. Every Factor-unbound legacy source
uses the separate selected-Factor path or is rejected; preserve mode is not a
legacy fallback.

Selected-Factor Copy requires all of the following:

- the source is legacy snapshot-only (`factor_reference_version_id IS NULL`);
- the source `total_cost` is greater than zero, so the reset Factor snapshot is
  an unambiguous persisted review-required state for the current output guard;
- the source Catalog/item/route/quantity/unit-price data satisfy the approved
  copyable-source integrity predicate;
- the chosen Factor F version is active, published, readable, and valid at the
  locked request boundary; and
- edit, print, route allocation, and Excel derive VAT from that same version's
  `vat_percent` rather than a hard-coded rate; and
- the destination cannot produce official output until the selected version has
  been evaluated and the new snapshot/totals have been saved successfully.

An incomplete old Factor snapshot may be discarded by the selected-Factor path
because no old Factor-derived value is carried forward, but missing or
incoherent Catalog/item/price provenance is not repaired by changing Factor F.
If neither action is eligible, explain why and direct the user to Create New.
Run a fresh read-only aggregate preflight before release to measure eligible and
ineligible source classes; do not backfill historical BOQs to increase the pass
count.

Fresh read-only Production evidence on 2026-08-31 found 58 unbound legacy BOQs
with `total_cost = 0` and none with a negative total. DUP-1 fails those
Selected-Factor requests closed and directs the user to Create New. Allowing a
zero-total Selected-Factor copy would require a durable review-state marker (or
an equivalent database-authoritative output gate) plus the still-open D4 zero
policy; inferring review completion from an all-zero Factor snapshot is unsafe.

#### UI/UX contract

Use two unambiguous actions rather than one dialog that silently changes mode:

- **คัดลอก** — normal preserve copy. Confirmation: “สร้างสำเนาฉบับร่างโดยคง
  รายการ ปริมาณ บัญชีราคา ราคา และ Factor F เดิมทั้งหมด ระบบจะไม่อัปเดต
  ราคา”
- **คัดลอกและเลือก Factor F** — the current DUP-1 UI exposes a clearly labelled
  candidate path for an unbound, Catalog-bound legacy BOQ, then the trusted RPC
  performs the authoritative eligibility check at confirmation. Show the exact
  selected version and require explicit confirmation. If the source is
  permanently ineligible, do not loop the same retry: explain that no repair or
  backfill occurred and offer Create New. A trusted batched eligibility
  projection that hides ineligible row actions is a candidate `L1.1`
  follow-up, pending an explicit Owner scope decision, so the first list release
  need not duplicate the large predicate in client code or add privileged
  database work without evidence. The existing trusted Copy RPC remains the
  final authority.
- Guidance beside both flows: “หากต้องการราคาปัจจุบัน ให้สร้าง BOQ ใหม่”
- The positive-total selected-Factor destination displays an
  incomplete/review-required banner and disables Print/PDF/Excel until trusted
  save completes. Zero-total legacy sources are rejected rather than allowed to
  bypass this state.
- While either request is running, disable both desktop and mobile triggers and
  reuse the same request key for retry. On success, open the destination edit
  page and identify whether it preserved Factor F or awaits selected-Factor
  recalculation.
- Eligibility errors must explain the failed class without exposing another
  user or out-of-scope BOQ. Never fall back from selected-Factor to normal Copy
  or from either copy mode to Create New without a new explicit user action.

#### Forward compatibility and outputs

`DUP-1` ships before DB-1 Quantity Expression. When DB-1 later adds
`quantity_expression` and `quantity_parser_version`, both duplicate modes must
be upgraded in the same expression release to preserve the complete normalized
expression/parser-version/numeric-result tuple. The canonical operator is `*`;
`x`, `X`, and `×` are accepted aliases and reopen normalized, for example as
`5*2`. Formula text remains editor-only; normal/read-only UI, Print/PDF, and
Excel remain numeric-only.

The DUP-1 output guard is scoped to the selected-Factor reset state: the new
copy has no Factor/bracket snapshot, so edit and direct Print/Excel stay closed
until a successful trusted save. The existing client helper
`isFactorSnapshotUsable` is not a general proof of raw interpolation,
Factor-derived totals, or VAT integrity against arbitrary direct header DML.
That broader database-authoritative output contract remains R0 work and must
not be claimed as completed by DUP-1.

GO requires persona/RLS, exact preserve/reset allow-list, multi-route/custom/
pure-route-less success plus mixed-graph rejection, source-change,
double-click/retry, lock-timeout, rollback, and
Print/PDF/Excel tests. Normal Copy outputs must equal the preserved source cost
snapshot. Selected-Factor copies must fail official output before trusted save
and agree with the selected Factor version afterward. These gates and exact
postflight evidence passed for DUP-1 on 2026-08-31 under
[Result #04](./04-atomic-boq-duplicate-production-release-result.md). A future
change must earn its own gates rather than inheriting this result.

## 10. Decision E — Login and account creation

The current application already has email/password login, self-signup,
forgot-password, pending approval, active/suspended/inactive profile checks,
and Admin account management. The login page performs the same allowed-email
precheck for login, signup, and forgot-password, while password inputs permit a
minimum of six characters. See [login/page.tsx](../../../app/login/page.tsx)
and [middleware](../../../lib/supabase/middleware.ts#L43-L119).

Account admission and sign-in should be separated conceptually:

- **Admission:** who may create/join an organizational account?
- **Authentication:** can this person prove identity now?
- **Authorization:** what may the active profile do?
- **Session lifecycle:** when must existing sessions step up or end?

An email-domain rule belongs primarily to admission. Existing authorized users
should not be unexpectedly locked out of login/password recovery merely
because signup policy changes.

AUTH-A and AUTH-B below are provisioning/admission alternatives. AUTH-C is an
authenticator and may coexist with either pre-provisioning or IdP-managed
just-in-time provisioning; SSO does not answer who should receive an
application profile or role.

### AUTH-A — Keep self-signup + Admin approval, but harden it

**Advantages**

- lowest user onboarding friction;
- reuses the current pending/approval UI;
- suitable when legitimate users arrive unpredictably.

**Disadvantages**

- creates pending-account review/support work;
- UI-only admission checks do not prevent direct use of a public Auth signup
  API; application RLS can block business data, but unwanted Auth identities
  may still be created;
- offboarding and duplicate/abandoned accounts require active operations.

**Required hardening**

- use generic responses to reduce account enumeration;
- enforce rate limits and abuse monitoring;
- increase password strength and enable leaked-password protection;
- keep signup eligibility out of login/reset decisions for existing accounts;
- define rejected-account resubmission versus Admin reapproval explicitly;
- revoke sessions on suspension/deactivation, not only block business routes;
  and
- require MFA/AAL2 inside every privileged trusted route/function and future
  approval transition—not only in UI or RLS. `SECURITY DEFINER` functions must
  verify current profile, role, assurance level, and exact action themselves.

**Recommendation:** transitional only if invite/pre-provision is not ready.

### AUTH-B — Admin invite or pre-provisioned organizational accounts

Disable open self-signup and let an Admin/authorized identity operator invite
or pre-provision a known person. Auth Admin operations must run only through a
server-only authorized boundary; a Supabase secret/service credential must
never enter browser code, a `NEXT_PUBLIC_*` variable, logs, screenshots, or
client-visible errors.

**Advantages**

- strong fit for an internal system and the observed small account population;
- fewer unwanted/pending Auth identities;
- clear sponsor, role, organization, and offboarding ownership;
- can be implemented before corporate SSO is available.

**Disadvantages**

- adds Admin workload and invite-expiry/resend support;
- the account directory can drift from HR/contractor records;
- emergency onboarding outside office hours needs a process.

**Recommendation:** **preferred next account-creation model** if the intended
audience remains internal/known personnel.

### AUTH-C — Corporate SAML SSO authenticator

Use the organization’s supported identity provider, with role/profile mapping
inside Conduit BOQ.

**Advantages**

- centralized password, MFA, joiner/mover/leaver, and conditional-access
  policy;
- lower long-term credential support burden;
- best fit for enterprise governance and separation of identity from app role.

**Disadvantages**

- provider plan/licensing, identity-team ownership, metadata/certificate
  rotation, staging, and incident coordination are dependencies;
- SSO proves identity but does not replace application authorization, role
  approval, or RLS;
- Supabase SAML identities are not assumed to link automatically to existing
  password identities. Because `user_profiles.id`, `boq.created_by`, and
  `boq.assigned_to` are tied to `auth.users.id`, the pilot needs an explicit
  duplicate-prevention, account-link/migration, ownership-continuity, and
  rollback design; and
- Supabase Auth SAML single logout is not supported as of 2026-08-30; reverify
  at implementation. Session time-box/inactivity controls and local revocation
  therefore remain necessary.

**Recommendation:** strategic target after an IdP owner, budget, test tenant,
mapping rules, and break-glass procedure are confirmed. Do not block R0/R1 on
SSO.

### Recommended staged account plan

1. In the S0 lane, read the exact Auth configuration and prepare
   leaked-password protection, stronger password policy, generic auth errors,
   rate-limit verification, and a separately approved rollout.
2. Separate signup admission logic from login/password recovery.
3. Require MFA/AAL2 inside every Admin and Approver high-risk trusted boundary;
   UI visibility and RLS alone are insufficient for `SECURITY DEFINER` RPCs.
4. Define session maximum lifetime, inactivity timeout, single-session policy
   if desired, and server-side revocation on suspend/deactivate.
5. Build server-only Admin invite/pre-provision and then disable self-signup.
6. Pilot corporate SSO only after identity/BOQ ownership continuity is proven;
   keep one monitored, tightly controlled break-glass path.
7. Record immutable security events for invite, activation, role change,
   suspend, reactivation, privileged approval, and session revocation without
   logging passwords, tokens, or secrets.

Provider references:

- [Supabase session controls](https://supabase.com/docs/guides/auth/sessions)
- [Supabase MFA and assurance levels](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase SAML SSO](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml)
- [Supabase password and leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [NIST SP 800-63B authentication guidance](https://pages.nist.gov/800-63-4/sp800-63b.html)

The already-proposed API key maintenance remains a separate change:
[Supabase Publishable and Secret API Key Migration](../security/01-supabase-api-key-migration-change-request.md).

## 11. Decision F — BOQ lifecycle and approval

### W0 — Continue estimate-only optimization

Focus only on faster BOQ creation, templates, search, expressions, and exports.

**Pros:** fastest user productivity improvement; minimal governance change.

**Cons:** all BOQs remain draft-like files; no authoritative approved version,
review queue, separation of duties, or controlled downstream handoff.

**Choose when:** the product is intentionally a personal/team calculator and
another system owns approval.

### W-H — Versioned handoff to an external approval authority

Conduit freezes and hashes a submitted package, sends/exports it to the
existing formal process, and stores only the external system/reference,
submitted time, returned decision/status, and superseding revision link.

**Pros:** avoids duplicating legal/procurement approval; provides stable BOQ
evidence and reconciliation while keeping authority where it already belongs.

**Cons:** depends on another process/system; status can become stale; users may
switch contexts; integration/manual reconciliation needs an owner.

**Choose when:** signed paper, ERP, document management, procurement, or
another organizational workflow is the formal authority.

### Authority discovery gate before W-H or W1

`263 draft` rows prove only that Conduit currently stores no non-draft
instances. Before choosing the workflow, interview and document:

- how a BOQ is reviewed and signed today, and which record has legal/operating
  standing;
- monetary/project thresholds, separation of duties, delegations, SLA, and
  escalation;
- required signatures, revision numbering, retention, void/supersede, and
  audit access;
- downstream procurement/finance handoff and system owner; and
- whether Conduit should own approval or only create a controlled package.

This discovery can move W-H/integration earlier than an in-app approval flow.

### W1 — Linear governed lifecycle (recommended only if Conduit owns approval)

Proposed initial states:

```text
draft -> submitted -> under_review
under_review -> changes_requested -> submitted
under_review -> ready_for_approval -> approved
approved -> superseded | void
```

Core rules:

- Creator can edit draft and resubmit changes.
- Reviewer can comment, request changes, or sign off as ready for approval.
- Approver can approve only an immutable, integrity-passing revision.
- Owner decides whether self-approval is forbidden; recommended default is
  separation of Creator and Approver for material BOQs.
- Approved rows are never edited in place; a new revision supersedes them.
- Each transition records actor, timestamp, from/to state, comment/reason, and
  exact revision/hash.
- PDF/Excel show status, revision, approval identity/time, and superseded/void
  watermark where applicable.
- Catalog publication remains separate from BOQ approval.

Before implementing these states, converge the existing contracts. The
database currently has an unconstrained `varchar(20)` defaulting to `draft`
([baseline](../../../supabase/local/production-baseline.sql#L359-L386)), one
TypeScript model uses `draft | submitted | approved`
([supabase.ts](../../../lib/supabase.ts#L39-L48)), and permission/helper logic
also refers to `pending_review | pending_approval`
([permissions.ts](../../../lib/permissions.ts#L113-L131)). A separate status
design must define one vocabulary, allowed transition matrix, idempotency,
project/role scope, separation of duties, immutable revision/hash, and how the
status column is protected from direct Data API updates. UI-only state checks
are insufficient.

**Pros:** creates a real system of record, clear downstream authority, and a
foundation for procurement/reporting.

**Cons:** needs reviewer queues, notifications, permissions, immutable
snapshots, exceptions, and operational ownership.

**Risks:** an unclear approval SLA can slow work; global roles may be too broad;
copy/duplicate semantics can accidentally bypass review.

**Controls:** start with one organizational workflow, project-scoped
assignments, due dates, escalation visibility, and explicit copy-as-new-draft
that uses the D9 preserve/reset contract and never inherits approval authority.

### W2 — Configurable multi-step workflow engine

Support conditional steps, multiple reviewers, thresholds, parallel/serial
approval, delegation, and project-specific templates.

**Pros:** fits multiple departments and high-value approvals.

**Cons:** significantly increases configuration, testing, support, audit, and
migration complexity.

**Recommendation:** defer. Operate W-H or W1 and observe real exceptions first;
do not create a generic workflow engine from hypothetical needs.

## 12. What comparable global products teach

The goal is not to copy product breadth. The useful patterns are:

| Pattern | Industry example | Lesson for Conduit BOQ |
|---|---|---|
| Searchable case/register pagination | [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/) and [LIST-1 research](./03-boq-list-pagination-best-practice-research.md) | Case/register lists that need random access benefit from numbered navigation and accessible state; infinite scroll is a poor fit for this context, while page size and offset-versus-cursor remain product/scale choices. |
| Explicit formulas | [Bluebeam custom formula columns](https://support.bluebeam.com/revu/how-to/tips-and-tricks/calculate-costs-with-custom-columns-in-markups-list.html) | Calculations are named and visible; they are not silently produced by deleting user input. |
| Parts/assemblies flowing into estimate/budget | [Procore Estimating](https://support.procore.com/products/online/user-guide/project-level/estimating) | Reusable structured assemblies are valuable after the item and quantity model is stable. |
| Configurable review steps and edit restrictions | [Autodesk Construction Cloud cost approval workflows](https://help.autodesk.com/cloudhelp/ENG/Build-Cost/files/collaborate/Cost_Approval_Workflows.html) | Review states need due dates, actions such as revise/reject, edit locking, and an activity record. |
| Controlled accounting integration | [Autodesk Cost integrations](https://help.autodesk.com/view/BUILD/ENG/?guid=Cost_Integrations) | Integrations should lock ownership of fields/actions to prevent two systems from producing conflicting truth. |
| Immutable superseded revisions | [Oracle Aconex document supersede](https://help.aconex.com/high-compliance-environments/documents/hce-update-supersede-a-document/) | Older approved versions remain accessible; corrections create a new revision chain. |
| Actor/revision/time event history | [Oracle Aconex event log](https://help.aconex.com/documents/view-the-event-log-to-see-which-users-have-accessed-or-changed-a/) | Audit answers who changed/accessed what, which revision, and when. |
| Stable identity across revisions | [Oracle Aconex Documents API](https://help.aconex.com/apis/api-guide-documents/) | A stable tracking identity should survive revisions; transient database row IDs are not enough. |

World-class behavior in this category is mostly trust infrastructure: clear
calculation provenance, server enforcement, revision identity, controlled
approval, activity history, and explicit integration ownership. A larger
feature list without those foundations would make this product less reliable,
not more competitive.

## 13. Recommended development order

The dates below are planning ranges, not promises. Each horizon advances only
when its exit gate passes.

### R0 — Calculation Integrity & Safe Input (0–2 weeks)

**Outcome:** one approved numeric contract and no silent formula-to-number
conversion.

#### R0A — Silent-input safety guard (small separate release)

**Status:** proposed and awaiting Owner decision; no implementation authority.

R0A keeps the editor numeric-only. If the draft contains unsupported syntax
such as `5*2`, `5x2`, `5X2`, or `5×2`, retain the invalid draft so the user can
see and correct it, show an accessible explanation, and leave the last valid
quantity and every derived total unchanged. Blur, Enter, paste, and mobile
input must not commit concatenated digits.

R0A adds no expression evaluator, parser version, persisted formula, database
column, RPC/schema change, or migration. Its exit gate is a component/domain
regression suite proving invalid drafts never reach `onChange`, save payloads,
Print/PDF, or Excel, while valid direct numeric entry and stepper behavior still
work.

#### Remaining R0 contract work

Work:

1. Freeze quantity scale, zero policy, maximum, rounding mode, and every amount
   rounding stage with Owner/accounting sign-off.
2. Build read-only discrepancy fixtures for the observed legacy patterns;
   classify rather than mutate them.
3. Design a disposable Local/CI schema/RPC/RLS contract equivalent to the
   approved post-029 state using an approved sanitized schema snapshot or
   equivalent contract fixture, with method and hash recorded. The present
   bootstrap stops at 026, but 027/028/029 must not be executed, edited,
   retried, or replayed to close that gap. The baseline mechanism needs a separate Owner
   decision and must exclude Production users, sessions, MFA, tokens, and
   secrets.
4. If D7 includes mobile in the pilot, specify responsive route navigation and
   line-item cards using the current design system; otherwise specify an
   explicit unsupported-mobile boundary and gate responsive work before general
   Production.
5. Define security quick-win changes as a separate release lane.

**Exit gate**

- signed calculation decision table;
- failing regression test for `5x2 -> 52` exists and the safe guard passes;
- agreed legacy-data disposition is “preserve/report,” not backfill;
- an explicitly approved non-replay Local/CI contract represents the post-029
  behavior without Production identities/session data; and
- the D7 scope is explicit: either the 390 px core task passes, or the named
  pilot is desktop-only and cannot be mistaken for supported mobile.

### DUP-1 — Atomic BOQ Duplicate (complete; original estimate 2–4 weeks)

**Status:** COMPLETE — released and verified in Production on 2026-08-31 under
[Result #04](./04-atomic-boq-duplicate-production-release-result.md). The exact
release authority is consumed.

**Outcome:** users can copy a BOQ without partial data. Normal Copy preserves
the original cost basis; eligible legacy BOQs additionally offer an explicit
selected-Factor copy that retains old Catalog/items/prices and replaces only
the Factor basis through a reviewed draft.

Work:

1. Freeze the exact preserve/reset allow-list and eligible-legacy predicate;
   produce a fresh read-only class count before any release decision.
2. Implement one typed, idempotent, atomic trusted operation with stable source
   locking, expected-write conflict handling, new ID mapping, authorization,
   bounded timeouts, rollback, and least-privilege ACL.
3. Restore normal Copy with clear wording that Catalog, item prices, and Factor
   F are unchanged.
4. Expose Selected-Factor Copy as a candidate path only for an unbound,
   positive-total, Catalog-bound legacy BOQ; let the trusted RPC make the final
   eligibility decision, show the exact selected active published version, clear
   Factor-derived snapshots/totals, and require trusted review/save before
   official output. Permanent ineligibility must direct Create New instead of
   retrying the same request.
5. Reset destination administrative identity to a new draft owned by the
   authorized actor; never inherit assignment, submission, approval, or
   external handoff state.
6. Direct users who need current Catalog prices, or whose source is ineligible,
   to Create New. Do not add Catalog Requote/Reprice/Rebase.
7. Test source/destination equality and reset sets, persona/RLS/ACL behavior,
   double-click/retry, source-save concurrency, invalid-child rollback, custom
   items, pure route-less legacy graphs, mixed route/unlinked rejection,
   multi-route mapping, and desktop/mobile UI states.
8. Verify Print/PDF/Excel equality for normal copies and fail-closed-before-save
   behavior plus selected-version parity for Selected-Factor copies.

**Exit gate**

- one user intent creates exactly one complete destination or none;
- the source remains byte-for-byte unchanged in all copy-owned fields;
- normal Copy preserves Catalog, prices, Factor provenance, and output totals;
- Selected-Factor Copy is impossible for a non-legacy/ineligible source, carries
  no old Factor-derived snapshot, and cannot produce official output until save;
- an unbound zero-total legacy source fails closed to Create New until D4 and a
  durable review-state/output-gate design are approved;
- current Catalog/default prices are reachable only through Create New;
- every required persona and direct/RPC attack test passes; and
- migration 029, matching application deployment, Production verification, and
  no-residue postflight are recorded in Result #04; future changes need new
  authority.

### LIST-1 — Bounded BOQ/project register (independent 1–2 weeks)

**Status:** proposed and awaiting Owner decision; no implementation authority.

**Outcome:** the Admin register shows a searchable server page with safe
restorable state, an initial 25-row default, RLS-correct count, and a bounded
route batch instead of loading every BOQ and issuing route requests per
rendered row.

Now that DUP-1 is complete, the next recommended decision closeout covers R0A
and LIST-1 together. Latest source review recommends the narrow R0A guard as a
small separate release before LIST-1 implementation, subject to Owner choice;
LIST-1 remains the next substantial feature. The wider R0 calculation
safety/test baseline must still precede R1/DB-1 Quantity Expression. See the
[focused LIST-1 plan](./02-boq-list-scaling-decision-plan.md) and its
[best-practice research](./03-boq-list-pagination-best-practice-research.md).

### S0 — Authentication/security baseline (parallel, separate changes)

**Outcome:** reduce known credential/session risk without coupling identity
changes to the calculator or workflow schema.

Work, each subject to its own authority level and rollback:

1. Read and record the organization/project plan and feature entitlements plus
   exact password, time-box, inactivity, single-session, JWT, rate-limit,
   redirect, and signup settings; do not assume every proposed control is
   available on the current plan.
2. Enable leaked-password protection and an approved password policy.
3. Separate signup admission from login/recovery and use generic public errors.
4. Add MFA enrollment/recovery and require AAL2 inside Admin trusted
   routes/functions before relying on MFA for authorization.
5. Revoke refresh/session capability on suspend/deactivate within an approved
   SLA and test that middleware/RPC denial remains intact.
6. Inventory all security-advisor findings function by function; confirm which
   callable `SECURITY DEFINER` functions are intentional, bounded, guarded, and
   least-privilege rather than treating the warning class as automatic failure.

**Exit gate**

- settings and dated advisor disposition are evidence-backed;
- Admin high-risk actions fail at AAL1 and pass only at AAL2 after all
  role/profile checks;
- session revocation timing is measured; and
- no secret/service credential reaches the browser.

### R1 — Expression and chosen editor-scope prototype (2–6 weeks)

**Outcome:** UI-2 + G1 works locally/Preview behind a feature flag.

Work:

1. Pure tokenizer/parser and decimal normalizer.
2. Expression field states: pristine, editing, valid preview, invalid,
   committed, and reverted.
3. Keyboard and mobile operator-bar interactions.
4. Responsive route selector and line-item card/grid when D7 includes mobile;
   otherwise a clear desktop-only pilot boundary and queued responsive design.
5. Canonical client domain calculation used by editor, summary, and fixtures.
6. DB-1-compatible line-item types and read state, including legacy NULL and
   unknown-parser-version behavior; database writes remain off until R2.
7. Numeric-only non-editor, Print/PDF, and Excel view models that cannot render
   expression text.
8. Telemetry events that record outcomes/reason codes, not raw formulas.

**Exit gate**

- all grammar, boundary, paste, mobile, keyboard, and accessibility tests pass;
- invalid input never changes the last committed quantity or any total;
- no `eval`, dynamic code, or silent sanitizer remains;
- every viewport included by D7 passes end to end, and unsupported mobile is
  explicitly communicated for a desktop-only pilot; and
- users understand that a committed formula is persistent DB-1 context and
  that it appears only inside the quantity editor; direct editing/stepper
  conversion clears it explicitly.

### R2 — Trusted save, print/export, and controlled pilot (1–3 months)

**Outcome:** the DB-1 formula/result tuple survives save/reload/reopen while
saved numeric truth remains invariant across print view, controlled PDF fixture
when defined, and Excel.

Work:

1. Newly approved forward DB-1 columns and versioned trusted save protocol;
   preserve all P-49 guards and ACLs.
2. Independently evaluate G1 server-side, normalize quantity once, and derive
   or validate route/header totals from that canonical value.
3. Deploy compatible readers before writers; reject stale/old save protocols
   atomically before their delete/reinsert path can erase expression metadata.
4. Require an expected BOQ write version so a second stale tab conflicts before
   mutation rather than silently overwriting newer formula state.
5. Close or guard every direct item/route DML path and test the invariant at
   the actual trusted boundary.
6. Save → hard reload → reopen → route duplicate/both DUP-1 modes → print
   → Excel parity checks; formula returns only to the quantity editor and is
   absent from all output payloads/view models.
7. New-data integrity gate plus non-mutating legacy warning/reporting.
8. Enforce D4 per action: an unresolved zero/incomplete line cannot produce an
   official-looking package. Either block print/Excel or visibly watermark and
   enumerate it as incomplete; submit/approve always block.
9. Feature-flagged pilot for a small named cohort.
10. Run the relevant Production persona matrix; the old accepted residual is
   not silently relabelled as PASS.

**Exit gate**

- 100% parity for approved calculation vectors;
- tampered client totals and invalid quantities fail atomically;
- no new discrepancy is produced during pilot;
- the persisted expression/version/result tuple survives hard reload, repeated
  save, route duplicate/both DUP-1 modes, concurrent/stale-client attempts,
  and rollback;
- unknown parser versions fail closed and legacy NULL rows remain readable;
- print view/controlled PDF fixture, Excel, and reload agree exactly with the
  saved canonical numeric BOQ state and contain no expression text; and
- rollback disables new expression entry while compatible readers/writers
  retain every saved expression and valid numeric quantity.

### R3 — Governed BOQ decision lifecycle (3–6 months)

**Outcome:** controlled revisions enter the real organizational authority,
either through W-H or W1.

Work, in separate deployable changes:

- Admin invite/pre-provision and self-signup retirement;
- IdP/HR joiner-mover-leaver ownership; S0 remains a prerequisite rather than
  being delayed into this milestone;
- if W-H: immutable submitted package, external reference/status,
  acknowledgement/reconciliation, and superseding revision;
- if W1: converged state machine, project-scoped role assignments, reviewer
  queue, comments, changes requested, and immutable approval snapshot;
- approval metadata on PDF/Excel; and
- audit event model and retention policy.

**Exit gate**

- every privileged/approval action proves active role and required assurance
  level inside its trusted route/function;
- suspended users lose business access and refresh capability within the
  approved SLA;
- no approved revision can be mutated in place;
- the selected external/in-app transition permissions, idempotency, and
  separation-of-duty tests pass; and
- an approved package has one stable identity/hash across UI, controlled PDF
  artifact, and Excel.

### R4 — Revision diff, reporting, and optional SSO (6–12 months)

**Outcome:** teams can understand what changed and operate the lifecycle.

Work:

- supersede/revise/void flow with line-level and amount-level diff;
- cycle-time, changes-requested, approval backlog, and discrepancy dashboards;
- organization/project templates or assemblies based on observed repetition;
- corporate SSO pilot if identity dependencies are ready;
- stable line keys and save revisions if `DB-2` is approved; and
- versioned procurement package/API contract.

**Exit gate**

- reviewers can explain every changed amount between revisions;
- reporting definitions are reconciled to source records;
- SSO duplicate prevention, account/ownership continuity, offboarding,
  fallback, and rollback are rehearsed, if enabled; and
- integration contract identifies exactly which system owns every field.

### R5 — Procurement and actual-vs-estimate handoff (12–18 months)

**Outcome:** approved BOQs feed a controlled downstream process without two
editable sources of truth.

Possible work:

- versioned purchase/request package;
- acknowledgement and status return from ERP/procurement;
- variation/change-order model separate from negative quantity hacks;
- committed/actual cost import and variance reporting; and
- controlled catalog/assembly references, never historical repricing.

**Exit gate**

- idempotent integration and reconciliation pass;
- each side’s field ownership and retry behavior are documented;
- no downstream update mutates an approved BOQ revision; and
- finance/procurement owners approve operating and incident procedures.

### R6A — Field execution and GIS/as-built (18–24+ months)

**Outcome:** extend only where governed BOQ data creates measurable field
value.

Candidates:

- route/location reference and as-built evidence;
- field measurement capture feeding a new revision, never rewriting approval;
- progress and actual quantities.

**Exit gate**

- field/location ownership, offline/sync policy, evidence retention, and
  revision handoff are approved; and
- a small field pilot improves traceability without weakening approved
  history.

### R6B — Evidence-grounded AI (independent 18–24+ month gate)

AI is not automatically authorized by R6A and does not require a GIS feature.
It begins only when the chosen use case has governed source data and measurable
human feedback.

Candidates:

- anomaly detection for quantity/price/revision patterns;
- assembly or line-item suggestions with source explanation; and
- human feedback/acceptance tracking.

**Exit gate**

- data quality, ownership, consent/retention, and ground-truth feedback exist;
- AI suggestions are never auto-approved or silently inserted;
- every suggestion cites its source/catalog/revision basis; and
- a small pilot proves time/quality benefit without increasing correction
  risk.

## 14. Detailed work packages for R0–R2

### Q0 — Product and accounting contract

Deliverables:

- allowed grammar and limits;
- zero/negative/maximum policy;
- decimal and rounding decision table;
- draft/commit/save/print semantics;
- signed DB-1 contract: normalized `*` semantic persistence rather than exact
  raw retention, direct/stepper conversion, both DUP-1 copy modes, editor-only
  formula visibility,
  numeric-only read-only/Print/PDF/Excel, parser version support, and retention;
  and
- approved fixture vectors including boundary and legacy cases.

### Q0A — Test-harness foundation

The repository currently has Vitest calculation coverage but does not yet have
the full browser/component/accessibility/property/concurrency harness assumed
by the R1/R2 exit gates. Before those gates are binding, select and prove:

- component interaction and accessibility testing;
- browser end-to-end testing at desktop and the D7 mobile scope;
- property/fuzz testing for the bounded parser;
- database persona, tamper, atomicity, idempotency, and concurrency fixtures;
- a controlled print-view/Save-to-PDF environment if PDF parity is claimed;
  and
- CI evidence retention with sanitized artifacts and stable fixtures.

### Q1 — Safe parser and normalizer

Deliverables:

- pure parser with typed error reasons;
- no dynamic code execution;
- decimal implementation and parser version;
- unit tests, property/fuzz tests, and performance bounds; and
- G1 aliases normalized for display without changing meaning.

### Q2 — Quantity field and chosen responsive scope

Deliverables:

- UI-2 states and accessible labels/descriptions/errors;
- keyboard, paste, Enter, blur, Escape, undo, stepper, route-switch, and
  navigation contract;
- mobile operator bar, route selector, and line-item card/grid when selected by
  D7, or an explicit desktop-only pilot boundary;
- save/print/export blocking for invalid/uncommitted state; and
- sanitized screenshots plus interaction test evidence.

### Q3 — Canonical calculation domain

Deliverables:

- one quantity/material/labor/item/route/BOQ/Factor F/VAT implementation
  contract;
- shared fixture vectors across TypeScript and SQL;
- unvalidated draft input never becomes canonical or enters telemetry; persist
  only the approved bounded DB-1 expression representation and parser version
  beside the trusted normalized quantity; and
- explicit Factor F boundary with no change to existing snapshots/history.

### Q4 — Database-authoritative save

Deliverables:

- preflight and new forward migration plan after 029;
- additive nullable DB-1 fields, named coherence constraints, no formula
  backfill, and a versioned trusted save successor;
- an expected BOQ write-version/precondition that rejects two-tab stale writes
  before child deletion;
- a server-side G1 evaluator that independently proves expression/version/
  quantity equality and feeds one canonical quantity into all totals;
- direct-DML invariant strategy for DB-1, including transition protection and
  final child-table privilege boundary after a complete consumer inventory;
- auth/profile/ownership/catalog/timeout/ACL preservation tests;
- full Factor F reference-version/bracket/raw/truncated-factor/route
  allocation/VAT/final-total validation;
- fresh migration ledger, schema, function, RLS, grant, and ACL drift
  preflight;
- exact migration source hash, short lock/traffic window, compatible-reader-
  before-writer deployment, and stale-client rejection protocol;
- security/performance advisor disposition;
- verified backup/restore against approved RPO/RTO;
- postflight counts, function hashes, persona checks, and invariant readback;
- atomic rollback and concurrency/idempotency tests;
- non-destructive feature rollback that retains expressions and all supported
  parser versions; never roll back to a writer that omits DB-1 fields;
- fix-forward recovery that never replays 027/028/029; and
- no Production execution without a separate exact approval.

Migration 029 already records a separately approved product change—not a
migration required for repository convergence. Any future product migration
must follow it forward under fresh approval and must not replay 027/028/029.

### Q5 — Reload, print-view/controlled PDF, and Excel parity

Deliverables:

- save/reload/render/export equation checks;
- formula/version/result round-trip checks for edit/reopen, route duplicate,
  normal Atomic Preserve Copy, and eligible-legacy Selected-Factor Copy, with
  unknown versions read-only/fail-closed;
- proof that expression fields never enter read-only, Print/PDF, or Excel view
  models and outputs;
- clear legacy warning policy;
- approved fixture parity including rounding edges; and
- no official output generated from inconsistent stored data.

### Q6 — Pilot, UAT, and release evidence

Deliverables:

- named cohort, flag, support owner, duration, and rollback threshold;
- D7-scoped desktop/mobile scenario matrix;
- exact active/pending/suspended/Admin/owner/assignee/scoped-manager/
  out-of-scope-manager/procurement persona checks;
- no-mutation catalog/Factor F readback;
- discrepancy and error telemetry; and
- Owner UAT and a new release authorization receipt.

## 15. Test matrix

| Area | Minimum scenarios |
|---|---|
| Parser | canonical `5*2`, aliases `5x2`, `5X2`, `5×2`, normalized reopen as `5*2`, decimals, whitespace, chained terms, empty term, unknown letter, paste, very long input, huge number, underflow/overflow, non-finite result. |
| Quantity policy | zero, negative, more than 2 decimals, exact half rounding, observed maximum, proposed domain maximum, empty draft, cancel/revert. |
| Interaction | typing, operator button, blur, single Enter commit, Escape, explicit expression-to-direct/stepper conversion, undo, route switch, route duplicate, item removal, page leave, save, print, export; invalid/uncommitted draft blocks every destructive/navigation/output action. |
| Responsive | Every viewport selected by D7; before general release include 390 px phone, tablet, desktop, zoom, long item name, large quantity, Thai error text, and software keyboard. |
| Accessibility | explicit label, focus order, visible focus, error association/live announcement, touch targets, icon names, keyboard-only task, contrast. |
| Calculation | quantity → components → item → route → BOQ → bound Factor F raw/truncated value → route allocation → VAT/final-total vectors; rounding edges; empty route; legacy unlinked item fixture; no Factor F business-rule change. |
| API/RPC attacks | malformed JSON, excess scale, negative/zero, huge quantity, expression/result mismatch, missing/unknown parser version, stale v1 payload against an expression-bearing BOQ, tampered item/route/header totals, Factor F version/bracket/raw/truncated factor/allocation/VAT/final totals, wrong owner, inactive profile, out-of-scope manager, procurement, and direct DML attempt; authorized staff owner/assignee/scoped manager remain valid where intended. |
| Duplicate | normal preserve and eligible-legacy selected-Factor modes; exact preserve/reset allow-lists; header-only, multi-route, custom items and pure route-less legacy graphs; mixed route/unlinked rejection; ineligible legacy; active/published selection; source unchanged; Create New guidance for current prices. |
| Atomicity | one invalid line among many, timeout, two-tab concurrent/stale save, save-request retry, BOQ-copy double-click/request retry, request-key reuse across source/mode, rollback, rejected old protocol, and no partial header/route/item/idempotency state or metadata erasure. |
| Persistence | DB-1 normalized expression/version/result round-trip through save, hard reload, reopen, repeated save, route duplicate, normal Atomic Preserve Copy, eligible-legacy Selected-Factor Copy, two-tab stale write, and rollback; legacy NULL remains numeric-only; unknown version fails closed; no fabricated legacy expression. |
| Outputs | The quantity editor restores the formula; normal/read-only UI, print view, controlled PDF fixture when defined, and Excel expose only the canonical numeric result and contain no expression text; consolidated output never invents a combined formula; approved revision/hash and superseded/void markings apply only after the revision model exists. |
| Auth | invite expiry/resend, pending with rejection metadata/resubmission, active/suspended/inactive, forgot-password, generic errors, MFA enrollment/recovery, AAL1 denial, AAL2 success inside privileged functions, and session revocation. |

## 16. Risk register

| Risk | Likelihood / impact | Control | Stop condition |
|---|---|---|---|
| `5x2` silently becomes `52` | Current / high | UI-0 reject guard; UI-2 parser states | Any unknown input can produce a committed number. |
| UI, DB, print/PDF, Excel disagree | Medium / critical | Canonical contract, server derivation, shared vectors | Any new saved record fails parity. |
| Factor F/VAT client fields are tampered or stale | Medium / critical | Bound-version server lookup and full-chain verification | Trusted result differs from saved/output snapshot. |
| Legacy mismatch is “fixed” destructively | Medium / high | Read-only classification; no backfill/repricing | Plan requires rewriting historical BOQs. |
| Duplicate leaves a partial or hybrid BOQ | Medium / critical | One atomic trusted operation, locked source snapshot, explicit column map, idempotency | Any failure leaves a destination fragment, or copied header/routes/items represent different source moments. |
| Normal Copy changes price or Factor provenance | Medium / critical | Preserve allow-list and exact source/destination parity tests | Destination uses another Catalog/item price/Factor binding or differs in official numeric output. |
| Selected-Factor Copy leaks old Factor snapshots or becomes general reprice | Medium / critical | Legacy-only eligibility, explicit active published version, clear all Factor-derived fields, block outputs until trusted save | Non-legacy source can use the action, old Factor-derived value survives, or any Catalog/item price changes. |
| User mistakes old prices for current prices | Medium / high | Confirmation and destination labels state preserved Catalog/prices; current prices use Create New | UI implies Duplicate refreshed prices or hides the bound Catalog version. |
| Formula parser executes unsafe input | Low / critical | Allow-listed parser; no dynamic code; strict bounds | Any use of `eval`, general scripting, or dynamic SQL. |
| Expression/result invariant bypassed | Medium / high | Server evaluator/recheck plus trigger or RPC-only writes | Direct permitted write can save disagreement. |
| Old/stale client silently erases formulas | High / critical | Compatible reader first; versioned save protocol; reject old payload before delete/reinsert | Any old/stale or rollback client can save an expression-bearing BOQ without preserving the tuple. |
| Parser-version drift changes a saved formula | Medium / critical | Version-addressed evaluator; shared frozen fixtures; unknown version read-only | A saved expression is interpreted with “latest” semantics or changes after reload. |
| Direct edit/stepper leaves a stale formula | Medium / high | Explicit atomic conversion to direct mode with visible notice and transition tests | Displayed formula no longer explains canonical quantity. |
| Expression leaks through read-only UI, outputs, or telemetry | Low / high | Editor-only expression view model; numeric-only read-only/Print/PDF/Excel models; no raw telemetry | Formula content appears anywhere outside the quantity editor or persisted DB-1 fields. |
| Migration/no-replay violation | Low / critical | New forward migration, checksum/preflight, explicit approval | Any proposal edits/retries/replays 027/028/029. |
| Mobile feature exists but is unreachable | High / medium | Responsive route/item redesign and 390 px UAT | Core quantity task cannot complete on agreed viewport. |
| Workflow slows operations | Medium / medium | Authority discovery, W-H or W1 only, SLA/queue, observe exceptions | Pilot cycle time breaches Owner threshold without quality gain. |
| Self-signup creates unmanaged identities | Medium / high | Invite/pre-provision; rate limits; disable open signup | Account exists without sponsor/ownership or pending cleanup SLA. |
| Stolen privileged session | Medium / critical | MFA/AAL2, time-box/inactivity, revoke on suspend | Admin/Approve works at AAL1 after policy date. |
| SSO becomes a blocking program | Medium / medium | Separate dependency gate and AUTH-B bridge | No IdP owner/test tenant/rollback but app release depends on SSO. |
| SSO creates a second identity and loses BOQ ownership continuity | Medium / critical | Account-link/migration, duplicate prevention, ownership mapping, rollback rehearsal | Existing profile/created_by/assigned_to lineage cannot be preserved. |
| Generic workflow engine overbuild | Medium / high | W1 first, evidence-based configuration | Configuration is being designed without real repeated cases. |
| Integration creates two truths | Medium / critical | Versioned package, field ownership, idempotency | Both systems can edit the same authoritative amount. |
| AI produces unjustified BOQ lines | Medium / critical | Defer; citations, human acceptance, audit | Suggestion can save/approve itself or lacks source basis. |

## 17. Success measures and release thresholds

Proposed measures require Owner confirmation and a baseline before using them
as targets.

### R0–R2 quality metrics

- `0` unknown-character inputs silently converted into a different number.
- `100%` agreement across UI, trusted save, reload, print view, controlled PDF
  fixture when defined, and Excel for approved fixture vectors.
- `0` new quantity/component/item/route/BOQ invariant discrepancies in the
  pilot cohort.
- `100%` invalid/tampered save requests fail atomically.
- `100%` accepted Duplicate requests create one complete draft and rejected/
  failed requests create none; retries return the same destination.
- `100%` normal copies preserve Catalog/price/Factor provenance and official
  values; `100%` selected-Factor copies retain Catalog/items/prices, clear old
  Factor-derived state, and remain output-blocked until trusted save.
- At least `90%` first-attempt completion for the defined mobile quantity task
  in moderated UAT, with no critical accessibility blocker.
- Median quantity-edit time improves without raising correction/revert rate.
- Raw or normalized expressions are not collected in analytics. DB-1 database
  persistence for reopen does not authorize telemetry collection; that would
  require a separate explicit retention/privacy decision.

### Auth/workflow metrics

- `100%` Admin/Approver privileged actions require the approved assurance
  level.
- `100%` suspended/deactivated accounts lose application access and session
  refresh within the approved SLA.
- `0` approved revisions changed in place.
- `100%` approval transitions have actor/time/reason/revision evidence.
- Approval cycle time, changes-requested rate, queue aging, and supersede rate
  are visible before W2 configurability is considered.

### Pilot rollback thresholds

Disable the feature flag and investigate if any of these occurs:

- one silent wrong committed quantity;
- one formula lost, changed, or reinterpreted after save/reload/reopen/copy;
- one stale/old client able to erase DB-1 metadata;
- one new persisted parity mismatch;
- one authorization or RLS regression;
- one partial Duplicate, duplicate destination from one request, or source
  mutation;
- one normal Copy that changes Catalog, item price, or Factor provenance;
- one Selected-Factor Copy offered to an ineligible/non-legacy BOQ, carrying old
  Factor-derived state, changing Catalog prices, or producing output before save;
- one print-view/controlled-PDF/export discrepancy on an approved vector;
- material task failure on the agreed mobile viewport; or
- support cannot explain/reproduce a parser result from versioned fixtures.

## 18. Explicitly out of scope / do not do

- Do not ship a browser-only parser while the trusted save layers disagree.
- Do not use `eval`, `new Function`, dynamic SQL, or silent character removal.
- Do not store formulas in remarks or change quantity from numeric to text.
- Do not invent/backfill formulas for existing BOQs.
- Do not auto-recompute, reprice, relink, or “clean up” historical BOQs.
- Do not restore the old multi-request client Duplicate.
- Do not let normal Copy change Catalog, item prices, Factor version, or Factor
  snapshots.
- Do not offer Selected-Factor Copy outside the approved eligible legacy class;
  do not retain old Factor-derived fields in that new draft or allow official
  output before trusted save.
- Do not add Catalog Requote/Reprice/Rebase, item remapping, or a mixed
  old-structure/current-price copy. Current Catalog prices require Create New.
- Do not edit, retry, or replay migrations 027/028/029.
- Do not bundle Quantity Expression with catalog Publish/Restore, Factor F,
  Master Catalog changes, API key rotation, SSO, or a generic workflow engine.
- Do not claim mobile support until the core task passes the agreed viewport and
  interaction test.
- Do not treat every `SECURITY DEFINER` function advisor warning as an automatic
  vulnerability; inventory intent, guards, owner, `search_path`, and ACL
  function by function.
- Do not start procurement/GIS/AI work before revision identity and calculation
  truth are reliable.
- Do not update README to promise speculative features. After Owner decisions,
  update README with the **current** product scope and link to the approved
  roadmap separately.

## 19. Owner decision sheet

The one-page source of truth is the [Owner decision dashboard](#21-owner-decision-dashboard).
No implementation begins until the relevant decisions are recorded and the
required authority is granted separately. The exception already recorded is
DUP-1: the Owner authorized its exact implementation and bounded Production
release on 2026-08-31; execution and postflight are complete in Result #04.
That authority is consumed and does not transfer to another roadmap item.

| ID | Decision | Options | Recommendation | Owner choice |
|---|---|---|---|---|
| D0 | Calculation authority | exact precision/rounding/Factor F/VAT/max/fixtures | normalize once and verify the full server chain | `TBD` |
| D1 | Quantity interaction | UI-0 / UI-1 / UI-2 / UI-3 | UI-2, preceded by UI-0 | `TBD` |
| D2 | Formula persistence | DB-0 result only / DB-1 expression + result / DB-2 structured measurement | DB-1 bounded normalized expression + parser version + canonical numeric result; formula visible only in quantity editor | `DB-1; Print/PDF/Excel numeric-only — selected 2026-08-31` |
| D3 | Pilot grammar | G1 multiplication / G2 basic arithmetic | G1 with `*` canonical and `x`/`X`/`×` input aliases | `G1; normalized reopen such as 5*2 — selected 2026-08-31` |
| D4 | Incomplete/zero by action | edit / draft save / preview / print-export / submit / approve | explicit incomplete draft only; block official output/submit/approve | `TBD` |
| D5a | Provisioning | self-signup / invite-pre-provision / IdP-managed | invite/pre-provision | `TBD` |
| D5b | Authenticator | password + MFA / SAML SSO | password + MFA now; SSO later | `TBD` |
| D5c | Privileged/session policy | AAL, lifetime, inactivity, concurrency, revocation | AAL2 inside trusted boundary plus explicit session SLA | `TBD` |
| D6 | Formal authority | W0 / W-H external / W1 in-app / W2 | discover current authority, then W-H or W1 | `TBD` |
| D7 | Mobile scope | desktop-only pilot / responsive pilot / responsive Production | explicit desktop-only pilot permitted; responsive before general claim | `TBD` |
| D8 | BOQ/project list scale | client pages / server numbered pages / cursor-load more / infinite scroll | `LIST-1B`: initial fixed 25-row server pages, safe URL state, whole-result search/filter/sort, batched routes | TBD — see [LIST-1](./02-boq-list-scaling-decision-plan.md) and [LIST-1 research](./03-boq-list-pagination-best-practice-research.md) |
| D9 | Whole-BOQ Duplicate | multi-request old copy / atomic preserve / eligible-legacy selected Factor / catalog requote-rebase | normal Atomic Preserve Copy plus separate Selected-Factor Copy only for eligible legacy BOQs; preserve old Catalog/items/prices; current prices use Create New; no catalog requote/rebase | `Released and verified 2026-08-31 — Result #04; authority consumed` |

Also confirm:

- business maximum quantity;
- final D0 quantity/rounding limits; D2/D3 already select normalized semantic
  display (`5x2`, `5X2`, and `5×2` reopen as canonical `5*2`), not exact raw
  keystroke/whitespace retention;
- whether Creator may approve their own BOQ and under what threshold;
- supported mobile viewport and whether offline entry is in scope (recommended:
  responsive online first; offline later only with a synchronization design);
- pilot cohort, support owner, success window, and rollback authority;
- identity/SSO owner, test tenant, licensing/budget, and break-glass owner; and
- audit retention period and who may view security/approval events.

## 20. Proposed approval wording

The Owner can record product direction without authorizing implementation using
wording such as:

```text
APPROVE PRODUCT DIRECTION — LEVEL A ONLY:
D0 = <approved calculation-contract reference>;
D1 = UI-2; D2 = DB-1;
D3 = G1 with * canonical, x/X/× accepted as input aliases,
and normalized reopen such as 5*2;
D2 display scope = formula only inside quantity editor;
read-only UI, Print/PDF, and Excel = canonical numeric quantity only;
D4 = <per-action zero/incomplete policy>;
D5a = AUTH-B; D5b = password+MFA then conditional SSO;
D5c = <approved AAL/session policy>;
D6 = authority discovery before choosing W-H or W1;
D7 = <desktop-only or responsive pilot scope>.
D8 = <LIST-1B or another recorded list decision>.
D9 = normal Atomic Preserve Copy plus a separate Selected-Factor Copy only
for eligible legacy BOQs; both preserve the source Catalog/items/prices;
current Catalog prices require Create New; no Catalog Requote/Reprice/Rebase.
This approval records direction and documentation only. It does not authorize
local code edits, commit, push, Preview, database design/application,
Production migration/deploy/write/flag, catalog operation, Factor F change, or
historical BOQ mutation.
```

D2 = DB-1 records the Owner's requirement that a formula survive
save/reload/reopen for use only inside the quantity editor. Read-only UI,
Print/PDF, and Excel remain numeric-only. It does not itself approve the
additional schema/RPC design gate or implementation. If measurement provenance
becomes contractual, stop and design DB-2/stable revisions first. Local
implementation later requires an exact Level B approval; source/Preview,
database design, and Production each require their own higher-level approvals
from Section 2.2.

D9 is different only because the Owner separately authorized and completed the
exact DUP-1 implementation and bounded Production release in the 2026-08-31
session; Result #04 is its execution receipt. That consumed instruction does
not turn this Level A wording into authority for another feature,
Catalog/Factor publication or pointer change, repricing/rebase/backfill,
source-BOQ mutation, or migration 027/028/029 replay.
