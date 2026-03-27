'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RouteBadgeProps {
    boqId: string;
    /** Legacy fallback: comma-separated route text from boq.route */
    route?: string | null;
}

/**
 * Display route count as a clickable badge.
 * Queries boq_routes table for accurate count and names.
 * Falls back to legacy boq.route text if no routes found.
 */
export function RouteBadge({ boqId, route }: RouteBadgeProps) {
    const [open, setOpen] = useState(false);
    const supabase = useMemo(() => createClient(), []);
    const [routeNames, setRouteNames] = useState<string[] | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Load route names from boq_routes on first dialog open or mount
    useEffect(() => {
        const fetchRoutes = async () => {
            const { data } = await supabase
                .from('boq_routes')
                .select('route_name')
                .eq('boq_id', boqId)
                .order('route_order');
            setRouteNames(data?.map(r => r.route_name) || []);
            setLoaded(true);
        };
        fetchRoutes();
    }, [boqId, supabase]);

    // While loading, show legacy count or dash
    if (!loaded) {
        if (!route) return <span className="text-sm text-muted-foreground">-</span>;
        return (
            <Badge variant="secondary" className="opacity-50">
                ...
            </Badge>
        );
    }

    // If no routes in boq_routes, fall back to legacy text
    const names = routeNames && routeNames.length > 0
        ? routeNames
        : (route ? [route] : []);

    if (names.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
    }

    const routeCount = names.length;

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
                        {names.map((r, index) => (
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
