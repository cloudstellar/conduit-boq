import type { SupabaseClient } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  affiliationJournalKey, clearAffiliationIntent, confirmAffiliation, decodeAffiliationOutcome,
  decodeAffiliationReview, fingerprintAffiliationIntent, lookupAffiliationOutcome, normalizeAffiliationReason,
  readAffiliationHistory, readAffiliationJournal, registerAffiliationIntent, reviewAffiliation,
} from '../lib/admin/users/affiliation-confirmation'

const actor = '11111111-1111-4111-8111-111111111111'
const otherActor = '22222222-2222-4222-8222-222222222222'
const target = '33333333-3333-4333-8333-333333333333'
const orgId = '44444444-4444-4444-8444-444444444444'
const departmentId = '55555555-5555-4555-8555-555555555555'
const sectorId = '66666666-6666-4666-8666-666666666666'
const requestId = '77777777-7777-4777-8777-777777777777'
const reason = 'ตรวจสอบหน่วยงานแล้ว'
const scopeBefore = { role: 'staff', status: 'active', org_id: null, department_id: null, sector_id: null } as const
const scopeAfter = { ...scopeBefore, org_id: orgId, department_id: departmentId, sector_id: sectorId }
const reviewed = {
  actor_id: actor, target_id: target, ...scopeBefore,
  requested_department_id: departmentId, requested_sector_id: sectorId,
  hierarchy: { org: { id: orgId, name: 'องค์กร', active: true },
    department: { id: departmentId, name: 'ฝ่าย', active: true, org_id: orgId },
    sector: { id: sectorId, name: 'ส่วน', active: true, department_id: departmentId } },
} as const
const review = { version: 1, actor_id: actor, target_id: target, eligible: true, code: 'ELIGIBLE', reviewed }
const applied = { version: 1, actor_id: actor, target_id: target, request_id: requestId,
  intent: { reviewed, reason }, fingerprint: 'a'.repeat(64), outcome: 'APPLIED', code: 'APPLIED',
  recorded_at: '2026-11-14T08:10:00.12345+00:00', replayed: false, before: scopeBefore, after: scopeAfter }
const denied = { ...applied, outcome: 'DENIED', code: 'REVIEW_CHANGED', after: scopeBefore }
const exactIntent = async () => ({ requestId, intentHash: await fingerprintAffiliationIntent({ reviewed, reason }) })

function useRpc(data: unknown, error: unknown = null) {
  const rpc = vi.fn().mockResolvedValue({ data, error })
  return { client: { rpc } as unknown as SupabaseClient, rpc }
}

describe('UM-B affiliation contract', () => {
  it('accepts only eligible review against the selected actor, target and real hierarchy', () => {
    expect(decodeAffiliationReview(review, actor, target)).toEqual({ kind: 'eligible', reviewed })
    expect(() => decodeAffiliationReview(review, otherActor, target)).toThrow(/binding/)
    expect(() => decodeAffiliationReview({ ...review, reviewed: { ...reviewed, target_id: otherActor } }, actor, target)).toThrow(/account/)
    const malformed = { ...reviewed, hierarchy: { ...reviewed.hierarchy, sector: { ...reviewed.hierarchy.sector, department_id: orgId } } }
    expect(() => decodeAffiliationReview({ ...review, reviewed: malformed }, actor, target)).toThrow(/hierarchy/)
  })

  it('distinguishes an unavailable migrated capability from a failed read, without falling back', async () => {
    const absent = useRpc(null, { code: 'PGRST202', message: 'Could not find the function public.um_b_affiliation_review' })
    await expect(reviewAffiliation(absent.client, actor, target)).resolves.toEqual({ kind: 'unavailable' })
    expect(absent.rpc).toHaveBeenCalledExactlyOnceWith('um_b_affiliation_review', { p_target_id: target })
    const deniedAccess = useRpc(null, { code: '42501' })
    await expect(reviewAffiliation(deniedAccess.client, actor, target)).rejects.toThrow(/unavailable/)
  })

  it('treats a bound HTTP-success denial as denial and rejects an impossible scope delta', async () => {
    expect(decodeAffiliationOutcome(applied, actor, target, requestId)).toMatchObject({ kind: 'applied' })
    const { client, rpc } = useRpc(denied)
    await expect(confirmAffiliation(client, reviewed, reason, await exactIntent())).resolves.toMatchObject({ kind: 'denied', code: 'REVIEW_CHANGED' })
    expect(rpc).toHaveBeenCalledExactlyOnceWith('um_b_confirm_affiliation', {
      p_request_id: requestId, p_target_id: target, p_reviewed: reviewed, p_reason: reason,
    })
    expect(() => decodeAffiliationOutcome({ ...applied, after: { ...scopeAfter, role: 'admin' } }, actor, target, requestId)).toThrow(/Invalid affiliation outcome/)
    expect(() => decodeAffiliationOutcome({ ...denied, after: scopeAfter }, actor, target, requestId)).toThrow(/Invalid affiliation outcome/)
  })

  it('only resolves an exact recorded intent and cannot turn a missing outcome into a write', async () => {
    const pending = await exactIntent()
    const exact = useRpc({ ...applied, replayed: true })
    await expect(lookupAffiliationOutcome(exact.client, actor, target, pending)).resolves.toMatchObject({ kind: 'applied', replayed: true })
    expect(exact.rpc).toHaveBeenCalledExactlyOnceWith('um_b_affiliation_outcome', { p_request_id: requestId })
    const empty = useRpc(null)
    await expect(lookupAffiliationOutcome(empty.client, actor, target, pending)).resolves.toBeNull()
    expect(empty.rpc).toHaveBeenCalledExactlyOnceWith('um_b_affiliation_outcome', { p_request_id: requestId })
    const tampered = useRpc({ ...applied, replayed: true, intent: { reviewed, reason: 'another intent' } })
    await expect(lookupAffiliationOutcome(tampered.client, actor, target, pending)).rejects.toThrow(/intent differs/)
  })

  it('uses database-aligned Unicode length and normalized reason', () => {
    expect(normalizeAffiliationReason(' \t')).toBeNull()
    expect(normalizeAffiliationReason('  เหตุผล\nอีกบรรทัด  ')).toBe('เหตุผล\nอีกบรรทัด')
    expect(normalizeAffiliationReason('✅\0')).toBeNull()
    expect(normalizeAffiliationReason('😀'.repeat(1000))).toHaveLength(2000)
    expect(normalizeAffiliationReason('😀'.repeat(1001))).toBeNull()
  })

  it('reads only successful affiliation confirmations for this account from the mixed history projection', async () => {
    const row = { source: 'um_b', id: `${requestId}:${actor}`, action: 'affiliation_confirmed', actor_id: actor,
      target_id: target, reason, recorded_at: applied.recorded_at, before: scopeBefore, after: scopeAfter }
    const mixedHistory = useRpc([{ ...row, source: 'p49', action: 'admin_approved', reason: 'unrelated audit reason' }, row])
    await expect(readAffiliationHistory(mixedHistory.client, target)).resolves.toEqual([{ id: requestId, reason, recordedAt: applied.recorded_at }])
    expect(mixedHistory.rpc).toHaveBeenCalledExactlyOnceWith('um_b_affiliation_history', { p_target_id: target })
    const foreign = useRpc([{ ...row, target_id: otherActor }])
    await expect(readAffiliationHistory(foreign.client, target)).rejects.toThrow(/does not match/)
    const invalidDelta = useRpc([{ ...row, after: scopeBefore }])
    await expect(readAffiliationHistory(invalidDelta.client, target)).rejects.toThrow(/Invalid affiliation history/)
  })
})

describe('UM-B unresolved browser custody', () => {
  let registry: Map<string, string>
  beforeEach(() => {
    registry = new Map()
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => registry.get(key) ?? null,
      setItem: (key: string, value: string) => registry.set(key, value),
      removeItem: (key: string) => registry.delete(key),
    })
    vi.stubGlobal('navigator', { locks: { request: async (_key: string, run: () => unknown) => run() } })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('binds the pending request to this exact Admin and target without writing the reason or review state', async () => {
    const key = affiliationJournalKey(actor, target)
    const pending = await exactIntent()
    await expect(registerAffiliationIntent(key, pending)).resolves.toEqual({ kind: 'clear' })
    await expect(registerAffiliationIntent(key, { ...pending, intentHash: 'f'.repeat(64) })).resolves.toEqual({ kind: 'pending', pending })
    expect(readAffiliationJournal(key)).toEqual({ kind: 'pending', pending })
    expect(readAffiliationJournal(affiliationJournalKey(otherActor, target))).toEqual({ kind: 'clear' })
    expect(JSON.parse(registry.get(key)!)).toEqual(pending)
    await clearAffiliationIntent(key, { ...pending, intentHash: 'f'.repeat(64) })
    expect(readAffiliationJournal(key)).toEqual({ kind: 'pending', pending })
    await clearAffiliationIntent(key, pending)
    expect(readAffiliationJournal(key)).toEqual({ kind: 'clear' })
  })

  it('cannot use malformed or inaccessible custody as a clear journal', async () => {
    const key = affiliationJournalKey(actor, target)
    registry.set(key, '{"requestId": "invalid"}')
    expect(readAffiliationJournal(key)).toEqual({ kind: 'unavailable' })
    registry.set(key, JSON.stringify({ ...await exactIntent(), applied: true }))
    expect(readAffiliationJournal(key)).toEqual({ kind: 'unavailable' })
    vi.stubGlobal('navigator', {})
    expect(readAffiliationJournal(key)).toEqual({ kind: 'unavailable' })
  })
})
