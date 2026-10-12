export const MAX_QUANTITY = 9_999_999_999.99;

export type QuantityDraftResult =
  | { status: 'valid'; value: number }
  | { status: 'incomplete' | 'invalid'; message: string };

export function parseQuantityDraft(text: string): QuantityDraftResult {
  const input = text.trim();
  if (input === '' || input === '.') {
    return { status: 'incomplete', message: 'กรอกปริมาณให้ครบ หากต้องการศูนย์ให้กรอก 0' };
  }
  if (!/^\d*\.?\d*$/.test(input)) {
    return {
      status: 'invalid',
      message: 'กรอกเฉพาะตัวเลขและจุดทศนิยม เช่น 1234.50 ไม่ใส่สูตร เครื่องหมาย หรือจุลภาค',
    };
  }
  const [integerPart, decimalPart = ''] = input.split('.');
  if (decimalPart.length > 2) {
    return { status: 'invalid', message: 'กรอกทศนิยมไม่เกิน 2 ตำแหน่ง ระบบจะไม่ปัดเศษให้' };
  }

  // Check magnitude before conversion, so oversized input cannot be rounded
  // into an accepted number. Leading zeroes do not change numeric magnitude.
  const significantInteger = integerPart.replace(/^0+/, '') || '0';
  const rangeError: QuantityDraftResult = {
    status: 'invalid', message: 'กรอกปริมาณตั้งแต่ 0 ถึง 9999999999.99',
  };
  if (significantInteger.length > 10) return rangeError;
  const value = Number(input);
  if (!Number.isFinite(value) || value < 0 || value > MAX_QUANTITY) return rangeError;
  return { status: 'valid', value };
}

// Display formatting only. Draft validation must happen before committing;
// this formatter never supplies a replacement numeric value to a save.
export function formatQuantity(value: number): string {
  return value.toFixed(2);
}
