import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  CANDIDATE_ID,
  EXPECTED,
  INPUTS,
  OUTPUTS,
  buildPackage,
  validateNonnegativeSafeInteger,
} from '../scripts/build-master-catalog-p51-option-a-candidate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

interface PriceTriple {
  material_cost: number
  labor_cost: number
  unit_cost: number
}

interface CandidateRow extends PriceTriple {
  stable_identity_id: string
  display_order: number
  legacy_item_code: string
  source_item_code: string | null
  target_item_code: string
  identity_outcome: 'recode' | 'retain'
  work_context_code: string | null
  item_type_code: string | null
  item_name: string
  unit: string
}

interface DiffRecord {
  stable_identity_id: string
  legacy_item_code: string
  change_fields: string[]
  before: PriceTriple
  after: PriceTriple
  delta: PriceTriple
}

interface DiffSection {
  changed_row_count: number
  unchanged_row_count: number
  change_field_counts: Record<string, number>
  price_delta_statistics: Record<string, number>
  records: DiffRecord[]
}

interface CandidateArtifact {
  schema: string
  candidate_id: string
  artifact_role: string
  row_count: number
  selected_correction_set_sha256: string
  rows: CandidateRow[]
}

interface DiffArtifact {
  schema: string
  candidate_id: string
  published_baseline_comparison: DiffSection
  d002_incremental_comparison: DiffSection
}

interface ManifestArtifact {
  schema: string
  candidate_id: string
  artifact_role: string
  inputs: Record<string, Record<string, unknown>>
  frozen_sets: Record<string, Record<string, unknown>>
  outputs: Record<string, Record<string, unknown>>
  counts: Record<string, unknown>
  invariants: Record<string, boolean>
  authority: Record<string, boolean>
  result: Record<string, boolean>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(root, path), 'utf8')) as T
}

function fileSha256(path: string) {
  return createHash('sha256').update(readFileSync(join(root, path))).digest('hex')
}

describe('P-51 Option A deterministic local review package', () => {
  it('rejects absent or blank integer inputs without rejecting numeric zero', () => {
    expect(validateNonnegativeSafeInteger(0)).toBe(0)
    expect(validateNonnegativeSafeInteger('0')).toBe(0)
    expect(validateNonnegativeSafeInteger(' 0 ')).toBe(0)

    for (const value of [null, undefined, '', ' ', '\t\n']) {
      expect(
        () => validateNonnegativeSafeInteger(value, 'regression value'),
        JSON.stringify(value),
      ).toThrow(/required/)
    }
    expect(() => validateNonnegativeSafeInteger([], 'array value')).toThrow(
      /number or numeric string/,
    )
    expect(() => validateNonnegativeSafeInteger(-1, 'negative value')).toThrow(
      /nonnegative/,
    )
    expect(() => validateNonnegativeSafeInteger('1.5', 'decimal value')).toThrow(
      /safe integer/,
    )
  })

  it('rebuilds the three new artifacts byte-for-byte from pinned offline inputs', () => {
    const built = buildPackage()

    for (const name of ['candidate', 'diff', 'manifest'] as const) {
      const actual = readFileSync(join(root, OUTPUTS[name]))
      expect(actual.equals(built.bytes[name])).toBe(true)
    }

    expect(fileSha256(OUTPUTS.candidate)).toBe(
      built.manifest.outputs.candidate.sha256,
    )
    expect(fileSha256(OUTPUTS.diff)).toBe(
      built.manifest.outputs.diff.sha256,
    )
    expect(fileSha256(OUTPUTS.manifest)).toBe(
      createHash('sha256').update(built.bytes.manifest).digest('hex'),
    )
  })

  it('builds 710 stable rows and changes exactly 49 baseline / 48 D002 rows', () => {
    const candidate = readJson<CandidateArtifact>(OUTPUTS.candidate)
    const diff = readJson<DiffArtifact>(OUTPUTS.diff)

    expect(candidate).toMatchObject({
      schema: 'conduit-boq/p51-option-a-candidate/v1',
      candidate_id: CANDIDATE_ID,
      artifact_role: 'local-review-oracle-not-direct-import-payload',
      row_count: 710,
      selected_correction_set_sha256: EXPECTED.all49SetSha256,
    })
    expect(candidate.rows).toHaveLength(710)
    expect(new Set(candidate.rows.map((row) => row.stable_identity_id)).size).toBe(710)
    expect(new Set(candidate.rows.map((row) => row.legacy_item_code)).size).toBe(710)
    expect(new Set(candidate.rows.map((row) => row.target_item_code)).size).toBe(710)
    expect(candidate.rows.every((row, index) => row.display_order === index)).toBe(true)
    expect(candidate.rows.filter((row) => row.identity_outcome === 'recode')).toHaveLength(709)
    expect(candidate.rows.filter((row) => row.identity_outcome === 'retain')).toHaveLength(1)
    expect(
      candidate.rows.every(
        (row) =>
          row.material_cost >= 0
          && row.labor_cost >= 0
          && row.unit_cost >= 0
          && row.material_cost + row.labor_cost === row.unit_cost,
      ),
    ).toBe(true)

    expect(candidate.rows.filter((row) => row.source_item_code === null)).toHaveLength(19)
    expect(candidate.rows.filter((row) => row.target_item_code === null)).toHaveLength(0)
    expect(candidate.rows.filter((row) => row.work_context_code === null)).toHaveLength(1)
    expect(candidate.rows.filter((row) => row.item_type_code === null)).toHaveLength(1)

    const d002Oracle = readJson<CandidateArtifact>(INPUTS.p50cCandidate.path)
    const structureFields = [
      'stable_identity_id',
      'display_order',
      'legacy_item_code',
      'source_item_code',
      'target_item_code',
      'identity_outcome',
      'work_context_code',
      'item_type_code',
    ] as const
    expect(d002Oracle.rows).toHaveLength(710)
    for (let index = 0; index < candidate.rows.length; index += 1) {
      for (const field of structureFields) {
        expect(candidate.rows[index][field], `row ${index + 1} ${field}`).toBe(
          d002Oracle.rows[index][field],
        )
      }
    }

    const baseline = diff.published_baseline_comparison
    const incremental = diff.d002_incremental_comparison
    expect(baseline.changed_row_count).toBe(49)
    expect(baseline.unchanged_row_count).toBe(661)
    expect(incremental.changed_row_count).toBe(48)
    expect(incremental.unchanged_row_count).toBe(662)
    expect(baseline.records).toHaveLength(49)
    expect(incremental.records).toHaveLength(48)
    expect(baseline.records.every(
      (record) => JSON.stringify(record.change_fields) === JSON.stringify(['labor_cost', 'unit_cost']),
    )).toBe(true)
    expect(incremental.records.every(
      (record) => JSON.stringify(record.change_fields) === JSON.stringify(['labor_cost', 'unit_cost']),
    )).toBe(true)

    expect(baseline.change_field_counts).toEqual({
      item_name_changed_row_count: 0,
      unit_changed_row_count: 0,
      material_cost_changed_row_count: 0,
      labor_cost_changed_row_count: 49,
      unit_cost_changed_row_count: 49,
    })
    expect(incremental.change_field_counts).toEqual({
      item_name_changed_row_count: 0,
      unit_changed_row_count: 0,
      material_cost_changed_row_count: 0,
      labor_cost_changed_row_count: 48,
      unit_cost_changed_row_count: 48,
    })
    expect(baseline.price_delta_statistics).toEqual({
      positive_count: 48,
      negative_count: 1,
      zero_count: 0,
      minimum: -460,
      maximum: 855,
      net: 5295,
    })
    expect(incremental.price_delta_statistics).toEqual({
      positive_count: 47,
      negative_count: 1,
      zero_count: 0,
      minimum: -460,
      maximum: 855,
      net: 5294,
    })
  })

  it('retains ITEM-0429 in the all-49 set, excludes it only from the D002 patch, and fixes ITEM-0615', () => {
    const diff = readJson<DiffArtifact>(OUTPUTS.diff)
    const baselineByCode = new Map(
      diff.published_baseline_comparison.records.map((row) => [row.legacy_item_code, row]),
    )
    const incrementalCodes = new Set(
      diff.d002_incremental_comparison.records.map((row) => row.legacy_item_code),
    )

    expect(baselineByCode.get('ITEM-0429')).toMatchObject({
      before: { material_cost: 0, labor_cost: 1763, unit_cost: 1763 },
      after: { material_cost: 0, labor_cost: 1764, unit_cost: 1764 },
    })
    expect(incrementalCodes.has('ITEM-0429')).toBe(false)
    expect(baselineByCode.get('ITEM-0615')).toMatchObject({
      before: { material_cost: 2869, labor_cost: 7091, unit_cost: 9960 },
      after: { material_cost: 2869, labor_cost: 7427, unit_cost: 10296 },
      delta: { material_cost: 0, labor_cost: 336, unit_cost: 336 },
    })
    expect(incrementalCodes.has('ITEM-0615')).toBe(true)
    expect(baselineByCode.get('ITEM-0637')?.delta.unit_cost).toBe(-460)
  })

  it('binds frozen evidence and keeps every operational authority false', () => {
    const manifest = readJson<ManifestArtifact>(OUTPUTS.manifest)

    expect(manifest).toMatchObject({
      schema: 'conduit-boq/p51-option-a-candidate-manifest/v1',
      candidate_id: CANDIDATE_ID,
      artifact_role: 'local-review-oracle-not-direct-import-payload',
      inputs: {
        published_baseline: {
          sha256: INPUTS.baseline.sha256,
          value_binding_sha256: EXPECTED.baselineValueBindingSha256,
        },
        structured_code_authority: {
          sha256: INPUTS.authority.sha256,
          source_exclusion_count: 17,
        },
        p50r_delta_evidence: {
          sha256: INPUTS.p50rDelta.sha256,
          selected_correction_count: 49,
          retain_source_version_count: 18,
        },
        d002_semantic_oracle: {
          candidate_sha256: INPUTS.p50cCandidate.sha256,
          manifest_sha256: INPUTS.p50cManifest.sha256,
          live_database_binding_claimed: false,
        },
        option_a_decision: {
          marker: 'P50_OPTION_A_PDF_PRESENTATION_DECISION_V1',
          canonical_marker_sha256:
            'af6628f2e7937dfc2daf53a8ede9acc283856efad9285d8e214582c967e03064',
          candidate_application_authorized: false,
        },
      },
      frozen_sets: {
        all_49: { count: 49, sha256: EXPECTED.all49SetSha256 },
        cohort_a: { count: 25, sha256: EXPECTED.cohortASetSha256 },
        cohort_b: { count: 24, sha256: EXPECTED.cohortBSetSha256 },
        retain_source_version: { count: 18, sha256: EXPECTED.retain18SetSha256 },
        authority_exclusions: { count: 17 },
      },
      result: {
        local_review_package_built: true,
        automatic_continuation: false,
      },
    })
    expect(Object.values(manifest.authority).every((value) => value === false)).toBe(true)
    expect(manifest.counts).toMatchObject({
      inherited_nullable_fields: {
        source_item_code_null_count: 19,
        target_item_code_null_count: 0,
        work_context_code_null_count: 1,
        item_type_code_null_count: 1,
      },
      historical_boq_rows_repriced_by_this_offline_build: 0,
    })
    expect(manifest.counts).not.toHaveProperty('historical_boq_repriced_row_count')
    expect(manifest.invariants).toMatchObject({
      pinned_inputs_verified: true,
      p50c_rebuilt_byte_for_byte_as_semantic_oracle: true,
      inherited_nullable_structure_matches_authority: true,
      null_source_rows_match_authority_contract: true,
      d002_structural_equality_all_710_rows: true,
      item_names_unchanged: true,
      units_unchanged: true,
      material_costs_unchanged: true,
      price_arithmetic_valid: true,
      prices_nonnegative: true,
      item0429_absent_from_d002_incremental_diff: true,
      item0615_exact_price_verified: true,
      historical_boq_reprice_operation_performed_by_this_offline_build: false,
      direct_import_payload: false,
      live_d002_binding_claimed: false,
    })
    expect(manifest.invariants).not.toHaveProperty('historical_boq_reprice')
  })

  it('preserves the historical P-50R/P-50C artifacts and passes both freshness checks', () => {
    expect(fileSha256(INPUTS.p50rDelta.path)).toBe(INPUTS.p50rDelta.sha256)
    expect(fileSha256(INPUTS.p50cCandidate.path)).toBe(INPUTS.p50cCandidate.sha256)
    expect(fileSha256(INPUTS.p50cManifest.path)).toBe(INPUTS.p50cManifest.sha256)
    expect(fileSha256('docs/plans/master-catalog/evidence/p50c-v1/diff.json')).toBe(
      '72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18',
    )

    const p50cCheck = spawnSync(
      process.execPath,
      ['scripts/build-master-catalog-p50c.mjs', '--check'],
      { cwd: root, encoding: 'utf8' },
    )
    expect(p50cCheck.status, p50cCheck.stderr).toBe(0)
    expect(p50cCheck.stdout).toContain('Verified P50C-CANDIDATE-20260823-V1')

    const optionACheck = spawnSync(
      process.execPath,
      ['scripts/build-master-catalog-p51-option-a-candidate.mjs', '--check'],
      { cwd: root, encoding: 'utf8' },
    )
    expect(optionACheck.status, optionACheck.stderr).toBe(0)
    expect(optionACheck.stdout).toContain(
      'Verified P51-OPTION-A-CANDIDATE-20260826-V1: 710 rows, 49 baseline changes, 48 D002 additional changes',
    )
  })

  it('fails closed before writing when the v1 evidence directory already exists', () => {
    const hashesBefore = Object.fromEntries(
      Object.entries(OUTPUTS).map(([name, path]) => [name, fileSha256(path)]),
    )
    const result = spawnSync(
      process.execPath,
      ['scripts/build-master-catalog-p51-option-a-candidate.mjs', '--write'],
      { cwd: root, encoding: 'utf8' },
    )

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain(
      'new evidence directory already exists: docs/plans/master-catalog/evidence/p51-option-a-v1',
    )
    expect(
      Object.fromEntries(
        Object.entries(OUTPUTS).map(([name, path]) => [name, fileSha256(path)]),
      ),
    ).toEqual(hashesBefore)
  })
})
