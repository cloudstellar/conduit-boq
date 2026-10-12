import type { Route } from '../../components/boq/RouteManager';
import type { LineItem } from '../../components/boq/LineItemsTable';
import { safeItemCalc } from '../calculation';
import { MAX_QUANTITY, parseQuantityDraft } from './quantityInput';

export interface FactorSnapshot {
  factor: number;
  totalWithFactor: number;
  totalWithVAT: number;
  factorRaw: number;
  lowerCost: number;
  upperCost: number;
  lowerValue: number;
  upperValue: number;
}

export interface FactorCalculationState {
  boqId: string;
  revision: number;
  totalCost: number;
  factorReferenceVersionId: string | null;
  status: 'loading' | 'error' | 'ready';
  snapshot: FactorSnapshot | null;
  message?: string;
}

export interface EditorState {
  boqId: string;
  revision: number;
  routes: Route[];
  routeItems: Record<string, LineItem[]>;
  drafts: Record<string, Record<string, string>>;
  quantityBaselines: Record<string, Record<string, QuantityBaseline>>;
}

type QuantityBaseline = Pick<LineItem, 'quantity' | 'total_material_cost' | 'total_labor_cost' | 'total_cost'>;

export interface EditorInteractionState {
  hasInvalidDrafts: boolean;
  busy: boolean;
}

export interface DraftError {
  routeId: string;
  itemId: string;
  message: string;
}

export const ZERO_FACTOR_SNAPSHOT: FactorSnapshot = {
  factor: 0, totalWithFactor: 0, totalWithVAT: 0, factorRaw: 0,
  lowerCost: 0, upperCost: 0, lowerValue: 0, upperValue: 0,
};

export function createEditorState(
  boqId: string, routes: Route[] = [], routeItems: Record<string, LineItem[]> = {},
  activeRouteId: string | null = routes[0]?.id ?? null,
): EditorState {
  // Loading must preserve summaries of routes the user has not opened, as in
  // the existing editor. Only the initially selected route is synchronized.
  return updateEditorGraph({ boqId, revision: -1, routes: [], routeItems, drafts: {}, quantityBaselines: {} }, routes, routeItems, activeRouteId);
}

/** Synchronize changed/selected routes only; retain other summaries and drafts. */
export function updateEditorGraph(
  state: EditorState, routes: Route[], routeItems: Record<string, LineItem[]>,
  recalculateRouteId: string | null = null,
): EditorState {
  const drafts: EditorState['drafts'] = {};
  const quantityBaselines: EditorState['quantityBaselines'] = {};
  const items: EditorState['routeItems'] = {};
  const nextRoutes = routes.map(route => {
    const routeRows = routeItems[route.id];
    // Keep missing arrays missing: the existing save payload guard must reject them.
    if (!Array.isArray(routeRows)) return route;
    items[route.id] = routeRows;
    const retained = Object.fromEntries(routeRows.flatMap(item => {
      const draft = state.drafts[route.id]?.[item.id];
      return draft === undefined ? [] : [[item.id, draft]];
    }));
    if (Object.keys(retained).length) drafts[route.id] = retained;
    const retainedBaselines = Object.fromEntries(routeRows.flatMap(item => {
      const baseline = state.quantityBaselines[route.id]?.[item.id];
      return retained[item.id] === undefined || baseline === undefined ? [] : [[item.id, baseline]];
    }));
    if (Object.keys(retainedBaselines).length) quantityBaselines[route.id] = retainedBaselines;
    if (route.id !== recalculateRouteId && routeRows === state.routeItems[route.id]) return route;
    const totals = routeRows.reduce((sum, item) => ({
      material: sum.material + item.total_material_cost,
      labor: sum.labor + item.total_labor_cost,
      total: sum.total + item.total_cost,
    }), { material: 0, labor: 0, total: 0 });
    return { ...route, total_material_cost: totals.material, total_labor_cost: totals.labor, total_cost: totals.total };
  });
  return { ...state, revision: state.revision + 1, routes: nextRoutes, routeItems: items, drafts, quantityBaselines };
}

function quantityValues(item: LineItem): QuantityBaseline {
  return {
    quantity: item.quantity,
    total_material_cost: item.total_material_cost,
    total_labor_cost: item.total_labor_cost,
    total_cost: item.total_cost,
  };
}

function applyQuantityValues(state: EditorState, routeId: string, itemId: string, values: QuantityBaseline): EditorState {
  const item = state.routeItems[routeId]?.find(row => row.id === itemId);
  if (!item || (item.quantity === values.quantity && item.total_material_cost === values.total_material_cost &&
    item.total_labor_cost === values.total_labor_cost && item.total_cost === values.total_cost)) return state;
  return updateEditorGraph(state, state.routes, {
    ...state.routeItems,
    [routeId]: state.routeItems[routeId].map(row => row.id === itemId ? { ...row, ...values } : row),
  });
}

export function setQuantityDraft(state: EditorState, routeId: string, itemId: string, text: string): EditorState {
  const item = state.routeItems[routeId]?.find(row => row.id === itemId);
  if (!item) return state;
  const next = {
    ...state,
    drafts: { ...state.drafts, [routeId]: { ...state.drafts[routeId], [itemId]: text } },
    quantityBaselines: {
      ...state.quantityBaselines,
      [routeId]: {
        ...state.quantityBaselines[routeId],
        [itemId]: state.quantityBaselines[routeId]?.[itemId] ?? quantityValues(item),
      },
    },
  };
  const parsed = parseQuantityDraft(text);
  // Valid typing updates every displayed total immediately. Rejected text keeps
  // the latest valid preview, while the first baseline remains available to Cancel.
  return parsed.status === 'valid'
    ? applyQuantityValues(next, routeId, itemId, quantityValues(withQuantity(item, parsed.value)))
    : next;
}

function clearQuantityDraft(state: EditorState, routeId: string, itemId: string): EditorState {
  if (state.drafts[routeId]?.[itemId] === undefined) return state;
  const drafts = { ...state.drafts };
  const routeDrafts = { ...drafts[routeId] };
  delete routeDrafts[itemId];
  if (Object.keys(routeDrafts).length) drafts[routeId] = routeDrafts;
  else delete drafts[routeId];
  const quantityBaselines = { ...state.quantityBaselines };
  const routeBaselines = { ...quantityBaselines[routeId] };
  delete routeBaselines[itemId];
  if (Object.keys(routeBaselines).length) quantityBaselines[routeId] = routeBaselines;
  else delete quantityBaselines[routeId];
  return { ...state, drafts, quantityBaselines };
}

export function cancelQuantityDraft(state: EditorState, routeId: string, itemId: string): EditorState {
  const baseline = state.quantityBaselines[routeId]?.[itemId];
  const cleared = clearQuantityDraft(state, routeId, itemId);
  return baseline ? applyQuantityValues(cleared, routeId, itemId, baseline) : cleared;
}

export function getDraftErrors(state: EditorState): DraftError[] {
  return Object.entries(state.drafts).flatMap(([routeId, drafts]) =>
    Object.entries(drafts).flatMap(([itemId, text]) => {
      const parsed = parseQuantityDraft(text);
      return parsed.status === 'valid' ? [] : [{ routeId, itemId, message: parsed.message }];
    }));
}

function withQuantity(item: LineItem, quantity: number): LineItem {
  return {
    ...item, quantity,
    total_material_cost: safeItemCalc(quantity, item.material_cost_per_unit),
    total_labor_cost: safeItemCalc(quantity, item.labor_cost_per_unit),
    total_cost: safeItemCalc(quantity, item.unit_cost),
  };
}

export function commitQuantityDraft(state: EditorState, routeId: string, itemId: string): EditorState {
  const text = state.drafts[routeId]?.[itemId];
  if (text === undefined) return state;
  const parsed = parseQuantityDraft(text);
  if (parsed.status !== 'valid') return state;
  // The numeric preview is already current; confirming only ends the edit session.
  return clearQuantityDraft(state, routeId, itemId);
}

/** Validate every route before finalizing the current previews for Save. */
export function settleQuantityDrafts(state: EditorState): { state: EditorState; errors: DraftError[] } {
  const errors = getDraftErrors(state);
  if (errors.length || !Object.keys(state.drafts).length) return { state, errors };
  return { state: { ...state, drafts: {}, quantityBaselines: {} }, errors: [] };
}

export function stepQuantity(state: EditorState, routeId: string, itemId: string, delta: number): EditorState {
  const item = state.routeItems[routeId]?.find(row => row.id === itemId);
  if (!item) return state;
  const draft = state.drafts[routeId]?.[itemId];
  const parsed = parseQuantityDraft(draft ?? String(item.quantity));
  if (parsed.status !== 'valid' || !Number.isFinite(delta)) return state;
  const next = Math.max(0, (Math.round(parsed.value * 100) + Math.round(delta * 100)) / 100);
  if (next > MAX_QUANTITY) return state;
  return commitQuantityDraft(setQuantityDraft(state, routeId, itemId, String(next)), routeId, itemId);
}

export function getEditorTotal(state: EditorState): number {
  return state.routes.reduce((sum, route) => sum + route.total_cost, 0);
}

export function matchesFactorCalculation(
  state: EditorState, referenceVersionId: string | null, calculation: FactorCalculationState | null,
): calculation is FactorCalculationState {
  return calculation !== null && calculation.boqId === state.boqId &&
    calculation.revision === state.revision && calculation.totalCost === getEditorTotal(state) &&
    calculation.factorReferenceVersionId === referenceVersionId;
}
