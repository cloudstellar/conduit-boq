'use client'

// Force dynamic rendering to prevent prerender error on Vercel
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from 'react'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { UserRole } from '@/lib/types/auth'
import { getRoleLabel } from '@/lib/permissions'
import { loadCatalogAdminGateProjection } from '@/lib/master-catalog/admin/adminGate'
import {
  canAdminTransitionUserStatus,
  isExactMissingRpcError,
  requireActiveAdmin,
} from '@/lib/auth/authorization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, Check, X, Database } from 'lucide-react'

interface UserProfile {
  id: string
  email: string | null
  first_name: string
  last_name: string
  title: string | null
  position: string | null
  role: UserRole
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  department: { id: string; name: string } | null
  sector: { id: string; name: string } | null
  requested_department: { id: string; name: string } | null
  requested_sector: { id: string; name: string } | null
  onboarding_completed: boolean
  created_at: string
}

type CatalogAdminEntryState = 'loading' | 'enabled' | 'read-only' | 'unavailable'

function AdminContent() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [savingUser, setSavingUser] = useState<string | null>(null)
  const [approvingUser, setApprovingUser] = useState<string | null>(null)
  const [adminMutationsEnabled, setAdminMutationsEnabled] = useState(false)
  const [catalogAdminEntryState, setCatalogAdminEntryState] = useState<CatalogAdminEntryState>('loading')
  const [catalogSettingsIssue, setCatalogSettingsIssue] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/admin')
    }
  }, [authLoading, user, router])

  const loadAuthorizedUsers = useCallback(async (source: 'v2' | 'legacy-read-only') => {
    const pageResult = await supabase.rpc('get_admin_profiles_page', {
      p_limit: 100,
      p_cursor_created_at: null,
      p_cursor_id: null,
    })

    if (pageResult.error) {
      if (
        source !== 'legacy-read-only'
        || !isExactMissingRpcError(pageResult.error, 'get_admin_profiles_page')
      ) {
        throw new Error('ไม่สามารถอ่านทะเบียนผู้ใช้งานที่ได้รับอนุญาตได้')
      }

      const fallback = await supabase.from('user_profiles').select(`
        id, email, first_name, last_name, title, position, role, status, created_at, onboarding_completed,
        department:departments!user_profiles_department_id_fkey(id, name),
        sector:sectors!user_profiles_sector_id_fkey(id, name),
        requested_department:departments!user_profiles_requested_department_id_fkey(id, name),
        requested_sector:sectors!user_profiles_requested_sector_id_fkey(id, name)
      `).order('created_at', { ascending: false })

      if (fallback.error) throw new Error('ไม่สามารถอ่านทะเบียนผู้ใช้งานได้')
      return (fallback.data || []) as unknown as UserProfile[]
    }

    const rows = (Array.isArray(pageResult.data) ? pageResult.data : []) as Record<string, unknown>[]
    const [departmentsResult, sectorsResult] = await Promise.all([
      supabase.from('departments').select('id,name'),
      supabase.from('sectors').select('id,name'),
    ])
    const departments = new Map(
      (departmentsResult.data || []).map((row) => [String(row.id), { id: String(row.id), name: String(row.name) }]),
    )
    const sectors = new Map(
      (sectorsResult.data || []).map((row) => [String(row.id), { id: String(row.id), name: String(row.name) }]),
    )

    return rows.map((row) => ({
      id: String(row.id),
      email: typeof row.email === 'string' ? row.email : null,
      first_name: String(row.first_name ?? ''),
      last_name: String(row.last_name ?? ''),
      title: typeof row.title === 'string' ? row.title : null,
      position: typeof row.position === 'string' ? row.position : null,
      role: row.role as UserRole,
      status: row.status as UserProfile['status'],
      department: departments.get(String(row.department_id)) ?? null,
      sector: sectors.get(String(row.sector_id)) ?? null,
      requested_department: departments.get(String(row.requested_department_id)) ?? null,
      requested_sector: sectors.get(String(row.requested_sector_id)) ?? null,
      onboarding_completed: row.onboarding_completed === true,
      created_at: String(row.created_at ?? ''),
    }))
  }, [supabase])

  // Load the bounded admin directory. The legacy table fallback is read-only
  // and is reachable only when both new profile RPCs are exactly missing.
  useEffect(() => {
    if (!user || user.role !== 'admin') return

    let cancelled = false

    const loadData = async () => {
      setCatalogAdminEntryState('loading')
      setCatalogSettingsIssue(null)
      setAdminMutationsEnabled(false)
      try {
        const authorization = await requireActiveAdmin(supabase)
        const [loadedUsers, catalogGate] = await Promise.all([
          loadAuthorizedUsers(authorization.source),
          authorization.source === 'v2'
            ? loadCatalogAdminGateProjection(supabase)
            : Promise.resolve({ enabled: false, issue: null }),
        ])

        if (cancelled) return
        setUsers(loadedUsers)
        setAdminMutationsEnabled(authorization.source === 'v2')
        setCatalogAdminEntryState(
          catalogGate.enabled
            ? 'enabled'
            : catalogGate.issue
              ? 'unavailable'
              : 'read-only'
        )
        setCatalogSettingsIssue(catalogGate.issue)
      } catch (err) {
        console.error('Load error:', err)
        if (!cancelled) {
          setAdminMutationsEnabled(false)
          setCatalogAdminEntryState('unavailable')
          setCatalogSettingsIssue('โหลดการตั้งค่าระบบไม่สำเร็จ เครื่องมือแก้ไขบัญชีราคาจึงถูกปิดแบบปลอดภัย')
          setError(err instanceof Error ? err.message : 'โหลดข้อมูลผู้ดูแลระบบไม่สำเร็จ')
        }
      }
      if (!cancelled) {
        setIsLoading(false)
      }
    }
    loadData()

    return () => { cancelled = true }
  }, [user, supabase, loadAuthorizedUsers])

  const refreshUsers = async () => {
    setIsLoading(true)
    try {
      const authorization = await requireActiveAdmin(supabase)
      setUsers(await loadAuthorizedUsers(authorization.source))
      setAdminMutationsEnabled(authorization.source === 'v2')
    } catch {
      setAdminMutationsEnabled(false)
      setError('ไม่สามารถโหลดทะเบียนผู้ใช้งานล่าสุดได้')
    } finally {
      setIsLoading(false)
    }
  }

  const requireV2AdminMutationAuthority = async () => {
    const authorization = await requireActiveAdmin(supabase)
    if (authorization.source !== 'v2') {
      throw new Error('P-49 mutation RPCs are not available yet')
    }
    return authorization
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!adminMutationsEnabled) {
      alert('การจัดการบัญชีถูกปิดชั่วคราวระหว่างปรับปรุงสิทธิ์')
      return
    }
    const target = users.find((candidate) => candidate.id === userId)
    if (!target || target.status !== 'active') {
      alert('เปลี่ยนบทบาทได้เฉพาะบัญชีที่กำลังใช้งาน')
      setEditingUser(null)
      return
    }
    const reason = prompt('ระบุเหตุผลที่เปลี่ยนบทบาท:')?.trim()
    if (!reason) return
    setSavingUser(userId)
    try {
      await requireV2AdminMutationAuthority()
      const { error } = await supabase.rpc('admin_set_user_role', {
        p_target_id: userId,
        p_new_role: newRole,
        p_reason: reason,
        p_request_id: crypto.randomUUID(),
      })

      if (error) throw error
      setUsers((currentUsers) => currentUsers.map(
        (candidate) => candidate.id === userId ? { ...candidate, role: newRole } : candidate,
      ))
      setEditingUser(null)
    } catch {
      alert('ไม่สามารถเปลี่ยนบทบาทได้ กรุณาตรวจสอบสิทธิ์และลองใหม่')
    } finally {
      setSavingUser(null)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended' | 'pending') => {
    if (!adminMutationsEnabled) {
      alert('การจัดการบัญชีถูกปิดชั่วคราวระหว่างปรับปรุงสิทธิ์')
      return
    }
    const target = users.find((candidate) => candidate.id === userId)
    if (!target || target.status === newStatus) return
    if (!canAdminTransitionUserStatus(target.status, newStatus)) {
      alert('ไม่อนุญาตให้เปลี่ยนสถานะตามเส้นทางนี้')
      return
    }
    const rpcName = newStatus === 'active'
      ? 'admin_reactivate_user'
      : newStatus === 'inactive'
        ? 'admin_deactivate_user'
        : 'admin_suspend_user'
    const reason = prompt('ระบุเหตุผลที่เปลี่ยนสถานะบัญชี:')?.trim()
    if (!reason) return
    setSavingUser(userId)
    try {
      await requireV2AdminMutationAuthority()
      const { error } = await supabase.rpc(rpcName, {
        p_target_id: userId,
        p_reason: reason,
        p_request_id: crypto.randomUUID(),
      })
      if (error) throw error
      setUsers((currentUsers) => currentUsers.map(
        (candidate) => candidate.id === userId ? { ...candidate, status: newStatus } : candidate,
      ))
    } catch {
      alert('ไม่สามารถเปลี่ยนสถานะบัญชีได้ กรุณาตรวจสอบสิทธิ์และลองใหม่')
    } finally {
      setSavingUser(null)
    }
  }

  // v1.2.0: Approve pending user via RPC
  const handleApproveUser = async (userId: string) => {
    if (!adminMutationsEnabled) {
      alert('การจัดการบัญชีถูกปิดชั่วคราวระหว่างปรับปรุงสิทธิ์')
      return
    }
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser?.requested_department || !targetUser?.requested_sector) {
      alert('ผู้ใช้ยังไม่ได้เลือกฝ่าย/ส่วน กรุณาให้ผู้ใช้ลงทะเบียนสังกัดก่อน')
      return
    }

    if (!confirm(`ยืนยันอนุมัติ ${targetUser.email}?\n\nฝ่าย: ${targetUser.requested_department.name}\nส่วน: ${targetUser.requested_sector.name}`)) {
      return
    }

    setApprovingUser(userId)
    try {
      await requireV2AdminMutationAuthority()
      const { error } = await supabase.rpc('admin_approve_user', {
        p_target_id: userId,
        p_request_id: crypto.randomUUID(),
        p_reason: 'อนุมัติข้อมูลและสังกัดตามคำขอ',
      })
      if (error) throw error
      // Update local state
      setUsers((currentUsers) => currentUsers.map((candidate) => candidate.id === userId ? {
        ...candidate,
        status: 'active' as const,
        department: targetUser.requested_department,
        sector: targetUser.requested_sector,
        onboarding_completed: true
      } : candidate))
    } catch {
      alert('ไม่สามารถอนุมัติบัญชีได้ กรุณาตรวจสอบสิทธิ์และข้อมูลล่าสุด')
    } finally {
      setApprovingUser(null)
    }
  }

  // v1.2.0: Reject pending user via RPC  
  const handleRejectUser = async (userId: string) => {
    if (!adminMutationsEnabled) {
      alert('การจัดการบัญชีถูกปิดชั่วคราวระหว่างปรับปรุงสิทธิ์')
      return
    }
    const note = prompt('ระบุเหตุผลที่ปฏิเสธ:')?.trim()
    if (!note) return

    setApprovingUser(userId)
    try {
      await requireV2AdminMutationAuthority()
      const { error } = await supabase.rpc('admin_reject_user', {
        p_target_id: userId,
        p_reason: note,
        p_request_id: crypto.randomUUID(),
      })
      if (error) throw error
      alert('ปฏิเสธเรียบร้อย ผู้ใช้สามารถแก้ไขสังกัดและส่งใหม่ได้')
      await refreshUsers()
    } catch {
      alert('ไม่สามารถปฏิเสธบัญชีได้ กรุณาตรวจสอบสิทธิ์และข้อมูลล่าสุด')
    } finally {
      setApprovingUser(null)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Redirect handled in useEffect, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Check if current user is admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground mb-4">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
          <Link href="/" className="text-blue-600 hover:underline">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  const pendingCount = users.filter(u => u.status === 'pending').length
  const catalogEntryStatus = {
    loading: {
      label: 'กำลังตรวจสถานะ',
      description: 'กำลังตรวจว่าเครื่องมือแก้ไขพร้อมใช้งานหรืออยู่ในโหมดอ่านอย่างเดียว',
      variant: 'outline' as const,
    },
    enabled: {
      label: 'พร้อมแก้ไข',
      description: 'เปิดดูบัญชีราคาและใช้เครื่องมือแก้ไขตามสิทธิ์ผู้ดูแลระบบได้',
      variant: 'default' as const,
    },
    'read-only': {
      label: 'เปิดดูอย่างเดียว',
      description: 'บัญชีปัจจุบัน ทะเบียนฉบับ และประวัติยังเปิดดูได้ โดยเครื่องมือแก้ไขถูกปิดไว้',
      variant: 'outline' as const,
    },
    unavailable: {
      label: 'ตรวจสถานะไม่ได้',
      description: 'ยังเปิดดู Master Catalog ได้ แต่เครื่องมือแก้ไขจะปิดแบบปลอดภัยจนกว่าจะอ่านการตั้งค่าได้',
      variant: 'destructive' as const,
    },
  }[catalogAdminEntryState]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">จัดการผู้ใช้งาน</h1>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {pendingCount} รอการอนุมัติ
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{users.length} ผู้ใช้</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Master Catalog</CardTitle>
            <Badge variant={catalogEntryStatus.variant}>{catalogEntryStatus.label}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <Database className="size-4" />
                </div>
                <div>
                  <div className="font-medium">บัญชีราคามาตรฐาน</div>
                  <div className="text-sm text-muted-foreground">
                    {catalogEntryStatus.description}
                  </div>
                  {catalogSettingsIssue ? (
                    <div className="mt-1 text-sm text-destructive" role="status">
                      {catalogSettingsIssue}
                    </div>
                  ) : null}
                </div>
              </div>
              <Button asChild>
                <Link href="/admin/master-catalog">เปิด Master Catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !adminMutationsEnabled && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertDescription>
              ขณะนี้ดูทะเบียนผู้ใช้ได้ตามปกติ แต่การอนุมัติ เปลี่ยนบทบาท และเปลี่ยนสถานะถูกปิดชั่วคราวจนกว่าฐานข้อมูลสิทธิ์รุ่นใหม่จะพร้อม
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>สังกัด</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className={savingUser === u.id ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="font-medium">
                        {[u.title, u.first_name, u.last_name].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ'}
                      </div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {/* v1.2.0: Show actual or requested org */}
                      {u.department?.name ? (
                        <>
                          <div>{u.department.name}</div>
                          <div className="text-xs text-muted-foreground">{u.sector?.name || ''}</div>
                        </>
                      ) : u.requested_department?.name ? (
                        <>
                          <div className="text-amber-600">
                            (ขอ) {u.requested_department.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            {u.requested_sector?.name || 'ยังไม่เลือกส่วน'}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">ยังไม่ได้ลงทะเบียน</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === u.id ? (
                        <Select
                          value={u.role}
                          onValueChange={(v) => handleRoleChange(u.id, v as UserRole)}
                          disabled={!adminMutationsEnabled || savingUser === u.id || u.status !== 'active'}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                            <SelectItem value="dept_manager">ผู้จัดการฝ่าย</SelectItem>
                            <SelectItem value="sector_manager">ผู้จัดการส่วน</SelectItem>
                            <SelectItem value="staff">พนักงาน</SelectItem>
                            <SelectItem value="procurement">จัดซื้อจัดจ้าง</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setEditingUser(u.id)}
                          disabled={!adminMutationsEnabled || u.id === user?.id || u.status !== 'active'}
                          title={u.status === 'active' ? 'เปลี่ยนบทบาท' : 'เปลี่ยนบทบาทได้เฉพาะบัญชีที่กำลังใช้งาน'}
                        >
                          {getRoleLabel(u.role)}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.status}
                        onValueChange={(v) => handleStatusChange(u.id, v as 'active' | 'inactive' | 'suspended' | 'pending')}
                        disabled={!adminMutationsEnabled || savingUser === u.id || u.id === user?.id || u.status === 'pending'}
                      >
                        <SelectTrigger className={`w-[130px] ${u.status === 'pending' ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">ใช้งาน</SelectItem>
                          {u.status === 'pending' && (
                            <SelectItem value="pending" disabled>รอการอนุมัติ</SelectItem>
                          )}
                          {u.status === 'active' && (
                            <>
                              <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                              <SelectItem value="suspended">ระงับ</SelectItem>
                            </>
                          )}
                          {u.status === 'inactive' && (
                            <SelectItem value="inactive" disabled>ไม่ใช้งาน</SelectItem>
                          )}
                          {u.status === 'suspended' && (
                            <SelectItem value="suspended" disabled>ระงับ</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* v1.2.0: Show approve/reject for pending with requested org */}
                        {u.status === 'pending' && u.onboarding_completed && u.id !== user?.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveUser(u.id)}
                              disabled={!adminMutationsEnabled || approvingUser === u.id}
                              className="h-7 bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              {approvingUser === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectUser(u.id)}
                              disabled={!adminMutationsEnabled || approvingUser === u.id}
                              className="h-7 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  )
}

// Dynamic export to prevent SSR/prerendering issues with useAuth
const DynamicAdminContent = nextDynamic(() => Promise.resolve(AdminContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
})

export default function AdminPage() {
  return <DynamicAdminContent />
}
