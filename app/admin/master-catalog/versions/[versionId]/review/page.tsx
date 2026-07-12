import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogVersionReview,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogVersionReviewView,
} from '../../../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MasterCatalogVersionReviewPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  if (!UUID_PATTERN.test(versionId)) notFound();

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}/review`);
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const review = await loadCatalogVersionReview(supabase, versionId);
  if (!review) notFound();

  return <MasterCatalogVersionReviewView gate={gate} review={review} />;
}
