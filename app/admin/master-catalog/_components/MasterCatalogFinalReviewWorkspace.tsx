'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [50, 100] as const;
const FILTERABLE_CHANGE_TYPES: CatalogFinalChangeType[] = [
  'added',
  'recoded',
  'details',
  'price',
  'category',
  'status',
  'order',
];
type ReviewChangeFilter = 'all' | CatalogFinalChangeType;
type ReviewPageSize = (typeof PAGE_SIZE_OPTIONS)[number];
type SummaryKey =
  | 'affectedItemCount'
  | 'addedCount'
  | 'recodedCount'
  | 'detailsCount'
  | 'priceCount'
  | 'categoryCount'
  | 'statusCount'
  | 'orderCount';

const SUMMARY_FILTERS: Array<{
  changeType: ReviewChangeFilter;
  label: string;
  summaryKey: SummaryKey;
}> = [
  { changeType: 'all', label: 'รายการที่ได้รับผล', summaryKey: 'affectedItemCount' },
  { changeType: 'added', label: 'เพิ่มใหม่', summaryKey: 'addedCount' },
  { changeType: 'recoded', label: 'เปลี่ยนรหัส', summaryKey: 'recodedCount' },
  { changeType: 'details', label: 'ชื่อหรือหน่วย', summaryKey: 'detailsCount' },
  { changeType: 'price', label: 'ราคา', summaryKey: 'priceCount' },
  { changeType: 'category', label: 'หมวดงาน', summaryKey: 'categoryCount' },
  { changeType: 'status', label: 'สถานะใช้งาน', summaryKey: 'statusCount' },
  { changeType: 'order', label: 'ลำดับ', summaryKey: 'orderCount' },
];

export function MasterCatalogFinalReviewWorkspace({
  versionId,
  baseVersionString,
  reviewedVersionLabel,
  diff,
  reviewLockVersion,
  editable,
}: {
  versionId: string;
  baseVersionString: string;
  reviewedVersionLabel: string;
  diff: CatalogFinalSnapshotDiff;
  reviewLockVersion: number | null;
  editable: boolean;
}) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('reviewType');
  const initialPage = Number(searchParams.get('reviewPage'));
  const initialPageSize = Number(searchParams.get('reviewPageSize'));
  const [query, setQuery] = useState(searchParams.get('reviewQ') ?? '');
  const [changeType, setChangeType] = useState<ReviewChangeFilter>(
    initialType && FILTERABLE_CHANGE_TYPES.includes(initialType as CatalogFinalChangeType)
      ? initialType as CatalogFinalChangeType
      : 'all',
  );
  const [showUnchanged, setShowUnchanged] = useState(
    searchParams.get('reviewUnchanged') === '1',
  );
  const [pageSize, setPageSize] = useState<ReviewPageSize>(
    isReviewPageSize(initialPageSize) ? initialPageSize : PAGE_SIZE_OPTIONS[0],
  );
  const [page, setPage] = useState(
    Number.isInteger(initialPage) && initialPage > 0 ? initialPage - 1 : 0,
  );
  const [expandedIdentityIds, setExpandedIdentityIds] = useState<Set<string>>(
    () => new Set(),
  );
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase('th-TH');

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

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = filteredRows.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );
  const compoundRows = visibleRows.filter((row) => row.fields.length > 1);
  const allCompoundRowsExpanded = compoundRows.length > 0
    && compoundRows.every((row) => expandedIdentityIds.has(row.identityId));
  const visibleStart = filteredRows.length === 0 ? 0 : (safePage * pageSize) + 1;
  const visibleEnd = Math.min((safePage + 1) * pageSize, filteredRows.length);

  function selectSummaryFilter(nextType: ReviewChangeFilter) {
    setChangeType(nextType);
    setShowUnchanged(false);
    setPage(0);
  }

  function toggleExpandedRow(identityId: string) {
    setExpandedIdentityIds((current) => {
      const next = new Set(current);
      if (next.has(identityId)) next.delete(identityId);
      else next.add(identityId);
      return next;
    });
  }

  function toggleAllCompoundRows() {
    setExpandedIdentityIds((current) => {
      const next = new Set(current);
      for (const row of compoundRows) {
        if (allCompoundRowsExpanded) next.delete(row.identityId);
        else next.add(row.identityId);
      }
      return next;
    });
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>
          {editable ? 'ผลเปรียบเทียบฉบับสุดท้าย' : 'ผลเปรียบเทียบที่บันทึกไว้'}
        </CardTitle>
        <CardDescription>
          เปรียบเทียบ {reviewedVersionLabel} กับเวอร์ชันฐาน {baseVersionString}{' '}
          จากข้อมูลครบ {diff.summary.draftItemCount.toLocaleString('th-TH')} รายการ
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY_FILTERS.map((summaryFilter) => (
            <SummaryValue
              key={summaryFilter.changeType}
              active={!showUnchanged && changeType === summaryFilter.changeType}
              label={summaryFilter.label}
              value={diff.summary[summaryFilter.summaryKey]}
              onSelect={() => selectSummaryFilter(summaryFilter.changeType)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          รายการเดียวอาจอยู่ได้มากกว่าหนึ่งประเภท ยอดแต่ละประเภทจึงอาจซ้ำกัน
        </p>

        {diff.summary.authoritySensitiveCount > 0 ? (
          <Alert>
            <AlertTitle>มีรายการที่ต้องตรวจหลักฐานชื่อ หน่วย หรือราคา</AlertTitle>
            <AlertDescription>
              พบ {diff.summary.authoritySensitiveCount.toLocaleString('th-TH')} รายการ
              ที่เพิ่มใหม่หรือเปลี่ยนชื่อ หน่วย หรือราคา{' '}
              {baseVersionString === '2568.0.0'
                ? 'สำหรับการปรับจากบัญชีฐานนี้ ให้ยึดข้อมูล Production 2568.0.0 และเอกสารอนุมัติที่เกี่ยวข้อง'
                : `ให้ตรวจเทียบเวอร์ชันฐาน ${baseVersionString} และเอกสารอนุมัติของการเปลี่ยนแปลงครั้งนี้`}
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
                const nextType = value as ReviewChangeFilter;
                setChangeType(nextType);
                if (nextType !== 'all') setShowUnchanged(false);
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
                if (checked) setChangeType('all');
                setPage(0);
              }}
            />
            <Label htmlFor="show-unchanged-items" className="whitespace-nowrap">
              แสดงรายการเดิม
            </Label>
          </div>
        </div>

        {compoundRows.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              หน้านี้มี {compoundRows.length.toLocaleString('th-TH')} รายการที่เปลี่ยนหลายค่า
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAllCompoundRows}
            >
              {allCompoundRowsExpanded ? <ChevronUp /> : <ChevronDown />}
              {allCompoundRowsExpanded
                ? 'ย่อรายละเอียดทั้งหมดในหน้านี้'
                : 'ขยายรายละเอียดทั้งหมดในหน้านี้'}
            </Button>
          </div>
        ) : null}

        <div className="hidden overflow-x-auto lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">รหัส</TableHead>
                <TableHead className="min-w-72">รายการ</TableHead>
                <TableHead className="min-w-52">ประเภท</TableHead>
                <TableHead className="min-w-[360px]">ค่าที่เปลี่ยน</TableHead>
                <TableHead className="w-24 text-right">
                  {editable ? 'แก้ไข' : 'ดู'}
                </TableHead>
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
                      <ChangeTypeBadges changeTypes={row.changeTypes} />
                    </TableCell>
                    <TableCell>
                      <ReviewFieldDifferences
                        identityId={row.identityId}
                        fields={row.fields}
                        expanded={expandedIdentityIds.has(row.identityId)}
                        surface="desktop"
                        onToggle={() => toggleExpandedRow(row.identityId)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {row.draftItem ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={itemHref({
                            versionId,
                            identityId: row.identityId,
                            reviewLockVersion,
                            query,
                            changeType,
                            showUnchanged,
                            page: safePage,
                            pageSize,
                          })}>
                            {editable ? 'เปิดแก้ไข' : 'เปิดดู'}
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

        <div className="divide-y rounded-md border lg:hidden">
          {visibleRows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              ไม่พบรายการตามเงื่อนไข
            </div>
          ) : visibleRows.map((row) => {
            const item = row.draftItem ?? row.baseItem;
            return (
              <article key={row.identityId} className="grid gap-3 p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs">{item?.itemCode ?? '-'}</div>
                    <div className="mt-1 break-words font-medium">{item?.itemName ?? '-'}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      หมวด {item?.categoryCode ?? '-'} · ลำดับ {(item?.displayOrder ?? -1) + 1}
                    </div>
                  </div>
                  {row.draftItem ? (
                    <Button variant="outline" size="sm" className="min-h-11" asChild>
                      <Link href={itemHref({
                        versionId,
                        identityId: row.identityId,
                        reviewLockVersion,
                        query,
                        changeType,
                        showUnchanged,
                        page: safePage,
                        pageSize,
                      })}>
                        {editable ? 'เปิดแก้ไข' : 'เปิดดู'}
                      </Link>
                    </Button>
                  ) : null}
                </div>
                <ChangeTypeBadges changeTypes={row.changeTypes} />
                <ReviewFieldDifferences
                  identityId={row.identityId}
                  fields={row.fields}
                  expanded={expandedIdentityIds.has(row.identityId)}
                  surface="mobile"
                  onToggle={() => toggleExpandedRow(row.identityId)}
                />
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <p className="text-sm text-muted-foreground">
            แสดง {visibleStart.toLocaleString('th-TH')}–{visibleEnd.toLocaleString('th-TH')}{' '}
            จาก {filteredRows.length.toLocaleString('th-TH')} รายการ
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="final-review-page-size" className="whitespace-nowrap text-sm">
                ต่อหน้า
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value) as ReviewPageSize);
                  setPage(0);
                }}
              >
                <SelectTrigger id="final-review-page-size" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option.toLocaleString('th-TH')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 sm:size-9"
              title="หน้าก่อน"
              aria-label="หน้าก่อน"
              disabled={safePage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft />
            </Button>
            <Label htmlFor="final-review-page" className="sr-only">ไปยังหน้า</Label>
            <Select value={String(safePage)} onValueChange={(value) => setPage(Number(value))}>
              <SelectTrigger id="final-review-page" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.from({ length: pageCount }, (_, pageIndex) => (
                    <SelectItem key={pageIndex} value={String(pageIndex)}>
                      หน้า {(pageIndex + 1).toLocaleString('th-TH')} / {pageCount.toLocaleString('th-TH')}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 sm:size-9"
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

function SummaryValue({
  active,
  label,
  value,
  onSelect,
}: {
  active: boolean;
  label: string;
  value: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'min-w-0 rounded-md border bg-background px-4 py-3 text-left transition-colors',
        'outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        active && 'border-primary bg-primary/5 ring-1 ring-primary/20',
      )}
      onClick={onSelect}
    >
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">
        {value.toLocaleString('th-TH')}
      </div>
    </button>
  );
}

function ChangeTypeBadges({ changeTypes }: { changeTypes: CatalogFinalChangeType[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {changeTypes.map((type) => (
        <Badge key={type} variant={type === 'unchanged' ? 'outline' : 'secondary'}>
          {changeTypeLabel(type)}
        </Badge>
      ))}
    </div>
  );
}

function ReviewFieldDifferences({
  identityId,
  fields,
  expanded,
  surface,
  onToggle,
}: {
  identityId: string;
  fields: CatalogFieldDifference[];
  expanded: boolean;
  surface: 'desktop' | 'mobile';
  onToggle: () => void;
}) {
  if (fields.length <= 1) return <FieldDifferences fields={fields} />;

  const detailId = `${surface}-review-fields-${identityId}`;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            เปลี่ยน {fields.length.toLocaleString('th-TH')} ค่า
          </div>
          <div className="mt-1 break-words text-xs text-muted-foreground">
            {fields.map((field) => fieldLabel(field.field)).join(' · ')}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={surface === 'mobile' ? 'min-h-11' : undefined}
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={onToggle}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
          {expanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียด'}
        </Button>
      </div>
      {expanded ? (
        <div id={detailId} className="border-t pt-2">
          <FieldDifferences fields={fields} />
        </div>
      ) : null}
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
              ค่าจากฐาน: {formatFieldValue(field)}
            </span>
            <span className="break-words font-medium">
              ค่าของฉบับนี้: {formatFieldValue(field, true)}
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
    missing: 'ไม่พบในฉบับนี้',
    unchanged: 'รายการเดิม',
  } as Record<CatalogFinalChangeType, string>)[type];
}

function itemHref({
  versionId,
  identityId,
  reviewLockVersion,
  query,
  changeType,
  showUnchanged,
  page,
  pageSize,
}: {
  versionId: string;
  identityId: string;
  reviewLockVersion: number | null;
  query: string;
  changeType: ReviewChangeFilter;
  showUnchanged: boolean;
  page: number;
  pageSize: ReviewPageSize;
}) {
  const returnParams = new URLSearchParams();
  if (reviewLockVersion !== null) {
    returnParams.set('reviewLock', String(reviewLockVersion));
  }
  if (query.trim()) returnParams.set('reviewQ', query.trim());
  if (changeType !== 'all') returnParams.set('reviewType', changeType);
  if (showUnchanged) returnParams.set('reviewUnchanged', '1');
  if (pageSize !== PAGE_SIZE_OPTIONS[0]) returnParams.set('reviewPageSize', String(pageSize));
  if (page > 0) returnParams.set('reviewPage', String(page + 1));
  const returnQuery = returnParams.toString();
  const returnTo = `/admin/master-catalog/versions/${versionId}/review${returnQuery ? `?${returnQuery}` : ''}`;
  return `/admin/master-catalog/versions/${versionId}/items/${identityId}?returnTo=${encodeURIComponent(returnTo)}`;
}

function isReviewPageSize(value: number): value is ReviewPageSize {
  return PAGE_SIZE_OPTIONS.some((option) => option === value);
}
