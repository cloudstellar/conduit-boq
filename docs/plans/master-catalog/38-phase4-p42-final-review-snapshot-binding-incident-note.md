# Phase 4 P-42 Final-review Snapshot Binding Incident Note

**Status:** Local-only correction in progress. The scored P-38 Owner UAT is
stopped and P-37 remains **HOLD**. Production was not accessed or changed.

**Scope:** Application, tests, Owner UAT procedure, and authority-document
alignment only. No migration, database-contract, BOQ, Factor F, hotfix `016`,
P-19, Production, deploy, enablement, or Production publication work is
authorized by this note.

## 1. What happened

During scored Card A on 2026-07-19, the owner opened final review, changed one
inherited item in another tab, and returned to the review flow. The script
expected the old tab to remain bound to its earlier reviewed lock and to submit
a stale publication request. The route did not carry the reviewed lock in its
URL, so an old-looking tab could reload or render the current lock without a
durable identity visible in the address.

Local draft `2568.5.0-D002` was then validly published as `2568.5.0` at lock 2.
The successful request used the current reviewed state; the database stale-lock
guard was not bypassed. After publication, the same page displayed
**ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า** because draft-only stale-base wording was
rendered for a now-published version. That false post-success warning made the
successful irreversible Local action look like another rejected stale attempt.

The scored session is invalid and Cards B-G must not continue from this Local
state.

## 2. Preserved evidence

Read-only status for session
`tmp/master-catalog/p38-owner-uat/session-p41-scored-20260719-d00c941.json`
records:

- prepared source `d00c941ac11a271c2a149bc016da045cea870a26`;
- abandoned `2568.5.0-D001`;
- published/default `2568.5.0` from `2568.5.0-D002`;
- version ID `5842eb56-4f1b-431f-ba55-33766939ae4b`;
- 710 rows and dataset hash
  `sha256:46b4b61abdb8cee77065ae979b85ae6df39b4dcc0a6c9ff083aa3f768d202912`;
- `catalog_admin_enabled = true`, `catalog_new_identity_enabled = true`, and
  `catalog_retirement_enabled = false`;
- BOQ 198/1,547 with zero unversioned BOQs;
- Factor F current `2569.0.0`/36;
- `productionTouched = false` and `localResetPerformed = false`.

Application/audit/Kong inspection found one successful publication RPC in the
critical window. It used the current lock and returned success. No evidence
shows a stale request bypassing the database guard or a duplicate publication
effect. The earlier visible `DRAFT_LOCK_CONFLICT` remains valid technical
evidence for a rejected stale state, but it was not the request that issued
`2568.5.0`.

The before/after screenshots and operational logs remain untracked under
`tmp/master-catalog/p38-owner-uat/`; they are evidence artifacts and must not be
staged merely because this note cites them.

## 3. Root cause and non-causes

Root causes:

1. The final-review route had no immutable reviewed-lock identity in its URL.
2. Card A instructed an intended admin to submit a knowingly stale destructive
   form instead of requiring the UI to prevent that submission.
3. The stale-base alert was keyed only from pointer/base comparison, not from
   draft status, so it became false immediately after a successful publish.
4. Published review reused draft-oriented labels such as back-to-draft,
   final-draft comparison, current value, and draft value.

Not root causes:

- the PostgreSQL `expected_lock_version` guard;
- idempotency or publication transaction atomicity;
- the P-39R draft-reference/official-release model;
- migration `025`, hotfix `016`, BOQ, or Factor F;
- owner misunderstanding. The screen and test script presented contradictory
  state and did not make the destructive boundary durable.

## 4. Corrected contract

1. Opening a mutable draft review without a lock canonicalizes to
   `/review?reviewLock={current_lock}`.
2. A draft review whose URL lock differs from the current draft lock is a hard
   stale state. It shows both locks, does not silently adopt current data, does
   not render the diff/publish panel, and offers only **เปิดฉบับตรวจล่าสุด**.
3. Item links opened from review preserve the reviewed lock and filters in the
   return path. Saving a change therefore returns to an honestly stale tab.
4. Only a current, ready, current-base draft review may render the publication
   panel. The URL binding improves operator evidence; the server and database
   expected-lock checks remain final mutation authority.
5. Stale-base wording is draft-only. Active, archived, and abandoned versions
   render accurate read-only historical states and never expose publication.
6. Comparison language uses **ค่าจากฐาน** and **ค่าของฉบับนี้** so it remains
   true before and after publication.

No historical snapshot store is added. A stale tab is intentionally blocked
rather than pretending the current database snapshot is the old reviewed
snapshot. This keeps one source of truth and avoids derived-state debt.

## 5. UAT correction

Card A must no longer ask the owner to submit a known-stale publish form.
Instead:

1. record the initial `reviewLock` shown in the URL and page;
2. edit one inherited row in a second tab and record the newer lock;
3. return to the original tab, reload that same URL, and confirm the hard stale
   state, absence of the publication form, and zero pointer/publication effect;
4. use **เปิดฉบับตรวจล่าสุด** and confirm the new lock;
5. do not perform a successful publication.

The retained DB/technical evidence continues to prove
`DRAFT_LOCK_CONFLICT`. The independent Owner evidence now proves the safer
product behavior: prevention and recovery without issuing a known-invalid
destructive request. Closure Matrix C-10 may count that explicit stale-review
prevention/recovery state together with E-01 and E-02; stale placement and
uncertain response remain separate.

## 6. Recovery and next gate

Do not delete, edit, archive, or relabel the published Local version to conceal
the event. Pointer restore alone would leave issued `2568.5.0` history and is
not an exact scored-UAT baseline.

The clean recovery is:

1. finish and verify this bounded source/docs correction;
2. commit and push one exact checkpoint;
3. warn the owner that `npm run db:local:bootstrap` destroys and rebuilds the
   whole Local Supabase stack and obtain a new explicit approval;
4. reset Local to the canonical `2568.0.0`/710 disabled baseline;
5. rerun exact read-only baseline/input checks and prepare a new immutable
   session path;
6. restart scored Cards A-G from Card A under the corrected script.

Prior P-41 clean-chain evidence remains valid because P-42 changes no migration
or DB contract. The recovery reset and fresh prepared-session baseline still
require exact evidence. No step above authorizes Production.

## 7. Working-tree verification

The bounded P-42 correction passed on 2026-07-19:

- focused authority/review/operator checks: 3 files, 26 tests;
- full suite: 35 files, 225 tests;
- TypeScript with no errors;
- lint with 0 errors and the same 10 pre-existing warnings outside P-42;
- authority check: 710 mappings, 65 groups, 17 exclusions, SHA-256
  `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`;
- real application-parser input verification: 708/708/693 rows;
- network-enabled Next.js production build;
- `git diff --check`;
- published-route before/after browser comparison and visual QA.

The first sandboxed build attempt could not reach Google Fonts. The same build
passed unchanged with network access; this was an environment constraint, not
an application failure. No migration, Local reset, Local repair, or Production
action occurred during this verification. Exact commit/push and the separately
approved recovery reset remain later gates.
