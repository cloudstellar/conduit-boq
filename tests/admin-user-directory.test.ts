import type { SupabaseClient } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDirectoryRequestGate,
  DirectoryDeadlineError,
  DirectoryReadError,
  DirectoryRequestInvalidatedError,
  readAdminDirectoryPage,
  validateDirectoryCursor,
  withDirectoryDeadline,
  type DirectoryCursor,
} from '../lib/admin/users/directory'

type Row = Record<string, unknown>
type Response = { data: unknown; error: null | { code: string; message: string } }
const id = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
const created = '2026-11-01T08:00:00.123456+00:00'

function row(n: number, extra: Row = {}): Row {
  return {
    id: id(n), email: `synthetic-${n}@example.invalid`, title: null,
    first_name: 'ผู้ทดสอบ', last_name: String(n), position: null,
    role: 'staff', status: 'pending', created_at: created, updated_at: created,
    org_id: null, department_id: null, sector_id: null,
    requested_department_id: null, requested_sector_id: null,
    approved_at: null, approved_by: null, rejected_at: null, rejected_by: null,
    admin_note: null, onboarding_completed: false, ...extra,
  }
}

function client(options: {
  rows?: Row[]
  rpc?: (args: Row) => Response
  error?: Response['error']
  tables?: Record<string, Row[]>
  referenceErrors?: string[]
  referenceCaps?: Record<string, number>
} = {}) {
  const calls: { kind: 'rpc' | 'table'; name: string; args?: Row; ids?: string[]; select?: string }[] = []
  const supabase = {
    rpc: async (name: string, args: Row) => {
      calls.push({ kind: 'rpc', name, args })
      return options.rpc?.(args) ?? { data: options.rows ?? [], error: options.error ?? null }
    },
    from: (name: string) => {
      const call: (typeof calls)[number] = { kind: 'table', name }
      calls.push(call)
      const query = {
        select: (select: string) => { call.select = select; return query },
        in: (_key: string, ids: string[]) => { call.ids = ids; return query },
        order: () => query,
        then: (resolve: (value: Response) => unknown) => {
          const values = options.tables?.[name] ?? []
          const selected = call.ids ? values.filter((value) => call.ids?.includes(String(value.id))) : values
          const cap = options.referenceCaps?.[name] ?? selected.length
          return Promise.resolve({
            data: selected.slice(0, cap),
            error: options.referenceErrors?.includes(name) ? { code: 'XX000', message: 'internal diagnostic' } : null,
          }).then(resolve)
        },
      }
      return query
    },
  } as unknown as SupabaseClient
  return { supabase, calls }
}

describe('Admin directory query and cursor contract', () => {
  it('traverses more than 100 records with a raw 25th-row cursor and no duplicated/skipped IDs', async () => {
    const all = Array.from({ length: 105 }, (_, i) => row(105 - i))
    const { supabase, calls } = client({ rpc: (args) => ({
      data: all.filter((value) => !args.p_cursor_id || String(value.id) < String(args.p_cursor_id)).slice(0, Number(args.p_limit)),
      error: null,
    }) })
    let cursor: DirectoryCursor = null
    const visited: string[] = []
    for (let pageNumber = 0; pageNumber < 5; pageNumber += 1) {
      const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor })
      visited.push(...page.records.map((value) => value.id))
      expect(page.records.length).toBe(pageNumber === 4 ? 5 : 25)
      if (!page.hasNext) break
      expect(page.nextCursor?.createdAt).toBe(created)
      expect(page.nextCursor?.id).toBe(page.records[24].id)
      cursor = page.nextCursor
    }
    expect(visited).toEqual(all.map((value) => value.id))
    expect(new Set(visited).size).toBe(105)
    expect(calls).toHaveLength(5)
    expect(calls.every((call) => call.kind === 'rpc' && call.args?.p_limit === 26)).toBe(true)
  })

  it('keeps PostgreSQL microseconds and the 25th-row boundary without Date rounding', async () => {
    const values = [
      row(1, { created_at: '2026-11-01T08:00:00.000002+00:00' }),
      row(1000, { created_at: '2026-11-01T08:00:00.000001+00:00' }),
    ]
    const { supabase } = client({ rows: values })
    const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })
    expect(page.records.map((value) => value.created_at)).toEqual(values.map((value) => value.created_at))
    expect(validateDirectoryCursor({ createdAt: created, id: id(20) })).toEqual({ createdAt: created, id: id(20) })
  })

  it.each([
    { createdAt: created, id: undefined }, { createdAt: undefined, id: id(1) },
    { createdAt: 'not-a-date', id: id(1) }, { createdAt: created, id: 'not-a-uuid' },
  ])('rejects malformed/partial cursors before any request: %j', async (cursor) => {
    const { supabase, calls } = client()
    await expect(readAdminDirectoryPage(supabase, { source: 'v2', cursor: cursor as never })).rejects.toBeInstanceOf(DirectoryReadError)
    expect(calls).toEqual([])
  })

  it.each([
    [row(1), row(2)], [row(1), row(1)], [row(1, { role: 'future-role' })],
    [row(1, { department_id: undefined })], [row(1, { created_at: '' })],
  ].map((rows) => ({ rows })))('rejects malformed, duplicate or incorrectly ordered v2 results', async ({ rows }) => {
    const { supabase } = client({ rows })
    await expect(readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })).rejects.toBeInstanceOf(DirectoryReadError)
  })

  it('rejects a result that does not lie strictly after the requested cursor', async () => {
    const { supabase } = client({ rows: [row(3)] })
    await expect(readAdminDirectoryPage(supabase, { source: 'v2', cursor: { createdAt: created, id: id(2) } })).rejects.toBeInstanceOf(DirectoryReadError)
  })

  it('loads only unique visible-page reference IDs in one batch per needed table', async () => {
    const records = Array.from({ length: 26 }, (_, i) => row(26 - i, {
      org_id: id(500), department_id: id(600), sector_id: id(700),
      requested_department_id: i === 25 ? id(999) : id(600), requested_sector_id: id(700),
    }))
    const { supabase, calls } = client({ rows: records, tables: {
      organizations: [{ id: id(500), name: 'องค์กร' }],
      departments: [{ id: id(600), name: 'ฝ่าย' }], sectors: [{ id: id(700), name: 'ส่วน' }],
    } })
    const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })
    const references = calls.filter((call) => call.kind === 'table')
    expect(references).toHaveLength(3)
    expect(references.every((call) => call.ids?.length === 1)).toBe(true)
    expect(references.some((call) => call.ids?.includes(id(999)))).toBe(false)
    expect(page.records).toHaveLength(25)
    expect(page.records[0].department).toEqual({ state: 'resolved', id: id(600), name: 'ฝ่าย' })
    expect(page.hasNext).toBe(true)
  })

  it('keeps failed, missing/capped and genuinely unassigned references distinct', async () => {
    const { supabase } = client({ rows: [row(1, {
      department_id: id(600), sector_id: id(700), requested_department_id: id(601),
    })], tables: { departments: [{ id: id(600), name: 'ฝ่ายที่อ่านได้' }, { id: id(601), name: 'ฝ่ายที่ถูกตัด' }] },
    referenceErrors: ['sectors'], referenceCaps: { departments: 1 } })
    const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })
    expect(page.records[0].department.state).toBe('resolved')
    expect(page.records[0].requested_department.state).toBe('missing')
    expect(page.records[0].sector.state).toBe('unavailable')
    expect(page.records[0].organization.state).toBe('unassigned')
    expect(page.records[0].sector_id).toBe(id(700))
  })

  it('does not query any reference table for an empty authorized result', async () => {
    const { supabase, calls } = client({ rows: [] })
    const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })
    expect(page).toMatchObject({ records: [], hasNext: false, nextCursor: null })
    expect(calls).toHaveLength(1)
  })

  it('preserves the SQL nullable-onboarding contract without inventing completion', async () => {
    const { supabase } = client({ rows: [row(1, { onboarding_completed: null })] })
    const page = await readAdminDirectoryPage(supabase, { source: 'v2', cursor: null })
    expect(page.records[0].onboarding_completed).toBe(false)
    expect(page.records[0].status).toBe('pending')
  })

  it('uses only the exact established legacy fallback and preserves omitted capability', async () => {
    const legacy = row(1)
    delete legacy.department_id
    const { supabase, calls } = client({ error: { code: 'PGRST202', message: 'get_admin_profiles_page not found' },
      tables: { user_profiles: [{ ...legacy, department: null, sector: null,
        requested_department: { id: id(600), name: 'ฝ่ายที่ยื่นขอ' }, requested_sector: null }] } })
    const page = await readAdminDirectoryPage(supabase, { source: 'legacy-read-only', cursor: null })
    expect(page.pagination).toBe('legacy-bounded')
    expect(page.records[0].department_id).toBeUndefined()
    expect(page.records[0].updated_at).toBeUndefined()
    expect(page.records[0].department.state).toBe('unsupported')
    expect(page.records[0].requested_department.state).toBe('resolved')
    expect(calls).toHaveLength(2)
    expect(calls[1].select).not.toContain('phone')
  })

  it('never activates legacy fallback for denied/error v2 or a different missing RPC', async () => {
    for (const [source, error] of [
      ['v2', { code: 'PGRST202', message: 'get_admin_profiles_page missing' }],
      ['legacy-read-only', { code: '42501', message: 'permission denied' }],
      ['legacy-read-only', { code: 'PGRST202', message: 'another_rpc missing' }],
    ] as const) {
      const { supabase, calls } = client({ error })
      await expect(readAdminDirectoryPage(supabase, { source, cursor: null })).rejects.toBeInstanceOf(DirectoryReadError)
      expect(calls).toHaveLength(1)
    }
  })

  it('does not expose provider/network diagnostics from a rejected read promise', async () => {
    const { supabase } = client()
    const failed = { ...supabase, rpc: async () => { throw new Error('private provider diagnostic') } } as unknown as SupabaseClient
    const error = await readAdminDirectoryPage(failed, { source: 'v2', cursor: null }).catch((value: unknown) => value)
    expect(error).toBeInstanceOf(DirectoryReadError)
    expect((error as Error).message).not.toContain('private provider diagnostic')
  })

  it('keeps legacy authorization read-only even if the directory RPC is present', async () => {
    const { supabase } = client({ rows: [row(1)] })
    const page = await readAdminDirectoryPage(supabase, { source: 'legacy-read-only', cursor: null })
    expect(page.source).toBe('legacy-read-only')
    expect(page.records[0].source).toBe('legacy-read-only')
    expect(page.pagination).toBe('cursor')
    expect(page.records[0].department_id).toBeNull()
  })
})

describe('feature-local Admin request gate', () => {
  it('invalidates prior reads and pre-submit intents when page or actor changes', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const first = gate.startRead('admin-a')
    const intent = gate.capture('admin-a')
    gate.startRead('admin-a')
    expect(gate.isCurrent(first)).toBe(false)
    expect(gate.isCurrent(intent)).toBe(false)
    const latest = gate.capture('admin-a')
    gate.setActor('admin-b')
    expect(gate.isCurrent(latest)).toBe(false)
    expect(() => gate.capture('admin-a')).toThrow(DirectoryRequestInvalidatedError)
  })

  it('synchronously admits one mutation across targets/actions and ignores stale finalizers', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const first = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    expect(gate.acquireMutation('admin-a', 'target-b', 'request-b')).toBeNull()
    expect(gate.mutationInFlight()).toBe(true)
    gate.setActor('admin-b')
    const second = gate.acquireMutation('admin-b', 'target-b', 'request-c')!
    gate.releaseMutation(first)
    expect(gate.mutationInFlight()).toBe(true)
    gate.releaseMutation(second)
    expect(gate.mutationInFlight()).toBe(false)
  })

  it('does not invalidate a same-actor token refresh', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const ticket = gate.capture('admin-a')
    gate.setActor('admin-a')
    expect(gate.isCurrent(ticket)).toBe(true)
    gate.invalidate()
    expect(gate.isCurrent(ticket)).toBe(false)
  })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('mounted Admin command and directory reconciliation', () => {
  afterEach(() => vi.useRealTimers())

  it('cancels an obsolete authorization intent without losing same-actor ownership', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const ticket = gate.acquireMutation('admin-a', 'target-a', 'request-a')!

    // The same signed-in profile changes role while fresh authorization awaits.
    gate.invalidate()
    expect(gate.isOwned(ticket)).toBe(true)
    expect(gate.isCommandOwned(ticket)).toBe(true)
    expect(gate.isCurrent(ticket)).toBe(false)
    expect(gate.markSubmitted(ticket)).toBe(false)
    expect(gate.markUnknown(ticket)).toBe(false)

    gate.releaseMutation(ticket)
    expect(gate.mutationInFlight()).toBe(false)
    expect(gate.isCommandOwned(ticket)).toBe(false)
    expect(gate.unresolved()).toEqual([])
  })

  it('holds restoration reads until submitted success and rereads with a new ticket under the command lock', async () => {
    const gate = createDirectoryRequestGate('admin-a')
    const initialRead = gate.startRead('admin-a')
    expect(gate.publishRead(initialRead, ['target-a'], false)).toBe(true)
    const ticket = gate.acquireMutation('admin-a', 'target-a', 'request-a', {
      rpc: 'admin_deactivate_user',
      args: { p_target_id: 'target-a', p_reason: 'reviewed reason', p_request_id: 'request-a' },
    })!
    const transport = deferred<'success'>()
    const actualOutcome = transport.promise.then(outcome => gate.settle(ticket, outcome))
    expect(gate.markSubmitted(ticket)).toBe(true)

    // Admin -> staff -> Admin invalidates the view twice, without switching UUID.
    gate.invalidate()
    gate.invalidate()
    const restorationRead = vi.fn()
    expect(gate.queueRead('admin-a', restorationRead)).toBe(true)
    expect(() => gate.startRead('admin-a')).toThrow(DirectoryRequestInvalidatedError)
    expect(gate.publishRead(initialRead, ['target-a'], false)).toBe(false)
    expect(gate.snapshotCurrent()).toBe(false)
    expect(gate.isCommandOwned(ticket)).toBe(true)
    expect(gate.mutationInFlight()).toBe(true)
    expect(restorationRead).not.toHaveBeenCalled()

    transport.resolve('success')
    expect(await actualOutcome).toBe(true)
    expect(gate.isCurrent(ticket)).toBe(false)
    expect(gate.mutationInFlight()).toBe(true)
    expect(restorationRead).not.toHaveBeenCalled()
    const canonicalRead = gate.startRead('admin-a', ticket)
    expect(canonicalRead.generation).toBeGreaterThan(ticket.generation)
    expect(gate.publishRead(canonicalRead, ['target-a'], false)).toBe(true)
    expect(gate.snapshotCurrent()).toBe(true)
    gate.discardQueuedRead(ticket)
    gate.releaseMutation(ticket)
    await Promise.resolve()
    expect(gate.mutationInFlight()).toBe(false)
    expect(restorationRead).not.toHaveBeenCalled()
  })

  it('drains only the latest queued read after an uncertain command and requires explicit target review', async () => {
    const gate = createDirectoryRequestGate('admin-a')
    const ticket = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    expect(gate.markSubmitted(ticket)).toBe(true)
    const earlierRead = vi.fn()
    const latestRead = vi.fn(() => {
      const read = gate.startRead('admin-a')
      gate.publishRead(read, ['target-a'], false)
    })
    expect(gate.queueRead('admin-a', earlierRead)).toBe(true)
    expect(gate.queueRead('admin-a', latestRead)).toBe(true)
    expect(gate.markUnknown(ticket)).toBe(true)
    gate.releaseMutation(ticket)
    expect(latestRead).not.toHaveBeenCalled()
    await Promise.resolve()

    expect(earlierRead).not.toHaveBeenCalled()
    expect(latestRead).toHaveBeenCalledTimes(1)
    expect(gate.snapshotCurrent()).toBe(true)
    expect(gate.hasUnresolved('target-a')).toBe(true)
    expect(gate.needsFreshRead('target-a')).toBe(true)
    const explicitRead = gate.startRead('admin-a')
    expect(gate.publishRead(explicitRead, ['target-a'], true)).toBe(true)
    expect(gate.needsFreshRead('target-a')).toBe(false)
    expect(gate.hasUnresolved('target-a')).toBe(true)
  })

  it('keeps every unresolved UUID and its exact submitted payload when a new reviewed intent is also uncertain', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const args = { p_target_id: 'target-a', p_reason: ' first exact reason ', p_request_id: 'request-a' }
    const first = gate.acquireMutation('admin-a', 'target-a', 'request-a', { rpc: 'admin_suspend_user', args })!
    expect(gate.markSubmitted(first)).toBe(true)
    expect(gate.markUnknown(first)).toBe(true)
    gate.releaseMutation(first)
    args.p_reason = 'later changed object'
    const reviewed = gate.startRead('admin-a')
    gate.publishRead(reviewed, ['target-a'], true)
    const second = gate.acquireMutation('admin-a', 'target-a', 'request-b', {
      rpc: 'admin_deactivate_user',
      args: { p_target_id: 'target-a', p_reason: 'second reason', p_request_id: 'request-b' },
    })!
    expect(gate.markSubmitted(second)).toBe(true)
    expect(gate.markUnknown(second)).toBe(true)
    gate.releaseMutation(second)

    expect(gate.unresolved().map(command => command.ticket.requestId)).toEqual(['request-a', 'request-b'])
    expect(gate.unresolved()[0].intent?.args.p_reason).toBe(' first exact reason ')
    expect(gate.unresolved()[1].intent?.rpc).toBe('admin_deactivate_user')
    expect(gate.needsFreshRead('target-a')).toBe(true)
    expect(gate.acquireMutation('admin-a', 'target-b', 'request-a')).toBeNull()
  })

  it('retains an off-page unresolved command when an unrelated target succeeds', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const uncertain = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    gate.markSubmitted(uncertain)
    gate.markUnknown(uncertain)
    gate.releaseMutation(uncertain)
    const otherPage = gate.startRead('admin-a')
    gate.publishRead(otherPage, ['target-b'], true)
    const successful = gate.acquireMutation('admin-a', 'target-b', 'request-b')!
    gate.markSubmitted(successful)
    gate.settle(successful, 'success')
    const canonicalRead = gate.startRead('admin-a', successful)
    gate.publishRead(canonicalRead, ['target-b'], false)
    gate.releaseMutation(successful)

    expect(gate.unresolved().map(command => command.ticket.requestId)).toEqual(['request-a'])
    expect(gate.hasUnresolved('target-a')).toBe(true)
    expect(gate.needsFreshRead('target-a')).toBe(true)
    expect(gate.snapshotCurrent()).toBe(true)
  })

  it('rejects pre-settlement reads on a late exact outcome without releasing a newer command', () => {
    const gate = createDirectoryRequestGate('admin-a')
    const earlier = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    gate.markSubmitted(earlier)
    gate.markUnknown(earlier)
    gate.releaseMutation(earlier)
    const review = gate.startRead('admin-a')
    gate.publishRead(review, ['target-a', 'target-b'], true)
    const newer = gate.acquireMutation('admin-a', 'target-b', 'request-b')!
    gate.markSubmitted(newer)
    gate.settle(newer, 'success')
    const published = gate.startRead('admin-a', newer)
    gate.publishRead(published, ['target-a', 'target-b'], true)
    const pending = gate.startRead('admin-a', newer)
    expect(gate.snapshotCurrent()).toBe(false)

    expect(gate.settle(earlier, 'success')).toBe(true)
    expect(gate.publishRead(pending, ['target-a', 'target-b'], true)).toBe(false)
    expect(gate.publishRead(published, ['target-a', 'target-b'], true)).toBe(false)
    expect(gate.snapshotCurrent()).toBe(false)
    expect(gate.hasUnresolved('target-a')).toBe(false)
    expect(gate.settle(earlier, 'denied')).toBe(false)
    expect(gate.markUnknown(earlier)).toBe(false)
    gate.releaseMutation(earlier)
    expect(gate.mutationInFlight()).toBe(true)
    const finalRead = gate.startRead('admin-a', newer)
    expect(gate.publishRead(finalRead, ['target-a', 'target-b'], false)).toBe(true)
    gate.releaseMutation(newer)
    expect(gate.snapshotCurrent()).toBe(true)
  })

  it('records timeout before unlocking, then invalidates a reviewed snapshot on late actual success without resending', async () => {
    vi.useFakeTimers()
    const gate = createDirectoryRequestGate('admin-a')
    const ticket = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    gate.markSubmitted(ticket)
    const transport = deferred<'success'>()
    const send = vi.fn(() => transport.promise)
    const actualOutcome = send().then(outcome => {
      gate.settle(ticket, outcome)
      return outcome
    })
    const clientOutcome = withDirectoryDeadline(actualOutcome, 20_000, 'mutation').catch(error => {
      gate.markUnknown(ticket)
      gate.releaseMutation(ticket)
      return error as unknown
    })
    gate.invalidate()
    expect(gate.isCommandOwned(ticket)).toBe(true)
    await vi.advanceTimersByTimeAsync(20_000)
    expect(await clientOutcome).toBeInstanceOf(DirectoryDeadlineError)
    expect(gate.mutationInFlight()).toBe(false)
    expect(gate.unresolved()[0].transportSettled).toBe(false)
    const review = gate.startRead('admin-a')
    gate.publishRead(review, ['target-a'], true)
    expect(gate.snapshotCurrent()).toBe(true)
    expect(gate.needsFreshRead('target-a')).toBe(false)

    transport.resolve('success')
    expect(await actualOutcome).toBe('success')
    expect(gate.snapshotCurrent()).toBe(false)
    expect(gate.unresolved()).toEqual([])
    expect(await clientOutcome).toBeInstanceOf(DirectoryDeadlineError)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('rejects old responses and queued reads after actor A -> B -> A without dirtying the new workspace', async () => {
    const gate = createDirectoryRequestGate('admin-a')
    const old = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    gate.markSubmitted(old)
    const queuedRead = vi.fn()
    gate.queueRead('admin-a', queuedRead)
    gate.markUnknown(old)
    gate.releaseMutation(old)
    gate.setActor('admin-b')
    gate.setActor('admin-a')
    const current = gate.startRead('admin-a')
    gate.publishRead(current, ['target-a'], false)
    await Promise.resolve()

    expect(current.actorEpoch).toBeGreaterThan(old.actorEpoch)
    expect(queuedRead).not.toHaveBeenCalled()
    expect(gate.isOwned(old)).toBe(false)
    expect(gate.isCommandOwned(old)).toBe(false)
    expect(gate.settle(old, 'success')).toBe(false)
    expect(gate.markUnknown(old)).toBe(false)
    expect(gate.snapshotCurrent()).toBe(true)
    expect(gate.unresolved()).toEqual([])
  })

  it('disposes command ownership so unmounted transports cannot publish or drain queued reads', async () => {
    const gate = createDirectoryRequestGate('admin-a')
    const ticket = gate.acquireMutation('admin-a', 'target-a', 'request-a')!
    gate.markSubmitted(ticket)
    const transport = deferred<'success'>()
    const actualOutcome = transport.promise.then(outcome => gate.settle(ticket, outcome))
    const queuedRead = vi.fn()
    gate.queueRead('admin-a', queuedRead)
    gate.dispose()
    transport.resolve('success')
    expect(await actualOutcome).toBe(false)
    gate.releaseMutation(ticket)
    await Promise.resolve()

    expect(gate.isOwned(ticket)).toBe(false)
    expect(gate.isCommandOwned(ticket)).toBe(false)
    expect(gate.mutationInFlight()).toBe(false)
    expect(gate.snapshotCurrent()).toBe(false)
    expect(gate.unresolved()).toEqual([])
    expect(queuedRead).not.toHaveBeenCalled()
    expect(() => gate.startRead('admin-a')).toThrow(DirectoryRequestInvalidatedError)
  })
})

describe('Admin operation deadlines', () => {
  afterEach(() => vi.useRealTimers())

  it('classifies submitted timeout as unknown and accepts eventual settlement without replay', async () => {
    vi.useFakeTimers()
    let finish!: (value: string) => void
    const underlying = new Promise<string>((resolve) => { finish = resolve })
    const result = withDirectoryDeadline(underlying, 20_000, 'mutation').catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(20_000)
    const error = await result
    expect(error).toBeInstanceOf(DirectoryDeadlineError)
    expect((error as DirectoryDeadlineError).phase).toBe('mutation')
    finish('server may have committed')
    await underlying
    expect(await result).toBe(error)
  })

  it('preserves a confirmed result/error and clears the deadline timer', async () => {
    vi.useFakeTimers()
    await expect(withDirectoryDeadline(Promise.resolve('confirmed'), 15_000, 'reread')).resolves.toBe('confirmed')
    const error = new Error('read unavailable')
    await expect(withDirectoryDeadline(Promise.reject(error), 15_000, 'read')).rejects.toBe(error)
    expect(vi.getTimerCount()).toBe(0)
  })
})
