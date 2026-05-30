'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, BookOpen, ChevronRight } from 'lucide-react';

interface ActionHubProps {
  canCreateBOQ: boolean;
}

export default function ActionHub({ canCreateBOQ }: ActionHubProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

      {/* Action 1: Create New BOQ */}
      {canCreateBOQ ? (
        <Link href="/boq/create" className="group block">
          <Card className="h-full border-nt-blue/15 hover:border-nt-blue/30 transition-all duration-200 shadow-sm bg-white hover:shadow-md">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-nt-blue/5 text-nt-blue flex items-center justify-center border border-nt-blue/15 group-hover:bg-nt-blue/10 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-nt-blue transition-colors">
                  สร้างใบประมาณราคาใหม่
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  เริ่มจัดทำเอกสาร BOQ สำหรับโครงการก่อสร้างและวางท่อร้อยสายสื่อสารใต้ดิน
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card className="h-full border-slate-200/60 bg-slate-50/50 opacity-60 min-h-[140px]">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
              <Plus className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-slate-400 leading-snug">
                สร้างใบประมาณราคาใหม่
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                สิทธิ์บัญชีปัจจุบันยังไม่ได้รับอนุมัติให้จัดทำเอกสาร
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action 2: View BOQ List */}
      <Link href="/boq" className="group block">
        <Card className="h-full border-slate-200/80 hover:border-slate-300 transition-all duration-200 shadow-sm bg-white hover:shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200/60 group-hover:bg-slate-100 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-nt-blue transition-colors">
                รายการใบประมาณราคา
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ดู จัดการ แก้ไข คัดลอก และสั่งพิมพ์ใบประมาณราคาทั้งหมดในสิทธิ์ของคุณ
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Action 3: Price List */}
      <Link href="/price-list" className="group block">
        <Card className="h-full border-slate-200/80 hover:border-slate-300 transition-all duration-200 shadow-sm bg-white hover:shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50 group-hover:bg-amber-100 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-nt-blue transition-colors">
                บัญชีราคามาตรฐาน
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                สืบค้นและดูบัญชีราคาค่าวัสดุและค่าแรงก่อสร้างมาตรฐานประจำปีบัญชี 2568
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

    </div>
  );
}
