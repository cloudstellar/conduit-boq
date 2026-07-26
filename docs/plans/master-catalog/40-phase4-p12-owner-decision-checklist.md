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

- [ ] Authorize a read-only Dashboard/Management setting check proving that
  schema `private` is not exposed through the Production Data API.
- [ ] Attach the setting evidence to
  [Readiness Package #39](./39-phase4-p12-production-readiness-package.md).

This authorizes configuration inspection only, not a configuration change.

### B. Backup and isolated restore

Recommended low-cost path:

- [ ] Approve an encrypted logical `pg_dump`/`supabase db dump` to an approved
  secure off-repository location.
- [ ] Restore only into isolated non-Production PostgreSQL 17.
- [ ] Record manifest, hashes, table counts, restore result, credential
  custodian, and verifier without storing credentials in Git or evidence files.

Alternative:

- [ ] Use a platform backup/clone only after its separate cost is confirmed.

No verified restore means P-12 remains HOLD.

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

### D. Executor and window proposal

- [ ] Name the migration executor: `________________`.
- [ ] Name an independent verifier: `________________`.
- [ ] Freeze Supabase CLI `2.107.0`, PostgreSQL major `17`, migration hashes,
  statement/lock timeouts, stop conditions, and rollback procedure.
- [ ] Propose the maintenance window: `________________`.

Preparing this record does not authorize the window.

## 3. P-12 request gate

Request P-12 only when every HOLD row in Package #39 is Ready:

- [ ] Data API evidence attached.
- [ ] Encrypted backup and isolated restore passed.
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
