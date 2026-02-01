'use client';

import { Plus } from 'lucide-react';
import { Route } from './RouteManager';
import {
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RouteSidebarProps {
    routes: Route[];
    activeRouteId: string | null;
    onSelectRoute: (routeId: string) => void;
    onAddRoute: () => void;
    onRemoveRoute: (routeId: string) => void;
}

/**
 * Collapsible Route Sidebar using shadcn/ui Sidebar
 * 
 * Collapsed (icon mode): Shows circled route numbers [1] [2] [3]
 * Expanded: Shows "เส้นทางที่ X" with full labels
 * 
 * Active state uses: bg-primary text-primary-foreground
 */
export default function RouteSidebar({
    routes,
    activeRouteId,
    onSelectRoute,
    onAddRoute,
}: RouteSidebarProps) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <>
            {/* Header: Add Route Button */}
            <SidebarHeader className="border-b">
                {isCollapsed ? (
                    <Button
                        onClick={onAddRoute}
                        size="icon"
                        variant="outline"
                        className="w-full"
                        title="เพิ่มเส้นทาง"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={onAddRoute}
                        variant="outline"
                        className="w-full gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        เพิ่มเส้นทาง
                    </Button>
                )}
            </SidebarHeader>

            {/* Content: Route List */}
            <SidebarContent>
                <SidebarMenu>
                    {routes.length === 0 ? (
                        <div className="px-2 py-4 text-center">
                            <span className="text-xs text-muted-foreground">ไม่มีเส้นทาง</span>
                        </div>
                    ) : (
                        routes.map((route, index) => (
                            <SidebarMenuItem key={route.id}>
                                <SidebarMenuButton
                                    onClick={() => onSelectRoute(route.id)}
                                    isActive={activeRouteId === route.id}
                                    tooltip={route.route_name || `เส้นทาง ${index + 1}`}
                                    className={cn(
                                        'transition-all',
                                        activeRouteId === route.id && 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    )}
                                >
                                    {isCollapsed ? (
                                        // Collapsed: Circled number
                                        <span
                                            className={cn(
                                                'size-7 rounded-full flex items-center justify-center text-sm font-semibold',
                                                activeRouteId === route.id
                                                    ? 'bg-primary-foreground/20'
                                                    : 'bg-muted'
                                            )}
                                        >
                                            {index + 1}
                                        </span>
                                    ) : (
                                        // Expanded: Full label
                                        <span className="truncate">
                                            เส้นทางที่ {index + 1}
                                            {route.route_name && (
                                                <span className="text-muted-foreground ml-1">
                                                    - {route.route_name}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    )}
                </SidebarMenu>
            </SidebarContent>
        </>
    );
}
