# Verification Report: Master Catalog v26

**Status:** Repository quality baseline and Factor F correction merged - production DB rollout not started
**Production project:** `otlssvssvgkohqwuuiir`
**Related change request:** [04-change-request.md](./04-change-request.md)

## Execution Record

| Phase | Migration or deploy | Executor | Started | Completed | Result |
|---|---|---|---|---|---|
| Baseline | Read-only queries | Codex | 2026-06-01 | 2026-06-01 | Recorded |
| P0 | `009_master_catalog_p0_containment.sql` |  |  |  | Pending |
| Quality baseline | Lint, build, automated tests, CI workflow, Vercel deploy | Codex + Owner | 2026-06-01 | 2026-06-02 | Passed and merged to `main` |
| Factor F correction | Application/docs update on `main` | Codex + Owner | 2026-06-05 | 2026-06-05 | Passed |
| Local rehearsal | Production-schema snapshot + scrubbed auth/business data | Codex | 2026-06-20 | 2026-06-20 | `009 -> 010 -> 010a` passed; Phase 2/`011` pending |
| Phase 1A | `010_master_catalog_phase1a_versioning.sql` |  |  |  | Pending |
| Phase 1A indexes | `010a_master_catalog_phase1a_indexes.sql` |  |  |  | Pending |
| Phase 2 | Application deploy |  |  |  | Pending |
| Phase 1B | `011_master_catalog_phase1b_hardening.sql` |  |  |  | Pending |

## Baseline

Read-only inspection on 2026-06-01 recorded the following point-in-time
snapshot. Refresh these metrics immediately before P0 and again before Phase
1A; normal user BOQ activity can change the counts without requiring migration
draft edits. The `price_list` count includes the PN6 addition of 28 rows
(`ITEM-0683` through `ITEM-0710`) on top of the previous 682-row baseline.

| Metric | Expected baseline |
|---|---:|
| `boq` rows | 168 |
| `boq_items` rows | 1364 |
| `boq_routes` rows | 195 |
| `price_list` rows | 710 |
| Custom items (`price_list_id IS NULL`) | 0 |
| Dangling `price_list_id` rows | 0 |
| Duplicate `price_list.item_code` values | 0 rows |
| Legacy BOQs (`created_by IS NULL`) | 24 |
| Pending users | 4 |
| Procurement users | 0 |

### Production Read-Only Recheck - 2026-06-02

The read-only recheck matched the 2026-06-01 baseline exactly:

| Metric | Rechecked value |
|---|---:|
| `boq` rows | 168 |
| `boq_items` rows | 1364 |
| `boq_routes` rows | 195 |
| `price_list` rows | 710 |
| Custom items (`price_list_id IS NULL`) | 0 |
| Dangling `price_list_id` rows | 0 |
| Duplicate `price_list.item_code` groups | 0 |
| Legacy BOQs (`created_by IS NULL`) | 24 |
| Pending users | 4 |
| Procurement users | 0 |

Production still has none of the Phase 1A tables or compatibility columns:

| Object | Rechecked value |
|---|---|
| `price_list_versions` | Absent |
| `price_list_default_version` | Absent |
| `price_list_audit_logs` | Absent |
| `price_list.version_id` | Absent |
| `boq.price_list_version_id` | Absent |
| `boq_items.category` | Absent |

### Supabase MCP Reference Recheck - 2026-06-05

Read-only `execute_sql` through Supabase MCP confirmed the current reference
data used by the Factor F correction and PN6 preflight:

| Metric | Rechecked value |
|---|---:|
| `price_list` rows | 710 |
| PN6 rows (`ITEM-0683` through `ITEM-0710`) | 28 |
| `factor_reference` rows | 37 |
| `factor_reference.factor` at 30M | 1.1422 |
| `factor_reference.factor` at 40M | 1.1359 |
| `factor_reference.factor_f` at 30M | 1.2221 |
| `factor_reference.factor_f` at 40M | 1.2154 |
| Full numeric reference checksum | `e8040ffbf82beebd61bbb9c2652dd41a` |

## Reference Data Preflight

Run before P0 and again before Phase 1A through authenticated Supabase SQL/MCP.
Anonymous REST/Data API checks can return `0` rows under RLS and must not be
used as the source of truth for these gates.

```sql
-- Gate R.1: current catalog row count. Expected current baseline: 710.
SELECT count(*) AS price_list_rows
FROM public.price_list;

-- Gate R.2: PN6 import count. Expected current baseline: 28.
SELECT count(*) AS pn6_rows
FROM public.price_list
WHERE item_code BETWEEN 'ITEM-0683' AND 'ITEM-0710';

-- Gate F.1: Factor F full-table integrity.
-- The checksum covers every numeric reference column used by the official
-- Factor F table, ordered by cost_million. It intentionally excludes id and
-- created_at because those are metadata, not calculation inputs.
WITH ordered AS (
  SELECT
    cost_million,
    operation_percent,
    interest_percent,
    profit_percent,
    total_expense_percent,
    factor,
    vat_percent,
    factor_f,
    factor_f_rain_1,
    factor_f_rain_2,
    lag(cost_million) OVER (ORDER BY cost_million) AS prev_cost
  FROM public.factor_reference
),
aggregate_check AS (
  SELECT
    count(*) AS row_count,
    count(DISTINCT cost_million) AS distinct_cost_count,
    count(*) FILTER (
      WHERE cost_million IS NULL
         OR operation_percent IS NULL
         OR interest_percent IS NULL
         OR profit_percent IS NULL
         OR total_expense_percent IS NULL
         OR factor IS NULL
         OR vat_percent IS NULL
         OR factor_f IS NULL
         OR factor_f_rain_1 IS NULL
         OR factor_f_rain_2 IS NULL
    ) AS null_required_values,
    count(*) FILTER (
      WHERE prev_cost IS NOT NULL
        AND cost_million <= prev_cost
    ) AS non_increasing_cost_rows,
    count(*) FILTER (
      WHERE factor <= 0
         OR factor_f <= 0
         OR factor_f_rain_1 <= 0
         OR factor_f_rain_2 <= 0
    ) AS non_positive_factor_rows,
    md5(string_agg(concat_ws(
      ':',
      cost_million::text,
      operation_percent::text,
      interest_percent::text,
      profit_percent::text,
      total_expense_percent::text,
      factor::text,
      vat_percent::text,
      factor_f::text,
      factor_f_rain_1::text,
      factor_f_rain_2::text
    ), ',' ORDER BY cost_million)) AS factor_reference_checksum
  FROM ordered
)
SELECT *
FROM aggregate_check;

-- Gate F.2: stop and run row-level review/export if F.1 differs from the
-- approved checksum.
SELECT
  cost_million,
  operation_percent,
  interest_percent,
  profit_percent,
  total_expense_percent,
  factor,
  vat_percent,
  factor_f,
  factor_f_rain_1,
  factor_f_rain_2
FROM public.factor_reference
ORDER BY cost_million;
```

Expected:

| Gate | Expected |
|---|---|
| `R.1` | `710`, unless live preflight proves a new approved catalog import |
| `R.2` | `28` |
| `F.1.row_count` | `37` |
| `F.1.distinct_cost_count` | `37` |
| `F.1.null_required_values` | `0` |
| `F.1.non_increasing_cost_rows` | `0` |
| `F.1.non_positive_factor_rows` | `0` |
| `F.1.factor_reference_checksum` | `e8040ffbf82beebd61bbb9c2652dd41a` |
| `F.2` | If checksum differs, stop rollout and compare every row against the approved official Factor F table |

The 30M = `1.1422` and 40M = `1.1359` values are retained as human-readable
smoke examples for the Surin interpolation case. They are not sufficient by
themselves to approve the Factor F reference table.

## P0 Verification

Run immediately after migration 009.

```sql
-- Gate P0.1: must return zero rows.
SELECT
  p.oid::regprocedure::text AS function_name,
  a.grantee,
  a.privilege_type
FROM pg_proc p
CROSS JOIN LATERAL aclexplode(
  COALESCE(p.proacl, acldefault('f', p.proowner))
) a
WHERE p.oid = 'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure
  AND a.privilege_type = 'EXECUTE'
  AND (a.grantee = 0 OR a.grantee = 'anon'::regrole);

-- Gate P0.2: authenticated must retain RPC EXECUTE.
SELECT has_function_privilege(
  'authenticated',
  'public.save_boq_with_routes(uuid,jsonb,jsonb)',
  'EXECUTE'
) AS authenticated_can_execute;

-- Gate P0.3: all values must be false for anon and authenticated.
WITH roles(role_name) AS (
  VALUES ('anon'), ('authenticated')
),
tables(table_name) AS (
  VALUES ('boq'), ('boq_items'), ('boq_routes'), ('price_list'), ('user_profiles')
)
SELECT
  role_name,
  table_name,
  has_table_privilege(
    role_name,
    format('public.%I', table_name),
    'MAINTAIN'
  ) AS has_maintain
FROM roles
CROSS JOIN tables
ORDER BY role_name, table_name;

-- Gate P0.4: must return the 12 expected BOQ policies only.
SELECT tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('boq', 'boq_items', 'boq_routes')
ORDER BY tablename, policyname;

-- Gate P0.5: must return zero rows.
SELECT
  p.oid::regprocedure::text AS function_name,
  CASE
    WHEN a.grantee = 0 THEN 'PUBLIC'
    ELSE pg_get_userbyid(a.grantee)
  END AS grantee,
  a.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(
  COALESCE(p.proacl, acldefault('f', p.proowner))
) a
WHERE n.nspname = 'public'
  AND p.prosecdef
  AND a.privilege_type = 'EXECUTE'
  AND (a.grantee = 0 OR a.grantee = 'anon'::regrole)
ORDER BY function_name, grantee;

-- Gate P0.6: must return zero rows.
SELECT
  pg_get_userbyid(d.defaclrole) AS owner_role,
  CASE
    WHEN a.grantee = 0 THEN 'PUBLIC'
    ELSE pg_get_userbyid(a.grantee)
  END AS grantee,
  a.privilege_type
FROM pg_default_acl d
CROSS JOIN LATERAL aclexplode(d.defaclacl) a
WHERE d.defaclnamespace = 'public'::regnamespace
  AND d.defaclobjtype = 'f'
  AND a.privilege_type = 'EXECUTE'
  AND (
    a.grantee = 0
    OR a.grantee IN ('anon'::regrole, 'authenticated'::regrole)
  )
ORDER BY owner_role, grantee;

-- Gate P0.7: must return zero rows.
SELECT
  pg_get_userbyid(d.defaclrole) AS owner_role,
  CASE
    WHEN a.grantee = 0 THEN 'PUBLIC'
    ELSE pg_get_userbyid(a.grantee)
  END AS grantee,
  a.privilege_type
FROM pg_default_acl d
CROSS JOIN LATERAL aclexplode(d.defaclacl) a
WHERE d.defaclnamespace = 'public'::regnamespace
  AND d.defaclobjtype = 'r'
  AND a.privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')
  AND (
    a.grantee = 0
    OR a.grantee IN ('anon'::regrole, 'authenticated'::regrole)
  )
ORDER BY owner_role, grantee, a.privilege_type;
```

### P0 Smoke Tests

| Test | Expected | Result |
|---|---|---|
| Anonymous caller invokes `save_boq_with_routes` | Rejected | Pending |
| Active owner saves own BOQ | Allowed | Pending |
| Pending owner saves own BOQ | Allowed | Pending |
| Pending user saves another user's BOQ | Rejected | Pending |
| Procurement user saves a BOQ | Rejected | Pending or N/A |
| Pending owner duplicates BOQ with route and items | Allowed | Pending |

## Quality Baseline Gate

Complete after the standalone P0 hotfix and before Master Catalog Phase 1A.

| Check | Expected | Result |
|---|---|---|
| `npm run lint` | Exit code `0` | Passed: `0` errors, `11` existing warnings |
| `npm run build` | Exit code `0` | Passed locally and Vercel Production deployment passed after merge |
| Automated regression test command | Exit code `0` | Passed: `npm test`, `17/17` tests across `4` files |
| CI workflow | Runs lint, build, and automated tests on pull requests and pushes to `main` | Passed: [Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106) on merge commit `6d607f9` |
| `npm run audit:prod` | Findings remediated or explicitly accepted | Pending: `9` production findings recorded (`5` moderate, `4` high) |
| Non-production rehearsal | `010 -> 010a -> Phase 2 -> 011` passes all gates | Pending |

## Phase 1A Verification

Run after migration 010.

```sql
-- Gate 1A.1: all catalog objects must exist.
SELECT
  to_regclass('public.price_list_versions') AS price_list_versions,
  to_regclass('public.price_list_audit_logs') AS price_list_audit_logs,
  to_regclass('public.price_list_default_version') AS price_list_default_version;

-- Gate 1A.2: historical rows must be linked.
SELECT count(*) AS unlinked_price_list_rows
FROM public.price_list
WHERE version_id IS NULL;

SELECT count(*) AS unlinked_boqs
FROM public.boq
WHERE price_list_version_id IS NULL;

-- Gate 1A.3: pointer must have exactly one active target.
SELECT count(*) AS valid_default_pointer_rows
FROM public.price_list_default_version dv
JOIN public.price_list_versions v ON v.id = dv.version_id
WHERE dv.id = true
  AND v.status = 'active';

-- Gate 1A.4: no cross-version mismatch.
SELECT count(*) AS mismatched_items
FROM public.boq_items bi
JOIN public.price_list pl ON pl.id = bi.price_list_id
JOIN public.boq b ON b.id = bi.boq_id
WHERE pl.version_id IS DISTINCT FROM b.price_list_version_id;

-- Gate 1A.5: standard item snapshots must be present.
SELECT count(*) AS invalid_null_categories
FROM public.boq_items
WHERE price_list_id IS NOT NULL
  AND category IS NULL;

-- Gate 1A.6: authenticated and anon must have no raw catalog writes.
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN (
    'price_list_versions',
    'price_list',
    'price_list_audit_logs'
  )
  AND grantee IN ('PUBLIC', 'authenticated', 'anon')
  AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE');

-- Gate 1A.7: inspect the final catalog policy inventory.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'price_list_versions',
    'price_list',
    'price_list_audit_logs',
    'price_list_default_version'
  )
ORDER BY tablename, policyname;

-- Gate 1A.8: all expected indexes must exist and be valid.
SELECT indexrelid::regclass AS index_name, indisvalid
FROM pg_index
WHERE indexrelid::regclass::text IN (
  'idx_boq_price_list_version_id',
  'idx_boq_items_price_list_id',
  'idx_boq_items_boq_id',
  'idx_price_list_audit_logs_version_id'
)
ORDER BY indexrelid::regclass::text;
```

Expected:

| Gate | Expected |
|---|---|
| `1A.1` | Three non-null table names |
| `1A.2` | Both counts are `0` |
| `1A.3` | `1` |
| `1A.4` | `0` |
| `1A.5` | `0` |
| `1A.6` | `0 rows` |
| `1A.7` | `7 rows`: versions `2`, price list `2`, audit logs `1`, pointer `2` |
| `1A.8` | `4 rows`, all `indisvalid = true` |

## Phase 2 Smoke Tests

### Delta Category Reconciliation

Run once before Phase 2 deploy and again immediately after deploy. Repeat the
post-deploy reconciliation if BOQ writes cannot be paused during cutover.

```sql
UPDATE public.boq_items bi
SET category = pl.category
FROM public.price_list pl
WHERE bi.price_list_id = pl.id
  AND bi.price_list_id IS NOT NULL
  AND bi.category IS NULL;

SELECT count(*) AS invalid_null_categories
FROM public.boq_items
WHERE price_list_id IS NOT NULL
  AND category IS NULL;
```

| Pass | Expected | Result |
|---|---|---|
| Before Phase 2 deploy | `0` invalid standard-item categories | Pending |
| Immediately after Phase 2 deploy | `0` invalid standard-item categories | Pending |

| Flow | Expected | Result |
|---|---|---|
| Create BOQ | Uses active default catalog version | Pending |
| Duplicate BOQ | Preserves catalog version and category snapshots | Pending |
| Edit existing BOQ | Search is filtered by BOQ catalog version | Pending |
| Print BOQ | Reads stored category snapshot without dynamic join | Pending |
| Price-list page | Shows active default version only | Pending |
| Dashboard | Counts active default version only | Pending |

## Phase 1B Verification

Run after migration 011.

```sql
SELECT is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'boq'
  AND column_name = 'price_list_version_id';

SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.boq'::regclass
  AND tgname = 'trigger_prevent_boq_version_modification'
  AND NOT tgisinternal;
```

Expected:

| Gate | Expected |
|---|---|
| BOQ version nullability | `NO` |
| Immutable-version trigger | One row |

## Notes

Record actual query output, screenshots, and incident notes below during rollout.

### Repository Quality Baseline - Merged 2026-06-02

| Check | Result |
|---|---|
| `git diff --check` | Passed |
| `npm run lint` | Passed with `0` errors and `11` existing warnings |
| `npm test` | Passed: `13` tests across `3` files |
| `npm run build` | Passed |
| Git merge | [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1) merged to `main` at `6d607f9` |
| Vercel Production deploy | Passed after merge commit `6d607f9` |
| CI workflow | Passed: [Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106) on `main`; install, lint, test, and build succeeded |
| Credential hygiene | Removed hardcoded legacy Supabase `anon` key from utility scripts; no JWT literal or tracked `.env` remains in current HEAD |
| `npm run audit:prod` | Review required: `9` production dependency findings (`4` moderate, `5` high) as rechecked 2026-06-20 |
| Non-production rehearsal | Partial pass: local `009 -> 010 -> 010a`; Phase 2/`011` pending |

### Factor F Correction - Merged 2026-06-05

| Check | Result |
|---|---|
| Factor source column | Uses `factor_reference.factor` ("รวมในรูป Factor") |
| Edit page behavior | Loads reference rows once and calculates live without a silent 5M fallback |
| Print/export behavior | Uses valid saved snapshots before live legacy fallback |
| `npm test` | Passed: `17` tests across `4` files |

Dependency audit remediation must be reviewed separately from the Master
Catalog feature implementation. The 2026-06-01 audit identified a Next.js
upgrade path from `16.1.1` to `16.2.6` and `xlsx` findings without an available
registry fix.

No Master Catalog migration (`009`, `010`, `010a`, or `011`) has been applied
to the Production DB. The removed legacy `anon` key remains in earlier git
history; historical invalidation requires a separately reviewed credential
migration or rotation decision.

### Local Supabase Rehearsal - 2026-06-20

The local environment was rebuilt from a current production `public` schema
snapshot and business-data snapshot. Auth UUIDs and identities were retained,
but production password hashes, sessions, refresh tokens, OTPs, MFA data, and
audit payloads were excluded. Seven local-only role accounts were seeded for
RLS and UI testing.

The first P0 attempt failed safely inside its transaction because both local
and production `postgres` are non-superuser roles and are not members of
`supabase_admin`. Migrations `009` and `010` were updated to alter
`supabase_admin` default privileges only when the executor has membership.
Explicit object grants/revokes and `postgres` defaults remain enforced.

After the correction, local `009`, `010`, and all four `010a` concurrent index
statements passed. Verification recorded 198 BOQs, 1,547 BOQ items, 217 routes,
710 price rows, 37 Factor F rows, zero unversioned BOQs, zero cross-version
mismatches, zero missing category snapshots, four valid required indexes,
anonymous BOQ-save RPC access revoked, and the Factor F checksum unchanged at
`e8040ffbf82beebd61bbb9c2652dd41a`.

Browser smoke testing passed for local admin login, dashboard totals, and the
710-row price-list view. Migration `011` was intentionally not run because the
Phase 2 version-aware application changes are not implemented yet.
