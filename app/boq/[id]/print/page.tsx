'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatConstructionAreas } from '@/lib/constructionAreaUtils';

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

// Convert number to Thai Baht text
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

      if (position === 1 && digit === 1) {
        result += 'สิบ';
      } else if (position === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (position === 0 && digit === 1 && len > 1) {
        result += 'เอ็ด';
      } else {
        result += thaiNumbers[digit] + thaiUnits[position];
      }
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

export default function PrintBOQPage() {
  const params = useParams();
  const boqId = params.id as string;

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

        // Fetch routes
        const { data: routesData } = await supabase
          .from('boq_routes')
          .select('*')
          .eq('boq_id', boqId)
          .order('route_order');

        if (routesData && routesData.length > 0) {
          setRoutes(routesData);

          // Fetch items for each route
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
          // Legacy: items without routes
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

        // Fetch factor reference bounds for interpolation
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

          if (upperData) {
            setUpperFactorRef(upperData);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [boqId]);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatThaiMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const buddhistYear = date.getFullYear() + 543;
    return `${thaiMonths[date.getMonth()]} ${buddhistYear}`;
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!boq) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">ไม่พบข้อมูล BOQ</p>
      </div>
    );
  }

  // Calculate totals using factor reference with interpolation
  // Formula: Factor = D - [(D - E) × (A - B) / (C - B)]
  // A = ค่างานต้นทุน (actual cost in millions)
  // B = ค่างานต้นทุนตัวต่ำกว่า (lower bound cost_million)
  // C = ค่างานต้นทุนตัวสูงกว่า (upper bound cost_million)
  // D = Factor ของ B
  // E = Factor ของ C
  const totalCost = boq.total_cost;
  const totalMaterialCost = routes.reduce((sum, route) => sum + route.total_material_cost, 0);
  const totalLaborCost = routes.reduce((sum, route) => sum + route.total_labor_cost, 0);
  const costInMillion = totalCost / 1000000;

  const calculateInterpolatedFactor = (): number => {
    const A = costInMillion; // Actual cost in millions
    const B = lowerFactorRef?.cost_million || 5;
    const D = lowerFactorRef?.factor || 1.2750;

    // If no upper bound or cost is exactly at lower bound, use lower factor
    if (!upperFactorRef || A <= B) {
      return D;
    }

    const C = upperFactorRef.cost_million;
    const E = upperFactorRef.factor;

    // If cost exceeds upper bound, use upper factor
    if (A >= C) {
      return E;
    }

    // Interpolation formula: D - [(D - E) × (A - B) / (C - B)]
    const interpolatedFactor = D - ((D - E) * (A - B) / (C - B));

    // Truncate to 4 decimal places (ปัดทิ้ง)
    return Math.floor(interpolatedFactor * 10000) / 10000;
  };

  const factor = calculateInterpolatedFactor();
  const constructionCostBeforeVAT = totalCost * factor;
  const vatAmount = constructionCostBeforeVAT * VAT_RATE;
  const totalWithVAT = constructionCostBeforeVAT + vatAmount;

  return (
    <>
      {/* Print Button - Hidden in print */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          กลับ
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          พิมพ์
        </button>
      </div>

      {/* ===== PAGES: BOQ Detail per Route ===== */}
      {(() => {
        // Calculate total pages
        const ITEMS_PER_PAGE = 20; // Approximate items per page
        let totalPages = 0;

        // Count pages for each route
        routes.forEach((route) => {
          const items = routeItems[route.id] || [];
          const pagesForRoute = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
          totalPages += pagesForRoute;
        });

        // Add consolidated page if multiple routes
        if (routes.length > 1) {
          totalPages += 1;
        }

        let currentPage = 0;

        return routes.map((route, routeIndex) => {
          const items = (routeItems[route.id] || []).sort((a, b) => a.item_order - b.item_order);
          currentPage++;

          return (
            <div key={route.id} className="print-page page-1">
              {/* Header */}
              <div className="header">
                <div className="logo-section">
                  <img src="/nt_logo.svg" alt="NT Logo" className="logo" />
                </div>
                <div className="page-info">
                  <div>หน้าที่ {currentPage}/{totalPages}</div>
                  <div>แบบ ปร.4 (ก)</div>
                </div>
              </div>

            {/* Title */}
            <div className="title">
              แบบฟอร์มแสดงรายการ ปริมาณงาน และราคางานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน (BOQ)
            </div>

            {/* Info Section */}
            <div className="info-section">
              <div className="info-left">
                <div><span className="label">ส่วนงาน</span> {boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}</div>
                <div><span className="label">บัญชีราคา</span> งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก</div>
                <div><span className="label">เส้นทาง</span> <strong>{route.route_name}</strong> {routes.length > 1 && `(${routeIndex + 1}/${routes.length})`}</div>
              </div>
              <div className="info-right">
                <div><span className="label">โครงการ</span> {boq.project_name}</div>
                <div><span className="label">พื้นที่ก่อสร้าง</span> {route.construction_area || boq.construction_area || '-'}</div>
              </div>
            </div>

            <div className="unit-label">หน่วย - บาท</div>

            {/* Main Table */}
            <table className="boq-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-no">ลำดับที่</th>
                  <th rowSpan={2} className="col-item">รายการ</th>
                  <th rowSpan={2} className="col-qty">ปริมาณงาน</th>
                  <th rowSpan={2} className="col-unit">หน่วย</th>
                  <th colSpan={2} className="col-material-header">ค่าวัสดุ ไม่รวมภาษีมูลค่าเพิ่ม (1)</th>
                  <th colSpan={2} className="col-labor-header">ค่าแรง ไม่รวมภาษีมูลค่าเพิ่ม (2)</th>
                  <th rowSpan={2} className="col-total">ค่างานต้นทุน<br/>(3)=(1)+(2)</th>
                  <th rowSpan={2} className="col-remark">หมายเหตุ</th>
                </tr>
                <tr>
                  <th className="col-sub">ราคา/หน่วย</th>
                  <th className="col-sub">จำนวนเงิน</th>
                  <th className="col-sub">ราคา/หน่วย</th>
                  <th className="col-sub">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="center">{idx + 1}</td>
                    <td className="left">{item.item_name}</td>
                    <td className="right">{formatNumber(item.quantity)}</td>
                    <td className="center">{item.unit}</td>
                    <td className="right">{formatNumber(item.material_cost_per_unit)}</td>
                    <td className="right">{formatNumber(item.total_material_cost)}</td>
                    <td className="right">{formatNumber(item.labor_cost_per_unit)}</td>
                    <td className="right">{formatNumber(item.total_labor_cost)}</td>
                    <td className="right">{formatNumber(item.total_cost)}</td>
                    <td className="center">{item.remarks || ''}</td>
                  </tr>
                ))}
                {/* Empty rows for spacing */}
                {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="empty-row">
                    <td>&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Row for this route */}
            <table className="boq-table totals-table">
              <tbody>
                <tr className="total-row highlight">
                  <td className="col-no"></td>
                  <td className="col-item" style={{ textAlign: 'right', paddingRight: '10px' }}>ผลรวมค่างานต้นทุน - {route.route_name}</td>
                  <td className="col-qty"></td>
                  <td className="col-unit"></td>
                  <td className="col-sub"></td>
                  <td className="col-sub" style={{ textAlign: 'right' }}>{formatNumber(route.total_material_cost)}</td>
                  <td className="col-sub"></td>
                  <td className="col-sub" style={{ textAlign: 'right' }}>{formatNumber(route.total_labor_cost)}</td>
                  <td className="col-total" style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(route.total_cost)}</td>
                  <td className="col-remark"></td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
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
          </div>
        );
      });
      })()}

      {/* ===== CONSOLIDATED ITEMS PAGE: All Routes Combined ===== */}
      {routes.length > 1 && (() => {
        // Calculate total pages (same logic as above)
        const ITEMS_PER_PAGE = 20;
        let totalPages = 0;
        routes.forEach((route) => {
          const items = routeItems[route.id] || [];
          const pagesForRoute = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
          totalPages += pagesForRoute;
        });
        totalPages += 1; // Add this consolidated page

        // Consolidate items: merge items with same item_name
        const consolidatedMap = new Map();

        routes.forEach((route) => {
          const items = routeItems[route.id] || [];
          items.forEach((item) => {
            const key = item.item_name;
            if (consolidatedMap.has(key)) {
              const existing = consolidatedMap.get(key);
              existing.quantity += item.quantity;
              existing.total_material_cost += item.total_material_cost;
              existing.total_labor_cost += item.total_labor_cost;
              existing.total_cost += item.total_cost;
            } else {
              consolidatedMap.set(key, {
                item_order: item.item_order,
                item_name: item.item_name,
                quantity: item.quantity,
                unit: item.unit,
                material_cost_per_unit: item.material_cost_per_unit,
                labor_cost_per_unit: item.labor_cost_per_unit,
                total_material_cost: item.total_material_cost,
                total_labor_cost: item.total_labor_cost,
                total_cost: item.total_cost,
              });
            }
          });
        });

        // Convert to array and sort by item_order
        const consolidatedItems = Array.from(consolidatedMap.values())
          .sort((a, b) => a.item_order - b.item_order);

        return (
          <div className="print-page page-1">
            {/* Header */}
            <div className="header">
              <div className="logo-section">
                <img src="/nt_logo.svg" alt="NT Logo" className="logo" />
              </div>
              <div className="page-info">
                <div>หน้าที่ {totalPages}/{totalPages}</div>
                <div>แบบ ปร.4 (ก)</div>
              </div>
            </div>

            {/* Title */}
            <div className="title">
              รวมรายการก่อสร้างทุกเส้นทาง
            </div>

            {/* Info Section */}
            <div className="info-section">
              <div className="info-left">
                <div><span className="label">ส่วนงาน</span> {boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}</div>
                <div><span className="label">บัญชีราคา</span> งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก</div>
                <div><span className="label">เส้นทาง</span> <strong>{routes.map(r => r.route_name).join(', ')}</strong></div>
              </div>
              <div className="info-right">
                <div><span className="label">โครงการ</span> {boq.project_name}</div>
                <div><span className="label">พื้นที่ก่อสร้าง</span> {formatConstructionAreas(routes.map(r => r.construction_area))}</div>
              </div>
            </div>

            <div className="unit-label">หน่วย - บาท</div>

            {/* Main Table - Consolidated Items */}
            <table className="boq-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-no">ลำดับที่</th>
                  <th rowSpan={2} className="col-item">รายการ</th>
                  <th rowSpan={2} className="col-qty">ปริมาณงาน</th>
                  <th rowSpan={2} className="col-unit">หน่วย</th>
                  <th colSpan={2} className="col-material-header">ค่าวัสดุ ไม่รวมภาษีมูลค่าเพิ่ม (1)</th>
                  <th colSpan={2} className="col-labor-header">ค่าแรง ไม่รวมภาษีมูลค่าเพิ่ม (2)</th>
                  <th rowSpan={2} className="col-total">ค่างานต้นทุน<br/>(3)=(1)+(2)</th>
                  <th rowSpan={2} className="col-remark">หมายเหตุ</th>
                </tr>
                <tr>
                  <th className="col-sub">ราคา/หน่วย</th>
                  <th className="col-sub">จำนวนเงิน</th>
                  <th className="col-sub">ราคา/หน่วย</th>
                  <th className="col-sub">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedItems.map((item, index) => (
                  <tr key={index}>
                    <td className="center">{index + 1}</td>
                    <td className="left">{item.item_name}</td>
                    <td className="right">{formatNumber(item.quantity)}</td>
                    <td className="center">{item.unit}</td>
                    <td className="right">{formatNumber(item.material_cost_per_unit)}</td>
                    <td className="right">{formatNumber(item.total_material_cost)}</td>
                    <td className="right">{formatNumber(item.labor_cost_per_unit)}</td>
                    <td className="right">{formatNumber(item.total_labor_cost)}</td>
                    <td className="right">{formatNumber(item.total_cost)}</td>
                    <td className="center"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grand Totals Row */}
            <table className="boq-table totals-table">
              <tbody>
                <tr className="total-row highlight">
                  <td className="col-no"></td>
                  <td className="col-item" style={{ textAlign: 'right', paddingRight: '10px' }}>ผลรวมค่างานต้นทุนทั้งหมด</td>
                  <td className="col-qty"></td>
                  <td className="col-unit"></td>
                  <td className="col-sub"></td>
                  <td className="col-sub" style={{ textAlign: 'right' }}>{formatNumber(totalMaterialCost)}</td>
                  <td className="col-sub"></td>
                  <td className="col-sub" style={{ textAlign: 'right' }}>{formatNumber(totalLaborCost)}</td>
                  <td className="col-total" style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(totalCost)}</td>
                  <td className="col-remark"></td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
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
          </div>
        );
      })()}

      {/* ===== FINAL PAGE: Summary ===== */}
      <div className="print-page page-2">
        {/* Header */}
        <div className="header">
          <div className="logo-section">
            <img src="/nt_logo.svg" alt="NT Logo" className="logo" />
          </div>
          <div className="page-info">
            <div>สรุปรวม</div>
          </div>
        </div>

        {/* Info Section */}
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

        {/* Summary Table - Per Route */}
        <table className="summary-table">
          <thead>
            <tr>
              <th className="col-no2">ที่</th>
              <th className="col-desc">รายละเอียด</th>
              <th className="col-cost">ค่างาน (บาท)</th>
              <th className="col-factor">รวมประมาณ<br/>Factor<br/>≤ 5 ลบ.</th>
              <th className="col-factor">รวมประมาณ<br/>Factor<br/>&gt; 5 ลบ.</th>
              <th className="col-result">ค่าก่อสร้าง (ไม่รวม VAT)<br/>รวม - บาท</th>
              <th className="col-result">ค่าก่อสร้าง (รวม VAT)<br/>รวม - บาท</th>
              <th className="col-remark2">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, index) => {
              const routeWithFactor = route.total_cost * factor;
              const routeWithVAT = routeWithFactor * (1 + VAT_RATE);

              // Determine which factor column to show based on GRAND TOTAL cost (not individual route)
              const grandTotalInMillion = totalCost / 1000000;
              const showFactorLTE5 = grandTotalInMillion <= 5;
              const showFactorGT5 = grandTotalInMillion > 5;

              return (
                <tr key={route.id}>
                  <td className="center">{index + 1}</td>
                  <td className="left">{route.route_name}</td>
                  <td className="right">{formatNumber(route.total_cost)}</td>
                  <td className="center">{showFactorLTE5 ? factor.toFixed(4) : ''}</td>
                  <td className="center">{showFactorGT5 ? factor.toFixed(4) : ''}</td>
                  <td className="right">{formatNumber(routeWithFactor)}</td>
                  <td className="right">{formatNumber(routeWithVAT)}</td>
                  <td></td>
                </tr>
              );
            })}
            {/* Empty rows for spacing */}
            {Array.from({ length: 5 - routes.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

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

        {/* Section Header for Summary */}
        <div style={{ marginTop: '20px', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>ส่วนประมาณราคาค่าก่อสร้าง รวมภาษีมูลค่าเพิ่ม (VAT)</span>
        </div>

        {/* Thai Text Amount */}
        <div className="thai-amount">
          <span className="thai-label">ประมาณราคาค่างาน รวม VAT</span>
          <span className="thai-value highlight-box">{numberToThaiText(totalWithVAT)}</span>
        </div>

        {/* Footer */}
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
      </div>

      {/* Styles */}
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

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'TH Sarabun New', sans-serif;
          font-size: 14pt;
          line-height: 1.3;
        }

        .print-page {
          width: 297mm;
          min-height: 210mm;
          padding: 10mm 15mm;
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

        .logo {
          height: 50px;
          width: auto;
        }

        .company-name .thai {
          font-size: 14pt;
          font-weight: bold;
        }

        .company-name .eng {
          font-size: 10pt;
          color: #666;
        }

        .page-info {
          text-align: right;
          font-size: 12pt;
        }

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

        .info-left, .info-right {
          flex: 1;
        }

        .label {
          font-weight: bold;
          margin-right: 5px;
        }

        .unit-label {
          text-align: right;
          font-size: 12pt;
          margin-bottom: 3px;
        }

        /* BOQ Table */
        .boq-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11pt;
          margin-bottom: 0;
        }

        .boq-table th, .boq-table td {
          border: 1px solid #000;
          padding: 2px 4px;
        }

        .boq-table th {
          background: #fffde7;
          font-weight: bold;
          text-align: center;
        }

        .boq-table .col-no { width: 35px; }
        .boq-table .col-item { width: auto; }
        .boq-table .col-qty { width: 55px; }
        .boq-table .col-unit { width: 35px; }
        .boq-table .col-sub { width: 70px; }
        .boq-table .col-total { width: 80px; }
        .boq-table .col-remark { width: 60px; }
        .boq-table .col-material-header, .boq-table .col-labor-header { text-align: center; }

        .boq-table td.center { text-align: center; }
        .boq-table td.left { text-align: left; }
        .boq-table td.right { text-align: right; }

        .empty-row td { height: 22px; }

        /* Totals Table */
        .total-row.highlight {
          background: #fffde7;
        }

        /* Summary Table */
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11pt;
          margin-top: 10px;
        }

        .summary-table th, .summary-table td {
          border: 1px solid #000;
          padding: 2px 4px;
        }

        .summary-table th {
          background: #fffde7;
          font-weight: bold;
          text-align: center;
        }

        .summary-table .col-no2 { width: 30px; }
        .summary-table .col-desc { width: auto; min-width: 150px; }
        .summary-table .col-cost { width: 100px; }
        .summary-table .col-factor { width: 80px; }
        .summary-table .col-result { width: 110px; }
        .summary-table .col-remark2 { width: 70px; }

        .summary-table td.center { text-align: center; }
        .summary-table td.left { text-align: left; }
        .summary-table td.right { text-align: right; }

        /* Calc Summary */
        .calc-summary {
          margin-top: 20px;
          font-size: 12pt;
        }

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

        .calc-value {
          min-width: 120px;
          text-align: right;
        }

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
        .footer-section {
          margin-top: 15px;
          font-size: 11pt;
        }

        .conditions, .note {
          margin-bottom: 5px;
        }

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

        .signature {
          text-align: center;
          min-width: 200px;
        }

        .sig-line {
          border-bottom: 1px solid #000;
          height: 30px;
          margin-bottom: 5px;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
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
            padding: 0;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }

          .print-page:last-child {
            page-break-after: auto;
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

