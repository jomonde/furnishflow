'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client, ClientStatus } from '@/types';
import { useSupabase } from '@/providers/supabase-provider';

export interface UseClientsResult {
  clients: Client[] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Promise<Client | null>;
  getClientsByStatus: (status: ClientStatus) => Client[];
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase } = useSupabase();

  const fetchClients = useCallback(async () => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      setError(error);
      setClients(null);
      setLoading(false);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match our Client type
      const transformedData = (data || []).map(client => ({
        ...client,
        // Map legacy fields to new structure
        stylePreferences: client.style_preferences || client.stylePreferences || [],
        roomTypes: client.room_types || client.roomTypes || [],
        lastContactDate: client.last_contact_date || client.lastContactDate,
        nextFollowUpDate: client.next_follow_up_date || client.nextFollowUpDate,
        // Ensure we always have an address object
        address: client.address || {}
      }));

      setClients(transformedData);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
      setClients(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      
      const clientToCreate = {
        ...clientData,
        // Ensure we're using the correct field names for the database
        style_preferences: clientData.stylePreferences,
        room_types: clientData.roomTypes,
        last_contact_date: clientData.lastContactDate,
        next_follow_up_date: clientData.nextFollowUpDate,
        // Remove the camelCase versions to avoid confusion
        stylePreferences: undefined,
        roomTypes: undefined,
        lastContactDate: undefined,
        nextFollowUpDate: undefined
      };

      const { data, error: createError } = await supabase
        .from('clients')
        .insert(clientToCreate)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Refresh the clients list
      await fetchClients();
      return data;
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err instanceof Error ? err : new Error('Failed to create client'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchClients]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      
      // Transform updates to use database field names
      const updatesToApply = {
        ...updates,
        // Map any fields that need renaming
        style_preferences: updates.stylePreferences,
        room_types: updates.roomTypes,
        last_contact_date: updates.lastContactDate,
        next_follow_up_date: updates.nextFollowUpDate,
        // Remove camelCase versions to avoid confusion
        stylePreferences: undefined,
        roomTypes: undefined,
        lastContactDate: undefined,
        nextFollowUpDate: undefined,
        // Always update the updated_at timestamp
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('clients')
        .update(updatesToApply)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Refresh the clients list
      await fetchClients();
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err instanceof Error ? err : new Error('Failed to update client'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchClients]);

  const deleteClient = useCallback(async (id: string) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the clients list
      await fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete client'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchClients]);

  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      setError(error);
      throw error;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) return null;

      // Transform the data to match our Client type
      return {
        ...data,
        stylePreferences: data.style_preferences || data.stylePreferences || [],
        roomTypes: data.room_types || data.roomTypes || [],
        lastContactDate: data.last_contact_date || data.lastContactDate,
        nextFollowUpDate: data.next_follow_up_date || data.nextFollowUpDate,
        address: data.address || {}
      };
    } catch (err) {
      console.error('Error fetching client:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch client'));
      throw err;
    }
  }, [supabase]);

  const getClientsByStatus = useCallback((status: ClientStatus): Client[] => {
    if (!clients) return [];
    return clients.filter(client => client.status === status);
  }, [clients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refresh: fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    getClientsByStatus
  };
}
