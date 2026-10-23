import { normalizeBOQListState, type BOQListState } from './list';

export type ListSessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'>;

export const BOQ_LIST_SESSION_PREFIX = 'conduit-boq:list:';
export const BOQ_LIST_HISTORY_FIELD = '__conduitBOQList';
export const BOQ_LIST_SESSION_LIMIT = 50;

type ListHistory = Pick<History, 'state' | 'pushState' | 'replaceState'>;
type StoredEntry = { version: 1; actorId: string; key: string; query: BOQListState };
type ActorMemory = { entries: Map<string, StoredEntry>; last: string | null };

const memory = new Map<string, ActorMemory>();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let persistentReadsDisabled = false;

export function getBOQListStorage(): ListSessionStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function actorPrefix(actorId: string): string {
  return `${BOQ_LIST_SESSION_PREFIX}v1:${encodeURIComponent(actorId)}:`;
}

function actorMemory(actorId: string): ActorMemory {
  let current = memory.get(actorId);
  if (!current) {
    current = { entries: new Map(), last: null };
    memory.set(actorId, current);
  }
  return current;
}

function get(storage: ListSessionStorage | null, key: string): unknown {
  if (!storage || persistentReadsDisabled) return null;
  try {
    const text = storage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

function set(storage: ListSessionStorage | null, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // The same-tab in-memory copy remains available when storage is denied/full.
  }
}

function remove(storage: ListSessionStorage | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage denial must not break navigation or preserve the in-memory copy.
  }
}

function entry(value: unknown, actorId: string, key: string): StoredEntry | null {
  const candidate = object(value);
  const query = object(candidate?.query);
  if (!candidate || candidate.version !== 1 || candidate.actorId !== actorId
    || candidate.key !== key || !UUID.test(key) || !query
    || typeof query.page !== 'number' || typeof query.q !== 'string'
    || typeof query.sort !== 'string') return null;
  try {
    const normalized = normalizeBOQListState(query);
    if (normalized.page !== query.page || normalized.q !== query.q || normalized.sort !== query.sort) return null;
    return { version: 1, actorId, key, query: normalized };
  } catch {
    return null;
  }
}

function loadEntry(storage: ListSessionStorage | null, actorId: string, key: unknown): StoredEntry | null {
  if (typeof key !== 'string' || !UUID.test(key)) return null;
  const local = actorMemory(actorId).entries.get(key);
  return local ?? entry(get(storage, `${actorPrefix(actorId)}entry:${key}`), actorId, key);
}

function loadLast(storage: ListSessionStorage | null, actorId: string): StoredEntry | null {
  const current = actorMemory(actorId);
  const key = current.last ?? get(storage, `${actorPrefix(actorId)}last`);
  return loadEntry(storage, actorId, key);
}

function remember(storage: ListSessionStorage | null, value: StoredEntry): void {
  const current = actorMemory(value.actorId);
  current.entries.set(value.key, value);
  current.last = value.key;
  const prefix = actorPrefix(value.actorId);
  const existing = get(storage, `${prefix}index`);
  const keys = new Set<string>(
    Array.isArray(existing) ? existing.filter((key): key is string => typeof key === 'string' && UUID.test(key)) : [],
  );
  for (const key of current.entries.keys()) keys.add(key);
  keys.add(value.key);
  const ordered = [...keys];
  while (ordered.length > BOQ_LIST_SESSION_LIMIT) {
    const old = ordered.shift()!;
    current.entries.delete(old);
    remove(storage, `${prefix}entry:${old}`);
  }
  set(storage, `${prefix}entry:${value.key}`, value);
  set(storage, `${prefix}index`, ordered);
  set(storage, `${prefix}last`, value.key);
}

function freshEntry(actorId: string, query: BOQListState): StoredEntry {
  return { version: 1, actorId, key: crypto.randomUUID(), query: { ...query } };
}

function defaultQuery(): BOQListState {
  return { page: 1, q: '', sort: 'created_desc' };
}

function location(href: string): URL {
  return new URL(href, 'http://list.local.invalid');
}

/** Resolve one complete query unit. No free text is read from the URL. */
export function readBOQListLocation(input: {
  href: string;
  historyState: unknown;
  actorId: string;
  storage: ListSessionStorage | null;
}): { query: BOQListState; key: string } {
  const { href, historyState, actorId, storage } = input;
  const url = location(href);
  const params = url.searchParams;
  const marker = object(object(historyState)?.[BOQ_LIST_HISTORY_FIELD]);
  const saved = marker?.actorId === actorId ? loadEntry(storage, actorId, marker.key) : null;
  const structured = ['page', 'sort', 'search', 'q'].some(key => params.has(key));
  const hasSearch = params.get('search') === '1';
  const matches = saved && params.get('page') === String(saved.query.page)
    && params.get('sort') === saved.query.sort
    && hasSearch === Boolean(saved.query.q) && !params.has('q');

  let resolved: StoredEntry | null = null;
  if (matches) {
    resolved = saved;
  } else if (!structured) {
    resolved = loadLast(storage, actorId);
  }
  if (!resolved) {
    // A copied/bookmarked search URL has no search text. It must not silently
    // apply a different last search, or its page, to that incomplete unit.
    const query = hasSearch || params.has('q')
      ? { ...defaultQuery(), sort: normalizeBOQListState({ sort: params.get('sort') }).sort }
      : normalizeBOQListState({ page: params.get('page'), sort: params.get('sort') });
    resolved = freshEntry(actorId, query);
  }
  remember(storage, resolved);
  return { query: { ...resolved.query }, key: resolved.key };
}

/** Save an actor-bound query unit; history and URL never contain its text. */
export function writeBOQListLocation(input: {
  query: BOQListState;
  actorId: string;
  storage: ListSessionStorage | null;
  history: ListHistory;
  href: string;
  mode: 'push' | 'replace';
}): string {
  const { actorId, storage, history, href, mode } = input;
  const query = normalizeBOQListState(input.query);
  const value = freshEntry(actorId, query);
  const url = location(href);
  url.search = '';
  url.searchParams.set('page', String(query.page));
  url.searchParams.set('sort', query.sort);
  if (query.q) url.searchParams.set('search', '1');
  const nextState = {
    ...object(history.state),
    [BOQ_LIST_HISTORY_FIELD]: { actorId, key: value.key },
  };
  // History publication is the commit point. A rejected transition must not
  // become the last/session query restored on a later return to the register.
  history[mode === 'push' ? 'pushState' : 'replaceState'](
    nextState,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
  remember(storage, value);
  return value.key;
}

/** Logout clears all actors' list state while preserving unrelated storage. */
export function clearBOQListSessions(storage: ListSessionStorage | null): void {
  memory.clear();
  persistentReadsDisabled = false;
  if (!storage) {
    persistentReadsDisabled = true;
    return;
  }
  try {
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key?.startsWith(BOQ_LIST_SESSION_PREFIX)) keys.push(key);
    }
    for (const key of keys) storage.removeItem(key);
  } catch {
    // Ignore old persisted entries for the rest of this module's lifetime if
    // the browser refuses their removal. Logout still clears same-tab memory.
    persistentReadsDisabled = true;
  }
}
