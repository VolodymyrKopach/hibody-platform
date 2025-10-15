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
    try {
      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch user detail: ${response.statusText}`);
      }

      const userDetail = await response.json();
      return userDetail;
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
   * Make user an admin
   */
  async makeAdmin(userId: string, role: 'admin' | 'super_admin'): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/users/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to make user admin');
      }

      return true;
    } catch (error) {
      console.error('Error making user admin:', error);
      return false;
    }
  }

  /**
   * Remove admin role from user
   */
  async removeAdmin(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/users/remove-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove admin');
      }

      return true;
    } catch (error) {
      console.error('Error removing admin:', error);
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

