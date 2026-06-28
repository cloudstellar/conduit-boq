'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { can, BOQContext } from '@/lib/permissions';
import {
  FactorReferenceVersionData,
  getActiveDefaultFactorReferenceVersion,
  getActiveFactorReferenceVersion,
  listActiveFactorReferenceVersions,
} from '@/lib/factorFReference';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import MultiRouteEditor from '@/components/boq/MultiRouteEditor';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import { Route } from '@/components/boq/RouteManager';
import { LineItem } from '@/components/boq/LineItemsTable';
import { ProjectInfo } from '@/app/boq/create/page';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Copy, Loader2, Printer } from 'lucide-react';

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
  const [priceListVersionId, setPriceListVersionId] = useState<string | null>(null);
  const [factorReferenceVersionId, setFactorReferenceVersionId] = useState<string | null>(null);
  const [factorVersionOptions, setFactorVersionOptions] = useState<FactorReferenceVersionData[]>([]);
  const [selectedFactorCopyVersionId, setSelectedFactorCopyVersionId] = useState<string>('');
  const [factorVersionLoadError, setFactorVersionLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingFactorCopy, setIsCreatingFactorCopy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Factor F snapshot data from MultiRouteEditor
  const [factorData, setFactorData] = useState({
    factor: 0,
    totalWithFactor: 0,
    totalWithVAT: 0,
    factorRaw: 0,
    lowerCost: 0,
    upperCost: 0,
    lowerValue: 0,
    upperValue: 0,
  });

  // Check edit permission
  const canEdit = can(user, 'update', 'boq', boqContext || undefined);
  const canCreateBOQ = can(user, 'create', 'boq');
  const isLegacyFactorSnapshotOnly = !factorReferenceVersionId;
  const isEditorReadOnly = !canEdit || isLegacyFactorSnapshotOnly;

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

        if (!boq.price_list_version_id) {
          throw new Error('ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง');
        }

        setPriceListVersionId(boq.price_list_version_id);
        setFactorReferenceVersionId(boq.factor_reference_version_id ?? null);

        setProjectInfo({
          estimator_name: boq.estimator_name,
          document_date: boq.document_date,
          project_name: boq.project_name,
          department: boq.department || '',
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
        setError(err instanceof Error ? err.message : 'ไม่พบข้อมูล BOQ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBOQ();
  }, [boqId, supabase]);

  useEffect(() => {
    if (isLoading || factorReferenceVersionId) return;

    const fetchFactorVersionOptions = async () => {
      try {
        setFactorVersionLoadError(null);
        const [versions, defaultVersion] = await Promise.all([
          listActiveFactorReferenceVersions(supabase),
          getActiveDefaultFactorReferenceVersion(supabase),
        ]);

        setFactorVersionOptions(versions);
        setSelectedFactorCopyVersionId(defaultVersion.id);
      } catch (err) {
        console.error('Error fetching Factor F versions:', err);
        setFactorVersionOptions([]);
        setSelectedFactorCopyVersionId('');
        setFactorVersionLoadError(
          err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการเวอร์ชัน Factor F ได้',
        );
      }
    };

    fetchFactorVersionOptions();
  }, [factorReferenceVersionId, isLoading, supabase]);

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

      if (
        grandTotals.total > 0 &&
        (factorData.factor <= 0 ||
          factorData.lowerCost <= 0 ||
          factorData.upperCost <= 0 ||
          factorData.lowerValue <= 0 ||
          factorData.upperValue <= 0)
      ) {
        throw new Error('ยังคำนวณ Factor F ไม่สำเร็จ กรุณาตรวจสอบตาราง Factor F แล้วลองบันทึกอีกครั้ง');
      }

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
        // Factor F snapshot
        factor_f: factorData.factor,
        total_with_factor_f: factorData.totalWithFactor,
        total_with_vat: factorData.totalWithVAT,
        factor_f_raw: factorData.factorRaw,
        factor_f_lower_cost: factorData.lowerCost,
        factor_f_upper_cost: factorData.upperCost,
        factor_f_lower_value: factorData.lowerValue,
        factor_f_upper_value: factorData.upperValue,
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
          category: item.category,
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
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFactorCopy = async (targetFactorVersionId?: string) => {
    if (!canCreateBOQ) {
      setError('คุณไม่มีสิทธิ์สร้างใบประมาณราคาใหม่ กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    setIsCreatingFactorCopy(true);
    setError(null);

    try {
      const factorVersion = targetFactorVersionId
        ? await getActiveFactorReferenceVersion(supabase, targetFactorVersionId)
        : await getActiveDefaultFactorReferenceVersion(supabase);

      if (
        !confirm(
          `ต้องการสร้างสำเนาใหม่จากข้อมูลที่บันทึกล่าสุด และผูกกับ Factor F ${factorVersion.version_string} หรือไม่?`,
        )
      ) {
        return;
      }

      const [authResult, currentFactorVersion] = await Promise.all([
        supabase.auth.getUser(),
        Promise.resolve(factorVersion),
      ]);
      const authUser = authResult.data.user;

      if (!authUser) {
        throw new Error('ไม่พบผู้ใช้ที่เข้าสู่ระบบ');
      }

      const { data: originalBOQ, error: boqError } = await supabase
        .from('boq')
        .select('*')
        .eq('id', boqId)
        .single();

      if (boqError) throw boqError;

      if (!originalBOQ.price_list_version_id) {
        throw new Error('ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง');
      }

      const estimatorName = user
        ? `${user.title || ''}${user.first_name} ${user.last_name}`.trim() || user.email?.split('@')[0] || 'ไม่ระบุ'
        : originalBOQ.estimator_name;

      const { data: newBOQ, error: insertError } = await supabase
        .from('boq')
        .insert({
          estimator_name: estimatorName,
          document_date: new Date().toISOString().split('T')[0],
          project_name: `${originalBOQ.project_name} (Factor F ${currentFactorVersion.version_string})`,
          route: originalBOQ.route,
          construction_area: originalBOQ.construction_area,
          department: originalBOQ.department,
          total_material_cost: originalBOQ.total_material_cost,
          total_labor_cost: originalBOQ.total_labor_cost,
          total_cost: originalBOQ.total_cost,
          factor_f: null,
          factor_f_raw: null,
          factor_f_lower_cost: null,
          factor_f_upper_cost: null,
          factor_f_lower_value: null,
          factor_f_upper_value: null,
          total_with_factor_f: 0,
          total_with_vat: 0,
          price_list_version_id: originalBOQ.price_list_version_id,
          factor_reference_version_id: currentFactorVersion.id,
          status: 'draft',
          created_by: authUser.id,
          org_id: user?.org_id || null,
          department_id: user?.department_id || null,
          sector_id: user?.sector_id || null,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      const { data: routes, error: routesError } = await supabase
        .from('boq_routes')
        .select('*')
        .eq('boq_id', boqId)
        .order('route_order');

      if (routesError) throw routesError;

      const routeMapping: Record<string, string> = {};

      for (const route of routes || []) {
        const { data: newRoute, error: routeInsertError } = await supabase
          .from('boq_routes')
          .insert({
            boq_id: newBOQ.id,
            route_order: route.route_order,
            route_name: route.route_name,
            route_description: route.route_description,
            construction_area: route.construction_area,
            total_material_cost: route.total_material_cost,
            total_labor_cost: route.total_labor_cost,
            total_cost: route.total_cost,
            cost_with_factor_f: 0,
          })
          .select('id')
          .single();

        if (routeInsertError) throw routeInsertError;
        routeMapping[route.id] = newRoute.id;
      }

      const { data: items, error: itemsError } = await supabase
        .from('boq_items')
        .select('*')
        .eq('boq_id', boqId)
        .order('item_order');

      if (itemsError) throw itemsError;

      if (items && items.length > 0) {
        const newItems = items.map((item) => ({
          boq_id: newBOQ.id,
          route_id: item.route_id ? routeMapping[item.route_id] ?? null : null,
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
        }));

        const { error: itemsInsertError } = await supabase
          .from('boq_items')
          .insert(newItems);

        if (itemsInsertError) throw itemsInsertError;
      }

      alert(`สร้างสำเนาเรียบร้อยแล้ว ระบบจะเปิด BOQ ใหม่ที่ผูกกับ Factor F ${currentFactorVersion.version_string} กรุณาตรวจสอบแล้วกดบันทึก`);
      router.push(`/boq/${newBOQ.id}/edit`);
    } catch (err) {
      console.error('Error creating current Factor F copy:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างสำเนา Factor F');
    } finally {
      setIsCreatingFactorCopy(false);
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
        <div className="mb-4 flex flex-col justify-end gap-2 sm:flex-row">
          {isLegacyFactorSnapshotOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCreateFactorCopy()}
              disabled={isCreatingFactorCopy || !canCreateBOQ}
              title={canCreateBOQ ? 'สร้างสำเนาใหม่ที่ผูกกับ Factor F ปัจจุบัน' : 'ไม่มีสิทธิ์สร้างใบประมาณราคาใหม่'}
            >
              {isCreatingFactorCopy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              ใช้ Factor F ปัจจุบัน
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/boq/${boqId}/print`)}
          >
            <Printer className="h-4 w-4" />
            พิมพ์
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm md:text-base">
              {error}
            </div>
          )}

          {isLegacyFactorSnapshotOnly && (
            <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>BOQ เก่ายังไม่ได้ผูกกับเวอร์ชัน Factor F</AlertTitle>
              <AlertDescription className="text-amber-900">
                <p>
                  ระบบจะไม่คำนวณด้วยตาราง Factor F ล่าสุดให้ย้อนหลังอัตโนมัติ
                  เพื่อไม่ให้เอกสารเดิมเปลี่ยนความหมาย ถ้าต้องการทำงานต่อ
                  ให้เลือกเวอร์ชัน Factor F ที่ต้องการ แล้วสร้างสำเนาใหม่จากข้อมูลที่บันทึกล่าสุด
                  ก่อนตรวจสอบและกดบันทึกอีกครั้ง
                </p>
                {factorVersionLoadError && (
                  <p className="font-medium text-red-700">{factorVersionLoadError}</p>
                )}
                {canCreateBOQ ? (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={selectedFactorCopyVersionId}
                      onValueChange={setSelectedFactorCopyVersionId}
                      disabled={isCreatingFactorCopy || factorVersionOptions.length === 0}
                    >
                      <SelectTrigger className="w-full bg-white sm:w-[280px]">
                        <SelectValue placeholder="เลือกเวอร์ชัน Factor F" />
                      </SelectTrigger>
                      <SelectContent>
                        {factorVersionOptions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.version_string}
                            {version.loan_interest_percent != null
                              ? ` - ดอกเบี้ย ${Number(version.loan_interest_percent).toFixed(2)}%`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCreateFactorCopy(selectedFactorCopyVersionId)}
                      disabled={isCreatingFactorCopy || !selectedFactorCopyVersionId}
                    >
                      {isCreatingFactorCopy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      สร้างสำเนาเพื่อใช้เวอร์ชันนี้
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium">
                    ผู้ใช้บัญชีนี้ไม่มีสิทธิ์สร้าง BOQ ใหม่ กรุณาติดต่อผู้ดูแลระบบ
                  </p>
                )}
              </AlertDescription>
            </Alert>
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
            disabled={isEditorReadOnly}
          />

          <hr className="my-6 md:my-8" />

          {/* Section 2: Multi-Route Editor */}
          {priceListVersionId && (
            <MultiRouteEditor
              boqId={boqId}
              priceListVersionId={priceListVersionId}
              factorReferenceVersionId={factorReferenceVersionId}
              onSave={handleSave}
              isSaving={isSaving}
              onFactorCalculated={setFactorData}
              readOnly={isEditorReadOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
}
