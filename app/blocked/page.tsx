'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BlockedPage() {
  const supabase = useMemo(() => createClient(), [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ไม่สามารถเข้าใช้งานได้
        </h1>
        
        <p className="text-gray-600 mb-6">
          อีเมลของคุณไม่ได้รับอนุญาตให้เข้าใช้งานระบบนี้<br />
          ระบบอนุญาตเฉพาะอีเมลองค์กร @ntplc.co.th เท่านั้น
        </p>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 text-left">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-medium">หากคุณเป็นพนักงาน NT</p>
              <p className="mt-1">กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่ด้วยอีเมล @ntplc.co.th</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors font-medium"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  )
}

