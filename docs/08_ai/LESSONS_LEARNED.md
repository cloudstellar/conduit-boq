# Lessons Learned & AI Constitution
## Conduit BOQ System

**Last Updated:** 2026-10-23
**Status:** Living Document (Update constantly)

**Current release/documentation lesson — 2026-10-23:** A `a3114fc`, B client
`42e01c5`, Production 031 and L1 `b1ce449` have separate completed receipts;
latest application evidence is the [L1 Production result](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md).
Its bounded no-write PASS does not prove mutating Copy/Save or all Production
personas. B remains closed with **Production HTTP NOT RUN**. Keep the historical
46/47 FAIL, 031 authority correction and A-only exception unchanged. Earlier
"pending/unapproved/current" statements below belong to their dated stages.

The approved C task covers 48 Markdown documents and local documentation checks
only. Nine parity tooling/baseline artifacts remain separate and unchanged;
do not make a source candidate look complete by silently adding executable
restore tools. Validate links against the prospective published tree, rather
than only the dirty checkout. Preserve frozen receipts and named authority
markers; fix living summaries without disabling contract tests. No Docker,
Production, DB operation, stage/commit/push/deploy or 027–031 replay follows.

**LIST-1B L1 local lessons — 2026-10-23:** see the
[local result](../06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md).
Page size does not bound child-route cardinality: compare exact visible route
count with returned rows and show unavailable on truncation. PostgREST 14.5
rewrites `*` in `ilike`, including quoted values; literal search therefore uses
escaped `imatch`, tested through the real API. Publish History state before
aborting a valid request; failed automatic 416 recovery must show a bounded
error rather than wait for a request never scheduled. A submitted Copy keeps
its UUID/source token through query changes and same-actor token refresh;
actual actor changes invalidate it. Fixture cleanup uses exact owned IDs and
request tuples, then compares original data/schema hashes. Keep injected auth
events distinct from real server revocation proof. Local PASS is not Production
PASS or publication authority.

**B final closeout decision — 2026-10-23:** Owner closed B using its recorded
local/quality/deployment and Production metadata/ledger evidence, choosing no
extra live HTTP probe. See the [final receipt](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md).
Keep Production HTTP **NOT RUN** without converting it to PASS or a mandatory
pending task. Do not turn an optional proof into repeated approval/process
overhead; define the accepted evidence and limits for the actual release.
This bounded decision is not a waiver of future LIST-1B/integration tests.

**Latest Production 031 closeout — 2026-10-23:** explicit one-shot approval
was executed as `20261023063934/boq_duplicate_stale_conflict_guard`. Fresh
metadata/ledger postflight and independent review passed; see the
[031 receipt](../06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md).
Keep this PASS separate from Production stale HTTP, which was NOT RUN because
business RPC was excluded. Exact observed old/new metadata and ledger identities
support closeout; do not infer global business-row invariance or executor
atomicity from them. 027–031 are immutable/no-replay; authority is consumed.

**Latest B client closeout — 2026-10-23:** exact B4 `42e01c5` reached main and
Vercel Production Ready/current with Quality658 PASS; see the
[B client receipt](../06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md).
Publishing compatible client/SQL source is a separate gate from executing 031.
No DB operation or migration ran; full stale-Copy Production acceptance remains
open. Client authority is consumed; no new DB/second-push authority follows.
Earlier B-unapproved/A-only passages preserve the stages before this approval.

**Later A closeout — 2026-10-23:** approved A-only Solo publication completed
at exact commit `a3114fc`; see the [A receipt](../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md).
The stale-Copy exception below is now consumed, with FAIL still tracked.
B/client/031 remain unapproved. Live Vercel used Node24.x while CI used Node22;
representative Node24 host/native checks were therefore added before publishing.
Keep actual hosted source/config, public HTTP, CI, DB and authenticated/browser
acceptance claims distinct. This closeout grants no second push or DB operation.

**Latest named exception — 2026-10-23:** the Owner explicitly accepted the
preserved stale-Copy FAIL for exact dependency release A only, with A first and
B separately. Use the [review plan](../07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md).
Record that acceptance once; do not ask for it again, relabel FAIL as PASS,
extend it to B/new failures, or treat it as publication/Production authority.
Earlier no-waiver statements below remain the chronology before this decision.

## Business conflicts must not request transaction retries — 2026-10-23

The actual PostgREST 14.5 stale-Copy timeout was corrected locally with new
forward 031: `PT409` plus exact detail `BOQ_SOURCE_STALE`, preserving every
other function definition/metadata element. Keep legacy `40001` client
compatibility and never classify arbitrary HTTP 409 as this conflict. Fresh
API cases in both modes returned in 2–3 ms; real two-tab denial/reload/new Copy
passed. See the [bounded result](../06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).

An expected local schema overlay must be named explicitly. Never rewrite a
frozen Production capture or historical FAIL to manufacture parity/PASS.
Migration-time unchanged fingerprints and API tests that intentionally create
new synthetic records are different claims. Preserve old rows and report new
ones. Combined dependency/031 tests are not proof of separately frozen releases;
release order and any named exception remain the Owner's decision.

## Prospective approval does not authorize an earlier operation — 2026-10-23

Creating/applying local 031 after interpreting “ฝากต่อด้วยผมไปนอนก่อน” as
migration approval exceeded the explicit scope. The Owner's later local
continuation approval is prospective. Preserve the actual execution receipts
and add this correction; never rewrite the earlier operation as approved.
See the [canonical 031 result](../06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).

Current work is documentation/local release-source validation with 031 SQL and
the existing DB state frozen; no migration, reset, account/reference mutation,
Production access or staging/commit/push/deploy is authorized. A passing local
candidate grants no named release waiver. The 031 advisory lock coordinates
only the same lock key: future execution needs an exclusive window without
concurrent DDL on the target function/security metadata.

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current-state addendum (2026-08-29):** Master Catalog Phase 4 and P-49 are
> complete end-to-end. [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
> supersede dated `HOLD`, deferred-remediation, and migration-candidate wording
> below. A read-only Production recheck at `2026-08-29 01:38:54 +07`
> reconfirmed 027 then 028 with no 029, catalog `2568.1.0` at `710/710`, its
> reviewed prices, unchanged Factor F, the three catalog flags plus
> migration-028 functions/raw `app_settings` ACL, and `0` working drafts at
> that instant; it performed no write. The older statements
> remain historical chronology and must not be replayed.

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> **Later product-release addendum:** Migration 029 was subsequently applied
> once for the separate Atomic BOQ Duplicate release as
> `20260831004110/atomic_boq_duplicate`; see
> [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The 2026-08-29 “no 029” observation above is still valid chronology for the
> Master Catalog closeout. Migrations 027/028/029 are now immutable/no-replay.

<!-- SAVE_GUARD_PRODUCTION_CLOSEOUT_20261012 -->
> [!IMPORTANT]
> **Current security addendum:** Migration 030 was later applied exactly once
> as `20261012100608/boq_save_null_authorization_guard`; see
> [BOQ Save Guard Production Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
> It fixes only the NULL authorization decision in the existing Save RPC and
> does not close wider S0/Auth/Security work. Migrations 027–030 are immutable,
> no-replay, and the release authority is consumed. Quantity Input Safety was
> not part of that security release; it later reached `PRODUCTION PASS` at exact
> source `4d285f8`. See [Production Result #08](../plans/product/08-r0a-quantity-input-safety-production-release-result.md).

> [!IMPORTANT]
> **AI Must Read This First:** This file contains critical lessons learned from past mistakes. Ignoring these rules causes regressions.

---

## Local baseline lessons — 2026-10-23

- Restore captured final state, including ACL/owners/configuration/RLS/triggers;
  do not reconstruct current behavior by replaying consumed migrations 027–030.
  Seed historical/edge fixtures in the pre-data phase, then attach the complete
  guards. Do not disable a guard when it correctly rejects a fixture shortcut.
- Preserve documented local usernames and the existing configured password.
  Additional random personas do not replace the Owner's usable test accounts.
  Never print or commit passwords, tokens or private fixture credentials.
- A schema match does not prove HTTP behavior. Local stale Copy raised custom
  SQLSTATE `40001` through PostgREST 14 and entered a retry loop. Preserve the
  actual failed gate and the [bounded result](../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md);
  do not infer Production transport impact or silently upgrade/change the RPC.
- Matching a metadata-reported platform version is not a business fix. The
  later approved local alignment from PostgREST 14.13 to 14.5 still timed out
  on one actual stale-Copy request; preserve that FAIL and the earlier receipts.
  Bound the request and clear surviving retries through only the approved local
  REST service. Keep DB identity/data intact; do not replay 029 or generalize a
  local reproduction into a Production business probe. See the
  [14.5 result](../06_engineering/DEPENDENCY_SECURITY_LOCAL_RESULT.md#postgrest-145-alignment-and-stale-copy-retest--2026-10-23).
- Reuse valid real test sessions to avoid local Auth rate limits, bound HTTP
  request duration, and use the repository's Vitest runner for discovered test
  files. Fixture/harness corrections never erase earlier failed evidence.

## 1. Critical Technical Rules (The Constitution)

### Framework-native form acceptance — 2026-10-23

- Diagnose Server Action form behavior on the actual Next App Router runtime.
  The standalone Vite React DOM reset path differed from Next's bundled runtime;
  a real-Next current/HEAD comparison passed reason retention and retry without
  an application fix. Preserve the earlier harness failure and its scope rather
  than relabelling it as a Production bug or erasing it.
- Record live input `.value` separately from default/HTML attribute values.
  UI/server-action payload continuity does not prove database idempotency,
  authorization or Catalog persistence. See the
  [local candidate result](../06_engineering/DEPENDENCY_SECURITY_LOCAL_RESULT.md).

### 1.1 Auth & Deadlocks
- **Rule:** NEVER call async Supabase functions directly inside `onAuthStateChange`.
- **Reason:** It causes a deadlock where the auth state never resolves.
- **Fix:** Always wrap async logic in `setTimeout(() => { ... }, 0)`.

```typescript
// ✅ CORRECT PATTERN
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(async () => {
    await handleSession(session)
  }, 0)
})
```

### 1.2 Factor F Calculation
- **Rule:** **Truncate** to 4 decimal places. DO NOT ROUND.
- **Reason:** Legal/Financial requirement.
- **Implementation:** `Math.floor(value * 10000) / 10000`
- **Reference:** [FACTOR_F.md](../05_calculation/FACTOR_F.md)

### 1.3 Database Schema vs Migrations
- **Lesson:** Metadata in documentation might mismatch actual DB if migrations were manual.
- **Rule:** Always trust `migrations/*.sql` as the source of truth, but verified against production DB if discrepancies arise (like `onboarding_completed` column).

### 1.4 Security Permission Logic — Triangulate All Sources
- **Lesson (2026-05):** Master Catalog migration เขียน RPC permission check อ้างอิงจาก `permissions.ts` ตัวเดียว โดยไม่เทียบกับ `SECURITY.md` และ RLS ใน `008_rls_and_trigger.sql` ส่งผลให้:
  1. **Pending user ถูกบล็อก** — RPC ใส่ `status = 'active'` แต่ canonical rule อนุญาต pending save own BOQ
  2. **Legacy BOQ เปิดให้ manager** — `permissions.ts` อนุญาต แต่ `SECURITY.md` + RLS บอก admin-only
  3. **Canonical sources ขัดกันเอง** ระหว่าง `permissions.ts` กับ `SECURITY.md` โดยไม่มีใครเห็น
- **Rule:** ก่อนเขียน permission logic ใหม่ **ต้องเปิด 3 ไฟล์วางข้างกันเสมอ**:
  1. `docs/SECURITY.md` — Access Matrix (source of truth)
  2. `lib/permissions.ts` — Client-side UI checks
  3. `migrations/008_rls_and_trigger.sql` — DB-level enforcement
- **Rule:** ถ้า 3 ไฟล์ขัดกัน → ยึดตาม `SECURITY.md` + RLS (เข้มกว่า) แล้ว flag ให้แก้ `permissions.ts`

### 1.5 P-49 correction — authorization is cross-layer, not three-file

- **Historical note:** the 2026-05 lesson correctly records the old
  pending-own-BOQ contract and why the earlier RPC was written that way. P-49
  supersedes that business intent on 2026-08-17; do not rewrite the historical
  event as if pending was always profile-only.
- **New rule:** compare the complete chain: product decision -> UI permission ->
  middleware/route classifier -> server/API actions -> table grants -> RLS ->
  trigger/protected columns -> RPC body/ACL -> service-role boundary -> real
  authenticated tests. Choosing the strictest of only three files can still
  leave a bypass in another layer.
- **New rule:** UI redirects and hidden buttons are not authorization. Supabase
  clients can call Data API/RPC directly; PostgreSQL and every privileged server
  path must enforce the same status x resource x action matrix.
- **New rule:** a pending profile's stored `role` grants no authority. Check
  current `status='active'` together with role before every privileged action,
  and never permit self-service mutation of role/status or approval/audit fields.
- **Historical gate at 2026-08-18:** P-49 remained open/high, while P-51
  accepted the risk temporarily and deferred remediation until after the exact
  first P-15 closeout. P-13 was separately unauthorized; the P-49 matrix
  remained mandatory for later remediation rather than silently waived. See
  [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

### 1.6 Atomic copy — one trusted intent, one graph or none

- Never restore a whole-BOQ copy as multiple browser inserts. Use one guarded,
  atomic, idempotent database operation with a stable request key and expected
  source-write token.
- Button visibility and typed client validation are UX only. The database must
  re-authorize actor/status/role/source and validate the complete graph, mode,
  Factor eligibility, ACL, and retry contract.
- Preserve mode means preserve Catalog/items/prices/Factor provenance. Choosing
  current prices is a new clean BOQ, not a hidden requote/rebase.
- A selected-Factor legacy copy must clear Factor-derived state and block
  official output until trusted review/save. Never “repair” a bad source during
  copy.
- A private idempotency ledger is durable evidence. Do not ad-hoc-delete rows or
  add a cleanup job without designing retention against response-loss retries.

### 1.7 Numeric input — never turn rejected syntax into another number

- **Lesson (2026-09):** removing unsupported characters from a numeric input can
  silently change user intent. The deployed/base predecessor sanitizer can turn `5*2`,
  `5x2`, `5X2`, or `5×2` into `52` and publish that number immediately.
- **Rule:** rejected syntax must never be converted into and committed as a
  different numeric value. It must not change the last valid quantity, totals,
  save payload, Print/PDF, or Excel state.
- **R0A status:** the Owner approved local implementation/testing on 2026-09-08.
  The candidate was frozen as runtime/tests commit `b18e69a` followed by docs
  commit `a467d38`, then verified in Preview at exact source `5527fe9` under the
  no-PR/no-separate-CI Solo path. Q-B later fast-forwarded exact source
  `4d285f8` to `main`; GitHub Quality, Vercel Production and authenticated
  no-write verification passed. Q-A/Q-B authorities are consumed. Keep the
  guard numeric-only, retain unsupported
  text as a visible invalid draft, and show an accessible explanation. R0A does
  not evaluate an expression or create formula history.
  A future expression parser requires a bounded grammar, canonical decimal
  semantics, parser versioning, trusted-save validation, and separate approval.
- **R0A verification:** cover typing and paste for `*`, `x`, `X`, and
  `×`, plus blur, Enter, correction, mobile input, save/reload, and a regression
  proving that no invalid draft is committed as concatenated digits.

---

### 1.8 SQL authorization must reject unknown decisions

- SQL booleans can be TRUE, FALSE or NULL. For an allow predicate, deny when
  `predicate IS NOT TRUE`; `IF NOT predicate` skips the denial when it is NULL.
- Test nullable owner/assignee/scope combinations against an existing resource
  and the actual privileged function. A missing-resource probe tests an earlier
  guard and cannot prove the later scope decision is correct.
- A `SECURITY DEFINER` function owned by the table owner cannot rely on the
  caller's RLS to repair its own missing authorization check.
- The 2026-09-08 Save finding and local proof are recorded in the
  [plan and local result](../plans/security/02-boq-save-null-authorization-guard-plan-and-result.md).
  The correction was later applied once as migration 030 and closed in
  [Production Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
  This is evidence, not authority to edit or replay migrations 027–030.

### 1.9 A green build does not mean the dependency graph is safe

- The Quantity `main` workflow passed install, lint, tests, and build, while
  `npm ci` still reported 20 advisories. A fresh `npm audit --omit=dev` reported
  six Production dependency findings: one critical, four high, and one
  moderate. Direct `next@16.2.9` was critical and npm identified `16.4.0` as a
  non-major fix path.
- Treat install/audit output as its own gate. Never summarize a passing build
  as a passing dependency or security audit when CI does not run that check.
- Patch and validate dependency advisories as a separate release. Do not mix
  the upgrade into LIST-1B, Quantity Expression, database work, or a docs-only
  closeout.

### 1.10 Keep the existing test workflow clear — 2026-10-15

- When asked whether Docker testing still precedes Production, first inspect
  the existing release process, executable scripts, actual receipts and target
  metadata. Answer that question before expanding the preparation plan.
- A test may use an isolated SQL container while the persistent local stack
  remains older. Passing SQL cases or CI/build does not certify current-schema
  Auth/API/browser flows. State source, target, actual cases and NOT RUN limits.
- Current-equivalent means the relevant schema/RPC/permission/behavior contracts,
  not copying every Production business row. Recreating synthetic test data does
  not require a backup or second stack; keep Owner backup files separate.
- Stay within one approved scope and continue routine authorized steps. Do not
  convert an old release exception into a standing waiver. Use the
  [release working agreement](../07_process/RELEASE_PROCESS.md#working-agreement-20261015)
  without adding PRs or approval ceremonies.

## 2. Documentation Patterns

### 2026-10-14 planning and identity handoff

- Separate Owner-reported business facts, proposed direction, unresolved
  decisions and execution approval. Signed-paper approval by the engineering
  section manager is confirmed; W-H implementation and recorder/evidence rules
  remain unapproved. Use [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
  for the current proposed order; do not rewrite old release evidence.
- Unknown SSO provider/protocol does not block defining business profiles and
  permissions, but does block final identity/provisioning design. Preserve
  Auth UUID/BOQ ownership continuity; never auto-link by email or assume SSO
  activates a pending/suspended profile or supplies trusted AAL2.
- Internal-all hosting is not confirmed merely because the Owner anticipates
  it. Accept hosting and SSO separately, assign operational ownership and test
  restore/cutover. CLI local development is not hardened Production hosting.
- An externally signed package must identify one frozen numeric revision.
  Distinguish the actual signer from the app recorder; corrections require a
  new revision rather than editing issued evidence. W-H does not depend on
  Quantity Expression, but does depend on numeric and authorization integrity.
- Market research creates candidates, not requirements. The Owner deferred the
  three extra proposals in [#09 section 8.1](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md#81-owner-deferral-of-market-research-additions--2026-10-14).
  Do not rename them as foundation/minimum/readiness gates and insert them back
  into near-term work. Keep [Research/Backlog #10](../plans/product/10-global-estimating-research-and-capability-backlog.md)
  distinct from current sequencing and existing S0/D0/W-H contracts.
- A Docker local stack and backup/snapshot files serve different purposes.
  As clarified on 2026-10-15, recreatable test data needs no mandatory backup
  or second stack: rebuild the existing test target when execution is approved.
  Owner backup files remain untouched and are not a prerequisite unless selected
  as input. Restore a reviewed current-state contract; never replay or repackage
  migrations 027–030. Existing seed/smoke runners may bypass or
  conflict with successor guards; inspect them before reuse. See the
  [Local Database Parity Plan](../06_engineering/LOCAL_DATABASE_PARITY_PLAN.md).

### 2.1 Canonical Source of Truth
- We use a **01-08 Numbered Folder Structure**.
- **DO NOT** create documents outside this structure without approval.
- **DO NOT** duplicate logic across files. Link to the canonical file instead.

### 2.2 Status Mismatches
- **BOQ Status:** `draft`, `submitted`, `approved` (Phase 1)
  - *Note:* Code might contain `pending_review`/`pending_approval` for future Phase 3. Treat them as reserved/future.
- **User Status:** `active`, `pending`, `inactive`, `suspended`

---

## 3. Workflow & Process

### 3.1 Migration File Naming
- Use prefix `XXX_` (e.g., `007_`, `008_`).
- If inserting between phases, use suffix letters (e.g., `007b_`).
- **Lesson:** We accidentally had two `008_` files. Use suffixes to fix order without renaming established files.

### 3.2 AI Handoff & Document Verification
- Always verify documentation against code before ending a session.
- Run `VERIFICATION_REPORT.md` if unsure about discrepancies.
- **Rule (2026-05):** ก่อนบอกว่า "เอกสารตรงกันแล้ว" **ต้อง diff จริง ไม่ใช่แค่จำ** — ถ้า edit ถูก cancel/fail ต้องตรวจว่าไฟล์ถูกแก้จริงหรือไม่
- **Rule (2026-05):** ก่อน commit เอกสารลง repo ต้องตรวจว่าเป็น version ล่าสุดที่ผ่าน review แล้ว
