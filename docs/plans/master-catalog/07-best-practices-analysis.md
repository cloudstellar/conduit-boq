# Best Practices Analysis: Master Catalog Rollout

**Status:** Planning analysis for execution approval
**Date:** 2026-06-05
**Scope:** Master Catalog rollout, catalog versioning, Factor F preflight, and
future admin catalog UI direction

---

## Analysis Sources

This review applies the following practice sets to the current codebase and
Supabase MCP evidence:

| Practice set | Applied to | Key implications |
|---|---|---|
| Supabase/Postgres best practices | Schema, indexes, RLS, privileges, locking, bulk import, migration safety | Index FK/filter columns, keep transactions short, use constraints for invariants, revoke broad grants, verify RLS performance |
| Next.js best practices | Phase 2 application integration and future admin flows | Server Components for reads, Server Actions for UI mutations, Route Handlers only for external APIs, async params/cookies, error boundaries |
| Frontend app builder/product UI principles | Future Phase 4 admin catalog tools | Dense operational UI, table-first workflows, explicit preview/approval states, design system before implementation, browser/screenshot QA |
| Enterprise SaaS/catalog governance principles | Release process and auditability | Draft -> active -> archived lifecycle, immutable published versions, owner-approved promotion, complete audit trail |

The frontend app builder skill is intentionally not used to generate images in
this planning document because no new UI is being built in this phase. Its
dashboard/admin-tool rules are applied as future Phase 4 product requirements.

---

## Current Recommended Approach

Continue with the current phased architecture:

```text
P0 containment -> Phase 1A nullable catalog schema -> Phase 1A indexes
-> Phase 2 app integration -> Phase 1B hardening -> Phase 4 admin governance
```

This remains the strongest option because it minimizes blast radius while still
introducing proper versioned catalog identity.

Key design choices:

- `price_list_versions` stores immutable catalog versions.
- `price_list_default_version` is the singleton active-default pointer.
- BOQs store `price_list_version_id`.
- BOQ line items snapshot category and cost values.
- Active catalog versions are not edited in place.
- Factor F remains a separate read-only reference with a full-table integrity
  gate.
- Current baseline starts at `2568.0.0`, using `effective_be_year.revision.patch`.

---

## Alternatives Considered

| Option | Summary | Pros | Cons | Assessment |
|---|---|---|---|---|
| Do nothing | Keep one mutable `price_list` | No migration; fastest short-term | Historical BOQs can drift; no reliable catalog audit; future imports risky | Reject |
| BOQ-only snapshot | Store all item labels/prices on every BOQ and leave catalog mutable | Historical documents remain stable | No manageable active catalog version; duplicate data grows; hard to compare price-book revisions | Insufficient |
| Timestamped price history rows | Add valid_from/valid_to history to price rows | Good for temporal queries | Harder default selection, harder admin import UX, more complex item matching | Possible future layer, not first rollout |
| Versioned `price_list` with singleton pointer | Current plan | Clear default, stable historical BOQs, supports draft/promote, moderate migration risk | Requires phased DB/app rollout and gates | Recommended |
| Full event sourcing ledger | Every catalog edit is an event | Strongest audit model | Too complex before admin catalog workflow exists | Defer |
| Build a new catalog service | Separate bounded service/API | Clean separation | Highest blast radius, duplicated auth, cross-service consistency risk | Reject for this app size |

---

## Supabase/Postgres Review

### What The Current Plan Gets Right

| Best practice | Current plan alignment |
|---|---|
| Index WHERE/JOIN columns | `010a` creates indexes for `boq.price_list_version_id`, `boq_items.price_list_id`, `boq_items.boq_id`, and `price_list_audit_logs.version_id` |
| Index FK side | Separate concurrent index runbook follows the FK-index rule instead of relying on implicit FK indexes |
| Constraint-backed invariants | `UNIQUE (version_id, item_code)`, pointer validation, default-exists trigger, and immutable BOQ version trigger move critical rules into DB |
| Least privilege | P0 revokes unsafe RPC/table privileges and grants narrowly |
| RLS performance | Policies should wrap auth helpers in `SELECT` and require indexes on policy columns |
| Short transactions | P0/Phase 1A split and `010a` outside explicit transaction reduce lock contention |
| Safe constraints | Migrations use guarded DO blocks where PostgreSQL lacks `IF NOT EXISTS` for constraints |
| Bulk import | Future admin import should use batch insert/COPY-style workflows and preview before promotion |

### Remaining DB Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Production locks during DDL/backfill | Large table updates can block writes | Use execution window, lock/statement timeout, rehearsal, and short transactions |
| Missing or invalid indexes | Slow joins/RLS and slower hardening checks | Keep `010a` as mandatory gate and verify `indisvalid = true` |
| RLS helper functions called per row | Can degrade query latency as BOQ/catalog grows | Wrap auth calls in `SELECT`; index `created_by`, `assigned_to`, `department_id`, `sector_id`, and FK columns used in policies |
| SECURITY DEFINER drift | Unsafe RPCs can bypass RLS | Fixed `search_path = ''`, fully qualified tables, explicit `REVOKE`/`GRANT`, and verification queries |
| Retrying partial migrations | `ON CONFLICT DO NOTHING` does not repair wrong rows | Preflight assertions must fail if existing rows are wrong |
| Catalog data changed without version bump | Breaks auditability | ADR-003 operational rule: stop rollout/release if catalog data changed but version number did not |

---

## Next.js Review

### Recommended Phase 2 Integration Pattern

| Area | Recommended pattern | Reason |
|---|---|---|
| Catalog reads | Server Components for initial reads where possible | Avoid API round trips and client waterfalls |
| Editor/search interactivity | Client component receives version-scoped initial data or uses explicit server-backed search | Keeps UI responsive while preserving version filter |
| Mutations from app UI | Server Actions | Next.js preferred pattern for internal UI mutations and form submissions |
| External/admin import APIs | Route Handlers only when external access, file upload API, or webhooks require it | Avoid unnecessary internal REST layer |
| Async params/cookies | Await `params`, `searchParams`, `cookies()`, `headers()` in Next 15/16 style | Prevent future framework incompatibility |
| Error handling | Segment-level `error.tsx` and explicit fail-closed UI for catalog/factor lookup failures | Bad catalog state should be visible, not silent |
| Runtime | Default Node.js runtime | Supabase/admin import tooling may need Node-compatible packages |
| Middleware/proxy | Plan `middleware.ts` -> `proxy.ts` migration separately for Next.js 16 | Not a Master Catalog blocker, but should not be forgotten |

### App Integration Risks

| Risk | Mitigation |
|---|---|
| Client-side search accidentally queries all versions | Make `priceListVersionId` required and fail closed in `ItemSearch` |
| Data waterfall in edit/print pages | Fetch BOQ, version, routes/items, and Factor F references in parallel where possible |
| Non-serializable data passed into client components | Normalize dates/numerics to plain serializable values |
| Internal API proliferation | Prefer Server Actions and Server Components unless there is a real external API need |
| User sees stale catalog after default swap | Revalidate affected paths/tags after promotion in Phase 4 |

---

## Frontend/Admin UI Review

Phase 4 admin catalog tooling should follow operational-product patterns rather
than marketing-page patterns.

Required future UI qualities:

- Table-first catalog diff view, not card grids.
- Import preview before write.
- Clear draft/active/archived state.
- Explicit old-code -> new-code mapping for structured item codes.
- Prominent destructive-action confirmation for default swaps.
- Row-level validation messages for duplicate `item_code`, missing category,
  invalid numeric price, and Factor F reference mismatch.
- Dense but readable controls: filters, tabs, search, version selector, audit
  timeline, and comparison panel.
- Browser QA across desktop and mobile/tablet widths before release.

The structured item-code future (`CIC-PVC-001`) should not be implemented as a
visual-only convention. If users need to filter by segments, add explicit data
fields such as `work_context`, `material_family`, and `display_order` in a later
schema change.

---

## Risk Register

| Severity | Risk | Current control | Residual action |
|---|---|---|---|
| High | Wrong Factor F reference affects BOQ totals | Full-table checksum gate and fail-closed app behavior | Re-run before execution window |
| High | Historical BOQs change catalog version accidentally | Phase 1B immutable-version trigger | Apply only after Phase 2 smoke tests pass |
| High | RPC remains executable by anon/PUBLIC | P0 containment and verification gates | Execute P0 before Phase 1A |
| Medium | Live BOQ writes during cutover miss category snapshot | Delta backfill before and after Phase 2 | Prefer short write pause |
| Medium | Version default pointer points to wrong catalog | Singleton pointer validation and owner approval | Verify default pointer after every promotion |
| Medium | Import creates duplicate or reused item codes | Unique constraint and import preview | Add mapping/dictionary requirement in Phase 4 |
| Medium | Next.js integration leaks cross-version results | Required `priceListVersionId` and fail-closed search | Add smoke tests for create/edit/duplicate/print |
| Low | Admin UI becomes too card-heavy or unclear | Table-first future UI standard | Use concept/design QA before Phase 4 build |

---

## Execution Readiness Checklist

The plan is ready for owner approval only when these remain true immediately
before execution:

- Supabase MCP/SQL confirms `price_list` count and PN6 count.
- Factor F full-table checksum matches the approved baseline.
- `npm test`, `npm run lint`, and `npm run build` pass on latest `main`.
- Dependency audit is remediated or explicitly risk-accepted.
- Backup/restore point is confirmed.
- P0 migration is rehearsed and verified outside production.
- Full `010 -> 010a -> Phase 2 -> 011` path is rehearsed outside production.
- Phase 2 smoke tests cover create, edit, duplicate, print, export, dashboard,
  and price-list views.
- Rollback/forward-fix owner is assigned for the execution window.

---

## Conclusion

The current phased Master Catalog plan is the recommended path. It follows the
same broad pattern used by mature operational software: immutable published
versions, explicit draft promotion, default pointer, DB-enforced invariants,
short migrations, complete verification gates, and audit-first admin workflows.

The main remaining work is not to redesign the architecture; it is to rehearse,
execute with gates, and keep future Phase 4 UI/import tooling disciplined.
