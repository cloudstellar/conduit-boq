# Phase 4 P-12 Owner Decision Checklist

**Prepared:** 2026-07-26

**Status:** PRE-P-12 HOLD - collect the remaining readiness evidence only

**Exact application candidate:**
`5068f944af2aa3fe8446c77c8ae8d48673cb260b`

**Authority:** Production `2568.0.0` remains authoritative for item names,
units, and prices. The local workbook remains reconciliation/reference evidence
only.

## 1. Ready now

- [x] WP-8/P-37 Owner acceptance is recorded under the guided-UAT variance.
- [x] Exact application candidate passed 37 test files/239 tests, TypeScript,
  zero-warning lint, production build, desktop/mobile Browser smoke, and binary
  Excel verification.
- [x] Exact migration `017`-`025` manifest and Local clean-chain evidence exist.
- [x] Production read-only baseline, authority hash, migration ledger, BOQ,
  Factor F, RLS/grant/trigger inventory, and advisor baseline were captured
  without a Production write.
- [x] Phase 4 feature flags remain disabled.

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
location is a managed single-device-loss residual; prefer an encrypted
Owner-controlled external copy for the final pre-migration rollback source.
A post-write non-force detach/reopen checksum remains to be repeated after
Docker is intentionally stopped; it was not forced while Local Supabase was
active.

Alternative:

- [ ] Use a platform backup/clone only after its separate cost is confirmed.

The verified restore removes the backup-rehearsal blocker. P-12 remains HOLD
for the managed-residual, remote exact-head CI, executor/verifier, and exact
window decisions below.

#### Frozen backup/snapshot timeline

1. **Readiness rehearsal before requesting P-12:** create an authorized
   read-only encrypted logical backup from the current Production database,
   restore it into isolated non-Production PostgreSQL 17, and pass the critical
   count/hash/integrity checks. This proves the recovery process but is not the
   final rollback source.
2. **Final pre-migration backup:** inside the separately approved P-12
   maintenance window, confirm no catalog admin is editing, repeat the baseline
   checks, then create a fresh encrypted logical backup immediately before
   applying `017`-`025`. Verify its manifest and restore gate. This is the
   primary rollback source for the migration window.
3. **Post-migration checkpoint:** after immediate P-12 verification passes and
   while all Phase 4 flags remain disabled, create the post-migration logical
   backup/manifest before P-13 deployment.
4. **Post-publication checkpoint:** after a separately approved P-15
   publication passes pointer, count, hash, Excel/PDF, and BOQ regression
   checks, create the final post-publication logical backup/manifest.

Here, snapshot means an encrypted logical backup with a manifest. It is not a
Local database copy or reset. A platform snapshot may supplement this plan only
when its restore path and cost are separately approved.

### C. Managed residual disposition

Recommended disposition:

- [ ] Accept the seven authenticated-callable guarded definers for this release,
  retain their current authorization guards, and compare fresh advisors after
  migration.
- [ ] Handle leaked-password protection as a separate Auth configuration change
  before P-14, or explicitly accept it for the exact release window.
- [ ] Accept the unused `v_row_count` assignment as managed code-quality debt;
  do not change accepted migration `021` or add migration `026` solely to
  remove it.
- [ ] Accept the same-computer encrypted readiness backup as rehearsal evidence
  only, and require an encrypted external copy or an explicitly accepted
  single-device-loss residual for the final pre-migration rollback source.

### D. Executor and window proposal

- [ ] Name the migration executor: `________________`.
- [ ] Name an independent verifier: `________________`.
- [ ] Freeze Supabase CLI `2.107.0`, PostgreSQL major `17`, migration hashes,
  statement/lock timeouts, stop conditions, and rollback procedure.
- [ ] Propose the maintenance window: `________________`.

Preparing this record does not authorize the window.

## 3. P-12 request gate

Request P-12 only when every HOLD row in Package #39 is Ready:

- [x] Data API evidence attached.
- [x] Encrypted readiness backup and isolated restore passed.
- [ ] Security residual disposition signed.
- [ ] Executor, verifier, tooling, timeouts, stop conditions, and exact window
  recorded.
- [ ] Remote exact-head CI status recorded.
- [ ] Owner receives a separate exact P-12 go/no-go request.

## 4. Explicit exclusions

Acceptance of this checklist does **not** authorize Production DDL/DML, reset,
deployment, feature enablement, catalog publication, Add/Supplement release,
Factor F mutation, or hotfix `016` changes. P-12, P-13, P-14, and P-15 remain
separate sequential decisions.
