# Factor F Implementation Log

**Purpose:** Durable working log for Factor F implementation decisions and
actions. This file records what was actually done so later reviewers and AI
agents do not infer missing context.

## Current Branch

| Date | Branch | Reason |
|---|---|---|
| 2026-06-28 | `codex/factor-f-versioning-f1` | Split Factor F F1 implementation from `codex/master-catalog-phase4-design` so Factor F can be reviewed/deployed before Master Catalog Phase 4 if approved. |

## Production Contact Rules

- Production Supabase MCP is read-only for planning/audit unless the owner
  explicitly approves a production migration execution.
- No production schema/data changes have been executed for Factor F F1.
- Factor F value publication is not part of F1.

## Production Baseline Already Recorded

| Topic | Recorded result |
|---|---|
| Supabase project | `Conduit Price List` / `otlssvssvgkohqwuuiir` |
| Latest production migration ledger | `20260621104056_master_catalog_phase1b_hardening` |
| Corresponding root migration | `migrations/011_master_catalog_phase1b_hardening.sql` |
| Existing Factor F version tables | None found |
| `boq.factor_reference_version_id` | Not present before F1 |
| Legacy `factor_reference` rows | 37 rows |
| Duplicate `cost_million` thresholds | 0 |
| Invalid required Factor F rows | 0 |
| BOQ snapshot coverage | 206 total BOQs; 70 complete snapshots; 136 incomplete snapshots |
| Legacy grants | Broad grants exist on `factor_reference`; do not copy them to new version tables |

## Local Actions

| Date | Action | Files | Production effect |
|---|---|---|---|
| 2026-06-28 | Added draft F1 migration foundation. | `migrations/012_factor_f_version_foundation.sql` | None |
| 2026-06-28 | Added Factor F version-aware lookup helpers and condition formatter. | `lib/factorF.ts`, `lib/factorFReference.ts` | None |
| 2026-06-28 | Updated edit calculation path to require a bound Factor F version instead of reading the unscoped live table. | `app/boq/[id]/edit/page.tsx`, `components/boq/MultiRouteEditor.tsx`, `components/boq/FactorFSummary.tsx` | None |
| 2026-06-28 | Updated duplicate behavior to preserve historical Factor F binding and interpolation snapshot fields. | `app/boq/page.tsx`, `lib/supabase.ts` | None |
| 2026-06-28 | Updated print/Excel paths to use version-scoped Factor F rows when a BOQ is version-bound and to avoid live-table fallback for invalid legacy snapshots. | `app/boq/[id]/print/page.tsx`, `lib/exportBoqExcel.ts` | None |
| 2026-06-28 | Aligned ADR/CR/readiness/ledger wording with pointer-optional F1 and F2/default-pointer binding. | `docs/02_architecture/ADR/ADR-005-versioned-factor-f-reference.md`, `docs/plans/factor-f/*.md`, `docs/04_data/*.md`, `docs/01_overview/IMPLEMENTATION_PLAN.md` | None |
| 2026-06-28 | Added F2 current-baseline runbook and owner-decision checklist before creating migration 013. | `docs/plans/factor-f/06-f2-current-baseline-runbook.md` | None |

## Implementation Decisions During F1

| Date | Decision | Reason |
|---|---|---|
| 2026-06-28 | `trigger_set_default_factor_reference_version` auto-binds only empty new BOQ drafts where `factor_reference_version_id IS NULL`, `factor_f IS NULL`, and `total_cost = 0`. | Prevents legacy duplicate/copy rows with saved totals from being silently assigned the current Factor F version, which would create false provenance. |
| 2026-06-28 | F1 migration remains pointer-optional until F2 seeds the audited current baseline pointer. | Avoids breaking BOQ creation if F1 and F2 are not applied in the same instant. F2 remains the gate where new empty BOQs can bind the default version. |
| 2026-06-28 | Legacy BOQs without a Factor F version may use valid saved snapshots for print/export but must not recalculate from the latest live `factor_reference` table. | Matches ADR-005 snapshot-only policy and avoids hidden repricing. |
| 2026-06-28 | `trigger_set_default_factor_reference_version` validates active status only when `NEW.factor_reference_version_id IS NOT NULL`. | A local rollback test found the earlier `NOT EXISTS` branch rejected intentional `NULL` legacy duplicate rows. |
| 2026-06-28 | Active Factor F versions require source/approval/published/hash metadata, but not `effective_date` at the database constraint level. | Production current baseline does not contain exact source effective-date evidence; F2 must not invent one. F3/official publication must assert its own effective date. |

## Local Verification

| Date | Check | Result |
|---|---|---|
| 2026-06-28 | `git diff --check` | Passed |
| 2026-06-28 | `npm run lint` | Passed with existing warnings; no errors |
| 2026-06-28 | `npm run test -- tests/factor-f.test.ts tests/calculation.test.ts` | Passed; 2 files, 9 tests |
| 2026-06-28 | `npx tsc --noEmit --pretty false` | Passed |
| 2026-06-28 | Local Supabase baseline schema check | Passed; `boq`, `factor_reference`, and `price_list_versions` exist |
| 2026-06-28 | Local apply of `migrations/012_factor_f_version_foundation.sql` via Postgres container `psql -f` | Passed |
| 2026-06-28 | Local F1 verification query | Passed; new tables exist, `boq.factor_reference_version_id` exists, `backfilled_boq_count = 0` |
| 2026-06-28 | Local RLS/grant verification | Passed; RLS enabled on all new Factor F tables; `authenticated` has `SELECT`; `anon` has no grants on new tables |
| 2026-06-28 | Local trigger rollback test | Passed; empty new BOQ draft auto-bound the default Factor F version, duplicate-like legacy row stayed `NULL`, transaction rolled back |
| 2026-06-28 | Production MCP F2 baseline re-audit | Passed; `factor_reference` has 37 rows, 0 duplicate thresholds, 0 invalid required rows, min/max 5.0000/700.0000, dataset hash `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |

## F1 Scope Guard

F1 may add:

- Factor F version metadata table.
- Version-scoped Factor F rows table.
- Singleton default pointer table.
- Nullable `boq.factor_reference_version_id`.
- RLS, grants, pointer validation, and immutability triggers.
- App compatibility needed to bind new BOQs after F2 establishes the pointer.

F1 must not:

- Seed current Factor F rows.
- Publish the 26 June 2026 / ว481 Factor F values.
- Backfill legacy BOQs with a factor version.
- Change existing BOQ calculation results.
- Apply anything to Production without a separate owner-approved runbook step.

## Next Review Items

- Review `migrations/012_factor_f_version_foundation.sql` against ADR-005 and
  the F1 implementation plan.
- Decide whether the pointer-optional F1 behavior is acceptable for deployment,
  or whether F1 and F2 must be deployed in one approved maintenance window.
- Run the same SQL verification on staging or a Supabase branch before any
  Production execution.
- Review whether local DB should be reset after this verification run.
- Owner must choose the F2 legacy baseline version identity before migration
  `013_factor_f_seed_current_baseline.sql` is created.
