import { describe, expect, it } from 'vitest'
import {
  CanonicalCatalogDatasetError,
  type CanonicalCatalogDatasetRow,
  canonicalizeCatalogDatasetRows,
  hashCanonicalCatalogDatasetRows,
} from '../lib/master-catalog/hash/canonicalDataset'
import {
  NT_ITEM_MASTER_2568_PROFILE,
  NT_ITEM_MASTER_2568_REQUIRED_HEADERS,
} from '../lib/master-catalog/import/parser-profiles'
import {
  CatalogParserProfileError,
  type ParseContext,
  type UnknownWorkbookRow,
  type WorkbookInfo,
} from '../lib/master-catalog/import/types'

const GOLDEN_CANONICAL_ROWS: CanonicalCatalogDatasetRow[] = [
  {
    identity_id: '00000000-0000-0000-0000-000000000001',
    item_code: 'AAA-BBB-001',
    item_name: 'รายการทดสอบ 1',
    unit: 'ม.',
    material_cost: '100.00',
    labor_cost: '25.00',
    unit_cost: '125.00',
    category_code: '1.1',
    category_name: 'หมวดทดสอบ',
    work_context_code: 'AAA',
    work_context_name_th: 'กลุ่มงานทดสอบ',
    item_type_code: 'BBB',
    item_type_name_th: 'ชนิดทดสอบ',
    is_active: true,
    display_order: 1,
  },
  {
    identity_id: '00000000-0000-0000-0000-000000000002',
    item_code: 'AAA-BBB-002',
    item_name: 'รายการทดสอบ 2',
    unit: 'จุด',
    material_cost: '0.00',
    labor_cost: '75.50',
    unit_cost: '75.50',
    category_code: '1.1',
    category_name: 'หมวดทดสอบ',
    work_context_code: 'AAA',
    work_context_name_th: 'กลุ่มงานทดสอบ',
    item_type_code: 'BBB',
    item_type_name_th: 'ชนิดทดสอบ',
    is_active: false,
    display_order: 2,
  },
]

const EXPECTED_GOLDEN_JSON = `${JSON.stringify(GOLDEN_CANONICAL_ROWS)}\n`
const EXPECTED_GOLDEN_HASH =
  'sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5'

const REQUIRED_HEADERS = Object.values(NT_ITEM_MASTER_2568_REQUIRED_HEADERS)

const VALID_PARSE_CONTEXT: ParseContext = {
  categoryCodeByGroup: {
    'AAA-BBB': '1.1',
  },
  legacyItemCodeByCanonicalCode: {
    'AAA-BBB-001': 'ITEM-0001',
  },
  identityOutcomeByCanonicalCode: {
    'AAA-BBB-001': 'retain',
  },
  priceAuthorityReferenceByCanonicalCode: {
    'AAA-BBB-001': 'P-09-draft-rehearsal',
  },
}

function makeWorkbook(
  sheetOverride: Partial<WorkbookInfo['sheets'][number]> = {},
  filename = 'NT_Item_Code_Master_K_Mapping_2568.xlsx',
): WorkbookInfo {
  return {
    filename,
    sheets: [{
      name: '01_Item_Master_Final',
      headers: REQUIRED_HEADERS,
      dataRows: [makeWorkbookRow()],
      ...sheetOverride,
    }],
  }
}

function makeWorkbookRow(
  overrides: Partial<UnknownWorkbookRow> = {},
): UnknownWorkbookRow {
  return {
    item_code: 'AAA-BBB-001',
    AAA: 'AAA',
    AAA_name_th: 'กลุ่มงานทดสอบ',
    TTT: 'BBB',
    TTT_name_th: 'ชนิดทดสอบ',
    description_th: 'รายการทดสอบ 1',
    unit: 'ม.',
    material_cost: '100.00',
    labor_cost: '25.00',
    total_cost: '125.00',
    source_sheet: '01_Item_Master_Final',
    source_row: '2',
    k_formula_id: 'ignored-k-id',
    factor_f_version: 'ignored-factor-f-looking-column',
    ...overrides,
  }
}

describe('Master Catalog canonical dataset hash', () => {
  it('serializes the owner-approved golden fixture with exact key order and one LF', () => {
    const canonicalJson = canonicalizeCatalogDatasetRows([
      GOLDEN_CANONICAL_ROWS[1],
      GOLDEN_CANONICAL_ROWS[0],
    ])

    expect(canonicalJson).toBe(EXPECTED_GOLDEN_JSON)
    expect(canonicalJson.endsWith('\n')).toBe(true)
    expect(canonicalJson.endsWith('\n\n')).toBe(false)
  })

  it('reproduces the owner-approved golden SHA-256 hash', async () => {
    await expect(hashCanonicalCatalogDatasetRows(GOLDEN_CANONICAL_ROWS))
      .resolves.toBe(EXPECTED_GOLDEN_HASH)
  })

  it('normalizes text to Unicode NFC before hashing', () => {
    const composed = canonicalizeCatalogDatasetRows([{
      ...GOLDEN_CANONICAL_ROWS[0],
      item_name: 'Café',
    }])
    const decomposed = canonicalizeCatalogDatasetRows([{
      ...GOLDEN_CANONICAL_ROWS[0],
      item_name: 'Cafe\u0301',
    }])

    expect(decomposed).toBe(composed)
    expect(JSON.parse(decomposed)[0].item_name).toBe('Café')
  })

  it('rejects invalid decimal strings and duplicate item codes', () => {
    expect(() => canonicalizeCatalogDatasetRows([{
      ...GOLDEN_CANONICAL_ROWS[0],
      material_cost: '1.2',
    }])).toThrow(CanonicalCatalogDatasetError)

    expect(() => canonicalizeCatalogDatasetRows([
      GOLDEN_CANONICAL_ROWS[0],
      {
        ...GOLDEN_CANONICAL_ROWS[1],
        item_code: GOLDEN_CANONICAL_ROWS[0].item_code,
      },
    ])).toThrow(CanonicalCatalogDatasetError)
  })
})

describe('Master Catalog parser profile nt-item-master-2568 v1', () => {
  it('accepts the exact approved workbook profile', () => {
    expect(NT_ITEM_MASTER_2568_PROFILE.detect(makeWorkbook())).toEqual({
      matched: true,
      confidence: 'exact',
      errors: [],
    })
  })

  it('rejects wrong extension, missing sheet, missing headers, duplicate headers, and row overrun', () => {
    expect(NT_ITEM_MASTER_2568_PROFILE.detect(makeWorkbook({}, 'catalog.csv')).errors)
      .toContainEqual(expect.objectContaining({
        field: 'filename',
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      }))

    expect(NT_ITEM_MASTER_2568_PROFILE.detect({
      filename: 'catalog.xlsx',
      sheets: [],
    }).errors).toContainEqual(expect.objectContaining({
      field: 'sheet',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
    }))

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(makeWorkbook({
      headers: REQUIRED_HEADERS.filter((header) => header !== 'source_row'),
    })).errors).toContainEqual(expect.objectContaining({
      field: 'source_row',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
    }))

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(makeWorkbook({
      headers: [...REQUIRED_HEADERS, 'item_code'],
    })).errors).toContainEqual(expect.objectContaining({
      field: 'item_code',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
    }))

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(makeWorkbook({
      dataRows: Array.from({ length: 1501 }, () => makeWorkbookRow()),
    })).errors).toContainEqual(expect.objectContaining({
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
    }))
  })

  it('normalizes candidate rows and excludes K or Factor F-looking fields', () => {
    const normalized = NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow(),
      VALID_PARSE_CONTEXT,
    )

    expect(normalized).toEqual({
      sourceRow: 2,
      sourceReference: '01_Item_Master_Final:2',
      legacyItemCode: 'ITEM-0001',
      canonicalCode: 'AAA-BBB-001',
      workContextCode: 'AAA',
      workContextNameTh: 'กลุ่มงานทดสอบ',
      itemTypeCode: 'BBB',
      itemTypeNameTh: 'ชนิดทดสอบ',
      itemName: 'รายการทดสอบ 1',
      unit: 'ม.',
      materialCost: '100.00',
      laborCost: '25.00',
      unitCost: '125.00',
      categoryCode: '1.1',
      identityOutcome: 'retain',
      priceAuthorityReference: 'P-09-draft-rehearsal',
    })
    expect(normalized).not.toHaveProperty('k_formula_id')
    expect(normalized).not.toHaveProperty('factor_f_version')
  })

  it('rejects formula, error, numeric money, invalid sum, and missing reconciliation context', () => {
    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow({ material_cost: { kind: 'formula', formula: '1+1' } }),
      VALID_PARSE_CONTEXT,
    )).toThrow(CatalogParserProfileError)

    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow({ labor_cost: { kind: 'error', error: '#VALUE!' } }),
      VALID_PARSE_CONTEXT,
    )).toThrow(CatalogParserProfileError)

    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow({ total_cost: 125 }),
      VALID_PARSE_CONTEXT,
    )).toThrow(CatalogParserProfileError)

    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow({ total_cost: '126.00' }),
      VALID_PARSE_CONTEXT,
    )).toThrow(CatalogParserProfileError)

    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      makeWorkbookRow(),
      {},
    )).toThrow(CatalogParserProfileError)
  })
})
