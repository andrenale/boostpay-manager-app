# Authentication Configuration Guide

This document explains how the authentication system is configured for development and production environments.

## Overview

The application uses an environment-based authentication system that allows:
- **Development Mode**: Auto-login with a hardcoded token for convenience during development
- **Production Mode**: Proper login flow with real authentication

## Configuration Files

### 1. `/src/config/auth.ts`
Central configuration file for authentication constants.

**Key exports:**
- `DEV_AUTH_TOKEN`: The hardcoded token (only available in dev mode)
- `AUTH_TOKEN_KEY`: localStorage key for storing tokens
- `isDevAuth()`: Function to check if dev mode is enabled

### 2. Environment Files

#### `.env.development`
Used during development (`bun run dev`)
```env
VITE_USE_DEV_TOKEN=true  # Enables auto-login
```

#### `.env.production`
Used for production builds (`bun run build`)
```env
VITE_USE_DEV_TOKEN=false  # Disables auto-login
```

## How It Works

### Development Mode (VITE_USE_DEV_TOKEN=true)
1. App initializes and checks for existing token in localStorage
2. If no token found, automatically uses the hardcoded `DEV_AUTH_TOKEN`
3. User is logged in automatically without visiting login page
4. Login page also uses dev token when form is submitted

### Production Mode (VITE_USE_DEV_TOKEN=false)
1. App initializes and checks for existing token in localStorage
2. If no token found, redirects user to login page
3. Login page expects real API integration (currently shows "not implemented" message)
4. No auto-login or hardcoded tokens are used

## Switching Between Modes

### Enable Development Mode (Auto-Login)
```bash
# In .env.development or .env.local
VITE_USE_DEV_TOKEN=true
```

### Disable Development Mode (Force Real Login)
```bash
# In .env.production
VITE_USE_DEV_TOKEN=false
```

Or simply remove the `VITE_USE_DEV_TOKEN` variable entirely.

## Before Going to Production

### ✅ Checklist:

1. **Update `.env.production`**
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com
   VITE_USE_DEV_TOKEN=false
   ```

2. **Implement Real Login API** in `/src/pages/Login.tsx`:
   ```typescript
   // Replace the TODO section with:
   const response = await apiService.post('/auth/login', { 
     email, 
     password 
   });
   const { access_token } = response.data;
   const success = await loginWithRedirect(access_token);
   ```

3. **Test Production Build Locally**
   ```bash
   bun run build
   bun run preview
   ```
   Verify that auto-login is disabled and login page works correctly.

4. **Remove Dev Token (Optional but Recommended)**
   
   For extra security, you can comment out or remove the `DEV_TOKEN` constant in `/src/config/auth.ts` before deploying to production:
   ```typescript
   // const DEV_TOKEN = '...'; // Remove this line in production
   const DEV_TOKEN = ''; // Or set to empty string
   ```

## Security Notes

⚠️ **IMPORTANT:**
- The dev token should **NEVER** be a production token
- Dev token is embedded in the client-side code (visible to anyone)
- Always use `VITE_USE_DEV_TOKEN=false` in production
- Implement proper server-side authentication for production

## Troubleshooting

### Issue: Auto-login still works in production
**Solution:** Check that `.env.production` has `VITE_USE_DEV_TOKEN=false`

### Issue: Can't login in development
**Solution:** Check that `.env.development` has `VITE_USE_DEV_TOKEN=true`

### Issue: Token expired
**Solution:** Update the token in `/src/config/auth.ts` with a new one

## File Structure

```
src/
├── config/
│   └── auth.ts                 # Authentication configuration
├── contexts/
│   └── AuthContext.tsx         # Authentication context (handles auto-login)
├── pages/
│   └── Login.tsx               # Login page (uses dev token in dev mode)
└── services/
    └── api.ts                  # API service (uses AUTH_TOKEN_KEY)

.env.development                # Development environment config
.env.production                 # Production environment config
.env.example                    # Example environment variables
```

## Quick Commands

```bash
# Development with auto-login
bun run dev

# Production build (auto-login disabled)
bun run build

# Preview production build locally
bun run preview
```
