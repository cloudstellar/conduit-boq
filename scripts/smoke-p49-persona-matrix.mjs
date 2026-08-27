import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

// One-shot integration harness for a disposable Local stack with migration 027
// already applied. It never starts/stops services, refuses non-loopback API and
// non-local Docker targets, restores pre-existing fixtures in finally, and does
// not exercise the Next.js HTTP layer.

const url = readLoopbackUrl(
  'LOCAL_SUPABASE_URL',
  process.env.LOCAL_SUPABASE_URL,
)

const publishableKey = process.env.LOCAL_SUPABASE_ANON_KEY
const secretKey = process.env.LOCAL_SUPABASE_SECRET_KEY
const password = process.env.LOCAL_TEST_PASSWORD
const dbContainer = process.env.P49_LOCAL_DB_CONTAINER
const localProjectId = process.env.P49_LOCAL_PROJECT_ID

if (!publishableKey || !secretKey || !password) {
  throw new Error(
    'LOCAL_SUPABASE_ANON_KEY, LOCAL_SUPABASE_SECRET_KEY, and LOCAL_TEST_PASSWORD '
      + 'are required; generic or application key names are rejected',
  )
}
if (!dbContainer) {
  throw new Error('P49_LOCAL_DB_CONTAINER is required for an explicit disposable isolate')
}
if (!localProjectId) {
  throw new Error('P49_LOCAL_PROJECT_ID is required for an explicit disposable isolate')
}

assert(dbContainer !== 'supabase_db_conduit-boq-local',
  'Refusing to mutate the known primary Local Supabase container')
assert(/^supabase_db_conduit-p49-[A-Za-z0-9_.-]+$/.test(dbContainer),
  'P49_LOCAL_DB_CONTAINER must name an explicit conduit-p49 disposable isolate')
assert(dbContainer === `supabase_db_${localProjectId}`,
  'P49_LOCAL_DB_CONTAINER and P49_LOCAL_PROJECT_ID must identify the same isolate')
assert(/^conduit-p49-[A-Za-z0-9_.-]+$/.test(localProjectId),
  'P49_LOCAL_PROJECT_ID must identify an explicit conduit-p49 disposable isolate')
assert(url.port !== '55321',
  'Refusing to mutate the known primary Local Supabase API port')
assertLocalDocker(dbContainer)

const EMAILS = Object.freeze({
  activeAdmin: 'local.admin@ntplc.co.th',
  activeStaff: 'local.staff@ntplc.co.th',
  activeSectorManager: 'local.sector-manager@ntplc.co.th',
  activeDeptManager: 'local.dept-manager@ntplc.co.th',
  activeProcurement: 'local.procurement@ntplc.co.th',
  pendingStaff: 'local.pending@ntplc.co.th',
  pendingStoredAdmin: 'local.p49.pending-admin@ntplc.co.th',
  missingProfile: 'local.p49.missing-profile@ntplc.co.th',
})

const service = makeClient(secretKey)
const createdAuthUserIds = new Set()
const requestIds = new Set()
const clients = new Map()
let fixtureSnapshot = null
let result = null
let primaryError = null

try {
  const users = await ensureAuthUsers()
  fixtureSnapshot = readFixtureSnapshot(users)
  installFixtureStates(users, fixtureSnapshot)

  const personas = await signInRuntimePersonas(users)
  const checks = []

  checks.push(await probePersona(personas.anonymous, {
    profile: 'denied', selectors: 'denied', business: 'denied',
    profileUpdate: 'denied', admin: false,
  }))
  checks.push(await probePersona(personas.missingProfile, {
    profile: 'missing', selectors: 'denied', business: 'denied',
    profileUpdate: 'denied', admin: false,
  }))
  checks.push(await probePersona(personas.pendingStaff, {
    profile: 'visible', status: 'pending', role: 'staff', selectors: 'visible',
    business: 'denied', profileUpdate: 'allowed', admin: false,
  }))
  checks.push(await probePersona(personas.pendingStoredAdmin, {
    profile: 'visible', status: 'pending', role: 'admin', selectors: 'visible',
    business: 'denied', profileUpdate: 'allowed', admin: false,
  }))
  checks.push(await probePersona(personas.activeStaff, {
    profile: 'visible', status: 'active', role: 'staff', selectors: 'visible',
    business: 'visible', profileUpdate: 'allowed', admin: false,
  }))
  checks.push(await probePersona(personas.activeSectorManager, {
    profile: 'visible', status: 'active', role: 'sector_manager',
    selectors: 'visible', business: 'visible', profileUpdate: 'allowed',
    admin: false,
  }))
  checks.push(await probePersona(personas.activeDeptManager, {
    profile: 'visible', status: 'active', role: 'dept_manager',
    selectors: 'visible', business: 'visible', profileUpdate: 'allowed',
    admin: false,
  }))
  checks.push(await probePersona(personas.activeProcurement, {
    profile: 'visible', status: 'active', role: 'procurement',
    selectors: 'visible', business: 'visible', profileUpdate: 'allowed',
    admin: false,
  }))
  checks.push(await probePersona(personas.activeAdmin, {
    profile: 'visible', status: 'active', role: 'admin', selectors: 'visible',
    selectorRows: 'management-scope', business: 'visible',
    profileUpdate: 'allowed', admin: true,
  }))

  const revocation = await probeSequentialRevocation(
    personas.activeAdmin,
    personas.activeStaff,
  )
  checks.push(revocation.inactive, revocation.suspended)

  const custody = await probePendingBoqCustody(
    personas.activeAdmin,
    personas.pendingStaff,
    fixtureSnapshot,
  )
  const corruptState = probeCorruptStatusPreflight()

  result = {
    schema: 'conduit-boq/p49-local-persona-matrix/v1',
    testedAt: new Date().toISOString(),
    target: url.origin,
    runtimeStateCount: 11,
    logicalStateCount: 12,
    checks,
    pendingOwnedBoqCustody: custody,
    corruptNullOrUnknownStatus: corruptState,
    appHttp: {
      status: 'DEFERRED',
      reason: 'This harness does not start or assume a Next.js server; route, API, print, '
        + 'and export HTTP probes remain a separate local-app harness.',
    },
    passed: true,
  }
} catch (error) {
  primaryError = error
} finally {
  for (const client of clients.values()) {
    await client.auth.signOut({ scope: 'local' }).catch(() => {})
  }

  const cleanupErrors = []
  if (fixtureSnapshot) {
    try {
      restoreFixtureState(fixtureSnapshot)
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError)
    }
  } else if (createdAuthUserIds.size > 0) {
    try {
      purgeCreatedProfiles()
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError)
    }
  }
  try {
    await removeCreatedAuthUsers()
  } catch (cleanupError) {
    cleanupErrors.push(cleanupError)
  }
  try {
    const cleanup = verifyCleanup(fixtureSnapshot)
    if (result) result.cleanup = cleanup
  } catch (cleanupError) {
    cleanupErrors.push(cleanupError)
  }
  if (cleanupErrors.length > 0) {
    primaryError = primaryError
      ? new AggregateError(
        [primaryError, ...cleanupErrors],
        'P-49 persona matrix failed and fixture cleanup also failed',
      )
      : new AggregateError(cleanupErrors, 'P-49 persona fixture cleanup failed')
  }
}

if (primaryError) throw primaryError
console.log(JSON.stringify(result, null, 2))

function makeClient(key) {
  return createClient(url.href.replace(/\/$/, ''), key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

async function ensureAuthUsers() {
  const found = new Map()
  const listedUsers = []
  let listingComplete = false
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    for (const user of data.users) {
      listedUsers.push(user)
      if (user.email) found.set(user.email.toLowerCase(), user)
    }
    if (data.users.length < 100) {
      listingComplete = true
      break
    }
  }
  assert(listingComplete, 'Local Auth user listing exceeded the 2,000-user harness limit')
  assertApiDatabaseBinding(listedUsers)

  const users = {}
  for (const [name, email] of Object.entries(EMAILS)) {
    let user = found.get(email)
    if (!user) {
      const { data, error } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: 'P49', last_name: name },
      })
      if (error) throw error
      user = data.user
      createdAuthUserIds.add(user.id)
    }
    assertUuid(user.id, `Auth user ID for ${name}`)
    users[name] = user
  }
  return users
}

function assertApiDatabaseBinding(apiUsers) {
  const apiIds = apiUsers.map((user) => {
    assertUuid(user.id, 'Local Auth API user ID')
    return user.id
  }).sort()
  const dbIds = JSON.parse(psql(`
    SELECT COALESCE(
      pg_catalog.jsonb_agg(user_row.id::text ORDER BY user_row.id),
      '[]'::jsonb
    )::text
    FROM auth.users user_row;
  `))
  assert(stableStringify(apiIds) === stableStringify(dbIds),
    'Loopback Auth API and selected Docker database do not expose the exact same users')
}

function readFixtureSnapshot(users) {
  const ids = Object.values(users).map((user) => sqlUuid(user.id)).join(',')
  const output = psql(`
    SELECT pg_catalog.jsonb_build_object(
      'api_user_count', (
        SELECT count(*) FROM auth.users WHERE id IN (${ids})
      ),
      'hierarchy', (
        SELECT pg_catalog.to_jsonb(hierarchy)
        FROM (
          SELECT o.id AS org_id, d.id AS department_id, s.id AS sector_id
          FROM public.organizations o
          JOIN public.departments d ON d.org_id = o.id
          JOIN public.sectors s ON s.department_id = d.id
          WHERE COALESCE(o.is_active, false)
            AND COALESCE(d.is_active, false)
            AND COALESCE(s.is_active, false)
          ORDER BY o.id, d.id, s.id
          LIMIT 1
        ) hierarchy
      ),
      'profiles', (
        SELECT COALESCE(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(profile) ORDER BY profile.id),
          '[]'::jsonb
        )
        FROM public.user_profiles profile
        WHERE profile.id IN (${ids})
      ),
      'custody_boq', (
        SELECT pg_catalog.to_jsonb(candidate)
        FROM (
          SELECT id, created_by, assigned_to
          FROM public.boq
          ORDER BY created_at, id
          LIMIT 1
        ) candidate
      ),
      'status_contract', (
        SELECT pg_catalog.jsonb_build_object(
          'not_null', column_row.is_nullable = 'NO',
          'constraint_count', (
            SELECT count(*)::integer
            FROM pg_catalog.pg_constraint constraint_row
            WHERE constraint_row.conrelid = 'public.user_profiles'::regclass
          ),
          'constraint_sha256', (
            SELECT pg_catalog.encode(
              pg_catalog.sha256(
                pg_catalog.convert_to(COALESCE(
                  pg_catalog.jsonb_agg(
                    pg_catalog.jsonb_build_object(
                      'name', constraint_row.conname,
                      'type', constraint_row.contype,
                      'definition', pg_catalog.pg_get_constraintdef(
                        constraint_row.oid,
                        true
                      )
                    ) ORDER BY constraint_row.conname, constraint_row.oid
                  )::text,
                  '[]'
                ), 'UTF8')
              ),
              'hex'
            )
            FROM pg_catalog.pg_constraint constraint_row
            WHERE constraint_row.conrelid = 'public.user_profiles'::regclass
          )
        )
        FROM information_schema.columns column_row
        WHERE column_row.table_schema = 'public'
          AND column_row.table_name = 'user_profiles'
          AND column_row.column_name = 'status'
      )
    )::text;
  `)

  const snapshot = JSON.parse(output)
  assert(snapshot.api_user_count === Object.keys(EMAILS).length,
    'The selected Docker database is not bound to the loopback Auth API users')
  assert(snapshot.hierarchy?.org_id && snapshot.hierarchy?.department_id
    && snapshot.hierarchy?.sector_id,
  'An active organization/department/sector hierarchy is required')
  assert(snapshot.custody_boq?.id,
    'At least one local BOQ is required for the custody probe')
  assertUuid(snapshot.custody_boq.id, 'custody BOQ ID')
  if (snapshot.custody_boq.created_by !== null) {
    assertUuid(snapshot.custody_boq.created_by, 'custody BOQ original owner')
  }
  if (snapshot.custody_boq.assigned_to !== null) {
    assertUuid(snapshot.custody_boq.assigned_to, 'custody BOQ original assignee')
  }
  snapshot.users = Object.fromEntries(
    Object.entries(users).map(([name, user]) => [name, { id: user.id, email: user.email }]),
  )
  return snapshot
}

function installFixtureStates(users, snapshot) {
  const { org_id: orgId, department_id: departmentId, sector_id: sectorId }
    = snapshot.hierarchy
  const active = [
    ['activeAdmin', 'admin'],
    ['activeStaff', 'staff'],
    ['activeSectorManager', 'sector_manager'],
    ['activeDeptManager', 'dept_manager'],
    ['activeProcurement', 'procurement'],
  ]
  const runtimeProfileIds = Object.entries(users)
    .filter(([name]) => name !== 'missingProfile')
    .map(([, user]) => sqlUuid(user.id))
    .join(',')

  const statements = active.map(([name, role]) => `
    UPDATE public.user_profiles
    SET role = ${sqlText(role)}, status = 'active',
        org_id = ${sqlUuid(orgId)}, department_id = ${sqlUuid(departmentId)},
        sector_id = ${sqlUuid(sectorId)}, onboarding_completed = true,
        requested_department_id = NULL, requested_sector_id = NULL,
        rejected_at = NULL, rejected_by = NULL
    WHERE id = ${sqlUuid(users[name].id)};
  `).join('\n')

  psql(`
    BEGIN;
    SET LOCAL session_replication_role = replica;
    INSERT INTO public.user_profiles (
      id, email, first_name, last_name, role, status, onboarding_completed
    )
    SELECT user_row.id, user_row.email, 'P49', 'fixture',
      'staff', 'pending', false
    FROM auth.users user_row
    WHERE user_row.id IN (${runtimeProfileIds})
      AND NOT EXISTS (
        SELECT 1 FROM public.user_profiles profile WHERE profile.id = user_row.id
      );
    ${statements}
    UPDATE public.user_profiles
    SET role = 'staff', status = 'pending', org_id = NULL,
        department_id = NULL, sector_id = NULL, onboarding_completed = false,
        requested_department_id = NULL, requested_sector_id = NULL,
        approved_at = NULL, approved_by = NULL,
        rejected_at = NULL, rejected_by = NULL, admin_note = NULL
    WHERE id = ${sqlUuid(users.pendingStaff.id)};
    UPDATE public.user_profiles
    SET role = 'admin', status = 'pending', org_id = NULL,
        department_id = NULL, sector_id = NULL, onboarding_completed = false,
        requested_department_id = NULL, requested_sector_id = NULL,
        approved_at = NULL, approved_by = NULL,
        rejected_at = NULL, rejected_by = NULL, admin_note = NULL
    WHERE id = ${sqlUuid(users.pendingStoredAdmin.id)};
    DELETE FROM public.user_profiles
    WHERE id = ${sqlUuid(users.missingProfile.id)};
    UPDATE public.boq
    SET created_by = ${sqlUuid(users.pendingStaff.id)}, assigned_to = NULL
    WHERE id = ${sqlUuid(snapshot.custody_boq.id)};
    SET LOCAL session_replication_role = origin;
    COMMIT;
  `)
}

async function signInRuntimePersonas(users) {
  const definitions = {
    missingProfile: ['authenticated-missing-profile', users.missingProfile],
    pendingStaff: ['pending-staff', users.pendingStaff],
    pendingStoredAdmin: ['pending-stored-admin', users.pendingStoredAdmin],
    activeStaff: ['active-staff', users.activeStaff],
    activeSectorManager: ['active-sector-manager', users.activeSectorManager],
    activeDeptManager: ['active-dept-manager', users.activeDeptManager],
    activeProcurement: ['active-procurement', users.activeProcurement],
    activeAdmin: ['active-admin', users.activeAdmin],
  }
  const personas = {
    anonymous: {
      name: 'anonymous', client: makeClient(publishableKey), userId: null,
      claims: null,
    },
  }

  for (const [key, [name, user]] of Object.entries(definitions)) {
    const client = makeClient(publishableKey)
    const { data, error } = await client.auth.signInWithPassword({
      email: user.email,
      password,
    })
    if (error) throw error
    assert(data.session?.access_token, `${name} did not receive an Auth access token`)
    assert(data.user?.id === user.id, `${name} Auth identity drifted`)
    const claims = decodeJwtPayload(data.session.access_token)
    assert(claims.sub === user.id, `${name} JWT subject drifted`)
    assert(claims.role === 'authenticated', `${name} JWT role is not authenticated`)
    assert(Number(claims.exp) > Math.floor(Date.now() / 1000), `${name} JWT is expired`)
    assert(new URL(claims.iss).origin === url.origin, `${name} JWT issuer is not local`)
    clients.set(name, client)
    personas[key] = { name, client, userId: user.id, claims }
  }
  return personas
}

async function probePersona(persona, expected) {
  const profileResult = await persona.client.rpc('get_my_profile_v2')
  let profile = null
  if (expected.profile === 'denied') {
    expectDenied(profileResult, `${persona.name} profile RPC`)
  } else if (expected.profile === 'missing') {
    expectRows(profileResult, 0, `${persona.name} profile RPC`)
  } else {
    expectRows(profileResult, 1, `${persona.name} profile RPC`)
    profile = profileResult.data[0]
    assert(profile.status === expected.status,
      `${persona.name} returned status ${profile.status}`)
    assert(profile.role === expected.role, `${persona.name} returned role ${profile.role}`)
    assert(profile.id === persona.userId, `${persona.name} returned another profile`)
  }

  const selectors = await Promise.all([
    readRows(persona.client, 'organizations', 'id,is_active', 2),
    readRows(persona.client, 'departments', 'id,is_active', 2),
    readRows(persona.client, 'sectors', 'id,is_active', 2),
  ])
  for (const [index, response] of selectors.entries()) {
    const label = `${persona.name} selector ${index + 1}`
    if (expected.selectors === 'visible') {
      expectAtLeastRows(response, 1, label)
      if (expected.selectorRows !== 'management-scope') {
        assert(response.data.every((row) => row.is_active === true),
          `${label} exposed an inactive row`)
      }
    } else {
      expectNoRowsOrDenied(response, label)
    }
  }

  const business = await Promise.all([
    readRows(persona.client, 'boq', 'id', 1),
    readRows(persona.client, 'price_list_versions', 'id', 1),
    readRows(persona.client, 'factor_reference_versions', 'id', 1),
  ])
  if (expected.business === 'visible') {
    expectSuccess(business[0], `${persona.name} BOQ transport`)
    expectAtLeastRows(business[1], 1, `${persona.name} catalog read`)
    expectAtLeastRows(business[2], 1, `${persona.name} Factor F read`)
  } else {
    for (const [index, response] of business.entries()) {
      expectNoRowsOrDenied(response, `${persona.name} business surface ${index + 1}`)
    }
  }

  const rawSettings = await readRows(persona.client, 'app_settings', 'key', 1)
  assert(rawSettings.error, `${persona.name} unexpectedly read raw app_settings`)

  const adminProfiles = await persona.client.rpc('get_admin_profiles_page', {
    p_limit: 2,
    p_cursor_created_at: null,
    p_cursor_id: null,
  })
  const capabilities = await persona.client.rpc('get_my_catalog_capabilities')
  if (expected.admin) {
    expectAtLeastRows(adminProfiles, 1, `${persona.name} admin profile projection`)
    expectRows(capabilities, 1, `${persona.name} catalog capabilities`)
  } else if (persona.name === 'anonymous') {
    expectDenied(adminProfiles, `${persona.name} admin profile projection`)
    expectDenied(capabilities, `${persona.name} catalog capabilities`)
  } else {
    expectRows(adminProfiles, 0, `${persona.name} admin profile projection`)
    expectRows(capabilities, 0, `${persona.name} catalog capabilities`)
  }

  const saveProbe = await persona.client.rpc('save_boq_with_routes', {
    p_boq_id: randomUUID(),
    p_boq_data: {},
    p_routes: [],
  })
  assert(saveProbe.error, `${persona.name} random BOQ save unexpectedly succeeded`)
  if (expected.business === 'visible') {
    assert(saveProbe.error.code === 'P0001'
      && saveProbe.error.message.startsWith('ไม่พบใบประมาณราคา BOQ ที่ระบุ'),
    `${persona.name} did not reach the exact post-active-gate missing-BOQ branch`)
  } else {
    assert(saveProbe.error.code === '42501',
      `${persona.name} BOQ save was not rejected at the authorization boundary`)
  }

  const profileUpdate = profile
    ? await updateProfile(persona.client, profile, false, null, null)
    : await persona.client.rpc('update_my_profile', emptyProfileUpdate())
  if (expected.profileUpdate === 'allowed') {
    expectRows(profileUpdate, 1, `${persona.name} own safe profile update`)
  } else {
    expectDenied(profileUpdate, `${persona.name} own safe profile update`)
  }

  if (profile) {
    const protectedUpdate = await persona.client
      .from('user_profiles')
      .update({ role: 'admin', status: 'active' })
      .eq('id', persona.userId)
      .select('id')
    expectDenied(protectedUpdate, `${persona.name} direct self-promotion`)
    const unchanged = await persona.client.rpc('get_my_profile_v2')
    expectRows(unchanged, 1, `${persona.name} post-self-promotion profile`)
    assert(unchanged.data[0].role === profile.role
      && unchanged.data[0].status === profile.status,
    `${persona.name} protected authority columns changed`)
  }

  return {
    state: persona.name,
    authJwt: persona.claims ? 'PASS' : 'NOT_APPLICABLE',
    profile: expected.profile,
    selectors: expected.selectors,
    business: expected.business,
    admin: expected.admin ? 'ALLOWED' : 'DENIED',
    result: 'PASS',
  }
}

async function probeSequentialRevocation(admin, staff) {
  const deactivateId = rememberRequestId()
  const reason = 'P49 local same-JWT deactivation probe'
  const deactivate = await admin.client.rpc('admin_deactivate_user', {
    p_target_id: staff.userId,
    p_reason: reason,
    p_request_id: deactivateId,
  })
  expectSuccess(deactivate, 'staff deactivation')

  const revokedProbe = await staff.client.rpc('save_boq_with_routes', {
    p_boq_id: randomUUID(),
    p_boq_data: {},
    p_routes: [],
  })
  assert(revokedProbe.error?.code === '42501'
    && revokedProbe.error.message === 'current active profile is required',
  'Same-JWT BOQ call was not denied at the exact current-active boundary')

  const replay = await admin.client.rpc('admin_deactivate_user', {
    p_target_id: staff.userId,
    p_reason: reason,
    p_request_id: deactivateId,
  })
  expectSuccess(replay, 'deactivation idempotent replay')
  await expectOneAuditEvent(admin.client, deactivateId, 'deactivated')

  const inactive = await probePersona(
    { ...staff, name: 'inactive-staff-same-jwt' },
    {
      profile: 'visible', status: 'inactive', role: 'staff', selectors: 'denied',
      business: 'denied', profileUpdate: 'denied', admin: false,
    },
  )

  await adminTransition(admin.client, 'admin_reactivate_user', staff.userId,
    'P49 local reactivation after inactive probe')
  await expectProfileState(staff.client, 'active', 'staff')

  const suspendId = rememberRequestId()
  const suspendReason = 'P49 local suspension probe'
  const suspend = await admin.client.rpc('admin_suspend_user', {
    p_target_id: staff.userId,
    p_reason: suspendReason,
    p_request_id: suspendId,
  })
  expectSuccess(suspend, 'staff suspension')
  const suspendReplay = await admin.client.rpc('admin_suspend_user', {
    p_target_id: staff.userId,
    p_reason: suspendReason,
    p_request_id: suspendId,
  })
  expectSuccess(suspendReplay, 'suspension idempotent replay')
  await expectOneAuditEvent(admin.client, suspendId, 'suspended')

  const suspended = await probePersona(
    { ...staff, name: 'suspended-staff-same-jwt' },
    {
      profile: 'visible', status: 'suspended', role: 'staff', selectors: 'denied',
      business: 'denied', profileUpdate: 'denied', admin: false,
    },
  )
  await adminTransition(admin.client, 'admin_reactivate_user', staff.userId,
    'P49 local reactivation after suspension probe')
  await expectProfileState(staff.client, 'active', 'staff')

  return { inactive, suspended }
}

async function probePendingBoqCustody(admin, pending, snapshot) {
  const boqId = snapshot.custody_boq.id
  const before = await readBoqBundle(admin.client, boqId)
  const hidden = await readBoqBundle(pending.client, boqId, true)
  assert(hidden.header.length === 0 && hidden.items.length === 0 && hidden.routes.length === 0,
    'Pending caller can see its retained BOQ before activation')

  const profile = await expectProfileState(pending.client, 'pending', 'staff')
  const onboardingId = rememberRequestId()
  const submitted = await updateProfile(
    pending.client,
    profile,
    true,
    snapshot.hierarchy.department_id,
    snapshot.hierarchy.sector_id,
    onboardingId,
  )
  expectRows(submitted, 1, 'pending onboarding submission')
  const replay = await updateProfile(
    pending.client,
    submitted.data[0],
    true,
    snapshot.hierarchy.department_id,
    snapshot.hierarchy.sector_id,
    onboardingId,
  )
  expectRows(replay, 1, 'pending onboarding idempotent replay')
  await expectOneAuditEvent(admin.client, onboardingId, 'onboarding_submitted')

  const approveId = rememberRequestId()
  const approveReason = 'P49 local pending-custody activation probe'
  const approved = await admin.client.rpc('admin_approve_user', {
    p_target_id: pending.userId,
    p_request_id: approveId,
    p_reason: approveReason,
  })
  expectSuccess(approved, 'pending activation')
  const approveReplay = await admin.client.rpc('admin_approve_user', {
    p_target_id: pending.userId,
    p_request_id: approveId,
    p_reason: approveReason,
  })
  expectSuccess(approveReplay, 'pending activation idempotent replay')
  await expectOneAuditEvent(admin.client, approveId, 'approved')
  await expectProfileState(pending.client, 'active', 'staff')

  const after = await readBoqBundle(pending.client, boqId)
  assert(before.sha256 === after.sha256,
    'Pending-owned BOQ bytes changed across activation')
  return {
    boqId,
    beforeSha256: before.sha256,
    afterSha256: after.sha256,
    hiddenWhilePending: true,
    visibleAfterActivationWithSameJwt: true,
    result: 'PASS',
  }
}

function probeCorruptStatusPreflight() {
  const contract = fixtureSnapshot.status_contract
  assert(contract?.not_null === true,
    'user_profiles.status is not protected by NOT NULL')
  assert(contract?.constraint_count === 11
    && contract?.constraint_sha256
      === '061827adeb6324696a07a41c67e07829266d904cc047cd887990de7a3fb51420',
  'user_profiles exact recognized-state constraint manifest drifted')
  return {
    state: 'null-or-unknown-status',
    runtimeIdentity: 'NOT_VALID_POST_MIGRATION',
    proof: 'DATABASE_NOT_NULL_AND_EXACT_CONSTRAINT_MANIFEST',
    result: 'PASS_PREFLIGHT_ONLY',
  }
}

async function readBoqBundle(client, boqId, allowHidden = false) {
  const [header, items, routes] = await Promise.all([
    client.from('boq').select('*').eq('id', boqId),
    client.from('boq_items').select('*').eq('boq_id', boqId).order('id'),
    client.from('boq_routes').select('*').eq('boq_id', boqId).order('id'),
  ])
  for (const [label, response] of Object.entries({ header, items, routes })) {
    if (response.error) throw new Error(`${label} custody read failed: ${response.error.code}`)
  }
  if (!allowHidden) {
    assert(header.data.length === 1, 'Custody BOQ header is not visible exactly once')
  }
  const bundle = { header: header.data, items: items.data, routes: routes.data }
  return {
    ...bundle,
    sha256: createHash('sha256').update(stableStringify(bundle)).digest('hex'),
  }
}

async function expectOneAuditEvent(client, requestId, action) {
  const response = await client
    .from('user_authorization_events')
    .select('request_id,action')
    .eq('request_id', requestId)
    .eq('action', action)
  expectRows(response, 1, `audit event ${action}/${requestId}`)
}

async function adminTransition(client, rpc, targetId, reason) {
  const requestId = rememberRequestId()
  const response = await client.rpc(rpc, {
    p_target_id: targetId,
    p_reason: reason,
    p_request_id: requestId,
  })
  expectSuccess(response, rpc)
  return requestId
}

async function expectProfileState(client, status, role) {
  const response = await client.rpc('get_my_profile_v2')
  expectRows(response, 1, `profile ${status}/${role}`)
  assert(response.data[0].status === status && response.data[0].role === role,
    `Expected profile ${status}/${role}`)
  return response.data[0]
}

function updateProfile(
  client,
  profile,
  submitOnboarding,
  departmentId,
  sectorId,
  requestId = rememberRequestId(),
) {
  return client.rpc('update_my_profile', {
    p_first_name: profile.first_name ?? '',
    p_last_name: profile.last_name ?? '',
    p_title: profile.title,
    p_position: profile.position,
    p_employee_id: profile.employee_id,
    p_phone: profile.phone,
    p_requested_department_id: departmentId,
    p_requested_sector_id: sectorId,
    p_submit_onboarding: submitOnboarding,
    p_request_id: requestId,
  })
}

function emptyProfileUpdate() {
  return {
    p_first_name: '', p_last_name: '', p_title: null, p_position: null,
    p_employee_id: null, p_phone: null, p_requested_department_id: null,
    p_requested_sector_id: null, p_submit_onboarding: false,
    p_request_id: rememberRequestId(),
  }
}

function readRows(client, table, columns, limit) {
  return client.from(table).select(columns).limit(limit)
}

function expectSuccess(response, label) {
  if (response.error) {
    throw new Error(`${label} failed: ${response.error.code} ${response.error.message}`)
  }
}

function expectRows(response, count, label) {
  expectSuccess(response, label)
  assert(Array.isArray(response.data), `${label} did not return an array`)
  assert(response.data.length === count,
    `${label} returned ${response.data.length} rows; expected ${count}`)
}

function expectAtLeastRows(response, count, label) {
  expectSuccess(response, label)
  assert(Array.isArray(response.data), `${label} did not return an array`)
  assert(response.data.length >= count,
    `${label} returned ${response.data.length} rows; expected at least ${count}`)
}

function expectDenied(response, label) {
  assert(response.error, `${label} unexpectedly succeeded`)
}

function expectNoRowsOrDenied(response, label) {
  if (response.error) return
  assert(Array.isArray(response.data) && response.data.length === 0,
    `${label} exposed ${response.data?.length ?? 'non-array'} rows`)
}

function restoreFixtureState(snapshot) {
  const restoreProfiles = snapshot.profiles.filter(
    (profile) => !createdAuthUserIds.has(profile.id),
  )
  const restoreStatements = restoreProfiles.map((profile) => `
    INSERT INTO public.user_profiles
    SELECT restored.*
    FROM pg_catalog.jsonb_populate_record(
      NULL::public.user_profiles,
      ${sqlText(JSON.stringify(profile))}::jsonb
    ) AS restored;
  `).join('\n')
  const allFixtureProfiles = Object.values(snapshot.users)
    .map((user) => user.id)
    .map(sqlUuid)
  const deleteEvents = requestIds.size
    ? `DELETE FROM public.user_authorization_events WHERE request_id IN (`
      + `${[...requestIds].map(sqlUuid).join(',')});`
    : ''

  psql(`
    BEGIN;
    SET LOCAL session_replication_role = replica;
    ${deleteEvents}
    DELETE FROM public.user_profiles WHERE id IN (${allFixtureProfiles.join(',')});
    ${restoreStatements}
    UPDATE public.boq
    SET created_by = ${sqlValue(snapshot.custody_boq.created_by, 'uuid')},
        assigned_to = ${sqlValue(snapshot.custody_boq.assigned_to, 'uuid')}
    WHERE id = ${sqlUuid(snapshot.custody_boq.id)};
    SET LOCAL session_replication_role = origin;
    COMMIT;
  `)
}

async function removeCreatedAuthUsers() {
  for (const userId of createdAuthUserIds) {
    const { error } = await service.auth.admin.deleteUser(userId)
    if (error) throw error
  }
}

function purgeCreatedProfiles() {
  const ids = [...createdAuthUserIds].map(sqlUuid)
  if (ids.length === 0) return
  psql(`
    BEGIN;
    SET LOCAL session_replication_role = replica;
    DELETE FROM public.user_authorization_events
    WHERE actor_id IN (${ids.join(',')}) OR target_id IN (${ids.join(',')});
    DELETE FROM public.user_profiles WHERE id IN (${ids.join(',')});
    SET LOCAL session_replication_role = origin;
    COMMIT;
  `)
}

function verifyCleanup(snapshot) {
  const createdIds = [...createdAuthUserIds].map(sqlUuid)
  const eventIds = [...requestIds].map(sqlUuid)
  const expectedProfiles = snapshot
    ? snapshot.profiles.filter((profile) => !createdAuthUserIds.has(profile.id))
    : []
  const preexistingIds = expectedProfiles.map((profile) => sqlUuid(profile.id))
  const createdPredicate = createdIds.length > 0
    ? `id IN (${createdIds.join(',')})`
    : 'false'
  const eventPredicate = eventIds.length > 0
    ? `request_id IN (${eventIds.join(',')})`
    : 'false'
  const preexistingPredicate = preexistingIds.length > 0
    ? `id IN (${preexistingIds.join(',')})`
    : 'false'
  const cleanup = JSON.parse(psql(`
    SELECT pg_catalog.jsonb_build_object(
      'temporaryAuthUsers', (
        SELECT count(*) FROM auth.users WHERE ${createdPredicate}
      ),
      'temporaryProfiles', (
        SELECT count(*) FROM public.user_profiles WHERE ${createdPredicate}
      ),
      'temporaryAuthorizationEvents', (
        SELECT count(*) FROM public.user_authorization_events
        WHERE ${eventPredicate}
      ),
      'preexistingProfiles', (
        SELECT COALESCE(
          pg_catalog.jsonb_agg(pg_catalog.to_jsonb(profile) ORDER BY profile.id),
          '[]'::jsonb
        )
        FROM public.user_profiles profile
        WHERE ${preexistingPredicate}
      ),
      'custodyBoq', (
        SELECT pg_catalog.to_jsonb(candidate)
        FROM (
          SELECT id, created_by, assigned_to
          FROM public.boq
          WHERE id = ${snapshot ? sqlUuid(snapshot.custody_boq.id) : 'NULL::uuid'}
        ) candidate
      )
    )::text;
  `))
  assert(cleanup.temporaryAuthUsers === 0
    && cleanup.temporaryProfiles === 0
    && cleanup.temporaryAuthorizationEvents === 0,
  `Persona fixture cleanup is incomplete: ${stableStringify(cleanup)}`)
  assert(stableStringify(cleanup.preexistingProfiles)
    === stableStringify(expectedProfiles),
  'Pre-existing persona profiles were not restored byte-for-byte')
  if (snapshot) {
    assert(stableStringify(cleanup.custodyBoq)
      === stableStringify(snapshot.custody_boq),
    'Custody BOQ owner/assignee binding was not restored byte-for-byte')
  }
  return {
    verification: 'HARNESS_POST_CLEANUP_ZERO_COUNT_AND_SNAPSHOT_RESTORE',
    temporaryAuthUsers: cleanup.temporaryAuthUsers,
    temporaryProfiles: cleanup.temporaryProfiles,
    temporaryAuthorizationEvents: cleanup.temporaryAuthorizationEvents,
    preexistingProfilesRestored: true,
    custodyBoqRestored: snapshot !== null,
  }
}

function psql(sql) {
  return execFileSync('docker', [
    'exec', dbContainer, 'psql', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', 'postgres', '-Atc', sql,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim()
}

function assertLocalDocker(container) {
  const host = JSON.parse(execFileSync('docker', [
    'context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}',
  ], { encoding: 'utf8' }).trim())
  assert(typeof host === 'string' && host.startsWith('unix://'),
    `Refusing non-local Docker context endpoint: ${host}`)
  const inspected = JSON.parse(execFileSync('docker', ['inspect', container], {
    encoding: 'utf8',
  }))[0]
  assert(inspected?.State?.Running === true, `${container} is not running`)
  assert(inspected?.Name === `/${container}`, 'Docker inspected an unexpected container')
  assert(inspected?.Config?.Labels?.['com.supabase.cli.project'] === localProjectId,
    'Docker target is not labeled as the requested Supabase CLI isolate')
  assert(inspected?.Config?.Labels?.['com.docker.compose.project'] === localProjectId,
    'Docker target is not labeled as the requested Compose isolate')
}

function readLoopbackUrl(name, value) {
  if (!value) throw new Error(`${name} is required`)
  const parsed = new URL(value)
  const host = parsed.hostname.toLowerCase()
  assert(parsed.protocol === 'http:', `${name} must use local HTTP`)
  assert(!parsed.username && !parsed.password, `${name} must not contain credentials`)
  assert(host === 'localhost' || host === '127.0.0.1' || host === '[::1]',
    `Refusing non-loopback ${name}: ${parsed.origin}`)
  assert(parsed.port, `${name} must include an explicit local port`)
  assert(parsed.pathname === '/' && !parsed.search && !parsed.hash,
    `${name} must be a bare local origin`)
  return parsed
}

function decodeJwtPayload(token) {
  const parts = token.split('.')
  assert(parts.length === 3, 'Auth access token is not a JWT')
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
}

function rememberRequestId() {
  const requestId = randomUUID()
  requestIds.add(requestId)
  return requestId
}

function sqlUuid(value) {
  assertUuid(value, 'SQL UUID')
  return `${sqlText(value)}::uuid`
}

function sqlValue(value, cast = null) {
  if (value === null || value === undefined) return cast ? `NULL::${cast}` : 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  const literal = sqlText(String(value))
  return cast ? `${literal}::${cast}` : literal
}

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function assertUuid(value, label) {
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    `${label} is not a UUID`)
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${stableStringify(value[key])}`
    )).join(',')}}`
  }
  return JSON.stringify(value)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
