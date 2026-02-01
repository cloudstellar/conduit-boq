'use client'

// Force dynamic rendering to prevent prerender error on Vercel
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { UserRole } from '@/lib/types/auth'
import { getRoleLabel } from '@/lib/permissions'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Check, X, Trash2 } from 'lucide-react'

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

function AdminContent() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [savingUser, setSavingUser] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const [approvingUser, setApprovingUser] = useState<string | null>(null)
  const [restrictEmailDomain, setRestrictEmailDomain] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin')
    }
  }, [authLoading, user, router])

  // Load users and settings in parallel
  useEffect(() => {
    if (!user || user.role !== 'admin') return

    let cancelled = false

    const loadData = async () => {
      try {
        const [usersRes, settingsRes] = await Promise.all([
          supabase.from('user_profiles').select(`
            id, email, first_name, last_name, title, position, role, status, created_at, onboarding_completed,
            department:departments!user_profiles_department_id_fkey(id, name),
            sector:sectors!user_profiles_sector_id_fkey(id, name),
            requested_department:departments!user_profiles_requested_department_id_fkey(id, name),
            requested_sector:sectors!user_profiles_requested_sector_id_fkey(id, name)
          `).order('created_at', { ascending: false }),
          supabase.from('app_settings').select('key, value').eq('key', 'restrict_email_domain').single()
        ])

        if (cancelled) return

        if (usersRes.error) {
          setError(usersRes.error.message)
        } else {
          setUsers((usersRes.data || []) as unknown as UserProfile[])
        }
        if (settingsRes.data) {
          setRestrictEmailDomain(settingsRes.data.value === true || settingsRes.data.value === 'true')
        }
      } catch (err) {
        console.error('Load error:', err)
      }
      if (!cancelled) {
        setIsLoading(false)
      }
    }
    loadData()

    return () => { cancelled = true }
  }, [user, supabase])

  const refreshUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id, email, first_name, last_name, title, position, role, status, created_at, onboarding_completed,
        department:departments!user_profiles_department_id_fkey(id, name),
        sector:sectors!user_profiles_sector_id_fkey(id, name),
        requested_department:departments!user_profiles_requested_department_id_fkey(id, name),
        requested_sector:sectors!user_profiles_requested_sector_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setUsers((data || []) as unknown as UserProfile[])
    }
    setIsLoading(false)
  }

  const handleToggleEmailRestriction = async () => {
    setSavingSettings(true)
    const newValue = !restrictEmailDomain

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'restrict_email_domain',
        value: newValue,
        updated_at: new Date().toISOString()
      })

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setRestrictEmailDomain(newValue)
    }
    setSavingSettings(false)
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSavingUser(userId)
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingUser(null)
    }
    setSavingUser(null)
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended' | 'pending') => {
    setSavingUser(userId)
    const { error } = await supabase
      .from('user_profiles')
      .update({ status: newStatus })
      .eq('id', userId)

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    }
    setSavingUser(null)
  }

  // v1.2.0: Approve pending user via RPC
  const handleApproveUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser?.requested_department || !targetUser?.requested_sector) {
      alert('ผู้ใช้ยังไม่ได้เลือกฝ่าย/ส่วน กรุณาให้ผู้ใช้ลงทะเบียนสังกัดก่อน')
      return
    }

    if (!confirm(`ยืนยันอนุมัติ ${targetUser.email}?\n\nฝ่าย: ${targetUser.requested_department.name}\nส่วน: ${targetUser.requested_sector.name}`)) {
      return
    }

    setApprovingUser(userId)
    const { error } = await supabase.rpc('admin_approve_user', { p_target_id: userId })

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      // Update local state
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        status: 'active' as const,
        department: targetUser.requested_department,
        sector: targetUser.requested_sector,
        onboarding_completed: true
      } : u))
    }
    setApprovingUser(null)
  }

  // v1.2.0: Reject pending user via RPC  
  const handleRejectUser = async (userId: string) => {
    const note = prompt('หมายเหตุ (ไม่บังคับ):')
    if (note === null) return // User cancelled

    setApprovingUser(userId)
    const { error } = await supabase.rpc('admin_reject_user', {
      p_target_id: userId,
      p_note: note || null
    })

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('ปฏิเสธเรียบร้อย ผู้ใช้สามารถแก้ไขสังกัดและส่งใหม่ได้')
      await refreshUsers()
    }
    setApprovingUser(null)
  }

  const handleDeleteUser = async (userId: string, email: string | null) => {
    const confirmMessage = `ต้องการลบผู้ใช้ ${email || 'ไม่ทราบอีเมล'} หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`
    if (!confirm(confirmMessage)) return

    setDeletingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      // Remove user from list
      setUsers(users.filter(u => u.id !== userId))
      alert('ลบผู้ใช้เรียบร้อยแล้ว')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setDeletingUser(null)
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline',
    }
    const labels: Record<string, string> = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
      suspended: 'ระงับ',
      pending: 'รอการอนุมัติ',
    }
    return (
      <Badge variant={variants[status] || 'secondary'} className={status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}>
        {labels[status] || status}
      </Badge>
    )
  }

  const pendingCount = users.filter(u => u.status === 'pending').length

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
        {/* Settings Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ตั้งค่าระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>จำกัดการสมัครเฉพาะอีเมล @ntplc.co.th</Label>
                <p className="text-sm text-muted-foreground">
                  เมื่อเปิดใช้งาน ผู้ใช้สามารถสมัครได้เฉพาะอีเมลของ NT เท่านั้น
                </p>
              </div>
              <Switch
                checked={restrictEmailDomain}
                onCheckedChange={handleToggleEmailRestriction}
                disabled={savingSettings}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
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
                          disabled={savingUser === u.id}
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
                          disabled={u.id === user?.id}
                        >
                          {getRoleLabel(u.role)}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.status}
                        onValueChange={(v) => handleStatusChange(u.id, v as 'active' | 'inactive' | 'suspended' | 'pending')}
                        disabled={savingUser === u.id || u.id === user?.id}
                      >
                        <SelectTrigger className={`w-[130px] ${u.status === 'pending' ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">ใช้งาน</SelectItem>
                          <SelectItem value="pending">รอการอนุมัติ</SelectItem>
                          <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                          <SelectItem value="suspended">ระงับ</SelectItem>
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
                              disabled={approvingUser === u.id}
                              className="h-7 bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              {approvingUser === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectUser(u.id)}
                              disabled={approvingUser === u.id}
                              className="h-7 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : null}
                        {u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={deletingUser === u.id}
                            className="h-7 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            {deletingUser === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </Button>
                        )}
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
