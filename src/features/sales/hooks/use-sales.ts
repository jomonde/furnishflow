'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Database } from '@/types/supabase';

export type SaleStatus = Database['public']['Tables']['sales']['Row']['status'];

export type SaleItem = Database['public']['Tables']['sale_items']['Row'];

export type Sale = Database['public']['Tables']['sales']['Row'] & {
  items?: SaleItem[];
  clients?: {
    name: string;
    email?: string;
    phone?: string;
  } | null;
  // Use amount to match the database schema
  amount: number;
  // Add missing fields that exist in the database
  expected_close_date?: string | null;
  probability?: number;
};

interface UseSalesResult {
  sales: Sale[] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createSale: (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'items'>) => Promise<Sale>;
  updateSale: (id: string, updates: Partial<Omit<Sale, 'id' | 'created_at' | 'items'>>) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  getSalesTotal: (period?: 'day' | 'week' | 'month' | 'year') => Promise<number>;
}

export function useSales(clientId?: string): UseSalesResult {
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { supabase, initialized, error: supabaseError } = useSupabase();

  const fetchSales = useCallback(async () => {
    if (!supabase) {
      setError(new Error('Supabase client is not available'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items(*),
          clients:client_id(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setSales(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sales'));
    } finally {
      setLoading(false);
    }
  }, [supabase, clientId]);

  useEffect(() => {
    if (supabaseError) {
      setError(supabaseError);
    }
  }, [supabaseError]);

  const createSale = useCallback(async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'items'>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: insertError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSales(prevSales => prevSales ? [...prevSales, data] : [data]);
      return data as Sale;
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err instanceof Error ? err : new Error('Failed to create sale'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateSale = useCallback(async (id: string, updates: Partial<Omit<Sale, 'id' | 'created_at' | 'items'>>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: updateError } = await supabase
        .from('sales')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setSales(prevSales => 
        prevSales ? prevSales.map(sale => sale.id === id ? data as Sale : sale) : []
      );
      
      return data as Sale;
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err instanceof Error ? err : new Error('Failed to update sale'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteSale = useCallback(async (id: string) => {
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setSales(prevSales => prevSales ? prevSales.filter(sale => sale.id !== id) : []);
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete sale'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getSalesTotal = useCallback(async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<number> => {
    if (!supabase) {
      console.error('Supabase client is not available');
      setError(new Error('Supabase client is not available'));
      return 0;
    }

    try {
      let query = supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed');

      if (period) {
        const now = new Date();
        let startDate = new Date();
        
        switch (period) {
          case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching sales:', fetchError);
        throw fetchError;
      }

      if (!data) return 0;
      
      return data.reduce((sum, sale) => sum + (sale.total || 0), 0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate sales total');
      console.error('Error calculating sales total:', error);
      setError(error);
      return 0;
    }
  }, [supabase]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const refresh = useCallback(async () => {
    await fetchSales();
  }, [fetchSales]);

  return useMemo(() => ({
    sales,
    loading,
    error,
    refresh,
    createSale,
    updateSale,
    deleteSale,
    getSalesTotal,
  }), [sales, loading, error, refresh, createSale, updateSale, deleteSale, getSalesTotal]);
}
