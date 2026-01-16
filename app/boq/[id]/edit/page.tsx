'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { can, BOQContext } from '@/lib/permissions';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import MultiRouteEditor from '@/components/boq/MultiRouteEditor';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import { Route } from '@/components/boq/RouteManager';
import { LineItem } from '@/components/boq/LineItemsTable';
import { ProjectInfo } from '@/app/boq/create/page';

export default function EditBOQPage() {
  const params = useParams();
  const router = useRouter();
  const boqId = params.id as string;
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    department: '',
  });
  const [boqContext, setBOQContext] = useState<BOQContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check edit permission
  const canEdit = can(user, 'update', 'boq', boqContext || undefined);

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
          department: boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)',
        });

        // Set BOQ context for permission checks
        setBOQContext({
          created_by: boq.created_by,
          assigned_to: boq.assigned_to,
          sector_id: boq.sector_id,
          department_id: boq.department_id,
          status: boq.status,
        });
      } catch (err) {
        console.error('Error fetching BOQ:', err);
        setError('ไม่พบข้อมูล BOQ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBOQ();
  }, [boqId, supabase]);

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

      // Prepare data for RPC call (atomic transaction)
      const boqData = {
        estimator_name: projectInfo.estimator_name,
        document_date: projectInfo.document_date,
        project_name: projectInfo.project_name,
        route: routes.map(r => r.route_name).join(', '),
        construction_area: routes.map(r => r.construction_area).filter(Boolean).join(', ') || null,
        department: projectInfo.department || null,
        total_material_cost: grandTotals.material,
        total_labor_cost: grandTotals.labor,
        total_cost: grandTotals.total,
      };

      const routesData = routes.map((route) => ({
        route_name: route.route_name,
        route_description: route.route_description || null,
        construction_area: route.construction_area || null,
        total_material_cost: route.total_material_cost,
        total_labor_cost: route.total_labor_cost,
        total_cost: route.total_cost,
        items: (routeItems[route.id] || []).map((item) => ({
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
        })),
      }));

      // Use RPC function for atomic transaction - if any step fails, everything rolls back
      const { error: rpcError } = await supabase.rpc('save_boq_with_routes', {
        p_boq_id: boqId,
        p_boq_data: boqData,
        p_routes: routesData,
      });

      if (rpcError) throw rpcError;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BOQPageHeader
        title="แก้ไขใบประมาณราคา (BOQ)"
        subtitle={projectInfo.project_name || 'กำลังโหลด...'}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Access Banner */}
        <div className="mb-4">
          <BOQAccessBanner mode="edit" boq={boqContext} />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => router.push(`/boq/${boqId}/print`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            พิมพ์
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Read-only warning if no edit permission */}
          {!canEdit && boqContext && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">โหมดดูอย่างเดียว</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                คุณไม่มีสิทธิ์แก้ไข BOQ นี้ การเปลี่ยนแปลงจะไม่ถูกบันทึก
              </p>
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

