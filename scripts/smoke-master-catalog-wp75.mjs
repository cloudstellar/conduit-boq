import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { readLocalEnvFile } from './local-env.mjs'

const localEnv = readLocalEnvFile()
const url = readLoopbackOrigin(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const secretKey = localEnv.LOCAL_SUPABASE_SECRET_KEY
  ?? process.env.LOCAL_SUPABASE_SECRET_KEY
const password = localEnv.LOCAL_TEST_PASSWORD ?? process.env.LOCAL_TEST_PASSWORD
const dbContainer = readLocalDbContainer(
  process.env.LOCAL_DB_CONTAINER ?? 'supabase_db_conduit-boq-local',
)
const evidenceOutputPath = readEvidenceOutputPath(process.argv.slice(2))
const authority = JSON.parse(await readFile(
  new URL('../lib/master-catalog/import/data/phase4-first-rollout-authority.json', import.meta.url),
  'utf8',
))

if (!publishableKey || !secretKey || !password) {
  throw new Error(
    'Local publishable key, secret key, and LOCAL_TEST_PASSWORD are required',
  )
}

assertTrackedTreeClean()

const service = client(secretKey)
const adminA = client(publishableKey)
const adminB = client(publishableKey)
const staff = client(publishableKey)
const anonymous = client(publishableKey)

let currentStage = 'initialize Local WP-7.5 harness'
let originalAdminFlag
let originalNewIdentityFlag
let originalRetirementFlag
let originalAdminStatus
let originalPointerId
let fixtureVersionId
let injectedFailureInstalled = false

try {
  currentStage = 'sign in Local actors'
  const adminUser = await signIn(adminA, 'local.admin@ntplc.co.th')
  await signIn(adminB, 'local.admin@ntplc.co.th')
  await signIn(staff, 'local.staff@ntplc.co.th')

  currentStage = 'verify schema, grants, RLS, and temp-aware function lint'
  const schemaContract = readSchemaContract()
  assert(schemaContract.placement_revision_column === true, 'Placement revision column is missing')
  assert(schemaContract.review_rls === true, 'Placement-review RLS is disabled')
  assert(schemaContract.review_policy_count === 1, 'Placement-review policy is incomplete')
  assert(schemaContract.display_order_deferrable === true, 'Display-order uniqueness is not deferrable')
  assert(schemaContract.placement_statement_trigger_count === 3,
    'Set-based placement invalidation triggers are incomplete')
  assert(schemaContract.placement_row_trigger_count === 0,
    'Legacy row-level placement invalidation trigger remains')
  assert(schemaContract.review_trigger_count === 1,
    'Placement-review immutability trigger is incomplete')
  assert(schemaContract.auth_public_execute === true, 'Authenticated placement execute is missing')
  assert(schemaContract.anon_public_execute === false, 'Anonymous placement execute is too broad')
  assert(schemaContract.anon_private_execute === false, 'Anonymous private placement execute is too broad')
  assert(schemaContract.auth_review_select === true, 'Authenticated placement review read is missing')
  assert(schemaContract.anon_review_select === false, 'Anonymous placement review read is too broad')
  assert(schemaContract.direct_review_write_grants === 0, 'Placement review direct writes are granted')
  const tempAwareLintFindings = readTempAwarePlacementLint()
  assert(tempAwareLintFindings.length === 0, `Temp-aware placement lint found ${JSON.stringify(tempAwareLintFindings)}`)

  currentStage = 'verify disabled defaults and inactive-admin denial'
  originalAdminFlag = await readSetting('catalog_admin_enabled')
  originalNewIdentityFlag = await readSetting('catalog_new_identity_enabled')
  originalRetirementFlag = await readSetting('catalog_retirement_enabled')
  assert(originalAdminFlag === false, 'Admin gate must begin disabled')
  assert(originalNewIdentityFlag === false, 'New-identity gate must begin disabled')
  assert(originalRetirementFlag === false, 'Retirement gate must begin disabled')

  originalAdminStatus = await readProfileStatus(adminUser.id)
  assert(originalAdminStatus === 'active', 'Local admin fixture must begin active')
  await setProfileStatus(adminUser.id, 'inactive')
  actionCode(
    await placeItems(adminA, {
      versionId: randomUUID(),
      lockVersion: 0,
      placementRevision: 0,
    }, [placeholderPlacement()], 'inactive admin denial', randomUUID()),
    'inactive admin placement',
    'FORBIDDEN',
  )
  await setProfileStatus(adminUser.id, originalAdminStatus)

  currentStage = 'enable only the Local admin and new-identity gates'
  await setSetting('catalog_admin_enabled', true)
  await setSetting('catalog_new_identity_enabled', true)

  currentStage = 'capture catalog, BOQ, Factor F, and pointer baselines'
  const base = await readCurrentCatalogVersion()
  originalPointerId = base.id
  assert(base.version_string === '2568.0.0', `Expected authority 2568.0.0, found ${base.version_string}`)
  assert(base.status === 'active' && base.is_default === true, 'Baseline catalog is not active/default')
  const beforeBoq = await readBoqSummary()
  const beforeFactor = await readFactorSummary()
  const beforeReviewCount = await countRows('catalog_placement_reviews')
  const nextVersion = await allocateRevisionVersion(base)

  currentStage = 'create one working draft and apply the frozen first rollout'
  let draft = await createDraft(adminA, base, nextVersion)
  fixtureVersionId = draft.versionId
  const importEvidence = await applyFirstRollout(adminA, draft)
  draft = { ...draft, lockVersion: importEvidence.lockVersion }
  const rolloutVersion = await readVersion(draft.versionId)
  assert(rolloutVersion.placement_revision === 0, 'First rollout changed placement revision without a new identity')

  currentStage = 'add one and then two identities while publication remains blocked'
  const addAuthority = await readAddAuthority(draft.versionId)
  const firstAdd = await addOneIdentity(adminA, draft, addAuthority, 'A')
  draft = { ...draft, lockVersion: firstAdd.lockVersion }
  const oneItemReadiness = await readReadiness(adminA, draft.versionId)
  assert(oneItemReadiness.newIdentityCount === 1, 'One added identity was not detected')
  assert(oneItemReadiness.placementReviewCurrent === false, 'One added identity was implicitly accepted')
  assert(oneItemReadiness.canPublish === false, 'One unplaced identity became publishable')

  const secondAdd = await addOneIdentity(adminA, draft, addAuthority, 'B')
  draft = { ...draft, lockVersion: secondAdd.lockVersion }
  const twoItemVersion = await readVersion(draft.versionId)
  const twoItemReadiness = await readReadiness(adminA, draft.versionId)
  assert(twoItemReadiness.newIdentityCount === 2, 'Two added identities were not detected')
  assert(twoItemReadiness.placementReviewCurrent === false, 'Two added identities were implicitly accepted')
  assert(twoItemReadiness.canPublish === false, 'Two unplaced identities became publishable')
  assert(twoItemVersion.placement_revision === 2, 'Each added identity did not invalidate placement once')

  const anchor = await readInheritedAnchor(draft.versionId, base.id, addAuthority.category.id)
  const crossCategoryAnchor = await readCrossCategoryInheritedAnchor(
    draft.versionId,
    base.id,
    addAuthority.category.id,
  )
  const validTwoPlacements = buildPlacements(
    [firstAdd.row, secondAdd.row],
    addAuthority.category.id,
    anchor.identity_id,
  )

  currentStage = 'reject invalid scope, order, anchors, stale state, and unauthorized roles'
  actionCode(
    await placeItems(adminA, placementState(draft, twoItemVersion), validTwoPlacements.slice(0, 1), 'incomplete batch', randomUUID()),
    'incomplete placement batch',
    'PLACEMENT_SCOPE_INVALID',
  )
  actionCode(
    await placeItems(
      adminA,
      placementState(draft, twoItemVersion),
      validTwoPlacements.map((row, index) => ({ ...row, batchOrder: index * 2 })),
      'gapped batch order',
      randomUUID(),
    ),
    'gapped placement batch',
    'PLACEMENT_ORDER_INVALID',
  )
  actionCode(
    await placeItems(
      adminA,
      placementState(draft, twoItemVersion),
      validTwoPlacements.map((row) => ({ ...row, batchOrder: 0 })),
      'duplicate batch order',
      randomUUID(),
    ),
    'duplicate placement batch order',
    'PLACEMENT_SCOPE_INVALID',
  )
  actionCode(
    await placeItems(
      adminA,
      placementState(draft, twoItemVersion),
      validTwoPlacements.map((row) => ({ ...row, anchorIdentityId: crossCategoryAnchor.identity_id })),
      'cross-category anchor',
      randomUUID(),
    ),
    'cross-category anchor',
    'PLACEMENT_ANCHOR_INVALID',
  )
  actionCode(
    await placeItems(
      adminA,
      placementState(draft, twoItemVersion),
      validTwoPlacements.map((row) => ({ ...row, anchorIdentityId: firstAdd.row.identity_id })),
      'new-identity anchor',
      randomUUID(),
    ),
    'new-identity anchor',
    'PLACEMENT_ANCHOR_INVALID',
  )
  actionCode(
    await placeItems(
      adminA,
      { ...placementState(draft, twoItemVersion), lockVersion: Math.max(0, draft.lockVersion - 1) },
      validTwoPlacements,
      'stale lock',
      randomUUID(),
    ),
    'stale placement lock',
    'DRAFT_LOCK_CONFLICT',
  )
  actionCode(
    await placeItems(
      adminA,
      { ...placementState(draft, twoItemVersion), placementRevision: Math.max(0, twoItemVersion.placement_revision - 1) },
      validTwoPlacements,
      'stale placement revision',
      randomUUID(),
    ),
    'stale placement revision',
    'PLACEMENT_REVISION_CONFLICT',
  )
  actionCode(
    await placeItems(staff, placementState(draft, twoItemVersion), validTwoPlacements, 'staff denial', randomUUID()),
    'staff placement',
    'FORBIDDEN',
  )
  const anonymousPlacement = await placeItems(
    anonymous,
    placementState(draft, twoItemVersion),
    validTwoPlacements,
    'anonymous denial',
    randomUUID(),
  )
  assert(Boolean(anonymousPlacement.error), 'Anonymous caller executed placement')
  await assertDirectReviewWritesDenied()

  currentStage = 'inject a mid-operation failure and prove complete rollback'
  const beforeInjectedFailure = await readDraftPlacementSnapshot(draft.versionId)
  installInjectedFailureTrigger()
  injectedFailureInstalled = true
  const injectedResult = await placeItems(
    adminA,
    placementState(draft, twoItemVersion),
    validTwoPlacements,
    'injected rollback',
    randomUUID(),
  )
  assert(Boolean(injectedResult.error), 'Injected placement failure unexpectedly succeeded')
  dropInjectedFailureTrigger()
  injectedFailureInstalled = false
  assertStableEqual(
    await readDraftPlacementSnapshot(draft.versionId),
    beforeInjectedFailure,
    'Injected placement failure left a partial mutation',
  )

  currentStage = 'race two valid placements and verify replay semantics'
  const raceAttempts = [
    {
      target: adminA,
      requestId: randomUUID(),
      reason: 'concurrent placement A',
    },
    {
      target: adminB,
      requestId: randomUUID(),
      reason: 'concurrent placement B',
    },
  ]
  const raceResults = await Promise.all(raceAttempts.map((attempt) => placeItems(
    attempt.target,
    placementState(draft, twoItemVersion),
    validTwoPlacements,
    attempt.reason,
    attempt.requestId,
  )))
  const winnerIndexes = raceResults
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => !result.error && result.data?.ok === true)
    .map(({ index }) => index)
  assert(
    winnerIndexes.length === 1,
    `Placement race did not produce exactly one winner: ${JSON.stringify(
      raceResults.map((result) => ({
        transportCode: result.error?.code ?? null,
        transportMessage: result.error?.message ?? null,
        envelope: result.data ?? null,
      })),
    )}`,
  )
  const winnerIndex = winnerIndexes[0]
  const loserIndex = winnerIndex === 0 ? 1 : 0
  const firstPlacement = actionOk(raceResults[winnerIndex], 'placement race winner')
  actionCode(raceResults[loserIndex], 'placement race loser', 'DRAFT_LOCK_CONFLICT')
  const winningAttempt = raceAttempts[winnerIndex]
  const replay = actionOk(
    await placeItems(
      winningAttempt.target,
      placementState(draft, twoItemVersion),
      validTwoPlacements,
      winningAttempt.reason,
      winningAttempt.requestId,
    ),
    'placement replay',
  )
  assert(replay.duplicateRequest === true, 'Exact placement replay was not idempotent')
  assert(replay.changeSetId === firstPlacement.changeSetId, 'Placement replay returned another change set')
  actionCode(
    await placeItems(
      winningAttempt.target,
      placementState(draft, twoItemVersion),
      validTwoPlacements,
      `${winningAttempt.reason} mismatch`,
      winningAttempt.requestId,
    ),
    'placement request mismatch',
    'REQUEST_ID_PAYLOAD_MISMATCH',
  )

  currentStage = 'verify accepted order, shifted-row audit, review, and RLS reads'
  await assertPlacementResult({
    versionId: draft.versionId,
    baseVersionId: base.id,
    anchorIdentityId: anchor.identity_id,
    newRows: [firstAdd.row, secondAdd.row],
    placementResult: firstPlacement,
  })
  const firstAcceptedReadiness = await readReadiness(adminA, draft.versionId)
  assert(firstAcceptedReadiness.placementReviewCurrent === true, 'Accepted placement is not current')
  assert(firstAcceptedReadiness.canPublish === true, `Accepted placement is not publishable: ${JSON.stringify(firstAcceptedReadiness)}`)
  const adminReviews = await adminA
    .from('catalog_placement_reviews')
    .select('id')
    .eq('version_id', draft.versionId)
  if (adminReviews.error) throw adminReviews.error
  assert(adminReviews.data.length === 1, 'Active admin did not read the accepted review')
  const staffReviews = await staff
    .from('catalog_placement_reviews')
    .select('id')
    .eq('version_id', draft.versionId)
  if (staffReviews.error) throw staffReviews.error
  assert(staffReviews.data.length === 0, 'Staff read placement reviews through RLS')

  currentStage = 'add a third identity and prove accepted placement becomes stale'
  draft = { ...draft, lockVersion: firstPlacement.lockVersion }
  const thirdAdd = await addOneIdentity(adminA, draft, addAuthority, 'C')
  draft = { ...draft, lockVersion: thirdAdd.lockVersion }
  const staleVersion = await readVersion(draft.versionId)
  const staleReadiness = await readReadiness(adminA, draft.versionId)
  assert(staleVersion.placement_revision === firstPlacement.placementRevision + 1, 'New add did not advance placement revision')
  assert(staleReadiness.newIdentityCount === 3, 'Third identity was not included in placement scope')
  assert(staleReadiness.placementReviewCurrent === false, 'Prior placement stayed current after a new add')
  assert(staleReadiness.canPublish === false, 'Stale placement remained publishable')

  currentStage = 'replace the stale review with one complete three-item placement'
  const validThreePlacements = buildPlacements(
    [firstAdd.row, secondAdd.row, thirdAdd.row],
    addAuthority.category.id,
    anchor.identity_id,
  )
  const secondPlacement = actionOk(
    await placeItems(
      adminA,
      placementState(draft, staleVersion),
      validThreePlacements,
      'replace stale placement review',
      randomUUID(),
    ),
    'replacement placement',
  )
  await assertPlacementResult({
    versionId: draft.versionId,
    baseVersionId: base.id,
    anchorIdentityId: anchor.identity_id,
    newRows: [firstAdd.row, secondAdd.row, thirdAdd.row],
    placementResult: secondPlacement,
  })

  currentStage = 'prove a normal item edit preserves placement acceptance'
  draft = { ...draft, lockVersion: secondPlacement.lockVersion }
  const revisionBeforeNormalEdit = (await readVersion(draft.versionId)).placement_revision
  const normalEdit = actionOk(
    await applyManual(adminA, draft, [{
      action: 'update',
      targetIdentityId: thirdAdd.row.identity_id,
      legacyItemCode: thirdAdd.row.item_code,
      itemName: `${thirdAdd.row.item_name} ตรวจทานแล้ว`,
      identityOutcome: 'update',
      priceAuthorityReference: 'LOCAL-WP75-NORMAL-EDIT',
    }], 'normal non-placement edit'),
    'normal non-placement edit',
  )
  draft = { ...draft, lockVersion: normalEdit.lockVersion }
  const versionAfterNormalEdit = await readVersion(draft.versionId)
  const readinessAfterNormalEdit = await readReadiness(adminA, draft.versionId)
  assert(versionAfterNormalEdit.placement_revision === revisionBeforeNormalEdit, 'Normal edit invalidated placement')
  assert(readinessAfterNormalEdit.placementReviewCurrent === true, 'Normal edit made accepted placement stale')
  assert(readinessAfterNormalEdit.canPublish === true, 'Normal edit made the draft unpublishable')

  currentStage = 'publish the exact ordered candidate and verify independent canonical hash'
  const publication = actionOk(await publish(
    adminA,
    draft,
    {
      effectiveDate: '2026-07-15',
      approvalReference: 'LOCAL-WP75-REHEARSAL-ONLY-NOT-PRODUCTION',
      approvalDocumentDate: '2026-07-15',
      physicalArchiveReference: 'local/master-catalog/wp75/rehearsal-only',
    },
    'publish placed candidate',
  ), 'publish placed candidate')
  const publishedVersion = await readVersion(draft.versionId)
  assert(publication.itemCount === 713, `Expected 713 published rows, found ${publication.itemCount}`)
  assert(publishedVersion.dataset_hash === publication.datasetHash, 'Stored and returned dataset hashes differ')
  assert(await readCurrentPointer() === draft.versionId, 'Publish did not move the Local pointer')
  const independentHash = readIndependentCanonicalHash(draft.versionId)
  assert(independentHash.itemCount === 713, 'Independent canonical snapshot has the wrong row count')
  assert(independentHash.datasetHash === publication.datasetHash, 'Independent canonical hash differs from publication')
  assertPublishedReviewImmutable(secondPlacement.placementReviewId)

  currentStage = 'restore authority pointer and verify final cleanup invariants'
  await restorePointer(adminA, base.id, 'WP-7.5 restore Production authority pointer')
  assert(await readCurrentPointer() === base.id, 'WP-7.5 did not restore 2568.0.0')
  assertStableEqual(await readBoqSummary(), beforeBoq, 'WP-7.5 changed BOQ bindings')
  assertStableEqual(await readFactorSummary(), beforeFactor, 'WP-7.5 changed Factor F state')
  const workingDraftCount = await countRows(
    'price_list_versions',
    (query) => query.eq('status', 'draft'),
  )
  assert(workingDraftCount === 0, `WP-7.5 left ${workingDraftCount} working drafts`)
  await setSetting('catalog_new_identity_enabled', originalNewIdentityFlag)
  await setSetting('catalog_retirement_enabled', originalRetirementFlag)
  await setSetting('catalog_admin_enabled', originalAdminFlag)
  assert(await readSetting('catalog_new_identity_enabled') === false, 'New-identity flag was not restored')
  assert(await readSetting('catalog_retirement_enabled') === false, 'Retirement flag was not restored')
  assert(await readSetting('catalog_admin_enabled') === false, 'Admin flag was not restored')

  const evidence = {
    schemaVersion: 2,
    status: 'passed',
    generatedAt: new Date().toISOString(),
    gitCommit: currentCommit(),
    environment: 'local',
    migration: {
      file: 'migrations/021_master_catalog_phase4_placement_governance.sql',
      sha256: fileSha256('migrations/021_master_catalog_phase4_placement_governance.sql'),
      includedInBootstrapSource: true,
      bootstrapExecutionProvenance: 'external-p36-gate',
    },
    schemaContract: {
      ...schemaContract,
      tempAwareLintFindings,
      standardLintKnownTempTableFinding: true,
    },
    baseVersion: base.version_string,
    candidate: {
      versionId: draft.versionId,
      versionString: publishedVersion.version_string,
      itemCount: publication.itemCount,
      datasetHash: publication.datasetHash,
      independentDatasetHash: independentHash.datasetHash,
      canonicalJsonBytes: independentHash.canonicalJsonBytes,
    },
    import: importEvidence,
    placement: {
      oneItemBlocked: true,
      twoItemsBlocked: true,
      incompleteBatchDenied: true,
      gappedOrderDenied: true,
      duplicateOrderDenied: true,
      crossCategoryAnchorDenied: true,
      newIdentityAnchorDenied: true,
      staleLockDenied: true,
      staleRevisionDenied: true,
      inactiveAdminDenied: true,
      staffDenied: true,
      anonymousDenied: true,
      directReviewWritesDenied: true,
      injectedFailureRolledBack: true,
      concurrentWinnerCount: winnerIndexes.length,
      concurrentLoserCode: 'DRAFT_LOCK_CONFLICT',
      replayDuplicate: replay.duplicateRequest,
      replayMismatchDenied: true,
      firstPlacementRevision: firstPlacement.placementRevision,
      staleAfterThirdAdd: true,
      finalPlacementRevision: secondPlacement.placementRevision,
      normalEditPreservedPlacementRevision: true,
      inheritedOrderPreserved: true,
      contiguousOrder: true,
      shiftedRowsAudited: true,
    },
    reviewsAdded: (await countRows('catalog_placement_reviews')) - beforeReviewCount,
    pointerRestored: true,
    workingDraftsRemaining: workingDraftCount,
    boqUnchanged: true,
    factorFUnchanged: true,
    featureFlagsRestored: true,
    productionTouched: false,
  }

  currentStage = 'write Local WP-7.5 evidence'
  if (evidenceOutputPath) {
    await mkdir(dirname(evidenceOutputPath), { recursive: true })
    await writeFile(evidenceOutputPath, `${JSON.stringify(evidence, null, 2)}\n`, {
      flag: 'wx',
    })
  }
  console.log(JSON.stringify(evidence, null, 2))
} catch (error) {
  throw new Error(formatHarnessError(currentStage, error))
} finally {
  if (injectedFailureInstalled) {
    try {
      dropInjectedFailureTrigger()
    } catch {
      // The failing run remains failed; later cleanup assertions will expose residue.
    }
  }
  if (originalPointerId) {
    await restoreOriginalPointer(originalPointerId).catch(() => {})
  }
  if (fixtureVersionId) {
    await abandonFixtureDraft(fixtureVersionId).catch(() => {})
  }
  if (originalAdminStatus) {
    const { data: userData } = await adminA.auth.getUser().catch(() => ({ data: null }))
    if (userData?.user?.id) {
      await setProfileStatus(userData.user.id, originalAdminStatus).catch(() => {})
    }
  }
  if (typeof originalNewIdentityFlag !== 'undefined') {
    await setSetting('catalog_new_identity_enabled', originalNewIdentityFlag).catch(() => {})
  }
  if (typeof originalRetirementFlag !== 'undefined') {
    await setSetting('catalog_retirement_enabled', originalRetirementFlag).catch(() => {})
  }
  if (typeof originalAdminFlag !== 'undefined') {
    await setSetting('catalog_admin_enabled', originalAdminFlag).catch(() => {})
  }
  await Promise.all([
    adminA.auth.signOut().catch(() => {}),
    adminB.auth.signOut().catch(() => {}),
    staff.auth.signOut().catch(() => {}),
  ])
}

function client(key) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function signIn(target, email) {
  const { data, error } = await target.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error(`Local sign-in returned no user for ${email}`)
  return data.user
}

async function readSetting(key) {
  const { data, error } = await service
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error) throw error
  return data.value
}

async function setSetting(key, value) {
  const { data, error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', key)
    .select('key')
    .single()
  if (error) throw error
  assert(data.key === key, `Setting ${key} was not updated`)
}

async function readProfileStatus(userId) {
  const { data, error } = await service
    .from('user_profiles')
    .select('status')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data.status
}

async function setProfileStatus(userId, status) {
  const { data, error } = await service
    .from('user_profiles')
    .update({ status })
    .eq('id', userId)
    .select('id')
    .single()
  if (error) throw error
  assert(data.id === userId, 'Local admin status was not updated')
}

async function readCurrentCatalogVersion() {
  return readVersion(await readCurrentPointer())
}

async function readVersion(versionId) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('id,version_string,major,minor,patch,status,is_default,based_on_version_id,lock_version,placement_revision,item_count,dataset_hash')
    .eq('id', versionId)
    .single()
  if (error) throw error
  return data
}

async function readCurrentPointer() {
  const { data, error } = await service
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (error) throw error
  return data.version_id
}

async function allocateRevisionVersion(base) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('minor')
    .eq('major', base.major)
  if (error) throw error
  const maxMinor = Math.max(Number(base.minor), ...(data ?? []).map((row) => Number(row.minor)))
  return { major: Number(base.major), minor: maxMinor + 1, patch: 0 }
}

async function createDraft(target, base, version) {
  const result = actionOk(await target.rpc('create_catalog_draft', {
    p_base_version_id: base.id,
    p_version_major: version.major,
    p_version_minor: version.minor,
    p_version_patch: version.patch,
    p_name: 'Local WP-7.5 placement evidence',
    p_reason: 'WP-7.5 Local-only placement evidence',
    p_request_id: randomUUID(),
  }), 'create WP-7.5 draft')
  return { versionId: result.versionId, lockVersion: result.lockVersion }
}

async function applyFirstRollout(target, draft) {
  const { data: groups, error: groupsError } = await service
    .from('catalog_code_groups')
    .select('id,work_context_code,item_type_code')
    .eq('version_id', draft.versionId)
  if (groupsError) throw groupsError
  const groupsByCode = new Map(groups.map((group) => [
    `${group.work_context_code}:${group.item_type_code}`,
    group.id,
  ]))
  const rows = authority.mappings.map((mapping) => {
    if (mapping.identity_outcome === 'retain') {
      return {
        action: 'retain',
        targetIdentityId: mapping.identity_id,
        legacyItemCode: mapping.legacy_item_code,
        canonicalCode: mapping.target_item_code,
        identityOutcome: 'retain',
      }
    }
    const codeGroupId = groupsByCode.get(
      `${mapping.work_context_code}:${mapping.item_type_code}`,
    )
    assert(codeGroupId, `Draft group missing for ${mapping.target_item_code}`)
    return {
      action: 'recode',
      targetIdentityId: mapping.identity_id,
      legacyItemCode: mapping.legacy_item_code,
      canonicalCode: mapping.target_item_code,
      codeGroupId,
      workContextCode: mapping.work_context_code,
      itemTypeCode: mapping.item_type_code,
      identityOutcome: 'recode',
    }
  })
  const validationRequestId = randomUUID()
  const payload = {
    schemaVersion: 'catalog-import-payload/2',
    requestId: validationRequestId,
    versionId: draft.versionId,
    expectedLockVersion: draft.lockVersion,
    mode: 'full',
    parserProfileId: 'nt-item-master-2568-v1',
    parserProfileVersion: '1',
    source: {
      filename: 'WP75-LOCAL-FIRST-ROLLOUT.xlsx',
      sizeBytes: 710,
      sha256: 'c'.repeat(64),
      physicalArchiveReference: 'local/master-catalog/wp75/source',
    },
    rows,
  }
  const normalizedPayloadHash = createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
  const validation = actionOk(await target.rpc('apply_catalog_changes', {
    p_version_id: draft.versionId,
    p_change_payload: { operation: 'import_validate', payload, normalizedPayloadHash },
    p_expected_lock_version: draft.lockVersion,
    p_reason: 'WP-7.5 validate frozen first rollout',
    p_request_id: validationRequestId,
    p_import_id: null,
  }), 'validate WP-7.5 first rollout')
  const apply = actionOk(await target.rpc('apply_catalog_changes', {
    p_version_id: draft.versionId,
    p_change_payload: { operation: 'import_apply', payload, normalizedPayloadHash },
    p_expected_lock_version: draft.lockVersion,
    p_reason: 'WP-7.5 apply frozen first rollout',
    p_request_id: randomUUID(),
    p_import_id: validation.importId,
  }), 'apply WP-7.5 first rollout')
  assert(apply.changedItems === 709, `Expected 709 first-rollout changes, found ${apply.changedItems}`)
  return {
    importId: validation.importId,
    lockVersion: apply.lockVersion,
    changedItems: apply.changedItems,
    normalizedPayloadHash,
  }
}

async function readAddAuthority(versionId) {
  const [categoryResult, groupResult] = await Promise.all([
    service.from('price_list_categories')
      .select('id,code')
      .eq('version_id', versionId)
      .order('display_order')
      .order('id')
      .limit(1)
      .single(),
    service.from('catalog_code_groups')
      .select('id,work_context_code,item_type_code')
      .eq('version_id', versionId)
      .order('display_order')
      .order('id')
      .limit(1)
      .single(),
  ])
  if (categoryResult.error) throw categoryResult.error
  if (groupResult.error) throw groupResult.error
  return { category: categoryResult.data, group: groupResult.data }
}

async function addOneIdentity(target, draft, addAuthority, suffix) {
  const itemName = `รายการทดสอบ WP-7.5 ${suffix} ${randomUUID().slice(0, 8)}`
  const result = actionOk(await applyManual(target, draft, [{
    action: 'add',
    categoryId: addAuthority.category.id,
    categoryCode: addAuthority.category.code,
    codeGroupId: addAuthority.group.id,
    workContextCode: addAuthority.group.work_context_code,
    itemTypeCode: addAuthority.group.item_type_code,
    itemName,
    unit: 'รายการ',
    materialCost: '10.00',
    laborCost: '5.00',
    unitCost: '15.00',
    identityOutcome: 'candidate_add',
    priceAuthorityReference: 'LOCAL-WP75-TEST-AUTHORITY',
  }], `add identity ${suffix}`), `add identity ${suffix}`)
  const { data: row, error } = await service
    .from('price_list')
    .select('identity_id,item_code,item_name,category_id,display_order')
    .eq('version_id', draft.versionId)
    .eq('item_name', itemName)
    .single()
  if (error) throw error
  return { lockVersion: result.lockVersion, row }
}

function applyManual(target, draft, changes, reason) {
  return target.rpc('apply_catalog_changes', {
    p_version_id: draft.versionId,
    p_change_payload: { operation: 'manual', changes },
    p_expected_lock_version: draft.lockVersion,
    p_reason: `WP-7.5 ${reason}`,
    p_request_id: randomUUID(),
    p_import_id: null,
  })
}

async function readInheritedAnchor(versionId, baseVersionId, categoryId) {
  const [candidateRows, baseRows] = await Promise.all([
    readOrderedRows(versionId),
    readOrderedRows(baseVersionId),
  ])
  const baseIdentities = new Set(baseRows.map((row) => row.identity_id))
  const anchor = candidateRows.find((row) => (
    row.category_id === categoryId && baseIdentities.has(row.identity_id)
  ))
  assert(anchor, 'No inherited anchor exists in the selected category')
  return anchor
}

async function readCrossCategoryInheritedAnchor(versionId, baseVersionId, categoryId) {
  const [candidateRows, baseRows] = await Promise.all([
    readOrderedRows(versionId),
    readOrderedRows(baseVersionId),
  ])
  const baseIdentities = new Set(baseRows.map((row) => row.identity_id))
  const anchor = candidateRows.find((row) => (
    row.category_id !== categoryId && baseIdentities.has(row.identity_id)
  ))
  assert(anchor, 'No cross-category inherited anchor exists for the negative case')
  return anchor
}

function buildPlacements(rows, categoryId, anchorIdentityId) {
  return rows.map((row, batchOrder) => ({
    identityId: row.identity_id,
    categoryId,
    anchorIdentityId,
    relation: 'after',
    batchOrder,
  }))
}

function placeholderPlacement() {
  return {
    identityId: randomUUID(),
    categoryId: randomUUID(),
    anchorIdentityId: randomUUID(),
    relation: 'after',
    batchOrder: 0,
  }
}

function placementState(draft, version) {
  return {
    versionId: draft.versionId,
    lockVersion: draft.lockVersion,
    placementRevision: version.placement_revision,
  }
}

function placeItems(target, state, placements, reason, requestId) {
  return target.rpc('place_catalog_items', {
    p_version_id: state.versionId,
    p_expected_lock_version: state.lockVersion,
    p_expected_placement_revision: state.placementRevision,
    p_placements: placements,
    p_reason: `WP-7.5 ${reason}`,
    p_request_id: requestId,
  })
}

async function readReadiness(target, versionId) {
  const { data, error } = await target.rpc('get_catalog_publish_readiness', {
    p_version_id: versionId,
  })
  if (error) throw error
  return data
}

async function assertDirectReviewWritesDenied() {
  const adminInsert = await adminA.from('catalog_placement_reviews').insert({})
  assert(Boolean(adminInsert.error), 'Authenticated admin inserted a placement review directly')
  const serviceInsert = await service.from('catalog_placement_reviews').insert({})
  assert(Boolean(serviceInsert.error), 'Service role inserted a placement review directly')
}

async function readDraftPlacementSnapshot(versionId) {
  const [version, rows, reviewCount, placementChangeCount] = await Promise.all([
    readVersion(versionId),
    readOrderedRows(versionId),
    countRows('catalog_placement_reviews', (query) => query.eq('version_id', versionId)),
    countRows('catalog_change_sets', (query) => query
      .eq('version_id', versionId)
      .eq('change_type', 'placement')),
  ])
  return {
    version: {
      status: version.status,
      lockVersion: version.lock_version,
      placementRevision: version.placement_revision,
      itemCount: version.item_count,
    },
    rows,
    reviewCount,
    placementChangeCount,
  }
}

async function readOrderedRows(versionId) {
  const { data, error } = await service
    .from('price_list')
    .select('identity_id,item_code,item_name,category_id,display_order')
    .eq('version_id', versionId)
    .order('display_order')
    .order('identity_id')
  if (error) throw error
  return data
}

async function assertPlacementResult({
  versionId,
  baseVersionId,
  anchorIdentityId,
  newRows,
  placementResult,
}) {
  const [candidateRows, baseRows, reviewResult, changeItemCount] = await Promise.all([
    readOrderedRows(versionId),
    readOrderedRows(baseVersionId),
    service.from('catalog_placement_reviews')
      .select('id,placement_revision,change_set_id,new_identity_count,affected_row_count')
      .eq('id', placementResult.placementReviewId)
      .single(),
    countRows('catalog_change_items', (query) => query
      .eq('change_set_id', placementResult.changeSetId)
      .eq('action', 'place')),
  ])
  if (reviewResult.error) throw reviewResult.error
  assert(candidateRows.length === baseRows.length + newRows.length, 'Placed catalog row count is wrong')
  assert(
    candidateRows.every((row, index) => row.display_order === index),
    'Placed display order is not contiguous and zero-based',
  )
  const baseIds = baseRows.map((row) => row.identity_id)
  const baseSet = new Set(baseIds)
  const inheritedCandidateIds = candidateRows
    .filter((row) => baseSet.has(row.identity_id))
    .map((row) => row.identity_id)
  assertStableEqual(inheritedCandidateIds, baseIds, 'Placement changed inherited relative order')
  const anchorIndex = candidateRows.findIndex((row) => row.identity_id === anchorIdentityId)
  const expectedNewIds = newRows.map((row) => row.identity_id)
  assertStableEqual(
    candidateRows.slice(anchorIndex + 1, anchorIndex + 1 + expectedNewIds.length)
      .map((row) => row.identity_id),
    expectedNewIds,
    'Placed identities are not immediately after the selected anchor in batch order',
  )
  assert(reviewResult.data.placement_revision === placementResult.placementRevision, 'Review revision differs from result')
  assert(reviewResult.data.change_set_id === placementResult.changeSetId, 'Review points to another change set')
  assert(reviewResult.data.new_identity_count === newRows.length, 'Review new-identity count is wrong')
  assert(reviewResult.data.affected_row_count === placementResult.affectedRows, 'Review affected count differs from result')
  assert(changeItemCount === placementResult.affectedRows, 'Shifted/new row audit is incomplete')
}

function publish(target, draft, metadata, reason) {
  return target.rpc('publish_catalog_version', {
    p_version_id: draft.versionId,
    p_expected_lock_version: draft.lockVersion,
    p_approval_metadata: metadata,
    p_reason: `WP-7.5 ${reason}`,
    p_request_id: randomUUID(),
  })
}

async function restorePointer(target, versionId, reason) {
  return actionOk(await target.rpc('restore_catalog_pointer', {
    p_target_version_id: versionId,
    p_reason: reason,
    p_request_id: randomUUID(),
  }), reason)
}

async function restoreOriginalPointer(versionId) {
  if (await readCurrentPointer() === versionId) return
  const result = await adminA.rpc('restore_catalog_pointer', {
    p_target_version_id: versionId,
    p_reason: 'WP-7.5 harness cleanup after failure',
    p_request_id: randomUUID(),
  })
  if (!result.error && result.data?.ok === true) return
  throw new Error(`Could not restore Local catalog pointer: ${JSON.stringify(result.error ?? result.data)}`)
}

async function abandonFixtureDraft(versionId) {
  const version = await readVersion(versionId)
  if (version.status !== 'draft') return
  const result = await adminA.rpc('abandon_catalog_draft', {
    p_version_id: versionId,
    p_expected_lock_version: version.lock_version,
    p_reason: 'WP-7.5 harness cleanup after failure',
    p_request_id: randomUUID(),
  })
  actionOk(result, 'abandon failed WP-7.5 fixture')
}

async function readBoqSummary() {
  const { data, error } = await service
    .from('boq')
    .select('id,price_list_version_id,factor_reference_version_id')
    .order('id')
  if (error) throw error
  return data
}

async function readFactorSummary() {
  const { data: pointer, error: pointerError } = await service
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError
  const rows = await countRows('factor_reference_rows')
  return { pointer: pointer.version_id, rows }
}

async function countRows(table, scope = (query) => query) {
  const { count, error } = await scope(
    service.from(table).select('*', { count: 'exact', head: true }),
  )
  if (error) throw error
  return count ?? 0
}

function readSchemaContract() {
  return psqlJson(`
    SELECT json_build_object(
      'placement_revision_column', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'price_list_versions'
          AND column_name = 'placement_revision' AND is_nullable = 'NO'
      ),
      'review_rls', EXISTS (
        SELECT 1 FROM pg_class table_row
        JOIN pg_namespace schema_row ON schema_row.oid = table_row.relnamespace
        WHERE schema_row.nspname = 'public'
          AND table_row.relname = 'catalog_placement_reviews'
          AND table_row.relrowsecurity
      ),
      'review_policy_count', (
        SELECT count(*) FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'catalog_placement_reviews'
          AND policyname = 'catalog_placement_reviews_admin_select'
      ),
      'display_order_deferrable', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.price_list'::regclass
          AND conname = 'uq_price_list_version_display_order'
          AND convalidated AND condeferrable
      ),
      'placement_statement_trigger_count', (
        SELECT count(*) FROM pg_trigger trigger_row
        WHERE trigger_row.tgrelid = 'public.price_list'::regclass
          AND trigger_row.tgname IN (
            'trigger_touch_catalog_placement_revision_insert',
            'trigger_touch_catalog_placement_revision_update',
            'trigger_touch_catalog_placement_revision_delete'
          )
          AND trigger_row.tgfoid =
            'private.touch_catalog_placement_revision()'::regprocedure
          AND (trigger_row.tgtype & 1) = 0
          AND trigger_row.tgenabled = 'O'
          AND NOT trigger_row.tgisinternal
      ),
      'placement_row_trigger_count', (
        SELECT count(*) FROM pg_trigger trigger_row
        WHERE trigger_row.tgrelid = 'public.price_list'::regclass
          AND trigger_row.tgfoid =
            'private.touch_catalog_placement_revision()'::regprocedure
          AND (trigger_row.tgtype & 1) = 1
          AND trigger_row.tgenabled = 'O'
          AND NOT trigger_row.tgisinternal
      ),
      'review_trigger_count', (
        SELECT count(*) FROM pg_trigger trigger_row
        WHERE trigger_row.tgrelid = 'public.catalog_placement_reviews'::regclass
          AND trigger_row.tgname = 'trigger_prevent_catalog_placement_review_mutation'
          AND trigger_row.tgenabled = 'O'
          AND NOT trigger_row.tgisinternal
      ),
      'auth_public_execute', has_function_privilege(
        'authenticated',
        'public.place_catalog_items(uuid,integer,integer,jsonb,text,uuid)',
        'EXECUTE'
      ),
      'anon_public_execute', has_function_privilege(
        'anon',
        'public.place_catalog_items(uuid,integer,integer,jsonb,text,uuid)',
        'EXECUTE'
      ),
      'anon_private_execute', has_function_privilege(
        'anon',
        'private.place_catalog_items_impl(uuid,integer,integer,jsonb,text,uuid)',
        'EXECUTE'
      ),
      'auth_review_select', has_table_privilege(
        'authenticated', 'public.catalog_placement_reviews', 'SELECT'
      ),
      'anon_review_select', has_table_privilege(
        'anon', 'public.catalog_placement_reviews', 'SELECT'
      ),
      'direct_review_write_grants', (
        SELECT count(*) FROM (VALUES ('authenticated'), ('service_role'), ('anon')) role_row(role_name)
        WHERE has_table_privilege(role_name, 'public.catalog_placement_reviews', 'INSERT')
           OR has_table_privilege(role_name, 'public.catalog_placement_reviews', 'UPDATE')
           OR has_table_privilege(role_name, 'public.catalog_placement_reviews', 'DELETE')
      )
    );
  `)
}

function readTempAwarePlacementLint() {
  const output = execPsql(`
    BEGIN;
    CREATE EXTENSION IF NOT EXISTS plpgsql_check SCHEMA extensions;
    CREATE TEMP TABLE catalog_placement_input (
      identity_id uuid PRIMARY KEY,
      category_id uuid NOT NULL,
      anchor_identity_id uuid NOT NULL,
      relation text NOT NULL CHECK (relation IN ('before', 'after')),
      batch_order integer NOT NULL UNIQUE CHECK (batch_order >= 0)
    ) ON COMMIT DROP;
    CREATE TEMP TABLE catalog_placement_target (
      identity_id uuid PRIMARY KEY,
      old_category_id uuid NOT NULL,
      old_display_order integer NOT NULL,
      old_snapshot jsonb NOT NULL,
      target_category_id uuid NOT NULL,
      target_category_code text NOT NULL,
      target_display_order integer NOT NULL UNIQUE,
      is_new_identity boolean NOT NULL
    ) ON COMMIT DROP;
    SELECT COALESCE(json_agg(finding), '[]'::json)
    FROM extensions.plpgsql_check_function(
      'private.place_catalog_items_impl(uuid,integer,integer,jsonb,text,uuid)'::regprocedure
    ) AS finding;
    ROLLBACK;
  `)
  return JSON.parse(output)
}

function installInjectedFailureTrigger() {
  execPsql(`
    CREATE OR REPLACE FUNCTION private.wp75_injected_placement_failure()
    RETURNS trigger
    LANGUAGE plpgsql
    SET search_path = ''
    AS $function$
    BEGIN
      IF current_setting('catalog.placement_write', true) = 'on' THEN
        RAISE EXCEPTION 'WP75_INJECTED_PLACEMENT_FAILURE';
      END IF;
      RETURN NULL;
    END;
    $function$;
    DROP TRIGGER IF EXISTS trigger_wp75_injected_placement_failure ON public.price_list;
    CREATE TRIGGER trigger_wp75_injected_placement_failure
      AFTER UPDATE ON public.price_list
      FOR EACH STATEMENT
      EXECUTE FUNCTION private.wp75_injected_placement_failure();
  `, false)
}

function dropInjectedFailureTrigger() {
  execPsql(`
    DROP TRIGGER IF EXISTS trigger_wp75_injected_placement_failure ON public.price_list;
    DROP FUNCTION IF EXISTS private.wp75_injected_placement_failure();
  `, false)
}

function assertPublishedReviewImmutable(reviewId) {
  assertUuid(reviewId, 'placement review ID')
  execPsql(`
    DO $test$
    BEGIN
      BEGIN
        UPDATE public.catalog_placement_reviews
        SET reason = reason || ' mutation'
        WHERE id = '${reviewId}'::uuid;
        RAISE EXCEPTION 'WP75_REVIEW_IMMUTABILITY_TEST_FAILED';
      EXCEPTION
        WHEN raise_exception THEN
          IF SQLERRM NOT LIKE 'CATALOG_PLACEMENT_REVIEW_IMMUTABLE:%' THEN
            RAISE;
          END IF;
      END;
    END;
    $test$;
  `, false)
}

function readIndependentCanonicalHash(versionId) {
  assertUuid(versionId, 'catalog version ID')
  const rows = psqlJson(`
    SELECT COALESCE(json_agg(row_to_json(canonical_row)), '[]'::json)
    FROM (
      SELECT
        item.identity_id::text AS identity_id,
        item.item_code::text AS item_code,
        item.item_name::text AS item_name,
        item.unit::text AS unit,
        to_char(item.material_cost, 'FM999999999999990.00') AS material_cost,
        to_char(item.labor_cost, 'FM999999999999990.00') AS labor_cost,
        to_char(item.unit_cost, 'FM999999999999990.00') AS unit_cost,
        category.code::text AS category_code,
        category.name::text AS category_name,
        code_group.work_context_code::text AS work_context_code,
        code_group.work_context_name_th::text AS work_context_name_th,
        code_group.item_type_code::text AS item_type_code,
        code_group.item_type_name_th::text AS item_type_name_th,
        item.is_active,
        item.display_order
      FROM public.price_list item
      LEFT JOIN public.price_list_categories category
        ON category.version_id = item.version_id
       AND category.id = item.category_id
      LEFT JOIN public.catalog_code_groups code_group
        ON code_group.version_id = item.version_id
       AND code_group.id = item.code_group_id
      WHERE item.version_id = '${versionId}'::uuid
    ) canonical_row;
  `)
  const canonicalRows = rows.map((row) => ({
    identity_id: normalizeText(row.identity_id),
    item_code: normalizeText(row.item_code),
    item_name: normalizeText(row.item_name),
    unit: normalizeText(row.unit),
    material_cost: normalizeText(row.material_cost),
    labor_cost: normalizeText(row.labor_cost),
    unit_cost: normalizeText(row.unit_cost),
    category_code: normalizeOptionalText(row.category_code),
    category_name: normalizeOptionalText(row.category_name),
    work_context_code: normalizeOptionalText(row.work_context_code),
    work_context_name_th: normalizeOptionalText(row.work_context_name_th),
    item_type_code: normalizeOptionalText(row.item_type_code),
    item_type_name_th: normalizeOptionalText(row.item_type_name_th),
    is_active: row.is_active,
    display_order: row.display_order,
  })).sort((left, right) => compareUtf8(left.item_code, right.item_code)
    || compareUtf8(left.identity_id, right.identity_id))
  const canonicalJson = `${JSON.stringify(canonicalRows)}\n`
  return {
    itemCount: canonicalRows.length,
    datasetHash: `sha256:${createHash('sha256').update(canonicalJson).digest('hex')}`,
    canonicalJsonBytes: Buffer.byteLength(canonicalJson, 'utf8'),
  }
}

function psqlJson(sql) {
  return JSON.parse(execPsql(sql))
}

function execPsql(sql, quiet = true) {
  return execFileSync('docker', [
    'exec',
    dbContainer,
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'postgres',
    '-d',
    'postgres',
    quiet ? '-qAtc' : '-qAtc',
    sql,
  ], { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 }).trim()
}

function actionOk(result, label) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  if (result.data?.ok !== true) {
    throw new Error(`${label} returned ${JSON.stringify(result.data)}`)
  }
  assert(result.data.data && typeof result.data.data === 'object', `${label} returned an invalid envelope`)
  return result.data.data
}

function actionCode(result, label, expectedCode) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  assert(result.data?.ok === false, `${label} unexpectedly succeeded`)
  assert(result.data?.error?.code === expectedCode, `${label} returned ${JSON.stringify(result.data)}`)
  return result.data
}

function assertStableEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message)
}

function normalizeText(value) {
  assert(typeof value === 'string' && value.length > 0, 'Canonical required text is invalid')
  return value.normalize('NFC')
}

function normalizeOptionalText(value) {
  return value === null || typeof value === 'undefined'
    ? null
    : normalizeText(value)
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'))
}

function assertUuid(value, label) {
  assert(
    typeof value === 'string'
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
    `${label} is not a UUID`,
  )
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function fileSha256(path) {
  return execFileSync('shasum', ['-a', '256', path], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim().split(/\s+/)[0]
}

function currentCommit() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim()
}

function assertTrackedTreeClean() {
  const status = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim()
  if (status) throw new Error('Tracked tree must be clean before recording WP-7.5 DB evidence')
}

function readEvidenceOutputPath(args) {
  if (args.length === 0) return null
  if (args.length !== 2 || args[0] !== '--output') {
    throw new Error('Usage: smoke-master-catalog-wp75.mjs [--output tmp/master-catalog/wp75-evidence/<run>.json]')
  }
  const value = args[1]
  if (!value || isAbsolute(value)) {
    throw new Error('WP-7.5 evidence path must be relative')
  }
  const evidenceRoot = resolve('tmp/master-catalog/wp75-evidence')
  const outputPath = resolve(value)
  const pathFromRoot = relative(evidenceRoot, outputPath)
  if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    throw new Error('WP-7.5 evidence output must stay under tmp/master-catalog/wp75-evidence')
  }
  if (!outputPath.endsWith('.json')) {
    throw new Error('WP-7.5 evidence output must use a .json filename')
  }
  return outputPath
}

function readLoopbackOrigin(name, value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a loopback URL for Local-only evidence`)
  }
  if (
    parsed.protocol !== 'http:'
    || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
    || !parsed.port
    || parsed.username
    || parsed.password
  ) {
    throw new Error(`${name} must be a loopback URL for Local-only evidence`)
  }
  return parsed.origin
}

function readLocalDbContainer(value) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(value)) {
    throw new Error('LOCAL_DB_CONTAINER must be a simple Local Docker container name')
  }
  return value
}

function formatHarnessError(stage, error) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === 'object' && typeof error.message === 'string'
      ? `${error.code ? `[${error.code}] ` : ''}${error.message}`
      : JSON.stringify(error ?? '')
  return `WP-7.5 stage failed: ${stage}: ${message || 'no safe error message returned'}`
}
