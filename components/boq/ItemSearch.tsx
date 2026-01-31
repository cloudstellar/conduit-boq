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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Loader2, Search } from 'lucide-react';

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

        if (selectedCategory) {
          queryBuilder = queryBuilder.eq('category', selectedCategory);
        }

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

  const handleSelect = (item: PriceListItem) => {
    onSelect(item);
    setQuery('');
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
    <div className="space-y-2">
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

      {/* Search Input with Popover Dropdown */}
      <Popover open={isOpen && results.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => (query.length >= 2 || selectedCategory) && results.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selectedCategory ? 'พิมพ์เพื่อกรองรายการในหมวดนี้...' : placeholder}
              className="pl-10 pr-10"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width]"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList className="max-h-[min(70vh,560px)]">
              <CommandEmpty>ไม่พบรายการ</CommandEmpty>
              <CommandGroup>
                {results.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className={`py-2 ${index === selectedIndex ? 'bg-accent' : ''}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm line-clamp-1">{item.item_name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {item.unit} | ค่าวัสดุ: {item.material_cost.toLocaleString()} | ค่าแรง: {item.labor_cost.toLocaleString()} | รวม: {item.unit_cost.toLocaleString()} บาท
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Results count hint */}
      {totalCount > 0 && (
        <div className="text-xs text-muted-foreground">
          แสดง {results.length} จาก {totalCount} รายการ
          {totalCount > 100 && (
            <span className="text-destructive ml-1">
              (พิมพ์เพิ่มเติมเพื่อกรองผลลัพธ์)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
