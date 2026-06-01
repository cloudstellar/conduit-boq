# Verification Report: Master Catalog v26

**Status:** Repository quality baseline merged - production DB rollout not started
**Production project:** `otlssvssvgkohqwuuiir`
**Related change request:** [04-change-request.md](./04-change-request.md)

## Execution Record

| Phase | Migration or deploy | Executor | Started | Completed | Result |
|---|---|---|---|---|---|
| Baseline | Read-only queries | Codex | 2026-06-01 | 2026-06-01 | Recorded |
| P0 | `009_master_catalog_p0_containment.sql` |  |  |  | Pending |
| Quality baseline | Lint, build, automated tests, CI workflow, Vercel deploy | Codex + Owner | 2026-06-01 | 2026-06-02 | Passed and merged to `main` |
| Phase 1A | `010_master_catalog_phase1a_versioning.sql` |  |  |  | Pending |
| Phase 1A indexes | `010a_master_catalog_phase1a_indexes.sql` |  |  |  | Pending |
| Phase 2 | Application deploy |  |  |  | Pending |
| Phase 1B | `011_master_catalog_phase1b_hardening.sql` |  |  |  | Pending |

## Baseline

Read-only inspection on 2026-06-01 recorded the following point-in-time
snapshot. Refresh these metrics immediately before P0 and again before Phase
1A; normal user BOQ activity can change the counts without requiring migration
draft edits.

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
| `npm run lint` | Exit code `0` | Passed: `0` errors, `14` existing warnings |
| `npm run build` | Exit code `0` | Passed locally and Vercel Production deployment passed after merge |
| Automated regression test command | Exit code `0` | Passed: `npm test`, `13/13` tests across `3` files |
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
| `npm run lint` | Passed with `0` errors and `14` existing warnings |
| `npm test` | Passed: `13` tests across `3` files |
| `npm run build` | Passed |
| Git merge | [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1) merged to `main` at `6d607f9` |
| Vercel Production deploy | Passed after merge commit `6d607f9` |
| CI workflow | Passed: [Quality run #4](https://github.com/cloudstellar/conduit-boq/actions/runs/26770263106) on `main`; install, lint, test, and build succeeded |
| Credential hygiene | Removed hardcoded legacy Supabase `anon` key from utility scripts; no JWT literal or tracked `.env` remains in current HEAD |
| `npm run audit:prod` | Review required: `9` production dependency findings (`5` moderate, `4` high) |
| Non-production rehearsal | Pending |

Dependency audit remediation must be reviewed separately from the Master
Catalog feature implementation. The 2026-06-01 audit identified a Next.js
upgrade path from `16.1.1` to `16.2.6` and `xlsx` findings without an available
registry fix.

No Master Catalog migration (`009`, `010`, `010a`, or `011`) has been applied
to the Production DB. The removed legacy `anon` key remains in earlier git
history; historical invalidation requires a separately reviewed credential
migration or rotation decision.
