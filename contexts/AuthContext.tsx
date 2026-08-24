"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  getCurrentUser,
  getToken,
  saveAuth,
  logout as clearAuth,
  type AuthUser,
} from "@/utils/api";

type AuthData = AuthUser & { token: string };

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      setUser(getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthData) => {
    saveAuth(data);
    const { token, ...userData } = data;
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return context;
}