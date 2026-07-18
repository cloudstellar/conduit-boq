# Phase 4 WP-8 P-36 Technical Rehearsal Owner Review Note

**Status:** P-36 integrated Local technical rehearsal passed on exact execution
checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6`. **P-37 HOLD is
recommended** because independent intended-admin UAT and live client
interaction/error-recovery traversal are not yet accepted. This note is not a
P-37 owner decision and does not authorize Production migration, deployment,
feature enablement, publication, P-19, Factor F work, or hotfix `016` expansion.

**Recorded:** 2026-07-15

**2026-07-17 supplement:** the first intended-admin UAT failed comprehension
before confirmation. The resulting UI-only insertion-gap correction and current
P-37 HOLD are recorded in
[Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md). This P-36 note
remains the authority for the earlier integrated technical rehearsal and clean
baseline; it does not claim acceptance of the superseded anchor/relation UI.

**2026-07-18 supplement:** the corrected fixture later passed controlled stale
rejection, one accepted placement, exact replay, accepted-state readback, and
audited cleanup back to the disabled baseline. That evidence does not replace
independent keyboard/leave-reload UAT or record P-37 acceptance; Note #33 remains
the authority for the current hold.

**2026-07-18 final supplement:** a later fresh no-reset `2568.14.0` session
passed leave/return/reload recovery, gap-list `ArrowDown`/`Enter`, final review,
reset, and cleanup. Pushed checkpoint
`96c2ac6892e8ffe9d020c2dff641a847157cd4b2` corrected the stale recovery
alert found by that session. Complete native-button keyboard traversal and
explicit P-37 acceptance remain; Note #33 supersedes the earlier open
leave/reload statement.

**2026-07-18 owner-keyboard supplement:** fresh no-reset `2568.15.0` completed
the remaining owner `Tab`/`Shift+Tab`, `Enter`/`Space`, sibling-order, dialog
focus-return, and final-presentation gates. Final pushed corrective checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` passed verification and cleanup.
The later closure audit found that the owner UI submission and broader WP-8
UAT/error/performance gates were still open; Note #34 is authoritative for the
remaining P-37 path while Note #33 owns the completed placement UX evidence.

## 1. Scope and provenance

- branch: `codex/master-catalog-phase4`;
- P-35 integrated source checkpoint:
  `01eba0d49f2e4b6e65f0d9dd287fd461ba9ea19a`;
- P-36 authorization/execution checkout:
  `910cc3cc74660beecf18655d39cd0b0c085d1fc6`;
- migration `021` SHA-256:
  `e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`;
- environment: Local only;
- Production touched: **No**.

The owner received the destructive-reset warning and approved one Local-only
`npm run db:local:bootstrap` run. The canonical order applied `009`-`015`,
production hotfix `016`, and Phase 4 `017`-`021`. No migration or feature flag
was applied to Production.

## 2. Technical evidence

| Evidence | Result | Retained reference |
|---|---|---|
| Clean integrated bootstrap | Passed through `021`; baseline smoke passed | Execution checkout `910cc3c` |
| WP-6.6 authority/workflow harness | Passed; 710 mappings, 65 groups, 17 exclusions | `tmp/master-catalog/wp66-evidence/20260715-p36-910cc3c.json`; file SHA-256 `cfe8e86107e032111eccdbf0dfad981a3a6e830d9ed83670caf2971b42f276e4` |
| WP-6.5/P-20 reliability harness | Passed; deterministic mapping/hash preserved | `tmp/master-catalog/wp65-evidence/20260715-p36-910cc3c.json`; file SHA-256 `65ca478b90dc4c0c598698c46bad93bb513ab0c503c058f58c540ce5b56ba0d8` |
| WP-7 BOQ/hotfix/Factor F regression | Passed, including approved suffixes and atomic negatives | `tmp/master-catalog/wp7-evidence/20260715-p36-910cc3c.json`; file SHA-256 `2a521c1025ce9cb9e044ec1b6aa507d5424d7f7a5fc42ce5065a93724fcd9a37` |
| WP-7.5 placement/race/order harness | Passed with a 713-row candidate; rollback, stale, replay, race, and hash checks passed | `tmp/master-catalog/wp75-evidence/20260715-p36-910cc3c.json`; file SHA-256 `eb8e4266929f6e09d736a9246035b82bc5f775923f4fd5cfe0eb0c381e514f45` |
| Canonical baseline | 710 rows; 471,777 canonical bytes; repeat hash matched | `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` |
| Active baseline export | Excel 5 sheets/710 rows; PDF 19 pages; independent verifier passed | `output/master-catalog/review-artifacts/20260715T143822711Z-910cc3cc/artifact-manifest.json`; file SHA-256 `10f3f103780cab2c76672d80d260039f186047a0aa00a9cfb95707798be530e5` |
| Repository gates | 33 files/183 tests, TypeScript, lint, production build, authority check, dependency audit, and diff check passed | Exact execution checkout `910cc3c` |

The active-baseline artifact binaries were generated only as current P-36
verification evidence. They do not replace the owner-accepted P-11 pair:

- Excel SHA-256:
  `24f5a53569392b791e5589ceb19e4c9b25d53cf7533afcee3991a5ff76f05c49`;
- PDF SHA-256:
  `5f4519ba6294e95bf8f72833bc254c9e3f1d4bce77670365f7b8cf4bbd40d9f0`;
- print HTML SHA-256:
  `35f2343ddcdce38cf29e8f2bbb1080e66fac6bb127ce9cb779eabd592ccb241a`.

An explicit draft export failed closed with `Explicit Local version is not
active: draft`, which is the expected official-export boundary.

## 3. Realistic-scale browser evidence

A temporary Local draft `2568.11.0` used 18 new rows because the existing
reconciliation evidence contains 18 workbook-only candidates. Those rows were
used only as realistic-scale fixtures; the workbook did not become authority
for names, units, or prices.

The accepted fixture contained 728 rows: 18 new rows, 698 shifted inherited
rows, and 716 affected rows. Server navigation/render measurements were:

| State | Measured result |
|---|---:|
| Initial 18-item placement workspace | 1,136 ms |
| Accepted placement, desktop | 755 ms |
| Accepted placement, mobile | 607 ms |
| Final review, 716 affected rows | 1,086 ms |
| Deep order review, page 7 at 100 rows/page | 746 ms |
| Mobile added-item review | 636 ms |

Desktop `1440x1000` and mobile `390x844` had no page-level horizontal overflow,
console error, error overlay, duplicate ID, or unlabeled visible input. The
desktop final review rendered a header-associated table; mobile used stacked
article rows. The external visual manifest is retained at
`/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p36-master-catalog/P36-BROWSER-EVIDENCE.md`
with SHA-256
`e6c1a00c51f14791de9dc37e4a5bffc8b953a37b90ec7011320b38eda9a5a944`.
It remains external review evidence and must not be staged.

## 4. Evidence boundary and remaining release gates

The Codex in-app Browser rendered the real Local routes, but its runtime did
not dispatch state-changing events into the React/Radix controls during this
run. Typed values and focus appeared in the DOM while filter, paging, relation,
and dialog state did not change. There were no app console errors. Accepted
placement was therefore created through the same public Local admin RPC and
then inspected on the real routes.

This is a tooling limitation, not proof of an application defect. It also means
the run must **not** be labeled as any of the following:

- independent intended-admin UAT;
- live keyboard/pointer acceptance;
- safe leave/reload or stale-error comprehension;
- live filter, paging, sibling-order, relation, or confirmation interaction
  acceptance.

Before P-37 can be accepted for the full Add/Supplement release, a non-
implementer admin must complete one bounded Local session without developer or
SQL assistance: inspect suggestions, filter exceptions, change category and one
insertion gap (which maps to the accepted same-category anchor/relation
contract), change sibling order, distinguish browser-local **ยังไม่บันทึก**
from accepted state, recover a supported leave/reload and one stale-placement
response, use the required controls by keyboard, confirm the batch once,
explain the shifted-row impact, and reach final review without an irreversible
mistake. Add/Supplement remains hidden until that evidence passes.

## 5. Advisor and debt disposition

- Security advisor: zero issues.
- Performance advisor: the existing baseline of 19 auth RLS init-plan warnings,
  5 multiple-permissive-policy warnings, and 7 unindexed-FK information findings
  was reproduced. Both `020` authority foreign keys have covering indexes. These
  baseline findings remain due for the P-12 readiness review; they are not
  silently waived.
- DB lint: the known temporary-table static-analysis limitation remains. One
  genuine low-risk code-quality warning also remains in
  `private.catalog_placement_state`: `v_row_count` is assigned but never read.
  Do not rewrite accepted migration `021` to remove it. Resolve it with a
  forward migration or the next reviewed migration checkpoint before P-12, and
  rerun the affected DB/harness fingerprints.
- Toolchain: Supabase CLI `2.107.0` reported `2.109.1` available. It was not
  upgraded during the evidence run so the candidate toolchain stayed stable.

The unused variable does not change database behavior and is not a P-36
technical blocker. Tracking it here prevents the warning from becoming hidden
technical debt.

## 6. Cleanup and recommendation

Final Local readback passed:

- temporary realistic-scale draft audited as `abandoned`;
- zero working drafts;
- pointer `2568.0.0`, 710 rows, canonical hash unchanged;
- admin, new-identity, and retirement flags all `false`;
- 198 BOQs and 1,547 BOQ items; zero unversioned BOQs;
- Factor F default `2569.0.0`, 36 current rows;
- zero temporary P-36 failure triggers;
- Production touched: **No**.

**Owner/developer recommendation:** accept P-36 as the integrated technical
rehearsal result, keep WP-8 **In progress**, and record P-37 as **HOLD** until
the independent intended-admin interaction/recovery session above passes. Do
not request P-12, enable Add/Supplement, or infer any Production approval from
this technical result.
