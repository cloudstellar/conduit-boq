'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [isEmailRestricted, setIsEmailRestricted] = useState(false)
  const [emailDomainError, setEmailDomainError] = useState<string | null>(null)

  // Fetch email domain restriction setting
  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'restrict_email_domain')
        .single()
      setIsEmailRestricted(data?.value === true || data?.value === 'true')
    }
    fetchSetting()
  }, [supabase])

  // Validate email domain
  const validateEmailDomain = (emailValue: string) => {
    if (!isEmailRestricted) {
      setEmailDomainError(null)
      return true
    }

    const emailDomain = emailValue.split('@')[1]?.toLowerCase()
    if (emailValue.includes('@') && emailDomain && emailDomain !== 'ntplc.co.th') {
      setEmailDomainError('domain email ไม่ถูกต้อง')
      return false
    }
    setEmailDomainError(null)
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    validateEmailDomain(newEmail)
  }

  // Auto-append @ntplc.co.th when domain restriction is enabled
  const handleEmailBlur = () => {
    if (isEmailRestricted && email && !email.includes('@')) {
      const newEmail = email + '@ntplc.co.th'
      setEmail(newEmail)
      validateEmailDomain(newEmail)
    }
  }

  // Check if form is valid
  const isFormValid = !emailDomainError && email && (mode === 'forgot' || password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation before submit
    if (!validateEmailDomain(email)) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push(redirectTo)
        router.refresh()
      } else if (mode === 'signup') {
        // Check email domain restriction (double check)
        if (isEmailRestricted) {
          const emailDomain = email.split('@')[1]?.toLowerCase()
          if (emailDomain !== 'ntplc.co.th') {
            throw new Error('ระบบจำกัดการสมัครเฉพาะอีเมล @ntplc.co.th เท่านั้น')
          }
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setSuccess('กรุณาตรวจสอบอีเมลเพื่อยืนยันการสมัคร')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        })
        if (error) throw error
        setSuccess('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/nt_logo.svg"
            alt="NT Logo"
            width={200}
            height={40}
            className="h-12 w-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'เข้าสู่ระบบ' : mode === 'signup' ? 'สมัครสมาชิก' : 'ลืมรหัสผ่าน'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-md text-sm bg-red-50 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-md text-sm bg-green-50 text-green-700">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500
                         ${emailDomainError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                placeholder={isEmailRestricted ? 'ชื่อผู้ใช้ (ไม่ต้องพิมพ์ @ntplc.co.th)' : 'name@ntplc.co.th'}
              />
              {emailDomainError && (
                <p className="mt-1 text-sm text-red-600">{emailDomainError}</p>
              )}
              {isEmailRestricted && !emailDomainError && (
                <p className="mt-1 text-xs text-gray-500">
                  พิมพ์แค่ชื่อผู้ใช้ ระบบจะเติม @ntplc.co.th ให้อัตโนมัติ
                </p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    รหัสผ่าน
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                         shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังดำเนินการ...' :
                  mode === 'login' ? 'เข้าสู่ระบบ' :
                  mode === 'signup' ? 'สมัครสมาชิก' :
                  'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {mode === 'forgot' ? 'จำรหัสผ่านได้แล้ว?' : mode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md
                         shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {mode === 'forgot' ? 'กลับไปเข้าสู่ระบบ' : mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
