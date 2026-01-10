'use client';

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
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">จำนวนรายการ</p>
          <p className="text-2xl font-bold text-gray-800">{itemCount}</p>
          <p className="text-sm text-gray-500">รายการ</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">รวมค่าวัสดุ</p>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(totalMaterialCost)}
          </p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">รวมค่าแรง</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatNumber(totalLaborCost)}
          </p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-500">
          <p className="text-sm text-gray-500">รวมทั้งสิ้น</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(totalCost)}
          </p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>
      </div>
    </div>
  );
}

