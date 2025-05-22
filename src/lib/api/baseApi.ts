import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

// Define the shape of our API error response
type ApiError = {
  status: number;
  data: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
};

// Helper type to unwrap the Supabase response type
type SupabaseResponse<T> = {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
};

type QueryOptions = {
  table: keyof Database['public']['Tables'];
  select?: string;
  eq?: [string, string | number | boolean];
  order?: {
    column: string;
    ascending?: boolean;
  };
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  id?: string;
  body?: any;
};

// Custom base query to handle Supabase operations
const supabaseBaseQuery = async (args: QueryOptions) => {
  const { table, select = '*', eq, order, method = 'GET', id, body } = args;

  try {
    // Handle different HTTP methods
    switch (method) {
      case 'GET': {
        let query = supabase.from(table).select(select);

        if (eq) {
          const [column, value] = eq;
          query = query.eq(column, value);
        }

        if (order) {
          query = query.order(order.column, { ascending: order.ascending ?? true });
        }

        const { data, error } = await query;

        if (error) {
          return { error: { status: 400, data: error } };
        }

        return { data };
      }

      case 'POST': {
        const { data, error } = await supabase
          .from(table)
          .insert(body)
          .select();

        if (error) {
          return { error: { status: 400, data: error } };
        }

        return { data: data?.[0] };
      }

      case 'PATCH': {
        if (!id) {
          return { error: { status: 400, data: { message: 'ID is required for PATCH operations' } } };
        }

        const { data, error } = await supabase
          .from(table)
          .update(body)
          .eq('id', id)
          .select();

        if (error) {
          return { error: { status: 400, data: error } };
        }

        return { data: data?.[0] };
      }

      case 'DELETE': {
        if (!id) {
          return { error: { status: 400, data: { message: 'ID is required for DELETE operations' } } };
        }

        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) {
          return { error: { status: 400, data: error } };
        }

        return { data: { id } };
      }

      default:
        return { error: { status: 400, data: { message: 'Unsupported HTTP method' } } };
    }
  } catch (error) {
    return {
      error: {
        status: 500,
        data: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      },
    };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: supabaseBaseQuery as any, // Type assertion needed due to RTK Query's expectations
  endpoints: () => ({}),
  tagTypes: ['Client', 'Task', 'Sale', 'Note', 'Sketch'],
});
