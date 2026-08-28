# Phase 4 Master Catalog Exact Remaining Work - Canonical Handoff

**Status:** FINAL RELEASE AUTHORIZED; LOCAL R-01 COMPLETE; R-02 IN PROGRESS;
R-03 THROUGH R-05 MAY ADVANCE ONLY AFTER EACH PRIOR EXACT GATE PASSES; NO RETRY
AND NO CATALOG PUBLICATION, BOQ CHANGE, OR FACTOR F CHANGE

**Recorded:** 2026-08-28 13:57:30 +07

**Execution plan:** [Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md)

<!-- MASTER_CATALOG_EXACT_REMAINING_WORK_V1 {"schema":"conduit-boq/master-catalog-exact-remaining-work/v1","recordedAt":"2026-08-28T13:57:30+07:00","productionReadOnlyQueryPerformed":true,"productionProjectHealthy":true,"catalogVersion":"2568.1.0","catalogTotalRows":710,"catalogActiveRows":710,"catalogInactiveRows":0,"catalogDatasetHash":"sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733","catalogLockVersion":4,"item0429Costs":[0,1764,1764],"item0615Costs":[2869,7427,10296],"productionAdminUi":"read-only","catalogAdminEnabled":false,"catalogNewIdentityEnabled":false,"catalogRetirementEnabled":false,"latestProductionMigrationVersion":"20260827174634","latestProductionMigrationName":"p49_active_profile_authorization_hardening","migration027AppliedOnceNoReplay":true,"migration028Required":true,"migration028Applied":false,"migration028FunctionsPresent":false,"migration028SourceSha256":"6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3","migration029Required":false,"remoteMain":"c2ea0852affe1abca0230dde3daa4b332ead0a83","featureBranch":"codex/master-catalog-admin-edit","featureHead":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe","p19DirectionApproved":true,"p19ImplementationComplete":true,"p19RenderedFixturesVerified":true,"p19LocalTestResult":"48-files-444-tests-pass","fullWp8P37UatReplayRequired":false,"p49TechnicalImplementationLive":true,"p49FormalCloseoutComplete":false,"expandedProductionPersonaTestDisposition":"accepted-residual-not-pass","vercelDeploymentShaVerified":false,"openWorkIds":["R-02","R-03","R-04","R-05"],"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL","applicationCodeAuthorized":true,"commitAuthorized":true,"pushAuthorized":true,"mainMergeAuthorized":true,"productionReadAuthorized":true,"productionWriteAuthorized":true,"deployAuthorized":true,"flagChangeAuthorized":true,"automaticNextStep":true} -->

## 1. Authority and evidence boundary

This document is the single current handoff for volatile Master Catalog status,
completed/no-replay work, the exact remaining work, and present authorization.
[Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md) owns
the target, invariants, detailed validation, staged rollout, and recovery
contract. The Runbook, Tracker, and Decision Register preserve procedures,
chronology, and decision-time evidence; their dated `Current`, `HOLD`, or
`unauthorized` wording does not override this handoff.

The state below was reconciled from fresh read-only Production database
queries, the live Production Admin UI, exact Git remote refs, and the isolated
feature worktree. No Production or source mutation was performed. The live UI
did not expose the exact Vercel deployment commit, so no deployment SHA is
claimed. Bind the actual deployment SHA and Ready result during R-03.

## 2. Verified current truth

| Area | Exact current state |
|---|---|
| Master Catalog data/publication | Complete. Default/current version `2568.1.0`; `710` total, `710` active, `0` inactive; dataset hash `sha256:8c42878c84fcc38bfc3b9e0b8efd6191467ddb9ccc273ec123c6ec2c6f544733`; review lock `4`. |
| Reviewed corrections | `ITEM-0429` / `COR-PB0-002` is `0/1764/1764`. `ITEM-0615` / `LVU-MH0-002` is `2869/7427/10296`. |
| Existing business data | Existing BOQs were not repriced or backfilled. Factor F is unchanged. Reviewed XLSX/PDF publication evidence remains complete. |
| Production Admin UI | Live and intentionally read-only. Create, edit, import, publish, and restore controls remain unavailable. |
| Runtime settings | Exact JSON booleans: `catalog_admin_enabled=false`, `catalog_new_identity_enabled=false`, `catalog_retirement_enabled=false`. |
| Completed publication gates | P-13, P-14, P-14C, and P-15 are complete and must not be replayed. P-51 first closeout is consumed and historical. |
| P-49 technical state | Migration 027 is live exactly once as `20260827174634/p49_active_profile_authorization_hardening`. The matching technical correction is complete; formal closeout remains open. The unrun expanded persona rehearsal is an accepted residual, not PASS. |
| Migration 028 | Source exists on the feature branch with SHA-256 `6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3`; absent from the Production ledger; both 028 gate functions are absent in Production. |
| Git | Exact release branch is `codex/master-catalog-admin-edit` at `705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe`, matching `github/codex/master-catalog-admin-edit`. Remote `github/main` is `c2ea0852affe1abca0230dde3daa4b332ead0a83`. The local-path `origin` remote is not a release target. |
| P-19 | Local implementation, exact PDF-to-Excel parity checks, automated tests, and three rendered four-page A4 fixtures are complete. Official PDF is active-only; draft PDF retains and marks inactive rows. |
| End-to-end result | Catalog data/publication and local R-01 are complete. Full Admin edit operation is not complete until R-02 through R-05 pass. |

## 3. Complete and no replay

Do not reopen or repeat any of the following merely to finish Admin edit:

- P-12 migrations `017` -> `017a` -> `018`-`026` and the v7 backup/restore;
- P-13, P-14, P-14C, P-15, or the first P-51 closeout/publication;
- migration 027 or the completed P-49 database/application hardening;
- WP-8/P-37 full UAT, which the Owner accepted under the recorded guided-UAT
  variance; or
- catalog price/data reconciliation, existing BOQ repricing, or Factor F work.

WP-8/P-37 evidence remains reusable unless a related source contract changes.
P-19 was a new, bounded PDF presentation delta and its focused local proof is
complete; it does not require a full UAT replay.

## 4. Completed local block - R-01

R-01 is complete in the isolated feature worktree. The implementation now:

- filters published and archived official PDFs to active rows only;
- retains every draft row and visibly marks inactive rows `ยกเลิกใช้`;
- preserves truthful displayed/total/excluded counts and labels the SHA-256 as
  covering the complete version, including inactive rows;
- uses category-local sequence, a deterministic `290 mm + 7 mm` A4 page slot,
  and redundant fixed/per-sheet headers without relying on fragmented
  `<thead>` repetition;
- proves exact PDF-to-canonical-Excel parity for identity, order, description,
  unit, three costs, category, display order, category-local sequence, and
  active state; and
- leaves database loading, Excel contents, canonical dataset/hash/history,
  stored order, BOQ, and Factor F unchanged.

The final local evidence is:

- `48` test files / `444` tests PASS; ESLint, production build, and
  `git diff --check` PASS;
- all-active published PDF: four A4 pages, SHA-256
  `7d99d558ddb1985ad51538217f5566a870d342ebc8b2b7af71f1a7717d10cd63`;
- mixed-status published PDF: four A4 pages, SHA-256
  `2ebe6f7071dc19199c486becdbd00a5ddaf46ee16267282a24cb9e9eb6d75205`;
- mixed-status draft PDF: four A4 pages, SHA-256
  `00443751be15f7a4a31c364e0cffd01e1fc7605a95abed25d7cf6a2940b6a3e2`;
- cover plus first/middle/last price pages visually inspected for Thai text,
  logo/title, repeated headings, category continuation, inactive mark,
  footer, and page numbering; and
- all temporary fixture routes and the temporary auth bypass removed; the
  production build route manifest contains no fixture route.

The mixed-status published fixture is local evidence only. No live
mixed-status version was created or published.

## 5. Exact remaining work - four release blocks

### R-02 - Freeze and publish the exact feature release

Review the complete isolated-worktree diff, re-run the required local gates,
record exact hashes/results, then commit and push only
`codex/master-catalog-admin-edit` to remote `github`. This block requires a
separate explicit Owner authorization. Do not release from the dirty main
checkout, use the local-path `origin` as the release remote, or touch protected
untracked roots.

### R-03 - Apply 028 once and deploy flags-off

Under a new bounded Production authorization:

1. perform one fresh read-only preflight proving the exact applied migration
   027 ledger and frozen source/function fingerprint still match, all three
   settings are false, 028 is absent, and the data/RLS/ACL baseline has not
   drifted;
2. freeze the intended 028 ledger version/name and the unchanged source SHA;
3. apply unchanged migration 028 exactly once, verify ledger/functions/
   permissions/RLS/data/settings, and stop without retry on uncertainty;
4. merge/push the exact reviewed feature release to exact `github/main` once;
5. wait for its automatic Vercel Production deployment while all flags remain
   false; and
6. bind the actual deployed commit/Ready result and verify the UI remains
   read-only.

Do not create migration 029. Do not edit or replay migrations 020, 021, 027,
or 028.

### R-04 - Enable capabilities in one bounded staged window

Use one key, one transaction, an exact expected-before value, and exact
after-readback for each conditional compare-and-set. Never enable the three
settings in one statement. Any mismatch, non-one row count, or uncertain
response closes the global Admin gate and stops without retry.

- **Stage A:** `catalog_admin_enabled=false -> true`; verify authenticated
  current-Admin Edit/Recode and eligible recovery authorization, non-Admin
  denial, Add and Retire denial at both UI and database boundaries, audit, and
  disposable-draft cleanup.
- **Stage B:** after A passes,
  `catalog_new_identity_enabled=false -> true`; verify Add/Supplement,
  placement, eligible never-published Withdraw, audit, and cleanup.
- **Stage C:** only after R-01 evidence passes,
  `catalog_retirement_enabled=false -> true`; use a disposable draft to Retire
  -> verify the draft PDF inactive mark -> Reactivate -> verify audit ->
  abandon/clean up. Bind official active-only behavior to the exact local
  automated/render evidence; do not publish a mixed-status live version.

No Stage A/B/C smoke publishes or restores a catalog version. Existing BOQs
and Factor F remain unchanged.

### R-05 - Record the short P-49 formal closeout

After R-04 passes, record the actual migration, deployed-commit, flag,
authorization, denial, audit, and cleanup evidence. Keep the unrun expanded
Production persona rehearsal labelled `accepted residual - not PASS`. This is
the final documentation closeout; it is not another technical implementation
or migration.

## 6. Explicit non-work

The remaining route does not include migration 029, another price correction,
another Master Catalog publication, pointer restore, existing BOQ mutation,
Factor F mutation, published-row hard delete, or replay of any completed gate.
It also does not treat prior unrun tests as PASS.

## 7. Recovery contract

On any staged failure, close the global gate first. If
`catalog_admin_enabled` is exact boolean true, conditionally change it to
false; if it is already false, verify it without a no-op update. Verify denial
of new database mutations, noting that an already-running transaction may
finish. Then conditionally restore each true capability setting to false in a
separately checked one-key transaction, or read and confirm it when already
false. Record final exact `false/false/false`. Preserve the failed draft and
audit evidence when needed for diagnosis, abandon only when the reviewed
cleanup contract allows it, and stop. Do not improvise reverse SQL or retry an
uncertain write.

## 8. Current authorization boundary

The Owner issued `APPROVE MASTER CATALOG FINAL` on 2026-08-28 and explicitly
authorized R-02 through R-05: commit/push the feature release; perform one fresh
Production preflight; apply unchanged migration 028 once with no retry; push
the exact reviewed commit to `main` for flags-off Vercel auto-deployment;
enable Admin, New identity, and Retirement one-by-one with exact readback plus
disposable-draft QA/cleanup; and record the short P-49 closeout.

Advancement remains conditional on each prior gate passing. The authorization
does not permit a new catalog publication, restore, BOQ mutation, Factor F
mutation, migration replay, or retry after an uncertain write.
