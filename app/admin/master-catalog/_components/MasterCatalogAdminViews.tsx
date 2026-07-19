import Link from 'next/link';
import {
  ArrowLeft,
  ArchiveX,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Database,
  Download,
  FileSpreadsheet,
  History,
  LockKeyhole,
  MapPin,
  PackageOpen,
  Printer,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  CatalogPlacementWorkspace,
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
import { MasterCatalogItemEditor } from './MasterCatalogItemEditor';
import { MasterCatalogHeaderUtilities } from './MasterCatalogHeaderUtilities';
import { MasterCatalogPlacementWorkspaceView } from './MasterCatalogPlacementWorkspace';
import type { CatalogReviewBinding } from '@/lib/master-catalog/admin/reviewBinding';

const sectionLinks: Array<{
  section: CatalogAdminSection;
  href: string;
  label: string;
}> = [
  { section: 'overview', href: '/admin/master-catalog', label: 'บัญชีปัจจุบัน' },
  { section: 'versions', href: '/admin/master-catalog/versions', label: 'ทะเบียนฉบับ' },
  { section: 'history', href: '/admin/master-catalog/history', label: 'ประวัติการเปลี่ยนแปลง' },
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
              <CardDescription>แสดงสถานะโดยไม่เปิดเครื่องมือแก้ไขข้อมูล</CardDescription>
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
  const staleDrafts = overview.drafts.filter(
    (version) =>
      version.status === 'draft'
      && version.basedOnVersionId !== overview.defaultVersion?.id,
  );
  return (
    <MasterCatalogFrame activeSection="overview" gate={gate}>
      <Warnings warnings={overview.warnings} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="บัญชีราคาที่ใช้งาน"
          value={overview.defaultVersion?.officialVersionString ?? '-'}
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
      </div>

      <details className="border-t pt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">
          ข้อมูลอ้างอิงระบบที่แยกจากบัญชีราคา
        </summary>
        <p className="mt-2">
          Factor F ใช้เวอร์ชัน {overview.factorFDefault.versionString ?? '-'} และไม่ได้ถูกแก้ไขจากพื้นที่งานนี้
        </p>
      </details>

      <MasterCatalogDraftCreatePanel
        key={overview.defaultVersion?.id ?? 'no-base'}
        defaultVersionId={overview.defaultVersion?.id ?? null}
        defaultVersionString={overview.defaultVersion?.officialVersionString ?? null}
        draftVersions={overview.drafts}
        versionRegistry={overview.versionRegistry}
      />

      {staleDrafts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>ฉบับร่างฐานเก่า</CardTitle>
            <CardDescription>
              ร่างนี้บล็อกการสร้างร่างใหม่จนกว่าจะยกเลิก หรือคืนเวอร์ชันฐานเดิม
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {staleDrafts.map((draft) => (
              <Button key={draft.id} variant="outline" size="sm" asChild>
                <Link href={`/admin/master-catalog/versions/${draft.id}`}>
                  {draft.draftReference ?? 'ฉบับร่าง'} · เป้าหมาย {draft.targetVersionString}
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
  notice,
}: {
  gate: CatalogAdminGate;
  detail: CatalogVersionDetail;
  notice?: 'import-applied';
}) {
  const version = detail.version;
  const isEditableDraft = version.status === 'draft' && !detail.isStaleDraft;
  const isCurrentVersion = detail.currentVersionId === version.id;

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      {notice === 'import-applied' ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>นำเข้าชุดข้อมูลลงฉบับร่างแล้ว</AlertTitle>
          <AlertDescription>
            ระบบบันทึกผลการนำเข้าและประวัติการเปลี่ยนแปลงไว้ในฉบับร่างนี้แล้ว
            โปรดตรวจรายการที่เปลี่ยนก่อนตรวจฉบับสุดท้าย
          </AlertDescription>
        </Alert>
      ) : null}
      <Warnings warnings={detail.warnings} />
      {detail.isStaleDraft ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า</AlertTitle>
          <AlertDescription>
            เปิดดูรายการและประวัติได้ แต่แก้ไข นำเข้า หรือเผยแพร่ไม่ได้ ร่างนี้ยังเป็นร่างเดียวที่เปิดอยู่ จึงต้องยกเลิกร่างพร้อมเหตุผล หรือคืนเวอร์ชันฐานเดิมก่อนทำงานต่อ
          </AlertDescription>
        </Alert>
      ) : null}
      {version.status === 'abandoned' ? (
        <Alert>
          <ArchiveX />
          <AlertTitle>ฉบับร่างนี้ถูกยกเลิกและเก็บเป็นประวัติแล้ว</AlertTitle>
          <AlertDescription>
            รหัสร่าง {version.draftReference ?? '-'} และข้อมูลทั้งหมดเปิดดูย้อนหลังได้ แต่แก้ไข นำเข้า เผยแพร่ หรือส่งออกเป็นเอกสารทางการไม่ได้ เลขเป้าหมาย {version.targetVersionString} ไม่ได้ถูกออกเป็นเลขทางการและนำไปใช้กับร่างใหม่ได้
          </AlertDescription>
        </Alert>
      ) : null}
      <section className="grid gap-4 border-b pb-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                {version.status === 'draft' || version.status === 'abandoned'
                  ? version.draftReference ?? 'ฉบับร่าง'
                  : version.officialVersionString ?? version.targetVersionString}
              </h2>
              <StatusBadge status={version.status} />
              {version.status === 'draft' || version.status === 'abandoned' ? (
                <Badge variant="outline">เป้าหมาย {version.targetVersionString}</Badge>
              ) : null}
              {isCurrentVersion ? <Badge variant="secondary">ใช้งานปัจจุบัน</Badge> : null}
              {detail.baseVersion ? (
                <Badge variant="outline">
                  ฐาน {detail.baseVersion.officialVersionString ?? detail.baseVersion.targetVersionString}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{version.name}</p>
          </div>
          {version.status !== 'abandoned' ? (
            <div className="flex flex-wrap gap-2">
              {isEditableDraft
                && detail.publishReadiness?.placementGovernanceAvailable
                && (detail.publishReadiness.newIdentityCount > 0) ? (
                <Button size="sm" asChild>
                  <Link href={`/admin/master-catalog/versions/${version.id}/placement`}>
                    <MapPin data-icon="inline-start" />
                    จัดตำแหน่งรายการใหม่
                  </Link>
                </Button>
              ) : null}
              {isEditableDraft ? (
                <Button
                  size="sm"
                  variant={detail.publishReadiness?.newIdentityCount ? 'outline' : 'default'}
                  asChild
                >
                  <Link href={`/admin/master-catalog/versions/${version.id}/review`}>
                    <ClipboardCheck data-icon="inline-start" />
                    ตรวจฉบับสุดท้าย
                  </Link>
                </Button>
              ) : null}
              {isEditableDraft ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/master-catalog/versions/${version.id}/import`}>
                    <Upload data-icon="inline-start" />
                    นำเข้าชุดข้อมูล
                  </Link>
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download data-icon="inline-start" />
                    {version.status === 'draft' ? 'ส่งออกเพื่อตรวจ' : 'ส่งออกเอกสาร'}
                    <ChevronDown data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href={`/api/master-catalog/export/excel/${version.id}`}>
                      <FileSpreadsheet />
                      Excel สำหรับตรวจสอบ
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/master-catalog/versions/${version.id}/print`}>
                      <Printer />
                      PDF สำหรับอ่าน/พิมพ์
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">ทั้งหมด {formatThaiNumber(detail.counts.rows)} รายการ</Badge>
          <Badge variant="outline">ใช้งาน {formatThaiNumber(detail.counts.activeRows)}</Badge>
          <Badge variant="outline">ยกเลิกใช้ {formatThaiNumber(detail.counts.inactiveRows)}</Badge>
          <Badge variant="outline">รุ่นแก้ไข {formatThaiNumber(version.lockVersion)}</Badge>
        </div>
      </section>

      <MasterCatalogVersionWorkspace
        version={{
          id: version.id,
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
        allowAdd={
          detail.capabilities.newIdentityEnabled
          && detail.publishReadiness?.placementGovernanceAvailable === true
        }
      />

      <section className="grid gap-4 border-t pt-6" aria-labelledby="version-document-heading">
        <div>
          <h2 id="version-document-heading" className="text-base font-semibold">
            ข้อมูลเวอร์ชันและเอกสาร
          </h2>
          <p className="text-sm text-muted-foreground">
            ข้อมูลอ้างอิงสำหรับการเผยแพร่ การตรวจสอบย้อนหลัง และการจัดเก็บเอกสาร
          </p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <KeyValue label="วันที่มีผล" value={formatThaiDate(version.effectiveDate)} />
          <KeyValue label="เผยแพร่เมื่อ" value={formatThaiDateTime(version.publishedAt)} />
          <KeyValue label="ผู้เผยแพร่" value={version.publishedByDisplayName ?? '-'} />
          <KeyValue label="เลขที่เอกสารอนุมัติ" value={version.approvalReference ?? '-'} />
          <KeyValue label="วันที่เอกสารอนุมัติ" value={formatThaiDate(version.approvalDocumentDate)} />
          <KeyValue label="ที่เก็บเอกสารและไฟล์ฉบับอนุมัติ" value={version.physicalArchiveReference ?? '-'} />
          {version.status === 'active' || version.status === 'archived' ? (
            <KeyValue label="รหัสร่างต้นทาง" value={version.draftReference ?? '-'} />
          ) : null}
          <KeyValue label="ค่าแฮชชุดข้อมูล" value={shortHash(version.datasetHash)} />
          <KeyValue label="หมวดงาน" value={formatThaiNumber(detail.counts.categories)} />
          <KeyValue label="กลุ่มรหัส" value={formatThaiNumber(detail.counts.codeGroups)} />
        </div>
      </section>

      {version.status === 'active' && !isCurrentVersion ? (
        <MasterCatalogPublishRestorePanel
          draftVersion={null}
          draftReadiness={null}
          currentVersionString={
            detail.currentVersion?.officialVersionString
            ?? detail.currentVersion?.targetVersionString
            ?? null
          }
          openDraft={detail.openDraft ? {
            id: detail.openDraft.id,
            draftReference: detail.openDraft.draftReference,
            targetVersionString: detail.openDraft.targetVersionString,
            basedOnVersionId: detail.openDraft.basedOnVersionId,
          } : null}
          restorableVersions={[{
            id: version.id,
            officialVersionString:
              version.officialVersionString ?? version.targetVersionString,
            itemCount: version.itemCount,
            datasetHash: version.datasetHash,
          }]}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentImports imports={detail.imports} />
        <RecentChangeSets changeSets={detail.changeSets} />
      </div>

      {version.status === 'draft' ? (
        <MasterCatalogDraftAbandonPanel
          draftVersion={{
            id: version.id,
            targetVersionString: version.targetVersionString,
            draftReference: version.draftReference,
            lockVersion: version.lockVersion,
          }}
        />
      ) : null}
    </MasterCatalogFrame>
  );
}

export function MasterCatalogPlacementView({
  gate,
  workspace,
}: {
  gate: CatalogAdminGate;
  workspace: CatalogPlacementWorkspace;
}) {
  const readiness = workspace.readiness;

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <Warnings warnings={workspace.warnings} />
      <section className="grid gap-4 border-b pb-5">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href={`/admin/master-catalog/versions/${workspace.version.id}`}>
            <ArrowLeft data-icon="inline-start" />
            กลับพื้นที่ทำงานของฉบับร่าง
          </Link>
        </Button>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="size-5" />
              <h2 className="text-xl font-semibold">ยืนยันตำแหน่งรายการใหม่</h2>
              <Badge variant="secondary">
                {workspace.version.draftReference ?? 'ฉบับร่าง'}
              </Badge>
              <Badge variant="outline">
                เป้าหมาย {workspace.version.targetVersionString}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ตรวจตำแหน่งที่ระบบจัดให้ แก้เฉพาะรายการที่ต้องการ แล้วบันทึกทั้งชุดเพียงครั้งเดียว
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              รายการใหม่ {workspace.newItems.length.toLocaleString('th-TH')}
            </Badge>
          </div>
        </div>
      </section>

      {readiness?.placementReviewRequired && !readiness.placementReviewCurrent ? (
        <Alert>
          <MapPin />
          <AlertTitle>ยังต้องยืนยันตำแหน่งก่อนเผยแพร่</AlertTitle>
          <AlertDescription>
            รายการใหม่ทั้งหมดอยู่ในฉบับร่างอย่างปลอดภัย และจะยังไม่เปลี่ยนเวอร์ชันใช้งานจนกว่างานนี้ผ่าน
          </AlertDescription>
        </Alert>
      ) : null}

      <MasterCatalogPlacementWorkspaceView
        key={`${workspace.version.id}:${workspace.version.lockVersion}:${workspace.placementRevision}`}
        workspace={workspace}
      />
    </MasterCatalogFrame>
  );
}

export function MasterCatalogVersionReviewView({
  gate,
  review,
  reviewBinding,
}: {
  gate: CatalogAdminGate;
  review: CatalogVersionReview;
  reviewBinding: CatalogReviewBinding;
}) {
  const { version, baseVersion, snapshot, publishReadiness } = review;
  const isDraftReview = version.status === 'draft';
  const isStaleReview = reviewBinding.state === 'stale';
  const reviewLockVersion = isDraftReview
    ? reviewBinding.requestedLockVersion
    : version.lockVersion;
  const versionLabel = isDraftReview || version.status === 'abandoned'
    ? version.draftReference ?? 'ฉบับร่าง'
    : version.officialVersionString ?? version.targetVersionString;
  const latestReviewHref = reviewBinding.currentLockVersion === null
    ? null
    : `/admin/master-catalog/versions/${version.id}/review?reviewLock=${reviewBinding.currentLockVersion}`;
  const reviewedVersionLabel = isDraftReview
    ? `ฉบับร่าง ${version.draftReference ?? version.targetVersionString} (เป้าหมาย ${version.targetVersionString})`
    : version.status === 'abandoned'
      ? `ฉบับร่างที่ยกเลิก ${version.draftReference ?? version.targetVersionString}`
      : `เวอร์ชัน ${version.officialVersionString ?? version.targetVersionString}`;
  const reviewHeading = isDraftReview
    ? 'ตรวจฉบับสุดท้ายก่อนเผยแพร่'
    : version.status === 'abandoned'
      ? 'ผลเปรียบเทียบฉบับร่างที่ยกเลิก'
      : 'ผลเปรียบเทียบฉบับที่เผยแพร่';

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/master-catalog/versions/${version.id}`}>
            <ArrowLeft data-icon="inline-start" />
            {isDraftReview ? 'กลับไปแก้ไขฉบับร่าง' : `กลับไปยัง ${versionLabel}`}
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{versionLabel}</Badge>
          <StatusBadge status={version.status} />
          {isDraftReview || version.status === 'abandoned' ? (
            <Badge variant="outline">เป้าหมาย {version.targetVersionString}</Badge>
          ) : null}
          <Badge variant="outline">
            ฐาน {baseVersion.officialVersionString ?? baseVersion.targetVersionString}
          </Badge>
          <Badge variant="outline">
            {isDraftReview ? 'ฉบับตรวจ ' : ''}รุ่นแก้ไข {reviewLockVersion ?? '-'}
          </Badge>
          {isStaleReview && reviewBinding.currentLockVersion !== null ? (
            <Badge variant="outline">ล่าสุด {reviewBinding.currentLockVersion}</Badge>
          ) : null}
        </div>
      </div>

      <Warnings warnings={review.warnings} />

      <section className="grid gap-2 border-b pb-4">
        <h2 className="text-lg font-semibold">{reviewHeading}</h2>
        <p className="text-sm text-muted-foreground">
          {isDraftReview
            ? 'ผลด้านล่างผูกกับรุ่นแก้ไขที่ระบุในแท็บนี้ และเปรียบเทียบรายการทั้งหมดกับเวอร์ชันฐานด้วยตัวตนรายการเดียวกัน'
            : 'ผลด้านล่างใช้ตรวจสอบย้อนหลัง โดยเปรียบเทียบรายการทั้งหมดกับเวอร์ชันฐานด้วยตัวตนรายการเดียวกัน'}
        </p>
      </section>

      {isStaleReview ? (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>ฉบับตรวจในแท็บนี้เป็นรุ่นเก่าและเผยแพร่ไม่ได้</AlertTitle>
          <AlertDescription>
            <div className="grid gap-3">
              <p>
                แท็บนี้ผูกกับรุ่นแก้ไข {reviewBinding.requestedLockVersion ?? '-'} แต่ฉบับร่างล่าสุดเป็นรุ่นแก้ไข {reviewBinding.currentLockVersion ?? '-'}
                {' '}ระบบจะไม่เปลี่ยนแท็บนี้เป็นฉบับล่าสุดโดยอัตโนมัติ
              </p>
              {latestReviewHref ? (
                <Button variant="outline" className="w-fit" asChild>
                  <Link href={latestReviewHref}>
                    <ClipboardCheck data-icon="inline-start" />
                    เปิดฉบับตรวจล่าสุด
                  </Link>
                </Button>
              ) : null}
            </div>
          </AlertDescription>
        </Alert>
      ) : snapshot.state !== 'ready' || !snapshot.diff ? (
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
          baseVersionString={
            baseVersion.officialVersionString ?? baseVersion.targetVersionString
          }
          reviewedVersionLabel={reviewedVersionLabel}
          diff={snapshot.diff}
          reviewLockVersion={isDraftReview ? reviewLockVersion : null}
          editable={isDraftReview && review.isCurrentBase}
        />
      )}

      {isDraftReview && !review.isCurrentBase ? (
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
        && reviewBinding.state === 'current'
        && snapshot.state === 'ready'
        && snapshot.reviewedLockVersion !== null ? (
          <MasterCatalogPublishRestorePanel
            key={`${version.id}:${reviewBinding.requestedLockVersion}`}
            draftVersion={{
              id: version.id,
              targetVersionString: version.targetVersionString,
              draftReference: version.draftReference,
              lockVersion: reviewBinding.requestedLockVersion
                ?? snapshot.reviewedLockVersion,
              itemCount: publishReadiness?.dataset?.itemCount ?? version.itemCount,
              datasetHash: publishReadiness?.dataset?.datasetHash ?? version.datasetHash,
            }}
            draftReadiness={publishReadiness}
            currentVersionString={
              review.baseVersion.officialVersionString
              ?? review.baseVersion.targetVersionString
            }
            openDraft={null}
            restorableVersions={[]}
          />
        ) : null}

      {version.status !== 'draft' ? (
        <Alert>
          <ArchiveX />
          <AlertTitle>
            {version.status === 'abandoned'
              ? 'ฉบับร่างนี้ถูกยกเลิกและเปิดตรวจย้อนหลังเท่านั้น'
              : 'เวอร์ชันนี้เผยแพร่แล้วและเปิดตรวจย้อนหลังเท่านั้น'}
          </AlertTitle>
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
    baseVersionString: string | null;
    parseContext: ParseContext;
    evidenceCounts: CatalogImportEvidenceCounts;
    authorityReady: boolean;
    capabilities: {
      newIdentityEnabled: boolean;
      retirementEnabled: boolean;
    };
  };
}) {
  const draft = importContext.draft;

  return (
    <MasterCatalogFrame activeSection="versions" gate={gate}>
      {draft ? (
        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" className="self-start" asChild>
            <Link href={`/admin/master-catalog/versions/${draft.id}`}>
              <ArrowLeft data-icon="inline-start" />
              กลับพื้นที่ทำงานของฉบับร่าง
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{draft.draftReference ?? 'ฉบับร่าง'}</Badge>
            <Badge variant="outline">เป้าหมาย {draft.targetVersionString}</Badge>
            <Badge variant="outline">
              ฐาน {importContext.baseVersionString ?? (draft.isCurrentBase ? 'ปัจจุบัน' : 'เก่า')}
            </Badge>
            <Badge variant="outline">รุ่นแก้ไข {draft.lockVersion}</Badge>
          </div>
        </div>
      ) : null}
      <Warnings warnings={history.warnings} />
      <MasterCatalogImportPanel
        key={`${importContext.draft?.id ?? 'no-draft'}:${importContext.draft?.lockVersion ?? 0}`}
        draft={importContext.draft}
        baseVersionString={importContext.baseVersionString}
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
            <MasterCatalogHeaderUtilities gateState={gate.state} />
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
                    <div className="font-medium">
                      {version.status === 'draft' || version.status === 'abandoned'
                        ? version.draftReference ?? 'ฉบับร่าง'
                        : version.officialVersionString ?? version.targetVersionString}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {version.status === 'draft' || version.status === 'abandoned'
                        ? `เป้าหมาย ${version.targetVersionString} · ${version.name}`
                        : version.name}
                    </div>
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
              {item.pointerBeforeVersionId && item.pointerAfterVersionId ? (
                <div className="text-xs text-muted-foreground">
                  บันทึกเวอร์ชันใช้งานก่อนและหลังไว้ในหลักฐานแล้ว
                </div>
              ) : null}
              {item.draftEffect ? (
                <div className="text-xs text-muted-foreground">
                  {draftEffectLabel(item.draftEffect)}
                </div>
              ) : null}
            </TableCell>
            {!compact ? <TableCell>{item.actorDisplayName}</TableCell> : null}
            <TableCell>{formatThaiDateTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function draftEffectLabel(effect: NonNullable<CatalogChangeSetSummary['draftEffect']>): string {
  return ({
    none: 'ไม่มีฉบับร่างได้รับผล',
    becomes_current: 'ฉบับร่างกลับมาอ้างอิงฐานปัจจุบัน',
    becomes_stale: 'ฉบับร่างเปลี่ยนเป็นฐานเก่า',
    remains_stale: 'ฉบับร่างยังคงเป็นฐานเก่า',
  } as const)[effect];
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
    clone: 'สร้างฉบับร่างจากเวอร์ชันฐาน',
    manual: 'แก้ไขรายรายการ',
    import: 'นำเข้า',
    abandon: 'ยกเลิกฉบับร่าง',
    publish: 'เผยแพร่',
    restore: 'คืนเวอร์ชันใช้งาน',
    placement: 'ยืนยันตำแหน่งรายการใหม่',
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
