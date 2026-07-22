const ITEM_CODE_NOTICE_PATTERN = /^[A-Z0-9-]{1,64}$/;
const UUID_NOTICE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CatalogItemMutationNotice {
  recoveredRequest: boolean;
  requestId: string | null;
}

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

export function catalogItemMutationSuccessHref(
  returnTo: string | null,
  versionId: string,
  identityId: string,
  duplicateRequest: boolean,
  requestId: string | null,
): string {
  const target = new URL(
    `${catalogVersionWorkspaceHref(versionId)}/items/${identityId}`,
    'http://local.invalid',
  );
  target.searchParams.set('returnTo', safeCatalogItemReturnHref(returnTo, versionId));
  target.searchParams.set('notice', 'item-saved');
  if (duplicateRequest) target.searchParams.set('outcome', 'recovered');
  if (requestId && UUID_NOTICE_PATTERN.test(requestId)) {
    target.searchParams.set('requestId', requestId);
  }
  return `${target.pathname}${target.search}`;
}

export function catalogItemMutationNotice(
  notice: string | null,
  outcome: string | null,
  requestId: string | null,
): CatalogItemMutationNotice | null {
  if (notice !== 'item-saved') return null;
  return {
    recoveredRequest: outcome === 'recovered',
    requestId: requestId && UUID_NOTICE_PATTERN.test(requestId) ? requestId : null,
  };
}

function catalogVersionWorkspaceHref(versionId: string): string {
  return `/admin/master-catalog/versions/${versionId}`;
}
