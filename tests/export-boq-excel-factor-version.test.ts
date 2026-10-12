import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { exportBoqToExcel, type ExportBOQData } from '../lib/exportBoqExcel'
import { calculateVAT, multiplyFactor } from '../lib/calculation'
import { getFactorVatRate, type FactorReferenceCondition } from '../lib/factorF'

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

const route = {
  id: 'route-a',
  route_order: 1,
  route_name: 'Route A',
  route_description: 'Browser smoke test route',
  construction_area: 'พื้นที่ทดสอบ Browser',
  total_material_cost: 20_000_000,
  total_labor_cost: 10_000_000,
  total_cost: 30_000_000,
}

const item = {
  id: 'item-a',
  item_order: 1,
  item_name: 'Browser smoke test item',
  quantity: 1,
  unit: 'งาน',
  material_cost_per_unit: 20_000_000,
  labor_cost_per_unit: 10_000_000,
  total_material_cost: 20_000_000,
  total_labor_cost: 10_000_000,
  total_cost: 30_000_000,
  remarks: null,
  category: 'browser-test',
}

function makeBoq(projectName: string, factor: number): ExportBOQData {
  return {
    id: projectName,
    estimator_name: 'Local admin',
    document_date: '2026-06-28',
    project_name: projectName,
    department: 'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)',
    total_cost: 30_000_000,
    factor_f: factor,
    factor_f_raw: factor,
    factor_f_lower_cost: 30_000_000,
    factor_f_upper_cost: 30_000_000,
    factor_f_lower_value: factor,
    factor_f_upper_value: factor,
    price_list_version_string: '2568.0.0',
  }
}

function makeCondition(
  versionString: string | null,
  interestPercent: number,
  vatPercent = 7,
): FactorReferenceCondition {
  return {
    version_string: versionString,
    advance_payment_percent: 0,
    retention_percent: 0,
    loan_interest_percent: interestPercent,
    vat_percent: vatPercent,
  }
}

async function exportAndReadWorkbook(
  boq: ExportBOQData,
  factorCondition: FactorReferenceCondition,
): Promise<Workbook> {
  const factor = boq.factor_f ?? 0
  const totals = calculateVAT(
    multiplyFactor(boq.total_cost, factor),
    getFactorVatRate(factorCondition),
  )

  await exportBoqToExcel(
    boq,
    [route],
    { [route.id]: [item] },
    factor,
    [totals], // This fixture has one route containing the entire BOQ cost.
    totals.beforeVAT,
    totals.vat,
    totals.total,
    { cost_million: 30, factor },
    { cost_million: 30, factor },
    factorCondition,
  )

  expect(saveAs).toHaveBeenCalledTimes(1)
  const [blob] = vi.mocked(saveAs).mock.calls[0]
  expect(blob).toBeInstanceOf(Blob)

  const workbook = new Workbook()
  const buffer = Buffer.from(await (blob as Blob).arrayBuffer())
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0])
  return workbook
}

function workbookText(workbook: Workbook): string {
  const values: string[] = []
  workbook.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        values.push(String(cell.value ?? ''))
      })
    })
  })
  return values.join('\n')
}

describe('BOQ Excel bound versions and supplied totals', () => {
  beforeEach(() => {
    vi.mocked(saveAs).mockClear()
  })

  it('uses the BOQ-bound Factor F version in generated Excel files', async () => {
    const cases = [
      {
        boq: makeBoq('2566-bound', 1.1422),
        condition: makeCondition('2566.0.0', 7),
        expected: 'ใช้ Factor F เวอร์ชัน 2566.0.0',
        forbidden: 'ใช้ Factor F เวอร์ชัน 2569.0.0',
      },
      {
        boq: makeBoq('2569-bound', 1.1405),
        condition: makeCondition('2569.0.0', 6),
        expected: 'ใช้ Factor F เวอร์ชัน 2569.0.0',
        forbidden: 'ใช้ Factor F เวอร์ชัน 2566.0.0',
      },
      {
        boq: makeBoq('legacy-unbound', 1.1422),
        condition: makeCondition(null, 7),
        expected: 'ใช้ Factor F งานก่อสร้างทาง',
        forbidden: 'ใช้ Factor F เวอร์ชัน 2569.0.0',
      },
    ]

    for (const testCase of cases) {
      vi.mocked(saveAs).mockClear()
      const workbook = await exportAndReadWorkbook(testCase.boq, testCase.condition)
      const text = workbookText(workbook)

      expect(text).toContain(testCase.expected)
      expect(text).not.toContain(testCase.forbidden)
    }
  })

  it('writes the BOQ-bound catalog version into route and summary sheets', async () => {
    const boq = makeBoq('catalog-version-bound', 1.1422)
    const workbook = await exportAndReadWorkbook(
      boq,
      makeCondition('2566.0.0', 7),
    )
    const text = workbookText(workbook)

    expect(text).toContain('บัญชีราคา: ฉบับ 2568.0.0')
    expect(text).toContain('สรุปรวม บัญชีราคา ฉบับ 2568.0.0')
  })

  it('writes the bound 8.25% VAT label and corresponding supplied numeric totals', async () => {
    const workbook = await exportAndReadWorkbook(
      makeBoq('dynamic-vat-bound', 1.1422),
      makeCondition('2570.0.0', 6, 8.25),
    )
    const text = workbookText(workbook)

    expect(text).toContain('(2) ภาษีมูลค่าเพิ่ม 8.25 %')
    expect(text).not.toContain('(2) ภาษีมูลค่าเพิ่ม 7.00 %')

    const summary = workbook.getWorksheet('สรุปรวม')!
    expect(summary).toBeDefined()
    expect(summary.getCell('B7').value).toBe('Route A')

    // Independent expected amounts: 30,000,000 × 1.1422 = 34,266,000;
    // 34,266,000 × 8.25 / 100 = 2,826,945; total = 37,092,945.
    // This checks the generated workbook preserves supplied amounts; it does
    // not exercise Print's derivation of them or database persistence.
    for (const row of [7, 8]) { // Route row and the table's total row.
      expect(summary.getCell(`F${row}`).value).toBe(34_266_000)
      expect(summary.getCell(`G${row}`).value).toBe(2_826_945)
      expect(summary.getCell(`H${row}`).value).toBe(37_092_945)
    }
    expect(summary.getCell('H10').value).toBe(34_266_000)
    expect(summary.getCell('H11').value).toBe(2_826_945)
    expect(summary.getCell('H12').value).toBe(37_092_945)
  })
})
