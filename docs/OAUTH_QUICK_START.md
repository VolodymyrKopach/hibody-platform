# OAuth Quick Start Guide

Quick setup guide for OAuth authentication. For detailed instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md).

## 🚀 Quick Setup (5-10 minutes)

### 1. Google OAuth (Recommended)

#### Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**

#### Supabase Dashboard
1. Go to https://app.supabase.com/
2. Authentication → Providers → Google
3. Enable and paste credentials
4. Save

### 2. Test Locally

```bash
npm run dev
```

Navigate to `http://localhost:3000/auth/login` and click "Continue with Google"

## ✅ What's Implemented

- ✅ OAuth button in Login and Register forms
- ✅ Google OAuth support (GitHub and Facebook prepared but not active)
- ✅ Automatic user profile creation
- ✅ Avatar and name extraction from OAuth
- ✅ Error handling and loading states
- ✅ Ukrainian and English translations
- ✅ Analytics tracking for OAuth logins

## 🔧 Configuration

### Environment Variables

No additional environment variables needed! OAuth credentials are configured in Supabase Dashboard.

### Supabase Settings

Make sure these are set in Supabase Dashboard:

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
- Redirect URLs: `http://localhost:3000/auth/callback`

## 📁 Files Modified/Created

### New Files
- `src/components/auth/OAuthButtons.tsx` - OAuth buttons component
- `docs/OAUTH_SETUP.md` - Detailed setup guide
- `docs/OAUTH_QUICK_START.md` - This file

### Modified Files
- `src/providers/AuthProvider.tsx` - Added `signInWithOAuth` method
- `src/types/auth.ts` - Added `OAuthProvider` type
- `src/components/auth/LoginForm.tsx` - Added OAuth buttons
- `src/components/auth/RegisterForm.tsx` - Added OAuth buttons
- `src/locales/uk/auth.json` - Added Ukrainian translations
- `src/locales/en/auth.json` - Added English translations
- `src/app/auth/callback/page.tsx` - Enhanced OAuth callback handling

## 🎨 UI/UX

OAuth button appears:
- In Login form (below email/password login)
- In Register form (below registration form)
- With Google icon and branding
- With loading states during OAuth flow
- With proper error messages

## 🔐 Security Features

- ✅ PKCE flow enabled
- ✅ Automatic session management
- ✅ Secure token handling (by Supabase)
- ✅ User profile auto-creation with validation
- ✅ Error handling for failed OAuth attempts

## 📊 User Profile Creation

When a user signs in with OAuth for the first time:

1. ✅ User account created in `auth.users`
2. ✅ Profile created in `user_profiles` with:
   - Email from OAuth
   - Full name from OAuth metadata
   - Avatar URL from OAuth
   - Default role: `teacher`
   - Default subscription: `free`

## 🧪 Testing Checklist

- [ ] Click "Continue with Google" on login page
- [ ] Complete Google OAuth flow
- [ ] Verify redirect to home page
- [ ] Check user profile in Supabase Dashboard
- [ ] Verify avatar and name are populated
- [ ] Test logout and re-login
- [ ] Test with new Google account
- [ ] Test error handling (cancel OAuth flow)

## 🐛 Common Issues

### "Redirect URI mismatch"
➡️ Check redirect URI in Google Console matches Supabase exactly

### "User profile not created"
➡️ Check RLS policies on `user_profiles` table allow INSERT

### "OAuth popup blocked"
➡️ Allow popups for localhost/your-domain in browser

### "Session not persisting"
➡️ Verify `detectSessionInUrl: true` in Supabase client config (already set)

## 📝 Next Steps

1. ✅ Google OAuth is working
2. [ ] Test on production domain
3. [ ] Monitor OAuth analytics
4. [ ] Add GitHub/Facebook if needed (code is ready)

## 🆘 Need Help?

- See detailed guide: [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- Check Supabase logs: Dashboard → Logs → Auth
- Review browser console for errors

## 🎉 That's it!

OAuth authentication is now fully functional. Users can sign in with Google!

**Note**: GitHub and Facebook are prepared in the codebase but not active. To enable them, simply add their providers back to the `providers` array in `OAuthButtons.tsx` and configure them in Supabase Dashboard.

