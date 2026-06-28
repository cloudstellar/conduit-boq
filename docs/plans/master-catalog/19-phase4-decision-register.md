# Phase 4 Decision Register

**Status:** Draft — locked decisions apply; pending decisions require owner
resolution at the stated gate

**Prepared:** 2026-06-22

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

## 3. Pending owner/data decisions

P-01 authorizes only local implementation/rehearsal of the reviewed
architecture and contracts. It does not resolve P-02 through P-11. Work may
continue on generic additive schema, parser/canonicalizer, UI, tests, and local
fixture rehearsal while those decisions are pending, but final approved data
backfill, candidate freeze, export acceptance, Production migration, feature
enablement, and publication must stop at the stated gates until the relevant
pending decisions are recorded.

| ID | Decision required | Current evidence/default recommendation | Owner | Due before | Status |
|---|---|---|---|---|---|
| P-01 | Approve ADR-004, Change Request, architecture Revision 8, DB/security contract, threat model, parser/hash spec, and export spec for implementation/local rehearsal | Approve together after review; this does not authorize Production | Owner | Phase 4A implementation | Pending |
| P-02 | Decide whether `ITEM-0131` and `ITEM-0139` remain justified distinct items or which erroneous duplicate is retired in the candidate | Both receive distinct baseline identities; UUID/history merge is prohibited | Owner + data custodian | Candidate reconciliation freeze | Pending |
| P-03 | Approve corrected canonical groups/codes for 16 HDPE Crossing rows | Reject current GIP candidates; use an approved HDPE classification | Owner + engineering data custodian | Candidate code freeze | Pending |
| P-04 | Assign/approve canonical codes and groups for 20 Production-only rows | Retain all 20 and preserve Production values | Owner + data custodian | Candidate 710-row freeze | Pending |
| P-05 | Decide disposition of 18 workbook-only rows | Defer by default; add only with separate item and price authority | Owner | First structured candidate freeze | Pending |
| P-06 | Approve all 22 work-context (`AAA`) and 62 item-type (`AAA-TTT`) group meanings | Treat workbook dictionary as candidate only | Owner + engineering data custodian | Code-group backfill | Pending |
| P-07 | Approve correction of repeated Thai phrase in `FTW-CON-002` | Do not mix the correction into taxonomy-only version unless separately approved | Owner | Candidate scope freeze | Pending |
| P-08 | Provide truthful baseline publication metadata for legacy `2568.0.0` | Required: effective date, approval reference/document date, readable publisher/owner snapshot; never invent | Owner/records custodian | Validate Phase 4 publication-completeness constraint | Pending |
| P-09 | Approve exact candidate version, effective date, approval reference, and physical archive reference | `2568.1.0` is a planning example, not authority | Owner | Candidate draft/publish rehearsal | Pending |
| P-10 | Approve which NT fonts/logo derivatives may be committed and deployed | Use only necessary optimized runtime assets derived from local `/CI/` | Owner/brand custodian | Phase 4B UI implementation | Pending |
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
2. the [Reconciliation Report](./11-phase4-reconciliation-report.md) and
   affected rows in `evidence/phase4-reconciliation-draft.csv`;
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

## 6. Approval summary

| Approval package | Decision | Owner | Timestamp | Evidence |
|---|---|---|---|---|
| Architecture + local implementation/rehearsal | Pending |  |  | P-01 |
| Frozen 710-row identity/code reconciliation | Pending |  |  | P-02–P-07 |
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
