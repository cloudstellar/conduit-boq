'use client';

import { PriceListItem } from '@/lib/supabase';
import ItemSearch from './ItemSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

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
      <div className="mb-4 space-y-2">
        <Label>เพิ่มรายการ</Label>
        <ItemSearch
          onSelect={onAddItem}
          placeholder="พิมพ์เพื่อค้นหารายการจากบัญชีราคามาตรฐาน..."
        />
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center w-12">ลำดับ</TableHead>
              <TableHead className="min-w-[300px]">รายการ</TableHead>
              <TableHead className="text-center w-24">ปริมาณ</TableHead>
              <TableHead className="text-center w-16">หน่วย</TableHead>
              <TableHead className="text-right w-28">ค่าวัสดุ/หน่วย</TableHead>
              <TableHead className="text-right w-28">ค่าแรง/หน่วย</TableHead>
              <TableHead className="text-right w-32">รวมค่าวัสดุ</TableHead>
              <TableHead className="text-right w-32">รวมค่าแรง</TableHead>
              <TableHead className="text-right w-32">รวมทั้งสิ้น</TableHead>
              <TableHead className="text-center w-16">ลบ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีรายการ - ใช้ช่องค้นหาด้านบนเพื่อเพิ่มรายการ
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div className="text-sm">{item.item_name}</div>
                    {item.remarks && (
                      <div className="text-xs text-muted-foreground">{item.remarks}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.unit}</TableCell>
                  <TableCell className="text-right text-sm">
                    {formatNumber(item.material_cost_per_unit)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatNumber(item.labor_cost_per_unit)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatNumber(item.total_material_cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatNumber(item.total_labor_cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-blue-600">
                    {formatNumber(item.total_cost)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
