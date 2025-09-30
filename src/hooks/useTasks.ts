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

export function categoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('travail')) return '💼';
  if (n.includes('étude') || n.includes('etude') || n.includes('study')) return '📚';
  if (n.includes('maison') || n.includes('home')) return '🏠';
  if (n.includes('sport')) return '🏃‍♀️';
  if (n.includes('vie') || n.includes('personnelle') || n.includes('perso')) return '🌟';
  return '✨';
}

export interface CategoryTheme {
  name: string;
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
}

export function getCategoryTheme(categoryName: string): CategoryTheme {
  const name = categoryName.toLowerCase();
  
  if (name.includes('travail')) {
    return {
      name: 'Travail',
      emoji: '💼',
      primary: '#3B82F6', // blue-500
      secondary: '#DBEAFE', // blue-100
      accent: '#1E40AF', // blue-800
      background: 'from-blue-50 to-indigo-50',
      text: 'text-blue-800',
      gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100'
    };
  }
  
  if (name.includes('étude') || name.includes('etude') || name.includes('study')) {
    return {
      name: 'Étude',
      emoji: '📚',
      primary: '#8B5CF6', // violet-500
      secondary: '#EDE9FE', // violet-100
      accent: '#5B21B6', // violet-800
      background: 'from-purple-50 to-violet-50',
      text: 'text-purple-800',
      gradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100'
    };
  }
  
  if (name.includes('maison') || name.includes('home')) {
    return {
      name: 'Maison',
      emoji: '🏠',
      primary: '#10B981', // emerald-500
      secondary: '#D1FAE5', // emerald-100
      accent: '#065F46', // emerald-800
      background: 'from-emerald-50 to-green-50',
      text: 'text-emerald-800',
      gradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100'
    };
  }
  
  if (name.includes('sport')) {
    return {
      name: 'Sport',
      emoji: '🏃‍♀️',
      primary: '#F59E0B', // amber-500
      secondary: '#FEF3C7', // amber-100
      accent: '#92400E', // amber-800
      background: 'from-amber-50 to-orange-50',
      text: 'text-amber-800',
      gradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100'
    };
  }
  
  if (name.includes('vie') || name.includes('personnelle') || name.includes('perso')) {
    return {
      name: 'Vie personnelle',
      emoji: '🌟',
      primary: '#EC4899', // pink-500
      secondary: '#FCE7F3', // pink-100
      accent: '#BE185D', // pink-800
      background: 'from-pink-50 to-rose-50',
      text: 'text-pink-800',
      gradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100'
    };
  }
  
  // Default theme
  return {
    name: 'Général',
    emoji: '✨',
    primary: '#6B7280', // gray-500
    secondary: '#F3F4F6', // gray-100
    accent: '#374151', // gray-700
    background: 'from-gray-50 to-slate-50',
    text: 'text-gray-800',
    gradient: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100'
  };
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