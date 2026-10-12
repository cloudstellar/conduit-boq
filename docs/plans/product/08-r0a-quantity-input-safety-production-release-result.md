# R0A Quantity Input Safety — Production Release Result

**Executed:** 2026-10-12

**Status:** `PRODUCTION PASS — Q-B COMPLETE; RELEASE AUTHORITY CONSUMED`

**Boundary:** `R0A_QUANTITY_INPUT_SAFETY_PRODUCTION_CLOSEOUT_20261012`

## Outcome

Quantity Input Safety is live in Production. The exact fast-forward source at
`4d285f81fa7ad418039ccd8428c2e55ac1e65ce8` was published to `main`, passed
the existing GitHub Quality workflow, reached Vercel Production as **Ready**,
and passed authenticated no-write Production verification.

The released behavior keeps Quantity numeric-only while calculating valid
drafts in real time. Unsupported input such as `5x2` stays visible as an
invalid draft and is never silently converted to `52`; invalid drafts cannot
reach Save. This release is not Quantity Expression and adds no formula
parser, persisted expression, schema/RPC change, migration, Catalog/Factor
operation, BOQ backfill, or account change.

Q-B is complete and its direct-main push, deployment, and bounded Production
verification authority is consumed. This receipt grants no follow-on release
or Production operation.

## Frozen release identities

| Evidence | Released identity |
|---|---|
| Previous `main` baseline | `7c09ab8214c4d2d213349b3281680aef653e5109` |
| Runtime/tests commit | `b18e69adeeaedbf10ca70c767ac4cf80a351b6bc` |
| Freeze documentation commit | `a467d385041d4d5b05d7a539ac28269a252b3f6d` |
| Exact Preview source | `5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3` |
| Exact Production source / `main` | `4d285f81fa7ad418039ccd8428c2e55ac1e65ce8` |
| Production source tree | `4a2a2fa8ba848de2c367420e43ad2c765efdc95b` |
| GitHub Quality run / job | [`38244719648`](https://github.com/cloudstellar/conduit-boq/actions/runs/38244719648) / `114795628519` |
| Vercel deployment / status | [`93LpycwQchZYVpPx9mCiVGokQSPG`](https://vercel.com/cloudwho-2662s-projects/conduit-boq/93LpycwQchZYVpPx9mCiVGokQSPG) / `56136566683` |
| Environment / source | `Production` / `main` at `4d285f8` |
| Production application | [boq.ntconduit.com](https://boq.ntconduit.com/) |
| Production Supabase project | `otlssvssvgkohqwuuiir` |

Fresh remote-ref verification after deployment found both `refs/heads/main`
and `refs/heads/codex/quantity-input-safety` at the exact Production source.
The local checkout was clean at the same commit. The application/runtime diff
is the reviewed `b18e69a` commit; the later commits align and record the
candidate without changing runtime behavior.

## Source and release gates

The exact candidate carried into Production had passed 643 tests in 56 files,
ESLint, TypeScript `--noEmit --incremental false`, the Next.js Production
build, and `git diff --check`. Q-A Preview verification is preserved in
[Preview Result #07](./07-r0a-quantity-input-safety-preview-result.md).

Before the Q-B write, the repository was clean, zero commits behind and four
commits ahead of the then-current `origin/main`. The update was an exact
fast-forward. A push dry run passed, no migration path was present in the
release diff, and the Owner explicitly approved the reviewed Solo Q-B path.

After the push, GitHub Quality run `38244719648` completed successfully; its
Install, Lint, Test, and Build steps all passed. Vercel deployment
`93LpycwQchZYVpPx9mCiVGokQSPG` completed successfully and was observed as
`Production`, `Ready`, source `main` at `4d285f8`, serving the production
domain above.

## Authenticated no-write Production verification

The bounded browser smoke used existing readable BOQs and client-only drafts.
It did not click Save, Copy, or Delete and did not execute a migration or
database write.

1. **Authenticated application and register**
   - The dashboard and `/boq` loaded for the existing Admin session.
   - The dashboard reported 302 BOQs and 710 Catalog rows; register search and
     route navigation rendered without an application error.
2. **Valid real-time calculation**
   - On BOQ `AWS`, the saved quantity was `1000.00`, saved route/BOQ total was
     `6,917,000.00`, Factor was `1.2550`, after-Factor total was
     `8,680,835.00`, and VAT total was `9,288,493.45`.
   - Draft `1001.50` immediately changed the route/BOQ total to
     `6,927,375.50`, Factor to `1.2549`, after-Factor total to
     `8,693,163.51`, and VAT total to `9,301,684.96`.
3. **Fail-closed invalid input and restore**
   - Draft `5x2` remained visible, showed the accessible numeric-only
     explanation, and never became `52`. Quantity step and Print controls were
     disabled, and the guarded Save path could not accept the invalid draft.
   - Escape restored quantity `1000.00` and every saved total. A second
     client-only draft `1002.25` followed by a genuine document reload also
     returned to `1000.00`, proving no Save occurred.
4. **Saved-version and legacy behavior**
   - The direct Print page showed saved quantity `1,000.00`, route total
     `6,917,000.00`, Factor `1.2550`, VAT total `9,288,493.45`, Factor version
     `2569.0.0`, and Catalog `2568.0.0`.
   - Existing legacy BOQ `UI Test #5`, which lacks a usable Factor snapshot,
     remained read-only/fail-closed. Its two routes could be selected without
     enabling unsafe editing.
5. **Browser console**
   - Captured Production `warn` and `error` console entries were empty after
     the smoke.

## Independent no-write database proof

A read-only Production `SELECT` at `2026-10-12 18:53:51 Asia/Bangkok`
confirmed that BOQ `AWS` still stored quantity `1000.00`, route/BOQ total
`6,917,000.00`, and VAT total `9,288,493.45`. The BOQ, route, and item
`updated_at` values all remained `2026-06-28 20:18:20.658728+00`, predating
this release verification.

No migration was created or applied. Migrations 027, 028, 029, and 030 remain
immutable/no-replay. Catalog, Factor F, BOQ business rows, account
configuration, and the protected archive were not changed.

## Separate LIST-1B finding

The Production register displayed `1 เส้นทาง` for `UI Test #5`, while its
editor and a read-only database query confirmed two route rows. Investigation
classified this as one confirmed, pre-existing `/boq` list-metadata mismatch,
not a Quantity regression. A BOQ that truly has one route and displays
`1 เส้นทาง` is correct; that common case is not evidence of the mismatch. This
verification did not establish how many other multi-route BOQs, if any, are
affected.

The relevant code and operational evidence show a credible failure path and a
separate scaling problem:

- Quantity changed neither `RouteBadge.tsx` nor the `/boq` list code;
- the row has not been updated since 2026-03-16;
- each mounted `RouteBadge` instance performs one route query, does not retain
  the returned query error, converts a result without usable route rows to an
  empty array, and then falls back to the whole legacy route string as one item;
  and
- both mobile and desktop register trees are mounted, amplifying requests.

Read-only Supabase edge-log evidence for the observed
`2026-10-12 11:49:50–11:50:40 UTC` load contained 1,198 OPTIONS and 740 GET
requests for `boq_routes`. Those counts confirm high request volume consistent
with the source-confirmed per-mounted-`RouteBadge` and dual-tree design. The
editor query and independent database read confirmed both stored rows remained
intact. The logs did not capture the specific Badge response, error, or status,
so they do not prove that request volume caused the `UI Test #5` mismatch. Code
behavior shows that a result without usable rows would render the observed
one-item legacy fallback, but its specific trigger remains unproven.

The demonstrated impact is a wrong list count for one known multi-route BOQ;
prevalence is unknown. There is no demonstrated effect on stored data,
Quantity calculation, Save, Print, or authorization. It does not justify a
Quantity rollback. LIST-1B should replace per-row queries with one embedded or
batched current-page route load, distinguish loading/error/true-empty states,
and cover successful multi-route, failed-network, and legacy-row behavior.

## Separate dependency-security finding

GitHub Quality passed its configured `npm ci`, lint, test, and build steps. It
does not run the repository's existing `audit:prod` script. The successful
`npm ci` log separately reported 20 advisories: 6 moderate, 13 high, and 1
critical.

A fresh read-only `npm audit --omit=dev` after release failed with six
Production dependency findings: one critical, four high, and one moderate.
The direct dependency `next@16.2.9` is critical; npm currently offers
`next@16.4.0` as a non-major fix path. This repository has nine authenticated
Admin Server Actions, so the unauthenticated Server Action CPU-denial advisory
is applicable before their internal authorization gates run. Endpoint
enumeration is partly applicable. The critical RCE paths are lower exposure in
this deployment: Vercel is not Windows; the repository has no custom server,
rewrites, `next/og`, AVIF configuration, remote/user-controlled image URL, or
untrusted image upload/decode path. Static local SVG use bypasses Sharp. Those
facts reduce immediate exploitability without making the dependency graph
clean.

Next.js has also [announced an out-of-band security update for 2026-10-14](https://nextjs.org/blog/upcoming-nextjs-security-update-october-2026)
covering two critical and one high upstream issue. For the Owner's low-overhead
Solo workflow, the preferred path is one isolated dependency-security release
after that patched version is available, unless immediate remediation is
chosen. If updating before then, `16.4.0` needs full application/Preview/
Production verification and a second audit/update after the announced release.

This finding predates and is separate from Quantity behavior. It does not
invalidate the Quantity QA or call for a Quantity rollback, but it should be
treated as High-priority security maintenance before feature work; current
evidence does not call for an emergency shutdown. Do not run `npm audit fix`
blindly: align
`next`, `eslint-config-next`, the lockfile, Next's PostCSS requirement, and
Sharp intentionally, then add a Production audit gate after establishing a
clean baseline.

## Accepted residuals and next decisions

- No persistent current-schema Save was performed; Production verification
  intentionally remained no-write. A future write rehearsal requires named
  disposable data and fresh authority.
- Saved Print rendering passed. Production Excel download and browser PDF
  generation were not repeated in this no-write closeout; earlier local output
  evidence remains limited to its named fixtures.
- This was desktop browser verification, not physical-device acceptance or a
  large-BOQ performance certification.
- The dependency-security finding above remains open and is the recommended
  immediate follow-up before LIST-1B.
- LIST-1B, wider R0/D0 accounting work, R1/R2 Quantity Expression, and wider S0
  Auth/Security remain separate decisions. No implementation is authorized by
  this result.

The recommended order is the isolated dependency-security release, then
LIST-1B because the Production smoke produced direct evidence of one
multi-route list-count mismatch plus independent evidence of high request
volume consistent with the per-mounted-`RouteBadge` and dual-tree design. Wider
R0/D0 should still precede R1/R2 Quantity Expression.

<!-- R0A_QUANTITY_INPUT_SAFETY_PRODUCTION_RESULT_V1 {"schema":"conduit-boq/r0a-quantity-input-safety-production-result/v1","executedOn":"2026-10-12","boundary":"R0A_QUANTITY_INPUT_SAFETY_PRODUCTION_CLOSEOUT_20261012","status":"production-pass","runtimeCommit":"b18e69adeeaedbf10ca70c767ac4cf80a351b6bc","previewSourceCommit":"5527fe9fe9ce6e1f8888912c18dc9b26e7b1b6b3","productionSourceCommit":"4d285f81fa7ad418039ccd8428c2e55ac1e65ce8","productionSourceTree":"4a2a2fa8ba848de2c367420e43ad2c765efdc95b","mainPrevious":"7c09ab8214c4d2d213349b3281680aef653e5109","remoteMainEqual":true,"remoteFeatureEqual":true,"githubQualityRun":38244719648,"githubQualityJob":114795628519,"vercelDeployment":"93LpycwQchZYVpPx9mCiVGokQSPG","vercelStatusId":56136566683,"environment":"Production","productionEnvironment":true,"noPersistentSave":true,"databaseChanged":false,"migrationRun":false,"routeBadgeFinding":"one-confirmed-multi-route-list-count-mismatch","routeBadgeSingleRouteOneExpected":true,"routeBadgeExactTriggerProven":false,"routeBadgePrevalenceKnown":false,"productionAuditFindings":6,"productionAuditCritical":1,"dependencyPatchRequired":true,"qBComplete":true,"qBAuthorityConsumed":true,"automaticNextStep":false} -->
