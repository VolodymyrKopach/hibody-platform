/**
 * Users Service
 * Handles user management operations for admin panel
 */

import { createClient } from '@/lib/supabase/client';
import type { 
  UserListItem, 
  UserDetail, 
  UserFilters, 
  UpdateUserRequest,
  PaginatedResponse 
} from '@/types/admin';

class UsersService {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<UserListItem>> {
    const {
      search = '',
      role = 'all',
      subscription_status = 'all',
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 20,
      offset = 0
    } = filters;

    try {
      // Build query params
      const params = new URLSearchParams({
        search,
        role,
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (subscription_status !== 'all') {
        params.append('subscription_status', subscription_status);
      }
      if (date_from) {
        params.append('date_from', date_from);
      }
      if (date_to) {
        params.append('date_to', date_to);
      }
      if (sort_by) {
        params.append('sort_by', sort_by);
      }
      if (sort_order) {
        params.append('sort_order', sort_order);
      }

      // Call server-side API
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserDetail(userId: string): Promise<UserDetail | null> {
    const supabase = createClient();

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          admin_users!left(role),
          subscriptions!left(*),
          generation_limits!left(*)
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('Error fetching user detail:', error);
        return null;
      }

      // Get counts
      const [lessonsCount, slidesCount, worksheetsCount, aiRequestsCount] = await Promise.all([
        this.getCount('lessons', userId),
        this.getCount('slides', userId),
        this.getCount('worksheets', userId),
        this.getCount('activity_log', userId, { action: ['lesson_created', 'slide_generated'] })
      ]);

      // Get recent activities
      const { data: activities } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get payment info
      const { data: payments } = await supabase
        .from('activity_log')
        .select('metadata')
        .eq('user_id', userId)
        .eq('action', 'payment_succeeded');

      const totalPaid = payments?.reduce((sum, p) => {
        return sum + (p.metadata?.amount || 0);
      }, 0) || 0;

      const lastPayment = payments?.[0]?.metadata?.created_at || null;

      // Get generation limits
      const generationLimit = (user as any).generation_limits?.[0];

      // Get subscription info
      const subscription = (user as any).subscriptions?.[0];

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('activity_log')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        full_name: (user as any).full_name || null,
        phone: (user as any).phone || null,
        avatar_url: (user as any).avatar_url || null,
        created_at: user.created_at,
        last_sign_in_at: (user as any).last_sign_in_at || null,
        is_admin: !!(user as any).admin_users?.role,
        admin_role: (user as any).admin_users?.role || null,
        lessons_count: lessonsCount,
        slides_count: slidesCount,
        worksheets_count: worksheetsCount,
        last_activity_at: lastActivity?.created_at || null,
        subscription_status: subscription?.status || 'free',
        subscription_plan: subscription?.plan || null,
        total_ai_requests: aiRequestsCount,
        generation_limit_used: generationLimit?.used || 0,
        generation_limit_total: generationLimit?.total || 0,
        recent_activities: activities || [],
        total_paid: totalPaid,
        last_payment_at: lastPayment
      };
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<boolean> {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  /**
   * Block/unblock user
   */
  async toggleUserBlock(userId: string, block: boolean): Promise<boolean> {
    const supabase = createClient();

    try {
      // In Supabase, you'd typically use auth.admin.updateUserById
      // This is a placeholder - implement based on your auth setup
      const { error } = await supabase
        .from('users')
        .update({ blocked: block })
        .eq('id', userId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('activity_log')
        .insert({
          action: block ? 'user_blocked' : 'user_unblocked',
          entity_type: 'user',
          entity_id: userId,
          metadata: { blocked: block }
        });

      return true;
    } catch (error) {
      console.error('Error toggling user block:', error);
      return false;
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<boolean> {
    const supabase = createClient();

    try {
      // This should use auth.admin.deleteUser in production
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('activity_log')
        .insert({
          action: 'user_deleted',
          entity_type: 'user',
          entity_id: userId
        });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Update user generation limit
   */
  async updateGenerationLimit(userId: string, newLimit: number): Promise<boolean> {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('generation_limits')
        .upsert({
          user_id: userId,
          total: newLimit,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating generation limit:', error);
      return false;
    }
  }

  /**
   * Get user statistics summary
   */
  async getUserStats(userId: string): Promise<Record<string, number>> {
    const supabase = createClient();

    try {
      const [lessons, slides, worksheets, activities] = await Promise.all([
        this.getCount('lessons', userId),
        this.getCount('slides', userId),
        this.getCount('worksheets', userId),
        this.getCount('activity_log', userId)
      ]);

      return {
        lessons,
        slides,
        worksheets,
        activities
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        lessons: 0,
        slides: 0,
        worksheets: 0,
        activities: 0
      };
    }
  }

  /**
   * Helper: Get count of records for a table
   */
  private async getCount(
    table: string, 
    userId: string, 
    additionalFilters?: Record<string, any>
  ): Promise<number> {
    const supabase = createClient();

    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { count } = await query;
    return count || 0;
  }

  /**
   * Search users by email or name
   */
  async searchUsers(searchTerm: string, limit: number = 10): Promise<UserListItem[]> {
    const result = await this.getUsers({
      search: searchTerm,
      limit,
      offset: 0
    });

    return result.data;
  }
}

// Export singleton instance
export const usersService = new UsersService();

