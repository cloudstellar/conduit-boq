'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calculator, Loader2 } from 'lucide-react';

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
  /** Callback to pass calculated factor values up for snapshot saving */
  onFactorCalculated?: (data: {
    factor: number;
    totalWithFactor: number;
    totalWithVAT: number;
  }) => void;
}

export default function FactorFSummary({ routes, grandTotalCost, onFactorCalculated }: FactorFSummaryProps) {
  const supabase = useMemo(() => createClient(), []);
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
  }, [grandTotalCost, supabase]);

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

  // Calculate factor and derived values (must be before any early return for hooks rules)
  const factor = calculateInterpolatedFactor();
  const costInMillion = grandTotalCost / 1000000;
  const totalWithFactor = grandTotalCost * factor;
  const totalWithVAT = totalWithFactor * (1 + VAT_RATE);

  // Call callback when factor values change (for snapshot saving)
  // Must be before early returns to comply with React hooks rules
  useEffect(() => {
    if (onFactorCalculated && !isLoading && grandTotalCost > 0) {
      onFactorCalculated({
        factor,
        totalWithFactor,
        totalWithVAT,
      });
    }
  }, [factor, totalWithFactor, totalWithVAT, onFactorCalculated, isLoading, grandTotalCost]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
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
            const routeWithFactorF = route.total_cost * factor;
            const routeWithVAT = routeWithFactorF * (1 + VAT_RATE);
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
              <div className="text-xl font-bold text-blue-700">{formatNumber(grandTotalCost * factor)}</div>
              <div className="text-xs text-blue-500">บาท (ก่อน VAT)</div>
            </CardContent>
          </Card>
          <Card className="bg-green-100 border-2 border-green-400">
            <CardContent className="p-4">
              <div className="text-sm text-green-600">รวมทั้งสิ้น (VAT 7%)</div>
              <div className="text-xl font-bold text-green-700">
                {formatNumber(grandTotalCost * factor * (1 + VAT_RATE))}
              </div>
              <div className="text-xs text-green-500">บาท</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
