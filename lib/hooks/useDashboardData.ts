'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BOQ } from '@/lib/supabase';
import { UserProfileWithOrg } from '@/lib/types/auth';
import { PostgrestError } from '@supabase/supabase-js';
import { getActiveDefaultPriceListVersionId } from '@/lib/catalog/defaultVersion';

export interface DashboardStats {
  myBoqsCount: number;
  myTotalValue: number;
  myDraftCount: number;
  myPendingCount: number;
  myApprovedCount: number;
  priceItemsCount: number;
  priceCategoriesCount: number;
  // Team stats (displayed for managers/admins only)
  teamBoqsCount?: number;
  teamTotalValue?: number;
}

interface TeamBOQData {
  id: string;
  total_cost: number;
  total_with_factor_f: number;
  total_with_vat: number;
  status: string;
}

export function useDashboardData(user: UserProfileWithOrg | null) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBoqs, setRecentBoqs] = useState<Partial<BOQ>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const refreshData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const defaultVersionPromise = getActiveDefaultPriceListVersionId(supabase);

      // 3. Fetch BOQs created by this user
      // We retrieve only the exact columns required for layout metrics and listing
      // Sorted by updated_at to ensure truly recently modified items come first
      const myBoqsPromise = supabase
        .from('boq')
        .select('id, project_name, route, total_cost, total_with_factor_f, total_with_vat, status, document_date, created_at, updated_at, created_by')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

      // 4. Fetch unit/department summary if manager or admin (role-based separation)
      const isManagerOrAdmin = ['admin', 'dept_manager', 'sector_manager'].includes(user.role);
      let teamBoqsPromise: Promise<{ data: TeamBOQData[] | null; error: PostgrestError | null }> =
        Promise.resolve({ data: null, error: null });

      if (isManagerOrAdmin) {
        let query = supabase
          .from('boq')
          .select('id, total_cost, total_with_factor_f, total_with_vat, status');

        if (user.role === 'dept_manager' && user.department_id) {
          query = query.eq('department_id', user.department_id);
        } else if (user.role === 'sector_manager' && user.sector_id) {
          query = query.eq('sector_id', user.sector_id);
        } // admin has visibility over all departments

        teamBoqsPromise = query as unknown as Promise<{ data: TeamBOQData[] | null; error: PostgrestError | null }>;
      }

      const defaultVersionId = await defaultVersionPromise;

      // Fetch only the active default catalog. BOQ queries above are already in flight.
      const priceItemsPromise = supabase
        .from('price_list')
        .select('id', { count: 'exact', head: true })
        .eq('version_id', defaultVersionId)
        .eq('is_active', true);

      const categoriesPromise = supabase
        .from('price_list')
        .select('category')
        .eq('version_id', defaultVersionId)
        .eq('is_active', true);

      // Execute all queries in parallel to eliminate waterfall delays (async-parallel)
      const [priceItemsRes, categoriesRes, myBoqsRes, teamBoqsRes] = await Promise.all([
        priceItemsPromise,
        categoriesPromise,
        myBoqsPromise,
        teamBoqsPromise
      ]);

      // Check for errors on critical requests
      if (priceItemsRes.error) throw priceItemsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (myBoqsRes.error) throw myBoqsRes.error;

      // Extract price standard active items count, falling back to 682 if empty
      const priceItemsCount = priceItemsRes.count !== null ? priceItemsRes.count : 682;

      // Extract standard categories count dynamically
      let priceCategoriesCount = 52;
      if (categoriesRes.data) {
        const uniqueCategories = new Set(
          categoriesRes.data
            .map((item) => item.category)
            .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '')
        );
        priceCategoriesCount = uniqueCategories.size > 0 ? uniqueCategories.size : 52;
      }

      // Process My BOQs metrics
      const myBoqs = myBoqsRes.data || [];
      const myBoqsCount = myBoqs.length;

      let myTotalValue = 0;
      let myDraftCount = 0;
      let myPendingCount = 0;
      let myApprovedCount = 0;

      myBoqs.forEach((boq) => {
        // Value incorporates VAT if available, falling back to Factor F, then standard cost (P1 Bug Fix)
        myTotalValue += boq.total_with_vat || boq.total_with_factor_f || boq.total_cost || 0;

        // Group statuses into high-level categories
        if (boq.status === 'draft') {
          myDraftCount++;
        } else if (
          boq.status === 'pending' ||
          (boq.status as string) === 'pending_review' ||
          (boq.status as string) === 'pending_approval' ||
          (boq.status as string) === 'submitted'
        ) {
          myPendingCount++;
        } else if (boq.status === 'approved') {
          myApprovedCount++;
        }
      });

      // Slice the first 5 records as the most recent work (they are already sorted by updated_at DESC)
      const recent = myBoqs.slice(0, 5);

      // Process Team/Department Metrics if authorized
      let teamBoqsCount = 0;
      let teamTotalValue = 0;

      if (isManagerOrAdmin && teamBoqsRes.data) {
        const teamBoqs = teamBoqsRes.data;
        teamBoqsCount = teamBoqs.length;
        teamTotalValue = teamBoqs.reduce(
          (sum: number, item: TeamBOQData) => sum + (item.total_with_vat || item.total_with_factor_f || item.total_cost || 0),
          0
        );
      }

      setStats({
        myBoqsCount,
        myTotalValue,
        myDraftCount,
        myPendingCount,
        myApprovedCount,
        priceItemsCount,
        priceCategoriesCount,
        ...(isManagerOrAdmin ? { teamBoqsCount, teamTotalValue } : {})
      });

      setRecentBoqs(recent as Partial<BOQ>[]);

    } catch (err: unknown) {
      console.error('Error fetching dashboard stats from database:', err);
      const errMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลจากระบบ';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { stats, recentBoqs, isLoading, error, refreshData };
}
