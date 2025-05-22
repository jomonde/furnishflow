'use client';

import { supabase as client } from '@/lib/supabase';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null;
  initialized: boolean;
  error?: Error;
};

export const Context = createContext<SupabaseContext | undefined>(undefined);

export const useSupabase = (): SupabaseContext => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [supabase] = useState(() => client);

  useEffect(() => {
    if (!supabase) {
      setError(new Error('Supabase client failed to initialize'));
      setInitialized(true);
      return;
    }

    // Debug logging
    console.group('Supabase Provider');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase initialized:', !!supabase);
    
    // Test connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection test:', { data, error });
        if (error) {
          setError(error);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setError(error instanceof Error ? error : new Error('Failed to connect to Supabase'));
      } finally {
        setInitialized(true);
        console.groupEnd();
      }
    };
    
    testConnection();
  }, [supabase]);

  const value = {
    supabase,
    initialized,
    error,
  };

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};;
