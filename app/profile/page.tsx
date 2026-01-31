'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import { Department, Sector } from '@/lib/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, LogOut, Clock, Ban, Home } from 'lucide-react'

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
  // v1.2.0: Requested org for onboarding
  const [requestedDepartmentId, setRequestedDepartmentId] = useState('')
  const [requestedSectorId, setRequestedSectorId] = useState('')
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // v1.2.0: Can user edit org fields?
  const canEditOrg = !onboardingCompleted

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
  // v1.2.0: Use requestedDepartmentId for pending users, departmentId for approved
  useEffect(() => {
    const loadSectors = async () => {
      const deptToLoad = canEditOrg ? requestedDepartmentId : departmentId
      if (!deptToLoad) {
        setSectors([])
        return
      }
      const { data: sects } = await supabase
        .from('sectors')
        .select('*')
        .eq('department_id', deptToLoad)
        .eq('is_active', true)
        .order('name')

      if (sects) setSectors(sects)
    }
    loadSectors()
  }, [canEditOrg, requestedDepartmentId, departmentId, supabase])

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
      // v1.2.0: Load onboarding state
      setOnboardingCompleted((user as any).onboarding_completed ?? false)
      setRequestedDepartmentId((user as any).requested_department_id || '')
      setRequestedSectorId((user as any).requested_sector_id || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    // v1.2.0: Build update payload based on onboarding status
    const updatePayload: Record<string, any> = {
      first_name: firstName,
      last_name: lastName,
      title,
      position,
      employee_id: employeeId || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    }

    // v1.2.0: If not yet onboarded, save to requested_* and mark complete
    if (!onboardingCompleted) {
      updatePayload.requested_department_id = requestedDepartmentId || null
      updatePayload.requested_sector_id = requestedSectorId || null
      updatePayload.onboarding_completed = true
    }
    // Note: actual department_id/sector_id are set by admin via RPC

    const { error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', user.id)

    setIsSaving(false)

    if (error) {
      // v1.2.0: Handle trigger error for locked fields
      if (error.message.includes('locked after onboarding')) {
        setMessage({ type: 'error', text: 'ไม่สามารถแก้ไขสังกัดได้ กรุณาติดต่อผู้ดูแลระบบ' })
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + error.message })
      }
    } else {
      // Show different message for first-time onboarding vs regular save
      if (!onboardingCompleted) {
        setMessage({
          type: 'success',
          text: '✅ ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกส่งไปยังผู้ดูแลระบบแล้ว ระหว่างรอการอนุมัติ คุณสามารถสร้าง BOQ ได้เลย'
        })
      } else {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' })
      }
      await refreshProfile()
      setOnboardingCompleted(true) // Update local state
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <p className="text-sm text-muted-foreground">จัดการข้อมูลส่วนตัว</p>
          </div>
          <div className="flex items-center gap-4">
            {(user?.status === 'active' || user?.status === 'pending') && (
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                กลับหน้าหลัก
              </Link>
            )}
            <Button variant="ghost" onClick={signOut} className="text-red-600 hover:text-red-800">
              <LogOut className="h-4 w-4 mr-1" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pending Status Banner */}
        {user?.status === 'pending' && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="ml-2">
              <p className="font-medium text-amber-800">บัญชีของคุณอยู่ระหว่างรอการยืนยันสังกัดจากผู้ดูแลระบบ</p>
              <p className="text-sm text-amber-700 mt-1">
                ขณะนี้คุณสามารถสร้างและแก้ไข BOQ ของตนเองได้ แต่ยังไม่สามารถลบ/อนุมัติ BOQ ได้
              </p>
              <p className="text-sm text-amber-700 mt-1">
                กรุณากรอกข้อมูลโปรไฟล์ให้ครบถ้วน โดยเฉพาะข้อมูลสังกัด เพื่อให้ผู้ดูแลระบบพิจารณาอนุมัติ
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Inactive Status - Full Screen Block */}
        {user?.status === 'inactive' && (
          <Card className="max-w-lg mx-auto mt-8 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">บัญชีถูกระงับการใช้งาน</h2>
              <p className="text-muted-foreground mb-6">
                บัญชีของคุณถูกระงับการใช้งานชั่วคราว<br />
                หากต้องการใช้งานอีกครั้ง กรุณาติดต่อผู้ดูแลระบบ
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm text-muted-foreground">อีเมลที่ลงทะเบียน</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <Button variant="destructive" className="w-full" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Normal Profile Form - Only for active/pending users */}
        {user?.status !== 'inactive' && (
          <Card>
            <CardContent className="pt-6">
              {message && (
                <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </AlertDescription>
                  {message.type === 'success' && user?.status === 'pending' && (
                    <div className="mt-4">
                      <Link href="/">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Home className="h-4 w-4 mr-2" />
                          ไปหน้าหลักเพื่อสร้าง BOQ
                        </Button>
                      </Link>
                    </div>
                  )}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email & Role (read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>อีเมล</Label>
                    <Input value={user.email || ''} disabled className="bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label>สิทธิ์การใช้งาน</Label>
                    <Input value={getRoleLabel(user.role)} disabled className="bg-gray-100" />
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>คำนำหน้า</Label>
                    <Select value={title || '__NONE__'} onValueChange={(v) => setTitle(v === '__NONE__' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__NONE__">เลือก...</SelectItem>
                        <SelectItem value="นาย">นาย</SelectItem>
                        <SelectItem value="นาง">นาง</SelectItem>
                        <SelectItem value="นางสาว">นางสาว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ชื่อ *</Label>
                    <Input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>นามสกุล</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Position & Employee ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>ตำแหน่ง</Label>
                    <Input
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="เช่น วิศวกร 6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>รหัสพนักงาน</Label>
                    <Input
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                </div>

                {/* Department & Sector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>ฝ่าย</Label>
                    {canEditOrg ? (
                      <Select
                        value={requestedDepartmentId || '__NONE__'}
                        onValueChange={(v) => {
                          setRequestedDepartmentId(v === '__NONE__' ? '' : v)
                          setRequestedSectorId('')
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกฝ่าย..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">เลือกฝ่าย...</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.full_name || dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 border rounded-md text-muted-foreground">
                        {departments.find(d => d.id === departmentId)?.name || 'ยังไม่ได้กำหนด'}
                        <span className="ml-2 text-xs text-amber-600">(ติดต่อ Admin เพื่อเปลี่ยน)</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>ส่วน</Label>
                    {canEditOrg ? (
                      <Select
                        value={requestedSectorId || '__NONE__'}
                        onValueChange={(v) => setRequestedSectorId(v === '__NONE__' ? '' : v)}
                        disabled={!requestedDepartmentId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกส่วน..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">เลือกส่วน...</SelectItem>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.full_name || sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 border rounded-md text-muted-foreground">
                        {sectors.find(s => s.id === sectorId)?.name || 'ยังไม่ได้กำหนด'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึก'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Change Password Section */}
        {user?.status !== 'inactive' && <ChangePasswordSection />}
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
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label>รหัสผ่านใหม่</Label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="max-w-md"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>
          <div className="space-y-2">
            <Label>ยืนยันรหัสผ่านใหม่</Label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="max-w-md"
              placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isChanging}>
            {isChanging ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังเปลี่ยน...
              </>
            ) : (
              'เปลี่ยนรหัสผ่าน'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
