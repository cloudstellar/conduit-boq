# Phase 4 P-12 Private-Function Default-Privilege Finding

**Prepared:** 2026-07-28

**Status:** OPTION B REVIEWED; P-44 SOURCE FREEZE AUTHORIZED; P-12 HOLD at
resulting-HEAD/Remote evidence; no Local execution or Production approval

## 1. Finding

The first isolated PostgreSQL 17 CLI rehearsal applied only migration `017`
and then failed closed before `018`.

Migration `017` contains:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
```

PostgreSQL grants `EXECUTE` on newly created functions to `PUBLIC` through its
global default. A per-schema default-privilege rule can add privileges to that
global default, but cannot remove a globally granted privilege. PostgreSQL 17
therefore documents the schema-scoped `REVOKE ... FROM PUBLIC` form above as
having no effect unless it reverses a matching earlier per-schema grant.

Official authority:
[PostgreSQL 17 ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).

## 2. Bounded evidence

The rehearsal used:

- source HEAD `07d1d3399cea363a2ff923c6393d4a3259ce623c`;
- unchanged reviewed migration `017` SHA-256
  `fc3bd3a9e144db7e78fb7d777fad8b3e49bae99717aae07ef27a296bf0cf198c`;
- native Supabase CLI `2.107.0`;
- isolated PostgreSQL `17.6`;
- disposable database `conduit_p12_rehearsal` behind an exact nonce sentinel;
- scrubbed Local-reference application baseline with no Auth payload;
- exact historical ledger `009`-`016`; and
- a dirty-tree rehearsal kit explicitly marked `productionEligible=false`.

The native CLI added exactly ledger row
`20260728001700 master_catalog_phase4_foundation` and returned exit code zero.
Postflight found:

- no `pg_default_acl` row for `postgres` functions in `private`;
- the expected stage flag state, with only
  `catalog_admin_enabled=false`; and
- catalog pointer `2568.0.0` unchanged.

A transaction-scoped probe then:

1. repeated the schema-scoped default `REVOKE`;
2. created a temporary `private` function;
3. observed that `PUBLIC` could still execute it; and
4. rolled the whole probe transaction back.

The runner classified the outcome as uncertain and did not start `018`.

| Evidence | SHA-256 |
|---|---|
| Rehearsal kit manifest | `dff3ee0c5119fac6a6a037fbd72d4063f47414069faf4e70c589e28b156bd766` |
| Fail-closed evidence manifest | `690f0d836f30b01f1f1a971eec2f24e82ce69d410af261eedaf0997fd5bd3770` |
| Migration outcome | `938575d9a448cd5b64b4293e5a92b9405260f191454785ede09de78b6a32dd8d` |

No Local Supabase reset/write and no Production access/write occurred.

## 3. Security impact

The disposable rehearsal stopped before any private Phase 4 routine was
created, so it did not create a current exposed routine there. A static
follow-up review found that migration `018` would create twelve private
`SECURITY DEFINER` helpers without an explicit per-function revoke:

- `catalog_action_error`;
- `catalog_action_success`;
- `catalog_is_uuid`;
- `catalog_is_money`;
- `catalog_request_fingerprint`;
- `catalog_version_transition_valid`;
- `catalog_money_text`;
- `catalog_admin_context`;
- `catalog_admin_enabled`;
- `catalog_price_row_snapshot`;
- `catalog_ensure_category`; and
- `catalog_ensure_code_group`.

Migration `018` also grants `authenticated` usage on schema `private`. Without
an effective global default revoke before `018`, those helpers inherit
PostgreSQL's normal `PUBLIC EXECUTE` default. The schema is not exposed through
the Production Data API, which reduces the external application path, but it
does not make the database ACL correct and does not satisfy the reviewed
defense-in-depth contract.

Other created/replaced routines do receive explicit revokes and grants, and
their exact live ACLs remain mandatory verifier checks. The defect is therefore
both a missing future-object fail-safe and a concrete unsafe intermediate state
if the current `017`-`025` sequence were allowed to continue unchanged.

The Production database has not received `017`, so this rehearsal finding did
not change Production exposure.

The subsequent source audit found a second part of the same default-privilege
boundary. The canonical Supabase baseline grants `service_role` function
`EXECUTE` through a `public` schema-specific default for role `postgres`.
Migrations `009` and `010` remove the `anon` and `authenticated` schema
defaults but intentionally did not remove `service_role`. Consequently the
four rejecting `SECURITY INVOKER` stubs created by `017` may retain
`service_role EXECUTE` until the bridge. The corrected Option B contract must
therefore remove both PostgreSQL's global `PUBLIC` default and every additive
`public`/`private` API-role function default, then normalize the existing
stubs. From `017a` onward no Phase 4 routine may be executable by
`service_role` unless a later reviewed migration grants it explicitly.

A bounded read-only check of the existing post-`025` Local reference confirmed
the runtime consequence without changing Local state. All twelve helpers are
`SECURITY DEFINER`. Nine still report inherited `PUBLIC EXECUTE`, which also
makes `has_function_privilege('authenticated', ..., 'EXECUTE')` true:

- `catalog_action_error`;
- `catalog_action_success`;
- `catalog_is_uuid`;
- `catalog_is_money`;
- `catalog_request_fingerprint`;
- `catalog_money_text`;
- `catalog_admin_context`;
- `catalog_admin_enabled`; and
- `catalog_price_row_snapshot`.

Later migrations explicitly deny the remaining three
(`catalog_version_transition_valid`, `catalog_ensure_category`, and
`catalog_ensure_code_group`). Local `anon` has no private-schema usage, so its
inherited function privilege is not an invocable path; `authenticated` does
have the reviewed schema usage from `018`. The Production Data API does not
expose `private`. These controls reduce reachability, but the nine Local ACLs
confirm that the default-privilege defect is real. No Local reset, migration,
or write was performed by this check.

## 4. Options

### Option A - Accept or patch explicit per-function grants only

Treat the schema-scoped statement as harmless dead SQL and rely on exact
per-function revoke/grant checks. This option cannot accept the current files
as-is: it needs a separately reviewed correction that explicitly revokes the
twelve `018` helpers before `authenticated` receives usable access.

Advantages:

- avoids a global change to future public functions.

Disadvantages:

- contradicts the reviewed defense-in-depth contract;
- still needs a new reviewed correction/ledger scope for the twelve helpers;
- leaves future function safety dependent on every author remembering an
  explicit revoke; and
- accepting the current files as-is would require weakening a correctly
  fail-closed readiness gate.

**Disposition:** not recommended.

### Option B - Forward migration with a global function default revoke

Insert a separately reviewed forward correction in the Production execution
order immediately after `017` and before `018`, for the executing object-owner
role:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS
  FROM PUBLIC, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS
  FROM PUBLIC, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA private
  REVOKE EXECUTE ON FUNCTIONS
  FROM PUBLIC, anon, authenticated, service_role;
```

Also reassert explicit denial on all existing `private` routines and verify
that intended public RPCs retain only their reviewed explicit grants. Because
Production has not received any Phase 4 migration, a new ledger slot between
the reserved `017` and `018` versions can correct the Production order without
editing either reviewed file.

Advantages:

- implements least privilege at the only PostgreSQL scope that can remove the
  built-in `PUBLIC EXECUTE` default;
- turns a forgotten grant into a fail-closed application error instead of a
  security exposure; and
- produces a directly queryable `pg_default_acl` guard for the exact object
  owner.

Disadvantages:

- applies to every future function created by that role, not only functions in
  `private`;
- future intended RPCs must always receive explicit grants;
- expands the reviewed ledger, bootstrap, hash package, runner, and P-12
  decision scope; and
- requires a new isolated replay and independent security review.

**Disposition:** Owner-selected for repository candidate design,
implementation, static verification, and isolated rehearsal preparation;
independent architecture/security/source review has passed, while fresh
two-pass evidence and every Production gate remain open.

A second transaction-scoped probe tested this option without persisting it.
The global revoke created
`pg_default_acl {postgres=X/postgres}` for functions at global scope; a
temporary `private` function then reported `PUBLIC=false`, `anon=false`, and
`authenticated=false`. The probe transaction was rolled back. This proves the
PostgreSQL mechanism, but is not approval of its broader application impact.

### Option C - Dedicated private owner role or DDL enforcement

Create a separate owner role with global default denial, or add automated DDL
enforcement for the `private` schema.

Advantages:

- can isolate the default policy to a dedicated ownership boundary.

Disadvantages:

- adds role lifecycle, grants, ownership transfer, restore, and executor
  complexity;
- changes the already reviewed same-owner execution contract; and
- is disproportionate for the current P-12 window.

**Disposition:** defer to a later architecture hardening proposal unless a
review rejects Option B.

## 5. Recommended forward-migration review scope

The Owner authorized repository-only design and implementation of Option B on
2026-07-28. The candidate must execute after `017` and before `018`; do not
edit either reviewed migration. An
after-`025`-only correction is unsafe because the twelve `018` helpers would
already have inherited `PUBLIC EXECUTE`.

The review must freeze:

- filename, ledger timestamp/name, and SHA-256;
- exact required `session_user`/`current_user` and object-owner behavior;
- global default ACL before/after for the executing role;
- explicit ACLs for every existing `private` routine;
- exact grants, security mode, `search_path`, and body fingerprints for public
  RPCs;
- anonymous/authenticated/service-role positive and negative checks;
- exact insertion in Local bootstrap and the Production ledger order, followed
  by a clean disposable PostgreSQL 17 replay;
- one-file CLI-kit behavior and final verifier closeout;
- a stage-aware runner contract for the exact approved sequence: after `017`,
  `authenticated` still lacks private-schema usage and no private Phase 4
  routine exists; only the named bridge correction may follow while the global
  guard is pending; the global owner-level default ACL becomes mandatory after
  the bridge and before `018`; from `018` onward `authenticated` schema usage
  is expected, while exact routine ACLs must deny `PUBLIC`/`anon` and match
  reviewed grants. The bridge-aware runner now encodes that narrow hand-off;
  independent review passed, while fresh two-pass evidence must still prove it
  before the candidate can become rollout authority;
  and
- whether the Owner expands the future P-12 scope to include the bridge
  migration in exact `017`, bridge, `018`-`025` order, or requests the explicit
  helper-ACL alternative under Option A.

The candidate identity is now frozen for review:

| Field | Exact value |
|---|---|
| Source file | `017a_master_catalog_phase4_global_function_default_privileges.sql` |
| Ledger version | `20260728001730` |
| Ledger name | `master_catalog_phase4_global_function_default_privileges` |
| Source SHA-256 | `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7` |
| Exact order | `017` → `017a` → `018` |
| Current authorization | Repository implementation, completed P-43 authority/tooling reconciliation, static verification, independent source review, and P-44 exact reviewed 23-file commit/push only; isolated pass execution, Local application, and Production remain unauthorized |

The label `017a` is an operator-ordering aid, not an edit to migration `017`.
The exact ledger version is a valid 14-digit Supabase migration version
strictly between the frozen `017` and `018` versions.

### 5.1 Candidate-only PostgreSQL contract proof

The exact `017a` source above passed bounded positive and negative SQL proofs
in disposable PostgreSQL 17.10 and exact Supabase PostgreSQL 17.6.1.063
containers. Every container used `--network none`, no host port, a read-only
root filesystem, tmpfs data, and automatic removal.

The positive fixture reproduced the post-`017` state, including
schema-specific `service_role` EXECUTE on the four public stubs. After `017a`:

- the global function default was exact owner-only EXECUTE;
- every `public`/`private` schema function-default row was owner-only or absent;
- the four stubs allowed only owner plus `authenticated`; and
- a newly created private `SECURITY DEFINER` probe denied `PUBLIC`, `anon`,
  `authenticated`, and `service_role`.

The negative fixture created one private routine before `017a`. The exact
preflight rejected it with `expected zero private routines after migration
017, found 1`; the failed transaction left the global default absent and the
pre-bridge ACL state unchanged. This proves the candidate cannot be used as an
after-`025` patch.

These proofs did not use the Supabase migration ledger or the full corrected
chain. They are not pass 1, independent schema-contract review, pass 2,
Production-path acceptance, Local application, or P-12 approval.

## 6. Owner decision recorded

On 2026-07-28 the Owner selected:

> Authorize Option B as a no-tech-debt forward-migration candidate and make the
> repository contract correct.

This decision authorizes the source candidate, bootstrap/runner/test/authority
alignment, static verification, and isolated disposable rehearsal
**preparation**. P-43 additionally authorizes working-tree reconciliation of the
canonical gate order and the structured authenticated GitHub human-review
contract. P-44 separately authorizes the exact reviewed 23-file source/tooling
commit/push with no GO marker or PR and with protected untracked paths excluded.
Neither decision authorizes Local reset/application, disposable pass execution,
Production access or migration, deployment, feature enablement, publication,
Factor F mutation, hotfix work, P-13, P-14, or P-15.

P-12 remains HOLD. Independent architecture/security/source review and static
checks passed on the working-tree candidate. P-44 authorizes the exact reviewed
23-file commit/push to freeze one clean source/tooling HEAD without a GO marker
or PR. After that push, record truthful Remote CI/status for the resulting HEAD.
Under separate explicit
destructive-Local approval, run exactly one corrected canonical bootstrap plus
consolidated invariants at that HEAD. Only then build the kit, run pass 1,
freeze the structured authenticated GitHub human-review contract, and run pass
2/closeout. Complete named executor/verifier/path/role/window and all other
PRE-P-12 gates, then ask the Owner separately for P-12. The fresh final rollback
backup is created/restored/checksummed only inside the later approved P-12
window before `017`; it is not a pre-GO action.
