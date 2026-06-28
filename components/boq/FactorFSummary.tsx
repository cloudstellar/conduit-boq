'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { roundMoney, calculateVAT, multiplyFactor } from '@/lib/calculation';
import { calculateInterpolatedFactorFromRefs, findFactorBracketRefs } from '@/lib/factorF';
import {
  FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE,
  getFactorReferenceRowsForVersion,
} from '@/lib/factorFReference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calculator, Loader2 } from 'lucide-react';

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
  factorReferenceVersionId: string | null;
  variant?: 'full' | 'compact';
  /** Callback to pass calculated factor values up for snapshot saving */
  onFactorCalculated?: (data: {
    factor: number;
    totalWithFactor: number;
    totalWithVAT: number;
    /** Factor F ดิบก่อน truncate */
    factorRaw: number;
    /** B: ค่างานต้นทุนช่วงล่าง (ล้านบาท → บาท) */
    lowerCost: number;
    /** C: ค่างานต้นทุนช่วงบน */
    upperCost: number;
    /** D: Factor F ของช่วงล่าง */
    lowerValue: number;
    /** E: Factor F ของช่วงบน */
    upperValue: number;
  }) => void;
}

export default function FactorFSummary({
  routes,
  grandTotalCost,
  factorReferenceVersionId,
  variant = 'full',
  onFactorCalculated,
}: FactorFSummaryProps) {
  const supabase = useMemo(() => createClient(), []);
  const [factorRefs, setFactorRefs] = useState<{ cost_million: number; factor: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [factorError, setFactorError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFactorReference = async () => {
      try {
        setFactorError(null);

        const rows = await getFactorReferenceRowsForVersion(supabase, factorReferenceVersionId);
        setFactorRefs(rows);
      } catch (err) {
        if (!(err instanceof Error) || err.message !== FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE) {
          console.error('Error fetching factor reference:', err);
        }
        setFactorRefs([]);
        setFactorError(err instanceof Error ? err.message : 'ไม่สามารถอ่านตาราง Factor F ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFactorReference();
  }, [supabase, factorReferenceVersionId]);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const { lowerFactorRef, upperFactorRef } = useMemo(() => {
    return findFactorBracketRefs(grandTotalCost, factorRefs);
  }, [factorRefs, grandTotalCost]);

  // Calculate factor and derived values instantly from the loaded reference table.
  const factorResult = useMemo(
    () => calculateInterpolatedFactorFromRefs(grandTotalCost, lowerFactorRef, upperFactorRef),
    [grandTotalCost, lowerFactorRef, upperFactorRef],
  );
  const factor = factorResult?.factor ?? 0;
  const costInMillion = grandTotalCost / 1000000;
  const { beforeVAT: totalWithFactor, total: totalWithVAT } =
    calculateVAT(multiplyFactor(grandTotalCost, factor));

  // Call callback when factor values change (for snapshot saving)
  // Must be before early returns to comply with React hooks rules
  useEffect(() => {
    if (onFactorCalculated && !isLoading && grandTotalCost > 0 && factorResult) {
      onFactorCalculated({
        factor: factorResult.factor,
        totalWithFactor,
        totalWithVAT,
        factorRaw: factorResult.raw,
        lowerCost: factorResult.lowerCost,
        upperCost: factorResult.upperCost,
        lowerValue: factorResult.lowerValue,
        upperValue: factorResult.upperValue,
      });
    }
  }, [
    factorResult,
    totalWithFactor,
    totalWithVAT,
    onFactorCalculated,
    isLoading,
    grandTotalCost,
  ]);

  useEffect(() => {
    if (onFactorCalculated && !isLoading && grandTotalCost > 0 && !factorResult) {
      onFactorCalculated({
        factor: 0,
        totalWithFactor: 0,
        totalWithVAT: 0,
        factorRaw: 0,
        lowerCost: 0,
        upperCost: 0,
        lowerValue: 0,
        upperValue: 0,
      });
    }
  }, [factorResult, onFactorCalculated, isLoading, grandTotalCost]);

  if (isLoading) {
    if (variant === 'compact') {
      return (
        <div className="rounded-md border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            กำลังโหลด Factor F
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }

  if (factorError || !factorResult) {
    if (variant === 'compact') {
      return (
        <Alert variant="destructive" className="shadow-sm">
          <AlertDescription className="text-sm">
            ไม่สามารถคำนวณ Factor F ได้: {factorError || 'ไม่พบข้อมูลอ้างอิงในตาราง Factor F'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertDescription>
          ไม่สามารถคำนวณ Factor F ได้: {factorError || 'ไม่พบข้อมูลอ้างอิงในตาราง Factor F'}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'compact') {
    const lowerMillion = factorResult.lowerCost / 1000000;
    const upperMillion = factorResult.upperCost / 1000000;
    const bracketLabel = upperMillion > lowerMillion
      ? `${lowerMillion.toLocaleString('th-TH')} - ${upperMillion.toLocaleString('th-TH')} ล้าน`
      : `${lowerMillion.toLocaleString('th-TH')} ล้าน`;

    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/95 px-3 py-3 shadow-sm backdrop-blur">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="min-w-0">
            <div className="text-xs text-blue-700">ค่างานต้นทุน</div>
            <div className="truncate text-sm font-semibold text-slate-900 md:text-base">
              {formatNumber(grandTotalCost)}
            </div>
            <div className="text-xs text-blue-600">บาท</div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs text-blue-700">
              <Calculator className="h-3.5 w-3.5" />
              Factor F
            </div>
            <div className="text-lg font-bold leading-tight text-blue-800">{factor.toFixed(4)}</div>
            <div className="truncate text-xs text-blue-600">{bracketLabel}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-blue-700">หลังคูณ Factor</div>
            <div className="truncate text-sm font-semibold text-blue-800 md:text-base">
              {formatNumber(totalWithFactor)}
            </div>
            <div className="text-xs text-blue-600">ก่อน VAT</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-green-700">รวม VAT 7%</div>
            <div className="truncate text-sm font-bold text-green-700 md:text-base">
              {formatNumber(totalWithVAT)}
            </div>
            <div className="text-xs text-green-600">บาท</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          สรุปราคาพร้อม Factor F
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Factor F Info */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Factor F (ค่างาน {costInMillion <= 5 ? '≤ 5' : '> 5'} ล้านบาท):
            </span>
            <span className="text-lg font-bold text-yellow-700">{factor.toFixed(4)}</span>
          </AlertDescription>
        </Alert>

        {/* Routes Breakdown with Factor F */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">ราคาแยกรายเส้นทาง (คูณ Factor F):</div>
          {routes.map((route, index) => {
            const routeWithFactorF = roundMoney(multiplyFactor(route.total_cost, factor));
            const { total: routeWithVAT } = calculateVAT(routeWithFactorF);
            return (
              <Card key={route.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-700">
                      {index + 1}. {route.route_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ค่างานต้นทุน:</span>
                      <div className="font-medium">{formatNumber(route.total_cost)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">× Factor F:</span>
                      <div className="font-medium text-blue-600">{formatNumber(routeWithFactorF)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">รวม VAT 7%:</span>
                      <div className="font-bold text-green-600">{formatNumber(routeWithVAT)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Grand Total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">รวมค่างานต้นทุนทั้งหมด</div>
              <div className="text-xl font-bold">{formatNumber(grandTotalCost)}</div>
              <div className="text-xs text-muted-foreground">บาท</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-100">
            <CardContent className="p-4">
              <div className="text-sm text-blue-600">รวมหลัง × Factor F</div>
              <div className="text-xl font-bold text-blue-700">{formatNumber(totalWithFactor)}</div>
              <div className="text-xs text-blue-500">บาท (ก่อน VAT)</div>
            </CardContent>
          </Card>
          <Card className="bg-green-100 border-2 border-green-400">
            <CardContent className="p-4">
              <div className="text-sm text-green-600">รวมทั้งสิ้น (VAT 7%)</div>
              <div className="text-xl font-bold text-green-700">
                {formatNumber(totalWithVAT)}
              </div>
              <div className="text-xs text-green-500">บาท</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
