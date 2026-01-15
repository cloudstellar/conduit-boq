'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PriceListItem } from '@/lib/supabase';

interface ItemSearchProps {
  onSelect: (item: PriceListItem) => void;
  placeholder?: string;
}

interface CategoryInfo {
  category: string;
  count: number;
}

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

export default function ItemSearch({
  onSelect,
  placeholder = 'ค้นหารายการ...',
}: ItemSearchProps) {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PriceListItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('price_list')
        .select('category')
        .eq('is_active', true);

      if (data) {
        const categoryMap = new Map<string, number>();
        data.forEach(item => {
          const cat = item.category || 'ไม่ระบุ';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        const cats = Array.from(categoryMap.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => naturalSortCategory(a.category, b.category));
        setCategories(cats);
      }
    };
    loadCategories();
  }, [supabase]);

  // Search price list
  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2 && !selectedCategory) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setIsLoading(true);
      try {
        let queryBuilder = supabase
          .from('price_list')
          .select('*', { count: 'exact' })
          .eq('is_active', true);

        // Apply category filter
        if (selectedCategory) {
          queryBuilder = queryBuilder.eq('category', selectedCategory);
        }

        // Apply text search
        if (query.length >= 2) {
          queryBuilder = queryBuilder.or(`item_name.ilike.%${query}%,item_code.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder
          .order('item_code')
          .limit(100);

        if (error) throw error;
        setResults(data || []);
        setTotalCount(count || 0);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedCategory, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: PriceListItem) => {
    onSelect(item);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      {/* Category Filter */}
      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">-- เลือกหมวดหมู่ (ทั้งหมด) --</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category} ({cat.count} รายการ)
            </option>
          ))}
        </select>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ล้าง
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (query.length >= 2 || selectedCategory) && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategory ? 'พิมพ์เพื่อกรองรายการในหมวดนี้...' : placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results count hint */}
      {totalCount > 0 && (
        <div className="text-xs text-gray-500">
          แสดง {results.length} จาก {totalCount} รายการ
          {totalCount > 100 && (
            <span className="text-orange-600 ml-1">
              (พิมพ์เพิ่มเติมเพื่อกรองผลลัพธ์)
            </span>
          )}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
          {results.map((item, index) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-800">{item.item_name}</div>
              <div className="text-sm text-gray-500">
                {item.unit} | ค่าวัสดุ: {item.material_cost.toLocaleString()} |
                ค่าแรง: {item.labor_cost.toLocaleString()} |
                รวม: {item.unit_cost.toLocaleString()} บาท
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

