# Phase 4 P-18 Placement Governance Review Note

**Status:** Proposed V1 contract for owner/data-custodian review; the owner
authorized adding this review and WP-7.5 to the plan on 2026-07-12, but P-18
business rules and Local implementation are not yet approved

**Environment:** Planning only; no Local reset, database mutation, Production
access/write, feature enablement, or publication is authorized by this note

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

WP-7.5 should append a new reviewed root migration, proposed as
`021_master_catalog_phase4_placement_governance.sql`. WP-6.6 reserves `020` for
the prerequisite admin/authority hardening found by
[Completeness Audit #29](./29-phase4-owner-dev-completeness-audit.md). Do not
renumber or rewrite evidence-backed Local migrations `017`-`019`, and do not add
`020` or `021` to the Local
bootstrap until the file and implementation have been reviewed.

The implementation should use DB-backed authority rather than inferring approval
from UI state, current integers, or free-form audit JSON:

- add a nonnegative `placement_revision` to the draft version;
- increment it whenever a new identity is added or placement-relevant state can
  change in a draft containing new identities;
- add append-only `catalog_placement_reviews`, unique by
  `(version_id, placement_revision)`, with the accepted revision, change set,
  new-identity count, actor snapshot, reason, request ID, and timestamp;
- extend `catalog_change_sets.change_type` with `placement` and
  `catalog_change_items.action` with `place`; append complete old/new snapshots
  for every row whose `display_order` changes so deterministic shifts are not
  hidden from audit;
- enforce deferrable uniqueness of `(version_id, display_order)` and validate a
  contiguous zero-based range before placement confirmation and publication;
- expose one exact public wrapper, proposed as `place_catalog_items`, backed by
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

WP-7.5 is not complete until tracked tests prove:

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
- intended-admin WP-8 UAT can add several rows, place them as one batch, explain
  draft versus publish, recover from one stale-placement error, and finish
  without developer or SQL assistance.

## 7. Schedule and safe alternatives

These are effort bands, not calendar promises or permission to skip gates:

| Remaining band | Expected focused engineering effort |
|---|---:|
| WP-6.6 admin workflow completeness and authority hardening | 3-5 days |
| WP-7 permanent BOQ/hotfix `016`/Factor F regression suite | 1-2 days |
| P-18 decision closure plus WP-7.5 migration/RPC/UI/tests | 3-5 days |
| WP-8 clean rehearsal, performance, intended-admin UAT, and readiness package | 1-2 days plus reviewer availability |
| Recommended full path before Production requests | About 9-15 focused engineering days, usually 2-3 calendar weeks because decisions, reset approvals, review, and human UAT are real gates |

Limited safe alternative: finish the shared WP-6.6 gates, defer WP-7.5, keep the
DB guard, and hide/disable Add and Supplement at P-14. This reduces placement
scope, but admins cannot publish new identities. Exposing the current
half-complete Add/Supplement workflow is not recommended.

## 8. Owner/data-custodian decision required

Before WP-7.5 implementation, explicitly accept or amend these points:

1. V1 placement applies only to identities absent from the draft's base version.
2. Placement uses category plus before/after an existing same-category anchor.
3. One active admin/data custodian may confirm the batch under the existing
   publisher model; no second-person workflow is added in V1.
4. The inherited base identities retain their relative order; arbitrary reorder
   remains a separate future Change Request.
5. WP-7.5 becomes a required dependency of WP-8/P-14 for the full Add/Supplement
   release; otherwise those controls remain hidden/disabled.

Approval of these five points authorizes Local-only implementation planning. A
Local Supabase reset, Production migration, deploy, feature enablement, and each
publication still require their existing separate approvals.
