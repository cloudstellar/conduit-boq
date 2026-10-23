import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RouteBadge, type RouteBadgeData } from '../components/boq/RouteBadge';

// Resolve application aliases to the real UI primitives without a DOM package
// or a test-only badge/dialog implementation.
vi.mock('@/components/ui/badge', () => import('../components/ui/badge'));
vi.mock('@/components/ui/button', () => import('../components/ui/button'));
vi.mock('@/components/ui/dialog', () => import('../components/ui/dialog'));
vi.mock('@/lib/utils', () => import('../lib/utils'));

function renderBadge(data: RouteBadgeData, route?: string | null, onRetry?: () => void) {
    return renderToStaticMarkup(createElement(RouteBadge, { data, route, onRetry }));
}

describe('parent-fed route badge', () => {
    it('keeps loading explicit even when legacy text or previous names exist', () => {
        const markup = renderBadge({ status: 'loading', names: ['Old route'] }, 'Legacy route');
        expect(markup).toContain('กำลังโหลดเส้นทาง');
        expect(markup).not.toContain('1 เส้นทาง');
        expect(markup).not.toContain('ข้อมูลเดิม');
        expect(markup).not.toContain('<button');
    });

    it('shows a route error instead of inventing a count or legacy fallback', () => {
        const markup = renderBadge({ status: 'error', names: ['Previous route'] }, 'Legacy route', vi.fn());
        expect(markup).toContain('โหลดเส้นทางไม่สำเร็จ');
        expect(markup).toContain('<button');
        expect(markup).toContain('type="button"');
        expect(markup).toContain('aria-label="ลองโหลดเส้นทางหน้านี้อีกครั้ง"');
        expect(markup).not.toContain('1 เส้นทาง');
        expect(markup).not.toContain('ข้อมูลเดิม');
        expect(markup).not.toContain('aria-haspopup="dialog"');
    });

    it('does not expose a retry control without a parent retry callback', () => {
        const markup = renderBadge({ status: 'error', names: [] });
        expect(markup).toContain('โหลดเส้นทางไม่สำเร็จ');
        expect(markup).not.toContain('<button');
    });

    it.each([
        [['Route A'], '1 เส้นทาง'],
        [['Route A', 'Route B'], '2 เส้นทาง'],
        [['Route A, including a comma'], '1 เส้นทาง'],
    ] as const)('counts successful child names as authoritative: %j', (names, count) => {
        const markup = renderBadge({ status: 'ready', names }, 'Different legacy route');
        expect(markup).toContain(count);
        expect(markup).not.toContain('ข้อมูลเดิม');
        expect(markup).toContain('<button');
        expect(markup).toContain('type="button"');
        expect(markup).toContain('aria-haspopup="dialog"');
        expect(markup).toContain('aria-expanded="false"');
    });

    it('treats successful legacy fallback as one unsplit text value and labels it', () => {
        const markup = renderBadge({ status: 'ready', names: [] }, 'Legacy route A, route B');
        expect(markup).toContain('1 เส้นทาง');
        expect(markup).toContain('ข้อมูลเดิม');
        expect(markup).toContain('aria-label="ดูเส้นทาง 1 รายการ จากข้อมูลเดิม"');
        expect(markup).not.toContain('2 เส้นทาง');
    });

    it.each([null, undefined, ''])('shows a genuine empty result without fallback: %j', route => {
        const markup = renderBadge({ status: 'ready', names: [] }, route);
        expect(markup).toContain('ไม่มีเส้นทาง');
        expect(markup).not.toContain('<button');
        expect(markup).not.toContain('0 เส้นทาง');
    });
});
