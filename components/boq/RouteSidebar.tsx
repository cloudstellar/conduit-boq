'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Route } from './RouteManager';

interface RouteSidebarProps {
    routes: Route[];
    activeRouteId: string | null;
    onSelectRoute: (routeId: string) => void;
    onAddRoute: () => void;
    onRemoveRoute: (routeId: string) => void;
}

const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RouteSidebar({
    routes,
    activeRouteId,
    onSelectRoute,
    onAddRoute,
    onRemoveRoute,
}: RouteSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-muted/30 border-r z-30">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <h2 className="text-sm font-semibold text-foreground">เส้นทาง</h2>
                <Button
                    onClick={onAddRoute}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    เพิ่ม
                </Button>
            </div>

            {/* Route List */}
            <ScrollArea className="flex-1">
                {routes.length === 0 ? (
                    // Empty State
                    <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            ยังไม่มีเส้นทาง
                        </p>
                        <Button onClick={onAddRoute} size="sm">
                            เพิ่มเส้นทางแรก
                        </Button>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {routes.map((route, index) => (
                            <div
                                key={route.id}
                                onClick={() => onSelectRoute(route.id)}
                                className={cn(
                                    "group relative p-3 rounded-md cursor-pointer transition-colors",
                                    "hover:bg-accent",
                                    activeRouteId === route.id
                                        ? "bg-accent border-l-2 border-primary"
                                        : "bg-background"
                                )}
                            >
                                {/* Route Name - Thai-First: allow wrap */}
                                <div className="text-sm font-medium text-foreground leading-snug mb-1 pr-6">
                                    {route.route_name || `เส้นทาง ${index + 1}`}
                                </div>

                                {/* Total Cost */}
                                <div className="text-xs text-muted-foreground">
                                    ฿ {formatNumber(route.total_cost)}
                                </div>

                                {/* Delete Button - show on hover or active */}
                                {routes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('ต้องการลบเส้นทางนี้?')) {
                                                onRemoveRoute(route.id);
                                            }
                                        }}
                                        className={cn(
                                            "absolute top-2 right-2 p-1 rounded hover:bg-destructive/10",
                                            "text-muted-foreground hover:text-destructive",
                                            activeRouteId === route.id
                                                ? "opacity-100"
                                                : "opacity-0 group-hover:opacity-100"
                                        )}
                                        title="ลบเส้นทาง"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer - Total */}
            {routes.length > 0 && (
                <div className="p-3 border-t bg-background">
                    <div className="text-xs text-muted-foreground">รวมทั้งหมด</div>
                    <div className="text-sm font-semibold text-primary">
                        ฿ {formatNumber(routes.reduce((sum, r) => sum + r.total_cost, 0))}
                    </div>
                </div>
            )}
        </div>
    );
}
