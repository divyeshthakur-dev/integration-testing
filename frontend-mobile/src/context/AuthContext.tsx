import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { secureStorage } from '../utils/storage';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, setOnUnauthorizedCallback } from '../api/client';
import authApi from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      await secureStorage.removeItem(AUTH_TOKEN_KEY);
      await secureStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      setToken(null);
    } catch (e) {
      console.warn('Error during logout', e);
    }
  }, []);

  const login = useCallback(async (userData: User) => {
    try {
      await secureStorage.setItem(AUTH_TOKEN_KEY, userData.token);
      await secureStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
      setToken(userData.token);
    } catch (e) {
      console.warn('Error saving user data upon login', e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        const currentToken = token || (await secureStorage.getItem(AUTH_TOKEN_KEY)) || '';
        const updatedUser: User = {
          ...response.data,
          token: currentToken,
        };
        await secureStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch {
      // If refresh fails due to invalid token, logout
      await logout();
    }
  }, [token, logout]);

  // Restore session from SecureStore on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await secureStorage.getItem(AUTH_TOKEN_KEY);
        const storedUserJson = await secureStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUserJson) {
          const parsedUser: User = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify token against /api/auth/me in background
          try {
            const meRes = await authApi.getMe();
            if (meRes.success && meRes.data) {
              const refreshedUser = { ...meRes.data, token: storedToken };
              setUser(refreshedUser);
              await secureStorage.setItem(AUTH_USER_KEY, JSON.stringify(refreshedUser));
            }
          } catch (verifyErr: any) {
            if (verifyErr.response?.status === 401) {
              await logout();
            }
          }
        }
      } catch (err) {
        console.warn('Session restoration failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  // Register unauthorized listener to trigger logout
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setToken(null);
    });
    return () => setOnUnauthorizedCallback(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
