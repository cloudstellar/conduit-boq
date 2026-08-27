'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfileWithOrg } from '@/lib/types/auth'
import { loadCurrentAuthorization } from '@/lib/auth/authorization'

export function useUser() {
  const [user, setUser] = useState<UserProfileWithOrg | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (): Promise<UserProfileWithOrg | null> => {
    try {
      const authorization = await loadCurrentAuthorization(supabase)
      if (authorization.state !== 'active' && authorization.state !== 'pending') return null

      const profile = authorization.profile
      const [organizationResult, departmentResult, sectorResult] = await Promise.all([
        profile.org_id
          ? supabase.from('organizations').select('id,name,code').eq('id', profile.org_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        profile.department_id
          ? supabase.from('departments').select('id,code,name,full_name').eq('id', profile.department_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        profile.sector_id
          ? supabase.from('sectors').select('id,code,name,full_name').eq('id', profile.sector_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      return {
        ...profile,
        organization: organizationResult.error ? null : organizationResult.data,
        department: departmentResult.error ? null : departmentResult.data,
        sector: sectorResult.error ? null : sectorResult.data,
      } as UserProfileWithOrg
    } catch {
      console.warn('useUser: Profile request failed; treating session as signed out')
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchProfile()
      setUser(profile)
    } catch (err) {
      console.warn('useUser: Error refreshing profile:', err instanceof Error ? err.message : err)
    }
  }, [fetchProfile])

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
        const profile = await fetchProfile()
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
