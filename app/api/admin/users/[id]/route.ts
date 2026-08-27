import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Permanent deletion is intentionally disabled. The authorization middleware
 * may return an earlier JSON 401/403, but an authorized request always stops
 * here before target lookup, service-role construction, database access, or
 * Auth mutation.
 */
export async function DELETE() {
  return NextResponse.json(
    {
      error: 'การลบผู้ใช้ถาวรถูกปิดใช้งาน กรุณาระงับหรือปิดใช้งานบัญชีแทน',
      code: 'USER_HARD_DELETE_DISABLED',
    },
    {
      status: 503,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}
