# Admin Panel Setup Guide

Complete guide for setting up and using the TeachSpark Admin Panel.

## 📋 Overview

The Admin Panel provides comprehensive tools for managing users, monitoring platform activity, and viewing system metrics.

### Features

- **Dashboard**: Real-time metrics and charts showing platform performance
- **User Management**: View, search, and manage all platform users
- **Activity Log**: Monitor all user activities across the platform
- **Content Overview**: View lessons and worksheets created by users
- **Role-Based Access**: Admin and Super Admin roles with different permissions

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

This will install `recharts` for charts visualization and other required dependencies.

### 2. Run Database Migration

Run the admin panel migration to create necessary tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply the migration file
# supabase/migrations/20251013_admin_panel_schema.sql
```

This creates:
- `admin_users` - Admin access control
- `activity_log` - Activity tracking
- `system_metrics` - Aggregated metrics

### 3. Create First Super Admin

After running the migration, you need to manually create your first super admin user:

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project → SQL Editor
2. Run this query (replace with your user ID):

```sql
INSERT INTO public.admin_users (user_id, role, created_by)
VALUES (
  'your-user-id-here',
  'super_admin',
  'your-user-id-here'
);
```

To find your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

**Option B: Using Supabase Client**

Create a script or use the Supabase client:

```typescript
const { data, error } = await supabase
  .from('admin_users')
  .insert({
    user_id: 'your-user-id',
    role: 'super_admin',
    created_by: 'your-user-id'
  });
```

## 🔐 Access Control

### Roles

1. **Super Admin**
   - Full access to all features
   - Can create/manage other admins
   - Can view and modify all data
   - Can delete users

2. **Admin**
   - View dashboard and metrics
   - View users and activity logs
   - Limited management capabilities
   - Cannot manage other admins

### Checking Access

The admin panel automatically checks access on every page using the `useAdminAuth` hook:

```typescript
import { useAdminAuth } from '@/hooks';

const { isAdmin, isSuperAdmin, adminUser, loading } = useAdminAuth();
```

## 📊 Features

### Dashboard

**Location**: `/admin`

Displays:
- Total users and growth rate
- Active users (7d and 30d)
- Content creation stats (lessons, slides, worksheets)
- AI usage metrics
- Revenue and subscription data
- Interactive charts for trend analysis

### User Management

**Location**: `/admin/users`

Features:
- Searchable and filterable user list
- Filter by role (admin/user) and subscription status
- View detailed user information
- Edit generation limits
- Block/unblock users
- Delete users (Super Admin only)

**User Detail Page**: `/admin/users/[id]`
- Complete user profile
- Activity statistics
- Recent activity history
- Generation limit management
- Payment history

### Activity Log

**Location**: `/admin/activity`

Features:
- Real-time activity monitoring
- Filter by action type, entity, and date range
- Paginated view of all activities
- User attribution for each action
- Detailed metadata for each event

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin layout with sidebar
│       ├── page.tsx                # Dashboard
│       ├── users/
│       │   ├── page.tsx           # Users list
│       │   └── [id]/page.tsx      # User detail
│       ├── activity/
│       │   └── page.tsx           # Activity log
│       ├── lessons/page.tsx        # Lessons management
│       ├── worksheets/page.tsx     # Worksheets management
│       └── settings/page.tsx       # Settings
│
├── components/
│   └── admin/
│       ├── layout/
│       │   └── AdminSidebar.tsx
│       ├── dashboard/
│       │   ├── MetricsCard.tsx
│       │   └── ActivityChart.tsx
│       └── users/
│           └── UsersTable.tsx
│
├── services/
│   └── admin/
│       ├── adminAuthService.ts    # Auth verification
│       ├── metricsService.ts      # Metrics collection
│       ├── usersService.ts        # User management
│       └── activityService.ts     # Activity logging
│
├── hooks/
│   └── useAdminAuth.ts            # Admin auth hook
│
└── types/
    └── admin.ts                   # TypeScript types
```

### Adding Activity Logging

To log user activities in your app:

```typescript
import { activityService } from '@/services/admin/activityService';

// Log an activity
await activityService.logActivity({
  action: 'lesson_created',
  entity_type: 'lesson',
  entity_id: lessonId,
  metadata: {
    title: 'My Lesson',
    age_group: '6-7'
  }
});
```

Common actions:
- `login`, `logout`, `register`, `failed_login`
- `lesson_created`, `lesson_updated`, `lesson_deleted`
- `slide_generated`
- `worksheet_created`, `worksheet_updated`
- `payment_succeeded`, `payment_failed`
- `subscription_started`, `subscription_cancelled`

### Extending the Admin Panel

**Add a new metrics card:**

```typescript
<MetricsCard
  title="Custom Metric"
  value={formatNumber(metrics?.custom_metric || 0)}
  change="+10% this week"
  changeType="positive"
  icon={<CustomIcon />}
  loading={loading}
/>
```

**Add a new service method:**

```typescript
// In metricsService.ts
async getCustomMetric(): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('custom_table')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}
```

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Permissions

The admin panel uses Row Level Security (RLS) policies. Ensure:

1. Admin users table is only accessible by admins
2. Activity log is readable by admins, writable by all authenticated users
3. System metrics are only accessible by admins

## 📱 Usage

### Accessing the Admin Panel

1. Log in to your account
2. Ensure your user ID is in the `admin_users` table
3. Navigate to `/admin`
4. You'll see the dashboard with all metrics

### Managing Users

1. Go to **Users** section
2. Use search and filters to find users
3. Click on a user to view details
4. Use action buttons to manage users

### Monitoring Activity

1. Go to **Activity** section
2. Filter by date range, action type, or entity
3. View detailed activity logs with user information

### Viewing Metrics

1. Dashboard shows real-time metrics
2. Charts display trends over the last 30 days
3. Refresh data using the refresh button

## 🐛 Troubleshooting

### "Unauthorized: Admin access required"

**Solution**: Verify your user ID is in the `admin_users` table:

```sql
SELECT * FROM public.admin_users WHERE user_id = 'your-user-id';
```

### Metrics showing zero

**Solution**: Check if data exists in the respective tables and ensure RLS policies allow admin access.

### Charts not displaying

**Solution**: 
1. Ensure `recharts` is installed: `npm install recharts`
2. Check browser console for errors
3. Verify data is being returned from the API

## 🔐 Security Best Practices

1. **Never hardcode admin user IDs** - Always use the database
2. **Use RLS policies** - Protect admin data at the database level
3. **Audit admin actions** - Log all administrative actions
4. **Regular access reviews** - Periodically review who has admin access
5. **Use strong authentication** - Enable MFA for admin accounts

## 📈 Performance

The admin panel is optimized for performance:

- **Pagination**: All lists are paginated (20-50 items per page)
- **Lazy loading**: Charts and data load on demand
- **Caching**: Metrics are cached where appropriate
- **Debouncing**: Search inputs are debounced to reduce API calls

## 🚀 Deployment

When deploying to production:

1. Run database migrations
2. Create super admin user
3. Test admin access
4. Monitor error logs
5. Set up alerts for critical metrics

## 📝 Future Enhancements

Planned features:
- Export data to CSV/Excel
- Email notifications for admins
- Advanced analytics and reporting
- Bulk user operations
- Custom date ranges for metrics
- Real-time updates with WebSocket

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check Supabase logs for errors
4. Contact the development team

---

**Last Updated**: October 13, 2025
**Version**: 1.0.0

