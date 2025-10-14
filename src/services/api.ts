import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// TODO: Replace this hardcoded token with your actual token
// const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfdXNlcl85NCIsImVzdGFibGlzaG1lbnRzIjpbeyJpZCI6OTQsInJvbGUiOiJhZG1pbiJ9XSwiZXhwIjoxNzY1MjQxNjYxLCJpYXQiOjE3NjAwNTc2NjEsInR5cGUiOiJhY2Nlc3NfdG9rZW4ifQ.WM3Dt0pwJhmrKt_D5-DMLVEQglt2jozF7X_5_4GUpn8';
const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZS5uYWxldmFpa29AZ21haWwuY29tIiwiZXN0YWJsaXNobWVudHMiOlt7ImlkIjo5NCwicm9sZSI6ImFkbWluIn1dLCJleHAiOjE3NjU1OTIwOTZ9.ktYksbvYGw9jr3aVMwIY9uGuxhlWf6VikN8aSlcVDHM';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Global establishment ID management
let globalEstablishmentId: number | null = null;

// JWT Token payload interface
export interface JWTPayload {
  sub: string; // user ID
  establishments: Array<{
    id: number;
    role: string;
  }>;
  exp: number;
  iat: number;
  type: string;
}

export interface ApiError {
  detail: string | Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// JWT utility functions
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Split the token and get the payload
    const base64Url = cleanToken.split('.')[1];
    if (!base64Url) return null;
    
    // Decode base64url
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Global establishment ID utilities
export const setGlobalEstablishmentId = (id: number): void => {
  globalEstablishmentId = id;
  localStorage.setItem('boostpay_establishment_id', id.toString());
  console.log('Global establishment ID set to:', id);
};

export const getGlobalEstablishmentId = (): number | null => {
  // Return cached value if available
  if (globalEstablishmentId !== null) {
    return globalEstablishmentId;
  }
  
  // Try to load from localStorage
  const saved = localStorage.getItem('boostpay_establishment_id');
  if (saved) {
    const parsedId = parseInt(saved, 10);
    if (!isNaN(parsedId)) {
      globalEstablishmentId = parsedId;
      return parsedId;
    }
  }
  
  return null;
};

export const clearGlobalEstablishmentId = (): void => {
  globalEstablishmentId = null;
  localStorage.removeItem('boostpay_establishment_id');
  console.log('Global establishment ID cleared');
};

export const extractEstablishmentFromToken = (token: string): number | null => {
  const payload = decodeJWT(token);
  if (payload?.establishments && payload.establishments.length > 0) {
    return payload.establishments[0].id; // Take first establishment
  }
  return null;
};

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    this.setupInterceptors();
    this.initializeAuth();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and data extraction
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // You can dispatch an action here to redirect to login
          console.warn('Authentication failed - token cleared');
        }

        // Transform FastAPI validation errors for better handling
        if (error.response?.data?.detail) {
          const apiError: ApiError = {
            detail: error.response.data.detail
          };
          error.apiError = apiError;
        }

        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });

        return Promise.reject(error);
      }
    );
  }

  private initializeAuth() {
    // Initialize with hardcoded token
    this.setToken(HARDCODED_TOKEN);
    
    // Also try to load token from localStorage (for future OAuth flow)
    const savedToken = localStorage.getItem('boostpay_auth_token');
    if (savedToken && savedToken !== 'your-token-here') {
      this.setToken(savedToken);
    }
  }

  setToken(token: string) {
    this.token = token;
    if (token !== 'your-token-here') {
      localStorage.setItem('boostpay_auth_token', token);
      
      // Automatically extract and set establishment ID if not already set
      if (getGlobalEstablishmentId() === null) {
        const establishmentId = extractEstablishmentFromToken(token);
        if (establishmentId !== null) {
          setGlobalEstablishmentId(establishmentId);
        }
      }
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('boostpay_auth_token');
    clearGlobalEstablishmentId();
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && this.token !== 'your-token-here';
  }

  // Establishment management methods
  getCurrentEstablishmentId(): number | null {
    return getGlobalEstablishmentId();
  }

  setCurrentEstablishmentId(id: number): void {
    setGlobalEstablishmentId(id);
  }

  getTokenPayload(): JWTPayload | null {
    if (!this.token) return null;
    return decodeJWT(this.token);
  }

  getUserEstablishments(): Array<{ id: number; role: string }> | null {
    const payload = this.getTokenPayload();
    return payload?.establishments || null;
  }

  // Generic HTTP methods with proper typing
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Utility method for file uploads
  async uploadFile<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export error handling utilities
export const handleApiError = (error: any): string => {
  if (error.apiError?.detail) {
    if (typeof error.apiError.detail === 'string') {
      return error.apiError.detail;
    }
    
    if (Array.isArray(error.apiError.detail)) {
      return error.apiError.detail
        .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
        .join(', ');
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};