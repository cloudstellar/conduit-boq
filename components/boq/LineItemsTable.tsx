'use client';

import { Fragment } from 'react';

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

      {/* Items Table - 2-row pattern: row1=name, row2=data */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center w-8 sticky left-0 bg-muted/50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">#</TableHead>
              <TableHead className="text-center">ปริมาณ</TableHead>
              <TableHead className="text-center w-12">หน่วย</TableHead>
              <TableHead className="text-right whitespace-nowrap">ค่าวัสดุ/หน่วย</TableHead>
              <TableHead className="text-right whitespace-nowrap">ค่าแรง/หน่วย</TableHead>
              <TableHead className="text-right whitespace-nowrap">รวมค่าวัสดุ</TableHead>
              <TableHead className="text-right whitespace-nowrap">รวมค่าแรง</TableHead>
              <TableHead className="text-right whitespace-nowrap">รวมทั้งสิ้น</TableHead>
              <TableHead className="text-center w-10">ลบ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีรายการ - ใช้ช่องค้นหาด้านบนเพื่อเพิ่มรายการ
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <Fragment key={item.id}>
                  {/* Row 1: Item name (full width) */}
                  <TableRow key={`${item.id}-name`} className="bg-accent/30 border-b-0">
                    <TableCell className="text-center text-sm font-medium text-muted-foreground py-2 sticky left-0 bg-accent/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {index + 1}
                    </TableCell>
                    <TableCell colSpan={8} className="py-2">
                      <div className="text-sm font-medium line-clamp-2" title={item.item_name}>
                        {item.item_name}
                      </div>
                      {item.remarks && (
                        <div className="text-xs text-muted-foreground mt-0.5">{item.remarks}</div>
                      )}
                    </TableCell>
                  </TableRow>
                  {/* Row 2: Data columns */}
                  <TableRow key={`${item.id}-data`}>
                    <TableCell className="sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" />
                    <TableCell className="p-1">
                      <QuantityEditor
                        value={item.quantity ?? 0}
                        step={1}
                        onChange={(v) => onUpdateQuantity(item.id, v)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm">{item.unit}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums whitespace-nowrap">
                      {formatNumber(item.material_cost_per_unit)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums whitespace-nowrap">
                      {formatNumber(item.labor_cost_per_unit)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums whitespace-nowrap">
                      {formatNumber(item.total_material_cost)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums whitespace-nowrap">
                      {formatNumber(item.total_labor_cost)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary tabular-nums whitespace-nowrap">
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
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
