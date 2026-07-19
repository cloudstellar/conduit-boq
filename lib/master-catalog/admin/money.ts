const CATALOG_MONEY_INPUT_PATTERN = /^(0|[1-9][0-9]*)(?:\.([0-9]{1,2}))?$/;
const MONEY_SCALE = BigInt(100);

export function normalizeCatalogMoneyInput(value: string): string | null {
  const match = CATALOG_MONEY_INPUT_PATTERN.exec(value.trim());
  if (!match) return null;

  return `${match[1]}.${(match[2] ?? '').padEnd(2, '0')}`;
}

export function catalogMoneyInputError(value: string, label: string): string | null {
  if (!value.trim()) return `กรุณากรอก${label}`;
  if (normalizeCatalogMoneyInput(value)) return null;
  return `${label}ต้องเป็นตัวเลขไม่ติดลบ และมีทศนิยมได้ไม่เกิน 2 ตำแหน่ง เช่น 1250 หรือ 1250.50`;
}

export function sumCatalogMoneyInputs(material: string, labor: string): string {
  const materialValue = normalizeCatalogMoneyInput(material);
  const laborValue = normalizeCatalogMoneyInput(labor);
  if (!materialValue || !laborValue) return '0.00';

  const totalCents = moneyToCents(materialValue) + moneyToCents(laborValue);
  const whole = totalCents / MONEY_SCALE;
  const fraction = String(totalCents % MONEY_SCALE).padStart(2, '0');
  return `${whole}.${fraction}`;
}

function moneyToCents(value: string): bigint {
  const [whole, fraction] = value.split('.');
  return BigInt(whole) * MONEY_SCALE + BigInt(fraction);
}
