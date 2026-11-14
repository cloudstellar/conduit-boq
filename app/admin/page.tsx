'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { AuthorizationError, canAdminTransitionUserStatus, requireActiveAdmin } from '@/lib/auth/authorization'
import type { UserRole, UserStatus } from '@/lib/types/auth'
import { loadCatalogAdminGateProjection } from '@/lib/master-catalog/admin/adminGate'
import {
  createDirectoryRequestGate, DirectoryDeadlineError, DirectoryRequestInvalidatedError,
  readAdminDirectoryPage, withDirectoryDeadline,
  type AdminDirectoryPage, type DirectoryCursor, type DirectoryTicket, type DirectoryMutationTicket,
} from '@/lib/admin/users/directory'
import { presentAdminUser } from '@/lib/admin/users/presentation'
import { AdminUsersDirectory } from './_components/AdminUsersDirectory'
import { AdminUserDetailsSheet } from './_components/AdminUserDetailsSheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CatalogAdminEntryState = 'loading' | 'enabled' | 'read-only' | 'unavailable'
type ReadRequest = { cursor: DirectoryCursor; history: DirectoryCursor[]; kind: 'initial' | 'navigate' | 'refresh' | 'reread'; explicitReview?: boolean; reloadCatalog?: boolean }
interface Workspace {
  actorId: string | null
  page: AdminDirectoryPage | null
  cursor: DirectoryCursor
  history: DirectoryCursor[]
  requested: ReadRequest | null
  loading: boolean
  stale: boolean
  error: string | null
  notice: string | null
  noticeRequestId: string | null
  refreshAfterSuccess: boolean
  announcement: string
  selectedId: string | null
  editingId: string | null
}
function emptyWorkspace(actorId: string | null): Workspace {
  return { actorId, page: null, cursor: null, history: [], requested: null, loading: true,
    stale: false, error: null, notice: null, noticeRequestId: null, refreshAfterSuccess: false, announcement: 'กำลังโหลดทะเบียนผู้ใช้งาน', selectedId: null,
    editingId: null }
}
class ConfirmedCommandFailure extends Error {}
async function settled<T>(operation: PromiseLike<T>): Promise<PromiseSettledResult<T>> {
  try { return { status: 'fulfilled', value: await operation } }
  catch (reason) { return { status: 'rejected', reason } }
}
const descriptions: Record<CatalogAdminEntryState, { label: string; description: string; variant: 'outline' | 'default' | 'destructive' }> = {
  loading: { label: 'กำลังตรวจสถานะ', description: 'กำลังตรวจสถานะเครื่องมือ Master Catalog', variant: 'outline' },
  enabled: { label: 'พร้อมแก้ไข', description: 'เปิดดูบัญชีราคาและใช้เครื่องมือแก้ไขตามสิทธิ์ผู้ดูแลระบบได้', variant: 'default' },
  'read-only': { label: 'เปิดดูอย่างเดียว', description: 'เปิดดูบัญชีปัจจุบัน ทะเบียนฉบับ และประวัติได้ เครื่องมือแก้ไขถูกปิดไว้', variant: 'outline' },
  unavailable: { label: 'ตรวจสถานะไม่ได้', description: 'ยังเปิดดู Master Catalog ได้ เครื่องมือแก้ไขจะปิดแบบปลอดภัยจนกว่าจะตรวจสถานะได้', variant: 'destructive' },
}

function AdminContent() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const actorId = user?.id ?? null
  const role = user?.role
  const status = user?.status
  const supabase = useMemo(() => createClient(), [])
  const gate = useMemo(() => createDirectoryRequestGate(), [])
  const [workspace, setWorkspace] = useState<Workspace>(() => emptyWorkspace(null))
  const [catalog, setCatalog] = useState<{ actorId: string | null; state: CatalogAdminEntryState; issue: string | null }>({ actorId: null, state: 'loading', issue: null })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const detailsTrigger = useRef<HTMLButtonElement | null>(null)
  const latestRead = useRef<ReadRequest | null>(null)
  const [, setControllerVersion] = useState(0)
  const notifyCommands = useCallback(() => setControllerVersion(version => version + 1), [])

  const readPage = useCallback(async (actor: string, request: ReadRequest, reconciliation?: DirectoryMutationTicket): Promise<boolean> => {
    latestRead.current = request
    try {
      if (gate.queueRead(actor, () => { void readPage(actor, request) }, reconciliation)) return false
    } catch { return false }
    let ticket: DirectoryTicket
    try { ticket = gate.startRead(actor, reconciliation) } catch { return false }
    if (!gate.isCurrent(ticket)) return false
    let expired = false
    let stage: 'authorization' | 'data' = 'authorization'
    const assertCurrent = () => { if (expired || !gate.isCurrent(ticket)) throw new DirectoryRequestInvalidatedError() }
    const setCatalogAdminEntryState = (state: CatalogAdminEntryState, issue: string | null = state === 'unavailable' ? 'ยังยืนยันสถานะเครื่องมือแก้ไขไม่ได้' : null) => {
      setCatalog({ actorId: actor, state, issue })
    }
    setWorkspace((previous) => ({ ...(previous.actorId === actor ? previous : emptyWorkspace(actor)),
      loading: true, error: null, requested: request, editingId: null,
      announcement: 'กำลังโหลดทะเบียน หน้าที่ ' + (request.history.length + 1),
      selectedId: request.kind === 'navigate' ? null : previous.actorId === actor ? previous.selectedId : null }))
    const operation = async () => {
      const authorization = await requireActiveAdmin(supabase)
      if (authorization.user.id !== actor) throw new AuthorizationError('ADMIN_REQUIRED', 'ผู้ดูแลที่ลงชื่อเข้าใช้เปลี่ยนไป', 403)
      assertCurrent()
      stage = 'data'
      const [pageResult, catalogResult] = await Promise.all([
        settled(readAdminDirectoryPage(supabase, { source: authorization.source, cursor: request.cursor })),
        settled(request.kind === 'initial' || request.reloadCatalog
          ? authorization.source === 'v2' ? loadCatalogAdminGateProjection(supabase) : Promise.resolve({ enabled: false, issue: null })
          : Promise.resolve(null)),
      ])
      assertCurrent()
      stage = 'authorization'
      const after = await requireActiveAdmin(supabase)
      if (after.user.id !== actor || after.source !== authorization.source) {
        throw new AuthorizationError('AUTHORIZATION_UNAVAILABLE', 'สิทธิ์ผู้ดูแลเปลี่ยนระหว่างอ่าน กรุณาโหลดใหม่', 403)
      }
      assertCurrent()
      stage = 'data'
      if (pageResult.status === 'rejected') throw pageResult.reason
      return { page: pageResult.value, catalogProjection: catalogResult.status === 'fulfilled'
        ? catalogResult.value : { enabled: false, issue: 'ตรวจสถานะ Master Catalog ไม่สำเร็จ' } }
    }
    try {
      const result = await withDirectoryDeadline(operation(), 15_000, request.kind === 'reread' ? 'reread' : 'read')
      if (!gate.publishRead(ticket, result.page.records.map(row => row.id), request.explicitReview === true)) return false
      setWorkspace((previous) => {
        if (previous.actorId !== actor || !gate.isCurrent(ticket)) return previous
        const selectedId = previous.selectedId && result.page.records.some((row) => row.id === previous.selectedId) ? previous.selectedId : null
        return { ...previous, page: result.page, cursor: request.cursor, history: request.history,
          requested: null, loading: false, stale: false, error: null, selectedId, editingId: null,
          notice: previous.refreshAfterSuccess ? 'ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว' : previous.notice,
          refreshAfterSuccess: false,
          announcement: 'โหลดทะเบียนหน้าที่ ' + (request.history.length + 1) + ' แล้ว หน้านี้ ' + result.page.records.length + ' คน' }
      })
      if (result.catalogProjection) {
        const projection = result.catalogProjection
        setCatalogAdminEntryState(projection.enabled ? 'enabled' : projection.issue ? 'unavailable' : 'read-only', projection.issue)
      }
      return true
    } catch (error) {
      if (!gate.isCurrent(ticket) || error instanceof DirectoryRequestInvalidatedError) return false
      if (error instanceof DirectoryDeadlineError) expired = true
      gate.invalidate()
      if (error instanceof AuthorizationError || (error instanceof DirectoryDeadlineError && stage === 'authorization')) {
        setWorkspace((previous) => ({ ...emptyWorkspace(actor), loading: false,
          refreshAfterSuccess: previous.actorId === actor && previous.refreshAfterSuccess,
          noticeRequestId: previous.actorId === actor ? previous.noticeRequestId : null,
          notice: request.kind === 'reread' ? 'ดำเนินการสำเร็จ แต่ยังยืนยันข้อมูลล่าสุดไม่ได้' : null,
          error: !(error instanceof AuthorizationError) || error.code === 'AUTHORIZATION_UNAVAILABLE' ? 'ตรวจสอบสิทธิ์ผู้ดูแลไม่ได้ กรุณาลองโหลดใหม่' : 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลที่กำลังใช้งาน กรุณาตรวจสอบบัญชี',
          announcement: 'ไม่สามารถยืนยันสิทธิ์ผู้ดูแลได้' }))
        setCatalogAdminEntryState('unavailable')
      } else {
        setWorkspace((previous) => previous.actorId !== actor ? previous : { ...previous, loading: false, stale: Boolean(previous.page),
          notice: request.kind === 'reread' ? 'ดำเนินการสำเร็จ กรุณาโหลดข้อมูลล่าสุดอีกครั้ง' : previous.notice,
          error: request.kind === 'reread' ? 'ดำเนินการสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ' : 'โหลดทะเบียนหน้านี้ไม่สำเร็จ ข้อมูลที่แสดงอาจเป็นข้อมูลเดิม',
          announcement: 'โหลดข้อมูลล่าสุดไม่สำเร็จ' })
        if (request.kind === 'initial') setCatalogAdminEntryState('unavailable')
      }
      return false
    }
  }, [gate, supabase])

  useEffect(() => () => { gate.dispose() }, [gate])

  useEffect(() => {
    gate.setActor(actorId)
    if (authLoading) return
    if (!actorId) { router.push('/login?redirectTo=/admin'); return }
    const initialize = async () => {
      gate.invalidate()
      setWorkspace(previous => ({ ...emptyWorkspace(actorId),
        notice: previous.actorId === actorId ? previous.notice : null,
        noticeRequestId: previous.actorId === actorId ? previous.noticeRequestId : null,
        refreshAfterSuccess: previous.actorId === actorId && previous.refreshAfterSuccess }))
      setCatalog({ actorId, state: 'loading', issue: null })
      if (role === 'admin' && status === 'active') {
        await readPage(actorId, { cursor: null, history: [], kind: 'initial' })
      }
    }
    void initialize()
    return () => { gate.invalidate() }
  }, [actorId, role, status, authLoading, gate, readPage, router])

  const visible = workspace.actorId === actorId ? workspace : emptyWorkspace(actorId)
  const page = visible.page
  const adminMutationsEnabled = Boolean(page?.source === 'v2' && !visible.loading && !visible.stale && !visible.error && !gate.mutationInFlight() && gate.snapshotCurrent())
  const rows = useMemo(() => workspace.actorId === actorId ? (workspace.page?.records ?? []).map(presentAdminUser) : [], [workspace.actorId, workspace.page, actorId])
  const unresolvedCommands = gate.unresolved().filter(command => command.ticket.actorId === actorId)
  const unresolvedTargetIds = new Set(unresolvedCommands.map(command => command.ticket.targetId))
  const needsFreshReadTargetIds = new Set([...unresolvedTargetIds].filter(id => gate.needsFreshRead(id)))
  const selected = rows.find((row) => row.id === visible.selectedId) ?? null
  const selectedRecord = page?.records.find((row) => row.id === selected?.id)
  const canReviewAffiliation = Boolean(actorId && selectedRecord && selectedRecord.id !== actorId
    && selectedRecord.source === 'v2' && selectedRecord.role === 'staff' && selectedRecord.status === 'active'
    && selectedRecord.org_id === null && selectedRecord.department_id === null && selectedRecord.sector_id === null)

  const prepareAffiliation = () => {
    if (!actorId || !adminMutationsEnabled || !canReviewAffiliation || !selected || gate.hasUnresolved(selected.id)) return false
    try {
      const ticket = gate.capture(actorId)
      return gate.isCurrent(ticket) && gate.snapshotCurrent() && !gate.mutationInFlight()
    } catch {
      return false
    }
  }

  const refreshAfterAffiliation = async () => {
    if (!actorId) return false
    const current = latestRead.current
    return readPage(actorId, { cursor: current?.cursor ?? null, history: current?.history ?? [],
      kind: 'refresh', reloadCatalog: current?.kind === 'initial' || current?.reloadCatalog })
  }

  const refresh = () => {
    if (!actorId || gate.mutationInFlight()) return
    void readPage(actorId, { cursor: visible.cursor, history: visible.history, kind: page ? 'refresh' : 'initial', explicitReview: true })
  }
  const retry = () => {
    if (!actorId || gate.mutationInFlight()) return
    void readPage(actorId, { ...(visible.requested ?? { cursor: visible.cursor, history: visible.history, kind: page ? 'refresh' : 'initial' }), explicitReview: true })
  }
  const previous = () => {
    if (!actorId || !visible.history.length || gate.mutationInFlight()) return
    void readPage(actorId, { cursor: visible.history.at(-1) ?? null, history: visible.history.slice(0, -1), kind: 'navigate', explicitReview: true })
  }
  const next = () => {
    if (!actorId || !page?.hasNext || !page.nextCursor || gate.mutationInFlight()) return
    void readPage(actorId, { cursor: page.nextCursor, history: [...visible.history, visible.cursor], kind: 'navigate', explicitReview: true })
  }

  const submit = async (targetId: string, action: 'role' | 'status' | 'approve' | 'reject', value?: UserRole | UserStatus) => {
    if (!actorId || !adminMutationsEnabled || !gate.snapshotCurrent() || gate.mutationInFlight() || targetId === actorId) return
    const record = page?.records.find((row) => row.id === targetId)
    const presentation = rows.find((row) => row.id === targetId)
    if (!record || !presentation) return
    const uncertain = gate.hasUnresolved(targetId)
    if (gate.needsFreshRead(targetId)) return
    if ((action === 'role' || action === 'status') && !value) return
    const actionReview = action === 'role'
      ? 'เปลี่ยนบทบาท: ' + presentation.roleLabel + ' → ' + presentAdminUser({ ...record, role: value as UserRole }).roleLabel
      : action === 'status'
        ? 'เปลี่ยนสถานะ: ' + presentation.statusLabel + ' → ' + presentAdminUser({ ...record, status: value as UserStatus }).statusLabel
        : action === 'approve' ? 'อนุมัติตามสังกัดที่ยื่นขอ' : 'ส่งกลับแก้ไข'
    let preview: DirectoryTicket
    try { preview = gate.capture(actorId) } catch { return }
    if (uncertain && !confirm('ผลคำสั่งก่อนหน้ายังยืนยันไม่ได้ การดำเนินการนี้เป็นคำสั่งใหม่\n\nบัญชี: ' + presentation.email + '\nสถานะปัจจุบัน: ' + presentation.statusLabel + '\n' + actionReview + '\nกรุณาทบทวนข้อมูลล่าสุดก่อนดำเนินการ')) return
    let rpcName: string
    let reason: string
    let newRole: UserRole | undefined
    if (action === 'role') {
      if (record.status !== 'active' || value === record.role) return
      newRole = value as UserRole
      rpcName = 'admin_set_user_role'
      reason = prompt('บัญชี: ' + presentation.email + '\n' + actionReview + '\nระบุเหตุผลที่เปลี่ยนบทบาท:')?.trim() ?? ''
    } else if (action === 'status') {
      if (!value || !canAdminTransitionUserStatus(record.status, value as UserStatus)) return
      rpcName = value === 'active' ? 'admin_reactivate_user' : value === 'inactive' ? 'admin_deactivate_user' : 'admin_suspend_user'
      reason = prompt('บัญชี: ' + presentation.email + '\n' + actionReview + '\nระบุเหตุผลที่เปลี่ยนสถานะ:')?.trim() ?? ''
    } else if (action === 'approve') {
      if (!presentation.canApprove) return
      if (!confirm('ยืนยันอนุมัติ ' + presentation.email + '?\n\nสังกัดที่ยื่นขอ:\n' + presentation.requestedAffiliation.lines.join('\n'))) return
      rpcName = 'admin_approve_user'
      reason = 'อนุมัติข้อมูลและสังกัดตามคำขอ'
    } else {
      if (!presentation.canReject) return
      rpcName = 'admin_reject_user'
      reason = prompt('ระบุเหตุผลที่ส่งกลับแก้ไขบัญชี ' + presentation.email + ':')?.trim() ?? ''
    }
    if (!reason || !gate.isCurrent(preview)) return
    const requestId = crypto.randomUUID()
    const args = { p_target_id: targetId, p_reason: reason, p_request_id: requestId,
      ...(newRole ? { p_new_role: newRole } : {}) }
    const ticket = gate.acquireMutation(actorId, targetId, requestId, { rpc: rpcName, args })
    if (!ticket) return
    setWorkspace((current) => current.actorId !== actorId ? current : { ...current,
      noticeRequestId: ticket.requestId, notice: null, error: null, editingId: null })
    let submitted = false
    let timedOut = false
    try {
      const requireV2AdminMutationAuthority = async () => {
        const authorization = await requireActiveAdmin(supabase)
        if (authorization.source !== 'v2') throw new AuthorizationError('AUTHORIZATION_UNAVAILABLE', 'การจัดการบัญชีอยู่ในโหมดอ่านอย่างเดียว', 403)
        if (authorization.user.id !== ticket.actorId) throw new AuthorizationError('ADMIN_REQUIRED', 'ผู้ดูแลที่ลงชื่อเข้าใช้เปลี่ยนไป', 403)
        return authorization
      }
      try { await withDirectoryDeadline(requireV2AdminMutationAuthority(), 15_000, 'read') }
      catch (error) {
        if (error instanceof DirectoryDeadlineError) throw new AuthorizationError('AUTHORIZATION_UNAVAILABLE', 'ตรวจสอบสิทธิ์ผู้ดูแลไม่สำเร็จภายในเวลาที่กำหนด', 403)
        throw error
      }
      if (!gate.markSubmitted(ticket)) return
      submitted = true
      const observeTransport = (outcome: 'success' | 'denied' | 'unknown') => {
        if (!gate.settle(ticket, outcome)) return
        notifyCommands()
        if (timedOut) {
          setWorkspace(current => current.actorId !== actorId || !gate.isCommandOwned(ticket) ? current : { ...current,
            stale: Boolean(current.page), announcement: 'ได้รับผลคำสั่งก่อนหน้า กรุณาโหลดข้อมูลล่าสุด',
            notice: current.noticeRequestId !== ticket.requestId ? current.notice
              : outcome === 'success' ? 'ได้รับผลยืนยันว่าดำเนินการสำเร็จ กำลังอ่านข้อมูลล่าสุด'
                : outcome === 'denied' ? 'ได้รับผลยืนยันว่าคำสั่งก่อนหน้าไม่สำเร็จ กรุณาโหลดข้อมูลล่าสุด' : null,
            refreshAfterSuccess: current.noticeRequestId === ticket.requestId ? outcome === 'success' : current.refreshAfterSuccess })
          const currentRead = latestRead.current
          if (currentRead) void readPage(actorId, { ...currentRead, kind: 'refresh', explicitReview: false,
            reloadCatalog: currentRead.kind === 'initial' || currentRead.reloadCatalog })
        }
      }
      const transport = Promise.resolve(supabase.rpc(rpcName, args)).then(result => {
        observeTransport(!result.error ? 'success'
          : result.status >= 400 && result.status < 500 && result.status !== 408 ? 'denied' : 'unknown')
        return result
      }, error => { observeTransport('unknown'); throw error })
      const result = await withDirectoryDeadline(transport, 20_000, 'mutation')
      if (result.error) {
        if (result.status === 401 || result.status === 403) throw new AuthorizationError('ADMIN_REQUIRED', 'สิทธิ์ปัจจุบันไม่อนุญาตให้ดำเนินการ', 403)
        if (result.status >= 400 && result.status < 500 && result.status !== 408) throw new ConfirmedCommandFailure()
        throw new DirectoryDeadlineError('mutation')
      }
      if (!gate.isCommandOwned(ticket)) return
      setWorkspace((current) => current.actorId !== actorId || !gate.isCommandOwned(ticket) ? current : { ...current,
        refreshAfterSuccess: true, notice: 'ดำเนินการสำเร็จ กำลังอ่านข้อมูลล่าสุด' })
      gate.discardQueuedRead(ticket)
      const currentRead = latestRead.current
      const readSucceeded = await readPage(actorId, { cursor: currentRead?.cursor ?? null, history: currentRead?.history ?? [],
        kind: 'reread', reloadCatalog: currentRead?.kind === 'initial' || currentRead?.reloadCatalog }, ticket)
      if (readSucceeded && gate.isCommandOwned(ticket)) {
        setWorkspace((current) => current.actorId !== actorId ? current : { ...current, notice: 'ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว' })
      }
    } catch (error) {
      if (!gate.isCommandOwned(ticket)) return
      if (submitted && error instanceof DirectoryDeadlineError) { timedOut = true; gate.markUnknown(ticket) }
      if (error instanceof AuthorizationError) {
        setWorkspace((current) => current.actorId !== actorId || !gate.isCommandOwned(ticket) ? current : ({ ...emptyWorkspace(actorId), loading: false,
          error: 'สิทธิ์ผู้ดูแลไม่พร้อมใช้งาน กรุณาโหลดข้อมูลใหม่' }))
        setCatalog({ actorId, state: 'unavailable', issue: 'ยังยืนยันสิทธิ์ผู้ดูแลไม่ได้' })
      } else if (submitted && !(error instanceof ConfirmedCommandFailure)) {
        setWorkspace((current) => current.actorId !== actorId ? current : { ...current, loading: false, stale: false,
          notice: null,
          announcement: 'ยังยืนยันผลคำสั่งไม่ได้ ไม่มีการส่งซ้ำอัตโนมัติ' })
      } else {
        setWorkspace((current) => current.actorId !== actorId ? current : { ...current, stale: Boolean(current.page),
          error: 'ไม่สามารถดำเนินการได้ กรุณาโหลดข้อมูลล่าสุดก่อนทบทวนใหม่' })
      }
    } finally {
      gate.releaseMutation(ticket)
      if (gate.isOwned(ticket)) notifyCommands()
    }
  }

  const closeDetails = (open: boolean) => { if (!open) setWorkspace((current) => ({ ...current, selectedId: null })) }
  const returnFocus = (event: Event) => {
    event.preventDefault()
    const trigger = detailsTrigger.current
    if (trigger?.isConnected && !trigger.disabled) trigger.focus()
    else headingRef.current?.focus()
  }

  if (authLoading || !user) return <LoadingState />
  if (role !== 'admin' || status !== 'active') return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="space-y-3 text-center"><h1 className="text-xl font-semibold">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-muted-foreground">หน้านี้สำหรับผู้ดูแลระบบที่กำลังใช้งาน</p>
        {unresolvedCommands.length ? <p role="note">มีคำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้ {unresolvedCommands.length} รายการ</p> : null}
        {gate.mutationInFlight() ? <p role="status">กำลังรอผลคำสั่งก่อนหน้า</p> : null}
        <Button asChild variant="outline"><Link href="/">กลับหน้าหลัก</Link></Button></div>
    </main>
  )
  const catalogState = catalog.actorId === actorId ? catalog : { state: 'loading' as const, issue: null }
  const catalogDescription = descriptions[catalogState.state]
  const catalogEntry = (
    <Card className="mb-6">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Master Catalog</CardTitle>
        <Badge variant={catalogDescription.variant}>{catalogDescription.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border text-muted-foreground"><Database className="size-4" /></div>
          <div><div className="font-medium">บัญชีราคามาตรฐาน</div>
            <p className="text-sm text-muted-foreground">{catalogDescription.description}</p>
            {catalogState.issue ? <p role="status" className="mt-1 text-sm text-destructive">{catalogState.issue}</p> : null}</div>
        </div>
        <Button asChild><Link href="/admin/master-catalog">เปิด Master Catalog</Link></Button>
      </CardContent>
    </Card>
  )

  return (
    <>
      <AdminUsersDirectory rows={rows} actorId={actorId} source={page?.source ?? 'unknown'} pagination={page?.pagination ?? 'legacy-bounded'}
        catalogEntry={catalogEntry} canMutate={adminMutationsEnabled}
        loading={visible.loading} stale={visible.stale} error={visible.error} notice={visible.notice}
        announcement={visible.announcement} mutationBusy={gate.mutationInFlight()}
        unresolvedTargetIds={unresolvedTargetIds} needsFreshReadTargetIds={needsFreshReadTargetIds}
        unresolvedCommandCount={unresolvedCommands.length} unresolvedAccountCount={unresolvedTargetIds.size} editingUserId={visible.editingId}
        hasPrevious={visible.history.length > 0} hasNext={Boolean(page?.hasNext)}
        onRefresh={refresh} onPrevious={previous} onNext={next}
        onRetry={retry}
        onCancelNavigation={visible.requested?.kind === 'navigate' && page ? () => setWorkspace((current) => ({
          ...current, requested: null, error: null, stale: true,
          notice: 'ยังแสดงข้อมูลหน้าเดิม กรุณาโหลดใหม่ก่อนดำเนินการ',
        })) : undefined}
        onDetails={(id, trigger) => { detailsTrigger.current = trigger; setWorkspace((current) => ({ ...current, selectedId: id })) }}
        onRoleChange={(id, value) => { void submit(id, 'role', value) }}
        onStatusChange={(id, value) => { void submit(id, 'status', value) }}
        onApprove={(id) => { void submit(id, 'approve') }}
        onReject={(id) => { void submit(id, 'reject') }}
        onEditingChange={(id) => setWorkspace((current) => ({ ...current, editingId: id }))}
        headingRef={headingRef}
      />
      <AdminUserDetailsSheet user={selected} open={Boolean(visible.selectedId)} onOpenChange={closeDetails}
        loading={visible.loading} stale={visible.stale} onCloseAutoFocus={returnFocus}
        affiliation={actorId && page?.source === 'v2' ? { client: supabase, actorId,
          canReview: canReviewAffiliation, canMutate: adminMutationsEnabled && Boolean(selected && !gate.hasUnresolved(selected.id)),
          canReadHistory: !visible.loading && !visible.stale && !visible.error && Boolean(selectedRecord && selectedRecord.id !== actorId
            && selectedRecord.role === 'staff' && selectedRecord.status === 'active'
            && selectedRecord.org_id && selectedRecord.department_id && selectedRecord.sector_id),
          canSubmit: prepareAffiliation, refresh: refreshAfterAffiliation } : undefined}
        unresolvedCommandCount={unresolvedCommands.filter(command => command.ticket.targetId === selected?.id).length}
        needsFreshRead={Boolean(selected && gate.needsFreshRead(selected.id))} />
    </>
  )
}

function LoadingState() {
  return <div className="flex min-h-screen items-center justify-center bg-muted/30" role="status">
    <Loader2 className="mr-2 size-5 animate-spin" aria-hidden="true" />กำลังตรวจสอบผู้ใช้งาน
  </div>
}
const DynamicAdminContent = nextDynamic(() => Promise.resolve(AdminContent), { ssr: false, loading: LoadingState })
export default function AdminPage() { return <DynamicAdminContent /> }
