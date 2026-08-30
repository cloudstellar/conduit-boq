'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { can, BOQContext } from '@/lib/permissions';
import { requireActiveProfile } from '@/lib/auth/authorization';
import {
  duplicateBOQAtomic,
  getDuplicateBOQErrorMessage,
  getDuplicateBOQRecoveryAction,
  type DuplicateBOQRecoveryAction,
} from '@/lib/boq/duplicate';
import { isFactorSnapshotUsable } from '@/lib/factorF';
import type { CatalogVersionSummary } from '@/lib/catalog/defaultVersion';
import { getPriceListVersionSummary } from '@/lib/catalog/defaultVersion';
import {
  FactorReferenceVersionData,
  getActiveDefaultFactorReferenceVersion,
  listActiveFactorReferenceVersions,
} from '@/lib/factorFReference';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import MultiRouteEditor from '@/components/boq/MultiRouteEditor';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import CatalogVersionNotice from '@/components/catalog/CatalogVersionNotice';
import { Route } from '@/components/boq/RouteManager';
import { LineItem } from '@/components/boq/LineItemsTable';
import { ProjectInfo } from '@/app/boq/create/page';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Copy,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
} from 'lucide-react';

interface FactorCopyIntent {
  requestId: string;
  factorVersionId: string;
  factorVersionLabel: string;
  expectedSourceUpdatedAt: string;
  error: string | null;
  recovery: DuplicateBOQRecoveryAction;
}

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
  const [sourceTotalCost, setSourceTotalCost] = useState(0);
  const [sourceUpdatedAt, setSourceUpdatedAt] = useState<string | null>(null);
  const [catalogVersion, setCatalogVersion] = useState<CatalogVersionSummary | null>(null);
  const [factorReferenceVersionId, setFactorReferenceVersionId] = useState<string | null>(null);
  const [factorVersionOptions, setFactorVersionOptions] = useState<FactorReferenceVersionData[]>([]);
  const [selectedFactorCopyVersionId, setSelectedFactorCopyVersionId] = useState<string>('');
  const [factorVersionLoadError, setFactorVersionLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingFactorCopy, setIsCreatingFactorCopy] = useState(false);
  const [factorCopyIntent, setFactorCopyIntent] = useState<FactorCopyIntent | null>(null);
  const [isFactorReviewRequired, setIsFactorReviewRequired] = useState(false);
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
  const canAttemptSelectedFactorCopy = isLegacyFactorSnapshotOnly && sourceTotalCost > 0;
  const isEditorReadOnly = !canEdit || isLegacyFactorSnapshotOnly;

  // Fetch BOQ data
  useEffect(() => {
    const fetchBOQ = async () => {
      try {
        await requireActiveProfile(supabase);
        const { data: boq, error: boqError } = await supabase
          .from('boq')
          .select('*')
          .eq('id', boqId)
          .single();

        if (boqError) throw boqError;

        if (!boq.price_list_version_id) {
          throw new Error('ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชันราคากลาง');
        }

        const boundCatalogVersion = await getPriceListVersionSummary(
          supabase,
          boq.price_list_version_id,
        );

        setPriceListVersionId(boq.price_list_version_id);
        setSourceTotalCost(Number(boq.total_cost));
        setSourceUpdatedAt(boq.updated_at);
        setCatalogVersion(boundCatalogVersion);
        setFactorReferenceVersionId(boq.factor_reference_version_id ?? null);
        setIsFactorReviewRequired(Boolean(
          boq.factor_reference_version_id
          && Number(boq.total_cost) > 0
          && !isFactorSnapshotUsable(Number(boq.total_cost), boq),
        ));

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
      await requireActiveProfile(supabase);
      // Calculate grand totals
      const grandTotals = routes.reduce(
        (acc, route) => ({
          material: acc.material + route.total_material_cost,
          labor: acc.labor + route.total_labor_cost,
          total: acc.total + route.total_cost,
        }),
        { material: 0, labor: 0, total: 0 }
      );

      if (grandTotals.total > 0 && !isFactorSnapshotUsable(grandTotals.total, {
        factor_f: factorData.factor,
        factor_f_lower_cost: factorData.lowerCost,
        factor_f_upper_cost: factorData.upperCost,
        factor_f_lower_value: factorData.lowerValue,
        factor_f_upper_value: factorData.upperValue,
      })) {
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

      setIsFactorReviewRequired(false);
      alert('บันทึกสำเร็จ!');
    } catch (err) {
      console.error('Error saving BOQ:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const openFactorCopyDialog = () => {
    if (!canCreateBOQ) {
      setError('คุณไม่มีสิทธิ์สร้างใบประมาณราคาใหม่ กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    const selectedVersion = factorVersionOptions.find(
      (version) => version.id === selectedFactorCopyVersionId,
    );

    if (!selectedVersion) {
      setFactorVersionLoadError('กรุณาเลือกเวอร์ชัน Factor F ที่ต้องการ');
      return;
    }

    if (!sourceUpdatedAt) {
      setError('ไม่พบเวลาที่แก้ไขล่าสุดของ BOQ กรุณาโหลดหน้านี้ใหม่');
      return;
    }

    setFactorCopyIntent({
      requestId: crypto.randomUUID(),
      factorVersionId: selectedVersion.id,
      factorVersionLabel: selectedVersion.version_string,
      expectedSourceUpdatedAt: sourceUpdatedAt,
      error: null,
      recovery: 'retry',
    });
  };

  const handleFactorCopyDialogOpenChange = (open: boolean) => {
    if (!open && !isCreatingFactorCopy) {
      setFactorCopyIntent(null);
    }
  };

  const handleCreateFactorCopy = async () => {
    if (!factorCopyIntent || isCreatingFactorCopy) return;

    setIsCreatingFactorCopy(true);
    setFactorCopyIntent((current) => current
      ? { ...current, error: null, recovery: 'retry' }
      : current);

    try {
      const result = await duplicateBOQAtomic(supabase, {
        sourceBOQId: boqId,
        requestId: factorCopyIntent.requestId,
        expectedSourceUpdatedAt: factorCopyIntent.expectedSourceUpdatedAt,
        mode: 'select_factor',
        factorReferenceVersionId: factorCopyIntent.factorVersionId,
      });

      router.push(`/boq/${result.boq_id}/edit`);
    } catch (err) {
      console.error('Error creating atomic selected-Factor copy:', err);
      const message = getDuplicateBOQErrorMessage(err, 'select_factor');
      setFactorCopyIntent((current) => current?.requestId === factorCopyIntent.requestId
        ? {
            ...current,
            error: message,
            recovery: getDuplicateBOQRecoveryAction(err, 'select_factor'),
          }
        : current);
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

        {catalogVersion && (
          <CatalogVersionNotice
            versionString={catalogVersion.versionString}
            context="bound-boq"
            className="mb-4"
          />
        )}

        {/* Action buttons */}
        <div className="mb-4 flex flex-col justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/boq/${boqId}/print`)}
            disabled={isFactorReviewRequired}
            title={isFactorReviewRequired
              ? 'กรุณาตรวจสอบและบันทึก Factor F ก่อนพิมพ์หรือส่งออก'
              : undefined}
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

          {isFactorReviewRequired && (
            <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
              <AlertTriangle />
              <AlertTitle>ต้องตรวจสอบและบันทึก Factor F ก่อนใช้งานเอกสาร</AlertTitle>
              <AlertDescription className="text-amber-900">
                <p>
                  BOQ สำเนานี้ผูกกับเวอร์ชัน Factor F แล้ว แต่ผลคำนวณที่บันทึกไว้ยังไม่ครบ
                  กรุณาตรวจสอบข้อมูลและกดบันทึกให้สำเร็จก่อนพิมพ์ PDF หรือส่งออก Excel
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isLegacyFactorSnapshotOnly && (
            <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>BOQ เก่ายังไม่ได้ผูกกับเวอร์ชัน Factor F</AlertTitle>
              <AlertDescription className="text-amber-900">
                <p>
                  ระบบจะไม่คำนวณด้วยตาราง Factor F ล่าสุดให้ย้อนหลังอัตโนมัติ
                  เพื่อไม่ให้เอกสารเดิมเปลี่ยนความหมาย การดูและพิมพ์ BOQ เดิมยังใช้งานได้
                  หากต้องการทำงานต่อ ให้เลือกเวอร์ชัน Factor F แล้วสร้างฉบับร่างใหม่
                  โดยรายการ ปริมาณ และราคาของต้นฉบับจะไม่เปลี่ยน
                </p>
                <p className="font-medium">
                  หากต้องการบัญชีราคาและ Factor F ปัจจุบัน ให้สร้าง BOQ ใหม่แบบสะอาดแทนการคัดลอก
                </p>
                {factorVersionLoadError && (
                  <p className="font-medium text-red-700">{factorVersionLoadError}</p>
                )}
                {canCreateBOQ && canAttemptSelectedFactorCopy ? (
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Select
                        value={selectedFactorCopyVersionId}
                        onValueChange={(value) => {
                          setSelectedFactorCopyVersionId(value);
                          setFactorVersionLoadError(null);
                        }}
                        disabled={isCreatingFactorCopy || factorVersionOptions.length === 0}
                      >
                        <SelectTrigger className="w-full bg-white sm:w-[280px]">
                          <SelectValue placeholder="เลือกเวอร์ชัน Factor F" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {factorVersionOptions.map((version) => (
                              <SelectItem key={version.id} value={version.id}>
                                {version.version_string}
                                {version.loan_interest_percent != null
                                  ? ` - ดอกเบี้ย ${Number(version.loan_interest_percent).toFixed(2)}%`
                                  : ''}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={openFactorCopyDialog}
                        disabled={
                          isCreatingFactorCopy
                          || !selectedFactorCopyVersionId
                          || factorVersionOptions.length === 0
                        }
                      >
                        <Copy data-icon="inline-start" />
                        ตรวจสอบและสร้างสำเนา
                      </Button>
                    </div>
                    <div>
                      <Button asChild type="button" size="sm" variant="outline">
                        <Link href="/boq/create">
                          <Plus data-icon="inline-start" />
                          สร้าง BOQ ใหม่ด้วยราคาปัจจุบัน
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : !canCreateBOQ ? (
                  <p className="font-medium">
                    ผู้ใช้บัญชีนี้ไม่มีสิทธิ์สร้าง BOQ ใหม่ กรุณาติดต่อผู้ดูแลระบบ
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="font-medium">
                      BOQ นี้มียอดรวมเป็นศูนย์ จึงยังไม่สามารถสร้างสำเนาพร้อมเลือก
                      Factor F โดยคงสถานะรอตรวจสอบได้อย่างปลอดภัย
                    </p>
                    <Button asChild type="button" size="sm" variant="outline">
                      <Link href="/boq/create">
                        <Plus data-icon="inline-start" />
                        สร้าง BOQ ใหม่
                      </Link>
                    </Button>
                  </div>
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
              printDisabled={isFactorReviewRequired}
              printDisabledReason="กรุณาตรวจสอบและบันทึก Factor F ก่อนพิมพ์หรือส่งออก"
            />
          )}
        </div>
      </div>

      <Dialog
        open={factorCopyIntent !== null}
        onOpenChange={handleFactorCopyDialogOpenChange}
      >
        <DialogContent showCloseButton={!isCreatingFactorCopy}>
          <DialogHeader>
            <DialogTitle className="pr-8">ยืนยันการสร้างสำเนาและเลือก Factor F</DialogTitle>
            <DialogDescription>
              ระบบจะสร้างฉบับร่างใหม่จาก “{projectInfo.project_name}” และผูกกับ Factor F
              เวอร์ชัน {factorCopyIntent?.factorVersionLabel}
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle />
            <AlertTitle>เปลี่ยนเฉพาะ Factor F ของสำเนา</AlertTitle>
            <AlertDescription>
              <p>
                บัญชีราคา {catalogVersion?.versionString ?? 'ของต้นฉบับ'} รายการ ปริมาณ
                และราคาต่อหน่วยจะคงเดิม ระบบจะล้างผลคำนวณ Factor F ในสำเนา
                เพื่อให้คุณตรวจสอบและบันทึกใหม่
              </p>
              <p>
                ระบบจะตรวจความครบถ้วนของข้อมูลต้นฉบับอีกครั้งก่อนสร้างสำเนา
                หากไม่ผ่านจะให้เริ่ม BOQ ใหม่แทนโดยไม่แก้ข้อมูลเดิมย้อนหลัง
              </p>
              <p>BOQ ต้นฉบับจะไม่ถูกเปลี่ยนแปลง</p>
            </AlertDescription>
          </Alert>

          {factorCopyIntent?.error && (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTriangle />
              <AlertTitle>สร้างสำเนาไม่สำเร็จ</AlertTitle>
              <AlertDescription>
                <p>{factorCopyIntent.error}</p>
                <p>
                  {factorCopyIntent.recovery === 'reload'
                    ? 'ระบบจะไม่คัดลอกจากข้อมูลเก่า กรุณาโหลด BOQ ใหม่ก่อนเริ่มคำขอใหม่'
                    : factorCopyIntent.recovery === 'create_new'
                      ? 'ระบบจะไม่ซ่อมหรือคำนวณข้อมูลเดิมย้อนหลัง กรุณาเริ่มจาก BOQ ใหม่'
                      : factorCopyIntent.recovery === 'dismiss'
                        ? 'ปิดหน้าต่างนี้และตรวจสอบสิทธิ์หรือสถานะบัญชีกับผู้ดูแลระบบ'
                        : 'กด “ลองสร้างสำเนาอีกครั้ง” เพื่อส่งคำขอเดิมอย่างปลอดภัย'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFactorCopyIntent(null)}
              disabled={isCreatingFactorCopy}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={factorCopyIntent?.recovery === 'reload'
                ? () => window.location.reload()
                : factorCopyIntent?.recovery === 'create_new'
                  ? () => router.push('/boq/create')
                  : factorCopyIntent?.recovery === 'dismiss'
                    ? () => setFactorCopyIntent(null)
                    : handleCreateFactorCopy}
              disabled={isCreatingFactorCopy}
            >
              {factorCopyIntent?.recovery === 'reload' ? (
                <RefreshCw data-icon="inline-start" />
              ) : factorCopyIntent?.recovery === 'create_new' ? (
                <Plus data-icon="inline-start" />
              ) : isCreatingFactorCopy ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {factorCopyIntent?.recovery === 'reload'
                ? 'โหลด BOQ ใหม่'
                : factorCopyIntent?.recovery === 'create_new'
                  ? 'สร้าง BOQ ใหม่'
                  : factorCopyIntent?.recovery === 'dismiss'
                    ? 'ปิด'
                : isCreatingFactorCopy
                ? 'กำลังสร้างสำเนา'
                : factorCopyIntent?.error
                  ? 'ลองสร้างสำเนาอีกครั้ง'
                  : 'ยืนยันและเปิดสำเนา'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
