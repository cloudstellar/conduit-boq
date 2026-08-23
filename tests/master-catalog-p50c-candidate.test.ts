import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

import {
  buildPackage,
  sha256,
} from '../scripts/build-master-catalog-p50c.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const evidenceDirectory = join(
  root,
  'docs/plans/master-catalog/evidence/p50c-v1',
)
const selectedIdentityId = 'f2662c71-a6e5-407e-8456-8608e304b43b'
const authorityValueFields = [
  'item_name',
  'unit',
  'material_cost',
  'labor_cost',
  'unit_cost',
] as const

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function fileSha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function readBaselineRows() {
  const bytes = readFileSync(
    join(root, 'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv'),
  )
  const workbook = XLSX.read(bytes, {
    type: 'buffer',
    codepage: 65001,
    raw: false,
  })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: true,
  })

  return rows
    .filter((row) => row.record_scope === 'production')
    .map((row) => ({
      stable_identity_id: String(row.production_uuid),
      legacy_item_code: String(row.legacy_item_code),
      item_name: String(row.production_name),
      unit: String(row.production_unit),
      material_cost: Number(row.production_material_cost),
      labor_cost: Number(row.production_labor_cost),
      unit_cost: Number(row.production_unit_cost),
    }))
}

describe('P-50C deterministic one-row candidate package', () => {
  it('rebuilds the three checked-in artifacts byte-for-byte from pinned offline inputs', () => {
    const built = buildPackage()

    for (const name of ['candidate', 'diff', 'manifest'] as const) {
      const actual = readFileSync(join(evidenceDirectory, `${name}.json`))
      expect(actual.equals(built.bytes[name])).toBe(true)
    }

    const candidatePath = join(evidenceDirectory, 'candidate.json')
    const diffPath = join(evidenceDirectory, 'diff.json')
    expect(fileSha256(candidatePath)).toBe(built.manifest.outputs.candidate.sha256)
    expect(fileSha256(diffPath)).toBe(built.manifest.outputs.diff.sha256)
    expect(sha256(built.bytes.candidate)).toBe(built.manifest.outputs.candidate.sha256)
    expect(sha256(built.bytes.diff)).toBe(built.manifest.outputs.diff.sha256)
  })

  it('changes only ITEM-0429 labor and unit cost while preserving every other baseline value', () => {
    const candidate = readJson(join(evidenceDirectory, 'candidate.json'))
    const diff = readJson(join(evidenceDirectory, 'diff.json'))
    const manifest = readJson(join(evidenceDirectory, 'manifest.json'))
    const authority = readJson(
      join(root, 'lib/master-catalog/import/data/phase4-first-rollout-authority.json'),
    )
    const baselineRows = readBaselineRows()
    const baselineByIdentity = new Map(
      baselineRows.map((row) => [row.stable_identity_id, row]),
    )
    const mappingByIdentity = new Map<string, Record<string, unknown>>(
      authority.mappings.map((row: Record<string, unknown>) => [
        String(row.identity_id),
        row,
      ]),
    )

    expect(candidate.row_count).toBe(710)
    expect(candidate.rows).toHaveLength(710)
    expect(candidate.baseline_value_binding_sha256).toBe(
      '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
    )
    expect(candidate.rows.every(
      (row: Record<string, unknown>, index: number) => row.display_order === index,
    )).toBe(true)
    expect(new Set(candidate.rows.map((row: Record<string, unknown>) => row.stable_identity_id)).size)
      .toBe(710)
    expect(new Set(candidate.rows.map((row: Record<string, unknown>) => row.target_item_code)).size)
      .toBe(710)
    expect(candidate.rows.filter((row: Record<string, unknown>) => row.identity_outcome === 'recode'))
      .toHaveLength(709)
    expect(candidate.rows.filter((row: Record<string, unknown>) => row.identity_outcome === 'retain'))
      .toHaveLength(1)

    const changes = candidate.rows.flatMap((row: Record<string, unknown>) => {
      const baseline = baselineByIdentity.get(String(row.stable_identity_id))
      expect(baseline).toBeDefined()
      const changedFields = authorityValueFields.filter(
        (field) => row[field] !== baseline?.[field],
      )
      return changedFields.length > 0 ? [{ row, baseline, changedFields }] : []
    })

    expect(changes).toHaveLength(1)
    expect(changes[0].row).toMatchObject({
      stable_identity_id: selectedIdentityId,
      legacy_item_code: 'ITEM-0429',
      source_item_code: 'COR-PB0-002',
      target_item_code: 'COR-PB0-002',
      item_name: 'งานเจาะผนังบ่อพักย่อย (PB)',
      unit: 'จุด',
      material_cost: 0,
      labor_cost: 1764,
      unit_cost: 1764,
    })
    expect(changes[0].baseline).toMatchObject({
      stable_identity_id: selectedIdentityId,
      material_cost: 0,
      labor_cost: 1763,
      unit_cost: 1763,
    })
    expect(changes[0].changedFields).toEqual(['labor_cost', 'unit_cost'])

    for (const row of candidate.rows as Array<Record<string, unknown>>) {
      const mapping = mappingByIdentity.get(String(row.stable_identity_id))
      expect(mapping).toBeDefined()
      expect(row.legacy_item_code).toBe(mapping?.legacy_item_code)
      expect(row.source_item_code).toBe(mapping?.source_item_code)
      expect(row.target_item_code).toBe(mapping?.target_item_code)
      expect(row.identity_outcome).toBe(mapping?.identity_outcome)
      expect(Number(row.material_cost) + Number(row.labor_cost)).toBe(row.unit_cost)
    }

    expect(diff.record_count).toBe(1)
    expect(diff.records).toEqual([
      {
        stable_identity_id: selectedIdentityId,
        legacy_item_code: 'ITEM-0429',
        target_item_code: 'COR-PB0-002',
        item_name: 'งานเจาะผนังบ่อพักย่อย (PB)',
        unit: 'จุด',
        change_fields: ['labor_cost', 'unit_cost'],
        before: { material_cost: 0, labor_cost: 1763, unit_cost: 1763 },
        after: { material_cost: 0, labor_cost: 1764, unit_cost: 1764 },
        delta: { material_cost: 0, labor_cost: 1, unit_cost: 1 },
      },
    ])

    expect(manifest.counts).toMatchObject({
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
    })
    expect(manifest.inputs.production_baseline.value_binding_sha256).toBe(
      '6266fcf6f51089cc9902c61c2b66acbbf27906679ce0e1e9148172a8f47b0b1a',
    )
    expect(manifest.invariants.display_order_zero_based_contiguous).toBe(true)
    expect(manifest.adjacent_rows_unchanged.map(
      (row: Record<string, unknown>) => row.legacy_item_code,
    )).toEqual(['ITEM-0427', 'ITEM-0430', 'ITEM-0431'])
    expect(manifest.adjacent_rows_unchanged.every(
      (row: Record<string, unknown>) => row.baseline_values_retained === true,
    )).toBe(true)
    expect(manifest.release).toMatchObject({
      provisional_target_version: '2568.1.0',
      target_version_is_official: false,
      fresh_issued_claimed_registry_check_required: true,
      fresh_issued_claimed_registry_check_status: 'pending',
    })

    const falseGateNames = [
      'p50c_candidate_application_authorized',
      'database_access_authorized',
      'production_read_authorized',
      'production_write_authorized',
      'network_authorized',
      'catalog_mutation_authorized',
      'published_catalog_mutation_authorized',
      'pointer_mutation_authorized',
      'historical_boq_reprice_authorized',
      'local_commit_authorized',
      'external_git_publication_authorized',
      'publish_authorized',
      'p13_authorized',
      'p14_authorized',
      'p14c_authorized',
      'p15_authorized',
      'automatic_next_step',
    ]
    expect(manifest.authority.p50c_candidate_package_built).toBe(true)
    for (const gateName of falseGateNames) {
      expect(manifest.authority[gateName], gateName).toBe(false)
    }
  })

  it('passes its no-write CLI freshness check', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/build-master-catalog-p50c.mjs', '--check'],
      { cwd: root, encoding: 'utf8' },
    )

    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Verified P50C-CANDIDATE-20260823-V1')
  })
})
