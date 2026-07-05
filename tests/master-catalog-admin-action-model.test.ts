import { describe, expect, it } from 'vitest';
import {
  buildManualCatalogChangeArgs,
  mapCatalogRpcActionResponse,
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
  });
});
