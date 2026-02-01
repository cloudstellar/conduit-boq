'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, X } from 'lucide-react';

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
        <Button onClick={onAddRoute} size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" />
          เพิ่มเส้นทาง
        </Button>
      </div>

      {routes.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-3">ยังไม่มีเส้นทาง</p>
            <Button onClick={onAddRoute}>
              เพิ่มเส้นทางแรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeRouteId || undefined} onValueChange={onSelectRoute}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 border border-border rounded-lg p-1">
              {routes.map((route, index) => (
                <TabsTrigger
                  key={route.id}
                  value={route.id}
                  className="relative group flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {editingRouteId === route.id ? (
                    <Input
                      type="text"
                      value={route.route_name}
                      onChange={(e) => onUpdateRoute(route.id, 'route_name', e.target.value)}
                      onBlur={() => setEditingRouteId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingRouteId(null)}
                      autoFocus
                      className="h-6 w-32 text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="text-sm font-medium">
                        {route.route_name || `เส้นทาง ${index + 1}`}
                      </span>
                      <span className="text-xs opacity-70">
                        ({formatNumber(route.total_cost)} บาท)
                      </span>
                    </>
                  )}

                  {/* Edit/Delete buttons */}
                  <div className={`flex items-center gap-1 ml-1 ${activeRouteId === route.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRouteId(route.id);
                      }}
                      className="p-0.5 rounded hover:bg-black/10"
                      title="แก้ไขชื่อ"
                    >
                      <Pencil className="w-3 h-3" />
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
                        className="p-0.5 rounded hover:bg-red-500/20 text-red-500"
                        title="ลบเส้นทาง"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Route Details Form - shown for active route */}
          {activeRouteId && routes.find(r => r.id === activeRouteId) && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">รายละเอียดเส้นทาง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      ชื่อเส้นทาง <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={routes.find(r => r.id === activeRouteId)?.route_name || ''}
                      onChange={(e) => onUpdateRoute(activeRouteId, 'route_name', e.target.value)}
                      placeholder="เช่น ถนนพระราม 4 (แยกคลองเตย-สุขุมวิท)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>พื้นที่ก่อสร้าง</Label>
                    <Input
                      type="text"
                      value={routes.find(r => r.id === activeRouteId)?.construction_area || ''}
                      onChange={(e) => onUpdateRoute(activeRouteId, 'construction_area', e.target.value)}
                      placeholder="เช่น ชส.คลองเตย จ.กรุงเทพมหานคร"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>คำอธิบาย</Label>
                    <textarea
                      value={routes.find(r => r.id === activeRouteId)?.route_description || ''}
                      onChange={(e) => onUpdateRoute(activeRouteId, 'route_description', e.target.value)}
                      placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับเส้นทางนี้"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
