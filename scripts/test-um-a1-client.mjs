import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

// This integration runner uses only fake in-memory Auth/Data responses. It never
// loads env files, invokes the fixture harness, Docker, SQL, or a real backend.
const argv = process.argv.slice(2)
assert(argv.every(value => ['--run', '--help', '--plan'].includes(value)), 'Only --run, --plan, and --help are supported')
if (!argv.includes('--run')) {
  console.log(JSON.stringify({ mode: 'DRY RUN', writes: 'Temporary source copy and QA artifacts only',
    command: 'node scripts/test-um-a1-client.mjs --run',
    runtime: 'Installed Playwright, or UM_A1_PLAYWRIGHT_MODULE pointing to an installed module',
    backend: 'Fresh loopback in-memory fake API; no real credentials, fixtures, DB, or Production' }, null, 2))
  process.exit(0)
}
const protectedPath = value => /conduit-boq-archive|\.private-local-archive|\.codex\/worktrees\/1ede\/conduit-boq/.test(value)
async function requireUnprotected(path) {
  assert(!protectedPath(path), 'Protected archive paths cannot be used by this runner')
  let ancestor = path
  for (;;) {
    try { assert(!protectedPath(await realpath(ancestor)), 'A configured path resolves into protected archive custody'); return }
    catch (error) { if (error.code !== 'ENOENT') throw error; ancestor = dirname(ancestor) }
  }
}
const requestedRoot = resolve(process.env.UM_A1_SOURCE_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), '..'))
await requireUnprotected(requestedRoot)
const ROOT = await realpath(requestedRoot)
const OUT = process.env.UM_A1_QA_OUTPUT ? resolve(process.env.UM_A1_QA_OUTPUT) : await mkdtemp(join(tmpdir(), 'um-a1-client.'))
await requireUnprotected(OUT)
await mkdir(OUT, { recursive: true, mode: 0o700 })
const APP = join(OUT, 'source')
await mkdir(APP, { recursive: true })
const sourceHashes = {}
for (const name of ['app', 'components', 'lib', 'public', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json', 'next-env.d.ts', 'package.json']) {
  await cp(join(ROOT, name), join(APP, name), { recursive: true, filter: async path => {
    if (/(^|\/)\.env(?:\.|$)/.test(path)) return false
    assert(!(await lstat(path)).isSymbolicLink(), 'Source copy does not adopt symlinked assets or source')
    return true
  } })
}
async function hashSources(path, prefix = '') {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const rel = join(prefix, entry.name), absolute = join(path, entry.name)
    if (entry.isDirectory()) await hashSources(absolute, rel)
    else if (entry.isFile()) sourceHashes[rel] = createHash('sha256').update(await readFile(absolute)).digest('hex')
  }
}
await hashSources(APP)
await symlink(join(ROOT, 'node_modules'), join(APP, 'node_modules'), 'dir')
const report = { mode: 'MOCKED CLIENT INTEGRATION', startedAt: new Date().toISOString(),
  runnerSha256: createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),
  sourceRoot: ROOT, sourceHashes, browserAvailability: 'Browser plugin not available; installed Playwright fallback',
  noEnvironmentFiles: true, fakeBackendOnly: true, cases: [], unknownRequests: [], blockedBrowserOrigins: [], pageErrors: [],
  consoleMessages: [],
  limits: ['Actual Next development runtime and AuthProvider/AdminPage; all Auth/Data responses are synthetic',
    'No DB/API/Auth fixture harness, original local credential, Docker, or Production access',
    'Node non-loopback network is denied; existing next/font may use its development fallback',
    'Screenshots establish rendered behavioral states, not NT font/CI or Production acceptance'] }
const uid = n => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
const A = uid(1), B = uid(2), ORG = uid(9000), DEPT = uid(9001), SECTOR = uid(9002)
const mutationNames = new Set(['admin_approve_user', 'admin_reject_user', 'admin_set_user_role', 'admin_deactivate_user', 'admin_suspend_user', 'admin_reactivate_user'])
const timestamp = '2026-11-01T00:00:00.123456+00:00'
const profile = (n, extra = {}) => ({ id: uid(n), email: `client-${n}@example.invalid`, employee_id: null, title: null,
  first_name: 'ผู้ทดสอบ', last_name: String(n), position: null, phone: null, signature_url: null,
  role: 'staff', status: 'active', org_id: null, department_id: null, sector_id: null,
  requested_department_id: null, requested_sector_id: null, approved_at: null, approved_by: null,
  rejected_at: null, rejected_by: null, admin_note: null, onboarding_completed: false,
  created_at: timestamp, updated_at: timestamp, ...extra })
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
function deferred() { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
function deadline(promise, label, milliseconds = 15_000) {
  let timer
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), milliseconds)
  })]).finally(() => clearTimeout(timer))
}
let model
function resetModel() {
  model = { rows: [...Array.from({ length: 52 }, (_, i) => profile(100 + i)), profile(1, { role: 'admin' }), profile(2, { role: 'admin' })]
    .sort((x, y) => y.id.localeCompare(x.id)), requests: [], mutations: [], holds: [], nextMutation: null, nextDirectoryError: false }
  model.rows.find(row => row.id === uid(150)).status = 'pending'
  Object.assign(model.rows.find(row => row.id === uid(150)), { onboarding_completed: true, requested_department_id: DEPT, requested_sector_id: SECTOR })
}
function holdNext(kind, actor = null) {
  const hit = deferred(), released = deferred(), hold = { kind, actor, hit, released, used: false }
  model.holds.push(hold)
  return { get hit() { return deadline(hit.promise, `held ${kind} request`) }, release: () => released.resolve() }
}
async function maybeHold(kind, entry) {
  const hold = model.holds.find(item => !item.used && item.kind === kind && (!item.actor || item.actor === entry.actor))
  if (hold) { hold.used = true; hold.hit.resolve(entry); await hold.released.promise }
}
function tokenActor(token) {
  try { return JSON.parse(Buffer.from(token.replace(/^Bearer /, '').split('.')[1], 'base64url')).sub } catch { return null }
}
function authUser(actor) { return { id: actor, email: model.rows.find(row => row.id === actor)?.email, aud: 'authenticated', role: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: timestamp } }
function session(actor) {
  const now = Math.floor(Date.now() / 1000), header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sub: actor, aud: 'authenticated', role: 'authenticated', exp: now + 3600, iat: now, session_id: uid(9999) })).toString('base64url')
  return { access_token: `${header}.${payload}.synthetic-client-integration`, refresh_token: 'synthetic-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, user: authUser(actor) }
}
const api = createServer(async (req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Content-Type': 'application/json' }
  const send = (status, body) => { res.writeHead(status, cors); res.end(JSON.stringify(body)) }
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return }
  try {
    const url = new URL(req.url, 'http://127.0.0.1'), chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString(), args = raw ? JSON.parse(raw) : {}
    const actor = tokenActor(req.headers.authorization ?? ''), name = url.pathname.split('/').at(-1)
    const entry = { path: url.pathname, method: req.method, actor, args: url.pathname.includes('/auth/') ? null : args, at: Date.now() }
    model.requests.push(entry)
    if (url.pathname === '/auth/v1/user' && req.method === 'GET') { assert(actor === A || actor === B); send(200, authUser(actor)); return }
    if (url.pathname === '/auth/v1/token' && req.method === 'POST') { send(200, session(actor ?? A)); return }
    if (url.pathname === '/auth/v1/logout' && req.method === 'POST') { res.writeHead(204, cors); res.end(); return }
    if (url.pathname.startsWith('/rest/v1/rpc/') && req.method === 'POST') {
      if (name === 'get_my_profile_v2') { await maybeHold('profile', entry); send(200, [model.rows.find(row => row.id === actor)]); return }
      if (name === 'is_signup_email_allowed') { send(200, true); return }
      if (name === 'get_my_catalog_admin_gate') { send(200, [{ configuration_valid: true, admin_enabled: true }]); return }
      if (name === 'get_admin_profiles_page') {
        await maybeHold('directory', entry)
        if (model.nextDirectoryError) { model.nextDirectoryError = false; send(503, { code: 'MOCK_READ_UNAVAILABLE', message: 'Synthetic read fault' }); return }
        const current = model.rows.find(row => row.id === actor)
        const rows = current?.role === 'admin' && current.status === 'active'
          ? model.rows.filter(row => !args.p_cursor_id || row.id < args.p_cursor_id).slice(0, Math.min(Number(args.p_limit ?? 25), 100)) : []
        send(200, rows); return
      }
      if (mutationNames.has(name)) {
        const command = { ...entry, requestId: args.p_request_id, executed: false }
        model.mutations.push(command); await maybeHold('mutation', entry)
        const target = model.rows.find(row => row.id === args.p_target_id), current = model.rows.find(row => row.id === actor)
        if (!target || current?.role !== 'admin' || current.status !== 'active') { send(403, { code: '42501', message: 'Synthetic denial' }); return }
        if (name === 'admin_set_user_role') target.role = args.p_new_role
        else if (name === 'admin_reject_user') { target.status = 'pending'; target.admin_note = args.p_reason; target.rejected_at = timestamp; target.rejected_by = actor }
        else target.status = ({ admin_approve_user: 'active', admin_deactivate_user: 'inactive', admin_suspend_user: 'suspended', admin_reactivate_user: 'active' })[name]
        command.executed = true
        const mode = model.nextMutation; model.nextMutation = null
        send(mode === 'unknown' ? 503 : 200, mode === 'unknown' ? { code: 'MOCK_UNCERTAIN', message: 'Synthetic response uncertainty after execution' } : null); return
      }
    }
    if (req.method === 'GET' && ['organizations', 'departments', 'sectors'].includes(name)) {
      send(200, [{ id: name === 'organizations' ? ORG : name === 'departments' ? DEPT : SECTOR, name: `Synthetic ${name}`, code: 'MOCK', full_name: `Synthetic ${name}` }]); return
    }
    report.unknownRequests.push({ path: url.pathname, method: req.method }); send(599, { message: 'Unrecognized mock request; no forwarding exists' })
  } catch (error) { report.unknownRequests.push({ path: req.url, error: error.message }); if (!res.headersSent) send(599, { message: 'Mock request failed closed' }) }
})
resetModel()
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve))
const API = `http://127.0.0.1:${api.address().port}`
const probe = createServer(); await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve)); const webPort = probe.address().port; await new Promise(resolve => probe.close(resolve))
const WEB = `http://127.0.0.1:${webPort}`
report.environment = { api: API, web: WEB, node: process.version, viewport: { width: 1280, height: 900 } }
const guardPath = join(OUT, 'network-guard.cjs')
await writeFile(guardPath, `const http=require('node:http'),https=require('node:https');
function local(value){return value==='127.0.0.1'||value==='localhost'||value==='::1'||value==='[::1]';}
function check(args){const v=args[0];let host;if(typeof v==='string'||v instanceof URL){if(String(v).startsWith('/'))return;host=new URL(v).hostname;}else host=v?.hostname||v?.host||'localhost';if(!local(host)){process.stderr.write('UM_A1_EXTERNAL_DENIED '+host+'\\n');throw new Error('UM-A1 isolated runtime denied nonloopback network');}}
for(const mod of [http,https])for(const key of ['request','get']){const old=mod[key];mod[key]=function(...args){check(args);return old.apply(this,args);};}
const oldFetch=globalThis.fetch;globalThis.fetch=function(input,...rest){const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!local(url.hostname)){process.stderr.write('UM_A1_EXTERNAL_DENIED '+url.hostname+'\\n');return Promise.reject(new Error('UM-A1 isolated runtime denied nonloopback fetch'));}return oldFetch(input,...rest);};
`)
const nextLog = []
const child = spawn(process.execPath, [join(ROOT, 'node_modules/next/dist/bin/next'), 'dev', APP, '--webpack', '-H', '127.0.0.1', '-p', String(webPort)], {
  cwd: APP, env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR, LANG: 'en_US.UTF-8',
    NODE_OPTIONS: `--require=${guardPath}`, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_SUPABASE_URL: API,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-client-integration-anon-key', APP_ENV: 'local', NEXT_PUBLIC_APP_ENV: 'local' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
child.stdout.on('data', data => nextLog.push(data.toString())); child.stderr.on('data', data => nextLog.push(data.toString()))
let browser
const contexts = []
async function waitUntil(check, label, ms = 15_000) {
  const limit = Date.now() + ms
  while (Date.now() < limit) { if (await check()) return; await delay(40) }
  throw new Error(`Timed out: ${label}`)
}
async function cookie(context, actor) {
  const value = 'base64-' + Buffer.from(JSON.stringify(session(actor))).toString('base64url')
  await context.addCookies([{ name: 'sb-127-auth-token', value, url: WEB, sameSite: 'Lax' }])
}
async function open() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } }); contexts.push(context)
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if ([API, WEB].includes(url.origin)) return route.continue()
    report.blockedBrowserOrigins.push(url.origin); return route.abort()
  })
  await cookie(context, A)
  const page = await context.newPage(); page.setDefaultTimeout(10_000)
  page.on('pageerror', error => report.pageErrors.push(error.message))
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) report.consoleMessages.push({ type: message.type(), text: message.text() })
  })
  const state = { page, context, actor: A, dialogMode: 'accept', dialogs: [] }
  page.on('dialog', async dialog => { state.dialogs.push({ type: dialog.type(), message: dialog.message() });
    if (state.dialogMode === 'cancel') await dialog.dismiss()
    else await dialog.accept(dialog.type() === 'prompt' ? 'Synthetic client integration reason' : undefined)
  })
  await page.goto(WEB + '/admin', { timeout: 90_000 }); await ready(state)
  await page.evaluate(() => {
    window.__uma1Announcements = []
    const capture = () => { const values = [...document.querySelectorAll('section [aria-live="polite"]')].map(node => node.textContent);
      const text = values.join('|'); if (text && window.__uma1Announcements.at(-1) !== text) window.__uma1Announcements.push(text) }
    new MutationObserver(capture).observe(document.body, { childList: true, subtree: true, characterData: true }); capture()
  })
  return state
}
async function ready(s) {
  await s.page.locator('[data-admin-user-id]').first().waitFor()
  await s.page.waitForFunction(() => document.querySelector('section[aria-labelledby="admin-user-directory-heading"]')?.getAttribute('aria-busy') === 'false')
  await s.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await s.page.getByText('กำลังตรวจสถานะเครื่องมือ Master Catalog', { exact: true }).count(), 0, 'A ready authorized directory must finish its initial Catalog projection')
}
async function refresh(s, label = 'โหลดใหม่') { await s.page.getByRole('button', { name: label, exact: true }).click(); await ready(s) }
async function switchActor(s, actor, role = 'admin') {
  const from = model.requests.length, previousActor = s.actor
  model.rows.find(row => row.id === actor).role = role
  await cookie(s.context, actor)
  const value = session(actor)
  await s.page.evaluate(value => { const channel = new BroadcastChannel('sb-127-auth-token'); channel.postMessage({ event: 'SIGNED_IN', session: value }); channel.close() }, value)
  s.actor = actor
  if (role !== 'admin') await s.page.getByRole('heading', { name: 'ไม่มีสิทธิ์เข้าถึง', exact: true }).waitFor()
  else {
    await waitUntil(() => model.requests.slice(from).some(entry => entry.actor === actor && entry.path.endsWith('/get_my_profile_v2')), 'fresh actor profile refresh')
    if (previousActor !== actor) await waitUntil(() => model.requests.slice(from).some(entry => entry.actor === actor && entry.path.endsWith('/get_admin_profiles_page')), 'fresh actor directory read')
    await s.page.getByRole('heading', { name: 'ทะเบียนผู้ใช้งาน', exact: true }).waitFor()
    assert.equal(await s.page.getByRole('heading', { name: 'ไม่มีสิทธิ์เข้าถึง', exact: true }).count(), 0)
  }
}
const row = (s, id) => s.page.locator(`[data-admin-user-id="${id}"]`)
async function status(s, id, name) { await row(s, id).getByRole('combobox').click(); await s.page.getByRole('option', { name, exact: true }).click() }
async function noCommands(s) {
  const enabled = await s.page.locator('[data-admin-user-id] button').evaluateAll(nodes => nodes.filter(node =>
    /เปลี่ยนบทบาทของ|สถานะบัญชีของ|^อนุมัติ |^ส่งกลับแก้ไข /.test(node.getAttribute('aria-label') ?? '') && !node.disabled && node.getAttribute('aria-disabled') !== 'true').length)
  assert.equal(enabled, 0, 'Authority commands must remain unavailable')
}
async function warning(s, count) {
  await s.page.waitForFunction(count => {
    const text = document.querySelector('[data-admin-unresolved-commands]')?.textContent ?? ''
    return text.includes(`ไม่ได้ ${count} รายการ`)
  }, count)
  assert.match(await s.page.locator('[data-admin-unresolved-commands]').innerText(), new RegExp(`ไม่ได้ ${count} รายการ`))
}
async function directoryBudget(from) {
  const entries = model.requests.slice(from)
  assert.equal(entries.filter(entry => entry.path.endsWith('/get_admin_profiles_page')).length, 1, 'Each read attempt uses one directory RPC')
  for (const name of ['organizations', 'departments', 'sectors']) assert(entries.filter(entry => entry.path.endsWith('/' + name)).length <= 1, 'At most one scoped reference batch per table')
}
async function runCase(name, fn) {
  resetModel(); const record = { name, status: 'RUNNING', startedAt: new Date().toISOString() }; report.cases.push(record)
  let s
  try { s = await open(); await fn(s, record); record.status = 'PASS' }
  catch (error) { record.status = 'FAIL'; record.failure = { name: error.name, message: error.message, stack: error.stack }; if (s) await s.page.screenshot({ path: join(OUT, `${report.cases.length}-failure.png`) }).catch(() => {}) }
  finally {
    for (const hold of model.holds) hold.released.resolve()
    record.requests = model.requests.map(entry => ({ path: entry.path, method: entry.method, actor: entry.actor, args: entry.args })); record.mutations = model.mutations
    record.finishedAt = new Date().toISOString()
    if (s) await s.context.close()
    await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 })
    console.log(JSON.stringify({ case: name, status: record.status, failure: record.failure?.message }))
  }
}
try {
  await waitUntil(async () => { try { return (await fetch(WEB + '/favicon.svg')).ok } catch { return false } }, 'isolated Next startup', 60_000)
  const moduleName = process.env.UM_A1_PLAYWRIGHT_MODULE ?? 'playwright'
  const { chromium } = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName)
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  await runCase('Next Back Refresh announce loading and page-specific 25-row results; bounded read batches', async s => {
    assert.equal(await s.page.locator('[data-admin-user-id]').count(), 25)
    for (const [button, pageNumber] of [['ถัดไป', 2], ['ก่อนหน้า', 1], ['โหลดใหม่', 1]]) {
      const from = model.requests.length
      await s.page.evaluate(() => { window.__uma1Announcements = [] })
      await refresh(s, button); assert.equal(await s.page.locator('[data-admin-user-id]').count(), 25)
      const announcements = await s.page.evaluate(() => window.__uma1Announcements)
      assert(announcements.some(text => text.includes('กำลังโหลดทะเบียน')), 'Loading is announced for each new attempt')
      assert(announcements.some(text => text.includes(`โหลดทะเบียนหน้าที่ ${pageNumber} แล้ว หน้านี้ 25 คน`)), 'Successful result names the current page')
      await directoryBudget(from)
    }
    await s.page.screenshot({ path: join(OUT, 'desktop-directory.png') })
    await s.page.setViewportSize({ width: 390, height: 844 }); assert.equal(await s.page.locator('[data-admin-user-id]').count(), 25)
    await s.page.screenshot({ path: join(OUT, 'mobile-directory.png') })
  })
  await runCase('Cancel produces zero RPC; approve double-click sends one command', async s => {
    s.dialogMode = 'cancel'; await row(s, uid(150)).getByRole('button', { name: /^อนุมัติ / }).click(); await delay(100); assert.equal(model.mutations.length, 0)
    s.dialogMode = 'accept'; await row(s, uid(150)).getByRole('button', { name: /^อนุมัติ / }).dblclick(); await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).waitFor()
    assert.equal(model.mutations.length, 1); assert.equal(model.mutations[0].path.split('/').at(-1), 'admin_approve_user')
  })
  await runCase('Actor change during held mutation authorization sends zero mutation RPC', async s => {
    const authorization = holdNext('profile', A); await status(s, uid(151), 'ไม่ใช้งาน'); await authorization.hit
    await switchActor(s, B); await ready(s); authorization.release(); await delay(150)
    assert.equal(model.mutations.length, 0)
  })
  await runCase('Held-before-execution success survives same UUID Admin staff Admin; fresh post-settlement read gates controls', async s => {
    const mutation = holdNext('mutation', A); await status(s, uid(151), 'ไม่ใช้งาน'); await mutation.hit
    assert.equal(model.mutations.length, 1); assert.equal(model.mutations[0].executed, false)
    await switchActor(s, A, 'staff'); await switchActor(s, A, 'admin'); await delay(150); await noCommands(s)
    const reread = holdNext('directory', A); mutation.release(); await reread.hit; await noCommands(s)
    reread.release(); await ready(s); await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).waitFor()
    assert.equal(model.mutations.length, 1); assert.equal(model.rows.find(value => value.id === uid(151)).status, 'inactive')
    assert.match(await row(s, uid(151)).innerText(), /ไม่ใช้งาน/)
  })
  await runCase('Held-before-execution timeout retains same UUID UNKNOWN and requires fresh read after late settlement', async s => {
    const mutation = holdNext('mutation', A); await status(s, uid(151), 'ไม่ใช้งาน'); await mutation.hit
    await switchActor(s, A, 'staff'); await switchActor(s, A, 'admin'); await delay(150); await noCommands(s)
    await s.page.locator('[data-admin-unresolved-commands]').waitFor({ timeout: 23_000 }); await warning(s, 1)
    assert.equal(model.mutations.length, 1); assert.equal(model.mutations[0].executed, false)
    await ready(s); await refresh(s); await warning(s, 1)
    assert.equal(model.mutations[0].executed, false, 'Explicit read must not execute the held command')
    await status(s, uid(149), 'ไม่ใช้งาน'); await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).waitFor()
    await warning(s, 1)
    const reread = holdNext('directory', A); mutation.release(); await reread.hit; await noCommands(s)
    assert.equal(await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).count(), 1, 'Late outcome A keeps command B notice while the fresh read is held')
    reread.release(); await ready(s)
    assert.equal(model.mutations.length, 2); assert.match(await row(s, uid(151)).innerText(), /ไม่ใช้งาน/)
    await s.page.waitForFunction(() => !document.querySelector('[data-admin-unresolved-commands]'))
    assert.equal(await s.page.getByText('ยังยืนยันผลการดำเนินการไม่ได้ กรุณาโหลดสถานะล่าสุดก่อนทบทวนคำสั่งใหม่ ผลคำสั่งเดิมยังไม่ยืนยัน', { exact: true }).count(), 0, 'Observed late 2xx resolves its exact UUID without a stale uncertainty notice')
    assert.equal(await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).count(), 1, 'Late outcome A cannot clear same-actor command B success notice')
  })
  await runCase('Two UNKNOWN UUIDs on one target survive read, navigation and unrelated confirmed command', async s => {
    model.nextMutation = 'unknown'; await status(s, uid(151), 'ไม่ใช้งาน'); await warning(s, 1)
    await refresh(s); model.nextMutation = 'unknown'; await status(s, uid(151), 'ใช้งาน'); await warning(s, 2)
    assert.notEqual(model.mutations[0].requestId, model.mutations[1].requestId)
    await refresh(s); await refresh(s, 'ถัดไป'); assert.equal(await row(s, uid(151)).count(), 0)
    await status(s, uid(125), 'ไม่ใช้งาน'); await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).waitFor(); await warning(s, 2)
    await s.page.screenshot({ path: join(OUT, 'retained-unknown-history.png') })
  })
  await runCase('Actual actor A B A epoch prevents an old held outcome publishing into the new workspace', async s => {
    const mutation = holdNext('mutation', A); await status(s, uid(151), 'ไม่ใช้งาน'); await mutation.hit
    await switchActor(s, B); await ready(s); await switchActor(s, A); await ready(s)
    const before = model.requests.filter(entry => entry.path.endsWith('/get_admin_profiles_page')).length
    mutation.release(); await delay(250)
    assert.equal(model.requests.filter(entry => entry.path.endsWith('/get_admin_profiles_page')).length, before, 'Obsolete outcome must not initiate a read in a newer actor epoch')
    assert.equal(await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).count(), 0)
    await refresh(s); assert.match(await row(s, uid(151)).innerText(), /ไม่ใช้งาน/)
  })
  await runCase('Old actor A held outcome cannot overwrite actor B confirmed-command notice', async s => {
    const mutation = holdNext('mutation', A); await status(s, uid(151), 'ไม่ใช้งาน'); await mutation.hit
    await switchActor(s, B); await ready(s)
    await status(s, uid(149), 'ไม่ใช้งาน'); await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).waitFor()
    const before = model.requests.filter(entry => entry.path.endsWith('/get_admin_profiles_page')).length
    mutation.release(); await delay(250)
    assert.equal(model.requests.filter(entry => entry.path.endsWith('/get_admin_profiles_page')).length, before)
    assert.equal(await s.page.getByText('ดำเนินการสำเร็จและโหลดข้อมูลล่าสุดแล้ว', { exact: true }).count(), 1)
    assert.match(await row(s, uid(149)).innerText(), /ไม่ใช้งาน/)
  })
  await runCase('Known success plus canonical read failure stays success and read retry adds no command', async s => {
    model.nextDirectoryError = true; await status(s, uid(151), 'ไม่ใช้งาน')
    await s.page.getByText('ดำเนินการสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ', { exact: true }).waitFor(); assert.equal(model.mutations.length, 1)
    await noCommands(s); await refresh(s, 'ลองโหลดอีกครั้ง'); assert.equal(model.mutations.length, 1); assert.match(await row(s, uid(151)).innerText(), /ไม่ใช้งาน/)
  })
  assert.equal(report.unknownRequests.length, 0, 'All API requests must be explicitly mocked')
  assert.equal(report.blockedBrowserOrigins.length, 0, 'No browser external origin should be attempted')
  assert.equal(report.pageErrors.length, 0, 'No uncaught browser errors')
  report.status = report.cases.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL'
} catch (error) { report.status = 'FAIL'; report.failure = { name: error.name, message: error.message, stack: error.stack } }
finally {
  for (const context of contexts) await context.close().catch(() => {})
  await browser?.close(); child.kill('SIGTERM')
  await new Promise(resolve => { if (child.exitCode !== null) resolve(); else { child.once('exit', resolve); setTimeout(resolve, 3000) } })
  api.closeAllConnections(); await new Promise(resolve => api.close(resolve))
  report.finishedAt = new Date().toISOString()
  report.deniedNodeNetworkHosts = [...new Set(nextLog.join('').match(/UM_A1_EXTERNAL_DENIED ([^\s]+)/g) ?? [])]
  await writeFile(join(OUT, 'next.log'), nextLog.join(''), { mode: 0o600 })
  await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 })
  console.log(JSON.stringify({ status: report.status, evidence: OUT, cases: report.cases.length, passed: report.cases.filter(item => item.status === 'PASS').length }))
  if (report.status !== 'PASS') process.exitCode = 1
}
