'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckCircle2,
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
  CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION,
  validateCatalogImportPayloadV1,
} from '@/lib/master-catalog/import/payload';
import {
  NT_ITEM_MASTER_2568_PROFILE,
} from '@/lib/master-catalog/import/parser-profiles';
import {
  CatalogParserProfileError,
  type CatalogImportPayloadV1,
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

type ImportMode = CatalogImportPayloadV1['mode'];

interface PreparedImportPreview {
  payloadJson: string;
  normalizedPayloadHash: string;
  rowCount: number;
  sourceFilename: string;
  sourceFileSize: number;
  sourceFileSha256: string;
  mode: ImportMode;
}

const initialState: CatalogMutationState = { status: 'idle', message: '' };

export function MasterCatalogImportPanel({
  draft,
  parseContext,
  evidenceCounts,
}: {
  draft: CatalogImportDraftOption | null;
  parseContext: ParseContext;
  evidenceCounts: CatalogImportEvidenceCounts;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode>('supplement');
  const [reason, setReason] = useState('WP-4 local-only import preview');
  const [physicalArchiveReference, setPhysicalArchiveReference] =
    useState('local-file-evidence-only');
  const [retirementApprovalReference, setRetirementApprovalReference] = useState('');
  const [retirementConfirmedCount, setRetirementConfirmedCount] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepared, setPrepared] = useState<PreparedImportPreview | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ParserDiagnostic[]>([]);
  const [previewState, previewAction] = useActionState(
    previewCatalogImportAction,
    initialState,
  );
  const [applyState, applyAction] = useActionState(
    applyCatalogImportAction,
    initialState,
  );

  useEffect(() => {
    if (previewState.status === 'success' || applyState.status === 'success') {
      router.refresh();
    }
  }, [applyState.status, previewState.status, router]);

  useEffect(() => {
    setPrepared(null);
  }, [mode, reason, physicalArchiveReference, retirementApprovalReference, retirementConfirmedCount]);

  async function prepareImportPreview() {
    setPrepared(null);
    setPrepareError(null);
    setDiagnostics([]);

    if (!draft) {
      setPrepareError('ต้องสร้าง draft 2568.1.0 ก่อน import');
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
        setPrepareError('Workbook ไม่ตรง approved parser profile');
        return;
      }

      const sheet = parsed.workbookInfo.sheets.find(
        (item) => item.name.trim() === NT_ITEM_MASTER_2568_PROFILE.requiredSheet,
      );

      if (!sheet) {
        setPrepareError('ไม่พบ sheet ที่ profile กำหนด');
        return;
      }

      const rows = sheet.dataRows.map((row) =>
        NT_ITEM_MASTER_2568_PROFILE.normalizeRow(row, parseContext),
      );
      const confirmedCount = retirementConfirmedCount.trim()
        ? Number(retirementConfirmedCount)
        : null;
      const payload: CatalogImportPayloadV1 = {
        schemaVersion: CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION,
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
        retirementApprovalReference: retirementApprovalReference.trim() || null,
        retirementConfirmedCount: Number.isInteger(confirmedCount) ? confirmedCount : null,
        rows,
      };
      const validated = await validateCatalogImportPayloadV1(payload);

      setPrepared({
        payloadJson: validated.normalizedPayloadJson,
        normalizedPayloadHash: validated.normalizedPayloadHash,
        rowCount: validated.payload.rows.length,
        sourceFilename: parsed.source.filename,
        sourceFileSize: parsed.source.sizeBytes,
        sourceFileSha256: parsed.source.sha256,
        mode,
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
        setPrepareError('เตรียม import preview ไม่สำเร็จ');
      }
    } finally {
      setIsPreparing(false);
    }
  }

  if (!draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet />
            Import workbook
          </CardTitle>
          <CardDescription>ต้องมี draft ก่อนเริ่ม import preview</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <ShieldAlert />
            <AlertTitle>ยังไม่มี draft 2568.1.0</AlertTitle>
            <AlertDescription>สร้าง draft จาก current default ก่อนใช้งาน import</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet />
          Import workbook
        </CardTitle>
        <CardDescription>
          {draft.versionString} · lock {draft.lockVersion}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <EvidenceCounts counts={evidenceCounts} />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-file">Workbook</Label>
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
            <Label htmlFor="catalog-import-mode">Mode</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as ImportMode)}>
              <SelectTrigger id="catalog-import-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="supplement">Supplement</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-reason">Reason</Label>
            <Input
              id="catalog-import-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="catalog-import-archive">Physical archive reference</Label>
            <Input
              id="catalog-import-archive"
              value={physicalArchiveReference}
              onChange={(event) => setPhysicalArchiveReference(event.target.value)}
              required
            />
          </div>
        </div>

        {mode === 'full' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="catalog-retirement-ref">Retirement approval reference</Label>
              <Input
                id="catalog-retirement-ref"
                value={retirementApprovalReference}
                onChange={(event) => setRetirementApprovalReference(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catalog-retirement-count">Confirmed retirement count</Label>
              <Input
                id="catalog-retirement-count"
                value={retirementConfirmedCount}
                inputMode="numeric"
                onChange={(event) => setRetirementConfirmedCount(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={prepareImportPreview} disabled={isPreparing}>
            {isPreparing ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Upload data-icon="inline-start" />}
            {isPreparing ? 'กำลังอ่าน workbook' : 'เตรียม preview'}
          </Button>
          <Badge variant="secondary">Raw workbook stays in browser</Badge>
          <Badge variant="outline">Production touched: No</Badge>
        </div>

        <ClientDiagnostics
          title={prepareError ? 'Browser preview blocked' : 'Browser preview diagnostics'}
          message={prepareError}
          diagnostics={diagnostics}
        />

        {prepared ? (
          <PreparedPreview
            prepared={prepared}
            previewState={previewState}
            previewAction={previewAction}
            applyState={applyState}
            applyAction={applyAction}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function EvidenceCounts({ counts }: { counts: CatalogImportEvidenceCounts }) {
  const items = [
    ['Production', counts.productionRows],
    ['Workbook', counts.workbookRows],
    ['Exact price', counts.exactPriceMatches],
    ['Price diff', counts.priceDifferences],
    ['Production-only', counts.productionOnlyRows],
    ['Workbook-only', counts.workbookOnlyRows],
    ['HDPE conflict', counts.hdpeCrossingConflicts],
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
  previewState,
  previewAction,
  applyState,
  applyAction,
}: {
  prepared: PreparedImportPreview;
  previewState: CatalogMutationState;
  previewAction: (formData: FormData) => void;
  applyState: CatalogMutationState;
  applyAction: (formData: FormData) => void;
}) {
  return (
    <div className="grid gap-4 rounded-md border bg-background p-4">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <KeyValue label="File" value={prepared.sourceFilename} />
        <KeyValue label="Mode" value={prepared.mode} />
        <KeyValue label="Rows" value={prepared.rowCount.toLocaleString('th-TH')} />
        <KeyValue label="Source bytes" value={prepared.sourceFileSize.toLocaleString('th-TH')} />
        <KeyValue label="Source SHA-256" value={shortHash(prepared.sourceFileSha256)} />
        <KeyValue label="Payload SHA-256" value={shortHash(prepared.normalizedPayloadHash)} />
      </div>

      <form action={previewAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="payloadJson" value={prepared.payloadJson} />
        <ImportSubmitButton label="Server validate" pendingLabel="กำลัง validate" />
      </form>
      <ActionStateAlert state={previewState} />

      {previewState.status === 'success' && previewState.importId ? (
        <form action={applyAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="payloadJson" value={prepared.payloadJson} />
          <input type="hidden" name="importId" value={previewState.importId} />
          <ImportSubmitButton label="Apply import" pendingLabel="กำลัง apply" />
          <Badge variant="outline">Validated import {shortHash(previewState.importId)}</Badge>
        </form>
      ) : null}
      <ActionStateAlert state={applyState} />
    </div>
  );
}

function ImportSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
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
            {state.importStatus ? <Badge variant="secondary">{state.importStatus}</Badge> : null}
            {state.lockVersion != null ? <Badge variant="outline">lock {state.lockVersion}</Badge> : null}
            {state.changedItems != null ? <Badge variant="outline">{state.changedItems} changed</Badge> : null}
            {state.duplicateRequest ? <Badge variant="outline">duplicate request</Badge> : null}
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
            <TableHead>Row</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Message</TableHead>
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
          แสดง 12 จาก {diagnostics.length.toLocaleString('th-TH')} diagnostics
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
  if (value.length <= 16) return value;
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}
