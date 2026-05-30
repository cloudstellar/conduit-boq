'use client';

import Link from 'next/link';
import { UserProfileWithOrg } from '@/lib/types/auth';
import { getRoleLabel } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface DashboardHeaderProps {
  user: UserProfileWithOrg | null;
}

function getThaiGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'สวัสดีตอนเช้า';
  if (hour >= 12 && hour < 17) return 'สวัสดีตอนบ่าย';
  if (hour >= 17 && hour < 22) return 'สวัสดีตอนเย็น';
  return 'สวัสดีตอนค่ำ';
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  if (!user) return null;

  const isPending = user.status === 'pending';
  // Check if onboarding is not completed using the database boolean indicator (P1 Bug Fix)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const needsOnboarding = isPending && !(user as any).onboarding_completed;
  const greeting = getThaiGreeting();
  const fullName = `${user.title || ''}${user.first_name} ${user.last_name}`.trim();
  const roleLabel = getRoleLabel(user.role);

  // Determine badge colors based on role
  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-50 text-red-700 border-red-200/50',
    dept_manager: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    sector_manager: 'bg-blue-50 text-blue-700 border-blue-200/50',
    staff: 'bg-slate-50 text-slate-700 border-slate-200/50',
    procurement: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Profile summary banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-nt-blue/5 text-nt-blue rounded-full flex items-center justify-center border border-nt-blue/10">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                {greeting}, {fullName || user.email?.split('@')[0]}
              </h2>
              <Badge variant="outline" className={`${roleBadgeColors[user.role] || 'bg-slate-50 text-slate-700'} font-medium`}>
                {roleLabel}
              </Badge>
              {user.status === 'active' && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  เปิดใช้งานแล้ว
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              {user.position && <span>{user.position}</span>}
              {user.position && (user.department?.name || user.sector?.name) && <span className="text-slate-300">•</span>}
              {user.department?.name && (
                <span className="font-medium text-slate-600">
                  {user.department.name} ({user.department.code})
                </span>
              )}
              {user.sector?.name && <span className="text-slate-300">/</span>}
              {user.sector?.name && (
                <span className="text-slate-600">
                  {user.sector.name}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Card for Onboarding (Missing profile selection) */}
      {needsOnboarding && (
        <Card className="border-nt-orange/20 bg-amber-50/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-nt-orange/10 text-nt-orange rounded-full flex items-center justify-center border border-nt-orange/20">
                <Edit className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-semibold text-slate-950">
                  ยินดีต้อนรับ! กรุณากรอกข้อมูลส่วนตัวและเลือกสังกัด
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  เพื่อเริ่มใช้งานระบบประมาณราคาการก่อสร้างท่อร้อยสายสื่อสารใต้ดินอย่างสมบูรณ์ กรุณากรอกข้อมูลส่วนตัว สังกัดหน่วยงาน และอัปโหลดลายเซ็นดิจิทัลของคุณ ผู้ดูแลระบบจะดำเนินการตรวจสอบสิทธิ์หลังการบันทึก
                </p>
              </div>
              <div className="flex-shrink-0 mt-2 md:mt-0">
                <Link href="/profile">
                  <Button className="bg-nt-orange hover:bg-nt-orange/90 text-white font-medium shadow-sm transition-colors">
                    <Edit className="w-4 h-4 mr-2" />
                    กรอกข้อมูลโปรไฟล์
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Account Status Alert */}
      {isPending && !needsOnboarding && (
        <Alert className="border-amber-200 bg-amber-50/20 py-4">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <AlertDescription className="ml-2 text-slate-700 leading-relaxed">
            <span className="font-semibold text-amber-800">บัญชีของคุณกำลังรอการตรวจสอบและอนุมัติสิทธิ์จากผู้ดูแลระบบ</span>
            <span className="block sm:inline sm:ml-1 text-slate-600">
              — ระหว่างรออนุมัติ คุณสามารถเริ่มร่างเอกสารประมาณราคา (BOQ) และทดลองใช้งานราคากลางมาตรฐานได้ทันที
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
