'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { Department, Sector } from '@/lib/types/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, refreshProfile, signOut } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('')
  const [position, setPosition] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [sectorId, setSectorId] = useState('')

  const [departments, setDepartments] = useState<Department[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load departments and sectors
  useEffect(() => {
    const loadOrgData = async () => {
      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (depts) setDepartments(depts)
    }
    loadOrgData()
  }, [supabase])

  // Load sectors when department changes
  useEffect(() => {
    const loadSectors = async () => {
      if (!departmentId) {
        setSectors([])
        return
      }
      const { data: sects } = await supabase
        .from('sectors')
        .select('*')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name')
      
      if (sects) setSectors(sects)
    }
    loadSectors()
  }, [departmentId, supabase])

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setTitle(user.title || '')
      setPosition(user.position || '')
      setEmployeeId(user.employee_id || '')
      setPhone(user.phone || '')
      setDepartmentId(user.department_id || '')
      setSectorId(user.sector_id || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        title,
        position,
        employee_id: employeeId || null,
        phone: phone || null,
        department_id: departmentId || null,
        sector_id: sectorId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setIsSaving(false)

    if (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' })
      await refreshProfile()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์</h1>
            <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัว</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.status === 'active' && (
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← กลับหน้าหลัก
              </Link>
            )}
            <button
              onClick={signOut}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pending Status Banner */}
        {user?.status === 'pending' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-amber-800">บัญชีของคุณอยู่ระหว่างรอการยืนยันสังกัดจากผู้ดูแลระบบ</h3>
                <p className="text-sm text-amber-700 mt-1">
                  ขณะนี้คุณสามารถสร้างและแก้ไข BOQ ของตนเองได้ แต่ยังไม่สามารถลบ/อนุมัติ BOQ ได้
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  กรุณากรอกข้อมูลโปรไฟล์ให้ครบถ้วน โดยเฉพาะข้อมูลสังกัด เพื่อให้ผู้ดูแลระบบพิจารณาอนุมัติ
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inactive Status - Full Screen Block */}
        {user?.status === 'inactive' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg mx-auto mt-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">บัญชีถูกระงับการใช้งาน</h2>
            <p className="text-gray-600 mb-6">
              บัญชีของคุณถูกระงับการใช้งานชั่วคราว<br />
              หากต้องการใช้งานอีกครั้ง กรุณาติดต่อผู้ดูแลระบบ
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm text-gray-500">อีเมลที่ลงทะเบียน</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700
                         transition-colors font-medium"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}

        {/* Normal Profile Form - Only for active/pending users */}
        {user?.status !== 'inactive' && (
        <div className="bg-white rounded-lg shadow p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email & Role (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300
                           rounded-md text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน</label>
                <input
                  type="text"
                  value={getRoleLabel(user.role)}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300
                           rounded-md text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">คำนำหน้า</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือก...</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Position & Employee ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="เช่น วิศวกร 6"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Department & Sector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">ฝ่าย</label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value)
                    setSectorId('')
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกฝ่าย...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.full_name || dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ส่วน</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  disabled={!departmentId}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">เลือกส่วน...</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.full_name || sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>

          {/* Change Password Section */}
          <ChangePasswordSection />
        </div>
        )}
      </main>
    </div>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    dept_manager: 'ผู้จัดการฝ่าย',
    sector_manager: 'ผู้จัดการส่วน',
    staff: 'พนักงาน',
    procurement: 'จัดซื้อจัดจ้าง',
  }
  return labels[role] || role
}

function ChangePasswordSection() {
  const supabase = createClient()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
      return
    }

    setIsChanging(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    setIsChanging(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            className="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            className="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isChanging}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </div>
      </form>
    </div>
  )
}
