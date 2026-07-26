import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('catalog version visibility for general users', () => {
  it('derives dashboard and price-list labels from the active pointer', () => {
    const dashboardHook = readSource('lib/hooks/useDashboardData.ts')
    const dashboard = readSource('app/page.tsx')
    const actionHub = readSource('components/dashboard/ActionHub.tsx')
    const stats = readSource('components/dashboard/StatsGrid.tsx')
    const priceList = readSource('app/price-list/page.tsx')

    expect(dashboardHook).toContain('priceListVersionString: defaultVersion.versionString')
    expect(dashboardHook).toContain('priceListYear: defaultVersion.year')
    expect(dashboard).toContain('stats?.priceListYear')
    expect(actionHub).toContain('catalogVersion')
    expect(stats).toContain('stats.priceListVersionString')
    expect(priceList).toContain('context="current"')

    for (const source of [dashboard, actionHub, stats, priceList]) {
      expect(source).not.toContain('2568')
    }
  })

  it('shows and preserves the exact BOQ-bound catalog version', () => {
    const createPage = readSource('app/boq/create/page.tsx')
    const editPage = readSource('app/boq/[id]/edit/page.tsx')
    const printPage = readSource('app/boq/[id]/print/page.tsx')
    const excelExport = readSource('lib/exportBoqExcel.ts')

    expect(createPage).toContain('context="new-boq"')
    expect(createPage).toContain('latestCatalogVersion.id !== catalogVersion.id')
    expect(editPage).toContain('getPriceListVersionSummary')
    expect(editPage).toContain('context="bound-boq"')
    expect(printPage).toContain('function CatalogVersionStamp')
    expect(printPage).toContain('ฉบับบัญชีราคา {versionString}')
    expect(printPage).toContain('งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก')
    expect(printPage).toContain('price_list_version_string: catalogVersion.versionString')
    expect(printPage).toContain('factorSupplementPageCount')
    expect(printPage).toContain('previewTotalPages')
    expect(excelExport).toContain('บัญชีราคา: ฉบับ ${boq.price_list_version_string')
  })
})
