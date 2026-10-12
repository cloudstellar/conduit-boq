# R0A Quantity Input Safety — Release Candidate Plan

**Prepared:** 2026-10-12
**Status:** `LOCAL CANDIDATE`; implementation and local validation complete;
Quantity commit, push, PR, Preview, merge and deployment are not authorized.
**Dependency:** Satisfied — migration 030 is `PRODUCTION PASS` and no-replay;
see [Security Result #04](../security/04-boq-save-null-authorization-production-release-result.md).

## Current checkpoint

- Dated Git observation on 2026-10-12: branch
  `codex/quantity-input-safety`, no upstream,
  `HEAD == origin/main == 7c09ab8214c4d2d213349b3281680aef653e5109`.
- The Quantity candidate remains modified/untracked and uncommitted. There is
  no immutable Quantity tree, CI/Preview receipt, merge, or Production release.
- The runtime work began from the earlier PR #12 base `c0cb6451...`; the
  independent security source/closeout commits `cb2bb60` and `7c09ab8` are now
  in the base. The dated validation record below is preserved as the evidence
  from its exact checkpoint, not relabelled as a run on a later tree.
- Migration 030 satisfied the release-order dependency but grants no Quantity
  release authority. This candidate itself needs no migration.

## Scope to finish

This release closes the already approved local Quantity safety work. It does
not add Quantity Expression, LIST-1, a persisted formula, schema/RPC changes,
Catalog/Factor publication, account changes or BOQ backfill.

The candidate is larger than a two-line input filter because its accepted local
contract also keeps draft identity, real-time totals and the matching Factor
snapshot coherent through Save preparation:

- valid numeric drafts calculate in real time;
- invalid/incomplete text remains visible, keeps the latest valid preview and
  blocks Save; `5x2`, `5X2`, `5×2` and `5*2` never become `52`;
- new input allows explicit zero and at most two decimal places without silent
  rounding; untouched loaded legacy values are not normalized/backfilled;
- Escape/Cancel restores the edit-session starting quantity and totals;
- Save validates every route and binds one BOQ/revision/total/reference-version
  Factor result while edits are locked;
- loading synchronizes only the selected route; unopened stored route summaries
  retain the Owner-selected previous behavior;
- editor Print actions remain saved-version output and block invalid/pending
  drafts.

Runtime candidate paths:

- `app/boq/[id]/edit/page.tsx`
- `components/boq/FactorFSummary.tsx`
- `components/boq/LineItemsTable.tsx`
- `components/boq/MultiRouteEditor.tsx`
- `components/boq/QuantityEditor.tsx`
- `lib/boq/editorState.ts`
- `lib/boq/quantityInput.ts`
- `tests/boq-editor-state.test.ts`
- `tests/quantity-input.test.ts`
- quantity-related additions in `tests/factor-f.test.ts` and
  `tests/export-boq-excel-factor-version.test.ts`

The security migration and its SQL fixture/runner/tests are excluded from this
application release. Shared handoff documents must be reviewed so that only
current Quantity/security status is published with the candidate.

## Fresh combined-working-tree evidence — 2026-10-12

- Vitest: **643 tests / 56 files passed**.
- ESLint: passed with no finding.
- TypeScript: `--noEmit --incremental false` passed.
- Next.js `16.2.9` production build passed; compilation `3.2s`, TypeScript
  `3.9s`, static generation `12/12` pages.
- The build used `http://127.0.0.1:9` with no listener and a placeholder public
  key, so it could not access Supabase. Network was used only for Google Fonts.
- `git diff --check` passed.
- Remote `main` and candidate base both resolve to
  `c0cb6451c4d9924f69de93df4eee80abb6cca3c9` at this checkpoint.

At that checkpoint the tested working tree contained both separately gated
Security and Quantity changes; it was not an exact immutable Quantity release
tree. The security work is now in `origin/main`, while the Quantity diff remains
local. Q-A therefore reruns validation on the immutable Quantity-only commit.
These checks
are source/build evidence. Prior local persistence used a
pre-P49 Save RPC and older Catalog state. Prior rendered Excel/PDF proof covers
only its named local fixtures. It is not current-Production-schema Save
acceptance, physical-device acceptance, large-BOQ performance certification,
or proof that every BOQ has consistent stored route summaries.

## Separate release gates

Migration 030 is complete. The remaining gates are:

### Q-A — publish and verify Preview

1. Freeze the reviewed Quantity-only working-tree diff from the runtime/test
   paths above and the Quantity sections of shared documentation. Confirm no
   migration/security harness file is included.
2. Obtain explicit Owner GO for the exact Quantity commit, branch push, PR, CI
   and Preview creation. Do not include merge or Production deployment in Q-A.
3. Re-run unit/lint/type/build checks on the immutable published commit.
4. Verify Preview without persistent Production writes: login, open an
   editable BOQ, exercise valid real-time input, invalid operator input,
   Escape/Cancel, route switching and saved-version output, then reload to
   confirm no Save occurred.
5. The Owner must then explicitly choose whether to accept the
   documented current-schema persistence residual or authorize a separate
   disposable current-schema rehearsal. Do not silently replay 027/028/029/030 or
   use an existing Production BOQ as a write fixture.

### Q-B — merge and deploy Production

1. Present the immutable commit/tree/PR, validation, Preview evidence and the
   recorded persistence-residual decision.
2. Obtain a second explicit Owner GO for the exact PR merge and Production
   deployment.
3. After Production deployment, repeat the bounded no-write interaction smoke,
   verify the deployed commit, console and saved-version output, and write a
   dated result. Any persistent Save test requires separately identified test
   data and explicit write authority.

## Stop conditions

Stop and return to Owner review if the Quantity candidate changes schema/RPC,
calculation or rounding policy, Factor/Catalog data, unopened-route behavior,
Print/PDF/Excel data contracts, or any account/Production configuration. Do not
add LIST-1 or full Quantity Expression while closing this release.

## Remaining Owner decisions

1. **Q-A publication:** approve the exact Quantity-only commit, push, PR, CI
   and Preview. This does not include merge or Production deployment.
2. **Persistence evidence:** after Preview, either accept the documented lack
   of a current-post-030-schema write rehearsal or separately authorize a
   disposable rehearsal. Existing or Production BOQs are not implicit fixtures.
3. **Q-B release:** separately approve the exact PR merge and Production
   deployment after the immutable tree, CI, Preview and residual decision are
   reviewable.
4. **Production write proof, if wanted:** identify disposable test data and
   grant separate write authority. The default post-deploy smoke is no-write.

Later decisions remain outside this candidate: LIST-1B scope, wider R0/D0
rounding/parity, physical-device and large-BOQ acceptance, R1/R2 Quantity
Expression, and wider S0 Auth/Security.
