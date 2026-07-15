'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CatalogWorkspaceItem } from '@/lib/master-catalog/admin/catalogWorkspace';
import type {
  CatalogMutationState,
} from '@/lib/master-catalog/admin/actionModel';
import type { CatalogPlacementWorkspace } from '@/lib/master-catalog/admin/readModel';
import {
  buildCatalogPlacementPreview,
  hasCatalogPlacementDraftChanges,
  moveCatalogPlacementAssignmentWithinAnchor,
  suggestCatalogPlacements,
  type CatalogPlacementAssignment,
  type CatalogPlacementRelation,
} from '@/lib/master-catalog/admin/placement';
import { formatCatalogDictionaryLabel } from '@/lib/master-catalog/admin/presentation';
import { placeCatalogItemsAction } from '../actions';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';
import { useStableCatalogOperation } from './useStableCatalogOperation';

const initialState: CatalogMutationState = { status: 'idle', message: '' };
const PAGE_SIZE = 50;

export function MasterCatalogPlacementWorkspaceView({
  workspace,
}: {
  workspace: CatalogPlacementWorkspace;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(placeCatalogItemsAction, initialState);
  const [assignments, setAssignments] = useState(() => suggestCatalogPlacements(
    workspace.newItems,
    workspace.inheritedItems,
  ));
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const storageKey = `master-catalog-placement:${workspace.version.id}:${workspace.version.lockVersion}:${workspace.placementRevision}`;
  const [requestIdRef, prepareOperation, preserveInput] = useStableCatalogOperation(
    state,
    `${workspace.version.id}:placement:${workspace.version.lockVersion}:${workspace.placementRevision}`,
  );

  const draftItems = useMemo(
    () => [...workspace.inheritedItems, ...workspace.newItems],
    [workspace.inheritedItems, workspace.newItems],
  );
  const inheritedItemsByCategory = useMemo(() => {
    const grouped = new Map<string, CatalogWorkspaceItem[]>();
    for (const item of workspace.inheritedItems) {
      const categoryItems = grouped.get(item.categoryId) ?? [];
      categoryItems.push(item);
      grouped.set(item.categoryId, categoryItems);
    }
    for (const categoryItems of grouped.values()) {
      categoryItems.sort(compareDisplayOrder);
    }
    return grouped;
  }, [workspace.inheritedItems]);
  const inheritedIdentityIds = useMemo(
    () => new Set(workspace.inheritedItems.map((item) => item.identityId)),
    [workspace.inheritedItems],
  );
  const previewResult = useMemo(() => {
    try {
      return {
        preview: buildCatalogPlacementPreview(
          workspace.baseItems,
          draftItems,
          assignments,
        ),
        error: null,
      };
    } catch (error) {
      return {
        preview: null,
        error: error instanceof Error ? error.message : 'ตรวจลำดับตัวอย่างไม่สำเร็จ',
      };
    }
  }, [assignments, draftItems, workspace.baseItems]);

  const normalizedQuery = query.trim().toLocaleLowerCase('th-TH');
  const filteredNewItems = workspace.newItems.filter((item) => (
    !normalizedQuery
    || item.itemCode.toLocaleLowerCase('th-TH').includes(normalizedQuery)
    || item.itemName.toLocaleLowerCase('th-TH').includes(normalizedQuery)
  ));
  const pageCount = Math.max(1, Math.ceil(filteredNewItems.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleNewItems = filteredNewItems.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const assignmentByIdentity = new Map(assignments.map((entry) => [entry.identityId, entry]));
  const previewItems = previewResult.preview?.orderedItems ?? [];
  const previewByIdentity = new Map(previewItems.map((item) => [item.identityId, item]));
  const previewIndexByIdentity = new Map(
    previewItems.map((item, index) => [item.identityId, index]),
  );
  const completedCount = assignments.filter((entry) => (
    entry.anchorIdentityId
    && inheritedItemsByCategory.get(entry.categoryId)?.some((anchor) => (
      anchor.identityId === entry.anchorIdentityId
    ))
  )).length;
  const shiftedInheritedCount = previewResult.preview?.affectedIdentityIds.filter((identityId) => (
    inheritedIdentityIds.has(identityId)
  )).length ?? 0;
  const placementWouldChangeDraft = previewResult.preview
    ? hasCatalogPlacementDraftChanges(draftItems, previewResult.preview.orderedItems)
    : false;
  const placementReviewAlreadyCurrent = workspace.readiness?.placementReviewCurrent === true
    && !placementWouldChangeDraft;
  const canConfirm = workspace.editable
    && workspace.newItems.length > 0
    && completedCount === workspace.newItems.length
    && previewResult.preview !== null
    && !placementReviewAlreadyCurrent;

  useEffect(() => {
    if (state.status === 'success') {
      window.sessionStorage.removeItem(storageKey);
      setConfirmOpen(false);
      router.refresh();
    }
  }, [router, state.status, storageKey]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (isStoredPlacementAssignments(parsed, workspace.newItems.length)) {
          buildCatalogPlacementPreview(workspace.baseItems, draftItems, parsed);
          setAssignments(parsed);
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
    setStorageReady(true);
  }, [draftItems, storageKey, workspace.baseItems, workspace.newItems.length]);

  useEffect(() => {
    if (storageReady) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(assignments));
    }
  }, [assignments, storageKey, storageReady]);

  if (workspace.newItems.length === 0) {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertTitle>ไม่มีรายการใหม่ที่ต้องจัดตำแหน่ง</AlertTitle>
        <AlertDescription>
          ฉบับร่างนี้มีเฉพาะรายการที่สืบทอดจากเวอร์ชันฐาน จึงไม่ต้องยืนยันตำแหน่งเพิ่ม
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-5">
      {state.status === 'success' ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>{state.message}</AlertTitle>
          <AlertDescription>
            ยืนยัน {state.newIdentityCount?.toLocaleString('th-TH') ?? workspace.newItems.length.toLocaleString('th-TH')} รายการใหม่
            และบันทึกผลกระทบ {state.affectedRows?.toLocaleString('th-TH') ?? '-'} รายการแล้ว
          </AlertDescription>
        </Alert>
      ) : null}

      {!workspace.readiness?.placementGovernanceAvailable ? (
        <Alert variant="destructive">
          <AlertTitle>ระบบยืนยันตำแหน่งยังไม่พร้อม</AlertTitle>
          <AlertDescription>
            ปิดการยืนยันไว้ก่อนจนกว่าฐานข้อมูลจะติดตั้งส่วนรองรับและผ่านการตรวจรับที่อนุมัติ
          </AlertDescription>
        </Alert>
      ) : null}

      {!workspace.capabilities.newIdentityEnabled ? (
        <Alert>
          <AlertTitle>ความสามารถเพิ่มรายการใหม่ยังปิดอยู่</AlertTitle>
          <AlertDescription>
            เปิดดูได้ แต่ยังแก้ไขหรือยืนยันไม่ได้จนกว่าเจ้าของระบบจะเปิดใช้งานสำหรับรอบเผยแพร่นี้
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-3 border-y py-4" aria-labelledby="placement-status-heading">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 id="placement-status-heading" className="text-base font-semibold">
              สถานะชุดจัดตำแหน่ง
            </h2>
            <p className="text-sm text-muted-foreground">
              ยืนยันเฉพาะรายการใหม่ โดยรักษาลำดับสัมพัทธ์ของรายการเดิมทั้งหมด
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={completedCount === workspace.newItems.length ? 'secondary' : 'outline'}>
              กำหนดแล้ว {completedCount.toLocaleString('th-TH')} / {workspace.newItems.length.toLocaleString('th-TH')}
            </Badge>
            {placementReviewAlreadyCurrent ? (
              <Badge variant="secondary">
                <CheckCircle2 data-icon="inline-start" />
                ชุดปัจจุบันยืนยันแล้ว
              </Badge>
            ) : (
              <Badge variant="outline">
                รายการเดิมที่จะเลื่อน {shiftedInheritedCount.toLocaleString('th-TH')}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin />
            {placementReviewAlreadyCurrent
              ? 'ตำแหน่งรายการใหม่ที่ยืนยันแล้ว'
              : 'รายการใหม่ที่ต้องยืนยัน'}
          </CardTitle>
          <CardDescription>
            เลือกหมวดและรายการเดิมที่อยู่ติดกัน ระบบจะแสดงลำดับจริงก่อนบันทึกทั้งชุด
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="ค้นหารายการใหม่"
              className="pl-9"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="ค้นหารหัสหรือชื่อรายการใหม่"
            />
          </div>

          <div className="divide-y rounded-md border">
            {visibleNewItems.map((item) => {
              const assignment = assignmentByIdentity.get(item.identityId);
              if (!assignment) return null;
              const anchors = inheritedItemsByCategory.get(assignment.categoryId) ?? [];
              const siblings = assignments
                .filter((entry) => (
                  entry.anchorIdentityId === assignment.anchorIdentityId
                  && entry.relation === assignment.relation
                ))
                .sort((left, right) => left.batchOrder - right.batchOrder);
              const siblingIndex = siblings.findIndex((entry) => (
                entry.identityId === item.identityId
              ));
              const previewItem = previewByIdentity.get(item.identityId);
              const previewIndex = previewItem
                ? previewIndexByIdentity.get(item.identityId) ?? -1
                : -1;
              const previous = previewIndex > 0
                ? previewItems[previewIndex - 1]
                : null;
              const next = previewIndex >= 0
                ? previewItems[previewIndex + 1]
                : null;

              return (
                <article key={item.identityId} className="grid gap-4 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs">{item.itemCode}</span>
                        <Badge variant="outline">รายการใหม่</Badge>
                        {previewItem ? (
                          <Badge variant="secondary">
                            ลำดับ {(previewItem.displayOrder + 1).toLocaleString('th-TH')}
                          </Badge>
                        ) : null}
                        {siblings.length > 1 ? (
                          <Badge variant="outline">
                            ลำดับในจุดนี้ {(siblingIndex + 1).toLocaleString('th-TH')} / {siblings.length.toLocaleString('th-TH')}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-medium">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        หน่วย {item.unit} · ราคา {item.unitCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="เลื่อนขึ้นภายในจุดอ้างอิงเดียวกัน"
                        aria-label={`เลื่อน ${item.itemCode} ขึ้น`}
                        disabled={!workspace.editable || siblings.length < 2 || siblingIndex <= 0}
                        onClick={() => moveAssignment(item.identityId, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="เลื่อนลงภายในจุดอ้างอิงเดียวกัน"
                        aria-label={`เลื่อน ${item.itemCode} ลง`}
                        disabled={
                          !workspace.editable
                          || siblings.length < 2
                          || siblingIndex >= siblings.length - 1
                        }
                        onClick={() => moveAssignment(item.identityId, 1)}
                      >
                        <ArrowDown />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.7fr)_minmax(240px,1.3fr)_220px]">
                    <div className="grid gap-2">
                      <Label>หมวดงาน</Label>
                      <Select
                        value={assignment.categoryId}
                        onValueChange={(categoryId) => changeCategory(item.identityId, categoryId)}
                        disabled={!workspace.editable}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`หมวดงานของ ${item.itemCode}`}
                        >
                          <SelectValue placeholder="เลือกหมวดงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspace.categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              disabled={!inheritedItemsByCategory.has(category.id)}
                            >
                              {formatCatalogDictionaryLabel(category.code, category.name)}
                              {!inheritedItemsByCategory.has(category.id) ? ' (ไม่มีรายการเดิมให้อ้างอิง)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>รายการเดิมที่ใช้อ้างอิง</Label>
                      <AnchorCombobox
                        anchors={anchors}
                        value={assignment.anchorIdentityId}
                        label={item.itemCode}
                        disabled={!workspace.editable}
                        onValueChange={(anchorIdentityId) => updateAssignment(item.identityId, {
                          anchorIdentityId,
                        })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>ตำแหน่งเทียบกับรายการอ้างอิง</Label>
                      <RelationControl
                        value={assignment.relation}
                        label={item.itemCode}
                        disabled={!workspace.editable}
                        onValueChange={(relation) => updateAssignment(item.identityId, { relation })}
                      />
                    </div>
                  </div>

                  {previewItem ? (
                    <div className="grid gap-1 rounded-md bg-muted/45 px-3 py-2 text-sm sm:grid-cols-2">
                      <p className="truncate">
                        ก่อนหน้า: {previous ? `${previous.itemCode} ${previous.itemName}` : 'เริ่มต้นบัญชี'}
                      </p>
                      <p className="truncate">
                        ถัดไป: {next ? `${next.itemCode} ${next.itemName}` : 'สิ้นสุดบัญชี'}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {visibleNewItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              ไม่พบรายการใหม่ตามคำค้น
            </p>
          ) : null}

          {filteredNewItems.length > PAGE_SIZE ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                พบ {filteredNewItems.length.toLocaleString('th-TH')} รายการ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="หน้าก่อน"
                  aria-label="หน้าก่อน"
                  disabled={safePage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-24 text-center text-sm tabular-nums">
                  หน้า {(safePage + 1).toLocaleString('th-TH')} / {pageCount.toLocaleString('th-TH')}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="หน้าถัดไป"
                  aria-label="หน้าถัดไป"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          ) : null}

          {previewResult.error ? (
            <Alert variant="destructive">
              <AlertTitle>ยังสร้างตัวอย่างลำดับไม่ได้</AlertTitle>
              <AlertDescription>{previewResult.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              {placementReviewAlreadyCurrent
                ? 'ตำแหน่งในฉบับร่างตรงกับชุดที่ยืนยันแล้ว หากปรับหมวด รายการอ้างอิง หรือลำดับ ระบบจะแสดงผลกระทบก่อนยืนยันใหม่'
                : `การยืนยันหนึ่งครั้งจะบันทึกรายการใหม่ ${workspace.newItems.length.toLocaleString('th-TH')} รายการ และเก็บประวัติรายการเดิมที่จะเลื่อน ${shiftedInheritedCount.toLocaleString('th-TH')} รายการ`}
            </p>
            <Button type="button" disabled={!canConfirm} onClick={() => setConfirmOpen(true)}>
              {placementReviewAlreadyCurrent
                ? <CheckCircle2 data-icon="inline-start" />
                : <Check data-icon="inline-start" />}
              {placementReviewAlreadyCurrent ? 'ยืนยันชุดปัจจุบันแล้ว' : 'ตรวจและยืนยันทั้งชุด'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <form
            action={formAction}
            className="grid gap-4"
            onReset={preserveInput}
            onSubmitCapture={prepareOperation}
          >
            <input ref={requestIdRef} type="hidden" name="requestId" />
            <input type="hidden" name="versionId" value={workspace.version.id} />
            <input type="hidden" name="expectedLockVersion" value={workspace.version.lockVersion} />
            <input type="hidden" name="expectedPlacementRevision" value={workspace.placementRevision} />
            <input
              type="hidden"
              name="placementsJson"
              value={JSON.stringify([...assignments].sort((left, right) => left.batchOrder - right.batchOrder))}
            />
            <DialogHeader>
              <DialogTitle className="pr-8">ยืนยันตำแหน่งรายการใหม่ทั้งชุด</DialogTitle>
              <DialogDescription>
                ระบบจะจัดลำดับและบันทึกทั้งชุดในครั้งเดียว รักษาลำดับรายการเดิม
                และเก็บประวัติทุกแถวที่ถูกเลื่อน
              </DialogDescription>
            </DialogHeader>
            <MasterCatalogActionErrorAlert state={state} />
            <div className="grid gap-2 rounded-md border p-3 text-sm">
              <p>รายการใหม่ {workspace.newItems.length.toLocaleString('th-TH')} รายการ</p>
              <p>รายการเดิมที่คาดว่าจะเลื่อน {shiftedInheritedCount.toLocaleString('th-TH')} รายการ</p>
              <p>เวอร์ชัน {workspace.version.versionString}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="placement-reason">เหตุผลการยืนยันตำแหน่ง</Label>
              <Input
                id="placement-reason"
                name="reason"
                maxLength={500}
                required
                placeholder="ระบุหลักการหรือเอกสารที่ใช้พิจารณาตำแหน่ง"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">กลับไปตรวจ</Button>
              </DialogClose>
              <PlacementSubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  function updateAssignment(
    identityId: string,
    patch: Partial<Pick<CatalogPlacementAssignment, 'anchorIdentityId' | 'relation'>>,
  ) {
    setAssignments((current) => current.map((entry) => (
      entry.identityId === identityId ? { ...entry, ...patch } : entry
    )));
  }

  function changeCategory(identityId: string, categoryId: string) {
    const anchors = inheritedItemsByCategory.get(categoryId) ?? [];
    setAssignments((current) => current.map((entry) => (
      entry.identityId === identityId
        ? {
            ...entry,
            categoryId,
            anchorIdentityId: anchors.at(-1)?.identityId ?? '',
            relation: 'after',
          }
        : entry
    )));
  }

  function moveAssignment(identityId: string, delta: -1 | 1) {
    setAssignments((current) => moveCatalogPlacementAssignmentWithinAnchor(
      current,
      identityId,
      delta,
    ));
  }
}

function AnchorCombobox({
  anchors,
  value,
  label,
  disabled,
  onValueChange,
}: {
  anchors: CatalogWorkspaceItem[];
  value: string;
  label: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = anchors.find((anchor) => anchor.identityId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`รายการเดิมที่ใช้อ้างอิงสำหรับ ${label}`}
          disabled={disabled || anchors.length === 0}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected
              ? `${selected.itemCode} ${selected.itemName}${selected.isActive ? '' : ' (ยกเลิกใช้)'}`
              : 'เลือกรายการเดิม'}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(520px,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหารหัสหรือชื่อรายการเดิม" />
          <CommandList>
            <CommandEmpty>ไม่พบรายการเดิมในหมวดนี้</CommandEmpty>
            <CommandGroup>
              {anchors.map((anchor) => (
                <CommandItem
                  key={anchor.identityId}
                  value={`${anchor.itemCode} ${anchor.itemName} ${anchor.isActive ? 'ใช้งาน' : 'ยกเลิกใช้'}`}
                  onSelect={() => {
                    onValueChange(anchor.identityId);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('size-4', value === anchor.identityId ? 'opacity-100' : 'opacity-0')} />
                  <span className="font-mono text-xs">{anchor.itemCode}</span>
                  <span className="truncate">{anchor.itemName}</span>
                  {!anchor.isActive ? <Badge variant="outline">ยกเลิกใช้</Badge> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function RelationControl({
  value,
  label,
  disabled,
  onValueChange,
}: {
  value: CatalogPlacementRelation;
  label: string;
  disabled: boolean;
  onValueChange: (value: CatalogPlacementRelation) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 rounded-md border p-1"
      role="radiogroup"
      aria-label={`ตำแหน่งของ ${label} เทียบกับรายการอ้างอิง`}
    >
      {([
        ['before', 'ก่อนรายการนี้'],
        ['after', 'หลังรายการนี้'],
      ] as const).map(([option, label]) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={value === option ? 'secondary' : 'ghost'}
          role="radio"
          aria-checked={value === option}
          disabled={disabled}
          onClick={() => onValueChange(option)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

function PlacementSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}
      {pending ? 'กำลังยืนยัน' : 'ยืนยันและบันทึกทั้งชุด'}
    </Button>
  );
}

function compareDisplayOrder(left: CatalogWorkspaceItem, right: CatalogWorkspaceItem) {
  return left.displayOrder - right.displayOrder || left.itemCode.localeCompare(right.itemCode);
}

function isStoredPlacementAssignments(
  value: unknown,
  expectedLength: number,
): value is CatalogPlacementAssignment[] {
  return Array.isArray(value)
    && value.length === expectedLength
    && value.every((entry) => (
      entry
      && typeof entry === 'object'
      && typeof entry.identityId === 'string'
      && typeof entry.categoryId === 'string'
      && typeof entry.anchorIdentityId === 'string'
      && (entry.relation === 'before' || entry.relation === 'after')
      && Number.isSafeInteger(entry.batchOrder)
      && entry.batchOrder >= 0
    ));
}
