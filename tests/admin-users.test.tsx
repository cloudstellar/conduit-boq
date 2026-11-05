import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { AdminUserPresentation } from '../lib/admin/users/presentation'
import {
  AdminUsersDirectoryView, type AdminUsersDirectoryProps,
} from '../app/admin/_components/AdminUsersDirectory'
import { AdminUserDetailsContent } from '../app/admin/_components/AdminUserDetailsSheet'

vi.mock('@/lib/utils', () => import('../lib/utils'))
vi.mock('@/lib/permissions', () => import('../lib/permissions'))
vi.mock('@/lib/auth/authorization', () => import('../lib/auth/authorization'))
vi.mock('@/components/ui/alert', () => import('../components/ui/alert'))
vi.mock('@/components/ui/badge', () => import('../components/ui/badge'))
vi.mock('@/components/ui/button', () => import('../components/ui/button'))
vi.mock('@/components/ui/card', () => import('../components/ui/card'))
vi.mock('@/components/ui/select', () => import('../components/ui/select'))
vi.mock('@/components/ui/skeleton', () => import('../components/ui/skeleton'))
vi.mock('@/components/ui/table', () => import('../components/ui/table'))
vi.mock('@/components/ui/sheet', () => import('../components/ui/sheet'))

function row(overrides: Partial<AdminUserPresentation> = {}): AdminUserPresentation {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    displayName: 'ผู้ทดสอบ ก',
    email: 'synthetic@example.invalid',
    role: 'staff',
    status: 'active',
    roleLabel: 'พนักงาน',
    statusLabel: 'ใช้งาน',
    pendingLabel: null,
    actualAffiliation: { state: 'unassigned', lines: ['ยังไม่ได้กำหนดสังกัด'] },
    requestedAffiliation: { state: 'ready', lines: ['ฝ่ายที่ยื่นขอ', 'ส่วนที่ยื่นขอ'] },
    canApprove: false,
    canReject: false,
    metadata: [{ label: 'ข้อมูลวันที่อนุมัติ', value: 'ไม่มีข้อมูลในรายการที่อ่านได้' }],
    ...overrides,
  }
}

function props(overrides: Partial<AdminUsersDirectoryProps> = {}): AdminUsersDirectoryProps {
  const noop = () => undefined
  return {
    rows: [row()], actorId: '22222222-2222-4222-8222-222222222222',
    source: 'v2', canMutate: true,
    onRefresh: noop, onPrevious: noop, onNext: noop, onDetails: noop,
    onRoleChange: noop, onStatusChange: noop, onApprove: noop, onReject: noop,
    onEditingChange: noop,
    ...overrides,
  }
}

function renderDirectory(overrides: Partial<AdminUsersDirectoryProps> = {}, layout: 'table' | 'cards' = 'table') {
  return renderToStaticMarkup(createElement(AdminUsersDirectoryView, { ...props(overrides), layout }))
}

function button(markup: string, label: string) {
  const found = markup.match(/<button\b[^>]*>/g)?.find(tag => tag.includes(`aria-label="${label}"`))
  if (!found) throw new Error(`Expected an actual button labeled: ${label}`)
  return found
}

function unresolvedAlert(markup: string) {
  const found = markup.match(/<div\b[^>]*data-admin-unresolved-commands="true"[^>]*>/)?.[0]
  if (!found) throw new Error('Expected the persistent unresolved command alert')
  return found
}

describe('Admin directory read presentation', () => {
  it.each(['table', 'cards'] as const)('keeps active status and actual/requested affiliation distinct in %s', layout => {
    const markup = renderDirectory({}, layout)
    expect(markup).toContain('ใช้งาน')
    expect(markup).toContain('สังกัดจริง')
    expect(markup).toContain('ยังไม่ได้กำหนดสังกัด')
    expect(markup).toContain('สังกัดที่ยื่นขอ')
    expect(markup).toContain('ฝ่ายที่ยื่นขอ')
    expect(markup).not.toContain('(ขอ)')
    expect(markup).not.toContain('รอการอนุมัติ')
    expect(markup).toContain('หน้านี้ 1 คน')
    expect(markup.match(/data-admin-user-id=/g)).toHaveLength(1)
    expect(markup.match(/data-admin-detail-trigger=/g)).toHaveLength(1)
  })

  it('does not confuse a lookup failure with an unassigned affiliation', () => {
    const markup = renderDirectory({ rows: [row({
      actualAffiliation: { state: 'unavailable', lines: ['โหลดชื่อสังกัดไม่สำเร็จ'] },
    })] })
    expect(markup).toContain('โหลดชื่อสังกัดไม่สำเร็จ')
    expect(markup).toContain('data-affiliation-state="unavailable"')
    expect(markup).not.toContain('ยังไม่ได้กำหนดสังกัด')
    expect(markup).toContain('ใช้งาน')
  })

  it('keeps read failure different from an empty result or zero count', () => {
    const markup = renderDirectory({ rows: [], error: 'อ่านทะเบียนไม่สำเร็จ' })
    expect(markup).toContain('อ่านทะเบียนไม่สำเร็จ')
    expect(markup).toContain('ลองโหลดอีกครั้ง')
    expect(markup).not.toContain('ไม่พบผู้ใช้งานในหน้านี้')
    expect(markup).not.toContain('หน้านี้ 0 คน')
    expect(markup).toContain('โหลดทะเบียนผู้ใช้งานไม่สำเร็จ')
  })

  it('announces initial loading without an empty directory', () => {
    const markup = renderDirectory({ rows: [], loading: true })
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('กำลังโหลดทะเบียนผู้ใช้งาน')
    expect(markup).not.toContain('ไม่พบผู้ใช้งานในหน้านี้')
    expect(markup).not.toContain('หน้านี้ 0 คน')
  })

  it.each([
    { loading: true },
    { error: 'ยังตรวจสอบสิทธิ์ไม่ได้' },
  ])('does not invent legacy mode or empty counts before source is verified: %o', state => {
    const markup = renderDirectory({ source: 'unknown', rows: [], canMutate: false, ...state })
    expect(markup).not.toContain('โหมดอ่านอย่างเดียว')
    expect(markup).not.toContain('ผลที่อ่านได้ 0 คน')
    expect(markup).not.toContain('หน้านี้ 0 คน')
    expect(markup).not.toContain('ไม่พบผู้ใช้งานในหน้านี้')
    expect(markup).not.toContain('aria-label="แบ่งหน้าทะเบียนผู้ใช้งาน"')
  })

  it('does not publish cached rows or supplied pagination with unknown source', () => {
    const markup = renderDirectory({ source: 'unknown', canMutate: false, pagination: 'cursor', error: 'ยังตรวจสอบสิทธิ์ไม่ได้' })
    expect(markup).not.toContain('ผู้ทดสอบ ก')
    expect(markup).not.toContain('data-admin-user-id=')
    expect(markup).not.toContain('aria-label="แบ่งหน้าทะเบียนผู้ใช้งาน"')
    expect(markup).not.toContain('แสดงผู้ใช้งานหน้านี้')
  })

  it('labels a genuine current-page empty result and preserves Back', () => {
    const markup = renderDirectory({ rows: [], hasPrevious: true })
    expect(markup).toContain('ไม่พบผู้ใช้งานในหน้านี้')
    expect(markup).toContain('กลับไปหน้าก่อนหน้าเพื่อดูรายการ')
    expect(markup).not.toContain('ทั้งหมด')
  })

  it('labels legacy capabilities without offering cursor navigation or mutations', () => {
    const markup = renderDirectory({ source: 'legacy-read-only', canMutate: false })
    expect(markup).toContain('โหมดอ่านอย่างเดียว')
    expect(markup).toContain('ผลที่อ่านได้ 1 คน')
    expect(markup).not.toContain('aria-label="แบ่งหน้าทะเบียนผู้ใช้งาน"')
    expect(markup).not.toContain('เปลี่ยนบทบาทของ')
    expect(markup).not.toContain('aria-label="สถานะบัญชีของ')
    expect(markup).toContain('ดูรายละเอียดของ ผู้ทดสอบ ก')
  })

  it('keeps current directory pagination available with read-only legacy authority', () => {
    const markup = renderDirectory({ source: 'legacy-read-only', pagination: 'cursor', canMutate: false, hasNext: true })
    expect(markup).toContain('โหมดอ่านอย่างเดียว')
    expect(markup).toContain('รายการยังแบ่งหน้าได้ตามปกติ')
    expect(markup).toContain('หน้านี้ 1 คน')
    expect(markup).toContain('aria-label="แบ่งหน้าทะเบียนผู้ใช้งาน"')
    expect(markup).not.toContain('การแบ่งหน้าไม่รองรับ')
    expect(markup).not.toContain('เปลี่ยนบทบาทของ')
    expect(markup).not.toContain('aria-label="สถานะบัญชีของ')
  })

  it('keeps a pending rejected substate and explicit approval action labels', () => {
    const markup = renderDirectory({ rows: [row({
      status: 'pending', statusLabel: 'รอการอนุมัติ', pendingLabel: 'ส่งกลับแก้ไข',
      canApprove: true, canReject: true,
    })] })
    expect(markup).toContain('รอการอนุมัติ')
    expect(markup).toContain('ส่งกลับแก้ไข')
    expect(button(markup, 'อนุมัติ ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
    expect(button(markup, 'ส่งกลับแก้ไข ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
    expect(markup).not.toContain('เปลี่ยนบทบาทของ')
  })

  it('disables approval with unresolved requested names without disabling independent rejection', () => {
    const markup = renderDirectory({ rows: [row({
      status: 'pending', statusLabel: 'รอการอนุมัติ', pendingLabel: 'ส่งข้อมูลแล้ว รออนุมัติ',
      requestedAffiliation: { state: 'unavailable', lines: ['โหลดชื่อสังกัดไม่สำเร็จ'] },
      canApprove: false, canReject: true,
    })] })
    expect(button(markup, 'อนุมัติ ผู้ทดสอบ ก (synthetic@example.invalid)')).toContain(' disabled=""')
    expect(button(markup, 'ส่งกลับแก้ไข ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
  })

  it.each([
    { mutationBusy: true },
    { unresolvedTargetIds: new Set([row().id]) },
    { stale: true },
    { actorId: row().id },
  ])('does not render a role mutation control for an unavailable target: %o', state => {
    const markup = renderDirectory(state)
    expect(markup).not.toContain('เปลี่ยนบทบาทของ')
    expect(markup).not.toContain('aria-label="สถานะบัญชีของ')
  })

  it('allows read details for an unresolved command but labels its result uncertainty', () => {
    const markup = renderDirectory({ unresolvedTargetIds: new Set([row().id]) })
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าไม่ได้')
    expect(button(markup, 'ดูรายละเอียดของ ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
    expect(markup).not.toContain('ส่งคำสั่งอีกครั้ง')
  })

  it.each(['table', 'cards'] as const)('keeps UNKNOWN A visible alongside a later command success in %s', layout => {
    const markup = renderDirectory({
      notice: 'ดำเนินการบัญชีอื่นสำเร็จและโหลดข้อมูลล่าสุดแล้ว',
      unresolvedTargetIds: new Set([row().id]), needsFreshReadTargetIds: new Set(),
      unresolvedCommandCount: 2, unresolvedAccountCount: 1,
    }, layout)
    expect(markup).toContain('ดำเนินการบัญชีอื่นสำเร็จและโหลดข้อมูลล่าสุดแล้ว')
    expect(markup).toContain('มีคำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้ 2 รายการ ใน 1 บัญชี')
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าไม่ได้')
    expect(markup.match(/data-admin-unresolved-commands=/g)).toHaveLength(1)
    expect(unresolvedAlert(markup)).toContain('role="note"')
    expect(unresolvedAlert(markup)).toContain('aria-label="คำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้"')
    expect(markup).not.toContain('กรุณาโหลดสถานะล่าสุดก่อนทบทวนคำสั่งใหม่')
    expect(button(markup, 'เปลี่ยนบทบาทของ ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
    expect(button(markup, 'สถานะบัญชีของ ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
  })

  it('blocks only targets requiring a fresh read while keeping all unresolved warnings', () => {
    const first = row()
    const second = row({ id: '33333333-3333-4333-8333-333333333333', email: 'second@example.invalid' })
    const markup = renderDirectory({ rows: [first, second],
      unresolvedTargetIds: new Set([first.id, second.id]), needsFreshReadTargetIds: new Set([first.id]),
      unresolvedCommandCount: 3, unresolvedAccountCount: 2,
    })
    expect(markup.match(/>ยังยืนยันผลคำสั่งก่อนหน้าไม่ได้</g)).toHaveLength(2)
    expect(markup).not.toContain('aria-label="เปลี่ยนบทบาทของ ผู้ทดสอบ ก (synthetic@example.invalid)"')
    expect(button(markup, 'เปลี่ยนบทบาทของ ผู้ทดสอบ ก (second@example.invalid)')).not.toContain(' disabled=""')
    expect(markup).toContain('กรุณาโหลดสถานะล่าสุดก่อนทบทวนคำสั่งใหม่')
  })

  it('retains a generic unresolved warning for an off-page target without exposing its identifiers', () => {
    const offPageId = '44444444-4444-4444-8444-444444444444'
    const markup = renderDirectory({ unresolvedTargetIds: new Set([offPageId]),
      needsFreshReadTargetIds: new Set([offPageId]), unresolvedCommandCount: 4, unresolvedAccountCount: 1,
    })
    expect(markup).toContain('มีคำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้ 4 รายการ ใน 1 บัญชี')
    expect(markup).not.toContain(offPageId)
    expect(button(markup, 'เปลี่ยนบทบาทของ ผู้ทดสอบ ก (synthetic@example.invalid)')).not.toContain(' disabled=""')
  })

  it('keeps only a generic unresolved warning when directory authority is unavailable', () => {
    const cached = row({ displayName: 'cached-private-name', email: 'cached-private@example.invalid' })
    const markup = renderDirectory({ source: 'unknown', rows: [cached], canMutate: false,
      error: 'ยังตรวจสอบสิทธิ์ไม่ได้', unresolvedTargetIds: new Set([cached.id]),
      needsFreshReadTargetIds: new Set([cached.id]), unresolvedCommandCount: 2, unresolvedAccountCount: 1,
    })
    expect(markup).toContain('มีคำสั่งก่อนหน้าที่ยังยืนยันผลไม่ได้ 2 รายการ ใน 1 บัญชี')
    expect(markup).toContain('การอ่านสถานะปัจจุบันไม่ยืนยันผลคำสั่งเดิม')
    expect(markup).not.toContain(cached.displayName)
    expect(markup).not.toContain(cached.email)
    expect(markup).not.toContain(cached.id)
    expect(markup).not.toContain('data-admin-user-id=')
    expect(markup).not.toContain('อ่านสถานะล่าสุดแล้ว')
  })

  it('uses the explicit parent read announcement alongside a non-live unresolved warning', () => {
    const markup = renderDirectory({ loading: true, announcement: 'กำลังโหลดทะเบียนหน้าถัดไป',
      unresolvedCommandCount: 1, unresolvedAccountCount: 1,
    })
    expect(markup).toContain('aria-live="polite" aria-atomic="true" class="sr-only">กำลังโหลดทะเบียนหน้าถัดไป</p>')
    expect(markup.match(/aria-live="polite"/g)).toHaveLength(1)
    expect(unresolvedAlert(markup)).toContain('role="note"')
  })

  it('retains the parent-owned Catalog entry and avoids unsupported management features', () => {
    const markup = renderDirectory({ catalogEntry: createElement('a', { href: '/admin/master-catalog' }, 'เปิด Master Catalog') })
    expect(markup).toContain('href="/admin/master-catalog"')
    expect(markup).toContain('bg-nt-yellow')
    expect(markup).not.toContain('<input')
    expect(markup).not.toContain('เชิญผู้ใช้')
    expect(markup).not.toContain('เพิ่มผู้ใช้งาน')
    expect(markup).not.toContain('Viewer')
    expect(markup).not.toContain('@font-face')
  })

  it('distinguishes duplicate names through per-target email labels', () => {
    const markup = renderDirectory({ rows: [
      row({ displayName: 'ไม่ระบุชื่อ', email: 'first@example.invalid' }),
      row({ id: '33333333-3333-4333-8333-333333333333', displayName: 'ไม่ระบุชื่อ', email: 'second@example.invalid' }),
    ] })
    expect(markup).toContain('aria-label="ดูรายละเอียดของ ไม่ระบุชื่อ (first@example.invalid)"')
    expect(markup).toContain('aria-label="ดูรายละเอียดของ ไม่ระบุชื่อ (second@example.invalid)"')
    expect(markup).toContain('aria-label="สถานะบัญชีของ ไม่ระบุชื่อ (first@example.invalid)"')
    expect(markup).toContain('aria-label="เปลี่ยนบทบาทของ ไม่ระบุชื่อ (second@example.invalid)"')
  })

  it('uses the target ID when the record has no email address', () => {
    const user = row({ displayName: 'ไม่ระบุชื่อ', email: 'ไม่มีอีเมลในข้อมูลที่อ่านได้' })
    const markup = renderDirectory({ rows: [user], editingUserId: user.id })
    expect(markup).toContain(`aria-label="ดูรายละเอียดของ ไม่ระบุชื่อ (${user.id})"`)
    expect(markup).toContain(`aria-label="บทบาทของ ไม่ระบุชื่อ (${user.id})"`)
    expect(markup).toContain(`aria-label="สถานะบัญชีของ ไม่ระบุชื่อ (${user.id})"`)
  })

  it('escapes long user content while preserving it for the reader', () => {
    const displayName = 'ผู้ทดสอบชื่อยาวมาก'.repeat(8) + '<script>unsafe()</script>'
    const email = 'long-synthetic-address'.repeat(7) + '@example.invalid'
    const markup = renderDirectory({ rows: [row({ displayName, email })] }, 'cards')
    expect(markup).toContain(email)
    expect(markup).toContain('&lt;script&gt;unsafe()&lt;/script&gt;')
    expect(markup).not.toContain('<script>')
    expect(markup).toContain('break-all')
  })
})

describe('Admin read-only details content', () => {
  it('hides old metadata while a canonical reread is in progress', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, {
      user: row({ metadata: [{ label: 'ข้อมูลเก่า', value: 'cached-only-value' }] }), loading: true,
    }))
    expect(markup).toContain('กำลังโหลดข้อมูลล่าสุด')
    expect(markup).not.toContain('cached-only-value')
    expect(markup).not.toContain('ผู้ทดสอบ ก')
  })

  it('marks cached read-only facts explicitly after reread failure', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, { user: row(), stale: true }))
    expect(markup).toContain('data-admin-details-stale="true"')
    expect(markup).toContain('ข้อมูลที่แสดงเป็นข้อมูลก่อนหน้า')
    expect(markup).toContain('ยังโหลดข้อมูลล่าสุดไม่สำเร็จ')
    expect(markup).toContain('ผู้ทดสอบ ก')
    expect(markup).not.toContain('<button')
  })

  it('warns that an unresolved command still needs a fresh read without claiming that read failed', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, {
      user: row(), unresolvedCommandCount: 2, needsFreshRead: true,
    }))
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าของบัญชีนี้ไม่ได้ 2 รายการ')
    expect(markup).toContain('กรุณาโหลดสถานะล่าสุดให้สำเร็จก่อนทบทวนคำสั่งใหม่')
    expect(markup).not.toContain('ยังโหลดข้อมูลล่าสุดไม่สำเร็จ')
    expect(markup).not.toContain('อ่านสถานะล่าสุดแล้ว')
    expect(markup).toContain('ผู้ทดสอบ ก')
    expect(markup).not.toContain('<button')
  })

  it('retains the old UNKNOWN warning after a fresh read without changing canonical facts', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, {
      user: row({ status: 'inactive', statusLabel: 'ไม่ใช้งาน', metadata: [{ label: 'ข้อมูลที่อ่านได้', value: 'canonical-value' }] }),
      unresolvedCommandCount: 2, needsFreshRead: false,
    }))
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าของบัญชีนี้ไม่ได้ 2 รายการ')
    expect(markup).toContain('อ่านสถานะล่าสุดแล้ว แต่ยังยืนยันผลคำสั่งเดิมไม่ได้')
    expect(markup).toContain('การดำเนินการถัดไปเป็นคำสั่งใหม่')
    expect(markup).toContain('ไม่ใช้งาน')
    expect(markup).toContain('canonical-value')
    expect(markup).not.toContain('data-admin-details-stale="true"')
    expect(markup).not.toContain('<button')
  })

  it('keeps the unresolved warning during a reread while hiding cached facts', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, {
      user: row(), loading: true, unresolvedCommandCount: 1, needsFreshRead: false,
    }))
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าของบัญชีนี้ไม่ได้ 1 รายการ')
    expect(markup).toContain('กำลังโหลดข้อมูลล่าสุด')
    expect(markup).not.toContain('อ่านสถานะล่าสุดแล้ว')
    expect(markup).not.toContain('ผู้ทดสอบ ก')
    expect(markup).not.toContain('synthetic@example.invalid')
  })

  it('does not claim a fresh read when unresolved details are stale', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, {
      user: row(), stale: true, unresolvedCommandCount: 1, needsFreshRead: false,
    }))
    expect(markup).toContain('ยังยืนยันผลคำสั่งก่อนหน้าของบัญชีนี้ไม่ได้ 1 รายการ')
    expect(markup).toContain('กรุณาโหลดสถานะล่าสุดให้สำเร็จก่อนทบทวนคำสั่งใหม่')
    expect(markup).toContain('ยังโหลดข้อมูลล่าสุดไม่สำเร็จ')
    expect(markup).not.toContain('อ่านสถานะล่าสุดแล้ว')
  })

  it('uses the same presented record without inventing verification or approval history', () => {
    const markup = renderToStaticMarkup(createElement(AdminUserDetailsContent, { user: row() }))
    expect(markup).toContain('สังกัดจริง')
    expect(markup).toContain('สังกัดที่ยื่นขอ')
    expect(markup).toContain('ไม่มีข้อมูลในรายการที่อ่านได้')
    expect(markup).not.toContain('ไม่เคยอนุมัติ')
    expect(markup).not.toContain('ยืนยันอีเมลแล้ว')
    expect(markup).not.toContain('<button')
    expect(markup).not.toContain('<input')
    expect(markup).not.toContain('<img')
  })
})
