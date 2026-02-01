'use client';

import { Card, CardContent } from '@/components/ui/card';

interface TotalsSummaryProps {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalCost: number;
  itemCount: number;
}

export default function TotalsSummary({
  totalMaterialCost,
  totalLaborCost,
  totalCost,
  itemCount,
}: TotalsSummaryProps) {
  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">สรุปยอดรวม</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">จำนวนรายการ</p>
            <p className="text-2xl font-bold">{itemCount}</p>
            <p className="text-sm text-muted-foreground">รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">รวมค่าวัสดุ</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(totalMaterialCost)}
            </p>
            <p className="text-sm text-muted-foreground">บาท</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">รวมค่าแรง</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(totalLaborCost)}
            </p>
            <p className="text-sm text-muted-foreground">บาท</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">รวมทั้งสิ้น</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(totalCost)}
            </p>
            <p className="text-sm text-muted-foreground">บาท</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
