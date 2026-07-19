import { Workbook } from 'exceljs'
import { describe, expect, it } from 'vitest'
import {
  CatalogWorkbookParseError,
  parseCatalogWorkbookInfoFromXlsx,
} from '../lib/master-catalog/import/workbookAdapter'
import {
  NT_ITEM_MASTER_2568_PROFILE,
  NT_ITEM_MASTER_2568_REQUIRED_HEADERS,
} from '../lib/master-catalog/import/parser-profiles'
import {
  CatalogParserProfileError,
  type ParseContext,
} from '../lib/master-catalog/import/types'

const HEADERS = [
  'item_id',
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
  'k_formula_id',
  'factor_f_version',
]

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
}

async function workbookToArrayBuffer(workbook: Workbook): Promise<ArrayBuffer> {
  const buffer = await workbook.xlsx.writeBuffer() as unknown

  if (buffer instanceof ArrayBuffer) {
    return buffer
  }

  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer
  }

  throw new Error('Unexpected workbook buffer type')
}

async function createWorkbookBuffer(options: {
  sheetName?: string
  headers?: readonly string[]
  rows?: readonly unknown[][]
  hiddenSheet?: boolean
} = {}): Promise<ArrayBuffer> {
  const workbook = new Workbook()
  const sheet = workbook.addWorksheet(options.sheetName ?? '01_Item_Master_Final')

  if (options.hiddenSheet) {
    sheet.state = 'hidden'
  }

  sheet.addRow(options.headers ?? HEADERS)

  for (const row of options.rows ?? [validWorkbookRow()]) {
    sheet.addRow(row)
  }

  return workbookToArrayBuffer(workbook)
}

function validWorkbookRow(overrides: Record<string, unknown> = {}): unknown[] {
  const rowByHeader: Record<string, unknown> = {
    item_id: 'source-only-id',
    item_code: 'AAA-BBB-001',
    AAA: 'AAA',
    AAA_name_th: 'กลุ่มงานทดสอบ',
    TTT: 'BBB',
    TTT_name_th: 'ชนิดทดสอบ',
    description_th: 'รายการทดสอบ 1',
    unit: 'ม.',
    material_cost: 100,
    labor_cost: 25,
    total_cost: 125,
    source_sheet: '01_Item_Master_Final',
    source_row: 2,
    k_formula_id: 'ignored-k',
    factor_f_version: 'ignored-factor-f-looking-column',
    ...overrides,
  }

  return HEADERS.map((header) => rowByHeader[header])
}

describe('Master Catalog browser XLSX workbook adapter', () => {
  it('parses an approved synthetic workbook into WorkbookInfo and source metadata only', async () => {
    const arrayBuffer = await createWorkbookBuffer()
    const parsed = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'production-derived-readonly-fixture.xlsx',
      sizeBytes: arrayBuffer.byteLength,
      arrayBuffer,
    })

    expect(parsed.source).toMatchObject({
      filename: 'production-derived-readonly-fixture.xlsx',
      sizeBytes: arrayBuffer.byteLength,
    })
    expect(parsed.source.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(parsed).not.toHaveProperty('arrayBuffer')
    expect(parsed).not.toHaveProperty('rawWorkbook')

    expect(parsed.workbookInfo.filename).toBe('production-derived-readonly-fixture.xlsx')
    expect(parsed.workbookInfo.sheets).toHaveLength(1)
    expect(parsed.workbookInfo.sheets[0].headers).toEqual(HEADERS)
    expect(parsed.workbookInfo.sheets[0].dataRows).toHaveLength(1)

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(parsed.workbookInfo)).toEqual({
      matched: true,
      confidence: 'exact',
      errors: [],
    })

    const normalized = NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      parsed.workbookInfo.sheets[0].dataRows[0],
      VALID_PARSE_CONTEXT,
    )

    expect(normalized).toMatchObject({
      canonicalCode: 'AAA-BBB-001',
      workContextNameTh: 'กลุ่มงานทดสอบ',
      itemTypeNameTh: 'ชนิดทดสอบ',
      materialCost: '100.00',
      laborCost: '25.00',
      unitCost: '125.00',
    })
    expect(normalized).not.toHaveProperty('k_formula_id')
    expect(normalized).not.toHaveProperty('factor_f_version')
  })

  it('replaces mapped workbook authority fields and treats an unmapped valid code as a candidate add', async () => {
    const arrayBuffer = await createWorkbookBuffer({
      rows: [
        validWorkbookRow({
          description_th: 'ข้อความที่ไฟล์พยายามเปลี่ยน',
          material_cost: '999.00',
          labor_cost: '1.00',
          total_cost: '1000.00',
        }),
        validWorkbookRow({
          item_code: 'AAA-BBB-998',
          source_row: 3,
          description_th: 'รายการทดสอบ Local เท่านั้น',
        }),
      ],
    })
    const parsed = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'p38-parser-trust-boundary.xlsx',
      sizeBytes: arrayBuffer.byteLength,
      arrayBuffer,
    })
    const context: ParseContext = {
      authoritativeRowBySourceCode: {
        'AAA-BBB-001': {
          sourceRow: 1,
          sourceReference: 'production:ITEM-0001',
          sourceItemCode: 'AAA-BBB-001',
          legacyItemCode: 'ITEM-0001',
          canonicalCode: 'AAA-BBB-001',
          targetIdentityId: '00000000-0000-4000-8000-000000000001',
          workContextCode: 'AAA',
          workContextNameTh: 'กลุ่มงานที่รับรอง',
          itemTypeCode: 'BBB',
          itemTypeNameTh: 'ชนิดที่รับรอง',
          itemName: 'ชื่อจาก Production authority',
          unit: 'ม.',
          materialCost: '100.00',
          laborCost: '25.00',
          unitCost: '125.00',
          categoryCode: '1.1',
          categoryId: '00000000-0000-4000-8000-000000000002',
          codeGroupId: '00000000-0000-4000-8000-000000000003',
          identityOutcome: 'recode',
          priceAuthorityReference: null,
        },
      },
      categoryCodeByGroup: { 'AAA-BBB': '1.1' },
      categoryIdByCode: { '1.1': '00000000-0000-4000-8000-000000000002' },
      codeGroupIdByGroup: { 'AAA-BBB': '00000000-0000-4000-8000-000000000003' },
    }
    const [mappedRow, candidateRow] = parsed.workbookInfo.sheets[0].dataRows
      .map((row) => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(row, context))

    expect(mappedRow).toMatchObject({
      sourceRow: 2,
      sourceReference: '01_Item_Master_Final:2',
      itemName: 'ชื่อจาก Production authority',
      materialCost: '100.00',
      laborCost: '25.00',
      unitCost: '125.00',
      identityOutcome: 'recode',
    })
    expect(candidateRow).toMatchObject({
      sourceRow: 3,
      canonicalCode: 'AAA-BBB-998',
      itemName: 'รายการทดสอบ Local เท่านั้น',
      identityOutcome: 'candidate_add',
      categoryId: '00000000-0000-4000-8000-000000000002',
      codeGroupId: '00000000-0000-4000-8000-000000000003',
    })
  })

  it('passes exact profile detection failures through WorkbookInfo for wrong sheet/header and row overrun', async () => {
    const wrongSheetBuffer = await createWorkbookBuffer({ sheetName: 'Wrong Sheet' })
    const wrongSheet = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: wrongSheetBuffer.byteLength,
      arrayBuffer: wrongSheetBuffer,
    })

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(wrongSheet.workbookInfo).errors)
      .toContainEqual(expect.objectContaining({
        field: 'sheet',
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      }))

    const missingHeaderBuffer = await createWorkbookBuffer({
      headers: HEADERS.filter((header) => header !== NT_ITEM_MASTER_2568_REQUIRED_HEADERS.sourceRow),
    })
    const missingHeader = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: missingHeaderBuffer.byteLength,
      arrayBuffer: missingHeaderBuffer,
    })

    expect(NT_ITEM_MASTER_2568_PROFILE.detect(missingHeader.workbookInfo).errors)
      .toContainEqual(expect.objectContaining({
        field: 'source_row',
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      }))

    const rowOverrunBuffer = await createWorkbookBuffer({
      rows: Array.from({ length: 1501 }, (_, index) => validWorkbookRow({
        item_code: `AAA-BBB-${String(index + 1).padStart(3, '0')}`,
        source_row: index + 2,
      })),
    })
    const rowOverrun = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: rowOverrunBuffer.byteLength,
      arrayBuffer: rowOverrunBuffer,
    })

    expect(rowOverrun.workbookInfo.sheets[0].dataRows).toHaveLength(1501)
    expect(NT_ITEM_MASTER_2568_PROFILE.detect(rowOverrun.workbookInfo).errors)
      .toContainEqual(expect.objectContaining({
        code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      }))
  })

  it('preserves formula and error cells as rejected workbook cell kinds without evaluating them', async () => {
    const formulaBuffer = await createWorkbookBuffer({
      rows: [validWorkbookRow({
        material_cost: { formula: '1+1', result: 2 },
      })],
    })
    const formulaWorkbook = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: formulaBuffer.byteLength,
      arrayBuffer: formulaBuffer,
    })
    const formulaRow = formulaWorkbook.workbookInfo.sheets[0].dataRows[0]

    expect(formulaRow.material_cost).toEqual({
      kind: 'formula',
      formula: '1+1',
    })
    expect(() => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(
      formulaRow,
      VALID_PARSE_CONTEXT,
    )).toThrow(CatalogParserProfileError)

    const errorBuffer = await createWorkbookBuffer({
      rows: [validWorkbookRow({
        labor_cost: { error: '#VALUE!' },
      })],
    })
    const errorWorkbook = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: errorBuffer.byteLength,
      arrayBuffer: errorBuffer,
    })

    expect(errorWorkbook.workbookInfo.sheets[0].dataRows[0].labor_cost).toEqual({
      kind: 'error',
      error: '#VALUE!',
    })
  })

  it('rejects raw file metadata mismatch, oversized files, and hidden-only workbooks before profile acceptance', async () => {
    const arrayBuffer = await createWorkbookBuffer()

    await expect(parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: arrayBuffer.byteLength + 1,
      arrayBuffer,
    })).rejects.toBeInstanceOf(CatalogWorkbookParseError)

    await expect(parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: arrayBuffer.byteLength,
      arrayBuffer,
    }, {
      maxRawFileBytes: arrayBuffer.byteLength - 1,
    })).rejects.toMatchObject({
      diagnostics: [expect.objectContaining({ code: 'IMPORT_FILE_TOO_LARGE' })],
    })

    await expect(parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: 0,
      arrayBuffer: new ArrayBuffer(0),
    })).rejects.toMatchObject({
      diagnostics: [expect.objectContaining({ field: 'sizeBytes' })],
    })

    const hiddenBuffer = await createWorkbookBuffer({ hiddenSheet: true })
    const hiddenWorkbook = await parseCatalogWorkbookInfoFromXlsx({
      filename: 'catalog.xlsx',
      sizeBytes: hiddenBuffer.byteLength,
      arrayBuffer: hiddenBuffer,
    })

    expect(hiddenWorkbook.workbookInfo.sheets).toHaveLength(0)
    expect(NT_ITEM_MASTER_2568_PROFILE.detect(hiddenWorkbook.workbookInfo).matched)
      .toBe(false)
  })
})
