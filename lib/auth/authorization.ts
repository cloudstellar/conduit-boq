import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { UserProfileWithOrg, UserRole, UserStatus } from '@/lib/types/auth'

export const CURRENT_PROFILE_RPC = 'get_my_profile_v2'
export const SIGNUP_EMAIL_RPC = 'is_signup_email_allowed'

const PROFILE_COLUMNS = [
  'id',
  'employee_id',
  'title',
  'first_name',
  'last_name',
  'position',
  'org_id',
  'department_id',
  'sector_id',
  'role',
  'email',
  'phone',
  'signature_url',
  'status',
  'created_at',
  'updated_at',
  'requested_department_id',
  'requested_sector_id',
  'approved_at',
  'approved_by',
  'rejected_at',
  'rejected_by',
  'admin_note',
  'onboarding_completed',
].join(',')

const USER_ROLES = new Set<UserRole>([
  'admin',
  'dept_manager',
  'sector_manager',
  'staff',
  'procurement',
])

const USER_STATUSES = new Set<UserStatus>([
  'active',
  'inactive',
  'suspended',
  'pending',
])

export type AuthorizationSource = 'v2' | 'legacy-read-only'

export type CurrentAuthorization =
  | { state: 'unauthenticated'; user: null; profile: null; source: null }
  | {
      state: 'active' | 'pending' | 'blocked'
      user: User
      profile: UserProfileWithOrg
      source: AuthorizationSource
    }
  | {
      state: 'unavailable'
      user: User | null
      profile: null
      source: null
      reason: 'auth-error' | 'profile-error' | 'profile-missing' | 'profile-invalid'
    }

export type PostgrestLikeError = {
  code?: string | null
  message?: string | null
  details?: string | null
  hint?: string | null
}

export class AuthorizationError extends Error {
  readonly code: 'UNAUTHENTICATED' | 'AUTHORIZATION_UNAVAILABLE' | 'ACCOUNT_NOT_ACTIVE' | 'ADMIN_REQUIRED'
  readonly status: 401 | 403

  constructor(
    code: AuthorizationError['code'],
    message: string,
    status: AuthorizationError['status'],
  ) {
    super(message)
    this.name = 'AuthorizationError'
    this.code = code
    this.status = status
  }
}

export function isExactMissingRpcError(
  error: PostgrestLikeError | null | undefined,
  functionName: string,
): boolean {
  if (error?.code !== 'PGRST202') return false

  const diagnostic = [error.message, error.details, error.hint]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase()

  return diagnostic.includes(functionName.toLowerCase())
}

export function safeInternalPath(
  value: string | null | undefined,
): string {
  if (typeof value !== 'string') return '/'

  const candidate = value.trim()
  if (
    !candidate.startsWith('/')
    || candidate.startsWith('//')
    || candidate.includes('\\')
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return '/'
  }

  return candidate
}

export function buildSameOriginRedirectUrl(
  requestUrl: string,
  destination: string,
  reason?: string,
  returnPath?: string,
): URL {
  const url = new URL(requestUrl)
  const safeDestination = new URL(safeInternalPath(destination), url.origin)

  url.pathname = safeDestination.pathname
  url.search = safeDestination.search
  url.hash = safeDestination.hash
  if (reason) url.searchParams.set('reason', reason)
  if (returnPath) url.searchParams.set('redirectTo', returnPath)
  return url
}

export type BlockedPageReason = 'domain' | 'authorization'

export function resolveBlockedPageReason(
  value: string | null | undefined,
): BlockedPageReason {
  return value === 'domain' ? 'domain' : 'authorization'
}

export function canAdminTransitionUserStatus(
  currentStatus: UserStatus,
  nextStatus: UserStatus,
): boolean {
  if (currentStatus === nextStatus || currentStatus === 'pending' || nextStatus === 'pending') {
    return false
  }

  if (currentStatus === 'active') {
    return nextStatus === 'inactive' || nextStatus === 'suspended'
  }

  return nextStatus === 'active'
}

export async function loadCurrentAuthorization(
  supabase: SupabaseClient,
): Promise<CurrentAuthorization> {
  let authResult: Awaited<ReturnType<SupabaseClient['auth']['getUser']>>

  try {
    authResult = await supabase.auth.getUser()
  } catch {
    return {
      state: 'unavailable',
      user: null,
      profile: null,
      source: null,
      reason: 'auth-error',
    }
  }

  const user = authResult.data.user
  if (authResult.error) {
    return {
      state: 'unavailable',
      user: user ?? null,
      profile: null,
      source: null,
      reason: 'auth-error',
    }
  }

  if (!user) {
    return { state: 'unauthenticated', user: null, profile: null, source: null }
  }

  let rpcResult: Awaited<ReturnType<SupabaseClient['rpc']>>
  try {
    rpcResult = await supabase.rpc(CURRENT_PROFILE_RPC)
  } catch {
    return {
      state: 'unavailable',
      user,
      profile: null,
      source: null,
      reason: 'profile-error',
    }
  }
  let source: AuthorizationSource = 'v2'
  let rawProfile: unknown

  if (rpcResult.error) {
    if (!isExactMissingRpcError(rpcResult.error, CURRENT_PROFILE_RPC)) {
      return {
        state: 'unavailable',
        user,
        profile: null,
        source: null,
        reason: 'profile-error',
      }
    }

    let fallback: { data: unknown; error: PostgrestLikeError | null }
    try {
      fallback = await supabase
        .from('user_profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', user.id)
        .maybeSingle()
    } catch {
      return {
        state: 'unavailable',
        user,
        profile: null,
        source: null,
        reason: 'profile-error',
      }
    }

    if (fallback.error) {
      return {
        state: 'unavailable',
        user,
        profile: null,
        source: null,
        reason: 'profile-error',
      }
    }

    source = 'legacy-read-only'
    rawProfile = fallback.data
  } else {
    if (!Array.isArray(rpcResult.data) || rpcResult.data.length !== 1) {
      return {
        state: 'unavailable',
        user,
        profile: null,
        source: null,
        reason: 'profile-invalid',
      }
    }
    rawProfile = rpcResult.data[0]
  }

  if (!rawProfile) {
    return {
      state: 'unavailable',
      user,
      profile: null,
      source: null,
      reason: 'profile-missing',
    }
  }

  const profile = mapProfile(rawProfile, source)
  if (!profile || profile.id !== user.id) {
    return {
      state: 'unavailable',
      user,
      profile: null,
      source: null,
      reason: 'profile-invalid',
    }
  }

  if (profile.status === 'active') {
    return { state: 'active', user, profile, source }
  }

  if (profile.status === 'pending') {
    return { state: 'pending', user, profile, source }
  }

  return { state: 'blocked', user, profile, source }
}

export async function requireActiveProfile(
  supabase: SupabaseClient,
): Promise<{ user: User; profile: UserProfileWithOrg; source: AuthorizationSource }> {
  const authorization = await loadCurrentAuthorization(supabase)

  if (authorization.state === 'unauthenticated') {
    throw new AuthorizationError('UNAUTHENTICATED', 'Authentication is required', 401)
  }
  if (authorization.state === 'unavailable') {
    throw new AuthorizationError(
      'AUTHORIZATION_UNAVAILABLE',
      'Current authorization could not be verified',
      403,
    )
  }
  if (authorization.state !== 'active') {
    throw new AuthorizationError('ACCOUNT_NOT_ACTIVE', 'An active account is required', 403)
  }

  return authorization
}

export async function requireActiveAdmin(
  supabase: SupabaseClient,
): Promise<{ user: User; profile: UserProfileWithOrg; source: AuthorizationSource }> {
  const authorization = await requireActiveProfile(supabase)
  if (authorization.profile.role !== 'admin') {
    throw new AuthorizationError('ADMIN_REQUIRED', 'An active administrator is required', 403)
  }
  return authorization
}

export async function isSignupEmailAllowed(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) return false

  try {
    const result = await supabase.rpc(SIGNUP_EMAIL_RPC, { p_email: normalizedEmail })
    if (!result.error) return result.data === true

    if (!isExactMissingRpcError(result.error, SIGNUP_EMAIL_RPC)) return false

    const fallback = await supabase
      .from('app_settings')
      .select('key,value')
      .in('key', ['restrict_email_domain', 'allowed_email_domains'])

    if (fallback.error || !fallback.data) return false

    const settings = new Map(
      fallback.data.map((row) => [String(row.key), row.value]),
    )
    const restriction = parseBooleanSetting(settings.get('restrict_email_domain'))
    if (restriction === null) return false
    if (!restriction) return true

    const domains = parseDomainSetting(settings.get('allowed_email_domains'))
    if (!domains) return false

    const domain = normalizedEmail.split('@')[1]
    return Boolean(domain && domains.has(domain))
  } catch {
    return false
  }
}

function mapProfile(
  value: unknown,
  source: AuthorizationSource,
): UserProfileWithOrg | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (
    typeof row.id !== 'string'
    || typeof row.first_name !== 'string'
    || typeof row.last_name !== 'string'
    || typeof row.role !== 'string'
    || !USER_ROLES.has(row.role as UserRole)
    || typeof row.status !== 'string'
    || !USER_STATUSES.has(row.status as UserStatus)
    || typeof row.created_at !== 'string'
    || typeof row.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: row.id,
    employee_id: nullableString(row.employee_id),
    title: nullableString(row.title),
    first_name: row.first_name,
    last_name: row.last_name,
    position: nullableString(row.position),
    org_id: nullableString(row.org_id),
    department_id: nullableString(row.department_id),
    sector_id: nullableString(row.sector_id),
    role: row.role as UserRole,
    email: nullableString(row.email),
    phone: nullableString(row.phone),
    signature_url: nullableString(row.signature_url),
    requested_department_id: nullableString(row.requested_department_id),
    requested_sector_id: nullableString(row.requested_sector_id),
    onboarding_completed: row.onboarding_completed === true,
    status: row.status as UserStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    approved_at: nullableString(row.approved_at),
    approved_by: nullableString(row.approved_by),
    rejected_at: nullableString(row.rejected_at),
    rejected_by: nullableString(row.rejected_by),
    admin_note: nullableString(row.admin_note),
    authorization_source: source,
  }
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function parseBooleanSetting(value: unknown): boolean | null {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return null
}

function parseDomainSetting(value: unknown): Set<string> | null {
  let parsed = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return null
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null
  const domains = parsed
    .filter((domain): domain is string => typeof domain === 'string')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)

  return domains.length === parsed.length && domains.length > 0
    ? new Set(domains)
    : null
}
