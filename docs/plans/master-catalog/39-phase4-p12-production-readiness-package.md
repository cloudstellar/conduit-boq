# Phase 4 P-12 Production Readiness Package

**Prepared:** 2026-07-25

**Last updated:** 2026-07-29

**Status:** HOLD - the authorized Production read-only database/ledger/advisor,
Data API configuration, and readiness backup/isolated-restore evidence are
complete. The post-write encrypted-bundle detach/read-only-reopen/full-checksum
gate and historical readiness-head `07d1d33` Remote status record are also
complete; P-44 froze the reviewed executable migration/application/bootstrap/generator/runner content at clean pushed
commit `ed94c0304be2741217c7ea2c36322b426de1dfe5`, whose truthful Remote
record is `Vercel=success` with no PR-triggered GitHub Actions run. The Owner has
accepted the single-device-loss residual only for P-12 through P-15, with a
mandatory absolute 168-hour limit and 24-hour pause rule. The Owner also
accepted the three managed-residual recommendations, which are recorded in the
P-44 ancestry. A disposable network-isolated PostgreSQL 17 CLI rehearsal then applied
`017` only and hard-stopped because the required private-function default ACL
was absent; `018`-`025` were not applied. The Owner subsequently selected the
no-tech-debt Option B design/implementation path, and P-44 committed the bridge
candidate in exact `017` -> `017a` -> `018` order. The
independent source/architecture/security review and static checks are now
recorded complete. P-45 completed at pushed/upstream-equal
`d92d8ced42fc882481ebc2c4579adcf1edbebea7`. The one P-46 authorization was
consumed: canonical Local bootstrap completed through `025`, then WP-6.5
failed closed because the authenticated public invoker wrapper could not
execute owner-only `private.catalog_action_error(uuid,text,text,boolean,jsonb)`.
P-47 authorizes repository-only design/implementation/static review of
append-only `026` plus the required bootstrap/runner/cleanup/tests/authority
alignment; that repository/static review has passed. Local cleanup/application/
reset/retry, disposable execution, kit/pass, and Production remain
unauthorized. P-48 separately authorizes only the exact recorded 25-file
commit/push, with no PR. Kit, pass 1, structured
authenticated named-human GitHub review, and pass 2/closeout remain later
separate gates. The exact named-human executor,
distinct named-human independent verifier, tool path, `current_user`,
object-owner record, maintenance window, and separate P-12 decision also remain
open; P-12 has not been requested or approved

**Readiness baseline checkpoint:**
`6827ebc1a729b7675fe91db58e129c9381b33ddb`

**Bounded application candidate:** general-user catalog-version transparency;
exact commit `5068f944af2aa3fe8446c77c8ae8d48673cb260b`

**Exact pushed readiness/documentation head:**
`07d1d3399cea363a2ff923c6393d4a3259ce623c`

**Immutable P-44 executable-content ancestor:**
`ed94c0304be2741217c7ea2c36322b426de1dfe5`

**Historical P-45/P-46 source/tooling HEAD:**
`d92d8ced42fc882481ebc2c4579adcf1edbebea7`

**Replacement kit-bound source/tooling HEAD:** **UNRECORDED — HOLD**

**Branch:** `codex/master-catalog-phase4`

## 1. Decision summary

WP-8 and P-37 are complete under the explicitly recorded guided-UAT variance.
The accepted application and readiness evidence remain ready. The corrected
Local migration chain through `026` and a clean Local baseline remain HOLD.
The Owner authorized the recommended bounded readiness evidence window, and on
2026-07-26 that window completed the read-only Production database baseline,
migration ledger, critical schema/grant/trigger inventory, and fresh advisor
reads without a Production write.

The actual P-12 Production migration must remain on HOLD because these required
rows are still open:

- the exact named-human executor, distinct named-human independent verifier,
  execution path/client timeout, ledger/ownership/ACL behavior, approved
  `current_user`/object-owner role, and maintenance-window record are not
  fixed;
- the `017a` bridge passed its independent review/static gates and P-45
  completed at `d92d8ce`, but the one P-46 Local run later exposed the separate
  pure-helper callability defect after the chain completed through `025`;
  P-47 `026` repository/static closure has passed and P-48 authorizes only its
  exact Git publication, but the replacement clean pushed HEAD/Remote record
  and a fresh separately authorized Local rehearsal are required before any
  later-authorized kit/pass 1/authenticated review/pass 2;
- the 2026-07-28 managed-residual/custody amendments and P-43 reconciliation
  are committed in the P-44 ancestry; the P-46 external failure evidence is
  preserved and P-47 authority is recorded, while the replacement HEAD/Remote
  and corrected Local evidence remain open; and
- the Owner has not given a go/no-go for an exact P-12 window.

On 2026-07-27 the Owner explicitly accepted single-device-loss risk only from
the start of an approved P-12 execution through completion of separately
approved P-15 publication verification. This closes the PRE-P-12 custody
decision, not the execution controls: a fresh pre-migration backup,
restore/checksum, manifest, and sign-off remain mandatory. The same-device
acceptance expires at the earlier of (a) the start of the post-publication
checkpoint after separately approved P-15 verification or (b) 168 hours after
the recorded P-12 start. The encrypted package must be copied to an independent
Owner-controlled failure domain, checksum-verified, and recorded at expiry.
The 2026-07-28 amendment also requires that copy before any planned pause
exceeding 24 consecutive hours, or before resuming after an unplanned pause
reaches 24 hours.

On 2026-07-28 the Owner also accepted the guarded-definer disposition,
disabled leaked-password protection for P-12/P-13 only, and the unused
`v_row_count` assignment as managed debt. These decisions close their
PRE-P-12 rows only. Leaked-password protection still blocks P-14 until the
separate Auth decision in Checklist #40, and none of the decisions approves
P-12 or Production access.

This document records the already completed, separately authorized read-only
logical-backup/isolated-restore rehearsal. Preparing or accepting it authorizes
no further Production access or write, Local reset, Local migration apply,
deployment, feature enablement, Add/Supplement release, publication, Factor F
work, or change to hotfix `016`.

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

The exact pushed readiness/documentation head is
`07d1d3399cea363a2ff923c6393d4a3259ce623c`. At the 2026-07-27 checkpoint,
`codex/master-catalog-phase4` matched its remote branch, the tracked tree was
clean, and the bounded application candidate above remained an ancestor.
Remote combined status on that exact head reported `Vercel=success` at
<https://vercel.com/cloudwho-2662s-projects/conduit-boq/Bsrbq5u9S6rJpTrtEX4XcJ326aVf>.
The pull-request-triggered GitHub Actions run list for the exact head was empty.
This closes the requirement to record remote exact-head status; it does not
claim that GitHub Actions ran remote lint/test/build, and it is not the P-13
deployment-artifact acceptance.

The Local preparation used Supabase CLI `2.107.0` and PostgreSQL major version
17. Those versions are now frozen in section 4.1; do not upgrade tooling during
the migration window without repeating the reviewed dry-run gates. The exact
execution path/account/client timeout remains part of the later named executor
record.

## 4. Reviewed migration manifest

These files are Local-only and are not Production-approved:

| Migration | SHA-256 |
|---|---|
| `017_master_catalog_phase4_foundation.sql` | `fc3bd3a9e144db7e78fb7d777fad8b3e49bae99717aae07ef27a296bf0cf198c` |
| `017a_master_catalog_phase4_global_function_default_privileges.sql` | `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7` |
| `018_master_catalog_phase4_draft_mutation.sql` | `d78704bb90d551a29b59f0d0032052fa5f1773b8c07721cf6e8f6e03be044e73` |
| `019_master_catalog_phase4_publish_pointer.sql` | `841692aae1b3160c67db160f73bc7042c2d83fe7259e446ef1d1c73928c00bb9` |
| `020_master_catalog_phase4_admin_workflow_hardening.sql` | `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93` |
| `021_master_catalog_phase4_placement_governance.sql` | `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` |
| `022_master_catalog_phase4_draft_identity_and_release_number.sql` | `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3` |
| `023_master_catalog_phase4_published_code_rls_scope.sql` | `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88` |
| `024_master_catalog_phase4_set_based_placement_invalidation.sql` | `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25` |
| `025_master_catalog_phase4_withdraw_order_compaction.sql` | `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f` |
| `026_master_catalog_phase4_catalog_action_error_acl.sql` | `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a` |

The corrected canonical Local bootstrap order is `009`-`015`, hotfix `016`,
then Phase 4 `017`, `017a`, and `018`-`026`. Older pre-bridge clean evidence
and the P-46 bridge-aware run through `025` remain bounded historical evidence;
neither covers `026`. Migration `026` has passed repository/static independent
review as the forward-only correction; no accepted migration is edited.

### 4.1 PRE-P-12 execution freeze

The following mechanical execution facts are frozen:

| File | Transaction | Migration lock timeout | Migration statement timeout |
|---|---|---:|---:|
| `017` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `017a` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `018` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `019` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `020` | own `BEGIN`/`COMMIT` | 10s | 90s |
| `021` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `022` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `023` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `024` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `025` | own `BEGIN`/`COMMIT` | 10s | 60s |
| `026` | own `BEGIN`/`COMMIT` | 10s | 60s |

- Freeze Supabase CLI `2.107.0`, PostgreSQL major `17`, the eleven hashes above,
  and one candidate file per ledger entry in exact `017`, `017a`, `018`
  through `026` order.
- These are eleven independent file transactions, not one transaction spanning
  the whole sequence. No candidate file contains a
  concurrent/nontransactional index operation.
- Reviewed runtime mutators retain their separate 5s lock/30s statement
  timeouts; bounded read helpers use a 10s statement timeout. These runtime
  settings do not replace migration-client timeout planning.
- `020` is 394,076 bytes and has the longest internal statement timeout. The
  exact approved execution path must be rehearsed for that payload, use a client
  timeout longer than the reviewed database timeout, expose safe cancel/failure
  behavior, and preserve one identifiable remote ledger row per file.
- Before `017`, record `session_user` and `current_user` and freeze the approved
  Production object-owner role. The same `current_user` must execute `017`,
  `017a`, and `018`-`026` because `ALTER DEFAULT PRIVILEGES` is scoped to its
  executing role. Any identity/owner drift stops execution; do not improvise
  `ALTER OWNER` or ACL changes.
- Freeze the migration-stage flag contract. Before `017`, rows for
  `catalog_admin_enabled`, `catalog_new_identity_enabled`, and
  `catalog_retirement_enabled` are all absent. After `017`, `017a`, `018`, and
  `019`, only `catalog_admin_enabled` exists and its JSON value is boolean
  `false`. After each of `020`-`026`, all three rows exist and each JSON value
  is boolean `false`. Any boolean `true`, missing required row, or prematurely
  present row stops execution.
- Freeze the function-default ACL stage contract. Immediately after `017` and
  before `017a`, the global `postgres` function default ACL is absent and no
  private routine exists; this transient state is not permission to continue
  directly to `018`. After `017a`, the global default must be exact
  owner-only EXECUTE, any `public`/`private` schema-specific function-default
  row must be owner-only or absent, the four `017` public rejecting stubs must
  be executable only by owner plus `authenticated`, and `service_role` must be
  denied. From `018` onward, every Phase 4 routine must preserve exact reviewed
  grants and deny `PUBLIC`, `anon`, and `service_role`.
- After each committed file, the distinct named-human independent verifier
  records the one new ledger row, unchanged session identity, and object
  ownership/ACL delta for objects created or replaced by that file, plus the
  stage-appropriate flag state. After `026`, record the full
  owner/ACL/RLS inventory and prove exact `PUBLIC`/`anon` denial plus reviewed
  `authenticated`/`service_role` grants. The exact formatter postcondition is
  owner plus `authenticated` direct `EXECUTE`, no grant option, `SECURITY
  INVOKER`, empty search path, and effective denial for `PUBLIC`, `anon`, and
  `service_role`.
- SQL Editor or direct `psql` is not automatically acceptable because it may
  bypass migration-ledger recording. No executor path has been selected by this
  package. `db push`, `db pull`, and linked diff remain prohibited from this
  worktree.
- An error before a file's `COMMIT` rolls back that file only. Previously
  committed files remain applied. Stop immediately, preserve the last verified
  flag-stage state without writing any flag, record the exact last successful
  ledger row, and do not run reverse SQL.
- A post-commit defect uses a separately reviewed forward migration. Destructive
  restore is an incident decision requiring exact Owner approval; it is not the
  default migration rollback.

The tooling facts, stop conditions, and rollback procedure are frozen. The
named-human executor, distinct named-human independent verifier, exact
execution path/account/client timeout, approved
`session_user`/`current_user`/object-owner role, after-each-file verification
record, and maintenance window remain HOLD.

#### 4.1.1 Operational catalog-authority approval binding

The runner-required `catalogAuthorityFingerprintSha256` is a **new operational
fingerprint**, not a recomputation or reuse of the historical
`sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`,
because the historical canonical SQL was not committed. Its complete formula
is frozen in
[CLI Execution Runbook #41](./41-phase4-p12-cli-execution-runbook.md) and the
reviewed runner; do not substitute another query or the historical value.

Derive the value only through a separately authorized read-only query. The
allowed source is either the encrypted Production readiness snapshot's
isolated restore or fresh in-window Production/restore evidence. Record the
exact bare lowercase 64-hex value and exact query/evidence source here and in
Checklist #40, then bind that same value as
`catalogAuthorityFingerprintSha256` in the external Production approval.

| Binding field | Current record |
|---|---|
| `catalogAuthorityFingerprintSha256` | **UNCOMPUTED — HOLD** |
| Authorized query/evidence source | **UNRECORDED — HOLD** |
| External Production approval binding | **UNBOUND — HOLD** |

These placeholders are deliberately invalid approval values. Until all three
rows are replaced by reviewed evidence with exact equality, even a mechanically
`productionEligible=true` source kit must not be used in Production and P-12
must not be requested.

#### 4.1.2 Source/tooling, two-pass, and GO-head binding

The reviewed CLI candidate uses two operational binding HEADs to avoid circular
approval. Intermediate reviewed authority-only ancestry may exist before the
source/tooling binding, but it may not change frozen migration, application,
bootstrap, generator, or runner content:

1. retain P-44/P-45/P-46 as historical evidence. P-45 completed at
   `d92d8ced42fc882481ebc2c4579adcf1edbebea7`; P-46 was consumed once and
   stopped fail-closed after the chain completed through `025`;
2. P-47 migration/architecture/security/source review and static checks for
   `026` have passed. Separately authorize and create a replacement clean
   pushed/upstream-equal **source/tooling HEAD** with truthful exact-head
   Remote CI/status. It must exclude the P-12 GO marker, PR, and protected
   untracked paths;
3. receive fresh explicit Owner authorization for one
   `npm run db:local:bootstrap` at that replacement HEAD. It invokes
   `supabase db reset --local --no-seed`, destroys and rebuilds all Local
   Supabase data, applies `009`-`015`, `016`, `017`, `017a`, `018`-`026`, and
   then runs consolidated smoke/security/business invariants. Production is
   untouched. On any failure or drift, preserve secret-free immutable external
   evidence and stop; do not retry, patch Local, or reset again without fresh
   Owner approval;
4. under a later separate Owner decision recorded by a committed/pushed
   Checklist-#40-only **PRE-GO authority checkpoint** with no GO marker,
   generate one `productionEligible=true` external kit from a clean dedicated
   execution checkout pinned to the replacement source/tooling HEAD and record its
   canonical manifest path/SHA-256 plus generator/runner source hashes;
5. run the executable pass-1 `calibrate-schema` chain one stage per invocation,
   freeze a distinct named-human-reviewed `0600` schema contract with the
   structured authenticated GitHub review envelope below, then run a second
   fresh full isolated rehearsal and final closeout with the same source HEAD,
   kit, and contract;
6. bind the pass-2 final closeout manifest canonical path/SHA-256 and capture a
   fresh Production advisor baseline for step `017`; and
7. complete every remaining PRE-P-12 input and receive explicit Owner P-12 GO;
   only then, under separate Git authorization, commit/push the exact Owner
   marker by changing Checklist #40 alone. That descendant commit is the **GO
   HEAD** and the external approval binds it.

Production reuses the source kit; it must not regenerate a kit at the GO HEAD.
The runner requires the source HEAD to be an ancestor of the GO HEAD, the net
changed path between them to be exactly Checklist #40, and the
generator/runner/migration hashes to match at both commits.

At this checkpoint P-45/P-46 are historical and the P-46 evidence is
preserved. P-47 repository-only work is authorized; its exact candidate chain
captures `016` and applies/captures `017`, `017a`, and `018`-`026`. The runner
requires predecessor sign-off and schema/default/object-ACL contract at every
stage. The replacement source/tooling SHA/Remote record and fresh corrected
Local evidence are not yet recorded; no kit, pass-1 completion, authenticated
contract review, pass-2 manifest, GO HEAD, or Production approval is claimed.
After the replacement source/tooling freeze, no tracked path other than
Checklist #40 may change before Production. Future
bounded kit/pass decisions must each be explicitly Owner-approved, then
recorded before action through a separately authorized, clean,
pushed/upstream-equal Checklist-#40-only PRE-GO authority checkpoint with no GO
marker. The authorized action runs from a clean dedicated execution checkout
pinned to the unchanged replacement source/tooling HEAD. Such authority commits do not
become a new source/tooling HEAD; the runner later checks the **net changed path**
from that replacement HEAD to the final GO HEAD, so any number of reviewed Checklist-only
authority commits still yields exactly Checklist #40. Remote and Local results
remain secret-free immutable external evidence bound to the exact source HEAD.
This mechanism creates a lawful later decision path; it authorizes no kit or
pass now.

#### 4.1.3 Independent human-review trust boundary

The schema-shape contract uses version 3 and replaces free-form
`reviewedBy`/`reviewReference`/`reviewedAt` claims with one exact-key
`githubReview` envelope. It binds repository `cloudstellar/conduit-boq`, PR
number, decimal review ID, canonical immutable review URL, authenticated
reviewer login/type, `APPROVED` state, exact source/tooling commit, submitted
time, reviewed-payload SHA-256, and this exact one-line marker:

```text
P12_SCHEMA_REVIEW_V1 source=<40hex> kit=<64hex> pass1=<64hex> payload=<64hex>
```

The runner remains offline. It validates canonical URL grammar, local
hash/identity/chronology equality, and the marker; it does not query GitHub,
verify a GitHub signature, or prove account control. Before contract freeze and
again immediately before the GO decision, the Owner or distinct verifier must
open that exact URL in an authenticated GitHub session/API and confirm the
named human, `APPROVED` state, reviewed commit, unchanged PR head, exact marker,
latest review for that HEAD, and absence of a later dismissal or
changes-requested review. Record the second check time as
`githubReviewCheckedAt` in external approval v3.
Any missing/unavailable/mismatched/superseded review is a stop before GO-marker
creation, Keychain access, or Production connection.

Accepted residuals under the honest-but-fallible model are account compromise,
collusion or deliberate local fabrication, and review deletion/dismissal after
the last required check. SHA-256 proves subsequent integrity, not GitHub
origin. This scope deliberately avoids custom signing/PKI and its key
custody/rotation debt. If deliberate-operator resistance or non-repudiation
enters the threat model, stop and require signed attestations with independent
key custody before Production.

### 4.2 Disposable finding and selected bridge candidate

On 2026-07-28 a rehearsal-only CLI evidence kit assembled from the dirty
working tree targeted a disposable, loopback-only, network-isolated
PostgreSQL 17 database. It used Supabase CLI `2.107.0`, applied `017`, and
recorded only `20260728001700_master_catalog_phase4_foundation` after the
approved `009`-`016` baseline. The mandatory postflight then hard-stopped with
`Private-schema function default ACL is missing`; `018`-`025` were not
applied. The ledger entry exists only in that disposable database. Local
Supabase and Production were neither migrated nor written.

The reviewed `017` statement uses schema-scoped
`ALTER DEFAULT PRIVILEGES ... IN SCHEMA private ... REVOKE EXECUTE ... FROM
PUBLIC`. [PostgreSQL 17 documents](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)
that a per-schema default can add to, but cannot revoke from, the global
built-in default `PUBLIC EXECUTE` on functions; that form is a no-op unless it
undoes a matching per-schema grant. The observed absent default-ACL row is
therefore a material contract finding, not permission to weaken the verifier.
The impact, options, and Owner-selected Option B forward-migration path are
recorded in
[Private-Function Default-Privilege Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md).

Option B is a separately reviewed bridge migration ordered immediately after
`017` and before `018`; a correction after `025` cannot substitute for it.
Migration `018` creates twelve private `SECURITY DEFINER` helpers without
explicit per-function revokes and grants `authenticated` `USAGE` on schema
`private`; without the effective global default denial, those helpers inherit
`PUBLIC EXECUTE`. Production has not received `017`, and Production Data API
does not expose `private`, so this finding introduced no Production exposure;
the reviewed ACL/defense-in-depth contract still fails on the historical
sequence. The baseline also carries a schema-specific `service_role` function
default in `public`; the selected bridge removes that inherited privilege at
global, `public`, and `private` scopes and reasserts only the intended public
stub grants.

| Bridge authority field | Current status |
|---|---|
| Filename | `017a_master_catalog_phase4_global_function_default_privileges.sql` |
| Ledger version/name | `20260728001730_master_catalog_phase4_global_function_default_privileges` |
| SHA-256 | `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7` |
| Exact placement | after `017`; before `018` |
| Authorization | Owner-selected repository candidate only; **not Production-approved** |

A candidate-only SQL contract proof then ran the exact source hash above in
disposable containers based on PostgreSQL 17.10 and the frozen Supabase image
`public.ecr.aws/supabase/postgres:17.6.1.063`/PostgreSQL 17.6. Each container
used `--network none`, no host port, a read-only root filesystem, tmpfs data,
and `--rm`; neither Local nor Production was contacted. The positive fixture
reproduced the known post-`017` schema-specific `service_role` inheritance,
applied `017a`, verified exact global owner-only and schema
owner-only-or-absent defaults, verified the four authenticated-only stubs, and
proved that a newly created private `SECURITY DEFINER` function denied
`PUBLIC`, `anon`, `authenticated`, and `service_role`. The negative fixture
inserted one pre-existing private routine, received the exact zero-private-
routine preflight failure, and proved that the rejected transaction left the
global default absent and the transient state unchanged.

This is bounded SQL-mechanism/fail-closed evidence, not the required clean CLI
pass 1 in exact `017` → `017a` → `018` → … → `026` order, independent
schema-contract review, pass 2, ledger evidence, or exact-path acceptance.

Migration `026` is not this bridge. It is the distinct per-object P-46
callability correction recorded in
[Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md).
Do not edit reviewed migration `017`, `017a`, `018`, or `025`; continue the
historical disposable sequence; apply the bridge late; or claim exact-chain
acceptance. P-47 review/static closure has passed; after the separate
Git/Remote and freshly authorized Local gates, run the complete chain from a
fresh disposable PostgreSQL 17 target. Earlier evidence remains
diagnostic/historical only and authorizes no Local or Production action.

### 4.3 P-46 callability finding and P-47 forward fix

The one P-46 bootstrap at `d92d8ce` completed the canonical sequence through
`025`; WP-6.5 then failed closed with `permission denied for function
catalog_action_error`. The retained Local evidence draft was deliberately not
cleaned after the stop. External evidence package
`p46-local-bootstrap-20260729T121635Z-d92d8ce` passed its complete
`SHA256SUMS`; diagnosis SHA-256 is
`12d9bb1241ec7680bd00c9d2c3b41c22fd47c0180c1a9559f5cd93ec3a1027f8`
and package-status SHA-256 is
`2a1ede2fff6b01ac951bf3f0d62d03431fe88cb26c7674d087ef08f89098d0c5`.

| Forward-fix authority field | Current status |
|---|---|
| Filename | `026_master_catalog_phase4_catalog_action_error_acl.sql` |
| Ledger version/name | `20260729002600_master_catalog_phase4_catalog_action_error_acl` |
| SHA-256 | `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a` |
| Exact placement | after immutable `025` |
| Data/default privileges | unchanged |
| Helper posture | body/owner/signature/empty search path unchanged; `SECURITY INVOKER`; direct `EXECUTE` owner plus `authenticated`; no grant option; `PUBLIC`/`anon`/`service_role` denied |
| Authorization/result | P-47 repository implementation/static review passed; **not Git-, Local-, or Production-approved** |

## 5. Fresh Local read-only baseline

Read-only SQL was run on 2026-07-25 without a reset, migration, or data write.
After the 2026-07-27 Docker restart, a bounded read-only recheck repeated the
pointer/row/draft/flag/BOQ/Factor F values below without a reset or write.

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
window verified the actual exposed-schema configuration in section 7.3:
`private` is not exposed. Any later drift that exposes `private` blocks P-12
until it is removed and retested.

Standard `supabase db lint` repeats two known findings:

1. `private.place_catalog_items_impl` references a function-created
   `pg_temp.catalog_placement_input` table that the generic static analyzer
   cannot see. The transaction-scoped temp-aware `plpgsql_check` and runtime
   rollback/race/replay suites found no defect.
2. `private.catalog_placement_state.v_row_count` is assigned but never read.
   This has no runtime effect.

Owner disposition recorded 2026-07-28: keep the second item as documented
managed debt until
the next substantive replacement of `catalog_placement_state`. Adding a large
`CREATE OR REPLACE FUNCTION` migration only to remove one dead local variable
has higher review and regression cost than the warning. Do not modify accepted
migration `021`, and do not add migration `026` solely to silence this lint.
This historical lint disposition authorizes no other migration and reserves no
migration name. Neither disposition authorizes P-12 or a migration change.

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

The Production Data API exposed-schema setting is **proven Ready**. At
2026-07-26 19:29 +07, an Owner-authorized Management API `GET` for project
`otlssvssvgkohqwuuiir` returned:

- exposed schemas: `public`, `graphql_public`;
- `private` exposed: `false`;
- extra search path: `public`, `extensions`;
- maximum rows: `1000`.

Supabase CLI `2.107.0` read its existing access token from macOS Keychain in
memory. The evidence command emitted only the non-secret fields above; it did
not print or persist the access token or the response `jwt_secret`. No setting
was changed. This supersedes the earlier inconclusive publishable-key probe.

### 7.4 Advisor disposition

The fresh Production security advisor returned eight warnings:

- seven `authenticated`-callable `SECURITY DEFINER` functions; and
- Supabase Auth leaked-password protection is disabled.

The Owner's 2026-07-28 disposition accepts these seven guarded definers for the
P-12-through-P-15 release sequence. All seven deny `anon`; mutating admin/BOQ
facades retain active-role, ownership, or target checks; `get_my_profile` is
self-scoped; and `private` remains unexposed. Do not alter them in this
sequence. A fresh post-migration advisor/function-body/ACL diff is mandatory,
and any new or untriaged finding stops execution. Review and minimize
`get_user_role(uuid)` and `is_admin(uuid)` after Phase 4 with new
regression/RLS evidence before replacement.

Leaked-password protection is a genuine global Auth hardening opportunity, not
a Phase 4 database migration defect. The Owner accepts its disabled state for
P-12 and P-13 only under the current Free plan. P-14 remains blocked until the
Owner separately approves a plan/upgrade and enablement, or explicitly accepts
the P-14/P-15 residual after reviewing available compensating controls. This
decision authorizes no Auth change, purchase, P-13, or P-14 action.

The performance advisor returned pre-Phase-4 baseline findings: 8 unindexed-FK
information rows, 19 RLS init-plan warnings, 16 unused-index information rows,
and 5 multiple-permissive-policy warnings. Phase 4 objects are absent, so none
was introduced by `017`-`025`. Do not add or remove indexes speculatively.
Capture a fresh post-migration diff and stop if Phase 4 adds an unreviewed
finding.

### 7.5 Backup and restore disposition

The Owner authorized the low-cost application-only logical path on 2026-07-26.
Tooling preparation first passed without Production access:

- Docker client/server `29.5.3`;
- exact Supabase PostgreSQL image
  `public.ecr.aws/supabase/postgres:17.6.1.063` at server `17.6`, matching the
  Production engine/release line;
- macOS AES-256 encrypted APFS sparse-bundle detach/remount round trip;
- an integrated custom-format dump/restore and source/restored row-hash
comparison using three synthetic rows; and
- a second application-data rehearsal using Local read-only source schemas
  `public, private`, with only `public.price_list_audit_logs` table data
  excluded. Restore into the exact Supabase image reproduced the critical Local
  counts, including
  7,107 `price_list` rows, 10 versions, one default pointer, 198 BOQs, 1,547
  BOQ items, two Factor F versions, and 73 Factor F rows. The complete
  `price_list` row hash matched at
  `sha256:5bd6c22224cd3f255e30ccd9ca1d54cf6ba5c2fa75cdaedf9a1eb25970d28d0f`.

The synthetic and Local rehearsals deleted their temporary containers and dump
files. They proved the local toolchain and application-only restore contract
before any Production credential was accepted.

The approved off-repository container is prepared at
`/Users/cloud/Backups/ConduitBOQ/production/phase4/pre-p12/pre-p12-rehearsal.sparsebundle`.
It is an 8 GiB logical sparse bundle, reports `encrypted: YES`, is restricted
to the local user, and has a randomly generated passphrase held in the macOS
login Keychain under service `Conduit BOQ Phase4 Backup`, account
`otlssvssvgkohqwuuiir-pre-p12`. A separate end-to-end check retrieved the
passphrase from Keychain and reopened the detached bundle without displaying
the secret.

The first empty sparse bundle prepared earlier in the session reported
encryption but had no retrievable Keychain item. The recovery check therefore
rejected it. At 2026-07-26 21:25 +07, before any Production data existed, it
was replaced with the current bundle; the replacement passed create,
encryption, detach/remount, Keychain store/readback, and a separate
Keychain-to-bundle reopen. The unrecoverable and temporary replacement bundles
were removed.

At 2026-07-26 21:47 and 22:04 +07, the Owner supplied two candidate database
passwords one at a time through the native secure prompt. PostgreSQL rejected
both before a successful query or dump. Each rejected Keychain item and
temporary `.pgpass` was deleted immediately.

Immediately before the 22:48 +07 capture, a third Owner-entered candidate
passed the same authentication/read-only identity query through the proven
Session endpoint, returning database `postgres`, user `postgres`, and server
`17.6`. The valid credential is retained only in the macOS login Keychain under
service `Conduit BOQ Production DB`, account `otlssvssvgkohqwuuiir`. No
candidate value was shown in chat, command arguments, shell history, Git,
backup metadata, or evidence files. A controlled project-password reset was
not used and is not authorized by this package.

The authorized Production readiness backup then completed with no Production
write:

- captured at `2026-07-26T15:48:22Z` (`22:48:22 +07`);
- PostgreSQL custom-format, gzip level 9, `pg_dump` 17.6, no owner or ACL
  replay, serializable-deferrable read posture, and a 10-second lock wait;
- included schemas `public, private`;
- retained the `public.price_list_audit_logs` table definition but excluded its
  data; and
- did not dump `auth` or `storage` data.

The package is stored inside the encrypted sparse bundle under
`pre-p12-readiness-20260726T154815Z/`. The dump is 352,642 bytes with SHA-256
`9d306a478b8ada65d0a32ab31bca19587c55efa3ae979ae4dd8ad5871d575932`.
Read-only metrics immediately before and after the dump were identical. This
later live capture contains 234 BOQs and 2,270 BOQ items, up from the morning
232/2,183 baseline, plus 710 price-list rows, one catalog version, two Factor F
versions, and 73 Factor F rows. The growth is normal live Production activity,
not schema or authority drift.

The dump was restored into an ephemeral container using the exact image
`public.ecr.aws/supabase/postgres:17.6.1.063`. The container had
`--network none`, no host port, and was deleted after the check. Restore ran in
`pre-data`, `data`, and `post-data` phases. Because Auth data is deliberately
out of scope while application tables retain foreign keys to `auth.users`, the
isolated target received 20 UUID-only ephemeral user stubs before post-data
constraints were created. Those stubs contained zero email, password, app
metadata, or user metadata values and disappeared with the container.

All comparable business counts and row hashes matched the read-only source
metrics; the diff file is empty. The restore also reported zero invalid
constraints, disabled user triggers, missing catalog-version links,
cross-version BOQ-item links, partial Factor F snapshots, invalid default
pointers, and audit-log rows. Earlier isolated attempts failed closed and
identified readiness timing, the target's default `public` schema, the
intentional Auth dependency, and an image-version-specific Auth column
assumption. The final phased restore corrected those tooling assumptions
without weakening or skipping a constraint. No failed attempt contacted
Production.

A point-in-time `pg_stat_activity` inventory showed only standard Supabase
services such as PostgREST, Storage, cron, `pg_net`, and monitoring; no obvious
external direct client was connected at that instant. This does not prove that
an intermittent ETL, BI tool, desktop client, or scheduled script does not use
the password.

The readiness backup/restore row is now **Ready**. It is not the final rollback
source because Production remains live. A fresh backup with the same gates is
still mandatory immediately before migration inside the separately approved
P-12 window. After `017`, `017a`, and `018`-`026` and the immediate ledger,
identity, ownership, ACL, RLS, advisor, BOQ, Factor F, and disabled-flag
verification pass, create and checksum the post-migration application-only
backup and manifest while all Phase 4 flags remain disabled. That checkpoint
is a hard prerequisite to requesting P-13, but it does not itself authorize
P-13. After separately approved P-15 publication verification, complete the
final post-publication backup, encrypted external copy, checksum, and custody
record.

On 2026-07-27 the Owner explicitly authorized a temporary Docker stop only for
the post-write custody check. Fresh mount and `lsof` inspection found the
Docker virtualization process holding read handles. Docker Desktop was quit
gracefully; after handle count reached zero, the encrypted image was detached
without `-force`, reopened at a newly created mount point as read-only using
the Keychain-held passphrase through standard input, and reported
`image-encrypted: TRUE` and `writeable: false`.

`shasum -a 256 -c SHA256SUMS` then passed all eight package entries:
`production-app.dump`, `RECOVERY_MANIFEST.txt`, `RESTORE_STATUS`, `STATUS`,
`source-before.metrics`, `source-after.metrics`, `restored.metrics`, and
`restored.integrity`. No handle remained. The image was detached again without
force and is now unmounted. Docker Desktop and the seven Local Supabase
containers were restarted; all returned healthy/up. A read-only Local
invariant check repeated `2568.0.0`/710, zero drafts, all three flags false,
BOQ 198/1,547 with zero unversioned BOQs, and Factor F `2569.0.0`/36. No Local
reset or data write occurred.

The sparse bundle remains on the same physical computer as the working copy.
It remains readiness-rehearsal evidence and is not the final rollback source.
The Owner's 2026-07-27 decision permits encrypted same-device custody for the
fresh P-12 rollback source and subsequent P-12-through-P-15 snapshots only
during that bounded sequence. It does not waive fresh capture,
restore/checksum, manifest, or sign-off. The same-device acceptance expires at
the earlier of (a) the start of the post-publication checkpoint after
separately approved P-15 verification or (b) seven days (168 hours) after the
recorded P-12 execution start timestamp. If a planned pause will exceed 24
consecutive hours, create and checksum-verify an encrypted independent copy of
the latest verified rollback package before the pause. If an unplanned pause
reaches 24 hours, stop before any further gate and complete that copy before
resuming. An early copy does not waive the final post-publication
backup/copy/checksum/custody gate. If the copy cannot be completed, rollout
remains stopped; there is no automatic extension.

Future whole-service disaster recovery is a separate, non-blocking workstream.
The current application-only backup is not Auth recovery and does not contain
Storage object bytes. After P-15 closeout, or separately if rollout is
abandoned, use
[Post-Phase-4 DR Backlog #42](./42-phase4-post-phase4-disaster-recovery-backlog.md)
to decide RPO/RTO, recurring encrypted off-device database backup and restore
drills, Auth/session recovery, Storage inventory/object backup, configuration
recreation, and accountable roles. That backlog authorizes no current access
or configuration change and is not a P-12 blocker.

The non-secret connection target is already proven:

- host `aws-1-ap-south-1.pooler.supabase.com`;
- port `5432` for Supavisor Session mode;
- user `postgres.otlssvssvgkohqwuuiir`;
- database `postgres`; and
- TLS required.

The Owner-authorized Management API read returned the same primary host and
transaction endpoint `6543`; frozen Supabase CLI `2.107.0` maps that primary
pooler host to port `5432` for Session mode. A TCP-only check from this machine
to port `5432` passed without authenticating or issuing a database command. The
direct database hostname remains IPv6-only from this machine and has no route.

The accepted paths remain:

1. an encrypted `supabase db dump --db-url ...`/`pg_dump` to an approved
   off-repository secure location, followed by restore into isolated
   PostgreSQL 17; or
2. an approved platform backup/clone into a separately cost-confirmed
   non-Production project.

For the logical path, freeze Supabase CLI `2.107.0`; dump only application
schemas `public, private`; retain the `public.price_list_audit_logs` table
definition but exclude its data; and do not dump `auth` or `storage` data.
Record the manifest/counts/hashes and run the Production Runbook section 8
integrity checks. No verified restore means no P-12.

## 8. Readiness matrix

| Gate | Evidence | Status |
|---|---|---|
| WP-8/P-37 | Owner-accepted with guided-UAT variance; evidence remains truthfully labelled | Ready |
| Exact application source | Baseline `6827ebc1a729b7675fe91db58e129c9381b33ddb`; bounded general-user version-transparency candidate `5068f944af2aa3fe8446c77c8ae8d48673cb260b`; exact pushed readiness/documentation head `07d1d3399cea363a2ff923c6393d4a3259ce623c` | Ready |
| Remote exact-head status | Historical pushed readiness head `07d1d33` and P-44 immutable executable-content ancestor `ed94c03` each report `Vercel=success`; PR-triggered GitHub Actions runs are absent and are not claimed. P-45 completed at pushed/upstream-equal `d92d8ced42fc882481ebc2c4579adcf1edbebea7`, but P-46 exposed a new defect. P-48 authorizes the exact P-47 replacement source/tooling commit/push; its new truthful Remote CI/status and upstream-equality record remain required before any fresh Local bootstrap or kit. | Historical records Ready; P-48 publication authorized, replacement HEAD/Remote result HOLD |
| Migration source manifest | Exact eleven-file candidate `017`, `017a`, `018`-`025`, and append-only `026` filenames and hashes above; all reviewed earlier hashes remain unchanged. P-47 repository/static review passed; P-48 authorizes exact Git publication, but the resulting replacement source/tooling HEAD is not yet recorded. | Repository/static Ready — P-48 publication result and fresh Local gates HOLD |
| Local clean-chain authority | Historical clean evidence through `025` remains useful but is not proof of the corrected chain. P-46 was consumed once at `d92d8ce`: canonical bootstrap reached `025`, then WP-6.5 failed closed on `private.catalog_action_error(...)` callability and left one evidence draft. Preserve that state/evidence; no cleanup, retry, patch, or reset is authorized. A future corrected order is `017`, `017a`, `018`-`025`, then `026`, and requires a fresh explicit warning/Owner approval because `npm run db:local:bootstrap` invokes `supabase db reset --local --no-seed` and rebuilds all Local Supabase data. | P-46 consumed/fail-closed — fresh approval and corrected Local evidence HOLD |
| P-20 portability | Repeated 710-row identity/hash evidence and canonical hash match | Ready |
| Idempotency/concurrency | Stable request ID, mismatch rejection, lock conflict, replay, and one-effect recovery passed | Ready |
| BOQ/hotfix regression | Suffix preservation, version links, save/print/export, and Local invariants passed | Ready |
| General-user version visibility | Pointer-derived current version plus immutable BOQ-bound version appear on dashboard/price list/create/edit/print/Excel; invalid bindings fail closed; desktop/mobile smoke and binary Excel proof passed | Ready on exact candidate |
| Factor F isolation | Pointer, rows, hashes, and BOQ snapshot behavior unchanged | Ready |
| Official export | Owner-accepted Excel/PDF pair plus tracked semantic verifier | Ready |
| Feature isolation | Production before `017` has all three Phase 4 flag rows absent; P-46 Local post-`025` has all three rows present and boolean `false`; the exact intermediate stage gate is frozen in section 4.1 and `026` must preserve all three false | Stage contract Ready; fresh corrected post-`026` live proof HOLD |
| Repository lint/build debt | 0 ESLint warnings; Next.js proxy convention applied; production build passed | Ready |
| Local security/RLS | P-46 exposed an authenticated-callability blocker in the guarded create path; [Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md) records it. P-47's append-only `026` candidate narrows the pure formatter to invoker execution and exact owner-plus-`authenticated` ACL while preserving the previously accepted guarded-definer and `v_row_count` dispositions. Independent repository/static review passed. | Repository/static Ready; fresh authorized Local proof HOLD |
| Production migration ledger | Expected `009`-`016` set present; no unexpected later entry; `010a` indexes valid/ready; exact hotfix body matches | Ready |
| Production baseline/schema drift | PostgreSQL 17.6; `2568.0.0`/710; Local/Production authority hash match; BOQ/Factor F/RLS/triggers clean; Phase 4 and all three Phase 4 flag rows absent as expected before `017` | Ready for database scope |
| Production Data API schemas | Management API shows `public, graphql_public`; `private` is not exposed; evidence excluded token and `jwt_secret` | Ready |
| Operational catalog-authority fingerprint | New runner field `catalogAuthorityFingerprintSha256`; derive only under separate read-only authorization from the encrypted readiness snapshot's isolated restore or fresh in-window Production/restore evidence, record the exact value/source here and in #40, and bind it exactly in external Production approval. Historical `ecd457...` is not reusable because its canonical SQL was not committed. | Hold — UNCOMPUTED/UNRECORDED/UNBOUND; no `productionEligible=true` or P-12 request |
| Backup/restore | Third secure credential candidate passed the bounded read-only identity query. Encrypted Production application-only dump `9d306a47...` captured 234 BOQs/2,270 items and passed source-before/after metrics. Exact-image, network-isolated phased restore matched all comparable counts/hashes and passed constraints, triggers, version links, Factor F snapshots, and pointer checks. The post-write non-force detach/read-only reopen/full 8-entry checksum also passed. No Auth/Storage data, Local reset, or Production write. This is readiness-rehearsal evidence, not the final rollback source. | Ready for readiness rehearsal; fresh in-window pre-migration backup remains mandatory, followed by a post-migration backup/manifest after `017`, `017a`, `018`-`026` verification and before P-13 |
| Final rollback-source custody | Owner accepted encrypted same-device custody only for the bounded sequence, expiring at the earlier of the start of the post-publication checkpoint after separately approved P-15 verification or 168 hours after the recorded P-12 start. Copy before a planned pause exceeding 24 consecutive hours; after an unplanned pause reaches 24 hours, stop and copy before resuming. Fresh in-window capture/restore/checksum/sign-off, the post-migration checkpoint before P-13, and the final external copy remain mandatory. | Ready for PRE-P-12 decision content; execution, post-migration, and final external-copy gates remain mandatory |
| Production advisors | Fresh output captured; Owner accepted seven guarded definers for this sequence and leaked-password protection disabled for P-12/P-13 only. Fresh post-migration diff is mandatory; P-14 retains a separate Auth decision. | Ready for PRE-P-12 content; P-14 Auth gate remains HOLD |
| Hash-bound advisor artifacts | The external approval binds a fresh post-pass-2 baseline advisor canonical path/SHA-256/timestamp for step `017` only. Every later invocation must consume a fresh post-previous-step advisor artifact bound by the independent verifier sign-off; final closeout consumes a fresh post-`026` artifact. A boolean attestation or reuse of one approval artifact for all steps is insufficient. | Hold — baseline and rotating per-step artifact paths/SHA-256/timestamps not yet bound |
| Exact schema-shape contract | The CLI candidate fingerprints `public`/`private` columns/types/defaults/nullability/identity/generated/collation, constraints, and index definitions plus valid/ready/live state for every stage, including `017a` and `026`. Pass 1 is executable only through isolated `calibrate-schema` and recursively binds the source/tooling HEAD, exact kit/tool/migration hashes, capture executor, raw captures, and prior evidence. Contract v3 includes the new final stage/migration identity and binds a structured immutable GitHub PR-review envelope and reviewed-payload marker; helper ACL/security remains a separate runner postflight/live-closeout and verifier-signoff gate. An authenticated human must verify the GitHub review before freeze and again before GO. The offline runner checks structure/hash/chronology but does not authenticate GitHub. A second fresh full isolated rehearsal must finish a transitive final-closeout chain bound in approval with `schemaShapeContractSha256`. | HOLD — corrected Local gate, pass 1, authenticated review, contract, and pass 2 are uncreated/unrun/unbound |
| Migration execution freeze | CLI/PostgreSQL versions, eleven candidate hashes, per-file transactions/timeouts, stop conditions, and fix-forward rollback are recorded in section 4.1 | Paper/static freeze Ready; exact-path acceptance awaits replacement HEAD and corrected rehearsal |
| Disposable PostgreSQL 17 CLI rehearsal | Historical rehearsal-only dirty-tree kit applied `017` and correctly hard-stopped before `018`; later bounded bridge proofs passed. P-46 then applied the canonical Local chain through `025` and failed closed on helper callability. Append-only `026` has not been run on Local, disposable, or Production. See [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md) and [Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md). | HOLD — replacement source freeze, fresh authorized Local proof, pass 1, independent contract review, and pass 2 |
| Source/tooling and GO authority sync | P-44/P-45 and source/tooling HEAD `d92d8ce` are historical after the P-46 defect. P-47 repository/static review passed. P-48 authorizes one exact replacement clean source/tooling commit/push; record its upstream equality and truthful Remote CI/status. A fresh separately authorized Local bootstrap must then pass before any separately authorized kit/pass work. Only after all later gates and separate P-12 GO may a Checklist-#40-only descendant GO commit be authorized. | P-48 Git publication authorized; replacement result and fresh Local gates HOLD; later kit/pass/GO remain separate |
| Post-CLI evidence durability | The runner attempts the bounded read-only after-state before any post-CLI evidence-file write while the approved window has the full frozen postflight budget, and writes a captured after-state first even if the window expires afterward. It verifies each manifest at a protected pending path and makes atomic rename the last fallible publication operation. A missing complete `05-evidence-manifest.json` is uncertain and blocks every later file. Sudden evidence-medium failure remains an unavoidable storage residual; if the postflight budget is already gone, no new Production query starts without separately authorized forensic reconciliation. | Hold - exact evidence roots, permissions/free-space/media check, and controlled reconciliation handoff remain part of executor/path acceptance |
| Migration executor record | Exact path/account/client timeout/ledger behavior, named-human executor, distinct named-human independent verifier, approved `session_user`/`current_user`/object-owner role, after-each-file ownership/ACL checks, and window | Hold - executor/path/owner/window proposal pending |
| P-12 Owner go/no-go | Exact Production window approval | Hold - not requested |

Overall result: **HOLD**. The managed-residual and custody decisions are
recorded. P-46 evidence is preserved and P-47 repository/static review has
passed, while named-human executor/distinct
named-human verifier/path/object-owner/window evidence and the separate P-12
decision remain open. The Owner has selected the no-tech-debt Option B bridge
candidate after `017` and before `018`; append-only `026` separately corrects
the P-46 helper-callability defect after immutable `025`. Replacement
source/tooling HEAD/Remote and fresh Local evidence, later separately
authorized kit/pass 1/authenticated GitHub contract/pass 2, and exact
hash-bound advisor artifacts remain open.
It is not ready to execute the Production migration.

## 9. Next bounded approval

The safest next action is still not P-12 itself. P-47 independent
source/architecture/security review and repository/static checks have passed.
P-48 now authorizes the exact 25-file Git-only publication of the replacement
source/tooling candidate. The Owner's
[Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
decision is Option B for the `017a` bridge only; it does not replace the
separately reviewed post-`025` `026` correction. P-44/P-45 are historical and
P-46 was consumed. Execute P-48 exactly, then record truthful Remote CI/status
and upstream equality for that exact HEAD and stop. Do not edit `017`,
`017a`, `018`-`025`, or patch the current Local database. Obtain a fresh
explicit warning/Owner approval before one corrected canonical Local bootstrap
through `026` plus consolidated invariants. If it fails or drifts, preserve
external evidence and stop without retry, patch, cleanup, or second reset absent
fresh approval. Only after it passes and under later separate
authorization may one evidence kit be built and the
executable pass-1 chain, structured authenticated GitHub contract freeze,
second fresh rehearsal, rotating advisor hand-offs, and transitive final
closeout on a fresh disposable PostgreSQL 17 target. The
Production database/ledger/advisor read-only portion is complete and should not
be repeated unless it becomes stale. Then use
[Owner Decision Checklist #40](./40-phase4-p12-owner-decision-checklist.md)
to request a narrowly scoped decision covering the proposed named-human
executor, distinct named-human independent verifier, exact execution
path/account, client timeout/ledger behavior, approved
`session_user`/`current_user`/object-owner role, after-each-file ownership/ACL
verification, and maintenance window. Independent review/static checks and
P-46 evidence is preserved and P-47 authorization is bounded as above. The
replacement reviewed source/tooling HEAD/Remote and fresh separately authorized
Local evidence must be recorded before kit/pass work. After those PRE-P-12
gates pass, the later
Checklist-#40-only GO commit/push and exact GO HEAD remain a separate gate.

That approval must explicitly state that no further Production access or write,
including DDL/DML, feature flag, deploy, publication, Factor F mutation, or
hotfix change is authorized.

After the remaining evidence is attached to this package:

1. classify every row Ready, Hold, or Blocked;
2. execute the exact P-48 Git publication, then record the replacement clean
   pushed source/tooling HEAD plus truthful Remote status/upstream equality;
3. receive fresh explicit reset approval, pass canonical Local bootstrap and
   consolidated invariants through `026`, then complete pass 1, authenticated
   GitHub human review, pass 2, and closeout; stop without retry/reset/patch on
   failure or drift;
4. record the proposed named-human executor, distinct named-human verifier,
   session/object-owner identity, timeout values, exact hashes, and maintenance
   window;
5. verify the exact pushed source/tooling HEAD and later Checklist-#40-only GO
   HEAD, with the same hash-bound kit at both stages;
6. request P-12 only if every blocking row is Ready; and
7. keep P-13, P-14, and P-15 separate.

## 10. Stop conditions

Stop without migration if any of the following occurs:

- Production does not point to `2568.0.0` with the expected 710-row authority;
- hotfix `016` is missing or the remote ledger contains unexplained drift;
- the required fresh in-window backup, isolated-restore/checksum proof,
  time-bounded custody record, or required sign-off is missing or fails;
- PostgreSQL/Data API configuration differs materially from the reviewed Local
  contract;
- an advisor finding is new, untriaged, or affects Phase 4;
- migration hashes differ from this manifest;
- `catalogAuthorityFingerprintSha256`, its authorized query/evidence source, or
  its external Production approval binding remains uncomputed/unrecorded/
  unbound, is unreviewed, or differs from the live runner readback;
- [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
  lacks the recorded Option B disposition and independently reviewed selected
  remediation/security contract, or the corrected complete chain has not
  passed the required fresh two-pass disposable PostgreSQL 17 rehearsal;
- the bridge filename, ledger version/name, or SHA-256 differs from section 4,
  the future external approval does not bind those exact fields, or the
  selected sequence places it anywhere other than after `017` and before
  `018`;
- [Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md)
  is unresolved, migration `026` identity/hash differs from section 4.3, its
  pre/postconditions do not preserve the reviewed helper body/owner/signature/
  empty search path and exact owner-plus-authenticated invoker ACL, or the
  replacement clean Local/two-pass evidence is missing;
- BOQ or Factor F before-state differs from the approved baseline;
- the live flag state does not match its migration stage: all three rows absent
  before `017`; admin-only and boolean `false` after `017`, `017a`, `018`, and
  `019`; all three present and boolean `false` after `020`-`026`; or any Phase
  4 flag is boolean `true`;
- `session_user`, `current_user`, or object-owner identity is missing, changes,
  or differs from the approved role, or the ownership/ACL delta cannot be
  independently verified;
- the named-human executor, distinct named-human independent verifier, exact
  path/account, client timeout, one-row-per-file ledger behavior,
  after-each-file checks, or maintenance window is not fixed; or
- the Owner has not approved the exact P-12 window.
