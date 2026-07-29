# Phase 4 Post-Phase-4 Whole-Service Disaster-Recovery Backlog

**Prepared:** 2026-07-28

**Status:** BACKLOG ONLY - not authorized, not a PRE-P-12 blocker, and not part
of the P-12 through P-15 execution scope

**Current service plan assumption:** Supabase Free plan. Reconfirm the actual
plan and available platform recovery features before implementing any item.

## 1. Purpose and authority boundary

This backlog records the work needed to evolve the reviewed application-only
backup design into a whole-service disaster-recovery capability after the
Phase 4 P-15 closeout, or under separately approved work if the rollout is
abandoned.

The PRE-P-12 readiness rehearsal; fresh pre-migration P-12 rollback package;
post-migration application-only backup/manifest after verification of `017`,
`017a`, `018`-`025`, and targeted ACL correction `026` and before P-13; and
post-publication P-15 checkpoint remain governed by:

- [Production Runbook #12](./12-phase4-production-runbook.md);
- [P-12 Readiness Package #39](./39-phase4-p12-production-readiness-package.md);
  and
- [P-12 Owner Decision Checklist #40](./40-phase4-p12-owner-decision-checklist.md).

Those application-only backups protect the reviewed `public` and `private`
database scope. They deliberately exclude Auth data and Storage object bytes
and therefore are not a whole-service disaster-recovery solution.

This document:

- does **not** block requesting or executing P-12 when Package #39 is otherwise
  Ready;
- does **not** alter the fresh pre-migration, post-migration, or
  post-publication backup obligations;
- does **not** defer the mandatory encrypted external-copy/checksum/custody
  closeout after P-15;
- does **not** authorize Production access, a database or Auth export, a
  Storage inventory, credential creation, configuration read/change, purchase,
  plan upgrade, restore, reset, migration, deploy, feature enablement, or
  publication; and
- does **not** authorize Local Supabase reset or reuse of a Production backup in
  a network-reachable test environment.

Every discovery, capture, transfer, configuration, and restore-drill step below
requires a separate Owner approval identifying its exact scope, executor,
independent verifier, window, destination, stop conditions, and evidence
handling.

## 2. Why this remains a separate backlog

Supabase documents that Pro, Team, and Enterprise projects receive platform
daily backups and recommends that Free-plan projects regularly export their
data with `supabase db dump` and maintain off-site backups. A database backup
does not contain the object bytes stored through the Storage API; it contains
only the related database metadata.

The current Phase 4 application backup is proportionate to migrations `017`,
`017a`, `018`-`025`, and `026`, which do not introduce an Auth or Storage
workflow.
Expanding the P-12 rollback package into an unreviewed Auth/Storage recovery
system would add credentials, sensitive identity data, new restore behavior,
and configuration dependencies during a frozen migration review. That
expansion belongs in a separately designed and rehearsed recovery workstream.

Official references:

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Migrating Auth users between Supabase projects](https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects)
- [Downloading Storage objects](https://supabase.com/docs/guides/storage/management/download-objects)
- [Restore to a new project](https://supabase.com/docs/guides/platform/clone-project)

## 3. Recovery-domain inventory

Do not infer Production state from Local `supabase/config.toml`, repository
searches, or the absence of an application Storage call. The first separately
approved task must capture a timestamped, read-only Production inventory.

| Recovery domain | Inventory required | Recovery concern |
|---|---|---|
| Application database | Schemas, tables, row counts, critical hashes, roles, grants, RLS, functions, triggers, extensions, migration ledger | Recreate authoritative catalog, BOQ, Factor F, audit, and private implementation state without silent drift |
| Auth data | User/identity counts and supported Auth-schema export/restore scope; no password hashes or personal data in ordinary evidence | Preserve or deliberately recreate user identities while handling sensitive hashes and schema dependencies |
| Auth sessions and signing material | Current signing-key/JWT model, session behavior, key rotation and forced-reauthentication procedure | A replacement project or signing-key change may invalidate existing sessions; reauthentication may be the safer recovery policy |
| Auth configuration | Providers, redirect URLs, email templates, SMTP references, password policy, rate limits, hooks, MFA posture | Database rows alone do not reconstruct hosted Auth behavior |
| Storage metadata | Bucket names/IDs, visibility, limits, policies, object count and total bytes | Database metadata is not the stored object content |
| Storage object bytes | Per-bucket object inventory, sizes, content checksums where feasible, and restore method | Deleted or missing bytes cannot be recovered from a database-only backup |
| Platform/application configuration | Data API exposed schemas, extra search path, Realtime, Edge Functions, webhooks, Cron, network/SSL settings, custom domains, environment-variable names | A database restore does not reproduce every hosted service or application dependency |
| Secrets and credentials | Secret-name inventory, owners, rotation/recreation procedure, and approved custody system | Secrets must be recreated or rotated without entering Git, chat, shell history, command arguments, manifests, or normal evidence |

The inventory evidence must contain only the minimum non-secret facts required
to design recovery. Direct personal contact data, password hashes, tokens,
private keys, SMTP passwords, API secret values, and backup passphrases must not
be copied into the evidence package.

## 4. Owner decisions and accountability placeholders

These values are intentionally unfilled. The 2026-07-28 approval to create this
backlog does not provide names, dates, targets, destinations, or budget.

| Decision | Owner-approved value |
|---|---|
| DR accountable owner | `________________` |
| Database/Auth data custodian | `________________` |
| Backup executor | `________________` |
| Independent restore verifier | `________________` |
| Independent encrypted failure domain/destination | `________________` |
| Encryption-key/passphrase custodian and recovery deputy | `________________` |
| Critical database RPO | `________________` |
| Critical database RTO | `________________` |
| Auth recovery RPO/RTO | `________________` |
| Storage recovery RPO/RTO, or documented zero-use posture | `________________` |
| Database backup cadence | `________________` |
| Auth backup cadence | `________________` |
| Storage object backup cadence | `________________` |
| Daily/weekly/monthly retention policy | `________________` |
| First approved Production inventory window | `________________` |
| First isolated whole-service restore drill | `________________` |
| Recurring restore-drill cadence | `________________` |
| Free-plan continuation or paid backup/PITR evaluation | `________________` |

RPO and RTO must be set by business impact and then validated by a timed restore
drill. Do not claim an RPO from an intended schedule or an RTO from an
untested procedure.

## 5. Backlog work packages

### DR-01 — Read-only Production inventory

Required output:

- actual Supabase plan and available backup/restore features;
- PostgreSQL and Supabase service versions;
- application schema, extension, role, ownership, grant, RLS, function,
  trigger, and migration-ledger inventory;
- Auth user/identity counts and configuration inventory without sensitive
  payloads;
- Storage bucket/object count and byte-size inventory;
- Realtime, Edge Function, webhook, Cron, Data API, network, and related
  platform-configuration inventory; and
- a classified list of secrets that require recreation or rotation, without
  their values.

Stop if the approved read-only method would emit a secret, password hash,
personal payload, or unsupported configuration field into evidence.

### DR-02 — Recovery objectives and retention policy

The Owner and data custodian must classify at least:

1. catalog, BOQ, and Factor F operational data;
2. audit and release evidence;
3. Auth identities and access continuity;
4. Storage objects, if any; and
5. hosted configuration and application secrets.

For each class, record:

- maximum tolerable data loss;
- target RPO;
- maximum tolerable outage;
- target RTO;
- legal/business retention need;
- deletion and expiry behavior;
- recovery priority; and
- accountable decision owner.

The retention design must account for accidental corruption that is discovered
after several backup cycles. It must also define how expired packages and
credentials are destroyed without deleting the only verified recovery copy.

### DR-03 — Recurring encrypted off-device database backup

Design and rehearse a Free-plan-compatible process that:

- uses a reviewed, version-frozen `supabase db dump`/`pg_dump` path;
- captures the approved database scope without changing Production;
- writes only to an encrypted destination outside Git and outside the
  Production device's failure domain;
- keeps the encryption secret in an approved credential store separate from
  the backup payload;
- records tool/server versions, source timestamp, schema scope, size,
  SHA-256 manifest, critical counts/hashes, and executor/verifier sign-off;
- verifies transfer completion at the independent destination;
- detects missed, stale, truncated, or checksum-invalid captures;
- follows the Owner-approved cadence and retention policy; and
- periodically proves restoration rather than treating a successful dump as a
  recovery test.

Do not place a database password in a connection-string argument, script,
environment file, scheduled-job definition, log, or manifest. The eventual
automation design must use an approved no-echo credential path and demonstrate
that process listings and logs do not expose it.

### DR-04 — Auth recovery and session policy

Auth recovery needs a separate security review because Auth exports may contain
user identities and password hashes.

The reviewed design must decide:

- whether the recovery target is the same project, a new Supabase project, or
  another supported isolated target;
- the supported Auth-schema export/restore method and its dependency order;
- whether existing JWT/signing material is restored, rotated, or deliberately
  replaced;
- whether all existing sessions are invalidated and users must reauthenticate;
- how providers, redirect URLs, email templates, SMTP, password policy, rate
  limits, hooks, and MFA settings are reconstructed;
- how administrator access is recovered without creating an untracked
  privileged account; and
- how Auth personal data and hashes are encrypted, retained, access-logged, and
  destroyed.

A plain PostgreSQL restore with UUID-only Auth stubs, such as the Phase 4
application-only rehearsal, is not proof of hosted Auth recovery. The Auth
workstream must include a separately approved isolated Supabase-compatible
login/session test with synthetic or specifically authorized recovery
accounts.

### DR-05 — Storage object-byte recovery

First record whether Production has zero or non-zero Storage buckets and
objects. If it is truly unused, record a timestamped zero-use baseline and add
a trigger requiring this backlog to be reopened before the first Production
Storage feature or object upload.

If Storage is in use:

- select a reviewed Supabase CLI or S3-compatible read/copy path;
- create an encrypted off-device copy of the object bytes, not only
  `storage.objects` metadata;
- capture bucket/object count, total bytes, per-object path/size, and content
  checksums where supported;
- preserve the matching bucket configuration and RLS/policy evidence;
- verify a restore into an isolated non-Production bucket;
- compare count, byte size, representative downloads, and checksums; and
- document handling of missing, overwritten, deleted, large, and private
  objects.

Do not generate long-lived S3 credentials or download private objects until a
separate Owner approval defines their exact custody and deletion procedure.

### DR-06 — Configuration and secret recreation

Create a versioned, non-secret recovery manifest for:

- Auth, Data API, Realtime, Storage, database, network, SSL, custom-domain,
  Edge Function, webhook, and Cron settings in actual use;
- required extensions and version constraints;
- application environment-variable **names** and their owning system;
- external integrations and callback/redirect dependencies; and
- secret rotation/recreation order.

The manifest may record where a secret is held and who may recover it, but not
the value. Restoring a database must not silently reuse service-role keys, JWT
signing material, SMTP passwords, S3 keys, or third-party credentials without
an explicit rotation/reuse decision.

### DR-07 — Isolated whole-service restore drill

The first full drill must use a separately approved non-Production target and
must not reset or write Production.

At minimum it must:

1. verify every backup manifest and checksum before restore;
2. restore the database in a reviewed dependency order;
3. reconstruct required non-secret platform configuration;
4. recreate or rotate secrets through approved custody;
5. prove Auth login, authorization, and the selected session/JWT policy with
   approved test accounts;
6. restore and download representative Storage objects when Storage is in use;
7. repeat catalog pointer/count/hash, BOQ, Factor F, audit, migration-ledger,
   RLS/grant, function, trigger, and Data API invariants;
8. run bounded application smoke tests without sending unintended email,
   webhook, or external side effects;
9. measure the actual recoverable point and elapsed recovery time; and
10. record gaps, cleanup, target deletion, and the next separately approved
    fix-forward rehearsal.

The drill passes only when the independent verifier can reproduce the
manifest-to-running-service evidence and the measured RPO/RTO meets the
Owner-approved objectives.

### DR-08 — Recurring operation and escalation

After the first drill passes, separately approve the operating schedule.
Recurring evidence should show:

- successful captures and off-device transfers;
- age of the latest verified package;
- checksum and retention status;
- failed or missed-job alerts;
- credential-expiry/rotation status;
- Storage inventory drift;
- periodic restore-drill results; and
- a review trigger when data volume, user count, business criticality, service
  configuration, or acceptable downtime changes.

Re-evaluate a paid Supabase plan, platform daily backups, or PITR when the
approved RPO/RTO cannot be met reliably with the reviewed Free-plan process.
A purchase or plan change remains a separate Owner decision.

## 6. Minimum evidence package

Each approved backup or drill must use a bounded evidence package containing:

- approval reference and exact scope;
- UTC/local timestamps and source project identifier;
- executor and independent verifier;
- non-secret tool/service versions;
- backup-domain and exclusion list;
- manifest/checksum and encrypted destination identifier;
- critical counts/hashes and configuration-diff result;
- measured RPO/RTO for a drill;
- stop/failure/retry record;
- credential-custody attestation without secret values; and
- cleanup and retention disposition.

Evidence must not include database credentials, backup passphrases, Auth tokens,
JWT/API secret values, password hashes, private object content, or direct
personal contact/payment identifiers.

## 7. Exit criteria

This backlog may be closed only after:

- all accountability and RPO/RTO placeholders are Owner-approved;
- the timestamped Production recovery-domain inventory is complete;
- recurring encrypted off-device database backup has passed at least one
  isolated restore;
- Auth recovery and the session/JWT policy have passed an isolated
  Supabase-compatible test;
- Storage zero-use is proven or object bytes have passed an isolated restore;
- non-secret configuration and secret-recreation procedures are complete;
- the whole-service drill meets the approved RPO/RTO;
- recurring cadence, retention, monitoring, and restore-drill ownership are
  operating; and
- the Decision Register and Progress Tracker record the separately approved
  implementation and closeout evidence.

Until then, describe the current protection accurately as a verified
**application-database readiness rehearsal**, not the final rollback source and
not whole-service disaster recovery. During a separately approved rollout, add
the fresh pre-migration P-12 rollback package, the post-migration
application-only backup/manifest after `017`, `017a`, `018`-`025`, and `026`
verification and before P-13, and the post-publication P-15 package. Copy the
latest verified package to an independent Owner-controlled encrypted failure
domain before any planned pause exceeding 24 consecutive hours; if an
unplanned pause reaches 24 hours, stop and complete the copy before resuming.
The same-device acceptance expires
at the earlier of the start of the post-publication checkpoint after separately
approved P-15 verification or 168 hours after the recorded P-12 start. An
early copy does not waive the final post-publication
backup/copy/checksum/custody gate.
