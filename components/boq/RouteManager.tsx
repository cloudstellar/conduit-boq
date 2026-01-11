'use client';

import { useState } from 'react';

export interface Route {
  id: string;
  route_order: number;
  route_name: string;
  route_description: string;
  construction_area: string;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
}

interface RouteManagerProps {
  routes: Route[];
  activeRouteId: string | null;
  onAddRoute: () => void;
  onSelectRoute: (routeId: string) => void;
  onUpdateRoute: (routeId: string, field: keyof Route, value: string) => void;
  onRemoveRoute: (routeId: string) => void;
}

export default function RouteManager({
  routes,
  activeRouteId,
  onAddRoute,
  onSelectRoute,
  onUpdateRoute,
  onRemoveRoute,
}: RouteManagerProps) {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">เส้นทาง</h2>
        <button
          type="button"
          onClick={onAddRoute}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มเส้นทาง
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">ยังไม่มีเส้นทาง</p>
          <button
            type="button"
            onClick={onAddRoute}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            เพิ่มเส้นทางแรก
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            {routes.map((route, index) => (
              <div
                key={route.id}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-colors ${
                  activeRouteId === route.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => onSelectRoute(route.id)}
              >
                {editingRouteId === route.id ? (
                  <input
                    type="text"
                    value={route.route_name}
                    onChange={(e) => onUpdateRoute(route.id, 'route_name', e.target.value)}
                    onBlur={() => setEditingRouteId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingRouteId(null)}
                    autoFocus
                    className="px-2 py-0.5 text-sm border rounded text-gray-800 w-32"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="text-sm font-medium">
                      {route.route_name || `เส้นทาง ${index + 1}`}
                    </span>
                    <span className={`text-xs ${activeRouteId === route.id ? 'text-blue-200' : 'text-gray-500'}`}>
                      ({formatNumber(route.total_cost)} บาท)
                    </span>
                  </>
                )}

                {/* Edit/Delete buttons */}
                <div className={`flex items-center gap-1 ml-2 ${activeRouteId === route.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRouteId(route.id);
                    }}
                    className={`p-1 rounded hover:bg-opacity-20 hover:bg-black ${activeRouteId === route.id ? 'text-white' : 'text-gray-500'}`}
                    title="แก้ไขชื่อ"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  {routes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('ต้องการลบเส้นทางนี้?')) {
                          onRemoveRoute(route.id);
                        }
                      }}
                      className={`p-1 rounded hover:bg-opacity-20 hover:bg-red-500 ${activeRouteId === route.id ? 'text-red-200 hover:text-red-100' : 'text-red-500'}`}
                      title="ลบเส้นทาง"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Route Details Form - shown for active route */}
          {activeRouteId && routes.find(r => r.id === activeRouteId) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">รายละเอียดเส้นทาง</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อเส้นทาง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={routes.find(r => r.id === activeRouteId)?.route_name || ''}
                    onChange={(e) => onUpdateRoute(activeRouteId, 'route_name', e.target.value)}
                    placeholder="เช่น ถนนพระราม 4 (แยกคลองเตย-สุขุมวิท)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    พื้นที่ก่อสร้าง
                  </label>
                  <input
                    type="text"
                    value={routes.find(r => r.id === activeRouteId)?.construction_area || ''}
                    onChange={(e) => onUpdateRoute(activeRouteId, 'construction_area', e.target.value)}
                    placeholder="เช่น ชส.คลองเตย จ.กรุงเทพมหานคร"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={routes.find(r => r.id === activeRouteId)?.route_description || ''}
                    onChange={(e) => onUpdateRoute(activeRouteId, 'route_description', e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับเส้นทางนี้"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

