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
})
