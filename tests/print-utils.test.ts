import { describe, expect, it } from 'vitest'
import {
  calculateMaxRowsForPage,
  chunkItems,
  splitText,
} from '../lib/printUtils'

describe('print pagination utilities', () => {
  it('keeps short labels on one line', () => {
    expect(splitText('งานวางท่อ HDPE', 100)).toEqual(['งานวางท่อ HDPE'])
  })

  it('splits long Thai labels without losing words', () => {
    const source = 'งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก สำหรับพื้นที่ก่อสร้างพิเศษ'
    const lines = splitText(source, 20)

    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join('').replace(/\s/g, '')).toBe(source.replace(/\s/g, ''))
  })

  it('reserves fewer rows on a final page with totals and signature', () => {
    const middlePageRows = calculateMaxRowsForPage(30, false)
    const finalPageRows = calculateMaxRowsForPage(30, true)

    expect(finalPageRows).toBeLessThan(middlePageRows)
  })

  it('chunks items when the final-page capacity is exceeded', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      item_name: `รายการที่ ${index + 1}`,
    }))

    const chunks = chunkItems(items, 4, 4, 3)

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.flat()).toEqual(items)
  })
})
