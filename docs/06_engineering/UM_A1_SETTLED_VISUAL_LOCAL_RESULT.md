# UM-A1 — Settled desktop/mobile local visual review

Date:2026-11-02 (Asia/Bangkok). **LOCAL VISUAL PASS / CUSTODY AND CLEANUP PASS.**

## Authority

Owner explicitly approved section14: one existing local Admin in one new
dedicated session, normal Auth bookkeeping, visual-only built-app review and
exact scope:local cleanup. The exception to R5 is limited to this task. No
profile/password/authority/business change, new fixture, reopening either
finalized run, reset/restore/schema/migration/replay027–031, Production or
staging/commit/push/deploy. This is not a release approval.

Use [UM#12 checkpoint/section14](../plans/product/12-user-management-um-a-and-um-b-plan.md#14-um-a1-settled-visual-review-approval-packet).
The [new18 receipt](UM_A1_REAL_DOCKER_LOCAL_RESULT.md) and its prior rejected
images/harness failure remain historical evidence. Existing31APIchecks and
13functional groups are not rerun to close this visual-only gap.

## Exact source and target

- Canonical checkout `/Users/cloud/Cloudstellar/conduit-boq`, main at
  `67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`, index empty; existing dirty A1
  candidate preserved.340existing source/protected-file hashes frozen before
  this task. No application edit is authorized.
- Actual Docker inspection: same DB ID
  `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966`,
  container/volume `supabase_db_conduit-boq-local`; Auth/REST/Kong all running;
  actual PostgREST binary14.5. Full graph/metadata/data custody passed beforeAuth.
- Native Node24.2.0/npm11.3.0/Next16.4.2 canonical default Turbopack build PASS,
  local2026-11-02 01:49:00–01:49:03,exit0 including TypeScript. Explicit API
  `http://127.0.0.1:55321` with existing local public key only; no credential
  values logged. Cache retained; not CI or a cold-build claim.
- Task-created canonical Next server:loopback `http://127.0.0.1:43181`.
- Private evidence: `/private/tmp/um-a1-visual-voUm6l/`.

## Current acceptance

| Check | Actual result |
|---|---|
| Source/protected freeze,build,initial container identity/version | PASS as above;application source unchanged |
| Fresh full target/metadata/selectedAdmin/custody baseline | PASS,143profiles/144Auth/identities,32table digests,26sessions/29refreshTokens/662Authaudits;exactOwneractive/admin;normal session defaults/JWT3600/FKcascade verified |
| Dedicated session/authentication | PASS,one new existingAdmin session;canonical v2/active/admin;no fixture or account transition |
| Visual-only tooling review | PASS,finalexecuted d7913cf7…;syntax/lint/dryrun/strictno-undef and independentread-onlyreview;first missing-import attempt retained below |
| Primary desktop/mobile resting and Sheet images | PASS,desktop001–011/mobile012–021;no residual dimming/duplicateheader;normalopenSheetbackdrop intentional |
| Boundary/reflow/status-label images | PASS,022–026 at320/768/1023/1024/1440;027–029 at640CSSpx/DPR2/reducedmotion;active/NULLtwoactualrecords truthful ondesktop/mobile |
| Root and independent per-image inspection before cleanup | PASS,29/29 originalPNGs opened/inspected byboth reviewers beforeaccept-all;no recapture/image editing needed |
| Browser/read-only mutation guards | PASS,0writeattempts/0blockednonlocalorigins/0routefailures/0pageerrors/0consolewarnings/errors |
| Scoped session cleanup/original-data postflight | PASS,0newsession/0newrefreshtoken;all32stabletableprojections/26oldsessions/29oldrefreshtokens/662oldAuthauditrows retained;only1login+1logout audit added |
| Production/CI/publication | NOT RUN / NOT AUTHORIZED |

The driver paused for actual PNG review before local session cleanup. Primary
desktop/mobile used separate fresh DPR1 contexts; edge/reflow contexts were
independent and sequential. No image editing, cropping or application/CSS fix
was used to obtain a passing picture. The previous resting-image gap is closed
by this new evidence; old rejected images/results remain unchanged.

## Execution chronology and exact files

The first invocation used driver46eff76d… and stopped before login at the first
report save: `writeFile` was referenced but missing from its imports. Syntax and
normal lint had not detected the undeclared JS identifier. No Auth/API/browser
request occurred in that invocation. Its source/empty reserved output and
`attempt-01-before-auth-failure.json` are retained; it is not relabeled PASS.

Only the missing import was corrected. Strict CLI-only `no-undef` checking was
added to verification, with browser callback globals declared in the command;
no ESLint/application/package configuration changed. The next invocation used
fresh output `browser-02`, with the same immutable pre-Auth custody baseline.

Actual session/capture/review interval: **2026-11-02 02:01:24–02:05:14 Bangkok**.
Installed Google Chrome **156.0.8078.76**, installed Playwright fallback because
Browser plugin/skill was absent. One Node Auth client with autoRefreshToken,
persistSession and detectSessionInUrl all false bootstrapped one fresh session
of exact existingAdminUUID `53b6ad55-fb88-40cf-9215-9fd5d95e7443`. Its session
`ecfa18bf-1d63-40fb-ad02-0afdc554df13` was absent from the26original session IDs.
Tokens/passwords/cookies remained in memory and were not put in the report.

The executable test source is
`scripts/test-um-a1-visual-local.mjs`; SHA-256
`d7913cf7ca7650804e675d36561c846f48159b3c3f6d86c0bd791bb68fb06a1d`.
Exact executed bytes are retained privately as `executed-visual-driver-02.mjs`.
Private read-only custody helper SHA
`bedefb6b592049c18f963ee4b36488c19787379d859d84cf0569f3efbc36ab04`.
It runs fixed SELECT/hash captures inside READ ONLY/ROLLBACK, never imports or
calls fixture runners, Admin/business RPCs or SQL writes.

Task file scope: this new driver, this result, canonical #12 checkpoint and
AGENTS/AI_HANDOFF pointers only. No pre-existing app/test/helper/fixture source,
closed manifest, package/lockfile, CI, global font/asset or SQL was edited.
Ignored build artifacts and private evidence are separate from release source.

Application fingerprints, unchanged from the accepted functional candidate:

| File | SHA-256 |
|---|---|
| `app/admin/page.tsx` | `6b5e83d1507f4232b8d74aa555c21d5d14e65a65fa389de2440fe3a7039c096a` |
| `lib/admin/users/directory.ts` | `c363f884e80178401f1e12b37f0a521e9cb4b60b0da73b7eaff67c4e64464d09` |
| `lib/admin/users/presentation.ts` | `528a460dd26855377e643dd160b8f5570b4abc75ace4462687717a3f9f619b96` |
| `app/admin/_components/AdminUsersDirectory.tsx` | `ca63e328c36654a838ee269ee87019d054cae85c0425d80bab9604c981a69a29` |
| `app/admin/_components/AdminUserDetailsSheet.tsx` | `1233a51aeeee7b81d1aa9a4038fb35875703f3662263f423152f0bfb76f51d8b` |

## Per-step visual evidence

Every listed PNG passed root and independent visual inspection. IDs identify
the original files in the private `browser-02` directory; `report.json` stores
their full names, dimensions, scroll/overlay state and SHA-256 values.

| Step | Images | Result and observed health |
|---|---|---|
|1—Desktop directory1280×900 |001top,002middle,003bottom,004full-page |PASS;clear table/columns,Thai/emailwrap,pagination;full-page overview checked alongside readable viewport captures |
|2—Desktop Sheet cycle |005open,006content-bottom,007post-close |PASS;fully settled Sheet,close/focus visible;post-close clear with restored pointer/focus;noextraAPIreads |
|3—Desktop tail/active-unassigned |008last-page-top,009last-page-bottom,010–011details |PASS;18rowslastpage/disabledNext;twoexistingactiveNULLprofiles truthfully active/unassigned,noautomaticrepair |
|4—Mobile390×844 directory |012top,013middle,014bottom |PASS;readable cards/wrapped email,controls fit,footer usable,no repeatedheaderstrip |
|5—Mobile Sheet cycle |015open,016content-bottom,017post-close |PASS;read-only details/header/close fit;post-close clean/nooverlay |
|6—Mobile tail/active-unassigned |018last-page-top,019last-page-bottom,020–021details |PASS;status/affiliation distinctions retained,footer andbothNULLdetails readable |
|7—Boundary views |022320px,023768px,0241023px,0251024px,0261440px |PASS;cards below1024/table at1024;no duplicate layouts/horizontalclipping;NT-yellow/gray/black frame consistent |
|8—Reflow/reduced motion |027640CSSpx/DPR2resting,028Sheetopen,029post-close |PASS;separatecontext,noresidualoverlay;focus/Escape/reducedmotion assertions passed |

Strengths observed: current primary IBM Plex Sans Thai faces loaded, readable
Thai labels and long emails, clear actual/requested/unassigned separation,
visible keyboard focus, and stable resting pages after closing the details
Sheet. No material visual blocker was found within this approved surface.
No redesign, global typography change or new brand acceptance was inferred.

Evidence limits: selected Sheet content fits the900/844px primary viewports,
so006/016 look identical to their top captures; they do not prove scrolling
overflowing contents to their bottom. The450CSSpx reflow Sheet image shows its
top. Chrome viewports/DPR emulation do not certify real mobile hardware/Safari,
actual browser zoom, audible screen readers or full WCAG compliance. Those
limits do not reopen the settled resting-image gap.

## Data, session and source custody

Before/during/after captures preserve the same exact DB/service graph and
relevant metadata digest
`cd0035a3742c2cc747b1a8da474791f089881e515fc432b38971bcff493a794d`,
including exact post031 Duplicate source. No fresh Production inference is made.
Auth startup/session-limit checks used the actual local container config and
[official Auth v2.190 configuration source](https://raw.githubusercontent.com/supabase/auth/v2.190.0/internal/conf/configuration.go).
The local Auth command has no config-dir override; single-user-session/timebox/
inactivity restrictions and automatic DB cleanup are not enabled,JWT3600.

During review: full original projections passed; exactly one new session and
one new refresh-token row belonged to the selected Admin/session, plus one login
audit. After both reviewers accepted all29PNGs, Node called only
`signOut({scope:'local'})`; [the matching Auth implementation](https://raw.githubusercontent.com/supabase/auth/v2.190.0/internal/api/logout.go)
selects that session for local logout. There was no UI/global/others logout.

Final independent SQL confirms:

- Full public/private business/profile/reference/authorization-event rows,
  Auth password/identity/stable data: all32table projections unchanged.
- Auth exceptions only normal `last_sign_in_at`/`updated_at` for the selected
  Admin and its identity mapping; all other Auth rows compared in full.
- Original26session rows/links,29refresh-token rows and662Authaudit rows retained
  with full-row digests; no old session was removed or changed.
- New review session and refresh-token rows: **0remaining**. Verified FK cascade
  supports the refresh-token deletion; no manual Auth/SQL deletion ran.
- Auth audit adds exactly **1login+1logout**, both selected Admin. Auth audit
  payload does not necessarily include sessionUUID, so attribution is bounded
  by actor/action/time while exact session ownership is proved independently.
- Counts remain143profiles/144Auth users/identities; BOQ34/routes66/items66,
  authorization events193 and private Copy ledger unchanged.
- Both finalized manifests remain byte-identical: old105 SHA`c1865de3…`,new18
  SHA`c7784afe…`; no creation,login,reactivation or lifecycle operation on them.

Private proof: `custody-before.json`, `custody-during.json`, `custody-after.json`,
`preflight.json`, `browser-02/report.json`, `root-image-review.json`,
`independent-image-review.json`, executed source and build/cleanup receipts.
The browser report intentionally ends `VISUAL_PASS_PENDING_ROOT_CUSTODY`;
`custody-after.json` supplies the independent finalPASS, without rewriting the
driver's original result. No screenshots were superseded or edited in this run.

## Closeout

Final checks: syntax/defaultdryrun/scopedlint plus CLI-only no-undef PASS;
28documentation contracts PASS;384relative links/50anchors across17Markdown
files anddiff/whitespace checks PASS.340pre-existing files rechecked,only
authorized AGENTS documentation changed within that source set;17protected
hashes unchanged. Executed driver/report/29PNG hashes verified,report contains
no credential/JWT values. HEAD unchanged,index unstaged.
Final browser-report SHA-256:
`1ccea2f1c8ee4a3067a95564140d518360703343676a2d53beb14053bdcf0b81`.

The scoped visual gap is **CLOSED by local evidence**. Both old fixture runs
stay closed. This task's dedicated session, isolated Chrome contexts and Next
server are closed; existing Docker remains running. Source/protected/doc checks
and final Git state are recorded in the canonical checkpoint.

This task grants no second session, new fixture/account, application repair,
S0/A2/UM-B execution, stage/commit/push/deploy or Production operation. Existing
845tests/31APIchecks/13functional groups remain their same-source dated evidence;
no functional mutation suite was repeated. B Production HTTP stays NOT RUN/closed.
Next: Owner review of this receipt and exact uncommitted candidate, then a bounded
Solo release proposal/preflight; this receipt itself does not authorize release.
