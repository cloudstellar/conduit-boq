import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const MONEY_FIELDS = [
  'total_material_cost', 'total_labor_cost', 'total_cost', 'factor_f',
  'factor_f_raw', 'factor_f_lower_cost', 'factor_f_upper_cost',
  'factor_f_lower_value', 'factor_f_upper_value', 'total_with_factor_f',
  'total_with_vat',
]
const COPY_FIELDS = [
  ...MONEY_FIELDS, 'price_list_version_id', 'factor_reference_version_id',
  'route', 'construction_area', 'department',
]
const RESET_FACTOR_FIELDS = [
  'factor_f', 'factor_f_raw', 'factor_f_lower_cost', 'factor_f_upper_cost',
  'factor_f_lower_value', 'factor_f_upper_value',
]
const KNOWN_PRIOR_FAILURE_CASE = 'Stale Copy token rejected without residue'
const HTTP_TIMEOUT_MS = 15_000

function boundedFetch(input, init = {}) {
  const timeout = AbortSignal.timeout(HTTP_TIMEOUT_MS)
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  return fetch(input, { ...init, signal })
}

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function parseSqlJson(output) {
  if (typeof output !== 'string') return output
  for (const line of output.trim().split('\n').reverse()) {
    try { return JSON.parse(line) } catch { /* Skip psql command tags. */ }
  }
  throw new Error('Local assertion SQL did not return JSON')
}

function omit(row, keys) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key)))
}

function normalizedGraph(graph, { omitRouteFactor = false } = {}) {
  return graph.routes.map(route => ({
    route: omit(route, ['id', 'boq_id', 'created_at', 'updated_at',
      ...(omitRouteFactor ? ['cost_with_factor_f'] : [])]),
    items: graph.items.filter(item => item.route_id === route.id).map(item =>
      omit(item, ['id', 'boq_id', 'route_id', 'created_at', 'updated_at'])),
  }))
}

function roundMoney(value) {
  return Number(Math.round(Number(`${value}e2`)) + 'e-2')
}

/**
 * Exercise final-state RPCs over the local Auth/Data API. The caller owns the
 * independently guarded Docker target and final-state baseline restoration.
 * runSql is privileged local inspection/setup only; no SQL role impersonation
 * or service-role business requests are used here. Fixtures remain available
 * for browser/output checks and are replaced only by an approved local rebuild.
 */
export async function runParitySmoke({
  supabaseUrl, anonKey, serviceKey, runSql, fixtures, artifactDirectory,
  priorFailures = [], staleCopyConflict = { code: '40001' },
}) {
  const target = new URL(supabaseUrl)
  assert.equal(target.protocol, 'http:', 'Parity smoke requires local HTTP')
  assert(['127.0.0.1', 'localhost'].includes(target.hostname), 'Non-local target refused')
  assert.equal(target.port, '55321', 'Unexpected local API port')
  assert.equal(target.pathname, '/', 'Unexpected API URL path')
  assert(!target.username && !target.password && !target.search && !target.hash,
    'Unexpected API URL credentials or parameters')
  assert.equal(typeof runSql, 'function')
  assert(anonKey && serviceKey && artifactDirectory && fixtures?.ids && fixtures?.users)
  assert(Array.isArray(priorFailures), 'Prior failures must be an array')
  assert(
    (staleCopyConflict.code === '40001' && staleCopyConflict.details === undefined)
      || (staleCopyConflict.code === 'PT409' && staleCopyConflict.details === 'BOQ_SOURCE_STALE'),
    'Stale Copy acceptance requires an exact predecessor or successor contract',
  )
  assert(staleCopyConflict.code !== 'PT409' || priorFailures.length === 0,
    'Successor acceptance must execute fresh requests, not carry old failure evidence')
  for (const failure of priorFailures) {
    assert.equal(failure.name, KNOWN_PRIOR_FAILURE_CASE, 'Only the diagnosed stale-Copy case may reuse failure evidence')
    assert.equal(failure.status, 'FAIL', 'Prior evidence must retain its actual FAIL status')
    assert(failure.reason && failure.evidence, 'Prior failure requires a reason and evidence artifact')
  }

  // Deliberately do not create a service-key client. Business actors below use
  // only the public key and genuine local Auth sessions.
  const { ids, users } = fixtures
  const profiles = {
    ...users,
    deptManager: users.deptManager ?? users.departmentManager,
    otherDeptManager: users.otherDeptManager ?? users.otherDepartmentManager,
  }
  const clients = new Map()
  const sessionsCreatedHere = new Set()
  const receipt = {
    schema: 'conduit-boq/local-db-parity-smoke/v1',
    startedAt: new Date().toISOString(),
    target: target.origin,
    httpTimeoutMs: HTTP_TIMEOUT_MS,
    status: 'RUNNING',
    staleCopyConflict,
    cases: [],
    boqs: {},
    expectedVector: {
      catalogMaterial: 30, catalogLabor: 20, catalogUnit: 50,
      factor: 1.1, vatPercent: 7,
      quantities: [4.25, 2.5], material: 202.5, labor: 135, base: 337.5,
      beforeVAT: 371.25, VAT: 25.99, final: 397.24,
    },
    limits: [
      'Synthetic local Auth/Data API/RPC evidence, not Production workload evidence.',
      'Browser, Print/PDF and downloaded Excel checks are a separate acceptance result.',
      'Current Save accepts client header/route totals; this is not wider D0 trusted-write/accounting PASS.',
      'Forged Catalog unit/prices/category/amounts are ignored and rederived under the current contract.',
      'Known fractional-money rounding residuals are not corrected by this harness.',
      'No Production requests, migration replay, Catalog publish or pointer restore is performed.',
    ],
  }
  let currentCase = 'initialization'
  const persist = async () => {
    await mkdir(artifactDirectory, { recursive: true })
    await writeFile(join(artifactDirectory, 'api-smoke-results.json'),
      `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 })
  }
  const query = async sql => parseSqlJson(await runSql(sql))
  const test = async (name, action) => {
    currentCase = name
    const priorFailure = priorFailures.find(failure => failure.name === name)
    if (priorFailure) {
      receipt.cases.push({
        name,
        status: 'FAIL',
        reason: priorFailure.reason,
        evidence: priorFailure.evidence,
        execution: 'Prior actual failure retained; known failing HTTP request not repeated',
      })
      await persist()
      return
    }
    const details = await action()
    receipt.cases.push({ name, status: 'PASS', ...(details ? { details } : {}) })
    await persist()
  }
  const snapshot = () => query(`
    SELECT jsonb_build_object(
      'boq', (SELECT jsonb_build_object('count', count(*), 'hash', md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text, '[]'))) FROM public.boq r),
      'routes', (SELECT jsonb_build_object('count', count(*), 'hash', md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text, '[]'))) FROM public.boq_routes r),
      'items', (SELECT jsonb_build_object('count', count(*), 'hash', md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text, '[]'))) FROM public.boq_items r),
      'copyRequests', (SELECT jsonb_build_object('count', count(*), 'hash', md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.actor_id, r.request_id)::text, '[]'))) FROM private.boq_copy_requests r),
      'authorizationEvents', (SELECT jsonb_build_object('count', count(*), 'hash', md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id)::text, '[]'))) FROM public.user_authorization_events r)
    )::text;
  `)
  const graph = id => query(`
    SELECT jsonb_build_object(
      'header', (SELECT to_jsonb(b) FROM public.boq b WHERE b.id = ${literal(id)}::uuid),
      'routes', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.route_order, r.id) FROM public.boq_routes r WHERE r.boq_id = ${literal(id)}::uuid), '[]'::jsonb),
      'items', coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY r.route_order, i.item_order, i.id) FROM public.boq_items i LEFT JOIN public.boq_routes r ON r.id = i.route_id WHERE i.boq_id = ${literal(id)}::uuid), '[]'::jsonb)
    )::text;
  `)
  const denied = async (client, rpc, args, expectedCodes, expectedConflict) => {
    const before = await snapshot()
    const started = performance.now()
    const { error, status } = await client.rpc(rpc, args)
    const durationMs = Math.round(performance.now() - started)
    assert(error, `${rpc} unexpectedly succeeded`)
    assert(expectedCodes.includes(error.code), `${rpc} returned unexpected code ${error.code}`)
    if (expectedConflict?.code === 'PT409') {
      assert.equal(status, 409, 'Stale Copy must deliver an actual HTTP conflict')
      assert.equal(error.details, expectedConflict.details, 'Missing exact stale-source discriminator')
      assert(durationMs < 5000, 'Stale conflict was not promptly delivered')
    }
    assert.deepEqual(await snapshot(), before, `${rpc} denial left persistent residue`)
    return {
      code: error.code, httpStatus: status, durationMs,
      ...(expectedConflict?.code === 'PT409' ? { details: error.details } : {}),
      noBusinessOrLedgerOrAuditResidue: true,
    }
  }
  const clientFor = name => {
    assert(clients.has(name), `No authenticated fixture client for ${name}`)
    return clients.get(name)
  }
  const save = async (client, payload) => {
    const { data, error } = await client.rpc('save_boq_with_routes', payload)
    assert(!error, `Save failed (${error?.code ?? 'unknown'})`)
    assert.equal(data?.success, true)
    assert.equal(data.boq_id, payload.p_boq_id)
    return data
  }
  const copy = async (client, source, requestId, mode = 'preserve', factorVersionId = null) => {
    const args = {
      p_source_boq_id: source.header.id,
      p_request_id: requestId,
      p_expected_source_updated_at: source.header.updated_at,
      p_mode: mode,
      p_factor_reference_version_id: factorVersionId,
    }
    const { data, error } = await client.rpc('duplicate_boq_atomic', args)
    assert(!error, `Copy failed (${error?.code ?? 'unknown'})`)
    assert.equal(data?.success, true)
    assert.equal(data.source_boq_id, source.header.id)
    assert.equal(data.mode, mode)
    assert.equal(data.factor_reference_version_id, factorVersionId ?? source.header.factor_reference_version_id)
    assert.equal(typeof data.duplicateRequest, 'boolean')
    return { data, args }
  }
  const assertPreservedCopy = async (source, result, actorId) => {
    const destination = await graph(result.boq_id)
    assert(destination.header, 'Copy destination is missing')
    assert.notEqual(destination.header.id, source.header.id)
    assert.equal(destination.header.status, 'draft')
    assert.equal(destination.header.created_by, actorId)
    assert.equal(destination.header.assigned_to, null)
    assert.equal(destination.header.boq_number, null)
    for (const field of COPY_FIELDS) assert.deepEqual(destination.header[field], source.header[field], `Copy changed ${field}`)
    assert.deepEqual(normalizedGraph(destination), normalizedGraph(source), 'Copy changed business graph')
    const sourceIds = new Set([...source.routes, ...source.items].map(row => row.id))
    assert([...destination.routes, ...destination.items].every(row => !sourceIds.has(row.id)), 'Copy reused a source child ID')
    assert.deepEqual(await graph(source.header.id), source, 'Copy changed its source')
    return destination
  }
  let catalogItem
  const makePayload = (boqId, projectName, quantities = [4.25, 2.5]) => {
    const quantity = quantities.reduce((sum, value) => sum + value, 0)
    const material = roundMoney(quantity * 30)
    const labor = roundMoney(quantity * 20)
    const total = roundMoney(quantity * 50)
    const beforeVAT = roundMoney(total * 1.1)
    const withVAT = roundMoney(beforeVAT + roundMoney(beforeVAT * 0.07))
    return {
      p_boq_id: boqId,
      p_boq_data: {
        estimator_name: 'Local parity owner', document_date: '2026-10-23',
        project_name: projectName, department: 'Synthetic parity department',
        route: 'Parity Route A, comma, Parity Route B', construction_area: 'Local only',
        total_material_cost: material, total_labor_cost: labor, total_cost: total,
        factor_f: 1.1, factor_f_raw: 1.1, factor_f_lower_cost: 5_000_000,
        factor_f_upper_cost: 5_000_000, factor_f_lower_value: 1.1,
        factor_f_upper_value: 1.1, total_with_factor_f: beforeVAT, total_with_vat: withVAT,
      },
      p_routes: quantities.map((value, index) => ({
        route_name: index === 0 ? 'Parity Route A, comma' : 'Parity Route B',
        route_description: `Synthetic route ${index + 1}`, construction_area: 'Local only',
        total_material_cost: roundMoney(value * 30), total_labor_cost: roundMoney(value * 20),
        total_cost: roundMoney(value * 50),
        items: [{
          item_order: 1, price_list_id: ids.priceA, item_name: catalogItem.item_name,
          quantity: value, unit: 'IGNORED-FORGED-UNIT', material_cost_per_unit: 999,
          labor_cost_per_unit: 999, unit_cost: 1998, total_material_cost: 999,
          total_labor_cost: 999, total_cost: 1998, category: 'IGNORED-FORGED-CATEGORY',
          remarks: 'Local parity synthetic request',
        }],
      })),
    }
  }
  const createBOQ = async projectName => {
    currentCase = `Create synthetic BOQ: ${projectName}`
    const { data: profile, error: profileError } = await clientFor('owner')
      .from('user_profiles').select('org_id,department_id,sector_id').eq('id', users.owner.id).single()
    assert(!profileError, `Own profile read failed (${profileError?.code})`)
    const { data, error } = await clientFor('owner').from('boq').insert({
      estimator_name: 'Local parity owner', document_date: '2026-10-23',
      project_name: projectName, department: 'Synthetic parity department', status: 'draft',
      price_list_version_id: ids.catalogVersion, factor_reference_version_id: ids.factorVersion,
      created_by: users.owner.id, ...profile,
    }).select('id').single()
    assert(!error, `BOQ create failed (${error?.code})`)
    return data.id
  }

  try {
    await test('Real local Auth sessions verified for all synthetic personas', async () => {
      const names = ['admin', 'owner', 'sectorManager', 'otherSectorManager', 'deptManager', 'otherDeptManager', 'pending', 'suspended', 'inactive', 'procurement']
      for (const name of ['missingProfile', 'pendingAdmin', 'nullScopeManager', 'nullScopeDepartmentManager']) {
        if (users[name]) names.push(name)
      }
      const credentialSources = {}
      for (const name of names) {
        const persona = profiles[name]
        assert(persona?.id && persona.email && persona.password, `Missing fixture persona ${name}`)
        const client = createClient(target.origin, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
          global: { fetch: boundedFetch },
        })
        if (persona.client && persona.token) {
          // Reuse the real password-authenticated fixture session without
          // consuming another password-login rate-limit slot. Copy it into a
          // timeout-bounded client; no credentials or tokens enter the receipt.
          const { data: seeded, error: seedError } = await persona.client.auth.getSession()
          assert(!seedError, `Fixture session read failed for ${name} (${seedError?.code})`)
          assert.equal(seeded.session?.user.id, persona.id)
          assert.equal(seeded.session?.access_token, persona.token)
          assert(seeded.session.refresh_token, `Missing fixture refresh token for ${name}`)
          const { error } = await client.auth.setSession({
            access_token: seeded.session.access_token,
            refresh_token: seeded.session.refresh_token,
          })
          assert(!error, `Fixture session reuse failed for ${name} (${error?.code})`)
          credentialSources[name] = 'reused real fixture Auth password session'
        } else {
          const { data, error } = await client.auth.signInWithPassword({ email: persona.email, password: persona.password })
          assert(!error, `Local login failed for ${name} (${error?.code})`)
          assert.equal(data.user?.id, persona.id)
          assert(data.session?.access_token, `No real Auth JWT for ${name}`)
          sessionsCreatedHere.add(name)
          credentialSources[name] = 'new real Auth password login'
        }
        const { data: verified, error: verifyError } = await client.auth.getUser()
        assert(!verifyError, `Auth server verification failed for ${name} (${verifyError?.code})`)
        assert.equal(verified.user?.id, persona.id)
        const { data: current, error: sessionError } = await client.auth.getSession()
        assert(!sessionError, `Current session read failed for ${name} (${sessionError?.code})`)
        assert.equal(current.session?.user.id, persona.id)
        assert(current.session?.access_token, `No verified Auth session for ${name}`)
        clients.set(name, client)
      }
      return {
        personas: [...clients.keys()],
        businessCredentials: 'public key + real local Auth JWT verified by Auth getUser',
        credentialSources,
        reusedSessions: Object.values(credentialSources).filter(source => source.startsWith('reused')).length,
        newPasswordLogins: Object.values(credentialSources).filter(source => source.startsWith('new')).length,
      }
    })
    await test('Synthetic reference vector read through owner Data API', async () => {
      const { data, error } = await clientFor('owner').from('price_list')
        .select('id,item_name,unit,material_cost,labor_cost,unit_cost,category,version_id').eq('id', ids.priceA).single()
      assert(!error, `Catalog fixture read failed (${error?.code})`)
      catalogItem = data
      assert.equal(data.version_id, ids.catalogVersion)
      assert.equal(Number(data.material_cost), 30)
      assert.equal(Number(data.labor_cost), 20)
      assert.equal(Number(data.unit_cost), 50)
    })
    const sourceId = await createBOQ('LOCAL PARITY Save and outputs')
    receipt.boqs.primary = sourceId
    const payload = makePayload(sourceId, 'LOCAL PARITY Save and outputs')
    await test('Owner Save, reload and Catalog-authoritative numeric vector', async () => {
      await save(clientFor('owner'), payload)
      const saved = await graph(sourceId)
      assert.equal(saved.routes.length, 2)
      assert.equal(saved.items.length, 2)
      for (const [field, expected] of Object.entries({ total_material_cost: 202.5, total_labor_cost: 135, total_cost: 337.5, total_with_factor_f: 371.25, total_with_vat: 397.24 })) {
        assert.equal(Number(saved.header[field]), expected, `Saved vector differs at ${field}`)
      }
      for (const [index, item] of saved.items.entries()) {
        assert.equal(Number(item.quantity), [4.25, 2.5][index])
        assert.equal(item.unit, catalogItem.unit)
        assert.equal(item.category, catalogItem.category)
        assert.equal(Number(item.material_cost_per_unit), 30)
        assert.equal(Number(item.labor_cost_per_unit), 20)
        assert.equal(Number(item.unit_cost), 50)
        assert.equal(Number(item.total_cost), [212.5, 125][index])
      }
      const { data, error } = await clientFor('owner').from('boq').select('id,total_cost,total_with_vat').eq('id', sourceId).single()
      assert(!error, `Owner reload failed (${error?.code})`)
      assert.equal(Number(data.total_cost), 337.5)
      assert.equal(Number(data.total_with_vat), 397.24)
    })
    for (const name of ['admin', 'sectorManager', 'deptManager']) {
      await test(`${name} Save positive current-scope case`, () => save(clientFor(name), payload))
    }
    for (const name of ['otherSectorManager', 'otherDeptManager', 'procurement', 'pending', 'suspended', 'inactive']) {
      await test(`${name} Save denied without residue`, () =>
        denied(clientFor(name), 'save_boq_with_routes', payload, ['42501']))
    }
    if (clients.has('missingProfile')) {
      await test('Missing-profile Save denied without residue', () =>
        denied(clientFor('missingProfile'), 'save_boq_with_routes', payload, ['42501']))
    }
    for (const name of ['pendingAdmin', 'nullScopeManager', 'nullScopeDepartmentManager']) {
      if (clients.has(name)) {
        await test(`${name} Save denied without residue`, () =>
          denied(clientFor(name), 'save_boq_with_routes', payload, ['42501']))
      }
    }
    await test('Invalid second-route quantity rolls back complete Save', async () => {
      const invalid = structuredClone(payload)
      invalid.p_boq_data.project_name = 'MUST NOT PERSIST invalid quantity'
      invalid.p_routes[1].items[0].quantity = '5x2'
      return denied(clientFor('owner'), 'save_boq_with_routes', invalid, ['22P02'])
    })
    await test('Cross-version second item rolls back complete Save', async () => {
      const invalid = structuredClone(payload)
      invalid.p_boq_data.project_name = 'MUST NOT PERSIST wrong Catalog version'
      invalid.p_routes[1].items[0].price_list_id = ids.otherVersionPrice
      return denied(clientFor('owner'), 'save_boq_with_routes', invalid, ['P0001'])
    })
    await test('Wrong Catalog item name rolls back complete Save', async () => {
      const invalid = structuredClone(payload)
      invalid.p_routes[1].items[0].item_name = 'MUST NOT PERSIST wrong Catalog name'
      return denied(clientFor('owner'), 'save_boq_with_routes', invalid, ['P0001'])
    })
    const nullScopeId = await createBOQ('LOCAL PARITY NULL scopes')
    await save(clientFor('owner'), makePayload(nullScopeId, 'LOCAL PARITY NULL scopes'))
    // Deliberate synthetic local setup; the business request remains a real JWT RPC.
    await runSql(`UPDATE public.boq SET sector_id = NULL, department_id = NULL, assigned_to = NULL WHERE id = ${literal(nullScopeId)}::uuid;`)
    receipt.boqs.nullScope = nullScopeId
    for (const name of ['sectorManager', 'deptManager']) {
      await test(`${name} NULL-scope Save denied without residue`, () =>
        denied(clientFor(name), 'save_boq_with_routes', makePayload(nullScopeId, 'MUST NOT PERSIST NULL scope'), ['42501']))
    }
    const assignedId = await createBOQ('LOCAL PARITY staff assignment')
    await save(clientFor('owner'), makePayload(assignedId, 'LOCAL PARITY staff assignment'))
    await runSql(`UPDATE public.boq SET created_by = ${literal(users.admin.id)}::uuid, assigned_to = NULL WHERE id = ${literal(assignedId)}::uuid;`)
    receipt.boqs.assignment = assignedId
    await test('Unrelated staff and NULL assignee Save denied without residue', () =>
      denied(clientFor('owner'), 'save_boq_with_routes', makePayload(assignedId, 'MUST NOT PERSIST unrelated staff'), ['42501']))
    await runSql(`UPDATE public.boq SET assigned_to = ${literal(users.owner.id)}::uuid WHERE id = ${literal(assignedId)}::uuid;`)
    await test('Staff assigned to another owner Save succeeds', () =>
      save(clientFor('owner'), makePayload(assignedId, 'LOCAL PARITY assigned staff saved')))
    const anonymous = createClient(target.origin, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: boundedFetch },
    })
    await test('Anonymous Save denied without residue', () =>
      denied(anonymous, 'save_boq_with_routes', payload, ['42501']))
    const source = await graph(sourceId)
    const requestId = randomUUID()
    let firstCopy
    await test('Normal Copy preserves source graph and resets document identity', async () => {
      const { data } = await copy(clientFor('owner'), source, requestId)
      assert.equal(data.duplicateRequest, false)
      firstCopy = data
      receipt.boqs.preservedCopy = data.boq_id
      await assertPreservedCopy(source, data, users.owner.id)
    })
    await test('Exact Copy retry returns durable destination without new residue', async () => {
      const before = await snapshot()
      const { data } = await copy(clientFor('owner'), source, requestId)
      assert.equal(data.duplicateRequest, true)
      assert.equal(data.boq_id, firstCopy.boq_id)
      assert.deepEqual(await snapshot(), before)
    })
    await test('Same-key concurrent Copy creates exactly one destination', async () => {
      const key = randomUUID()
      const results = await Promise.all([copy(clientFor('owner'), source, key), copy(clientFor('owner'), source, key)])
      assert.equal(results[0].data.boq_id, results[1].data.boq_id)
      assert.equal(results.filter(result => result.data.duplicateRequest === false).length, 1)
      assert.equal(results.filter(result => result.data.duplicateRequest === true).length, 1)
      await assertPreservedCopy(source, results[0].data, users.owner.id)
    })
    await test('Different concurrent Copy keys create independent destinations', async () => {
      const results = await Promise.all([copy(clientFor('owner'), source, randomUUID()), copy(clientFor('owner'), source, randomUUID())])
      assert.notEqual(results[0].data.boq_id, results[1].data.boq_id)
      for (const result of results) {
        assert.equal(result.data.duplicateRequest, false)
        await assertPreservedCopy(source, result.data, users.owner.id)
      }
    })
    const copyArgs = {
      p_source_boq_id: sourceId, p_request_id: randomUUID(),
      p_expected_source_updated_at: source.header.updated_at,
      p_mode: 'preserve', p_factor_reference_version_id: null,
    }
    await test('Stale Copy token rejected without residue', () => denied(clientFor('owner'), 'duplicate_boq_atomic', {
      ...copyArgs, p_expected_source_updated_at: '2000-01-01T00:00:00Z',
    }, [staleCopyConflict.code], staleCopyConflict))
    await test('Copy key parameter reuse rejected without residue', () => denied(clientFor('owner'), 'duplicate_boq_atomic', {
      ...copyArgs, p_request_id: requestId, p_expected_source_updated_at: '2000-01-01T00:00:00Z',
    }, ['22023']))
    for (const name of ['procurement', 'pending', 'suspended', 'inactive']) {
      await test(`${name} Copy denied without residue`, () => denied(clientFor(name), 'duplicate_boq_atomic', {
        ...copyArgs, p_request_id: randomUUID(),
      }, ['42501']))
    }
    if (clients.has('missingProfile')) {
      await test('Missing-profile Copy denied without residue', () => denied(clientFor('missingProfile'), 'duplicate_boq_atomic', {
        ...copyArgs, p_request_id: randomUUID(),
      }, ['42501']))
    }
    if (clients.has('pendingAdmin')) {
      await test('pendingAdmin Copy denied without residue', () => denied(clientFor('pendingAdmin'), 'duplicate_boq_atomic', {
        ...copyArgs, p_request_id: randomUUID(),
      }, ['42501']))
    }
    for (const name of ['nullScopeManager', 'nullScopeDepartmentManager']) {
      if (clients.has(name)) {
        await test(`${name} Copy denied without residue`, () => denied(clientFor(name), 'duplicate_boq_atomic', {
          ...copyArgs, p_request_id: randomUUID(),
        }, ['P0002']))
      }
    }
    for (const name of ['otherSectorManager', 'otherDeptManager']) {
      await test(`${name} cross-scope Copy denied without residue`, () => denied(clientFor(name), 'duplicate_boq_atomic', {
        ...copyArgs, p_request_id: randomUUID(),
      }, ['P0002']))
    }
    await test('Anonymous Copy denied without residue', () => denied(anonymous, 'duplicate_boq_atomic', copyArgs, ['42501']))
    if (staleCopyConflict.code === 'PT409') {
      await test('Committed Copy retry survives a later supported source Save', async () => {
        // Advance only this run's new copy, preserving the primary/old fixtures.
        const intentSource = await graph(firstCopy.boq_id)
        const key = randomUUID()
        const { data: committed } = await copy(clientFor('owner'), intentSource, key)
        await assertPreservedCopy(intentSource, committed, users.owner.id)
        receipt.boqs.durableRetrySource = intentSource.header.id
        receipt.boqs.durableRetryDestination = committed.boq_id
        await save(clientFor('owner'), makePayload(intentSource.header.id, 'LOCAL STALE COPY durable retry source advanced'))
        const advanced = await graph(intentSource.header.id)
        assert.notEqual(advanced.header.updated_at, intentSource.header.updated_at)
        const before = await snapshot()
        const { data: retried } = await copy(clientFor('owner'), intentSource, key)
        assert.equal(retried.duplicateRequest, true)
        assert.equal(retried.boq_id, committed.boq_id)
        assert.deepEqual(await snapshot(), before)
        return { durableResultReused: true, oldSourceTokenRetained: true, noRetryResidue: true }
      })
    }
    // The current immutable-version guard correctly forbids turning a new
    // bound BOQ into a legacy one. The synthetic legacy graph must instead be
    // present in the reviewed pre-guard fixture load, as an admin-only record.
    const legacyId = ids.legacySource
    assert(legacyId, 'Reviewed pre-guard legacy fixture ID is required')
    const legacy = await graph(legacyId)
    receipt.boqs.legacySource = legacyId
    await test('Pre-guard synthetic legacy fixture retains current immutable bindings', async () => {
      assert(legacy.header, 'Reviewed legacy fixture is missing')
      assert.equal(legacy.header.created_by, null)
      assert.equal(legacy.header.assigned_to, null)
      assert.equal(legacy.header.factor_reference_version_id, null)
      assert.equal(legacy.header.price_list_version_id, ids.catalogVersion)
      assert.equal(Number(legacy.header.total_cost), 337.5)
      assert.equal(legacy.routes.length, 2)
      assert.equal(legacy.items.length, 2)
    })
    if (staleCopyConflict.code === 'PT409') {
      await test('Selected-Factor stale Copy token rejected without residue', () => denied(clientFor('admin'), 'duplicate_boq_atomic', {
        ...copyArgs, p_source_boq_id: legacyId, p_request_id: randomUUID(),
        p_expected_source_updated_at: '2000-01-01T00:00:00Z',
        p_mode: 'select_factor', p_factor_reference_version_id: ids.factorVersion,
      }, [staleCopyConflict.code], staleCopyConflict))
    }
    await test('Legacy preserve Copy rejected without residue', () => denied(clientFor('admin'), 'duplicate_boq_atomic', {
      ...copyArgs, p_source_boq_id: legacyId, p_request_id: randomUUID(), p_expected_source_updated_at: legacy.header.updated_at,
    }, ['22023']))
    let selectedCopy
    await test('Eligible selected-Factor Copy clears calculation snapshots', async () => {
      const { data } = await copy(clientFor('admin'), legacy, randomUUID(), 'select_factor', ids.factorVersion)
      selectedCopy = await graph(data.boq_id)
      receipt.boqs.selectedFactorBlocked = data.boq_id
      assert.equal(selectedCopy.header.factor_reference_version_id, ids.factorVersion)
      assert.equal(selectedCopy.header.status, 'draft')
      assert.equal(selectedCopy.header.created_by, users.admin.id)
      assert.equal(Number(selectedCopy.header.total_cost), 337.5)
      for (const field of RESET_FACTOR_FIELDS) assert.equal(selectedCopy.header[field], null)
      assert.equal(Number(selectedCopy.header.total_with_factor_f), 0)
      assert.equal(Number(selectedCopy.header.total_with_vat), 0)
      assert(selectedCopy.routes.every(route => Number(route.cost_with_factor_f) === 0))
      assert.deepEqual(normalizedGraph(selectedCopy, { omitRouteFactor: true }), normalizedGraph(legacy, { omitRouteFactor: true }))
      assert.deepEqual(await graph(legacyId), legacy)
    })
    await test('Selected-Factor mode rejects already bound source', () => denied(clientFor('owner'), 'duplicate_boq_atomic', {
      ...copyArgs, p_request_id: randomUUID(), p_mode: 'select_factor', p_factor_reference_version_id: ids.factorVersion,
    }, ['22023']))
    // Keep the blocked copy above intact for browser direct-Print gate testing.
    await test('Selected-Factor copy becomes complete after real trusted Save', async () => {
      const { data } = await copy(clientFor('admin'), legacy, randomUUID(), 'select_factor', ids.factorVersion)
      await save(clientFor('admin'), makePayload(data.boq_id, 'LOCAL PARITY selected Factor saved'))
      const saved = await graph(data.boq_id)
      assert.equal(Number(saved.header.factor_f), 1.1)
      assert.equal(Number(saved.header.total_with_factor_f), 371.25)
      assert.equal(Number(saved.header.total_with_vat), 397.24)
      assert.deepEqual(await graph(legacyId), legacy)
      receipt.boqs.selectedFactorSaved = data.boq_id
    })
    await test('All Copy operations leave primary source unchanged', async () => {
      assert.deepEqual(await graph(sourceId), source)
    })
    receipt.status = receipt.cases.some(result => result.status === 'FAIL') ? 'PARTIAL' : 'PASS'
    receipt.caseCounts = {
      pass: receipt.cases.filter(result => result.status === 'PASS').length,
      fail: receipt.cases.filter(result => result.status === 'FAIL').length,
    }
    receipt.completedAt = new Date().toISOString()
    receipt.finalBusinessCounts = await snapshot()
    await persist()
    return receipt
  } catch (error) {
    receipt.status = 'FAIL'
    receipt.failedCase = currentCase
    receipt.failure = { name: error?.name ?? 'Error', code: error?.code ?? null }
    receipt.completedAt = new Date().toISOString()
    await persist()
    throw error
  } finally {
    for (const [name, client] of clients) {
      // A reused session belongs to fixture setup and may be needed by the
      // caller's later checks; only close sessions this module created.
      if (sessionsCreatedHere.has(name)) {
        await client.auth.signOut({ scope: 'local' }).catch(() => {})
      }
    }
  }
}
