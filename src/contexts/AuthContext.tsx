import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  setHardcodedToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // 1. Check for token in URL params (OAuth redirect flow)
      const tokenFromParams = searchParams.get('token');
      if (tokenFromParams) {
        console.log('Token found in URL params, logging in...');
        login(tokenFromParams);
        // Remove token from URL for security
        setSearchParams({});
        return;
      }

      // 2. Check for existing token in localStorage
      const savedToken = localStorage.getItem('boostpay_auth_token');
      if (savedToken && savedToken !== 'your-token-here') {
        console.log('Existing token found in localStorage');
        setToken(savedToken);
        apiService.setToken(savedToken);
        setIsAuthenticated(true);
        return;
      }

      // 3. Use hardcoded token for development (replace this with your actual token)
      const currentHardcodedToken = apiService.getToken();
      if (currentHardcodedToken && currentHardcodedToken !== 'your-token-here') {
        setToken(currentHardcodedToken);
        setIsAuthenticated(true);
        return;
      }

      // No valid token found
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string) => {
    console.log('Logging in with token');
    setToken(newToken);
    apiService.setToken(newToken);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = () => {
    console.log('Logging out');
    setToken(null);
    apiService.clearToken();
    setIsAuthenticated(false);
  };

  const setHardcodedToken = (newToken: string) => {
    console.log('Setting hardcoded token for development');
    login(newToken);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    setHardcodedToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};