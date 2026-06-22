# Master Catalog Phase 4 Production Runbook

**Status:** Draft — execution requires explicit owner approvals
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Default posture:** Feature flag disabled; stop on any failed gate

## 1. Safety statement

This runbook is an execution checklist, not standing permission to change
Production. Implementation approval, Production migration approval,
application-deploy approval, feature enablement, and catalog publication are
separate decisions.

Never paste a migration into Production before confirming the reviewed file
fingerprint and current schema preflight. Never edit or delete a published
catalog to roll back.

## 2. Roles

| Role | Responsibility | May also be |
|---|---|---|
| Owner | Approves scope, Production window, and named catalog publication | Business approver |
| Executor | Runs migration/deploy/flag/publish steps and records evidence | Developer/admin |
| Verifier | Independently checks counts, security, UI, exports, and rollback | Different person where practical |
| Taxonomy reviewer | Approves AAA/TTT and row-level mapping | Domain engineer/data steward |
| Price authority | Confirms price basis and no unauthorized changes | Owner delegate |

## 3. Required artifacts

- [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)
- [Phase 4 Change Request](./09-phase4-change-request.md)
- [Code Dictionary](./10-phase4-structured-code-dictionary.md)
- [Reconciliation Report](./11-phase4-reconciliation-report.md)
- [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Lean Threat Model](./18-phase4-threat-model.md)
- [Decision Register](./19-phase4-decision-register.md)
- [Official Export Specification](./20-phase4-official-export-spec.md)
- [Verification Report](./13-phase4-verification-report.md)
- [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md)
- Reviewed migration SQL and file SHA-256
- Fresh logical backup manifest and tested restore log
- Approved runtime CI assets; `/CI/` source remains local-only

## 4. Stop conditions applying to every phase

Stop immediately when any of these occurs:

- current Production counts/invariants differ without explanation;
- a reviewed file fingerprint differs;
- backup or restore test is incomplete;
- reconciliation does not cover all 710 Production UUIDs;
- a Production price/name/unit changes during code-only rollout;
- a code maps to multiple identities or an identity duplicates inside a version;
- a published baseline identity/code history would be merged or rewritten;
- current pointer is missing, duplicated, or not the expected base;
- anonymous/non-admin access succeeds unexpectedly;
- migration, test, build, advisor, smoke, hash, or export gate fails;
- unexpected active admin activity or simultaneous catalog edit is detected;
- owner approval is absent for the next Production action.

## 5. Phase 4-0 — documentation and data decisions

1. Record owner approval of ADR-004 and implementation/local-rehearsal CR gate.
2. Review the 728-record reconciliation draft.
3. Resolve `ITEM-0131` / `ITEM-0139`: retain both distinct identities or retire
   the erroneous duplicate in the candidate; never merge UUID/history.
4. Correct/reject all 16 HDPE Crossing taxonomy conflicts.
5. Allocate approved treatment for 20 Production-only rows.
6. Keep 18 workbook-only rows deferred unless separate price authority exists.
7. Approve the complete AAA/TTT dictionary and allocation rules.
8. Approve parser, payload, error-code, and canonical-hash contract.
9. Approve database/security, threat, and official-export contracts.
10. Provide truthful publication metadata for legacy `2568.0.0`; do not invent
    an approval reference or effective date.
11. Confirm `/CI/` is excluded from commits and identify approved derivative
   fonts/logo assets.
12. Complete the Phase 4 verification template baseline section.

**Exit gate:** All documents have owner/reviewer decisions; no unresolved row
or taxonomy blocker.

## 6. Local foundation rehearsal

### 6.1 Refresh and restore evidence

1. Refresh a read-only Production schema/data snapshot using the approved
   process. Exclude password hashes, sessions, refresh tokens, OTP, MFA, and
   sensitive auth/audit payloads.
2. Record source counts and table checksums in the verification report.
3. Restore into the project-scoped Local Supabase environment.
4. Confirm the Local project identity and ports before running any SQL.
5. Confirm Local counts/checksums match the snapshot.

Use the installed Supabase CLI `--help` for exact current command syntax. Do not
guess CLI flags. Supabase's June 2026 self-hosted images default toward
Postgres 17; pin/rehearse the project's supported version and never point a new
major image at an incompatible existing data directory.

### 6.2 Rehearse additive migration

1. Start from a clean Local reset/bootstrap.
2. Apply reviewed Phase 4A migration(s) locally.
3. Verify all new tables, constraints, indexes, grants, RLS policies, functions,
   and triggers.
4. Confirm explicit Data API grants for required roles; new Supabase tables may
   not inherit automatic grants.
5. Confirm private-schema mutation functions are not exposed.
6. Backfill exactly 710 stable identities and legacy codes.
7. Backfill exactly 52 display categories or document the refreshed expected
   count.
8. Confirm pointer and legacy `is_default` mirror agree.
9. Run security and performance advisors.

### 6.3 Rehearse application workflow

With feature flag disabled by default:

1. Deploy/run the Phase 4 application locally.
2. Clone `2568.0.0` to draft `2568.1.0`.
3. Assert all 710 name/unit/material/labor/unit values are identical.
4. Apply approved code/category decisions; K fields must remain absent.
5. Test one manual add, edit, retire, and recode with reasons.
6. Test Full and Supplement imports.
7. Test duplicate request ID, stale lock version, stale base pointer, invalid
   price delta, invalid identity/code reuse, and unauthorized role.
8. Verify item history across a recode.
9. Publish in Local, generate Excel/PDF, and compare count/hash.
10. Test audited pointer restore and verify historical BOQs are unchanged.
11. Rebuild from a clean Local reset and repeat the critical path.

### 6.4 Repository gates

Run and record:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run audit:prod`
- database/security tests
- desktop/mobile browser QA
- Excel/PDF visual and hash verification

**Exit gate:** Rehearsal and fresh reset both pass; no unresolved advisor or
regression blocker.

## 7. Production preflight — read only

Run immediately before the approved window and record exact output:

```sql
select count(*) as price_rows,
       count(distinct item_code) as distinct_codes,
       count(*) filter (where item_code is null or btrim(item_code) = '') as missing_codes,
       count(*) filter (where item_name is null or btrim(item_name) = '') as missing_names,
       count(*) filter (where unit is null or btrim(unit) = '') as missing_units,
       count(*) filter (where material_cost is null or labor_cost is null or unit_cost is null) as missing_costs,
       count(*) filter (where unit_cost is distinct from material_cost + labor_cost) as unit_cost_mismatches
from public.price_list;
```

```sql
select v.version_string, v.status, v.is_default, d.version_id
from public.price_list_default_version d
join public.price_list_versions v on v.id = d.version_id;
```

Expected baseline at document preparation: 710 rows, 710 codes, zero missing or
mismatch rows, and one `2568.0.0` active/default pointer. Live approved changes
must be reconciled; never force a stale expectation.

Also verify:

- migration ledger matches repository history;
- no Phase 4 object already exists unexpectedly;
- all current RLS/security invariants from Phase 1B remain intact;
- no catalog/Factor F change is scheduled during the window;
- no unexpected active admin session is editing catalog data.

## 8. Backup gate

1. Create an encrypted logical schema/data backup immediately before migration.
2. Create a manifest with timestamp, source project, included tables, excluded
   auth fields, row counts, and SHA-256 fingerprints.
3. Restore the backup into clean Local and run critical checks.
4. Record backup location by reference; do not commit secrets or production
   dumps.
5. Owner/executor/verifier sign the backup gate.

No verified restore means no Production migration.

## 9. Production Phase 4A — additive database migration

### Before execution

- Confirm explicit owner approval for this migration window.
- Confirm reviewed migration filename and SHA-256.
- Confirm feature flag remains disabled.
- Set bounded `lock_timeout` and `statement_timeout` inside the reviewed SQL.
- Confirm whether any concurrent index statement must run outside a transaction.

### Execute

1. Apply the reviewed additive migration through the approved Supabase path.
2. Do not modify the SQL interactively except to stop safely.
3. Record tool, executor, start/end time, result, and remote migration ledger ID.

### Immediate verification

- New tables/columns/constraints/indexes match the reviewed schema.
- RLS enabled on every new `public` table.
- Required `authenticated` grants exist; `anon`/`PUBLIC` writes do not.
- Backfill covers exactly 710 identities and legacy codes.
- No duplicate version/code or version/identity pairs.
- Current `2568.0.0` pointer and current application behavior are unchanged.
- `is_default` mirror equals the singleton pointer.
- Existing BOQ counts/version links are unchanged.
- Security/performance advisors have no new blocker.

If a post-commit issue exists, keep the flag disabled and forward-fix with a
new reviewed migration. Do not edit the applied migration file.

## 10. Production application deployment

1. Confirm CI passed on the exact deployment commit.
2. Deploy the compatible application with Phase 4 flag disabled.
3. Smoke current Dashboard, Price List, BOQ list/search/create/edit/duplicate,
   print “แบบ ปร.1”, and exports.
4. Confirm labels/metrics outside approved Phase 4 UI are unchanged.
5. Confirm no browser console/server error and no secret in client bundles.
6. Run active-admin Phase 4 read smoke while the feature remains hidden from
   ordinary users.

On failure, revert the application deployment. The additive database schema is
left in place and the feature flag stays disabled.

## 11. Feature enablement

1. Obtain explicit owner approval.
2. Enable for active admins only.
3. Verify route/menu authorization, empty/loading/error states, responsive UI,
   keyboard/focus behavior, and NT CI assets.
4. Create and discard a test draft; do not move the Production pointer.
5. Verify non-admin users cannot access admin data/actions.

Disable the flag immediately if any smoke test fails.

## 12. Candidate preparation and publish gate

1. Clone current `2568.0.0` into `2568.1.0`.
2. Run the 710-row preservation assertion before applying codes.
3. Apply the approved reconciliation only.
4. Confirm Full/Supplement mode and row outcomes.
5. Review diff totals for add/update/retire/recode/price.
6. For Full import, confirm every omission. If retirement count reaches
   `max(10, ceil(2% of active base))`—15 for 710 rows—match the typed count and
   stored owner approval reference.
7. Require price-change total = 0 for this rollout.
8. Complete approval reference, approval document date, effective date,
   physical archive reference, reason, and approver.
9. If import was used, have the verifier independently hash the filed source
   workbook and match the recorded client-computed fingerprint.
10. Confirm expected lock version and current pointer/base match.
11. Generate pre-publish verification preview.
12. Obtain explicit owner approval to publish exactly `2568.1.0`, including
    any mass-retirement total.

## 13. Publish and immediate closeout

1. Execute publish once with a new request ID.
2. Record result, item count, dataset hash, actor, and timestamp.
3. Verify one singleton pointer to `2568.1.0` and synchronized legacy flags.
4. Verify the prior version remains readable and immutable.
5. Generate official Excel and PDF from the published database version.
6. Reconstruct the Excel dataset hash from `ข้อมูลตรวจสอบ`; verify PDF
   generation rechecked and printed the same database item count/dataset hash.
7. Visually inspect stamp, page headers, Thai font, totals/numeric cells, and
   clipping.
8. Compute the final Excel and saved-PDF binary SHA-256 values, then record
   them separately from the canonical dataset hash.
9. File exports and physical approval/source evidence.
10. Create a post-publish logical backup and manifest.
11. Test existing BOQ edit/print/export and new BOQ creation.
12. Complete verification report and release note.

## 14. Rollback and recovery

| Situation | Response |
|---|---|
| Migration fails before commit | Transaction rolls back; stop and investigate |
| Additive schema issue after commit | Flag disabled; reviewed forward-fix migration |
| Application regression | Revert deployment; schema remains compatible |
| Feature-only UI issue | Disable feature flag |
| Candidate validation fails | Keep draft; correct through audited change; do not publish |
| Publish fails in transaction | No pointer change; inspect request/result and retry only when safe |
| Published version is business-invalid | Audited pointer restore to prior published version; create correction version |
| Export hash mismatch | Do not distribute; investigate canonicalizer/export and regenerate |

Pointer restore must:

- accept request ID, reason, and target published version;
- lock and update pointer plus legacy `is_default` mirror atomically;
- append a restore change set;
- leave published rows and historical BOQs untouched.

## 15. Closeout evidence

- Completed [verification report](./13-phase4-verification-report.md)
- Completed [release note](./16-phase4-release-note-template.md)
- Migration/deployment identifiers and file/commit fingerprints
- Pre/post row counts and invariant results
- Advisor results and accepted exceptions
- Feature flag and pointer final state
- Official Excel/PDF names, hashes, and physical file references
- Full-import retirement count and owner approval reference, when threshold
  applies
- Pre/post logical backup manifests
- Owner/executor/verifier signatures
