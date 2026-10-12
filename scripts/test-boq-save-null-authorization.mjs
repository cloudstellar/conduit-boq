import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// This runner creates its own network-disabled PostgreSQL container. It never
// connects to an existing application database or replays migrations 027-029.
const REPO = fileURLToPath(new URL('../', import.meta.url))
const IMAGE = 'public.ecr.aws/supabase/postgres:17.6.1.136'
const IMAGE_ID = 'sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00'
const PG_BIN = '/nix/var/nix/profiles/default/bin'
const LABEL = 'io.cloudstellar.conduit-boq.save-null-auth'
const SIGNATURE = 'public.save_boq_with_routes(uuid,jsonb,jsonb)'
const PRE_SHA256 = 'aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9'
const POST_SHA256 = '929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506'
const DATABASE_PATTERN = /^conduit_boq_save_null_auth_[a-z0-9_]+$/
const INPUTS = {
  fixture: 'tests/sql/boq-save-null-authorization-fixture.sql',
  smoke: 'tests/sql/boq-save-null-authorization-smoke.sql',
  migration: 'migrations/030_boq_save_null_authorization_guard.sql',
}
const hash = text => createHash('sha256').update(text).digest('hex')

const SNAPSHOT_SQL = `
SELECT jsonb_build_object(
  'definition', pg_get_functiondef(p.oid),
  'procedure', to_jsonb(p),
  'metadata', to_jsonb(p) - 'prosrc',
  'tableSecurity', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', c.relname, 'owner', pg_get_userbyid(c.relowner),
      'acl', c.relacl, 'rowSecurity', c.relrowsecurity, 'forceRowSecurity', c.relforcerowsecurity,
      'columnAcls', (SELECT COALESCE(jsonb_agg(jsonb_build_object('column', a.attname, 'acl', a.attacl) ORDER BY a.attnum), '[]'::jsonb)
        FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped),
      'policies', (SELECT COALESCE(jsonb_agg(to_jsonb(policy) ORDER BY policy.polname), '[]'::jsonb)
        FROM pg_policy policy WHERE policy.polrelid = c.oid)
    ) ORDER BY c.relname)
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN ('boq', 'boq_routes', 'boq_items', 'price_list', 'user_profiles')
  ),
  'publicSchemaAcl', (SELECT nspacl FROM pg_namespace WHERE nspname = 'public'),
  'graph', jsonb_build_object(
    'boq', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM public.boq t),
    'boq_routes', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM public.boq_routes t),
    'boq_items', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM public.boq_items t),
    'price_list', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM public.price_list t),
    'user_profiles', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM public.user_profiles t)
  )
)
FROM pg_proc p WHERE p.oid = '${SIGNATURE}'::regprocedure;
`

function run() {
  const args = process.argv.slice(2)
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node scripts/test-boq-save-null-authorization.mjs\n' +
      'Uses only the already-cached pinned PostgreSQL image on the selected local Unix Docker socket.\n' +
      'Creates one unique container with --network none, no ports or bind mounts, and synthetic databases.\n' +
      'Tests predecessor bypasses, drift rejection, migration 030, fixed authorization, and replay rejection.\n' +
      'Stops only its own labelled container; bounded receipts remain in an OS temporary directory.')
    return
  }
  assert.equal(args.length, 0, 'No endpoint, image, container, or database overrides are accepted')
  const sources = Object.fromEntries(Object.entries(INPUTS).map(([key, path]) => [key, readFileSync(join(REPO, path), 'utf8')]))
  const receiptDir = mkdtempSync(join(tmpdir(), 'conduit-boq-save-null-auth-'))
  const token = randomUUID()
  const suffix = token.replaceAll('-', '').slice(0, 12)
  const containerName = `conduit-boq-save-null-auth-${suffix}`
  const database = `conduit_boq_save_null_auth_${suffix}`
  const env = { ...process.env }
  // Context discovery reads local Docker configuration. No daemon command may
  // inherit a remote endpoint or silently switch context through environment.
  for (const key of ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']) delete env[key]
  let endpoint = null
  let containerId = null
  let creationAttempted = false
  let interrupted = false
  let commandNumber = 0
  let failure = null
  const receipt = {
    version: 1, status: 'running', startedAt: new Date().toISOString(),
    image: IMAGE, imageId: IMAGE_ID, containerName, database,
    inputHashes: Object.fromEntries(Object.entries(sources).map(([key, text]) => [INPUTS[key], hash(text)])),
    environment: 'new isolated network-none PostgreSQL container with synthetic data',
    existingApplicationDatabaseTouched: false, productionTouched: false,
    checks: [], cleanup: { confirmedRemoved: false },
  }
  const saveReceipt = () => writeFileSync(join(receiptDir, 'receipt.json'), JSON.stringify(receipt, null, 2), { mode: 0o600 })
  const signalHandler = () => { interrupted = true }
  process.on('SIGINT', signalHandler)
  process.on('SIGTERM', signalHandler)
  console.log(`Isolated BOQ Save authorization receipts: ${receiptDir}`)

  function execute(args, { input, timeout = 30000, allowFailure = false, cleanup = false } = {}) {
    if (interrupted && !cleanup) throw new Error('Interrupted; cleaning up only this run\'s container')
    const result = spawnSync('docker', args, { env, input, encoding: 'utf8', timeout, maxBuffer: 4 * 1024 * 1024 })
    const stdout = result.stdout || ''
    const stderr = result.stderr || ''
    const log = {
      args, status: result.status, signal: result.signal,
      error: result.error?.message ?? null,
      stdout: stdout.slice(0, 1024 * 1024), stderr: stderr.slice(0, 1024 * 1024),
      outputTruncated: stdout.length > 1024 * 1024 || stderr.length > 1024 * 1024,
    }
    writeFileSync(join(receiptDir, `${String(++commandNumber).padStart(3, '0')}-command.json`), JSON.stringify(log, null, 2), { mode: 0o600 })
    if (result.error || result.signal || (result.status !== 0 && !allowFailure)) {
      throw new Error(`Docker command failed (${args[0]}): ${result.error?.message || stderr.slice(-2000) || result.signal || result.status}`)
    }
    return { status: result.status, stdout, stderr }
  }
  function docker(args, options) {
    assert.ok(endpoint?.startsWith('unix:///'), 'A verified local Unix Docker endpoint is required')
    return execute(['--host', endpoint, ...args], options)
  }
  function assertDatabase(name) {
    assert.ok(DATABASE_PATTERN.test(name) && name.startsWith(database) && name.length <= 63, 'Only this run\'s isolated database names are accepted')
  }
  function sql(name, text, options = {}) {
    assertDatabase(name)
    assert.match(containerId || '', /^[0-9a-f]{64}$/)
    return docker(['exec', '-i', containerId, `${PG_BIN}/psql`, '-X', '-h', '/tmp', '-U', 'postgres', '-d', name,
      '-v', 'ON_ERROR_STOP=1', '-A', '-t', ...(options.variables || []).flatMap(value => ['-v', value])], { input: text, ...options })
  }
  function snapshot(name, label) {
    const state = JSON.parse(sql(name, SNAPSHOT_SQL).stdout.trim())
    assert.ok(state?.definition && state.procedure && state.metadata && state.graph && state.tableSecurity?.length === 5, 'Snapshot must include full function metadata, table security, and every synthetic table')
    const result = { ...state, definitionSha256: hash(state.definition), snapshotSha256: hash(JSON.stringify(state)) }
    writeFileSync(join(receiptDir, `${label}-snapshot.json`), JSON.stringify(result, null, 2), { mode: 0o600 })
    return result
  }
  function smoke(mode) {
    const result = sql(database, sources.smoke, { variables: [`test_mode=${mode}`], timeout: 45000 })
    const marker = `BOQ_SAVE_NULL_AUTH_${mode.toUpperCase()}_PASS`
    const summaries = result.stdout.split('\n').filter(line => line.startsWith(`${marker}|`))
    assert.equal(summaries.length, 1, `Expected one ${marker} summary after all smoke assertions`)
    const counts = summaries[0].split('|').slice(1).map(Number)
    assert.equal(counts.length, 4)
    assert.ok(counts.every(value => Number.isSafeInteger(value) && value >= 0), 'Smoke counts must be finite non-negative integers')
    const [cases, allowed, denied, observedBaselineBypasses] = counts
    assert.ok(cases > 0)
    assert.equal(allowed + denied, cases)
    assert.equal(observedBaselineBypasses, mode === 'baseline' ? 3 : 0)
    console.log(summaries[0])
    return { cases, allowed, denied, observedBaselineBypasses }
  }
  function assertRejected(name, label, expectedMessage) {
    const before = snapshot(name, `${label}-before`)
    const result = sql(name, sources.migration, { allowFailure: true })
    assert.notEqual(result.status, 0, `${label}: migration must fail closed`)
    assert.ok(result.stderr.includes(expectedMessage), `${label}: unexpected rejection: ${result.stderr.slice(-1000)}`)
    const after = snapshot(name, `${label}-after`)
    assert.deepEqual(after, before, `${label}: a rejected migration changed function metadata or synthetic graph`)
    receipt.checks.push({ name: label, passed: true, snapshotSha256: after.snapshotSha256, expectedMessage })
    console.log(`${label}: rejected without changing function or synthetic graph`)
  }

  try {
    // This is local configuration discovery, not a daemon call. Every daemon
    // operation below is passed the verified endpoint explicitly via --host.
    const context = execute(['context', 'inspect', '--format', '{{json .Endpoints.docker.Host}}'])
    endpoint = JSON.parse(context.stdout.trim())
    assert.ok(typeof endpoint === 'string' && endpoint.startsWith('unix:///') && !endpoint.includes('?') && !endpoint.includes('#'), 'Refusing a non-local Docker endpoint')
    assert.ok(statSync(endpoint.slice('unix://'.length)).isSocket(), 'The selected Docker endpoint must be an existing local Unix socket')
    receipt.dockerEndpoint = endpoint
    const image = JSON.parse(docker(['image', 'inspect', IMAGE, '--format', '{{json .}}']).stdout.trim())
    assert.equal(image.Id, IMAGE_ID, 'The already-cached PostgreSQL image must match the reviewed digest; no image pull is permitted')

    creationAttempted = true
    const dataDir = '/tmp/boq-save-null-auth-data'
    const startup = `${PG_BIN}/initdb -D ${dataDir} --auth=trust --encoding=UTF8 --no-locale && exec ${PG_BIN}/postgres -D ${dataDir} -c listen_addresses= -c unix_socket_directories=/tmp`
    containerId = docker(['run', '--detach', '--pull', 'never', '--name', containerName,
      '--label', `${LABEL}=${token}`, '--network', 'none', '--rm', '--user', 'postgres',
      '--tmpfs', '/tmp:rw,nosuid,nodev,size=512m,mode=1777', '--entrypoint', '/bin/sh', IMAGE_ID, '-c', startup]).stdout.trim()
    assert.match(containerId, /^[0-9a-f]{64}$/)
    receipt.containerId = containerId
    const container = JSON.parse(docker(['inspect', containerId]).stdout)[0]
    assert.equal(container.Name, `/${containerName}`)
    assert.equal(container.Config.Labels[LABEL], token)
    assert.equal(container.Image, IMAGE_ID)
    assert.equal(container.Config.User, 'postgres')
    assert.equal(container.HostConfig.NetworkMode, 'none')
    assert.equal(container.HostConfig.AutoRemove, true)
    assert.equal(Object.keys(container.HostConfig.PortBindings || {}).length, 0)
    assert.equal(container.HostConfig.Binds?.length || 0, 0)
    assert.ok(container.Mounts.every(mount => mount.Type !== 'bind'))
    assert.ok(container.HostConfig.Tmpfs['/tmp'].includes('size=512m'))
    saveReceipt()

    let ready = false
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      const probe = docker(['exec', containerId, `${PG_BIN}/psql`, '-X', '-h', '/tmp', '-U', 'postgres', '-d', 'postgres', '-A', '-t', '-c', 'SELECT 1'], { allowFailure: true, timeout: 5000 })
      if (probe.status === 0 && probe.stdout.trim() === '1') { ready = true; break }
      // Blocking waits are short and only occur before the isolated server is ready.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250)
    }
    assert.ok(ready, 'The owned isolated PostgreSQL server did not become ready within 30 seconds')
    assertDatabase(database)
    docker(['exec', containerId, `${PG_BIN}/createdb`, '-h', '/tmp', '-U', 'postgres', database])
    sql(database, sources.fixture)
    const predecessor = snapshot(database, 'predecessor')
    assert.equal(predecessor.definitionSha256, PRE_SHA256, 'Synthetic predecessor must equal the exact captured Save definition')
    for (const rows of Object.values(predecessor.graph)) assert.deepEqual(rows, [], 'Fixture must begin without business rows')
    const baselineCounts = smoke('baseline')
    assert.deepEqual(snapshot(database, 'baseline-after'), predecessor, 'Baseline smoke must roll back all synthetic changes')
    receipt.checks.push({ name: 'baseline-bypasses-and-rollback', passed: true, definitionSha256: PRE_SHA256, ...baselineCounts })

    const drifts = [
      { name: 'body', message: 'definition does not match the exact read-only receipt', sql: `DO $drift$ BEGIN
          EXECUTE replace(pg_get_functiondef('${SIGNATURE}'::regprocedure),
            'v_is_authorized boolean := false;', 'v_is_authorized boolean := false; -- isolated body drift');
        END; $drift$;` },
      { name: 'config', message: 'function configuration drifted', sql: `ALTER FUNCTION ${SIGNATURE} SET statement_timeout = '31s';` },
      { name: 'acl', message: 'exact postgres/authenticated execute ACL', sql: `GRANT EXECUTE ON FUNCTION ${SIGNATURE} TO anon;` },
    ]
    for (const drift of drifts) {
      const clone = `${database}_${drift.name}`
      assertDatabase(clone)
      docker(['exec', containerId, `${PG_BIN}/createdb`, '-h', '/tmp', '-U', 'postgres', '--template', database, clone])
      const original = snapshot(clone, `drift-${drift.name}-original`)
      sql(clone, drift.sql)
      assert.notEqual(snapshot(clone, `drift-${drift.name}-injected`).snapshotSha256, original.snapshotSha256, 'Drift injection must actually change the isolated predecessor')
      assertRejected(clone, `drift-${drift.name}`, drift.message)
    }

    sql(database, sources.migration)
    const fixed = snapshot(database, 'fixed')
    assert.equal(fixed.definitionSha256, POST_SHA256)
    assert.equal(fixed.definition, predecessor.definition.replace('IF NOT v_is_authorized THEN', 'IF v_is_authorized IS NOT TRUE THEN'))
    assert.deepEqual(fixed.metadata, predecessor.metadata, 'Only the authorization guard body may change')
    assert.deepEqual(fixed.tableSecurity, predecessor.tableSecurity, 'Applying migration 030 must preserve every synthetic table ACL and RLS policy')
    assert.deepEqual(fixed.publicSchemaAcl, predecessor.publicSchemaAcl, 'Applying migration 030 must preserve public schema grants')
    assert.deepEqual(fixed.graph, predecessor.graph, 'Applying migration 030 must not mutate business rows')
    const fixedCounts = smoke('fixed')
    assert.equal(fixedCounts.cases, baselineCounts.cases, 'Baseline and fixed runs must execute the same matrix')
    assert.deepEqual(snapshot(database, 'fixed-after-smoke'), fixed, 'Fixed smoke must roll back all synthetic changes')
    receipt.checks.push({ name: 'fixed-authorization-and-preservation', passed: true, definitionSha256: POST_SHA256, ...fixedCounts })
    assertRejected(database, 'replay', 'guard already applied; replay is not permitted')
    receipt.status = 'passed'
  } catch (error) {
    failure = error
    receipt.status = 'failed'
    receipt.error = error instanceof Error ? error.message : String(error)
  } finally {
    // A failed/ambiguous `docker run` may have created the container. Locate
    // only the unique name from this invocation and verify our label first.
    if (creationAttempted && endpoint) {
      try {
        const inspected = docker(['inspect', containerName], { allowFailure: true, cleanup: true })
        if (inspected.status === 0) {
          const owned = JSON.parse(inspected.stdout)[0]
          assert.equal(owned.Name, `/${containerName}`)
          assert.equal(owned.Config.Labels[LABEL], token, 'Refusing cleanup of a container not owned by this invocation')
          assert.equal(owned.Image, IMAGE_ID)
          assert.match(owned.Id, /^[0-9a-f]{64}$/)
          receipt.cleanup.containerId = owned.Id
          docker(['stop', '--time', '5', owned.Id], { cleanup: true, timeout: 15000 })
        } else {
          assert.match(inspected.stderr, /No such (object|container)/i, 'Cannot confirm owned container absence')
        }
        let absent
        for (let attempt = 0; attempt < 20; attempt += 1) {
          absent = docker(['inspect', containerName], { allowFailure: true, cleanup: true })
          if (absent.status !== 0) break
          const remaining = JSON.parse(absent.stdout)[0]
          assert.equal(remaining.Name, `/${containerName}`)
          assert.equal(remaining.Config.Labels[LABEL], token, 'Refusing cleanup verification of a container not owned by this invocation')
          assert.equal(remaining.Image, IMAGE_ID)
          assert.equal(remaining.Id, receipt.cleanup.containerId, 'Owned container identity changed during cleanup')
          if (attempt < 19) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
        }
        assert.notEqual(absent.status, 0, 'Owned --rm container remains after stop')
        assert.match(absent.stderr, /No such (object|container)/i, 'Cannot confirm owned container removal')
        receipt.cleanup.confirmedRemoved = true
      } catch (error) {
        receipt.cleanup.error = error instanceof Error ? error.message : String(error)
        receipt.status = 'failed'
        failure ||= error
      }
    }
    receipt.finishedAt = new Date().toISOString()
    saveReceipt()
    process.off('SIGINT', signalHandler)
    process.off('SIGTERM', signalHandler)
  }
  console.log(JSON.stringify({ status: receipt.status, checks: receipt.checks, cleanup: receipt.cleanup, receiptDir }, null, 2))
  if (failure) throw failure
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run() } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
