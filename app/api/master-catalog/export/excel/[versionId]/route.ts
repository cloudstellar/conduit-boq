import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import {
  CatalogExportError,
  loadCatalogExportDataset,
  makeCatalogExportFilename,
} from '@/lib/master-catalog/export/data';
import { buildCatalogExportWorkbookBuffer } from '@/lib/master-catalog/export/excel';
import { logMasterCatalogOperation } from '@/lib/master-catalog/observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const startedAt = Date.now();
  const requestId = randomUUID();
  let selectedVersionId: string | undefined;

  try {
    const { versionId } = await params;
    selectedVersionId = versionId;
    const supabase = await createClient();
    const dataset = await loadCatalogExportDataset(supabase, versionId);
    const buffer = await buildCatalogExportWorkbookBuffer(dataset);
    const filename = makeCatalogExportFilename(dataset, 'xlsx');
    const body = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    logMasterCatalogOperation({
      operation: 'exportCatalogExcel',
      outcome: 'success',
      startedAt,
      requestId,
      versionId,
      officialVersionString: dataset.version.officialVersionString,
      targetVersionString: dataset.version.targetVersionString,
      draftReference: dataset.version.draftReference,
    });

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    const mappedError = mapCatalogExportError(error);

    logMasterCatalogOperation({
      operation: 'exportCatalogExcel',
      outcome: mappedError.status >= 500 ? 'failed' : 'rejected',
      startedAt,
      requestId,
      versionId: selectedVersionId,
      code: mappedError.code,
    });

    return Response.json(
      {
        error: {
          code: mappedError.code,
          message: mappedError.message,
          requestId,
        },
      },
      {
        status: mappedError.status,
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
          'X-Request-ID': requestId,
        },
      },
    );
  }
}

function mapCatalogExportError(error: unknown): CatalogExportError {
  if (error instanceof CatalogExportError) {
    return error;
  }

  return new CatalogExportError(
    'CATALOG_EXPORT_INTERNAL_ERROR',
    'Catalog export could not be generated',
    500,
  );
}
