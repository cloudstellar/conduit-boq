'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type {
  CatalogCategoryOption,
  CatalogCodeGroupOption,
  CatalogWorkspaceItem,
} from '@/lib/master-catalog/admin/catalogWorkspace';
import type { CatalogMutationState } from '@/lib/master-catalog/admin/actionModel';
import {
  normalizeCatalogMoneyInput,
  sumCatalogMoneyInputs,
} from '@/lib/master-catalog/admin/money';
import { catalogWithdrawnItemCode } from '@/lib/master-catalog/admin/navigation';
import { formatCatalogDictionaryLabel } from '@/lib/master-catalog/admin/presentation';
import { applyCatalogManualChangeAction } from '../actions';
import { CatalogMoneyInput } from './CatalogMoneyInput';
import { CatalogUnitInput } from './CatalogUnitInput';
import { useStableCatalogOperation } from './useStableCatalogOperation';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';

const PAGE_SIZE = 50;
const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogVersionWorkspace({
  version,
  items,
  totalItems,
  categories,
  codeGroups,
  editable,
  allowAdd,
}: {
  version: { id: string; lockVersion: number };
  items: CatalogWorkspaceItem[];
  totalItems: number;
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  editable: boolean;
  allowAdd: boolean;
}) {
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get('category');
  const initialCodeGroupId = searchParams.get('group');
  const initialStatus = searchParams.get('status');
  const initialPage = Number(searchParams.get('page'));
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(
    initialStatus === 'active' || initialStatus === 'inactive' ? initialStatus : 'all',
  );
  const [categoryId, setCategoryId] = useState(
    initialCategoryId && categories.some((category) => category.id === initialCategoryId)
      ? initialCategoryId
      : 'all',
  );
  const [codeGroupId, setCodeGroupId] = useState(
    initialCodeGroupId && codeGroups.some((group) => group.id === initialCodeGroupId)
      ? initialCodeGroupId
      : 'all',
  );
  const [page, setPage] = useState(
    Number.isInteger(initialPage) && initialPage > 0 ? initialPage - 1 : 0,
  );
  const groupById = useMemo(
    () => new Map(codeGroups.map((group) => [group.id, group])),
    [codeGroups],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');
  const filtered = useMemo(() => items.filter((item) => {
    if (status === 'active' && !item.isActive) return false;
    if (status === 'inactive' && item.isActive) return false;
    if (categoryId !== 'all' && item.categoryId !== categoryId) return false;
    if (codeGroupId !== 'all' && item.codeGroupId !== codeGroupId) return false;
    if (!normalizedQuery) return true;

    const group = item.codeGroupId ? groupById.get(item.codeGroupId) : null;
    return [
      item.itemCode,
      item.itemName,
      item.categoryCode,
      group?.workContextNameTh,
      group?.itemTypeNameTh,
    ].some((value) => value?.toLocaleLowerCase('th-TH').includes(normalizedQuery));
  }), [categoryId, codeGroupId, groupById, items, normalizedQuery, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const unitOptions = useMemo(
    () => [...new Set(items.map((item) => item.unit.trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, 'th-TH')),
    [items],
  );
  const withdrawnItemCode = catalogWithdrawnItemCode(
    searchParams.get('notice'),
    searchParams.get('itemCode'),
  );

  return (
    <>
      {withdrawnItemCode ? (
        <Alert aria-live="polite">
          <CheckCircle2 />
          <AlertTitle>ถอนรายการใหม่ออกจากฉบับร่างแล้ว</AlertTitle>
          <AlertDescription>
            ถอน {withdrawnItemCode} ออกจากรายการในฉบับร่างแล้ว ระบบยังเก็บรหัสที่สงวนและประวัติไว้ตรวจสอบย้อนหลัง
          </AlertDescription>
        </Alert>
      ) : null}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>รายการในบัญชีราคา</CardTitle>
          <CardDescription>
            โหลดครบ {items.length.toLocaleString('th-TH')} จาก {totalItems.toLocaleString('th-TH')} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_220px_260px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="ค้นหารายการ"
                className="pl-9"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
                placeholder="ค้นหารหัส ชื่อ หมวด หรือกลุ่ม"
              />
            </div>
            <FilterSelect
              label="สถานะ"
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(0);
              }}
              options={[
                { value: 'all', label: 'ทุกสถานะ' },
                { value: 'active', label: 'ใช้งาน' },
                { value: 'inactive', label: 'ยกเลิกใช้' },
              ]}
            />
            <FilterSelect
              label="หมวดงาน"
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setPage(0);
              }}
              options={[
                { value: 'all', label: 'ทุกหมวด' },
                ...categories.map((category) => ({
                  value: category.id,
                  label: formatCatalogDictionaryLabel(category.code, category.name),
                })),
              ]}
            />
            <FilterSelect
              label="กลุ่มรหัส"
              value={codeGroupId}
              onValueChange={(value) => {
                setCodeGroupId(value);
                setPage(0);
              }}
              options={[
                { value: 'all', label: 'ทุกกลุ่ม' },
                ...codeGroups.map((group) => ({
                  value: group.id,
                  label: `${group.workContextCode}-${group.itemTypeCode} ${group.itemTypeNameTh}`,
                })),
              ]}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ลำดับ</TableHead>
                  <TableHead className="w-40">รหัส</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="w-28">หน่วยนับ</TableHead>
                  <TableHead className="w-32 text-right">ราคาต่อหน่วย</TableHead>
                  <TableHead className="w-28">สถานะ</TableHead>
                  <TableHead className="w-24 text-right">เปิด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      ไม่พบรายการตามเงื่อนไข
                    </TableCell>
                  </TableRow>
                ) : visibleItems.map((item) => (
                  <TableRow key={item.identityId}>
                    <TableCell className="tabular-nums">{item.displayOrder + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{item.itemCode}</TableCell>
                    <TableCell>
                      <div className="max-w-[600px] font-medium">{item.itemName}</div>
                      <div className="text-xs text-muted-foreground">หมวด {item.categoryCode}</div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.unitCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'secondary' : 'outline'}>
                        {item.isActive ? 'ใช้งาน' : 'ยกเลิกใช้'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={workspaceItemHref({
                          versionId: version.id,
                          identityId: item.identityId,
                          query,
                          status,
                          categoryId,
                          codeGroupId,
                          page: safePage,
                        })}>
                          รายละเอียด
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              พบ {filtered.length.toLocaleString('th-TH')} รายการ
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

      {editable && allowAdd ? (
        <CatalogAddItemForm
          version={version}
          categories={categories}
          codeGroups={codeGroups}
          unitOptions={unitOptions}
        />
      ) : null}
    </>
  );
}

function workspaceItemHref({
  versionId,
  identityId,
  query,
  status,
  categoryId,
  codeGroupId,
  page,
}: {
  versionId: string;
  identityId: string;
  query: string;
  status: string;
  categoryId: string;
  codeGroupId: string;
  page: number;
}) {
  const returnParams = new URLSearchParams();
  if (query.trim()) returnParams.set('q', query.trim());
  if (status !== 'all') returnParams.set('status', status);
  if (categoryId !== 'all') returnParams.set('category', categoryId);
  if (codeGroupId !== 'all') returnParams.set('group', codeGroupId);
  if (page > 0) returnParams.set('page', String(page + 1));
  const returnQuery = returnParams.toString();
  const returnTo = `/admin/master-catalog/versions/${versionId}${returnQuery ? `?${returnQuery}` : ''}`;
  return `/admin/master-catalog/versions/${versionId}/items/${identityId}?returnTo=${encodeURIComponent(returnTo)}`;
}

function CatalogAddItemForm({
  version,
  categories,
  codeGroups,
  unitOptions,
}: {
  version: { id: string; lockVersion: number };
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  unitOptions: string[];
}) {
  const [state, formAction] = useActionState(applyCatalogManualChangeAction, initialState);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [codeGroupId, setCodeGroupId] = useState(codeGroups[0]?.id ?? '');
  const [unit, setUnit] = useState('');
  const [materialCost, setMaterialCost] = useState('0.00');
  const [laborCost, setLaborCost] = useState('0.00');
  const [showMoneyErrors, setShowMoneyErrors] = useState(false);
  const unitCost = sumCatalogMoneyInputs(materialCost, laborCost);
  const [requestIdRef, prepareOperation, preserveInput] = useStableCatalogOperation(
    state,
    `${version.id}:add`,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'success') router.refresh();
  }, [router, state.status]);

  function handleSubmitCapture(event: FormEvent<HTMLFormElement>) {
    if (!normalizeCatalogMoneyInput(materialCost) || !normalizeCatalogMoneyInput(laborCost)) {
      event.preventDefault();
      setShowMoneyErrors(true);
      return;
    }
    prepareOperation(event);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Plus />เพิ่มรายการในฉบับร่าง</CardTitle>
        <CardDescription>ระบบจะจัดสรรรหัสลำดับถัดไปจากกลุ่มที่เลือก</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTitle>รายการที่เพิ่มใหม่ต้องจัดตำแหน่งก่อนเผยแพร่</AlertTitle>
          <AlertDescription>
            บันทึกรายการได้ทันที แต่หลังเพิ่มแล้วต้องเปิดงานจัดตำแหน่งและยืนยันรายการใหม่ทั้งหมดอีกครั้ง
          </AlertDescription>
        </Alert>
        <form
          action={formAction}
          className="grid gap-4"
          noValidate
          onReset={preserveInput}
          onSubmitCapture={handleSubmitCapture}
        >
          <input ref={requestIdRef} type="hidden" name="requestId" />
          <input type="hidden" name="versionId" value={version.id} />
          <input type="hidden" name="expectedLockVersion" value={version.lockVersion} />
          <input type="hidden" name="action" value="add" />
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="codeGroupId" value={codeGroupId} />
          <input type="hidden" name="unitCost" value={unitCost} />
          <MutationStateAlert state={state} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="add-item-name">ชื่อรายการ</Label>
              <Input id="add-item-name" name="itemName" required />
            </div>
            <CatalogUnitInput
              id="add-unit"
              name="unit"
              value={unit}
              options={unitOptions}
              onChange={setUnit}
            />
            <ControlledSelect
              label="หมวดงาน"
              value={categoryId}
              onValueChange={setCategoryId}
              options={categories.map((category) => ({
                value: category.id,
                label: formatCatalogDictionaryLabel(category.code, category.name),
              }))}
            />
            <div className="md:col-span-2">
              <ControlledSelect
                label="กลุ่มรหัส"
                value={codeGroupId}
                onValueChange={setCodeGroupId}
                options={codeGroups.map((group) => ({
                  value: group.id,
                  label: `${group.workContextCode}-${group.itemTypeCode} · ${group.workContextNameTh} / ${group.itemTypeNameTh}`,
                }))}
              />
            </div>
            <CatalogMoneyInput
              id="add-material"
              name="materialCost"
              label="ค่าวัสดุ"
              value={materialCost}
              onChange={setMaterialCost}
              showError={showMoneyErrors}
              onValidationRequest={() => setShowMoneyErrors(true)}
            />
            <CatalogMoneyInput
              id="add-labor"
              name="laborCost"
              label="ค่าแรง"
              value={laborCost}
              onChange={setLaborCost}
              showError={showMoneyErrors}
              onValidationRequest={() => setShowMoneyErrors(true)}
            />
            <div className="grid gap-2">
              <Label htmlFor="add-total">ราคารวมต่อหน่วย</Label>
              <Input id="add-total" value={unitCost} readOnly />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="add-price-authority">เอกสารอ้างอิงชื่อ หน่วย และราคา</Label>
              <Input id="add-price-authority" name="priceAuthorityReference" required />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="add-reason">เหตุผล</Label>
              <Input id="add-reason" name="reason" required />
            </div>
          </div>
          <div><SubmitButton label="เพิ่มรายการ" /></div>
        </form>
      </CardContent>
    </Card>
  );
}

function FilterSelect(props: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return <ControlledSelect {...props} hideLabel />;
}

function ControlledSelect({
  label,
  value,
  onValueChange,
  options,
  hideLabel = false,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hideLabel?: boolean;
}) {
  const triggerId = useId();

  return (
    <div className="grid gap-2">
      {hideLabel ? null : <Label htmlFor={triggerId}>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={triggerId} aria-label={label} className="w-full min-w-0">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Plus />}
      {pending ? 'กำลังบันทึก' : label}
    </Button>
  );
}

function MutationStateAlert({ state }: { state: CatalogMutationState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'error') return <MasterCatalogActionErrorAlert state={state} />;
  return (
    <Alert aria-live="polite">
      <CheckCircle2 />
      <AlertTitle>บันทึกฉบับร่างแล้ว</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
