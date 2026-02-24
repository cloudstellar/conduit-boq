/**
 * Print Pagination Utilities
 *
 * ใช้สำหรับคำนวณการแบ่งหน้าเอกสาร BOQ แบบ ปร.4(ก)
 * - A4 Landscape (297mm × 210mm)
 * - Font: TH Sarabun New 10-14pt
 * - ห้ามใช้ ellipsis (เอกสารราชการ — แสดงข้อมูลครบ)
 * - ข้อความยาว → ตัดเป็นหลายแถว ทุกแถวสูงเท่ากัน
 */

// ──────────────────────────────────
// Constants (mm, based on A4 Landscape)
// ──────────────────────────────────

/** พื้นที่ใช้งานได้จริง: 210mm - 20mm margin */
const USABLE_HEIGHT = 190;

/** ความสูงส่วน header (logo + page-info) */
const HEADER_HEIGHT = 15;

/** ความสูง title line */
const TITLE_HEIGHT = 8;

/** ความสูง unit label ("หน่วย - บาท") */
const UNIT_LABEL_HEIGHT = 5;

/** ความสูง table header (2-row thead) */
const TABLE_HEADER_HEIGHT = 12;

/** ความสูงต่อแถวข้อมูล (conservative) */
const ROW_HEIGHT = 6;

/** ความสูง footer (เงื่อนไข + หมายเหตุ + ลายเซ็น) */
const FOOTER_HEIGHT = 30;

/** ความสูงแถวรวมยอด */
const TOTALS_ROW_HEIGHT = 8;

/** เผื่อพื้นที่ป้องกันล้น */
const SAFETY_MARGIN = 10;

/** จำนวนตัวอักษรต่อบรรทัดในคอลัมน์ "รายการ" (BOQ items table)
 *  วัดจริง: 463px ÷ ~8px/char = 58 chars (TH Sarabun New 10pt) */
const ITEM_COL_MAX_CHARS = 58;

/** จำนวนตัวอักษรต่อบรรทัดในคอลัมน์ "รายการ" (Summary table)
 *  วัดจริง: 433px ÷ ~8px/char = 54 chars (TH Sarabun New 10pt) */
const SUMMARY_COL_MAX_CHARS = 54;

/** Info section: ตัวอักษรต่อบรรทัด (แต่ละคอลัมน์ซ้าย/ขวา) */
const INFO_COL_MAX_CHARS = 32;

/** ความสูงต่อบรรทัดใน info section (13pt + line-height) */
const INFO_LINE_HEIGHT = 6;

// ──────────────────────────────────
// Text Splitting
// ──────────────────────────────────

/**
 * ตัดข้อความยาวเป็นหลายบรรทัด แต่ละบรรทัดไม่เกิน maxChars ตัวอักษร
 * ใช้กับทุกตาราง (ห้ามใช้ ellipsis — เอกสารราชการ)
 */
export function splitText(text: string, maxChars: number): string[] {
    if (!text || text.length <= maxChars) return [text || ''];
    const lines: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxChars) {
            lines.push(remaining);
            break;
        }
        // Try to break at a space/dash near maxChars
        let breakAt = maxChars;
        const searchFrom = Math.max(0, maxChars - 8);
        for (let i = maxChars; i >= searchFrom; i--) {
            const ch = remaining[i];
            if (ch === ' ' || ch === '-' || ch === '/' || ch === '(' || ch === ')') {
                breakAt = i + 1;
                break;
            }
        }
        lines.push(remaining.slice(0, breakAt).trimEnd());
        remaining = remaining.slice(breakAt).trimStart();
    }
    return lines;
}

/**
 * คำนวณจำนวนแถวที่รายการใช้ (รวม continuation rows)
 */
export function countItemRows(itemName: string, maxChars: number = ITEM_COL_MAX_CHARS): number {
    return splitText(itemName, maxChars).length;
}

// ──────────────────────────────────
// Info Section Height Estimation
// ──────────────────────────────────

/**
 * ประมาณความสูง info section จากความยาวข้อความ
 * Info section มี 2 คอลัมน์:
 *   ซ้าย: ส่วนงาน (1 line), บัญชีราคา (~2 lines), เส้นทาง
 *   ขวา: โครงการ, พื้นที่ก่อสร้าง
 */
export function estimateInfoHeight(
    routeName: string,
    projectName: string,
    constructionArea: string,
): number {
    const leftLines =
        1 + // ส่วนงาน
        2 + // บัญชีราคา (ข้อความยาวประมาณ 2 บรรทัด)
        Math.ceil((routeName.length + 10) / INFO_COL_MAX_CHARS); // เส้นทาง + label

    const rightLines =
        Math.ceil((projectName.length + 10) / INFO_COL_MAX_CHARS) + // โครงการ
        Math.ceil(((constructionArea || '-').length + 15) / INFO_COL_MAX_CHARS); // พื้นที่

    return Math.max(leftLines, rightLines) * INFO_LINE_HEIGHT;
}

// ──────────────────────────────────
// Page Capacity Calculation
// ──────────────────────────────────

/**
 * คำนวณจำนวนแถวข้อมูลสูงสุดที่ใส่ได้ในหน้า
 * @param infoHeight ความสูง info section (คำนวณจาก estimateInfoHeight)
 * @param isLastPage หน้าสุดท้ายของ section (ต้องมี totals + footer)
 * @param hasContinueIndicator หน้ากลาง (ต้องมี "ต่อหน้าถัดไป")
 */
export function calculateMaxRowsForPage(
    infoHeight: number,
    isLastPage: boolean,
    hasContinueIndicator: boolean = false,
): number {
    const fixedTop = HEADER_HEIGHT + TITLE_HEIGHT + infoHeight + UNIT_LABEL_HEIGHT + TABLE_HEADER_HEIGHT;
    const fixedBottom = isLastPage
        ? TOTALS_ROW_HEIGHT + FOOTER_HEIGHT
        : hasContinueIndicator
            ? 10 // space for "ต่อหน้าถัดไป"
            : 0;

    const available = USABLE_HEIGHT - fixedTop - fixedBottom - SAFETY_MARGIN;
    return Math.max(3, Math.floor(available / ROW_HEIGHT));
}

// ──────────────────────────────────
// Chunking: BOQ Items
// ──────────────────────────────────

interface ChunkableItem {
    item_name: string;
}

/**
 * แบ่งรายการ (BOQ items) เป็น chunks ตามจำนวนแถวสูงสุดต่อหน้า
 * นับ continuation rows (จาก splitText) รวมด้วย
 *
 * @param items รายการทั้งหมดของ route
 * @param maxRowsFirstPage จำนวนแถวสูงสุดหน้าแรก
 * @param maxRowsMiddlePage จำนวนแถวสูงสุดหน้ากลาง
 * @param maxRowsLastPage จำนวนแถวสูงสุดหน้าสุดท้าย (เผื่อ totals + footer)
 */
export function chunkItems<T extends ChunkableItem>(
    items: T[],
    maxRowsFirstPage: number,
    maxRowsMiddlePage: number,
    maxRowsLastPage: number,
    textColMaxChars: number = ITEM_COL_MAX_CHARS,
): T[][] {
    if (items.length === 0) return [[]];

    // Pre-calculate total rows needed per item
    const itemRows = items.map(item => ({
        item,
        rows: countItemRows(item.item_name, textColMaxChars),
    }));

    // Calculate total rows needed
    const totalRowsNeeded = itemRows.reduce((sum, ir) => sum + ir.rows, 0);

    // If everything fits in one page (as last page), return single chunk
    if (totalRowsNeeded <= maxRowsLastPage) {
        return [items];
    }

    const chunks: T[][] = [];
    let currentChunk: T[] = [];
    let currentRowCount = 0;
    let isFirstPage = true;

    for (let i = 0; i < itemRows.length; i++) {
        const { item, rows } = itemRows[i];
        const remainingItems = itemRows.slice(i + 1);
        const remainingRows = remainingItems.reduce((s, ir) => s + ir.rows, 0);

        // Determine max rows for current page
        const currentMaxRows = isFirstPage
            ? maxRowsFirstPage
            : maxRowsMiddlePage;

        // Check: will the remaining items (including this one) fit in a lastPage?
        if (currentRowCount + rows + remainingRows <= maxRowsLastPage && chunks.length > 0) {
            // Everything remaining fits in the last page — put it all there
            currentChunk.push(item);
            for (const ri of remainingItems) {
                currentChunk.push(ri.item);
            }
            chunks.push(currentChunk);
            return chunks;
        }

        // Check if adding this item exceeds current page capacity
        if (currentRowCount + rows > currentMaxRows && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [item];
            currentRowCount = rows;
            isFirstPage = false;
        } else {
            currentChunk.push(item);
            currentRowCount += rows;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

// ──────────────────────────────────
// Chunking: Summary Routes
// ──────────────────────────────────

interface ChunkableRoute {
    route_name: string;
}

/**
 * แบ่งเส้นทาง (Summary table) เป็น chunks
 * หน้าสุดท้ายต้องเผื่อที่สำหรับ: แถวรวม + Calc Summary + Thai Amount + Footer
 */
export function chunkSummaryRoutes<T extends ChunkableRoute>(
    routes: T[],
    maxRowsPerPage: number,
    maxRowsLastPage: number,
): T[][] {
    if (routes.length === 0) return [[]];

    // Pre-calculate rows per route (including continuation rows from long names)
    const routeRows = routes.map(route => ({
        route,
        rows: splitText(route.route_name, SUMMARY_COL_MAX_CHARS).length,
    }));

    const totalRows = routeRows.reduce((sum, rr) => sum + rr.rows, 0);

    // If everything fits in last page, return single chunk
    if (totalRows <= maxRowsLastPage) {
        return [routes];
    }

    const chunks: T[][] = [];
    let currentChunk: T[] = [];
    let currentRowCount = 0;

    for (let i = 0; i < routeRows.length; i++) {
        const { route, rows } = routeRows[i];
        const remaining = routeRows.slice(i + 1);
        const remainingRows = remaining.reduce((s, rr) => s + rr.rows, 0);

        // Will everything remaining (including this) fit in lastPage?
        if (currentRowCount === 0 && chunks.length > 0) {
            // fresh page
        }
        if (rows + remainingRows <= maxRowsLastPage && chunks.length > 0) {
            currentChunk.push(route);
            for (const rr of remaining) {
                currentChunk.push(rr.route);
            }
            chunks.push(currentChunk);
            return chunks;
        }

        if (currentRowCount + rows > maxRowsPerPage && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [route];
            currentRowCount = rows;
        } else {
            currentChunk.push(route);
            currentRowCount += rows;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

// ──────────────────────────────────
// Page Counting
// ──────────────────────────────────

interface PageCountInput {
    /** จำนวน chunks ต่อ route */
    routeChunkCounts: number[];
    /** จำนวน chunks ของหน้ารวมทุกเส้นทาง */
    consolidatedChunkCount: number;
    /** มีหน้ารวมทุกเส้นทางหรือไม่ (routes > 1) */
    hasConsolidatedPage: boolean;
}

/**
 * นับจำนวนหน้าทั้งหมดของ section ปร.4(ก)
 */
export function countBOQPages(input: PageCountInput): number {
    const routePages = input.routeChunkCounts.reduce((sum, count) => sum + count, 0);
    const consolidatedPages = input.hasConsolidatedPage ? input.consolidatedChunkCount : 0;
    return routePages + consolidatedPages;
}

// ──────────────────────────────────
// Export constants for testing
// ──────────────────────────────────

export const PRINT_CONSTANTS = {
    USABLE_HEIGHT,
    HEADER_HEIGHT,
    TITLE_HEIGHT,
    UNIT_LABEL_HEIGHT,
    TABLE_HEADER_HEIGHT,
    ROW_HEIGHT,
    FOOTER_HEIGHT,
    TOTALS_ROW_HEIGHT,
    SAFETY_MARGIN,
    ITEM_COL_MAX_CHARS,
    SUMMARY_COL_MAX_CHARS,
    INFO_COL_MAX_CHARS,
    INFO_LINE_HEIGHT,
} as const;
