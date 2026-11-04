# S0 — BOQ direct-write role boundary plan

**Prepared:** 2026-10-24 (Asia/Bangkok)\
**Status:** LOCAL API EVIDENCE PASS / R5 DESKTOP FLOW PASS / MOBILE CAPTURE LIMIT / CLEANUP PASS\
**Updated:** 2026-11-05 (Asia/Bangkok). See [current checkpoint](#6-current-checkpoint)
and [local approval packet](#7-local-approval-packet--2026-11-02).\
**Current authority:** Owner-approved source publication under the [S0 Solo plan](../../07_process/S0_SOLO_RELEASE_PLAN_20261104.md)
only:document/manifest update,fresh readonlypreflight,exact25paths publication,
CI/Vercel/anonymous no-write smoke and conditionalclientrollback. See
[section12](#12-s0-source-publication-approval--2026-11-05) for outcome/grant consumption.
No032apply/DBmutation/Auth/businessRPC/fixtures or replay027–032. R5 grants remain
consumed;mobileusability NOT VALIDATED and recorded evidence limits unchanged.

## 1. Problem and evidence limit

The existing procurement role is intended to be read-only for BOQ business
data. The guarded Save and atomic Copy paths deny procurement mutation, but
the captured direct table-write policies do not consistently enforce that
role boundary.

The read-only review compared repository SQL with the existing final-state
metadata capture documented in [Local Database Parity Result](../../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md).
Its capture time is `2026-10-22T18:44:51.443243Z` (2026-10-23 01:44:51
Bangkok). The host-local, unpublished source is recorded as
`supabase/local/baselines/20261023-production-contract/source.json`; its
existence is evidence custody, not permission to publish or execute the nine
parity tooling/baseline files.

The source and captured metadata show:

- `authenticated` has INSERT, UPDATE and DELETE privileges on `public.boq`,
  `public.boq_routes` and `public.boq_items`, subject to RLS.
- Permissive header UPDATE branches admit an active creator or assignee
  without excluding procurement. Header DELETE admits an active creator of a
  draft without excluding procurement. Header INSERT already excludes it.
- Child INSERT and UPDATE have creator/assignee branches without that role
  exclusion. Child DELETE admits the creator or Admin; assignment alone does
  not grant child deletion.
- P-49's restrictive current-active checks include active procurement. They
  close non-active access but do not close this active-role write gap.
- Captured BOQ triggers protect immutable Catalog/Factor version bindings,
  defaults and route timestamps. They do not supply a procurement write guard.
- Existing guarded Save admits only its supported writer-role/scope branches;
  atomic Copy separately allows only Admin, department manager, sector manager
  and staff to create a destination.

For example, an active procurement actor who remains creator/assignee can
satisfy the direct UPDATE predicates while changing an ordinary field and
retaining the same relationships. The normal role-change workflow can leave
BOQs owned by an actor whose role later becomes procurement. This establishes
a concrete source-derived authorization gap; it does not establish that any
particular account has such BOQs.

References: [009 table policies](../../../migrations/009_master_catalog_p0_containment.sql),
[027 active-profile boundary and Save](../../../migrations/027_p49_active_profile_authorization_hardening.sql),
[030 exact Save guard](../../../migrations/030_boq_save_null_authorization_guard.sql),
[029 atomic Copy](../../../migrations/029_atomic_boq_duplicate.sql), and the
[implemented security contract](../../04_data/SECURITY_MODEL.md).

**Evidence classification:** source/captured-metadata finding confirmed;
fresh local behavior reproduction **NOT RUN**; current Production behavior,
affected-account prevalence and exploitation **NOT TESTED/UNKNOWN**. No
unauthorized Production request, business-row read or new database inspection
was performed for this review. A metadata capture is dated evidence, not a
perpetual live-state guarantee.

## 2. Smallest proposed correction

Add a restrictive writer-role check for each INSERT, UPDATE and DELETE command
on each of the three BOQ tables: nine uniform guards. Allow only a current
active `admin`, `dept_manager`, `sector_manager` or `staff` profile. Unknown,
missing and unsupported roles must fail closed.

The existing `private.p49_current_active_role()` is a possible predicate source
after its exact definition, owner, configuration and ACL have been verified on
the intended local target. Reusing it need not change the helper itself.

| Command | Proposed additional condition | Existing behavior retained |
|---|---|---|
| INSERT | Writer-role allowlist in the new-row check | Existing ownership, draft, parent visibility and other INSERT checks |
| UPDATE | Writer-role allowlist for both existing-row use and new-row check | Every existing owner/assignee/manager scope and constraint |
| DELETE | Writer-role allowlist for existing-row use | Existing Admin/creator/draft and child-delete conditions |
| SELECT | No new policy or changed predicate | Existing authorized visibility, list/count, child and output reads |

The restrictive guards must compose with the permissive policies; they must
not replace the existing scope predicates or create an alternative permissive
path. Do not use an ALL-command guard that also changes SELECT.

Eight command families currently lack the procurement exclusion. The ninth,
header INSERT, already denies procurement; the uniform guard makes the same
write-role invariant explicit without granting any new behavior. This plan
does not grant managers additional direct child writes, widen assignee DELETE,
or convert existing reads into writer-only reads.

Proposed implementation scope is the narrow new forward migration, focused
regression fixtures/tests and its execution evidence after separate approval.
Do not bundle a general rewrite of `lib/permissions.ts`, Admin directory UX,
NT visual design, package/lockfile changes, account repair or a role redesign.
A UI may currently offer an operation that the corrected database will deny;
that existing hint mismatch is separate from the trusted write boundary.

## 3. Authority and source preflight before any DDL

Implementation requires new explicit approval covering preparation of the SQL
artifact and its bounded application/tests on the existing local Docker target.
No migration number is reserved and no SQL file is created in this planning
step. Migrations **027–031 are immutable/no-replay**. Do not edit, replay,
rename, bundle or reconstruct them as a workaround.

After that approval, and before any local DDL:

1. Verify current Git/source and preserve all unrelated dirty work. Identify
   the exact proposed artifact and target; do not assume the dated capture is
   the running local contract.
2. Inspect only the relevant local metadata: table and column grants,
   restrictive/permissive policies, RLS state, role-helper definition and
   execution privileges, triggers/constraints, and unchanged Save/Copy/031
   definitions and metadata. Capture a bounded predecessor fingerprint.
3. Confirm that the current local target supports the relevant post-031
   contracts. Unknown drift must stop preparation/application and be reported;
   it is not permission to reset, restore, replay or silently repair parity.
4. Review the new migration so it fails before mutation on an unexpected
   predecessor or existing successor, applies the reviewed guard set
   atomically, and verifies the exact successor while retaining all other
   policies/grants/functions. Do not overwrite unreviewed drift.

No reset/restore, additional database stack, original-account/password change,
Catalog/Factor mutation, protected archive access or execution of the nine
parity tooling/baseline artifacts is part of this plan. Do not make a backup of
recreatable test data an automatic prerequisite. Follow the existing
[Solo working agreement](../../07_process/RELEASE_PROCESS.md#working-agreement-20261015).

A later Production release would require its own explicit authority, exact
source/target review and fresh read-only metadata preflight before approved
DDL. This plan grants none of those operations and is not an execution runbook.

## 4. Proposed local acceptance after separate approval

Use the existing Docker target with bounded synthetic actors and BOQs created
only under that approval. Preserve original local usernames/passwords, prior
data, reference rows and evidence. Reuse existing suitable references without
editing Catalog or Factor F. Identify every newly created row/account so any
approved cleanup targets only this run's fixtures.

### Reproduce and deny the specific gap

- Before applying the new guard, reproduce the captured direct-write mismatch
  only against this run's synthetic records. Cover a procurement creator and
  assignee, including an actor whose role changes while retaining BOQ
  ownership. Do not use existing Owner BOQs to prove the failure.
- After application, test direct Data API INSERT/UPDATE/DELETE on all three
  tables with current authenticated sessions. Cover creator, assignee,
  same-scope non-owner and cross-scope procurement; cover header draft DELETE
  and the narrower child DELETE rules separately.
- Verify unchanged graph/state after each denied request. UPDATE/DELETE can
  produce zero affected rows rather than an HTTP error; a status code alone
  is not proof of denial or success. Check actual affected rows and persisted
  values. Verify a read remains possible where the unchanged SELECT scope
  permits it.
- Retain denial for anonymous, pending, inactive, suspended and missing-profile
  actors. A role changed to procurement must be denied by subsequent requests
  without relying on refreshed client role claims.

### Preserve existing allowed behavior

- Admin, department manager, sector manager and staff retain exactly their
  existing scope-dependent allowed and denied direct operations. An allowlist
  match alone must not confer write permission.
- Verify valid Create, guarded Save/reload, list/count/routes and saved output
  reads against the relevant local contract. Include active legacy profiles
  with actual organization IDs null; this patch neither repairs their data nor
  forces them back through onboarding.
- Verify unchanged guarded Save procurement denial and nullable/cross-scope
  denial. Retain normal atomic Copy and selected-Factor eligibility behavior,
  stable request UUID replay, mismatched-payload denial and the exact 031 stale
  conflict contract. The patch must not change function bodies, locks, ACLs,
  idempotency ledger semantics or source/destination identity.
- Check expected metadata delta, immutable migration hashes and preservation of
  pre-existing data/accounts. Run appropriate source/test checks on Node 24;
  run lint, TypeScript and build if the approved candidate includes or affects
  application/test source. Do not treat those checks as direct API acceptance.

Report exact source/target, request cases, affected-row/state evidence and
PASS/FAIL/NOT RUN. Existing local test receipts are historical evidence rather
than a substitute for this candidate's focused reproduction/regression. B
Production HTTP stays **NOT RUN and closed**; this plan does not reopen it.

## 5. Risks, limitations and separation from other work

- **Scope regression:** a replacement/permissive policy or ALL-command guard
  could accidentally grant writes or remove procurement reads. The exact
  policy delta and positive/negative matrix are release gates.
- **Existing UI affordances:** an owning procurement actor may still see an
  outdated Delete/Create/Edit hint. Database denial is intentional; any UX
  correction must be separately scoped rather than weakening the guard.
- **In-flight role changes:** current-profile lookup uses normal statement
  visibility. This plan does not promise cancellation of already-running
  statements, a general revocation SLA, Auth ban or session/token revocation.
- **Other trusted-write gaps:** otherwise authorized writers retain their
  existing direct-write capabilities, including metadata/status/numeric fields
  not protected by current triggers. This patch does not close broader S0,
  wider R0/D0, W-H or the complete lifecycle/write-boundary design.
- **Privileged paths:** table-owner and service-role bypass behavior is not
  redesigned. Do not claim a restrictive authenticated policy secures every
  privileged server/tooling path.
- **Recovery:** an atomic preflight/postcondition failure must leave the prior
  policy state intact. Removing a successful security guard would reopen the
  gap; no automatic policy removal, restore or Production rollback authority is
  granted. A later correction needs a reviewed forward plan and approval.

This bounded security correction should precede optional user-management UX
publication. Planning UM-A and the sitewide NT visual foundation can proceed
in parallel, but neither branding nor unknown corporate SSO/hosting policy
should delay an approved correction of this confirmed write boundary. Keep
their implementation/release changesets separate.

UM-A remains application-only: Admin-first A1 keeps shared Auth/domain settings
and existing command contracts unchanged; A2 signup/confirmation/pending/profile
is a separately reviewed follow-up. Neither stage includes this SQL correction.
UM-B organization/role transitions, admission/recovery policy, account
continuity and offboarding require their own decisions. A future Viewer must
not be added until its status/scope/action matrix and denial across direct
table writes, RPCs, server paths and outputs have been designed and tested;
adding a role or hiding buttons is insufficient. Operational BOQ/TOR and
Quantity Expression remain separate unapproved work under
[Roadmap #09](../product/09-integrated-roadmap-and-it-decision-handoff.md).

## 6. Current checkpoint

Last updated: **2026-11-05 (Asia/Bangkok)**. Current milestone:
**S0_SOURCE_PUBLICATION_APPROVED — PREFLIGHT_PENDING — PRODUCTION032_NOT_AUTHORIZED**.

This section owns S0 progress/authority. UM#12 continues to own UM progress;
do not copy S0's execution tracker there. Older sections1–5 remain the focused
design/evidence record; section7 makes the next local scope concrete.

| Item | Actual state | Next gate / limit |
|---|---|---|
| Finding | FRESH LOCAL REPRODUCTION PASS | Procurement creator/assignee loophole reproduced before 032; no current Production/prevalence claim |
| Source inspected for this packet | Local `main == origin/main == 67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`; index empty | Prior bounded Nov5 hosted source/tree matched67;not perpetual fresh evidence. Unrelated A1 dirty source retained |
| Local execution scope | PRIOR CORE/UI RUNS + TWO STAFF-ONLY RUNS + R3/R4/R5 FINALIZED / GRANTS CONSUMED | Guard2/successor-r1,UI-onlyR1/R2/R3/R4/R5,staff diagnosis and patched-Login regression retain their own outcomes;no reopening or automatic repeat |
| Current authority | EXACT25 SOURCE PUBLICATION / PREFLIGHT / CI-VERCEL / ANONYMOUS SMOKE / CONDITIONAL CLIENT ROLLBACK | Owner's explicit later grant;stop on drift. No032apply/DBmutation/Auth/businessRPC/fixtures/replay027–032;R5 grants remain consumed |
| Prior hosted preflight Nov5 | SOURCE / PREDECESSOR METADATA PASS WITH LIMITS | Section11:source67/ReadyNode24/main/auto-assignment;15policies/31ledger/Copy031/prehash matched. Vercel env value unobserved;not an added OTP gate. No current hosted authority |
| Proposed032 MCP delivery | DOCUMENTED_SUPPORTED_WITH_LIMITS / PAYLOAD RUNTIME NOT RUN | Immutable source592872b3…;proposedpayload9cc46a3d… omits only outerBEGIN/finalCOMMIT. Officialcontract review complete,not hostedbackend proof;no payload sent/apply grant. Platform records history;postflight/UNKNOWN/no-retry retained |
| Create/Save UI R3 | FINALIZED / CREATE PASS / SAVE NOT DISPATCHED / UI HOLD / CLEANUP PASS | Exact helper searches did not match fixture source names/codes;0Save requests. One inactive synthetic profile + one empty BOQ retained;3sessionsCLOSED/0sessions0tokens. Section9.16 records evidence limits |
| Corrected UI R4 | FINALIZED / SELECTOR AND CREATE PASS / SAVE NOT DISPATCHED / UI HOLD / CLEANUP PASS | Section9.18:selector200/rows1/eligible1,quantity string assertion HOLD;3CLOSED/0residue/32table+originalAuth independentPASS;no childwrite |
| Quantity contract correction | NEW HELPER51OFFLINE PASS / LIVE NOT RUN | Section9.20:both checkpoints require canonical3.00/no focus/ARIAfalse/no draft;bounded read/persisted actualstate;expectedEdit→Print substeps.151pins/candidate549 unchanged;R4actualinput unretained andHOLD retained |
| Qualified corrected-helper integration |101OFFLINE PASS / R5 EXECUTED AND FINALIZED | Section9.21 source qualification is dated pre-execution proof;171pins/candidate549 remain unchanged. Section9.22 records actual results;do not rerun frozen qualification expecting runtime paths absent |
| New R5 desktop business flow |PASS / CLEANUP PASS / FINALIZED | Exactly1Create/1Save;quantity3.00 afterEnter/reload;90material60labor150cost/F1.1/165beforeVAT/11.55VAT/176.55total;singleexpectedalert/savedPrint/keyboard/0healtherrors |
| Mobile capture review |REVIEWED WITH P2 EXISTING CLIPPING / USABILITY NOT VALIDATED | Unchanged240pxsidebar/min800pxtable clips itempanel at390px;repeatedheaderband imagecause unconfirmed. Screenshot-only scope,no fullmobile/responsivePASS |
| Login prefetch correction | PUBLIC + AUTHENTICATED READ-ONLY REGRESSION PASS | Section9.13 public1→0rootprefetch/Enter/tap/PNG +37Auth tests/lint/TS/build PASS;section9.14 Login200/Createform200/0rootprefetch404errors/1login1local logout0residue |
| Existing-staff diagnostic | WRONG-PAGE SEGMENT REDIRECT DIAGNOSED / CLEANUP PASS | Section9.12 correlated Login-segment→root307→404/postponed2/same-requestabort;body unobserved,strict classifier unchanged.1login/1local logout/0residue/32tablecustody;no business dispatch |
| R2 authenticated attempt | LOGIN + CREATEFORM READY / CONSOLE404 HOLD | Actual title/body176/414/controls passed; weborigin GET/404+ERR_ABORTED captured, no Create/Save.83source and32tablecustodyPASS;1inactive/3CLOSED/0residue/7audits |
| Qualified-helper integration | COORDINATOR21 / PRODUCER13 / SOURCE-PINS+INTEGRATION4 OFFLINE PASS | New path/helper345…/peer hashes/protected83 agree; R2 used these exact sources. Fresh preflight PASS; authenticated flow stopped at console404 HOLD |
| Unauthenticated Login / new helper | DESKTOP + MOBILE PASS / HELPER18 + SAFETY3 OFFLINE PASS | Section9.9 actual PNGs and console/network/keyboard/storage reviewed;0Auth/Data API/serveregress/accounts/sessions. Full authenticated flow remains NOT RUN/HOLD |
| UI-only follow-up | R2 LOGIN + CREATEFORM READY / BUSINESS FLOW NOT RUN / GATE HOLD | Section9.11:web GET/fetch404 stopped before Create/Save. Anonymous controls prove a Next segment-MISS mechanism; R2's exact request signature remains unconfirmed. R1's earlier readiness failure stays historical |
| Fresh proof producer | R2 LIVE READ-ONLY PREFLIGHT PASS | Section9.11:2 RRreadonly/ROLLBACK queries, full post032 metadata digest54f5d9f5…, exact target/source/key/default bindings;0Auth/HTTP/writes/DDL during preflight |
| Successor-only remaining validation | CORE API PASS / BUILT APP + OVERALL HOLD | Newrun112PASSrecords including45prepare;227DataAPIrequests;37status/control records; title assertion stopped browser afterLogin,0UIbusinesswrites/PNGs; actualtitle unretained and console404 unmapped |
| Running-local preflight | R5 FRESH READ-ONLY PREFLIGHT PASS | Section9.22 exactDB/volume/containerIDs/14.5/fullpost032metadata/credential/default/selectorbindings match;2RRreadonlyROLLBACK/0AuthHTTPwritesDDL before Auth. Runtime metadata barriers passed;no Production observation |
| New migration / runner / safety tests | FOUR-PATH SOURCE CHECKS PASS; 032 APPLIED ONCE LOCAL | [Local receipt](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md); SQL SHA592872b3…3fbd41f; one dispatch/exit0; +9 restrictive policies,0 other relevant metadata delta,35 table digests unchanged across DDL; no ledger relation/entry |
| S0-only source quality | PROSPECTIVE25PATHS FRESH801/61PASS / LINT0ERRORS3OLDWARNINGS / TYPESCRIPT PASS | Current exact S0+Login+Markdown projection excludesA1/parity;Node24.2.0. Old801preLogin/37Authsubset remain dated. Qualified unchanged Turbopack reused;actualNode22CI/hostedbuildNOTRUN |
| Local consolidated document checks — R5 closeout Nov4 | DATED22/22 /570LINKS198ANCHORS19MARKDOWN PASS | R5runtimecloseout/scopeddesktopPASS/mobilelimit/cleanupPASS;171oldpins+216aftermap/candidate549 unchanged,indexempty. Source101 is dated pre-execution qualification |
| Short-plan document checks — Nov5 | 6 EXISTING CONTRACTS /586LINKS201ANCHORS20MARKDOWN PASS | Documentation-only checks on Node24;no new fullsuite/build/DB/runtime. Source032/proposedpayload mapping unchanged;see section11 |
| Default Turbopack / real built app | QUALIFIED LOGIN-PATCH BUILD / R5 DESKTOP CREATE-SAVE-RELOAD-PRINT PASS | Exact existing source/buildf225…/5b34… used;549sourcebytes unchanged. Mobilecapture reviewedwithlimit,no fullmobile/exportPASS. No package/config/newbuild change |
| Harness / UI preparation and execution | HELPER34532… / R2 READINESS PASS / HEALTH HOLD | Body>80 and fresh DOM/controls passed in R2. Old3ed…/743f… failures preserved. New passive correlation collector4offline PASS; not attached to an authenticated run and no guard waiver |
| First mutation / startup attempts | PREPARE REJECTED — ZERO MUTATION | NonTTYstartup and laterapproval-blockedTTYattempt both closed preAuth;0intents/0sessions/0createdactors/0BOQs/0DDL; private evidence retained,ownedserver stopped |
| Fixture/Auth lifecycle | R5 FINALIZED / CLEANUP PASS |1inactive synthetic profile/audit/1BOQ1route1item retained;3exact sessionsCLOSED/0sessions0tokens/7audits/10CONFIRMED0UNKNOWN. Actual32table+originalAuthhashvectors independently comparedPASS. Earlier runs/evidence limits retained |
| Core direct API / app / Save / Copy031 acceptance | COMPOSITE API EVIDENCE + R5 DESKTOP FLOW PASS WITH LIMITS | Core earlier scopedAPI evidence retained;newdesktopCreate/Save/reload/calculation/savedPrint PASS. Mobileusability NOTVALIDATED/P2limit;threeacceptededgeNOTRUN retained. Rawgraph/Factor rows unretained,so file-only interpolation reconstruction unavailable. Release needs exact separate proposal |
| Missing-profile / activeNULL / positive eligible-legacy fresh cases | NOT RUN — EXPLICITLY ACCEPTED FOR THIS LOCAL S0 SCOPE | Section7.5 only; no waiver for feasible NULL-Save/core failures or UM-B's primary positive case; never bypass current guards |
| Publication / Production / rollback |25PATH SOURCE PUBLICATION APPROVED / ACTUAL RELEASE CHECKS PENDING | Same5source+20Markdown,excludesA1/parity9;sourcefirst. Owner approved conditionalclientrollback/anonymoussmoke under plan. Production032apply remains NOT RUN/NOT AUTHORIZED;recorded mobile/evidence limits unchanged |

History for this planning step:

- 2026-11-04 no-Auth Login: explicit newhelper/offline/probe grant, no accounts/
  Auth sessions/DB or old-run operations.18helper+3safety mocks PASS. First
  probe HOLD blocked the NT-logo Link prefetch to/; source/evidence retained.
  Exact marked local RSC prefetch/redirect allowed by the corrected probe,
  without allowing Auth/Data API or removing console guards. Actual desktop/
  mobile/keyboard/storage/PNG review PASS,28GET/0API/0serveregress, processes
  stopped. This closes Login readiness only; full S0 authenticated UI HOLD.

- 2026-11-04 UI-only: explicit1newstaff/max3session grant; fresh preflight and
  staff preparation PASS. Helper aborted before browserAuth dispatch at its
  blank guard (body0 despite ready controls/title), with actual PNG retained.
  No browser login/Create/Save; coordinator acceptance NOT RUN, real UI gate
  HOLD. Cleanup PASS1inactive/2sessionsCLOSED/0residue,32tablecustody/5Authaudits,
  no business rows. Server stopped143, grant consumed/run FINALIZED; no retry.

- 2026-11-03 successor-r1: Owner explicitly approved newAuth11/max13sessions/
  22BOQs28routes34items/remainingAPI+browser/settled-HOLDcleanup. Before first
  DB/Auth, strengthened custody-before-cleanup and parent-known browser outcome;
  801tests/lint/TypeScript PASS with unchanged app/build bytes. Fresh local
  preflight and remainingAPI PASS; positive Factor defaultbinding PASS.
  BrowserLogin succeeded, immediate page-title assertion HOLD beforeCreate/
  Save; actualtitle unretained,one unmappedconsole404. No test retry/newlogin.
  Exactcleanup PASS:13sessionsCLOSED/0sessions0tokens,9inactive1pending1suspended,
  32custody comparisons PASS,37allowedAuthaudits,17BOQs16routes16items retained,
  0unresolved. Runner/browser exit1 preservesHOLD;ownedserver stopped143. Grant
  consumed/runFINALIZED. Full details and finalhashes in section8.5/receipt;
  next proposal is UI-only, not another11actor/corematrix run.

- 2026-11-03 approved run closeout: fresh preflight and prepare/reproduce PASS
  on existing Docker; local032 applied exactly once at2026-11-02T18:34:01Z
  (2026-11-03 01:34Bangkok). Independent postflight PASS:9 additions/0 other
  relevant metadata delta/35 table digests unchanged across DDL. Verify stopped
  at `status:pending:boq:I` after399PASSrecords, not full acceptance. Read-only
  diagnosis found no attempted row and bounded trigger-log evidence consistent
  with the existing invoker Factor-reference check firing before BOQ RLS;
  exact failed HTTP code/body was not retained. Do not convert this into a
  confirmed permission regression or a PASS. No source/SQL change or test retry.
  Automatic approval review initially rejected finalize while verify was HOLD;
  no dispatch/bypass. Owner then explicitly approved recovery for this run only.
  Finalize PASS:9inactive/1pending/1suspended,0sessions/0refresh tokens,
  32original-custody projections PASS,35 allowed Auth audit additions retained.
  Retained29syntheticBOQs/20routes/20items;269CONFIRMED/193DENIED intents,
  0unresolved. Run FINALIZED,runner/server stopped,36protectedfiles unchanged.
  Recovery is complete, not a new test grant. Keep032 unchanged/no-replay;
  next proposed step is a reviewed harness-only correction and separately
  approved focused successor validation, never a predecessor/032 replay.

- 2026-11-03 later explicit approval: Owner said “อนุมัติ S0 local ตามขอบเขตนี้
  รวม Auth/fixtures และ apply 032 หนึ่งครั้ง ยอมรับ NOT RUN สามกรณีตามแผน
  ห้าม reset/replay 027–031 ไม่แตะ Production และไม่ stage/commit/push/deploy”.
  This is prospective authority for the exact section7 lifecycle, including
  oneexistingAdminAPI-onlysession/11newactors/boundedgraphs and3namedlimits.
  Freshpreflight/NEWrun next; no priorattempt reopened or earlierrejectionerased.

- 2026-11-03 authority correction: after genuinebuild/freshpreflight, final
  harness fixes passed786tests61files/lint0errors3oldwarnings/TypeScript. The
  first `prepare` was rejected by automatic approval review because trusted
  Owner instructions did not explicitly authorize this exact Auth/fixture
  operation. Command NOT dispatched. Earlier entries interpreting “ทำต่อครับ”
  as execution authority retain their chronology but are corrected, not a
  standing grant. Both preAuth attempts were closed with0intents/0sessions/
  0createdactors/0business/DDLdispatch. The first nonTTYstartup exited before
  commandloop; a tested earlyTTYguard now prevents it. The second was stopped
  after approval rejection; original manifests/locks retained privately.
  Ownedserver stopped; no alternate Auth/migration executor was attempted.
  Current next gate is explicit bounded Owner approval, not another broad
  continuation or another build rerun. New run/freshpreflight required later.
  Corrected-document verification22/22contracts/453links89anchors19Markdown
  PASS;36protectedhashes unchanged,indexempty. No further DB/Auth operation.

- 2026-11-03: later Owner “ทำต่อครับ” follows the exact final readiness packet
  and starts bounded local execution only. Main/localorigin remain67c1e6f,
  indexempty;36protectedsource/custody hashes unchanged. Read-only graph,
  metadata baseline+031, role/effectiveprivileges and3existinghierarchies PASS;
  existingAdmin exactactive/Authpresent, safe session settings, actualbinary
  PostgREST14.5, credentialsources match both closed runs. Two private client
  checks initially HOLD because raw Authsecret/JWKS strings and opaque server
  APIkey/JWT were incorrectly equated; redacted comparison proved matching
  oct/ECkeys and existing gateway keys. Corrected only private preflight checks,
  preserving failed proofs; no key/config/system repair. Defaults read-only
  active.0Authrequests/0fixturewrites/0DDL/0Production/publication. New032/runner
  candidates are source preparation, not runtime PASS. Private proof:
  `/private/tmp/s0-local-20261103-9qhb0t75/`; never publish private evidence.
- 2026-11-03 source checkpoint: four candidates and20newfocusedtests completed.
  Independent review corrected runner safety defects before any Auth dispatch;
  final exact S0-only projection782tests61files PASS, lint0errors/3oldwarnings,
  standaloneTypeScript PASS. Defaultbuild failures retained: externaldependency
  symlink resolution, restrictedGoogleFonts fetch, then CSSworker IPCportEPERM
  under network/nativeNode24 execution. ComputerUse refused Terminal for safety;
  no UI bypass. Source/package/config remained unchanged; no Webpack substitute.
  [Intermediate receipt](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md)
  records exacthashes/results and concrete Owner-run build helper. No Authsession,
  actor/BOQfixture or032DDL dispatched. Core runtime remains NOT RUN; hold before
  those operations. Full fresh preflight is required after any build/manual delay.
- 2026-11-03 Owner build follow-up: Owner reported running the private helper
  in an independently opened macOS Terminal. It returned FAIL at
  `2026-11-02T17:47:39.865Z`,0.712s afterstart. Existing Turbopack cache files
  already contained the same port/EPERM messages before this run; the cacheLOG
  shows continued reuse. This supports cached-failure suspicion, not proof of
  its cause or a fresh native permission denial. Earlier manualbuildNOTRUN is
  now superseded only for that completed FAIL. A new private helper will probe
  parent/childloopback binding and preserve the old private `.next` by rename
  before defaultbuild from emptyoutput. It has NOT RUN; no cache moved/deleted,
  no source/package/config/DB/Auth/fixture/Production/publication operation.
  Follow-up22/22documentcontracts/447links85anchors19Markdown PASS;36protected
  hashes unchanged and indexempty. Helper syntax/independentreview PASS only,
  not port/build/runtime evidence.
- 2026-11-03 fresh-build closeout: Owner's replacement helper passed parent/
  childloopback probes and defaultNext16.4.2 Turbopack on Node24.2.0, started
  `2026-11-02T17:56:46.481Z`,finished17:56:53.939Z,exit0. Old `.next` retained
  by rename; all549projectedsource hashes and36protectedhashes unchanged.
  This closes the specific build gate without an application/package/config
  change; earlierFAIL evidence remains. Fresh full read-only preflight at
  17:59Z passed graph/roles/grants/settings/references and exactbaseline+031.
  New private proof `/private/tmp/s0-preflight-20261103-ljvg92m5/`; no Auth/
  fixture/DDL. Built S0-only server isloopback55637 and unauthLoginGET200.
  Before Ownerlogin, source review found two harness contract issues: header
  PATCH does not auto-advance source token; GoTruev2.190.0 Admincreate audits
  service-role actor plus exactnewtarget traits. Corrections/tests and private
  built-app driver review are in progress; neither is an application/RPC fix.

- 2026-10-24: initial source/captured-metadata review; proposed uniform guards;
  no fresh behavior reproduction or execution authority.
- 2026-11-02: Owner requested continuation after S0-first/UM sequencing was
  explained. Three independent read-only reviews checked policies, fixture
  feasibility and source/handoff separation. No DB/Docker/Auth/network to
  project services, SQL creation or migration numbering occurred. Public
  official documentation was consulted; it is not hosted-project evidence.
- 2026-11-02 planning verification: Node24 documentation/authority contracts
  **22/22 PASS** in a `HEAD +18Markdown` projection without the nine A1 runtime/
  test/mock paths; **411relative links/58anchors PASS**. Independent review
  corrected an over-broad nullable-Save test limit: same-sector nonowner with
  `assigned_to NULL` remains mandatory fresh acceptance.36protected source/
  custody hashes remain unchanged; no SQL source/number, DB/Auth/Docker or
  project-service request. These are document/source results, not S0 runtime.
  Private planning proof: `/private/tmp/s0-local-plan-nyner0jy/`; never publish it.

**Next safe step:** refresh full preflight and use a NEW run under the explicit
approval. Do not reopen the two closed preAuth attempts. Prepare→reproduce→
reviewed032once→verify→builtapp→finalize; stop ondrift/UNKNOWN/corefailure.
No new role/Viewer/SSO/domain or Production/publication authority is inferred.

## 7. Local approval packet — 2026-11-02

**Dated approval packet:** Owner later approved this local envelope and its
three limits. The resulting run is now finalized with acceptance HOLD; see
section6 and the local receipt. The proposal wording below records that earlier
stage and is not a fresh execution grant or request to apply 032 again.

This is a proposed refinement of the earlier broad acceptance in section4.
Its fresh edge-case limits require explicit Owner acceptance; they are not an
automatic waiver of that earlier matrix or any new core failure.

### 7.1 Goal, user impact and exact policy invariant

แก้เฉพาะช่องเขียน BOQ โดยตรงของ procurement คง SELECT, ข้อมูล BOQ เดิม,
เจ้าของ/ผู้รับมอบหมาย และขอบเขตของ Admin/manager/staff ตามเดิม ไม่ย้าย
บัญชี ไม่แก้สังกัด ไม่เปลี่ยนรหัส และไม่ออกแบบ role ใหม่ Admin commands
และ UM-A1 ที่ทดสอบเสร็จแล้วคง source เดิม ทั้งนี้ procurement ที่เป็น owner
หรือ assignee จะถูกปิดช่องเขียนที่เดิมเปิดเกินสิทธิ์โดยตั้งใจ

The captured predecessor has **15 existing policies** on the three tables:
four permissive command policies plus one P49 restrictive ALL policy per table.
The sole intended policy delta is **nine additions** below; preserve those15,
table/column grants, RLS/force flags, constraints, triggers, helpers/functions,
owners/ACL/config and Save/Copy/031 contracts. A different running predecessor
means HOLD, not rewriting it to match the capture.

| Table | Proposed policy names | Command checks |
|---|---|---|
| `public.boq` | `s0_boq_writer_insert`, `s0_boq_writer_update`, `s0_boq_writer_delete` | INSERT new-row check; UPDATE old-row use + new-row check; DELETE old-row use |
| `public.boq_routes` | `s0_boq_routes_writer_insert`, `s0_boq_routes_writer_update`, `s0_boq_routes_writer_delete` | Same command-specific checks |
| `public.boq_items` | `s0_boq_items_writer_insert`, `s0_boq_items_writer_update`, `s0_boq_items_writer_delete` | Same command-specific checks |

Every addition must be **RESTRICTIVE, TO authenticated**, with the same current
active writer allowlist: `admin`, `dept_manager`, `sector_manager`, `staff`.
Reuse verified `private.p49_current_active_role()` as a statement-scoped lookup;
do not add a helper or authorize from user metadata/cached JWT role. NULL,
missing and unsupported results must deny. No new SELECT/ALL policy and no
change to existing permissive ownership/scope branches. In particular, manager
membership alone must not add direct child writes or assignee child DELETE.

**Impact review against actual call paths — source evidence, not runtime PASS:**

| Existing flow / user | Expected effect after S0 | Evidence / required proof |
|---|---|---|
| This planning task | Markdown only; no account/data/runtime effect | Protected source/hash/document checks; no DB/Auth execution |
| Admin/department manager/sector manager/staff | Existing allowed writes retain their existing scope; role membership adds no new scope | New predicate is true for these current active roles; repeat positive and negative direct-write/Create/Save/Copy tests |
| Procurement owner/assignee | Direct BOQ/header/route/item writes become denied; owned data and permitted reads remain | Intended security correction; all9operation groups and before/after graph proof mandatory |
| Create BOQ | Uses direct header INSERT, therefore touches the new INSERT guard | [Create path](../../../app/boq/create/page.tsx#L132); valid writer Create must pass; procurement INSERT was already denied |
| Delete from BOQ list | Uses direct header DELETE; procurement loophole closes, existing writer draft/ownership restrictions and FK cascades remain | [Delete path](../../../app/boq/page.tsx#L260); count0 can mean denied/no-op, not deletion; test entire child graph |
| Editor Save | Existing definer RPC/authorization/030 unchanged; it is not secured merely by table RLS | [Save call](../../../app/boq/[id]/edit/page.tsx#L261); verify writer success, procurement/cross-scope and feasible NULL-authorization denial |
| Copy | Existing definer RPC's role/scope/token/UUID/031 logic unchanged | [Copy client](../../../lib/boq/duplicate.ts); fresh preserve/replay/mismatch/stale tests on new graphs; privileged definer behavior is separate from RLS |
| List/dashboard/editor/saved Print/PDF/Excel reads | SELECT predicates, source/layout/calculations/fonts stay unchanged | No new SELECT/ALL policy; verify actual permitted reads and child graph on new local data, do not infer from no source diff alone |
| Admin directory and account commands | No application/RPC/profile-policy change; UM-A1 source remains frozen | Verify metadata equality and run-owned role/status transitions; no auto-repair/reclassification of original accounts |
| Active accounts with missing actual affiliation | No new affiliation condition, no forced onboarding or account disable; permitted writer scope should remain | Source-composition argument only for historical actors; fresh actor access remains section7.5 NOT RUN unless separately authorized |
| UI hints for procurement, especially missing affiliation | Existing permission hints may still offer Create/Edit/Delete that the server denies | [Current early hint branch](../../../lib/permissions.ts#L105); known visible residual, no UI patch or guarantee of an invisible behavior change |
| Pending/inactive/suspended or newly changed role | Subsequent statements use current profile, not a cached role claim | Existing helper/state checks plus same-token regression; no cancellation guarantee for already-running statements or universal session revocation |

The intended behavioral change therefore reaches procurement direct-write use;
calling this wholly invisible back-office work would be inaccurate. Existing
accounts/BOQs are retained, while legitimate-writer/read compatibility remains
a mandatory runtime gate, not an unconditional promise before Docker testing.
The preserved-read claim is for ordinary authorized SELECT paths used by the
app. PostgreSQL also applies UPDATE policies to SELECT FOR UPDATE/SHARE, so a
procurement row-locking SQL path is not promised unchanged. Save/Copy's existing
postgres-owned definer locks are reviewed under their separate guards, not
assumed to acquire client-role RLS behavior.

The design follows the combination and command rules in
[PostgreSQL17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
and the grants/RLS/definer distinction in
[Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
and [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
These explain the proposed mechanism; only actual local acceptance can prove
this application's behavior. No generic guide authorizes changing existing
grants, adding indexes or modifying intentional definer RPCs in this patch.

### 7.2 Proposed local file scope, source and target

After approval, at most **four new executable/test source paths**:

| Path | Purpose |
|---|---|
| `migrations/<fresh-sequence>_s0_boq_writer_boundary.sql` | One reviewed forward artifact; no number reserved/file created now. Determine the available repository-convention identity after approval/preflight. |
| `scripts/test-s0-boq-writer-boundary-local.mjs` | New standalone local-only runner: default dry-run, explicit preflight/prepare/reproduce/verify/finalize phases; never applies DDL itself. |
| `tests/boq-writer-role-boundary-migration.test.ts` | Source-level safeguards for narrow policy/transaction/precondition scope; not a substitute for API tests. |
| `tests/s0-local-runner-safety.test.ts` | Meaningful target/owned-ID/UNKNOWN/finalized-run safety cases with mocked I/O. |

After actual execution, add only
`docs/06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md` as the factual local
receipt, plus this plan/checkpoint and the necessary handoff/UM pointers.
Do not create a PASS receipt before running. Private manifests/evidence belong
under ignored `supabase/local/s0/<fresh-run>/` or a private temporary directory;
verify ignore coverage before writing, otherwise use private temporary storage.
No new ignore/config/package rule is implicitly approved.

Local target is the **existing** `conduit-boq-local` Docker graph, recorded API
`http://127.0.0.1:55321`, DB container/volume `supabase_db_conduit-boq-local`.
Last accepted DB ID is
`4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`,
actual REST14.5/cap1000; all are dated expectations to verify before execution,
not observations made in this planning task. Preserve the existing local
password file/value; never put its value or server key in logs/browser source.

No `app/`, `lib/`, shared Auth/UI, package/lockfile, CI, Docker/config, reference
or historical-migration change is included. No imports/execution of UM/parity
fixture runners, no old bootstrap/reset/restore/reseed/db-pull workflow, no
trigger/constraint disable, no extra DB/stack and no archive/backup access.
Both finalized UM runs remain byte-identical and closed.

**Separate source projections:** the canonical dirty checkout contains the nine
UM-A1 code/test/mock paths. They must remain unchanged and are **not S0 release
source**. Record and verify both (a) `HEAD + exact S0-only source`, and (b) the
canonical local A1+S0 overlay if used for integration. Build/start the S0-only
projection for release-representative BOQ/Auth tests; any combined-source test
is supplementary and labelled. Use installed dependencies, no installation,
new Git worktree/index/staging or wholesale source copy containing local secrets.
The new runner's default dry-run/help must not read credential files, call
Docker/API/Auth or mutate data. Explicit phases are required for side effects.

This is a **local execution file scope**, not a future commit allowlist. Shared
documents already contain unpublished UM material/links; later S0 publication
needs an exact dependency-closed source/document projection that excludes A1
runtime. Do not pull A1 code or parity artifacts into S0 just to fix doc links.

### 7.3 Preflight, one application and uncertain DDL

Following explicit local approval, perform these sequential gates:

1. Freeze Git/dirty/source and protected hashes, including all nine A1 paths,
   parity9, package/lockfile, migrations027–031 and both finalized manifests.
   Confirm expected branch/HEAD/index and no other work touches the target.
   Inspect new runner/source before any fixture or DDL dispatch.
2. Verify local Unix Docker socket, exact full container/volume/service graph,
   loopback API/credentials-to-project binding and actual versions/config.
   Reject remote Docker contexts, redirects/nonlocal API, wrong project/DB,
   unknown migrations/successors or relevant drift; never repair automatically.
3. Capture relevant local predecessor metadata read-only: three tables' full
   policies/grants/RLS, helper definition/owner/ACL/config, dependent constraints
   and cascade FKs, triggers, relevant Auth/Admin/Create/Save/Copy/031 contracts.
   Compare canonical definitions/named roles; cross-environment OIDs are not
   portable identities. All nine planned names must be absent. Freeze original
   data/reference/password/account/session/audit digests without logging rows.
4. Check usable existing reference hierarchies for same/cross department/sector
   tests without editing them. Check existing Admin identity is exactly active
   Admin and actual Auth single-session/timebox/inactivity settings before
   proposing its new session. Insufficient references or unsafe session settings
   means HOLD before creating fixtures/login, not adding reference rows/config.
5. Prepare only the newly approved run; reproduce the vulnerable creator and
   assignee cases and record writer/read baselines. An expected failure to
   reproduce means investigate/HOLD before DDL. Already-denied cases such as
   procurement header INSERT stay classified separately, not called new gaps.
6. Review one forward SQL artifact with exact predecessor assertions, bounded
   local lock/statement timeouts, all nine additions and inside-transaction
   successor assertions. Run it **once**, using `psql` already inside the
   verified existing DB container through the local Docker socket, fixed
   `postgres` DB/role, no startup script and stop-on-error; feed only the exact
   reviewed file bytes through stdin. No host install or external connection.
   Use one explicit transaction in the file, not nested transaction wrappers;
   do not generate/apply the whole migration directory. Keep exact
   file hash, invocation, start/end/output and actual outcome in private proof.
7. Require exactly nine policy additions and no other contract delta. Record
   the new **baseline+031+S0** digest as an overlay; never overwrite the frozen
   capture or earlier UM/031 receipts. Plain local `psql` does not establish a
   Supabase migration-ledger entry; record the real ledger state, never invent
   one or edit the ledger to make it appear applied.
8. Run section7.6 acceptance, finalize only run-owned fixtures/sessions and
   compare originals. Report actual PASS/FAIL/NOT RUN before proposing release.

Use a short reviewed lock timeout (initial proposal2s) and statement timeout
(initial proposal15s); capture real elapsed time. Do not retry DDL automatically
if either limit is exceeded. Review active local work/no concurrent DDL before
dispatch; an advisory lock alone cannot exclude unrelated DDL.

Precondition/postcondition errors can roll back this transaction. A lost
connection or uncertain COMMIT is **UNKNOWN**, not rollback/PASS: inspect the
exact policy/contract successor read-only and the executor outcome before any
further operation. All nine present and exact may establish applied metadata;
none present may establish predecessor only after the transaction is known
settled; partial/unexpected state means HOLD. No retry, drop guards or restore.
UNKNOWN fixture/RPC commands likewise keep their original UUID/intent.

Phase guards must be explicit: prepare/reproduce require the exact predecessor;
post-application verify requires the recorded exact successor. Resume must not
call reproduce or DDL again. Finalization may run against the known settled
predecessor after a confirmed aborted application, or the exact successor after
a confirmed application; it must not guess through UNKNOWN/partial metadata.

### 7.4 New-run data and session plan

Proposed cap: **11 new Auth identities**, each with a reserved UUID and unique
synthetic email/run marker, using the unchanged local test password. No real
email delivery, signup setting or domain-policy change. Maximum run-created
graph, including Copy destinations and deleted-case IDs: **48BOQs,96routes,
192items**. Use small independently owned graphs for destructive cases; HOLD
and explain before exceeding the cap. No1,000-row fixture programme is needed
for this role-boundary patch.

| New actor | Required role/state |
|---|---|
| Runtime Admin | active Admin; tests use this actor rather than Owner |
| Department manager | active, existing hierarchyA |
| Sector manager | active, existing hierarchyA/sector1 |
| Staff owner | active, owns synthetic graphs |
| Staff assignee | active, assigned synthetic graphs |
| Procurement owner | initially creates owned graphs while staff, then procurement |
| Procurement assignee | assigned only run-owned graphs, then procurement |
| Mutable actor | active staff → procurement, retaining the exact old access token |
| Pending staff | valid pending profile |
| Inactive staff | prepares its relevant graphs while active, then inactive |
| Suspended staff | prepares its relevant graphs while active, then suspended |

Same-scope/non-owner/cross-scope cases come from run-owned BOQ geometry and
existing read-only reference IDs, not additional accounts. Anonymous requests
have no JWT. Role/status/NULL fixtures forbidden by constraints must not be
constructed by changing constraints or direct trusted-field seeding.

**Proposed original-Admin exception, not yet approved:** one existing local
Admin in **one new dedicated API-only session**, normal Auth bookkeeping only.
Use it for existing approve/role/status RPCs targeting only the eleven new IDs,
and for final deactivation of the new runtime Admin. No Owner BOQ/business RPC,
browser use, global logout, original profile/role/status/password change or
manual privileged bootstrap. All other fixture transitions use supported
onboarding/Admin RPCs; never set internal profile-action GUCs to bypass them.

Use ephemeral clients (`autoRefreshToken:false`, `persistSession:false`,
`detectSessionInUrl:false`), keep credentials/tokens in memory and reserve each
command UUID before dispatch. Runtime browser tests, if used, authenticate only
new actors against the verified loopback app/API, block nonlocal origins and
use the unchanged app source. Stop if the existing Admin session expires or
its outcome is uncertain; no silent second Owner login or unrelated logout.

Before writing reserve account/BOQ/route/item/request IDs in a private manifest;
verify they were absent from the original set. A run marker alone never grants
fixture ownership. Journal `RESERVED → SUBMITTED → CONFIRMED/DENIED/UNKNOWN`,
payload hash, actor/target and exact returned IDs; handle server-generated Copy
destinations through the exact recorded request tuple. UNKNOWN blocks a new
replacement UUID or an automatic repeat. Migration apply is a separate phase
that cannot be repeated by test resume. Finalized manifests reject prepare,
transition/runtime and any reopening of old UM runs.

Finalization waits for submitted work to settle. Deactivate the eight formerly
active new actors through the approved Admin RPCs, including the runtime Admin;
the already inactive/pending/suspended fixtures remain non-active. Expected
retention: **9inactive/1pending/1suspended**,0active,0owned sessions/refresh tokens,
0unresolved intents. Retain Auth/profiles, audit and labelled test graphs/Copy
ledger evidence; no hard deletion of users, profiles, audits or request ledgers.
Only the explicitly tested run-owned BOQ/route/item DELETE/cascade cases delete
business rows. Report exact retained graph counts/IDs privately, not a vague
claim that all test data vanished.

Use `signOut({scope:'local'})` only for sessions created by this run. Verify
original session/refresh-token rows and audit history independently before,
during and after; never erase them. Allow only the proposed existing Admin's
normal Auth sign-in timestamps and new session login/logout records. Compare
original public/private/profile/reference rows and authorization/Copy journals
with exact owned actor/request/target exclusions, not table-wide exemptions.
If cleanup/retention cannot be proved, record HOLD and residue, not PASS or
manual SQL session deletion. Preserve existing credentials and both UM manifests.

### 7.5 Fresh-test feasibility limits requiring Owner acceptance

The current immutable guards make three historical fixture shapes unavailable
through a fresh normal lifecycle under this scope:

| Case | Source reason | Proposed evidence and limit |
|---|---|---|
| Auth user with missing profile | [027 profile guard](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L1543) forbids profile DELETE; signup creates a pending profile | Source/helper NULL behavior and optional clearly labelled read-only SQL-claims simulation; fresh real-Auth/direct-API case **NOT RUN**. No forged token or profile removal. |
| Active actual affiliation NULL | [Approval validation](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L1722) requires actual=requested nonNULL; later exact deltas forbid clearing affiliation | Show the new role predicate adds no affiliation test and existing scope is unchanged; old bounded read evidence retained. Fresh access by that historical actor **NOT RUN**; this does not waive the feasible NULL-authorization Save case below. |
| Positive selected-Factor Copy of unbound legacy source | Current immutable version-binding triggers prevent turning a newly bound BOQ into historical unbound data | Preserve exact function/trigger/ACL hashes and old Copy evidence; test fresh bound-source selected-Factor **ineligible denial**. Positive eligible-legacy case **NOT RUN** for this run. |

The parity loader built these states before final guards attached. It cannot be
reused now without violating the no-reset/no-replay/current-guard boundary.
Do not disable triggers/constraints, modify references, use finalized UM actors
or rewrite historical evidence to manufacture fresh PASS. NULL/unsupported
role values are also schema-forbidden; distinguish predicate/source coverage
from a genuine runtime actor, rather than weakening NOT NULL/CHECK constraints.

**NULL Save is still mandatory and feasible:** new StaffA normally creates an
unassigned BOQ (`assigned_to` NULL) and new StaffB in the same sector may SELECT
it but is neither creator nor assignee. The staff Save authorization becomes
false OR NULL; existing030 must reject it via its fail-closed guard. This uses
only normal new actors/data, not an activeNULL-affiliation profile. Record
denial plus unchanged persisted graph before/after S0; no blanket nullable-Save
waiver. See [same-sector SELECT](../../../migrations/009_master_catalog_p0_containment.sql#L282),
[Save expression](../../../migrations/027_p49_active_profile_authorization_hardening.sql#L2940)
and [immutable030](../../../migrations/030_boq_save_null_authorization_guard.sql).

**Recommendation:** accept these three explicitly bounded fresh-test limits for
the focused nine-policy candidate, with core acceptance mandatory and unchanged
dependent contracts verified. This is not a waiver of any fresh core failure.
If the Owner requires actual edge-actor/eligible-legacy execution, propose a
separate concrete use of suitable existing local fixtures and session/data
custody before accessing them; no such access is included automatically.

### 7.6 Required acceptance and report

| Group | Required fresh evidence after approval |
|---|---|
| Reproduce predecessor | Procurement creator/assignee unexpected writes on independent new graphs; exact already-allowed/denied operation matrix, affected rows and persisted changes; mutable actor before guard; no old BOQ used |
| Deny procurement after guard | All3tables × INSERT/UPDATE/DELETE for creator/assignee and applicable same/cross-scope/non-owner variants; preserve persisted graph after every denial, including forbidden parent DELETE/cascades |
| Preserve writers | Admin/dept_manager/sector_manager/staff retain each baseline allow/deny; no new manager child writes or assignee child DELETE; permitted header/route DELETE cascades only through owned synthetic graphs |
| Current role/status | Exact same access token staff→procurement via run-owned Admin RPC; next settled request denied without refresh. Anonymous/pending/inactive/suspended deny; record status-only feasible fixtures distinctly from multiple-cause denial |
| Read behavior | Procurement and writer authorized SELECT/list/count/routes/saved output reads unchanged; cross-scope denials retained; full visible child graph/no truncation hidden as empty |
| Application and guarded Save | Real built S0-only source: valid Create→Save→reload on new data, permissions and persisted calculations, procurement/cross-scope and feasible `assigned_to NULL` nonowner Save denial. Only the historical activeNULL-profile access remains section7.5's limit |
| Copy/post031 | Fresh bound-source preserve success; exact UUID replay/no extra destination, payload mismatch denial, stale `PT409` + `BOQ_SOURCE_STALE` with no destination/partial graph/ledger residue, selected-Factor ineligible denial. Positive eligible-legacy remains explicit NOT RUN |
| Metadata/custody | Exactly9newpolicies, old15/grants/RLS/helper/Save/Copy/031/triggers unchanged; original data/accounts/passwords/sessions retained; finite finalized manifest and independent postflight |
| Source quality | New safety tests, full tests/lint/TypeScript/default Turbopack build on Node24 with explicit test API; S0-only projection separately identified from dirty A1+S0 checks; no package/CI change or install |

Every write assertion records returned/affected rows **and persisted state**;
HTTP200/204 alone is insufficient. Batch failures must not leave partial graphs.
Measure request count, actual elapsed/error timeout and a short warm before/
after timing comparison for equivalent synthetic requests; report local-only
numbers and investigate material unexplained regression. Do not add indexes or
relax guards to hit a guessed SLA. No automatic Copy retry with a new UUID.

Report source HEAD+candidate hashes, SQL hash/application outcome, exact local
graph/versions/metadata delta, run/actor scope, all PASS/FAIL/NOT RUN/UNKNOWN,
three accepted limits and final retention/session cleanup. Current baseline
unit/build/UM receipts are prior evidence, not S0 API PASS. A source/doc check
failure or failed core case must be resolved within approval or held explicitly;
never call release-ready based only on compilation. B Production HTTP stays
**NOT RUN/closed** and is not reopened by this local regression suite.

### 7.7 Recovery, later release and approval boundary

Before COMMIT, a confirmed aborted transaction leaves the predecessor policies.
After a successful application, **retain the security guards**. No automatic
down migration, policy deletion, DB restore/reset, migration replay or data undo
is approved. A regression needs diagnosis and a separately reviewed forward
correction; do not reopen the known procurement gap to make an old UI pass.
On UNKNOWN outcome or failed custody/finalization, stop and retain exact proof.

Later S0 publication/Production DDL requires its own reviewed Solo plan and
explicit authority. SQL source commit/Vercel auto-deploy do not apply SQL to
Production. A client rollback cannot roll back this database security boundary.
If S0 releases first, refresh A1's exact base/allowlist/count/contracts/healthy
rollback deployment; preserve accepted A1 runtime hashes and dated receipts.
The former27-file A1 envelope includes shared documents that may already ship
with S0, so it is not a permanent changed-file count. A1 rollback must keep S0.

For the next step, Owner approval should explicitly cover **only local**:

- Four proposed source/test paths, one new forward SQL application after exact
  preflight,11new identities and at most48BOQs/96routes/192items, new-only
  prepare/reproduce/verify/finalize with private journal/custody.
- One existing localAdmin API-only dedicated session, normal Auth bookkeeping
  and exact local-session cleanup; existing password/data/roles/sessions kept.
- Section7.5's three fresh edge-case limits, with mandatory core acceptance.

No Production access, publication/staging, old-run reopening, package/config,
Catalog/Factor change, reset/restore or migration027–031 replay is included.
At this packet's planning stage those execution operations were unapproved.
The later bounded approval, once-only local execution and recovery closeout
are recorded in section6; no standing execution authority remains.

## 8. Successor-only remaining validation packet — 2026-11-03

Owner reviewed the concrete harness/new-run proposal and said “ทำต่อให้ผมด้วยนะครับ”.
Begin the runner/safety-test patch, private offline tooling and source/build/
document checks. Given the earlier generic-continuation Auth rejection and
consumed run/recovery grants, obtain explicit bounded fresh Auth/fixture
authority before any new Docker/DB/Auth/runtime operation. Do not manufacture
a new grant in this document. No such operation has run for this packet.

### 8.1 Exact source and invariants

Runtime/test source changes are limited to:

- `scripts/test-s0-boq-writer-boundary-local.mjs`;
- `tests/s0-local-runner-safety.test.ts`.

Maintain this checkpoint, the local receipt and the three AGENTS/AI_HANDOFF/
AI_CONTEXT pointers; no UM code or other feature starts. A new private browser
helper copy may bind the new source/build/manifest and collect all Save dialogs
without modifying the old helper/evidence. Source projection is HEAD67c1e6f
plus the four S0 artifacts, with only these two harness/test paths changing.
Keep032 and its migration test byte-identical, A1code9/parity9/packages/config/
original credentials/closed UM and S0 manifests protected. No DB reset/restore,
reference/Catalog/Factor mutation, migration edit/application/replay027–032,
Production, staging/commit/push/deploy or protected-archive operation.

Successor mode requires the exact recorded +032 metadata before Auth and each
phase, compared against the frozen baseline+031 without overwriting it. Reject
predecessor/partial/foreign drift, finalized manifests, reproduce/DDL and test
retry after a latched core HOLD. Enter verify from a genuinely completed new
prepare; never fabricate REPRODUCED. Preserve the completed-preparation marker
so HELD cannot weaken the exact final11profile status check. Keep acceptance
and cleanup independent; FINALIZED/exit0 is not acceptance PASS.

Persist bounded case/HTTP/code/elapsed/affected-row/state-hash evidence before
assertion or server-failure handling. No arbitrary messages/raw bodies/tokens/
PII. INSERT denial cannot use a2xxempty result; zero-row UPDATE/DELETE requires
unchanged persisted state and a valid JWT. Authenticated RLS denial expects
403/42501; anonymous401/403+42501 is labelled privilege denial. Unknown codes,
constraint/trigger errors,5xx,expiredJWT and changed graphs remain HOLD.

For status header INSERT, use valid Catalog binding, NULL Factor binding,
`factor_f=NULL` and zero total. First require an active-staff positive control
that creates the empty draft and binds the real default normally. Pending/
inactive/suspended negative cases must reach the expected denial without an
earlier Factor exception. This is source-feasible, runtime NOT RUN. Do not
retrospectively reclassify the old pending failure or change a DB trigger.

### 8.2 Proposed new-run and data envelope

Proposed run: `s0-20261103-successor-r1` (not created). Reuse the11actor shapes
in section7.4, not any old identity. Maximum13new dedicated sessions comprises
11actorAPI sessions, one existingAdmin API-only session and one separate new
staffOwner browser session. The Owner never enters a browser; existing password,
roles/profiles/business data and original sessions stay intact apart from
explicitly allowed normal Admin Auth bookkeeping. No silent replacement login.

Prepare15graphs only:11primary+3sharedscope+1Copy source. Create them while
the new owners are normally approved active staff, then use existing approved
Admin RPCs to change only these new roles/statuses. Remove all old before/
after DELETE/cascade generations from remaining-only preparation. The frozen
144successor PASS records cover that completed matrix; they remain old evidence,
not newly counted results. Pin their successor metadata/source and preserve
the entire finalized run as original data for the new custody baseline.

| Cumulative reservation | Source-derived plan |
|---|---|
| BOQs | 15initial+4statusINSERT+1staffcontrol+1Copy+1browser =22 |
| Routes | 15initial+4statusINSERT+4Savegenerations+1Copy+4browser =28 |
| Items | 15initial+4statusINSERT+2bulk+4Savegenerations+1Copy+8browser =34 |

The earlier proposal's35item sum was an arithmetic error, corrected before
Auth; do not invent an unused reservation/write to match it. These are planned
cumulative reservations, including denied/deleted/replaced generations, not
retained rows. A pure static plan must match22/28/34 before Auth and remain
within existing hard ceilings48/96/192. If the concrete plan differs, HOLD
before writing and review it rather than silently expand. Enforce13sessions.

### 8.3 Required checks and recovery envelope

Before runtime, run focused/full source tests, lint, standalone TypeScript and
fresh-output defaultTurbopack on Node24 with test-only API values and no DB/Auth
calls. Keep earlier build/cache/error evidence untouched. New private tooling
must pass source/syntax/help checks without importing old fixture/parity tools.

Only after explicit runtime approval, refresh exact local graph/container/
volume/versions/cap/gateway credentials, metadata/grants/RLS/helper/RPC/triggers,
references, Admin feasibility/session settings and original data/Auth custody.
All reads are bounded/local; no fresh Production comparison. Stop on drift
before new writes, with no parity repair or migration application.

Remaining-only acceptance is:

1. Staff empty-draft positive control; all4status ×3tables ×I/U/D negative
   cases, distinguishing anonymous privilege denial from authenticated RLS.
2. Assignment/parent postimage changes denied; mixed allowed/forbidden bulk
   INSERT fully atomic with no partial graph.
3. All7active actor shapes' permitted/cross-scope SELECT and complete child
   graphs; one bounded list/count and route batch from only new IDs.
4. Four writer Save/reload successes plus procurement, cross-scope and feasible
   NULL-assignment nonowner denial with unchanged graph.
5. Copy preserve, exact UUID replay/no extra destination, payload mismatch,
   exact031 PT409/BOQ_SOURCE_STALE/no ledger-or-graph residue and bound-source
   selected-Factor ineligible denial. No new UUID retry on UNKNOWN.
6. Under032, the new mutable actor's staff PATCH succeeds; runtimeAdmin changes
   it to procurement; same token/hash/valid expiry/current profile proven; next
   PATCH denied without a refresh or persisted change.
7. Request count/time/timeout and13warm write samples (3warmups/10measured),
   median/p95. Comparison with retained predecessor is across separate runs,
   not a controlled causal overhead/SLA measurement. No guessed index/timeout fix.
8. Real S0-only built app with only the new staff browser: one Create, one Save
   of an ordinary priced item withquantity3, reload/persisted calculation and
   saved Print preview, desktop/mobile/keyboard/console evidence. Actual PNGs
   must be reviewed. Physical print/PDF/Excel export is not implied by preview.

The three section7.5 historical fresh-case limits remain explicitly NOT RUN,
not PASS or a waiver of any new core failure. Local acceptance will combine
separated frozen predecessor/DDL/144successor evidence with the new remaining
results; do not describe it as one fresh complete before/after run. B Production
HTTP stays NOT RUN/closed. Release readiness and a Solo plan are later decisions.

The future grant should explicitly cover bounded cleanup after a **settled**
test HOLD: stop further tests, deactivate only the new cohort via existingRPCs,
retain9inactive/1pending/1suspended and audit/graphs; scope:local signout only the
up-to13run-created sessions. Independently prove0sessions/0refresh tokens,
original data/Auth rows and all old manifests unchanged; stop owned server/
runner. Keep acceptance HOLD/remaining NOT RUN even when cleanup PASS.
UNKNOWN/submitted/unsettled commands, unclear target/metadata/custody or open
external browser operation require exact read-only reconciliation before any
cleanup mutation; never force through them, relogin or use SQL session deletion.

At this preparation stage **new runtime remains NOT RUN / NOT AUTHORIZED**.

### 8.4 Completed candidate preparation

Exact candidate source2:

| Path | SHA-256 |
|---|---|
| `scripts/test-s0-boq-writer-boundary-local.mjs` | `0d8999cf8b440d4c5833ed4e0e1909aee855823ffd175a668b63eb543b054023` |
| `tests/s0-local-runner-safety.test.ts` | `cd4c1d186a07c85cb72039935969b595a4439246a15d9e578db0c6fbebfcbf65` |

S0-only HEAD+4projection:798/798tests61files PASS (30runner/6migration),
lint0errors/3existingwarnings,standaloneTypeScript PASS. The initial full run
had794PASS/3FAIL because the new projection lacked Git context; its log and
source snapshot remain. GIT_DIR/GIT_WORK_TREE with GIT_OPTIONAL_LOCKS=0 fixed
the test environment; no old source/test/rule was changed to make it pass.

Initial new defaultbuild compiled and typechecked but failed global-error
prerender. Copying installed dependencies via Node fs.cp without preserving
verbatim symlinks had made29temporary.bin links absolute to the old projection;
Next and the new app resolved different React paths. Restored only those
temporary links to their original relative values, retained the FAIL/log/.next
and built again from empty output. DefaultTurbopack/Node24 **PASS**,bothport
probes PASS; no repo app/package/config change or dependency install. The549
source files stayed byte-identical across the builds. Private helper now binds
the new successful build receipt, not the retained failed one.

Non-JSON response regression additionally proves status/bodyhash/parseError is
persisted before throwing UNKNOWN; no rawbody, automatic retry or false denial.
CoreHOLD only permits exact deactivation cleanup after settled intents; strong
completed-cohort retention survivesHELD. Browser closed receipts require explicit
appAcceptance and cannot promote cleanupOnly or incomplete execution to PASS.

New11actor/13session runtime, local fresh preflight and remaining real DB/UI
acceptance are still **NOT RUN**. No Docker/DB/Auth/Production accessed; no
staging/commit/push/deploy. The concrete source/build candidate is now ready
for explicit bounded runtime review, not release. Private preparation proof:
`/private/tmp/s0-successor-patch-20261103-mOgoT9/`.
Document checks22/22contracts,471relative links/102anchors across19Markdown
PASS; whitespace PASS,indexempty. Protected38 and frozen549source hashes
unchanged after build. This closes preparation only, not any runtime gate.

### 8.5 Approved successor-r1 execution and final closeout

Owner explicitly selected approval of `s0-20261103-successor-r1` with the exact
section8 envelope, including normal existingAdmin Auth bookkeeping and cleanup
after settledHOLD. This superseded the earlier runtime-pending preparation
wording prospectively. The run is now FINALIZED and that authority consumed.

Before DB/Auth, independent source review found two narrow recovery gaps:
finalize needed fresh custody before mutation, and browser cleanup needed the
parent's recorded state/session when deciding acceptance. Corrected only the
approved runner/tests/privatehelper, with no scope/cap expansion. New final
runner SHA `42bf4e9bb7e10ae6336418034ad3bf64c5a38896346287c64520ad7a6ad42f8b`;
safety test SHA `a742c8f4f194cf9ef76cd2234159a3a5d3a299d40b1a7ab8ad3c35e1d7dd7b42`;
private helper SHA `743fbb79b473fd21e561cf39fab85e10c00f01ffa2a1a4b3fc6909258727a31c`.
801/801tests61files (33runner/6migration),lint0errors/3oldwarnings and standalone
TypeScript PASS. Earlier798/build proof retained; only harness/tests changed,
and all built app/package/config bytes remain identical to the passing build.

Fresh preflight read only the pinned existing local target. Exact032 successor
SHA54f5d9f5…49b750b and frozenbaseline+031SHA2bc254af…84cacd4e matched;0metadata
differences. Roles5/effectiveprivileges24/references3/Admin/keybinding PASS,
actualPostgREST14.5/cap1000/PostgreSQL17.6. No migration/DDL/reset/Production.

Prepare PASS45records; remainingAPI verify PASS67more,**112totalrecords**.
Final **227DataAPIrequests** includes16cleanup profile/command requests; Auth
and browser requests are separate. The36status negative cases plus1staff
control passed, including pending header403/42501/0affected/unchangedgraph.
Independent exact-row read confirmed the staff control bound the expected
defaultFactor version. Postimage/bulk/read/Save/Copy031/sameJWT tests PASS.
Stale conflict returned in2.25ms;10measured writer PATCH samples after3warmups
had median6.36ms/p957.61ms. Retained predecessor median5.54ms/p956.78ms is a
different run/dataset/warm state, not a controlled causal-overhead benchmark.

Built-app login produced the13th dedicated session, recorded by the parent.
The helper then failed its **immediate** title assertion at the create route,
beforeCreate/Save. No actual title/URL/readyState at failure was retained; one
console404 has no resource mapping. Source metadata declares Conduit BOQ;
the list-title override also contains it. Rendering/readiness/404 explanations
remain hypotheses, not a proven app defect or a successful UI result.
No BOQCreate/Save/CopyPOST,created-saved dispatch/receipt/PNG exists. Remaining UI Create/
Save/reload/priced-calculation/output/desktop/mobile/keyboard gates NOT RUN.

The helper closed its exact known session and reported cleanupOnly/HOLD;
parent recorded builtApp/overallHOLD without weakening corePASS. Approved
finalize reread metadata and custody before deactivation, retained9inactive/
1pending/1suspended plus17BOQs16routes16items,closedall13sessions with0sessions/
0refresh tokens. Original32custody comparisons PASS;37allowed Authaudits
(11creates/13logins/13logouts),original sessions/tokens/audit rows retained.
127CONFIRMED/47DENIED intents,0unresolved. Runner/browser exited1 forHOLD;
ownedNextserver stopped143.42protectedhashes and549post-correction projected
source hashes unchanged,indexempty. No staging/commit/push/deploy/Production.

Final manifest SHA:
`ec1bf4133d110d2e8383c238a5f32bba60d83c15a95b9507c2d14426ab129b04`.
Private proof: `/private/tmp/s0-successor-preflight-20261103-i6cHDA/` and
`/private/tmp/s0-20261103-successor-r1/`. Keep raw account/metadata/evidence
private,oldGuard2HOLD intact,and all finalized runs closed.

**Current next proposal only:** first review bounded page-readiness diagnostics
that retain actual title/path/readyState and failing-resource status without
queries/secrets,then a separately approved UI-only run using1newstaff identity,
max3sessions (existingAdminAPI/staffAPI/staffbrowser),1BOQ/4routes/8items envelope.
No11actor/API-matrix repeat,original-account reuse or closed-run reopening.
Keep identity/title/error guards and HOLD on timeout; no product/schema fix
or waiver inferred. This proposal is not implemented/authorized by closeout.
Closeout document checks22/22contracts,480links/108anchors across19Markdown
PASS; whitespace PASS,indexempty. Final protection map adds this closed
manifest to the42unchanged pre-existing files,43total for future custody.

## 9. UI-only helper and one-user validation packet — 2026-11-03

Owner requested: fix helper page readiness/diagnostics and prepare a UI-only
1newaccount/max3sessions plan for review,without opening a run,touchingDB/
Production,replaying027–032 or staging/commit/push/deploy. This authorizes the
newprivate helper copy,offlinefakepage tests and local documents only. No
browser/server/Docker/Auth/fixture or live page/API call is part of preparation.
The real result remains corePASS/UIHOLD/cleanupPASS;oldruns remain FINALIZED.

### 9.1 Implemented helper scope and offline proof

New private source:
`/private/tmp/s0-ui-only-preparation-20261103-MMYIvI/s0-ui-driver.mjs`;
offline tests alongside as `s0-ui-driver.offline.test.mjs`. The old743fbb79…
helper and43protectedartifacts were not edited. No repository application,
runner/test,package/lockfile/config/migration change. The repository changes
in this task are this plan,the receipt and three handoff pointers only.

The new helper:

- Polls only readonly page state,for at most10seconds,requiring the exact
  approved local origin/path,interactive-or-complete document,unchanged
  ConduitBOQ title predicate and visible controls for that specific screen.
  This is not a repeated login/Create/Save or an arbitrary fixed sleep.
- Persists actual origin/path/title/readyState,expectedpath,controls,bodylength,
  overlay/error counts,elapsed/timeout/read-failure state **before** assertions.
  Blank/overlay/pageerror/routeguard/console-error checks remain mandatory.
- Records response>=400 and requestfailed metadata only:origin/path/method/
  status/resource type,validatedphase,timestamp,ordinal and allowlisted failure
  code. Query/fragment/credentials/headers/body/rawerror are omitted. Up to40
  events per collection plus an explicit dropped count; no silent truncation.
  ERR_ABORTED and unknown failures remain evidence requiring review,not an
  automatic waiver or a new blanket fatal criterion for navigation prefetches.
- On failure,attempts a private hashed PNG only on an exact allowed local
  login/create or confirmed newBOQedit/print route. A failed screenshot cannot
  replace the original error. No screenshot of a foreign/original BOQ route.
- Keeps oneCreate/oneSave,local-only requests,exact actor/session/receipt gates,
  expected single Save alert and no automatic retry. NonTTY execute stops
  before plan/env/browser access;default/help/import do not open runtime.

Diagnostics use the documented Playwright page/response/requestfailed APIs;
see [Page API](https://playwright.dev/docs/api/class-page). No browser was
launched to verify them in this preparation. A fake-page test is not proof of
the original title-failure cause; rendering/readiness/404 remain unproven.

| Prepared artifact/check | Actual result |
|---|---|
| Helper SHA-256 | `3ed0b55a11ed5c15cadcee3330a2ebd85cfac82c7abdb2e232d2ca32fa626b3d` |
| Offline-test SHA-256 | `6d591446542ddc144271938503b01743b6622769d892a7ab6c81bc6ae18e0a05` |
| Node24 syntax/default/help/nonTTY purity and fake-page tests | **15/15 PASS**,no browser/network/Auth/DB/Docker/run |
| Repository core quality | Prior801source tests/build evidence remains dated and unchanged;not rerun or claimed as new helper runtime evidence |
| Real UI / lifecycle / cleanup | **NOT RUN**,not authorized by this packet |

Tests cover delayedtitle/form readiness,wrongidentity/permanenttimeout/hung
observation,blank/overlay/healthfailure,durable diagnostics beforethrow,
screenshot failure preserving the original cause,sanitization and strict
one-new-actor/session constraints. Their mock IDs are not DB fixtures.

### 9.2 Reviewable UI-only protocol and missing coordinator

This is the earlier helper-only preparation stage. The later implementation
and its actual offline results are recorded in [section9.6](#96-coordinator-source-and-offline-lifecycle-preparation);
the runtime run remains NOT RUN.

**A new one-user coordinator is still NOT IMPLEMENTED.** The11actor runner
must not be invoked or modified to silently create another cohort. Before a
runtime proposal can be ready,the coordinator must implement and pass offline
fault tests for freshlocalpreflight,Auth/RPC journals,receipt reconciliation,
original custody,cumulativecaps and partial/HOLD/UNKNOWN finalization.
Completing only helper/page tests does not close this implementation gate.

Proposed private coordinator path (not created):
`/private/tmp/s0-ui-only-preparation-20261103-MMYIvI/s0-ui-coordinator.mjs`,with
separate injected fakeclient tests. Default/help/import pure,explicit TTY
execution,one exclusive targetlock,no replay/auto-resume and exact local source/
build/032contract checks are required. No package or app/schema/RPC change.

Parent format `conduit-boq/s0-ui-only/v1`,scenario `ui-only`,phases
PREFLIGHT→PREPARED→UI_READY→HELD/FINALIZED. App-plan format
`conduit-boq/s0-ui-only-app-plan/v1`;app states
PLANNED→SESSION→CREATED→SAVED→CLOSED. No fabricated VERIFIED/REPRODUCED/corePASS.
The old112remaining/frozen144matrix records stay hash-bound inherited evidence.

Parent actors must be exactly one created staffOwner,role staff,with a fresh
UUID and exact synthetic run email. Private `protectedActorIds` captures all
originalAuth/profile IDs,unique and includingOwner;newactor must be absent and
notOwner. Plan and parent IDs/emails/operationUUIDs/caps must match exactly.
Before browser login,a session slot must remain. HELD permits only cleanup
of the exact parent-recorded known browser session,never more UI writes.

### 9.3 Proposed identity,data and session envelope

Proposed run `s0-20261103-ui-only-r1` is **not created**. Execution date may
change in a later reviewed packet;oldrun IDs cannot be reused.

| Resource | Maximum cumulative scope |
|---|---|
| New Auth identities | 1staff;no runtimeAdmin,roleRPC,Viewer or SSO work |
| Sessions | 3total:existingAdminAPI1,newstaffonboardingAPI1,newstaffbrowser1;no replacement/second login or silent refresh |
| BOQs/routes/items | 1/4/8 including replaced/deleted generations and planned IDs;oneUI Create and oneSave |
| ExistingAdmin exception | New API-only session,normal Auth bookkeeping;approve/deactivate only the single newstaff,no browser or BOQ action |
| References/credentials | Existing local password and hierarchy/Catalog/Factor versions read-only,no settings or reference mutation |

Reserve user/operationUUIDs,email and capacity before dispatch;confirm they
do not exist in fresh original sets. Use normal local AuthAdmin create with
confirmed email,no real email delivery,newuser ownAPI `update_my_profile`,then
existingOwner `admin_approve_user`. No direct profile seeding,internalGUC,
trigger bypass or trusted affiliation shortcut. Verify current active staff
and approved scope before writingUI_READY. No old account/closedrun reuse.

### 9.4 Future execution sequence and acceptance

Only after reviewed coordinator implementation and explicit bounded runtime
approval:

1. Fresh readonlypreflight:pin existingDocker/volume/loopback,PostgREST14.5/
   configuredcap,exact+032 metadata/helpers/RPC/ACL/triggers,source/build/
   credentials,Owner/session feasibility and original data/Auth custody. Use
   recorded local/Production contracts without enteringProduction. Stop on
   drift,do not repair parity/reset/restore/replay or modify references.
2. Create/onboard/approve only the reserved newstaff with the twoAPI sessions.
   Record every submitted command/outcome;UI_READY requires settled proof and
   fresh custody. No initial businessBOQ fixture or11actor/API-matrix repeat.
3. Start the reviewed app build onloopback,new isolated staff browser,login
   once. Require bounded readiness diagnostics and visible createform before
   any business write;record session receipt and parent verify before Create.
4. OneCreate:accept the returned serverUUID only from the exact confirmed
   dispatch and independent persisted owner/scope/version/newID checks.
   Project name alone grants no ownership;record before Save.
5. Select one ordinary priced publishedCatalog item,quantity3,oneSave. Verify
   exact success envelope/single expected alert,reload and independently
   recompute saved item/route/header totals,Factor/VAT against bound read-only
   references. Save body stays one route/one item;no pricing/reference update.
6. SavedPrint preview,desktop1440×1000/mobile390×844,Enter/focus keyboard smoke,
   console/page/overlay and actual PNG review. No physical print/PDF/Excel
   export or full-site responsive/accessibility certification is implied.
7. Review every recorded resource event and screenshot before overallUI PASS.
   Helper stagePASS is only PENDING_EVIDENCE_REVIEW. Unexplained relevant
   404/otherfailures or droppeddiagnostics meanHOLD;do not suppress errors or
   infer a benign cancellation from missing evidence. Any explanation must be
   evidence-backed and recorded,no generic4xx/5xx/ERR_ABORTED exemption.

### 9.5 Cleanup,stop conditions and report

The future approval should explicitly include cleanup after settledUIHOLD:
record then scope:local close the exact known browser session;freshmetadata+
originalcustody barrier beforeOwner deactivates only the newactive staff;
scope:local signout the remaining two run sessions. Completed preparation must
retain1inactive profile/audit/ownedgraph and prove0sessions/0refresh tokens.
Before a confirmed approval,partial preparation may retain0profiles or1pending
profile;never approve a user just to facilitate cleanup. Once approval is
CONFIRMED,even if profile/custody checks fail beforeUI_READY,cleanup must retain
1inactive profile. Track approval independently of phase;UNKNOWN approval is
not a pending/no-write conclusion. No hard deletion of Auth/profiles/audit.
Expected Auth additions are at most7(create1/login3/logout3),correlated by
exact identities/actions/windows/intents,not a broad audit exemption.

UNKNOWN/SUBMITTED outcomes,foreign/extra identities/sessions/rows,source/
metadata/custody drift or unresolved browser activity stop mutations pending
exact readonlyreconciliation. No absence-of-row inference of NOT_DISPATCHED,
newUUID retry,relogin/global logout,SQL session deletion or policy rollback.
If an unknown session cannot be identified/closed within scope,retainHOLD and
exact residue evidence for a separately reviewed recovery. No invented0residue.

Final report separates inheritedcore evidence,newUI assertions,artifactreview,
cleanup/originalcustody,limits and authorization. LocalUI PASS would support
a later S0 Solo release proposal;it does not authorize commit/push/deploy,
Production access or applying032. The realUI remains HOLD until that evidence.
Preparation document checks:22/22contracts,485relative links/113anchors across
19Markdown PASS;whitespace PASS,indexempty. All43protectedfiles,oldhelpers and
finalized manifests unchanged. No fresh source801/build/runtime claim is made
from these helper-only checks;no new coordinator/run/DB/Auth/browser was opened.

### 9.6 Coordinator source and offline lifecycle preparation

Owner's later “ทำต่อครับ” starts the proposed privatecoordinator and injected
offlinefault tests,not a local Auth/run grant. Private paths are
`s0-ui-coordinator.mjs` and `s0-ui-coordinator.offline.test.mjs` under
`/private/tmp/s0-ui-only-preparation-20261103-MMYIvI/`. No app/repositoryrunner/
package/config/schema/RPC/migration source changes. Maintain this plan,receipt
and three handoff pointers. Qualifiedhelper/test hashes stay frozen alongside
the earlier43artifacts,45total;oldruns remain closed.

Required source behavior is the section9 UI-only protocol with real adapters
behind explicitTTY execution,and injected fake adapters for offline proof.
Only one new staff,three cumulative sessions and1/4/8business-row reservation
envelope are executable. OriginalOwner may approve/deactivate only that new
staff;there is no runtimeAdmin,roleRPC,corematrix/reproduce orDDL path.

The coordinator must journal before dispatch,match helper dispatch/receipt
hashes,independently verify session/Create/Save ownership and persisted graph,
and keep all original rows/artifacts/credentials protected. Reserved IDs alone
do not exempt a row from custody;only confirmed run ownership can do that.
UNKNOWN/unsettled or foreign/extra outcomes block all cleanup pending exact
readonlyreconciliation. No relogin/retry/newUUID or marker-only adoption.

Finalization must await exactmetadata and freshoriginalcustody before any
deactivation/signout. A confirmedapproval marker survives failure before
UI_READY and still requires1inactive retention;only preapproval partial0/1pending
is permitted. Helper scriptedPASS/cleanupPASS cannot become overallUI_PASS:
the coordinator must independently verify receipts/graph/custody,hash-bound
actual PNG review and resolution of every resource event. Missing/unexplained/
dropped evidence keepsHOLD. No weak bare reviewed=true can substitute for
specific reviewed artifacts;operator attestation is not automatic visual proof.

Source implementation is complete. Runtime adapters are behind explicit TTY
execution; default/help/import and non-TTY execution are tested without access
to credentials, file writes, network or child-process execution. The injected
suite exercises lifecycle and failure behavior without actual Supabase/Docker.
It does not prove the real adapters or the UI flow.

The first offline attempt recorded15/20 PASS and5 FAIL. Four failures were fake
reports missing the required source/build pins; one exposed an actual coordinator
reporting error where an HTTP status field overwrote cleanup HOLD. The fixtures
were corrected and the error is now nested under cleanup.error. Keep the first
log unchanged. Independent static helper/protocol review also added comparison
of the final, already-required retained graph read against both the saved and
reviewed graph hashes; cleanup cannot leave changed data under a stale UI PASS.

Fresh local preflight, run, browser and Auth remain NOT RUN/NOT AUTHORIZED.
The coordinator consumes fresh local graph/ready/metadata proofs (at most5minutes
old) and reviewed source pins; it does not generate or refresh those captures.
No compatible fresh capture or new run directory was created here. Future
preflight must capture the existing target read-only, validate the proof schema
and stop on drift without repair. Earlier missing-coordinator and801/core/build
statements retain their dated scope; no application/package/SQL change follows
from this private preparation.

| Qualified private preparation | SHA-256 / actual result |
|---|---|
| `s0-ui-coordinator.mjs` | `354208747dd9f2703a074fa8c0ae941ba9f214c0ea570dcef63dab16a7c909b1` |
| `s0-ui-coordinator.offline.test.mjs` | `0effbe94d31913bea59d34605ac87aab9bf41bba5e9778cd56567a7b83dedf80` |
| Node24 syntax and injected lifecycle tests | **21/21 PASS**; no real browser, Docker, DB/Auth or fixtures |
| Independent static helper interoperability review | No remaining blocker found; not a runtime acceptance claim |
| First / corrected / final offline logs | `coordinator-offline-first.log` (15/20), `coordinator-offline-second.log` (20/20), `coordinator-offline-final.log` (21/21), all retained |
| Documents / protected inventory | **22/22 contracts**,491relative links/119anchors across19Markdown PASS;45/45 protected artifacts byte-identical; index empty |
| Real adapter / UI / fresh preflight | **NOT RUN**; real S0 UI remains **HOLD** |

All paths above are under the private preparation directory, outside the
proposed application/release source. Final protection/document checks are
recorded in the [local receipt](../../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md#ui-only-coordinator-preparation--2026-11-03).

### 9.7 Fresh preflight producer preparation — 2026-11-04

Owner continuation after the coordinator review permits preparation of its
missing proof producer and offline tests. It does not authorize live Docker,
DB/Auth, browser/server, fixtures, Production or publication. Private candidate
paths are `s0-ui-preflight.py` and `s0-ui-preflight.offline.test.py` in the same
preparation directory. The47 protected artifacts are the previous45 plus the
qualified coordinator and its tests; preserve all bytes and closed runs.

The candidate produces the exact files consumed by section9.6's coordinator,
using reviewed read-only capture logic adapted to one staff rather than the
old11actor rehearsal. Default/help/import do no runtime work; explicit execute
requires a live TTY before filesystem/env/lock/Docker access. A future capture
uses the exact existing Docker socket, target/volume, gateway/network bindings,
PostgREST14.5 and cap1000. It checks Auth settings and existing credential/key
bindings without login, delivery, refresh or configuration changes.

The only planned DB reads are the pinned metadata query and bounded readiness
checks for the exact existing Admin, one existing a1 hierarchy and active
Catalog/Factor default IDs. Each runs in an explicit repeatable-read, read-only
transaction ending ROLLBACK with bounded timeouts. No BOQ rows, business RPC,
Auth mutation, DDL or migration operation is part of this producer.

Keep `actual-metadata.json` as the frozen baseline-plus031 predecessor
(`2bc254af…`). Read current post032 metadata separately (`54f5d9f5…`, full
metadata including read-only session fields); retain its hash/session in the
new metadata result while raw current metadata remains in memory. Do not confuse the old
definition-only metadata digest with the full digest, overwrite an old capture,
or relabel an old observation with a fresh timestamp. Source pins use raw file
SHA-256 for files and canonical sorted-JSON SHA-256 for the protected map.

Publish a fresh private proof directory only after every source/target/metadata/
credential/readiness check passes. Use the actual capture start as the
conservative freshness bound for all three consumer timestamps, with actual
start/completion recorded separately. Require start≤completion≤now and an age
of at most5minutes from start; completion must not make older observations
appear newer. Unknown/drift/failure means HOLD without repair, reset,
fallback target or partial PASS. Error output must omit credentials, gateway
config, inspect output, raw rows and query responses. The shared target lock
must prevent concurrent producer/coordinator activity without reopening a run.

Source preparation is complete. Live producer, coordinator adapters and UI
remain NOT RUN/HOLD. Proposed future run is
`s0-20261104-ui-only-r1`, **NOT CREATED**; the earlier proposed20261103 ID was
also never created. Any actual preflight plus1newstaff/max3sessions/1BOQ4routes
8items UI run, including Owner API-only bookkeeping and settled-HOLD cleanup,
still needs explicit bounded approval. It does not include032 replay or release.

| Qualified private artifact / check | Actual result |
|---|---|
| `s0-ui-preflight.py` SHA-256 | `2a044cf4203c1e73a99953748a4730127601f739081bfa40a046e5cedbdad606` |
| `s0-ui-preflight.offline.test.py` SHA-256 | `b25a84de5bd3eeaaf86c07b7e7e9793994f1fbbcee61302f1d2224b0265e6a1c` |
| Python3.9.6 syntax and injected producer tests | **13/13 PASS**; no real Docker/DB/Auth/browser/server |
| Fixed local input/build pins | **9/9 PASS**, with165 built application/package/config files unchanged; no fresh build claim |
| Source/static review corrections | Hash path-list inputs before following paths; match consumer Auth settings; reject replaced containers before exec; use conservative freshness bound |
| Documentation / custody checks | **22/22 contracts PASS**;495relative links/123anchors across19Markdown;47protected artifacts unchanged; whitespace PASS and index empty |
| Existing helper/coordinator/core evidence | Preserved and not rerun or relabelled as new runtime acceptance |

Future execution must supply the reviewed producer SHA through `--source-sha`;
the producer cannot derive and bless an unreviewed current source. No old
producer script is imported or executed. The offline log is
`preflight-offline-first-20261104.log` in the private preparation directory.
Final source protection and documentation checks are recorded in the local
receipt. A missing/changed temporary artifact requires preparation/review, not
an inferred runtime pass or an unreviewed replacement.

The next reviewable execution scope is one fresh local preflight and its
required read-only rechecks, followed by `s0-20261104-ui-only-r1`: one new staff,
at most3 cumulative sessions (existing Admin API-only, staff onboarding API,
staff browser), one UI Create and one Save, cumulative1BOQ/4routes/8items.
Use the existing password and reviewed Node24 app build, not a new stack or
package install. Explicit approval must include normal dedicated Auth
bookkeeping and new-user-only onboarding/approval/deactivation, retained audit/
owned graph, and settled-HOLD cleanup. Partial preapproval retains0/1pending;
confirmed approval retains1inactive and0sessions/0refresh tokens. UNKNOWN stops
for a reviewed reconciliation/recovery, never an automatic retry. No original
business/account/reference change, closed-run reopening, reset/restore,
migration/replay027–032, Production or stage/commit/push/deploy is included.

### 9.8 UI-only execution — 2026-11-04

Owner explicitly approved section9.7's fresh local preflight and new UI-only
run, including unchanged password,1newstaff/max3sessions, Admin API-only normal
Auth bookkeeping, one Create/Save, cumulative1BOQ/4routes/8items and settled-HOLD
cleanup. UNKNOWN stops. No original business/account/reference mutation,
closed-run reopening, reset/restore, replay027–032, Production or publication.
This supersedes the preceding source-only limit only for this exact execution.

Initial source gate passed: HEAD67c1e6f, index empty,47 protected artifacts and
producer/test pins unchanged, Node24, new run path absent. Fresh live preflight
is pending. Approval is not a runtime PASS. Record actual outcomes here and in
the local receipt; do not alter earlier FAIL/HOLD/NOT RUN evidence.

#### Settled outcome

The approved attempt is now FINALIZED and its grant consumed. Preflight output
is `/private/tmp/s0-ui-only-preflight-20261104-r1-7f294b`; run output is
`/private/tmp/s0-20261104-ui-only-r1`. Source remains HEAD67c1e6f plus the four
S0 paths, using the reviewed app projection with no A1 app overlay. Producer
`2a044cf4…`, coordinator`35420874…` and helper`3ed0b55a…` were unchanged.

| Actual check / operation | Result |
|---|---|
| Fresh preflight | **PASS**;2 RRreadonly/ROLLBACK queries, exact local DB/volume/gateway/key/14.5/cap1000/full post032 metadata54f5d9f5…;0Auth/HTTP/data writes/DDL |
| New staff preparation | **PASS**;1new confirmed local identity, own onboarding, Owner approval/current active staff scope;2 API sessions; no initial BOQ fixtures |
| Browser/flow attempt | **ABORTED_NOT_DISPATCHED** before Login submission;0browserAuth sessions,0Create/Save dispatch or new business rows |
| Coordinator acceptance | **ui=NOT RUN / overall=NOT RUN**, not PASS; core=INHERITED_RECORDED_ONLY |
| Overall S0 UI gate | **HOLD**, no new business-flow/desktop/mobile/calculation/output acceptance |
| Cleanup | **PASS**;1inactive profile retained,2dedicated API sessions CLOSED,0sessions/0refresh tokens;32table original custody PASS/5Authaudit additions |
| Browser/server/lock | Browser explicitly closed by abort; owned server stopped143; coordinator exited1 to retain NOT RUN; target lock absent |
| Final manifest SHA-256 | `35afb756936034391113f60579b481d9365aaac67e6f8ded99d009a868e66d53` |

The retained diagnostic at `/login` recorded title`Conduit BOQ`,interactive,
visible controls,bodyTextLength0,elapsed95ms,no timeout/page/guard/console/
resource failures. Its failure PNG was actually reviewed and shows a complete
Login form; PNG SHA`33f2b35e4f0f63f4f17216d9eb171711fe47324cbeedfb4f766eaa4761ea9e28`.
This later image does not establish body content at the earlier observation.
Source proves a helper contract gap: readinessSatisfied omits the body threshold,
so the poll can return ready before the separate body>80 assertion passes.
observePage also evaluates DOM before asynchronous control probes, permitting
a mixed-time observation. Exact React/font/streaming causation remains unknown;
no application/permission defect is established. No automatic retry occurred.

Proposed next source correction is a NEW helper copy: include body>80 in the
bounded readiness predicate, retain the final blank/health assertions and10s
deadline, and take the DOM snapshot after control probes. Add delayed-body,
permanent-blank,80/81 and actual observer-composition tests. Before proposing
another account lifecycle, qualify a separately approved unauthenticated Login
probe using the unchanged build, blank inputs/no submit, blocked Auth/Data API,
diagnostics and actual PNG review. Do not fabricate UI_READY, reuse this closed
account/run, weaken a guard or infer new runtime/patch authority from closeout.

Closeout document verification passed22/22 contracts,502relative links and
130anchors across19Markdown. Tracked/untracked whitespace passed; index empty.
All47 pre-existing protected artifacts remained byte-identical. The new
finalized manifest is an additional protected receipt for future source gates;
retain its recorded hash without changing the older47-file baseline.

### 9.9 New helper and unauthenticated Login probe — 2026-11-04

Owner explicitly approved the new helper copy/offline tests and Login-only
check on the existing local build without signing in. No new account/Auth
session, old-run reopening, DB/Docker/Production access or publication. Private
directory is `/private/tmp/s0-login-probe-20261104-helper`; its source/probe
does not load a closed manifest or fabricate UI_READY. Preserve the prior48
source/closed-receipt artifacts and existing app/build/package/credentials.

The new helper requires bodyTextLength>80 inside readinessSatisfied, retains
the final blank/health assertions and10second deadline, and samples controls
before taking a fresh DOM/title/body snapshot. Exporting observePage permits
tests to exercise the actual composition rather than a replacement observer.
Old helper3ed0b55a… remains unchanged.

| Prepared source / check | Actual result |
|---|---|
| New helper SHA-256 | `34532e83ba540b7b250ece7177f27f222375219d6236e8b7fe097d3a65a74f45` |
| New helper-test SHA-256 | `c1a5940dfefb48868af35ce80c8ebc4428e396e72d42274158c29ba6f82fa662` |
| Helper offline tests | **18/18 PASS**:old15 retained plus delayed body/80–81 boundary/permanent blank/actual observer ordering |
| Standalone probe safety tests | **3/3 PASS**:browser request allowlist, server outbound denial before original transport, pure/default/non-TTY guards |
| Authenticated Login/Create/Save | **NOT RUN**, not authorized by this grant; S0 UI gate remains HOLD |

The standalone probe imports only passive helper functions. It uses a new
isolated empty browser context, Login/static GET/HEAD only, no fill/submit,
Auth/Data API/non-web-origin blocking and WebSocket interception. The reviewed
Node24 app build runs on127.0.0.1:55637 with a process-local outbound fetch/HTTP/
TCP/TLS guard; no password/key file is read. Browser storage, network/error/
overlay diagnostics and actual1440×1000/390×844 PNGs must be reviewed. Focus/Tab
may exercise empty controls; no Login/signup/recovery command is dispatched.

Browser plugin is absent; the installed Playwright fallback is used under the
frontend-testing-debugging workflow. No package or browser installation, app
source/config change, rebuild, Docker command or DB check is part of this task.
Actual Login-only acceptance is recorded below; source mocks remain distinct
from rendered and authenticated-flow acceptance.

#### Actual unauthenticated result

New helper/offline tests passed18/18 and standalone safety tests3/3 onNode24.
The first probe (`runtime-1`) stopped HOLD because its strict Login/static
allowlist blocked the existing NT-logo Link's local/ prefetch, causing a browser
resource/console error. Keep its report, failure image,source-v1 and original
source-pins.json. No Auth/Data API or server egress occurred; browser and owned
server were closed. The fixed helper already observed body176 in that attempt.

Installed Next16.4.2 source and Login's Link establish the framework prefetch
path. The corrected probe permits only same-origin GET/HEAD RSC-prefetch marked
by rsc=1 and next-router-prefetch=1/2/3 for/ and its/login redirect, with bounded
query keys. It still denies normal root navigation, API/auth routes, all non-web
origins, credentials and mutations. Auth/Data API/WebSocket blocking and server
outbound guards are unchanged; no console/error waiver or response mock is used.

`runtime-2` completed, followed by actual Root review of both PNGs:

| Actual check | Result |
|---|---|
| Login identity/title/body | **PASS**;/login,Conduit BOQ,desktop176chars/146ms,mobile145chars/2ms,visible controls,no blank/overlay |
| Desktop/mobile | **PASS**;1440×1000 and390×844,readable NT Login form/controls, no clipping |
| Keyboard/empty fields | **PASS**;focus email→Tab changes focus;both inputs empty and submit disabled. Existing empty-email blur validation is visible, not an Auth action |
| Console/page/resources | **PASS**;0errors/warnings/pageerrors/failedresponses/failedrequests/dropped diagnostics |
| Network |28GETs to local web including two marked RSC prefetch/redirect requests;0Auth/Data API sent,0blocked unexpected requests,0WebSockets |
| Server guard / storage |0outbound attempts;0cookies/0localStorage entries, no password/key file loaded |
| Cleanup / scope | Browser closed, owned server stopped143, port free;0account/Authsession/DB/Docker/Production operations;48prior artifacts unchanged |
| Desktop PNG SHA-256 | `fee438d46f5a9667e41cdca8c0ac761228895e626be3bc4bf20eef9ff27c32a1` |
| Mobile PNG SHA-256 | `dd872ed94a633fca7dc1269c41d6c5ade14e0ecdafefa7c9bf9e28fd2f43f5ee` |

Qualified probe/guard/operator hashes are in source-pins-v2.json; reviewed
result is login-probe-result.json, all in the new private directory. Prior
fixture manifests remain closed/unchanged. This grant is consumed. Actual
authenticated Login/Create/Save/Print/Copy remains NOT RUN under this task;
the overall S0 UI gate stays HOLD. The frozen coordinator/producer still refer
to old helper3ed0…, so a future integration must use NEW reviewed copies/pins
and preserve closed receipts before proposing another separately approved
one-user Auth lifecycle. No current release or Auth authority is inferred.

Local closeout checks passed22/22 documentation contracts and506relative links/
134anchors across19Markdown. Tracked/untracked whitespace passed, index empty,
48prior protected artifacts byte-identical. The final no-Auth result and both
attempts/source versions are retained privately; no PII/raw query output was
added to the repository. Source/custody checks do not imply a fresh DB audit.

### 9.10 Coordinator and producer integration preparation — 2026-11-04

Owner explicitly approved preparing NEW coordinator/producer copies to use
the passed helper, inspecting source-pins and offline tests before proposing a
full test. No account/session, old-run execution, browser/server/Docker/DB,
Production, migration or publication. Preparation directory is
`/private/tmp/s0-ui-integration-20261104-r2`; it is not an Auth run or live proof
directory. Proposed `s0-20261104-ui-only-r2` is NOT CREATED.

The helper and its tests are byte-identical copies of the qualified section9.9
artifacts34532e83…/c1a5940d…. Coordinator changes only PREPARATION and HELPER_SHA.
The producer changes its PREP/protected-input path, reviewed peer/helper/map
pins and exact protected-count configuration83. Preserve the literal PINS
definition before functions bind their defaults. No Auth/SQL/RPC/target/build/
core/cleanup semantics change, and no old source is edited.

The83-file reviewed inventory preserves the earlier54 source/closed/probe
artifacts plus historical producer/tests, no-Auth results/reports/images/guard
receipts/first source version and qualified helper copies. Validate the raw
inventory pin before following paths. New coordinator/producer self hashes
stay outside this map to avoid a hash cycle; producer execution still requires
the explicitly reviewed --source-sha. No current execution is authorized.

| New private artifact / source contract | Qualified value |
|---|---|
| Coordinator SHA-256 | `8b5f1655ef12c60bcd95724125c7761df44e74d57986114b023badf17a73e3ca` |
| Coordinator-test SHA-256 | `0effbe94d31913bea59d34605ac87aab9bf41bba5e9778cd56567a7b83dedf80`,byte-identical copy |
| Producer SHA-256 | `db6198e50d3f1c93e36f8081f7d693380f15087b98e81bc84cbffe73850b7d28` |
| Producer-test SHA-256 | `d07d1ff16162ec729b46f22f715f289155364e240fa573cc7654253092812a21` |
| Protected-map raw SHA-256 | `d94f5a6762459d72705aca4c161c647223879e7c71a2992404ac1fabe2165ae5`,83entries |
| Helper SHA-256 | `34532e83ba540b7b250ece7177f27f222375219d6236e8b7fe097d3a65a74f45`;same qualified bytes/path in both peers |
| Coordinator offline suite | **21/21 PASS**,injected lifecycle/caps/UNKNOWN/custody/receipt/cleanup/evidence checks |
| Producer offline suite | **13/13 PASS**,including default-PINS identity/output,exact83inventory,gate ordering/freshness/target/key/source failures |
| Source-pin/integration suite | **4/4 PASS**:actual new peer bytes/defaults, raw-vs-canonical map contract/all83bytes, unchanged coordinator behavior/metadata+build pins, future server's new evidence destination |
| Future server operator SHA-256 | `7a8dfb93f3fc44be9e55f4c77a88ac8d50b71bd4d1108565f2b82b4915648186`;source-only copy changes just the output path to newR2,no server started |
| Independent static review | No actionable integration mismatch; no RPC/SQL/target/core changes |
| Fixed source/build inputs | **9/9 pins PASS /165 built app/package/config files unchanged**; no credential read/live query/build rerun |

Node24.2.0 and Python3.9.6 were used. The cross-language checks imported only
pure source/constants/hash functions; no runtime adapter/capture/prepare or
credential read occurred. Its minimal child environment emitted a Darwin
temporary-path lookup warning while all assertions passed; no application or
DB error is inferred. Earlier helper18/18 and actual no-Auth Login PASS are
retained, not rerun or relabelled as authenticated evidence.

Before any future Auth run, require explicit bounded approval and a fresh
read-only preflight from this new producer. Use new coordinator/helper paths
and matching producer-emitted source-pins; reject old helper/pins or source/
metadata/target drift without repair. All previous fixture runs remain closed.
Proposed scope stays1newstaff/max3sessions,oneCreate/oneSave,caps1BOQ/4routes/
8items,unchanged password,Owner API-only bookkeeping/new-user-only commands,
settled-HOLD cleanup;UNKNOWN stops. No reset/restore or replay027–032,
Production or stage/commit/push/deploy. Current runtime/full UI gate remains
NOT RUN/HOLD; this is preparation for review, not release readiness.

The full local test proposal is now concrete: verify these reviewed bytes and
Node24/Git/index first; execute the NEW producer into a fresh proof directory
with its reviewed source SHA; require unchanged target/full+032 metadata and
source-pins; start only the new coordinator/R2 and its new server operator after
preflight passes. Stop on drift rather than repairing parity. Then one new staff,
two API sessions plus one browser session, one UI Create/Save and saved-output/
desktop/mobile/keyboard/image/resource review. Retain original password/data/
Catalog/Factor references and all old inactive fixtures/closed receipts. Cleanup
only this new identity/known sessions after settled results;UNKNOWN stops for
review. No normal global logout, extra login/refresh, original-account adoption,
reset/restore, migration/replay027–032, Production or publication.

No live proof files, Auth manifest or new run directory were generated in this
preparation. Future approval must explicitly include DB/Auth/fixture operations
and normal Owner API-only bookkeeping/settled-HOLD cleanup; it cannot be
inferred from this source-only approval. If temporary source/evidence files are
missing or hashes differ, stop and prepare/review again without blessing drift.

Preparation document checks passed22/22 contracts and510relative links/
138anchors across19Markdown, tracked/untracked whitespace PASS and index empty.
All83 reviewed inventory entries are byte-identical; new private source hashes
and source/runtime limits are recorded in source-review.json/final-check.json.
No graph/ready/metadata-result/Auth manifest or R2 run directory was created.

### 9.11 R2 UI-only execution — 2026-11-04

Owner explicitly approved fresh preflight and the full R2 scope in section9.10
on existing Docker:1newstaff/max3sessions including Owner API-only bookkeeping,
one Create/Save,caps1BOQ4routes8items,unchanged password/originals and cleanup
on settled HOLD. UNKNOWN stops. No reset/replay027–032,Production or publication.
All previous runs remain closed; no source/behavior expansion is authorized.

Initial source gate PASS:83inventory and all8newtooling pins unchanged,
Node24,HEAD67c1e6f/index empty,newR2path absent. Fresh live preflight/results are
pending; approval is not acceptance. Record actual progress and final receipt.

#### R2 settled result

R2 is now FINALIZED and its execution grant consumed. Fresh preflight passed
at `/private/tmp/s0-ui-r2-preflight-20261104-68b32e`; new run evidence is
`/private/tmp/s0-20261104-ui-only-r2`. Exact new sources remain coordinator8b5f…,
producerdb619…,helper34532…;83source/evidence pins and the built app matched.
Preflight made2RRreadonly/ROLLBACK queries,0Auth/HTTP/writes/DDL.

| Actual R2 gate | Result |
|---|---|
| Preparation | **PASS**;1newstaff,own onboarding/Owner approval/current active scope,2API sessions |
| Browser Auth | **PASS**;one exact new session receipt CONFIRMED/independently recorded,total3sessions |
| Login / Create-page readiness | **PASS**;actual titleConduit BOQ/body176 and414,controls visible,no timeout/blank/overlay/pageerror/request-guard failure |
| Console/resource health | **HOLD**;one console resource404,weborigin GET/ fetch404 and separate ERR_ABORTED record at same millisecond; no proof these are the same request |
| Create/Save/calculations/Print | **NOT RUN**;no created/saved dispatch,BOQid or business graph |
| Cleanup/original custody | **PASS**;1inactive retained,3knownsessionsCLOSED,0sessions/0refresh,32tablecustody/originalAuthrows preserved,7Authaudits=create1/login3/logout3 |
| Uncertainty / processes |8intentsCONFIRMED,0unsettled;helper/coordinator exit1 keepHOLD,ownedserver stopped143,target lock absent |
| Final manifest SHA-256 | `1d5ef943cf2f6eb228df6feae7cb61db6cfa203d930d4ebfa4ac7293a15eca7c` |
| Reviewed diagnostic PNG SHA-256 | `39bf12b9992f166e0dda8567784bed5f7a7ef6bc5fd0a4fc5202f5aecd307a9b`;Root actually viewed intact Create form,diagnostic only |

Independent file review confirmed actor/session/dispatch/receipt ownership,
all hashes,known browser closure,caps/retention/custody and HOLD distinct from
cleanup PASS. No business request was retried; no migration or Production call.
All prior runs stay closed; preserve the new final manifest as another receipt.

#### Requested cause investigation: proven mechanism and missing R2 evidence

Owner then asked to establish the actual cause. Source/evidence review found
the root route present in both app/page.tsx and built app-paths-manifest. The
Login NT-logo Link targets/ and Next's client supports background segment
prefetch. Middleware has redirects/401/403 paths, no404 branch; no Create/Save
was dispatched. The observed404 is a web request, not a failed BOQ Data API
write. This narrows the failure layer, without proving the exact R2 segment.

Installed Next16.4.2 primary source
`next/dist/build/templates/app-page-runtime.js:1306–1348` explicitly returns
404+x-nextjs-postponed2+EMPTY when a requested static segment is absent from
the cached page's segmentData. Client segment-cache source treats a non-OK
prefetch as a miss/rejection. This does not by itself classify R2; ERR_ABORTED
alone is not an exception.

A NEW anonymous HTTP diagnostic at
`/private/tmp/s0-r2-404-diagnosis-20261104/runtime-1` tested the unchanged local
build with all server outbound fetch/HTTP/TCP/TLS blocked. It used no account,
cookie,Authorization,key or Auth session and made no DB/Docker/Production call.
RSC cache-busting parameters came from the installed pure Next helper. Raw
response bodies/query strings were not retained, only safe headers/length/hash.

| Observed anonymous control | HTTP / result |
|---|---|
| Ordinary public/login |200,HTML11581bytes |
| Valid/login tree segment/_tree |200,x-nextjs-postponed2,1634bytes |
| Valid/login page segment/login/__PAGE__ |200,x-nextjs-postponed2,4236bytes |
| Existing root-page segment/__PAGE__ requested from/login |404,x-nextjs-postponed2,0bytes |
| Root layout segment/_index not emitted separately |404,x-nextjs-postponed2,0bytes |
| Ordinary unauthenticated/ |307to/login,not404 |

All6controls matched the expected branches; all responses set no cookie,
server outbound attempts0,server stopped143. Thus the static segment-MISS
mechanism is reproduced, even while normal page/control requests succeed.
It is NOT proof that R2 used that segment/header combination: R2 omitted
request flags/segment key/response headers/request correlation ID/redirect chain.
Do not rewrite R2 as PASS or infer its exact rendering/cache cause retroactively.

A new passive correlation module and4offline tests now prove safe whitelisted
metadata,stable request IDs across response/failure,redirect linkage and no
cookie/token/router-state/full-query/body storage. Only a complete proven
protocol signature may be marked pending review; generic/API404,missing
headers/body,request mismatch and abort-only stay unresolved. No existing
helper/console guard was changed and this module has not run with Auth.

The smallest proposed actual-event trace uses the ORIGINAL active local staff
account documented in LOCAL_SUPABASE,not a closed fixture: at most1new dedicated
browser Auth session,normal Auth bookkeeping,Login→Createform read-only and
exact local signout,with fresh read-only local pre/postflight/session custody.
No new identity,onboarding/approval/deactivation,profile/role change,BOQ
Create/Save/Copy or business write. Preserve original sessions/password/data;
UNKNOWN stops. This requires NEW explicit approval because R2's3sessions/grant
are consumed. No such login/DB check is authorized or executed by this diagnosis.

Closeout source/document checks passed22/22 contracts,517relative links and
145anchors across19Markdown. Tracked diff and8new/private source/document
whitespace checks passed; index remains empty. All83 prior protected artifacts
are byte-identical. A new84-entry custody map adds R2's final manifest without
altering the original map or any closed run. Independent file-only review found
no evidence supporting an application/policy/032 change. Any later equivalent-
path trace can explain a newly observed failure,not recover missing R2 headers.

## 9.12. Existing-staff request trace — 2026-11-04

Owner explicitly approved one new session using original local staff with
read-only pre/postflight and normal Auth bookkeeping, capturing requests after
Login then logging out only that session. No Create/Save, Production,
replay027–032 or stage/commit/push/deploy. No new identity/profile/role change
or reopening a closed run is needed. R2 remains FINALIZED/HOLD.

New preparation is `/private/tmp/s0-staff-request-trace-prep-20261104-r1`;
new evidence target is `/private/tmp/s0-staff-request-trace-20261104-r1`.
Executor SHA-256 is
`2fa77b69338ee8812da355449b9f7dceb7b70a7270ee0066a4d34ff43c208ae8`.
Source syntax and9offline cases passed:one exact login,read-only API scope,
exact-session local logout,server egress,diagnostic/browser/report-failure
isolation before cleanup and4passive correlation cases. Independent file-only
review identified the cleanup ordering risk; the qualified source corrects it.

The flow is Login with redirectTo=/boq/create → one existing-staff password
dispatch → observe untouched Create form/request metadata → close new browser
→ one exact captured-token scope:local logout → readonly postflight. No project
field fill or Create/Save/Copy/business RPC/BOQ Data API read is allowed. Server
egress permits only local authorization reads; browser allows own profile/
scoped hierarchy and initial catalog-version metadata. Ordinary console errors
are recorded for diagnosis,never converted into acceptance PASS.

Preflight checks84protected artifacts,165built-source files,exact reviewed
build,existing Docker identities/volume/14.5,full post032 metadata,current
original-staff active role/profile and unchanged credential bindings. Custody
compares every public/private/profile row hash plus normalized Auth users/
identities; only this staff's last_sign_in_at/updated_at bookkeeping is allowed.
Original Auth session/token/audit IDs/hashes must remain. During login there
must be exactly one new known staff session/token; after local logout0remaining
and exactly one staff login/logout audit in their operation windows. UNKNOWN
stops without retry. No global logout, schema repair or original data repair.

Actual live preflight/Auth/trace/cleanup are pending. This approval is not a
runtime result or permission to repeat the session. Browser plugin is absent;
use the already installed Playwright without installing dependencies.

The first diagnostic attempt passed fresh preflight (32custodytables,84pins,
active original staff,post032 metadata) but stopped before Login because the
default Playwright headless executable is absent. Login/logout counts0, no Auth
session; server stopped143 and receipt FINALIZED/NO_AUTH_DISPATCH. Preserve
`/private/tmp/s0-staff-request-trace-20261104-r1` and its original prep bytes.
This did not consume the approved one-session budget. A NEW private copy at
`/private/tmp/s0-staff-request-trace-prep-20261104-r2` selects the existing Chrome
channel used by the prior helper,with no install/source/package change.
Executor SHA is
`b2f8f5f3a245efc93f2bd7a0e45ca7af323276a78080b0d4008f781fdaade389`;
source syntax/9offline tests passed again. The new target is
`/private/tmp/s0-staff-request-trace-20261104-r2`; fresh preflight passed before
the first approved Login dispatch. Actual trace/cleanup remain pending.

#### Settled trace and exact new-event diagnosis

The second diagnostic attempt is FINALIZED/TRACE_CAPTURED. It used the original
local staff with exactly1password login/new session and1scope:local logout;
no account creation/profile/role transition,Create/Save/Copy or BOQ Data API
request. The first pre-Auth attempt remains preserved with0login/0sessions.
The one-session grant is now consumed; no further Auth/runtime/DB operation
or application correction is authorized.

Source/target are unchanged HEAD67c1e6f+fourS0paths,noA1overlay,Node24.2.0/
Next16.4.2,existing Docker DB/volume/PostgREST14.5,web127.0.0.1:55637 and
API127.0.0.1:55321. Original Chrome156.0.8078.80 was used via installed
Playwright. Fresh full metadata pre/post both match54f5d9f5…;84protected
artifacts and165built-source files passed before/after. No application,
package/lockfile/config/SQL or credential file changed.

| Observed request chain | Correlated result |
|---|---|
| Before Login,logo-link root tree prefetch | /→307/login;actual Login tree/page200 |
| After Login,request-8 | GET/login,RSC1,prefetch1,segment/login/__PAGE__→307/ |
| Redirected request-9 | GET/,same segment→307/ cache-busting redirect |
| Redirected request-10 | GET/,same segment→404,x-nextjs-postponed2 |
| Failure correlation | request-10 itself records ERR_ABORTED;CDP43880.99 independently links307 chain/404/canceled |
| Actual Create route | Two RSC responses200;Createform visible,title/body399,controls present,no overlay/pageerror,project field untouched |

Root built index.meta advertises/_tree,/_full,/__PAGE__,with no
/login/__PAGE__. Installed Next app-page-runtime.js1306–1348 reads the retained
segment header,sets postponed2 and returns404 when segmentData.get misses.
The observed redirected wrong-page segment plus this exact source branch
establishes the cause of the NEW event:an authenticated Login redirect carried
the Login segment key into the root-page segment cache lookup. This is actual
request/header/redirect/source evidence,not a generic404/abort assumption.
It does not retrospectively recover R2's omitted headers or prove Production
prevalence. Response body could not be retrieved after abort;record UNOBSERVED,
not0bytes. The conservative automatic classifier stays
UNRESOLVED_DO_NOT_WAIVE because it requires observedbody0;no guard waiver or
business-flow PASS was introduced.

Two additional console errors were caused by this diagnostic's allowlist
omitting the existing/favicon.svg,which it blocked twice. Keep these disclosed
as instrumentation defects,separate from the independently correlated segment
404. This trace is not clean-console/full-UI acceptance;correct a FUTURE new
diagnostic copy's favicon allowlist before any approved retest,without editing
these finalized sources/receipts.

Fresh during/post custody PASS:all32 public/private/profile/normalizedAuth
table counts/digests identical,all original sessions/refresh tokens/audit
IDs+hashes retained. During login exactly1new known staff session/token;after
logout0sessions/0tokens. New audits are exactly1staff login and1staff logout
within their dispatch windows. Server guard recorded20successful local
authorization reads,0blocked/nonlocal egress. Browser API records contain only
one login,domain/profile/Auth reads,3scoped hierarchy reads and2catalog-version
reads. Browser closed,ownedserver stopped143. Independent file-only review
confirmed chain/source diagnosis,custody,budget and the favicon/body limits.

Root viewed the actual1440×1000Createform PNG. It is an intact,untouched form
with the original local staff and synthetic reference context;diagnostic only.

| Preserved new evidence | SHA-256 |
|---|---|
| trace-report.json | `44545c25dc366e17826b1ab5c4a1ce556e39d39becc43a33aea60096697446a8` |
| preflight-private.json | `4c78b6c67a97cc1b9d228df7ca88af069118b2cd08b92c17e3f227e359d4abcd` |
| during-private.json | `0f15675c22d92d25770648491fef70771903cec07f22a1c81127941c3f1a173d` |
| postflight-private.json | `7a139113d6bc7421e18dee4aa18fc3ef069db670870ed7d9043184d991f9fea6` |
| server-guard.jsonl | `f76ad9b6ef4ccdda255aa36d2804ca4aa3bde0711d4f95aad3078c92e1af3108` |
| reviewed create-form.png | `fc13478641919013741c5a3c3dc7b0a0757cee0a60724a8915b8d6277e64cb41` |

These files remain private under the new diagnostic directory;no raw identity,
session/token content or query output is copied inrepo.

#### Proposed smallest correction; not approved or implemented

The first candidate is prefetch={false} on the NT-logo Link to/ in
app/login/page.tsx,leaving Login commands/router/middleware/authorization and
database contracts unchanged. This targets the unnecessary pre-Auth link
prefetch that loads an auth-dependent destination;it is a hypothesis for the
smallest corrective change until a real built-app regression proves it.
Do not remove console/network guards,relax RLS or mix this into UM-A1.

Official [Next Link prefetch documentation](https://nextjs.org/docs/app/api-reference/components/link#prefetch)
states false disables viewport/hover prefetch and that prefetch runs in
production mode. [Supabase SSR advanced guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide#no-session-on-the-server-side-with-nextjs-route-prefetching)
also documents prefetch timing around Auth cookie processing. Those describe
relevant general behavior;the local installed16.4.2/source+trace above establishes
this specific event. Supabase changelog was consulted;no SDK/config/platform
change was selected. No newer Next version was assumed to fix this event.

A separately approved patch should test the actual Node24Turbopack production
build:Login desktop/mobile and logo navigation,then bounded authenticated
Login→untouched Createform with complete correlation and0unexpected console/
network/guard failures. Use a new diagnostic copy with favicon.svg allowed.
The one-Link edit does not change stored users/roles/BOQs;the tradeoff is the
logo destination loading on click. Keep S0 Create/Save/business-flow gate HOLD
until its separately approved real Docker acceptance succeeds. No release
readiness or future Auth/fixture/write budget follows from this diagnosis.

Final closeout checks passed22/22documentation contracts,521relative links/
149anchors across19Markdown,tracked whitespace and7new source/document
whitespace checks. Index remains empty. All84prior artifacts are unchanged;
the new86-entry map also protects both finalized diagnostic reports. Only the
five checkpoint/receipt Markdown files changed inrepo for this task. Private
tooling/evidence remains local; no app/package/config/SQL/publication change.

## 9.13. Login logo prefetch correction — 2026-11-04

Owner's later “ทำต่อครับ” continues the proposed smallest app correction and
local validation. Exact app edit:prefetch={false} on the existing NT-logo Link
to/ in app/login/page.tsx. No Login command/router/refresh/middleware/domain/
AuthProvider/profile/role/DB/package/config behavior change is included. The
earlier unapproved one-Link proposal is superseded for this source patch;
there is no new Auth session/DB/Docker/fixture/Create/Save/Production or
stage/commit/push/deploy grant.027–032 remain immutable/no-replay.

Use a NEW projection/build under
`/private/tmp/s0-login-prefetch-patch-20261104-r1`,based on the unchanged reviewed
HEAD67c1e6f+fourS0paths source plus this one Login line,no A1 overlay. Preserve
all86protected artifacts and all old builds/closed-run sources/receipts. Reuse
existing dependencies without installing or editing package/lockfile/config.

Relevant validation:existing auth-missing-session,auth-email and P49 application
authorization suites;lint,TypeScript,default Node24Turbopack production build.
No implementation-mirroring prop assertion test is added. NEW no-Auth browser
probe must block Auth/Data API/mutations/credentials and all server egress,
include all existing public assets including favicon.svg,and verify desktop/
mobile readiness/PNG/keyboard,zero viewport/hover root prefetch before explicit
activation,and intact logo click/keyboard navigation back to unauthenticated
Login. Permit root navigation only during an explicit bounded activation phase;
do not let the old prefetch-only probe manufacture a navigation failure.

Independent source review confirms installed Next Link disables viewport/
hover/touch prefetch with this prop. Actual post-Login404 regression and the
S0 Create/Save/business-flow gate remain HOLD/NOT RUN until separately approved
authenticated validation. Source/build/no-Auth PASS cannot supply that proof.

#### Actual local patch and public validation

The one-Line app correction is complete. Repository app/login/page.tsx and the
NEW isolated source differ from the prior app by exactly prefetch={false} on
the existing root-logo Link. Login handlers/router.push/refresh,visual theme,
Auth/domain/middleware/RPC semantics,packages/config and all other application
source remain unchanged. The candidate source is HEAD67c1e6f+fourS0paths+Login,
without UM-A1 overlay. Old builds/closed-run sources and86protected artifacts
are unchanged;no database/Docker/Auth session/account or Production operation.

Source preparation first checked the older s0-source-final manifest and stopped
on2runner/test hashes. The later recorded source-after-cleanup-barrier manifest
matches all549current files and those2current protected pins;app165 unchanged.
The new projection uses that later canonical source. Both historical manifests
remain unchanged;no parity/DB repair or migration operation was performed.
Existing reviewed node_modules were cloned locally with relative bins intact;
no install/package/lockfile modification and no previous.next output reused.

| Actual local check | Result |
|---|---|
| Affected Auth regressions |37/37PASS in3files:auth-missing-session,auth-email,P49 application authorization |
| Login ESLint / TypeScript |PASS,0lint errors;tsc--noEmit--incrementalfalse exit0 |
| Fresh default Turbopack build |PASS,Node24.2.0/Next16.4.2,parent+child loopback probesPASS,exit0;local test API settings only |
| Post-build source |549/549candidate source hashes unchanged;only Login differs from canonical predecessor |
| New probe safety |4/4offlinePASS,including exact bootstrap log paths/transport denial/navigation scopes |
| Baseline public control |Desktop/mobile each rootprefetch1 after viewport/hover;56GETs,total0blocked/errors/Auth/Data |
| Candidate public result |Desktop/mobile each rootprefetch0 before/afterhover;Enter desktop/tap mobile logo navigationPASS,one explicit root request each;56GETs,total0blocked/errors/Auth/Data |
| Storage / server egress |Fresh contexts,0cookies/0localStorage;both guard logs onlyGUARD_READY,0outbound attempts |
| Actual PNG review |Root viewed4PNGs;desktop pixel-identical,mobile same layout with only forgot-password keyboard-focus-outline difference |
| Processes / original custody |Both browsers closed,servers stopped143/formerPIDs absent;86prior artifacts unchanged |
| Post-Login404 / S0 business flow |NOT RUN /HOLD;no new Auth grant or Create/Save inferred |

The two56-request totals cover different last steps:baseline observes prefetch,
candidate also activates the logo. Do not claim a total-request reduction;
the measured change is suppression of background root prefetch. The Login
visual layout/commands remain the same. The tradeoff is loading the logo
destination when activated.

One baseline server bootstrap failed before HTTP because the NEW guard copy
still contained an old output-prefix regex. Its source-v1/failed bootstrap
receipts remain retained in baseline-public. Corrected NEW guard uses exact
new output paths,with a meaningful bootstrap-path offline check;fresh baseline
output is baseline-public-r2. No app/security guard was bypassed,no Auth
session created,and no previous runner/output was reopened or overwritten.
Candidate favicon.svg was included and produced0instrumentation errors.

| Private evidence under patch directory | SHA-256 |
|---|---|
| source-manifest.json | `f225adde74e7f3bad04c7f10d5b6cfcfc9aa005e284127e7c5c1c4a83e916356` |
| Login source | `d5d11a8f8df9491ad9e1e22b749b76d44759365d766624753522d92d8fa8d6a8` |
| relative-bin-build-result.json | `5b34c9f4b9e498f7e556a09874f830defc104b5b79adb7a4b695042b55204f3e` |
| baseline-public-r2/probe-report.json | `1747730c53948bc5a1581cfb86d7ede1d4c0e09e6afd39c0de2a902cf34d73d5` |
| candidate-public/probe-report.json | `c47552695f4229aeeb6c45f0cf4df33b44423294233b70755dc9cc717fb3a14d` |
| visual-review.json | `a43a4bb27e39e3c11394579649042847dda43a93d5f14f60fdf0ca7fd703aa55` |

Independent file-only review confirmed request counts,empty storage,error-free
public probes,guard/process closure and future verifier source gates. Existing
reports remain SCRIPT_PASS_PENDING_IMAGE_REVIEW;visual-review.json records
the later actual Root image acceptance without rewriting those reports.

#### Prepared next approval: one existing-staff read-only regression

Source-only prep is `/private/tmp/s0-login-prefetch-auth-prep-20261104-r1`;
executor SHA is
`2991c8a83137315b2cadb9f15c460e71a882e03bddfede4bc61c462a71d63f61`.
Syntax/source pins and9offline policy/correlation cases passed. Candidate
build/manifest/source pins,86protected artifacts and strict health assertions
are bound;favicon.svg is allowed. No future evidence directory exists and no
Auth/DB/runtime operation was performed by this preparation.

Proposed scope:NEW readonly local preflight→one NEW dedicated session using
original local staff/unchanged password→Login to untouched Createform on the
exact candidate→complete correlated request/console/API checks→one captured-
token scope:local logout→readonly postflight. Normal Auth bookkeeping only;
0new accounts/profile/role/business changes,no BOQ API read,Create/Save/Copy,
Production,replay027–032 or publication. Compare all32normalized tables and
original Auth rows;exactly1login/1logout audit,0new sessions/tokens after cleanup.
Diagnostic HOLD must still clean the known session;UNKNOWN stops,no retry.
Future target `/private/tmp/s0-login-prefetch-auth-verify-20261104-r1` remains
NOT CREATED. This needs NEW explicit session/bookkeeping approval because the
prior1session was already used and closed. It is not approved by source prep.
Passing this read-only regression would close the post-Login console404 check,
while S0 Create/Save/calculation/output acceptance still needs its own scope.

Closeout checks passed22/22documentation contracts,525relative links and
153anchors across19Markdown,tracked diff whitespace and13new source/document
whitespace checks. Index empty;86prior artifacts and549candidate source files
unchanged. This task changed exactly6repo paths:app/login/page.tsx,AGENTS.md,
AI_HANDOFF.md,AI_CONTEXT.md,this plan and the S0local receipt. All other dirty
work is retained. Full801-test suite was not rerun for the one-prop change;
the37affected Auth tests and real public browser evidence are the fresh checks.

## 9.14. Patched-Login authenticated regression — 2026-11-04

Owner explicitly approved section9.13's concrete one-session packet. Exact
executor is `/private/tmp/s0-login-prefetch-auth-prep-20261104-r1/run-trace.mjs`,
SHA-256
`2991c8a83137315b2cadb9f15c460e71a882e03bddfede4bc61c462a71d63f61`.
New evidence target is `/private/tmp/s0-login-prefetch-auth-verify-20261104-r1`.
Use fresh readonly local preflight→1new dedicated original-local-staff session/
normal Auth bookkeeping→Login to untouched Createform on the exact patched
build→strict correlated health checks→exact captured-token scope:local logout
→readonly postflight/custody. Preserve unchanged password/all originals/86pins.
No new account/profile/role/business change,BOQ Data API read,Create/Save/Copy,
Production,reset/restore,migration/replay027–032 or stage/commit/push/deploy.
Known-session cleanup proceeds on diagnostic HOLD;UNKNOWN stops,no retry.

Prior9offline policy/correlation tests and independent source review qualify
the prepared bytes,not runtime. Fresh source pins/build/metadata/target/current
staff/custody must pass before Login. Actual preflight/Auth/console404 result/
postflight are pending;approval cannot close S0 Create/Save/business-flow gate.

#### Finalized result

Fresh source/preflight passed before the one Login dispatch. The exact2991c8a…
executor ran once and returned exit0/POSTLOGIN_READONLY_REGRESSION_PASS;
new run is FINALIZED. No account/profile/role/business operation,BOQ Data API
read,Create/Save/Copy,migration/Production/publication occurred. Normal Auth
bookkeeping for the one original-staff session is the only allowed mutation.
This grant is consumed;no repeat/new session or business-flow scope follows.

Exact source is HEAD67c1e6fbf80da77d5bb6d6e115d3fa06016611b5+fourS0paths+
one Login-logo prop,without A1overlay. Source directory remains
`/private/tmp/s0-login-prefetch-patch-20261104-r1/source`,manifestf225adde…,
build-result5b34c9f4…;Node24.2.0/Next16.4.2/Chrome156.0.8078.80. Target remains
existing conduit-boq-local,DB4c570d11…b5966/volume supabase_db_conduit-boq-local,
API127.0.0.1:55321,web127.0.0.1:55637,PostgREST14.5. No new build/source change.

| Actual authenticated check | Result |
|---|---|
| Fresh local source/target/current staff |PASS,86protected artifacts/165built-app paths/currentactive staff/credential bindings |
| Full metadata pre/post |PASS,same54f5d9f53acf89e3be58fe2cbc1995be79b0c9516f9a3f939cf5b36a149b750b;RRreadonly/ROLLBACK |
| Auth budget |Exactly1password login/new session,one exact captured-session scope:local logout |
| Captured relevant web requests |GET/login200 +2GET/boq/create RSC200;all response bodies readable |
| Old trigger chain |0root requests/prefetch,0redirected Login-segment404;no matching failure or abort |
| Strict health |0console/page/guard/API/request/diagnostic errors;0HTTP failures;no exception or classifier waiver |
| Createform |Correct title/body399,controls visible,no overlay,project field untouched |
| During custody |32normalized table counts/digests unchanged,all original Auth rows retained;exactly1new session/token |
| Postflight cleanup/custody |PASS,0new sessions/0refresh tokens,all originals retained;exactly1staff login+1logout audit in dispatch windows |
| Server egress/processes |12successful local authorization reads,0blocked/nonlocal egress;browser closed,server stopped143/formerPID absent |
| Reviewed PNG |Root actually viewed1440×1000Createform;SHAfc134786… matches prior intact staff form |

This directly validates the one-Link correction for the observed local
Login→Createform path. It is a single desktop Chrome session with a short
settling observation,not every browser/role/refresh timing or Production
prevalence. Authenticated mobile/BOQ Create/Save/calculation/editor/Print and
Copy regression are NOT RUN in this task. Their earlier results remain their
dated evidence. The S0 business-flow gate is still HOLD;this closes only the
post-Login404/readiness blocker and supplies no release/publication approval.
Do not rewrite R2/earlier runHOLD or priorNOT RUN into retroactivePASS.

| New private evidence under auth-verify directory | SHA-256 |
|---|---|
| trace-report.json | `b28a5cb5efb73f9530798472f8d87ba33f7323c85464d03c2cac26bed26ee2e2` |
| preflight-private.json | `b702857db934887abc10f95442711793e863967d034d153cd994b1262414e191` |
| during-private.json | `929e5a4673914e9c04bc9ac84cfc2156a821578895fe599ab271ecbf016f1ba6` |
| postflight-private.json | `43782a92bc315bfbe790cc0bbb0bcb34cc9e3d21ef06cd237daf19db9edf5f37` |
| server-guard.jsonl | `26c6c0f4382f7686f1a20f890e69b8e20bac7c0eea5857ffa492f0c94e4dfbae` |
| create-form.png | `fc13478641919013741c5a3c3dc7b0a0757cee0a60724a8915b8d6277e64cb41` |

Private identity/session/token or raw SQL output is not copied inrepo. The next
appropriate S0 step is a NEW narrowly scoped Create/Save business-flow packet
using this qualified candidate and current local contracts. Prepare its source/
caps/cleanup/protected evidence before asking for execution approval;do not
reopen an old fixture,consume a past budget or rerun032 as a UI repair.

Independent file-only final audit compared actual32table digests,originalAuth
rows,exact session/token ownership,audit dispatch windows,source/build/metadata,
HTTP/CDP/guard health,PNG and process closure;PASS. This is separate from the
executor's self-report. No network/DB/Auth action was taken by that review.

Final closeout passed22/22documentation contracts,529relative links/157anchors
in19Markdown,tracked whitespace and7newsource/document whitespace checks;
index empty. All86prior artifacts and qualified tool bytes are unchanged.
The new87-entry custody map adds this finalized report without altering old
inventories. Only AGENTS,AI_HANDOFF,AI_CONTEXT,this plan and the S0receipt were
edited inrepo in this task;application/package/lockfile/config/SQL untouched.
No build/lint/app-suite rerun was needed for documentation-only closeout;the
actual authenticated check uses the exact previously qualified build.

## 9.15. Create Save R3 approval packet — 2026-11-04

Owner's later “ทำต่อเลยครับ” continues preparation of the remaining S0
Create/Save packet. Current work is NEW private source copies/offline tests
and local Markdown only. The prior read-only Login grant is consumed;it does
not authorize new fixture identities,Auth sessions or BOQ writes. No live
preflight/DB/Docker/Auth/browser/server was run by this preparation. Runtime
needs the explicit bounded grant below;no Production or publication is proposed.

### Qualified source and exact candidate

Preparation is `/private/tmp/s0-ui-business-preparation-20261104-r3`. Future
run is `s0-20261104-ui-only-r3`,evidence target
`/private/tmp/s0-20261104-ui-only-r3`;neither runtime manifest nor fresh live
preflight output exists. NEW copies derive from the qualified R2 coordinator/
producer/helper;all old copies/runs remain immutable as evidence. Using an
original staff account for this write run would require redesign of the
new-actor/custody/deactivation protocol;retain the already reviewed newstaff
envelope instead of silently weakening those checks.

The app/build is the exact Login-fixed candidate from9.13–9.14:
HEAD67c1e6fbf80da77d5bb6d6e115d3fa06016611b5+fourS0paths+one Login prop,
noA1overlay,source `/private/tmp/s0-login-prefetch-patch-20261104-r1/source`,
manifestf225adde…/build-result5b34c9f4…,Node24.2.0/Next16.4.2. All549candidate
source files remain unchanged;no new build/app/package/lockfile/config/SQL.
Post032fullmetadata54f5d9f5…,predecessor2bc254af…,metadataSQL/032hashes and
local Docker target/volume/PostgREST14.5/loopback remain the required contracts,
not fresh observations by this source-only task. No reset/restore/replay027–032.

| Qualified NEW private source | SHA-256 |
|---|---|
| s0-ui-driver.mjs | `aa51f0b69711228d5a6b16d33816090a34a28aa9ed24c363fc9fecee0575be2d` |
| s0-ui-coordinator.mjs | `879a4dd74b7ffd80c5c676e145b6a88eeecfcc7d3400e9fd7a89ab8f3801bc76` |
| s0-ui-preflight.py | `47f0d2cfa1e22e4555a4656b1b794a97967d7c7904db1cac31888c41c272f42d` |
| run-ui-only-server.mjs | `adea401dc59107ffd17a910a71e4a84ca0573e13703bcf9718efec14b4ca2bf1` |
| source-pins.integration.test.mjs | `47980e66540a66c69c9d4aa65afdc5ff6357f1ddfb3441dd02be52d3b7cd56ad` |

107protected inputs include all prior87,qualified old peers/candidate evidence
and four new server/correlation dependencies. Their bytes are unchanged;new
coordinator/producer stay outside that map to avoid a self-hash cycle. Producer
literal PINS is bound before Python defaults;helper/coordinator/tests/map/
build/manifest pins match. Raw build-file SHA stays distinct from parsed
sha(build),which helper and coordinator use consistently for report identity.

### Source corrections and actual offline qualification

Only NEW test tooling changed:

- Repin coordinator/producer/helper/server to the exact patched candidate.
  Coordinator mutation/unknown/cap/retention behavior is unchanged;artifact
  review additionally requires confirmed browser closure and no diagnostic
  errors. No failed-resource or genericabort waiver was introduced.
- Wait up to10seconds for exactly one expected Save alert to be observed and
  accepted,then an enabled Save button,before reload. Keep the listener through
  saved Print to catch duplicates. Delayed/unexpected/duplicate/accept-error/
  missing alerts remain HOLD,no repeated Save. This closes a source-backed
  test race;it is not a new observed application defect.
- Exact browser logout still uses captured-session scope:local once. Persist
  app-closed-transport.json immediately after confirmed204,before browser-close
  diagnostics. Diagnostic/browser-close failures keep UI HOLD while retaining
  known Auth outcome;receipt-persistence failure still closes local browser
  before surfacing HOLD. UNKNOWN logout is not retried or called confirmed.
- Hash-verified passive correlation captures approved local Login/Create and
  exact owned editor/Print requests,headers/redirect/failure IDs and error-body
  length/hash only;no Cookie/key/rawquery/body storage. Server egress stays
  local authorization reads only;Create/Save remains browser-bound and gated.

| Fresh source-only suite | Actual PASS |
|---|---:|
| Coordinator lifecycle/custody/UNKNOWN/artifact faults |22 |
| UI helper readiness/dialog/cleanup faults |24 |
| Correlation/secret stripping/owned paths |5 |
| Real peer/map/build/server/source integration |6 |
| Python readonly producer graph/freshness/key/source faults |13 |
| Total |70 |

Syntax checks passed;independent file-only reviews found no immediate source
blocker and confirmed107pins/candidate549/unchanged metadata/caps/retention.
These checks used fake dependencies/pure module imports and source reads only.
No runtime/DDL/Auth/fixture or fresh Docker parity PASS is claimed. Prior
37Auth tests/lint/TypeScript/build/public+authenticated Login results remain
their qualified dated evidence;no unchanged app suite/build was rerun here.

### Concrete proposed runtime grant

| Resource/action | Maximum / exact boundary |
|---|---|
| New identity |1fresh synthetic staff,reserved new UUID/email before dispatch;no old-run account adoption |
| Sessions |3cumulative:existingAdminAPI-only1,newstaffAPI1,newstaffbrowser1;unchanged local password,no replacement/refresh/global logout |
| Staff lifecycle |AuthAdmin create confirmed local identity;own onboarding;existingAdmin approve/deactivate only that new staff through existing RPCs |
| BOQ writes |One UI Create and one UI Save on one newly returned server UUID;planned one route/one ordinary positive-priced item at numeric quantity3 |
| Cumulative graph cap |1BOQ/4routes/8items including replaced/deleted generations;no second Create/Save or widerAPI/persona matrix |
| References |Existing hierarchy/Catalog/Factor read-only;preserve bound version IDs/prices;no reference/config mutation |
| Checks |Create→one-itemSave→reload;independent saved item/route/header totals and bound Factor/VAT;desktop1440×1000/mobile390×844 PNGs,keyboard smoke,saved Print preview |
| Export limit |No physical printing/PDF/Excel export;mobile capture is not full mobile interaction or WCAG certification |
| Cleanup/retention |Retain1inactive synthetic profile/audit/owned BOQ graph as evidence;close exact3sessions to0sessions/0tokens;no hard deletion of accounts/audit/graph |

Execution sequence after explicit approval:qualified producer fresh readonly
preflight→new coordinator prepare→app-plan→new guarded candidate server/driver→
session receipt/parent proof→Create receipt/parent ownership/cap proof→Save/
reload/calculation/preview→exact browser local logout→Root actually reviews
all3PNGs and every resource diagnostic→bound artifact review→fresh metadata/
originalcustody barrier→deactivate newstaff and local logout API sessions→
final Auth/originaldata/retainedgraph/107source custody. No release authority.

Approval must include normal Auth bookkeeping and settled-HOLD cleanup. A
known partial outcome may retain0profiles or1pending profile before approval;
after confirmed approval retain1inactive. UNKNOWN/SUBMITTED outcome,foreign
rows/sessions,unsettled browser business request or metadata/source/custody
drift stops writes for exact read-only reconciliation. Never infer no-write
from absent rows,retry with another UUID,relogin,reset/restore,repair parity,
replay027–032 or access Production. No staging/commit/push/deploy.

The goal is to close the remaining real S0 Create/Save/calculation/output-read
gate using inherited API evidence separately. Only actual new runtime results,
Root visual/resource review and cleanup can produce UI PASS. This prepared
packet does not mark that gate PASS or authorize the future run.

Preparation closeout passed22/22documentation contracts,534relative links/
162anchors across19Markdown,tracked whitespace and15new source/document checks;
index empty.107protected inputs and549candidate source files unchanged. Only
AGENTS,AI_HANDOFF,AI_CONTEXT,this plan and S0receipt changed inrepo;all new
tooling/logs/pins/execution-order.json remain private. No new runtime/proof/
fixture directory or credentials/session/account was created. These source
results support one explicit execution decision,not another preparation loop.

## 9.16. R3 local execution — 2026-11-04

Owner explicitly approved fresh local preflight and R3 under9.15,including
Auth/fixtures,Create/Save and settled-HOLD cleanup;UNKNOWN must stop. Use the
unchanged local password and preserve all original accounts/data/sessions.
The exact envelope is1newstaff/max3sessions,oneUI Create/oneSave and cumulative
1BOQ/4routes/8items. Retain inactive synthetic profile/audit/ownedgraph and
prove0run sessions/tokens. No reset/restore,replay027–032,Production or
stage/commit/push/deploy. No old closed run is reopened.

Qualified preparation remains `/private/tmp/s0-ui-business-preparation-20261104-r3`;
fresh preflight target `/private/tmp/s0-ui-business-preflight-20261104-r3`,new
run/evidence `/private/tmp/s0-20261104-ui-only-r3`. Source hashes/candidate/
107inputs are the exact9.15 packet. Actual results follow;approval is not acceptance PASS.


### R3 actual execution and settled closeout

Fresh source and local target preflight passed before Auth:exact existing
DB/container/volume/loopback,PostgREST14.5/APIcap1000,credentials/default
references/fullpost032metadata54f5d9f5… and107protected inputs matched.
Producer performed2 RR READ ONLY/ROLLBACK queries,0HTTP/Auth/writes/DDL.
Coordinator prepared1newstaff,existingAdmin API-only1session and staffAPI1;
normal onboarding/approval confirmed. Browser supplied exactly the third
session and UI Create completed on its one newly returned BOQ UUID.

| R3 actual gate | Result |
|---|---|
| Source / readonly preflight / newstaff preparation |PASS |
| Browser Login / Create / parent ownership proof |PASS;one new header,0persisted routes/items |
| Item selection |HOLD before Save dispatch:helper searches were `ท่อ`, `PVC`, `บ่อ` |
| Save / reload / calculation / saved Print / desktop-mobile acceptance |NOT RUN;0Save RPC requests/no Save-dispatch or saved receipt |
| Browser health |0console/page/guard/API/network/diagnostic errors;no waiver |
| Settled cleanup |PASS;1inactive synthetic profile/audit/owned empty BOQ retained;all3dedicated sessionsCLOSED,0sessions/0refresh tokens |
| Operation certainty |9lifecycle intentsCONFIRMED,0UNKNOWN;no business retry |
| Original custody |Executor asserts32normalized-table vectors unchanged and all originalAuthrows retained;7exactly attributed additions=create1/login3/logout3 |
| Final state |FINALIZED;UI/overallHOLD,cleanupPASS;driver/coordinator exit1 retains HOLD |
| Process closure |Browserclosed;server stopped143/formerPIDabsent/targetlockabsent |

Root viewed the actual failure PNG:editor was intact with no selected item.
Source/fixture diagnosis:canonical local fixture A/B use names `Parity synthetic
catalog item A/B` and codes `PRT-SYN-001/002`;ItemSearch filters item_name OR
item_code. None of the three hardcoded terms match those fixture values.
This is a test-helper/input mismatch. `unit_cost` exists and is populated;
no evidence justifies Catalog,pricing,application or032 changes. Successful
search response bodies/counts were not retained,so do NOT report observed
empty arrays or exact returned counts retrospectively. R3 remains HOLD.

| Final private R3 evidence | SHA-256 |
|---|---|
| manifest.json |`fcf173b188ba6601f05dc383db3e9686d1b9233474f81a36ef440dc7e38e0143` |
| app-driver-report.json |`66760c0dc1b76e557c5a97c563fbd79154873f3ce0686b197fac2003518fce02` |
| app-failure-saved-1.png |`4c184d6217a266287aaa1a4906edcbf819e20f051b4af622540537cebe820ab6` |
| Retained owned graph canonical hash |`223e030ad4b56ca79bc3a539c8c73d778f763e6f2fcaeff16742528d5aa865b7` |

Independent file-only review verified receipts,intent/session budgets,source
and settled-cleanup reporting. R3 did not persist the final current32table/
Auth hash vectors,so independent recomputation of those executor custody
assertions is NOT AVAILABLE. Keep that limitation;do not claim independent
final-vector PASS or reopen R3 to fill missing evidence. No PII,raw query,
keys or tokens are copied inrepo. Grant consumed;R3/earlier runs remain closed.

## 9.17. R4 selector correction and source-only packet — 2026-11-04

Following R3's settled HOLD,NEW private copies correct the source-backed test
mismatch and prepare the remaining test for review. This is source/offline/
Markdown work only. R3's grant/budget is consumed;R4 is NOT APPROVED/NOT RUN.
No new live preflight,Docker/DB/Auth/fixtures/browser/server was performed.

Preparation is `/private/tmp/s0-ui-business-preparation-20261104-r4`;proposed
fresh preflight `/private/tmp/s0-ui-business-preflight-20261104-r4` and run
`/private/tmp/s0-20261104-ui-only-r4` do not exist. App/build remain exactly
HEAD67c1e6f+fourS0paths+one Login prop/noA1overlay,qualified source
`/private/tmp/s0-login-prefetch-patch-20261104-r1/source`,manifestf225adde…/
build5b34c9f4…. All549source bytes remain pinned;no rebuild or application,
package/lockfile/config/SQL/migration change follows from this tooling fix.

### Corrective scope and prevention

- Helper searches exact existing synthetic code `PRT-SYN-001`,requiring its
  bound current version,active status,ordinary name/UUID and finite supplied
  material/labor/unit_cost with positive authoritative unit_cost. No fallback
  price calculation. Persist HTTPstatus/returned/eligible/unit-cost-present
  counts before selecting;missing/ineligible remainsHOLD without Save/retry.
- Producer's existing second RR readonly query additionally selects only that
  exact code/current default catalog version. Before any new Auth/BOQ creation,
  require exactly1active ordinary row and finite nonnegative material/labor,
  unit_cost>0 and material+labor=unit_cost. This proposed bounded reference read
  is NOT yet executed. Missing/ambiguous/drifted reference stops;do not reseed,
  change Catalog or repair parity automatically.
- Coordinator persists already-read current normalized-data/Auth hash vectors
  and attributed additions in private `custody-latest.json`,hash-bound from
  manifest. There is no extra DB query or changed mutation/UNKNOWN/cap/cleanup
  state machine. A future final file-only audit can recompute actual retained
  vectors instead of relying solely on a status assertion. R3's limitation is
  retained. Evidence failure holds acceptance;it is never a custody waiver.
- Preserve R3 Save-alert/local-logout protections,request correlation,strict
  diagnostic guards and exact owned graph/session checks. No business retry,
  second login,global logout or old-run reopening. Old helper/evidence bytes
  remain unchanged.

### Qualified NEW sources and actual offline checks

| R4 private source | SHA-256 |
|---|---|
| s0-ui-driver.mjs |`6a1cc3a3d4d2bca696c32c8ab1df9ed1c17a06c167af37a80d77d9a74042f62d` |
| s0-ui-coordinator.mjs |`0c60640cfc70bb717d31d8b77236c9709597550321caf77dcf035701200291f4` |
| s0-ui-preflight.py |`1ce1330feb6bb0898eab413680457520fdcf8cc2a2a42f9181b5f6c9ca52981c` |
| run-ui-only-server.mjs |`8bfc410e28464914061354a804cc1452e18ae1ad7b3f82a07c250c2107552144` |
| source-pins.integration.test.mjs |`fd01ca40aaf20bce93873605c69105b94c5f2b741bd7308c5f0106fef74636e6` |

| Offline checks |PASS |
|---|---:|
| Helper including exact fixture/search/price faults |26 |
| Coordinator including retained custody vectors |23 |
| Correlation |5 |
| Actual peer/source/map/build/server integration |6 |
| Readonly producer including pre-Auth selector feasibility faults |14 |
| Total |74 |

The122-entry protected map retains all107R3inputs plus used R3 source/pins/
finalmanifest/report/PNG and new guard/correlation dependencies. Actual bytes,
peer/Python-default/raw-versus-parsed-build pins and549candidate sources
match. Offline tests reject old terms/wrongcode/version/inactive/missing/
null/nonfinite/zero prices,missing/duplicate selector and changed originals/
foreignAuth additions. Source checks are not fresh Docker/runtime PASS.
Independent file-only helper and coordinator/producer reviews found no blocker,
confirmed source/pins/caps/retention and no added custody SQL query. Fresh
selector visibility/Create/Save/finalcustody remain NOT RUN. Final document
validation follows;no runtime authority is inferred.

### Concrete proposed R4 execution scope

Use the same exact target/contracts/candidate and1newstaff/max3cumulative
sessions (existingAdmin API-only1,newstaffAPI1,newstaffbrowser1),unchanged local
password,one UI Create/one UI Save and cumulative1BOQ/4routes/8items. Planned
selection is one PRT-SYN-001 at numeric quantity3. Read existing Catalog/Factor
only;verify saved header/routes/item and bound prices/Factor/VAT independently,
reload,desktop1440×1000/mobile390×844 PNGs,keyboard and saved Print preview.
No physical print/PDF/Excel generation or expanded persona/API matrix.

Sequence:source gate→fresh readonly metadata/target/reference feasibility→
prepare/app-plan→guarded server/helper→session/Create/Save receipts with parent
ownership/cap proof→reload/calculation/preview→exact local browser logout→Root
reviews all3actualPNGs and resource diagnostics→hash-bound artifact review→
fresh metadata/original custody barrier→deactivate only newstaff/API local
logouts→final custody-latest/session/token/retainedgraph independent file audit.

Settled HOLD cleanup retains1inactive synthetic profile/audit/ownedgraph and
closes only exact new sessions to0sessions/tokens. A confirmed partial prepare
may retain0profiles or1pending profile instead. UNKNOWN/unsettled business
request or drift stops for exact readonly reconciliation,no mutation retry.
Preserve all original accounts/passwords/data/sessions,closedruns,parity9,
Catalog/Factor and027–032. No reset/restore/replay,migration/Production or
stage/commit/push/deploy. R3 cannot be reopened and its budget cannot fund R4;
new explicit bounded approval is required. S0 remains not release-ready until
actual remaining UI acceptance and cleanup evidence pass.


R3/R4 document closeout:22/22contracts and546relative links/174anchors across
19Markdown PASS;tracked and new-file whitespace checks PASS,index empty.
All122protected inputs/allprior107 and549candidate source bytes remain
unchanged. This task's repository updates are AGENTS,AI_HANDOFF,AI_CONTEXT,
this plan and the S0receipt;new helper/coordinator/producer/pins/logs remain
private. Independent file-only reviews found no source blocker. R4 live
preflight/run directories absent;no additional runtime/Auth/DB operation.
Earlier801source tests/37Auth tests/lint/TypeScript/Turbopack remain their
dated qualified app evidence;no unchanged app suite/build is repeated for
private tooling/document changes. S0 acceptance remainsHOLD,not release-ready.


## 9.18. R4 local execution — 2026-11-04

Owner explicitly approved fresh local preflight and R4 under9.17,including
Auth/fixtures,oneCreate/oneSave and cleanup on settledHOLD;UNKNOWN must stop.
Use unchanged local password and preserve all original data/accounts/sessions.
Exact scope is1newstaff/max3sessions,one UI Create/Save,cumulative1BOQ/4routes/
8items and inactive synthetic profile/audit/ownedgraph retention with0sessions/
0tokens. No oldrun reopening/reset/restore/replay027–032,Production or
stage/commit/push/deploy. Source qualification/offline74PASS refreshed before
execution;122protected inputs matched,indexempty/HEAD67 unchanged.

Exact peers remain section9.17's qualified bytes. Fresh preflight target is
`/private/tmp/s0-ui-business-preflight-20261104-r4`;new run/evidence target is
`/private/tmp/s0-20261104-ui-only-r4`. Actual live preflight/Auth/UI/artifact/
cleanup results remain pending and must be recorded independently of approval.
Browser plugin not available;use the already qualified installed Playwright
fallback without dependency installation. Flow:Login→Create→exactfixtureitem/
quantity3→oneSave→reload/calculation/savedPrint/desktop-mobile→exactlogout.


### R4 actual execution and settled closeout

Fresh74offline/source gate passed;122protected inputs/549candidate source
bytes/HEAD67/indexempty matched. Initial sandbox preflight exitedHOLD with
READONLY_COMMAND_FAILED;readonly Docker version control confirmed socket
permission denial. The same pinned producer then ran with approved local
socket access and passed:2RR READ ONLY/ROLLBACK queries,0Auth/HTTP/writes/
fixtures/DDL. Required exactDB/volume/container/key/14.5/APIcap1000/default/
fullpost032metadata54f5d9f5… and1eligible positive exactPRT-SYN-001 matched.
This was environment access recovery before any Auth,not data/parity repair.

| R4 gate |Actual result |
|---|---|
| Staff preparation/Login/Create |PASS;1newstaff/existingAdminAPI-only,exact3sessions;one UI Create/parent ownership proof |
| Catalog UI search/select |PASS;exactcode/currentversion,HTTP200,returned1/eligible1/unitCostPresent1 |
| Quantity/Save helper |HOLD at immediate string3 assertion afterfill3/Enter;actual inputValue not retained |
| Save/reload/calculation/savedPrint/desktop-mobile acceptance |NOT RUN;0Save RPC/dispatch/receipt and0childwrite requests |
| Browser health |0console/page/guard/API/network/diagnosticerrors;no waiver |
| Cleanup/retention |PASS;1inactive synthetic profile/audit/owned emptyBOQ retained;3sessionsCLOSED,0new sessions/refresh tokens |
| Certainty |9intentsCONFIRMED,0UNKNOWN;no mutation retry |
| Original custody |PASS;persisted current32normalizedtable vectors equal originals;all originalAuth IDs/hashes retained,exact7audits=create1/login3/logout3 |
| Independent file audit |PASS for actual vectors/attributed audit windows/receipts/intents/budgets/source;not solely executor status |
| Final state |FINALIZED,UI/overallHOLD,cleanupPASS;driver/coordinator exit1 preservesHOLD |

Root viewed actual1440×1000failurePNG:editor intact,item selected,route total
150.00 forunit50. It does not reveal the offscreen quantity input text or
prove its exact assertion-time value. Source/real-component proof follows
in9.19. Do not convert this runtimeHOLD intoPASS or a proven app defect.

| Final private evidence at `/private/tmp/s0-20261104-ui-only-r4` |SHA-256 |
|---|---|
| manifest.json |`7db3ad2b7cee63de9d82cdc06334cce2cc9d03ebec81eec55d2ee29b52848470` |
| app-driver-report.json |`e2ea61b168afdf3b6b38b39d6656f39cdc8ebab75baec6f3b305b1d9d41d4cd3` |
| custody-latest.json |`0d47ecb00b17ac8893c27c17bb9ffffde031d21ed28fe60b8a763a9100feb3cc` |
| app-failure-saved-1.png |`23c07606d43d60751705a716605820c0f2afabba4039daf0f2c9128da5d3884e` |
| Retained owned graph |`8ebca6ce22874e9748f98a3b2d640841a42d7d23d388dfe7b6b5b78e160b5bdc` |
| server-process-closure.json |`2b38d51d55b150aa76c3805b9a0aa8c8cd916b27aed56c0b2913c145389af19f` |

Browserclosed/local204 logout confirmed before finalization. Root interrupted
the server operator TTY withCtrlC rather than its normal `stop` command;
s0-server-stopped.json was not produced. Separate readonly OS checks confirmed
exact formerPID53080 absent and no55637listener. Record process absence only;
exact child exitcode/signal/normalstopreceipt unavailable. Use operator `stop`
for a future approved run;do not fabricate the missing receipt or restart R4.

All122protected inputs/549candidate sources/032bytes and unrelated repository
files remain unchanged. Normal Auth bookkeeping only within the approved new
run;original accounts/passwords/data/sessions are retained. No reset/restore/
replay027–032,Production or stage/commit/push/deploy. No rawPII/query/token inrepo.
R4grant consumed;all earlier runs remain closed. Further runtime needs a new
concrete qualified packet/explicit bounded grant;S0 release-readiness staysHOLD.

## 9.19. Quantity contract review and correction proposal — 2026-11-04

File-only review found two invalid helper expectations:afterEnter and after
reload,savedStage demands inputValue exactly `3`. Existing QuantityEditor
uses draft??formatQuantity(value),formatQuantity uses toFixed(2),and Enter
blurs/commits the draft through the existing parent controller. Committed or
reloaded numeric3 therefore renders `3.00` under the actual application
contract. The helper must check that contract and wait passively for settled
rendering,while retaining strict invalid-quantity/ownership/Save guards.

A NEW isolated offline harness `/private/tmp/s0-r4-quantity-contract-20261104`
imports the exact qualified realQuantityEditor/editorState/UI primitives.
Six tests PASS:rawdraft3→commit numeric3/draftremoved/total150/render3.00;
reload numeric3→render3.00;invalid/incomplete3*1/3x1/3abc/empty retain visible
drafts without becoming numeric3. No mocks replace arithmetic/component;
only alias resolution uses real modules. This proves source/component
compatibility,not the missing actualR4input sample or full DOMevent timing.
No Auth/DB/Docker/browser/server,fixture or app/package/config change occurred.

Proposed minimal NEW-helper correction:replace BOTH immediate string3 checks
with one bounded passive committed-quantity observation,requiring canonical
3.00,notfocused,noinvalidstate/noactivecancel-draft control. Persist bounded
actualvalue/focus/invalid/draftcount/elapsed/phase diagnostics before asserting;
no fill/Enter/Save retry or permissive parseFloat/operator recovery. Test
valid delayedcommit/reload,wrongnumber/invalidtext/readfailure/timeout and
compatibility with the real component above. Keep Save payload numeric3 and
independent persisted graph/calculation checks unchanged.

Whole-path file-only review also found one diagnostic gap:the broad saved
phase spans quantity/edit/Save/reload/Print,but recordUnexpectedFailure always
labels it expectedPrint. Future helper must track expectedPath by substep:
edit through quantity/Save/reload,print only when Printnavigation begins.
Offline fake-page failure test must preserve Edit as the expected page for
preSave quantityHOLD;primaryfailure must not be replaced. This diagnostic
mismatch did not cause R4's primary equalitycheckHOLD.

Independent full remaining-path review found no additional confirmed Save
payload/success-envelope/alert/enabled-control/Factor arithmetic/Print-label
contract mismatch. Parent first Print button intentionally navigates same-tab;
mobile remains screenshot-only. Calculation/Print/browser timing remain actual
runtime NOT RUN,not acceptance from source inspection. No application fix is
proposed;the next source packet should correct both quantity observations and
that substep diagnostic together before creating another live fixture. Preserve used R4
helper/coordinator/producer/evidence as frozen history.

Before any new runtime packet,review the remaining Save/calculation/Print/
cleanup path against actual source contracts and repin NEW peers/protected
inputs only after corrections/offline proof. Do not fix failures one live
fixture run at a time. No R5 helper/coordinator/producer bundle,livepreflight,
Auth/session/fixture/DB/Production or publication authority is created by this
proposal. Ordinary user-facing quantity formatting remains unchanged.


R4final document/source closeout:22/22document contracts,556relative links/
184anchors across19Markdown,tracked/new-file whitespace PASS,indexempty.
Realqualified component/state contract6offlinePASS;freshR4sourcegate74PASS.
All122protected inputs/549candidate bytes,credentials/032 and unrelated dirty
repo files unchanged. Only5checkpoint/receiptMarkdown updated inrepo;new
componenttest/evidence/reviews remain private. No application/package/config/
SQL change or newbuild/lint/fullsuite rerun was needed. Runtimegrant consumed;
no R5bundle/Auth/DB/browser/server/Production/publication authority remains.


## 9.20. NEW helper quantity and diagnostics correction — 2026-11-04

Owner explicitly approved a NEW helper copy correcting both quantity checks
and diagnostics,adding offline tests and updating the checkpoint. This grant
is source/offline/Markdown only:no R5,livepreflight,DB/Docker/Auth/fixtures/
browser/server,Production or stage/commit/push/deploy. Do not replay027–032,
reopen any closed run or change old coordinator/producer/source pins.

New preparation is `/private/tmp/s0-ui-helper-correction-20261104-r1`.
It derives from exact R4helper6a1cc3a3… and retains used R4 source/evidence
unchanged. Application/build remain qualified HEAD67+fourS0paths+oneLoginprop/
noA1overlay,manifestf225adde…/build5b34c9f4…;all549candidate source files
remain pinned. This task changes no application/QuantityEditor/calculation/
Save/Print/Auth semantics,package/lockfile/config/SQL/credentials or database.

### Exact corrective behavior

- Replace both immediate string3 assertions(afterEnter and afterreload) with
  one passive committed-quantity observer. Require COMPLETE rawtext exactly
  `3.00`,unfocused,ARIAinvalid exactlyfalse,scoped quantityTD and zero draft
  cancel buttons(even hidden controls count). Numeric-prefix parsing,trim or
  diagnostic redaction/truncation can never make a noncanonical input pass.
- One atomic readonly DOM sample reads text/focus/ARIA/draftcontrols. Poll
  within at most10seconds;individual async reads are bounded too. Hung,
  unreadable,late,wrongnumber,operator/junk/overprecision/focused/draft states
  cannot pass on a stale sample. No repeated Fill/Enter/Save or mutation retry.
- Durably persist final bounded valuepreview/original length/truncated flag/
  diagnostic numericvalue/focus/ARIA/draftcount/elapsed/readfail/timeouts/
  checkpoint/substep/expectedpath before assertions. Full raw equality is
  decided before sanitization. A persistence error prevents progression to
  Save. Diagnostic numeric conversion does not validate a draft or Save value.
- Track saved substeps explicitly:quantitycommit/Save/reload expect ownedEdit;
  only Printnavigation/preview expect ownedPrint. Failure diagnostics use that
  expectedpath and preserve primaryHOLD even if screenshot capture fails.
  No diagnostic routing based merely on the broad savedphase.
- Existing API/ownership/mutation/cap/UNKNOWN guards,Save payload/alert wait,
  independent calculation/Factor/VAT,Print selection and local logout/cleanup
  functions are unchanged. Source-boundary tests compare actual old/new bytes;
  observer code contains no UI action or API call.

### Source and offline qualification

| NEW private file |SHA-256 |
|---|---|
| s0-ui-driver.mjs |`d2abf58f026e7aaa5c0c8f3b37eef8f178c4376eaca455ded5b725c377618bf2` |
| quantity-diagnostics.offline.test.mjs |`b1cc7a360347ae39ddf7f6476275075a5b1ee14e6ebd6d23f96ea4195f0c7c13` |
| Existing copied helper test(unchanged) |`d1c7d8d9e3314d5e3bd9447e79fc6f08dcc824b84694eb0add3df2c6b21e7e90` |
| component-contract/tests/quantity-commit-contract.test.ts |`c9f86d42ee6cc4051065034995f4b09435050d7577baa12bc00d2abc188e6187` |
| protected-before.json |`43a43ba9b5d95caac2617959c58ef4ed62ba3d86f0c403c23d235bcd4cc73ae7` |

| Actual offline checks |PASS |
|---|---:|
| Existing helper readiness/selector/dialog/cleanup/protocol regressions |26 |
| New quantity/timeout/persistence/diagnostic/substep/scope checks |14 |
| Realqualified QuantityEditor/editorState/UI primitive contracts |11 |
| Total |51 |

Nineteen cases are new(14Node+5realcomponent compatibility);the earlier6real
component cases and26helper cases retain their purposes. Both checkpoints
are tested for delayed draft→commit,while complete malformed inputs/unknown
ARIA/missing scope/hidden or retained cancel controls are rejected. Read
failures/hangs/deadline/persistence faults and redacted/truncated-prefix
falsePASS cases are injected. Fake-page preSaveHOLD retains expectedEdit and
its primaryfailure even when screenshot diagnostics fail. Actual component/
state imports prove draft3→numeric3/total150/display3.00 and reloaded3.00
agree with the NEW helper;invalid/incomplete drafts remain visible/unaccepted.
These are offline source/component checks,not real browser event/runtimePASS.

The151-entry beforemap preserves all122R4inputs,all17finalizedR4files,eight
usedR4prep sources/pins,the three prior componentharness files and one copied
immutable correlator. Mutable NEW helper/tests have separate afterhashes.
CurrentR4coordinator/producer still pin OLD helper6a1cc3a3…;do not pair them
with the new helper or alter old pins. No R5 coordinator/producer/fullruntime
bundle is created. No new credentials/session/account/run or API request.

Independent file-only driver and scope/custody reviews PASS,no blockers:
all151beforepins/549candidate source files and afterpins match;18critical
protocol/guard/API/mutation/calculation/cleanup/execute functions are byte-
identical. Final document/source checks passed as recorded below.
ActualR4input text remains unretained;R4 stays FINALIZED/UIHOLD/
cleanupPASS and its grant is consumed. Application build/lint/TypeScript/full
suite need not be rerun for private helper/offline/document changes. A future
step may prepare NEW peers/preflight source binding this helper plus current
protected custody before proposing another explicitly approved bounded run;
that preparation/runtime authority is not inferred from this source patch.


Helper correction closeout:51offline checks(40Node+11realcomponent/state),
22/22document contracts,560relative links/188anchors across19Markdown and
tracked/new-file whitespace PASS,indexempty/HEAD67 unchanged. All151protected
inputs/549candidate source files,old helper/peers,credentials/032 and unrelated
repo dirty files retain their bytes. OnlyAGENTS,AI_HANDOFF,AI_CONTEXT,this plan
and S0receipt changed inrepo;new helper/tests/pins/receipts remain private.
Both independent file-only reviews passed. No freshpreflight/DB/Docker/Auth/
fixture/browser/server/Production or publication was performed. Current
helper-only task is complete;S0UI stillHOLD and R5NOT RUN/NOT AUTHORIZED.
Next possible work is NEW coordinator/preflight SOURCE preparation binding
this helper;old peers must stay frozen. No integration/runtime PASS or grant
is implied. The private componentharness package/tsconfig are unchanged copies
of prior test inputs;no repository package/config edit or dependency install.


## 9.21. Qualified helper integration and R5 proposal — 2026-11-04

Owner said “ทำต่อเลยครับ” after the stated next step:prepare NEW coordinator/
preflight sources bound to the completed helper before proposing real testing.
Current work is private source/offline/Markdown only. It does NOT authorize
livepreflight,DB/Docker/Auth/fixtures/browser/server,R5 execution,Production,
reset/restore/replay027–032 or stage/commit/push/deploy. All closed runs and
used sources remain frozen. A generic continuation does not supply the new
Auth/fixture/BOQ write budget below.

### Prepared source and exact bindings

New preparation: `/private/tmp/s0-ui-integration-20261104-r5`.
Proposed future live proof: `/private/tmp/s0-ui-preflight-20261104-r5`.
Proposed future run/evidence: `/private/tmp/s0-20261104-ui-only-r5`.
The latter two directories do not exist;no ready/manifest/session or live
proof was created. Fake in-memory offline fixtures are not Auth/DB fixtures.

| Prepared private source |SHA-256 |
|---|---|
| s0-ui-driver.mjs(exact qualified copy) |`d2abf58f026e7aaa5c0c8f3b37eef8f178c4376eaca455ded5b725c377618bf2` |
| s0-ui-coordinator.mjs |`c878490e843d9e5a5a95bdcd6a43f55debf5f8196c4a1b58999bd44e8e087e4c` |
| s0-ui-preflight.py |`525f501a2d96ca2b4fc4b587b1f5daa450722d915fd0f9d5d844d4e957ccba16` |
| run-ui-only-server.mjs(source template only) |`31acd13a007306739ec00e73c0e7c6e9a1c08ca754f83596e58b1276d59ea729` |
| source-pins.integration.test.mjs |`6b476efad73d1f3834e1ed84a9f74f3a06d54461be81e4556d6969108ec94e34` |
| protected-before.json |`ba7262c64877bdf5cadc69a7415ed405545ecfee84c2cda9c772ccefedd1bad4` |

Helper/correlator/regression/component proof copies are byte-exact to9.20.
Coordinator changes only PREPARATION and HELPER_SHA. Producer changes only
PREP,PROTECTED_COUNT and reviewed map/peer/helper PINS;literalPINS remains
before Python default bindings. Whole-source normalized comparisons prove
unchanged lifecycle/caps/UNKNOWN/HOLD/cleanup/retainedgraph/custody persistence
and readonly metadata/reference-selector contracts. No helper/controller,
APIguard,calculation,application,SQL or authentication-command change.

NEW server/guard source templates only rebind proposed R5paths/guard hashes;
policy and runtime logic stay identical. This source support is needed for a
concrete reviewable future packet;no server is started. `execution-order.json`
binds exact source hashes and requires literal `stop\n` to the operator,
matching s0-server-stopped.json/exactPID/build,and subsequent process/port
absence. Do not useCtrlC as normal shutdown or call missing shutdown evidence
PASS. Never execute an old hardbound R4operator against a proposed new run.

The171-entry beforemap retains all prior151,qualified helper-correction
sources/receipts/pins and frozen NEW helper/test/component/server dependencies.
Mutable new coordinator/producer/integration files stay outside the beforemap;
separate afterpins bind them without a hash cycle. All171actual hashes and
all549candidate source files match. Oldpeer/helper-correction/R4 source pins
remain unchanged. Both raw and canonical map hashes,raw versus parsed build
hashes and immutable032source are independently checked.

App/build remain exact HEAD67c1e6fbf80da77d5bb6d6e115d3fa06016611b5+fourS0paths+
oneLoginprefetchprop/noA1overlay,source
`/private/tmp/s0-login-prefetch-patch-20261104-r1/source`,manifestf225adde…/
build5b34c9f4…. Required target remains existing conduit-boq-local/DB4c570d11…/
unchangedvolume,API127.0.0.1:55321/web55637/PostgREST14.5/APIcap1000 and full
post032metadata54f5d9f5…. These are required dated contracts,not fresh live
observations by this source task. Preserve credentials/originaldata and parity9.

### Actual source-only qualification

| Offline checks on Node24.2.0/Python with fake dependencies |PASS |
|---|---:|
| Coordinator lifecycle/UNKNOWN/custody/artifact/cleanup |23 |
| Existing helper readiness/selector/dialog/cleanup |26 |
| Qualified quantity/diagnostic correction tests |14 |
| Correlation/owned-path/secret stripping |5 |
| Actual peer/map/build/template/plan integration |8 |
| Readonly producer/source/freshness/key/selector faults |14 |
| Real QuantityEditor/editorState/UI primitive compatibility |11 |
| Total |101 |

Integration checks actual byte pins,old151subset/all171map/all549candidate
files,032hash,full normalized coordinator/producer equality,exacthelper/
component copies,no mutable self-pin,default/help/nonTTY purity,template
startup restrictions/localreadonly policy,normalstopsource and exact future
commands/absence of runtime outputs. No DB/credentials/API/browser/server
operation follows from those pure/module/source tests. Independent file-only
scope/custody and driver/build/server/plan reviews PASS,no blockers;all18
recorded afterpins agree between qualified-source-pins and qualification.
Source PASS is not real Enter/blur/Save/reload/Print or fresh Docker parity PASS.

### Concrete proposed R5 execution approval

| Resource/action |Exact maximum / boundary |
|---|---|
| Preflight |Freshsource/171pins/build/target/metadata/credentials/reference checks;exactactive PRT-SYN-001 positive authoritativeprice feasibility before any Auth/BOQ creation |
| New identity |1fresh synthetic staff;never reopen/adopt an earlier fixture |
| Sessions |3cumulative:existingAdminAPI-only1,newstaffAPI1,newstaffbrowser1;normal Auth bookkeeping,unchanged local password,no replacement/refresh/global logout |
| Newstaff lifecycle |Existing AuthAdmincreate/ownonboarding/Adminapprove and finaldeactivate target only this new identity;original users/roles/sessions untouched |
| Business writes |One UI Create and one UI Save on one newly returned BOQ;planned1route/PRT-SYN-001/quantity3 |
| Cumulative graph budget |1BOQ/4routes/8items including generations;no second Create/Save,auto-retry or wider persona/API matrix |
| Readonly checks |Bound Catalog/Factor prices unchanged;independent savedgraph/quantity/material/labor/cost/Factor/VAT verification,reload,savedPrintpreview |
| Rendered evidence |Desktop1440×1000/mobile390×844/savedPrint PNGs,strict page/console/network/guard review,keyboardfocus;mobile is screenshot-only |
| Export boundary |No physical print/PDF/Excel generation or accepted-output style change |
| Cleanup/retention |Retain1inactive synthetic profile/audit/ownedgraph;close exactsessions to0sessions/0tokens,no hard deletion. Confirmed partial prepare may retain0profiles or1pending before approval |

Future sequence only after explicit execution approval:freshproducer→prepare/
app-plan→NEWguardedserver/helper→session receipt/parentproof→oneCreate/parent
ownership/cap proof→quantitycommit gate/persisted diagnostics→oneSave/expected
acceptedalert→reload/quantity gate/independent savedcalculations→threePNGs/
savedPrint→exact browserlocal logout→RootactuallyreviewsPNGs/resources→hash-
bound artifactreview→freshmetadata/originalcustody barrier→newstaffinactive/
exactAPIlocal logouts→actualfinalvectors/session/token/retainedgraph audit→
normaloperator `stop`/matching stoppedreport/process+port closure.

SettledHOLD must retain acceptanceHOLD while cleanup proceeds only for known
exact run-owned outcomes. UNKNOWN/SUBMITTED Auth or business operation,
unsettledbrowserwrite,foreignrows/sessions,metadata/source/custodydrift stops
mutations for exact readonly reconciliation;no retry,newUUID,relogin,global
logout,parityrepair or reset/restore. Do not edit/apply/replay027–032 or change
Catalog/Factor/originalaccounts/data/passwords. Three earlier accepted S0 edge
NOT RUN cases stay their scoped exceptions,not waivers of feasible/core UI or
UM-B's primary positive case. No Production access or publication authority.

Risks remain realbrowser event/timing/selector/Save/Factor/Print acceptance and
process/evidence completeness;offline PASS cannot guarantee them. Onfailure,
retain exactdiagnostics/receipts andHOLD,not a fabricatedPASS or automatic
another fixture run. R4's actualinput/normalstopreceipt limitations remain
historical. This packet makes one future execution decision concrete;it does
not authorize that decision. S0 realUI/release gate remainsHOLD.


Source-integration closeout:101offline checks,22/22document contracts,
564relative links/192anchors across19Markdown and tracked/newfile whitespace
PASS,indexempty/HEAD67 unchanged. All171protected inputs/prior151/549candidate
source files,oldusedpeers/helper/R4evidence,credentials/032 and unrelated dirty
repo work retain their bytes. This task's repository edits are the same five
checkpoint/receiptMarkdown paths only. All new source/templates/proof manifests
and future executionorder remain private. Independent afterpin/source/scope/
plan reviewsPASS. No newbuild/install/DB/Docker/Auth/fixture/browser/server/
Production or publication operation;no liveproof/manifest/ready/run output.
Prepared means sourcequalified,not runtimePASS or an executiongrant.


## 9.22. R5 local execution — 2026-11-04

Owner explicitly approved freshlocalpreflight/R5/Authfixtures/oneCreateSave
and settled-HOLDcleanup under9.21. UNKNOWN muststop. Exact scope remains
1newstaff/max3cumulative sessions including AdminAPI-only,unchangedpassword/
originalpreservation,caps1BOQ4routes8items and inactiveprofile/audit/ownedgraph
retention to0sessions/tokens. No oldrun/reset/restore/replay027–032,Production
or stage/commit/push/deploy. Fresh file sourcegate passed171protected/18after
pins/549candidate bytes/HEAD67/indexempty before any DB/Auth dispatch.

Qualified prep `/private/tmp/s0-ui-integration-20261104-r5` remains unchanged;
new liveproof `/private/tmp/s0-ui-preflight-20261104-r5`,run/evidence
`/private/tmp/s0-20261104-ui-only-r5`. Actual preflight/Auth/UI/artifactreview/
cleanup/normalserverstop results pending;record separately from approval.
Use installedPlaywright fallback because Browserplugin notavailable;flow
Login→Create→exactfixture/quantity3→oneSave→reload/calculation/Print/PNGs→
exactsessioncleanup. Do not infer another Auth/fixture budget after finalization.


### R5 actual execution and settled closeout

Freshfilegate passed18afterpins/171protectedinputs/549candidatebytes/HEAD67/
indexempty. The reviewed producer ran once with localDocker socket access:
2RR READ ONLY/ROLLBACK queries,0Auth/HTTP/writes/fixtures/DDL. ExactexistingDB/
volume/container/loopback/PostgREST14.5/APIcap1000/credential/default/priceselector
andfullpost032metadata54f5d9f5… matched. No parity/schema repair. Coordinator
then prepared exactly1newstaff and twoAPI sessions;browser supplied third.

| R5 actual gate |Result |
|---|---|
| Staff preparation/Login/Create |PASS;newstaff/currentactiveapprovedscope,oneownednewBOQheader,parentownership/cap proof |
| Item selection |PASS;exactPRT-SYN-001/currentversion/HTTP200/returned1/eligible1 |
| Quantity afterEnter |PASS;actual3.00/unfocused/ARIAfalse/scopedTD/no draft;fresh21ms observation,0readerrors/timeouts |
| OneSave |PASS;exactnewBOQ/singleSaveRPCsuccess/oneexpectedacceptedalert/no duplicates |
| Reload quantity |PASS;actual3.00/sameclearstate,fresh7ms observation;persistedquantity3 |
| Persisted graph/calculation |Runtime helper independently recomputed90material+60labor=150cost,F1.1,165beforeVAT,11.55VAT,total176.55;parent separately reread/checked owned1BOQ1route1item and totals/hash |
| SavedPrint/keyboard |PASS for preview/visibleprojectitem/total and Savefocus;no export/physicalprint |
| Browser health |0console/page/guard/API/network/diagnostic errors,0droppedevents;no waiver |
| Actual image review |Rootviewed all3PNGs;desktop/firstPrintform readable;mobile reviewedwithP2clipping as below,no fullmobileusabilityPASS |
| Cleanup/certainty |PASS;3exact sessionsCLOSED,0new sessions/refresh tokens;10intentsCONFIRMED/0UNKNOWN |
| Retention |1inactive synthetic profile/audit +1BOQ/1route/1item retained;no hard deletion,no original changes |
| Original custody |Actual32normalizedtablevectors equal originals;all originalAuth IDs/hashes retained;exact7attributedaudits=create1/login3/logout3 |
| Final state |FINALIZED;configuredUI/overallPASS scoped to desktopflow+reviewedcapture,cleanupPASS;driver/coordinator exit0 |
| Server closure |Literalstop→normalstoppedreport matchesPID55932/build/start;child143/signalnull,operator0;separate readonlyps/lsof confirmsPID/port55637 absent |

Desktop PNG actually shows quantity3.00/unit30/20/material90/labor60/cost150,
route/grandcost150 and readable Save/Print controls. SavedPrint PNG shows the
firstform/project/item/quantity/costs with aligned columns;only top of nextform
is visible. Helper checked entire previewbody for savedtotal176.55,not every
printed page's layout. No PDF/Excel/physicaloutput was generated or certified.

Mobile390×844 capture shows an expanded240pxnonshrinking sidebar leaving a
narrow clipped itempanel;quantity/rightpricecolumns are unreadable. Document
width390==viewport390 does not rule out nested clipping. Sourcecomparison
proves MultiRouteEditor/BOQPageHeader/editpage/LineItemsTable are byte-identical
betweenHEAD,builtcandidate andworktree:unchangedlayoutcode,not an S0 UI code
regression. ThisP2existingresponsive limit is outside the bounded permission
correction and is recorded as nonblocking for desktopflow acceptance,not a
claim of mobileusability/responsivePASS. No mobilecollapse/scroll/edit/Save
interaction ran. A secondheader-like band appears in the PNG;actualDOMduplicate
versusresize/capture/compositing cause is UNCONFIRMED. Source parity is not a
fresh baseline runtimecomparison. Carry this issue into Owner release review;
no mobilefix or newfixture run is authorized automatically.

| Final private evidence at `/private/tmp/s0-20261104-ui-only-r5` |SHA-256 |
|---|---|
| manifest.json |`de482376ed157c1acec632800f144d44c7ff5d2d293dca5b8f0133407d8b57ab` |
| app-driver-report.json |`fa58f0386feaf49e301cef0b0be3769bef24a0b789105bb6b3dad3127d3b029d` |
| custody-latest.json |`1182c10921868da66f72b001cd6bb652504ac3b4c48c427e2f0c44d4a1322ed9` |
| artifact-review.json |`7d7e7c5ea4f9a0bcac77d9fdc3ca3339fb502de6919d83190dbb93b3c4576493` |
| Desktop PNG |`073b5d71023787d18f7955a8c8b04086c09404e68ea598680c5a58e1bdfc31f8` |
| Mobile PNG |`ea13bac77ba187b6c15506cb65c86b800eca6f08659a417734488ccc0dcc4391` |
| SavedPrint PNG |`0a44bc284a0661db6aa66092f5ebcb3f24c0206cacaf62746d9eeb285d3cef1b` |
| Retainedgraph canonicalhash |`079b024dc1cfeaf1c5c750bf7541abcad07ae5958ca3af56dac9d3cdc7068c2a` |
| s0-server-stopped.json |`26274225f6f86885f71cab5b6e8ae36e377ee6a1cfdad7ee52e51902147c144c` |
| server-process-closure.json |`a96c5ed489b98dfd74a216d34a3412c9c82543fff1204c7355218f94b5d0b435` |

Independent file-only audit verified actual32vectors/originalAuthhashes/
attributedauditwindows/exact1Create1Save/receipts/quantityobservations/recorded
arithmetic/packet/imagebindings/18afterpins/171protected/549candidate andnormal
stopproof. Raw savedgraph andFactor reference rows were NOT retained:live
source-enforced independent calculation and parentgraph checks passed,but
file-only audit cannot reconstruct reference interpolation or independently
query finalgraph. Do not add an unapproved DBread to fill this gap. Fresh
metadata barriers are executor-enforced;do not overstate a separate raw
postflightmetadata capture. No raw identities/queries/credentials/tokens inrepo.

Newrun is closed;explicitR5executiongrant consumed. All oldruns/source/evidence
remainunchanged,including R4HOLD/input/stopreceipt limitations and BProduction
HTTPNOTRUN. Three accepted S0edgeNOTRUN cases stay their localexceptions and
cannot close UM-Bpositivelegacycase. Migrations027–032 immutable/no-replay.
No reset/restore,Production,package/config/SQL/appchange or publication occurred.

Next appropriate work is an exact S0-only Solo release proposal:refresh candidate
base/allowlist/quality/target/032/rollback gates,separate A1/parity9 and account
for the Loginprop and mobile/evidence limits. Do not infer commit/push/deploy,
Productionpreflight/032application,extraAuth/fixtures/BOQwrites or amobilepatch.
This localPASS supports planning only;Owner must review release scope/limits
before any further system operation. Existing confirmed accounts/passwords/
Catalog/Factor/original businessdata remain protected.


R5closeout checks:22/22document contracts,570relative links/198anchors across
19Markdown,tracked/newfile whitespace PASS,indexempty/HEAD67 unchanged. All
171priorprotected/18sourcepins/549candidate files and216-entry aftermap match;
no unrelatedrepo change. Only5checkpoint/receiptMarkdown paths updated inrepo;
privatecloseout `/private/tmp/s0-r5-closeout-20261104` retains independentreview/
aftermap/finalchecks. Source101offline/build/quality results retain their
qualified dates;frozen pre-execution tests were not rerun against finalized
runtime paths. No newapp/package/config/SQL/build/install or laterDB/Auth/
Production/publication operation. R5grant consumed;releaseproposal only next.


## 10. S0 Solo release proposal — 2026-11-04

Owner continued with the stated next step:prepare the [exact local Solo plan](../../07_process/S0_SOLO_RELEASE_PLAN_20261104.md).
Proposed25paths are5qualifiedsource+20linkedMarkdown,without the9A1runtime/
test/mock paths,realUMrunners/privatefixtures/parity9/packages/config. The20
Markdown preserve handoff/link closure,not an A1 app release. Source publication
is followed by a separately explicit one-shot032 gate;no policy is active from
publishing SQL alone. Client rollback must never remove committed032guards.

Current authority is source/Markdown/prospective offline checks only,no hosted
access/DB/Auth/Docker/browser/fixtures/staging/commit/push/deploy or SQLchange.
Use that plan for exact preflight/window/UNKNOWN/ledger/rollback/Ownerdecisions.
Keep this checkpoint canonical for S0 actual evidence. R5staysclosed/scopedPASS,
mobileP2andrawFactor-evidence limits remain;Production032/actualreleaseNOTRUN.


Solo plan preparation checks:exact25paths(5source+20Markdown),fresh isolated
Node24.2.0 fullsuite801/61PASS,lint0errors/3unchangedwarnings,TypeScriptPASS.
All358nonMarkdown qualifiedfiles match;overall539/549match with10expected
reviewedMarkdown differences. Buildinputs unchanged,qualifiedTurbopack/R5
build reused;no newbuild/install/Docker/fixtures/calculation rerun. ExistingCI
stillNode22 and actualcommit/hostedchecks remainNOTRUN. Final20Markdownlink
closure581links/200anchors and22contracts/whitespace PASS;contentmanifest and
exclusions pinned privately. Source/DB/order/rollback independentreviewsPASS.
OnlylocalMarkdown changed inthis task;no hosted/DB/Auth or publication grant.

## 11. S0 short release plan review — 2026-11-05

Owner approved shortening the [existing Solo plan](../../07_process/S0_SOLO_RELEASE_PLAN_20261104.md)
locally only. Same25paths;032/five source paths/A1/parity/private evidence stay
unchanged. The proposed existing-MCP payload omits only outer BEGIN/finalCOMMIT
(15bytes),with source SHA592872b3…3fbd41f and payload
`9cc46a3d2fb4ef7dbc0bd2a0f1f1d12be445ee33d16e0cc50390f408766c5432`.
This supersedes Nov4's exact-file/no-outer-wrapper proposal only as a reviewable
plan;no payload execution approval or runtime PASS. Runner transaction
continuity for SET LOCAL/locks/DO remains OPEN before apply. Platform records
history;verify actual new version/name/statements plus preserved predecessors;
no custom INSERT/upsert/repair/psql/new guards or old-run replay is proposed.

Earlier Owner-approved bounded Nov5 reads:GitHub main/tree67 matched;Vercel
`dpl_FwQR53PBDgGATp3z5R962Hvw132Z` Ready/source67/Node24/main/auto-assignment;
one RR READ ONLY/ROLLBACK metadata request at2026-11-04T17:20:23Z
(Nov5 00:20:23 Bangkok) matched portable prehash1df6e90e…e0723,Copy031
508f7069…b68b2,15policies/31ledger/noS0guards and authenticated posture.
Three activity counts zero did not prove no activewriters or clear a future
write window. Supabase Management API later returned the intended projectURL;
it does not prove Vercel's masked env value. Revealing that value required
verification and was canceled before Send Code;OTP reveal is not an added
mandatory gate. Prior read grants consumed;no Production call in this edit.
Private dated evidence:`/private/tmp/s0-production-preflight-20261105-fgle7jsa`;
no raw responses/credentials/PII copied into repo. Original preflight HOLD on
executor remains factual;the short plan does not relabel it runtime PASS.

Current authority:Markdown/link/hash checks only;no DB/Auth/Docker/browser/
fixtures/Production/apply/stage/commit/push/deploy. R5desktopPASS/mobileP2/
threeedgeNOTRUN/BHTTPNOTRUN and all historical outcomes remain unchanged.

Short-plan checks:6existing documentation/source contracts PASS on Node24;
20Markdown/586relative links/201anchors/whitespace PASS. Only5Markdown paths
changed in this revision;five release source files and immutable032 unchanged.
The earlier fullsuite/lint/TypeScript/build keep their dates and were not rerun
for Markdown-only changes. Refreshed25-path manifest is local review evidence,
not staging or approval to publish.

## 12. S0 source publication approval — 2026-11-05

Owner explicitly approved steps1–2: update transaction-review documents and
manifest;fresh read-only preflight;stage/commit/push/deploy ONLY the exact25
S0paths;check CI/Vercel and anonymous no-write smoke;conditionalclientrollback
under the reviewed plan. Stop if preflight differs. Keep032immutable and DO NOT
apply032/changeDB/replay027–032/includeA1/parity9. This is a one-publication
grant;actual results/consumption must be recorded here,not inferred from approval.

Transaction contract review: DOCUMENTED_SUPPORTED_WITH_LIMITS. Pinned official
supabase/mcp5f0d393 forwards whole query through one explicit POST;official API
guide promises auto-history/rollback on schema failure. Wrapper-free payload
is supported normal use;SETLOCAL/locks/DO continuity is a vendor-contract
dependency,not observed runtime. Mock tests do not prove hosted backend.
No exactly-once or combined DDL/ledger/HTTP-ack atomicity claim. Actual032
payload runtime stays NOT RUN,with separate futureapplyapproval/postflight/
UNKNOWN/no-autoretry. No extra local BOQ fixture programme is required for
unchanged application source. Exact source/payload hashes remain in Solo plan.

Publication preflight/actualcommit CI/Vercel/anonymoussmoke: PENDING at this
prospective checkpoint update. Runtime/DB/032 execution remains outside scope.
