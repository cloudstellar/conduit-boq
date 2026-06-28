# Factor F Production Inventory Readiness

**Date:** 2026-06-29
**Environment:** Supabase Production `Conduit Price List`
**Project ref:** `otlssvssvgkohqwuuiir`
**Access mode:** Supabase MCP read-only SQL
**Status:** Historical pre-rollout readiness; superseded by
[10-production-rollout-closeout.md](./10-production-rollout-closeout.md)

## Summary

This document records the pre-rollout inventory used to approve the
no-maintenance Factor F deployment. The rollout is now complete: migrations
`012`, `013`, `014`, and `015` were applied to Production on 2026-06-29, and
the final state is captured in the closeout document.

Post-rollout result:

| Check | Result |
| --- | --- |
| Current default Factor F | `2569.0.0` |
| Active historical baseline | `2566.0.0` |
| Legacy BOQs bound by rollout | `0` |
| Partial legacy snapshots remaining | `0` |
| Legacy BOQs with usable print/export snapshot | `127` |
| BOQs missing Factor F snapshot | `79` |

The current `public.factor_reference` data is healthy and matches the planned
`2566.0.0` baseline exactly:

| Check | Result |
| --- | --- |
| Current remote migration ledger latest | `20260621104056_master_catalog_phase1b_hardening` |
| Has `factor_reference_versions` | No |
| Has `factor_reference_rows` | No |
| Has `factor_reference_default_version` | No |
| Has `boq.factor_reference_version_id` | No |
| `public.factor_reference` rows | 37 |
| Cost range | 5M to 700M |
| Dataset hash | `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |
| Matches migration 013 expected hash | Yes |

## BOQ Inventory

Production currently has 206 BOQs. Because the version column does not exist
yet, all 206 are legacy/unbound from the Factor F versioning perspective.

| State | Count | Notes |
| --- | ---: | --- |
| Has saved `factor_f` and totals | 127 | Historical BOQs with a calculated Factor F value |
| Missing `factor_f` | 79 | Cannot be treated as a historical Factor F snapshot |
| Has usable snapshot for Print/Excel after endpoint validator fix | 70 | Includes below-5M floor, normal interpolation, and above-700M ceiling snapshots |
| Has `factor_f` but missing bracket snapshot fields | 57 | Saved factor matches the 2566 baseline exactly, but `B/C/D/E` metadata is missing |
| Missing `factor_f` but has routes/items | 17 | Needs duplicate/reprice if the user wants a calculated Factor F output |
| Missing `factor_f` and no items | 1 | Empty/incomplete draft |
| Missing `factor_f` and no routes | 61 | Empty/incomplete drafts |

Detailed usable snapshot split:

| Snapshot detail | Count |
| --- | ---: |
| Usable below-5M floor snapshot (`B = C = 5M`) | 44 |
| Usable interpolated snapshot | 20 |
| Usable above-700M ceiling snapshot (`B = C = 700M`) | 6 |
| Partial snapshot missing bracket fields | 57 |
| Missing Factor F | 79 |

## Finding

The initial snapshot validator was too strict for two legitimate table endpoint
cases:

1. BOQs below 5M should use the first 5M table row.
2. BOQs above 700M should use the last 700M table row.

The validator now accepts only those two endpoint exact snapshots and still
rejects stale 5M snapshots for mid-range work such as 30M-40M.

## Decision Point: Legacy Snapshot Metadata Repair

The 57 partial legacy BOQs are important. They already have saved `factor_f`
values, and read-only SQL confirmed all 57 match the current 2566 baseline with
zero delta. They do not have the bracket metadata needed by the new Print/Excel
guard.

Approved option:

Create a separate owner-approved data repair migration only for these 57 rows.
This must be described as **legacy snapshot metadata repair**, not repricing:

- Do not set `factor_reference_version_id`.
- Do not change `factor_f`, `total_with_factor_f`, `total_with_vat`, item rows,
  route rows, or project totals.
- Populate only missing snapshot metadata fields:
  `factor_f_raw`, `factor_f_lower_cost`, `factor_f_upper_cost`,
  `factor_f_lower_value`, and `factor_f_upper_value`.
- Update only rows where the saved `factor_f` exactly matches the recomputed
  2566 baseline value.
- Abort if any mismatch is found.

This repair is approved. Reserve root migration `015` for Factor F repair and
shift Master Catalog Phase 4 migrations to `016+`.

## No-Maintenance Release Sequence

The owner selected a no-maintenance-window rollout. The staged rollout avoided a
2569 DB default while old browser code still calculated 2566 snapshots:

1. Apply `012_factor_f_version_foundation.sql`.
2. Apply `013_factor_f_seed_current_baseline.sql`.
3. Deploy application code that reads and writes `factor_reference_version_id`.
4. Apply `014_factor_f_publish_2569_0_0.sql` immediately after the new
   application is live.
5. Apply `015_factor_f_repair_legacy_snapshot_metadata.sql`.
6. Run browser smoke tests:
   - New BOQ uses `2569.0.0`.
   - Duplicate legacy BOQ can choose `2566.0.0` or `2569.0.0`.
   - Legacy usable snapshot can Print/Excel without claiming latest version.
   - Legacy missing snapshot shows the intentional blocked message.

The detailed Production execution checklist is retained as executed evidence in
[09-production-no-maintenance-runbook.md](./09-production-no-maintenance-runbook.md).

## Concurrent User Writes During Rollout

Do not apply `014` while the old application is still accepting create/edit
saves. Applying `012` and `013` first is safe without maintenance because the
database default remains `2566.0.0`, matching the old application calculation
path. Any BOQs created in the short interval before `014` are truthfully bound
to `2566.0.0`.

Unsafe sequence:

- Applying `014` while the old application is still accepting create/edit saves.
  In that window, a newly inserted BOQ can be bound by the database default to
  `2569.0.0`, while the old browser code still calculates from the legacy
  `factor_reference` table (`2566.0.0`). That creates a version/snapshot
  mismatch and must be avoided.

The new create page also reads the active Factor F default and sends
`factor_reference_version_id` explicitly. If the Factor F default pointer is not
ready, creation fails closed instead of creating another unbound BOQ.

## User Impact

Existing legacy BOQs are not silently rebound to the latest Factor F. Users can
continue viewing legacy BOQs. To edit quantities or recalculate Factor F, they
create a copy and select the intended active Factor F version.

Print/Excel behavior depends on the repair decision:

- Without repair: 70 legacy BOQs can Print/Excel from their saved snapshots.
- With repair: 127 legacy BOQs with saved `factor_f` can Print/Excel from
  preserved historical snapshot metadata.
- The 79 BOQs with no saved `factor_f` remain blocked for Factor F output and
  should be duplicated/repriced when the user needs a calculated result.
