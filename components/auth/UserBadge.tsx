'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/permissions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

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
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
              {fullName}
            </span>
            <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          {affiliation && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {affiliation}
            </p>
          )}
        </div>

        {showDropdown && (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    )
  }

  // Full variant
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-base font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {fullName}
            </span>
            <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          {affiliation && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {affiliation}
            </p>
          )}
          {user.email && (
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
