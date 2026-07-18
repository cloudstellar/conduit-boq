# Phase 4 P-39: Draft Identity and Release-Number Correction

**Status:** Owner-approved for the P-39R Local-only architecture correction,
source, migration, documentation, and verification work on 2026-07-18. P39R-S
passed on the corrected working-tree candidate; exact commit provenance,
P39R-L/P39R-C/P39R-U, and Production approval remain pending. The earlier
P39-S result is historical. Production remains unapproved and untouched.

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
  follows use in an issued snapshot, not `is_active` or first-seen state.
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
- Migration `022` must not update BOQ or Factor F tables.
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
2. **P39R-L incremental Local:** separately approve and apply `022` to the
   disabled Local baseline without reset; prove existing abandoned rows are
   backfilled/released, current pointer/BOQ/Factor F remain unchanged, and all
   flags remain false.
3. **P39R-C clean chain:** after an explicit destructive-reset warning and
   separate Owner approval, bootstrap `009`-`015`, hotfix `016`, and Phase 4
   `017`-`022`; rerun DB/RLS/concurrency/export/advisor/invariant evidence.
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

## 7. Deployment and rollback compatibility

All Master Catalog feature flags must be `false` while migration `022` and its
matching application are deployed. Compatibility is intentionally bounded:

| Application | Database | Supported operation |
|---|---|---|
| Pre-P-39R | Pre-`022` | Existing behavior only |
| Pre-P-39R | Post-`022` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin mutations |
| P-39R | Pre-`022` | Normal non-catalog paths while all catalog admin flags are off; do not use Master Catalog admin routes |
| P-39R | Post-`022` | Supported P-39R combination after verification and explicit flag approval |

After `022` is applied, an application-only rollback is not an approved way to
resume catalog administration. Keep all catalog admin flags off and fix forward
to the matching P-39R application. Migration `022` is transactional; an apply
failure rolls back to the pre-`022` schema. Any rollback after a successful
Production apply requires a separately reviewed data-safe plan.

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
