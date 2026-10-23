# BOQ Duplicate stale-conflict correction — local result

**Recorded:** 2026-10-23 (Asia/Bangkok)  
**Status:** LOCAL CANDIDATE PASS; UNCOMMITTED; NO PRODUCTION RELEASE

**Latest Owner decision — 2026-10-23:** the Owner explicitly accepted the
known stale-Copy FAIL for dependency release A only, with A first and B as a
separate next release. See the [review plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md).
That exception is accepted, not pending; it does not apply to B or authorize
031/publication/Production. Current work is plan/documentation only. Earlier
no-waiver/order-undecided text below is preserved as its original chronology.
The earlier unapproved 031 application and later prospective correction remain
recorded without retroactive authorization; SQL/current DB are unchanged.

## Authority correction and prospective continuation — 2026-10-23

The assistant overinterpreted “ฝากต่อด้วยผมไปนอนก่อน” and created/applied
031 locally without explicit migration approval. The execution/test receipts
below remain factual evidence, not approval. The Owner later authorized a
read-only audit and then said “ถ้าทำแล้วดี ไม่มีปัญหาก็ลงมือต่อได้ครับ”. That
allows the agreed local continuation from this point; it does not retroactively
approve the earlier operation or authorize a Production release.

Current continuation corrects documentation, records future execution
conditions and validates separate temporary source candidates. Keep 031 SQL,
its recorded hash, existing DB and frozen Production capture unchanged. Do not
reset, replay/apply 031 again, repair migration history, mutate accounts or
reference data, access Production, stage/commit/push/deploy, or infer acceptance
of a stale-Copy release exception. See the [local release preparation](./LOCAL_RELEASE_CANDIDATES_20261023.md)
for source separation and actual later checks. The original context below is
preserved chronology; its prior interpretation supplies no execution authority.

## Original execution context and receipt

The existing local PostgREST 14.5 returned no response for a stale Copy because
the RPC used retryable SQLSTATE `40001` for a business conflict. Following the
proposed bounded RPC/client correction, the Owner asked to continue while away
(“ฝากต่อด้วยผมไปนอนก่อน”). This local follow-up implements that correction and
tests it on the existing Docker target. It grants no commit/push/deploy or
Production operation. No DB reset or historical migration replay occurred.

The earlier [baseline result](./LOCAL_DATABASE_PARITY_RESULT.md) and
[14.5 timeout result](./DEPENDENCY_SECURITY_LOCAL_RESULT.md#postgrest-145-alignment-and-stale-copy-retest--2026-10-23)
remain dated failures. The fresh successor run below passes against **captured
Production contracts plus the explicit 031 candidate**, not unchanged live
Production. No new Production request was made.

## Exact source and target

| Item | Actual value |
|---|---|
| Repository | `main`, HEAD `b144bcae98b543ab231c503f435f261f946b9f89`; existing dirty documentation/dependency/lint work preserved; nothing staged or published |
| Local API/app | `http://127.0.0.1:55321`; actual Next production-mode app at `http://127.0.0.1:3000`, built from the combined current working tree |
| Database | `supabase_db_conduit-boq-local`, ID `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`, PostgreSQL 17.6; same start `2026-10-06T07:19:39.734091042Z`, existing data volume |
| REST | Existing `supabase_rest_conduit-boq-local`, actual binary **14.5**, image `public.ecr.aws/supabase/postgrest:v14.5`; no service recreation/restart in this correction task |
| Baseline | Frozen `supabase/local/baselines/20261023-production-contract/source.json`, SHA-256 `188b515ddc444dc584e09e3f360f0f95888e70ee464f5d86dfbc39e08661b85e`; not rewritten |
| Migration | [031_boq_duplicate_stale_conflict_guard.sql](../../migrations/031_boq_duplicate_stale_conflict_guard.sql), SHA-256 `34c67a8d505c107a2fc86e1ecf8a9ed48a3c94a31d6d169ca016e5921463adef`; applied **once locally** at `2026-10-22T21:07:20Z` / 23 October 04:07 Bangkok; not applied to Production |
| Migration history | No fabricated baseline/027–030 ledger rows and no migration-ledger write for this explicit local application; the local application receipt is below |

## Bounded implementation

Only the stale-source `RAISE` block in
`public.duplicate_boq_atomic(uuid,uuid,timestamptz,text,uuid)` changes:

```sql
ERRCODE = 'PT409',
MESSAGE = 'source BOQ changed after it was loaded; reload before copying',
DETAIL = 'BOQ_SOURCE_STALE';
```

The previous code was `40001`, without the detail marker. `PT409` delivers
HTTP 409 without expressing a transaction retry. See
[PostgREST's documented custom status codes](https://docs.postgrest.org/en/v14/references/errors.html#raise-errors-with-http-status-codes)
and [Supabase's PostgREST 14 retry diagnosis](https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions).

031 checks the exact predecessor definition SHA-256
`d3c422a78c2434ad40c932250b734871608282bc41dce3097a853ddcc1637910`
and exact successor
`508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`.
Unknown definitions and an already-applied successor are refused. The bounded
transaction checks executor/owner, ACL, SECURITY DEFINER and configuration;
postflight confirms only function source changed. OID `51020`, signature,
defaults, comment, ACL, settings, lock order and ledger-first idempotency remain
unchanged. No prices, calculations, other schema objects, Catalog/Factor or account
permissions are changed. Migrations 027–030 remain byte-for-byte unchanged.

The predecessor checks require a serialized DDL window. The advisory lock in
031 is shared only by sessions using its exact key; it does not block another
privileged session from replacing this function between precheck and EXECUTE.
A concurrent body-only replacement can be overwritten while the final checks
still pass. The earlier drift-before-start/replay tests do not test this race.
Never describe this script as unconditional protection against concurrent DDL.
The later execution prerequisites below address that operational condition;
the frozen migration file has not been changed or replayed.

[Client helper](../../lib/boq/duplicate.ts) recognizes either legacy `40001`
or the exact pair `PT409` + `details: BOQ_SOURCE_STALE`. Other conflicts retain
their existing handling. The existing reload action is reused; there is no new
UI workflow. [Client tests](../../tests/duplicate-boq-client.test.ts) cover both
Copy modes, transport propagation, legacy compatibility and unrelated/malformed
conflicts. The [API harness](../../scripts/smoke-local-db-parity.mjs) adds an
explicit successor option; its default remains the captured predecessor.
Successor acceptance refuses carried failure evidence and requires fresh HTTP
409, exact code/detail and a response below five seconds.

## Verification

| Gate | Actual result |
|---|---|
| Local application | **PASS:** one 031 application; all 30 application-table fingerprints unchanged during migration; all non-source function metadata/comment preserved |
| Unknown predecessor | **PASS:** temporary uncommitted function COST drift caused refusal; connection exit rolled back the drift; function/data unchanged |
| New 031 repeat refusal | **PASS:** successor refused before mutation; no 027–030 replay attempt |
| Semantic overlay before/after API | **PASS:** 30 tables, 96 functions, 27 triggers; zero unexplained differences against frozen baseline plus exact 031 definition; same three recorded platform mappings |
| Fresh real JWT/Data API/RPC suite | **49 PASS / 0 FAIL**, using existing local synthetic personas; no account reseed, password replacement or service-role business client |
| Preserve stale Copy | **PASS:** actual HTTP **409**, code `PT409`, detail `BOQ_SOURCE_STALE`, **3 ms**; no BOQ/routes/items/request-ledger/authorization-event residue |
| Selected-Factor stale Copy | **PASS:** same exact HTTP contract, **2 ms**, no residue |
| Copy regressions | **PASS:** normal copy, repeated/concurrent request, changed-parameter rejection, authorization gates, selected-Factor reset/output state/trusted Save; committed request retry after a later supported Save still returns the original destination |
| Real browser, two tabs | **PASS:** tab A opened Copy; tab B saved a changed project name on this run's new synthetic BOQ; tab A immediately showed the stale-source message and reload action. All 30 table fingerprints were unchanged by the denied click; no surviving Copy backend |
| Reload then fresh Copy | **PASS:** reload displayed the updated project name; a new confirmed Copy opened a new draft editor; source token remained unchanged and destination graph/prices/Catalog/Factor/totals matched the saved source |
| Full Vitest | **57 files / 664 tests PASS**, including 22 client-helper tests |
| ESLint | **0 errors / 3 pre-existing warnings** in `app/blocked/page.tsx` and `lib/hooks/useUser.ts`; no disabled rules |
| TypeScript / Next production build | **PASS:** separate `tsc --noEmit` and Next 16.4.2 production build; explicit loopback local environment |
| Independent source reviews | **PASS:** two read-only reviewers found no bounded implementation blocker; exact definition delta/hash independently checked |

Browser target was the in-app browser at its actual **654 × 762** viewport.
One expected handled `Error duplicating BOQ atomically` console entry was
recorded for the deliberate denial; no unexpected runtime error was observed.
Browser request-count/token tracing was **not captured**: REST logs did not
expose request details. Do not turn this into proof of one browser POST or UUID
continuity; one-call helper tests and fresh API transport receipts are separate
evidence. Selected-Factor stale recovery was covered by real API and helper
tests, **not repeated through the browser**. This is not an exhaustive browser,
physical-device, network-loss, load, SSO or wider D0 acceptance run.

After all API/browser tests, every row that predated this correction remained
unchanged. Non-business/reference/profile/settings tables remained unchanged.
This run intentionally retained **12 new synthetic BOQs, 24 routes, 24 items
and 9 request-ledger rows** (10 BOQs from API and 2 from UI). Only this run's new
fixtures were updated for authorization setup or actual supported Save. Normal
Auth session bookkeeping is outside the application fingerprints. No Copy
backend remained active. No cleanup deleted Owner evidence or test records.

UI source: `46929f85-4c65-4196-8251-2d229b324e35`; fresh destination:
`99c13373-dc9c-4529-958a-3b54e87d24e2`. Their saved source name is
`LOCAL STALE COPY UI 20261023 changed`; the destination adds ` (สำเนา)`.

## Release boundary and next decision

The local correction is complete and reviewable. It is **not a release
approval**. Package/lockfile and the earlier eight-file dependency/lint
candidate were unchanged by this correction. The current tests/build used that
existing dependency candidate together with 031/client; they do not certify an
isolated old-dependency RPC release or the still-unpatched Production RPC.

Keep two reviewable changesets: dependency/lint, and 031/client/Copy tests.
Do not silently combine their release identities. The Owner must choose the
release order: approve a separate conflict-fix release before dependency
security, or explicitly accept the known pre-existing stale-Copy failure for
the named dependency-only release and deliver the conflict fix separately.
There is no automatic waiver. The original dependency-first roadmap remains
the default planning direction until that decision.

For a future approved conflict-fix release, deploy the compatible client before
the separately approved DB window. Before applying 031, freshly verify the
actual Production predecessor/owner/ACL/configuration and the exact migration
file; unexpected drift stops execution. Old browser tabs can show a generic
error for the new code until refreshed; do not promise the new recovery UI on
already-loaded clients. Never replay 029/030 or use a broad reset/db push.
Rollback is a reviewed forward correction, not an unreviewed reverse script.

### Required conditions for any later separately approved 031 window

1. Review the exact application/migration source and explicit target/executor;
   verify the predecessor hash, owner, ACL and configuration freshly on that
   target under the approved access. A mismatch is HOLD, never permission to
   alter the constants or bypass a guard.
2. Release the compatible client first. Account for old loaded clients that
   have not refreshed; they can receive a generic error instead of reload UI.
3. Use one operator and an exclusive window with no concurrent DDL on this
   function or its security metadata. Stop new Copy submissions for that
   window using a reviewed, approved method; do not invent a runtime flag or
   broaden account permissions to obtain a quiet window.
4. Inspect active/retrying Copy backends before DDL. A browser timeout does
   not prove the database operation ended. If existing retries are found,
   HOLD and obtain the exact scoped recovery authority; this document does
   not authorize session termination or a service/project restart. Replacing
   the function does not automatically clear in-flight retries.
5. After the one approved application, verify exact successor/metadata and
   absence of unexpected business changes and surviving retries before
   reopening Copy. Use only the approved post-release acceptance scope.
6. On any failure, stop and retain evidence. Do not automatically reverse
   031, restore `40001`, replay 027–030 or repair the migration ledger. A
   reversal restores the demonstrated retry defect and needs its own reviewed
   plan and approval. Local 031 remains an explicit application receipt with
   no ledger entry; a generic migration-up/db-push/reset is not a repair path.

The baseline verifier still compares against the frozen Production source and
will detect the intentional 031 difference. Use an explicit exact-definition
overlay for candidate acceptance; do not rewrite the captured source or loosen
the comparator to hide it. No future reset, Production capture, publication,
account change, Catalog/Factor operation, LIST-1B, S0, D0, W-H, Expression or PDF
work is authorized here. The Owner's PDF deferral remains unchanged.

## Host-local evidence

Private receipt directory:
`/private/tmp/conduit-boq-stale-copy-fix-20261023-y53hlrgh/`.

- `source-before.json`, `patch-contract.json`, `local031-applied.json`,
  `unknown-predecessor-refusal.json`, `new031-replay-refusal.json`.
- `expected-overlay-comparison-before-api.json`,
  `expected-overlay-comparison-after-api.json`, `api-smoke-results.json`,
  `api-verification.json`, `http-request-receipt.json`.
- `ui-before-stale.json`, `ui-after-stale.json`, `ui-final-graph-receipt.json`,
  `ui-stale-error.jpg`, `ui-reload-copy-success.jpg`, and their DOM captures.
- `result.json`, `ui-browser-result.json`, `source-and-doc-verification.json`,
  `final-local-check.json`, `final-table-fingerprints.json`, `vitest.log`,
  `lint.log`, `tsc.log`, `build.log`, `server.log`.

Receipts and screenshots stay host-local; this document preserves the bounded
result if temporary files are later unavailable. Historical evidence, frozen
release results, protected archive and Owner backup files were not rewritten.
