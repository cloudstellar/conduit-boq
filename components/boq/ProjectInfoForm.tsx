'use client';

import { ProjectInfo } from '@/app/boq/create/page';

interface ProjectInfoFormProps {
  projectInfo: ProjectInfo;
  onChange: (field: keyof ProjectInfo, value: string) => void;
  disabled?: boolean;
}

export default function ProjectInfoForm({
  projectInfo,
  onChange,
  disabled = false,
}: ProjectInfoFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
        ข้อมูลโครงการ
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estimator Name */}
        <div>
          <label
            htmlFor="estimator_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ชื่อผู้ประมาณราคา <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="estimator_name"
            value={projectInfo.estimator_name}
            onChange={(e) => onChange('estimator_name', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="กรอกชื่อผู้ประมาณราคา"
          />
        </div>

        {/* Document Date */}
        <div>
          <label
            htmlFor="document_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            วันที่ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="document_date"
            value={projectInfo.document_date}
            onChange={(e) => onChange('document_date', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Project Name */}
        <div className="md:col-span-2">
          <label
            htmlFor="project_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ชื่อโครงการ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="project_name"
            value={projectInfo.project_name}
            onChange={(e) => onChange('project_name', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="กรอกชื่อโครงการ"
          />
        </div>

        {/* Department */}
        <div className="md:col-span-2">
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ส่วนงาน
          </label>
          <input
            type="text"
            id="department"
            value={projectInfo.department}
            onChange={(e) => onChange('department', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="เช่น วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)"
          />
        </div>
      </div>
    </div>
  );
}

