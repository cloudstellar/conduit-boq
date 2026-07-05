import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogAdminHistory,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogHistoryView,
} from '../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

export default async function MasterCatalogHistoryPage() {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect('/login?redirectTo=/admin/master-catalog/history');
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="history" />;
  }

  const history = await loadCatalogAdminHistory(supabase);
  return <MasterCatalogHistoryView gate={gate} history={history} />;
}
