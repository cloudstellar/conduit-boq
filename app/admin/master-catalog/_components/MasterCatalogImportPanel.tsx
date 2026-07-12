'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  CatalogImportDraftOption,
  CatalogImportEvidenceCounts,
} from '@/lib/master-catalog/admin/importContext';
import type { CatalogMutationState } from '@/lib/master-catalog/admin/actionModel';
import {
  CATALOG_IMPORT_PAYLOAD_PROFILE_ID,
  CATALOG_IMPORT_PAYLOAD_PROFILE_VERSION,
  CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION_V2,
  buildCatalogImportRowsV2,
  validateCatalogImportPayloadV2,
} from '@/lib/master-catalog/import/payload';
import {
  NT_ITEM_MASTER_2568_PROFILE,
} from '@/lib/master-catalog/import/parser-profiles';
import {
  CatalogParserProfileError,
  type CatalogImportPayloadV2,
  type ParseContext,
  type ParserDiagnostic,
} from '@/lib/master-catalog/import/types';
import {
  CatalogWorkbookParseError,
  parseCatalogWorkbookInfoFromXlsx,
} from '@/lib/master-catalog/import/workbookAdapter';
import {
  applyCatalogImportAction,
  previewCatalogImportAction,
} from '../actions';
import { useStableCatalogOperation } from './useStableCatalogOperation';

type ImportMode = CatalogImportPayloadV2['mode'];

interface PreparedImportPreview {
  payloadJson: string;
  normalizedPayloadHash: string;
  rowCount: number;
  sourceFilename: string;
  sourceFileSize: number;
  sourceFileSha256: string;
  mode: ImportMode;
  newIdentityCount: number;
  activeCanonicalCodeCount: number;
  structuredCodeGuardApplies: boolean;
  unapprovedLegacyActiveCount: number;
  retirementCandidateCount: number;
}

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogImportPanel({
  drafts,
  draft,
  parseContext,
  evidenceCounts,
  authorityReady,
  capabilities,
}: {
  drafts: CatalogImportDraftOption[];
  draft: CatalogImportDraftOption | null;
  parseContext: ParseContext;
  evidenceCounts: CatalogImportEvidenceCounts;
  authorityReady: boolean;
  capabilities: {
    newIdentityEnabled: boolean;
    retirementEnabled: boolean;
  };
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode>('full');
  const [reason, setReason] = useState('');
  const [physicalArchiveReference, setPhysicalArchiveReference] =
    useState('');
  const [priceAuthorityReference, setPriceAuthorityReference] = useState('');
  const [retirementApprovalReference, setRetirementApprovalReference] = useState('');
  const [retirementConfirmedCount, setRetirementConfirmedCount] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepared, setPrepared] = useState<PreparedImportPreview | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ParserDiagnostic[]>([]);

  function invalidatePreparedPreview() {
    setPrepared(null);
    setPrepareError(null);
    setDiagnostics([]);
  }

  async function prepareImportPreview() {
    setPrepared(null);
    setPrepareError(null);
    setDiagnostics([]);

    if (!draft || !authorityReady || !draft.isCurrentBase) {
      setPrepareError('ต้องเลือกฉบับร่างฐานปัจจุบันที่โหลดข้อมูลอ้างอิงครบก่อน');
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setPrepareError('เลือกไฟล์ .xlsx ก่อน');
      return;
    }

    setIsPreparing(true);

    try {
      const parsed = await parseCatalogWorkbookInfoFromXlsx({
        filename: file.name,
        sizeBytes: file.size,
        arrayBuffer: await file.arrayBuffer(),
      });
      const detection = NT_ITEM_MASTER_2568_PROFILE.detect(parsed.workbookInfo);

      if (!detection.matched) {
        setDiagnostics(detection.errors);
        setPrepareError('ไฟล์ Excel ไม่ตรงรูปแบบนำเข้าที่อนุมัติ');
        return;
      }

      const sheet = parsed.workbookInfo.sheets.find(
        (item) => item.name.trim() === NT_ITEM_MASTER_2568_PROFILE.requiredSheet,
      );

      if (!sheet) {
        setPrepareError('ไม่พบแผ่นงานที่รูปแบบนำเข้ากำหนด');
        return;
      }

      const excludedCodes = new Set(parseContext.sourceExclusionCodes ?? []);
      const workbookRows = sheet.dataRows
        .filter((row) => !excludedCodes.has(String(row.item_code ?? '').trim()))
        .map((row) => NT_ITEM_MASTER_2568_PROFILE.normalizeRow(row, parseContext));
      const rows = buildCatalogImportRowsV2([
        ...workbookRows,
        ...(mode === 'full' ? parseContext.supplementalRows ?? [] : []),
      ]);
      const confirmedCount = retirementConfirmedCount.trim()
        ? Number(retirementConfirmedCount)
        : null;
      const payload: CatalogImportPayloadV2 = {
        schemaVersion: CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION_V2,
        parserProfileId: CATALOG_IMPORT_PAYLOAD_PROFILE_ID,
        parserProfileVersion: CATALOG_IMPORT_PAYLOAD_PROFILE_VERSION,
        mode,
        versionId: draft.id,
        expectedLockVersion: draft.lockVersion,
        requestId: crypto.randomUUID(),
        reason,
        source: {
          filename: parsed.source.filename,
          sizeBytes: parsed.source.sizeBytes,
          sha256: parsed.source.sha256,
          physicalArchiveReference,
        },
        priceAuthorityReference: priceAuthorityReference.trim() || null,
        retirementApprovalReference: retirementApprovalReference.trim() || null,
        retirementConfirmedCount: Number.isInteger(confirmedCount) ? confirmedCount : null,
        rows,
      };
      const validated = await validateCatalogImportPayloadV2(payload);
      const activeCanonicalCodeCount = validated.payload.rows.filter(
        (row) =>
          row.identityOutcome !== 'retire' &&
          row.targetItemCode !== null &&
          /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/.test(row.targetItemCode),
      ).length;
      const structuredCodeGuardApplies = activeCanonicalCodeCount > 0;

      setPrepared({
        payloadJson: validated.normalizedPayloadJson,
        normalizedPayloadHash: validated.normalizedPayloadHash,
        rowCount: validated.payload.rows.length,
        sourceFilename: parsed.source.filename,
        sourceFileSize: parsed.source.sizeBytes,
        sourceFileSha256: parsed.source.sha256,
        mode,
        newIdentityCount: validated.payload.rows.filter(
          (row) => row.identityOutcome === 'candidate_add',
        ).length,
        activeCanonicalCodeCount,
        structuredCodeGuardApplies,
        unapprovedLegacyActiveCount: structuredCodeGuardApplies
          ? validated.payload.rows.filter(
              (row) =>
                row.identityOutcome !== 'retire' &&
                row.targetItemCode !== null &&
                /^ITEM-[0-9]{4}$/.test(row.targetItemCode) &&
                row.targetItemCode !== 'ITEM-0139',
            ).length
          : 0,
        retirementCandidateCount: validated.payload.rows.filter(
          (row) => row.identityOutcome === 'retire',
        ).length,
      });
    } catch (error) {
      if (
        error instanceof CatalogWorkbookParseError ||
        error instanceof CatalogParserProfileError
      ) {
        setDiagnostics(error.diagnostics);
        setPrepareError(error.message);
      } else if (error instanceof Error) {
        setPrepareError(error.message);
      } else {
        setPrepareError('เตรียมข้อมูลสำหรับตรวจสอบไม่สำเร็จ');
      }
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet />
          นำเข้าบัญชีราคา
        </CardTitle>
        <CardDescription>
          เลือกฉบับร่างให้ชัดเจนก่อนอ่านและตรวจไฟล์
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="catalog-import-draft">ฉบับร่างเป้าหมาย</Label>
          <Select
            value={draft?.id ?? ''}
            onValueChange={(value) => router.push(`/admin/master-catalog/import?draftId=${value}`)}
          >
            <SelectTrigger id="catalog-import-draft">
              <SelectValue placeholder="เลือกฉบับร่าง" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {drafts.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.versionString} · {option.isCurrentBase ? 'ฐานปัจจุบัน' : 'ฐานเก่า'}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {!draft ? (
          <Alert>
            <ShieldAlert />
            <AlertTitle>ยังไม่ได้เลือกฉบับร่าง</AlertTitle>
            <AlertDescription>เลือกฉบับร่างจากรายการก่อน ระบบจะไม่เลือกแทนโดยอัตโนมัติ</AlertDescription>
          </Alert>
        ) : null}

        {draft && !draft.isCurrentBase ? (
          <Alert variant="destructive">
            <ShieldAlert />
            <AlertTitle>ฉบับร่างนี้อ้างอิงฐานเก่า</AlertTitle>
            <AlertDescription>เปิดดูข้อมูลเดิมได้ แต่ต้องสร้างฉบับร่างใหม่จากเวอร์ชันใช้งานปัจจุบันก่อนนำเข้า</AlertDescription>
          </Alert>
        ) : null}

        {draft && !authorityReady ? (
          <Alert variant="destructive">
            <ShieldAlert />
            <AlertTitle>ข้อมูลอ้างอิงที่รับรองสำหรับการนำเข้ายังไม่ครบ</AlertTitle>
            <AlertDescription>ปิดการเตรียมไฟล์ไว้ก่อน เพื่อไม่ให้ไฟล์ Excel กลายเป็นข้อมูลหลักแทนฐานที่อนุมัติ</AlertDescription>
          </Alert>
        ) : null}

        <EvidenceCounts counts={evidenceCounts} />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-file">ไฟล์ Excel</Label>
            <Input
              ref={fileInputRef}
              id="catalog-import-file"
              type="file"
              accept=".xlsx"
              onChange={() => {
                setPrepared(null);
                setPrepareError(null);
                setDiagnostics([]);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-mode">รูปแบบการนำเข้า</Label>
            <Select value={mode} onValueChange={(value) => {
              setMode(value as ImportMode);
              invalidatePreparedPreview();
            }}>
              <SelectTrigger id="catalog-import-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="full">ครบทั้งบัญชี</SelectItem>
                  {capabilities.newIdentityEnabled ? (
                    <SelectItem value="supplement">เฉพาะรายการเพิ่มเติม</SelectItem>
                  ) : null}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-reason">เหตุผลการนำเข้า</Label>
            <Input
              id="catalog-import-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                invalidatePreparedPreview();
              }}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-archive">ที่เก็บไฟล์ต้นฉบับ</Label>
            <Input
              id="catalog-import-archive"
              value={physicalArchiveReference}
              onChange={(event) => {
                setPhysicalArchiveReference(event.target.value);
                invalidatePreparedPreview();
              }}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="catalog-import-price-authority">เอกสารอ้างอิงชื่อ หน่วย หรือราคา (ถ้ามี)</Label>
          <Input
            id="catalog-import-price-authority"
            value={priceAuthorityReference}
            onChange={(event) => {
              setPriceAuthorityReference(event.target.value);
              invalidatePreparedPreview();
            }}
          />
        </div>

        {mode === 'full' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="catalog-retirement-ref">หลักฐานอนุมัติการยกเลิกใช้</Label>
              <Input
                id="catalog-retirement-ref"
                value={retirementApprovalReference}
                onChange={(event) => {
                  setRetirementApprovalReference(event.target.value);
                  invalidatePreparedPreview();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catalog-retirement-count">ยืนยันจำนวนรายการยกเลิกใช้</Label>
              <Input
                id="catalog-retirement-count"
                value={retirementConfirmedCount}
                inputMode="numeric"
                onChange={(event) => {
                  setRetirementConfirmedCount(event.target.value);
                  invalidatePreparedPreview();
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={prepareImportPreview}
            disabled={isPreparing || !draft?.isCurrentBase || !authorityReady}
          >
            {isPreparing ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Upload data-icon="inline-start" />}
            {isPreparing ? 'กำลังอ่านไฟล์' : 'เตรียมรายการตรวจสอบ'}
          </Button>
          <Badge variant="secondary">ไฟล์ต้นฉบับยังอยู่ในเบราว์เซอร์</Badge>
        </div>

        <ClientDiagnostics
          title={prepareError ? 'ยังเตรียมข้อมูลตรวจสอบไม่ได้' : 'ผลตรวจไฟล์ในเบราว์เซอร์'}
          message={prepareError}
          diagnostics={diagnostics}
        />

        {prepared ? (
          <PreparedPreview
            key={prepared.normalizedPayloadHash}
            prepared={prepared}
            retirementEnabled={capabilities.retirementEnabled}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function EvidenceCounts({ counts }: { counts: CatalogImportEvidenceCounts }) {
  const items = [
    ['รายการตามข้อมูลรับรอง', counts.mappings],
    ['จับคู่จากไฟล์', counts.workbookMatchedRows],
    ['เติมจาก Production', counts.productionOnlyRows],
    ['เลื่อนไปรอบถัดไป', counts.deferredWorkbookRows],
    ['เปลี่ยนรหัส', counts.recodeRows],
    ['คงรหัสเดิม', counts.retainedRows],
    ['กลุ่มรหัสที่อนุมัติ', counts.codeGroups],
  ] as const;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border bg-background p-3">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {value.toLocaleString('th-TH')}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreparedPreview({
  prepared,
  retirementEnabled,
}: {
  prepared: PreparedImportPreview;
  retirementEnabled: boolean;
}) {
  const router = useRouter();
  const [previewState, previewAction] = useActionState(
    previewCatalogImportAction,
    initialState,
  );
  const [applyState, applyAction] = useActionState(
    applyCatalogImportAction,
    initialState,
  );
  const [
    applyRequestIdInputRef,
    prepareApplyOperation,
    preserveApplyInput,
  ] = useStableCatalogOperation(
    applyState,
    prepared.normalizedPayloadHash,
  );

  useEffect(() => {
    if (previewState.status === 'success' || applyState.status === 'success') {
      router.refresh();
    }
  }, [applyState.status, previewState.status, router]);

  return (
    <div className="grid gap-4 rounded-md border bg-background p-4">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <KeyValue label="ไฟล์" value={prepared.sourceFilename} />
        <KeyValue label="รูปแบบ" value={prepared.mode === 'full' ? 'ครบทั้งบัญชี' : 'เฉพาะรายการเพิ่มเติม'} />
        <KeyValue label="รายการที่เตรียมส่งตรวจ" value={prepared.rowCount.toLocaleString('th-TH')} />
        <KeyValue label="ขนาดไฟล์" value={prepared.sourceFileSize.toLocaleString('th-TH')} />
        <KeyValue label="SHA-256 ของไฟล์" value={shortHash(prepared.sourceFileSha256)} />
        <KeyValue label="SHA-256 ของข้อมูลที่เตรียมส่ง" value={shortHash(prepared.normalizedPayloadHash)} />
      </div>

      {prepared.newIdentityCount > 0 ? (
        <Alert>
          <ShieldAlert />
          <AlertTitle>มีรายการเพิ่มใหม่ที่ต้องพิจารณาตำแหน่ง</AlertTitle>
          <AlertDescription>
            พบ {prepared.newIdentityCount.toLocaleString('th-TH')} รายการ สามารถบันทึก
            ลงฉบับร่างเพื่อทบทวนได้ แต่ระบบจะยังไม่อนุญาตให้เผยแพร่จนกว่า P-18 จะได้รับการอนุมัติ
          </AlertDescription>
        </Alert>
      ) : null}

      {prepared.unapprovedLegacyActiveCount > 0 ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>พบรหัสเดิมที่ยังเผยแพร่ไม่ได้</AlertTitle>
          <AlertDescription>
            ในไฟล์นี้มีรหัส ITEM-#### ที่ยังใช้งานและไม่ใช่ข้อยกเว้น ITEM-0139 จำนวน{' '}
            {prepared.unapprovedLegacyActiveCount.toLocaleString('th-TH')} รายการ
          </AlertDescription>
        </Alert>
      ) : null}

      {prepared.structuredCodeGuardApplies ? (
        <Alert>
          <ShieldAlert />
          <AlertTitle>การนำเข้านี้เริ่มหรือดำเนินการเปลี่ยนเป็นรหัสมาตรฐานต่อ</AlertTitle>
          <AlertDescription>
            ไฟล์นี้มีรหัสมาตรฐานที่ใช้งาน{' '}
            {prepared.activeCanonicalCodeCount.toLocaleString('th-TH')} รายการ
            {prepared.mode === 'supplement'
              ? ' ตัวเลขนี้ไม่รวมรายการเดิมนอกไฟล์; ก่อนเผยแพร่ระบบจะตรวจทั้งฉบับร่างและยอมให้ ITEM-0139 เป็นรหัสเดิมได้เพียงรายการเดียว'
              : ' ก่อนเผยแพร่ระบบจะตรวจทั้งฉบับร่างและยอมให้ ITEM-0139 เป็นรหัสเดิมได้เพียงรายการเดียว'}
          </AlertDescription>
        </Alert>
      ) : null}

      {prepared.retirementCandidateCount > 0 ? (
        <Alert>
          <ShieldAlert />
          <AlertTitle>มีรายการยกเลิกใช้ที่ต้องพิจารณานโยบาย PDF</AlertTitle>
          <AlertDescription>
            พบอย่างน้อย {prepared.retirementCandidateCount.toLocaleString('th-TH')} รายการ
            หลังบันทึกต้องตรวจจำนวนจริงอีกครั้ง และยังห้ามรับรอง PDF เป็นฉบับทางการจนกว่า P-19
            จะได้รับอนุมัติ
          </AlertDescription>
        </Alert>
      ) : null}

      <form action={previewAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="payloadJson" value={prepared.payloadJson} />
        <ImportSubmitButton label="ให้เซิร์ฟเวอร์ตรวจผลต่าง" pendingLabel="กำลังตรวจ" />
      </form>
      <ActionStateAlert state={previewState} />

      {previewState.status === 'success' && previewState.importPreview ? (
        <ImportDiffTable diff={previewState.importPreview} />
      ) : null}

      {previewState.status === 'success'
      && previewState.importId
      && previewState.importPreview
      && (retirementEnabled || previewState.importPreview.summary.retire === 0) ? (
        <form
          action={applyAction}
          className="flex flex-wrap items-center gap-2"
          onReset={preserveApplyInput}
          onSubmitCapture={prepareApplyOperation}
        >
          <input ref={applyRequestIdInputRef} type="hidden" name="requestId" />
          <input type="hidden" name="payloadJson" value={prepared.payloadJson} />
          <input type="hidden" name="importId" value={previewState.importId} />
          <ImportSubmitButton
            label="ยืนยันและบันทึกลงฉบับร่าง"
            pendingLabel="กำลังบันทึก"
          />
          <Badge variant="outline">ตรวจแล้ว {shortHash(previewState.importId)}</Badge>
        </form>
      ) : null}
      {previewState.importPreview
      && previewState.importPreview.summary.retire > 0
      && !retirementEnabled ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ยังไม่เปิดการยกเลิกใช้สำหรับรอบเผยแพร่นี้</AlertTitle>
          <AlertDescription>ตรวจผลต่างได้ แต่ปุ่มบันทึกถูกซ่อนไว้จนกว่าจะอนุมัติเปิดความสามารถนี้</AlertDescription>
        </Alert>
      ) : null}
      <ActionStateAlert state={applyState} />
    </div>
  );
}

function ImportDiffTable({
  diff,
}: {
  diff: NonNullable<CatalogMutationState['importPreview']>;
}) {
  const [action, setAction] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');
  const filtered = diff.rows.filter((row) => {
    if (action !== 'all' && row.action !== action) return false;
    if (!normalizedQuery) return true;
    return [row.beforeItemCode, row.afterItemCode, row.itemName, row.sourceItemCode]
      .some((value) => value?.toLocaleLowerCase('th-TH').includes(normalizedQuery));
  });
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="grid gap-4 border-t pt-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <DiffMetric label="เปลี่ยนรหัส" value={diff.summary.recode} />
        <DiffMetric label="แก้ไขข้อมูล" value={diff.summary.update} />
        <DiffMetric label="ยกเลิกใช้" value={diff.summary.retire} />
        <DiffMetric label="ไม่เปลี่ยน" value={diff.summary.unchanged} />
        <DiffMetric label="เพิ่มใหม่" value={diff.summary.add} />
        <DiffMetric label="ตกหล่นจากไฟล์ทั้งบัญชี" value={diff.summary.omissions} />
        <DiffMetric label="แตะชื่อ/หน่วย/ราคา" value={diff.summary.authorityFieldChanges} emphasis />
        <DiffMetric label="รวมผลตรวจ" value={diff.summary.total} />
      </div>

      {diff.summary.authorityFieldChanges > 0 ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>พบการเปลี่ยนข้อมูลที่ต้องยึดตาม Production</AlertTitle>
          <AlertDescription>
            มี {diff.summary.authorityFieldChanges.toLocaleString('th-TH')} รายการที่เปลี่ยนชื่อ หน่วย หรือราคา ต้องมีเอกสารอ้างอิงที่ตรวจสอบได้ก่อนบันทึก
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>ชื่อ หน่วย และราคาจาก Production ถูกคงไว้</AlertTitle>
          <AlertDescription>ผลตรวจจากเซิร์ฟเวอร์ไม่พบการเปลี่ยนชื่อ หน่วย หรือราคาที่ต้องมีเอกสารอ้างอิง</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          aria-label="ค้นหาผลต่าง"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="ค้นหารหัสหรือชื่อรายการ"
        />
        <Select value={action} onValueChange={(value) => {
          setAction(value);
          setPage(0);
        }}>
          <SelectTrigger aria-label="กรองประเภทผลต่าง"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              <SelectItem value="recode">เปลี่ยนรหัส</SelectItem>
              <SelectItem value="update">แก้ไข</SelectItem>
              <SelectItem value="add">เพิ่มใหม่</SelectItem>
              <SelectItem value="retire">ยกเลิกใช้</SelectItem>
              <SelectItem value="unchanged">ไม่เปลี่ยน</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ประเภท</TableHead>
              <TableHead>รหัสเดิม</TableHead>
              <TableHead>รหัสหลังบันทึก</TableHead>
              <TableHead>รายการ</TableHead>
              <TableHead>ฟิลด์ที่เปลี่ยน</TableHead>
              <TableHead>แหล่งที่มา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row, index) => (
              <TableRow key={`${row.identityId ?? row.sourceReference}-${row.action}-${index}`}>
                <TableCell><Badge variant="outline">{diffActionLabel(row.action)}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{row.beforeItemCode ?? '-'}</TableCell>
                <TableCell className="font-mono text-xs">{row.afterItemCode ?? 'ระบบจัดสรร'}</TableCell>
                <TableCell><div className="max-w-[440px]">{row.itemName}</div></TableCell>
                <TableCell>{row.changedFields.map(fieldLabel).join(', ') || '-'}</TableCell>
                <TableCell>{row.omission ? 'ตกหล่นจากไฟล์ทั้งบัญชี' : row.sourceReference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">พบ {filtered.length.toLocaleString('th-TH')} รายการ</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" title="หน้าก่อน" disabled={safePage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
            <ChevronLeft />
          </Button>
          <span className="min-w-24 text-center text-sm">หน้า {safePage + 1} / {pageCount}</span>
          <Button type="button" variant="outline" size="icon" title="หน้าถัดไป" disabled={safePage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DiffMetric({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${emphasis && value > 0 ? 'border-destructive bg-destructive/5' : ''}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value.toLocaleString('th-TH')}</div>
    </div>
  );
}

function diffActionLabel(action: string): string {
  return ({ add: 'เพิ่ม', update: 'แก้ไข', recode: 'เปลี่ยนรหัส', retire: 'ยกเลิกใช้', unchanged: 'ไม่เปลี่ยน' } as Record<string, string>)[action] ?? action;
}

function fieldLabel(field: string): string {
  return ({ itemName: 'ชื่อ', unit: 'หน่วย', materialCost: 'ค่าวัสดุ', laborCost: 'ค่าแรง', unitCost: 'ราคารวม', category: 'หมวด', codeGroup: 'กลุ่มรหัส', itemCode: 'รหัส', isActive: 'สถานะ' } as Record<string, string>)[field] ?? field;
}

function ImportSubmitButton({
  label,
  pendingLabel,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <CheckCircle2 data-icon="inline-start" />}
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
          <div className="flex flex-wrap gap-2">
            {state.importStatus ? <Badge variant="secondary">{importStatusLabel(state.importStatus)}</Badge> : null}
            {state.lockVersion != null ? <Badge variant="outline">รุ่นแก้ไข {state.lockVersion}</Badge> : null}
            {state.changedItems != null ? <Badge variant="outline">เปลี่ยน {state.changedItems} รายการ</Badge> : null}
            {state.duplicateRequest ? <Badge variant="outline">คำขอเดิมที่บันทึกแล้ว</Badge> : null}
            {state.requestId ? <Badge variant="outline">คำขอ {state.requestId.slice(0, 8)}</Badge> : null}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" aria-live="polite">
      <ShieldAlert />
      <AlertTitle>{state.code ?? 'VALIDATION_FAILED'}</AlertTitle>
      <AlertDescription>
        <div className="grid gap-3">
          <p>{state.message}</p>
          {state.requestId ? <p>รหัสคำขอ: {state.requestId}</p> : null}
          <DiagnosticTable diagnostics={state.diagnostics ?? []} />
        </div>
      </AlertDescription>
    </Alert>
  );
}

function ClientDiagnostics({
  title,
  message,
  diagnostics,
}: {
  title: string;
  message: string | null;
  diagnostics: ParserDiagnostic[];
}) {
  if (!message && diagnostics.length === 0) {
    return null;
  }

  return (
    <Alert variant={message ? 'destructive' : 'default'}>
      {message ? <ShieldAlert /> : <CheckCircle2 />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="grid gap-3">
          {message ? <p>{message}</p> : null}
          <DiagnosticTable diagnostics={diagnostics} />
        </div>
      </AlertDescription>
    </Alert>
  );
}

function DiagnosticTable({ diagnostics }: { diagnostics: ParserDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>แถว</TableHead>
            <TableHead>ช่องข้อมูล</TableHead>
            <TableHead>รหัสปัญหา</TableHead>
            <TableHead>รายละเอียด</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagnostics.slice(0, 12).map((diagnostic, index) => (
            <TableRow key={`${diagnostic.row ?? 'n'}-${diagnostic.field ?? 'f'}-${index}`}>
              <TableCell className="tabular-nums">{diagnostic.row ?? '-'}</TableCell>
              <TableCell>{diagnostic.field ?? '-'}</TableCell>
              <TableCell>
                <Badge variant="outline">{String(diagnostic.code)}</Badge>
              </TableCell>
              <TableCell>{diagnostic.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {diagnostics.length > 12 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          แสดง 12 จากผลตรวจทั้งหมด {diagnostics.length.toLocaleString('th-TH')} รายการ
        </p>
      ) : null}
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate font-medium">{value}</div>
    </div>
  );
}

function shortHash(value: string): string {
  const prefix = value.startsWith('sha256:') ? 'sha256:' : '';
  const normalized = prefix ? value.slice(prefix.length) : value;
  if (normalized.length <= 12) return value;
  return `${prefix}${normalized.slice(0, 12)}…`;
}

function importStatusLabel(status: string): string {
  return ({
    uploaded: 'รับไฟล์แล้ว',
    validated: 'ตรวจสอบแล้ว',
    applied: 'บันทึกแล้ว',
    rejected: 'ไม่ผ่านการตรวจ',
  } as Record<string, string>)[status] ?? status;
}
