import { describe, expect, it } from 'vitest'
import type { AdminDirectoryRecord, DirectoryReference } from '../lib/admin/users/directory'
import { presentAdminUser } from '../lib/admin/users/presentation'

const id = '00000000-0000-4000-8000-000000000001'
const empty = (): DirectoryReference => ({ state: 'unassigned', id: null, name: null })
const named = (name: string): DirectoryReference => ({ state: 'resolved', id, name })
function record(extra: Partial<AdminDirectoryRecord> = {}): AdminDirectoryRecord {
  return {
    id, email: 'synthetic@example.invalid', title: null, first_name: 'ผู้ทดสอบ', last_name: 'สมมติ',
    position: null, role: 'staff', status: 'active', source: 'v2',
    created_at: '2026-11-01T08:00:00.123456+00:00', updated_at: '2026-11-01T08:00:00+00:00',
    org_id: null, department_id: null, sector_id: null, requested_department_id: null, requested_sector_id: null,
    approved_at: null, approved_by: null, rejected_at: null, rejected_by: null, admin_note: null,
    onboarding_completed: true, organization: empty(), department: empty(), sector: empty(),
    requested_department: empty(), requested_sector: empty(), ...extra,
  }
}

describe('single truthful Admin presenter', () => {
  it('does not reclassify active legacy accounts or treat requested names as actual affiliation', () => {
    const original = record({ requested_department_id: id, requested_sector_id: id,
      requested_department: named('ฝ่ายที่ยื่นขอ'), requested_sector: named('ส่วนที่ยื่นขอ') })
    const shown = presentAdminUser(original)
    expect(shown.statusLabel).toBe('ใช้งาน')
    expect(shown.pendingLabel).toBeNull()
    expect(shown.actualAffiliation).toEqual({ state: 'unassigned', lines: ['ยังไม่ได้กำหนดสังกัด'] })
    expect(shown.requestedAffiliation.lines).toEqual(['ฝ่ายที่ยื่นขอ', 'ส่วนที่ยื่นขอ'])
    expect(shown.canApprove).toBe(false)
    expect(original.department_id).toBeNull()
    expect(original.approved_at).toBeNull()
    expect(shown.metadata.map((field) => field.value).join(' ')).not.toContain('ไม่เคยอนุมัติ')
  })

  it('uses role-aware missing-level wording without making every absent sector invalid', () => {
    const department = named('ฝ่ายจริง')
    expect(presentAdminUser(record({ role: 'dept_manager', department })).actualAffiliation)
      .toEqual({ state: 'ready', lines: ['ฝ่ายจริง'] })
    expect(presentAdminUser(record({ role: 'admin', department })).actualAffiliation.lines).toEqual(['ฝ่ายจริง'])
    expect(presentAdminUser(record({ role: 'staff', department })).actualAffiliation.lines)
      .toEqual(['ฝ่ายจริง', 'ยังไม่ได้กำหนดส่วน'])
  })

  it.each(['unavailable', 'missing'] as const)('keeps %s lookup distinct from NULL while retaining known names', (state) => {
    const shown = presentAdminUser(record({ department: named('ฝ่ายที่อ่านได้'), sector: { state, id, name: null } }))
    expect(shown.actualAffiliation.state).toBe(state)
    expect(shown.actualAffiliation.lines).toContain('ฝ่ายที่อ่านได้')
    expect(shown.actualAffiliation.lines).not.toContain('ยังไม่ได้กำหนดสังกัด')
  })

  it('never fabricates absent legacy fields as NULL, approval or verification facts', () => {
    const shown = presentAdminUser(record({ source: 'legacy-read-only', role: 'admin',
      org_id: undefined, department_id: undefined, sector_id: undefined,
      organization: { state: 'unsupported', id: undefined, name: null },
      department: named('ฝ่ายที่อ่านได้'), updated_at: undefined, approved_at: undefined,
      rejected_at: undefined, admin_note: undefined }))
    expect(shown.actualAffiliation.state).toBe('unsupported')
    expect(shown.actualAffiliation.lines).toContain('ฝ่ายที่อ่านได้')
    expect(shown.metadata.find((entry) => entry.label === 'ข้อมูลวันที่อนุมัติ')?.value).toContain('ไม่รองรับ')
    expect(JSON.stringify(shown)).not.toMatch(/verified|ยืนยันอีเมล|ไม่เคยอนุมัติ|ไม่เคยส่งกลับ/)
    expect(shown.canApprove).toBe(false)
    expect(shown.canReject).toBe(false)
  })

  it('prioritizes rejection over submitted and incomplete pending states without adding a status', () => {
    expect(presentAdminUser(record({ status: 'pending', rejected_at: '2026-11-01T08:00:00Z', admin_note: 'แก้ชื่อ' })).pendingLabel).toBe('ส่งกลับแก้ไข')
    expect(presentAdminUser(record({ status: 'pending' })).pendingLabel).toBe('ส่งข้อมูลแล้ว รออนุมัติ')
    expect(presentAdminUser(record({ status: 'pending', onboarding_completed: false })).pendingLabel).toBe('ยังกรอกข้อมูลไม่ครบ')
    expect(presentAdminUser(record({ status: 'pending', rejected_at: '2026-11-01T08:00:00Z' })).status).toBe('pending')
  })

  it('keeps existing reject availability independent of requested-reference errors', () => {
    const shown = presentAdminUser(record({ status: 'pending', requested_department: named('ฝ่าย'),
      requested_sector: { state: 'unavailable', id, name: null } }))
    expect(shown.canApprove).toBe(false)
    expect(shown.canReject).toBe(true)
    const complete = presentAdminUser(record({ status: 'pending', requested_department: named('ฝ่าย'), requested_sector: named('ส่วน') }))
    expect(complete.canApprove).toBe(true)
    expect(presentAdminUser(record({ status: 'pending', onboarding_completed: false, requested_department: named('ฝ่าย'), requested_sector: named('ส่วน') })).canApprove).toBe(false)
  })

  it('uses supplied metadata only and preserves long Thai/plain-text content', () => {
    const long = 'ชื่อภาษาไทยและข้อความที่ยาวมาก '.repeat(12)
    const shown = presentAdminUser(record({ first_name: long, last_name: '', admin_note: '<script>alert(1)</script>' }))
    expect(shown.displayName).toBe(long)
    expect(shown.metadata.find((entry) => entry.label === 'หมายเหตุที่บันทึก')?.value).toBe('<script>alert(1)</script>')
    expect(Object.keys(shown)).not.toContain('signature_url')
    expect(shown.metadata.some((entry) => /ผู้อนุมัติ|อีเมลยืนยัน|จำนวนประวัติ/.test(entry.label))).toBe(false)
  })
})
