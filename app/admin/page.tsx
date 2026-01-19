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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect handled in useEffect, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if current user is admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-4">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
          <Link href="/" className="text-blue-600 hover:underline">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    const labels: Record<string, string> = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
      suspended: 'ระงับ',
      pending: 'รอการอนุมัติ',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
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
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← กลับ
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">จัดการผู้ใช้งาน</h1>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  {pendingCount} รอการอนุมัติ
                </span>
              )}
              <span className="text-sm text-gray-500">{users.length} ผู้ใช้</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Settings Section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">ตั้งค่าระบบ</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">จำกัดการสมัครเฉพาะอีเมล @ntplc.co.th</p>
              <p className="text-sm text-gray-500">เมื่อเปิดใช้งาน ผู้ใช้สามารถสมัครได้เฉพาะอีเมลของ NT เท่านั้น</p>
            </div>
            <button
              onClick={handleToggleEmailRestriction}
              disabled={savingSettings}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${restrictEmailDomain ? 'bg-blue-600' : 'bg-gray-200'}
                ${savingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${restrictEmailDomain ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ใช้</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สังกัด</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className={savingUser === u.id ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {[u.title, u.first_name, u.last_name].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ'}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {/* v1.2.0: Show actual or requested org */}
                      {u.department?.name ? (
                        <>
                          <div>{u.department.name}</div>
                          <div className="text-xs">{u.sector?.name || ''}</div>
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
                        <span className="text-gray-400">ยังไม่ได้ลงทะเบียน</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === u.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-sm border rounded px-2 py-1"
                          disabled={savingUser === u.id}
                        >
                          <option value="admin">ผู้ดูแลระบบ</option>
                          <option value="dept_manager">ผู้จัดการฝ่าย</option>
                          <option value="sector_manager">ผู้จัดการส่วน</option>
                          <option value="staff">พนักงาน</option>
                          <option value="procurement">จัดซื้อจัดจ้าง</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingUser(u.id)}
                          className="text-sm text-blue-600 hover:underline"
                          disabled={u.id === user?.id}
                        >
                          {getRoleLabel(u.role)}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.status}
                        onChange={(e) => handleStatusChange(u.id, e.target.value as 'active' | 'inactive' | 'suspended' | 'pending')}
                        className={`text-sm border rounded px-2 py-1 ${u.status === 'pending' ? 'border-yellow-400 bg-yellow-50' : ''}`}
                        disabled={savingUser === u.id || u.id === user?.id}
                      >
                        <option value="active">ใช้งาน</option>
                        <option value="pending">รอการอนุมัติ</option>
                        <option value="inactive">ไม่ใช้งาน</option>
                        <option value="suspended">ระงับ</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* v1.2.0: Show approve/reject for pending with requested org */}
                        {u.status === 'pending' && u.onboarding_completed && u.id !== user?.id ? (
                          <>
                            <button
                              onClick={() => handleApproveUser(u.id)}
                              disabled={approvingUser === u.id}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {approvingUser === u.id ? '...' : 'อนุมัติ'}
                            </button>
                            <button
                              onClick={() => handleRejectUser(u.id)}
                              disabled={approvingUser === u.id}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        ) : null}
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={deletingUser === u.id}
                            className="text-sm text-red-600 hover:text-red-800 hover:underline
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingUser === u.id ? 'กำลังลบ...' : 'ลบ'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
})

export default function AdminPage() {
  return <DynamicAdminContent />
}
