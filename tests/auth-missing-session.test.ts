import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServerClient } from '@supabase/ssr'
import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthSessionMissingError,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { loadCurrentAuthorization, requireActiveProfile } from '../lib/auth/authorization'
import { updateSession } from '../lib/supabase/middleware'

// Resolve the application's alias to the real helper without a test-only implementation.
vi.mock('@/lib/auth/authorization', () => import('../lib/auth/authorization'))

const SUPABASE_URL = 'https://auth-regression.example.invalid'
const SUPABASE_KEY = 'test-publishable-key'
const APP_ORIGIN = 'https://conduit.example.invalid'
const forbiddenFetch = vi.fn<typeof fetch>(async () => {
  throw new Error('Network requests are forbidden in the missing-session regression tests')
})

beforeEach(() => {
  forbiddenFetch.mockClear()
  vi.stubGlobal('fetch', forbiddenFetch)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', SUPABASE_KEY)
})

afterEach(() => {
  try {
    expect(forbiddenFetch).not.toHaveBeenCalled()
  } finally {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }
})

function noCookieClient() {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: { getAll: () => [], setAll: vi.fn() },
    global: { fetch: forbiddenFetch },
  })
  return {
    supabase,
    rpc: vi.spyOn(supabase, 'rpc'),
    from: vi.spyOn(supabase, 'from'),
  }
}

function authClient(getUser: () => Promise<{ data: { user: User | null }; error: unknown }>) {
  const rpc = vi.fn()
  const from = vi.fn()
  return {
    supabase: { auth: { getUser }, rpc, from } as unknown as SupabaseClient,
    rpc,
    from,
  }
}

describe('authorization with no session', () => {
  it('classifies the installed SSR client with no cookies as unauthenticated without profile reads', async () => {
    const { supabase, rpc, from } = noCookieClient()

    await expect(loadCurrentAuthorization(supabase)).resolves.toEqual({
      state: 'unauthenticated', user: null, profile: null, source: null,
    })

    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })

  it('keeps active-profile operations denied with 401 for an actual missing SSR session', async () => {
    const { supabase, rpc, from } = noCookieClient()

    await expect(requireActiveProfile(supabase)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED', status: 401,
    })

    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })

  it('preserves the no-user, no-error unauthenticated result', async () => {
    const { supabase, rpc, from } = authClient(async () => ({
      data: { user: null }, error: null,
    }))

    await expect(loadCurrentAuthorization(supabase)).resolves.toMatchObject({
      state: 'unauthenticated',
    })
    await expect(requireActiveProfile(supabase)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED', status: 401,
    })
    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })
})

describe('other authentication failures remain closed', () => {
  const user: User = {
    id: '11111111-1111-4111-8111-111111111111',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-09-07T00:00:00.000Z',
  }
  const namedError = new Error('Unrecognized failure')
  namedError.name = 'AuthSessionMissingError'

  it.each([
    { label: 'generic API error', error: new AuthApiError('Auth failed', 500, 'unexpected_failure'), user: null },
    { label: 'invalid token', error: new AuthApiError('Invalid token', 401, 'bad_jwt'), user: null },
    { label: 'returned transport error', error: new AuthRetryableFetchError('Network unavailable', 503), user: null },
    { label: 'unrecognized error with a matching name', error: namedError, user: null },
    { label: 'missing-session error accompanied by a user', error: new AuthSessionMissingError(), user },
  ])('does not treat $label as a signed-out session', async ({ error, user: returnedUser }) => {
    const { supabase, rpc, from } = authClient(async () => ({
      data: { user: returnedUser }, error,
    }))

    await expect(loadCurrentAuthorization(supabase)).resolves.toEqual({
      state: 'unavailable', user: returnedUser, profile: null, source: null, reason: 'auth-error',
    })
    await expect(requireActiveProfile(supabase)).rejects.toMatchObject({
      code: 'AUTHORIZATION_UNAVAILABLE', status: 403,
    })
    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })

  it.each([
    new Error('Transport unavailable'),
    new TypeError('Fetch failed'),
  ])('keeps thrown getUser failures unavailable: %s', async error => {
    const { supabase, rpc, from } = authClient(async () => { throw error })

    await expect(loadCurrentAuthorization(supabase)).resolves.toMatchObject({
      state: 'unavailable', reason: 'auth-error',
    })
    await expect(requireActiveProfile(supabase)).rejects.toMatchObject({
      code: 'AUTHORIZATION_UNAVAILABLE', status: 403,
    })
    expect(rpc).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })
})

describe('middleware with real SSR clients and no cookies', () => {
  it('allows the login page to render', async () => {
    const response = await updateSession(new NextRequest(`${APP_ORIGIN}/login`))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('redirects a private page to login with its return path', async () => {
    const response = await updateSession(new NextRequest(`${APP_ORIGIN}/boq`))

    expect(response.status).toBe(307)
    const destination = new URL(response.headers.get('location')!)
    expect(destination.origin).toBe(APP_ORIGIN)
    expect(destination.pathname).toBe('/login')
    expect(destination.searchParams.get('redirectTo')).toBe('/boq')
    expect(destination.searchParams.has('reason')).toBe(false)
  })

  it('denies a private API request with a 401 JSON response', async () => {
    const response = await updateSession(new NextRequest(`${APP_ORIGIN}/api/admin/users`))

    expect(response.status).toBe(401)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication is required' },
    })
  })

  it('continues to pass the public auth callback through middleware', async () => {
    const response = await updateSession(new NextRequest(`${APP_ORIGIN}/auth/callback?code=test-code`))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
