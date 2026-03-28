'use client';

import { useMemo } from 'react';
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
import { Plus, Copy, ChevronDown, GripVertical } from 'lucide-react';
import { Route } from './RouteManager';

// DnD Kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RouteSidebarProps {
    routes: Route[];
    activeRouteId: string | null;
    onSelectRoute: (routeId: string) => void;
    onAddRoute: () => void;
    onRemoveRoute: (routeId: string) => void;
    onDuplicateRoute?: (routeId: string) => void;
    onReorderRoutes?: (orderedIds: string[]) => void;
    isCollapsed: boolean;
}

// ─── Sortable Route Item ───────────────────────
function SortableRouteItem({
    route,
    index,
    isActive,
    isCollapsed,
    onSelect,
}: {
    route: Route;
    index: number;
    isActive: boolean;
    isCollapsed: boolean;
    onSelect: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: route.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms ease',
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                        'group relative rounded-lg',
                        isDragging && 'z-50 opacity-70 shadow-lg',
                    )}
                >
                    {isCollapsed ? (
                        /* ── Collapsed Mode ──
                         * Entire button is both click target AND drag handle.
                         * PointerSensor distance:8 differentiates click vs drag.
                         */
                        <button
                            ref={setActivatorNodeRef}
                            {...attributes}
                            {...listeners}
                            onClick={onSelect}
                            style={{ touchAction: 'none' }}
                            className={cn(
                                'w-full rounded-lg flex items-center justify-center aspect-square',
                                'transition-all cursor-grab active:cursor-grabbing',
                                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-background hover:bg-accent text-foreground border',
                            )}
                        >
                            <span
                                className={cn(
                                    'size-8 rounded-full flex items-center justify-center text-sm font-semibold',
                                    isActive ? 'bg-primary-foreground/20' : '',
                                )}
                            >
                                {index + 1}
                            </span>
                        </button>
                    ) : (
                        /* ── Expanded Mode ──
                         * Left grip icon = drag handle
                         * Route name button = click to select
                         */
                        <div className="flex items-center gap-0.5">
                            {/* Drag Handle */}
                            <button
                                ref={setActivatorNodeRef}
                                {...attributes}
                                {...listeners}
                                style={{ touchAction: 'none' }}
                                className={cn(
                                    'shrink-0 cursor-grab active:cursor-grabbing p-1.5 rounded',
                                    'text-muted-foreground/40 hover:text-muted-foreground',
                                    'opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity',
                                    isDragging && 'opacity-100',
                                )}
                                tabIndex={-1}
                            >
                                <GripVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Route Select Button */}
                            <button
                                onClick={onSelect}
                                className={cn(
                                    'flex-1 min-w-0 rounded-lg flex items-center px-3 py-2 gap-2 text-left',
                                    'transition-all cursor-pointer',
                                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-background hover:bg-accent text-foreground border',
                                )}
                            >
                                <span
                                    className={cn(
                                        'size-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                                        isActive ? 'bg-primary-foreground/20' : 'bg-muted',
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span className="truncate text-sm">
                                    {route.route_name || `เส้นทางที่ ${index + 1}`}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </TooltipTrigger>
            {isCollapsed && (
                <TooltipContent side="right">
                    <p>{route.route_name || `เส้นทางที่ ${index + 1}`}</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
}

// ─── Main Sidebar ──────────────────────────────
export default function RouteSidebar({
    routes,
    activeRouteId,
    onSelectRoute,
    onAddRoute,
    onDuplicateRoute,
    onReorderRoutes,
    isCollapsed,
}: RouteSidebarProps) {
    const hasActiveRoute = activeRouteId !== null;

    // DnD sensors — distance:8 means click (< 8px) selects, drag (≥ 8px) reorders
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const routeIds = useMemo(() => routes.map(r => r.id), [routes]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = routes.findIndex(r => r.id === active.id);
        const newIndex = routes.findIndex(r => r.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = [...routeIds];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id as string);
        onReorderRoutes?.(newOrder);
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-col h-full bg-muted/30">
                {/* Header */}
                <div className="p-2 border-b">
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    {isCollapsed ? (
                                        <Button size="icon" variant="outline" className="w-full h-10">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full gap-2 justify-between">
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
                    <div className="p-2 space-y-1.5">
                        {routes.length === 0 ? (
                            <div className="text-center py-4">
                                <span className="text-xs text-muted-foreground">
                                    {isCollapsed ? '—' : 'ไม่มีเส้นทาง'}
                                </span>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={routeIds}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {routes.map((route, index) => (
                                        <SortableRouteItem
                                            key={route.id}
                                            route={route}
                                            index={index}
                                            isActive={activeRouteId === route.id}
                                            isCollapsed={isCollapsed}
                                            onSelect={() => onSelectRoute(route.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    );
}
