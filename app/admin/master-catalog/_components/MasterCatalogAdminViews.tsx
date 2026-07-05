import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Database,
  Download,
  FileSpreadsheet,
  History,
  LockKeyhole,
  PackageOpen,
  Printer,
  ShieldAlert,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CatalogAdminGate,
  CatalogAdminOverview,
  CatalogAdminSection,
  CatalogChangeSetSummary,
  CatalogImportSummary,
  CatalogVersionDetail,
  CatalogVersionSummary,
  formatThaiDate,
  formatThaiDateTime,
  formatThaiNumber,
  shortHash,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogDraftCreatePanel,
  MasterCatalogManualMutationPanel,
  MasterCatalogPublishRestorePanel,
} from './MasterCatalogMutationPanel';
import { MasterCatalogImportPanel } from './MasterCatalogImportPanel';
import type {
  CatalogImportDraftOption,
  CatalogImportEvidenceCounts,
} from '@/lib/master-catalog/admin/importContext';
import type { ParseContext } from '@/lib/master-catalog/import/types';

const sectionLinks: Array<{
  section: CatalogAdminSection;
  href: string;
  label: string;
}> = [
  { section: 'overview', href: '/admin/master-catalog', label: 'ภาพรวม' },
  { section: 'versions', href: '/admin/master-catalog/versions', label: 'เวอร์ชัน' },
  { section: 'import', href: '/admin/master-catalog/import', label: 'Import' },
  { section: 'history', href: '/admin/master-catalog/history', label: 'History' },
];

export function MasterCatalogGateView({
  gate,
  activeSection,
}: {
  gate: CatalogAdminGate;
  activeSection: CatalogAdminSection;
}) {
  if (gate.state === 'forbidden') {
    return (
      <MasterCatalogFrame activeSection={activeSection} gate={gate}>
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ไม่มีสิทธิ์เข้าถึง Master Catalog</AlertTitle>
          <AlertDescription>
            บัญชีนี้ต้องเป็นผู้ดูแลระบบสถานะใช้งานก่อนเข้าหน้า Master Catalog ได้
          </AlertDescription>
        </Alert>
      </MasterCatalogFrame>
    );
  }

  if (gate.state === 'disabled') {
    return (
      <MasterCatalogFrame activeSection={activeSection} gate={gate}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Alert>
            <LockKeyhole />
            <AlertTitle>Master Catalog admin ยังถูกปิดไว้</AlertTitle>
            <AlertDescription>
              Feature flag `catalog_admin_enabled` ยังไม่เปิด จึงไม่แสดงเครื่องมือจัดการ catalog ในระบบหลัก
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>สถานะ gate</CardTitle>
              <CardDescription>Local-only readiness</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <KeyValue label="Feature flag" value="Disabled" />
              <KeyValue label="Production touched" value="No" />
              <KeyValue label="Mutation" value="Blocked until WP-4" />
              {gate.flagIssue ? <KeyValue label="Flag note" value={gate.flagIssue} /> : null}
            </CardContent>
          </Card>
        </div>
      </MasterCatalogFrame>
    );
  }

  return null;
}

export function MasterCatalogOverviewView({
  gate,
  overview,
}: {
  gate: CatalogAdminGate;
  overview: CatalogAdminOverview;
}) {
  const phase4Version = overview.versions.find(
    (version) => version.versionString === '2568.1.0',
  ) ?? null;
  const phase4Draft = phase4Version?.status === 'draft' ? phase4Version : null;
  const restorableVersions = overview.versions.filter(
    (version) => version.status === 'active' && !version.isDefault,
  );

  return (
    <MasterCatalogFrame activeSection="overview" gate={gate}>
      <Warnings warnings={overview.warnings} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Current catalog"
          value={overview.defaultVersion?.versionString ?? '-'}
          detail={`${formatThaiNumber(overview.counts.activeDefaultRows)} active rows`}
          icon={Database}
        />
        <MetricCard
          title="Stable identities"
          value={formatThaiNumber(overview.counts.identities)}
          detail={`${formatThaiNumber(overview.counts.itemCodes)} item codes`}
          icon={BookOpen}
        />
        <MetricCard
          title="Categories"
          value={formatThaiNumber(overview.counts.categories)}
          detail={`${formatThaiNumber(overview.counts.codeGroups)} code groups`}
          icon={PackageOpen}
        />
        <MetricCard
          title="Factor F"
          value={overview.factorFDefault.versionString ?? '-'}
          detail="Separate reference set"
          icon={FileSpreadsheet}
        />
      </div>

      <MasterCatalogDraftCreatePanel
        defaultVersionString={overview.defaultVersion?.versionString ?? null}
        draftVersion={phase4Version}
      />

      <MasterCatalogPublishRestorePanel
        draftVersion={phase4Draft}
        currentVersionString={overview.defaultVersion?.versionString ?? null}
        restorableVersions={restorableVersions}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <VersionTable versions={overview.versions.slice(0, 8)} />
        <Card>
          <CardHeader>
            <CardTitle>ล่าสุด</CardTitle>
            <CardDescription>Import และ change set ล่าสุด</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <RecentImports imports={overview.recentImports} compact />
            <RecentChangeSets changeSets={overview.recentChangeSets} compact />
          </CardContent>
        </Card>
      </div>
    </MasterCatalogFrame>
  );
}

export function MasterCatalogVersionsView({
  gate,
  overview,
}: {
  gate: CatalogAdminGate;
  overview: CatalogAdminOverview;
}) {
  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <Warnings warnings={overview.warnings} />
      <VersionTable versions={overview.versions} />
    </MasterCatalogFrame>
  );
}

export function MasterCatalogVersionDetailView({
  gate,
  detail,
}: {
  gate: CatalogAdminGate;
  detail: CatalogVersionDetail;
}) {
  const version = detail.version;

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <Warnings warnings={detail.warnings} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {version.versionString}
              <StatusBadge status={version.status} />
              {version.isDefault ? <Badge variant="secondary">Current default</Badge> : null}
            </CardTitle>
            <CardDescription>{version.name}</CardDescription>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" asChild>
                <a href={`/api/master-catalog/export/excel/${version.id}`}>
                  <Download data-icon="inline-start" />
                  ส่งออก Excel
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/master-catalog/versions/${version.id}/print`}>
                  <Printer data-icon="inline-start" />
                  พิมพ์ / บันทึก PDF
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <KeyValue label="Effective date" value={formatThaiDate(version.effectiveDate)} />
            <KeyValue label="Published at" value={formatThaiDateTime(version.publishedAt)} />
            <KeyValue label="Published by" value={version.publishedByDisplayName ?? '-'} />
            <KeyValue label="Lock version" value={formatThaiNumber(version.lockVersion)} />
            <KeyValue label="Approval ref" value={version.approvalReference ?? '-'} />
            <KeyValue label="Dataset hash" value={version.datasetHash ?? shortHash(version.datasetHash)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Counts</CardTitle>
            <CardDescription>Read-only version state</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <KeyValue label="Rows" value={formatThaiNumber(detail.counts.rows)} />
            <KeyValue label="Active" value={formatThaiNumber(detail.counts.activeRows)} />
            <KeyValue label="Inactive" value={formatThaiNumber(detail.counts.inactiveRows)} />
            <KeyValue label="Categories" value={formatThaiNumber(detail.counts.categories)} />
            <KeyValue label="Code groups" value={formatThaiNumber(detail.counts.codeGroups)} />
          </CardContent>
        </Card>
      </div>

      <MasterCatalogManualMutationPanel
        version={{
          id: version.id,
          versionString: version.versionString,
          status: version.status,
          lockVersion: version.lockVersion,
        }}
        sampleItems={detail.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          unit: item.unit,
          category: item.category,
          isActive: item.isActive,
        }))}
      />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>รายการตัวอย่าง</CardTitle>
          <CardDescription>20 รายการแรกตาม display order</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead className="text-right">วัสดุ</TableHead>
                <TableHead className="text-right">แรงงาน</TableHead>
                <TableHead className="text-right">รวม</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.itemCode}</TableCell>
                  <TableCell>
                    <div className="max-w-[520px] font-medium">{item.itemName}</div>
                    <div className="text-xs text-muted-foreground">{item.category ?? '-'}</div>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(item.materialCost)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(item.laborCost)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(item.unitCost)}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'secondary' : 'outline'}>
                      {item.isActive ? 'active' : 'inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentImports imports={detail.imports} />
        <RecentChangeSets changeSets={detail.changeSets} />
      </div>
    </MasterCatalogFrame>
  );
}

export function MasterCatalogImportView({
  gate,
  history,
  importContext,
}: {
  gate: CatalogAdminGate;
  history: { imports: CatalogImportSummary[]; warnings: string[] };
  importContext: {
    draft: CatalogImportDraftOption | null;
    parseContext: ParseContext;
    evidenceCounts: CatalogImportEvidenceCounts;
  };
}) {
  return (
    <MasterCatalogFrame activeSection="import" gate={gate}>
      <Warnings warnings={history.warnings} />
      <MasterCatalogImportPanel
        draft={importContext.draft}
        parseContext={importContext.parseContext}
        evidenceCounts={importContext.evidenceCounts}
      />
      <RecentImports imports={history.imports} />
    </MasterCatalogFrame>
  );
}

export function MasterCatalogHistoryView({
  gate,
  history,
}: {
  gate: CatalogAdminGate;
  history: {
    imports: CatalogImportSummary[];
    changeSets: CatalogChangeSetSummary[];
    warnings: string[];
  };
}) {
  return (
    <MasterCatalogFrame activeSection="history" gate={gate}>
      <Warnings warnings={history.warnings} />
      <div className="grid gap-4 xl:grid-cols-2">
        <RecentChangeSets changeSets={history.changeSets} />
        <RecentImports imports={history.imports} />
      </div>
    </MasterCatalogFrame>
  );
}

export function MasterCatalogMissingVersionView({ gate }: { gate: CatalogAdminGate }) {
  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>ไม่พบเวอร์ชันที่เลือก</AlertTitle>
        <AlertDescription>ตรวจสอบ version id หรือกลับไปเลือกจากรายการเวอร์ชัน</AlertDescription>
      </Alert>
    </MasterCatalogFrame>
  );
}

function MasterCatalogFrame({
  activeSection,
  gate,
  children,
}: {
  activeSection: CatalogAdminSection;
  gate: CatalogAdminGate;
  children: React.ReactNode;
}) {
  const canShowSections = gate.state === 'enabled';

  return (
    <div className="min-h-dvh overflow-x-hidden bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft data-icon="inline-start" />
                  Admin
                </Link>
              </Button>
              <div className="h-8 border-l border-border" />
              <div>
                <h1 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
                  Master Catalog
                </h1>
                <p className="text-xs text-muted-foreground">
                  NT price catalog administration
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={gate.state === 'enabled' ? 'default' : 'outline'}>
                {gate.state === 'enabled' ? 'Enabled local gate' : 'Feature disabled'}
              </Badge>
              <Badge variant="secondary">Production touched: No</Badge>
            </div>
          </div>
          <div className="h-1 rounded-full bg-nt-yellow" />
          {canShowSections ? <SectionNav activeSection={activeSection} /> : null}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function SectionNav({ activeSection }: { activeSection: CatalogAdminSection }) {
  return (
    <nav aria-label="Master Catalog sections" className="flex flex-wrap gap-2">
      {sectionLinks.map((item) => (
        <Button
          key={item.section}
          variant={item.section === activeSection ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </nav>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Database;
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex min-h-[120px] items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function VersionTable({ versions }: { versions: CatalogVersionSummary[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Catalog versions</CardTitle>
        <CardDescription>Read-only version register</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead>Dataset hash</TableHead>
              <TableHead className="text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  ยังไม่มีเวอร์ชันที่แสดงได้
                </TableCell>
              </TableRow>
            ) : (
              versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="font-medium">{version.versionString}</div>
                    <div className="text-xs text-muted-foreground">{version.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge status={version.status} />
                      {version.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatThaiNumber(version.itemCount)}</TableCell>
                  <TableCell>{formatThaiDate(version.effectiveDate)}</TableCell>
                  <TableCell className="font-mono text-xs">{shortHash(version.datasetHash)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/master-catalog/versions/${version.id}`}>เปิด</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RecentImports({
  imports,
  compact = false,
}: {
  imports: CatalogImportSummary[];
  compact?: boolean;
}) {
  if (compact) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <FileSpreadsheet className="size-4" />
            Imports
          </h2>
          <p className="text-sm text-muted-foreground">Source fingerprints and validation state</p>
        </div>
        <ImportRows imports={imports} compact />
      </section>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="size-4" />
          Imports
        </CardTitle>
        <CardDescription>Source fingerprints and validation state</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ImportRows imports={imports} />
      </CardContent>
    </Card>
  );
}

function RecentChangeSets({
  changeSets,
  compact = false,
}: {
  changeSets: CatalogChangeSetSummary[];
  compact?: boolean;
}) {
  if (compact) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <History className="size-4" />
            Change sets
          </h2>
          <p className="text-sm text-muted-foreground">Append-only catalog audit trail</p>
        </div>
        <ChangeSetRows changeSets={changeSets} compact />
      </section>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Change sets
        </CardTitle>
        <CardDescription>Append-only catalog audit trail</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ChangeSetRows changeSets={changeSets} />
      </CardContent>
    </Card>
  );
}

function ImportRows({
  imports,
  compact = false,
}: {
  imports: CatalogImportSummary[];
  compact?: boolean;
}) {
  if (imports.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มี import batch</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead>Status</TableHead>
          {!compact ? <TableHead>Hash</TableHead> : null}
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {imports.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="max-w-[260px] truncate font-medium">{item.sourceFilename}</div>
              <div className="text-xs text-muted-foreground">
                {item.mode} · {formatThaiNumber(item.sourceFileSize)} bytes
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.status === 'rejected' ? 'destructive' : 'secondary'}>
                {item.status}
              </Badge>
            </TableCell>
            {!compact ? (
              <TableCell className="font-mono text-xs">{shortHash(item.sourceFileSha256)}</TableCell>
            ) : null}
            <TableCell>{formatThaiDateTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ChangeSetRows({
  changeSets,
  compact = false,
}: {
  changeSets: CatalogChangeSetSummary[];
  compact?: boolean;
}) {
  if (changeSets.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มี change set</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Reason</TableHead>
          {!compact ? <TableHead>Actor</TableHead> : null}
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {changeSets.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Badge variant="outline">{item.changeType}</Badge>
            </TableCell>
            <TableCell>
              <div className="max-w-[360px] truncate">{item.reason}</div>
              <div className="text-xs text-muted-foreground">
                lock {item.beforeLockVersion ?? '-'} → {item.afterLockVersion ?? '-'}
              </div>
            </TableCell>
            {!compact ? <TableCell>{item.actorDisplayName}</TableCell> : null}
            <TableCell>{formatThaiDateTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusBadge({ status }: { status: CatalogVersionSummary['status'] }) {
  const variant =
    status === 'active' ? 'default' : status === 'archived' ? 'outline' : 'secondary';

  return <Badge variant={variant}>{status}</Badge>;
}

function Warnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <Alert variant="destructive">
      <ShieldAlert />
      <AlertTitle>ข้อมูลบางส่วนโหลดไม่ครบ</AlertTitle>
      <AlertDescription>
        <ul className="grid gap-1">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border bg-background p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium">{value}</div>
    </div>
  );
}

function formatMoney(value: number): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
