// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';
import api from '../services/api';
import { getAccessToken, setAccessToken, clearAccessToken } from '../auth/token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // <-- было false
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        const token = getAccessToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          const me = await api.getOrgMe(); // ✅ data
          setUser(me);
        } catch {
          clearAccessToken();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        const loginRes = await api.login(credentials.email, credentials.password);

        const access =
          (loginRes as any).access_token ??
          (loginRes as any).accessToken ??
          (loginRes as any).token;

        if (!access) throw new Error('No access token in response');

        setAccessToken(access);

        const me = await api.getOrgMe();
        setUser(me);
      } catch (err: any) {
        setError(err.response?.data?.message || err?.message || 'Login failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    };


    const register = async (credentials: RegisterCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        const regRes = await api.register(
          credentials.email,
          credentials.password,
          credentials.fullName,
          credentials.role,
          credentials.companyName,
          credentials.phone
        ); // ✅ data

        const access =
          (regRes as any).access_token ??
          (regRes as any).accessToken ??
          (regRes as any).token;

        if (!access) throw new Error('No access token in response');

        setAccessToken(access);

        const me = await api.getOrgMe(); // ✅ data
        setUser(me);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    

  const logout = () => {
    clearAccessToken();
    setUser(null);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
