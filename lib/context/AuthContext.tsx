'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { AuthContextType } from '@/lib/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut, refreshProfile } = useUser()

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

