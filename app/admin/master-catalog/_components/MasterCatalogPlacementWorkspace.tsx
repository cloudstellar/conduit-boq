'use client';

import { useActionState, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
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
  CircleAlert,
  Loader2,
  MapPin,
  PencilLine,
  RotateCcw,
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
  catalogPlacementAssignmentsEqual,
  clampCatalogPlacementGapIndex,
  getCatalogPlacementAssignmentForGap,
  getCatalogPlacementAssignmentValidity,
  getCatalogPlacementGapIndex,
  hasCatalogPlacementDraftChanges,
  moveCatalogPlacementAssignmentWithinAnchor,
  suggestCatalogPlacements,
  type CatalogPlacementAssignment,
  type CatalogPlacementAssignmentValidity,
} from '@/lib/master-catalog/admin/placement';
import { formatCatalogDictionaryLabel } from '@/lib/master-catalog/admin/presentation';
import { placeCatalogItemsAction } from '../actions';
import { MasterCatalogActionErrorAlert } from './MasterCatalogActionErrorAlert';
import { useStableCatalogOperation } from './useStableCatalogOperation';

const initialState: CatalogMutationState = { status: 'idle', message: '' };
const PAGE_SIZE = 50;
const STORAGE_SCHEMA_VERSION = 2;

type PlacementReviewFilter =
  | 'attention'
  | 'all'
  | 'modified'
  | 'suggested'
  | 'incomplete'
  | 'invalid';

interface PlacementAssignmentReview {
  modified: boolean;
  validity: CatalogPlacementAssignmentValidity;
}

interface PlacementEditorState {
  identityId: string;
  categoryId: string;
  gapIndex: number;
}

export function MasterCatalogPlacementWorkspaceView({
  workspace,
}: {
  workspace: CatalogPlacementWorkspace;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(placeCatalogItemsAction, initialState);
  const suggestedAssignments = useMemo(() => suggestCatalogPlacements(
    workspace.newItems,
    workspace.inheritedItems,
  ), [workspace.inheritedItems, workspace.newItems]);
  const [assignments, setAssignments] = useState(() => suggestedAssignments);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [reviewFilter, setReviewFilter] = useState<PlacementReviewFilter>('all');
  const [page, setPage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [placementEditor, setPlacementEditor] = useState<PlacementEditorState | null>(null);
  const placementEditorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const leaveConfirmTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
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
  const inheritedIdentityIdsByCategory = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    for (const item of workspace.inheritedItems) {
      const identityIds = grouped.get(item.categoryId) ?? new Set<string>();
      identityIds.add(item.identityId);
      grouped.set(item.categoryId, identityIds);
    }
    return grouped;
  }, [workspace.inheritedItems]);
  const assignmentByIdentity = useMemo(
    () => new Map(assignments.map((entry) => [entry.identityId, entry])),
    [assignments],
  );
  const suggestedAssignmentByIdentity = useMemo(
    () => new Map(suggestedAssignments.map((entry) => [entry.identityId, entry])),
    [suggestedAssignments],
  );
  const assignmentReviewByIdentity = useMemo(() => new Map(assignments.map((entry) => {
    const validAnchorIdentityIds = inheritedIdentityIdsByCategory.get(entry.categoryId)
      ?? new Set<string>();
    return [entry.identityId, {
      modified: !catalogPlacementAssignmentsEqual(
        entry,
        suggestedAssignmentByIdentity.get(entry.identityId),
      ),
      validity: getCatalogPlacementAssignmentValidity(entry, validAnchorIdentityIds),
    } satisfies PlacementAssignmentReview] as const;
  })), [assignments, inheritedIdentityIdsByCategory, suggestedAssignmentByIdentity]);
  const reviewCounts = useMemo(() => {
    const counts = {
      attention: 0,
      modified: 0,
      suggested: 0,
      incomplete: 0,
      invalid: 0,
    };
    for (const review of assignmentReviewByIdentity.values()) {
      if (review.validity !== 'complete') counts.attention += 1;
      if (review.modified) counts.modified += 1;
      if (!review.modified && review.validity === 'complete') counts.suggested += 1;
      if (review.validity === 'incomplete') counts.incomplete += 1;
      if (review.validity === 'invalid') counts.invalid += 1;
    }
    return counts;
  }, [assignmentReviewByIdentity]);
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
  const previewItems = useMemo(
    () => previewResult.preview?.orderedItems ?? [],
    [previewResult.preview],
  );
  const previewByIdentity = useMemo(
    () => new Map(previewItems.map((item) => [item.identityId, item])),
    [previewItems],
  );
  const previewIndexByIdentity = useMemo(
    () => new Map(previewItems.map((item, index) => [item.identityId, index])),
    [previewItems],
  );
  const assignmentsByAnchorRelation = useMemo(() => {
    const grouped = new Map<string, CatalogPlacementAssignment[]>();
    for (const assignment of assignments) {
      const key = `${assignment.anchorIdentityId}:${assignment.relation}`;
      const group = grouped.get(key) ?? [];
      group.push(assignment);
      grouped.set(key, group);
    }
    for (const group of grouped.values()) {
      group.sort((left, right) => left.batchOrder - right.batchOrder);
    }
    return grouped;
  }, [assignments]);

  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase('th-TH');
  const filteredNewItems = useMemo(() => workspace.newItems.filter((item) => {
    const matchesQuery = !normalizedQuery
      || item.itemCode.toLocaleLowerCase('th-TH').includes(normalizedQuery)
      || item.itemName.toLocaleLowerCase('th-TH').includes(normalizedQuery);
    const review = assignmentReviewByIdentity.get(item.identityId);
    return matchesQuery && review !== undefined && matchesPlacementReviewFilter(
      review,
      reviewFilter,
    );
  }), [assignmentReviewByIdentity, normalizedQuery, reviewFilter, workspace.newItems]);
  const pageCount = Math.max(1, Math.ceil(filteredNewItems.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleNewItems = filteredNewItems.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const completedCount = workspace.newItems.length
    - reviewCounts.incomplete
    - reviewCounts.invalid;
  const shiftedInheritedCount = previewResult.preview?.affectedIdentityIds.filter((identityId) => (
    inheritedIdentityIds.has(identityId)
  )).length ?? 0;
  const placementWouldChangeDraft = previewResult.preview
    ? hasCatalogPlacementDraftChanges(draftItems, previewResult.preview.orderedItems)
    : false;
  const hasLocalAssignmentChanges = reviewCounts.modified > 0;
  const placementReviewAlreadyCurrent = state.status === 'success'
    || (
      workspace.readiness?.placementReviewCurrent === true
      && !hasLocalAssignmentChanges
      && !placementWouldChangeDraft
    );
  const hasPendingLocalChanges = state.status !== 'success'
    && (
      hasLocalAssignmentChanges
      || (workspace.readiness?.placementReviewCurrent === true && placementWouldChangeDraft)
    );
  const canConfirm = workspace.editable
    && workspace.newItems.length > 0
    && completedCount === workspace.newItems.length
    && previewResult.preview !== null
    && !placementReviewAlreadyCurrent;
  const categoryById = useMemo(
    () => new Map(workspace.categories.map((category) => [category.id, category])),
    [workspace.categories],
  );
  const placementCategoryLabels = useMemo(() => {
    const categoryIds = new Set<string>();
    for (const item of workspace.newItems) {
      const placedItem = previewByIdentity.get(item.identityId);
      if (placedItem) categoryIds.add(placedItem.categoryId);
    }
    return [...categoryIds]
      .map((categoryId) => categoryById.get(categoryId))
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .map((category) => formatCatalogDictionaryLabel(category.code, category.name))
      .sort((left, right) => left.localeCompare(right, 'th-TH'));
  }, [categoryById, previewByIdentity, workspace.newItems]);
  const placementImpactRows = useMemo(() => workspace.newItems
    .map((item) => {
      const previewIndex = previewIndexByIdentity.get(item.identityId) ?? -1;
      return {
        item,
        previewIndex,
        previous: previewIndex > 0 ? previewItems[previewIndex - 1] : null,
        next: previewIndex >= 0 ? previewItems[previewIndex + 1] ?? null : null,
      };
    })
    .filter((entry) => entry.previewIndex >= 0)
    .sort((left, right) => left.previewIndex - right.previewIndex), [
    previewIndexByIdentity,
    previewItems,
    workspace.newItems,
  ]);
  const placementEditorItem = placementEditor
    ? workspace.newItems.find((item) => item.identityId === placementEditor.identityId) ?? null
    : null;
  const placementEditorAnchors = useMemo(() => (
    placementEditor
      ? inheritedItemsByCategory.get(placementEditor.categoryId) ?? []
      : []
  ), [inheritedItemsByCategory, placementEditor]);
  const placementEditorGapIndex = placementEditor
    ? clampCatalogPlacementGapIndex(placementEditor.gapIndex, placementEditorAnchors.length)
    : 0;
  const placementEditorPreviewNeighbors = useMemo(() => {
    if (!placementEditor) return null;
    const nextPlacement = getCatalogPlacementAssignmentForGap(
      placementEditorAnchors,
      placementEditorGapIndex,
    );
    if (!nextPlacement) return null;
    const candidateAssignments = assignments.map((entry) => (
      entry.identityId === placementEditor.identityId
        ? {
            ...entry,
            categoryId: placementEditor.categoryId,
            ...nextPlacement,
          }
        : entry
    ));
    try {
      const candidateItems = buildCatalogPlacementPreview(
        workspace.baseItems,
        draftItems,
        candidateAssignments,
      ).orderedItems;
      const itemIndex = candidateItems.findIndex((item) => (
        item.identityId === placementEditor.identityId
      ));
      if (itemIndex < 0) return null;
      return {
        previous: itemIndex > 0 ? candidateItems[itemIndex - 1] : null,
        next: candidateItems[itemIndex + 1] ?? null,
      };
    } catch {
      return null;
    }
  }, [
    assignments,
    draftItems,
    placementEditor,
    placementEditorAnchors,
    placementEditorGapIndex,
    workspace.baseItems,
  ]);
  const placementEditorPrevious = placementEditorPreviewNeighbors?.previous ?? null;
  const placementEditorNext = placementEditorPreviewNeighbors?.next ?? null;

  useEffect(() => {
    if (state.status === 'success') {
      window.sessionStorage.removeItem(storageKey);
      setRestoredFromStorage(false);
      setConfirmOpen(false);
      router.refresh();
    }
  }, [router, state.status, storageKey]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        const storedAssignments = parseStoredPlacementAssignments(
          parsed,
          workspace.newItems.length,
        );
        if (storedAssignments) {
          buildCatalogPlacementPreview(workspace.baseItems, draftItems, storedAssignments);
          setAssignments(storedAssignments);
          setRestoredFromStorage(storedAssignments.some((entry) => (
            !catalogPlacementAssignmentsEqual(
              entry,
              suggestedAssignmentByIdentity.get(entry.identityId),
            )
          )));
        } else {
          window.sessionStorage.removeItem(storageKey);
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
    setStorageReady(true);
  }, [
    draftItems,
    storageKey,
    suggestedAssignmentByIdentity,
    workspace.baseItems,
    workspace.newItems.length,
  ]);

  useEffect(() => {
    if (storageReady) {
      window.sessionStorage.setItem(storageKey, JSON.stringify({
        schemaVersion: STORAGE_SCHEMA_VERSION,
        assignments,
      }));
    }
  }, [assignments, storageKey, storageReady]);

  useEffect(() => {
    if (!hasPendingLocalChanges) return undefined;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [hasPendingLocalChanges]);

  useEffect(() => {
    if (!hasPendingLocalChanges) return undefined;

    const guardSameOriginNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest('a[href]');
      if (
        !(anchor instanceof HTMLAnchorElement)
        || anchor.hasAttribute('download')
        || (anchor.target && anchor.target !== '_self')
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (
        destination.origin !== current.origin
        || (
          destination.pathname === current.pathname
          && destination.search === current.search
          && destination.hash === current.hash
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      leaveConfirmTriggerRef.current = anchor;
      setPendingNavigationHref(
        `${destination.pathname}${destination.search}${destination.hash}`,
      );
      setLeaveConfirmOpen(true);
    };

    document.addEventListener('click', guardSameOriginNavigation, true);
    return () => document.removeEventListener('click', guardSameOriginNavigation, true);
  }, [hasPendingLocalChanges]);

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

      {workspace.readiness?.placementReviewCurrent ? (
        placementReviewAlreadyCurrent ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>ตำแหน่งชุดปัจจุบันได้รับการยืนยันแล้ว</AlertTitle>
            <AlertDescription>
              สถานะการยืนยันตรงกับฉบับร่างปัจจุบัน หากแก้ตัวเลือกใด
              หน้านี้จะเปลี่ยนเป็นยังไม่ยืนยันก่อนบันทึกชุดใหม่
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CircleAlert />
            <AlertTitle>มีการแก้ไขตำแหน่งที่ยังไม่ยืนยัน</AlertTitle>
            <AlertDescription>
              ฉบับร่างในฐานข้อมูลยังคงเป็นชุดที่ยืนยันล่าสุด ตัวเลือกบนหน้านี้เก็บไว้ชั่วคราว
              ในเบราว์เซอร์นี้และจะบันทึกจริงเมื่อยืนยันทั้งชุดเท่านั้น
            </AlertDescription>
          </Alert>
        )
      ) : restoredFromStorage && hasPendingLocalChanges ? (
        <Alert>
          <CircleAlert />
          <AlertTitle>กู้คืนตัวเลือกที่ยังไม่ยืนยันแล้ว</AlertTitle>
          <AlertDescription>
            ระบบนำตัวเลือกชั่วคราวของฉบับร่างและรุ่นแก้ไขนี้กลับมาให้ตรวจต่อ
            ข้อมูลนี้ยังไม่ได้บันทึกลงฉบับร่าง
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
              {placementReviewAlreadyCurrent
                ? 'ตำแหน่งรายการใหม่ได้รับการยืนยันแล้ว'
                : `ระบบจัดตำแหน่งเบื้องต้นให้แล้ว ${workspace.newItems.length.toLocaleString('th-TH')} รายการ`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {placementReviewAlreadyCurrent
                ? 'ตำแหน่งปัจจุบันตรงกับฉบับร่าง หากต้องการเปลี่ยนให้แก้เฉพาะรายการนั้นแล้วจึงยืนยันใหม่'
                : 'ตรวจรายการข้างเคียงด้านล่าง หากถูกต้องไม่ต้องแก้ทีละรายการ และยืนยันพร้อมกันได้ทั้งชุด'}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Badge variant={completedCount === workspace.newItems.length ? 'secondary' : 'outline'}>
                พร้อมยืนยัน {completedCount.toLocaleString('th-TH')} / {workspace.newItems.length.toLocaleString('th-TH')}
              </Badge>
              {placementReviewAlreadyCurrent ? (
                <Badge variant="secondary">
                  <CheckCircle2 data-icon="inline-start" />
                  บันทึกแล้ว
                </Badge>
              ) : (
                <Badge variant="outline">
                  <CircleAlert data-icon="inline-start" />
                  ยังไม่บันทึก
                </Badge>
              )}
              {!placementReviewAlreadyCurrent ? (
                <Badge variant="outline">
                  เลขลำดับรายการเดิมจะเลื่อน {shiftedInheritedCount.toLocaleString('th-TH')}
                </Badge>
              ) : null}
            </div>
            {!placementReviewAlreadyCurrent ? (
              <Button
                type="button"
                disabled={!canConfirm}
                onClick={(event) => openConfirm(event.currentTarget)}
              >
                <Check data-icon="inline-start" />
                {canConfirm
                  ? 'ตรวจสรุปก่อนบันทึกทั้งชุด'
                  : 'แก้รายการที่มีปัญหาก่อน'}
              </Button>
            ) : null}
          </div>
        </div>
        {!placementReviewAlreadyCurrent ? (
          <p className="text-xs text-muted-foreground">
            การเลื่อนหมายถึงเลขลำดับเปลี่ยนตามการแทรกรายการใหม่ เนื้อหา หน่วย และราคาเดิมไม่เปลี่ยน
          </p>
        ) : null}
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin />
            ตรวจตำแหน่งรายการใหม่
          </CardTitle>
          <CardDescription>
            แต่ละรายการแสดงสิ่งที่จะอยู่ก่อนหน้าและถัดไป เปลี่ยนเฉพาะตำแหน่งที่ไม่ถูกต้อง
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2" aria-label="จำนวนรายการตามสถานะการตรวจ">
            <Badge variant="secondary">
              {workspace.readiness?.placementReviewCurrent ? 'บันทึกแล้ว' : 'ระบบจัดให้'}{' '}
              {reviewCounts.suggested.toLocaleString('th-TH')}
            </Badge>
            <Badge variant="outline">
              ปรับในหน้านี้ {reviewCounts.modified.toLocaleString('th-TH')}
            </Badge>
            {reviewCounts.attention > 0 ? (
              <Badge variant="destructive">
                ต้องแก้ {reviewCounts.attention.toLocaleString('th-TH')}
              </Badge>
            ) : null}
            {reviewCounts.modified > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAssignments(suggestedAssignments);
                  setRestoredFromStorage(false);
                  setReviewFilter('all');
                  setPage(0);
                }}
              >
                <RotateCcw data-icon="inline-start" />
                ยกเลิกการปรับทั้งหมด
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
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
            <div>
              <Label htmlFor="placement-review-filter" className="sr-only">
                แสดงรายการตามสถานะ
              </Label>
              <Select
                value={reviewFilter}
                onValueChange={(value) => {
                  setReviewFilter(value as PlacementReviewFilter);
                  setPage(0);
                }}
              >
                <SelectTrigger id="placement-review-filter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attention">
                    ต้องแก้ ({reviewCounts.attention.toLocaleString('th-TH')})
                  </SelectItem>
                  <SelectItem value="modified">
                    ปรับในหน้านี้ ({reviewCounts.modified.toLocaleString('th-TH')})
                  </SelectItem>
                  <SelectItem value="suggested">
                    {workspace.readiness?.placementReviewCurrent ? 'บันทึกแล้ว' : 'ระบบจัดให้'}
                    {' '}({reviewCounts.suggested.toLocaleString('th-TH')})
                  </SelectItem>
                  <SelectItem value="all">
                    ทั้งหมด ({workspace.newItems.length.toLocaleString('th-TH')})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="divide-y rounded-md border">
            {visibleNewItems.map((item) => {
              const assignment = assignmentByIdentity.get(item.identityId);
              const review = assignmentReviewByIdentity.get(item.identityId);
              if (!assignment || !review) return null;
              const siblings = assignmentsByAnchorRelation.get(
                `${assignment.anchorIdentityId}:${assignment.relation}`,
              ) ?? [];
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
                        {review.modified ? (
                          <Badge variant="secondary">ปรับในหน้านี้ · ยังไม่บันทึก</Badge>
                        ) : review.validity === 'complete' ? (
                          <Badge variant="outline">
                            {workspace.readiness?.placementReviewCurrent
                              ? 'บันทึกแล้ว'
                              : 'ระบบจัดให้'}
                          </Badge>
                        ) : null}
                        {review.validity === 'incomplete' ? (
                          <Badge variant="destructive">ข้อมูลยังไม่ครบ</Badge>
                        ) : null}
                        {review.validity === 'invalid' ? (
                          <Badge variant="destructive">ตำแหน่งไม่ถูกต้อง</Badge>
                        ) : null}
                        {previewItem ? (
                          <Badge variant="secondary">
                            ลำดับ {(previewItem.displayOrder + 1).toLocaleString('th-TH')}
                          </Badge>
                        ) : null}
                        {siblings.length > 1 ? (
                          <Badge variant="outline">
                            ลำดับในช่วงเดียวกัน {(siblingIndex + 1).toLocaleString('th-TH')} / {siblings.length.toLocaleString('th-TH')}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-medium">{item.itemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        หน่วย {item.unit} · ราคา {item.unitCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {previewItem ? (
                    <PlacementPositionPreview item={item} previous={previous} next={next} />
                  ) : null}

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    {siblings.length > 1 ? (
                      <details className="group min-w-0">
                        <summary className="w-fit cursor-pointer rounded-sm text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          เปลี่ยนลำดับในช่วงนี้
                        </summary>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            รายการนี้อยู่ลำดับ {(siblingIndex + 1).toLocaleString('th-TH')}
                            {' '}จาก {siblings.length.toLocaleString('th-TH')}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            title="เลื่อนรายการนี้ขึ้นหนึ่งตำแหน่ง"
                            aria-label={`เลื่อน ${item.itemCode} ขึ้นหนึ่งตำแหน่ง`}
                            disabled={!workspace.editable || siblingIndex <= 0}
                            onClick={() => moveAssignment(item.identityId, -1)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            title="เลื่อนรายการนี้ลงหนึ่งตำแหน่ง"
                            aria-label={`เลื่อน ${item.itemCode} ลงหนึ่งตำแหน่ง`}
                            disabled={
                              !workspace.editable
                              || siblingIndex >= siblings.length - 1
                            }
                            onClick={() => moveAssignment(item.identityId, 1)}
                          >
                            <ArrowDown />
                          </Button>
                        </div>
                      </details>
                    ) : <span />}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!workspace.editable}
                      onClick={(event) => openPlacementEditor(item.identityId, event.currentTarget)}
                    >
                      <PencilLine data-icon="inline-start" />
                      เปลี่ยนตำแหน่ง
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleNewItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              ไม่พบรายการใหม่ตามคำค้นและสถานะที่เลือก เลือกสถานะอื่นเพื่อดูรายการที่เหลือ
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
                ? 'ตำแหน่งในฉบับร่างตรงกับชุดที่บันทึกไว้แล้ว'
                : `ไม่ต้องยืนยันทีละรายการ ระบบจะบันทึกตำแหน่งใหม่ ${workspace.newItems.length.toLocaleString('th-TH')} รายการพร้อมกันหนึ่งครั้ง`}
            </p>
            <Button
              type="button"
              disabled={!canConfirm}
              onClick={(event) => openConfirm(event.currentTarget)}
            >
              {placementReviewAlreadyCurrent
                ? <CheckCircle2 data-icon="inline-start" />
                : <Check data-icon="inline-start" />}
              {placementReviewAlreadyCurrent
                ? 'บันทึกตำแหน่งชุดนี้แล้ว'
                : `ตรวจสรุปก่อนบันทึก ${workspace.newItems.length.toLocaleString('th-TH')} รายการ`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={placementEditor !== null}
        onOpenChange={(open) => {
          if (!open) setPlacementEditor(null);
        }}
      >
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] min-w-0 overflow-x-hidden overflow-y-auto sm:max-w-2xl"
          onCloseAutoFocus={(event) => {
            const trigger = placementEditorTriggerRef.current;
            placementEditorTriggerRef.current = null;
            if (!trigger?.isConnected) return;
            event.preventDefault();
            trigger.focus({ preventScroll: true });
          }}
        >
          {placementEditor && placementEditorItem ? (
            <div className="grid min-w-0 gap-5">
              <DialogHeader>
                <DialogTitle className="pr-8">
                  เปลี่ยนตำแหน่ง {placementEditorItem.itemCode}
                </DialogTitle>
                <DialogDescription>
                  เลือกหมวดและช่วงที่รายการนี้ควรอยู่ ค่านี้จะยังไม่บันทึกจนกว่าจะยืนยันทั้งชุด
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-1 border-y py-3">
                <p className="font-medium">{placementEditorItem.itemName}</p>
                <p className="text-sm text-muted-foreground">
                  หน่วย {placementEditorItem.unit} · ราคา {placementEditorItem.unitCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid min-w-0 gap-4">
                <div className="grid min-w-0 gap-2">
                  <Label htmlFor="placement-editor-category">หมวดงาน</Label>
                  <Select
                    value={placementEditor.categoryId}
                    onValueChange={(categoryId) => {
                      const anchors = inheritedItemsByCategory.get(categoryId) ?? [];
                      setPlacementEditor((current) => current ? {
                        ...current,
                        categoryId,
                        gapIndex: anchors.length,
                      } : null);
                    }}
                  >
                    <SelectTrigger id="placement-editor-category" className="w-full min-w-0">
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
                          {!inheritedItemsByCategory.has(category.id) ? ' (ไม่มีรายการเดิม)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid min-w-0 gap-2">
                  <Label>ช่วงที่จะวางรายการนี้</Label>
                  <PlacementGapCombobox
                    anchors={placementEditorAnchors}
                    gapIndex={placementEditorGapIndex}
                    itemCode={placementEditorItem.itemCode}
                    onValueChange={(gapIndex) => setPlacementEditor((current) => (
                      current ? { ...current, gapIndex } : null
                    ))}
                  />
                </div>
              </div>

              <div className="grid min-w-0 gap-2">
                <p className="text-sm font-medium">ตัวอย่างตำแหน่งที่เลือก</p>
                <PlacementPositionPreview
                  item={placementEditorItem}
                  previous={placementEditorPrevious}
                  next={placementEditorNext}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">ยกเลิก</Button>
                </DialogClose>
                <Button
                  type="button"
                  disabled={placementEditorAnchors.length === 0}
                  onClick={applyPlacementEditor}
                >
                  <Check data-icon="inline-start" />
                  ใช้ตำแหน่งนี้
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] min-w-0 overflow-x-hidden overflow-y-auto sm:max-w-2xl"
          onCloseAutoFocus={(event) => {
            const trigger = confirmTriggerRef.current;
            confirmTriggerRef.current = null;
            if (!trigger?.isConnected) return;
            event.preventDefault();
            trigger.focus({ preventScroll: true });
          }}
        >
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
              <DialogTitle className="pr-8">ตรวจสรุปก่อนบันทึกตำแหน่ง</DialogTitle>
              <DialogDescription>
                การกดยืนยันจะบันทึกตำแหน่งรายการใหม่ทั้งหมดหนึ่งครั้ง
                โดยไม่เปลี่ยนลำดับสัมพัทธ์ เนื้อหา หน่วย หรือราคาของรายการเดิม
              </DialogDescription>
            </DialogHeader>
            <MasterCatalogActionErrorAlert state={state} />
            <div className="grid gap-2 rounded-md border p-3 text-sm">
              <p>รายการใหม่ {workspace.newItems.length.toLocaleString('th-TH')} รายการ</p>
              <p>
                ระบบจัดให้ {reviewCounts.suggested.toLocaleString('th-TH')} รายการ
                {' · '}ปรับในหน้านี้ {reviewCounts.modified.toLocaleString('th-TH')} รายการ
              </p>
              <p>เลขลำดับรายการเดิมที่จะเลื่อน {shiftedInheritedCount.toLocaleString('th-TH')} รายการ</p>
              <p>
                หมวดที่วางรายการใหม่ {placementCategoryLabels.length.toLocaleString('th-TH')} หมวด
              </p>
              <p className="text-muted-foreground">
                {placementCategoryLabels.join(', ') || 'ยังไม่ได้กำหนดหมวดงาน'}
              </p>
              <p>
                ข้อมูลยังไม่ครบ {reviewCounts.incomplete.toLocaleString('th-TH')} รายการ
                {' · '}ตำแหน่งไม่ถูกต้อง {reviewCounts.invalid.toLocaleString('th-TH')} รายการ
              </p>
              <p>เวอร์ชัน {workspace.version.versionString}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-medium">
                ตำแหน่งสุดท้ายของรายการใหม่ {placementImpactRows.length.toLocaleString('th-TH')} รายการ
              </p>
              <ul
                className="max-h-60 divide-y overflow-y-auto rounded-md border"
                aria-label="ตำแหน่งสุดท้ายของรายการใหม่"
              >
                {placementImpactRows.map(({ item, previewIndex, previous, next }) => (
                  <li key={item.identityId} className="p-3">
                    <PlacementPositionPreview
                      compact
                      finalPosition={previewIndex + 1}
                      item={item}
                      previous={previous}
                      next={next}
                    />
                  </li>
                ))}
              </ul>
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

      <Dialog
        open={leaveConfirmOpen}
        onOpenChange={(open) => {
          setLeaveConfirmOpen(open);
          if (!open) setPendingNavigationHref(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            const trigger = leaveConfirmTriggerRef.current;
            leaveConfirmTriggerRef.current = null;
            if (!trigger?.isConnected) return;
            event.preventDefault();
            trigger.focus({ preventScroll: true });
          }}
        >
          <DialogHeader>
            <DialogTitle className="pr-8">ออกจากหน้าที่มีตัวเลือกยังไม่ยืนยันหรือไม่</DialogTitle>
            <DialogDescription>
              ตัวเลือกที่แก้ไขยังไม่ได้บันทึกลงฉบับร่าง ระบบจะเก็บไว้ชั่วคราวในเบราว์เซอร์นี้
              สำหรับฉบับร่างและรุ่นแก้ไขเดิม เพื่อให้กลับมาตรวจต่อได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">อยู่หน้านี้</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                const destination = pendingNavigationHref;
                setLeaveConfirmOpen(false);
                if (destination) router.push(destination);
              }}
            >
              ออกและเก็บไว้ชั่วคราว
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function openPlacementEditor(identityId: string, trigger: HTMLButtonElement) {
    const assignment = assignmentByIdentity.get(identityId);
    if (!assignment) return;
    const anchors = inheritedItemsByCategory.get(assignment.categoryId) ?? [];
    placementEditorTriggerRef.current = trigger;
    setPlacementEditor({
      identityId,
      categoryId: assignment.categoryId,
      gapIndex: getCatalogPlacementGapIndex(anchors, assignment),
    });
  }

  function openConfirm(trigger: HTMLButtonElement) {
    confirmTriggerRef.current = trigger;
    setConfirmOpen(true);
  }

  function applyPlacementEditor() {
    if (!placementEditor) return;
    const currentAssignment = assignmentByIdentity.get(placementEditor.identityId);
    const anchors = inheritedItemsByCategory.get(placementEditor.categoryId) ?? [];
    const nextPlacement = getCatalogPlacementAssignmentForGap(
      anchors,
      placementEditorGapIndex,
    );
    if (!currentAssignment || !nextPlacement) return;

    const currentAnchors = inheritedItemsByCategory.get(currentAssignment.categoryId) ?? [];
    const unchanged = currentAssignment.categoryId === placementEditor.categoryId
      && getCatalogPlacementGapIndex(currentAnchors, currentAssignment) === placementEditorGapIndex;
    if (!unchanged) {
      setAssignments((current) => current.map((entry) => (
        entry.identityId === placementEditor.identityId
          ? {
              ...entry,
              categoryId: placementEditor.categoryId,
              ...nextPlacement,
            }
          : entry
      )));
    }
    setPlacementEditor(null);
  }

  function moveAssignment(identityId: string, delta: -1 | 1) {
    setAssignments((current) => moveCatalogPlacementAssignmentWithinAnchor(
      current,
      identityId,
      delta,
    ));
  }
}

function PlacementGapCombobox({
  anchors,
  gapIndex,
  itemCode,
  onValueChange,
}: {
  anchors: CatalogWorkspaceItem[];
  gapIndex: number;
  itemCode: string;
  onValueChange: (gapIndex: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const gapOptions = Array.from({ length: anchors.length + 1 }, (_, index) => index);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`ช่วงที่จะวาง ${itemCode}`}
          disabled={anchors.length === 0}
          className="w-full min-w-0 justify-between overflow-hidden font-normal"
        >
          <span className="truncate text-left">
            {anchors.length > 0
              ? formatPlacementGapLabel(anchors, gapIndex)
              : 'ไม่มีรายการเดิมในหมวดนี้'}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(640px,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหารหัสหรือชื่อรายการก่อนหน้า/ถัดไป" />
          <CommandList>
            <CommandEmpty>ไม่พบช่วงที่ตรงกับคำค้น</CommandEmpty>
            <CommandGroup>
              {gapOptions.map((optionGapIndex) => (
                <CommandItem
                  key={optionGapIndex}
                  value={`${optionGapIndex} ${formatPlacementGapLabel(anchors, optionGapIndex)}`}
                  className="items-start py-2"
                  onSelect={() => {
                    onValueChange(optionGapIndex);
                    setOpen(false);
                  }}
                >
                  <Check className={cn(
                    'mt-0.5 size-4',
                    gapIndex === optionGapIndex ? 'opacity-100' : 'opacity-0',
                  )} />
                  <span className="min-w-0 break-words">
                    {formatPlacementGapLabel(anchors, optionGapIndex)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PlacementPositionPreview({
  compact = false,
  finalPosition,
  item,
  previous,
  next,
}: {
  compact?: boolean;
  finalPosition?: number;
  item: CatalogWorkspaceItem;
  previous: CatalogWorkspaceItem | null;
  next: CatalogWorkspaceItem | null;
}) {
  return (
    <div className={cn(
      'grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center',
      !compact && 'rounded-md bg-muted/45 p-3',
    )}>
      <PlacementPreviewItem
        label="ก่อนหน้า"
        value={formatPlacementNeighbor(previous, 'เริ่มต้นหมวด')}
      />
      <ChevronRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
      <PlacementPreviewItem
        current
        label={finalPosition
          ? `รายการใหม่นี้ · ลำดับหลังบันทึก ${finalPosition.toLocaleString('th-TH')}`
          : 'รายการใหม่นี้'}
        value={`${item.itemCode} ${item.itemName}`}
      />
      <ChevronRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
      <PlacementPreviewItem
        label="ถัดไป"
        value={formatPlacementNeighbor(next, 'สิ้นสุดหมวด')}
      />
    </div>
  );
}

function PlacementPreviewItem({
  label,
  value,
  current = false,
}: {
  label: string;
  value: string;
  current?: boolean;
}) {
  return (
    <div className={cn('min-w-0', current && 'font-medium text-foreground')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm">{value}</p>
    </div>
  );
}

function PlacementSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}
      {pending ? 'กำลังบันทึก' : 'ยืนยันและบันทึกตำแหน่ง'}
    </Button>
  );
}

function compareDisplayOrder(left: CatalogWorkspaceItem, right: CatalogWorkspaceItem) {
  return left.displayOrder - right.displayOrder || left.itemCode.localeCompare(right.itemCode);
}

function formatPlacementGapLabel(
  anchors: CatalogWorkspaceItem[],
  gapIndex: number,
) {
  const safeGapIndex = clampCatalogPlacementGapIndex(gapIndex, anchors.length);
  const previous = safeGapIndex > 0 ? anchors[safeGapIndex - 1] : null;
  const next = safeGapIndex < anchors.length ? anchors[safeGapIndex] : null;
  if (!previous && next) {
    return `ต้นหมวด · ก่อน ${formatPlacementNeighbor(next, '')}`;
  }
  if (previous && !next) {
    return `ท้ายหมวด · หลัง ${formatPlacementNeighbor(previous, '')}`;
  }
  return `ระหว่าง ${formatPlacementNeighbor(previous, '')} และ ${formatPlacementNeighbor(next, '')}`;
}

function matchesPlacementReviewFilter(
  review: PlacementAssignmentReview,
  filter: PlacementReviewFilter,
) {
  switch (filter) {
    case 'attention':
      return review.validity !== 'complete';
    case 'modified':
      return review.modified;
    case 'suggested':
      return !review.modified && review.validity === 'complete';
    case 'incomplete':
      return review.validity === 'incomplete';
    case 'invalid':
      return review.validity === 'invalid';
    case 'all':
      return true;
  }
}

function formatPlacementNeighbor(
  item: CatalogWorkspaceItem | null | undefined,
  fallback: string,
) {
  return item ? `${item.itemCode} ${item.itemName}` : fallback;
}

function parseStoredPlacementAssignments(
  value: unknown,
  expectedLength: number,
): CatalogPlacementAssignment[] | null {
  if (
    value
    && typeof value === 'object'
    && 'schemaVersion' in value
    && value.schemaVersion === STORAGE_SCHEMA_VERSION
    && 'assignments' in value
    && isStoredPlacementAssignments(value.assignments, expectedLength)
  ) {
    return value.assignments;
  }
  return null;
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
