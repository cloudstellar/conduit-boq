import { describe, expect, it } from 'vitest'
import { calculateInterpolatedFactorFromRefs, isFactorSnapshotUsable } from '../lib/factorF'

describe('Factor F interpolation', () => {
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

  it('accepts a saved 30-40M snapshot that brackets the job cost', () => {
    expect(isFactorSnapshotUsable(33_000_000, {
      factor_f: 1.1394,
      factor_f_lower_cost: 30_000_000,
      factor_f_upper_cost: 40_000_000,
      factor_f_lower_value: 1.1422,
      factor_f_upper_value: 1.1359,
    })).toBe(true)
  })
})
