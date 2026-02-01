'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import UserBadge from '@/components/auth/UserBadge'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronLeft, User, FileText, Settings, LogOut } from 'lucide-react'

interface BOQPageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
}

export default function BOQPageHeader({
  title,
  subtitle,
  backHref = '/boq',
  backLabel = 'รายการ BOQ'
}: BOQPageHeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Back + Title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref} className="flex items-center gap-1">
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            </Button>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground -mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side: User Badge + Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2 -m-2 rounded-lg">
                <UserBadge variant="compact" showDropdown />
              </Button>
            </DropdownMenuTrigger>

            {user && (
              <DropdownMenuContent align="end" className="w-72">
                {/* User Info Header */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">
                      {[user.title, user.first_name, user.last_name].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.sector?.name && (
                        <span className="text-xs text-muted-foreground">
                          {user.sector.name}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    โปรไฟล์ของฉัน
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/boq" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    รายการ BOQ
                  </Link>
                </DropdownMenuItem>

                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      จัดการระบบ
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
