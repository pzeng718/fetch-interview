"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_ENDPOINT = "https://frontend-take-home-service.fetch.com";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (name: string, email: string): Promise<boolean> => {
    try {
      await axios.post(`${API_ENDPOINT}/auth/login`, { name, email }, { withCredentials: true });
      localStorage.setItem("authToken", "true"); // Store auth state in localStorage
      setIsAuthenticated(true);
      router.push("/");
      return true;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem("authToken"); // Remove auth state on logout
    await axios.post(`${API_ENDPOINT}/auth/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
    router.push("/");
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
