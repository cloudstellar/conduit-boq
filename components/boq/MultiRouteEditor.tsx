'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PriceListItem } from '@/lib/supabase';
import { loadBOQEditorData } from '@/lib/boq/editorData';
import {
  createEditorState, updateEditorGraph, setQuantityDraft, cancelQuantityDraft,
  commitQuantityDraft, settleQuantityDrafts, stepQuantity, getDraftErrors,
  getEditorTotal, matchesFactorCalculation, ZERO_FACTOR_SNAPSHOT,
  type EditorState, type FactorCalculationState, type FactorSnapshot, type EditorInteractionState,
} from '@/lib/boq/editorState';
import { Route } from './RouteManager';
import RouteSidebar from './RouteSidebar';
import LineItemsTable, { LineItem } from './LineItemsTable';
import TotalsSummary from './TotalsSummary';
import FactorFSummary from './FactorFSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Trash2, PanelLeftClose, PanelLeft, Copy } from 'lucide-react';

interface MultiRouteEditorProps {
  boqId: string;
  priceListVersionId: string;
  factorReferenceVersionId: string | null;
  onSave: (routes: Route[], routeItems: Record<string, LineItem[]>, factor: FactorSnapshot) => Promise<void>;
  isSaving: boolean;
  readOnly?: boolean;
  printDisabled?: boolean;
  printDisabledReason?: string;
  onInteractionStateChange?: (state: EditorInteractionState) => void;
}

interface PendingSave {
  editor: EditorState;
  referenceVersionId: string | null;
  started: boolean;
  timeout?: ReturnType<typeof setTimeout>;
}

export interface RouteWithItems extends Route {
  items: LineItem[];
}

// Sort items by category (natural sort), then item_order within category
function sortItemsByCategory<T extends { item_order: number; category?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const catA = a.category || '';
    const catB = b.category || '';
    const cmp = catA.localeCompare(catB, undefined, { numeric: true });
    if (cmp !== 0) return cmp;
    return a.item_order - b.item_order;
  });
}

// Check if item is special (งานวางท่อ / งานดันท่อ)
const isSpecialItem = (itemName: string): boolean => {
  return itemName.startsWith('งานวางท่อ') || itemName.startsWith('งานดันท่อ');
};

// Check if item is single pipe (1 ท่อ) - pattern: "งานวางท่อ 1-" or "งานดันท่อ 1-"
const isSinglePipeItem = (itemName: string): boolean => {
  return /^งานวางท่อ\s+1-/.test(itemName) || /^งานดันท่อ.*1-/.test(itemName);
};

export default function MultiRouteEditor({
  boqId,
  priceListVersionId,
  factorReferenceVersionId,
  onSave,
  isSaving,
  readOnly = false,
  printDisabled = false,
  printDisabledReason,
  onInteractionStateChange,
}: MultiRouteEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [editor, setEditor] = useState(() => createEditorState(boqId));
  const editorRef = useRef(editor);
  const { routes, routeItems } = editor;
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);
  const factorRef = useRef<FactorCalculationState | null>(null);
  const [isPreparingSave, setIsPreparingSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [factorAttempt, setFactorAttempt] = useState(0);
  const [factorFailed, setFactorFailed] = useState(false);
  const locked = readOnly || isSaving || isPreparingSave;
  const draftErrors = getDraftErrors(editor);
  const hasInvalidDrafts = draftErrors.length > 0;

  // Commands read this ref immediately, including blur followed by click in one gesture.
  const publishEditor = useCallback((next: EditorState) => {
    editorRef.current = next;
    setEditor(next);
    onInteractionStateChange?.({
      hasInvalidDrafts: getDraftErrors(next).length > 0,
      busy: Boolean(pendingSaveRef.current),
    });
  }, [onInteractionStateChange]);

  const mutateGraph = useCallback((change: (current: EditorState) => Pick<EditorState, 'routes' | 'routeItems'>) => {
    if (readOnly || isSaving || pendingSaveRef.current) return;
    const current = editorRef.current;
    const next = change(current);
    publishEditor(updateEditorGraph(current, next.routes, next.routeItems, activeRouteId));
    setSaveError(null);
  }, [readOnly, isSaving, publishEditor, activeRouteId]);

  const selectRoute = useCallback((routeId: string | null) => {
    const current = editorRef.current;
    if (routeId && !current.routes.some(route => route.id === routeId)) return;
    // Match the existing active-route totals behavior, publishing synchronously
    // so an immediate Save cannot use totals from before the route was opened.
    publishEditor(updateEditorGraph(current, current.routes, current.routeItems, routeId));
    setActiveRouteId(routeId);
  }, [publishEditor]);

  const finishPreparation = useCallback((request: PendingSave, message?: string) => {
    if (pendingSaveRef.current !== request) return;
    clearTimeout(request.timeout);
    pendingSaveRef.current = null;
    setIsPreparingSave(false);
    if (message) setSaveError(message);
    onInteractionStateChange?.({ hasInvalidDrafts: getDraftErrors(editorRef.current).length > 0, busy: false });
  }, [onInteractionStateChange]);

  const trySave = useCallback((calculation: FactorCalculationState | null) => {
    const request = pendingSaveRef.current;
    if (!request || request.started) return;
    if (request.editor !== editorRef.current || request.editor.boqId !== boqId ||
      request.referenceVersionId !== factorReferenceVersionId || readOnly) {
      finishPreparation(request, 'ข้อมูลเปลี่ยนระหว่างเตรียมบันทึก กรุณาตรวจสอบแล้วกดบันทึกอีกครั้ง');
      return;
    }
    if (!matchesFactorCalculation(request.editor, request.referenceVersionId, calculation)) return;
    if (calculation.status === 'loading') return;
    if (calculation.status === 'error' || !calculation.snapshot) {
      finishPreparation(request, calculation.message || 'ยังคำนวณ Factor F ไม่สำเร็จ กรุณาลองโหลด Factor F อีกครั้ง');
      return;
    }
    request.started = true;
    clearTimeout(request.timeout);
    // The accepted graph and Factor result are captured together before any auth/RPC awaits.
    void onSave(request.editor.routes, request.editor.routeItems, { ...calculation.snapshot })
      .catch(err => {
        if (pendingSaveRef.current === request) setSaveError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
      })
      .finally(() => finishPreparation(request));
  }, [boqId, factorReferenceVersionId, readOnly, onSave, finishPreparation]);

  const handleCalculationStateChange = useCallback((calculation: FactorCalculationState) => {
    if (!matchesFactorCalculation(editorRef.current, factorReferenceVersionId, calculation)) return;
    factorRef.current = calculation;
    setFactorFailed(calculation.status === 'error');
    trySave(calculation);
  }, [factorReferenceVersionId, trySave]);

  useEffect(() => () => {
    clearTimeout(pendingSaveRef.current?.timeout);
    pendingSaveRef.current = null;
  }, [boqId]);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadState, setLoadState] = useState<{
    boqId: string;
    attempt: number;
    status: 'ready' | 'error';
  } | null>(null);
  // A different BOQ or retry is loading immediately, before the effect starts.
  const isCurrentLoad = loadState?.boqId === boqId && loadState.attempt === loadAttempt;
  const isReady = isCurrentLoad && loadState.status === 'ready';
  const hasLoadError = isCurrentLoad && loadState.status === 'error';

  // State for special item modal (งานวางท่อ / งานดันท่อ)
  const [pendingSpecialItem, setPendingSpecialItem] = useState<PriceListItem | null>(null);
  const [showSpecialItemModal, setShowSpecialItemModal] = useState(false);

  // Sidebar collapse state with localStorage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('boq-sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Toggle sidebar and persist to localStorage
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('boq-sidebar-collapsed', String(newState));
      return newState;
    });
  }, []);

  // Publish the editor data only after every route/item query succeeds.
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await loadBOQEditorData(supabase, boqId);
        if (cancelled) return;
        publishEditor(createEditorState(boqId, data.routes, data.routeItems, data.activeRouteId));
        setActiveRouteId(data.activeRouteId);
        setLoadState({ boqId, attempt: loadAttempt, status: 'ready' });
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading routes:', err);
        setLoadState({ boqId, attempt: loadAttempt, status: 'error' });
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [boqId, loadAttempt, supabase, publishEditor]);

  const handleAddRoute = useCallback(() => {
    if (locked || pendingSaveRef.current) return;
    const currentRoutes = editorRef.current.routes;

    const newRoute: Route = {
      id: crypto.randomUUID(),
      route_order: currentRoutes.length + 1,
      route_name: `เส้นทาง ${currentRoutes.length + 1}`,
      route_description: '',
      construction_area: '',
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
    };
    mutateGraph(current => ({ routes: [...current.routes, newRoute], routeItems: { ...current.routeItems, [newRoute.id]: [] } }));
    selectRoute(newRoute.id);
  }, [locked, mutateGraph, selectRoute]);

  const handleSelectRoute = useCallback((routeId: string) => {
    if (pendingSaveRef.current || isSaving) return;
    selectRoute(routeId);
  }, [isSaving, selectRoute]);

  const handleUpdateRoute = useCallback((routeId: string, field: keyof Route, value: string) => {
    mutateGraph(current => ({ ...current, routes: current.routes.map(r => r.id === routeId ? { ...r, [field]: value } : r) }));
  }, [mutateGraph]);

  const handleRemoveRoute = useCallback((routeId: string) => {
    if (locked || pendingSaveRef.current) return;
    mutateGraph(current => ({ ...current, routes: current.routes.filter(r => r.id !== routeId) }));
    if (activeRouteId === routeId) {
      selectRoute(editorRef.current.routes[0]?.id ?? null);
    }
  }, [activeRouteId, locked, mutateGraph, selectRoute]);

  // Duplicate a route with all its items (deep copy)
  const handleDuplicateRoute = useCallback((routeId: string) => {
    if (locked || pendingSaveRef.current) return;
    const current = editorRef.current;
    if (Object.keys(current.drafts[routeId] || {}).length) {
      selectRoute(routeId);
      setSaveError('กรุณายืนยันหรือยกเลิกปริมาณที่กำลังแก้ไขในเส้นทางนี้ก่อนคัดลอก');
      return;
    }

    const { routes, routeItems } = current;
    const sourceRoute = routes.find(r => r.id === routeId);
    if (!sourceRoute) return;

    const sourceItems = routeItems[routeId] || [];
    const baseName = sourceRoute.route_name || `เส้นทาง ${routes.findIndex(r => r.id === routeId) + 1}`;

    // Generate unique copy name: "Name - สำเนา" or "Name - สำเนา (2)"
    const copyPattern = /^(.+) - สำเนา(?: \((\d+)\))?$/;
    const existingCopies = routes.filter(r => {
      const match = r.route_name?.match(copyPattern);
      return match && match[1] === baseName || r.route_name === `${baseName} - สำเนา`;
    });

    let newName: string;
    if (existingCopies.length === 0) {
      newName = `${baseName} - สำเนา`;
    } else {
      newName = `${baseName} - สำเนา (${existingCopies.length + 1})`;
    }

    // Create new route (deep copy)
    const newRoute: Route = {
      ...structuredClone(sourceRoute),
      id: crypto.randomUUID(),
      route_name: newName,
      route_order: routes.length + 1,
    };

    // Deep copy all items with new UUIDs
    const newItems: LineItem[] = sourceItems.map(item => ({
      ...structuredClone(item),
      id: crypto.randomUUID(),
    }));

    // Update state
    mutateGraph(current => ({ routes: [...current.routes, newRoute], routeItems: { ...current.routeItems, [newRoute.id]: newItems } }));

    // Switch to new route
    selectRoute(newRoute.id);
  }, [locked, mutateGraph, selectRoute]);

  // Reorder routes after drag-and-drop (receives new ordered array of route IDs)
  const handleReorderRoutes = useCallback((orderedIds: string[]) => {
    mutateGraph(current => {
      const routeMap = new Map(current.routes.map(r => [r.id, r]));
      if (new Set(orderedIds).size !== current.routes.length || orderedIds.some(id => !routeMap.has(id))) return current;
      const reordered = orderedIds
        .map((id, idx) => {
          const route = routeMap.get(id);
          return route ? { ...route, route_order: idx + 1 } : null;
        })
        .filter((r): r is Route => r !== null);
      return { ...current, routes: reordered };
    });
  }, [mutateGraph]);

  const handleAddItem = useCallback((priceItem: PriceListItem) => {
    if (locked || !activeRouteId) return;

    // Check if it's a special item (งานวางท่อ / งานดันท่อ)
    if (isSpecialItem(priceItem.item_name)) {
      // Show modal to select Main Duct or Riser
      setPendingSpecialItem(priceItem);
      setShowSpecialItemModal(true);
      return;
    }

    // For normal items, check if already exists - merge quantity
    const currentItems = routeItems[activeRouteId] || [];
    const existingItem = currentItems.find(item => item.item_name === priceItem.item_name);

    if (existingItem) {
      // Item already exists - show alert (quantity will be managed in table)
      alert(`รายการ "${priceItem.item_name}" มีอยู่แล้ว กรุณาแก้ไขจำนวนในตาราง`);
      return;
    }

    // Add new item
    const itemOrder = parseInt(priceItem.item_code.split('-')[1]) || currentItems.length + 1;
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      item_order: itemOrder,
      price_list_id: priceItem.id,
      item_name: priceItem.item_name,
      quantity: 0,
      unit: priceItem.unit,
      material_cost_per_unit: Number(priceItem.material_cost),
      labor_cost_per_unit: Number(priceItem.labor_cost),
      unit_cost: Number(priceItem.unit_cost),
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
      remarks: priceItem.remarks,
      category: priceItem.category,
    };
    mutateGraph(current => ({ ...current, routeItems: {
      ...current.routeItems, [activeRouteId]: [...(current.routeItems[activeRouteId] || []), newItem],
    } }));
  }, [activeRouteId, locked, routeItems, mutateGraph, setPendingSpecialItem, setShowSpecialItemModal]);

  // Handle special item selection (Main Duct / Riser / Steel Pole / Riser Service)
  const handleSpecialItemSelect = useCallback((type: 'Main Duct' | 'Riser' | 'Steel Pole' | 'Riser Service') => {
    if (locked || !activeRouteId || !pendingSpecialItem) return;

    const itemNameWithType = `${pendingSpecialItem.item_name} (${type})`;
    const currentItems = routeItems[activeRouteId] || [];

    // Check if this specific type already exists
    const existingItem = currentItems.find(item => item.item_name === itemNameWithType);

    if (existingItem) {
      alert(`รายการ "${itemNameWithType}" มีอยู่แล้ว กรุณาแก้ไขจำนวนในตาราง`);
      setShowSpecialItemModal(false);
      setPendingSpecialItem(null);
      return;
    }

    // Add new item with type suffix
    const itemOrder = parseInt(pendingSpecialItem.item_code.split('-')[1]) || currentItems.length + 1;
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      item_order: itemOrder,
      price_list_id: pendingSpecialItem.id,
      item_name: itemNameWithType,
      quantity: 0,
      unit: pendingSpecialItem.unit,
      material_cost_per_unit: Number(pendingSpecialItem.material_cost),
      labor_cost_per_unit: Number(pendingSpecialItem.labor_cost),
      unit_cost: Number(pendingSpecialItem.unit_cost),
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
      remarks: pendingSpecialItem.remarks,
      category: pendingSpecialItem.category,
    };

    mutateGraph(current => ({ ...current, routeItems: {
      ...current.routeItems, [activeRouteId]: [...(current.routeItems[activeRouteId] || []), newItem],
    } }));

    setShowSpecialItemModal(false);
    setPendingSpecialItem(null);
  }, [activeRouteId, pendingSpecialItem, locked, routeItems, mutateGraph, setPendingSpecialItem, setShowSpecialItemModal]);

  const changeQuantity = useCallback((change: (current: EditorState) => EditorState) => {
    if (readOnly || isSaving || pendingSaveRef.current) return;
    publishEditor(change(editorRef.current));
    setSaveError(null);
  }, [readOnly, isSaving, publishEditor]);

  const handleUpdateRemarks = useCallback((itemId: string, remarks: string) => {
    if (!activeRouteId) return;
    mutateGraph(current => ({ ...current, routeItems: {
      ...current.routeItems,
      [activeRouteId]: (current.routeItems[activeRouteId] || []).map(item =>
        item.id === itemId ? { ...item, remarks } : item
      ),
    } }));
  }, [activeRouteId, mutateGraph]);

  const handleRemoveItem = useCallback((itemId: string) => {
    if (!activeRouteId) return;
    mutateGraph(current => ({ ...current, routeItems: {
      ...current.routeItems,
      [activeRouteId]: (current.routeItems[activeRouteId] || []).filter(item => item.id !== itemId),
    } }));
  }, [activeRouteId, mutateGraph]);

  // Grand totals across all routes
  const grandTotals = routes.reduce(
    (acc, route) => ({
      material: acc.material + route.total_material_cost,
      labor: acc.labor + route.total_labor_cost,
      total: acc.total + route.total_cost,
      itemCount: acc.itemCount + (routeItems[route.id]?.length || 0),
    }),
    { material: 0, labor: 0, total: 0, itemCount: 0 }
  );

  const activeRouteItems = activeRouteId
    ? sortItemsByCategory(routeItems[activeRouteId] || [])
    : [];
  const activeRoute = routes.find(r => r.id === activeRouteId);

  const handleSaveClick = async () => {
    if (readOnly || isSaving || pendingSaveRef.current || !isReady) return;
    const settled = settleQuantityDrafts(editorRef.current);
    if (settled.errors.length) {
      selectRoute(settled.errors[0].routeId);
      setSaveError('ยังมีปริมาณที่ไม่ถูกต้อง กรุณาแก้ไขหรือยกเลิกก่อนบันทึก');
      return;
    }
    if (!settled.state.routes.length) return;
    publishEditor(settled.state);
    setSaveError(null);
    const request: PendingSave = { editor: settled.state, referenceVersionId: factorReferenceVersionId, started: false };
    pendingSaveRef.current = request;
    setIsPreparingSave(true);
    onInteractionStateChange?.({ hasInvalidDrafts: false, busy: true });
    // This is a failure deadline, never an assumption that calculation is ready.
    request.timeout = setTimeout(() => {
      if (pendingSaveRef.current !== request || request.started) return;
      setFactorFailed(true);
      finishPreparation(request,
        'เตรียมบันทึกไม่สำเร็จภายในเวลาที่กำหนด กรุณาลองโหลด Factor F แล้วกดบันทึกอีกครั้ง');
    }, 15000);
    const totalCost = getEditorTotal(settled.state);
    trySave(totalCost === 0 ? {
      boqId, revision: settled.state.revision, totalCost, factorReferenceVersionId,
      status: 'ready', snapshot: ZERO_FACTOR_SNAPSHOT,
    } : factorRef.current);
  };

  if (hasLoadError) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <p className="font-semibold">โหลดรายการ BOQ ไม่สำเร็จ</p>
        <p className="text-sm text-muted-foreground">
          ยังโหลดเส้นทางและรายการไม่ครบ จึงยังบันทึกไม่ได้ เพื่อป้องกันการบันทึกทับข้อมูลที่มีอยู่
        </p>
        <Button variant="outline" onClick={() => setLoadAttempt(attempt => attempt + 1)}>
          ลองโหลดอีกครั้ง
        </Button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div role="status" className="flex items-center justify-center py-12">
        <Loader2 aria-hidden="true" className="w-8 h-8 animate-spin text-blue-500" />
        <span className="sr-only">กำลังโหลดเส้นทางและรายการ BOQ</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Collapsible Sidebar + Detail View */}
      <div className="flex min-h-[600px] rounded-lg border overflow-hidden">
        {/* Left: Collapsible Sidebar */}
        <div
          className={`
            border-r transition-all duration-300 shrink-0
            ${isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'}
          `}
        >
          <RouteSidebar
            routes={routes}
            activeRouteId={activeRouteId}
            onSelectRoute={handleSelectRoute}
            onAddRoute={handleAddRoute}
            onRemoveRoute={handleRemoveRoute}
            onDuplicateRoute={handleDuplicateRoute}
            onReorderRoutes={handleReorderRoutes}
            isCollapsed={isSidebarCollapsed}
            readOnly={locked}
          />
        </div>

        {/* Right: Detail View */}
        <div className="flex-1 flex flex-col h-full">
          {activeRouteId && activeRoute ? (
            <>
              {/* Sticky Header with Toggle Button */}
              <TooltipProvider delayDuration={300}>
                <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur sticky top-0 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8"
                      >
                        {isSidebarCollapsed ? (
                          <PanelLeft className="h-4 w-4" />
                        ) : (
                          <PanelLeftClose className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSidebarCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => activeRouteId && handleDuplicateRoute(activeRouteId)}
                        disabled={locked || Object.keys(editor.drafts[activeRouteId] || {}).length > 0}
                        aria-label="คัดลอกข้อมูลเส้นทางนี้"
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>คัดลอกข้อมูลเส้นทางนี้</p>
                    </TooltipContent>
                  </Tooltip>
                  <Separator orientation="vertical" className="h-5" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    {readOnly ? 'ดูข้อมูล' : 'แก้ไขข้อมูล'}:{' '}
                    <span className="text-primary">
                      เส้นทางที่ {routes.findIndex(r => r.id === activeRouteId) + 1}
                    </span>
                  </h2>
                  <div className="ml-auto text-sm text-muted-foreground">
                    รวม{' '}
                    <span className="font-semibold text-primary">
                      {(activeRoute?.total_cost || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>{' '}
                    บาท
                  </div>
                </div>
              </TooltipProvider>
              {grandTotals.total > 0 && (
                <div className="sticky top-14 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
                  {readOnly && !factorReferenceVersionId ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-sm">
                      BOQ นี้เป็นเอกสารเดิมแบบ snapshot-only จึงไม่คำนวณ Factor F สดบนหน้าแก้ไข
                      หากต้องการใช้ราคาปัจจุบัน ให้สร้าง BOQ ใหม่แบบสะอาด
                    </div>
                  ) : (
                    <FactorFSummary
                      key={factorAttempt}
                      boqId={boqId}
                      revision={editor.revision}
                      routes={routes.map(r => ({
                        id: r.id,
                        route_name: r.route_name,
                        total_material_cost: r.total_material_cost,
                        total_labor_cost: r.total_labor_cost,
                        total_cost: r.total_cost,
                      }))}
                      grandTotalCost={grandTotals.total}
                      factorReferenceVersionId={factorReferenceVersionId}
                      variant="compact"
                      onCalculationStateChange={handleCalculationStateChange}
                    />
                  )}
                </div>
              )}
              {/* Route Header Form */}
              {/* key={activeRouteId} forces React to remount inputs on route switch */}
              <div key={activeRouteId} className="p-4 border-b bg-muted/30 space-y-3">
                {/* Row 1: Route Name + Delete Button */}
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      ชื่อเส้นทาง <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={activeRoute.route_name}
                      onChange={(e) => handleUpdateRoute(activeRouteId, 'route_name', e.target.value)}
                      disabled={locked}
                      placeholder="เช่น ถนนพระราม 4 (แยกคลองเตย-สุขุมวิท)"
                      className="text-lg font-semibold"
                    />
                  </div>
                  {routes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('ต้องการลบเส้นทางนี้?')) {
                          handleRemoveRoute(activeRouteId);
                        }
                      }}
                      disabled={locked}
                      className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="ลบเส้นทาง"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Row 2: Construction Area */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">พื้นที่ก่อสร้าง</Label>
                  <Input
                    value={activeRoute.construction_area}
                    onChange={(e) => handleUpdateRoute(activeRouteId, 'construction_area', e.target.value)}
                    disabled={locked}
                    placeholder="เช่น ชส.คลองเตย จ.กรุงเทพมหานคร"
                  />
                </div>

                {/* Row 3: Route Remarks (Textarea) — repurposed route_description */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">หมายเหตุเส้นทาง (แสดงในหน้าสรุปรวม ปร.4)</Label>
                  <textarea
                    value={activeRoute.route_description}
                    onChange={(e) => handleUpdateRoute(activeRouteId, 'route_description', e.target.value)}
                    disabled={locked}
                    placeholder="หมายเหตุสำหรับเส้นทางนี้ (จะแสดงในหน้าสรุปรวม)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="flex-1 overflow-auto p-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <LineItemsTable
                      items={activeRouteItems}
                      priceListVersionId={priceListVersionId}
                      onAddItem={handleAddItem}
                      quantityDrafts={editor.drafts[activeRouteId] || {}}
                      onQuantityDraftChange={(itemId, text) => changeQuantity(current => setQuantityDraft(current, activeRouteId, itemId, text))}
                      onQuantityCommit={itemId => changeQuantity(current => commitQuantityDraft(current, activeRouteId, itemId))}
                      onQuantityCancel={itemId => changeQuantity(current => cancelQuantityDraft(current, activeRouteId, itemId))}
                      onQuantityStep={(itemId, delta) => changeQuantity(current => stepQuantity(current, activeRouteId, itemId, delta))}
                      onUpdateRemarks={handleUpdateRemarks}
                      onRemoveItem={handleRemoveItem}
                      readOnly={readOnly}
                      disabled={locked}
                    />
                  </div>
                </div>

                {/* Route Subtotal */}
                <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      รวมเส้นทาง &quot;{activeRoute?.route_name}&quot;:
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {(activeRoute?.total_cost || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>เลือกเส้นทางจากด้านซ้ายเพื่อดูรายการ</p>
            </div>
          )}
        </div>
      </div>

      {/* Below ResizablePanel: Grand Totals */}
      {routes.length > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">สรุปรวมทุกเส้นทาง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Routes Summary */}
            <div className="space-y-2">
              {routes.map((route, index) => (
                <div key={route.id} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    {index + 1}. {route.route_name} ({routeItems[route.id]?.length || 0} รายการ)
                  </span>
                  <span className="font-medium">
                    {route.total_cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <TotalsSummary
              totalMaterialCost={grandTotals.material}
              totalLaborCost={grandTotals.labor}
              totalCost={grandTotals.total}
              itemCount={grandTotals.itemCount}
            />
          </CardContent>
        </Card>
      )}

      {/* Save + Print Buttons */}
      {hasInvalidDrafts && (
        <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p>ยังมีปริมาณที่ต้องแก้ไขหรือยกเลิก {draftErrors.length} รายการ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...new Set(draftErrors.map(error => error.routeId))].map(routeId => (
              <Button key={routeId} variant="outline" size="sm" onClick={() => handleSelectRoute(routeId)}>
                ไปที่ {routes.find(route => route.id === routeId)?.route_name}
              </Button>
            ))}
          </div>
        </div>
      )}
      {saveError && <p role="alert" className="mt-4 text-sm text-destructive">{saveError}</p>}
      {factorFailed && !locked && grandTotals.total > 0 && (
        <Button className="mt-3" variant="outline" onClick={() => {
          factorRef.current = null;
          setFactorFailed(false);
          setSaveError(null);
          setFactorAttempt(attempt => attempt + 1);
        }}>ลองโหลด Factor F อีกครั้ง</Button>
      )}
      {isPreparingSave && !isSaving && (
        <div role="status" className="mt-4 flex items-center gap-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          กำลังตรวจยอดรวมและ Factor F ก่อนบันทึก
          <Button variant="outline" size="sm" onClick={() => {
            const request = pendingSaveRef.current;
            if (request && !request.started) finishPreparation(request, 'ยกเลิกการเตรียมบันทึกแล้ว');
          }}>ยกเลิกการเตรียมบันทึก</Button>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (pendingSaveRef.current || getDraftErrors(editorRef.current).length || printDisabled || isSaving) return;
            window.open(`/boq/${boqId}/print`, '_blank');
          }}
          disabled={isSaving || isPreparingSave || hasInvalidDrafts || routes.length === 0 || printDisabled}
          title={hasInvalidDrafts ? 'กรุณาแก้ไขหรือยกเลิกปริมาณที่ไม่ถูกต้องก่อนพิมพ์' : printDisabled ? printDisabledReason : 'พิมพ์ข้อมูลที่บันทึกไว้ล่าสุด'}
          className="cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          พิมพ์ฉบับที่บันทึกแล้ว
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={locked || !isReady || routes.length === 0}
          className="cursor-pointer"
        >
          {isSaving || isPreparingSave ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isSaving ? 'กำลังบันทึก...' : 'กำลังเตรียมบันทึก...'}
            </>
          ) : (
            'บันทึก'
          )}
        </Button>
      </div>

      {/* Modal for Special Items (งานวางท่อ / งานดันท่อ) */}
      <Dialog open={showSpecialItemModal} onOpenChange={setShowSpecialItemModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เลือกประเภทงาน</DialogTitle>
            <DialogDescription>
              {pendingSpecialItem?.item_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button
              onClick={() => handleSpecialItemSelect('Main Duct')}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700"
            >
              <span className="text-2xl mr-3">🔵</span>
              <span className="text-lg font-medium">Main Duct</span>
            </Button>

            <Button
              onClick={() => handleSpecialItemSelect('Riser')}
              className="w-full py-6 bg-green-600 hover:bg-green-700"
            >
              <span className="text-2xl mr-3">🟢</span>
              <span className="text-lg font-medium">Riser</span>
            </Button>

            {/* Show Steel Pole and Riser Service only for single pipe items (1 ท่อ) */}
            {pendingSpecialItem && isSinglePipeItem(pendingSpecialItem.item_name) && (
              <>
                <Button
                  onClick={() => handleSpecialItemSelect('Steel Pole')}
                  className="w-full py-6 bg-orange-600 hover:bg-orange-700"
                >
                  <span className="text-2xl mr-3">🟠</span>
                  <span className="text-lg font-medium">Steel Pole</span>
                </Button>

                <Button
                  onClick={() => handleSpecialItemSelect('Riser Service')}
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700"
                >
                  <span className="text-2xl mr-3">🟣</span>
                  <span className="text-lg font-medium">Riser Service</span>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setShowSpecialItemModal(false);
              setPendingSpecialItem(null);
            }}
            className="w-full mt-2"
          >
            ยกเลิก
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
