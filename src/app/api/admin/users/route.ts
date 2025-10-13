/**
 * Admin Users API
 * Server-side endpoint for managing users with admin access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer } from '@/lib/supabase/adminHelpers';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use admin client for auth.admin operations
    const adminSupabase = createAdminClient();
    // Use regular client for other operations
    const supabase = await createClient();

    // Get all users from auth.users (requires service role)
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers({
      page: Math.floor(offset / limit) + 1,
      perPage: limit
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get admin roles
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, role');

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
    }

    // Create a map for quick lookup
    const adminRolesMap = new Map(
      (adminUsers || []).map(admin => [admin.user_id, admin.role])
    );

    // Get user stats (lessons, slides, worksheets counts)
    const userIds = authUsers?.map(u => u.id) || [];
    
    const [lessonsCount, slidesCount, worksheetsCount] = await Promise.all([
      getCountsByUser(supabase, 'lessons', userIds),
      getCountsByUser(supabase, 'slides', userIds),
      getCountsByUser(supabase, 'worksheets', userIds)
    ]);

    // Transform users data
    const users = (authUsers || []).map(user => {
      const adminRole = adminRolesMap.get(user.id);
      
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_admin: !!adminRole,
        admin_role: adminRole || null,
        lessons_count: lessonsCount.get(user.id) || 0,
        slides_count: slidesCount.get(user.id) || 0,
        worksheets_count: worksheetsCount.get(user.id) || 0,
        last_activity_at: user.last_sign_in_at,
        subscription_status: 'free', // TODO: get from subscriptions table
        subscription_plan: null
      };
    });

    // Apply filters
    let filteredUsers = users;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (role !== 'all') {
      if (role === 'user') {
        filteredUsers = filteredUsers.filter(user => !user.is_admin);
      } else {
        filteredUsers = filteredUsers.filter(user => user.admin_role === role);
      }
    }

    // Get total count
    const total = filteredUsers.length;

    return NextResponse.json({
      data: filteredUsers,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get counts by user
 */
async function getCountsByUser(
  supabase: any,
  table: string,
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from(table)
    .select('user_id')
    .in('user_id', userIds);

  if (error) {
    console.error(`Error fetching ${table} counts:`, error);
    return new Map();
  }

  // Count by user_id
  const counts = new Map<string, number>();
  (data || []).forEach((row: any) => {
    const userId = row.user_id;
    counts.set(userId, (counts.get(userId) || 0) + 1);
  });

  return counts;
}

