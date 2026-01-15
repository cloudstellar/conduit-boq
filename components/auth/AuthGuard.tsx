'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'

interface AuthGuardProps {
  children: React.ReactNode
}

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/auth/callback']

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPath = PUBLIC_PATHS.some(
    path => pathname === path || pathname.startsWith(path)
  )

  useEffect(() => {
    // If not loading, no user, and not on public path - redirect to login
    if (!isLoading && !user && !isPublicPath) {
      const redirectTo = pathname !== '/' ? `?redirectTo=${encodeURIComponent(pathname)}` : ''
      router.replace(`/login${redirectTo}`)
    }
  }, [isLoading, user, isPublicPath, pathname, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  // If no user and not on public path, show loading (will redirect soon)
  if (!user && !isPublicPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

