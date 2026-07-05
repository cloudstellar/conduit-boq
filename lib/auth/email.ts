const ORGANIZATION_EMAIL_DOMAIN = 'ntplc.co.th'

export function normalizeOrganizationEmail(
  email: string,
  isEmailRestricted: boolean,
): string {
  const trimmedEmail = email.trim()

  if (!isEmailRestricted || !trimmedEmail || trimmedEmail.includes('@')) {
    return trimmedEmail
  }

  return `${trimmedEmail}@${ORGANIZATION_EMAIL_DOMAIN}`
}

export function getOrganizationEmailDomainError(
  email: string,
  isEmailRestricted: boolean,
): string | null {
  if (!isEmailRestricted) {
    return null
  }

  const trimmedEmail = email.trim()
  const emailDomain = trimmedEmail.split('@')[1]?.toLowerCase()

  if (
    trimmedEmail.includes('@')
    && emailDomain
    && emailDomain !== ORGANIZATION_EMAIL_DOMAIN
  ) {
    return 'domain email ไม่ถูกต้อง'
  }

  return null
}
