import { describe, expect, it } from 'vitest';
import type { LineItem } from '../components/boq/LineItemsTable';
import type { Route } from '../components/boq/RouteManager';
import {
  cancelQuantityDraft,
  commitQuantityDraft,
  createEditorState,
  getDraftErrors,
  getEditorTotal,
  matchesFactorCalculation,
  setQuantityDraft,
  settleQuantityDrafts,
  stepQuantity,
  updateEditorGraph,
  type EditorState,
  type FactorCalculationState,
} from '../lib/boq/editorState';
import { buildBOQRoutesPayload } from '../lib/boq/editorData';
import { MAX_QUANTITY } from '../lib/boq/quantityInput';

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function graph(): EditorState {
  const itemA: LineItem = {
    id: 'item-a', item_order: 1, price_list_id: 'price-a', item_name: 'A',
    quantity: 1, unit: 'เมตร', material_cost_per_unit: 10.25,
    labor_cost_per_unit: 9.74, unit_cost: 19.99,
    total_material_cost: 10.25, total_labor_cost: 9.74, total_cost: 19.99,
    remarks: null, category: '1',
  };
  const itemB: LineItem = {
    ...itemA, id: 'item-b', item_name: 'B', quantity: 2,
    material_cost_per_unit: 2, labor_cost_per_unit: 3, unit_cost: 5,
    total_material_cost: 4, total_labor_cost: 6, total_cost: 10,
  };
  const routeA: Route = {
    id: 'route-a', route_order: 1, route_name: 'A', route_description: '',
    construction_area: '', total_material_cost: 10.25, total_labor_cost: 9.74, total_cost: 19.99,
  };
  const routeB: Route = {
    ...routeA, id: 'route-b', route_order: 2, route_name: 'B',
    total_material_cost: 4, total_labor_cost: 6, total_cost: 10,
  };
  return freeze(createEditorState('boq-a', [routeA, routeB], {
    'route-a': [itemA], 'route-b': [itemB],
  }));
}

function calculation(state: EditorState): FactorCalculationState {
  return {
    boqId: state.boqId,
    revision: state.revision,
    totalCost: getEditorTotal(state),
    factorReferenceVersionId: 'factor-a',
    status: 'ready',
    snapshot: {
      factor: 1.275, factorRaw: 1.275, totalWithFactor: 38.24, totalWithVAT: 40.92,
      lowerCost: 5_000_000, upperCost: 5_000_000, lowerValue: 1.275, upperValue: 1.275,
    },
  };
}

describe('active-route totals preserve existing loading behavior', () => {
  function storedGraph(activeRouteId?: string): EditorState {
    const initial = graph();
    return freeze(createEditorState('boq-a', [
      { ...initial.routes[0], total_material_cost: 200, total_labor_cost: 300, total_cost: 500 },
      { ...initial.routes[1], total_material_cost: 400, total_labor_cost: 500, total_cost: 900 },
    ], initial.routeItems, activeRouteId));
  }

  it('sums the initially selected route while retaining the hidden route stored summary', () => {
    const loaded = storedGraph();

    expect(loaded.routes[0]).toMatchObject({
      total_material_cost: 10.25, total_labor_cost: 9.74, total_cost: 19.99,
    });
    expect(loaded.routes[1]).toMatchObject({
      total_material_cost: 400, total_labor_cost: 500, total_cost: 900,
    });
    expect(loaded.routeItems['route-b'][0].total_cost).toBe(10);
    expect(getEditorTotal(loaded)).toBe(919.99);
  });

  it('honors an explicitly selected route on load instead of assuming the first route', () => {
    const loaded = storedGraph('route-b');

    expect(loaded.routes.map(route => route.total_cost)).toEqual([500, 10]);
    expect(loaded.routes[0]).toMatchObject({ total_material_cost: 200, total_labor_cost: 300 });
    expect(loaded.routes[1]).toMatchObject({ total_material_cost: 4, total_labor_cost: 6 });
  });

  it('keeps hidden stored totals through metadata changes and reordering', () => {
    const loaded = storedGraph();
    const renamed = updateEditorGraph(loaded, [
      loaded.routes[0], { ...loaded.routes[1], route_name: 'Renamed hidden route' },
    ], loaded.routeItems, 'route-a');
    const reordered = updateEditorGraph(freeze(renamed), [
      { ...renamed.routes[1], route_order: 1 }, { ...renamed.routes[0], route_order: 2 },
    ], renamed.routeItems, 'route-a');

    expect(reordered.routes.map(route => [route.id, route.total_cost])).toEqual([
      ['route-b', 900], ['route-a', 19.99],
    ]);
    const saved = buildBOQRoutesPayload(reordered.routes, reordered.routeItems);
    expect(saved[0]).toMatchObject({
      route_name: 'Renamed hidden route', total_material_cost: 400, total_labor_cost: 500,
      total_cost: 900, items: [{ quantity: 2, total_cost: 10 }],
    });
  });

  it('does not rewrite another route during realtime quantity editing, cancellation, or Save', () => {
    const loaded = storedGraph();
    const preview = freeze(setQuantityDraft(loaded, 'route-a', 'item-a', '2.50'));
    expect(preview.routes.map(route => route.total_cost)).toEqual([49.975, 900]);
    const cancelled = cancelQuantityDraft(preview, 'route-a', 'item-a');
    const settled = settleQuantityDrafts(cancelled);
    const saved = buildBOQRoutesPayload(settled.state.routes, settled.state.routeItems);

    expect(settled.errors).toEqual([]);
    expect(cancelled.routes).toEqual(loaded.routes);
    expect(saved[0]).toMatchObject({ total_cost: 19.99, items: [{ quantity: 1, total_cost: 19.99 }] });
    expect(saved[1]).toMatchObject({
      total_material_cost: 400, total_labor_cost: 500, total_cost: 900,
      items: [{ quantity: 2, total_cost: 10 }],
    });
  });

  it('saves loaded hidden summaries without repairing them when no quantity was edited', () => {
    const loaded = storedGraph();
    const settled = settleQuantityDrafts(loaded);
    const saved = buildBOQRoutesPayload(settled.state.routes, settled.state.routeItems);

    expect(settled.state).toBe(loaded);
    expect(saved.map(route => route.total_cost)).toEqual([19.99, 900]);
    expect(saved[1].items[0].total_cost).toBe(10);
    expect(getEditorTotal(settled.state)).toBe(919.99);
  });

  it('sums only the newly selected route and rejects Factor results for the preceding total', () => {
    const initial = storedGraph();
    const thirdRoute = { ...initial.routes[1], id: 'route-c', route_order: 3, route_name: 'C', total_cost: 700 };
    const loaded = freeze(createEditorState('boq-a', [...initial.routes, thirdRoute], {
      ...initial.routeItems, 'route-c': [{ ...initial.routeItems['route-b'][0], id: 'item-c' }],
    }, 'route-a'));
    const precedingFactor = calculation(loaded);
    const selected = updateEditorGraph(loaded, loaded.routes, loaded.routeItems, 'route-b');

    expect(selected.routes.map(route => route.total_cost)).toEqual([19.99, 10, 700]);
    expect(selected.routes[2]).toEqual(thirdRoute);
    expect(selected.routeItems).toEqual(loaded.routeItems);
    expect(matchesFactorCalculation(selected, 'factor-a', precedingFactor)).toBe(false);
    expect(matchesFactorCalculation(selected, 'factor-a', calculation(selected))).toBe(true);
    expect(buildBOQRoutesPayload(selected.routes, selected.routeItems).map(route => route.total_cost))
      .toEqual([19.99, 10, 700]);
  });

  it('retains invalid drafts when another route is selected and still blocks Save', () => {
    const drafted = freeze(setQuantityDraft(storedGraph(), 'route-a', 'item-a', '5x2'));
    const selected = updateEditorGraph(drafted, drafted.routes, drafted.routeItems, 'route-b');

    expect(selected.routes.map(route => route.total_cost)).toEqual([19.99, 10]);
    expect(selected.drafts).toEqual(drafted.drafts);
    expect(selected.quantityBaselines).toEqual(drafted.quantityBaselines);
    expect(settleQuantityDrafts(selected).errors).toMatchObject([{ routeId: 'route-a', itemId: 'item-a' }]);
  });

  it('adds and saves an empty route without refreshing other hidden summaries', () => {
    const loaded = storedGraph();
    const emptyRoute: Route = {
      ...loaded.routes[0], id: 'route-c', route_order: 3, route_name: 'C',
      total_material_cost: 0, total_labor_cost: 0, total_cost: 0,
    };
    const added = updateEditorGraph(loaded, [...loaded.routes, emptyRoute], {
      ...loaded.routeItems, 'route-c': [],
    }, 'route-c');

    expect(added.routes.map(route => route.total_cost)).toEqual([19.99, 900, 0]);
    expect(buildBOQRoutesPayload(added.routes, added.routeItems)[2]).toMatchObject({
      total_material_cost: 0, total_labor_cost: 0, total_cost: 0, items: [],
    });
  });

  it('updates the changed item route on add or removal while preserving hidden summaries', () => {
    const loaded = storedGraph();
    const added = updateEditorGraph(loaded, loaded.routes, {
      ...loaded.routeItems,
      'route-a': [...loaded.routeItems['route-a'], { ...loaded.routeItems['route-b'][0], id: 'added-item' }],
    });
    expect(added.routes.map(route => route.total_cost)).toEqual([29.99, 900]);
    const emptied = updateEditorGraph(freeze(added), added.routes, { ...added.routeItems, 'route-a': [] });

    expect(emptied.routes.map(route => route.total_cost)).toEqual([0, 900]);
    expect(emptied.routes[0]).toMatchObject({ total_material_cost: 0, total_labor_cost: 0 });
    expect(buildBOQRoutesPayload(emptied.routes, emptied.routeItems)[0].items).toEqual([]);
  });

  it('preserves a remaining route until selection and removes only deleted route drafts', () => {
    const drafted = freeze(setQuantityDraft(storedGraph(), 'route-a', 'item-a', '5x2'));
    const removed = updateEditorGraph(drafted, [drafted.routes[1]], drafted.routeItems);
    expect(removed.routes[0].total_cost).toBe(900);
    expect(removed.drafts).toEqual({});
    expect(removed.quantityBaselines).toEqual({});
    expect(Object.keys(removed.routeItems)).toEqual(['route-b']);
    const selected = updateEditorGraph(freeze(removed), removed.routes, removed.routeItems, 'route-b');

    expect(selected.routes[0].total_cost).toBe(10);
    expect(buildBOQRoutesPayload(selected.routes, selected.routeItems)).toHaveLength(1);
  });

  it('does not disguise missing item sets as empty routes on load or selection', () => {
    const initial = storedGraph();
    const loaded = createEditorState('boq-a', initial.routes, { 'route-a': initial.routeItems['route-a'] });
    const selected = updateEditorGraph(freeze(loaded), loaded.routes, loaded.routeItems, 'route-b');

    expect(Object.hasOwn(selected.routeItems, 'route-b')).toBe(false);
    expect(selected.routes[1].total_cost).toBe(900);
    expect(() => buildBOQRoutesPayload(selected.routes, selected.routeItems)).toThrow('ไม่ครบ');
    const empty = createEditorState('empty-boq');
    expect(empty.routes).toEqual([]);
    expect(() => buildBOQRoutesPayload(empty.routes, empty.routeItems)).toThrow('ยังไม่มีข้อมูลเส้นทาง');
  });
});

describe('realtime quantity previews and cancellable drafts', () => {
  it.each(['5*2', '.', ''])('retains invalid draft %j without changing quantities and totals', text => {
    const initial = graph();
    const drafted = setQuantityDraft(initial, 'route-a', 'item-a', text);

    expect(drafted.drafts).toEqual({ 'route-a': { 'item-a': text } });
    expect(drafted.routeItems).toEqual(initial.routeItems);
    expect(drafted.routes).toEqual(initial.routes);
    expect(drafted.revision).toBe(initial.revision);
    expect(initial.drafts).toEqual({});
    expect(initial.quantityBaselines).toEqual({});
  });

  it('previews item and route totals while typing, then confirms without calculating or revising again', () => {
    const initial = graph();
    const drafted = freeze(setQuantityDraft(initial, 'route-a', 'item-a', '2.50'));
    const committed = commitQuantityDraft(drafted, 'route-a', 'item-a');

    expect(drafted.routeItems['route-a'][0]).toEqual({
      ...initial.routeItems['route-a'][0], quantity: 2.5,
      total_material_cost: 25.625, total_labor_cost: 24.35, total_cost: 49.975,
    });
    expect(drafted.routes[0]).toEqual({
      ...initial.routes[0],
      total_material_cost: 25.625, total_labor_cost: 24.35, total_cost: 49.975,
    });
    expect(committed.routeItems['route-b']).toEqual(initial.routeItems['route-b']);
    expect(committed.routes[1]).toEqual(initial.routes[1]);
    expect(getEditorTotal(committed)).toBeCloseTo(59.975, 10);
    expect(committed.drafts).toEqual({});
    expect(committed.quantityBaselines).toEqual({});
    expect(committed.revision).toBe(initial.revision + 1);
    expect(committed.revision).toBe(drafted.revision);
    expect(committed.routeItems).toBe(drafted.routeItems);
    expect(committed.routes).toBe(drafted.routes);
    expect(drafted.drafts['route-a']['item-a']).toBe('2.50');
    expect(drafted.quantityBaselines['route-a']['item-a']).toEqual({
      quantity: 1, total_material_cost: 10.25, total_labor_cost: 9.74, total_cost: 19.99,
    });
    expect(commitQuantityDraft(committed, 'route-a', 'item-a')).toBe(committed);
  });

  it('shows the last valid typed preview but never turns typed or pasted multiplication into 52', () => {
    const initial = graph();
    const five = freeze(setQuantityDraft(initial, 'route-a', 'item-a', '5'));
    const typed = setQuantityDraft(
      setQuantityDraft(five, 'route-a', 'item-a', '5x'), 'route-a', 'item-a', '5x2',
    );
    const pasted = setQuantityDraft(initial, 'route-a', 'item-a', '5x2');

    expect(five.routeItems['route-a'][0].quantity).toBe(5);
    expect(typed.routeItems['route-a'][0].quantity).toBe(5);
    expect(typed.routeItems['route-a'][0].total_cost).toBe(99.95);
    expect(typed.revision).toBe(five.revision);
    expect(pasted.routeItems['route-a'][0].quantity).toBe(1);
    for (const state of [typed, pasted]) {
      expect(state.drafts['route-a']['item-a']).toBe('5x2');
      expect(getDraftErrors(state)).toHaveLength(1);
      const cancelled = cancelQuantityDraft(freeze(state), 'route-a', 'item-a');
      expect(cancelled.routeItems).toEqual(initial.routeItems);
      expect(cancelled.routes).toEqual(initial.routes);
      expect(cancelled.drafts).toEqual({});
      expect(cancelled.quantityBaselines).toEqual({});
    }
  });

  it('keeps the original edit baseline through valid, invalid, and corrected input', () => {
    const initial = graph();
    let drafted = setQuantityDraft(initial, 'route-a', 'item-a', '2.50');
    drafted = setQuantityDraft(drafted, 'route-a', 'item-a', '2.501');
    expect(drafted.routeItems['route-a'][0].quantity).toBe(2.5);
    drafted = freeze(setQuantityDraft(drafted, 'route-a', 'item-a', '3.75'));

    const cancelled = cancelQuantityDraft(drafted, 'route-a', 'item-a');
    expect(cancelled.routeItems).toEqual(initial.routeItems);
    expect(cancelled.routes).toEqual(initial.routes);
    expect(cancelled.revision).toBe(drafted.revision + 1);
    expect(cancelQuantityDraft(cancelled, 'route-a', 'item-a')).toBe(cancelled);
  });

  it.each(['', '.'])('retains the last valid preview when typing becomes incomplete as %j', text => {
    const initial = graph();
    const preview = setQuantityDraft(initial, 'route-a', 'item-a', '2.50');
    const incomplete = freeze(setQuantityDraft(preview, 'route-a', 'item-a', text));

    expect(incomplete.routeItems).toBe(preview.routeItems);
    expect(incomplete.routes).toBe(preview.routes);
    expect(incomplete.revision).toBe(preview.revision);
    expect(getDraftErrors(incomplete)).toHaveLength(1);
    expect(commitQuantityDraft(incomplete, 'route-a', 'item-a')).toBe(incomplete);
    expect(cancelQuantityDraft(incomplete, 'route-a', 'item-a').routeItems).toEqual(initial.routeItems);
  });

  it('does not invalidate calculations when only the numeric text representation changes', () => {
    const initial = graph();
    let drafted = setQuantityDraft(initial, 'route-a', 'item-a', '1');
    for (const text of ['1.', '1.0', '1.00', ' 1.00 ']) {
      drafted = setQuantityDraft(freeze(drafted), 'route-a', 'item-a', text);
      expect(drafted.revision).toBe(initial.revision);
      expect(drafted.routeItems).toBe(initial.routeItems);
      expect(drafted.routes).toBe(initial.routes);
    }
    const committed = commitQuantityDraft(drafted, 'route-a', 'item-a');
    expect(committed.revision).toBe(initial.revision);
    expect(committed.drafts).toEqual({});
    expect(committed.quantityBaselines).toEqual({});
  });

  it('starts each new edit from the quantity accepted after the preceding cancel or confirm', () => {
    const initial = graph();
    const cancelled = cancelQuantityDraft(
      setQuantityDraft(initial, 'route-a', 'item-a', '8'), 'route-a', 'item-a',
    );
    const secondDraft = setQuantityDraft(cancelled, 'route-a', 'item-a', '3');
    expect(secondDraft.quantityBaselines['route-a']['item-a'].quantity).toBe(1);
    const confirmed = commitQuantityDraft(secondDraft, 'route-a', 'item-a');
    const thirdDraft = setQuantityDraft(confirmed, 'route-a', 'item-a', '7');
    expect(thirdDraft.quantityBaselines['route-a']['item-a'].quantity).toBe(3);
    expect(cancelQuantityDraft(thirdDraft, 'route-a', 'item-a').routeItems['route-a'][0].quantity).toBe(3);
  });

  it('restores only quantity and its totals when a remark changes during an edit', () => {
    const initial = graph();
    const drafted = setQuantityDraft(initial, 'route-a', 'item-a', '2.50');
    const withRemark = freeze(updateEditorGraph(drafted, drafted.routes, {
      ...drafted.routeItems,
      'route-a': [{ ...drafted.routeItems['route-a'][0], remarks: 'Keep this remark' }],
    }));

    const cancelled = cancelQuantityDraft(withRemark, 'route-a', 'item-a');
    expect(cancelled.routeItems['route-a'][0]).toEqual({
      ...initial.routeItems['route-a'][0], remarks: 'Keep this remark',
    });
    expect(cancelled.routes).toEqual(initial.routes);
  });

  it.each(['5*2', '5x2', '5X2', '5×2', '1..2', '1.234', '.', ''])('does not commit invalid or incomplete draft %j', text => {
    const drafted = freeze(setQuantityDraft(graph(), 'route-a', 'item-a', text));

    expect(commitQuantityDraft(drafted, 'route-a', 'item-a')).toBe(drafted);
    expect(getDraftErrors(drafted)).toMatchObject([{ routeId: 'route-a', itemId: 'item-a' }]);
  });

  it('cancels only the selected draft without changing committed data or another route draft', () => {
    let drafted = setQuantityDraft(graph(), 'route-a', 'item-a', '5*2');
    drafted = freeze(setQuantityDraft(drafted, 'route-b', 'item-b', '4.5'));
    const cancelled = cancelQuantityDraft(drafted, 'route-a', 'item-a');

    expect(cancelled.drafts).toEqual({ 'route-b': { 'item-b': '4.5' } });
    expect(cancelled.routeItems).toEqual(drafted.routeItems);
    expect(cancelled.routes).toEqual(drafted.routes);
    expect(cancelled.revision).toBe(drafted.revision);
    expect(drafted.drafts['route-a']['item-a']).toBe('5*2');
  });

  it('ignores edits for an item outside the specified route', () => {
    const initial = graph();
    expect(setQuantityDraft(initial, 'route-a', 'item-b', '8')).toBe(initial);
    expect(setQuantityDraft(initial, 'missing-route', 'item-a', '8')).toBe(initial);
  });

  it('leaves loaded quantities above two decimals and their stored item totals unchanged without an explicit edit', () => {
    const initial = graph();
    const legacyItem = {
      ...initial.routeItems['route-a'][0], quantity: 1.234,
      total_material_cost: 12.6485, total_labor_cost: 12.01916, total_cost: 24.66766,
    };
    const loaded = freeze(createEditorState('old-boq', initial.routes, {
      ...initial.routeItems, 'route-a': [legacyItem],
    }));

    expect(loaded.routeItems['route-a'][0]).toEqual(legacyItem);
    expect(settleQuantityDrafts(loaded).state).toBe(loaded);
    const cancelled = cancelQuantityDraft(
      setQuantityDraft(loaded, 'route-a', 'item-a', '1.23'), 'route-a', 'item-a',
    );
    const editedElsewhere = commitQuantityDraft(
      setQuantityDraft(cancelled, 'route-b', 'item-b', '3'), 'route-b', 'item-b',
    );
    expect(editedElsewhere.routeItems['route-a'][0]).toEqual(legacyItem);
    expect(buildBOQRoutesPayload(editedElsewhere.routes, editedElsewhere.routeItems)[0].items[0].quantity).toBe(1.234);
  });
});

describe('settling all route drafts before Save', () => {
  it.each(['5*2', '.', ''])('blocks Save and preserves displayed previews when another route contains %j', invalidText => {
    const initial = graph();
    let drafted = setQuantityDraft(initial, 'route-a', 'item-a', '4.25');
    drafted = freeze(setQuantityDraft(drafted, 'route-b', 'item-b', invalidText));
    const settled = settleQuantityDrafts(drafted);

    expect(settled.errors).toMatchObject([{ routeId: 'route-b', itemId: 'item-b' }]);
    expect(settled.state).toBe(drafted);
    expect(settled.state.routeItems['route-a'][0].quantity).toBe(4.25);
    expect(settled.state.routes[0].total_cost).toBe(84.9575);
    expect(settled.state.routeItems['route-b']).toEqual(initial.routeItems['route-b']);
    expect(settled.state.revision).toBe(initial.revision + 1);
    expect(settled.state.drafts['route-a']['item-a']).toBe('4.25');
    expect(settled.state.quantityBaselines).toEqual(drafted.quantityBaselines);
  });

  it('confirms every valid preview without recalculating after the last invalid draft is corrected', () => {
    const initial = graph();
    let drafted = setQuantityDraft(initial, 'route-a', 'item-a', '4.25');
    drafted = setQuantityDraft(drafted, 'route-b', 'item-b', '5*2');
    drafted = freeze(setQuantityDraft(drafted, 'route-b', 'item-b', '7.50'));
    const settled = settleQuantityDrafts(drafted);

    expect(settled.errors).toEqual([]);
    expect(settled.state.routeItems['route-a'][0].quantity).toBe(4.25);
    expect(settled.state.routeItems['route-b'][0].quantity).toBe(7.5);
    expect(settled.state.routes.map(route => route.total_cost)).toEqual([84.9575, 37.5]);
    expect(getEditorTotal(settled.state)).toBeCloseTo(122.4575, 10);
    expect(settled.state.revision).toBe(initial.revision + 2);
    expect(settled.state.revision).toBe(drafted.revision);
    expect(settled.state.routeItems).toBe(drafted.routeItems);
    expect(settled.state.routes).toBe(drafted.routes);
    expect(settled.state.drafts).toEqual({});
    expect(settled.state.quantityBaselines).toEqual({});
    expect(settleQuantityDrafts(settled.state).state).toBe(settled.state);
  });

  it('builds the Save payload from exact current previews without carrying draft or baseline metadata', () => {
    const initial = graph();
    const drafted = freeze(setQuantityDraft(initial, 'route-a', 'item-a', '2.50'));
    const currentFactor = calculation(drafted);
    const settled = settleQuantityDrafts(drafted);
    const payload = buildBOQRoutesPayload(settled.state.routes, settled.state.routeItems);

    expect(settled.errors).toEqual([]);
    expect(matchesFactorCalculation(settled.state, 'factor-a', currentFactor)).toBe(true);
    expect(payload).toEqual(buildBOQRoutesPayload(drafted.routes, drafted.routeItems));
    expect(payload[0]).toMatchObject({
      total_material_cost: 25.625, total_labor_cost: 24.35, total_cost: 49.975,
      items: [{ quantity: 2.5, total_material_cost: 25.625, total_labor_cost: 24.35, total_cost: 49.975 }],
    });
    expect(JSON.stringify(payload)).not.toMatch(/drafts|quantityBaselines/);
  });
});

describe('draft identity as routes and items change', () => {
  it('retains drafts by route and item ID when routes are reordered', () => {
    let drafted = setQuantityDraft(graph(), 'route-a', 'item-a', '5*2');
    drafted = freeze(setQuantityDraft(drafted, 'route-b', 'item-b', '3.5'));
    const reordered = updateEditorGraph(drafted, [
      { ...drafted.routes[1], route_order: 1 }, { ...drafted.routes[0], route_order: 2 },
    ], drafted.routeItems);

    expect(reordered.routes.map(route => route.id)).toEqual(['route-b', 'route-a']);
    expect(reordered.drafts).toEqual(drafted.drafts);
    expect(reordered.quantityBaselines).toEqual(drafted.quantityBaselines);
    expect(getDraftErrors(reordered)).toMatchObject([{ routeId: 'route-a', itemId: 'item-a' }]);
  });

  it('deletes only the removed item or route drafts, including repeated item IDs in different routes', () => {
    const initial = graph();
    const sharedIdGraph = updateEditorGraph(initial, initial.routes, {
      'route-a': initial.routeItems['route-a'],
      'route-b': [{ ...initial.routeItems['route-b'][0], id: 'item-a' }],
    });
    let drafted = setQuantityDraft(sharedIdGraph, 'route-a', 'item-a', '5*2');
    drafted = freeze(setQuantityDraft(drafted, 'route-b', 'item-a', '3.5'));
    const removedItem = updateEditorGraph(drafted, drafted.routes, {
      ...drafted.routeItems, 'route-a': [],
    });
    expect(removedItem.drafts).toEqual({ 'route-b': { 'item-a': '3.5' } });
    expect(Object.keys(removedItem.quantityBaselines)).toEqual(['route-b']);
    expect(removedItem.routes[0].total_cost).toBe(0);
    expect(getDraftErrors(removedItem)).toEqual([]);

    const removedRoute = updateEditorGraph(drafted, [drafted.routes[0]], drafted.routeItems);
    expect(removedRoute.drafts).toEqual({ 'route-a': { 'item-a': '5*2' } });
    expect(Object.keys(removedRoute.quantityBaselines)).toEqual(['route-a']);
    expect(Object.keys(removedRoute.routeItems)).toEqual(['route-a']);
  });

  it('cancels the correct baseline after reorder when two routes use the same item ID', () => {
    const initial = graph();
    const sameIds = updateEditorGraph(initial, initial.routes, {
      ...initial.routeItems,
      'route-b': [{ ...initial.routeItems['route-b'][0], id: 'item-a' }],
    });
    let drafted = setQuantityDraft(sameIds, 'route-a', 'item-a', '5');
    drafted = setQuantityDraft(drafted, 'route-b', 'item-a', '7');
    const reordered = updateEditorGraph(drafted, [drafted.routes[1], drafted.routes[0]], drafted.routeItems);
    const cancelled = cancelQuantityDraft(freeze(reordered), 'route-a', 'item-a');

    expect(cancelled.routeItems['route-a'][0]).toEqual(initial.routeItems['route-a'][0]);
    expect(cancelled.routeItems['route-b'][0].quantity).toBe(7);
    expect(cancelled.routes.map(route => [route.id, route.total_cost])).toEqual([
      ['route-b', 35], ['route-a', 19.99],
    ]);
    expect(cancelled.drafts).toEqual({ 'route-b': { 'item-a': '7' } });
    expect(cancelled.quantityBaselines['route-b']['item-a'].quantity).toBe(2);
  });

  it('keeps missing item sets missing so the existing payload guard still rejects them', () => {
    const initial = graph();
    const incomplete = updateEditorGraph(initial, initial.routes, { 'route-a': [] });

    expect(Object.hasOwn(incomplete.routeItems, 'route-b')).toBe(false);
    expect(() => buildBOQRoutesPayload(incomplete.routes, incomplete.routeItems)).toThrow('ไม่ครบ');
  });
});

describe('quantity stepping', () => {
  it('steps once from the valid visible draft and a later blur cannot apply it again', () => {
    const initial = graph();
    const drafted = freeze(setQuantityDraft(initial, 'route-a', 'item-a', '4.25'));
    const stepped = stepQuantity(drafted, 'route-a', 'item-a', 1);

    expect(stepped.routeItems['route-a'][0].quantity).toBe(5.25);
    expect(stepped.routeItems['route-a'][0].total_cost).toBe(104.9475);
    expect(stepped.routes[0].total_cost).toBe(104.9475);
    expect(stepped.revision).toBe(initial.revision + 2);
    expect(stepped.drafts).toEqual({});
    expect(stepped.quantityBaselines).toEqual({});
    expect(commitQuantityDraft(stepped, 'route-a', 'item-a')).toBe(stepped);
  });

  it('uses the committed value when no draft exists and clamps a decrement at zero', () => {
    const initial = graph();
    const increased = stepQuantity(initial, 'route-b', 'item-b', 1);
    expect(increased.routeItems['route-b'][0].quantity).toBe(3);
    const decreased = stepQuantity(setQuantityDraft(initial, 'route-a', 'item-a', '0.50'), 'route-a', 'item-a', -1);
    expect(decreased.routeItems['route-a'][0].quantity).toBe(0);
    expect(decreased.routes[0].total_cost).toBe(0);
  });

  it.each(['5*2', '.', ''])('does not step from invalid or incomplete draft %j', text => {
    const drafted = freeze(setQuantityDraft(graph(), 'route-a', 'item-a', text));
    expect(stepQuantity(drafted, 'route-a', 'item-a', 1)).toBe(drafted);
  });

  it('does not overflow the quantity limit or accept a non-finite step', () => {
    const initial = graph();
    const atLimit = freeze(setQuantityDraft(initial, 'route-a', 'item-a', String(MAX_QUANTITY)));
    expect(stepQuantity(atLimit, 'route-a', 'item-a', 1)).toBe(atLimit);
    expect(stepQuantity(initial, 'route-a', 'item-a', Infinity)).toBe(initial);
    expect(stepQuantity(initial, 'route-a', 'item-a', NaN)).toBe(initial);
  });
});

describe('Factor calculation identity', () => {
  it('matches only the current BOQ, revision, exact total, and bound reference version', () => {
    const state = graph();
    const current = calculation(state);
    expect(matchesFactorCalculation(state, 'factor-a', current)).toBe(true);
    expect(matchesFactorCalculation(state, 'factor-a', null)).toBe(false);

    const stale: Partial<FactorCalculationState>[] = [
      { boqId: 'another-boq' },
      { revision: state.revision - 1 },
      { revision: state.revision + 1 },
      { totalCost: current.totalCost + 0.000001 },
      { factorReferenceVersionId: 'factor-b' },
      { factorReferenceVersionId: null },
    ];
    for (const changed of stale) {
      expect(matchesFactorCalculation(state, 'factor-a', { ...current, ...changed })).toBe(false);
    }
    expect(matchesFactorCalculation(state, 'factor-b', current)).toBe(false);
    expect(matchesFactorCalculation(state, null, current)).toBe(false);
  });

  it('rejects an old result after a graph revision even when the grand total stays the same', () => {
    const state = graph();
    const oldResult = calculation(state);
    const renamed = updateEditorGraph(state, [
      { ...state.routes[0], route_name: 'Renamed' }, state.routes[1],
    ], state.routeItems);

    expect(getEditorTotal(renamed)).toBe(getEditorTotal(state));
    expect(matchesFactorCalculation(renamed, 'factor-a', oldResult)).toBe(false);
  });

  it('invalidates old Factor results on realtime changes and cancellation, even after restoring the original total', () => {
    const initial = graph();
    const originalResult = calculation(initial);
    const preview = setQuantityDraft(initial, 'route-a', 'item-a', '2.50');
    const previewResult = calculation(preview);

    expect(matchesFactorCalculation(preview, 'factor-a', originalResult)).toBe(false);
    expect(matchesFactorCalculation(preview, 'factor-a', previewResult)).toBe(true);
    const invalid = setQuantityDraft(preview, 'route-a', 'item-a', '2.501');
    expect(matchesFactorCalculation(invalid, 'factor-a', previewResult)).toBe(true);
    expect(settleQuantityDrafts(invalid).errors).toHaveLength(1);

    const cancelled = cancelQuantityDraft(invalid, 'route-a', 'item-a');
    expect(getEditorTotal(cancelled)).toBe(getEditorTotal(initial));
    expect(matchesFactorCalculation(cancelled, 'factor-a', originalResult)).toBe(false);
    expect(matchesFactorCalculation(cancelled, 'factor-a', previewResult)).toBe(false);
    expect(matchesFactorCalculation(cancelled, 'factor-a', calculation(cancelled))).toBe(true);
  });

  it.each(['loading', 'error'] as const)('identifies current %s results separately from their readiness status', status => {
    const state = graph();
    const current = { ...calculation(state), status, snapshot: null };
    expect(matchesFactorCalculation(state, 'factor-a', current)).toBe(true);
    expect(current.snapshot).toBeNull();
  });
});
