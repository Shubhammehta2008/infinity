import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';

interface Profile {
  id: number;
  user_id: string;
  email: string;
  role: 'admin' | 'client';
  full_name: string;
  company?: string;
}

interface AuthContextType {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null, loading: true, profileLoading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      setProfileLoading(true);
      const res = await fetch(`/api/profiles?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProfile(data[0]);
      } else {
        // auto-create profile if missing
        const role = email === 'admin@studio.com' || email.includes('admin') ? 'admin' : 'client';
        const createRes = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, email, role, full_name: email.split('@')[0] })
        });
        if (createRes.ok) {
          const newProfile = await createRes.json();
          setProfile(newProfile);
        }
      }
    } catch (e) {
      console.error('profile fetch error', e);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchProfile(session.user.id, session.user.email!);
      else setProfileLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchProfile(session.user.id, session.user.email!);
      else {
        setProfile(null);
        setProfileLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
