'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FactorReference {
  cost_million: number;
  factor: number;
  factor_f: number;
}

interface RouteData {
  id: string;
  route_name: string;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
}

interface FactorFSummaryProps {
  routes: RouteData[];
  grandTotalCost: number;
}

export default function FactorFSummary({ routes, grandTotalCost }: FactorFSummaryProps) {
  const [lowerFactorRef, setLowerFactorRef] = useState<FactorReference | null>(null);
  const [upperFactorRef, setUpperFactorRef] = useState<FactorReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const VAT_RATE = 0.07;

  useEffect(() => {
    const fetchFactorReference = async () => {
      try {
        const costInMillion = grandTotalCost / 1000000;

        const { data: lowerData } = await supabase
          .from('factor_reference')
          .select('cost_million, factor, factor_f')
          .lte('cost_million', Math.max(5, costInMillion))
          .order('cost_million', { ascending: false })
          .limit(1)
          .single();

        const { data: upperData } = await supabase
          .from('factor_reference')
          .select('cost_million, factor, factor_f')
          .gt('cost_million', costInMillion)
          .order('cost_million', { ascending: true })
          .limit(1)
          .single();

        if (lowerData) {
          setLowerFactorRef(lowerData);
        } else {
          const { data: defaultFactor } = await supabase
            .from('factor_reference')
            .select('cost_million, factor, factor_f')
            .eq('cost_million', 5)
            .single();
          setLowerFactorRef(defaultFactor);
        }

        if (upperData) setUpperFactorRef(upperData);
      } catch (err) {
        console.error('Error fetching factor reference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (grandTotalCost > 0) {
      fetchFactorReference();
    } else {
      setIsLoading(false);
    }
  }, [grandTotalCost]);

  const calculateInterpolatedFactor = (): number => {
    const A = grandTotalCost / 1000000;
    const B = lowerFactorRef?.cost_million || 5;
    const D = lowerFactorRef?.factor || 1.2750;

    if (!upperFactorRef || A <= B) return D;

    const C = upperFactorRef.cost_million;
    const E = upperFactorRef.factor;

    if (A >= C) return E;

    const interpolatedFactor = D - ((D - E) * (A - B) / (C - B));
    return Math.floor(interpolatedFactor * 10000) / 10000;
  };

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const factor = calculateInterpolatedFactor();
  const costInMillion = grandTotalCost / 1000000;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        สรุปราคาพร้อม Factor F
      </h3>

      {/* Factor F Info */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Factor F (ค่างาน {costInMillion <= 5 ? '≤ 5' : '> 5'} ล้านบาท):
          </span>
          <span className="text-lg font-bold text-yellow-700">{factor.toFixed(4)}</span>
        </div>
      </div>

      {/* Routes Breakdown with Factor F */}
      <div className="space-y-3 mb-4">
        <div className="text-sm font-medium text-gray-600 mb-2">ราคาแยกรายเส้นทาง (คูณ Factor F):</div>
        {routes.map((route, index) => {
          const routeWithFactorF = route.total_cost * factor;
          const routeWithVAT = routeWithFactorF * (1 + VAT_RATE);
          return (
            <div key={route.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-700">
                  {index + 1}. {route.route_name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">ค่างานต้นทุน:</span>
                  <div className="font-medium">{formatNumber(route.total_cost)}</div>
                </div>
                <div>
                  <span className="text-gray-500">× Factor F:</span>
                  <div className="font-medium text-blue-600">{formatNumber(routeWithFactorF)}</div>
                </div>
                <div>
                  <span className="text-gray-500">รวม VAT 7%:</span>
                  <div className="font-bold text-green-600">{formatNumber(routeWithVAT)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div className="border-t-2 border-blue-300 pt-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">รวมค่างานต้นทุนทั้งหมด</div>
            <div className="text-xl font-bold text-gray-800">{formatNumber(grandTotalCost)}</div>
            <div className="text-xs text-gray-400">บาท</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-blue-600">รวมหลัง × Factor F</div>
            <div className="text-xl font-bold text-blue-700">{formatNumber(grandTotalCost * factor)}</div>
            <div className="text-xs text-blue-500">บาท (ก่อน VAT)</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 shadow-sm border-2 border-green-400">
            <div className="text-sm text-green-600">รวมทั้งสิ้น (VAT 7%)</div>
            <div className="text-xl font-bold text-green-700">
              {formatNumber(grandTotalCost * factor * (1 + VAT_RATE))}
            </div>
            <div className="text-xs text-green-500">บาท</div>
          </div>
        </div>
      </div>
    </div>
  );
}

