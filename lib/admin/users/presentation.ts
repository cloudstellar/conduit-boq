import { getRoleLabel } from '../../permissions'
import type { UserRole, UserStatus } from '../../types/auth'
import type { AdminDirectoryRecord, DirectoryReference } from './directory'

export interface AdminAffiliationPresentation {
  state: 'ready' | 'unassigned' | 'unavailable' | 'missing' | 'unsupported'
  lines: string[]
}

export interface AdminUserPresentation {
  id: string
  displayName: string
  email: string
  role: UserRole
  status: UserStatus
  roleLabel: string
  statusLabel: string
  pendingLabel: string | null
  actualAffiliation: AdminAffiliationPresentation
  requestedAffiliation: AdminAffiliationPresentation
  canApprove: boolean
  canReject: boolean
  metadata: { label: string; value: string }[]
}

const statusLabels: Record<UserStatus, string> = {
  active: 'ใช้งาน', pending: 'รอการอนุมัติ', inactive: 'ไม่ใช้งาน', suspended: 'ระงับ',
}

function group(
  references: DirectoryReference[],
  emptyLabel: string,
  required: { reference: DirectoryReference; label: string }[] = [],
): AdminAffiliationPresentation {
  const lines = references.flatMap((entry) => entry.state === 'resolved' ? [entry.name] : [])
  const unavailable = references.some((entry) => entry.state === 'unavailable')
  const missing = references.some((entry) => entry.state === 'missing')
  const unsupported = references.some((entry) => entry.state === 'unsupported')
  if (unavailable) lines.push('โหลดชื่อสังกัดไม่สำเร็จ')
  if (missing) lines.push('ไม่พบข้อมูลสังกัดในผลที่อ่านได้')
  if (unsupported) lines.push('ข้อมูลนี้ไม่รองรับครบในโหมดอ่านอย่างเดียว')
  if (unavailable || missing || unsupported) return {
    state: unavailable ? 'unavailable' : missing ? 'missing' : 'unsupported', lines,
  }
  if (!lines.length) return { state: 'unassigned', lines: [emptyLabel] }
  const unassigned = required.filter((entry) => entry.reference.state === 'unassigned')
  lines.push(...unassigned.map((entry) => entry.label))
  return { state: unassigned.length ? 'unassigned' : 'ready', lines }
}

function recordedDate(value: string | null | undefined): string {
  if (value === undefined) return 'ข้อมูลนี้ไม่รองรับในโหมดอ่านอย่างเดียว'
  if (value === null) return 'ไม่มีข้อมูลในรายการที่อ่านได้'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'ไม่สามารถแสดงวันเวลาที่อ่านได้'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function presentAdminUser(record: AdminDirectoryRecord): AdminUserPresentation {
  const pendingLabel = record.status !== 'pending' ? null
    : record.rejected_at ? 'ส่งกลับแก้ไข'
      : record.onboarding_completed ? 'ส่งข้อมูลแล้ว รออนุมัติ' : 'ยังกรอกข้อมูลไม่ครบ'
  const actualRequired = record.role === 'admin' ? []
    : record.role === 'dept_manager' ? [{ reference: record.department, label: 'ยังไม่ได้กำหนดฝ่าย' }]
      : record.role === 'staff' || record.role === 'sector_manager'
        ? [{ reference: record.sector, label: 'ยังไม่ได้กำหนดส่วน' }] : []
  return {
    id: record.id,
    displayName: [record.title, record.first_name, record.last_name].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ',
    email: record.email || 'ไม่มีอีเมลในข้อมูลที่อ่านได้',
    role: record.role, status: record.status,
    roleLabel: getRoleLabel(record.role), statusLabel: statusLabels[record.status], pendingLabel,
    actualAffiliation: group([record.organization, record.department, record.sector], 'ยังไม่ได้กำหนดสังกัด', actualRequired),
    requestedAffiliation: group([record.requested_department, record.requested_sector], 'ยังไม่ได้ยื่นขอสังกัด', [
      { reference: record.requested_department, label: 'ยังไม่ได้เลือกฝ่าย' },
      { reference: record.requested_sector, label: 'ยังไม่ได้เลือกส่วน' },
    ]),
    canApprove: record.source === 'v2' && record.status === 'pending' && record.onboarding_completed
      && record.requested_department.state === 'resolved' && record.requested_sector.state === 'resolved',
    canReject: record.source === 'v2' && record.status === 'pending' && record.onboarding_completed,
    metadata: [
      { label: 'สร้างบัญชี', value: recordedDate(record.created_at) },
      { label: 'ปรับปรุงข้อมูล', value: recordedDate(record.updated_at) },
      { label: 'ข้อมูลวันที่อนุมัติ', value: recordedDate(record.approved_at) },
      { label: 'ข้อมูลวันที่ส่งกลับ', value: recordedDate(record.rejected_at) },
      { label: 'หมายเหตุที่บันทึก', value: record.admin_note === undefined
        ? 'ข้อมูลนี้ไม่รองรับในโหมดอ่านอย่างเดียว'
        : record.admin_note || 'ไม่มีข้อมูลในรายการที่อ่านได้' },
    ],
  }
}
