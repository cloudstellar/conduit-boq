import type { SupabaseClient } from '@supabase/supabase-js'
import { isExactMissingRpcError, requireActiveAdmin } from '../../auth/authorization'
import type { UserRole, UserStatus } from '../../types/auth'
import { withDirectoryDeadline } from './directory'

const reviewRpc = 'um_b_affiliation_review'
const confirmRpc = 'um_b_confirm_affiliation'
const outcomeRpc = 'um_b_affiliation_outcome'
const historyRpc = 'um_b_affiliation_history'
const identityPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const fingerprintPattern = /^[0-9a-f]{64}$/
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/
const roles = new Set<UserRole>(['admin', 'dept_manager', 'sector_manager', 'staff', 'procurement'])
const statuses = new Set<UserStatus>(['active', 'pending', 'inactive', 'suspended'])

export const affiliationReasonLimit = 1000
export const affiliationDenialCopy = {
  SELF_TARGET: 'ผู้ดูแลไม่สามารถยืนยันสังกัดให้บัญชีของตนเองได้',
  NOT_ACTIVE_STAFF: 'ยืนยันสังกัดได้เฉพาะบัญชีพนักงานที่อยู่ในสถานะใช้งาน',
  AFFILIATION_ALREADY_SET: 'บัญชีนี้มีสังกัดจริงแล้ว',
  REQUEST_INVALID: 'ตรวจสอบคำขอและลำดับสังกัดแล้วพบว่าข้อมูลไม่ครบหรือหน่วยงานไม่พร้อมใช้งาน',
  REVIEW_CHANGED: 'ข้อมูลบัญชีหรือสังกัดเปลี่ยนหลังจากที่คุณตรวจ กรุณาโหลดข้อมูลล่าสุดและทบทวนอีกครั้ง',
}

type DenialCode = keyof typeof affiliationDenialCopy
type ReviewDenialCode = Exclude<DenialCode, 'REVIEW_CHANGED'>
type Reference = { id: string; name: string; active: true }
export type AffiliationReview = {
  actor_id: string
  target_id: string
  role: 'staff'
  status: 'active'
  org_id: null
  department_id: null
  sector_id: null
  requested_department_id: string
  requested_sector_id: string
  hierarchy: {
    org: Reference
    department: Reference & { org_id: string }
    sector: Reference & { department_id: string }
  }
}

export type AffiliationReviewResult =
  | { kind: 'eligible'; reviewed: AffiliationReview }
  | { kind: 'ineligible'; code: ReviewDenialCode }
  | { kind: 'unavailable' }

type ProfileScope = {
  role: UserRole
  status: UserStatus
  org_id: string | null
  department_id: string | null
  sector_id: string | null
}
type AffiliationIntent = { reviewed: AffiliationReview; reason: string }
export type AffiliationOutcome = {
  intent: AffiliationIntent
  fingerprint: string
  recordedAt: string
  replayed: boolean
} & ({ kind: 'applied' } | { kind: 'denied'; code: DenialCode })

export type AffiliationHistoryEntry = { id: string; reason: string; recordedAt: string }
export type AffiliationPending = { requestId: string; intentHash: string }
export type AffiliationJournal =
  | { kind: 'clear' }
  | { kind: 'pending'; pending: AffiliationPending }
  | { kind: 'unavailable' }

function ownFields(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) {
    throw new Error('Invalid affiliation response')
  }
  return value as Record<string, unknown>
}

function uuid(value: unknown): string {
  if (typeof value !== 'string' || !identityPattern.test(value)) throw new Error('Invalid affiliation identifier')
  return value
}

function reviewReference(value: unknown, parent?: 'org_id' | 'department_id'): Reference {
  const record = ownFields(value, ['id', 'name', 'active', ...(parent ? [parent] : [])])
  if (record.active !== true || typeof record.name !== 'string' || !record.name.trim()) throw new Error('Invalid affiliation reference')
  return { id: uuid(record.id), name: record.name, active: true }
}

function parseReviewed(value: unknown, actorId: string, targetId: string): AffiliationReview {
  const record = ownFields(value, ['actor_id', 'target_id', 'role', 'status', 'org_id', 'department_id', 'sector_id',
    'requested_department_id', 'requested_sector_id', 'hierarchy'])
  if (actorId === targetId || record.actor_id !== actorId || record.target_id !== targetId
    || record.role !== 'staff' || record.status !== 'active'
    || record.org_id !== null || record.department_id !== null || record.sector_id !== null) {
    throw new Error('Affiliation review does not match this account')
  }
  const hierarchy = ownFields(record.hierarchy, ['org', 'department', 'sector'])
  const org = reviewReference(hierarchy.org)
  const department = reviewReference(hierarchy.department, 'org_id')
  const sector = reviewReference(hierarchy.sector, 'department_id')
  const departmentParent = (hierarchy.department as Record<string, unknown>).org_id
  const sectorParent = (hierarchy.sector as Record<string, unknown>).department_id
  if (department.id !== record.requested_department_id || sector.id !== record.requested_sector_id
    || departmentParent !== org.id || sectorParent !== department.id) {
    throw new Error('Affiliation hierarchy does not match the reviewed request')
  }
  // Rebuild in stable field order so lookup can verify the intent after reload.
  return { actor_id: actorId, target_id: targetId, role: 'staff', status: 'active', org_id: null, department_id: null, sector_id: null,
    requested_department_id: department.id, requested_sector_id: sector.id,
    hierarchy: { org, department: { ...department, org_id: org.id }, sector: { ...sector, department_id: department.id } } }
}

function isDenialCode(code: unknown): code is DenialCode {
  return typeof code === 'string' && Object.hasOwn(affiliationDenialCopy, code)
}

export function decodeAffiliationReview(data: unknown, actorId: string, targetId: string): AffiliationReviewResult {
  const record = ownFields(data, ['version', 'actor_id', 'target_id', 'eligible', 'code', 'reviewed'])
  if (record.version !== 1 || record.actor_id !== uuid(actorId) || record.target_id !== uuid(targetId)) {
    throw new Error('Unexpected affiliation review binding')
  }
  if (record.eligible === true && record.code === 'ELIGIBLE') {
    return { kind: 'eligible', reviewed: parseReviewed(record.reviewed, actorId, targetId) }
  }
  if (record.eligible === false && record.reviewed === null && isDenialCode(record.code) && record.code !== 'REVIEW_CHANGED') {
    return { kind: 'ineligible', code: record.code }
  }
  throw new Error('Invalid affiliation review result')
}

export function normalizeAffiliationReason(value: string): string | null {
  const reason = value.trim()
  return reason && !reason.includes('\0') && [...reason].length <= affiliationReasonLimit ? reason : null
}

function parseScope(value: unknown): ProfileScope {
  const record = ownFields(value, ['org_id', 'department_id', 'sector_id', 'role', 'status'])
  if (!roles.has(record.role as UserRole) || !statuses.has(record.status as UserStatus)) throw new Error('Invalid affiliation account scope')
  return { role: record.role as UserRole, status: record.status as UserStatus,
    org_id: record.org_id === null ? null : uuid(record.org_id), department_id: record.department_id === null ? null : uuid(record.department_id),
    sector_id: record.sector_id === null ? null : uuid(record.sector_id) }
}

function isRecordedTimestamp(value: unknown): value is string {
  return typeof value === 'string' && timestampPattern.test(value) && Number.isFinite(Date.parse(value))
}

export function decodeAffiliationOutcome(data: unknown, actorId: string, targetId: string, requestId: string): AffiliationOutcome {
  const record = ownFields(data, ['version', 'actor_id', 'target_id', 'request_id', 'intent', 'fingerprint', 'outcome', 'code',
    'recorded_at', 'replayed', 'before', 'after'])
  if (record.version !== 1 || record.actor_id !== uuid(actorId) || record.target_id !== uuid(targetId)
    || record.request_id !== uuid(requestId) || typeof record.fingerprint !== 'string' || !fingerprintPattern.test(record.fingerprint)
    || typeof record.replayed !== 'boolean' || !isRecordedTimestamp(record.recorded_at)) {
    throw new Error('Unexpected affiliation outcome binding')
  }
  const intent = ownFields(record.intent, ['reviewed', 'reason'])
  const reason = typeof intent.reason === 'string' && normalizeAffiliationReason(intent.reason)
  if (!reason || reason !== intent.reason) throw new Error('Invalid affiliation outcome reason')
  const reviewed = parseReviewed(intent.reviewed, actorId, targetId)
  const outcome = { intent: { reviewed, reason }, fingerprint: record.fingerprint, recordedAt: record.recorded_at, replayed: record.replayed }
  const before = parseScope(record.before)
  const after = parseScope(record.after)
  if (record.outcome === 'DENIED' && isDenialCode(record.code) && JSON.stringify(before) === JSON.stringify(after)) {
    return { ...outcome, kind: 'denied', code: record.code }
  }
  if (record.outcome === 'APPLIED' && record.code === 'APPLIED'
    && before.role === 'staff' && before.status === 'active' && before.org_id === null && before.department_id === null && before.sector_id === null
    && after.role === before.role && after.status === before.status && after.org_id === reviewed.hierarchy.org.id
    && after.department_id === reviewed.hierarchy.department.id && after.sector_id === reviewed.hierarchy.sector.id) {
    return { ...outcome, kind: 'applied' }
  }
  throw new Error('Invalid affiliation outcome')
}

export async function reviewAffiliation(client: SupabaseClient, actorId: string, targetId: string): Promise<AffiliationReviewResult> {
  const result = await withDirectoryDeadline(client.rpc(reviewRpc, { p_target_id: targetId }), 15_000, 'read')
  if (isExactMissingRpcError(result.error, reviewRpc)) return { kind: 'unavailable' }
  if (result.error) throw new Error('Affiliation review unavailable')
  return decodeAffiliationReview(result.data, actorId, targetId)
}

export async function assertAffiliationAdmin(client: SupabaseClient, actorId: string): Promise<void> {
  const auth = await withDirectoryDeadline(requireActiveAdmin(client), 15_000, 'read')
  if (auth.user.id !== actorId || auth.source !== 'v2') throw new Error('Affiliation admin authority changed')
}

export async function fingerprintAffiliationIntent(intent: AffiliationIntent): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(intent))
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function boundOutcome(data: unknown, actorId: string, targetId: string, pending: AffiliationPending): Promise<AffiliationOutcome> {
  const outcome = decodeAffiliationOutcome(data, actorId, targetId, pending.requestId)
  if (await fingerprintAffiliationIntent(outcome.intent) !== pending.intentHash) throw new Error('Affiliation outcome intent differs')
  return outcome
}

export async function confirmAffiliation(
  client: SupabaseClient, reviewed: AffiliationReview, reason: string, pending: AffiliationPending,
): Promise<AffiliationOutcome> {
  const result = await withDirectoryDeadline(client.rpc(confirmRpc, {
    p_target_id: reviewed.target_id, p_request_id: pending.requestId, p_reviewed: reviewed, p_reason: reason,
  }), 20_000, 'mutation')
  if (result.error) throw new Error('Affiliation outcome unknown')
  return boundOutcome(result.data, reviewed.actor_id, reviewed.target_id, pending)
}

export async function lookupAffiliationOutcome(
  client: SupabaseClient, actorId: string, targetId: string, pending: AffiliationPending,
): Promise<AffiliationOutcome | null> {
  const result = await withDirectoryDeadline(client.rpc(outcomeRpc, { p_request_id: pending.requestId }), 15_000, 'read')
  if (result.error) throw new Error('Affiliation outcome lookup unavailable')
  if (result.data === null) return null
  const outcome = await boundOutcome(result.data, actorId, targetId, pending)
  if (!outcome.replayed) throw new Error('Affiliation outcome lookup must return recorded history')
  return outcome
}

export async function readAffiliationHistory(client: SupabaseClient, targetId: string): Promise<AffiliationHistoryEntry[]> {
  const result = await withDirectoryDeadline(client.rpc(historyRpc, { p_target_id: targetId }), 15_000, 'read')
  if (result.error || !Array.isArray(result.data) || result.data.length > 50) {
    throw new Error('Affiliation confirmation history unavailable')
  }
  const history: AffiliationHistoryEntry[] = []
  for (const entry of result.data) {
    const item = ownFields(entry, ['source', 'id', 'action', 'actor_id', 'target_id', 'reason', 'recorded_at', 'before', 'after'])
    if (item.target_id !== targetId) throw new Error('Affiliation history does not match this account')
    if (item.source === 'p49') continue
    const actor = uuid(item.actor_id)
    const id = typeof item.id === 'string' ? item.id.split(':') : []
    const reason = typeof item.reason === 'string' && normalizeAffiliationReason(item.reason)
    const before = parseScope(item.before)
    const after = parseScope(item.after)
    if (item.source !== 'um_b' || item.action !== 'affiliation_confirmed' || id.length !== 2 || id[1] !== actor
      || !reason || reason !== item.reason || !isRecordedTimestamp(item.recorded_at)
      || before.role !== 'staff' || before.status !== 'active' || before.org_id !== null
      || before.department_id !== null || before.sector_id !== null || after.role !== before.role
      || after.status !== before.status || !after.org_id || !after.department_id || !after.sector_id) {
      throw new Error('Invalid affiliation history entry')
    }
    history.push({ id: uuid(id[0]), reason, recordedAt: item.recorded_at })
  }
  return history
}

export function affiliationJournalKey(actorId: string, targetId: string): string {
  return `conduit:affiliation:v1:${uuid(actorId)}:${uuid(targetId)}`
}

function readJournal(key: string): AffiliationJournal {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return { kind: 'clear' }
    const value = ownFields(JSON.parse(stored), ['requestId', 'intentHash'])
    if (typeof value.intentHash !== 'string' || !fingerprintPattern.test(value.intentHash)) return { kind: 'unavailable' }
    return { kind: 'pending', pending: { requestId: uuid(value.requestId), intentHash: value.intentHash } }
  } catch {
    return { kind: 'unavailable' }
  }
}

export function readAffiliationJournal(key: string): AffiliationJournal {
  if (typeof window === 'undefined' || !navigator.locks || !globalThis.crypto?.subtle) return { kind: 'unavailable' }
  return readJournal(key)
}

// Atomically register one scoped intent across tabs. Persist no credentials,
// names, review snapshot or reason. The digest verifies the exact readback.
export function registerAffiliationIntent(key: string, pending: AffiliationPending): Promise<AffiliationJournal> {
  return navigator.locks.request(key, () => {
    const current = readJournal(key)
    if (current.kind !== 'clear') return current
    localStorage.setItem(key, JSON.stringify(pending))
    return { kind: 'clear' }
  })
}

export function clearAffiliationIntent(key: string, pending: AffiliationPending): Promise<void> {
  return navigator.locks.request(key, () => {
    const current = readJournal(key)
    if (current.kind === 'unavailable') throw new Error('Affiliation journal unavailable')
    if (current.kind === 'pending' && current.pending.requestId === pending.requestId && current.pending.intentHash === pending.intentHash) {
      localStorage.removeItem(key)
    }
  })
}

