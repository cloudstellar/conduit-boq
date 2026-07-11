import { Skeleton } from '@/components/ui/skeleton';
import { MasterCatalogRouteStateShell } from './_components/MasterCatalogRouteStateShell';

export default function MasterCatalogLoading() {
  return (
    <MasterCatalogRouteStateShell>
      <div aria-busy="true" aria-label="กำลังโหลด Master Catalog" className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </MasterCatalogRouteStateShell>
  );
}
