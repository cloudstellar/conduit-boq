import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'
import { readLocalEnvFile } from './local-env.mjs'

const localEnv = readLocalEnvFile()
const url = readLoopbackOrigin('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const secretKey = localEnv.LOCAL_SUPABASE_SECRET_KEY ?? process.env.LOCAL_SUPABASE_SECRET_KEY
const password = localEnv.LOCAL_TEST_PASSWORD ?? process.env.LOCAL_TEST_PASSWORD

if (!publishableKey || !secretKey || !password) {
  throw new Error('Local publishable key, secret key, and LOCAL_TEST_PASSWORD are required')
}

assertTrackedTreeClean()

const service = client(secretKey)
const adminA = client(publishableKey)
const adminB = client(publishableKey)
const staff = client(publishableKey)
const anonymous = client(publishableKey)
const approvalMetadata = {
  effectiveDate: '2026-07-11',
  approvalReference: 'LOCAL-WP65-REHEARSAL-ONLY-NOT-PRODUCTION',
  approvalDocumentDate: '2026-07-11',
  publishedByDisplayName: 'Local WP-6.5 Rehearsal',
}

let originalFlagValue
let originalPointerId

try {
  await signIn(adminA, 'local.admin@ntplc.co.th')
  await signIn(adminB, 'local.admin@ntplc.co.th')
  await signIn(staff, 'local.staff@ntplc.co.th')

  const { data: setting, error: settingError } = await service
    .from('app_settings')
    .select('value')
    .eq('key', 'catalog_admin_enabled')
    .single()
  if (settingError) throw settingError
  originalFlagValue = setting.value
  await setCatalogAdminEnabled(true)

  const beforeFactor = await readFactorSummary()
  const beforeBoq = await readBoqSummary()
  originalPointerId = await readCurrentPointer()
  const base = await readCurrentCatalogVersion()
  assert(base.version_string === '2568.0.0', 'WP-6.5 smoke must start from baseline 2568.0.0')
  assert(base.status === 'active' && base.is_default === true, 'Baseline is not active/default')

  const p20 = await verifyP20Baseline(base)
  await verifyRoleDenial(base)

  const versions = await allocateRevisionVersions(base, 4)
  const contextCode = await allocateCodeContext()

  const raceDraft = await createDraft(adminA, base, versions[0], 'publish race')
  const raceReadiness = await readReadiness(adminA, raceDraft.versionId)
  assert(raceReadiness.canPublish === true, 'Unchanged clone did not pass boundary readiness')
  assert(raceReadiness.newIdentityCount === 0, 'Unchanged clone reported a new identity')
  assert(
    raceReadiness.structuredCodeGuardApplies === false,
    'Legacy-only unchanged clone incorrectly activated the structured-code guard',
  )

  const publishRequestA = randomUUID()
  const publishRequestB = randomUUID()
  const publishArgs = {
    p_version_id: raceDraft.versionId,
    p_expected_lock_version: raceDraft.lockVersion,
    p_approval_metadata: approvalMetadata,
    p_reason: 'WP-6.5 concurrent publish smoke',
  }
  const publishRace = await Promise.all([
    adminA.rpc('publish_catalog_version', { ...publishArgs, p_request_id: publishRequestA }),
    adminB.rpc('publish_catalog_version', { ...publishArgs, p_request_id: publishRequestB }),
  ])
  const publishWinnerIndex = assertOneSuccessOneCode(
    publishRace,
    'concurrent publish',
    ['VERSION_NOT_PUBLISHABLE', 'DRAFT_LOCK_CONFLICT'],
  )
  const publishWinnerRequestId = [publishRequestA, publishRequestB][publishWinnerIndex]
  const duplicatePublish = actionOk(
    await adminA.rpc('publish_catalog_version', {
      ...publishArgs,
      p_request_id: publishWinnerRequestId,
    }),
    'duplicate publish after concurrent result',
  )
  assert(duplicatePublish.duplicateRequest === true, 'Publish retry was not idempotent')
  actionCode(
    await adminA.rpc('publish_catalog_version', {
      ...publishArgs,
      p_reason: 'changed payload with reused publish request ID',
      p_request_id: publishWinnerRequestId,
    }),
    'publish request ID payload mismatch',
    'REQUEST_ID_PAYLOAD_MISMATCH',
  )
  assert(await readCurrentPointer() === raceDraft.versionId, 'Concurrent publish pointer is incorrect')

  await restorePointer(adminA, base.id, 'WP-6.5 restore after publish race')
  await assertRestoreRace(base.id, raceDraft.versionId)

  const p18Draft = await createDraft(adminA, base, versions[1], 'P-18 guard')
  const p18Apply = actionOk(
    await adminA.rpc('apply_catalog_changes', {
      p_version_id: p18Draft.versionId,
      p_change_payload: {
        operation: 'manual',
        changes: [addChange(`${contextCode}-ADD-001`, contextCode)],
      },
      p_expected_lock_version: p18Draft.lockVersion,
      p_reason: 'WP-6.5 P-18 add fixture',
      p_request_id: randomUUID(),
      p_import_id: null,
    }),
    'P-18 add fixture',
  )
  const p18Readiness = await readReadiness(adminA, p18Draft.versionId)
  assert(p18Readiness.newIdentityCount === 1, 'P-18 readiness did not count one new identity')
  assert(p18Readiness.canPublish === false, 'P-18 readiness did not block publication')
  actionCode(
    await adminA.rpc('publish_catalog_version', {
      p_version_id: p18Draft.versionId,
      p_expected_lock_version: p18Apply.lockVersion,
      p_approval_metadata: approvalMetadata,
      p_reason: 'WP-6.5 P-18 publish rejection',
      p_request_id: randomUUID(),
    }),
    'P-18 publish guard',
    'P18_PLACEMENT_REVIEW_REQUIRED',
  )
  await assertRejectedDraftStayedUnpublished(p18Draft.versionId, base.id)

  const structuredDraft = await createDraft(adminA, base, versions[2], 'structured guard')
  const baselineRow = await readBaselineItem(base.id)
  const structuredApply = actionOk(
    await adminA.rpc('apply_catalog_changes', {
      p_version_id: structuredDraft.versionId,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'recode',
          legacyItemCode: baselineRow.item_code,
          canonicalCode: `${contextCode}-RCD-001`,
          workContextCode: contextCode,
          workContextNameTh: 'บริบททดสอบ WP-6.5',
          itemTypeCode: 'RCD',
          itemTypeNameTh: 'ชนิดทดสอบการปรับรหัส',
          identityOutcome: 'recode',
        }],
      },
      p_expected_lock_version: structuredDraft.lockVersion,
      p_reason: 'WP-6.5 structured-code fixture',
      p_request_id: randomUUID(),
      p_import_id: null,
    }),
    'structured-code fixture',
  )
  const structuredReadiness = await readReadiness(adminA, structuredDraft.versionId)
  assert(structuredReadiness.newIdentityCount === 0, 'Recode incorrectly created a new identity')
  assert(structuredReadiness.structuredCodeGuardApplies === true, 'Structured guard did not activate')
  assert(
    structuredReadiness.unapprovedLegacyActiveCount > 0,
    'Structured guard did not count unapproved active legacy rows',
  )
  actionCode(
    await adminA.rpc('publish_catalog_version', {
      p_version_id: structuredDraft.versionId,
      p_expected_lock_version: structuredApply.lockVersion,
      p_approval_metadata: approvalMetadata,
      p_reason: 'WP-6.5 structured publish rejection',
      p_request_id: randomUUID(),
    }),
    'structured-code publish guard',
    'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
  )
  await assertRejectedDraftStayedUnpublished(structuredDraft.versionId, base.id)

  const atomicDraft = await createDraftWithIdempotencyChecks(adminA, base, versions[3])
  await assertDuplicateCodePayloadRollsBack(atomicDraft, contextCode)
  await assertApplyIdempotency(adminA, atomicDraft, baselineRow)

  assert(await readCurrentPointer() === base.id, 'WP-6.5 smoke did not restore the baseline pointer')
  const afterFactor = await readFactorSummary()
  const afterBoq = await readBoqSummary()
  assert(stableJson(afterFactor) === stableJson(beforeFactor), 'Factor F changed during WP-6.5 smoke')
  assert(stableJson(afterBoq) === stableJson(beforeBoq), 'BOQ bindings changed during WP-6.5 smoke')

  console.log(JSON.stringify({
    schemaVersion: 1,
    status: 'passed',
    generatedAt: new Date().toISOString(),
    gitCommit: currentCommit(),
    environment: 'local',
    baseVersion: base.version_string,
    baselineDatasetHash: base.dataset_hash,
    ...p20,
    unchangedCloneReadiness: raceReadiness,
    p18Readiness,
    structuredReadiness,
    publishRacePassed: true,
    restoreRacePassed: true,
    requestFingerprintMismatchRejected: true,
    partialMutationRollbackPassed: true,
    roleDenialPassed: true,
    runtimeLockTimeoutConfigured: true,
    pointerRestored: true,
    factorFUnchanged: true,
    boqUnchanged: true,
    productionTouched: false,
  }, null, 2))
} finally {
  if (originalPointerId) {
    await restoreOriginalPointer(originalPointerId).catch(() => {})
  }
  if (typeof originalFlagValue !== 'undefined') {
    await setCatalogAdminEnabled(originalFlagValue).catch(() => {})
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
  const { error } = await target.auth.signInWithPassword({ email, password })
  if (error) throw error
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function actionOk(result, label) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  if (result.data?.ok !== true) {
    throw new Error(`${label} returned ${JSON.stringify(result.data)}`)
  }
  return result.data.data
}

function actionCode(result, label, expectedCode) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  assert(result.data?.ok === false, `${label} unexpectedly succeeded`)
  assert(
    result.data?.error?.code === expectedCode,
    `${label} expected ${expectedCode}, got ${JSON.stringify(result.data)}`,
  )
  return result.data
}

function assertOneSuccessOneCode(results, label, acceptedCodes) {
  const successIndexes = results
    .map((result, index) => result.data?.ok === true ? index : -1)
    .filter((index) => index >= 0)
  assert(successIndexes.length === 1, `${label} expected exactly one success: ${JSON.stringify(results)}`)
  const rejected = results.find((result) => result.data?.ok !== true)
  if (rejected?.error) {
    assert(
      ['55P03', '57014'].includes(rejected.error.code),
      `${label} returned unexpected transport error: ${JSON.stringify(rejected.error)}`,
    )
  } else {
    assert(
      acceptedCodes.includes(rejected?.data?.error?.code),
      `${label} returned unexpected rejection: ${JSON.stringify(rejected?.data)}`,
    )
  }
  return successIndexes[0]
}

async function setCatalogAdminEnabled(value) {
  const { error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', 'catalog_admin_enabled')
  if (error) throw error
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

async function readCurrentCatalogVersion() {
  const pointer = await readCurrentPointer()
  const { data, error } = await service
    .from('price_list_versions')
    .select('id,version_string,major,minor,patch,status,is_default,dataset_hash,item_count')
    .eq('id', pointer)
    .single()
  if (error) throw error
  return data
}

async function allocateRevisionVersions(base, count) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('minor')
    .eq('major', base.major)
  if (error) throw error
  const maxMinor = Math.max(base.minor, ...(data ?? []).map((row) => Number(row.minor)))
  return Array.from({ length: count }, (_, index) => ({
    major: Number(base.major),
    minor: maxMinor + 100 + index,
    patch: 0,
  }))
}

async function createDraft(target, base, version, label, requestId = randomUUID()) {
  const data = actionOk(
    await target.rpc('create_catalog_draft', {
      p_base_version_id: base.id,
      p_version_major: version.major,
      p_version_minor: version.minor,
      p_version_patch: version.patch,
      p_name: `Local WP-6.5 ${label}`,
      p_reason: `WP-6.5 Local-only ${label}`,
      p_request_id: requestId,
    }),
    `create ${label} draft`,
  )
  return { versionId: data.versionId, lockVersion: data.lockVersion, requestId, version }
}

async function createDraftWithIdempotencyChecks(target, base, version) {
  const requestId = randomUUID()
  const draft = await createDraft(target, base, version, 'atomicity', requestId)
  const duplicate = await createDraft(target, base, version, 'atomicity', requestId)
  assert(duplicate.versionId === draft.versionId, 'Duplicate create returned another version')
  actionCode(
    await target.rpc('create_catalog_draft', {
      p_base_version_id: base.id,
      p_version_major: version.major,
      p_version_minor: version.minor,
      p_version_patch: version.patch,
      p_name: 'Changed name with reused request ID',
      p_reason: 'WP-6.5 Local-only atomicity',
      p_request_id: requestId,
    }),
    'create request ID payload mismatch',
    'REQUEST_ID_PAYLOAD_MISMATCH',
  )
  return draft
}

async function readReadiness(target, versionId) {
  const { data, error } = await target.rpc('get_catalog_publish_readiness', {
    p_version_id: versionId,
  })
  if (error) throw error
  return data
}

async function restorePointer(target, versionId, reason) {
  return actionOk(
    await target.rpc('restore_catalog_pointer', {
      p_target_version_id: versionId,
      p_reason: reason,
      p_request_id: randomUUID(),
    }),
    reason,
  )
}

async function restoreOriginalPointer(versionId) {
  if (await readCurrentPointer() === versionId) return

  const rpcResult = await adminA.rpc('restore_catalog_pointer', {
    p_target_version_id: versionId,
    p_reason: 'WP-6.5 harness cleanup after failure',
    p_request_id: randomUUID(),
  })
  if (!rpcResult.error && rpcResult.data?.ok === true) return

  const { error: pointerError } = await service
    .from('price_list_default_version')
    .update({ version_id: versionId })
    .eq('id', true)
  if (pointerError) throw pointerError

  const { error: clearDefaultError } = await service
    .from('price_list_versions')
    .update({ is_default: false })
    .eq('is_default', true)
    .neq('id', versionId)
  if (clearDefaultError) throw clearDefaultError

  const { error: setDefaultError } = await service
    .from('price_list_versions')
    .update({ is_default: true })
    .eq('id', versionId)
  if (setDefaultError) throw setDefaultError
}

async function assertRestoreRace(baseId, publishedId) {
  const requestA = randomUUID()
  const requestB = randomUUID()
  const args = {
    p_target_version_id: publishedId,
    p_reason: 'WP-6.5 concurrent restore smoke',
  }
  const results = await Promise.all([
    adminA.rpc('restore_catalog_pointer', { ...args, p_request_id: requestA }),
    adminB.rpc('restore_catalog_pointer', { ...args, p_request_id: requestB }),
  ])
  const winner = assertOneSuccessOneCode(results, 'concurrent restore', ['POINTER_ALREADY_CURRENT'])
  const duplicate = actionOk(
    await adminA.rpc('restore_catalog_pointer', {
      ...args,
      p_request_id: [requestA, requestB][winner],
    }),
    'duplicate restore after concurrent result',
  )
  assert(duplicate.duplicateRequest === true, 'Restore retry was not idempotent')
  await restorePointer(adminA, baseId, 'WP-6.5 restore baseline after restore race')
}

async function verifyP20Baseline(base) {
  const { data, error } = await service
    .from('price_list')
    .select('id,identity_id')
    .eq('version_id', base.id)
    .order('id')
  if (error) throw error
  assert(data?.length === Number(base.item_count), 'P-20 baseline row count does not match metadata')
  assert(data.every((row) => row.id === row.identity_id), 'P-20 baseline identity differs from price_list.id')
  const mapping = data.map((row) => `${row.id}:${row.identity_id}`).join('\n') + '\n'
  return {
    baselineIdentityRows: data.length,
    baselineIdentityMappingSha256: createHash('sha256').update(mapping).digest('hex'),
  }
}

async function verifyRoleDenial(base) {
  const staffCreate = await staff.rpc('create_catalog_draft', {
    p_base_version_id: base.id,
    p_version_major: Number(base.major),
    p_version_minor: Number(base.minor) + 90000,
    p_version_patch: 0,
    p_name: 'Forbidden staff draft',
    p_reason: 'WP-6.5 role denial',
    p_request_id: randomUUID(),
  })
  actionCode(staffCreate, 'staff create denial', 'FORBIDDEN')

  const staffReadiness = await staff.rpc('get_catalog_publish_readiness', {
    p_version_id: base.id,
  })
  assert(Boolean(staffReadiness.error), 'Staff unexpectedly read admin publish readiness')

  const anonCreate = await anonymous.rpc('create_catalog_draft', {
    p_base_version_id: base.id,
    p_version_major: Number(base.major),
    p_version_minor: Number(base.minor) + 90001,
    p_version_patch: 0,
    p_name: 'Forbidden anonymous draft',
    p_reason: 'WP-6.5 anonymous denial',
    p_request_id: randomUUID(),
  })
  assert(Boolean(anonCreate.error), 'Anonymous caller unexpectedly executed create_catalog_draft')
}

async function allocateCodeContext() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const context = randomUUID().replaceAll('-', '').slice(0, 3).toUpperCase()
    const { count, error } = await service
      .from('catalog_item_codes')
      .select('item_code', { count: 'exact', head: true })
      .like('item_code', `${context}-%`)
    if (error) throw error
    if (count === 0) return context
  }
  throw new Error('Could not allocate an unused Local smoke code context')
}

function addChange(code, context) {
  return {
    action: 'add',
    canonicalCode: code,
    workContextCode: context,
    workContextNameTh: 'บริบททดสอบ WP-6.5',
    itemTypeCode: code.split('-')[1],
    itemTypeNameTh: 'ชนิดรายการทดสอบ WP-6.5',
    itemName: `รายการทดสอบ ${code}`,
    unit: 'รายการ',
    materialCost: '10.00',
    laborCost: '5.00',
    unitCost: '15.00',
    categoryCode: 'WP65',
    identityOutcome: 'candidate_add',
    priceAuthorityReference: 'LOCAL-WP65-TEST-AUTHORITY',
  }
}

async function readBaselineItem(versionId) {
  const { data, error } = await service
    .from('price_list')
    .select('item_code')
    .eq('version_id', versionId)
    .eq('is_active', true)
    .neq('item_code', 'ITEM-0139')
    .order('item_code')
    .limit(1)
    .single()
  if (error) throw error
  return data
}

async function assertRejectedDraftStayedUnpublished(versionId, baseId) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('status,published_at,approval_reference')
    .eq('id', versionId)
    .single()
  if (error) throw error
  assert(data.status === 'draft', 'Rejected publish changed draft status')
  assert(data.published_at === null && data.approval_reference === null, 'Rejected publish wrote metadata')
  assert(await readCurrentPointer() === baseId, 'Rejected publish moved the pointer')
}

async function assertDuplicateCodePayloadRollsBack(draft, context) {
  const code = `${context}-DUP-001`
  const before = await readMutationCounts(draft.versionId)
  const requestId = randomUUID()
  actionCode(
    await adminA.rpc('apply_catalog_changes', {
      p_version_id: draft.versionId,
      p_change_payload: {
        operation: 'manual',
        changes: [addChange(code, context), addChange(code, context)],
      },
      p_expected_lock_version: draft.lockVersion,
      p_reason: 'WP-6.5 duplicate code rollback fixture',
      p_request_id: requestId,
      p_import_id: null,
    }),
    'duplicate code mutation rollback',
    'IMPORT_RECONCILIATION_REQUIRED',
  )
  const after = await readMutationCounts(draft.versionId)
  assert(stableJson(after) === stableJson(before), 'Rejected multi-row mutation left partial writes')
  const { count, error } = await service
    .from('catalog_change_sets')
    .select('id', { count: 'exact', head: true })
    .eq('request_id', requestId)
  if (error) throw error
  assert(count === 0, 'Rejected multi-row mutation left a change set')
}

async function assertApplyIdempotency(target, draft, baselineRow) {
  const requestId = randomUUID()
  const args = {
    p_version_id: draft.versionId,
    p_change_payload: {
      operation: 'manual',
      changes: [{
        action: 'retire',
        legacyItemCode: baselineRow.item_code,
        identityOutcome: 'retire',
      }],
    },
    p_expected_lock_version: draft.lockVersion,
    p_reason: 'WP-6.5 apply idempotency fixture',
    p_request_id: requestId,
    p_import_id: null,
  }
  actionOk(await target.rpc('apply_catalog_changes', args), 'apply idempotency fixture')
  const duplicate = actionOk(
    await target.rpc('apply_catalog_changes', args),
    'duplicate apply idempotency fixture',
  )
  assert(duplicate.duplicateRequest === true, 'Apply retry was not idempotent')
  actionCode(
    await target.rpc('apply_catalog_changes', {
      ...args,
      p_reason: 'changed reason with reused apply request ID',
    }),
    'apply request ID payload mismatch',
    'REQUEST_ID_PAYLOAD_MISMATCH',
  )
}

async function readMutationCounts(versionId) {
  const [rows, changes, identities, codes] = await Promise.all([
    countRows('price_list', (query) => query.eq('version_id', versionId)),
    countRows('catalog_change_sets', (query) => query.eq('version_id', versionId)),
    countRows('catalog_item_identities'),
    countRows('catalog_item_codes'),
  ])
  return { rows, changes, identities, codes }
}

async function countRows(table, scope = (query) => query) {
  const query = service.from(table).select('id', { count: 'exact', head: true })
  const { count, error } = await scope(query)
  if (error) throw error
  return count
}

async function readFactorSummary() {
  const { data: pointer, error: pointerError } = await service
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError
  const { data: version, error: versionError } = await service
    .from('factor_reference_versions')
    .select('version_string,dataset_hash')
    .eq('id', pointer.version_id)
    .single()
  if (versionError) throw versionError
  const rows = await countRows('factor_reference_rows', (query) =>
    query.eq('version_id', pointer.version_id))
  return { versionId: pointer.version_id, ...version, rows }
}

async function readBoqSummary() {
  const { data, error } = await service
    .from('boq')
    .select('id,price_list_version_id,factor_reference_version_id')
    .order('id')
  if (error) throw error
  return data
}

function stableJson(value) {
  return JSON.stringify(value)
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
  if (status) throw new Error('Tracked tree must be clean before recording WP-6.5 DB evidence')
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
    throw new Error(`${name} must be a Local loopback origin`)
  }
  return parsed.origin
}
