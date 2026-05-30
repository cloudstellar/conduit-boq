'use client';

import Image from 'next/image';
import UserMenu from '@/components/auth/UserMenu';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/context/AuthContext';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { can } from '@/lib/permissions';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ActionHub from '@/components/dashboard/ActionHub';
import RecentBOQList from '@/components/dashboard/RecentBOQList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, BookOpen, CheckCircle, Info } from 'lucide-react';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { stats, recentBoqs, isLoading: isDataLoading, error, refreshData } = useDashboardData(user);

  const canCreateBOQ = can(user, 'create', 'boq');
  const isLoading = isAuthLoading || isDataLoading;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">

        {/* Header - Aligned with NT corporate branding guidelines */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 flex-shrink-0">
                <Image
                  src="/favicon.svg"
                  alt="NT Icon"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="border-l border-slate-200 pl-3">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน
                </h1>
                <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-wide">
                  Conduit Bill of Quantity (BOQ) • National Telecom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UserMenu />
              <div className="border-l border-slate-200 pl-4 h-7 hidden sm:flex items-center">
                <Image
                  src="/nt_logo.svg"
                  alt="NT Logo"
                  width={90}
                  height={18}
                  className="object-contain w-20 h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full space-y-6">

          {/* Error State - Dynamic fallback */}
          {error ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50/20 py-4 max-w-3xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="ml-2 space-y-1.5 flex-1">
                <AlertTitle className="text-red-900 font-semibold text-sm">ไม่สามารถโหลดข้อมูลสถิติระบได้</AlertTitle>
                <AlertDescription className="text-slate-700 text-xs">
                  {error}
                </AlertDescription>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshData}
                    className="h-8 border-red-200 hover:bg-red-50 hover:text-red-900 gap-1.5 text-xs font-semibold text-red-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    ลองโหลดใหม่อีกครั้ง
                  </Button>
                </div>
              </div>
            </Alert>
          ) : null}

          {/* Greeting Section (Handles onboarding warning & pending approval states) */}
          <DashboardHeader user={user} />

          {/* Key Metrics Dashboard (Stats Grid) */}
          <StatsGrid
            stats={stats}
            isLoading={isLoading}
            userRole={user?.role || 'staff'}
          />

          {/* Quick Action Navigation Hub */}
          <ActionHub canCreateBOQ={canCreateBOQ} />

          {/* Desktop/Tablet 2-Column Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (Spans 2): Recent work list */}
            <div className="lg:col-span-2">
              <RecentBOQList
                recentBoqs={recentBoqs}
                isLoading={isLoading}
                canCreateBOQ={canCreateBOQ}
              />
            </div>

            {/* Right Column (Spans 1): Quick guidelines & resources */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden h-full">
                <CardHeader className="p-5 border-b border-slate-100/80">
                  <CardTitle className="text-base font-semibold text-slate-900 tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>คำแนะนำและข้อกำหนดการเขียน BOQ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">

                  {/* Guideline item 1 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-slate-900">อัตราคูณและตัวคูณ Factor F</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        ระบบจะทำการจับคู่ค่าตัวคูณ Factor F ตามยอดประมาณการก่อสร้างและประเภทพื้นที่ฝนชุก/พื้นที่ฝนตกชุกโดยอัตโนมัติ ตามเกณฑ์มาตรฐานกรมบัญชีกลาง
                      </p>
                    </div>
                  </div>

                  {/* Guideline item 2 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-slate-900">การแบ่งประเภทหมวดหมู่งาน</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        โปรดระบุหมวดหมู่งานหลัก เช่น งานก่อสร้างท่อร้อยสาย, งานบ่อพัก, งานขุดเปิด/ขุดเจาะท่อลอด HDD ให้สอดคล้องตามลำดับโครงสร้างราคากลางปี 2568
                      </p>
                    </div>
                  </div>

                  {/* Guideline item 3 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-slate-900">การออกรายงานพิมพ์และอนุมัติ</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        คุณสามารถส่งใบประมาณราคาเสนอผู้อำนวยการส่วนหรือผู้ช่วยผู้อำนวยการฝ่ายตรวจสอบผ่านทางอิเล็กทรอนิกส์ และสั่งพิมพ์ออกมาในรูปแบบฟอร์มมาตรฐานของรัฐ (TH Sarabun) ได้ทันที
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex gap-2 items-start bg-slate-50/50 p-3.5 rounded-lg border border-slate-200 mt-2">
                    <Info className="w-4 h-4 text-nt-blue flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      หากพบข้อมูลราคากลางวัสดุหรือค่าแรงไม่ถูกต้อง หรือต้องการขออนุมัติขยายสิทธิ์การใช้งานบัญชีเพิ่มเติม โปรดติดต่อผู้ดูแลระบบเครือข่ายประมาณราคา NT หรือส่งจดหมายอิเล็กทรอนิกส์เพื่อขอความช่วยเหลือ
                    </p>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>

        </main>
      </div>
    </AuthGuard>
  );
}
