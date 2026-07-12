import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadCatalogAdminGate,
  loadCatalogChangeSetsRegisterPage,
  loadCatalogImportsRegisterPage,
} from '@/lib/master-catalog/admin/readModel';
import {
  MasterCatalogGateView,
  MasterCatalogHistoryView,
} from '../_components/MasterCatalogAdminViews';

export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MasterCatalogHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    importsBefore?: string;
    importsBeforeId?: string;
    changesBefore?: string;
    changesBeforeId?: string;
  }>;
}) {
  const query = await searchParams;
  const importsCursor = cursor(query.importsBefore, query.importsBeforeId);
  const changesCursor = cursor(query.changesBefore, query.changesBeforeId);
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state === 'unauthenticated') {
    redirect('/login?redirectTo=/admin/master-catalog/history');
  }

  if (gate.state !== 'enabled') {
    return <MasterCatalogGateView gate={gate} activeSection="history" />;
  }

  const [importsPage, changeSetsPage] = await Promise.all([
    loadCatalogImportsRegisterPage(supabase, importsCursor),
    loadCatalogChangeSetsRegisterPage(supabase, changesCursor),
  ]);
  return (
    <MasterCatalogHistoryView
      gate={gate}
      importsPage={importsPage}
      changeSetsPage={changeSetsPage}
      importsCursor={importsCursor}
      changesCursor={changesCursor}
    />
  );
}

function cursor(createdAt?: string, id?: string) {
  return createdAt && id && UUID_PATTERN.test(id) && Number.isFinite(Date.parse(createdAt))
    ? { createdAt, id }
    : undefined;
}
