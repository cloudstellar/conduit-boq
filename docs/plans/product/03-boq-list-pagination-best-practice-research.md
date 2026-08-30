# BOQ Register Pagination Best-Practice Research

**Research ID:** `LIST-1-R`

**Status:** COMPLETE — RESEARCH EVIDENCE ONLY; NO IMPLEMENTATION AUTHORITY

**Prepared:** 2026-08-31 (Asia/Bangkok)

**Decision supported:** `LIST-1`

**Related plan:**
[BOQ / Project List Scaling Decision Plan](./02-boq-list-scaling-decision-plan.md)

## 1. Scope and authority

This note checks whether the proposed `/boq` register direction matches
established product, accessibility, data-grid, Supabase, PostgREST, and
PostgreSQL practices.

It does not authorize code edits, a database/index/RPC/migration change,
deployment, commit, push, Production access, or any data mutation. It does not
change the completed Master Catalog authority boundary.

The research question is:

> Is server-side numbered pagination with whole-result search/filter/sort,
> visible counts, URL-restorable state, and bounded route loading the right
> next design for the current Conduit BOQ register?

## 2. Executive verdict

**Yes, with important qualifications.** The correctness contract is strongly
source-backed, while numbered offset is justified by Conduit's current shallow
Admin register. “Numbered pages,” “exact count,” and especially “25 rows” are
not universal database rules; they are contextual product choices that should
be measured after release.

The research supports keeping this first-release direction:

- one server query contract applies RLS, search, filters, and sort before the
  bounded range;
- desktop uses numbered pages plus Previous/Next and a visible result range;
- mobile uses compact Previous/Next plus a range/page summary;
- 25 rows is the initial Conduit default, not a permanent standard;
- exact RLS-visible count is reasonable at the dated 263-row scale;
- route data is embedded or fetched once for the current page, never once per
  mounted row;
- infinite scroll is rejected for this Admin/case-register context; and
- cursor/keyset pagination remains a measured upgrade path, not a prerequisite.

The strongest correction to the earlier wording is:

> “Server-side whole-result operations, deterministic ordering, RLS-consistent
> count, bounded related-data loading, and accessible state are correctness
> requirements. Numbered pages and a fixed initial size of 25 are the selected
> Conduit v1 product design.”

## 3. Product and data context used

The conclusion is not based on design-system examples alone. It is compared
with the current application evidence:

- `/boq` is a BOQ register, not a first-class Project entity list;
- Admin can see every BOQ allowed by RLS, while other roles are scope-limited;
- dated 2026-08-31 read-only evidence observed 263 BOQs and 326 routes;
- the current page loads all visible BOQ columns without a range;
- search operates only on the browser-loaded rows;
- ordering has no unique tie-breaker;
- mobile and desktop row trees are both mounted; and
- each mounted `RouteBadge` starts its own route request, producing an
  approximately `2N + 1` list/request shape.

At 25 rows per page, 263 rows produce about 11 pages and the deepest page skips
only about 250 rows. That is a materially different engineering problem from a
high-churn feed or a table with millions of rows.

## 4. Source-backed principles and Conduit engineering requirements

Sections 4.1–4.5 summarize recurring source guidance. Sections 4.6–4.7 apply
official Supabase/PostgREST capabilities and RLS behavior to Conduit's verified
request and authorization risks; their release-gate priority is a Conduit
engineering decision.

### 4.1 Paginate only when it improves usability or performance

GOV.UK and IBM Carbon both frame pagination as a response to a collection that
is too slow, too large, or difficult to consume in one view. Conduit's current
Admin request count and growing list satisfy both conditions.

### 4.2 Search, filter, sort, and pagination operate on one result set

MUI explicitly warns that server pagination combined with client filtering or
sorting sees only partial data. The correct order is:

```text
authenticated user context
  -> RLS-visible rows
  -> search and filters
  -> deterministic sort
  -> count/progress metadata
  -> requested bounded range
```

Filtering only the current 25 rows is not a reduced first release; it is a
missing-results bug.

### 4.3 Use a deterministic total order

Supabase states that `range()` respects query order and can behave unexpectedly
without one. PostgreSQL requires a unique, predictable `ORDER BY` for consistent
`LIMIT/OFFSET` subsets. A timestamp alone is not unique, so Conduit needs a
stable tie-breaker such as `updated_at DESC NULLS LAST, id DESC`, subject to the
fresh data preflight already required by the plan.

### 4.4 Show location and result state honestly

Carbon, PatternFly, USWDS, VA.gov, and Primer expose some combination of the
visible range, total or indeterminate size, current page, and Previous/Next
controls. State distinctions—initial loading, updating, empty collection, no
filtered matches, and request failure—are supported more specifically by MUI's
server-data/overlay guidance, PatternFly table demos, and VA.gov search-result
guidance.

The current `boqList.length` must not be presented as the total after a bounded
query. The label must be driven by RLS-filtered result metadata.

### 4.5 Make the controls responsive and accessible

The shared pattern is full navigation on desktop and a compact treatment on
narrow screens. Required semantics include a named navigation landmark,
descriptive page labels, `aria-current="page"`, keyboard operation, visible
focus, usable touch targets, and a coherent result-update announcement.

The interaction contract needs to distinguish actions. Search-as-you-type keeps
focus in the field and uses one polite result announcement after debounce.
Sorting keeps focus on the sort control and announces the result update. An
explicitly applied filter may focus the result description or use a polite
status announcement, but not both. Pagination is navigation: change the URL,
update the document title with the page number, and move scroll/focus to the
result area.

### 4.6 Conduit application: keep related-data requests bounded

Supabase/PostgREST support embedded relationships and batched relation queries.
Loading routes once for each current-page BOQ is an N+1 pattern. It remains a
performance problem even after the main BOQ query is paginated and is therefore
a release gate, not optional polish.

### 4.7 Conduit application: RLS governs both rows and count

The row query, count, and route query must all use the same authenticated user
context. A privileged service-role count could reveal the existence of BOQs
outside the user's row scope. UI scope controls may narrow the result but never
broaden RLS.

## 5. What is contextual rather than universal

| Choice | Evidence | Conduit decision now |
|---|---|---|
| Numbered page vs cursor | MUI supports both; Carbon/PatternFly use full pagination; Shopify's official table API supports Previous/Next | Numbered pages fit an Admin register with random access and only about 11 pages |
| Page size | Primer says page complexity determines the size and suggests 20 as a starting point; MUI supports configurable page-size options | Start fixed at 25 to reduce L1 controls; measure before adding 50 |
| Exact count | MUI and PostgREST support exact, estimated, or unknown totals; PatternFly supports indeterminate pagination | Exact visible count is reasonable at 263 rows; define a measured fallback |
| Top and bottom controls | Design systems differ; Carbon favors directly below the table, PatternFly may use both | Top result summary and bottom navigation; avoid duplicating full controls initially |
| URL persistence | Primer treats pagination as navigation that changes URL; VA documents page/filter/sort/search parameters | Persist safe structured state; free-text search needs a confidentiality decision |
| Infinite/growing list | GOV.UK warns against automatic infinite scroll; SAP Fiori supports growing lists in some responsive-list contexts | Reject for this register, not as a universal claim about every product |

No official source establishes 25 as the single correct page size. The
difference between 20 and 25 is low risk compared with partial-data search,
RLS count leakage, stale requests, or N+1 loading.

## 6. Numbered offset now; cursor/keyset later when measured

### 6.1 Why numbered offset fits now

- users can jump to a known page and understand where they are;
- Back/Forward and return from Edit map naturally to a page number;
- an exact count and last-page calculation are straightforward;
- Supabase `range(from, to)` directly supports the transport; and
- implementation and test state are simpler than bidirectional cursors.

The accepted limitation is that inserts, deletes, or sort-key updates between
page requests can shift rows. PostgreSQL `READ COMMITTED` does not provide one
snapshot across separate page requests. For a BOQ work register, this is
acceptable if the UI does not describe a multi-page browse as an immutable
audit snapshot.

### 6.2 Cursor/keyset upgrade triggers

Do not migrate merely because a generic threshold is crossed. Reconsider
keyset/cursor when representative evidence shows one or more of:

- deep-page p95 latency exceeds the agreed budget;
- query plans show large offset work dominating response time;
- the authorized result reaches many thousands and deep navigation is common;
- BOQ creation/update churn causes unacceptable page shifting; or
- the product becomes sequential/feed-like and page-number jumps are no longer
  important.

Cursor pagination must include every sort key, direction, and active
search/filter/sort identity in its state. Because the proposed `updated_at` is
currently treated as nullable, a future cursor must use an audited `NOT NULL`
contract, an explicit null bucket/sentinel matching `NULLS LAST`, or a
composite predicate that handles nulls; a naive tuple comparison can omit null
rows. Cursor transport improves deep-offset performance and insertion
stability, but it does not make sort-key updates immovable, and it makes random
page jumps, totals, and reverse navigation more complex.

## 7. Count strategy

PostgREST exposes `exact`, `planned`, and `estimated` count modes. The current
recommendation is:

1. use `exact` with the same RLS/search/filter contract at the current scale;
2. measure count latency separately from the row range;
3. keep the last valid count stable while a new request is loading; and
4. if count later exceeds its budget, change honestly to estimated or
   `hasNextPage`/indeterminate navigation rather than displaying a false total.

This fallback is a future performance policy, not authority to change the
first-release design without review. A planned/estimated total must not drive
authoritative `หน้า X/Y`, an exact last-page link, or clamping. Label it as
approximate, or switch to Previous/Next with `hasNextPage`, and recover from an
estimate mismatch or out-of-range response explicitly.

## 8. URL state and confidentiality

Page, status, scope, sort, and other non-sensitive enumerated filters are good
candidates for URL state because they can support reload, bookmarking,
Back/Forward, and returning from Edit. The repository already uses this return
state pattern in the Master Catalog final-review workspace.

Free-text `q` is different. Project/customer names or other confidential terms
in a URL can be retained in browser history, access logs, analytics, copied
links, screenshots, and referrer data. VA.gov's URL guidance explicitly says
not to put PII or other data that should not be logged or tracked in URL
parameters.

Keeping `q` out of the browser's page URL reduces address-bar, history,
bookmark, copy/share, and referrer exposure, but it does not by itself make the
search term secret: a direct PostgREST filter is also encoded in the Data API
request URL and may be present in service/network logs. If the data
classification forbids that, search needs a separately designed transport and
logging policy rather than ordinary client-side PostgREST filters.

Before shipping, choose one policy:

- **safer application-URL default:** URL stores structured controls; free-text
  search stays in ephemeral/session state and is restored only on same-session
  return, while accepting the separately reviewed Data API logging behavior.
  `q` and its result-page number form one session unit; if that unit is absent,
  clear search and reset to page 1 under the remaining URL filters; or
- **shareable search:** include `q` only after the Owner accepts the data
  classification/logging behavior and the UI prevents sensitive identifiers
  where practical.

Do not silently treat full URL-restorable free-text search as risk-free.

## 9. Loading, error, and stale-result contract

- Initial load: render a structural skeleton matching the table/cards.
- Page/filter transition: keeping previous rows can prevent layout collapse,
  but show a visible loading overlay/status and set `aria-busy="true"` on the
  collection.
- While previous rows are stale, their Open/Edit/Delete actions are inert so a
  user cannot act on a row that no longer matches the visible query controls.
  Inertness must block pointer and keyboard activation; `aria-busy` or
  `aria-disabled` alone is insufficient. Move focus to the initiating control
  or loading/status element before making a subtree inert.
- A slower old request must never overwrite a newer query result.
- Rows, count, page, routes, normalized controls, and query identity are one
  committed state. A successful response replaces them atomically.
- Failure: replace the active result area with error/retry for the attempted
  controls, or atomically restore the last committed controls/results. Never
  leave new controls beside old rows/count looking current, and never render
  failure as “no BOQs” or “no matches.”
- Invalid/out-of-range page from a URL: redirect to page 1.
- Validate `page` as an integer greater than or equal to 1 before querying. If
  a previously valid page returns PostgREST `PGRST103` / HTTP 416, refetch page
  1 with the same authenticated filter/search state and canonicalize the URL.
  This recovery is an allowed extra request beyond the normal happy path.
- Deletion of the final row on the current page: refetch and move to the last
  remaining page, normally the immediately preceding page.

## 10. No grid-library or bulk-selection expansion in L1

MUI and AG Grid are behavioral references, not a recommendation to add a new
data-grid dependency. Both ecosystems have community tiers, while advanced MUI
X tiers are paid and the cited AG Server-Side Row Model is Enterprise. The
current use case can be built with Conduit's existing components and a
centralized query adapter, avoiding unnecessary bundle, licensing, styling,
maintenance, and migration cost.

Bulk selection is also out of L1. Under server pagination, “Select all” can
mean the current 25 rows or all `N` rows matching the server query. If added
later, the UI must state which one, use stable BOQ IDs, re-authorize on the
server at action time, and define what happens when filters change. “All
matching” must explicitly mean either a live filter predicate or a captured
snapshot; a destructive action must confirm the server-authorized current set
and count. It must never infer global selection from rows loaded in memory.

## 11. Revised Conduit release contract

### Desktop

- initial fixed size of 25 BOQs;
- result text such as `รายการ 1–25 จาก 263` from the authorized server count;
- numbered links with ellipses plus Previous/Next;
- no usable Previous action on page 1 and no usable Next action on the last
  page; absent/disabled controls must follow the chosen component's accessible
  semantics;
- hide pagination when only one page exists; and
- one responsive data result, not duplicate live mobile and desktop fetch/action
  trees.

### Mobile

- compact Previous/Next and range or `หน้า X/Y` summary;
- the same loaded page and authorization state as desktop;
- no long strip of page numbers; and
- preserved result count and active-filter visibility.

### Query/data layer

- one canonical query adapter owns page, page size, search, filters, sort, count
  mode, and stale-request identity;
- select only list fields;
- deterministic total ordering;
- exact visible count now;
- one BOQ page/count request plus at most one batched current-page route request;
- no service-role bypass; and
- no new index until representative authenticated `EXPLAIN` evidence supports
  it.

### Measurement after release

- before release, record a representative local/staging baseline and an agreed
  numeric latency budget for page 1 and the deepest commonly used page by
  persona;
- list p50/p95 response time by persona and page depth;
- count cost from paired local/staging diagnostics with and without
  `count: 'exact'`;
- requests per list transition;
- no-result and query-error rates;
- frequency of page navigation beyond page 1;
- observed demand for 50 rows or saved views; and
- page-shift complaints under normal BOQ creation/update activity.

Use local/staging `EXPLAIN (ANALYZE, BUFFERS)` for timing evidence. Do not run
`EXPLAIN ANALYZE` against Production without separate explicit diagnostic
authority; a Production plan-only check, if separately approved, must remain
read-only and proportionate.

## 12. Risk ranking

| Priority | Risk | Required control |
|---|---|---|
| High | Search/filter/sort sees only the current page | One server result contract; cross-page fixtures |
| High | Count reveals rows outside RLS | Same end-user session and filters for rows/count; persona tests |
| High | Route N+1 remains after pagination | Embedded or one batch query for current page |
| High | Stale request overwrites the latest state | Cancel or identify requests and ignore old responses |
| High | “Select all” implies unloaded rows | No bulk selection in L1 |
| Medium | Exact count becomes slow later | Measure separately; estimated/indeterminate fallback policy |
| Medium | Offset pages shift during concurrent mutations | Explain behavior; keyset trigger if measured harm appears |
| Medium | Both responsive trees stay live | One data/action contract and no duplicate effects |
| Medium | Free-text query leaks through app URL/history or Data API logs | Explicit data-classification, app-URL, transport, and logging decision |
| Low | 20 vs 25 initial rows | Start at 25 and measure |
| Low | Pagination placed only below vs both above/below | Start with top summary and bottom controls |

## 13. Source map

### Product, UX, and accessibility

- [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)
  — paginate for usability/performance; avoid infinite scroll for keyboard
  users; numbered layout for similar search/case items.
- [IBM Carbon Pagination](https://carbondesignsystem.com/components/pagination/usage/)
  — data-table pagination anatomy, range/total, page size, placement, responsive
  and accessibility behavior.
- [Red Hat PatternFly Pagination](https://www.patternfly.org/components/pagination/design-guidelines/)
  — full desktop, compact mobile, and indeterminate variants.
- [GitHub Primer DataTable guidelines](https://primer.style/product/components/data-table/guidelines/)
  — pagination for focus/performance; page size depends on row/filter/column
  complexity; 20 is a starting suggestion, not a universal rule.
- [GitHub Primer Pagination](https://primer.style/product/components/pagination/)
  and [Primer navigation pattern](https://primer.style/product/ui-patterns/navigation/)
  — numbered links support random navigation; pagination is URL navigation.
- [U.S. Web Design System Pagination](https://designsystem.digital.gov/components/pagination/)
  — bounded/unbounded sets, concise numbered navigation, touch and screen-reader
  requirements.
- [VA.gov Search Results](https://design.va.gov/templates/search-results)
  — result ranges, filters, sort, loading/error announcements, and preserved
  state.
- [VA.gov URL Standards](https://design.va.gov/ia/ia-standards/url-standards/)
  — query parameters for pagination/filter/sort/search and the prohibition on
  sensitive data that should not be logged.
- [SAP Fiori List](https://experience.sap.com/fiori-design-web/list-overview/)
  — counterexample showing that growing/load-on-scroll can be valid in other
  list contexts.

### Enterprise data behavior

- [MUI Data Grid pagination](https://mui.com/x/react-data-grid/pagination/)
  — server pagination must be paired with server filtering/sorting; index and
  cursor models; known, estimated, and unknown counts.
- [MUI server-side data](https://mui.com/x/react-data-grid/server-side-data/)
  — centralized data source, loading, keeping previous rows, error handling,
  and request complexity.
- [MUI Data Grid overlays](https://mui.com/x/react-data-grid/overlays/)
  — distinct loading, no-row, and no-result presentation states.
- [AG Grid server-side pagination](https://www.ag-grid.com/javascript-data-grid/server-side-model-pagination/)
  and [server-side selection](https://www.ag-grid.com/javascript-data-grid/server-side-model-selection/)
  — server range requests and selection ambiguity across unloaded rows.
- [Shopify App Home table](https://shopify.dev/docs/api/app-home/web-components/layout-and-structure/table)
  and [index-table composition](https://shopify.dev/docs/api/app-home/patterns/compositions/index-table)
  — Prev/Next pagination, responsive list transformation, search/filter/sort,
  and collection actions.

### Supabase, PostgREST, and PostgreSQL

- [Supabase `select()` and count](https://supabase.com/docs/reference/javascript/select)
  and [Supabase `range()`](https://supabase.com/docs/reference/javascript/using-modifiers-range)
  — bounded 0-based inclusive ranges, count, and ordering behavior.
- [PostgREST pagination and count](https://docs.postgrest.org/en/v14/references/api/pagination_count.html)
  — exact, planned, and estimated count modes.
- [PostgREST errors](https://docs.postgrest.org/en/v14/references/errors.html)
  — `PGRST103` / HTTP 416 behavior for invalid ranges.
- [PostgreSQL `LIMIT` and `OFFSET`](https://www.postgresql.org/docs/current/queries-limit.html)
  — unique predictable ordering and large-offset cost.
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
  — separate page queries under `READ COMMITTED` do not share one immutable
  snapshot.
- [Supabase indexes](https://supabase.com/docs/guides/database/postgres/indexes)
  and [query optimization](https://supabase.com/docs/guides/database/query-optimization)
  — measure before indexing; small tables can favor sequential scans; indexes
  carry write/storage cost.
- [Supabase joins and nesting](https://supabase.com/docs/guides/database/joins-and-nesting)
  and [PostgREST resource embedding](https://docs.postgrest.org/en/v14/references/api/resource_embedding.html)
  — bounded relation loading without per-row requests.
- [Supabase Storage scale case](https://supabase.com/blog/supabase-storage-performance-security-reliability-updates)
  — cursor pagination improves very deep navigation at 60-million-row scale;
  this is an upgrade signal, not proof that 263 rows require a cursor.

## 14. Decision impact

This research **tightens but does not reverse** `LIST-1B`:

- retain server-side numbered pages for the current register;
- retain an initial fixed size of 25, labeled as a measured v1 choice;
- add count fallback, URL confidentiality, stale-row inertness, one responsive
  result contract, no-grid-dependency, and no-bulk-selection boundaries; and
- replace any claim that offset/25 is universally best with explicit upgrade
  triggers.

Owner approval remains required before implementation.
