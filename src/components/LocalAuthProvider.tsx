// components/LocalAuthProvider.tsx
'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AuthContextType {
  user: { uid: string }; // Simplified mock user
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: { uid: 'local-user' },
  loading: false
});

export const useAuth = () => useContext(AuthContext);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Always provide a mock user - no auth required
  return (
    <AuthContext.Provider value={{ user: { uid: 'local-user' }, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
