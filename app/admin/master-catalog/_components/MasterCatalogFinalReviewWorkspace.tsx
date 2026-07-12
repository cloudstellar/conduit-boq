'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type {
  CatalogDiffField,
  CatalogFieldDifference,
  CatalogFinalChangeType,
  CatalogFinalSnapshotDiff,
} from '@/lib/master-catalog/admin/catalogDiff';

const PAGE_SIZE = 50;
const FILTERABLE_CHANGE_TYPES: CatalogFinalChangeType[] = [
  'added',
  'recoded',
  'details',
  'price',
  'category',
  'status',
  'order',
];

export function MasterCatalogFinalReviewWorkspace({
  versionId,
  baseVersionString,
  draftVersionString,
  diff,
}: {
  versionId: string;
  baseVersionString: string;
  draftVersionString: string;
  diff: CatalogFinalSnapshotDiff;
}) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('reviewType');
  const initialPage = Number(searchParams.get('reviewPage'));
  const [query, setQuery] = useState(searchParams.get('reviewQ') ?? '');
  const [changeType, setChangeType] = useState(
    initialType && FILTERABLE_CHANGE_TYPES.includes(initialType as CatalogFinalChangeType)
      ? initialType
      : 'all',
  );
  const [showUnchanged, setShowUnchanged] = useState(
    searchParams.get('reviewUnchanged') === '1',
  );
  const [page, setPage] = useState(
    Number.isInteger(initialPage) && initialPage > 0 ? initialPage - 1 : 0,
  );
  const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');

  const filteredRows = useMemo(() => diff.rows.filter((row) => {
    if (!showUnchanged && row.changeTypes.includes('unchanged')) return false;
    if (changeType !== 'all' && !row.changeTypes.includes(changeType as CatalogFinalChangeType)) {
      return false;
    }

    if (!normalizedQuery) return true;
    const item = row.draftItem ?? row.baseItem;
    return [item?.itemCode, item?.itemName, item?.categoryCode]
      .some((value) => value?.toLocaleLowerCase('th-TH').includes(normalizedQuery));
  }), [changeType, diff.rows, normalizedQuery, showUnchanged]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = filteredRows.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>ผลเปรียบเทียบฉบับสุดท้าย</CardTitle>
        <CardDescription>
          เปรียบเทียบฉบับร่าง {draftVersionString} กับเวอร์ชันฐาน {baseVersionString}{' '}
          จากข้อมูลครบ {diff.summary.draftItemCount.toLocaleString('th-TH')} รายการ
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryValue label="รายการที่ได้รับผล" value={diff.summary.affectedItemCount} />
          <SummaryValue label="เพิ่มใหม่" value={diff.summary.addedCount} />
          <SummaryValue label="เปลี่ยนรหัส" value={diff.summary.recodedCount} />
          <SummaryValue label="ชื่อหรือหน่วย" value={diff.summary.detailsCount} />
          <SummaryValue label="ราคา" value={diff.summary.priceCount} />
          <SummaryValue label="หมวดงาน" value={diff.summary.categoryCount} />
          <SummaryValue label="สถานะใช้งาน" value={diff.summary.statusCount} />
          <SummaryValue label="ลำดับ" value={diff.summary.orderCount} />
        </div>

        {diff.summary.authoritySensitiveCount > 0 ? (
          <Alert>
            <AlertTitle>มีรายการที่ต้องตรวจหลักฐานชื่อ หน่วย หรือราคา</AlertTitle>
            <AlertDescription>
              พบ {diff.summary.authoritySensitiveCount.toLocaleString('th-TH')} รายการ
              ที่เพิ่มใหม่หรือเปลี่ยนชื่อ หน่วย หรือราคา ซึ่ง Production 2568.0.0 เป็นแหล่งอ้างอิงหลัก
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_auto] lg:items-end">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="ค้นหาในผลเปรียบเทียบ"
              className="pl-9"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="ค้นหารหัส ชื่อ หรือหมวดงาน"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="final-review-change-type">ประเภทการเปลี่ยนแปลง</Label>
            <Select
              value={changeType}
              onValueChange={(value) => {
                setChangeType(value);
                setPage(0);
              }}
            >
              <SelectTrigger id="final-review-change-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  {FILTERABLE_CHANGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{changeTypeLabel(type)}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-10 items-center gap-3 rounded-md border px-3">
            <Switch
              id="show-unchanged-items"
              checked={showUnchanged}
              onCheckedChange={(checked) => {
                setShowUnchanged(checked);
                setPage(0);
              }}
            />
            <Label htmlFor="show-unchanged-items" className="whitespace-nowrap">
              แสดงรายการเดิม
            </Label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">รหัส</TableHead>
                <TableHead className="min-w-72">รายการ</TableHead>
                <TableHead className="min-w-52">ประเภท</TableHead>
                <TableHead className="min-w-[360px]">ค่าที่เปลี่ยน</TableHead>
                <TableHead className="w-24 text-right">แก้ไข</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    ไม่พบรายการตามเงื่อนไข
                  </TableCell>
                </TableRow>
              ) : visibleRows.map((row) => {
                const item = row.draftItem ?? row.baseItem;
                return (
                  <TableRow key={row.identityId}>
                    <TableCell className="font-mono text-xs">{item?.itemCode ?? '-'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item?.itemName ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        หมวด {item?.categoryCode ?? '-'} · ลำดับ {(item?.displayOrder ?? -1) + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.changeTypes.map((type) => (
                          <Badge key={type} variant={type === 'unchanged' ? 'outline' : 'secondary'}>
                            {changeTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <FieldDifferences fields={row.fields} />
                    </TableCell>
                    <TableCell className="text-right">
                      {row.draftItem ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={itemHref({
                            versionId,
                            identityId: row.identityId,
                            query,
                            changeType,
                            showUnchanged,
                            page: safePage,
                          })}>
                            เปิด
                          </Link>
                        </Button>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            พบ {filteredRows.length.toLocaleString('th-TH')} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="หน้าก่อน"
              aria-label="หน้าก่อน"
              disabled={safePage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-24 text-center text-sm tabular-nums">
              หน้า {(safePage + 1).toLocaleString('th-TH')} / {pageCount.toLocaleString('th-TH')}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="หน้าถัดไป"
              aria-label="หน้าถัดไป"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-md border bg-background px-4 py-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">
        {value.toLocaleString('th-TH')}
      </div>
    </div>
  );
}

function FieldDifferences({ fields }: { fields: CatalogFieldDifference[] }) {
  if (fields.length === 0) {
    return <span className="text-sm text-muted-foreground">ไม่มีค่าที่เปลี่ยนในสภาพสุดท้าย</span>;
  }

  return (
    <div className="grid gap-2">
      {fields.map((field) => (
        <div key={field.field} className="grid gap-1 border-b pb-2 last:border-b-0 last:pb-0">
          <div className="text-xs font-medium">{fieldLabel(field.field)}</div>
          <div className="grid gap-1 text-xs sm:grid-cols-2">
            <span className="break-words text-muted-foreground">
              ค่าปัจจุบัน: {formatFieldValue(field)}
            </span>
            <span className="break-words font-medium">
              ค่าฉบับร่าง: {formatFieldValue(field, true)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatFieldValue(field: CatalogFieldDifference, draft = false) {
  const value = draft ? field.draftValue : field.baseValue;
  if (value == null) return '-';
  if (field.field === 'isActive') return value ? 'ใช้งาน' : 'ยกเลิกใช้';
  if (field.field === 'displayOrder') return (Number(value) + 1).toLocaleString('th-TH');
  if (field.field === 'materialCost' || field.field === 'laborCost' || field.field === 'unitCost') {
    return Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value);
}

function fieldLabel(field: CatalogDiffField) {
  return ({
    itemCode: 'รหัสรายการ',
    itemName: 'ชื่อรายการ',
    unit: 'หน่วยนับ',
    materialCost: 'ค่าวัสดุ',
    laborCost: 'ค่าแรง',
    unitCost: 'ราคาต่อหน่วย',
    categoryCode: 'หมวดงาน',
    isActive: 'สถานะใช้งาน',
    displayOrder: 'ลำดับรายการ',
  } as Record<CatalogDiffField, string>)[field];
}

function changeTypeLabel(type: CatalogFinalChangeType) {
  return ({
    added: 'เพิ่มใหม่',
    recoded: 'เปลี่ยนรหัส',
    details: 'ชื่อหรือหน่วย',
    price: 'ราคา',
    category: 'หมวดงาน',
    status: 'สถานะ',
    order: 'ลำดับ',
    missing: 'ขาดจากฉบับร่าง',
    unchanged: 'รายการเดิม',
  } as Record<CatalogFinalChangeType, string>)[type];
}

function itemHref({
  versionId,
  identityId,
  query,
  changeType,
  showUnchanged,
  page,
}: {
  versionId: string;
  identityId: string;
  query: string;
  changeType: string;
  showUnchanged: boolean;
  page: number;
}) {
  const returnParams = new URLSearchParams();
  if (query.trim()) returnParams.set('reviewQ', query.trim());
  if (changeType !== 'all') returnParams.set('reviewType', changeType);
  if (showUnchanged) returnParams.set('reviewUnchanged', '1');
  if (page > 0) returnParams.set('reviewPage', String(page + 1));
  const returnQuery = returnParams.toString();
  const returnTo = `/admin/master-catalog/versions/${versionId}/review${returnQuery ? `?${returnQuery}` : ''}`;
  return `/admin/master-catalog/versions/${versionId}/items/${identityId}?returnTo=${encodeURIComponent(returnTo)}`;
}
