# Factor F Production Rollout Closeout

**Date:** 2026-06-29
**Environment:** Supabase Production `Conduit Price List`
**Project ref:** `otlssvssvgkohqwuuiir`
**Application state:** `main` commit `985ece0`; Vercel Production deploy succeeded
**Status:** Completed

## 1. Summary

The Factor F versioning rollout is complete in Production. Migrations `012`
through `015` were applied after owner approval, and the Production default
Factor F pointer now points to `2569.0.0`.

This rollout deliberately did not backfill legacy BOQs with a Factor F version.
That policy is intentional and remains the system contract: legacy BOQs without
exact source-version evidence stay unbound. Valid saved snapshots remain usable
for print/export, and missing Factor F snapshots fail closed until the user
creates a new BOQ copy/revision and chooses an active Factor F version.

Master Catalog Phase 4 database migrations therefore start at `016+`.

## 2. Applied Production Migrations

| Root file | Production ledger version | Result |
| --- | --- | --- |
| `012_factor_f_version_foundation.sql` | `20260628190218` | Factor F version tables, singleton pointer, BOQ FK column, RLS/grants/triggers |
| `013_factor_f_seed_current_baseline.sql` | `20260628190357` | Seeded active baseline `2566.0.0` from `FACTOR F 2566_7.PDF`; no BOQ backfill |
| `014_factor_f_publish_2569_0_0.sql` | `20260628190621` | Published `2569.0.0` from กค 0433.2/ว 481; default pointer moved to `2569.0.0` |
| `015_factor_f_repair_legacy_snapshot_metadata.sql` | `20260628190757` | Repaired missing legacy snapshot metadata only; no reprice and no version backfill |

## 3. Final Production State

| Check | Result |
| --- | --- |
| Current default Factor F version | `2569.0.0` |
| Total BOQs | `206` |
| Legacy BOQs bound to a Factor F version by migration | `0` |
| Partial legacy Factor F snapshots remaining | `0` |
| Legacy BOQs with usable print/export snapshot | `127` |
| BOQs missing Factor F with routes/items | `17` |
| BOQs missing Factor F with routes but no items | `1` |
| BOQs missing Factor F with no routes | `61` |

Published Factor F versions:

| Version | Active | Default | Rows | Dataset hash |
| --- | --- | --- | ---: | --- |
| `2566.0.0` | Yes | No | 37 | `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |
| `2569.0.0` | Yes | Yes | 36 | `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6` |

The `2566.0.0` table includes the historical 600M threshold from the
owner-confirmed baseline source. The `2569.0.0` table has 36 rows and no 600M
row, matching the reviewed ว481 source table.

## 4. User-Facing Operating Policy

- New BOQs created after the rollout bind the current default Factor F version,
  currently `2569.0.0`.
- Version-bound BOQs calculate, print, and export using the BOQ's bound Factor F
  version. Print/Excel labels show the version for that BOQ, for example
  `ใช้ Factor F เวอร์ชัน 2569.0.0`.
- Legacy BOQs with valid saved snapshots can still print/export from the saved
  historical snapshot, without claiming the current Factor F version.
- Legacy BOQs without a valid Factor F snapshot stay fail-closed for Factor F
  calculation/output. The correct user path is to create a new BOQ copy/revision
  and select the intended active Factor F version.
- Do not run a blanket legacy backfill. It would create false provenance for old
  estimates whose source Factor F table is not known.

## 5. Validation Evidence

| Check | Result |
| --- | --- |
| Vercel Production deploy for commit `985ece0` | Succeeded |
| Production homepage and create page smoke | Loaded while authenticated |
| Rollback insert smoke for a new empty BOQ | Bound `factor_reference_version_id` to `2569.0.0`; transaction rolled back |
| `2569.0.0` 30M row smoke | `factor = 1.1405`, `factor_f = 1.2203`, `rain_1 = 1.2367`, `rain_2 = 1.2531` |
| Post-015 partial snapshot check | `0` remaining |

## 6. Follow-Up Plan

1. Keep `files/` source PDFs/images outside git as the physical source archive.
2. Resume Master Catalog Phase 4 planning/implementation with database migration
   numbers `016+`.
3. If users need to continue an old project under a different Factor F table,
   use the duplicate/reprice path rather than mutating the old BOQ.
4. Treat a full Factor F admin/import UI as a future enhancement after the
   versioning foundation proves stable through real use.
