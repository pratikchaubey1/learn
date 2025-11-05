import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { userService } from '../services/userService';

type Theme = 'light' | 'dark';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: Theme;
  login: (data: { identifier: string; password:string }) => Promise<User>;
  signUp: (data: { fullName: string; username: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<User>;
  _updateUserFromResponse: (user: User) => void;
  toggleTheme: () => void;
  requestPasswordReset: (identifier: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme | null) || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const { data: user, isLoading: isAuthLoading, isError } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: userService.getMe,
    enabled: !!localStorage.getItem('authToken'),
    staleTime: Infinity,
    retry: (failureCount, error: any) => {
        if (error.message.includes('401')) return false;
        return failureCount < 2;
    },
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('authToken');
      queryClient.setQueryData(['me'], null);
    }
  }, [isError, queryClient]);

  const handleAuthSuccess = (userData: User) => {
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    }
    queryClient.setQueryData(['me'], userData);
    return userData;
  };

  const loginMutation = useMutation({
    mutationFn: (credentials: { identifier: string; password: string }) => 
        userService.login(credentials.identifier, credentials.password),
    onSuccess: handleAuthSuccess,
  });

  const signUpMutation = useMutation({
    mutationFn: (data: { fullName: string; username: string; email: string; password: string }) => 
        userService.signUp(data.fullName, data.username, data.email, data.password),
    onSuccess: handleAuthSuccess,
  });

  const updateUserMutation = useMutation({
    mutationFn: (updatedData: Partial<User>) => {
        if (!user) throw new Error("No user to update");
        return userService.updateUser({ ...user, ...updatedData });
    },
    onSuccess: (updatedUser) => {
        queryClient.setQueryData(['me'], updatedUser);
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: (identifier: string) => userService.requestPasswordReset(identifier),
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.clear();
  };
  
  const _updateUserFromResponse = (userData: User) => {
    queryClient.setQueryData(['me'], userData);
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isAuthLoading,
    theme,
    login: loginMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    logout,
    updateUser: updateUserMutation.mutateAsync,
    _updateUserFromResponse,
    toggleTheme,
    requestPasswordReset: requestResetMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};