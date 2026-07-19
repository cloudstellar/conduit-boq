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
import {
  parseCatalogReviewLock,
  resolveCatalogReviewBinding,
} from '@/lib/master-catalog/admin/reviewBinding';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MasterCatalogVersionReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ reviewLock?: string | string[] }>;
}) {
  const [{ versionId }, query] = await Promise.all([params, searchParams]);
  if (!UUID_PATTERN.test(versionId)) notFound();

  const requestedLockVersion = parseCatalogReviewLock(query.reviewLock);
  const reviewPath = `/admin/master-catalog/versions/${versionId}/review${
    requestedLockVersion === null ? '' : `?reviewLock=${requestedLockVersion}`
  }`;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect(`/login?redirectTo=${encodeURIComponent(reviewPath)}`);
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="versions" />;
  }

  const review = await loadCatalogVersionReview(supabase, versionId);
  if (!review) notFound();

  const reviewBinding = resolveCatalogReviewBinding({
    isDraft: review.version.status === 'draft',
    requestedLockVersion,
    currentLockVersion: review.version.lockVersion,
  });

  if (reviewBinding.state === 'canonicalize') {
    redirect(`${reviewPath}?reviewLock=${reviewBinding.currentLockVersion}`);
  }

  return (
    <MasterCatalogVersionReviewView
      gate={gate}
      review={review}
      reviewBinding={reviewBinding}
    />
  );
}
