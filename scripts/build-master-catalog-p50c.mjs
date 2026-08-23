import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CANDIDATE_ID = 'P50C-CANDIDATE-20260823-V1'
const BASELINE_VERSION = '2568.0.0'
const PROVISIONAL_TARGET_VERSION = '2568.1.0'
const EXPECTED_BASELINE_VALUE_BINDING_SHA256 =
  '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a'

const INPUTS = Object.freeze({
  reconciliation: {
    path: 'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
    sha256: '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
  },
  authority: {
    path: 'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
    sha256: '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
  },
  selectedDelta: {
    path: 'docs/plans/master-catalog/evidence/p50d-v3/p50d-selected-delta-manifest.json',
    sha256: '1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429',
  },
})

const OUTPUT_DIRECTORY = 'docs/plans/master-catalog/evidence/p50c-v1'
const OUTPUTS = Object.freeze({
  candidate: `${OUTPUT_DIRECTORY}/candidate.json`,
  diff: `${OUTPUT_DIRECTORY}/diff.json`,
  manifest: `${OUTPUT_DIRECTORY}/manifest.json`,
})

const SELECTED_IDENTITY = Object.freeze({
  stableIdentityId: 'f2662c71-a6e5-407e-8456-8608e304b43b',
  legacyItemCode: 'ITEM-0429',
  sourceItemCode: 'COR-PB0-002',
  targetItemCode: 'COR-PB0-002',
  itemName: 'งานเจาะผนังบ่อพักย่อย (PB)',
  unit: 'จุด',
  before: Object.freeze({ materialCost: 0, laborCost: 1763, unitCost: 1763 }),
  after: Object.freeze({ materialCost: 0, laborCost: 1764, unitCost: 1764 }),
})

const ADJACENT_LEGACY_CODES = Object.freeze([
  'ITEM-0427',
  'ITEM-0430',
  'ITEM-0431',
])

function fail(message) {
  throw new Error(`P-50C HOLD: ${message}`)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function readPinnedInput(input, label) {
  const path = join(ROOT, input.path)
  const bytes = readFileSync(path)
  const actualSha256 = sha256(bytes)
  assert(
    actualSha256 === input.sha256,
    `${label} SHA-256 changed: expected ${input.sha256}, found ${actualSha256}`,
  )
  return bytes
}

function text(value) {
  return String(value ?? '').trim()
}

function requiredText(value, label) {
  const result = text(value)
  assert(result.length > 0, `${label} is required`)
  return result
}

function asSafeInteger(value, label) {
  const result = typeof value === 'number' ? value : Number(text(value))
  assert(Number.isSafeInteger(result), `${label} must be a safe integer`)
  assert(result >= 0, `${label} must be nonnegative`)
  return result
}

function uniqueCount(rows, selector) {
  return new Set(rows.map(selector)).size
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function parseProductionBaseline(bytes) {
  const workbook = XLSX.read(bytes, {
    type: 'buffer',
    codepage: 65001,
    raw: false,
  })
  assert(workbook.SheetNames.length === 1, 'reconciliation CSV must contain exactly one sheet')

  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const allRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true })
  const productionRows = allRows.filter((row) => text(row.record_scope) === 'production')
  const workbookCandidateRows = allRows.filter(
    (row) => text(row.record_scope) === 'workbook_candidate',
  )

  assert(allRows.length === 728, `reconciliation evidence must contain 728 rows, found ${allRows.length}`)
  assert(
    productionRows.length === 710,
    `production baseline must contain 710 rows, found ${productionRows.length}`,
  )
  assert(
    workbookCandidateRows.length === 18,
    `reconciliation evidence must retain 18 workbook candidates, found ${workbookCandidateRows.length}`,
  )
  assert(
    uniqueCount(productionRows, (row) => requiredText(row.production_uuid, 'production UUID')) === 710,
    'production UUIDs must be unique',
  )
  assert(
    uniqueCount(productionRows, (row) => requiredText(row.legacy_item_code, 'legacy item code')) === 710,
    'legacy item codes must be unique',
  )

  return productionRows.map((row, index) => {
    const materialCost = asSafeInteger(
      row.production_material_cost,
      `production row ${index + 1} material cost`,
    )
    const laborCost = asSafeInteger(
      row.production_labor_cost,
      `production row ${index + 1} labor cost`,
    )
    const unitCost = asSafeInteger(
      row.production_unit_cost,
      `production row ${index + 1} unit cost`,
    )
    assert(
      materialCost + laborCost === unitCost,
      `production row ${index + 1} price arithmetic is invalid`,
    )

    return {
      stable_identity_id: requiredText(row.production_uuid, `production row ${index + 1} UUID`),
      legacy_item_code: requiredText(row.legacy_item_code, `production row ${index + 1} legacy code`),
      item_name: requiredText(row.production_name, `production row ${index + 1} name`),
      unit: requiredText(row.production_unit, `production row ${index + 1} unit`),
      material_cost: materialCost,
      labor_cost: laborCost,
      unit_cost: unitCost,
    }
  })
}

function parseAuthority(bytes) {
  const authority = JSON.parse(bytes.toString('utf8'))
  assert(
    authority.schema_version === 'phase4-first-rollout-authority/1',
    `unexpected structured-code authority schema: ${authority.schema_version}`,
  )
  assert(Array.isArray(authority.mappings), 'structured-code mappings must be an array')
  assert(authority.mappings.length === 710, 'structured-code authority must contain 710 mappings')
  assert(
    Array.isArray(authority.source_exclusions) && authority.source_exclusions.length === 17,
    'structured-code authority must contain 17 source exclusions',
  )
  assert(
    Array.isArray(authority.code_groups) && authority.code_groups.length === 65,
    'structured-code authority must contain 65 code groups',
  )
  assert(
    authority.source_evidence_path === INPUTS.reconciliation.path
      && authority.source_evidence_sha256 === INPUTS.reconciliation.sha256,
    'structured-code authority is not bound to the pinned reconciliation evidence',
  )

  const { authority_sha256: recordedAuthoritySha256, ...authorityCore } = authority
  const calculatedAuthoritySha256 = sha256(Buffer.from(JSON.stringify(authorityCore), 'utf8'))
  assert(
    recordedAuthoritySha256 === calculatedAuthoritySha256,
    'structured-code authority internal SHA-256 is invalid',
  )
  assert(
    uniqueCount(authority.mappings, (row) => requiredText(row.identity_id, 'mapping identity')) === 710,
    'structured-code mapping identities must be unique',
  )
  assert(
    uniqueCount(authority.mappings, (row) => requiredText(row.legacy_item_code, 'mapping legacy code')) === 710,
    'structured-code mapping legacy codes must be unique',
  )
  assert(
    uniqueCount(authority.mappings, (row) => requiredText(row.target_item_code, 'mapping target code')) === 710,
    'structured-code target codes must be unique',
  )
  assert(
    authority.mappings.filter((row) => row.identity_outcome === 'recode').length === 709,
    'structured-code authority must contain exactly 709 recodes',
  )
  assert(
    authority.mappings.filter((row) => row.identity_outcome === 'retain').length === 1,
    'structured-code authority must contain exactly one retain',
  )

  return authority
}

function parseSelectedDelta(bytes) {
  const manifest = JSON.parse(bytes.toString('utf8'))
  assert(
    manifest.schema === 'conduit-boq/p50d-selected-delta-manifest/v1',
    `unexpected selected-delta schema: ${manifest.schema}`,
  )
  assert(manifest.request_id === 'P50D-REQ-20260823-V3', 'unexpected selected-delta request ID')
  assert(manifest.decision === 'SELECTED-DELTA', 'P-50D decision must be SELECTED-DELTA')
  assert(manifest.selected_record_count === 1, 'P-50D manifest must select exactly one record')
  assert(Array.isArray(manifest.records) && manifest.records.length === 1, 'P-50D records must contain one row')

  const recordsSha256 = sha256(Buffer.from(`${JSON.stringify(manifest.records)}\n`, 'utf8'))
  assert(
    recordsSha256 === manifest.selected_records_sha256,
    'P-50D selected-record set SHA-256 is invalid',
  )

  const record = manifest.records[0]
  assert(record.stable_identity_id === SELECTED_IDENTITY.stableIdentityId, 'selected UUID changed')
  assert(record.legacy_item_code === SELECTED_IDENTITY.legacyItemCode, 'selected legacy code changed')
  assert(record.source_item_code === SELECTED_IDENTITY.sourceItemCode, 'selected source code changed')
  assert(record.target_item_code === SELECTED_IDENTITY.targetItemCode, 'selected target code changed')
  assert(record.baseline.item_name === SELECTED_IDENTITY.itemName, 'selected baseline name changed')
  assert(record.selected.item_name === SELECTED_IDENTITY.itemName, 'selected candidate name changed')
  assert(record.baseline.unit === SELECTED_IDENTITY.unit, 'selected baseline unit changed')
  assert(record.selected.unit === SELECTED_IDENTITY.unit, 'selected candidate unit changed')
  assertPrice(record.baseline, SELECTED_IDENTITY.before, 'selected baseline')
  assertPrice(record.selected, SELECTED_IDENTITY.after, 'selected candidate')
  assertPrice(record.delta, { materialCost: 0, laborCost: 1, unitCost: 1 }, 'selected delta')
  assert(
    JSON.stringify(record.change_fields) === JSON.stringify(['labor_cost', 'unit_cost']),
    'selected change fields must be labor_cost and unit_cost only',
  )

  return manifest
}

function baselineValueBindingSha256(baselineRows) {
  const records = [...baselineRows]
    .sort((left, right) => lexicalCompare(left.legacy_item_code, right.legacy_item_code))
    .map((row) => ({
      identity_id: row.stable_identity_id,
      legacy_item_code: row.legacy_item_code,
      item_name: row.item_name,
      unit: row.unit,
      material_cost: row.material_cost,
      labor_cost: row.labor_cost,
      unit_cost: row.unit_cost,
    }))

  return sha256(Buffer.from(`${JSON.stringify(records)}\n`, 'utf8'))
}

function assertPrice(actual, expected, label) {
  assert(actual.material_cost === expected.materialCost, `${label} material cost changed`)
  assert(actual.labor_cost === expected.laborCost, `${label} labor cost changed`)
  assert(actual.unit_cost === expected.unitCost, `${label} unit cost changed`)
  assert(actual.material_cost + actual.labor_cost === actual.unit_cost, `${label} arithmetic is invalid`)
}

function buildCandidateRows(baselineRows, authority, selectedDelta) {
  const baselineByIdentity = new Map(
    baselineRows.map((row) => [row.stable_identity_id, row]),
  )
  const selected = selectedDelta.records[0]

  const joinedRows = authority.mappings
    .map((mapping) => {
      const baseline = baselineByIdentity.get(mapping.identity_id)
      assert(baseline, `mapping identity is absent from baseline: ${mapping.identity_id}`)
      assert(
        baseline.legacy_item_code === mapping.legacy_item_code,
        `identity/legacy-code join mismatch for ${mapping.identity_id}`,
      )
      assert(
        mapping.identity_outcome === 'recode' || mapping.identity_outcome === 'retain',
        `unsupported identity outcome for ${mapping.legacy_item_code}`,
      )

      const isSelected = mapping.identity_id === selected.stable_identity_id
      if (isSelected) {
        assert(mapping.legacy_item_code === selected.legacy_item_code, 'selected mapping legacy code mismatch')
        assert(mapping.source_item_code === selected.source_item_code, 'selected mapping source code mismatch')
        assert(mapping.target_item_code === selected.target_item_code, 'selected mapping target code mismatch')
        assert(baseline.item_name === selected.baseline.item_name, 'selected baseline name mismatch')
        assert(baseline.unit === selected.baseline.unit, 'selected baseline unit mismatch')
        assert(baseline.material_cost === selected.baseline.material_cost, 'selected baseline material mismatch')
        assert(baseline.labor_cost === selected.baseline.labor_cost, 'selected baseline labor mismatch')
        assert(baseline.unit_cost === selected.baseline.unit_cost, 'selected baseline unit cost mismatch')
      }

      return {
        stable_identity_id: mapping.identity_id,
        legacy_item_code: mapping.legacy_item_code,
        source_item_code: mapping.source_item_code,
        target_item_code: mapping.target_item_code,
        identity_outcome: mapping.identity_outcome,
        work_context_code: mapping.work_context_code,
        item_type_code: mapping.item_type_code,
        item_name: baseline.item_name,
        unit: baseline.unit,
        material_cost: isSelected ? selected.selected.material_cost : baseline.material_cost,
        labor_cost: isSelected ? selected.selected.labor_cost : baseline.labor_cost,
        unit_cost: isSelected ? selected.selected.unit_cost : baseline.unit_cost,
      }
    })
    .sort((left, right) => lexicalCompare(left.legacy_item_code, right.legacy_item_code))
  const rows = joinedRows.map((row, displayOrder) => ({
    stable_identity_id: row.stable_identity_id,
    display_order: displayOrder,
    legacy_item_code: row.legacy_item_code,
    source_item_code: row.source_item_code,
    target_item_code: row.target_item_code,
    identity_outcome: row.identity_outcome,
    work_context_code: row.work_context_code,
    item_type_code: row.item_type_code,
    item_name: row.item_name,
    unit: row.unit,
    material_cost: row.material_cost,
    labor_cost: row.labor_cost,
    unit_cost: row.unit_cost,
  }))

  assert(rows.length === 710, 'candidate must contain 710 rows')
  assert(uniqueCount(rows, (row) => row.stable_identity_id) === 710, 'candidate UUIDs must be unique')
  assert(uniqueCount(rows, (row) => row.legacy_item_code) === 710, 'candidate legacy codes must be unique')
  assert(uniqueCount(rows, (row) => row.target_item_code) === 710, 'candidate target codes must be unique')
  assert(
    rows.every((row, index) => row.display_order === index),
    'candidate display order must be zero-based and contiguous',
  )

  return rows
}

function compareCandidateToBaseline(candidateRows, baselineRows) {
  const baselineByIdentity = new Map(
    baselineRows.map((row) => [row.stable_identity_id, row]),
  )
  const changes = []

  for (const candidate of candidateRows) {
    const baseline = baselineByIdentity.get(candidate.stable_identity_id)
    assert(baseline, `candidate identity is absent from baseline: ${candidate.stable_identity_id}`)
    const changeFields = []
    for (const field of ['item_name', 'unit', 'material_cost', 'labor_cost', 'unit_cost']) {
      if (candidate[field] !== baseline[field]) changeFields.push(field)
    }
    if (changeFields.length > 0) changes.push({ candidate, baseline, changeFields })
  }

  assert(changes.length === 1, `candidate must change exactly one value row, found ${changes.length}`)
  const change = changes[0]
  assert(change.candidate.stable_identity_id === SELECTED_IDENTITY.stableIdentityId, 'wrong identity changed')
  assert(
    JSON.stringify(change.changeFields) === JSON.stringify(['labor_cost', 'unit_cost']),
    `wrong fields changed: ${change.changeFields.join(', ')}`,
  )
  assert(
    candidateRows.filter((row) => row.item_name !== baselineByIdentity.get(row.stable_identity_id).item_name).length === 0,
    'candidate changes an item name',
  )
  assert(
    candidateRows.filter((row) => row.unit !== baselineByIdentity.get(row.stable_identity_id).unit).length === 0,
    'candidate changes a unit',
  )
  assert(
    candidateRows.filter((row) => row.material_cost !== baselineByIdentity.get(row.stable_identity_id).material_cost).length === 0,
    'candidate changes a material cost',
  )
  assert(
    candidateRows.every((row) => row.material_cost + row.labor_cost === row.unit_cost),
    'candidate contains invalid price arithmetic',
  )

  return change
}

function buildDiff(change) {
  return {
    schema: 'conduit-boq/p50c-one-row-diff/v1',
    candidate_id: CANDIDATE_ID,
    baseline_version: BASELINE_VERSION,
    provisional_target_version: PROVISIONAL_TARGET_VERSION,
    record_count: 1,
    records: [
      {
        stable_identity_id: change.candidate.stable_identity_id,
        legacy_item_code: change.candidate.legacy_item_code,
        target_item_code: change.candidate.target_item_code,
        item_name: change.candidate.item_name,
        unit: change.candidate.unit,
        change_fields: change.changeFields,
        before: {
          material_cost: change.baseline.material_cost,
          labor_cost: change.baseline.labor_cost,
          unit_cost: change.baseline.unit_cost,
        },
        after: {
          material_cost: change.candidate.material_cost,
          labor_cost: change.candidate.labor_cost,
          unit_cost: change.candidate.unit_cost,
        },
        delta: {
          material_cost: change.candidate.material_cost - change.baseline.material_cost,
          labor_cost: change.candidate.labor_cost - change.baseline.labor_cost,
          unit_cost: change.candidate.unit_cost - change.baseline.unit_cost,
        },
      },
    ],
  }
}

function buildManifest(
  candidateBytes,
  diffBytes,
  candidateRows,
  baselineRows,
  baselineValueBinding,
) {
  const baselineByIdentity = new Map(
    baselineRows.map((row) => [row.stable_identity_id, row]),
  )
  const adjacentRows = ADJACENT_LEGACY_CODES.map((legacyItemCode) => {
    const candidate = candidateRows.find((row) => row.legacy_item_code === legacyItemCode)
    assert(candidate, `adjacent row is absent: ${legacyItemCode}`)
    const baseline = baselineByIdentity.get(candidate.stable_identity_id)
    assert(baseline, `adjacent baseline row is absent: ${legacyItemCode}`)
    for (const field of ['item_name', 'unit', 'material_cost', 'labor_cost', 'unit_cost']) {
      assert(candidate[field] === baseline[field], `adjacent row ${legacyItemCode} changed ${field}`)
    }
    return {
      stable_identity_id: candidate.stable_identity_id,
      legacy_item_code: candidate.legacy_item_code,
      target_item_code: candidate.target_item_code,
      item_name: candidate.item_name,
      unit: candidate.unit,
      material_cost: candidate.material_cost,
      labor_cost: candidate.labor_cost,
      unit_cost: candidate.unit_cost,
      baseline_values_retained: true,
    }
  })

  return {
    schema: 'conduit-boq/p50c-candidate-manifest/v1',
    candidate_id: CANDIDATE_ID,
    prepared_at: '2026-08-23',
    mode: 'offline-deterministic-evidence-only',
    status: 'candidate-built-not-authorized-for-application',
    inputs: {
      production_baseline: {
        path: INPUTS.reconciliation.path,
        sha256: INPUTS.reconciliation.sha256,
        csv_decode: 'xlsx-codepage-65001',
        row_count: 710,
        value_binding_sha256: baselineValueBinding,
        value_binding_contract:
          'SHA-256 over UTF-8 JSON.stringify(records) plus LF; records sorted by legacy_item_code and projected as identity_id, legacy_item_code, item_name, unit, material_cost, labor_cost, unit_cost',
      },
      structured_code_authority: {
        path: INPUTS.authority.path,
        sha256: INPUTS.authority.sha256,
        mapping_count: 710,
        recode_count: 709,
        retain_count: 1,
        source_exclusion_count: 17,
      },
      selected_delta: {
        path: INPUTS.selectedDelta.path,
        sha256: INPUTS.selectedDelta.sha256,
        request_id: 'P50D-REQ-20260823-V3',
        selected_record_count: 1,
      },
    },
    outputs: {
      candidate: {
        path: OUTPUTS.candidate,
        sha256: sha256(candidateBytes),
        byte_count: candidateBytes.length,
        row_count: 710,
      },
      diff: {
        path: OUTPUTS.diff,
        sha256: sha256(diffBytes),
        byte_count: diffBytes.length,
        record_count: 1,
      },
    },
    counts: {
      candidate_row_count: 710,
      identity_recode_count: 709,
      identity_retain_count: 1,
      baseline_authority_value_changed_row_count: 1,
      baseline_authority_value_unchanged_row_count: 709,
      item_name_changed_row_count: 0,
      unit_changed_row_count: 0,
      material_cost_changed_row_count: 0,
      labor_cost_changed_row_count: 1,
      unit_cost_changed_row_count: 1,
      historical_boq_repriced_row_count: 0,
    },
    selected_delta: {
      stable_identity_id: SELECTED_IDENTITY.stableIdentityId,
      legacy_item_code: SELECTED_IDENTITY.legacyItemCode,
      target_item_code: SELECTED_IDENTITY.targetItemCode,
      item_name: SELECTED_IDENTITY.itemName,
      unit: SELECTED_IDENTITY.unit,
      before: {
        material_cost: SELECTED_IDENTITY.before.materialCost,
        labor_cost: SELECTED_IDENTITY.before.laborCost,
        unit_cost: SELECTED_IDENTITY.before.unitCost,
      },
      after: {
        material_cost: SELECTED_IDENTITY.after.materialCost,
        labor_cost: SELECTED_IDENTITY.after.laborCost,
        unit_cost: SELECTED_IDENTITY.after.unitCost,
      },
    },
    adjacent_rows_unchanged: adjacentRows,
    invariants: {
      exact_uuid_and_legacy_code_join: true,
      selected_old_value_name_unit_check_passed: true,
      candidate_identity_count_preserved: true,
      candidate_target_codes_unique: true,
      display_order_zero_based_contiguous: true,
      item_names_unchanged: true,
      units_unchanged: true,
      material_costs_unchanged: true,
      price_arithmetic_valid: true,
      adjacent_findings_unchanged: true,
      source_exclusions_unchanged: true,
      historical_boq_reprice: false,
    },
    release: {
      baseline_version: BASELINE_VERSION,
      provisional_target_version: PROVISIONAL_TARGET_VERSION,
      target_version_is_official: false,
      fresh_issued_claimed_registry_check_required: true,
      fresh_issued_claimed_registry_check_status: 'pending',
    },
    authority: {
      p50c_candidate_package_built: true,
      p50c_candidate_application_authorized: false,
      database_access_authorized: false,
      production_read_authorized: false,
      production_write_authorized: false,
      network_authorized: false,
      catalog_mutation_authorized: false,
      published_catalog_mutation_authorized: false,
      pointer_mutation_authorized: false,
      historical_boq_reprice_authorized: false,
      local_commit_authorized: false,
      external_git_publication_authorized: false,
      publish_authorized: false,
      p13_authorized: false,
      p14_authorized: false,
      p14c_authorized: false,
      p15_authorized: false,
      automatic_next_step: false,
    },
  }
}

export function buildPackage() {
  const reconciliationBytes = readPinnedInput(INPUTS.reconciliation, 'reconciliation evidence')
  const authorityBytes = readPinnedInput(INPUTS.authority, 'structured-code authority')
  const selectedDeltaBytes = readPinnedInput(INPUTS.selectedDelta, 'selected-delta manifest')

  const baselineRows = parseProductionBaseline(reconciliationBytes)
  const authority = parseAuthority(authorityBytes)
  const selectedDelta = parseSelectedDelta(selectedDeltaBytes)
  const baselineValueBinding = baselineValueBindingSha256(baselineRows)
  assert(
    baselineValueBinding === EXPECTED_BASELINE_VALUE_BINDING_SHA256,
    `baseline value binding changed: ${baselineValueBinding}`,
  )
  assert(
    selectedDelta.baseline?.value_binding_sha256 === baselineValueBinding,
    'P-50D manifest baseline value binding does not match the reconstructed baseline',
  )
  const candidateRows = buildCandidateRows(baselineRows, authority, selectedDelta)
  const change = compareCandidateToBaseline(candidateRows, baselineRows)

  const candidate = {
    schema: 'conduit-boq/p50c-one-row-candidate/v1',
    candidate_id: CANDIDATE_ID,
    baseline_version: BASELINE_VERSION,
    provisional_target_version: PROVISIONAL_TARGET_VERSION,
    target_version_registry_check_status: 'pending',
    baseline_value_binding_sha256: baselineValueBinding,
    row_count: candidateRows.length,
    rows: candidateRows,
  }
  const diff = buildDiff(change)
  const candidateBytes = jsonBytes(candidate)
  const diffBytes = jsonBytes(diff)
  const manifest = buildManifest(
    candidateBytes,
    diffBytes,
    candidateRows,
    baselineRows,
    baselineValueBinding,
  )
  const manifestBytes = jsonBytes(manifest)

  return {
    candidate,
    diff,
    manifest,
    bytes: { candidate: candidateBytes, diff: diffBytes, manifest: manifestBytes },
  }
}

function writePackage(result) {
  mkdirSync(join(ROOT, OUTPUT_DIRECTORY), { recursive: true })
  for (const name of Object.keys(OUTPUTS)) {
    writeFileSync(join(ROOT, OUTPUTS[name]), result.bytes[name])
  }
}

function checkPackage(result) {
  for (const name of Object.keys(OUTPUTS)) {
    const path = join(ROOT, OUTPUTS[name])
    assert(existsSync(path), `generated artifact is missing: ${OUTPUTS[name]}`)
    const actual = readFileSync(path)
    assert(
      actual.equals(result.bytes[name]),
      `generated artifact is stale: ${OUTPUTS[name]}; run with --write`,
    )
  }
}

function main(args) {
  assert(args.length === 1, 'use exactly one of --write or --check')
  assert(args[0] === '--write' || args[0] === '--check', 'use --write or --check')

  const result = buildPackage()
  if (args[0] === '--write') writePackage(result)
  else checkPackage(result)

  console.log(
    `${args[0] === '--write' ? 'Wrote' : 'Verified'} ${CANDIDATE_ID}: `
      + `${result.candidate.row_count} rows, ${result.diff.record_count} value delta, `
      + `${result.manifest.outputs.candidate.sha256}`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2))
}
