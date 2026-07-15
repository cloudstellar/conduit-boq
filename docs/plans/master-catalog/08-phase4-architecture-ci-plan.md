# Master Catalog Phase 4: Lean Architecture, CI and Official Export Plan

**Status:** Revision 8 remains the owner-approved Phase 4 Core direction;
WP-6.6 and WP-7 are complete, and the P-18/WP-7.5 extension passed P-32 Local
technical evidence and P-33 bounded technical acceptance. WP-8 placement
UX source/static hardening passed P-34 on exact `0780925`; P-35 integrated
unchanged `021` into bootstrap source; and P-36 integrated Local technical
rehearsal passed on exact execution checkout `910cc3c`. Independent intended-
admin interaction/recovery UAT and all Production gates remain separate, so
P-37 HOLD is recommended and Add/Supplement stays hidden

**Date:** 2026-06-22

**Reliability amendment:** 2026-07-11 — WP-6.5 now closes end-to-end
idempotency, publish-block UX, P-20 hash portability, ADR-003 reusable
versioning, live DB/concurrency evidence, tracked export verification,
operator failure states/logging, and documentation consistency before WP-7.
This is local planning only and does not authorize Production.

**P-18 planning amendment:** 2026-07-12 — owner review found that the current
Add/Supplement guard is safe but leaves an incomplete operator workflow. The
recommended plan inserts WP-7.5 for DB-backed placement of new identities after
the shared WP-6.6 operator/authority hardening and before WP-8. At that planning
checkpoint the exact P-18 contract remained pending in
[Review Note #28](./28-phase4-p18-placement-governance-review-note.md). P-30
later accepted it, and P-32 later authorized and completed the bounded Local
technical evidence; neither decision authorizes Production.

**P-34 WP-8 source/static amendment:** 2026-07-15 — exact checkpoint
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` implements the already-approved UX
contract without changing the V1 architecture: local assignment dirtiness is
separate from server acceptance, pending choices are recoverable and
revision-bound, exception states are explicit/filterable, native radios provide
keyboard semantics, one final summary exposes complete batch impact, and
derived list work is bounded/memoized. This is application/source evidence,
not permission to add `021` to bootstrap, reset Local, enable features, or
advance any Production gate.

**P-35 bootstrap source-integration amendment:** 2026-07-15 — exact gate
checkpoint `43b75e3f0b0643d6f4e741fcc81ea8b0a6311a13` authorizes adding the unchanged
amended `021` after `020` in the canonical Local bootstrap source, aligning
provenance/contracts, running repository checks, and committing/pushing the
result. This does not change the architecture or migration SQL and does not
authorize a Local reset/write, P-36 live evidence, P-37 acceptance, feature
enablement, publication, Factor F/hotfix expansion, or Production.

**P-36 integrated Local technical result:** 2026-07-15 — after the explicit
destructive-reset warning and owner approval, exact checkout
`910cc3cc74660beecf18655d39cd0b0c085d1fc6` clean-applied `009`-`015`, hotfix
`016`, and Phase 4 `017`-`021`. Integrated DB/RLS/concurrency/P-20/WP-7/WP-7.5,
export, advisor, repository, realistic-scale route-render, and cleanup evidence
passed. Browser automation could not dispatch React/Radix state changes, so
live client interaction, keyboard/recovery behavior, and independent intended-
admin comprehension remain release gates. This validates the architecture's
technical path without authorizing P-37 acceptance or Production. See
[P-36 Owner Review Note](./32-phase4-wp8-p36-owner-review-note.md).

**Capability-completeness amendment:** 2026-07-12 —
[Audit #29](./29-phase4-owner-dev-completeness-audit.md) corrects the earlier
overbroad completeness claim. The implemented safety core remains valid, but
full browse/history, exact draft selection, controlled dictionary/code
allocation, authoritative import diff/evidence, publication provenance and
readiness parity, correction actions, schema constraints, and Thai operator UX
must close in WP-6.6 before WP-7. This is a planning gate, not implementation or
Production approval.

**P-22 operator-workflow amendment:** 2026-07-12 — intended-admin review placed
WP-6.6 closeout on Hold and accepted
[Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md).
Phase 4 Core has at most one mutable draft per base, audited abandon with
read-only retained history, an item-first workspace, and an authoritative final
draft-versus-base snapshot review bound to publish `lock_version`. This remains
the existing one-publisher model, not a multi-stage approval engine. Candidate
`020` is amended before freeze; its old `3bfc74e` evidence is historical and
superseded for revised closeout. Source/static implementation passed on
`ac31feb`; G1 Local DB/concurrency/P-20 input then passed on final checkpoint
`e463270`; the pre-amendment operator/browser preflight passed on UI/source
checkpoint `c8f6dca` without changing migration `020`.

**P-23 operator-context amendment:** 2026-07-13 — keep global signed-in admin
identity/session context, use information-only Master Catalog navigation, bind
import to `/versions/{versionId}/import`, distinguish approved workbook input
from review-only exports, and keep the overall workspace iterative. This is a
route/presentation composition over existing Server Components, Server
Actions, read models, and RPC invariants. It does not add a client REST layer,
database migration, round-trip spreadsheet editor, or approval engine. At that
checkpoint G2 still had to independently clean-rebuild the later reviewed,
committed, named candidate. Final G2 has now satisfied that requirement; G3
owner closeout remains. No Production action is authorized by this checkpoint.

**P-23.1 version-intent/item-first amendment:** 2026-07-13 — draft creation
requires explicit annual/revision/patch business intent, an owner-designated
annual year, complete all-status registry planning, permanent number
reservation, and a guarded next-sequence check. A lower abandoned annual number
does not block the truthful year: the next patch-0 revision remains an annual
transition relative to the older-year base. Successful create opens the exact
workspace; items precede detailed document metadata; restore shows a
current-to-target confirmation. Candidate `020` changed, so at that amendment
checkpoint earlier G1 evidence became historical and separately approved
G1R/G2 clean rebuilds were required before G3. The later G1R/G2 results are
recorded below. No reset or Production action was authorized by this amendment.

**P-24 pre-G1R hardening:** 2026-07-13 — the exact candidate must also enforce
an annual effective-year horizon of base +1 through +10 at UI, Server Action,
and DB layers; map stale/range failures through a stable safe-code allowlist;
keep the focused Thai error visible while registry data refreshes; expose raw
codes/request IDs only in collapsed support details; and make first-rollout
authority copy conditional on the actual base version. Factor F is supporting
context, not a Master Catalog workflow metric. This amends still-unaccepted
candidate `020`, so G1R must use the post-P-24 fingerprint. It authorizes no
reset or Production action.

**G1R execution evidence:** 2026-07-13 — the owner separately authorized the
first clean rebuild. Final candidate `020` passed separate Local application,
DB/concurrency/P-20/advisor/repository/browser gates on exact execution checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd`, with migration SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The result confirms rather than changes the architecture: one guarded workspace,
reserved version lifecycle, item-first review, exact-draft import, audited
abandon, lock-bound publish, and pointer-only restore.

**G2 reproducibility evidence:** 2026-07-13 — the owner separately authorized
the second independent clean rebuild on the same exact execution checkout.
Bootstrap through `019`, separate `020`, WP-6.6/WP-6.5 evidence, P-20
comparison, repository gates, current advisor triage, and final Local invariant
readback passed. G3/G4, bootstrap inclusion, WP-7, and Production remain
separate approvals.

**G3 real-route technical evidence:** 2026-07-14 — the owner authorized a
bounded Local-only run without resetting Local Supabase. On source HEAD
`6599c30`, intended admin review held draft lock 1 while a second real-route
edit advanced lock 2. The stale publish was rejected with the approved Thai
recovery message and retained publication fields; no publish change set or
pointer movement occurred. Fresh review loaded lock 2, audited abandon closed
the proof at lock 3, and final pointer/BOQ/Factor F/schema invariants passed
with all catalog flags false. This confirms the architecture's reviewed-lock
contract; it does not infer owner acceptance, G4/bootstrap inclusion, WP-7,
WP-8, or Production authorization.

**G3 owner acceptance recorded:** 2026-07-14 23:50 +07 — after P-26 was
committed, the owner accepted the revised WP-6.6 operator closeout on exact
application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`.
This closes G3/WP-6.6 only. It does not authorize G4, bootstrap inclusion,
WP-7, P-18/`021`, P-19, WP-8, feature enablement, publication, Factor F or
hotfix expansion, or any Production action.

**P-26 human-intent amendment:** 2026-07-14 — high-impact actions add an
application-layer confirmation without moving database authority into the UI.
Recode and Retire show exact item/target/reason/impact summaries. Publish shows
current/target versions, reviewed lock, item count, BOQ effect, and requires the
target version typed by the admin. The Server Action reads the target
`version_string` from the database and rejects a mismatch before the publish
RPC; the RPC still owns role, lock, readiness, idempotency, hash, immutability,
and pointer invariants. This changes no migration and adds no approval role.

**P-28/G4 repository integration:** 2026-07-15 — accepted migration `020` is
now the last migration in the canonical Local bootstrap source, after hotfix
`016` and Phase 4 `017`-`019`. WP-7 gains a tracked Local-only regression
harness over the existing BOQ/Factor F boundaries. This changes no domain
architecture: source integration is complete, while destructive clean
execution and live evidence remain a separate gate. Production and the
P-18/P-19 decisions remain untouched.

**P-29/G4E execution evidence:** 2026-07-15 — the owner separately authorized
one destructive Local-only reset on exact pushed checkout
`15b707d443bec701f6b3a86aa7675ca1266604ba`. The integrated `009`-`020`
bootstrap and live WP-6.6/WP-6.5/P-20/WP-7 gates passed without changing the
architecture or migration `020`. Final pointer/flags/BOQ/Factor F invariants
were restored. WP-7 owner acceptance, WP-8, P-18/P-19, and Production remain
separate.

**P-30 WP-7/P-18 decision:** 2026-07-15 01:37 +07 — the owner accepted WP-7
and all five P-18 V1 rules. Bounded WP-7.5 Local-only source implementation is
authorized; `021` bootstrap inclusion, Local apply/reset evidence, WP-8, P-19,
Factor F/hotfix expansion, and Production remain separate.

**WP-7.5 source checkpoint:** 2026-07-15 — migration `021` and the exact
placement RPC/readiness/publish/read-model/Thai-workspace contracts passed
repository/static review at historical SHA-256 `78359215...`. P-32 live
execution then exposed fail-closed runtime error `42704`; schema-qualifying the
deferred constraint produces current fix candidate SHA-256
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`.
The architecture is unchanged: inherited order remains stable, new identities
are confirmed as one batch, DB authority remains final, and Add/Supplement stay
disabled until the later WP-8/P-14 UX/release gates pass.

**WP-7.5 P-32 Local evidence:** 2026-07-15 — a fresh canonical reset through
`020`, separate amended `021` apply, and tracked role/rollback/race/order/hash
harness passed on source checkpoint `80b2574`. Evidence JSON SHA-256 is
`875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`.
The 713-row candidate hash matched database, Excel, PDF, and the tracked
verifier. The Thai desktop/mobile operator path passed on UI checkpoint
`99fa56c`, including two-item same-anchor ordering, clear server-accepted state
without a redundant confirm action, 700 affected rows in final review, and
audited abandon. The later locally dirty-state contract remains a WP-8 gate.
Cleanup restored `2568.0.0`/710, zero working drafts, all three flags `false`,
BOQ 198/1,547,
and Factor F `2569.0.0`/36. P-33 accepted this technical exit evidence; that
decision does not add `021` to bootstrap, start WP-8, certify intended-admin
UX, or authorize Production.

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation for Phase 4 Core/local implementation. This approval does not
authorize Production migration, deploy, feature enablement, candidate data
freeze, or publication. Before any Production gate, the Verification Report
must document the rollback/fix-forward plan and prove RLS/grants, advisory
lock behavior, publish/import status transitions, export formula-safety, and
BOQ/Factor F regression gates.

**Scope:** Lean Master Catalog administration, item-level history, manual and
Excel change workflows, NT CI foundation, authoritative versioned exports,
local rehearsal, and Production rollout

---

### Revision 8 review note

Revision 8 keeps the Revision 7 architecture and product scope. It incorporates
the verified findings from the independent architecture review while rejecting
claims contradicted by the installed SDK, Production evidence, or the detailed
contracts:

- labels Phase 4 database/RPC invariants explicitly as target design rather than
  current Production behavior;
- defines duplicate treatment without merging stable identities or rewriting
  history;
- locks the legacy display-order source and new-item allocation rule;
- replaces undefined stale-draft reconciliation with recreate-and-reapply;
- defines a numeric Full-import mass-retirement safeguard and evidence rule;
- defers archive transition UI, defines the 12-hex short-hash display, and
  defines the import preview/status lifecycle;
- corrects the feature flag from “existing” to a new JSON-boolean row in the
  existing `app_settings` table;
- adds a lean typography/spacing/fallback baseline required for consistent CI.

These additions are control documents, not new subsystems. Phase 4 Core still
does not add online file storage, a workflow engine, background processing,
paid branches, or premature pagination.

## 1. Executive Decision

The Published Master Catalog stored in the database is the system of record.
After a version is published:

1. The immutable database version is the official catalog.
2. Excel and PDF generated by the system are official reference copies of that
   exact version.
3. The incoming Excel workbook kept in the physical filing system is supporting
   source evidence, not the system of record.
4. A draft is not official and must be visibly marked as draft in every view or
   export.
5. The current Production catalog is authoritative for the present item names,
   units, material costs, labor costs, and unit costs.
6. The candidate mapping workbook may propose codes and classifications, but it
   must not overwrite Production prices during the first structured-code
   rollout.
7. Manual changes and Excel changes follow the same draft, diff, audit,
   approval, and publish controls.
8. Item history follows stable UUID identity across versions and recodes; it is
   not limited to the current item code.

### Why this decision

- Users need one unambiguous source of truth after publication.
- Database versioning and immutability are more reliable for day-to-day use than
  repeatedly referring back to an input workbook.
- Reproducible exports let users cite, print, and share a version immediately.
- The physical workbook remains available when approval provenance or the
  original source document must be reviewed.
- Not storing the workbook online removes Supabase Storage, signed uploads,
  Storage RLS, retention jobs, and Storage backup procedures from Phase 4.
- Treating Production prices as the initial authority separates code cleanup
  from price approval and prevents a taxonomy workbook from silently repricing
  operational BOQs.
- Allowing audited manual edits avoids forcing an unnecessary full-workbook
  import for a single correction while preserving the same controls.

### Current verified state

- Production Phase 0 → 1A → 2 → 1B completed and was verified on 2026-06-21;
  current Phase 4 Local WP status is maintained only in the
  [Execution Progress Tracker](./25-phase4-execution-progress-tracker.md), while
  Phase 4 Production has not started
- Current default version: `2568.0.0`
- Catalog rows: 710
- Categories: 52, with no missing category
- Canonical JSON size for the current 710 rows: approximately 299 KB
- Unit-cost mismatches: 0
- Null required costs: 0
- BOQs are version-locked and cross-version catalog items are rejected
- Production currently has 710 distinct item codes, zero required-value gaps,
  and zero unit-cost mismatches
- Published catalog row immutability, stable item identity, normalized
  categories, import audit, and official catalog export are not deployed to
  Production. Their Phase 4 Local implementation/evidence status is owned by
  the Progress Tracker.

Read-only Supabase MCP recheck on 2026-06-22 confirmed the 710/710 row/code
count, one active/default version and singleton pointer, zero missing required
name/unit/cost values, zero unit-cost mismatch, and latest item update at
2026-05-31 18:15:26 ICT. Migration ledger contains the applied P0, Phase 1A,
and Phase 1B migrations recorded in the existing verification report.

The earlier Antigravity material remains an independent review input. This
repository document is the implementation authority.

### Candidate item-code workbook evidence

The candidate workbook
`files/NT_Item_Code_Master_K_Mapping_2568.xlsx` is useful as a proposed
business-code taxonomy and reconciliation input, but it is not yet an approved
import source.

Verified workbook facts:

- 708 catalog rows and 31 item fields
- 708 unique codes matching `AAA-TTT-###`
- 22 `AAA` groups and 62 workbook `AAA-TTT` groups; owner decisions P-03/P-04
  expand the implementation dictionary to 65 groups
- No missing required item, unit, or cost values
- Workbook `item_id` is only a row sequence: all 708 values change when the
  same items are sorted on the `02_Item_Master_By_Code` sheet

Read-only comparison with the current 710-row Production catalog found:

- 690 workbook rows match a Production row by normalized item name and unit
- 648 of those also match material, labor, and unit costs exactly
- 42 matching-name/unit rows have different costs
- 18 rows exist only in the workbook and 20 rows exist only in Production
- `ITEM-0131` and `ITEM-0139` are identical Production rows and require a
  duplicate decision
- 16 HDPE Crossing rows are coded `CRS-GIP-018` through `CRS-GIP-033` and are
  mapped to GIP formula `K(5.6)`, conflicting with their descriptions and the
  workbook's own HDPE rule `K(5.2.3)`
- workbook `FTW-CON-002` contains a repeated Thai phrase and is resolved by P-07
  as a typo shadow of Production `ITEM-0491`

`FINAL` inside the workbook is author-supplied workbook status; it does not
override the Production baseline or the reconciliation gate defined below.

For the first structured-code release, all 42 workbook/Production price
differences resolve to “preserve Production price.” Raw workbook evidence still
contains 18 workbook-only records, but P-07 resolves workbook `FTW-CON-002` as a
typo shadow, leaving 17 unresolved supplement candidates outside the published
catalog until separate item and price authority is approved. The Production-only
20 rows remain in the catalog and must receive approved canonical-code
decisions.

---

## 2. Lean Scope and Reasons

### Keep in Phase 4 Core

| Capability | Decision | Reason |
|---|---|---|
| Versioned catalog and singleton pointer | Keep | Already proven in Production and required for historical correctness |
| Immutable published rows | Keep | Prevents an official catalog changing silently after publication |
| Stable UUID item identity | Keep | A code can change across versions while the underlying item remains the same |
| Permanent item-code registry | Keep | Prevents a retired code from being reassigned to another item |
| Version lineage (`based_on_version_id`) | Keep | Prevents stale drafts and makes clone/diff ancestry explicit |
| Versioned categories | Keep | Preserves category name/order per catalog version |
| Structured-code classification | Keep | Stores AAA/TTT meaning explicitly instead of parsing business codes at runtime |
| Full and Supplement imports | Keep | Both workflows are required by the owner |
| Audited manual add/edit/retire/recode | Keep | A small correction must not require a replacement workbook |
| Item-level history timeline | Keep | Shows old/new values, actor, time, reason, source, and version |
| Change-set and row-level diff audit | Keep | Makes every published change explainable |
| Approval evidence and physical archive reference | Keep | Links the official database version to its business authorization |
| Dataset hash and item count | Keep | Makes Excel/PDF exports verifiable against the published version |
| Feature flag, local rehearsal, logical backup | Keep | Reduces Production rollout risk without another paid project |
| NT CI foundation for catalog UI/exports | Keep | Required product identity and document consistency |
| New-identity placement before publication | Keep; P-18 V1 accepted and WP-7.5 source/static passed, with Local live evidence still gated | Completes Add/Supplement without allowing arbitrary reorder of the inherited baseline |

### Simplify in Phase 4 Core

| Revision 2 design | Lean decision | Reason |
|---|---|---|
| Supabase Storage and signed upload | Remove | The source workbook is retained in the physical filing system |
| Four import/source/audit tables | Use three tables | Import metadata and source evidence belong in one import record |
| Private operational tables plus read RPCs | Public tables with admin-only RLS; private schema only for privileged functions | This is the standard Supabase pattern and removes unnecessary read wrappers |
| Generic parser selection and column mapper | One approved auto-detected parser profile in v1 | The current workflow does not justify building a spreadsheet-mapping product |
| Server pagination from day one | Load and filter the current catalog client-side | The current 710-row payload is small; pagination is added only after a measured threshold |
| Request ID and lock version on every operation | Apply them only to high-impact writes | A small number of admins does not need concurrency machinery on reads or harmless actions |
| Failed-file retention and cleanup | Do not upload raw files | There is no online failed object to retain or clean |

### Defer to Phase 4.2

- BOQ Rebase UI; retain stable identity now so it can be added safely later.
- Dropping legacy `is_default`, `price_list.category`, and the empty audit table.
- Additional parser profiles and free-form column mapping.
- Server pagination or virtualization until a version exceeds 2,000 rows or the
  measured catalog-read payload exceeds 1 MB.
- Cron, scheduled cleanup, or background jobs.
- CI migration of unrelated application screens.
- One-click destructive undo; a correction creates a new audited change set.
- K-formula publication until its ownership, approval, and versioning contract
  is approved separately.
- Export-event logging unless a later compliance requirement needs permanent
  download history.
- Arbitrary reordering of identities inherited from the base version; if later
  required, use a separate Change Request with hash/export/audit impact review.

### Why defer these items

None is required to import, review, publish, export, or use the next official
catalog. Deferring them shortens the first rollout and reduces regression risk.
The existing Preserve duplicate behavior remains available while Rebase is
developed later.

---

## 3. NT CI and UI/UX Direction

### Source priority

1. `CI/bannt_digit_man_1_2568.pdf` — NT digital brand manual, revision 1/2568
2. `CI/Brand_Guideline-Final-21-12-23.pdf` — corporate brand guideline
3. Fonts, logos, and graphic assets under `CI/`

The 1/2568 digital manual takes precedence if the sources conflict.

### Local CI asset policy

- Add `/CI/` to `.gitignore` before broad staging.
- Keep the complete CI folder local; do not move, delete, rename, or commit it.
- Assuming internal NT usage rights, commit only runtime copies required by the
  deployed application:
  - NT Regular and NT Bold converted to WOFF2
  - Official logo copies derived from the supplied assets
  - Only graphic elements used by the catalog UI or exports
- Do not redraw or alter the logo, Vital Sign, proportions, or approved colors.

### Design tokens

The NT colors, NT Regular/Bold faces, logo rules, and heading/content contrast
below come from the supplied CI sources. The numeric web type scale, spacing,
radius, shadow, fallback, and loading rules are a proposed application baseline
for consistency/accessibility; they are not presented as measurements mandated
by the CI PDFs and remain subject to owner visual acceptance.

| Role | Token |
|---|---|
| NT Yellow | `#FFD100` |
| NT Dark Gray | `#545859` |
| Logo Black | `#101820` |
| White | `#FFFFFF` |
| Supporting Teal | `#40C1AC` |
| Supporting Coral | `#E1523E` |
| Supporting Brown | `#924C2E` |

Rules:

- Use NT Regular for application/PDF body text and NT Bold for
  application/PDF headings/emphasis. Owner-approved P-11 refinement makes the
  editable Excel export the explicit exception: use `TH Sarabun New` with a
  16-point body baseline and larger title hierarchy for government-facing
  interoperability; keep the PDF on embedded NT runtime fonts.
- Load approved WOFF2 assets with `font-display: swap` and use a Thai-capable
  fallback stack: `system-ui`, `Leelawadee UI`, Tahoma, sans-serif.
- Apply `font-variant-numeric: tabular-nums` to prices, counts, hashes, and
  version metadata. Verify the approved NT runtime font actually supports the
  feature; a visual acceptance test must catch fallback or uneven alignment.
- Use the lean type scale: 14/20 for metadata and dense tables, 16/24 for body,
  22/30 for section headings, and 28/36 for page headings (24/32 on mobile).
- Use a 4 px spacing base with the approved set 4, 8, 12, 16, 24, and 32 px;
  controls use 8 px radius and content cards use 12 px radius.
- Use subtle neutral shadows only for interactive elevation; official
  Excel/PDF documents use borders/spacing rather than dashboard shadows.
- Implement brand and semantic tokens once through Tailwind CSS v4 `@theme`
  variables; Master Catalog components consume semantic roles rather than
  repeating raw brand hex values and spacing literals.
- Yellow controls use dark text.
- Data tables remain white/neutral; yellow provides identity and hierarchy.
- Use the official logo with the required clear space.
- Write `NT` uppercase in prose; lowercase `nt` is reserved for the logo.
- Apply CI to the shared shell, Master Catalog screens, and official exports in
  Phase 4 Core. Migrate unrelated screens later.
- Preserve existing Production labels and “แบบ ปร.1” unless explicitly changed.

#### Reason

These small tokens prevent every Phase 4 screen/export from inventing its own
spacing and typography while avoiding a full redesign of unrelated screens.
Fallbacks and `font-display` keep Thai content usable during font loading or an
asset failure; tabular-number support remains a verified capability, not an
assumption about the supplied font.

---

## 4. Data Architecture

### 4.0 Catalog data reconciliation gate

Complete reconciliation before schema backfill, draft import, or publication.
The current Production catalog is the authoritative baseline for item name,
unit, material cost, labor cost, and unit cost. The candidate workbook provides
proposed codes and classifications only unless a later price source has its own
explicit approval.

Required reconciliation artifact:

- One row for every current Production UUID and legacy `ITEM-####` code
- Candidate canonical `AAA-TTT-###` code and stable identity UUID
- Match method and confidence; exact matching may be automated, fuzzy matching
  may only suggest candidates
- Production and workbook name, unit, material cost, labor cost, and unit cost
- Identity outcome constrained to `retain`, `recode`, `candidate_add`,
  `retire`, or `reject_source_row`; Phase 4 Core has no identity-merge outcome
- Price outcome constrained to `preserve_production` or
  `apply_separately_approved_price`; the first structured-code release permits
  only `preserve_production`
- Decision reason, reviewer, and review date for every non-exact row
- Source row/reference and machine-verifiable reconciliation status

The first mechanical draft is now recorded in
[the Phase 4 reconciliation report](./11-phase4-reconciliation-report.md) and
[its 728-record CSV evidence](./evidence/phase4-reconciliation-draft.csv). It
covers all 710 Production rows plus 18 raw workbook-only records. P-07 resolves
one raw workbook record as the `ITEM-0491` typo shadow, leaving 17 unresolved
supplement candidates. The draft remains blocking until owner/reviewer
sign-off and publication gates are complete.

Blocking decisions:

1. Record all 42 price differences as `preserve_production`; they do not become
   price-change candidates in the first structured-code release.
2. Preserve the 18 raw workbook-only evidence rows; defer the 17 unresolved
   supplement candidates unless separate approved item and price evidence
   exists.
3. Retain all 20 Production-only rows and assign an approved canonical code or
   a documented temporary legacy-code decision.
4. Resolve the `ITEM-0131` / `ITEM-0139` duplicate without merging UUIDs or
   rewriting historical BOQs: either retain both as justified distinct items,
   or retire the erroneous row in the candidate version.
5. Correct or explicitly approve the taxonomy of the 16 HDPE Crossing rows;
   their unapproved K mapping remains excluded.
6. Apply P-07: retain Production `ITEM-0491` wording for canonical
   `FTW-CON-002`, reject the workbook repeated-phrase row as a typo shadow, and
   keep any whitespace-only Production cleanup outside `2568.1.0`.
7. Produce a final one-to-one legacy-code/canonical-code/identity mapping and
   confirm that no canonical code is reused.

Rules:

- Never use workbook `item_id` as a database identifier or join key.
- Never overwrite a Production name, unit, or price merely because the workbook
  differs.
- UUID remains the internal stable identity; `AAA-TTT-###` is a human-readable
  business code.
- Existing `ITEM-####` values remain registered as legacy codes pointing to the
  same identity and remain usable for historical traceability.
- After approval or publication, a canonical code is never renumbered, reused,
  or moved to another identity. Retired codes remain reserved.
- Store category/type fields explicitly. Do not depend only on parsing the code,
  because `TTT` is scoped by `AAA` and may represent material or work subtype.
- K-formula mapping is reviewed separately from item-code identity. The Phase 4
  Core import must exclude unapproved K mapping rather than infer it from the
  candidate code.
- Preserve the complete reconciliation artifact and its approval with the
  Phase 4-0 evidence set.
- Both duplicate rows receive distinct baseline identities because they coexist
  in published `2568.0.0`. If one is erroneous, the candidate records a
  `retire` change for that identity; the surviving row is not recorded as an
  `add`, `merge`, or `update` unless another approved field actually changes.

#### Reason

The code scheme is valuable, but the verified 708-versus-710 drift means a
direct import could silently remove Production items, introduce unapproved
prices, or attach the wrong K formula. A bounded reconciliation gate reuses the
existing identity/code-registry design and avoids building another subsystem.

### 4.1 Catalog version metadata

Add to `price_list_versions`:

- `based_on_version_id uuid null` self-reference with `ON DELETE RESTRICT`
- `effective_date date`
- `approval_reference text`
- `approval_document_date date`
- `published_at timestamptz`
- `published_by uuid`
- `published_by_display_name text` derived by the server from the authenticated
  actor profile, never accepted as caller-authored actor evidence
- `physical_archive_reference text`
- `dataset_hash text`
- `item_count integer`
- `lock_version integer not null default 0`

Version rules:

- `2568.0.0` remains the immutable legacy Production baseline.
- If `AAA-TTT-###` becomes the official business-code scheme, the first
  candidate is `2568.1.0`, cloned from all 710 Production rows with names,
  units, and prices unchanged.
- Every draft records the published version it was cloned from.
- Publish fails if the singleton pointer no longer equals
  `based_on_version_id`. Phase 4 Core has no draft-rebase operation: create a
  new draft from the new current version and deliberately reapply the still
  approved changes through new audited change sets. The stale draft remains a
  nonofficial read-only comparison artifact and can never be promoted.
- At most one mutable `draft` may exist per `based_on_version_id`; the database
  enforces this invariant. Version numbers remain globally unique.
- The UI opens the one current-base working draft explicitly. Stale and
  abandoned drafts remain visible read-only; it never silently targets another
  version for mutation/import.
- Starting over requires an audited `draft -> abandoned` action. It never
  deletes draft rows/audit or reuses `archived` published semantics.
- Every Phase 4-created publication has a bounded version-level physical archive
  reference even when no workbook import exists. The approved historical
  baseline is the only recorded exception.
- `active` means published. The singleton pointer separately identifies which
  published version is current for new BOQs.

#### Reason

Version lineage, approval, item count, and dataset hash are the minimum metadata
needed to prevent stale publication and to treat the database version and its
exports as official, reproducible documents.

### 4.2 Stable item identity and code registry

Add `catalog_item_identities`:

- `id uuid primary key`
- `created_at timestamptz`
- `created_by uuid`

Add `catalog_item_codes`:

- `item_code text primary key`
- `identity_id uuid not null`
- `code_kind text not null` constrained to `legacy` or `canonical`
- `first_seen_version_id uuid not null`
- `created_at timestamptz`
- `created_by uuid`
- `UNIQUE (item_code, identity_id)`

Add `price_list.identity_id`:

- Foreign key to `catalog_item_identities`
- `UNIQUE (version_id, identity_id)`
- Retain `UNIQUE (version_id, item_code)`
- Composite foreign key `(item_code, identity_id)` referencing
  `catalog_item_codes (item_code, identity_id)`

Add `price_list.display_order integer`. For legacy `2568.0.0`, derive it from
the numeric suffix of `ITEM-####` only after asserting that all 710 codes match
the format and suffixes are unique, then make it `NOT NULL`. Cloned rows retain
that value. A newly added item receives `max(display_order) + 1`; Phase 4 Core
does not add a reorder UI. Do not use physical database order or candidate
workbook row order. `display_order` is included in the canonical dataset hash
and official presentation contract.

This append-at-end rule is draft allocation only. P-18 V1 was accepted through
P-30, and amended WP-7.5 placement evidence passed the P-32 Local gate and P-33
technical acceptance. A version with new add/supplement identities must still
not publish until the later WP-8/P-14 UX/release gates. WP-6.5 implements a
publish guard that rejects draft rows whose
`identity_id` is absent from the base version with
`P18_PLACEMENT_REVIEW_REQUIRED`; Local guard/atomicity evidence has passed. The
WP-7.5 extension is defined in
[Review Note #28](./28-phase4-p18-placement-governance-review-note.md). Keep the
guard and do not expose Add/Supplement as a Production-capable workflow while
WP-8/P-14 remain open.

Backfill the current 710 rows one-to-one. A recoded item receives a new registry
row pointing to the same identity. A code can never move to another identity.
The approved reconciliation artifact, not workbook row order or workbook
`item_id`, controls which legacy and canonical codes point to each identity.

Registry rules:

- Registry rows are append-only after first publication.
- Legacy format is `^ITEM-[0-9]{4}$`; initial canonical format is
  `^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$`.
- Allocate the next unused sequence within an approved AAA-TTT group; do not
  fill retired gaps or renumber existing codes for presentation.
- When any group reaches sequence 900, require an owner-approved capacity
  decision before issuing more codes. A future four-digit format or new type
  group is introduced only in a new catalog revision; existing codes remain
  unchanged.
- The server allocator checks the current maximum sequence and returns a
  blocking capacity error at 900; no background alert or database scheduler is
  required.
- Do not store a mutable item description on the identity table; names belong
  to versioned `price_list` rows.
- Index `catalog_item_codes.identity_id` and `first_seen_version_id`.
- The `ITEM-0131` / `ITEM-0139` duplicate is initially backfilled as two
  historical identities unless the owner confirms one row was erroneous. Any
  later retirement is recorded in a new version; historical BOQ links are never
  rewritten.

#### Reason

The registry is one small table that prevents an irreversible lineage error.
This is lower cost than repairing ambiguous item history after a second catalog
has been published.

### 4.2.1 Owner-approved P-18 V1 placement authority

P-30 accepted the five choices in Review Note #28 on 2026-07-15 01:37 +07.
WP-7.5 adds a DB-backed placement revision and append-only placement review for
drafts containing identities absent from their base version. This is Local-only
source authority until the separate apply/reset and technical-closeout gates
pass.

The V1 invariant is intentionally narrow:

- only new identities may be inserted into a different presentation position;
- numeric positions of inherited rows may shift around an insertion, but after
  filtering new identities out, the relative order of all inherited base
  identities is unchanged;
- the admin selects the new item's category and a same-category before/after
  anchor and confirms all pending placements as one audited batch;
- `(version_id, display_order)` is unique and the complete draft order is a
  contiguous zero-based range;
- add or placement-relevant changes make the prior review stale;
- publish accepts new identities only when the current placement revision has a
  matching accepted review and all order invariants pass;
- general baseline reorder, code renumbering, and a multi-stage approval engine
  remain out of scope.

The approved V1 implementation appends migration `021`, after WP-6.6 migration
`020`, and adds a narrowly scoped
`catalog_placement_reviews` table, extends existing change-set/item actions for
placement, and adds one idempotent draft-only placement RPC. It introduces no
second catalog-equivalence hash: the existing canonical dataset hash remains
authoritative and already includes `display_order`.

### 4.3 Versioned categories

Add `price_list_categories`:

- `id uuid primary key`
- `version_id uuid not null`
- `code text not null`
- `name text not null`
- `display_order integer not null`
- `UNIQUE (version_id, code)`
- `UNIQUE (version_id, id)` for composite version-safe references

Add `price_list.category_id` and composite foreign key
`(version_id, category_id) -> price_list_categories (version_id, id)`.
Backfill the 52 categories by parsing the current prefixes such as `1.1`,
`10.2`, and `16`. Unparseable categories require manual confirmation.

Keep display category separate from structured-code taxonomy. Add
`catalog_code_groups`:

- `id uuid primary key`
- `version_id uuid not null`
- `work_context_code text not null` for `AAA`
- `item_type_code text not null` for `TTT`
- `work_context_name_th text not null`
- `work_context_name_en text`
- `item_type_name_th text not null`
- `item_type_name_en text`
- `display_order integer not null`
- `UNIQUE (version_id, work_context_code, item_type_code)`
- `UNIQUE (version_id, id)` for composite version-safe references

Both code segments are uppercase three-character alphanumeric values. Their
meaning is versioned by the group row; `TTT` is interpreted only within its
`AAA` context.

Add nullable `price_list.code_group_id` for compatibility. The legacy
`2568.0.0` rows may remain null until the approved reconciliation is applied;
every item in a newly published structured-code version must have a valid code
group except a recorded owner-approved temporary legacy-code exception. The
guard becomes applicable when a draft contains at least one active canonical
`AAA-TTT-NNN` code, so an unchanged legacy-only baseline clone remains a valid
positive control. For P-06, the only approved exception in the first candidate
is `ITEM-0139`; publish validation must assert that no other active legacy
`ITEM-####` row remains. The server validates that the explicit group matches
the approved canonical code but application pricing logic never parses the code
string. WP-6.5 implements this at the publish boundary alongside the P-18
new-identity guard so the exception cannot remain only a reviewer checklist;
live Local evidence remains required.
Use composite foreign key `(version_id, code_group_id) ->
catalog_code_groups (version_id, id)` so an item cannot reference another
version's taxonomy row.

BOQ items continue to snapshot category text. Keep the existing
`price_list.category` compatibility column during the first Production cycle
and populate it from the selected category in every write RPC.

#### Reason

The display category preserves current BOQ grouping while the code-group table
preserves the owner-approved 22/65 AAA-TTT dictionary. One small additional
table avoids
overloading category meaning or repeatedly parsing business codes, without
forcing a destructive application cutover.

### 4.4 Lean import and audit tables

Add `catalog_imports`:

- `id uuid primary key`
- `version_id uuid not null`
- `mode text` constrained to `full` or `supplement`
- `parser_profile_id text not null`
- `parser_profile_version text not null`
- `source_filename text not null`
- `source_file_size bigint not null`
- `source_file_sha256 text not null`
- `physical_archive_reference text not null`
- `retirement_approval_reference text null`, required only when a Full import
  reaches the mass-retirement threshold
- `normalized_payload_hash text not null`
- `status text` constrained to `validated`, `applied`, or `rejected`
- `error_summary jsonb`
- `request_id uuid unique`
- `created_by uuid not null`
- `created_at timestamptz`
- `applied_at timestamptz`

Import status lifecycle:

- browser parsing/diff before server submission is transient UI state and
  creates no `catalog_imports` row;
- successful server validation records `validated`; failed server validation
  records `rejected` with bounded diagnostics and no raw workbook/payload;
- apply uses a separate request ID, creates the import change set, and changes
  the same record once from `validated` to `applied`;
- there is no persistent `previewing` state because no background parser or
  resumable upload exists.

Add `catalog_change_sets`:

- `id uuid primary key`
- `version_id uuid not null`
- `import_id uuid`
- `change_type text` constrained to `clone`, `import`, `manual`, `abandon`,
  `publish`, or `restore`
- `reason text not null`
- `request_id uuid unique`
- `actor_id uuid not null`
- `actor_display_name text not null` as an immutable audit snapshot
- `before_lock_version integer`
- `after_lock_version integer`
- `created_at timestamptz`

Add `catalog_change_items`:

- `id uuid primary key`
- `change_set_id uuid not null`
- `identity_id uuid not null`
- `action text` constrained to `add`, `update`, `retire`, or `recode`
- `old_values jsonb`
- `new_values jsonb`

If P-18 is accepted, WP-7.5 extends the change-set type with `placement`, the
item action with `place`, and adds the append-only placement-review authority
defined in Section 4.2.1. Do not infer accepted placement from old/new JSON
alone.

Clone records one `clone` change set and no 710 artificial `add` change items:
unchanged cloned rows are connected by `based_on_version_id` and stable
`identity_id`. Item rows are appended only when a field actually changes. This
keeps history readable and prevents a clone from falsely appearing as 710 new
business items.

Audit snapshot contract:

- `old_values` and `new_values` store complete canonical row snapshots, not
  only changed fields. `old_values` is null for `add`; `new_values` is null for
  `retire`.
- Snapshot keys are fixed and include identity, item code, name, unit, material
  cost, labor cost, unit cost, category, code group, active state, and sort key.
- The UI computes field-level differences from the two full snapshots.
- Every manual change requires a nonblank reason. Import changes inherit the
  import reason/source and publish/restore records require an explicit reason.
- Item history is ordered by `catalog_change_sets.created_at` and follows
  `identity_id` across recodes.
- Audit rows are append-only; corrections create another change set.

Required indexes:

- Every new foreign key column
- `catalog_imports (version_id, created_at desc)`
- `catalog_change_sets (version_id, created_at desc)`
- `catalog_change_items (identity_id, change_set_id)`
- Category and code-group version/filter keys

All three tables live in `public` with RLS:

- Active admins can select.
- Anonymous and non-admin users see no rows.
- Direct insert/update/delete is revoked from application roles.
- Writes occur only through privileged functions in an unexposed private
  schema.
- Audit tables cannot be updated or deleted through normal application paths.

#### Reason

Three tables are sufficient to answer: what source was used, who changed what,
why it changed, what the exact row differences were, and how one logical item
evolved through time. A separate source table and private read API would add
complexity without adding useful control here.

### 4.5 Phase 4 target database invariants

The following are post-Phase 4A requirements, not claims about the current
Production schema. The verified baseline does not yet have general published
catalog-row immutability or the Phase 4 audit/function boundary; the additive
migration and tests must create them.

- Draft versions may change only through catalog functions.
- Manual add/update/retire/recode is permitted only on a draft and always
  creates a change set.
- Active and archived catalog rows are immutable.
- Published version metadata and dataset hash are immutable.
- The first structured-code draft clones all 710 Production rows and preserves
  Production names, units, and prices exactly before approved code/category
  changes are applied.
- Full import: omitted items become inactive in the draft.
- Supplement import: omitted items are unchanged.
- A future import may change prices only when the version has explicit approved
  price authority; otherwise server validation forces existing prices to remain.
- Previously published versions remain readable/exportable.
- Publishing atomically validates the draft, computes the authoritative hash,
  activates the version, and moves the singleton pointer.
- Publishing fails if the draft base is no longer the singleton default.
- Publishing does not archive the former version automatically. Phase 4 Core
  exposes no archive mutation UI/RPC: a former current version remains
  Published/Active, immutable, readable, and exportable. Existing archived
  versions remain readable/immutable. A new archive transition is deferred to
  Phase 4.2 or a separate owner-approved maintenance change after visibility
  and retention rules are defined.
- `price_list_default_version` remains the only source of the current default.
- While the legacy `price_list_versions.is_default` column remains, publish and
  pointer restore synchronize all legacy flags with the singleton pointer in
  the same transaction. Reads still treat the pointer as authoritative. Drop
  the mirror and `check_is_default_active` only in the reviewed Phase 4.2
  compatibility cleanup.
- Use `lock_version` for draft edit, import apply, and publish.
- Use `request_id` for manual changes, import preview/apply, publish, and pointer
  restore so a retry cannot create duplicate effects.
- The UI/form owns the operation `request_id`: create it before first submit,
  retain it while the result is uncertain, and reuse it for the same payload on
  retry. Generate a new ID only after a definitive terminal result or an
  explicit new operation. Server Actions must not create a fresh ID for every
  retryable invocation.
- An uncertain or rejected result keeps the submitted non-secret editable form
  values visible so the operator can verify or correct the same operation. The
  form resets only after definitive success; an uncertain retry must not depend
  on the operator reconstructing the prior payload from memory.
- Every newly published structured-code row has identity, category, and code
  group mappings.
- A draft with new identities remains unpublishable unless the P-18 extension is
  accepted and its current placement revision has an accepted DB review.
- Placement confirmation preserves inherited base relative order and validates
  unique contiguous `display_order`; no client-only reorder is authoritative.
- K-formula fields are not written by Phase 4 Core.
- External calls and file parsing occur before database transactions. Database
  transactions contain only validation, locking, writes, hash/count work, and
  audit append operations.
- Index all new foreign keys and version/category filters.
- Do not add `pg_trgm` in Phase 4 Core.
- Do not partition these tables at the current scale; revisit only after
  measured growth and query-plan evidence.

Relational and migration rules:

- Use `gen_random_uuid()` consistently with the existing schema; do not add a
  UUID extension solely for this small workload.
- Required timestamps are `not null default now()` and stored as `timestamptz`.
- Catalog/version/source foreign keys use `ON DELETE RESTRICT`; official history
  is retired or archived, not physically deleted.
- User accounts referenced by official audit are deactivated rather than hard
  deleted; immutable display-name snapshots preserve readable history.
- Required text fields reject blank-after-trim values and have bounded input
  lengths at the server validation layer.
- Costs are nonnegative numeric values and unit cost must equal material plus
  labor cost.
- Add every constraint with an idempotent catalog check; PostgreSQL does not
  support `ADD CONSTRAINT IF NOT EXISTS`.
- Add large-table checks/foreign keys as `NOT VALID` where supported, verify the
  preflight, then `VALIDATE CONSTRAINT`.
- Migration transactions use bounded `lock_timeout` and `statement_timeout`;
  concurrent indexes are separate nontransactional migration steps when needed.
- Private create/apply/publish/restore functions independently set bounded
  runtime lock/statement timeouts (`5s`/`30s` in the Local implementation);
  migration-time settings do not govern later Data API calls.
- New `public` tables receive explicit least-privilege Data API grants in the
  migration in addition to RLS. Do not rely on automatic default grants; the
  Supabase 2026 rollout makes new-table exposure an explicit project setting.

Unit-cost gate:

```sql
SELECT count(*) AS unit_cost_mismatch_rows
FROM public.price_list
WHERE unit_cost IS DISTINCT FROM (material_cost + labor_cost);
```

Add `CHECK (unit_cost = material_cost + labor_cost) NOT VALID`, then run
`VALIDATE CONSTRAINT`. The latest Production check returned zero mismatches.

---

## 5. Import Workflow Without File Upload

### 5.0 Initial structured-code rollout

The first rollout does not import workbook prices:

1. Choose **ปรับปรุง/เพิ่มเติม** from current default `2568.0.0`; the expected
   candidate is `2568.1.0` only when that number remains unreserved.
2. Clone all 710 Production rows and assign stable identities.
3. Verify names, units, material costs, labor costs, and unit costs are byte-for-
   byte/numerically equal to the Production baseline.
4. Apply only the approved legacy-code/canonical-code/category/code-group
   reconciliation.
5. Keep the 17 unresolved supplement candidates outside the draft unless
   separate approved evidence authorizes them; keep the raw workbook
   `FTW-CON-002` record as P-07 typo-shadow evidence, not an imported item.
6. Keep the 20 Production-only rows and resolve their canonical codes.
7. Review the complete recode/classification diff before approval and publish.

Freeze the approved first-rollout reconciliation into reviewed seed/import
authority before runtime. The application must not read a file named
`*draft.csv` under `docs/` as mutable business authority; that file remains
review evidence. Later Supplement/Full imports reconcile against the exact
selected draft plus approved versioned category/code-group rows.

Any unexpected name, unit, or price difference blocks this initial rollout.

#### Reason

Cloning Production first makes code modernization independent from repricing.
It preserves the currently trusted operational data and sharply reduces the
first release's risk.

### 5.1 Browser-side source handling

1. The admin selects the Excel workbook from the local computer.
2. ExcelJS is dynamically loaded only on the import screen.
3. The browser reads the workbook locally; raw workbook bytes are not uploaded.
4. Web Crypto calculates SHA-256 for the source workbook.
5. The admin enters the physical archive reference.
6. The approved parser converts the sheet to normalized catalog rows.
7. Only normalized JSON and source metadata are sent to the server.

V1 limits:

- Local workbook size: maximum 20 MB
- Normalized rows: maximum 1,500
- Serialized normalized payload: maximum 750 KB

The verified current 710-row catalog is approximately 299 KB as normalized
JSON. Before implementation, set and test the application payload limit
explicitly; keep the normalized-payload ceiling at least 25% below that limit
to allow serialization and action metadata overhead.

#### Reason

This preserves a simple web workflow without storing the source workbook
online. The server still receives enough structured data to validate every row,
calculate the diff, and build the official catalog.

### 5.2 Trust boundary

- The browser-calculated `source_file_sha256` fingerprints the physical source
  workbook and is recorded with the acting admin.
- It is supporting evidence because the server never receives the raw workbook
  and therefore cannot independently verify its bytes, size, or SHA-256.
- Before publication, a verifier recomputes SHA-256 from the filed physical
  source and compares it with the recorded fingerprint when an import was used.
- The server treats all normalized rows as untrusted input and validates every
  field, price, code, identity, category, and row count.
- Runtime reconciliation uses the exact selected draft and reviewed
  implementation/database mapping authority, not the draft evidence CSV.
- The server calculates `normalized_payload_hash` from canonical validated
  rows.
- At publish, the server reads the completed draft from the database and
  calculates the authoritative `dataset_hash`.

#### Reason

Separating the client-computed source-file fingerprint from the authoritative
dataset hash makes the evidence model honest: physical filing, approval, and an
independent recheck support provenance, while the immutable server-computed
database hash proves what the system officially published.

### 5.3 Parser scope

- Support one approved auto-detected parser profile in Phase 4 Core.
- The profile is declarative and versioned under
  `lib/master-catalog/import/parser-profiles/` with ID
  `nt-item-master-2568`, version `1`.
- Detection requires `.xlsx`, exact sheet `01_Item_Master_Final`, unique row-1
  required headers, and at least one candidate data row. There is no fallback
  or near-match column mapper.
- Full/Supplement changes import semantics, not workbook mapping.
- If the workbook does not match the approved profile, stop and show precise
  row/column errors.
- Do not build a generic column-mapping UI in Phase 4 Core.
- Enforce raw file ≤ 20 MB, parsed rows ≤ 1,500, and normalized UTF-8 payload
  ≤ 750 KB on both applicable sides. Do not raise Next.js's default Server
  Action body limit; the application cap stays below its current 1 MB default.
- Follow the exact interface, required headers, excluded K fields, decimal
  representation, and diagnostics in the
  [parser/hash specification](./14-phase4-parser-and-canonical-hash-spec.md).

### 5.4 Validation and diff

Mark server preview invalid and prevent apply for:

- Missing required values or wrong types
- Null or negative costs
- Unit-cost mismatch
- Duplicate item code or identity in one version
- Reuse of an item code for a different identity
- Invalid or unmapped category
- Recoded item without an explicit identity mapping
- Payload over the row or byte limit
- Initial structured-code rollout containing any name, unit, or price change
- Price changes without explicit approved price authority
- K-formula fields in the Phase 4 Core payload

Full-import retirement safeguard:

- every omitted active item is shown as a retirement warning and exact row diff;
- mass retirement means `retire_count >= max(10,
  ceil(active_base_item_count * 0.02))`; for the verified 710-row baseline the
  threshold is 15 rows;
- reaching the threshold blocks apply until the admin types the retirement
  count and supplies a real owner approval reference; store that reference on
  the import record and show it again at publish;
- the final publish approval must explicitly cover the retirement total;
- Supplement mode never treats omissions as retirement.

#### Reason

Any retirement deserves visibility, but blocking one deliberate correction
would make Full import needlessly cumbersome. The greater-of-10-or-2% rule
detects a likely wrong sheet/profile at the current scale without building a
workflow engine; explicit approval makes a legitimate bulk retirement
traceable.

Do not fuzzy-match identities automatically. An unmatched row must be confirmed
as a new identity or mapped explicitly.

Import steps:

1. Select Full/Supplement, source workbook, physical archive reference, and
   whether prices must be preserved or come from a separately approved source.
2. Parse locally and validate on the server.
3. Review add/update/retire/recode and price diff separately; price changes are
   never hidden inside a general update count.
4. Apply the accepted change set to the draft.

Invalid input creates no uploaded file and no cleanup obligation.

### 5.5 Manual edit workflow without Excel

An active admin may change a draft through item forms without selecting a
workbook:

1. Open the one current-base working draft or clone Current when none exists.
2. Choose add, edit, retire, or recode.
3. Enter the proposed values and a mandatory reason.
4. For price changes, show old/new material, labor, and unit costs together and
   require the approval reference before publish.
5. Submit expected `lock_version` and a unique `request_id`.
6. The server validates authorization, feature flag, draft status, identity,
   code registry, category, code group, nonnegative costs, and unit-cost sum.
7. One private database function locks the draft and desired canonical codes,
   validates the complete payload before writing, then applies the change inside
   a subtransaction. A mutation-time structured rejection rolls back the whole
   change set before returning a safe error; success increments `lock_version`
   and appends full-snapshot audit rows atomically.
8. Return the saved row and refreshed diff summary.

Manual-only drafts do not require a source filename, workbook hash, or physical
archive reference. They still require real approval evidence before publish.

Published, archived, stale, or abandoned rows never expose edit controls.
Correcting a published item means cloning a new draft and recording a new
change set; history is not rewritten.

### 5.6 Item history contract

For each `identity_id`, the system shows a chronological timeline containing:

- Version and action: add, update, retire, or recode
- Item code before and after the change
- Field-level old/new values
- Actor, timestamp, and reason
- Source type: clone, manual, import, abandon, publish, or restore
- Import filename/hash/archive reference when applicable
- Approval reference of the published version

History remains available when the current code changes. The history screen is
read-only. A future “reuse previous values” helper may prepare a new draft edit,
but it must never delete or mutate audit history.

---

## 6. Publish and Official Version Exports

### 6.1 Publish contract

Publish requires:

- Draft has no blocking validation errors.
- `based_on_version_id` still equals the singleton default pointer.
- Approval reference and approval document date are present.
- If the draft includes an import, each applied import has source filename,
  source hash, and physical archive reference.
- A manual-only draft may publish without workbook metadata; its manual change
  sets and approval evidence are the source record.
- Typed version-string confirmation matches the target version read from the
  database by the Server Action immediately before it can call the publish RPC.
- Expected lock version matches.
- The admin has reviewed the complete final database snapshot diff against the
  exact base at that same lock version. A later mutation requires a fresh
  review; no separate approval table is introduced in V1.
- At least one applied import/change set exists.
- Item count is greater than zero.
- Every active row has identity/category mapping and, for structured-code
  versions, a valid code-group mapping.
- The initial structured-code draft has no name, unit, or price differences
  from its Production base. Any separate correction belongs in a later draft or
  separately approved version scope.

The typed value is a human-intent guard, not a database integrity substitute.
The UI may disable the final button early, but server-side comparison is
mandatory and a mismatch must produce a stable safe error without calling the
publish RPC. Final database checks remain authoritative even after the text
matches.

Within one transaction:

1. Authenticate/authorize and acquire the transaction-scoped publish lock.
2. Lock the draft version.
3. Lock and verify the singleton pointer still matches the draft base.
4. Recheck request idempotency, expected lock version, catalog invariants, and
   approval requirements.
5. Reject P-18 add/supplement publication if any target draft `identity_id` is
   absent from the base version rows.
6. When the draft contains at least one active canonical `AAA-TTT-NNN` row,
   reject incomplete structured-code publication if active legacy `ITEM-####`
   rows exceed the recorded `ITEM-0139` exception. Do not activate this rollout
   guard for an unchanged legacy-only clone.
7. Read active items in deterministic order.
8. Build canonical dataset JSON using fixed keys and numeric formatting.
9. Compute SHA-256 `dataset_hash` and `item_count`.
10. Set publish metadata and status.
11. Move the singleton pointer and synchronize legacy `is_default` flags.
12. Append the publish change set.

#### Reason

The transaction guarantees that the stamped exports describe the exact dataset
made current. No row can change between hash calculation and pointer promotion.
No network, filesystem, or workbook parsing occurs while database locks are
held.

### 6.1.1 Canonical dataset hash contract

The canonical row uses this exact fixed key order:

1. `identity_id`
2. `item_code`
3. `item_name`
4. `unit`
5. `material_cost`
6. `labor_cost`
7. `unit_cost`
8. `category_code`
9. `category_name`
10. `work_context_code`
11. `work_context_name_th`
12. `item_type_code`
13. `item_type_name_th`
14. `is_active`
15. `display_order`

Normalize text to Unicode NFC, preserve meaningful internal spaces, represent
money as fixed two-decimal strings, and represent every optional absence as
JSON `null` without omitting its key. Sort by normalized `item_code` using a
byte-stable comparison, then `identity_id` as the final tie-breaker. Serialize
compact UTF-8 JSON with exactly one trailing LF and no BOM, then compute
SHA-256. The hash is stored as `sha256:<lowercase hex>`.

The shared canonicalizer is used for publish and Excel/PDF verification.
The stable logical `identity_id` above is intentionally included. Version-row
UUIDs such as `price_list.id`, timestamps, actor names, and export metadata are
excluded. The complete contract and mandatory golden hash are in the
[parser/hash specification](./14-phase4-parser-and-canonical-hash-spec.md).

### 6.1.2 Cross-environment identity/hash portability gate

P-20 was approved on 2026-07-11. Migration `017` initializes each legacy
baseline stable identity directly from the immutable Production-derived
`price_list.id` and keeps identity in the lineage hash. It fails closed when
the input is not the non-empty `2568.0.0` baseline, a baseline identity was
already assigned differently, a target UUID collides, or post-backfill
coverage differs from the approved one-to-one mapping. Cloned version rows
reuse that identity and do not derive identity from their own row UUID.

Implementation and independent clean-rebuild proof must close before WP-6.5
exits/WP-7 starts, WP-8, and migration fingerprint freeze. Do not add a dual
hash in Phase 4, silently remove `identity_id`, or describe environment-specific
hashes as equivalent.

### 6.2 Official stamp

Every official export identifies the selected Catalog version, status,
effective date, item count, and full dataset SHA-256. Excel carries the complete
approval/publication/export/filing metadata and canonical verification fields
defined in the Official Export Specification.

The P-11 field-facing PDF intentionally uses a smaller human-facing set: NT
organization/lockup, document title/year, `ฉบับบัญชีราคา`, Thai status,
effective date, item count, full dataset hash, and page numbers. It does not
show technical Current Default, approval reference/date, approved-by/publisher,
exported-at/by, generated-by, or export-spec fields. A selected non-current
published version carries the approved plain Thai retrospective-reference
warning. Those excluded values remain in Excel/admin/release/filing evidence.

Draft exports:

- Admin only
- Prominent “DRAFT – ห้ามใช้อ้างอิง” mark
- Never labeled Published

Published exports:

- Available to authenticated users allowed to view the catalog
- Generated from the selected version, never implicitly from unsaved client
  state
- Older published versions remain exportable

Suggested filenames:

```text
NT-Master-Catalog-v2568.1.0-20260622.xlsx
NT-Master-Catalog-v2568.1.0-20260622.pdf
```

### 6.3 Excel export

Use an authenticated Route Handler that queries the selected version and
generates Excel server-side with ExcelJS.

Workbook:

- Sheet `ข้อมูลเอกสาร`: complete official stamp and full dataset hash
- Sheet `รายการราคา`: ordered category/item table with repeated headers,
  frozen header row, filters, print area, and version footer
- Sheet `พจนานุกรมรหัส`: approved AAA/TTT dictionary for the selected version
- Sheet `สรุปการเปลี่ยนแปลง`: version-scoped human-readable change summary
- Sheet `ข้อมูลตรวจสอบ`: canonical machine-readable fields required to
  independently reconstruct the dataset hash
- Numeric cells remain numeric with consistent two-decimal formatting
- The export rechecks row count and hash before returning the file

Exact sheet order, columns, formulas/security rules, CI, print settings, and
acceptance fixtures are defined in the
[Official Export Specification](./20-phase4-official-export-spec.md).

#### Reason

A server-generated workbook cannot accidentally export stale or modified client
state and is suitable for immediate operational reference.

### 6.4 PDF export

Reuse the existing BOQ print approach:

- Dedicated server-rendered catalog print route
- Fetch selected version and items again from the database
- A4 print CSS with repeated table headers
- Department, selected-version/status or version/effective-date context, and
  page number in the field-facing footer; no truncated dataset hash in footer
- “พิมพ์ / บันทึก PDF” action
- Full dataset hash on the cover/summary and in filing evidence

A 12-hex prefix may appear in admin/audit UI as a human cross-check only (48
displayed bits); official document verification always uses the full 64-hex
dataset hash.

#### Reason

The existing print-to-PDF pattern avoids introducing a heavy PDF-generation
service while still producing a version-stamped reference document.

### 6.5 Export verification

- Exported row count must equal `price_list_versions.item_count`.
- Recomputed export dataset hash must equal
  `price_list_versions.dataset_hash`.
- Export fails closed if either comparison differs.
- Artifact verification code is committed under `scripts/` or the test suite and
  runs from a clean checkout. It locates sheets/headers semantically, derives
  data ranges, and verifies schema version, count/order/hash, numeric cell types,
  formula/link absence, PDF count/hash/page structure, and binary file hashes.
  Fixed row coordinates and untracked temp scripts are not release evidence.
- Do not add an export-log table in Phase 4 Core; exporter and export timestamp
  are retained in Excel/admin/release/filing evidence at generation time, not
  printed on the field-facing PDF cover.

---

## 7. Security and Application Interfaces

### 7.1 RPC boundary

This is the Phase 4 target boundary. The verified Production baseline currently
has legacy privileged functions in `public` and no `private` schema. Phase 4
creates the private boundary only for its new catalog functions; it does not
refactor unrelated legacy functions in the same rollout.

- Public wrappers use `SECURITY INVOKER`.
- Privileged transactional functions live in an unexposed private schema.
- Definer functions use `search_path = ''`, fully qualified relations, and
  repeat the active-admin check.
- Revoke schema/function access from `PUBLIC` and `anon`; grant
  `authenticated` only the minimum schema usage and exact private-function
  execution needed by public wrappers.
- The private schema is not listed in Supabase Data API exposed schemas.
- Revoke direct catalog/audit writes from application roles.
- Enable RLS on every new public table.
- Use explicit table/function grants in the same migration as RLS policies.
- RLS policies use `(select auth.uid())` for stable request values and indexed
  lookups for profile/ownership checks.
- Add a new `catalog_admin_enabled` row to the existing `app_settings` table and
  seed `value` as `'false'::jsonb`, which is JSON boolean false. Do not seed
  `'"false"'::jsonb`, which would be a JSON string.
- The flag hides/disables rollout functionality but never replaces role checks.
- Never expose a service-role or secret key to browser code.

### 7.2 Lean Server Actions

Reuse the existing cookie-aware server client in `lib/supabase/server.ts` and
browser client in `lib/supabase/client.ts`; do not introduce parallel Supabase
client factories. Generate reviewed database types at
`lib/types/database.generated.ts` and type both clients before building the
Phase 4 UI.

- `createCatalogDraftAction`
- `abandonCatalogDraftAction`
- `previewCatalogImportAction`
- `applyCatalogImportAction`
- `saveDraftCatalogItemAction`
- `retireDraftCatalogItemAction`
- `recodeDraftCatalogItemAction`
- `reactivateDraftCatalogItemAction`
- `withdrawDraftCatalogItemAction` for a never-published identity absent from
  the draft base
- `publishCatalogVersionAction`
- `restoreCatalogPointerAction`
- Proposed after P-18: `placeDraftCatalogItemsAction`

Every exported action:

1. Verifies server identity through `supabase.auth.getClaims()`, which is
   supported by the installed SDK and verifies the JWT using JWKS or an Auth
   server round trip depending on signing configuration. Use `getUser()` only
   when a fresh Auth user record is required. Never authorize from the user
   object returned by `getSession()`.
2. Loads the current database profile.
3. Requires active admin status.
4. Checks the catalog feature flag where applicable.
5. Validates every argument and returns a serializable result.
6. Reveals no SQL or internal error details.
7. Revalidates affected catalog routes after a successful mutation.
8. Accepts the client-owned operation ID for retryable mutations and passes it
   unchanged to the database; it does not replace it with a new server UUID.

Every action returns the discriminated, serializable
`CatalogActionResult<T>` contract and stable error codes defined in the
[parser/hash specification](./14-phase4-parser-and-canonical-hash-spec.md).
Expected validation/authorization conflicts are returned without SQL, stack,
or secret details; unexpected technical context is logged server-side against
the request ID.

Every mutation/export failure log uses a bounded structured event with operation,
outcome, duration, selected version ID/string when known, and request ID. Never
log raw normalized payloads, workbook cells, cookies, keys, SQL, or approval
document content. User-facing Thai messages include a safe technical code and
copyable request ID where support correlation is useful.

Manual edits use the same change-set/audit path as imports and require a reason.

Catalog reads, version details, and item history are loaded directly in Server
Components. Do not use Server Actions as GET endpoints.

### 7.3 Export interfaces

- Authenticated Excel Route Handler:
  `/api/master-catalog/export/excel/[versionId]`
- Server-rendered print route:
  `/admin/master-catalog/versions/[versionId]/print`

Published exports follow normal catalog read permission. Draft exports require
active admin authorization.

### 7.4 Next.js execution boundaries

- Server Components perform authenticated catalog reads and pass only plain,
  serializable data to Client Components.
- Server Actions are used only for UI-triggered mutations.
- The Excel download uses a Route Handler because it returns a binary HTTP
  response.
- Excel export runs in the default Node.js runtime; do not opt into Edge runtime
  because ExcelJS and file generation need Node-compatible APIs.
- Browser-side Excel parsing is isolated to the import Client Component and
  dynamically imports ExcelJS only after file selection.
- NT fonts are loaded once through `next/font/local` from approved WOFF2 runtime
  assets.
- Add route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` where catalog
  reads or exports can fail.
- Server Action results are discriminated, serializable success/error objects;
  navigation helpers are not swallowed by broad `try/catch` blocks.
- Version/item reads that are independent run in parallel; avoid sequential data
  waterfalls.
- Phase 4 server authorization never trusts Client Component session state.
  Client `getSession()` may support UI state, but Server Actions independently
  verify server identity/profile and database authorization.

### 7.5 Role capability matrix

| Capability | Authenticated staff | Active admin |
|---|---:|---:|
| View current/published catalog | Yes | Yes |
| Export published Excel/PDF | Yes | Yes |
| View draft or draft export | No | Yes |
| View detailed audit/item history | No | Yes |
| Clone/create draft | No | Yes |
| Manual add/edit/retire/recode | No | Yes |
| Preview/apply import | No | Yes |
| Publish or restore pointer | No | Yes |

The feature flag may hide admin capabilities during rollout but does not change
this authorization matrix.

---

## 8. UI Information Architecture

### Routes

`/admin/master-catalog`

- Current default version
- Draft, published, and archived versions
- Item count, effective date, approval reference, and dataset hash
- Download Excel and print/save PDF actions

`/admin/master-catalog/versions`

- Version list with status, effective date, approval reference, item count,
  current-default indicator, and dataset hash
- Draft clone and restore entry points when allowed

`/admin/master-catalog/versions/[versionId]`

- Overview
- Items
- Import & Diff
- Audit

`/admin/master-catalog/versions/[versionId]/items/[identityId]`

- Versioned item details and current code
- Manual draft edit/add/retire/recode controls when allowed
- Item history timeline across all versions and codes
- Old/new field comparison, actor, time, reason, and source evidence

Proposed after P-18 acceptance:
`/admin/master-catalog/versions/[versionId]/placement`

- Pending new identities only
- Category and searchable same-category before/after anchor controls
- Batch neighborhood/order preview and one audited confirmation
- No arbitrary inherited-row reorder and no drag-only interaction

`/admin/master-catalog/import`

- Import staging and validation for a selected draft
- Diff preview and mass-retirement safeguard evidence

`/admin/master-catalog/history`

- Published version history, pointer movement evidence, and append-only audit
- Official export lookup by version

### Table behavior

- Load and filter the current 710-row version client-side.
- Fetch the complete selected-version dataset through deterministic paged reads
  before client filtering so a PostgREST/API max-row setting cannot silently
  truncate it. This is a data-integrity read pattern, not user-visible server
  pagination.
- Search item code/name and filter category/status/change type.
- Filter by legacy/canonical code, work context, and item type.
- Use sticky headers and tabular numeric alignment.
- Add server pagination only when a measured version exceeds 2,000 rows or a
  read payload exceeds 1 MB.

### Draft planning and workspace UX

- Require one business intent: annual, revision, or patch. Annual additionally
  requires the owner-designated effective BE year.
- Load the complete all-status registry or fail closed; show the planned number
  and any lower reserved identifiers before creation.
- Do not expose raw major/minor/patch segments as the primary operator control.
- The guarded DB path owns current-base, next-sequence, concurrency, and replay
  checks; a stale proposal returns `VERSION_SEQUENCE_STALE` and creates nothing.
- Open the exact new draft after success. Keep compact version/actions/counts
  first, then the full item workspace, followed by document metadata, recovery,
  history, and abandon.

### Import UX

- Four explicit steps matching the workflow in Section 5.
- Errors identify source row, field, value, and correction.
- No generic column mapper.
- Publish remains separate from import.
- The admin explicitly selects the exact current-base draft before parsing.
- Server validation returns the complete add/update/recode/retire/unchanged
  diff plus exact Full-import omission identities/count; the UI does not infer
  this result from client-only parsing.
- New-row price authority is a supported bounded input. Use one import-level
  reference when it applies to the batch and explicit per-row override only
  when the evidence actually differs.
- Show price changes in a dedicated high-visibility section; never mix them into
  a generic “updated rows” total.
- Initial structured-code import displays “Production prices will be preserved”
  and blocks any unexpected price difference.

### Manual edit UX

- Draft-only “เพิ่มรายการ”, “แก้ไข”, “ยกเลิกใช้”, and “เปลี่ยนรหัส” actions.
- Select the exact item from full search/filter and prefill current values.
- Category and `AAA/TTT` are selected from the approved versioned dictionary;
  ordinary item mutation cannot create taxonomy entries from free text.
- The server allocates the next never-issued code inside the selected approved
  group under lock; ordinary operators do not choose an arbitrary suffix.
- Require a reason before save and show approval requirements for price edits.
- Require price authority only when name, unit, or money changes, not for an
  unrelated controlled classification change.
- Display calculated `unit_cost` beside material/labor inputs and block mismatch.
- Show a confirmation summary for retire/recode and identify affected code
  history; historical BOQs are explicitly stated as unchanged.
- On lock conflict, preserve unsaved form values and ask the admin to reload the
  latest draft before resubmitting.
- After save, update the diff and history timeline without implying publication.
- Support audited `reactivate`; support `withdraw` only for a never-published
  identity absent from the base, while preserving its identity/code reservation
  and audit evidence.
- Thai is the primary operator language. Remove rehearsal-only default values
  from production-capable fields and keep draft save linguistically distinct
  from whole-version publish.
- Keep lock versions, UUIDs, request IDs, and change-set IDs available in compact
  support details rather than presenting them as the primary success message.
- Place the complete searchable item workspace before publication controls.
  Publication is available from a dedicated final-review surface that compares
  draft/base snapshots by stable identity, shows compound old/new changes and
  readiness/governance warnings, and carries the exact reviewed lock.

### Owner-approved placement UX

- Manual Add handles one or a few exceptions; Supplement remains the bulk path.
- Both paths create provisional new identities in the same draft and converge on
  one pending-placement list.
- The admin places all pending rows, reviews the affected neighborhoods, and
  confirms one batch. The draft/version ID does not change per item.
- A later add or placement-relevant change clearly returns the draft to
  **รอจัดตำแหน่ง** and blocks publication again.
- Keyboard users can complete category, anchor, before/after, preview, and
  confirmation without drag and drop.

### History UX

- Timeline is grouped by catalog version and ordered newest first by default.
- Each entry shows action, changed fields, old/new values, actor, timestamp,
  reason, and manual/import source.
- A recode entry shows both codes and keeps searches by either legacy or
  canonical code working.
- Audit history is read-only. There is no delete-history control.

### Status and destructive-action language

- Distinguish Draft, Published, Current Default, Archived, and Stale Draft.
- Draft screens and exports show “DRAFT – ห้ามใช้อ้างอิง”.
- Publish requires the exact reviewed lock and final snapshot. Pointer restore
  requires a current-to-target summary, reason, and explicit confirmation.
- Retire and recode require an explicit confirmation dialog; ordinary field
  edits do not use disruptive confirmation dialogs.
- Publish confirmation shows the exact current/target versions, reviewed lock,
  item count, immutability, and BOQ effect; the final command remains disabled
  until the exact target version is typed and server-validated.

### Responsive behavior

- Search, review, version history, and export remain usable on mobile.
- Import/diff/publish are desktop-first but critical controls remain reachable.

### Copy protection

Replace only the hardcoded year/version fragments in:

- `app/page.tsx`
- `app/price-list/page.tsx`
- `components/dashboard/ActionHub.tsx`
- `components/dashboard/StatsGrid.tsx`

Derive the year/version from the default pointer while preserving surrounding
Production wording exactly.

---

## 9. Implementation and Rollout

### Phase 4-0 — Documentation and safety

- Add `/CI/` to `.gitignore`.
- Adopt Revision 8 as the Phase 4 implementation authority.
- Correct stale Phase 1A/Phase 2/Phase 1B status documents.
- Record a new read-only Production baseline.
- Generate the 710-row reconciliation artifact from the Production baseline and
  candidate item-code workbook.
- Lock all 42 price differences to Production values; defer the 17 unresolved
  supplement candidates while preserving the raw 18-row workbook evidence;
  retain/code the 20 Production-only rows; resolve the duplicate pair, 16
  Crossing taxonomy conflicts, and P-07 `FTW-CON-002` typo-shadow disposition.
- Freeze the approved legacy-code/canonical-code/identity mapping and code
  allocation rules.
- Approve the code dictionary, reconciliation report, change request, and
  rollout/rollback runbook.
- Approve ADR-004, parser/payload/error/hash specification, admin operating
  procedure, verification template, and release-note template.
- Approve the database/security contract, lean threat model, decision register,
  and official Excel/PDF export specification.
- Create a fresh encrypted logical Production backup.

**Reason:** Fixing documentation and protecting local CI files prevents operator
mistakes before schema work begins. Reconciliation prevents an internally valid
but semantically wrong workbook from becoming the official catalog.

### Phase 4A — Additive database foundation

- Create identities, code registry, categories, imports, and change-set tables.
- Add version lineage/approval/hash/count/lock metadata.
- Create the versioned code-group dictionary.
- Backfill 710 baseline identities/legacy codes and 52 display categories from
  the verified Production baseline.
- Seed or freeze canonical code groups and candidate mappings only from recorded
  owner/taxonomy decisions. P-02 through P-08 are recorded; any later P-09
  through P-15 gate must not be silently guessed during schema work.
- Add full-snapshot audit contracts and item-history indexes.
- Add indexes, composite foreign keys, RLS, grants, and private functions.
- Add and validate the unit-cost constraint.
- Add active/archived catalog immutability.
- Keep compatibility columns and legacy tables.

**Reason:** This phase is additive and keeps current application reads
compatible. After an applied Production commit, recovery is feature-off plus
reviewed fix-forward, not an assumed destructive reverse operation.

### Phase 4B — CI, read UI, import, and publish

- Add optimized NT runtime fonts/logo assets.
- Apply CI tokens to shared shell and Master Catalog surfaces.
- Implement version list/detail and client-side catalog filtering.
- Implement local Excel parsing, server validation, diff, draft edits, and
  evidence-gated publish.
- Implement clone-from-current, manual add/edit/retire/recode, stale-draft
  protection, and item history timeline.
- Implement reusable ADR-003 annual/revision/patch version creation with
  explicit business intent, a complete all-status reserved-number registry, and
  DB-enforced next-sequence validation. Keep `2568.1.0` only as the exact first
  candidate when unreserved rather than hardcoding it in reusable paths.
- Implement official Excel and PDF exports.
- Complete WP-6.5 end-to-end request-id, publish-guard/early-warning,
  P-20 portability, DB integration/concurrency, route failure-state,
  observability, tracked export-verifier, and documentation-consistency gates.
- Complete WP-6.6 from Audit #29: full catalog browse/item history, explicit
  current-base workspace plus stale/abandoned read-only history, resolve-only versioned categories/P-06
  code groups and
  server code allocator, complete import diff/evidence, server-derived publisher
  plus version archive metadata, complete readiness parity, correction actions,
  fix-forward schema constraints, one-draft/abandon lifecycle, authoritative
  final snapshot review, and Thai-first operator comprehension.
- Amend still-unaccepted candidate WP-6.6 migration `020`; do not rewrite
  evidence-backed `017`-`019`.
- Replace only the four hardcoded year/version fragments.
- Keep the feature flag disabled.

**Reason:** The whole user workflow is rehearsed while hidden from Production
users.

### Phase 4B.5 — P-18 placement extension (WP-7.5)

- P-30 accepted the P-18 V1 decisions in Review Note #28 and authorized bounded
  Local-only source implementation on 2026-07-15 01:37 +07.
- Append migration `021`; do not rewrite or renumber `017`-`020`.
- P-35 places unchanged `021` in bootstrap source after `020`. P-32's historical
  separate-apply evidence remains valid for its bounded scope. The separately
  warned P-36 integrated clean execution later passed on exact `910cc3c`.
- Add placement revision/review authority, exact grants/RLS, the idempotent
  placement RPC, Thai batch UI, audit/history integration, and publish-readiness
  enforcement.
- Preserve inherited base relative order, stable codes, identities, BOQs,
  hotfix `016`, and Factor F state.
- Run Local DB role, rollback, concurrency, order, hash/export, and browser tests
  before WP-8.

P-32 technical evidence passed all of the checks above, and P-33 accepted the
exact bounded WP-7.5 technical checkpoint. WP-8 must still harden and repeat
the supported release workflow from its own approved clean scope. P-36 passed
the integrated database, hash/export, route-render, realistic-scale, and cleanup
evidence. Independent live client interaction, keyboard/error recovery, and
intended-admin completion remain required before the release workflow is
accepted.

**Reason:** This completes the already exposed Add/Supplement business outcome
without turning a UI-only reorder into hidden technical debt. If P-18 is
deferred, hide/disable Add and Supplement and retain the current DB guard.

### Phase 4C — Local rehearsal and Production rollout

- Rehearse Full and Supplement imports against refreshed local Production data.
- Rehearse cloning `2568.0.0` to candidate `2568.1.0` and verify all 710 names,
  units, and prices remain unchanged before applying approved codes.
- Rehearse a manual-only correction through audit, approval, publish, and
  official export without workbook metadata.
- When P-18 is accepted, rehearse multiple new identities through one placement
  batch, stale-placement recovery, publication, and exact ordered exports.
- Test publish, immutable rows, pointer restore, Excel export, and PDF export.
- Run intended-admin UAT without developer/SQL assistance and record recovery
  from representative validation errors.
- Record 710-row import/export/admin performance baselines and investigate
  material regression before Production readiness.
- Run tests, build, security advisor, and performance advisor.
- Apply additive Production migrations with the flag disabled.
- Deploy the compatible application.
- Perform admin-only smoke tests.
- Enable the flag during a low-traffic window.
- Publish the approved catalog.
- Immediately generate official Excel/PDF copies and file them physically.
- Create a post-publish logical database backup.
- Verify existing BOQs and new BOQ creation.
- Complete and sign the verification report and admin operating procedure.

**Reason:** The database is the official record, so both a logical backup and
human-readable stamped exports are captured immediately after publication.

### Phase 4.2 — Post-launch improvements

- BOQ Rebase preview and duplicate mode
- Additional parser profiles
- Server pagination if thresholds are reached
- Removal of compatibility columns and legacy audit table after a stable cycle
- Wider CI migration
- General reordering of inherited catalog identities, subject to a separate
  approved Change Request

These items do not block the first official Master Catalog release.

### Rollback

- Before publish: disable the feature flag; current users remain on the existing
  pointer.
- After publish: use an audited pointer restore to the previous published
  version.
- Never delete the failed version or rewrite historical BOQs.
- Correct with a new version/change set rather than editing published rows.

### Go/no-go gates

Do not advance when any gate fails:

- **Phase 4-0 → 4A local implementation:** Review Guide authority set
  (Revision 8, ADR-004, Phase 4 Change Request, Post-Factor-F adjustment plan,
  Implementation Execution Pack, database/security contract, threat model,
  decision register, parser/hash and official-export contracts, Production
  baseline, and P-01) is complete. Generic schema/function/UI/test work may
  proceed locally while row-level business decisions remain pending, but no
  final canonical mapping, publishable candidate, or Production action may be
  implied.
- **4A data backfill/candidate freeze:** reconciliation, code dictionary,
  duplicate, HDPE Crossing, Production-only, workbook-only, baseline metadata,
  and related owner decisions are complete for the exact candidate scope.
- **Phase 4A → 4B:** Local schema reset/migration succeeds; backfill counts,
  constraints, RLS/grants, and advisors pass.
- **WP-6.6 → WP-7:** Every C-01 through C-17 finding in Audit #29 has an
  implemented authoritative control and evidence, or the affected capability is
  explicitly removed from release visibility. WP-6.5 reliability evidence
  remains valid but does not replace this gate.
- **WP-7 → Phase 4C/WP-8:** Manual edit, import, history, publish, export,
  stale-draft, rollback, permanent BOQ/hotfix `016`/Factor F regressions, and
  owner-comprehension tests pass with the feature flag off.
- **WP-7.5 → WP-8 for full Add/Supplement release:** P-18 is recorded; migration,
  RPC/RLS/audit/order/concurrency/browser tests pass; inherited relative order
  is unchanged. If deferred, Add/Supplement are hidden/disabled and the DB guard
  remains a tested release condition.
- **Production publish:** Approval evidence is complete, local rehearsal matches
  Production baseline, pre-deploy backup exists, smoke tests pass, and the owner
  gives explicit publish approval.
- **Post-publish closeout:** Hash/count exports, existing/new BOQ regression,
  pointer, logical backup, filed Excel/PDF, and verification report all pass.

---

## 10. Test Plan

### Database and security

- Identity, code-registry, and category backfills cover all 710 rows.
- Production-derived versioned categories and the approved P-06 22/65 code
  groups are frozen; ordinary item mutation rejects unknown input instead of
  creating it.
- Draft lineage points to the expected base version; publishing a stale-base
  draft is rejected.
- A partial unique constraint prevents two mutable drafts for one base;
  abandoned drafts retain immutable rows/audit and cannot publish or restore.
- No duplicate version/item-code or version/identity pairs.
- A code cannot be assigned to another identity.
- Legacy/canonical format validation, next-sequence allocation, retired-gap
  reservation, and sequence-900 capacity warning work as documented.
- Required `price_list` values and supported order invariants are enforced by
  fix-forward constraints after zero-null/compatibility proof.
- Newly published structured-code items have valid code-group mappings.
- Unit-cost preflight and validated constraint pass.
- Active/archived rows and published metadata cannot be mutated.
- Anonymous and non-admin catalog mutations are rejected.
- Direct import/audit table writes are rejected.
- Audit update/delete and direct draft-row writes are rejected.
- Private functions are not exposed through the Data API; only exact public
  wrappers and grants work for active admins.
- Browser bundles contain no service-role/secret key.
- Request idempotency works for manual edit/retire/recode,
  create/abandon/preview/apply/publish/restore.
- Timeout-after-commit simulation proves a client retry uses the same request ID
  and returns the prior result; same ID with a changed payload is rejected.
- Optimistic lock conflicts reject stale draft writes.
- Complete final snapshot diff fixtures cover compound and reverted changes;
  incomplete/changing reads fail closed, and publish rejects a draft mutated
  after review.
- Two independent DB sessions prove publish/restore advisory-lock ordering,
  deterministic winner/conflict behavior, bounded lock timeout, and one pointer.
- Pointer restore leaves historical BOQs unchanged.
- When P-18 is accepted, a deferrable unique order constraint and publish checks
  reject duplicate/gapped/non-contiguous positions; a valid placement batch
  preserves inherited relative order.
- Placement replay, changed-payload reuse, stale lock, concurrent confirmation,
  invalid/cross-category anchor, inherited-row move, and mid-operation failure
  are atomic and leave BOQ/Factor F state unchanged.

### Import and audit

- Reconciliation covers all 710 Production UUIDs and every 708 workbook row
- Exact, cost-different, workbook-only, and Production-only totals reproduce the
  verified baseline
- Candidate `2568.1.0` clones all 710 Production rows with identical name, unit,
  material cost, labor cost, and unit cost
- All 42 workbook price differences resolve to preserved Production values
- The 17 unresolved supplement candidates are excluded unless separate approved
  evidence is supplied; workbook `FTW-CON-002` is kept only as P-07 typo-shadow
  evidence; the 20 Production-only rows remain present
- Workbook `item_id` is ignored
- Legacy and canonical codes resolve to one stable identity and no code is
  reused
- The 16 HDPE Crossing taxonomy/K conflicts cannot pass as GIP exact matches
- Unapproved K-formula fields are excluded from Phase 4 Core import
- Valid Full and Supplement workbooks
- Wrong workbook/profile, missing columns, invalid numeric cells, and formulas
- File over 20 MB, more than 1,500 rows, or payload over 750 KB
- Duplicate code/identity and code-reuse attempt
- Recoded item mapping
- Category parsing/manual confirmation
- Full-import suspicious retirement threshold
- Complete server-recomputed row diff and exact Full-import omission list/count
- Source SHA-256, physical archive reference, actor, reason, and row diff
- Batch/per-row price-authority evidence permits an approved supplement add and
  rejects missing, fictional, or mismatched evidence
- Client tampering with normalized values is rejected by server validation
- K-formula fields are rejected/ignored according to the explicit Phase 4 Core
  contract and never silently stored

### Manual edit and item history

- Add, update, retire, recode, reactivate, and narrowly scoped withdraw work only
  on exact current-base drafts
- Each manual change requires reason, request ID, expected lock version, actor,
  timestamp, and full old/new snapshots
- Duplicate submission with the same request ID has one effect and one audit
  record
- Lock conflict rejects the write without losing the other admin's data
- Price edits validate material + labor = unit cost and require publish approval
- Manual-only draft can publish without Excel metadata but not without approval
- Manual-only draft cannot publish without a version-level physical archive
  reference; publisher snapshot is derived from the authenticated actor
- Published/archived items cannot be edited
- History follows `identity_id` through legacy and canonical codes
- History displays source, version, actor, reason, timestamp, and field-level
  old/new values
- Audit history cannot be edited or deleted
- Full 710-row browse/search and item history expose field-level old/new values;
  stale drafts are read-only and no mutation/import silently selects a draft
- New identities from manual Add and Supplement converge on one pending placement
  batch; confirming that batch does not create a new catalog version per item

### Publish and export

- Publish without evidence, confirmation, or matching lock version fails
- A mismatched typed target version cannot call the publish RPC; exact match
  only enables the final command, and cancel creates no publish effect
- Publish fails when the current pointer no longer matches the draft base
- Preliminary readiness and final publish consume the same stale-base and full
  canonical-quality result; the UI cannot show a false green state
- Dataset hash and item count are computed from database rows
- Excel row count/hash exactly match the published version
- PDF row count/hash exactly match the published version
- Published version exports show complete stamp
- Draft Excel/PDF shows “DRAFT – ห้ามใช้อ้างอิง”
- An older published version exports its own data, not the current pointer data
- Excel cells retain numeric types and formatting
- PDF repeats headers, version stamp, and page number without clipping
- Shared canonicalizer produces the same dataset hash for publish, Excel, and
  PDF verification
- P-20 clean-reset/cross-environment fixture proves the approved baseline
  identity/hash portability model
- Reusable version create/publish accepts another ADR-003-valid
  annual/revision/patch version and rejects duplicates/invalid ordering without
  a hardcoded `2568.1.0` path
- Reserved-number fixtures cover abandoned revision/patch candidates, a void
  `{year}.0.0` followed by the next same-year annual revision, stale UI plans,
  out-of-sequence requests, create races, and same-request replay
- Tracked semantic verifier remains correct when title rows move and fails
  closed on missing/renamed headers, wrong counts/types/hash, formulas, or links
- A new-identity draft rejects before P-18 placement; after accepted placement,
  the exact `display_order`, dataset hash, Excel sequence, and PDF sequence agree
- Any new add or placement-relevant change after confirmation makes placement
  stale and blocks publication again

### Regression and CI

- Existing BOQs retain versions and totals
- Create/edit/duplicate Preserve/print/export BOQ flows still pass
- Live Local DB `save_boq_with_routes` tests cover the exact base name, all four
  hotfix `016` suffixes, invalid suffix/name, catalog-authoritative unit/prices/
  category/version, unauthorized/cross-version calls, and atomic rollback
- Dashboard wording remains unchanged apart from dynamic year/version
- “แบบ ปร.1” remains unchanged
- NT font/logo/color usage matches the supplied CI
- Keyboard, focus, validation, contrast, and responsive checks pass
- Server Components perform reads, Server Actions perform UI mutations, and the
  Excel Route Handler runs in Node.js runtime
- ExcelJS is absent from initial catalog client bundles and loads dynamically
  only on import interaction
- Catalog loading/error/not-found states render correctly
- Operator messages are Thai-first, include a safe error code/request ID where
  useful, and give a recovery path without exposing SQL/internal details
- Production-capable forms contain no WP/local-rehearsal placeholder defaults;
  draft save and whole-version publish are unambiguous to an intended admin
- Structured logs include request ID, operation, outcome, duration and version,
  with bounded/redacted values
- Intended-admin UAT completes create/import/review/publish-readiness/export and
  representative error recovery without developer/SQL assistance
- Intended-admin UAT can abandon/recreate a working draft, inspect all final
  changes before publication, and recover from stale review without SQL
- 710-row import/export/admin performance baselines meet the reviewed budget
- Documentation consistency check confirms authority links, migration order,
  WP order, and pending-decision IDs
- `npm test`, `npm run lint`, and `npm run build` pass

---

## 11. Acceptance Criteria

- Published Master Catalog is immutable and is the system of record.
- The singleton pointer resolves to the intended current version.
- Every published version has approval metadata, item count, and dataset hash.
- Every Phase 4-created published version has a version-level physical archive
  reference and a server-derived publisher actor/display snapshot.
- Every import/edit/publish/restore has actor, reason, request ID, and diff.
- Every accepted new-identity placement has actor, reason, request ID, revision,
  and append-only review evidence.
- The same user operation retains one request ID across uncertain retry and
  cannot create a second effect after timeout.
- Every item exposes read-only history across versions and recodes using stable
  identity and full old/new row snapshots.
- An admin can search/filter the complete current catalog, select the exact item
  and draft, and see stale drafts as read-only without developer assistance.
- Ordinary item/import workflows resolve only approved categories/code groups;
  code allocation is server-owned and never reuses a retired sequence.
- An admin can add, edit, retire, or recode a draft item without uploading an
  Excel workbook.
- Under the full P-18 release, an admin can add several identities to one draft,
  place them in one batch, and publish once without reordering inherited rows.
- When an import is used, the physical source workbook can be identified by
  filename, SHA-256, and archive reference.
- Excel and PDF exports are generated from the selected database version.
- Export count/hash match the published dataset or the export fails.
- Export evidence is reproducible from tracked semantic verification code.
- Published Excel/PDF carries a complete version stamp and can be used as an
  immediate reference copy.
- Staff see the new catalog only after publication.
- Previous versions and historical BOQs remain readable and exportable.
- The previous pointer can be restored without rewriting historical data.
- Every current Production row and candidate workbook row has an approved
  reconciliation outcome before Phase 4A backfill or import starts.
- The approved mapping preserves legacy `ITEM-####` traceability while assigning
  canonical `AAA-TTT-###` codes to stable UUID identities.
- No workbook row sequence is treated as identity, and no unapproved price or K
  mapping is published.
- The first structured-code release preserves all 710 Production names, units,
  and prices exactly.
- Manual-only and import-based versions both satisfy the same approval,
  immutability, hash, export, and audit controls.
- Import preview displays the complete authoritative diff/omission set and has a
  supported price-authority path for approved new rows.
- An admin can reactivate a mistaken retirement and withdraw a never-published
  added row through explicit audited correction actions without deleting
  identity/code/audit history.
- A stale-base draft cannot become current.
- A second current-base mutable draft cannot be created; audited abandon retains
  the old attempt as read-only history.
- The item-first workspace and authoritative final snapshot review make every
  cumulative manual/import effect visible before the publish form.
- P-20 establishes and proves the intended cross-environment identity/hash
  semantics before clean rehearsal or Production hash acceptance.
- Reusable catalog version creation follows ADR-003 beyond `2568.1.0`.
- Publish blockers are visible before the user invests in apply/publish, while
  the database remains the final enforcing boundary.
- Live DB hotfix `016`, RLS/RPC, transaction rollback and concurrency tests are
  permanent release gates.
- Admin UAT, safe Thai error recovery, structured correlation logs, and the
  reviewed 710-row performance baseline pass before feature enablement.
- If P-18 is deferred, Add and Supplement are hidden/disabled at feature
  enablement and the DB new-identity guard remains active; a half-complete
  operator workflow is not an accepted release state.

---

## 12. Locked Assumptions

- A single authorized admin may publish; real approval evidence is mandatory.
- Full and Supplement import are both required.
- Source workbooks are retained in the physical filing system, not Supabase
  Storage.
- The browser parses source workbooks locally; the server validates normalized
  data and publishes the authoritative dataset.
- Published database versions and their stamped exports are official.
- Draft manual edits require a reason.
- Phase 4 Core allows at most one mutable working draft per base; stale and
  abandoned drafts are retained read-only.
- Production is the authoritative initial source for name, unit, material cost,
  labor cost, and unit cost.
- The first structured-code candidate is based on all 710 Production rows; the
  mapping workbook supplies codes/classification only.
- Publish is immediate after confirmation; scheduling is out of scope.
- Stable item identity and versioned categories are added before the second
  catalog version.
- BOQ Rebase is Phase 4.2 and does not block Phase 4 Core.
- Factor F remains outside Master Catalog price versioning and is governed by
  ADR-005. The separate Factor F track completed before Master Catalog Phase 4
  on 2026-06-29: foundation, current baseline `2566.0.0`, new default
  `2569.0.0`, and legacy snapshot metadata repair without old BOQ version
  backfill. The detailed Factor F CR, implementation plan, source-table annex,
  and rollout closeout live in `docs/plans/factor-f/`.
- Phase 4 now runs in a two-axis version model: catalog version controls item
  identity/name/unit/price, while Factor F version controls calculation
  reference data. New BOQs bind both axes independently. Historical BOQs keep
  their existing catalog version and either their bound Factor F version or
  legacy snapshot-only state.
- Any Phase 4 change to BOQ save, duplicate, print, Excel, or admin tooling
  must prove that `boq.factor_reference_version_id` values, Factor F pointer
  state, and legacy snapshot behavior are unchanged unless a separate Factor F
  CR explicitly authorizes the change.
- Migration numbering follows actual execution order. Factor F used root
  migrations `012`, `013`, `014`, and `015`; production hotfix `016` preserves
  approved BOQ item suffix labels in the save RPC; Master Catalog Phase 4
  database migrations start at `017+`. Do not create parallel migrations with
  the same logical order.
- No paid Supabase branch or additional hosted project is created.
- Compatibility columns are retained through the first stable Production cycle.
- Local CI sources remain uncommitted; only approved runtime derivatives may be
  committed.
- The candidate item-code workbook remains reconciliation input until the owner
  approves the complete 710-row outcome set.
- Price changes from any future workbook require separate price authority and a
  clearly reviewed price diff.
- AAA/TTT code-group metadata and display categories remain separate concepts.
- Manual-only publication does not require fictional workbook metadata.
- P-18 does not authorize arbitrary reordering. Its proposed V1 extension is
  limited to placing identities absent from the base while retaining base
  relative order; exact acceptance remains in the Decision Register.

---

## 13. Required Documentation and Operating Artifacts

### Owner-maintained or approved documents

1. **Revision 8 architecture and implementation plan** — this document.
2. **[ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)** — architecture/governance decision.
3. **[Phase 4 Change Request](./09-phase4-change-request.md)** — scope, gates,
   risk, approvals, and Production authorization record.
4. **[AAA/TTT code dictionary](./10-phase4-structured-code-dictionary.md)** —
   meanings, allocation/no-reuse rules, and review status.
5. **[Reconciliation report](./11-phase4-reconciliation-report.md)** plus
   [728-record CSV](./evidence/phase4-reconciliation-draft.csv) — 710
   Production outcomes, 18 raw workbook-only records, and 17 unresolved
   supplement candidates after P-07.
6. **[Deployment and rollback runbook](./12-phase4-production-runbook.md)** —
   checkpoints, expected counts, flag/pointer steps, backups, and aborts.
7. **[Verification report](./13-phase4-verification-report.md)** — local,
   schema/security, regression, export, Production, and sign-off evidence.
8. **[Parser/payload/error/hash specification](./14-phase4-parser-and-canonical-hash-spec.md)** — deterministic implementation contract.
9. **[Admin operating procedure](./15-phase4-admin-operating-procedure.md)** —
   clone, manual edit, import, review, publish, export, restore, and history.
10. **[Version release note template](./16-phase4-release-note-template.md)** —
    release totals, decisions, effective date, and dataset hash.
11. **[Database and Security Contract](./17-phase4-database-security-contract.md)** —
    exact schema, constraints, indexes, grants/RLS, functions, locks, and
    migration order.
12. **[Lean Threat Model](./18-phase4-threat-model.md)** — trust boundaries,
    abuse cases, controls, residual risks, and required security evidence.
13. **[Decision Register](./19-phase4-decision-register.md)** — locked,
    pending, and deferred decisions with owners and due gates.
14. **[Official Export Specification](./20-phase4-official-export-spec.md)** —
    authoritative Excel/PDF sheets, fields, CI, hash, security, and acceptance
    rules.
15. **[Architecture Review Disposition](./21-phase4-architecture-review-disposition.md)** —
    accepted/rejected independent-review findings and evidence for Revision 8.
16. **[Post-Factor-F Adjustment Plan](./22-phase4-post-factor-f-adjustment-plan.md)** —
    difficulty assessment, two-axis impact matrix, adjusted implementation
    sequence, required tests, and abort conditions after the completed Factor F
    rollout.
17. **[Implementation Execution Pack](./23-phase4-implementation-execution-pack.md)** —
    work-package checklist, file targets, test gates, owner-decision gates, and
    start/stop rules for implementation/local rehearsal.

The
[Supabase API Key Migration Change Request](../security/01-supabase-api-key-migration-change-request.md)
is tracked as a separate security-maintenance change. It must not be bundled
with the Phase 4 Production rollout and does not block local Phase 4
implementation.

### System-generated evidence

- Import metadata, file fingerprint, normalized payload hash, and validation
  result when Excel is used
- Change sets and full old/new item snapshots
- Actor, reason, request ID, timestamps, and lock versions
- Publish record, approval metadata, item count, and dataset hash
- Official stamped Excel/PDF generated from the published database version

Do not duplicate system audit history in a separately maintained spreadsheet.
The physical approval/source documents remain filed externally and are linked
by reference and fingerprint where applicable.

### Documentation update rule

Any implementation change that alters schema, permission, import semantics,
versioning, publish gates, canonical hash fields, or rollback behavior must
update this plan, the relevant ADR/runbook, tests, and verification report in
the same pull request or release change set.

Use the authority/evidence index in the
[Execution Progress Tracker](./25-phase4-execution-progress-tracker.md). The
Tracker owns current status/blockers, the Decision Register owns owner/data
decisions, and the Verification Report owns detailed point-in-time results and
hashes. Other documents link to those facts instead of copying them. A tracked
consistency check must cover migration order, WP ordering, pending decision IDs,
and required authority links before WP-8.

---

## 14. Gate-Specific Checklists

Use these lists as gate checks, not as one flat start condition. P-01 allows
generic local implementation and rehearsal only. It does not approve candidate
data freeze, Production migration, feature enablement, or publication.

### 14.1 Before local implementation / Phase 4A start

- [ ] P-01 in the Decision Register records owner approval for the Review Guide
  authority set: Revision 8, ADR-004, Phase 4 Change Request, Post-Factor-F
  adjustment plan, Implementation Execution Pack, database/security contract,
  threat model, decision register, parser/hash spec, and official-export spec.
- [ ] Current live read-only Production evidence is recorded in the Verification
  Report, including catalog baseline, Factor F baseline, BOQ count/split, and
  security/performance advisor baseline. The 2026-06-22 preparation baseline is
  not a substitute for this fresh preflight.
- [ ] No new or untriaged Phase 4 security/data-integrity blocker exists.
- [ ] `/CI/` is ignored and remains local-only.
- [ ] Current Supabase docs/changelog, Data API exposed-schema settings, CLI
  `--help`, and Next.js version-specific conventions are rechecked before
  implementation decisions that depend on them.
- [ ] Existing Supabase server/browser clients are reused, and the plan for
  generated database types is current.
- [ ] Migration design is additive and starts at `017+`; it uses explicit
  grants/RLS, indexed foreign keys and hot filters, safe constraint creation,
  bounded lock/statement timeouts, and `NOT VALID`/`VALIDATE` where appropriate.
- [ ] Phase 4 migration design has no Factor F table write, Factor F pointer
  change, or legacy BOQ Factor F backfill.
- [ ] Parser profile, 750 KB application payload cap, `ActionResult` error
  codes, canonical null/order/decimal/LF rules, and golden hash are accepted as
  the implementation contract.
- [x] Deployment/rollback runbook and verification template are drafted and
  link-checked.

### 14.2 Before candidate data freeze / export acceptance

- [ ] Owner approves Production price precedence for the candidate scope.
- [ ] 710-row reconciliation and code dictionary are approved.
- [ ] Duplicate and 16 Crossing decisions are recorded.
- [ ] Production-only 20 rows and raw workbook-only 18 rows have recorded
  decisions; only 17 unresolved supplement candidates remain deferred after
  P-07.
- [ ] Any external analysis or quick-decision guide has been reconciled into the
  Decision Register; proposed outcomes are not treated as approved data.
- [x] P-08 legacy `2568.0.0` publication metadata is recorded:
  effective `2026-01-01`, approval reference `เอ็นที วทฐฐ./405 ลงวันที่
  27 พ.ย. 2568`, approval document date `2025-11-27`, and publisher
  `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`; generated backfill fields must not be
  invented.
- [ ] Exact candidate version/effective date/archive reference is approved.
- [x] Approved runtime font/logo derivatives are identified and licensed for
  repository/Production use via P-10 and
  [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); `/CI/` source remains
  local-only and P-11 visual acceptance remains separate.
- [ ] Parser/canonicalizer implementation and golden hash tests pass.
- [ ] Manual-only and Excel workflows both pass audit and publish tests.
- [ ] Item history follows identity across recodes.
- [ ] Stale draft, lock conflict, request retry, and pointer restore tests pass.
- [ ] Timeout-after-commit retry reuses one client-owned request ID; concurrent
  two-session publish/restore tests pass.
- [ ] P-20 identity/hash portability decision is implemented and proven.
- [ ] Reusable version workflow follows ADR-003 without candidate hardcoding.
- [ ] Official Excel/PDF visual sample, hash, and count verification pass.
- [ ] Export verification runs from tracked semantic code in a clean checkout.
- [ ] Existing BOQ create/edit/duplicate/print/export regressions pass.
- [ ] Live Local DB hotfix `016` suffix/authority/rollback/role/version fixtures
  pass.

### 14.3 Before Production migration / deploy / publish

- [ ] Local reset/rehearsal works from a fresh database state.
- [ ] Fresh read-only Production preflight is recorded immediately before the
  Production gate.
- [ ] Fresh encrypted logical backup and restore verification are completed for
  the Production window.
- [ ] Verification Report documents the rollback/fix-forward plan and proves
  RLS/grants, advisory lock behavior, publish/import status transitions, export
  formula-safety, and BOQ/Factor F regression gates.
- [ ] Admin UAT, route failure-state, Thai error/recovery, structured-log, and
  710-row performance evidence are accepted.
- [ ] Authority/document consistency verification passes.
- [ ] Security and performance advisors have no unresolved rollout blockers;
  pre-existing warnings are baselined or separately accepted with owner and
  remediation metadata.
- [ ] Feature flag defaults to disabled after migration/deploy.
- [ ] Owner explicitly approves the Production migration window.
- [ ] Owner explicitly approves application deploy and admin-only smoke.
- [ ] Owner explicitly approves feature enablement.
- [ ] Owner explicitly approves publication of the named catalog version and its
  final diff/count/hash.
