'use client';

import { ProjectInfo } from '@/app/boq/create/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">ข้อมูลโครงการ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estimator Name */}
          <div className="space-y-2">
            <Label htmlFor="estimator_name">
              ชื่อผู้ประมาณราคา <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="estimator_name"
              value={projectInfo.estimator_name}
              onChange={(e) => onChange('estimator_name', e.target.value)}
              disabled={disabled}
              placeholder="กรอกชื่อผู้ประมาณราคา"
            />
          </div>

          {/* Document Date */}
          <div className="space-y-2">
            <Label htmlFor="document_date">
              วันที่ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              id="document_date"
              value={projectInfo.document_date}
              onChange={(e) => onChange('document_date', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Project Name */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="project_name">
              ชื่อโครงการ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="project_name"
              value={projectInfo.project_name}
              onChange={(e) => onChange('project_name', e.target.value)}
              disabled={disabled}
              placeholder="กรอกชื่อโครงการ"
            />
          </div>

          {/* Department */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="department">ส่วนงาน</Label>
            <Input
              type="text"
              id="department"
              value={projectInfo.department}
              onChange={(e) => onChange('department', e.target.value)}
              disabled={disabled}
              placeholder="เช่น วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
