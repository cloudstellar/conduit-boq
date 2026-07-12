# Master Catalog Phase 4 WP-6.6 Owner Review Note

**Status:** Hold under P-22 operator-workflow correction; source/static passed
on `ac31feb` and G1 Local DB/concurrency/P-20 input passed on `e463270`.
G2 clean rebuild/comparison, browser evidence, and G3 owner closeout are pending
**Review environment:** Local only
**Current G1 evidence commit:**
`e463270dfb9f23332559f31591cf338b8eeada3c`
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

Recorded owner response:

> Hold WP-6.6 closeout; implement P-22 one-current-base-working-draft,
> audited abandon, item-first workspace, and final snapshot review before
> publication. Require fresh Local evidence and owner review before WP-7.

## 2. Evidence summary

| Scope | Passed evidence | Remaining later gate |
|---|---|---|
| C-01 browse/history | 1,201-row paging fixture; Local 710-row first/middle/last search; exact item and stable identity/code history | Independent operator comprehension at WP-8 |
| C-02 draft targeting | Source/static passed on `ac31feb`; G1 on `e463270` passed concurrent-create single winner, replay/mismatch/role denial, audited abandon/replay/replacement, retained immutable history, and zero working drafts after cleanup | G2 independent rebuild and browser operator comprehension required |
| C-03/C-04 authority/allocator | 710 mappings, 65 groups, 17 exclusions; unknown/caller-code denial; concurrent unique allocation; never-reuse; sequence-900 boundary | Rerun in WP-8 |
| C-05 import evidence | Complete 710-row rollout, 709 structured changes plus approved `ITEM-0139`, stable validation replay, explicit import draft selection | Full intended-admin import UAT at WP-8 |
| C-06/C-07 provenance | Authenticated publisher snapshot; physical archive reference; invalid-date and missing-archive denials | Final candidate metadata/P-15 |
| C-08 readiness | Shared full 710-row quality result, exact count/hash, successful Local publication proof, pointer restored | Final candidate and WP-8 rerun |
| C-09/C-10 correction | Retire/reactivate, eligible withdraw, inherited-withdraw denial, preserved identity/code/audit, exact browser item action | P-19 if an official version contains inactive rows |
| C-11/C-12 schema/UX | P-22 item-first/two-step-abandon source UI passed on `ac31feb`; G1 constraints/RLS/grants/role denial, DB lint, and security advisors passed on `e463270` | Replacement browser QA plus formal accessibility, performance, and independent UAT remain |
| C-13 final review | Identity-based final diff, compound/reverted/incomplete/lock fixtures, exact-lock review route, and return context passed source/static on `ac31feb`; G1 exact-lock publish/restore passed on `e463270` | G2, stale-review/browser evidence, and owner browser acceptance required |

## 3. Retained evidence

Current G1 evidence files remain untracked under `tmp/` by repository policy:

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

G2 must independently clean-rebuild exact `e463270` before running the
comparator. The initial G1 reset preceded the bounded harness cleanup at
`17ec6cc` and date-parser volatility correction at `e463270`; final harnesses,
lint, advisors, invariant readback, and repository checks ran on `e463270`.

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

## 4. Scope not accepted by this review

- Migration `020` is not yet part of `scripts/bootstrap-local-db.sh`.
- P-18 placement governance and migration `021` remain pending.
- P-19 remains pending for an official PDF containing inactive/retired rows.
- WP-7 permanent BOQ/hotfix `016`/Factor F regression execution has not begun.
- WP-8 independent intended-admin UAT, accessibility, performance, advisors,
  audit, and full clean rehearsal remain pending.
- Production P-12 through P-15 remain not requested and not authorized.

## 5. Recommendation

Keep WP-6.6 on Hold. The source/static P-22 checkpoint is complete on
`ac31feb` and G1 passed on `e463270`. The next decision is G2 approval or
decline for one independent destructive clean Local rebuild and P-20
comparison. Do not run that reset, add migration `020` to bootstrap, begin
WP-7, or infer browser/G3 acceptance until the applicable later owner gates are
explicitly accepted.
