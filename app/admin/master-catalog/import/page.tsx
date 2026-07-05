import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogAdminHistory,
} from '@/lib/master-catalog/admin/readModel';
import { loadCatalogImportContext } from '@/lib/master-catalog/admin/importContext';
import {
  MasterCatalogGateView,
  MasterCatalogImportView,
} from '../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

export default async function MasterCatalogImportPage() {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect('/login?redirectTo=/admin/master-catalog/import');
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="import" />;
  }

  const [history, importContext] = await Promise.all([
    loadCatalogAdminHistory(supabase),
    loadCatalogImportContext(supabase),
  ]);
  return (
    <MasterCatalogImportView
      gate={gate}
      history={{
        imports: history.imports,
        warnings: [...history.warnings, ...importContext.warnings],
      }}
      importContext={importContext}
    />
  );
}
