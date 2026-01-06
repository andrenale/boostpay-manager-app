/**
 * Authentication configuration
 * This file contains authentication-related constants and configurations
 */

/**
 * Environment detection
 * In production, set VITE_USE_DEV_TOKEN=false or remove it entirely
 */
const USE_DEV_TOKEN = import.meta.env.VITE_USE_DEV_TOKEN === 'true' || import.meta.env.DEV;

/**
 * Hardcoded token for development purposes ONLY
 * This token is ONLY used when USE_DEV_TOKEN is true
 * 
 * To disable in production:
 * 1. Set VITE_USE_DEV_TOKEN=false in your .env.production file
 * 2. Or simply don't set it (defaults to false in production builds)
 */
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZS5uYWxldmFpa29AZ21haWwuY29tIiwiZXN0YWJsaXNobWVudHMiOlt7ImlkIjo5NCwicm9sZSI6ImFkbWluIn1dLCJleHAiOjE3Njc3NDQyNDN9.ERu3PbPIJXAiJwZXEQdm4wtc8jlR9avAJTKztQppCGY';

/**
 * Export the dev token only if in development mode
 * In production, this will be null
 */
export const DEV_AUTH_TOKEN = USE_DEV_TOKEN ? DEV_TOKEN : null;

/**
 * Authentication storage key
 */
export const AUTH_TOKEN_KEY = 'boostpay_auth_token';

/**
 * Check if we're using development authentication
 */
export const isDevAuth = (): boolean => USE_DEV_TOKEN;

/**
 * Log authentication mode (helpful for debugging)
 */
if (import.meta.env.DEV) {
  console.log('🔧 Auth Mode:', USE_DEV_TOKEN ? 'DEVELOPMENT (Auto-login enabled)' : 'PRODUCTION (Login required)');
}
