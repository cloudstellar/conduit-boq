'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { roundMoney, calculateVAT, allocateToRoutes } from '@/lib/calculation';
import { formatConstructionAreas } from '@/lib/constructionAreaUtils';
import {
  splitText,
  estimateInfoHeight,
  calculateMaxRowsForPage,
  chunkItems,
  chunkSummaryRoutes,
  countBOQPages,
  countItemRows,
  PRINT_CONSTANTS,
} from '@/lib/printUtils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, FileSpreadsheet, AlertCircle } from 'lucide-react';

// ──────────────────────────────────
// Types
// ──────────────────────────────────

interface BOQData {
  id: string;
  estimator_name: string;
  document_date: string;
  project_name: string;
  route: string | null;
  construction_area: string | null;
  department: string | null;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
}

interface BOQRoute {
  id: string;
  route_order: number;
  route_name: string;
  route_description: string | null;
  construction_area: string | null;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
}

interface BOQItem {
  id: string;
  route_id: string | null;
  item_order: number;
  item_name: string;
  quantity: number;
  unit: string;
  material_cost_per_unit: number;
  labor_cost_per_unit: number;
  unit_cost: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  remarks: string | null;
}

interface FactorReference {
  cost_million: number;
  operation_percent: number;
  interest_percent: number;
  profit_percent: number;
  total_expense_percent: number;
  factor: number;
  vat_percent: number;
  factor_f: number;
  factor_f_rain_1: number;
  factor_f_rain_2: number;
}

// ──────────────────────────────────
// Thai Baht Text Conversion
// ──────────────────────────────────

function numberToThaiText(num: number): string {
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  if (num === 0) return 'ศูนย์บาทถ้วน';
  const baht = Math.floor(num);
  const satang = Math.round((num - baht) * 100);
  const convertGroup = (n: number): string => {
    if (n === 0) return '';
    let result = '';
    const str = n.toString();
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const position = len - i - 1;
      if (digit === 0) continue;
      if (position === 1 && digit === 1) result += 'สิบ';
      else if (position === 1 && digit === 2) result += 'ยี่สิบ';
      else if (position === 0 && digit === 1 && len > 1) result += 'เอ็ด';
      else result += thaiNumbers[digit] + thaiUnits[position];
    }
    return result;
  };
  let result = '';
  if (baht >= 1000000) {
    result += convertGroup(Math.floor(baht / 1000000)) + 'ล้าน';
    result += convertGroup(baht % 1000000);
  } else {
    result += convertGroup(baht);
  }
  result += 'บาท';
  if (satang > 0) {
    result += convertGroup(satang) + 'สตางค์';
  } else {
    result += 'ถ้วน';
  }
  return result;
}

// ──────────────────────────────────
// Sub-Components (print-only, not exported)
// ──────────────────────────────────

function PageHeader({ currentPage, totalPages, formLabel }: {
  currentPage: number;
  totalPages: number;
  formLabel?: string;
}) {
  return (
    <div className="header">
      <div className="logo-section">
        <img src="/nt_logo.svg" alt="NT Logo" className="logo" />
      </div>
      <div className="page-info">
        <div>หน้าที่ {currentPage}/{totalPages}</div>
        {formLabel && <div>{formLabel}</div>}
      </div>
    </div>
  );
}

function InfoSection({ boq, routeName, routeLabel, constructionArea, department }: {
  boq: BOQData;
  routeName: string;
  routeLabel?: string;
  constructionArea: string;
  department?: string;
}) {
  return (
    <div className="info-section">
      <div className="info-left">
        <div><span className="label">ส่วนงาน</span> {department || boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}</div>
        <div><span className="label">บัญชีราคา</span> งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก</div>
        <div><span className="label">เส้นทาง</span> <strong>{routeName}</strong> {routeLabel && `(${routeLabel})`}</div>
      </div>
      <div className="info-right">
        <div><span className="label">โครงการ</span> {boq.project_name}</div>
        <div><span className="label">พื้นที่ก่อสร้าง</span> {constructionArea || '-'}</div>
      </div>
    </div>
  );
}

function BOQTableHeader() {
  return (
    <thead>
      <tr>
        <th rowSpan={2} className="col-no">ลำดับที่</th>
        <th rowSpan={2} className="col-item">รายการ</th>
        <th rowSpan={2} className="col-qty">ปริมาณงาน</th>
        <th rowSpan={2} className="col-unit">หน่วย</th>
        <th colSpan={2} className="col-material-header">ค่าวัสดุ ไม่รวมภาษีมูลค่าเพิ่ม (1)</th>
        <th colSpan={2} className="col-labor-header">ค่าแรง ไม่รวมภาษีมูลค่าเพิ่ม (2)</th>
        <th rowSpan={2} className="col-total">ค่างานต้นทุน<br />(3)=(1)+(2)</th>
        <th rowSpan={2} className="col-remark">หมายเหตุ</th>
      </tr>
      <tr>
        <th className="col-sub">ราคา/หน่วย</th>
        <th className="col-sub">จำนวนเงิน</th>
        <th className="col-sub">ราคา/หน่วย</th>
        <th className="col-sub">จำนวนเงิน</th>
      </tr>
    </thead>
  );
}

function PageFooter({ boq }: { boq: BOQData }) {
  const formatThaiMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const buddhistYear = date.getFullYear() + 543;
    return `${thaiMonths[date.getMonth()]} ${buddhistYear}`;
  };

  return (
    <div className="footer-section">
      <div className="conditions">
        <span className="highlight-text">เงื่อนไข</span> Factor F งานก่อสร้างทาง เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 7.00 % ต่อปี, ค่าภาษีมูลค่าเพิ่ม 7.00 %
      </div>
      <div className="note">
        <span className="highlight-text">หมายเหตุ</span> ทั้งนี้ ราคางานโครงการ/งานก่อสร้าง ไม่ใช่ราคาค่าก่อสร้างที่แท้จริง แต่เป็นเพียงราคาโดยประมาณเท่านั้น
      </div>
      <div className="signature-section">
        <div className="signature">
          <div className="sig-line"></div>
          <div>ผู้ประมาณราคา {boq.estimator_name}</div>
          <div>{formatThaiMonth(boq.document_date)}</div>
        </div>
      </div>
    </div>
  );
}

function ContinueIndicator() {
  return <div className="continue-indicator">─ ต่อหน้าถัดไป ─</div>;
}

/** Render BOQ item rows with text splitting (continuation rows) */
function renderItemRows(items: BOQItem[], startIndex: number, formatNumber: (n: number) => string) {
  const rows: React.ReactNode[] = [];
  items.forEach((item, idx) => {
    const lines = splitText(item.item_name, PRINT_CONSTANTS.ITEM_COL_MAX_CHARS);
    lines.forEach((line, lineIdx) => {
      const isFirst = lineIdx === 0;
      rows.push(
        <tr key={`${item.id}-${lineIdx}`}>
          <td className="center">{isFirst ? startIndex + idx + 1 : ''}</td>
          <td className="left">{line}</td>
          <td className="right">{isFirst ? formatNumber(item.quantity) : ''}</td>
          <td className="center">{isFirst ? item.unit : ''}</td>
          <td className="right">{isFirst ? formatNumber(item.material_cost_per_unit) : ''}</td>
          <td className="right">{isFirst ? formatNumber(item.total_material_cost) : ''}</td>
          <td className="right">{isFirst ? formatNumber(item.labor_cost_per_unit) : ''}</td>
          <td className="right">{isFirst ? formatNumber(item.total_labor_cost) : ''}</td>
          <td className="right">{isFirst ? formatNumber(item.total_cost) : ''}</td>
          <td className="center">{isFirst ? (item.remarks || '') : ''}</td>
        </tr>
      );
    });
  });
  return rows;
}

// ──────────────────────────────────
// Main Component
// ──────────────────────────────────

export default function PrintBOQPage() {
  const params = useParams();
  const boqId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  const [boq, setBOQ] = useState<BOQData | null>(null);
  const [routes, setRoutes] = useState<BOQRoute[]>([]);
  const [routeItems, setRouteItems] = useState<Record<string, BOQItem[]>>({});
  const [lowerFactorRef, setLowerFactorRef] = useState<FactorReference | null>(null);
  const [upperFactorRef, setUpperFactorRef] = useState<FactorReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const VAT_RATE = 0.07;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: boqData } = await supabase
          .from('boq')
          .select('*')
          .eq('id', boqId)
          .single();
        setBOQ(boqData);

        const { data: routesData } = await supabase
          .from('boq_routes')
          .select('*')
          .eq('boq_id', boqId)
          .order('route_order');

        if (routesData && routesData.length > 0) {
          setRoutes(routesData);
          const itemsMap: Record<string, BOQItem[]> = {};
          for (const route of routesData) {
            const { data: items } = await supabase
              .from('boq_items')
              .select('*')
              .eq('route_id', route.id)
              .order('item_order');
            itemsMap[route.id] = items || [];
          }
          setRouteItems(itemsMap);
        } else {
          const { data: legacyItems } = await supabase
            .from('boq_items')
            .select('*')
            .eq('boq_id', boqId)
            .order('item_order');
          if (legacyItems && legacyItems.length > 0) {
            const defaultRoute: BOQRoute = {
              id: 'legacy',
              route_order: 1,
              route_name: boqData?.route || 'เส้นทางหลัก',
              route_description: null,
              construction_area: boqData?.construction_area || null,
              total_material_cost: legacyItems.reduce((s, i) => s + Number(i.total_material_cost), 0),
              total_labor_cost: legacyItems.reduce((s, i) => s + Number(i.total_labor_cost), 0),
              total_cost: legacyItems.reduce((s, i) => s + Number(i.total_cost), 0),
            };
            setRoutes([defaultRoute]);
            setRouteItems({ legacy: legacyItems });
          }
        }

        if (boqData) {
          const costInMillion = boqData.total_cost / 1000000;
          const { data: lowerData } = await supabase
            .from('factor_reference')
            .select('*')
            .lte('cost_million', Math.max(5, costInMillion))
            .order('cost_million', { ascending: false })
            .limit(1)
            .single();
          const { data: upperData } = await supabase
            .from('factor_reference')
            .select('*')
            .gt('cost_million', costInMillion)
            .order('cost_million', { ascending: true })
            .limit(1)
            .single();
          if (lowerData) {
            setLowerFactorRef(lowerData);
          } else {
            const { data: defaultFactor } = await supabase
              .from('factor_reference')
              .select('*')
              .eq('cost_million', 5)
              .single();
            setLowerFactorRef(defaultFactor);
          }
          if (upperData) setUpperFactorRef(upperData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [boqId, supabase]);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => window.print();

  // ──── Loading State ────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ──── Error State ────
  if (!boq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>ไม่พบข้อมูล BOQ</AlertDescription>
        </Alert>
      </div>
    );
  }

  // ──────────────────────────────────
  // Calculate Factor & Totals
  // ──────────────────────────────────

  const totalCost = boq.total_cost;
  const totalMaterialCost = routes.reduce((sum, route) => sum + route.total_material_cost, 0);
  const totalLaborCost = routes.reduce((sum, route) => sum + route.total_labor_cost, 0);
  const costInMillion = totalCost / 1000000;

  const calculateInterpolatedFactor = (): number => {
    const A = costInMillion;
    const B = lowerFactorRef?.cost_million || 5;
    const D = lowerFactorRef?.factor || 1.2750;
    if (!upperFactorRef || A <= B) return D;
    const C = upperFactorRef.cost_million;
    const E = upperFactorRef.factor;
    if (A >= C) return E;
    const interpolatedFactor = D - ((D - E) * (A - B) / (C - B));
    return Math.floor(interpolatedFactor * 10000) / 10000;
  };

  const factor = calculateInterpolatedFactor();
  const { beforeVAT: constructionCostBeforeVAT, vat: vatAmount, total: totalWithVAT } =
    calculateVAT(totalCost * factor);

  // ──────────────────────────────────
  // Pagination: Pre-calculate chunks for all sections
  // ──────────────────────────────────

  // --- Route Detail Pages ---
  const routeChunksMap: { route: BOQRoute; chunks: BOQItem[][]; infoHeight: number }[] = routes.map((route) => {
    const items = (routeItems[route.id] || []).sort((a, b) => a.item_order - b.item_order);
    const infoHeight = estimateInfoHeight(
      route.route_name,
      boq.project_name,
      route.construction_area || '-',
    );
    const maxFirst = calculateMaxRowsForPage(infoHeight, false, false);
    const maxMiddle = calculateMaxRowsForPage(infoHeight, false, true);
    const maxLast = calculateMaxRowsForPage(infoHeight, true, false);
    const chunks = chunkItems(items, maxFirst, maxMiddle, maxLast);
    return { route, chunks, infoHeight };
  });

  // --- Consolidated Page ---
  const hasConsolidated = routes.length > 1;
  let consolidatedChunks: BOQItem[][] = [[]];
  if (hasConsolidated) {
    const consolidatedMap = new Map<string, {
      item_order: number; item_name: string; quantity: number; unit: string;
      material_cost_per_unit: number; labor_cost_per_unit: number;
      total_material_cost: number; total_labor_cost: number; total_cost: number;
    }>();
    routes.forEach((route) => {
      (routeItems[route.id] || []).forEach((item) => {
        const key = item.item_name;
        if (consolidatedMap.has(key)) {
          const existing = consolidatedMap.get(key)!;
          existing.quantity += item.quantity;
          existing.total_material_cost += item.total_material_cost;
          existing.total_labor_cost += item.total_labor_cost;
          existing.total_cost += item.total_cost;
        } else {
          consolidatedMap.set(key, {
            item_order: item.item_order, item_name: item.item_name,
            quantity: item.quantity, unit: item.unit,
            material_cost_per_unit: item.material_cost_per_unit,
            labor_cost_per_unit: item.labor_cost_per_unit,
            total_material_cost: item.total_material_cost,
            total_labor_cost: item.total_labor_cost,
            total_cost: item.total_cost,
          });
        }
      });
    });
    const consolidatedItems = Array.from(consolidatedMap.values())
      .sort((a, b) => a.item_order - b.item_order)
      .map((item, idx) => ({ ...item, id: `consolidated-${idx}`, route_id: null, unit_cost: 0, remarks: null } as BOQItem));

    const consAllRouteNames = routes.map(r => r.route_name).join(', ');
    const consArea = formatConstructionAreas(routes.map(r => r.construction_area));
    const consInfoHeight = estimateInfoHeight(consAllRouteNames, boq.project_name, consArea);
    const consMaxFirst = calculateMaxRowsForPage(consInfoHeight, false, false);
    const consMaxMiddle = calculateMaxRowsForPage(consInfoHeight, false, true);
    const consMaxLast = calculateMaxRowsForPage(consInfoHeight, true, false);
    consolidatedChunks = chunkItems(consolidatedItems, consMaxFirst, consMaxMiddle, consMaxLast);
  }

  // --- Total Pages (ปร.4 section) ---
  const boqTotalPages = countBOQPages({
    routeChunkCounts: routeChunksMap.map(rc => rc.chunks.length),
    consolidatedChunkCount: consolidatedChunks.length,
    hasConsolidatedPage: hasConsolidated,
  });

  // --- Summary Pages ---
  const summaryInfoHeight = estimateInfoHeight(
    routes.map(r => r.route_name).join(', '),
    boq.project_name,
    formatConstructionAreas(routes.map(r => r.construction_area)),
  );
  // Summary last page needs extra space for calc summary + thai text + footer
  const summaryMaxPerPage = calculateMaxRowsForPage(summaryInfoHeight, false, false);
  // Last page: substantially less rows because of calc summary block (~50mm)
  const summaryMaxLastPage = Math.max(3, summaryMaxPerPage - 8);
  const summaryChunks = chunkSummaryRoutes(routes, summaryMaxPerPage, summaryMaxLastPage);
  const summaryTotalPages = summaryChunks.length;

  // ──────────────────────────────────
  // Render
  // ──────────────────────────────────

  let currentPage = 0;

  return (
    <>
      {/* ===== Sticky Preview Toolbar (Screen Only) ===== */}
      <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
          </Button>
          <div className="text-sm text-muted-foreground">
            📄 Preview: {boq.project_name} ({boqTotalPages + summaryTotalPages} หน้า)
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" /> พิมพ์
            </Button>
          </div>
        </div>
      </div>

      {/* ===== ROUTE DETAIL PAGES ===== */}
      {routeChunksMap.map(({ route, chunks }, routeIndex) => {
        const routeChunkLabel = chunks.length > 1;
        return chunks.map((chunkItems, chunkIndex) => {
          currentPage++;
          const isLastChunk = chunkIndex === chunks.length - 1;
          // Calculate startIndex for item numbering
          let startIndex = 0;
          for (let c = 0; c < chunkIndex; c++) {
            startIndex += chunks[c].length;
          }

          return (
            <div key={`route-${route.id}-chunk-${chunkIndex}`} className="print-page page-1">
              <PageHeader
                currentPage={currentPage}
                totalPages={boqTotalPages}
                formLabel="แบบ ปร.4 (ก)"
              />
              <div className="title">
                แบบฟอร์มแสดงรายการ ปริมาณงาน และราคางานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน (BOQ)
              </div>
              <InfoSection
                boq={boq}
                routeName={route.route_name}
                routeLabel={
                  routes.length > 1
                    ? routeChunkLabel
                      ? `${routeIndex + 1}/${routes.length} - ${chunkIndex + 1}/${chunks.length}`
                      : `${routeIndex + 1}/${routes.length}`
                    : routeChunkLabel
                      ? `${chunkIndex + 1}/${chunks.length}`
                      : undefined
                }
                constructionArea={route.construction_area || '-'}
              />
              <div className="unit-label">หน่วย - บาท</div>

              <table className="boq-table">
                <BOQTableHeader />
                <tbody>
                  {renderItemRows(chunkItems, startIndex, formatNumber)}
                </tbody>
              </table>

              {isLastChunk ? (
                <>
                  {/* Totals Row */}
                  <table className="boq-table totals-table">
                    <tbody>
                      <tr className="total-row highlight">
                        <td className="col-no"></td>
                        <td className="col-item" style={{ textAlign: 'right', paddingRight: '10px' }}><strong>ผลรวมค่างานต้นทุน</strong></td>
                        <td className="col-qty"></td>
                        <td className="col-unit"></td>
                        <td className="col-sub"></td>
                        <td className="col-sub" style={{ textAlign: 'right' }}><strong>{formatNumber(route.total_material_cost)}</strong></td>
                        <td className="col-sub"></td>
                        <td className="col-sub" style={{ textAlign: 'right' }}><strong>{formatNumber(route.total_labor_cost)}</strong></td>
                        <td className="col-total" style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(route.total_cost)}</td>
                        <td className="col-remark"></td>
                      </tr>
                    </tbody>
                  </table>
                  <PageFooter boq={boq} />
                </>
              ) : (
                <ContinueIndicator />
              )}
            </div>
          );
        });
      })}

      {/* ===== CONSOLIDATED ITEMS PAGES ===== */}
      {hasConsolidated && consolidatedChunks.map((chunkItems, chunkIndex) => {
        currentPage++;
        const isLastChunk = chunkIndex === consolidatedChunks.length - 1;
        let startIndex = 0;
        for (let c = 0; c < chunkIndex; c++) {
          startIndex += consolidatedChunks[c].length;
        }

        return (
          <div key={`consolidated-chunk-${chunkIndex}`} className="print-page page-1">
            <PageHeader
              currentPage={currentPage}
              totalPages={boqTotalPages}
              formLabel="แบบ ปร.4 (ก)"
            />
            <div className="title">รวมรายการก่อสร้างทุกเส้นทาง</div>
            <InfoSection
              boq={boq}
              routeName={routes.map(r => r.route_name).join(', ')}
              constructionArea={formatConstructionAreas(routes.map(r => r.construction_area))}
            />
            <div className="unit-label">หน่วย - บาท</div>

            <table className="boq-table">
              <BOQTableHeader />
              <tbody>
                {renderItemRows(chunkItems, startIndex, formatNumber)}
              </tbody>
            </table>

            {isLastChunk ? (
              <>
                <table className="boq-table totals-table">
                  <tbody>
                    <tr className="total-row highlight">
                      <td className="col-no"></td>
                      <td className="col-item" style={{ textAlign: 'right', paddingRight: '10px' }}><strong>ผลรวมค่างานต้นทุนทั้งหมด</strong></td>
                      <td className="col-qty"></td>
                      <td className="col-unit"></td>
                      <td className="col-sub"></td>
                      <td className="col-sub" style={{ textAlign: 'right' }}><strong>{formatNumber(totalMaterialCost)}</strong></td>
                      <td className="col-sub"></td>
                      <td className="col-sub" style={{ textAlign: 'right' }}><strong>{formatNumber(totalLaborCost)}</strong></td>
                      <td className="col-total" style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(totalCost)}</td>
                      <td className="col-remark"></td>
                    </tr>
                  </tbody>
                </table>
                <PageFooter boq={boq} />
              </>
            ) : (
              <ContinueIndicator />
            )}
          </div>
        );
      })}

      {/* ===== SUMMARY PAGES ===== */}
      {summaryChunks.map((chunkRoutes, chunkIndex) => {
        const isLastChunk = chunkIndex === summaryChunks.length - 1;
        const grandTotalInMillion = totalCost / 1000000;
        const showFactorLTE5 = grandTotalInMillion <= 5;
        const showFactorGT5 = grandTotalInMillion > 5;

        const routeCosts = routes.map(r => r.total_cost);
        const allocated = allocateToRoutes(routeCosts, factor);

        // Calculate which routes are in this chunk
        let routeStartIdx = 0;
        for (let c = 0; c < chunkIndex; c++) {
          routeStartIdx += summaryChunks[c].length;
        }

        return (
          <div key={`summary-chunk-${chunkIndex}`} className="print-page page-2">
            <PageHeader
              currentPage={chunkIndex + 1}
              totalPages={summaryTotalPages}
            />
            <div className="info-section">
              <div className="info-left">
                <div><span className="label">ส่วนงาน</span> {boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}</div>
                <div><span className="label">สรุปรวม</span> บัญชีราคา งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก</div>
                <div><span className="label">จำนวนเส้นทาง</span> {routes.length} เส้นทาง</div>
              </div>
              <div className="info-right">
                <div><span className="label">โครงการ</span> {boq.project_name}</div>
                <div><span className="label">พื้นที่ก่อสร้าง</span> {formatConstructionAreas(routes.map(r => r.construction_area))}</div>
              </div>
            </div>

            <table className="summary-table">
              <thead>
                <tr>
                  <th className="col-no2">ที่</th>
                  <th className="col-desc">รายการ</th>
                  <th className="col-cost">ค่างานต้นทุน<br />(บาท)</th>
                  <th className="col-factor">Factor F<br />≤ 5 ลบ.</th>
                  <th className="col-factor">Factor F<br />&gt; 5 ลบ.</th>
                  <th className="col-result">ค่าก่อสร้าง<br />ไม่รวม VAT (บาท)</th>
                  <th className="col-vat">ภาษีมูลค่าเพิ่ม<br />(บาท)</th>
                  <th className="col-result">ค่าก่อสร้าง<br />รวม VAT (บาท)</th>
                  <th className="col-remark2">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const tableRows: React.ReactNode[] = [];

                  chunkRoutes.forEach((route, idx) => {
                    const globalIdx = routeStartIdx + idx;
                    const { beforeVAT: rBV, vat: rVAT, total: rTotal } = allocated[globalIdx];
                    const nameLines = splitText(route.route_name, PRINT_CONSTANTS.SUMMARY_COL_MAX_CHARS);

                    nameLines.forEach((line, lineIdx) => {
                      const isFirst = lineIdx === 0;
                      tableRows.push(
                        <tr key={`summary-${globalIdx}-${lineIdx}`}>
                          <td className="center">{isFirst ? globalIdx + 1 : ''}</td>
                          <td className="left">{line}</td>
                          <td className="right">{isFirst ? formatNumber(route.total_cost) : ''}</td>
                          <td className="center">{isFirst && showFactorLTE5 ? factor.toFixed(4) : ''}</td>
                          <td className="center">{isFirst && showFactorGT5 ? factor.toFixed(4) : ''}</td>
                          <td className="right">{isFirst ? formatNumber(rBV) : ''}</td>
                          <td className="right">{isFirst ? formatNumber(rVAT) : ''}</td>
                          <td className="right">{isFirst ? formatNumber(rTotal) : ''}</td>
                          <td>{''}</td>
                        </tr>
                      );
                    });
                  });

                  // Total row (only on last chunk)
                  if (isLastChunk) {
                    let sumCost = 0, sumBV = 0, sumVAT = 0, sumTotal = 0;
                    routes.forEach((r, i) => {
                      sumCost += r.total_cost;
                      sumBV += allocated[i].beforeVAT;
                      sumVAT += allocated[i].vat;
                      sumTotal += allocated[i].total;
                    });
                    tableRows.push(
                      <tr key="total-row" className="total-row highlight">
                        <td className="center" colSpan={2}><strong>รวม</strong></td>
                        <td className="right"><strong>{formatNumber(sumCost)}</strong></td>
                        <td className="center"><strong>{showFactorLTE5 ? factor.toFixed(4) : ''}</strong></td>
                        <td className="center"><strong>{showFactorGT5 ? factor.toFixed(4) : ''}</strong></td>
                        <td className="right"><strong>{formatNumber(sumBV)}</strong></td>
                        <td className="right"><strong>{formatNumber(sumVAT)}</strong></td>
                        <td className="right"><strong>{formatNumber(sumTotal)}</strong></td>
                        <td></td>
                      </tr>
                    );
                  }

                  return tableRows;
                })()}
              </tbody>
            </table>

            {isLastChunk ? (
              <>
                {/* Calculation Summary */}
                <div className="calc-summary">
                  <div className="calc-row">
                    <span className="calc-label">(1) ประมาณราคาค่าก่อสร้างทั้งโครงการ/งานก่อสร้าง ก่อนภาษี</span>
                    <span className="calc-value">{formatNumber(constructionCostBeforeVAT)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">(2) ภาษีมูลค่าเพิ่ม 7.00 %</span>
                    <span className="calc-value">{formatNumber(vatAmount)}</span>
                  </div>
                  <div className="calc-row total">
                    <span className="calc-label">(1) + (2) รวมประมาณค่างานทั้งโครงการ/งานก่อสร้าง เป็นเงินทั้งสิ้น</span>
                    <span className="calc-value">{formatNumber(totalWithVAT)}</span>
                  </div>
                </div>

                <div className="thai-amount">
                  <span className="thai-label"><strong>ประมาณราคาค่าก่อสร้าง รวมภาษีมูลค่าเพิ่ม (VAT)</strong></span>
                  <span className="thai-value highlight-box">{numberToThaiText(totalWithVAT)}</span>
                </div>

                <PageFooter boq={boq} />
              </>
            ) : (
              <ContinueIndicator />
            )}
          </div>
        );
      })}

      {/* ===== Styles ===== */}
      <style jsx global>{`
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('/fonts/THSarabunNew.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'TH Sarabun New';
          src: url('/fonts/THSarabunNew Bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
        }

        * { box-sizing: border-box; }

        .print-page {
          font-family: 'TH Sarabun New', sans-serif;
          font-size: 14pt;
          line-height: 1.3;
        }

        .print-page {
          width: 297mm;
          min-height: 210mm;
          padding: 12mm 15mm;
          margin: 0 auto 20px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo { height: 50px; width: auto; }

        .page-info { text-align: right; font-size: 12pt; }

        .title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .info-section {
          display: flex;
          gap: 40px;
          margin-bottom: 5px;
          font-size: 13pt;
        }

        .info-left, .info-right { flex: 1; }

        .label { font-weight: bold; margin-right: 5px; }

        .unit-label {
          text-align: right;
          font-size: 12pt;
          margin-bottom: 3px;
        }

        /* BOQ Table */
        .boq-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          margin-bottom: 0;
        }

        .boq-table th, .boq-table td {
          border: 1px solid #000;
          padding: 1px 3px;
          white-space: nowrap;
          overflow: hidden;
        }

        .boq-table th {
          background: #fffde7;
          font-weight: bold;
          text-align: center;
        }

        .boq-table .col-no { width: 35px; }
        .boq-table .col-item { width: auto; white-space: normal; }
        .boq-table .col-qty { width: 55px; }
        .boq-table .col-unit { width: 35px; }
        .boq-table .col-sub { width: 70px; }
        .boq-table .col-total { width: 80px; }
        .boq-table .col-remark { width: 60px; }
        .boq-table .col-material-header, .boq-table .col-labor-header { text-align: center; }

        .boq-table td.center { text-align: center; }
        .boq-table td.left { text-align: left; }
        .boq-table td.right { text-align: right; }

        /* Totals */
        .total-row.highlight { background: #fffde7; }

        /* Summary Table */
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          margin-top: 10px;
        }

        .summary-table th, .summary-table td {
          border: 1px solid #000;
          padding: 1px 3px;
        }

        .summary-table th {
          background: #fffde7;
          font-weight: bold;
          text-align: center;
        }

        .summary-table .col-no2 { width: 30px; }
        .summary-table .col-desc { width: auto; min-width: 120px; }
        .summary-table .col-cost { width: 90px; }
        .summary-table .col-factor { width: 65px; }
        .summary-table .col-result { width: 95px; }
        .summary-table .col-vat { width: 85px; }
        .summary-table .col-remark2 { width: 50px; }

        .summary-table td.center { text-align: center; }
        .summary-table td.left { text-align: left; }
        .summary-table td.right { text-align: right; }

        /* Calc Summary */
        .calc-summary { margin-top: 20px; font-size: 12pt; }
        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px dotted #ccc;
        }
        .calc-row.total {
          font-weight: bold;
          border-bottom: 2px solid #000;
        }
        .calc-value { min-width: 120px; text-align: right; }

        /* Thai Amount */
        .thai-amount {
          margin-top: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12pt;
        }
        .highlight-box {
          background: #ffeb3b;
          padding: 5px 15px;
          font-weight: bold;
        }

        /* Footer */
        .footer-section { margin-top: 15px; font-size: 11pt; }
        .conditions, .note { margin-bottom: 5px; }
        .highlight-text {
          background: #ffeb3b;
          padding: 1px 5px;
          font-weight: bold;
        }
        .signature-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .signature { text-align: center; min-width: 200px; }
        .sig-line {
          border-bottom: 1px solid #000;
          height: 30px;
          margin-bottom: 5px;
        }

        /* Continue Indicator */
        .continue-indicator {
          text-align: right;
          color: #999;
          font-size: 10pt;
          padding: 8px 10px 0 0;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print-page {
            width: 100%;
            min-height: auto;
            padding: 8mm 10mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          tr {
            page-break-inside: avoid;
          }
        }

        @media screen {
          .print-page {
            margin-bottom: 30px;
          }
        }
      `}</style>
    </>
  );
}
