# BOQ / Project List Scaling Decision Plan

**Decision ID:** `LIST-1`

**Status:** PROPOSED — OWNER DECISION REQUIRED; NO IMPLEMENTATION AUTHORITY

**Prepared:** 2026-08-31 (Asia/Bangkok)

**Scope:** The `/boq` register that users commonly call the project list,
especially the active Admin view that can see every BOQ allowed by RLS

**Related plan:**
[Conduit BOQ Product Evolution Decision Plan](./01-conduit-boq-product-evolution-decision-plan.md)

**Adjacent completed work:** `DUP-1` Atomic BOQ Duplicate was released and
verified in Production on 2026-08-31 under
[Result #04](./04-atomic-boq-duplicate-production-release-result.md). Its
authority is consumed. LIST-1 remains a separate proposed decision.

**Research basis:**
[BOQ Register Pagination Best-Practice Research](./03-boq-list-pagination-best-practice-research.md)

## 1. Authority and decision requested

This document records a product and technical recommendation only. It does not
authorize code edits, a schema/index/RPC change, migration, Preview or
Production deployment, commit, push, data mutation, catalog operation, Factor F
change, or historical BOQ cleanup.

This LIST-1 document does not grant authority for pagination implementation.
The separate DUP-1 instruction was executed and consumed for its exact forward
migration, application release, and bounded Production verification: normal
Atomic Preserve Copy plus a separate Selected-Factor Copy for eligible legacy
BOQs, both preserving the source Catalog/items/prices. Its result does not
authorize LIST-1 or broaden DUP-1 into Catalog/Factor publication, repricing,
or source-BOQ mutation.

The Owner decision requested is:

> Should the BOQ register move to server-side numbered pagination with
> server-side search/filter/sort and bounded route loading?

**Research-backed recommendation:** yes. Choose `LIST-1B` below with an
initial fixed first-release page size of 25. Server-side whole-result
operations, deterministic ordering, RLS-consistent count, and bounded related
data are correctness requirements. Numbered navigation and 25 rows are the
selected Conduit v1 product design, not universal rules. Do not implement
client-only pagination or infinite scroll for this Admin/register context.

## 2. Important domain clarification

The current screen is a **BOQ register**, not a true distinct-project table.
Each row is one `boq` record containing free-text `project_name`; two BOQs can
refer to the same project name. This plan paginates BOQs. Grouping multiple BOQs
under a first-class Project entity is a separate long-term data/workflow
decision and is not required to solve the current list problem.

## 3. Verified current behavior

The code and dated evidence show that list scale is already a real problem, not
only a future optimization:

- The page still loads every RLS-visible row using `select('*')` plus Catalog
  and Factor-version labels, with no `limit()` or `range()`, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L118-L140).
- Search runs only over the rows already loaded into browser memory in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L142-L147).
- Ordering uses only `created_at DESC`; equal timestamps have no deterministic
  tie-breaker in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L122-L129).
- The header calls `boqList.length` “ทั้งหมด”, although it is only the number of
  rows returned by the API, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L254-L256).
- Mobile cards and the desktop table are both mounted and mapped even though
  CSS hides one presentation at a time, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L289-L299) and
  [app/boq/page.tsx](../../../app/boq/page.tsx#L377-L400).
- Every mounted `RouteBadge` immediately issues its own `boq_routes` request in
  [RouteBadge.tsx](../../../components/boq/RouteBadge.tsx#L30-L42). The two
  responsive render trees therefore produce approximately `2N` route requests
  plus the main list request.
- The dated 2026-08-31 read-only evidence observed `263` BOQs and `326` routes.
  At that size, the current Admin page can initiate approximately `527`
  list/route requests before authentication-related work. See the
  [aggregate evidence](./evidence/2026-08-30-quantity-entry/03-production-readonly-aggregate-evidence.md).
- The repository's local Data API cap is `1,000` rows in
  [supabase/config.toml](../../../supabase/config.toml#L16-L18). The current
  cloud value still requires a fresh read-only preflight, but Supabase also
  documents a default maximum of 1,000 returned rows and recommends range
  queries for pagination.
- Admin visibility is intentionally broad: the current RLS policy permits an
  active Admin to select all BOQs, while other roles are scope-limited. This is
  why Admin experiences the scaling problem first. RLS remains the authority;
  UI filters must not replace it.
- Whole-BOQ Copy is live through the atomic trusted DUP-1 operation. Normal Copy
  and the separate selected-Factor legacy action must remain correct across
  pagination/search transitions; LIST-1 must not reintroduce the former
  multi-request browser copy or duplicate the RPC eligibility predicate.

The current `/price-list` page has page controls, but it first loads all rows
and then slices the array in memory. Its controls may inform visual style, but
its data-loading design must not be copied for this register.

## 4. Options

| Option | Model | Advantages | Disadvantages / risks | Decision |
|---|---|---|---|---|
| `LIST-1A` | Client-side pagination after loading all BOQs | Smallest UI edit; can reuse the price-list pattern | Still downloads all rows; search/count still fails at the row cap; N+1 remains; no long-term scale benefit | Reject |
| `LIST-1B` | Server-side numbered pages using filtered count + bounded range | Familiar for Admin review; supports page numbers, total, Back/Forward, bookmarks, and returning to a known place | Offset pages can shift if new BOQs are inserted while browsing; requires correct server search/count/URL state | **Recommend now** |
| `LIST-1C` | Cursor/keyset with Previous/Next or Load more | Stable and efficient for very large or rapidly changing datasets; avoids deep offset cost | Cannot jump naturally to page N; total/progress and return-to-position are harder; more state/edge cases | Reconsider only after measured need |
| `LIST-1D` | Infinite scroll | Continuous browsing and valid for some feed/simple-list products | Poor fit for this Admin register's keyboard navigation, random access, counts, comparison, footer access, and position restoration | Reject for this context |

At the current `263` rows, 25-row numbered server pages produce about 11 pages
and give the best balance. If measured deep-page p95 latency, query plans,
mutation churn, or a much larger authorized result makes offset navigation
materially worse, keyset pagination can replace the transport without changing
the list's search/filter contract. Row count alone is not the upgrade trigger.

## 5. Proposed first-release UX contract

### Desktop

- Initial fixed `25` BOQs per page; this reduces first-release state and is a
  measured product hypothesis, not a permanent best-practice constant. Do not
  add a page-size selector until usage proves a need.
- Show `รายการ 1–25 จาก 263` using the RLS-filtered server count.
- Use Previous, compact page numbers, ellipses, and Next. Include first/last
  pages when space permits; hide pagination when there is only one page. Page 1
  has no usable Previous action and the final page has no usable Next action;
  absent/disabled controls follow the chosen component's accessible semantics.
- Keep project name as the primary label and add BOQ number plus “แก้ไขล่าสุด”
  as secondary identification. Distinguish the account owner from the
  free-text estimator when the authorized directory data is available.
- Keep one primary row action such as Open/Edit; permission-dependent secondary
  actions must reflect `can()` and RLS rather than failing only after a click.
- Normal Copy is a current secondary row action when the actor/source pass the
  UI's candidate-level checks. Its label/help states that Catalog, prices, and
  Factor F are preserved. The trusted RPC remains the final eligibility
  authority and may fail the action closed; a future LIST-1 projection may make
  that decision available to the list without weakening the RPC check. Do not
  label it as current-price copy.

### Mobile

- Use `ก่อนหน้า · หน้า X/Y · ถัดไป`; do not render a long page-number strip.
- Keep the compact card view, one primary Open action, and move secondary
  actions into an accessible overflow menu where appropriate.
- Use the same DUP-1 eligibility and wording on mobile. Do not expose a disabled
  control whose reason is unavailable to keyboard or assistive-technology users.
- Use a Conduit touch-target goal of at least 44 × 44 CSS px and do not hide the
  result count or active filters; this is a product goal, not a claim that WCAG
  AA universally requires 44 × 44.

### Shared list behavior

- Keep non-sensitive structured list state in the URL, conceptually:
  `?page=2&scope=all&status=draft&sort=updated_desc`.
- Free-text `q` needs an explicit confidentiality decision before it is placed
  in the URL. Project/customer terms in URLs may persist in browser history,
  logs, analytics, screenshots, copied links, and referrers. The safer default
  for the application URL is same-session state; URL-backed `q` is acceptable
  only after the Owner accepts the data-classification and logging behavior.
  This does not remove the term from a direct PostgREST Data API request URL;
  its service/network logging policy must also be reviewed.
- Back/Forward and return from an Edit page restore the permitted state when it
  still exists. A bookmark restores structured URL state only. Under the safer
  session-only search policy, `q` and its associated page remain one
  same-session state unit; if that session state is absent, clear `q` and reset
  to page 1 under the remaining structured filters rather than applying a stale
  page number to a different result set.
- Changing search, filter, or sort resets to page 1.
- An invalid or out-of-range page supplied by URL redirects to page 1.
- Validate `page` as an integer greater than or equal to 1 before querying. If
  a stale but syntactically valid page returns PostgREST `PGRST103` / HTTP 416,
  refetch page 1 under the same authenticated search/filter state and
  canonicalize the URL. This recovery may use an additional request beyond the
  normal happy path.
- Deleting the final row on a page refetches count and moves to the last
  remaining page, normally the immediately preceding page, instead of showing
  a false empty state.
- Show a structural skeleton on initial load. During page/filter transitions,
  old rows may remain beneath a visible busy overlay to avoid layout collapse,
  with `aria-busy="true"`, but their row actions must be inert while stale.
  Inert means neither pointer nor keyboard activation is possible; ARIA alone
  is not an interaction lock. Before making a subtree inert, move focus to the
  initiating control or loading/status element. On failure, replace the active
  result area with error/retry for the attempted controls, or atomically roll
  controls and results back to the last committed query. Never show new
  controls with old rows/count as though they were current.
- Distinguish “ยังไม่มี BOQ” from “ไม่พบตามตัวกรอง” and offer “ล้างตัวกรอง”.
- Selected-Factor Copy is a separate, explicit action for a candidate unbound,
  Catalog-bound legacy BOQ. DUP-1 performs its final eligibility check inside
  the trusted copy RPC and sends permanent failures to Create New. LIST-1
  should add one trusted batched eligibility projection for its bounded page
  so ineligible actions can be hidden without duplicating the predicate in the
  browser or adding one Factor/version query per row. It
  preserves the old Catalog/items/prices, clears old Factor-derived snapshots/
  totals, and blocks official output until trusted save. Current Catalog prices
  always require Create New; LIST-1 does not introduce Requote/Reprice/Rebase.

## 6. Search, filter, and sort contract

Pagination must be applied **after** RLS, search, filters, and ordering. Applying
pagination first and then filtering the current 25 rows is a release-blocking
missing-results bug.

### `L1` initial controls

- Search: project name, BOQ number, estimator, and the current legacy route
  field. Canonical child-route search needs a separately designed RLS-safe
  query; do not falsely claim it until tested.
- Scope: “ทั้งหมดที่มีสิทธิ์” and “ของฉัน”. The control only narrows the RLS
  result; it never broadens access.
- Status: include it for future workflow compatibility, but do not make it the
  dominant filter while the dated evidence still shows every BOQ as draft.
- Sort: last edited, document date, project name, and amount.
- Recommended default: `updated_at DESC NULLS LAST, id DESC`, after a fresh
  read-only null/distribution/semantics preflight. Verify that every relevant
  edit, workflow/status, and background mutation advances `boq.updated_at`
  before labeling it “แก้ไขล่าสุด”. The UUID is the deterministic tie-breaker.
  Recency ordering is useful but moves offset-page membership more often than
  immutable `created_at`; accept that tradeoff explicitly.

Search should debounce, cancel or ignore stale requests. Never interpolate raw
`q` into PostgREST `.or()` grammar: URL encoding alone does not escape that
grammar. Define whether LIKE wildcards are literal or supported syntax and test
commas, periods, parentheses, quotes, backslashes, `%`, `_`, and `*`. A slow
response for an old query must not overwrite a newer result.

### `L2` Admin findability controls

Add only after the base list is stable:

- department and sector;
- creator/account owner;
- updated year or date range; and
- active filter chips plus Clear all.

Do not expose emails merely to populate an owner filter. Any profile directory
query must have its own authorized projection and RLS/permission review.

### `L3` evidence-driven enhancements

Saved/named views, shared views, configurable columns, bulk actions, and a
first-class Project grouping model come later only if repeated use proves their
value. URL presets cover most early “saved view” needs without adding a table.

## 7. Data-query contract

“Server-side pagination” here means that Postgres/PostgREST returns only the
requested authorized slice; it does not require a privileged Next.js server or
an RLS-bypassing RPC.

The query design must:

1. call `requireActiveProfile` as today and query with the end-user session;
2. centralize page, page size, search, filters, sort, count mode, and request
   identity in one canonical query adapter;
3. select only list fields, never `*`;
4. apply the same server search/filter set to the rows and exact count;
5. apply deterministic `updated_at` + `id` ordering;
6. use a bounded range for 25 rows;
7. load current-page route data as `boq_id, route_order, route_name` by embedding
   the tested RLS-protected relationship in the page request or, if embedding
   is not suitable, by one RLS-protected batch for the 25 BOQ IDs. Feed badges
   from that result; do not issue lazy/per-click list-route requests;
8. return and render only the authorized count; and
9. ignore/cancel stale responses when list state changes.

Target request behavior per list state is bounded: the happy path uses one BOQ
page/count request and zero additional route requests when embedded, or one
current-page route batch otherwise. Invalid-range recovery may add a request;
request count must never grow per BOQ row.

At the current scale use an exact RLS-visible count. Measure count latency
separately. If it later exceeds an agreed budget, a reviewed release may use an
estimated count or indeterminate/`hasNextPage` navigation; it must never label a
page-length value as “ทั้งหมด”. An estimated/planned total must not drive
authoritative `หน้า X/Y`, an exact last-page link, or clamping; label it as
approximate or switch to Previous/Next with `hasNextPage`.

MUI, AG Grid, and other enterprise grids are behavioral references only. L1
does not justify a new grid dependency, license surface, or design-system
migration; the existing Conduit components can implement this contract.

Do not introduce a `SECURITY DEFINER` listing/count function to solve query
convenience; it could bypass RLS. If a future view or RPC is genuinely required,
use end-user context, security-invoker semantics where supported, explicit
grants, and persona tests.

## 8. Index and migration position

The first page/search implementation may not need a database migration at the
current scale. Existing repository evidence includes indexes for owner,
organization scope, and status, but does not show an index tailored to the
proposed `updated_at, id` order.

Before proposing an index:

- obtain a fresh read-only schema/index/null preflight;
- measure representative Admin, department, sector, owner, status, and search
  queries with authenticated role-shaped evidence. Use
  `EXPLAIN (ANALYZE, BUFFERS)` only in local/staging; do not run it against
  Production without separate explicit diagnostic authority;
- add only the smallest justified composite order/scope index; and
- measure exact-count and wildcard-search cost separately.

Before L1 release, record a representative local/staging baseline and agree a
numeric latency budget for page 1 and the deepest commonly used page under the
required personas. Isolate exact-count cost with paired diagnostics with and
without `count: 'exact'`. A cursor review is triggered by a recorded budget
breach, deep-offset query evidence, or unacceptable mutation churn—not by an
unmeasured row threshold.

An order index or later trigram text-search index has storage and write cost.
Do not add one by assumption at only 263 rows. Any justified index is a newly
approved forward product migration after 029. Never edit, retry, or replay
migrations 027/028/029.

## 9. RLS and adjacent permission finding

- Pagination, filters, and count must preserve the current row scope for Admin,
  staff, manager, owner/assignee, pending/inactive, and procurement personas.
- A count visible to one persona must never include rows hidden by that
  persona's RLS policy.
- Client-side scope controls are convenience only; they are not authorization.
- The current access banner says Procurement sees approved departmental BOQs,
  while repository policy evidence does not clearly enforce that status filter.
  This is a separate authority/UI wording decision. Do not “fix” it with a
  client filter inside pagination or silently change RLS as part of LIST-1.

## 10. Accessibility and established product pattern

This is a searchable administrative register, not an activity feed. The cited
government case-list and enterprise design systems support explicit
search/filter/sort, navigable pages, result-state visibility, and restorable
non-sensitive state for this context.

- Pagination is a semantic navigation landmark with accessible Previous/Next
  labels and `aria-current="page"`.
- Search-as-you-type retains focus in the field and uses one polite result
  announcement after debounce. Sort retains focus on its control and announces
  the update. An explicitly applied filter may focus the result description or
  use a polite status announcement, but not both. Pagination changes the URL,
  updates the document title with the page number, and moves scroll/focus to the
  result area.
- Compact page links adapt to viewport width and zoom.
- Infinite scroll is excluded. The GOV.UK Design System specifically warns
  that automatic infinite scroll causes problems for keyboard users and shows
  numbered pagination for lists of similar case/search-result items.

References:

- [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)
- [Carbon Design System Pagination](https://carbondesignsystem.com/components/pagination/usage/)
- [PatternFly Pagination](https://www.patternfly.org/components/pagination/design-guidelines/)
- [GitHub Primer DataTable guidelines](https://primer.style/product/components/data-table/guidelines/)
- [VA.gov Search Results](https://design.va.gov/templates/search-results)
- [MUI server-side pagination](https://mui.com/x/react-data-grid/pagination/)
- [Supabase JavaScript select/count](https://supabase.com/docs/reference/javascript/select)
- [Supabase range pagination](https://supabase.com/docs/reference/javascript/using-modifiers-range)
- [Full LIST-1 research and source map](./03-boq-list-pagination-best-practice-research.md)

## 11. Staged delivery and effort

These are planning ranges, not implementation approval or commitments.

### `L0` — Decision only (current)

- Record the problem, selected option, UX/query/security contract, tests, and
  authority boundary.
- No code, schema, or external state change.

### `L1` — Bounded BOQ register (approximately 5–8 engineer-days)

- server-side page/count and selected columns;
- deterministic ordering, safe structured URL state, and the selected
  free-text search confidentiality policy;
- initial fixed 25-row desktop/mobile pagination;
- batched route loading and removal of list-level N+1;
- one responsive result/data contract, stale-action protection, and
  loading/error/empty/no-result handling; and
- persona, race, responsive, and network-count tests.

### `L2` — Admin findability polish (approximately 3–5 engineer-days)

- department/sector/owner/date filters;
- return-to-list preservation and active filter chips;
- mobile action overflow and accessibility polish; and
- measured index proposal only if query evidence requires it.

### `L3` — Later, evidence only

- cursor/keyset transport if deep offsets or churn become a measured problem;
- named/saved/shared views;
- configurable columns or bulk action. Any bulk action must distinguish “25 on
  this page” from “all N matching filters”, use stable IDs, and re-authorize at
  action time. “All matching” must explicitly choose a live filter predicate or
  a captured snapshot; destructive actions require confirmation using the
  server-authorized current set/count; and
- true Project grouping/entity if the business distinguishes Project from BOQ.

DUP-1 is complete. The next recommended serialized decision is LIST-1 before
the larger Quantity Expression DB-1 release, with the calculation safety/test
baseline established before expression implementation. LIST-1 still addresses
current Admin pain, has a smaller blast radius, and may require no schema
change.

## 12. Test and release gates

Minimum scenarios:

| Area | Required evidence |
|---|---|
| Completeness | More than 1,000 fixtures; search must find a match beyond the former first 1,000 and the displayed count/range must be correct. |
| Ordering | Against a fixed dataset with no concurrent mutation, many BOQs with identical/null timestamps appear exactly once with no duplicate/missing ID across all numbered pages. Concurrent-mutation behavior is tested separately and is not promised to be snapshot-stable. |
| Search/filter | Search and each filter operate on the entire RLS-visible result before range; a filter change resets to page 1. |
| Search grammar | Commas, periods, parentheses, quotes, backslashes, `%`, `_`, and `*` cannot break or broaden a PostgREST `.or()` query; raw `q` is never interpolated, and wildcard semantics match the documented product choice. |
| Races | Rapid search/sort changes cannot let a stale response replace the newest state. |
| Transition safety | Rows, count, page, routes, and query identity commit atomically. Previous rows retained during loading expose `aria-busy`; pointer and keyboard actions are locked; focus moves coherently before inertness. Failure shows attempted-query error/retry or atomically restores the previous controls/results. |
| Mutation | Insert/delete during browsing is explained; deleting the final row clamps/refetches safely. |
| Page recovery | Non-integer/negative pages normalize to page 1; `PGRST103` / HTTP 416 refetches page 1 with the same authenticated filters; in-app deletion moves to the last remaining page. |
| URL/state | Structured state survives its promised navigation paths. Under session-only search, `q` and its page restore only when the session state exists; otherwise search clears and page resets to 1. Tests separately verify browser page URL/history/bookmarks and the selected PostgREST request/logging policy. |
| Routes | Page load performs a bounded batch/embedded route request; request count does not grow per BOQ row. |
| Personas | Active Admin, owner, assignee, staff, department/sector manager, procurement, pending/inactive, and out-of-scope users see matching rows and counts. |
| Responsive/a11y | 390, 768, 1024, and 1440 px plus zoom, keyboard, focus, landmark, current-page, boundary Previous/Next, page-number document title, loading, error, empty, and no-result checks. |
| Regression | Create, Open/Edit, Print, allowed Delete, and return-to-list behavior retain intended permissions. Current normal Atomic Preserve Copy is a candidate/advisory action whose final eligibility is decided by the trusted RPC (or surfaced by a future trusted LIST-1 projection); Selected-Factor Copy remains a separate eligible-legacy action, current-price guidance points to Create New, and pagination/search transitions cannot submit a stale/duplicate copy request. |

GO only when:

- row and count scope match RLS for every required persona;
- search covers all authorized pages;
- ordering is deterministic;
- network requests remain bounded per page;
- no error state is rendered as a genuine empty state; and
- no new index/migration is assumed without evidence and separate authority.

STOP if:

- count leaks the existence of out-of-scope BOQs;
- search covers only the current page;
- any per-row route query remains on initial list load;
- rows duplicate/disappear under the approved fixed-dataset ordering fixtures;
- a view/RPC bypasses RLS; or
- implementation requires replaying or changing migrations 027/028/029.

## 13. Owner decision sheet

| Decision | Recommendation | Owner choice |
|---|---|---|
| Pagination model | `LIST-1B` server-side numbered pages | `TBD` |
| Initial page size | Fixed 25 as a measured v1 default; selector later only if needed | `TBD` |
| Default sort | Last edited (`updated_at DESC, id DESC`) after preflight | `TBD` |
| Initial filters | Search + all/mine + status + sort | `TBD` |
| Free-text URL/transport policy | Safer app-URL default: session-only `q`; structured non-sensitive state in URL; separately review Data API logging | `TBD` |
| Count policy | Exact visible count now; reviewed estimated/indeterminate fallback only after measured need | `TBD` |
| Admin L2 filters | Department + sector + owner + date | `TBD` |
| Route behavior | Embed current-page route fields or use one current-page batch; no per-row or per-click list query | `TBD` |
| First implementation order | DUP-1 complete; decide/implement LIST-1 next, then calculation baseline and expression DB-1 | `DUP-1 released 2026-08-31; LIST-1 itself remains TBD` |

## 14. Proposed approval wording

```text
APPROVE LIST-1 PRODUCT DIRECTION — LEVEL A ONLY:
LIST-1B server-side numbered pagination;
initial fixed 25 rows per page as a measured v1 default;
server search/filter/sort/count before range;
URL-restorable non-sensitive structured state;
free-text search follows the separately selected confidentiality policy;
bounded route batch with no per-row initial query;
RLS remains authoritative.
This records direction/documentation only. It does not authorize code edits,
commit, push, Preview, schema/index/RPC/migration work, Production deployment,
or any Production write.
```

The completed DUP-1 release is not a LIST-1 approval. A later LIST-1
implementation must integrate the current verified DUP-1 eligibility/actions
without duplicating Factor
queries per row or changing the D9 preserve/reset semantics.
