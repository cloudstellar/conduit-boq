'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckCircle2,
  FilePlus2,
  Loader2,
  PenLine,
  Plus,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import type {
  CatalogMutationState,
} from '@/lib/master-catalog/admin/actionModel';
import type { CatalogPublishReadiness } from '@/lib/master-catalog/admin/readModel';
import {
  applyCatalogManualChangeAction,
  createCatalogDraftAction,
  publishCatalogVersionAction,
  restoreCatalogPointerAction,
} from '../actions';
import { useStableCatalogOperation } from './useStableCatalogOperation';

type DraftCreatePanelProps = {
  defaultVersionString: string | null;
  suggestedVersion: {
    major: number;
    minor: number;
    patch: number;
  } | null;
  draftVersion: {
    id: string;
    versionString: string;
    status: string;
    lockVersion: number;
  } | null;
};

type MutationPanelProps = {
  version: {
    id: string;
    versionString: string;
    status: string;
    lockVersion: number;
  };
  sampleItems: Array<{
    itemCode: string;
    itemName: string;
    unit: string;
    category: string | null;
    isActive: boolean;
  }>;
};

type PublishRestorePanelProps = {
  draftVersion: {
    id: string;
    versionString: string;
    lockVersion: number;
    itemCount: number | null;
    datasetHash: string | null;
  } | null;
  draftReadiness: CatalogPublishReadiness | null;
  currentVersionString: string | null;
  restorableVersions: Array<{
    id: string;
    versionString: string;
    itemCount: number | null;
    datasetHash: string | null;
  }>;
};

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogDraftCreatePanel({
  defaultVersionString,
  suggestedVersion,
  draftVersion,
}: DraftCreatePanelProps) {
  const [state, formAction] = useActionState(createCatalogDraftAction, initialState);
  const suggestedVersionString = suggestedVersion
    ? `${suggestedVersion.major}.${suggestedVersion.minor}.${suggestedVersion.patch}`
    : null;
  const [requestIdInputRef, prepareOperation, preserveSubmittedInput] = useStableCatalogOperation(
    state,
    `${defaultVersionString ?? 'no-base'}:${suggestedVersionString ?? 'no-suggestion'}`,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilePlus2 />
          สร้างฉบับร่าง
        </CardTitle>
        <CardDescription>
          Current base: {defaultVersionString ?? '-'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {draftVersion ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>มีเวอร์ชันสำหรับรอบนี้แล้ว</AlertTitle>
            <AlertDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{draftVersion.versionString}</Badge>
                <Badge variant="outline">lock {draftVersion.lockVersion}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/master-catalog/versions/${draftVersion.id}`}>
                    เปิดเวอร์ชัน
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : suggestedVersion ? (
          <form
            action={formAction}
            className="grid gap-4"
            onReset={preserveSubmittedInput}
            onSubmitCapture={prepareOperation}
          >
            <input ref={requestIdInputRef} type="hidden" name="requestId" />
            <ActionStateAlert state={state} />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="draft-version-major">ปี พ.ศ. ที่มีผล</Label>
                <Input
                  id="draft-version-major"
                  name="versionMajor"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={suggestedVersion.major}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="draft-version-minor">Revision</Label>
                <Input
                  id="draft-version-minor"
                  name="versionMinor"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={suggestedVersion.minor}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="draft-version-patch">Patch</Label>
                <Input
                  id="draft-version-patch"
                  name="versionPatch"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={suggestedVersion.patch}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draft-name">Draft name</Label>
              <Input
                id="draft-name"
                name="name"
                defaultValue={`Local rehearsal draft ${suggestedVersionString}`}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draft-reason">Reason</Label>
              <Input
                id="draft-reason"
                name="reason"
                defaultValue="WP-4 local-only draft create"
                required
              />
            </div>
            <CardFooter className="px-0">
              <SubmitButton
                label="สร้าง draft"
                pendingLabel="กำลังสร้าง"
              >
                <Plus data-icon="inline-start" />
              </SubmitButton>
            </CardFooter>
          </form>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>อ่านเลขฉบับตั้งต้นไม่สำเร็จ</AlertTitle>
            <AlertDescription>ยังไม่สามารถเสนอเลขฉบับร่างตาม ADR-003 ได้</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function MasterCatalogPublishRestorePanel({
  draftVersion,
  draftReadiness,
  currentVersionString,
  restorableVersions,
}: PublishRestorePanelProps) {
  const [publishState, publishAction] = useActionState(publishCatalogVersionAction, initialState);
  const [restoreState, restoreAction] = useActionState(restoreCatalogPointerAction, initialState);
  const [selectedRestoreTargetId, setSelectedRestoreTargetId] = useState('');
  const router = useRouter();
  const firstRestorableVersionId = restorableVersions[0]?.id ?? '';
  const restoreTargetId = restorableVersions.some(
    (version) => version.id === selectedRestoreTargetId,
  ) ? selectedRestoreTargetId : firstRestorableVersionId;
  const [
    publishRequestIdInputRef,
    preparePublishOperation,
    preservePublishInput,
  ] = useStableCatalogOperation(
    publishState,
    draftVersion?.id ?? 'no-publish-draft',
  );
  const [
    restoreRequestIdInputRef,
    prepareRestoreOperation,
    preserveRestoreInput,
  ] = useStableCatalogOperation(
    restoreState,
    restoreTargetId || 'no-restore-target',
  );
  const publishBlocked = !draftReadiness?.canPublish;

  useEffect(() => {
    if (publishState.status === 'success' || restoreState.status === 'success') {
      router.refresh();
    }
  }, [publishState.status, restoreState.status, router]);

  if (!draftVersion && restorableVersions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck />
          Publish / restore
        </CardTitle>
        <CardDescription>
          Current default: {currentVersionString ?? '-'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-2">
        {draftVersion ? (
          <form
            action={publishAction}
            className="grid gap-4"
            onReset={preservePublishInput}
            onSubmitCapture={preparePublishOperation}
          >
            <input ref={publishRequestIdInputRef} type="hidden" name="requestId" />
            <ActionStateAlert state={publishState} />
            <input type="hidden" name="versionId" value={draftVersion.id} />
            <input type="hidden" name="expectedLockVersion" value={draftVersion.lockVersion} />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{draftVersion.versionString}</Badge>
              <Badge variant="outline">lock {draftVersion.lockVersion}</Badge>
              {draftVersion.itemCount != null ? (
                <Badge variant="outline">{draftVersion.itemCount.toLocaleString('th-TH')} rows</Badge>
              ) : null}
            </div>
            <PublishReadinessAlert readiness={draftReadiness} />
            {draftReadiness?.retiredPdfPolicyRequired ? (
              <Alert>
                <ShieldCheck />
                <AlertTitle>ต้องพิจารณานโยบาย PDF สำหรับรายการยกเลิกใช้</AlertTitle>
                <AlertDescription>
                  ฉบับร่างมีรายการยกเลิกใช้{' '}
                  {draftReadiness.inactiveRowCount.toLocaleString('th-TH')} รายการ
                  จึงยังห้ามรับรองหรือจัดเก็บ PDF เป็นฉบับทางการจนกว่า P-19 จะได้รับอนุมัติ
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="publish-effective-date">Effective date</Label>
              <Input
                id="publish-effective-date"
                name="effectiveDate"
                type="date"
                defaultValue="2026-07-05"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-approval-reference">Approval reference</Label>
              <Input
                id="publish-approval-reference"
                name="approvalReference"
                defaultValue="LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-approval-document-date">Approval document date</Label>
              <Input
                id="publish-approval-document-date"
                name="approvalDocumentDate"
                type="date"
                defaultValue="2026-07-05"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-by-display-name">Published by display name</Label>
              <Input
                id="publish-by-display-name"
                name="publishedByDisplayName"
                defaultValue="Local WP-5 Rehearsal Publisher"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-reason">Reason</Label>
              <Input
                id="publish-reason"
                name="reason"
                defaultValue="WP-5 local-only publish"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton
                label="Publish local version"
                pendingLabel="กำลัง publish"
                disabled={publishBlocked}
              >
                <ShieldCheck data-icon="inline-start" />
              </SubmitButton>
              <Badge variant="secondary">Production touched: No</Badge>
            </div>
          </form>
        ) : (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ไม่มี draft ที่ publish ได้</AlertTitle>
            <AlertDescription>ต้องมีฉบับร่างสถานะ draft ก่อน publish</AlertDescription>
          </Alert>
        )}

        {restorableVersions.length > 0 ? (
          <form
            action={restoreAction}
            className="grid gap-4"
            onReset={preserveRestoreInput}
            onSubmitCapture={prepareRestoreOperation}
          >
            <input ref={restoreRequestIdInputRef} type="hidden" name="requestId" />
            <ActionStateAlert state={restoreState} />
            <div className="grid gap-2">
              <Label htmlFor="restore-target-version">Target version</Label>
              <Select value={restoreTargetId} onValueChange={setSelectedRestoreTargetId}>
                <SelectTrigger id="restore-target-version">
                  <SelectValue placeholder="เลือกเวอร์ชัน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {restorableVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.versionString}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <input type="hidden" name="targetVersionId" value={restoreTargetId} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="restore-reason">Reason</Label>
              <Input
                id="restore-reason"
                name="reason"
                defaultValue="WP-5 local-only pointer restore"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton
                label="Restore pointer"
                pendingLabel="กำลัง restore"
                disabled={!restoreTargetId}
              >
                <RotateCcw data-icon="inline-start" />
              </SubmitButton>
              <Badge variant="secondary">BOQ unchanged</Badge>
            </div>
          </form>
        ) : (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ไม่มี active non-default version</AlertTitle>
            <AlertDescription>Restore จะพร้อมเมื่อมี published version ที่ไม่ได้เป็น current default</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function PublishReadinessAlert({
  readiness,
}: {
  readiness: CatalogPublishReadiness | null;
}) {
  if (!readiness) {
    return (
      <Alert variant="destructive">
        <ShieldCheck />
        <AlertTitle>ยังยืนยันความพร้อมไม่ได้</AlertTitle>
        <AlertDescription>
          ปิดการเผยแพร่ไว้ก่อนจนกว่าจะอ่านผลตรวจจากฐานข้อมูลได้สำเร็จ
        </AlertDescription>
      </Alert>
    );
  }

  if (readiness.canPublish) {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertTitle>ผ่าน publish guard เบื้องต้น</AlertTitle>
        <AlertDescription>
          ไม่พบรายการเพิ่มใหม่ที่รอจัดลำดับ และไม่พบรหัสเดิมที่ยังไม่ได้รับข้อยกเว้น
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <ShieldCheck />
      <AlertTitle>ฉบับร่างยังเผยแพร่ไม่ได้</AlertTitle>
      <AlertDescription>
        <div className="grid gap-2">
          {!readiness.versionFound || readiness.versionStatus !== 'draft' ? (
            <p>ไม่พบฉบับร่างที่อยู่ในสถานะพร้อมตรวจ</p>
          ) : null}
          {readiness.newIdentityCount > 0 ? (
            <p>
              มีรายการเพิ่มใหม่ {readiness.newIdentityCount.toLocaleString('th-TH')} รายการ
              ที่ต้องผ่านการพิจารณาตำแหน่งตาม P-18
            </p>
          ) : null}
          {readiness.unapprovedLegacyActiveCount > 0 ? (
            <p>
              มีรหัส ITEM-#### ที่ยัง active และไม่ได้รับข้อยกเว้น{' '}
              {readiness.unapprovedLegacyActiveCount.toLocaleString('th-TH')} รายการ
            </p>
          ) : null}
          {readiness.structuredCodeGuardApplies ? (
            <p>
              ตรวจ structured-code rollout จากรหัส canonical ที่ active{' '}
              {readiness.activeCanonicalCodeCount.toLocaleString('th-TH')} รายการ
            </p>
          ) : null}
          <p>ข้อมูลยังเก็บใน draft ได้ และยังไม่มีการเปลี่ยน current default</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function MasterCatalogManualMutationPanel({
  version,
  sampleItems,
}: MutationPanelProps) {
  const [action, setAction] = useState<'retire' | 'update' | 'recode' | 'add'>('retire');
  const [state, formAction] = useActionState(applyCatalogManualChangeAction, initialState);
  const [requestIdInputRef, prepareOperation, preserveSubmittedInput] = useStableCatalogOperation(
    state,
    `${version.id}:${action}`,
  );
  const router = useRouter();
  const activeItems = useMemo(
    () => sampleItems.filter((item) => item.isActive).slice(0, 12),
    [sampleItems],
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh();
    }
  }, [router, state.status]);

  if (version.status !== 'draft') {
    return null;
  }

  const needsTarget = action !== 'add';
  const needsGroup = action === 'add' || action === 'recode';
  const needsPriceAuthority = action === 'add' || action === 'update';
  const needsItemFields = action === 'add' || action === 'update';
  const needsMoney = action === 'add' || action === 'update';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine />
          Draft mutation
        </CardTitle>
        <CardDescription>
          {version.versionString} · lock {version.lockVersion}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="grid gap-5"
          onReset={preserveSubmittedInput}
          onSubmitCapture={prepareOperation}
        >
          <input ref={requestIdInputRef} type="hidden" name="requestId" />
          <ActionStateAlert state={state} />
          <input type="hidden" name="versionId" value={version.id} />
          <input type="hidden" name="expectedLockVersion" value={version.lockVersion} />
          <input type="hidden" name="action" value={action} />

          <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="grid gap-2">
              <Label htmlFor="manual-action">Action</Label>
              <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
                <SelectTrigger id="manual-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="retire">Retire</SelectItem>
                    <SelectItem value="update">Edit</SelectItem>
                    <SelectItem value="recode">Recode</SelectItem>
                    <SelectItem value="add">Add</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-reason">Reason</Label>
              <Input
                key={action}
                id="manual-reason"
                name="reason"
                defaultValue={`WP-4 local-only ${action}`}
                required
              />
            </div>
          </div>

          {needsTarget ? (
            <div className="grid gap-2">
              <Label htmlFor="target-item-code">Target item code</Label>
              <Input
                id="target-item-code"
                name="targetItemCode"
                list="catalog-action-sample-items"
                placeholder="ITEM-0001"
                required
              />
              <datalist id="catalog-action-sample-items">
                {activeItems.map((item) => (
                  <option
                    key={item.itemCode}
                    value={item.itemCode}
                    label={`${item.itemName} (${item.unit})`}
                  />
                ))}
              </datalist>
            </div>
          ) : null}

          {action === 'add' || action === 'recode' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="canonical-code">Canonical code</Label>
                <Input
                  id="canonical-code"
                  name="canonicalCode"
                  placeholder="AAA-TTT-001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-code">Category code</Label>
                <Input
                  id="category-code"
                  name="categoryCode"
                  placeholder="1.1"
                  required={action === 'add'}
                />
              </div>
            </div>
          ) : null}

          {needsGroup ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="work-context-code">AAA</Label>
                <Input id="work-context-code" name="workContextCode" placeholder="AAA" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-type-code">TTT</Label>
                <Input id="item-type-code" name="itemTypeCode" placeholder="TTT" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="work-context-name">AAA_name_th</Label>
                <Input id="work-context-name" name="workContextNameTh" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-type-name">TTT_name_th</Label>
                <Input id="item-type-name" name="itemTypeNameTh" required />
              </div>
            </div>
          ) : null}

          {needsItemFields ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="item-name">Item name</Label>
                <Input id="item-name" name="itemName" required={action === 'add'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" required={action === 'add'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price-authority">Price authority reference</Label>
                <Input id="price-authority" name="priceAuthorityReference" required={needsPriceAuthority} />
              </div>
            </div>
          ) : null}

          {needsMoney ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="material-cost">Material cost</Label>
                <Input
                  id="material-cost"
                  name="materialCost"
                  inputMode="decimal"
                  placeholder="0.00"
                  required={action === 'add'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="labor-cost">Labor cost</Label>
                <Input
                  id="labor-cost"
                  name="laborCost"
                  inputMode="decimal"
                  placeholder="0.00"
                  required={action === 'add'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit-cost">Unit cost</Label>
                <Input
                  id="unit-cost"
                  name="unitCost"
                  inputMode="decimal"
                  placeholder="0.00"
                  required={action === 'add'}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton
              label="บันทึก change set"
              pendingLabel="กำลังบันทึก"
            >
              <RotateCcw data-icon="inline-start" />
            </SubmitButton>
            <Badge variant="secondary">Production touched: No</Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  children,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : children}
      {pending ? pendingLabel : label}
    </Button>
  );
}

function ActionStateAlert({ state }: { state: CatalogMutationState }) {
  if (state.status === 'idle') {
    return null;
  }

  if (state.status === 'success') {
    return (
      <Alert aria-live="polite">
        <CheckCircle2 />
        <AlertTitle>{state.message}</AlertTitle>
        <AlertDescription>
          lock {state.lockVersion ?? '-'}
          {state.changeSetId ? ` · change set ${state.changeSetId}` : ''}
          {state.requestId ? ` · request ${state.requestId.slice(0, 8)}` : ''}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" aria-live="polite">
      <AlertTitle>{state.code ?? 'VALIDATION_FAILED'}</AlertTitle>
      <AlertDescription>
        {state.message}
        {state.requestId ? ` · request ${state.requestId.slice(0, 8)}` : ''}
      </AlertDescription>
    </Alert>
  );
}
