'use client'

import Link from 'next/link'
import UserAccountMenu from '@/components/auth/UserAccountMenu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft } from 'lucide-react'

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

          <UserAccountMenu />
        </div>
      </div>
    </header>
  )
}
