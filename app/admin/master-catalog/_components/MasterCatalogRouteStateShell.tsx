import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MasterCatalogRouteStateShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft data-icon="inline-start" />
                ผู้ดูแลระบบ
              </Link>
            </Button>
            <div className="h-8 border-l border-border" />
            <div>
              <h1 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
                Master Catalog
              </h1>
              <p className="text-xs text-muted-foreground">ระบบบริหารบัญชีราคามาตรฐานของ NT</p>
            </div>
          </div>
          <div className="h-1 rounded-full bg-nt-yellow" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
