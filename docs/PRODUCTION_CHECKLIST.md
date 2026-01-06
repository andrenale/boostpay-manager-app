# 🚀 Production Deployment Checklist

Use this checklist before deploying to production to ensure the dev token is properly disabled.

## Pre-Deployment Checks

### 1. Environment Configuration
- [ ] Verify `.env.production` exists
- [ ] Confirm `VITE_USE_DEV_TOKEN=false` in `.env.production`
- [ ] Update `VITE_API_BASE_URL` to production API URL
- [ ] Remove or don't commit `.env.local` (should be gitignored)

### 2. Code Verification
- [ ] Check that `src/config/auth.ts` properly handles `DEV_AUTH_TOKEN=null`
- [ ] Verify login API integration is implemented in `src/pages/Login.tsx`
- [ ] Ensure no hardcoded tokens exist outside of `src/config/auth.ts`

### 3. Build Testing
```bash
# Test production build locally
bun run build
bun run preview
```

- [ ] Build completes without errors
- [ ] Preview shows login page (not auto-logged in)
- [ ] Login page shows proper error when dev mode is disabled
- [ ] No console warnings about dev tokens

### 4. Security Verification
- [ ] Verify dev token is NOT in production bundle:
  ```bash
  # Search the build output
  grep -r "eyJhbGci" dist/
  # Should return no results or only in source maps
  ```
- [ ] Check browser DevTools Network tab - no auth tokens in URLs
- [ ] Verify localStorage is cleared on logout

### 5. Runtime Testing
After deployment:
- [ ] App redirects to login page on first visit
- [ ] Login page is displayed correctly
- [ ] No auto-login occurs
- [ ] Token is properly stored after successful login
- [ ] Token persists after page refresh
- [ ] Logout clears token and redirects to login

## Quick Test Commands

```bash
# Verify environment mode
echo $VITE_USE_DEV_TOKEN

# Build for production
bun run build

# Test production build
bun run preview

# Check for hardcoded tokens in build
grep -r "eyJhbGci" dist/ | grep -v ".map"
```

## Rollback Plan

If issues occur in production:

1. **Immediate Fix:**
   - Rollback to previous deployment
   - Fix issues locally
   - Re-test with checklist

2. **Emergency Dev Mode (NOT RECOMMENDED):**
   ```bash
   # Only if absolutely necessary and using a fresh token
   VITE_USE_DEV_TOKEN=true bun run build
   ```
   ⚠️ This should ONLY be temporary and with a short-lived token

## Post-Deployment Monitoring

- [ ] Monitor authentication error rates
- [ ] Check login success/failure metrics
- [ ] Verify token expiration handling
- [ ] Monitor for any leaked tokens in logs

## Additional Security Measures

Consider implementing:
- [ ] Token refresh mechanism
- [ ] Rate limiting on login endpoint
- [ ] HTTPS enforcement
- [ ] Content Security Policy (CSP)
- [ ] Secure cookie flags if using cookies
- [ ] Token expiration warnings to users

---

**Last Updated:** Check before each production deployment  
**Document Version:** 1.0  
**Next Review:** Before production launch
