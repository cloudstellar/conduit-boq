'use client'

import type { AdminUserPresentation } from '@/lib/admin/users/presentation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { AdminAffiliationConfirmation, type AffiliationConfirmationProps } from './AdminAffiliationConfirmation'

export interface AdminUserDetailsSheetProps {
  user: AdminUserPresentation | null
  open: boolean
  loading?: boolean
  stale?: boolean
  unresolvedCommandCount?: number
  needsFreshRead?: boolean
  affiliation?: AffiliationConfirmationProps
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus?: (event: Event) => void
}

export function AdminUserDetailsSheet({ user, open, loading = false, stale = false, unresolvedCommandCount = 0, needsFreshRead = true, affiliation, onOpenChange, onCloseAutoFocus }: AdminUserDetailsSheetProps) {
  const details = user ? <AdminUserDetailsContent user={user} loading={loading} stale={stale}
    unresolvedCommandCount={unresolvedCommandCount} needsFreshRead={needsFreshRead} /> : null
  return <Sheet open={open && user !== null} onOpenChange={onOpenChange}>
    <SheetContent side="right" showCloseButton={false} className="w-full min-w-0 gap-0 sm:max-w-lg motion-reduce:animate-none! motion-reduce:transition-none!" onCloseAutoFocus={onCloseAutoFocus} data-admin-user-details="true">
      <SheetHeader className="shrink-0 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle>ข้อมูลผู้ใช้งาน</SheetTitle>
            <SheetDescription className="mt-1">รายละเอียดจากทะเบียนผู้ใช้งานที่ได้รับสิทธิ์</SheetDescription>
          </div>
          <SheetClose asChild><Button variant="outline" className="min-h-11 shrink-0" aria-label="ปิดรายละเอียดผู้ใช้งาน">ปิด</Button></SheetClose>
        </div>
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" aria-busy={loading}>
        {open && user && affiliation ? (
          <AdminAffiliationConfirmation key={`${affiliation.actorId}:${user.id}`} {...affiliation} user={user}>{details}</AdminAffiliationConfirmation>
        ) : details}
      </div>
    </SheetContent>
  </Sheet>
}

/** Shared content keeps static rendering assertions honest about data, not portal behavior. */
export function AdminUserDetailsContent({ user, loading = false, stale = false, unresolvedCommandCount = 0, needsFreshRead = true }: {
  user: AdminUserPresentation
  loading?: boolean
  stale?: boolean
  unresolvedCommandCount?: number
  needsFreshRead?: boolean
}) {
  const unresolvedWarning = unresolvedCommandCount > 0 ? (
    <Alert role="note" aria-label="คำสั่งก่อนหน้าของบัญชีนี้ยังยืนยันผลไม่ได้" data-admin-details-unresolved="true">
      <AlertDescription>
        <p>ยังยืนยันผลคำสั่งก่อนหน้าของบัญชีนี้ไม่ได้ {unresolvedCommandCount} รายการ</p>
        <p>{needsFreshRead || stale || loading
          ? 'กรุณาโหลดสถานะล่าสุดให้สำเร็จก่อนทบทวนคำสั่งใหม่'
          : 'อ่านสถานะล่าสุดแล้ว แต่ยังยืนยันผลคำสั่งเดิมไม่ได้ การดำเนินการถัดไปเป็นคำสั่งใหม่'}</p>
      </AlertDescription>
    </Alert>
  ) : null
  if (loading) return <div className="flex flex-col gap-4">
    {unresolvedWarning}
    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">กำลังโหลดข้อมูลล่าสุด</p>
    <Skeleton className="h-8 w-3/4" aria-hidden="true" />
    <Skeleton className="h-24 w-full" aria-hidden="true" />
    <Skeleton className="h-24 w-full" aria-hidden="true" />
  </div>

  return <div className="flex min-w-0 flex-col gap-6" data-admin-details-stale={stale || undefined}>
    {unresolvedWarning}
    {stale ? <Alert><AlertDescription>
      ข้อมูลที่แสดงเป็นข้อมูลก่อนหน้า ยังโหลดข้อมูลล่าสุดไม่สำเร็จ รายละเอียดนี้อ่านอย่างเดียว
    </AlertDescription></Alert> : null}
    <div>
      <p className="break-words text-base font-semibold">{user.displayName}</p>
      <p className="mt-1 break-all text-sm text-muted-foreground">{user.email || 'ไม่มีข้อมูลอีเมลในรายการที่อ่านได้'}</p>
    </div>
    <section aria-label="ข้อมูลบัญชี" className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">บัญชี</h3>
      <dl className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
        <dt className="text-muted-foreground">บทบาท</dt><dd className="break-words">{user.roleLabel}</dd>
        <dt className="text-muted-foreground">สถานะบัญชี</dt><dd><Badge variant="outline" className="max-w-full whitespace-normal">{user.statusLabel}</Badge></dd>
        {user.pendingLabel ? <><dt className="text-muted-foreground">การส่งข้อมูล</dt><dd className="break-words">{user.pendingLabel}</dd></> : null}
      </dl>
    </section>
    <DetailsAffiliation title="สังกัดจริง" group={user.actualAffiliation} />
    <DetailsAffiliation title="สังกัดที่ยื่นขอ" group={user.requestedAffiliation} />
    <section aria-label="ข้อมูลที่บันทึกในทะเบียน" className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">ข้อมูลที่บันทึกในทะเบียน</h3>
      <dl className="flex min-w-0 flex-col gap-4">
        {user.metadata.map((field, index) => <div key={`${index}-${field.label}`}>
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 break-words text-sm">{field.value}</dd>
        </div>)}
      </dl>
    </section>
  </div>
}

function DetailsAffiliation({ title, group }: {
  title: string
  group: AdminUserPresentation['actualAffiliation']
}) {
  return <section aria-label={title} className="flex min-w-0 flex-col gap-2">
    <h3 className="text-sm font-semibold">{title}</h3>
    <div className="flex flex-col gap-1 text-sm" data-affiliation-state={group.state}>
      {group.lines.map((line, index) => <p key={`${index}-${line}`} className="break-words">{line}</p>)}
    </div>
  </section>
}
