# R0A Quantity Input Safety — Release Candidate Plan

**Prepared:** 2026-10-12
**Status:** `PREVIEW-VERIFIED CANDIDATE`; Q-A phases 1–2 are complete/consumed.
Runtime/tests commit `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc` and freeze
documentation commit `a467d385041d4d5b05d7a539ac28269a252b3f6d` were carried
by exact Preview source `5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3`. See
[Preview Result #07](./07-r0a-quantity-input-safety-preview-result.md). The
candidate is not merged or released to Production.
**Dependency:** Satisfied — migration 030 is `PRODUCTION PASS` and no-replay;
see [Security Result #04](../security/04-boq-save-null-authorization-production-release-result.md).

## Current checkpoint

- The pre-freeze Git observation on 2026-10-12 found branch
  `codex/quantity-input-safety`, no upstream, and
  `HEAD == origin/main == 7c09ab8214c4d2d213349b3281680aef653e5109`.
  Preserve that as dated chronology.
- Q-A phase 1 then froze the reviewed runtime/tests as `b18e69a` and the aligned
  documentation as `a467d38`. At the post-freeze checkpoint `HEAD` was clean at
  `a467d38`, had no upstream, and was zero commits behind/two ahead of
  `origin/main` at `7c09ab8`.
- Q-A phase 2 later pushed exact source `5527fe9` to
  `origin/codex/quantity-input-safety`. Local HEAD and the remote ref matched;
  `origin/main` remained `7c09ab8`. Vercel reported a successful Preview with
  `production_environment == false`; authenticated no-write QA passed with the
  limitations recorded in Result #07. No PR, separate CI, Save, `main`
  integration, or Production release occurred.
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
application release. The Q-A phase 1 documentation commit is `a467d38`; later
status/result alignments preserve the runtime commit and every migration or
Production receipt. The application Preview identity is frozen at `5527fe9`;
reverify live Git/deployment state before later work.

## Immutable local-candidate evidence — 2026-10-12

- Base: `origin/main` at
  `7c09ab8214c4d2d213349b3281680aef653e5109`.
- Runtime/tests commit:
  `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc`, tree
  `6d3f5c3320184cec840570c2a2dd8d3d16ac6ce2`.
- Documentation commit:
  `a467d385041d4d5b05d7a539ac28269a252b3f6d`, tree
  `1854ea53782a56ce9ac47ead2562a0bbed6f2ffc`.
- Final clean-HEAD validation passed: Vitest **643 tests / 56 files**, ESLint,
  TypeScript `--noEmit --incremental false`, Next.js production build and
  `git diff --check`.
- The branch had no upstream and was not pushed. No PR, separate CI, Preview,
  merge, database operation or Production operation occurred.
- The Owner selected the Solo Preview release path. Local checks are its
  pre-publish quality gate; no PR or separate pre-Preview CI is required. This
  does not disable the existing workflow that runs on a later `main` push.

## Earlier combined-working-tree evidence — 2026-10-12

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
local. The later immutable local-candidate validation above satisfied the
required rerun on the frozen Quantity runtime plus aligned documentation.
These earlier checks are source/build evidence. Prior local persistence used a
pre-P49 Save RPC and older Catalog state. Prior rendered Excel/PDF proof covers
only its named local fixtures. It is not current-Production-schema Save
acceptance, physical-device acceptance, large-BOQ performance certification,
or proof that every BOQ has consistent stored route summaries.

## Separate release gates

Migration 030 is complete. The remaining gates are:

### Q-A — freeze, publish and verify Preview

1. **Phase 1 — complete/consumed:** freeze the reviewed runtime/test paths as
   `b18e69a` and the aligned shared documentation as `a467d38`; confirm no
   migration/security harness file is included; run unit/lint/type/build and
   diff checks on the clean exact HEAD.
2. **Phase 2 — complete/consumed:** exact source `5527fe9` was pushed to
   `codex/quantity-input-safety` and verified in the matching Vercel Preview.
   The Owner-selected Solo path used no PR and no separate CI gate and did not
   include `main` integration or Production deployment.
3. Authenticated no-write Preview QA covered list/RouteBadge loading, valid
   real-time input, invalid operator input, Escape/Cancel, route switching,
   genuine reload/no-Save proof, and saved-version Print output. A read-only
   database query independently confirmed persisted quantity/totals and
   unchanged `updated_at`. Console capture, Preview Excel/PDF, and a current-
   schema persistent Save remain recorded limitations in Result #07.
4. The Owner must then explicitly choose whether to accept the
   documented current-schema persistence residual or authorize a separate
   disposable current-schema rehearsal. Do not silently replay 027/028/029/030 or
   use an existing Production BOQ as a write fixture.

### Q-B — integrate to `main` and deploy Production

1. Present the immutable commits/trees, local validation, Preview evidence and
   the recorded persistence-residual decision.
2. Obtain a second explicit Owner GO for the reviewed integration/push to
   `main` and matching Production deployment. This Solo path has no PR; the
   existing CI triggered by a `main` push remains an observable post-push check,
   not a separately required pre-Preview gate.
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

1. **Persistence evidence:** either accept the documented lack
   of a current-post-030-schema write rehearsal or separately authorize a
   disposable rehearsal. Existing or Production BOQs are not implicit fixtures.
2. **Output/console evidence:** accept the recorded lack of native-console
   capture and Preview Excel/PDF download/generation, or authorize a separate
   bounded evidence pass. Saved-version Print rendering passed.
3. **Q-B release:** separately approve reviewed integration/push to `main` and
   Production deployment after the immutable commits, local checks, Preview and
   residual decision are reviewable.
4. **Production write proof, if wanted:** identify disposable test data and
   grant separate write authority. The default post-deploy smoke is no-write.

Later decisions remain outside this candidate: LIST-1B scope, wider R0/D0
rounding/parity, physical-device and large-BOQ acceptance, R1/R2 Quantity
Expression, and wider S0 Auth/Security.
