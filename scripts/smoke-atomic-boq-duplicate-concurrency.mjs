import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

const database = process.env.ATOMIC_COPY_SMOKE_DB
const container =
  process.env.ATOMIC_COPY_SMOKE_CONTAINER ?? 'supabase_db_conduit-boq-local'

if (!database || !/^conduit_boq_atomic_copy_smoke_[a-z0-9_]+$/.test(database)) {
  throw new Error(
    'ATOMIC_COPY_SMOKE_DB must name a disposable conduit_boq_atomic_copy_smoke_* database',
  )
}

if (!/^supabase_db_[a-zA-Z0-9._-]+$/.test(container)) {
  throw new Error('ATOMIC_COPY_SMOKE_CONTAINER is not a local Supabase DB container')
}

const actorId = '11111111-1111-4111-8111-111111111111'
const seedRequestId = '88888888-8888-4888-8888-888888888888'

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function runPsql(sql, { expectFailure = false, onStdout } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'docker',
      [
        'exec',
        container,
        'psql',
        '-X',
        '-U',
        'postgres',
        '-d',
        database,
        '-v',
        'ON_ERROR_STOP=1',
        '-A',
        '-t',
        '-q',
        '-c',
        sql,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )

    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
      onStdout?.(stdout)
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      const result = { code, stdout: stdout.trim(), stderr: stderr.trim() }
      if (expectFailure ? code === 0 : code !== 0) {
        reject(
          new Error(
            `psql ${expectFailure ? 'unexpectedly succeeded' : 'failed'}: ${JSON.stringify(result)}`,
          ),
        )
        return
      }
      resolve(result)
    })
  })
}

function lastJson(stdout) {
  const line = stdout
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1)
  if (!line) throw new Error('psql returned no JSON payload')
  return JSON.parse(line)
}

function actorCallSql({ sourceId, requestId, token }) {
  return `
    BEGIN;
    SET LOCAL ROLE authenticated;
    SET LOCAL request.jwt.claim.sub = ${sqlLiteral(actorId)};
    SELECT public.duplicate_boq_atomic(
      ${sqlLiteral(sourceId)}::uuid,
      ${sqlLiteral(requestId)}::uuid,
      ${sqlLiteral(token)}::timestamptz,
      'preserve',
      NULL
    )::text;
    COMMIT;
  `
}

async function actorCall(args) {
  return lastJson((await runPsql(actorCallSql(args))).stdout)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const version = (
  await runPsql("SELECT current_setting('server_version');")
).stdout

const seed = lastJson(
  (
    await runPsql(`
      SELECT pg_catalog.jsonb_build_object(
        'sourceId', request_row.result_boq_id,
        'token', result_row.updated_at,
        'factorVersionId', result_row.factor_reference_version_id
      )::text
      FROM private.boq_copy_requests request_row
      JOIN public.boq result_row ON result_row.id = request_row.result_boq_id
      WHERE request_row.actor_id = ${sqlLiteral(actorId)}::uuid
        AND request_row.request_id = ${sqlLiteral(seedRequestId)}::uuid;
    `)
  ).stdout,
)

assert(seed.sourceId && seed.token, 'committed smoke seed copy was not found')

const sameKeyRequest = randomUUID()
const sameKey = await Promise.all([
  actorCall({
    sourceId: seed.sourceId,
    requestId: sameKeyRequest,
    token: seed.token,
  }),
  actorCall({
    sourceId: seed.sourceId,
    requestId: sameKeyRequest,
    token: seed.token,
  }),
])

assert(
  sameKey[0].boq_id === sameKey[1].boq_id,
  'same actor/request concurrent calls returned different destinations',
)
assert(
  sameKey.filter((payload) => payload.duplicateRequest === false).length === 1 &&
    sameKey.filter((payload) => payload.duplicateRequest === true).length === 1,
  'same-key concurrency did not produce exactly one original and one replay',
)

// Simulate a lost first response: repeat the exact request after both sessions
// have completed and require the durable ledger to return the same destination.
const responseLossRetry = await actorCall({
  sourceId: seed.sourceId,
  requestId: sameKeyRequest,
  token: seed.token,
})
assert(responseLossRetry.duplicateRequest === true, 'response-loss retry was not a replay')
assert(
  responseLossRetry.boq_id === sameKey[0].boq_id,
  'response-loss retry returned a different destination',
)

const differentKeyRequests = [randomUUID(), randomUUID()]
const differentKey = await Promise.all(
  differentKeyRequests.map((requestId) =>
    actorCall({ sourceId: seed.sourceId, requestId, token: seed.token }),
  ),
)
assert(
  differentKey[0].boq_id !== differentKey[1].boq_id,
  'different request ids incorrectly collapsed to one destination',
)
assert(
  differentKey.every((payload) => payload.duplicateRequest === false),
  'fresh different-key calls were unexpectedly marked as replayed',
)

const conflictingReuse = await runPsql(
  actorCallSql({
    sourceId: seed.sourceId,
    requestId: sameKeyRequest,
    token: '2000-01-01T00:00:00.000Z',
  }),
  { expectFailure: true },
)
assert(
  conflictingReuse.stderr.includes(
    'request id was already used with different copy parameters',
  ),
  'request-key reuse failed for an unexpected reason',
)

// Hold the source header longer than the RPC lock_timeout. This models a
// save-vs-copy overlap at the shared BOQ row and proves the failed statement
// leaves neither ledger nor destination residue.
const timeoutRequest = randomUUID()
const destinationCountBeforeTimeout = Number(
  (await runPsql('SELECT count(*) FROM public.boq;')).stdout,
)
const lockerTag = `atomic-copy-locker-${randomUUID()}`
const locker = runPsql(
  `
    BEGIN;
    SET LOCAL application_name = ${sqlLiteral(lockerTag)};
    SELECT 'LOCKED'
    FROM public.boq
    WHERE id = ${sqlLiteral(seed.sourceId)}::uuid
    FOR UPDATE;
    SELECT pg_sleep(12);
    COMMIT;
  `,
)

let lockerReady = false
for (let attempt = 0; attempt < 50; attempt += 1) {
  const sleepingLockerCount = Number(
    (
      await runPsql(`
        SELECT count(*)
        FROM pg_catalog.pg_stat_activity
        WHERE datname = current_database()
          AND application_name = ${sqlLiteral(lockerTag)}
          AND wait_event = 'PgSleep';
      `)
    ).stdout,
  )
  if (sleepingLockerCount === 1) {
    lockerReady = true
    break
  }
  await new Promise((resolve) => setTimeout(resolve, 100))
}
assert(lockerReady, 'source-lock session did not become ready')

const timeoutFailure = await runPsql(
  actorCallSql({
    sourceId: seed.sourceId,
    requestId: timeoutRequest,
    token: seed.token,
  }),
  { expectFailure: true },
)
await locker
assert(
  timeoutFailure.stderr.includes('canceling statement due to lock timeout'),
  'source-lock timeout failed for an unexpected reason',
)

const timeoutLedgerCount = Number(
  (
    await runPsql(`
      SELECT count(*)
      FROM private.boq_copy_requests
      WHERE actor_id = ${sqlLiteral(actorId)}::uuid
        AND request_id = ${sqlLiteral(timeoutRequest)}::uuid;
    `)
  ).stdout,
)
assert(timeoutLedgerCount === 0, 'timed-out copy left an idempotency ledger row')

const destinationCountAfterTimeout = Number(
  (await runPsql('SELECT count(*) FROM public.boq;')).stdout,
)
assert(
  destinationCountAfterTimeout === destinationCountBeforeTimeout,
  'timed-out copy left a destination BOQ row',
)

const sameKeyLedgerCount = Number(
  (
    await runPsql(`
      SELECT count(*)
      FROM private.boq_copy_requests
      WHERE actor_id = ${sqlLiteral(actorId)}::uuid
        AND request_id = ${sqlLiteral(sameKeyRequest)}::uuid;
    `)
  ).stdout,
)
assert(sameKeyLedgerCount === 1, 'same-key concurrency created multiple ledger rows')

console.log(
  JSON.stringify(
    {
      schema: 'conduit-boq/atomic-duplicate-concurrency/v1',
      database,
      container,
      postgresVersion: version,
      sameKey: {
        requestId: sameKeyRequest,
        destinationId: sameKey[0].boq_id,
        responses: sameKey.map((payload) => payload.duplicateRequest),
        ledgerRows: sameKeyLedgerCount,
      },
      responseLossRetry: 'PASS',
      differentKeySameSource: {
        requestIds: differentKeyRequests,
        destinationIds: differentKey.map((payload) => payload.boq_id),
      },
      conflictingRequestReuse: 'PASS',
      sourceLockTimeoutRollback: {
        requestId: timeoutRequest,
        ledgerRows: timeoutLedgerCount,
        destinationCountBefore: destinationCountBeforeTimeout,
        destinationCountAfter: destinationCountAfterTimeout,
      },
      result: 'PASS',
    },
    null,
    2,
  ),
)
