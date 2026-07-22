import { describe, expect, it } from 'vitest'
import {
  catalogMoneyInputError,
  normalizeCatalogMoneyInput,
  sumCatalogMoneyInputs,
} from '../lib/master-catalog/admin/money'
import {
  catalogItemMutationNotice,
  catalogItemMutationSuccessHref,
  catalogWithdrawSuccessHref,
  catalogWithdrawnItemCode,
  safeCatalogItemReturnHref,
} from '../lib/master-catalog/admin/navigation'

const VERSION_ID = '00000000-0000-4000-8000-000000000001'
const IDENTITY_ID = '00000000-0000-4000-8000-000000000002'
const REQUEST_ID = '00000000-0000-4000-8000-000000000003'
const WORKSPACE = `/admin/master-catalog/versions/${VERSION_ID}`

describe('Master Catalog admin money input', () => {
  it.each([
    ['0', '0.00'],
    ['10', '10.00'],
    ['10.5', '10.50'],
    ['10.50', '10.50'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeCatalogMoneyInput(input)).toBe(expected)
  })

  it.each(['', '-1', '01', '1.', '.5', '1.001', 'abc'])('rejects %s', (input) => {
    expect(normalizeCatalogMoneyInput(input)).toBeNull()
  })

  it('adds exact decimal cents without floating-point drift', () => {
    expect(sumCatalogMoneyInputs('0.10', '0.20')).toBe('0.30')
    expect(sumCatalogMoneyInputs('9999999999999999.99', '0.01'))
      .toBe('10000000000000000.00')
  })

  it('returns Thai inline guidance', () => {
    expect(catalogMoneyInputError('', 'ค่าวัสดุ')).toBe('กรุณากรอกค่าวัสดุ')
    expect(catalogMoneyInputError('1.001', 'ค่าวัสดุ')).toContain('ทศนิยมได้ไม่เกิน 2 ตำแหน่ง')
  })
})

describe('Master Catalog withdraw navigation', () => {
  it('preserves a safe workspace query and adds a durable success notice', () => {
    expect(catalogWithdrawSuccessHref(`${WORKSPACE}?q=CIC-GIP-0`, VERSION_ID, 'CIC-GIP-016'))
      .toBe(`${WORKSPACE}?q=CIC-GIP-0&notice=item-withdrawn&itemCode=CIC-GIP-016`)
  })

  it('returns from review to the workspace and rejects external or mismatched paths', () => {
    expect(catalogWithdrawSuccessHref(`${WORKSPACE}/review`, VERSION_ID, 'CIC-GIP-016'))
      .toBe(`${WORKSPACE}?notice=item-withdrawn&itemCode=CIC-GIP-016`)
    expect(safeCatalogItemReturnHref('https://example.com', VERSION_ID)).toBe(WORKSPACE)
    expect(safeCatalogItemReturnHref('/admin/master-catalog/versions/another', VERSION_ID))
      .toBe(WORKSPACE)
  })

  it('shows only a valid item-withdrawn notice', () => {
    expect(catalogWithdrawnItemCode('item-withdrawn', 'CIC-GIP-016')).toBe('CIC-GIP-016')
    expect(catalogWithdrawnItemCode('item-withdrawn', '<script>')).toBeNull()
    expect(catalogWithdrawnItemCode('other', 'CIC-GIP-016')).toBeNull()
  })
})

describe('Master Catalog item mutation navigation', () => {
  it('preserves return context and makes a recovered retry explicit', () => {
    expect(catalogItemMutationSuccessHref(
      `${WORKSPACE}?q=CIC-GIP-012`,
      VERSION_ID,
      IDENTITY_ID,
      true,
      REQUEST_ID,
    )).toBe(
      `${WORKSPACE}/items/${IDENTITY_ID}`
      + `?returnTo=${encodeURIComponent(`${WORKSPACE}?q=CIC-GIP-012`)}`
      + `&notice=item-saved&outcome=recovered&requestId=${REQUEST_ID}`,
    )
  })

  it('accepts only the reviewed notice and a valid request id', () => {
    expect(catalogItemMutationNotice('item-saved', 'recovered', REQUEST_ID)).toEqual({
      recoveredRequest: true,
      requestId: REQUEST_ID,
    })
    expect(catalogItemMutationNotice('item-saved', null, '<script>')).toEqual({
      recoveredRequest: false,
      requestId: null,
    })
    expect(catalogItemMutationNotice('other', 'recovered', REQUEST_ID)).toBeNull()
  })
})
