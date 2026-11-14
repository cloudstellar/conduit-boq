import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createServerClient } from '@supabase/ssr'
import { GET } from '../app/auth/callback/route'

const { createClient, exchangeCodeForSession } = vi.hoisted(() => ({
  createClient: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}))

vi.mock('@/lib/auth/authorization', () => import('../lib/auth/authorization'))
vi.mock('@/lib/supabase/server', () => ({ createClient }))

const origin = 'https://conduit.example.invalid'
const user = { id: '96de534a-e549-4899-a9c4-ce4cdd34073d' }
const session = { access_token: 'test-access-token', user }

beforeEach(() => {
  vi.resetAllMocks()
  createClient.mockResolvedValue({ auth: { exchangeCodeForSession } })
  exchangeCodeForSession.mockResolvedValue({ data: { user, session }, error: null })
})

async function callback(query = '') {
  return GET(new Request(`${origin}/auth/callback${query}`))
}

function expectSafeError(response: Response) {
  expect(response.status).toBe(307)
  const location = new URL(response.headers.get('location')!, origin)
  expect(location.origin).toBe(origin)
  expect(location.pathname).toBe('/auth/callback-error')
  expect(location.search).toBe('')
  // An explicit non-credential fragment prevents the browser from inheriting
  // Auth tokens that appeared after # on the incoming link.
  expect(location.hash).toBe('#link')
  expect(response.headers.get('cache-control')).toContain('no-store')
  expect(response.headers.get('referrer-policy')).toBe('no-referrer')
}

describe('UM-A2 confirmation callback', () => {
  it.each([
    '',
    '?error=access_denied&error_description=raw-provider-text',
    '?code=mail-code&error=access_denied',
    '?code=mail-code&error_code=otp_expired',
    '?code=%20',
    '?code=mail%20code',
    '?code=first&code=second',
  ])('shows safe instructions without dispatching an unusable callback %s', async query => {
    const response = await callback(query)

    expectSafeError(response)
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('uses the same help screen when a provider rejects the link', async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'otp_expired', message: 'raw-provider-detail@example.invalid' },
    })

    expectSafeError(await callback('?code=expired-code&next=%2Fprofile'))
    expect(exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith('expired-code')
  })

  it('keeps an existing session cookie when Auth rejects a callback with a verifier', async () => {
    const cookieName = 'sb-callback-regression-auth-token'
    const existingSession = {
      ...session,
      refresh_token: 'test-refresh-token',
      expires_at: Math.floor(Date.now() / 1_000) + 600,
    }
    const setAll = vi.fn()
    const authFetch = vi.fn<typeof fetch>(async () => Response.json(
      { code: 'otp_expired', msg: 'Rejected test confirmation' },
      { status: 403 },
    ))
    const supabase = createServerClient('https://auth.example.invalid', 'test-public-key', {
      cookieOptions: { name: cookieName },
      cookies: {
        getAll: () => [
          { name: cookieName, value: JSON.stringify(existingSession) },
          { name: `${cookieName}-code-verifier`, value: JSON.stringify('test-verifier') },
        ],
        setAll,
      },
      global: { fetch: authFetch },
    })
    createClient.mockResolvedValue(supabase)

    expectSafeError(await callback('?code=old-code'))
    expect(authFetch).toHaveBeenCalledExactlyOnceWith(
      'https://auth.example.invalid/auth/v1/token?grant_type=pkce',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(setAll.mock.calls.flatMap(([cookies]) => cookies.map(({ name }: { name: string }) => name)))
      .not.toContain(cookieName)
  })

  it('uses the same help screen when the exchange fails at transport level', async () => {
    exchangeCodeForSession.mockRejectedValue(new TypeError('private transport detail'))

    expectSafeError(await callback('?code=transport-code'))
    expect(exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith('transport-code')
  })

  it('requires an actual session to continue after exchanging a code', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null, session: null }, error: null })

    expectSafeError(await callback('?code=no-session-code'))
  })

  it.each([
    ['', '/'],
    ['&next=%2Fprofile', '/profile'],
    ['&next=https%3A%2F%2Foutside.example.invalid%2Fprofile', '/'],
    ['&next=%2F%2Foutside.example.invalid%2Fprofile', '/'],
    ['&next=%2F.%2F%2Foutside.example.invalid%2Fprofile', '/'],
  ])('continues a valid exchange to its safe destination with %s', async (query, destination) => {
    const response = await callback(`?code=mail-code${query}`)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(destination)
    expect(exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith('mail-code')
  })
})
