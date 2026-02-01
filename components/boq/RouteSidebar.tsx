'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Route } from './RouteManager';

interface RouteSidebarProps {
    routes: Route[];
    activeRouteId: string | null;
    onSelectRoute: (routeId: string) => void;
    onAddRoute: () => void;
    onRemoveRoute: (routeId: string) => void;
}

/**
 * Compact Route Number Sidebar
 * 
 * Active state styling uses shadcn tokens:
 * - Active: `bg-primary text-primary-foreground`
 * - Inactive: `bg-muted hover:bg-accent`
 * 
 * To change active colors later, edit the className below at line ~50
 */
export default function RouteSidebar({
    routes,
    activeRouteId,
    onSelectRoute,
    onAddRoute,
}: RouteSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-muted/30 border-r w-16">
            {/* Add Button - Top */}
            <div className="p-2 border-b">
                <Button
                    onClick={onAddRoute}
                    size="icon"
                    variant="outline"
                    className="w-full h-10"
                    title="เพิ่มเส้นทาง"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Route Numbers - Scrollable */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {routes.length === 0 ? (
                        <div className="text-center py-4">
                            <span className="text-xs text-muted-foreground">ว่าง</span>
                        </div>
                    ) : (
                        routes.map((route, index) => (
                            <button
                                key={route.id}
                                onClick={() => onSelectRoute(route.id)}
                                className={cn(
                                    "w-full aspect-square rounded-lg flex items-center justify-center",
                                    "text-sm font-semibold transition-colors",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    // Active state - uses shadcn tokens (edit here to change colors)
                                    activeRouteId === route.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-background hover:bg-accent text-foreground border"
                                )}
                                title={route.route_name || `เส้นทาง ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
