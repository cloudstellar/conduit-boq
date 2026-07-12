import Link from 'next/link';
import { List, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MasterCatalogRouteStateShell } from '../../../../_components/MasterCatalogRouteStateShell';

export default function MasterCatalogItemNotFound() {
  return (
    <MasterCatalogRouteStateShell>
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>ไม่พบรายการที่เลือกในเวอร์ชันนี้</AlertTitle>
        <AlertDescription>
          <div className="grid gap-3">
            <p>รายการอาจถูกถอนออกจากฉบับร่าง ไม่มีอยู่ในเวอร์ชันนี้ หรือบัญชีนี้ไม่มีสิทธิ์อ่านข้อมูล</p>
            <div>
              <Button variant="outline" asChild>
                <Link href="/admin/master-catalog/versions">
                  <List data-icon="inline-start" />
                  กลับไปทะเบียนเวอร์ชัน
                </Link>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </MasterCatalogRouteStateShell>
  );
}
