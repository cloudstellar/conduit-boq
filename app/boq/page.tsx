'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BOQ } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { can } from '@/lib/permissions';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Edit, Printer, Copy, Trash2, ArrowLeft } from 'lucide-react';

export default function BOQListPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [boqList, setBOQList] = useState<BOQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const canCreateBOQ = can(user, 'create', 'boq');

  useEffect(() => {
    const fetchBOQList = async () => {
      try {
        const { data, error } = await supabase
          .from('boq')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBOQList(data || []);
      } catch (err) {
        console.error('Error fetching BOQ list:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBOQList();
  }, [supabase]);

  const filteredList = boqList.filter(
    (boq) =>
      boq.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boq.estimator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (boq.route && boq.route.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      draft: 'ฉบับร่าง',
      pending: 'รอตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className={status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm('ต้องการคัดลอกใบประมาณราคานี้หรือไม่?')) return;

    try {
      // Fetch original BOQ
      const { data: originalBOQ, error: boqError } = await supabase
        .from('boq')
        .select('*')
        .eq('id', id)
        .single();

      if (boqError) throw boqError;

      // Get current user's info for ownership
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Build estimator name from user's profile
      const estimatorName = user
        ? `${user.title || ''}${user.first_name} ${user.last_name}`.trim() || user.email?.split('@')[0] || 'ไม่ระบุ'
        : originalBOQ.estimator_name;

      // Create new BOQ with copied data - owned by current user
      const { data: newBOQ, error: insertError } = await supabase
        .from('boq')
        .insert({
          // Use current user's name as estimator
          estimator_name: estimatorName,
          document_date: new Date().toISOString().split('T')[0],
          project_name: `${originalBOQ.project_name} (สำเนา)`,
          route: originalBOQ.route,
          construction_area: originalBOQ.construction_area,
          department: originalBOQ.department,
          total_material_cost: originalBOQ.total_material_cost,
          total_labor_cost: originalBOQ.total_labor_cost,
          total_cost: originalBOQ.total_cost,
          factor_f: originalBOQ.factor_f,
          total_with_factor_f: originalBOQ.total_with_factor_f,
          total_with_vat: originalBOQ.total_with_vat,
          status: 'draft',
          // Ownership: assign to current user
          created_by: authUser?.id || null,
          org_id: user?.org_id || null,
          department_id: user?.department_id || null,
          sector_id: user?.sector_id || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Fetch and copy routes
      const { data: routes, error: routesError } = await supabase
        .from('boq_routes')
        .select('*')
        .eq('boq_id', id)
        .order('route_order');

      if (routesError) throw routesError;

      if (routes && routes.length > 0) {
        // Create route mapping (old route id -> new route id)
        const routeMapping: Record<string, string> = {};

        for (const route of routes) {
          const { data: newRoute, error: routeInsertError } = await supabase
            .from('boq_routes')
            .insert({
              boq_id: newBOQ.id,
              route_order: route.route_order,
              route_name: route.route_name,
              route_description: route.route_description,
              construction_area: route.construction_area,
              total_material_cost: route.total_material_cost,
              total_labor_cost: route.total_labor_cost,
              total_cost: route.total_cost,
              cost_with_factor_f: route.cost_with_factor_f,
            })
            .select()
            .single();

          if (routeInsertError) throw routeInsertError;
          routeMapping[route.id] = newRoute.id;
        }

        // Fetch and copy items
        const { data: items, error: itemsError } = await supabase
          .from('boq_items')
          .select('*')
          .eq('boq_id', id)
          .order('item_order');

        if (itemsError) throw itemsError;

        if (items && items.length > 0) {
          const newItems = items.map(item => ({
            boq_id: newBOQ.id,
            route_id: item.route_id ? routeMapping[item.route_id] : null,
            item_order: item.item_order,
            price_list_id: item.price_list_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit,
            material_cost_per_unit: item.material_cost_per_unit,
            labor_cost_per_unit: item.labor_cost_per_unit,
            unit_cost: item.unit_cost,
            total_material_cost: item.total_material_cost,
            total_labor_cost: item.total_labor_cost,
            total_cost: item.total_cost,
            remarks: item.remarks,
          }));

          const { error: itemsInsertError } = await supabase
            .from('boq_items')
            .insert(newItems);

          if (itemsInsertError) throw itemsInsertError;
        }
      }

      // Refresh list
      const { data: updatedList } = await supabase
        .from('boq')
        .select('*')
        .order('created_at', { ascending: false });

      setBOQList(updatedList || []);
      alert('คัดลอกใบประมาณราคาเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error duplicating BOQ:', err);
      alert('เกิดข้อผิดพลาดในการคัดลอก');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบใบประมาณราคานี้หรือไม่?')) return;

    try {
      await supabase.from('boq_items').delete().eq('boq_id', id);
      await supabase.from('boq').delete().eq('id', id);
      setBOQList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting BOQ:', err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BOQPageHeader
        title="รายการใบประมาณราคา"
        subtitle={`ทั้งหมด ${boqList.length} รายการ`}
        backHref="/"
        backLabel="หน้าหลัก"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Access Banner */}
        <div className="mb-4">
          <BOQAccessBanner mode="list" />
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Search */}
          <Input
            type="text"
            placeholder="ค้นหาโครงการ, ผู้ประมาณราคา, เส้นทาง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96"
          />

          {/* Create button */}
          {canCreateBOQ && (
            <Link href="/boq/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                สร้างใหม่
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {filteredList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
              </CardContent>
            </Card>
          ) : (
            filteredList.map((boq) => (
              <Card key={boq.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex-1 line-clamp-2" title={boq.project_name}>{boq.project_name}</h3>
                    {getStatusBadge(boq.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">เส้นทาง: {boq.route || '-'}</p>
                  <p className="text-sm text-muted-foreground mb-1">ผู้ประมาณราคา: {boq.estimator_name}</p>
                  <p className="text-sm text-muted-foreground mb-2">วันที่: {formatDate(boq.document_date)}</p>
                  <p className="text-lg font-medium text-blue-600 mb-3">{formatNumber(boq.total_cost)} บาท</p>
                  <div className="flex gap-2 border-t pt-3">
                    <Link href={`/boq/${boq.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Button>
                    </Link>
                    <Link href={`/boq/${boq.id}/print`}>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        พิมพ์
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(boq.id)}>
                      <Copy className="h-4 w-4 mr-1" />
                      คัดลอก
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(boq.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">โครงการ</TableHead>
                <TableHead>เส้นทาง</TableHead>
                <TableHead>ผู้ประมาณราคา</TableHead>
                <TableHead className="text-right">ยอดรวม (บาท)</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-center">วันที่</TableHead>
                <TableHead className="text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((boq) => (
                  <TableRow key={boq.id}>
                    <TableCell className="font-medium max-w-[250px]">
                      <div className="line-clamp-2" title={boq.project_name}>
                        {boq.project_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[150px]">
                      <div className="line-clamp-1" title={boq.route || '-'}>
                        {boq.route || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[120px]">
                      <div className="line-clamp-1" title={boq.estimator_name}>
                        {boq.estimator_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600 whitespace-nowrap tabular-nums">{formatNumber(boq.total_cost)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(boq.status)}</TableCell>
                    <TableCell className="text-center text-muted-foreground whitespace-nowrap">{formatDate(boq.document_date)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Link href={`/boq/${boq.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Link href={`/boq/${boq.id}/print`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Printer className="h-4 w-4 text-gray-600" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(boq.id)}>
                          <Copy className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(boq.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
