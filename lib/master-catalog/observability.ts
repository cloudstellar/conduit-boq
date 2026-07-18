export type MasterCatalogOperationOutcome =
  | 'success'
  | 'rejected'
  | 'failed'
  | 'transport_error';

export function logMasterCatalogOperation({
  operation,
  outcome,
  startedAt,
  requestId,
  versionId,
  officialVersionString,
  targetVersionString,
  draftReference,
  draftEffect,
  code,
}: {
  operation: string;
  outcome: MasterCatalogOperationOutcome;
  startedAt: number;
  requestId: string;
  versionId?: string;
  officialVersionString?: string | null;
  targetVersionString?: string;
  draftReference?: string | null;
  draftEffect?: string;
  code?: string;
}) {
  const event = {
    event: 'master_catalog_operation',
    operation: boundedLogToken(operation),
    outcome,
    durationMs: Math.max(0, Date.now() - startedAt),
    requestId: boundedLogToken(requestId),
    ...(versionId ? { versionId: boundedLogToken(versionId) } : {}),
    ...(officialVersionString
      ? { officialVersionString: boundedLogToken(officialVersionString) }
      : {}),
    ...(targetVersionString
      ? { targetVersionString: boundedLogToken(targetVersionString) }
      : {}),
    ...(draftReference ? { draftReference: boundedLogToken(draftReference) } : {}),
    ...(draftEffect ? { draftEffect: boundedLogToken(draftEffect) } : {}),
    ...(code ? { code: boundedLogToken(code) } : {}),
  };

  if (outcome === 'transport_error' || outcome === 'failed') {
    console.error(event);
    return;
  }

  if (outcome === 'rejected') {
    console.warn(event);
    return;
  }

  console.info(event);
}

function boundedLogToken(value: string): string {
  return value.replace(/[\r\n\t]/g, ' ').slice(0, 128);
}
