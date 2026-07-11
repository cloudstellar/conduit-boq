'use client';

import { useEffect, useRef } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MasterCatalogRouteStateShell } from './_components/MasterCatalogRouteStateShell';

export default function MasterCatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const requestIdElementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const nextRequestId = crypto.randomUUID();
    if (requestIdElementRef.current) {
      requestIdElementRef.current.textContent = `Request ID: ${nextRequestId}`;
    }
    console.error({
      event: 'master_catalog_route_error',
      operation: 'renderCatalogAdminRoute',
      outcome: 'failed',
      durationMs: 0,
      requestId: nextRequestId,
      ...(error.digest ? { code: error.digest.slice(0, 128) } : {}),
    });
  }, [error.digest]);

  return (
    <MasterCatalogRouteStateShell>
      <Alert variant="destructive" aria-live="assertive">
        <ShieldAlert />
        <AlertTitle>โหลด Master Catalog ไม่สำเร็จ</AlertTitle>
        <AlertDescription>
          <div className="grid gap-3">
            <p>ข้อมูลยังไม่ถูกเปลี่ยน กรุณาลองโหลดหน้านี้อีกครั้ง</p>
            <p ref={requestIdElementRef} className="font-mono text-xs" aria-live="polite">
              Request ID: กำลังสร้าง
            </p>
            <div>
              <Button type="button" variant="outline" onClick={reset}>
                <RefreshCw data-icon="inline-start" />
                ลองอีกครั้ง
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </MasterCatalogRouteStateShell>
  );
}
