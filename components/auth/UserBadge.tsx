'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/permissions'

interface UserBadgeProps {
  variant?: 'compact' | 'full'
  showDropdown?: boolean
}

export default function UserBadge({ variant = 'compact', showDropdown = false }: UserBadgeProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="hidden sm:block">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 bg-gray-200 rounded mt-1"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'
  const fullName = [user.title, user.first_name, user.last_name].filter(Boolean).join(' ')
  
  // Build affiliation string
  const sectorName = user.sector?.name || user.sector?.full_name
  const deptName = user.department?.name || user.department?.full_name
  const affiliation = [sectorName, deptName].filter(Boolean).join(' • ')

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-sm font-medium shadow-sm">
          {initials}
        </div>
        
        {/* Info */}
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
              {fullName}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
          {affiliation && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {affiliation}
            </p>
          )}
        </div>

        {showDropdown && (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-base font-medium shadow">
        {initials}
      </div>
      
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            {fullName}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
        {affiliation && (
          <p className="text-xs text-gray-600 mt-0.5">
            <svg className="inline h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {affiliation}
          </p>
        )}
        {user.email && (
          <p className="text-xs text-gray-400 truncate">
            {user.email}
          </p>
        )}
      </div>
    </div>
  )
}

