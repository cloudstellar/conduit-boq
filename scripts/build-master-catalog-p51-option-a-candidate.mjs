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

import { buildPackage as buildP50cPackage } from './build-master-catalog-p50c.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const CANDIDATE_ID = 'P51-OPTION-A-CANDIDATE-20260826-V1'
export const BASELINE_VERSION = '2568.0.0'
export const PROVISIONAL_TARGET_VERSION = '2568.1.0'
export const D002_REFERENCE = '2568.1.0-D002'

export const INPUTS = Object.freeze({
  baseline: Object.freeze({
    path: 'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
    sha256: '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
  }),
  authority: Object.freeze({
    path: 'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
    sha256: '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
  }),
  p50rDelta: Object.freeze({
    path: 'docs/plans/master-catalog/evidence/p50r-solo/proposed-delta-manifest.json',
    sha256: 'c2fa9de6a9b2f7c3206852779675b4e4457c3ddfef77b64f8655170030391c47',
  }),
  p50cCandidate: Object.freeze({
    path: 'docs/plans/master-catalog/evidence/p50c-v1/candidate.json',
    sha256: 'd7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611',
  }),
  p50cManifest: Object.freeze({
    path: 'docs/plans/master-catalog/evidence/p50c-v1/manifest.json',
    sha256: 'd88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5',
  }),
  optionADecision: Object.freeze({
    path: 'docs/plans/master-catalog/19-phase4-decision-register.md',
    marker: 'P50_OPTION_A_PDF_PRESENTATION_DECISION_V1',
    canonicalMarkerSha256: 'af6628f2e7937dfc2daf53a8ede9acc283856efad9285d8e214582c967e03064',
  }),
})

const OUTPUT_DIRECTORY = 'docs/plans/master-catalog/evidence/p51-option-a-v1'

export const OUTPUTS = Object.freeze({
  candidate: `${OUTPUT_DIRECTORY}/candidate.json`,
  diff: `${OUTPUT_DIRECTORY}/diff.json`,
  manifest: `${OUTPUT_DIRECTORY}/manifest.json`,
})

export const EXPECTED = Object.freeze({
  baselineValueBindingSha256:
    '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
  all49SetSha256:
    '42e02ca9df6180a073237398811666c1de92ec9d52ac9ed6f183a18eadad0cc0',
  cohortASetSha256:
    '95ca7c3c77b5697c64d099a186f17e9116b7eff54409f6fea2a7a3dd8d5a7ec5',
  cohortBSetSha256:
    '5b7be022a56c8b361671a0c6ba5e1c22234d1e0e41b6e7ed5d0f5a00976b3dd0',
  retain18SetSha256:
    '489a8a82ee570c62640b9028ef5e8b612bc1b1858dd4d3251c068750c7fb64a2',
})

const VALUE_FIELDS = Object.freeze([
  'item_name',
  'unit',
  'material_cost',
  'labor_cost',
  'unit_cost',
])

const SELECTED_CLASSIFICATION = 'proposed_confirmed_correction'
const RETAIN_CLASSIFICATION = 'source_version_difference'

function fail(message) {
  throw new Error(`P-51 OPTION A HOLD: ${message}`)
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

function canonicalRecordSetSha256(records) {
  return sha256(Buffer.from(`${JSON.stringify(records)}\n`, 'utf8'))
}

function text(value) {
  return String(value ?? '').trim()
}

function requiredText(value, label) {
  const result = text(value)
  assert(result.length > 0, `${label} is required`)
  return result
}

function asNonnegativeSafeInteger(value, label) {
  assert(value !== null && value !== undefined, `${label} is required`)
  assert(
    typeof value === 'number' || typeof value === 'string',
    `${label} must be a number or numeric string`,
  )
  if (typeof value === 'string') {
    assert(value.trim().length > 0, `${label} is required`)
  }
  const result = typeof value === 'number' ? value : Number(value.trim())
  assert(Number.isSafeInteger(result), `${label} must be a safe integer`)
  assert(result >= 0, `${label} must be nonnegative`)
  return result
}

export function validateNonnegativeSafeInteger(value, label = 'value') {
  return asNonnegativeSafeInteger(value, label)
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function uniqueCount(rows, selector) {
  return new Set(rows.map(selector)).size
}

function readPinnedInput(input, label) {
  const bytes = readFileSync(join(ROOT, input.path))
  const actualSha256 = sha256(bytes)
  assert(
    actualSha256 === input.sha256,
    `${label} SHA-256 changed: expected ${input.sha256}, found ${actualSha256}`,
  )
  return bytes
}

function assertPrice(price, label) {
  assert(Array.isArray(price) && price.length === 3, `${label} must be a three-value array`)
  const normalized = price.map((value, index) =>
    asNonnegativeSafeInteger(value, `${label}[${index}]`),
  )
  assert(normalized[0] + normalized[1] === normalized[2], `${label} arithmetic is invalid`)
  return normalized
}

function parseBaseline(bytes) {
  const workbook = XLSX.read(bytes, {
    type: 'buffer',
    codepage: 65001,
    raw: false,
  })
  assert(workbook.SheetNames.length === 1, 'baseline CSV must contain one worksheet')
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const allRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true })
  const productionRows = allRows.filter((row) => text(row.record_scope) === 'production')
  const workbookCandidateRows = allRows.filter(
    (row) => text(row.record_scope) === 'workbook_candidate',
  )

  assert(allRows.length === 728, `baseline evidence row count changed: ${allRows.length}`)
  assert(productionRows.length === 710, `baseline production row count changed: ${productionRows.length}`)
  assert(
    workbookCandidateRows.length === 18,
    `baseline workbook-only row count changed: ${workbookCandidateRows.length}`,
  )

  const rows = productionRows
    .map((row, index) => {
      const materialCost = asNonnegativeSafeInteger(
        row.production_material_cost,
        `baseline row ${index + 1} material cost`,
      )
      const laborCost = asNonnegativeSafeInteger(
        row.production_labor_cost,
        `baseline row ${index + 1} labor cost`,
      )
      const unitCost = asNonnegativeSafeInteger(
        row.production_unit_cost,
        `baseline row ${index + 1} unit cost`,
      )
      assert(
        materialCost + laborCost === unitCost,
        `baseline row ${index + 1} price arithmetic is invalid`,
      )
      return {
        stable_identity_id: requiredText(row.production_uuid, `baseline row ${index + 1} UUID`),
        legacy_item_code: requiredText(
          row.legacy_item_code,
          `baseline row ${index + 1} legacy item code`,
        ),
        item_name: requiredText(row.production_name, `baseline row ${index + 1} item name`),
        unit: requiredText(row.production_unit, `baseline row ${index + 1} unit`),
        material_cost: materialCost,
        labor_cost: laborCost,
        unit_cost: unitCost,
      }
    })
    .sort((left, right) => lexicalCompare(left.legacy_item_code, right.legacy_item_code))

  assert(uniqueCount(rows, (row) => row.stable_identity_id) === 710, 'baseline UUIDs are not unique')
  assert(uniqueCount(rows, (row) => row.legacy_item_code) === 710, 'baseline legacy codes are not unique')
  assert(rows[0].legacy_item_code === 'ITEM-0001', 'baseline first legacy code changed')
  assert(rows.at(-1).legacy_item_code === 'ITEM-0710', 'baseline final legacy code changed')

  const valueBindingRecords = rows.map((row) => ({
    identity_id: row.stable_identity_id,
    legacy_item_code: row.legacy_item_code,
    item_name: row.item_name,
    unit: row.unit,
    material_cost: row.material_cost,
    labor_cost: row.labor_cost,
    unit_cost: row.unit_cost,
  }))
  const valueBindingSha256 = canonicalRecordSetSha256(valueBindingRecords)
  assert(
    valueBindingSha256 === EXPECTED.baselineValueBindingSha256,
    `baseline value binding changed: ${valueBindingSha256}`,
  )

  return { rows, workbookCandidateRowCount: workbookCandidateRows.length, valueBindingSha256 }
}

function parseAuthority(bytes) {
  const authority = JSON.parse(bytes.toString('utf8'))
  assert(authority.schema_version === 'phase4-first-rollout-authority/1', 'authority schema changed')
  assert(Array.isArray(authority.mappings) && authority.mappings.length === 710, 'authority mappings changed')
  assert(
    Array.isArray(authority.source_exclusions) && authority.source_exclusions.length === 17,
    'authority exclusions changed',
  )
  assert(Array.isArray(authority.code_groups) && authority.code_groups.length === 65, 'authority code groups changed')
  assert(authority.source_evidence_path === INPUTS.baseline.path, 'authority baseline path changed')
  assert(authority.source_evidence_sha256 === INPUTS.baseline.sha256, 'authority baseline hash changed')

  const { authority_sha256: recordedSha256, ...core } = authority
  const calculatedSha256 = sha256(Buffer.from(JSON.stringify(core), 'utf8'))
  assert(recordedSha256 === calculatedSha256, 'authority internal SHA-256 is invalid')
  assert(uniqueCount(authority.mappings, (row) => row.identity_id) === 710, 'authority mapping UUIDs are not unique')
  assert(uniqueCount(authority.mappings, (row) => row.legacy_item_code) === 710, 'authority legacy codes are not unique')
  assert(uniqueCount(authority.mappings, (row) => row.target_item_code) === 710, 'authority target codes are not unique')
  assert(authority.mappings.filter((row) => row.identity_outcome === 'recode').length === 709, 'authority recode count changed')
  assert(authority.mappings.filter((row) => row.identity_outcome === 'retain').length === 1, 'authority retain count changed')
  return authority
}

function parseP50rDelta(bytes) {
  const manifest = JSON.parse(bytes.toString('utf8'))
  assert(manifest.schema === 'conduit-boq/p50r-proposed-delta-manifest/v1', 'P-50R delta schema changed')
  assert(manifest.request_id === 'P50R-SOLO-REQ-20260821-V1', 'P-50R request ID changed')
  assert(manifest.status === 'evidence_only_pending_p50d', 'P-50R evidence status changed')
  assert(manifest.price_mutation_authorized === false, 'P-50R unexpectedly authorizes price mutation')
  assert(manifest.record_count === 67, 'P-50R record count changed')
  assert(Array.isArray(manifest.records) && manifest.records.length === 67, 'P-50R records changed')
  assert(uniqueCount(manifest.records, (row) => row.identity_key) === 67, 'P-50R identity keys are not unique')
  assert(
    manifest.records.every(
      (row) => row.decision_status === 'pending_p50d' && row.proposed_action === 'none',
    ),
    'historical P-50R evidence decision fields changed',
  )

  const cohortA = manifest.records.filter(
    (row) =>
      row.classification === SELECTED_CLASSIFICATION
      && row.sql_vs_xlsx === 'equal'
      && row.xlsx_vs_pdf === 'different',
  )
  const cohortB = manifest.records.filter(
    (row) =>
      row.classification === SELECTED_CLASSIFICATION
      && row.sql_vs_xlsx === 'different'
      && row.xlsx_vs_pdf === 'equal',
  )
  const selected = [...cohortA, ...cohortB]
  const retained = manifest.records.filter((row) => row.classification === RETAIN_CLASSIFICATION)

  assert(cohortA.length === 25, `P-50R cohort A count changed: ${cohortA.length}`)
  assert(cohortB.length === 24, `P-50R cohort B count changed: ${cohortB.length}`)
  assert(selected.length === 49, `P-50R selected correction count changed: ${selected.length}`)
  assert(retained.length === 18, `P-50R retain count changed: ${retained.length}`)
  assert(
    manifest.records.length === selected.length + retained.length,
    'P-50R contains an unsupported classification',
  )
  assert(uniqueCount(selected, (row) => row.stable_identity_id) === 49, 'selected UUIDs are not unique')
  assert(uniqueCount(selected, (row) => row.legacy_item_code) === 49, 'selected legacy codes are not unique')
  assert(canonicalRecordSetSha256(selected) === EXPECTED.all49SetSha256, 'all-49 set SHA-256 changed')
  assert(canonicalRecordSetSha256(cohortA) === EXPECTED.cohortASetSha256, 'cohort A set SHA-256 changed')
  assert(canonicalRecordSetSha256(cohortB) === EXPECTED.cohortBSetSha256, 'cohort B set SHA-256 changed')
  assert(canonicalRecordSetSha256(retained) === EXPECTED.retain18SetSha256, 'retain-18 set SHA-256 changed')

  return { manifest, selected, retained, cohortA, cohortB }
}

function parseDecisionMarker() {
  const source = readFileSync(join(ROOT, INPUTS.optionADecision.path), 'utf8')
  const pattern = new RegExp(
    `^<!-- ${INPUTS.optionADecision.marker} (\\{[^\\n]+\\}) -->$`,
    'gm',
  )
  const matches = [...source.matchAll(pattern)]
  assert(matches.length === 1, `expected one ${INPUTS.optionADecision.marker} marker`)
  const marker = JSON.parse(matches[0][1])
  const canonicalMarkerSha256 = canonicalRecordSetSha256(marker)
  assert(
    canonicalMarkerSha256 === INPUTS.optionADecision.canonicalMarkerSha256,
    `Option A decision marker SHA-256 changed: ${canonicalMarkerSha256}`,
  )
  assert(marker.schema === 'conduit-boq/p50-option-a-pdf-presentation-decision/v1', 'Option A marker schema changed')
  assert(marker.priceScope === 'OPTION_A_ALL_49_FROZEN_P50R_EXTERNAL_SOURCE_CORRECTIONS', 'Option A price scope changed')
  assert(marker.approvedPriceCorrectionCount === 49, 'Option A approved count changed')
  assert(marker.existingD002AppliedCorrectionCount === 1, 'Option A existing D002 count changed')
  assert(marker.additionalApprovedBusinessScopeCount === 48, 'Option A additional count changed')
  assert(marker.businessScopeSelected === true, 'Option A business scope is not selected')
  assert(marker.localOfflineDocsCodeTestsReviewArtifactsAuthorized === true, 'Option A local package preparation is not authorized')
  assert(JSON.stringify(marker.item0615CurrentPrice) === JSON.stringify([2869, 7091, 9960]), 'Option A ITEM-0615 current price changed')
  assert(JSON.stringify(marker.item0615ApprovedPrice) === JSON.stringify([2869, 7427, 10296]), 'Option A ITEM-0615 approved price changed')

  for (const field of [
    'candidateApplicationAuthorized',
    'databaseAccessAuthorized',
    'productionReadAuthorized',
    'productionWriteAuthorized',
    'catalogMutationAuthorized',
    'boqMutationAuthorized',
    'pointerMutationAuthorized',
    'factorFMutationAuthorized',
    'localCommitAuthorized',
    'externalGitPublicationAuthorized',
    'deployAuthorized',
    'p15Authorized',
    'publicationAuthorized',
    'automaticNextStep',
  ]) {
    assert(marker[field] === false, `Option A marker unexpectedly enables ${field}`)
  }

  return { marker, canonicalMarkerSha256 }
}

function parseP50cOracle(candidateBytes, manifestBytes) {
  const candidate = JSON.parse(candidateBytes.toString('utf8'))
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  assert(candidate.schema === 'conduit-boq/p50c-one-row-candidate/v1', 'P-50C candidate schema changed')
  assert(candidate.candidate_id === 'P50C-CANDIDATE-20260823-V1', 'P-50C candidate ID changed')
  assert(candidate.row_count === 710 && candidate.rows.length === 710, 'P-50C candidate row count changed')
  assert(candidate.baseline_value_binding_sha256 === EXPECTED.baselineValueBindingSha256, 'P-50C baseline binding changed')
  assert(manifest.schema === 'conduit-boq/p50c-candidate-manifest/v1', 'P-50C manifest schema changed')
  assert(manifest.outputs.candidate.sha256 === INPUTS.p50cCandidate.sha256, 'P-50C manifest candidate hash changed')
  assert(manifest.outputs.candidate.row_count === 710, 'P-50C manifest candidate count changed')
  assert(manifest.counts.baseline_authority_value_changed_row_count === 1, 'P-50C changed-row count changed')

  const rebuilt = buildP50cPackage()
  assert(rebuilt.bytes.candidate.equals(candidateBytes), 'P-50C semantic-oracle rebuild differs from pinned candidate')
  assert(rebuilt.bytes.manifest.equals(manifestBytes), 'P-50C semantic-oracle rebuild differs from pinned manifest')
  return candidate
}

function buildCandidateRows(baselineRows, authority, selectedRows) {
  const baselineByIdentity = new Map(baselineRows.map((row) => [row.stable_identity_id, row]))
  const selectedByIdentity = new Map(selectedRows.map((row) => [row.stable_identity_id, row]))

  const rows = authority.mappings
    .map((mapping) => {
      const baseline = baselineByIdentity.get(mapping.identity_id)
      assert(baseline, `authority identity is absent from baseline: ${mapping.identity_id}`)
      assert(baseline.legacy_item_code === mapping.legacy_item_code, `legacy-code join mismatch: ${mapping.identity_id}`)
      const selected = selectedByIdentity.get(mapping.identity_id)
      if (selected) {
        assert(selected.legacy_item_code === mapping.legacy_item_code, `selected legacy code mismatch: ${mapping.identity_id}`)
        assert(selected.source_item_code === mapping.source_item_code, `selected source code mismatch: ${mapping.identity_id}`)
        assert(selected.target_item_code === mapping.target_item_code, `selected target code mismatch: ${mapping.identity_id}`)
        const current = assertPrice(selected.current_price, `${selected.legacy_item_code} current price`)
        const approved = assertPrice(selected.filed_pdf_price, `${selected.legacy_item_code} approved price`)
        assert(
          JSON.stringify(current) === JSON.stringify([
            baseline.material_cost,
            baseline.labor_cost,
            baseline.unit_cost,
          ]),
          `${selected.legacy_item_code} current price is not the frozen baseline`,
        )
        assert(selected.sql_vs_pdf === 'different', `${selected.legacy_item_code} has no filed-price delta`)
        assert(selected.p50d_decision_required === true, `${selected.legacy_item_code} P-50D evidence flag changed`)
        return {
          mapping,
          baseline,
          price: approved,
        }
      }
      return {
        mapping,
        baseline,
        price: [baseline.material_cost, baseline.labor_cost, baseline.unit_cost],
      }
    })
    .sort((left, right) => lexicalCompare(left.mapping.legacy_item_code, right.mapping.legacy_item_code))
    .map(({ mapping, baseline, price }, displayOrder) => ({
      stable_identity_id: mapping.identity_id,
      display_order: displayOrder,
      legacy_item_code: mapping.legacy_item_code,
      source_item_code: mapping.source_item_code,
      target_item_code: mapping.target_item_code,
      identity_outcome: mapping.identity_outcome,
      work_context_code: mapping.work_context_code,
      item_type_code: mapping.item_type_code,
      item_name: baseline.item_name,
      unit: baseline.unit,
      material_cost: price[0],
      labor_cost: price[1],
      unit_cost: price[2],
    }))

  assert(rows.length === 710, 'candidate row count changed')
  assert(uniqueCount(rows, (row) => row.stable_identity_id) === 710, 'candidate UUIDs are not unique')
  assert(uniqueCount(rows, (row) => row.legacy_item_code) === 710, 'candidate legacy codes are not unique')
  assert(uniqueCount(rows, (row) => row.target_item_code) === 710, 'candidate target codes are not unique')
  assert(rows.every((row, index) => row.display_order === index), 'candidate display order is not 0..709')
  assert(rows.every((row) => row.material_cost + row.labor_cost === row.unit_cost), 'candidate price arithmetic is invalid')
  assert(
    rows.every((row) => row.material_cost >= 0 && row.labor_cost >= 0 && row.unit_cost >= 0),
    'candidate contains a negative price',
  )
  return rows
}

function compareRows(candidateRows, referenceRows, selectedByIdentity, label) {
  const referenceByIdentity = new Map(referenceRows.map((row) => [row.stable_identity_id, row]))
  assert(referenceByIdentity.size === 710, `${label} reference identity count changed`)
  return candidateRows.flatMap((candidate) => {
    const reference = referenceByIdentity.get(candidate.stable_identity_id)
    assert(reference, `${label} reference row is missing: ${candidate.stable_identity_id}`)
    const changeFields = VALUE_FIELDS.filter((field) => candidate[field] !== reference[field])
    if (changeFields.length === 0) return []
    const evidence = selectedByIdentity.get(candidate.stable_identity_id)
    assert(evidence, `${label} changed row lacks selected P-50R evidence: ${candidate.legacy_item_code}`)
    return [{
      stable_identity_id: candidate.stable_identity_id,
      legacy_item_code: candidate.legacy_item_code,
      source_item_code: candidate.source_item_code,
      target_item_code: candidate.target_item_code,
      item_name: candidate.item_name,
      unit: candidate.unit,
      change_fields: changeFields,
      before: {
        material_cost: reference.material_cost,
        labor_cost: reference.labor_cost,
        unit_cost: reference.unit_cost,
      },
      after: {
        material_cost: candidate.material_cost,
        labor_cost: candidate.labor_cost,
        unit_cost: candidate.unit_cost,
      },
      delta: {
        material_cost: candidate.material_cost - reference.material_cost,
        labor_cost: candidate.labor_cost - reference.labor_cost,
        unit_cost: candidate.unit_cost - reference.unit_cost,
      },
      source_evidence: {
        classification: evidence.classification,
        pdf_locator: evidence.pdf_locator,
      },
    }]
  })
}

function assertRetainedRowsAndExclusions({
  candidateRows,
  baselineRows,
  retainedRows,
  sourceExclusions,
}) {
  const candidateByIdentity = new Map(
    candidateRows.map((row) => [row.stable_identity_id, row]),
  )
  const baselineByIdentity = new Map(
    baselineRows.map((row) => [row.stable_identity_id, row]),
  )

  for (const retained of retainedRows) {
    const candidate = candidateByIdentity.get(retained.stable_identity_id)
    const baseline = baselineByIdentity.get(retained.stable_identity_id)
    assert(candidate, `retain-18 candidate row is missing: ${retained.legacy_item_code}`)
    assert(baseline, `retain-18 baseline row is missing: ${retained.legacy_item_code}`)
    assert(candidate.legacy_item_code === retained.legacy_item_code, `retain-18 legacy code changed: ${retained.legacy_item_code}`)
    assert(candidate.source_item_code === retained.source_item_code, `retain-18 source code changed: ${retained.legacy_item_code}`)
    assert(candidate.target_item_code === retained.target_item_code, `retain-18 target code changed: ${retained.legacy_item_code}`)
    const currentPrice = assertPrice(
      retained.current_price,
      `${retained.legacy_item_code} retained current price`,
    )
    const baselinePrice = [
      baseline.material_cost,
      baseline.labor_cost,
      baseline.unit_cost,
    ]
    const candidatePrice = [
      candidate.material_cost,
      candidate.labor_cost,
      candidate.unit_cost,
    ]
    assert(JSON.stringify(currentPrice) === JSON.stringify(baselinePrice), `retain-18 baseline price changed: ${retained.legacy_item_code}`)
    if (retained.filed_pdf_price === null) {
      assert(
        retained.sql_vs_pdf === 'not_comparable',
        `retain-18 missing filed price classification changed: ${retained.legacy_item_code}`,
      )
    } else {
      const filedPrice = assertPrice(
        retained.filed_pdf_price,
        `${retained.legacy_item_code} retained filed price`,
      )
      assert(JSON.stringify(filedPrice) === JSON.stringify(baselinePrice), `retain-18 filed price changed: ${retained.legacy_item_code}`)
    }
    assert(JSON.stringify(candidatePrice) === JSON.stringify(baselinePrice), `retain-18 candidate price changed: ${retained.legacy_item_code}`)
    assert(
      VALUE_FIELDS.every((field) => candidate[field] === baseline[field]),
      `retain-18 authority value changed: ${retained.legacy_item_code}`,
    )
  }

  const excludedSourceCodes = new Set(
    sourceExclusions.map((row) => requiredText(row.source_item_code, 'source exclusion code')),
  )
  assert(excludedSourceCodes.size === 17, 'authority exclusion source codes are not unique')
  assert(
    candidateRows.every((row) => !excludedSourceCodes.has(row.source_item_code)),
    'candidate contains an authority-excluded source row',
  )
}

function assertInheritedNullableContract(candidateRows, authorityMappings) {
  const counts = {
    source_item_code_null_count: candidateRows.filter(
      (row) => row.source_item_code === null,
    ).length,
    target_item_code_null_count: candidateRows.filter(
      (row) => row.target_item_code === null,
    ).length,
    work_context_code_null_count: candidateRows.filter(
      (row) => row.work_context_code === null,
    ).length,
    item_type_code_null_count: candidateRows.filter(
      (row) => row.item_type_code === null,
    ).length,
  }
  assert(counts.source_item_code_null_count === 19, 'candidate null source-code count changed')
  assert(counts.target_item_code_null_count === 0, 'candidate target code must remain nonnull')
  assert(counts.work_context_code_null_count === 1, 'candidate null work-context count changed')
  assert(counts.item_type_code_null_count === 1, 'candidate null item-type count changed')

  const authorityByIdentity = new Map(
    authorityMappings.map((row) => [row.identity_id, row]),
  )
  const authorityNullSourceIdentities = new Set(
    authorityMappings
      .filter((row) => row.source_item_code === null)
      .map((row) => row.identity_id),
  )
  assert(authorityNullSourceIdentities.size === 19, 'authority null source-code count changed')

  for (const candidate of candidateRows) {
    const mapping = authorityByIdentity.get(candidate.stable_identity_id)
    assert(mapping, `nullable-contract authority row is missing: ${candidate.stable_identity_id}`)
    assert(
      candidate.source_item_code === mapping.source_item_code,
      `candidate source-code nullability differs from authority: ${candidate.legacy_item_code}`,
    )
    assert(
      candidate.target_item_code === mapping.target_item_code,
      `candidate target code differs from authority: ${candidate.legacy_item_code}`,
    )
    assert(
      candidate.work_context_code === mapping.work_context_code,
      `candidate work-context nullability differs from authority: ${candidate.legacy_item_code}`,
    )
    assert(
      candidate.item_type_code === mapping.item_type_code,
      `candidate item-type nullability differs from authority: ${candidate.legacy_item_code}`,
    )
    if (candidate.source_item_code === null) {
      assert(
        authorityNullSourceIdentities.has(candidate.stable_identity_id),
        `candidate null source code is not inherited from authority: ${candidate.legacy_item_code}`,
      )
      assert(
        typeof candidate.target_item_code === 'string'
          && candidate.target_item_code.trim().length > 0,
        `candidate null source row lacks its authority target code: ${candidate.legacy_item_code}`,
      )
    }
  }

  return counts
}

const D002_STRUCTURE_FIELDS = Object.freeze([
  'stable_identity_id',
  'display_order',
  'legacy_item_code',
  'source_item_code',
  'target_item_code',
  'identity_outcome',
  'work_context_code',
  'item_type_code',
])

function assertD002StructuralEquality(candidateRows, d002OracleRows) {
  assert(candidateRows.length === 710, 'candidate structural row count changed')
  assert(d002OracleRows.length === 710, 'D002 oracle structural row count changed')
  for (let index = 0; index < candidateRows.length; index += 1) {
    const candidate = candidateRows[index]
    const oracle = d002OracleRows[index]
    for (const field of D002_STRUCTURE_FIELDS) {
      assert(
        candidate[field] === oracle[field],
        `D002 structural mismatch at row ${index + 1} field ${field}`,
      )
    }
  }
}

function changeFieldCounts(records) {
  return Object.fromEntries(
    VALUE_FIELDS.map((field) => [
      `${field}_changed_row_count`,
      records.filter((record) => record.change_fields.includes(field)).length,
    ]),
  )
}

function priceDeltaStats(records) {
  const deltas = records.map((record) => record.delta.unit_cost)
  return {
    positive_count: deltas.filter((value) => value > 0).length,
    negative_count: deltas.filter((value) => value < 0).length,
    zero_count: deltas.filter((value) => value === 0).length,
    minimum: Math.min(...deltas),
    maximum: Math.max(...deltas),
    net: deltas.reduce((sum, value) => sum + value, 0),
  }
}

function assertDiffInvariants(baselineDiff, incrementalDiff) {
  assert(baselineDiff.length === 49, `baseline diff count changed: ${baselineDiff.length}`)
  assert(incrementalDiff.length === 48, `D002 incremental diff count changed: ${incrementalDiff.length}`)
  assert(
    baselineDiff.every(
      (record) => JSON.stringify(record.change_fields) === JSON.stringify(['labor_cost', 'unit_cost']),
    ),
    'baseline diff changes a field other than labor_cost/unit_cost',
  )
  assert(
    incrementalDiff.every(
      (record) => JSON.stringify(record.change_fields) === JSON.stringify(['labor_cost', 'unit_cost']),
    ),
    'D002 incremental diff changes a field other than labor_cost/unit_cost',
  )

  const baselineCodes = new Set(baselineDiff.map((record) => record.legacy_item_code))
  const incrementalCodes = new Set(incrementalDiff.map((record) => record.legacy_item_code))
  assert(baselineCodes.has('ITEM-0429'), 'baseline diff lost ITEM-0429')
  assert(!incrementalCodes.has('ITEM-0429'), 'D002 incremental diff must exclude already-applied ITEM-0429')
  assert(
    [...incrementalCodes].every((code) => baselineCodes.has(code)),
    'D002 incremental diff contains a row outside the all-49 set',
  )

  const item0615 = baselineDiff.find((record) => record.legacy_item_code === 'ITEM-0615')
  assert(item0615, 'baseline diff lost ITEM-0615')
  assert(
    JSON.stringify(item0615.before) === JSON.stringify({
      material_cost: 2869,
      labor_cost: 7091,
      unit_cost: 9960,
    }),
    'ITEM-0615 baseline price changed',
  )
  assert(
    JSON.stringify(item0615.after) === JSON.stringify({
      material_cost: 2869,
      labor_cost: 7427,
      unit_cost: 10296,
    }),
    'ITEM-0615 approved price changed',
  )

  const item0637 = baselineDiff.find((record) => record.legacy_item_code === 'ITEM-0637')
  assert(item0637?.delta.unit_cost === -460, 'ITEM-0637 negative correction changed')
  assert(
    JSON.stringify(priceDeltaStats(baselineDiff)) === JSON.stringify({
      positive_count: 48,
      negative_count: 1,
      zero_count: 0,
      minimum: -460,
      maximum: 855,
      net: 5295,
    }),
    'all-49 price delta statistics changed',
  )
  assert(
    JSON.stringify(priceDeltaStats(incrementalDiff)) === JSON.stringify({
      positive_count: 47,
      negative_count: 1,
      zero_count: 0,
      minimum: -460,
      maximum: 855,
      net: 5294,
    }),
    'D002 incremental price delta statistics changed',
  )
}

function buildManifest({
  candidateBytes,
  diffBytes,
  baseline,
  authority,
  p50r,
  decision,
  candidateRows,
  baselineDiff,
  incrementalDiff,
  nullableCounts,
}) {
  return {
    schema: 'conduit-boq/p51-option-a-candidate-manifest/v1',
    candidate_id: CANDIDATE_ID,
    prepared_at: '2026-08-26',
    mode: 'offline-deterministic-review-evidence-only',
    status: 'candidate-built-not-authorized-for-application',
    artifact_role: 'local-review-oracle-not-direct-import-payload',
    inputs: {
      published_baseline: {
        path: INPUTS.baseline.path,
        sha256: INPUTS.baseline.sha256,
        row_count: 710,
        workbook_candidate_row_count: baseline.workbookCandidateRowCount,
        value_binding_sha256: baseline.valueBindingSha256,
      },
      structured_code_authority: {
        path: INPUTS.authority.path,
        sha256: INPUTS.authority.sha256,
        mapping_count: authority.mappings.length,
        recode_count: 709,
        retain_count: 1,
        source_exclusion_count: authority.source_exclusions.length,
      },
      p50r_delta_evidence: {
        path: INPUTS.p50rDelta.path,
        sha256: INPUTS.p50rDelta.sha256,
        evidence_record_count: p50r.manifest.record_count,
        selected_correction_count: p50r.selected.length,
        retain_source_version_count: p50r.retained.length,
      },
      d002_semantic_oracle: {
        candidate_path: INPUTS.p50cCandidate.path,
        candidate_sha256: INPUTS.p50cCandidate.sha256,
        manifest_path: INPUTS.p50cManifest.path,
        manifest_sha256: INPUTS.p50cManifest.sha256,
        candidate_id: 'P50C-CANDIDATE-20260823-V1',
        draft_reference: D002_REFERENCE,
        live_database_binding_claimed: false,
      },
      option_a_decision: {
        path: INPUTS.optionADecision.path,
        marker: INPUTS.optionADecision.marker,
        canonical_marker_sha256: decision.canonicalMarkerSha256,
        canonical_marker_hash_contract: 'SHA-256 over UTF-8 JSON.stringify(parsed marker) plus LF',
        price_scope: decision.marker.priceScope,
        local_offline_review_artifacts_authorized: true,
        candidate_application_authorized: false,
      },
    },
    frozen_sets: {
      all_49: {
        count: 49,
        sha256: EXPECTED.all49SetSha256,
      },
      cohort_a: {
        count: 25,
        sha256: EXPECTED.cohortASetSha256,
      },
      cohort_b: {
        count: 24,
        sha256: EXPECTED.cohortBSetSha256,
      },
      retain_source_version: {
        count: 18,
        sha256: EXPECTED.retain18SetSha256,
      },
      authority_exclusions: {
        count: 17,
      },
    },
    outputs: {
      candidate: {
        path: OUTPUTS.candidate,
        sha256: sha256(candidateBytes),
        byte_count: candidateBytes.length,
        row_count: candidateRows.length,
      },
      diff: {
        path: OUTPUTS.diff,
        sha256: sha256(diffBytes),
        byte_count: diffBytes.length,
        baseline_change_count: baselineDiff.length,
        d002_additional_change_count: incrementalDiff.length,
      },
    },
    counts: {
      candidate_row_count: 710,
      candidate_unique_identity_count: 710,
      candidate_unique_legacy_code_count: 710,
      candidate_unique_target_code_count: 710,
      identity_recode_count: 709,
      identity_retain_count: 1,
      baseline_changed_row_count: 49,
      baseline_unchanged_row_count: 661,
      d002_additional_changed_row_count: 48,
      d002_unchanged_row_count: 662,
      inherited_nullable_fields: nullableCounts,
      baseline_change_fields: changeFieldCounts(baselineDiff),
      d002_additional_change_fields: changeFieldCounts(incrementalDiff),
      baseline_price_delta: priceDeltaStats(baselineDiff),
      d002_additional_price_delta: priceDeltaStats(incrementalDiff),
      historical_boq_rows_repriced_by_this_offline_build: 0,
    },
    invariants: {
      pinned_inputs_verified: true,
      p50c_rebuilt_byte_for_byte_as_semantic_oracle: true,
      exact_uuid_legacy_and_structured_code_joins: true,
      frozen_all_49_set_verified: true,
      retain_18_set_preserved: true,
      authority_17_exclusions_preserved: true,
      inherited_nullable_structure_matches_authority: true,
      null_source_rows_match_authority_contract: true,
      d002_structural_equality_all_710_rows: true,
      candidate_identity_count_preserved: true,
      candidate_target_codes_unique: true,
      display_order_zero_based_contiguous: true,
      item_names_unchanged: true,
      units_unchanged: true,
      material_costs_unchanged: true,
      price_arithmetic_valid: true,
      prices_nonnegative: true,
      item0429_present_in_baseline_diff: true,
      item0429_absent_from_d002_incremental_diff: true,
      item0615_exact_price_verified: true,
      historical_boq_reprice_operation_performed_by_this_offline_build: false,
      direct_import_payload: false,
      live_d002_binding_claimed: false,
    },
    release: {
      baseline_version: BASELINE_VERSION,
      provisional_target_version: PROVISIONAL_TARGET_VERSION,
      existing_draft_reference: D002_REFERENCE,
      target_version_is_official: false,
      fresh_registry_and_live_d002_semantic_check_required_before_application: true,
      current_package_ready_for_p15: false,
    },
    result: {
      local_review_package_built: true,
      automatic_continuation: false,
    },
    authority: {
      candidate_application_authorized: false,
      database_access_authorized: false,
      production_read_authorized: false,
      production_write_authorized: false,
      network_authorized: false,
      source_mutation_authorized: false,
      catalog_mutation_authorized: false,
      published_catalog_mutation_authorized: false,
      boq_mutation_authorized: false,
      pointer_mutation_authorized: false,
      factor_f_mutation_authorized: false,
      historical_boq_reprice_authorized: false,
      local_commit_authorized: false,
      external_git_publication_authorized: false,
      deploy_authorized: false,
      p15_authorized: false,
      publication_authorized: false,
      automatic_next_step: false,
    },
  }
}

export function buildPackage() {
  const baselineBytes = readPinnedInput(INPUTS.baseline, 'published baseline evidence')
  const authorityBytes = readPinnedInput(INPUTS.authority, 'structured-code authority')
  const p50rDeltaBytes = readPinnedInput(INPUTS.p50rDelta, 'P-50R delta evidence')
  const p50cCandidateBytes = readPinnedInput(INPUTS.p50cCandidate, 'P-50C candidate oracle')
  const p50cManifestBytes = readPinnedInput(INPUTS.p50cManifest, 'P-50C candidate manifest')

  const baseline = parseBaseline(baselineBytes)
  const authority = parseAuthority(authorityBytes)
  const p50r = parseP50rDelta(p50rDeltaBytes)
  const decision = parseDecisionMarker()
  const p50cOracle = parseP50cOracle(p50cCandidateBytes, p50cManifestBytes)
  const selectedByIdentity = new Map(p50r.selected.map((row) => [row.stable_identity_id, row]))
  const candidateRows = buildCandidateRows(baseline.rows, authority, p50r.selected)
  assertRetainedRowsAndExclusions({
    candidateRows,
    baselineRows: baseline.rows,
    retainedRows: p50r.retained,
    sourceExclusions: authority.source_exclusions,
  })
  const nullableCounts = assertInheritedNullableContract(
    candidateRows,
    authority.mappings,
  )
  assertD002StructuralEquality(candidateRows, p50cOracle.rows)
  const baselineDiff = compareRows(
    candidateRows,
    baseline.rows,
    selectedByIdentity,
    'published baseline',
  )
  const incrementalDiff = compareRows(
    candidateRows,
    p50cOracle.rows,
    selectedByIdentity,
    'D002 semantic oracle',
  )
  assertDiffInvariants(baselineDiff, incrementalDiff)

  const candidate = {
    schema: 'conduit-boq/p51-option-a-candidate/v1',
    candidate_id: CANDIDATE_ID,
    artifact_role: 'local-review-oracle-not-direct-import-payload',
    baseline_version: BASELINE_VERSION,
    provisional_target_version: PROVISIONAL_TARGET_VERSION,
    existing_draft_reference: D002_REFERENCE,
    target_version_registry_and_live_d002_check_status: 'pending-separate-authorization',
    baseline_value_binding_sha256: baseline.valueBindingSha256,
    selected_correction_set_sha256: EXPECTED.all49SetSha256,
    row_count: candidateRows.length,
    rows: candidateRows,
  }
  const diff = {
    schema: 'conduit-boq/p51-option-a-diff/v1',
    candidate_id: CANDIDATE_ID,
    artifact_role: 'local-review-oracle-not-direct-import-payload',
    published_baseline_comparison: {
      reference_version: BASELINE_VERSION,
      changed_row_count: baselineDiff.length,
      unchanged_row_count: 710 - baselineDiff.length,
      change_field_counts: changeFieldCounts(baselineDiff),
      price_delta_statistics: priceDeltaStats(baselineDiff),
      records: baselineDiff,
    },
    d002_incremental_comparison: {
      reference_candidate_id: p50cOracle.candidate_id,
      reference_candidate_sha256: INPUTS.p50cCandidate.sha256,
      reference_draft: D002_REFERENCE,
      changed_row_count: incrementalDiff.length,
      unchanged_row_count: 710 - incrementalDiff.length,
      change_field_counts: changeFieldCounts(incrementalDiff),
      price_delta_statistics: priceDeltaStats(incrementalDiff),
      records: incrementalDiff,
    },
  }
  const candidateBytes = jsonBytes(candidate)
  const diffBytes = jsonBytes(diff)
  const manifest = buildManifest({
    candidateBytes,
    diffBytes,
    baseline,
    authority,
    p50r,
    decision,
    candidateRows,
    baselineDiff,
    incrementalDiff,
    nullableCounts,
  })
  const manifestBytes = jsonBytes(manifest)

  return {
    candidate,
    diff,
    manifest,
    bytes: {
      candidate: candidateBytes,
      diff: diffBytes,
      manifest: manifestBytes,
    },
  }
}

function writePackage(result) {
  const directory = join(ROOT, OUTPUT_DIRECTORY)
  assert(!existsSync(directory), `new evidence directory already exists: ${OUTPUT_DIRECTORY}`)
  for (const path of Object.values(OUTPUTS)) {
    assert(!existsSync(join(ROOT, path)), `new evidence output already exists: ${path}`)
  }
  mkdirSync(directory, { recursive: false })
  for (const [name, path] of Object.entries(OUTPUTS)) {
    writeFileSync(join(ROOT, path), result.bytes[name], { flag: 'wx' })
  }
}

function checkPackage(result) {
  for (const [name, path] of Object.entries(OUTPUTS)) {
    const absolutePath = join(ROOT, path)
    assert(existsSync(absolutePath), `generated artifact is missing: ${path}`)
    const actual = readFileSync(absolutePath)
    assert(actual.equals(result.bytes[name]), `generated artifact is stale: ${path}`)
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
      + `${result.candidate.row_count} rows, `
      + `${result.diff.published_baseline_comparison.changed_row_count} baseline changes, `
      + `${result.diff.d002_incremental_comparison.changed_row_count} D002 additional changes, `
      + `candidate ${result.manifest.outputs.candidate.sha256}, `
      + `diff ${result.manifest.outputs.diff.sha256}`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2))
}
