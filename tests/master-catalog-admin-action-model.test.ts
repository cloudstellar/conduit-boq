import { describe, expect, it } from 'vitest';
import {
  buildPublishCatalogVersionArgs,
  buildRestoreCatalogPointerArgs,
  buildManualCatalogChangeArgs,
  createCatalogRpcTransportError,
  isDefinitiveCatalogMutationOutcome,
  mapCatalogRpcActionResponse,
  shouldBeginNewCatalogOperation,
  shouldPreserveCatalogOperationInput,
} from '../lib/master-catalog/admin/actionModel';

const VERSION_ID = '00000000-0000-4000-8000-000000000001';
const REQUEST_ID = '00000000-0000-4000-8000-000000000101';

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
          legacyItemCode: 'ITEM-0001',
          identityOutcome: 'retire',
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
      publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      reason: 'WP-5 local-only publish',
    }), REQUEST_ID);

    expect(publishArgs).toMatchObject({
      p_version_id: VERSION_ID,
      p_expected_lock_version: 3,
      p_approval_metadata: {
        effectiveDate: '2026-07-05',
        approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
        approvalDocumentDate: '2026-07-05',
        publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
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

  it('rejects incomplete publish and restore forms before RPC execution', () => {
    expect(buildPublishCatalogVersionArgs(form({
      versionId: VERSION_ID,
      expectedLockVersion: '3',
      effectiveDate: '07/05/2026',
      approvalReference: 'LOCAL-WP5-REHEARSAL-ONLY-NOT-PRODUCTION',
      approvalDocumentDate: '2026-07-05',
      publishedByDisplayName: 'Local WP-5 Rehearsal Publisher',
      reason: 'WP-5 local-only publish',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'effective date ต้องอยู่ในรูป YYYY-MM-DD',
    });

    expect(buildRestoreCatalogPointerArgs(form({
      targetVersionId: 'not-a-uuid',
      reason: 'WP-5 local-only pointer restore',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'target version id ไม่ถูกต้อง',
    });
  });

  it('builds grouped add and recode payloads for WP-4 draft mutations', () => {
    const addArgs = buildManualCatalogChangeArgs(baseForm({
      action: 'add',
      canonicalCode: 'SMK-ADD-001',
      workContextCode: 'SMK',
      workContextNameTh: 'กลุ่มงานทดสอบ smoke',
      itemTypeCode: 'ADD',
      itemTypeNameTh: 'งานเพิ่ม smoke',
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
          canonicalCode: 'SMK-ADD-001',
          workContextNameTh: 'กลุ่มงานทดสอบ smoke',
          itemTypeNameTh: 'งานเพิ่ม smoke',
          unitCost: '15.00',
        }],
      },
    });

    const recodeArgs = buildManualCatalogChangeArgs(baseForm({
      action: 'recode',
      canonicalCode: 'SMK-RCD-001',
      categoryCode: 'SMOKE',
      workContextCode: 'SMK',
      workContextNameTh: 'กลุ่มงานทดสอบ smoke',
      itemTypeCode: 'RCD',
      itemTypeNameTh: 'งานเปลี่ยนรหัส smoke',
    }), REQUEST_ID);

    expect(recodeArgs).toMatchObject({
      p_change_payload: {
        changes: [{
          action: 'recode',
          legacyItemCode: 'ITEM-0001',
          canonicalCode: 'SMK-RCD-001',
          categoryCode: 'SMOKE',
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
      priceAuthorityReference: 'local-authority',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'update ต้องมีอย่างน้อยหนึ่ง field ที่ต้องการเปลี่ยน',
    });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'add',
      canonicalCode: 'SMK-ADD-001',
      workContextCode: 'SMK',
      workContextNameTh: 'กลุ่มงานทดสอบ smoke',
      itemTypeCode: 'ADD',
      itemTypeNameTh: 'งานเพิ่ม smoke',
      itemName: 'รายการเพิ่มใหม่',
      unit: 'รายการ',
      materialCost: '10',
      laborCost: '5.00',
      unitCost: '15.00',
      categoryCode: 'SMOKE',
      priceAuthorityReference: 'local-price-authority',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      message: 'ราคา/ต้นทุนต้องเป็นเลขทศนิยมสองตำแหน่ง',
    });

    expect(buildManualCatalogChangeArgs(baseForm({
      action: 'recode',
      canonicalCode: 'SMK-RCD-900',
      workContextCode: 'SMK',
      workContextNameTh: 'กลุ่มงานทดสอบ smoke',
      itemTypeCode: 'RCD',
      itemTypeNameTh: 'งานเปลี่ยนรหัส smoke',
    }), REQUEST_ID)).toMatchObject({
      status: 'error',
      code: 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
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
      message: 'Draft lock version is stale',
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
      message: 'Publication metadata is required',
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
      message: 'Target catalog version must be active and published',
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
      message: 'Master Catalog RPC ปฏิเสธรายการนี้',
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
