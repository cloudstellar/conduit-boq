'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
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
import type { CatalogMutationState } from '@/lib/master-catalog/admin/actionModel';
import { applyP51D002OptionABatchAction } from '../actions';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogP51D002OptionAPanel({
  versionId,
  lockVersion,
  confirmationPhrase,
}: {
  versionId: string;
  lockVersion: number;
  confirmationPhrase: string;
}) {
  const [state, formAction] = useActionState(
    applyP51D002OptionABatchAction,
    initialState,
  );
  const [confirmation, setConfirmation] = useState('');
  const router = useRouter();
  const isClassification = lockVersion === 3;

  useEffect(() => {
    if (state.status === 'success') router.refresh();
  }, [router, state.status]);

  return (
    <Card aria-labelledby="p51-d002-option-a-heading">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle id="p51-d002-option-a-heading" className="flex items-center gap-2">
            <ShieldCheck />
            ชุดแก้ไข Option A ที่อนุมัติ
          </CardTitle>
          <Badge variant="secondary">48 รายการ</Badge>
          <Badge variant="outline">COR-001</Badge>
        </div>
        <CardDescription>
          {isClassification
            ? 'รุ่นแก้ไขเป็น 3 แล้ว ปุ่มนี้ใช้ตรวจผลคำขอเดิมเมื่อผลครั้งก่อนขาดหายเท่านั้น'
            : 'บันทึกค่าแรงและราคาต่อหน่วยที่อนุมัติลงฉบับร่างนี้แบบครั้งเดียว'}
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <input type="hidden" name="versionId" value={versionId} />
        <CardContent className="grid gap-4">
          <Alert>
            <TriangleAlert />
            <AlertTitle>ขอบเขตถูกล็อกไว้บนเซิร์ฟเวอร์</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                <li>แก้เฉพาะค่าแรงและราคาต่อหน่วย 48 รายการ</li>
                <li>ITEM-0429 ไม่อยู่ในชุดนี้ เพราะมีอยู่ใน D002 แล้ว</li>
                <li>ITEM-0615 คงค่าวัสดุ/ค่าแรง/รวมเป็น 2,869 / 7,427 / 10,296 บาท</li>
                <li>ไม่แก้ BOQ เดิมย้อนหลัง ไม่เผยแพร่ และไม่เปลี่ยนเวอร์ชันที่ผู้ใช้กำลังใช้งาน</li>
              </ul>
            </AlertDescription>
          </Alert>

          {isClassification ? (
            <Alert>
              <AlertTitle>ตรวจผลด้วยรหัสคำขอเดิม</AlertTitle>
              <AlertDescription>
                ระบบจะส่ง fingerprint เดิมเพียงครั้งเดียวเพื่ออ่านข้อความเดิมจากฐานข้อมูล
                และจะไม่สร้างรายการซ้ำ
              </AlertDescription>
            </Alert>
          ) : null}

          {state.status === 'success' ? (
            <Alert aria-live="polite">
              <CheckCircle2 />
              <AlertTitle>{state.message}</AlertTitle>
              <AlertDescription>
                รุ่นแก้ไข {state.lockVersion ?? 3}
                {state.duplicateRequest ? ' · เป็นผลของคำขอเดิม ไม่มีการบันทึกซ้ำ' : ''}
              </AlertDescription>
            </Alert>
          ) : null}

          <MasterCatalogActionErrorAlert state={state}>
            {state.outcomeUncertain ? (
              <p>
                อย่ากดคำขอแบบอื่น ให้คงบัญชีผู้ดูแลนี้ไว้ โหลดหน้าเดิม และใช้ช่องนี้ตรวจผลด้วยคำยืนยันเดิม
              </p>
            ) : null}
          </MasterCatalogActionErrorAlert>

          <div className="grid gap-2">
            <Label htmlFor="p51-d002-confirmation">
              พิมพ์ข้อความยืนยันให้ตรงทุกตัว
            </Label>
            <code className="w-fit rounded bg-muted px-2 py-1 text-xs">
              {confirmationPhrase}
            </code>
            <Input
              id="p51-d002-confirmation"
              name="confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="p51-d002-confirmation-help"
            />
            <p id="p51-d002-confirmation-help" className="text-xs text-muted-foreground">
              หน้านี้ส่งเฉพาะรหัสฉบับร่างและข้อความยืนยัน ราคาและรหัสคำขอสร้างบนเซิร์ฟเวอร์
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t pt-4">
          <P51D002SubmitButton
            disabled={
              state.status === 'success'
              || confirmation.normalize('NFC') !== confirmationPhrase
            }
            isClassification={isClassification}
          />
        </CardFooter>
      </form>
    </Card>
  );
}

function P51D002SubmitButton({
  disabled,
  isClassification,
}: {
  disabled: boolean;
  isClassification: boolean;
}) {
  const { pending } = useFormStatus();
  const label = isClassification ? 'ตรวจผลคำขอเดิม' : 'บันทึก 48 รายการ';

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <ShieldCheck data-icon="inline-start" />}
      {pending ? 'กำลังตรวจสอบและส่งหนึ่งครั้ง…' : label}
    </Button>
  );
}
