# Phase 4 Architecture Review Disposition

**Status:** Completed technical disposition — owner approval of Phase 4 remains
pending

**Prepared:** 2026-06-22

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
| `display_order` source is unclear | **Accepted** | Legacy order is the verified unique numeric suffix of `ITEM-####`; clones preserve it and new items append. Physical/workbook row order is prohibited. |

## 4. Disposition of “should specify” findings

| Review finding | Decision | Revision 8 action and reason |
|---|---|---|
| Stale draft “explicit reconciliation” undefined | **Accepted** | Phase 4 Core has no rebase. Create a new draft from Current and deliberately reapply approved changes; stale draft becomes read-only/nonpublishable. |
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
