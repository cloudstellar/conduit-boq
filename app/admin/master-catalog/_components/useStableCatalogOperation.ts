'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  shouldBeginNewCatalogOperation,
  type CatalogMutationState,
} from '@/lib/master-catalog/admin/actionModel';

export function useStableCatalogOperation(
  state: CatalogMutationState,
  scopeKey: string,
) {
  const requestIdInputRef = useRef<HTMLInputElement>(null);
  const activeRequestId = useRef('');
  const lastHandledState = useRef<CatalogMutationState | null>(null);
  const lastScopeKey = useRef(scopeKey);

  const beginNewOperation = useCallback(() => {
    activeRequestId.current = crypto.randomUUID();
    if (requestIdInputRef.current) {
      requestIdInputRef.current.value = activeRequestId.current;
    }
  }, []);

  const prepareOperation = useCallback(() => {
    if (!activeRequestId.current) {
      activeRequestId.current = crypto.randomUUID();
    }
    if (requestIdInputRef.current) {
      requestIdInputRef.current.value = activeRequestId.current;
    }
  }, []);

  useEffect(() => {
    const shouldRotate = shouldBeginNewCatalogOperation(
      lastHandledState.current,
      state,
      lastScopeKey.current,
      scopeKey,
    );

    lastScopeKey.current = scopeKey;
    lastHandledState.current = state;

    if (shouldRotate) {
      beginNewOperation();
    }
  }, [beginNewOperation, scopeKey, state]);

  return [requestIdInputRef, prepareOperation] as const;
}
