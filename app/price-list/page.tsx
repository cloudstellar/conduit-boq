'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, PriceListItem } from '@/lib/supabase';

const ITEMS_PER_PAGE = 20;

// Natural sort function for category strings like "1.1.", "2.1.", "10.1."
const naturalSortCategory = (a: string, b: string): number => {
  // Extract leading numbers (e.g., "1.1." from "1.1.   งานวางท่อ...")
  const getNumbers = (str: string): number[] => {
    const match = str.match(/^([\d.]+)/);
    if (!match) return [999];
    return match[1].split('.').filter(s => s).map(s => parseInt(s, 10) || 0);
  };

  const numsA = getNumbers(a);
  const numsB = getNumbers(b);

  for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
    const numA = numsA[i] ?? 0;
    const numB = numsB[i] ?? 0;
    if (numA !== numB) return numA - numB;
  }
  return a.localeCompare(b, 'th');
};

export default function PriceListPage() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all active items
        const { data: itemsData } = await supabase
          .from('price_list')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('item_code');

        if (itemsData) {
          setItems(itemsData);
          // Extract unique categories and sort naturally
          const uniqueCategories = [...new Set(itemsData.map((i) => i.category).filter(Boolean))] as string[];
          uniqueCategories.sort(naturalSortCategory);
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const formatNumber = (num: number) =>
    num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');

      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">บัญชีราคามาตรฐาน ปี 2568</h1>
          <p className="text-sm md:text-base text-gray-600">รายการราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อรายการหรือรหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 md:px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm md:text-base appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22%236b7280%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%2f%3e%3c%2fsvg%3e')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs md:text-sm text-gray-500">
            แสดง {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} จาก {filteredItems.length} รายการ
            {filteredItems.length !== items.length && ` (ทั้งหมด ${items.length} รายการ)`}
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {paginatedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-500">{item.item_code}</span>
                <span className="text-xs text-gray-500">{item.unit}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{item.item_name}</p>
              <p className="text-xs text-gray-500 mb-2">{item.category}</p>
              <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                <div>
                  <span className="text-gray-500">วัสดุ</span>
                  <p className="font-medium">{formatNumber(item.material_cost)}</p>
                </div>
                <div>
                  <span className="text-gray-500">ค่าแรง</span>
                  <p className="font-medium">{formatNumber(item.labor_cost)}</p>
                </div>
                <div>
                  <span className="text-gray-500">รวม</span>
                  <p className="font-medium text-blue-600">{formatNumber(item.unit_cost)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{item.item_code}</td>
                    <td className="px-3 py-2 text-gray-900">
                      <div>{item.item_name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-500">
              หน้า {currentPage} จาก {totalPages}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 md:py-2 text-xs md:text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500">...</span>
                  )
                ))}
              </div>

              {/* Mobile Page Input */}
              <div className="flex sm:hidden items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-14 px-2 py-1 text-center text-sm border border-gray-300 rounded-md"
                />
                <span className="text-xs text-gray-500">/ {totalPages}</span>
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-4 md:mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base">← กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}

