'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/permissions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'

export default function UserMenu() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">เข้าสู่ระบบ</Link>
      </Button>
    )
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'
  const fullName = [user.title, user.first_name, user.last_name].filter(Boolean).join(' ')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-1 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <Badge variant="secondary" className={`w-fit mt-1 ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            โปรไฟล์
          </Link>
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
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
    </DropdownMenu>
  )
}
