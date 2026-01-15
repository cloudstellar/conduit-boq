'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BOQ } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { can } from '@/lib/permissions';
import BOQPageHeader from '@/components/boq/BOQPageHeader';
import BOQAccessBanner from '@/components/boq/BOQAccessBanner';

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
    const styles: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: 'ฉบับร่าง',
      pending: 'รอตรวจสอบ',
      approved: 'อนุมัติ',
      rejected: 'ไม่อนุมัติ',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
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

      // Create new BOQ with copied data
      const { data: newBOQ, error: insertError } = await supabase
        .from('boq')
        .insert({
          estimator_name: originalBOQ.estimator_name,
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
          <input
            type="text"
            placeholder="ค้นหาโครงการ, ผู้ประมาณราคา, เส้นทาง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
          />

          {/* Create button */}
          {canCreateBOQ && (
            <Link
              href="/boq/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              สร้างใหม่
            </Link>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
            </div>
          ) : (
            filteredList.map((boq) => (
              <div key={boq.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 flex-1">{boq.project_name}</h3>
                  {getStatusBadge(boq.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">เส้นทาง: {boq.route || '-'}</p>
                <p className="text-sm text-gray-600 mb-1">ผู้ประมาณราคา: {boq.estimator_name}</p>
                <p className="text-sm text-gray-600 mb-2">วันที่: {formatDate(boq.document_date)}</p>
                <p className="text-lg font-medium text-blue-600 mb-3">{formatNumber(boq.total_cost)} บาท</p>
                <div className="flex gap-4 border-t pt-3">
                  <Link href={`/boq/${boq.id}/edit`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </Link>
                  <Link href={`/boq/${boq.id}/print`} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    พิมพ์
                  </Link>
                  <button onClick={() => handleDuplicate(boq.id)} className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    คัดลอก
                  </button>
                  <button onClick={() => handleDelete(boq.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">โครงการ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">เส้นทาง</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ผู้ประมาณราคา</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ยอดรวม (บาท)</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">สถานะ</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">วันที่</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีใบประมาณราคา'}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((boq) => (
                    <tr key={boq.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{boq.project_name}</td>
                      <td className="px-4 py-3 text-gray-600">{boq.route || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{boq.estimator_name}</td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">{formatNumber(boq.total_cost)}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(boq.status)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{formatDate(boq.document_date)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/boq/${boq.id}/edit`} className="text-blue-600 hover:text-blue-800" title="แก้ไข">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <Link href={`/boq/${boq.id}/print`} className="text-gray-600 hover:text-gray-800" title="พิมพ์">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </Link>
                          <button onClick={() => handleDuplicate(boq.id)} className="text-green-600 hover:text-green-800" title="คัดลอก">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(boq.id)} className="text-red-600 hover:text-red-800" title="ลบ">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base">← กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}

