import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { authService, AuthState } from '../services/auth';
import { UserResponse } from '../types/api';

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<boolean>;
  loginWithRedirect: (token: string) => Promise<boolean>;
  logout: () => void;
  redirectToLogin: () => void;
  setHardcodedToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const redirectToLogin = () => {
    console.log('Redirecting to login page');
    navigate('/login', { replace: true });
  };

  const initializeAuth = async () => {
    console.log('🚀 AuthContext.initializeAuth() CALLED - START');
    try {
      // 1. Check for token in URL params (OAuth redirect flow)
      const tokenFromParams = searchParams.get('token');
      if (tokenFromParams) {
        console.log('📝 Token found in URL params, verifying...');
        const success = await loginWithRedirect(tokenFromParams);
        // Remove token from URL for security
        setSearchParams({});
        if (!success) {
          redirectToLogin();
        }
        console.log('🚀 AuthContext.initializeAuth() CALLED - END (URL token)');
        return;
      }

      // 2. Check for existing token in localStorage
      const savedToken = localStorage.getItem('boostpay_auth_token');
      if (savedToken && savedToken !== 'your-token-here') {
        console.log('💾 Existing token found in localStorage, verifying...');
        apiService.setToken(savedToken);
        
        // Single verification call
        const authResult = await authService.verifyAuthentication();
        setAuthState(authResult);
        
        if (!authResult.isAuthenticated) {
          // Invalid saved token, try hardcoded token
          console.log('❌ Saved token invalid, trying hardcoded token...');
          await tryHardcodedToken();
        } else {
          // Check if we're on login page and redirect to dashboard
          const currentPath = window.location.pathname;
          if (currentPath === '/login') {
            console.log('✅ Already authenticated, redirecting from login to dashboard');
            navigate('/', { replace: true });
          }
        }
        console.log('🚀 AuthContext.initializeAuth() CALLED - END (saved token)');
        return;
      }

      // 3. Try hardcoded token for development
      console.log('🔧 No saved token found, trying hardcoded token...');
      await tryHardcodedToken();
      console.log('🚀 AuthContext.initializeAuth() CALLED - END (hardcoded token)');

    } catch (error) {
      console.error('💥 Error initializing auth:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Authentication initialization failed',
      });
      console.log('🚀 AuthContext.initializeAuth() CALLED - END (error)');
    }
  };

  const tryHardcodedToken = async () => {
    const hardcodedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZS5uYWxldmFpa29AZ21haWwuY29tIiwiZXN0YWJsaXNobWVudHMiOlt7ImlkIjo5NCwicm9sZSI6ImFkbWluIn1dLCJleHAiOjE3NjU1OTIwOTZ9.ktYksbvYGw9jr3aVMwIY9uGuxhlWf6VikN8aSlcVDHM';
    
    console.log('🔧 Setting hardcoded token and verifying...');
    apiService.setToken(hardcodedToken);
    
    // Single verification call
    const authResult = await authService.verifyAuthentication();
    setAuthState(authResult);
    
    if (!authResult.isAuthenticated) {
      // Only redirect to login if we're not already on login page or public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/checkout', '/cobranca', '/cobranca/sucesso'];
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isPublicPath) {
        redirectToLogin();
      } else {
        // Set loading to false for public pages
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      // Check if we're on login page and redirect to dashboard
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        console.log('✅ Already authenticated, redirecting from login to dashboard');
        navigate('/', { replace: true });
      }
    }
  };

  const login = async (token: string): Promise<boolean> => {
    try {
      console.log('Logging in and verifying token...');
      
      // Set token first
      apiService.setToken(token);
      
      // Verify the token by calling the API
      const authResult = await authService.verifyAuthentication();
      setAuthState(authResult);
      
      if (authResult.isAuthenticated) {
        console.log('Login successful:', authResult.user);
        return true;
      } else {
        console.error('Login failed:', authResult.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Login failed',
      });
      return false;
    }
  };

  const loginWithRedirect = async (token: string): Promise<boolean> => {
    const success = await login(token);
    if (success) {
      console.log('Login successful, redirecting to dashboard');
      navigate('/', { replace: true });
    }
    return success;
  };

  const logout = () => {
    console.log('Logging out');
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    redirectToLogin();
  };

  const setHardcodedToken = async (newToken: string) => {
    console.log('Setting hardcoded token for development');
    await login(newToken);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    loginWithRedirect,
    logout,
    redirectToLogin,
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