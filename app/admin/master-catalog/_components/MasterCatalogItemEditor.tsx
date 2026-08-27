'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useRef, useState, type FormEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, CheckCircle2, History, Loader2, Save, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  normalizeCatalogMoneyInput,
  sumCatalogMoneyInputs,
} from '@/lib/master-catalog/admin/money';
import {
  catalogItemMutationNotice,
  safeCatalogItemReturnHref,
} from '@/lib/master-catalog/admin/navigation';
import {
  formatCatalogDictionaryLabel,
  formatCatalogVersionBackLabel,
} from '@/lib/master-catalog/admin/presentation';
import { applyCatalogManualChangeAction } from '../actions';
import { CatalogMoneyInput } from './CatalogMoneyInput';
import { CatalogUnitInput } from './CatalogUnitInput';
import { useStableCatalogOperation } from './useStableCatalogOperation';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';

type ItemAction = 'update' | 'recode' | 'retire' | 'reactivate' | 'withdraw';
type ConfirmedItemAction = Extract<ItemAction, 'recode' | 'retire'>;

type PendingItemConfirmation = {
  action: ConfirmedItemAction;
  reason: string;
  targetLabel: string;
};

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogItemEditor({
  item,
  history,
  mutationEnabled,
}: {
  item: CatalogItemDetail;
  history: CatalogIdentityHistoryPage;
  mutationEnabled: boolean;
}) {
  const searchParams = useSearchParams();
  const returnHref = safeCatalogItemReturnHref(
    searchParams.get('returnTo'),
    item.versionId,
  );
  const editable =
    mutationEnabled
    && item.mutationReady
    && item.versionStatus === 'draft'
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
  const [showMoneyErrors, setShowMoneyErrors] = useState(false);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [codeGroupId, setCodeGroupId] = useState(recodeGroups[0]?.id ?? '');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingItemConfirmation | null>(null);
  const mutationFormRef = useRef<HTMLFormElement>(null);
  const confirmedActionRef = useRef<ConfirmedItemAction | null>(null);
  const normalizedMaterialCost = normalizeCatalogMoneyInput(materialCost);
  const normalizedLaborCost = normalizeCatalogMoneyInput(laborCost);
  const unitCost = sumCatalogMoneyInputs(materialCost, laborCost);
  const authorityChanged =
    itemName.trim() !== item.itemName
    || unit.trim() !== item.unit
    || normalizedMaterialCost !== money(item.materialCost)
    || normalizedLaborCost !== money(item.laborCost)
    || unitCost !== money(item.unitCost);
  const [requestIdRef, prepareOperation, preserveInput] = useStableCatalogOperation(
    state,
    `${item.versionId}:${item.identityId}:${action}`,
  );
  const mutationNotice = catalogItemMutationNotice(
    searchParams.get('notice'),
    searchParams.get('outcome'),
    searchParams.get('requestId'),
  );
  const versionBackLabel = formatCatalogVersionBackLabel({
    versionStatus: item.versionStatus,
    draftReference: item.draftReference,
    targetVersionString: item.targetVersionString,
  });

  function handleSubmitCapture(event: FormEvent<HTMLFormElement>) {
    if (action === 'update' && (!normalizedMaterialCost || !normalizedLaborCost)) {
      event.preventDefault();
      setShowMoneyErrors(true);
      return;
    }
    prepareOperation(event);
  }

  function handleMutationSubmit(event: FormEvent<HTMLFormElement>) {
    if (action !== 'recode' && action !== 'retire') return;

    if (confirmedActionRef.current === action) {
      confirmedActionRef.current = null;
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get('reason') ?? '').trim();
    const targetGroup = recodeGroups.find((group) => group.id === codeGroupId);

    setPendingConfirmation({
      action,
      reason,
      targetLabel: action === 'recode' && targetGroup
        ? `${targetGroup.workContextCode}-${targetGroup.itemTypeCode} · ${targetGroup.workContextNameTh} / ${targetGroup.itemTypeNameTh}`
        : 'ยกเลิกใช้ในฉบับร่าง',
    });
  }

  function confirmHighImpactMutation() {
    if (!pendingConfirmation || !mutationFormRef.current) return;
    confirmedActionRef.current = pendingConfirmation.action;
    setPendingConfirmation(null);
    mutationFormRef.current.requestSubmit();
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={returnHref}>
            <ArrowLeft />กลับไปยัง {versionBackLabel}
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
            {mutationEnabled
              ? 'แก้ไขได้เฉพาะฉบับร่างที่อ้างอิงเวอร์ชันใช้งานปัจจุบัน รายการและประวัติเดิมยังเปิดดูได้'
              : 'เครื่องมือแก้ไขอยู่ในโหมดบำรุงรักษา รายการและประวัติเดิมยังเปิดดูได้'}
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
              <div className="grid gap-5">
                {state.status === 'idle' && mutationNotice ? (
                  <Alert aria-live="polite">
                    <CheckCircle2 />
                    <AlertTitle>บันทึกฉบับร่างแล้ว</AlertTitle>
                    <AlertDescription className="grid gap-1">
                      <span>
                        {mutationNotice.recoveredRequest
                          ? 'ระบบยืนยันว่าคำขอเดิมถูกบันทึกไว้แล้ว โดยไม่บันทึกซ้ำ'
                          : 'บันทึกการเปลี่ยนแปลงในฉบับร่างแล้ว'}
                      </span>
                      {mutationNotice.requestId ? (
                        <span className="text-xs text-muted-foreground">
                          รหัสคำขอ {mutationNotice.requestId}
                        </span>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <form
                  ref={mutationFormRef}
                  action={formAction}
                  className="grid gap-5"
                  noValidate
                  onReset={preserveInput}
                  onSubmitCapture={handleSubmitCapture}
                  onSubmit={handleMutationSubmit}
                >
                  <input ref={requestIdRef} type="hidden" name="requestId" />
                  <input type="hidden" name="versionId" value={item.versionId} />
                  <input type="hidden" name="expectedLockVersion" value={item.lockVersion} />
                  <input type="hidden" name="targetIdentityId" value={item.identityId} />
                  <input type="hidden" name="targetItemCode" value={item.itemCode} />
                  <input type="hidden" name="action" value={action} />
                  <input type="hidden" name="returnTo" value={returnHref} />
                  <MutationAlert state={state} />

                <div className="grid gap-2">
                  <Label htmlFor="item-action">การดำเนินการ</Label>
                  <Select
                    value={action}
                    onValueChange={(value) => {
                      setRequestedAction(value as ItemAction);
                      confirmedActionRef.current = null;
                      setPendingConfirmation(null);
                    }}
                  >
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
                      <CatalogUnitInput
                        id="edit-unit"
                        name="unit"
                        value={unit}
                        options={item.unitOptions}
                        onChange={setUnit}
                      />
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
                      <CatalogMoneyInput
                        id="edit-material"
                        name="materialCost"
                        label="ค่าวัสดุ"
                        value={materialCost}
                        onChange={setMaterialCost}
                        showError={showMoneyErrors}
                        onValidationRequest={() => setShowMoneyErrors(true)}
                      />
                      <CatalogMoneyInput
                        id="edit-labor"
                        name="laborCost"
                        label="ค่าแรง"
                        value={laborCost}
                        onChange={setLaborCost}
                        showError={showMoneyErrors}
                        onValidationRequest={() => setShowMoneyErrors(true)}
                      />
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
              </div>
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

      <Dialog
        open={pendingConfirmation !== null}
        onOpenChange={(open) => {
          if (!open) {
            confirmedActionRef.current = null;
            setPendingConfirmation(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="pr-8">
              {pendingConfirmation?.action === 'retire'
                ? `ยืนยันการยกเลิกใช้ ${item.itemCode}`
                : `ยืนยันการเปลี่ยนรหัส ${item.itemCode}`}
            </DialogTitle>
            <DialogDescription>
              {pendingConfirmation?.action === 'retire'
                ? 'รายการจะเปลี่ยนเป็นยกเลิกใช้ในฉบับร่าง แต่ BOQ เดิมและประวัติรายการจะไม่ถูกแก้ไข'
                : 'ระบบจะจัดสรรรหัสใหม่จากกลุ่มที่เลือก รหัสเดิมจะคงอยู่ในประวัติและไม่ถูกนำกลับมาใช้ซ้ำ'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 rounded-md border p-3 text-sm">
            <div>
              <div className="text-xs font-medium text-muted-foreground">รายการ</div>
              <div className="mt-1 break-words font-medium">{item.itemName}</div>
              <div className="mt-1 font-mono text-xs">{item.itemCode}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">ผลหลังบันทึก</div>
              <div className="mt-1 break-words">{pendingConfirmation?.targetLabel ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">เหตุผล</div>
              <div className="mt-1 break-words">{pendingConfirmation?.reason ?? '-'}</div>
            </div>
          </div>
          <Alert>
            <ShieldAlert />
            <AlertTitle>ประวัติและ BOQ เดิมไม่ถูกเขียนทับ</AlertTitle>
            <AlertDescription>
              การเปลี่ยนแปลงนี้บันทึกเฉพาะในฉบับร่างพร้อมหลักฐานก่อนและหลัง จนกว่าจะผ่านการตรวจและเผยแพร่ทั้งเวอร์ชัน
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">กลับไปตรวจ</Button>
            </DialogClose>
            <Button
              type="button"
              variant={pendingConfirmation?.action === 'retire' ? 'destructive' : 'default'}
              onClick={confirmHighImpactMutation}
            >
              <Save />
              {pendingConfirmation?.action === 'retire'
                ? 'ยืนยันยกเลิกใช้'
                : 'ยืนยันเปลี่ยนรหัส'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IdentityTimeline item={item} history={history} />
    </div>
  );
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
  return ({ add: 'เพิ่ม', update: 'แก้ไข', recode: 'เปลี่ยนรหัส', retire: 'ยกเลิกใช้', reactivate: 'เปิดใช้อีกครั้ง', withdraw: 'ถอนจากฉบับร่าง', place: 'ยืนยันตำแหน่ง' } as Record<string, string>)[action] ?? action;
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

function formatThaiDateTime(value: string): string {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
