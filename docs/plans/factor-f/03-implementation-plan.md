# Factor F Versioning Implementation Plan

**Status:** Draft implementation plan — no Production execution authorized
**Date:** 2026-06-28
**Authority:** [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md),
[Factor F Change Request](./01-versioned-factor-f-change-request.md), and
[Readiness/Security Addendum](./02-readiness-and-security-addendum.md)

## 1. Purpose

Implement Factor F versioning without rewriting historical BOQs and without
blocking the Master Catalog Phase 4 plan.

This plan is intentionally explicit because implementation agents must not
guess business rules, source data, approval metadata, migration ordering, or
legacy BOQ provenance.

## 2. Non-Negotiable Rules

1. Do not change live Factor F values before F1 and F2 are deployed and
   verified.
2. Do not backfill old BOQs with `factor_reference_version_id` unless exact
   source evidence exists for each BOQ.
3. Do not auto-reprice submitted, approved, printed, exported, or legacy BOQs.
4. Do not use the latest live Factor F table as fallback for a legacy BOQ with
   an invalid or incomplete snapshot.
5. Do not put Factor F rows in `price_list_versions`.
6. Do not combine Factor F publication and Master Catalog publication in one
   implicit window.
7. Do not invent effective dates, approval references, source names, row counts,
   formula changes, VAT changes, or data-custodian decisions.
8. Do not treat local test data, screenshots, old workbook rows, or remembered
   values as authority for the new Factor F table.

## 3. No-Assumption Register

| Topic | May implementation infer? | Required source |
|---|---|---|
| Current baseline row count | No | Production query result recorded before F2 |
| Current baseline checksum | No | Production canonical checksum recorded before F2 |
| New Factor F values | No | Owner-approved source table |
| New effective date | No | Owner approval / source document |
| Source or approval reference | No | Owner / records custodian |
| Formula change | No | Explicit owner-approved calculation decision |
| VAT change | No | Explicit owner-approved calculation decision |
| Old BOQ factor provenance | No | Row-level source evidence; otherwise leave null |
| Whether to publish F3 before Master Catalog Phase 4 | No | Owner decision based on urgency |
| Full Factor F admin UI | No | Later CR only |

If any required source is missing, stop at the relevant gate and record the
blocker. Do not fill placeholders with plausible values.

## 4. Recommended Ordering

Use this ordering if Factor F must change before Master Catalog Phase 4
publication:

```text
F0 approval
F1 version foundation
F2 current baseline seed
F3 publish approved new Factor F version
Master Catalog Phase 4
F4 duplicate/reprice UX refinement
```

Use this ordering if Factor F can wait:

```text
F0 approval
F1 version foundation
F2 current baseline seed
Master Catalog Phase 4 application work
F3 publish approved new Factor F version
F4 duplicate/reprice UX refinement
```

In both cases, F3 must be a separate approved Production window from Master
Catalog publication.

## 5. Files Expected To Change In F1/F2

Exact filenames may change during implementation, but the implementation must
declare them before editing and keep migration ordering unambiguous.

The repository currently ends at `migrations/011_master_catalog_phase1b_hardening.sql`.
If Factor F F1/F2 is implemented before Master Catalog Phase 4 database work,
reserve the next migration numbers for Factor F. If Master Catalog Phase 4
creates its migrations first, Factor F must move to the next available numbers
after those files. Never reuse a number or create parallel migrations with the
same logical order.

| Area | Expected files |
|---|---|
| Database migration F1 | `migrations/012_factor_f_version_foundation.sql` if Factor F goes first; otherwise the next available migration number |
| Database seed F2 | `migrations/013_factor_f_seed_current_baseline.sql` if Factor F goes first; otherwise the next available migration number or a reviewed runbook SQL if values are sourced live |
| Types | `lib/supabase.ts` or generated DB types if/when generation is introduced |
| Factor utilities | `lib/factorF.ts` only if helper signatures need version metadata; calculation formula should not change |
| Create BOQ | `app/boq/create/page.tsx` |
| Edit BOQ | `app/boq/[id]/edit/page.tsx` |
| BOQ list duplicate | `app/boq/page.tsx` |
| Factor summary | `components/boq/FactorFSummary.tsx` |
| Print | `app/boq/[id]/print/page.tsx` |
| Excel export | `lib/exportBoqExcel.ts` |
| Tests | `tests/factor-f.test.ts`, migration contract tests, focused app/unit tests |
| Docs | Factor F CR, readiness addendum, verification report/runbook if created |

If Master Catalog Phase 4 reserves migration numbers first, rename Factor F
migrations before implementation. Do not create two migration files with the
same logical order.

## 6. F0 — Approval And Freeze

### Inputs

- ADR-005 accepted.
- Factor F CR accepted for the intended depth:
  - F1/F2 foundation only, or
  - F1/F2 plus F3 publication.
- Readiness/Security Addendum accepted for F1.
- Owner records whether F3 is urgent or can wait.

### F0 tasks

1. Record approval decision in the Factor F CR approval table.
2. Record named owner/data custodian roles, even if F3 source values are still
   pending.
3. Freeze this plan as the implementation contract for F1/F2.
4. Confirm no Production Factor F value change is authorized by F0 alone.

### F0 exit criteria

- F1/F2 scope is approved.
- Missing F3 business inputs are explicitly listed as pending, not guessed.
- Implementation branch/migration names are reserved.

## 7. Pre-F1 Technical Audit

Run the queries in the readiness addendum and record results before writing the
F1 migration.

Required audit outputs:

| Output | Required result |
|---|---|
| Current factor row count | Recorded; expected current baseline is 37 only after query confirms it |
| Duplicate `cost_million` count | 0 |
| Invalid factor row count | 0 |
| Ordered threshold inspection | Reviewed by developer/data custodian |
| BOQ snapshot complete/incomplete counts | Recorded; no backfill action implied |
| Legacy `factor_reference` grants | Recorded; broad grants not copied to new tables |

Stop if current `factor_reference` has duplicate thresholds, null/invalid
required numeric values, or an unexpected row count that the owner cannot
explain.

## 8. F1 — Database Foundation

### Tables

Create `factor_reference_versions`:

| Column | Contract |
|---|---|
| `id uuid primary key default gen_random_uuid()` | Stable version id |
| `major integer not null` | Effective BE year or owner-approved major segment |
| `minor integer not null default 0` | Revision |
| `patch integer not null default 0` | Correction |
| `version_string generated` | `major.minor.patch` |
| `name text not null` | Human-readable reference name |
| `status text not null` | `draft`, `active`, or `archived` |
| `effective_date date null` | Required before active publication |
| `source_reference text null` | Required before active publication |
| `approval_reference text null` | Required before active publication |
| `approved_by uuid null` | FK to `auth.users`, `ON DELETE SET NULL` |
| `approved_by_display_name text null` | Immutable display snapshot |
| `approved_at timestamptz null` | Set on publish |
| `published_at timestamptz null` | Set on publish |
| `published_by uuid null` | FK to `auth.users`, `ON DELETE SET NULL` |
| `published_by_display_name text null` | Immutable display snapshot |
| `row_count integer null` | Required for active versions |
| `dataset_hash text null` | `sha256:` + 64 lowercase hex |
| `based_on_version_id uuid null` | Self-FK for drafts |
| `created_by uuid null` | FK to `auth.users`, `ON DELETE SET NULL` |
| `created_at timestamptz not null default now()` | Audit |
| `updated_at timestamptz not null default now()` | Audit |

Create `factor_reference_rows`:

| Column | Contract |
|---|---|
| `id uuid primary key default gen_random_uuid()` | Row id |
| `version_id uuid not null` | FK to `factor_reference_versions`, `ON DELETE RESTRICT` |
| `display_order integer not null` | Deterministic review/export order |
| `cost_million numeric(10,4) not null` | Unique per version |
| `operation_percent numeric(10,4) not null` | Preserve current contract |
| `interest_percent numeric(10,4) not null` | Preserve current contract |
| `profit_percent numeric(10,4) not null` | Preserve current contract |
| `total_expense_percent numeric(10,4) not null` | Preserve current contract |
| `factor numeric(10,4) not null` | BOQ multiplier source |
| `vat_percent numeric(10,4) not null` | Stored reference value |
| `factor_f numeric(10,4) not null` | Preserve current contract |
| `factor_f_rain_1 numeric(10,4) not null` | Preserve current contract unless later approved otherwise |
| `factor_f_rain_2 numeric(10,4) not null` | Preserve current contract unless later approved otherwise |
| `created_at timestamptz not null default now()` | Audit |

Create `factor_reference_default_version`:

| Column | Contract |
|---|---|
| `id boolean primary key default true check (id = true)` | Singleton |
| `version_id uuid not null` | FK to active factor version |
| `updated_at timestamptz not null default now()` | Audit |

Alter `boq`:

| Column | Contract |
|---|---|
| `factor_reference_version_id uuid null` | FK to `factor_reference_versions`, `ON DELETE RESTRICT` |

### Constraints and indexes

- `factor_reference_versions`: `UNIQUE (major, minor, patch)`.
- `factor_reference_versions`: status check in `draft`, `active`, `archived`.
- `factor_reference_rows`: `UNIQUE (version_id, cost_million)`.
- `factor_reference_rows`: `UNIQUE (version_id, display_order)`.
- Positive checks for `cost_million`, `factor`, `factor_f`,
  `factor_f_rain_1`, `factor_f_rain_2`.
- Index `boq(factor_reference_version_id)`.
- Index `factor_reference_rows(version_id, cost_million)`.

### RLS and grants

- Enable RLS immediately on all new Factor F tables.
- Grant `SELECT` to `authenticated` for active/published versions and rows.
- Do not grant direct insert/update/delete on new Factor F tables to `anon`,
  `PUBLIC`, or broad application roles.
- Admin writes must go through reviewed server/database functions.
- Add trigger/function to prevent deleting the singleton pointer.
- Add trigger/function to ensure pointer references only active versions.
- Add trigger/function to prevent direct mutation of active Factor F rows.

### RPC requirements

Update or wrap `save_boq_with_routes` so that:

- it preserves the BOQ's existing `factor_reference_version_id` unless a
  reviewed, explicit recalculation action sets a new one;
- it rejects saving a nonzero BOQ after F1 if no factor version is bound and no
  valid legacy snapshot can be produced;
- later Master Catalog Phase 4 RPC replacements include the same column.

## 9. F1 — Application Foundation

### Create BOQ

- Read `factor_reference_default_version`.
- Insert `boq.factor_reference_version_id` with the pointer value.
- Fail closed if no active factor pointer exists.
- Do not read unscoped `factor_reference` for new BOQs after F1.

### Edit BOQ and Factor Summary

- Load `boq.factor_reference_version_id`.
- For version-bound BOQs, query `factor_reference_rows` by that version.
- For legacy BOQs without a factor version:
  - use valid saved snapshots when displaying saved totals;
  - do not recalculate from the live latest factor table;
  - if editing changes totals and a new factor is needed, require an explicit
    duplicate/reprice or bind/recalculate action defined by the approved UX.

### Print

- Version-bound BOQ: compute supplement from bound rows.
- Legacy with valid snapshot: print from saved snapshot.
- Legacy with invalid/incomplete snapshot: show a blocking error and do not
  fallback to current live factor rows.

### Excel export

- Follow the same decision tree as print.
- Export must not create a Factor F supplement from live current rows for a
  legacy BOQ with invalid snapshot data.

### Duplicate BOQ

There are two different future behaviors. F1 may keep only preserve-copy if the
new-estimate UX is not approved yet.

| Mode | Behavior |
|---|---|
| Preserve historical copy | Copy `price_list_version_id`, `factor_reference_version_id`, item snapshots, and factor snapshots |
| New estimate / reprice | Create a new BOQ using current price catalog and current factor pointer, then recalculate; requires explicit user action |

Do not silently choose new-estimate behavior for the existing duplicate button.

## 10. F2 — Current Baseline Seed

### Inputs

- Current factor row count and checksum from Production.
- Approved baseline version metadata for current table, such as
  `2568.0.0` or another owner-approved version string.
- Approval/source reference for the current baseline if available. If not
  available, mark it as legacy baseline metadata pending and do not invent it.

### Tasks

1. Insert one active `factor_reference_versions` row for the current baseline.
2. Copy current `factor_reference` rows into `factor_reference_rows`.
3. Compute and store canonical `dataset_hash`.
4. Store `row_count`.
5. Insert/update the singleton pointer to the baseline version.
6. Verify new BOQ create path binds this version.

### F2 exit criteria

- Seeded row count equals audited current baseline count.
- Pointer exists exactly once and points to active baseline version.
- No legacy BOQ is backfilled with `factor_reference_version_id`.
- Existing BOQ totals remain unchanged.

## 11. F3 — Publish New Factor F Version

F3 is not part of F1/F2 foundation. Do not start F3 until business inputs are
complete.

### Required owner inputs

- Approved new Factor F table.
- Expected row count.
- Effective date.
- Source/approval reference.
- Data custodian.
- Formula/VAT/column decisions.
- Explicit approval to publish the named version.

### Tasks

1. Create draft factor version based on current baseline.
2. Load the approved new rows.
3. Validate row count, duplicates, nulls, positives, ordering, and dataset
   hash.
4. Produce row-level diff from the current baseline.
5. Obtain owner approval for exact diff/count/hash.
6. Publish version and move singleton pointer in one short transaction.
7. Verify new BOQs bind the new version.
8. Verify existing BOQs and totals did not change.

### Abort conditions

- New source row count does not match owner expectation.
- Formula/VAT/columns differ from approved assumptions.
- Dataset hash changes after approval.
- Any legacy BOQ receives a factor version by assumption.
- Print/export uses live latest rows for invalid legacy snapshots.

## 12. F4 — Duplicate/Reprice UX

F4 can be deferred. When implemented, it must expose two clearly different
actions:

- Duplicate as historical copy.
- Create new estimate with current catalog and current Factor F.

The UI must not use wording that implies old BOQs were updated. The original
BOQ remains unchanged and auditable.

## 13. Verification Matrix

| Scenario | Expected result |
|---|---|
| New BOQ after F1 | Has `factor_reference_version_id` |
| Legacy BOQ after F1 | Keeps null `factor_reference_version_id` |
| Legacy valid snapshot print | Uses saved snapshot |
| Legacy invalid snapshot print | Fails closed |
| Legacy invalid snapshot Excel | Fails closed |
| Version-bound print | Uses bound version rows |
| Version-bound Excel | Uses bound version rows |
| Save version-bound BOQ | Preserves factor version |
| Publish new factor version | Moves pointer only |
| Existing BOQ after F3 | Totals unchanged |
| Non-admin direct insert row | Rejected |
| Delete singleton pointer | Rejected |

## 14. Rollback And Forward-Fix

F1 and F2 are additive. Prefer forward-fix over destructive rollback.

| Failure | Response |
|---|---|
| F1 migration fails before commit | Fix migration and rerun in rehearsal; do not proceed to Production |
| F1 migration succeeds but app fails | Keep feature-compatible old behavior disabled; forward-fix app before F2/F3 |
| F2 seed count mismatch | Stop; do not move pointer; investigate source/audit query |
| New BOQ cannot bind factor version | Disable create path if needed and forward-fix pointer/app logic |
| Print/export regression | Do not publish F3; forward-fix before any Factor F value change |
| F3 publish fails | Leave pointer on previous version; fix draft/source and rerun approval |
| F3 publishes wrong pointer | Use reviewed pointer restore only; do not edit published rows |

## 15. Implementation Prompts For Agents

When giving this work to an AI/dev agent, include these rules:

```text
Read ADR-005, Factor F CR, readiness addendum, and this implementation plan.
Do not infer any missing business data.
Do not backfill legacy BOQs.
Do not change Factor F values in F1/F2.
Do not update print/export to fallback to latest live Factor F for legacy BOQs.
List files and migration names before editing.
After editing, run diff checks and the focused tests available locally.
Stop and report blockers when owner inputs are missing.
```

## 16. Implementation Ready Checklist

F1/F2 is ready to implement only when:

- [ ] F0 approval is recorded.
- [ ] This plan is accepted.
- [ ] Current baseline audit queries are ready to run.
- [ ] Migration names are reserved.
- [ ] App coupling list is accepted.
- [ ] Test list is accepted.
- [ ] No one expects F1/F2 to publish new Factor F values.

F3 is ready only when:

- [ ] F1/F2 are deployed and verified.
- [ ] Approved new Factor F source table is available.
- [ ] Effective date is recorded.
- [ ] Source/approval reference is recorded.
- [ ] Expected row count is recorded.
- [ ] Formula/VAT/column decisions are recorded.
- [ ] Exact diff/count/hash is approved.
