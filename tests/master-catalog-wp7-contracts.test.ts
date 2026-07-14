import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Master Catalog WP-7 regression contracts', () => {
  it('wires a Local-only, clean-tree, evidence-producing live harness', () => {
    const packageJson = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>
    }
    const smoke = read('scripts/smoke-master-catalog-wp7.mjs')

    expect(packageJson.scripts['db:local:smoke-master-catalog-wp7']).toBe(
      'node --env-file=.env.development.local --env-file=supabase/.env.local scripts/smoke-master-catalog-wp7.mjs',
    )
    expect(smoke).toContain('readLoopbackOrigin')
    expect(smoke).toContain('assertTrackedTreeClean()')
    expect(smoke).toContain('tmp/master-catalog/wp7-evidence')
    expect(smoke).toContain('readSecuritySnapshot()')
    expect(smoke).toContain('readBoqSnapshot()')
    expect(smoke).toContain('readFactorSnapshot()')
    expect(smoke).toContain('productionTouched: false')
    expect(smoke).not.toContain('supabase db reset')
    expect(smoke).not.toContain('db:local:bootstrap')
  })

  it('covers every hotfix suffix and the authority/rollback/role boundaries', () => {
    const smoke = read('scripts/smoke-master-catalog-wp7.mjs')

    for (const suffix of [
      ' (Main Duct)',
      ' (Riser)',
      ' (Steel Pole)',
      ' (Riser Service)',
    ]) {
      expect(smoke).toContain(`'${suffix}'`)
    }

    expect(smoke).toContain("' (Main Duct) invalid'")
    expect(smoke).toContain('assertCatalogAuthority(savedItem, fixtureItem)')
    expect(smoke).toContain('buildMixedVersionPayload')
    expect(smoke).toContain('Cross-version multi-item rejection left a partial BOQ mutation')
    expect(smoke).toContain("signIn(procurement, 'local.procurement@ntplc.co.th')")
    expect(smoke).toContain("anonymous.rpc('save_boq_with_routes'")
    expect(smoke).toContain("procurement.rpc('save_boq_with_routes'")
    expect(smoke).toContain("'invalid suffix',\n    ['P0001']")
    expect(smoke).toContain("'anonymous BOQ save',\n    ['42501']")
    expect(smoke).toContain('expectedCodes.includes(result.error.code)')
  })

  it('covers binding, duplicate, selected Factor F copy, and pointer invariants', () => {
    const smoke = read('scripts/smoke-master-catalog-wp7.mjs')

    expect(smoke).toContain('createAutoBoundBoq')
    expect(smoke).toContain('New BOQ did not bind the current catalog pointer')
    expect(smoke).toContain('New BOQ did not bind the current Factor F pointer')
    expect(smoke).toContain("{ mode: 'preserve' }")
    expect(smoke).toContain("{ mode: 'select-factor', factorVersionId: alternateFactor.id }")
    expect(smoke).toContain('assertPreservedCopy')
    expect(smoke).toContain('assertSelectedFactorCopy')
    expect(smoke).toContain("admin.rpc('restore_catalog_pointer'")
    expect(smoke).toContain('Catalog publish changed historical BOQ data or bindings')
    expect(smoke).toContain('Pointer restore repriced or rebound BOQs')
  })

  it('keeps BOQ print/export bound to exact Factor F history and fails closed', () => {
    const createPage = read('app/boq/create/page.tsx')
    const listPage = read('app/boq/page.tsx')
    const editPage = read('app/boq/[id]/edit/page.tsx')
    const printPage = read('app/boq/[id]/print/page.tsx')
    const smoke = read('scripts/smoke-master-catalog-wp7.mjs')

    expect(createPage).toContain('price_list_version_id: priceListVersionId')
    expect(createPage).toContain('factor_reference_version_id: factorReferenceVersion.id')
    expect(listPage).toContain('price_list_version_id: originalBOQ.price_list_version_id')
    expect(listPage).toContain('factor_reference_version_id: originalBOQ.factor_reference_version_id')
    expect(listPage).toContain('factor_f_raw: originalBOQ.factor_f_raw')
    expect(listPage).toContain('category: item.category')

    expect(editPage).toContain('factor_reference_version_id: currentFactorVersion.id')
    expect(editPage).toContain('factor_f_raw: null')
    expect(editPage).toContain('price_list_version_id: originalBOQ.price_list_version_id')

    expect(printPage).toContain(
      'getActiveFactorReferenceVersion(supabase, boqData.factor_reference_version_id)',
    )
    expect(printPage).toContain(
      'getFactorReferenceRowsForVersion(supabase, boqData.factor_reference_version_id)',
    )
    expect(printPage).toContain('BOQ นี้ไม่มี snapshot Factor F ที่ครบถ้วน')
    expect(printPage).toContain('factorCondition,')

    expect(smoke).toContain('verifyPrintExportDataModes')
    expect(smoke).toContain('legacyUsableSnapshot: true')
    expect(smoke).toContain('legacyMissingSnapshotFailsClosed: true')
    expect(smoke).toContain('minimumFactorReferenceCost = 5_000_000')
    expect(smoke).toContain('maximumFactorReferenceCost = 700_000_000')
    expect(smoke).toContain('if (upperCost > lowerCost) return totalCost < upperCost')
  })
})
