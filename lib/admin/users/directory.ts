import type { SupabaseClient } from '@supabase/supabase-js'
import { isExactMissingRpcError, type AuthorizationSource } from '../../auth/authorization'
import type { UserRole, UserStatus } from '../../types/auth'

export const ADMIN_DIRECTORY_PAGE_SIZE = 25
export const ADMIN_DIRECTORY_LOOKAHEAD = 26

export type DirectoryCursor = { createdAt: string; id: string } | null
export type DirectoryReference =
  | { state: 'resolved'; id: string; name: string }
  | { state: 'unassigned'; id: null; name: null }
  | { state: 'unavailable' | 'missing'; id: string; name: null }
  | { state: 'unsupported'; id: undefined; name: null }

export interface AdminDirectoryRecord {
  id: string
  email: string | null
  title: string | null
  first_name: string
  last_name: string
  position: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string | null | undefined
  org_id: string | null | undefined
  department_id: string | null | undefined
  sector_id: string | null | undefined
  requested_department_id: string | null | undefined
  requested_sector_id: string | null | undefined
  approved_at: string | null | undefined
  approved_by: string | null | undefined
  rejected_at: string | null | undefined
  rejected_by: string | null | undefined
  admin_note: string | null | undefined
  onboarding_completed: boolean
  source: AuthorizationSource
  organization: DirectoryReference
  department: DirectoryReference
  sector: DirectoryReference
  requested_department: DirectoryReference
  requested_sector: DirectoryReference
}

export interface AdminDirectoryPage {
  records: AdminDirectoryRecord[]
  source: AuthorizationSource
  pagination: 'cursor' | 'legacy-bounded'
  hasNext: boolean
  nextCursor: DirectoryCursor
}

export class DirectoryReadError extends Error {
  constructor(message = 'ไม่สามารถอ่านทะเบียนผู้ใช้งานที่ได้รับอนุญาตได้') {
    super(message)
    this.name = 'DirectoryReadError'
  }
}

const roles = new Set<UserRole>(['admin', 'dept_manager', 'sector_manager', 'staff', 'procurement'])
const statuses = new Set<UserStatus>(['active', 'pending', 'inactive', 'suspended'])
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const timestamp = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/

// Compare PostgreSQL microseconds without rounding the cursor through Date.
function instant(value: string): bigint {
  const match = timestamp.exec(value)
  if (!match) throw new DirectoryReadError('ข้อมูลวันเวลาของทะเบียนไม่สมบูรณ์')
  const seconds = Date.parse(`${match[1]}${match[3]}`)
  if (!Number.isFinite(seconds)) throw new DirectoryReadError('ข้อมูลวันเวลาของทะเบียนไม่สมบูรณ์')
  return BigInt(seconds) * BigInt(1000) + BigInt((match[2] ?? '').padEnd(6, '0'))
}

export function validateDirectoryCursor(value: DirectoryCursor): DirectoryCursor {
  if (value === null) return null
  if (!value || typeof value.createdAt !== 'string' || typeof value.id !== 'string' || !uuid.test(value.id)) {
    throw new DirectoryReadError('ข้อมูลหน้าที่ต้องการอ่านไม่สมบูรณ์')
  }
  instant(value.createdAt)
  return { createdAt: value.createdAt, id: value.id }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new DirectoryReadError()
  return value as Record<string, unknown>
}

function nullableText(row: Record<string, unknown>, key: string): string | null {
  const value = row[key]
  if (value === null || typeof value === 'string') return value
  throw new DirectoryReadError()
}

function nullableId(row: Record<string, unknown>, key: string): string | null {
  const value = nullableText(row, key)
  if (value !== null && !uuid.test(value)) throw new DirectoryReadError()
  return value
}

function nullableTimestamp(row: Record<string, unknown>, key: string): string | null {
  const value = nullableText(row, key)
  if (value !== null) instant(value)
  return value
}

const absent = (): DirectoryReference => ({ state: 'unsupported', id: undefined, name: null })
const unassigned = (): DirectoryReference => ({ state: 'unassigned', id: null, name: null })

function embedded(value: unknown): DirectoryReference {
  if (value === null || value === undefined) return absent()
  const row = object(value)
  if (typeof row.id !== 'string' || !uuid.test(row.id)) return absent()
  if (typeof row.name !== 'string' || !row.name.trim()) return { state: 'unavailable', id: row.id, name: null }
  return { state: 'resolved', id: row.id, name: row.name }
}

function decode(value: unknown, source: AuthorizationSource): AdminDirectoryRecord {
  const row = object(value)
  if (typeof row.id !== 'string' || !uuid.test(row.id)
    || typeof row.created_at !== 'string'
    || !roles.has(row.role as UserRole) || !statuses.has(row.status as UserStatus)
    || (row.onboarding_completed !== null && typeof row.onboarding_completed !== 'boolean')) throw new DirectoryReadError()
  instant(row.created_at)
  const legacy = source === 'legacy-read-only'
  const name = (key: string) => {
    const value = nullableText(row, key)
    return value ?? ''
  }
  return {
    id: row.id, email: nullableText(row, 'email'), title: nullableText(row, 'title'),
    first_name: name('first_name'), last_name: name('last_name'), position: nullableText(row, 'position'),
    role: row.role as UserRole, status: row.status as UserStatus, created_at: row.created_at,
    updated_at: legacy ? undefined : nullableTimestamp(row, 'updated_at'),
    org_id: legacy ? undefined : nullableId(row, 'org_id'),
    department_id: legacy ? undefined : nullableId(row, 'department_id'),
    sector_id: legacy ? undefined : nullableId(row, 'sector_id'),
    requested_department_id: legacy ? undefined : nullableId(row, 'requested_department_id'),
    requested_sector_id: legacy ? undefined : nullableId(row, 'requested_sector_id'),
    approved_at: legacy ? undefined : nullableTimestamp(row, 'approved_at'),
    approved_by: legacy ? undefined : nullableId(row, 'approved_by'),
    rejected_at: legacy ? undefined : nullableTimestamp(row, 'rejected_at'),
    rejected_by: legacy ? undefined : nullableId(row, 'rejected_by'),
    admin_note: legacy ? undefined : nullableText(row, 'admin_note'),
    onboarding_completed: row.onboarding_completed === true,
    source,
    organization: absent(),
    department: legacy ? embedded(row.department) : unassigned(),
    sector: legacy ? embedded(row.sector) : unassigned(),
    requested_department: legacy ? embedded(row.requested_department) : unassigned(),
    requested_sector: legacy ? embedded(row.requested_sector) : unassigned(),
  }
}

function validatePageRows(rows: AdminDirectoryRecord[], cursor: DirectoryCursor): void {
  const ids = new Set<string>()
  let previous = cursor && { created_at: cursor.createdAt, id: cursor.id }
  for (const row of rows) {
    if (ids.has(row.id)) throw new DirectoryReadError('ข้อมูลทะเบียนซ้ำ กรุณาโหลดใหม่')
    ids.add(row.id)
    if (previous) {
      const earlier = instant(row.created_at) < instant(previous.created_at)
      const tied = instant(row.created_at) === instant(previous.created_at) && row.id.toLowerCase() < previous.id.toLowerCase()
      if (!earlier && !tied) throw new DirectoryReadError('ลำดับทะเบียนไม่สมบูรณ์ กรุณาโหลดใหม่')
    }
    previous = row
  }
}

type ReferenceIndex = { entries: Map<string, string>; failed: boolean }

async function referenceIndex(client: SupabaseClient, table: 'organizations' | 'departments' | 'sectors', values: (string | null | undefined)[]): Promise<ReferenceIndex> {
  const ids = [...new Set(values.filter((value): value is string => typeof value === 'string'))]
  if (!ids.length) return { entries: new Map(), failed: false }
  try {
    const result = await client.from(table).select('id,name').in('id', ids)
    if (result.error || !Array.isArray(result.data)) return { entries: new Map(), failed: true }
    const requested = new Set(ids)
    const entries = new Map<string, string>()
    for (const value of result.data) {
      const row = object(value)
      if (typeof row.id !== 'string' || !requested.has(row.id) || entries.has(row.id)
        || typeof row.name !== 'string' || !row.name.trim()) return { entries: new Map(), failed: true }
      entries.set(row.id, row.name)
    }
    return { entries, failed: false }
  } catch {
    return { entries: new Map(), failed: true }
  }
}

function reference(id: string | null | undefined, index: ReferenceIndex): DirectoryReference {
  if (id === undefined) return absent()
  if (id === null) return unassigned()
  if (index.failed) return { state: 'unavailable', id, name: null }
  const name = index.entries.get(id)
  return name === undefined ? { state: 'missing', id, name: null } : { state: 'resolved', id, name }
}

/** Query adapter only: callers must apply the approved pre/post active-Admin checks. */
export async function readAdminDirectoryPage(
  client: SupabaseClient,
  options: { source: AuthorizationSource; cursor: DirectoryCursor },
): Promise<AdminDirectoryPage> {
  try {
    return await readPage(client, options)
  } catch (error) {
    if (error instanceof DirectoryReadError) throw error
    throw new DirectoryReadError()
  }
}

async function readPage(
  client: SupabaseClient,
  options: { source: AuthorizationSource; cursor: DirectoryCursor },
): Promise<AdminDirectoryPage> {
  const cursor = validateDirectoryCursor(options.cursor)
  const result = await client.rpc('get_admin_profiles_page', {
    p_limit: ADMIN_DIRECTORY_LOOKAHEAD,
    p_cursor_created_at: cursor?.createdAt ?? null,
    p_cursor_id: cursor?.id ?? null,
  })
  if (result.error) {
    if (options.source !== 'legacy-read-only' || !isExactMissingRpcError(result.error, 'get_admin_profiles_page')) throw new DirectoryReadError()
    if (cursor !== null) throw new DirectoryReadError('โหมดอ่านอย่างเดียวไม่รองรับการแบ่งหน้านี้')
    const fallback = await client.from('user_profiles').select(`
      id, email, first_name, last_name, title, position, role, status, created_at, onboarding_completed,
      department:departments!user_profiles_department_id_fkey(id, name),
      sector:sectors!user_profiles_sector_id_fkey(id, name),
      requested_department:departments!user_profiles_requested_department_id_fkey(id, name),
      requested_sector:sectors!user_profiles_requested_sector_id_fkey(id, name)
    `).order('created_at', { ascending: false })
    if (fallback.error || !Array.isArray(fallback.data)) throw new DirectoryReadError()
    const records = fallback.data.map((value) => decode(value, 'legacy-read-only'))
    // The historical fallback has no unique-ID ordering/cursor contract.
    return { records, source: 'legacy-read-only', pagination: 'legacy-bounded', hasNext: false, nextCursor: null }
  }
  if (!Array.isArray(result.data) || result.data.length > ADMIN_DIRECTORY_LOOKAHEAD) throw new DirectoryReadError()
  const decoded = result.data.map((value) => decode(value, 'v2'))
  validatePageRows(decoded, cursor)
  const records = decoded.slice(0, ADMIN_DIRECTORY_PAGE_SIZE)
  const hasNext = decoded.length === ADMIN_DIRECTORY_LOOKAHEAD
  const last = records.at(-1)
  const [organizations, departments, sectors] = await Promise.all([
    referenceIndex(client, 'organizations', records.map((row) => row.org_id)),
    referenceIndex(client, 'departments', records.flatMap((row) => [row.department_id, row.requested_department_id])),
    referenceIndex(client, 'sectors', records.flatMap((row) => [row.sector_id, row.requested_sector_id])),
  ])
  return {
    records: records.map((row) => ({ ...row, source: options.source,
      organization: reference(row.org_id, organizations),
      department: reference(row.department_id, departments),
      sector: reference(row.sector_id, sectors),
      requested_department: reference(row.requested_department_id, departments),
      requested_sector: reference(row.requested_sector_id, sectors),
    })),
    source: options.source, pagination: 'cursor', hasNext,
    nextCursor: hasNext && last ? { createdAt: last.created_at, id: last.id } : null,
  }
}

export interface DirectoryTicket { actorId: string; generation: number; actorEpoch: number }
export interface DirectoryMutationTicket extends DirectoryTicket { targetId: string; requestId: string }
export interface DirectoryCommandIntent { rpc: string; args: Readonly<Record<string, unknown>> }
export type DirectoryCommandOutcome = 'authorizing' | 'submitted' | 'unknown' | 'success' | 'denied'
export interface DirectoryCommandRecord {
  ticket: DirectoryMutationTicket
  intent: DirectoryCommandIntent | null
  outcome: DirectoryCommandOutcome
  reviewed: boolean
  transportSettled: boolean
}

export class DirectoryRequestInvalidatedError extends Error {
  constructor() { super('คำขอนี้ไม่ตรงกับผู้ดูแลหรือหน้าปัจจุบัน'); this.name = 'DirectoryRequestInvalidatedError' }
}

/** Mounted feature ownership, view freshness and command lifetime are independent. */
export function createDirectoryRequestGate(initialActorId: string | null = null) {
  let actorId = initialActorId
  let actorEpoch = 0
  let generation = 0
  let mutation: DirectoryMutationTicket | null = null
  let snapshot: DirectoryTicket | null = null
  let queued: { owner: DirectoryTicket; run: () => void } | null = null
  const commands = new Map<string, DirectoryCommandRecord>()
  const capture = (actor: string): DirectoryTicket => {
    if (actor !== actorId) throw new DirectoryRequestInvalidatedError()
    return { actorId: actor, actorEpoch, generation }
  }
  const isOwned = (ticket: DirectoryTicket) => ticket.actorId === actorId && ticket.actorEpoch === actorEpoch
  const isCurrent = (ticket: DirectoryTicket) => isOwned(ticket) && ticket.generation === generation
  const invalidate = () => {
    generation += 1
    snapshot = null
    for (const command of commands.values()) command.reviewed = false
  }
  const isCommandOwned = (ticket: DirectoryMutationTicket) => isOwned(ticket) && commands.get(ticket.requestId)?.ticket === ticket
  const canReconcile = (ticket?: DirectoryMutationTicket) => Boolean(ticket && mutation === ticket
    && ['success', 'denied'].includes(commands.get(ticket.requestId)?.outcome ?? ''))
  return {
    setActor(actor: string | null) {
      if (actor !== actorId) {
        actorId = actor; actorEpoch += 1; invalidate(); mutation = null; queued = null; commands.clear()
      }
    },
    dispose() { actorId = null; actorEpoch += 1; invalidate(); mutation = null; queued = null; commands.clear() },
    capture, isOwned, isCurrent, isCommandOwned, invalidate,
    queueRead(actor: string, run: () => void, reconciliation?: DirectoryMutationTicket): boolean {
      const owner = capture(actor)
      if (!mutation || canReconcile(reconciliation)) return false
      queued = { owner, run }
      return true
    },
    startRead(actor: string, reconciliation?: DirectoryMutationTicket): DirectoryTicket {
      capture(actor)
      if (mutation && !canReconcile(reconciliation)) throw new DirectoryRequestInvalidatedError()
      generation += 1
      return capture(actor)
    },
    publishRead(ticket: DirectoryTicket, visibleIds: readonly string[], explicitReview: boolean): boolean {
      if (!isCurrent(ticket) || (mutation && ['authorizing', 'submitted'].includes(commands.get(mutation.requestId)?.outcome ?? ''))) return false
      snapshot = ticket
      for (const command of commands.values()) {
        if (command.outcome === 'unknown') command.reviewed = explicitReview && visibleIds.includes(command.ticket.targetId)
      }
      return true
    },
    snapshotCurrent() { return snapshot !== null && isCurrent(snapshot) },
    acquireMutation(actor: string, targetId: string, requestId: string, intent?: DirectoryCommandIntent): DirectoryMutationTicket | null {
      if (mutation || commands.has(requestId)) return null
      mutation = { ...capture(actor), targetId, requestId }
      commands.set(requestId, { ticket: mutation,
        intent: intent ? { rpc: intent.rpc, args: Object.freeze({ ...intent.args }) } : null,
        outcome: 'authorizing', reviewed: false, transportSettled: false })
      return mutation
    },
    markSubmitted(ticket: DirectoryMutationTicket): boolean {
      if (mutation !== ticket || !isCurrent(ticket)) return false
      const command = commands.get(ticket.requestId)!
      command.outcome = 'submitted'
      invalidate()
      return true
    },
    markUnknown(ticket: DirectoryMutationTicket): boolean {
      if (!isCommandOwned(ticket)) return false
      const command = commands.get(ticket.requestId)!
      if (command.transportSettled || command.outcome !== 'submitted') return false
      command.outcome = 'unknown'
      invalidate()
      return true
    },
    settle(ticket: DirectoryMutationTicket, outcome: 'success' | 'denied' | 'unknown'): boolean {
      if (!isCommandOwned(ticket)) return false
      const command = commands.get(ticket.requestId)!
      if (command.transportSettled) return false
      command.transportSettled = true
      command.outcome = outcome
      invalidate()
      return true
    },
    unresolved() { return [...commands.values()].filter(command => command.outcome === 'unknown') },
    hasUnresolved(targetId: string) { return [...commands.values()].some(command => command.outcome === 'unknown' && command.ticket.targetId === targetId) },
    needsFreshRead(targetId: string) { return [...commands.values()].some(command => command.outcome === 'unknown' && command.ticket.targetId === targetId && !command.reviewed) },
    discardQueuedRead(ticket: DirectoryMutationTicket) { if (mutation === ticket && isCommandOwned(ticket)) queued = null },
    releaseMutation(ticket: DirectoryMutationTicket) {
      if (mutation !== ticket || !isCommandOwned(ticket)) return
      if (commands.get(ticket.requestId)?.outcome === 'authorizing') commands.delete(ticket.requestId)
      mutation = null
      const next = queued; queued = null
      if (next) queueMicrotask(() => { if (isOwned(next.owner)) next.run() })
    },
    mutationInFlight(): boolean { return mutation !== null },
  }
}

export class DirectoryDeadlineError extends Error {
  constructor(readonly phase: 'read' | 'mutation' | 'reread') {
    super(phase === 'mutation' ? 'ยังยืนยันผลการดำเนินการไม่ได้' : 'โหลดข้อมูลไม่สำเร็จภายในเวลาที่กำหนด')
    this.name = 'DirectoryDeadlineError'
  }
}

export function withDirectoryDeadline<T>(operation: PromiseLike<T>, milliseconds: number, phase: 'read' | 'mutation' | 'reread'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DirectoryDeadlineError(phase)), milliseconds)
    Promise.resolve(operation).then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error: unknown) => { clearTimeout(timer); reject(error) },
    )
  })
}
