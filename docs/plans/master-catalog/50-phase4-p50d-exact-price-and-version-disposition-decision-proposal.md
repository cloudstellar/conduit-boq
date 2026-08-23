# Phase 4 P-50D Exact Price and Version Disposition Decision Proposal

**Status:** SUPERSEDED WITHOUT APPROVAL / NOT APPROVABLE; HISTORICAL V1 ONLY;
NO PRICE, CATALOG, CANDIDATE, DATABASE, PRODUCTION, GIT, OR LATER-GATE
AUTHORITY

**Prepared:** 2026-08-22

**Decision request ID:** `P50D-REQ-20260822-V1`

**Consumes:** completed P-50R SOLO request
`P50R-SOLO-REQ-20260821-V1`

**Production or database access used for this proposal:** None

**Superseded:** 2026-08-23 by the Owner's direction to use published/current
`2568.0.0` as the baseline for all names, units, and prices and to present every
possible modification as an explicit before/after delta against that baseline.
This V1 request was never approved and must not be approved, copied as an
approval, or used as mutation authority. [P-50D Baseline-First Proposal
#51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md), request
`P50D-REQ-20260823-V2`, is the historical selection basis. Exact one-row
[Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) was
later exactly confirmed/ratified by the Owner. [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)
is the current receipt: P-50D V3 is complete and P-50C is accepted only as
local review evidence. That receipt grants no candidate application, Git/CI,
database/Production/network, P-13 through P-15, deploy, or publication.

> **Canonical term:** **exact Owner confirmation (ratification)** has the single
> meaning defined in Review Remediation #54: confirm the post-build UUID and
> named SHA-256 values and accept P-50C only as local review evidence. It
> authorizes no candidate application, Git/CI, database/Production/network,
> P-13/P-14/P-14C/P-15, deploy, or publication.

<!-- P50D_V1_SUPERSESSION_OVERLAY_V1 {"schema":"conduit-boq/p50d-v1-supersession-overlay/v1","recordedAt":"2026-08-23","supersededRequestId":"P50D-REQ-20260822-V1","supersededWithoutApproval":true,"approvable":false,"replacementRequestId":"P50D-REQ-20260823-V2","replacementProposal":"./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md","ownerBaselineVersion":"2568.0.0","ownerBaselineFieldAuthority":["item_name","unit","material_cost","labor_cost","unit_cost"],"p50rEvidencePreserved":true,"p50rEvidenceComparisonOnly":true,"historicalV1MarkerPreserved":true,"historicalZeroPriceGateStillBinding":true,"p50dAuthorized":false,"p50cAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"catalogMutationAuthorized":false,"candidateMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"gitPublicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

Everything below this notice is retained as the historical, unapproved V1
proposal. Any lower wording such as “recommended,” “ready,” “current,” or
“approve” describes that superseded proposal only and has no present authority.

<!-- P50D_OWNER_DECISION_PROPOSAL_V1 {"schema":"conduit-boq/p50d-owner-decision-proposal/v1","preparedAt":"2026-08-22","requestId":"P50D-REQ-20260822-V1","consumesP50rRequestId":"P50R-SOLO-REQ-20260821-V1","p50rResult":"PASS_FOR_P50D_REQUEST","p50rReviewBindingSha256":"55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc","deltaManifestSha256":"c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47","deltaRecordCount":67,"recommendedPath":"A","recommendedRowBasis":"same-filed-2568-basis-source-restoration","recommendedReleaseIntent":"revision","recommendedTarget":"2568.1.0","recommendedCorrectionCount":49,"recommendedCorrectionSetSha256":"42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0","cohortACount":25,"cohortASetSha256":"95ca7c3c77b5697c64d099a186f17e9116b7eff54409f6fea2a7a3dd8d5a7ec5","cohortBCount":24,"cohortBSetSha256":"5b7be022a56c8b361671a0c6ba5e1c22234d1e0e41b6e7ed5d0f5a00976b3dd0","retainSourceVersionCount":18,"retainSourceVersionSetSha256":"489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2","authorityExclusionCount":17,"p51WaiverReapprovalAt":"2026-08-25T23:59:59+07:00","ownerPersonalResultConfirmationClaimed":false,"historicalZeroPriceGateStillBinding":true,"historicalZeroPriceGateSupersessionAuthorized":false,"exactCorrectionManifestApproved":false,"p50dAuthorized":false,"p50cAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"catalogMutationAuthorized":false,"candidateMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"gitPublicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## 1. Technical decision summary

P-50R is complete and the evidence is sufficient for an exact Owner decision.
The result is `PASS_FOR_P50D_REQUEST`: all five inputs matched their frozen
scope, all 28 PDF pages and 662 extracted price rows were accounted for, 100%
of the source/current/candidate identity union was classified, both
deterministic passes were byte-identical, all 67 delta records and 245
exceptions were reviewed, and no blocking exception remains.

The recommended P-50D disposition is **Path A**:

1. approve all and only the 49 `proposed_confirmed_correction` records in the
   frozen manifest;
2. treat those row changes as restoration of the same filed 2568 price basis;
3. retain current values for all 18 `source_version_difference` records;
4. retain all 17 authority exclusions outside the catalog correction scope;
5. keep the overall release business intent as **revision**, with exact target
   `2568.1.0`, because the unpublished candidate already contains the approved
   structured-code revision; and
6. supersede the historical zero-price-only candidate gate only through this
   exact decision and a later separately approved clean P-50C rebuild.

This is a recommendation, not approval. Until the Owner records the complete
Section 7 decision, `2568.1.0` still requires price-change total `0`, all 49
corrections remain `pending_p50d`, and P-50C plus every operational gate remain
false.

## 2. Frozen evidence and measurement definitions

The unit of analysis is one canonical stable-identity record reconciled across
the frozen Production snapshot, historical reconciliation CSV, taxonomy
workbook, first-rollout authority, and filed PDF. Price is an attribute, never
an identity key.

| Evidence | Frozen result |
|---|---|
| P-50R request | `P50R-SOLO-REQ-20260821-V1` |
| Result / next stop | `PASS_FOR_P50D_REQUEST` / `STOP_AT_P50D_OWNER_DECISION_REQUEST` |
| Review binding | `55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc` |
| `reconciliation.csv` | SHA-256 `4bd5c30fa60b323164eb0303d211ae31f211bbdb337f2236ed15970b63912bee` |
| `proposed-delta-manifest.json` | SHA-256 `c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47` |
| `exceptions.json` | SHA-256 `93e179ef906849bcd5c383986aaf560f84e6242a815c2d2649e3d8b78142600b` |
| `summary.json` | SHA-256 `7cc7cf4bbe1fea8783e5cc6fa736e018591d461325a43ed7570c26e015fe8d3d` |
| `SHA256SUMS` | SHA-256 `35485e1a862e9894a6e51def37b4a2df5300b23578e157e9dbd79ced54efc3ff` |
| Coverage | SQL `710/710`; CSV `728/728`; workbook `708/708`; PDF pages `28/28`; PDF rows `662/662`; union classified `100%` |
| Identity quality | high `697`; medium `13`; low `0`; authority-rejected `17`; alternate optimal alignment `false` |
| Delta review | 67/67 reviewed: 49 proposed corrections and 18 source-version differences; mutation authority `false` |
| Exception review | 245/245 reviewed: 180 extraction-structure and 65 source-version; blockers `0` |

The filed PDF is the price evidence. The workbook is a taxonomy and locator
bridge, not independent price authority. Diagnostic sums below add unit prices
across unlike units and therefore describe reconciliation magnitude only; they
are not project exposure or a payable THB amount.

## 3. The 49 correction records form two exact, non-overlapping cohorts

| Cohort | Exact manifest predicate | Count | Evidence and risk interpretation | Recommended disposition |
|---|---|---:|---|---|
| A — filed-PDF rounding/source corrections | `classification=proposed_confirmed_correction`, `sql_vs_xlsx=equal`, `xlsx_vs_pdf=different` | 25 | Material unchanged. Labor/total increases by THB 1–7 per unit; diagnostic sum +53. PDF is the filed price source. One row, `ITEM-0287`, has medium identity confidence due to a page-header overlay and was manually reviewed. | Approve as same-basis corrections. |
| B — systematic LVU labor-source restoration | `classification=proposed_confirmed_correction`, `sql_vs_xlsx=different`, `xlsx_vs_pdf=equal` | 24 | Exactly `ITEM-0615..ITEM-0638`. PDF and workbook agree; current differs. Material unchanged; 23 increases and one decrease; total delta range -460 to +855; diagnostic net +5,242 and absolute 6,162. | Approve as the same filed-basis restoration, explicitly acknowledging the larger systematic cohort. |
| C — source-version differences | `classification=source_version_difference` | 18 | Eight current values already equal PDF; ten have no supporting PDF row. A workbook-only blanket import would change unsupported or already-correct prices. | Retain current; no mutation. |
| D — authority exclusions | frozen authority exclusion set | 17 | Rejected from first-rollout identity authority; not a price-correction shortcut. | Keep excluded; require a separate identity/authority process to add any later. |

Cohort A is exactly:

`ITEM-0286`, `ITEM-0287`, `ITEM-0332..ITEM-0335`, `ITEM-0426`,
`ITEM-0427`, `ITEM-0429`, `ITEM-0430`, `ITEM-0431`, `ITEM-0450`, `ITEM-0453`,
`ITEM-0454`, `ITEM-0456..ITEM-0463`, and `ITEM-0478..ITEM-0480`.

This includes the original P-50 target and adjacent findings:

| Item | Stable identity | Current -> filed PDF |
|---|---|---|
| `ITEM-0427` | `77dae4c9-b6f0-4ad5-987c-661e344c2871` | `5070/1801/6871 -> 5070/1802/6872` |
| `ITEM-0429` | `f2662c71-a6e5-407e-8456-8608e304b43b` | `0/1763/1763 -> 0/1764/1764` |
| `ITEM-0430` | `ceb49dea-167c-481d-a28c-6a8c9ce46633` | `0/1763/1763 -> 0/1764/1764` |
| `ITEM-0431` | `1e60425d-d3d0-4510-b7f1-9075fb3ff352` | `0/3526/3526 -> 0/3528/3528` |

Cohort B is the complete continuous legacy-code range `ITEM-0615` through
`ITEM-0638`. Its repeated labor-delta pattern is evidence of a systematic
source restoration rather than random row edits. Two rows deserve explicit
Owner acknowledgement: `ITEM-0623` changes by `+855` and `ITEM-0637` changes
by `-460`. This pattern statement is a descriptive inference; price authority
still comes from the filed PDF.

Cohort C is exactly `ITEM-0010`, `ITEM-0082`, `ITEM-0086`,
`ITEM-0124..ITEM-0127`, `ITEM-0230`, `ITEM-0693..ITEM-0698`, and
`ITEM-0703..ITEM-0706`.

Cohort D is exactly `CIS-H06-001..CIS-H06-006`, `CRS-GIP-025`,
`RSR-PL0-010..RSR-PL0-013`, `RSR-PL0-018..RSR-PL0-020`, and
`RSR-PL0-029..RSR-PL0-031`.

## 4. Exact set binding prevents scope drift

The complete 67-record manifest hash is the primary evidence binding. For
decision review, the following derived set hashes make each disposition
independently reproducible:

| Set | Count | Derived SHA-256 |
|---|---:|---|
| Recommended correction set A + B | 49 | `42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0` |
| Cohort A | 25 | `95ca7c3c77b5697c64d099a186f17e9116b7eff54409f6fea2a7a3dd8d5a7ec5` |
| Cohort B | 24 | `5b7be022a56c8b361671a0c6ba5e1c22234d1e0e41b6e7ed5d0f5a00976b3dd0` |
| Retain-current source-version set C | 18 | `489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2` |

Each derived hash is SHA-256 over UTF-8 bytes of
`JSON.stringify(selectedRecords) + "\n"`, preserving manifest record order.
The predicates are exactly those in Section 3. The 49-record correction set is
therefore all and only the two approved predicates; it cannot silently absorb
an adjacent record, exclusion, workbook-only value, or later discovery.

## 5. Row-level correction and release-level revision are different decisions

The 49 row changes restore all confirmed mismatches within the complete filed-
PDF source footprint and are not a newly calculated price policy. At row level
they are same-basis corrections.

The release as a whole is nevertheless a **revision**, not a patch, because
the first structured catalog changes the item-code scheme and preserves the
approved legacy-to-structured mappings. ADR-003 classifies that material
catalog change as a revision. Since `2568.1.0` is still unpublished, correcting
its data before promotion does not require publishing an intermediate
`2568.0.1` or scheduling a second post-P-15 release.

This release-level classification depends on the approved structured-code
revision remaining in the final candidate. If that scope is removed and the
release contains only the 49 same-basis price corrections, stop and return to
P-50D: ADR-003 would require a patch lane, and `2568.1.0` must not be reused for
the corrections alone.

The current governance baseline records published/current `2568.0.0`, zero
working drafts, all Phase 4 flags false, no application deployment, and no
later authorized catalog claim or publication. Under ADR-003 the next revision
is therefore `2568.1.0`; this is a derivation from the recorded registry state,
not an assumption that the common next number is always free. Because this
proposal performed no live database read, recheck the exact issued/claimed
registry before P-50C freezes a candidate and again atomically before a future
Production draft claims the target. A conflicting issued or current claim is
`HOLD`; do not guess or automatically increment the number.

An approved P-50D must explicitly supersede the historical **zero-price-only
candidate gate**, because a candidate cannot truthfully claim both price-change
total `0` and the approved 49-record manifest. It does not rewrite or delete
that historical evidence. Published `2568.0.0`, its pointer-era rows, existing
BOQ snapshots/bindings, and all historical source/evidence bytes remain
immutable.

## 6. Alternatives and trade-offs

### Recommended — approve A and B together under Path A

This closes every filed-source price mismatch that P-50R classified as a
confirmed correction, preserves all unsupported/current-correct rows, and
requires only one clean candidate rebuild and one later publication route.
The main risk is Cohort B's larger systematic labor changes; binding its exact
24 identities, old/new values, and two highlighted rows controls that risk.

### More conservative — approve A and hold B

This reduces the immediate numeric change to 25 small rows, but leaves 24 rows
known to disagree with both the filed PDF and workbook. P-50 cannot then close
cleanly: proceeding to publication would require a separate, explicit Path B
price-risk acceptance, or another P-50D cycle. This is safer only if the Owner
does not accept that the filed PDF represents the intended basis for Cohort B.

### Not recommended — retain all current prices under Path B

This preserves the historical zero-price candidate but knowingly publishes a
catalog that differs from its filed price source. It adds exposure measurement,
expiry, monitoring, and a later correction release while providing no data-
quality benefit after a complete nonblocking reconciliation.

## 7. Historical V1 Owner decision block — disabled and not approvable

This entire section is retained only to show what V1 proposed before the Owner
changed the baseline direction. No response can approve this request now. Do
not use the table or sentence below as an approval template; use Proposal #51.

The historical V1 contract would have required every field together:

| Field | Recommended exact value |
|---|---|
| Decision | `APPROVE P-50D` or `HOLD P-50D` |
| Request | `P50D-REQ-20260822-V1` |
| P-50R binding | request `P50R-SOLO-REQ-20260821-V1`; result `PASS_FOR_P50D_REQUEST`; review binding `55c90931144b8a7a2cb4aebeb917d2dc0062b576dcbd5a7678e2f208421149cc` |
| Source precedence | filed 28-page PDF is price authority; workbook is taxonomy/locator bridge |
| Correction scope | Path A; exact 49-record A+B set SHA-256 `42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0` from manifest SHA-256 `c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47` |
| Explicit larger-cohort acknowledgement | approve all `ITEM-0615..ITEM-0638`, including `ITEM-0623 +855` and `ITEM-0637 -460` |
| Retain scope | exact 18-record set SHA-256 `489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2`; no mutation |
| Exclusions | retain all 17 authority exclusions; no implicit identity admission |
| Row basis | same filed 2568 basis restoration, not newly calculated policy |
| Release intent / target | `revision` / exact `2568.1.0`, fail closed on issued/claimed-registry conflict |
| Historical gate | explicitly supersede the zero-price-only candidate gate prospectively; preserve historical evidence bytes and published `2568.0.0` |
| Historical BOQs | no reprice, backfill, pointer rebinding, or snapshot rewrite |
| P-51 waiver checkpoint | if first P-15 closeout is incomplete at `2026-08-25 23:59:59 +07`, stop for fresh explicit Owner reapproval; no automatic extension |
| Later authority | P-50C, Local/Production DB, network, catalog/candidate mutation, Git/CI/Preview, P-13, P-14, P-14C, P-15, official artifacts, and publication remain `false` |

The now-disabled V1 approval template was:

> **DISABLED HISTORICAL V1 TEXT — DO NOT USE OR APPROVE:** APPROVE P-50D — P50D-REQ-20260822-V1; approve Path A and the exact 49-record A+B correction set 42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0 from manifest c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47; acknowledge ITEM-0615..ITEM-0638 including ITEM-0623 +855 and ITEM-0637 -460; retain the exact 18-record source-version set 489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2 and all 17 authority exclusions; classify the 49 rows as same-filed-2568-basis restoration and the release as revision target 2568.1.0, HOLD on registry conflict; supersede only the zero-price-only candidate gate prospectively while preserving 2568.0.0, historical evidence and BOQs; retain the P-51 `2026-08-25 23:59:59 +07` reapproval checkpoint; P-50C/DB/Production/network/mutation/Git/P-13/P-14/P-14C/P-15 remain false; stop after recording this decision.

Any partial approval, different count/hash, omitted Cohort B acknowledgement,
different source/version classification, or requested split requires a revised
P-50D proposal. Do not infer a partial mutation set from conversational text.

## 8. Minimum future P-50C safeguards

P-50D approval would still stop before implementation. A later exact P-50C
request should remain simple and require only:

1. start from the clean frozen candidate base and recheck the complete
   issued/claimed registry;
2. apply all and only the 49 UUID-keyed records after verifying every expected
   old material/labor/total triple;
3. reject any material-price change, missing/extra identity, count other than
   49, arithmetic failure, or change outside the approved set;
4. prove the approved structured-code revision is still present; if it is
   absent, `HOLD` and return to P-50D instead of using target `2568.1.0`;
5. verify the exact 49 new triples and prove every non-approved identity,
   name, unit, order, mapping, and price is unchanged;
6. generate new review-lock, dataset/diff hashes, tests, and review-only Excel/
   PDF labelled `DRAFT – ห้ามใช้อ้างอิง`; and
7. stop again before commit/push, database access, Production draft creation,
   deployment, feature flags, or publication.

No live exposure query is needed to choose recommended Path A because existing
BOQs are not repriced and no active row is edited in place. Exposure evidence
would become necessary if the Owner chooses Path B or proposes a historical
BOQ remedy.

## 9. Limitations and hard stops

- The authorized local operator, not the Owner personally, recorded the P-50R
  page/delta/exception review. Owner personal result confirmation is not
  claimed; this P-50D decision is the separate Owner confirmation point.
- The evidence proves reconciliation and source precedence; it does not prove
  real-usage exposure because no Local/Production database was accessed.
- Thirteen identities were medium confidence due solely to repeated PDF page-
  header overlays; all were manually reviewed, no identity was low confidence,
  and only `ITEM-0287` appears in the recommended correction set.
- The 65 source-version exceptions overlap source-presence and authority
  classifications; do not add them to the 18 manifest records or 17 exclusions
  as if they were disjoint mutation cohorts.
- A source/evidence hash change, non-unique identity, target-registry conflict,
  changed old value, removed structured-code revision, or request for an extra
  row is `HOLD` and requires a new exact decision. Never shrink or expand the
  set silently.

## 10. Historical V1 next action — superseded

The V1 next-action text below is retained only as history and must not be
followed. The current safe action is Owner review of Proposal #51 against
`P50D-REQ-20260823-V2`; no later authority follows automatically.

The next action is Owner review of Section 7 only. This proposal creates no
automatic next step. Until a complete exact P-50D approval exists, do not edit
the catalog or candidate, access a database or Production, create a release
commit, push, run CI/Preview as release evidence, enter P-13/P-14/P-14C/P-15,
or generate an official artifact.
