'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

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
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  className={emailDomainError ? 'border-red-300 bg-red-50' : ''}
                  placeholder={isEmailRestricted ? 'ชื่อผู้ใช้ (ไม่ต้องพิมพ์ @ntplc.co.th)' : 'name@ntplc.co.th'}
                />
                {emailDomainError && (
                  <p className="text-sm text-red-600">{emailDomainError}</p>
                )}
                {isEmailRestricted && !emailDomainError && (
                  <p className="text-xs text-muted-foreground">
                    พิมพ์แค่ชื่อผู้ใช้ ระบบจะเติม @ntplc.co.th ให้อัตโนมัติ
                  </p>
                )}
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    {mode === 'login' && (
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}
                      >
                        ลืมรหัสผ่าน?
                      </Button>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  mode === 'login' ? 'เข้าสู่ระบบ' :
                    mode === 'signup' ? 'สมัครสมาชิก' :
                      'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-2 bg-white text-sm text-muted-foreground">
                    {mode === 'forgot' ? 'จำรหัสผ่านได้แล้ว?' : mode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
                >
                  {mode === 'forgot' ? 'กลับไปเข้าสู่ระบบ' : mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
