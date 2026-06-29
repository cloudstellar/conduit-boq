# Master Catalog Phase 4 Verification Report

**Status:** Template — Phase 4 implementation not started
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Candidate version:** `2568.1.0` (pending owner approval)

## 1. How to use this report

Fill every applicable evidence cell. Use `Passed`, `Failed`, `Blocked`, or
`Not applicable` with a reason; do not leave an executed gate ambiguous.
Point-in-time counts must include timestamp/time zone and source. A failed
blocking gate stops the rollout.

## 2. Execution summary

| Phase | Environment | Executor | Started | Completed | Result | Evidence |
|---|---|---|---|---|---|---|
| 4-0 documents/data decisions | Repository |  |  |  | Pending |  |
| 4A additive schema | Local |  |  |  | Pending |  |
| 4B application/workflows | Local |  |  |  | Pending |  |
| 4C clean rehearsal | Local |  |  |  | Pending |  |
| 4A migration | Production |  |  |  | Not authorized |  |
| Application deploy, flag off | Production |  |  |  | Not authorized |  |
| Feature enablement | Production |  |  |  | Not authorized |  |
| Publish `2568.1.0` | Production |  |  |  | Not authorized |  |
| Closeout | Production |  |  |  | Pending |  |

## 3. Approval gates

| Gate | Approver | Decision | Timestamp | Reference |
|---|---|---|---|---|
| ADR-004 |  | Pending |  |  |
| Implement/local rehearsal |  | Pending |  |  |
| DB/security contract + threat model |  | Pending |  |  |
| Official export specification |  | Pending |  |  |
| Post-Factor-F Adjustment Plan reviewed |  | Pending |  |  |
| Implementation Execution Pack reviewed |  | Pending |  |  |
| Code dictionary |  | Pending |  |  |
| Row reconciliation |  | Pending |  |  |
| Production migration |  | Not requested |  |  |
| Application deployment |  | Not requested |  |  |
| Feature enablement |  | Not requested |  |  |
| Publish named version |  | Not requested |  |  |

## 4. Known preparation baseline

Read-only Supabase MCP evidence on 2026-06-22:

| Check | Preparation baseline |
|---|---:|
| Price rows / distinct item codes | 710 / 710 |
| Missing code / name-unit / costs | 0 / 0 / 0 |
| Unit-cost mismatch | 0 |
| Version rows / active versions / pointers | 1 / 1 / 1 |
| Current version | `2568.0.0` active/default |
| BOQs / BOQ items / routes | 198 / 1,547 / 217 |

This is not a substitute for live preflight.

Post-Factor-F rollout closeout evidence on 2026-06-29:

| Check | Observed result |
|---|---:|
| Latest migration ledger | `20260628190757_factor_f_repair_legacy_snapshot_metadata` |
| Price rows / default version | 710 / `2568.0.0` |
| Factor F default version | `2569.0.0` |
| Factor F active versions | `2566.0.0`, `2569.0.0` |
| BOQs / BOQs with price version gap | 207 / 0 at closeout only |
| BOQs bound to Factor F version | 1 at closeout only |
| Legacy usable Factor F snapshots | 127 at closeout only |
| Legacy BOQs missing Factor F snapshot | 79 at closeout only |

These are point-in-time observations. Use them to understand the mixed BOQ
population, not as fixed rollout expectations. Users may create BOQs after
closeout, so every Phase 4 Production gate must use the live preflight table
below as the source of truth for total BOQs, bound Factor F BOQs, and legacy
snapshot states.

## 5. Fresh Production preflight

| Check | Expected | Actual | Timestamp/source | Result |
|---|---|---|---|---|
| Price rows | Approved live baseline |  |  | Pending |
| Distinct item codes | Equals price rows |  |  | Pending |
| Missing required values | 0 |  |  | Pending |
| Unit-cost mismatch | 0 |  |  | Pending |
| Duplicate item codes | 0 |  |  | Pending |
| Current active/default version | One expected version |  |  | Pending |
| Default pointer rows | 1 |  |  | Pending |
| BOQ version gaps/cross-version items | 0 |  |  | Pending |
| Factor F default version | Active expected default |  |  | Pending |
| Factor F version row counts/hashes | Match published metadata |  |  | Pending |
| BOQ Factor F binding split | Recorded live; no unexplained mutation |  |  | Pending |
| Legacy Factor F snapshot states | Recorded live; no partial repair regression |  |  | Pending |
| Factor F pointer mutation plan | No Phase 4 step may change it |  |  | Pending |
| Supabase advisor baseline | No new or untriaged Phase 4 security/performance finding |  |  | Pending |
| Unexpected active admin activity | 0 |  |  | Pending |
| Migration ledger drift | Latest includes Factor F `015`; no unexpected newer migration |  |  | Pending |

## 6. Backup and restore

| Check | Evidence | Result |
|---|---|---|
| Pre-migration encrypted logical backup |  | Pending |
| Manifest with table counts/fingerprints |  | Pending |
| Sensitive auth fields excluded |  | Pending |
| Restore to clean Local |  | Pending |
| Restored counts/checksums match |  | Pending |
| Post-publish logical backup |  | Pending |

## 7. Reconciliation and code governance

| Check | Expected | Actual | Result |
|---|---:|---:|---|
| Production UUID coverage | 710 |  | Pending |
| Workbook rows with outcome | 708 |  | Pending |
| Exact price matches reproduced | 648 |  | Pending |
| Price-difference matches reproduced | 42 |  | Pending |
| Production-only decisions | 20 |  | Pending |
| Workbook-only deferred/approved decisions | 18 |  | Pending |
| HDPE Crossing blockers unresolved | 0 |  | Pending |
| Duplicate identity decision unresolved | 0 |  | Pending |
| Canonical code reused across identity | 0 |  | Pending |
| Missing reviewer/date on exceptions | 0 |  | Pending |

Approved reconciliation fingerprint: `____________________________`

Approved dictionary fingerprint: `_______________________________`

## 8. Local schema verification

| Check | Expected | Actual/evidence | Result |
|---|---|---|---|
| Clean reset + migrations | Success |  | Pending |
| 710 identities/legacy code registrations | Exact |  | Pending |
| Published baseline identity merges | 0 |  | Pending |
| Category backfill | Approved count |  | Pending |
| Display-order backfill | Unique `ITEM-####` numeric suffix; 710 covered |  | Pending |
| New-item display order | Prior maximum + 1 |  | Pending |
| Import parser profile ID/version stored | Exact |  | Pending |
| Code allocation at sequence 900 | Blocking capacity-review error |  | Pending |
| New structured version rows | 710 before approved add/retire |  | Pending |
| New foreign keys indexed | All |  | Pending |
| Unique version/code and version/identity | Enforced |  | Pending |
| Unit-cost check validated | Enforced |  | Pending |
| Published row/metadata immutability | Enforced |  | Pending |
| Pointer/legacy `is_default` consistency | Exact |  | Pending |
| New `catalog_admin_enabled` value type/default | JSON boolean / `false` |  | Pending |
| Private mutation functions unexposed | Confirmed |  | Pending |
| Data API grants explicit | Confirmed |  | Pending |
| `boq.factor_reference_version_id` FK/index/immutability trigger | Preserved |  | Pending |
| Factor F version tables/pointer/RLS/grants | Unchanged by Phase 4 migration |  | Pending |
| `save_boq_with_routes` replacement, if any | Preserves price version and Factor F version contracts |  | Pending |

## 9. RLS and authorization matrix

| Actor | Read published catalog | Read admin audit | Mutate draft | Publish/restore | Result |
|---|---|---|---|---|---|
| Anonymous | No | No | No | No | Pending |
| Authenticated non-admin | Approved published read only | No | No | No | Pending |
| Pending/inactive admin profile | No admin access | No | No | No | Pending |
| Active admin | Yes | Yes | Yes | Yes | Pending |
| Direct REST write to audit/import table | N/A | N/A | Rejected | Rejected | Pending |

Also verify:

- update policies have required select visibility;
- policy columns/functions use appropriate indexes and `(select auth.uid())`
  pattern where applicable;
- no `user_metadata` controls authorization;
- no secret/service-role key in client bundle;
- public wrappers revoke `PUBLIC` and `anon` execution;
- definer functions have empty `search_path`, fully qualified objects, approved
  owner, and unexposed private schema;
- direct authenticated table writes fail even for active admin;
- feature flag never substitutes for role/status authorization.

## 10. Parser and import verification

| Test | Expected | Result/evidence |
|---|---|---|
| Exact workbook/profile | Detected | Pending |
| Wrong sheet/header/profile | Clear rejection | Pending |
| Formula/error/nonnumeric required cell | Rejected | Pending |
| Macro/external link/embedded object | Never executed or persisted | Pending |
| File >20 MB | Client rejection | Pending |
| Rows >1,500 | Rejected | Pending |
| Normalized body >750 KB | Client and server rejection | Pending |
| K fields | Excluded/rejected | Pending |
| Full omission | Retires only after warning/approval | Pending |
| Full retirement below threshold | Warning + exact diff; no bulk approval required | Pending |
| Full retirement at `max(10, ceil(2%))` | Apply blocked without typed count and owner reference | Pending |
| Supplement omission | Leaves unchanged | Pending |
| Unauthorized price delta | Rejected | Pending |
| Client-tampered payload | Server rejection | Pending |
| Duplicate request ID | One effect/consistent result | Pending |
| Import status lifecycle | UI-only preview; `validated/rejected`; one transition to `applied` | Pending |
| Validation/apply request IDs | Separate and idempotent | Pending |
| Import full old/new snapshots | Complete | Pending |
| Filed source independently rehashed | Matches recorded client fingerprint | Pending |

## 11. Manual change and history

| Test | Expected | Result/evidence |
|---|---|---|
| Manual add/edit/retire/recode on draft | Success with reason | Pending |
| Same actions on published version | Rejected | Pending |
| Blank reason | Rejected | Pending |
| Stale lock version | `DRAFT_LOCK_CONFLICT` | Pending |
| Stale base version | Old draft read-only/nonpublishable; recreate and reapply | Pending |
| History through recode | Same identity timeline | Pending |
| Actor/display name/timestamp/source | Complete | Pending |
| Audit update/delete | Rejected | Pending |

## 12. Publication tests

| Test | Expected | Result/evidence |
|---|---|---|
| Missing approval evidence | Rejected | Pending |
| Stale base pointer | `DRAFT_BASE_STALE` | Pending |
| Duplicate publish request ID | No duplicate effect | Pending |
| Publish transaction | Atomic | Pending |
| Dataset count/hash from DB | Stored | Pending |
| Pointer and `is_default` sync | Exact | Pending |
| Previous version remains readable | Yes | Pending |
| Former current version after publish | Still Published/Active; immutable; not automatically archived | Pending |
| Published row mutation | Rejected | Pending |
| Pointer restore | Audited; BOQs unchanged | Pending |
| Factor F pointer after catalog publish | Unchanged from preflight | Pending |
| BOQ Factor F bindings after catalog publish | No mutation | Pending |

## 13. Canonical hash and export

| Check | Expected | Actual | Result |
|---|---|---|---|
| Golden fixture hash | `sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5` |  | Pending |
| Published item count | Approved count |  | Pending |
| Published dataset hash | One stored value |  | Pending |
| Excel visible business-row count | Exact match |  | Pending |
| Excel `_canonical_row_json` reconstruction | Exact UTF-8 dataset hash |  | Pending |
| PDF server-verified printed count/hash | Exact match |  | Pending |
| Older-version export | Uses selected version |  | Pending |
| Draft export watermark | `DRAFT – ห้ามใช้อ้างอิง` |  | Pending |
| Published stamp | Version/effective date/published at/by/count/hash |  | Pending |
| Excel numeric cell types | Numeric, formatted |  | Pending |
| Excel exact 5 sheets/headers; no formulas/external links | Exact |  | Pending |
| PDF Thai font/header/page/clipping | Correct |  | Pending |
| Short dataset hash | Exactly `sha256:` + first 12 hex + `…`; full hash also present |  | Pending |
| Catalog export dataset/hash excludes Factor F rows | Confirmed |  | Pending |
| BOQ print/export regression | Catalog version and Factor F version/snapshot labels still correct |  | Pending |

Official export file/reference and binary SHA-256 (different from dataset hash):

- Excel: `__________________________________________________________`
- Excel binary SHA-256: `____________________________________________`
- PDF: `____________________________________________________________`
- PDF binary SHA-256: `______________________________________________`

## 14. Application regression and UI/UX

| Flow/check | Desktop | Mobile | Result/evidence |
|---|---|---|---|
| Dashboard |  |  | Pending |
| Price List search/count |  |  | Pending |
| BOQ list/search |  |  | Pending |
| Create BOQ |  |  | Pending |
| Edit/save BOQ |  |  | Pending |
| Duplicate Preserve |  |  | Pending |
| Print “แบบ ปร.1” |  |  | Pending |
| Existing BOQ export |  |  | Pending |
| Existing version-bound BOQ Factor F label |  |  | Pending |
| Existing legacy snapshot-only BOQ print/export |  |  | Pending |
| Existing legacy missing-Factor-F BOQ failure state |  |  | Pending |
| Catalog version list/detail |  |  | Pending |
| Import/diff/manual/history |  |  | Pending |
| Keyboard/focus/errors/contrast |  |  | Pending |
| NT font/logo/color/spacing |  |  | Pending |
| Browser console/server errors |  |  | Pending |

Dashboard personal/system labels must remain unchanged unless a separate change
request approves them.

## 15. Quality and advisor gates

| Gate | Expected | Actual | Result |
|---|---|---|---|
| `npm test` | Exit 0 |  | Pending |
| `npm run lint` | Exit 0 |  | Pending |
| `npm run build` | Exit 0 |  | Pending |
| `npm run audit:prod` | No unaccepted Production vulnerability |  | Pending |
| Security advisor | No new blocker |  | Pending |
| Performance advisor | No rollout blocker |  | Pending |
| CI exact commit | Passed |  | Pending |
| Vercel Preview/Production | Passed |  | Pending |

Accepted warnings require owner/technical rationale and remediation owner/date:

| Warning | Rationale | Owner | Due date |
|---|---|---|---|
|  |  |  |  |

## 16. Final state

| State | Expected | Actual | Result |
|---|---|---|---|
| Feature flag | Approved final value |  | Pending |
| Current pointer | Approved version |  | Pending |
| Pointer row count | 1 |  | Pending |
| Legacy flag agreement | Exact |  | Pending |
| Historical BOQs rewritten | 0 |  | Pending |
| Historical BOQ `factor_reference_version_id` mutations | 0 |  | Pending |
| Factor F default pointer/hash changed by Phase 4 | 0 |  | Pending |
| Pre/post backup filed | Yes |  | Pending |
| Official Excel/PDF filed | Yes |  | Pending |
| Release note complete | Yes |  | Pending |

## 17. Sign-off

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Owner |  | Pending |  |  |
| Executor |  | Pending |  |  |
| Verifier |  | Pending |  |  |
| Taxonomy reviewer |  | Pending |  |  |
| Price authority |  | Pending |  |  |

Final decision: `Pending / Accepted / Accepted with exceptions / Rejected`
