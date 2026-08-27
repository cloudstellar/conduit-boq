import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  canReadCatalogAdmin,
  loadCatalogAdminGate,
  loadCatalogVersionsRegisterPage,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogVersionsView,
} from '../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MasterCatalogVersionsPage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string; beforeId?: string }>;
}) {
  const query = await searchParams;
  const cursor =
    query.before
    && query.beforeId
    && UUID_PATTERN.test(query.beforeId)
    && Number.isFinite(Date.parse(query.before))
      ? { createdAt: query.before, id: query.beforeId }
      : undefined;
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect('/login?redirectTo=/admin/master-catalog/versions');
  }

  if (!canReadCatalogAdmin(gate)) {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const page = await loadCatalogVersionsRegisterPage(supabase, cursor, {
    readOnlyMode: gate.state === 'disabled',
  });
  return <MasterCatalogVersionsView gate={gate} page={page} />;
}
