import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogPlacementWorkspace,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogPlacementView,
} from '../../../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

export default async function MasterCatalogPlacementPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}/placement`);
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const workspace = await loadCatalogPlacementWorkspace(supabase, versionId);
  if (!workspace) notFound();

  return <MasterCatalogPlacementView gate={gate} workspace={workspace} />;
}
