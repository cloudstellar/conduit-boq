import { describe, expect, it } from 'vitest'
import {
  allocateToRoutes,
  calculateVAT,
  multiplyFactor,
  roundMoney,
  safeItemCalc,
} from '../lib/calculation'

describe('BOQ calculation rules', () => {
  it('rounds money to two decimals using the revenue rounding rule', () => {
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(10.075)).toBe(10.08)
  })

  it('multiplies Factor F without floating point drift', () => {
    expect(multiplyFactor(2738389, 1.275)).toBe(3491445.975)
  })

  it('calculates VAT from the rounded pre-VAT amount', () => {
    expect(calculateVAT(3491445.975)).toEqual({
      beforeVAT: 3491445.98,
      vat: 244401.22,
      total: 3735847.2,
    })
  })

  it('calculates line item totals with decimal quantities', () => {
    expect(safeItemCalc(2.5, 19.99)).toBe(49.975)
  })

  it('allocates route rounding differences back to the final route', () => {
    const routes = allocateToRoutes([100.01, 200.02, 300.03], 1.275)
    const routeTotal = routes.reduce((sum, route) => sum + route.total, 0)
    const grandTotal = calculateVAT(multiplyFactor(600.06, 1.275)).total

    expect(roundMoney(routeTotal)).toBe(grandTotal)
  })
})
