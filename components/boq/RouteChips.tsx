'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface RouteChipsProps {
    route: string | null | undefined;
}

/**
 * Display routes as chips with "+N" popover for overflow
 * Routes can be comma-separated in a single string
 *
 * Smart display logic:
 * - ≤3 routes: show all
 * - 4-8 routes: show 4, +N
 * - >8 routes: show 3, +N (prevent clutter)
 */
export function RouteChips({ route }: RouteChipsProps) {
    if (!route) {
        return <span className="text-xs text-muted-foreground">-</span>;
    }

    // Parse comma-separated routes
    const routes = route
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

    if (routes.length === 0) {
        return <span className="text-xs text-muted-foreground">-</span>;
    }

    // Smart maxVisible logic
    let maxVisible: number;
    if (routes.length <= 3) {
        maxVisible = routes.length; // Show all
    } else if (routes.length <= 8) {
        maxVisible = 4; // Show 4, +N
    } else {
        maxVisible = 3; // Show 3, +N (prevent clutter)
    }

    const visibleRoutes = routes.slice(0, maxVisible);
    const hiddenRoutes = routes.slice(maxVisible);
    const hiddenCount = hiddenRoutes.length;

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {visibleRoutes.map((r, index) => (
                <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-normal truncate max-w-[140px]"
                    title={r}
                >
                    {r}
                </Badge>
            ))}

            {hiddenCount > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            +{hiddenCount}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-[350px] p-3" align="start">
                        <div className="text-sm font-medium mb-2">เส้นทางทั้งหมด ({routes.length})</div>
                        <div className="flex flex-col gap-1.5">
                            {routes.map((r, index) => (
                                <div
                                    key={index}
                                    className="text-sm text-muted-foreground"
                                >
                                    • {r}
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
