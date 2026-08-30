import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Master Catalog Phase 2 application contracts', () => {
  it('binds new BOQs and restores preserve-copy through the atomic RPC contract', () => {
    const createPage = readSource('app/boq/create/page.tsx')
    const listPage = readSource('app/boq/page.tsx')
    const duplicateClient = readSource('lib/boq/duplicate.ts')

    expect(createPage).toContain('price_list_version_id: latestCatalogVersion.id')
    expect(listPage).toContain('duplicateBOQAtomic')
    expect(listPage).toContain("mode: 'preserve'")
    expect(listPage).toContain('factor_reference_version_id')
    expect(duplicateClient).toContain("DUPLICATE_BOQ_RPC = 'duplicate_boq_atomic'")
    expect(duplicateClient).toContain('p_source_boq_id: request.sourceBOQId')
    expect(duplicateClient).toContain('p_request_id: request.requestId')
    expect(duplicateClient).toContain(
      'p_expected_source_updated_at: request.expectedSourceUpdatedAt',
    )
    expect(listPage).toContain('expectedSourceUpdatedAt: copyIntent.boq.updated_at')
    expect(listPage).toContain('เปิดหน้าแก้ไขเพื่อเลือกเวอร์ชัน Factor F')
    expect(listPage).not.toContain("from('boq_items').insert")
    expect(listPage).not.toContain("from('boq_routes').insert")
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

    expect(dashboard).toContain('getActiveDefaultPriceListVersion')
    expect(dashboard).toContain('const priceItemsCount = priceItemsRes.count ?? 0')
    expect(dashboard).not.toMatch(/682|priceCategoriesCount = 52/)
    expect(priceListPage).toContain('getActiveDefaultPriceListVersion')
  })
})
