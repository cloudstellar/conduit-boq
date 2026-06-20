import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const password = process.env.LOCAL_TEST_PASSWORD

if (!url || !publishableKey || !password) {
  throw new Error('Local Supabase URL, publishable key, and LOCAL_TEST_PASSWORD are required')
}

if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`Refusing to smoke-test a non-local Supabase URL: ${url}`)
}

const supabase = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'local.admin@ntplc.co.th',
  password,
})
if (authError) throw authError

const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('role, status')
  .eq('id', authData.user.id)
  .single()
if (profileError) throw profileError

if (profile.role !== 'admin' || profile.status !== 'active') {
  throw new Error(`Unexpected local admin profile: ${JSON.stringify(profile)}`)
}

await supabase.auth.signOut()
console.log('Local auth smoke test passed for active admin')
