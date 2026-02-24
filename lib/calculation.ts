/**
 * Shared calculation utilities for BOQ cost, VAT, and rounding.
 *
 * Rounding rules:
 * - Factor F: truncate to 4 decimal places (handled in FactorFSummary)
 * - Money amounts (ก่อน VAT, VAT, รวม): round to 2 decimal places
 * - VAT rounding follows Thai Revenue Department rules:
 *   3rd decimal < 5 → round down, >= 5 → round up (= standard Math.round)
 */

/** ปัดเศษ 2 ทศนิยม ตามหลักกรมสรรพากร (standard rounding) */
export function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * คำนวณ VAT จากยอดก่อน VAT
 * ปัดทุกขั้นตอนก่อนนำมาบวกกัน เพื่อให้ beforeVAT + vat = total เสมอ
 */
export function calculateVAT(
    amountBeforeVAT: number,
    rate = 0.07
): {
    beforeVAT: number;
    vat: number;
    total: number;
} {
    const beforeVAT = roundMoney(amountBeforeVAT);
    const vat = roundMoney(beforeVAT * rate);
    const total = roundMoney(beforeVAT + vat);
    return { beforeVAT, vat, total };
}

/**
 * กระจายยอดรวม (grand total) ลงแต่ละ route โดยไม่ให้คลาดเคลื่อน
 * เทคนิค Remainder Allocation:
 *   1. คำนวณ grand total ที่เป็น "ค่ายุติ" (authoritative)
 *   2. ปัดแต่ละ route ปกติ
 *   3. ปรับ route สุดท้ายให้ผลรวมตรง grand total
 */
export function allocateToRoutes(
    routeCosts: number[],
    factor: number,
    vatRate = 0.07
): { beforeVAT: number; vat: number; total: number }[] {
    if (routeCosts.length === 0) return [];
    if (routeCosts.length === 1) {
        const raw = routeCosts[0] * factor;
        return [calculateVAT(raw, vatRate)];
    }

    // 1. คำนวณ grand total ที่เป็น "ค่ายุติ"
    const grandRaw = routeCosts.reduce((s, c) => s + c, 0) * factor;
    const grand = calculateVAT(grandRaw, vatRate);

    // 2. ปัดแต่ละ route ปกติ
    const results = routeCosts.map((cost) => {
        const raw = cost * factor;
        return calculateVAT(raw, vatRate);
    });

    // 3. คำนวณผลต่างจากการปัดแยก route
    const sumBeforeVAT = roundMoney(results.reduce((s, r) => s + r.beforeVAT, 0));
    const sumVAT = roundMoney(results.reduce((s, r) => s + r.vat, 0));
    const sumTotal = roundMoney(results.reduce((s, r) => s + r.total, 0));

    // 4. ปรับ route สุดท้ายให้ผลรวมตรง grand total
    const last = results[results.length - 1];
    last.beforeVAT = roundMoney(last.beforeVAT + (grand.beforeVAT - sumBeforeVAT));
    last.vat = roundMoney(last.vat + (grand.vat - sumVAT));
    last.total = roundMoney(last.total + (grand.total - sumTotal));

    return results;
}
