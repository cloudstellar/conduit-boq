import { describe, expect, it } from 'vitest'
import {
  getOrganizationEmailDomainError,
  normalizeOrganizationEmail,
} from '../lib/auth/email'

describe('organization email helpers', () => {
  it('normalizes a restricted username before auth submit', () => {
    expect(normalizeOrganizationEmail(' local.admin ', true))
      .toBe('local.admin@ntplc.co.th')
  })

  it('keeps a full restricted email unchanged apart from surrounding whitespace', () => {
    expect(normalizeOrganizationEmail(' local.admin@ntplc.co.th ', true))
      .toBe('local.admin@ntplc.co.th')
  })

  it('does not append an organization domain when restriction is disabled', () => {
    expect(normalizeOrganizationEmail(' local.admin ', false))
      .toBe('local.admin')
  })

  it('rejects a non-organization domain only when restriction is enabled', () => {
    expect(getOrganizationEmailDomainError('user@example.com', true))
      .toBe('domain email ไม่ถูกต้อง')
    expect(getOrganizationEmailDomainError('user@example.com', false))
      .toBeNull()
  })

  it('handles empty and malformed restricted email inputs before auth submit', () => {
    expect(normalizeOrganizationEmail('', true)).toBe('')
    expect(getOrganizationEmailDomainError('', true)).toBeNull()
    expect(getOrganizationEmailDomainError('@', true))
      .toBe('domain email ไม่ถูกต้อง')
    expect(getOrganizationEmailDomainError('local.admin@', true))
      .toBe('domain email ไม่ถูกต้อง')
    expect(getOrganizationEmailDomainError('local.admin@ntplc.co.th@example.com', true))
      .toBe('domain email ไม่ถูกต้อง')
  })

  it('accepts uppercase organization domains while still requiring the organization domain', () => {
    expect(getOrganizationEmailDomainError('LOCAL.ADMIN@NTPLC.CO.TH', true))
      .toBeNull()
    expect(normalizeOrganizationEmail(' LOCAL.ADMIN@NTPLC.CO.TH ', true))
      .toBe('LOCAL.ADMIN@NTPLC.CO.TH')
  })
})
