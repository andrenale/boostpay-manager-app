# 🔐 Quick Auth Setup Reference

## Development (Auto-Login Enabled)
```bash
# In .env.local or .env.development
VITE_USE_DEV_TOKEN=true
```
✅ Automatic login with dev token  
✅ No need to enter credentials  
✅ Fast development workflow  

## Production (Real Login Required)
```bash
# In .env.production
VITE_USE_DEV_TOKEN=false
```
🔒 Dev token disabled  
🔒 Users must login properly  
🔒 Secure authentication flow  

---

**📖 Full Documentation:** See [docs/AUTH_CONFIG.md](./docs/AUTH_CONFIG.md)

**⚠️ Before Production:**
1. Set `VITE_USE_DEV_TOKEN=false` in `.env.production`
2. Implement real login API in `src/pages/Login.tsx`
3. Test with `bun run build && bun run preview`
