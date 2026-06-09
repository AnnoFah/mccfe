import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS = [
  {
    id: "1",
    name: "Admin MCC",
    email: "admin@mcc.id",
    password: "admin123",
    role: "admin" as UserRole,
    department: "Manajemen",
    position: "Manajer/SPV",
  },
  {
    id: "2",
    name: "Budi Santoso",
    email: "budi@mcc.id",
    password: "karyawan123",
    role: "employee" as UserRole,
    department: "Kreatif",
    position: "Desainer Grafis",
  },
  {
    id: "3",
    name: "Siti Rahma",
    email: "siti@mcc.id",
    password: "karyawan123",
    role: "employee" as UserRole,
    department: "Event",
    position: "Event Coordinator",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem("mcc_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      sessionStorage.setItem("mcc_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("mcc_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
