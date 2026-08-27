'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { CatalogVersionSummary } from '@/lib/catalog/defaultVersion';
import {
  DEFAULT_CATALOG_UNAVAILABLE_MESSAGE,
  getActiveDefaultPriceListVersion,
} from '@/lib/catalog/defaultVersion';
import { getActiveDefaultFactorReferenceVersion } from '@/lib/factorFReference';
import { useAuth } from '@/lib/context/AuthContext';
import { can } from '@/lib/permissions';
import { requireActiveProfile } from '@/lib/auth/authorization';
import CatalogVersionNotice from '@/components/catalog/CatalogVersionNotice';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import { Button } from '@/components/ui/button';

export interface ProjectInfo {
  estimator_name: string;
  document_date: string;
  project_name: string;
  department: string;
}

export default function CreateBOQPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user, isLoading: isUserLoading } = useAuth();
  const canCreate = can(user, 'create', 'boq');

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogVersion, setCatalogVersion] = useState<CatalogVersionSummary | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const loadCatalogVersion = useCallback(async () => {
    setIsCatalogLoading(true);
    setCatalogError(null);

    try {
      await requireActiveProfile(supabase);
      setCatalogVersion(await getActiveDefaultPriceListVersion(supabase));
    } catch (err) {
      setCatalogVersion(null);
      setCatalogError(
        err instanceof Error ? err.message : DEFAULT_CATALOG_UNAVAILABLE_MESSAGE,
      );
    } finally {
      setIsCatalogLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadCatalogVersion();
  }, [loadCatalogVersion]);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      const fullName = [user.title, user.first_name, user.last_name]
        .filter(Boolean)
        .join(' ');

      const deptDisplay = [
        user.sector?.full_name || user.sector?.name,
        user.department?.full_name || user.department?.name,
      ]
        .filter(Boolean)
        .join(' ');

      setProjectInfo(prev => ({
        ...prev,
        estimator_name: fullName || prev.estimator_name,
        department: deptDisplay || prev.department,
      }));
    }
  }, [user]);

  const handleProjectInfoChange = (field: keyof ProjectInfo, value: string) => {
    setProjectInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    if (!projectInfo.estimator_name || !projectInfo.project_name) {
      setError('กรุณากรอกชื่อผู้ประมาณราคาและชื่อโครงการ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!catalogVersion) {
        throw new Error(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE);
      }

      const [authorization, latestCatalogVersion, factorReferenceVersion] = await Promise.all([
        requireActiveProfile(supabase),
        getActiveDefaultPriceListVersion(supabase),
        getActiveDefaultFactorReferenceVersion(supabase),
      ]);

      if (latestCatalogVersion.id !== catalogVersion.id) {
        setCatalogVersion(latestCatalogVersion);
        throw new Error(
          `ฉบับบัญชีราคาปัจจุบันเปลี่ยนเป็น ${latestCatalogVersion.versionString} แล้ว กรุณาตรวจสอบฉบับที่แสดงและกดบันทึกอีกครั้ง`,
        );
      }

      const { data, error: insertError } = await supabase
        .from('boq')
        .insert({
          estimator_name: projectInfo.estimator_name,
          document_date: projectInfo.document_date,
          project_name: projectInfo.project_name,
          department: projectInfo.department || null,
          status: 'draft',
          price_list_version_id: latestCatalogVersion.id,
          factor_reference_version_id: factorReferenceVersion.id,
          // Ownership fields (injected from authenticated user)
          created_by: authorization.user.id,
          org_id: authorization.profile.org_id,
          department_id: authorization.profile.department_id,
          sector_id: authorization.profile.sector_id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to edit page with the new BOQ ID
      router.push(`/boq/${data.id}/edit`);
    } catch (err) {
      console.error('Error saving BOQ:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while fetching user profile
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check permission
  if (!canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์สร้างใบประมาณราคา</p>
          <Link href="/boq" className="text-blue-600 hover:underline">กลับหน้ารายการ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BOQPageHeader
        title="สร้างใบประมาณราคา (BOQ)"
        subtitle="กรอกข้อมูลโครงการเพื่อเริ่มต้น"
      />

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {/* Access Banner */}
        <div className="mb-4">
          <BOQAccessBanner mode="create" />
        </div>

        {catalogVersion && (
          <CatalogVersionNotice
            versionString={catalogVersion.versionString}
            context="new-boq"
            className="mb-4"
          />
        )}

        {catalogError && (
          <div className="mb-4 flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{catalogError}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={loadCatalogVersion}
              disabled={isCatalogLoading}
              className="shrink-0 border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              {isCatalogLoading ? 'กำลังโหลด...' : 'ลองโหลดฉบับอีกครั้ง'}
            </Button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm md:text-base">
              {error}
            </div>
          )}

          <ProjectInfoForm
            projectInfo={projectInfo}
            onChange={handleProjectInfoChange}
          />

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isCatalogLoading || !catalogVersion}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? 'กำลังบันทึก...'
                : isCatalogLoading
                  ? 'กำลังตรวจฉบับบัญชีราคา...'
                  : 'บันทึกและดำเนินการต่อ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
