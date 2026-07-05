import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { readLocalEnvFile } from './local-env.mjs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const localEnv = readLocalEnvFile()
const secretKey = localEnv.LOCAL_SUPABASE_SECRET_KEY ?? process.env.LOCAL_SUPABASE_SECRET_KEY
const password = localEnv.LOCAL_TEST_PASSWORD ?? process.env.LOCAL_TEST_PASSWORD

if (!url || !publishableKey || !secretKey || !password) {
  throw new Error('Local Supabase URL, publishable key, secret key, and LOCAL_TEST_PASSWORD are required')
}

if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`Refusing to run WP-5 smoke against a non-local Supabase URL: ${url}`)
}

const supabase = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const service = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertActionOk(result, label) {
  if (result.error) {
    throw new Error(`${label} RPC failed: ${result.error.message}`)
  }

  if (!result.data?.ok) {
    throw new Error(`${label} returned action error: ${JSON.stringify(result.data)}`)
  }

  return result.data.data
}

function assertActionCode(result, label, code) {
  if (result.error) {
    throw new Error(`${label} RPC failed before action result: ${result.error.message}`)
  }

  assert(result.data?.ok === false, `${label} unexpectedly succeeded`)
  assert(result.data.error?.code === code, `${label} expected ${code}, got ${JSON.stringify(result.data)}`)
  return result.data
}

async function readFactorSummary() {
  const { data: pointer, error: pointerError } = await supabase
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError

  const { data: version, error: versionError } = await supabase
    .from('factor_reference_versions')
    .select('id, version_string, dataset_hash')
    .eq('id', pointer.version_id)
    .single()
  if (versionError) throw versionError

  const { count, error: rowError } = await supabase
    .from('factor_reference_rows')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', pointer.version_id)
  if (rowError) throw rowError

  return {
    versionId: pointer.version_id,
    versionString: version.version_string,
    datasetHash: version.dataset_hash,
    rowCount: count,
  }
}

async function readBoqSummary() {
  const { count, error: countError } = await supabase
    .from('boq')
    .select('id', { count: 'exact', head: true })
  if (countError) throw countError

  const { data, error } = await supabase
    .from('boq')
    .select('price_list_version_id, factor_reference_version_id')
  if (error) throw error

  const split = new Map()
  for (const row of data ?? []) {
    const key = [
      row.price_list_version_id ?? 'null-catalog',
      row.factor_reference_version_id ?? 'null-factor',
    ].join('|')
    split.set(key, (split.get(key) ?? 0) + 1)
  }

  return {
    count,
    split: [...split.entries()].sort(),
  }
}

async function setCatalogAdminEnabled(value) {
  const { error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', 'catalog_admin_enabled')
  if (error) throw error
}

async function readCurrentCatalogPointer() {
  const { data, error } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (error) throw error
  return data.version_id
}

async function readCatalogVersionById(versionId) {
  const { data, error } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status, is_default, lock_version, based_on_version_id, item_count, dataset_hash, published_at, approval_reference, effective_date, approval_document_date, published_by_display_name')
    .eq('id', versionId)
    .single()
  if (error) throw error
  return data
}

async function assertStaleBasePublishRejected(draftVersion, baseVersionId) {
  let fixtureVersionId = null
  const fixturePatch = (Number.parseInt(randomUUID().slice(0, 6), 16) % 100000) + 1

  try {
    // Transient local-only pointer target for the stale-base branch; deleted before the real publish.
    const { data: fixture, error: fixtureError } = await service
      .from('price_list_versions')
      .insert({
        major: 9999,
        minor: 5,
        patch: fixturePatch,
        name: 'Local WP-5 stale-base pointer fixture',
        status: 'active',
        is_default: false,
      })
      .select('id, version_string')
      .single()
    if (fixtureError) throw fixtureError

    fixtureVersionId = fixture.id

    const { error: pointerMoveError } = await service
      .from('price_list_default_version')
      .update({ version_id: fixtureVersionId })
      .eq('id', true)
    if (pointerMoveError) throw pointerMoveError

    assert(await readCurrentCatalogPointer() === fixtureVersionId, 'Stale-base fixture pointer did not move')

    assertActionCode(
      await supabase.rpc('publish_catalog_version', {
        p_version_id: draftVersion.id,
        p_expected_lock_version: draftVersion.lock_version,
        p_approval_metadata: {
          effectiveDate: '2026-07-05',
          approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
          approvalDocumentDate: '2026-07-05',
          publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
        },
        p_reason: 'WP-5 stale base pointer reject smoke',
        p_request_id: randomUUID(),
      }),
      'publish_catalog_version stale base pointer',
      'DRAFT_BASE_STALE',
    )

    assert(await readCurrentCatalogPointer() === fixtureVersionId, 'Pointer moved after rejected stale-base publish')
  } finally {
    if (fixtureVersionId) {
      const { error: pointerRestoreError } = await service
        .from('price_list_default_version')
        .update({ version_id: baseVersionId })
        .eq('id', true)
      if (pointerRestoreError) throw pointerRestoreError

      const { error: fixtureDeleteError } = await service
        .from('price_list_versions')
        .delete()
        .eq('id', fixtureVersionId)
      if (fixtureDeleteError) throw fixtureDeleteError
    }
  }

  assert(await readCurrentCatalogPointer() === baseVersionId, 'Stale-base fixture did not restore the pointer to base')
}

try {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'local.admin@ntplc.co.th',
    password,
  })
  if (authError) throw authError

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('id', authData.user.id)
    .single()
  if (profileError) throw profileError
  assert(profile.role === 'admin' && profile.status === 'active', 'Local admin profile is not active')

  const beforeFactor = await readFactorSummary()
  const beforeBoq = await readBoqSummary()

  await setCatalogAdminEnabled(true)

  const baseVersionId = await readCurrentCatalogPointer()
  const baseVersion = await readCatalogVersionById(baseVersionId)
  assert(baseVersion.version_string === '2568.0.0', 'WP-5 smoke must start from 2568.0.0')
  assert(baseVersion.status === 'active' && baseVersion.is_default === true, 'Base catalog is not active/default')
  assert(/^sha256:[0-9a-f]{64}$/.test(baseVersion.dataset_hash ?? ''), 'Base catalog hash was not backfilled by migration 018')
  assert(baseVersion.published_at, 'Base catalog published_at was not backfilled by migration 018')

  const createRequestId = randomUUID()
  const createData = assertActionOk(
    await supabase.rpc('create_catalog_draft', {
      p_base_version_id: baseVersion.id,
      p_version_major: 2568,
      p_version_minor: 1,
      p_version_patch: 0,
      p_name: 'Local rehearsal publish draft 2568.1.0',
      p_reason: 'WP-5 local-only draft for publish smoke',
      p_request_id: createRequestId,
    }),
    'create_catalog_draft',
  )

  const draftBeforePublish = await readCatalogVersionById(createData.versionId)
  assert(draftBeforePublish.status === 'draft', 'Created catalog version is not draft')
  assert(draftBeforePublish.based_on_version_id === baseVersion.id, 'Draft base does not match current pointer')

  assertActionCode(
    await supabase.rpc('publish_catalog_version', {
      p_version_id: draftBeforePublish.id,
      p_expected_lock_version: draftBeforePublish.lock_version,
      p_approval_metadata: {},
      p_reason: 'WP-5 missing metadata reject smoke',
      p_request_id: randomUUID(),
    }),
    'publish_catalog_version missing metadata',
    'PUBLICATION_METADATA_REQUIRED',
  )
  assert(await readCurrentCatalogPointer() === baseVersion.id, 'Pointer moved after rejected publish metadata')

  assertActionCode(
    await supabase.rpc('publish_catalog_version', {
      p_version_id: draftBeforePublish.id,
      p_expected_lock_version: draftBeforePublish.lock_version + 1,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      },
      p_reason: 'WP-5 stale lock reject smoke',
      p_request_id: randomUUID(),
    }),
    'publish_catalog_version stale lock',
    'DRAFT_LOCK_CONFLICT',
  )
  assert(await readCurrentCatalogPointer() === baseVersion.id, 'Pointer moved after rejected stale-lock publish')

  await assertStaleBasePublishRejected(draftBeforePublish, baseVersion.id)

  const publishRequestId = randomUUID()
  const publishData = assertActionOk(
    await supabase.rpc('publish_catalog_version', {
      p_version_id: draftBeforePublish.id,
      p_expected_lock_version: draftBeforePublish.lock_version,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      },
      p_reason: 'WP-5 local-only publish smoke',
      p_request_id: publishRequestId,
    }),
    'publish_catalog_version',
  )
  assert(publishData.versionId === draftBeforePublish.id, 'Publish returned the wrong version ID')
  assert(/^sha256:[0-9a-f]{64}$/.test(publishData.datasetHash), 'Publish did not return a dataset hash')

  const duplicatePublish = assertActionOk(
    await supabase.rpc('publish_catalog_version', {
      p_version_id: draftBeforePublish.id,
      p_expected_lock_version: draftBeforePublish.lock_version,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      },
      p_reason: 'WP-5 local-only publish smoke',
      p_request_id: publishRequestId,
    }),
    'publish_catalog_version duplicate',
  )
  assert(duplicatePublish.duplicateRequest === true, 'Duplicate publish request was not idempotent')

  const publishedVersion = await readCatalogVersionById(draftBeforePublish.id)
  const baseAfterPublish = await readCatalogVersionById(baseVersion.id)
  assert(await readCurrentCatalogPointer() === publishedVersion.id, 'Pointer did not move to published version')
  assert(publishedVersion.status === 'active' && publishedVersion.is_default === true, 'Published version is not active/default')
  assert(baseAfterPublish.status === 'active' && baseAfterPublish.is_default === false, 'Former current version did not remain active/non-default')
  assert(publishedVersion.lock_version === draftBeforePublish.lock_version + 1, 'Publish did not increment lock version')
  assert(publishedVersion.item_count === publishData.itemCount, 'Stored item count does not match publish result')
  assert(publishedVersion.dataset_hash === publishData.datasetHash, 'Stored dataset hash does not match publish result')
  assert(publishedVersion.published_at, 'Published version missing published_at')
  assert(publishedVersion.approval_reference === 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION', 'Approval reference was not stored')

  const { data: publishedRow, error: publishedRowError } = await service
    .from('price_list')
    .select('id, item_name')
    .eq('version_id', publishedVersion.id)
    .limit(1)
    .single()
  if (publishedRowError) throw publishedRowError

  const { error: rowMutationError } = await service
    .from('price_list')
    .update({ item_name: `${publishedRow.item_name} forbidden mutation` })
    .eq('id', publishedRow.id)
  assert(
    rowMutationError?.message?.includes('CATALOG_PUBLISHED_ROW_IMMUTABLE'),
    `Published row mutation was not blocked: ${rowMutationError?.message ?? 'no error'}`,
  )

  const { error: versionMutationError } = await service
    .from('price_list_versions')
    .update({ approval_reference: 'FORBIDDEN-MUTATION' })
    .eq('id', publishedVersion.id)
  assert(
    versionMutationError?.message?.includes('CATALOG_PUBLISHED_VERSION_IMMUTABLE'),
    `Published metadata mutation was not blocked: ${versionMutationError?.message ?? 'no error'}`,
  )

  assertActionCode(
    await supabase.rpc('publish_catalog_version', {
      p_version_id: publishedVersion.id,
      p_expected_lock_version: publishedVersion.lock_version,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      },
      p_reason: 'WP-5 cannot republish active version',
      p_request_id: randomUUID(),
    }),
    'publish_catalog_version active version',
    'VERSION_NOT_PUBLISHABLE',
  )

  const restoreRequestId = randomUUID()
  const restoreData = assertActionOk(
    await supabase.rpc('restore_catalog_pointer', {
      p_target_version_id: baseVersion.id,
      p_reason: 'WP-5 local-only pointer restore smoke',
      p_request_id: restoreRequestId,
    }),
    'restore_catalog_pointer',
  )
  assert(restoreData.targetVersionId === baseVersion.id, 'Restore returned the wrong target version')

  const duplicateRestore = assertActionOk(
    await supabase.rpc('restore_catalog_pointer', {
      p_target_version_id: baseVersion.id,
      p_reason: 'WP-5 local-only pointer restore smoke',
      p_request_id: restoreRequestId,
    }),
    'restore_catalog_pointer duplicate',
  )
  assert(duplicateRestore.duplicateRequest === true, 'Duplicate restore request was not idempotent')

  assert(await readCurrentCatalogPointer() === baseVersion.id, 'Pointer did not restore to base version')
  const baseAfterRestore = await readCatalogVersionById(baseVersion.id)
  const publishedAfterRestore = await readCatalogVersionById(publishedVersion.id)
  assert(baseAfterRestore.is_default === true, 'Base version is not default after restore')
  assert(publishedAfterRestore.status === 'active' && publishedAfterRestore.is_default === false, 'Published version did not remain active/non-default after restore')

  assertActionCode(
    await supabase.rpc('restore_catalog_pointer', {
      p_target_version_id: baseVersion.id,
      p_reason: 'WP-5 pointer already current smoke',
      p_request_id: randomUUID(),
    }),
    'restore_catalog_pointer already current',
    'POINTER_ALREADY_CURRENT',
  )

  const { count: publishChanges, error: publishChangesError } = await supabase
    .from('catalog_change_sets')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', publishedVersion.id)
    .eq('change_type', 'publish')
  if (publishChangesError) throw publishChangesError
  assert(publishChanges === 1, `Expected one publish change set, got ${publishChanges}`)

  const { count: restoreChanges, error: restoreChangesError } = await supabase
    .from('catalog_change_sets')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', baseVersion.id)
    .eq('change_type', 'restore')
  if (restoreChangesError) throw restoreChangesError
  assert(restoreChanges === 1, `Expected one restore change set, got ${restoreChanges}`)

  const afterFactor = await readFactorSummary()
  const afterBoq = await readBoqSummary()
  assert(JSON.stringify(afterFactor) === JSON.stringify(beforeFactor), 'Factor F default/version/hash/count changed during WP-5 smoke')
  assert(JSON.stringify(afterBoq) === JSON.stringify(beforeBoq), 'BOQ count or version/factor binding split changed during WP-5 smoke')

  console.log(JSON.stringify({
    status: 'passed',
    base_version: baseVersion.version_string,
    published_version: publishedVersion.version_string,
    published_item_count: publishedVersion.item_count,
    published_dataset_hash: publishedVersion.dataset_hash,
    publish_change_set: publishData.changeSetId,
    restore_change_set: restoreData.changeSetId,
    duplicate_publish_idempotent: true,
    duplicate_restore_idempotent: true,
    missing_metadata_rejected: true,
    stale_lock_rejected: true,
    stale_base_rejected: true,
    active_republish_rejected: true,
    published_row_mutation_blocked: true,
    published_metadata_mutation_blocked: true,
    pointer_restored_to_base: true,
    factor_f_unchanged: true,
    boq_bindings_unchanged: true,
    production_touched: false,
  }))
} finally {
  await setCatalogAdminEnabled(false).catch(() => {})
  await supabase.auth.signOut().catch(() => {})
}
