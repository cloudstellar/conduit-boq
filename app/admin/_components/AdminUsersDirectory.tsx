'use client'

import { useSyncExternalStore, type ReactNode, type Ref } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { UserRole, UserStatus } from '@/lib/types/auth'
import type { AdminUserPresentation } from '@/lib/admin/users/presentation'
import { canAdminTransitionUserStatus } from '@/lib/auth/authorization'
import { getRoleLabel } from '@/lib/permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const roles: UserRole[] = ['admin', 'dept_manager', 'sector_manager', 'staff', 'procurement']
const statuses: Array<{ value: UserStatus; label: string }> = [
  { value: 'active', label: 'ใช้งาน' },
  { value: 'pending', label: 'รอการอนุมัติ' },
  { value: 'inactive', label: 'ไม่ใช้งาน' },
  { value: 'suspended', label: 'ระงับ' },
]

export interface AdminUsersDirectoryProps {
  rows: AdminUserPresentation[]
  actorId: string | null
  source: 'v2' | 'legacy-read-only' | 'unknown'
  pagination?: 'cursor' | 'legacy-bounded'
  catalogEntry?: ReactNode
  canMutate: boolean
  loading?: boolean
  stale?: boolean
  error?: string | null
  notice?: string | null
  announcement?: string
  mutationBusy?: boolean
  unresolvedTargetIds?: ReadonlySet<string>
  needsFreshReadTargetIds?: ReadonlySet<string>
  unresolvedCommandCount?: number
  unresolvedAccountCount?: number
  editingUserId?: string | null
  hasPrevious?: boolean
  hasNext?: boolean
  onRefresh: () => void
  onPrevious: () => void
  onNext: () => void
  onRetry?: () => void
  onCancelNavigation?: () => void
  onDetails: (id: string, trigger: HTMLButtonElement) => void
  onRoleChange: (id: string, role: UserRole) => void
  onStatusChange: (id: string, status: UserStatus) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEditingChange: (id: string | null) => void
  headingRef?: Ref<HTMLHeadingElement>
}

function subscribeDesktop(listener: () => void) {
  const media = window.matchMedia('(min-width: 1024px)')
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

function desktopSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches
}

function serverSnapshot() {
  return false
}

export function AdminUsersDirectory(props: AdminUsersDirectoryProps) {
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot)
  return <AdminUsersDirectoryView {...props} layout={desktop ? 'table' : 'cards'} />
}

/** The same view is used by the browser and static-markup tests. It performs no reads. */
export function AdminUsersDirectoryView(
  props: AdminUsersDirectoryProps & { layout: 'table' | 'cards' },
) {
  const {
    rows, source, loading = false, stale = false, error, notice, catalogEntry,
    mutationBusy = false, hasPrevious = false, hasNext = false, headingRef,
    onRefresh, onPrevious, onNext, onRetry, onCancelNavigation,
  } = props
  const busy = loading || mutationBusy
  const unresolvedAccountCount = props.unresolvedAccountCount ?? props.unresolvedTargetIds?.size ?? 0
  const unresolvedCommandCount = props.unresolvedCommandCount ?? unresolvedAccountCount
  const pagination = props.pagination ?? (source === 'v2' ? 'cursor' : source === 'legacy-read-only' ? 'legacy-bounded' : undefined)
  const resultAnnouncement = props.announcement ?? (
    loading ? 'กำลังโหลดทะเบียนผู้ใช้งาน' : error ? 'โหลดทะเบียนผู้ใช้งานไม่สำเร็จ'
      : source === 'unknown' ? 'ยังไม่ยืนยันข้อมูลทะเบียนผู้ใช้งาน' : `แสดงผู้ใช้งานหน้านี้ ${rows.length} คน`
  )

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <Button asChild variant="ghost" className="min-h-11 shrink-0">
              <Link href="/"><ArrowLeft data-icon="inline-start" />กลับ</Link>
            </Button>
            <div className="min-w-0 border-l pl-4">
              <h1 className="text-lg font-semibold leading-tight sm:text-xl">จัดการผู้ใช้งาน</h1>
              <p className="mt-1 text-sm text-muted-foreground">ตรวจสอบบัญชี สังกัด และสถานะการใช้งาน</p>
            </div>
          </div>
          <div className="h-1 rounded-full bg-nt-yellow" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        {catalogEntry}
        {source === 'legacy-read-only' ? (
          <Alert><AlertDescription>
            โหมดอ่านอย่างเดียว: การอนุมัติ เปลี่ยนบทบาท และเปลี่ยนสถานะถูกปิดไว้
            {pagination === 'legacy-bounded'
              ? ' ข้อมูลบางช่องและการแบ่งหน้าไม่รองรับในผลอ่านแบบเดิมนี้'
              : ' รายการยังแบ่งหน้าได้ตามปกติ'}
          </AlertDescription></Alert>
        ) : null}
        {notice ? <Alert role="status"><AlertDescription>{notice}</AlertDescription></Alert> : null}
        {unresolvedCommandCount > 0 ? (
          <Alert role="note" aria-label="คำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้" data-admin-unresolved-commands="true">
            <AlertDescription>
              <p>มีคำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้ {unresolvedCommandCount} รายการ{unresolvedAccountCount > 0 ? ` ใน ${unresolvedAccountCount} บัญชี` : ''}</p>
              <p>การอ่านสถานะปัจจุบันไม่ยืนยันผลคำสั่งเดิม การดำเนินการถัดไปเป็นคำสั่งใหม่</p>
            </AlertDescription>
          </Alert>
        ) : null}
        {stale ? <Alert><AlertDescription>
          ข้อมูลที่แสดงยังไม่ใช่ข้อมูลล่าสุด กรุณาโหลดข้อมูลให้สำเร็จก่อนดำเนินการต่อ
        </AlertDescription></Alert> : null}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              <p>{error}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="min-h-11" onClick={onRetry ?? onRefresh} disabled={busy}>
                  ลองโหลดอีกครั้ง
                </Button>
                {onCancelNavigation ? (
                  <Button variant="ghost" className="min-h-11" onClick={onCancelNavigation} disabled={busy}>
                    กลับไปหน้าที่แสดงอยู่
                  </Button>
                ) : null}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <section aria-labelledby="admin-user-directory-heading" aria-busy={loading} className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="admin-user-directory-heading" ref={headingRef} tabIndex={-1} className="text-base font-semibold outline-offset-4">
                ทะเบียนผู้ใช้งาน
              </h2>
              {source !== 'unknown' && !loading && (!error || rows.length > 0) ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {pagination === 'legacy-bounded' ? `ผลที่อ่านได้ ${rows.length} คน` : `หน้านี้ ${rows.length} คน`}
                </p>
              ) : null}
            </div>
            <Button variant="outline" className="min-h-11" onClick={onRefresh} disabled={busy}>
              <RefreshCw data-icon="inline-start" />โหลดใหม่
            </Button>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{resultAnnouncement}</p>

          {loading && (rows.length === 0 || source === 'unknown') ? (
            <Card aria-label="กำลังโหลดรายชื่อผู้ใช้งาน">
              <CardContent className="flex flex-col gap-4 py-6">
                {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}
              </CardContent>
            </Card>
          ) : source === 'unknown' ? (
            !error ? <Card><CardContent className="py-10 text-center">
              <p className="font-medium">ยังไม่พร้อมแสดงทะเบียนผู้ใช้งาน</p>
              <p className="mt-2 text-sm text-muted-foreground">โปรดลองโหลดข้อมูลอีกครั้ง</p>
            </CardContent></Card> : null
          ) : rows.length > 0 ? (
            props.layout === 'table' ? <DirectoryTable {...props} /> : <DirectoryCards {...props} />
          ) : !error ? (
            <Card><CardContent className="py-10 text-center">
              <p className="font-medium">ไม่พบผู้ใช้งานในหน้านี้</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasPrevious ? 'กลับไปหน้าก่อนหน้าเพื่อดูรายการ' : 'คุณสามารถโหลดทะเบียนอีกครั้งเพื่อตรวจสอบข้อมูลล่าสุด'}
              </p>
            </CardContent></Card>
          ) : null}

          {source !== 'unknown' && pagination === 'cursor' ? (
            <nav aria-label="แบ่งหน้าทะเบียนผู้ใช้งาน" className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="min-h-11" disabled={busy || !hasPrevious} onClick={onPrevious}>
                <ChevronLeft data-icon="inline-start" />ก่อนหน้า
              </Button>
              <Button variant="outline" className="min-h-11" disabled={busy || !hasNext} onClick={onNext}>
                ถัดไป<ChevronRight data-icon="inline-end" />
              </Button>
            </nav>
          ) : null}
        </section>
      </main>
    </div>
  )
}

function rowDisabled(row: AdminUserPresentation, props: AdminUsersDirectoryProps) {
  return !props.canMutate || props.source !== 'v2' || props.loading || props.stale
    || props.mutationBusy || props.actorId === row.id
    || (props.needsFreshReadTargetIds ?? props.unresolvedTargetIds)?.has(row.id)
}

function accessibleTarget(row: AdminUserPresentation) {
  const identifier = row.email.includes('@') ? row.email.trim() : row.id
  return `${row.displayName} (${identifier})`
}

function UserIdentity({ row }: { row: AdminUserPresentation }) {
  return <div className="min-w-0">
    <div className="break-words font-medium">{row.displayName}</div>
    <div className="mt-1 break-all text-sm text-muted-foreground">{row.email || 'ไม่มีข้อมูลอีเมลในรายการที่อ่านได้'}</div>
  </div>
}

function Affiliations({ row }: { row: AdminUserPresentation }) {
  return <div className="flex min-w-0 flex-col gap-3 text-sm">
    <AffiliationGroup label="สังกัดจริง" group={row.actualAffiliation} />
    <AffiliationGroup label="สังกัดที่ยื่นขอ" group={row.requestedAffiliation} />
  </div>
}

function AffiliationGroup({ label, group }: {
  label: string
  group: AdminUserPresentation['actualAffiliation']
}) {
  return <div className="min-w-0">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    <div className="mt-1 flex flex-col gap-0.5" data-affiliation-state={group.state}>
      {group.lines.map((line, index) => <p key={`${index}-${line}`} className="break-words">{line}</p>)}
    </div>
  </div>
}

function RoleControl({ row, ...props }: AdminUsersDirectoryProps & { row: AdminUserPresentation }) {
  const disabled = rowDisabled(row, props) || row.status !== 'active'
  if (disabled) return <span className="break-words text-sm">{row.roleLabel}</span>
  if (props.editingUserId !== row.id) return (
    <Button variant="ghost" className="h-auto min-h-11 max-w-full justify-start whitespace-normal px-0 text-left" onClick={() => props.onEditingChange(row.id)} aria-label={`เปลี่ยนบทบาทของ ${accessibleTarget(row)}`}>
      {row.roleLabel}
    </Button>
  )
  return <Select value={row.role} onValueChange={(value) => props.onRoleChange(row.id, value as UserRole)} onOpenChange={(open) => { if (!open) props.onEditingChange(null) }}>
    <SelectTrigger className="min-h-11 w-full min-w-0" aria-label={`บทบาทของ ${accessibleTarget(row)}`}><SelectValue placeholder={row.roleLabel} /></SelectTrigger>
    <SelectContent><SelectGroup>{roles.map(role => <SelectItem key={role} value={role}>{getRoleLabel(role)}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>
}

function StatusControl({ row, ...props }: AdminUsersDirectoryProps & { row: AdminUserPresentation }) {
  const disabled = rowDisabled(row, props) || row.status === 'pending'
  return <div className="flex min-w-0 flex-col gap-1.5">
    {disabled ? <Badge variant="outline" className="max-w-full whitespace-normal">{row.statusLabel}</Badge> : (
      <Select value={row.status} onValueChange={(value) => props.onStatusChange(row.id, value as UserStatus)}>
        <SelectTrigger className="min-h-11 w-full min-w-0" aria-label={`สถานะบัญชีของ ${accessibleTarget(row)}`}><SelectValue placeholder={row.statusLabel} /></SelectTrigger>
        <SelectContent><SelectGroup>
          {statuses.filter(status => status.value === row.status || canAdminTransitionUserStatus(row.status, status.value)).map(status => (
            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
          ))}
        </SelectGroup></SelectContent>
      </Select>
    )}
    {row.pendingLabel ? <p className="break-words text-xs text-muted-foreground">{row.pendingLabel}</p> : null}
    {props.unresolvedTargetIds?.has(row.id) ? <p className="break-words text-xs text-muted-foreground">ยังยืนยันผลคำสั่งก่อนหน้าไม่ได้</p> : null}
    {(props.needsFreshReadTargetIds ?? props.unresolvedTargetIds)?.has(row.id) ? <p className="break-words text-xs text-muted-foreground">กรุณาโหลดสถานะล่าสุดก่อนทบทวนคำสั่งใหม่</p> : null}
  </div>
}

function Actions({ row, ...props }: AdminUsersDirectoryProps & { row: AdminUserPresentation }) {
  const disabled = rowDisabled(row, props)
  return <div className="flex min-w-0 flex-col gap-2">
    <Button variant="outline" className="h-auto min-h-11 whitespace-normal px-2 py-2" disabled={props.loading || props.stale} data-admin-detail-trigger={row.id} onClick={event => props.onDetails(row.id, event.currentTarget)} aria-label={`ดูรายละเอียดของ ${accessibleTarget(row)}`}>
      ดูรายละเอียด
    </Button>
    {row.canApprove || row.canReject ? <>
      <Button className="h-auto min-h-11 whitespace-normal px-2 py-2" disabled={disabled || !row.canApprove} onClick={() => props.onApprove(row.id)} aria-label={`อนุมัติ ${accessibleTarget(row)}`}>
        อนุมัติ
      </Button>
      <Button variant="outline" className="h-auto min-h-11 whitespace-normal px-2 py-2" disabled={disabled || !row.canReject} onClick={() => props.onReject(row.id)} aria-label={`ส่งกลับแก้ไข ${accessibleTarget(row)}`}>
        ส่งกลับแก้ไข
      </Button>
    </> : null}
  </div>
}

function DirectoryTable(props: AdminUsersDirectoryProps) {
  return <Card><CardContent className="px-0">
    <Table className="table-fixed">
      <TableHeader><TableRow>
        <TableHead className="w-[25%]">ผู้ใช้</TableHead>
        <TableHead className="w-[30%]">สังกัด</TableHead>
        <TableHead className="w-[15%]">บทบาท</TableHead>
        <TableHead className="w-[16%]">สถานะบัญชี</TableHead>
        <TableHead className="w-[14%]">การดำเนินการ</TableHead>
      </TableRow></TableHeader>
      <TableBody>{props.rows.map(row => <TableRow key={row.id} data-admin-user-id={row.id}>
        <TableCell className="align-top"><UserIdentity row={row} /></TableCell>
        <TableCell className="align-top"><Affiliations row={row} /></TableCell>
        <TableCell className="align-top"><RoleControl {...props} row={row} /></TableCell>
        <TableCell className="align-top"><StatusControl {...props} row={row} /></TableCell>
        <TableCell className="align-top"><Actions {...props} row={row} /></TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </CardContent></Card>
}

function DirectoryCards(props: AdminUsersDirectoryProps) {
  return <div className="flex min-w-0 flex-col gap-3">{props.rows.map(row => (
    <Card key={row.id} data-admin-user-id={row.id}>
      <CardHeader><CardTitle className="text-base"><UserIdentity row={row} /></CardTitle></CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-5">
        <div className="grid min-w-0 grid-cols-2 gap-4">
          <div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">บทบาท</p><RoleControl {...props} row={row} /></div>
          <div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">สถานะบัญชี</p><StatusControl {...props} row={row} /></div>
        </div>
        <Affiliations row={row} />
        <Actions {...props} row={row} />
      </CardContent>
    </Card>
  ))}</div>
}
