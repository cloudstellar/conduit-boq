import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  APP_DISPATCH_PROOFS, appAcceptanceOutcome, assertAppAbortEvidence, assertAppReceipt, assertAuthAdditions, assertLocalRequest, assertPhase, assertWriteOutcome, atomicJson, CAPS,
  assertFinalFixtureRetention, assertSameTokenRoleChange, assertWriteWithEvidence, canFinalizeAfterHold, classifyMetadata, EXPECTED_PREDICATE, LABELS, latchHold, main,
  negativeStatusHeaderPayload, normalizeMetadata, options, parseResponseWithEvidence, registerIntent, remainingReservationPlan, requireSuccessorMetadata,
  reserveCapacity, responseEvidence, routePayload, runFinalizationBarrier, SCENARIO, serializableResult, sha,
  staleCopyRequestAfterSourceChange, staleCopySourcePatch, TARGET,
} from '../scripts/test-s0-boq-writer-boundary-local.mjs'

const owner = '10000000-0000-4000-8000-000000000001'
const actor = '10000000-0000-4000-8000-000000000002'
const graph = '10000000-0000-4000-8000-000000000003'
const graphRoute = '10000000-0000-4000-8000-000000000004'
type Policy = { name: string; command: string; roles: string[]; permissive: boolean; using: string | null; check: string | null }
type Metadata = { relations: { schema: string; name: string; policies: Policy[] }[]; functions: { name: string; definition: string }[] }

function manifest() {
  return {
    format: 'conduit-boq/s0-local/v1', scenario: SCENARIO, target: TARGET.db, ownerId: owner,
    phase: 'PREFLIGHT', finalized: false, actors: [{ id: actor }],
    ownedIds: [actor, graph, graphRoute], intents: {}, capacity: { boqs: 0, routes: 0, items: 0 },
  }
}

function predecessor(): Metadata {
  return { relations: ['boq', 'boq_routes', 'boq_items'].map(name => ({ schema: 'public', name, policies: [
    { name: name + '_select', command: 'r', roles: ['authenticated'], permissive: true, using: 'true', check: null },
  ] })), functions: [{ name: 'p49_current_active_role', definition: 'unchanged' }] }
}

function successor() {
  const value = predecessor()
  for (const relation of value.relations) for (const [suffix, command] of [['insert', 'a'], ['update', 'w'], ['delete', 'd']]) {
    relation.policies.push({ name: `s0_${relation.name}_writer_${suffix}`, command, roles: ['authenticated'], permissive: false,
      using: suffix === 'insert' ? null : EXPECTED_PREDICATE, check: suffix === 'delete' ? null : EXPECTED_PREDICATE })
  }
  return value
}

afterEach(() => vi.restoreAllMocks())

describe('S0 local runner authority and custody guards', () => {
  it('runs default/help without API calls or credential/child-process permissions', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not call API'))
    expect(await main([])).toMatchObject({ status: 'DRY_RUN', sideEffects: false, caps: CAPS })
    expect(await main(['--help'])).toMatchObject({ status: 'DRY_RUN' })
    expect(fetch).not.toHaveBeenCalled()
    const script = resolve('scripts/test-s0-boq-writer-boundary-local.mjs')
    const output = execFileSync(process.execPath, ['--permission', '--allow-fs-read=' + script, script, '--help'], {
      env: { NODE_ENV: 'test' }, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'],
    })
    expect(JSON.parse(output)).toMatchObject({ status: 'DRY_RUN', sideEffects: false })
  })

  it('requires explicit bounded execution inputs and rejects unrelated modes', () => {
    expect(options([])).toEqual({ mode: 'dry-run' })
    expect(() => options(['--execute'])).toThrow()
    expect(() => options(['--reset'])).toThrow()
    expect(() => options(['--execute', '--run', 'um-a1-20261102-real18', '--proof-dir', '/private/tmp/a', '--output', '/private/tmp/b'])).toThrow()
    expect(() => options(['--execute', '--execute'])).toThrow()
    expect(LABELS).toHaveLength(11)
    const bounded = ['--execute', '--run', 's0-20261104-new-remaining', '--proof-dir', '/private/tmp/s0-proof', '--output', '/private/tmp/s0-new-run']
    expect(() => options(bounded)).toThrow()
    expect(options([...bounded, '--scenario', SCENARIO])).toMatchObject({ mode: 'execute', scenario: SCENARIO })
    for (const scenario of ['predecessor', 'reproduce', 'apply-032', 'all', '']) {
      expect(() => options([...bounded, '--scenario', scenario])).toThrow()
    }
    for (const run of ['s0-20261103-approved-guard2', 's0-20261103-writer-guard1', 's0-20261103-writer-guard1b']) {
      expect(() => options(['--execute', '--scenario', SCENARIO, '--run', run,
        '--proof-dir', '/private/tmp/s0-proof', '--output', '/private/tmp/s0-new-run'])).toThrow()
    }
  })

  it('rejects non-TTY execution before lock, credential reads, child processes or database access', () => {
    const script = resolve('scripts/test-s0-boq-writer-boundary-local.mjs')
    const result = spawnSync(process.execPath, ['--permission', '--allow-fs-read=' + script, script,
      '--execute', '--scenario', SCENARIO, '--run', 's0-20261103-no-tty', '--proof-dir', '/private/tmp/s0-unreadable-proof',
      '--output', '/private/tmp/s0-unwritable-output'], {
      env: { NODE_ENV: 'test' }, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'],
    })
    expect(result.status).toBe(1)
    expect(result.signal).toBeNull()
    expect(result.error).toBeUndefined()
    expect(JSON.parse(result.stdout)).toMatchObject({ status: 'HOLD', error: { code: 'ERR_ASSERTION' } })
    expect(result.stderr).not.toContain('ERR_ACCESS_DENIED')
  })

  it('rejects remote URLs, redirects and embedded credentials before fetch', () => {
    expect(assertLocalRequest(TARGET.api + '/rest/v1/boq').origin).toBe(TARGET.api)
    for (const url of ['https://example.supabase.co/rest/v1/boq', 'http://localhost:55321/rest/v1/boq',
      'http://127.0.0.1:54321/rest/v1/boq', 'http://user:pass@127.0.0.1:55321/rest/v1/boq']) {
      expect(() => assertLocalRequest(url)).toThrow()
    }
  })

  it('refuses non-owned targets, owner business writes and reused intent keys', () => {
    const state = manifest()
    const intent = { kind: 'table-write', actorId: actor, targets: [graph], payload: { value: 1 } }
    registerIntent(state, 'write', intent)
    expect(() => registerIntent(state, 'write', { ...intent, payload: { value: 2 } })).toThrow()
    expect(() => registerIntent(state, 'other', { ...intent, targets: ['10000000-0000-4000-8000-000000000099'] })).toThrow()
    expect(() => registerIntent(state, 'owner', { ...intent, actorId: owner })).toThrow()
    expect(() => registerIntent(state, 'unknown-actor', { ...intent, actorId: '10000000-0000-4000-8000-000000000099' })).toThrow()
  })

  it('blocks unresolved/closed runs and only permits ordered phase transitions', () => {
    const state = manifest()
    expect(() => assertPhase(state, 'prepare')).not.toThrow()
    expect(() => assertPhase(state, 'verify')).toThrow()
    expect(() => assertPhase({ ...state, scenario: 'predecessor' }, 'prepare')).toThrow()
    expect(() => assertPhase(state, 'reproduce')).toThrow()
    expect(() => assertPhase(state, 'apply-032')).toThrow()
    const intent = registerIntent(state, 'create', { kind: 'auth-create', actorId: actor, targets: [actor], payload: {} })
    intent.status = 'UNKNOWN'
    expect(() => assertPhase(state, 'prepare')).toThrow(/Unresolved/)
    expect(() => assertPhase(state, 'finalize')).toThrow(/Unresolved/)
    intent.status = 'CONFIRMED'
    expect(() => assertPhase(state, 'finalize')).not.toThrow() // partial prepare cleanup
    state.finalized = true
    expect(() => assertPhase(state, 'prepare')).toThrow(/Finalized/)
    expect(() => registerIntent(state, 'replacement', { kind: 'auth-create', actorId: actor, targets: [actor], payload: {} })).toThrow()
  })

  it('pins successor metadata and refuses predecessor, partial guards or unrelated drift', () => {
    const expected = successor()
    const expectedHash = sha(expected)
    expect(requireSuccessorMetadata(expected, predecessor(), expectedHash)).toBe('successor')
    expect(() => requireSuccessorMetadata(predecessor(), predecessor(), expectedHash)).toThrow()
    expect(() => requireSuccessorMetadata(expected, predecessor(), sha(predecessor()))).toThrow()
    const partial = successor(); partial.relations[0].policies.pop()
    expect(() => requireSuccessorMetadata(partial, predecessor(), expectedHash)).toThrow()
    const unrelated = successor(); unrelated.functions[0].definition = 'other function body'
    expect(() => requireSuccessorMetadata(unrelated, predecessor(), sha(unrelated))).toThrow()
    const missingScenario = { ...manifest(), scenario: undefined }
    expect(() => assertPhase(missingScenario, 'prepare')).toThrow()
  })

  it('budgets only the remaining cohort and all replaced or denied rows within existing ceilings', () => {
    const plan = remainingReservationPlan()
    expect(plan).toEqual({ initialGraphs: 15, identities: 11, sessions: 13, boqs: 22, routes: 28, items: 34 })
    const state = manifest()
    for (const type of ['boqs', 'routes', 'items'] as const) {
      reserveCapacity(state, type, plan[type], 'remaining:' + type)
      expect(state.capacity[type]).toBeLessThanOrEqual(CAPS[type])
    }
    expect(plan.boqs).toBe(15 + 4 + 1 + 1 + 1) // status INSERTs, active control, Copy, built app
    expect(plan.routes).toBe(15 + 4 + 4 + 1 + 4) // status INSERTs, Save replacements, Copy, app cap
    expect(plan.items).toBe(15 + 4 + 2 + 4 + 1 + 8) // includes both rows in the rejected bulk insert
    expect(plan.sessions).toBe(plan.identities + 1 + 1) // existing Admin API-only and new staff browser sessions
  })

  it('makes a zero-cost Factor-unbound denied payload without changing its valid Catalog version or input', () => {
    const bound = { id: graph, created_by: actor, price_list_version_id: graphRoute,
      factor_reference_version_id: owner, factor_f: 1.25, total_cost: 0, total_with_vat: 0 }
    const original = structuredClone(bound)
    const negative = negativeStatusHeaderPayload(bound)
    expect(negative).toEqual({ ...bound, factor_reference_version_id: null, factor_f: null, total_cost: 0 })
    expect(negative.price_list_version_id).toBe(graphRoute)
    expect(bound).toEqual(original)
    expect(negative).not.toBe(bound)
    // An active control uses this same empty-draft shape and must bind its default
    // through the real existing trigger; this unit test cannot establish runtime RLS.
  })

  it('latches the first core HOLD and permits only settled cleanup rather than another test or transition', () => {
    const state = { ...manifest(), phase: 'PREPARED', preparedComplete: true, failure: undefined as unknown }
    latchHold(state, Object.assign(new Error('private detail'), { code: 'ERR_ASSERTION' }), 'verify')
    expect(state).toMatchObject({ phase: 'HELD', hold: { command: 'verify' }, acceptance: { core: 'HOLD', overall: 'HOLD' } })
    const firstFailure = structuredClone(state.failure)
    latchHold(state, new Error('second failure'), 'prepare')
    expect(state.failure).toEqual(firstFailure)
    for (const phase of ['prepare', 'verify', 'reproduce', 'app-plan']) expect(() => assertPhase(state, phase)).toThrow()
    expect(() => assertPhase(state, 'finalize')).not.toThrow()
    const business = { kind: 'table-write', actorId: actor, targets: [graph], payload: { value: 1 } }
    expect(() => registerIntent(state, 'retry', business)).toThrow()
    expect(() => registerIntent(state, 'role-change', { kind: 'transition', actorId: owner, targets: [actor], payload: {} })).toThrow()
    const deactivation = { kind: 'transition', actorId: owner, targets: [actor], event: 'deactivated',
      payload: { p_target_id: actor, p_request_id: graphRoute, p_reason: 'synthetic fixture finalization' } }
    expect(() => registerIntent(state, 'finalize:' + actor, { ...deactivation, event: 'role_changed',
      payload: { ...deactivation.payload, p_new_role: 'admin' } })).toThrow()
    expect(() => registerIntent(state, 'finalize:other', deactivation)).toThrow()
    const cleanup = registerIntent(state, 'finalize:' + actor, deactivation)
    cleanup.status = 'UNKNOWN'
    expect(() => assertPhase(state, 'finalize')).toThrow(/Unresolved/)
  })

  it('keeps completed-cohort retention strict after HOLD and validates non-active partial cleanup separately', () => {
    const full = { ...manifest(), phase: 'HELD', preparedComplete: true,
      actors: LABELS.map((label: string, index: number) => ({ label, id: `10000000-0000-4000-8000-${String(index + 10).padStart(12, '0')}`, created: true })) }
    expect(() => assertFinalFixtureRetention(full, { inactive: 9, pending: 1, suspended: 1 }, 11)).not.toThrow()
    for (const counts of [{ inactive: 11 }, { inactive: 10, pending: 1 }, { inactive: 8, pending: 1, suspended: 1, active: 1 }]) {
      expect(() => assertFinalFixtureRetention(full, counts, 11)).toThrow()
    }
    const partial = { ...manifest(), phase: 'HELD', preparedComplete: false }
    expect(() => assertFinalFixtureRetention(partial, { inactive: 1, pending: 1 }, 2)).not.toThrow()
    expect(() => assertFinalFixtureRetention(partial, { active: 1, pending: 1 }, 2)).toThrow()
    expect(() => assertFinalFixtureRetention(partial, { inactive: 1 }, 2)).toThrow()
    expect(() => assertFinalFixtureRetention(partial, null, 0)).not.toThrow()
  })

  it('allows recovery only after every write and session outcome is settled and an external browser is closed', () => {
    const state = { ...manifest(), phase: 'HELD', hold: { command: 'verify' }, sessions: [{ status: 'OPEN' }],
      app: { state: 'CLOSED' } }
    expect(canFinalizeAfterHold(state)).toBe(true)
    const intent = registerIntent(state, 'finalize:' + actor, { kind: 'transition', actorId: owner, targets: [actor], event: 'deactivated',
      payload: { p_target_id: actor, p_request_id: graphRoute, p_reason: 'synthetic fixture finalization' } })
    for (const status of ['RESERVED', 'SUBMITTED', 'UNKNOWN']) {
      intent.status = status
      expect(canFinalizeAfterHold(state)).toBe(false)
    }
    intent.status = 'CONFIRMED'
    expect(canFinalizeAfterHold(state)).toBe(true)
    for (const status of ['UNKNOWN', 'SIGNOUT_SUBMITTED']) {
      state.sessions[0].status = status
      expect(canFinalizeAfterHold(state)).toBe(false)
      expect(() => assertPhase(state, 'finalize')).toThrow()
    }
    state.sessions[0].status = 'OPEN'
    for (const appState of ['PLANNED', 'SESSION', 'CREATED', 'SAVED']) {
      state.app.state = appState
      expect(canFinalizeAfterHold(state)).toBe(false)
    }
    state.app.state = 'CLOSED'
    state.finalized = true
    expect(canFinalizeAfterHold(state)).toBe(false)
  })

  it('blocks all cleanup mutations when finalization metadata verification fails', async () => {
    const custody = vi.fn(async () => undefined)
    const deactivate = vi.fn()
    const signOut = vi.fn()
    const mutate = vi.fn(async () => { deactivate(); signOut() })
    await expect(runFinalizationBarrier({ metadata: async () => { throw new Error('metadata drift') }, custody, mutate }))
      .rejects.toThrow('metadata drift')
    expect(custody).not.toHaveBeenCalled()
    expect(mutate).not.toHaveBeenCalled()
    expect(deactivate).not.toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('blocks all cleanup mutations when fresh original-custody verification fails', async () => {
    const metadata = vi.fn(async () => 'successor')
    const deactivate = vi.fn()
    const signOut = vi.fn()
    const mutate = vi.fn(async () => { deactivate(); signOut() })
    await expect(runFinalizationBarrier({ metadata, custody: async () => { throw new Error('original custody changed') }, mutate }))
      .rejects.toThrow('original custody changed')
    expect(metadata).toHaveBeenCalledTimes(1)
    expect(mutate).not.toHaveBeenCalled()
    expect(deactivate).not.toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('awaits metadata and fresh original custody in order before any cleanup mutation', async () => {
    const order: string[] = []
    const metadata = vi.fn(async () => { order.push('metadata:start'); await Promise.resolve(); order.push('metadata:pass') })
    const custody = vi.fn(async () => { order.push('custody:start'); await Promise.resolve(); order.push('custody:pass') })
    const mutate = vi.fn(async () => { order.push('cleanup:mutate'); return 'cleanup complete' })
    await expect(runFinalizationBarrier({ metadata, custody, mutate })).resolves.toBe('cleanup complete')
    expect(order).toEqual(['metadata:start', 'metadata:pass', 'custody:start', 'custody:pass', 'cleanup:mutate'])
    expect(mutate).toHaveBeenCalledTimes(1)
  })

  it('counts reservations cumulatively, including deleted/replaced generations', () => {
    const state = manifest()
    reserveCapacity(state, 'routes', 95, 'initial-and-replaced')
    reserveCapacity(state, 'routes', 1, 'save-generation')
    expect(state.capacity.routes).toBe(96)
    reserveCapacity(state, 'routes', 1, 'save-generation')
    expect(state.capacity.routes).toBe(96)
    expect(() => reserveCapacity(state, 'routes', 2, 'save-generation')).toThrow()
    expect(() => reserveCapacity(state, 'routes', 1, 'replacement-after-delete')).toThrow(/cap/)
  })

  it('hashes a safe login projection without traversing a client or persisting a token', () => {
    const client: { self?: unknown } = {}
    client.self = client
    const result = serializableResult({ id: actor, sessionId: graph, token: 'test-secret-token', client })
    expect(result).toMatchObject({ id: actor, sessionId: graph })
    expect(JSON.stringify(result)).not.toContain('test-secret-token')
    expect(Object.keys(result)).toEqual(['id', 'sessionId', 'tokenHash'])
  })

  it('does not confuse 401/5xx/constraint errors or expired JWTs with RLS denial', () => {
    const before = { header: { id: graph }, routes: [], items: [] }
    const valid = { expiresAt: Date.now() + 600_000 }
    expect(() => assertWriteOutcome({ status: 403, data: { code: '42501' } }, before, before, false, valid, 'POST')).not.toThrow()
    expect(() => assertWriteOutcome({ status: 401, data: { code: '42501' } }, before, before, false, valid, 'POST')).toThrow()
    expect(() => assertWriteOutcome({ status: 401, data: { code: '42501' } }, before, before, false, null, 'POST')).not.toThrow()
    expect(() => assertWriteOutcome({ status: 200, data: [] }, before, before, false, valid, 'PATCH')).not.toThrow()
    for (const result of [{ status: 401, data: { code: 'PGRST301' } }, { status: 500, data: {} },
      { status: 400, data: { code: '23505' } }, { status: 400, data: { code: 'P0001', message: 'BOQ ต้องอ้างอิง Factor F version ที่ active เท่านั้น' } },
      { status: 200, data: null }]) {
      expect(() => assertWriteOutcome(result, before, before, false, valid, 'PATCH')).toThrow()
    }
    expect(() => assertWriteOutcome({ status: 403, data: { code: '42501' } }, before, before, false, { expiresAt: 0 }, 'POST')).toThrow(/Expired/)
    expect(() => assertWriteOutcome({ status: 200, data: [] }, before, { header: null }, false, valid, 'PATCH')).toThrow(/changed/)
    expect(() => assertWriteOutcome({ status: 200, data: [{ id: graph }] }, before, before, true, valid, 'PATCH')).toThrow(/did not change/)
  })

  it('requires an explicit denied INSERT while allowing proven zero-row UPDATE and DELETE', () => {
    const absent = { header: null, routes: [], items: [] }
    const existing = { header: { id: graph }, routes: [], items: [] }
    const valid = { expiresAt: Date.now() + 600_000 }
    for (const status of [200, 201, 204]) {
      expect(() => assertWriteOutcome({ status, data: [] }, absent, absent, false, valid, 'POST')).toThrow()
    }
    for (const method of ['PATCH', 'DELETE']) {
      expect(() => assertWriteOutcome({ status: 200, data: [] }, existing, existing, false, valid, method)).not.toThrow()
      expect(() => assertWriteOutcome({ status: 200, data: [] }, existing, absent, false, valid, method)).toThrow(/changed/)
    }
    expect(() => assertWriteOutcome({ status: 403, data: { code: '42501' } }, absent,
      { header: { id: graph }, routes: [], items: [] }, false, valid, 'POST')).toThrow(/changed/)
  })

  it('records sanitized response evidence even when classification fails and awaits durable persistence', async () => {
    const before = { header: null, routes: [], items: [] }
    const valid = { expiresAt: Date.now() + 600_000 }
    const secret = 'never-record-this-raw-response-or-token'
    const result = { status: 400, data: { code: 'P0001', message: secret,
      details: { token: secret }, hint: 'untrusted@example.invalid', authorization: secret } }
    const records: unknown[] = []
    const persist = vi.fn(async (receipt: unknown) => { records.push(structuredClone(receipt)) })
    await expect(assertWriteWithEvidence(result, before, before, false, valid, 'POST',
      { label: 'status:pending:boq:I', persist })).rejects.toThrow()
    expect(persist).toHaveBeenCalledTimes(1)
    expect(records).toHaveLength(1)
    const serialized = JSON.stringify(records)
    for (const forbidden of [secret, 'untrusted@example.invalid', 'authorization', 'details', 'hint']) {
      expect(serialized).not.toContain(forbidden)
    }
    await expect(assertWriteWithEvidence({ status: 403, data: { code: '42501' } }, before, before, false, valid, 'POST', {
      label: 'status:pending:boq:I', persist: async () => { throw new Error('receipt disk failure') },
    })).rejects.toThrow('receipt disk failure')
  })

  it('keeps response labels and status/code without admitting arbitrary response fields or treating trigger errors as RLS', () => {
    const evidence = responseEvidence({ status: 400, data: { code: 'P0001',
      message: 'BOQ ต้องอ้างอิง Factor F version ที่ active เท่านั้น', details: 'private detail', hint: 'secret' } },
    { label: 'status:pending:boq:I', method: 'POST' })
    const serialized = JSON.stringify(evidence)
    expect(serialized).toContain('status:pending:boq:I')
    expect(serialized).toContain('POST')
    expect(serialized).toContain('400')
    expect(serialized).toContain('P0001')
    expect(serialized).not.toContain('private detail')
    expect(serialized).not.toContain('secret')
    expect(serialized).not.toContain('BOQ ต้องอ้างอิง Factor F version ที่ active เท่านั้น')
    const invalidCode = responseEvidence({ status: 400, data: { code: 'Bearer secret-token', message: 'secret-token' } },
      { label: 'status:pending:boq:I', method: 'POST' })
    expect(JSON.stringify(invalidCode)).not.toContain('secret-token')
    expect(responseEvidence({ status: 401, data: { code: 'PGRST301', message: 'untrusted private JWT detail' } },
      { label: 'status:pending:boq:I', method: 'POST' })).toMatchObject({ status: 401, code: 'PGRST301' })
  })

  it('durably records non-JSON response status and body hash before an UNKNOWN parse failure without retaining the body', async () => {
    const raw = '<html>private-token@example.invalid Bearer never-retain-this-body</html>'
    for (const status of [200, 400, 502]) {
      const records: unknown[] = []
      const events: string[] = []
      let release: () => void = () => { throw new Error('Durability gate was not initialized') }
      const durable = new Promise<void>(resolve => { release = resolve })
      const result = parseResponseWithEvidence(raw, status, { label: 'status:pending:boq:I', method: 'POST', elapsedMs: 12 },
        async (receipt: unknown) => { records.push(receipt); await durable; events.push('persisted') })
      void result.catch(() => { events.push('thrown') })
      await Promise.resolve()
      expect(records).toHaveLength(1)
      expect(events).toEqual([])
      release()
      await expect(result).rejects.toMatchObject({ code: 'RESPONSE_PARSE_ERROR' })
      expect(events).toEqual(['persisted', 'thrown'])
      expect(records[0]).toMatchObject({ status, code: null, bodyHash: sha(raw), parseError: true })
      const serialized = JSON.stringify(records)
      for (const secret of [raw, 'private-token@example.invalid', 'never-retain-this-body', '<html>']) {
        expect(serialized).not.toContain(secret)
      }
    }
    const persist = vi.fn(async () => { throw new Error('cannot persist parse receipt') })
    await expect(parseResponseWithEvidence(raw, 502, { label: 'status:pending:boq:I', method: 'POST' }, persist))
      .rejects.toThrow('cannot persist parse receipt')
    expect(persist).toHaveBeenCalledTimes(1)
    const untouched = vi.fn()
    expect(await parseResponseWithEvidence('[]', 200, { label: 'read', method: 'GET' }, untouched)).toEqual([])
    expect(await parseResponseWithEvidence('', 204, { label: 'read', method: 'GET' }, untouched)).toBeNull()
    expect(untouched).not.toHaveBeenCalled()
  })

  it('proves role change with the same still-valid actor token and current active procurement profile', () => {
    const mutable = { id: actor, token: 'synthetic-original-access-token', expiresAt: Date.now() + 600_000 }
    const beforeHash = sha(mutable.token)
    const profile = { id: actor, status: 'active', role: 'procurement' }
    expect(() => assertSameTokenRoleChange(beforeHash, mutable, profile)).not.toThrow()
    expect(() => assertSameTokenRoleChange(beforeHash, { ...mutable, token: 'refreshed-token' }, profile)).toThrow()
    expect(() => assertSameTokenRoleChange(beforeHash, { ...mutable, expiresAt: 0 }, profile)).toThrow()
    for (const changed of [{ ...profile, id: owner }, { ...profile, status: 'inactive' }, { ...profile, role: 'staff' }]) {
      expect(() => assertSameTokenRoleChange(beforeHash, mutable, changed)).toThrow()
    }
  })

  it('uses distinct before/after route ordinals when assignee DELETE stays denied', () => {
    const shape = { id: graph, routeId: graphRoute }
    expect(routePayload(shape).route_order).toBe(1)
    expect(routePayload(shape, actor, 2).route_order).toBe(2)
    expect(routePayload(shape, owner, 3).route_order).toBe(3)
  })

  it('advances and proves the owned source token before dispatching Copy with the original stale token', () => {
    const payload = { p_source_boq_id: graph, p_request_id: actor,
      p_expected_source_updated_at: '2026-11-03T00:00:00.123456+00:00',
      p_mode: 'preserve', p_factor_reference_version_id: null }
    const original = { ...payload }
    const patch = staleCopySourcePatch(payload, 'owned source changed')
    expect(patch).toEqual({ project_name: 'owned source changed', updated_at: '2026-11-03T00:00:01.123Z' })
    const stored = { id: graph, updated_at: '2026-11-03T00:00:01.123+00:00' }
    const stale = staleCopyRequestAfterSourceChange(payload, patch, stored, stored, graphRoute)
    expect(stale).toEqual({ ...original, p_request_id: graphRoute })
    expect(stale.p_expected_source_updated_at).toBe(original.p_expected_source_updated_at)
    expect(payload).toEqual(original)
    const unchanged = { id: graph, updated_at: original.p_expected_source_updated_at }
    expect(() => staleCopyRequestAfterSourceChange(payload, patch, unchanged, unchanged, graphRoute)).toThrow(/persist/)
    expect(() => staleCopyRequestAfterSourceChange(payload, { ...patch, updated_at: original.p_expected_source_updated_at }, unchanged, unchanged, graphRoute)).toThrow(/advance/)
    expect(() => staleCopyRequestAfterSourceChange(payload, patch, unchanged, stored, graphRoute)).toThrow(/differ/)
    expect(() => staleCopyRequestAfterSourceChange(payload, patch, stored, { ...stored, id: owner }, graphRoute)).toThrow(/another BOQ/)
    expect(() => staleCopyRequestAfterSourceChange(payload, patch, stored, stored, payload.p_request_id)).toThrow(/UUID/)
    expect(() => staleCopySourcePatch({ ...payload, p_expected_source_updated_at: 'invalid' }, 'owned')).toThrow(/valid/)
  })

  it('accepts exact predecessor/+9 successor, not a partial or widened predicate', () => {
    expect(classifyMetadata(predecessor(), predecessor())).toBe('predecessor')
    expect(classifyMetadata(successor(), predecessor())).toBe('successor')
    const partial = successor(); partial.relations[0].policies.pop()
    expect(() => classifyMetadata(partial, predecessor())).toThrow()
    const widened = successor()
    widened.relations[0].policies[1].check = '(' + EXPECTED_PREDICATE + ') OR true'
    expect(() => classifyMetadata(widened, predecessor())).toThrow(/predicate/)
    const otherRole = successor(); otherRole.relations[0].policies[1].roles = ['PUBLIC']
    expect(() => classifyMetadata(otherRole, predecessor())).toThrow()
  })

  it('does not hide unrelated s0-prefixed policies or function/grant drift', () => {
    const extra = successor()
    extra.relations[0].policies.push({ name: 's0_unreviewed', command: 'r', roles: ['authenticated'], permissive: true, using: 'true', check: null })
    expect(normalizeMetadata(extra).relations[0].policies.some((policy: Policy) => policy.name === 's0_unreviewed')).toBe(true)
    expect(() => classifyMetadata(extra, predecessor())).toThrow(/drift/)
    const changed = successor(); changed.functions[0].definition = 'changed'
    expect(() => classifyMetadata(changed, predecessor())).toThrow(/drift/)
  })

  it('binds each external built-app receipt to the exact new run/actor/intent and rejects adoption/replay', () => {
    const state = { ...manifest(), phase: 'VERIFIED', run: 's0-20261103-test', app: {
      state: 'SESSION', actor: { id: actor }, projectName: 'unique synthetic project', beforeBoqIds: [owner],
      operations: { login: actor, create: graph, save: graphRoute, logout: owner },
    } }
    const receipt = { stage: 'created', run: state.run, actorId: actor, projectName: state.app.projectName,
      boqId: '10000000-0000-4000-8000-000000000005', outcome: 'CONFIRMED',
      dispatch: { operationId: graph, status: 'SUBMITTED', payloadHash: 'a'.repeat(64), startedAt: '2026-11-03T00:00:00Z' } }
    expect(() => assertAppReceipt(state, receipt)).not.toThrow()
    expect(() => assertAppReceipt(state, { ...receipt, boqId: owner })).toThrow(/adopt/)
    expect(() => assertAppReceipt(state, { ...receipt, boqId: graph })).toThrow(/adopt/)
    expect(() => assertAppReceipt(state, { ...receipt, run: 'old-run' })).toThrow(/Stale/)
    expect(() => assertAppReceipt(state, { ...receipt, actorId: owner })).toThrow(/Stale/)
    expect(() => assertAppReceipt(state, { ...receipt, outcome: 'UNKNOWN' })).toThrow(/UNKNOWN/)
    expect(() => assertAppReceipt(state, { ...receipt, dispatch: { ...receipt.dispatch, operationId: actor } })).toThrow(/intent/)
    state.app.state = 'CREATED'
    expect(() => assertAppReceipt(state, receipt)).toThrow(/replay/)
  })

  it('allows PLANNED app abort only with absent dispatch proofs and independently unchanged sessions and graphs', () => {
    const state = { ...manifest(), phase: 'VERIFIED', run: 's0-20261103-test', app: {
      state: 'PLANNED', actor: { id: actor }, projectName: 'unique synthetic project',
      beforeSessions: [graphRoute], beforeBoqIds: [owner], beforeChildIds: [graph],
      operations: { login: actor }, receipts: {},
    } }
    const receipt = { stage: 'aborted', run: state.run, actorId: actor, projectName: state.app.projectName,
      operationId: actor, outcome: 'NOT_DISPATCHED' }
    const actual = { sessions: [graphRoute], boqIds: [owner], childIds: [graph] }
    expect(() => assertAppReceipt(state, receipt)).not.toThrow()
    expect(() => assertAppAbortEvidence(state, [], actual)).not.toThrow()
    for (const proof of APP_DISPATCH_PROOFS) expect(() => assertAppAbortEvidence(state, [proof], actual)).toThrow(/proof/)
    expect(() => assertAppReceipt(state, { ...receipt, operationId: owner })).toThrow(/another login/)
    expect(() => assertAppReceipt(state, { ...receipt, outcome: 'UNKNOWN' })).toThrow(/never-dispatched/)
    expect(() => assertAppReceipt(state, { ...receipt, dispatch: { status: 'SUBMITTED' } })).toThrow(/never-dispatched/)
    expect(() => assertAppAbortEvidence(state, [], { ...actual, sessions: [...actual.sessions, actor] })).toThrow(/session/)
    expect(() => assertAppAbortEvidence(state, [], { ...actual, boqIds: [...actual.boqIds, actor] })).toThrow(/BOQ/)
    expect(() => assertAppAbortEvidence(state, [], { ...actual, childIds: [] })).toThrow(/child/)
    expect(() => assertAppAbortEvidence({ ...state, app: { ...state.app, receipts: { session: {} } } }, [], actual)).toThrow(/recorded outcome/)
    state.app.state = 'SESSION'
    expect(() => assertAppReceipt(state, receipt)).toThrow(/never-dispatched/)
    expect(() => assertAppAbortEvidence(state, [], actual)).toThrow(/recorded outcome/)
  })

  it('keeps cleanup-only browser closure separate from built-app acceptance even after Save succeeded', () => {
    const closed = { stage: 'closed', appAcceptance: 'PASS', cleanupOnly: false }
    expect(appAcceptanceOutcome({ state: 'SAVED' }, closed)).toBe('PASS')
    expect(appAcceptanceOutcome({ state: 'SAVED' }, { ...closed, appAcceptance: 'HOLD', cleanupOnly: true })).toBe('HOLD')
    for (const state of ['SESSION', 'CREATED']) {
      expect(() => appAcceptanceOutcome({ state }, closed)).toThrow()
      expect(appAcceptanceOutcome({ state }, { ...closed, appAcceptance: 'HOLD', cleanupOnly: true })).toBe('HOLD')
    }
    for (const receipt of [{ stage: 'closed' }, { ...closed, cleanupOnly: true },
      { ...closed, appAcceptance: 'HOLD' }, { ...closed, stage: 'saved' }]) {
      expect(() => appAcceptanceOutcome({ state: 'SAVED' }, receipt)).toThrow()
    }
    expect(() => appAcceptanceOutcome({ state: 'PLANNED' }, { ...closed, appAcceptance: 'HOLD', cleanupOnly: true })).toThrow()

    const state = { ...manifest(), phase: 'HELD', hold: { command: 'app-record' }, run: 's0-20261103-unit-held-app', app: {
      state: 'SAVED', actor: { id: actor }, projectName: 'synthetic built app', sessionId: graphRoute,
      operations: { login: actor, create: graph, save: graphRoute, logout: owner },
    } }
    const cleanup = { stage: 'closed', appAcceptance: 'HOLD', cleanupOnly: true, run: state.run,
      actorId: actor, projectName: state.app.projectName, sessionId: graphRoute, outcome: 'CONFIRMED',
      dispatch: { operationId: owner, status: 'SUBMITTED', payloadHash: 'a'.repeat(64), startedAt: '2026-11-03T00:00:00Z' } }
    expect(() => assertAppReceipt(state, cleanup)).not.toThrow()
    expect(() => assertAppReceipt(state, { ...cleanup, stage: 'saved' })).toThrow()
    expect(() => assertAppReceipt(state, { ...cleanup, stage: 'session' })).toThrow()
  })

  it('fails closed on NULL/unattributed Auth additions and correlates Owner audit to one dedicated operation window', () => {
    const policy = { fixtureIds: [actor], ownerId: owner, sessions: [{ userId: actor, sessionId: graph }, { userId: owner, sessionId: graphRoute }],
      ownerLogin: { startedAt: '2026-11-03T00:00:00Z', finishedAt: '2026-11-03T00:00:01Z' },
      ownerLogout: { startedAt: '2026-11-03T00:10:00Z', finishedAt: '2026-11-03T00:10:01Z' } }
    const audit = { actorId: owner, action: 'login', createdAt: '2026-11-03T00:00:00.500Z' }
    const valid = { sessions: [{ userId: actor, id: graph }], tokens: [{ userId: actor, sessionId: graph }], audits: [audit] }
    expect(() => assertAuthAdditions(valid, policy)).not.toThrow()
    for (const userId of [null, undefined, '10000000-0000-4000-8000-000000000099']) {
      expect(() => assertAuthAdditions({ ...valid, sessions: [{ userId, id: graph }] }, policy)).toThrow()
      expect(() => assertAuthAdditions({ ...valid, tokens: [{ userId, sessionId: graph }] }, policy)).toThrow()
      expect(() => assertAuthAdditions({ ...valid, audits: [{ ...audit, actorId: userId }] }, policy)).toThrow()
    }
    expect(() => assertAuthAdditions({ ...valid, tokens: [{ userId: actor, sessionId: null }] }, policy)).toThrow()
    expect(() => assertAuthAdditions({ ...valid, sessions: [{ userId: owner, id: graph }] }, policy)).toThrow()
    expect(() => assertAuthAdditions({ ...valid, audits: [{ ...audit, action: 'user_deleted' }] }, policy)).toThrow()
    expect(() => assertAuthAdditions({ ...valid, audits: [{ ...audit, createdAt: '2026-11-03T00:09:00Z' }] }, policy)).toThrow(/window/)
    expect(() => assertAuthAdditions({ ...valid, audits: [audit, audit] }, policy)).toThrow(/More than one/)
    expect(() => assertAuthAdditions({ ...valid, audits: [{ ...audit, createdAt: null }] }, policy)).toThrow(/window/)
  })

  it('admits only the exact service-role creation audit for one confirmed reserved fixture intent', () => {
    const create = { kind: 'auth-create', status: 'CONFIRMED', actorId: actor, targets: [actor],
      payload: { id: actor, email: 's0.fixture@example.invalid' },
      startedAt: '2026-11-03T00:00:00Z', finishedAt: '2026-11-03T00:00:01Z' }
    const policy = { fixtureIds: [actor], ownerId: owner, sessions: [], authCreates: [create] }
    const audit = { actorId: '00000000-0000-0000-0000-000000000000', actorUsername: 'service_role', actorViaSso: false,
      action: 'user_signedup', logType: 'team', targetId: actor, targetEmailHash: sha(create.payload.email), provider: 'email',
      createdAt: '2026-11-03T00:00:00.500Z' }
    const additions = { sessions: [], tokens: [], audits: [audit] }
    expect(() => assertAuthAdditions(additions, policy)).not.toThrow()
    expect(() => assertAuthAdditions(additions, { ...policy, authCreates: [] })).toThrow(/confirmed intent/)
    expect(() => assertAuthAdditions(additions, { ...policy, authCreates: [{ ...create, status: 'UNKNOWN' }] })).toThrow(/confirmed intent/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, targetId: owner }] }, policy)).toThrow(/unowned/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, targetId: null }] }, policy)).toThrow(/unowned/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, actorId: actor }] }, policy)).toThrow(/contract/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, actorUsername: null }] }, policy)).toThrow(/contract/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, actorViaSso: null }] }, policy)).toThrow(/contract/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, provider: null }] }, policy)).toThrow(/contract/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, logType: 'account' }] }, policy)).toThrow(/contract/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, targetEmailHash: null }] }, policy)).toThrow(/email/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, targetEmailHash: sha('unowned@example.invalid') }] }, policy)).toThrow(/email/)
    expect(() => assertAuthAdditions({ ...additions, audits: [{ ...audit, createdAt: '2026-11-03T00:10:00Z' }] }, policy)).toThrow(/window/)
    expect(() => assertAuthAdditions({ ...additions, audits: [audit, audit] }, policy)).toThrow(/More than one/)
  })

  it('persists private intent state atomically before a subsequent dispatch can read it', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 's0-runner-unit-'))
    try {
      const path = resolve(directory, 'manifest.json')
      await atomicJson(path, { intent: { status: 'SUBMITTED', requestId: graph } })
      expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ intent: { status: 'SUBMITTED', requestId: graph } })
      expect((await stat(path)).mode & 0o777).toBe(0o600)
      await atomicJson(path, { intent: { status: 'CONFIRMED', requestId: graph } })
      expect(JSON.parse(await readFile(path, 'utf8')).intent.status).toBe('CONFIRMED')
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
})
