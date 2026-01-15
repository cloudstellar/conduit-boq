'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfileWithOrg } from '@/lib/types/auth'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/auth/callback', '/blocked']

export function useUser() {
  const [user, setUser] = useState<UserProfileWithOrg | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(id, name, code),
        department:departments(id, code, name, full_name),
        sector:sectors(id, code, name, full_name)
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as UserProfileWithOrg
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const profile = await fetchProfile(authUser.id)
      setUser(profile)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }, [supabase])

  useEffect(() => {
    let isMounted = true

    const initUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!isMounted) return

        if (authUser) {
          const profile = await fetchProfile(authUser.id)
          if (isMounted) setUser(profile)
        } else if (!isPublicPath) {
          // No auth user and not on public path - redirect to login
          const redirectTo = pathname !== '/' ? `?redirectTo=${encodeURIComponent(pathname)}` : ''
          router.replace(`/login${redirectTo}`)
        }
      } catch (error) {
        console.error('Error initializing user:', error)
        // On error, redirect to login if not on public path
        if (isMounted && !isPublicPath) {
          router.replace('/login')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (isMounted) setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          // Redirect to login on sign out
          if (!isPublicPath) {
            router.replace('/login')
          }
        } else if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed - session expired
          setUser(null)
          if (!isPublicPath) {
            router.replace('/login')
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return {
    user,
    isLoading,
    signOut,
    refreshProfile,
  }
}

