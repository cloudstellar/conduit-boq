import { createHash } from 'node:crypto'
import { lstat, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, normalize, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'

export const ARTIFACT_MANIFEST_SCHEMA_VERSION = 2
export const ARTIFACT_PDF_PRESENTATION_POLICY =
  'official-pdf-active-only-draft-pdf-mark-inactive'
export const ARTIFACT_PDF_HASH_SCOPE = 'complete-version-including-inactive'

const LEGACY_ARTIFACT_MANIFEST_SCHEMA_VERSION = 1
const SUPPORTED_ARTIFACT_MANIFEST_SCHEMA_VERSIONS = new Set([
  LEGACY_ARTIFACT_MANIFEST_SCHEMA_VERSION,
  ARTIFACT_MANIFEST_SCHEMA_VERSION,
])

const EXPECTED_SHEETS = [
  'ข้อมูลเอกสาร',
  'รายการราคา',
  'พจนานุกรมรหัส',
  'สรุปการเปลี่ยนแปลง',
  'ข้อมูลตรวจสอบ',
]
const PRICE_HEADERS = [
  'ลำดับ',
  'รหัสรายการ',
  'รายการ',
  'หน่วย',
  'ค่าวัสดุ (บาท)',
  'ค่าแรง (บาท)',
  'ราคาต่อหน่วย (บาท)',
  'หมวดหมู่',
  'รหัสบริบทงาน',
  'บริบทงาน',
  'รหัสชนิดรายการ',
  'ชนิดรายการ',
  'สถานะ',
]
const VERIFICATION_HEADERS = [
  'identity_id',
  'item_code',
  'item_name',
  'unit',
  'material_cost',
  'labor_cost',
  'unit_cost',
  'category_code',
  'category_name',
  'work_context_code',
  'work_context_name_th',
  'item_type_code',
  'item_type_name_th',
  'is_active',
  'display_order',
  '_canonical_row_json',
]
const EXPECTED_DEPARTMENT_FOOTER = 'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)'
const MONEY_FORMAT = '#,##0.00'

export async function verifyMasterCatalogArtifacts(manifestPath) {
  const absoluteManifestPath = resolve(manifestPath)
  const manifestDirectory = dirname(absoluteManifestPath)
  const manifest = JSON.parse(await readFile(absoluteManifestPath, 'utf8'))
  const failures = []

  validateManifestShape(manifest, failures)

  const excelPath = resolveArtifactPath(manifestDirectory, manifest.artifacts?.excel?.path)
  const pdfPath = resolveArtifactPath(manifestDirectory, manifest.artifacts?.pdf?.path)
  const printHtmlPath = resolveArtifactPath(
    manifestDirectory,
    manifest.artifacts?.printHtml?.path,
  )

  const excelFile = await verifyBinaryFile(
    'excel',
    excelPath,
    manifest.artifacts?.excel,
    failures,
  )
  const pdfFile = await verifyBinaryFile(
    'pdf',
    pdfPath,
    manifest.artifacts?.pdf,
    failures,
  )
  const printHtmlFile = await verifyBinaryFile(
    'printHtml',
    printHtmlPath,
    manifest.artifacts?.printHtml,
    failures,
  )

  const excel = excelFile
    ? await verifyWorkbook(
        excelPath,
        manifest.version,
        manifest.schemaVersion,
        manifest.domProof,
        failures,
      )
    : null
  const pdf = pdfFile
    ? verifyPdf(pdfFile.buffer, manifest.domProof, failures)
    : null
  const printHtml = printHtmlFile
    ? verifyPrintHtml(printHtmlFile.buffer, manifest, failures)
    : null

  verifyDomProof(
    manifest.domProof,
    manifest.version,
    manifest.pdfPresentation,
    manifest.schemaVersion,
    failures,
  )

  return {
    schemaVersion: ARTIFACT_MANIFEST_SCHEMA_VERSION,
    manifestPath: basename(absoluteManifestPath),
    verifiedAt: new Date().toISOString(),
    version: manifest.version ?? null,
    artifacts: {
      excel: excelFile
        ? summarizeBinary(excelFile, excel, manifest.artifacts.excel.path)
        : null,
      pdf: pdfFile
        ? summarizeBinary(pdfFile, pdf, manifest.artifacts.pdf.path)
        : null,
      printHtml: printHtmlFile
        ? summarizeBinary(printHtmlFile, printHtml, manifest.artifacts.printHtml.path)
        : null,
    },
    failures,
    status: failures.length === 0 ? 'passed' : 'failed',
  }
}

export function countPdfPages(buffer) {
  if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error('PDF magic header is missing')
  }

  const text = buffer.toString('latin1')
  const pages = text.match(/\/Type\s*\/Page(?!s)\b/g) ?? []
  if (pages.length === 0) {
    throw new Error('No PDF page objects were found')
  }
  return pages.length
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function verifyWorkbook(
  workbookPath,
  version,
  manifestSchemaVersion,
  domProof,
  failures,
) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(workbookPath)

  const sheetNames = workbook.worksheets.map((sheet) => sheet.name)
  const visibleSheets = workbook.worksheets
    .filter((sheet) => sheet.state !== 'hidden' && sheet.state !== 'veryHidden')
    .map((sheet) => sheet.name)

  if (!sameStrings(sheetNames, EXPECTED_SHEETS)) {
    failures.push(`Excel sheet order mismatch: ${JSON.stringify(sheetNames)}`)
  }
  if (!sameStrings(visibleSheets, EXPECTED_SHEETS)) {
    failures.push(`Excel visible sheets mismatch: ${JSON.stringify(visibleSheets)}`)
  }

  const documentSheet = workbook.getWorksheet('ข้อมูลเอกสาร')
  const priceSheet = workbook.getWorksheet('รายการราคา')
  const verificationSheet = workbook.getWorksheet('ข้อมูลตรวจสอบ')
  if (!documentSheet || !priceSheet || !verificationSheet) {
    failures.push('Excel required sheets are missing')
    return { sheetNames, visibleSheets }
  }

  const priceHeaderRows = findHeaderRows(priceSheet, PRICE_HEADERS)
  const verificationHeaderRows = findHeaderRows(verificationSheet, VERIFICATION_HEADERS)
  if (priceHeaderRows.length !== 1) {
    failures.push(`Excel price header match count is ${priceHeaderRows.length}, expected 1`)
  }
  if (verificationHeaderRows.length !== 1) {
    failures.push(
      `Excel verification header match count is ${verificationHeaderRows.length}, expected 1`,
    )
  }

  const priceHeaderRow = priceHeaderRows[0]
  const verificationHeaderRow = verificationHeaderRows[0]
  const priceSequences = []
  const priceRows = []
  let priceDataRows = 0
  let verificationDataRows = 0
  const canonicalRows = []
  const canonicalRowObjects = []

  if (priceHeaderRow) {
    for (let rowNumber = priceHeaderRow + 1; rowNumber <= priceSheet.rowCount; rowNumber += 1) {
      const row = priceSheet.getRow(rowNumber)
      if (isBlank(row.getCell(2).value)) continue
      priceDataRows += 1
      priceSequences.push(Number(row.getCell(1).value))
      priceRows.push({
        sequence: Number(row.getCell(1).value),
        itemCode: cellText(row.getCell(2).value),
        itemName: cellText(row.getCell(3).value),
        unit: cellText(row.getCell(4).value),
        materialCost: Number(row.getCell(5).value),
        laborCost: Number(row.getCell(6).value),
        unitCost: Number(row.getCell(7).value),
        category: cellText(row.getCell(8).value),
        workContextCode: cellText(row.getCell(9).value),
        workContextNameTh: cellText(row.getCell(10).value),
        itemTypeCode: cellText(row.getCell(11).value),
        itemTypeNameTh: cellText(row.getCell(12).value),
        status: cellText(row.getCell(13).value),
      })

      for (const columnNumber of [5, 6, 7]) {
        const cell = row.getCell(columnNumber)
        if (typeof cell.value !== 'number' || !Number.isFinite(cell.value)) {
          failures.push(`Excel money cell is not numeric: ${priceSheet.name}!${cell.address}`)
        }
        if (cell.numFmt !== MONEY_FORMAT) {
          failures.push(
            `Excel money format mismatch: ${priceSheet.name}!${cell.address}=${cell.numFmt}`,
          )
        }
      }
    }
  }

  if (verificationHeaderRow) {
    for (
      let rowNumber = verificationHeaderRow + 1;
      rowNumber <= verificationSheet.rowCount;
      rowNumber += 1
    ) {
      const row = verificationSheet.getRow(rowNumber)
      if (isBlank(row.getCell(2).value)) continue
      verificationDataRows += 1
      const canonicalJson = row.getCell(16).value
      if (typeof canonicalJson !== 'string' || canonicalJson.length === 0) {
        failures.push(
          `Excel canonical JSON is missing: ${verificationSheet.name}!${row.getCell(16).address}`,
        )
        continue
      }
      try {
        const canonicalRow = JSON.parse(canonicalJson)
        if (!canonicalRow || typeof canonicalRow !== 'object' || Array.isArray(canonicalRow)) {
          failures.push(
            `Excel canonical JSON is not an object: ${verificationSheet.name}!${row.getCell(16).address}`,
          )
          continue
        }

        const expectedKeys = VERIFICATION_HEADERS.slice(0, -1)
        if (!sameStrings(Object.keys(canonicalRow), expectedKeys)) {
          failures.push(
            `Excel canonical key order mismatch: ${verificationSheet.name}!${row.getCell(16).address}`,
          )
        }
        expectedKeys.forEach((key, index) => {
          const actual = cellText(row.getCell(index + 1).value)
          const expected = canonicalVerificationCellText(canonicalRow[key])
          if (actual !== expected) {
            failures.push(
              `Excel verification field mismatch: ${verificationSheet.name}!${row.getCell(index + 1).address}`,
            )
          }
        })

        canonicalRows.push(canonicalJson)
        canonicalRowObjects.push(canonicalRow)
      } catch {
        failures.push(
          `Excel canonical JSON is invalid: ${verificationSheet.name}!${row.getCell(16).address}`,
        )
      }
    }
  }

  const expectedItemCount = Number(version?.itemCount)
  if (priceDataRows !== expectedItemCount) {
    failures.push(`Excel price row count ${priceDataRows} != ${expectedItemCount}`)
  }
  if (verificationDataRows !== expectedItemCount) {
    failures.push(`Excel verification row count ${verificationDataRows} != ${expectedItemCount}`)
  }

  for (let index = 0; index < priceSequences.length; index += 1) {
    if (priceSequences[index] !== index + 1) {
      failures.push(
        `Excel price sequence mismatch at index ${index}: ${priceSequences[index]} != ${index + 1}`,
      )
      break
    }
  }

  const canonicalRowsByCode = new Map()
  for (const canonicalRow of canonicalRowObjects) {
    const code = String(canonicalRow.item_code ?? '')
    if (canonicalRowsByCode.has(code)) {
      failures.push(`Excel canonical item code appears more than once: ${code}`)
    }
    canonicalRowsByCode.set(code, canonicalRow)
  }

  for (const priceRow of priceRows) {
    const canonicalRow = canonicalRowsByCode.get(priceRow.itemCode)
    if (!canonicalRow) {
      failures.push(`Excel price row has no canonical row: ${priceRow.itemCode}`)
      continue
    }
    verifyPriceRow(priceRow, canonicalRow, failures)
  }

  const reconstructedCanonicalJson = `[${canonicalRows.join(',')}]\n`
  const reconstructedDatasetHash = `sha256:${sha256(Buffer.from(reconstructedCanonicalJson))}`
  if (reconstructedDatasetHash !== version?.datasetHash) {
    failures.push(
      `Excel canonical hash ${reconstructedDatasetHash} != ${version?.datasetHash ?? 'missing'}`,
    )
  }

  let activeCanonicalRows = null
  let inactiveCanonicalRows = null
  if (manifestSchemaVersion === ARTIFACT_MANIFEST_SCHEMA_VERSION) {
    activeCanonicalRows = canonicalRowObjects.filter((row) => row.is_active === true).length
    inactiveCanonicalRows = canonicalRowObjects.filter((row) => row.is_active === false).length
    if (activeCanonicalRows + inactiveCanonicalRows !== canonicalRowObjects.length) {
      failures.push('Excel canonical is_active values must all be boolean')
    }
    if (activeCanonicalRows !== version?.activeItemCount) {
      failures.push(`Excel canonical active row count ${activeCanonicalRows} != ${version?.activeItemCount}`)
    }
    if (inactiveCanonicalRows !== version?.inactiveItemCount) {
      failures.push(`Excel canonical inactive row count ${inactiveCanonicalRows} != ${version?.inactiveItemCount}`)
    }
    verifyPdfExcelRowParity(domProof, canonicalRowObjects, version, failures)
  }

  const documentValues = readKeyValueSheet(documentSheet)
  assertDocumentValue(documentValues, 'ฉบับบัญชีราคา', version?.versionString, failures)
  assertDocumentValue(
    documentValues,
    'ค่าแฮชชุดข้อมูล SHA-256',
    version?.datasetHash,
    failures,
  )
  const documentCount = parseLocalizedInteger(
    documentValues.get('จำนวนรายการภายใต้ค่าแฮชชุดข้อมูล'),
  )
  if (documentCount !== expectedItemCount) {
    failures.push(`Excel document item count ${documentCount} != ${expectedItemCount}`)
  }

  for (const sheet of workbook.worksheets) {
    const oddFooter = sheet.headerFooter?.oddFooter ?? ''
    const evenFooter = sheet.headerFooter?.evenFooter ?? ''
    if (
      !oddFooter.includes(`&L${EXPECTED_DEPARTMENT_FOOTER}`) ||
      !evenFooter.includes(`&L${EXPECTED_DEPARTMENT_FOOTER}`)
    ) {
      failures.push(`Excel department footer mismatch: ${sheet.name}`)
    }

    sheet.eachRow((row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (isFormulaOrHyperlink(cell.value)) {
          failures.push(`Excel formula or hyperlink found: ${sheet.name}!${cell.address}`)
        }
      })
    })
  }

  return {
    sheetNames,
    visibleSheets,
    priceHeaderRow,
    verificationHeaderRow,
    priceDataRows,
    verificationDataRows,
    reconstructedDatasetHash,
    activeCanonicalRows,
    inactiveCanonicalRows,
  }
}

function verifyPdf(buffer, domProof, failures) {
  let pageCount = null
  try {
    pageCount = countPdfPages(buffer)
  } catch (error) {
    failures.push(`PDF parse failed: ${error instanceof Error ? error.message : String(error)}`)
    return { pageCount }
  }

  const expectedPageCount = Number(domProof?.expectedPageCount)
  if (pageCount !== expectedPageCount) {
    failures.push(`PDF page count ${pageCount} != ${expectedPageCount}`)
  }

  const text = buffer.toString('latin1')
  if (/\/Encrypt\b/.test(text)) failures.push('PDF must not be encrypted')
  if (/\/JavaScript\b|\/JS\b/.test(text)) failures.push('PDF must not contain JavaScript')
  if (/\/AcroForm\b/.test(text)) failures.push('PDF must not contain an interactive form')

  return { pageCount }
}

function verifyPrintHtml(buffer, manifest, failures) {
  const html = buffer.toString('utf8')
  if (!html.includes(manifest.version?.datasetHash ?? '__missing_hash__')) {
    failures.push('Print HTML does not contain the selected dataset hash')
  }
  if (!html.includes('รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน')) {
    failures.push('Print HTML does not contain the approved document title')
  }
  return { bytes: buffer.length }
}

function verifyDomProof(domProof, version, pdfPresentation, schemaVersion, failures) {
  if (!domProof || typeof domProof !== 'object') {
    failures.push('DOM proof is missing')
    return
  }

  const expectedPageCount = Number(domProof.expectedPageCount)
  const priceSectionCount = Number(domProof.priceSectionCount)
  if (domProof.readyState !== 'complete') failures.push('DOM proof was not captured at readyState complete')
  if (domProof.fontsReady !== true) failures.push('DOM proof did not confirm document fonts')
  if (domProof.imagesReady !== true) failures.push('DOM proof did not confirm document images')
  if (domProof.hashPresent !== true) failures.push('DOM dataset hash is missing')
  if (domProof.watermarkPresent !== true) failures.push('DOM watermark text is missing')

  if (schemaVersion === LEGACY_ARTIFACT_MANIFEST_SCHEMA_VERSION) {
    const expectedItemCount = Number(version?.itemCount)
    if (Number(domProof.rowCount) !== expectedItemCount) failures.push('DOM row count mismatch')
    if (Number(domProof.firstSeqInDom) !== 1) failures.push('DOM first sequence is not 1')
    if (Number(domProof.lastSeqInDom) !== expectedItemCount) failures.push('DOM last sequence mismatch')
    if (Number(domProof.uniqueSeqCount) !== expectedItemCount) failures.push('DOM unique sequence mismatch')
    if (Number(domProof.sequenceBreakCount) !== 0) failures.push('DOM sequence contains a break')
    if (!Number.isInteger(priceSectionCount) || priceSectionCount < 1) {
      failures.push('DOM price section count is invalid')
    }
  } else if (schemaVersion === ARTIFACT_MANIFEST_SCHEMA_VERSION) {
    verifyP19DomProof(domProof, version, pdfPresentation, failures)
    const displayedItemCount = Number(pdfPresentation?.displayedItemCount)
    const minimumPriceSections = displayedItemCount === 0 ? 0 : 1
    if (!Number.isInteger(priceSectionCount) || priceSectionCount < minimumPriceSections) {
      failures.push('DOM price section count is invalid')
    }
  }

  if (expectedPageCount !== priceSectionCount + 1) {
    failures.push('DOM expected page count must equal cover plus price sections')
  }
}

function verifyP19DomProof(domProof, version, pdfPresentation, failures) {
  const totalItemCount = Number(version?.itemCount)
  const activeItemCount = Number(version?.activeItemCount)
  const inactiveItemCount = Number(version?.inactiveItemCount)
  const displayedItemCount = Number(pdfPresentation?.displayedItemCount)
  const excludedInactiveItemCount = Number(pdfPresentation?.excludedInactiveItemCount)
  const rowCount = Number(domProof.rowCount)
  const requiredNonNegativeIntegers = [
    'rowCount',
    'totalItemCount',
    'displayedItemCount',
    'activeItemCount',
    'inactiveItemCount',
    'excludedInactiveItemCount',
    'activeRowCount',
    'inactiveRowCount',
    'invalidRowActiveCount',
    'inactiveMarkedRowCount',
    'uniqueDisplayOrderCount',
    'invalidDisplayOrderCount',
    'invalidCategoryMetadataCount',
    'visibleSequenceMismatchCount',
    'categorySequenceBreakCount',
    'categoryReentryCount',
    'categoryCount',
    'invalidParityMetadataCount',
  ]
  if (requiredNonNegativeIntegers.some(
    (field) => !isNonNegativeInteger(domProof[field]),
  )) {
    failures.push('DOM P-19 count or sequence metadata is invalid')
  }

  if (domProof.pdfPolicy !== pdfPresentation?.mode) failures.push('DOM PDF policy mismatch')
  if (domProof.pdfHashScope !== pdfPresentation?.hashScope) {
    failures.push('DOM PDF hash scope mismatch')
  }
  if (domProof.hashScopeLabelPresent !== true) {
    failures.push('DOM complete-version hash scope label is missing')
  }
  if (Number(domProof.totalItemCount) !== totalItemCount) {
    failures.push('DOM complete-version item count mismatch')
  }
  if (Number(domProof.activeItemCount) !== activeItemCount) {
    failures.push('DOM active item count mismatch')
  }
  if (Number(domProof.inactiveItemCount) !== inactiveItemCount) {
    failures.push('DOM inactive item count mismatch')
  }
  if (Number(domProof.displayedItemCount) !== displayedItemCount || rowCount !== displayedItemCount) {
    failures.push('DOM row count mismatch')
  }
  if (Number(domProof.excludedInactiveItemCount) !== excludedInactiveItemCount) {
    failures.push('DOM excluded inactive item count mismatch')
  }
  if (Number(domProof.activeRowCount) + Number(domProof.inactiveRowCount) !== rowCount) {
    failures.push('DOM rendered active/inactive row counts do not equal the displayed count')
  }
  if (Number(domProof.invalidRowActiveCount) !== 0) {
    failures.push('DOM row active metadata is invalid')
  }
  if (Number(domProof.uniqueDisplayOrderCount) !== rowCount) {
    failures.push('DOM display-order values are not unique')
  }
  if (Number(domProof.invalidDisplayOrderCount) !== 0) {
    failures.push('DOM display-order metadata is invalid')
  }
  if (Number(domProof.invalidCategoryMetadataCount) !== 0) {
    failures.push('DOM category metadata is invalid')
  }
  if (Number(domProof.invalidParityMetadataCount) !== 0) {
    failures.push('DOM PDF/Excel parity metadata is invalid')
  }
  if (!Array.isArray(domProof.displayedRows)) {
    failures.push('DOM displayed-row parity proof is missing')
  } else if (domProof.displayedRows.length !== rowCount) {
    failures.push('DOM displayed-row parity proof count mismatch')
  }
  if (Number(domProof.visibleSequenceMismatchCount) !== 0) {
    failures.push('DOM visible category-local sequence mismatches metadata')
  }
  if (Number(domProof.categorySequenceBreakCount) !== 0) {
    failures.push('DOM category-local sequence contains a break')
  }
  if (Number(domProof.categoryReentryCount) !== 0) {
    failures.push('DOM category rows are not contiguous')
  }
  const categoryCount = Number(domProof.categoryCount)
  if (!Number.isInteger(categoryCount) || categoryCount < (rowCount === 0 ? 0 : 1)) {
    failures.push('DOM category count is invalid')
  }

  if (version?.status === 'draft') {
    if (Number(domProof.activeRowCount) !== activeItemCount) {
      failures.push('Draft DOM active row count mismatch')
    }
    if (Number(domProof.inactiveRowCount) !== inactiveItemCount) {
      failures.push('Draft DOM inactive row count mismatch')
    }
    if (Number(domProof.inactiveMarkedRowCount) !== inactiveItemCount) {
      failures.push('Draft DOM inactive rows are not all visibly marked')
    }
  } else {
    if (Number(domProof.activeRowCount) !== displayedItemCount) {
      failures.push('Official DOM contains a non-active displayed row')
    }
    if (Number(domProof.inactiveRowCount) !== 0) {
      failures.push('Official DOM contains an inactive row')
    }
    if (Number(domProof.inactiveMarkedRowCount) !== 0) {
      failures.push('Official DOM contains an inactive-row marker')
    }
  }
}

function verifyPdfExcelRowParity(domProof, canonicalRows, version, failures) {
  if (!Array.isArray(domProof?.displayedRows)) return

  const expectedRows = buildExpectedPdfRows(canonicalRows, version?.status)
  const actualRows = domProof.displayedRows
  if (actualRows.length !== expectedRows.length) {
    failures.push(
      `PDF/Excel row parity count ${actualRows.length} != ${expectedRows.length}`,
    )
  }

  const fields = [
    'identityId',
    'itemCode',
    'itemName',
    'unit',
    'materialCost',
    'laborCost',
    'unitCost',
    'categoryCode',
    'categoryName',
    'displayOrder',
    'categoryLocalSequence',
    'isActive',
  ]
  let mismatchCount = 0
  for (let index = 0; index < Math.min(actualRows.length, expectedRows.length); index += 1) {
    const actual = actualRows[index]
    const expected = expectedRows[index]
    for (const field of fields) {
      if (!actual || typeof actual !== 'object' || actual[field] !== expected[field]) {
        mismatchCount += 1
        if (mismatchCount <= 20) {
          failures.push(
            `PDF/Excel row parity mismatch at index ${index} (${expected.itemCode}): ${field}`,
          )
        }
      }
    }
  }
  if (mismatchCount > 20) {
    failures.push(`PDF/Excel row parity has ${mismatchCount - 20} additional mismatches`)
  }
}

function buildExpectedPdfRows(canonicalRows, status) {
  const sourceRows = status === 'draft'
    ? canonicalRows
    : canonicalRows.filter((row) => row.is_active === true)
  const orderedRows = [...sourceRows].sort((left, right) => {
    const displayOrderDifference = Number(left.display_order) - Number(right.display_order)
    if (displayOrderDifference !== 0) return displayOrderDifference
    return String(left.item_code).localeCompare(String(right.item_code), 'en')
  })
  const categoryGroups = new Map()
  for (const row of orderedRows) {
    const key = pdfCategoryKey(row)
    const group = categoryGroups.get(key)
    if (group) group.push(row)
    else categoryGroups.set(key, [row])
  }

  return [...categoryGroups.values()].flatMap((rows) => rows.map((row, index) => ({
    identityId: row.identity_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    unit: row.unit,
    materialCost: row.material_cost,
    laborCost: row.labor_cost,
    unitCost: row.unit_cost,
    categoryCode: row.category_code ?? '',
    categoryName: row.category_name ?? '',
    displayOrder: row.display_order,
    categoryLocalSequence: index + 1,
    isActive: row.is_active,
  })))
}

function pdfCategoryKey(row) {
  const code = normalizedPdfCategoryText(row.category_code)
  if (code) return `code:${encodeURIComponent(code)}`
  const name = normalizedPdfCategoryText(row.category_name)
  return name ? `name:${encodeURIComponent(name)}` : 'uncategorized'
}

function normalizedPdfCategoryText(value) {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFC').trim()
  return normalized.length > 0 ? normalized : null
}

function validateManifestShape(manifest, failures) {
  if (!SUPPORTED_ARTIFACT_MANIFEST_SCHEMA_VERSIONS.has(manifest?.schemaVersion)) {
    failures.push(
      `Manifest schema version ${manifest?.schemaVersion ?? 'missing'} is unsupported`,
    )
  }
  if (manifest?.environment !== 'local') failures.push('Manifest environment must be local')
  if (
    typeof manifest?.generatedAt !== 'string'
    || !Number.isFinite(Date.parse(manifest.generatedAt))
  ) {
    failures.push('Manifest generatedAt is invalid')
  }
  if (!manifest?.gitCommit || !/^[0-9a-f]{40}$/.test(manifest.gitCommit)) {
    failures.push('Manifest gitCommit must be a full lowercase commit SHA')
  }
  if (
    typeof manifest?.gitBranch !== 'string'
    || manifest.gitBranch.length === 0
    || manifest.gitBranch.length > 255
    || /[\r\n\t]/.test(manifest.gitBranch)
  ) {
    failures.push('Manifest gitBranch is invalid')
  }
  if (manifest?.source?.actorRole !== 'admin') {
    failures.push('Manifest source actor role must be admin')
  }
  if (!/^http:\/\/(127\.0\.0\.1|localhost):[0-9]+$/.test(manifest?.source?.appOrigin ?? '')) {
    failures.push('Manifest source app origin must be Local loopback')
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(manifest?.source?.excelRequestId ?? '')) {
    failures.push('Manifest Excel request ID is invalid')
  }
  if (!manifest?.version?.versionString) failures.push('Manifest version string is missing')
  if (!Number.isInteger(Number(manifest?.version?.itemCount))) {
    failures.push('Manifest item count is invalid')
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(manifest?.version?.datasetHash ?? '')) {
    failures.push('Manifest dataset hash is invalid')
  }
  if (manifest?.schemaVersion === ARTIFACT_MANIFEST_SCHEMA_VERSION) {
    validateP19ManifestShape(manifest, failures)
  }
  for (const name of ['excel', 'pdf', 'printHtml']) {
    const artifact = manifest?.artifacts?.[name]
    if (!artifact?.path) failures.push(`Manifest ${name} path is missing`)
    if (!Number.isInteger(Number(artifact?.bytes)) || Number(artifact?.bytes) <= 0) {
      failures.push(`Manifest ${name} byte count is invalid`)
    }
    if (!/^[0-9a-f]{64}$/.test(artifact?.binarySha256 ?? '')) {
      failures.push(`Manifest ${name} binary SHA-256 is invalid`)
    }
  }
}

function validateP19ManifestShape(manifest, failures) {
  const version = manifest.version
  const presentation = manifest.pdfPresentation
  const itemCount = version?.itemCount
  const activeItemCount = version?.activeItemCount
  const inactiveItemCount = version?.inactiveItemCount
  const displayedItemCount = presentation?.displayedItemCount
  const excludedInactiveItemCount = presentation?.excludedInactiveItemCount

  if (!['active', 'archived', 'draft'].includes(version?.status)) {
    failures.push('Manifest version status is not PDF-exportable')
  }
  if (!isNonNegativeInteger(itemCount) || itemCount < 1) failures.push('Manifest item count is invalid for schema 2')
  if (!isNonNegativeInteger(activeItemCount)) failures.push('Manifest active item count is invalid')
  if (!isNonNegativeInteger(inactiveItemCount)) failures.push('Manifest inactive item count is invalid')
  if (activeItemCount + inactiveItemCount !== itemCount) {
    failures.push('Manifest active/inactive counts do not equal the complete item count')
  }
  if (presentation?.policy !== ARTIFACT_PDF_PRESENTATION_POLICY) {
    failures.push('Manifest PDF presentation policy is invalid')
  }
  if (presentation?.hashScope !== ARTIFACT_PDF_HASH_SCOPE) {
    failures.push('Manifest PDF hash scope is invalid')
  }
  if (!isNonNegativeInteger(presentation?.totalItemCount)) {
    failures.push('Manifest PDF total item count is invalid')
  } else if (presentation.totalItemCount !== itemCount) {
    failures.push('Manifest PDF total item count mismatch')
  }
  if (!isNonNegativeInteger(presentation?.inactiveItemCount)) {
    failures.push('Manifest PDF inactive item count is invalid')
  } else if (presentation.inactiveItemCount !== inactiveItemCount) {
    failures.push('Manifest PDF inactive item count mismatch')
  }
  if (!isNonNegativeInteger(displayedItemCount)) failures.push('Manifest PDF displayed item count is invalid')
  if (!isNonNegativeInteger(excludedInactiveItemCount)) {
    failures.push('Manifest PDF excluded inactive item count is invalid')
  }

  if (version?.status === 'draft') {
    if (presentation?.mode !== 'draft-all-mark-inactive') {
      failures.push('Manifest draft PDF presentation mode is invalid')
    }
    if (displayedItemCount !== itemCount || excludedInactiveItemCount !== 0) {
      failures.push('Manifest draft PDF counts must include the complete version')
    }
  } else {
    if (presentation?.mode !== 'official-active-only') {
      failures.push('Manifest official PDF presentation mode is invalid')
    }
    if (
      displayedItemCount !== activeItemCount
      || excludedInactiveItemCount !== inactiveItemCount
    ) {
      failures.push('Manifest official PDF counts must describe the active-only view')
    }
  }
}

function isNonNegativeInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function resolveArtifactPath(manifestDirectory, value) {
  if (typeof value !== 'string' || value.length === 0) return null
  if (isAbsolute(value)) throw new Error(`Artifact path must be relative: ${value}`)
  const normalized = normalize(value)
  if (normalized !== basename(normalized)) {
    throw new Error(`Artifact path must name a file beside the manifest: ${value}`)
  }
  const absolute = resolve(manifestDirectory, normalized)
  if (relative(manifestDirectory, absolute).startsWith('..')) {
    throw new Error(`Artifact path leaves manifest directory: ${value}`)
  }
  return absolute
}

async function verifyBinaryFile(name, path, expected, failures) {
  if (!path) return null
  try {
    const [buffer, fileStat] = await Promise.all([readFile(path), lstat(path)])
    if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
      failures.push(`${name} artifact must be a regular file`)
      return null
    }
    const binarySha256 = sha256(buffer)
    if (fileStat.size !== Number(expected?.bytes)) {
      failures.push(`${name} byte count ${fileStat.size} != ${expected?.bytes}`)
    }
    if (binarySha256 !== expected?.binarySha256) {
      failures.push(`${name} binary SHA-256 ${binarySha256} != ${expected?.binarySha256}`)
    }
    return { path, bytes: fileStat.size, binarySha256, buffer }
  } catch (error) {
    failures.push(`${name} file read failed: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function findHeaderRows(sheet, expectedHeaders) {
  const matches = []
  for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const actual = expectedHeaders.map((_, index) => cellText(sheet.getCell(rowNumber, index + 1).value))
    if (sameStrings(actual, expectedHeaders)) matches.push(rowNumber)
  }
  return matches
}

function readKeyValueSheet(sheet) {
  const values = new Map()
  for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const key = cellText(sheet.getCell(rowNumber, 1).value)
    if (!key) continue
    values.set(key, cellText(sheet.getCell(rowNumber, 2).value))
  }
  return values
}

function assertDocumentValue(values, key, expected, failures) {
  const actual = values.get(key)
  if (actual !== String(expected ?? '')) {
    failures.push(`Excel document value ${key}=${actual ?? 'missing'} != ${expected ?? 'missing'}`)
  }
}

function parseLocalizedInteger(value) {
  if (typeof value !== 'string') return Number.NaN
  const ascii = value
    .replace(/[๐-๙]/g, (digit) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(digit)))
    .replace(/[^0-9-]/g, '')
  return Number(ascii)
}

function isFormulaOrHyperlink(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    ('formula' in value || 'hyperlink' in value),
  )
}

function cellText(value) {
  if (value === null || typeof value === 'undefined') return ''
  if (typeof value === 'object' && 'richText' in value) {
    return value.richText.map((part) => part.text).join('')
  }
  return String(value)
}

function isBlank(value) {
  return cellText(value).length === 0
}

function sameStrings(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function summarizeBinary(file, semantic, path) {
  return {
    path,
    bytes: file.bytes,
    binarySha256: file.binarySha256,
    semantic,
  }
}

function canonicalVerificationCellText(value) {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

function verifyPriceRow(priceRow, canonicalRow, failures) {
  const expected = {
    sequence: Number(canonicalRow.display_order) + 1,
    itemCode: spreadsheetText(canonicalRow.item_code),
    itemName: spreadsheetText(canonicalRow.item_name),
    unit: spreadsheetText(canonicalRow.unit),
    materialCost: Number(canonicalRow.material_cost),
    laborCost: Number(canonicalRow.labor_cost),
    unitCost: Number(canonicalRow.unit_cost),
    category: spreadsheetText(canonicalRow.category_name ?? canonicalRow.category_code ?? ''),
    workContextCode: spreadsheetText(canonicalRow.work_context_code ?? ''),
    workContextNameTh: spreadsheetText(canonicalRow.work_context_name_th ?? ''),
    itemTypeCode: spreadsheetText(canonicalRow.item_type_code ?? ''),
    itemTypeNameTh: spreadsheetText(canonicalRow.item_type_name_th ?? ''),
    status: canonicalRow.is_active ? 'ใช้งาน' : 'ยกเลิกใช้',
  }

  for (const [field, expectedValue] of Object.entries(expected)) {
    if (priceRow[field] !== expectedValue) {
      failures.push(`Excel price field mismatch: ${priceRow.itemCode}.${field}`)
    }
  }
}

function spreadsheetText(value) {
  const text = String(value)
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

async function runCli() {
  const manifestPath = process.argv[2]
  if (!manifestPath) {
    throw new Error('Usage: npm run artifacts:master-catalog:verify -- <artifact-manifest.json>')
  }
  const result = await verifyMasterCatalogArtifacts(manifestPath)
  const resultPath = resolve(dirname(resolve(manifestPath)), 'artifact-verification.json')
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'passed') process.exitCode = 1
}

const isDirectExecution = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectExecution) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
