'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { can } from '@/lib/permissions';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';

export interface ProjectInfo {
  estimator_name: string;
  document_date: string;
  project_name: string;
  department: string;
}

export default function CreateBOQPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isLoading: isUserLoading } = useUser();
  const canCreate = can(user, 'create', 'boq');

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Get current auth user for ownership
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const { data, error: insertError } = await supabase
        .from('boq')
        .insert({
          estimator_name: projectInfo.estimator_name,
          document_date: projectInfo.document_date,
          project_name: projectInfo.project_name,
          department: projectInfo.department || null,
          status: 'draft',
          // Ownership fields (injected from authenticated user)
          created_by: authUser?.id || null,
          org_id: user?.org_id || null,
          department_id: user?.department_id || null,
          sector_id: user?.sector_id || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to edit page with the new BOQ ID
      router.push(`/boq/${data.id}/edit`);
    } catch (err) {
      console.error('Error saving BOQ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm md:text-base"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและดำเนินการต่อ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

