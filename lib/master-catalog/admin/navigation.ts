const ITEM_CODE_NOTICE_PATTERN = /^[A-Z0-9-]{1,64}$/;

export function safeCatalogItemReturnHref(value: string | null, versionId: string): string {
  const fallback = catalogVersionWorkspaceHref(versionId);
  if (!value) return fallback;
  if (value.startsWith('//') || value.includes('://') || value.includes('\\')) return fallback;

  try {
    const parsed = new URL(value, 'http://local.invalid');
    if (parsed.origin !== 'http://local.invalid') return fallback;
    if (parsed.pathname !== fallback && parsed.pathname !== `${fallback}/review`) return fallback;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function catalogWithdrawSuccessHref(
  returnTo: string | null,
  versionId: string,
  itemCode: string,
): string {
  const workspaceHref = catalogVersionWorkspaceHref(versionId);
  const safeReturn = safeCatalogItemReturnHref(returnTo, versionId);
  const parsed = new URL(safeReturn, 'http://local.invalid');
  const target = parsed.pathname === workspaceHref
    ? parsed
    : new URL(workspaceHref, 'http://local.invalid');

  target.searchParams.set('notice', 'item-withdrawn');
  if (ITEM_CODE_NOTICE_PATTERN.test(itemCode)) {
    target.searchParams.set('itemCode', itemCode);
  }

  return `${target.pathname}${target.search}`;
}

export function catalogWithdrawnItemCode(
  notice: string | null,
  itemCode: string | null,
): string | null {
  if (notice !== 'item-withdrawn' || !itemCode || !ITEM_CODE_NOTICE_PATTERN.test(itemCode)) {
    return null;
  }
  return itemCode;
}

function catalogVersionWorkspaceHref(versionId: string): string {
  return `/admin/master-catalog/versions/${versionId}`;
}
