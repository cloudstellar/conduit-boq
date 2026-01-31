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
    maxVisible?: number;
}

/**
 * Display routes as chips with "+N" popover for overflow
 * Routes can be comma-separated in a single string
 */
export function RouteChips({ route, maxVisible = 2 }: RouteChipsProps) {
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

    const visibleRoutes = routes.slice(0, maxVisible);
    const hiddenRoutes = routes.slice(maxVisible);
    const hiddenCount = hiddenRoutes.length;

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {visibleRoutes.map((r, index) => (
                <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-normal max-w-[120px] truncate"
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
                    <PopoverContent className="w-auto max-w-[300px] p-3" align="start">
                        <div className="text-sm font-medium mb-2">เส้นทางทั้งหมด ({routes.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                            {routes.map((r, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    {r}
                                </Badge>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
