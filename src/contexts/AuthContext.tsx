import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { synthStore, type SynthUser } from '../lib/synthStore';

interface AuthContextType {
  user: SynthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any } | { user: SynthUser }>;
  signIn: (email: string, password: string) => Promise<{ error: any } | { user: SynthUser }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SynthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let u = synthStore.getCurrentUser();
    if (!u) {
      try {
        // Auto-provision a local guest user so the app works without accounts
        const guest = synthStore.signUp('guest@local', 'guest').user;
        u = guest;
      } catch {
        // If guest already exists but wasn't current, sign in
        try {
          u = synthStore.signIn('guest@local', 'guest').user;
        } catch {}
      }
    }
    setUser(u);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = synthStore.signUp(email, password);
      setUser(user);
      return { user };
    } catch (e: any) {
      return { error: { message: e?.message || 'Erreur inscription' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = synthStore.signIn(email, password);
      setUser(user);
      return { user };
    } catch (e: any) {
      return { error: { message: e?.message || 'Erreur connexion' } };
    }
  };

  const signOut = async () => {
    synthStore.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}