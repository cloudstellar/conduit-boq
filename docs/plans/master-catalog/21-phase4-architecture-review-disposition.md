# Phase 4 Architecture Review Disposition

**Status:** Owner-approved supporting disposition record; Revision 8 and the
contract suite remain the implementation authority

**Prepared:** 2026-06-22

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation. Accepted findings are already reflected in Revision 8 or the
contract suite; rejected findings require no further action unless new evidence
appears. This record prevents the external review from becoming shadow
authority and does not authorize Production migration, deploy, feature
enablement, or publication.

**Reviewed input:** External `review_01_architecture_plan.md` for Architecture
Plan Revision 7

**Resulting authority:**
[Architecture Plan Revision 8](./08-phase4-architecture-ci-plan.md)

## 1. Purpose

This document records which independent-review findings were accepted,
clarified, or rejected and why. It prevents an external review from becoming
implementation authority merely because it is detailed or confidently worded.

No finding below authorizes implementation or a Production change.

## 2. Evidence used

- Current repository migrations, application code, installed dependencies, and
  the complete Phase 4 contract suite
- Read-only Production Supabase MCP evidence on 2026-06-22
- Supabase's current JavaScript `getClaims()` and RLS/security-definer guidance
- Local visual inspection of the supplied NT CI font/usage pages
- CSV import/inspection of the 728-record reconciliation draft after correction

Read-only Production evidence relevant to disputed findings:

- `catalog_admin_enabled` does not exist yet;
- `private` schema does not exist yet;
- `public` currently contains 12 security-definer and 4 invoker/default-invoker
  functions;
- `app_settings.value` stores `restrict_email_domain` as JSON boolean;
- PostgreSQL `jsonb_typeof('false'::jsonb)` is `boolean`, while
  `jsonb_typeof('"false"'::jsonb)` is `string`.

## 3. Disposition of “must fix” findings

| Review finding | Decision | Revision 8 action and reason |
|---|---|---|
| `catalog_admin_enabled` incorrectly called existing | **Accepted** | Changed to a new row in the existing table. This is a factual correction and prevents migration code from assuming the row exists. |
| Public invoker/private definer wording differs from current functions | **Accepted as clarification, not architecture defect** | Section 7.1 is now labeled Phase 4 target. Current legacy functions remain out of scope; new catalog functions follow the safer private-definer boundary. |
| Published immutability is not implemented today | **Accepted as clarification, not architecture defect** | Section 4.5 is now labeled post-Phase 4A target. The current-state section already said it was missing, but the new label prevents isolated quotation from being misleading. |
| `merge_duplicate` has no audit semantics | **Accepted with a safer resolution** | Removed identity merge completely. Both published baseline rows keep distinct UUIDs; an erroneous duplicate is retired in a later version. This preserves unique constraints and historical BOQ lineage. |
| `display_order` source is unclear | **Accepted** | Legacy order is the verified unique numeric suffix of `ITEM-####`; clones preserve it and new items append for draft allocation only. Physical/workbook row order is prohibited. P-18 V1 is accepted; amended WP-7.5 passed one reviewed new-identity batch while preserving inherited relative order, and P-33 accepted its bounded technical scope. Add/Supplement and publication remain held until WP-8/P-14 UX/release evidence rather than merely until technical Local evidence. |
| Structured-code exception could remain a checklist instead of a publish invariant | **Accepted** | WP-6.5 implements a publish-boundary guard that activates when canonical `AAA-TTT-NNN` rollout begins. The first structured-code version may keep only the approved active legacy `ITEM-0139` exception; any other active legacy `ITEM-####` row blocks publication, while an unchanged legacy-only clone remains a positive control. |

## 4. Disposition of “should specify” findings

| Review finding | Decision | Revision 8 action and reason |
|---|---|---|
| Stale draft “explicit reconciliation” undefined | **Accepted; amended by P-39R** | Phase 4 Core has no rebase. Inspect and audited-abandon the stale attempt, then create a new draft from Current and deliberately reapply approved changes; the abandoned snapshot/history remains immutable. |
| Large retirement has no threshold | **Accepted** | Defined as `max(10, ceil(2% of active base))`; 15 rows at the 710-row baseline. Exact typed count and owner reference are required. This catches a likely wrong Full source without blocking one correction. |
| Archive workflow undefined | **Accepted by deferral** | Core exposes no archive transition. Former current remains Published/Active; pointer identifies Current. Archive mutation waits for a retention/visibility contract. |
| Shortened hash length undefined | **Accepted** | Standardized on `sha256:` plus first 12 hex characters and `…`; it is a human cross-check only and the full hash remains authoritative. |
| Publish lock type unspecified | **Rejected as already specified** | The [Database Contract](./17-phase4-database-security-contract.md) already requires a transaction-scoped advisory lock plus pointer/version row locks in fixed order. Duplicating the full lock algorithm in every overview would create drift. |
| No persistent `previewing` import status | **Clarified; no new status added** | Browser preview is transient. Server validation records `validated`/`rejected`; a separate idempotent apply request transitions once to `applied`. A persistent progress state would add no value without upload/background processing. |

## 5. Other factual and scope corrections

| Review statement | Disposition | Evidence/reason |
|---|---|---|
| `getClaims()` is absent from the current SDK | **Rejected — factually incorrect** | Installed `@supabase/auth-js` exposes `getClaims()` and current Supabase documentation recommends it over `getUser()` when a fresh user record is unnecessary. Revision 8 states the exact use. |
| Migration `'false'` means a JSON string | **Rejected — factually incorrect** | With a JSONB target, `'false'` is JSON boolean. JSON string false requires `'"false"'::jsonb`. Revision 8 uses the explicit cast to remove doubt. |
| Production has only one invoker function | **Rejected as incomplete** | Production catalog inspection found four functions with `prosecdef = false`; only one is explicitly declared `SECURITY INVOKER`, while invoker is also PostgreSQL's default. This does not alter the Phase 4 target design. |
| Concurrent-admin and 750 KB tests are missing | **Rejected at suite level** | They already exist in the Threat Model, Parser Spec, and Verification Report. Revision 8 keeps references rather than duplicating every detailed fixture in the overview. |
| Typography/spacing/fallback is underspecified | **Partly accepted** | Added a lean application token baseline and Tailwind v4 semantic-token rule. NT color/font/logo rules come from CI; numeric sizes/spacing are explicitly labeled application proposals, not CI-mandated measurements. |
| Font fallback can be omitted because app is internal | **Rejected** | Thai-readable fallback and `font-display: swap` are low-cost resilience/accessibility controls even for an internal app. |
| NT font supports tabular numerals | **Unverified; retained as acceptance gate** | CI confirms NT Regular/Bold but supplied material does not prove the `tnum` feature. The UI requests tabular numerals and visual QA must verify actual alignment/fallback. |
| 710 rows do not justify a load-test subsystem | **Accepted** | No load-test platform or server pagination is added. Existing measured payload thresholds and browser/regression checks are proportionate. |
| Single authorized publisher is acceptable for v1 | **Accepted subject to owner approval** | Current scope uses real external approval evidence and one active-admin publish path. Maker-checker remains a future decision if roles/compliance change. |

## 6. Additional consistency decisions made during disposition

- Clone creates one change set and no 710 false `add` item events.
- Full-import validation and apply use separate request IDs.
- Reconciliation CSV placeholder changed to
  `duplicate_treatment_pending_owner`; final outcome must become `retain` or
  `retire`.
- The reconciliation CSV remains 728 records/27 columns and its SHA-256 was
  refreshed in the report.
- CI PDFs remain local and unchanged; numeric application tokens are proposed
  implementation controls, not extracted brand measurements.

## 7. Conclusion

### 7.1 2026-07-28 new-evidence disposition

Finding #43 is new evidence after the original disposition: PostgreSQL's
schema-scoped default privilege cannot revoke the global function
`PUBLIC EXECUTE` default, and the canonical Supabase baseline also carries an
additive `public` function default for `service_role`.

The Owner selected Option B for repository-only implementation. Architecture
review accepts a separate forward bridge after `017` and before `018`, using
the same `postgres` owner and explicit global plus `public`/`private` default
revokes. This preserves the existing private-definer/public-facade boundary and
turns an omitted future grant into a fail-closed application error. It avoids
rewriting reviewed migrations and avoids introducing a dedicated role/DDL
framework whose lifecycle cost is not justified at the current scale.

This disposition is conditional: exact source/hash/ledger, stage-aware runner
checks, independent security review, and two fresh isolated rehearsals must
pass. It is not P-12 GO and authorizes no Local reset, Production migration,
deployment, flag enablement, publication, Factor F change, or hotfix.

### 7.2 2026-07-29 PRE-P-12 review-identity disposition

P-43 accepts the existing authenticated GitHub review surface rather than a
custom signing/PKI subsystem. Schema-contract v2 binds one immutable PR-review
envelope to the exact source HEAD, kit, pass-1 evidence, reviewed payload,
authenticated human login, approved state, and review time. The runner stays
offline and verifies only canonical structure, hashes, identity equality, and
chronology; a distinct human must check the review while authenticated before
contract freeze and again immediately before GO.

This is proportionate to the accepted honest-but-fallible operator model and
avoids new private-key custody, rotation, recovery, and revocation debt. It does
not claim non-repudiation or malicious-operator resistance. Account compromise,
collusion/deliberate fabrication, and review deletion after the final check are
explicit residuals. If those threats enter scope, the architecture must stop
and add independently custodied signed attestations before Production.

P-43 also reconciles execution order: independent review/static checks;
separately authorized source commit/push; exact new-HEAD Remote status;
separately authorized one corrected Local bootstrap; kit; pass 1; authenticated
human contract review; pass 2; remaining gates; separate P-12 GO; then a
separately authorized Checklist-only GO commit. This amendment authorizes only
working-tree authority/tooling alignment.

The independent review's top-level conclusion is accepted: the Phase 4
architecture has no fundamental showstopper and does not require redesign.
Revision 8 resolves the useful ambiguities without adding Storage, a workflow
engine, background processing, paid branches, identity merging, or archive UI.

The review itself is not implementation authority. Revision 8, ADR-004, the
Database/Security Contract, Parser/Hash Spec, Threat Model, Decision Register,
and Official Export Spec must be read together according to the
[Review Guide](./00-phase4-review-guide.md).

## References

- [Supabase JavaScript `getClaims()`](https://supabase.com/docs/reference/javascript/auth-getclaims)
- [Supabase Row Level Security and private security-definer guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Architecture Plan Revision 8](./08-phase4-architecture-ci-plan.md)
- [Database and Security Contract](./17-phase4-database-security-contract.md)
- [Parser and Canonical Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md)
- [Phase 4 Verification Report](./13-phase4-verification-report.md)
