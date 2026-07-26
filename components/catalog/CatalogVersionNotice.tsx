import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

type CatalogVersionNoticeContext = 'current' | 'new-boq' | 'bound-boq';

interface CatalogVersionNoticeProps {
  versionString: string;
  context: CatalogVersionNoticeContext;
  className?: string;
}

const COPY: Record<CatalogVersionNoticeContext, {
  title: string;
  description: string;
}> = {
  current: {
    title: 'ฉบับบัญชีราคาที่ใช้งานปัจจุบัน',
    description: 'รายการ ชื่อ หน่วย และราคาที่แสดงมาจากฉบับนี้',
  },
  'new-boq': {
    title: 'ฉบับบัญชีราคาสำหรับ BOQ ใหม่นี้',
    description: 'เมื่อบันทึก BOQ ระบบจะผูกเอกสารกับฉบับนี้และจะไม่เปลี่ยนย้อนหลังอัตโนมัติ',
  },
  'bound-boq': {
    title: 'ฉบับบัญชีราคาที่ BOQ นี้ใช้อยู่',
    description: 'รายการและราคาของ BOQ นี้คงอ้างอิงฉบับเดิม แม้บัญชีราคาปัจจุบันจะเปลี่ยนภายหลัง',
  },
};

export default function CatalogVersionNotice({
  versionString,
  context,
  className,
}: CatalogVersionNoticeProps) {
  const copy = COPY[context];

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-y border-slate-200 bg-white px-1 py-3 text-slate-700',
        className,
      )}
    >
      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0 text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-slate-900">{copy.title}</span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
            {versionString}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {copy.description}
        </p>
      </div>
    </div>
  );
}
