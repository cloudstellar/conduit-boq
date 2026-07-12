'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckCircle2,
  FilePlus2,
  Loader2,
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
  draftVersions: Array<{
    id: string;
    versionString: string;
    status: string;
    lockVersion: number;
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
  draftVersions,
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
          เวอร์ชันฐานปัจจุบัน: {defaultVersionString ?? '-'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {draftVersions.length > 0 ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ฉบับร่างที่อ้างอิงฐานปัจจุบัน</AlertTitle>
            <AlertDescription>
              <div className="grid gap-2">
                {draftVersions.map((draftVersion) => (
                  <div key={draftVersion.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{draftVersion.versionString}</Badge>
                    <Badge variant="outline">รุ่นแก้ไข {draftVersion.lockVersion}</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/master-catalog/versions/${draftVersion.id}`}>
                        เปิดฉบับร่างนี้
                      </Link>
                    </Button>
                  </div>
                ))}
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
                <Label htmlFor="draft-version-minor">ลำดับปรับปรุงหลัก</Label>
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
                <Label htmlFor="draft-version-patch">ลำดับแก้ไขย่อย</Label>
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
              <Label htmlFor="draft-name">ชื่อฉบับร่าง</Label>
              <Input
                id="draft-name"
                name="name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draft-reason">เหตุผลที่สร้าง</Label>
              <Input
                id="draft-reason"
                name="reason"
                required
              />
            </div>
            <CardFooter className="px-0">
              <SubmitButton
                label="สร้างฉบับร่าง"
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
          เผยแพร่หรือคืนเวอร์ชันใช้งาน
        </CardTitle>
        <CardDescription>
          เวอร์ชันใช้งานปัจจุบัน: {currentVersionString ?? 'ดูจากทะเบียนเวอร์ชัน'}
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
              <Badge variant="outline">รุ่นแก้ไข {draftVersion.lockVersion}</Badge>
              {draftVersion.itemCount != null ? (
                <Badge variant="outline">{draftVersion.itemCount.toLocaleString('th-TH')} รายการ</Badge>
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
              <Label htmlFor="publish-effective-date">วันที่มีผล</Label>
              <Input
                id="publish-effective-date"
                name="effectiveDate"
                type="date"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-approval-reference">เลขที่เอกสารอนุมัติ</Label>
              <Input
                id="publish-approval-reference"
                name="approvalReference"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-approval-document-date">วันที่เอกสารอนุมัติ</Label>
              <Input
                id="publish-approval-document-date"
                name="approvalDocumentDate"
                type="date"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-archive-reference">ที่เก็บเอกสารและไฟล์ฉบับอนุมัติ</Label>
              <Input
                id="publish-archive-reference"
                name="physicalArchiveReference"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="publish-reason">เหตุผลการเผยแพร่</Label>
              <Input
                id="publish-reason"
                name="reason"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton
                label="เผยแพร่เวอร์ชันนี้"
                pendingLabel="กำลังเผยแพร่"
                disabled={publishBlocked}
              >
                <ShieldCheck data-icon="inline-start" />
              </SubmitButton>
            </div>
          </form>
        ) : (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ไม่มีฉบับร่างที่พร้อมเผยแพร่</AlertTitle>
            <AlertDescription>ต้องมีฉบับร่างที่ผ่านเงื่อนไขก่อนจึงจะเผยแพร่ได้</AlertDescription>
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
              <Label htmlFor="restore-target-version">เวอร์ชันเป้าหมาย</Label>
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
              <Label htmlFor="restore-reason">เหตุผลที่คืนเวอร์ชัน</Label>
              <Input
                id="restore-reason"
                name="reason"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton
                label="ตั้งเป็นเวอร์ชันใช้งาน"
                pendingLabel="กำลังเปลี่ยนเวอร์ชัน"
                disabled={!restoreTargetId}
              >
                <RotateCcw data-icon="inline-start" />
              </SubmitButton>
            </div>
          </form>
        ) : (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ไม่มีเวอร์ชันเผยแพร่เดิมให้เลือก</AlertTitle>
            <AlertDescription>จะคืนเวอร์ชันใช้งานได้เมื่อมีเวอร์ชันที่เผยแพร่แล้วและไม่ได้ใช้งานอยู่ในปัจจุบัน</AlertDescription>
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
        <AlertTitle>ข้อมูลทั้งเวอร์ชันผ่านเงื่อนไขเผยแพร่</AlertTitle>
        <AlertDescription>
          ฐานยังเป็นเวอร์ชันใช้งานปัจจุบัน คุณภาพข้อมูลรหัสมาตรฐานผ่าน และไม่พบรายการเพิ่มใหม่หรือรหัสเดิมที่ติดเงื่อนไข
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
          {!readiness.baseIsCurrent ? (
            <p>ฉบับร่างไม่ได้อ้างอิงเวอร์ชันใช้งานปัจจุบัน</p>
          ) : null}
          {!readiness.qualityPassed ? (
            <p>การตรวจจำนวนตัวตนรายการ หมวด รหัส ราคา หรือลำดับของข้อมูลทั้งเวอร์ชันยังไม่ผ่าน</p>
          ) : null}
          {readiness.newIdentityCount > 0 ? (
            <p>
              มีรายการเพิ่มใหม่ {readiness.newIdentityCount.toLocaleString('th-TH')} รายการ
              ที่ต้องผ่านการพิจารณาตำแหน่งตาม P-18
            </p>
          ) : null}
          {readiness.unapprovedLegacyActiveCount > 0 ? (
            <p>
              มีรหัส ITEM-#### ที่ยังใช้งานและไม่ได้รับข้อยกเว้น{' '}
              {readiness.unapprovedLegacyActiveCount.toLocaleString('th-TH')} รายการ
            </p>
          ) : null}
          {readiness.structuredCodeGuardApplies ? (
            <p>
              ตรวจการเปลี่ยนเป็นรหัสมาตรฐานจากรหัสที่ใช้งาน{' '}
              {readiness.activeCanonicalCodeCount.toLocaleString('th-TH')} รายการ
            </p>
          ) : null}
          <p>ข้อมูลยังคงอยู่ในฉบับร่าง และยังไม่มีการเปลี่ยนเวอร์ชันใช้งาน</p>
        </div>
      </AlertDescription>
    </Alert>
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
          รุ่นแก้ไข {state.lockVersion ?? '-'}
          {state.changeSetId ? ` · ชุดการเปลี่ยนแปลง ${state.changeSetId}` : ''}
          {state.requestId ? ` · คำขอ ${state.requestId.slice(0, 8)}` : ''}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" aria-live="polite">
      <AlertTitle>{state.code ?? 'VALIDATION_FAILED'}</AlertTitle>
      <AlertDescription>
        {state.message}
        {state.requestId ? ` · คำขอ ${state.requestId.slice(0, 8)}` : ''}
      </AlertDescription>
    </Alert>
  );
}
