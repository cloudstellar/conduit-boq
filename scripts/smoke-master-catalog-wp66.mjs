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
const evidenceOutputPath = readEvidenceOutputPath(process.argv.slice(2))
const authority = JSON.parse(await readFile(
  new URL('../lib/master-catalog/import/data/phase4-first-rollout-authority.json', import.meta.url),
  'utf8',
))

if (!publishableKey || !secretKey || !password) {
  throw new Error('Local publishable key, secret key, and LOCAL_TEST_PASSWORD are required')
}

assertTrackedTreeClean()

const service = client(secretKey)
const adminA = client(publishableKey)
const adminB = client(publishableKey)
const staff = client(publishableKey)
const pending = client(publishableKey)
const suspended = client(publishableKey)
const anonymous = client(publishableKey)

let originalAdminFlag
let originalNewIdentityFlag
let originalRetirementFlag
let originalPointerId
let currentStage = 'initialize Local WP-6.6 harness'

try {
  currentStage = 'sign in Local actors'
  await signIn(adminA, 'local.admin@ntplc.co.th')
  await signIn(adminB, 'local.admin@ntplc.co.th')
  await signIn(staff, 'local.staff@ntplc.co.th')
  await signIn(pending, 'local.pending@ntplc.co.th')
  await signIn(suspended, 'local.suspended@ntplc.co.th')

  currentStage = 'verify migration schema and security postconditions'
  const schemaContract = readSchemaContract()
  assert(schemaContract.required_constraints === 5, 'Required WP-6.6 constraints are incomplete')
  assert(schemaContract.draft_identity_constraints === 5,
    'Required P-39 draft identity constraints are incomplete')
  assert(schemaContract.draft_identity_generated_columns === 2,
    'Required P-39 generated identity columns are incomplete')
  assert(schemaContract.one_draft_index === true, 'Global one-open-draft index is missing')
  assert(schemaContract.draft_reference_index === true, 'Draft-reference unique index is missing')
  assert(schemaContract.authority_fk_indexes === 2, 'Frozen authority foreign-key indexes are missing')
  assert(schemaContract.nullable_required_columns === 0, 'Required price-list columns remain nullable')
  assert(schemaContract.authority_rls_tables === 3, 'Frozen authority RLS is incomplete')
  assert(schemaContract.authority_policies === 3, 'Frozen authority policies are incomplete')
  assert(schemaContract.anon_versions_page_execute === false, 'Anon can execute the versions register')
  assert(schemaContract.auth_versions_page_execute === true, 'Authenticated register execute is missing')
  assert(schemaContract.auth_private_allocator_execute === false, 'Authenticated can execute private allocator')
  assert(schemaContract.auth_version_planner_execute === false, 'Authenticated can execute private version planner')
  assert(schemaContract.auth_draft_identity_trigger_execute === false,
    'Authenticated can execute the private draft identity trigger')
  assert(schemaContract.auth_old_create_impl_execute === false, 'Authenticated can bypass guarded draft creation')
  assert(schemaContract.anon_abandon_execute === false, 'Anon can execute draft abandon')
  assert(schemaContract.auth_abandon_execute === true, 'Authenticated draft abandon execute is missing')
  assert(schemaContract.catalog_state_policies === 7, 'Catalog state-scoped read policies are incomplete')
  assert(schemaContract.published_code_policy_exact === true,
    'Published code registry policy is not scoped by identity and code')
  assert(schemaContract.published_identity_count >= 710,
    'Published identity history is smaller than the authority baseline')
  assert(schemaContract.published_code_count >= schemaContract.published_identity_count,
    'Published code history is smaller than published identity history')
  assert(schemaContract.legacy_catalog_write_policies === 0, 'Legacy catalog DML policies remain')
  assert(schemaContract.authenticated_catalog_dml_tables === 0,
    'Authenticated retains direct DML on catalog tables')
  assert(schemaContract.pointer_audit_columns === 4, 'Pointer/draft-effect audit columns are incomplete')
  assert(schemaContract.pointer_audit_indexes === 3, 'Pointer/draft-effect audit indexes are incomplete')
  assert(schemaContract.audit_immutability_triggers === 2, 'Append-only audit triggers are incomplete')
  assert(schemaContract.create_wrapper_security_definer === false,
    'Public draft creation wrapper unexpectedly runs with owner privileges')
  assert(schemaContract.disabled_capability_count === 3, 'Catalog capabilities do not default false')
  assertDraftOnlyCodeHiddenFromStaff()

  currentStage = 'read and enable only the admin gate'
  originalAdminFlag = await readSetting('catalog_admin_enabled')
  originalNewIdentityFlag = await readSetting('catalog_new_identity_enabled')
  originalRetirementFlag = await readSetting('catalog_retirement_enabled')
  assert(originalAdminFlag === false, 'Admin gate must begin disabled on clean Local')
  assert(originalNewIdentityFlag === false, 'New-identity capability must begin disabled')
  assert(originalRetirementFlag === false, 'Retirement capability must begin disabled')
  await setSetting('catalog_admin_enabled', true)

  currentStage = 'verify frozen authority and RLS reads'
  const authorityEvidence = await verifyFrozenAuthority()
  await verifyFrozenAuthorityRoleDenial()

  currentStage = 'read baseline invariants'
  const base = await readCurrentCatalogVersion()
  originalPointerId = base.id
  assert(base.version_string === '2568.0.0', 'WP-6.6 smoke must start from 2568.0.0')
  await verifyCatalogReadBoundaries(base, schemaContract)
  await verifyPublishedMetadataNoopDenied(base)
  const beforeBoq = await readBoqSummary()
  const beforeFactor = await readFactorSummary()
  const versions = await allocateRevisionVersions(base, 4)
  const expectedTargetVersion = versionString(versions[0])

  currentStage = 'verify annual effective-year business range'
  actionCode(
    await createDraftRequest(
      adminA,
      base,
      { major: Number(base.major) + 11, minor: 0, patch: 0 },
      'out-of-range annual draft',
      randomUUID(),
    ),
    'out-of-range annual draft',
    'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE',
  )

  currentStage = 'verify server-owned next version sequence'
  actionCode(
    await createDraftRequest(
      adminA,
      base,
      versions[3],
      'out-of-sequence draft',
      randomUUID(),
    ),
    'out-of-sequence draft',
    'VERSION_SEQUENCE_STALE',
  )

  currentStage = 'verify global one-open-draft create race and replay'
  const createAttempts = [
    {
      target: adminA,
      version: versions[0],
      label: 'working draft race A',
      requestId: randomUUID(),
    },
    {
      target: adminB,
      version: versions[0],
      label: 'working draft race B',
      requestId: randomUUID(),
    },
  ]
  const createRaceResults = await Promise.all(
    createAttempts.map((attempt) => createDraftRequest(
      attempt.target,
      base,
      attempt.version,
      attempt.label,
      attempt.requestId,
    )),
  )
  const createWinners = createRaceResults
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.data?.ok === true && !result.error)
  assert(createWinners.length === 1, 'Two-session draft creation did not produce one winner')
  const createWinnerIndex = createWinners[0].index
  const createLoserIndex = createWinnerIndex === 0 ? 1 : 0
  const createWinnerAttempt = createAttempts[createWinnerIndex]
  const createWinner = actionOk(
    createRaceResults[createWinnerIndex],
    'working draft create race winner',
  )
  actionCode(
    createRaceResults[createLoserIndex],
    'working draft create race loser',
    'DRAFT_ALREADY_EXISTS',
  )
  const workingDraft = {
    versionId: createWinner.versionId,
    lockVersion: createWinner.lockVersion,
  }
  const workingDraftVersion = await readVersion(workingDraft.versionId)
  assert(workingDraftVersion.version_string === expectedTargetVersion,
    'Working draft did not claim the expected target version')
  assert(workingDraftVersion.target_version_string === expectedTargetVersion,
    'Working draft target metadata differs from its claimed tuple')
  const workingDraftAttempt = readDraftAttempt(
    workingDraftVersion.draft_reference,
    expectedTargetVersion,
  )
  assert(workingDraftAttempt === workingDraftVersion.draft_attempt,
    'Working draft did not receive an immutable draft reference')
  const createReplay = actionOk(
    await createDraftRequest(
      createWinnerAttempt.target,
      base,
      createWinnerAttempt.version,
      createWinnerAttempt.label,
      createWinnerAttempt.requestId,
    ),
    'working draft create replay',
  )
  assert(createReplay.versionId === workingDraft.versionId, 'Create replay returned another draft')
  assert(createReplay.duplicateRequest === true, 'Create replay was not marked duplicate')
  assert(createReplay.draftReference === workingDraftVersion.draft_reference,
    'Create replay omitted the immutable draft reference')
  assert(createReplay.targetVersionString === expectedTargetVersion,
    'Create replay omitted the target version')
  assert(createReplay.officialVersionString == null,
    'Create replay exposed an unissued target as an official version')
  const { data: staffDraftRows, error: staffDraftError } = await staff
    .from('price_list_versions')
    .select('id')
    .eq('id', workingDraft.versionId)
  if (staffDraftError) throw staffDraftError
  assert(staffDraftRows.length === 0, 'Non-admin read a mutable draft through catalog RLS')
  assert(
    await visibleRowCount(
      adminA,
      'price_list',
      (query) => query.eq('version_id', workingDraft.versionId),
    ) > 0,
    'Active admin could not read rows in the mutable draft',
  )
  assert(
    await visibleRowCount(
      staff,
      'price_list',
      (query) => query.eq('version_id', workingDraft.versionId),
    ) === 0,
    'Active staff read mutable draft rows through catalog RLS',
  )
  actionCode(
    await createDraftRequest(staff, base, versions[2], 'staff denied', randomUUID()),
    'non-admin draft create',
    'FORBIDDEN',
  )
  actionCode(
    await createDraftRequest(adminA, base, versions[2], 'duplicate current base', randomUUID()),
    'duplicate current-base draft create',
    'DRAFT_ALREADY_EXISTS',
  )

  currentStage = 'verify new-identity default deny and resolve-only authority'
  const addA = await approvedAddChange(workingDraft.versionId, 'A')
  actionCode(
    await applyManual(adminA, workingDraft, [addA], 'new identity default deny'),
    'new identity default deny',
    'CATALOG_NEW_IDENTITY_DISABLED',
  )
  await setSetting('catalog_new_identity_enabled', true)
  actionCode(
    await applyManual(adminA, workingDraft, [{
      ...addA,
      categoryId: randomUUID(),
    }], 'unknown category denial'),
    'unknown category denial',
    'CATALOG_AUTHORITY_NOT_FOUND',
  )
  actionCode(
    await applyManual(adminA, workingDraft, [{
      ...addA,
      canonicalCode: `${addA.workContextCode}-${addA.itemTypeCode}-001`,
    }], 'caller code denial'),
    'caller-selected code denial',
    'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
  )

  currentStage = 'verify serialized server allocation and never reuse'
  const addB = await approvedAddChange(workingDraft.versionId, 'B')
  const allocationResults = await Promise.all([
    applyManual(adminA, workingDraft, [addA], 'concurrent allocator A'),
    applyManual(adminB, workingDraft, [addB], 'concurrent allocator B'),
  ])
  const allocationWinnerIndex = allocationResults.findIndex(
    (result) => result.data?.ok === true && !result.error,
  )
  assert(allocationWinnerIndex !== -1, 'Concurrent same-draft allocation had no winner')
  const allocationLoserIndex = allocationWinnerIndex === 0 ? 1 : 0
  const allocationWinner = actionOk(
    allocationResults[allocationWinnerIndex],
    'concurrent allocator winner',
  )
  actionCode(
    allocationResults[allocationLoserIndex],
    'concurrent allocator stale loser',
    'DRAFT_LOCK_CONFLICT',
  )
  const firstAdd = allocationWinnerIndex === 0 ? addA : addB
  const secondAdd = allocationWinnerIndex === 0 ? addB : addA
  const rowA = await readDraftItemByName(workingDraft.versionId, firstAdd.itemName)
  const allocationB = actionOk(
    await applyManual(adminB, {
      ...workingDraft,
      lockVersion: allocationWinner.lockVersion,
    }, [secondAdd], 'allocator retry after lock refresh'),
    'allocator retry after lock refresh',
  )
  const rowB = await readDraftItemByName(workingDraft.versionId, secondAdd.itemName)
  assert(rowA.item_code !== rowB.item_code, 'Serialized allocators returned the same code')
  assert(codeGroupPrefix(rowA.item_code) === codeGroupPrefix(rowB.item_code), 'Allocator fixtures did not use one group')

  const withdrawA = actionOk(
    await applyManual(adminA, {
      ...workingDraft,
      lockVersion: allocationB.lockVersion,
    }, [withdrawChange(rowA)], 'withdraw allocator A'),
    'withdraw allocator A',
  )
  actionOk(
    await applyManual(adminB, {
      ...workingDraft,
      lockVersion: withdrawA.lockVersion,
    }, [withdrawChange(rowB)], 'withdraw allocator B'),
    'withdraw allocator B',
  )
  const withdrawBVersion = await readVersion(workingDraft.versionId)
  await assertWithdrawPreservedRegistry(rowA)
  await assertWithdrawPreservedRegistry(rowB)

  const addAfterWithdraw = await approvedAddChange(workingDraft.versionId, 'C')
  const afterWithdrawApply = actionOk(
    await applyManual(adminA, {
      ...workingDraft,
      lockVersion: withdrawBVersion.lock_version,
    }, [addAfterWithdraw], 'allocator after withdraw'),
    'allocator after withdraw',
  )
  const rowAfterWithdraw = await readDraftItemByName(
    workingDraft.versionId,
    addAfterWithdraw.itemName,
  )
  assert(
    codeSequence(rowAfterWithdraw.item_code) > Math.max(
      codeSequence(rowA.item_code),
      codeSequence(rowB.item_code),
    ),
    'Allocator reused a withdrawn sequence',
  )
  const withdrawC = actionOk(
    await applyManual(adminA, {
      ...workingDraft,
      lockVersion: afterWithdrawApply.lockVersion,
    }, [withdrawChange(rowAfterWithdraw)], 'withdraw allocator C'),
    'withdraw allocator C',
  )
  await assertWithdrawPreservedRegistry(rowAfterWithdraw)
  assertCapacityBoundary()
  await setSetting('catalog_new_identity_enabled', false)

  currentStage = 'verify retire, reactivate, and inherited-withdraw correction rules'
  const correctionDraft = {
    ...workingDraft,
    lockVersion: withdrawC.lockVersion,
  }
  const correctionRow = await readBaselineItem(correctionDraft.versionId)
  actionCode(
    await applyManual(adminA, correctionDraft, [retireChange(correctionRow)], 'retirement default deny'),
    'retirement default deny',
    'CATALOG_RETIREMENT_DISABLED',
  )
  await setSetting('catalog_retirement_enabled', true)
  const retireResult = actionOk(
    await applyManual(adminA, correctionDraft, [retireChange(correctionRow)], 'retire correction fixture'),
    'retire correction fixture',
  )
  await setSetting('catalog_retirement_enabled', false)
  const reactivateResult = actionOk(
    await applyManual(adminA, {
      ...correctionDraft,
      lockVersion: retireResult.lockVersion,
    }, [reactivateChange(correctionRow)], 'reactivate correction fixture'),
    'reactivate correction fixture',
  )
  actionCode(
    await applyManual(adminA, {
      ...correctionDraft,
      lockVersion: reactivateResult.lockVersion,
    }, [withdrawChange(correctionRow)], 'inherited withdraw denial'),
    'inherited withdraw denial',
    'CATALOG_WITHDRAW_NOT_ALLOWED',
  )
  const correctionHistory = await readIdentityHistory(adminA, correctionRow.identity_id)
  assert(
    correctionHistory.rows.some((row) => row.action === 'retire' && row.old_values && row.new_values),
    'Retire history is missing before/after snapshots',
  )
  assert(
    correctionHistory.rows.some((row) => row.action === 'reactivate' && row.old_values && row.new_values),
    'Reactivate history is missing before/after snapshots',
  )

  currentStage = 'verify audited abandon, replay, immutable history, and replacement'
  const abandonableDraft = {
    ...workingDraft,
    lockVersion: reactivateResult.lockVersion,
  }
  actionCode(
    await abandonDraft(staff, abandonableDraft, 'non-admin abandon', randomUUID()),
    'non-admin draft abandon',
    'FORBIDDEN',
  )
  actionCode(
    await abandonDraft(adminA, {
      ...abandonableDraft,
      lockVersion: Math.max(0, abandonableDraft.lockVersion - 1),
    }, 'stale abandon', randomUUID()),
    'stale draft abandon',
    'DRAFT_LOCK_CONFLICT',
  )
  const abandonRequestId = randomUUID()
  const abandonResult = actionOk(
    await abandonDraft(adminA, abandonableDraft, 'replace working draft', abandonRequestId),
    'abandon working draft',
  )
  const abandonReplay = actionOk(
    await abandonDraft(adminA, abandonableDraft, 'replace working draft', abandonRequestId),
    'abandon working draft replay',
  )
  assert(abandonReplay.duplicateRequest === true, 'Abandon replay was not marked duplicate')
  assert(abandonReplay.versionId === abandonResult.versionId, 'Abandon replay changed target')
  const abandonedVersion = await readVersion(workingDraft.versionId)
  assert(abandonedVersion.status === 'abandoned', 'Draft did not become abandoned')
  assert(abandonedVersion.version_string === null
    && abandonedVersion.major === null
    && abandonedVersion.minor === null
    && abandonedVersion.patch === null,
  'Abandoned draft did not release its unissued official tuple')
  assert(abandonedVersion.target_version_string === expectedTargetVersion,
    'Abandoned draft did not retain its immutable target')
  assert(abandonedVersion.draft_reference === workingDraftVersion.draft_reference,
    'Abandon changed the immutable draft reference')
  const abandonedSnapshotRows = await countRows(
    'price_list',
    (query) => query.eq('version_id', workingDraft.versionId),
  )
  assert(
    abandonedSnapshotRows === 710,
    'Abandon did not retain the full draft snapshot',
  )
  const abandonChangeSetCount = await countRows(
    'catalog_change_sets',
    (query) => query
      .eq('version_id', workingDraft.versionId)
      .eq('change_type', 'abandon'),
  )
  assert(
    abandonChangeSetCount === 1,
    'Abandon did not append exactly one audit change set',
  )
  actionCode(
    await applyManual(adminA, {
      ...workingDraft,
      lockVersion: abandonResult.lockVersion,
    }, [retireChange(correctionRow)], 'abandoned draft mutation denial'),
    'abandoned draft mutation denial',
    'DRAFT_NOT_EDITABLE',
  )
  const rolloutDraft = await createDraft(adminA, base, versions[0], 'replacement first rollout')
  const replacementDraftVersion = await readVersion(rolloutDraft.versionId)
  assert(replacementDraftVersion.target_version_string === expectedTargetVersion
    && replacementDraftVersion.version_string === expectedTargetVersion,
  'Replacement draft did not reclaim the released target')
  const replacementDraftAttempt = readDraftAttempt(
    replacementDraftVersion.draft_reference,
    expectedTargetVersion,
  )
  assert(replacementDraftVersion.draft_reference !== abandonedVersion.draft_reference
    && replacementDraftAttempt === workingDraftAttempt + 1
    && replacementDraftAttempt === replacementDraftVersion.draft_attempt,
  'Replacement draft did not receive a new immutable draft reference')

  currentStage = 'validate and apply the complete frozen first rollout'
  const importEvidence = await applyFirstRollout(adminA, rolloutDraft)
  const readiness = await readReadiness(adminA, rolloutDraft.versionId)
  assert(readiness.canPublish === true, `First rollout is not publishable: ${JSON.stringify(readiness)}`)
  assert(readiness.newIdentityCount === 0, 'First rollout unexpectedly added an identity')
  assert(readiness.unapprovedLegacyActiveCount === 0, 'First rollout left unapproved legacy codes')

  currentStage = 'verify publication metadata and authenticated provenance'
  actionCode(
    await publish(adminA, rolloutDraft.versionId, importEvidence.lockVersion, {
      effectiveDate: '2026-02-30',
      approvalReference: 'LOCAL-WP66-INVALID-DATE',
      approvalDocumentDate: '2026-07-12',
      physicalArchiveReference: 'local/master-catalog/wp66/invalid-date',
    }, 'invalid publication date'),
    'invalid publication date',
    'PUBLICATION_METADATA_REQUIRED',
  )
  actionCode(
    await publish(adminA, rolloutDraft.versionId, importEvidence.lockVersion, {
      effectiveDate: '2026-07-12',
      approvalReference: 'LOCAL-WP66-MISSING-ARCHIVE',
      approvalDocumentDate: '2026-07-12',
    }, 'missing publication archive'),
    'missing publication archive',
    'PUBLICATION_METADATA_REQUIRED',
  )
  const actor = await readSignedInProfile(adminA)
  const publication = actionOk(
    await publish(adminA, rolloutDraft.versionId, importEvidence.lockVersion, {
      effectiveDate: '2026-07-12',
      approvalReference: 'LOCAL-WP66-REHEARSAL-ONLY-NOT-PRODUCTION',
      approvalDocumentDate: '2026-07-12',
      physicalArchiveReference: 'local/master-catalog/wp66/rehearsal-only',
      publishedByDisplayName: 'Caller-authored spoof must be ignored',
    }, 'publish frozen first rollout'),
    'publish frozen first rollout',
  )
  const publishedVersion = await readVersion(rolloutDraft.versionId)
  assert(publishedVersion.version_string === expectedTargetVersion
    && publishedVersion.target_version_string === expectedTargetVersion,
  'Publication did not issue the claimed target version')
  assert(publishedVersion.draft_reference === replacementDraftVersion.draft_reference,
    'Publication changed the immutable draft reference')
  assert(publishedVersion.published_by === actor.id, 'Publisher UUID was not derived from auth')
  assert(
    publishedVersion.published_by_display_name === actor.display_name,
    'Publisher display snapshot was not derived from the active profile',
  )
  assert(
    publishedVersion.published_by_display_name !== 'Caller-authored spoof must be ignored',
    'Caller spoofed the publisher display name',
  )
  assert(
    publishedVersion.physical_archive_reference === 'local/master-catalog/wp66/rehearsal-only',
    'Publication archive reference was not persisted',
  )
  assert(publication.itemCount === 710, 'Published first rollout does not contain 710 items')

  currentStage = 'verify restore draft effect, global draft blocking, and stale abandon'
  const [postPublishTarget] = await allocateRevisionVersions(publishedVersion, 1)
  const postPublishDraft = await createDraft(
    adminA,
    publishedVersion,
    postPublishTarget,
    'restore impact draft',
  )
  const postPublishDraftVersion = await readVersion(postPublishDraft.versionId)
  const restoreResult = await restorePointer(
    adminA,
    base.id,
    'WP-6.6 restore baseline after publication',
  )
  assert(restoreResult.previousVersionId === publishedVersion.id,
    'Restore response omitted the previous pointer')
  assert(restoreResult.currentPointerVersionId === base.id,
    'Restore response omitted the resulting pointer')
  assert(restoreResult.affectedDraftVersionId === postPublishDraft.versionId
    && restoreResult.affectedDraftReference === postPublishDraftVersion.draft_reference
    && restoreResult.draftEffect === 'becomes_stale',
  'Restore response did not explain the open draft becoming stale')
  const { data: restoreAudit, error: restoreAuditError } = await service
    .from('catalog_change_sets')
    .select('pointer_before_version_id,pointer_after_version_id,affected_draft_version_id,draft_effect')
    .eq('id', restoreResult.changeSetId)
    .maybeSingle()
  if (restoreAuditError) throw restoreAuditError
  assert(restoreAudit?.pointer_before_version_id === publishedVersion.id
    && restoreAudit?.pointer_after_version_id === base.id
    && restoreAudit?.affected_draft_version_id === postPublishDraft.versionId
    && restoreAudit?.draft_effect === 'becomes_stale',
  'Restore audit did not persist pointer before/after and draft effect')
  await verifyAuditAppendOnly(restoreResult.changeSetId)
  const publishedAfterRestore = await readVersion(publishedVersion.id)
  assert(
    publishedAfterRestore.updated_at === publishedVersion.updated_at,
    'Default-pointer movement changed immutable publication metadata timestamp',
  )
  actionCode(
    await createDraftRequest(
      adminA,
      base,
      versions[2],
      'blocked by stale global draft',
      randomUUID(),
    ),
    'global draft block after restore',
    'DRAFT_ALREADY_EXISTS',
  )
  const staleAbandon = actionOk(
    await abandonDraft(
      adminA,
      postPublishDraft,
      'close stale draft after pointer restore',
      randomUUID(),
    ),
    'stale draft abandon',
  )
  assert(staleAbandon.status === 'abandoned', 'Stale draft could not be audited-abandoned')

  currentStage = 'verify exact registers and role denial'
  const versionsPage = await readRegister(adminA, 'get_catalog_versions_page', {
    p_limit: 2,
    p_before_created_at: null,
    p_before_id: null,
  })
  assert(versionsPage.rows.length === 2, 'Versions register did not honor page limit')
  assert(versionsPage.nextCursor, 'Versions register did not return a deterministic cursor')
  const importsPage = await readRegister(adminA, 'get_catalog_imports_page', {
    p_version_id: rolloutDraft.versionId,
    p_limit: 10,
    p_before_created_at: null,
    p_before_id: null,
  })
  assert(importsPage.rows.some((row) => row.id === importEvidence.importId), 'Import register omitted the exact import')
  assert(
    importsPage.rows.some((row) => row.physical_archive_reference === 'local/master-catalog/wp66/source'),
    'Import register omitted the source archive reference',
  )
  const changeSetsPage = await readRegister(adminA, 'get_catalog_change_sets_page', {
    p_version_id: correctionDraft.versionId,
    p_limit: 10,
    p_before_created_at: null,
    p_before_id: null,
  })
  assert(changeSetsPage.rows.length >= 2, 'Change-set register omitted correction history')
  const staffRegister = await staff.rpc('get_catalog_versions_page', {
    p_limit: 10,
    p_before_created_at: null,
    p_before_id: null,
  })
  assert(Boolean(staffRegister.error), 'Non-admin unexpectedly read the versions register')
  const anonRegister = await anonymous.rpc('get_catalog_versions_page', {
    p_limit: 10,
    p_before_created_at: null,
    p_before_id: null,
  })
  assert(Boolean(anonRegister.error), 'Anonymous caller unexpectedly executed the versions register')

  currentStage = 'verify final BOQ, Factor F, pointer, and capability invariants'
  assert(await readCurrentPointer() === base.id, 'WP-6.6 smoke did not restore the baseline pointer')
  assert(stableJson(await readBoqSummary()) === stableJson(beforeBoq), 'BOQ bindings changed')
  assert(stableJson(await readFactorSummary()) === stableJson(beforeFactor), 'Factor F changed')
  assert(await readSetting('catalog_new_identity_enabled') === false, 'New-identity flag was not restored')
  assert(await readSetting('catalog_retirement_enabled') === false, 'Retirement flag was not restored')

  const evidence = {
    schemaVersion: 1,
    status: 'passed',
    generatedAt: new Date().toISOString(),
    gitCommit: currentCommit(),
    environment: 'local',
    baseVersion: base.version_string,
    schemaContract,
    authority: authorityEvidence,
    versionPlanning: {
      outOfSequenceDenied: true,
      sameCandidateRaceNormalized: true,
      releasedTargetReused: true,
      issuedTarget: expectedTargetVersion,
    },
    allocator: {
      concurrentCodes: [rowA.item_code, rowB.item_code],
      afterWithdrawCode: rowAfterWithdraw.item_code,
      serializedConflict: true,
      sequentialUnique: true,
      neverReuse: true,
      capacityBoundary: true,
    },
    draftLifecycle: {
      createRaceWinnerCount: createWinners.length,
      duplicateDraftDenied: true,
      createReplayDuplicate: createReplay.duplicateRequest,
      nonAdminCreateDenied: true,
      workingDraftVersionId: workingDraft.versionId,
      abandonedVersionId: abandonedVersion.id,
      abandonedStatus: abandonedVersion.status,
      abandonedDraftReference: abandonedVersion.draft_reference,
      abandonedTargetVersion: abandonedVersion.target_version_string,
      abandonedLockVersion: abandonedVersion.lock_version,
      abandonReplayDuplicate: abandonReplay.duplicateRequest,
      retainedSnapshotRows: abandonedSnapshotRows,
      abandonChangeSetCount,
      postAbandonMutationDenied: true,
      replacementDraftVersionId: rolloutDraft.versionId,
      replacementDraftReference: replacementDraftVersion.draft_reference,
      replacementTargetVersion: replacementDraftVersion.target_version_string,
    },
    correction: {
      retireReactivate: true,
      inheritedWithdrawDenied: true,
      historyRows: correctionHistory.rows.length,
    },
    import: importEvidence,
    readiness,
    publication: {
      versionId: rolloutDraft.versionId,
      itemCount: publication.itemCount,
      datasetHash: publication.datasetHash,
      publisherDisplayName: publishedVersion.published_by_display_name,
      archiveReference: publishedVersion.physical_archive_reference,
      invalidDateDenied: true,
      missingArchiveDenied: true,
    },
    registers: {
      versionsPageRows: versionsPage.rows.length,
      importRows: importsPage.rows.length,
      correctionChangeSets: changeSetsPage.rows.length,
      roleDenial: true,
    },
    pointerRestored: true,
    boqUnchanged: true,
    factorFUnchanged: true,
    productionTouched: false,
  }

  currentStage = 'write Local WP-6.6 evidence'
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
  if (originalPointerId) {
    await restoreOriginalPointer(originalPointerId).catch(() => {})
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
    pending.auth.signOut().catch(() => {}),
    suspended.auth.signOut().catch(() => {}),
  ])
}

function client(key) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function signIn(target, email) {
  const { error } = await target.auth.signInWithPassword({ email, password })
  if (error) throw error
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

async function verifyFrozenAuthority() {
  const [mappingCount, groupCount, exclusionCount] = await Promise.all([
    countRows('catalog_first_rollout_mappings'),
    countRows('catalog_code_group_dictionary'),
    countRows('catalog_first_rollout_source_exclusions'),
  ])
  assert(mappingCount === 710, `Expected 710 frozen mappings, found ${mappingCount}`)
  assert(groupCount === 65, `Expected 65 frozen groups, found ${groupCount}`)
  assert(exclusionCount === 17, `Expected 17 exclusions, found ${exclusionCount}`)
  assert(authority.mappings.length === mappingCount, 'Tracked authority mapping count differs from DB')
  assert(authority.code_groups.length === groupCount, 'Tracked authority group count differs from DB')
  assert(authority.source_exclusions.length === exclusionCount, 'Tracked authority exclusions differ from DB')
  return {
    mappings: mappingCount,
    groups: groupCount,
    exclusions: exclusionCount,
    sha256: authority.authority_sha256,
  }
}

async function verifyFrozenAuthorityRoleDenial() {
  const { data: adminRows, error: adminError } = await adminA
    .from('catalog_code_group_dictionary')
    .select('work_context_code,item_type_code')
    .limit(1)
  if (adminError) throw adminError
  assert(adminRows.length === 1, 'Active admin could not read frozen authority')

  const { data: staffRows, error: staffError } = await staff
    .from('catalog_code_group_dictionary')
    .select('work_context_code,item_type_code')
    .limit(1)
  if (staffError) throw staffError
  assert(staffRows.length === 0, 'Non-admin read frozen authority through RLS')

  for (const [label, target] of [
    ['pending', pending],
    ['suspended', suspended],
  ]) {
    const { data, error } = await target
      .from('catalog_code_group_dictionary')
      .select('work_context_code,item_type_code')
      .limit(1)
    if (error) throw error
    assert(data.length === 0, `${label} account read frozen authority through RLS`)
  }
}

async function verifyCatalogReadBoundaries(base, schemaContract) {
  const publishedScopes = [
    ['price_list_versions', (query) => query.eq('id', base.id), 1],
    ['price_list_default_version', (query) => query.eq('id', true), 1],
    ['price_list', (query) => query.eq('version_id', base.id), Number(base.item_count)],
    ['catalog_item_identities', (query) => query, schemaContract.published_identity_count],
    ['catalog_item_codes', (query) => query, schemaContract.published_code_count],
    ['price_list_categories', (query) => query.eq('version_id', base.id), null],
    ['catalog_code_groups', (query) => query.eq('version_id', base.id), null],
  ]

  for (const [table, scope, expected] of publishedScopes) {
    const staffCount = await visibleRowCount(staff, table, scope)
    if (expected === null) {
      assert(staffCount > 0, `Active staff could not read published ${table}`)
    } else {
      assert(staffCount === expected,
        `Active staff published ${table} count was ${staffCount}; expected ${expected}`)
    }

    for (const [label, target] of [
      ['pending', pending],
      ['suspended', suspended],
    ]) {
      const blockedCount = await visibleRowCount(target, table, scope)
      assert(blockedCount === 0, `${label} account read ${table} through catalog RLS`)
    }
  }
}

async function visibleRowCount(target, table, scope = (query) => query) {
  const { count, error } = await scope(
    target.from(table).select('*', { count: 'exact', head: true }),
  )
  if (error) throw error
  return count ?? 0
}

async function verifyPublishedMetadataNoopDenied(version) {
  const { error } = await service
    .from('price_list_versions')
    .update({ is_default: version.is_default })
    .eq('id', version.id)
  assert(
    error?.message?.includes('CATALOG_PUBLISHED_VERSION_IMMUTABLE'),
    'Published metadata accepted a no-op update',
  )

  const after = await readVersion(version.id)
  assert(after.updated_at === version.updated_at,
    'Rejected published metadata no-op changed updated_at')
}

async function verifyAuditAppendOnly(changeSetId) {
  const { error: updateError } = await service
    .from('catalog_change_sets')
    .update({ reason: 'WP-6.6 forbidden audit rewrite' })
    .eq('id', changeSetId)
  assert(
    updateError?.message?.includes('CATALOG_AUDIT_IMMUTABLE'),
    'Catalog change-set audit accepted an update',
  )

  const { data: changeItem, error: changeItemError } = await service
    .from('catalog_change_items')
    .select('id')
    .limit(1)
    .maybeSingle()
  if (changeItemError) throw changeItemError
  assert(changeItem?.id, 'WP-6.6 did not produce a change item for append-only proof')

  const { error: deleteError } = await service
    .from('catalog_change_items')
    .delete()
    .eq('id', changeItem.id)
  assert(
    deleteError?.message?.includes('CATALOG_AUDIT_IMMUTABLE'),
    'Catalog change-item audit accepted a delete',
  )
}

async function readCurrentCatalogVersion() {
  const pointer = await readCurrentPointer()
  return readVersion(pointer)
}

async function readVersion(versionId) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('id,version_string,target_version_string,draft_attempt,draft_reference,major,minor,patch,name,status,is_default,based_on_version_id,lock_version,item_count,dataset_hash,published_by,published_by_display_name,physical_archive_reference,created_at,updated_at')
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

async function allocateRevisionVersions(base, count) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('minor')
    .eq('major', base.major)
  if (error) throw error
  const maxMinor = Math.max(Number(base.minor), ...(data ?? []).map((row) => Number(row.minor)))
  return Array.from({ length: count }, (_, index) => ({
    major: Number(base.major),
    minor: maxMinor + 1 + index,
    patch: 0,
  }))
}

function versionString(version) {
  return `${version.major}.${version.minor}.${version.patch}`
}

async function createDraft(target, base, version, label) {
  const result = actionOk(await createDraftRequest(
    target,
    base,
    version,
    label,
    randomUUID(),
  ), `create ${label} draft`)
  return { versionId: result.versionId, lockVersion: result.lockVersion }
}

function createDraftRequest(target, base, version, label, requestId) {
  return target.rpc('create_catalog_draft', {
    p_base_version_id: base.id,
    p_version_major: version.major,
    p_version_minor: version.minor,
    p_version_patch: version.patch,
    p_name: `Local WP-6.6 ${label}`,
    p_reason: `WP-6.6 Local-only ${label}`,
    p_request_id: requestId,
  })
}

function abandonDraft(target, draft, reason, requestId) {
  return target.rpc('abandon_catalog_draft', {
    p_version_id: draft.versionId,
    p_expected_lock_version: draft.lockVersion,
    p_reason: `WP-6.6 ${reason}`,
    p_request_id: requestId,
  })
}

async function approvedAddChange(versionId, suffix) {
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
  return {
    action: 'add',
    categoryId: categoryResult.data.id,
    categoryCode: categoryResult.data.code,
    codeGroupId: groupResult.data.id,
    workContextCode: groupResult.data.work_context_code,
    itemTypeCode: groupResult.data.item_type_code,
    itemName: `รายการทดสอบ WP-6.6 ${suffix} ${randomUUID().slice(0, 8)}`,
    unit: 'รายการ',
    materialCost: '10.00',
    laborCost: '5.00',
    unitCost: '15.00',
    identityOutcome: 'candidate_add',
    priceAuthorityReference: 'LOCAL-WP66-TEST-AUTHORITY',
  }
}

function applyManual(target, draft, changes, reason) {
  return target.rpc('apply_catalog_changes', {
    p_version_id: draft.versionId,
    p_change_payload: { operation: 'manual', changes },
    p_expected_lock_version: draft.lockVersion,
    p_reason: `WP-6.6 ${reason}`,
    p_request_id: randomUUID(),
    p_import_id: null,
  })
}

async function readDraftItemByName(versionId, itemName) {
  const { data, error } = await service
    .from('price_list')
    .select('identity_id,item_code,item_name,is_active')
    .eq('version_id', versionId)
    .eq('item_name', itemName)
    .single()
  if (error) throw error
  return data
}

async function readBaselineItem(versionId) {
  const { data, error } = await service
    .from('price_list')
    .select('identity_id,item_code,item_name,is_active')
    .eq('version_id', versionId)
    .eq('is_active', true)
    .order('display_order')
    .limit(1)
    .single()
  if (error) throw error
  return data
}

function withdrawChange(row) {
  return {
    action: 'withdraw',
    targetIdentityId: row.identity_id,
    legacyItemCode: row.item_code,
    identityOutcome: 'withdraw',
  }
}

function retireChange(row) {
  return {
    action: 'retire',
    targetIdentityId: row.identity_id,
    legacyItemCode: row.item_code,
    identityOutcome: 'retire',
  }
}

function reactivateChange(row) {
  return {
    action: 'reactivate',
    targetIdentityId: row.identity_id,
    legacyItemCode: row.item_code,
    identityOutcome: 'reactivate',
  }
}

async function assertWithdrawPreservedRegistry(row) {
  const { count: draftRowCount, error: draftError } = await service
    .from('price_list')
    .select('id', { count: 'exact', head: true })
    .eq('identity_id', row.identity_id)
    .eq('item_code', row.item_code)
  if (draftError) throw draftError
  assert(draftRowCount === 0, 'Withdraw left the draft-only price row')

  const [identityCount, codeCount, auditCount] = await Promise.all([
    countRows('catalog_item_identities', (query) => query.eq('id', row.identity_id)),
    countRows('catalog_item_codes', (query) => query.eq('item_code', row.item_code).eq('identity_id', row.identity_id)),
    countRows('catalog_change_items', (query) => query.eq('identity_id', row.identity_id)),
  ])
  assert(identityCount === 1, 'Withdraw removed the stable identity')
  assert(codeCount === 1, 'Withdraw removed the reserved code')
  assert(auditCount >= 2, 'Withdraw did not preserve add/withdraw audit history')
}

async function readIdentityHistory(target, identityId) {
  return readRegister(target, 'get_catalog_identity_history_page', {
    p_identity_id: identityId,
    p_limit: 50,
    p_before_created_at: null,
    p_before_id: null,
  })
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

  const validationRequestId = randomUUID()
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
  const payload = {
    schemaVersion: 'catalog-import-payload/2',
    requestId: validationRequestId,
    versionId: draft.versionId,
    expectedLockVersion: draft.lockVersion,
    mode: 'full',
    parserProfileId: 'nt-item-master-2568-v1',
    parserProfileVersion: '1',
    source: {
      filename: 'WP66-LOCAL-FIRST-ROLLOUT.xlsx',
      sizeBytes: 710,
      sha256: 'a'.repeat(64),
      physicalArchiveReference: 'local/master-catalog/wp66/source',
    },
    rows,
  }
  const normalizedPayloadHash = createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
  const validationArgs = {
    p_version_id: draft.versionId,
    p_change_payload: {
      operation: 'import_validate',
      payload,
      normalizedPayloadHash,
    },
    p_expected_lock_version: draft.lockVersion,
    p_reason: 'WP-6.6 validate frozen first rollout',
    p_request_id: validationRequestId,
    p_import_id: null,
  }
  const validation = actionOk(
    await target.rpc('apply_catalog_changes', validationArgs),
    'validate frozen first rollout',
  )
  const validationReplay = actionOk(
    await target.rpc('apply_catalog_changes', validationArgs),
    'replay frozen first-rollout validation',
  )
  assert(validationReplay.duplicateRequest === true, 'Import validation replay was not idempotent')

  const apply = actionOk(await target.rpc('apply_catalog_changes', {
    p_version_id: draft.versionId,
    p_change_payload: {
      operation: 'import_apply',
      payload,
      normalizedPayloadHash,
    },
    p_expected_lock_version: draft.lockVersion,
    p_reason: 'WP-6.6 apply frozen first rollout',
    p_request_id: randomUUID(),
    p_import_id: validation.importId,
  }), 'apply frozen first rollout')
  assert(apply.changedItems === 709, `Expected 709 recodes, got ${apply.changedItems}`)
  assert(apply.retiredByFullImportOmission === 0, 'First rollout retired an omitted identity')

  const [structuredRows, approvedLegacyRows, importRow] = await Promise.all([
    countRows('price_list', (query) => query
      .eq('version_id', draft.versionId)
      .eq('is_active', true)
      .not('item_code', 'like', 'ITEM-%')),
    countRows('price_list', (query) => query
      .eq('version_id', draft.versionId)
      .eq('is_active', true)
      .eq('item_code', 'ITEM-0139')),
    service.from('catalog_imports')
      .select('status,physical_archive_reference')
      .eq('id', validation.importId)
      .single(),
  ])
  if (importRow.error) throw importRow.error
  assert(structuredRows === 709, `Expected 709 structured rows, got ${structuredRows}`)
  assert(approvedLegacyRows === 1, 'Approved ITEM-0139 exception is missing')
  assert(importRow.data.status === 'applied', 'Import lifecycle did not reach applied')
  return {
    importId: validation.importId,
    lockVersion: apply.lockVersion,
    changedItems: apply.changedItems,
    structuredRows,
    approvedLegacyRows,
    normalizedPayloadHash,
    validationReplay: true,
  }
}

async function readReadiness(target, versionId) {
  const { data, error } = await target.rpc('get_catalog_publish_readiness', {
    p_version_id: versionId,
  })
  if (error) throw error
  return data
}

function publish(target, versionId, lockVersion, metadata, reason) {
  return target.rpc('publish_catalog_version', {
    p_version_id: versionId,
    p_expected_lock_version: lockVersion,
    p_approval_metadata: metadata,
    p_reason: `WP-6.6 ${reason}`,
    p_request_id: randomUUID(),
  })
}

async function readSignedInProfile(target) {
  const { data: userData, error: userError } = await target.auth.getUser()
  if (userError) throw userError
  const { data, error } = await service
    .from('user_profiles')
    .select('id,first_name,last_name,email')
    .eq('id', userData.user.id)
    .single()
  if (error) throw error
  return {
    id: data.id,
    display_name: [data.first_name, data.last_name]
      .filter((value) => typeof value === 'string' && value.trim())
      .join(' ')
      .trim()
      || data.email?.trim()
      || data.id,
  }
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
    p_reason: 'WP-6.6 harness cleanup after failure',
    p_request_id: randomUUID(),
  })
  if (!result.error && result.data?.ok === true) return

  const { error } = await service
    .from('price_list_default_version')
    .update({ version_id: versionId })
    .eq('id', true)
  if (error) throw error
}

async function readRegister(target, rpc, args) {
  const { data, error } = await target.rpc(rpc, args)
  if (error) throw error
  return data
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
  const sql = `
    SELECT json_build_object(
      'required_constraints', (
        SELECT count(*) FROM pg_constraint
        WHERE conrelid IN (
          'public.price_list'::regclass,
          'public.catalog_change_items'::regclass,
          'public.price_list_versions'::regclass,
          'public.catalog_change_sets'::regclass
        )
          AND conname IN (
            'uq_price_list_version_display_order',
            'check_price_list_canonical_group_required',
            'uq_catalog_change_items_set_identity',
            'price_list_versions_status_check',
            'catalog_change_sets_change_type_check'
          )
          AND convalidated
      ),
      'draft_identity_constraints', (
        SELECT count(*) FROM pg_constraint
        WHERE conrelid = 'public.price_list_versions'::regclass
          AND conname IN (
            'check_catalog_target_version',
            'check_catalog_official_version_lifecycle',
            'check_catalog_draft_reference',
            'check_catalog_version_name',
            'check_catalog_derived_publication_metadata'
          )
          AND convalidated
      ),
      'draft_identity_generated_columns', (
        SELECT count(*)
        FROM pg_attribute attribute
        WHERE attribute.attrelid = 'public.price_list_versions'::regclass
          AND attribute.attname IN ('target_version_string', 'draft_reference')
          AND attribute.attgenerated = 's'
          AND NOT attribute.attisdropped
      ),
      'one_draft_index', EXISTS (
        SELECT 1
        FROM pg_class index_relation
        JOIN pg_namespace index_namespace ON index_namespace.oid = index_relation.relnamespace
        JOIN pg_index index_definition ON index_definition.indexrelid = index_relation.oid
        WHERE index_namespace.nspname = 'public'
          AND index_relation.relname = 'uq_price_list_versions_one_open_draft'
          AND index_definition.indisunique
          AND index_definition.indisvalid
          AND pg_get_expr(index_definition.indpred, index_definition.indrelid)
            = '(status = ''draft''::text)'
      ),
      'draft_reference_index', EXISTS (
        SELECT 1
        FROM pg_class index_relation
        JOIN pg_namespace index_namespace ON index_namespace.oid = index_relation.relnamespace
        JOIN pg_index index_definition ON index_definition.indexrelid = index_relation.oid
        WHERE index_namespace.nspname = 'public'
          AND index_relation.relname = 'uq_price_list_versions_target_draft_attempt'
          AND index_definition.indisunique
          AND index_definition.indisvalid
          AND index_definition.indnkeyatts = 4
          AND pg_get_expr(index_definition.indpred, index_definition.indrelid)
            = '(draft_attempt IS NOT NULL)'
          AND (
            SELECT count(DISTINCT attribute.attname)
            FROM pg_attribute attribute
            WHERE attribute.attrelid = index_definition.indrelid
              AND attribute.attnum = ANY(index_definition.indkey)
              AND attribute.attname IN (
                'target_major',
                'target_minor',
                'target_patch',
                'draft_attempt'
              )
          ) = 4
      ),
      'authority_fk_indexes', (
        SELECT count(*)
        FROM pg_class index_relation
        JOIN pg_namespace index_namespace ON index_namespace.oid = index_relation.relnamespace
        JOIN pg_index index_definition ON index_definition.indexrelid = index_relation.oid
        WHERE index_namespace.nspname = 'public'
          AND index_relation.relname IN (
            'idx_catalog_first_rollout_mappings_legacy_identity',
            'idx_catalog_first_rollout_mappings_group'
          )
          AND index_definition.indisvalid
      ),
      'nullable_required_columns', (
        SELECT count(*) FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'price_list'
          AND column_name IN ('material_cost','labor_cost','unit_cost','is_active','identity_id','category_id','display_order')
          AND is_nullable <> 'NO'
      ),
      'authority_rls_tables', (
        SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname IN ('catalog_code_group_dictionary','catalog_first_rollout_mappings','catalog_first_rollout_source_exclusions')
          AND c.relrowsecurity
      ),
      'authority_policies', (
        SELECT count(*) FROM pg_policies
        WHERE schemaname = 'public' AND (tablename, policyname) IN (
          ('catalog_code_group_dictionary','catalog_code_group_dictionary_admin_select'),
          ('catalog_first_rollout_mappings','catalog_first_rollout_mappings_admin_select'),
          ('catalog_first_rollout_source_exclusions','catalog_first_rollout_exclusions_admin_select')
        )
      ),
      'anon_versions_page_execute', has_function_privilege('anon','public.get_catalog_versions_page(integer,timestamptz,uuid)','EXECUTE'),
      'auth_versions_page_execute', has_function_privilege('authenticated','public.get_catalog_versions_page(integer,timestamptz,uuid)','EXECUTE'),
      'auth_private_allocator_execute', has_function_privilege('authenticated','private.catalog_allocate_code(uuid,uuid)','EXECUTE'),
      'auth_version_planner_execute', has_function_privilege('authenticated','private.catalog_version_candidate_is_next(integer,integer,integer,integer,integer,integer)','EXECUTE'),
      'auth_draft_identity_trigger_execute', has_function_privilege('authenticated','private.prepare_catalog_version_identity()','EXECUTE'),
      'auth_old_create_impl_execute', has_function_privilege('authenticated','private.create_catalog_draft_impl(uuid,integer,integer,integer,text,text,uuid)','EXECUTE'),
      'anon_abandon_execute', has_function_privilege('anon','public.abandon_catalog_draft(uuid,integer,text,uuid)','EXECUTE'),
      'auth_abandon_execute', has_function_privilege('authenticated','public.abandon_catalog_draft(uuid,integer,text,uuid)','EXECUTE'),
      'catalog_state_policies', (
        SELECT count(*) FROM pg_policies
        WHERE schemaname = 'public' AND (tablename, policyname) IN (
          ('price_list_versions','catalog_versions_state_scoped_select'),
          ('price_list','catalog_price_rows_state_scoped_select'),
          ('price_list_default_version','catalog_default_pointer_active_select'),
          ('catalog_item_identities','catalog_item_identities_select'),
          ('catalog_item_codes','catalog_item_codes_select'),
          ('price_list_categories','price_list_categories_select'),
          ('catalog_code_groups','catalog_code_groups_select')
        )
          AND cmd = 'SELECT'
          AND roles @> ARRAY['authenticated'::name]
          AND qual ILIKE '%status%active%'
      ),
      'published_code_policy_exact', EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'catalog_item_codes'
          AND policyname = 'catalog_item_codes_select'
          AND cmd = 'SELECT'
          AND roles = ARRAY['authenticated'::name]
          AND qual ILIKE '%catalog_row.identity_id = catalog_item_codes.identity_id%'
          AND qual ILIKE '%catalog_row.item_code%::text = catalog_item_codes.item_code%'
          AND qual ILIKE '%version.status%active%archived%'
      ),
      'published_identity_count', (
        SELECT count(DISTINCT catalog_row.identity_id)
        FROM public.price_list catalog_row
        JOIN public.price_list_versions version
          ON version.id = catalog_row.version_id
        WHERE version.status IN ('active', 'archived')
      ),
      'published_code_count', (
        SELECT count(*)
        FROM public.catalog_item_codes code
        WHERE EXISTS (
          SELECT 1
          FROM public.price_list catalog_row
          JOIN public.price_list_versions version
            ON version.id = catalog_row.version_id
          WHERE catalog_row.identity_id = code.identity_id
            AND catalog_row.item_code = code.item_code
            AND version.status IN ('active', 'archived')
        )
      ),
      'legacy_catalog_write_policies', (
        SELECT count(*) FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('price_list_versions','price_list','price_list_default_version')
          AND policyname = 'Allow write to admin only'
      ),
      'authenticated_catalog_dml_tables', (
        SELECT count(*)
        FROM (
          VALUES
            ('public.price_list_versions'),
            ('public.price_list'),
            ('public.price_list_default_version'),
            ('public.catalog_item_identities'),
            ('public.catalog_item_codes'),
            ('public.price_list_categories'),
            ('public.catalog_code_groups'),
            ('public.catalog_imports'),
            ('public.catalog_change_sets'),
            ('public.catalog_change_items'),
            ('public.catalog_placement_reviews')
        ) AS catalog_table(table_name)
        WHERE has_table_privilege('authenticated', catalog_table.table_name, 'INSERT')
           OR has_table_privilege('authenticated', catalog_table.table_name, 'UPDATE')
           OR has_table_privilege('authenticated', catalog_table.table_name, 'DELETE')
      ),
      'pointer_audit_columns', (
        SELECT count(*) FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'catalog_change_sets'
          AND column_name IN (
            'pointer_before_version_id',
            'pointer_after_version_id',
            'affected_draft_version_id',
            'draft_effect'
          )
      ),
      'pointer_audit_indexes', (
        SELECT count(*)
        FROM pg_index index_row
        JOIN pg_class index_relation ON index_relation.oid = index_row.indexrelid
        WHERE index_row.indrelid = 'public.catalog_change_sets'::regclass
          AND index_relation.relname IN (
            'idx_catalog_change_sets_pointer_before',
            'idx_catalog_change_sets_pointer_after',
            'idx_catalog_change_sets_affected_draft'
          )
          AND index_row.indisvalid
      ),
      'audit_immutability_triggers', (
        SELECT count(*) FROM pg_trigger
        WHERE tgname IN (
          'trigger_prevent_catalog_change_set_mutation',
          'trigger_prevent_catalog_change_item_mutation'
        )
          AND tgenabled = 'O'
          AND NOT tgisinternal
      ),
      'create_wrapper_security_definer', (
        SELECT prosecdef
        FROM pg_proc
        WHERE oid = 'public.create_catalog_draft(uuid,integer,integer,integer,text,text,uuid)'::regprocedure
      ),
      'disabled_capability_count', (
        SELECT count(*) FROM public.app_settings
        WHERE key IN ('catalog_admin_enabled','catalog_new_identity_enabled','catalog_retirement_enabled') AND value = 'false'::jsonb
      )
    );
  `
  const output = execFileSync('docker', [
    'exec',
    'supabase_db_conduit-boq-local',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-Atc',
    sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output)
}

function assertDraftOnlyCodeHiddenFromStaff() {
  const sql = `
    BEGIN;
    SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END
    FROM auth.users
    WHERE email = 'local.staff@ntplc.co.th';
    INSERT INTO public.catalog_item_codes (
      item_code,
      identity_id,
      code_kind,
      first_seen_version_id
    )
    SELECT
      'RLS-TST-999',
      catalog_row.identity_id,
      'canonical',
      pointer.version_id
    FROM public.price_list_default_version pointer
    JOIN public.price_list catalog_row
      ON catalog_row.version_id = pointer.version_id
    WHERE pointer.id = true
    ORDER BY catalog_row.display_order, catalog_row.id
    LIMIT 1;
    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'local.staff@ntplc.co.th'),
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;
    SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END
    FROM public.catalog_item_codes
    WHERE item_code = 'RLS-TST-999';
    RESET ROLE;
    ROLLBACK;
  `
  execFileSync('docker', [
    'exec',
    'supabase_db_conduit-boq-local',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-Atc',
    sql,
  ], { encoding: 'utf8' })
}

function assertCapacityBoundary() {
  const sql = `
    BEGIN;
    DO $test$
    DECLARE
      v_version_id uuid;
      v_group_id uuid;
      v_context text;
      v_type text;
      v_code text;
    BEGIN
      SELECT pointer.version_id INTO v_version_id
      FROM public.price_list_default_version pointer WHERE pointer.id = true;
      SELECT id, work_context_code, item_type_code
      INTO v_group_id, v_context, v_type
      FROM public.catalog_code_groups
      WHERE version_id = v_version_id
      ORDER BY display_order, id
      LIMIT 1;
      UPDATE private.catalog_code_sequences
      SET last_issued_sequence = 899
      WHERE work_context_code = v_context AND item_type_code = v_type;
      v_code := private.catalog_allocate_code(v_version_id, v_group_id);
      IF v_code IS NOT NULL THEN
        RAISE EXCEPTION 'WP66_CAPACITY_TEST_FAILED: expected NULL, got %', v_code;
      END IF;
    END;
    $test$;
    ROLLBACK;
  `
  execFileSync('docker', [
    'exec',
    'supabase_db_conduit-boq-local',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-Atc',
    sql,
  ], { stdio: 'pipe' })
}

function actionOk(result, label) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  if (result.data?.ok !== true) {
    throw new Error(`${label} returned ${JSON.stringify(result.data)}`)
  }
  assert(
    result.data.data && typeof result.data.data === 'object',
    `${label} returned an invalid success envelope`,
  )
  return result.data.data
}

function actionCode(result, label, expectedCode) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  assert(result.data?.ok === false, `${label} unexpectedly succeeded`)
  assert(
    result.data?.error?.code === expectedCode,
    `${label} returned ${JSON.stringify(result.data)}`,
  )
  return result.data
}

function codeGroupPrefix(code) {
  return code.split('-').slice(0, 2).join('-')
}

function codeSequence(code) {
  return Number(code.split('-').at(-1))
}

function stableJson(value) {
  return JSON.stringify(value)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function readDraftAttempt(reference, targetVersion) {
  const prefix = `${targetVersion}-D`
  if (typeof reference !== 'string' || !reference.startsWith(prefix)) return null
  const attempt = reference.slice(prefix.length)
  if (!/^\d{3,}$/.test(attempt)) return null
  const value = Number(attempt)
  return Number.isSafeInteger(value) && value > 0 ? value : null
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
  if (status) throw new Error('Tracked tree must be clean before recording WP-6.6 DB evidence')
}

function readEvidenceOutputPath(args) {
  if (args.length === 0) return null
  if (args.length !== 2 || args[0] !== '--output') {
    throw new Error('Usage: smoke-master-catalog-wp66.mjs [--output tmp/master-catalog/wp66-evidence/<run>.json]')
  }
  const value = args[1]
  if (!value || isAbsolute(value)) {
    throw new Error('WP-6.6 evidence path must be relative')
  }
  const evidenceRoot = resolve('tmp/master-catalog/wp66-evidence')
  const outputPath = resolve(value)
  const pathFromRoot = relative(evidenceRoot, outputPath)
  if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    throw new Error('WP-6.6 evidence output must stay under tmp/master-catalog/wp66-evidence')
  }
  if (!outputPath.endsWith('.json')) {
    throw new Error('WP-6.6 evidence output must use a .json filename')
  }
  return outputPath
}

function formatHarnessError(stage, error) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === 'object' && typeof error.message === 'string'
      ? `${error.code ? `[${error.code}] ` : ''}${error.message}`
      : JSON.stringify(error ?? '')
  return `WP-6.6 stage failed: ${stage}: ${message || 'no safe error message returned'}`
}

function readLoopbackOrigin(name, value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a Local loopback origin`)
  }
  if (
    parsed.protocol !== 'http:'
    || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
    || !parsed.port
    || parsed.username
    || parsed.password
    || parsed.pathname !== '/'
    || parsed.search
    || parsed.hash
  ) {
    throw new Error(`${name} must be an exact Local loopback origin`)
  }
  return parsed.origin
}
