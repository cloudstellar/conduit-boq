'use client';

import { PriceListItem } from '@/lib/supabase';
import ItemSearch from './ItemSearch';

export interface LineItem {
  id: string;
  item_order: number;
  price_list_id: string | null;
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

interface LineItemsTableProps {
  items: LineItem[];
  onAddItem: (priceItem: PriceListItem) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function LineItemsTable({
  items,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}: LineItemsTableProps) {
  const formatNumber = (num: number) => num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
        รายการประมาณราคา
      </h2>

      {/* Search to add new item */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เพิ่มรายการ
        </label>
        <ItemSearch
          onSelect={onAddItem}
          placeholder="พิมพ์เพื่อค้นหารายการจากบัญชีราคามาตรฐาน..."
        />
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-center w-12">ลำดับ</th>
              <th className="border border-gray-300 px-2 py-2 text-left min-w-[300px]">รายการ</th>
              <th className="border border-gray-300 px-2 py-2 text-center w-24">ปริมาณ</th>
              <th className="border border-gray-300 px-2 py-2 text-center w-16">หน่วย</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-28">ค่าวัสดุ/หน่วย</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-28">ค่าแรง/หน่วย</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-32">รวมค่าวัสดุ</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-32">รวมค่าแรง</th>
              <th className="border border-gray-300 px-2 py-2 text-right w-32">รวมทั้งสิ้น</th>
              <th className="border border-gray-300 px-2 py-2 text-center w-16">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  ยังไม่มีรายการ - ใช้ช่องค้นหาด้านบนเพื่อเพิ่มรายการ
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="text-sm">{item.item_name}</div>
                    {item.remarks && (
                      <div className="text-xs text-gray-500">{item.remarks}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center text-sm">{item.unit}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-sm">
                    {formatNumber(item.material_cost_per_unit)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-sm">
                    {formatNumber(item.labor_cost_per_unit)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-sm font-medium">
                    {formatNumber(item.total_material_cost)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-sm font-medium">
                    {formatNumber(item.total_labor_cost)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right text-sm font-bold text-blue-600">
                    {formatNumber(item.total_cost)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="ลบรายการ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

