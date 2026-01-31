'use client';

import { PriceListItem } from '@/lib/supabase';
import ItemSearch from './ItemSearch';
import { QuantityEditor } from './QuantityEditor';
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

      {/* Items Table - table-fixed allows text wrap in รายการ column */}
      <div className="border rounded-lg overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center w-8">ลำดับ</TableHead>
              <TableHead className="w-auto">รายการ</TableHead>
              <TableHead className="text-center w-28">ปริมาณ</TableHead>
              <TableHead className="text-center w-10">หน่วย</TableHead>
              <TableHead className="text-right w-24 hidden xl:table-cell">ค่าวัสดุ/หน่วย</TableHead>
              <TableHead className="text-right w-20 hidden xl:table-cell">ค่าแรง/หน่วย</TableHead>
              <TableHead className="text-right w-24 hidden xl:table-cell">รวมค่าวัสดุ</TableHead>
              <TableHead className="text-right w-20 hidden xl:table-cell">รวมค่าแรง</TableHead>
              <TableHead className="text-right w-24">รวม</TableHead>
              <TableHead className="text-center w-8">ลบ</TableHead>
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
                  <TableCell className="text-center text-sm">{index + 1}</TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="text-sm break-words">{item.item_name}</div>
                    {item.remarks && (
                      <div className="text-xs text-muted-foreground break-words">{item.remarks}</div>
                    )}
                  </TableCell>
                  <TableCell className="p-1">
                    <QuantityEditor
                      value={item.quantity ?? 0}
                      step={1}
                      onChange={(v) => onUpdateQuantity(item.id, v)}
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.unit}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums hidden xl:table-cell">
                    {formatNumber(item.material_cost_per_unit)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums hidden xl:table-cell">
                    {formatNumber(item.labor_cost_per_unit)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums hidden xl:table-cell">
                    {formatNumber(item.total_material_cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums hidden xl:table-cell">
                    {formatNumber(item.total_labor_cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-primary tabular-nums">
                    {formatNumber(item.total_cost)}
                  </TableCell>
                  <TableCell className="text-center p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
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
