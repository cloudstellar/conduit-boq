import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfileWithOrg, UserRole, UserStatus } from '../lib/types/auth'
import {
  buildSameOriginRedirectUrl,
  canAdminTransitionUserStatus,
  isExactMissingRpcError,
  isSignupEmailAllowed,
  loadCurrentAuthorization,
  requireActiveProfile,
  resolveBlockedPageReason,
  safeInternalPath,
} from '../lib/auth/authorization'
import { can } from '../lib/permissions'
import { loadCatalogAdminGate } from '../lib/master-catalog/admin/readModel'
import { DELETE } from '../app/api/admin/users/[id]/route'

const USER_ID = '11111111-1111-4111-8111-111111111111'

function profile(
  status: UserStatus = 'active',
  role: UserRole = 'staff',
): UserProfileWithOrg {
  return {
    id: USER_ID,
    employee_id: null,
    title: null,
    first_name: 'Test',
    last_name: 'User',
    position: null,
    org_id: null,
    department_id: null,
    sector_id: null,
    role,
    email: 'test@ntplc.co.th',
    phone: null,
    signature_url: null,
    status,
    created_at: '2026-08-27T00:00:00.000Z',
    updated_at: '2026-08-27T00:00:00.000Z',
    requested_department_id: null,
    requested_sector_id: null,
    approved_at: null,
    approved_by: null,
    rejected_at: null,
    rejected_by: null,
    admin_note: null,
    onboarding_completed: true,
  }
}

function client(options: {
  profileRpc?: { data: unknown; error: unknown }
  legacyProfile?: { data: unknown; error: unknown }
  signupRpc?: { data: unknown; error: unknown }
  catalogGateRpc?: { data: unknown; error: unknown }
  settings?: { data: unknown; error: unknown }
  onFrom?: (table: string) => void
} = {}): SupabaseClient {
  const queryFor = (table: string) => {
    const result = table === 'user_profiles'
      ? options.legacyProfile ?? { data: null, error: null }
      : options.settings ?? { data: null, error: null }
    const query = {
      select: () => query,
      eq: () => query,
      in: () => query,
      maybeSingle: async () => result,
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
    }
    return query
  }

  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: USER_ID, email: 'test@ntplc.co.th' } },
        error: null,
      }),
    },
    rpc: async (name: string) => {
      if (name === 'is_signup_email_allowed') {
        return options.signupRpc ?? { data: true, error: null }
      }
      if (name === 'get_my_catalog_admin_gate') {
        return options.catalogGateRpc ?? {
          data: [{ admin_enabled: false, configuration_valid: true }],
          error: null,
        }
      }
      return options.profileRpc ?? { data: [profile()], error: null }
    },
    from: (table: string) => {
      options.onFrom?.(table)
      return queryFor(table)
    },
  } as unknown as SupabaseClient
}

describe('P-49 application authorization contract', () => {
  it('accepts only same-origin absolute application paths after login', () => {
    expect(safeInternalPath('/boq/123?tab=routes')).toBe('/boq/123?tab=routes')
    expect(safeInternalPath(' /profile ')).toBe('/profile')

    for (const unsafePath of [
      null,
      '',
      'javascript:alert(1)',
      'https://example.com',
      '//example.com/path',
      '/\\example.com/path',
      '/boq\nSet-Cookie: unsafe=true',
    ]) {
      expect(safeInternalPath(unsafePath)).toBe('/')
    }
  })

  it('preserves query parameters in same-origin middleware redirects', () => {
    const redirect = buildSameOriginRedirectUrl(
      'https://conduit.example/login?redirectTo=%2F',
      '/boq/123?tab=routes',
    )

    expect(redirect.href).toBe('https://conduit.example/boq/123?tab=routes')
  })

  it('maps only the explicit domain reason and keeps every other block generic', () => {
    expect(resolveBlockedPageReason('domain')).toBe('domain')

    for (const reason of ['authorization', 'suspended', '', null, undefined]) {
      expect(resolveBlockedPageReason(reason)).toBe('authorization')
    }
  })

  it('binds the auth callback and blocked page to the shared safe helpers', async () => {
    const [callback, blockedPage] = await Promise.all([
      readFile('app/auth/callback/route.ts', 'utf8'),
      readFile('app/blocked/page.tsx', 'utf8'),
    ])

    expect(callback).toContain("safeInternalPath(searchParams.get('next'))")
    expect(callback).toContain('NextResponse.redirect(new URL(next, origin))')
    expect(callback).not.toContain('`${origin}${next}`')

    expect(blockedPage).toContain('useSearchParams()')
    expect(blockedPage).toContain("resolveBlockedPageReason(searchParams.get('reason'))")
    expect(blockedPage).toContain('<Suspense')
    expect(blockedPage).toContain('<BlockedContent />')
    expect(blockedPage).not.toContain("searchParams.get('reason') === 'suspended'")
  })

  it('allows only the bounded administrator status transitions', () => {
    expect(canAdminTransitionUserStatus('active', 'inactive')).toBe(true)
    expect(canAdminTransitionUserStatus('active', 'suspended')).toBe(true)
    expect(canAdminTransitionUserStatus('inactive', 'active')).toBe(true)
    expect(canAdminTransitionUserStatus('suspended', 'active')).toBe(true)

    expect(canAdminTransitionUserStatus('inactive', 'suspended')).toBe(false)
    expect(canAdminTransitionUserStatus('suspended', 'inactive')).toBe(false)
    expect(canAdminTransitionUserStatus('pending', 'active')).toBe(false)
    expect(canAdminTransitionUserStatus('active', 'pending')).toBe(false)
    expect(canAdminTransitionUserStatus('active', 'active')).toBe(false)
  })

  it('recognizes only the exact missing-new-RPC PostgREST result', () => {
    expect(isExactMissingRpcError(
      { code: 'PGRST202', message: 'Could not find public.get_my_profile_v2' },
      'get_my_profile_v2',
    )).toBe(true)
    expect(isExactMissingRpcError(
      { code: '42501', message: 'permission denied for get_my_profile_v2' },
      'get_my_profile_v2',
    )).toBe(false)
    expect(isExactMissingRpcError(
      { code: 'PGRST202', message: 'Could not find another_function' },
      'get_my_profile_v2',
    )).toBe(false)
  })

  it('uses the bounded current-profile RPC and classifies pending separately', async () => {
    const authorization = await loadCurrentAuthorization(client({
      profileRpc: { data: [profile('pending')], error: null },
    }))

    expect(authorization.state).toBe('pending')
    expect(authorization.source).toBe('v2')
  })

  it('requires exactly one row from the bounded current-profile RPC', async () => {
    for (const data of [
      null,
      profile(),
      [],
      [profile(), profile()],
    ]) {
      await expect(loadCurrentAuthorization(client({
        profileRpc: { data, error: null },
      }))).resolves.toMatchObject({
        state: 'unavailable',
        reason: 'profile-invalid',
      })
    }
  })

  it('uses a read-only profile fallback only for exact PGRST202', async () => {
    let profileReads = 0
    const authorization = await loadCurrentAuthorization(client({
      profileRpc: {
        data: null,
        error: { code: 'PGRST202', message: 'Could not find get_my_profile_v2' },
      },
      legacyProfile: { data: profile(), error: null },
      onFrom: (table) => {
        if (table === 'user_profiles') profileReads += 1
      },
    }))

    expect(authorization.state).toBe('active')
    expect(authorization.source).toBe('legacy-read-only')
    expect(profileReads).toBe(1)
  })

  it('does not fall back on permission, transport, or unknown profile errors', async () => {
    let profileReads = 0
    const authorization = await loadCurrentAuthorization(client({
      profileRpc: {
        data: null,
        error: { code: '42501', message: 'permission denied for get_my_profile_v2' },
      },
      legacyProfile: { data: profile(), error: null },
      onFrom: (table) => {
        if (table === 'user_profiles') profileReads += 1
      },
    }))

    expect(authorization.state).toBe('unavailable')
    expect(profileReads).toBe(0)
  })

  it('classifies thrown transports and unknown role/status values as unavailable', async () => {
    const throwingRpcClient = {
      ...client(),
      rpc: async () => { throw new Error('transport unavailable') },
    } as unknown as SupabaseClient
    await expect(loadCurrentAuthorization(throwingRpcClient)).resolves.toMatchObject({
      state: 'unavailable',
      reason: 'profile-error',
    })

    const baseFallbackClient = client({
      profileRpc: {
        data: null,
        error: { code: 'PGRST202', message: 'Could not find get_my_profile_v2' },
      },
    })
    const throwingFallbackClient = {
      ...baseFallbackClient,
      from: () => {
        const query = {
          select: () => query,
          eq: () => query,
          maybeSingle: async () => { throw new Error('fallback unavailable') },
        }
        return query
      },
    } as unknown as SupabaseClient
    await expect(loadCurrentAuthorization(throwingFallbackClient)).resolves.toMatchObject({
      state: 'unavailable',
      reason: 'profile-error',
    })

    for (const invalidProfile of [
      { ...profile(), role: 'owner' },
      { ...profile(), status: 'unknown' },
    ]) {
      await expect(loadCurrentAuthorization(client({
        profileRpc: { data: [invalidProfile], error: null },
      }))).resolves.toMatchObject({
        state: 'unavailable',
        reason: 'profile-invalid',
      })
    }
  })

  it('requires active status and denies pending business permissions', async () => {
    await expect(requireActiveProfile(client({
      profileRpc: { data: [profile('pending')], error: null },
    }))).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_ACTIVE',
      status: 403,
    })

    const pendingProfile = {
      ...profile('pending'),
      organization: null,
      department: null,
      sector: null,
    }
    expect(can(pendingProfile, 'read', 'profile')).toBe(true)
    expect(can(pendingProfile, 'create', 'boq')).toBe(false)
    expect(can(pendingProfile, 'read', 'price_list')).toBe(false)
  })

  it('fails signup configuration closed except for an exact missing-RPC fallback', async () => {
    expect(await isSignupEmailAllowed(client({
      signupRpc: { data: null, error: { code: '500', message: 'configuration failed' } },
    }), 'test@ntplc.co.th')).toBe(false)

    expect(await isSignupEmailAllowed(client({
      signupRpc: {
        data: null,
        error: { code: 'PGRST202', message: 'Could not find is_signup_email_allowed' },
      },
      settings: {
        data: [
          { key: 'restrict_email_domain', value: 'true' },
          { key: 'allowed_email_domains', value: '["ntplc.co.th"]' },
        ],
        error: null,
      },
    }), 'test@ntplc.co.th')).toBe(true)

    const throwingSignupClient = {
      ...client(),
      rpc: async () => { throw new Error('transport unavailable') },
    } as unknown as SupabaseClient
    await expect(isSignupEmailAllowed(
      throwingSignupClient,
      'test@ntplc.co.th',
    )).resolves.toBe(false)

    const baseSignupFallbackClient = client({
      signupRpc: {
        data: null,
        error: { code: 'PGRST202', message: 'Could not find is_signup_email_allowed' },
      },
    })
    const throwingSignupFallbackClient = {
      ...baseSignupFallbackClient,
      from: () => {
        const query = {
          select: () => query,
          in: () => { throw new Error('fallback unavailable') },
        }
        return query
      },
    } as unknown as SupabaseClient
    await expect(isSignupEmailAllowed(
      throwingSignupFallbackClient,
      'test@ntplc.co.th',
    )).resolves.toBe(false)
  })

  it('uses the bounded catalog gate without reading raw settings', async () => {
    const rawTables: string[] = []
    const gate = await loadCatalogAdminGate(client({
      profileRpc: { data: [profile('active', 'admin')], error: null },
      catalogGateRpc: {
        data: [{ admin_enabled: true, configuration_valid: true }],
        error: null,
      },
      onFrom: (table) => rawTables.push(table),
    }))

    expect(gate.state).toBe('enabled')
    expect(rawTables).not.toContain('app_settings')
  })

  it('returns the stable hard-delete denial before any privileged path exists', async () => {
    const response = await DELETE()
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      code: 'USER_HARD_DELETE_DISABLED',
    })

    const source = await readFile('app/api/admin/users/[id]/route.ts', 'utf8')
    expect(source).not.toContain('serviceRole')
    expect(source).not.toContain('deleteUser')
    expect(source).not.toContain("from('user_profiles')")
  })

  it('keeps API denials JSON and the pending route allowlist narrow', async () => {
    const middleware = await readFile('lib/supabase/middleware.ts', 'utf8')
    expect(middleware).toContain('NextResponse.json')
    expect(middleware).toContain("const PENDING_PATHS = ['/pending', '/profile', '/blocked']")
    expect(middleware).toContain("'ACCOUNT_PENDING'")
    expect(middleware).toContain('cookieSource.cookies.getAll()')
    expect(middleware).not.toContain("'/boq'")
    expect(middleware).not.toContain("'/price-list'")
  })

  it('keeps unsafe client-side clone paths disabled and pending UX consistent', async () => {
    const [boqList, boqEdit, profilePage, loginPage, useUser, adminPage] = await Promise.all([
      readFile('app/boq/page.tsx', 'utf8'),
      readFile('app/boq/[id]/edit/page.tsx', 'utf8'),
      readFile('app/profile/page.tsx', 'utf8'),
      readFile('app/login/page.tsx', 'utf8'),
      readFile('lib/hooks/useUser.ts', 'utf8'),
      readFile('app/admin/page.tsx', 'utf8'),
    ])

    expect(boqList).not.toContain('handleDuplicate')
    expect(boqList).toContain('copyDisabledReason')
    expect(boqEdit).not.toContain('handleCreateFactorCopy')
    expect(boqEdit).toContain('FACTOR_COPY_DISABLED_REASON')
    expect(profilePage).toContain('<Link href="/pending">')
    expect(loginPage).toContain("safeInternalPath(searchParams.get('redirectTo'))")
    expect(useUser).not.toContain(".eq('is_active', true).maybeSingle()")
    expect(adminPage).toContain("authorization.source !== 'v2'")
    expect(adminPage).toContain('adminMutationsEnabled')
    expect(adminPage).toContain('/login?redirectTo=/admin')
    expect(adminPage).not.toContain(".select('id,name').eq('is_active', true)")
  })
})
