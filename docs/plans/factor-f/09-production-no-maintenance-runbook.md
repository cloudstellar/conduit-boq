# Factor F Production No-Maintenance Runbook

**Date:** 2026-06-29
**Environment:** Supabase Production `Conduit Price List`
**Project ref:** `otlssvssvgkohqwuuiir`
**Owner decision:** Roll out Factor F `2569.0.0` before Master Catalog Phase 4,
without a maintenance window.
**Production write status:** Executed 2026-06-29; see
[10-production-rollout-closeout.md](./10-production-rollout-closeout.md).

## Purpose

This runbook is the execution checklist for applying Factor F migrations
`012` through `015` to Production without pausing users. It is now retained as
the executed runbook and historical evidence for the 2026-06-29 rollout.

Execution result:

| Root file | Production ledger version |
| --- | --- |
| `012_factor_f_version_foundation.sql` | `20260628190218` |
| `013_factor_f_seed_current_baseline.sql` | `20260628190357` |
| `014_factor_f_publish_2569_0_0.sql` | `20260628190621` |
| `015_factor_f_repair_legacy_snapshot_metadata.sql` | `20260628190757` |

Final postconditions passed: current default Factor F is `2569.0.0`, legacy
BOQs were not version-backfilled, and partial legacy Factor F snapshots
remaining is `0`.

The safe sequence is:

1. Apply `012_factor_f_version_foundation.sql`.
2. Apply `013_factor_f_seed_current_baseline.sql`.
3. Deploy the version-aware application code.
4. Apply `014_factor_f_publish_2569_0_0.sql`.
5. Apply `015_factor_f_repair_legacy_snapshot_metadata.sql`.
6. Run smoke tests.

Do not change this order during Production execution.

## Why This Order Is Required

`012` is additive and should be followed immediately by `013`. After `013`, the
default Factor F pointer stays on the existing audited baseline, `2566.0.0`. If
a user creates a BOQ after `013` and before `014`, the BOQ is truthfully bound
to the same Factor F table the old application already uses.

Do not intentionally pause between `012` and `013`. A BOQ created in the narrow
gap after `012` but before `013` can remain unbound because no default pointer
exists yet. That state is still fail-closed under the version-aware app, but it
creates avoidable follow-up work.

`014` moves the default pointer to `2569.0.0`. It must run only after the new
application is live, because the old application still calculates from the
legacy `factor_reference` table (`2566.0.0`) and would create a version/snapshot
mismatch if the database default had already moved to `2569.0.0`.

`015` must run after `014` because its preflight explicitly requires the default
pointer to be on active `2569.0.0`. It repairs only missing legacy snapshot
metadata for BOQs whose saved `factor_f` exactly matches `2566.0.0`; it is not a
reprice and not a legacy version backfill.

## Hard Stop Rules

- Do not apply `014` before the version-aware app is deployed and healthy.
- Do not deploy the version-aware app before `012` and `013` are applied.
- Do not set `boq.factor_reference_version_id` on legacy BOQs.
- Do not update `factor_f`, `total_with_factor_f`, `total_with_vat`, route rows,
  or item rows for legacy BOQs during `015`.
- Do not edit the legacy `factor_reference` table as part of this rollout.
- Do not import or commit the source files under `files/` into git.
- Do not continue to the next step if a preflight/postcheck differs from this
  runbook; capture the result and stop.

## Expected Production Preflight

Run these checks immediately before applying `012`.

### Remote Migration Ledger

Use Supabase MCP `list_migrations` or the Supabase migration ledger. Expected
latest remote migration before Factor F rollout:

| Expected latest version | Expected name |
| --- | --- |
| `20260621104056` | `master_catalog_phase1b_hardening` |

If any migration after `20260621104056` already exists, stop and reconcile the
Production ledger before applying `012`.

### Schema Readiness

```sql
select
  to_regclass('public.factor_reference_versions') is not null
    as has_factor_reference_versions,
  to_regclass('public.factor_reference_rows') is not null
    as has_factor_reference_rows,
  to_regclass('public.factor_reference_default_version') is not null
    as has_factor_reference_default_version,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'boq'
      and column_name = 'factor_reference_version_id'
  ) as has_boq_factor_reference_version_id,
  (select count(*) from public.boq) as boq_count,
  (select count(*) from public.factor_reference) as factor_reference_row_count;
```

Expected before `012`:

| Check | Expected |
| --- | --- |
| `has_factor_reference_versions` | `false` |
| `has_factor_reference_rows` | `false` |
| `has_factor_reference_default_version` | `false` |
| `has_boq_factor_reference_version_id` | `false` |
| `boq_count` | `206` as of 2026-06-29; may increase if users create BOQs |
| `factor_reference_row_count` | `37` |

If `boq_count` changed, do not stop only because of the count. Re-run the BOQ
inventory query and use the new values in the execution notes.

### Current Baseline Hash

```sql
with ordered_rows as (
  select jsonb_build_object(
    'cost_million', cost_million::text,
    'operation_percent', operation_percent::text,
    'interest_percent', interest_percent::text,
    'profit_percent', profit_percent::text,
    'total_expense_percent', total_expense_percent::text,
    'factor', factor::text,
    'vat_percent', vat_percent::text,
    'factor_f', factor_f::text,
    'factor_f_rain_1', factor_f_rain_1::text,
    'factor_f_rain_2', factor_f_rain_2::text
  ) as row_payload
  from public.factor_reference
  order by cost_million
),
canonical as (
  select jsonb_agg(row_payload)::text as payload
  from ordered_rows
)
select
  'sha256:' || encode(pg_catalog.sha256(convert_to(payload, 'UTF8')), 'hex')
    as dataset_hash
from canonical;
```

Expected:

```text
sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61
```

### BOQ Legacy Inventory

Use this query to capture the live inventory. The 2026-06-29 audit found
206 BOQs with the split shown below, but counts can drift if users keep working.

```sql
with classified as (
  select
    b.id,
    case
      when b.factor_f is null then 'missing_factor_f'
      when b.factor_f_raw is not null
        and b.factor_f_lower_cost is not null
        and b.factor_f_upper_cost is not null
        and b.factor_f_lower_value is not null
        and b.factor_f_upper_value is not null
        and (
          (b.factor_f_lower_cost = 5000000 and b.factor_f_upper_cost = 5000000)
          or (b.factor_f_lower_cost = 700000000 and b.factor_f_upper_cost = 700000000)
          or b.factor_f_lower_cost < b.factor_f_upper_cost
        )
        then 'print_excel_usable_snapshot'
      else 'has_factor_but_not_usable_snapshot'
    end as factor_snapshot_state,
    case
      when exists (select 1 from public.boq_routes r where r.boq_id = b.id)
        and exists (select 1 from public.boq_items i where i.boq_id = b.id)
        then 'has_routes_and_items'
      when exists (select 1 from public.boq_routes r where r.boq_id = b.id)
        then 'has_routes_no_items'
      when exists (select 1 from public.boq_items i where i.boq_id = b.id)
        then 'has_items_no_routes'
      else 'no_routes'
    end as content_state
  from public.boq b
)
select factor_snapshot_state, content_state, count(*) as boq_count
from classified
group by factor_snapshot_state, content_state
order by factor_snapshot_state, content_state;
```

Expected 2026-06-29 reference values:

| State | Content | Count |
| --- | --- | ---: |
| `print_excel_usable_snapshot` | `has_routes_and_items` | 70 |
| `has_factor_but_not_usable_snapshot` | `has_routes_and_items` | 57 |
| `missing_factor_f` | `has_routes_and_items` | 17 |
| `missing_factor_f` | `no_routes` | 61 |
| `missing_factor_f` | non-priced draft without items | 1 |

If the number of partial legacy snapshots is no longer 57, continue only if the
change is explainable by user activity and `015` still reports zero mismatches.

## Execution Steps

### Step 1: Apply `012`

Run the full contents of:

```text
migrations/012_factor_f_version_foundation.sql
```

Expected result: the migration commits successfully.

Postcheck:

```sql
select
  to_regclass('public.factor_reference_versions') is not null
    as has_factor_reference_versions,
  to_regclass('public.factor_reference_rows') is not null
    as has_factor_reference_rows,
  to_regclass('public.factor_reference_default_version') is not null
    as has_factor_reference_default_version,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'boq'
      and column_name = 'factor_reference_version_id'
  ) as has_boq_factor_reference_version_id,
  (select count(*) from public.boq where factor_reference_version_id is not null)
    as bound_boq_count;
```

Expected:

| Check | Expected |
| --- | --- |
| New tables | `true` |
| `boq.factor_reference_version_id` | `true` |
| `bound_boq_count` | `0` before `013`; do not backfill legacy BOQs |

Apply `013` immediately after this postcheck.

### Step 2: Apply `013`

Run the full contents of:

```text
migrations/013_factor_f_seed_current_baseline.sql
```

Expected result: active `2566.0.0` exists, default pointer moves to `2566.0.0`,
37 rows are copied from the current baseline, and no existing BOQs are bound.

Postcheck:

```sql
select
  v.version_string,
  v.status,
  v.row_count,
  v.dataset_hash,
  count(r.id) as seeded_rows,
  (dv.version_id = v.id) as is_default,
  (select count(*) from public.boq where factor_reference_version_id is not null)
    as bound_boq_count
from public.factor_reference_versions v
left join public.factor_reference_rows r on r.version_id = v.id
left join public.factor_reference_default_version dv on dv.id = true
where v.version_string = '2566.0.0'
group by v.id, v.version_string, v.status, v.row_count, v.dataset_hash, dv.version_id;
```

Expected:

| Check | Expected |
| --- | --- |
| `version_string` | `2566.0.0` |
| `status` | `active` |
| `row_count` / `seeded_rows` | `37` / `37` |
| `dataset_hash` | `sha256:77a2568bed09670242dcadc444be344c638868a7813f2a25ccbb6e6fb8d7ad61` |
| `is_default` | `true` |
| Legacy BOQ backfill | none |

### Step 3: Deploy Version-Aware App

Deploy the application commit that includes Factor F version-aware create,
edit, duplicate/reprice, print, and Excel behavior. The deployment must include
the code from commit `f111f45` or newer.

Required behavior before continuing to `014`:

- BOQ create page reads the active default Factor F version.
- New BOQ create sends `factor_reference_version_id` explicitly.
- Edit calculation requires a bound Factor F version for recalculation.
- Legacy BOQs without version binding can still use valid saved snapshots.
- Duplicate/reprice can create a new BOQ with the selected active Factor F
  version.
- Print/Excel labels use the BOQ's own version string, not a hard-coded latest
  version.

Quick deploy smoke before `014`:

```sql
select v.version_string
from public.factor_reference_default_version dv
join public.factor_reference_versions v on v.id = dv.version_id
where dv.id = true;
```

Expected during this short window: `2566.0.0`.

If a user creates a BOQ during this interval, that BOQ is validly bound to
`2566.0.0`.

If `013` or `014` aborts because the no-backfill postcondition detects a
concurrent BOQ insert during the migration transaction, stop and inspect the new
row. If it is a legitimate user-created BOQ, rerun the same migration after
recording the drift in the execution notes.

### Step 4: Apply `014`

Run the full contents of:

```text
migrations/014_factor_f_publish_2569_0_0.sql
```

Expected result: active `2569.0.0` exists, default pointer moves to
`2569.0.0`, 36 rows are inserted, there is no 600M row, and no existing BOQs are
backfilled.

Postcheck:

```sql
select
  v.version_string,
  v.status,
  v.row_count,
  v.dataset_hash,
  count(r.id) as seeded_rows,
  count(*) filter (where r.cost_million = 600) as row_600m_count,
  (dv.version_id = v.id) as is_default,
  (select count(*) from public.boq where factor_reference_version_id is not null)
    as bound_boq_count
from public.factor_reference_versions v
left join public.factor_reference_rows r on r.version_id = v.id
left join public.factor_reference_default_version dv on dv.id = true
where v.version_string = '2569.0.0'
group by v.id, v.version_string, v.status, v.row_count, v.dataset_hash, dv.version_id;
```

Expected:

| Check | Expected |
| --- | --- |
| `version_string` | `2569.0.0` |
| `status` | `active` |
| `row_count` / `seeded_rows` | `36` / `36` |
| `dataset_hash` | `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6` |
| `row_600m_count` | `0` |
| `is_default` | `true` |
| Legacy BOQ backfill | none |

### Step 5: Apply `015`

Run the full contents of:

```text
migrations/015_factor_f_repair_legacy_snapshot_metadata.sql
```

Expected result: the migration prints a notice similar to:

```text
NOTICE: F4 repair candidates: 57
```

The candidate count may be different if users changed or added BOQs after the
2026-06-29 inventory. The migration must still abort if any candidate cannot be
proven equivalent to `2566.0.0`.

Postcheck:

```sql
select
  count(*) filter (
    where factor_reference_version_id is null
      and factor_f is not null
      and coalesce(total_cost, 0) > 0
      and (
        factor_f_raw is null
        or factor_f_lower_cost is null
        or factor_f_upper_cost is null
        or factor_f_lower_value is null
        or factor_f_upper_value is null
      )
  ) as partial_legacy_factor_snapshots_remaining,
  count(*) filter (
    where factor_reference_version_id is not null
      and created_at < now() - interval '10 minutes'
  ) as older_bound_boq_count,
  (
    select v.version_string
    from public.factor_reference_default_version dv
    join public.factor_reference_versions v on v.id = dv.version_id
    where dv.id = true
  ) as default_factor_f_version;
```

Expected:

| Check | Expected |
| --- | --- |
| `partial_legacy_factor_snapshots_remaining` | `0` for repair-selected rows; investigate if not zero |
| Legacy BOQ version backfill | none |
| `default_factor_f_version` | `2569.0.0` |

The `older_bound_boq_count` is only a drift signal. If users create new BOQs
during rollout, the count of bound BOQs can be greater than zero. Confirm the
bound rows are new creates or duplicate/reprice outputs, not silently backfilled
legacy rows.

## Browser Smoke Tests

Run these on the deployed app after `014` and `015`.

| Flow | Expected user-visible result |
| --- | --- |
| Create a new BOQ | New BOQ is bound to `2569.0.0`; edit page can calculate Factor F using the 2569 table |
| New 30M total-cost BOQ | Calculation uses 2569 row/interpolation; exact 30M table factor is `1.1405` before truncation/rounding rules |
| Edit new BOQ | Factor F status shows current bound version; no "unbound" error |
| Print new BOQ | Factor F condition shows `ใช้ Factor F เวอร์ชัน 2569.0.0` |
| Excel export new BOQ | Factor F condition shows the same BOQ version string |
| Legacy BOQ with valid snapshot | Print/Excel works from saved snapshot and does not claim latest version |
| Legacy repaired partial snapshot | Print/Excel works from repaired historical snapshot metadata |
| Legacy BOQ missing `factor_f` | Edit/Print/Excel blocks Factor F output intentionally; user should duplicate/reprice |
| Duplicate/reprice legacy BOQ | User can choose active Factor F version; new copy is bound to the selected version |
| Duplicate/reprice with `2566.0.0` | New copy uses historical 2566 table and labels `2566.0.0` |
| Duplicate/reprice with `2569.0.0` | New copy uses new W481 table and labels `2569.0.0` |

## User Impact

Existing BOQs are not silently recalculated and are not silently attached to the
new Factor F version.

Users can keep opening and reviewing legacy BOQs. If a legacy BOQ has a valid
saved snapshot, Print/Excel can use that historical snapshot. If a legacy BOQ has
no Factor F snapshot, Factor F output is intentionally blocked because the
system cannot prove which table created the result.

When users want to use a new Factor F version, they should duplicate/reprice the
BOQ and choose the intended active version. That creates a new price item with
clear provenance while leaving the old BOQ intact.

## Failure Handling

| Failure point | Action |
| --- | --- |
| Preflight differs before `012` | Stop. Reconcile schema, ledger, and BOQ inventory before migration. |
| `012` fails | Stop. No app deploy. Investigate DDL/lock error and retry only after cause is known. |
| `013` fails | Stop before app deploy and before `014`. Database is additive but default pointer may be incomplete; fix `013` and retry. |
| App deploy fails after `012`/`013` | Roll back app if needed. Do not apply `014`. Default remains `2566.0.0`, so user writes remain consistent with the old calculation path. |
| `014` fails before changing pointer | Keep app version-aware and default `2566.0.0`; fix `014` and retry. |
| `014` succeeds but app has a severe issue | Prefer forward-fix. Rolling back the app while default is `2569.0.0` can recreate version/snapshot mismatch. If rollback is unavoidable, pause create/edit writes or get owner approval to move the default pointer back to `2566.0.0` before old app accepts writes. |
| `015` fails | Keep app and `2569.0.0` live. Only the affected legacy partial snapshots remain blocked for Print/Excel. Fix the repair evidence and retry; do not manually update BOQs. |
| Smoke test fails for new BOQ create | Treat as release blocker. Confirm app version, `factor_reference_default_version`, and RLS policies. |
| Smoke test fails for legacy Print/Excel | Confirm whether the BOQ has complete/repaired snapshot metadata. Missing-factor legacy BOQs are expected to block. |

## Execution Notes Template

Copy this section into the release note and fill it during execution.

```text
Execution date/time:
Executor:
Production project ref: otlssvssvgkohqwuuiir

Preflight latest migration:
Preflight factor_reference hash:
Preflight BOQ count:
Preflight partial legacy snapshot count:

012 applied at:
012 postcheck:

013 applied at:
013 postcheck:

App deployment version/commit:
App deployment health check:

014 applied at:
014 postcheck:

015 applied at:
015 repair candidate notice:
015 postcheck:

Browser smoke test result:
Print smoke test result:
Excel smoke test result:

Issues / deviations:
Owner sign-off:
```

## Related Documents

- [01-versioned-factor-f-change-request.md](./01-versioned-factor-f-change-request.md)
- [03-implementation-plan.md](./03-implementation-plan.md)
- [06-f2-current-baseline-runbook.md](./06-f2-current-baseline-runbook.md)
- [07-f3-2569-owner-review.md](./07-f3-2569-owner-review.md)
- [08-production-inventory-readiness.md](./08-production-inventory-readiness.md)
- [MIGRATIONS.md](../../04_data/MIGRATIONS.md)
