# Phase 4 P-18 Placement Governance Review Note

**Status:** Owner-accepted P-18 V1 contract; P-30 authorized bounded WP-7.5
Local-only source implementation on 2026-07-15 01:37 +07; repository/static
candidate passed and P-31 accepted exact Source/Static checkpoint
`4e3574a31a2697f4d727acabc8f55f34a4233bff` on 2026-07-15 10:24 +07;
P-32 approved the warned Local gate, whose first runtime evidence exposed
fail-closed `42704`; amended Local DB/RLS/concurrency/hash/export/browser
evidence now passes and exact P-33 owner acceptance remains pending

**Environment:** Local-only completed P-32 technical evidence. Historical P-31 migration
SHA-256 `78359215...` failed closed at runtime because the fixed-search-path
function deferred an unqualified constraint. Current schema-qualified SHA-256:
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`.
Migration `021` remains outside bootstrap. WP-8, Production access/write,
feature enablement, and publication remain unauthorized.

## 1. Why this is now a release decision

The current Local implementation safely allows an active admin to add one or
more identities to a draft, allocates provisional `max(display_order) + 1`, and
blocks publication with `P18_PLACEMENT_REVIEW_REQUIRED`. This prevents a wrong
order from becoming official, but it leaves **Add** and **Supplement** as
incomplete operator workflows: an admin can create the rows but cannot resolve
the hold in the application.

That is safe as a temporary control. It becomes product debt if the Phase 4
feature is enabled while admins reasonably expect new items to be publishable.
The recommended release path is therefore to implement the narrow placement
workflow in WP-7.5 before final WP-8 rehearsal and P-14 feature enablement.

This extension does not contradict Revision 8. Revision 8 explicitly reserved
the later placement/review UI for separate approval. P-18 supplies that missing
approval contract; it does not reopen Factor F, hotfix `016`, BOQ Rebase, or
stable item-code design.

## 2. User workflow in plain language

1. The admin creates one draft version.
2. The admin may add one item, several manual items, or apply one Supplement
   import to that same draft. The draft/version ID does not change for each row.
3. New rows are saved provisionally and the draft remains unpublishable.
4. The admin opens **จัดตำแหน่งรายการใหม่**, assigns each pending item to its
   category and selects an existing item immediately before or after it.
5. The application previews the resulting sequence and confirms all pending
   placements in one audited batch.
6. The publish-readiness guard clears only when the accepted placement revision
   still matches the draft. The admin can then finish other edits and publish
   the whole version once.

Creating another new item or changing placement-relevant data after confirmation
invalidates the prior placement review and requires one new confirmation. Normal
name/unit/price edits that do not alter placement do not create an artificial
placement task.

## 3. Recommended V1 scope

In scope:

- newly added identities only, whether created manually or by Supplement import;
- one batch review for every currently pending new identity in a draft;
- category selection plus a searchable same-category anchor and
  **ก่อนรายการนี้ / หลังรายการนี้** relation;
- anchors must be identities inherited from the draft base, not another new
  identity, so the placement graph cannot become circular or depend on an
  unreviewed provisional row;
- an explicit contiguous batch order applies only among new identities assigned
  to the same anchor/relation; it never permits inherited identities to be
  reordered;
- a deterministic preview showing the affected neighborhood and final sequence;
- active-admin/data-custodian confirmation in the existing one-publisher model;
- draft-only, function-only, idempotent, lock-versioned, fully audited mutation;
- keyboard-complete controls; drag and drop may be added later but cannot be the
  only interaction;
- final dataset hash and official exports reflecting the accepted
  `display_order` values.

Out of scope:

- arbitrary reordering of the inherited 710 baseline identities;
- item-code renumbering or identity changes;
- category taxonomy redesign;
- a second-person or multi-stage in-app approval engine;
- P-19 retired-row PDF policy;
- BOQ Rebase, new Factor F workflow, or expansion of hotfix `016`;
- direct SQL repair or UI-only writes to `display_order`.

If the owner later needs general reordering of inherited rows, treat it as a
separate Change Request. It has a much larger canonical-hash, export, audit, and
user-expectation blast radius than inserting new identities while preserving the
base relative order.

“Preserving base relative order” does **not** mean the old numeric
`display_order` values stay unchanged. Inserting `X` into `A, B, C` may produce
`A, X, B, C`, so B and C receive new sequence numbers and every shifted row is
audited. It means only that the old rows still appear in their prior order when
the new rows are removed from the candidate: B remains before C. A general
reorder would also allow `A, C, B`, which is outside this V1 scope.

## 4. Proposed database contract

WP-7.5 appends the reviewed Local-only source candidate
`021_master_catalog_phase4_placement_governance.sql`. WP-6.6 reserves `020` for
the prerequisite admin/authority hardening found by
[Completeness Audit #29](./29-phase4-owner-dev-completeness-audit.md). Do not
renumber or rewrite evidence-backed Local migrations `017`-`020`. Migration
`020` is already in the canonical Local bootstrap after P-28/P-29. Do not add
`021` to bootstrap until P-33 and the separate inclusion/WP-8 gate.

The implementation should use DB-backed authority rather than inferring approval
from UI state, current integers, or free-form audit JSON:

- add a nonnegative `placement_revision` to the draft version;
- increment it whenever a new identity is added or placement-relevant state can
  change in a draft containing new identities;
- add append-only `catalog_placement_reviews`, unique by
  `(version_id, placement_revision)`, with the accepted revision, change set,
  normalized placement payload, new-identity count, affected range/count, actor
  snapshot, reason, request ID, and timestamp;
- extend `catalog_change_sets.change_type` with `placement` and
  `catalog_change_items.action` with `place`; append complete old/new snapshots
  for every row whose `display_order` changes so deterministic shifts are not
  hidden from audit;
- enforce deferrable uniqueness of `(version_id, display_order)` and validate a
  contiguous zero-based range before placement confirmation and publication;
- expose one exact public wrapper, `place_catalog_items`, backed by
  an unexposed private privileged function with active-admin and feature-flag
  checks, exact grants, fixed `search_path`, request fingerprinting, expected
  lock version, and bounded timeouts;
- lock the draft/version in the same deterministic order used by other catalog
  mutations, perform the renumber/audit/review atomically, and roll back every
  effect on any rejection;
- preserve the relative order of every identity inherited from the base version;
- reject missing/duplicate new identities, cross-category anchors, self-anchors,
  anchors outside the draft/base contract, gaps, duplicate positions, and any
  attempt to reorder an inherited identity;
- treat the submitted batch order as an explicit integer contract rather than
  incidental JSON array order, and require unique contiguous values from zero;
- keep direct table writes revoked and RLS enabled on every new public table.

P-18 must evolve the publish rule from “any new identity is blocked” to “a draft
with new identities is blocked unless its current placement revision has a
matching accepted review and all order/base-relative invariants pass.” The DB
publish function remains the final authority even when the UI reports readiness.

No second catalog-equivalence hash is introduced. The existing canonical dataset
hash remains authoritative and already includes `display_order`. Placement
revision is only workflow freshness; publication recomputes the normal dataset
hash from the exact final rows.

## 5. UI and operating contract

WP-6.6 closes the current language/comprehension and shared workflow gaps before
WP-7. WP-7.5 then
adds the placement task without mixing it into the general item editor:

- Thai is the primary operator language for headings, labels, actions, statuses,
  validation, and recovery;
- **บันทึกการเปลี่ยนในฉบับร่าง** and **เผยแพร่ทั้งฉบับ** are visually and
  linguistically separate actions;
- rehearsal placeholders such as `WP-4 local-only...`,
  `LOCAL-WP5-REHEARSAL...`, and synthetic publisher names are removed from
  user-entered production-capable forms;
- lock versions, UUIDs, request IDs, and change-set IDs move to a compact
  support-details area and remain copyable when troubleshooting;
- the placement screen lists all pending new identities and supports one batch
  preview/confirm, rather than forcing a new catalog version per item;
- manual add remains suitable for one or a few exceptions; Supplement import
  remains the bulk intake path; both converge on the same placement review;
- the UI cannot imply publication readiness while placement review is stale or
  missing.

## 6. Required verification

Repository/static checkpoint passed on 2026-07-15:

- candidate `021` implements the revisioned append-only review, exact bounded
  RPC, fixed-search-path/RLS/grant contract, deterministic complete order,
  shifted-row audit, readiness parity, publish guard, and disabled-default
  postconditions;
- the Next.js read/action path and Thai placement workspace cover all pending
  new identities in one batch, searchable inherited anchors, before/after
  placement, same-anchor sibling ordering, a final preview, one confirmation,
  stale-state recovery, and hidden/disabled Add/Supplement fallback;
- TypeScript, focused and full unit/static tests, lint, authority check,
  dependency audit, network-enabled production build, and diff checks passed;
- migration `020` remained byte-for-byte unchanged at SHA-256
  `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`;
- no Local DB command, bootstrap edit, feature enablement, Production action,
  P-19, Factor F workflow, or hotfix expansion occurred.

The historical checkpoint above was source evidence only. P-32 later approved
and completed the Local SQL/visual evidence. The tracked checks proved the
technical bullets below; the final intended-admin bullet remains assigned to
WP-8:

- one and multiple manual/Supplement additions remain blocked before placement;
- a valid batch placement preserves base relative order, creates one accepted
  placement revision, and clears only the P-18 blocker;
- adding or changing placement-relevant state after confirmation makes the
  placement stale and blocks publication again;
- same request ID/same payload returns the prior result; same ID/different
  payload rejects; stale lock and concurrent placement have one deterministic
  outcome;
- invalid anchors, cross-category placement, duplicate/gapped order, inherited
  row reordering, and mid-operation failure leave rows, revision, audit, pointer,
  BOQs, and Factor F unchanged;
- anonymous, staff, inactive admin, and direct-table write paths are denied;
- published rows/reviews remain immutable;
- final canonical hash, Excel sequence, PDF sequence, and tracked verifier match
  the accepted order;
- the exact accepted P-11 baseline pair remains preserved as historical visual
  evidence; a later candidate pair is generated only from that exact final
  candidate and does not overwrite the accepted baseline pair;
- intended-admin WP-8 UAT must still add several rows, place them as one batch, explain
  draft versus publish, recover from one stale-placement error, and finish
  without developer or SQL assistance.

P-32 exact technical evidence:

- fresh canonical reset through `020`, then separate amended `021` apply;
- DB/harness source checkpoint
  `80b2574bbaccc5bb14093aa204a46fcc50ba1d5c`;
- evidence JSON
  `tmp/master-catalog/wp75-evidence/20260715-clean-chain-80b2574.json`, SHA-256
  `875488a965c9c24fbe82a373d2bb18e585f7b6df4fb9267041f909eae1c05602`;
- candidate `d887b28e-0486-408f-955b-9c5206dd4166`, version `2568.1.0`, 713
  rows, hash
  `sha256:c6baec46d90642dd27f2968328d9a3aacd9d70830f109ad2f80c6d935df552a6`;
- five-sheet Excel, 19-page PDF, and tracked semantic verifier matched exact
  count/order/hash on artifact source `7d60ab60`;
- Thai real-route UI on `99fa56c3d3c68e1886fbd308d8536e598eaee02f`
  proved two new items, same-anchor sibling
  ordering, accepted-state clarity, 700 affected final-review rows, desktop and
  390x844 mobile no-overflow, and audited abandon;
- final pointer `2568.0.0`/710, zero working drafts, all three flags `false`,
  BOQ 198/1,547, Factor F `2569.0.0`/36, Production touched: No.

The final bullet in the earlier list remains a WP-8 independent intended-admin
UAT requirement; Codex-driven browser evidence does not replace it. P-33 exact
owner accept/hold is the only remaining WP-7.5 closeout decision.

## 7. Schedule and safe alternatives

These are current remaining effort bands, not calendar promises or permission
to skip gates:

| Remaining band | Expected focused engineering effort |
|---|---:|
| P-33 owner review of completed WP-7.5 evidence | Focused review; no new engineering unless held |
| WP-8 clean rehearsal, performance, intended-admin UAT, and readiness package | 1-2 focused days plus reviewer availability |
| Earliest remaining path before any Production request | About 1-2 focused days after P-33; approval and independent UAT availability may extend calendar time |

Limited safe alternative: finish the shared WP-6.6 gates, defer WP-7.5, keep the
DB guard, and hide/disable Add and Supplement at P-14. This reduces placement
scope, but admins cannot publish new identities. Exposing the current
half-complete Add/Supplement workflow is not recommended.

## 8. Owner/data-custodian decisions recorded

P-30 accepted these five points on 2026-07-15 01:37 +07:

1. V1 placement applies only to identities absent from the draft's base version.
2. Placement uses category plus before/after an existing same-category anchor.
3. One active admin/data custodian may confirm the batch under the existing
   publisher model; no second-person workflow is added in V1.
4. The inherited base identities retain their relative order; arbitrary reorder
   remains a separate future Change Request.
5. WP-7.5 becomes a required dependency of WP-8/P-14 for the full Add/Supplement
   release; otherwise those controls remain hidden/disabled.

Approval of these five points authorizes the bounded Local-only migration,
application, tests, and documentation candidate. It does not authorize adding
`021` to the canonical bootstrap, applying it to Local, resetting Local
Supabase, running WP-8, Production migration, deploy, feature enablement, or
publication; each still requires its existing separate approval.

P-31 subsequently accepted exact Source/Static checkpoint
`4e3574a31a2697f4d727acabc8f55f34a4233bff` for commit/push on 2026-07-15
10:24 +07. The accepted migration `021` SHA-256 is
`78359215f7d859d9c167db608e1e96d66712b6b06a9d103fd7b26ce781835a83`.
This acceptance closes only the source-review gate. It does not authorize
bootstrap inclusion, Local reset/apply/live evidence, WP-8, P-19, Factor F or
hotfix expansion, feature enablement, publication, or Production.

P-32 later authorized the warned Local reset, separate apply, and live evidence.
The first execution made the P-31 hash historical by exposing fail-closed
PostgreSQL `42704` in the placement RPC. Both diagnostic runs cleaned all
fixtures and restored pointer/flags. The schema-qualified same-scope amendment
has SHA-256
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`;
replacement source/live evidence then passed as recorded in Section 6. P-33
exact owner acceptance, bootstrap inclusion, WP-8, and Production remain
separate.
