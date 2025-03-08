// components/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getCurrentUser } from '@/lib/auth-client';
import Auth from './Auth';

interface AuthContextType {
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Auth onAuth={() => setUser(getCurrentUser())} />;
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
