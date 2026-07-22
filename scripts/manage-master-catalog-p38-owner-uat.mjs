import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  access,
  mkdir,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
import { createServer as createViteServer } from 'vite'
import { readLocalEnvFile } from './local-env.mjs'

const MARKER = 'LOCAL-UAT-ONLY-NOT-AUTHORITY'
const INPUT_SCHEMA = 'master-catalog-p38-owner-uat-inputs/1'
const LEGACY_SESSION_SCHEMA = 'master-catalog-p38-owner-uat-session/1'
const SESSION_SCHEMA = 'master-catalog-p38-owner-uat-session/2'
const DEFAULT_SESSION_SCENARIO = 'full-owner-uat'
const SESSION_SCENARIOS = Object.freeze({
  'full-owner-uat': Object.freeze({
    expectedCreatedVersions: 2,
    requiresReplacementPair: true,
    label: 'Owner Card A/G',
  }),
  'bounded-spot-check': Object.freeze({
    expectedCreatedVersions: 1,
    requiresReplacementPair: false,
    label: 'Bounded post-correction spot-check',
  }),
})
const REQUIRED_SHEET = '01_Item_Master_Final'
const README_SHEET = '00_README'
const ADMIN_EMAIL = 'local.admin@ntplc.co.th'
const CATALOG_SETTING_KEYS = [
  'catalog_admin_enabled',
  'catalog_new_identity_enabled',
  'catalog_retirement_enabled',
]
const EXPECTED_CATALOG_DATASET_HASH =
  'sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8'
const EXPECTED_INPUT_HASHES = Object.freeze({
  manifest: '1296f1056f6c1cd768b23c5ac3e6c00462dce018c3bb7710f62c067ee0e63b92',
  source: 'ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b',
  authorityFile: '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
  authorityContent: '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a',
  e01: '86eb347d2b1601a531d4f001cd31e556200f33228a11585bcfd516030e099eed',
  e02: '089393094b6bd5f46e1709acb5658a325deb99ec7824bb728ae43d0b035cd114',
})
const REQUIRED_HEADERS = [
  'item_code',
  'AAA',
  'AAA_name_th',
  'TTT',
  'TTT_name_th',
  'description_th',
  'unit',
  'material_cost',
  'labor_cost',
  'total_cost',
  'source_sheet',
  'source_row',
]
const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim()
const UAT_ROOT = resolve(ROOT, 'tmp/master-catalog/p38-owner-uat')
const DEFAULT_SESSION = resolve(UAT_ROOT, 'session.json')
const DEFAULT_INPUTS = resolve(UAT_ROOT, 'workbooks-ready/manifest.json')

const mode = process.argv[2] ?? 'status'
const options = readOptions(process.argv.slice(3))
const sessionPath = readScopedPath(
  options.session ?? relative(ROOT, DEFAULT_SESSION),
  '--session',
  '.json',
)
const inputsPath = readScopedPath(
  options.inputs ?? relative(ROOT, DEFAULT_INPUTS),
  '--inputs',
  '.json',
)
const requestedScenario = mode === 'prepare'
  ? readSessionScenario(options.scenario ?? DEFAULT_SESSION_SCENARIO)
  : null
assert(mode === 'prepare' || options.scenario === undefined,
  '--scenario is accepted only by prepare and is then bound into the session')

if (mode === 'verify-inputs') {
  console.log(JSON.stringify({ ok: true, mode, inputs: await verifyInputs() }, null, 2))
} else if (mode === 'prepare') {
  await prepare()
} else if (mode === 'status') {
  await status()
} else if (mode === 'cleanup') {
  await cleanup()
} else {
  throw new Error(
    'Usage: manage-master-catalog-p38-owner-uat.mjs '
      + '<verify-inputs|prepare|status|cleanup> [--session <tmp/...json>] '
      + '[--inputs <tmp/...json>] '
      + '[--scenario <full-owner-uat|bounded-spot-check>]',
  )
}

async function prepare() {
  assertTrackedTreeClean()
  assert(gitBranch() === 'codex/master-catalog-phase4',
    'P-38 prepare requires branch codex/master-catalog-phase4')
  assertHeadPushed()
  await assertFileAbsent(sessionPath)
  const inputs = await verifyInputs()
  const local = readLocalClients()
  let originalFlags = null
  let prepared = false

  try {
    const actor = await signInAdmin(local)
    const before = await readBaseline(local.service)
    assertCanonicalBaseline(before)
    const categoryContract = await verifyLocalCategoryContract(
      local.service,
      before.pointer.id,
      inputs.applicationContract.categoryCodeLimit,
    )
    originalFlags = Object.fromEntries(before.flags.map((row) => [row.key, row.value]))

    const [versionsBefore, auditBefore, searchExamples] = await Promise.all([
      readVersions(local.service),
      readAuditCounts(local.service),
      readSearchExamples(local.service, before.pointer.id),
    ])

    await setSetting(local.service, 'catalog_admin_enabled', true)
    await setSetting(local.service, 'catalog_new_identity_enabled', true)
    const enabledFlags = await readFlags(local.service)
    assertFlagState(enabledFlags, {
      catalog_admin_enabled: true,
      catalog_new_identity_enabled: true,
      catalog_retirement_enabled: false,
    })

    const metadata = {
      schemaVersion: SESSION_SCHEMA,
      scenario: requestedScenario,
      status: 'prepared',
      preparedAt: new Date().toISOString(),
      sourceHead: gitHead(),
      branch: gitBranch(),
      productionTouched: false,
      localResetPerformed: false,
      successfulPublicationAuthorized: false,
      actor,
      routes: {
        start: '/admin/master-catalog',
        currentCatalog: '/admin/master-catalog/versions',
      },
      inputs: {
        manifestPath: relative(ROOT, inputsPath),
        manifestSha256: await sha256(inputsPath),
        verification: inputs,
      },
      categoryContract,
      searchExamples,
      originalFlags,
      enabledFlags: Object.fromEntries(enabledFlags.map((row) => [row.key, row.value])),
      existingVersionIds: versionsBefore.map((version) => version.id),
      auditBefore,
      before,
    }

    await writeJsonExclusive(sessionPath, metadata)
    prepared = true
    console.log(JSON.stringify({
      ok: true,
      mode,
      sessionPath: relative(ROOT, sessionPath),
      sourceHead: metadata.sourceHead,
      scenario: metadata.scenario,
      actor: metadata.actor,
      pointer: summarizePointer(before.pointer),
      searchExamples,
      categoryContract,
      flags: metadata.enabledFlags,
      ownerMustCreateDraftsInUi: true,
      productionTouched: false,
      localResetPerformed: false,
    }, null, 2))
  } finally {
    if (!prepared && originalFlags) {
      await restoreFlags(local.service, originalFlags).catch(() => {})
    }
    await local.admin.auth.signOut().catch(() => {})
  }
}

async function status() {
  const local = readLocalClients()
  const metadata = await readJson(sessionPath, false)
  const baseline = await readBaseline(local.service)
  let createdVersions = []

  if (metadata?.existingVersionIds) {
    const existing = new Set(metadata.existingVersionIds)
    createdVersions = (await readVersions(local.service))
      .filter((version) => !existing.has(version.id))
  }

  console.log(JSON.stringify({
    ok: true,
    mode,
    session: metadata ? summarizeSession(metadata) : null,
    baseline,
    createdVersions,
  }, null, 2))
}

async function cleanup() {
  const metadata = await readJson(sessionPath, true)
  assertSessionMetadata(metadata)
  const scenario = readMetadataScenario(metadata)
  const scenarioContract = SESSION_SCENARIOS[scenario]
  const local = readLocalClients()
  let provenanceError = null
  let preCleanup
  let createdVersions
  let auditAfter
  let preCleanupError = null
  let restoreError = null

  try {
    assertTrackedTreeClean()
    assert(gitBranch() === 'codex/master-catalog-phase4',
      'P-38 cleanup requires branch codex/master-catalog-phase4')
    assertHeadPushed()
    assert(metadata.sourceHead === gitHead(),
      `P-38 cleanup HEAD differs from prepared source ${metadata.sourceHead}`)
  } catch (error) {
    provenanceError = error
  }

  try {
    await signInAdmin(local)
    preCleanup = await readBaseline(local.service)
    const existing = new Set(metadata.existingVersionIds)
    createdVersions = (await readVersions(local.service))
      .filter((version) => !existing.has(version.id))
    auditAfter = await readAuditCounts(local.service)

    assertPointerUnchanged(preCleanup, metadata.before)
    assert(preCleanup.workingDrafts === 0,
      `Owner must abandon every UAT draft in the UI; found ${preCleanup.workingDrafts}`)
    assert(createdVersions.length === scenarioContract.expectedCreatedVersions,
      `${scenarioContract.label} must leave exactly `
        + `${scenarioContract.expectedCreatedVersions} new audited version(s); `
        + `found ${createdVersions.length}`)
    assert(createdVersions.every((version) =>
      version.status === 'abandoned'
      && version.is_default === false
      && version.published_at === null
      && version.version_string === null
      && readDraftAttempt(
        version.draft_reference,
        version.target_version_string,
      ) === version.draft_attempt),
    'Every P-38-created version must be abandoned, non-default, and unpublished')
    if (scenarioContract.requiresReplacementPair) {
      assert(new Set(createdVersions.map((version) => version.draft_reference)).size === 2,
        'P-39 requires a different immutable draft reference for each attempt')
      assert(new Set(createdVersions.map((version) => version.target_version_string)).size === 1,
        'P-39 requires the replacement draft to reuse the released target version')
      const createdAttempts = createdVersions
        .map((version) => version.draft_attempt)
        .sort((left, right) => left - right)
      assert(createdAttempts[1] === createdAttempts[0] + 1,
        'P-39 requires consecutive target-scoped draft attempts')
    }
  } catch (error) {
    preCleanupError = error
  } finally {
    try {
      await restoreFlags(local.service, metadata.originalFlags)
    } catch (error) {
      restoreError = error
    }
    await local.admin.auth.signOut().catch(() => {})
  }

  if (restoreError) throw restoreError
  if (provenanceError || preCleanupError) {
    const reasons = [provenanceError, preCleanupError]
      .filter(Boolean)
      .map((error) => error.message)
      .join('; ')
    throw new Error(
      `P-38 cleanup restored Local flags before refusing evidence closure: ${reasons}`,
    )
  }

  const after = await readBaseline(local.service)
  assertBaselineRestored(after, metadata.before, metadata.originalFlags)
  const cleaned = {
    ...metadata,
    status: 'cleaned',
    cleanedAt: new Date().toISOString(),
    createdVersions,
    auditAfter,
    auditDeltas: subtractCounts(auditAfter, metadata.auditBefore),
    preCleanup,
    after,
  }
  await writeJsonAtomic(sessionPath, cleaned)

  console.log(JSON.stringify({
    ok: true,
    mode,
    session: summarizeSession(cleaned),
    pointer: summarizePointer(after.pointer),
    workingDrafts: after.workingDrafts,
    flags: Object.fromEntries(after.flags.map((row) => [row.key, row.value])),
    createdVersions,
    auditDeltas: cleaned.auditDeltas,
    productionTouched: false,
    localResetPerformed: false,
  }, null, 2))
}

async function verifyInputs() {
  await assertSha(inputsPath, EXPECTED_INPUT_HASHES.manifest, 'P-38 input manifest')
  const manifest = await readJson(inputsPath, true)
  assert(manifest.schemaVersion === INPUT_SCHEMA, 'P-38 input manifest schema is invalid')
  assert(manifest.marker === MARKER, 'P-38 input manifest marker is invalid')
  assertPinnedHash(manifest.source?.sha256, EXPECTED_INPUT_HASHES.source, 'source workbook')
  assertPinnedHash(
    manifest.frozenAuthority?.fileSha256,
    EXPECTED_INPUT_HASHES.authorityFile,
    'frozen authority file',
  )
  assertPinnedHash(
    manifest.frozenAuthority?.authoritySha256,
    EXPECTED_INPUT_HASHES.authorityContent,
    'frozen authority content',
  )
  assertPinnedHash(manifest.e01?.sha256, EXPECTED_INPUT_HASHES.e01, 'E-01 workbook')
  assertPinnedHash(manifest.e02?.sha256, EXPECTED_INPUT_HASHES.e02, 'E-02 workbook')
  assert(manifest.source?.path === 'files/NT_Item_Code_Master_K_Mapping_2568.xlsx',
    'P-38 source workbook path is not the approved reconciliation input')
  assert(manifest.source?.rawRows === 708, 'P-38 source manifest must declare 708 raw rows')
  assert(manifest.source?.expectedAuthorityPayloadRows === 710,
    'P-38 source manifest must declare the 710-row authority payload')

  const sourcePath = readManifestPath(manifest.source.path, 'source.path', resolve(ROOT, 'files'))
  const authorityPath = readManifestPath(
    manifest.frozenAuthority?.path,
    'frozenAuthority.path',
    resolve(ROOT, 'lib/master-catalog/import/data'),
  )
  const e01Path = readManifestPath(manifest.e01?.path, 'e01.path', dirname(inputsPath))
  const e02Path = readManifestPath(manifest.e02?.path, 'e02.path', dirname(inputsPath))

  await assertSha(sourcePath, manifest.source.sha256, 'source workbook')
  await assertSha(authorityPath, manifest.frozenAuthority.fileSha256, 'frozen authority')
  await assertSha(e01Path, manifest.e01.sha256, 'E-01 workbook')
  await assertSha(e02Path, manifest.e02.sha256, 'E-02 workbook')

  const authority = JSON.parse(await readFile(authorityPath, 'utf8'))
  assert(authority.authority_sha256 === manifest.frozenAuthority.authoritySha256,
    'Frozen authority content hash differs from the input manifest')
  assert(authority.mappings.length === 710, 'Frozen authority must contain 710 mappings')
  assert(authority.source_exclusions.length === 17,
    'Frozen authority must contain 17 source exclusions')
  assert(authority.code_groups.length === 65, 'Frozen authority must contain 65 code groups')

  const applicationParser = await loadApplicationParser()
  let source
  let e01
  let e02
  try {
    [source, e01, e02] = await Promise.all([
      readWorkbookRows(sourcePath, applicationParser),
      readWorkbookRows(e01Path, applicationParser),
      readWorkbookRows(e02Path, applicationParser),
    ])
  } finally {
    await applicationParser.close()
  }
  assert(source.marker !== MARKER, 'Approved source workbook was marked as a Local derivative')
  assert(e01.marker === MARKER && e02.marker === MARKER,
    'Every P-38 derivative must visibly carry the Local-only marker')
  assert(source.rows.length === 708, `Approved source has ${source.rows.length} rows, expected 708`)
  assert(e01.rows.length === 708, `E-01 has ${e01.rows.length} rows, expected 708`)
  assert(e02.rows.length === 693, `E-02 has ${e02.rows.length} rows, expected 693`)

  const oldCode = manifest.e01.recipe.oldSourceCode
  const localCode = manifest.e01.recipe.localCandidateSourceCode
  const sourceByCode = rowsByCode(source.rows)
  const e01ByCode = rowsByCode(e01.rows)
  const e02ByCode = rowsByCode(e02.rows)
  assert(sourceByCode.has(oldCode) && !sourceByCode.has(localCode),
    'E-01 source/local code precondition failed')
  assert(!e01ByCode.has(oldCode) && e01ByCode.has(localCode),
    'E-01 must replace exactly the declared mapped code with one Local candidate')
  assert(!authority.mappings.some((row) => row.source_item_code === localCode),
    'E-01 Local candidate unexpectedly exists in frozen mappings')
  assert(!authority.source_exclusions.some((row) => row.source_item_code === localCode),
    'E-01 Local candidate unexpectedly exists in source exclusions')
  assertRequiredRowsEqual(
    sourceByCode.get(oldCode),
    e01ByCode.get(localCode),
    new Set(['item_code']),
    'E-01 changed more than the declared parser field',
  )
  for (const [code, sourceRow] of sourceByCode) {
    if (code === oldCode) continue
    assertRequiredRowsEqual(
      sourceRow,
      e01ByCode.get(code),
      new Set(),
      `E-01 changed undeclared row ${code}`,
    )
  }

  const omittedCodes = manifest.e02.omittedMappedCodes
  assert(Array.isArray(omittedCodes) && omittedCodes.length === 15,
    'E-02 must omit exactly 15 mapped source codes')
  assert(new Set(omittedCodes).size === omittedCodes.length,
    'E-02 omitted source codes must be unique')
  for (const code of omittedCodes) {
    assert(sourceByCode.has(code), `E-02 omitted code ${code} is absent from source`)
    assert(authority.mappings.some((row) => row.source_item_code === code),
      `E-02 omitted code ${code} is not frozen-mapped`)
    assert(!e02ByCode.has(code), `E-02 still contains omitted code ${code}`)
  }
  for (const [code, row] of e02ByCode) {
    assertRequiredRowsEqual(
      sourceByCode.get(code),
      row,
      new Set(),
      `E-02 changed retained row ${code}`,
    )
  }
  assert(manifest.e01.initialExpectedCode === 'IMPORT_PRICE_AUTHORITY_REQUIRED',
    'E-01 expected diagnostic is not the price-authority guard')
  assert(manifest.e02.initialExpectedCode === 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
    'E-02 expected diagnostic is not the retirement hold')
  assert(manifest.e02.expectedRetireCountAfterCardB === 17,
    'E-02 must expect 15 mapped omissions plus two Card B identities')
  assert(manifest.e01.applyMustRemainUnavailable === true
    && manifest.e02.applyMustRemainUnavailable === true,
  'Both safe-error derivatives must keep Apply unavailable')

  return {
    manifestPath: relative(ROOT, inputsPath),
    manifestSha256: await sha256(inputsPath),
    source: {
      path: manifest.source.path,
      sha256: manifest.source.sha256,
      rows: source.rows.length,
      applicationParserRows: source.applicationParserRows,
    },
    frozenAuthority: {
      authoritySha256: authority.authority_sha256,
      mappings: authority.mappings.length,
      sourceExclusions: authority.source_exclusions.length,
      codeGroups: authority.code_groups.length,
    },
    applicationContract: {
      categoryCodeLimit: applicationParser.categoryCodeLimit,
    },
    e01: {
      path: manifest.e01.path,
      sha256: manifest.e01.sha256,
      rows: e01.rows.length,
      applicationParserRows: e01.applicationParserRows,
      oldCode,
      localCode,
      initialExpectedCode: manifest.e01.initialExpectedCode,
    },
    e02: {
      path: manifest.e02.path,
      sha256: manifest.e02.sha256,
      rows: e02.rows.length,
      applicationParserRows: e02.applicationParserRows,
      omittedMappedRows: omittedCodes.length,
      expectedRetireCountAfterCardB: manifest.e02.expectedRetireCountAfterCardB,
      initialExpectedCode: manifest.e02.initialExpectedCode,
    },
  }
}

function readLocalClients() {
  const localEnv = readLocalEnvFile(resolve(ROOT, 'supabase/.env.local'))
  const url = readLoopbackOrigin(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? localEnv.NEXT_PUBLIC_SUPABASE_URL,
  )
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?? localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const secretKey = process.env.LOCAL_SUPABASE_SECRET_KEY
    ?? localEnv.LOCAL_SUPABASE_SECRET_KEY
  const password = process.env.LOCAL_TEST_PASSWORD ?? localEnv.LOCAL_TEST_PASSWORD
  assert(publishableKey && secretKey && password,
    'Local publishable key, secret key, and LOCAL_TEST_PASSWORD are required')

  const client = (key) => createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return {
    service: client(secretKey),
    admin: client(publishableKey),
    password,
  }
}

async function signInAdmin(local) {
  const { data, error } = await local.admin.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: local.password,
  })
  if (error) throw error
  assert(data.user, 'Local admin sign-in returned no user')
  const profile = await readSingleRow(
    local.service,
    'user_profiles',
    'id,role,status,first_name,last_name',
    (query) => query.eq('id', data.user.id),
  )
  assert(profile.role === 'admin' && profile.status === 'active',
    'P-38 Local actor must be an active admin')
  return {
    id: data.user.id,
    email: data.user.email,
    displayName: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || null,
    role: profile.role,
    status: profile.status,
  }
}

async function readBaseline(service) {
  const pointerRow = await readSingleRow(
    service,
    'price_list_default_version',
    'version_id',
    (query) => query.eq('id', true),
  )
  const factorPointer = await readSingleRow(
    service,
    'factor_reference_default_version',
    'version_id',
    (query) => query.eq('id', true),
  )
  const [
    pointer,
    flags,
    workingDrafts,
    pointerRows,
    boqCount,
    boqItemCount,
    unversionedBoqs,
    factorVersion,
    factorRows,
  ] = await Promise.all([
    readVersion(service, pointerRow.version_id),
    readFlags(service),
    countRows(service, 'price_list_versions', (query) => query.eq('status', 'draft')),
    countRows(service, 'price_list', (query) => query.eq('version_id', pointerRow.version_id)),
    countRows(service, 'boq'),
    countRows(service, 'boq_items'),
    countRows(service, 'boq', (query) => query.is('price_list_version_id', null)),
    readSingleRow(
      service,
      'factor_reference_versions',
      'id,version_string,status',
      (query) => query.eq('id', factorPointer.version_id),
    ),
    countRows(
      service,
      'factor_reference_rows',
      (query) => query.eq('version_id', factorPointer.version_id),
    ),
  ])
  return {
    pointer,
    pointerRows,
    workingDrafts,
    flags,
    boqCount,
    boqItemCount,
    unversionedBoqs,
    factorVersion,
    factorRows,
  }
}

function assertCanonicalBaseline(state) {
  assert(state.pointer.version_string === '2568.0.0',
    `Expected pointer 2568.0.0, found ${state.pointer.version_string}`)
  assert(state.pointer.status === 'active' && state.pointer.is_default === true,
    'Catalog pointer is not active/default')
  assert(state.pointerRows === 710 && state.pointer.item_count === 710,
    'Catalog baseline is not 710 rows')
  assert(state.pointer.dataset_hash === EXPECTED_CATALOG_DATASET_HASH,
    `Catalog baseline dataset hash changed: ${state.pointer.dataset_hash}`)
  assert(state.workingDrafts === 0,
    `Expected zero working drafts, found ${state.workingDrafts}`)
  assertFlagState(state.flags, Object.fromEntries(CATALOG_SETTING_KEYS.map((key) => [key, false])))
  assert(state.boqCount === 198 && state.boqItemCount === 1547 && state.unversionedBoqs === 0,
    'BOQ baseline changed')
  assert(state.factorVersion.version_string === '2569.0.0'
    && state.factorVersion.status === 'active'
    && state.factorRows === 36,
  'Factor F baseline changed')
}

function assertPointerUnchanged(current, before) {
  assert(current.pointer.id === before.pointer.id, 'Catalog pointer ID changed during P-38 UAT')
  assert(current.pointer.version_string === before.pointer.version_string,
    'Catalog pointer version changed during P-38 UAT')
  assert(current.pointer.dataset_hash === before.pointer.dataset_hash,
    'Catalog pointer dataset hash changed during P-38 UAT')
  assert(current.pointerRows === before.pointerRows,
    'Catalog pointer row count changed during P-38 UAT')
  assert(current.boqCount === before.boqCount
    && current.boqItemCount === before.boqItemCount
    && current.unversionedBoqs === before.unversionedBoqs,
  'BOQ baseline changed during P-38 UAT')
  assert(current.factorVersion.id === before.factorVersion.id
    && current.factorVersion.version_string === before.factorVersion.version_string
    && current.factorVersion.status === before.factorVersion.status
    && current.factorRows === before.factorRows,
  'Factor F baseline changed during P-38 UAT')
}

function assertSessionMetadata(metadata) {
  readMetadataScenario(metadata)
  assert(metadata.status === 'prepared', `P-38 session status is ${metadata.status}`)
  assert(metadata.branch === 'codex/master-catalog-phase4',
    'P-38 session branch is invalid')
  assert(/^[a-f0-9]{40}$/.test(metadata.sourceHead ?? ''),
    'P-38 session source HEAD is invalid')
  assert(metadata.productionTouched === false && metadata.localResetPerformed === false,
    'P-38 session safety boundary is invalid')
  assert(Array.isArray(metadata.existingVersionIds),
    'P-38 session version baseline is invalid')
  for (const key of CATALOG_SETTING_KEYS) {
    assert(typeof metadata.originalFlags?.[key] === 'boolean',
      `P-38 session is missing original flag ${key}`)
  }
}

function assertBaselineRestored(after, before, originalFlags) {
  assertPointerUnchanged(after, before)
  assert(after.workingDrafts === 0, 'Working drafts remain after P-38 cleanup')
  assertFlagState(after.flags, originalFlags)
}

async function readSearchExamples(service, versionId) {
  const { data, error } = await service
    .from('price_list')
    .select('identity_id,item_code,item_name,unit,display_order')
    .eq('version_id', versionId)
    .order('display_order')
    .order('identity_id')
  if (error) throw error
  const rows = data ?? []
  assert(rows.length === 710, `Expected 710 search-example rows, found ${rows.length}`)
  const indexes = [0, Math.floor((rows.length - 1) / 2), rows.length - 1]
  return indexes.map((index, order) => ({
    portion: ['first', 'middle', 'last'][order],
    position: index + 1,
    ...rows[index],
  }))
}

async function readVersion(service, versionId) {
  return readSingleRow(
    service,
    'price_list_versions',
    'id,version_string,target_version_string,draft_attempt,draft_reference,major,minor,patch,status,is_default,based_on_version_id,lock_version,placement_revision,item_count,dataset_hash,published_at,created_at',
    (query) => query.eq('id', versionId),
  )
}

async function readVersions(service) {
  const { data, error } = await service
    .from('price_list_versions')
    .select('id,version_string,target_version_string,draft_attempt,draft_reference,status,is_default,based_on_version_id,item_count,published_at,created_at')
    .order('created_at')
    .order('id')
  if (error) throw error
  return data ?? []
}

async function readAuditCounts(service) {
  const [changeSets, placementReviews, imports] = await Promise.all([
    countRows(service, 'catalog_change_sets'),
    countRows(service, 'catalog_placement_reviews'),
    countRows(service, 'catalog_imports'),
  ])
  return { changeSets, placementReviews, imports }
}

async function readFlags(service) {
  const { data, error } = await service
    .from('app_settings')
    .select('key,value')
    .in('key', CATALOG_SETTING_KEYS)
    .order('key')
  if (error) throw error
  assert((data ?? []).length === CATALOG_SETTING_KEYS.length,
    'Catalog feature settings are incomplete')
  return data ?? []
}

async function setSetting(service, key, value) {
  const { data, error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', key)
    .select('key,value')
    .single()
  if (error) throw error
  assert(data.key === key && data.value === value, `Setting ${key} did not update`)
}

async function restoreFlags(service, flags) {
  for (const key of CATALOG_SETTING_KEYS) {
    assert(typeof flags[key] === 'boolean', `Missing original flag ${key}`)
    await setSetting(service, key, flags[key])
  }
}

function assertFlagState(rows, expected) {
  const actual = Object.fromEntries(rows.map((row) => [row.key, row.value]))
  for (const key of CATALOG_SETTING_KEYS) {
    assert(actual[key] === expected[key],
      `Expected ${key}=${expected[key]}, found ${actual[key]}`)
  }
}

async function loadApplicationParser() {
  const server = await createViteServer({
    appType: 'custom',
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    server: {
      hmr: false,
      middlewareMode: true,
    },
  })

  try {
    const [adapter, profiles, payload] = await Promise.all([
      server.ssrLoadModule('/lib/master-catalog/import/workbookAdapter.ts'),
      server.ssrLoadModule('/lib/master-catalog/import/parser-profiles/index.ts'),
      server.ssrLoadModule('/lib/master-catalog/import/payload.ts'),
    ])
    const parseWorkbook = adapter.parseCatalogWorkbookInfoFromXlsx
    const profile = profiles.NT_ITEM_MASTER_2568_PROFILE
    assert(typeof parseWorkbook === 'function',
      'Application workbook adapter is unavailable to P-38 preflight')
    assert(profile && typeof profile.detect === 'function' && typeof profile.normalizeRow === 'function',
      'Application parser profile is unavailable to P-38 preflight')
    assert(Number.isInteger(payload.CATALOG_IMPORT_CATEGORY_CODE_LIMIT)
      && payload.CATALOG_IMPORT_CATEGORY_CODE_LIMIT > 0,
    'Application category-code contract is unavailable to P-38 preflight')

    return {
      parseWorkbook,
      profile,
      categoryCodeLimit: payload.CATALOG_IMPORT_CATEGORY_CODE_LIMIT,
      close: () => server.close(),
    }
  } catch (error) {
    await server.close()
    throw error
  }
}

async function verifyLocalCategoryContract(service, versionId, categoryCodeLimit) {
  const { data, error } = await service
    .from('price_list_categories')
    .select('id,code')
    .eq('version_id', versionId)
    .order('display_order', { ascending: true })
    .limit(1_000)
  if (error) throw error

  const categories = data ?? []
  assert(categories.length > 0, 'P-38 Local category dictionary is empty')
  const lengths = categories.map((category) => ({
    code: String(category.code ?? ''),
    length: String(category.code ?? '').length,
  }))
  const invalid = lengths.find((category) => (
    category.length === 0 || category.length > categoryCodeLimit
  ))
  assert(!invalid,
    `P-38 category-code contract rejects Local authority value length ${invalid?.length}`)

  return {
    categories: categories.length,
    maxCodeLength: Math.max(...lengths.map((category) => category.length)),
    categoryCodeLimit,
  }
}

async function readWorkbookRows(path, applicationParser) {
  const bytes = await readFile(path)
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  )
  const parsed = await applicationParser.parseWorkbook({
    filename: basename(path),
    sizeBytes: bytes.byteLength,
    arrayBuffer,
  })
  const detection = applicationParser.profile.detect(parsed.workbookInfo)
  assert(detection.matched,
    `Application parser rejected ${relative(ROOT, path)}: ${JSON.stringify(detection.errors)}`)
  const parserSheet = parsed.workbookInfo.sheets.find(
    (sheet) => sheet.name.trim() === REQUIRED_SHEET,
  )
  assert(parserSheet, `Application parser did not expose ${REQUIRED_SHEET}`)
  const categoryCodeByGroup = {}
  for (const row of parserSheet.dataRows) {
    const workContextCode = typeof row.AAA === 'string' ? row.AAA.trim() : ''
    const itemTypeCode = typeof row.TTT === 'string' ? row.TTT.trim() : ''
    if (workContextCode && itemTypeCode) {
      categoryCodeByGroup[`${workContextCode}-${itemTypeCode}`] = 'LOCAL-UAT-PREFLIGHT'
    }
  }
  const applicationRows = parserSheet.dataRows.map((row) => (
    applicationParser.profile.normalizeRow(row, { categoryCodeByGroup })
  ))

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(path)
  const sheet = workbook.getWorksheet(REQUIRED_SHEET)
  const readme = workbook.getWorksheet(README_SHEET)
  assert(sheet, `Workbook ${relative(ROOT, path)} is missing ${REQUIRED_SHEET}`)
  assert(readme, `Workbook ${relative(ROOT, path)} is missing ${README_SHEET}`)
  const headerIndex = new Map()
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
    const header = cell.text.trim()
    if (header) headerIndex.set(header, column)
  })
  for (const header of REQUIRED_HEADERS) {
    assert(headerIndex.has(header), `Workbook ${relative(ROOT, path)} is missing ${header}`)
  }

  const rows = []
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = Object.fromEntries(REQUIRED_HEADERS.map((header) => [
      header,
      sheet.getRow(rowNumber).getCell(headerIndex.get(header)).text.trim(),
    ]))
    if (Object.values(row).some(Boolean)) rows.push({ rowNumber, ...row })
  }
  assert(applicationRows.length === rows.length,
    `Application parser row count differs for ${relative(ROOT, path)}`)
  return {
    marker: readme.getCell('B2').text.trim(),
    rows,
    applicationParserRows: applicationRows.length,
  }
}

function rowsByCode(rows) {
  const result = new Map()
  for (const row of rows) {
    assert(row.item_code && !result.has(row.item_code),
      `Workbook contains duplicate or missing item_code ${row.item_code}`)
    result.set(row.item_code, row)
  }
  return result
}

function assertRequiredRowsEqual(left, right, ignored, message) {
  assert(left && right, message)
  for (const header of REQUIRED_HEADERS) {
    if (ignored.has(header)) continue
    assert(left[header] === right[header], `${message}: ${header}`)
  }
}

async function readSingleRow(service, table, columns, scope) {
  const { data, error } = await scope(service.from(table).select(columns)).single()
  if (error) throw error
  return data
}

async function countRows(service, table, scope = (query) => query) {
  const { count, error } = await scope(
    service.from(table).select('*', { count: 'exact', head: true }),
  )
  if (error) throw error
  return count ?? 0
}

function readOptions(args) {
  const result = {}
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!['--session', '--inputs', '--scenario'].includes(key) || !value) {
      throw new Error(
        'Options must be --session <path>, --inputs <path>, and/or '
          + '--scenario <full-owner-uat|bounded-spot-check>',
      )
    }
    result[key.slice(2)] = value
  }
  return result
}

function readScopedPath(value, label, extension) {
  assert(value && !isAbsolute(value), `${label} must be a relative path`)
  const path = resolve(ROOT, value)
  const fromRoot = relative(UAT_ROOT, path)
  assert(fromRoot !== '..' && !fromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`),
    `${label} must stay under tmp/master-catalog/p38-owner-uat`)
  assert(path.endsWith(extension), `${label} must use ${extension}`)
  return path
}

function readManifestPath(value, field, allowedRoot) {
  assert(typeof value === 'string' && value && !isAbsolute(value), `${field} is invalid`)
  const path = resolve(ROOT, value)
  const fromAllowed = relative(allowedRoot, path)
  assert(fromAllowed !== '..'
    && !fromAllowed.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`),
  `${field} escapes its approved root`)
  return path
}

function readLoopbackOrigin(name, value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a loopback URL for Local-only P-38 work`)
  }
  assert(parsed.protocol === 'http:'
    && ['127.0.0.1', 'localhost'].includes(parsed.hostname)
    && parsed.port
    && !parsed.username
    && !parsed.password,
  `${name} must be a loopback URL for Local-only P-38 work`)
  return parsed.origin
}

async function assertSha(path, expected, label) {
  const actual = await sha256(path)
  assert(/^[a-f0-9]{64}$/.test(expected ?? '') && actual === expected,
    `${label} SHA-256 differs from the manifest`)
}

function assertPinnedHash(actual, expected, label) {
  assert(actual === expected, `${label} hash is not the tracked P-38 value`)
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex')
}

async function readJson(path, required) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (!required && error?.code === 'ENOENT') return null
    throw error
  }
}

async function assertFileAbsent(path) {
  try {
    await access(path)
    throw new Error(`Refusing to overwrite existing P-38 session ${relative(ROOT, path)}`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

async function writeJsonExclusive(path, value) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx',
  })
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true })
  const temporaryPath = `${path}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, path)
}

function subtractCounts(after, before) {
  return Object.fromEntries(Object.keys(after).map((key) => [key, after[key] - before[key]]))
}

function summarizePointer(pointer) {
  return {
    id: pointer.id,
    versionString: pointer.version_string,
    status: pointer.status,
    isDefault: pointer.is_default,
    itemCount: pointer.item_count,
    datasetHash: pointer.dataset_hash,
  }
}

function summarizeSession(metadata) {
  return {
    status: metadata.status,
    scenario: readMetadataScenario(metadata),
    preparedAt: metadata.preparedAt,
    cleanedAt: metadata.cleanedAt ?? null,
    sourceHead: metadata.sourceHead,
    branch: metadata.branch,
    actor: metadata.actor,
    productionTouched: metadata.productionTouched,
    localResetPerformed: metadata.localResetPerformed,
  }
}

function readSessionScenario(value) {
  assert(typeof value === 'string' && Object.hasOwn(SESSION_SCENARIOS, value),
    `P-38 session scenario is invalid: ${value}`)
  return value
}

function readMetadataScenario(metadata) {
  if (metadata.schemaVersion === LEGACY_SESSION_SCHEMA) {
    return DEFAULT_SESSION_SCENARIO
  }
  assert(metadata.schemaVersion === SESSION_SCHEMA, 'P-38 session schema is invalid')
  return readSessionScenario(metadata.scenario)
}

function assertTrackedTreeClean() {
  const status = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    { cwd: ROOT, encoding: 'utf8' },
  ).trim()
  assert(status === '', `Tracked tree is not clean:\n${status}`)
}

function gitHead() {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
}

function gitBranch() {
  return execFileSync('git', ['branch', '--show-current'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).trim()
}

function assertHeadPushed() {
  let upstreamHead
  try {
    upstreamHead = execFileSync(
      'git',
      ['rev-parse', '--verify', '@{upstream}'],
      { cwd: ROOT, encoding: 'utf8' },
    ).trim()
  } catch {
    throw new Error('P-38 requires a configured upstream branch')
  }
  assert(gitHead() === upstreamHead,
    'P-38 requires HEAD to match the pushed upstream checkpoint')
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
