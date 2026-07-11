import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogVersionDetail,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogVersionDetailView,
} from '../../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

export default async function MasterCatalogVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}`);
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const detail = await loadCatalogVersionDetail(supabase, versionId);
  if (!detail) {
    notFound();
  }

  return <MasterCatalogVersionDetailView gate={gate} detail={detail} />;
}
