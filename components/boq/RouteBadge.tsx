'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RouteBadgeProps {
    route: string | null | undefined;
}

/**
 * Display route count as a clickable badge.
 * Click opens a Dialog showing full route names.
 * 
 * UX Rule:
 * - List: show count only
 * - Click: show full names
 * - Table: no long text
 * - Dialog: read full content
 */
export function RouteBadge({ route }: RouteBadgeProps) {
    const [open, setOpen] = useState(false);

    if (!route) {
        return <span className="text-sm text-muted-foreground">-</span>;
    }

    // Parse comma-separated routes
    const routes = route
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

    if (routes.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
    }

    const routeCount = routes.length;

    return (
        <>
            <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setOpen(true)}
            >
                {routeCount} เส้นทาง
            </Badge>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>รายการเส้นทาง ({routeCount} เส้นทาง)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {routes.map((r, index) => (
                            <div
                                key={index}
                                className="text-sm text-muted-foreground leading-relaxed"
                            >
                                • {r}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
