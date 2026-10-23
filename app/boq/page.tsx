'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserProfileWithOrg } from '@/lib/types/auth';
import { useBOQList } from '@/lib/boq/useBOQList';
import { LIST_PAGE_SIZE, LIST_SEARCH_MAX_LENGTH, isListAuthorizationError, type BOQListRow, type ListSort } from '@/lib/boq/list';
import { useAuth } from '@/lib/context/AuthContext';
import { can } from '@/lib/permissions';
import { requireActiveProfile } from '@/lib/auth/authorization';
import { isFactorSnapshotUsable } from '@/lib/factorF';
import {
  duplicateBOQAtomic,
  getDuplicateBOQErrorMessage,
  getDuplicateBOQRecoveryAction,
  type DuplicateBOQRecoveryAction,
} from '@/lib/boq/duplicate';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import { RouteBadge } from '@/components/boq/RouteBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Edit,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface PreserveCopyIntent {
  boq: BOQListRow;
  requestId: string;
  error: string | null;
  recovery: DuplicateBOQRecoveryAction;
  queryKey: string;
  actorGeneration: number;
  submitted: boolean;
}

function canPreserveBOQCopy(boq: BOQListRow): boolean {
  const totalCost = Number(boq.total_cost);

  return Boolean(
    typeof boq.updated_at === 'string'
    && boq.updated_at.length > 0
    && Number.isFinite(totalCost)
    && totalCost >= 0
    && boq.price_list_version_id
    && boq.factor_reference_version_id
    && (
      totalCost === 0
      || isFactorSnapshotUsable(totalCost, boq)
    )
  );
}

function canAttemptSelectedFactorCopy(boq: BOQListRow): boolean {
  const totalCost = Number(boq.total_cost);

  return Boolean(
    boq.price_list_version_id
    && !boq.factor_reference_version_id
    && Number.isFinite(totalCost)
    && totalCost > 0
  );
}

function requiresFactorReview(boq: BOQListRow): boolean {
  return Boolean(
    boq.factor_reference_version_id
    && Number(boq.total_cost) > 0
    && !isFactorSnapshotUsable(Number(boq.total_cost), boq)
  );
}

export default function BOQListPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-8" role="status">กำลังตรวจสอบสิทธิ์…</div>;
  if (!user) return <div className="p-8"><Link href="/login">เข้าสู่ระบบเพื่อดูรายการ</Link></div>;
  return <BOQListWorkspace key={[user.id, user.status, user.role, user.department_id, user.sector_id, user.updated_at].join(':')} user={user} />;
}

function BOQListWorkspace({ user }: { user: UserProfileWithOrg }) {
  const router = useRouter();
  const resultsRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const prepareFocus = useCallback(() => {
    if (resultsRef.current?.contains(document.activeElement)) statusRef.current?.focus();
  }, []);
  const list = useBOQList(user.id, prepareFocus);
  const { supabase, rows: filteredList, isBusy, searchTerm } = list;
  const [copyIntent, setCopyIntent] = useState<PreserveCopyIntent | null>(null);
  const [duplicatePendingBOQId, setDuplicatePendingBOQId] = useState<string | null>(null);
  const pendingCopy = useRef(false);
  const canCreateBOQ = !list.blocked && can(user, 'create', 'boq');
  const totalPages = list.count === null ? 0 : Math.ceil(list.count / LIST_PAGE_SIZE);
  const visibleCopyIntent = copyIntent && list.isActorGenerationCurrent(copyIntent.actorGeneration)
    && (copyIntent.submitted || duplicatePendingBOQId !== null || copyIntent.queryKey === list.requestKey && !isBusy)
    ? copyIntent : null;

  const prepareTransition = () => {
    prepareFocus();
    if (!pendingCopy.current && !copyIntent?.submitted) setCopyIntent(null);
  };

  useEffect(() => {
    if (list.focusResults && !list.error && !isBusy) {
      resultsRef.current?.focus();
      resultsRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [list.focusResults, list.requestKey, list.error, isBusy]);

  const routeBadge = (boq: BOQListRow) => (
    <RouteBadge
      key={`${list.requestKey}:${list.routes?.attempt ?? 'loading'}:${list.routes?.status ?? 'loading'}:${boq.id}`}
      data={{ status: list.routes?.status ?? 'loading', names: list.routes?.names[boq.id] ?? [] }}
      route={boq.route}
      onRetry={list.retryRoutes}
    />
  );
  // The existing delete policy is narrower than generic can('delete'). This is
  // only advisory UI: the unchanged database policy remains final authority.
  const canDelete = (boq: BOQListRow) => user.status === 'active' && (
    user.role === 'admin' || boq.created_by === user.id && boq.status === 'draft'
  );

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      draft: 'ฉบับร่าง',
      pending: 'รอตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className={status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const openPreserveCopyDialog = (boq: BOQListRow) => {
    setCopyIntent({
      boq,
      requestId: crypto.randomUUID(),
      error: null,
      recovery: 'retry',
      queryKey: list.requestKey,
      actorGeneration: list.captureActorGeneration(),
      submitted: false,
    });
  };

  const handleCopyDialogOpenChange = (open: boolean) => {
    if (!open && duplicatePendingBOQId === null) {
      setCopyIntent(null);
    }
  };

  const handleDuplicate = async () => {
    if (!visibleCopyIntent || pendingCopy.current || isBusy && !visibleCopyIntent.submitted) return;
    const intent = visibleCopyIntent;
    pendingCopy.current = true;

    setDuplicatePendingBOQId(intent.boq.id);
    setCopyIntent((current) => current
      ? { ...current, error: null, recovery: 'retry', submitted: true }
      : current);

    try {
      const result = await duplicateBOQAtomic(supabase, {
        sourceBOQId: intent.boq.id,
        requestId: intent.requestId,
        expectedSourceUpdatedAt: intent.boq.updated_at,
        mode: 'preserve',
        factorReferenceVersionId: null,
      });

      if (list.isActorGenerationCurrent(intent.actorGeneration)) router.push(`/boq/${result.boq_id}/edit`);
    } catch (err) {
      if (!list.isActorGenerationCurrent(intent.actorGeneration)) return;
      if (isListAuthorizationError(err) && (err as { code?: string }).code !== '42501') {
        list.invalidateAuthorization();
        return;
      }
      // A source-specific 42501 is a business denial; revalidate the page and
      // active profile without turning it into an account-wide role change.
      if ((err as { code?: string })?.code === '42501') list.refresh();
      const message = getDuplicateBOQErrorMessage(err, 'preserve');
      setCopyIntent((current) => current?.requestId === intent.requestId
        ? {
            ...current,
            error: message,
            recovery: getDuplicateBOQRecoveryAction(err, 'preserve'),
          }
        : current);
    } finally {
      pendingCopy.current = false;
      setDuplicatePendingBOQId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const boq = filteredList.find(row => row.id === id);
    if (isBusy || !boq || !canDelete(boq) || !confirm('ต้องการลบใบประมาณราคานี้หรือไม่?')) return;
    const generation = list.captureActorGeneration();

    try {
      const authorization = await requireActiveProfile(supabase);
      if (authorization.user.id !== user.id) { list.invalidateAuthorization(); return; }
      if (!list.isActorGenerationCurrent(generation)) return;
      const { error, count } = await supabase.from('boq').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count !== 1) { if (list.isActorGenerationCurrent(generation)) list.refresh(); return; }
      if (list.isActorGenerationCurrent(generation)) { prepareTransition(); list.afterDelete(); }
    } catch (error) {
      if (isListAuthorizationError(error)) { list.invalidateAuthorization(); return; }
      if (list.isActorGenerationCurrent(generation)) alert('เกิดข้อผิดพลาดในการลบ กรุณาตรวจสิทธิ์และลองใหม่');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BOQPageHeader
        title="รายการใบประมาณราคา"
        subtitle={list.count === null || isBusy ? 'กำลังโหลดรายการ' : `ทั้งหมด ${list.count.toLocaleString('th-TH')} รายการที่มีสิทธิ์`}
        backHref="/"
        backLabel="หน้าหลัก"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Access Banner */}
        <div className="mb-4">
          <BOQAccessBanner mode="list" />
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="w-full sm:max-w-md">
              <label htmlFor="boq-search" className="block text-sm font-medium mb-1">ค้นหา BOQ</label>
              <Input id="boq-search" type="search" autoComplete="off" className="min-h-11"
                placeholder="ชื่อโครงการ, เลข BOQ, ผู้ประมาณราคา…"
                value={searchTerm} maxLength={LIST_SEARCH_MAX_LENGTH}
                onChange={event => { prepareTransition(); list.setSearchTerm(event.target.value); }}
                disabled={list.blocked} />
            </div>
            <div>
              <label htmlFor="boq-sort" className="block text-sm font-medium mb-1">เรียงตาม</label>
              <select id="boq-sort" value={list.query.sort} disabled={list.blocked}
                onChange={event => { prepareTransition(); list.changeSort(event.target.value as ListSort); }}
                className="h-11 rounded-md border bg-white px-3 text-sm w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-blue-600">
                <option value="created_desc">สร้างล่าสุด</option>
                <option value="document_desc">วันที่เอกสารล่าสุด</option>
                <option value="project_asc">ชื่อโครงการ A–Z</option>
              </select>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => { prepareTransition(); list.refresh(); }} disabled={list.blocked} aria-label="โหลดรายการใหม่">
                <RefreshCw className="h-4 w-4" /> โหลดใหม่
              </Button>
              {canCreateBOQ && <Button asChild className="min-h-11"><Link href="/boq/create"><Plus className="h-4 w-4" />สร้างใหม่</Link></Button>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">ค้นหาข้อความเส้นทางแบบเดิมได้ด้วย คำค้นไม่อยู่ในลิงก์ที่แชร์</p>
          <div className="flex flex-wrap items-center gap-3">
            <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground outline-none">
              {list.error ? 'โหลดรายการไม่สำเร็จ' : isBusy ? 'กำลังโหลดรายการ…'
                : list.count === 0 ? (list.query.q ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา')
                : `รายการ ${(list.query.page - 1) * LIST_PAGE_SIZE + 1}–${(list.query.page - 1) * LIST_PAGE_SIZE + filteredList.length} จาก ${list.count?.toLocaleString('th-TH')} รายการ`}
            </p>
            {(searchTerm || list.query.q) && <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => { prepareTransition(); list.clearSearch(); }} disabled={list.blocked}>ล้างคำค้น</Button>}
          </div>
        </div>
        {list.transitionError && <Alert variant="destructive" className="mb-4" role="alert">
          <AlertTriangle /><AlertTitle>เปลี่ยนหน้ารายการไม่สำเร็จ</AlertTitle>
          <AlertDescription>{list.transitionError}</AlertDescription>
        </Alert>}
        {list.error ? (
          <Alert variant="destructive" role="alert">
            <AlertTriangle /><AlertTitle>โหลดรายการไม่สำเร็จ</AlertTitle>
            <AlertDescription><p>{list.error}</p>
              {list.blocked ? <Link href="/login" className="underline">เข้าสู่ระบบ</Link>
                : <Button type="button" variant="outline" onClick={() => { prepareTransition(); list.refresh(); }}>ลองใหม่</Button>}
            </AlertDescription>
          </Alert>
        ) : <>
        <section ref={resultsRef} tabIndex={-1} aria-label="ผลการค้นหา BOQ" aria-busy={isBusy}
          className="relative outline-none scroll-mt-4">
          {isBusy && <div role="status" aria-label="กำลังโหลดผลลัพธ์" className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/70 pt-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}
          <div inert={isBusy} className={isBusy ? 'opacity-50 min-h-48' : undefined}>
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {filteredList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isBusy ? 'กำลังโหลดรายการ…' : list.query.q ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
              </CardContent>
            </Card>
          ) : (
            filteredList.map((boq) => (
              <Card key={boq.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex-1 line-clamp-2" title={boq.project_name}>{boq.project_name}</h3>
                    {getStatusBadge(boq.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">เส้นทาง: {routeBadge(boq)}</p>
                  <p className="text-xs text-muted-foreground mb-1">เลข BOQ: {boq.boq_number || '—'}</p>
                  <p className="text-sm text-muted-foreground mb-1">ผู้ประมาณราคา: {boq.estimator_name}</p>
                  <p className="text-sm text-muted-foreground mb-2">วันที่: {formatDate(boq.document_date)}</p>
                  <p className="text-lg font-medium text-blue-600 mb-3">{formatNumber(boq.total_cost)} บาท</p>
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Link href={`/boq/${boq.id}/edit`}>
                      <Button variant="outline" size="sm" className="min-h-11 min-w-11">
                        <Edit className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Button>
                    </Link>
                    {requiresFactorReview(boq) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11 min-w-11"
                        disabled
                        title="กรุณาตรวจสอบและบันทึก Factor F ก่อนพิมพ์หรือส่งออก"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        พิมพ์
                      </Button>
                    ) : (
                      <Link href={`/boq/${boq.id}/print`}>
                        <Button variant="outline" size="sm" className="min-h-11 min-w-11">
                          <Printer className="h-4 w-4 mr-1" />
                          พิมพ์
                        </Button>
                      </Link>
                    )}
                    {canCreateBOQ && canPreserveBOQCopy(boq) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11 min-w-11"
                        onClick={() => openPreserveCopyDialog(boq)}
                        disabled={duplicatePendingBOQId === boq.id}
                      >
                        {duplicatePendingBOQId === boq.id ? (
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                        ) : (
                          <Copy data-icon="inline-start" />
                        )}
                        {duplicatePendingBOQId === boq.id ? 'กำลังคัดลอก' : 'คัดลอก'}
                      </Button>
                    ) : canCreateBOQ && (
                      canAttemptSelectedFactorCopy(boq)
                      || Boolean(
                        boq.price_list_version_id
                        && boq.factor_reference_version_id
                      )
                    ) ? (
                      <Button asChild type="button" variant="outline" size="sm" className="min-h-11 min-w-11">
                        <Link href={`/boq/${boq.id}/edit`}>
                          <Copy data-icon="inline-start" />
                          {boq.factor_reference_version_id
                            ? 'ตรวจสอบ Factor F'
                            : 'เลือก Factor F'}
                        </Link>
                      </Button>
                    ) : null}
                    {canDelete(boq) && <Button variant="outline" size="sm" className="min-h-11 min-w-11 text-red-600 hover:text-red-700" onClick={() => handleDelete(boq.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      ลบ
                    </Button>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[360px]">โครงการ</TableHead>
                <TableHead className="w-[100px]">เส้นทาง</TableHead>
                <TableHead className="w-[150px]">ผู้ประมาณราคา</TableHead>
                <TableHead className="w-[140px] text-right whitespace-nowrap">ก่อน VAT (บาท)</TableHead>
                <TableHead className="w-[90px] text-center">สถานะ</TableHead>
                <TableHead className="w-[100px] text-center whitespace-nowrap">วันที่</TableHead>
                <TableHead className="w-[208px] text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isBusy ? 'กำลังโหลดรายการ…' : list.query.q ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((boq) => (
                  <TableRow key={boq.id}>
                    {/* Project name: 4 lines max */}
                    <TableCell className="align-top">
                      <div
                        className="whitespace-normal break-words line-clamp-4 font-medium leading-snug"
                        title={boq.project_name}
                      >
                        {boq.project_name}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{boq.boq_number || '—'}</p>
                    </TableCell>

                    {/* Routes: badge "N เส้นทาง" → click opens Dialog */}
                    <TableCell className="align-top">
                      {routeBadge(boq)}
                    </TableCell>

                    {/* Estimator: full name */}
                    <TableCell className="align-top">
                      <div className="whitespace-normal break-words line-clamp-2 text-muted-foreground" title={boq.estimator_name}>
                        {boq.estimator_name}
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-right font-medium text-blue-600 whitespace-nowrap tabular-nums">
                      {formatNumber(boq.total_with_factor_f)}
                    </TableCell>

                    <TableCell className="align-top text-center">
                      {getStatusBadge(boq.status)}
                    </TableCell>

                    <TableCell className="align-top text-center text-muted-foreground whitespace-nowrap">
                      {formatDate(boq.document_date)}
                    </TableCell>

                    {/* Actions: icon buttons */}
                    <TableCell className="align-top whitespace-nowrap">
                      <TooltipProvider delayDuration={300}>
                        <div className="flex justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/boq/${boq.id}/edit`}>
                                <Button aria-label={`เปิด ${boq.project_name}`} variant="ghost" size="icon" className="h-8 w-8 min-h-11 min-w-11 text-muted-foreground hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>แก้ไข</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {requiresFactorReview(boq) ? (
                                <span className="inline-flex" tabIndex={0}>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 min-h-11 min-w-11 text-muted-foreground"
                                    disabled
                                    aria-label="ต้องบันทึก Factor F ก่อนพิมพ์"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </span>
                              ) : (
                                <Link href={`/boq/${boq.id}/print`}>
                                  <Button aria-label={`พิมพ์ ${boq.project_name}`} variant="ghost" size="icon" className="h-8 w-8 min-h-11 min-w-11 text-muted-foreground hover:text-foreground">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {requiresFactorReview(boq)
                                  ? 'กรุณาตรวจสอบและบันทึก Factor F ก่อนพิมพ์หรือส่งออก'
                                  : 'พิมพ์'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {canCreateBOQ && (
                            canPreserveBOQCopy(boq)
                            || canAttemptSelectedFactorCopy(boq)
                            || Boolean(
                              boq.price_list_version_id
                              && boq.factor_reference_version_id
                            )
                          ) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {canPreserveBOQCopy(boq) ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="min-h-11 min-w-11 text-muted-foreground"
                                    onClick={() => openPreserveCopyDialog(boq)}
                                    disabled={duplicatePendingBOQId === boq.id}
                                    aria-label={`คัดลอก ${boq.project_name}`}
                                  >
                                    {duplicatePendingBOQId === boq.id ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <Copy />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    asChild
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="min-h-11 min-w-11 text-muted-foreground"
                                  >
                                    <Link
                                      href={`/boq/${boq.id}/edit`}
                                      aria-label={boq.factor_reference_version_id
                                        ? `เปิด ${boq.project_name} เพื่อตรวจสอบ Factor F`
                                        : `เปิด ${boq.project_name} เพื่อเลือก Factor F`}
                                    >
                                      <Copy />
                                    </Link>
                                  </Button>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {canPreserveBOQCopy(boq)
                                    ? 'คัดลอกโดยรักษาบัญชีราคา ราคา และ Factor F เดิม'
                                    : boq.factor_reference_version_id
                                      ? 'เปิดหน้าแก้ไขเพื่อตรวจสอบและบันทึก Factor F'
                                      : 'เปิดหน้าแก้ไขเพื่อเลือกเวอร์ชัน Factor F'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {canDelete(boq) && <Tooltip>
                            <TooltipTrigger asChild>
                              <Button aria-label={`ลบ ${boq.project_name}`} variant="ghost" size="icon" className="h-8 w-8 min-h-11 min-w-11 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(boq.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ลบ</p>
                            </TooltipContent>
                          </Tooltip>}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

          </div>
        </section>
        {totalPages > 1 && <nav aria-label="หน้ารายการ BOQ" className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" className="min-h-11" disabled={isBusy || list.query.page <= 1}
            onClick={() => { prepareTransition(); list.changePage(list.query.page - 1); }}>ก่อนหน้า</Button>
          <span className="text-sm lg:hidden">หน้า {list.query.page}/{totalPages}</span>
          <div className="hidden lg:flex items-center gap-1">
            {Array.from(new Set([1, list.query.page - 1, list.query.page, list.query.page + 1, totalPages]))
              .filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b).map((page, index, pages) => <span key={page} className="flex items-center gap-1">
                {index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true" className="px-2">…</span>}
                <Button type="button" variant={page === list.query.page ? 'default' : 'outline'} className="min-h-11 min-w-11"
                  aria-label={`หน้า ${page}`} aria-current={page === list.query.page ? 'page' : undefined}
                  disabled={isBusy || page === list.query.page}
                  onClick={() => { prepareTransition(); list.changePage(page); }}>{page}</Button>
              </span>)}
          </div>
          <Button type="button" variant="outline" className="min-h-11" disabled={isBusy || list.query.page >= totalPages}
            onClick={() => { prepareTransition(); list.changePage(list.query.page + 1); }}>ถัดไป</Button>
        </nav>}
        </>}
        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      <Dialog open={visibleCopyIntent !== null} onOpenChange={handleCopyDialogOpenChange}>
        <DialogContent showCloseButton={duplicatePendingBOQId === null}>
          <DialogHeader>
            <DialogTitle className="pr-8">ยืนยันการคัดลอก BOQ</DialogTitle>
            <DialogDescription>
              ระบบจะสร้างฉบับร่างใหม่จาก “{visibleCopyIntent?.boq.project_name}” และเปิดหน้าแก้ไขเมื่อเสร็จ
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle />
            <AlertTitle>รักษาราคาและ Factor F ของต้นฉบับ</AlertTitle>
            <AlertDescription>
              <p>
                รายการ ปริมาณ ราคาต่อหน่วย บัญชีราคา และ Factor F จะเหมือนต้นฉบับ
                การคัดลอกนี้ไม่อัปเดตราคาเป็นเวอร์ชันปัจจุบัน
              </p>
            </AlertDescription>
          </Alert>

          <dl className="grid gap-2 rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">บัญชีราคา</dt>
              <dd className="font-medium">
                {visibleCopyIntent?.boq.catalog_version?.version_string ?? 'เวอร์ชันของต้นฉบับ'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Factor F</dt>
              <dd className="font-medium">
                {visibleCopyIntent?.boq.factor_version?.version_string ?? 'เวอร์ชันของต้นฉบับ'}
              </dd>
            </div>
          </dl>

          {visibleCopyIntent?.error && (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTriangle />
              <AlertTitle>คัดลอกไม่สำเร็จ</AlertTitle>
              <AlertDescription>
                <p>{visibleCopyIntent.error}</p>
                <p>
                  {visibleCopyIntent.recovery === 'reload'
                    ? 'ระบบจะไม่คัดลอกจากข้อมูลเก่า กรุณาโหลดรายการใหม่ก่อนเริ่มคำขอใหม่'
                    : visibleCopyIntent.recovery === 'open_source'
                      ? 'เปิดหน้าแก้ไขเพื่อเลือก Factor F สำหรับ BOQ เก่าโดยเฉพาะ'
                      : visibleCopyIntent.recovery === 'create_new'
                        ? 'ระบบจะไม่ซ่อมหรือคำนวณข้อมูลเดิมย้อนหลัง กรุณาเริ่มจาก BOQ ใหม่'
                        : visibleCopyIntent.recovery === 'dismiss'
                          ? 'ปิดหน้าต่างนี้และตรวจสอบสิทธิ์หรือสถานะบัญชีกับผู้ดูแลระบบ'
                          : 'กด “ลองคัดลอกอีกครั้ง” เพื่อส่งคำขอเดิมอย่างปลอดภัย'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            หากต้องการใช้บัญชีราคาและ Factor F ปัจจุบัน ให้สร้าง BOQ ใหม่แบบสะอาด
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCopyIntent(null)}
              disabled={duplicatePendingBOQId !== null}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={visibleCopyIntent?.recovery === 'reload'
                ? () => window.location.reload()
                : visibleCopyIntent?.recovery === 'open_source'
                  ? () => router.push(`/boq/${visibleCopyIntent.boq.id}/edit`)
                  : visibleCopyIntent?.recovery === 'create_new'
                    ? () => router.push('/boq/create')
                    : visibleCopyIntent?.recovery === 'dismiss'
                      ? () => setCopyIntent(null)
                      : handleDuplicate}
              disabled={duplicatePendingBOQId !== null}
            >
              {duplicatePendingBOQId !== null ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : visibleCopyIntent?.recovery === 'reload' ? (
                <RefreshCw data-icon="inline-start" />
              ) : visibleCopyIntent?.recovery === 'create_new' ? (
                <Plus data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {visibleCopyIntent?.recovery === 'reload'
                ? 'โหลดรายการใหม่'
                : visibleCopyIntent?.recovery === 'open_source'
                  ? 'เปิดหน้าแก้ไข'
                  : visibleCopyIntent?.recovery === 'create_new'
                    ? 'สร้าง BOQ ใหม่'
                    : visibleCopyIntent?.recovery === 'dismiss'
                      ? 'ปิด'
                : duplicatePendingBOQId !== null
                ? 'กำลังคัดลอก'
                : visibleCopyIntent?.error
                  ? 'ลองคัดลอกอีกครั้ง'
                  : 'ยืนยันการคัดลอก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
