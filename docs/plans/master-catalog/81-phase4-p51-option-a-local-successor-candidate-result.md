# Phase 4 P-51 Option A Local Successor Candidate Result

**Status:** LOCAL/OFFLINE DETERMINISTIC REVIEW PACKAGE PASS / NOT APPLIED /
NOT LIVE-D002-BOUND / STOP BEFORE GIT, DEPLOY, DATABASE, OR P-15

**Recorded:** 2026-08-26

**Package ID:** `P51-OPTION-A-CANDIDATE-20260826-V1`

## 1. Result and evidence boundary

The bounded local build produced one deterministic `710`-row Option A review
oracle from the frozen `2568.0.0` baseline, structured-code authority, and
P-50R comparison evidence. It applies the Owner-selected set of all `49`
`proposed_confirmed_correction` price rows to the local candidate while
retaining the `18` source-version-difference rows and all `17` authority
exclusions. The `49`-row price overlay changes no name, unit, material cost,
identity, structured-code mapping, or canonical `display_order`; the package
separately preserves the already-approved structured-code authority of `709`
recodes plus one retain.

The package is review evidence only. It is not an import payload, SQL seed, RPC
body, database snapshot, live D002 readback, or authority to mutate anything.
The existing P-50C candidate remains the semantic oracle for the ITEM-0429
change already recorded in Result #80 D002; this new package adds a separate
offline view of the other `48` approved business-scope price changes without
claiming that those rows exist in live D002.

## 2. Exact artifacts and invariants

| Artifact | Exact binding |
|---|---|
| Candidate | `evidence/p51-option-a-v1/candidate.json`; `416229` bytes; SHA-256 `ef232f772b63d74901179304ee92553120fa497e1794016bf381b7b1447026fb`; `710` rows |
| Diff | `evidence/p51-option-a-v1/diff.json`; `96778` bytes; SHA-256 `f522e722a76ef78a7442c8d071abfe311be94c8b3c5d74779da499efceb5c370`; `49` changes from baseline / `48` additional changes from Result #80 D002 |
| Manifest | `evidence/p51-option-a-v1/manifest.json`; `7371` bytes; SHA-256 `f30bea1ec2646b67d2025165bf9f5e5678c9b303a66f56d2484750dbb64b52a8` |

The manifest proves `710` unique identities, legacy codes, and target codes;
`709` recodes plus one retain; `49` baseline-changed and `661`
baseline-unchanged rows; and `48` D002-additional and `662` D002-unchanged
rows. All `49` baseline changes affect labor and unit cost only. The D002
increment excludes ITEM-0429 and changes labor/unit cost on the other `48`
rows only. Price arithmetic and nonnegative-price checks pass; ITEM-0615 is
exactly `2869/7427/10296`. Missing or blank price cells fail closed before
normalization. The offline D002 comparator proves structural equality across
all `710` rows before calculating the `48`-row increment. Inherited nullable
authority counts are source item code `19`, target item code `0`, work context
`1`, and item type `1`; those nulls are preserved rather than coerced.
This offline build performed zero historical-BOQ reprice operation; that is a
build-scope fact, not a live database readback claim.

The target label `2568.1.0` remains provisional. A fresh registry check and a
live D002 old-value/semantic preimage are required under separate authority
before any application may be proposed as executable.

## 3. Presentation evidence remains separate

The corrected external local PDF at SHA-256
`34ffc82354f1558d61dce036c94252d23c569975f02b3b30b4ad8f9de6b55f54`,
`1957518` bytes / `20` pages, remains presentation-only synthetic-fixture
evidence. A bounded independent comparison matched all `710` shared rows on
`display_order`, target code, name, unit, material, labor, and unit cost with
zero mismatch. The canonical JSON-plus-LF shared-projection SHA-256 is
`1a55595eb7329cd4d211b8bc987045b833701fd910003400870612d37ebee9e6` for
both sources. This does not compare category metadata, stable identity,
authentication, or database provenance, and it does not claim full-row
identity equivalence: retained ITEM-0139 has one intentional non-authoritative
fixture context/type difference outside the shared projection. The PDF remains
synthetic DRAFT/review-only evidence, not authenticated, real-data-bound, or
official.

## 4. Current route and unapproved next-gate proposal

Current route:

`Result #80 historical one-row D002 -> this local Option A package + separate synthetic PDF presentation QA -> separately approved one-use Git code/docs/tests push with automatic deployment and no DB/flag action -> separately approved D002 old-value-checked 48-row application/refreeze -> authenticated real-data DRAFT/review-only artifact proof -> separate fresh P-51/P-15 waiver and approval -> publication -> official artifacts only after publication -> ordered closeout -> P-49`

For Owner review only, the next operational proposal should remain two small,
non-overlapping one-use gates:

1. a Git code/docs/tests push whose automatic deployment performs no database,
   feature-flag, catalog, BOQ, pointer, Factor F, Auth, or RLS mutation; then
2. a later D002 gate bound to a fresh live preimage, exact `48`-row incremental
   diff, old-value checks, new review lock/hash, review-only DRAFT artifacts,
   all flags false, pointer still `2568.0.0`, and a hard stop before P-15.

This proposal text is **prepared, not approved**. Result #80 must not advance
directly to P-15. Official artifacts must not be generated or claimed before
successful publication.

## 5. Hard stop

No commit, push, network, CI, deployment, database or Production read/write,
login, live candidate application, flag change, catalog/BOQ/pointer/Factor F/
Auth/RLS mutation, P-13/P-14/P-14C replay, P-15, publication, official artifact,
or automatic next step is authorized or performed by this result.

<!-- P51_OPTION_A_LOCAL_SUCCESSOR_CANDIDATE_RESULT_V1 {"schema":"conduit-boq/p51-option-a-local-successor-candidate-result/v1","resultNumber":81,"recordedAt":"2026-08-26","candidateId":"P51-OPTION-A-CANDIDATE-20260826-V1","mode":"offline-deterministic-review-evidence-only","status":"candidate-built-not-authorized-for-application","candidatePath":"docs/plans/master-catalog/evidence/p51-option-a-v1/candidate.json","candidateSha256":"ef232f772b63d74901179304ee92553120fa497e1794016bf381b7b1447026fb","candidateBytes":416229,"candidateRowCount":710,"diffPath":"docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json","diffSha256":"f522e722a76ef78a7442c8d071abfe311be94c8b3c5d74779da499efceb5c370","diffBytes":96778,"baselineChangeCount":49,"baselineUnchangedCount":661,"d002AdditionalChangeCount":48,"d002UnchangedCount":662,"manifestPath":"docs/plans/master-catalog/evidence/p51-option-a-v1/manifest.json","manifestSha256":"f30bea1ec2646b67d2025165bf9f5e5678c9b303a66f56d2484750dbb64b52a8","manifestBytes":7371,"retainSourceVersionCount":18,"authorityExclusionCount":17,"sourceItemCodeNullCount":19,"targetItemCodeNullCount":0,"workContextCodeNullCount":1,"itemTypeCodeNullCount":1,"itemNameChangeCount":0,"unitChangeCount":0,"materialCostChangeCount":0,"baselineLaborCostChangeCount":49,"baselineUnitCostChangeCount":49,"d002AdditionalLaborCostChangeCount":48,"d002AdditionalUnitCostChangeCount":48,"missingOrBlankPriceFailsClosed":true,"d002StructuralEqualityRowCount":710,"d002StructuralEqualityPassed":true,"historicalBoqRepriceOperationPerformedByThisOfflineBuild":false,"p50cRole":"ITEM0429_AND_RESULT80_D002_SEMANTIC_ORACLE","artifactRole":"local-review-oracle-not-direct-import-payload","liveD002BindingClaimed":false,"provisionalTargetVersion":"2568.1.0","targetVersionOfficial":false,"freshRegistryCheckRequired":true,"sharedPresentationProjectionCrosscheckPassed":true,"sharedPresentationProjectionRowCount":710,"sharedPresentationProjectionMismatchCount":0,"sharedPresentationProjectionSha256":"1a55595eb7329cd4d211b8bc987045b833701fd910003400870612d37ebee9e6","fullRowIdentityCrosscheckClaimed":false,"categoryMetadataCrosscheckClaimed":false,"authenticationOrDatabaseProvenanceClaimed":false,"item0139IntentionalFixtureContextDifferenceOutsideProjection":true,"presentationPdfSha256":"34ffc82354f1558d61dce036c94252d23c569975f02b3b30b4ad8f9de6b55f54","presentationPdfBytes":1957518,"presentationPdfPageCount":20,"presentationPdfSyntheticOnly":true,"directResult80ToP15Authorized":false,"officialArtifactsOnlyAfterPublication":true,"nextGateProposalPrepared":true,"nextGateProposalApproved":false,"candidateApplicationAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"deployAuthorized":false,"flagMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"authMutationAuthorized":false,"rlsGrantMutationAuthorized":false,"p15Authorized":false,"publicationAuthorized":false,"officialArtifactGenerated":false,"automaticNextStep":false} -->
