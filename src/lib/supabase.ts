import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Define the shape of our database for better type safety
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          status: 'active' | 'inactive' | 'lead' | 'project';
          last_contact?: string;
          // Add other client fields as needed
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>>;
      };
      sales: {
        Row: {
          id: string;
          created_at: string;
          updated_at?: string;
          total: number;
          status: 'pending' | 'completed' | 'cancelled';
          client_id?: string;
          // Add other sale fields as needed
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>>;
      };
      // Add other tables as needed
    };
  };
};

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient<Database> | null = (() => {
  if (!isBrowser) return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
})();

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw error;
};

// Client operations
export const getClients = async () => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return [];
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    handleSupabaseError(error);
    return [];
  }
  return data || [];
};

export const getClientById = async (id: string) => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return null;
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    handleSupabaseError(error);
    return null;
  }
  return data || null;
};

export const createClient = async (clientData: Database['public']['Tables']['clients']['Insert']) => {
  if (!supabase) {
    console.error('Supabase client is not available');
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return data;
};

export const updateClient = async (
  id: string, 
  updates: Database['public']['Tables']['clients']['Update']
) => {
  if (!supabase) {
    console.error('Supabase client is not available');
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return data;
};

// Add more database operations as needed

export default supabase;
