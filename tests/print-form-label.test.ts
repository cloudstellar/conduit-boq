import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('BOQ print form label', () => {
  it('uses form ปร.1 for every detail-page header', () => {
    const printPage = readFileSync(
      resolve(process.cwd(), 'app/boq/[id]/print/page.tsx'),
      'utf8'
    )

    expect(printPage.match(/formLabel="แบบ ปร\.1"/g)).toHaveLength(2)
    expect(printPage).not.toContain('formLabel="แบบ ปร.4 (ก)"')
  })
})
