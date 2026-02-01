'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Plus, Copy, ChevronDown } from 'lucide-react';
import { Route } from './RouteManager';

interface RouteSidebarProps {
    routes: Route[];
    activeRouteId: string | null;
    onSelectRoute: (routeId: string) => void;
    onAddRoute: () => void;
    onRemoveRoute: (routeId: string) => void;
    onDuplicateRoute?: (routeId: string) => void;
    isCollapsed: boolean;
}

/**
 * Custom Collapsible Route Sidebar
 * 
 * Collapsed (w-[64px]): Shows circled route numbers [1] [2] [3] + DropdownMenu for add/duplicate
 * Expanded (w-[240px]): Shows "เส้นทางที่ X" with full labels + DropdownMenu for add/duplicate
 * 
 * Active state uses: bg-primary text-primary-foreground
 */
export default function RouteSidebar({
    routes,
    activeRouteId,
    onSelectRoute,
    onAddRoute,
    onDuplicateRoute,
    isCollapsed,
}: RouteSidebarProps) {
    const hasActiveRoute = activeRouteId !== null;

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-col h-full bg-muted/30">
                {/* Header: DropdownMenu for Add Route (both collapsed and expanded) */}
                <div className="p-2 border-b">
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    {isCollapsed ? (
                                        // Collapsed: Icon-only button
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="w-full h-10"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        // Expanded: Full text button with chevron
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 justify-between"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                เพิ่มเส้นทาง
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                        </Button>
                                    )}
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right">
                                    <p>เพิ่มเส้นทาง</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                        <DropdownMenuContent align={isCollapsed ? "end" : "start"} className="w-[220px]">
                            <DropdownMenuItem onClick={onAddRoute}>
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มเส้นทางใหม่ (ว่าง)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => activeRouteId && onDuplicateRoute?.(activeRouteId)}
                                disabled={!hasActiveRoute}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                คัดลอกเส้นทางปัจจุบัน
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Route List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {routes.length === 0 ? (
                            <div className="text-center py-4">
                                <span className="text-xs text-muted-foreground">
                                    {isCollapsed ? '—' : 'ไม่มีเส้นทาง'}
                                </span>
                            </div>
                        ) : (
                            routes.map((route, index) => (
                                <Tooltip key={route.id}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => onSelectRoute(route.id)}
                                            className={cn(
                                                'w-full rounded-lg flex items-center transition-all cursor-pointer',
                                                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                isCollapsed
                                                    ? 'aspect-square justify-center'
                                                    : 'px-3 py-2 gap-2 text-left',
                                                activeRouteId === route.id
                                                    ? 'bg-primary text-primary-foreground shadow-md'
                                                    : 'bg-background hover:bg-accent text-foreground border'
                                            )}
                                        >
                                            {isCollapsed ? (
                                                // Collapsed: Circled number
                                                <span
                                                    className={cn(
                                                        'size-8 rounded-full flex items-center justify-center text-sm font-semibold',
                                                        activeRouteId === route.id
                                                            ? 'bg-primary-foreground/20'
                                                            : ''
                                                    )}
                                                >
                                                    {index + 1}
                                                </span>
                                            ) : (
                                                // Expanded: Full label
                                                <>
                                                    <span
                                                        className={cn(
                                                            'size-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                                                            activeRouteId === route.id
                                                                ? 'bg-primary-foreground/20'
                                                                : 'bg-muted'
                                                        )}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                    <span className="truncate text-sm">
                                                        {route.route_name || `เส้นทางที่ ${index + 1}`}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right">
                                            <p>{route.route_name || `เส้นทางที่ ${index + 1}`}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    );
}
