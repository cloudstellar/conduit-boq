import { NextResponse } from 'next/server'
import { safeInternalPath } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeInternalPath(searchParams.get('next'))

  if (code && !/\s/.test(code) && searchParams.getAll('code').length === 1
    && !searchParams.has('error') && !searchParams.has('error_code')) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        return protectRedirect(NextResponse.redirect(new URL(next, origin)))
      }
    } catch {
      // The error page offers recovery without exposing provider details.
    }
  }

  // Supply a fragment so the browser never inherits Auth tokens from the link.
  return protectRedirect(NextResponse.redirect(new URL('/auth/callback-error#link', origin)))
}

function protectRedirect(response: NextResponse) {
  const destination = new URL(response.headers.get('Location')!)
  // Next may use its bind hostname for request.url. A relative Location keeps
  // the browser on the origin that owns the PKCE cookies.
  const path = destination.pathname.startsWith('//') ? '/' : destination.pathname
  response.headers.set('Location', `${path}${destination.search}${destination.hash}`)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
