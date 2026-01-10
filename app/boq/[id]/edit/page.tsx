'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, BOQ, PriceListItem } from '@/lib/supabase';
import ProjectInfoForm from '@/components/boq/ProjectInfoForm';
import LineItemsTable, { LineItem } from '@/components/boq/LineItemsTable';
import TotalsSummary from '@/components/boq/TotalsSummary';
import { ProjectInfo } from '@/app/boq/create/page';

export default function EditBOQPage() {
  const params = useParams();
  const router = useRouter();
  const boqId = params.id as string;

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    estimator_name: '',
    document_date: new Date().toISOString().split('T')[0],
    project_name: '',
    route: '',
    construction_area: '',
    department: '',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totals = lineItems.reduce(
    (acc, item) => ({
      material: acc.material + item.total_material_cost,
      labor: acc.labor + item.total_labor_cost,
      total: acc.total + item.total_cost,
    }),
    { material: 0, labor: 0, total: 0 }
  );

  // Fetch BOQ data
  useEffect(() => {
    const fetchBOQ = async () => {
      try {
        const { data: boq, error: boqError } = await supabase
          .from('boq')
          .select('*')
          .eq('id', boqId)
          .single();

        if (boqError) throw boqError;

        setProjectInfo({
          estimator_name: boq.estimator_name,
          document_date: boq.document_date,
          project_name: boq.project_name,
          route: boq.route || '',
          construction_area: boq.construction_area || '',
          department: boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)',
        });

        // Fetch line items
        const { data: items, error: itemsError } = await supabase
          .from('boq_items')
          .select('*')
          .eq('boq_id', boqId)
          .order('item_order');

        if (itemsError) throw itemsError;
        setLineItems(items || []);
      } catch (err) {
        console.error('Error fetching BOQ:', err);
        setError('ไม่พบข้อมูล BOQ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBOQ();
  }, [boqId]);

  const handleProjectInfoChange = (field: keyof ProjectInfo, value: string) => {
    setProjectInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (priceItem: PriceListItem) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      item_order: lineItems.length + 1,
      price_list_id: priceItem.id,
      item_name: priceItem.item_name,
      quantity: 0,
      unit: priceItem.unit,
      material_cost_per_unit: Number(priceItem.material_cost),
      labor_cost_per_unit: Number(priceItem.labor_cost),
      unit_cost: Number(priceItem.unit_cost),
      total_material_cost: 0,
      total_labor_cost: 0,
      total_cost: 0,
      remarks: priceItem.remarks,
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          quantity,
          total_material_cost: quantity * item.material_cost_per_unit,
          total_labor_cost: quantity * item.labor_cost_per_unit,
          total_cost: quantity * item.unit_cost,
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Update BOQ header
      const { error: boqError } = await supabase
        .from('boq')
        .update({
          estimator_name: projectInfo.estimator_name,
          document_date: projectInfo.document_date,
          project_name: projectInfo.project_name,
          route: projectInfo.route || null,
          construction_area: projectInfo.construction_area || null,
          department: projectInfo.department || null,
          total_material_cost: totals.material,
          total_labor_cost: totals.labor,
          total_cost: totals.total,
        })
        .eq('id', boqId);

      if (boqError) throw boqError;

      // Delete existing items and insert new ones
      await supabase.from('boq_items').delete().eq('boq_id', boqId);

      if (lineItems.length > 0) {
        const itemsToInsert = lineItems.map((item, index) => ({
          boq_id: boqId,
          item_order: index + 1,
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

        const { error: insertError } = await supabase.from('boq_items').insert(itemsToInsert);
        if (insertError) throw insertError;
      }

      alert('บันทึกสำเร็จ!');
    } catch (err) {
      console.error('Error saving BOQ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !projectInfo.project_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              แก้ไขใบประมาณราคา (BOQ)
            </h1>
            <button
              onClick={() => router.push(`/boq/${boqId}/print`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              พิมพ์
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Section 1: Project Info */}
          <ProjectInfoForm
            projectInfo={projectInfo}
            onChange={handleProjectInfoChange}
          />

          <hr className="my-8" />

          {/* Section 2: Line Items */}
          <LineItemsTable
            items={lineItems}
            onAddItem={handleAddItem}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          {/* Totals Summary */}
          <TotalsSummary
            totalMaterialCost={totals.material}
            totalLaborCost={totals.labor}
            totalCost={totals.total}
            itemCount={lineItems.length}
          />

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              กลับหน้าหลัก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

