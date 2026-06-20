import { createClient } from '@supabase/supabase-js'

const url = process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:55321'
const secretKey = process.env.LOCAL_SUPABASE_SECRET_KEY
const password = process.env.LOCAL_TEST_PASSWORD

if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`Refusing to seed a non-local Supabase URL: ${url}`)
}

if (!secretKey || !password) {
  throw new Error('LOCAL_SUPABASE_SECRET_KEY and LOCAL_TEST_PASSWORD are required')
}

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function firstActive(table, columns = 'id') {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('is_active', true)
    .limit(1)
    .single()

  if (error) throw error
  return data
}

const organization = await firstActive('organizations')
const department = await firstActive('departments', 'id, org_id')
const sector = await firstActive('sectors', 'id, department_id')

const accounts = [
  { email: 'local.admin@ntplc.co.th', role: 'admin', status: 'active' },
  { email: 'local.staff@ntplc.co.th', role: 'staff', status: 'active' },
  { email: 'local.sector-manager@ntplc.co.th', role: 'sector_manager', status: 'active' },
  { email: 'local.dept-manager@ntplc.co.th', role: 'dept_manager', status: 'active' },
  { email: 'local.procurement@ntplc.co.th', role: 'procurement', status: 'active' },
  { email: 'local.pending@ntplc.co.th', role: 'staff', status: 'pending' },
  { email: 'local.suspended@ntplc.co.th', role: 'staff', status: 'suspended' },
]

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
})
if (listError) throw listError

const usersByEmail = new Map(
  listed.users.map((user) => [user.email?.toLowerCase(), user])
)

for (const account of accounts) {
  let user = usersByEmail.get(account.email)

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Local',
        last_name: account.role,
      },
    })
    if (error) throw error
    user = data.user
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: {
        first_name: 'Local',
        last_name: account.role,
      },
    })
    if (error) throw error
    user = data.user
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      employee_id: `LOCAL-${account.role.toUpperCase()}`,
      first_name: 'Local',
      last_name: account.role,
      role: account.role,
      status: account.status,
      email: account.email,
      org_id: organization.id,
      department_id: department.id,
      sector_id: sector.id,
      onboarding_completed: account.status === 'active',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (profileError) throw profileError
}

console.log(`Seeded ${accounts.length} local-only test users at ${url}`)
