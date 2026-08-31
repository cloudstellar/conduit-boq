# DUP-1 Atomic BOQ Duplicate — Production Release Result

**Status:** COMPLETE — RELEASED AND VERIFIED IN PRODUCTION

**Release date:** 2026-08-31 (Asia/Bangkok)

<!-- DUP1_PRODUCTION_CLOSEOUT_V1 {"result":"pass","featureCommit":"bc357dbc7a8bd8d696c19550f57452f79a6a4372","pr":9,"mergeCommit":"0e76ed39e68746c9bd6003da69a03f096ae482a3","gitTree":"4fd4384e7d648b1efa08b933e87d1bc9c9ae985d","migrationLedger":"20260831004110/atomic_boq_duplicate","migrationSha256":"748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d","boqCount":263,"routeCount":326,"itemCount":2617,"requestLedgerCount":0,"catalogChanged":false,"factorFChanged":false,"sourceBoqChanged":false,"persistentQaCopyCreated":false,"outerTransactionRollbackProof":true,"renderedDesktopPass":true,"renderedMobilePass":true,"postgrestFailClosedPass":true,"branchDeleted":false,"automaticNextStep":false} -->

**Scope:** Restore whole-BOQ Copy as one atomic, idempotent operation; retain
the source Catalog/items/prices and Factor F for normal Copy; provide a separate
selected-Factor path for eligible legacy BOQs; keep current-price work on the
clean Create New flow; derive editor, route-allocation, Print, and Excel VAT
from the BOQ-bound Factor-version metadata while retaining 7% for current
published versions and the explicit legacy fallback.

## 1. Result

DUP-1 is live in Production. The database change, matching application, and
desktop/mobile rendered checks passed. Final postflight found no disposable
copy or idempotency residue and no change to the Master Catalog or Factor F
reference-data pointers/datasets.

This result closes only DUP-1. It does not authorize LIST-1, Quantity
Expression, Catalog Publish/Restore, Factor F publication/default-pointer
changes, BOQ repricing/backfill, account changes, migration replay, or branch
deletion.

## 2. Frozen release identities

| Artifact | Identity |
|---|---|
| Feature source commit | `bc357dbc7a8bd8d696c19550f57452f79a6a4372` |
| Pull request | [#9 — Restore atomic BOQ copy workflow](https://github.com/cloudstellar/conduit-boq/pull/9) |
| `main` merge commit | `0e76ed39e68746c9bd6003da69a03f096ae482a3` |
| Candidate/merge Git tree | `4fd4384e7d648b1efa08b933e87d1bc9c9ae985d` for both commits; no merge-resolution drift |
| Vercel Production deployment | [`2pVDtnGsEabEigfHVSupcnWAZRqz`](https://vercel.com/cloudwho-2662s-projects/conduit-boq/2pVDtnGsEabEigfHVSupcnWAZRqz) |
| Production application | [conduit-boq.vercel.app](https://conduit-boq.vercel.app) |
| Production Supabase project | `otlssvssvgkohqwuuiir` |
| Production migration ledger | `20260831004110/atomic_boq_duplicate` |
| Migration source | [`029_atomic_boq_duplicate.sql`](../../../migrations/029_atomic_boq_duplicate.sql) |
| Migration SHA-256 | `748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d` |
| Migration size | `1,804` lines / `61,725` bytes |
| SQL smoke SHA-256 | `dd228bf69b960d85307f98deb673a25dfced605af868fdfdc30080825b5d0579` |
| Concurrency harness SHA-256 | `da2a6d4674851055ab060085d739da714cb315d0f69913340bef44430d5685da` |

The feature branch was retained. No branch or archived workspace was deleted,
cleaned, moved, uploaded, or otherwise changed.

## 3. Authority and protected boundaries

The Owner explicitly authorized the exact DUP-1 commit/push/merge, new
forward-only migration 029, deployment, and bounded Production verification.
The release preserved these boundaries:

- migrations 027 and 028 were not edited, retried, or replayed;
- no Catalog or Factor F publish/restore/default-pointer operation occurred;
- no source or historical BOQ was repriced, rebased, repaired, or backfilled;
- no user/account/profile state was changed;
- the protected archive at
  `/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829` was not touched;
  and
- all functional database proof used rollback or an expected fail-closed call,
  leaving no disposable destination.

Migration 029 is not a correction to the completed Master Catalog release. It
is a separately authorized product migration after the immutable 027/028
sequence. Its successful application is now consumed authority: never edit or
replay 029.

## 4. Database execution and proof

### Preflight

Fresh read-only Production preflight confirmed 028 as the previous exact
ledger entry and confirmed that migration-029 objects were absent. The observed
business counts were `263` BOQs, `326` routes, and `2,617` items.

Protected reference-data anchors were:

- Master Catalog `2568.1.0`: `710` active rows, dataset hash
  `sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`;
  and
- default Factor F `2569.0.0`: `36` rows, VAT `7`, dataset hash
  `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`.

The first execution wrapper stopped locally before calling Supabase because it
compared UTF-8 character length with byte length (`61,701` versus `61,725`). It
made no remote call and no mutation. The corrected exact-byte execution then
applied the frozen migration once and only once.

### Installed contract

Migration 029 creates the private RLS-enabled idempotency ledger
`private.boq_copy_requests`, the owner-only graph-hash helper
`private.boq_copy_graph_sha256(uuid, boolean)`, and the authenticated RPC
`public.duplicate_boq_atomic(uuid, uuid, timestamptz, text, uuid)`.

Postflight verified:

- RPC owner `postgres`, `SECURITY DEFINER`, volatile, empty `search_path`,
  `lock_timeout = 5s`, and `statement_timeout = 30s`;
- runtime `pg_proc.prosrc` SHA-256 matched the frozen bodies: RPC
  `0c3598e02c039f051398796788e7dbb0da99c2aae01348642f30a3b13ffbfa1c`
  and helper
  `8f23f8549875aa803aa9a3d0f246089073185aa639909b01dbc6850073a8e43e`;
- `EXECUTE` granted exactly to `postgres` and `authenticated`, with `anon` and
  `service_role` denied;
- private ledger RLS enabled, no direct API table grants/policies, and the
  graph helper present with its bounded ACL;
- all five existing BOQ policies retained; and
- counts and protected reference-data hashes unchanged.

### Functional transaction proof

An explicit Production transaction impersonating an active Admin exercised
both modes and ended with `ROLLBACK`:

- normal preserve mode copied a complete graph and retained the header,
  Catalog, prices, Factor binding/snapshot, routes, items, and totals required
  by the contract;
- selected-Factor mode copied an eligible legacy graph, bound the requested
  active Factor version, cleared Factor-derived state, and required review/save
  before output;
- editor/output calculations used the bound Factor version's `vat_percent`
  consistently; no Factor dataset or default pointer changed;
- retrying each request returned the same destination with
  `duplicateRequest = true`; and
- temporary state reached `265` BOQs and `2` request-ledger rows only inside
  the transaction, then returned to `263` BOQs, `326` routes, `2,617` items,
  and `0` request-ledger rows after rollback.

The Master Catalog and Factor F anchors remained unchanged after the proof.

## 5. Quality and release gates

The frozen candidate passed:

- isolated PostgreSQL `17.6` exact apply, rollback/commit smoke, persona matrix,
  response-loss retry, concurrency, source-write conflict, lock-timeout, and
  no-residue checks;
- independent SQL/application review with no P0/P1/P2 finding;
- ESLint, TypeScript, and `git diff --check`;
- Vitest: `51` files / `474` tests;
- Next.js Production build;
- GitHub CI Quality run `33345150027`; and
- Vercel Preview before merge and Vercel Production after merge.

## 6. Rendered Production QA

Rendered QA used an authenticated active-Admin session at
`https://conduit-boq.vercel.app`.

- `/boq` showed `58` visible and enabled normal **คัดลอก** actions.
- The normal confirmation explicitly states that Catalog, prices, and Factor F
  are preserved and that Copy does not update prices; cancel produced no write.
- The list showed `145` visible legacy selected-Factor entry links. This is a
  UI upper bound, not the exact strict database-eligible count; the RPC remains
  authoritative and fails ineligible graphs closed.
- The selected-Factor editor/dialog showed the exact active Factor choice,
  Create New guidance, and review/save requirement; cancel produced no write.
- Two visible existing bound-but-incomplete BOQs showed **ตรวจสอบ Factor F**,
  disabled both Print actions, and direct `/print` navigation showed the output
  guard without Print/Excel controls.
- At `390 x 844`, all `58` normal Copy actions remained visible/enabled and the
  confirmation title, cancel, and confirm controls remained accessible.
- Browser development logs were empty before the intentional negative probe.

A live PostgREST/RPC negative probe used a known mixed legacy graph. The RPC
rejected it with the safe **สร้างสำเนาไม่สำเร็จ** recovery state, offered
**สร้าง BOQ ใหม่**, exposed no unsafe retry, remained on the source, and left
Production at `263/326/2,617/0`. This proves the deployed Data API schema route
and fail-closed recovery without creating durable data.

The broader persona/ACL matrix was exercised in the isolated PostgreSQL
harness, not as a fresh multi-account Production rehearsal. The historical
expanded Production persona rehearsal therefore remains an accepted residual,
not PASS.

## 7. Security-advisor interpretation

The advisor result is not claimed clean. It includes the expected warning for
an authenticated `SECURITY DEFINER` RPC and informational RLS/no-policy output
for the private ledger. Those findings are intentionally mitigated by the
RPC's internal `auth.uid()`/active-profile/source authorization, fixed empty
`search_path`, explicit qualification, bounded timeouts, exact execute ACL,
private schema, RLS, and absence of direct table grants. See Supabase's exact
linter guidance for
[`rls_enabled_no_policy`](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
and
[`authenticated_security_definer_function_executable`](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
plus its general [database function guidance](https://supabase.com/docs/guides/database/functions).

Existing unrelated advisor findings were not changed or relabelled by this
release.

## 8. Accepted residuals and next order

Accepted DUP-1 residuals:

- `boq.updated_at` is the supported optimistic-write token; arbitrary direct
  child-table DML outside the trusted save/copy boundary does not advance the
  header token;
- `factor_f_raw` values in the same canonical four-decimal bucket are accepted;
- zero-total audit comparison uses fieldwise NULL/zero equivalence;
- selected-Factor list visibility is an upper-bound candidate projection until
  a trusted batched eligibility projection exists;
- fresh preflight classified `58` Factor-unbound legacy BOQs with
  `total_cost = 0`; selected-Factor Copy intentionally rejects them to Create
  New until D4 and a durable review/output-state design are approved. This
  `58` is a database source class and is distinct from the coincidental `58`
  enabled normal Copy actions observed in rendered Admin QA;
- `private.boq_copy_requests` has no TTL/cleanup path and retains one row per
  successful real copy. Deleting a result does not make its request key
  reusable. This is safe/fail-closed at current scale; retention/cleanup needs
  a separately reviewed design and must not be improvised because it protects
  response-loss idempotency;
- the historical expanded Master Catalog Production persona rehearsal remains
  `accepted residual — not PASS` and was not replayed.

Recommended next order:

1. Decide and authorize `LIST-1B`: server-side numbered pages, initial 25-row
   page, whole-result search/filter/sort, RLS-correct count, batched route load,
   and trusted duplicate eligibility projection.
2. Run the smallest calculation input/integrity baseline, then implement the
   separately approved Quantity Expression direction: `*` canonical,
   `x`/`X`/`×` aliases, persisted normalized expression shown only when editing,
   and numeric-only Print/PDF/Excel.
3. Continue the independent S0 authentication/security lane: decide
   invite/pre-provision, MFA/AAL2, session policy, and later SSO.

None of these next items has implementation or Production authority merely
because DUP-1 is complete.

Final independent object/ACL postflight ran at `2026-08-31 00:55:26 UTC`.
Final aggregate-only post-render/no-residue confirmation ran at
`2026-08-31 01:00:59.579308 UTC` and reconfirmed one 029 ledger record,
`263/326/2617` BOQ graph counts, and `0` private copy-request rows.
