'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BOQ } from '@/lib/supabase';
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

interface BOQListRow extends BOQ {
  catalog_version: { version_string: string | null } | null;
  factor_version: { version_string: string | null } | null;
}

interface PreserveCopyIntent {
  boq: BOQListRow;
  requestId: string;
  error: string | null;
  recovery: DuplicateBOQRecoveryAction;
}

function canPreserveBOQCopy(boq: BOQListRow): boolean {
  const totalCost = Number(boq.total_cost);

  return Boolean(
    Number.isFinite(totalCost)
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
  const { user } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [boqList, setBOQList] = useState<BOQListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyIntent, setCopyIntent] = useState<PreserveCopyIntent | null>(null);
  const [duplicatePendingBOQId, setDuplicatePendingBOQId] = useState<string | null>(null);

  const canCreateBOQ = can(user, 'create', 'boq');

  useEffect(() => {
    const fetchBOQList = async () => {
      try {
        await requireActiveProfile(supabase);
        const { data, error } = await supabase
          .from('boq')
          .select(`
            *,
            catalog_version:price_list_versions!boq_price_list_version_id_fkey(version_string),
            factor_version:factor_reference_versions!boq_factor_reference_version_id_fkey(version_string)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBOQList((data || []) as BOQListRow[]);
      } catch (err) {
        console.error('Error fetching BOQ list:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBOQList();
  }, [supabase]);

  const filteredList = boqList.filter(
    (boq) =>
      boq.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.estimator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (boq.route && boq.route.toLowerCase().includes(searchTerm.toLowerCase()))
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
    });
  };

  const handleCopyDialogOpenChange = (open: boolean) => {
    if (!open && duplicatePendingBOQId === null) {
      setCopyIntent(null);
    }
  };

  const handleDuplicate = async () => {
    if (!copyIntent || duplicatePendingBOQId !== null) return;

    setDuplicatePendingBOQId(copyIntent.boq.id);
    setCopyIntent((current) => current
      ? { ...current, error: null, recovery: 'retry' }
      : current);

    try {
      const result = await duplicateBOQAtomic(supabase, {
        sourceBOQId: copyIntent.boq.id,
        requestId: copyIntent.requestId,
        expectedSourceUpdatedAt: copyIntent.boq.updated_at,
        mode: 'preserve',
        factorReferenceVersionId: null,
      });

      router.push(`/boq/${result.boq_id}/edit`);
    } catch (err) {
      console.error('Error duplicating BOQ atomically:', err);
      const message = getDuplicateBOQErrorMessage(err, 'preserve');
      setCopyIntent((current) => current?.requestId === copyIntent.requestId
        ? {
            ...current,
            error: message,
            recovery: getDuplicateBOQRecoveryAction(err, 'preserve'),
          }
        : current);
    } finally {
      setDuplicatePendingBOQId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบใบประมาณราคานี้หรือไม่?')) return;

    try {
      await requireActiveProfile(supabase);
      const { error } = await supabase.from('boq').delete().eq('id', id);
      if (error) throw error;
      setBOQList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting BOQ:', err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BOQPageHeader
        title="รายการใบประมาณราคา"
        subtitle={`ทั้งหมด ${boqList.length} รายการ`}
        backHref="/"
        backLabel="หน้าหลัก"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Access Banner */}
        <div className="mb-4">
          <BOQAccessBanner mode="list" />
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Search */}
          <Input
            type="text"
            placeholder="ค้นหาโครงการ, ผู้ประมาณราคา, เส้นทาง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96"
          />

          {/* Create button */}
          {canCreateBOQ && (
            <Link href="/boq/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                สร้างใหม่
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {filteredList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
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
                  <p className="text-sm text-muted-foreground mb-1">เส้นทาง: <RouteBadge boqId={boq.id} route={boq.route} /></p>
                  <p className="text-sm text-muted-foreground mb-1">ผู้ประมาณราคา: {boq.estimator_name}</p>
                  <p className="text-sm text-muted-foreground mb-2">วันที่: {formatDate(boq.document_date)}</p>
                  <p className="text-lg font-medium text-blue-600 mb-3">{formatNumber(boq.total_cost)} บาท</p>
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Link href={`/boq/${boq.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Button>
                    </Link>
                    {requiresFactorReview(boq) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        title="กรุณาตรวจสอบและบันทึก Factor F ก่อนพิมพ์หรือส่งออก"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        พิมพ์
                      </Button>
                    ) : (
                      <Link href={`/boq/${boq.id}/print`}>
                        <Button variant="outline" size="sm">
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
                      <Button asChild type="button" variant="outline" size="sm">
                        <Link href={`/boq/${boq.id}/edit`}>
                          <Copy data-icon="inline-start" />
                          {boq.factor_reference_version_id
                            ? 'ตรวจสอบ Factor F'
                            : 'เลือก Factor F'}
                        </Link>
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(boq.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      ลบ
                    </Button>
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
                <TableHead className="w-[160px] text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
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
                    </TableCell>

                    {/* Routes: badge "N เส้นทาง" → click opens Dialog */}
                    <TableCell className="align-top">
                      <RouteBadge boqId={boq.id} route={boq.route} />
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
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/boq/${boq.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
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
                                    className="h-8 w-8 text-muted-foreground"
                                    disabled
                                    aria-label="ต้องบันทึก Factor F ก่อนพิมพ์"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </span>
                              ) : (
                                <Link href={`/boq/${boq.id}/print`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
                                    className="text-muted-foreground"
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
                                    className="text-muted-foreground"
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(boq.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ลบ</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>

      <Dialog open={copyIntent !== null} onOpenChange={handleCopyDialogOpenChange}>
        <DialogContent showCloseButton={duplicatePendingBOQId === null}>
          <DialogHeader>
            <DialogTitle className="pr-8">ยืนยันการคัดลอก BOQ</DialogTitle>
            <DialogDescription>
              ระบบจะสร้างฉบับร่างใหม่จาก “{copyIntent?.boq.project_name}” และเปิดหน้าแก้ไขเมื่อเสร็จ
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
                {copyIntent?.boq.catalog_version?.version_string ?? 'เวอร์ชันของต้นฉบับ'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Factor F</dt>
              <dd className="font-medium">
                {copyIntent?.boq.factor_version?.version_string ?? 'เวอร์ชันของต้นฉบับ'}
              </dd>
            </div>
          </dl>

          {copyIntent?.error && (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTriangle />
              <AlertTitle>คัดลอกไม่สำเร็จ</AlertTitle>
              <AlertDescription>
                <p>{copyIntent.error}</p>
                <p>
                  {copyIntent.recovery === 'reload'
                    ? 'ระบบจะไม่คัดลอกจากข้อมูลเก่า กรุณาโหลดรายการใหม่ก่อนเริ่มคำขอใหม่'
                    : copyIntent.recovery === 'open_source'
                      ? 'เปิดหน้าแก้ไขเพื่อเลือก Factor F สำหรับ BOQ เก่าโดยเฉพาะ'
                      : copyIntent.recovery === 'create_new'
                        ? 'ระบบจะไม่ซ่อมหรือคำนวณข้อมูลเดิมย้อนหลัง กรุณาเริ่มจาก BOQ ใหม่'
                        : copyIntent.recovery === 'dismiss'
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
              onClick={copyIntent?.recovery === 'reload'
                ? () => window.location.reload()
                : copyIntent?.recovery === 'open_source'
                  ? () => router.push(`/boq/${copyIntent.boq.id}/edit`)
                  : copyIntent?.recovery === 'create_new'
                    ? () => router.push('/boq/create')
                    : copyIntent?.recovery === 'dismiss'
                      ? () => setCopyIntent(null)
                      : handleDuplicate}
              disabled={duplicatePendingBOQId !== null}
            >
              {duplicatePendingBOQId !== null ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : copyIntent?.recovery === 'reload' ? (
                <RefreshCw data-icon="inline-start" />
              ) : copyIntent?.recovery === 'create_new' ? (
                <Plus data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copyIntent?.recovery === 'reload'
                ? 'โหลดรายการใหม่'
                : copyIntent?.recovery === 'open_source'
                  ? 'เปิดหน้าแก้ไข'
                  : copyIntent?.recovery === 'create_new'
                    ? 'สร้าง BOQ ใหม่'
                    : copyIntent?.recovery === 'dismiss'
                      ? 'ปิด'
                : duplicatePendingBOQId !== null
                ? 'กำลังคัดลอก'
                : copyIntent?.error
                  ? 'ลองคัดลอกอีกครั้ง'
                  : 'ยืนยันการคัดลอก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
