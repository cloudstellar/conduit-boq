'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PriceListItem } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Loader2 } from 'lucide-react';

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
    // Don't clear results - let query control display
    // Keep open if category selected for multi-add
    if (!selectedCategory) {
      setIsOpen(false);
    }
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

  // Radix Select doesn't allow empty string value, use sentinel
  const selectValue = selectedCategory || '__ALL__';
  const handleSelectChange = (value: string) => {
    setSelectedCategory(value === '__ALL__' ? '' : value);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      {/* Category Filter */}
      <div className="flex gap-2">
        <Select value={selectValue} onValueChange={handleSelectChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="-- เลือกหมวดหมู่ (ทั้งหมด) --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">ทั้งหมด</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.category} value={cat.category}>
                {cat.category} ({cat.count} รายการ)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCategory && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedCategory('')}
          >
            ล้าง
          </Button>
        )}
      </div>


      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (query.length >= 2 || selectedCategory) && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategory ? 'พิมพ์เพื่อกรองรายการในหมวดนี้...' : placeholder}
          className="pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Results count hint */}
      {totalCount > 0 && (
        <div className="text-xs text-muted-foreground">
          แสดง {results.length} จาก {totalCount} รายการ
          {totalCount > 100 && (
            <span className="text-orange-600 ml-1">
              (พิมพ์เพิ่มเติมเพื่อกรองผลลัพธ์)
            </span>
          )}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <Command className="absolute z-50 w-full mt-1 border rounded-md shadow-lg bg-popover">
          <CommandList style={{ maxHeight: 'min(50vh, 420px)' }} className="overflow-y-auto">
            <CommandEmpty>ไม่พบรายการ</CommandEmpty>
            <CommandGroup>
              {results.map((item, index) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className={index === selectedIndex ? 'bg-accent' : ''}
                >
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{item.item_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.unit} | ค่าวัสดุ: {item.material_cost.toLocaleString()} |
                      ค่าแรง: {item.labor_cost.toLocaleString()} |
                      รวม: {item.unit_cost.toLocaleString()} บาท
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}
