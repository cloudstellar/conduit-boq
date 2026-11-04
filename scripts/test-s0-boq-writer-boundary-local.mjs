import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { lstat, mkdir, open, readFile, realpath, rename, unlink } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

// This standalone, local-only runner NEVER applies DDL. No fixture/parity/UM
// runner is imported. Help/default/import are pure; execution requires flags.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const TARGET = Object.freeze({
  api: 'http://127.0.0.1:55321', socket: 'unix:///Users/cloud/.docker/run/docker.sock',
  db: '4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966',
  volume: 'supabase_db_conduit-boq-local', project: 'conduit-boq-local',
})
export const CAPS = Object.freeze({ identities: 11, boqs: 48, routes: 96, items: 192 })
export const SCENARIO = 'successor-remaining'
export const RECORDED_SUCCESSOR_SHA = '54f5d9f53acf89e3be58fe2cbc1995be79b0c9516f9a3f939cf5b36a149b750b'
const RECORDED_PREDECESSOR_SHA = '2bc254af3fc66f1b2dfb46e32ccb4ceee75744a178a2add57906ee6984cacd4e'
const CLOSED_EVIDENCE = Object.freeze({
  path: '/private/tmp/s0-20261103-approved-guard2/manifest.json',
  sha256: '164f5773e70a51400859f49008c8baf2fa8bd8e7eec9089489aeda83c742c04e',
  successorPassRecords: 144,
})
const CLOSED_RUNS = new Set(['s0-20261103-writer-guard1', 's0-20261103-writer-guard1b', 's0-20261103-approved-guard2'])
export const LABELS = Object.freeze(['admin', 'deptManager', 'sectorManager', 'staffOwner', 'staffAssignee',
  'procurementOwner', 'procurementAssignee', 'mutable', 'pending', 'inactive', 'suspended'])
const ROLE = { admin: 'admin', deptManager: 'dept_manager', sectorManager: 'sector_manager',
  procurementOwner: 'procurement', procurementAssignee: 'procurement' }
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
const NIL_UUID = '00000000-0000-0000-0000-000000000000'
const METADATA_SQL_SHA = '4e1676552c255904abbb19e496c33086d778e80662a1e6895c9a0e08d58e704b'
const TERMINAL = new Set(['CONFIRMED', 'DENIED'])
const AUTH_OPTIONS = { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
const ACTIONS = { approve: 'admin_approve_user', role: 'admin_set_user_role', deactivate: 'admin_deactivate_user', suspend: 'admin_suspend_user' }
const EVENT = { approve: 'approved', role: 'role_changed', deactivate: 'deactivated', suspend: 'suspended' }
const S0_NAMES = new Set(['boq', 'boq_routes', 'boq_items'].flatMap(table => ['insert', 'update', 'delete'].map(command => `public.${table}.s0_${table}_writer_${command}`)))
export const EXPECTED_PREDICATE = "(( SELECT private.p49_current_active_role() AS p49_current_active_role) = ANY (ARRAY['admin'::text, 'dept_manager'::text, 'sector_manager'::text, 'staff'::text]))"

export const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value
export const sha = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(stable(value))).digest('hex')
const ql = value => "'" + String(value).replaceAll("'", "''") + "'"
const qi = value => '"' + String(value).replaceAll('"', '""') + '"'
const idsSql = values => values.length ? values.map(value => { assert(UUID.test(value), 'Invalid reserved UUID'); return ql(value) + '::uuid' }).join(',') : 'NULL::uuid'
const safeError = error => ({ code: String(error?.code ?? 'HARNESS_HOLD'), status: Number(error?.status) || null,
  message: 'Operation stopped; inspect private evidence. Credentials and response bodies are suppressed.' })

export function options(args) {
  const values = new Map()
  for (let i = 0; i < args.length; i++) {
    const key = args[i]
    assert(/^--[a-z-]+$/.test(key) && !values.has(key), 'Invalid or repeated flag')
    values.set(key, args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true)
  }
  for (const key of values.keys()) assert(['--help', '--execute', '--proof-dir', '--output', '--run', '--scenario'].includes(key), 'Unsupported flag')
  if (!values.has('--execute') || values.has('--help')) return { mode: 'dry-run' }
  assert.equal(values.get('--scenario'), SCENARIO, 'Only the explicit successor-remaining scenario may execute; reproduction and DDL are forbidden')
  const run = values.get('--run')
  assert(typeof run === 'string' && /^s0-\d{8}-[a-z0-9-]{1,32}$/.test(run) && !CLOSED_RUNS.has(run), 'A fresh bounded S0 run id is required; closed runs cannot reopen')
  for (const key of ['--proof-dir', '--output']) assert(typeof values.get(key) === 'string', 'Execution requires explicit private proof/output paths')
  return { mode: 'execute', scenario: SCENARIO, run, proofDir: resolve(values.get('--proof-dir')), output: resolve(values.get('--output')) }
}

export function remainingReservationPlan() {
  // Cumulative reservations, including denied/deleted IDs, Save generations,
  // one Copy graph and the existing app envelope of four routes/eight items.
  const plan = { initialGraphs: 15, identities: LABELS.length, sessions: LABELS.length + 2,
    boqs: 15 + 4 + 1 + 1 + 1, routes: 15 + 4 + 4 + 1 + 4, items: 15 + 4 + 2 + 4 + 1 + 8 }
  assert(plan.identities === CAPS.identities && plan.sessions === 13, 'Unexpected identity/session envelope')
  for (const type of ['boqs', 'routes', 'items']) assert(plan[type] <= CAPS[type], 'Planned reservations exceed the approved cap')
  return plan
}

export function assertLocalRequest(input) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
  assert(url.origin === TARGET.api && !url.username && !url.password, 'Nonlocal API request is forbidden')
  return url
}

export function assertPhase(manifest, phase) {
  assert(manifest?.format === 'conduit-boq/s0-local/v1' && manifest.target === TARGET.db, 'Manifest target/format mismatch')
  assert(!manifest.finalized, 'Finalized runs cannot be reopened')
  assert.equal(manifest.scenario, SCENARIO, 'Only the remaining-successor scenario may execute')
  assert(phase !== 'reproduce', 'Predecessor reproduction is forbidden after032')
  assert(!manifest.hold || phase === 'finalize', 'Core HOLD prohibits further tests or retries')
  const expected = { prepare: 'PREFLIGHT', verify: 'PREPARED', finalize: ['PREFLIGHT', 'PREPARED', 'VERIFIED', 'HELD'] }[phase]
  assert(expected, 'Unsupported execution phase')
  assert(Array.isArray(expected) ? expected.includes(manifest.phase) : manifest.phase === expected, 'Wrong execution phase')
  assert(!Object.values(manifest.intents).some(intent => !TERMINAL.has(intent.status)), 'Unresolved intent blocks another phase; reconcile exact intent read-only')
  assert(!(manifest.sessions ?? []).some(session => ['UNKNOWN', 'SIGNOUT_SUBMITTED'].includes(session.status)), 'Unresolved session outcome blocks another phase')
}

export function reserveCapacity(manifest, type, count, key) {
  assert(['boqs', 'routes', 'items'].includes(type) && Number.isSafeInteger(count) && count >= 0, 'Invalid cumulative reservation')
  manifest.reservations ??= {}
  if (manifest.reservations[key]) {
    assert.deepEqual(manifest.reservations[key], { type, count }, 'Capacity reservation cannot change')
    return
  }
  assert(manifest.capacity[type] + count <= CAPS[type], 'Cumulative fixture cap exceeded')
  if (manifest.reservationPlan) assert(manifest.capacity[type] + count <= manifest.reservationPlan[type], 'Remaining-only reservation plan exceeded')
  manifest.capacity[type] += count
  manifest.reservations[key] = { type, count }
}

export function registerIntent(manifest, key, intent) {
  assert(!manifest.finalized && key && !manifest.intents[key], 'Intent cannot be overwritten or replayed automatically')
  assert(!manifest.hold || (intent.kind === 'transition' && intent.event === 'deactivated' && intent.targets?.length === 1
    && key === 'finalize:' + intent.targets[0] && intent.payload?.p_target_id === intent.targets[0]
    && !Object.hasOwn(intent.payload, 'p_new_role')), 'Core HOLD permits exact fixture deactivation only')
  assert(UUID.test(intent.actorId) || intent.actorId === 'anon', 'Invalid actor')
  const allowed = new Set([manifest.ownerId, ...manifest.actors.map(actor => actor.id)])
  assert(intent.actorId === 'anon' || allowed.has(intent.actorId), 'Actor is outside this run')
  assert(Array.isArray(intent.targets) && intent.targets.every(id => manifest.ownedIds.includes(id)), 'Target is not an exact run-owned ID')
  if (intent.kind !== 'auth-login' && intent.actorId === manifest.ownerId) {
    assert(intent.kind === 'transition' && intent.targets.every(id => manifest.actors.some(actor => actor.id === id)), 'Existing Admin may target new profiles only')
  }
  const result = { ...intent, status: 'RESERVED', payloadHash: sha(intent.payload), reservedAt: new Date().toISOString() }
  manifest.intents[key] = result
  return result
}

export async function atomicJson(path, value) {
  const temporary = path + '.' + process.pid + '.' + randomUUID() + '.tmp'
  const handle = await open(temporary, 'wx', 0o600)
  try { await handle.writeFile(JSON.stringify(value, null, 2) + '\n'); await handle.sync() } finally { await handle.close() }
  await rename(temporary, path)
  const directory = await open(dirname(path), 'r')
  try { await directory.sync() } finally { await directory.close() }
}

async function privateDirectory(path, fresh = false) {
  assert(/^\/private\/tmp\/s0-[a-zA-Z0-9._/-]+$/.test(path) && !path.includes('..'), 'Private S0 storage must stay under /private/tmp/s0-*')
  if (fresh) await mkdir(path, { mode: 0o700 })
  const actual = await realpath(path)
  assert(actual === path && !(await lstat(path)).isSymbolicLink(), 'Private storage cannot be a symlink')
  return actual
}

async function checkedFile(path) {
  assert(!(await lstat(path)).isSymbolicLink(), 'Input may not be a symlink')
  const actual = await realpath(path)
  assert(actual.startsWith(ROOT + sep) || actual.startsWith('/private/tmp/s0-'), 'Input is outside approved local custody')
  assert(!actual.includes('archive'), 'Protected archive is forbidden')
  return readFile(actual, 'utf8')
}

function docker(args, input) {
  const env = { ...process.env }
  for (const key of ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']) delete env[key]
  return execFileSync('/usr/local/bin/docker', ['--host', TARGET.socket, ...args], {
    cwd: ROOT, env, input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 25_000, stdio: ['pipe', 'pipe', 'pipe'],
  }).trim()
}

function sqlRaw(input) {
  assert(input.startsWith('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;') && input.trimEnd().endsWith('ROLLBACK;'), 'Every SQL read must be explicitly read-only and rolled back')
  return docker(['exec', '-i', TARGET.db, 'env', '-u', 'PGSERVICE', '-u', 'PGSERVICEFILE', 'PGPASSFILE=/dev/null', 'PGPASSWORD=',
    'psql', '-X', '-w', '-qAt', '-h', '/var/run/postgresql', '-p', '5432', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-P', 'pager=off'], input)
}

function sqlRead(select) {
  assert(/^\s*(SELECT|WITH)\b/.test(select), 'Only bounded SELECT reads are supported')
  const raw = sqlRaw("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;\nSET LOCAL search_path=pg_catalog;\nSET LOCAL statement_timeout='8s';\nSET LOCAL lock_timeout='2s';\n" + select + '\nROLLBACK;')
  return raw.split('\n').filter(Boolean).map(line => JSON.parse(line))
}

export function normalizeMetadata(value) {
  const normalized = structuredClone(value)
  delete normalized.session
  for (const relation of normalized.relations) relation.policies = relation.policies.filter(policy => !S0_NAMES.has(`${relation.schema}.${relation.name}.${policy.name}`))
  return normalized
}

export function classifyMetadata(actual, predecessor, expectedPredicate = EXPECTED_PREDICATE) {
  assert.equal(sha(normalizeMetadata(actual)), sha(normalizeMetadata(predecessor)), 'Non-S0 relevant metadata drift')
  const policies = actual.relations.flatMap(relation => relation.policies.filter(policy => policy.name.startsWith('s0_')).map(policy => ({ relation, policy })))
  if (!policies.length) return 'predecessor'
  assert.equal(policies.length, 9, 'Partial or unknown S0 successor')
  for (const table of ['boq', 'boq_routes', 'boq_items']) for (const [suffix, command] of [['insert', 'a'], ['update', 'w'], ['delete', 'd']]) {
    const matched = policies.filter(({ relation, policy }) => relation.schema === 'public' && relation.name === table && policy.name === `s0_${table}_writer_${suffix}`)
    assert.equal(matched.length, 1, 'S0 policy identity mismatch')
    const policy = matched[0].policy
    assert.equal(policy.command, command); assert.equal(policy.permissive, false); assert.deepEqual(policy.roles, ['authenticated'])
    for (const expression of [policy.using, policy.check].filter(value => value !== null)) {
      assert(typeof expectedPredicate === 'string' && expectedPredicate.length > 0, 'Reviewed exact deparser predicate is required')
      assert.equal(expression.replace(/\s/g, ''), expectedPredicate.replace(/\s/g, ''), 'Unexpected writer predicate')
    }
    assert((suffix === 'insert' && policy.using === null && policy.check !== null)
      || (suffix === 'update' && policy.using !== null && policy.check === policy.using)
      || (suffix === 'delete' && policy.using !== null && policy.check === null), 'Wrong policy command clauses')
  }
  return 'successor'
}

export function requireSuccessorMetadata(actual, predecessor, expectedHash = RECORDED_SUCCESSOR_SHA) {
  assert.equal(classifyMetadata(actual, predecessor), 'successor', 'Remaining validation requires the already-applied032 successor')
  assert.equal(sha(actual), expectedHash, 'Metadata differs from the exact recorded032 successor')
  return 'successor'
}

async function metadata(ctx, required) {
  const actual = JSON.parse(sqlRaw(ctx.metadataSql))
  assert(actual.session.readOnly === 'on' && actual.session.database === 'postgres' && actual.session.user === 'postgres', 'SQL target/read-only mismatch')
  const state = requireSuccessorMetadata(actual, ctx.predecessor)
  if (required) assert.equal(state, required, 'Phase requires exact recorded metadata state')
  if (state === 'successor') {
    if (ctx.manifest.successorSha) assert.equal(sha(actual), ctx.manifest.successorSha, 'Recorded successor changed')
    else ctx.manifest.successorSha = sha(actual)
  }
  ctx.manifest.metadataState = state
  return state
}

async function verifyProtected(ctx) {
  for (const [path, expected] of Object.entries(ctx.protected)) {
    const actual = await checkedFile(resolve(ROOT, path))
    assert.equal(sha(actual), typeof expected === 'string' ? expected : expected.sha256, 'Protected source/custody changed: ' + path)
  }
  assert.equal(sha(await checkedFile(resolve(ROOT, 'supabase/.env.local'))), ctx.manifest.credentialHash, 'Existing credential file changed')
  assert.equal(sha(await checkedFile(resolve(ROOT, '.env.development.local'))), ctx.manifest.webHash, 'Existing local web environment changed')
  assert.equal(sha(await checkedFile(CLOSED_EVIDENCE.path)), CLOSED_EVIDENCE.sha256, 'Finalized S0 evidence changed')
  assert.equal(sha(await checkedFile(resolve(ROOT, 'migrations/032_s0_boq_writer_boundary.sql'))),
    '592872b3488a51e80866f2f67129ddbdef644408ffd93266bb89bb8033fbd41f', 'Applied032 source must remain unchanged')
}

async function save(ctx) { ctx.manifest.updatedAt = new Date().toISOString(); await atomicJson(ctx.manifestPath, ctx.manifest) }

export function serializableResult(value) {
  return value?.token && value?.client ? { id: value.id, sessionId: value.sessionId, tokenHash: sha(value.token) } : value
}

async function dispatch(ctx, key, intent, operation) {
  const entry = registerIntent(ctx.manifest, key, intent)
  await save(ctx)
  entry.status = 'SUBMITTED'; entry.startedAt = new Date().toISOString(); await save(ctx)
  assert(!ctx.dispatchKey, 'Concurrent write dispatch is forbidden')
  ctx.dispatchKey = key
  try {
    const value = await operation()
    assert(!(value && typeof value.status === 'number' && value.status >= 500), 'A server failure after dispatch has an UNKNOWN write outcome')
    entry.status = 'CONFIRMED'; entry.finishedAt = new Date().toISOString(); entry.resultHash = sha(serializableResult(value))
    await save(ctx); return value
  } catch (error) {
    entry.status = error.knownDenial ? 'DENIED' : 'UNKNOWN'; entry.error = safeError(error)
    entry.finishedAt = new Date().toISOString(); await save(ctx); throw error
  } finally {
    ctx.dispatchKey = null
  }
}

function requireOwned(ctx, id) { assert(ctx.manifest.ownedIds.includes(id), 'Write requires an exact reserved/recorded run-owned ID') }

function reserveId(ctx, type, label) {
  const id = randomUUID()
  reserveCapacity(ctx.manifest, type, 1, label)
  ctx.manifest.ownedIds.push(id)
  return id
}

async function api(ctx, actor, path, method = 'GET', payload) {
  const url = assertLocalRequest(TARGET.api + '/rest/v1/' + path)
  const start = performance.now()
  ctx.manifest.requests++
  const response = await fetch(url, { method, redirect: 'error', signal: AbortSignal.timeout(20_000),
    headers: { apikey: ctx.anon, Authorization: 'Bearer ' + (actor?.token ?? ctx.anon),
      'Content-Type': 'application/json', Prefer: 'return=representation,count=exact' },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) })
  const text = await response.text()
  const data = await parseResponseWithEvidence(text, response.status,
    { label: ctx.dispatchKey ?? 'read', method, elapsedMs: performance.now() - start }, async receipt => {
      if (ctx.dispatchKey) ctx.manifest.intents[ctx.dispatchKey].response = receipt
      else ctx.manifest.readFailure ??= receipt
      await save(ctx)
    })
  const result = { status: response.status, data, elapsedMs: performance.now() - start, range: response.headers.get('content-range') }
  ctx.manifest.timings.push({ phase: ctx.manifest.phase, method, status: response.status, ms: result.elapsedMs })
  // A bounded receipt is durable before dispatch can classify5xx UNKNOWN or a
  // later assertion can fail. Never retain response bodies or headers here.
  if (ctx.dispatchKey) {
    ctx.manifest.intents[ctx.dispatchKey].response = responseEvidence(result, { label: ctx.dispatchKey, method })
    await save(ctx)
  }
  return result
}

export function responseEvidence(result, { label, method }) {
  assert(typeof label === 'string' && label.length <= 200 && /^(GET|POST|PATCH|DELETE)$/.test(method), 'Invalid response receipt context')
  const code = typeof result.data?.code === 'string' && /^(?:[A-Z0-9]{5}|PGRST\d{3})$/.test(result.data.code) ? result.data.code : null
  return { case: label, method, status: Number.isInteger(result.status) ? result.status : null, code,
    messageClass: result.data?.details === 'BOQ_SOURCE_STALE' && code === 'PT409' ? 'BOQ_SOURCE_STALE' : null,
    responseHash: sha(result.data ?? null), affected: Array.isArray(result.data) ? result.data.length : null,
    elapsedMs: Number.isFinite(result.elapsedMs) ? result.elapsedMs : null, recordedAt: new Date().toISOString() }
}

export async function parseResponseWithEvidence(rawText, status, context, persist) {
  let data
  try { data = rawText ? JSON.parse(rawText) : null } catch {
    // Keep only a hash of the undecodable wire body. A non-JSON response does
    // not establish denial or a known write outcome, even when its HTTP status
    // is4xx/5xx. The dispatch journal will remain UNKNOWN after this throw.
    const receipt = { ...responseEvidence({ status, data: null, elapsedMs: context.elapsedMs }, context),
      bodyHash: sha(rawText), parseError: true }
    await persist(receipt)
    const error = new Error('Unparseable API response after dispatch; bounded private evidence retained')
    error.code = 'RESPONSE_PARSE_ERROR'
    throw error
  }
  return data
}

async function rpc(ctx, actor, name, payload) { return api(ctx, actor, 'rpc/' + name, 'POST', payload) }
function requireSuccess(result) {
  if (result.status >= 400) {
    const error = new Error('API operation denied')
    error.code = result.data?.code; error.status = result.status
    error.knownDenial = ['42501', '23514', '23505', '22023', 'P0002', 'PT409'].includes(error.code)
    throw error
  }
  return result.data
}

function graphRead(id) {
  assert(UUID.test(id), 'Invalid graph ID')
  return sqlRead(`SELECT jsonb_build_object('header',(SELECT to_jsonb(b) FROM public.boq b WHERE b.id=${ql(id)}::uuid),
    'routes',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM public.boq_routes r WHERE r.boq_id=${ql(id)}::uuid),'[]'::jsonb),
    'items',COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.id) FROM public.boq_items i WHERE i.boq_id=${ql(id)}::uuid),'[]'::jsonb));`)[0]
}

async function writeCase(ctx, actor, graph, table, method, payload, id, allow, label) {
  requireOwned(ctx, graph.id); requireOwned(ctx, id)
  const before = graphRead(graph.id)
  const path = table + (method === 'POST' ? '' : '?id=eq.' + id)
  const result = await dispatch(ctx, label, { kind: 'table-write', actorId: actor?.id ?? 'anon', targets: [graph.id, id],
    payload: { table, method, id, body: payload } }, () => api(ctx, actor, path, method, payload))
  const after = graphRead(graph.id)
  const rows = await assertWriteWithEvidence(result, before, after, allow, actor, method, { label, persist: async receipt => {
    ctx.manifest.intents[label].caseEvidence = receipt
    await save(ctx)
  } })
  if (allow) assert.equal(rows[0].id, id)
  else ctx.manifest.intents[label].status = 'DENIED'
  ctx.manifest.results.push({ label, status: 'PASS', allow, http: result.status, affected: rows.length, ms: result.elapsedMs,
    denialBoundary: allow ? null : actor ? 'ROW_AUTHORIZATION' : 'ANONYMOUS_TABLE_PRIVILEGE',
    before: sha(before), after: sha(after) })
  await save(ctx)
  return result
}

export async function assertWriteWithEvidence(result, before, after, allow, actor, method, { label, persist }) {
  const receipt = { ...responseEvidence(result, { label, method }), beforeHash: sha(before), afterHash: sha(after) }
  await persist(receipt)
  return assertWriteOutcome(result, before, after, allow, actor, method)
}

export function assertWriteOutcome(result, before, after, allow, actor, method = 'PATCH') {
  assert(['POST', 'PATCH', 'DELETE'].includes(method), 'Write method is required for denial classification')
  const rows = Array.isArray(result.data) ? result.data : []
  if (allow) {
    assert(result.status >= 200 && result.status < 300 && rows.length === 1, 'Expected one changed row')
    assert.notEqual(sha(after), sha(before), 'Persisted graph did not change')
  } else {
    if (actor) assert(actor.expiresAt > Date.now() + 30_000, 'Expired JWT cannot establish authorization denial')
    assert((method !== 'POST' && result.status >= 200 && result.status < 300 && Array.isArray(result.data) && rows.length === 0)
      || ((result.status === 403 || (!actor && result.status === 401)) && result.data?.code === '42501'), 'Unexpected failure is not an RLS denial')
    assert.equal(sha(after), sha(before), 'Denied write changed persisted graph')
  }
  return rows
}

export function negativeStatusHeaderPayload(payload) {
  assert(UUID.test(payload?.id) && UUID.test(payload?.price_list_version_id), 'A reserved header and valid catalog reference are required')
  return { ...payload, factor_reference_version_id: null, factor_f: null, total_cost: 0 }
}

function newGraph(ctx, label, owner, scope = 'a1', assignee = null) {
  const graph = { label, id: reserveId(ctx, 'boqs', 'graph:' + label), routeId: reserveId(ctx, 'routes', 'graph-route:' + label),
    itemId: reserveId(ctx, 'items', 'graph-item:' + label), owner, scope, assignee }
  ctx.manifest.graphs[label] = graph
  return graph
}

function header(ctx, graph, actorId) {
  const scope = ctx.ready.hierarchies[graph.scope]
  return { id: graph.id, estimator_name: 'S0 synthetic', document_date: '2026-11-03', project_name: ctx.manifest.run + ' ' + graph.label,
    status: 'draft', price_list_version_id: ctx.ready.catalogVersionId, factor_reference_version_id: ctx.ready.factorVersionId,
    created_by: actorId, assigned_to: graph.assignee ? ctx.actors[graph.assignee].id : null,
    org_id: scope.orgId, department_id: scope.departmentId, sector_id: scope.sectorId, total_material_cost: 0, total_labor_cost: 0,
    total_cost: 0, total_with_factor_f: 0, total_with_vat: 0 }
}
export const routePayload = (graph, id = graph.routeId, order = 1) => ({ id, boq_id: graph.id, route_order: order, route_name: 'S0 synthetic route', total_material_cost: 0, total_labor_cost: 0, total_cost: 0 })
const route = routePayload
const item = (graph, id = graph.itemId, routeId = graph.routeId) => ({ id, boq_id: graph.id, route_id: routeId, item_order: 1, price_list_id: null,
  item_name: 'S0 synthetic zero item', quantity: 0, unit: 'm', material_cost_per_unit: 0, labor_cost_per_unit: 0, unit_cost: 0,
  total_material_cost: 0, total_labor_cost: 0, total_cost: 0, category: null })

async function createGraph(ctx, graph) {
  const actor = ctx.actors[graph.owner]
  await writeCase(ctx, actor, graph, 'boq', 'POST', header(ctx, graph, actor.id), graph.id, true, 'prepare:header:' + graph.label)
  await writeCase(ctx, actor, graph, 'boq_routes', 'POST', route(graph), graph.routeId, true, 'prepare:route:' + graph.label)
  await writeCase(ctx, actor, graph, 'boq_items', 'POST', item(graph), graph.itemId, true, 'prepare:item:' + graph.label)
}

async function profile(ctx, actor) {
  const rows = requireSuccess(await rpc(ctx, actor, 'get_my_profile_v2', {}))
  assert(Array.isArray(rows) && rows.length === 1 && rows[0].id === actor.id, 'Current profile is unavailable')
  return rows[0]
}

async function transition(ctx, actor, target, action, role, key) {
  requireOwned(ctx, target.id)
  const current = await profile(ctx, actor)
  assert(current.role === 'admin' && current.status === 'active', 'Current active Admin required before a fixture transition')
  const payload = { p_target_id: target.id, p_request_id: randomUUID(), p_reason: ctx.manifest.run + ' ' + key,
    ...(role ? { p_new_role: role } : {}) }
  await dispatch(ctx, key, { kind: 'transition', actorId: actor.id, targets: [target.id], payload,
    event: EVENT[action] }, async () => requireSuccess(await rpc(ctx, actor, ACTIONS[action], payload)))
}

async function login(ctx, record, existingOwner = false) {
  if (existingOwner) { assert(!ctx.ownerLoginStarted, 'A second existing-Admin login is forbidden'); ctx.ownerLoginStarted = true }
  const client = ctx.createClient(TARGET.api, ctx.anon, { auth: AUTH_OPTIONS, global: { fetch: (input, init) => {
    assertLocalRequest(input); return fetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(20_000) })
  } } })
  const result = await dispatch(ctx, 'login:' + record.id, { kind: 'auth-login', actorId: record.id, targets: existingOwner ? [] : [record.id],
    payload: { emailHash: sha(record.email), dedicated: true } }, async () => {
    const response = await client.auth.signInWithPassword({ email: record.email, password: ctx.password })
    if (response.error) throw response.error
    assert(response.data.user?.id === record.id && response.data.session?.access_token, 'Sign-in identity mismatch')
    const token = response.data.session.access_token
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    assert(UUID.test(claims.session_id) && claims.sub === record.id && claims.exp * 1000 > Date.now() + 10 * 60_000, 'Unsafe/short-lived new test session')
    const actor = { ...record, client, token, sessionId: claims.session_id, expiresAt: claims.exp * 1000 }
    ctx.sessions.push(actor)
    ctx.manifest.sessions.push({ userId: record.id, sessionId: claims.session_id, tokenHash: sha(token), status: 'OPEN', existingOwner })
    return actor
  })
  return result
}

function originalQuery(ctx) {
  const owned = idsSql(ctx.manifest.ownedIds)
  const actors = idsSql(ctx.manifest.actors.map(actor => actor.id))
  const transitions = Object.values(ctx.manifest.intents).filter(intent => intent.kind === 'transition' && intent.status !== 'DENIED')
  const onboarding = Object.values(ctx.manifest.intents).filter(intent => intent.kind === 'onboard' && intent.status !== 'DENIED')
  const events = [...transitions, ...onboarding].map(intent => `(t.request_id=${ql(intent.payload.p_request_id)}::uuid AND t.actor_id=${ql(intent.actorId)}::uuid AND t.target_id=${ql(intent.targets[0])}::uuid)`)
  const copies = Object.values(ctx.manifest.intents).filter(intent => intent.kind === 'copy' && intent.status !== 'DENIED')
  const requests = copies.map(intent => `(t.actor_id=${ql(intent.actorId)}::uuid AND t.request_id=${ql(intent.payload.p_request_id)}::uuid AND t.source_boq_id=${ql(intent.payload.p_source_boq_id)}::uuid)`)
  const digest = expression => `md5(COALESCE(string_agg(md5((${expression})::text),'' ORDER BY md5((${expression})::text)),''))`
  const rows = ctx.tables.map(table => {
    let where = ''
    if (table.schema === 'public' && table.name === 'user_profiles') where = `WHERE t.id NOT IN (${actors})`
    if (table.schema === 'public' && table.name === 'boq') where = `WHERE t.id NOT IN (${owned})`
    if (table.schema === 'public' && ['boq_routes', 'boq_items'].includes(table.name)) where = `WHERE t.boq_id NOT IN (${owned})`
    if (table.schema === 'public' && table.name === 'user_authorization_events' && events.length) where = `WHERE NOT (${events.join(' OR ')})`
    if (table.schema === 'private' && table.name === 'boq_copy_requests' && requests.length) where = `WHERE NOT (${requests.join(' OR ')})`
    return `SELECT jsonb_build_object('table',${ql(table.schema + '.' + table.name)},'count',count(*),'digest',${digest('to_jsonb(t)')}) FROM ${qi(table.schema)}.${qi(table.name)} t ${where}`
  })
  for (const [table, userColumn] of [['users', 'id'], ['identities', 'user_id']]) rows.push(`SELECT jsonb_build_object('table',${ql('auth.' + table)},'count',count(*),'digest',${digest(`CASE WHEN t.${userColumn}=${ql(ctx.manifest.ownerId)}::uuid THEN to_jsonb(t)-ARRAY['last_sign_in_at','updated_at'] ELSE to_jsonb(t) END`)}) FROM auth.${table} t WHERE t.${userColumn} NOT IN (${actors})`)
  return rows.join('\nUNION ALL\n') + ';'
}

function authOriginalRead() {
  const pairs = [['sessions', 'id'], ['refresh_tokens', 'id'], ['audit_log_entries', 'id']]
  return Object.fromEntries(pairs.map(([table]) => [table, sqlRead(`SELECT COALESCE(jsonb_agg(jsonb_build_object('id',t.id::text,'hash',md5(to_jsonb(t)::text)) ORDER BY t.id),'[]'::jsonb) FROM auth.${table} t;`)[0]]))
}

// Auth audit payloads do not guarantee a session_id. For the existing Admin,
// correlate the exact actor/action with one recorded login/logout time window,
// max one row each; do not call that a direct audit-to-session foreign key.
export function assertAuthAdditions(additions, policy) {
  const fixtures = new Set(policy.fixtureIds)
  const sessionById = new Map(policy.sessions.map(session => [session.sessionId, session.userId]))
  const exactSession = (userId, sessionId) => typeof userId === 'string' && UUID.test(userId)
    && typeof sessionId === 'string' && UUID.test(sessionId) && sessionById.get(sessionId) === userId
    && (fixtures.has(userId) || userId === policy.ownerId)
  for (const session of additions.sessions) assert(exactSession(session.userId, session.id), 'Unexpected or unattributed new Auth session')
  for (const token of additions.tokens) assert(exactSession(token.userId, token.sessionId), 'Unexpected or unattributed new Auth refresh-token row')
  const ownerCount = { login: 0, logout: 0 }
  const signupCount = new Map()
  const inWindow = (createdAt, operation) => {
    const at = Date.parse(createdAt), start = Date.parse(operation?.startedAt), finish = Date.parse(operation?.finishedAt)
    return Number.isFinite(at) && Number.isFinite(start) && Number.isFinite(finish) && finish >= start
      && at >= start - 2000 && at <= finish + 2000
  }
  for (const audit of additions.audits) {
    // GoTrue v2.190 Auth Admin creates log the service-role pseudo-actor, with
    // the new user in traits. Match that exact confirmed intent, never all NULL
    // actors or all service-role events. Only email hashes are read privately.
    if (audit.action === 'user_signedup') {
      assert(audit.actorId === NIL_UUID && audit.actorUsername === 'service_role'
        && audit.actorViaSso === false && audit.logType === 'team' && audit.provider === 'email', 'Unexpected Auth Admin creation audit contract')
      assert(typeof audit.targetId === 'string' && fixtures.has(audit.targetId), 'Auth Admin creation audit targets an unowned user')
      const matches = (policy.authCreates ?? []).filter(intent => intent.kind === 'auth-create' && intent.status === 'CONFIRMED'
        && intent.actorId === audit.targetId && intent.targets?.length === 1 && intent.targets[0] === audit.targetId
        && intent.payload?.id === audit.targetId && typeof intent.payload.email === 'string')
      assert.equal(matches.length, 1, 'Auth Admin creation audit has no exact confirmed intent')
      assert.equal(audit.targetEmailHash, sha(matches[0].payload.email), 'Auth Admin creation audit email differs from the reserved fixture')
      assert(inWindow(audit.createdAt, matches[0]), 'Auth Admin creation audit lies outside its recorded operation window')
      signupCount.set(audit.targetId, (signupCount.get(audit.targetId) ?? 0) + 1)
      assert.equal(signupCount.get(audit.targetId), 1, 'More than one Auth Admin creation audit for a fixture')
      continue
    }
    if (typeof audit.actorId === 'string' && fixtures.has(audit.actorId)) {
      assert(['login', 'logout'].includes(audit.action), 'Unexpected Auth action for a new fixture')
      continue
    }
    assert(audit.actorId === policy.ownerId && ['login', 'logout'].includes(audit.action), 'Unexpected or unattributed Auth audit actor/action')
    const window = audit.action === 'login' ? policy.ownerLogin : policy.ownerLogout
    assert(inWindow(audit.createdAt, window), 'Existing-Admin Auth audit lies outside its recorded dedicated operation window')
    ownerCount[audit.action]++
    assert(ownerCount[audit.action] <= 1, 'More than one existing-Admin Auth audit for the dedicated operation')
  }
}

async function custody(ctx) {
  await verifyProtected(ctx)
  assert.deepEqual(sqlRead(originalQuery(ctx)), ctx.manifest.original, 'Original public/private/profile/reference/Auth data changed')
  const current = authOriginalRead()
  for (const table of Object.keys(ctx.manifest.authOriginal)) {
    const byId = new Map(current[table].map(row => [row.id, row.hash]))
    assert(ctx.manifest.authOriginal[table].every(row => byId.get(row.id) === row.hash), 'An original Auth session/token/audit row changed or disappeared')
  }
  const originals = table => ctx.manifest.authOriginal[table].length ? ctx.manifest.authOriginal[table].map(row => ql(row.id)).join(',') : "''"
  const additions = sqlRead(`SELECT jsonb_build_object(
    'sessions',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id::text,'userId',s.user_id::text)) FROM auth.sessions s WHERE s.id::text NOT IN (${originals('sessions')})),'[]'::jsonb),
    'tokens',COALESCE((SELECT jsonb_agg(jsonb_build_object('userId',t.user_id::text,'sessionId',t.session_id::text)) FROM auth.refresh_tokens t WHERE t.id::text NOT IN (${originals('refresh_tokens')})),'[]'::jsonb),
    'audits',COALESCE((SELECT jsonb_agg(jsonb_build_object('actorId',a.payload->>'actor_id','actorUsername',a.payload->>'actor_username',
      'actorViaSso',a.payload->'actor_via_sso','action',a.payload->>'action','logType',a.payload->>'log_type','createdAt',a.created_at,
      'targetId',a.payload#>>'{traits,user_id}','provider',a.payload#>>'{traits,provider}',
      'targetEmailHash',CASE WHEN a.payload#>>'{traits,user_email}' IS NOT NULL THEN encode(sha256(convert_to(a.payload#>>'{traits,user_email}','UTF8')),'hex') ELSE NULL END))
      FROM auth.audit_log_entries a WHERE a.id::text NOT IN (${originals('audit_log_entries')})),'[]'::jsonb)
  );`)[0]
  const ownerSession = ctx.manifest.sessions.find(session => session.existingOwner)
  assertAuthAdditions(additions, { fixtureIds: ctx.manifest.actors.map(actor => actor.id), sessions: ctx.manifest.sessions, ownerId: ctx.manifest.ownerId,
    authCreates: Object.values(ctx.manifest.intents).filter(intent => intent.kind === 'auth-create'),
    ownerLogin: ctx.manifest.intents['login:' + ctx.manifest.ownerId], ownerLogout: ownerSession && { startedAt: ownerSession.signoutSubmittedAt, finishedAt: ownerSession.signoutFinishedAt } })
  ctx.manifest.custody = { status: 'PASS', comparedTables: ctx.tables.length + 2, originalAuthRowsRetained: true,
    authAdditionCounts: { sessions: additions.sessions.length, tokens: additions.tokens.length, audits: additions.audits.length },
    ownerAuditCorrelation: 'exact actor/action + recorded operation time window + max1 each; audit has no guaranteed session_id' }
  await save(ctx)
}

async function preflight(opt) {
  assert.equal(opt.scenario, SCENARIO, 'Only successor remaining validation is executable')
  const reservationPlan = remainingReservationPlan()
  await privateDirectory(opt.proofDir)
  const graph = JSON.parse(await checkedFile(join(opt.proofDir, 'graph.json')))
  const result = JSON.parse(await checkedFile(join(opt.proofDir, 'metadata-result.json')))
  const ready = JSON.parse(await checkedFile(join(opt.proofDir, 'ready.json')))
  const predecessor = JSON.parse(await checkedFile(join(opt.proofDir, 'actual-metadata.json')))
  assert.equal(sha(predecessor), RECORDED_PREDECESSOR_SHA, 'Frozen baseline-plus031 metadata changed')
  const closedBytes = await checkedFile(CLOSED_EVIDENCE.path)
  assert.equal(sha(closedBytes), CLOSED_EVIDENCE.sha256, 'Finalized S0 evidence changed; never reopen or adopt it')
  const closed = JSON.parse(closedBytes)
  assert(closed.finalized && closed.phase === 'FINALIZED' && closed.metadataState === 'successor'
    && closed.successorSha === RECORDED_SUCCESSOR_SHA, 'Recorded predecessor/successor evidence is not closed')
  const metadataSql = await checkedFile(join(opt.proofDir, 'metadata-read.sql'))
  assert.equal(sha(metadataSql), METADATA_SQL_SHA, 'Metadata read source differs from the reviewed read-only query')
  assert(result.status === 'PASS' && ready.status === 'PASS' && graph.existingAdminSessionSettingsSafe
    && graph.apiOrigin === TARGET.api && graph.socket === TARGET.socket && graph.rowCap === 1000, 'Reviewed local preflight is not PASS')
  assert(UUID.test(ready.owner.id) && ready.owner.email === 'local.admin@ntplc.co.th', 'Existing Admin must match the approved local account')
  for (const name of ['a1', 'a2', 'b1']) for (const key of ['orgId', 'departmentId', 'sectorId']) assert(UUID.test(ready.hierarchies[name][key]), 'Missing reference hierarchy')
  assert(ready.hierarchies.a1.departmentId === ready.hierarchies.a2.departmentId && ready.hierarchies.a1.sectorId !== ready.hierarchies.a2.sectorId
    && ready.hierarchies.a1.departmentId !== ready.hierarchies.b1.departmentId, 'Same/cross-scope references unavailable')
  assert(UUID.test(ready.catalogVersionId) && UUID.test(ready.factorVersionId), 'Published version references required')
  for (const record of Object.values(graph.containers)) {
    const actual = JSON.parse(docker(['inspect', record.id]))[0]
    assert(actual.Id === record.id && actual.Name === record.name && actual.State.Running && actual.Config.Image === record.image, 'Verified local graph changed')
    if (record.id === TARGET.db) assert(actual.Mounts.some(mount => mount.Name === TARGET.volume && mount.Destination === '/var/lib/postgresql/data'), 'DB volume changed')
  }
  const active = sqlRead(`SELECT jsonb_build_object('id',id,'role',role,'status',status,'email',email) FROM public.user_profiles WHERE id=${ql(ready.owner.id)}::uuid;`)[0]
  assert(active?.id === ready.owner.id && active.role === 'admin' && active.status === 'active' && active.email === ready.owner.email, 'Existing Admin is not active')
  const originalRefs = Object.values(ready.hierarchies).map(value => `(d.id=${ql(value.departmentId)}::uuid AND s.id=${ql(value.sectorId)}::uuid AND o.id=${ql(value.orgId)}::uuid)`)
  const references = sqlRead(`SELECT count(*) FROM public.organizations o JOIN public.departments d ON d.org_id=o.id JOIN public.sectors s ON s.department_id=d.id WHERE o.is_active AND d.is_active AND s.is_active AND (${originalRefs.join(' OR ')});`)[0]
  assert.equal(references, 3, 'Existing reference hierarchy changed')
  const { readLocalEnvFile } = await import('./local-env.mjs')
  const { createClient } = await import('@supabase/supabase-js')
  const credentialPath = resolve(ROOT, 'supabase/.env.local'), webPath = resolve(ROOT, '.env.development.local')
  const credentialsText = await checkedFile(credentialPath), webText = await checkedFile(webPath)
  assert.equal(sha(credentialsText), ready.credentialDigest, 'Credential source differs from the approved fresh preflight')
  assert.equal(sha(webText), ready.webDigest, 'Web environment differs from the approved fresh preflight')
  const credentials = readLocalEnvFile(credentialPath), web = readLocalEnvFile(webPath)
  assertLocalRequest(web.NEXT_PUBLIC_SUPABASE_URL)
  assert(credentials.LOCAL_TEST_PASSWORD && credentials.LOCAL_SUPABASE_SECRET_KEY && web.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Existing local credentials are incomplete')
  const protectedFiles = JSON.parse(await checkedFile(join(opt.proofDir, 'protected-before.json')))
  const protectedMap = protectedFiles.files ?? protectedFiles
  const tables = sqlRead("SELECT COALESCE(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname) ORDER BY n.nspname,c.relname),'[]'::jsonb) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','private') AND c.relkind IN ('r','p');")[0]
  const manifest = { format: 'conduit-boq/s0-local/v1', scenario: SCENARIO, run: opt.run, target: TARGET.db, ownerId: ready.owner.id, phase: 'PREFLIGHT', finalized: false,
    reservationPlan, inheritedEvidence: CLOSED_EVIDENCE, preparedComplete: false, successorSha: RECORDED_SUCCESSOR_SHA,
    acceptance: { core: 'NOT RUN', builtApp: 'NOT RUN', overall: 'NOT RUN' }, cleanup: { status: 'NOT RUN' },
    createdAt: new Date().toISOString(), actors: LABELS.map(label => ({ label, id: randomUUID(), email: `${opt.run}.${label.toLowerCase()}@ntplc.co.th` })),
    graphs: {}, ownedIds: [], intents: {}, sessions: [], results: [], requests: 0, timings: [], capacity: { boqs: 0, routes: 0, items: 0 }, reservations: {},
    credentialHash: sha(credentialsText), webHash: sha(webText), predecessorSha: sha(predecessor), edgeLimits: ['missing-profile', 'active-null-affiliation', 'positive-eligible-legacy-copy'] }
  manifest.ownedIds.push(...manifest.actors.map(actor => actor.id))
  const absent = sqlRead(`SELECT jsonb_build_object('users',(SELECT count(*) FROM auth.users WHERE id IN (${idsSql(manifest.ownedIds)}) OR lower(email) IN (${manifest.actors.map(actor => ql(actor.email.toLowerCase())).join(',')})),
    'profiles',(SELECT count(*) FROM public.user_profiles WHERE id IN (${idsSql(manifest.ownedIds)})));`)[0]
  assert(absent.users === 0 && absent.profiles === 0, 'Reserved actor UUID/email already exists; no adoption/replacement')
  await privateDirectory(opt.output, true)
  const ctx = { ...opt, ready, predecessor, metadataSql, protected: protectedMap, tables, manifest, manifestPath: join(opt.output, 'manifest.json'),
    password: credentials.LOCAL_TEST_PASSWORD, secret: credentials.LOCAL_SUPABASE_SECRET_KEY, anon: web.NEXT_PUBLIC_SUPABASE_ANON_KEY, createClient,
    actors: {}, sessions: [], ownerLoginStarted: false }
  await metadata(ctx, 'successor'); await verifyProtected(ctx)
  manifest.original = sqlRead(originalQuery(ctx)); manifest.authOriginal = authOriginalRead()
  await save(ctx)
  return ctx
}

async function prepare(ctx) {
  assertPhase(ctx.manifest, 'prepare'); await metadata(ctx, 'successor'); await custody(ctx)
  ctx.owner = await login(ctx, ctx.ready.owner, true)
  assert((await profile(ctx, ctx.owner)).role === 'admin', 'Existing Admin authentication mismatch')
  const service = ctx.createClient(TARGET.api, ctx.secret, { auth: AUTH_OPTIONS, global: { fetch: (input, init) => {
    assertLocalRequest(input); return fetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(20_000) })
  } } })
  for (const actor of ctx.manifest.actors) {
    await dispatch(ctx, 'create:' + actor.id, { kind: 'auth-create', actorId: actor.id, targets: [actor.id], payload: { id: actor.id, email: actor.email, email_confirm: true } }, async () => {
      const response = await service.auth.admin.createUser({ id: actor.id, email: actor.email, password: ctx.password, email_confirm: true,
        user_metadata: { first_name: 'S0 synthetic', last_name: actor.label, s0_run: ctx.manifest.run } })
      if (response.error) throw response.error
      assert.equal(response.data.user?.id, actor.id, 'Auth must preserve the reserved exact UUID')
      actor.created = true; return { id: actor.id }
    })
    ctx.actors[actor.label] = await login(ctx, actor)
    const h = ctx.ready.hierarchies.a1
    const payload = { p_first_name: 'S0 synthetic', p_last_name: actor.label, p_title: null, p_position: null, p_employee_id: null, p_phone: null,
      p_requested_department_id: h.departmentId, p_requested_sector_id: h.sectorId, p_submit_onboarding: true, p_request_id: randomUUID() }
    await dispatch(ctx, 'onboard:' + actor.id, { kind: 'onboard', actorId: actor.id, targets: [actor.id], payload }, async () => requireSuccess(await rpc(ctx, ctx.actors[actor.label], 'update_my_profile', payload)))
    if (actor.label !== 'pending') await transition(ctx, ctx.owner, actor, 'approve', null, 'approve:' + actor.id)
    // Establish the new runtime Admin first, before creating any other active
    // fixture. It can finalize a later partially prepared run without another
    // existing-Admin login or broadening that account's allowed targets.
    if (actor.label === 'admin') await transition(ctx, ctx.owner, actor, 'role', 'admin', 'role:' + actor.id)
  }
  for (const label of LABELS.filter(label => label !== 'pending')) newGraph(ctx, label + ':primary', ['staffAssignee', 'procurementAssignee'].includes(label) ? 'staffOwner' : label,
    'a1', ['staffAssignee', 'procurementAssignee'].includes(label) ? label : null)
  newGraph(ctx, 'pending:primary', 'staffOwner', 'a1', 'pending')
  for (const scope of ['a1', 'a2', 'b1']) newGraph(ctx, 'shared:' + scope, 'staffOwner', scope)
  newGraph(ctx, 'copy:source', 'staffOwner')
  assert.equal(Object.keys(ctx.manifest.graphs).length, ctx.manifest.reservationPlan.initialGraphs, 'Remaining fixture geometry changed')
  const absentGraphs = sqlRead(`SELECT (SELECT count(*) FROM public.boq WHERE id IN (${idsSql(ctx.manifest.ownedIds)}))+(SELECT count(*) FROM public.boq_routes WHERE id IN (${idsSql(ctx.manifest.ownedIds)}))+(SELECT count(*) FROM public.boq_items WHERE id IN (${idsSql(ctx.manifest.ownedIds)}));`)[0]
  assert.equal(absentGraphs, 0, 'Reserved graph IDs already exist')
  await save(ctx)
  for (const graph of Object.values(ctx.manifest.graphs)) await createGraph(ctx, graph)
  for (const actor of ctx.manifest.actors) {
    if (ROLE[actor.label] && actor.label !== 'admin') await transition(ctx, ctx.owner, actor, 'role', ROLE[actor.label], 'role:' + actor.id)
    if (['inactive', 'suspended'].includes(actor.label)) await transition(ctx, ctx.owner, actor, actor.label === 'inactive' ? 'deactivate' : 'suspend', null, 'status:' + actor.id)
  }
  ctx.manifest.preparedComplete = true; ctx.manifest.phase = 'PREPARED'; await custody(ctx); await save(ctx)
}

async function remainingChecks(ctx) {
  const phase = 'after'
  const control = { id: reserveId(ctx, 'boqs', 'status:active:header'), label: 'status:active', scope: 'a1' }
  await save(ctx)
  await writeCase(ctx, ctx.actors.staffOwner, control, 'boq', 'POST',
    negativeStatusHeaderPayload(header(ctx, control, ctx.actors.staffOwner.id)), control.id, true, 'status:active:boq:I')
  for (const label of ['pending', 'inactive', 'suspended', 'anon']) {
    const actor = ctx.actors[label] ?? null, graph = ctx.manifest.graphs[(label === 'anon' ? 'staffOwner' : label) + ':primary']
    if (actor) assert.equal((await profile(ctx, actor)).status, label, 'Status test requires a valid current fixture JWT/profile')
    const insert = { id: reserveId(ctx, 'boqs', `status:${label}:header`), label: `status:${label}`, scope: 'a1' }
    await save(ctx)
    await writeCase(ctx, actor, insert, 'boq', 'POST', negativeStatusHeaderPayload(header(ctx, insert, actor?.id ?? ctx.actors.staffOwner.id)), insert.id, false, `status:${label}:boq:I`)
    for (const [table, id, patch] of [['boq', graph.id, { project_name: 'denied' }], ['boq_routes', graph.routeId, { route_name: 'denied' }], ['boq_items', graph.itemId, { remarks: 'denied' }]]) {
      await writeCase(ctx, actor, graph, table, 'PATCH', patch, id, false, `status:${label}:${table}:U`)
      await writeCase(ctx, actor, graph, table, 'DELETE', undefined, id, false, `status:${label}:${table}:D`)
      if (table !== 'boq') {
        const child = reserveId(ctx, table === 'boq_routes' ? 'routes' : 'items', `status:${label}:${table}:I`)
        await save(ctx)
        await writeCase(ctx, actor, graph, table, 'POST', table === 'boq_routes' ? route(graph, child, 99) : item(graph, child), child, false, `status:${label}:${table}:I`)
      }
    }
  }
  const assignee = ctx.actors.staffAssignee, assigned = ctx.manifest.graphs['staffAssignee:primary'], forbidden = ctx.manifest.graphs['shared:b1']
  await writeCase(ctx, assignee, assigned, 'boq', 'PATCH', { assigned_to: null }, assigned.id, false, `${phase}:postimage:header`)
  await writeCase(ctx, assignee, assigned, 'boq_routes', 'PATCH', { boq_id: forbidden.id }, assigned.routeId, false, `${phase}:postimage:route-parent`)
  await writeCase(ctx, assignee, assigned, 'boq_items', 'PATCH', { boq_id: forbidden.id, route_id: forbidden.routeId }, assigned.itemId, false, `${phase}:postimage:item-parent`)
  const bulkIds = [reserveId(ctx, 'items', `${phase}:bulk:item:allow`), reserveId(ctx, 'items', `${phase}:bulk:item:deny`)]
  const bulkPayload = [item(assigned, bulkIds[0]), item(forbidden, bulkIds[1])]
  const beforeBulk = [graphRead(assigned.id), graphRead(forbidden.id)]
  const bulkResult = await dispatch(ctx, `${phase}:bulk:atomic`, { kind: 'table-write', actorId: assignee.id,
    targets: [assigned.id, forbidden.id, ...bulkIds], payload: bulkPayload }, () => api(ctx, assignee, 'boq_items', 'POST', bulkPayload))
  await assertWriteWithEvidence(bulkResult, beforeBulk, [graphRead(assigned.id), graphRead(forbidden.id)], false, assignee, 'POST', {
    label: `${phase}:bulk:atomic`, persist: async receipt => { ctx.manifest.intents[`${phase}:bulk:atomic`].caseEvidence = receipt; await save(ctx) },
  })
  ctx.manifest.intents[`${phase}:bulk:atomic`].status = 'DENIED'
  ctx.manifest.results.push({ label: `${phase}:bulk:atomic`, status: 'PASS', http: bulkResult.status })
  await save(ctx)
}

async function readChecks(ctx, phase) {
  for (const label of ['admin', 'deptManager', 'sectorManager', 'staffOwner', 'staffAssignee', 'procurementOwner', 'procurementAssignee']) {
    const actor = ctx.actors[label], primary = ctx.manifest.graphs[label + ':primary']
    const direct = requireSuccess(await api(ctx, actor, 'boq?id=eq.' + primary.id + '&select=*'))
    assert(direct.length === 1 && direct[0].id === primary.id, 'Authorized header SELECT changed')
    for (const table of ['boq_routes', 'boq_items']) {
      const response = await api(ctx, actor, table + '?boq_id=eq.' + primary.id + '&select=*&order=id')
      const rows = requireSuccess(response), expected = graphRead(primary.id)[table === 'boq_routes' ? 'routes' : 'items']
      assert.equal(rows.length, expected.length, 'Visible child graph missing/truncated')
      assert.equal(Number(response.range?.split('/')[1]), expected.length, 'Exact child count mismatch')
    }
    const shared = await Promise.all(['a1', 'a2', 'b1'].map(scope => api(ctx, actor, 'boq?id=eq.' + ctx.manifest.graphs['shared:' + scope].id + '&select=id')))
    const expected = label === 'admin' || label === 'staffOwner' ? [1, 1, 1] : label === 'deptManager' || label.startsWith('procurement') ? [1, 1, 0] : [1, 0, 0]
    assert.deepEqual(shared.map(result => requireSuccess(result).length), expected, 'Same/cross-scope SELECT changed')
  }
  const ids = Object.values(ctx.manifest.graphs).map(graph => graph.id)
  const list = await api(ctx, ctx.actors.staffOwner, 'boq?select=id,created_at&id=in.(' + ids.join(',') + ')&order=created_at.desc,id.desc&limit=25')
  const rows = requireSuccess(list)
  assert(rows.length <= 25 && Number(list.range?.split('/')[1]) >= rows.length, 'Numbered page/count invalid')
  const routes = requireSuccess(await api(ctx, ctx.actors.staffOwner, 'boq_routes?select=id,boq_id&boq_id=in.(' + rows.map(row => row.id).join(',') + ')'))
  const expectedCount = rows.reduce((sum, row) => sum + graphRead(row.id).routes.length, 0)
  assert.equal(routes.length, expectedCount, 'Current page route batch incomplete')
  ctx.manifest.results.push({ label: phase + ':reads-list-count-routes', status: 'PASS', pageRequests: 2, routes: routes.length })
  await save(ctx)
}

function zeroSave(graph) {
  const data = { estimator_name: 'S0 synthetic', document_date: '2026-11-03', project_name: 'S0 saved synthetic', route: 'S0 saved route', construction_area: null,
    department: null, total_material_cost: 0, total_labor_cost: 0, total_cost: 0, factor_f: 0, factor_f_raw: 0, factor_f_lower_cost: 0,
    factor_f_upper_cost: 0, factor_f_lower_value: 0, factor_f_upper_value: 0, total_with_factor_f: 0, total_with_vat: 0 }
  return { p_boq_id: graph.id, p_boq_data: data, p_routes: [{ route_name: 'S0 saved route', route_description: null, construction_area: null,
    total_material_cost: 0, total_labor_cost: 0, total_cost: 0, items: [{ item_order: 1, price_list_id: null, item_name: 'S0 saved item', quantity: 0,
      unit: 'm', material_cost_per_unit: 0, labor_cost_per_unit: 0, unit_cost: 0, total_material_cost: 0, total_labor_cost: 0, total_cost: 0, remarks: null, category: null }] }] }
}

async function saveChecks(ctx, phase) {
  for (const [label, graphLabel, allow] of [['admin', 'admin:primary', true], ['deptManager', 'deptManager:primary', true],
    ['sectorManager', 'sectorManager:primary', true], ['staffOwner', 'staffOwner:primary', true], ['staffAssignee', 'shared:a1', false],
    ['procurementOwner', 'procurementOwner:primary', false], ['deptManager', 'shared:b1', false]]) {
    const graph = ctx.manifest.graphs[graphLabel], before = graphRead(graph.id), payload = zeroSave(graph)
    if (allow) {
      reserveCapacity(ctx.manifest, 'routes', 1, `${phase}:save-route:${label}`)
      reserveCapacity(ctx.manifest, 'items', 1, `${phase}:save-item:${label}`)
    }
    const result = await dispatch(ctx, `${phase}:save:${label}:${graphLabel}`, { kind: 'save', actorId: ctx.actors[label].id, targets: [graph.id], payload }, () => rpc(ctx, ctx.actors[label], 'save_boq_with_routes', payload))
    const after = graphRead(graph.id)
    if (allow) {
      assert(requireSuccess(result)?.success === true && after.routes.length === 1 && after.items.length === 1, 'Writer Save/reload failed')
      for (const row of [...after.routes, ...after.items]) { assert(!ctx.manifest.ownedIds.includes(row.id), 'Save reused an unreserved existing child'); ctx.manifest.ownedIds.push(row.id) }
      graph.routeId = after.routes[0].id; graph.itemId = after.items[0].id
      assert.equal(Number(after.header.total_cost), 0)
    } else {
      assert(result.status === 403 && result.data?.code === '42501', 'Guarded Save must deny before mutation')
      assert.equal(sha(after), sha(before), 'Denied guarded Save changed graph')
      ctx.manifest.intents[`${phase}:save:${label}:${graphLabel}`].status = 'DENIED'
    }
    ctx.manifest.results.push({ label: `${phase}:save:${label}:${graphLabel}`, status: 'PASS', allow, http: result.status })
    await save(ctx)
  }
}

function copyLedger(actor, request) {
  return sqlRead(`SELECT COALESCE(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM private.boq_copy_requests t WHERE t.actor_id=${ql(actor.id)}::uuid AND t.request_id=${ql(request)}::uuid;`)[0]
}

function allGraphDigest() {
  return sqlRead("SELECT jsonb_build_object('boq',(SELECT md5(COALESCE(string_agg(md5(to_jsonb(t)::text),'' ORDER BY id),'')) FROM public.boq t),'routes',(SELECT md5(COALESCE(string_agg(md5(to_jsonb(t)::text),'' ORDER BY id),'')) FROM public.boq_routes t),'items',(SELECT md5(COALESCE(string_agg(md5(to_jsonb(t)::text),'' ORDER BY id),'')) FROM public.boq_items t));")[0]
}

export function staleCopySourcePatch(payload, projectName) {
  const previous = Date.parse(payload.p_expected_source_updated_at)
  assert(Number.isFinite(previous), 'A valid original source token is required')
  // Direct header PATCH has no updated_at trigger. Advance only this run-owned
  // source explicitly; +1s stays beyond PostgreSQL's possible sub-ms precision.
  return { project_name: projectName, updated_at: new Date(previous + 1000).toISOString() }
}

export function staleCopyRequestAfterSourceChange(payload, patch, returned, stored, requestId) {
  assert(returned?.id === payload.p_source_boq_id && stored?.id === payload.p_source_boq_id, 'Source-change proof refers to another BOQ')
  assert.equal(returned.updated_at, stored.updated_at, 'API and persisted source tokens differ')
  assert.equal(Date.parse(stored.updated_at), Date.parse(patch.updated_at), 'Source token did not persist the reserved update')
  assert(Date.parse(stored.updated_at) > Date.parse(payload.p_expected_source_updated_at), 'Source token must advance before stale Copy dispatch')
  assert(UUID.test(requestId) && requestId !== payload.p_request_id, 'Stale Copy requires its own reserved request UUID')
  // Keep the original reviewed token; substituting the new token would perform
  // a fresh successful Copy instead of exercising the stale conflict guard.
  return { ...payload, p_request_id: requestId }
}

async function copyChecks(ctx, phase) {
  const actor = ctx.actors.staffOwner, graph = ctx.manifest.graphs['copy:source'], before = graphRead(graph.id)
  const payload = { p_source_boq_id: graph.id, p_request_id: randomUUID(), p_expected_source_updated_at: before.header.updated_at,
    p_mode: 'preserve', p_factor_reference_version_id: null }
  reserveCapacity(ctx.manifest, 'boqs', 1, phase + ':copy-boq')
  reserveCapacity(ctx.manifest, 'routes', before.routes.length, phase + ':copy-routes')
  reserveCapacity(ctx.manifest, 'items', before.items.length, phase + ':copy-items')
  const result = await dispatch(ctx, phase + ':copy', { kind: 'copy', actorId: actor.id, targets: [graph.id], payload }, () => rpc(ctx, actor, 'duplicate_boq_atomic', payload))
  const copied = requireSuccess(result)
  assert(copied.success === true && UUID.test(copied.boq_id) && copied.duplicateRequest === false, 'Fresh preserve Copy failed')
  const destination = graphRead(copied.boq_id)
  assert(destination.header && destination.routes.length === before.routes.length && destination.items.length === before.items.length, 'Copy graph incomplete')
  for (const id of [copied.boq_id, ...destination.routes.map(row => row.id), ...destination.items.map(row => row.id)]) {
    assert(!ctx.manifest.ownedIds.includes(id), 'Copy destination collides with existing ID'); ctx.manifest.ownedIds.push(id)
  }
  ctx.manifest.intents[phase + ':copy'].destinationId = copied.boq_id
  await save(ctx)
  const replay = requireSuccess(await dispatch(ctx, phase + ':copy-replay', { kind: 'copy-replay', actorId: actor.id, targets: [graph.id], payload }, () => rpc(ctx, actor, 'duplicate_boq_atomic', payload)))
  assert(replay.boq_id === copied.boq_id && replay.duplicateRequest === true && copyLedger(actor, payload.p_request_id).length === 1, 'Copy UUID replay duplicated a graph')
  const mismatchPayload = { ...payload, p_expected_source_updated_at: '2000-01-01T00:00:00Z' }, mismatchBefore = allGraphDigest()
  const mismatch = await dispatch(ctx, phase + ':copy-mismatch', { kind: 'copy-mismatch', actorId: actor.id, targets: [graph.id], payload: mismatchPayload }, () => rpc(ctx, actor, 'duplicate_boq_atomic', mismatchPayload))
  assert(mismatch.status >= 400 && mismatch.data?.code === '22023', 'Copy payload mismatch did not deny')
  assert.deepEqual(allGraphDigest(), mismatchBefore, 'Copy mismatch left graph residue')
  ctx.manifest.intents[phase + ':copy-mismatch'].status = 'DENIED'
  const sourcePatch = staleCopySourcePatch(payload, ctx.manifest.run + ':' + phase + ':changed')
  const sourceChange = await writeCase(ctx, actor, graph, 'boq', 'PATCH', sourcePatch, graph.id, true, phase + ':copy-source-change')
  const stale = staleCopyRequestAfterSourceChange(payload, sourcePatch, sourceChange.data[0], graphRead(graph.id).header, randomUUID())
  const staleBefore = allGraphDigest()
  const staleResult = await dispatch(ctx, phase + ':copy-stale', { kind: 'copy', actorId: actor.id, targets: [graph.id], payload: stale }, () => rpc(ctx, actor, 'duplicate_boq_atomic', stale))
  assert(staleResult.status === 409 && staleResult.data?.code === 'PT409' && staleResult.data?.details === 'BOQ_SOURCE_STALE' && copyLedger(actor, stale.p_request_id).length === 0, '031 stale conflict/ledger contract failed')
  assert.deepEqual(allGraphDigest(), staleBefore, 'Stale Copy left graph residue')
  ctx.manifest.intents[phase + ':copy-stale'].status = 'DENIED'
  const ineligible = { ...payload, p_request_id: randomUUID(), p_expected_source_updated_at: graphRead(graph.id).header.updated_at,
    p_mode: 'select_factor', p_factor_reference_version_id: ctx.ready.factorVersionId }
  const ineligibleBefore = allGraphDigest()
  const denied = await dispatch(ctx, phase + ':copy-ineligible', { kind: 'copy', actorId: actor.id, targets: [graph.id], payload: ineligible }, () => rpc(ctx, actor, 'duplicate_boq_atomic', ineligible))
  assert(denied.status >= 400 && denied.data?.code === '22023' && copyLedger(actor, ineligible.p_request_id).length === 0, 'Bound-source selected-Factor eligibility changed')
  assert.deepEqual(allGraphDigest(), ineligibleBefore, 'Ineligible Copy left graph residue')
  ctx.manifest.intents[phase + ':copy-ineligible'].status = 'DENIED'
  assert.equal(sha(graphRead(copied.boq_id)), sha(destination), 'Copy replay/error changed recorded destination')
  ctx.manifest.results.push({ label: phase + ':copy-preserve-replay-mismatch-stale-ineligible', status: 'PASS', staleMs: staleResult.elapsedMs })
  await save(ctx)
}

export function assertSameTokenRoleChange(beforeTokenHash, actor, currentProfile) {
  assert.equal(sha(actor.token), beforeTokenHash, 'Role transition must retain the exact same access token')
  assert(currentProfile?.id === actor.id && currentProfile.role === 'procurement' && currentProfile.status === 'active'
    && actor.expiresAt > Date.now() + 30_000, 'Same JWT must remain valid for the current active procurement actor')
}

async function verify(ctx) {
  assertPhase(ctx.manifest, 'verify'); await metadata(ctx, 'successor')
  assert(ctx.manifest.preparedComplete, 'Remaining verification requires completed preparation')
  await remainingChecks(ctx); await readChecks(ctx, 'after'); await saveChecks(ctx, 'after'); await copyChecks(ctx, 'after'); await timingChecks(ctx, 'after')
  const actor = ctx.actors.mutable, graph = ctx.manifest.graphs['mutable:primary']
  const currentStaff = await profile(ctx, actor), tokenHash = sha(actor.token)
  assert(currentStaff.id === actor.id && currentStaff.role === 'staff' && currentStaff.status === 'active', 'Same-JWT control requires current active staff')
  await writeCase(ctx, actor, graph, 'boq', 'PATCH', { project_name: 'S0 successor mutable staff' }, graph.id, true, 'mutable:staff:successor')
  await transition(ctx, ctx.actors.admin, actor, 'role', 'procurement', 'mutable:change-role')
  assertSameTokenRoleChange(tokenHash, actor, await profile(ctx, actor))
  await writeCase(ctx, actor, graph, 'boq', 'PATCH', { project_name: 'S0 mutable denied' }, graph.id, false, 'mutable:procurement:after')
  ctx.manifest.mutableTokenHash = tokenHash
  ctx.manifest.acceptance.core = 'PASS'; ctx.manifest.phase = 'VERIFIED'; await custody(ctx); await save(ctx)
}

export function latchHold(manifest, error, command) {
  assert(!manifest.finalized, 'Finalized evidence cannot be changed by a later error')
  const failure = { command, at: new Date().toISOString(), ...safeError(error) }
  manifest.failure ??= failure
  manifest.hold ??= failure
  manifest.acceptance ??= { core: 'NOT RUN', builtApp: 'NOT RUN', overall: 'NOT RUN' }
  if (['prepare', 'verify'].includes(command)) manifest.acceptance.core = 'HOLD'
  if (command.startsWith('app-')) manifest.acceptance.builtApp = 'HOLD'
  manifest.acceptance.overall = 'HOLD'; manifest.phase = 'HELD'
  return manifest.failure
}

export function assertFinalFixtureRetention(manifest, counts, createdCount) {
  if (manifest.preparedComplete) {
    assert.equal(createdCount, CAPS.identities, 'Completed preparation must retain all eleven profiles')
    assert.deepEqual(counts, { inactive: 9, pending: 1, suspended: 1 }, 'Final fixture lifecycle differs from the approved retention')
  } else assert(!counts?.active && Object.values(counts ?? {}).reduce((sum, count) => sum + Number(count), 0) === createdCount,
    'Partial preparation did not retain exactly its non-active created profiles')
}

export function canFinalizeAfterHold(manifest) {
  return !manifest.finalized && manifest.phase === 'HELD' && !!manifest.hold
    && Object.values(manifest.intents).every(intent => TERMINAL.has(intent.status))
    && !(manifest.sessions ?? []).some(session => ['UNKNOWN', 'SIGNOUT_SUBMITTED'].includes(session.status))
    && (!manifest.app || manifest.app.state === 'CLOSED')
}

async function timingChecks(ctx, phase) {
  const graph = ctx.manifest.graphs['staffOwner:primary'], samples = []
  for (let index = 0; index < 13; index++) {
    const result = await writeCase(ctx, ctx.actors.staffOwner, graph, 'boq', 'PATCH', { project_name: `${ctx.manifest.run}:${phase}:warm:${index}` },
      graph.id, true, `${phase}:warm:${index}`)
    if (index >= 3) samples.push(result.elapsedMs)
  }
  const sorted = [...samples].sort((a, b) => a - b)
  ctx.manifest.results.push({ label: phase + ':writer-patch-timing', status: 'PASS', warmups: 3, samples: samples.length,
    medianMs: (sorted[4] + sorted[5]) / 2, p95Ms: sorted[9], rawMs: samples })
  await save(ctx)
}

export function assertAppReceipt(manifest, receipt) {
  const app = manifest.app
  assert(app && !manifest.finalized && (manifest.phase === 'VERIFIED'
    || (manifest.phase === 'HELD' && receipt.stage === 'closed')), 'Built-app recording requires this open verified run or exact cleanup after HOLD')
  assert(receipt.run === manifest.run && receipt.actorId === app.actor.id && receipt.projectName === app.projectName, 'Stale or unrelated app receipt')
  assert(['session', 'created', 'saved', 'closed', 'aborted'].includes(receipt.stage), 'Unknown app receipt stage')
  if (receipt.stage === 'aborted') {
    assert(app.state === 'PLANNED' && receipt.outcome === 'NOT_DISPATCHED' && !receipt.dispatch,
      'Only a never-dispatched PLANNED app operation can be aborted')
    assert(receipt.operationId === app.operations.login, 'App abort refers to another login intent')
    return
  }
  const before = { session: ['PLANNED'], created: ['SESSION'], saved: ['CREATED'], closed: ['SESSION', 'CREATED', 'SAVED'] }
  assert(before[receipt.stage].includes(app.state), 'App receipt replay or wrong stage')
  assert(receipt.outcome === 'CONFIRMED', 'UNKNOWN/failed app outcome requires exact reconciliation, not replay/adoption')
  if (receipt.stage === 'created') {
    assert(UUID.test(receipt.boqId) && !app.beforeBoqIds.includes(receipt.boqId) && !manifest.ownedIds.includes(receipt.boqId), 'App cannot adopt an original/existing BOQ')
  }
  if (receipt.stage === 'saved') assert(receipt.boqId === app.boqId, 'App Save targeted another BOQ')
  if (receipt.stage === 'closed') appAcceptanceOutcome(app, receipt)
  const operation = { session: 'login', created: 'create', saved: 'save', closed: 'logout' }[receipt.stage]
  assert(receipt.dispatch?.operationId === app.operations[operation] && receipt.dispatch?.status === 'SUBMITTED'
    && /^[a-f0-9]{64}$/.test(receipt.dispatch.payloadHash) && Number.isFinite(Date.parse(receipt.dispatch.startedAt)), 'Missing exact pre-dispatch app intent')
}

export function appAcceptanceOutcome(app, receipt) {
  assert(receipt.stage === 'closed' && ['SESSION', 'CREATED', 'SAVED'].includes(app.state), 'App acceptance requires an exact open-session closure')
  assert(['PASS', 'HOLD'].includes(receipt.appAcceptance) && typeof receipt.cleanupOnly === 'boolean', 'App closure must separately report acceptance and cleanup')
  if (receipt.appAcceptance === 'PASS') assert(app.state === 'SAVED' && receipt.cleanupOnly === false, 'Cleanup alone or an incomplete app flow cannot establish PASS')
  else assert(receipt.cleanupOnly === true, 'App HOLD closure must identify cleanup-only evidence')
  return receipt.appAcceptance
}

export const APP_DISPATCH_PROOFS = Object.freeze(['session', 'created', 'saved', 'closed'].flatMap(stage => [
  `app-${stage}-dispatch.json`, `app-${stage}.json`,
]))

export function assertAppAbortEvidence(manifest, existingProofs, actual) {
  const app = manifest.app
  assert(!manifest.finalized && manifest.phase === 'VERIFIED' && app?.state === 'PLANNED'
    && !app.sessionId && !app.boqId && Object.keys(app.receipts ?? {}).length === 0, 'App already has a recorded outcome or dispatched state')
  assert(existingProofs.length === 0, 'A submitted or completed app proof forbids pre-dispatch abort')
  assert.deepEqual(actual.sessions, app.beforeSessions, 'App abort cannot hide a new or removed fixture session')
  assert.deepEqual(actual.boqIds, app.beforeBoqIds, 'App abort cannot hide a new or removed BOQ')
  assert.deepEqual(actual.childIds, app.beforeChildIds, 'App abort cannot hide a new or removed child')
}

async function appPlan(ctx) {
  assert(ctx.manifest.phase === 'VERIFIED' && !ctx.manifest.finalized && !ctx.manifest.app && !ctx.manifest.hold, 'One built-app plan is allowed after core verification')
  reserveCapacity(ctx.manifest, 'boqs', 1, 'app:boq')
  reserveCapacity(ctx.manifest, 'routes', 4, 'app:routes')
  reserveCapacity(ctx.manifest, 'items', 8, 'app:items')
  const actor = ctx.manifest.actors.find(actor => actor.label === 'staffOwner')
  const beforeBoqIds = sqlRead("SELECT COALESCE(jsonb_agg(id ORDER BY id),'[]'::jsonb) FROM public.boq;")[0]
  const beforeChildIds = sqlRead("SELECT COALESCE(jsonb_agg(id ORDER BY id),'[]'::jsonb) FROM (SELECT id FROM public.boq_routes UNION ALL SELECT id FROM public.boq_items) q;")[0]
  const beforeSessions = sqlRead(`SELECT COALESCE(jsonb_agg(id ORDER BY id),'[]'::jsonb) FROM auth.sessions WHERE user_id=${ql(actor.id)}::uuid;`)[0]
  ctx.manifest.app = { state: 'PLANNED', actor: { id: actor.id, email: actor.email }, projectName: ctx.manifest.run + ' built-app positive',
    routeCap: 4, itemCap: 8, beforeBoqIds, beforeChildIds, beforeSessions,
    operations: { login: randomUUID(), create: randomUUID(), save: randomUUID(), logout: randomUUID() } }
  await save(ctx)
  await atomicJson(join(ctx.output, 'app-plan.json'), { format: 'conduit-boq/s0-app-plan/v1', run: ctx.manifest.run,
    ...ctx.manifest.app, apiOrigin: TARGET.api, instructions: 'External helper fsyncs app-<stage>-dispatch.json before each dispatch; no passwords/tokens in receipts. Record each stage before the next business write. app-aborted.json is only for a proved PLANNED operation with no dispatch/outcome proof or changed sessions/graphs; it records NOT RUN.' })
}

async function appRecord(ctx, filename) {
  assert(/^app-(session|created|saved|closed|aborted)\.json$/.test(filename), 'Only a named receipt inside this private output is accepted')
  const receipt = JSON.parse(await checkedFile(join(ctx.output, filename)))
  assertAppReceipt(ctx.manifest, receipt)
  const app = ctx.manifest.app
  if (receipt.stage === 'aborted') {
    const existingProofs = []
    for (const name of APP_DISPATCH_PROOFS) {
      try { await lstat(join(ctx.output, name)); existingProofs.push(name) }
      catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    const actual = sqlRead(`SELECT jsonb_build_object(
      'sessions',COALESCE((SELECT jsonb_agg(id ORDER BY id) FROM auth.sessions WHERE user_id=${ql(app.actor.id)}::uuid),'[]'::jsonb),
      'boqIds',COALESCE((SELECT jsonb_agg(id ORDER BY id) FROM public.boq),'[]'::jsonb),
      'childIds',COALESCE((SELECT jsonb_agg(id ORDER BY id) FROM (SELECT id FROM public.boq_routes UNION ALL SELECT id FROM public.boq_items) q),'[]'::jsonb)
    );`)[0]
    assertAppAbortEvidence(ctx.manifest, existingProofs, actual)
    app.completed = false; app.state = 'CLOSED'
    app.receipts = { aborted: { hash: sha(receipt), recordedAt: new Date().toISOString(), outcome: 'NOT_DISPATCHED' } }
    ctx.manifest.results.push({ label: 'built-s0-only-create-save-reload-calculation-output', status: 'NOT RUN', reason: 'ABORTED_BEFORE_AUTH_DISPATCH' })
    ctx.manifest.acceptance.builtApp = 'NOT RUN'
    await custody(ctx); await save(ctx)
    return
  }
  const dispatchProof = JSON.parse(await checkedFile(join(ctx.output, `app-${receipt.stage}-dispatch.json`)))
  assert.deepEqual(receipt.dispatch, dispatchProof, 'Receipt differs from the separately persisted dispatch proof')
  if (receipt.stage === 'session') {
    assert(ctx.manifest.sessions.length < ctx.manifest.reservationPlan.sessions, 'External session exceeds the planned envelope')
    assert(UUID.test(receipt.sessionId) && !app.beforeSessions.includes(receipt.sessionId) && /^[a-f0-9]{64}$/.test(receipt.tokenHash), 'Not an exact new external fixture session')
    const count = sqlRead(`SELECT count(*) FROM auth.sessions WHERE id=${ql(receipt.sessionId)}::uuid AND user_id=${ql(app.actor.id)}::uuid;`)[0]
    assert.equal(count, 1, 'External session is not owned by the new fixture actor')
    app.sessionId = receipt.sessionId
    ctx.manifest.sessions.push({ userId: app.actor.id, sessionId: receipt.sessionId, tokenHash: receipt.tokenHash, existingOwner: false, external: true, status: 'EXTERNAL_OPEN' })
    app.state = 'SESSION'
  } else if (receipt.stage === 'created') {
    const currentIds = sqlRead("SELECT COALESCE(jsonb_agg(id ORDER BY id),'[]'::jsonb) FROM public.boq;")[0]
    assert.deepEqual(currentIds.filter(id => !app.beforeBoqIds.includes(id)), [receipt.boqId], 'Built-app step created an unexpected additional BOQ')
    const graph = graphRead(receipt.boqId), h = ctx.ready.hierarchies.a1
    assert(graph.header?.created_by === app.actor.id && graph.header.project_name === app.projectName && graph.header.status === 'draft'
      && graph.header.org_id === h.orgId && graph.header.department_id === h.departmentId && graph.header.sector_id === h.sectorId
      && graph.header.price_list_version_id === ctx.ready.catalogVersionId && graph.header.factor_reference_version_id === ctx.ready.factorVersionId,
    'App-created BOQ identity/scope/version mismatch')
    assert(graph.routes.length === 0 && graph.items.length === 0, 'Create unexpectedly included persisted children')
    ctx.manifest.ownedIds.push(receipt.boqId); app.boqId = receipt.boqId; app.state = 'CREATED'
  } else if (receipt.stage === 'saved') {
    const graph = graphRead(app.boqId)
    assert(graph.header?.created_by === app.actor.id && graph.header.project_name === app.projectName && graph.routes.length > 0 && graph.routes.length <= app.routeCap
      && graph.items.length > 0 && graph.items.length <= app.itemCap && Number(graph.header.total_cost) > 0, 'Real built-app positive Save/calculations are missing or outside reserved capacity')
    assert(receipt.savedReload === true && receipt.outputRead === true && receipt.calculationAssertions === true, 'Built-app helper must prove reload/calculation/saved-output reads')
    for (const row of [...graph.routes, ...graph.items]) {
      assert(!app.beforeChildIds.includes(row.id) && !ctx.manifest.ownedIds.includes(row.id) && row.boq_id === app.boqId, 'App cannot adopt an original child')
      ctx.manifest.ownedIds.push(row.id)
    }
    assert(graph.items.every(row => graph.routes.some(route => route.id === row.route_id)), 'App Save has an incomplete route graph')
    app.state = 'SAVED'; app.graphHash = sha(graph)
    ctx.manifest.results.push({ label: 'built-s0-only-create-save-reload-calculation-output', status: 'PASS', routes: graph.routes.length, items: graph.items.length })
  } else {
    assert(receipt.sessionId === app.sessionId, 'External cleanup session changed')
    const remaining = sqlRead(`SELECT (SELECT count(*) FROM auth.sessions WHERE id=${ql(app.sessionId)}::uuid)+(SELECT count(*) FROM auth.refresh_tokens WHERE session_id=${ql(app.sessionId)}::uuid);`)[0]
    assert.equal(remaining, 0, 'External helper has not completed exact scope:local session cleanup')
    ctx.manifest.sessions.find(session => session.sessionId === app.sessionId).status = 'CLOSED'
    const outcome = appAcceptanceOutcome(app, receipt)
    app.completed = outcome === 'PASS'; app.state = 'CLOSED'
    ctx.manifest.acceptance.builtApp = outcome
    if (outcome === 'HOLD') latchHold(ctx.manifest, { code: 'APP_ACCEPTANCE_HOLD' }, 'app-record')
  }
  app.receipts ??= {}; app.receipts[receipt.stage] = { hash: sha(receipt), recordedAt: new Date().toISOString(), dispatchHash: sha(dispatchProof) }
  await custody(ctx); await save(ctx)
}

async function cleanupSessions(ctx) {
  for (const actor of [...ctx.sessions].reverse()) {
    const record = ctx.manifest.sessions.find(session => session.sessionId === actor.sessionId)
    if (record.status === 'CLOSED') continue
    record.status = 'SIGNOUT_SUBMITTED'; record.signoutSubmittedAt = new Date().toISOString(); await save(ctx)
    try {
      const result = await actor.client.auth.signOut({ scope: 'local' })
      if (result.error) throw result.error
      record.status = 'CLOSED'; record.signoutFinishedAt = new Date().toISOString(); await save(ctx)
    } catch (error) { record.status = 'UNKNOWN'; record.error = safeError(error); await save(ctx); throw error }
  }
  const actors = idsSql(ctx.manifest.actors.map(actor => actor.id)), sessionIds = idsSql(ctx.manifest.sessions.map(session => session.sessionId))
  const remaining = sqlRead(`SELECT jsonb_build_object('sessions',(SELECT count(*) FROM auth.sessions WHERE user_id IN (${actors}) OR id IN (${sessionIds})),
    'refreshTokens',(SELECT count(*) FROM auth.refresh_tokens WHERE user_id::text IN (${ctx.manifest.actors.map(actor => ql(actor.id)).join(',')}) OR session_id IN (${sessionIds})));`)[0]
  assert(remaining.sessions === 0 && remaining.refreshTokens === 0, 'Run-owned Auth sessions/refresh tokens remain; never delete them with SQL')
  ctx.manifest.sessionCleanup = { status: 'PASS', ...remaining }
}

export async function runFinalizationBarrier({ metadata: verifyMetadata, custody: verifyCustody, mutate }) {
  assert([verifyMetadata, verifyCustody, mutate].every(callback => typeof callback === 'function'), 'Finalization requires explicit metadata, custody and mutation callbacks')
  await verifyMetadata()
  await verifyCustody()
  return mutate()
}

async function finalize(ctx) {
  assertPhase(ctx.manifest, 'finalize')
  assert(!ctx.manifest.app || ctx.manifest.app.state === 'CLOSED', 'External browser must close its exact new session before finalization')
  return runFinalizationBarrier({ metadata: () => metadata(ctx, 'successor'), custody: () => custody(ctx), mutate: async () => {
    const created = ctx.manifest.actors.filter(actor => actor.created)
    assert(ctx.owner || created.length === 0, 'Existing Admin session must remain in memory; no replacement login')
    const currentProfiles = sqlRead(`SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'role',role,'status',status)),'[]'::jsonb) FROM public.user_profiles WHERE id IN (${idsSql(created.map(actor => actor.id))});`)[0]
    assert.equal(currentProfiles.length, created.length, 'A created fixture is missing its profile')
    const admin = created.find(actor => actor.label === 'admin')
    for (const actor of created.filter(actor => actor.label !== 'admin')) {
      const current = currentProfiles.find(current => current.id === actor.id)
      if (current.status === 'active') {
        assert(ctx.actors.admin, 'Partial run has an active fixture but no retained runtime Admin session')
        await transition(ctx, ctx.actors.admin, actor, 'deactivate', null, 'finalize:' + actor.id)
      }
    }
    if (admin && currentProfiles.find(current => current.id === admin.id)?.status === 'active') await transition(ctx, ctx.owner, admin, 'deactivate', null, 'finalize:' + admin.id)
    await cleanupSessions(ctx)
    const counts = sqlRead(`SELECT jsonb_object_agg(status,n) FROM (SELECT status,count(*) AS n FROM public.user_profiles WHERE id IN (${idsSql(ctx.manifest.actors.map(actor => actor.id))}) GROUP BY status) q;`)[0]
    assertFinalFixtureRetention(ctx.manifest, counts, created.length)
    await custody(ctx)
    ctx.manifest.retained = { profiles: counts, graphs: sqlRead(`SELECT jsonb_build_object('boqs',(SELECT count(*) FROM public.boq WHERE id IN (${idsSql(ctx.manifest.ownedIds)})),
      'routes',(SELECT count(*) FROM public.boq_routes WHERE boq_id IN (${idsSql(ctx.manifest.ownedIds)})),
      'items',(SELECT count(*) FROM public.boq_items WHERE boq_id IN (${idsSql(ctx.manifest.ownedIds)})));`)[0] }
    ctx.manifest.cleanup = { status: 'PASS' }
    ctx.manifest.acceptance.overall = ctx.manifest.hold ? 'HOLD'
      : ctx.manifest.acceptance.core === 'PASS' && ctx.manifest.acceptance.builtApp === 'PASS' ? 'PASS' : 'NOT RUN'
    ctx.manifest.finalized = true; ctx.manifest.phase = 'FINALIZED'; await save(ctx)
  } })
}

async function execute(opt) {
  assert(process.stdin.isTTY === true, 'Execution requires a live interactive TTY before any lock, credential or database access')
  const lockPath = '/private/tmp/s0-target-' + TARGET.db + '.lock'
  const lock = await open(lockPath, 'wx', 0o600).catch(() => { throw new Error('Existing target lock: inspect process/private state; do not steal or auto-resume') })
  await lock.writeFile(JSON.stringify({ pid: process.pid, run: opt.run, target: TARGET.db, startedAt: new Date().toISOString() })); await lock.sync()
  let ctx
  const input = createInterface({ input: process.stdin, output: process.stdout, terminal: false })
  try {
    ctx = await preflight(opt)
    process.stdout.write(JSON.stringify({ status: 'PREFLIGHT_PASS', scenario: SCENARIO, phase: ctx.manifest.phase,
      commands: ['prepare', 'verify', 'app-plan', 'app-record <receipt-file>', 'finalize', 'finish'], ddl: 'FORBIDDEN_ALREADY_APPLIED' }) + '\n')
    for await (const line of input) {
      const [command, ...args] = line.trim().split(/\s+/)
      if (command === 'finish') {
        assert(ctx.manifest.finalized, 'Cannot finish an open run; finalize or retain HOLD/session custody first')
        break
      }
      if (ctx.manifest.finalized || (ctx.manifest.hold && !['finalize', 'app-record'].includes(command))) {
        process.stdout.write(JSON.stringify({ status: 'REJECTED', reason: 'Closed evidence or a latched HOLD prohibits further tests/retries' }) + '\n')
        continue
      }
      if (!['prepare', 'verify', 'finalize', 'app-plan', 'app-record'].includes(command)) {
        process.stdout.write(JSON.stringify({ status: 'REJECTED', reason: 'Only remaining-successor commands are available; no reproduction or DDL' }) + '\n')
        continue
      }
      try {
        assert(!(command === 'finalize' && ctx.manifest.cleanupAttempted && ctx.manifest.cleanup.status === 'HOLD'), 'Failed cleanup requires review, never an automatic retry')
        assert(ctx.sessions.every(session => session.expiresAt > Date.now() + 60_000), 'Session expiry near; HOLD rather than another Owner login')
        if (command === 'app-plan') { assert(args.length === 0, 'Unexpected app-plan argument'); await appPlan(ctx) }
        else if (command === 'app-record') { assert(args.length === 1, 'App record filename required'); await appRecord(ctx, args[0]) }
        else { assert(args.length === 0, 'Unexpected phase argument'); await ({ prepare, verify, finalize })[command](ctx) }
        process.stdout.write(JSON.stringify({ command, status: ctx.manifest.hold ? 'HOLD' : 'PASS', phase: ctx.manifest.phase,
          acceptance: ctx.manifest.acceptance, cleanup: ctx.manifest.cleanup, checks: ctx.manifest.results.length, requests: ctx.manifest.requests, capacity: ctx.manifest.capacity }) + '\n')
      } catch (error) {
        latchHold(ctx.manifest, error, command); await save(ctx)
        process.stdout.write(JSON.stringify({ command, status: 'HOLD', phase: ctx.manifest.phase, error: safeError(error) }) + '\n')
        // The future execution grant must explicitly include this bounded
        // cleanup on a settled core HOLD. No retries, replacement logins,
        // UNKNOWN reconciliation or policy/data undo are performed here.
        if (['prepare', 'verify'].includes(command) && canFinalizeAfterHold(ctx.manifest)) {
          try {
            assert(!ctx.manifest.cleanupAttempted, 'Cleanup is attempted at most once after a core HOLD')
            ctx.manifest.cleanupAttempted = true; await save(ctx)
            assert(ctx.sessions.every(session => session.expiresAt > Date.now() + 60_000), 'Retained cleanup sessions are near expiry')
            await finalize(ctx)
            process.stdout.write(JSON.stringify({ status: 'HOLD', phase: ctx.manifest.phase,
              acceptance: ctx.manifest.acceptance, cleanup: ctx.manifest.cleanup }) + '\n')
            break
          } catch (cleanupError) {
            ctx.manifest.cleanup = { status: 'HOLD', error: safeError(cleanupError) }
            await save(ctx)
            process.stdout.write(JSON.stringify({ status: 'HOLD', cleanup: ctx.manifest.cleanup,
              reason: 'Exact cleanup outcome needs review; no retry or new Owner session' }) + '\n')
          }
        }
      }
    }
    assert(ctx.manifest.finalized, 'stdin ended before finalization; private HOLD retains exact session/intent IDs, no auto-login or SQL cleanup')
    return { status: ctx.manifest.acceptance.overall, phase: ctx.manifest.phase, finalized: true,
      acceptance: ctx.manifest.acceptance, cleanup: ctx.manifest.cleanup, ddl: 'NEVER_EXECUTED_BY_RUNNER' }
  } finally {
    input.close(); await lock.close()
    if (!ctx || ctx.manifest.finalized) await unlink(lockPath)
    // An interrupted open run retains the exclusive lock and private evidence.
  }
}

export async function main(args = process.argv.slice(2)) {
  const opt = options(args)
  if (opt.mode === 'dry-run') return { status: 'DRY_RUN', sideEffects: false, caps: CAPS,
    scenario: SCENARIO, reservations: remainingReservationPlan(),
    command: 'node scripts/test-s0-boq-writer-boundary-local.mjs --execute --scenario successor-remaining --proof-dir /private/tmp/s0-<proof> --output /private/tmp/s0-<fresh-output> --run s0-YYYYMMDD-<name>',
    phases: ['exact successor preflight', 'prepare', 'remaining verify', 'built-app', 'finalize', 'finish'],
    limits: ['no Auth/fixture execution without a new explicit grant including settled-HOLD cleanup', 'no predecessor/DDL/Production/reset/replay/old runs',
      'one existing Admin session in memory', 'three named fresh-edge NOT RUN limits remain', 'built-app/browser checks performed separately'] }
  return execute(opt)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(result => {
    process.stdout.write(JSON.stringify(result) + '\n')
    if (['HOLD', 'NOT RUN'].includes(result.status)) process.exitCode = 1
  }).catch(error => {
    process.stdout.write(JSON.stringify({ status: 'HOLD', error: safeError(error) }) + '\n'); process.exitCode = 1
  })
}
