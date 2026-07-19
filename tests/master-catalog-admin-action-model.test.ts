import { describe, expect, it } from 'vitest';
import {
  buildAbandonCatalogDraftArgs,
  buildPublishCatalogVersionArgs,
  buildPlaceCatalogItemsArgs,
  buildRestoreCatalogPointerArgs,
  buildManualCatalogChangeArgs,
  canPersistCatalogImportPreview,
  createCatalogRpcTransportError,
  isDefinitiveCatalogMutationOutcome,
  mapCatalogRpcActionResponse,
  shouldBeginNewCatalogOperation,
  shouldPreserveCatalogOperationInput,
  validateCatalogPublishVersionConfirmation,
} from '../lib/master-catalog/admin/actionModel';

const VERSION_ID = '00000000-0000-4000-8000-000000000001';
const REQUEST_ID = '00000000-0000-4000-8000-000000000101';
const IDENTITY_ID = '00000000-0000-4000-8000-000000000201';
const CATEGORY_ID = '00000000-0000-4000-8000-000000000301';
const GROUP_ID = '00000000-0000-4000-8000-000000000401';
const ANCHOR_ID = '00000000-0000-4000-8000-000000000202';

function form(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

function baseForm(overrides: Record<string, string> = {}) {
  return form({
    versionId: VERSION_ID,
    expectedLockVersion: '3',
    reason: 'WP-4 local-only action',
    action: 'retire',
    targetIdentityId: IDENTITY_ID,
    targetItemCode: 'ITEM-0001',
    ...overrides,
  });
}

describe('Master Catalog admin action model', () => {
  it('builds a manual retire RPC payload with lock and reason', () => {
    const args = buildManualCatalogChangeArgs(baseForm(), REQUEST_ID);

    expect(args).toMatchObject({
      p_version_id: VERSION_ID,
      p_expected_lock_version: 3,
      p_reason: 'WP-4 local-only action',
      p_request_id: REQUEST_ID,
      p_import_id: null,
      p_change_payload: {
        operation: 'manual',
        changes: [{
          action: 'retire',
          targetIdentityId: IDENTITY_ID,
          targetItemCode: 'ITEM-0001',
        }],
      },
    });
  });

  it('builds publish and restore RPC payloads with approval metadata', () => {
    const publishArgs = buildPublishCatalogVersionArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '3',
      effectiveDate: '2026-07-05',
      approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
      approvalDocumentDate: '2026-07-05',
      physicalArchiveReference: 'archive/catalog/2568.1.0',
      reason: 'WP-5 local-only publish',
    }), REQUEST_ID);

    expect(publishArgs).toMatchObject({
      p_version_id: VERSION_ID,
      p_expected_lock_version: 3,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        physicalArchiveReference: 'archive/catalog/2568.1.0',
      },
      p_reason: 'WP-5 local-only publish',
      p_request_id: REQUEST_ID,
    });

    const restoreArgs = buildRestoreCatalogPointerArgs(form({
      targetVersionId: VERSION_ID,
      reason: 'WP-5 local-only pointer restore',
    }), REQUEST_ID);

    expect(restoreArgs).toMatchObject({
      p_target_version_id: VERSION_ID,
      p_reason: 'WP-5 local-only pointer restore',
      p_request_id: REQUEST_ID,
    });
  });

  it('builds an audited abandon payload with the exact draft lock', () => {
    expect(buildAbandonCatalogDraftArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '3',
      reason: 'ยกเลิกฉบับร่างเพื่อเริ่มรอบแก้ไขใหม่',
    }), REQUEST_ID)).toEqual({
      p_version_id: VERSION_ID,
      p_expected_lock_version: 3,
      p_reason: 'ยกเลิกฉบับร่างเพื่อเริ่มรอบแก้ไขใหม่',
      p_request_id: REQUEST_ID,
    });

    expect(buildAbandonCatalogDraftArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '3',
      reason: '',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'VALIDATION_FAILED',
    });
  });

  it('builds and validates one normalized placement batch', () => {
    const placements = [
      {
        identityId: IDENTITY_ID,
        categoryId: CATEGORY_ID,
        anchorIdentityId: ANCHOR_ID,
        relation: 'after',
        batchOrder: 1,
      },
      {
        identityId: ANCHOR_ID,
        categoryId: CATEGORY_ID,
        anchorIdentityId: IDENTITY_ID,
        relation: 'before',
        batchOrder: 0,
      },
    ];
    const args = buildPlaceCatalogItemsArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '4',
      expectedPlacementRevision: '2',
      placementsJson: JSON.stringify(placements),
      reason: 'ยืนยันตำแหน่งตามหมวดงาน',
    }), REQUEST_ID);

    expect(args).toMatchObject({
      p_version_id: VERSION_ID,
      p_expected_lock_version: 4,
      p_expected_placement_revision: 2,
      p_reason: 'ยืนยันตำแหน่งตามหมวดงาน',
      p_placements: [
        { identityId: ANCHOR_ID, batchOrder: 0 },
        { identityId: IDENTITY_ID, batchOrder: 1 },
      ],
    });

    expect(buildPlaceCatalogItemsArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '4',
      expectedPlacementRevision: '2',
      placementsJson: JSON.stringify([
        placements[0],
        { ...placements[1], batchOrder: 1 },
      ]),
      reason: 'ยืนยันตำแหน่งตามหมวดงาน',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'PLACEMENT_ORDER_INVALID',
    });
  });

  it('rejects incomplete publish and restore forms before RPC execution', () => {
    expect(buildPublishCatalogVersionArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '3',
      effectiveDate: '07/05/2026',
      approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
      approvalDocumentDate: '2026-07-05',
      physicalArchiveReference: 'archive/catalog/2568.1.0',
      reason: 'WP-5 local-only publish',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'วันที่มีผล ต้องอยู่ในรูป YYYY-MM-DD',
    });

    expect(buildRestoreCatalogPointerArgs(form({
      targetVersionId: 'not-a-uuid',
      reason: 'WP-5 local-only pointer restore',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'รหัสเวอร์ชันเป้าหมายไม่ถูกต้อง',
    });
  });

  it('requires the typed publish version to match the server-owned version', () => {
    expect(validateCatalogPublishVersionConfirmation('2568.1.0', '2568.1.0')).toBeNull();
    expect(validateCatalogPublishVersionConfirmation(' 2568.1.0 ', '2568.1.0')).toBeNull();
    expect(validateCatalogPublishVersionConfirmation('2568.0.1', '2568.1.0')).toMatchObject({
      status: 'error',
      code: 'PUBLICATION_CONFIRMATION_MISMATCH',
      message: 'เลขเวอร์ชันที่พิมพ์ไม่ตรง กรุณาพิมพ์ 2568.1.0 ให้ตรงทุกตัว',
    });
  });

  it('builds grouped add and recode payloads for WP-4 draft mutations', () => {
    const addArgs = buildManualCatalogChangeArgs(baseForm({
      action: 'add',
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
      itemName: 'รายการเพิ่มใหม่',
      unit: 'รายการ',
      materialCost: '10.00',
      laborCost: '5.00',
      unitCost: '15.00',
      categoryCode: 'SMOKE',
      priceAuthorityReference: 'local-price-authority',
    }), REQUEST_ID);

    expect(addArgs).toMatchObject({
      p_change_payload: {
        changes: [{
          action: 'add',
          identityOutcome: 'candidate_add',
          categoryId: CATEGORY_ID,
          codeGroupId: GROUP_ID,
          unitCost: '15.00',
        }],
      },
    });

    const recodeArgs = buildManualCatalogChangeArgs(baseForm({
      action: 'recode',
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
    }), REQUEST_ID);

    expect(recodeArgs).toMatchObject({
      p_change_payload: {
        changes: [{
          action: 'recode',
          targetIdentityId: IDENTITY_ID,
          targetItemCode: 'ITEM-0001',
          categoryId: CATEGORY_ID,
          codeGroupId: GROUP_ID,
          identityOutcome: 'recode',
        }],
      },
    });
  });

  it('rejects incomplete or unsafe draft mutation forms before RPC execution', () => {
    expect(buildManualCatalogChangeArgs(baseForm({ reason: '' }), REQUEST_ID))
      .toMatchObject({ status: 'error', code: 'VALIDATION_FAILED' });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'update',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'หมวดงาน ต้องไม่ว่าง',
    });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'add',
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
      itemName: 'รายการเพิ่มใหม่',
      unit: 'รายการ',
      materialCost: '10',
      laborCost: '5.5',
      unitCost: '15.5',
      priceAuthorityReference: 'local-price-authority',
    }), REQUEST_ID)).toMatchObject({
      p_change_payload: {
        changes: [{
          materialCost: '10.00',
          laborCost: '5.50',
          unitCost: '15.50',
        }],
      },
    });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'add',
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
      itemName: 'รายการเพิ่มใหม่',
      unit: 'รายการ',
      materialCost: '10.001',
      laborCost: '5.00',
      unitCost: '15.00',
      priceAuthorityReference: 'local-price-authority',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'ราคา/ต้นทุนต้องเป็นตัวเลขไม่ติดลบ และมีทศนิยมได้ไม่เกินสองตำแหน่ง',
    });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'recode',
      categoryId: CATEGORY_ID,
      codeGroupId: 'not-a-uuid',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'กลุ่มรหัส ไม่ถูกต้อง',
    });
  });

  it('maps RPC success and stable action errors to UI state', () => {
    expect(mapCatalogRpcActionResponse({
      ok: true,
      data: {
        versionId: VERSION_ID,
        lockVersion: 4,
        changeSetId: 'change-set-id',
        duplicateRequest: false,
      },
    }, 'บันทึก draft change set แล้ว')).toMatchObject({
      status: 'success',
      versionId: VERSION_ID,
      lockVersion: 4,
      changeSetId: 'change-set-id',
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'DRAFT_LOCK_CONFLICT',
        message: 'Draft lock version is stale',
        retryable: true,
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'DRAFT_LOCK_CONFLICT',
      message: 'ฉบับร่างถูกเปลี่ยนแปลงหลังเปิดหน้าจอนี้ กรุณาโหลดข้อมูลล่าสุดแล้วตรวจอีกครั้ง',
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'PUBLICATION_METADATA_REQUIRED',
        message: 'Publication metadata is required',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'PUBLICATION_METADATA_REQUIRED',
      message: 'กรุณาระบุข้อมูลเอกสารอนุมัติและที่เก็บไฟล์ให้ครบ',
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'DRAFT_ALREADY_EXISTS',
        message: 'A mutable draft already exists for this base catalog version',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'DRAFT_ALREADY_EXISTS',
      message: expect.stringContaining('มีฉบับร่างที่กำลังทำงานอยู่แล้ว'),
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'VERSION_SEQUENCE_STALE',
        message: 'Catalog version was reserved by another operation',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'VERSION_SEQUENCE_STALE',
      message: expect.stringContaining('ทะเบียนล่าสุดเพื่อเสนอเลขใหม่'),
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE',
        message: 'Annual catalog effective year is outside the allowed range',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE',
      message: expect.stringContaining('ภายใน 10 ปีถัดจากเวอร์ชันฐาน'),
    });

    expect(mapCatalogRpcActionResponse({
      ok: true,
      data: {
        targetVersionId: VERSION_ID,
        changeSetId: 'restore-change-set-id',
      },
    }, 'Restore catalog pointer แล้ว')).toMatchObject({
      status: 'success',
      versionId: VERSION_ID,
      changeSetId: 'restore-change-set-id',
    });

    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'VERSION_NOT_RESTORABLE',
        message: 'Target catalog version must be active and published',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'VERSION_NOT_RESTORABLE',
      message: 'เวอร์ชันนี้ไม่เข้าเงื่อนไขสำหรับนำกลับมาใช้งาน',
    });
  });

  it('sanitizes internal or unknown RPC errors before they reach the UI', () => {
    expect(mapCatalogRpcActionResponse({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'duplicate key value violates unique constraint "catalog_change_sets_request_id_key"',
      },
    }, 'unused')).toMatchObject({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'ระบบบัญชีราคาปฏิเสธรายการนี้',
    });

    expect(createCatalogRpcTransportError('previewCatalogImport', REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: expect.stringContaining('ผลลัพธ์อาจถูกบันทึกแล้ว'),
      requestId: REQUEST_ID,
      retryable: true,
      outcomeUncertain: true,
    });

    expect(createCatalogRpcTransportError('publishCatalogVersion', REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: expect.stringContaining('ผลลัพธ์อาจถูกบันทึกแล้ว'),
      requestId: REQUEST_ID,
      outcomeUncertain: true,
    });

    expect(createCatalogRpcTransportError('abandonCatalogDraft', REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: expect.stringContaining('ยกเลิกฉบับร่างไม่สำเร็จ'),
      requestId: REQUEST_ID,
      outcomeUncertain: true,
    });
  });

  it('maps import validation metadata from RPC success payloads', () => {
    expect(mapCatalogRpcActionResponse({
      ok: true,
      data: {
        versionId: VERSION_ID,
        importId: '00000000-0000-4000-8000-000000000202',
        status: 'validated',
        normalizedPayloadHash: 'a'.repeat(64),
      },
    }, 'บันทึก import validation แล้ว')).toMatchObject({
      status: 'success',
      versionId: VERSION_ID,
      importId: '00000000-0000-4000-8000-000000000202',
      importStatus: 'validated',
      normalizedPayloadHash: 'a'.repeat(64),
    });
  });

  it('keeps retirement previews read-only until the capability is enabled', () => {
    expect(canPersistCatalogImportPreview(0, false)).toBe(true);
    expect(canPersistCatalogImportPreview(2, false)).toBe(false);
    expect(canPersistCatalogImportPreview(2, true)).toBe(true);
  });

  it('rotates a client request ID only after a definitive outcome', () => {
    const idle = { status: 'idle', message: '' } as const;
    const uncertain = {
      status: 'error',
      message: 'transport uncertain',
      outcomeUncertain: true,
    } as const;
    const rejected = {
      status: 'error',
      message: 'validation rejected',
      outcomeUncertain: false,
    } as const;

    expect(isDefinitiveCatalogMutationOutcome(idle)).toBe(false);
    expect(isDefinitiveCatalogMutationOutcome(uncertain)).toBe(false);
    expect(isDefinitiveCatalogMutationOutcome(rejected)).toBe(true);
    expect(isDefinitiveCatalogMutationOutcome({
      status: 'success',
      message: 'saved',
    })).toBe(true);

    expect(shouldBeginNewCatalogOperation(null, idle, 'draft-a', 'draft-a')).toBe(true);
    expect(shouldBeginNewCatalogOperation(idle, idle, 'draft-a', 'draft-a')).toBe(false);
    expect(shouldBeginNewCatalogOperation(idle, uncertain, 'draft-a', 'draft-a')).toBe(false);
    expect(shouldBeginNewCatalogOperation(uncertain, rejected, 'draft-a', 'draft-a')).toBe(true);
    expect(shouldBeginNewCatalogOperation(idle, idle, 'draft-a', 'draft-b')).toBe(true);

    expect(shouldPreserveCatalogOperationInput(idle)).toBe(true);
    expect(shouldPreserveCatalogOperationInput(uncertain)).toBe(true);
    expect(shouldPreserveCatalogOperationInput(rejected)).toBe(true);
    expect(shouldPreserveCatalogOperationInput({
      status: 'success',
      message: 'saved',
    })).toBe(false);
  });
});
