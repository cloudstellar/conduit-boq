export function formatCatalogDictionaryLabel(code: string, name: string): string {
  const normalizedCode = code.trim();
  const normalizedName = name.trim();

  if (!normalizedCode) return normalizedName;
  if (!normalizedName || normalizedCode === normalizedName) return normalizedCode;

  return `${normalizedCode} ${normalizedName}`;
}

export function formatCatalogVersionBackLabel({
  versionStatus,
  draftReference,
  targetVersionString,
}: {
  versionStatus: string;
  draftReference: string | null;
  targetVersionString: string;
}): string {
  const normalizedDraftReference = draftReference?.trim() ?? '';
  const normalizedTargetVersion = targetVersionString.trim();

  if (versionStatus === 'draft' || versionStatus === 'abandoned') {
    return normalizedDraftReference || `เป้าหมาย ${normalizedTargetVersion}`;
  }

  return normalizedTargetVersion || 'เวอร์ชันนี้';
}
