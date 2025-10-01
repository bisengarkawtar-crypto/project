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
  sticker: string;
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
  imageUrl?: string;
}

export function getCategoryTheme(categoryName: string): CategoryTheme {
  const name = categoryName.toLowerCase();

  if (name.includes('travail')) {
    return {
      name: 'Travail',
      emoji: '💼',
      primary: '#3B82F6',
      secondary: '#DBEAFE',
      accent: '#1E40AF',
      background: 'from-blue-50 via-sky-50 to-indigo-50',
      text: 'text-blue-800',
      gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
      imageUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920'
    };
  }
  
  if (name.includes('étude') || name.includes('etude') || name.includes('study')) {
    return {
      name: 'Études',
      emoji: '📚',
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#5B21B6',
      background: 'from-purple-50 via-violet-50 to-fuchsia-50',
      text: 'text-purple-800',
      gradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1920'
    };
  }
  
  if (name.includes('maison') || name.includes('home') || name.includes('personnel')) {
    return {
      name: 'Personnel',
      emoji: '🏠',
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#065F46',
      background: 'from-emerald-50 via-green-50 to-teal-50',
      text: 'text-emerald-800',
      gradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
      imageUrl: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920'
    };
  }
  
  if (name.includes('sport') || name.includes('santé') || name.includes('sante')) {
    return {
      name: 'Sport & Santé',
      emoji: '🏃‍♀️',
      primary: '#EF4444',
      secondary: '#FEE2E2',
      accent: '#991B1B',
      background: 'from-red-50 via-orange-50 to-amber-50',
      text: 'text-red-800',
      gradient: 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-100',
      imageUrl: 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&cs=tinysrgb&w=1920'
    };
  }
  
  if (name.includes('courses') || name.includes('shopping')) {
    return {
      name: 'Courses',
      emoji: '🛒',
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#92400E',
      background: 'from-amber-50 via-yellow-50 to-orange-50',
      text: 'text-amber-800',
      gradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100',
      imageUrl: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1920'
    };
  }
  
  return {
    name: 'Général',
    emoji: '✨',
    primary: '#6366F1',
    secondary: '#E0E7FF',
    accent: '#4338CA',
    background: 'from-slate-50 via-gray-50 to-zinc-50',
    text: 'text-slate-800',
    gradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100',
    imageUrl: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=1920'
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