'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface RouteListProps {
    route: string | null | undefined;
    maxVisible?: number;
}

/**
 * Display routes as bullet list with "ดูทั้งหมด" popover for overflow
 * Routes can be comma-separated in a single string
 * 
 * - Each route shown as bullet (•)
 * - Line-clamp-2 per route
 * - Shows maxVisible routes, then "ดูทั้งหมด" link
 */
export function RouteList({ route, maxVisible = 2 }: RouteListProps) {
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

    const visibleRoutes = routes.slice(0, maxVisible);
    const hiddenCount = routes.length - maxVisible;

    return (
        <div className="space-y-1 text-muted-foreground">
            {visibleRoutes.map((r, idx) => (
                <div
                    key={idx}
                    className="whitespace-normal break-words line-clamp-2 leading-snug text-sm"
                    title={r}
                >
                    • {r}
                </div>
            ))}

            {hiddenCount > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary underline underline-offset-2"
                        >
                            ดูทั้งหมด (+{hiddenCount})
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-[400px] p-3" align="start">
                        <div className="text-sm font-medium mb-2">
                            เส้นทางทั้งหมด ({routes.length})
                        </div>
                        <div className="space-y-2">
                            {routes.map((r, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
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

/**
 * Extract first name from full name and return with tooltip
 */
export function getFirstName(fullName: string | null | undefined): {
    firstName: string;
    fullName: string;
} {
    const name = (fullName ?? '').trim();
    if (!name) {
        return { firstName: '-', fullName: '-' };
    }
    // Split by space and take first word
    const firstName = name.split(/\s+/)[0] || name;
    return { firstName, fullName: name };
}
