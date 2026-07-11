'use client';

import { useCallback, useEffect, useRef, type FormEvent } from 'react';
import {
  shouldBeginNewCatalogOperation,
  shouldPreserveCatalogOperationInput,
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
  const submittedForm = useRef<HTMLFormElement | null>(null);
  const allowFormReset = useRef(false);

  const beginNewOperation = useCallback(() => {
    activeRequestId.current = crypto.randomUUID();
    if (requestIdInputRef.current) {
      requestIdInputRef.current.value = activeRequestId.current;
    }
  }, []);

  const prepareOperation = useCallback((event: FormEvent<HTMLFormElement>) => {
    submittedForm.current = event.currentTarget;
    if (!activeRequestId.current) {
      activeRequestId.current = crypto.randomUUID();
    }
    if (requestIdInputRef.current) {
      requestIdInputRef.current.value = activeRequestId.current;
    }
  }, []);

  const preserveSubmittedInput = useCallback((event: FormEvent<HTMLFormElement>) => {
    if (allowFormReset.current) {
      allowFormReset.current = false;
      return;
    }

    if (submittedForm.current === event.currentTarget) {
      event.preventDefault();
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

  useEffect(() => {
    if (shouldPreserveCatalogOperationInput(state) || !submittedForm.current) {
      return;
    }

    allowFormReset.current = true;
    submittedForm.current.reset();
    submittedForm.current = null;
  }, [state]);

  return [requestIdInputRef, prepareOperation, preserveSubmittedInput] as const;
}
