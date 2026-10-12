import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { QuantityEditor } from '../components/boq/QuantityEditor';
import { MAX_QUANTITY, formatQuantity, parseQuantityDraft } from '../lib/boq/quantityInput';

// Resolve the app aliases to their real modules without changing the shared
// Vitest configuration or replacing the editor's production UI primitives.
vi.mock('@/components/ui/button', () => import('../components/ui/button'));
vi.mock('@/components/ui/input', () => import('../components/ui/input'));
vi.mock('@/lib/utils', () => import('../lib/utils'));
vi.mock('@/lib/boq/quantityInput', () => import('../lib/boq/quantityInput'));

describe('numeric-only quantity drafts', () => {
  it.each([
    ['0', 0], ['00', 0], ['5', 5], ['5.', 5], ['.5', 0.5],
    ['0.05', 0.05], ['12.50', 12.5], ['0005.20', 5.2],
    [' \t5.20\n', 5.2], ['9999999999.99', MAX_QUANTITY],
    ['0009999999999.99', MAX_QUANTITY],
  ])('accepts the complete decimal %s without rounding', (text, value) => {
    expect(parseQuantityDraft(String(text))).toEqual({ status: 'valid', value });
  });

  it.each(['', ' ', '\t\n', '.', ' . '])('keeps %j incomplete instead of turning it into zero', text => {
    expect(parseQuantityDraft(text)).toEqual({ status: 'incomplete', message: expect.any(String) });
  });

  it.each([
    '5*2', '5x2', '5X2', '5×2', '=5*2', '5+2', '5/2', '(5)',
    '-5', '-0', '+5', '5e2', 'Infinity', 'NaN',
    '1,234.50', '1,5', '1 2', '1\t2', '1\n2', '1\u00a02',
    '1.2.3', '..', '５', '๕', '5m',
  ])('rejects all of %j rather than recovering another number from it', text => {
    expect(parseQuantityDraft(text)).toEqual({ status: 'invalid', message: expect.any(String) });
  });

  it.each(['1.234', '1.230', '0.000', '.001', '9999999999.990'])('rejects extra decimal places in %s including trailing zeros', text => {
    expect(parseQuantityDraft(text)).toMatchObject({ status: 'invalid', message: expect.stringContaining('2') });
  });

  it.each(['10000000000', '10000000000.00', '00010000000000.00', '9'.repeat(1000)])('rejects a magnitude above the approved database range', text => {
    expect(parseQuantityDraft(text)).toMatchObject({ status: 'invalid', message: expect.stringContaining('9999999999.99') });
  });

  it('formats accepted values without changing their numeric result', () => {
    for (const text of ['0', '.01', '.50', '1.05', '3.14', '1234567890.12', '9999999999.99']) {
      const parsed = parseQuantityDraft(text);
      expect(parsed.status).toBe('valid');
      if (parsed.status !== 'valid') throw new Error('Expected a valid fixture');
      expect(parseQuantityDraft(formatQuantity(parsed.value))).toEqual(parsed);
    }
    expect(formatQuantity(0)).toBe('0.00');
    expect(formatQuantity(12.5)).toBe('12.50');
  });

  it('does not disguise non-finite source values as a formatted zero', () => {
    expect(parseQuantityDraft(formatQuantity(Number.NaN)).status).toBe('invalid');
    expect(parseQuantityDraft(formatQuantity(Number.POSITIVE_INFINITY)).status).toBe('invalid');
  });
});

function renderEditor(overrides: Partial<Parameters<typeof QuantityEditor>[0]> = {}) {
  return renderToStaticMarkup(createElement(QuantityEditor, {
    value: 10,
    onDraftChange: vi.fn(), onCommit: vi.fn(), onCancel: vi.fn(), onStep: vi.fn(),
    ...overrides,
  }));
}

describe('controlled quantity editor markup', () => {
  it('shows the committed quantity until a parent-owned draft exists', () => {
    const pristine = renderEditor();
    expect(pristine).toContain('value="10.00"');
    expect(pristine).not.toContain('ยกเลิกการแก้ไข');
    const editing = renderEditor({ draft: '5.' });
    expect(editing).toContain('value="5."');
    expect(editing).toContain('ยกเลิกการแก้ไขปริมาณ');
    expect(pristine).toContain('<div class="h-8"></div>');
    expect(editing).toContain('<div class="h-8"><button');
  });

  it('retains rejected text, associates its accessible error and disables both steppers', () => {
    const markup = renderEditor({ draft: '5*2', error: 'กรอกเฉพาะตัวเลข' });
    expect(markup).toContain('value="5*2"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('role="alert"');
    const descriptionId = markup.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(descriptionId).toBeTruthy();
    expect(markup).toContain(`id="${descriptionId}"`);
    const buttons = markup.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toContain(' disabled=""');
    expect(buttons[1]).toContain(' disabled=""');
    expect(buttons[2]).not.toContain(' disabled=""');
  });

  it('keeps an empty draft visible and cancellable instead of displaying the baseline', () => {
    const markup = renderEditor({ draft: '' });
    expect(markup).toContain('value=""');
    const buttons = markup.match(/<button[^>]*>/g) ?? [];
    expect(buttons[0]).toContain(' disabled=""');
    expect(buttons[1]).toContain(' disabled=""');
    expect(buttons[2]).not.toContain(' disabled=""');
  });

  it('uses the valid draft for stepper bounds rather than the older committed number', () => {
    const atZero = renderEditor({ value: 10, draft: '0' }).match(/<button[^>]*>/g) ?? [];
    expect(atZero[0]).toContain(' disabled=""');
    expect(atZero[1]).not.toContain(' disabled=""');
    const atMax = renderEditor({ value: 0, draft: '9999999999.99' }).match(/<button[^>]*>/g) ?? [];
    expect(atMax[0]).not.toContain(' disabled=""');
    expect(atMax[1]).toContain(' disabled=""');
  });

  it('does not round an existing extra-precision value into an enabled stepper', () => {
    const markup = renderEditor({ value: 1.234 });
    expect(markup).toContain('value="1.23"');
    expect(markup).toContain('ค่าเดิม 1.234');
    expect(markup).toContain('กรอกทศนิยมไม่เกิน 2 ตำแหน่ง');
    const buttons = markup.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toContain(' disabled=""');
    expect(buttons[1]).toContain(' disabled=""');
    expect(markup).not.toContain('aria-invalid="true"');
    const descriptionId = markup.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(descriptionId).toBeTruthy();
    expect(markup).toContain(`id="${descriptionId}"`);

    const explicitlyEdited = renderEditor({ value: 1.234, draft: '1.23' });
    expect(explicitlyEdited).not.toContain('ค่าเดิม 1.234');
    const editedButtons = explicitlyEdited.match(/<button[^>]*>/g) ?? [];
    expect(editedButtons[0]).not.toContain(' disabled=""');
    expect(editedButtons[1]).not.toContain(' disabled=""');
  });
});
