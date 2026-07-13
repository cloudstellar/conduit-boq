'use client'

import Link from 'next/link'
import { FileText, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { getRoleBadgeColor, getRoleLabel } from '@/lib/permissions'
import UserBadge from '@/components/auth/UserBadge'
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

export default function UserAccountMenu() {
  const { user, signOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="min-h-11 min-w-11 p-2 sm:-m-2"
          aria-label="เปิดเมนูบัญชีผู้ใช้"
        >
          <UserBadge variant="compact" showDropdown />
        </Button>
      </DropdownMenuTrigger>

      {user ? (
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold">
                {[user.title, user.first_name, user.last_name].filter(Boolean).join(' ')}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                {user.sector?.name ? (
                  <span className="text-xs text-muted-foreground">{user.sector.name}</span>
                ) : null}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex cursor-pointer items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              โปรไฟล์ของฉัน
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/boq" className="flex cursor-pointer items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              รายการ BOQ
            </Link>
          </DropdownMenuItem>
          {user.role === 'admin' ? (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex cursor-pointer items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                จัดการระบบ
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  )
}
