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
  throw new Error(`Refusing to run WP-4 smoke against a non-local Supabase URL: ${url}`)
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

function moneyText(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    throw new Error(`Expected numeric money value, got ${value}`)
  }
  return amount.toFixed(2)
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

async function readBoqCount() {
  const { count, error } = await supabase
    .from('boq')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count
}

async function setCatalogAdminEnabled(value) {
  const { error } = await service
    .from('app_settings')
    .update({ value })
    .eq('key', 'catalog_admin_enabled')
  if (error) throw error
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
  const beforeBoqCount = await readBoqCount()

  await setCatalogAdminEnabled(true)

  const { data: pointer, error: pointerError } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError

  const { data: baseVersion, error: baseError } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status')
    .eq('id', pointer.version_id)
    .single()
  if (baseError) throw baseError
  assert(baseVersion.version_string === '2568.0.0', 'Unexpected base catalog version')

  let { data: draft, error: draftReadError } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status, lock_version, based_on_version_id')
    .eq('version_string', '2568.1.0')
    .maybeSingle()
  if (draftReadError) throw draftReadError

  if (!draft) {
    const createRequestId = randomUUID()
    const createData = assertActionOk(
      await supabase.rpc('create_catalog_draft', {
        p_base_version_id: baseVersion.id,
        p_version_major: 2568,
        p_version_minor: 1,
        p_version_patch: 0,
        p_name: 'Local rehearsal draft 2568.1.0',
        p_reason: 'WP-4 local-only draft smoke',
        p_request_id: createRequestId,
      }),
      'create_catalog_draft',
    )

    const duplicateCreate = assertActionOk(
      await supabase.rpc('create_catalog_draft', {
        p_base_version_id: baseVersion.id,
        p_version_major: 2568,
        p_version_minor: 1,
        p_version_patch: 0,
        p_name: 'Local rehearsal draft 2568.1.0',
        p_reason: 'WP-4 local-only draft smoke',
        p_request_id: createRequestId,
      }),
      'create_catalog_draft duplicate',
    )
    assert(duplicateCreate.duplicateRequest === true, 'Duplicate draft request was not idempotent')

    const { data: createdDraft, error: createdReadError } = await supabase
      .from('price_list_versions')
      .select('id, version_string, status, lock_version, based_on_version_id')
      .eq('id', createData.versionId)
      .single()
    if (createdReadError) throw createdReadError
    draft = createdDraft
  }

  assert(draft.status === 'draft', 'WP-4 draft is not in draft status')
  assert(draft.based_on_version_id === baseVersion.id, 'WP-4 draft was not cloned from current default')

  const { count: draftRows, error: rowCountError } = await supabase
    .from('price_list')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', draft.id)
  if (rowCountError) throw rowCountError
  assert(draftRows === 710, `Draft row count expected 710, got ${draftRows}`)

  const { data: activeRows, error: activeRowError } = await supabase
    .from('price_list')
    .select('item_code, item_name, unit, material_cost, labor_cost, unit_cost, category')
    .eq('version_id', draft.id)
    .eq('is_active', true)
    .order('item_code')
    .limit(4)
  if (activeRowError) throw activeRowError
  assert(activeRows?.length === 4, 'WP-4 smoke needs four active draft rows')

  const [activeRow, editRow, recodeRow, importRow] = activeRows

  const manualRequestId = randomUUID()
  const manualData = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'retire',
          legacyItemCode: activeRow.item_code,
        }],
      },
      p_expected_lock_version: draft.lock_version,
      p_reason: 'WP-4 local-only manual retire smoke',
      p_request_id: manualRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes manual retire',
  )
  assert(manualData.changedItems === 1, 'Manual retire did not audit exactly one item')

  const duplicateManual = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'retire',
          legacyItemCode: activeRow.item_code,
        }],
      },
      p_expected_lock_version: draft.lock_version,
      p_reason: 'WP-4 local-only manual retire smoke',
      p_request_id: manualRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes duplicate manual retire',
  )
  assert(duplicateManual.duplicateRequest === true, 'Duplicate manual request was not idempotent')

  const addRequestId = randomUUID()
  const addData = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'add',
          canonicalCode: 'SMK-ADD-001',
          workContextCode: 'SMK',
          workContextNameTh: 'กลุ่มงานทดสอบ smoke',
          itemTypeCode: 'ADD',
          itemTypeNameTh: 'งานเพิ่ม smoke',
          itemName: 'รายการทดสอบ WP-4 เพิ่มใหม่',
          unit: 'รายการ',
          materialCost: '10.00',
          laborCost: '5.00',
          unitCost: '15.00',
          categoryCode: 'SMOKE',
          identityOutcome: 'candidate_add',
          priceAuthorityReference: 'local-wp4-smoke-price-authority',
        }],
      },
      p_expected_lock_version: manualData.lockVersion,
      p_reason: 'WP-4 local-only manual add smoke',
      p_request_id: addRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes manual add',
  )
  assert(addData.changedItems === 1, 'Manual add did not audit exactly one item')

  const editRequestId = randomUUID()
  const editData = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'update',
          legacyItemCode: editRow.item_code,
          itemName: `${editRow.item_name} (WP-4 smoke edit)`,
          priceAuthorityReference: 'local-wp4-smoke-name-authority',
        }],
      },
      p_expected_lock_version: addData.lockVersion,
      p_reason: 'WP-4 local-only manual edit smoke',
      p_request_id: editRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes manual edit',
  )
  assert(editData.changedItems === 1, 'Manual edit did not audit exactly one item')

  const recodeRequestId = randomUUID()
  const recodeData = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'recode',
          legacyItemCode: recodeRow.item_code,
          canonicalCode: 'SMK-RCD-001',
          workContextCode: 'SMK',
          workContextNameTh: 'กลุ่มงานทดสอบ smoke',
          itemTypeCode: 'RCD',
          itemTypeNameTh: 'งานเปลี่ยนรหัส smoke',
          identityOutcome: 'recode',
        }],
      },
      p_expected_lock_version: editData.lockVersion,
      p_reason: 'WP-4 local-only manual recode smoke',
      p_request_id: recodeRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes manual recode',
  )
  assert(recodeData.changedItems === 1, 'Manual recode did not audit exactly one item')

  const importValidationRequestId = randomUUID()
  const normalizedPayloadHash = 'b'.repeat(64)
  const importPayload = {
    schemaVersion: 'catalog-import-payload/1',
    parserProfileId: 'nt-item-master-2568',
    parserProfileVersion: '1',
    mode: 'supplement',
    versionId: draft.id,
    expectedLockVersion: recodeData.lockVersion,
    requestId: importValidationRequestId,
    reason: 'WP-4 local-only import smoke',
    source: {
      filename: 'wp4-smoke.xlsx',
      sizeBytes: 1,
      sha256: 'a'.repeat(64),
      physicalArchiveReference: 'local-wp4-smoke',
    },
    retirementApprovalReference: null,
    retirementConfirmedCount: null,
    rows: [{
      sourceRow: 2,
      sourceReference: 'wp4-smoke:2',
      legacyItemCode: importRow.item_code,
      canonicalCode: 'SMK-IMP-001',
      workContextCode: 'SMK',
      workContextNameTh: 'กลุ่มงานทดสอบ smoke',
      itemTypeCode: 'IMP',
      itemTypeNameTh: 'งานนำเข้า smoke',
      itemName: importRow.item_name,
      unit: importRow.unit,
      materialCost: moneyText(importRow.material_cost),
      laborCost: moneyText(importRow.labor_cost),
      unitCost: moneyText(importRow.unit_cost),
      categoryCode: importRow.category ?? 'SMOKE',
      identityOutcome: 'retire',
      priceAuthorityReference: null,
    }],
  }

  const importValidation = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'import_validate',
        payload: importPayload,
        normalizedPayloadHash,
      },
      p_expected_lock_version: recodeData.lockVersion,
      p_reason: 'WP-4 local-only import validation smoke',
      p_request_id: importValidationRequestId,
      p_import_id: null,
    }),
    'apply_catalog_changes import validate',
  )
  assert(importValidation.status === 'validated', 'Import validation did not create a validated import record')

  const importApplyRequestId = randomUUID()
  const importApply = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'import_apply',
        payload: importPayload,
        normalizedPayloadHash,
      },
      p_expected_lock_version: recodeData.lockVersion,
      p_reason: 'WP-4 local-only import apply smoke',
      p_request_id: importApplyRequestId,
      p_import_id: importValidation.importId,
    }),
    'apply_catalog_changes import apply',
  )
  assert(importApply.changedItems === 1, 'Import apply did not audit exactly one item')

  const duplicateImportApply = assertActionOk(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'import_apply',
        payload: importPayload,
        normalizedPayloadHash,
      },
      p_expected_lock_version: recodeData.lockVersion,
      p_reason: 'WP-4 local-only import apply smoke',
      p_request_id: importApplyRequestId,
      p_import_id: importValidation.importId,
    }),
    'apply_catalog_changes duplicate import apply',
  )
  assert(duplicateImportApply.duplicateRequest === true, 'Duplicate import apply request was not idempotent')

  const { data: appliedImport, error: appliedImportError } = await supabase
    .from('catalog_imports')
    .select('status, applied_at')
    .eq('id', importValidation.importId)
    .single()
  if (appliedImportError) throw appliedImportError
  assert(appliedImport.status === 'applied' && appliedImport.applied_at, 'Import record was not marked applied')

  assertActionCode(
    await supabase.rpc('apply_catalog_changes', {
      p_version_id: draft.id,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'retire',
          legacyItemCode: activeRow.item_code,
        }],
      },
      p_expected_lock_version: draft.lock_version,
      p_reason: 'WP-4 local-only stale lock smoke',
      p_request_id: randomUUID(),
      p_import_id: null,
    }),
    'apply_catalog_changes stale lock',
    'DRAFT_LOCK_CONFLICT',
  )

  const { count: changeItemCount, error: changeItemError } = await supabase
    .from('catalog_change_items')
    .select('id', { count: 'exact', head: true })
    .eq('change_set_id', manualData.changeSetId)
  if (changeItemError) throw changeItemError
  assert(changeItemCount === 1, 'Manual change set did not create one change item')

  const { data: actionRows, error: actionRowsError } = await supabase
    .from('catalog_change_items')
    .select('action')
    .in('change_set_id', [
      manualData.changeSetId,
      addData.changeSetId,
      editData.changeSetId,
      recodeData.changeSetId,
      importApply.changeSetId,
    ])
  if (actionRowsError) throw actionRowsError
  const actions = actionRows.map((row) => row.action).sort()
  assert(
    JSON.stringify(actions) === JSON.stringify(['add', 'recode', 'retire', 'retire', 'update']),
    `Unexpected WP-4 audited actions: ${JSON.stringify(actions)}`,
  )

  const { data: recodedRow, error: recodedRowError } = await supabase
    .from('price_list')
    .select('item_code, code_group_id')
    .eq('version_id', draft.id)
    .eq('item_code', 'SMK-RCD-001')
    .single()
  if (recodedRowError) throw recodedRowError
  assert(recodedRow.code_group_id, 'Manual recode did not attach a code group')

  const { data: addedRow, error: addedRowError } = await supabase
    .from('price_list')
    .select('item_code, code_group_id, is_active')
    .eq('version_id', draft.id)
    .eq('item_code', 'SMK-ADD-001')
    .single()
  if (addedRowError) throw addedRowError
  assert(addedRow.is_active === true && addedRow.code_group_id, 'Manual add did not create an active grouped row')

  const publishResult = await supabase.rpc('publish_catalog_version', {
    p_version_id: draft.id,
    p_expected_lock_version: importApply.lockVersion,
    p_approval_metadata: {},
    p_reason: 'WP-4 must not publish',
    p_request_id: randomUUID(),
  })
  assert(
    publishResult.error?.message?.includes('CATALOG_RPC_NOT_IMPLEMENTED'),
    'publish_catalog_version was not blocked in WP-4',
  )

  const afterFactor = await readFactorSummary()
  const afterBoqCount = await readBoqCount()

  assert(JSON.stringify(afterFactor) === JSON.stringify(beforeFactor), 'Factor F default/version/hash/count changed during WP-4 smoke')
  assert(afterBoqCount === beforeBoqCount, 'BOQ count changed during WP-4 smoke')

  console.log(JSON.stringify({
    status: 'passed',
    draft_version: draft.version_string,
    draft_rows: draftRows,
    retired_item_code: activeRow.item_code,
    added_item_code: 'SMK-ADD-001',
    edited_item_code: editRow.item_code,
    recoded_item_code: 'SMK-RCD-001',
    imported_retired_item_code: importRow.item_code,
    manual_change_set: manualData.changeSetId,
    add_change_set: addData.changeSetId,
    edit_change_set: editData.changeSetId,
    recode_change_set: recodeData.changeSetId,
    import_change_set: importApply.changeSetId,
    final_lock_version: importApply.lockVersion,
    audited_actions: actions,
    stale_lock_rejected: true,
    import_applied: true,
    publish_blocked: true,
    factor_f_unchanged: true,
    boq_count_unchanged: true,
  }))
} finally {
  await setCatalogAdminEnabled(false).catch(() => {})
  await supabase.auth.signOut().catch(() => {})
}
