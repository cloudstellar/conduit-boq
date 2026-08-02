# Phase 4 P-12 Exact CLI Execution Runbook

**Prepared:** 2026-07-28

**Status:** P-47 REPOSITORY/STATIC READY; P-48 exact Git-only publication
authorized - replacement result/Local/Production gates HOLD; P-12 not requested

This runbook defines the exact command-line and evidence contract for a future
Owner-approved P-12 execution. It does not approve P-12, Production access,
deployment, feature enablement, publication, Factor F mutation, hotfix work, or
any migration outside the separately approved scope.

The 2026-07-28 isolated PostgreSQL 17 rehearsal applied `017` and then stopped
before `018`. The stop exposed the security defect described in section 11.
The Owner selected Option B for repository-only correction. The exact `017a`
candidate is inserted between `017` and `018`. P-45 later completed at
pushed/upstream-equal `d92d8ced42fc882481ebc2c4579adcf1edbebea7`.
The one P-46 Local authorization was consumed: bootstrap completed through
`025`, then WP-6.5 stopped fail-closed because the authenticated public invoker
could not execute owner-only `private.catalog_action_error(...)`. P-47
authorizes only repository implementation/static review of append-only `026`
and required tooling/test/authority alignment. It does not authorize Local
cleanup/application/reset/retry, disposable execution, Git writes, or
Production. Kit, pass 1, structured
authenticated GitHub review, pass 2/closeout, and Production remain separately
unauthorized. This document remains an execution-contract candidate only.

## 1. Governing authority

Read this runbook with:

- [Migration authority](../../04_data/MIGRATIONS.md);
- [Production Runbook #12](./12-phase4-production-runbook.md);
- [Database Security Contract #17](./17-phase4-database-security-contract.md);
- [Threat Model #18](./18-phase4-threat-model.md);
- [Decision Register #19](./19-phase4-decision-register.md);
- [Progress Tracker #25](./25-phase4-execution-progress-tracker.md);
- [P-12 Readiness Package #39](./39-phase4-p12-production-readiness-package.md);
- [Owner Decision Checklist #40](./40-phase4-p12-owner-decision-checklist.md);
  and
- [P-46 Callability Finding #44](./44-phase4-p46-catalog-action-error-callability-finding.md).

Conversation text, this runbook, an external JSON file, or a successful
rehearsal is not P-12 approval. The Decision Register, Progress Tracker, and
Owner Checklist must contain the exact committed approval record described
below, and the Owner must approve the exact window separately.

## 2. Frozen execution boundary

| Control | Frozen value |
|---|---|
| Application candidate | `5068f944af2aa3fe8446c77c8ae8d48673cb260b` |
| Supabase CLI | Exact native binary `2.107.0`; do not use the Node launcher as the cancellable child |
| PostgreSQL | Major `17` |
| Client migration timeout | `180` seconds |
| Production database path | Passwordless Session-pooler URL frozen by the runner; no project link |
| Production credential | macOS Keychain service `Conduit BOQ Production DB`, account `otlssvssvgkohqwuuiir` |
| Required database role | `session_user=postgres`, `current_user=postgres`; objects created or replaced by every file must remain owned by `postgres` |
| Migration unit | Exactly one pending migration file and one identifiable ledger row per invocation |
| Automatic continuation | Prohibited |
| Rollback posture | Stop, preserve evidence, classify outcome, and use a separately reviewed forward migration; never automatically reverse committed SQL |

The Production credential must not appear in chat, Git, a file, shell history,
command arguments, logs, evidence, or a connection URL. The runner reads the
existing Keychain item into process memory and supplies it only to the native
CLI through the reviewed libpq environment. It removes inherited database
connection variables first and never writes the credential to evidence.

`db push`, `db pull`, linked diff, SQL Editor, MCP SQL execution, and direct
`psql` are not permitted Production execution paths for this package. The
candidate runner uses unlinked `supabase migration up --db-url ...` against an
external cumulative kit. The cumulative kit is what makes exactly one file
pending at each invocation.

## 3. Exact ledger and migration hashes

Production must already contain exactly the accepted `009`-`016` prefix,
including hotfix `016` at `20260706090832`. Do not rerun any historical file.

| Step | New ledger version and name | Accepted source SHA-256 |
|---|---|---|
| `017` | `20260728001700 master_catalog_phase4_foundation` | `fc3bd3a9e144db7e78fb7d777fad8b3e49bae99717aae07ef27a296bf0cf198c` |
| `017a` | `20260728001730 master_catalog_phase4_global_function_default_privileges` | `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7` |
| `018` | `20260728001800 master_catalog_phase4_draft_mutation` | `d78704bb90d551a29b59f0d0032052fa5f1773b8c07721cf6e8f6e03be044e73` |
| `019` | `20260728001900 master_catalog_phase4_publish_pointer` | `841692aae1b3160c67db160f73bc7042c2d83fe7259e446ef1d1c73928c00bb9` |
| `020` | `20260728002000 master_catalog_phase4_admin_workflow_hardening` | `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93` |
| `021` | `20260728002100 master_catalog_phase4_placement_governance` | `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714` |
| `022` | `20260728002200 master_catalog_phase4_draft_identity_and_release_number` | `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3` |
| `023` | `20260728002300 master_catalog_phase4_published_code_rls_scope` | `cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88` |
| `024` | `20260728002400 master_catalog_phase4_set_based_placement_invalidation` | `d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25` |
| `025` | `20260728002500 master_catalog_phase4_withdraw_order_compaction` | `00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f` |
| `026` | `20260729002600 master_catalog_phase4_catalog_action_error_acl` | `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a` |

Do not change a reviewed migration to correct a defect. Append a forward
migration with separate security/architecture review, a new accepted hash, a
new ledger contract, and a new Owner scope decision.

## 4. Build the external kit at the source/tooling HEAD

Generate the one reusable execution kit only after P-47 migrations, runner,
generator, tests, and authority pass independent review/static checks; the
replacement source/tooling Git publication is separately authorized, clean,
pushed, upstream-equal, and has truthful Remote CI/status recorded; and a fresh explicitly authorized
Local canonical bootstrap plus consolidated invariants passes at that same
HEAD. Historical two-rebuild P-20 evidence remains valid because `017a` and
`026` are data-free ACL-only changes. P-46 failed closed and cannot be reused;
do not clean, retry, patch Local, or reset without fresh approval. After the
replacement source/tooling freeze, do not change any tracked path except
Checklist #40. Future kit/pass authority must be separately Owner-approved and
committed/pushed before action through a Checklist-#40-only PRE-GO authority
checkpoint with no GO marker. Run the authorized action from a clean dedicated
execution checkout pinned to the unchanged replacement source/tooling HEAD.
The final net delta from that HEAD to the GO HEAD must remain exactly Checklist
#40. Keep Remote and Local results external and hash-bound to the exact
source/tooling HEAD. This mechanism is not current kit/pass authorization.
Checklist #40 must not yet contain the committed P-12 GO marker:

```sh
node scripts/prepare-master-catalog-p12-cli-kit.mjs \
  --output <ABSOLUTE_NEW_ENCRYPTED_EXTERNAL_DIRECTORY>
```

The output directory must be absolute, outside the repository, and nonexistent
before the command. The generator:

- verifies native Supabase CLI `2.107.0`;
- rehashes accepted migrations from the repository;
- creates one cumulative work directory per step;
- freezes each expected before/after ledger prefix;
- records exact source HEAD and application candidate;
- records the generator and runner source SHA-256 values;
- makes generated files read-only; and
- sets `productionEligible=false` whenever the tracked worktree is dirty.

`productionEligible=true` proves only that the kit was derived from an exact,
clean source/tooling commit. It does not approve P-12 or Production access.
Use this exact kit for pass 1, pass 2, and the later Production sequence. Do
not regenerate it after the GO-marker commit.

After pass 1, independent contract review, pass 2, and the remaining gates
complete, the later Production **GO HEAD** must descend from the source/tooling
HEAD and its net changed path must be exactly Checklist #40. The runner
rehashes the generator, runner, and every migration at both commits and rejects
any other path delta. This two-HEAD model removes the approval/HEAD cycle while
keeping the executable source immutable.

## 5. Disposable rehearsal boundary

Rehearsal must use a dedicated network-isolated PostgreSQL 17 target, never
normal Local Supabase and never Production. The database name must be exactly
`conduit_p12_rehearsal`, reachable through an explicit loopback IP, and contain
this guard:

- schema `p12_rehearsal_guard`;
- table `disposable_target`, owned by `postgres`;
- columns `id boolean primary key check (id=true)`, `nonce text not null`,
  `purpose text not null`, and `disposable boolean not null`;
- exactly one row with `id=true`, the command's 32-128 character URL-safe
  non-secret nonce, purpose
  `conduit-boq-phase4-p12-disposable-isolated-pg17`, and
  `disposable=true`; and
- no schema/table access for `PUBLIC`, `anon`, or `authenticated`.

The rehearsal URL must be passwordless:

```text
postgresql://postgres@127.0.0.1:<PORT>/conduit_p12_rehearsal?sslmode=disable
```

The non-Production password is supplied only through
`P12_REHEARSAL_DB_PASSWORD`. The runner rejects `localhost`, the ordinary
`postgres` database name, a missing/wrong nonce, a non-PostgreSQL-17 server, or
a sentinel not owned by `postgres`.

## 6. Schema calibration and one-file invocation

The first pass uses the dedicated rehearsal-only `calibrate-schema` command.
Start with the restored `016` baseline:

```sh
P12_REHEARSAL_DB_PASSWORD='<REHEARSAL_ONLY>' \
node scripts/run-master-catalog-p12-cli-step.mjs calibrate-schema \
  --kit <ABSOLUTE_EXTERNAL_KIT> \
  --stage 016 \
  --db-url 'postgresql://postgres@127.0.0.1:<PORT>/conduit_p12_rehearsal?sslmode=disable' \
  --evidence <ABSOLUTE_NEW_EXTERNAL_CALIBRATION_DIRECTORY> \
  --executor-label '<PASS1_CAPTURE_EXECUTOR>' \
  --rehearsal-sentinel '<NONSECRET_NONCE>'
```

Each later stage is a separate manual invocation and adds:

```text
--stage <NEXT_APPROVED_STAGE>
--prior-calibration-manifest <ABSOLUTE_PRIOR_05_SCHEMA_CALIBRATION_MANIFEST>
```

The command applies at most one migration, never invokes the next stage,
requires the same capture executor throughout the chain, and emits
`conduit-boq/master-catalog-p12-schema-calibration-evidence-manifest/v2`.
Every manifest binds its raw schema capture, outcome, exact kit path/hash,
source/tooling HEAD, generator/runner hashes, cumulative fingerprints, and the
canonical path/SHA-256 of the preceding manifest. The preflight file is
immutable; for migration stages the last pre-write database boundary is
recorded in a separate hash-bound
`01-calibration-write-boundary.json` after the native CLI returns.

The frozen calibration order is now
`016` → `017` → `017a` → `018` → … → `026`. The bridge and final correction
are independent files/invocations with their own evidence and verifier
hand-offs. The runner rejects any sequence in which `018` follows `017`
directly or `026` does not follow `025`. Candidate creation does not make
either migration Production-approved; pass 1 must restart from a fresh
`016` baseline after independent source review.

The second, verifying rehearsal uses normal one-file mode. Step `017`:

```sh
P12_REHEARSAL_DB_PASSWORD='<REHEARSAL_ONLY>' \
node scripts/run-master-catalog-p12-cli-step.mjs \
  --mode rehearsal \
  --kit <ABSOLUTE_EXTERNAL_KIT> \
  --step 017 \
  --db-url 'postgresql://postgres@127.0.0.1:<PORT>/conduit_p12_rehearsal?sslmode=disable' \
  --evidence <ABSOLUTE_NEW_EXTERNAL_EVIDENCE_DIRECTORY> \
  --executor-label '<REHEARSAL_EXECUTOR_LABEL>' \
  --schema-shape-contract <ABSOLUTE_EXTERNAL_0600_REVIEWED_JSON> \
  --advisor-artifact <ABSOLUTE_EXTERNAL_ADVISOR_ARTIFACT> \
  --advisor-artifact-sha256 <BARE_LOWERCASE_SHA256> \
  --rehearsal-sentinel '<NONSECRET_NONCE>'
```

Execution starts with `017`, which must not receive
`--prior-step-signoff`. Every subsequent migration—`017a` and `018` through
`026`—must add:

```text
--prior-step-signoff <ABSOLUTE_EXTERNAL_0600_JSON>
```

Production uses the runner-frozen passwordless Session-pooler URL, replaces
`--rehearsal-sentinel` with
`--approval-record <ABSOLUTE_EXTERNAL_0600_JSON>`, and uses the exact named
human executor. It must not use the rehearsal password environment variable.
No Production command may be assembled or invoked until section 9 is complete.

## 7. Mechanical gates at every step

Before and immediately before the migration write, the runner revalidates:

- kit hashes, native CLI version, Git/authority bindings in Production mode,
  external-path/symlink rules, the reviewed schema-shape contract, the
  hash-bound advisor artifact, and prior verifier sign-off;
- database name, PostgreSQL major, `session_user`, `current_user`, and
  disposable sentinel in rehearsal mode;
- exact ledger prefix and exactly one pending file;
- `2568.0.0`/710 catalog invariants and the approved operational authority
  fingerprint;
- BOQ, catalog binding, Factor F pointer/row/hash invariants;
- exact hotfix `016` ledger and live `save_boq_with_routes` posture;
- no Phase 4 flag is true, with the exact stage state below; and
- enough remaining maintenance-window budget in Production mode.

The exact schema-shape contract is an external owner-only `0600` JSON document
using schema
`conduit-boq/master-catalog-p12-schema-shape-contract/v3`. It binds the
application candidate, source/tooling HEAD, canonical kit-manifest path and
SHA-256, generator/runner source SHA-256 values, PostgreSQL/Supabase CLI
versions, all accepted migration hashes, the pass-1 capture executor, the
canonical final pass-1 evidence-manifest path/SHA-256, reviewed fingerprints,
and one exact-key `githubReview` envelope for every approved stage. Each
fingerprint canonicalizes every
`public`/`private` table column (type, nullability, default,
identity/generated state, and collation), constraint definition/validation
state, and index definition/valid/ready/live state. Preflight must equal the
preceding stage; postflight and final closeout must equal the new stage.
`pg_index.indcheckxmin` is an MVCC/HOT runtime-horizon marker rather than
structural schema. Scope
`public-private-table-columns-constraints-indexes/v2` therefore excludes it
from the fingerprint and closeout-equality surface while preserving its live
value as non-gating `index_runtime_diagnostics` evidence. Never mutate
`pg_catalog`, `VACUUM`, or `REINDEX` merely to make this diagnostic value match
a rehearsal.

The contract cannot be self-generated during Production execution. Its safe
derivation is a two-pass rehearsal:

1. after the selected Finding #43 correction is approved, use
   `calibrate-schema` one stage at a time on a fresh disposable isolated
   PostgreSQL 17 target; the recursively hash-bound chain is `UNREVIEWED`
   pass-1 evidence and must end at the final approved migration;
2. a named independent verifier, distinct from the pass-1 capture executor,
   compares the raw captures and freezes the external `0600` contract with the
   exact final pass-1 manifest path/SHA-256 and structured GitHub review
   envelope described below;
3. a second fresh full isolated rehearsal at the same source/tooling HEAD,
   exact kit, and frozen contract must pass every pre/post fingerprint, every
   fresh advisor hand-off, and the read-only final closeout; and
4. bind the pass-2 final closeout evidence-manifest canonical path/SHA-256 in
   the later external P-12 approval and committed Checklist #40 marker.

Production mode requires the contract `githubReview.reviewerLogin` to equal the
approved independent verifier, differ from the pass-1 capture executor, and
differ from the migration executor. The same login must sign the pass-2 and
Production handoffs. The frozen candidate stage list is exact `016`, `017`,
`017a`, `018`-`026`; no stage may be invented, omitted, or reordered.

The `githubReview` envelope binds fixed provider/repository, positive PR number,
decimal review ID, exact canonical immutable review URL, lowercase authenticated
human login and `User` type, `APPROVED` state, exact source/tooling commit,
timezone-qualified submission time, reviewed-payload SHA-256, and this exact
one-line marker:

```text
P12_SCHEMA_REVIEW_V1 source=<40hex> kit=<64hex> pass1=<64hex> payload=<64hex>
```

Before contract freeze, open the exact URL in an authenticated GitHub
session/API and confirm the review author/state/commit, unchanged PR head,
marker, latest review for that HEAD, and absence of a later dismissal or
changes-requested review. The runner is intentionally offline: it validates
canonical structure, local hashes, identity equality, and chronology, but does
not query GitHub, verify a signature, or prove account control.

Under the accepted honest-but-fallible model, GitHub-account compromise,
deliberate fabrication/collusion, and review deletion/dismissal after the last
check remain residuals. No custom signing/PKI is added. If malicious-operator
resistance or non-repudiation becomes required, stop and add signed attestations
with independent key custody before Production.

| Database stage | Exact Phase 4 flag state |
|---|---|
| Before `017` | All three Phase 4 rows absent |
| After `017` through `019`, including `017a` | Only `catalog_admin_enabled` exists and is `false` |
| After `020` through `026` | All three rows exist and are `false` |

Function defaults and private-schema usage are also stage-specific.
Immediately after `017`, `PUBLIC`, `anon`, and `authenticated` have no private
schema usage, no private Phase 4 routine exists, and the global owner-level
function guard is not yet present. The four exact rejecting public stubs may
retain the known Supabase-baseline `service_role` grant; only `017a` may
follow. After `017a`, the global `postgres` function default is exactly
owner-only, every `public`/`private` schema function-default row is owner-only
or absent, and the four stubs deny `PUBLIC`, `anon`, and `service_role`.
Authenticated private-schema usage remains denied until `018`. From `018`
onward, `authenticated` receives the reviewed schema usage for explicit
private implementation routines, while `PUBLIC` and `anon` remain denied.
Every routine's exact EXECUTE ACL, including `service_role`, security mode,
`search_path`, and body fingerprint remains a separate verifier gate; schema
usage alone never authorizes a call. After `026`, the formatter is exact
`SECURITY INVOKER` with unchanged owner/body/signature/empty search path,
direct `EXECUTE` only for owner plus `authenticated`, no grant option, and
effective denial for `PUBLIC`, `anon`, and `service_role`.

After the native CLI exits, and **before any post-CLI evidence-file write**, the
runner attempts the complete bounded read-only after-state: exact ledger, flag
state, ownership, relation ACL/RLS/policy, routine/security posture, trigger
definitions, and database invariants. Production starts that query set only
while the approved window still has the full frozen postflight budget. If the
budget is already unavailable, it writes the scrubbed unavailable-state
record, treats the result as uncertain, starts no later file, and requires a
separately authorized bounded read-only forensic reconciliation. If the window
expires only after an after-state was captured, the runner still writes that
captured state first.

The runner then persists the after-state before the immediate write boundary,
scrubbed CLI output, outcome, and hash manifest. It prepares each manifest at a
protected pending path, verifies its content/permissions/SHA-256 there, and
uses atomic rename as the last fallible publication operation; a failed
finalization therefore leaves no usable final manifest. A timeout sends
`SIGINT` to the native CLI process group, waits five seconds, and then sends
`SIGKILL` to the group. Any timeout, nonzero exit, output overflow, postflight
error, ledger ambiguity, maintenance-window violation, or missing complete
`05-evidence-manifest.json` is an uncertain outcome and a hard stop. A sudden
evidence-medium or filesystem failure cannot be made impossible by the runner;
the after-state-first ordering prevents an ordinary evidence write from
suppressing an authorized read-only reconciliation attempt, but it cannot
guarantee durable evidence after the medium itself fails. In that case keep
all flags false, start no later file, and use the controlled reconciliation
handoff before any new decision.

Mechanical success is not security acceptance. The runner never starts the
next file automatically.

The operational catalog fingerprint is a new, fully specified runner value;
it is not a claimed recomputation of the historical
`ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`
result because the historical query was not committed. For every
`public.price_list` row, the new formula serializes a JSONB array of:

```text
id, version_id, item_code, item_name, unit,
material_cost(2dp), labor_cost(2dp), unit_cost(2dp), category, is_active
```

Rows are ordered by `item_code COLLATE "C", id`; the JSONB aggregate text
(`[]` when empty) is encoded as UTF-8 and hashed with
`pg_catalog.sha256`. Before Production eligibility, derive the value through a
separately authorized read-only query against the encrypted Production
readiness snapshot's isolated restore or the fresh in-window
Production/restore evidence. Record it in #39/#40 and bind the exact bare
lowercase hexadecimal value as `catalogAuthorityFingerprintSha256` in the
Production approval. The runner enforces that approved value and pre/post/final
equality.

## 8. Independent verifier hand-off

The verifier must be a named human distinct from the executor. Migration
execution begins with `017`, which has no previous Phase 4 migration. Before
each subsequent migration—`017a` and `018` through `026`—the immediately
preceding migration needs a 0600 JSON record with exact schema
`conduit-boq/master-catalog-p12-prior-step-verifier-signoff/v1` and these
fields:

- `schema`, `decision="SECURITY_VERIFIED"`, `previousStep`, and
  `authorizedNextStep`;
- `executionGitHead`, `kitManifestSha256`, `previousExecutor`, and `verifier`;
- `ownershipAclRlsReviewed=true`;
- `functionPostureAndBodyFingerprintsReviewed=true`;
- `ledgerAndFlagsReviewed=true`;
- `advisorDeltaTriaged=true`;
- `schemaShapeContractSha256` and the reviewed
  `priorSchemaShapeFingerprintSha256`;
- `advisorArtifactPath`, `advisorArtifactSha256`, and timezone-qualified
  `advisorArtifactCapturedAt`;
- timezone-qualified `reviewedAt`;
- `priorEvidenceManifestPath`, `priorEvidenceManifestSha256`,
  `priorOutcomeSha256`, and `priorPostflightSha256`; and
- in Production only, `approvalRecordSha256`.

The approval-bound advisor artifact is the fresh baseline for step `017` only
and must be captured after pass 2 and before Owner approval. Before each later
step, capture a fresh post-previous-step advisor artifact. Its canonical
path/SHA-256/timestamp must match the prior-step sign-off, and its timestamp
must fall after the previous outcome/postflight and no later than verifier
review. Do not reuse the approval baseline for every step.

The runner rehashes the referenced evidence manifest and all six mandatory
evidence files. It rejects a sign-off that names the same executor and
verifier, references any other step/head/kit, predates the outcome, binds a
stale advisor artifact, contains extra fields, or attempts to continue from an
uncertain or mechanically failed outcome.

After `026`, the independent human verifier must review the step-`026`
evidence, fresh advisor artifact, and the same security scope, then issue the
distinct final sign-off. The runner must then re-prove the live final state in
read-only closeout mode before P-13 can be requested:

```sh
node scripts/run-master-catalog-p12-cli-step.mjs closeout \
  --mode <rehearsal-or-production> \
  --kit <ABSOLUTE_EXTERNAL_KIT> \
  --db-url <EXACT_PASSWORDLESS_URL> \
  --evidence <ABSOLUTE_NEW_EXTERNAL_CLOSEOUT_EVIDENCE_DIRECTORY> \
  --final-migration-evidence-manifest <ABSOLUTE_STEP_026_EVIDENCE_MANIFEST> \
  --final-signoff <ABSOLUTE_EXTERNAL_0600_JSON> \
  --verifier-label '<INDEPENDENT_VERIFIER>' \
  --schema-shape-contract <ABSOLUTE_EXTERNAL_0600_REVIEWED_JSON> \
  --advisor-artifact <ABSOLUTE_EXTERNAL_ADVISOR_ARTIFACT> \
  --advisor-artifact-sha256 <BARE_LOWERCASE_SHA256> \
  <MODE_SPECIFIC_OPTION>
```

Rehearsal supplies its sentinel; Production supplies the same approval record
used for the sequence. The sign-off schema is
`conduit-boq/master-catalog-p12-final-verifier-closeout/v2`. It binds the exact
HEAD, kit, final migration `026` executor/evidence/outcome/postflight hashes and, in Production,
the approval hash. It requires the independent verifier to affirm security,
advisor, owner/ACL/RLS, function/hotfix-body, Factor-F/BOQ-fingerprint,
ledger, and flag review. It also binds
`schemaShapeContractSha256`, the reviewed `026` schema fingerprint,
`advisorArtifactPath`, and `advisorArtifactSha256`.

Closeout reruns the live read-only final snapshot, requires the exact ordered
ledger `009`-`016`, then `017`, `017a`, `018`-`025`, and `026`, all three Phase 4
flags `false`, and no hotfix/Factor-F/BOQ fingerprint drift from `026`. It
emits a separately hashed closeout evidence manifest, applies no migration,
sets `p13Authorized=false`, and never requests or approves P-13.

For pass 2, that final closeout manifest is not accepted as a shallow
attestation. The Production runner rehashes its three files, the fresh
post-`026` advisor, the final verifier sign-off, and transitively the referenced
step-`026` evidence/outcome/postflight chain. It also verifies the rehearsal
identity/sentinel, live final snapshot, source/tooling HEAD, kit, contract, and
chronology: contract review precedes pass 2; sign-off precedes the live
closeout; live closeout precedes outcome/manifest; pass 2 precedes Owner
approval.

## 9. Committed P-12 GO binding

Production mode requires all of the following:

1. the current GO HEAD has a clean tracked tree and equals its pushed
   upstream;
2. the external kit is `productionEligible=true` and remains bound to the
   earlier source/tooling HEAD;
3. the source/tooling HEAD is an ancestor of the GO HEAD, Checklist #40 had no
   GO marker at the source/tooling HEAD, and the net changed path between the
   two commits is exactly Checklist #40;
4. generator, runner, and migration hashes equal the contract at both HEADs;
5. the external approval binds exact committed hashes for Migration Authority,
   #12, #19, #25, #39, #40, this runbook, Finding #43, and Finding #44;
6. exactly one committed `P12_RUNNER_AUTHORITY_V1` marker in Checklist #40
   records GO, candidate, Owner reference/time, different executor and
   verifier, `schemaShapeContractSha256`,
   `pass2VerificationEvidenceManifestSha256`, and the exact maintenance
   window; and
7. an external owner-readable `0600` approval record binds that marker, GO
   HEAD, authority hashes, migration hashes, ledger versions, current-user
   role, `catalogAuthorityFingerprintSha256`,
   `schemaShapeContractSha256`, pass-2 manifest canonical path/SHA-256,
   backup/restore/checksum evidence, advisor triage plus the fresh step-`017`
   baseline advisor canonical path/SHA-256/timestamp, authenticated GitHub
   review recheck time `githubReviewCheckedAt`, remote CI, timeout,
   stop/fix-forward posture, and no-automatic-next-step rule.

The external approval schema is
`conduit-boq/master-catalog-p12-production-approval/v3`. Immediately before the
GO decision, the Owner or distinct verifier must repeat the authenticated
GitHub review check and record `githubReviewCheckedAt` after pass-2 completion
and no later than `approvedAt`. A missing, unavailable, mismatched, dismissed,
or superseded review stops before GO-marker creation, Keychain access, or any
Production connection. The same source kit
used for both rehearsals is reused; it is not regenerated at the GO HEAD. The
marker is committed first; the external record then binds the resulting full
GO commit SHA and authority hashes. The marker deliberately cannot contain its
own commit SHA.

The runner requires at least 21 minutes 15 seconds remaining at initial
validation, 12 minutes 30 seconds immediately before the final MVCC write
boundary, and 8 minutes 45 seconds for post-migration verification. The final
closeout requires at least 8 minutes 50 seconds. Falling below the initial or
immediate pre-write budget stops before starting the file. If the full
postflight budget is unavailable after the native CLI returns, the runner
starts no new Production query and no later migration; the separately
authorized forensic-reconciliation path is then required.

No marker or approval record exists at this checkpoint.

## 10. Backup and rollback checkpoints

The readiness rehearsal is not the final rollback source.

- Before `017`, create the fresh in-window encrypted application-only
  Production backup, isolated restore, full checksum, manifest, and
  executor/verifier sign-off.
- After the full sequence `017` → `017a` → `018` → … → `026`, its immediate
  ledger/security/BOQ/Factor-F/flag verification, and final read-only closeout
  pass, create and verify the post-migration application-only backup and
  manifest before requesting P-13.
- Before P-13, keep every Phase 4 flag disabled.
- After separately approved P-15 publication verification, create the final
  post-publication package and verified encrypted external copy.

The bounded same-device exception expires at the earlier of the
post-publication checkpoint after separately approved P-15 verification or 168
hours after the recorded P-12 start. Create the independent encrypted copy
before a planned pause exceeding 24 hours or before resuming after an
unplanned 24-hour pause. There is no automatic extension.

## 11. 2026-07-28 fail-closed rehearsal finding

The rehearsal kit manifest was
`dff3ee0c5119fac6a6a037fbd72d4063f47414069faf4e70c589e28b156bd766`
and correctly recorded `productionEligible=false` because the authority sync
was still an uncommitted working tree at source HEAD
`07d1d3399cea363a2ff923c6393d4a3259ce623c`. The fail-closed evidence
manifest SHA-256 is
`690f0d836f30b01f1f1a971eec2f24e82ce69d410af261eedaf0997fd5bd3770`;
the migration-outcome SHA-256 is
`938575d9a448cd5b64b4293e5a92b9405260f191454785ede09de78b6a32dd8d`.

The disposable PostgreSQL `17.6` target started from:

- catalog `2568.0.0`, 710 rows;
- 198 scrubbed Local-reference BOQs and 1,547 BOQ items;
- Factor F `2569.0.0`;
- exact ledger `009`-`016`, including hotfix `016`; and
- zero Phase 4 flag rows.

The native Supabase CLI returned success after applying only
`20260728001700_master_catalog_phase4_foundation`. The runner then rejected
postflight with `Private-schema function default ACL is missing`, classified
the result as uncertain, wrote failure after-state evidence, and did not run
`018`.

The finding is substantive. Migration `017` contains:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
```

PostgreSQL 17 specifies that a per-schema default privilege can add to, but
cannot revoke, a privilege granted by the global default. Functions receive
`PUBLIC EXECUTE` globally by default, so the `PUBLIC` portion above is a no-op
unless it reverses an earlier matching per-schema grant. The observed database
had no private/global function default-ACL entry after `017`, and a
transaction-rolled-back function probe retained `PUBLIC EXECUTE`.

Official reference:
[PostgreSQL 17 ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).

The disposable target stopped before a private Phase 4 routine was created.
Static follow-up review found that `018` would create twelve private
`SECURITY DEFINER` helpers without explicit per-function revokes and would
grant `authenticated` schema usage. If the sequence continued without an
effective global default guard, those helpers would inherit `PUBLIC EXECUTE`.
The unexposed `private` Data API posture reduces the external application path
but does not make that database ACL acceptable.

Recorded disposition:

1. reviewed migrations `017` and `018` remain byte-for-byte unchanged;
2. the Owner selected Option B for a repository-only candidate;
3. forward migration
   `017a_master_catalog_phase4_global_function_default_privileges.sql`, ledger
   `20260728001730`, removes the global `PUBLIC` default and additive
   `public`/`private` API-role defaults, including `service_role`;
4. the runner now freezes the exact `017` → `017a` → `018` hand-off and its
   stage-specific default/routine ACL checks;
5. independent source/architecture/security review and static checks passed
   on the working-tree candidate; a fresh complete pass 1 / contract review /
   pass 2 / closeout sequence remains required; and
6. P-12 remains HOLD until those rehearsals and every other Package #39 gate
   pass.

### 11.1 2026-07-29 P-46 fail-closed callability finding

P-45 completed at pushed/upstream-equal `d92d8ce`. The single P-46 Local
bootstrap authorization was consumed and the canonical chain completed through
`025`. The following WP-6.5 wrapper-precedence check failed closed with
`permission denied for function catalog_action_error`: the authenticated
public `SECURITY INVOKER` wrapper directly reaches a pure private formatter
whose exact ACL is owner-only. The stop preserved the external package
`p46-local-bootstrap-20260729T121635Z-d92d8ce`; no cleanup, retry, reset, kit,
or Production action followed.

P-47 adds `026_master_catalog_phase4_catalog_action_error_acl.sql`, ledger
`20260729002600_master_catalog_phase4_catalog_action_error_acl`, SHA-256
`472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`.
It alters only the existing helper security mode/ACL: preserve exact body,
owner, signature, defaults, and empty search path; use invoker context; retain
owner execution; grant authenticated without grant option; deny PUBLIC, anon,
and service_role; preserve `017a` global/schema defaults, all flags, and all
business data. See Finding #44. P-47 is repository-only authority.

## 12. Current stop state

Stop without Production migration because:

- the P-47 `026` source/tooling/authority candidate passed independent
  review/static closure but is not frozen at a replacement Git HEAD;
- no replacement clean pushed/upstream-equal source/tooling HEAD or truthful
  Remote record is frozen;
- no fresh Owner authorization exists for the destructive Local bootstrap,
  and no clean rehearsal through `026` has passed;
- the final `026` independent-verifier closeout is machine-enforced in the
  repository candidate but has not been exercised;
- the exact bridge-aware schema-shape contract has not been derived,
  independently reviewed, or passed through the mandatory second isolated
  rehearsal;
- prior pass evidence is historical and insufficient for the new `026` stage;
- no pass-2 final closeout evidence manifest is available or bound;
- no exact advisor artifact path/SHA-256 is bound into a P-12 approval;
- exact end-to-end CLI rehearsal has not passed through `026`;
- no named Production executor/verifier/window/current-user record exists;
- no fresh in-window final rollback backup exists; and
- no separate P-12 GO has been recorded.

P-47 repository implementation/static review passed. P-48 authorizes only the
exact recorded 25-file one-commit/one-push Git publication, with no PR; its
replacement HEAD and Remote truth must then be recorded. A destructive Local
rehearsal requires another fresh, explicit warning/approval. The
stop/no-retry/external-evidence rules above apply. Kit generation and
disposable pass 1 remain later gates. No current authorization covers any
other Git write, Local cleanup/reset/apply, kit/rehearsal execution, Production
access/write, P-12, PR creation, or the later Checklist-only GO commit.
