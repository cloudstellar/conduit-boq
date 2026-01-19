'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfileWithOrg } from '@/lib/types/auth'

export function useUser() {
  const [user, setUser] = useState<UserProfileWithOrg | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfileWithOrg | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organization:organizations!user_profiles_org_id_fkey(id, name, code),
          department:departments!user_profiles_department_id_fkey(id, code, name, full_name),
          sector:sectors!user_profiles_sector_id_fkey(id, code, name, full_name)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('useUser: Error fetching profile:', error)
        return null
      }

      return data as UserProfileWithOrg
    } catch (error) {
      console.error('useUser: Error in fetchProfile:', error)
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      }
    } catch (err) {
      console.error('useUser: Error refreshing profile:', err)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }, [supabase])

  useEffect(() => {
    let isMounted = true

    // Handle any auth event that has a session
    const handleSession = async (session: { user: { id: string } } | null) => {
      if (!isMounted) return

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (isMounted) {
          setUser(profile)
          setIsLoading(false)
        }
      } else {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsLoading(false)
          window.location.href = '/login'
        } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Use setTimeout to avoid deadlock - let the callback return first
          setTimeout(() => {
            if (isMounted) {
              handleSession(session)
            }
          }, 0)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return {
    user,
    isLoading,
    signOut,
    refreshProfile,
  }
}

