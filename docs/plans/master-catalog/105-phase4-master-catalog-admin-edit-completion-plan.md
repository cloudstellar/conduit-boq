# Phase 4 Master Catalog Admin Edit Completion Plan

**Status:** LOCAL PLAN/DOCUMENTATION/IMPLEMENTATION COMPLETE; REVIEWED
FEATURE-BRANCH COMMIT/PUSH AUTHORIZED; MAIN MERGE, PRODUCTION DATABASE WRITE,
FLAG CHANGE, PRODUCTION DEPLOYMENT, AND LIVE MUTATION QA REMAIN SEPARATE OWNER
GATES

**Prepared:** 2026-08-28 (+07)

**Target branch/base:** `codex/master-catalog-admin-edit` from
`c2ea0852affe1abca0230dde3daa4b332ead0a83`

<!-- MASTER_CATALOG_ADMIN_EDIT_PLAN_V1 {"schema":"conduit-boq/master-catalog-admin-edit-plan/v1","recordedAt":"2026-08-28","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"readOnlyAdminUiLive":true,"endToEndComplete":false,"target":"active-admin-draft-workflow","publishedRowsDirectlyMutable":false,"historicalBoqReprice":false,"factorFMutation":false,"migration028Required":true,"catalogAdminEnabledTarget":true,"catalogNewIdentityEnabledTarget":false,"catalogRetirementEnabledTarget":false,"localDocsCodeTestsAuthorized":true,"featureBranchGitPublicationAuthorized":true,"featureBranch":"codex/master-catalog-admin-edit","commitAuthorized":true,"pushAuthorized":true,"mainMergeAuthorized":false,"productionWriteAuthorized":false,"deployAuthorized":false,"automaticNextStep":false} -->

## 1. Current truth

The Master Catalog **data and publication** work is complete:

- current/default version is `2568.1.0` with `710` active rows;
- dataset hash is
  `sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`
  at review lock `4`;
- ITEM-0429 is `0/1764/1764` and ITEM-0615 is `2869/7427/10296`;
- the reviewed XLSX/PDF outputs passed;
- existing BOQs were not repriced or backfilled; and
- Factor F remains `2569.0.0`, `36` rows, dataset hash
  `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`.

P-13, P-14, P-14C, and P-15 are complete and must not be replayed. Migration
`027_p49_active_profile_authorization_hardening.sql` was applied exactly once
as ledger `20260827174634/p49_active_profile_authorization_hardening`, source
SHA-256
`7b96ac17aefc96ee7a788327ddee7508e15eaec73c54f609b44adccf8159eabe`,
and is immutable.

The deployed application currently exposes the Master Catalog admin pages in
safe read-only mode at source
`c2ea0852affe1abca0230dde3daa4b332ead0a83` and successful Vercel deployment
`Bac7G66VFEyrpVmwViC3yzb8aeqZ`. Therefore the data/publication milestone is
complete, but the original end-to-end operating target is not complete: an
active Admin cannot yet use the existing draft mutation workflow.

## 2. Intended operating model

The normal operating model is:

1. only an authenticated profile whose current status is `active` and role is
   `admin` may enter the admin workflow;
2. the Admin creates or selects a **draft** based on a published version;
3. edits, code changes, placement changes, imports, review, and publication go
   through the existing audited RPC workflow;
4. a published version is never edited in place; a correction is a new draft
   and, after review, a new published version;
5. existing BOQs keep their bound snapshot and are never repriced
   automatically; and
6. Factor F remains a separate versioned domain.

Each future publication or pointer restore still requires the corresponding
business approval/reference in the existing workflow. That routine release
decision does not replay P-13, P-14, P-14C, or P-15.

`catalog_admin_enabled` becomes the operational kill switch for this workflow.
The intended steady state is `true`. The two higher-risk capabilities remain
`false`:

- `catalog_new_identity_enabled=false` — no brand-new catalog identity;
- `catalog_retirement_enabled=false` — no retirement of an existing identity.

Turning the kill switch off makes every **new** database mutation request fail
closed when the RPC rechecks the setting. An already-running transaction may
finish; the UI reflects read-only state after refresh/navigation or explicit
revalidation.

## 3. Why the plan needs a forward-only correction

After migration 027, `loadCatalogAdminGate()` deliberately returns `disabled`
for the v2 authorization path. At the same time, the database mutation RPCs
independently check `private.catalog_admin_enabled()`.

Consequently, changing `catalog_admin_enabled` to `true` before the application
is corrected would create a split state: database mutation could be enabled
for an active Admin while the deployed UI still reports read-only. The flag
must remain `false` until both layers understand the same bounded gate.

Migration 027 must not be edited, replaced, or replayed. A new migration 028 is
required.

## 4. Minimal technical design

### 4.1 Database projection

Add a private projection and a backward-compatible public wrapper rather than
changing the return type of `public.get_my_catalog_capabilities()`:

- `private.catalog_admin_gate_projection()` owns the privileged settings
  read; and
- `public.get_my_catalog_admin_gate()` is the Data API entrypoint.

The projection returns exactly one row with:

- `admin_enabled boolean`;
- `configuration_valid boolean`.

Security contract:

- the private projection is `STABLE`, `SECURITY DEFINER`, and
  `SET search_path = ''`;
- the public wrapper is `STABLE`, `SECURITY INVOKER`, and
  `SET search_path = ''`;
- every object reference is schema-qualified;
- the body returns no row unless `private.p49_current_active_admin()` is true;
- all three catalog settings must each exist exactly once and be JSON booleans;
- missing, duplicate, malformed, or unauthorized state never returns an
  enabled gate;
- both functions remain owned by `postgres`;
- revoke `EXECUTE` on both functions from `PUBLIC`, `anon`, and
  `service_role` (and revoke before the narrow grant); and
- grant `EXECUTE` on both only to `authenticated`.

Migration preflight also binds to the exact post-027 active-Admin predicate,
the existing Master Catalog function/policy fingerprints, RLS on all 15 catalog
relations, denial of direct catalog DML, the raw-settings ACL, and the
`private` schema owner/usage boundary. Any drift stops before object creation.

The RPC is a projection only. It does not update a setting or mutate catalog
data.

### 4.2 Application gate

Add one shared application loader for the bounded RPC. Use it in all three
authorization consumers:

1. `loadCatalogAdminGate()` for Master Catalog pages and every Server Action;
2. the Master Catalog entry card on `/admin`; and
3. draft PDF/XLSX export access.

The loader accepts `enabled` only when there is exactly one object row with
`configuration_valid === true` and `admin_enabled === true`.

Zero rows, multiple rows, a malformed value, a thrown request, any RPC error,
or a missing RPC all produce `disabled` with a non-sensitive operator warning.
There is no raw `app_settings` fallback. A legacy authorization source remains
read-only and cannot enable mutation or draft export.

Every Server Action continues to authenticate and authorize inside the action
by reloading the gate. The database mutation RPC remains the final authority
and independently verifies the active Admin plus `catalog_admin_enabled`.

### 4.3 Existing data invariants

This completion work must not:

- modify `price_list`, catalog versions, pointers, BOQ/BOQ items/routes, or
  Factor F data;
- change the current/default version or its `710` rows;
- enable new identity or retirement capability;
- weaken published-version immutability, audit triggers, RLS, RPC ownership,
  or grants; or
- add a direct client table-write path.

## 5. Validation required before external publication

The local gate is intentionally small but covers both layers:

1. migration contract tests for the new function signature, exact active-admin
   predicate, preserved function/policy fingerprints, RLS/direct-DML posture,
   strict JSON boolean validation, private-schema usage, raw-settings denial,
   empty search path, owner, and exact grants/revokes;
2. application tests for unauthenticated, forbidden, disabled, enabled,
   zero-row, multi-row, malformed, missing-RPC, ordinary RPC error, and thrown
   request behavior;
3. assertions that the v2 path never reads raw `app_settings`;
4. assertions that every mutation Server Action still requires
   `gate.state === 'enabled'`;
5. the existing Master Catalog, P-49, BOQ snapshot, export, and Factor F
   regression tests;
6. TypeScript, ESLint, production build, and `git diff --check`; and
7. an independent database/security review plus an independent application/
   UI review of the final diff.

If Local Supabase is available, apply the unchanged canonical chain through
027, then 028, verify the new RPC using Admin/non-Admin personas, and leave all
three flags false. Lack of this expanded Local database check must be stated as
an accepted residual; it must never be relabelled as PASS.

## 6. Production rollout order (not authorized by this plan)

Each mutable step requires a separate Owner-approved window:

1. commit the reviewed source and push only its feature branch for Git review
   and any non-Production Preview;
2. freeze the exact source commit, migration-028 SHA-256, and intended migration
   ledger version/name;
3. apply migration 028 once while all three catalog flags remain false; the old
   Production application remains safely read-only;
4. verify the live migration ledger, RPC/function ACL, bounded Admin/non-Admin
   read result, and all three false flags;
5. merge/push that exact reviewed commit to `main` once; this GitHub action is
   the Production Vercel auto-deploy trigger, so there is no separate manual
   Vercel deploy step;
6. wait for the matching Production deployment to be Ready and verify the
   application still presents read-only behavior while the flag is false;
7. set only `catalog_admin_enabled=true` once;
8. verify that the active Admin sees the draft workflow while a non-Admin
   remains denied;
9. perform one bounded disposable-draft smoke only if separately authorized,
   then abandon that draft and verify the current pointer, published rows,
   BOQs, and Factor F are unchanged.

Do not combine a failed step with a retry. Stop, preserve evidence, and prepare
a fresh forward-only correction or a new window.

## 7. Recovery and stop rules

The first-line operational recovery is a single setting change:
`catalog_admin_enabled=false`. New database mutation requests are then denied
when their RPC gate is evaluated; an in-flight transaction is not forcibly
cancelled. Verify denial at the database boundary, then refresh/revalidate the
UI so it returns to read-only while preserving active-Admin read access. Close
the gate and verify that denial before any application rollback.

Do not roll back or delete migration 028, and do not edit migration 027. If the
new RPC or application parsing is defective, keep the flag false and fix
forward. Stop immediately on authorization drift, malformed configuration,
unexpected catalog/BOQ/Factor F mutation, pointer drift, or an unexplained
ledger mismatch.

## 8. Completion definition

Master Catalog is end-to-end complete only after:

- migration 028 and the matching application are deployed;
- the active-Admin enabled path and non-Admin denial are verified;
- the kill switch is verified to fail closed;
- no catalog data, existing BOQ, or Factor F invariant changed unexpectedly;
- P-49 formal closeout records the true checks performed and lists any
  accepted residual without claiming an unrun test as PASS; and
- final operational documentation reflects the live state.

Until then, the accurate status remains: **data/publication complete; safe
read-only Admin UI live; end-to-end Admin edit workflow pending**.

## 9. Local implementation result — 2026-08-28

The authorized local preparation is complete on the clean branch
`codex/master-catalog-admin-edit`, based on
`c2ea0852affe1abca0230dde3daa4b332ead0a83`:

- migration 028 adds only the bounded Admin-gate projection and leaves all
  three catalog flags false;
- the shared application loader is used by the Master Catalog workspace, the
  `/admin` entry card, and draft XLSX/PDF export;
- legacy authorization remains read-only, and all malformed, missing,
  unauthorized, or failed gate reads fail closed;
- current database/schema/security/operating documents carry the same current
  status overlay while retaining earlier records as history; and
- at this local validation snapshot, no commit, push, Production database
  write, flag change, deploy, catalog mutation, BOQ mutation, or Factor F
  mutation had occurred.

Local validation completed as follows:

- `48` test files / `426` tests: PASS;
- TypeScript: PASS;
- ESLint: PASS;
- production build: PASS;
- `git diff --check`: PASS;
- independent application, database/security, and documentation reviews:
  PASS after the requested corrections; and
- migration 028 source SHA-256:
  `6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3`.

The available Local Supabase database is a pre-027 environment: it has no
exact Production migration ledger, reports current catalog `2568.0.0`, and
lacks the migration-027 active-Admin predicate. It was inspected read-only and
was not mutated. Therefore an exact disposable post-027 database/persona
rehearsal was **not run** and is recorded as an **accepted residual**, not as a
PASS. Migration 028 deliberately rejects that stale environment; the first
exact database verification remains part of the separately authorized rollout
window in Section 6.

## 10. Current bounded Git authority — 2026-08-28

The Owner's instruction to continue safely authorizes committing this reviewed
package and pushing it only to `codex/master-catalog-admin-edit` for Git review
and any non-Production Preview. It does not authorize merge/push to `main`,
migration 028 in Production, any catalog flag change, Production deployment,
or live mutation QA. After remote branch verification, stop before Section 6
step 3.
