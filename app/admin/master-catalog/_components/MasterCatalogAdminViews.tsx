import Link from 'next/link';
import {
  ArrowLeft,
  ArchiveX,
  BookOpen,
  ClipboardCheck,
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
  CatalogRegisterPage,
  CatalogVersionDetail,
  CatalogVersionReview,
  CatalogVersionSummary,
  formatThaiDate,
  formatThaiDateTime,
  formatThaiNumber,
  shortHash,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogDraftAbandonPanel,
  MasterCatalogDraftCreatePanel,
  MasterCatalogPublishRestorePanel,
} from './MasterCatalogMutationPanel';
import { MasterCatalogVersionWorkspace } from './MasterCatalogVersionWorkspace';
import { MasterCatalogFinalReviewWorkspace } from './MasterCatalogFinalReviewWorkspace';
import { MasterCatalogImportPanel } from './MasterCatalogImportPanel';
import type {
  CatalogImportDraftOption,
  CatalogImportEvidenceCounts,
} from '@/lib/master-catalog/admin/importContext';
import type { ParseContext } from '@/lib/master-catalog/import/types';
import type {
  CatalogIdentityHistoryPage,
  CatalogItemDetail,
} from '@/lib/master-catalog/admin/catalogWorkspace';
import { suggestNextCatalogRevision } from '@/lib/master-catalog/versioning';
import { MasterCatalogItemEditor } from './MasterCatalogItemEditor';

const sectionLinks: Array<{
  section: CatalogAdminSection;
  href: string;
  label: string;
}> = [
  { section: 'overview', href: '/admin/master-catalog', label: 'ภาพรวม' },
  { section: 'versions', href: '/admin/master-catalog/versions', label: 'เวอร์ชัน' },
  { section: 'import', href: '/admin/master-catalog/import', label: 'นำเข้า' },
  { section: 'history', href: '/admin/master-catalog/history', label: 'ประวัติ' },
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
            <AlertTitle>ระบบบัญชีราคาสำหรับผู้ดูแลยังถูกปิดไว้</AlertTitle>
            <AlertDescription>
              ระบบบริหารบัญชีราคายังไม่เปิดใช้งาน จึงไม่แสดงเครื่องมือแก้ไขข้อมูล
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>สถานะการเปิดใช้งาน</CardTitle>
              <CardDescription>ตรวจความพร้อมเฉพาะฐานข้อมูล Local</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <KeyValue label="สถานะ" value="ปิดใช้งาน" />
              {gate.flagIssue ? <KeyValue label="หมายเหตุ" value={gate.flagIssue} /> : null}
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
  const currentBaseDrafts = overview.drafts.filter(
    (version) =>
      version.status === 'draft'
      && version.basedOnVersionId === overview.defaultVersion?.id,
  );
  const staleDrafts = overview.drafts.filter(
    (version) =>
      version.status === 'draft'
      && version.basedOnVersionId !== overview.defaultVersion?.id,
  );
  const suggestedVersion = suggestNextCatalogRevision(
    overview.defaultVersion?.versionString ?? null,
  );

  return (
    <MasterCatalogFrame activeSection="overview" gate={gate}>
      <Warnings warnings={overview.warnings} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="บัญชีราคาที่ใช้งาน"
          value={overview.defaultVersion?.versionString ?? '-'}
          detail={`${formatThaiNumber(overview.counts.activeDefaultRows)} รายการใช้งาน`}
          icon={Database}
        />
        <MetricCard
          title="รายการที่มีตัวตนถาวร"
          value={formatThaiNumber(overview.counts.identities)}
          detail={`${formatThaiNumber(overview.counts.itemCodes)} รหัสในประวัติ`}
          icon={BookOpen}
        />
        <MetricCard
          title="หมวดงาน"
          value={formatThaiNumber(overview.counts.categories)}
          detail={`${formatThaiNumber(overview.counts.codeGroups)} กลุ่มรหัส`}
          icon={PackageOpen}
        />
        <MetricCard
          title="Factor F"
          value={overview.factorFDefault.versionString ?? '-'}
          detail="ชุดข้อมูลอ้างอิงแยกจากบัญชีราคา"
          icon={FileSpreadsheet}
        />
      </div>

      <MasterCatalogDraftCreatePanel
        defaultVersionString={overview.defaultVersion?.versionString ?? null}
        draftVersions={currentBaseDrafts}
        suggestedVersion={suggestedVersion}
      />

      {staleDrafts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>ฉบับร่างฐานเก่า</CardTitle>
            <CardDescription>เปิดตรวจย้อนหลังได้ แต่แก้ไขและเผยแพร่ไม่ได้</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {staleDrafts.map((draft) => (
              <Button key={draft.id} variant="outline" size="sm" asChild>
                <Link href={`/admin/master-catalog/versions/${draft.id}`}>
                  {draft.versionString}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <VersionTable versions={overview.versions.slice(0, 8)} />
        <Card>
          <CardHeader>
            <CardTitle>รายการล่าสุด</CardTitle>
            <CardDescription>การนำเข้าและการเปลี่ยนแปลงล่าสุด</CardDescription>
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
  page,
}: {
  gate: CatalogAdminGate;
  page: CatalogRegisterPage<CatalogVersionSummary>;
}) {
  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <Warnings warnings={page.warnings} />
      <VersionTable versions={page.rows} />
      {page.nextCursor ? (
        <Button variant="outline" asChild>
          <Link href={`/admin/master-catalog/versions?before=${encodeURIComponent(page.nextCursor.createdAt)}&beforeId=${page.nextCursor.id}`}>
            ดูเวอร์ชันก่อนหน้า
          </Link>
        </Button>
      ) : null}
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
      {detail.isStaleDraft ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า</AlertTitle>
          <AlertDescription>
            เปิดดูรายการและประวัติได้ แต่แก้ไข นำเข้า หรือเผยแพร่ไม่ได้ ให้สร้างฉบับร่างใหม่จากเวอร์ชันใช้งานปัจจุบันแล้วนำการเปลี่ยนแปลงที่ยังต้องการมาใช้ใหม่
          </AlertDescription>
        </Alert>
      ) : null}
      {version.status === 'abandoned' ? (
        <Alert>
          <ArchiveX />
          <AlertTitle>ฉบับร่างนี้ถูกยกเลิกและเก็บเป็นประวัติแล้ว</AlertTitle>
          <AlertDescription>
            เปิดดูรายการและประวัติได้ แต่แก้ไข นำเข้า เผยแพร่ หรือส่งออกเป็นเอกสารทางการไม่ได้
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {version.versionString}
              <StatusBadge status={version.status} />
              {version.isDefault ? <Badge variant="secondary">ใช้งานปัจจุบัน</Badge> : null}
            </CardTitle>
            <CardDescription>{version.name}</CardDescription>
            {version.status !== 'abandoned' ? (
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
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <KeyValue label="วันที่มีผล" value={formatThaiDate(version.effectiveDate)} />
            <KeyValue label="เผยแพร่เมื่อ" value={formatThaiDateTime(version.publishedAt)} />
            <KeyValue label="ผู้เผยแพร่" value={version.publishedByDisplayName ?? '-'} />
            <KeyValue label="รุ่นการแก้ไข" value={formatThaiNumber(version.lockVersion)} />
            <KeyValue label="เลขที่เอกสารอนุมัติ" value={version.approvalReference ?? '-'} />
            <KeyValue label="วันที่เอกสารอนุมัติ" value={formatThaiDate(version.approvalDocumentDate)} />
            <KeyValue label="ที่เก็บเอกสารและไฟล์ฉบับอนุมัติ" value={version.physicalArchiveReference ?? '-'} />
            <KeyValue label="ค่าแฮชชุดข้อมูล" value={shortHash(version.datasetHash)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>จำนวนข้อมูล</CardTitle>
            <CardDescription>สถานะของเวอร์ชันนี้</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <KeyValue label="ทั้งหมด" value={formatThaiNumber(detail.counts.rows)} />
            <KeyValue label="ใช้งาน" value={formatThaiNumber(detail.counts.activeRows)} />
            <KeyValue label="ยกเลิกใช้" value={formatThaiNumber(detail.counts.inactiveRows)} />
            <KeyValue label="หมวดงาน" value={formatThaiNumber(detail.counts.categories)} />
            <KeyValue label="กลุ่มรหัส" value={formatThaiNumber(detail.counts.codeGroups)} />
          </CardContent>
        </Card>
      </div>

      {version.status === 'active' && !version.isDefault ? (
        <MasterCatalogPublishRestorePanel
          draftVersion={null}
          draftReadiness={null}
          currentVersionString={null}
          restorableVersions={[{
            id: version.id,
            versionString: version.versionString,
            itemCount: version.itemCount,
            datasetHash: version.datasetHash,
          }]}
        />
      ) : null}

      <MasterCatalogVersionWorkspace
        version={{
          id: version.id,
          versionString: version.versionString,
          lockVersion: version.lockVersion,
        }}
        items={detail.items}
        totalItems={detail.counts.rows ?? detail.items.length}
        categories={detail.categories}
        codeGroups={detail.codeGroups}
        editable={
          version.status === 'draft'
          && !detail.isStaleDraft
          && detail.items.length === (detail.counts.rows ?? detail.items.length)
        }
        allowAdd={detail.capabilities.newIdentityEnabled}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentImports imports={detail.imports} />
        <RecentChangeSets changeSets={detail.changeSets} />
      </div>

      {version.status === 'draft' && !detail.isStaleDraft ? (
        <section className="flex flex-col gap-3 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">ตรวจการเปลี่ยนแปลงก่อนเผยแพร่</h2>
            <p className="text-sm text-muted-foreground">
              ตรวจผลรวมของการแก้ไขรายรายการและการนำเข้ากับเวอร์ชันฐาน แล้วจึงกรอกข้อมูลเผยแพร่
            </p>
          </div>
          <Button asChild>
            <Link href={`/admin/master-catalog/versions/${version.id}/review`}>
              <ClipboardCheck data-icon="inline-start" />
              ตรวจฉบับสุดท้าย
            </Link>
          </Button>
        </section>
      ) : null}

      {version.status === 'draft' && !detail.isStaleDraft ? (
        <MasterCatalogDraftAbandonPanel
          draftVersion={{
            id: version.id,
            versionString: version.versionString,
            lockVersion: version.lockVersion,
          }}
        />
      ) : null}
    </MasterCatalogFrame>
  );
}

export function MasterCatalogVersionReviewView({
  gate,
  review,
}: {
  gate: CatalogAdminGate;
  review: CatalogVersionReview;
}) {
  const { version, baseVersion, snapshot, publishReadiness } = review;

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/master-catalog/versions/${version.id}`}>
            <ArrowLeft data-icon="inline-start" />
            กลับไปแก้ไขฉบับร่าง
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">ฉบับร่าง {version.versionString}</Badge>
          <Badge variant="outline">ฐาน {baseVersion.versionString}</Badge>
          <Badge variant="outline">รุ่นแก้ไข {version.lockVersion}</Badge>
        </div>
      </div>

      <Warnings warnings={review.warnings} />

      <section className="grid gap-2 border-b pb-4">
        <h2 className="text-lg font-semibold">ตรวจฉบับสุดท้ายก่อนเผยแพร่</h2>
        <p className="text-sm text-muted-foreground">
          ผลด้านล่างมาจากรายการทั้งหมดของฉบับร่างและเวอร์ชันฐานที่อ่านจากฐานข้อมูลด้วยตัวตนรายการเดียวกัน
        </p>
      </section>

      {snapshot.state !== 'ready' || !snapshot.diff ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ยังยืนยันผลเปรียบเทียบฉบับสุดท้ายไม่ได้</AlertTitle>
          <AlertDescription>
            <ul className="grid gap-1">
              {snapshot.issues.map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <MasterCatalogFinalReviewWorkspace
          versionId={version.id}
          baseVersionString={baseVersion.versionString}
          draftVersionString={version.versionString}
          diff={snapshot.diff}
        />
      )}

      {!review.isCurrentBase ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า</AlertTitle>
          <AlertDescription>
            เปิดผลเปรียบเทียบย้อนหลังได้ แต่เผยแพร่ไม่ได้ ให้กลับไปสร้างฉบับร่างจากเวอร์ชันใช้งานปัจจุบัน
          </AlertDescription>
        </Alert>
      ) : null}

      {version.status === 'draft'
        && review.isCurrentBase
        && snapshot.state === 'ready'
        && snapshot.reviewedLockVersion !== null ? (
          <MasterCatalogPublishRestorePanel
            draftVersion={{
              id: version.id,
              versionString: version.versionString,
              lockVersion: snapshot.reviewedLockVersion,
              itemCount: publishReadiness?.dataset?.itemCount ?? version.itemCount,
              datasetHash: publishReadiness?.dataset?.datasetHash ?? version.datasetHash,
            }}
            draftReadiness={publishReadiness}
            currentVersionString={review.baseVersion.versionString}
            restorableVersions={[]}
          />
        ) : null}

      {version.status !== 'draft' ? (
        <Alert>
          <ArchiveX />
          <AlertTitle>เวอร์ชันนี้เปิดตรวจย้อนหลังเท่านั้น</AlertTitle>
          <AlertDescription>
            สถานะ {statusLabel(version.status)} ไม่อนุญาตให้แก้ไขหรือเผยแพร่ซ้ำ
          </AlertDescription>
        </Alert>
      ) : null}
    </MasterCatalogFrame>
  );
}

export function MasterCatalogItemDetailView({
  gate,
  item,
  history,
}: {
  gate: CatalogAdminGate;
  item: CatalogItemDetail;
  history: CatalogIdentityHistoryPage;
}) {
  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <MasterCatalogItemEditor
        key={`${item.identityId}:${item.lockVersion}:${item.capabilities.retirementEnabled}`}
        item={item}
        history={history}
      />
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
    drafts: CatalogImportDraftOption[];
    draft: CatalogImportDraftOption | null;
    parseContext: ParseContext;
    evidenceCounts: CatalogImportEvidenceCounts;
    authorityReady: boolean;
    capabilities: {
      newIdentityEnabled: boolean;
      retirementEnabled: boolean;
    };
  };
}) {
  return (
    <MasterCatalogFrame activeSection="import" gate={gate}>
      <Warnings warnings={history.warnings} />
      <MasterCatalogImportPanel
        key={`${importContext.draft?.id ?? 'no-draft'}:${importContext.draft?.lockVersion ?? 0}`}
        drafts={importContext.drafts}
        draft={importContext.draft}
        parseContext={importContext.parseContext}
        evidenceCounts={importContext.evidenceCounts}
        authorityReady={importContext.authorityReady}
        capabilities={importContext.capabilities}
      />
      <RecentImports imports={history.imports} />
    </MasterCatalogFrame>
  );
}

export function MasterCatalogHistoryView({
  gate,
  importsPage,
  changeSetsPage,
  importsCursor,
  changesCursor,
}: {
  gate: CatalogAdminGate;
  importsPage: CatalogRegisterPage<CatalogImportSummary>;
  changeSetsPage: CatalogRegisterPage<CatalogChangeSetSummary>;
  importsCursor?: { createdAt: string; id: string };
  changesCursor?: { createdAt: string; id: string };
}) {
  return (
    <MasterCatalogFrame activeSection="history" gate={gate}>
      <Warnings warnings={[...importsPage.warnings, ...changeSetsPage.warnings]} />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid content-start gap-3">
          <RecentChangeSets changeSets={changeSetsPage.rows} />
          {changeSetsPage.nextCursor ? (
            <Button variant="outline" asChild>
              <Link href={historyPageHref({
                imports: importsCursor,
                changes: changeSetsPage.nextCursor,
              })}>
                ดูการเปลี่ยนแปลงก่อนหน้า
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="grid content-start gap-3">
          <RecentImports imports={importsPage.rows} />
          {importsPage.nextCursor ? (
            <Button variant="outline" asChild>
              <Link href={historyPageHref({
                imports: importsPage.nextCursor,
                changes: changesCursor,
              })}>
                ดูการนำเข้าก่อนหน้า
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
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
                  ผู้ดูแลระบบ
                </Link>
              </Button>
              <div className="h-8 border-l border-border" />
              <div>
                <h1 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
                  บัญชีราคามาตรฐาน
                </h1>
                <p className="text-xs text-muted-foreground">
                  ระบบบริหารรายการ หน่วย และราคากลาง
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={gate.state === 'enabled' ? 'default' : 'outline'}>
                {gate.state === 'enabled' ? 'พร้อมใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
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
    <nav aria-label="ส่วนงานบัญชีราคามาตรฐาน" className="flex flex-wrap gap-2">
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
        <CardTitle>ทะเบียนเวอร์ชันบัญชีราคา</CardTitle>
        <CardDescription>เปิดดูรายละเอียดและสถานะของแต่ละเวอร์ชัน</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เวอร์ชัน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>จำนวนรายการ</TableHead>
              <TableHead>วันที่มีผล</TableHead>
              <TableHead>ค่าแฮชชุดข้อมูล</TableHead>
              <TableHead className="text-right">รายละเอียด</TableHead>
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
                      {version.isDefault ? <Badge variant="secondary">ใช้งานปัจจุบัน</Badge> : null}
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
            การนำเข้า
          </h2>
          <p className="text-sm text-muted-foreground">ไฟล์ต้นทางและสถานะการตรวจ</p>
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
          การนำเข้า
        </CardTitle>
        <CardDescription>ไฟล์ต้นทางและสถานะการตรวจ</CardDescription>
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
            การเปลี่ยนแปลง
          </h2>
          <p className="text-sm text-muted-foreground">ประวัติแบบเพิ่มต่อท้ายและแก้ย้อนหลังไม่ได้</p>
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
          การเปลี่ยนแปลง
        </CardTitle>
        <CardDescription>ประวัติแบบเพิ่มต่อท้ายและแก้ย้อนหลังไม่ได้</CardDescription>
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
    return <p className="text-sm text-muted-foreground">ยังไม่มีชุดการนำเข้า</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ไฟล์</TableHead>
          <TableHead>สถานะ</TableHead>
          {!compact ? <TableHead>ค่าแฮชไฟล์</TableHead> : null}
          {!compact ? <TableHead>ที่เก็บไฟล์ต้นฉบับ</TableHead> : null}
          <TableHead>สร้างเมื่อ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {imports.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="max-w-[260px] truncate font-medium">{item.sourceFilename}</div>
              <div className="text-xs text-muted-foreground">
                {importModeLabel(item.mode)} · {formatThaiNumber(item.sourceFileSize)} ไบต์
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={item.status === 'rejected' ? 'destructive' : 'secondary'}>
                {importStatusLabel(item.status)}
              </Badge>
              {item.errorSummary ? (
                <div className="mt-1 max-w-[240px] text-xs text-destructive">{item.errorSummary}</div>
              ) : null}
            </TableCell>
            {!compact ? (
              <TableCell className="font-mono text-xs">{shortHash(item.sourceFileSha256)}</TableCell>
            ) : null}
            {!compact ? (
              <TableCell>
                <div className="max-w-[260px] break-words text-xs">
                  {item.physicalArchiveReference ?? '-'}
                </div>
              </TableCell>
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
    return <p className="text-sm text-muted-foreground">ยังไม่มีชุดการเปลี่ยนแปลง</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ประเภท</TableHead>
          <TableHead>เหตุผล</TableHead>
          {!compact ? <TableHead>ผู้ดำเนินการ</TableHead> : null}
          <TableHead>สร้างเมื่อ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {changeSets.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Badge variant="outline">{changeTypeLabel(item.changeType)}</Badge>
            </TableCell>
            <TableCell>
              <div className="max-w-[360px] truncate">{item.reason}</div>
              <div className="text-xs text-muted-foreground">
                รุ่นแก้ไข {item.beforeLockVersion ?? '-'} → {item.afterLockVersion ?? '-'}
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
    status === 'active' ? 'default' : status === 'draft' ? 'secondary' : 'outline';

  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}

function statusLabel(status: CatalogVersionSummary['status']) {
  return ({
    active: 'เผยแพร่แล้ว',
    archived: 'เก็บถาวร',
    abandoned: 'ยกเลิกฉบับร่าง',
    draft: 'ฉบับร่าง',
  } as Record<CatalogVersionSummary['status'], string>)[status];
}

function importModeLabel(mode: string): string {
  return ({ full: 'ครบทั้งบัญชี', supplement: 'เฉพาะรายการเพิ่มเติม' } as Record<string, string>)[mode]
    ?? mode;
}

function importStatusLabel(status: string): string {
  return ({
    uploaded: 'รับไฟล์แล้ว',
    validated: 'ตรวจสอบแล้ว',
    applied: 'บันทึกแล้ว',
    rejected: 'ไม่ผ่านการตรวจ',
  } as Record<string, string>)[status] ?? status;
}

function changeTypeLabel(changeType: string): string {
  return ({
    create_draft: 'สร้างฉบับร่าง',
    manual: 'แก้ไขรายรายการ',
    import: 'นำเข้า',
    abandon: 'ยกเลิกฉบับร่าง',
    publish: 'เผยแพร่',
    restore: 'คืนเวอร์ชันใช้งาน',
  } as Record<string, string>)[changeType] ?? changeType;
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

function historyPageHref(input: {
  imports?: { createdAt: string; id: string } | null;
  changes?: { createdAt: string; id: string } | null;
}): string {
  const params = new URLSearchParams();
  if (input.imports) {
    params.set('importsBefore', input.imports.createdAt);
    params.set('importsBeforeId', input.imports.id);
  }
  if (input.changes) {
    params.set('changesBefore', input.changes.createdAt);
    params.set('changesBeforeId', input.changes.id);
  }
  return `/admin/master-catalog/history?${params.toString()}`;
}
