import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogAdminOverview,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogVersionsView,
} from '../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

export default async function MasterCatalogVersionsPage() {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect('/login?redirectTo=/admin/master-catalog/versions');
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const overview = await loadCatalogAdminOverview(supabase);
  return <MasterCatalogVersionsView gate={gate} overview={overview} />;
}
