# R0A Quantity Input Safety — Preview Result

**Executed:** 2026-10-12

**Status:** `Q-A PHASE 2 COMPLETE — PREVIEW VERIFIED WITH RECORDED LIMITATIONS; NOT MERGED OR RELEASED`

**Boundary:** `R0A_QUANTITY_INPUT_SAFETY_PREVIEW_VERIFIED_20261012`

> **Later status:** This receipt remains the frozen Q-A Preview chronology.
> Q-B was later separately approved, released, and closed as `PRODUCTION PASS`
> in [Production Result #08](./08-r0a-quantity-input-safety-production-release-result.md).
> Do not rewrite the Preview marker below to make the later release appear
> simultaneous.

## Result

The exact application candidate at
`5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3` was pushed to
`origin/codex/quantity-input-safety`, deployed as a Vercel **Preview**, and
verified through authenticated, no-write browser checks. Q-A phase 2 is
complete and its branch-publication/Preview authority is consumed.

This is a `PREVIEW-VERIFIED CANDIDATE`. It is not merged into `main`, not
deployed to Production, and not authority for Q-B or another external
operation.

## Frozen source and deployment identity

| Evidence | Value |
|---|---|
| Base / unchanged `origin/main` | `7c09ab8214c4d2d213349b3281680aef653e5109` |
| Runtime/tests commit | `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc` |
| Freeze documentation commit | `a467d385041d4d5b05d7a539ac28269a252b3f6d` |
| Exact Preview source commit | `5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3` |
| Exact Preview source tree | `66b83f60482da3ca6c6e9390113452180cef0d47` |
| Remote feature ref | `origin/codex/quantity-input-safety == 5527fe9...` |
| GitHub deployment / success status | `7012395656` / `19638883920` |
| Vercel deployment | `4ZiFQhGwcdd4YrXizfopek59kKDE` |
| Environment | `Preview`; `production_environment == false` |
| Pull request / separate CI gate | none, under the Owner-selected Solo Preview path |

- Preview application:
  <https://conduit-na0diz4sw-cloudwho-2662s-projects.vercel.app>
- Vercel deployment record:
  <https://vercel.com/cloudwho-2662s-projects/conduit-boq/4ZiFQhGwcdd4YrXizfopek59kKDE>

The local branch still had no configured upstream at the observation, even
though its local HEAD and remote feature ref both resolved to `5527fe9`.
Mutable Git/deployment state must be rechecked before later work.

## Source gate carried into Preview

The clean exact `5527fe9` candidate passed:

- Vitest: **643/643 tests in 56 files**;
- ESLint;
- TypeScript `--noEmit --incremental false`;
- Next.js production build; and
- `git diff --check`.

No runtime, migration, package, environment, database, Catalog, Factor F,
account, or Production change was added between those checks and the Preview
source commit.

## Authenticated no-write Preview verification

The browser checks used existing readable BOQs and client-only quantity drafts.
No Save, Copy, Delete, migration, Catalog/Factor action, account/configuration
mutation, or Production deployment was performed. Login was used only to
access the authorized Preview.

1. **Page and list loading**
   - Login and authenticated navigation succeeded.
   - `/boq` rendered the current register, search results, and per-row route
     counts. The observed register reported 302 entries.
   - The checked pages rendered without a blank screen or framework error
     overlay.
2. **Numeric real-time behavior**
   - On an existing single-route BOQ, valid draft `1001.50` immediately updated
     the item, route, BOQ, Factor F, after-Factor, and VAT values.
   - `5x2` remained visible as rejected text with the accessible numeric-only
     explanation. It never became `52`; Print and quantity-step controls were
     disabled while the invalid draft was present. The Save path remains
     guarded by invalid-draft validation. The displayed calculation retained
     the last valid numeric preview reached while typing.
   - Escape restored the starting quantity and totals. A second valid draft
     followed by the visible Cancel action also restored the starting values.
3. **Route identity and no-Save proof**
   - On an existing five-route BOQ, changing a route-1 quantity from `42.00` to
     `43.25` updated the route total from `139,502.00` to `142,552.00` and the
     BOQ total from `964,285.00` to `967,335.00` in real time.
   - Switching to route 2 preserved its own `254,022.00` total while retaining
     the unsaved route-1 preview; returning to route 1 restored the `43.25`
     draft to the correct route/item.
   - After a genuine document reload completed, route 1 returned to `42.00` /
     `139,502.00` and the BOQ returned to `964,285.00`.
   - A separate read-only Supabase `SELECT` at
     `2026-10-12 18:28:26 Asia/Bangkok` confirmed the same stored quantity,
     route total, BOQ total, and unchanged BOQ `updated_at`. No write RPC, DDL,
     migration, or business-row mutation occurred.
4. **Saved-version output**
   - The direct saved-version Print page loaded the persisted five-route
     document, including quantity `42.00`, route total `139,502.00`, BOQ total
     `964,285.00`, Catalog `2568.1.0`, and Factor version `2569.0.0`.
   - The unsaved `43.25` preview did not appear in saved output.
5. **Legacy fail-closed behavior**
   - An existing legacy BOQ without a usable Factor reference remained
     read-only/fail-closed rather than permitting an unsafe edit.

## Recorded limitations

- Native Chrome automation did not expose browser console logs. Visual checks
  found no framework error overlay, but this result does not claim a captured
  clean console.
- No persistent Save was executed against the current post-030 schema. The
  reload and direct read-only database check prove that the Preview rehearsal
  itself made no Save; they are not a write-path acceptance test.
- The saved Print page was rendered, but Preview Excel download and browser
  PDF generation were not repeated. Earlier local Excel/PDF evidence remains
  limited to its named local fixtures.
- This was desktop browser verification, not physical-device acceptance or a
  large-BOQ performance certification.

## Boundaries preserved

- Migrations 027, 028, 029, and 030 were not edited or replayed and remain
  immutable/no-replay.
- `origin/main` remained at `7c09ab8`; there was no merge, direct-main push,
  Production deployment, database write, BOQ Save, Catalog/Factor mutation,
  account/configuration change, PR, or separate CI run.
- The local documentation-only closeout commit containing this receipt is a
  descendant of `5527fe9` and does not replace that application Preview
  identity. It grants no push or another Preview; any later documentation
  publication still requires fresh authority.

## Remaining Owner decisions

1. Accept the current-schema persistent-Save residual for this narrow guard, or
   separately authorize a disposable current-schema write rehearsal with named
   test data and cleanup rules.
2. Accept the recorded console and Preview Excel/PDF residuals, or request a
   separate bounded evidence pass.
3. After resolving those residuals, separately authorize or hold Q-B: reviewed
   integration/push to `main`, matching Production deployment, and bounded
   no-write Production smoke. Any Production write proof needs separately
   identified disposable data and explicit write authority.

LIST-1B, wider R0/D0 accounting work, R1/R2 Quantity Expression, and wider S0
Auth/Security remain separate decisions with no implementation authority from
this result.

<!-- R0A_QUANTITY_INPUT_SAFETY_PREVIEW_RESULT_V1 {"schema":"conduit-boq/r0a-quantity-input-safety-preview-result/v1","executedOn":"2026-10-12","boundary":"R0A_QUANTITY_INPUT_SAFETY_PREVIEW_VERIFIED_20261012","status":"preview-verified-candidate","runtimeCommit":"b18e69adeeaedbf10ca70c767ac4cf80a351b6bc","freezeDocsCommit":"a467d385041d4d5b05d7a539ac28269a252b3f6d","previewSourceCommit":"5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3","previewSourceTree":"66b83f60482da3ca6c6e9390113452180cef0d47","branch":"codex/quantity-input-safety","remoteBranchEqual":true,"originMain":"7c09ab8214c4d2d213349b3281680aef653e5109","pullRequestCreated":false,"separateCiRun":false,"githubDeploymentId":7012395656,"githubStatusId":19638883920,"vercelDeployment":"4ZiFQhGwcdd4YrXizfopek59kKDE","environment":"Preview","productionEnvironment":false,"noPersistentSave":true,"databaseChanged":false,"productionDeployed":false,"qAPhase2Complete":true,"qAPhase2AuthorityConsumed":true,"qBAuthorized":false,"automaticNextStep":false} -->
