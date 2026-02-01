'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PriceListItem } from '@/lib/supabase';
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
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';

interface MultiRouteEditorProps {
  boqId: string;
  onSave: (routes: Route[], routeItems: Record<string, LineItem[]>) => Promise<void>;
  isSaving: boolean;
  /** Callback to pass calculated factor values up for snapshot saving */
  onFactorCalculated?: (data: {
    factor: number;
    totalWithFactor: number;
    totalWithVAT: number;
  }) => void;
}

export interface RouteWithItems extends Route {
  items: LineItem[];
}

// Check if item is special (งานวางท่อ / งานดันท่อ)
const isSpecialItem = (itemName: string): boolean => {
  return itemName.startsWith('งานวางท่อ') || itemName.startsWith('งานดันท่อ');
};

// Check if item is single pipe (1 ท่อ) - pattern: "งานวางท่อ 1-" or "งานดันท่อ 1-"
const isSinglePipeItem = (itemName: string): boolean => {
  return /^งานวางท่อ\s+1-/.test(itemName) || /^งานดันท่อ.*1-/.test(itemName);
};

export default function MultiRouteEditor({ boqId, onSave, isSaving, onFactorCalculated }: MultiRouteEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeItems, setRouteItems] = useState<Record<string, LineItem[]>>({});
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for special item modal (งานวางท่อ / งานดันท่อ)
  const [pendingSpecialItem, setPendingSpecialItem] = useState<PriceListItem | null>(null);
  const [showSpecialItemModal, setShowSpecialItemModal] = useState(false);

  // Load routes and items
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load routes
        const { data: routesData } = await supabase
          .from('boq_routes')
          .select('*')
          .eq('boq_id', boqId)
          .order('route_order');

        if (routesData && routesData.length > 0) {
          setRoutes(routesData.map(r => ({
            id: r.id,
            route_order: r.route_order,
            route_name: r.route_name,
            route_description: r.route_description || '',
            construction_area: r.construction_area || '',
            total_material_cost: Number(r.total_material_cost),
            total_labor_cost: Number(r.total_labor_cost),
            total_cost: Number(r.total_cost),
          })));
          setActiveRouteId(routesData[0].id);

          // Load items for each route
          const itemsMap: Record<string, LineItem[]> = {};
          for (const route of routesData) {
            const { data: items } = await supabase
              .from('boq_items')
              .select('*')
              .eq('route_id', route.id)
              .order('item_order');
            itemsMap[route.id] = items || [];
          }
          setRouteItems(itemsMap);
        } else {
          // Check for legacy items without route
          const { data: legacyItems } = await supabase
            .from('boq_items')
            .select('*')
            .eq('boq_id', boqId)
            .is('route_id', null)
            .order('item_order');

          if (legacyItems && legacyItems.length > 0) {
            // Create default route for legacy items
            const defaultRoute: Route = {
              id: crypto.randomUUID(),
              route_order: 1,
              route_name: 'เส้นทางหลัก',
              route_description: '',
              construction_area: '',
              total_material_cost: legacyItems.reduce((sum, i) => sum + Number(i.total_material_cost), 0),
              total_labor_cost: legacyItems.reduce((sum, i) => sum + Number(i.total_labor_cost), 0),
              total_cost: legacyItems.reduce((sum, i) => sum + Number(i.total_cost), 0),
            };
            setRoutes([defaultRoute]);
            setRouteItems({ [defaultRoute.id]: legacyItems });
            setActiveRouteId(defaultRoute.id);
          } else {
            // No routes and no legacy items - create first route automatically
            const firstRoute: Route = {
              id: crypto.randomUUID(),
              route_order: 1,
              route_name: 'เส้นทาง 1',
              route_description: '',
              construction_area: '',
              total_material_cost: 0,
              total_labor_cost: 0,
              total_cost: 0,
            };
            setRoutes([firstRoute]);
            setRouteItems({ [firstRoute.id]: [] });
            setActiveRouteId(firstRoute.id);
          }
        }
      } catch (err) {
        console.error('Error loading routes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [boqId, supabase]);

  const handleAddRoute = useCallback(() => {
    const newRoute: Route = {
      id: crypto.randomUUID(),
      route_order: routes.length + 1,
      route_name: `เส้นทาง ${routes.length + 1}`,
      route_description: '',
      construction_area: '',
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
    };
    setRoutes(prev => [...prev, newRoute]);
    setRouteItems(prev => ({ ...prev, [newRoute.id]: [] }));
    setActiveRouteId(newRoute.id);
  }, [routes.length]);

  const handleSelectRoute = useCallback((routeId: string) => {
    setActiveRouteId(routeId);
  }, []);

  const handleUpdateRoute = useCallback((routeId: string, field: keyof Route, value: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, [field]: value } : r));
  }, []);

  const handleRemoveRoute = useCallback((routeId: string) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    setRouteItems(prev => {
      const newItems = { ...prev };
      delete newItems[routeId];
      return newItems;
    });
    if (activeRouteId === routeId) {
      setActiveRouteId(routes.find(r => r.id !== routeId)?.id || null);
    }
  }, [activeRouteId, routes]);

  const handleAddItem = useCallback((priceItem: PriceListItem) => {
    if (!activeRouteId) return;

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
    };
    setRouteItems(prev => ({
      ...prev,
      [activeRouteId]: [...(prev[activeRouteId] || []), newItem],
    }));
  }, [activeRouteId, routeItems]);

  // Handle special item selection (Main Duct / Riser / Steel Pole / Riser Service)
  const handleSpecialItemSelect = useCallback((type: 'Main Duct' | 'Riser' | 'Steel Pole' | 'Riser Service') => {
    if (!activeRouteId || !pendingSpecialItem) return;

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
    };

    setRouteItems(prev => ({
      ...prev,
      [activeRouteId]: [...(prev[activeRouteId] || []), newItem],
    }));

    setShowSpecialItemModal(false);
    setPendingSpecialItem(null);
  }, [activeRouteId, pendingSpecialItem, routeItems]);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    if (!activeRouteId) return;
    setRouteItems(prev => ({
      ...prev,
      [activeRouteId]: (prev[activeRouteId] || []).map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          quantity,
          total_material_cost: quantity * item.material_cost_per_unit,
          total_labor_cost: quantity * item.labor_cost_per_unit,
          total_cost: quantity * item.unit_cost,
        };
      }),
    }));
  }, [activeRouteId]);

  const handleRemoveItem = useCallback((itemId: string) => {
    if (!activeRouteId) return;
    setRouteItems(prev => ({
      ...prev,
      [activeRouteId]: (prev[activeRouteId] || []).filter(item => item.id !== itemId),
    }));
  }, [activeRouteId]);

  // Calculate route totals whenever items change
  useEffect(() => {
    if (!activeRouteId) return;
    const items = routeItems[activeRouteId] || [];
    const totals = items.reduce(
      (acc, item) => ({
        material: acc.material + item.total_material_cost,
        labor: acc.labor + item.total_labor_cost,
        total: acc.total + item.total_cost,
      }),
      { material: 0, labor: 0, total: 0 }
    );

    setRoutes(prev =>
      prev.map(r =>
        r.id === activeRouteId
          ? {
            ...r,
            total_material_cost: totals.material,
            total_labor_cost: totals.labor,
            total_cost: totals.total,
          }
          : r
      )
    );
  }, [activeRouteId, routeItems]);

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

  const activeRouteItems = activeRouteId ? routeItems[activeRouteId] || [] : [];
  const activeRoute = routes.find(r => r.id === activeRouteId);

  const handleSaveClick = async () => {
    await onSave(routes, routeItems);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* SidebarProvider: Collapsible Sidebar + Detail View */}
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-[600px] rounded-lg border overflow-hidden">
          {/* Left: Collapsible Sidebar */}
          <Sidebar collapsible="icon" className="border-r bg-sidebar">
            <RouteSidebar
              routes={routes}
              activeRouteId={activeRouteId}
              onSelectRoute={handleSelectRoute}
              onAddRoute={handleAddRoute}
              onRemoveRoute={handleRemoveRoute}
            />
          </Sidebar>

          {/* Right: Detail View (SidebarInset) */}
          <SidebarInset className="flex-1">
            <div className="flex flex-col h-full">
              {activeRouteId && activeRoute ? (
                <>
                  {/* Sticky Header with SidebarTrigger */}
                  <div className="flex items-center gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur sticky top-0 z-30">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-5" />
                    <h2 className="text-lg font-semibold tracking-tight">
                      แก้ไขข้อมูล: <span className="text-primary">เส้นทางที่ {routes.findIndex(r => r.id === activeRouteId) + 1}</span>
                    </h2>
                    <div className="ml-auto text-sm text-muted-foreground">
                      รวม <span className="font-semibold text-primary">{(activeRoute?.total_cost || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span> บาท
                    </div>
                  </div>

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
                        placeholder="เช่น ชส.คลองเตย จ.กรุงเทพมหานคร"
                      />
                    </div>

                    {/* Row 3: Description (Textarea) */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">คำอธิบาย</Label>
                      <textarea
                        value={activeRoute.route_description}
                        onChange={(e) => handleUpdateRoute(activeRouteId, 'route_description', e.target.value)}
                        placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับเส้นทางนี้"
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
                          onAddItem={handleAddItem}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemoveItem={handleRemoveItem}
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
          </SidebarInset>
        </div>
      </SidebarProvider>

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

      {/* Factor F Summary */}
      {routes.length > 0 && grandTotals.total > 0 && (
        <div className="mt-6">
          <FactorFSummary
            routes={routes.map(r => ({
              id: r.id,
              route_name: r.route_name,
              total_material_cost: r.total_material_cost,
              total_labor_cost: r.total_labor_cost,
              total_cost: r.total_cost,
            }))}
            grandTotalCost={grandTotals.total}
            onFactorCalculated={onFactorCalculated}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSaveClick}
          disabled={isSaving || routes.length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
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
