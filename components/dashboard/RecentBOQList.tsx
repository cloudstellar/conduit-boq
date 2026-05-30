'use client';

import Link from 'next/link';
import { BOQ } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Edit3, ArrowRight, FolderOpen } from 'lucide-react';

interface RecentBOQListProps {
  recentBoqs: Partial<BOQ>[];
  isLoading: boolean;
  canCreateBOQ: boolean;
}

const formatNumber = (num: number) =>
  num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    pending: 'secondary',
    submitted: 'secondary',
    pending_review: 'secondary',
    pending_approval: 'secondary',
    approved: 'default',
    rejected: 'destructive',
  };

  const labels: Record<string, string> = {
    draft: 'ฉบับร่าง',
    pending: 'รอตรวจสอบ',
    submitted: 'รอตรวจสอบ',
    pending_review: 'รอรีวิว',
    pending_approval: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่อนุมัติ',
  };

  const badgeStyle = status === 'draft'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
      : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <Badge variant={variants[status] || 'secondary'} className={`${badgeStyle} font-medium px-2 py-0.5 text-xs`}>
      {labels[status] || status}
    </Badge>
  );
};

export default function RecentBOQList({ recentBoqs, isLoading, canCreateBOQ }: RecentBOQListProps) {
  if (isLoading) {
    return (
      <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100">
          <Skeleton className="h-5 w-40 bg-slate-100" />
          <Skeleton className="h-4 w-72 bg-slate-100 mt-2" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 bg-slate-100" />
                  <Skeleton className="h-3.5 w-1/4 bg-slate-100" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16 bg-slate-100" />
                  <Skeleton className="h-8 w-16 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-5 border-b border-slate-100/80 flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 tracking-wide flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>ใบประมาณราคาล่าสุดของคุณ</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            เข้าทำงานต่อได้ทันทีจากโครงการที่เพิ่งเปิดแก้ไขล่าสุด
          </CardDescription>
        </div>
        <Link href="/boq">
          <Button variant="ghost" size="sm" className="text-xs text-nt-blue hover:text-nt-blue hover:bg-slate-50 gap-1 font-medium">
            ดูทั้งหมด
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {recentBoqs.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-800">ยังไม่มีประวัติโครงการประมาณราคา</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
              คุณสามารถสร้างเอกสารประมาณการ BOQ ใบแรกโดยกดปุ่มด่วนด้านล่าง
            </p>
            {canCreateBOQ && (
              <Link href="/boq/create" className="mt-4">
                <Button size="sm" className="bg-nt-orange hover:bg-nt-orange/90 text-white font-medium shadow-sm transition-colors">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  สร้างใบประมาณการใบแรก
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {recentBoqs.map((boq) => (
              <div
                key={boq.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors group"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className="font-medium text-slate-900 leading-snug break-words max-w-full text-sm group-hover:text-nt-blue transition-colors line-clamp-2"
                      title={boq.project_name}
                    >
                      {boq.project_name}
                    </h4>
                    {getStatusBadge(boq.status || 'draft')}
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-3 gap-y-1">
                    {boq.route && (
                      <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200/50">
                        {boq.route}
                      </span>
                    )}
                    <span>แก้ไขล่าสุด: {formatDate(boq.updated_at || boq.document_date || boq.created_at || '')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right sm:space-y-0.5">
                    <span className="text-xs text-slate-400 block sm:inline">มูลค่าประมาณการ</span>
                    <p className="font-semibold text-slate-900 text-sm font-sans tabular-nums sm:block">
                      {formatNumber(boq.total_with_vat || boq.total_with_factor_f || boq.total_cost || 0)} <span className="text-xs font-normal text-slate-500">บาท</span>
                    </p>
                  </div>

                  <Link href={`/boq/${boq.id}/edit`} className="flex-shrink-0">
                    <Button variant="outline" size="sm" className="h-8 hover:bg-slate-100 hover:text-slate-900 border-slate-200/80 gap-1.5 shadow-sm text-xs font-medium">
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>ทำต่อ</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
