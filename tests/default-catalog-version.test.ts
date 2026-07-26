import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  BOUND_CATALOG_UNAVAILABLE_MESSAGE,
  DEFAULT_CATALOG_UNAVAILABLE_MESSAGE,
  getActiveDefaultPriceListVersion,
  getActiveDefaultPriceListVersionId,
  getPriceListVersionSummary,
} from '../lib/catalog/defaultVersion'

interface QueryResponse {
  data: Record<string, unknown> | null
  error: { message: string } | null
}

function createSupabaseMock(
  responses: Record<string, QueryResponse>,
  calls: string[],
): SupabaseClient {
  return {
    from(table: string) {
      calls.push(`from:${table}`)
      const builder = {
        select(columns: string) {
          calls.push(`select:${table}:${columns}`)
          return builder
        },
        eq(column: string, value: unknown) {
          calls.push(`eq:${table}:${column}:${String(value)}`)
          return builder
        },
        async maybeSingle() {
          return responses[table]
        },
      }
      return builder
    },
  } as unknown as SupabaseClient
}

describe('active default catalog lookup', () => {
  it('returns the active version referenced by the singleton pointer', async () => {
    const calls: string[] = []
    const supabase = createSupabaseMock({
      price_list_default_version: {
        data: { version_id: 'version-2568' },
        error: null,
      },
      price_list_versions: {
        data: {
          id: 'version-2568',
          status: 'active',
          version_string: '2568.0.0',
        },
        error: null,
      },
    }, calls)

    await expect(getActiveDefaultPriceListVersion(supabase))
      .resolves.toEqual({
        id: 'version-2568',
        status: 'active',
        versionString: '2568.0.0',
        year: 2568,
      })
    expect(calls).toContain('select:price_list_versions:id, version_string, status')
  })

  it('keeps the ID-only lookup as a backwards-compatible wrapper', async () => {
    const calls: string[] = []
    const supabase = createSupabaseMock({
      price_list_default_version: {
        data: { version_id: 'version-2568' },
        error: null,
      },
      price_list_versions: {
        data: {
          id: 'version-2568',
          status: 'active',
          version_string: '2568.0.0',
        },
        error: null,
      },
    }, calls)

    await expect(getActiveDefaultPriceListVersionId(supabase))
      .resolves.toBe('version-2568')
    expect(calls).toContain('eq:price_list_default_version:id:true')
    expect(calls).toContain('eq:price_list_versions:status:active')
  })

  it('fails closed when the singleton pointer is missing', async () => {
    const supabase = createSupabaseMock({
      price_list_default_version: { data: null, error: null },
    }, [])

    await expect(getActiveDefaultPriceListVersionId(supabase))
      .rejects.toThrow(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE)
  })

  it('fails closed when the referenced version is not active', async () => {
    const supabase = createSupabaseMock({
      price_list_default_version: {
        data: { version_id: 'version-2568' },
        error: null,
      },
      price_list_versions: {
        data: null,
        error: null,
      },
    }, [])

    await expect(getActiveDefaultPriceListVersionId(supabase))
      .rejects.toThrow(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE)
  })

  it('reads archived versions for historical BOQs', async () => {
    const supabase = createSupabaseMock({
      price_list_versions: {
        data: {
          id: 'version-2568',
          status: 'archived',
          version_string: '2568.0.0',
        },
        error: null,
      },
    }, [])

    await expect(getPriceListVersionSummary(supabase, 'version-2568'))
      .resolves.toMatchObject({
        id: 'version-2568',
        status: 'archived',
        versionString: '2568.0.0',
      })
  })

  it('fails closed for an invalid or unpublished bound version', async () => {
    const supabase = createSupabaseMock({
      price_list_versions: {
        data: {
          id: 'draft-version',
          status: 'draft',
          version_string: '2568.1.0',
        },
        error: null,
      },
    }, [])

    await expect(getPriceListVersionSummary(supabase, 'draft-version'))
      .rejects.toThrow(BOUND_CATALOG_UNAVAILABLE_MESSAGE)
  })
})
