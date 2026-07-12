'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
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
import { applyCatalogManualChangeAction } from '../actions';
import { useStableCatalogOperation } from './useStableCatalogOperation';

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
  version: { id: string; versionString: string; lockVersion: number };
  items: CatalogWorkspaceItem[];
  totalItems: number;
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  editable: boolean;
  allowAdd: boolean;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [codeGroupId, setCodeGroupId] = useState('all');
  const [page, setPage] = useState(0);
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

  return (
    <>
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
                  label: `${category.code} ${category.name}`,
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
                        <Link href={`/admin/master-catalog/versions/${version.id}/items/${item.identityId}`}>
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
        <CatalogAddItemForm version={version} categories={categories} codeGroups={codeGroups} />
      ) : null}
    </>
  );
}

function CatalogAddItemForm({
  version,
  categories,
  codeGroups,
}: {
  version: { id: string; versionString: string; lockVersion: number };
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
}) {
  const [state, formAction] = useActionState(applyCatalogManualChangeAction, initialState);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [codeGroupId, setCodeGroupId] = useState(codeGroups[0]?.id ?? '');
  const [materialCost, setMaterialCost] = useState('0.00');
  const [laborCost, setLaborCost] = useState('0.00');
  const unitCost = sumMoney(materialCost, laborCost);
  const [requestIdRef, prepareOperation, preserveInput] = useStableCatalogOperation(
    state,
    `${version.id}:add`,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'success') router.refresh();
  }, [router, state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Plus />เพิ่มรายการในฉบับร่าง</CardTitle>
        <CardDescription>ระบบจะจัดสรรรหัสลำดับถัดไปจากกลุ่มที่เลือก</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTitle>รายการใหม่ยังเผยแพร่ไม่ได้จนกว่าจะผ่าน P-18</AlertTitle>
          <AlertDescription>บันทึกเพื่อเตรียมและตรวจข้อมูลได้ แต่ระบบจะยังไม่อนุญาตให้เผยแพร่</AlertDescription>
        </Alert>
        <form
          action={formAction}
          className="grid gap-4"
          onReset={preserveInput}
          onSubmitCapture={prepareOperation}
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
            <div className="grid gap-2">
              <Label htmlFor="add-unit">หน่วยนับ</Label>
              <Input id="add-unit" name="unit" required />
            </div>
            <ControlledSelect
              label="หมวดงาน"
              value={categoryId}
              onValueChange={setCategoryId}
              options={categories.map((category) => ({
                value: category.id,
                label: `${category.code} ${category.name}`,
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
            <MoneyInput id="add-material" name="materialCost" label="ค่าวัสดุ" value={materialCost} onChange={setMaterialCost} />
            <MoneyInput id="add-labor" name="laborCost" label="ค่าแรง" value={laborCost} onChange={setLaborCost} />
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
  return (
    <div className="grid gap-2">
      {hideLabel ? null : <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
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

function MoneyInput({
  id,
  name,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        pattern="(0|[1-9][0-9]*)\.[0-9]{2}"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
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
  return (
    <Alert variant={state.status === 'error' ? 'destructive' : 'default'}>
      <CheckCircle2 />
      <AlertTitle>{state.status === 'success' ? 'บันทึกฉบับร่างแล้ว' : state.code}</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}

function sumMoney(material: string, labor: string): string {
  const materialValue = Number(material);
  const laborValue = Number(labor);
  if (!Number.isFinite(materialValue) || !Number.isFinite(laborValue)) return '0.00';
  return (materialValue + laborValue).toFixed(2);
}
