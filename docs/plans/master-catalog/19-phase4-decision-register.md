# Phase 4 Decision Register

**Status:** Owner-approved decision source of truth for Phase 4 governance;
pending decisions still require owner resolution at the stated gate

**Prepared:** 2026-06-22

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
| L-29 | Migration numbers follow actual execution order; Factor F applied as `012`/`013`/`014`/`015` on 2026-06-29, so Master Catalog Phase 4 starts at `016+` | Prevents duplicate migration ordering and keeps deploy history truthful |
| L-30 | Catalog and Factor F version strings are independent namespaces; labels and official documents must say Catalog version vs Factor F version explicitly | Prevents mistaking catalog `2568.1.0` for Factor F `2569.0.0` |
| L-31 | No Factor F publication is part of Master Catalog Phase 4 | MC approval cannot move the Factor F pointer, change Factor F rows, or bind old BOQs by assumption |
| L-32 | Master Catalog dataset hashes and official catalog exports exclude Factor F rows, Factor F metadata, BOQ snapshots, and BOQ totals | Keeps catalog reproducibility scoped to price-list data and avoids cross-axis hash drift |

## 3. Pending owner/data decisions

P-01 authorizes only local implementation/rehearsal of the reviewed
architecture and contracts. It does not resolve P-02 through P-11. Work may
continue on generic additive schema, parser/canonicalizer, UI, tests, and local
fixture rehearsal while those decisions are pending, but final approved data
backfill, candidate freeze, export acceptance, Production migration, feature
enablement, and publication must stop at the stated gates until the relevant
pending decisions are recorded.

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
- Named NT font/logo derivatives require an asset/license inventory before they
  are approved for repository or Production use.

| ID | Decision required | Current evidence/default recommendation | Owner | Due before | Status |
|---|---|---|---|---|---|
| P-01 | Approve ADR-004, Change Request, architecture Revision 8, DB/security contract, threat model, parser/hash spec, export spec, Post-Factor-F adjustment plan, and Implementation Execution Pack for implementation/local rehearsal | Approved together after owner review; this does not authorize Production migration, deploy, enablement, publication, or P-02 through P-15 data/records/visual decisions | Owner | Phase 4A implementation | Approved 2026-07-04 |
| P-02 | Decide whether `ITEM-0131` and `ITEM-0139` remain justified distinct items or which erroneous duplicate is retired in the candidate | Retain both as distinct valid items in `2568.1.0`. `ITEM-0139` is only a future-retirement candidate if live preflight confirms BOQ refs = 0 and the data custodian/owner confirms it is the erroneous duplicate; UUID/history merge remains prohibited and any future correction must be retire-only. | Owner + data custodian | Candidate reconciliation freeze | Approved 2026-07-04 |
| P-03 | Approve corrected canonical groups/codes for 16 HDPE Crossing rows | Reject `CRS-GIP-018` through `CRS-GIP-033` as GIP classifications; split HDPE Crossing into `CRS-H06` and `CRS-H08` as taxonomy recodes only. Preserve Production names, units, prices, identities, and BOQ history; defer workbook-only `CRS-GIP-025` under P-05; handle retained `ITEM-0139` under P-04; K fields remain excluded and draft code names/sequences may still be corrected before publication. | Owner + engineering data custodian | Candidate code freeze | Approved 2026-07-04 |
| P-04 | Assign/approve canonical codes and groups for 20 Production-only rows | Retain all 20 Production-only rows; assign canonical codes to 19 rows (`FTW-CON-002`, `CIC-H06-001` through `CIC-H06-010`, `JNT-PVC-013`, `RSR-PL0-040` through `RSR-PL0-046`); keep `ITEM-0139` as temporary legacy code under P-02 controls. Preserve Production names, units, costs, identities, and BOQ history; add no workbook-only rows. | Owner + data custodian | Candidate 710-row freeze | Approved 2026-07-04 |
| P-05 | Decide disposition of 18 workbook-only evidence rows | Raw workbook evidence remains 18 rows, but P-07 resolves workbook `FTW-CON-002` as a typo shadow of Production `ITEM-0491`, not a separate supplement candidate. Defer the remaining 17 unresolved workbook-only rows from `2568.1.0` and open a separate supplement intake. They are future candidates only until item authority, price authority, corrected taxonomy/code allocation, owner/data-custodian approval, import preview/reconciliation, and dataset-hash/publish verification are recorded. Default target for a true new supplement is `2568.2.0` unless approved evidence classifies the change differently under ADR-003. `CRS-GIP-025` must not publish as GIP. | Owner | First structured candidate freeze | Approved 2026-07-04 |
| P-06 | Approve all 22 work-context (`AAA`) and 65 item-type (`AAA-TTT`) group meanings | Approve the 22 `AAA` and 65 `AAA-TTT` group meanings for code-group dictionary/backfill/implementation. This is not import approval, row-count approval, workbook-only approval, K-mapping approval, or P-07 wording correction. Approve revised main codes `DRL→COR`, `FND→PAD`, and `FTP→FTW`. `ITEM-0139` is an approved temporary legacy-code exception for `2568.1.0` only; DB/publish validation must allow `code_group_id is null` only for that row and assert no other active structured-version row has a null group. If that cannot be audited, stop and return to owner; developers must not infer a canonical code. | Owner + engineering data custodian | Code-group backfill | Approved 2026-07-04 |
| P-07 | Approve correction of repeated Thai phrase in workbook `FTW-CON-002` | Use Production `ITEM-0491` wording for canonical code `FTW-CON-002`. Reject the workbook-only repeated-phrase row as a typo shadow, not a separate candidate; do not import workbook wording, do not create a duplicate item, and do not touch `ITEM-0491` identity/history because snapshot evidence shows 8 BOQ references. Any whitespace-only Production wording cleanup requires a separate wording correction/change request. | Owner | Candidate scope freeze | Approved 2026-07-04 |
| P-08 | Provide truthful baseline publication metadata for legacy `2568.0.0` | Required: effective date, approval reference/document date, readable publisher/owner snapshot; never invent | Owner/records custodian | Validate Phase 4 publication-completeness constraint | Pending |
| P-09 | Approve exact candidate version, effective date, approval reference, and physical archive reference | `2568.1.0` is a planning example, not authority | Owner | Candidate draft/publish rehearsal | Pending |
| P-10 | Approve which NT fonts/logo derivatives may be committed and deployed | Use only necessary optimized runtime assets derived from local `/CI/`; require asset names, source, license/permission, and intended runtime path before approval | Owner/brand custodian | Phase 4B UI implementation | Pending |
| P-11 | Approve the official Excel/PDF visual sample and field order | Follow CI and [export spec](./20-phase4-official-export-spec.md) | Owner | Export implementation acceptance | Pending |
| P-12 | Approve the named Production migration window | Requires Local reset/rehearsal, backup restore evidence, drift check, and verification readiness | Owner | Production migration | Not requested |
| P-13 | Approve application deploy and admin-only smoke window | Feature remains disabled by default | Owner | Production deploy | Not requested |
| P-14 | Approve feature enablement | Requires Production migration/deploy verification | Owner | User visibility | Not requested |
| P-15 | Approve publication of the exact named catalog version and its final diff/count/hash | Migration/deploy approval does not imply publish approval | Owner | Production publication | Not requested |
| P-16 | Schedule Supabase legacy API-key migration | Separate maintenance change; complete before provider retirement and after inventory/rehearsal | Owner + developer | Separate security window | Pending |
| P-17 | Record completed Factor F F0-F4 gates before Master Catalog Phase 4 | Completed before Master Catalog Phase 4. ADR-005 and the separate Factor F CR governed the rollout; current baseline from `FACTOR F 2566_7.PDF` is active as `2566.0.0`, the 26 June 2026 source-table annex is current default `2569.0.0`, legacy BOQs were not backfilled, and `015` repaired only missing legacy snapshot metadata without repricing or binding old BOQs | Owner + factor data custodian | Before Master Catalog Phase 4 Production migration | Completed 2026-06-29; see Factor F closeout |

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

For P-08 through P-15, record the evidence in the Change Request, Runbook,
Verification Report, and per-version Release Note as applicable.

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
| Implementation Execution Pack | Approved for WP-0 through WP-8 implementation/local rehearsal | WP-9 requires P-12 through P-15; feature flag disabled, BOQ regression, Factor F assertions, live preflight, and Decision Register authority are mandatory gates | Owner chat approval, 2026-07-04 |
| Architecture Revision 8 | Approved as Phase 4 Core architecture authority for implementation/local rehearsal | Production gates require rollback/fix-forward evidence plus RLS/grants, advisory lock, status-transition, export formula-safety, BOQ, and Factor F regression proof | Owner chat approval, 2026-07-04 |
| Architecture Review Disposition | Approved as supporting disposition record | Revision 8 and the contract suite remain authority; external review is input only and must not become shadow authority | Owner chat approval, 2026-07-04 |
| ADR-004 | Approved as Phase 4 governance/architecture decision for implementation/local rehearsal | Published database catalog is system of record; system-generated Excel/PDF are official only when stamp/count/hash match; Production and publish gates remain separate | Owner chat approval, 2026-07-04 |
| Phase 4 Change Request | Approved for implementation/local rehearsal | Missing decision at its due gate is a stop condition; Production migration, deploy, enablement, publication, Factor F work, and unauthorized Production name/unit/price changes remain unauthorized | Owner chat approval, 2026-07-04 |
| Database/security contract | Approved for implementation/local rehearsal | Additive `016+`, explicit grants/RLS, private definer boundary, direct-write revocation, lock order, Factor F/BOQ immutability, local DB/security/advisor verification, and forward-fix-only recovery are accepted | Owner chat approval, 2026-07-04 |
| Threat model | Approved as threat/control baseline for implementation/local rehearsal | Required security tests, advisors, malicious fixtures, BOQ/Factor F regression, residual-risk acceptance, and re-review triggers are mandatory before Production | Owner chat approval, 2026-07-04 |
| Decision Register | Approved as Phase 4 decision source of truth | Current locked/pending/deferred model, recording procedure, and "chat acknowledgement is not approval" control are accepted; P-02 through P-07 are now separately approved, while P-08 through P-15 remain unresolved unless separately approved | Owner chat approval, 2026-07-04 |
| Parser/hash spec | Approved for implementation/local rehearsal | Deterministic single parser profile, server revalidation, file/row/payload limits, stable error contract, K-exclusion, decimal-string money, canonical hash contract, golden/cross-runtime tests, and independent filed-source rehash before publication are accepted | Owner chat approval, 2026-07-04 |
| Official export spec | Approved for implementation/local rehearsal | Dataset-hash versus binary-hash model, selected-version server export, fail-closed count/hash checks, five-sheet Excel architecture, visible canonical verification, PDF server-verified stamp, draft markings, Factor F exclusion, accessibility, filing evidence, and failure behavior are accepted; P-10/P-11 and reviewer sign-offs remain separate | Owner chat approval, 2026-07-04 |

## 7. Approval summary

| Approval package | Decision | Owner | Timestamp | Evidence |
|---|---|---|---|---|
| Architecture + local implementation/rehearsal | Approved | Owner | 2026-07-04 | P-01; Production and remaining P-08 through P-15 gates remain separate |
| Frozen 710-row identity/code reconciliation | Approved | Owner | 2026-07-04 | P-02-P-07; implementation must preserve raw evidence and generated decision overlay |
| Legacy baseline publication metadata | Pending |  |  | P-08 |
| Official export format | Pending |  |  | P-11 |
| Production migration | Not requested |  |  | P-12 |
| Deploy / feature enable | Not requested |  |  | P-13–P-14 |
| Publish named version | Not requested |  |  | P-15 |

## References

- [Phase 4 Architecture, CI and Official Export Plan](./08-phase4-architecture-ci-plan.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
