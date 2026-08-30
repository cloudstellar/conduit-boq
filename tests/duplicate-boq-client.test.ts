import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authorizationMocks = vi.hoisted(() => ({
  requireActiveProfile: vi.fn(),
}))

vi.mock('@/lib/auth/authorization', () => authorizationMocks)

import {
  duplicateBOQAtomic,
  getDuplicateBOQErrorMessage,
  getDuplicateBOQRecoveryAction,
  isDuplicateBOQSourceStaleError,
  type DuplicateBOQRequest,
} from '../lib/boq/duplicate'

const sourceBOQId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const requestId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const newBOQId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const factorVersionId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const expectedSourceUpdatedAt = '2026-08-31T09:14:27.123456+00:00'

function successResult(duplicateRequest = false) {
  return {
    success: true,
    boq_id: newBOQId,
    source_boq_id: sourceBOQId,
    mode: 'preserve',
    factor_reference_version_id: factorVersionId,
    duplicateRequest,
  }
}

describe('atomic BOQ duplicate client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authorizationMocks.requireActiveProfile.mockResolvedValue({})
  })

  it('requires an active profile and sends the exact preserve RPC contract', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: successResult(), error: null })
    const supabase = { rpc } as unknown as SupabaseClient
    const request: DuplicateBOQRequest = {
      sourceBOQId,
      requestId,
      expectedSourceUpdatedAt,
      mode: 'preserve',
      factorReferenceVersionId: null,
    }

    await expect(duplicateBOQAtomic(supabase, request)).resolves.toEqual(successResult())
    expect(authorizationMocks.requireActiveProfile).toHaveBeenCalledWith(supabase)
    expect(rpc).toHaveBeenCalledWith('duplicate_boq_atomic', {
      p_source_boq_id: sourceBOQId,
      p_request_id: requestId,
      p_expected_source_updated_at: expectedSourceUpdatedAt,
      p_mode: 'preserve',
      p_factor_reference_version_id: null,
    })
  })

  it('reuses the caller-provided request id safely when the same intent is retried', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: successResult(), error: null })
      .mockResolvedValueOnce({ data: successResult(true), error: null })
    const supabase = { rpc } as unknown as SupabaseClient
    const request: DuplicateBOQRequest = {
      sourceBOQId,
      requestId,
      expectedSourceUpdatedAt,
      mode: 'preserve',
    }

    await duplicateBOQAtomic(supabase, request)
    await expect(duplicateBOQAtomic(supabase, request)).resolves.toMatchObject({
      boq_id: newBOQId,
      duplicateRequest: true,
    })

    expect(rpc.mock.calls.map(([, args]) => args.p_request_id)).toEqual([
      requestId,
      requestId,
    ])
    expect(rpc.mock.calls.map(([, args]) => args.p_expected_source_updated_at)).toEqual([
      expectedSourceUpdatedAt,
      expectedSourceUpdatedAt,
    ])
  })

  it('surfaces a stale source token without silently retrying against newer source data', async () => {
    const staleError = { code: '40001', message: 'source changed' }
    const rpc = vi.fn().mockResolvedValue({ data: null, error: staleError })
    const supabase = { rpc } as unknown as SupabaseClient

    await expect(duplicateBOQAtomic(supabase, {
      sourceBOQId,
      requestId,
      expectedSourceUpdatedAt,
      mode: 'select_factor',
      factorReferenceVersionId: factorVersionId,
    })).rejects.toBe(staleError)

    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('duplicate_boq_atomic', {
      p_source_boq_id: sourceBOQId,
      p_request_id: requestId,
      p_expected_source_updated_at: expectedSourceUpdatedAt,
      p_mode: 'select_factor',
      p_factor_reference_version_id: factorVersionId,
    })
  })

  it('rejects a malformed success response instead of navigating to an unknown BOQ', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { success: true, boq_id: newBOQId },
      error: null,
    })
    const supabase = { rpc } as unknown as SupabaseClient

    await expect(duplicateBOQAtomic(supabase, {
      sourceBOQId,
      requestId,
      expectedSourceUpdatedAt,
      mode: 'select_factor',
      factorReferenceVersionId: factorVersionId,
    })).rejects.toMatchObject({ code: 'INVALID_DUPLICATE_RESPONSE' })
  })

  it('rejects a selected-Factor response bound to a different Factor version', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ...successResult(),
        mode: 'select_factor',
        factor_reference_version_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      },
      error: null,
    })
    const supabase = { rpc } as unknown as SupabaseClient

    await expect(duplicateBOQAtomic(supabase, {
      sourceBOQId,
      requestId,
      expectedSourceUpdatedAt,
      mode: 'select_factor',
      factorReferenceVersionId: factorVersionId,
    })).rejects.toMatchObject({ code: 'INVALID_DUPLICATE_RESPONSE' })
  })

  it('maps stable database codes to actionable preserve and selected-Factor messages', () => {
    expect(getDuplicateBOQErrorMessage({ code: '42501' }, 'preserve')).toContain('ไม่มีสิทธิ์')
    expect(getDuplicateBOQErrorMessage({ code: 'P0002' }, 'preserve')).toContain('ไม่พบ BOQ')
    expect(getDuplicateBOQErrorMessage({ code: '40001' }, 'preserve')).toContain('โหลดข้อมูลใหม่')
    expect(isDuplicateBOQSourceStaleError({ code: '40001' })).toBe(true)
    expect(isDuplicateBOQSourceStaleError({ code: '55000' })).toBe(false)
    expect(getDuplicateBOQErrorMessage({ code: '22023' }, 'preserve')).toContain('เปิดหน้าแก้ไข')
    expect(getDuplicateBOQErrorMessage({ code: '22023' }, 'select_factor')).toContain('สร้าง BOQ ใหม่')
    expect(getDuplicateBOQErrorMessage({ code: '55000' }, 'preserve')).toContain('สร้าง BOQ ใหม่')
    expect(getDuplicateBOQErrorMessage({ code: 'PGRST202' }, 'preserve')).toContain('ยังไม่พร้อมใช้งาน')
  })

  it('routes permanent source failures away from an unsafe retry loop', () => {
    expect(getDuplicateBOQRecoveryAction({ code: '40001' }, 'preserve')).toBe('reload')
    expect(getDuplicateBOQRecoveryAction({ code: '22023' }, 'preserve')).toBe('open_source')
    expect(getDuplicateBOQRecoveryAction({ code: '22023' }, 'select_factor')).toBe('create_new')
    expect(getDuplicateBOQRecoveryAction({ code: '55000' }, 'preserve')).toBe('create_new')
    expect(getDuplicateBOQRecoveryAction({ code: '42501' }, 'preserve')).toBe('dismiss')
    expect(getDuplicateBOQRecoveryAction({ code: 'PGRST202' }, 'preserve')).toBe('dismiss')
  })
})
