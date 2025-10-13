/**
 * Admin Activity Logs API
 * Server-side endpoint for fetching activity logs with user data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer } from '@/lib/supabase/adminHelpers';
import type { ActivityLogFilters } from '@/types/admin';

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
    
    // Parse filters from query params
    const filters: ActivityLogFilters = {
      user_id: searchParams.get('user_id') || undefined,
      action: searchParams.get('action') || undefined,
      entity_type: searchParams.get('entity_type') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Use regular client for activity_log queries
    const supabase = await createClient();
    // Use admin client for user data
    const adminSupabase = createAdminClient();

    // Build query
    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(
      (data || [])
        .map(log => log.user_id)
        .filter(id => id !== null)
    )] as string[];

    // Fetch user data separately via admin API
    const usersMap = new Map<string, { email?: string; full_name?: string }>();
    
    if (userIds.length > 0) {
      try {
        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers();
        
        if (!usersError && users) {
          users.forEach(user => {
            if (userIds.includes(user.id)) {
              usersMap.set(user.id, {
                email: user.email,
                full_name: user.user_metadata?.full_name
              });
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch user data:', err);
      }
    }

    // Transform data to include user information
    const activities = (data || []).map((activity: any) => {
      const userData = activity.user_id ? usersMap.get(activity.user_id) : undefined;
      
      return {
        id: activity.id,
        user_id: activity.user_id,
        action: activity.action,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        metadata: activity.metadata || {},
        ip_address: activity.ip_address,
        user_agent: activity.user_agent,
        created_at: activity.created_at,
        user_email: userData?.email,
        user_full_name: userData?.full_name
      };
    });

    return NextResponse.json({
      data: activities,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in admin activity API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

