'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';

export interface ProjectInfo {
  estimator_name: string;
  document_date: string;
  project_name: string;
  route: string;
  construction_area: string;
  department: string;
}

export default function CreateBOQPage() {
  const router = useRouter();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    route: '',
    construction_area: '',
    department: 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error: insertError } = await supabase
        .from('boq')
        .insert({
          estimator_name: projectInfo.estimator_name,
          document_date: projectInfo.document_date,
          project_name: projectInfo.project_name,
          route: projectInfo.route || null,
          construction_area: projectInfo.construction_area || null,
          department: projectInfo.department || null,
          status: 'draft',
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            สร้างใบประมาณราคา (BOQ)
          </h1>

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

