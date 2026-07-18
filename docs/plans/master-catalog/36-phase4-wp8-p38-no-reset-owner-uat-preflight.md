# Phase 4 WP-8 P-38 No-reset Owner UAT Preflight

**Status:** The tracked fail-closed tooling and inputs were prepared, committed,
and used for the first P-38 session. Card A created Local attempts `2568.16.0`
and `2568.17.0`; the owner then stopped the UAT after identifying the official
number-gap problem. Both attempts were audited-abandoned and cleanup restored
the exact disabled baseline without reset. P-39 is now in progress; Cards A-G
must not resume until [Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md)
passes its Local gates. P-37 remains **HOLD**.

**Boundary:** Local only, no reset. This note does not authorize successful
publication, pointer movement, P-37 acceptance, P-19, Factor F work, hotfix
`016` expansion, Production feature enablement, or Production access/write.

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
rendered again. The repository verifier subsequently opened both final files
with the same ExcelJS dependency used by the application and compared every
parser-required field against the source.

## 3. Tracked Local harness

The tracked script is
`scripts/manage-master-catalog-p38-owner-uat.mjs`. Run it only from branch
`codex/master-catalog-phase4` after its exact checkpoint is pushed.

```bash
npm run db:local:p38:verify-inputs
npm run db:local:p38:status
npm run db:local:p38:prepare
```

`verify-inputs` reads files only and rejects any manifest/source/authority/E-01/
E-02 hash that differs from the tracked approved values. `status` reads Local
Supabase only. `prepare` requires a clean tracked tree whose HEAD exactly
matches its configured pushed upstream, the verified manifest, exact disabled
baseline including the canonical dataset hash, zero working drafts, and an
active Local admin. It then enables only Local admin and new-identity
capabilities, keeps retirement disabled, records the actor/baseline/first-
middle-last search examples, and writes an untracked session record. It never
creates, edits, publishes, or abandons a draft.

After the Owner completes Card G:

```bash
npm run db:local:p38:cleanup
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

## 5. P-38 interruption result and next safe step

Cleanup on 2026-07-18 restored pointer `2568.0.0`/710, zero working drafts,
all three catalog flags `false`, BOQ 198/1,547 with zero unversioned BOQs, and
Factor F `2569.0.0`/36. Production was untouched and no Local reset occurred.

The earlier P39-S source/static result is historical after P-39R. Corrected
P39R-S is pushed; owner-approved incremental `022` invariants passed, while
P39R-L remains in progress for forward `023` and the full live rerun. After
P39R-L, receive a fresh destructive-reset approval for P39R-C. Only after
P39R-U proves the corrected
Card A behavior may the Owner resume Cards B-G. Do not request P-37 before that
evidence, cleanup, authority update, exact verification, commit, and push are
complete.
