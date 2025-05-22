'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SimpleTest() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching clients...');
    
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Data:', data);
        console.log('Error:', error);

        if (error) {
          throw error;
        }

        setClients(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Clients</h1>
      <div className="space-y-2">
        {clients.map((client) => (
          <div key={client.id} className="p-4 border rounded">
            <h2 className="font-semibold">{client.name}</h2>
            <p className="text-sm text-gray-600">{client.email}</p>
            <p className="text-xs text-gray-500">Status: {client.status}</p>
          </div>
        ))}
        {clients.length === 0 && <p>No clients found.</p>}
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify({
            env: {
              hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
            clientsCount: clients.length,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
