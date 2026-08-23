import { describe, expect, it } from 'vitest'

import {
  alignPdfToWorkbook,
  normalizeText,
  parseCsv,
  parseSqlSnapshot,
  reconcileSynthetic,
} from '../scripts/reconcile-master-catalog-p50r.mjs'

function sqlRow(index: number) {
  const suffix = String(index).padStart(12, '0')
  return {
    id: `00000000-0000-4000-8000-${suffix}`,
    unit: 'ม.',
    remarks: null,
    category: 'synthetic',
    is_active: true,
    item_code: `ITEM-${String(index).padStart(4, '0')}`,
    item_name: `รายการทดสอบ ${index}`,
    unit_cost: 3,
    created_at: '2026-01-01T00:00:00+00:00',
    labor_cost: 2,
    updated_at: '2026-01-01T00:00:00+00:00',
    material_cost: 1,
  }
}

function sqlSnapshot(rows: ReturnType<typeof sqlRow>[]) {
  return [
    'INSERT INTO public.price_list',
    'SELECT * FROM jsonb_populate_recordset(NULL::public.price_list,',
    `$snapshot_20260621$${JSON.stringify(rows)}$snapshot_20260621$::jsonb);`,
  ].join('\n')
}

function pdfRow(
  index: number,
  displayRow: string,
  name: string,
  price: [number, number, number],
) {
  return {
    pdf_index: index,
    page: 2,
    table: 1,
    table_row: index + 2,
    display_row: displayRow,
    locator: `p02:t1:r${index + 2}:display-${displayRow}`,
    raw_name: name,
    normalized_name: name,
    raw_unit: 'ม.',
    normalized_unit: 'ม.',
    material: price[0],
    labor: price[1],
    total: price[2],
    ambiguity_codes: [],
  }
}

function workbookRow(
  physicalRow: number,
  sourceItemNo: string,
  name: string,
) {
  return {
    _physical_row: physicalRow,
    source_item_no: sourceItemNo,
    description_th: name,
    unit: 'ม.',
  }
}

describe('P-50R SOLO synthetic reconciliation', () => {
  it('parses RFC4180 Thai text, embedded quotes, commas, and newlines in memory', () => {
    const rows = parseCsv(
      'a,b,c\r\n"ท่อ, HDPE","ข้อความ ""อ้างอิง""","บรรทัดหนึ่ง\nบรรทัดสอง"\r\n',
    )

    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['ท่อ, HDPE', 'ข้อความ "อ้างอิง"', 'บรรทัดหนึ่ง\nบรรทัดสอง'],
    ])
    expect(normalizeText('  ท่อ\n  ร้อยสาย  ')).toBe('ท่อ ร้อยสาย')
  })

  it('accepts the exact 710-row JSON insert and rejects duplicate identity or bad arithmetic', () => {
    const rows = Array.from({ length: 710 }, (_, index) => sqlRow(index + 1))
    expect(parseSqlSnapshot(sqlSnapshot(rows))).toHaveLength(710)

    const duplicated = structuredClone(rows)
    duplicated[709].id = duplicated[0].id
    expect(() => parseSqlSnapshot(sqlSnapshot(duplicated))).toThrow(/duplicated/)

    const badPrice = structuredClone(rows)
    badPrice[0].unit_cost = 4
    expect(() => parseSqlSnapshot(sqlSnapshot(badPrice))).toThrow(/arithmetic/)
    expect(() => parseSqlSnapshot('SELECT 1;')).toThrow(/one public\.price_list/)
  })

  it('uses order, name, unit, and source ordinal—not price—as identity', () => {
    const workbook = [
      workbookRow(2, '1', 'งานวางท่อ 1-Ø4 PVC'),
      workbookRow(3, '99', 'รายการ workbook-only'),
      workbookRow(4, '2', 'งานเจาะหน้าต่างบ่อพัก'),
      workbookRow(5, '3', 'งานเจาะผนังบ่อพัก'),
    ]
    const pdf = [
      pdfRow(1, '1', 'งานวางท่อ 1-Ø4 PVC', [10, 2, 12]),
      pdfRow(2, '2', 'งานเจาะหน้าต่างบ่อพัก', [0, 1764, 1764]),
      pdfRow(3, '3', 'งานเจาะผนังบ่อพัก', [0, 1764, 1764]),
    ]

    const result = reconcileSynthetic(pdf, workbook)
    expect(result.matches.map((match) => match.workbook._physical_row)).toEqual([2, 4, 5])
    expect(result.workbookOnly.map((row) => row._physical_row)).toEqual([3])
    expect(result.pdfOnly).toEqual([])
    expect(result.alternateOptimalAlignment).toBe(false)
    expect(result.matches.every((match) => match.confidence === 'high')).toBe(true)

    const changedPrices = structuredClone(pdf)
    changedPrices[0].material = 999999
    changedPrices[0].labor = 888888
    changedPrices[0].total = 1888887
    expect(
      alignPdfToWorkbook(changedPrices, workbook).matches.map(
        (match) => match.workbook._physical_row,
      ),
    ).toEqual([2, 4, 5])
  })

  it('detects an alternate-optimal identity path for indistinguishable candidates', () => {
    const pdf = [pdfRow(1, '1', 'รายการซ้ำ', [1, 2, 3])]
    const workbook = [
      workbookRow(2, '1', 'รายการซ้ำ'),
      workbookRow(3, '1', 'รายการซ้ำ'),
    ]

    expect(alignPdfToWorkbook(pdf, workbook).alternateOptimalAlignment).toBe(true)
  })

  it('does not call an ordinal-only name mismatch high-confidence', () => {
    const result = alignPdfToWorkbook(
      [pdfRow(1, '1', 'งานคนละประเภทโดยสิ้นเชิง', [1, 2, 3])],
      [workbookRow(2, '1', 'รายการที่ไม่เกี่ยวข้องกัน')],
    )

    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].ordinalEqual).toBe(true)
    expect(result.matches[0].confidence).not.toBe('high')
  })

  it('keeps two equal price triples attached to distinct source descriptions', () => {
    const workbook = [
      workbookRow(620, '2', 'งานเจาะผนังบ่อพักย่อย (PB)'),
      workbookRow(621, '1', 'งานเจาะหน้าต่างบ่อพัก (MH)'),
    ]
    const pdf = [
      pdfRow(1, '2', 'งานเจาะผนังบ่อพักย่อย (PB)', [0, 1764, 1764]),
      pdfRow(2, '1', 'งานเจาะหน้าต่างบ่อพัก (MH)', [0, 1764, 1764]),
    ]

    expect(
      reconcileSynthetic(pdf, workbook).matches.map((match) => [
        match.pdf.raw_name,
        match.workbook._physical_row,
      ]),
    ).toEqual([
      ['งานเจาะผนังบ่อพักย่อย (PB)', 620],
      ['งานเจาะหน้าต่างบ่อพัก (MH)', 621],
    ])
  })
})
