'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, PriceListItem } from '@/lib/supabase';
import RouteManager, { Route } from './RouteManager';
import LineItemsTable, { LineItem } from './LineItemsTable';
import TotalsSummary from './TotalsSummary';
import FactorFSummary from './FactorFSummary';

interface MultiRouteEditorProps {
  boqId: string;
  onSave: (routes: Route[], routeItems: Record<string, LineItem[]>) => Promise<void>;
  isSaving: boolean;
}

export interface RouteWithItems extends Route {
  items: LineItem[];
}

// Check if item is special (งานวางท่อ / งานดันท่อ)
const isSpecialItem = (itemName: string): boolean => {
  return itemName.startsWith('งานวางท่อ') || itemName.startsWith('งานดันท่อ');
};

export default function MultiRouteEditor({ boqId, onSave, isSaving }: MultiRouteEditorProps) {
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
  }, [boqId]);

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

  // Handle special item selection (Main Duct / Riser)
  const handleSpecialItemSelect = useCallback((type: 'Main Duct' | 'Riser') => {
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Tabs */}
      <RouteManager
        routes={routes}
        activeRouteId={activeRouteId}
        onAddRoute={handleAddRoute}
        onSelectRoute={handleSelectRoute}
        onUpdateRoute={handleUpdateRoute}
        onRemoveRoute={handleRemoveRoute}
      />

      {/* Active Route Items */}
      {activeRouteId && (
        <div className="bg-white border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700">
              รายการสำหรับ: <span className="text-blue-600">{activeRoute?.route_name}</span>
            </h3>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[800px] px-4 md:px-0">
              <LineItemsTable
                items={activeRouteItems}
                onAddItem={handleAddItem}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          {/* Route Subtotal */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                รวมเส้นทาง "{activeRoute?.route_name}":
              </span>
              <span className="text-lg font-bold text-blue-600">
                {(activeRoute?.total_cost || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grand Totals */}
      {routes.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">สรุปรวมทุกเส้นทาง</h3>

          {/* Routes Summary */}
          <div className="mb-4 space-y-2">
            {routes.map((route, index) => (
              <div key={route.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  {index + 1}. {route.route_name} ({routeItems[route.id]?.length || 0} รายการ)
                </span>
                <span className="font-medium text-gray-800">
                  {route.total_cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            ))}
          </div>

          <TotalsSummary
            totalMaterialCost={grandTotals.material}
            totalLaborCost={grandTotals.labor}
            totalCost={grandTotals.total}
            itemCount={grandTotals.itemCount}
          />
        </div>
      )}

      {/* Factor F Summary */}
      {routes.length > 0 && grandTotals.total > 0 && (
        <FactorFSummary
          routes={routes.map(r => ({
            id: r.id,
            route_name: r.route_name,
            total_material_cost: r.total_material_cost,
            total_labor_cost: r.total_labor_cost,
            total_cost: r.total_cost,
          }))}
          grandTotalCost={grandTotals.total}
        />
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving || routes.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>

      {/* Modal for Special Items (งานวางท่อ / งานดันท่อ) */}
      {showSpecialItemModal && pendingSpecialItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              เลือกประเภทงาน
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {pendingSpecialItem.item_name}
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSpecialItemSelect('Main Duct')}
                className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🔵</span>
                <span className="text-lg font-medium">Main Duct</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpecialItemSelect('Riser')}
                className="w-full py-4 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🟢</span>
                <span className="text-lg font-medium">Riser</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSpecialItemModal(false);
                setPendingSpecialItem(null);
              }}
              className="w-full mt-4 py-2 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
