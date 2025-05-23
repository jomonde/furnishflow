'use client';

import { useCallback, useState } from 'react';
import { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  client_id?: string;
  created_at: string;
  updated_at?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
}

interface UseTasksResult {
  tasks: Task[] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export function useTasks(clientId?: string): UseTasksResult {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      console.error(error);
      setError(error);
      setTasks(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      setTasks(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      console.error(error);
      throw error;
    }

    try {
      const { data, error: createError } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (createError) throw createError;
      
      setTasks(prev => prev ? [...prev, data] : [data]);
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      console.error(error);
      throw error;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setTasks(prev => 
        prev ? prev.map(t => t.id === id ? { ...t, ...data } : t) : null
      );
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    if (!supabase) {
      const error = new Error('Supabase client is not available');
      console.error(error);
      throw error;
    }

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setTasks(prev => prev ? prev.filter(t => t.id !== id) : null);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
