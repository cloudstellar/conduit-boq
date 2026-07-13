'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, CheckCircle2, History, Loader2, Save, ShieldAlert } from 'lucide-react';
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
import type { CatalogMutationState } from '@/lib/master-catalog/admin/actionModel';
import type {
  CatalogIdentityHistoryPage,
  CatalogItemDetail,
} from '@/lib/master-catalog/admin/catalogWorkspace';
import { formatCatalogDictionaryLabel } from '@/lib/master-catalog/admin/presentation';
import { applyCatalogManualChangeAction } from '../actions';
import { useStableCatalogOperation } from './useStableCatalogOperation';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';

type ItemAction = 'update' | 'recode' | 'retire' | 'reactivate' | 'withdraw';

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogItemEditor({
  item,
  history,
}: {
  item: CatalogItemDetail;
  history: CatalogIdentityHistoryPage;
}) {
  const searchParams = useSearchParams();
  const returnHref = safeItemReturnHref(
    searchParams.get('returnTo'),
    item.versionId,
  );
  const editable =
    item.mutationReady
    &&
    item.versionStatus === 'draft'
    && item.basedOnVersionId !== null
    && item.basedOnVersionId === item.currentVersionId;
  const recodeGroups = item.codeGroups.filter((group) => group.id !== item.codeGroupId);
  const actions = availableActions(item);
  const canMutate = editable && actions.length > 0;
  const [requestedAction, setRequestedAction] = useState<ItemAction>(actions[0] ?? 'update');
  const action = actions.includes(requestedAction) ? requestedAction : actions[0] ?? 'update';
  const [state, formAction] = useActionState(applyCatalogManualChangeAction, initialState);
  const [itemName, setItemName] = useState(item.itemName);
  const [unit, setUnit] = useState(item.unit);
  const [materialCost, setMaterialCost] = useState(money(item.materialCost));
  const [laborCost, setLaborCost] = useState(money(item.laborCost));
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [codeGroupId, setCodeGroupId] = useState(recodeGroups[0]?.id ?? '');
  const unitCost = sumMoney(materialCost, laborCost);
  const authorityChanged =
    itemName.trim() !== item.itemName
    || unit.trim() !== item.unit
    || materialCost !== money(item.materialCost)
    || laborCost !== money(item.laborCost)
    || unitCost !== money(item.unitCost);
  const [requestIdRef, prepareOperation, preserveInput] = useStableCatalogOperation(
    state,
    `${item.versionId}:${item.identityId}:${action}`,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status !== 'success') return;
    if (action === 'withdraw') {
      router.replace(returnHref);
      return;
    }
    router.refresh();
  }, [action, returnHref, router, state.status]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={returnHref}>
            <ArrowLeft />กลับไปเวอร์ชัน {item.versionString}
          </Link>
        </Button>
        <div className="flex gap-2">
          <Badge variant={item.isActive ? 'secondary' : 'outline'}>
            {item.isActive ? 'ใช้งาน' : 'ยกเลิกใช้'}
          </Badge>
          <Badge variant="outline">ลำดับ {item.displayOrder + 1}</Badge>
        </div>
      </div>

      {item.warnings.length > 0 || history.warnings.length > 0 ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ข้อมูลบางส่วนโหลดไม่ครบ</AlertTitle>
          <AlertDescription>{[...item.warnings, ...history.warnings].join(' · ')}</AlertDescription>
        </Alert>
      ) : null}

      {!canMutate ? (
        <Alert>
          <ShieldAlert />
          <AlertTitle>เปิดดูอย่างเดียว</AlertTitle>
          <AlertDescription>
            แก้ไขได้เฉพาะฉบับร่างที่อ้างอิงเวอร์ชันใช้งานปัจจุบัน รายการและประวัติเดิมยังเปิดดูได้ครบ
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{item.itemName}</CardTitle>
            <CardDescription>{item.itemCode} · ตัวตนรายการคงที่ตลอดประวัติ</CardDescription>
          </CardHeader>
          <CardContent>
            {canMutate ? (
              <form
                action={formAction}
                className="grid gap-5"
                onReset={preserveInput}
                onSubmitCapture={prepareOperation}
              >
                <input ref={requestIdRef} type="hidden" name="requestId" />
                <input type="hidden" name="versionId" value={item.versionId} />
                <input type="hidden" name="expectedLockVersion" value={item.lockVersion} />
                <input type="hidden" name="targetIdentityId" value={item.identityId} />
                <input type="hidden" name="targetItemCode" value={item.itemCode} />
                <input type="hidden" name="action" value={action} />
                <MutationAlert state={state} />

                <div className="grid gap-2">
                  <Label htmlFor="item-action">การดำเนินการ</Label>
                  <Select value={action} onValueChange={(value) => setRequestedAction(value as ItemAction)}>
                    <SelectTrigger id="item-action"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {actions.map((value) => (
                          <SelectItem key={value} value={value}>{actionLabel(value)}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {action === 'update' ? (
                  <>
                    <input type="hidden" name="categoryId" value={categoryId} />
                    <input type="hidden" name="unitCost" value={unitCost} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="edit-item-name">ชื่อรายการ</Label>
                        <Input id="edit-item-name" name="itemName" value={itemName} onChange={(event) => setItemName(event.target.value)} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-unit">หน่วยนับ</Label>
                        <Input id="edit-unit" name="unit" value={unit} onChange={(event) => setUnit(event.target.value)} required />
                      </div>
                      <DictionarySelect
                        id="edit-category"
                        label="หมวดงาน"
                        value={categoryId}
                        onValueChange={setCategoryId}
                        options={item.categories.map((category) => ({
                          value: category.id,
                          label: formatCatalogDictionaryLabel(category.code, category.name),
                        }))}
                      />
                      <MoneyField id="edit-material" name="materialCost" label="ค่าวัสดุ" value={materialCost} onChange={setMaterialCost} />
                      <MoneyField id="edit-labor" name="laborCost" label="ค่าแรง" value={laborCost} onChange={setLaborCost} />
                      <div className="grid gap-2">
                        <Label htmlFor="edit-unit-cost">ราคารวมต่อหน่วย</Label>
                        <Input id="edit-unit-cost" value={unitCost} readOnly />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="edit-authority" className="min-w-0 leading-snug">
                          เอกสารอ้างอิงชื่อ หน่วย หรือราคา{authorityChanged ? '' : ' (ไม่จำเป็นเมื่อเปลี่ยนเฉพาะหมวด)'}
                        </Label>
                        <Input id="edit-authority" name="priceAuthorityReference" required={authorityChanged} />
                      </div>
                    </div>
                  </>
                ) : null}

                {action === 'recode' ? (
                  <>
                    <input type="hidden" name="categoryId" value={item.categoryId} />
                    <input type="hidden" name="codeGroupId" value={codeGroupId} />
                    <DictionarySelect
                      id="recode-code-group"
                      label="กลุ่มรหัสใหม่"
                      value={codeGroupId}
                      onValueChange={setCodeGroupId}
                      options={recodeGroups.map((group) => ({
                        value: group.id,
                        label: `${group.workContextCode}-${group.itemTypeCode} · ${group.workContextNameTh} / ${group.itemTypeNameTh}`,
                      }))}
                    />
                    <Alert>
                      <AlertTitle>ระบบเป็นผู้จัดสรรรหัสใหม่</AlertTitle>
                      <AlertDescription>รหัสเดิมยังคงอยู่ในประวัติและถูกสงวนไว้ ระบบจะไม่นำเลขท้ายเดิมกลับมาใช้ซ้ำ</AlertDescription>
                    </Alert>
                  </>
                ) : null}

                {action === 'retire' ? <ConfirmNote text="รายการจะยังอยู่ในฉบับร่างและประวัติ แต่สถานะจะเปลี่ยนเป็นยกเลิกใช้" /> : null}
                {action === 'reactivate' ? <ConfirmNote text="เปิดใช้ตัวตนรายการและรหัสเดิมอีกครั้ง พร้อมบันทึกข้อมูลก่อนและหลังการเปลี่ยนแปลง" /> : null}
                {action === 'withdraw' ? <ConfirmNote text="ลบเฉพาะแถวชั่วคราวจากฉบับร่าง โดยคงตัวตนรายการ รหัสที่สงวน และประวัติทั้งหมด" /> : null}

                <div className="grid gap-2">
                  <Label htmlFor="item-change-reason">เหตุผล</Label>
                  <Input id="item-change-reason" name="reason" required />
                </div>
                <div><SubmitButton /></div>
              </form>
            ) : (
              <ReadOnlyFields item={item} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ประวัติรหัสของรายการนี้</CardTitle>
            <CardDescription>รหัสเดิมและรหัสมาตรฐานจะไม่ถูกนำกลับไปใช้กับรายการอื่น</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {item.codeHistory.map((code) => (
              <div key={code.itemCode} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
                <span className="font-mono text-xs">{code.itemCode}</span>
                <Badge variant="outline">{code.codeKind === 'legacy' ? 'รหัสเดิม' : 'รหัสมาตรฐาน'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <IdentityTimeline item={item} history={history} />
    </div>
  );
}

function safeItemReturnHref(value: string | null, versionId: string) {
  const fallback = `/admin/master-catalog/versions/${versionId}`;
  if (!value) return fallback;

  const expectedPrefix = `${fallback}`;
  if (!value.startsWith(expectedPrefix)) return fallback;
  if (value.startsWith('//') || value.includes('://') || value.includes('\\')) return fallback;

  try {
    const parsed = new URL(value, 'http://local.invalid');
    if (parsed.origin !== 'http://local.invalid') return fallback;
    if (parsed.pathname !== fallback && parsed.pathname !== `${fallback}/review`) return fallback;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

function availableActions(item: CatalogItemDetail): ItemAction[] {
  const recodeActions: ItemAction[] = item.codeGroups.some(
    (group) => group.id !== item.codeGroupId,
  ) ? ['recode'] : [];

  if (item.baseHasIdentity) {
    return item.isActive
      ? ['update', ...recodeActions, ...(item.capabilities.retirementEnabled ? ['retire' as const] : [])]
      : ['reactivate'];
  }
  if (item.hasPublishedIdentity) {
    return item.isActive ? ['update', ...recodeActions] : [];
  }
  return item.isActive ? ['update', ...recodeActions, 'withdraw'] : ['withdraw'];
}

function actionLabel(action: ItemAction): string {
  return {
    update: 'แก้ไขข้อมูล',
    recode: 'เปลี่ยนกลุ่มและจัดสรรรหัสใหม่',
    retire: 'ยกเลิกใช้',
    reactivate: 'เปิดใช้อีกครั้ง',
    withdraw: 'ถอนรายการใหม่ออกจากฉบับร่าง',
  }[action];
}

function DictionarySelect(props: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select value={props.value} onValueChange={props.onValueChange}>
        <SelectTrigger id={props.id} className="w-full min-w-0"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function MoneyField(props: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        name={props.name}
        inputMode="decimal"
        pattern="(0|[1-9][0-9]*)\.[0-9]{2}"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        required
      />
    </div>
  );
}

function ConfirmNote({ text }: { text: string }) {
  return <Alert><ShieldAlert /><AlertTitle>ตรวจสอบก่อนบันทึก</AlertTitle><AlertDescription>{text}</AlertDescription></Alert>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Save />}
      {pending ? 'กำลังบันทึก' : 'บันทึกในฉบับร่าง'}
    </Button>
  );
}

function MutationAlert({ state }: { state: CatalogMutationState }) {
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

function ReadOnlyFields({ item }: { item: CatalogItemDetail }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <ReadOnly label="หน่วยนับ" value={item.unit} />
      <ReadOnly label="หมวดงาน" value={item.categoryCode} />
      <ReadOnly label="ค่าวัสดุ" value={money(item.materialCost)} />
      <ReadOnly label="ค่าแรง" value={money(item.laborCost)} />
      <ReadOnly label="ราคารวมต่อหน่วย" value={money(item.unitCost)} />
    </dl>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}

function IdentityTimeline({ item, history }: { item: CatalogItemDetail; history: CatalogIdentityHistoryPage }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><History />ประวัติรายการ</CardTitle>
        <CardDescription>เรียงจากเหตุการณ์ล่าสุดของตัวตนรายการเดียวกัน</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {history.rows.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเปลี่ยนแปลงของรายการนี้</p> : null}
        {history.rows.map((entry) => (
          <div key={`${entry.id}-${entry.action}`} className="border-b pb-4 last:border-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{historyActionLabel(entry.action)}</Badge>
                <span className="text-sm font-medium">{entry.reason}</span>
              </div>
              <time className="text-xs text-muted-foreground">{formatThaiDateTime(entry.createdAt)}</time>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{entry.actorDisplayName}</p>
            <FieldDiff
              action={entry.action}
              oldValues={entry.oldValues}
              newValues={entry.newValues}
            />
            {entry.priceAuthorityReference ? (
              <p className="mt-2 text-xs">เอกสารอ้างอิง: {entry.priceAuthorityReference}</p>
            ) : null}
          </div>
        ))}
        {history.nextCursor ? (
          <Button variant="outline" asChild>
            <Link href={`/admin/master-catalog/versions/${item.versionId}/items/${item.identityId}?before=${encodeURIComponent(history.nextCursor.createdAt)}&beforeId=${history.nextCursor.id}`}>
              ดูประวัติก่อนหน้า
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

const SNAPSHOT_FIELDS = [
  ['itemCode', 'รหัส'],
  ['itemName', 'ชื่อรายการ'],
  ['unit', 'หน่วยนับ'],
  ['materialCost', 'ค่าวัสดุ'],
  ['laborCost', 'ค่าแรง'],
  ['unitCost', 'ราคารวม'],
  ['category', 'หมวดงาน'],
  ['isActive', 'สถานะ'],
] as const;

function FieldDiff({
  action,
  oldValues,
  newValues,
}: {
  action: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}) {
  const effectiveNewValues = action === 'retire' && oldValues && !newValues
    ? { ...oldValues, isActive: false }
    : newValues;
  const changed = SNAPSHOT_FIELDS.filter(
    ([key]) => oldValues?.[key] !== effectiveNewValues?.[key],
  );
  if (changed.length === 0) return null;
  return (
    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
      {changed.map(([key, label]) => (
        <div key={key} className="rounded border p-2">
          <div className="text-muted-foreground">{label}</div>
          <div className="mt-1 break-words">{displayValue(oldValues?.[key])} → {displayValue(effectiveNewValues?.[key])}</div>
        </div>
      ))}
    </div>
  );
}

function historyActionLabel(action: string): string {
  return ({ add: 'เพิ่ม', update: 'แก้ไข', recode: 'เปลี่ยนรหัส', retire: 'ยกเลิกใช้', reactivate: 'เปิดใช้อีกครั้ง', withdraw: 'ถอนจากฉบับร่าง' } as Record<string, string>)[action] ?? action;
}

function displayValue(value: unknown): string {
  if (value === null || typeof value === 'undefined') return '-';
  if (value === true) return 'ใช้งาน';
  if (value === false) return 'ยกเลิกใช้';
  return String(value);
}

function money(value: number): string {
  return value.toFixed(2);
}

function sumMoney(material: string, labor: string): string {
  const result = Number(material) + Number(labor);
  return Number.isFinite(result) ? result.toFixed(2) : '0.00';
}

function formatThaiDateTime(value: string): string {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
