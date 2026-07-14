import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
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

if (!publishableKey || !secretKey || !password) {
  throw new Error(
    'Local publishable key, secret key, and LOCAL_TEST_PASSWORD are required',
  )
}

assertTrackedTreeClean()

const service = client(secretKey)
const admin = client(publishableKey)
const procurement = client(publishableKey)
const anonymous = client(publishableKey)
const createdBoqIds = new Set()
const allowedSuffixes = [
  ' (Main Duct)',
  ' (Riser)',
  ' (Steel Pole)',
  ' (Riser Service)',
]
const minimumFactorReferenceCost = 5_000_000
const maximumFactorReferenceCost = 700_000_000

let currentStage = 'initialize Local clients'
let originalCatalogFlag
let originalPointerId
let fixtureVersionId
let fixtureVersionString
let beforeBoqSnapshot
let beforeFactorSnapshot
let beforeSecuritySnapshot
let runFailure = null
let runFailureStage = null
let runResult = null

try {
  currentStage = 'sign in Local test users'
  const adminUser = await signIn(admin, 'local.admin@ntplc.co.th')
  await signIn(procurement, 'local.procurement@ntplc.co.th')
  const adminProfile = await readActiveAdminProfile(adminUser.id)

  currentStage = 'capture BOQ, Factor F, and security baselines'
  beforeBoqSnapshot = await readBoqSnapshot()
  beforeFactorSnapshot = await readFactorSnapshot()
  beforeSecuritySnapshot = readSecuritySnapshot()
  assertSecurityContract(beforeSecuritySnapshot)

  const setting = await readSetting('catalog_admin_enabled')
  originalCatalogFlag = setting.value
  await setCatalogAdminEnabled(true)

  const base = await readCurrentCatalogVersion()
  originalPointerId = base.id
  assert(
    base.version_string === '2568.0.0',
    `WP-7 must start from catalog authority 2568.0.0, found ${base.version_string}`,
  )
  assert(
    base.status === 'active' && base.is_default === true,
    'WP-7 baseline catalog is not active/default',
  )

  const factorDefault = await readCurrentFactorVersion()
  const alternateFactor = await readAlternateFactorVersion(factorDefault.id)

  currentStage = 'publish an unchanged catalog clone through the actual RPCs'
  const fixtureVersion = await createAndPublishUnchangedClone(base)
  fixtureVersionId = fixtureVersion.id
  fixtureVersionString = fixtureVersion.version_string
  assert(
    await readCurrentPointer() === fixtureVersion.id,
    'Catalog publish did not move the current pointer to the fixture version',
  )
  assertSnapshotEqual(
    await readBoqSnapshot(),
    beforeBoqSnapshot,
    'Catalog publish changed historical BOQ data or bindings',
  )
  assertSnapshotEqual(
    await readFactorSnapshot(),
    beforeFactorSnapshot,
    'Catalog publish changed Factor F state',
  )

  const fixtureItem = await readCatalogItem(fixtureVersion.id)
  const crossVersionItem = await readCatalogIdentityItem(
    base.id,
    fixtureItem.identity_id,
  )
  assert(
    crossVersionItem.id !== fixtureItem.id,
    'Cross-version fixture unexpectedly reused one price_list row ID',
  )

  currentStage = 'create a BOQ and verify default catalog and Factor F binding'
  const sourceBoq = await createAutoBoundBoq(adminUser.id, adminProfile)
  assert(
    sourceBoq.price_list_version_id === fixtureVersion.id,
    'New BOQ did not bind the current catalog pointer',
  )
  assert(
    sourceBoq.factor_reference_version_id === factorDefault.id,
    'New BOQ did not bind the current Factor F pointer',
  )

  currentStage = 'save every approved BOQ item suffix through hotfix 016'
  const suffixPayload = buildSavePayload(
    sourceBoq.id,
    fixtureItem,
    ['', ...allowedSuffixes],
  )
  expectRpcSuccess(
    await admin.rpc('save_boq_with_routes', suffixPayload),
    'approved suffix save',
  )
  const savedItems = await readBoqItems(sourceBoq.id)
  assert(savedItems.length === 5, 'Approved suffix save did not retain five items')
  for (const [index, savedItem] of savedItems.entries()) {
    const suffix = ['', ...allowedSuffixes][index]
    assert(
      savedItem.item_name === `${fixtureItem.item_name}${suffix}`,
      `Approved suffix was not preserved at item order ${index + 1}`,
    )
    assertCatalogAuthority(savedItem, fixtureItem)
  }
  const boundAfterSave = await readBoqBinding(sourceBoq.id)
  assert(
    boundAfterSave.price_list_version_id === fixtureVersion.id,
    'BOQ save changed price_list_version_id',
  )
  assert(
    boundAfterSave.factor_reference_version_id === factorDefault.id,
    'BOQ save changed factor_reference_version_id',
  )

  currentStage = 'reject an invalid suffix without mutation'
  const stableSourceState = await readBoqFixtureState(sourceBoq.id)
  const invalidSuffixPayload = buildSavePayload(
    sourceBoq.id,
    fixtureItem,
    [' (Main Duct) invalid'],
    'invalid suffix rollback probe',
  )
  expectRpcFailure(
    await admin.rpc('save_boq_with_routes', invalidSuffixPayload),
    'invalid suffix',
    ['P0001'],
  )
  assertSnapshotEqual(
    await readBoqFixtureState(sourceBoq.id),
    stableSourceState,
    'Invalid suffix left a partial BOQ mutation',
  )

  currentStage = 'reject a cross-version item atomically after a valid item'
  const crossVersionPayload = buildMixedVersionPayload(
    sourceBoq.id,
    fixtureItem,
    crossVersionItem,
  )
  expectRpcFailure(
    await admin.rpc('save_boq_with_routes', crossVersionPayload),
    'cross-version multi-item save',
    ['P0001'],
  )
  assertSnapshotEqual(
    await readBoqFixtureState(sourceBoq.id),
    stableSourceState,
    'Cross-version multi-item rejection left a partial BOQ mutation',
  )

  currentStage = 'verify anonymous and unauthorized-role denial'
  expectRpcFailure(
    await anonymous.rpc('save_boq_with_routes', suffixPayload),
    'anonymous BOQ save',
    ['42501'],
  )
  expectRpcFailure(
    await procurement.rpc('save_boq_with_routes', suffixPayload),
    'procurement BOQ save',
    ['P0001'],
  )
  assertSnapshotEqual(
    await readBoqFixtureState(sourceBoq.id),
    stableSourceState,
    'Denied caller changed BOQ data',
  )

  currentStage = 'duplicate BOQ with all catalog and Factor F snapshots'
  const duplicate = await copyBoq(
    sourceBoq.id,
    adminUser.id,
    adminProfile,
    { mode: 'preserve' },
  )
  await assertPreservedCopy(sourceBoq.id, duplicate.id)

  currentStage = 'copy BOQ to a selected Factor F version'
  const factorCopy = await copyBoq(
    sourceBoq.id,
    adminUser.id,
    adminProfile,
    { mode: 'select-factor', factorVersionId: alternateFactor.id },
  )
  await assertSelectedFactorCopy(
    sourceBoq.id,
    factorCopy.id,
    alternateFactor.id,
  )

  currentStage = 'verify print and export Factor F data modes'
  const legacyUsable = await createLegacyFactorFixture(
    adminUser.id,
    adminProfile,
    { usableSnapshot: true },
  )
  const legacyMissing = await createLegacyFactorFixture(
    adminUser.id,
    adminProfile,
    { usableSnapshot: false },
  )
  const printExportModes = await verifyPrintExportDataModes(
    sourceBoq.id,
    legacyUsable.id,
    legacyMissing.id,
  )

  currentStage = 'restore the catalog pointer without rebinding or repricing BOQs'
  const beforeRestoreBoqSnapshot = await readBoqSnapshot()
  expectActionOk(
    await admin.rpc('restore_catalog_pointer', {
      p_target_version_id: base.id,
      p_reason: 'WP-7 Local regression restore to baseline',
      p_request_id: randomUUID(),
    }),
    'WP-7 pointer restore',
  )
  assert(
    await readCurrentPointer() === base.id,
    'Pointer restore did not return to the baseline catalog',
  )
  assertSnapshotEqual(
    await readBoqSnapshot(),
    beforeRestoreBoqSnapshot,
    'Pointer restore repriced or rebound BOQs',
  )
  assertSnapshotEqual(
    await readFactorSnapshot(),
    beforeFactorSnapshot,
    'Pointer restore changed Factor F state',
  )

  const publishedFixture = await readVersion(fixtureVersion.id)
  assert(
    publishedFixture.status === 'active' && publishedFixture.is_default === false,
    'Published WP-7 fixture did not remain immutable history after restore',
  )

  runResult = {
    base,
    fixtureVersion: publishedFixture,
    factorDefault,
    alternateFactor,
    printExportModes,
  }
} catch (error) {
  runFailure = error
  runFailureStage = currentStage
}

const cleanupFailures = []

currentStage = 'clean up Local WP-7 BOQ fixtures'
try {
  await cleanupBoqFixtures()
} catch (error) {
  cleanupFailures.push(formatError('BOQ fixture cleanup', error))
}

currentStage = 'restore the original Local catalog pointer'
try {
  if (originalPointerId && await readCurrentPointer() !== originalPointerId) {
    expectActionOk(
      await admin.rpc('restore_catalog_pointer', {
        p_target_version_id: originalPointerId,
        p_reason: 'WP-7 failure cleanup restore to original pointer',
        p_request_id: randomUUID(),
      }),
      'WP-7 failure cleanup pointer restore',
    )
  }
} catch (error) {
  cleanupFailures.push(formatError('catalog pointer cleanup', error))
}

currentStage = 'close any unpublished catalog fixture'
try {
  await closeDraftFixtureIfNeeded()
} catch (error) {
  cleanupFailures.push(formatError('catalog draft cleanup', error))
}

currentStage = 'restore the Local catalog feature flag'
try {
  if (typeof originalCatalogFlag !== 'undefined') {
    await setCatalogAdminEnabled(originalCatalogFlag)
  }
} catch (error) {
  cleanupFailures.push(formatError('feature flag cleanup', error))
}

currentStage = 'verify final Local invariants'
try {
  if (beforeBoqSnapshot) {
    assertSnapshotEqual(
      await readBoqSnapshot(),
      beforeBoqSnapshot,
      'WP-7 cleanup did not restore the baseline BOQ dataset',
    )
  }
  if (beforeFactorSnapshot) {
    assertSnapshotEqual(
      await readFactorSnapshot(),
      beforeFactorSnapshot,
      'WP-7 cleanup did not preserve the Factor F dataset',
    )
  }
  if (beforeSecuritySnapshot) {
    assert(
      stableJson(readSecuritySnapshot()) === stableJson(beforeSecuritySnapshot),
      'WP-7 changed database grants, RLS, or binding triggers',
    )
  }
  if (originalPointerId) {
    assert(
      await readCurrentPointer() === originalPointerId,
      'WP-7 cleanup did not restore the original catalog pointer',
    )
  }
} catch (error) {
  cleanupFailures.push(formatError('final invariant verification', error))
}

await Promise.all([
  admin.auth.signOut().catch(() => {}),
  procurement.auth.signOut().catch(() => {}),
])

if (runFailure || cleanupFailures.length > 0 || !runResult) {
  throw new Error(formatHarnessFailure(runFailure, runFailureStage, cleanupFailures))
}

const evidence = {
  schemaVersion: 1,
  status: 'passed',
  generatedAt: new Date().toISOString(),
  gitCommit: currentCommit(),
  environment: 'local',
  migration020Sha256: migration020Sha256(),
  baseVersion: runResult.base.version_string,
  publishedFixtureVersion: runResult.fixtureVersion.version_string,
  publishedFixtureId: runResult.fixtureVersion.id,
  catalogPointerRestored: true,
  newBoqDefaultBindingPassed: true,
  approvedSuffixes: allowedSuffixes,
  approvedSuffixesPassed: true,
  catalogFieldsAuthoritative: true,
  invalidSuffixRejectedAtomically: true,
  crossVersionItemRejectedAtomically: true,
  anonymousDenied: true,
  unauthorizedRoleDenied: true,
  existingBoqBindingsPreserved: true,
  duplicateSnapshotsPreserved: true,
  selectedFactorCopyResetSnapshots: true,
  printExportModes: runResult.printExportModes,
  catalogPublishPreservedHistoricalBoqs: true,
  pointerRestorePreservedHistoricalBoqs: true,
  boqBaselineSha256: beforeBoqSnapshot.sha256,
  factorBaselineSha256: beforeFactorSnapshot.sha256,
  securityContract: beforeSecuritySnapshot,
  productionTouched: false,
}

if (evidenceOutputPath) {
  await mkdir(dirname(evidenceOutputPath), { recursive: true })
  await writeFile(evidenceOutputPath, `${JSON.stringify(evidence, null, 2)}\n`, {
    flag: 'wx',
  })
}

console.log(JSON.stringify(evidence, null, 2))

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

async function readActiveAdminProfile(userId) {
  const { data, error } = await admin
    .from('user_profiles')
    .select('org_id,department_id,sector_id,role,status')
    .eq('id', userId)
    .single()
  if (error) throw error
  assert(
    data.role === 'admin' && data.status === 'active',
    'Local admin profile is not active',
  )
  return data
}

async function readSetting(key) {
  const { data, error } = await service
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error) throw error
  return data
}

async function setCatalogAdminEnabled(value) {
  const { data, error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', 'catalog_admin_enabled')
    .select('key')
    .single()
  if (error) throw error
  assert(data.key === 'catalog_admin_enabled', 'Catalog admin flag was not updated')
}

async function readCurrentCatalogVersion() {
  return readVersion(await readCurrentPointer())
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

async function readVersion(versionId) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('id,version_string,major,minor,patch,status,is_default,based_on_version_id,lock_version,item_count,dataset_hash')
    .eq('id', versionId)
    .single()
  if (error) throw error
  return data
}

async function createAndPublishUnchangedClone(base) {
  const { count: draftCount, error: draftError } = await service
    .from('price_list_versions')
    .select('id', { count: 'exact', head: true })
    .eq('based_on_version_id', base.id)
    .eq('status', 'draft')
  if (draftError) throw draftError
  assert(
    draftCount === 0,
    'WP-7 requires zero current-base working drafts before creating its fixture',
  )

  const version = await allocateNextRevision(base)
  const createResult = expectActionOk(
    await admin.rpc('create_catalog_draft', {
      p_base_version_id: base.id,
      p_version_major: version.major,
      p_version_minor: version.minor,
      p_version_patch: version.patch,
      p_name: `Local WP-7 regression ${version.major}.${version.minor}.${version.patch}`,
      p_reason: 'WP-7 regression-only unchanged catalog clone',
      p_request_id: randomUUID(),
    }),
    'WP-7 create unchanged catalog clone',
  )
  fixtureVersionId = createResult.versionId
  fixtureVersionString = `${version.major}.${version.minor}.${version.patch}`

  const readinessResult = await admin.rpc('get_catalog_publish_readiness', {
    p_version_id: fixtureVersionId,
  })
  if (readinessResult.error) throw readinessResult.error
  assert(
    readinessResult.data?.canPublish === true,
    `Unchanged WP-7 clone is not publishable: ${JSON.stringify(readinessResult.data)}`,
  )

  expectActionOk(
    await admin.rpc('publish_catalog_version', {
      p_version_id: fixtureVersionId,
      p_expected_lock_version: createResult.lockVersion,
      p_approval_metadata: {
        effectiveDate: new Date().toISOString().slice(0, 10),
        approvalReference: 'LOCAL-WP7-REGRESSION-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: new Date().toISOString().slice(0, 10),
        physicalArchiveReference: `local/master-catalog/wp7/${fixtureVersionString}`,
      },
      p_reason: 'WP-7 verify catalog publish does not rebind or reprice BOQs',
      p_request_id: randomUUID(),
    }),
    'WP-7 publish unchanged catalog clone',
  )

  const published = await readVersion(fixtureVersionId)
  assert(
    published.status === 'active' && published.is_default === true,
    'WP-7 catalog fixture did not publish as the current version',
  )
  return published
}

async function allocateNextRevision(base) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('minor')
    .eq('major', base.major)
  if (error) throw error
  const maxMinor = Math.max(
    Number(base.minor),
    ...(data ?? []).map((row) => Number(row.minor)),
  )
  return {
    major: Number(base.major),
    minor: maxMinor + 1,
    patch: 0,
  }
}

async function readCurrentFactorVersion() {
  const { data: pointer, error: pointerError } = await service
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError
  return readFactorVersion(pointer.version_id)
}

async function readAlternateFactorVersion(defaultId) {
  const { data, error } = await service
    .from('factor_reference_versions')
    .select('id,version_string,status,dataset_hash,row_count')
    .eq('status', 'active')
    .neq('id', defaultId)
    .order('version_string')
    .limit(1)
    .single()
  if (error) throw error
  return data
}

async function readFactorVersion(versionId) {
  const { data, error } = await service
    .from('factor_reference_versions')
    .select('id,version_string,status,dataset_hash,row_count')
    .eq('id', versionId)
    .single()
  if (error) throw error
  return data
}

async function readCatalogItem(versionId) {
  const { data, error } = await service
    .from('price_list')
    .select('id,identity_id,item_code,item_name,unit,material_cost,labor_cost,unit_cost,category,version_id')
    .eq('version_id', versionId)
    .eq('is_active', true)
    .not('category', 'is', null)
    .order('display_order')
    .limit(1)
    .single()
  if (error) throw error
  return data
}

async function readCatalogIdentityItem(versionId, identityId) {
  const { data, error } = await service
    .from('price_list')
    .select('id,identity_id,item_code,item_name,unit,material_cost,labor_cost,unit_cost,category,version_id')
    .eq('version_id', versionId)
    .eq('identity_id', identityId)
    .single()
  if (error) throw error
  return data
}

async function createAutoBoundBoq(userId, profile) {
  const runId = randomUUID().slice(0, 8)
  const { data, error } = await admin
    .from('boq')
    .insert({
      estimator_name: 'Local WP-7 regression',
      document_date: new Date().toISOString().slice(0, 10),
      project_name: `LOCAL WP-7 BOQ ${runId}`,
      department: 'Local regression only',
      status: 'draft',
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
      factor_f: null,
      total_with_factor_f: 0,
      total_with_vat: 0,
      created_by: userId,
      org_id: profile.org_id,
      department_id: profile.department_id,
      sector_id: profile.sector_id,
      price_list_version_id: null,
      factor_reference_version_id: null,
    })
    .select('id,price_list_version_id,factor_reference_version_id')
    .single()
  if (error) throw error
  createdBoqIds.add(data.id)
  return data
}

function buildSavePayload(
  boqId,
  catalogItem,
  suffixes,
  projectName = 'LOCAL WP-7 approved suffix save',
) {
  const quantities = suffixes.map((_, index) => index + 1)
  const quantityTotal = quantities.reduce((sum, value) => sum + value, 0)
  const totalMaterial = Number(catalogItem.material_cost) * quantityTotal
  const totalLabor = Number(catalogItem.labor_cost) * quantityTotal
  const totalCost = Number(catalogItem.unit_cost) * quantityTotal

  return {
    p_boq_id: boqId,
    p_boq_data: buildBoqData(projectName, totalMaterial, totalLabor, totalCost),
    p_routes: [{
      route_name: 'WP-7 Local route',
      route_description: 'Automatically removed after the Local regression run',
      construction_area: 'Local only',
      total_material_cost: totalMaterial,
      total_labor_cost: totalLabor,
      total_cost: totalCost,
      items: suffixes.map((suffix, index) => ({
        item_order: index + 1,
        price_list_id: catalogItem.id,
        item_name: `${catalogItem.item_name}${suffix}`,
        quantity: quantities[index],
        unit: 'UNTRUSTED-UNIT',
        material_cost_per_unit: 999999,
        labor_cost_per_unit: 999999,
        unit_cost: 1999998,
        total_material_cost: 999999,
        total_labor_cost: 999999,
        total_cost: 1999998,
        remarks: `WP-7 suffix ${suffix || '(none)'}`,
        category: 'UNTRUSTED-CATEGORY',
      })),
    }],
  }
}

function buildMixedVersionPayload(boqId, validItem, crossVersionItem) {
  const payload = buildSavePayload(
    boqId,
    validItem,
    ['', ' (Riser)'],
    'cross-version atomic rollback probe',
  )
  payload.p_routes[0].items[1] = {
    ...payload.p_routes[0].items[1],
    price_list_id: crossVersionItem.id,
    item_name: crossVersionItem.item_name,
  }
  return payload
}

function buildBoqData(projectName, totalMaterial, totalLabor, totalCost) {
  const factor = 1.1
  return {
    estimator_name: 'Local WP-7 regression',
    document_date: new Date().toISOString().slice(0, 10),
    project_name: projectName,
    route: 'WP-7 Local route',
    construction_area: 'Local only',
    department: 'Local regression only',
    total_material_cost: totalMaterial,
    total_labor_cost: totalLabor,
    total_cost: totalCost,
    factor_f: factor,
    total_with_factor_f: totalCost * factor,
    total_with_vat: totalCost * factor * 1.07,
    factor_f_raw: factor,
    factor_f_lower_cost: totalCost,
    factor_f_upper_cost: totalCost,
    factor_f_lower_value: factor,
    factor_f_upper_value: factor,
  }
}

async function readBoqItems(boqId) {
  const { data, error } = await service
    .from('boq_items')
    .select('id,item_order,price_list_id,item_name,quantity,unit,material_cost_per_unit,labor_cost_per_unit,unit_cost,total_material_cost,total_labor_cost,total_cost,remarks,category')
    .eq('boq_id', boqId)
    .order('item_order')
  if (error) throw error
  return data
}

function assertCatalogAuthority(savedItem, catalogItem) {
  assert(savedItem.price_list_id === catalogItem.id, 'Saved item changed price_list_id')
  assert(savedItem.unit === catalogItem.unit, 'Saved item unit did not come from catalog')
  assert(
    Number(savedItem.material_cost_per_unit) === Number(catalogItem.material_cost),
    'Saved item material cost did not come from catalog',
  )
  assert(
    Number(savedItem.labor_cost_per_unit) === Number(catalogItem.labor_cost),
    'Saved item labor cost did not come from catalog',
  )
  assert(
    Number(savedItem.unit_cost) === Number(catalogItem.unit_cost),
    'Saved item unit cost did not come from catalog',
  )
  assert(
    savedItem.category === catalogItem.category,
    'Saved item category did not come from catalog',
  )
}

async function readBoqBinding(boqId) {
  const { data, error } = await service
    .from('boq')
    .select('id,price_list_version_id,factor_reference_version_id,total_cost,factor_f,factor_f_raw,factor_f_lower_cost,factor_f_upper_cost,factor_f_lower_value,factor_f_upper_value,total_with_factor_f,total_with_vat')
    .eq('id', boqId)
    .single()
  if (error) throw error
  return data
}

async function readBoqFixtureState(boqId) {
  const [boqResult, routeResult, itemResult] = await Promise.all([
    service.from('boq').select('*').eq('id', boqId).single(),
    service.from('boq_routes').select('*').eq('boq_id', boqId).order('id'),
    service.from('boq_items').select('*').eq('boq_id', boqId).order('id'),
  ])
  if (boqResult.error) throw boqResult.error
  if (routeResult.error) throw routeResult.error
  if (itemResult.error) throw itemResult.error
  return snapshotValue({
    boq: boqResult.data,
    routes: routeResult.data,
    items: itemResult.data,
  })
}

async function copyBoq(sourceId, userId, profile, options) {
  const { data: source, error: sourceError } = await service
    .from('boq')
    .select('*')
    .eq('id', sourceId)
    .single()
  if (sourceError) throw sourceError

  const preservesFactor = options.mode === 'preserve'
  const { data: copy, error: copyError } = await admin
    .from('boq')
    .insert({
      estimator_name: source.estimator_name,
      document_date: new Date().toISOString().slice(0, 10),
      project_name: `${source.project_name} (${options.mode})`,
      route: source.route,
      construction_area: source.construction_area,
      department: source.department,
      total_material_cost: source.total_material_cost,
      total_labor_cost: source.total_labor_cost,
      total_cost: source.total_cost,
      factor_f: preservesFactor ? source.factor_f : null,
      factor_f_raw: preservesFactor ? source.factor_f_raw : null,
      factor_f_lower_cost: preservesFactor ? source.factor_f_lower_cost : null,
      factor_f_upper_cost: preservesFactor ? source.factor_f_upper_cost : null,
      factor_f_lower_value: preservesFactor ? source.factor_f_lower_value : null,
      factor_f_upper_value: preservesFactor ? source.factor_f_upper_value : null,
      total_with_factor_f: preservesFactor ? source.total_with_factor_f : 0,
      total_with_vat: preservesFactor ? source.total_with_vat : 0,
      price_list_version_id: source.price_list_version_id,
      factor_reference_version_id: preservesFactor
        ? source.factor_reference_version_id
        : options.factorVersionId,
      status: 'draft',
      created_by: userId,
      org_id: profile.org_id,
      department_id: profile.department_id,
      sector_id: profile.sector_id,
    })
    .select('id')
    .single()
  if (copyError) throw copyError
  createdBoqIds.add(copy.id)

  const { data: routes, error: routesError } = await service
    .from('boq_routes')
    .select('*')
    .eq('boq_id', sourceId)
    .order('route_order')
  if (routesError) throw routesError

  const routeMapping = new Map()
  for (const route of routes) {
    const { data: copiedRoute, error: routeError } = await admin
      .from('boq_routes')
      .insert({
        boq_id: copy.id,
        route_order: route.route_order,
        route_name: route.route_name,
        route_description: route.route_description,
        construction_area: route.construction_area,
        total_material_cost: route.total_material_cost,
        total_labor_cost: route.total_labor_cost,
        total_cost: route.total_cost,
        cost_with_factor_f: preservesFactor ? route.cost_with_factor_f : 0,
      })
      .select('id')
      .single()
    if (routeError) throw routeError
    routeMapping.set(route.id, copiedRoute.id)
  }

  const { data: items, error: itemsError } = await service
    .from('boq_items')
    .select('*')
    .eq('boq_id', sourceId)
    .order('item_order')
  if (itemsError) throw itemsError
  if (items.length > 0) {
    const { error: insertItemsError } = await admin
      .from('boq_items')
      .insert(items.map((item) => ({
        boq_id: copy.id,
        route_id: item.route_id ? routeMapping.get(item.route_id) ?? null : null,
        item_order: item.item_order,
        price_list_id: item.price_list_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        material_cost_per_unit: item.material_cost_per_unit,
        labor_cost_per_unit: item.labor_cost_per_unit,
        unit_cost: item.unit_cost,
        total_material_cost: item.total_material_cost,
        total_labor_cost: item.total_labor_cost,
        total_cost: item.total_cost,
        remarks: item.remarks,
        category: item.category,
      })))
    if (insertItemsError) throw insertItemsError
  }

  return copy
}

async function assertPreservedCopy(sourceId, copyId) {
  const [sourceBinding, copyBinding] = await Promise.all([
    readBoqBinding(sourceId),
    readBoqBinding(copyId),
  ])
  assert(
    sourceBinding.price_list_version_id === copyBinding.price_list_version_id,
    'Duplicate BOQ changed catalog version',
  )
  assert(
    sourceBinding.factor_reference_version_id === copyBinding.factor_reference_version_id,
    'Duplicate BOQ changed Factor F version',
  )
  for (const field of [
    'factor_f',
    'factor_f_raw',
    'factor_f_lower_cost',
    'factor_f_upper_cost',
    'factor_f_lower_value',
    'factor_f_upper_value',
    'total_with_factor_f',
    'total_with_vat',
  ]) {
    assert(
      numericOrNull(sourceBinding[field]) === numericOrNull(copyBinding[field]),
      `Duplicate BOQ changed ${field}`,
    )
  }
  await assertCopiedItemSnapshots(sourceId, copyId)
}

async function assertSelectedFactorCopy(sourceId, copyId, factorVersionId) {
  const sourceBefore = await readBoqFixtureState(sourceId)
  const copy = await readBoqBinding(copyId)
  assert(
    copy.factor_reference_version_id === factorVersionId,
    'Selected-Factor copy did not bind the selected Factor F version',
  )
  for (const field of [
    'factor_f',
    'factor_f_raw',
    'factor_f_lower_cost',
    'factor_f_upper_cost',
    'factor_f_lower_value',
    'factor_f_upper_value',
  ]) {
    assert(copy[field] === null, `Selected-Factor copy did not reset ${field}`)
  }
  assert(Number(copy.total_with_factor_f) === 0, 'Selected-Factor copy kept factored total')
  assert(Number(copy.total_with_vat) === 0, 'Selected-Factor copy kept VAT total')
  await assertCopiedItemSnapshots(sourceId, copyId)
  assertSnapshotEqual(
    await readBoqFixtureState(sourceId),
    sourceBefore,
    'Selected-Factor copy mutated the original BOQ',
  )
}

async function assertCopiedItemSnapshots(sourceId, copyId) {
  const [sourceItems, copiedItems] = await Promise.all([
    readBoqItems(sourceId),
    readBoqItems(copyId),
  ])
  const normalize = (item) => ({
    item_order: item.item_order,
    price_list_id: item.price_list_id,
    item_name: item.item_name,
    quantity: numericOrNull(item.quantity),
    unit: item.unit,
    material_cost_per_unit: numericOrNull(item.material_cost_per_unit),
    labor_cost_per_unit: numericOrNull(item.labor_cost_per_unit),
    unit_cost: numericOrNull(item.unit_cost),
    total_material_cost: numericOrNull(item.total_material_cost),
    total_labor_cost: numericOrNull(item.total_labor_cost),
    total_cost: numericOrNull(item.total_cost),
    remarks: item.remarks,
    category: item.category,
  })
  assert(
    stableJson(sourceItems.map(normalize)) === stableJson(copiedItems.map(normalize)),
    'BOQ copy did not preserve item snapshots',
  )
}

async function createLegacyFactorFixture(userId, profile, { usableSnapshot }) {
  const factor = usableSnapshot ? 1.1 : null
  const { data, error } = await admin
    .from('boq')
    .insert({
      estimator_name: 'Local WP-7 legacy Factor F fixture',
      document_date: new Date().toISOString().slice(0, 10),
      project_name: usableSnapshot
        ? 'LOCAL WP-7 usable legacy Factor F snapshot'
        : 'LOCAL WP-7 missing legacy Factor F snapshot',
      department: 'Local regression only',
      status: 'draft',
      total_material_cost: 500000,
      total_labor_cost: 500000,
      total_cost: 1000000,
      factor_f: factor,
      factor_f_raw: factor,
      factor_f_lower_cost: usableSnapshot ? 1000000 : null,
      factor_f_upper_cost: usableSnapshot ? 1000000 : null,
      factor_f_lower_value: factor,
      factor_f_upper_value: factor,
      total_with_factor_f: usableSnapshot ? 1100000 : 0,
      total_with_vat: usableSnapshot ? 1177000 : 0,
      factor_reference_version_id: null,
      created_by: userId,
      org_id: profile.org_id,
      department_id: profile.department_id,
      sector_id: profile.sector_id,
    })
    .select('id,factor_reference_version_id,factor_f,factor_f_raw,factor_f_lower_cost,factor_f_upper_cost,factor_f_lower_value,factor_f_upper_value,total_cost')
    .single()
  if (error) throw error
  createdBoqIds.add(data.id)
  assert(
    data.factor_reference_version_id === null,
    'Legacy Factor F fixture was unexpectedly version-bound',
  )
  return data
}

async function verifyPrintExportDataModes(boundId, usableLegacyId, missingLegacyId) {
  const [bound, usableLegacy, missingLegacy] = await Promise.all([
    readBoqBinding(boundId),
    readBoqBinding(usableLegacyId),
    readBoqBinding(missingLegacyId),
  ])
  assert(Boolean(bound.factor_reference_version_id), 'Bound BOQ has no Factor F version')
  const boundVersion = await readFactorVersion(bound.factor_reference_version_id)
  const { count: boundRows, error: rowsError } = await service
    .from('factor_reference_rows')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', bound.factor_reference_version_id)
  if (rowsError) throw rowsError
  assert(Number(boundRows) > 0, 'Bound Factor F version has no rows for print/export')
  assert(
    usableLegacy.factor_reference_version_id === null
      && hasUsableFactorSnapshot(usableLegacy),
    'Legacy usable snapshot mode was not preserved',
  )
  assert(
    missingLegacy.factor_reference_version_id === null
      && !hasUsableFactorSnapshot(missingLegacy),
    'Legacy missing-snapshot mode did not fail closed',
  )
  return {
    boundVersion: boundVersion.version_string,
    boundRows: Number(boundRows),
    legacyUsableSnapshot: true,
    legacyMissingSnapshotFailsClosed: true,
  }
}

function hasUsableFactorSnapshot(boq) {
  const totalCost = Number(boq.total_cost)
  const factor = Number(boq.factor_f)
  const lowerCost = Number(boq.factor_f_lower_cost)
  const upperCost = Number(boq.factor_f_upper_cost)
  const lowerValue = Number(boq.factor_f_lower_value)
  const upperValue = Number(boq.factor_f_upper_value)

  if (
    !Number.isFinite(totalCost)
    || !Number.isFinite(factor)
    || !Number.isFinite(lowerCost)
    || !Number.isFinite(upperCost)
    || !Number.isFinite(lowerValue)
    || !Number.isFinite(upperValue)
    || factor <= 0
    || lowerCost <= 0
    || upperCost <= 0
    || lowerValue <= 0
    || upperValue <= 0
  ) {
    return false
  }

  if (lowerCost > totalCost) {
    return lowerCost === minimumFactorReferenceCost
      && upperCost === minimumFactorReferenceCost
      && totalCost > 0
  }

  if (upperCost > lowerCost) return totalCost < upperCost
  if (lowerCost === maximumFactorReferenceCost) {
    return totalCost >= maximumFactorReferenceCost
  }
  return totalCost <= lowerCost
}

async function cleanupBoqFixtures() {
  const ids = [...createdBoqIds]
  if (ids.length === 0) return
  for (const table of ['boq_items', 'boq_routes', 'boq']) {
    const column = table === 'boq' ? 'id' : 'boq_id'
    const { error } = await service.from(table).delete().in(column, ids)
    if (error) throw error
  }
  for (const id of ids) {
    const { count, error } = await service
      .from('boq')
      .select('id', { count: 'exact', head: true })
      .eq('id', id)
    if (error) throw error
    assert(count === 0, `WP-7 cleanup left BOQ ${id}`)
  }
}

async function closeDraftFixtureIfNeeded() {
  if (!fixtureVersionId) return
  const version = await readVersion(fixtureVersionId)
  if (version.status !== 'draft') return
  expectActionOk(
    await admin.rpc('abandon_catalog_draft', {
      p_version_id: version.id,
      p_expected_lock_version: version.lock_version,
      p_reason: 'WP-7 harness cleanup after failure',
      p_request_id: randomUUID(),
    }),
    'WP-7 abandon failed fixture draft',
  )
}

async function readBoqSnapshot() {
  return snapshotValue({
    boq: await readAllRows('boq'),
    routes: await readAllRows('boq_routes'),
    items: await readAllRows('boq_items'),
  })
}

async function readFactorSnapshot() {
  return snapshotValue({
    versions: await readAllRows('factor_reference_versions'),
    rows: await readAllRows('factor_reference_rows'),
    pointer: await readAllRows('factor_reference_default_version'),
  })
}

async function readAllRows(table) {
  const rows = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await service
      .from(table)
      .select('*')
      .order('id')
      .range(offset, offset + pageSize - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < pageSize) return rows
  }
}

function snapshotValue(value) {
  const json = stableJson(value)
  return {
    value,
    sha256: createHash('sha256').update(json).digest('hex'),
  }
}

function readSecuritySnapshot() {
  const sql = `
    SELECT json_build_object(
      'save_anon_execute', has_function_privilege('anon', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE'),
      'save_authenticated_execute', has_function_privilege('authenticated', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE'),
      'boq_rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.boq'::regclass),
      'factor_versions_rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.factor_reference_versions'::regclass),
      'factor_rows_rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.factor_reference_rows'::regclass),
      'factor_pointer_rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.factor_reference_default_version'::regclass),
      'factor_authenticated_select', has_table_privilege('authenticated', 'public.factor_reference_versions', 'SELECT')
        AND has_table_privilege('authenticated', 'public.factor_reference_rows', 'SELECT')
        AND has_table_privilege('authenticated', 'public.factor_reference_default_version', 'SELECT'),
      'factor_authenticated_write', has_table_privilege('authenticated', 'public.factor_reference_versions', 'INSERT')
        OR has_table_privilege('authenticated', 'public.factor_reference_versions', 'UPDATE')
        OR has_table_privilege('authenticated', 'public.factor_reference_versions', 'DELETE')
        OR has_table_privilege('authenticated', 'public.factor_reference_rows', 'INSERT')
        OR has_table_privilege('authenticated', 'public.factor_reference_rows', 'UPDATE')
        OR has_table_privilege('authenticated', 'public.factor_reference_rows', 'DELETE')
        OR has_table_privilege('authenticated', 'public.factor_reference_default_version', 'INSERT')
        OR has_table_privilege('authenticated', 'public.factor_reference_default_version', 'UPDATE')
        OR has_table_privilege('authenticated', 'public.factor_reference_default_version', 'DELETE'),
      'factor_anon_select', has_table_privilege('anon', 'public.factor_reference_versions', 'SELECT')
        OR has_table_privilege('anon', 'public.factor_reference_rows', 'SELECT')
        OR has_table_privilege('anon', 'public.factor_reference_default_version', 'SELECT'),
      'catalog_binding_trigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.boq'::regclass
          AND tgname = 'trigger_set_default_price_list_version'
          AND NOT tgisinternal
      ),
      'catalog_immutable_trigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.boq'::regclass
          AND tgname = 'trigger_prevent_boq_version_modification'
          AND NOT tgisinternal
      ),
      'factor_binding_trigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.boq'::regclass
          AND tgname = 'trigger_set_default_factor_reference_version'
          AND NOT tgisinternal
      ),
      'factor_immutable_trigger', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.boq'::regclass
          AND tgname = 'trigger_prevent_boq_factor_reference_version_modification'
          AND NOT tgisinternal
      )
    )::text;
  `
  const output = execFileSync(
    'docker',
    ['exec', dbContainer, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres', '-Atc', sql],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim()
  return JSON.parse(output)
}

function assertSecurityContract(snapshot) {
  assert(snapshot.save_anon_execute === false, 'Anonymous role can execute BOQ save RPC')
  assert(snapshot.save_authenticated_execute === true, 'Authenticated role cannot execute BOQ save RPC')
  assert(snapshot.boq_rls === true, 'BOQ RLS is disabled')
  assert(snapshot.factor_versions_rls === true, 'Factor F version RLS is disabled')
  assert(snapshot.factor_rows_rls === true, 'Factor F row RLS is disabled')
  assert(snapshot.factor_pointer_rls === true, 'Factor F pointer RLS is disabled')
  assert(snapshot.factor_authenticated_select === true, 'Authenticated Factor F reads are missing')
  assert(snapshot.factor_authenticated_write === false, 'Authenticated role can write Factor F authority')
  assert(snapshot.factor_anon_select === false, 'Anonymous role can read Factor F authority')
  assert(snapshot.catalog_binding_trigger === true, 'Catalog default binding trigger is missing')
  assert(snapshot.catalog_immutable_trigger === true, 'Catalog binding immutability trigger is missing')
  assert(snapshot.factor_binding_trigger === true, 'Factor F default binding trigger is missing')
  assert(snapshot.factor_immutable_trigger === true, 'Factor F binding immutability trigger is missing')
}

function expectRpcSuccess(result, label) {
  if (result.error) throw new Error(`${label} failed: ${result.error.message}`)
  assert(result.data?.success === true, `${label} returned ${JSON.stringify(result.data)}`)
  return result.data
}

function expectRpcFailure(result, label, expectedCodes) {
  assert(Boolean(result.error), `${label} unexpectedly succeeded`)
  assert(
    expectedCodes.includes(result.error.code),
    `${label} failed with unexpected code ${result.error.code ?? '(missing)'}`,
  )
  return result.error
}

function expectActionOk(result, label) {
  if (result.error) throw new Error(`${label} transport failed: ${result.error.message}`)
  assert(result.data?.ok === true, `${label} returned ${JSON.stringify(result.data)}`)
  return result.data.data
}

function assertSnapshotEqual(actual, expected, message) {
  assert(
    actual.sha256 === expected.sha256,
    `${message}: expected ${expected.sha256}, got ${actual.sha256}`,
  )
}

function numericOrNull(value) {
  return value === null || typeof value === 'undefined' ? null : Number(value)
}

function stableJson(value) {
  return JSON.stringify(sortValue(value))
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    )
  }
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertTrackedTreeClean() {
  const status = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim()
  if (status) throw new Error('Tracked tree must be clean before recording WP-7 DB evidence')
}

function currentCommit() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim()
}

function migration020Sha256() {
  return createHash('sha256')
    .update(readFileSync(resolve('migrations/020_master_catalog_phase4_admin_workflow_hardening.sql')))
    .digest('hex')
}

function readEvidenceOutputPath(args) {
  if (args.length === 0) return null
  if (args.length !== 2 || args[0] !== '--output') {
    throw new Error(
      'Usage: smoke-master-catalog-wp7.mjs [--output tmp/master-catalog/wp7-evidence/<run>.json]',
    )
  }
  const value = args[1]
  if (!value || isAbsolute(value)) {
    throw new Error('WP-7 evidence output must be a relative path')
  }
  const evidenceRoot = resolve('tmp/master-catalog/wp7-evidence')
  const outputPath = resolve(value)
  const pathFromRoot = relative(evidenceRoot, outputPath)
  if (
    pathFromRoot === '..'
    || pathFromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
  ) {
    throw new Error('WP-7 evidence output must stay under tmp/master-catalog/wp7-evidence')
  }
  if (!outputPath.endsWith('.json')) {
    throw new Error('WP-7 evidence output must use a .json filename')
  }
  return outputPath
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

function readLocalDbContainer(value) {
  if (!/^supabase_db_[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error('LOCAL_DB_CONTAINER must name a Local Supabase DB container')
  }
  return value
}

function formatError(label, error) {
  const message = error instanceof Error ? error.message : String(error)
  return `${label}: ${message}`
}

function formatHarnessFailure(error, failureStage, cleanupFailures) {
  const failures = []
  if (error) failures.push(formatError(`WP-7 stage ${failureStage ?? 'unknown'}`, error))
  failures.push(...cleanupFailures)
  if (failures.length === 0) failures.push('WP-7 did not produce a result')
  return failures.join(' | ')
}
