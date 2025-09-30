import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { synthStore } from '../lib/synthStore';

export interface Task {
  id: string;
  title: string;
  note: string;
  is_completed: boolean;
  priority: 'Urgent' | 'Important' | 'Normal';
  reminder: string | null;
  category_id: string | null;
  user_id: string | null;
  shared_list_id: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export function useTasks(sharedListId?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCategories();
    fetchTasks();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('synth:')) {
        fetchTasks();
        fetchCategories();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user, sharedListId]);

  const fetchCategories = async () => {
    const data = synthStore.listCategories();
    setCategories(data as any);
  };

  const fetchTasks = async () => {
    setLoading(true);
    const data = synthStore.listTasks({ userId: user!.id, sharedListId: sharedListId });
    setTasks(data as any);
    setLoading(false);
  };

  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_by' | 'completed_at'>) => {
    const data = synthStore.addTask({
      ...task,
      user_id: sharedListId ? null : user!.id,
      shared_list_id: sharedListId || null,
      completed_by: null,
      completed_at: null,
    }) as any as Task;
    await fetchTasks();
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updateData: any = { ...updates };
    if (updates.is_completed !== undefined) {
      updateData.completed_by = updates.is_completed ? user?.id : null;
      updateData.completed_at = updates.is_completed ? new Date().toISOString() : null;
    }
    synthStore.updateTask(id, updateData);
    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    synthStore.deleteTask(id);
    await fetchTasks();
  };

  return {
    tasks,
    categories,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}