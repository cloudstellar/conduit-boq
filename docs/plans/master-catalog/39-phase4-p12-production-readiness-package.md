# Phase 4 P-12 Production Readiness Package

**Prepared:** 2026-07-25

**Last updated:** 2026-07-26

**Status:** HOLD - the authorized Production read-only database/ledger/advisor
window is complete; Data API configuration, backup/isolated restore, executor,
and exact-window evidence remain open; P-12 has not been requested or approved

**Readiness baseline checkpoint:**
`6827ebc1a729b7675fe91db58e129c9381b33ddb`

**Bounded application candidate:** general-user catalog-version transparency;
exact commit `5068f944af2aa3fe8446c77c8ae8d48673cb260b`

**Branch:** `codex/master-catalog-phase4`

## 1. Decision summary

WP-8 and P-37 are complete under the explicitly recorded guided-UAT variance.
The repository, accepted Local migration chain, and clean Local baseline are
ready. The Owner then authorized the recommended bounded readiness evidence
window. On 2026-07-26 that window completed the read-only Production database
baseline, migration ledger, critical schema/grant/trigger inventory, and fresh
advisor reads without a Production write.

The actual P-12 Production migration must remain on HOLD because these required
rows are still open:

- Production Data API exposed-schema configuration is not yet proven;
- no fresh encrypted logical backup manifest or successful isolated restore
  rehearsal exists;
- the exact executor/tooling and maintenance-window record is not fixed;
- the fresh security findings still need the explicit Owner disposition named
  below; and
- the Owner has not given a go/no-go for an exact P-12 window.

Preparing or accepting this document does not authorize any further Production
access beyond the completed read-only evidence, any Production write, a Local
reset, a Local migration apply, deployment, feature enablement, Add/Supplement
release, publication, Factor F work, or a change to hotfix `016`.

## 2. Authority and scope

This package implements the pause required by:

- [Production Runbook section 6.5](./12-phase4-production-runbook.md);
- [Verification Report section 6.5](./13-phase4-verification-report.md);
- [Decision Register P-12](./19-phase4-decision-register.md); and
- [Implementation Execution Pack section 16.1](./23-phase4-implementation-execution-pack.md).

The following authority remains unchanged:

- Production `2568.0.0` is authoritative for item names, units, and prices.
- The local workbook is reconciliation/reference evidence only.
- Hotfix `016` is a completed BOQ regression fix, not Phase 4 scope.
- Factor F is complete and must remain unchanged by Master Catalog rollout.
- P-12, P-13, P-14, and P-15 remain sequential decisions.

## 3. Exact source and repository gates

The reviewed readiness baseline is exact commit
`6827ebc1a729b7675fe91db58e129c9381b33ddb`. It contains:

- the P-37 Owner-accepted implementation lineage;
- removal of ten existing ESLint warnings without business-behavior changes;
  and
- the Next.js 16 `middleware.ts` to `proxy.ts` convention migration with the
  same matcher and session behavior.

Checks on this exact source:

| Check | Result |
|---|---|
| `npm test` | Passed: 36 files, 233 tests |
| `npx tsc --noEmit` | Passed |
| `npm run lint` | Passed: 0 errors, 0 warnings |
| `npm run catalog:authority:check` | Passed: 710 mappings, 65 groups, 17 exclusions |
| `npm run build` | Passed with Next.js 16.2.9; no middleware deprecation warning remains |
| Git tracked state before documentation | Clean |

After that baseline, the Owner approved a bounded correction for ordinary-user
catalog-version clarity. The candidate:

- derives dashboard and price-list year/version copy from the active default
  pointer;
- shows and rechecks the exact pointer before creating a BOQ;
- shows the BOQ-bound active or archived version on edit/read-only and print
  preview, stamps it at the bottom right of every printed page without changing
  the official `บัญชีราคา` heading, and writes it to generated Excel; and
- fails closed instead of substituting the current pointer when a bound version
  is missing, draft, or otherwise unpublished.

Exact candidate commit
`5068f944af2aa3fe8446c77c8ae8d48673cb260b` passed 37 files/239 tests,
TypeScript, zero-warning lint, production build, desktop/mobile Local staff
Browser smoke without horizontal overflow or console errors, and binary Excel
inspection. The preview page total also counts the Factor F supplement.

The Local preparation used Supabase CLI `2.107.0` and PostgreSQL major version
17. The exact CLI/container versions must be frozen in the later executor
record; do not upgrade tooling during the migration window without repeating
the reviewed dry-run gates.

## 4. Reviewed migration manifest

These files are Local-only and are not Production-approved:

| Migration | SHA-256 |
|---|---|
| `017_master_catalog_phase4_foundation.sql` | `fc3bd3a9e144db7e78fb7d777fad8b3e49bae99717aae07ef27a296bf0cf198c` |
| `018_master_catalog_phase4_draft_mutation.sql` | `d78704bb90d551a29b59f0d0032052fa5f1773b8c07721cf6e8f6e03be044e73` |
| `019_master_catalog_phase4_publish_pointer.sql` | `841692aae1b3160c67db160f73bc7042c2d83fe7259e446ef1d1c73928c00bb9` |
| `020_master_catalog_phase4_admin_workflow_hardening.sql` | `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93` |
| `021_master_catalog_phase4_placement_governance.sql` | `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` |
| `022_master_catalog_phase4_draft_identity_and_release_number.sql` | `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3` |
| `023_master_catalog_phase4_published_code_rls_scope.sql` | `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88` |
| `024_master_catalog_phase4_set_based_placement_invalidation.sql` | `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25` |
| `025_master_catalog_phase4_withdraw_order_compaction.sql` | `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f` |

The canonical Local bootstrap order remains `009`-`015`, hotfix `016`, then
Phase 4 `017`-`025`. Do not edit an accepted file to fix a post-review issue;
use a separately reviewed forward migration if a material correction becomes
necessary.

## 5. Fresh Local read-only baseline

Read-only SQL was run on 2026-07-25 without a reset, migration, or data write.

| Invariant | Readback |
|---|---|
| Current/default catalog | `2568.0.0`, active/default |
| Catalog rows | 710 active rows |
| Dataset hash | `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` |
| Identity/code uniqueness | 0 duplicate identities; 0 duplicate codes |
| Display order | Contiguous zero-based order `0` through `709` |
| Working drafts | 0 |
| Phase 4 feature flags | `catalog_admin_enabled=false`; `catalog_new_identity_enabled=false`; `catalog_retirement_enabled=false` |
| BOQ | 198 BOQs; 1,547 BOQ items; all 198 BOQs version-bound |
| Factor F default | `2569.0.0`, active, 36 current rows, 73 total versioned rows |
| Factor F BOQ bindings | 0 version-bound and 198 legacy snapshot-based, unchanged from accepted Local evidence |
| Frozen authority | 710 mappings; 65 code groups; 17 exclusions |

The current `2568.0.0` rows intentionally use the frozen first-rollout mapping
for target code-group resolution. A null current-row `code_group_id` is not a
missing-authority finding: the frozen mapping has complete 710-row coverage and
the first structured candidate applies it under the publish guards.

## 6. Security and database disposition

Fresh Local ACL/RLS readback shows:

- all eleven Phase 4 public tables have RLS enabled;
- `anon` has no Phase 4 table write privilege;
- `authenticated` has read access but no direct table write privilege;
- the public default-version pointer is intentionally readable and not
  writable by `anon`;
- all thirteen public `SECURITY DEFINER` functions deny `anon` execution;
- eight existing public functions are callable by `authenticated`, including
  the guarded `get_catalog_publish_readiness` facade;
- the Local Data API exposes only `public` and `graphql_public`, not `private`;
  and
- the private mutation implementations retain their admin, feature-flag,
  expected-lock, request-fingerprint, and audit guards.

This is acceptable for readiness preparation. The later Production read-only
window must verify the actual exposed-schema configuration and function grants.
If `private` is exposed through the Production Data API, P-12 is blocked until
that drift is removed and retested.

Standard `supabase db lint` repeats two known findings:

1. `private.place_catalog_items_impl` references a function-created
   `pg_temp.catalog_placement_input` table that the generic static analyzer
   cannot see. The transaction-scoped temp-aware `plpgsql_check` and runtime
   rollback/race/replay suites found no defect.
2. `private.catalog_placement_state.v_row_count` is assigned but never read.
   This has no runtime effect.

Recommendation: keep the second item as a documented managed residual until
the next substantive replacement of `catalog_placement_state`. Adding a large
`CREATE OR REPLACE FUNCTION` migration only to remove one dead local variable
has higher review and regression cost than the warning. Do not modify accepted
migration `021`, and do not add migration `026` solely to silence this lint.
The Owner must accept or reject this residual in the actual P-12 decision.

The latest accepted Local advisor baseline remains:

- security advisor: no issue;
- performance advisor: 16 RLS init-plan warnings, 2 multiple-permissive-policy
  warnings, 7 unindexed-FK information findings, and 38 fresh-reset
  unused-index information findings;
- both Phase 4 frozen-authority foreign keys have covering indexes.

## 7. Authorized Production read-only evidence

The Owner authorized the bounded evidence window recorded in the Decision
Register and Tracker. The queries below were run against Supabase project
`otlssvssvgkohqwuuiir`
(`Conduit Price List`) using read-only `SELECT` and advisor operations only.
The evidence timestamp was 2026-07-26 09:53 +07. The project was
`ACTIVE_HEALTHY`, PostgreSQL was `17.6`, and no DDL, DML, migration, feature
flag, deploy, publication, Factor F mutation, or hotfix change was performed.

### 7.1 Ledger and hotfix

The remote ledger contains the reviewed Production sequence with no unexpected
entry at or after `009`:

| Root file | Remote ledger |
|---|---|
| `009_master_catalog_p0_containment.sql` | `20260621045208_master_catalog_p0_containment` |
| `010_master_catalog_phase1a_versioning.sql` | `20260621052517_master_catalog_phase1a_versioning` |
| `011_master_catalog_phase1b_hardening.sql` | `20260621104056_master_catalog_phase1b_hardening` |
| `012_factor_f_version_foundation.sql` | `20260628190218_factor_f_version_foundation` |
| `013_factor_f_seed_current_baseline.sql` | `20260628190357_factor_f_seed_current_baseline` |
| `014_factor_f_publish_2569_0_0.sql` | `20260628190621_factor_f_publish_2569_0_0` |
| `015_factor_f_repair_legacy_snapshot_metadata.sql` | `20260628190757_factor_f_repair_legacy_snapshot_metadata` |
| `016_hotfix_preserve_boq_item_suffix.sql` | `20260706090832_hotfix_preserve_boq_item_suffix` |

`010a` is an operational concurrent-index runbook rather than a ledger row.
All four named indexes are present with `indisvalid=true` and
`indisready=true`.

The previous `20260706090246` timestamp in two authority documents was stale.
The deployed `save_boq_with_routes(uuid,jsonb,jsonb)` body is 7,451
characters and matches the reviewed `016` body exactly at
`sha256:7187ffb568617783146d4b5f8db8021147cd212a578e655879c49f32f9fb54f0`.
Production also reports `SECURITY DEFINER`, pinned `search_path=''`,
`anon` denied, and `authenticated` allowed. The timestamp correction therefore
does not represent a different hotfix or schema defect.

### 7.2 Catalog, BOQ, and Factor F baseline

| Invariant | Production readback |
|---|---|
| Current/default catalog | `2568.0.0`, active/default |
| Catalog rows/codes | 710 rows; 710 distinct codes |
| Missing/invalid authority values | 0 missing code/name/unit/cost; 0 unit-cost mismatches |
| Authority value hash | `sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5` |
| Local/Production value parity | Same 710-row authority value hash |
| BOQ | 232 BOQs; 2,183 BOQ items |
| BOQ catalog integrity | 0 missing version; 0 non-current BOQ; 0 missing price row; 0 cross-version item binding |
| Factor F default | `2569.0.0`, active, 36 rows |
| Factor F history | 2 versions; 73 total rows |
| Factor F default hash | `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6` |
| BOQ Factor F split | 30 version-bound to `2569.0.0`; 127 usable legacy snapshots; 75 legacy rows without `factor_f`; 0 partial snapshots |

The BOQ count is a live operational count and is expected to differ from the
older scrubbed Local snapshot. It is not catalog drift. The relevant
invariants are the zero broken version relationships and unchanged authority
and Factor F pointers/hashes.

### 7.3 Schema, RLS, and activity

- no Phase 4 `catalog_*` table or function, Phase 4
  `price_list_versions` column, or catalog feature setting exists yet;
- RLS is enabled on the current catalog, BOQ, audit, and Factor F tables;
- current price-list/version/default tables expose no `anon` or
  `authenticated` direct write grant;
- legacy BOQ and `factor_reference` table grants remain, but their write
  policies are restricted to `authenticated` and enforce the existing role/
  ownership checks; `anon` has no matching RLS policy;
- all seven expected catalog/BOQ/Factor F pointer and immutability triggers are
  present and enabled;
- the evidence read found no other active transaction, idle-in-transaction
  session, lock waiter, or open transaction; and
- Phase 4 catalog edit sessions cannot exist because the Phase 4 objects are
  absent.

The Production Data API exposed-schema setting remains **unproven**. The
database setting is platform-managed and was not visible through
`current_setting` or role settings. A direct read-only profile probe using the
publishable keys returned `401` for `public`, `graphql_public`, and `private`,
so it proves neither exposure nor non-exposure. An authorized Dashboard or
Management API read must show that `private` is not exposed before P-12 can be
requested.

### 7.4 Advisor disposition

The fresh Production security advisor returned eight warnings:

- seven `authenticated`-callable `SECURITY DEFINER` functions; and
- Supabase Auth leaked-password protection is disabled.

The seven function findings are generic exposure warnings, not proof of an
authorization bypass. All seven deny `anon`. The mutating admin/BOQ facades
retain active-role, ownership, or target checks; `get_my_profile` is
self-scoped. `get_user_role(uuid)` and `is_admin(uuid)` are read-only baseline
helpers but have a broader parameter surface than ideal. Do not alter them in
this evidence window. Record a separate usage/minimization review and require
new regression/RLS evidence before any future replacement.

Leaked-password protection is a genuine global Auth hardening opportunity, not
a Phase 4 database migration defect. Recommendation: the Owner should approve
enabling it as a separately controlled Auth configuration change before P-14,
or explicitly accept the residual for the exact release. It does not authorize
an Auth change in this window.

The performance advisor returned pre-Phase-4 baseline findings: 8 unindexed-FK
information rows, 19 RLS init-plan warnings, 16 unused-index information rows,
and 5 multiple-permissive-policy warnings. Phase 4 objects are absent, so none
was introduced by `017`-`025`. Do not add or remove indexes speculatively.
Capture a fresh post-migration diff and stop if Phase 4 adds an unreviewed
finding.

### 7.5 Backup and restore disposition

No backup or restore was performed. The available connector does not list or
download platform backups. The unlinked repository CLI can create a logical
dump only with an explicitly supplied database URL/password, and the connector
does not expose that secret. A Supabase development branch is not acceptable
restore evidence because it excludes Production data. Restoring to a new
project may incur cost and requires a separate cost confirmation.

This row stays **HOLD**, not failed. The next authorized backup step must name
one of these paths:

1. an encrypted `supabase db dump --db-url ...`/`pg_dump` to an approved
   off-repository secure location, followed by restore into isolated
   PostgreSQL 17; or
2. an approved platform backup/clone into a separately cost-confirmed
   non-Production project.

In both cases, exclude auth secrets, record the manifest/counts/hashes, and run
the Production Runbook section 8 integrity checks. No verified restore means no
P-12.

## 8. Readiness matrix

| Gate | Evidence | Status |
|---|---|---|
| WP-8/P-37 | Owner-accepted with guided-UAT variance; evidence remains truthfully labelled | Ready |
| Exact application source | Baseline `6827ebc1a729b7675fe91db58e129c9381b33ddb`; final bounded general-user version-transparency candidate `5068f944af2aa3fe8446c77c8ae8d48673cb260b` | Ready |
| Migration source manifest | Exact `017`-`025` filenames and hashes above | Ready |
| Local clean-chain authority | Owner-approved clean bootstrap and later no-reset evidence; canonical order unchanged | Ready |
| P-20 portability | Repeated 710-row identity/hash evidence and canonical hash match | Ready |
| Idempotency/concurrency | Stable request ID, mismatch rejection, lock conflict, replay, and one-effect recovery passed | Ready |
| BOQ/hotfix regression | Suffix preservation, version links, save/print/export, and Local invariants passed | Ready |
| General-user version visibility | Pointer-derived current version plus immutable BOQ-bound version appear on dashboard/price list/create/edit/print/Excel; invalid bindings fail closed; desktop/mobile smoke and binary Excel proof passed | Ready on exact candidate |
| Factor F isolation | Pointer, rows, hashes, and BOQ snapshot behavior unchanged | Ready |
| Official export | Owner-accepted Excel/PDF pair plus tracked semantic verifier | Ready |
| Feature isolation | All three Phase 4 flags are false | Ready |
| Repository lint/build debt | 0 ESLint warnings; Next.js proxy convention applied; production build passed | Ready |
| Local security/RLS | No Local runtime blocker; dead assignment and baseline minimization residuals documented | Hold - exact Owner residual decision pending |
| Production migration ledger | Expected `009`-`016` set present; no unexpected later entry; `010a` indexes valid/ready; exact hotfix body matches | Ready |
| Production baseline/schema drift | PostgreSQL 17.6; `2568.0.0`/710; Local/Production authority hash match; BOQ/Factor F/RLS/triggers clean; Phase 4 absent as expected | Ready for database scope |
| Production Data API schemas | Platform configuration must prove `private` is not exposed | Hold - authorized Dashboard/Management read pending |
| Backup/restore | Fresh encrypted backup manifest and isolated restore test | Hold - approved secure path/credentials or cost-confirmed platform path pending |
| Production advisors | Fresh output captured; no Phase 4 object exists, but guarded definer/Auth-hardening residuals need Owner disposition | Hold - Owner/security decision pending |
| Migration executor record | Exact tool version, reviewed hashes, timeouts, executor, verifier, window, and stop conditions | Hold - window proposal pending |
| P-12 Owner go/no-go | Exact Production window approval | Hold - not requested |

Overall result: **HOLD**. The implementation is ready to collect the remaining
Data API, backup/restore, security disposition, and executor/window evidence.
It is not ready to execute the Production migration.

## 9. Next bounded approval

The safest next request is still not P-12 itself. The database/ledger/advisor
read-only portion is complete and should not be repeated unless it becomes
stale. Use
[Owner Decision Checklist #40](./40-phase4-p12-owner-decision-checklist.md)
to request a narrowly scoped decision covering:

1. an authorized read of Production Data API exposed schemas;
2. the exact encrypted logical-backup path and secure off-repository location,
   or the cost-confirmed platform restore path;
3. restoration only into isolated non-Production PostgreSQL 17 and the named
   integrity checks;
4. acceptance/remediation timing for the guarded-definer, leaked-password, and
   Local dead-assignment residuals; and
5. the proposed executor, independent verifier, tooling, timeouts, and
   maintenance window.

That approval must explicitly state that no Production DDL/DML, feature flag,
deploy, publication, Factor F mutation, or hotfix change is authorized.

After the remaining evidence is attached to this package:

1. classify every row Ready, Hold, or Blocked;
2. record the proposed executor, verifier, timeout values, exact hashes, and
   maintenance window;
3. obtain the Owner's explicit managed-residual decision;
4. request P-12 only if every blocking row is Ready; and
5. keep P-13, P-14, and P-15 separate.

## 10. Stop conditions

Stop without migration if any of the following occurs:

- Production does not point to `2568.0.0` with the expected 710-row authority;
- hotfix `016` is missing or the remote ledger contains unexplained drift;
- backup or isolated restore verification fails;
- PostgreSQL/Data API configuration differs materially from the reviewed Local
  contract;
- an advisor finding is new, untriaged, or affects Phase 4;
- migration hashes differ from this manifest;
- BOQ or Factor F before-state differs from the approved baseline;
- feature flags are not all false; or
- the Owner has not approved the exact P-12 window.
