# Master Catalog Phase 4 WP-6.6 Owner Review Note

**Status:** Hold under P-22/P-23/P-23.1/P-24 correction. Earlier
source/G1/browser/P-23 checkpoints remain historical. P-24 further amends
candidate `020` and operator recovery before G1R. A new exact commit,
separately approved G1R and G2 clean rebuilds, browser owner review, and G3
closeout remain
**Review environment:** Local only
**Current G1 evidence commit:**
`e463270dfb9f23332559f31591cf338b8eeada3c`
**Pre-P-23 operator/source checkpoint:**
`c8f6dca282cd2729ac2b58e488b3ef516fb29713`
**Current exact executable candidate:** Pending P-24 implementation commit; repository/static verification passed 2026-07-13
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
authorize a Local reset; the owner later approved G1 separately. G2 still
requires a new explicit decision.

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

Recorded owner response:

> Hold WP-6.6 closeout; implement P-22 one-current-base-working-draft,
> audited abandon, item-first workspace, and final snapshot review before
> publication. Require fresh Local evidence and owner review before WP-7.

## 2. Evidence summary

| Scope | Passed evidence | Remaining later gate |
|---|---|---|
| C-01 browse/history | 1,201-row paging fixture; Local 710-row first/middle/last search; exact item and stable identity/code history | Independent operator comprehension at WP-8 |
| C-02 draft targeting | Source/static passed on `ac31feb`; G1 on `e463270` passed concurrent-create single winner, replay/mismatch/role denial, audited abandon/replay/replacement, retained immutable history, and zero working drafts after cleanup. Pre-G2 browser proof on `c8f6dca` created one working draft at a time and completed audited abandon/read-only history. | G2 independent rebuild and G3 owner closeout required |
| C-03/C-04 authority/allocator | 710 mappings, 65 groups, 17 exclusions; unknown/caller-code denial; concurrent unique allocation; never-reuse; sequence-900 boundary | Rerun in WP-8 |
| C-05 import evidence | Complete 710-row rollout, 709 structured changes plus approved `ITEM-0139`, and stable validation replay passed. P-23 exact-draft route/no-second-selector browser proof passed; QA also caught and fixed cross-version import-history leakage by scoping the read to exact `version_id`. | Binary upload/apply was not repeated in P-23; full intended-admin import UAT remains WP-8 |
| C-06/C-07 provenance | Authenticated publisher snapshot; physical archive reference; invalid-date and missing-archive denials | Final candidate metadata/P-15 |
| C-08 readiness | Shared full 710-row quality result, exact count/hash, successful Local publication proof, pointer restored | Final candidate and WP-8 rerun |
| C-09/C-10 correction | Retire/reactivate, eligible withdraw, inherited-withdraw denial, preserved identity/code/audit, exact browser item action | P-19 if an official version contains inactive rows |
| C-11/C-12 schema/UX | Earlier P-22/G1/P-23 item-first, Thai, schema, account, navigation, import, and export evidence is retained as historical. | Reverify amended `020` in G1R/G2 and run fresh P-23.1 desktop/mobile/browser owner review; formal keyboard/focus accessibility, measured performance, and independent UAT remain WP-8/G3 concerns |
| C-13 final review | Identity-based final diff, compound/reverted/incomplete/lock fixtures, exact-lock review route, and return context passed source/static on `ac31feb`; G1 exact-lock publish/restore passed on `e463270`; pre-G2 browser proof opened the cumulative comparison and readiness path on `c8f6dca` | G2, stale-review recovery proof, and G3 owner acceptance required |
| C-14 version intent/reservation | P-23.1 source implements three explicit business intents, complete-registry fail-closed planning, reserved-number display, annual void-number recovery, and guarded next-sequence errors; repository/static checks passed 2026-07-13 | Rerun live sequence/race/replay/abandon/replacement in G1R/G2; owner browser acceptance |
| C-15 create/item/restore flow | P-23.1 source opens the exact created workspace, renders compact context/actions before items, moves document metadata below items, and adds current-to-target restore confirmation | Fresh desktop/mobile/browser/BOQ-header smoke and G3 owner acceptance |
| C-16 pre-G1R business/UX guard | P-24 source enforces annual base +1 through +10 in UI/server/candidate `020`, adds safe stale/range mapping, durable focused Thai error feedback, collapsed support IDs, contextual authority copy, accessible pagination labels, and secondary Factor F context; repository/static gate passed 2026-07-13 | Exact implementation commit, then live range/stale/browser recovery in G1R/G2/G3 |

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

## 4. Scope not accepted by this review

- Migration `020` is not yet part of `scripts/bootstrap-local-db.sh`.
- P-18 placement governance and migration `021` remain pending.
- P-19 remains pending for an official PDF containing inactive/retired rows.
- WP-7 permanent BOQ/hotfix `016`/Factor F regression execution has not begun.
- WP-8 independent intended-admin UAT, accessibility, performance, advisors,
  audit, and full clean rehearsal remain pending.
- Production P-12 through P-15 remain not requested and not authorized.

## 5. Recommendation

Keep WP-6.6 on Hold. Commit the repository/static-passed P-24 tracked diff
before naming the executable candidate. Then request
G1R approval or decline for the first destructive clean Local rebuild/full
DB-browser-P-20 rerun; request independent G2 only after G1R passes. Do not run a
reset, add migration `020` to bootstrap, begin WP-7, or infer G3 acceptance until
the applicable later owner gates are explicitly accepted.
