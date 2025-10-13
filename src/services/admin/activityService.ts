/**
 * Activity Service
 * Handles activity logging and retrieval for admin panel
 */

import { createClient } from '@/lib/supabase/client';
import type { 
  ActivityLog, 
  ActivityLogFilters, 
  CreateActivityLogRequest,
  PaginatedResponse 
} from '@/types/admin';

class ActivityService {
  /**
   * Get paginated activity logs with filters
   */
  async getActivityLogs(
    filters: ActivityLogFilters = {}
  ): Promise<PaginatedResponse<ActivityLog>> {
    const {
      user_id,
      action,
      entity_type,
      date_from,
      date_to,
      limit = 50,
      offset = 0
    } = filters;

    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (user_id) params.append('user_id', user_id);
      if (action) params.append('action', action);
      if (entity_type) params.append('entity_type', entity_type);
      if (date_from) params.append('date_from', date_from);
      if (date_to) params.append('date_to', date_to);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      // Call API endpoint
      const response = await fetch(`/api/admin/activity?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get recent activities for a specific user
   */
  async getUserActivities(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    const result = await this.getActivityLogs({
      user_id: userId,
      limit,
      offset: 0
    });

    return result.data;
  }

  /**
   * Log a new activity
   */
  async logActivity(activity: CreateActivityLogRequest): Promise<string | null> {
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id || null,
          action: activity.action,
          entity_type: activity.entity_type || null,
          entity_id: activity.entity_id || null,
          metadata: activity.metadata || {},
          ip_address: activity.ip_address || null,
          user_agent: activity.user_agent || null
        })
        .select('id')
        .single();

      if (error) throw error;

      return data?.id || null;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days: number = 30): Promise<Record<string, number>> {
    const supabase = createClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('action')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Count activities by action
      const stats = (data || []).reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {};
    }
  }

  /**
   * Get most active users
   */
  async getMostActiveUsers(limit: number = 10): Promise<Array<{ user_id: string; activity_count: number }>> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('user_id')
        .not('user_id', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Count activities per user
      const userActivityCount = (data || []).reduce((acc, log) => {
        if (log.user_id) {
          acc[log.user_id] = (acc[log.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Sort and get top users
      const topUsers = Object.entries(userActivityCount)
        .map(([user_id, activity_count]) => ({ user_id, activity_count }))
        .sort((a, b) => b.activity_count - a.activity_count)
        .slice(0, limit);

      return topUsers;
    } catch (error) {
      console.error('Error fetching most active users:', error);
      return [];
    }
  }

  /**
   * Get activity timeline (grouped by date)
   */
  async getActivityTimeline(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const supabase = createClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group by date
      const timeline = (data || []).reduce((acc, log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort
      return Object.entries(timeline)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      return [];
    }
  }

  /**
   * Delete old activity logs (for cleanup)
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const supabase = createClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return 0;
    }
  }

  /**
   * Get failed login attempts
   */
  async getFailedLoginAttempts(hours: number = 24): Promise<ActivityLog[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const result = await this.getActivityLogs({
      action: 'failed_login',
      date_from: startDate.toISOString(),
      limit: 100
    });

    return result.data;
  }

  /**
   * Get activity summary for dashboard
   */
  async getActivitySummary(): Promise<{
    today: number;
    yesterday: number;
    this_week: number;
    this_month: number;
  }> {
    const supabase = createClient();

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setDate(thisMonth.getDate() - 30);

      const [todayCount, yesterdayCount, weekCount, monthCount] = await Promise.all([
        this.getActivityCount(today.toISOString()),
        this.getActivityCount(yesterday.toISOString(), today.toISOString()),
        this.getActivityCount(thisWeek.toISOString()),
        this.getActivityCount(thisMonth.toISOString())
      ]);

      return {
        today: todayCount,
        yesterday: yesterdayCount,
        this_week: weekCount,
        this_month: monthCount
      };
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      return {
        today: 0,
        yesterday: 0,
        this_week: 0,
        this_month: 0
      };
    }
  }

  /**
   * Helper: Get activity count for date range
   */
  private async getActivityCount(dateFrom: string, dateTo?: string): Promise<number> {
    const supabase = createClient();

    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFrom);

    if (dateTo) {
      query = query.lt('created_at', dateTo);
    }

    const { count } = await query;
    return count || 0;
  }
}

// Export singleton instance
export const activityService = new ActivityService();

