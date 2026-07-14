# Master Catalog Phase 4 WP-6.6 Owner Review Note

**Status:** Hold pending G3 intended-admin closeout; P-25 repository/static and
approved standalone Local visual evidence passed 2026-07-14. Earlier
source/G1/browser/P-23 checkpoints remain historical. P-24 base and closure
lineage are preserved at `88d0711`/`050c998`; the separately owner-approved
G1R and independent G2 clean DB/concurrency/P-20/advisor gates passed on exact
execution checkout `721c2c2`; bounded browser QA passed at G1R. Migration `020`
remains outside bootstrap and Production.
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

Recorded owner response:

> Hold WP-6.6 closeout; implement P-22 one-current-base-working-draft,
> audited abandon, item-first workspace, and final snapshot review before
> publication. Require fresh Local evidence and owner review before WP-7.

## 2. Evidence summary

| Scope | Passed evidence | Remaining later gate |
|---|---|---|
| C-01 browse/history | 1,201-row paging fixture; Local 710-row first/middle/last search; exact item and stable identity/code history | Independent operator comprehension at WP-8 |
| C-02 draft targeting | Final G1R/G2 on `721c2c2` passed concurrent-create single winner, replay/mismatch/role denial, one-draft precedence, audited abandon/replay/replacement, immutable retained history, and zero working drafts after cleanup; G1R also passed browser abandon. | G3 owner closeout required |
| C-03/C-04 authority/allocator | 710 mappings, 65 groups, 17 exclusions; unknown/caller-code denial; concurrent unique allocation; never-reuse; sequence-900 boundary | Rerun in WP-8 |
| C-05 import evidence | Complete 710-row rollout, 709 structured changes plus approved `ITEM-0139`, and stable validation replay passed. P-23 exact-draft route/no-second-selector browser proof passed; QA also caught and fixed cross-version import-history leakage by scoping the read to exact `version_id`. | Binary upload/apply was not repeated in P-23; full intended-admin import UAT remains WP-8 |
| C-06/C-07 provenance | Authenticated publisher snapshot; physical archive reference; invalid-date and missing-archive denials | Final candidate metadata/P-15 |
| C-08 readiness | Shared full 710-row quality result, exact count/hash, successful Local publication proof, pointer restored | Final candidate and WP-8 rerun |
| C-09/C-10 correction | Retire/reactivate, eligible withdraw, inherited-withdraw denial, preserved identity/code/audit, exact browser item action | P-19 if an official version contains inactive rows |
| C-11/C-12 schema/UX | G1R/G2 passed final `020` constraints/grants, two authority FK indexes, DB lint/current advisor triage, and P-20 comparison; G1R passed Thai account/navigation/item/import/review/restore flow and bounded desktop/mobile layout. | Formal keyboard traversal, measured performance, and independent UAT at WP-8/G3 |
| C-13 final review | G1R/G2 passed identity-based complete diff/readiness/exact-lock publication and restore invariants; G1R browser showed the exact before/after `ITEM-0355` one-field change and cancelled restore confirmation without moving the pointer. P-25 retained that contract and passed 27/27 approved standalone Local checks for an eight-field compound row and 710 total/709 affected rows at desktop/mobile sizes. | Independent real-route stale-after-review UAT and G3 owner acceptance |
| C-14 version intent/reservation | G1R/G2 live sequence/race/replay/one-draft/abandon/replacement cases passed; G1R browser planned and opened system-reserved revision `2568.7.0`. | G3 owner acceptance |
| C-15 create/item/restore flow | G1R/G2 passed the DB/repository contract; G1R browser opened the exact draft workspace, searched first/middle/last rows, edited an exact item, reviewed the whole snapshot, opened exact-draft import, and inspected current-to-target restore confirmation. | Independent UAT/G3 acceptance |
| C-16 pre-G1R business/UX guard | Final G1R/G2 migration/helper contracts, safe error mapping, durable focus contracts, contextual authority, accessibility labels, and advisors passed on `721c2c2`; bounded browser flow passed at G1R. | Formal G3/WP-8 operator/accessibility acceptance |

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

## 4. Scope not accepted by this review

- Migration `020` is not yet part of `scripts/bootstrap-local-db.sh`.
- P-18 placement governance and migration `021` remain pending.
- P-19 remains pending for an official PDF containing inactive/retired rows.
- WP-7 permanent BOQ/hotfix `016`/Factor F regression execution has not begun.
- WP-8 independent intended-admin UAT, accessibility, measured performance,
  final advisor disposition, audit rerun, and full clean rehearsal remain
  pending.
- Production P-12 through P-15 remain not requested and not authorized.

## 5. Recommendation

Keep WP-6.6 on Hold only for G3 intended-admin closeout. G1R/G2 and the P-20
comparison are accepted as passed technical evidence on exact checkout
`721c2c2`; P-25 has now proved that the unchanged identity diff is readable for
an eight-field compound row and the expected 709-change rollout at desktop and
mobile sizes. G3 should emphasize independent real-route stale-after-review
recovery and operator comprehension; broader binary import, accessibility, and
measured performance remain WP-8. Do not run another reset, add migration `020` to
bootstrap, begin WP-7, or infer G4/Production acceptance until the applicable
later owner gates are explicitly accepted.
