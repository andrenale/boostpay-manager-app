import { UserResponse } from '../types/api';
import { apiService } from './api';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  };

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async verifyAuthentication(): Promise<AuthState> {
    console.log('🔍 AuthService.verifyAuthentication() CALLED - START');
    this.authState.isLoading = true;
    this.authState.error = null;

    try {
      if (!apiService.isAuthenticated()) {
        throw new Error('No authentication token found');
      }

      console.log('🌐 Making API request to /users/me...');
      const user = await apiService.verifyAuth() as UserResponse;
      console.log('✅ API request to /users/me completed successfully');
      
      this.authState = {
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      };

      console.log('🔍 AuthService.verifyAuthentication() CALLED - SUCCESS');
      return this.authState;

    } catch (error: any) {
      console.error('❌ AuthService.verifyAuthentication() CALLED - FAILED:', error);
      
      // Clear invalid token
      apiService.clearToken();
      
      this.authState = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: this.getErrorMessage(error),
      };

      console.log('🔍 AuthService.verifyAuthentication() CALLED - END (FAILED)');
      return this.authState;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.status === 401) {
      return 'Authentication token is invalid or expired';
    }
    if (error.response?.status === 403) {
      return 'Access denied';
    }
    if (error.message) {
      return error.message;
    }
    return 'Authentication verification failed';
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  logout(): void {
    apiService.clearToken();
    this.authState = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    };
  }

  clearError(): void {
    this.authState.error = null;
  }
}

export const authService = AuthService.getInstance();