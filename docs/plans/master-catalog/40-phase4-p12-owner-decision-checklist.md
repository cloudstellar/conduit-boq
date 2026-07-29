# Phase 4 P-12 Owner Decision Checklist

**Prepared:** 2026-07-26

**Last updated:** 2026-07-30

**Status:** PRE-P-12 HOLD - immutable replacement source/tooling HEAD
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42` and its truthful
`Vercel=success` record are frozen. The post-P-48 Checklist-only status
checkpoint completed at pushed/upstream-equal
`28673b39962a092472c2334843e95aaafdfce97b`, also with
`Vercel=success`, no PR, zero PR-triggered GitHub Actions runs, and no GitHub
Actions lint/test/build claim. The corrected-Local authorization checkpoint
then completed at pushed/upstream-equal
`fbd0d3ca43eee69f1543731efa7832ef72de99d9`. Its one reset authorization
was consumed: bootstrap through `026`, WP-7, WP-6.5, and canonical hash/schema
verification passed, then the error-level Local DB lint returned exit code
`1`. The run stopped without retry, cleanup, patch, ad hoc SQL, final
invariant query, package completion, kit/pass work, or Production action.
The bounded read-only lint diagnosis was then consumed exactly once and
classified the sole emitted finding as Package #39's frozen known
`pg_temp.catalog_placement_input` analyzer limitation, with zero unknown
findings. This classification does not pass or close the Local gate. The Owner
has now authorized only the Checklist-only result checkpoint below; it remains
pending until clean, pushed, and upstream-equal. Disposable execution, final
Local-gate continuation, evidence-package completion, kit/pass work,
Production, application/UI/export changes, flags, publication, Factor F,
hotfix `016`, and P-12 remain unauthorized.

**Exact application candidate:**
`5068f944af2aa3fe8446c77c8ae8d48673cb260b`

**Exact pushed readiness/documentation head:**
`07d1d3399cea363a2ff923c6393d4a3259ce623c`

**Immutable P-44 executable-content ancestor:**
`ed94c0304be2741217c7ea2c36322b426de1dfe5`

**Historical P-45/P-46 source/tooling HEAD:**
`d92d8ced42fc882481ebc2c4579adcf1edbebea7` — superseded as a future kit
source by the P-46 finding

**Replacement source/tooling HEAD:**
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`

**Completed post-P-48 Checklist-only status-checkpoint HEAD:**
`28673b39962a092472c2334843e95aaafdfce97b`

**Completed corrected-Local authorization-checkpoint HEAD:**
`fbd0d3ca43eee69f1543731efa7832ef72de99d9`

**Current authority sync:** P-45/P-46 remain historical evidence. P-47
repository/static closure passed for the exact recorded migration identity/hash.
P-48 then froze the replacement source/tooling HEAD and truthful Remote record
above. The post-P-48 status checkpoint and corrected-Local authorization
checkpoint are complete. The single corrected-Local reset was consumed; all
gates through canonical verification passed, and error-level DB lint then
failed closed with exit code `1`. The retained evidence package is incomplete
by design. The one bounded read-only lint diagnosis completed under the
fail-closed contract below and matched only the frozen known
`private.place_catalog_items_impl` temp-table analyzer finding; no unknown
finding was emitted. The Owner has authorized only its Checklist-only result
checkpoint; no later Local gate is inferred.

**Post-freeze status/authority overlay:** only from the exact P-48 replacement
freeze above through the final GO HEAD, this Checklist is the sole live tracked
status and decision overlay. It does not reassign the general pre-freeze status
authority from the Progress Tracker. Pending P-48 labels in the immutable
source-head copies of every other tracked authority document, and their
related HOLD placeholders, are frozen pre-result snapshots; do not synchronize
them through later tracked edits. This overlay may record only later decisions,
status, and exact external-evidence bindings. It may not amend or waive the
frozen migration hashes/order, CLI/PostgreSQL versions, ACL/RLS/function
contracts, fingerprint formula, runner, timeouts, stop/recovery rules,
architecture, security, or business authority. A later Checklist entry may
mark a frozen Package #39 HOLD gate satisfied only by naming the unchanged
requirement and binding its exact external evidence.

**Future PRE-GO authority rule:** the former post-P-45 Checklist-only rule was
suspended when P-46 exposed a source defect and resumed immediately when P-48
froze the replacement source/tooling HEAD above. From that freeze onward, no
tracked path other than this Checklist may change. A separately authorized
clean Local rehearsal is the next prerequisite before kit/pass work; it is not
a condition that delays the source freeze. Every later bounded PRE-GO
action—including the Local rehearsal, fingerprint derivation, kit, and pass
work—requires a new explicit Owner decision and separate Git authorization
recorded before action in a clean pushed/upstream-equal Checklist-only PRE-GO
authority checkpoint with no committed P-12 GO marker. Execute that action
from a clean dedicated checkout pinned to the unchanged replacement
source/tooling HEAD. Such authority commits are not new source HEADs or
Production approval; the final
runner evaluates the net changed path from the replacement freeze to GO, which
must remain exactly this Checklist. This rule authorizes no kit or pass now.

**Exact post-P-48 Checklist-only status checkpoint authorized:** the Owner's
2026-07-29 instruction authorizes exactly one commit and one push from base
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42` on branch
`codex/master-catalog-phase4`, with commit message
`docs: record p48 source freeze`. Its repository-relative allowlist is only
`docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`. Do not
create a PR. Do not stage or modify `files/`, `tmp/`, `output/`, or any other
untracked path. Record the resulting Checklist-only authority-checkpoint SHA,
upstream equality, and truthful Remote status in the secret-free external
handoff only; do not create another tracked commit merely to record that
checkpoint's own SHA. No follow-on tracked commit is authorized or required for
that self-record. This checkpoint does not replace the immutable
source/tooling HEAD above and
authorizes no Local cleanup/apply/reset/retry, disposable execution, kit/pass,
Production, deploy, flags, publication, Factor F, hotfix `016`, `v_row_count`,
or P-12 action.

**Post-P-48 corrected-Local PRE-GO authority recorded:** 2026-07-29 — after
being explicitly warned that `npm run db:local:bootstrap` invokes
`supabase db reset --local --no-seed` and destroys/rebuilds all Local Supabase
data, the Owner instructed the team to continue with the recommended next
step.

This decision first authorizes exactly one Checklist-only authority checkpoint
from base `28673b39962a092472c2334843e95aaafdfce97b` on branch
`codex/master-catalog-phase4`: change only
`docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`, commit
once as `docs: authorize corrected local rehearsal`, and push once to the
existing branch. Do not create a PR or stage/modify `files/`, `tmp/`,
`output/`, or any other untracked path. This commit contains no P-12 GO marker.
Record the resulting Checklist-only authority-checkpoint SHA, upstream
equality, and truthful Remote status in the secret-free external handoff only;
no recursive tracked commit is authorized or required merely to record its own
SHA.

Only after that checkpoint is clean, pushed, and upstream-equal, this decision
authorizes exactly one invocation of `npm run db:local:bootstrap` from a clean
dedicated checkout pinned to immutable source/tooling HEAD
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`, using frozen Supabase CLI
`2.107.0`. It may reset/rebuild Local Supabase, apply `009`-`015`, hotfix
`016`, `017`, `017a`, and `018`-`026`, then run the reviewed consolidated
smoke/security/business invariant checks and preserve secret-free immutable
external evidence bound to that source HEAD. Production remains untouched and
all three Phase 4 flags must finish boolean `false`.

Do not clean or patch the retained P-46 Local state before the reset. If any
precondition, migration, hash/order, invariant, ACL/security, evidence, or
drift check fails, preserve evidence and stop. No retry, manual Local cleanup,
patch, ad hoc SQL, second reset, disposable rehearsal, kit/pass, Production
action, PR, P-12, or further tracked commit is authorized without a new Owner
decision and separately pushed Checklist-only authority checkpoint.

**Post-P-48 Local-lint diagnostic PRE-GO authority recorded:** 2026-07-30 —
after being told that the single corrected-Local authorization was consumed,
that bootstrap/WP-7/WP-6.5/canonical verification passed, and that the
error-level DB-lint command returned exit code `1` before final invariants,
the Owner instructed the team to follow the recommended read-only lint
failure triage without reset.

The retained secret-free external evidence directory is:

`/Users/cloud/Backups/ConduitBOQ/evidence/phase4/pre-p12/post-p48-local-bootstrap-20260729T164944Z-7fbfe1b`

Files `01-preflight.json` through `05-canonical-hash.json` record the passed
preflight, one consumed bootstrap, WP-7, WP-6.5, and canonical proof.
`06-db-lint.json` records only the stopped lint summary and exit code `1`;
the wrapper intentionally persisted no raw CLI output. No final invariant
evidence, completed package status, or package checksum manifest is claimed.
The frozen authority-consistency test passes 12/12 at the immutable
source/tooling checkout `7fbfe1b`. At this later Checklist-only descendant,
the same frozen test still asserts the pre-P-48 pending-status snapshot and
therefore is not claimed as passing; the sole-live-overlay rule prohibits
changing that source test merely to follow later Checklist status.

This decision first authorizes exactly one Checklist-only authority checkpoint
from base `fbd0d3ca43eee69f1543731efa7832ef72de99d9` on branch
`codex/master-catalog-phase4`: change only
`docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`, commit
once as `docs: authorize local lint triage`, and push once to the existing
branch. Do not create a PR or stage/modify `files/`, `tmp/`, `output/`, or any
other untracked path. This commit contains no P-12 GO marker. Record its SHA,
upstream equality, and truthful Remote status in the secret-free external
handoff only; no recursive tracked commit is authorized or required merely to
record its own SHA.

Only after that checkpoint is clean, pushed, and upstream-equal, this decision
authorizes exactly one read-only diagnostic invocation from the retained clean
dedicated checkout pinned to immutable source/tooling HEAD
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`, using Supabase CLI `2.107.0`:

```text
node_modules/.bin/supabase db lint --local --level error --fail-on none --output-format json
```

Capture only machine-parsed, secret-free finding identity/severity/message
fields and invocation metadata in a new owner-only external
`06a-db-lint-diagnostic.json`; do not overwrite `06-db-lint.json` or persist
raw CLI output. Compare the result only against Package #39's frozen,
already-triaged lint findings: the generic analyzer's inability to see
function-created `pg_temp.catalog_placement_input` in
`private.place_catalog_items_impl`, and the accepted unused
`private.catalog_placement_state.v_row_count` assignment if the selected
error-level output includes it. The diagnostic must not infer that a known
finding is new, nor suppress, normalize away, or accept any other finding.

This authority permits no reset, migration application, DDL, DML, manual/ad
hoc SQL, Data API mutation, feature-flag change, cleanup, patch, source edit,
second lint invocation, final invariant query, evidence-package completion,
kit/pass work, Production access/write, P-12, or other Git action. If the
command itself fails, its machine output cannot be parsed exactly, the retained
checkout/source/CLI/Local target has drifted, or any new/untriaged finding
appears, preserve the evidence and stop. Even an exact known-finding match
authorizes only classification and a report to the Owner; resuming final
invariants or closing the Local gate requires another explicit Owner decision
and separately pushed Checklist-only authority checkpoint.

**Post-P-48 Local-lint diagnostic result and status-checkpoint authority
recorded:** 2026-07-30 — after being told that the authorized read-only
diagnostic was consumed exactly once and matched only Package #39's frozen
known finding, the Owner instructed the team to continue with the recommended
next step.

The retained secret-free
`06a-db-lint-diagnostic.json` binds authority checkpoint
`79e4f922681047e585df9b048401fb9a874e6022`, immutable source/tooling HEAD
`7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`, Supabase CLI `2.107.0`, Local
target, and exactly one invocation of the authorized `--fail-on none`
machine-output command. Its file SHA-256 is
`9f356092de16d5a6b0d8b0a370ae843626c085c6522e2dd21bd0cc33f894288a`.
The command returned exit code `0` because its
fail-on threshold was intentionally `none`; that exit code is not a clean-lint
claim. Machine parsing found exactly one error-severity finding:
`private.place_catalog_items_impl` reported that
`pg_temp.catalog_placement_input` does not exist. It was classified as the
frozen known generic-analyzer limitation. Unknown-finding count was zero; the
accepted unused `private.catalog_placement_state.v_row_count` finding was not
emitted at the selected error level. No raw output or secret material was
retained and Production was not touched.

This result completes only the bounded diagnostic/classification action. The
original error-level lint gate remains truthfully stopped with exit code `1`,
and final invariants, evidence-package completion/checksums, Local-gate
closeout, kit/pass work, and P-12 remain unexecuted and unauthorized.

The Owner's instruction authorizes exactly one Checklist-only result
checkpoint from base
`79e4f922681047e585df9b048401fb9a874e6022` on branch
`codex/master-catalog-phase4`: change only
`docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md`, commit
once as `docs: record local lint diagnosis`, and push once to the existing
branch. Do not create a PR or stage/modify `files/`, `tmp/`, `output/`, or any
other untracked path. This commit contains no P-12 GO marker. Record its SHA,
upstream equality, and truthful Remote status in the secret-free external
handoff only; no recursive tracked commit is authorized or required merely to
record its own SHA.

This status-checkpoint authority permits no reset, migration application,
lint retry, second diagnostic, DDL, DML, manual/ad hoc SQL, final invariant
query, evidence-package completion, Local-gate closeout, cleanup, patch,
source edit, kit/pass work, Production access/write, feature-flag change,
publication, P-12, PR, or other Git action. Resuming the corrected Local gate
requires a new explicit Owner decision and separately pushed Checklist-only
authority checkpoint.

**Post-freeze fingerprint binding:** frozen references in Package #39 and CLI
Runbook #41 that say to record the future
`catalogAuthorityFingerprintSha256` in both Package #39 and this Checklist are
implemented after the freeze by recording the live value and evidence source
in this Checklist plus the external Production approval. Package #39 remains
the immutable source-head formula/control snapshot and must not be edited
before the P-12 GO/Production boundary under this release path. This changes
only the tracked recording location. The separately authorized read-only
derivation, frozen formula, allowed evidence source, exact-equality checks, and
stop conditions remain unchanged. The value must remain the exact bare
lowercase 64-hex required by #39/#41, without a `sha256:` prefix. Until the
value, source, and external binding are recorded here exactly, the fingerprint
gate remains HOLD; even a `productionEligible=true` kit must not be used in
Production and P-12 must not be requested.

**Authority:** Production `2568.0.0` remains authoritative for item names,
units, and prices. The local workbook remains reconciliation/reference evidence
only.

## 1. Ready now

- [x] WP-8/P-37 Owner acceptance is recorded under the guided-UAT variance.
- [x] Exact application candidate passed 37 test files/239 tests, TypeScript,
  zero-warning lint, production build, desktop/mobile Browser smoke, and binary
  Excel verification.
- [x] Exact historical migration `017`-`025` manifest and Local clean-chain
  evidence exist; they are retained as pre-bridge evidence.
- [x] Owner-selected `017a` candidate identity is frozen in exact `017` ->
  `017a` -> `018` order; independent review/static checks passed and the
  corrected-chain rehearsal remains open.
- [x] P-44 exact reviewed 23-file content freeze was committed/pushed at
  `ed94c0304be2741217c7ea2c36322b426de1dfe5`, with no GO marker, PR, or
  `files/`, `tmp/`, or `output/` content. Local/upstream equality and
  `Vercel=success` passed; no PR-triggered GitHub Actions run exists.
- [x] P-45 completed at pushed/upstream-equal
  `d92d8ced42fc882481ebc2c4579adcf1edbebea7`.
- [x] P-46 was consumed exactly once. Canonical bootstrap completed through
  `025`; WP-6.5 then failed closed on owner-only
  `private.catalog_action_error(...)`. External evidence was preserved and no
  cleanup, retry, patch, or second reset occurred.
- [x] P-47 authorizes repository-only migration `026` plus required bootstrap,
  hash, runner, WP-6.5 cleanup, test, architecture/security, and authority
  alignment. It authorizes no Local execution, Git action, kit/pass, or
  Production action.
- [x] Production read-only baseline, authority hash, migration ledger, BOQ,
  Factor F, RLS/grant/trigger inventory, and advisor baseline were captured
  without a Production write.
- [x] Phase 4 flag stages are reconciled: Production before `017` has all
  three Phase 4 rows absent, while clean post-`025` Local evidence has all
  three rows present with boolean `false`.
- [x] Exact P-48 replacement source/tooling HEAD
  `7fbfe1bb8f71df03a78762b00e93aded7bdd6e42` was pushed/upstream-equal at
  P-48 closeout, remains the immutable source-head ancestor, and records
  `Vercel=success`; no PR-triggered GitHub Actions run exists and no GitHub
  Actions lint/test/build run is claimed.
- [x] Post-write encrypted-bundle non-force detach, read-only reopen, full
  eight-entry `SHA256SUMS`, final detach, Docker/Local restart, and Local
  invariant readback passed without reset.

## 2. Owner decisions required before requesting P-12

### A. Production Data API setting

- [x] Authorize a read-only Dashboard/Management setting check proving that
  schema `private` is not exposed through the Production Data API.
- [x] Attach the setting evidence to
  [Readiness Package #39](./39-phase4-p12-production-readiness-package.md).

Management API evidence at 2026-07-26 19:29 +07 shows exposed schemas
`public, graphql_public`, extra search path `public, extensions`, and
`private_exposed=false`. The command emitted no token or `jwt_secret`. No
configuration was changed.

### B. Backup and isolated restore

Recommended low-cost path:

- [x] Approve an encrypted logical `pg_dump`/`supabase db dump` to an approved
  secure off-repository location.
- [x] Prepare an AES-256 encrypted APFS sparse bundle outside the repository,
  with its random passphrase held in the macOS login Keychain.
- [x] Prove the exact Supabase PostgreSQL `17.6.1.063` restore toolchain using
  synthetic data and a second Local application-only rehearsal.
- [x] Read the exact primary pooler target through the Owner-authorized
  Management API and prove TCP reachability to Session mode without database
  authentication.
- [x] Obtain a valid existing Production DB password through the Owner's secure
  input path, validate it with one authentication/read-only
  identity query, and store it in macOS Keychain without putting it in Git,
  chat, shell history, command arguments, or evidence files.
- [x] Confirm that a controlled project-password reset is not required: the
  existing credential passed; no reset or control-plane change occurred.
- [x] Create the Production application-only dump using the frozen connection
  contract and PostgreSQL 17.6 tooling: include `public, private`; retain the
  `public.price_list_audit_logs` definition but exclude its data; do not dump
  `auth` or `storage` data.
- [x] Restore only into isolated non-Production PostgreSQL 17.
- [x] Record manifest, hashes, table counts, restore result, credential custody,
  and automated verifier result without storing credentials in Git or evidence
  files. The independent human verifier remains open under section D.

Local toolchain proof at 2026-07-26 passed a custom-format dump, AES-256
encrypted APFS detach/remount, and restore into exact image
`public.ecr.aws/supabase/postgres:17.6.1.063`. A second rehearsal restored Local
schemas `public, private`, excluded only `public.price_list_audit_logs` table
data, reproduced the critical application counts, and matched the complete
`price_list` row hash. Temporary dump files and containers were deleted.

The prepared 8 GiB logical sparse bundle is
`/Users/cloud/Backups/ConduitBOQ/production/phase4/pre-p12/pre-p12-rehearsal.sparsebundle`.
It reports `encrypted: YES`, is local-user-only, and its password is held under
Keychain service `Conduit BOQ Phase4 Backup`, account
`otlssvssvgkohqwuuiir-pre-p12`. Keychain-to-bundle reopen passed after the
creator process exited, without displaying the password.

The exact non-secret Session target is
`postgres.otlssvssvgkohqwuuiir@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`
with TLS required. The Management API returned this primary host and frozen
Supabase CLI `2.107.0` maps it to Session port `5432`; a TCP-only reachability
check passed. The direct IPv6 database endpoint is not reachable from this
machine.

At 2026-07-26 21:47 and 22:04 +07, two candidate passwords entered one at a
time through the native secure prompt failed the authentication/read-only
identity query. Each rejected Keychain item and temporary `.pgpass` was
deleted. Immediately before the 22:48 +07 capture, a third Owner-entered
candidate passed the bounded identity query against PostgreSQL 17.6. It remains
only in the login Keychain under service `Conduit BOQ Production DB`, account
`otlssvssvgkohqwuuiir`; no password was printed or stored in evidence.

The authorized read-only Production dump completed at 22:48 +07 inside
`pre-p12-readiness-20260726T154815Z/` in the encrypted sparse bundle. Its
352,642-byte custom-format file has SHA-256
`9d306a478b8ada65d0a32ab31bca19587c55efa3ae979ae4dd8ad5871d575932`.
Source metrics were identical immediately before/after: 234 BOQs, 2,270 BOQ
items, 710 catalog rows, one catalog version, two Factor F versions, and 73
Factor F rows.

The exact-image restore ran with no network or host port and was deleted
afterward. Because Auth data was deliberately excluded, the isolated target
used 20 UUID-only ephemeral `auth.users` stubs to validate the application's
foreign keys; zero stub contained an email, password, app metadata, or user
metadata. Comparable counts/hashes matched, the metrics diff was empty, and
constraints, triggers, catalog links, Factor F snapshots, and default pointers
all passed. No Production write occurred.

Supabase states that changing the project password updates its managed services
without downtime, but external services with hardcoded credentials must be
updated manually. Therefore a reset is not implied by this checklist and
requires separate Owner approval:
[Postgres role passwords](https://supabase.com/docs/guides/database/postgres/roles#passwords).

This satisfies the **readiness rehearsal** backup/restore row. It is not the
final rollback source because Production remains live. The same-computer
location is a managed single-device-loss residual.

On 2026-07-27 the Owner authorized a temporary Docker stop for the custody
check only. Fresh inspection found Docker holding read handles. Docker was quit
gracefully, the bundle was detached without force, reopened read-only from the
Keychain path, and reported encrypted/read-only. All eight `SHA256SUMS` entries
passed. It was detached again without force and remains unmounted. Docker and
all seven Local Supabase containers returned healthy/up; Local readback repeated
`2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547 with zero
unversioned BOQs, and Factor F `2569.0.0`/36. No Local reset or data write
occurred.

Alternative:

- [ ] Use a platform backup/clone only after its separate cost is confirmed.

The verified restore removes the backup-rehearsal blocker. P-47
repository/static closure has passed. P-12 remains HOLD at a separately
authorized but incomplete corrected Local gate (replacement Git freeze/Remote
record complete; reset consumed; known lint finding classified; final
invariants/package closeout not authorized),
later-authorized kit/pass-1/authenticated-review/pass-2 evidence, named-human
executor/distinct verifier/path/object-owner/window, and the separate P-12
decision below.

#### Frozen backup/snapshot timeline

1. **Readiness rehearsal before requesting P-12:** create an authorized
   read-only encrypted logical backup from the current Production database,
   restore it into isolated non-Production PostgreSQL 17, and pass the critical
   count/hash/integrity checks. This proves the recovery process but is not the
   final rollback source.
2. **Final pre-migration backup:** inside the separately approved P-12
   maintenance window, confirm no catalog admin is editing, repeat the baseline
   checks, then create a fresh encrypted logical backup immediately before
   applying `017`, `017a`, and `018`-`026`. Verify its manifest and restore
   gate. This is the
   primary rollback source for the migration window. The time-bounded Owner
   decision below permits same-device encrypted custody during P-12 through
   P-15; it does not waive this fresh capture, restore, checksum, or sign-off.
3. **Post-migration checkpoint:** after `017`, `017a`, and `018`-`026` and the
   immediate P-12 ledger, identity, ownership, ACL, RLS, advisor, BOQ, Factor F,
   and disabled-flag verification pass, create the post-migration
   application-only logical backup/manifest while all Phase 4 flags remain
   disabled and before requesting P-13 deployment.
4. **Post-publication checkpoint:** after a separately approved P-15
   publication passes pointer, count, hash, Excel/PDF, and BOQ regression
   checks, create the final post-publication logical backup/manifest. As the
   first post-P-15 closeout action, copy that encrypted package to an
   independent Owner-controlled failure domain, verify its checksum, and
   record custody. Post-P-15 closeout remains incomplete until this succeeds.

Here, snapshot means an encrypted logical backup with a manifest. It is not a
Local database copy or reset. A platform snapshot may supplement this plan only
when its restore path and cost are separately approved.

The same-device acceptance expires at the earlier of:

1. the start of the post-publication checkpoint after separately approved P-15
   verification; or
2. seven days (168 hours) after the recorded P-12 execution start timestamp.

If a planned pause will exceed 24 consecutive hours, create and
checksum-verify an encrypted independent copy of the latest verified rollback
package before the pause. If an unplanned pause reaches 24 hours, stop before
any further gate and complete that copy before resuming. An early copy does not
waive the final post-publication backup/copy/checksum/custody gate. If the copy
cannot be completed, rollout remains stopped; there is no automatic extension.

The post-Phase-4 DR follow-up is recorded separately in the
[Decision Register](./19-phase4-decision-register.md) and
[Post-Phase-4 DR Backlog #42](./42-phase4-post-phase4-disaster-recovery-backlog.md).
It is not a P-12 blocker and does not expand the application-only backup scope
for `017`, `017a`, and `018`-`026`.

### C. Managed residual disposition

Owner disposition recorded 2026-07-28:

- [x] Accept the seven currently `authenticated`-callable guarded
  `SECURITY DEFINER` functions for the P-12 through P-15 release sequence.
  Retain `anon` denial, the current active-role/ownership/target/self guards,
  and the unexposed `private` schema. Compare fresh advisors after migration
  and stop on any new or untriaged finding. Review and minimize
  `get_user_role(uuid)`/`is_admin(uuid)` after Phase 4 with new RLS/regression
  evidence before any replacement.
- [x] Accept disabled leaked-password protection for P-12 and P-13 only under
  the current Supabase Free plan. It is a separate Auth configuration
  opportunity, not a defect in migrations `017`-`026`. P-14 remains blocked
  until the Owner either approves a separate plan/upgrade and enablement or
  explicitly accepts the P-14/P-15 residual after reviewing available
  compensating controls. This decision authorizes no Auth change or P-13/P-14
  action.
- [x] Accept the unused `v_row_count` assignment as low-risk managed
  code-quality debt. Do not change accepted migration `021` or add migration
  SQL to `026` solely to remove it; remove it with the next substantive replacement
  of `catalog_placement_state`. This historical lint disposition authorizes no
  other migration; `026` remains limited to the separately reviewed
  helper-callability correction.
- [x] Owner accepts the single-device-loss residual only from the start of an
  explicitly approved P-12 execution through completion of separately approved
  P-15 publication verification. The decision permits encrypted same-device
  custody during that bounded sequence, but does not turn the readiness
  rehearsal into the final rollback source or waive any fresh backup,
  restore/checksum, manifest, or sign-off gate. The residual expires at the
  earlier of the post-publication checkpoint or seven days (168 hours) after
  the recorded P-12 start. The 24-hour pause rule above applies, and the
  encrypted external copy, checksum verification, and custody record required
  in the frozen timeline must be completed without an implied extension.

The checked custody row records the Owner's explicit 2026-07-27 decision and
its 2026-07-28 absolute-limit amendment. The first three checked rows record the
Owner's 2026-07-28 managed-residual decisions. These decisions close only their
PRE-P-12 decision rows; they do not approve P-12 or any Production access or
write.

### D. Executor and window proposal

The first dirty-tree, rehearsal-only CLI kit used a disposable, loopback-only,
network-isolated PostgreSQL 17 database. It committed `017` and recorded its
ledger row only there, then correctly stopped after `017` because the
private-function default ACL was absent. It did not start `018`; no
`018`-`025`, Local migration, or Production action occurred. This is diagnostic
evidence, not exact-path acceptance. Migration `018` creates twelve private
`SECURITY DEFINER` helpers without explicit per-function revokes and grants
`authenticated` `USAGE` on schema `private`; absent an effective global
default denial, those helpers inherit `PUBLIC EXECUTE`. Production has not
received `017`, and the Production Data API does not expose `private`, so this
finding has not introduced Production exposure; the reviewed ACL and
defense-in-depth contract still fails. Do not edit reviewed `017` or `018`,
weaken the verifier, or continue that disposable sequence.

- [x] Owner selected Option B for repository design/implementation and review
  on 2026-07-28 under
  [Private-Function Default-Privilege Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md):
  a separate bridge migration ordered immediately after `017` and before
  `018`. An after-`025`-only
  correction is unsafe because the twelve helpers would already have inherited
  `PUBLIC EXECUTE`. This selection authorizes only the repository candidate;
  it is not P-12 or Production approval.
- [x] Record the bridge filename:
  `017a_master_catalog_phase4_global_function_default_privileges.sql`.
- [x] Record the bridge ledger version/name:
  `20260728001730_master_catalog_phase4_global_function_default_privileges`.
- [x] Record the bridge SHA-256:
  `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`.
- [x] The 2026-07-28 bridge decision did not reserve `026`. P-47 now assigns
  `026` only to the later, distinct P-46 formatter-callability correction; it
  does not replace `017a`.
- [x] Record P-47 candidate
  `026_master_catalog_phase4_catalog_action_error_acl.sql`, ledger
  `20260729002600_master_catalog_phase4_catalog_action_error_acl`, SHA-256
  `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`,
  ordered after immutable `025`. This records repository candidate identity,
  not Local or Production approval.
- [x] Historical Finding #43 bridge-only positive ACL and post-`025` negative
  fail-closed SQL proofs passed on PostgreSQL 17.10 and exact Supabase
  PostgreSQL 17.6 under disposable `--network none`/read-only containers. This
  is not `026` execution evidence and is not the required CLI pass 1/contract/
  pass 2 evidence.
- [x] Independent review of the selected `026` migration and
  architecture/security/source amendments reconciled every finding and passed
  the final repository/static checks: full 38 files/287 tests, focused 73/73,
  TypeScript, full lint, script syntax, authority 710/65/17, exact `026` hash,
  diff hygiene, and independent re-reviews. This result does not authorize Git,
  Local reset/application, disposable execution, or Production.
- [x] P-44 exact reviewed bridge-aware 23-file content freeze completed at
  clean pushed `ed94c0304be2741217c7ea2c36322b426de1dfe5`, with
  `Vercel=success`, no PR-triggered GitHub Actions run, no P-12 GO marker, and
  no PR.
- [x] P-45 completed at exact clean pushed/upstream-equal
  `d92d8ced42fc882481ebc2c4579adcf1edbebea7`; this is historical P-46
  execution identity, not the future kit source.
- [x] P-46 ran once and failed closed after `025`; the authorization is
  consumed. External evidence is preserved; the residual Local evidence draft
  remains intentionally unclean.
- [x] P-47 repository-only implementation/static scope is authorized.
- [x] P-48 authorizes exactly one commit/push from base `d92d8ce` on
  `codex/master-catalog-phase4`, using the Decision Register's exact 25-file
  allowlist and commit message `Close P-47 helper ACL correction`. No PR;
  `files/`, `tmp/`, `output/`, and unrelated untracked paths are excluded.
- [x] P-48 executed exactly once at replacement clean pushed/upstream-equal
  **source/tooling HEAD**
  `7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`; the commit contains the exact
  25-file allowlist, no PR, and no protected/unrelated untracked path. Truthful
  exact-head Remote status is `Vercel=success`, with zero PR-triggered GitHub
  Actions runs; no GitHub Actions lint/test/build run is claimed.
- [x] Owner authorized the exact post-P-48 Checklist-only status checkpoint
  recorded above: base/source HEAD `7fbfe1bb8f71df03a78762b00e93aded7bdd6e42`,
  this file only, one commit/push, exact message
  `docs: record p48 source freeze`, and no PR. This is Git-only authority and
  does not authorize the Local gate below.
- [x] The post-P-48 status checkpoint completed at exact
  pushed/upstream-equal `28673b39962a092472c2334843e95aaafdfce97b`;
  its truthful Remote record is `Vercel=success`, with no PR, zero
  PR-triggered GitHub Actions runs, and no GitHub Actions lint/test/build claim.
- [x] After the explicit destructive-reset warning, the Owner authorized
  exactly one canonical Local bootstrap at replacement HEAD `7fbfe1b`
  (`009`-`015`, hotfix `016`, `017`, `017a`, `018`-`026`) plus the reviewed
  consolidated smoke/security/business invariants. Its exact Checklist-only
  authorization checkpoint completed at pushed/upstream-equal
  `fbd0d3ca43eee69f1543731efa7832ef72de99d9`.
- [ ] Complete and verify that one Local gate:
  `RESET AUTHORIZATION CONSUMED — PARTIAL GATES PASSED — STOPPED AT LINT`.
  Bootstrap through `026`, WP-7, WP-6.5, and canonical proof passed from the
  dedicated `7fbfe1b` checkout. Error-level DB lint returned exit code `1`;
  raw output was intentionally not persisted, final invariants were not run,
  and the package was not completed. No retry, cleanup, patch, ad hoc SQL, or
  second reset occurred.
- [x] After that fail-closed report, the Owner authorized only the exact
  read-only lint diagnosis recorded above, subject to its separate
  Checklist-only commit/push from `fbd0d3c`.
- [x] Execute and classify that lint diagnosis:
  `CONSUMED — EXACT FROZEN KNOWN FINDING — UNKNOWN FINDINGS 0`. The one
  authorized command ran from source `7fbfe1b` under authority checkpoint
  `79e4f922`; it emitted only the documented
  `private.place_catalog_items_impl` / `pg_temp.catalog_placement_input`
  analyzer finding. The `--fail-on none` exit code `0` is not a clean-lint or
  Local-gate-pass claim. Final invariants and Local-gate closeout remain
  separately unauthorized.
- [x] Owner authorized exactly one Checklist-only result checkpoint from
  `79e4f922`, changing this file only, with commit message
  `docs: record local lint diagnosis` and one push/no PR. This is status-only
  authority and does not authorize later Local execution.
- [ ] Only after the corrected Local gate passes, build one external kit at
  that source/tooling HEAD under later separate authorization and record its
  canonical manifest path/SHA-256, generator source SHA-256, runner source
  SHA-256, and `productionEligible=true`: `UNBUILT — UNBOUND — HOLD`.
  Reuse this exact kit for pass 1, pass 2, and Production; do not regenerate it
  at the later GO HEAD.
- [ ] Name the migration executor: `________________`.
- [ ] Name an independent verifier: `________________`.
- [ ] Confirm that the verifier is a named human distinct from the executor;
  self-verification is not accepted for P-12.
- [ ] Record the approved Production `session_user`, `current_user`, and
  object-owner role: `________________`.
- [x] Freeze Supabase CLI `2.107.0`, PostgreSQL major `17`, exact migration
  hashes, per-file transactions, database statement/lock timeouts, stop
  conditions, and fix-forward rollback procedure as recorded in
  [Package #39 section 4.1](./39-phase4-p12-production-readiness-package.md).
- [ ] Separately authorize the read-only derivation of the **new operational
  fingerprint** required as `catalogAuthorityFingerprintSha256` from the
  encrypted Production readiness snapshot's isolated restore or fresh
  in-window Production/restore evidence.
  It is not a recomputation or reuse of historical
  `sha256:ecd457c625c6eeb445607f30d374734c3e7ebd2a6d5489912f4c7ec42b3019a5`
  because the historical canonical SQL was not committed. Use only the formula
  frozen in CLI Execution Runbook #41 and the reviewed runner.
- [ ] Record `catalogAuthorityFingerprintSha256`:
  `UNCOMPUTED — HOLD`.
- [ ] Record the exact authorized query/evidence source:
  `UNRECORDED — HOLD`.
- [ ] Bind the same exact bare lowercase 64-hex value in the external
  Production approval before the source kit may be used in Production:
  `UNBOUND — HOLD`. `productionEligible=true` by itself records only a clean
  source/tooling worktree and is not authorization.
- [ ] After the P-47 replacement candidate is separately Git-published and
  frozen,
  run `calibrate-schema` one stage per manual invocation on a fresh disposable
  isolated PostgreSQL 17 target; preserve the recursively hash-bound
  `UNREVIEWED` pass-1 manifest chain in exact `016`, `017`, `017a`,
  `018`-`026` stage order.
- [ ] Have the named independent verifier compare the first-pass captures and
  freeze owner-only `0600`
  `conduit-boq/master-catalog-p12-schema-shape-contract/v3`. Replace free-form
  reviewer claims with the structured `githubReview` envelope bound to
  `cloudstellar/conduit-boq`, PR/review IDs and immutable URL, authenticated
  human login/type, `APPROVED` state, exact source HEAD, submission time,
  reviewed-payload SHA-256, and exact
  `P12_SCHEMA_REVIEW_V1 source=<40hex> kit=<64hex> pass1=<64hex> payload=<64hex>`
  marker. The reviewer must differ from pass-1 capture executor and migration
  executor.
- [ ] Before contract freeze, open the exact review in an authenticated GitHub
  session/API and confirm repository, review ID, named-human login,
  `APPROVED` state, exact source commit, unchanged PR head, exact marker, latest
  review for that HEAD, and no later dismissal/changes-requested review. The
  offline runner checks structure/hash/chronology only and does not authenticate
  GitHub.
- [ ] Run a second fresh full isolated rehearsal that matches every frozen
  pre/post schema fingerprint using the same source/tooling HEAD, kit, and
  contract. It must use fresh advisor hand-offs after each step and finish the
  transitive read-only final closeout. Do not invent, reorder, or skip a stage.
- [ ] Record and bind `schemaShapeContractSha256` in the external Production
  approval: `UNCREATED — UNREVIEWED — UNBOUND — HOLD`.
- [ ] Record and bind the pass-2 final closeout evidence-manifest canonical
  path/SHA-256 in the external Production approval and later committed Owner
  marker: `UNCREATED — UNBOUND — HOLD`.
- [ ] After pass 2 and before Owner approval, capture the fresh Production
  advisor baseline and bind its canonical path/SHA-256/timestamp in the
  external approval for step `017` only:
  `UNRECORDED — UNBOUND — HOLD`.
- [ ] Immediately before the GO decision, repeat the authenticated GitHub
  review check above and record `githubReviewCheckedAt` in the external
  `conduit-boq/master-catalog-p12-production-approval/v3` record. It must be
  after pass-2 completion and no later than `approvedAt`. Stop before GO-marker
  creation, Keychain access, or Production connection if the review is
  unavailable, mismatched, dismissed, superseded, or no longer targets the
  exact source HEAD.
- [ ] For each later step, require a fresh post-previous-step advisor artifact
  bound by its verifier sign-off; after `026`, require a fresh artifact bound
  by final closeout. Do not reuse the approval baseline for the whole sequence.

The fingerprint derivation must remain a separately authorized read-only query.
Until its value, source, and external approval binding are complete and
exact, a mechanically `productionEligible=true` source kit must not be used in
Production and P-12 must not be requested.

- [ ] Select and rehearse the exact execution path/account and client timeout;
  prove it handles the 394,076-byte `020`, records one remote ledger row per
  file, uses the same frozen `current_user` for `017`, `017a`, and
  `018`-`026`, and supports safe stop/cancel behavior. Default privileges are
  scoped to that executing role. Any identity or owner drift stops execution;
  do not improvise `ALTER OWNER` or ACL changes. SQL Editor/direct `psql` is
  not accepted merely because it can execute SQL. Do not use `db push`,
  `db pull`, or linked diff from this worktree.
- [ ] Record the after-each-file checks and final verification handoff:
  one ledger row, unchanged session identity, and the object ownership/ACL
  delta for objects created or replaced by that file. Also record the exact
  flag stage: before `017`, `catalog_admin_enabled`,
  `catalog_new_identity_enabled`, and `catalog_retirement_enabled` all absent;
  after `017`, `017a`, `018`, and `019`, only `catalog_admin_enabled` present
  and boolean `false`; after `020`-`026`, all three rows present and boolean
  `false`. Any boolean `true`, missing required row, or prematurely present row
  stops execution. Verify the transient absent global function-default ACL
  after `017`, exact owner-only global default plus owner-only-or-absent
  `public`/`private` schema defaults after `017a`, and no Phase 4 routine
  EXECUTE for `PUBLIC`, `anon`, or `service_role` from `017a` onward. After
  `026`, record the full owner/ACL/RLS inventory and prove all positive grants
  exactly match the reviewed migration postconditions.
- [ ] Record and rehearse one new canonical external evidence directory per
  invocation, owner-only permissions, and the free-space/media-health check.
  While the approved window has the full frozen postflight budget, the runner
  must attempt the bounded read-only after-state before any post-CLI
  evidence-file write and persist a captured after-state first. A missing
  complete `05-evidence-manifest.json` is uncertain. Require protected pending
  manifest verification and atomic rename as the last fallible publication
  operation; keep flags false, start no later file, and use the controlled
  reconciliation handoff. If the budget is already gone, no new Production
  query starts without separately authorized bounded read-only forensic
  reconciliation. This ordering reduces but cannot eliminate sudden
  evidence-medium failure.
- [ ] Propose the maintenance window: `________________`.

Preparing this record does not authorize the window.

## 3. P-12 request gate

Request P-12 only when every HOLD row in Package #39 is Ready:

- [x] Data API evidence attached.
- [x] Encrypted readiness backup and isolated restore passed.
- [x] Post-write non-force detach/read-only reopen/full checksum and Local
  service recovery passed.
- [x] Historical readiness-head `07d1d33` status recorded truthfully.
- [x] Time-bounded single-device-loss disposition and mandatory post-P-15
  external-copy closeout are recorded.
- [x] Guarded-definer, leaked-password, and `v_row_count` dispositions
  recorded.
- [x] Migration-stage flag expectations are frozen; live pre-`017` and
  after-each-file verification remains mandatory in the P-12 window.
- [x] Finding #43 Owner disposition selects Option B and freezes exact
  candidate filename, ledger version/name, SHA-256, and `017` -> `017a` ->
  `018` placement without changing reviewed migrations `017` or `018`.
- [x] P-43 records the honest-but-fallible independent-review trust model:
  structured authenticated GitHub human-review envelope plus two explicit
  human checks, offline hash/chronology validation, and no custom PKI. Account
  compromise, collusion/deliberate fabrication, and post-check review deletion
  remain accepted residuals for this scope; any need for malicious-operator
  resistance triggers signed attestations with independent key custody before
  Production.
- [x] Historical `017a` architecture/security/source review and P-44/P-45
  freeze passed; P-46 evidence is preserved.
- [x] Complete P-47 `026` independent architecture/security/source review and
  static checks; full 38 files/287 tests, focused 73/73, and all recorded
  independent re-reviews passed without database or Git action.
- [x] P-48 separately authorizes the exact 25-file Git publication commit/push
  from `d92d8ce`, with no PR and no later action inferred.
- [x] Replacement exact pushed/upstream-equal source/tooling SHA
  `7fbfe1bb8f71df03a78762b00e93aded7bdd6e42` and truthful exact-head Remote
  status are recorded: `Vercel=success`, with zero PR-triggered GitHub Actions
  runs and no PR; no GitHub Actions lint/test/build run is claimed.
- [x] Fresh explicit reset approval is recorded for exactly one corrected
  Local bootstrap and consolidated-invariant run through `026`, subject to the
  exact Checklist-only authorization checkpoint above.
- [ ] Execute and pass that corrected Local gate:
  `RESET AUTHORIZATION CONSUMED — PARTIAL GATES PASSED — STOPPED AT LINT`.
  Bootstrap/WP-7/WP-6.5/canonical proof passed; error-level DB lint returned
  exit code `1`, so final invariants and package closeout remain unexecuted.
- [x] Fresh Owner authority is recorded for one read-only Local lint
  diagnostic with no reset, SQL, mutation, cleanup, patch, or later-gate
  inference, subject to its exact Checklist-only checkpoint.
- [x] Execute and classify that diagnostic:
  `CONSUMED — EXACT FROZEN KNOWN FINDING — UNKNOWN FINDINGS 0`. The known
  `place_catalog_items_impl` temp-table analyzer limitation was the sole
  finding; the diagnostic exit code `0` reflects `--fail-on none`, not a
  clean-lint or corrected-Local-gate pass.
- [x] Fresh Owner authority is recorded for exactly one Checklist-only result
  checkpoint from `79e4f922`, changing this file only, one commit/push and no
  PR. It authorizes no final invariants or Local-gate closeout.
- [ ] Build and hash-bind the one clean source kit only after the new-HEAD
  Remote and corrected-Local gates and later separate authorization; complete
  pass 1, structured authenticated GitHub contract review, pass 2, and the
  transitive final closeout at that same source/tooling HEAD.
- [ ] Record the schema contract SHA-256, final pass-1 manifest path/SHA-256,
  pass-2 final closeout manifest path/SHA-256, and fresh post-pass-2 step-`017`
  advisor baseline path/SHA-256/timestamp.
- [ ] Repeat the authenticated GitHub review check immediately before GO and
  bind its `githubReviewCheckedAt`, immutable review URL/ID/login, reviewed
  commit, and contract SHA-256 in the external approval. The offline runner
  does not prove GitHub origin or non-repudiation.
- [ ] Named-human executor, distinct named-human verifier, exact
  path/account/client timeout/ledger behavior, `current_user`/object-owner
  role, ownership/ACL checks, and exact window recorded.
- [ ] New operational `catalogAuthorityFingerprintSha256` and its authorized
  query/evidence source are recorded exactly in this Checklist and bound to
  the external Production approval. Package #39 remains the frozen
  source-head control snapshot; historical `ecd457...` is not substituted and
  the clean kit is verified `productionEligible=true`.
- [ ] Owner receives a separate exact P-12 go/no-go request.
- [ ] Only after an explicit Owner GO and separate Git authorization, commit
  and push Checklist #40 as the sole net changed path from the source/tooling
  HEAD, record the descendant GO HEAD, reuse the source kit, and create the
  external `0600` approval bound to that GO HEAD and the committed authority
  hashes.

## 4. Explicit exclusions

Acceptance of this checklist does **not** authorize any further Production
access or write, including DDL/DML, reset, deployment, feature enablement,
catalog publication, Add/Supplement release, Factor F mutation, or hotfix `016`
changes. P-12, P-13, P-14, and P-15 remain separate sequential decisions.
