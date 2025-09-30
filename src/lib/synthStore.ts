// Synthetic in-browser data store powered by localStorage
// Provides minimal persistence for users, tasks, categories, and shared lists

export type SynthUser = {
  id: string;
  email: string;
  password: string;
};

export type SynthCategory = {
  id: string;
  name: string;
  color: string;
};

export type SynthTask = {
  id: string;
  title: string;
  note: string;
  is_completed: boolean;
  priority: 'Urgent' | 'Important' | 'Normal';
  reminder: string | null;
  category_id: string | null;
  user_id: string | null; // owner when personal list
  shared_list_id: string | null; // when in shared list
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SynthSharedList = {
  id: string;
  name: string;
  share_code: string;
  owner_id: string;
  created_at: string;
};

export type SynthSharedListMember = {
  list_id: string;
  user_id: string;
};

const KEYS = {
  users: 'synth:users',
  currentUserId: 'synth:currentUserId',
  categories: 'synth:categories',
  tasks: 'synth:tasks',
  sharedLists: 'synth:shared_lists',
  sharedMembers: 'synth:shared_list_members',
} as const;

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// Seed default categories once
function ensureDefaultCategories() {
  const existing = readArray<SynthCategory>(KEYS.categories);
  if (existing.length > 0) return;
  const defaults: SynthCategory[] = [
    { id: generateId('cat'), name: 'Travail', color: '#2563eb' },
    { id: generateId('cat'), name: 'Étude', color: '#7c3aed' },
    { id: generateId('cat'), name: 'Maison', color: '#059669' },
    { id: generateId('cat'), name: 'Sport', color: '#dc2626' },
    { id: generateId('cat'), name: 'Vie personnelle', color: '#f59e0b' },
  ];
  writeArray(KEYS.categories, defaults);
}

export const synthStore = {
  // Auth
  getCurrentUser(): SynthUser | null {
    const id = localStorage.getItem(KEYS.currentUserId);
    if (!id) return null;
    const users = readArray<SynthUser>(KEYS.users);
    return users.find((u) => u.id === id) ?? null;
  },
  signUp(email: string, password: string): { user: SynthUser } {
    const users = readArray<SynthUser>(KEYS.users);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email déjà utilisé');
    }
    const user: SynthUser = { id: generateId('usr'), email, password };
    users.push(user);
    writeArray(KEYS.users, users);
    localStorage.setItem(KEYS.currentUserId, user.id);
    return { user };
  },
  signIn(email: string, password: string): { user: SynthUser } {
    const users = readArray<SynthUser>(KEYS.users);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error('Identifiants invalides');
    }
    localStorage.setItem(KEYS.currentUserId, user.id);
    return { user };
  },
  signOut(): void {
    localStorage.removeItem(KEYS.currentUserId);
  },

  // Categories
  listCategories(): SynthCategory[] {
    ensureDefaultCategories();
    return readArray<SynthCategory>(KEYS.categories);
  },

  // Tasks
  listTasks(options: { userId: string; sharedListId?: string | undefined }): SynthTask[] {
    const tasks = readArray<SynthTask>(KEYS.tasks);
    if (options.sharedListId) {
      return tasks.filter((t) => t.shared_list_id === options.sharedListId);
    }
    return tasks.filter((t) => t.user_id === options.userId && t.shared_list_id === null);
  },
  addTask(input: Omit<SynthTask, 'id' | 'created_at' | 'updated_at'>): SynthTask {
    const tasks = readArray<SynthTask>(KEYS.tasks);
    const task: SynthTask = {
      ...input,
      id: generateId('tsk'),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    tasks.unshift(task);
    writeArray(KEYS.tasks, tasks);
    return task;
  },
  updateTask(id: string, updates: Partial<SynthTask>): void {
    const tasks = readArray<SynthTask>(KEYS.tasks);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;
    tasks[idx] = { ...tasks[idx], ...updates, updated_at: nowIso() };
    writeArray(KEYS.tasks, tasks);
  },
  deleteTask(id: string): void {
    const tasks = readArray<SynthTask>(KEYS.tasks).filter((t) => t.id !== id);
    writeArray(KEYS.tasks, tasks);
  },

  // Shared lists
  listSharedLists(): SynthSharedList[] {
    return readArray<SynthSharedList>(KEYS.sharedLists);
  },
  listMemberships(): SynthSharedListMember[] {
    return readArray<SynthSharedListMember>(KEYS.sharedMembers);
  },
  createSharedList(name: string, ownerId: string): SynthSharedList {
    const lists = readArray<SynthSharedList>(KEYS.sharedLists);
    const members = readArray<SynthSharedListMember>(KEYS.sharedMembers);
    const list: SynthSharedList = {
      id: generateId('lst'),
      name,
      share_code: synthStore.generateShareCode(),
      owner_id: ownerId,
      created_at: nowIso(),
    };
    lists.unshift(list);
    members.push({ list_id: list.id, user_id: ownerId });
    writeArray(KEYS.sharedLists, lists);
    writeArray(KEYS.sharedMembers, members);
    return list;
  },
  joinSharedList(shareCode: string, userId: string): { error?: string } | { data: SynthSharedList } {
    const lists = readArray<SynthSharedList>(KEYS.sharedLists);
    const list = lists.find((l) => l.share_code.toUpperCase() === shareCode.toUpperCase());
    if (!list) return { error: 'Code invalide' };
    const members = readArray<SynthSharedListMember>(KEYS.sharedMembers);
    const exists = members.find((m) => m.list_id === list.id && m.user_id === userId);
    if (!exists) {
      members.push({ list_id: list.id, user_id: userId });
      writeArray(KEYS.sharedMembers, members);
    }
    return { data: list };
  },
  deleteSharedList(id: string): void {
    const lists = readArray<SynthSharedList>(KEYS.sharedLists).filter((l) => l.id !== id);
    const members = readArray<SynthSharedListMember>(KEYS.sharedMembers).filter((m) => m.list_id !== id);
    const tasks = readArray<SynthTask>(KEYS.tasks).filter((t) => t.shared_list_id !== id);
    writeArray(KEYS.sharedLists, lists);
    writeArray(KEYS.sharedMembers, members);
    writeArray(KEYS.tasks, tasks);
  },

  generateShareCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  },
};


