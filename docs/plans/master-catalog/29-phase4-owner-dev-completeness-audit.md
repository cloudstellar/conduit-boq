# Phase 4 Owner/Developer Capability Completeness Audit

**Status:** P-22 operator-workflow correction accepted; source/static
implementation passed on `ac31feb` on 2026-07-12. Earlier P-21 evidence on
`3bfc74e` remains historical and is superseded for revised closeout. G1 Local
DB/concurrency/P-20 input passed on final checkpoint `e463270`; the
pre-amendment operator/browser preflight passed on `c8f6dca`. P-23 approved the
remaining operator identity/navigation/contextual-import/export-semantics
amendment. Its first working-tree UI/static/browser checkpoint passed on
2026-07-13. P-23.1 and P-24 then amended candidate `020` and the operator flow;
P-24 repository/static verification passed on exact implementation commit
`88d0711`; final owner-approved G1R then passed on exact execution checkout
`721c2c2`. The separately approved independent G2 clean rebuild and P-20
comparison then passed on the same exact candidate. G3 owner closeout must
precede WP-7. The bounded no-reset G3 real-route technical walkthrough passed
on source `6599c30`. P-26 then closed the remaining human-intent gap for
Publish, Recode, and Retire on a working-tree candidate based on `2fd438d`;
the no-reset Local proof passed and returned Local to its disabled baseline.
P-26 was committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`,
and the owner accepted G3/WP-6.6 on that checkpoint at
2026-07-14 23:50 +07. P-28 approved G4 repository integration and WP-7 harness
source on 2026-07-15 without authorizing the destructive clean execution.

**Environment:** Source/document audit only. No Local database reset, Production
access/write, feature enablement, publication, new Factor F workflow, or hotfix
scope expansion was performed or authorized by this audit.

## 1. Correction to the earlier completeness statement

The earlier statement that the Phase 4 architecture was "complete" was too
broad. What had actually been demonstrated was a strong bounded safety core:
version lineage, stable identity, RLS/function boundaries, request idempotency,
publish immutability, canonical hash/export verification, and fail-closed P-18
and structured-code guards.

That evidence did not prove that every owner/admin workflow was complete from
screen to database to audit and recovery. The implementation was reviewed one
work package at a time, but the plan did not require a final capability trace
across route, UI, Server Action, RPC, schema invariant, audit evidence, and
operator procedure for every promised business action. This audit adds that
missing cross-cutting gate.

The correction is therefore:

- the existing safety architecture remains reusable and should not be rebuilt;
- WP-6.5 evidence remains valid for its stated reliability scope;
- Phase 4 is not yet operator-complete or release-ready;
- WP-6.6 must close the capability gaps below before WP-7/WP-8 can support a
  full Master Catalog release claim.

## 2. Audit method

Each Change Request capability was traced through these layers:

1. operator route and visible workflow;
2. read model and exact selected draft/version/item;
3. Server Action and untrusted-input validation;
4. public wrapper and private database implementation;
5. RLS, grants, constraints, locks, and idempotency;
6. complete old/new audit and correction path;
7. publish-readiness parity and official export effect;
8. automated evidence, browser evidence, and intended-admin UAT;
9. operating procedure, runbook, and decision ownership.

A capability is complete only when all applicable layers are implemented and
the same rule is proved at its authoritative layer. A DB rejection is a valid
safety control, but it does not by itself make the operator workflow complete.

## 3. What remains sound

Keep and extend these implemented foundations:

- immutable published catalog versions and singleton current pointer;
- stable UUID identity and non-reusable business-code registry;
- base-version lineage and stale-base rejection;
- active-admin/function-only mutations with RLS and explicit grants;
- stable request IDs, fingerprints, optimistic locks, advisory locks, and
  atomic rollback;
- complete row snapshots for currently supported change actions;
- canonical dataset count/hash and independently verifiable Excel export;
- P-18 new-identity hold and structured-code exception guard;
- separation from BOQ history, hotfix `016`, and Factor F governance.

These controls explain why the current Local implementation fails safely. They
do not remove the need for the operator-completeness work below.

## 4. Release-blocking capability gaps

| ID | Finding and current evidence | Required closure before full release |
|---|---|---|
| C-01 | Version detail reads only the first 20 price rows; the editor offers at most 12 active samples. Version/history reads also stop at fixed 25/50-row limits without pagination. There is no full-catalog search/filter route or item-detail/identity timeline route promised by the architecture. | Use deterministic paged data reads so PostgREST row caps cannot truncate the dataset, then load/filter all current items client-side within the measured 2,000-row threshold. Add exact item detail/field-level identity history and paginate version/audit registers instead of silently truncating them. |
| C-02 | The implemented architecture permits multiple mutable drafts from the same current base. Exact selection prevents hidden targeting, but the intended V1 operator model is one release workspace at a time and has no safe abandon/replacement lifecycle. | Enforce at most one mutable draft per base in the database, expose one current working draft, retain stale/abandoned versions read-only, and add audited idempotent abandon before replacement. |
| C-03 | Manual/import mutation accepts free-form category and `AAA/TTT` names. Database helpers create missing categories/groups from caller text, although display categories must follow the Production-derived versioned set and P-06 approved a controlled 22/65 code-group dictionary. | Freeze the approved versioned categories and P-06 code groups, resolve existing IDs only, and move any future taxonomy creation to a separate audited governance decision. |
| C-04 | Architecture requires the next never-issued sequence in an approved group, but the UI/RPC requires an arbitrary full `AAA-TTT-NNN` code. | Add a locked server allocator that selects the approved group, uses the next never-issued sequence, never fills retired gaps, and blocks at 900. Exact frozen first-rollout mappings remain a reviewed migration/import exception. |
| C-05 | Import preview shows summary counts and diagnostics, not the complete server-recomputed add/update/recode/retire/unchanged diff or exact full-import omissions. Runtime context reads the draft reconciliation CSV from `docs/`, always supplies an empty price-authority map, and is not a version-owned reusable authority. | Seed/freeze the approved first-rollout mapping into reviewed implementation/database authority; keep the draft CSV as evidence only. Reconcile future imports against the exact selected draft and approved dictionaries, return/display the authoritative diff/omission set, and support bounded import-level price authority with explicit per-row override only when required. |
| C-06 | Publication asks the admin to type `publishedByDisplayName` and stores it even though the DB contract defines an immutable authenticated actor snapshot. Date strings are regex-checked and then cast, so an impossible calendar date can escape the stable validation contract. | Derive publisher identity/display snapshot from the active authenticated profile and semantically validate ISO dates into stable errors before any cast/write. If a separate business approver is required, model and label it as separate approval metadata. |
| C-07 | Physical archive reference exists only on import records. A manual-only version can publish without a version-level filing reference despite the Change Request/runbook requirement. | Add bounded version-level `physical_archive_reference`, require it for Phase 4-created publication, and retain the approved legacy-baseline exception. |
| C-08 | The preliminary readiness RPC reports P-18/structured/P-19 counts but omits current-pointer base parity and the full dataset quality checks used later by publish. The UI can appear ready before the final DB function rejects. | Make readiness and publish consume the same complete private result, including stale base and canonical dataset quality. P-19 remains an explicit filing policy, not an invented DB publish rule. |
| C-09 | Retire has no same-draft reactivation path. A mistaken newly added identity cannot be withdrawn before first publication without leaving an inactive row and a P-19 hold. | Add audited `reactivate` for an inherited inactive identity and narrowly scoped `withdraw` for an identity absent from the base. Withdrawal removes the draft row atomically but preserves identity/code reservation and audit. |
| C-10 | Manual edit is a generic free-form form, is not prefilled from an exact item, and requires price authority even for a category-only change. | Use an exact item editor with current values, field-level diff, controlled selects, and require price authority only when name, unit, or money changes. |
| C-11 | Many labels/statuses remain English; production-capable forms contain Local/WP placeholder evidence; UUID/lock/change-set details are primary success content. | Make the workflow Thai-first, remove synthetic defaults, separate draft save from whole-version publish, and move copyable technical IDs to support details. |
| C-12 | The DB contract promised post-preflight nullability/order hardening, but `price_list` still permits nullable required fields/display order and has no per-version unique order constraint. | In an additive fix-forward migration, prove compatibility then enforce required nullability and the order constraints owned by the accepted scope. Do not rewrite migrations `017`-`019`. |
| C-13 | The publish panel appears before the full item workspace, and the only complete diff is import-specific. Manual plus import changes have no authoritative final draft-versus-base comparison immediately before publication. | Make the complete searchable catalog the primary workspace; compute final snapshot diff by stable identity; show overlapping change groups/old-new values/readiness; carry the reviewed expected lock into publish and require a fresh review after any mutation. |
| C-14 | Draft creation always suggests a revision and exposes raw major/minor/patch inputs, although annual versus revision versus patch depends on business authority. The overview only has a 25-row display list, and an abandoned annual `{year}.0.0` can block a truthful replacement under the old transition shape. | Require explicit business intent and owner-designated annual year; load a complete all-status registry or fail closed; permanently reserve identifiers; derive/show the next lane candidate; enforce sequence in candidate `020`; permit the next patch-0 annual revision in the same target year when lower identifiers are reserved. |
| C-15 | Successful create leaves the admin on the overview, detailed metadata delays the item workspace, and pointer restore submits without a current-to-target human confirmation. | Open the exact new draft after success; place compact context/actions then items before detailed document metadata; separate restore as recovery and confirm current/target, reason, and new-versus-historical BOQ behavior. |
| C-16 | Annual year accepts impractical far-future values; stale-sequence error copy can fall through to raw backend text or disappear when registry refresh remounts the form; internal P-labels and technical identifiers compete with the operator task; first-rollout authority and Factor F context can read as permanent workflow content. | Enforce base +1 through +10 in UI/server/DB; allowlist stable stale/range errors with Thai copy; key refresh state independently and focus a shared error alert; collapse support identifiers; remove internal labels; contextualize first-rollout authority and demote separate Factor F details. |
| C-17 | Exact-lock and database readiness prevent stale or invalid publication, but the visible Publish action previously submitted after one click without a separate human-intent check. Recode and Retire likewise changed code/status immediately after the item form submit. This left a preventable mis-click path even though database integrity remained protected. | Add a summary confirmation for Recode and Retire. Publish must show current/target version, reviewed lock, item count, BOQ effect, and immutability; require the admin to type the exact DB-read target version. Keep the final Server Action comparison server-owned and fail closed before the publish RPC. Prove mismatch disabled, exact match enabled, cancel/no-write behavior, responsive layout, and clean Local cleanup. |

P-18 placement and P-19 retired-row PDF policy are already recorded gates, not
new discoveries from this audit. WP-7 BOQ/hotfix `016`/Factor F regression and
WP-8 clean rehearsal/UAT/performance/advisors also remain required.

## 5. Corrected work-package sequence

| Order | Work package | Exit meaning |
|---:|---|---|
| 1 | WP-6.5 reliability and publish-boundary hardening | Preserve passed evidence for idempotency, concurrency, fail-closed guards, portability, and recovery. It is not an operator-completeness certificate. |
| 2 | WP-6.6 admin workflow completeness and authority hardening | Close C-01 through C-17 with migration/RPC/UI/audit/tests and owner browser review. No Local reset is implied by planning this work. |
| 3 | WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation | Regression-only; no new Factor F or hotfix workflow. |
| 4 | P-18 decision and WP-7.5 placement governance | Required for full Add/Supplement release; preserve inherited relative order while auditing every shifted numeric position. |
| 5 | P-19 decision when Retire is in release scope | Resolve official PDF treatment before filing a candidate with inactive rows. |
| 6 | WP-8 clean Local rehearsal and intended-admin UAT | Owner-approved reset, full workflow without developer/SQL help, performance, advisors, build/tests, and exact candidate evidence. |
| 7 | P-12 through P-15 | Separate Production migration, deploy, enablement, and publication approvals. |

WP-6.6 should be delivered in reviewable slices:

- A: full catalog browse, exact item editor, and identity history/diff;
- B: exact draft-bound workspace/import routes and stale-draft read-only recovery;
- C: resolve-only versioned categories/P-06 code groups and server code allocation;
- D: authoritative import diff/omission preview and price evidence;
- E: publisher/archive metadata and complete readiness parity;
- F: `reactivate` and draft-only-new `withdraw` correction actions;
- G: schema constraints, Thai workflow cleanup, observability, and full
  DB/browser/UAT evidence.
- H: one-current-base-working-draft invariant and audited abandon lifecycle;
- I: item-first workspace and authoritative final snapshot review before
  publish;
- J: persistent operator/environment context, information-only global
  navigation, approved-input versus review-export semantics, and return to the
  same draft after import apply.
- K: explicit version intent/all-status reservation, post-create exact-workspace
  navigation, item-before-metadata hierarchy, and pointer-restore confirmation.
- L: high-impact human-intent confirmation for Publish, Recode, and Retire,
  including server-owned exact-version comparison and cancel/no-write proof.

## 6. Migration and authority order

Do not edit evidence-backed Local migrations `017`-`019`.

- Reserve `020_master_catalog_phase4_admin_workflow_hardening.sql` for the
  accepted WP-6.6 database changes.
- Reserve `021_master_catalog_phase4_placement_governance.sql` for the later
  P-18/WP-7.5 extension.
- Keep `scripts/bootstrap-local-db.sh` at `009`-`015`, hotfix `016`, then
  `017`-`019` until each new migration exists, is reviewed, and its bootstrap
  inclusion is deliberately approved. P-28 satisfied that source-inclusion
  gate for unchanged accepted `020`; the script now ends at `020`, while its
  first clean execution remains separately gated.
- P-22 amends the still-unaccepted Local-only `020` before fingerprint freeze.
  This supersedes the `3bfc74e` migration fingerprint/evidence for closeout and
  requires new P-20/WP-7/WP-8 reruns. It does not erase the historical evidence
  for the earlier reviewed commit.
- P-23.1 amends the still-unaccepted `020` again for the guarded next-version
  sequence. Repository/static verification passed 2026-07-13. All earlier `020`
  fingerprints/live evidence remain historical; final G1R passed on exact
  `721c2c2` with migration SHA-256
  `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
  Independent G2 then reproduced the final candidate and P-20 hashes. G3
  technical stale-review recovery and cleanup also passed on `6599c30`; the
  owner closeout was accepted through P-27. P-28 later authorized repository
  inclusion without authorizing a Local reset.

## 7. Deliberate deferrals and control visibility

The following may remain outside Phase 4 without hidden debt only when the UI
does not imply they are supported:

- arbitrary reorder of inherited published identities;
- creation/editing of new category or `AAA/TTT` dictionary definitions;
- a second-person or multi-stage approval engine;
- stale-draft rebase/merge and destructive audit deletion; P-22 adds only
  audited abandon while stale/abandoned drafts remain read-only history;
- server pagination/virtualization before the measured threshold;
- BOQ Rebase, K-formula governance, new Factor F workflow, or hotfix expansion.

If the owner chooses a limited first release, hide Add, Supplement, and Retire
until their gates close. Update/recode may be released only after the shared
WP-6.6 browse, draft, authority, publication metadata, readiness, and UAT gates
pass. A disabled control with a truthful reason is acceptable; a visible path
that can never finish is not.

## 8. Effort and confidence

The corrected full path is approximately **9-15 focused engineering days**,
usually **2-3 calendar weeks** once owner decisions, review, reset approval, and
intended-admin UAT are included. This is an effort range, not permission to skip
gates or a guaranteed date.

The confidence is higher than the earlier estimate because the work is now
enumerated by capability and authoritative layer. Residual unknowns must be
recorded as findings during each slice; no future document may call the feature
"complete" without a capability matrix showing implementation and evidence for
every in-scope row.

## 9. Approval boundary

The owner requested this full audit and plan alignment on 2026-07-12. P-21
authorized the first Local-only implementation; P-22/P-23/P-23.1 authorize the
bounded operator corrections described in
[Doc #31](./31-phase4-wp66-operator-workflow-correction-plan.md). P-26
authorizes the bounded application/test/documentation correction for C-17.
These decisions, including P-28 source integration, do not authorize a Local
database reset, Production access/write, feature
enablement, publication, new Factor F work, P-18/`021`, or expansion of hotfix
`016`.
