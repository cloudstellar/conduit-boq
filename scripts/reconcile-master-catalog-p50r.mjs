import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REQUEST_ID = 'P50R-SOLO-REQ-20260821-V1'
const WINDOW_START = '2026-08-21T16:27:24+07:00'
const WINDOW_END = '2026-08-25T23:00:00+07:00'
const EXPECTED_PYTHON_PATH =
  '/Users/cloud/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'
const EXPECTED_PDF_PAGE_COUNTS = [
  0, 25, 26, 28, 26, 28, 22, 29, 27, 28, 24, 23, 29, 24, 26, 14, 25, 30, 30,
  30, 26, 28, 22, 17, 22, 15, 28, 10,
]
const EXPECTED_PDF_PRICE_SHA256 =
  'f2a6aa7cfb54d60e8157bd3c17936d04f1d564e7ad6a07c423561ac5b9aa2294'
const EXPECTED_PDF_ROWS_SHA256 =
  'bcfb7dc071dee6c0e381eddf09a98fc7b6b6c0d2cc424b7515d4a4f5bc1eedcd'
const EXPECTED_TRACKED_DIFF_SHA256 =
  'a6f0a449e35036e88a1286ce6fdb9dd67cb1d1643e53c700d432076908decbaa'

const INPUTS = Object.freeze({
  sql: {
    path: 'supabase/.snapshots/public-data-20260621-post009.sql',
    sha256: 'a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570',
  },
  pdf: {
    path: 'files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf',
    sha256: '5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b',
  },
  workbook: {
    path: 'files/NT_Item_Code_Master_K_Mapping_2568.xlsx',
    sha256: 'ae72ac34caf37aeb024e15b0b7462f21ca34987aac448a07bde4d69f7e92ec3b',
  },
  csv: {
    path: 'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
    sha256: '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a',
  },
  authority: {
    path: 'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
    sha256: '62d1e40a368c103aef76c70055057bdf906a50f2c1d7141bf8a97e1f8836a0b8',
  },
})

const AUTHORITY_DOCS = Object.freeze({
  'docs/plans/master-catalog/46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md':
    '0717afa8de8178d3ddee8c9baa0ea290a69248a7b2d803cc7f71958c0e7746cc',
  'docs/plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md':
    '6786a4d6b26dec41e04cbb33618dccd15283d80ccd913d3d31f25e42ce569a20',
  'docs/plans/master-catalog/49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md':
    '2219d057cdcdcc3f4545a5032b5091e7b15b659e6d7137deb2ae61c37aa575e8',
  'docs/plans/master-catalog/19-phase4-decision-register.md':
    'fe0889a09e4f3f22b3b72270938b4917b7c64e00aba539ebd604e2398e652846',
  'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md':
    'bf18a9a9122871919c3d5089056babf9d7dd05ff5313ec9e37044468920e0a0b',
  'tests/master-catalog-authority-consistency.test.ts':
    '7215efdf09d40a34fdc0b2ebf10586758eea3dea34bb616f6ecf98039eb3d3b7',
})

const IMPLEMENTATION_PATHS = [
  'scripts/reconcile-master-catalog-p50r.mjs',
  'scripts/reconcile-master-catalog-p50r-pdf.py',
  'tests/master-catalog-p50r-reconciliation.test.ts',
]

const OUTPUT_PATHS = [
  'docs/plans/master-catalog/evidence/p50r-solo/reconciliation.csv',
  'docs/plans/master-catalog/evidence/p50r-solo/proposed-delta-manifest.json',
  'docs/plans/master-catalog/evidence/p50r-solo/exceptions.json',
  'docs/plans/master-catalog/evidence/p50r-solo/summary.json',
  'docs/plans/master-catalog/evidence/p50r-solo/SHA256SUMS',
]

const CSV_HEADERS = [
  'record_scope',
  'production_uuid',
  'legacy_item_code',
  'canonical_code_candidate',
  'workbook_row',
  'workbook_source_row',
  'match_status',
  'match_method',
  'confidence',
  'production_name',
  'workbook_name',
  'production_unit',
  'workbook_unit',
  'production_material_cost',
  'workbook_material_cost',
  'production_labor_cost',
  'workbook_labor_cost',
  'production_unit_cost',
  'workbook_unit_cost',
  'identity_outcome',
  'price_outcome',
  'taxonomy_status',
  'decision_status',
  'decision_reason',
  'reviewer',
  'reviewed_at',
  'notes',
]

const WORKBOOK_HEADERS = [
  'item_id',
  'catalog_year',
  'status',
  'item_code',
  'AAA',
  'AAA_name_th',
  'AAA_name_en',
  'TTT',
  'TTT_name_th',
  'TTT_name_en',
  'source_sheet',
  'source_row',
  'source_group_row',
  'source_item_no',
  'split_from_merged',
  'main_heading_th',
  'sub_heading_th',
  'description_base_th',
  'subdetail_th',
  'description_th',
  'unit',
  'material_cost',
  'labor_cost',
  'total_cost',
  'sort_key',
  'k_formula_id',
  'k_formula_name_th',
  'is_k_exempt',
  'k_mapping_method',
  'k_mapping_basis',
  'k_mapping_note',
]

const RECONCILIATION_HEADERS = [
  'identity_key',
  'identity_status',
  'production_uuid',
  'legacy_item_code',
  'source_item_code',
  'target_item_code',
  'sql_present',
  'csv_production_present',
  'csv_workbook_present',
  'csv_record_rows',
  'json_mapping_present',
  'json_exclusion_present',
  'xlsx_present',
  'xlsx_physical_row',
  'xlsx_item_id',
  'xlsx_source_row',
  'pdf_present',
  'pdf_page',
  'pdf_table',
  'pdf_row',
  'pdf_locator',
  'pdf_row_digest',
  'name_sql_raw',
  'name_sql_normalized',
  'name_xlsx_raw',
  'name_xlsx_normalized',
  'name_pdf_raw',
  'name_pdf_normalized',
  'unit_sql_raw',
  'unit_sql_normalized',
  'unit_xlsx_raw',
  'unit_xlsx_normalized',
  'unit_pdf_raw',
  'unit_pdf_normalized',
  'material_sql',
  'labor_sql',
  'total_sql',
  'material_xlsx',
  'labor_xlsx',
  'total_xlsx',
  'material_pdf',
  'labor_pdf',
  'total_pdf',
  'sql_vs_xlsx',
  'xlsx_vs_pdf',
  'sql_vs_pdf',
  'identity_match_method',
  'identity_confidence',
  'identity_name_similarity',
  'identity_unit_equal',
  'identity_ordinal_equal',
  'classification',
  'p50d_decision_required',
  'notes',
]

function hold(message) {
  throw new Error(`P-50R HOLD: ${message}`)
}

function assert(condition, message) {
  if (!condition) hold(message)
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
}

function matchingText(value) {
  return normalizeText(value)
    .toLocaleLowerCase('th-TH')
    .replace(/[\s.,'"`()|]/gu, '')
}

function diceCoefficient(leftValue, rightValue) {
  const left = matchingText(leftValue)
  const right = matchingText(rightValue)
  if (left === right) return 1
  if (left.length < 2 || right.length < 2) return 0

  const counts = new Map()
  for (let index = 0; index < left.length - 1; index += 1) {
    const gram = left.slice(index, index + 2)
    counts.set(gram, (counts.get(gram) ?? 0) + 1)
  }

  let overlap = 0
  for (let index = 0; index < right.length - 1; index += 1) {
    const gram = right.slice(index, index + 2)
    const available = counts.get(gram) ?? 0
    if (available > 0) {
      overlap += 1
      counts.set(gram, available - 1)
    }
  }
  return (2 * overlap) / (left.length + right.length - 2)
}

function asInteger(value, label) {
  const parsed = typeof value === 'number' ? value : Number(String(value).trim())
  assert(Number.isSafeInteger(parsed), `${label} must be a safe integer`)
  return parsed
}

function uniqueBy(rows, selector, label, allowBlank = false) {
  const seen = new Set()
  for (const row of rows) {
    const key = selector(row)
    if (allowBlank && (key === null || key === undefined || key === '')) continue
    assert(key !== null && key !== undefined && key !== '', `${label} is blank`)
    assert(!seen.has(key), `${label} is duplicated: ${key}`)
    seen.add(key)
  }
  return seen
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      assert(field === '', 'RFC4180 quote started inside an unquoted field')
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field.endsWith('\r') ? field.slice(0, -1) : field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  assert(!quoted, 'RFC4180 CSV has an unterminated quoted field')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function csvBytes(headers, rows) {
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return Buffer.from(
    `${[headers, ...rows.map((row) => headers.map((header) => row[header]))]
      .map((cells) => cells.map(quote).join(','))
      .join('\n')}\n`,
    'utf8',
  )
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function parseSqlSnapshot(text) {
  const pattern = /^INSERT INTO public\.price_list\r?\nSELECT \* FROM jsonb_populate_recordset\(NULL::public\.price_list,\r?\n\$snapshot_20260621\$(\[[^\r\n]*\])\$snapshot_20260621\$::jsonb\);$/gm
  const matches = [...text.matchAll(pattern)]
  assert(matches.length === 1, `expected one public.price_list insert block, found ${matches.length}`)
  const rows = JSON.parse(matches[0][1])
  const expectedKeys = [
    'category',
    'created_at',
    'id',
    'is_active',
    'item_code',
    'item_name',
    'labor_cost',
    'material_cost',
    'remarks',
    'unit',
    'unit_cost',
    'updated_at',
  ]
  assert(Array.isArray(rows) && rows.length === 710, 'SQL must contain 710 price_list rows')
  uniqueBy(rows, (row) => row.id, 'SQL UUID')
  uniqueBy(rows, (row) => row.item_code, 'SQL item code')
  for (const row of rows) {
    assert(
      JSON.stringify(Object.keys(row).sort()) === JSON.stringify(expectedKeys),
      `SQL row ${row.id} has unexpected columns`,
    )
    assert(row.is_active === true, `SQL row ${row.id} is not active`)
    const material = asInteger(row.material_cost, `${row.id} material_cost`)
    const labor = asInteger(row.labor_cost, `${row.id} labor_cost`)
    const total = asInteger(row.unit_cost, `${row.id} unit_cost`)
    assert(material >= 0 && labor >= 0 && total >= 0, `SQL row ${row.id} has a negative price`)
    assert(material + labor === total, `SQL row ${row.id} has invalid price arithmetic`)
  }
  return rows
}

function parseBridgeCsv(bytes) {
  const matrix = parseCsv(bytes.toString('utf8'))
  assert(matrix.length === 729, `CSV must contain one header plus 728 records, found ${matrix.length}`)
  assert(JSON.stringify(matrix[0]) === JSON.stringify(CSV_HEADERS), 'CSV header contract changed')
  const rows = matrix.slice(1).map((cells, index) => {
    assert(cells.length === CSV_HEADERS.length, `CSV row ${index + 2} has the wrong column count`)
    return Object.fromEntries([
      ...CSV_HEADERS.map((header, column) => [header, cells[column]]),
      ['_csv_row', index + 2],
    ])
  })
  const production = rows.filter((row) => row.record_scope === 'production')
  const candidates = rows.filter((row) => row.record_scope === 'workbook_candidate')
  assert(production.length === 710, `CSV Production count changed: ${production.length}`)
  assert(candidates.length === 18, `CSV workbook-candidate count changed: ${candidates.length}`)
  assert(rows.length === production.length + candidates.length, 'CSV contains an unknown record_scope')
  uniqueBy(production, (row) => row.production_uuid, 'CSV Production UUID')
  uniqueBy(
    rows,
    (row) => row.workbook_row,
    'CSV workbook physical row',
    true,
  )
  return { rows, production, candidates }
}

function parseWorkbook(bytes) {
  const workbook = XLSX.read(bytes, { type: 'buffer', cellFormula: true })
  assert(
    workbook.SheetNames.includes('01_Item_Master_Final'),
    'required workbook sheet 01_Item_Master_Final is missing',
  )
  const sheet = workbook.Sheets['01_Item_Master_Final']
  assert(sheet['!ref'] === 'A1:AE709', `workbook range changed: ${sheet['!ref']}`)
  for (const [address, cell] of Object.entries(sheet)) {
    if (address.startsWith('!')) continue
    assert(!cell.f, `workbook formula is forbidden at ${address}`)
  }
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    range: 'A1:AE709',
  })
  assert(JSON.stringify(matrix[0]) === JSON.stringify(WORKBOOK_HEADERS), 'workbook header changed')
  const rows = matrix.slice(1).map((cells, index) => {
    assert(cells.length <= WORKBOOK_HEADERS.length, `workbook row ${index + 2} is too wide`)
    return Object.fromEntries([
      ...WORKBOOK_HEADERS.map((header, column) => [header, cells[column] ?? null]),
      ['_physical_row', index + 2],
    ])
  })
  assert(rows.length === 708, `workbook row count changed: ${rows.length}`)
  uniqueBy(rows, (row) => row.item_code, 'workbook item code')
  uniqueBy(rows, (row) => row.source_row, 'workbook source row')
  uniqueBy(rows, (row) => row.sort_key, 'workbook sort key')
  for (const [index, row] of rows.entries()) {
    assert(row.item_id === index + 1, `workbook item_id is not contiguous at physical row ${index + 2}`)
    assert(row.catalog_year === 2568 && row.status === 'ACTIVE', `workbook status/year changed at ${row.item_code}`)
    assert(row.item_code === row.sort_key, `workbook sort_key differs at ${row.item_code}`)
    const material = asInteger(row.material_cost, `${row.item_code} material_cost`)
    const labor = asInteger(row.labor_cost, `${row.item_code} labor_cost`)
    const total = asInteger(row.total_cost, `${row.item_code} total_cost`)
    assert(material >= 0 && labor >= 0 && total >= 0, `workbook has a negative price at ${row.item_code}`)
    assert(material + labor === total, `workbook price arithmetic failed at ${row.item_code}`)
  }
  return rows
}

function parseAuthority(bytes, csvSha256, workbookRows, sqlRows) {
  const authority = JSON.parse(bytes.toString('utf8'))
  const expectedKeys = [
    'schema_version',
    'source_evidence_path',
    'source_evidence_sha256',
    'decision_set',
    'mappings',
    'source_exclusions',
    'code_groups',
    'authority_sha256',
  ]
  assert(JSON.stringify(Object.keys(authority)) === JSON.stringify(expectedKeys), 'authority top-level keys changed')
  assert(authority.mappings.length === 710, 'authority mapping count changed')
  assert(authority.source_exclusions.length === 17, 'authority exclusion count changed')
  assert(authority.code_groups.length === 65, 'authority group count changed')
  assert(authority.source_evidence_sha256 === csvSha256, 'authority source evidence hash changed')
  const { authority_sha256: filedAuthoritySha, ...core } = authority
  assert(
    sha256(Buffer.from(JSON.stringify(core), 'utf8')) === filedAuthoritySha,
    'authority internal SHA-256 is invalid',
  )
  assert(
    filedAuthoritySha === '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a',
    'authority internal SHA-256 differs from the approved request',
  )
  const identityIds = uniqueBy(authority.mappings, (row) => row.identity_id, 'authority identity')
  uniqueBy(authority.mappings, (row) => row.legacy_item_code, 'authority legacy code')
  uniqueBy(authority.mappings, (row) => row.target_item_code, 'authority target code')
  uniqueBy(authority.mappings, (row) => row.source_item_code, 'authority source code', true)
  uniqueBy(authority.source_exclusions, (row) => row.source_item_code, 'authority exclusion code')
  const sqlIds = new Set(sqlRows.map((row) => row.id))
  assert(identityIds.size === sqlIds.size && [...identityIds].every((id) => sqlIds.has(id)), 'authority/SQL UUID sets differ')
  const workbookCodes = new Set(workbookRows.map((row) => row.item_code))
  const partition = new Set([
    ...authority.mappings.map((row) => row.source_item_code).filter(Boolean),
    ...authority.source_exclusions.map((row) => row.source_item_code),
  ])
  assert(partition.size === 708 && [...partition].every((code) => workbookCodes.has(code)), 'authority does not partition all workbook codes')
  const groups = new Set(authority.code_groups.map((row) => `${row.work_context_code}-${row.item_type_code}`))
  for (const mapping of authority.mappings) {
    if (mapping.work_context_code || mapping.item_type_code) {
      assert(groups.has(`${mapping.work_context_code}-${mapping.item_type_code}`), `authority group missing for ${mapping.target_item_code}`)
    }
  }
  return authority
}

function verifyCrossSource(sqlRows, bridge, workbookRows, authority) {
  const sqlById = new Map(sqlRows.map((row) => [row.id, row]))
  const workbookByPhysicalRow = new Map(workbookRows.map((row) => [String(row._physical_row), row]))
  const csvProductionById = new Map(bridge.production.map((row) => [row.production_uuid, row]))

  for (const [identityId, sql] of sqlById) {
    const csv = csvProductionById.get(identityId)
    assert(csv, `CSV Production row missing for ${identityId}`)
    assert(csv.legacy_item_code === sql.item_code, `SQL/CSV item code differs for ${identityId}`)
    assert(normalizeText(csv.production_name) === normalizeText(sql.item_name), `SQL/CSV name differs for ${identityId}`)
    assert(normalizeText(csv.production_unit) === normalizeText(sql.unit), `SQL/CSV unit differs for ${identityId}`)
    assert(asInteger(csv.production_material_cost, 'CSV material') === sql.material_cost, `SQL/CSV material differs for ${identityId}`)
    assert(asInteger(csv.production_labor_cost, 'CSV labor') === sql.labor_cost, `SQL/CSV labor differs for ${identityId}`)
    assert(asInteger(csv.production_unit_cost, 'CSV total') === sql.unit_cost, `SQL/CSV total differs for ${identityId}`)
  }

  for (const csv of bridge.rows.filter((row) => row.workbook_row)) {
    const workbook = workbookByPhysicalRow.get(csv.workbook_row)
    assert(workbook, `CSV workbook physical row is missing: ${csv.workbook_row}`)
    assert(csv.canonical_code_candidate === workbook.item_code, `CSV/workbook code differs at row ${csv.workbook_row}`)
    assert(asInteger(csv.workbook_source_row, 'CSV source row') === workbook.source_row, `CSV/workbook source row differs at ${workbook.item_code}`)
    assert(normalizeText(csv.workbook_name) === normalizeText(workbook.description_th), `CSV/workbook name differs at ${workbook.item_code}`)
    assert(normalizeText(csv.workbook_unit) === normalizeText(workbook.unit), `CSV/workbook unit differs at ${workbook.item_code}`)
    assert(asInteger(csv.workbook_material_cost, 'CSV workbook material') === workbook.material_cost, `CSV/workbook material differs at ${workbook.item_code}`)
    assert(asInteger(csv.workbook_labor_cost, 'CSV workbook labor') === workbook.labor_cost, `CSV/workbook labor differs at ${workbook.item_code}`)
    assert(asInteger(csv.workbook_unit_cost, 'CSV workbook total') === workbook.total_cost, `CSV/workbook total differs at ${workbook.item_code}`)
  }

  for (const mapping of authority.mappings) {
    assert(sqlById.get(mapping.identity_id)?.item_code === mapping.legacy_item_code, `authority legacy code differs for ${mapping.identity_id}`)
  }
}

function alignmentScore(pdf, workbook) {
  const nameSimilarity = diceCoefficient(pdf.normalized_name, workbook.description_th)
  const unitEqual = normalizeText(pdf.normalized_unit) === normalizeText(workbook.unit)
  const ordinalEqual = normalizeText(pdf.display_row) === normalizeText(workbook.source_item_no)
  return {
    nameSimilarity,
    unitEqual,
    ordinalEqual,
    score: nameSimilarity * 20 - 6 + (unitEqual ? 7 : -14) + (ordinalEqual ? 7 : 0),
  }
}

export function alignPdfToWorkbook(pdfRows, workbookRows) {
  const pdfCount = pdfRows.length
  const workbookCount = workbookRows.length
  const width = workbookCount + 1
  const trace = new Uint8Array((pdfCount + 1) * width)
  let previous = new Float64Array(width)
  let current = new Float64Array(width)
  let previousWays = new Uint8Array(width)
  let currentWays = new Uint8Array(width)
  previousWays[0] = 1
  for (let workbookIndex = 1; workbookIndex <= workbookCount; workbookIndex += 1) {
    previous[workbookIndex] = previous[workbookIndex - 1] - 4
    previousWays[workbookIndex] = 1
    trace[workbookIndex] = 2
  }

  for (let pdfIndex = 1; pdfIndex <= pdfCount; pdfIndex += 1) {
    current[0] = previous[0] - 20
    currentWays[0] = 1
    trace[pdfIndex * width] = 3
    for (let workbookIndex = 1; workbookIndex <= workbookCount; workbookIndex += 1) {
      const details = alignmentScore(pdfRows[pdfIndex - 1], workbookRows[workbookIndex - 1])
      const matched = previous[workbookIndex - 1] + details.score
      const workbookOnly = current[workbookIndex - 1] - 4
      const pdfOnly = previous[workbookIndex] - 20
      const best = Math.max(matched, workbookOnly, pdfOnly)
      let ways = 0
      if (Math.abs(matched - best) <= 1e-9) ways += previousWays[workbookIndex - 1]
      if (Math.abs(workbookOnly - best) <= 1e-9) ways += currentWays[workbookIndex - 1]
      if (Math.abs(pdfOnly - best) <= 1e-9) ways += previousWays[workbookIndex]
      currentWays[workbookIndex] = Math.min(2, ways)
      if (matched >= workbookOnly && matched >= pdfOnly) {
        current[workbookIndex] = matched
        trace[pdfIndex * width + workbookIndex] = 1
      } else if (workbookOnly >= pdfOnly) {
        current[workbookIndex] = workbookOnly
        trace[pdfIndex * width + workbookIndex] = 2
      } else {
        current[workbookIndex] = pdfOnly
        trace[pdfIndex * width + workbookIndex] = 3
      }
    }
    ;[previous, current] = [current, previous]
    ;[previousWays, currentWays] = [currentWays, previousWays]
  }

  const matches = []
  const workbookOnly = []
  const pdfOnly = []
  let pdfIndex = pdfCount
  let workbookIndex = workbookCount
  while (pdfIndex > 0 || workbookIndex > 0) {
    const direction = trace[pdfIndex * width + workbookIndex]
    if (direction === 1) {
      const pdf = pdfRows[pdfIndex - 1]
      const workbook = workbookRows[workbookIndex - 1]
      const details = alignmentScore(pdf, workbook)
      const confidence =
        details.unitEqual && details.nameSimilarity >= 0.55
          ? 'high'
          : details.unitEqual && (details.ordinalEqual || details.nameSimilarity >= 0.25)
            ? 'medium'
            : 'low'
      matches.push({ pdf, workbook, ...details, confidence })
      pdfIndex -= 1
      workbookIndex -= 1
    } else if (direction === 2) {
      workbookOnly.push(workbookRows[workbookIndex - 1])
      workbookIndex -= 1
    } else if (direction === 3) {
      pdfOnly.push(pdfRows[pdfIndex - 1])
      pdfIndex -= 1
    } else {
      hold(`alignment traceback failed at PDF ${pdfIndex}, workbook ${workbookIndex}`)
    }
  }
  return {
    matches: matches.reverse(),
    workbookOnly: workbookOnly.reverse(),
    pdfOnly: pdfOnly.reverse(),
    alternateOptimalAlignment: previousWays[workbookCount] > 1,
  }
}

function duplicateSignatureGroups(rows, selector) {
  const groups = new Map()
  for (const row of rows) {
    const signature = selector(row)
    const values = groups.get(signature) ?? []
    values.push(row)
    groups.set(signature, values)
  }
  return [...groups.entries()].filter(([, values]) => values.length > 1)
}

function priceTriple(row, kind) {
  if (!row) return null
  if (kind === 'sql') return [row.material_cost, row.labor_cost, row.unit_cost]
  if (kind === 'workbook') return [row.material_cost, row.labor_cost, row.total_cost]
  return [row.material, row.labor, row.total]
}

function compareTriple(left, leftKind, right, rightKind) {
  if (!left || !right) return 'not_comparable'
  return JSON.stringify(priceTriple(left, leftKind)) === JSON.stringify(priceTriple(right, rightKind))
    ? 'equal'
    : 'different'
}

function tripleText(row, kind) {
  const triple = priceTriple(row, kind)
  return triple ? triple.join('/') : ''
}

function pdfDigest(row) {
  if (!row) return ''
  return sha256(
    Buffer.from(
      JSON.stringify([
        row.page,
        row.table,
        row.table_row,
        row.display_row,
        row.raw_name,
        row.raw_unit,
        row.material,
        row.labor,
        row.total,
      ]),
      'utf8',
    ),
  )
}

function makeRecord({ mapping, exclusion, sql, csvRows, workbook, match }) {
  const pdf = match?.pdf ?? null
  const sqlVsWorkbook = compareTriple(sql, 'sql', workbook, 'workbook')
  const workbookVsPdf = compareTriple(workbook, 'workbook', pdf, 'pdf')
  const sqlVsPdf = compareTriple(sql, 'sql', pdf, 'pdf')
  let classification = 'matched'
  if (exclusion) classification = 'rejected_or_no_authority'
  else if (sqlVsPdf === 'different') classification = 'proposed_confirmed_correction'
  else if (!pdf || sqlVsWorkbook === 'different' || workbookVsPdf === 'different') {
    classification = 'source_version_difference'
  }
  const notes = []
  if (!workbook) notes.push('no_workbook_source')
  if (!pdf) notes.push('no_filed_pdf_row')
  if (pdf?.ambiguity_codes?.length) notes.push(...pdf.ambiguity_codes)
  if (csvRows.length > 1) notes.push('authority_resolved_multiple_bridge_rows')
  return {
    identity_key: mapping ? `prod:${mapping.identity_id}` : `wb:${workbook.item_code}@row${workbook._physical_row}`,
    identity_status: mapping ? 'stable_uuid' : 'workbook_exclusion_no_uuid',
    production_uuid: mapping?.identity_id ?? '',
    legacy_item_code: mapping?.legacy_item_code ?? '',
    source_item_code: mapping?.source_item_code ?? exclusion?.source_item_code ?? '',
    target_item_code: mapping?.target_item_code ?? workbook?.item_code ?? '',
    sql_present: Boolean(sql),
    csv_production_present: csvRows.some((row) => row.record_scope === 'production'),
    csv_workbook_present: csvRows.some((row) => Boolean(row.workbook_row)),
    csv_record_rows: csvRows.map((row) => row._csv_row).join(';'),
    json_mapping_present: Boolean(mapping),
    json_exclusion_present: Boolean(exclusion),
    xlsx_present: Boolean(workbook),
    xlsx_physical_row: workbook?._physical_row ?? '',
    xlsx_item_id: workbook?.item_id ?? '',
    xlsx_source_row: workbook?.source_row ?? '',
    pdf_present: Boolean(pdf),
    pdf_page: pdf?.page ?? '',
    pdf_table: pdf?.table ?? '',
    pdf_row: pdf?.table_row ?? '',
    pdf_locator: pdf?.locator ?? '',
    pdf_row_digest: pdfDigest(pdf),
    name_sql_raw: sql?.item_name ?? '',
    name_sql_normalized: normalizeText(sql?.item_name),
    name_xlsx_raw: workbook?.description_th ?? '',
    name_xlsx_normalized: normalizeText(workbook?.description_th),
    name_pdf_raw: pdf?.raw_name ?? '',
    name_pdf_normalized: normalizeText(pdf?.raw_name),
    unit_sql_raw: sql?.unit ?? '',
    unit_sql_normalized: normalizeText(sql?.unit),
    unit_xlsx_raw: workbook?.unit ?? '',
    unit_xlsx_normalized: normalizeText(workbook?.unit),
    unit_pdf_raw: pdf?.raw_unit ?? '',
    unit_pdf_normalized: normalizeText(pdf?.raw_unit),
    material_sql: sql?.material_cost ?? '',
    labor_sql: sql?.labor_cost ?? '',
    total_sql: sql?.unit_cost ?? '',
    material_xlsx: workbook?.material_cost ?? '',
    labor_xlsx: workbook?.labor_cost ?? '',
    total_xlsx: workbook?.total_cost ?? '',
    material_pdf: pdf?.material ?? '',
    labor_pdf: pdf?.labor ?? '',
    total_pdf: pdf?.total ?? '',
    sql_vs_xlsx: sqlVsWorkbook,
    xlsx_vs_pdf: workbookVsPdf,
    sql_vs_pdf: sqlVsPdf,
    identity_match_method: match ? 'order_constrained_name_unit_source_ordinal' : mapping ? 'stable_uuid_authority' : 'authority_exclusion',
    identity_confidence: exclusion
      ? 'authority_rejected'
      : (match?.confidence ?? (mapping ? 'high' : 'authority_rejected')),
    identity_name_similarity: match ? Number(match.nameSimilarity.toFixed(6)) : '',
    identity_unit_equal: match?.unitEqual ?? '',
    identity_ordinal_equal: match?.ordinalEqual ?? '',
    classification,
    p50d_decision_required: classification !== 'matched',
    notes: notes.join(';'),
    _sql: sql,
    _workbook: workbook,
    _pdf: pdf,
    _match: match,
  }
}

function publicRecord(record) {
  return Object.fromEntries(RECONCILIATION_HEADERS.map((header) => [header, record[header]]))
}

function makeDelta(record) {
  const current = priceTriple(record._sql, 'sql')
  const workbook = priceTriple(record._workbook, 'workbook')
  const pdf = priceTriple(record._pdf, 'pdf')
  const difference =
    record.sql_vs_xlsx === 'different' ||
    record.xlsx_vs_pdf === 'different' ||
    record.sql_vs_pdf === 'different'
  if (!difference) return null
  const componentDelta = (observed, baseline, index) =>
    observed && baseline ? observed[index] - baseline[index] : null
  return {
    identity_key: record.identity_key,
    stable_identity_id: record.production_uuid || null,
    legacy_item_code: record.legacy_item_code || null,
    source_item_code: record.source_item_code || null,
    target_item_code: record.target_item_code || null,
    classification: record.classification,
    decision_status: 'pending_p50d',
    proposed_action: 'none',
    current_price: current,
    workbook_price: workbook,
    filed_pdf_price: pdf,
    pdf_locator: record.pdf_locator || null,
    sql_vs_xlsx: record.sql_vs_xlsx,
    xlsx_vs_pdf: record.xlsx_vs_pdf,
    sql_vs_pdf: record.sql_vs_pdf,
    filed_minus_current: {
      material: componentDelta(pdf, current, 0),
      labor: componentDelta(pdf, current, 1),
      total: componentDelta(pdf, current, 2),
    },
    workbook_minus_current: {
      material: componentDelta(workbook, current, 0),
      labor: componentDelta(workbook, current, 1),
      total: componentDelta(workbook, current, 2),
    },
    p50d_decision_required: true,
  }
}

function exception(id, type, severity, blocksP50r, classification, details) {
  return { id, type, severity, blocks_p50r: blocksP50r, classification, ...details }
}

function buildEvidence({ sqlRows, bridge, workbookRows, authority, pdfExtraction }) {
  const alignment = alignPdfToWorkbook(pdfExtraction.rows, workbookRows)
  const matchByWorkbookRow = new Map(
    alignment.matches.map((match) => [match.workbook._physical_row, match]),
  )
  const sqlById = new Map(sqlRows.map((row) => [row.id, row]))
  const csvProductionById = new Map(bridge.production.map((row) => [row.production_uuid, row]))
  const csvCandidateByCode = new Map(bridge.candidates.map((row) => [row.canonical_code_candidate, row]))
  const workbookByCode = new Map(workbookRows.map((row) => [row.item_code, row]))
  const records = []
  const consumedCsvRows = new Set()

  for (const mapping of [...authority.mappings].sort((a, b) => a.legacy_item_code.localeCompare(b.legacy_item_code, 'en'))) {
    const sql = sqlById.get(mapping.identity_id)
    const workbook = mapping.source_item_code ? workbookByCode.get(mapping.source_item_code) : null
    const csvRows = [csvProductionById.get(mapping.identity_id)]
    const candidate = mapping.source_item_code ? csvCandidateByCode.get(mapping.source_item_code) : null
    if (candidate) csvRows.push(candidate)
    for (const row of csvRows) consumedCsvRows.add(row._csv_row)
    records.push(
      makeRecord({
        mapping,
        exclusion: null,
        sql,
        csvRows,
        workbook,
        match: workbook ? matchByWorkbookRow.get(workbook._physical_row) : null,
      }),
    )
  }

  for (const exclusion of authority.source_exclusions) {
    const workbook = workbookByCode.get(exclusion.source_item_code)
    const candidate = csvCandidateByCode.get(exclusion.source_item_code)
    assert(workbook && candidate, `excluded workbook row is not covered: ${exclusion.source_item_code}`)
    consumedCsvRows.add(candidate._csv_row)
    records.push(
      makeRecord({
        mapping: null,
        exclusion,
        sql: null,
        csvRows: [candidate],
        workbook,
        match: matchByWorkbookRow.get(workbook._physical_row),
      }),
    )
  }

  const exceptions = []
  const workbookSignatureDuplicates = duplicateSignatureGroups(
    workbookRows,
    (row) =>
      `${matchingText(row.description_th)}|${normalizeText(row.unit)}|${normalizeText(row.source_item_no)}`,
  )
  const pdfSignatureDuplicates = duplicateSignatureGroups(
    pdfExtraction.rows,
    (row) =>
      `${matchingText(row.normalized_name)}|${normalizeText(row.normalized_unit)}|${normalizeText(row.display_row)}`,
  )
  for (const [signature, rows] of workbookSignatureDuplicates) {
    exceptions.push(
      exception(
        `workbook-identity-signature-duplicate-${sha256(Buffer.from(signature)).slice(0, 12)}`,
        'workbook_identity_signature_duplicate',
        'error',
        true,
        'rejected_or_no_authority',
        {
          workbook_physical_rows: rows.map((row) => row._physical_row),
          workbook_item_codes: rows.map((row) => row.item_code),
          disposition: 'ambiguous_hold',
        },
      ),
    )
  }
  for (const [signature, rows] of pdfSignatureDuplicates) {
    exceptions.push(
      exception(
        `pdf-identity-signature-duplicate-${sha256(Buffer.from(signature)).slice(0, 12)}`,
        'pdf_identity_signature_duplicate',
        'error',
        true,
        'rejected_or_no_authority',
        {
          pdf_locators: rows.map((row) => row.locator),
          disposition: 'ambiguous_hold',
        },
      ),
    )
  }
  if (alignment.alternateOptimalAlignment) {
    exceptions.push(
      exception(
        'alignment-alternate-optimal-path',
        'identity_alignment_alternate_optimal_path',
        'error',
        true,
        'rejected_or_no_authority',
        { disposition: 'ambiguous_hold' },
      ),
    )
  }
  for (const workbook of alignment.workbookOnly) {
    exceptions.push(
      exception(
        `xlsx-source-absence-${String(workbook._physical_row).padStart(3, '0')}`,
        'workbook_row_absent_from_filed_pdf',
        'review',
        false,
        'source_version_difference',
        {
          workbook_physical_row: workbook._physical_row,
          workbook_item_code: workbook.item_code,
          workbook_source_row: workbook.source_row,
          disposition: 'classified_pending_p50d',
        },
      ),
    )
  }
  for (const record of records.filter((row) => row.json_mapping_present && !row.xlsx_present)) {
    exceptions.push(
      exception(
        `production-source-absence-${record.legacy_item_code}`,
        'production_identity_without_workbook_or_pdf_source',
        'review',
        false,
        'source_version_difference',
        {
          stable_identity_id: record.production_uuid,
          legacy_item_code: record.legacy_item_code,
          disposition: 'retain_current_pending_p50d',
        },
      ),
    )
  }
  for (const match of alignment.matches) {
    for (const code of match.pdf.ambiguity_codes ?? []) {
      exceptions.push(
        exception(
          `pdf-${String(match.pdf.pdf_index).padStart(3, '0')}-${code}`,
          code,
          'review',
          match.confidence === 'low',
          'extraction_structure',
          {
            pdf_locator: match.pdf.locator,
            workbook_physical_row: match.workbook._physical_row,
            workbook_item_code: match.workbook.item_code,
            identity_confidence: match.confidence,
            disposition: match.confidence === 'low' ? 'ambiguous_hold' : 'classified_extraction_structure',
          },
        ),
      )
    }
    if (match.confidence === 'medium') {
      exceptions.push(
        exception(
          `alignment-medium-confidence-${String(match.pdf.pdf_index).padStart(3, '0')}`,
          'identity_alignment_medium_confidence',
          'review',
          false,
          'extraction_structure',
          {
            pdf_locator: match.pdf.locator,
            workbook_physical_row: match.workbook._physical_row,
            workbook_item_code: match.workbook.item_code,
            name_similarity: Number(match.nameSimilarity.toFixed(6)),
            unit_equal: match.unitEqual,
            ordinal_equal: match.ordinalEqual,
            disposition: 'manual_locator_confirmation_required',
          },
        ),
      )
    }
    if (match.confidence === 'low') {
      exceptions.push(
        exception(
          `alignment-low-confidence-${String(match.pdf.pdf_index).padStart(3, '0')}`,
          'identity_alignment_low_confidence',
          'error',
          true,
          'rejected_or_no_authority',
          {
            pdf_locator: match.pdf.locator,
            workbook_physical_row: match.workbook._physical_row,
            workbook_item_code: match.workbook.item_code,
            name_similarity: Number(match.nameSimilarity.toFixed(6)),
            unit_equal: match.unitEqual,
            ordinal_equal: match.ordinalEqual,
            disposition: 'ambiguous_hold',
          },
        ),
      )
    }
  }
  for (const pdf of alignment.pdfOnly) {
    exceptions.push(
      exception(
        `pdf-only-${String(pdf.pdf_index).padStart(3, '0')}`,
        'filed_pdf_row_without_stable_bridge_identity',
        'error',
        true,
        'rejected_or_no_authority',
        { pdf_locator: pdf.locator, disposition: 'source_only_hold' },
      ),
    )
  }

  const deltas = records.map(makeDelta).filter(Boolean)
  const targetExpectations = new Map([
    ['ITEM-0427', [24, 5070, 1802, 6872]],
    ['ITEM-0429', [24, 0, 1764, 1764]],
    ['ITEM-0430', [24, 0, 1764, 1764]],
    ['ITEM-0431', [24, 0, 3528, 3528]],
  ])
  for (const [legacyCode, expected] of targetExpectations) {
    const record = records.find((row) => row.legacy_item_code === legacyCode)
    assert(record?._pdf, `${legacyCode} did not receive a unique PDF match`)
    assert(
      JSON.stringify([record._pdf.page, ...priceTriple(record._pdf, 'pdf')]) === JSON.stringify(expected),
      `${legacyCode} PDF source locator/value differs from the reviewed page-24 oracle`,
    )
  }

  assert(records.length === 727, `canonical identity record count changed: ${records.length}`)
  assert(consumedCsvRows.size === 728, `CSV coverage is ${consumedCsvRows.size}/728`)
  assert(alignment.matches.length + alignment.workbookOnly.length === 708, 'workbook coverage is incomplete')
  assert(alignment.matches.length + alignment.pdfOnly.length === 662, 'PDF coverage is incomplete')
  uniqueBy(records, (record) => record.identity_key, 'reconciliation identity key')

  const reconciliation = csvBytes(RECONCILIATION_HEADERS, records.map(publicRecord))
  const deltaManifest = jsonBytes({
    schema: 'conduit-boq/p50r-proposed-delta-manifest/v1',
    request_id: REQUEST_ID,
    status: 'evidence_only_pending_p50d',
    price_mutation_authorized: false,
    record_count: deltas.length,
    records: deltas,
  })
  const exceptionBytes = jsonBytes({
    schema: 'conduit-boq/p50r-exceptions/v1',
    request_id: REQUEST_ID,
    status: exceptions.some((item) => item.blocks_p50r) ? 'hold' : 'classified',
    exception_count: exceptions.length,
    blocking_count: exceptions.filter((item) => item.blocks_p50r).length,
    exceptions: exceptions.sort((left, right) => left.id.localeCompare(right.id, 'en')),
  })

  return {
    bytes: { reconciliation, deltaManifest, exceptions: exceptionBytes },
    records,
    deltas,
    exceptionRecords: JSON.parse(exceptionBytes.toString('utf8')).exceptions,
    alignment,
  }
}

function readExactInputs(pythonPath) {
  const bytes = {}
  const manifest = {}
  for (const [key, spec] of Object.entries(INPUTS)) {
    const absolute = join(ROOT, spec.path)
    assert(lstatSync(absolute).isFile(), `${spec.path} is not a regular file`)
    const value = readFileSync(absolute)
    const digest = sha256(value)
    assert(digest === spec.sha256, `${spec.path} SHA-256 changed: ${digest}`)
    bytes[key] = value
    manifest[key] = { path: spec.path, sha256: digest, bytes: value.length }
  }

  const helper = join(ROOT, 'scripts/reconcile-master-catalog-p50r-pdf.py')
  const approvedPython = realpathSync(EXPECTED_PYTHON_PATH)
  const suppliedPython = realpathSync(pythonPath)
  assert(suppliedPython === approvedPython, `unapproved Python runtime: ${suppliedPython}`)
  assert(lstatSync(suppliedPython).isFile(), 'approved Python runtime is not a regular file')
  const result = spawnSync(
    suppliedPython,
    ['-I', '-B', helper, '--input', join(ROOT, INPUTS.pdf.path), '--expected-sha256', INPUTS.pdf.sha256],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  assert(result.status === 0, `PDF helper failed: ${normalizeText(result.stderr)}`)
  assert(result.signal === null, `PDF helper was interrupted by ${result.signal}`)
  assert(normalizeText(result.stderr) === '', `PDF helper emitted stderr: ${normalizeText(result.stderr)}`)
  const pdfExtraction = JSON.parse(result.stdout)
  validatePdfExtraction(pdfExtraction)

  return { bytes, manifest, pdfExtraction }
}

function validatePdfExtraction(extraction) {
  assert(extraction.schema === 'conduit-boq/p50r-pdf-extraction/v1', 'PDF helper schema changed')
  assert(extraction.input_sha256 === INPUTS.pdf.sha256, 'PDF helper input SHA-256 changed')
  assert(extraction.python_version === '3.12.13', `Python version drifted: ${extraction.python_version}`)
  assert(extraction.pdfplumber_version === '0.11.9', `pdfplumber version drifted: ${extraction.pdfplumber_version}`)
  assert(extraction.page_count === 28 && extraction.row_count === 662, 'PDF extraction count changed')
  assert(
    JSON.stringify(extraction.page_row_counts) === JSON.stringify(EXPECTED_PDF_PAGE_COUNTS),
    'PDF per-page row-count oracle changed',
  )
  assert(extraction.canonical_price_sha256 === EXPECTED_PDF_PRICE_SHA256, 'PDF canonical price digest changed')
  assert(extraction.canonical_rows_sha256 === EXPECTED_PDF_ROWS_SHA256, 'PDF canonical row digest changed')
  assert(Array.isArray(extraction.pages) && extraction.pages.length === 28, 'PDF page manifest changed')
  assert(Array.isArray(extraction.rows) && extraction.rows.length === 662, 'PDF row manifest changed')
  uniqueBy(extraction.rows, (row) => row.pdf_index, 'PDF sequence index')
  uniqueBy(extraction.rows, (row) => row.locator, 'PDF locator')

  for (const [index, page] of extraction.pages.entries()) {
    const pageNumber = index + 1
    assert(page.page === pageNumber, `PDF page manifest is out of order at ${pageNumber}`)
    assert(page.extracted_row_count === EXPECTED_PDF_PAGE_COUNTS[index], `PDF page ${pageNumber} count changed`)
    assert(page.table_count === (pageNumber === 1 ? 0 : 1), `PDF page ${pageNumber} table topology changed`)
  }
  for (const [index, row] of extraction.rows.entries()) {
    assert(row.pdf_index === index + 1, `PDF sequence is not contiguous at ${index + 1}`)
    assert(Number.isSafeInteger(row.page) && row.page >= 2 && row.page <= 28, `PDF row ${index + 1} page is invalid`)
    assert(row.table === 1 && Number.isSafeInteger(row.table_row), `PDF row ${index + 1} table locator is invalid`)
    assert(normalizeText(row.raw_unit) && normalizeText(row.normalized_unit), `PDF row ${index + 1} unit is blank`)
    assert(normalizeText(row.raw_name) && normalizeText(row.normalized_name), `PDF row ${index + 1} name is blank`)
    assert(Array.isArray(row.ambiguity_codes), `PDF row ${index + 1} ambiguity codes are invalid`)
    for (const field of ['material', 'labor', 'total']) {
      assert(Number.isSafeInteger(row[field]) && row[field] >= 0, `PDF row ${index + 1} ${field} is invalid`)
    }
    assert(row.material + row.labor === row.total && row.arithmetic_valid === true, `PDF row ${index + 1} arithmetic failed`)
  }
}

function runPass(pythonPath) {
  const opened = readExactInputs(pythonPath)
  const sqlRows = parseSqlSnapshot(opened.bytes.sql.toString('utf8'))
  const bridge = parseBridgeCsv(opened.bytes.csv)
  const workbookRows = parseWorkbook(opened.bytes.workbook)
  const authority = parseAuthority(
    opened.bytes.authority,
    opened.manifest.csv.sha256,
    workbookRows,
    sqlRows,
  )
  verifyCrossSource(sqlRows, bridge, workbookRows, authority)
  const evidence = buildEvidence({
    sqlRows,
    bridge,
    workbookRows,
    authority,
    pdfExtraction: opened.pdfExtraction,
  })
  return {
    ...opened,
    sqlRows,
    bridge,
    workbookRows,
    authority,
    evidence,
  }
}

function verifyAuthorityBaseline() {
  for (const [path, expected] of Object.entries(AUTHORITY_DOCS)) {
    const actual = sha256(readFileSync(join(ROOT, path)))
    assert(actual === expected, `tracked authority baseline changed at ${path}: ${actual}`)
  }
}

function trackedDiffSha256() {
  const result = spawnSync('git', ['diff', '--binary'], {
    cwd: ROOT,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  })
  assert(result.status === 0, 'read-only git diff check failed')
  return sha256(result.stdout)
}

function fileManifest(paths) {
  return paths.map((path) => {
    const absolute = join(ROOT, path)
    assert(lstatSync(absolute).isFile(), `${path} is not a regular file`)
    const bytes = readFileSync(absolute)
    return { path, type: 'regular_file', bytes: bytes.length, sha256: sha256(bytes) }
  })
}

function classificationCounts(rows) {
  return Object.fromEntries(
    [...new Set(rows.map((row) => row.classification))]
      .sort()
      .map((classification) => [
        classification,
        rows.filter((row) => row.classification === classification).length,
      ]),
  )
}

function makeSummary(
  pass,
  passDigests,
  reviewDigest,
  trackedDiffBefore,
  trackedDiffAfter,
  reviewComplete,
) {
  const { evidence, pdfExtraction } = pass
  const blocking = evidence.exceptionRecords.filter((item) => item.blocks_p50r)
  const result = blocking.length === 0 && reviewComplete ? 'PASS_FOR_P50D_REQUEST' : 'HOLD'
  const target = evidence.records.find((row) => row.legacy_item_code === 'ITEM-0429')
  return {
    schema: 'conduit-boq/p50r-solo-summary/v1',
    request_id: REQUEST_ID,
    generated_at: new Date().toISOString(),
    result,
    authority_window: { start: WINDOW_START, end: WINDOW_END, timezone: 'Asia/Bangkok' },
    execution_mode: 'offline_solo_operator_self_review',
    baseline: {
      base_commit: 'a12b022247d75d7e006fac890fc123e9c0a8e168',
      tracked_diff_sha256_before: trackedDiffBefore,
      tracked_diff_sha256_after: trackedDiffAfter,
      tracked_diff_unchanged: trackedDiffBefore === trackedDiffAfter,
      authority_path_hash_manifest: AUTHORITY_DOCS,
    },
    price_source: {
      issuer: 'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)',
      approval_reference: 'Owner acceptance of complete filed source under P50R-SOLO-REQ-20260821-V1',
      approval_date: '2026-08-21',
      effective_basis: 'รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน ประจำปี 2568',
      durable_archive_reference: `${INPUTS.pdf.path}#sha256=${INPUTS.pdf.sha256}`,
      precedence: 'filed PDF is price evidence; workbook is taxonomy/locator bridge; P-50D remains required',
      completeness: 'Owner approved all 28 pages as the complete filed price source for this reconciliation',
    },
    runtimes: {
      node: process.version,
      python_path: EXPECTED_PYTHON_PATH,
      python: pdfExtraction.python_version,
      pdfplumber: pdfExtraction.pdfplumber_version,
      xlsx: XLSX.version,
    },
    implementation_files: fileManifest(IMPLEMENTATION_PATHS),
    evidence_write_contract: {
      targets_absent_before_write: true,
      new_directory_only: 'docs/plans/master-catalog/evidence/p50r-solo',
      overwrite_allowed: false,
      expected_file_count: 5,
      deterministic_outputs: passDigests,
      sha256sums_covers_implementation_inputs_and_outputs_1_through_4: true,
    },
    inputs: pass.manifest,
    input_hashes_reverified_in_both_passes: true,
    counts: {
      sql_rows: 710,
      csv_rows: 728,
      csv_production_rows: 710,
      csv_workbook_candidate_rows: 18,
      workbook_rows: 708,
      authority_mappings: 710,
      authority_exclusions: 17,
      authority_groups: 65,
      pdf_pages: 28,
      pdf_rows: 662,
      canonical_identity_rows: evidence.records.length,
      aligned_pdf_workbook_rows: evidence.alignment.matches.length,
      workbook_rows_absent_from_pdf: evidence.alignment.workbookOnly.length,
      pdf_rows_without_workbook_identity: evidence.alignment.pdfOnly.length,
      alternate_optimal_alignment: evidence.alignment.alternateOptimalAlignment,
      proposed_delta_records: evidence.deltas.length,
      exceptions: evidence.exceptionRecords.length,
      blocking_exceptions: blocking.length,
      identity_confidence: Object.fromEntries(
        ['high', 'medium', 'low', 'authority_rejected'].map((confidence) => [
          confidence,
          evidence.records.filter((row) => row.identity_confidence === confidence).length,
        ]),
      ),
    },
    coverage: {
      sql: '710/710',
      csv: '728/728',
      workbook: '708/708',
      authority_mappings: '710/710',
      authority_exclusions: '17/17',
      authority_groups: '65/65',
      pdf_pages: '28/28',
      pdf_rows: '662/662',
      accounted_and_classified_union_percent: 100,
    },
    identity_review: {
      non_high_stable_match_count: evidence.records.filter(
        (row) => row.identity_status === 'stable_uuid' && row.identity_confidence !== 'high',
      ).length,
      non_high_stable_matches: evidence.records
        .filter((row) => row.identity_status === 'stable_uuid' && row.identity_confidence !== 'high')
        .map((row) => ({
          stable_identity_id: row.production_uuid,
          legacy_item_code: row.legacy_item_code,
          source_item_code: row.source_item_code,
          workbook_physical_row: row.xlsx_physical_row,
          pdf_locator: row.pdf_locator,
          identity_confidence: row.identity_confidence,
          workbook_name: row.name_xlsx_raw,
          pdf_name: row.name_pdf_raw,
          notes: row.notes,
        })),
    },
    deterministic_two_pass: {
      pass_count: 2,
      byte_identical: true,
      artifacts: passDigests,
    },
    review_binding: {
      schema: 'conduit-boq/p50r-solo-review-binding/v1',
      digest: reviewDigest,
      binds_exact_deterministic_artifacts: true,
    },
    page_review: {
      status: reviewComplete ? 'reviewed_all_28_pages' : 'pending',
      row_count_oracle: pdfExtraction.page_row_counts,
      pages: pdfExtraction.pages,
      known_description_overlay_rows: 19,
      price_arithmetic_failures: 0,
    },
    delta_review: {
      status: reviewComplete ? 'reviewed_all_delta_records' : 'pending',
      record_count: evidence.deltas.length,
      classifications: classificationCounts(evidence.deltas),
      every_record_pending_p50d: evidence.deltas.every((row) => row.decision_status === 'pending_p50d'),
      mutation_authorized: false,
    },
    exception_review: {
      status: reviewComplete ? 'reviewed_all_exception_records' : 'pending',
      record_count: evidence.exceptionRecords.length,
      blocking_count: blocking.length,
      classifications: classificationCounts(evidence.exceptionRecords),
    },
    p50_target: {
      stable_identity_id: target.production_uuid,
      legacy_item_code: target.legacy_item_code,
      target_item_code: target.target_item_code,
      frozen_price: tripleText(target._sql, 'sql'),
      filed_pdf_price: tripleText(target._pdf, 'pdf'),
      pdf_locator: target.pdf_locator,
      status: 'pending_p50d',
    },
    manual_attestation: reviewComplete
      ? {
          mode: 'authorized solo operator review for Owner',
          review_actor: 'Codex local operator under exact Owner approval',
          owner_personal_result_confirmation_claimed: false,
          all_28_pages_reviewed: true,
          every_delta_reviewed: true,
          every_exception_reviewed: true,
          source_inputs_unchanged: true,
          unexpected_tracked_changes: false,
        }
      : null,
    boundaries: {
      local_database_used: false,
      production_used: false,
      network_used: false,
      dependency_install_used: false,
      source_mutation: false,
      catalog_mutation: false,
      boq_mutation: false,
      pointer_mutation: false,
      factor_f_mutation: false,
      commit_or_push: false,
    },
    authority: {
      p50d_authorized: false,
      p50c_authorized: false,
      git_publication_authorized: false,
      p13_authorized: false,
      p14_authorized: false,
      p14c_authorized: false,
      p15_authorized: false,
      automatic_next_step: false,
    },
    next_step: 'STOP_AT_P50D_OWNER_DECISION_REQUEST',
  }
}

function parseArguments(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    assert(key?.startsWith('--') && value, 'arguments must be --name value pairs')
    values.set(key, value)
  }
  const mode = values.get('--mode')
  const python = values.get('--python')
  const view = values.get('--view') ?? 'all'
  assert(mode === 'preview' || mode === 'write', '--mode must be preview or write')
  assert(python, '--python is required')
  assert(
    ['all', 'summary', 'identity', 'deltas', 'delta-table', 'exceptions', 'exception-table'].includes(view),
    '--view is invalid',
  )
  const manualReview = values.get('--manual-review')
  const reviewDigest = values.get('--review-digest') ?? null
  if (mode === 'write') {
    assert(
      manualReview === 'OWNER_SOLO_28_PAGES_ALL_DELTAS_AND_EXCEPTIONS_REVIEWED',
      'write mode requires the exact completed manual-review token',
    )
    assert(/^[a-f0-9]{64}$/.test(reviewDigest ?? ''), 'write mode requires the reviewed preview digest')
  }
  return { mode, python, reviewComplete: mode === 'write', view, reviewDigest }
}

function comparePasses(first, second) {
  const fields = ['reconciliation', 'deltaManifest', 'exceptions']
  const digests = {}
  for (const field of fields) {
    const firstBytes = first.evidence.bytes[field]
    const secondBytes = second.evidence.bytes[field]
    assert(firstBytes.equals(secondBytes), `${field} differs between deterministic passes`)
    digests[field] = {
      pass1_sha256: sha256(firstBytes),
      pass2_sha256: sha256(secondBytes),
      byte_identical: true,
      bytes: firstBytes.length,
    }
  }
  return digests
}

function makeReviewDigest(passDigests) {
  return sha256(
    Buffer.from(
      JSON.stringify({
        schema: 'conduit-boq/p50r-solo-review-binding/v1',
        request_id: REQUEST_ID,
        reconciliation_sha256: passDigests.reconciliation.pass1_sha256,
        delta_manifest_sha256: passDigests.deltaManifest.pass1_sha256,
        exceptions_sha256: passDigests.exceptions.pass1_sha256,
      }),
      'utf8',
    ),
  )
}

function writeEvidence(first, summary) {
  const outputDirectory = join(ROOT, 'docs/plans/master-catalog/evidence/p50r-solo')
  assert(!existsSync(outputDirectory), 'P-50R evidence directory already exists; overwrite is forbidden')
  for (const path of OUTPUT_PATHS) assert(!existsSync(join(ROOT, path)), `${path} already exists`)
  const summaryBytes = jsonBytes(summary)
  const artifactBytes = new Map([
    [OUTPUT_PATHS[0], first.evidence.bytes.reconciliation],
    [OUTPUT_PATHS[1], first.evidence.bytes.deltaManifest],
    [OUTPUT_PATHS[2], first.evidence.bytes.exceptions],
    [OUTPUT_PATHS[3], summaryBytes],
  ])

  const checksumEntries = []
  for (const path of [...IMPLEMENTATION_PATHS, ...Object.values(INPUTS).map((item) => item.path)]) {
    checksumEntries.push([path, sha256(readFileSync(join(ROOT, path)))])
  }
  for (const [path, bytes] of artifactBytes) checksumEntries.push([path, sha256(bytes)])
  checksumEntries.sort(([left], [right]) => left.localeCompare(right, 'en'))
  const checksumBytes = Buffer.from(
    checksumEntries.map(([path, digest]) => `${digest}  ${path}`).join('\n') + '\n',
    'utf8',
  )

  mkdirSync(outputDirectory, { recursive: false })
  for (const path of OUTPUT_PATHS.slice(0, 4)) {
    writeFileSync(join(ROOT, path), artifactBytes.get(path), { flag: 'wx' })
  }
  writeFileSync(join(ROOT, OUTPUT_PATHS[4]), checksumBytes, { flag: 'wx' })
  return fileManifest(OUTPUT_PATHS)
}

export function reconcileSynthetic(pdfRows, workbookRows) {
  const first = alignPdfToWorkbook(structuredClone(pdfRows), structuredClone(workbookRows))
  const second = alignPdfToWorkbook(structuredClone(pdfRows), structuredClone(workbookRows))
  const canonical = (result) =>
    JSON.stringify({
      matches: result.matches.map((item) => [
        item.pdf.locator,
        item.workbook._physical_row,
        Number(item.nameSimilarity.toFixed(6)),
        item.unitEqual,
        item.ordinalEqual,
        item.confidence,
      ]),
      workbookOnly: result.workbookOnly.map((item) => item._physical_row),
      pdfOnly: result.pdfOnly.map((item) => item.locator),
      alternateOptimalAlignment: result.alternateOptimalAlignment,
    })
  assert(canonical(first) === canonical(second), 'synthetic two-pass output changed')
  return first
}

async function main() {
  const args = parseArguments(process.argv.slice(2))
  const now = Date.now()
  assert(now >= Date.parse(WINDOW_START) && now <= Date.parse(WINDOW_END), 'approval window is not active')
  verifyAuthorityBaseline()
  const trackedDiffBefore = trackedDiffSha256()
  assert(trackedDiffBefore === EXPECTED_TRACKED_DIFF_SHA256, `tracked baseline diff changed: ${trackedDiffBefore}`)
  for (const path of IMPLEMENTATION_PATHS) assert(existsSync(join(ROOT, path)), `${path} is missing`)
  if (args.mode === 'preview') {
    for (const path of OUTPUT_PATHS) assert(!existsSync(join(ROOT, path)), `${path} must be absent before preview`)
  }

  const first = runPass(args.python)
  const second = runPass(args.python)
  const passDigests = comparePasses(first, second)
  const reviewDigest = makeReviewDigest(passDigests)
  verifyAuthorityBaseline()
  const trackedDiffAfter = trackedDiffSha256()
  assert(trackedDiffAfter === trackedDiffBefore, 'tracked working-tree diff changed during reconciliation')
  const summary = makeSummary(
    first,
    passDigests,
    reviewDigest,
    trackedDiffBefore,
    trackedDiffAfter,
    args.reviewComplete,
  )

  if (args.mode === 'preview') {
    const compactDeltas = first.evidence.deltas.map((delta) => ({
      legacy_item_code: delta.legacy_item_code,
      target_item_code: delta.target_item_code,
      current: delta.current_price?.join('/') ?? null,
      workbook: delta.workbook_price?.join('/') ?? null,
      filed_pdf: delta.filed_pdf_price?.join('/') ?? null,
      filed_minus_current: delta.filed_minus_current.total,
      locator: delta.pdf_locator,
      classification: delta.classification,
    }))
    const exceptionTypes = Object.fromEntries(
      [...new Set(first.evidence.exceptionRecords.map((item) => item.type))]
        .sort()
        .map((type) => [
          type,
          {
            count: first.evidence.exceptionRecords.filter((item) => item.type === type).length,
            blocking: first.evidence.exceptionRecords.filter(
              (item) => item.type === type && item.blocks_p50r,
            ).length,
            ids: first.evidence.exceptionRecords
              .filter((item) => item.type === type)
              .map((item) => item.id),
          },
        ]),
    )
    const views = {
      all: {
        summary,
        deltas: first.evidence.deltas,
        exceptions: first.evidence.exceptionRecords,
      },
      summary: { summary },
      identity: { identity_review: summary.identity_review },
      deltas: { deltas: first.evidence.deltas },
      'delta-table': { deltas: compactDeltas },
      exceptions: { exceptions: first.evidence.exceptionRecords },
      'exception-table': { exception_types: exceptionTypes },
    }
    process.stdout.write(
      `${JSON.stringify(
        {
          schema: 'conduit-boq/p50r-preview/v1',
          request_id: REQUEST_ID,
          result: 'READY_FOR_MANUAL_REVIEW',
          ...views[args.view],
        },
        null,
        2,
      )}\n`,
    )
    return
  }

  assert(summary.result === 'PASS_FOR_P50D_REQUEST', 'blocking exception prevents evidence closeout')
  assert(args.reviewDigest === reviewDigest, 'write request is not bound to the reviewed preview artifacts')
  assert(Date.now() <= Date.parse(WINDOW_END), 'approval window expired before evidence write')
  const written = writeEvidence(first, summary)
  const finalInputs = readExactInputs(args.python)
  assert(
    JSON.stringify(finalInputs.manifest) === JSON.stringify(first.manifest),
    'an input changed after evidence write',
  )
  verifyAuthorityBaseline()
  assert(trackedDiffSha256() === trackedDiffBefore, 'tracked diff changed after evidence write')
  process.stdout.write(
    `${JSON.stringify({
      request_id: REQUEST_ID,
      result: summary.result,
      next_step: summary.next_step,
      written,
    })}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
