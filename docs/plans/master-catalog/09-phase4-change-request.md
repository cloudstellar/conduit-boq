# Change Request: Master Catalog Phase 4 Administration and Official Publication

**Status:** Draft for owner review — no Production execution authorized
**Requested date:** 2026-06-22
**Change type:** Additive database governance, admin UI, import/manual change,
audit history, and official Excel/PDF export
**Production project:** `otlssvssvgkohqwuuiir`
**Proposed first structured-code version:** `2568.1.0`

## 1. Decision requested

Approve detailed implementation and local rehearsal of Master Catalog Phase 4.
This approval does not authorize a Production migration, feature enablement, or
catalog publication. Those actions have separate gates in this document.

Approval covers the reviewed supporting contracts listed in the
[Decision Register](./19-phase4-decision-register.md), especially P-01. A
missing decision at its due gate is a stop condition, not permission for the
implementer to choose silently.

The owner is asked to confirm:

1. Production `2568.0.0` remains authoritative for current names, units, and
   all price fields.
2. `2568.1.0` begins as an exact 710-row clone and initially changes only
   approved codes/classification.
3. The published database version is the official source of truth.
4. System-generated stamped Excel/PDF may be used as official reference copies.
5. Source/approval files remain in the physical filing system.
6. K-formula publication and BOQ Rebase remain outside Phase 4 Core.

## 2. Current verified baseline

Read-only Supabase MCP verification on 2026-06-22 returned:

| Check | Result |
|---|---:|
| Catalog rows | 710 |
| Distinct item codes | 710 |
| Missing item codes | 0 |
| Missing required name/unit | 0 |
| Missing material/labor/unit cost | 0 |
| Unit-cost mismatches | 0 |
| Catalog versions | 1 |
| Active versions | 1 |
| Singleton pointers | 1 |
| Active/default version | `2568.0.0` |
| Latest catalog item update | 2026-05-31 18:15:26 ICT |

Production migration ledger includes:

- `20260621045208_master_catalog_p0_containment`
- `20260621052517_master_catalog_phase1a_versioning`
- `20260621104056_master_catalog_phase1b_hardening`

The previous P0 → 1A → 2 → 1B change is complete. Phase 4 has not started.

## 3. Business outcome

After completion, an active admin can:

- view all catalog versions and the current pointer;
- clone a published version into a draft;
- add, edit, retire, or recode an item without Excel;
- import a Full or Supplement workbook through a fixed parser profile;
- review row-level diff, warnings, and blocking errors;
- view item history across versions and code changes;
- attach approval/reference metadata without storing the raw file online;
- publish an immutable official version;
- export selected published versions to stamped Excel and PDF;
- verify export item count and dataset hash;
- restore the default pointer to a prior published version without rewriting
  historical BOQs.

## 4. In scope

### Data and governance

- Stable item identity and append-only code registry
- No merging of identities that coexist in published `2568.0.0`; duplicate
  correction occurs by audited retirement in a later version
- Version lineage, approval metadata, item count, dataset hash, and lock version
- Versioned display categories and `AAA/TTT` code groups
- Import metadata, change sets, and complete old/new snapshots
- Draft-only manual/import mutation
- Published-row and published-metadata immutability
- Idempotent high-impact writes and stale-draft protection
- Transactional pointer change plus legacy `is_default` synchronization
- Explicit grants, RLS, indexed foreign keys, and private mutation functions

### Application

- NT CI-compliant Master Catalog admin screens
- Version list, version detail, diff, item history, manual edit, import, publish,
  exports, and pointer restore
- Fixed parser profile with browser-side raw-file handling
- Full-import mass-retirement gate at the greater of 10 rows or 2% of the
  active base, with typed count and owner approval reference
- Server-side payload revalidation and stable error codes
- Generated database types and reuse of existing Supabase client utilities
- Feature flag defaulting to disabled

### Evidence and operations

- Local Production-data rehearsal
- Logical backup and restore verification
- Row-level reconciliation and code dictionary approval
- Official export verification
- Production runbook, verification report, admin procedure, and release note

## 5. Explicitly out of scope

- Supabase Storage or signed uploads
- Additional paid Supabase project/branch
- K-formula publication or K-based calculation logic
- BOQ Rebase UI
- Generic spreadsheet mapper or arbitrary parser profiles
- Background jobs, scheduling, or cron
- Server pagination before the measured threshold is reached
- Removal of legacy compatibility columns in the same release
- Redesign of unrelated screens or dashboard metric wording
- Changes to BOQ print label “แบบ ปร.1”

## 6. Data-source rule

The candidate workbook
`files/NT_Item_Code_Master_K_Mapping_2568.xlsx` is a taxonomy/reconciliation
source, not price authority. Its SHA-256 at review time is
`ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b`.

Verified reconciliation:

| Outcome | Count |
|---|---:|
| Production rows | 710 |
| Workbook rows | 708 |
| Matched by normalized name + unit | 690 |
| Matched with exact costs | 648 |
| Matched with different costs | 42 |
| Production-only | 20 |
| Workbook-only | 18 |
| HDPE Crossing taxonomy conflicts | 16 |

All 42 price differences resolve to `preserve_production` for the first
structured-code rollout. Workbook-only rows are deferred until they have
separate approved price authority. Production-only rows remain present.

## 7. Proposed implementation sequence

| Phase | Purpose | Production effect |
|---|---|---|
| 4-0 | Approve ADR/CR, dictionary, reconciliation, specs, backup/runbook | None |
| 4A Local | Build additive schema/functions and backfill on Local | None |
| 4B Local | Build UI/import/manual/history/publish/export behind flag | None |
| 4C Rehearsal | Full local workflow from refreshed Production data | None |
| 4A Production | Apply additive migration with feature flag disabled | Schema only; existing reads remain compatible |
| 4B Production | Deploy compatible application with flag disabled | No user-visible change |
| Enable | Admin-only smoke then enable feature | Admin feature becomes visible |
| Publish | Publish approved `2568.1.0` | New BOQs use new pointer; old BOQs unchanged |
| Closeout | Exports, backup, verification, release note | Evidence only |

## 8. Security controls

- Every new exposed-schema table has RLS enabled.
- Grants are explicit because new Supabase tables may no longer be exposed to
  the Data API automatically; grants and RLS are treated as separate controls.
- Active admins may read administrative audit data; other roles see no rows.
- Application roles cannot directly insert/update/delete audit/import tables.
- Privileged catalog writes are private-schema functions with fixed
  `search_path`, fully qualified objects, internal authorization, and exact
  execution grants.
- Server Actions authenticate on the server. Client `getSession()` state is
  never used to authorize Phase 4 mutations.
- No service-role/secret key enters a browser bundle.
- Source filenames and error messages are escaped before display/export.

## 9. Performance and concurrency controls

- All foreign keys and common version/history filters are indexed.
- No partitioning or `pg_trgm` at the current scale.
- Current 710-row catalogs load client-side; revisit pagination at more than
  2,000 rows or normalized payload above 1 MB.
- File parsing occurs outside database transactions.
- Publish uses a transaction-scoped lock and deterministic lock ordering.
- `lock_version` rejects stale draft changes.
- `request_id` makes apply/publish/restore retries idempotent.
- Migration lock and statement timeouts are bounded.

## 10. Risk assessment

| Risk | Likelihood | Impact | Control | Abort condition |
|---|---|---|---|---|
| Workbook silently changes prices | Medium | Critical | Production-price precedence and server diff | Any unauthorized price change |
| Missing/duplicate identity mapping | Medium | High | 710-row reconciliation, unique constraints | Coverage not exactly 710 |
| Code reused for another item | Low | High | Append-only code registry | Any code→identity conflict |
| Stale draft overwrites newer current catalog | Low | High | Base-pointer and lock-version checks | Pointer differs from draft base |
| RLS/grant misconfiguration | Medium | Critical | Explicit grants, RLS tests, advisors | Unauthorized read/write succeeds |
| Publish partially succeeds | Low | Critical | One short transaction | Any invariant/audit step fails |
| Official exports differ from DB | Low | High | Canonical hash/count verification | Export hash/count mismatch |
| Existing BOQ regression | Low | High | Feature flag and full regression suite | Create/edit/print/export failure |
| Legacy `is_default` becomes stale | Medium | Medium | Sync in publish/restore transaction | Pointer/flag mismatch |
| Oversized payload fails unpredictably | Low | Medium | 750 KB application cap, tested error | Payload exceeds cap |

## 11. Preconditions before implementation

- [ ] Owner approves [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [ ] Owner approves this Change Request for implementation/local rehearsal
- [ ] Code dictionary decisions are recorded
- [ ] 728-record reconciliation draft is reviewed; all 710 Production outcomes
      have an approved decision
- [ ] `ITEM-0131` / `ITEM-0139` duplicate decision is recorded
- [ ] Both duplicate baseline rows retain distinct UUID histories; candidate
      retirement, if selected, is recorded as `retire` rather than merge
- [ ] All 16 HDPE Crossing candidate codes are corrected or rejected
- [ ] Production-only 20 rows receive approved code decisions
- [ ] Workbook-only 18 rows remain deferred or receive separate price approval
- [ ] Parser/hash specification is approved
- [ ] Database/security contract, threat model, decision register, and official
      export specification are approved
- [ ] Owner-approved legacy `2568.0.0` publication metadata is available; no
      approval reference/effective date is invented
- [ ] Backup restore rehearsal and local reset pass
- [ ] CI runtime assets are approved; source `/CI/` remains local-only

## 12. Preconditions before Production migration

- [ ] Local schema/functions and full workflow pass from a fresh reset
- [ ] Fresh read-only Production baseline is recorded
- [ ] Fresh encrypted logical backup is complete and restore-tested
- [ ] Production schema drift check matches the migration preflight
- [ ] Security and performance advisors have no unresolved blocker
- [ ] `npm test`, `npm run lint`, `npm run build`, and production audit pass
- [ ] Feature flag defaults to disabled
- [ ] Owner explicitly approves the Production migration window

## 13. Preconditions before publication

- [ ] Production additive migration and compatible application are verified
- [ ] Admin-only smoke passes while the feature flag is disabled
- [ ] The approved 710-row candidate clone preserves all current names/units/prices
- [ ] Approval reference, effective date, approver, and physical archive reference
      are complete
- [ ] Diff totals and all blocking warnings are accepted
- [ ] Draft base still equals the current pointer
- [ ] Excel/PDF generation passes against the candidate in rehearsal
- [ ] Full-import below/at mass-retirement threshold tests pass and required
      approval evidence is persisted
- [ ] Owner explicitly approves publication of the named version

## 14. Rollout and rollback rule

Before publication, disable the feature flag and forward-fix additive schema or
application issues. After publication, do not edit/delete the published
version. Use the audited pointer-restore function to return new BOQs to the
previous published version, then create a correction version.

Historical BOQs remain linked to their original version in every rollback path.

Detailed execution is in the
[Production Runbook](./12-phase4-production-runbook.md).

## 15. Acceptance criteria

- All 710 Production items have stable identity, legacy code, category, and
  approved structured-code outcome.
- Published catalogs are immutable.
- Manual and Excel changes produce equivalent audit evidence.
- Item history follows identity across recodes.
- Unauthorized roles cannot read administrative audit details or mutate data.
- Stale/duplicate requests fail safely.
- Official Excel/PDF hash and count match the selected published version.
- Existing BOQs and current user flows pass regression checks.
- Pointer restore is audited and does not rewrite historical BOQs.
- Verification report and release note are signed/complete.

## 16. Approval record

| Gate | Role | Name | Decision | Timestamp | Evidence/reference |
|---|---|---|---|---|---|
| Implement + local rehearsal | Owner |  | Pending |  |  |
| Production migration | Owner |  | Not requested |  |  |
| Application deploy | Owner |  | Not requested |  |  |
| Feature enablement | Owner |  | Not requested |  |  |
| Publish `2568.1.0` | Owner |  | Not requested |  |  |
| Execution | Executor |  | Pending |  |  |
| Independent verification | Verifier |  | Pending |  |  |

## References

- [Phase 4 architecture plan](./08-phase4-architecture-ci-plan.md)
- [Code dictionary](./10-phase4-structured-code-dictionary.md)
- [Reconciliation report](./11-phase4-reconciliation-report.md)
- [Verification template](./13-phase4-verification-report.md)
- [Parser/hash specification](./14-phase4-parser-and-canonical-hash-spec.md)
- [Admin operating procedure](./15-phase4-admin-operating-procedure.md)
- [Database and security contract](./17-phase4-database-security-contract.md)
- [Lean threat model](./18-phase4-threat-model.md)
- [Decision register](./19-phase4-decision-register.md)
- [Official export specification](./20-phase4-official-export-spec.md)
- [Architecture review disposition](./21-phase4-architecture-review-disposition.md)
