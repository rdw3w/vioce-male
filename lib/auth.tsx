'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    uid: 'local-user-123',
    email: 'local@example.com',
    displayName: 'Local User',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock user for offline mode
  }, []);

  const signInWithGoogle = async () => {
    setUser({
      uid: 'local-user-123',
      email: 'local@example.com',
      displayName: 'Local User',
    });
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
