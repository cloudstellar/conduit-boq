import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove auth.getUser()
  // This refreshes the session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes
  const publicPaths = ['/login', '/auth/callback', '/blocked']
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  )

  // If not logged in and trying to access protected route, redirect to login
  if (!isPublicPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Set redirectTo for all protected paths including root
    if (request.nextUrl.pathname !== '/login') {
      url.searchParams.set('redirectTo', request.nextUrl.pathname === '/' ? '/' : request.nextUrl.pathname)
    }
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/login' && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  // Check user status and domain restrictions
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    // Check domain restriction from app_settings
    const { data: domainSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'allowed_email_domain')
      .single()

    // If domain restriction is enabled and user email doesn't match, redirect to blocked page
    if (domainSetting?.value) {
      const allowedDomain = domainSetting.value.toLowerCase()
      const userDomain = user.email?.split('@')[1]?.toLowerCase()

      if (userDomain !== allowedDomain) {
        // User's email domain doesn't match - redirect to a blocked page
        if (request.nextUrl.pathname !== '/blocked') {
          const url = request.nextUrl.clone()
          url.pathname = '/blocked'
          url.searchParams.set('reason', 'domain')
          return NextResponse.redirect(url)
        }
        return supabaseResponse
      }
    }

    // Pages allowed for pending users (can create/edit own BOQ)
    const allowedForPending = [
      '/profile',
      '/auth/callback',
      '/boq',        // BOQ list
      '/boq/create', // Create BOQ
      '/price-list', // View price list
    ]

    // Also allow BOQ edit/print pages
    const isDynamicBOQPath = request.nextUrl.pathname.match(/^\/boq\/[^/]+\/(edit|print)/)

    const isAllowedPath = allowedForPending.some(path =>
      request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
    ) || isDynamicBOQPath

    // Inactive/Suspended users can only access profile (which shows blocked message)
    if (profile && (profile.status === 'inactive' || profile.status === 'suspended')) {
      if (request.nextUrl.pathname !== '/profile') {
        const url = request.nextUrl.clone()
        url.pathname = '/profile'
        url.searchParams.set('inactive', 'true')
        return NextResponse.redirect(url)
      }
    }

    // Pending users - allow BOQ pages but redirect from admin
    if (profile && profile.status === 'pending') {
      // Block admin page for pending users
      if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/profile'
        url.searchParams.set('pending', 'true')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

