# Admin Panel - Quick Start Guide 🚀

## Step 1: Run Migration

```bash
# Apply the admin panel migration
supabase db push
```

This creates:
- ✅ `admin_users` table
- ✅ `activity_log` table  
- ✅ `system_metrics` table
- ✅ Helper functions and RLS policies

## Step 2: Create Your First Admin

Find your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

Create super admin:
```sql
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES (
  'your-user-id-from-above',
  'super_admin',
  'your-user-id-from-above'
);
```

## Step 3: Access Admin Panel

Navigate to: **`http://localhost:3000/admin`**

## Features

### Dashboard (`/admin`)
- 📊 Real-time metrics and charts
- 👥 User growth statistics
- 📝 Content creation stats
- 💰 Revenue and subscriptions

### Users (`/admin/users`)
- 🔍 Search and filter users
- 👤 View detailed user profiles
- ⚙️ Manage generation limits
- 🚫 Block/unblock users

### Activity Log (`/admin/activity`)
- 📜 Monitor all platform activities
- 🔎 Filter by action, entity, date
- 👁️ User attribution for each action

## Roles

### Super Admin
- ✅ Full access to all features
- ✅ Can create/manage other admins
- ✅ Can delete users
- ✅ Access to all data

### Admin
- ✅ View dashboard and metrics
- ✅ View users and activity
- ❌ Cannot manage other admins
- ❌ Limited management capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 19, Material-UI
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS

## File Structure

```
src/
├── app/admin/                    # Admin pages
│   ├── page.tsx                 # Dashboard
│   ├── users/page.tsx           # Users list
│   ├── users/[id]/page.tsx      # User detail
│   ├── activity/page.tsx        # Activity log
│   └── layout.tsx               # Admin layout
│
├── components/admin/             # Admin components
│   ├── layout/AdminSidebar.tsx
│   ├── dashboard/MetricsCard.tsx
│   └── users/UsersTable.tsx
│
├── services/admin/               # Admin services
│   ├── adminAuthService.ts
│   ├── metricsService.ts
│   ├── usersService.ts
│   └── activityService.ts
│
└── hooks/
    └── useAdminAuth.ts          # Admin auth hook
```

## Common Tasks

### Add Activity Logging in Your App

```typescript
import { activityService } from '@/services/admin/activityService';

// Log user action
await activityService.logActivity({
  action: 'lesson_created',
  entity_type: 'lesson',
  entity_id: lessonId,
  metadata: { title: 'Lesson Title' }
});
```

### Check Admin Access in Components

```typescript
import { useAdminAuth } from '@/hooks';

const { isAdmin, isSuperAdmin, loading } = useAdminAuth();

if (loading) return <Loading />;
if (!isAdmin) return <Unauthorized />;
```

### Add New Metric to Dashboard

```typescript
// In metricsService.ts
async getMyCustomMetric(): Promise<number> {
  const { count } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}
```

## Troubleshooting

❌ **"Unauthorized: Admin access required"**
```sql
-- Check if you're in admin_users table
SELECT * FROM admin_users WHERE user_id = 'your-user-id';
```

❌ **Metrics showing zero**
- Verify data exists in tables
- Check RLS policies allow admin access

❌ **Charts not displaying**
```bash
# Ensure recharts is installed
npm install recharts
```

## Security

🔐 **Best Practices:**
- Never hardcode admin IDs
- Use RLS policies for data protection
- Enable MFA for admin accounts
- Regularly review admin access
- Audit all admin actions

## Next Steps

1. ✅ Run migration
2. ✅ Create super admin
3. ✅ Access `/admin`
4. 📊 Explore dashboard
5. 👥 Manage users
6. 📝 Check activity logs

## Need Help?

📖 Full documentation: `docs/ADMIN_PANEL_SETUP.md`

---

**Happy Administering! 🎉**

