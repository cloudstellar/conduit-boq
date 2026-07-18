# Phase 4 Decision Register

**Status:** Owner-approved decision source of truth for Phase 4 governance;
pending decisions still require owner resolution at the stated gate

**Prepared:** 2026-06-22

**Reliability plan alignment recorded:** 2026-07-11 — owner instructed the
Phase 4 plan/authority documents to be aligned before further implementation to
reduce drift after production hotfix `016`. This authorizes this docs-only plan
amendment; it does not resolve pending business decisions or authorize any
Local reset or Production action.

**P-18 planning alignment recorded:** 2026-07-12 — owner authorized adding the
proposed P-18 review contract and WP-7.5 to the plan after the Admin UI review.
This records a plan path, not acceptance of the five placement business rules,
not authorization to implement migration `021`, and not a Local reset or
Production decision.

**P-30 WP-7/P-18 decision recorded:** 2026-07-15 01:37 +07 — after reviewing
the passed P-29/G4E evidence and the full-versus-limited release tradeoff, the
owner accepted WP-7 and approved all five P-18 V1 placement rules in
[Review Note #28](./28-phase4-p18-placement-governance-review-note.md). This
authorizes the bounded WP-7.5 Local-only source implementation for migration
`021`, its exact RPC/read model, Thai-first placement workspace, tests, and
authority documentation. It does not authorize adding `021` to bootstrap,
resetting or mutating Local Supabase for evidence, WP-8 execution, P-19,
Production access/write, feature enablement, publication, new Factor F work,
or expansion of hotfix `016`; those gates remain separate.

**P-31 WP-7.5 Source/Static acceptance recorded:** 2026-07-15 10:24 +07 —
after reviewing the owner/developer recommendation, the owner accepted exact
checkpoint `4e3574a31a2697f4d727acabc8f55f34a4233bff` for commit/push. Migration
`021` remains outside bootstrap and unapplied. This decision does not authorize
resetting or mutating Local Supabase, live DB/browser evidence, WP-8, P-19,
Production access/write, feature enablement, publication, new Factor F work,
or expansion of hotfix `016`; those gates remain separate.

**P-32 WP-7.5 Local live gate recorded:** 2026-07-15 — the owner explicitly
approved the warned Local reset, bootstrap through `020`, separate `021` apply,
and bounded live DB/RLS/concurrency/hash/export/browser evidence. The first
runtime attempt failed closed with PostgreSQL `42704`; cleanup restored the
baseline. The same-scope schema-qualified fix-forward and replacement clean
chain then passed on DB source `80b2574` and UI checkpoint
`99fa56c3d3c68e1886fbd308d8536e598eaee02f`, including
audited cleanup to `2568.0.0`, zero drafts, and all disabled flags. P-32 does
not add `021` to bootstrap or cross WP-8, P-19, Factor F/hotfix, feature, or
Production gates.

**P-33 WP-7.5 technical acceptance recorded:** 2026-07-15 13:54 +07 — after
reviewing the P-32 replacement evidence and the owner/developer UX analysis,
the owner accepted the exact bounded WP-7.5 technical checkpoint. This marks
WP-7.5 technically complete but does not certify intended-admin usability or
authorize `021` bootstrap inclusion, a Local reset, WP-8 execution, P-19,
feature enablement, publication, Factor F/hotfix expansion, or Production.
Truthful local dirty state, review-by-exception, keyboard equivalence, measured
710-row scale, and independent intended-admin comprehension are hard WP-8/P-14
release gates. Drag and drop remains optional; general inherited-row reorder
remains a future Change Request.

**P-34 WP-8 placement UX source gate recorded:** 2026-07-15 — the owner
authorized the recommended source-only hardening after the P-33 docs-first
review. Exact application checkpoint
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` implements truthful accepted-versus-
locally-dirty status, versioned recoverable browser choices and guarded
navigation, direct exception filters/counts, native keyboard-complete
before/after radios, complete affected-category/immediate-neighbor confirmation,
and memoized/deferred list derivation. Repository tests, TypeScript, lint, and a
network-enabled production build passed. This starts WP-8 source/static only;
it does not add `021` to bootstrap, reset or mutate Local Supabase, accept live
performance/accessibility/intended-admin UAT, enable Add/Supplement, publish,
touch Production, reopen Factor F, or expand hotfix `016`.
The direct before/after presentation in this historical checkpoint was later
rejected by the first P-37 intended-admin comprehension session and is
superseded at the presentation layer by Note #33; the accepted P-18 database
contract and P-34 technical provenance remain unchanged.

**P-35 WP-8 bootstrap source-integration gate recorded:** 2026-07-15 — after
reviewing the recommended remaining sequence, the owner instructed the team to
proceed with documentation alignment, exact `021` bootstrap source inclusion,
repository verification, commit, and push. This authorizes repository/source
work only. It does not authorize `npm run db:local:bootstrap`, any Local reset or
write, live WP-8 evidence, feature enablement, publication, Production access or
write, P-19, new Factor F work, or expansion of hotfix `016`. P-36 is reserved
for the separately warned destructive Local execution; P-37 is reserved for the
later WP-8 owner accept/hold decision. Exact source checkpoint
`01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a` subsequently passed the authorized
repository/static scope without Local DB or Production execution.

**P-36 WP-8 destructive Local execution gate recorded:** 2026-07-15 21:00 +07
— immediately after the owner was warned that `npm run db:local:bootstrap`
resets all Local Supabase, the owner explicitly instructed the team to continue.
This authorizes one integrated Local-only reset and the named WP-8 live evidence
from the exact pushed P-35 lineage, followed by audited cleanup to the disabled
baseline. It does not authorize Production access/write, feature enablement,
publication, P-19, new Factor F work, hotfix `016` expansion, P-37 acceptance,
or a source-scope change inferred from a failed gate.

**P-36 integrated Local technical result recorded:** 2026-07-15 — exact gate
and execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6` passed the
clean `009`-`015`, hotfix `016`, and Phase 4 `017`-`021` chain plus integrated
DB/RLS/concurrency/P-20/WP-7/WP-7.5/export/advisor/repository/realistic-scale
route-render and disabled-baseline cleanup evidence. Production was not
touched. Browser automation could not dispatch React/Radix client state
changes, so P-37 HOLD is recommended until independent intended-admin live
interaction, keyboard, recovery, and error-comprehension UAT passes. See
[P-36 Owner Review Note](./32-phase4-wp8-p36-owner-review-note.md). This result
does not itself record the P-37 owner decision or authorize any Production
gate.

**P-37 first intended-admin UAT result recorded:** 2026-07-17 — the owner
opened the real 710+18 Local placement route without developer or SQL guidance
and could not determine the task from the direct reference-item and
before/after controls. The session stopped before final confirmation and made
no placement RPC effect. The bounded working-tree correction replaces that
presentation with final-neighbor previews and one insertion-gap editor while
preserving the category/anchor/relation DB payload. P-37 is HOLD, not accepted,
until owner re-UAT and the remaining keyboard/leave-reload recovery, exact
candidate-provenance, and explicit decision gates pass. See
[P-37 UAT and UX Correction Note](./33-phase4-wp8-p37-uat-ux-correction-note.md).
Production remains unauthorized.

**P-37 Local technical continuation recorded:** 2026-07-18 — without a reset,
the corrected `2568.13.0` fixture passed controlled retryable stale-lock
rejection, one accepted 18-row placement, exact-request idempotent replay,
accepted-state desktop/mobile route readback, and audited abandon/disabled-
baseline cleanup. This closes the technical stale/confirmation/replay/cleanup
evidence only. Browser controls in the final session focused or changed native
DOM values without dispatching the React/Radix state changes, so independent
keyboard and leave/reload recovery UAT is not inferred. P-37 remains HOLD until
that re-UAT, exact commit/push provenance, and an explicit owner accept/hold
decision. Production remains unauthorized.

**Capability-completeness alignment recorded:** 2026-07-12 — owner requested a
full owner/developer audit and plan correction. Audit #29 adds WP-6.6 before
WP-7 and reserves migration `020` for fix-forward authority/workflow hardening;
P-18 placement is renumbered to planned migration `021`. This records the plan
and corrected meaning of completeness; it does not authorize implementation,
Local reset, or Production action.

**P-22 operator-workflow correction recorded:** 2026-07-12 — after reviewing
the Local admin flow as the intended operator, the owner approved the correction
plan in [Doc #31](./31-phase4-wp66-operator-workflow-correction-plan.md). V1 has
at most one mutable working draft per base version, retains stale/abandoned
drafts read-only, requires an audited abandon path, and places an authoritative
final draft-versus-base comparison before publication. This authorizes docs and
Local-only implementation planning; it does not authorize a Local reset,
P-18/`021`, P-19, WP-7, Factor F/hotfix expansion, or Production.
The owner subsequently approved G1 separately. G1 Local DB/concurrency/P-20
input passed on final evidence commit `e463270`. Technical operator/browser
preflight then passed on executable/source checkpoint `c8f6dca` without a
reset or migration `020` change. P-23 then amended operator context/navigation,
and P-23.1 amended candidate `020` plus the create/item/restore flow. P-23.1
repository/static verification passed 2026-07-13; prior live evidence is now
historical. The owner then explicitly approved G1R, which passed on exact clean
execution checkout `721c2c2` with final migration `020` SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The owner later approved G2 separately; the second independent clean rebuild
and P-20 comparison passed on the same exact candidate. G3, G4, and every
Production action remained separate decisions. A bounded no-reset G3 real-route
technical walkthrough then passed on source HEAD `6599c30`: a lock-1 review
rejected publication after a second edit advanced lock 2, retained entered
fields, reloaded the latest review, and audited-abandoned the proof draft with
clean final invariants. P-26 then closed the high-impact confirmation gap and
was committed at `78e96ab`. The owner accepted G3/WP-6.6 on that exact
application checkpoint at 2026-07-14 23:50 +07. G4, bootstrap inclusion,
WP-7, and Production are not inferred.

**P-28/G4 repository integration recorded:** 2026-07-15 — the owner approved
the recommended repository-only sequence: add exact accepted migration `020`
to the canonical Local bootstrap source and implement the tracked WP-7
regression harness before requesting one warned destructive Local reset. This
authorizes source/tests/docs only. It does not authorize executing
`npm run db:local:bootstrap`, live WP-7 DB mutation/evidence, P-18/`021`, P-19,
WP-8, Factor F or hotfix expansion, feature enablement, publication, or any
Production access/write.

**G2 advisor disposition recorded:** 2026-07-13 — the current Local Studio
rules report eight authenticated-callable `SECURITY DEFINER` warnings. Seven
belong to baseline application RPCs; one is the active-admin/feature-flag-
guarded Master Catalog readiness facade. All deny anonymous execution. They do
not block G2. P-36 later reproduced and triaged the current baseline without a
security issue or technical rollout blocker. Least-privilege/minimization,
especially for baseline `get_user_role` and `is_admin`, remains due before
P-12. The 24 Studio performance warnings and seven unindexed-FK information
findings are also baseline items; both new authority foreign keys are covered.
This record is not a Production risk acceptance.

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation as the Phase 4 governance backbone and source of truth for
locked, pending, and deferred decisions. This approval accepts the recording
procedure and current P-01 component tracker, but it does not resolve P-02
through P-15, authorize Production migration, deploy, feature enablement, or
publication, or convert analysis memos into authority.

## 1. How to use this register

This is the single short list of decisions that implementation must not guess.
It is not a second architecture document.

- **Locked** means already agreed in the architecture/ADR and implementation
  must follow it unless an approved change updates the source document.
- **Pending** means no Production or data action may cross the stated gate until
  a named owner records the answer and evidence.
- **Deferred** means deliberately outside Phase 4 Core; it is not an unfinished
  Core requirement.

When a decision changes, update this register, its authoritative ADR/contract,
tests, and any affected reconciliation row in the same review. Do not silently
change only application code or SQL.

## 2. Locked architecture and scope decisions

| ID | Decision | Reason / authority |
|---|---|---|
| L-01 | An immutable published database version is the Master Catalog system of record | Official publication must have one unambiguous authority; [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md) |
| L-02 | System-generated Excel/PDF for a published version are official reference copies when stamp, count, and dataset hash verify; Excel independently reconstructs the canonical hash while PDF is server-verified and stamped | They can be cited immediately without overstating what the PDF alone can reconstruct |
| L-03 | Current Production `2568.0.0` is the authority for the initial 710 names, units, and prices | Candidate workbook has row and price differences |
| L-04 | The first structured-code rollout cannot change Production name/unit/price; workbook codes remain candidates until approved | Separates taxonomy adoption from price authority |
| L-05 | Raw workbook is parsed locally and retained in the physical filing system; no Supabase Storage/signed upload | Owner retains the original and online storage adds unnecessary scope |
| L-06 | Manual edits and Excel imports use the same draft, diff, reason, audit, concurrency, approval, and publish controls | Prevents an unaudited manual backdoor |
| L-07 | Published rows are immutable; correction creates a new version/change set | Protects historical BOQs and official exports |
| L-08 | Stable UUID identifies a logical item; business codes are append-only reservations and cannot move to another identity | Preserves history through recodes and prevents code reuse |
| L-09 | Display category and AAA/TTT code taxonomy are separate, versioned data; pricing never parses code segments at runtime | Codes describe business classification, not executable pricing logic |
| L-10 | K-formula fields are excluded/rejected in Phase 4 Core | Ownership, approval, and versioning are not yet approved |
| L-11 | BOQ Rebase is Phase 4.2; historical BOQs remain locked to their catalog version | Core can ship safely without rewriting existing BOQs |
| L-12 | The singleton pointer is authoritative; legacy `is_default` is a transactional compatibility mirror until later removal | Avoids dual-source ambiguity while preserving current code |
| L-13 | Catalog writes are function-only with explicit grants, RLS defense in depth, and private privileged implementation | Required audit/authorization boundary; [DB contract](./17-phase4-database-security-contract.md) |
| L-14 | Publication and pointer restore are serialized, idempotent, short transactions; parsing/export occurs outside locks | Prevents pointer races and operational blocking |
| L-15 | Dataset hash uses the fixed canonical contract; binary export hashes are separate | Separates data equivalence from file-byte identity |
| L-16 | One approved auto-detected parser profile is supported initially; no generic mapper | Keeps v1 proportionate to one known workbook format |
| L-17 | Normalized import payload is capped at 750 KB in browser and server; raw `.xlsx` is capped at 20 MB before parsing | Bounds risk while covering the verified 710-row catalog |
| L-18 | Client-side filtering remains acceptable until a version exceeds 2,000 rows or measured catalog-read payload exceeds 1 MB | Avoids premature pagination infrastructure |
| L-19 | No paid Supabase branch/project is required; rehearse against project-scoped Local Supabase and a logical backup | Meets present cost and isolation needs |
| L-20 | `/CI/` source files remain local-only; only reviewed runtime derivatives may be committed/deployed | Protects source brand assets and keeps deployed assets intentional |
| L-21 | Existing Production wording is preserved unless an explicitly approved UI/UX change says otherwise | Prevents accidental label drift during Phase 4 implementation |
| L-22 | Phase 4 does not add an export-event log table, workflow engine, background job, partitioning, or `pg_trgm` | No current scale/compliance evidence justifies the complexity |
| L-23 | Published baseline identities are never merged; an erroneous duplicate is retired in a later version while both historical identities/codes remain | Prevents ambiguous lineage and preserves published BOQ history |
| L-24 | Legacy display order comes from the verified unique numeric suffix of `ITEM-####`; clones preserve it and new items append | Produces deterministic order without trusting workbook/physical row order |
| L-25 | Full-import mass retirement begins at `max(10, ceil(2% of active base))` and requires exact owner approval evidence before apply/publish | Detects wrong-source omissions without blocking a single correction |
| L-26 | Phase 4 Core does not expose an archive transition; former current versions remain Published/Active and immutable | Avoids adding an undefined lifecycle operation while the singleton pointer already identifies Current |
| L-27 | Phase 4 Core does not rebase stale drafts; create a new draft from Current and deliberately reapply still-approved changes while retaining the stale draft read-only/nonpublishable | Avoids hidden three-way merge semantics and preserves an explicit audit trail |
| L-28 | Factor F remains outside Master Catalog price versioning and follows ADR-005; old BOQs are not backfilled with a guessed factor version | Prevents false provenance and keeps Factor F policy changes independent from price catalog publication |
| L-29 | Migration numbers follow actual execution order; Factor F applied as `012`/`013`/`014`/`015` on 2026-06-29, production hotfix `016` applied on 2026-07-06, so Master Catalog Phase 4 starts at `017+` | Prevents duplicate migration ordering and keeps deploy history truthful |
| L-30 | Catalog and Factor F version strings are independent namespaces; labels and official documents must say Catalog version vs Factor F version explicitly | Prevents mistaking catalog `2568.1.0` for Factor F `2569.0.0` |
| L-31 | No Factor F publication is part of Master Catalog Phase 4 | MC approval cannot move the Factor F pointer, change Factor F rows, or bind old BOQs by assumption |
| L-32 | Master Catalog dataset hashes and official catalog exports exclude Factor F rows, Factor F metadata, BOQ snapshots, and BOQ totals | Keeps catalog reproducibility scoped to price-list data and avoids cross-axis hash drift |
| L-33 | Add/supplement rows may be created only within the gated workflow; publication of any version containing new identities is held until its current placement batch has a matching P-18 review and DB order invariants pass | Prevents a future admin from accidentally making provisional append-at-end placement official |
| L-34 | WP-6.5 hardens the structured-code publish boundary once a draft contains any active canonical `AAA-TTT-NNN` row: active legacy `ITEM-####` rows must then be limited to the approved `ITEM-0139` exception | Prevents the P-06 exception from remaining only a reviewer checklist while preserving a valid unchanged legacy-only clone/revision path |
| L-35 | A UI operation owns one `request_id` from first submission until a definitive result; retry after an uncertain response must reuse that ID | Database uniqueness alone is not end-to-end idempotency if every retry creates a new ID |
| L-36 | Catalog version creation is reusable under ADR-003 CalVer-first rules; `2568.1.0` may be an exact rehearsal candidate but must not remain hardcoded in reusable action/RPC validation | Annual, revision, and patch releases are already approved architecture, not a future one-off code change |
| L-37 | Hotfix `016`, RLS/RPC, transaction rollback, and publish concurrency require executable Local DB behavior tests; SQL text-shape checks alone are not release evidence | Prevents implementation text from passing while runtime behavior regresses |
| L-38 | Volatile status and evidence follow the authority index in the Tracker; other plans link to that source instead of copying current commit/hash/test facts | Reduces conflicting status and stale operational instructions |
| L-39 | Export artifact verification logic is committed, semantic, and rerunnable from a clean checkout; generated files remain untracked | Prevents row-coordinate assumptions and untracked scripts from becoming release evidence |
| L-40 | A mutation request is fingerprinted by operation, actor, and canonical payload; the same request ID with changed content is rejected, and mutation-time structured aborts roll back the whole change set in a subtransaction | Prevents uncertain retries from duplicating effects and prevents a multi-row error from committing a partial draft/audit record |
| L-41 | Publish-readiness UI consumes the same database helper used by publish for P-18 and structured-code boundary counts; UI may warn earlier but never replaces the final DB invariant | Prevents duplicated business rules from drifting between browser and database |
| L-42 | Private create/apply/publish/restore functions carry bounded runtime lock and statement timeouts; a timeout is an uncertain transport outcome and the client retries with the same request ID | Keeps concurrent admin operations bounded without weakening idempotency |
| L-43 | Operator-facing Master Catalog forms are Thai-first, contain no rehearsal-only default evidence, separate draft save from whole-version publish, and keep support IDs available without making them primary content | Owner review found the technically safe Local UI confusing; WP-6.6 must close comprehension before WP-7 |
| L-44 | A capability is complete only when its exact route/UI, selected entity, Server Action, RPC/schema authority, audit/correction path, readiness/export effect, tests, and operator procedure are implemented or explicitly not applicable | Prevents a safe DB rejection or a passing component test from being mislabeled as an end-to-end operator workflow; [Audit #29](./29-phase4-owner-dev-completeness-audit.md) |
| L-45 | Ordinary item/import mutation resolves only Production-derived approved versioned categories and P-06 code groups, and uses a server-owned next-never-issued code allocator; creating future taxonomy is separate governance | Prevents free-form caller text or suffix choice from becoming catalog authority |
| L-46 | Phase 4 publication derives the publisher actor snapshot from authentication, requires a version-level physical archive reference, and exposes the same stale-base/full-quality readiness result consumed by final publish | Prevents spoofed provenance, missing manual-only filing custody, and false-green UI readiness |
| L-47 | Draft correction uses explicit audited `reactivate` and base-absent `withdraw`; identity, code reservation, and prior audit are never deleted | Gives admins a safe correction path without direct SQL or destructive undo |
| L-48 | At most one mutable `draft` may exist per `based_on_version_id`; stale and explicitly `abandoned` drafts remain immutable read-only history, and replacement requires an audited abandon rather than delete/archive reuse | Matches the intended one-release-workspace V1 while preserving stale/pointer-restore history and database-enforced concurrency safety; [P-22 plan](./31-phase4-wp66-operator-workflow-correction-plan.md) |
| L-49 | Before publication, the admin reviews an authoritative final snapshot diff of the selected draft against its exact base; review carries the expected lock into publish, and any later mutation forces a fresh review | Prevents publication from preceding catalog inspection without inventing a second-person approval engine; final publish still rechecks readiness/hash in the database |
| L-50 | Draft creation requires explicit ADR-003 annual/revision/patch business intent; the UI plans from a complete all-status version registry and the guarded DB path enforces the next reserved number | The system cannot infer business authority from the current number, and an active admin must not type or guess raw version segments |
| L-51 | Every created catalog version number remains reserved after abandon. For an owner-designated future year whose lower identifiers were reserved, the next annual candidate uses that same year, the next revision, and patch `0`; it is annual relative to the older-year base | Preserves immutable audit/no-reuse without making a cancelled `{year}.0.0` block a truthful catalog for that effective year |
| L-52 | Annual effective year is limited to base year +1 through +10, enforced consistently by UI, Server Action, and private DB transition validation | Prevents accidental or unreviewed far-future catalogs while keeping a practical planning horizon; extension requires an explicit business/ADR change |
| L-53 | Stale-sequence and annual-range failures use allowlisted stable codes with Thai operator messages; raw code/request identifiers are collapsed support details and the error remains focused across registry refresh | Gives admins a recoverable explanation without leaking backend text or losing the message during automatic refresh |
| L-54 | Production `2568.0.0` authority copy is first-rollout context, not a permanent generic label; Factor F stays secondary and outside Master Catalog workflow metrics | Prevents future-version reviewers from being shown stale authority wording and avoids reopening the completed separate Factor F workflow |
| L-55 | A successful create opens the exact draft workspace; items/actions precede detailed document metadata; pointer restore requires current-to-target confirmation and explains that historical BOQs retain their saved version | Keeps the admin flow aligned with the release workspace and adds a human safety barrier around the separate recovery operation |
| L-56 | High-impact Master Catalog actions require a separate human-intent confirmation: Recode and Retire show exact item/target/reason/impact, while Publish shows current/target version, reviewed lock, item count, BOQ effect, and requires the exact target version typed by the admin and revalidated against the DB-read version in the Server Action before the publish RPC | Reduces preventable mis-clicks without duplicating database integrity rules or adding a multi-stage approval engine; exact locks, readiness, idempotency, and RPC invariants remain authoritative |
| L-57 | P-33 technical acceptance does not equal placement UX or release acceptance. WP-8/P-14 require truthful accepted-versus-locally-dirty state, recoverable pending choices, review-by-exception, complete impact summary, keyboard-complete non-drag controls, measured 710-row plus realistic-new-batch performance, and independent intended-admin completion without developer/SQL help | Prevents a safe database mechanism or implementer-driven browser proof from being mislabeled as an operationally safe Add/Supplement workflow; arbitrary inherited-row reorder remains outside V1 |
| L-58 | P-34 source/static completion does not equal WP-8 completion. Add/Supplement stays disabled until a separately approved clean Local rehearsal proves the integrated chain, realistic placement interaction scale, accessibility/recovery behavior, and independent intended-admin comprehension | Preserves evidence provenance and prevents passing source tests/build from silently authorizing a destructive reset, feature release, or Production progression |
| L-59 | P-35 repository/bootstrap source integration is non-destructive and cannot authorize P-36 execution. The exact integration checkpoint must be committed and pushed before the owner receives the reset warning and decides P-36; P-37 acceptance follows only after all live, advisor, performance, accessibility, recovery, and independent-UAT evidence is current | Separates reviewed source provenance from destructive execution and final acceptance, preserving a reliable stop point if the integrated runtime gate fails |
| L-60 | Browser route-render/semantic evidence is not interaction acceptance when the automation runtime cannot dispatch the application's client state changes. Preserve the technical measurements, name the tooling boundary, and require independent intended-admin keyboard/pointer/recovery UAT before P-37 | Prevents a green route screenshot or RPC-created accepted state from being mislabeled as proof that the operator can safely complete the live workflow |
| L-61 | P-37 technical stale-lock rejection, one-batch acceptance, exact-request replay, accepted-state readback, and audited cleanup may close their named engineering gates without closing intended-admin keyboard or leave/reload recovery UAT | Preserves useful Local safety evidence while preventing an automation limitation or RPC-driven accepted state from silently becoming owner usability acceptance |

## 3. Pending owner/data decisions

P-01 authorizes only local implementation/rehearsal of the reviewed
architecture and contracts. It did not itself resolve P-02 through P-22; the
current recorded resolutions below refine that original approval. Work may
continue on generic additive schema, parser/canonicalizer, UI, tests, and local
fixture rehearsal while remaining decisions are pending, but final approved
data backfill, candidate freeze, export acceptance, Production migration,
feature enablement, and publication must stop at the stated gates until the
relevant pending decisions are recorded.

Analysis memos and quick-decision guides may recommend outcomes, but they do
not become authority until the owner records the exact outcome and evidence in
this register. In particular:

- P-02 approved retaining both `ITEM-0131` and `ITEM-0139` in `2568.1.0`;
  `ITEM-0139` is only a future-retirement candidate under the recorded
  evidence gates.
- P-03 approved splitting HDPE Crossing into `CRS-H06`/`CRS-H08` and rejecting
  the prior HDPE-as-GIP classification.
- P-06 approved the 22/65 group meanings for backfill with the `ITEM-0139`
  temporary-legacy safeguard. Publication still requires the remaining
  publication gates.
- P-07 approved using Production `ITEM-0491` wording for canonical
  `FTW-CON-002`; the workbook row is a typo shadow, not a separate supplement
  candidate.
- P-08 approved truthful legacy `2568.0.0` baseline metadata: effective date
  `2026-01-01`, approval reference `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`,
  and publisher snapshot `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`.
- P-09 approved only as a limited reservation of candidate draft/rehearsal
  version string `2568.1.0`; candidate effective-date, approval, filing,
  final-hash, and publish authority remain pending.
- P-10 approved the limited runtime NT font/logo derivatives listed in
  [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); original `/CI/`
  source assets remain local-only.
- P-11 approved the field-facing export visual direction for implementation:
  A4 portrait PDF price list, no dedicated item-code column in the main PDF
  price table, exact Thai title `รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`,
  `หน่วยนับ` as the PDF item-unit column label,
  `(หน่วยเงิน: บาท)` as a repeated right-aligned note above the PDF price
  columns, price-disclaimer watermark wording/style matching
  `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf` and the exact
  three-line owner-provided wording recorded in the export spec, footer as
  department / page `x/y` / version-status or
  version-effective-date, no truncated SHA-256 in the PDF footer, no technical
   verification page appended to the field-facing PDF, and QR code deferred as
   post-Core polish unless a stable owner-approved verification URL exists.
   The editable Excel workbook uses `TH Sarabun New` on every populated cell
   with a 16-point body baseline and larger title hierarchy; the PDF retains
   embedded NT runtime fonts. The owner accepted the exact replacement
   database-generated Excel/PDF pair from `777df75` on 2026-07-11 22:20 +07;
   WP-6/P-11 is complete while Production filing remains a separate P-15 gate.
- P-12 through P-15 remain normal sequential Production gates after WP-8. Do
  not combine Production gates by default; pause for owner/verifier readiness
  review after local rehearsal, then request each Production decision only when
  its evidence is complete and green.
- P-18 records an owner-identified governance gap discovered during WP-6
  artifact review: new/supplement items must not become official merely by
  being appended to the end of the catalog. The current Phase 4 Core contract
  has a mechanical `max(display_order) + 1` default and no placement UI; that
  remains the implemented baseline until WP-7.5 is technically accepted. Do
  not publish a version containing added/supplement rows unless its current
  placement revision has an accepted review or the add/supplement publish path
  remains held.
  Phase 4 inserted WP-6.5 to harden this boundary with a
  publish-time guard. WP-6.5 also hardens the P-06 structured-code legacy
  exception so only `ITEM-0139` may remain active as `ITEM-####` in
  `2568.1.0`. These guards are safety holds, not substitutes for the later
  placement/review workflow or final P-15 owner approval. The 2026-07-12 plan
  capability audit inserted WP-6.6 before WP-7, then proposed WP-7.5 for new
  identities only while preserving inherited relative order. P-30 accepted
  that exact five-rule V1 contract on 2026-07-15; P-32 Local evidence then
  passed and P-33 accepted the exact bounded technical checkpoint. The separate
  WP-8/P-14 UX, performance, and intended-admin release gates remain pending in
  [Review Note #28](./28-phase4-p18-placement-governance-review-note.md).

| ID | Decision required | Current evidence/default recommendation | Owner | Due before | Status |
|---|---|---|---|---|---|
| P-01 | Approve ADR-004, Change Request, architecture Revision 8, DB/security contract, threat model, parser/hash spec, export spec, Post-Factor-F adjustment plan, and Implementation Execution Pack for implementation/local rehearsal | Approved together after owner review; this does not authorize Production migration, deploy, enablement, publication, or P-02 through P-15 data/records/visual decisions | Owner | Phase 4A implementation | Approved 2026-07-04 |
| P-02 | Decide whether `ITEM-0131` and `ITEM-0139` remain justified distinct items or which erroneous duplicate is retired in the candidate | Retain both as distinct valid items in `2568.1.0`. `ITEM-0139` is only a future-retirement candidate if live preflight confirms BOQ refs = 0 and the data custodian/owner confirms it is the erroneous duplicate; UUID/history merge remains prohibited and any future correction must be retire-only. | Owner + data custodian | Candidate reconciliation freeze | Approved 2026-07-04 |
| P-03 | Approve corrected canonical groups/codes for 16 HDPE Crossing rows | Reject `CRS-GIP-018` through `CRS-GIP-033` as GIP classifications; split HDPE Crossing into `CRS-H06` and `CRS-H08` as taxonomy recodes only. Preserve Production names, units, prices, identities, and BOQ history; defer workbook-only `CRS-GIP-025` under P-05; handle retained `ITEM-0139` under P-04; K fields remain excluded and draft code names/sequences may still be corrected before publication. | Owner + engineering data custodian | Candidate code freeze | Approved 2026-07-04 |
| P-04 | Assign/approve canonical codes and groups for 20 Production-only rows | Retain all 20 Production-only rows; assign canonical codes to 19 rows (`FTW-CON-002`, `CIC-H06-001` through `CIC-H06-010`, `JNT-PVC-013`, `RSR-PL0-040` through `RSR-PL0-046`); keep `ITEM-0139` as temporary legacy code under P-02 controls. Preserve Production names, units, costs, identities, and BOQ history; add no workbook-only rows. | Owner + data custodian | Candidate 710-row freeze | Approved 2026-07-04 |
| P-05 | Decide disposition of 18 workbook-only evidence rows | Raw workbook evidence remains 18 rows, but P-07 resolves workbook `FTW-CON-002` as a typo shadow of Production `ITEM-0491`, not a separate supplement candidate. Defer the remaining 17 unresolved workbook-only rows from `2568.1.0` and open a separate supplement intake. They are future candidates only until item authority, price authority, corrected taxonomy/code allocation, owner/data-custodian approval, import preview/reconciliation, and dataset-hash/publish verification are recorded. Default target for a true new supplement is `2568.2.0` unless approved evidence classifies the change differently under ADR-003. `CRS-GIP-025` must not publish as GIP. | Owner | First structured candidate freeze | Approved 2026-07-04 |
| P-06 | Approve all 22 work-context (`AAA`) and 65 item-type (`AAA-TTT`) group meanings | Approve the 22 `AAA` and 65 `AAA-TTT` group meanings for code-group dictionary/backfill/implementation. This is not import approval, row-count approval, workbook-only approval, K-mapping approval, or P-07 wording correction. Approve revised main codes `DRL→COR`, `FND→PAD`, and `FTP→FTW`. `ITEM-0139` is an approved temporary legacy-code exception for `2568.1.0` only; DB/publish validation must allow `code_group_id is null` only for that row and assert no other active structured-version row has a null group. If that cannot be audited, stop and return to owner; developers must not infer a canonical code. | Owner + engineering data custodian | Code-group backfill | Approved 2026-07-04 |
| P-07 | Approve correction of repeated Thai phrase in workbook `FTW-CON-002` | Use Production `ITEM-0491` wording for canonical code `FTW-CON-002`. Reject the workbook-only repeated-phrase row as a typo shadow, not a separate candidate; do not import workbook wording, do not create a duplicate item, and do not touch `ITEM-0491` identity/history because snapshot evidence shows 8 BOQ references. Any whitespace-only Production wording cleanup requires a separate wording correction/change request. | Owner | Candidate scope freeze | Approved 2026-07-04 |
| P-08 | Provide truthful baseline publication metadata for legacy `2568.0.0` | Approve legacy baseline metadata for `2568.0.0`: `effective_date = 2026-01-01` (`1 มกราคม 2569`), `approval_reference = เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`, `approval_document_date = 2025-11-27` (`27 พฤศจิกายน 2568`), and `published_by_display_name = ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`. `published_at`, `item_count`, and `dataset_hash` must be generated by trusted migration/backfill code; do not invent a historical publish timestamp or reuse any Factor F approval reference. | Owner/records custodian | Validate Phase 4 publication-completeness constraint | Approved 2026-07-04 |
| P-09 | Approve exact candidate version, effective date, approval reference, and physical archive reference | Limited approval only: reserve `2568.1.0` as the candidate draft/rehearsal version string for the Master Catalog Phase 4 structured-code rollout. This does not approve the candidate business `effective_date` (which is owner-designated and not automatically the publish/deploy date), `approval_reference`, `approval_document_date`, `physical_archive_reference`, approver/publisher snapshot, final diff/count/hash, Production publication, or P-15. Those values must be approved after candidate freeze, verification, release-note/export filing evidence, and final owner review. | Owner | Candidate draft/publish rehearsal | Partially approved 2026-07-04; publication metadata pending |
| P-10 | Approve which NT fonts/logo derivatives may be committed and deployed | Approved limited runtime CI asset scope for Master Catalog Phase 4. Owner confirms the project has rights to use all supplied NT CI assets under `/CI/` for NT business operations, including fonts, logos, guidelines, and supporting graphics. Repository/deployment approval is limited to `app/fonts/nt/NT-Regular.woff2` from `CI/NT Regular.ttf`, `app/fonts/nt/NT-Bold.woff2` from `CI/NT Bold.ttf`, `public/brand/nt/nt-logo-primary.png` from `CI/NT_1_v3.png`, and `public/brand/nt/nt-logo-company-lockup.png` from `CI/NT_4_v3.png`. Original `/CI/` source files remain local-only; existing `public/nt_logo.svg` and `public/nt_logo.png` must be replaced by approved derivatives or explicitly retained with source/provenance evidence. Implementation must follow [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md). P-11 replacement artifact acceptance was recorded on 2026-07-11; remaining app-wide asset cleanup stays under P-10. | Owner/brand custodian | Phase 4B UI implementation | Approved 2026-07-04 |
| P-11 | Approve the official Excel/PDF visual sample and field order | Direction approved for implementation: official human-facing PDF uses A4 portrait price-list layout and title `รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`; the main PDF table shows sequence, item description, counting unit, material cost, labor cost, and total unit price; PDF item-unit column label is `หน่วยนับ`; `(หน่วยเงิน: บาท)` appears as a repeated right-aligned note above the PDF price columns; field-facing PDF price pages, including the published Production PDF, must use the price-disclaimer watermark wording/style from `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf` and the exact three-line owner-provided wording recorded in the export spec; this watermark is not a Draft/Preview status mark; `item_code` is not a dedicated PDF table column; Excel remains the full 13-column canonical/business export with visible `ข้อมูลตรวจสอบ`; footer shows department, page `x/y`, and right-side version/status or version/effective-date text using the examples recorded in the export spec; no truncated SHA-256 in the field-facing PDF footer; no technical verification page in the final field-facing PDF; QR code is deferred unless a stable owner-approved verification URL exists. Owner refinement 2026-07-10: the PDF summary shows only organization, catalog version, Thai status, effective date, item count, and full dataset hash. It excludes technical `Current Default`, approval reference/date, approved-by/publisher, exported-at/by, generated-by, and export-spec fields. A non-current published version instead carries a plain Thai retrospective-reference warning. The excluded values remain in Excel metadata and the release/filing manifest. Owner refinement 2026-07-11 21:49 +07: the editable Excel export uses `TH Sarabun New` on every populated cell with a 16-point body baseline and larger title hierarchy; the PDF retains embedded NT runtime fonts. The exact replacement pair from `777df75` passed semantic, typography, five-sheet workbook, 19-page PDF, and unchanged Local readback checks. At 22:20 +07 the owner confirmed `รูปแบบ pdf excel ok เลยครับ`, accepting those exact Local binaries as final P-11/WP-6 artifact evidence. This does not approve Production filing, migration, deploy, enablement, publication, P-18/P-19, or Factor F changes. | Owner | Export implementation acceptance | Accepted 2026-07-11 22:20 +07; WP-6 complete; Production filing remains separate |
| P-12 | Approve the named Production migration window | Request only after WP-8 evidence review is complete: Local evidence green, remote migration ledger includes hotfix `016`, clean Local bootstrap has applied `009`-`015`, `016`, and Phase 4 `017+`, fresh read-only Production baseline and schema drift check match, backup/restore evidence complete, P-20 portability and reviewed migration fingerprint match, live DB/RPC/RLS/concurrency and permanent BOQ/Factor F regressions pass, advisors have no unresolved blocker, and owner gives go/no-go for the actual window. | Owner | Production migration | Not requested; request after WP-8 evidence review |
| P-13 | Approve application deploy and admin-only smoke window | Request only after P-12 migration verification passes, CI/deployment fingerprint matches, current user flows and Factor F/BOQ invariants remain unchanged, and the Phase 4 feature flag stays disabled by default. | Owner | Production deploy | Not requested; request after migration verification |
| P-14 | Approve feature enablement | Request only after P-13 deploy and admin-only smoke pass, authorization/UI/accessibility/error-recovery checks, intended-admin UAT, reusable ADR-003 version evidence, structured logs, performance baseline, and non-admin denial tests pass. Enable admin scope only; do not publish a catalog version under P-14. | Owner | User visibility | Not requested; request after deploy/admin smoke verification |
| P-15 | Approve publication of the exact named catalog version and its final diff/count/hash | Migration/deploy/enablement approval does not imply publish approval. Requires WP-6.6 capability evidence, exact final version metadata, effective date, approval reference/date, version-level physical archive reference, authenticated publisher snapshot, final diff totals, item count, P-20-compliant dataset hash, tracked-verifier official Excel/PDF evidence, stable request-ID/concurrency evidence, WP-6.5 P-18 add/supplement guard evidence when relevant, WP-6.5 structured-code exception guard evidence, P-19 inactive-row export policy when relevant, and owner go/no-go. | Owner | Production publication | Not requested |
| P-16 | Schedule Supabase legacy API-key migration | Separate maintenance change; complete before provider retirement and after inventory/rehearsal | Owner + developer | Separate security window | Pending |
| P-17 | Record completed Factor F F0-F4 gates before Master Catalog Phase 4 | Completed before Master Catalog Phase 4. ADR-005 and the separate Factor F CR governed the rollout; current baseline from `FACTOR F 2566_7.PDF` is active as `2566.0.0`, the 26 June 2026 source-table annex is current default `2569.0.0`, legacy BOQs were not backfilled, and `015` repaired only missing legacy snapshot metadata without repricing or binding old BOQs. Production hotfix `016` followed as a BOQ save regression fix, not a Factor F publication. | Owner + factor data custodian | Before Master Catalog Phase 4 Production migration | Completed 2026-06-29; hotfix follow-up 2026-07-06; see Factor F closeout and migration ledger |
| P-18 | Decide display-order placement governance for newly added or supplement catalog items | Keep the proven DB hold until a supported workflow passes. Accepted V1: place only identities absent from the base; choose category plus same-category before/after anchor; confirm all pending rows in one audited batch; one active admin/data custodian may confirm under the existing publisher model; preserve inherited base relative order; arbitrary reorder remains a separate CR. Implement through append-only migration `021`, DB placement revision/review, exact RPC/RLS/audit/concurrency controls, Thai UI, and WP-8 UAT. See [Review Note #28](./28-phase4-p18-placement-governance-review-note.md). | Owner + data custodian | Before WP-7.5 implementation, before P-14 full Add/Supplement enablement, and before P-15 for any version with new identities | Accepted via P-30; P-32/P-33 technical scope and P-36 integrated technical rehearsal passed; independent intended-admin WP-8/P-14 release evidence and Production remain separate |
| P-19 | Decide official export/rendering policy for inactive or retired catalog rows | Excel already carries `ใช้งาน` / `ยกเลิกใช้`, but the field-facing PDF price table intentionally omits the status column for the baseline visual direction. Before publishing any version with inactive/retired rows, owner must approve whether the official PDF excludes retired rows, visibly marks them, or uses a separate appendix. Until then, do not file a field-facing PDF for such a version as final. | Owner + data custodian | Before P-15 for any version with inactive/retired rows | Pending; recorded 2026-07-07 |
| P-20 | Decide the cross-environment canonical hash/identity portability contract | Approved contract: initialize each legacy baseline `catalog_item_identities.id` directly from its existing immutable Production-derived `price_list.id`, then keep `identity_id` in the canonical lineage hash. The restored public snapshot carries explicit `price_list.id` values, so clean environments using the same approved snapshot have the same deterministic identity mapping. Migration `017` fails closed on nulls, duplicate/colliding mappings, incomplete coverage, or a pre-existing non-deterministic assignment; repeated execution does not replace an assigned identity. Do not introduce a second business-content hash, silently remove identity, or accept environment-specific hashes as equivalent in Phase 4. The tracked comparator first passed two owner-approved independent clean rebuilds on `1ad01b9`; the pre-P-22 `020` candidate also passed two inputs on `3bfc74e`. Final G1R/G2 on `721c2c2` reproduced the same 710-row dataset and identity hashes for the P-24 candidate and the comparator passed with no failures. P-36 then reproduced the same dataset and identity mapping after the integrated chain through `021`. | Owner + database/data-governance reviewer | Initial implementation before WP-6.5 exit (passed); amended-candidate G2 comparison (passed); integrated P-36 rerun (passed); final P-15 hash acceptance remains separate | Approved contract; final G1R/G2 comparison and P-36 integrated rerun passed; P-15 acceptance pending |
| P-21 | Approve the exact WP-6.6 capability-completeness scope, Local-only implementation, and closeout | Approved Audit #29, later extended through C-17 and Execution Pack slices A-L by P-22/P-23/P-23.1/P-24/P-26. Preserve bounded WP-6.5 evidence, use fix-forward candidate `020`, keep bootstrap at `017`-`019` until owner closeout, and hide unsupported release controls. Earlier Local evidence remains historical after each candidate amendment. Review [WP-6.6 Owner Review Note](./30-phase4-wp66-owner-review-note.md) for the recorded closeout. Acceptance does not approve P-18/`021`, WP-7 execution, Factor F workflow changes, hotfix expansion, or Production. | Owner + developer | Closeout before WP-7 starts | Complete via P-27; G3/WP-6.6 accepted on exact `78e96ab3ed9993707014c4aba1d285b7592b17a1` at 2026-07-14 23:50 +07 |
| P-22 | Approve the WP-6.6 operator workflow correction for one current-base working draft, audited abandon, full searchable item-first workspace, and authoritative pre-publish snapshot comparison | Accept [Doc #31](./31-phase4-wp66-operator-workflow-correction-plan.md): one mutable draft per base enforced in candidate `020`; stale/abandoned versions remain read-only; final diff compares database snapshots by identity and carries the exact lock into the existing one-publisher publish path. Amend the unaccepted Local-only `020`, supersede its old evidence, and rerun only after separate reset approvals. Do not create a multi-stage approval engine or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before revised WP-6.6 closeout and before WP-7 | Final G1R/G2/P-25/G3/P-26 path accepted via P-27; later gates remain separate |
| P-23 | Approve the bounded P-22 operator-context/navigation amendment | Preserve signed-in admin identity and account actions in the Master Catalog shell; use global destinations `บัญชีปัจจุบัน`, `ทะเบียนฉบับ`, and `ประวัติการเปลี่ยนแปลง`; move import into the exact draft workspace at `/versions/{versionId}/import`; remove the second draft selector; distinguish review-only Excel/PDF exports from the approved source-workbook import contract; use an iterative workspace rather than a one-way wizard, with a three-state import sub-flow; show `Local` only from the explicit Local environment setting. Reuse existing server reads/actions/RPCs, expected locks, idempotency, authority, and final review. Do not build a round-trip spreadsheet editor, add approval roles, or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before amended candidate closeout | Approved 2026-07-13; first working-tree checkpoint passed and is retained as historical pre-P-23.1 evidence |
| P-23.1 | Approve explicit version intent/reserved sequence and the final create/item/restore flow correction | Require annual/revision/patch business intent and owner-designated annual year; plan from a complete all-status registry; permanently reserve every created number; DB enforces the next lane sequence after replay handling and permits the next patch-0 annual revision when lower target-year identifiers are reserved. Open the exact created draft, place items before detailed metadata, and confirm current/target plus BOQ effect before restore. Amend still-unaccepted `020`; do not reset Local or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Repository/static before G1R; G1R before independent G2/G3 | Approved and repository/static-passed on exact commit `31fd689` on 2026-07-13; no reset approved; superseded as the G1R fingerprint by P-24 |
| P-24 | Approve bounded pre-G1R business/UX hardening of the P-23.1 candidate | Enforce annual base +1 through +10 in UI/server/DB; add safe stable stale/range messaging; keep errors visible and focused while registry data refreshes and after identical retries; collapse support identifiers; remove internal workflow labels from operator copy; contextualize first-rollout authority; keep Factor F secondary. Distinguish final execution `HEAD`, implementation lineage, and migration SHA in evidence. Amend still-unaccepted `020`; do not reset Local or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Repository/static, same-scope closure, and clean exact commit before G1R | Approved; base `88d0711` and closure `050c998` preserved; final G1R/G2 passed on exact `721c2c2`; G3 closeout accepted via P-27 on exact `78e96ab` |
| P-25 | Approve bounded high-volume final-review scanability before G3 closeout | Keep the existing identity-based complete snapshot diff and exact reviewed-lock publication contract. Make one-field changes compact and immediately visible; summarize compound rows with explicit expand/collapse and expand-all-on-page controls; make overlapping summary counts explicit and directly filterable; preserve search/filter/page-size/page context through exact-item edit; support 50/100 rows and direct page selection; render a stacked mobile list instead of requiring horizontal table scrolling. Require Local visual/interaction evidence for an eight-field compound row and the expected 709-change rollout scale before G3 acceptance. Do not add a data-grid dependency, DB migration, approval role, new export contract, Local reset, Production action, P-18/P-19/WP-7/Factor F, or hotfix scope. | Owner + developer | Before G3 intended-admin acceptance | Approved 2026-07-14; bounded visual and real-route evidence accepted through P-27 |
| P-26 | Approve bounded high-impact human-intent guards before G3/WP-6.6 closeout | Preserve database-owned locks, readiness, idempotency, audit, and publish invariants. Add exact summary-and-confirm dialogs for Recode and Retire. Publish requires the admin to type the target version; the Server Action reads the authoritative version string from `price_list_versions`, compares it using the shared stable error contract, and does not call the publish RPC on mismatch. Include responsive/cancel/no-write Local proof. Do not change migration `020`, reset Local, publish a version, add approval roles, or cross P-18/P-19/WP-7/Factor F/hotfix/Production boundaries. | Owner + developer | Before explicit G3/WP-6.6 accept/hold | Approved and committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; no-reset Local proof passed and P-27 accepted G3/WP-6.6 |
| P-27 | Accept the exact G3/WP-6.6 operator closeout checkpoint | Accept C-01 through C-17 based on final G1R/G2 DB evidence, P-25/G3 stale-review evidence, P-26 confirmation/cancel/cleanup evidence, and exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`. Preserve WP-8 independent UAT/accessibility/performance and advisor disposition. This decision does not authorize G4, a Local reset, adding `020` to bootstrap, WP-7, P-18/`021`, P-19, WP-8 execution, feature enablement, publication, Factor F/hotfix expansion, or Production. | Owner | WP-6.6 closeout before G4/WP-7 | Accepted 2026-07-14 23:50 +07; WP-6.6 complete; G4 and all later gates remain separate |
| P-28 | Approve G4 repository integration and WP-7 harness source without destructive execution | Add unchanged owner-accepted `020` after `019` in `scripts/bootstrap-local-db.sh`; align migration/provenance/authority contracts; add a fail-closed Local-only WP-7 harness for hotfix suffixes, catalog authority, rollback/role/version boundaries, BOQ duplicate/selected-Factor-F copy, print/export data modes, publish/restore, and BOQ/Factor F/security before-after invariants. Do not run bootstrap or the live harness until the exact source checkpoint and separate reset approval are recorded. | Owner + developer | Before the first clean `009`-`020` bootstrap and live WP-7 evidence | Approved 2026-07-15 for repository/source work only; G4 clean execution and live WP-7 remained pending at this point and were later decided under P-29 |
| P-29 | Authorize the destructive G4E clean Local execution and live WP-7 evidence | Reset only Local Supabase from exact pushed checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; apply canonical `009`-`015`, hotfix `016`, and Phase 4 `017`-`020`; run WP-6.6, WP-6.5/P-20, WP-7, lint/advisors, repository gates, and final invariant cleanup. Do not touch Production, start P-18/`021` or P-19, run WP-8 UAT, add a Factor F workflow, or expand hotfix `016`. | Owner + developer | After G4R source was committed/pushed and before the first combined clean execution | Approved and executed 2026-07-15; combined bootstrap and all named technical evidence passed; WP-7 owner accept/hold and later gates remain separate |
| P-30 | Accept WP-7 and authorize the five-rule P-18/WP-7.5 Local-only source implementation | Accept P-29/G4E as WP-7 technical closeout; implement placement only for identities absent from the base, using category plus same-category before/after anchor, one audited batch, the existing one-admin publisher model, and preserved inherited relative order. Keep Add/Supplement disabled until `021` and the supported workflow pass. Do not reorder inherited rows arbitrarily or cross P-19, WP-8 reset/evidence, Factor F, hotfix expansion, feature enablement, publication, or Production boundaries. | Owner + developer | Before creating the reviewed `021` candidate and WP-7.5 application/tests | Approved 2026-07-15 01:37 +07; WP-7 complete and WP-7.5 Local-only source work authorized; no reset or Production action authorized |
| P-31 | Accept the exact WP-7.5 Source/Static checkpoint for commit/push | Accept checkpoint `4e3574a31a2697f4d727acabc8f55f34a4233bff`, migration `021` SHA-256 `78359215f7d859d9c167db608e1e96d66712b6b06a9d103fd7b26ce781835a83`, and the recorded repository/static checks. Keep `021` outside bootstrap and unapplied until a separate warned Local gate is approved. | Owner + developer | After repository/static review and before Local reset/apply/live evidence | Approved 2026-07-15 10:24 +07 for exact tracked checkpoint commit/push only; Local DB/browser evidence, bootstrap inclusion, WP-8, Production, and adjacent domains remain separate |
| P-32 | Authorize warned WP-7.5 Local apply/live evidence and same-scope fix-forward | Reset only Local, bootstrap through `020`, apply `021` separately, run role/rollback/race/hash/export/browser evidence, restore pointer/flags/drafts, and correct defects found within the accepted placement contract. Keep `021` outside bootstrap; do not start WP-8/P-19 or touch Factor F/hotfix/Production. | Owner + developer | After P-31 and before WP-7.5 technical closeout | Approved and executed 2026-07-15; same-scope fix-forward SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` passed replacement DB/browser/export evidence and clean final invariants |
| P-33 | Accept or hold the exact WP-7.5 technical checkpoint | Accept the P-32 clean-chain evidence, amended `021` fingerprint, 713-row hash/export parity, real Thai desktop/mobile placement/final-review flow, audited abandon, and final invariant cleanup. Acceptance closes WP-7.5 technical scope only. Truthful dirty state, review-by-exception, keyboard equivalence, measured scale, and independent intended-admin comprehension remain hard WP-8/P-14 gates; bootstrap inclusion, WP-8 execution, P-19, P-14/P-15, and Production remain separate decisions. | Owner | After P-32 evidence and before WP-8/bootstrap progression | Accepted 2026-07-15 13:54 +07 for the exact bounded technical checkpoint; WP-7.5 technically complete; no bootstrap, WP-8, feature, publication, or Production authorization inferred |
| P-34 | Authorize and accept the bounded WP-8 placement UX source/static checkpoint | Implement truthful accepted-versus-dirty state from local assignment changes, versioned recoverable browser choices and guarded supported navigation, direct suggested/modified/incomplete/invalid filtering and counts, standards-complete keyboard radio behavior, deferred/memoized list work, and final affected-category/immediate-neighbor impact review. Accept exact source checkpoint `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` only after repository checks pass. Keep `021` outside bootstrap and preserve separate destructive Local rehearsal, measured browser/accessibility evidence, intended-admin UAT, P-14, and Production decisions. | Owner + developer | After P-33 and before any WP-8 reset/bootstrap/live gate | Authorized and source/static-passed 2026-07-15; historical source checkpoint only. The first P-37 intended-admin UAT later rejected its direct anchor/relation presentation; the bounded insertion-gap correction in [Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md) preserves the accepted DB contract and awaits re-UAT. |
| P-35 | Authorize exact `021` bootstrap repository integration without destructive execution | Add unchanged amended `021` SHA-256 `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` after `020` in the canonical Local bootstrap source; align current authority/operator documents, provenance metadata, and executable consistency tests; run repository/static verification; commit and push the exact source checkpoint. Do not run bootstrap, reset or write Local, change feature flags, run live WP-8 evidence, decide P-19, change Factor F/hotfix scope, publish, or touch Production. | Owner + developer | After P-34 and before P-36 | Approved and source/static-passed 2026-07-15 on exact checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`; P-36 remained separately gated and later passed |
| P-36 | Authorize one destructive integrated WP-8 Local reset and live evidence run | From the exact pushed P-35 checkout, warn that `npm run db:local:bootstrap` resets all Local Supabase, then apply `009`-`015`, hotfix `016`, and Phase 4 `017`-`021`; run integrated DB/RLS/concurrency/P-20/WP-7/WP-7.5/export/advisor/browser/accessibility/performance/recovery evidence and restore the disabled clean baseline. | Owner + developer | After P-35 source checkpoint is pushed | Approved and technically passed 2026-07-15 on exact gate/execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; Local only; interaction/UAT acceptance remains P-37 |
| P-37 | Accept or hold WP-8 and the Production-readiness package | Review exact P-36 execution provenance, clean final invariants, realistic-scale evidence, intended-admin UAT without developer/SQL assistance, advisor disposition, tracked export verification, and authority consistency. Acceptance permits only a later P-12 request; it does not authorize Production migration, deploy, enablement, or publication. | Owner | After every WP-8 exit gate passes | **HOLD retained 2026-07-17/18:** the first no-reset intended-admin session failed comprehension before any placement confirmation. The insertion-gap correction later passed technical stale/accept/replay/accepted-state/cleanup evidence and post-evidence repository checks, but owner keyboard/leave-reload re-UAT, exact commit/push provenance, and explicit acceptance remain. See [Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md). |

### P-11 cover-layout refinement (2026-07-10, revised 2026-07-11)

The owner further refines the field-facing PDF cover: use a larger top-centered
NT company lockup, then the document title and a distinct `ประจำปี {catalog
year}` title-level line of the same size and weight, with one centered
upper-middle metadata table containing
only `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full
dataset hash. Do not repeat version/status in the header or company identity in
the table. For presentation parity, Excel user-facing sheets use the same
`ฉบับบัญชีราคา` terminology and separate equal-size title/year lines; canonical
verification identifiers remain unchanged. Approval/publisher/export data remain
in Excel metadata and release/filing evidence, and the catalog dataset hash
remains unchanged.

### P-11 staged acceptance and WP-6.5 authorization (2026-07-11)

The owner accepts the P-11 visual/content direction reviewed through the final
PDF terminology/title hierarchy and later refines the editable Excel workbook
to TH Sarabun New with a 16-point body baseline. The `edf3570a` pair is
superseded by that font decision and was never filed or accepted as final. The
exact replacement pair from `777df75` now passes WP-6.5E technical evidence;
at 2026-07-11 22:20 +07 the owner confirmed `รูปแบบ pdf excel ok เลยครับ`.
P-11 and WP-6 are complete for Local artifact evidence. This acceptance does
not file the artifacts in Production or approve any Production gate.

The earlier owner authorization allowed WP-6.5 Local-only work to start while
final binary acceptance was pending and remains in force after P-11 closeout.
It includes P-20 implementation and the tracked verifier, but it does not
authorize a Local Supabase reset
without advance notice, any Production access/write, Factor F workflow change,
hotfix `016` scope expansion, placement/reorder UI, add/supplement publication,
deploy, enablement, or catalog publication.

## 4. Deferred decisions

| ID | Deferred item | Reconsider when |
|---|---|---|
| D-01 | K-formula governance/schema/import/export | Named owner, approval source, calculation semantics, and versioning contract exist |
| D-02 | BOQ Rebase UI | Phase 4 Core stable identity has completed one stable Production cycle |
| D-03 | Additional parser profiles/free-form mapping | A second approved recurring format creates measured need |
| D-04 | Server pagination/virtualization | A version crosses 2,000 rows, catalog-read payload crosses 1 MB, or measured UI performance fails |
| D-05 | Remove compatibility columns/legacy audit table | One stable Production cycle and usage/search confirms no remaining dependency |
| D-06 | Permanent export-event logging | Compliance or incident requirements need download history, not only document stamps |
| D-07 | Online source/approval document storage | Physical filing becomes inadequate and storage security/retention is approved |
| D-08 | Multi-stage in-app approval workflow | More publishers/roles or compliance rules require separation of duties in software |
| D-09 | Full Factor F admin/import UI | The F-track foundation is stable and repeated Factor F changes require a reusable admin workflow |

## 5. Decision recording procedure

For P-02 through P-07, record the final answer in:

1. this register;
2. the [Reconciliation Report](./11-phase4-reconciliation-report.md) and either
   affected rows in `evidence/phase4-reconciliation-draft.csv` or the generated
   frozen decision overlay when preserving raw evidence is required;
3. the [Code Dictionary](./10-phase4-structured-code-dictionary.md), when code
   meaning/allocation changes;
4. parser/golden fixtures and database seed/backfill generated from the frozen
   approved data.

For P-08 through P-37, record the evidence in the Change Request, Runbook,
Verification Report, and per-version Release Note as applicable. P-18 through
P-20 also require the affected architecture/spec/test contract to be updated in
the same reviewed change.

For P-17, record the evidence in ADR-005, the Factor F Change Request,
before/after factor checksums, pointer verification, and the relevant
application regression report.

Every record must include:

- decision ID and exact subject/version;
- selected outcome and reason;
- approver name/role and timestamp;
- evidence/reference;
- affected rows/files/documents;
- whether implementation, Production migration, deploy, enablement, or publish
  is authorized.

Chat acknowledgement alone should not be interpreted as approval for a later
Production gate unless it identifies the exact gate and version.

## 6. P-01 component review tracker

P-01 is approved only after all required implementation/local-rehearsal
authority documents below are accepted. A component approval does not authorize
Production migration, deploy, feature enablement, or publication.

| Component | Status | Owner decision / condition | Evidence |
|---|---|---|---|
| Post-Factor-F adjustment plan | Approved for implementation/local rehearsal | Factor F pointer/rows/bindings stay unchanged; before/after assertions and `save_boq_with_routes` immutability regressions are mandatory Production gates | Owner chat approval, 2026-07-04 |
| Implementation Execution Pack | Approved for WP-0 through WP-8 implementation/local rehearsal | WP-9 requires P-12 through P-15 as normal sequential gates after WP-8 evidence review. Feature flag disabled, BOQ regression, Factor F assertions, live preflight, and Decision Register authority are mandatory gates | Owner chat approval, 2026-07-04 |
| Architecture Revision 8 | Approved as Phase 4 Core architecture authority for implementation/local rehearsal | Production gates require rollback/fix-forward evidence plus RLS/grants, advisory lock, status-transition, export formula-safety, BOQ, and Factor F regression proof | Owner chat approval, 2026-07-04 |
| Architecture Review Disposition | Approved as supporting disposition record | Revision 8 and the contract suite remain authority; external review is input only and must not become shadow authority | Owner chat approval, 2026-07-04 |
| ADR-004 | Approved as Phase 4 governance/architecture decision for implementation/local rehearsal | Published database catalog is system of record; system-generated Excel/PDF are official only when stamp/count/hash match; Production and publish gates remain separate | Owner chat approval, 2026-07-04 |
| Phase 4 Change Request | Approved for implementation/local rehearsal | Missing decision at its due gate is a stop condition; Production migration, deploy, enablement, publication, Factor F work, and unauthorized Production name/unit/price changes remain unauthorized | Owner chat approval, 2026-07-04 |
| Database/security contract | Approved for implementation/local rehearsal | Additive `017+`, explicit grants/RLS, private definer boundary, direct-write revocation, lock order, Factor F/BOQ immutability, local DB/security/advisor verification, and forward-fix-only recovery are accepted | Owner chat approval, 2026-07-04 |
| Threat model | Approved as threat/control baseline for implementation/local rehearsal | Required security tests, advisors, malicious fixtures, BOQ/Factor F regression, residual-risk acceptance, and re-review triggers are mandatory before Production | Owner chat approval, 2026-07-04 |
| Decision Register | Approved as Phase 4 decision source of truth | Current locked/pending/deferred model, recording procedure, and "chat acknowledgement is not approval" control are accepted; P-02 through P-08 are approved, P-09 reserves only the `2568.1.0` draft/rehearsal version string, P-10 approves limited runtime CI assets per Doc #24, P-11 visual direction is approved for implementation, and P-09 effective/approval/filing metadata plus final P-11 artifacts and P-12 through P-15 remain unresolved unless separately approved | Owner chat approval, 2026-07-04 |
| Parser/hash spec | Approved for implementation/local rehearsal | Deterministic single parser profile, server revalidation, file/row/payload limits, stable error contract, K-exclusion, decimal-string money, canonical hash contract, golden/cross-runtime tests, and independent filed-source rehash before publication are accepted | Owner chat approval, 2026-07-04 |
| Official export spec | Approved for implementation/local rehearsal | Dataset-hash versus binary-hash model, selected-version server export, fail-closed count/hash checks, five-sheet Excel architecture, visible canonical verification, PDF server-verified stamp, draft markings, Factor F exclusion, accessibility, filing evidence, and failure behavior are accepted; P-11 visual direction amendment is now recorded, while final artifacts and reviewer sign-offs remain separate | Owner chat approval, 2026-07-04 |

## 7. Approval summary

| Approval package | Decision | Owner | Timestamp | Evidence |
|---|---|---|---|---|
| Architecture + local implementation/rehearsal | Approved | Owner | 2026-07-04 | P-01; P-09 version string reserved for rehearsal; Production and remaining P-09 effective/approval/filing metadata through P-15 gates remain separate |
| Frozen 710-row identity/code reconciliation | Approved | Owner | 2026-07-04 | P-02-P-07; implementation must preserve raw evidence and generated decision overlay |
| Legacy baseline publication metadata | Approved | Owner/records custodian | 2026-07-04 | P-08; `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; do not use Factor F evidence |
| Candidate draft/rehearsal version string | Partially approved | Owner | 2026-07-04 | P-09 limited approval; reserve `2568.1.0` only, with effective/reference/archive still pending |
| Runtime NT CI assets | Approved | Owner/brand custodian | 2026-07-04 | P-10 limited approval; implement with [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); `/CI/` source remains local-only; exact P-11 replacement artifacts accepted 2026-07-11 |
| Official export format | Exact TH Sarabun New 16 pt replacement pair accepted; WP-6 complete | Owner | 2026-07-11 22:20 +07 | P-11; exact replacement DB-generated Excel/PDF passed count/hash, typography, visual QA, and owner confirmation; Production filing remains separate |
| Reliability plan/authority alignment | Approved for docs-only amendment | Owner | 2026-07-11 | Add WP-6.5 end-to-end hardening, permanent hotfix regression, UAT, authority hierarchy, and P-20 decision gate; no Local reset or Production authorization |
| WP-6.6 capability scope/start | Authorized for Local-only implementation of Audit #29 C-01 through C-12 / slices A-G | Owner | 2026-07-12 | P-21; no Local reset/apply, Production, P-18/`021`, or WP-7 authorization |
| WP-6.6 operator workflow correction | Historical G0/G1/pre-G2 checkpoint completed; superseded as executable target by P-23.1 | Owner | 2026-07-12 | P-22 evidence remains history on `e463270`/`c8f6dca`; do not run the former exact-`c8f6dca` G2 plan after candidate `020` changed |
| WP-6.6 P-23.1 version/workspace correction | Bounded implementation authorized; repository/static and final G1R/G2 passed | Owner | 2026-07-13 | P-23.1/P-24 candidate executed twice on exact `721c2c2`; G3, G4, and all Production actions remain separate |
| WP-6.6 P-24/G1R | Base `88d0711`, closure `050c998`, and exact final G1R `721c2c2` passed; G2 not inferred | Owner | 2026-07-13 | Migration `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; clean Local DB/concurrency/P-20/advisor/browser evidence and cleanup passed; bootstrap/Production unchanged |
| WP-6.6 P-24/G2 | Independent second clean rebuild and P-20 comparison passed on exact final candidate `721c2c2`; G3/G4 not inferred | Owner | 2026-07-13 | Same migration SHA; WP-6.6/WP-6.5 evidence, P-20 comparator, current advisor triage, repository gates, and final cleanup passed; bootstrap/Production unchanged |
| WP-6.6 P-25 final-review presentation | Bounded repository/static and approved standalone Local visual/interaction evidence passed; G3 not inferred | Owner + developer | 2026-07-14 | Real component/design-system bundle passed 27/27 checks at 710 total/709 affected rows on 1440x1000 and 390x844; no DB reset/mutation, migration, bootstrap, Production, P-18/P-19, WP-7, Factor F, or hotfix scope |
| WP-6.6 G3 technical walkthrough | Real-route stale-after-review, fresh-review recovery, audited abandon, and final Local invariants passed; owner accept/hold not inferred | Owner-authorized execution + developer evidence | 2026-07-14 | Source `6599c30`; review lock 1, mutation lock 2, stale publish denied with retained fields and no publish effect, abandon lock 3, pointer `2568.0.0`/710, zero drafts, all flags false, BOQ and Factor F unchanged; no reset or Production action |
| WP-6.6 P-26/P-27 G3 closeout | Exact application checkpoint accepted; WP-6.6 complete | Owner | 2026-07-14 23:50 +07 | Exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; P-26 confirmation/cancel/cleanup evidence accepted. G4, reset/bootstrap/WP-7, WP-8, and Production remain separate. |
| P-28/G4 repository integration | `020` bootstrap source inclusion and WP-7 harness source authorized; destructive execution held | Owner | 2026-07-15 | Repository/tests/docs only. Exact integration commit and static gates precede a separate warned Local reset approval; no Production, P-18/P-19, Factor F, or hotfix expansion. |
| P-29/G4E clean Local execution | Combined `009`-`020` bootstrap and live WP-6.6/WP-6.5/P-20/WP-7 evidence passed; WP-7 owner acceptance not inferred | Owner-authorized execution + developer evidence | 2026-07-15 | Exact execution checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`; pointer `2568.0.0`, zero drafts, all flags false, BOQ 198/1,547 and Factor F `2569.0.0`/36 preserved; Production touched: No. |
| P-30 WP-7 acceptance and P-18/WP-7.5 start | WP-7 accepted; five-rule P-18 V1 contract accepted for bounded Local-only source implementation | Owner | 2026-07-15 01:37 +07 | Migration `021`, exact RPC/read model, Thai-first placement workspace, tests, and docs are authorized. Bootstrap inclusion, Local reset/evidence, WP-8, P-19, Factor F/hotfix expansion, feature enablement, publication, and Production remain separate. |
| P-31 WP-7.5 Source/Static acceptance | Exact checkpoint accepted for commit/push; WP-7.5 remains incomplete pending live evidence | Owner | 2026-07-15 10:24 +07 | Exact `4e3574a31a2697f4d727acabc8f55f34a4233bff`; migration `021` remains outside bootstrap and unapplied. Local reset/apply/live evidence, WP-8, P-19, Factor F/hotfix expansion, feature enablement, publication, and Production remain separate. |
| P-32 WP-7.5 Local live gate | Local reset/separate apply/live evidence authorized; first attempt failed closed, then same-scope replacement evidence passed | Owner-authorized execution + developer evidence | 2026-07-15 | Error `42704` exposed an unqualified constraint under fixed search path; amended `021` then passed clean-chain DB/browser/export evidence and final cleanup. No Production action. |
| P-33 WP-7.5 exact technical acceptance | Accepted for bounded technical scope; later UX/release gates remain open | Owner | 2026-07-15 13:54 +07 | Exact P-32 package accepted. WP-8 placement UX hard gates, bootstrap inclusion, P-19, feature enablement, publication, and Production remain separate. |
| P-34 WP-8 placement UX source/static | Exact `0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` accepted as a historical bounded source/static checkpoint; WP-8 remains In progress | Owner + developer | 2026-07-15 | Technical provenance remains valid. Its direct relation-control presentation was rejected by first P-37 UAT and is superseded by the Note #33 insertion-gap correction; DB contract unchanged. |
| P-35 WP-8 bootstrap source integration | Exact source checkpoint `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a` passed; destructive execution was held at this checkpoint | Owner + developer | 2026-07-15 | Unchanged amended `021` is after `020`; authority and executable contracts are aligned. P-36 remained separate and later passed; P-37/Production remain separate. |
| P-36 WP-8 destructive Local execution | Approved after explicit reset warning and passed for integrated technical scope | Owner + developer | 2026-07-15 | Exact gate/execution `910cc3cc74660beecf18655d39cd0b0c085d1fc6`; integrated DB/regression/hash/export/advisor/route-render/cleanup evidence passed. Production touched: No. |
| P-37 WP-8 owner acceptance | HOLD after first intended-admin comprehension failure; technical continuation passed, acceptance not recorded | Owner | 2026-07-17/18 | Corrected insertion-gap flow passed technical stale recovery, one-batch confirmation, exact replay, accepted-state readback, audited cleanup, and post-evidence repository checks. Owner keyboard/leave-reload re-UAT, exact commit/push provenance, and explicit acceptance remain. Add/Supplement remains hidden; see Note #33. |
| Production migration | Not requested |  |  | P-12; request after WP-8 evidence review |
| Deploy / feature enable | Not requested |  |  | P-13–P-14; request only after preceding Production gate passes |
| Publish named version | Not requested |  |  | P-15 |

## References

- [Phase 4 Architecture, CI and Official Export Plan](./08-phase4-architecture-ci-plan.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
- [Execution Progress Tracker and authority/evidence index](./25-phase4-execution-progress-tracker.md)
- [NT CI Runtime Asset Analysis](./24-phase4-nt-ci-runtime-asset-analysis.md)
- [P-37 Intended-Admin UAT and Placement UX Correction Note](./33-phase4-wp8-p37-uat-ux-correction-note.md)
