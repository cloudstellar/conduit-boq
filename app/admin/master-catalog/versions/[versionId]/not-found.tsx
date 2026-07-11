import Link from 'next/link';
import { List, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MasterCatalogRouteStateShell } from '../../_components/MasterCatalogRouteStateShell';

export default function MasterCatalogVersionNotFound() {
  return (
    <MasterCatalogRouteStateShell>
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>ไม่พบเวอร์ชันที่เลือก</AlertTitle>
        <AlertDescription>
          <div className="grid gap-3">
            <p>เวอร์ชันอาจไม่มีอยู่ หรือบัญชีนี้ไม่มีสิทธิ์อ่านข้อมูลดังกล่าว</p>
            <div>
              <Button variant="outline" asChild>
                <Link href="/admin/master-catalog/versions">
                  <List data-icon="inline-start" />
                  กลับไปรายการเวอร์ชัน
                </Link>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </MasterCatalogRouteStateShell>
  );
}
