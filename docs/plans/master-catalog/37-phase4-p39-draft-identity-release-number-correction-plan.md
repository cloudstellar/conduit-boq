# Phase 4 P-39: Draft Identity and Release-Number Correction

**Status:** Owner-approved for the P-39R Local-only architecture correction,
source, migration, documentation, and verification work on 2026-07-18. P39R-S
passed and exact source commits through `6f01457` are pushed. Incremental `022`
and corrected `023` apply/readback passed without reset. The resumed live
harness then exposed migration `021` row-trigger amplification while cloning
710 rows. Owner-approved forward `024` is the one bounded remaining database
correction; its exact commit/apply/live proof is pending. P39R-L remains in
progress, while P39R-C/P39R-U and Production approval remain pending. The
earlier P39-S result is historical. Production remains untouched.

**Supersedes for future execution:** P-23.1's rule that every created draft
permanently consumes its proposed catalog version. P-23.1 evidence remains
historical; it must not be used as the current numbering contract.

## 1. Owner finding

P-38 Card A created Local draft `2568.16.0`, abandoned it, and created a
replacement `2568.17.0`. The Owner understood the existing rule but challenged
its business effect: repeated draft cancellation can create unexplained gaps
between official releases, such as `2568.15.0` followed by `2568.17.0`.

That behavior is internally auditable but gives one identifier two meanings:

1. the work attempt used by an admin; and
2. the official catalog release cited by users, BOQs, exports, and approvals.

The correction separates those meanings before Phase 4 reaches Production.

## 2. Decision

Every draft receives an immutable internal reference such as
`2568.1.0-D001`. The admin also chooses annual/revision/patch intent and sees a
**target version**, such as `2568.1.0`.

- The draft reference is permanent and remains attached to its snapshot,
  change sets, imports, placement reviews, abandonment reason, and publication.
- Draft references combine the immutable target with a target-scoped attempt
  ordinal. A replacement for `2568.1.0-D001` becomes `2568.1.0-D002`; the
  suffix is audit identity and never part of the official catalog version.
- The target tuple is claimed while the draft is mutable, preventing a
  concurrent draft or publication from using it.
- Publishing atomically turns the claimed target into the official version.
- Abandoning before publication keeps the target in audit metadata but releases
  the official tuple, so a replacement draft can use the same target.
- Published and archived tuples remain unique, immutable, and never reusable.
- A cancellation after an external approval process has formally issued a
  number is a future approval-state requirement. Phase 4 V1 has no separate
  submit-for-approval state, so publication remains the issue point.

### 2.1 P-39R owner/developer correction

The architecture audit after the initial P39-S candidate found several
cross-layer contracts that needed to be explicit before live verification.
P-39R therefore controls the current candidate and supersedes conflicting
P-22/P-23.1 execution wording without erasing their historical evidence.

- Phase 4 V1 permits **at most one open draft globally**, regardless of its
  base version. This matches the single-admin publication lane and prevents two
  competing workspaces from becoming ambiguous.
- A draft whose base is no longer the current default is stale. It remains
  immutable except for audited abandonment; import, item mutation, placement,
  readiness, and publication continue to require a current-base draft.
- Restoring a prior published/active version records whether the one open draft
  remains current or becomes stale. Phase 4 Core does not restore an archived
  row because it exposes no archive transition. The operator must see the draft
  effect before confirm.
- External approval may cite immutable `draft_reference` and
  `target_version_string`, but it does not issue the official number. The
  official tuple is issued only by the atomic publication transaction.
- Active staff may read published/archived catalog history. Active admins may
  additionally read the open draft. Dormant legacy direct-DML policies are
  removed; supported mutation remains RPC-owned and server-authorized.
- Published/archived snapshot reads include identities and codes for inactive
  catalog rows and for codes first created in an earlier draft. Authorization
  follows the exact `(identity_id, item_code)` pair used in an issued snapshot,
  not `is_active`, identity reuse alone, or first-seen state.
- Pending, inactive, and suspended profiles must see no catalog state even when
  their authentication token remains valid.
- Publish/restore audit records carry durable pointer-before and pointer-after
  identifiers plus the affected draft/effect where applicable.
- Lifecycle timestamps and publication metadata are complete and immutable;
  compatibility backfill must preserve historical `updated_at` values.

## 3. Database contract

Forward migration `022_master_catalog_phase4_draft_identity_and_release_number.sql`
must preserve reviewed migrations `020` and `021` and add:

- `target_major`, `target_minor`, `target_patch`, and generated
  `target_version_string`;
- immutable positive `draft_attempt`, allocated under a target-scoped advisory
  lock, plus generated `draft_reference` in `{target}-D{nnn}` form where the
  attempt is padded to at least three digits and is never truncated;
- one atomic migration transaction, including postconditions, so a failed
  apply restores the pre-`022` schema and lifecycle guards;
- nullable official `major/minor/patch` only for `abandoned` rows;
- lifecycle constraints requiring a mutable/published claimed tuple to match
  its target and requiring an abandoned tuple to be released;
- immutable abandoned/published metadata including target and draft identity;
- at most one `status = 'draft'` row globally, enforced by a partial unique
  index rather than a per-base invariant;
- complete publication metadata whenever a row is published or archived;
- immutable terminal rows even when an attempted update would be a no-op;
- durable pointer-before/pointer-after and restore draft-effect audit fields;
- least-privilege active-staff and active-admin RLS reads with obsolete direct
  write policies removed;
- backfill behavior that preserves historical lifecycle timestamps;
- idempotent abandon responses that return the retained target and draft
  reference, and replay responses that return the same complete identity; and
- a paged version register that returns official/claimed, target, and draft
  identifiers explicitly.

The existing `uq_major_minor_patch` remains the authoritative uniqueness guard.
An abandoned row has null official segments, while its target segments and
draft reference remain non-null and immutable. The next-number functions then
consider issued or currently claimed tuples and naturally ignore released
abandoned targets.

Forward migration `023_master_catalog_phase4_published_code_rls_scope.sql`
preserves applied `022` and narrows only `catalog_item_codes_select`: staff may
read a registry code only when the exact identity/code pair occurs in an
`active` or `archived` snapshot; active admins retain complete registry access.
It performs no catalog-row, BOQ, or Factor F data writes. This fix-forward path
preserves Local migration provenance instead of rewriting applied `022`.

Forward migration `024_master_catalog_phase4_set_based_placement_invalidation.sql`
preserves applied `021`-`023` business semantics and replaces only the
placement-invalidation trigger execution shape:

- three `AFTER ... FOR EACH STATEMENT` triggers use PostgreSQL transition
  tables for `INSERT`, `UPDATE`, and `DELETE`;
- direct new-identity detection remains set-based against the exact base
  version;
- transaction-local markers cache both already-invalidated versions and
  versions proven to have no new identity, so clone/import work does not repeat
  whole-draft scans for every row;
- `catalog.placement_write = 'on'` remains the placement RPC bypass because
  that RPC owns its revision increment atomically;
- no permanent cache column/table or duplicate mutation implementation is
  introduced; and
- all three catalog feature flags must remain false before and after apply.

## 4. Application and export contract

The UI must not call a target an issued version before publication.

- Draft list/detail/import/review/placement surfaces show the draft reference
  as the work identity and `เป้าหมาย x.y.z` as secondary context.
- Creation explains that publication issues the official number and
  abandonment releases an unissued target.
- Abandon confirmation states both the permanent audit effect and target
  release effect.
- Abandoned detail shows the retained draft reference/target and explains that
  the target was not issued.
- Published/archived screens continue to lead with the official version.
- No shared `versionString` label may collapse official, target, and draft
  meanings. Application types, logs, confirmations, and responses name each
  identifier explicitly.
- Draft Excel/PDF artifacts include the draft reference and target label; their
  filenames include the draft reference to prevent two attempts for one target
  from overwriting each other.
- Official Excel/PDF layout and official version references remain unchanged.

All mutations continue to address rows by UUID and expected lock version. UI
labels never become database authority.

## 5. Safety boundaries

- Production `2568.0.0` remains authority for names, units, and prices.
- No Production migration, flag, pointer, catalog row, BOQ, Factor F, or hotfix
  operation is authorized.
- Migrations `022`-`024` must not update BOQ or Factor F tables; `023` must not
  update catalog business rows, and `024` must not replace business RPCs or
  execute catalog-row rewrites during migration apply.
- The one-open-draft-global rule, current-base mutation requirement, audited
  abandon, placement, readiness, exact-lock publish, idempotency, RLS, and
  immutable-history rules remain.
- Historical P-23.1/G1R/G2/G3 evidence is retained but does not prove P-39.
- A full Local bootstrap is destructive and requires a fresh explicit Owner
  approval after source/static checks are ready.

## 6. Verification gates

1. **P39R-S source/static:** migration contract, version planner, read models,
   UI language, export metadata/filenames, authority consistency, TypeScript,
   lint, build, and full tests pass.
2. **P39R-L incremental Local:** separately approve and apply `022`, `023`, and
   the final bounded `024` discovered by the live gate, to the disabled Local
   baseline without reset; prove existing abandoned rows are backfilled and
   released, staff code visibility requires an issued identity/code pair,
   clone/import placement invalidation is set-based and retains revision
   semantics, current pointer/BOQ/Factor F remain unchanged, and all flags
   return to false.
3. **P39R-C clean chain:** after an explicit destructive-reset warning and
   separate Owner approval, bootstrap `009`-`015`, hotfix `016`, and Phase 4
   `017`-`024`; rerun DB/RLS/concurrency/export/advisor/invariant evidence.
4. **P39R-U owner rerun:** prepare a new bounded no-reset UAT fixture. The Owner
   creates a draft, notes its draft reference and target, abandons it, creates a
   replacement, and confirms that the replacement receives a new draft
   reference but reuses the same unissued target without explanation from the
   developer.
5. Resume the remaining P-38 Cards only after P39R-U passes. P-37/WP-8 and all
   Production gates remain Hold until their independent closure evidence passes.

### 6.1 Historical P39-S source/static result (superseded 2026-07-18)

The pre-P-39R Local-only candidate passed the then-current P39-S gate:

- migration `022` SHA-256 is
  `c517dc24ca16a7b32f32c5f7998668fe79135901e44e27defb43f6ec1df6de09`;
- `npm test` passed 33 files/188 tests;
- `npx tsc --noEmit --pretty false` passed;
- `npm run lint` exited 0 with the same 10 existing warnings outside P-39;
- `npm run catalog:authority:check` passed 710 mappings/65 groups/17
  exclusions with SHA-256
  `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`;
- both Node harness syntax checks and `bash -n scripts/bootstrap-local-db.sh`
  passed;
- the network-enabled production build passed with only the existing
  middleware-to-proxy deprecation warning; and
- `git diff --check` passed.

This evidence was produced from the pre-P-39R working-tree candidate based on
`b2f6a22510c5391e19e1943a08fb448cc087f7dd`. Record the exact commit after it
exists. No Local migration/apply/reset or Production action occurred. It is
retained only as historical evidence and does not pass P39R-S or authorize a
live gate.

### 6.2 P39R-S source/static result

Passed on the corrected working-tree candidate based on
`b2f6a22510c5391e19e1943a08fb448cc087f7dd`:

- migration `022` SHA-256 is
  `9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3`;
- `npm test` passed 33 files/189 tests;
- `npx tsc --noEmit --pretty false` passed;
- `npm run lint` exited 0 with the same 10 existing warnings outside P-39R;
- `npm run catalog:authority:check` passed 710 mappings/65 groups/17
  exclusions with SHA-256
  `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`;
- both changed Node harnesses and `scripts/bootstrap-local-db.sh` passed syntax
  checks;
- the network-enabled production build passed with only the existing
  middleware-to-proxy deprecation warning; and
- `git diff --check` passed.

No Local migration/apply/reset, feature-flag change, Production action, BOQ
write, Factor F work, or hotfix expansion occurred. Exact commit provenance is
recorded only after a commit exists. P39R-L remains a separately approved live
gate and is not inferred from P39R-S.

### 6.3 P39R-L incremental discovery and fix-forward

On exact pushed source `7997387`, owner-approved incremental `022` apply passed
its transaction and postconditions. Before/after evidence retained pointer
`2568.0.0`/710 and canonical hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`;
BOQ 198 and BOQ items 1,547 retained exact table hashes; Factor F retained two
versions/73 rows and default `2569.0.0`/36; all flags were false and no draft
remained. Historical Local attempts became `2568.16.0-D001` and
`2568.17.0-D001`, retained 710 rows each, and released their official tuples.

The live WP-6.6 harness then stopped safely before mutation because accumulated
published history exposes 713 identities rather than the clean-baseline 710.
Review confirmed that published-history identity union is intended, while the
code policy also needed the exact code-pair predicate to prevent a future
draft-only alias of an issued identity from leaking to staff. Cleanup restored
all flags, pointer, zero drafts, and BOQ counts. The first `023` apply from exact
pushed `072294d` created the intended policy but its textual postcondition did
not account for PostgreSQL's implicit `item_code` cast. The transaction rolled
back completely and canonical pre-`023` state remained exact. Corrected
migration `023` SHA-256
`cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88`
matches the inspected parse form without weakening the policy predicate.
Corrected `023` then applied transactionally from exact pushed `6f01457` and
canonical evidence detected `017`-`023` with pointer `2568.0.0`/710 and hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`.

The full WP-6.6 rerun passed the corrected RLS boundary, published-history
counts, and transient draft-only code denial, then safely stopped during the
post-publish restore-impact draft clone with PostgreSQL statement timeout.
PostgreSQL logs traced the timeout to
`private.touch_catalog_placement_revision()` from migration `021`: its
row-level trigger repeated candidate/base anti-joins for every row in the
710-row `INSERT ... SELECT`. The failing RPC transaction rolled back. Cleanup
confirmed zero drafts, all three flags false, the same pointer/catalog hash,
BOQ 198/items 1,547 with zero unversioned BOQs, and Factor F `2569.0.0`/36.

Migration `024` SHA-256
`d3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25`
is the owner-approved bounded fix-forward candidate. It uses statement-level
transition tables plus transaction-local positive/negative version markers;
it does not copy the large apply RPC or add denormalized persistent state.
P39R-L is not passed until exact committed `024` applies, WP-6.6 and WP-7.5
live suites pass, and final invariants pass on one exact pushed source.

## 7. Deployment and rollback compatibility

All Master Catalog feature flags must be `false` while migrations `022`-`024`
and their matching application are deployed. Compatibility is intentionally
bounded:

| Application | Database | Supported operation |
|---|---|---|
| Pre-P-39R | Pre-`022` | Existing behavior only |
| Pre-P-39R | Post-`022`, pre-`023` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin mutations |
| Pre-P-39R | Post-`023`, pre-`024` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin mutations |
| Pre-P-39R | Post-`024` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin mutations |
| P-39R | Pre-`022` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin routes |
| P-39R | Post-`022`, pre-`023` | Keep catalog flags off; P39R-L fix-forward is incomplete |
| P-39R | Post-`023`, pre-`024` | Keep catalog flags off; placement clone/import performance correction is incomplete |
| P-39R | Post-`024` | Supported P-39R combination after verification and explicit flag approval |

After `022` is applied, an application-only rollback is not an approved way to
resume catalog administration. Keep all catalog admin flags off and fix forward
through `024` and the matching P-39R application. All three forward migrations
are transactional; an apply failure rolls back that migration's transaction. Any
rollback after a successful Production apply requires a separately reviewed
data-safe plan.

## 8. P-38 interruption record

The prepared P-38 session on source `b2f6a22510c5391e19e1943a08fb448cc087f7dd`
was closed without reset on 2026-07-18. Local `2568.16.0` and `2568.17.0`
were both audited-abandoned, the pointer remained `2568.0.0` with 710 rows,
working drafts returned to zero, all three catalog flags returned to `false`,
BOQ remained 198/1,547 with zero unversioned BOQs, Factor F remained
`2569.0.0`/36, and Production was untouched.

These Local attempt numbers are historical P-38 evidence. Migration `022` will
retain their target values and assign draft references while releasing their
unissued official tuples.
