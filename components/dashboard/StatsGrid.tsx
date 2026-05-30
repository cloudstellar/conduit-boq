'use client';

import { DashboardStats } from '@/lib/hooks/useDashboardData';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Coins, Database, Layers, CalendarDays, Users } from 'lucide-react';

interface StatsGridProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  userRole: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ล้าน`;
  }
  return value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function StatsGrid({ stats, isLoading, userRole }: StatsGridProps) {
  const isManagerOrAdmin = ['admin', 'dept_manager', 'sector_manager'].includes(userRole);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3">สรุปข้อมูลส่วนตัว</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-slate-200/60 shadow-sm bg-white">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 bg-slate-100" />
                    <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                  </div>
                  <Skeleton className="h-8 w-16 bg-slate-100" />
                  <Skeleton className="h-3 w-12 bg-slate-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isManagerOrAdmin && (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-3">สรุปข้อมูลสังกัดหน่วยงาน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-slate-200/60 shadow-sm bg-white">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-28 bg-slate-100" />
                      <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                    </div>
                    <Skeleton className="h-8 w-24 bg-slate-100" />
                    <Skeleton className="h-3 w-16 bg-slate-100" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Personal & Price Book Statistics */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-3 tracking-wide">สถิติและข้อมูลการประมาณราคาของคุณ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Card 1: My BOQ Count */}
          <Card className="border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-600">ใบประมาณราคา</span>
                <div className="w-8 h-8 rounded-full bg-nt-blue/5 text-nt-blue flex items-center justify-center border border-nt-blue/10">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mt-1">
                  {stats.myBoqsCount}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-slate-500">เอกสารทั้งหมด</span>
                  {stats.myDraftCount > 0 && (
                    <Badge variant="secondary" className="px-1 py-0 text-[10px] bg-slate-100 hover:bg-slate-100 text-slate-600 font-normal">
                      ร่าง {stats.myDraftCount}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: My Total Cost */}
          <Card className="border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-600">งบประมาณรวมสะสม</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950 tracking-tight leading-none mt-1 font-sans tabular-nums">
                  {formatCurrency(stats.myTotalValue)} <span className="text-sm font-normal text-slate-500">{stats.myTotalValue >= 1_000_000 ? 'บาท' : 'บาท'}</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  ประมาณการรวมภาษีและ Factor F
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Price standard active count */}
          <Card className="border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-600">ราคากลางมาตรฐาน</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mt-1 tabular-nums">
                  {stats.priceItemsCount}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  รายการวัสดุและค่าแรง
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Categories Count */}
          <Card className="border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-600">หมวดหมู่ราคากลาง</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mt-1 tabular-nums">
                  {stats.priceCategoriesCount}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  หมวดหมู่วัสดุก่อสร้าง
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Fiscal Year */}
          <Card className="border-slate-200/60 shadow-sm hover:border-slate-300 transition-colors bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-600">ปีงบประมาณราคากลาง</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mt-1">
                  2568
                </p>
                <div className="mt-2">
                  <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 text-[10px] py-0 px-1.5 border border-amber-200/50 font-normal">
                    ปีบัญชีปัจจุบัน
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Team / Department / Unit level stats (Visible for managers or admins only) */}
      {isManagerOrAdmin && typeof stats.teamBoqsCount !== 'undefined' && (
        <div className="pt-4 border-t border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 tracking-wide flex items-center gap-1.5">
            <Users className="w-4 h-4 text-nt-blue" />
            <span>
              {userRole === 'admin'
                ? 'ภาพรวมระบบประมาณราคาทั้งหมด (สำหรับผู้ดูแลระบบ)'
                : userRole === 'dept_manager'
                  ? 'ภาพรวมใบงานและงบประมาณประมาณการสะสม (ฝ่ายของคุณ)'
                  : 'ภาพรวมใบงานและงบประมาณประมาณการสะสม (ส่วนงานของคุณ)'
              }
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">

            {/* Team BOQs count */}
            <Card className="border-nt-blue/10 bg-slate-50/20 shadow-sm hover:border-nt-blue/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-nt-blue/5 text-nt-blue flex items-center justify-center border border-nt-blue/15">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">จำนวนใบประมาณราคารวมในสังกัด</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">
                    {stats.teamBoqsCount} ใบงาน
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Team budget count */}
            <Card className="border-nt-blue/10 bg-slate-50/20 shadow-sm hover:border-nt-blue/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">งบประมาณสะสมรวมในสังกัด</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5 font-sans tabular-nums">
                    {formatCurrency(stats.teamTotalValue || 0)} <span className="text-xs font-normal text-slate-500">{ (stats.teamTotalValue || 0) >= 1_000_000 ? 'บาท' : 'บาท'}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
