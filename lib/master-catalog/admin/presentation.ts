export function formatCatalogDictionaryLabel(code: string, name: string): string {
  const normalizedCode = code.trim();
  const normalizedName = name.trim();

  if (!normalizedCode) return normalizedName;
  if (!normalizedName || normalizedCode === normalizedName) return normalizedCode;

  return `${normalizedCode} ${normalizedName}`;
}
