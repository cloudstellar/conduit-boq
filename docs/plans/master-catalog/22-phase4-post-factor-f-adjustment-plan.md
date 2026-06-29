# Phase 4 Post-Factor-F Adjustment Plan

**Status:** Draft for owner and implementation review
**Prepared:** 2026-06-29
**Scope:** Reassess and adjust Master Catalog Phase 4 after the completed
Factor F versioning rollout

## 1. Difficulty assessment

This is **moderate difficulty**, not a full redesign.

The hard part is not building more tables. The hard part is keeping two
official reference axes independent everywhere:

| Axis | Owns | Current production state |
|---|---|---|
| Master Catalog | Item identity, item code, name, unit, material cost, labor cost, unit cost, category/classification | `price_list_versions` default `2568.0.0`, 710 rows |
| Factor F | Factor calculation reference rows and condition text | `factor_reference_versions` default `2569.0.0`; active `2566.0.0` and `2569.0.0` |

Overall difficulty by area:

| Area | Difficulty | Why |
|---|---|---|
| Documentation and approvals | Medium | Existing docs are mostly updated, but owner gates must explicitly include the new two-axis baseline. |
| Database migration `016+` | Medium-high | Additive catalog schema is normal, but migration must preserve Factor F FK, triggers, pointer, RLS, and existing mixed BOQ states. |
| Admin catalog UI | Medium | Mostly new isolated UI; must not accidentally reuse BOQ Factor F flows or current-factor defaults. |
| BOQ regression | High attention, medium implementation | Existing create/edit/duplicate/print/export are already Factor-F-aware, but Phase 4 can break them if it replaces save/duplicate/export paths. |
| Import/hash/export | Medium | Catalog hash must remain catalog-only; Factor F must be shown only in BOQ documents, not catalog exports. |
| Production rollout | Medium-high | Requires fresh live counts because users continue creating BOQs after the Factor F closeout. |

Practical estimate for a careful implementation:

| Workstream | Rough effort |
|---|---:|
| Final owner decisions and docs freeze | 0.5-1 day |
| Phase 4A local additive schema + migration review | 2-4 days |
| Phase 4B admin UI/import/publish/export | 5-8 days |
| Regression, RLS matrix, local rehearsal, runbook evidence | 2-4 days |
| Production migration/deploy/enable/publish closeout | 0.5-1 day, after approvals |

The schedule risk is driven more by business decisions on the 710-row mapping
than by Factor F.

## 2. What Factor F changed

Before the Factor F rollout, Phase 4 could think mostly in one official
version axis: the price catalog. After the rollout, the system has a durable
two-axis model:

1. New BOQs bind `boq.price_list_version_id` from
   `price_list_default_version`.
2. New BOQs bind `boq.factor_reference_version_id` from
   `factor_reference_default_version`.
3. Existing BOQs keep their catalog version.
4. Existing BOQs may be either:
   - Factor-F-version-bound;
   - legacy snapshot-only with a usable saved Factor F snapshot;
   - legacy missing/invalid Factor F snapshot and therefore fail-closed.
5. Factor F publication, pointer movement, and legacy backfill are outside
   Master Catalog Phase 4.

This means Master Catalog Phase 4 can publish catalog `2568.1.0` while
preserving the completed Factor F `2569.0.0` baseline.

## 3. Decision: do not redesign Phase 4

The reviewed Phase 4 architecture remains valid.

Keep:

- stable item identity;
- append-only code registry;
- draft/import/manual change sets;
- immutable publish;
- official Excel/PDF catalog export;
- audited pointer restore;
- feature-flagged rollout;
- BOQ Rebase deferred to Phase 4.2.

Adjust:

- migration order starts at `016+`;
- every preflight includes Factor F pointer/version/snapshot checks;
- every BOQ regression proves both version axes are preserved;
- catalog dataset hash/export excludes Factor F rows and metadata;
- any replacement of `save_boq_with_routes` must preserve the Factor F
  immutability contract.

## 4. Plan changes required before implementation

| Plan area | Previous assumption | Adjusted plan |
|---|---|---|
| Migration numbering | Phase 4 could follow `011` directly | Phase 4 database files start at `016+` after Factor F `012-015`. |
| Production baseline | Catalog-only baseline was enough | Baseline must record catalog state plus Factor F default, active factor versions, row hashes, BOQ binding split, and legacy snapshot states. |
| New BOQ creation | Bind current catalog version | Bind current catalog version and current Factor F version independently. |
| BOQ duplicate | Preserve catalog version and item snapshots | Preserve catalog version, Factor F version, and Factor F snapshots. |
| BOQ reprice/copy | Future/deferred | Narrow Factor F copy path already exists; Phase 4 must not replace it accidentally. Full BOQ Rebase remains Phase 4.2. |
| Save RPC | Version-aware catalog save | If wrapped/replaced, it must not update `boq.factor_reference_version_id`; it only saves snapshot values calculated from the BOQ's bound Factor F version. |
| Catalog import | Catalog data only | Reject or ignore Factor F-looking columns; never publish Factor F through a catalog import. |
| Catalog export hash | Catalog rows | Catalog rows only. Do not include Factor F rows, factor metadata, BOQ snapshots, or BOQ totals. |
| Verification | Existing BOQs retain versions and totals | Add explicit checks for Factor F pointer unchanged, no BOQ factor-version mutation, and correct print/export labels for bound and legacy BOQs. |

## 5. Detailed adjusted implementation sequence

### 5.1 Phase 4-0: pre-implementation freeze

Goal: make sure implementation starts from the post-Factor-F truth.

Required work:

- Confirm owner approval for P-01 still applies after Factor F completion.
- Treat this plan as a companion to Revision 8, not as a replacement.
- Freeze the exact expected migration order: next Master Catalog migration is
  `016`.
- Refresh local docs to say Factor F rollout is complete and not bundled into
  Phase 4.
- Confirm the Master Catalog Production window contains no Factor F work.
- Refresh live preflight queries immediately before any Production gate.

Exit criteria:

- Latest Production ledger includes Factor F `015`.
- Current Factor F default is recorded.
- Active Factor F versions and dataset hashes are recorded.
- BOQ Factor F binding split is recorded.
- No Phase 4 owner decision implies Factor F pointer movement.

### 5.2 Phase 4A local database foundation

Goal: add catalog governance without disturbing BOQs or Factor F.

Required work:

- Create migration with Supabase CLI, using the next generated filename for
  logical migration `016`.
- Add Phase 4 catalog tables and metadata columns:
  identities, code registry, categories, code groups, imports, change sets,
  change items, lineage, approval, count/hash, lock version.
- Backfill catalog identity/category/code data from the approved 710-row
  baseline.
- Add RLS, explicit grants, private mutation functions, public wrappers, and
  immutability triggers.
- Preserve existing BOQ columns and triggers:
  `boq.price_list_version_id`,
  `boq.factor_reference_version_id`,
  `trigger_prevent_boq_version_modification`,
  `trigger_prevent_boq_factor_reference_version_modification`.
- Do not alter:
  `factor_reference_versions`,
  `factor_reference_rows`,
  `factor_reference_default_version`,
  published Factor F rows, or Factor F pointer state.

Database assertions:

- `boq.factor_reference_version_id` FK and index still exist.
- Factor F default pointer before migration equals pointer after migration.
- Count and hash for active Factor F versions are unchanged.
- Count of BOQs with non-null `factor_reference_version_id` is unchanged.
- Count of legacy partial snapshots remains zero after migration.
- No Master Catalog table references Factor F rows as part of catalog identity
  or dataset hash.

### 5.3 Phase 4B local application foundation

Goal: build catalog admin workflows while preserving current BOQ behavior.

Required work:

- Add `/admin/catalog` routes behind `catalog_admin_enabled`.
- Add version list/detail, draft clone, manual edit, import validation, diff,
  item history, publish, pointer restore, and official export.
- Keep BOQ create/edit/duplicate/print/export flows working as they do now.
- Use generated database types after migration.
- Keep ExcelJS dynamically loaded for export/import interactions.
- Add regression fixtures for:
  - current default catalog + current default Factor F BOQ creation;
  - preserve duplicate;
  - selected Factor F copy/reprice;
  - legacy snapshot-only print/export;
  - legacy missing Factor F fail-closed state;
  - old catalog version export after a new catalog publish.

Application rules:

- Catalog UI may display that Factor F is separate, but must not edit Factor F.
- Catalog export must never query Factor F tables for dataset construction.
- BOQ print/export may show Factor F version/snapshot labels, but that is a
  BOQ document concern, not a catalog export concern.

### 5.4 Phase 4C local rehearsal

Goal: prove the combined post-Factor-F baseline survives the full catalog
workflow.

Rehearsal path:

1. Restore refreshed Production data locally.
2. Apply Phase 4 `016+` migrations.
3. Record before/after catalog counts.
4. Record before/after Factor F pointer, active versions, row counts, and
   hashes.
5. Clone `2568.0.0` to candidate `2568.1.0`.
6. Apply approved code/classification changes only.
7. Publish `2568.1.0`.
8. Export official catalog Excel/PDF and verify count/hash.
9. Verify new BOQ creation binds:
   - price catalog `2568.1.0`;
   - Factor F current default, currently `2569.0.0`.
10. Verify existing BOQs still print/export or fail closed according to their
    own Factor F state.
11. Restore catalog pointer to previous published version in rehearsal and
    confirm BOQs remain unchanged.

Exit criteria:

- Catalog publish changes only catalog pointer and catalog data.
- Factor F pointer unchanged.
- Historical BOQ `price_list_version_id` unchanged.
- Historical BOQ `factor_reference_version_id` unchanged.
- BOQ saved Factor F totals/snapshots unchanged unless the user created a new
  copy and saved it deliberately.

### 5.5 Production rollout

Goal: deploy safely with separate gates.

Production sequence:

1. Fresh read-only preflight:
   catalog, Factor F, BOQ binding split, migration ledger, admin activity.
2. Logical backup and restore verification.
3. Apply additive Phase 4 migration with feature flag disabled.
4. Deploy compatible app with feature flag disabled.
5. Admin-only smoke:
   catalog reads, direct-write denial, function grants, BOQ create/print/export.
6. Enable feature flag for active admin.
7. Rehearse clone/import/manual/publish on the approved candidate only.
8. Publish catalog `2568.1.0` after explicit owner approval.
9. Generate and file official catalog Excel/PDF.
10. Post-publish backup and verification report.

Abort conditions:

- Factor F default pointer changes during a Master Catalog step.
- Any historical BOQ gains or loses `factor_reference_version_id`.
- Any published Factor F row count/hash changes.
- Legacy snapshot-only BOQ starts using current Factor F automatically.
- Catalog dataset hash includes Factor F data.
- `save_boq_with_routes` replacement changes Factor F binding behavior.

## 6. Required test additions

Keep existing tests and add/confirm these gates before Production:

| Test group | Required checks |
|---|---|
| Migration contract | `016+` does not update `factor_reference_default_version`, `factor_reference_rows`, or `boq.factor_reference_version_id`. |
| RLS/grants | New catalog tables have RLS and explicit grants; Factor F table grants remain unchanged. |
| BOQ create | New BOQ binds both current catalog pointer and current Factor F pointer. |
| BOQ preserve duplicate | Copy keeps catalog version, Factor F version, item snapshots, and Factor F snapshots. |
| BOQ Factor F copy | New copy uses selected active Factor F version and resets Factor F snapshot fields. |
| Legacy print/export | Valid legacy snapshot prints/exports without claiming current Factor F version. |
| Legacy fail-closed | Missing/invalid legacy snapshot does not fallback to current Factor F. |
| Catalog publish | Moves only catalog pointer and legacy `is_default` mirror. |
| Catalog export | Hash/count exclude Factor F rows and BOQ data. |
| Pointer restore | Restores catalog pointer only; BOQ catalog and Factor F bindings unchanged. |

## 7. Risk register after adjustment

| Risk | Severity | Control |
|---|---|---|
| Phase 4 migration accidentally changes Factor F pointer | High | Explicit before/after pointer assertion and migration contract test. |
| New catalog export includes Factor F metadata because version strings look similar | Medium | Export spec says separate namespaces; canonical hash tests exclude Factor F. |
| Replacing `save_boq_with_routes` drops Factor F immutability | High | RPC contract test and app regression around bound, legacy, and copy BOQs. |
| Owner mistakes catalog `2568.1.0` for Factor F `2569.0.0` | Medium | UI/export labels must say Catalog version vs Factor F version explicitly. |
| Live BOQ counts drift from closeout evidence | Medium | Treat closeout counts as point-in-time only; refresh preflight at each gate. |
| Legacy BOQ missing Factor F becomes unprintable for users | Medium | This is intentional fail-closed behavior; provide copy-to-selected-Factor-F path. |
| Unexpected Factor F write/change appears during Phase 4 rollout | High | Treat it as a blocker because Phase 4 must preserve the already-completed Factor F baseline. |

## 8. Owner decisions needed before Phase 4A

Factor F does not add many new owner decisions. The main existing decisions
still dominate:

- approve P-01 after reading this adjustment plan;
- resolve duplicate identity treatment;
- approve HDPE Crossing code decisions;
- approve Production-only 20 canonical codes;
- confirm workbook-only 18 remain deferred unless separate price authority is
  supplied;
- approve AAA/TTT dictionary meanings;
- provide truthful baseline metadata for `2568.0.0`;
- approve official export sample.

New post-Factor-F confirmations:

1. Phase 4 must not change Factor F default pointer.
2. Phase 4 must not bind legacy BOQs to Factor F versions by assumption.
3. Phase 4 has no Factor F publication, pointer movement, or row-value change
   in scope.
4. User-facing labels may show both versions, but catalog and Factor F version
   numbers are independent namespaces.

## 9. Final recommendation

Proceed with Phase 4 on top of the Factor F baseline.

Do not simplify by merging Factor F into Master Catalog. That would make the
system harder to audit and would create false provenance for old BOQs. The
safer path is to keep Phase 4 focused on catalog governance, while treating
Factor F as a protected companion reference axis with mandatory regression
checks.

In plain language: this is manageable if the team respects the boundary. It
becomes risky only if Phase 4 rewrites shared BOQ save/duplicate/export code
without proving both version axes are preserved.
