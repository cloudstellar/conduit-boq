# Master Catalog Phase 4 WP-6.6 Owner Review Note

**Status:** Accepted and closed. The owner accepted G3/WP-6.6 on exact
application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1` at
2026-07-14 23:50 +07 after the G3 real-route walkthrough and P-26
high-impact human-intent guard proof passed. P-25 repository/static and
approved standalone Local visual evidence also passed.
Earlier
source/G1/browser/P-23 checkpoints remain historical. P-24 base and closure
lineage are preserved at `88d0711`/`050c998`; the separately owner-approved
G1R and independent G2 clean DB/concurrency/P-20/advisor gates passed on exact
execution checkout `721c2c2`; bounded browser QA passed at G1R. Migration `020`
remained outside bootstrap through this P-27 closeout. P-28 later approved its
unchanged bootstrap source inclusion; clean integrated execution is pending,
and Production remains unauthorized.
**Review environment:** Local only
**Historical P-22 G1 evidence commit:**
`e463270dfb9f23332559f31591cf338b8eeada3c`
**Pre-P-23 operator/source checkpoint:**
`c8f6dca282cd2729ac2b58e488b3ef516fb29713`
**P-24 base implementation checkpoint:** `88d0711` (repository/static verification passed 2026-07-13)
**Pre-closure documentation checkout:** `2ca4859` (must not be relabeled as the final G1R execution checkout)
**P-24 closure-lineage checkpoint:** `050c998361f3372bd3bf9fb6645dc4abd1c0bf2b`
**Current migration `020` SHA-256:** `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`
**G1R execution checkout:** `721c2c2c4a234a4fd00e5686383be9af87ee15dd`
**G2 execution checkout:** `721c2c2c4a234a4fd00e5686383be9af87ee15dd`
**G3 source HEAD:** `6599c306207c2d1e15342c398888b56513f9bb0a`
**P-26 source base HEAD:** `2fd438dd3417850faca572b9e5e5561e944df345`
**Accepted G3/WP-6.6 application checkpoint:**
`78e96ab3ed9993707014c4aba1d285b7592b17a1`
**Correction source checkpoint:**
`ac31feb`
**Historical implementation/evidence commit:**
`3bfc74ea00843033ad3cfd2afac43820b18c0124`
**Local auth guard commit:**
`59b17d3c3e7ed6180445ac5dc5e0b75db9fe9452`
**Production touched:** No

## 1. Decision recorded

The owner placed WP-6.6 closeout on Hold after intended-operator review found a
reproducible workflow gap beyond Audit #29 C-01 through C-12: multiple mutable
current-base drafts do not match the intended V1 operating model, and the
publish form precedes the full item workspace without an authoritative final
draft-versus-base comparison.

P-22 accepts [Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md)
for docs and Local-only implementation planning. Revised closeout must also
close C-13 and rerun the affected migration/DB/browser/P-20 evidence. This does
not authorize WP-7 execution, P-18/`021`, P-19, a new Factor F workflow, hotfix
`016` expansion, or any Production action. The initial P-22 decision did not
authorize a Local reset; the owner later approved G1 separately. G2 was also
approved later as a separate decision and is recorded below.

On 2026-07-13 the owner approved P-23 after intended-admin review found four
remaining composition risks: Master Catalog dropped the persistent signed-in
operator identity; global navigation mixed information destinations with the
draft-specific import action; import required a redundant second draft choice;
and generic Excel/PDF labels could imply a round trip that the approved import
profile does not support. P-23 is UI/route/documentation work only. Migration
`020`, G1 DB evidence, Production, Factor F, hotfix `016`, P-18, and P-19 are
unchanged.

On 2026-07-13 the owner then approved P-23.1 after review established that the
system cannot know annual versus revision versus patch from the current version
alone. The correction requires explicit business intent, an owner-designated
annual year, complete all-status reservation planning, DB next-sequence
enforcement, and same-year annual recovery after a lower identifier is void. It
also opens the exact created draft, places items before detailed metadata, and
confirms current/target before pointer restore. Because candidate `020` changes,
the former G1 evidence no longer proves the executable candidate.

On 2026-07-13 the owner approved P-24 after the pre-G1R audit found a remaining
business range and recovery gap. The correction enforces annual base +1 through
+10 in UI/server/DB, allowlists stale/range failures into Thai copy, keeps the
focused error visible while registry data refreshes, collapses technical
identifiers, removes internal workflow labels, contextualizes the first-rollout
authority message, and keeps Factor F secondary. It does not authorize a reset
or any adjacent scope.

Later on 2026-07-13 the owner explicitly approved G1R. The final clean Local
bootstrap through `019`, separate candidate `020` apply, WP-6.6 and WP-6.5/P-20
harnesses, advisors, repository gates, and bounded admin browser flow passed on
exact execution checkout `721c2c2`. Diagnostic runs first exposed stale harness
assumptions and missing FK covering indexes; each was fixed forward without
weakening the product guards. This G1R approval and result does not infer G2,
G3/G4, bootstrap inclusion, WP-7, P-18/P-19, Factor F/hotfix work, or
Production.

Later on 2026-07-13 the owner explicitly approved independent G2. A second
clean bootstrap through `019`, separate unchanged `020`, WP-6.6/WP-6.5
evidence, G1R-versus-G2 P-20 comparison, current advisor triage, repository
gates, and final invariant readback passed on the same exact candidate
`721c2c2`. G2 did not repeat browser acceptance because its purpose was
independent DB/reproducibility proof. G2 does not infer G3/G4, bootstrap
inclusion, WP-7, or Production.

On 2026-07-14 the owner approved the bounded P-26 correction after a final
owner/developer review found that exact-lock/readiness controls protected data
integrity but did not provide a distinct human-intent barrier for every
high-impact action. Recode and Retire now show exact summary dialogs. Publish
shows current/target version, reviewed lock, item count, BOQ effect, and
requires the target version to be typed and independently compared with the
DB-read version before the RPC. The no-reset Local proof passed and cleanup
restored the disabled baseline. This does not change `020` or infer G3/G4,
WP-7, Factor F/hotfix work, or Production approval.

At 2026-07-14 23:50 +07, after P-26 was committed, the owner accepted the
bounded G3/WP-6.6 closeout on exact application checkpoint
`78e96ab3ed9993707014c4aba1d285b7592b17a1`. This closes Audit #29 C-01
through C-17 for WP-6.6. It does not authorize G4, a Local reset, adding
`020` to bootstrap, WP-7, P-18/`021`, P-19, WP-8 execution, feature
enablement, publication, Factor F/hotfix expansion, or Production.

Recorded owner response:

> Hold WP-6.6 closeout; implement P-22 one-current-base-working-draft,
> audited abandon, item-first workspace, and final snapshot review before
> publication. Require fresh Local evidence and owner review before WP-7.

Final recorded owner response:

> Accept G3/WP-6.6 on exact application checkpoint
> `78e96ab3ed9993707014c4aba1d285b7592b17a1`; keep G4, Local reset,
> bootstrap/WP-7, and Production as separate approval gates.

## 2. Evidence summary

| Scope | Passed evidence | Remaining later gate |
|---|---|---|
| C-01 browse/history | 1,201-row paging fixture; Local 710-row first/middle/last search; exact item and stable identity/code history | Independent operator comprehension at WP-8 |
| C-02 draft targeting | Final G1R/G2 on `721c2c2` passed concurrent-create single winner, replay/mismatch/role denial, one-draft precedence, audited abandon/replay/replacement, immutable retained history, and zero working drafts after cleanup. G3 then created one real-route proof draft, audited-abandoned it at lock 3, retained all 710 rows read-only, and restored zero working drafts. | Accepted for WP-6.6; rerun in WP-8 |
| C-03/C-04 authority/allocator | 710 mappings, 65 groups, 17 exclusions; unknown/caller-code denial; concurrent unique allocation; never-reuse; sequence-900 boundary | Rerun in WP-8 |
| C-05 import evidence | Complete 710-row rollout, 709 structured changes plus approved `ITEM-0139`, and stable validation replay passed. P-23 exact-draft route/no-second-selector browser proof passed; QA also caught and fixed cross-version import-history leakage by scoping the read to exact `version_id`. | Binary upload/apply was not repeated in P-23; full intended-admin import UAT remains WP-8 |
| C-06/C-07 provenance | Authenticated publisher snapshot; physical archive reference; invalid-date and missing-archive denials | Final candidate metadata/P-15 |
| C-08 readiness | Shared full 710-row quality result, exact count/hash, successful Local publication proof, pointer restored | Final candidate and WP-8 rerun |
| C-09/C-10 correction | Retire/reactivate, eligible withdraw, inherited-withdraw denial, preserved identity/code/audit, exact browser item action | P-19 if an official version contains inactive rows |
| C-11/C-12 schema/UX | G1R/G2 passed final `020` constraints/grants, two authority FK indexes, DB lint/current advisor triage, and P-20 comparison; G1R passed Thai account/navigation/item/import/review/restore flow and bounded desktop/mobile layout. G3 independently passed the real-route stale-recovery and clean-closeout path. | Accepted for WP-6.6; formal keyboard traversal, measured performance, and independent UAT stay in WP-8 |
| C-13 final review | G1R/G2 passed identity-based complete diff/readiness/exact-lock publication and restore invariants; P-25 passed 27/27 compound/high-volume checks. G3 then bound final review to lock 1, advanced the draft to lock 2 from another real route, rejected the stale publish with the expected Thai recovery message, retained entered publication fields, created no publish change set, and reloaded the latest lock. | Accepted for WP-6.6; broader UAT stays WP-8 |
| C-14 version intent/reservation | G1R/G2 live sequence/race/replay/one-draft/abandon/replacement cases passed; G3 used explicit correction intent and permanently reserved abandoned Local proof version `2568.0.2` as designed. | Accepted for WP-6.6; rerun in WP-8 |
| C-15 create/item/restore flow | G1R/G2 passed the DB/repository contract and bounded browser route; G3 independently used the real create, exact workspace, item edit, final review, and audited-abandon routes. | Accepted for WP-6.6; full independent UAT stays WP-8 |
| C-16 pre-G1R business/UX guard | Final G1R/G2 contracts and P-25 presentation passed. G3 independently observed durable Thai stale recovery, retained form values, explicit Local/account context, and clean disabled-gate closeout. | Accepted for WP-6.6; formal accessibility stays WP-8 |
| C-17 high-impact human-intent guard | P-26 source/tests and real-route no-reset Local evidence passed. Recode and Retire showed exact item/target/reason/BOQ-audit summaries and were cancelled. Publish blocked mismatched `2568.0.2`, enabled exact DB-owned `2568.0.3`, and was cancelled without publication. Desktop and 390x844 layouts passed after title clearance; proof draft was audited-abandoned and all flags returned false. | Accepted for WP-6.6; repeat the final supported workflow during WP-8 UAT |

## 3. Retained evidence

Historical G1 evidence files remain untracked under `tmp/` by repository policy:

| Evidence | File SHA-256 |
|---|---|
| `tmp/master-catalog/wp66-evidence/20260712-g1-p22-e463270.json` | `9ccfe240772cb75b4103534d44c12d39600e2ead0ff699020ac5b6751056392d` |
| `tmp/master-catalog/wp65-evidence/20260712-g1-p22-e463270.json` | `d4750d495adf660c3938062dd0e2e1922d350f72fb7fcb8503afb895f211ec5a` |

Both name exact commit `e463270dfb9f23332559f31591cf338b8eeada3c`.
The G1 P-20 input reproduced:

- baseline `2568.0.0`, 710 rows;
- dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`;
- identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`.

P-23.1 changes candidate `020`, so the files below cannot serve as G1R/G2
evidence for the amended executable candidate. The initial G1 reset preceded the bounded
harness cleanup at `17ec6cc` and date-parser volatility correction at
`e463270`; final G1 harnesses, lint, advisors, invariant readback, and repository
checks remain truthfully attached to `e463270`. Migration `020` did not change
in the first P-23 UI checkpoint but changes under P-23.1.

The following historical files continue to prove the named `3bfc74e`
implementation, but they do not close the revised P-22 candidate:

| Evidence | File SHA-256 |
|---|---|
| `tmp/master-catalog/wp66-evidence/20260712-clean-a-3bfc74e.json` | `be9ffe9b0f9dc597e6152ec6151388df1b761598b2bb5a0f1b96f334ebcc2552` |
| `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-a-3bfc74e.json` | `e3919de8dbb313d85a24025c7388d0c3a6a91d353cad90c0c75eb9c73a57587e` |
| `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-b-3bfc74e.json` | `4d3158cfa254f47527ccaa347a8ec4738c11c70bac83b68382f6b9242e2738da` |

The post-`020` comparator passed with no failures on the same reviewed commit:

- baseline: `2568.0.0`, 710 rows;
- dataset hash:
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`;
- identity mapping SHA-256:
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- authority SHA-256:
  `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`.

Final Local cleanup restored:

- current pointer `2568.0.0`;
- 710 pointer rows with the approved P-20 hash;
- zero working drafts;
- `catalog_admin_enabled=false`;
- `catalog_new_identity_enabled=false`;
- `catalog_retirement_enabled=false`;
- 198 BOQs/1,547 BOQ items and Factor F `2569.0.0`/36 rows unchanged;
- Production touched: No.

The pre-G2 `c8f6dca` checkpoint additionally passed 30 test files/152 tests,
TypeScript, lint with no errors/10 existing warnings, production build, and
desktop/mobile operator preflight. Browser logs had no application error; the
existing `/nt_logo.svg` LCP warning remains for later performance review.

The P-23 working-tree checkpoint then passed 30 test files/154 tests,
TypeScript, lint with no errors/10 existing warnings, production build, and
desktop/mobile browser QA. It added persistent account context, information-only
global navigation, exact-draft import, explicit review-export semantics, and a
three-state import flow. Browser QA found and fixed prior-version import history
appearing in a new draft. The proof draft was audited-abandoned; final Local
readback restored pointer `2568.0.0`/710 rows, zero drafts, all flags false, 198
BOQs/1,547 items, and Factor F `2569.0.0`/36 rows. Production touched: No.

### Final G1R/G2 evidence

G1R/G2 evidence remains untracked under `tmp/` by repository policy:

| Gate | Evidence | File SHA-256 |
|---|---|---|
| G1R | `tmp/master-catalog/wp66-evidence/20260713-g1r-p24-721c2c2.json` | `98eca768bfc8334bcf6fe4ee423468bae74f69a1d5bc39ae7bdcb6d100c2e7a8` |
| G1R | `tmp/master-catalog/wp65-evidence/20260713-g1r-p24-721c2c2.json` | `aa6791ff6b06359cb857ae3e8e2aea1504f93ee2fe34fa5da2bd7d6666053280` |
| G2 | `tmp/master-catalog/wp66-evidence/20260713-g2-p24-721c2c2.json` | `d5da2ceeb5871160ac8cdf8dfe34ffdee220e20c8880e001e42c0bbaaea13f43` |
| G2 | `tmp/master-catalog/wp65-evidence/20260713-g2-p24-721c2c2.json` | `98b9f5fb9e0135ea35a716c87e1f4916e7aa1d186ce68ed067ea02d81b0bce42` |

All four name exact checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd` and
`productionTouched=false`. Both final-candidate runs reproduced baseline
`2568.0.0`/710 rows, dataset hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
identity mapping SHA-256
`5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`,
and authority 710/65/17 with SHA-256
`28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`.
The G1R-versus-G2 comparator confirmed the same reviewed commit and no
failures.

Final DB lint had no schema errors. The current G2 Studio rules reported eight
triaged authenticated-callable `SECURITY DEFINER` warnings: seven baseline RPCs
and one active-admin/feature-flag-guarded Master Catalog readiness facade; all
deny anon. Performance retained 24 baseline policy warnings and seven baseline
unindexed-FK information findings; the two new authority FKs are covered.
WP-8 must record final least-privilege/performance disposition, especially for
baseline `get_user_role` and `is_admin`. Repository gates passed 30 test
files/161 tests, TypeScript, lint with 0 errors/10 existing warnings, authority
check, `audit:prod` with 0 vulnerabilities, production build, smoke checks, and
`git diff --check`.

Browser evidence covered the Local/admin context, revision planning, complete
710-row workspace and first/middle/last search, exact `ITEM-0355` edit, complete
before/after review, exact-draft import, audited abandon, and cancelled restore
confirmation. The mobile page had no page-level horizontal overflow and kept
the wide comparison table in its intended scroll container. Focus-visible on
the labelled review search was verified; full keyboard traversal was not
claimed. The only console warning was the existing `/nt_logo.svg` LCP warning.

Final G2 cleanup retained pointer `2568.0.0`, 710 current rows, zero working
drafts, all three catalog flags false, 198 BOQs/1,547 BOQ items, Factor F
`2569.0.0`/36 rows, and no Production access or write.

### 3.1 G3 intended-admin technical walkthrough

The bounded no-reset G3 walkthrough passed on source HEAD
`6599c306207c2d1e15342c398888b56513f9bb0a` using intended Local admin
`local.admin@ntplc.co.th` and the real admin routes. The in-app Browser was
selected first but rejected `localhost` under its URL policy; the previously
owner-approved Playwright fallback drove the actual Next.js application and
Local Supabase API.

The admin created correction draft `2568.0.2`, saved `ITEM-0001` at lock 1,
held that final-review page open, and saved a second edit at lock 2. The stale
lock-1 publish request was rejected with the expected Thai instruction to load
the latest data and review again. All entered publication fields remained
visible, no `publish` change set was created, and the pointer did not move. A
fresh review loaded lock 2. The draft was then audited-abandoned through the UI
at lock 3 and retained as read-only history.

Final Local readback: pointer `2568.0.0`/710, zero working drafts, proof change
sets `clone=1`, `manual=2`, `abandon=1`, `publish=0`, all three catalog flags
false, BOQ 198/1,547, Factor F `2569.0.0`/36, five required constraints, valid
one-draft index, two authority FK indexes, and zero nullable required columns.
Evidence is retained untracked under
`output/master-catalog/g3-owner-review/20260714-6599c30-stale-after-review/`.
Production touched: No.

P-26 then used real Local routes without a reset. Proof draft `2568.0.3` was
never published and ended audited-abandoned at lock 2 with
`clone=1`, `manual=1`, `abandon=1`, `publish=0`. Final pointer, draft count,
flags, BOQ, and Factor F matched the baseline above. Screenshots, checksums,
and cleanup report are retained untracked under
`output/master-catalog/g3-owner-review/20260714-p26-human-intent/`.

## 4. Scope not accepted by this review

- Migration `020` is not yet part of `scripts/bootstrap-local-db.sh`.
- P-18 placement governance and migration `021` remain pending.
- P-19 remains pending for an official PDF containing inactive/retired rows.
- WP-7 permanent BOQ/hotfix `016`/Factor F regression execution has not begun.
- WP-8 independent intended-admin UAT, accessibility, measured performance,
  final advisor disposition, audit rerun, and full clean rehearsal remain
  pending.
- Production P-12 through P-15 remain not requested and not authorized.

## 5. Decision outcome

The owner **accepted G3** on exact checkpoint
`78e96ab3ed9993707014c4aba1d285b7592b17a1`. Stale review and typed-version
guards failed closed, the high-impact dialogs expose the exact result before
mutation, no publication occurred, and both Local walkthroughs returned the
pointer and flags to the required baseline.

Broader binary import, accessibility, and measured performance remain WP-8.
Even after G3 acceptance, G4/bootstrap inclusion is a separate gate. Do not run
another reset, add migration `020` to bootstrap, begin WP-7, or infer
Production acceptance until the applicable later owner decisions are recorded.

**Subsequent P-28 decision (2026-07-15):** the owner later approved adding
unchanged accepted `020` to bootstrap source and implementing the WP-7 harness
without running either destructive Local bootstrap or live WP-7 evidence. This
follow-up does not rewrite the P-27 point-in-time scope above. G4 repository
integration is authorized; clean execution, WP-7 pass/fail, WP-8, and every
Production gate remain separate.

**Subsequent P-29/G4E result (2026-07-15):** after G4R was committed and
pushed, the owner separately approved one warned Local-only reset. Exact
checkout `15b707d443bec701f6b3a86aa7675ca1266604ba` passed the combined
`009`-`020` bootstrap and live WP-6.6/WP-6.5/P-20/WP-7 evidence, with final
pointer/flags/BOQ/Factor F cleanup. This does not rewrite the P-27/P-28
point-in-time boundaries or infer WP-7 owner acceptance, WP-8, or Production.

**Subsequent P-30 decision (2026-07-15 01:37 +07):** the owner accepted WP-7
and all five P-18 V1 rules, then authorized bounded WP-7.5 Local-only source
implementation. This does not rewrite this note's P-27 point-in-time scope and
does not authorize `021` bootstrap inclusion, Local apply/reset evidence,
WP-8, P-19, Factor F/hotfix expansion, or Production.

**Subsequent P-32 result (2026-07-15):** the owner later authorized the warned
Local reset, separate amended `021` apply, and same-scope live gate. Replacement
DB/RLS/concurrency/hash/export/browser evidence passed after the fail-closed
`42704` fix-forward, and final Local invariants were restored. This remains
outside the P-27 point-in-time scope; P-33 owner acceptance, `021` bootstrap
inclusion, WP-8, and Production are still separate.
