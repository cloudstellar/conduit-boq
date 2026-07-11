# Change Request: Master Catalog Phase 4 Administration and Official Publication

**Status:** Owner-approved for implementation/local rehearsal; no Production
migration, deploy, feature enablement, or publication authorized
**Requested date:** 2026-06-22
**Change type:** Additive database governance, admin UI, import/manual change,
audit history, and official Excel/PDF export
**Production project:** `otlssvssvgkohqwuuiir`
**Proposed first structured-code version:** `2568.1.0`

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation for implementation/local rehearsal only. The gate structure,
abort conditions, reconciliation counts, fail-closed governance, and missing
decision stop policy are accepted. This approval does not authorize Production
migration, application deploy, feature enablement, publication of `2568.1.0`,
Factor F changes, legacy BOQ Factor F backfill, or any unauthorized
Production name/unit/price change.

**Reliability amendment recorded:** 2026-07-11 — owner approved aligning the
plan documents before further implementation. WP-6.5/WP-7/WP-8 now include the
permanent safety, UAT, and drift controls in the Execution Pack. This docs-only
amendment does not authorize Local reset or Production action.

## 1. Decision requested

Approve detailed implementation and local rehearsal of Master Catalog Phase 4.
This approval does not authorize a Production migration, feature enablement, or
catalog publication. Those actions have separate gates in this document.
After WP-8 completes, pause for a Production readiness review before requesting
P-12. P-12 Production migration, P-13 deploy, P-14 feature enablement, and P-15
publication are sequential owner decisions; no accelerated approval is assumed.

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
7. Factor F changes are outside this Master Catalog CR and follow
   [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md)
   plus the separate
   [Factor F Change Request](../factor-f/01-versioned-factor-f-change-request.md).
   The first Factor F rollout is already complete; Phase 4 must preserve that
   separate version binding rather than treating Factor F as catalog data.

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
- `20260628190218_factor_f_version_foundation`
- `20260628190357_factor_f_seed_current_baseline`
- `20260628190621_factor_f_publish_2569_0_0`
- `20260628190757_factor_f_repair_legacy_snapshot_metadata`
- `20260706090246_hotfix_preserve_boq_item_suffix`

Supabase MCP verified after the Factor F rollout that root migrations `012`
through `015` are applied, current Factor F default is `2569.0.0`, and legacy
BOQs were not backfilled with a guessed Factor F version. Master Catalog Phase
4 database migrations start at `017+`; current Phase 4 drafts `017`-`019`
remain Local only.

The detailed post-Factor-F difficulty assessment and adjusted implementation
sequence are recorded in the
[Post-Factor-F Adjustment Plan](./22-phase4-post-factor-f-adjustment-plan.md).

Live BOQ counts can change while users continue working. The closeout count is
evidence for the Factor F rollout, not a fixed Phase 4 preflight expectation.
Every Production Phase 4 gate must record fresh live counts and the current
split between legacy snapshot-only BOQs and version-bound Factor F BOQs.

The previous P0 → 1A → 2 → 1B change is complete. Phase 4 Local implementation
is through WP-6 owner review; Phase 4 Production has not started.

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
- Stable client-owned operation IDs across uncertain retries
- ADR-003 reusable annual/revision/patch version path without candidate
  hardcoding
- Early publish-block warnings, route failure/recovery states, Thai support
  correlation, and bounded structured logs

### Evidence and operations

- Local Production-data rehearsal
- Logical backup and restore verification
- Row-level reconciliation and code dictionary approval
- Official export verification
- Live Local DB/RPC/RLS/concurrency and permanent hotfix `016` regression suite
- Tracked semantic artifact verifier, authority consistency check, intended-admin
  UAT, and 710-row performance baseline
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
- Factor F reference changes, Factor F pointer changes, legacy BOQ
  factor-version backfill, mutation of `boq.factor_reference_version_id`, or
  automatic repricing of existing BOQs

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

The separate Factor F track completed before Master Catalog Phase 4. Master
Catalog local work may continue on top of that baseline, but Master Catalog
Phase 4 has no Factor F publication, pointer movement, or row-value change in
scope.

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
- A client/form-owned `request_id` makes create/manual/apply/publish/restore
  retries idempotent only when the same ID is reused after an uncertain result.
- Migration lock and statement timeouts are bounded.
- Two-session Local DB tests prove advisory-lock ordering and timeout behavior.

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
| Factor F change hidden inside catalog work | Medium | High | Completed Factor F closeout is treated as a protected baseline; Phase 4 has no Factor F write path | Any Factor F row/value/pointer change in this CR |
| Retry after timeout creates a second business effect | Medium | High | Client-owned stable operation ID plus timeout-after-commit test | Same intended retry reaches DB with a new ID or creates a second change set |
| Clean rebuild hash cannot be reconciled | High until P-20 | High | Deterministic baseline identity or explicitly approved dual-hash contract | P-20 unresolved or clean approved environments disagree |
| Future version needs a code hotfix | High with hardcoding | High | Generic ADR-003 version validation and multi-version fixtures | Reusable path requires a `2568.1.0` code change |
| Hotfix behavior regresses despite static tests | Medium | High | Permanent live DB/RPC suffix/authority/rollback suite | Any approved suffix or authoritative catalog field behaves incorrectly |
| Admin learns a business blocker only at publish | Medium | Medium | Early preview/readiness warning plus final DB guard and UAT | UAT cannot identify/remediate placement or retired-row hold before publish |
| Documents/evidence disagree | Medium | High | Tracker authority index and automated consistency check | Migration/WP/decision/rollback facts conflict |

## 11. Preconditions before implementation/local rehearsal

- [ ] Owner approves [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [ ] Owner approves this Change Request for implementation/local rehearsal
- [ ] Parser/hash specification is approved
- [ ] Database/security contract, threat model, decision register, and official
      export specification are approved
- [ ] Backup restore rehearsal approach and local reset procedure are defined
- [ ] Source `/CI/` remains local-only

This gate is P-01. It permits local implementation, scaffolding, automated
tests, and rehearsal. It does not permit Production migration, deploy,
feature enablement, final catalog publication, or silent business-data choices.

### Additional preconditions before final data backfill/candidate freeze

- [ ] Code dictionary decisions are recorded
- [ ] 728-record reconciliation draft is reviewed; all 710 Production outcomes
      needed for the candidate have an approved decision
- [ ] `ITEM-0131` / `ITEM-0139` duplicate decision is recorded
- [ ] Both duplicate baseline rows retain distinct UUID histories; candidate
      retirement, if selected, is recorded as `retire` rather than merge
- [ ] All 16 HDPE Crossing candidate codes are corrected or rejected
- [ ] Production-only 20 rows receive approved code decisions
- [ ] Workbook-only 18 rows remain deferred or receive separate price approval
- [x] Owner-approved legacy `2568.0.0` publication metadata is available via
      P-08: effective `2026-01-01`, approval reference `เอ็นที วทฐฐ./405
      ลงวันที่ 27 พ.ย. 2568`, approval document date `2025-11-27`, publisher
      snapshot `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)`; generated backfill fields
      must not be invented
- [ ] CI runtime assets are approved; source `/CI/` remains local-only

If any of these decisions is still pending, implementation may continue only on
generic/local scaffolding that does not freeze final canonical mappings or
pretend a publishable candidate has been approved.

## 12. Preconditions before Production migration

- [ ] Local schema/functions and full workflow pass from a fresh reset
- [ ] Fresh read-only Production baseline is recorded
- [ ] Fresh encrypted logical backup is complete and restore-tested
- [ ] Production schema drift check matches the migration preflight
- [ ] Security and performance advisors have no unresolved blocker
- [ ] `npm test`, `npm run lint`, `npm run build`, and production audit pass
- [ ] Feature flag defaults to disabled
- [ ] P-20 identity/hash portability is approved and proven
- [ ] Stable request-ID timeout/retry and two-session concurrency tests pass
- [ ] ADR-003 reusable version path passes beyond `2568.1.0`
- [ ] Permanent live DB hotfix `016`/BOQ/Factor F regressions pass
- [ ] Tracked export verifier and documentation consistency checks pass
- [ ] Intended-admin UAT, safe Thai recovery/log correlation, and 710-row
      performance evidence pass
- [ ] Owner explicitly approves the Production migration window

When all checks above are green, package the evidence for owner/verifier review
and request P-12 as a separate decision. Do not proceed to Production when any
evidence is failed, missing, stale, ambiguous, or different from the reviewed
plan.

## 13. Preconditions before publication

- [ ] Production additive migration and compatible application are verified
- [ ] Admin-only smoke passes while the feature flag is disabled
- [ ] The approved 710-row candidate clone preserves all current names/units/prices
- [ ] Approval reference, effective date, approver, and physical archive reference
      are complete
- [ ] Diff totals and all blocking warnings are accepted
- [ ] Draft base still equals the current pointer
- [ ] Excel/PDF generation passes against the candidate in rehearsal
- [ ] P-20-compliant dataset hash and tracked semantic artifact verification pass
- [ ] Stable publish operation ID/concurrency evidence is recorded
- [ ] P-18/P-19 decisions/holds are satisfied for the exact candidate
- [ ] Full-import below/at mass-retirement threshold tests pass and required
      approval evidence is persisted
- [ ] Owner explicitly approves publication of the named version

P-15 is never implied by migration, deploy, or feature enablement.
Publication requires the final exact version, effective date, approval
reference, approval document date, physical archive reference, approver/publisher
snapshot, diff totals, item count, dataset hash, and export filing evidence.

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
- Uncertain retries reuse one operation ID and cannot create duplicate effects.
- Official Excel/PDF hash and count match the selected published version.
- The P-20 hash model reproduces across the approved clean-rehearsal scope.
- Reusable version creation follows ADR-003 beyond the first candidate.
- Live DB hotfix `016`, role/version, transaction rollback, and concurrency
  regressions pass permanently.
- Intended admins can complete and recover from the workflow without
  developer/SQL assistance.
- Existing BOQs and current user flows pass regression checks.
- Pointer restore is audited and does not rewrite historical BOQs.
- No Factor F value is changed, and no old BOQ is backfilled with a guessed
  factor version, under this Master Catalog CR.
- Verification report and release note are signed/complete.

## 16. Approval record

| Gate | Role | Name | Decision | Timestamp | Evidence/reference |
|---|---|---|---|---|---|
| Implement + local rehearsal | Owner | Owner | Approved for implementation/local rehearsal via P-01 | 2026-07-04 | Owner chat approval; Production gates separate |
| Production migration | Owner |  | Not requested; request only after WP-8 evidence review |  | P-12 separate gate |
| Application deploy | Owner |  | Not requested; request only after migration verification |  | P-13 separate gate |
| Feature enablement | Owner |  | Not requested; request only after deploy/admin-only smoke verification |  | P-14 separate gate |
| Publish `2568.1.0` | Owner |  | Not requested |  |  |
| Execution | Executor |  | Pending |  |  |
| Independent verification | Verifier |  | Pending |  |  |

## References

- [Phase 4 architecture plan](./08-phase4-architecture-ci-plan.md)
- [ADR-005 Factor F reference policy](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md)
- [Factor F Change Request](../factor-f/01-versioned-factor-f-change-request.md)
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
- [Post-Factor-F adjustment plan](./22-phase4-post-factor-f-adjustment-plan.md)
- [Implementation execution pack](./23-phase4-implementation-execution-pack.md)
