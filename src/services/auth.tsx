import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  /** true until the stored session has been restored */
  loading: boolean;
  session: Session | null;
  /** Server-side check against the `admins` table (RLS enforces it again on every write) */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function checkAdmin(session: Session | null): Promise<boolean> {
  if (!supabase || !session) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(Boolean(supabase));
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const apply = async (s: Session | null) => {
      const admin = await checkAdmin(s);
      if (!alive) return;
      setSession(s);
      setIsAdmin(admin);
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Token refreshes don't change who is signed in — skip the extra admin check
      if (event === 'TOKEN_REFRESHED') setSession(s);
      // Deferred: calling Supabase inside this callback can dead-lock the auth client
      else if (event !== 'INITIAL_SESSION') setTimeout(() => void apply(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return 'Supabase бапталмаған';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    if (/invalid login credentials/i.test(error.message)) return 'Email немесе құпиясөз қате';
    if (/email not confirmed/i.test(error.message)) return 'Email расталмаған. Supabase-та пайдаланушыны растаңыз';
    return error.message;
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  return <AuthContext.Provider value={{ loading, session, isAdmin, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
