import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { synthStore } from '../lib/synthStore';

export interface SharedList {
  id: string;
  name: string;
  share_code: string;
  owner_id: string;
  created_at: string;
}

export function useSharedLists() {
  const { user } = useAuth();
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSharedLists();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('synth:')) fetchSharedLists();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const fetchSharedLists = async () => {
    setLoading(true);
    const lists = synthStore.listSharedLists();
    const memberships = synthStore.listMemberships();
    const myListIds = new Set(memberships.filter((m) => m.user_id === user!.id).map((m) => m.list_id));
    const mine = lists.filter((l) => myListIds.has(l.id));
    setSharedLists(mine as any);
    setLoading(false);
  };

  const generateShareCode = () => synthStore.generateShareCode();

  const createSharedList = async (name: string) => {
    const list = synthStore.createSharedList(name, user!.id);
    await fetchSharedLists();
    return list as any;
  };

  const joinSharedList = async (shareCode: string) => {
    const res = synthStore.joinSharedList(shareCode, user!.id);
    await fetchSharedLists();
    return res as any;
  };

  const deleteSharedList = async (id: string) => {
    synthStore.deleteSharedList(id);
    await fetchSharedLists();
  };

  return {
    sharedLists,
    loading,
    createSharedList,
    joinSharedList,
    deleteSharedList,
  };
}