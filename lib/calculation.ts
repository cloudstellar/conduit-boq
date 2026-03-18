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
    // ใช้ exponential (e2) เพื่อป้องกันปัญหา JS Float Precision (เช่น .475 กลายเป็น .474999...)
    return Number(Math.round(Number(value + 'e2')) + 'e-2');
}

/**
 * คูณเลขทศนิยม 2 ตัวอย่างปลอดภัยจากปัญหา Float Precision ของ JavaScript
 * รองรับตัวคูณที่มีทศนิยมสูงสุด 4 ตำแหน่ง (เช่น Factor F, VAT rate)
 * ตัวตั้งรองรับทศนิยมสูงสุด 2 ตำแหน่ง (เช่น ค่างาน, ราคา/หน่วย)
 */
function safeMul(a: number, b: number, aDecimals: number, bDecimals: number): number {
    const scaleA = Math.pow(10, aDecimals);
    const scaleB = Math.pow(10, bDecimals);
    const intA = Math.round(a * scaleA);
    const intB = Math.round(b * scaleB);
    return (intA * intB) / (scaleA * scaleB);
}

/**
 * คูณค่างาน (2 ทศนิยม) กับ Factor F (4 ทศนิยม) อย่างปลอดภัย
 * (เช่น 2738389 * 1.275 = 3491445.9749999996 แทนที่จะเป็น .975)
 */
export function multiplyFactor(cost: number, factor: number): number {
    return safeMul(cost, factor, 2, 4);
}

/**
 * คูณปริมาณ × ราคาต่อหน่วย อย่างปลอดภัย
 * ปริมาณ: ทศนิยมสูงสุด 2 ตำแหน่ง, ราคาต่อหน่วย: ทศนิยมสูงสุด 2 ตำแหน่ง
 */
export function safeItemCalc(quantity: number, unitCost: number): number {
    return safeMul(quantity, unitCost, 2, 2);
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
    const vat = roundMoney(safeMul(beforeVAT, rate, 2, 4));
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
        const raw = multiplyFactor(routeCosts[0], factor);
        return [calculateVAT(raw, vatRate)];
    }

    // 1. คำนวณ grand total ที่เป็น "ค่ายุติ"
    const sumCosts = routeCosts.reduce((s, c) => s + c, 0);
    const grandRaw = multiplyFactor(sumCosts, factor);
    const grand = calculateVAT(grandRaw, vatRate);

    // 2. ปัดแต่ละ route ปกติ
    const results = routeCosts.map((cost) => {
        const raw = multiplyFactor(cost, factor);
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
