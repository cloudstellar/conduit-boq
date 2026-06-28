import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { exportBoqToExcel, type ExportBOQData } from '../lib/exportBoqExcel'
import type { FactorReferenceCondition } from '../lib/factorF'

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
  }
}

function makeCondition(
  versionString: string | null,
  interestPercent: number,
): FactorReferenceCondition {
  return {
    version_string: versionString,
    advance_payment_percent: 0,
    retention_percent: 0,
    loan_interest_percent: interestPercent,
    vat_percent: 7,
  }
}

async function exportAndReadWorkbook(
  boq: ExportBOQData,
  factorCondition: FactorReferenceCondition,
): Promise<Workbook> {
  await exportBoqToExcel(
    boq,
    [route],
    { [route.id]: [item] },
    boq.factor_f ?? 0,
    [{
      beforeVAT: 30_000_000 * (boq.factor_f ?? 0),
      vat: 30_000_000 * (boq.factor_f ?? 0) * 0.07,
      total: 30_000_000 * (boq.factor_f ?? 0) * 1.07,
    }],
    30_000_000 * (boq.factor_f ?? 0),
    30_000_000 * (boq.factor_f ?? 0) * 0.07,
    30_000_000 * (boq.factor_f ?? 0) * 1.07,
    { cost_million: 30, factor: boq.factor_f ?? 0 },
    { cost_million: 30, factor: boq.factor_f ?? 0 },
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

describe('BOQ Excel Factor F version labels', () => {
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
})
