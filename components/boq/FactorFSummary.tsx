'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { roundMoney, calculateVAT, multiplyFactor } from '@/lib/calculation';
import type { FactorCalculationState, FactorSnapshot } from '@/lib/boq/editorState';
import {
  calculateInterpolatedFactorFromRefs,
  findFactorBracketRefs,
  getFactorVatPercent,
  getFactorVatRate,
  type FactorCalculationResult,
  type FactorReferenceRow,
} from '@/lib/factorF';
import {
  FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE,
  FactorReferenceVersionData,
  getActiveFactorReferenceVersion,
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
  boqId: string;
  revision: number;
  routes: RouteData[];
  grandTotalCost: number;
  factorReferenceVersionId: string | null;
  variant?: 'full' | 'compact';
  onCalculationStateChange: (state: FactorCalculationState) => void;
}

type ReferenceLoadState = {
  boqId: string;
  versionId: string;
} & (
  | { status: 'ready'; version: FactorReferenceVersionData; refs: FactorReferenceRow[] }
  | { status: 'error'; message: string }
);

type FactorEvaluation =
  | {
      status: 'ready';
      factorResult: FactorCalculationResult;
      vatPercent: number;
      vatRate: number;
      snapshot: FactorSnapshot;
    }
  | { status: 'error'; message: string };

const EMPTY_FACTOR_REFS: FactorReferenceRow[] = [];

export default function FactorFSummary({
  boqId,
  revision,
  routes,
  grandTotalCost,
  factorReferenceVersionId,
  variant = 'full',
  onCalculationStateChange,
}: FactorFSummaryProps) {
  const supabase = useMemo(() => createClient(), []);
  const [referenceState, setReferenceState] = useState<ReferenceLoadState | null>(null);
  // Match the rows actually loaded, even before a changed-version effect starts.
  const currentReference = referenceState?.boqId === boqId
    && referenceState.versionId === factorReferenceVersionId
    ? referenceState
    : null;
  const isLoading = Boolean(factorReferenceVersionId && !currentReference);
  const factorVersion = currentReference?.status === 'ready' ? currentReference.version : null;
  const factorRefs = currentReference?.status === 'ready' ? currentReference.refs : EMPTY_FACTOR_REFS;
  const referenceError = !factorReferenceVersionId
    ? FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE
    : currentReference?.status === 'error' ? currentReference.message : null;

  useEffect(() => {
    if (!factorReferenceVersionId) return;
    let cancelled = false;

    const fetchFactorReference = async () => {
      try {
        const [version, rows] = await Promise.all([
          getActiveFactorReferenceVersion(supabase, factorReferenceVersionId),
          getFactorReferenceRowsForVersion(supabase, factorReferenceVersionId),
        ]);
        if (cancelled) return;
        if (version.id !== factorReferenceVersionId || version.status !== 'active') {
          throw new Error('ไม่พบเวอร์ชัน Factor F ที่เปิดใช้งานสำหรับ BOQ นี้');
        }
        setReferenceState({
          boqId, versionId: version.id, status: 'ready', version, refs: rows,
        });
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof Error) || err.message !== FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE) {
          console.error('Error fetching factor reference:', err);
        }
        setReferenceState({
          boqId,
          versionId: factorReferenceVersionId,
          status: 'error',
          message: err instanceof Error ? err.message : 'ไม่สามารถอ่านตาราง Factor F ได้',
        });
      }
    };

    fetchFactorReference();
    return () => { cancelled = true; };
  }, [supabase, boqId, factorReferenceVersionId]);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Keep the existing arithmetic, using only the reference set for this BOQ/version.
  const calculation = useMemo((): FactorEvaluation => {
    try {
      if (!factorVersion || !Number.isFinite(grandTotalCost) || grandTotalCost <= 0) {
        throw new Error('ไม่พบข้อมูลอ้างอิงในตาราง Factor F สำหรับยอดรวมนี้');
      }
      const { lowerFactorRef, upperFactorRef } = findFactorBracketRefs(grandTotalCost, factorRefs);
      const factorResult = calculateInterpolatedFactorFromRefs(grandTotalCost, lowerFactorRef, upperFactorRef);
      if (!factorResult) throw new Error('ไม่พบข้อมูลอ้างอิงในตาราง Factor F');

      const factor = factorResult.factor;
      const vatPercent = getFactorVatPercent(factorVersion);
      const vatRate = getFactorVatRate(factorVersion);
      const { beforeVAT: totalWithFactor, total: totalWithVAT } =
        calculateVAT(multiplyFactor(grandTotalCost, factor), vatRate);
      const snapshot: FactorSnapshot = {
        factor,
        totalWithFactor,
        totalWithVAT,
        factorRaw: factorResult.raw,
        lowerCost: factorResult.lowerCost,
        upperCost: factorResult.upperCost,
        lowerValue: factorResult.lowerValue,
        upperValue: factorResult.upperValue,
      };
      if (factor <= 0 || !Object.values(snapshot).every(Number.isFinite)) {
        throw new Error('ผลคำนวณ Factor F ไม่ถูกต้อง');
      }
      return { status: 'ready', factorResult, vatPercent, vatRate, snapshot };
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'ไม่สามารถคำนวณ Factor F ได้',
      };
    }
  }, [factorVersion, factorRefs, grandTotalCost]);
  const factorError = referenceError ?? (calculation.status === 'error' ? calculation.message : null);
  const factorVersionLabel = factorVersion?.version_string
    ? `เวอร์ชัน ${factorVersion.version_string}`
    : 'ไม่พบเวอร์ชัน';
  const factorVersionStatus = factorVersion?.version_string
    ? `ใช้ Factor F เวอร์ชัน ${factorVersion.version_string}`
    : 'ยังไม่ทราบเวอร์ชัน Factor F';
  const costInMillion = grandTotalCost / 1000000;
  const calculationState = useMemo((): FactorCalculationState => {
    const identity = { boqId, revision, totalCost: grandTotalCost, factorReferenceVersionId };
    if (isLoading) return { ...identity, status: 'loading', snapshot: null };
    if (factorError || calculation.status === 'error') {
      return {
        ...identity, status: 'error', snapshot: null,
        message: factorError ?? 'ไม่สามารถคำนวณ Factor F ได้',
      };
    }
    return { ...identity, status: 'ready', snapshot: calculation.snapshot };
  }, [boqId, revision, grandTotalCost, factorReferenceVersionId, isLoading, factorError, calculation]);

  // Each callback identifies the exact editor input from which it was calculated.
  useEffect(() => {
    onCalculationStateChange(calculationState);
  }, [onCalculationStateChange, calculationState]);

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

  if (factorError || calculation.status === 'error') {
    const requiresVersionBinding =
      factorError === FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE;

    if (variant === 'compact') {
      return (
        <Alert variant="destructive" className="shadow-sm">
          <AlertDescription className="space-y-1 text-sm">
            <p>ไม่สามารถคำนวณ Factor F ได้: {factorError || 'ไม่พบข้อมูลอ้างอิงในตาราง Factor F'}</p>
            {requiresVersionBinding && (
              <p>
                หากต้องการใช้ Factor F ปัจจุบัน ให้กดสร้างสำเนาใหม่จากปุ่มด้านบน
                แล้วตรวจสอบก่อนบันทึก
              </p>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-1">
          <p>ไม่สามารถคำนวณ Factor F ได้: {factorError || 'ไม่พบข้อมูลอ้างอิงในตาราง Factor F'}</p>
          {requiresVersionBinding && (
            <p>
              หากต้องการใช้ Factor F ปัจจุบัน ให้สร้างสำเนา BOQ ใหม่แล้วตรวจสอบก่อนบันทึก
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const { factorResult, vatPercent, vatRate, snapshot } = calculation;
  const { factor, totalWithFactor, totalWithVAT } = snapshot;

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
            <div className="truncate text-xs font-medium text-blue-700">
              {factorVersionLabel}
            </div>
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
            <div className="text-xs text-green-700">รวม VAT {vatPercent.toFixed(2)}%</div>
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
          <AlertDescription className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">
              {factorVersionStatus} (ค่างาน {costInMillion <= 5 ? '≤ 5' : '> 5'} ล้านบาท):
            </span>
            <span className="text-lg font-bold text-yellow-700">{factor.toFixed(4)}</span>
          </AlertDescription>
        </Alert>

        {/* Routes Breakdown with Factor F */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">ราคาแยกรายเส้นทาง (คูณ Factor F):</div>
          {routes.map((route, index) => {
            const routeWithFactorF = roundMoney(multiplyFactor(route.total_cost, factor));
            const { total: routeWithVAT } = calculateVAT(routeWithFactorF, vatRate);
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
                      <span className="text-muted-foreground">
                        รวม VAT {vatPercent.toFixed(2)}%:
                      </span>
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
              <div className="text-sm text-green-600">
                รวมทั้งสิ้น (VAT {vatPercent.toFixed(2)}%)
              </div>
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
