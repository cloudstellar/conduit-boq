import { createClient } from '@/lib/supabase/server';
import {
  CatalogExportError,
  loadCatalogExportDataset,
  makeCatalogExportFilename,
} from '@/lib/master-catalog/export/data';
import { buildCatalogExportWorkbookBuffer } from '@/lib/master-catalog/export/excel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const { versionId } = await params;
    const supabase = await createClient();
    const dataset = await loadCatalogExportDataset(supabase, versionId);
    const buffer = await buildCatalogExportWorkbookBuffer(dataset);
    const filename = makeCatalogExportFilename(dataset, 'xlsx');
    const body = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const mappedError = mapCatalogExportError(error);

    return Response.json(
      {
        error: {
          code: mappedError.code,
          message: mappedError.message,
        },
      },
      {
        status: mappedError.status,
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
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
