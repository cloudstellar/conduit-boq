import UserAccountMenu from '@/components/auth/UserAccountMenu';
import { Badge } from '@/components/ui/badge';
import type { CatalogAdminGate } from '@/lib/master-catalog/admin/readModel';

const GATE_LABELS: Record<CatalogAdminGate['state'], string> = {
  enabled: 'ระบบเปิดใช้งาน',
  disabled: 'เปิดดูอย่างเดียว',
  forbidden: 'ไม่มีสิทธิ์',
  unauthenticated: 'ยังไม่เข้าสู่ระบบ',
};

const GATE_VARIANTS: Record<
  CatalogAdminGate['state'],
  'default' | 'destructive' | 'outline'
> = {
  enabled: 'default',
  disabled: 'outline',
  forbidden: 'destructive',
  unauthenticated: 'outline',
};

export function MasterCatalogHeaderUtilities({
  gateState,
}: {
  gateState?: CatalogAdminGate['state'];
}) {
  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      {appEnvironment === 'local' ? (
        <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-900">
          ระบบทดสอบ (Local)
        </Badge>
      ) : null}
      {gateState ? (
        <Badge variant={GATE_VARIANTS[gateState]}>
          {GATE_LABELS[gateState]}
        </Badge>
      ) : null}
      <UserAccountMenu />
    </div>
  );
}
