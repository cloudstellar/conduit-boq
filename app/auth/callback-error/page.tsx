import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const metadata = { title: 'ใช้ลิงก์นี้ไม่ได้' }

export default function CallbackErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-12">
      <Image src="/nt_logo.svg" alt="NT" width={200} height={40} className="h-12 w-auto" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 id="link" className="text-xl font-semibold">ใช้ลิงก์นี้ไม่ได้</h1>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>ลิงก์อาจหมดอายุ ถูกใช้แล้ว หรือเปิดจากเบราว์เซอร์อื่น</p>
          <p>
            ถ้าเป็นลิงก์ยืนยันการสมัคร ให้ลองเปิดลิงก์ล่าสุดในเบราว์เซอร์ที่ใช้สมัคร
            หากยืนยันแล้ว ให้เข้าสู่ระบบได้เลย หากยังติดปัญหาให้ติดต่อผู้ดูแลระบบ
          </p>
          <p>ถ้าเป็นลิงก์ตั้งรหัสผ่าน ให้ขอลิงก์ใหม่จาก “ลืมรหัสผ่าน”</p>
          <Button asChild className="min-h-11 w-full">
            <Link href="/login" prefetch={false}>กลับไปเข้าสู่ระบบ</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
