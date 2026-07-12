import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogIdentityHistoryPage,
  loadCatalogItemDetail,
} from '@/lib/master-catalog/admin/catalogWorkspace';
import { loadCatalogAdminGate } from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogItemDetailView,
} from '../../../../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MasterCatalogItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string; identityId: string }>;
  searchParams: Promise<{ before?: string; beforeId?: string }>;
}) {
  const [{ versionId, identityId }, query] = await Promise.all([params, searchParams]);

  if (!UUID_PATTERN.test(versionId) || !UUID_PATTERN.test(identityId)) notFound();

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
    redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}/items/${identityId}`);
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const [item, history] = await Promise.all([
    loadCatalogItemDetail(supabase, versionId, identityId),
    loadCatalogIdentityHistoryPage(supabase, identityId, cursor),
  ]);

  if (!item) notFound();

  return <MasterCatalogItemDetailView gate={gate} item={item} history={history} />;
}
