import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Factor-version VAT consumers', () => {
  it('uses the bound Factor VAT rate in edit, print, route allocation, and Excel labels', () => {
    const summary = readSource('components/boq/FactorFSummary.tsx')
    const printPage = readSource('app/boq/[id]/print/page.tsx')
    const excel = readSource('lib/exportBoqExcel.ts')

    expect(summary).toContain('getFactorVatRate(factorVersion)')
    expect(summary).toContain(
      'calculateVAT(multiplyFactor(grandTotalCost, factor), vatRate)',
    )
    expect(summary).toContain('calculateVAT(routeWithFactorF, vatRate)')

    expect(printPage).toContain('getFactorVatRate(factorCondition)')
    expect(printPage).toContain(
      'calculateVAT(multiplyFactor(totalCost, factor), factorVatRate)',
    )
    expect(printPage).toContain(
      'allocateToRoutes(routeCosts, factor, factorVatRate)',
    )

    expect(excel).toContain('getFactorVatPercent(factorCondition).toFixed(2)')
    expect(excel).not.toContain("'(2) ภาษีมูลค่าเพิ่ม 7.00 %'")
  })
})
