# Admin Authentication Fix

## Issue

The admin panel authentication was failing on the server-side API routes with a 403 Forbidden error. The logs showed:

**Client-side (Browser):**
```
🔍 AdminAuthService.isAdmin: Checking user: {userId: '639c628d...', email: 'kopachvldmrsoc@gmail.com'}
📊 AdminAuthService.isAdmin: Query result: {isAdmin: true}
```

**Server-side (API Route):**
```
🔍 AdminAuthService.isAdmin: Checking user: {userId: undefined, email: undefined}
❌ AdminAuthService.isAdmin: No user found
GET /api/admin/users 403 Forbidden
```

## Root Cause

The `AdminAuthService` was importing and using only the **client-side** Supabase client:

```typescript
import { createClient } from '@/lib/supabase/client';
```

When this service was called from server-side API routes (e.g., `/api/admin/users`), it couldn't access the user session because the client-side Supabase client doesn't read cookies from the server request context.

## Solution

Modified `src/services/admin/adminAuthService.ts` to automatically detect the environment and use the appropriate Supabase client with **dynamic imports** to avoid bundling server-only code in the client.

### Changes Made

1. **Import only the browser client statically:**
```typescript
import { createClient as createBrowserClient } from '@/lib/supabase/client';
// Server client is dynamically imported only when needed
```

2. **Add environment-aware client getter with dynamic import:**
```typescript
private async getClient(): Promise<SupabaseClient> {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Dynamic import to avoid bundling server-only code in client
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    return await createServerClient();
  }
  return createBrowserClient();
}
```

**Why dynamic import?**
- Static imports bundle the entire module into the client code
- `@/lib/supabase/server` imports `next/headers` which only works on the server
- Dynamic imports (`await import()`) load the module only when the code path is executed
- This prevents server-only code from being included in the client bundle

3. **Update all methods to use the dynamic client:**
```typescript
async isAdmin(): Promise<boolean> {
  const supabase = await this.getClient(); // Instead of createClient()
  // ... rest of the method
}
```

## How It Works

- **Server-side (API Routes):** Uses `createServerClient()` which reads cookies from the Next.js request context
- **Client-side (Browser/React):** Uses `createBrowserClient()` which reads from localStorage and cookies
- **Automatic detection:** Checks `typeof window === 'undefined'` to determine environment

## Files Modified

- `src/services/admin/adminAuthService.ts` - Updated to use environment-aware client

## Testing

After this fix:
1. Navigate to `/admin/users` as an admin user
2. The page should load successfully
3. Server logs should show: `✅ AdminAuthService.isAdmin: User found`
4. API should return 200 OK instead of 403 Forbidden

## Impact

This fix applies to all admin authentication checks:
- ✅ `isAdmin()` - Check if user is any admin
- ✅ `isSuperAdmin()` - Check if user is super admin
- ✅ `getAdminUser()` - Get admin user details
- ✅ `getAdminRole()` - Get user's admin role
- ✅ `hasPermission()` - Check specific role permissions

All these methods now work correctly on both client and server.

## Related Files

- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/hooks/useAdminAuth.ts` - Client-side admin auth hook (works with this fix)
- `src/app/api/admin/users/route.ts` - Server API route (now working)

## Common Issues Encountered

### Issue 1: Server-side auth not working (403 Forbidden)
**Symptom:** API returns 403, logs show `userId: undefined`  
**Cause:** Using client-side Supabase client on server  
**Solution:** Use server-side client with `next/headers` cookies

### Issue 2: "next/headers" error in browser
**Error:** `You're importing a component that needs "next/headers". That only works in a Server Component`  
**Cause:** Static import of server-only module in client bundle  
**Solution:** Use dynamic `await import()` for server modules

## Best Practices

For future services that need to work on both client and server:

1. ✅ **DO:** Create environment-aware services like this
2. ✅ **DO:** Use `typeof window === 'undefined'` to detect server
3. ✅ **DO:** Use dynamic imports for server-only modules
4. ✅ **DO:** Test both client and server paths
5. ❌ **DON'T:** Use only client-side Supabase in shared services
6. ❌ **DON'T:** Statically import server-only modules (`next/headers`, etc.)
7. ❌ **DON'T:** Assume environment without checking

## Alternative Approaches Considered

### Option 1: Separate Services (Not chosen)
Create `AdminAuthClientService` and `AdminAuthServerService` - rejected because it duplicates code and requires changing all imports.

### Option 2: Pass Client as Parameter (Not chosen)
```typescript
async isAdmin(supabase: SupabaseClient): Promise<boolean>
```
Rejected because it breaks existing API and makes the service harder to use.

### Option 3: Environment Detection (Chosen ✅)
Automatically detect environment and use appropriate client - cleanest solution that works everywhere without changing existing code.

