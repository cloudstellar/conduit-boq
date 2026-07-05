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

  if (!trimmedEmail.includes('@')) {
    return null
  }

  const emailParts = trimmedEmail.split('@')
  const [localPart, emailDomain] = emailParts

  if (
    emailParts.length !== 2
    || !localPart
    || !emailDomain
    || emailDomain.toLowerCase() !== ORGANIZATION_EMAIL_DOMAIN
  ) {
    return 'domain email ไม่ถูกต้อง'
  }

  return null
}
