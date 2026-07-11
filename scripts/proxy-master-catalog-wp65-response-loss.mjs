import { execFileSync } from 'node:child_process'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { createServer, request as httpRequest } from 'node:http'
import { dirname, isAbsolute, relative, resolve } from 'node:path'

const MAX_REQUEST_BYTES = 2 * 1024 * 1024
const MAX_RESPONSE_BYTES = 32 * 1024 * 1024
const ALLOWED_RPC_NAMES = new Set([
  'create_catalog_draft',
  'apply_catalog_changes',
  'publish_catalog_version',
  'restore_catalog_pointer',
])
const STATUS_PATH = '/__wp65/status'
const HEALTH_PATH = '/__wp65/health'

const options = readOptions(process.argv.slice(2))
assertTrackedTreeClean()
const upstream = readLoopbackOrigin('upstream', options.upstream)
const listen = readLoopbackOrigin('listen', options.listen)
const rpcName = readRpcName(options.rpc)
const rpcPath = `/rest/v1/rpc/${rpcName}`
const outputPath = options.output ? readEvidenceOutputPath(options.output) : null
const gitCommit = currentCommit()
const state = {
  schemaVersion: 1,
  status: 'awaiting_first_commit',
  environment: 'local',
  gitCommit,
  proxyOrigin: listen.origin,
  upstreamOrigin: upstream.origin,
  rpcPath,
  injectedAt: null,
  firstRequestId: null,
  firstResponseRequestId: null,
  firstUpstreamStatus: null,
  firstCommittedVersionId: null,
  retryAt: null,
  retryRequestId: null,
  retryResponseRequestId: null,
  sameRequestId: null,
  responseRequestIdMatches: null,
  duplicateRequest: null,
  recoveredVersionId: null,
  productionTouched: false,
}

if (outputPath) {
  await assertOutputDoesNotExist(outputPath)
  await persistEvidence()
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', listen)

    if (request.method === 'GET' && requestUrl.pathname === HEALTH_PATH) {
      sendJson(response, 200, { ok: true, status: state.status })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === STATUS_PATH) {
      sendJson(response, 200, state)
      return
    }

    const requestBody = await readBody(request, MAX_REQUEST_BYTES)
    const upstreamResponse = await forwardRequest(request, requestBody)
    const isTarget = request.method === 'POST' && requestUrl.pathname === rpcPath

    if (!isTarget) {
      forwardResponse(response, upstreamResponse)
      return
    }

    const requestPayload = parseJson(requestBody)
    const responsePayload = parseJson(upstreamResponse.body)
    const requestId = readRequestId(requestPayload)
    const responseRequestId = readResponseRequestId(responsePayload)
    const actionData = responsePayload?.data
    const upstreamCommitted = isSuccessStatus(upstreamResponse.statusCode)
      && responsePayload?.ok === true

    if (state.status === 'awaiting_first_commit') {
      if (
        !requestId
        || responseRequestId !== requestId
        || !upstreamCommitted
        || actionData?.duplicateRequest === true
      ) {
        forwardResponse(response, upstreamResponse)
        return
      }

      state.status = 'awaiting_same_id_retry'
      state.injectedAt = new Date().toISOString()
      state.firstRequestId = requestId
      state.firstResponseRequestId = responseRequestId
      state.firstUpstreamStatus = upstreamResponse.statusCode
      state.firstCommittedVersionId = actionData?.versionId ?? null
      await persistEvidence()
      sendJson(response, 504, {
        code: 'WP65_SIMULATED_RESPONSE_LOSS',
        details: null,
        hint: null,
        message: 'Local WP-6.5 evidence proxy withheld a committed RPC response once',
      })
      return
    }

    if (state.status === 'awaiting_same_id_retry') {
      state.retryAt = new Date().toISOString()
      state.retryRequestId = requestId
      state.retryResponseRequestId = responseRequestId
      state.sameRequestId = requestId === state.firstRequestId
      state.responseRequestIdMatches = responseRequestId === requestId
      state.duplicateRequest = actionData?.duplicateRequest === true
      state.recoveredVersionId = actionData?.versionId ?? null
      state.status = state.sameRequestId
        && state.responseRequestIdMatches
        && upstreamCommitted
        && state.duplicateRequest
        && state.recoveredVersionId === state.firstCommittedVersionId
        ? 'passed'
        : 'failed'
      await persistEvidence()
    }

    forwardResponse(response, upstreamResponse)
  } catch (error) {
    sendJson(response, 502, {
      code: 'WP65_PROXY_ERROR',
      message: safeErrorMessage(error),
    })
  }
})

server.listen(Number(listen.port), listen.hostname, () => {
  console.log(`WP-6.5 response-loss proxy listening on ${listen.origin}`)
  console.log(`Forwarding Local Supabase requests to ${upstream.origin}`)
  console.log(`One committed ${rpcPath} response will be withheld`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}

async function forwardRequest(request, body) {
  const upstreamUrl = new URL(request.url ?? '/', upstream)
  const headers = { ...request.headers, host: upstream.host }
  delete headers.connection
  delete headers['transfer-encoding']
  delete headers['content-length']
  headers['accept-encoding'] = 'identity'
  if (body.length > 0) headers['content-length'] = String(body.length)

  return new Promise((resolvePromise, rejectPromise) => {
    const upstreamRequest = httpRequest({
      protocol: upstreamUrl.protocol,
      hostname: upstreamUrl.hostname,
      port: upstreamUrl.port,
      method: request.method,
      path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
      headers,
    }, (upstreamResponse) => {
      readBody(upstreamResponse, MAX_RESPONSE_BYTES)
        .then((responseBody) => resolvePromise({
          statusCode: upstreamResponse.statusCode ?? 502,
          headers: upstreamResponse.headers,
          body: responseBody,
        }))
        .catch(rejectPromise)
    })
    upstreamRequest.on('error', rejectPromise)
    if (body.length > 0) upstreamRequest.write(body)
    upstreamRequest.end()
  })
}

function forwardResponse(response, upstreamResponse) {
  const headers = { ...upstreamResponse.headers }
  delete headers.connection
  delete headers['transfer-encoding']
  headers['content-length'] = String(upstreamResponse.body.length)
  response.writeHead(upstreamResponse.statusCode, headers)
  response.end(upstreamResponse.body)
}

function sendJson(response, statusCode, value) {
  const body = Buffer.from(`${JSON.stringify(value)}\n`)
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.length),
    'cache-control': 'no-store',
  })
  response.end(body)
}

function readBody(stream, limit) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = []
    let size = 0
    stream.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        rejectPromise(new Error(`Local proxy body exceeded ${limit} bytes`))
        stream.destroy()
        return
      }
      chunks.push(chunk)
    })
    stream.on('end', () => resolvePromise(Buffer.concat(chunks)))
    stream.on('error', rejectPromise)
  })
}

function parseJson(buffer) {
  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    return null
  }
}

function readRequestId(payload) {
  const requestId = payload?.p_request_id
  return typeof requestId === 'string' ? requestId : null
}

function readResponseRequestId(payload) {
  const requestId = payload?.requestId
  return typeof requestId === 'string' ? requestId : null
}

function isSuccessStatus(statusCode) {
  return statusCode >= 200 && statusCode < 300
}

async function persistEvidence() {
  if (!outputPath) return
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(state, null, 2)}\n`)
}

async function assertOutputDoesNotExist(path) {
  try {
    await access(path)
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return
    throw error
  }
  throw new Error(`Refusing to overwrite existing WP-6.5 evidence: ${path}`)
}

function readOptions(args) {
  const values = {
    listen: 'http://127.0.0.1:55431',
    upstream: 'http://127.0.0.1:54321',
    rpc: 'create_catalog_draft',
    output: null,
  }

  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]
    const value = args[index + 1]
    if (!value || !['--listen', '--upstream', '--rpc', '--output'].includes(flag)) {
      throw new Error(
        'Usage: proxy-master-catalog-wp65-response-loss.mjs [--listen http://127.0.0.1:55431] [--upstream http://127.0.0.1:54321] [--rpc create_catalog_draft|apply_catalog_changes|publish_catalog_version|restore_catalog_pointer] [--output tmp/master-catalog/wp65-evidence/<run>.json]',
      )
    }
    values[flag.slice(2)] = value
  }
  return values
}

function readRpcName(value) {
  if (!ALLOWED_RPC_NAMES.has(value)) {
    throw new Error('rpc must be one of the reviewed Master Catalog mutation RPC names')
  }
  return value
}

function readEvidenceOutputPath(value) {
  if (!value || isAbsolute(value)) {
    throw new Error('WP-6.5 proxy evidence output must be a relative path under tmp/master-catalog/wp65-evidence')
  }
  const evidenceRoot = resolve('tmp/master-catalog/wp65-evidence')
  const outputPath = resolve(value)
  const pathFromRoot = relative(evidenceRoot, outputPath)
  if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    throw new Error('WP-6.5 proxy evidence output must stay under tmp/master-catalog/wp65-evidence')
  }
  if (!outputPath.endsWith('.json')) {
    throw new Error('WP-6.5 proxy evidence output must use a .json filename')
  }
  return outputPath
}

function readLoopbackOrigin(name, value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a Local loopback origin`)
  }
  if (
    parsed.protocol !== 'http:'
    || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
    || !parsed.port
    || parsed.username
    || parsed.password
    || parsed.pathname !== '/'
    || parsed.search
    || parsed.hash
  ) {
    throw new Error(`${name} must be a Local loopback origin`)
  }
  return parsed
}

function currentCommit() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim()
}

function assertTrackedTreeClean() {
  const status = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim()
  if (status) {
    throw new Error('Tracked tree must be clean before recording WP-6.5 response-loss evidence')
  }
}

function safeErrorMessage(error) {
  return error instanceof Error && error.message
    ? error.message.slice(0, 240)
    : 'Local proxy request failed'
}
