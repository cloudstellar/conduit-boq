import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  canReadCatalogAdmin,
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
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { versionId } = await params;
  const { notice } = await searchParams;
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}`);
  }

  if (!canReadCatalogAdmin(gate)) {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const detail = await loadCatalogVersionDetail(supabase, versionId);
  if (!detail) {
    notFound();
  }

  return (
    <MasterCatalogVersionDetailView
      gate={gate}
      detail={detail}
      notice={notice === 'import-applied' ? 'import-applied' : undefined}
    />
  );
}
