import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BOQ_LIST_HISTORY_FIELD,
  BOQ_LIST_SESSION_LIMIT,
  BOQ_LIST_SESSION_PREFIX,
  clearBOQListSessions,
  getBOQListStorage,
  readBOQListLocation,
  writeBOQListLocation,
  type ListSessionStorage,
} from '../lib/boq/listSession';
import type { BOQListState } from '../lib/boq/list';

class MemoryStorage implements ListSessionStorage {
  values = new Map<string, string>();
  get length() { return this.values.size; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
}

const base = 'https://boq.example/boq';
const defaults: BOQListState = { page: 1, q: '', sort: 'created_desc' };
const search: BOQListState = { page: 3, q: 'ท่อ A, B %_*', sort: 'document_desc' };

function historyFor(initialState: unknown = { __NA: true, tree: ['existing-next-tree'] }) {
  const writes: { state: unknown; url: string; mode: 'push' | 'replace' }[] = [];
  const history = {
    state: initialState,
    pushState: vi.fn((state: unknown, _unused: string, url?: string | URL | null) => {
      history.state = state;
      writes.push({ state, url: String(url), mode: 'push' });
    }),
    replaceState: vi.fn((state: unknown, _unused: string, url?: string | URL | null) => {
      history.state = state;
      writes.push({ state, url: String(url), mode: 'replace' });
    }),
  };
  return { history, writes };
}

function storeQuery(storage: ListSessionStorage | null, actorId: string, query = search) {
  const { history, writes } = historyFor();
  const key = writeBOQListLocation({ storage, actorId, query, history, href: base, mode: 'push' });
  return { key, history, url: new URL(writes[0].url, base).href };
}

function resolve(storage: ListSessionStorage | null, actorId: string, href = base, historyState: unknown = null) {
  return readBOQListLocation({ storage, actorId, href, historyState });
}

beforeEach(() => {
  clearBOQListSessions(new MemoryStorage());
});

describe('BOQ session-only list location', () => {
  it('stores q/page/sort together, keeps only non-sensitive navigation in URL and preserves Next history state', () => {
    const storage = new MemoryStorage();
    const { history, writes } = historyFor();
    const key = writeBOQListLocation({
      query: search, actorId: 'actor-a', storage, history,
      href: `${base}?q=must-not-survive&unexpected=discard&page=90#results`, mode: 'replace',
    });
    expect(history.replaceState).toHaveBeenCalledTimes(1);
    expect(history.pushState).not.toHaveBeenCalled();
    expect(writes[0].url).toBe('/boq?page=3&sort=document_desc&search=1#results');
    expect(history.state).toEqual({
      __NA: true, tree: ['existing-next-tree'],
      [BOQ_LIST_HISTORY_FIELD]: { actorId: 'actor-a', key },
    });
    expect(JSON.stringify(history.state)).not.toContain(search.q);
    expect([...storage.values.values()].some(value => value.includes(search.q))).toBe(true);
    expect(resolve(storage, 'actor-a', new URL(writes[0].url, base).href, history.state))
      .toEqual({ query: search, key });
  });

  it('restores Back/Forward queries by entry key rather than applying the latest search everywhere', () => {
    const storage = new MemoryStorage();
    const first = storeQuery(storage, 'actor-a', search);
    const secondQuery: BOQListState = { page: 8, q: 'a different term', sort: 'project_asc' };
    const second = storeQuery(storage, 'actor-a', secondQuery);
    expect(resolve(storage, 'actor-a', first.url, first.history.state).query).toEqual(search);
    expect(resolve(storage, 'actor-a', second.url, second.history.state).query).toEqual(secondQuery);
    expect(first.key).not.toBe(second.key);
  });

  it('restores the last visited complete query when returning from an editor to plain /boq', () => {
    const storage = new MemoryStorage();
    const first = storeQuery(storage, 'actor-a', search);
    storeQuery(storage, 'actor-a', { page: 1, q: 'newer', sort: 'created_desc' });
    // Returning to the earlier history entry also makes it the current return unit.
    resolve(storage, 'actor-a', first.url, first.history.state);
    expect(resolve(storage, 'actor-a').query).toEqual(search);
  });

  it('uses an explicit structured URL instead of restoring a previous session search', () => {
    const storage = new MemoryStorage();
    const saved = storeQuery(storage, 'actor-a');
    expect(resolve(storage, 'actor-a', `${base}?page=7&sort=project_asc`, saved.history.state).query)
      .toEqual({ page: 7, q: '', sort: 'project_asc' });
  });

  it('does not apply another actor’s search/page or history marker', () => {
    const storage = new MemoryStorage();
    const a = storeQuery(storage, 'actor-a');
    storeQuery(storage, 'actor-b', { page: 2, q: 'B only', sort: 'project_asc' });
    expect(resolve(storage, 'actor-b', a.url, a.history.state).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
    expect(resolve(storage, 'actor-a', a.url, a.history.state).query).toEqual(search);
  });

  it('resets a copied search URL with no matching history entry to unsearched page one', () => {
    const storage = new MemoryStorage();
    storeQuery(storage, 'actor-a');
    expect(resolve(storage, 'actor-a', `${base}?page=3&sort=document_desc&search=1`).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it('does not mix a stored search with a manually changed page or sort', () => {
    const storage = new MemoryStorage();
    const a = storeQuery(storage, 'actor-a');
    expect(resolve(storage, 'actor-a', `${base}?page=4&sort=document_desc&search=1`, a.history.state).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it('drops raw URL q even when another search was previously stored', () => {
    const storage = new MemoryStorage();
    const a = storeQuery(storage, 'actor-a');
    expect(resolve(storage, 'actor-a', `${base}?q=exposed&page=9`, a.history.state).query).toEqual(defaults);
  });

  it.each(['-1', '2junk', '2.5', 'NaN', 'Infinity', '1e10', '999999999999999999999'])
    ('normalizes malformed URL page %s without restoring unrelated last search', (page) => {
      const storage = new MemoryStorage();
      storeQuery(storage, 'actor-a');
      expect(resolve(storage, 'actor-a', `${base}?page=${page}`).query).toEqual(defaults);
    });

  it('removes the search flag when writing an unsearched query', () => {
    const storage = new MemoryStorage();
    const { history, writes } = historyFor();
    writeBOQListLocation({ query: defaults, actorId: 'actor-a', storage, history, href: `${base}?search=1&q=old`, mode: 'push' });
    expect(writes[0].url).toBe('/boq?page=1&sort=created_desc');
  });
});

describe('session integrity, bounds and unavailable storage', () => {
  it('returns no browser storage during server rendering or a denied getter', () => {
    expect(getBOQListStorage()).toBeNull();
    vi.stubGlobal('window', { get sessionStorage() { throw new DOMException('Denied', 'SecurityError'); } });
    try {
      expect(getBOQListStorage()).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('ignores malformed persisted JSON and invalid stored query units', () => {
    const storage = new MemoryStorage();
    const actorId = 'actor-corrupt';
    const key = crypto.randomUUID();
    const prefix = `${BOQ_LIST_SESSION_PREFIX}v1:${actorId}:`;
    storage.setItem(`${prefix}entry:${key}`, '{broken json');
    storage.setItem(`${prefix}last`, JSON.stringify(key));
    expect(resolve(storage, actorId).query).toEqual(defaults);

    const anotherActor = 'actor-invalid-query';
    const anotherPrefix = `${BOQ_LIST_SESSION_PREFIX}v1:${anotherActor}:`;
    storage.setItem(`${anotherPrefix}entry:${key}`, JSON.stringify({
      version: 1, actorId: anotherActor, key, query: { page: 0, q: 'never restore', sort: 'unknown' },
    }));
    expect(resolve(storage, anotherActor, `${base}?page=3&sort=document_desc&search=1`, {
      [BOQ_LIST_HISTORY_FIELD]: { actorId: anotherActor, key },
    }).query).toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it('rejects a persisted entry whose internal actor does not match its namespace/marker', () => {
    const storage = new MemoryStorage();
    const key = crypto.randomUUID();
    storage.setItem(`${BOQ_LIST_SESSION_PREFIX}v1:actor-b:entry:${key}`, JSON.stringify({
      version: 1, actorId: 'actor-a', key, query: search,
    }));
    expect(resolve(storage, 'actor-b', `${base}?page=3&sort=document_desc&search=1`, {
      [BOQ_LIST_HISTORY_FIELD]: { actorId: 'actor-b', key },
    }).query).toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it('bounds per-actor entries and resets expired search history instead of reusing the latest q', () => {
    const storage = new MemoryStorage();
    const first = storeQuery(storage, 'actor-a');
    for (let index = 0; index < BOQ_LIST_SESSION_LIMIT; index++) {
      storeQuery(storage, 'actor-a', { page: 1, q: `search-${index}`, sort: 'created_desc' });
    }
    const entries = [...storage.values.keys()].filter(key => key.includes(':entry:'));
    expect(entries).toHaveLength(BOQ_LIST_SESSION_LIMIT);
    expect(resolve(storage, 'actor-a', first.url, first.history.state).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
    expect([...storage.values.keys()].filter(key => key.includes(':entry:')))
      .toHaveLength(BOQ_LIST_SESSION_LIMIT);
  });

  it('clears every actor’s list session on logout and preserves unrelated storage', () => {
    const storage = new MemoryStorage();
    storeQuery(storage, 'actor-a');
    storeQuery(storage, 'actor-b', { page: 2, q: 'B only', sort: 'project_asc' });
    storage.setItem('unrelated-preference', 'keep');
    clearBOQListSessions(storage);
    expect([...storage.values.entries()]).toEqual([['unrelated-preference', 'keep']]);
    expect(resolve(storage, 'actor-a').query).toEqual(defaults);
    expect(resolve(storage, 'actor-b').query).toEqual(defaults);
  });

  it('keeps same-tab Back/Forward working if browser session storage throws', () => {
    const denied = () => { throw new DOMException('Denied', 'SecurityError'); };
    const storage: ListSessionStorage = {
      get length() { return denied(); }, getItem: denied, setItem: denied, removeItem: denied, key: denied,
    };
    const saved = storeQuery(storage, 'actor-a');
    expect(resolve(storage, 'actor-a', saved.url, saved.history.state).query).toEqual(search);
    expect(() => clearBOQListSessions(storage)).not.toThrow();
    expect(resolve(storage, 'actor-a', saved.url, saved.history.state).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it('also works without any storage object and clears its memory on logout', () => {
    const saved = storeQuery(null, 'actor-a');
    expect(resolve(null, 'actor-a', saved.url, saved.history.state).query).toEqual(search);
    clearBOQListSessions(null);
    expect(resolve(null, 'actor-a', saved.url, saved.history.state).query)
      .toEqual({ page: 1, q: '', sort: 'document_desc' });
  });

  it.each([
    { mode: 'push' as const, persistent: true },
    { mode: 'replace' as const, persistent: true },
    { mode: 'push' as const, persistent: false },
    { mode: 'replace' as const, persistent: false },
  ])('does not commit session/memory when $mode history publication fails (storage=$persistent)', ({ mode, persistent }) => {
    const storage = persistent ? new MemoryStorage() : null;
    const saved = storeQuery(storage, 'actor-a');
    const history = saved.history;
    const stateBefore = history.state;
    const storageBefore = storage ? [...storage.values.entries()] : null;
    const method = history[mode === 'push' ? 'pushState' : 'replaceState'];
    method.mockClear();
    method.mockImplementation(() => { throw new DOMException('Denied', 'SecurityError'); });
    const rejected: BOQListState = { page: 7, q: 'must never restore the rejected query', sort: 'project_asc' };
    expect(() => writeBOQListLocation({ query: rejected, actorId: 'actor-a', storage, history, href: saved.url, mode }))
      .toThrow();
    expect(history.state).toBe(stateBefore);
    expect(storage ? [...storage.values.entries()] : null).toEqual(storageBefore);
    expect(resolve(storage, 'actor-a').query).toEqual(search);
    expect(resolve(storage, 'actor-a', saved.url, saved.history.state).query).toEqual(search);

    // The key prepared for the rejected history call must not resolve to the
    // failed query, even via the same-tab fallback when storage is unavailable.
    const [attemptedState, , attemptedHref] = method.mock.calls[0];
    expect(resolve(storage, 'actor-a', new URL(String(attemptedHref), base).href, attemptedState).query)
      .toEqual({ page: 1, q: '', sort: 'project_asc' });
  });
});
