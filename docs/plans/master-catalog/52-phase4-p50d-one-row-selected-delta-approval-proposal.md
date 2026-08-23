# Phase 4 P-50D One-Row Selected-Delta Approval Proposal

**Status:** EXACT OWNER CONFIRMATION (RATIFICATION) RECEIVED; P-50D V3 DECISION
COMPLETE IN `decision-record-only` SCOPE; P-50C ACCEPTED ONLY AS LOCAL REVIEW
EVIDENCE UNDER [REVIEW REMEDIATION
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md);
SECTIONS 1-9 AND THEIR MARKERS PRESERVE PRE-RECEIPT CHRONOLOGY; NO APPLICATION,
DATABASE, PRODUCTION, GIT/CI, OR LATER-GATE AUTHORITY

> **Canonical term:** **exact Owner confirmation (ratification)** has the single
> meaning defined in [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md):
> confirm the post-build UUID and named SHA-256 values and accept P-50C only as
> local review evidence. It authorizes no candidate application, Git/CI,
> database/Production/network, P-13/P-14/P-14C/P-15, deploy, or publication.

> **P-50D V3 ratification stop boundary — reached (2026-08-24):**
> [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)
> records the exact Owner ratification and then stops. No small repository
> gate, Git/CI request, candidate application, database/Production/network
> action, P-13 through P-15, deploy, or publication is authorized. This
> supersedes live wording below that names any next step; every later action
> requires a new explicit Owner instruction.

**Prepared:** 2026-08-23

**Decision request ID:** `P50D-REQ-20260823-V3`

**Selection basis:** the Owner chose only the original P-50 `1,764` item under
`P50D-REQ-20260823-V2`. Because `ITEM-0430` also has comparison value `1,764`,
the selection is bound below to exact UUID/code and never to price alone.

**Production or database access used:** None

<!-- P50D_ONE_ROW_SELECTED_DELTA_APPROVAL_PROPOSAL_V3 {"schema":"conduit-boq/p50d-one-row-selected-delta-approval-proposal/v3","preparedAt":"2026-08-23","requestId":"P50D-REQ-20260823-V3","selectionBasisRequestId":"P50D-REQ-20260823-V2","ownerSelectionIntentRecorded":true,"exactManifestApprovalPending":true,"baselineVersion":"2568.0.0","baselineRowCount":710,"baselineSnapshotSha256":"a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570","baselineValueBindingSha256":"6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a","manifestPath":"./evidence/p50d-v3/p50d-selected-delta-manifest.json","manifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordCount":1,"selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","unselectedCandidateCount":48,"unselectedCandidateSetSha256":"2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be","retainBaselineEvidenceCount":18,"authorityExclusionCount":17,"selectedIdentityId":"f2662c71-a6e5-407e-8456-8608e304b43b","selectedLegacyItemCode":"ITEM-0429","selectedTargetItemCode":"COR-PB0-002","baselinePrice":[0,1763,1763],"selectedPrice":[0,1764,1764],"priceDelta":[0,1,1],"nameChangeCount":0,"unitChangeCount":0,"materialChangeCount":0,"unchangedBaselineRowCount":709,"explicitlyUnselectedAdjacentItems":["ITEM-0427","ITEM-0430","ITEM-0431"],"rowClassification":"same-basis-correction","overallReleaseClassification":"structured-code-revision-with-one-selected-price-delta","proposedTarget":"2568.1.0","targetRequiresRegistryRecheck":true,"historicalBoqRepriceAuthorized":false,"historicalZeroPriceGateSupersessionAuthorized":false,"p50dAuthorized":false,"p50cAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"catalogMutationAuthorized":false,"candidateMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## 1. Historical pre-receipt recommendation and exact decision meaning

The recommended outcome is to approve exactly one price delta and retain the
published/current `2568.0.0` values everywhere else. This is the smallest
change that implements the Owner's stated business intent without importing
the other 48 P-50R comparison candidates.

The latest Owner message records **selection intent**, not approval of a hash
that did not yet exist. This proposal therefore freezes the exact one-record
manifest and asks for one short exact confirmation. Until that confirmation,
the approved mutation set remains empty and P-50D/P-50C remain false.

## 2. Frozen manifest and hash contract

| Binding | Exact value |
|---|---|
| Manifest | [`evidence/p50d-v3/p50d-selected-delta-manifest.json`](./evidence/p50d-v3/p50d-selected-delta-manifest.json) |
| Manifest file SHA-256 | `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429` |
| Selected record count | `1` |
| Selected-record SHA-256 | `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df` |
| Selected hash method | SHA-256 over exact 951-byte UTF-8 `JSON.stringify(records) + "\n"` |
| Unselected P-50R candidates | `48` / SHA-256 `2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be` |
| Retain-baseline evidence rows | `18` / SHA-256 `489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2` |
| Authority exclusions | `17`; distinct from the 48 unselected candidates |

The selected-record hash projects fixed fields in the order stored in the
manifest. The 48-record hash uses the original frozen P-50R record objects and
order after excluding only the selected UUID. A count/hash mismatch is `HOLD`.

## 3. The one selected row

| Field | `2568.0.0` baseline | Selected value |
|---|---|---|
| Stable UUID | `f2662c71-a6e5-407e-8456-8608e304b43b` | unchanged |
| Legacy / structured code | `ITEM-0429` / `COR-PB0-002` | unchanged |
| Name | `งานเจาะผนังบ่อพักย่อย (PB)` | unchanged |
| Unit | `จุด` | unchanged |
| Material cost | `0` | `0` |
| Labor cost | `1763` | `1764` |
| Unit cost | `1763` | `1764` |
| Delta | — | material `0`; labor `+1`; unit `+1` |
| P-50R locator | — | `p24:t1:r9:display-2`; row digest `1651a7a1e42744bf6f2bc458fa62c8c20a26e56af9860b7338e543534cfd6b91` |

Both old and selected arithmetic pass. A later candidate operation must first
verify the exact old triple `0/1763/1763`; any drift is `HOLD`.

## 4. Explicitly retained scope

- The other 709 baseline rows retain their exact current name, unit, and price.
- The other 48 external-source candidates remain deferred at `2568.0.0`.
- `ITEM-0427`, `ITEM-0430`, and `ITEM-0431` are explicitly unselected even
  though their comparison evidence also differs from the baseline.
- The 18 retain-baseline evidence records remain unchanged.
- The 17 authority exclusions remain outside the 710-row catalog scope.
- Existing and historical BOQs are never repriced or backfilled. The frozen
  snapshot contains references to this UUID, so an in-place or retroactive
  update would be a scope violation.

## 5. Release treatment

At row level, this is a same-2568-basis correction selected by the Owner. At
release level, the first structured catalog remains a revision because it also
contains the already approved structured-code rollout. Proposed target
`2568.1.0` remains conditional on a fresh complete issued/claimed registry
check before candidate freeze.

Approval of this request would prospectively supersede the historical
zero-price-only candidate rule for this one exact UUID. It would not rewrite
`2568.0.0`, historical evidence, or any BOQ. P-50C must rebuild/refreeze and
verify the complete non-Production candidate; historical zero-price candidate
hashes and review artifacts cannot be reused.

## 6. Original pre-build Owner decision block — historical

Before the technical build, P-50D V3 remained unapproved and the following was
the proposed approval sentence. It is retained for audit chronology but is no
longer sufficient after the P-50C hashes existed. The current decision text is
the exact Owner confirmation (ratification) request in [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).

> APPROVE P-50D V3 — P50D-REQ-20260823-V3; approve exactly 1 selected record with selected-record SHA-256 f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df from manifest SHA-256 1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429; bind UUID f2662c71-a6e5-407e-8456-8608e304b43b / ITEM-0429 / COR-PB0-002, unchanged name งานเจาะผนังบ่อพักย่อย (PB) and unit จุด, price 0/1763/1763 -> 0/1764/1764; retain the other 709 baseline rows, all other 48 external-source candidates including ITEM-0427/ITEM-0430/ITEM-0431, the 18 retain-baseline records, and all 17 exclusions; classify the row as same-basis correction and the overall structured-code release as revision proposed target 2568.1.0 subject to fresh registry check; do not reprice/backfill existing BOQs; P-50C/DB/Production/network/catalog/pointer/Factor F/Git/P-13/P-14/P-14C/P-15 remain false; stop after recording this decision.

Any approval that omits the UUID or uses only the words “the 1764 item” is
ambiguous because another candidate also has comparison value `1764`.

## 7. Historical pre-build next-action contract

At this pre-build checkpoint, exact P-50D V3 approval would have allowed one
separately bounded P-50C request to
build/refreeze a complete non-Production candidate from the clean baseline and
apply only this UUID after the old-value check. P-50C must prove one changed
price row, zero name/unit/material changes, 709 unchanged baseline rows, no BOQ
repricing, exact target availability, reproducible dataset/diff hashes, and
review-only artifacts marked `DRAFT – ห้ามใช้อ้างอิง`.

This proposal and its manifest authorize no candidate mutation, Local or
Production database access, network use, source/catalog/BOQ/pointer/Factor F
mutation, commit, push, CI/Preview, deploy, flag change, P-13, P-14, P-14C,
P-15, publication, or automatic next step.

## 8. Superseded same-day V3/P-50C interpretation — 2026-08-23

This later append-only overlay changes only the active status and next action;
the proposal text, exact approval sentence, and original request marker remain
unchanged historical evidence. That same-day interpretation treated the Owner
as having approved the exact P-50D V3 one-row decision and the bounded offline
P-50C build as authorized and consumed. Candidate
`P50C-CANDIDATE-20260823-V1` was technically completed and verified. See
[P-50C result record
#53](./53-phase4-p50c-one-row-offline-candidate-result-record.md).

Published `2568.0.0` was not mutated and continues to hold `ITEM-0429` at
`0/1763/1763`. The provisional local `2568.1.0` candidate changes only UUID
`f2662c71-a6e5-407e-8456-8608e304b43b` to `0/1764/1764`. The other 709
baseline rows are unchanged; name, unit, and material deltas are zero; all
other 48 candidates including `ITEM-0427`, `ITEM-0430`, and `ITEM-0431`
remain unselected; the 17 exclusions are unchanged; and existing or
historical BOQs are not repriced. Under that interpretation, the historical
zero-price gate was superseded only for this exact UUID in the local candidate.

The target `2568.1.0` remains provisional pending a fresh complete
version-registry check. Under that superseded interpretation, the active next
gate was a new, explicit Owner decision on local commit, push, and CI. No Git
action occurred or was authorized.
There is no residual P-50D or P-50C authority, and database, Production,
network, application, source, catalog, BOQ, pointer, Factor F, P-13, P-14,
P-14C, P-15, deployment, publication, and automatic continuation remain
false.

<!-- P50D_V3_APPROVAL_CONSUMPTION_OVERLAY_V1 {"schema":"conduit-boq/p50d-v3-approval-consumption-overlay/v1","recordedAt":"2026-08-23","p50dV3RequestId":"P50D-REQ-20260823-V3","p50dV3Approved":true,"p50dV3ApprovalConsumed":true,"p50dFurtherActionAuthorized":false,"p50cAuthorized":true,"p50cAuthorizationConsumed":true,"p50cCompleted":true,"p50cFurtherExecutionAuthorized":false,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cResultRecord":"./53-phase4-p50c-one-row-offline-candidate-result-record.md","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","publishedVersion":"2568.0.0","publishedVersionMutated":false,"publishedSelectedIdentityPrice":[0,1763,1763],"provisionalCandidateVersion":"2568.1.0","provisionalTargetOnly":true,"versionRegistryCheckPending":true,"selectedRecordCount":1,"selectedIdentityId":"f2662c71-a6e5-407e-8456-8608e304b43b","selectedLegacyItemCode":"ITEM-0429","selectedTargetItemCode":"COR-PB0-002","candidateSelectedPrice":[0,1764,1764],"unchangedBaselineRowCount":709,"nameChangeCount":0,"unitChangeCount":0,"materialChangeCount":0,"unselectedCandidateCount":48,"explicitlyUnselectedAdjacentItems":["ITEM-0427","ITEM-0430","ITEM-0431"],"authorityExclusionCount":17,"historicalBoqRepriceAuthorized":false,"historicalZeroPriceGateSupersededForSelectedLocalCandidateUuidOnly":true,"nextDecision":"explicit-local-commit-push-and-ci-approval","localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"applicationMutationAuthorized":false,"sourceMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## 9. Historical independent-review correction and ratification request

Independent review confirmed the 710-row candidate and exact one-row price
delta, but found that the Owner wording used to create Section 8 did not repeat
the UUID and hashes required by Sections 1 and 6. Section 8 and its marker are
therefore retained as a superseded same-day interpretation, not current
approval authority.

The current request is [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md),
`P50D-V3-RATIFY-REQ-20260823-V1`. Until the Owner sends its exact confirmation
(ratification) sentence, the frozen manifest remains pre-approval evidence,
P-50D V3 is not authorized, and the technically verified P-50C candidate is not
accepted as local review evidence. That acceptance does not authorize Git or
application. Do not edit the frozen manifest; record any later confirmation in
a new append-only decision overlay.

<!-- P50D_V3_REVIEW_CORRECTION_V1 {"schema":"conduit-boq/p50d-v3-review-correction/v1","recordedAt":"2026-08-23","supersedesCurrentAuthorityOf":"P50D_V3_APPROVAL_CONSUMPTION_OVERLAY_V1","ratificationRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dV3RequestId":"P50D-REQ-20260823-V3","exactOwnerRatificationPending":true,"p50dV3Authorized":false,"p50cTechnicalBuildOccurred":true,"p50cCandidateAccepted":false,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","nextOwnerDecision":"ratify-or-hold-exact-p50d-v3","localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## 10. Exact Owner ratification receipt — 2026-08-24

The Owner returned the exact confirmation for `P50D-REQ-20260823-V3`; the
canonical append-only receipt is
`P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1` in [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
It confirms the one UUID and all five named SHA-256 bindings. P-50D V3 is
complete only as a decision record, and `P50C-CANDIDATE-20260823-V1` is accepted
only as local review evidence, not as an application/import payload.

Published/current `2568.0.0` remains unchanged at `0/1763/1763`. Provisional
`2568.1.0` contains the reviewed `0/1764/1764` row but still requires the fresh
complete issued/claimed registry check. The other 709 baseline rows, all other
48 external-source candidates, 18 retain-baseline evidence rows, 17 exclusions,
adjacent findings, and historical BOQs remain unchanged.

This receipt authorizes no further action. Application, Git/CI, database,
Production, network, P-13, P-14, P-14C, P-15, deploy, and publication remain
false. The next safe step is only the small repository gate. If it passes, a
separate exact Git/CI authorization request may be prepared; nothing continues
automatically.

<!-- P50D_V3_EXACT_OWNER_RATIFICATION_PROPOSAL_RECEIPT_V1 {"schema":"conduit-boq/p50d-v3-exact-owner-ratification-proposal-receipt/v1","recordedAt":"2026-08-24T00:44:15+07:00","canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","canonicalReceiptDocument":"./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md","resolvesRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dRequestId":"P50D-REQ-20260823-V3","confirmationReceived":true,"exactOwnerRatificationPending":false,"p50dV3Ratified":true,"p50dAuthorized":true,"p50dAuthorityScope":"decision-record-only","p50dFurtherActionAuthorized":false,"p50dManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cCandidateAccepted":true,"acceptsCandidateAs":"local-review-evidence-only","p50cFurtherExecutionAuthorized":false,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","currentPublishedVersion":"2568.0.0","currentPublishedCatalogChanged":false,"provisionalTargetVersion":"2568.1.0","targetRegistryCheckPending":true,"historicalBoqRepriceAuthorized":false,"nextSafeStep":"none-stop-after-recording-ratification","smallRepositoryGateRequired":false,"separateGitCiAuthorizationRequired":true,"gitCiAuthorizationGranted":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false} -->
