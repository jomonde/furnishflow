import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { PostgrestError } from '@supabase/supabase-js';
import { Client } from '@/types';

type QueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const useClients = (): QueryResult<Client[]> => {
  const { supabase } = useSupabase();
  const [data, setData] = useState<Client[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    if (!supabase) {
      setError(new Error('Supabase client is not available') as PostgrestError);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: clients, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setData(clients);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err as PostgrestError);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []); // Empty dependency array means this effect runs once on mount

  return {
    data,
    error,
    isLoading,
    refetch: fetchClients,
  };
};

export const useClient = (id: string): QueryResult<Client> => {
  const { supabase } = useSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }
  
  const [data, setData] = useState<Client | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setData(client);
      setError(null);
    } catch (err) {
      console.error('Error fetching client:', err);
      setError(err as PostgrestError);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchClient,
  };
};
