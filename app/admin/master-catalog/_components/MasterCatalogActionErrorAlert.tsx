'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CatalogMutationState } from '@/lib/master-catalog/admin/actionModel';

export function MasterCatalogActionErrorAlert({
  state,
  children,
}: {
  state: CatalogMutationState;
  children?: ReactNode;
}) {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'error') {
      focusRef.current?.focus();
    }
  }, [state.code, state.message, state.requestId, state.status]);

  if (state.status !== 'error') return null;

  return (
    <div ref={focusRef} tabIndex={-1} className="outline-none">
      <Alert variant="destructive" aria-live="assertive">
        <ShieldAlert />
        <AlertTitle>ดำเนินการไม่สำเร็จ</AlertTitle>
        <AlertDescription>
          <div className="grid gap-3">
            <p>{state.message}</p>
            {children}
            <details className="text-xs">
              <summary className="cursor-pointer">ข้อมูลสำหรับติดตามปัญหา</summary>
              <div className="mt-2 grid gap-1 break-all">
                <span>รหัสปัญหา {state.code ?? 'VALIDATION_FAILED'}</span>
                {state.requestId ? <span>รหัสคำขอ {state.requestId}</span> : null}
              </div>
            </details>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
