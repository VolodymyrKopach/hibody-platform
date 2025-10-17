# OAuth Authentication Setup Guide

This guide provides step-by-step instructions for setting up OAuth authentication (Google, GitHub, Facebook) with Supabase for the TeachSpark platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Google OAuth Setup](#google-oauth-setup)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Facebook OAuth Setup](#facebook-oauth-setup)
- [Supabase Configuration](#supabase-configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Active Supabase project
- Access to Supabase Dashboard
- Domain configured (for production)

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the left sidebar
2. Choose **External** user type (or Internal for Google Workspace)
3. Fill in required information:
   - **App name**: TeachSpark Platform
   - **User support email**: your-email@example.com
   - **Developer contact email**: your-email@example.com
4. Add scopes (optional):
   - `userinfo.email`
   - `userinfo.profile`
5. Click **Save and Continue**

### Step 3: Create OAuth 2.0 Client ID

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)
4. Add **Authorized redirect URIs**:
   - Development: `https://your-project.supabase.co/auth/v1/callback`
   - Production: `https://your-project.supabase.co/auth/v1/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable the provider
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: TeachSpark Platform
   - **Homepage URL**: 
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

### Step 2: Configure Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and enable it
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as app type
4. Fill in app details:
   - **App name**: TeachSpark Platform
   - **App contact email**: your-email@example.com
5. Click **Create App**

### Step 2: Configure Facebook Login

1. In your app dashboard, go to **Products** → **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform
4. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
5. Go to **Facebook Login** → **Settings**
6. Add **Valid OAuth Redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`
7. Click **Save Changes**

### Step 3: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy the **App ID** (this is your Client ID)
3. Click **Show** next to **App Secret** and copy it

### Step 4: Configure Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Facebook** and enable it
3. Paste your **App ID** (as Client ID) and **App Secret** (as Client Secret)
4. Click **Save**

## Supabase Configuration

### Redirect URLs

Make sure your redirect URLs are properly configured in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Add your **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

### User Profiles Table

The application automatically creates user profiles for OAuth users. Ensure your `user_profiles` table has the following columns:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher',
  subscription_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

### Local Development

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Click on any OAuth provider button (Google, GitHub, Facebook)

4. Complete the OAuth flow in the provider's popup

5. You should be redirected back to your app and logged in

### Verify User Profile Creation

1. After successful OAuth login, check Supabase Dashboard
2. Go to **Table Editor** → **user_profiles**
3. Verify that a new profile was created with:
   - Correct email
   - Full name extracted from OAuth metadata
   - Avatar URL (if available)
   - Default role: `teacher`
   - Default subscription: `free`

## Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch

**Error**: `redirect_uri_mismatch` or `invalid_redirect_uri`

**Solution**: 
- Ensure redirect URIs in provider console exactly match Supabase callback URL
- Check for trailing slashes
- Verify protocol (http vs https)

#### 2. User Profile Not Created

**Error**: User logged in but no profile in `user_profiles` table

**Solution**:
- Check browser console for errors
- Verify RLS policies on `user_profiles` table allow INSERT
- Check Supabase logs in Dashboard → **Logs**

#### 3. OAuth Button Not Working

**Error**: Nothing happens when clicking OAuth button

**Solution**:
- Check browser console for errors
- Verify `signInWithOAuth` is properly imported in AuthProvider
- Ensure popup blocker is not blocking OAuth popup

#### 4. Session Not Persisting

**Error**: User logged out after page refresh

**Solution**:
- Verify `detectSessionInUrl: true` in Supabase client configuration
- Check that cookies are enabled in browser
- Ensure `redirectTo` URL is correctly configured

### Debug Mode

To enable debug logging for OAuth:

1. Open browser DevTools
2. Go to Console
3. Look for logs starting with:
   - `OAuth ${provider} error:`
   - `Failed to create user profile:`
   - `Error ensuring user profile:`

### Getting Help

If you encounter issues:

1. Check Supabase logs: Dashboard → **Logs** → **Auth**
2. Review browser console for errors
3. Verify all credentials are correct
4. Check that OAuth apps are in "Production" mode (not "Testing")

## Production Deployment

Before deploying to production:

1. ✅ Update all OAuth redirect URLs to production domain
2. ✅ Update Supabase Site URL to production domain
3. ✅ Verify OAuth apps are published/live (not in testing mode)
4. ✅ Test OAuth flow on production domain
5. ✅ Set up proper error monitoring (e.g., Sentry)
6. ✅ Configure rate limiting for OAuth endpoints

## Security Best Practices

1. **Never expose OAuth secrets** - Keep them in environment variables
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Implement CSRF protection** - Supabase handles this automatically
4. **Validate user data** - Always validate OAuth profile data
5. **Monitor OAuth usage** - Track failed attempts and unusual patterns
6. **Regular credential rotation** - Rotate OAuth secrets periodically

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)

## Support

For issues specific to this implementation, please:
1. Check the troubleshooting section above
2. Review the code in `src/components/auth/OAuthButtons.tsx`
3. Check `src/providers/AuthProvider.tsx` for OAuth flow logic
4. Contact the development team if issues persist

