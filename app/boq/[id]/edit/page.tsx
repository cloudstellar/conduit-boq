'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import MultiRouteEditor from '@/components/boq/MultiRouteEditor';
import { Route } from '@/components/boq/RouteManager';
import { LineItem } from '@/components/boq/LineItemsTable';
import { ProjectInfo } from '@/app/boq/create/page';

export default function EditBOQPage() {
  const params = useParams();
  const router = useRouter();
  const boqId = params.id as string;

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    route: '',
    construction_area: '',
    department: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch BOQ data
  useEffect(() => {
    const fetchBOQ = async () => {
      try {
        const { data: boq, error: boqError } = await supabase
          .from('boq')
          .select('*')
          .eq('id', boqId)
          .single();

        if (boqError) throw boqError;

        setProjectInfo({
          estimator_name: boq.estimator_name,
          document_date: boq.document_date,
          project_name: boq.project_name,
          route: boq.route || '',
          construction_area: boq.construction_area || '',
          department: boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)',
        });
      } catch (err) {
        console.error('Error fetching BOQ:', err);
        setError('ไม่พบข้อมูล BOQ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBOQ();
  }, [boqId]);

  const handleProjectInfoChange = (field: keyof ProjectInfo, value: string) => {
    setProjectInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (routes: Route[], routeItems: Record<string, LineItem[]>) => {
    setIsSaving(true);
    setError(null);

    try {
      // Calculate grand totals
      const grandTotals = routes.reduce(
        (acc, route) => ({
          material: acc.material + route.total_material_cost,
          labor: acc.labor + route.total_labor_cost,
          total: acc.total + route.total_cost,
        }),
        { material: 0, labor: 0, total: 0 }
      );

      // Update BOQ header
      const { error: boqError } = await supabase
        .from('boq')
        .update({
          estimator_name: projectInfo.estimator_name,
          document_date: projectInfo.document_date,
          project_name: projectInfo.project_name,
          route: routes.map(r => r.route_name).join(', '),
          construction_area: projectInfo.construction_area || null,
          department: projectInfo.department || null,
          total_material_cost: grandTotals.material,
          total_labor_cost: grandTotals.labor,
          total_cost: grandTotals.total,
        })
        .eq('id', boqId);

      if (boqError) throw boqError;

      // Delete existing routes and items
      await supabase.from('boq_routes').delete().eq('boq_id', boqId);

      // Insert routes
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const { data: insertedRoute, error: routeError } = await supabase
          .from('boq_routes')
          .insert({
            boq_id: boqId,
            route_order: i + 1,
            route_name: route.route_name,
            route_description: route.route_description || null,
            construction_area: route.construction_area || null,
            total_material_cost: route.total_material_cost,
            total_labor_cost: route.total_labor_cost,
            total_cost: route.total_cost,
          })
          .select()
          .single();

        if (routeError) throw routeError;

        // Insert items for this route
        const items = routeItems[route.id] || [];
        if (items.length > 0) {
          const itemsToInsert = items.map((item) => ({
            boq_id: boqId,
            route_id: insertedRoute.id,
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
          }));

          const { error: insertError } = await supabase.from('boq_items').insert(itemsToInsert);
          if (insertError) throw insertError;
        }
      }

      // Delete old items without route_id (legacy cleanup)
      await supabase.from('boq_items').delete().eq('boq_id', boqId).is('route_id', null);

      alert('บันทึกสำเร็จ!');
    } catch (err) {
      console.error('Error saving BOQ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !projectInfo.project_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              แก้ไขใบประมาณราคา (BOQ) - หลายเส้นทาง
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm md:text-base"
              >
                กลับหน้าหลัก
              </button>
              <button
                onClick={() => router.push(`/boq/${boqId}/print`)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                พิมพ์
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Section 1: Project Info */}
          <ProjectInfoForm
            projectInfo={projectInfo}
            onChange={handleProjectInfoChange}
          />

          <hr className="my-6 md:my-8" />

          {/* Section 2: Multi-Route Editor */}
          <MultiRouteEditor
            boqId={boqId}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

