'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { requireActiveProfile } from '@/lib/auth/authorization';
import {
  fetchBOQPage, fetchBOQRoutes, isListAuthorizationError, isListRangeError,
  normalizeBOQListState, type BOQListRow, type BOQListState, type ListSort,
} from '@/lib/boq/list';
import {
  readBOQListLocation, writeBOQListLocation, clearBOQListSessions, getBOQListStorage,
} from '@/lib/boq/listSession';

type Request = { query: BOQListState; revision: number; focusResults: boolean };
type Result = { key: string; rows: BOQListRow[]; count: number; query: BOQListState };
type Routes = { key: string; attempt: number; status: 'loading' | 'ready' | 'error'; names: Record<string, string[]> };

const INITIAL_QUERY: BOQListState = { page: 1, q: '', sort: 'created_desc' };
const ERROR_MESSAGE = 'โหลดรายการไม่สำเร็จ กรุณาลองอีกครั้ง';

/** One page owner for both responsive presentations; badges never fetch. */
export function useBOQList(actorId: string, beforeTransition?: () => void) {
  const supabase = useMemo(() => createClient(), []);
  const [request, setRequest] = useState<Request | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [routes, setRoutes] = useState<Routes | null>(null);
  const [routeAttempt, setRouteAttempt] = useState(0);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const publishedQuery = useRef(INITIAL_QUERY);
  const hasRequest = useRef(false);
  const epoch = useRef(0);
  const identityEpoch = useRef(0);
  const mainAbort = useRef<AbortController | null>(null);
  const routeAbort = useRef<AbortController | null>(null);
  const requestKey = JSON.stringify([actorId, request]);
  const query = request?.query ?? INITIAL_QUERY;
  const isCurrent = result?.key === requestKey && !blocked;
  const isBusy = !isCurrent || searchTerm.trim() !== query.q;
  const error = blocked
    ? 'สิทธิ์หรือเซสชันเปลี่ยนไป กรุณาเข้าสู่ระบบอีกครั้ง'
    : failure?.key === requestKey ? failure.message : null;

  const invalidateAuthorization = useCallback(() => {
    beforeTransition?.();
    epoch.current += 1;
    identityEpoch.current += 1;
    mainAbort.current?.abort();
    routeAbort.current?.abort();
    setBlocked(true);
    setResult(null);
    setRoutes(null);
    try { clearBOQListSessions(getBOQListStorage()); } catch { /* Storage may be disabled. */ }
  }, [beforeTransition]);

  const applyQuery = useCallback((next: BOQListState, {
    replace = false, focusResults = false,
  }: { replace?: boolean; focusResults?: boolean } = {}) => {
    let normalized: BOQListState;
    try {
      normalized = normalizeBOQListState(next);
      // A rejected History write must not abort a still-valid request or
      // publish session state that the UI never committed.
      writeBOQListLocation({
        query: normalized, actorId, storage: getBOQListStorage(),
        history: window.history, href: window.location.href, mode: replace ? 'replace' : 'push',
      });
    } catch {
      setTransitionError('เบราว์เซอร์บันทึกตำแหน่งรายการไม่ได้ กรุณาโหลดหน้าเว็บใหม่');
      setSearchTerm(publishedQuery.current.q);
      if (!hasRequest.current) {
        hasRequest.current = true;
        setRequest({ query: publishedQuery.current, revision: 1, focusResults: false });
      }
      return false;
    }
    beforeTransition?.();
    mainAbort.current?.abort();
    routeAbort.current?.abort();
    publishedQuery.current = normalized;
    hasRequest.current = true;
    setTransitionError(null);
    setSearchTerm(normalized.q);
    setFailure(null);
    setRequest(current => ({ query: normalized, revision: (current?.revision ?? 0) + 1, focusResults }));
    return true;
  }, [actorId, beforeTransition]);

  useEffect(() => {
    let alive = true;
    const restore = () => {
      const restored = readBOQListLocation({
        href: window.location.href, historyState: window.history.state,
        actorId, storage: getBOQListStorage(),
      });
      if (alive) applyQuery(restored.query, { replace: true });
    };
    // Session-only state is restored after hydration; do not read storage on SSR.
    void Promise.resolve().then(() => { if (alive) restore(); });
    window.addEventListener('popstate', restore);
    const pageShow = (event: PageTransitionEvent) => { if (event.persisted) restore(); };
    window.addEventListener('pageshow', pageShow);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (session && session.user.id !== actorId)) {
        invalidateAuthorization();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Callback performs no Supabase calls: avoid auth-lock reentrancy.
        beforeTransition?.();
        epoch.current += 1;
        mainAbort.current?.abort();
        routeAbort.current?.abort();
        setRequest(current => current ? { ...current, revision: current.revision + 1 } : current);
      }
    });
    return () => {
      alive = false;
      epoch.current += 1;
      identityEpoch.current += 1;
      mainAbort.current?.abort();
      routeAbort.current?.abort();
      subscription.unsubscribe();
      window.removeEventListener('popstate', restore);
      window.removeEventListener('pageshow', pageShow);
    };
  }, [actorId, applyQuery, beforeTransition, invalidateAuthorization, supabase]);

  useEffect(() => {
    if (!request || blocked || searchTerm.trim() === request.query.q) return;
    const timer = window.setTimeout(() => {
      try { applyQuery({ ...request.query, q: searchTerm, page: 1 }, { replace: false }); }
      catch (error) {
        setFailure({ key: requestKey, message: error instanceof Error ? error.message : ERROR_MESSAGE });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [applyQuery, blocked, request, requestKey, searchTerm]);

  useEffect(() => {
    if (!request || blocked) return;
    const controller = new AbortController();
    mainAbort.current = controller;
    const generation = epoch.current;
    const current = () => !controller.signal.aborted && epoch.current === generation;
    const load = async () => {
      try {
        const authorization = await requireActiveProfile(supabase);
        if (!current()) return;
        if (authorization.user.id !== actorId) { invalidateAuthorization(); return; }
        let page;
        try {
          page = await fetchBOQPage(supabase, request.query, { signal: controller.signal });
        } catch (error) {
          if (isListRangeError(error) && request.query.page !== 1 && current()) {
            // One recovery; the page-one request may fail normally, without a loop.
            const recovered = applyQuery({ ...request.query, page: 1 }, { replace: true, focusResults: request.focusResults });
            if (!recovered) throw new Error('ไม่สามารถกลับไปหน้าแรกได้ กรุณาโหลดหน้าเว็บใหม่');
            return;
          }
          throw error;
        }
        if (!current()) return;
        setFailure(null);
        setResult({ key: requestKey, rows: page.rows, count: page.count, query: request.query });
      } catch (error) {
        if (!current()) return;
        if (isListAuthorizationError(error)) { invalidateAuthorization(); return; }
        setFailure({ key: requestKey, message: error instanceof Error ? error.message : ERROR_MESSAGE });
      }
    };
    void load();
    return () => controller.abort();
  }, [actorId, applyQuery, blocked, invalidateAuthorization, request, requestKey, supabase]);

  useEffect(() => {
    if (!result || result.key !== requestKey || blocked) return;
    const controller = new AbortController();
    routeAbort.current = controller;
    const generation = epoch.current;
    const current = () => !controller.signal.aborted && epoch.current === generation;
    const load = async () => {
      // The first batch follows an active-profile checked main query. Retry
      // revalidates authorization before interpreting an empty child result.
      await Promise.resolve();
      if (!current()) return;
      setRoutes({ key: requestKey, attempt: routeAttempt, status: 'loading', names: {} });
      try {
        if (routeAttempt > 0) {
          const authorization = await requireActiveProfile(supabase);
          if (!current()) return;
          if (authorization.user.id !== actorId) { invalidateAuthorization(); return; }
        }
        const names = await fetchBOQRoutes(supabase, result.rows.map(row => row.id), controller.signal);
        if (current()) setRoutes({ key: requestKey, attempt: routeAttempt, status: 'ready', names });
      } catch (error) {
        if (!current()) return;
        if (isListAuthorizationError(error)) { invalidateAuthorization(); return; }
        setRoutes({ key: requestKey, attempt: routeAttempt, status: 'error', names: {} });
      }
    };
    void load();
    return () => controller.abort();
  }, [actorId, blocked, invalidateAuthorization, requestKey, result, routeAttempt, supabase]);

  useEffect(() => {
    document.title = `รายการใบประมาณราคา · หน้า ${query.page} | Conduit BOQ`;
  }, [query.page]);

  const refresh = useCallback(() => {
    try { applyQuery({ ...query, q: searchTerm }, { replace: true }); }
    catch (error) { setFailure({ key: requestKey, message: error instanceof Error ? error.message : ERROR_MESSAGE }); }
  }, [applyQuery, query, requestKey, searchTerm]);
  const changePage = useCallback((page: number) => applyQuery({ ...query, page }, { focusResults: true }), [applyQuery, query]);
  const changeSort = useCallback((sort: ListSort) => {
    try { applyQuery({ ...query, q: searchTerm, sort, page: 1 }); }
    catch (error) { setFailure({ key: requestKey, message: error instanceof Error ? error.message : ERROR_MESSAGE }); }
  }, [applyQuery, query, requestKey, searchTerm]);
  const clearSearch = useCallback(() => applyQuery({ ...query, q: '', page: 1 }), [applyQuery, query]);
  const afterDelete = useCallback(() => {
    const lastPage = Math.max(1, Math.ceil(((result?.count ?? 1) - 1) / 25));
    applyQuery({ ...query, page: Math.min(query.page, lastPage) }, { replace: true, focusResults: true });
  }, [applyQuery, query, result?.count]);
  const routeData = routes?.key === requestKey && routes.attempt === routeAttempt ? routes : null;

  return {
    supabase, query, searchTerm, setSearchTerm, rows: error ? [] : result?.rows ?? [],
    count: isCurrent ? result.count : null, isBusy, error, transitionError, blocked, refresh,
    changePage, changeSort, clearSearch, afterDelete,
    retryRoutes: () => setRouteAttempt(value => value + 1),
    routes: routeData, requestKey, focusResults: Boolean(isCurrent && request?.focusResults),
    invalidateAuthorization,
    captureActorGeneration: () => identityEpoch.current,
    isActorGenerationCurrent: (generation: number) => generation === identityEpoch.current && !blocked,
  };
}
