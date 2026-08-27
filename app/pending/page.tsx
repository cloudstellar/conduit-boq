'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PendingPage() {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace('/login')
    else if (user.status === 'active') router.replace('/')
  }, [isLoading, router, user])

  if (isLoading || !user || user.status !== 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="size-8 text-amber-700" aria-hidden="true" />
          </div>
          <CardTitle>บัญชีอยู่ระหว่างรอการอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            ระหว่างนี้คุณสามารถตรวจสอบและส่งข้อมูลโปรไฟล์สำหรับการอนุมัติได้
            แต่ยังไม่สามารถเปิด Dashboard, BOQ, บัญชีราคา, Factor F, งานพิมพ์
            งานส่งออก หรือหน้าผู้ดูแลระบบ
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/profile">
                <UserRound className="mr-2 size-4" aria-hidden="true" />
                ตรวจสอบโปรไฟล์
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              ออกจากระบบ
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            หากต้องการสอบถามสถานะ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
