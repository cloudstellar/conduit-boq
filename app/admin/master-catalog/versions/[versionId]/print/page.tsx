import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import {
  CatalogExportError,
  loadCatalogExportDataset,
  type CatalogExportDataset,
} from '@/lib/master-catalog/export/data';
import { logMasterCatalogOperation } from '@/lib/master-catalog/observability';
import { createClient } from '@/lib/supabase/server';
import { MasterCatalogPrintDocument } from './PrintDocument';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function MasterCatalogPrintPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const result = await loadPrintDataset(versionId);

  if ('error' in result) {
    return <PrintError error={result.error} requestId={result.requestId} />;
  }

  return <MasterCatalogPrintDocument dataset={result.dataset} />;
}

async function loadPrintDataset(versionId: string): Promise<
  | { dataset: CatalogExportDataset }
  | { error: unknown; requestId: string }
> {
  const startedAt = Date.now();
  const requestId = randomUUID();
  const supabase = await createClient();

  try {
    const dataset = await loadCatalogExportDataset(supabase, versionId);
    logMasterCatalogOperation({
      operation: 'renderCatalogPrint',
      outcome: 'success',
      startedAt,
      requestId,
      versionId,
      officialVersionString: dataset.version.officialVersionString,
      targetVersionString: dataset.version.targetVersionString,
      draftReference: dataset.version.draftReference,
    });

    return { dataset };
  } catch (error) {
    if (
      error instanceof CatalogExportError &&
      error.code === 'CATALOG_EXPORT_UNAUTHENTICATED'
    ) {
      logMasterCatalogOperation({
        operation: 'renderCatalogPrint',
        outcome: 'rejected',
        startedAt,
        requestId,
        versionId,
        code: error.code,
      });
      redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}/print`);
    }

    const code = error instanceof CatalogExportError
      ? error.code
      : 'CATALOG_EXPORT_INTERNAL_ERROR';
    logMasterCatalogOperation({
      operation: 'renderCatalogPrint',
      outcome: error instanceof CatalogExportError && error.status < 500
        ? 'rejected'
        : 'failed',
      startedAt,
      requestId,
      versionId,
      code,
    });

    return { error, requestId };
  }
}

function PrintError({ error, requestId }: { error: unknown; requestId: string }) {
  const code = error instanceof CatalogExportError
    ? error.code
    : 'CATALOG_EXPORT_INTERNAL_ERROR';
  const message = error instanceof CatalogExportError
    ? error.message
    : 'Catalog print export could not be generated';

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: '#f4f4f5',
      color: '#18181b',
      fontFamily: 'Arial, sans-serif',
    }}>
      <section style={{
        maxWidth: 680,
        border: '1px solid #fecaca',
        borderRadius: 8,
        background: '#fff',
        padding: 24,
      }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>
          ไม่สามารถสร้าง PDF/print export ได้
        </h1>
        <p>{message}</p>
        <p style={{ color: '#71717a', fontFamily: 'monospace' }}>{code}</p>
        <p style={{ color: '#71717a', fontFamily: 'monospace' }}>
          Request ID: {requestId}
        </p>
      </section>
    </main>
  );
}
