import type { SupabaseClient } from '@supabase/supabase-js';
import type { LineItem } from '@/components/boq/LineItemsTable';
import type { Route } from '@/components/boq/RouteManager';

export interface BOQEditorData {
  routes: Route[];
  routeItems: Record<string, LineItem[]>;
  activeRouteId: string;
}

function requireCompleteRows<T>(
  result: { data: unknown; error: unknown; count: number | null },
  label: string,
): T[] {
  if (result.error) throw result.error;

  // An empty array is valid; missing data or an API row limit is not.
  if (
    !Array.isArray(result.data)
    || !Number.isInteger(result.count)
    || result.count !== result.data.length
  ) {
    throw new Error(`โหลดข้อมูล${label}ไม่ครบ กรุณาลองโหลดข้อมูลอีกครั้ง`);
  }

  return result.data as T[];
}

export async function loadBOQEditorData(
  supabase: SupabaseClient,
  boqId: string,
): Promise<BOQEditorData> {
  const routesResult = await supabase
    .from('boq_routes')
    .select('*', { count: 'exact' })
    .eq('boq_id', boqId)
    .order('route_order');
  const routesData = requireCompleteRows<Route>(routesResult, 'เส้นทาง');

  if (routesData.length > 0) {
    const routes = routesData.map(route => ({
      id: route.id,
      route_order: route.route_order,
      route_name: route.route_name,
      route_description: route.route_description || '',
      construction_area: route.construction_area || '',
      total_material_cost: Number(route.total_material_cost),
      total_labor_cost: Number(route.total_labor_cost),
      total_cost: Number(route.total_cost),
    }));
    const itemEntries = await Promise.all(routes.map(async route => {
      const itemsResult = await supabase
        .from('boq_items')
        .select('*', { count: 'exact' })
        .eq('route_id', route.id)
        .order('item_order');

      return [
        route.id,
        requireCompleteRows<LineItem>(itemsResult, 'รายการของเส้นทาง'),
      ] as const;
    }));

    return {
      routes,
      routeItems: Object.fromEntries(itemEntries),
      activeRouteId: routes[0].id,
    };
  }

  const legacyResult = await supabase
    .from('boq_items')
    .select('*', { count: 'exact' })
    .eq('boq_id', boqId)
    .is('route_id', null)
    .order('item_order');
  const legacyItems = requireCompleteRows<LineItem>(legacyResult, 'รายการเดิม');
  const initialRoute: Route = {
    id: crypto.randomUUID(),
    route_order: 1,
    route_name: legacyItems.length > 0 ? 'เส้นทางหลัก' : 'เส้นทาง 1',
    route_description: '',
    construction_area: '',
    total_material_cost: legacyItems.reduce((sum, item) => sum + Number(item.total_material_cost), 0),
    total_labor_cost: legacyItems.reduce((sum, item) => sum + Number(item.total_labor_cost), 0),
    total_cost: legacyItems.reduce((sum, item) => sum + Number(item.total_cost), 0),
  };

  return {
    routes: [initialRoute],
    routeItems: { [initialRoute.id]: legacyItems },
    activeRouteId: initialRoute.id,
  };
}

export function buildBOQRoutesPayload(
  routes: Route[],
  routeItems: Record<string, LineItem[]>,
) {
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error('ยังไม่มีข้อมูลเส้นทางที่พร้อมบันทึก กรุณาลองโหลดข้อมูลอีกครั้ง');
  }

  for (const route of routes) {
    if (
      routeItems == null
      || !Object.prototype.hasOwnProperty.call(routeItems, route.id)
      || !Array.isArray(routeItems[route.id])
    ) {
      throw new Error('ข้อมูลรายการของเส้นทางไม่ครบ ไม่สามารถบันทึกได้ กรุณาลองโหลดข้อมูลอีกครั้ง');
    }
  }

  return routes.map(route => ({
    route_name: route.route_name,
    route_description: route.route_description || null,
    construction_area: route.construction_area || null,
    total_material_cost: route.total_material_cost,
    total_labor_cost: route.total_labor_cost,
    total_cost: route.total_cost,
    items: routeItems[route.id].map(item => ({
      item_order: item.item_order,
      price_list_id: item.price_list_id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      material_cost_per_unit: item.material_cost_per_unit,
      labor_cost_per_unit: item.labor_cost_per_unit,
      unit_cost: item.unit_cost,
      total_material_cost: item.total_material_cost,
      total_labor_cost: item.total_labor_cost,
      total_cost: item.total_cost,
      remarks: item.remarks,
      category: item.category,
    })),
  }));
}
