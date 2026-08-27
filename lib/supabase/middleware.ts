import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  buildSameOriginRedirectUrl,
  isSignupEmailAllowed,
  loadCurrentAuthorization,
  safeInternalPath,
  type CurrentAuthorization,
} from '@/lib/auth/authorization'

const PUBLIC_AUTH_PATHS = ['/auth/callback']
const PENDING_PATHS = ['/pending', '/profile', '/blocked']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname
  const isApi = pathname === '/api' || pathname.startsWith('/api/')

  if (PUBLIC_AUTH_PATHS.some((path) => isPathWithin(pathname, path))) {
    return supabaseResponse
  }

  const authorization = await loadCurrentAuthorization(supabase)

  if (pathname === '/login') {
    if (authorization.state === 'unauthenticated') return supabaseResponse
    if (authorization.state === 'pending') return redirectTo(request, supabaseResponse, '/pending')
    if (authorization.state === 'active') {
      const requestedPath = safeInternalPath(request.nextUrl.searchParams.get('redirectTo'))
      return redirectTo(request, supabaseResponse, requestedPath)
    }
    return redirectTo(request, supabaseResponse, '/blocked', 'authorization')
  }

  if (pathname === '/blocked') {
    if (
      authorization.state === 'unauthenticated'
      || authorization.state === 'unavailable'
      || authorization.state === 'blocked'
    ) {
      return supabaseResponse
    }

    const emailAllowed = await isSignupEmailAllowed(
      supabase,
      authorization.user.email ?? '',
    )
    if (!emailAllowed) return supabaseResponse
    return redirectTo(
      request,
      supabaseResponse,
      authorization.state === 'pending' ? '/pending' : '/',
    )
  }

  const denial = authorizationDenial(authorization)
  if (denial) {
    if (isApi) return apiDenial(supabaseResponse, denial.code, denial.message, denial.status)
    if (denial.status === 401) return redirectTo(request, supabaseResponse, '/login', undefined, pathname)
    return redirectTo(request, supabaseResponse, '/blocked', 'authorization')
  }

  // The denial branch above is exhaustive; this explicit guard keeps the
  // security invariant and TypeScript narrowing local to the request path.
  if (authorization.state !== 'active' && authorization.state !== 'pending') {
    if (isApi) {
      return apiDenial(supabaseResponse, 'AUTHORIZATION_UNAVAILABLE', 'Current authorization could not be verified', 403)
    }
    return redirectTo(request, supabaseResponse, '/blocked', 'authorization')
  }

  const emailAllowed = await isSignupEmailAllowed(
    supabase,
    authorization.user.email ?? '',
  )
  if (!emailAllowed) {
    if (isApi) {
      return apiDenial(supabaseResponse, 'EMAIL_NOT_ALLOWED', 'The account email is not allowed', 403)
    }
    return redirectTo(request, supabaseResponse, '/blocked', 'domain')
  }

  if (authorization.state === 'pending') {
    const allowed = PENDING_PATHS.some((path) => isPathWithin(pathname, path))
    if (!allowed) {
      if (isApi) {
        return apiDenial(supabaseResponse, 'ACCOUNT_PENDING', 'The account is pending approval', 403)
      }
      return redirectTo(request, supabaseResponse, '/pending')
    }
    return supabaseResponse
  }

  if (isAdminPath(pathname) && authorization.profile.role !== 'admin') {
    if (isApi) return apiDenial(supabaseResponse, 'ADMIN_REQUIRED', 'Administrator access is required', 403)
    return redirectTo(request, supabaseResponse, '/')
  }

  return supabaseResponse
}

function authorizationDenial(
  authorization: CurrentAuthorization,
): { code: string; message: string; status: 401 | 403 } | null {
  if (authorization.state === 'unauthenticated') {
    return {
      code: 'UNAUTHENTICATED',
      message: 'Authentication is required',
      status: 401,
    }
  }
  if (authorization.state === 'unavailable') {
    return {
      code: 'AUTHORIZATION_UNAVAILABLE',
      message: 'Current authorization could not be verified',
      status: 403,
    }
  }
  if (authorization.state === 'blocked') {
    return {
      code: 'ACCOUNT_NOT_ACTIVE',
      message: 'The account is not active',
      status: 403,
    }
  }
  return null
}

function apiDenial(
  cookieSource: NextResponse,
  code: string,
  message: string,
  status: 401 | 403,
) {
  const response = NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
  cookieSource.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })
  return response
}

function redirectTo(
  request: NextRequest,
  cookieSource: NextResponse,
  destination: string,
  reason?: string,
  returnPath?: string,
) {
  const url = buildSameOriginRedirectUrl(request.url, destination, reason, returnPath)
  const response = NextResponse.redirect(url)
  cookieSource.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })
  return response
}

function isPathWithin(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`)
}

function isAdminPath(pathname: string): boolean {
  return isPathWithin(pathname, '/admin') || isPathWithin(pathname, '/api/admin')
}
