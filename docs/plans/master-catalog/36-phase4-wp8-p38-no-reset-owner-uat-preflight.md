# Phase 4 WP-8 P-38 No-reset Owner UAT Preflight

**Status:** The tracked fail-closed tooling and inputs were prepared, committed,
and used for P-38. P39R-U Card A now passes: Local draft
`2568.5.0-D001` was audited-abandoned and replacement `2568.5.0-D002`
reclaimed target `2568.5.0` under a new immutable reference. The exploratory
Cards B-F then found UAT-01/UAT-02/UAT-03/UAT-04/UAT-05; Card F passed, but the
session used live developer collaboration and is not scored closure evidence.
Both drafts were audited-abandoned and cleanup restored the exact disabled
baseline without reset. Exact P-40 checkpoint
`dc83c35602fec81d124f43013824649664b8eecb` is committed and pushed. A
separate one-draft developer browser QA passed the corrected money, unit, and
withdrawal paths and returned to pointer `2568.0.0`/710, zero working drafts,
all flags false, BOQ 198/1,547, and Factor F `2569.0.0`/36 without reset. It is
not scored Cards A-G evidence. The fresh scored rerun remains pending and P-37
remains **HOLD**.

P-41 follows continued discovery: UAT-06 through UAT-08 corrected the
category-key bound, retirement-disabled read-only Full preview, and
post-withdraw order gap. Migration `025` SHA-256
`00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f`
is incrementally applied to the disabled Local baseline without reset and
exact pushed source `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` passes full
source verification and live WP-6.6 smoke. Owner-approved exact execution
source `adcca3939f3080cdf64bc6ad807051e9e85fed94` now passes the clean
`017`-`025` chain and final disabled-baseline readback. A new immutable scored
session may be prepared after this evidence update is committed and pushed.
The first such attempt on exact pushed
`2c39dddd10c361bd1244292f4bd79e06f167c919` failed closed before feature-flag
or session mutation because the Local category preflight referenced an
undefined `rows` helper. Immediate status confirmed pointer `2568.0.0`/710,
zero drafts, all flags false, BOQ 198/1,547, and Factor F `2569.0.0`/36. The
bounded correction consumes the nullable Supabase result array directly and
adds a regression assertion; a fresh session path remains required.

Exact pushed `d00c941ac11a271c2a149bc016da045cea870a26` then passed the
correction and prepared immutable session
`tmp/master-catalog/p38-owner-uat/session-p41-scored-20260719-d00c941.json`.
That session is now incident evidence, not a reusable scored session. Card A
issued Local `2568.5.0` from `2568.5.0-D002` and stopped under P-42 before
Cards B-G. Read-only status records zero working drafts, admin/new-identity
flags true, retirement false, BOQ 198/1,547, Factor F `2569.0.0`/36, and
Production untouched. See
[Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md).
Exact P-42 correction `b2500b5e6859a915bfa3f70d558934f252943f82`
passed and is pushed. A new session now requires a separately warned and
approved clean Local bootstrap first.

**Boundary:** Local only. This note itself authorizes no reset; the required
P-42 recovery bootstrap is a new owner gate. It does not authorize successful
publication, pointer movement during UAT, P-37 acceptance, P-19, Factor F work,
hotfix `016` expansion, Production feature enablement, or Production
access/write.

## 1. Why the E-01 recipe changed

The approved parser does not trust workbook names, units, or prices for a
source code already present in the frozen first-rollout mapping. It replaces
those workbook fields with the Production-derived authority row before the
server builds the diff. Therefore, changing only a mapped workbook price or
name cannot exercise `IMPORT_PRICE_AUTHORITY_REQUIRED`; that earlier proposed
recipe would have produced a false test.

E-01 now replaces mapped source code `CIC-PVC-001` with valid but unmapped
Local-only candidate code `CIC-PVC-998`. The remaining row fields stay equal
to the source. The parser must classify it as `candidate_add`, and the server
must reject the first review without an authority reference. After the Owner
enters `LOCAL-UAT-ONLY-NOT-AUTHORITY`, the server may review the diff, but the
missing original identity plus the two Card B identities are retirement
candidates. Retirement remains disabled, so the Apply action must stay
unavailable.

E-02 removes exactly 15 frozen-mapped workbook rows. After Card B leaves two
Local-only identities in the draft, the expected Full-import omission count is
17. The Owner must still enter the exact visible server count rather than rely
on this expectation.

## 2. Input manifest

All generated files remain untracked under `tmp/`; none is an authority or a
release artifact.

| Input | Rows | SHA-256 | Intended safe result |
|---|---:|---|---|
| `files/NT_Item_Code_Master_K_Mapping_2568.xlsx` | 708 raw; 710 after frozen supplemental context | `ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b` | Approved Full source; Production `2568.0.0` still owns names, units, and prices |
| E-01 `LOCAL-UAT-ONLY-NOT-AUTHORITY-E01-invalid-authority.xlsx` | 708 | `86eb347d2b1601a531d4f001cd31e556200f33228a11585bcfd516030e099eed` | First server review returns `IMPORT_PRICE_AUTHORITY_REQUIRED`; recovery review only; never Apply |
| E-02 `LOCAL-UAT-ONLY-NOT-AUTHORITY-E02-retirement-hold.xlsx` | 693 | `089393094b6bd5f46e1709acb5658a325deb99ec7824bb728ae43d0b035cd114` | First server review returns `IMPORT_RETIREMENT_APPROVAL_REQUIRED`; recovery review only; never Apply |
| `workbooks-ready/manifest.json` | N/A | `1296f1056f6c1cd768b23c5ac3e6c00462dce018c3bb7710f62c067ee0e63b92` | Tracked harness pins this manifest plus the source, frozen authority file/content, recipes, row counts, and derivative binary hashes |

The frozen authority remains 710 mappings, 65 code groups, and 17 source
exclusions with authority SHA-256
`28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`.

The workbook preparation used the bundled spreadsheet runtime, preserved the
source visual language, rendered every sheet, then performed a compatibility
save through the bundled LibreOffice runtime. The final changed sheets were
rendered again. The repository verifier subsequently runs the application's
actual workbook adapter and `nt-item-master-2568` profile through Vite over
every source/E-01/E-02 row, then independently opens the final files with
ExcelJS to compare every parser-required field, marker, and recipe against the
source. This distinction matters because approved Excel cells store
`source_row` and money as numeric values rather than formatted text.

## 3. Tracked Local harness

The tracked script is
`scripts/manage-master-catalog-p38-owner-uat.mjs`. Run it only from branch
`codex/master-catalog-phase4` after its exact checkpoint is pushed.

```bash
P38_SESSION="tmp/master-catalog/p38-owner-uat/session-$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD).json"
test ! -e "$P38_SESSION"
npm run db:local:p38:verify-inputs
npm run db:local:p38:status -- --session "$P38_SESSION"
npm run db:local:p38:prepare -- --session "$P38_SESSION"
```

`verify-inputs` reads files only, rejects any manifest/source/authority/E-01/
E-02 hash that differs from the tracked approved values, and requires the
application adapter/profile to normalize all 708/708/693 retained rows. P-41
also requires it to expose the positive shared 500-character category-key
contract. The later `prepare` command reads the live versioned category
dictionary before changing flags and fails when its longest key exceeds that
contract (current Local maximum 89).
`status` reads Local
Supabase only. `prepare` requires a clean tracked tree whose HEAD exactly
matches its configured pushed upstream, the verified manifest, exact disabled
baseline including the canonical dataset hash, zero working drafts, and an
active Local admin. It then enables only Local admin and new-identity
capabilities, keeps retirement disabled, records the actor/baseline/first-
middle-last search examples, and writes an untracked session record. It never
creates, edits, publishes, or abandons a draft.

Record `P38_SESSION` with the UAT evidence and use that exact path for every
later status/cleanup command. Session records are immutable; a retry uses a new
path rather than overwriting an earlier attempt.

After the Owner completes Card G:

```bash
npm run db:local:p38:cleanup -- --session "$P38_SESSION"
```

`cleanup` requires the same clean pushed HEAD used by `prepare`, zero working
drafts, and exactly two new audited attempts, both abandoned, non-default, and
unpublished. Under P-39 it also requires distinct immutable draft references,
null official tuples, and the same retained target for both attempts. With a
valid session, it attempts to restore the original flags
even when source-provenance or pre-cleanup assertions fail, and then refuses
evidence closure. A successful cleanup also requires the exact pointer,
dataset hash, 710 rows, BOQ/BOQ-item counts, Factor F pointer/rows, and disabled
flags. It does not abandon a draft on the Owner's behalf.

The script accepts only an `http` loopback Supabase origin, refuses paths
outside `tmp/master-catalog/p38-owner-uat`, and contains no draft/publication
RPC or reset command.

## 4. Evidence completed before the tracked checkpoint

1. Input verification passed: source 708, E-01 708, E-02 693, omitted mapped
   rows 15, frozen authority 710/65/17, and all binary hashes matched.
2. Read-only Local status passed: pointer `2568.0.0`, dataset hash
   `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
   710 rows, zero working drafts, all three flags `false`, BOQ 198, BOQ items
   1,547, zero unversioned BOQs, and Factor F `2569.0.0`/36.
3. A deliberate `prepare` attempt on the dirty tracked tree stopped before any
   Local client or feature-flag mutation. The read-only status remained the
   authority baseline.
4. No Local reset, draft mutation, publication, pointer movement, Production
   action, Factor F change, or hotfix work occurred.
5. Focused parser/server/authority checks passed 3 files/17 tests; the full
   suite passed 33 files/185 tests; script syntax, TypeScript, lint with 0
   errors/10 existing warnings, frozen authority 710/65/17, input verification,
   pinned-hash/provenance/cleanup safety contracts, and diff check passed. No
   build rerun was required because application, dependency, and migration
   source are unchanged; the `package.json` change adds command aliases only.

Production touched: **No**.

## 5. P39R-U exploratory result and next safe step

Cleanup on 2026-07-18 restored pointer `2568.0.0`/710, zero working drafts,
all three catalog flags `false`, BOQ 198/1,547 with zero unversioned BOQs, and
Factor F `2569.0.0`/36. Production was untouched and no Local reset occurred.

The earlier P39-S source/static result is historical after P-39R. Corrected
P39R-S passed. Incremental `022`/`023` invariants passed, and the full rerun
then exposed the `021` row-trigger clone timeout. Final forward `024` corrected
that execution shape; exact pushed
`b6d58ce6cfedafa5812821edb49b897c2856f049` passed incremental apply, complete
WP-6.6/WP-7.5 live reruns, canonical readback, and final invariants without
reset. P39R-L is passed. After a fresh warning/approval, P39R-C also passed the
clean `009`-`024` bootstrap, DB/RLS/concurrency/export/advisor/invariant suite,
and disabled-baseline cleanup on exact pushed `10531610`.

P39R-U later proved the corrected Card A behavior with
`2568.5.0-D001`/`2568.5.0-D002` and the same unissued target. The exploratory
continuation also proved Card F same-request recovery and exposed the five
cross-layer findings now owned by P-40. Cleanup again passed pointer
`2568.0.0`/710, zero drafts, all flags false, BOQ 198/1,547, and Factor F
`2569.0.0`/36 without reset or Production access. P-40 checkpoint `dc83c35`
was then pushed and its separate developer browser QA passed. That QA used one
draft (`2568.5.0-D003`), so the cleanup harness correctly restored flags and
refused scored evidence closure because the two-attempt Card A/G contract was
not present.
Read-only status confirmed the disabled baseline above. Do not request P-37
before the fresh scored Cards A-G rerun and cleanup pass and exact
authority/repository verification is recorded.

## 6. P-41 discovery correction gate

The continued guided session used D005 as discovery only. After Card B
withdrawal, the draft had 712 rows but `display_order` ranged from 0 through
712 with one gap. The client had been resequencing that state for presentation;
the database correctly rejected placement with `PLACEMENT_ORDER_INVALID`.
D005 was audited-abandoned and cleanup restored pointer `2568.0.0`/710, zero
working drafts, all flags false, BOQ 198/1,547, and Factor F `2569.0.0`/36.

Forward-only `025` was then applied incrementally without reset. Before the
next scored `prepare`, require all of the following:

1. **Passed:** exact pushed P-41 source
   `bb27b0d28e116e97ce1e7ee3e582f39bcc4edf22` matches the passed full
   repository/authority/build/diff checks;
2. **Passed:** exact-source WP-6.6 smoke proves one compaction trigger, exact
   contiguous order after withdrawal, preserved relative order, and one
   revision advance; evidence SHA-256
   `8d118e14c69f7ea9209123852011b1610d4c63687ff5133136bd6f15875463ed`;
3. **Passed:** after a new warning and Owner approval, exact pushed
   `adcca3939f3080cdf64bc6ad807051e9e85fed94` clean-applied through
   `017`-`025`; WP-6.5/WP-6.6/WP-7/WP-7.5, canonical, and exact
   disabled-baseline readback passed;
4. **Superseded by P-42 incident evidence:** exact pushed `d00c941` prepared a
   new immutable session after the failed `2c39ddd` path. Do not reuse that
   prepared session, D005, `2568.5.0-D001`/`D002`, or their discovery/incident
   evidence as a fresh scored run.

No Local reset is authorized by this note. Production touched: **No**.

## 7. P-42 recovery precondition

The current Local pointer is issued `2568.5.0`/710 with dataset hash
`sha256:46b4b61abdb8cee77065ae979b85ae6df39b4dcc0a6c9ff083aa3f768d202912`.
Pointer restore alone does not reproduce the clean scored baseline because the
issued version and publication audit would remain in history. Do not delete or
rewrite that evidence with ad hoc SQL.

Before another `prepare`:

1. **Passed:** P-42 source/docs/browser/repository checks on exact pushed
   checkpoint `b2500b5e6859a915bfa3f70d558934f252943f82`;
2. tell the owner that `npm run db:local:bootstrap` destroys and rebuilds the
   whole Local Supabase stack, then obtain explicit approval for that one run;
3. bootstrap the unchanged `009`-`015`, hotfix `016`, `017`-`025` chain;
4. repeat exact read-only pointer/hash/draft/flag/BOQ/Factor F and pinned-input
   verification;
5. create a new immutable session path whose file does not already exist.

The scored Cards A-G remain no-reset after that preparation. Production
touched: **No**.
