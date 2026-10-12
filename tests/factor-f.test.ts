import { describe, expect, it } from 'vitest'
import {
  calculateInterpolatedFactorFromRefs,
  findFactorBracketRefs,
  formatFactorReferenceCondition,
  getFactorVatPercent,
  getFactorVatRate,
  isFactorSnapshotUsable,
} from '../lib/factorF'

describe('Factor F interpolation', () => {
  describe('bracket selection with changing reference factors', () => {
    const refs = [
      { cost_million: 5, factor: 1.2 },
      { cost_million: 10, factor: 1.1 },
      { cost_million: 20, factor: 1.05 },
      { cost_million: 700, factor: 1.01 },
    ]

    // Midpoints use the mean of the two reference factors; costs outside the
    // table use its endpoint. Expected values are independent of the helper.
    it.each([
      { label: 'below the 5M floor', cost: 4_000_000, lower: 0, upper: 0, resultLower: 5_000_000, resultUpper: 5_000_000, factor: 1.2 },
      { label: 'exactly 5M', cost: 5_000_000, lower: 0, upper: 1, resultLower: 5_000_000, resultUpper: 5_000_000, factor: 1.2 },
      { label: 'halfway between 5M and 10M', cost: 7_500_000, lower: 0, upper: 1, resultLower: 5_000_000, resultUpper: 10_000_000, factor: 1.15 },
      { label: 'exactly 10M', cost: 10_000_000, lower: 1, upper: 2, resultLower: 10_000_000, resultUpper: 10_000_000, factor: 1.1 },
      { label: 'halfway between 10M and 20M', cost: 15_000_000, lower: 1, upper: 2, resultLower: 10_000_000, resultUpper: 20_000_000, factor: 1.075 },
      { label: 'exactly 20M', cost: 20_000_000, lower: 2, upper: 3, resultLower: 20_000_000, resultUpper: 20_000_000, factor: 1.05 },
      { label: 'exactly the 700M ceiling', cost: 700_000_000, lower: 3, upper: null, resultLower: 700_000_000, resultUpper: 700_000_000, factor: 1.01 },
      { label: 'above the 700M ceiling', cost: 800_000_000, lower: 3, upper: null, resultLower: 700_000_000, resultUpper: 700_000_000, factor: 1.01 },
    ])('selects bounds and calculates the factor $label', ({ cost, lower, upper, resultLower, resultUpper, factor }) => {
      const { lowerFactorRef, upperFactorRef } = findFactorBracketRefs(cost, refs)

      expect(lowerFactorRef).toBe(refs[lower])
      expect(upperFactorRef).toBe(upper === null ? null : refs[upper])
      expect(calculateInterpolatedFactorFromRefs(cost, lowerFactorRef, upperFactorRef)).toMatchObject({
        factor,
        lowerCost: resultLower,
        upperCost: resultUpper,
      })
    })

    it('truncates the selected 5M–10M interpolation at 6,172,800 to 1.1765', () => {
      const { lowerFactorRef, upperFactorRef } = findFactorBracketRefs(6_172_800, refs)

      expect(lowerFactorRef).toBe(refs[0])
      expect(upperFactorRef).toBe(refs[1])

      const result = calculateInterpolatedFactorFromRefs(6_172_800, lowerFactorRef, upperFactorRef)

      // The cost advances 23.456% across a factor drop of 0.1: the decrease
      // is 0.023456, leaving 1.176544 before truncation to four decimals.
      expect(result?.raw).toBeCloseTo(1.176544, 12)
      expect(result).toMatchObject({
        factor: 1.1765,
        lowerCost: 5_000_000,
        upperCost: 10_000_000,
        lowerValue: 1.2,
        upperValue: 1.1,
        exactMatch: false,
      })
    })

    it.each([
      { label: 'references are unavailable', cost: 7_500_000, references: [] },
      { label: 'the total cost is zero', cost: 0, references: refs },
    ])('returns no bracket or calculated factor when $label', ({ cost, references }) => {
      const { lowerFactorRef, upperFactorRef } = findFactorBracketRefs(cost, references)

      expect(lowerFactorRef).toBeNull()
      expect(upperFactorRef).toBeNull()
      expect(calculateInterpolatedFactorFromRefs(cost, lowerFactorRef, upperFactorRef)).toBeNull()
    })
  })

  it('derives VAT from the bound Factor version and keeps 7% only as the legacy fallback', () => {
    expect(getFactorVatPercent({ vat_percent: 8.25 })).toBe(8.25)
    expect(getFactorVatRate({ vat_percent: 8.25 })).toBe(0.0825)
    expect(getFactorVatPercent(null)).toBe(7)
    expect(getFactorVatRate(undefined)).toBe(0.07)
    expect(() => getFactorVatRate({ vat_percent: -1 })).toThrow(
      'Invalid Factor F VAT percentage',
    )
  })

  it('interpolates a 30-40 million job from the table factor column and truncates to 4 decimals', () => {
    const result = calculateInterpolatedFactorFromRefs(
      34_444_444.444444,
      { cost_million: 30, factor: 1.1422 },
      { cost_million: 40, factor: 1.1359 },
    )

    expect(result).toMatchObject({
      factor: 1.1394,
      lowerCost: 30_000_000,
      upperCost: 40_000_000,
      lowerValue: 1.1422,
      upperValue: 1.1359,
    })
  })

  it('does not invent a default factor when the reference table is unavailable', () => {
    const result = calculateInterpolatedFactorFromRefs(
      33_000_000,
      null,
      { cost_million: 40, factor: 1.1359 },
    )

    expect(result).toBeNull()
  })

  it('rejects a saved 5M snapshot for a 30-40M job', () => {
    expect(isFactorSnapshotUsable(33_000_000, {
      factor_f: 1.275,
      factor_f_lower_cost: 5_000_000,
      factor_f_upper_cost: 5_000_000,
      factor_f_lower_value: 1.275,
      factor_f_upper_value: 1.275,
    })).toBe(false)
  })

  it('accepts a saved 5M floor snapshot for jobs below the first reference bracket', () => {
    expect(isFactorSnapshotUsable(4_968_750, {
      factor_f: 1.275,
      factor_f_lower_cost: 5_000_000,
      factor_f_upper_cost: 5_000_000,
      factor_f_lower_value: 1.275,
      factor_f_upper_value: 1.275,
    })).toBe(true)
  })

  it('rejects non-minimum exact snapshots when the job is below the saved bracket', () => {
    expect(isFactorSnapshotUsable(6_000_000, {
      factor_f: 1.2518,
      factor_f_lower_cost: 10_000_000,
      factor_f_upper_cost: 10_000_000,
      factor_f_lower_value: 1.2518,
      factor_f_upper_value: 1.2518,
    })).toBe(false)
  })

  it('accepts a saved 700M ceiling snapshot for jobs above the last reference bracket', () => {
    expect(isFactorSnapshotUsable(1_201_013_647, {
      factor_f: 1.0744,
      factor_f_lower_cost: 700_000_000,
      factor_f_upper_cost: 700_000_000,
      factor_f_lower_value: 1.0744,
      factor_f_upper_value: 1.0744,
    })).toBe(true)
  })

  it('accepts a saved 30-40M snapshot that brackets the job cost', () => {
    expect(isFactorSnapshotUsable(33_000_000, {
      factor_f: 1.1394,
      factor_f_lower_cost: 30_000_000,
      factor_f_upper_cost: 40_000_000,
      factor_f_lower_value: 1.1422,
      factor_f_upper_value: 1.1359,
    })).toBe(true)
  })

  it('formats the bound version for print/export conditions', () => {
    const formatConditionForVersion = (versionString: string, interestPercent: number) =>
      formatFactorReferenceCondition({
        version_string: versionString,
        advance_payment_percent: 0,
        retention_percent: 0,
        loan_interest_percent: interestPercent,
        vat_percent: 7,
      })

    expect(formatConditionForVersion('2566.0.0', 7)).toBe(
      'Factor F เวอร์ชัน 2566.0.0 งานก่อสร้างทาง เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 7.00 % ต่อปี, ค่าภาษีมูลค่าเพิ่ม 7.00 %'
    )

    expect(formatConditionForVersion('2569.0.0', 6)).toBe(
      'Factor F เวอร์ชัน 2569.0.0 งานก่อสร้างทาง เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 6.00 % ต่อปี, ค่าภาษีมูลค่าเพิ่ม 7.00 %'
    )
  })

  it('does not claim the latest version when a legacy BOQ has no bound version', () => {
    expect(formatFactorReferenceCondition({
      advance_payment_percent: 0,
      retention_percent: 0,
      loan_interest_percent: 7,
      vat_percent: 7,
    })).toBe(
      'Factor F งานก่อสร้างทาง เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 7.00 % ต่อปี, ค่าภาษีมูลค่าเพิ่ม 7.00 %'
    )
  })
})
