import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Master Catalog Phase 2 application contracts', () => {
  it('binds new and duplicated BOQs to the correct catalog version', () => {
    const createPage = readSource('app/boq/create/page.tsx')
    const listPage = readSource('app/boq/page.tsx')

    expect(createPage).toContain('price_list_version_id: priceListVersionId')
    expect(listPage).toContain('price_list_version_id: originalBOQ.price_list_version_id')
    expect(listPage).toContain('category: item.category')
  })

  it('filters both item-search queries by the BOQ catalog version', () => {
    const itemSearch = readSource('components/boq/ItemSearch.tsx')

    expect(itemSearch.match(/\.eq\('version_id', priceListVersionId\)/g)).toHaveLength(2)
    expect(itemSearch).toContain('ไม่พบเวอร์ชันราคากลางของใบประมาณราคานี้')
  })

  it('reads category snapshots without a dynamic price-list join', () => {
    const editor = readSource('components/boq/MultiRouteEditor.tsx')
    const printPage = readSource('app/boq/[id]/print/page.tsx')
    const editPage = readSource('app/boq/[id]/edit/page.tsx')

    expect(editor).not.toContain('price_list(category)')
    expect(printPage).not.toContain('price_list(category)')
    expect(editPage).toContain('category: item.category')
  })

  it('filters shared catalog views through the fail-closed default lookup', () => {
    const dashboard = readSource('lib/hooks/useDashboardData.ts')
    const priceListPage = readSource('app/price-list/page.tsx')

    expect(dashboard).toContain('getActiveDefaultPriceListVersionId')
    expect(dashboard).toContain('const priceItemsCount = priceItemsRes.count ?? 0')
    expect(dashboard).not.toMatch(/682|priceCategoriesCount = 52/)
    expect(priceListPage).toContain('getActiveDefaultPriceListVersionId')
  })
})
