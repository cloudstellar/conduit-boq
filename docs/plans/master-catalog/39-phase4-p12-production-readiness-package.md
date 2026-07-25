# Phase 4 P-12 Production Readiness Package

**Prepared:** 2026-07-25

**Status:** HOLD - desk review and Local read-only verification are complete;
P-12 has not been requested or approved

**Implementation checkpoint:**
`6827ebc1a729b7675fe91db58e129c9381b33ddb`

**Branch:** `codex/master-catalog-phase4`

## 1. Decision summary

WP-8 and P-37 are complete under the explicitly recorded guided-UAT variance.
The repository, accepted Local migration chain, and clean Local baseline are
ready for a bounded Production-readiness evidence window.

The actual P-12 Production migration must remain on HOLD because the following
evidence intentionally does not exist yet:

- a freshly authorized read-only Production baseline and schema-drift report;
- a fresh Production migration-ledger check proving hotfix `016`;
- a fresh backup manifest and successful restore rehearsal in an isolated
  environment;
- fresh Production security/performance advisor output;
- the exact executor/tooling record for the proposed migration window; and
- the Owner's explicit go/no-go for that exact window.

Preparing or accepting this document does not authorize Production access,
Production writes, a Local reset, a Local migration apply, deployment, feature
enablement, Add/Supplement release, publication, Factor F work, or a change to
hotfix `016`.

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

The reviewed application source is exact commit
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

Fresh Production advisors remain mandatory because Local findings cannot prove
the current Production state.

## 7. Readiness matrix

| Gate | Evidence | Status |
|---|---|---|
| WP-8/P-37 | Owner-accepted with guided-UAT variance; evidence remains truthfully labelled | Ready |
| Exact application source | Commit `6827ebc1a729b7675fe91db58e129c9381b33ddb` and repository gates above | Ready |
| Migration source manifest | Exact `017`-`025` filenames and hashes above | Ready |
| Local clean-chain authority | Owner-approved clean bootstrap and later no-reset evidence; canonical order unchanged | Ready |
| P-20 portability | Repeated 710-row identity/hash evidence and canonical hash match | Ready |
| Idempotency/concurrency | Stable request ID, mismatch rejection, lock conflict, replay, and one-effect recovery passed | Ready |
| BOQ/hotfix regression | Suffix preservation, version links, save/print/export, and Local invariants passed | Ready |
| Factor F isolation | Pointer, rows, hashes, and BOQ snapshot behavior unchanged | Ready |
| Official export | Owner-accepted Excel/PDF pair plus tracked semantic verifier | Ready |
| Feature isolation | All three Phase 4 flags are false | Ready |
| Repository lint/build debt | 0 ESLint warnings; Next.js proxy convention applied; production build passed | Ready |
| Local security/RLS | No Local blocker; managed residuals documented | Ready for Owner residual decision |
| Production migration ledger | Must freshly prove `009`-`016` and no unreviewed drift | Pending authorization |
| Production baseline/schema drift | Must freshly compare pointer, counts, hashes, BOQ, Factor F, grants, RLS, functions, and PostgreSQL version | Pending authorization |
| Backup/restore | Fresh backup manifest and isolated restore test | Pending authorization |
| Production advisors | Fresh security/performance output with no unresolved Phase 4 blocker | Pending authorization |
| Migration executor record | Exact tool version, reviewed hashes, timeouts, executor, verifier, window, and stop conditions | Pending window proposal |
| P-12 Owner go/no-go | Exact Production window approval | Not requested |

Overall result: **HOLD**. The implementation is ready to collect the remaining
Production evidence, but it is not yet ready to execute the Production
migration.

## 8. Next bounded approval

The safest next request is not P-12 itself. Request one bounded readiness
evidence window that authorizes only:

1. read-only Production baseline and schema-drift queries;
2. read-only remote migration-ledger verification;
3. fresh security/performance advisor reads;
4. creation of a fresh logical backup through the approved platform path; and
5. restoration of that backup into an isolated non-Production environment,
   followed by the named integrity checks.

That approval must explicitly state that no Production DDL/DML, feature flag,
deploy, publication, Factor F mutation, or hotfix change is authorized.

After the evidence is attached to this package:

1. classify every row Ready, Hold, or Blocked;
2. record the proposed executor, verifier, timeout values, exact hashes, and
   maintenance window;
3. obtain the Owner's explicit managed-residual decision;
4. request P-12 only if every blocking row is Ready; and
5. keep P-13, P-14, and P-15 separate.

## 9. Stop conditions

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
