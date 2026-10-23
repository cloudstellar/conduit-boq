'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export type RouteBadgeData = {
    status: 'loading' | 'error' | 'ready';
    names: readonly string[];
};

interface RouteBadgeProps {
    data: RouteBadgeData;
    /** One legacy display value; a comma can be part of a route name. */
    route?: string | null;
    /** Retries the parent-owned current-page batch, never an individual BOQ. */
    onRetry?: () => void;
}

function ReadyRouteBadge({ names, legacy }: { names: readonly string[]; legacy: boolean }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge asChild variant="secondary" className="min-h-11 max-w-full cursor-pointer flex-wrap px-2.5">
                    <button
                        type="button"
                        aria-label={`ดูเส้นทาง ${names.length} รายการ${legacy ? ' จากข้อมูลเดิม' : ''}`}
                    >
                        <span>{names.length} เส้นทาง</span>
                        {legacy ? <span>ข้อมูลเดิม</span> : null}
                    </button>
                </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>รายการเส้นทาง ({names.length} เส้นทาง)</DialogTitle>
                    <DialogDescription>
                        {legacy ? 'ชื่อเส้นทางจากข้อมูลเดิม แสดงเป็นหนึ่งรายการ' : 'เส้นทางของใบประมาณราคานี้'}
                    </DialogDescription>
                </DialogHeader>
                <ul className="flex max-h-[60vh] list-disc flex-col gap-3 overflow-y-auto pl-5">
                    {names.map((name, index) => (
                        <li key={index} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {name}
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}

/** Render only the page's route result. The parent owns loading and retries. */
export function RouteBadge({ data, route, onRetry }: RouteBadgeProps) {
    if (data.status === 'loading') {
        return <span className="text-sm text-muted-foreground">กำลังโหลดเส้นทาง...</span>;
    }

    if (data.status === 'error') {
        return (
            <span className="inline-flex max-w-full flex-wrap items-center gap-1">
                <span className="text-sm text-muted-foreground">โหลดเส้นทางไม่สำเร็จ</span>
                {onRetry ? (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="min-h-11 px-1"
                        onClick={onRetry}
                        aria-label="ลองโหลดเส้นทางหน้านี้อีกครั้ง"
                    >
                        ลองใหม่
                    </Button>
                ) : null}
            </span>
        );
    }

    const legacy = data.names.length === 0 && Boolean(route);
    const names = legacy && route ? [route] : data.names;

    if (names.length === 0) {
        return <span className="text-sm text-muted-foreground">ไม่มีเส้นทาง</span>;
    }

    // Remount Radix's local dialog state on content changes. The page also keys
    // badges by its query/route-attempt generation, including unchanged names.
    return <ReadyRouteBadge key={JSON.stringify([legacy, names])} names={names} legacy={legacy} />;
}
