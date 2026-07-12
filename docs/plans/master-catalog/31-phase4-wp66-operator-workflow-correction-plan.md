# Master Catalog Phase 4 WP-6.6 Operator Workflow Correction Plan

**Status:** P-22 owner-approved; source/static completed on `ac31feb`, G1
Local DB/concurrency/P-20 input completed on `e463270`, and the pre-G2
operator/UI checkpoint completed on `c8f6dca` on 2026-07-12. G2 clean
rebuild/P-20 comparison, G3 owner closeout, and G4 bootstrap/WP-7 sequencing
remain pending

**Production touched:** No

## 1. Decision and purpose

Owner review of the Local admin workflow found two reproducible comprehension
and control gaps after the bounded WP-6.6 technical evidence:

1. the product exposes multiple current-base drafts even though the intended V1
   operating model is one catalog release workspace at a time; and
2. the publish controls appear before the complete item workspace and there is
   no authoritative whole-version comparison of the final draft against its
   published base immediately before publication.

P-22 accepts the following correction for Local-only implementation:

- allow at most one **mutable working draft per base version**;
- retain stale and abandoned drafts as read-only audit/history records;
- provide an explicit audited abandon action before replacing a current-base
  working draft;
- make the full searchable draft catalog the primary editing workspace;
- compute a final snapshot diff from draft rows versus base rows by stable
  `identity_id` before publication;
- bind review and publication to the same expected `lock_version`, and require a
  fresh review when the draft changes;
- keep the existing one-authorized-publisher model and external approval
  evidence. This correction does not create a second-person or multi-stage
  approval engine.

This decision is a bounded WP-6.6 correction. It does not approve P-18/`021`,
P-19, WP-7 execution, a new Factor F workflow, hotfix `016` expansion, a Local
reset, or any Production action.

## 2. Why the correction is needed

The current code already contains the right low-level pieces:

- deterministic full-catalog reads within the accepted 2,000-row client-filter
  threshold;
- search/filter/paging across all draft rows;
- exact stable-identity item routes and field-level audit history;
- server-computed import diff and shared database publish-readiness checks;
- expected-lock, request-idempotency, stale-base, RLS, and publish serialization
  controls.

The remaining problem is workflow composition. The publish form is displayed
before the catalog item workspace, multiple drafts are presented as peers, and
the import-specific diff does not explain the final cumulative effect of manual
plus import changes. A user can therefore reach publication controls without a
clear, complete statement of what the draft will change.

## 3. Target operator workflow

```text
Open the one current working draft
  -> Search/filter all draft items
  -> Open one exact identity and save an audited change
  -> Use import only for approved batch changes
  -> Review the final draft-versus-base snapshot diff
  -> Resolve readiness and filing warnings
  -> Enter external approval/archive evidence
  -> Publish the exact reviewed lock version
```

The workflow is iterative, not a one-way wizard. The admin may move between the
item list, item detail, import, history, and review while the draft remains
mutable. Publication is available only from the review surface.

## 4. Draft lifecycle contract

### 4.1 One current-base working draft

At most one row may have `status = 'draft'` for a given
`based_on_version_id`. A stale draft based on another version can remain for
audit and comparison, but it is read-only and does not prevent creating one
working draft from the current singleton pointer.

The database, not only the UI, owns this invariant:

- a partial unique index enforces one draft per base;
- draft creation locks the singleton pointer/base in the established order;
- a concurrent or repeated different create attempt returns the stable safe
  code `DRAFT_ALREADY_EXISTS` without cloning rows or writing an audit record;
- same-request/same-payload replay still returns the original idempotent result.

### 4.2 Abandon instead of delete or archive

Add explicit version status `abandoned`. Do not delete a draft and do not reuse
published `archived` semantics for a never-published draft.

`abandon_catalog_draft` requires:

- active-admin authorization and enabled catalog-admin gate;
- exact version ID and expected lock version;
- nonblank bounded reason and stable request ID/fingerprint;
- version lock plus draft/current-base validation;
- one append-only `abandon` change set;
- atomic `draft -> abandoned` transition with no price-row deletion.

An abandoned version and all its item rows are immutable, admin-visible, and
not publishable/restorable or eligible for an official export. There is no
`abandoned -> draft` transition; replacement starts from a fresh clone.

## 5. Authoritative final comparison

The review surface compares the final database snapshots, not a sum of audit
events. One identity can be edited repeatedly or returned to its original value,
so change history answers *how* the draft evolved while snapshot diff answers
*what publication will change*.

The read model must:

- load the selected draft and exact `based_on_version_id` rows completely and
  deterministically;
- compare rows by stable `identity_id`;
- expose unique affected identities and overlapping change groups for add,
  code, name/unit/price, category, status, and display order;
- expose old/new values only for changed fields;
- distinguish authority-sensitive name/unit/price changes;
- include base/draft versions, current pointer, lock version, item counts,
  dataset hash, and the existing shared readiness result;
- read the draft lock before and after the paged snapshot reads and fail closed
  when it changes or either dataset is incomplete.

No new approval table is added for this V1. The review page carries the exact
expected lock into the existing publish path; publish locks/rechecks the draft,
recomputes readiness and canonical hash, and returns `DRAFT_LOCK_CONFLICT` when
the reviewed state is stale. A future requirement for a distinct reviewer or
maker-checker role is a separate architecture/threat-model decision.

## 6. UX contract

The draft version page presents, in order:

1. compact version/base/status/count context;
2. the full searchable item workspace;
3. recent import/change history;
4. a clear command to review changes before publication.

Use the existing semantic table, exact detail route, shadcn components, NT
tokens, and Lucide icons. Do not add spreadsheet-style inline editing or a new
data-grid dependency.

The workspace must:

- search by code, name, category, and approved group;
- filter by active status, category, group, and final change type;
- mark changed rows with Thai text badges rather than color alone;
- preserve filter/page/return context when opening an item;
- show draft values as the primary working state and provide a clear link to the
  immutable base version;
- keep essential code/name/status/change/action content usable on mobile.

The review page must:

- show unique affected count plus add/recode/detail/price/category/status/order
  counts, explicitly allowing overlapping categories;
- hide unchanged rows by default but make them available;
- support search/filter and a direct return-to-edit path;
- present `ค่าปัจจุบัน` and `ค่าฉบับร่าง` labels, not arrow/color alone;
- separate database readiness from P-18/P-19 filing/governance warnings;
- place the exact-version publish form after the diff and blockers;
- separate pointer restore from the normal draft-publication workflow;
- remain Thai-first and demote UUID/request/lock details to support information.

## 7. Implementation ownership

### Candidate migration `020`

Amend the still-unaccepted, Local-only
`020_master_catalog_phase4_admin_workflow_hardening.sql` before fingerprint
freeze. It owns the status/constraint/create/abandon changes. Do not rewrite
`016` or `017`-`019`, and do not use reserved P-18 migration `021`.

Because `020` already has retained Local evidence, any content change
supersedes its prior migration fingerprint and post-`020` evidence. Preserve the
historical records, mark them superseded for closeout, and rerun the complete
required evidence on the new reviewed commit.

### Application

- Server Components/read-model helpers own catalog and diff reads.
- Server Actions own create/abandon/manual/import/publish mutations.
- Client Components own bounded search/filter/paging and form interaction only.
- The existing publish RPC remains the final invariant and transaction.
- Do not add an internal REST route for ordinary reads or mutations.

## 8. Required verification

Before P-22/WP-6.6 closeout:

- unit fixtures cover unchanged, add, recode, detail, price, category, status,
  order, compound, reverted, and incomplete-read comparisons;
- migration/static tests cover the new status, partial unique index, function
  signatures, grants, immutable guards, and stable error codes;
- live Local tests cover role denial, duplicate/current-base create,
  same-request replay, two-session create race, valid/invalid abandon, abandon
  replay/race, rollback, and zero partial clone/audit effects;
- browser tests cover first/middle/last item search, exact edit, preserved return
  state, final diff counts/values, stale-review recovery, Thai copy, mobile, and
  keyboard/focus behavior;
- readiness/publish, BOQ, hotfix `016`, current pointer, and Factor F before/after
  assertions remain unchanged;
- repository tests, TypeScript, lint, build, authority consistency, DB lint,
  advisors, P-20 comparator, and measured 710-row performance pass.

The full Local bootstrap destroys and rebuilds the Local Supabase stack. Do not
run it until implementation/static checks are ready and the owner separately
approves each required clean rebuild. Bootstrap remains through `019`; apply
candidate `020` separately until the new owner closeout accepts it.

## 9. Review gates

| Gate | Required decision/evidence |
|---|---|
| G0 | P-22 plan accepted for docs and Local-only implementation — accepted 2026-07-12 |
| G1 | Owner explicitly approves first full Local reset after static implementation is ready — approved and completed 2026-07-12 |
| G2 | Owner explicitly approves the second independent clean rebuild of exact executable candidate `c8f6dca` and P-20 comparison |
| G3 | Owner completes intended-admin workflow review and accepts or holds the revised WP-6.6 closeout |
| G4 | Only after G3, add accepted `020` to bootstrap and separately authorize any WP-7 execution |

Production P-12 through P-15 remain separate and unrequested.

## 10. Repository/static checkpoint

Exact implementation commit: `ac31feb`.

Completed without Local DB mutation or Production access:

- candidate `020` now enforces one draft per base, guarded create, audited
  idempotent abandon, immutable abandoned rows/metadata, and least-privilege
  grants/postconditions;
- the admin flow is item-first, preserves list/review return context, and moves
  publication behind a complete identity-based final snapshot review carrying
  the exact reviewed lock;
- abandon uses a two-step destructive confirmation and retains the full
  snapshot/history;
- the WP-6.6 smoke harness now covers create race/replay, abandon lifecycle,
  retained rows/audit, replacement, and serialized allocator retry, but was not
  executed before G1;
- `npm test` passed 29 files / 147 tests; TypeScript passed; lint exited 0 with
  10 pre-existing out-of-scope warnings; production build passed and includes
  the final-review route; `node --check` and `git diff --check` passed.

This repository/static checkpoint did not itself satisfy G1/G2
DB/concurrency/browser/P-20 evidence and did not authorize
`npm run db:local:bootstrap`. G1 was later approved separately and is recorded
below; G2 still requires a new owner decision.

## 11. G1 Local checkpoint

Owner approved G1 after the repository/static checkpoint. The first clean Local
reset applied canonical `009`-`015`, hotfix `016`, and `017`-`019`; candidate
`020` was applied separately and remained outside bootstrap.

G1 found and resolved two bounded source issues before final evidence:

- `17ec6cc` makes the reusable WP-6.5 regression harness close blocked draft
  fixtures through audited abandon, so it remains compatible with one working
  draft per base and leaves zero working drafts;
- `e463270` changes `private.catalog_parse_iso_date` from incorrectly declared
  `IMMUTABLE` to truthful `STABLE`; Local schema was aligned and DB lint then
  returned no findings.

Final exact-commit evidence on `e463270`:

- WP-6.6: `tmp/master-catalog/wp66-evidence/20260712-g1-p22-e463270.json`,
  SHA-256 `9ccfe240772cb75b4103534d44c12d39600e2ead0ff699020ac5b6751056392d`;
- WP-6.5/P-20 input:
  `tmp/master-catalog/wp65-evidence/20260712-g1-p22-e463270.json`, SHA-256
  `d4750d495adf660c3938062dd0e2e1922d350f72fb7fcb8503afb895f211ec5a`;
- P-20 baseline remained 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- DB lint and security advisors had no findings. Performance advisors retained
  24 pre-existing policy warnings on baseline tables only: 19 auth init-plan
  and 5 multiple-permissive-policy findings; no `020` authority table appeared;
- final readback restored pointer `2568.0.0`/710 rows/hash, zero working drafts,
  all catalog flags `false`, 198 BOQs/1,547 items, and Factor F
  `2569.0.0`/36 rows; Production touched: No;
- 29 files/147 tests, TypeScript, lint with 0 errors/10 existing warnings,
  authority 710/65/17, script syntax, and production build including `/review`
  passed.

The initial G1 clean reset began before the two bounded source fixes. G1 DB and
P-20 evidence therefore remains attached to exact commit `e463270`; it is not
silently relabeled as newer evidence. The later UI-only checkpoint below did
not change migration `020`. G2 must, after separate owner approval, perform a
fresh clean rebuild from exact executable candidate `c8f6dca` and compare its
independent P-20 output with the G1 input. Browser owner closeout and G3 are not
inferred from the G1 DB checkpoint.

## 12. Pre-G2 operator/UI checkpoint

Exact source checkpoint: `c8f6dca282cd2729ac2b58e488b3ef516fb29713`.

The Local operator preflight completed without a reset and without changing
candidate migration `020`:

- created one current-base proof draft, edited an exact catalog item, reviewed
  the cumulative draft-versus-base snapshot, and used audited abandon; a second
  short-lived proof draft was created only to capture reliable before/after
  viewport evidence and was also audited-abandoned;
- verified Thai-first draft history, a live composed version preview, a named
  category combobox, deduplicated category labels, and bounded long controls on
  desktop and 390x844 mobile layouts with no page-level horizontal overflow;
- browser logs contained no application error; the existing `/nt_logo.svg`
  Next image LCP warning remains for later performance disposition;
- 30 test files / 152 tests, TypeScript, lint with 0 errors/10 existing
  warnings, and the network-enabled production build passed;
- final Local readback restored zero working drafts, all three catalog flags
  `false`, pointer `2568.0.0`/710 rows, 198 BOQs/1,547 BOQ items, and Factor F
  `2569.0.0`/36 rows. Production touched: No.

This is technical preflight evidence, not G2 reset approval and not G3 owner
closeout. The next action remains an explicit owner decision on G2.
