'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, PriceListItem } from '@/lib/supabase';

export default function PriceListPage() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all active items
        const { data: itemsData } = await supabase
          .from('price_list')
          .select('*')
          .eq('is_active', true)
          .order('category_code')
          .order('item_order');

        if (itemsData) {
          setItems(itemsData);
          // Extract unique categories
          const uniqueCategories = [...new Set(itemsData.map((i) => i.category_name))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">บัญชีราคามาตรฐาน ปี 2568</h1>
          <p className="text-gray-600">รายการราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อรายการหรือรหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">แสดง {filteredItems.length} จาก {items.length} รายการ</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">รหัส</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-700">รายการ</th>
                  <th className="px-3 py-3 text-center font-medium text-gray-700">หน่วย</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-700">ค่าวัสดุ</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-700">ค่าแรง</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-700">รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{item.item_code}</td>
                    <td className="px-3 py-2 text-gray-900">
                      <div>{item.item_name}</div>
                      <div className="text-xs text-gray-500">{item.category_name}</div>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">{item.unit}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatNumber(item.material_cost)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatNumber(item.labor_cost)}</td>
                    <td className="px-3 py-2 text-right font-medium text-blue-600">{formatNumber(item.unit_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}

