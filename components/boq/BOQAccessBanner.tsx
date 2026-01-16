'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { can, getRoleLabel, BOQContext } from '@/lib/permissions'

interface BOQAccessBannerProps {
  boq?: BOQContext | null
  mode: 'list' | 'create' | 'edit' | 'view'
}

interface PermissionInfo {
  can: boolean
  reason?: string
}

export default function BOQAccessBanner({ boq, mode }: BOQAccessBannerProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isPending = user.status === 'pending'

  // Calculate scope description based on user role and status
  const getScopeDescription = (): string => {
    // Pending users have limited scope
    if (isPending) {
      return 'เห็นเฉพาะ BOQ ของตัวเอง (รอยืนยันสังกัด)'
    }

    switch (user.role) {
      case 'admin':
        return 'เห็น BOQ ทั้งหมดในระบบ'
      case 'dept_manager':
        return `เห็น BOQ ของฝ่าย${user.department?.name || user.department?.full_name || ''}`
      case 'sector_manager':
        return `เห็น BOQ ของส่วน${user.sector?.name || user.sector?.full_name || ''} และทั้งฝ่าย`
      case 'staff':
        return `เห็น BOQ ของตัวเอง และใน${user.sector?.name || user.sector?.full_name || ''}`
      case 'procurement':
        return `เห็น BOQ ที่อนุมัติแล้วของฝ่าย${user.department?.name || ''}`
      default:
        return ''
    }
  }

  // Get permission info with reasons
  const getPermissions = (): Record<string, PermissionInfo> => {
    const permissions: Record<string, PermissionInfo> = {}

    // Create permission
    permissions.create = {
      can: can(user, 'create', 'boq'),
      reason: user.role === 'procurement' ? 'จัดซื้อจัดจ้างไม่สามารถสร้าง BOQ ได้' : undefined
    }

    // Edit/Delete permissions (need BOQ context)
    if (boq) {
      const isOwner = boq.created_by === user.id
      const isLegacy = !boq.created_by

      permissions.edit = {
        can: can(user, 'update', 'boq', boq),
        reason: !can(user, 'update', 'boq', boq)
          ? (isOwner ? undefined : 'คุณไม่ใช่เจ้าของ BOQ นี้')
          : undefined
      }

      permissions.delete = {
        can: can(user, 'delete', 'boq', boq),
        reason: !can(user, 'delete', 'boq', boq)
          ? (isPending
              ? 'รอยืนยันสังกัด - ยังไม่สามารถลบ BOQ ได้'
              : (boq.status !== 'draft' ? 'ลบได้เฉพาะ BOQ สถานะ Draft เท่านั้น' : 'คุณไม่มีสิทธิ์ลบ BOQ นี้'))
          : undefined
      }

      permissions.approve = {
        can: can(user, 'approve', 'boq', boq),
        reason: !can(user, 'approve', 'boq', boq)
          ? (isPending
              ? 'รอยืนยันสังกัด - ยังไม่สามารถอนุมัติ BOQ ได้'
              : (boq.created_by === user.id ? 'ไม่สามารถอนุมัติ BOQ ที่ตัวเองสร้าง' : 'ไม่มีสิทธิ์อนุมัติ'))
          : undefined
      }

      // Legacy BOQ note
      if (isLegacy) {
        permissions.legacy = { can: true, reason: 'BOQ เก่า (ก่อนระบบสิทธิ์) - ทุกคนแก้ไขได้' }
      }
    }

    return permissions
  }

  const permissions = getPermissions()
  const scope = getScopeDescription()

  // Different banner styles based on mode and status
  const getBannerStyle = () => {
    if (isPending) {
      return 'bg-amber-50 border-amber-200 text-amber-800'
    }
    if (mode === 'create' && !permissions.create.can) {
      return 'bg-red-50 border-red-200 text-red-800'
    }
    if (mode === 'edit' && boq && !permissions.edit?.can) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return (
    <div className={`rounded-lg border px-4 py-3 ${getBannerStyle()}`}>
      {/* Pending user warning */}
      {isPending && (
        <div className="mb-2 pb-2 border-b border-amber-200">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">บัญชีของคุณอยู่ระหว่างรอการยืนยันสังกัดจากผู้ดูแลระบบ</p>
              <p className="text-sm mt-0.5">ขณะนี้คุณสามารถสร้างและแก้ไข BOQ ของตนเองได้ แต่ยังไม่สามารถลบ/อนุมัติ BOQ ได้</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {/* Scope */}
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-medium">{scope}</span>
        </div>

        {/* Divider */}
        <span className="hidden sm:inline text-gray-300">|</span>

        {/* Role */}
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>สิทธิ์: {getRoleLabel(user.role)}</span>
        </div>

        {/* Warning/Info messages */}
        {permissions.legacy?.can && (
          <>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-orange-600 text-xs">{permissions.legacy.reason}</span>
          </>
        )}

        {mode === 'edit' && permissions.edit && !permissions.edit.can && permissions.edit.reason && (
          <>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-red-600 font-medium">{permissions.edit.reason}</span>
          </>
        )}
      </div>
    </div>
  )
}

