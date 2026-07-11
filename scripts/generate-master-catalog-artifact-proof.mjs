import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { readLocalEnvFile } from './local-env.mjs'
import {
  ARTIFACT_MANIFEST_SCHEMA_VERSION,
  countPdfPages,
  sha256,
  verifyMasterCatalogArtifacts,
} from './verify-master-catalog-artifacts.mjs'

const appOrigin = readLoopbackOrigin(
  'MASTER_CATALOG_PROOF_APP_ORIGIN',
  process.env.MASTER_CATALOG_PROOF_APP_ORIGIN ?? 'http://127.0.0.1:3002',
)
const supabaseUrl = readLoopbackOrigin(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const localEnv = readLocalEnvFile()
const password = localEnv.LOCAL_TEST_PASSWORD ?? process.env.LOCAL_TEST_PASSWORD
const email = process.env.MASTER_CATALOG_PROOF_EMAIL ?? 'local.admin@ntplc.co.th'
const outputRoot = resolve(
  process.env.MASTER_CATALOG_PROOF_OUTPUT_ROOT
    ?? 'output/master-catalog/review-artifacts',
)

if (!supabaseAnonKey || !password) {
  throw new Error('Local anon key and LOCAL_TEST_PASSWORD are required')
}

assertTrackedTreeClean()
const gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: process.cwd(),
  encoding: 'utf8',
}).trim()
const gitBranch = execFileSync('git', ['branch', '--show-current'], {
  cwd: process.cwd(),
  encoding: 'utf8',
}).trim()
const generatedAt = new Date().toISOString()
const runId = `${generatedAt.replace(/[-:.]/g, '')}-${gitCommit.slice(0, 8)}`
const outputDirectory = join(outputRoot, runId)
const stagingDirectory = join(outputRoot, `.${runId}.in-progress-${process.pid}`)

await mkdir(outputRoot, { recursive: true })
const chromeProfileDirectory = await mkdtemp(join(tmpdir(), 'master-catalog-proof-'))

let chrome = null
let completed = false
try {
  const { cookieHeader, version } = await createLocalAdminSession()
  const excel = await fetchExcelArtifact(cookieHeader, version)
  const cdpPort = await findAvailablePort()
  chrome = startChrome(cdpPort, chromeProfileDirectory)
  const pageWebSocketUrl = await waitForPageWebSocketUrl(cdpPort, chrome)
  const cdp = await connectCdp(pageWebSocketUrl)

  let pdfBuffer
  let printHtmlBuffer
  let domProof
  try {
    const printed = await printLiveRoute(cdp, cookieHeader, version)
    pdfBuffer = printed.pdfBuffer
    printHtmlBuffer = Buffer.from(printed.printHtml, 'utf8')
    domProof = printed.domProof
  } finally {
    cdp.close()
  }

  const pdfPageCount = countPdfPages(pdfBuffer)
  if (pdfPageCount !== domProof.expectedPageCount) {
    throw new Error(
      `Generated PDF page count ${pdfPageCount} does not match DOM ${domProof.expectedPageCount}`,
    )
  }

  const artifactBase = `NT-Master-Catalog-v${version.version_string}-${version.effective_date.replaceAll('-', '')}`
  const excelFilename = basename(excel.filename || `${artifactBase}.xlsx`)
  const pdfFilename = `${artifactBase}.pdf`
  const printHtmlFilename = `${artifactBase}-print.html`
  const excelPath = join(stagingDirectory, excelFilename)
  const pdfPath = join(stagingDirectory, pdfFilename)
  const printHtmlPath = join(stagingDirectory, printHtmlFilename)

  await mkdir(stagingDirectory)
  await Promise.all([
    writeFile(excelPath, excel.buffer),
    writeFile(pdfPath, pdfBuffer),
    writeFile(printHtmlPath, printHtmlBuffer),
  ])

  const manifest = {
    schemaVersion: ARTIFACT_MANIFEST_SCHEMA_VERSION,
    generatedAt,
    gitCommit,
    gitBranch,
    environment: 'local',
    source: {
      appOrigin,
      routeKind: 'authenticated selected-version server export',
      actorRole: 'admin',
      excelRequestId: excel.requestId,
    },
    version: {
      id: version.id,
      versionString: version.version_string,
      status: version.status,
      isCurrentDefault: version.is_default,
      itemCount: version.item_count,
      datasetHash: version.dataset_hash,
      effectiveDate: version.effective_date,
    },
    domProof,
    artifacts: {
      excel: binaryManifest(excelFilename, excel.buffer, {
        contentType: excel.contentType,
        contentDisposition: excel.contentDisposition,
      }),
      pdf: binaryManifest(pdfFilename, pdfBuffer, {
        pageCount: pdfPageCount,
        printedFromLiveRoute: true,
        displayHeaderFooter: false,
        preferCssPageSize: true,
      }),
      printHtml: binaryManifest(printHtmlFilename, printHtmlBuffer),
    },
  }

  const manifestPath = join(stagingDirectory, 'artifact-manifest.json')
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const verification = await verifyMasterCatalogArtifacts(manifestPath)
  await writeFile(
    join(stagingDirectory, 'artifact-verification.json'),
    `${JSON.stringify(verification, null, 2)}\n`,
  )
  if (verification.status !== 'passed') {
    throw new Error(`Artifact verification failed: ${verification.failures.join('; ')}`)
  }

  await rename(stagingDirectory, outputDirectory)
  completed = true
  console.log(JSON.stringify({ outputDirectory, manifest, verification }, null, 2))
} finally {
  if (chrome && chrome.exitCode === null) chrome.kill('SIGTERM')
  await rm(chromeProfileDirectory, { recursive: true, force: true })
  if (!completed) await rm(stagingDirectory, { recursive: true, force: true })
}

async function createLocalAdminSession() {
  const cookieJar = []
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieJar
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          const index = cookieJar.findIndex((item) => item.name === cookie.name)
          if (index >= 0) cookieJar.splice(index, 1)
          cookieJar.push({ name: cookie.name, value: cookie.value })
        }
      },
    },
  })

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError) throw authError
  if (!authData.user) throw new Error('Local admin sign-in returned no user')

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role,status')
    .eq('id', authData.user.id)
    .single()
  if (profileError) throw profileError
  if (profile.role !== 'admin' || profile.status !== 'active') {
    throw new Error(`Unexpected Local profile role/status: ${profile.role}/${profile.status}`)
  }

  const { data: pointer, error: pointerError } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError

  const { data: version, error: versionError } = await supabase
    .from('price_list_versions')
    .select('id,version_string,status,is_default,item_count,dataset_hash,effective_date')
    .eq('id', pointer.version_id)
    .single()
  if (versionError) throw versionError
  if (version.status !== 'active' || !version.is_default) {
    throw new Error(`Selected Local version is not active/default: ${version.status}/${version.is_default}`)
  }
  if (
    !Number.isInteger(Number(version.item_count))
    || Number(version.item_count) <= 0
    || !/^sha256:[0-9a-f]{64}$/.test(version.dataset_hash ?? '')
    || !version.effective_date
  ) {
    throw new Error('Selected Local version lacks valid published count/hash/effective-date metadata')
  }

  return {
    cookieHeader: cookieJar.map(({ name, value }) => `${name}=${value}`).join('; '),
    version: { ...version, item_count: Number(version.item_count) },
  }
}

async function fetchExcelArtifact(cookieHeader, version) {
  const response = await fetch(
    `${appOrigin}/api/master-catalog/export/excel/${version.id}`,
    { headers: { Cookie: cookieHeader } },
  )
  if (!response.ok) {
    throw new Error(`Excel route failed: ${response.status} ${await response.text()}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('spreadsheetml.sheet')) {
    throw new Error(`Unexpected Excel content type: ${contentType}`)
  }
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const requestId = response.headers.get('x-request-id') ?? ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error('Excel route did not return a valid X-Request-ID')
  }
  const filename = filenameFromDisposition(contentDisposition)
  return {
    filename,
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType,
    contentDisposition,
    requestId,
  }
}

async function printLiveRoute(cdp, cookieHeader, version) {
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  await cdp.send('Network.setExtraHTTPHeaders', { headers: { Cookie: cookieHeader } })

  const loaded = cdp.waitForEvent('Page.loadEventFired', 30000)
  await cdp.send('Page.navigate', {
    url: `${appOrigin}/admin/master-catalog/versions/${version.id}/print`,
  })
  await loaded

  const domProof = await waitForDomProof(cdp, version)
  const htmlResult = await cdp.send('Runtime.evaluate', {
    expression: 'document.documentElement.outerHTML',
    returnByValue: true,
  })
  const pdf = await cdp.send('Page.printToPDF', {
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: true,
  })

  return {
    domProof,
    printHtml: `<!DOCTYPE html>\n${htmlResult.result.value}\n`,
    pdfBuffer: Buffer.from(pdf.data, 'base64'),
  }
}

async function waitForDomProof(cdp, version) {
  const deadline = Date.now() + 30000
  let last = null
  const expectedHash = JSON.stringify(version.dataset_hash)

  while (Date.now() < deadline) {
    const result = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      awaitPromise: true,
      expression: `(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => {
          if (image.complete) return Promise.resolve();
          return new Promise((resolveImage) => {
            image.addEventListener('load', resolveImage, { once: true });
            image.addEventListener('error', resolveImage, { once: true });
          });
        }));
        const rows = [...document.querySelectorAll('tbody tr:not(.category-row)')];
        const seqs = rows
          .map((row) => row.querySelector('.seq')?.textContent?.trim())
          .filter(Boolean)
          .map((value) => Number(value.replace(/[๐-๙]/g, (digit) => '๐๑๒๓๔๕๖๗๘๙'.indexOf(digit))));
        const sequenceBreaks = [];
        for (let index = 0; index < seqs.length; index += 1) {
          if (seqs[index] !== index + 1) {
            sequenceBreaks.push({ index, expected: index + 1, actual: seqs[index] });
          }
        }
        const priceSectionCount = document.querySelectorAll('.price-section').length;
        const expectedPageCount = document.querySelectorAll('.sheet').length;
        return {
          readyState: document.readyState,
          fontsReady: document.fonts.status === 'loaded',
          imagesReady: [...document.images].every((image) => image.complete && image.naturalWidth > 0),
          rowCount: rows.length,
          firstSeqInDom: seqs[0] ?? null,
          lastSeqInDom: seqs[seqs.length - 1] ?? null,
          uniqueSeqCount: new Set(seqs).size,
          sequenceBreakCount: sequenceBreaks.length,
          sequenceBreaks: sequenceBreaks.slice(0, 5),
          priceSectionCount,
          expectedPageCount,
          title: document.querySelector('h1')?.textContent?.trim() ?? null,
          hashPresent: document.body.textContent.includes(${expectedHash}),
          watermarkPresent: document.body.textContent.includes('รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้าง'),
        };
      })()`,
    })
    last = result.result.value

    if (
      last?.readyState === 'complete'
      && last.fontsReady
      && last.imagesReady
      && last.rowCount === version.item_count
      && last.firstSeqInDom === 1
      && last.lastSeqInDom === version.item_count
      && last.uniqueSeqCount === version.item_count
      && last.sequenceBreakCount === 0
      && last.priceSectionCount > 0
      && last.expectedPageCount === last.priceSectionCount + 1
      && last.hashPresent
      && last.watermarkPresent
    ) {
      return last
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250))
  }

  throw new Error(`Live print route did not reach the expected DOM proof: ${JSON.stringify(last)}`)
}

function startChrome(port, profileDirectory) {
  const chromePath = resolveChromePath()
  const child = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-features=MediaRouter,OptimizationHints',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  child.proofLog = ''
  const collect = (chunk) => {
    child.proofLog = `${child.proofLog}${chunk.toString()}`.slice(-8000)
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)
  return child
}

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) throw new Error('Chrome was not found; set CHROME_PATH')
  return found
}

async function waitForPageWebSocketUrl(port, chromeProcess) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(`Chrome exited before CDP became ready: ${chromeProcess.proofLog}`)
    }
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json())
      const page = pages.find((item) => item.type === 'page' && item.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200))
  }
  throw new Error(`Chrome CDP did not become ready: ${chromeProcess.proofLog}`)
}

async function connectCdp(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl)
  const pending = new Map()
  const events = new Map()
  let id = 0

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const promise = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) promise.reject(new Error(JSON.stringify(message.error)))
      else promise.resolve(message.result ?? {})
      return
    }
    if (message.method && events.has(message.method)) {
      const listeners = events.get(message.method)
      events.delete(message.method)
      for (const listener of listeners) listener(message.params ?? {})
    }
  })

  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener('open', resolveOpen, { once: true })
    ws.addEventListener('error', rejectOpen, { once: true })
  })

  return {
    send(method, params = {}) {
      id += 1
      ws.send(JSON.stringify({ id, method, params }))
      return new Promise((resolvePromise, rejectPromise) => {
        pending.set(id, { resolve: resolvePromise, reject: rejectPromise })
      })
    },
    waitForEvent(method, timeoutMs) {
      return new Promise((resolveEvent, rejectEvent) => {
        const timeout = setTimeout(
          () => rejectEvent(new Error(`Timed out waiting for ${method}`)),
          timeoutMs,
        )
        const listeners = events.get(method) ?? []
        listeners.push((params) => {
          clearTimeout(timeout)
          resolveEvent(params)
        })
        events.set(method, listeners)
      })
    },
    close() {
      ws.close()
    },
  }
}

async function findAvailablePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer()
    server.once('error', rejectPort)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close((error) => {
        if (error) rejectPort(error)
        else if (!port) rejectPort(new Error('Failed to allocate a Chrome CDP port'))
        else resolvePort(port)
      })
    })
  })
}

function binaryManifest(path, buffer, extra = {}) {
  return {
    path: basename(path),
    bytes: buffer.length,
    binarySha256: sha256(buffer),
    ...extra,
  }
}

function filenameFromDisposition(value) {
  const match = value.match(/filename="([^"]+)"/)
  return match?.[1] ?? null
}

function readLoopbackOrigin(name, value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a loopback URL for Local-only proof`)
  }

  if (
    url.protocol !== 'http:'
    || !['127.0.0.1', 'localhost'].includes(url.hostname)
    || !url.port
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  ) {
    throw new Error(`${name} must be a loopback origin for Local-only proof`)
  }

  return url.origin
}

function assertTrackedTreeClean() {
  const trackedChanges = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim()

  if (trackedChanges) {
    throw new Error(
      'Tracked tree must be clean before generating retained artifact proof; commit the reviewed code first',
    )
  }
}
