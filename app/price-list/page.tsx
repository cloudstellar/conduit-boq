'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PriceListItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const supabase = useMemo(() => createClient(), []);
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
  }, [supabase]);

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

  // Handle Select change with sentinel pattern
  const selectValue = selectedCategory || '__ALL__';
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === '__ALL__' ? '' : value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">บัญชีราคามาตรฐาน ปี 2568</h1>
          <p className="text-sm md:text-base text-muted-foreground">รายการราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน</p>
        </div>

        {/* Filters */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label>ค้นหา</Label>
                <Input
                  placeholder="พิมพ์ชื่อรายการหรือรหัส..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select value={selectValue} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทุกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">ทุกหมวดหมู่</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              แสดง {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} จาก {filteredItems.length} รายการ
              {filteredItems.length !== items.length && ` (ทั้งหมด ${items.length} รายการ)`}
            </p>
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {paginatedItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.item_code}</span>
                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{item.item_name}</p>
                <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                  <div>
                    <span className="text-muted-foreground">วัสดุ</span>
                    <p className="font-medium">{formatNumber(item.material_cost)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ค่าแรง</span>
                    <p className="font-medium">{formatNumber(item.labor_cost)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">รวม</span>
                    <p className="font-medium text-blue-600">{formatNumber(item.unit_cost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-center">หน่วย</TableHead>
                <TableHead className="text-right">ค่าวัสดุ</TableHead>
                <TableHead className="text-right">ค่าแรง</TableHead>
                <TableHead className="text-right">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.item_code}</TableCell>
                  <TableCell>
                    <div>{item.item_name}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.unit}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(item.material_cost)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(item.labor_cost)}</TableCell>
                  <TableCell className="text-right font-medium text-blue-600">{formatNumber(item.unit_cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-muted-foreground">
              หน้า {currentPage} จาก {totalPages}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
              </Button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">...</span>
                  )
                ))}
              </div>

              {/* Mobile Page Input */}
              <div className="flex sm:hidden items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-14 text-center"
                />
                <span className="text-xs text-muted-foreground">/ {totalPages}</span>
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">ถัดไป</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-4 md:mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm md:text-base flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
