/**
 * Metrics Service
 * Handles fetching and calculating system metrics for admin dashboard
 */

import { createClient } from '@/lib/supabase/client';
import type { DashboardMetrics, MetricsChartData, MetricTrend } from '@/types/admin';

class MetricsService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = createClient();
    
    try {
      const [
        userMetrics,
        contentMetrics,
        aiMetrics,
        revenueMetrics,
        subscriptionMetrics,
        growthMetrics
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getContentMetrics(),
        this.getAIMetrics(),
        this.getRevenueMetrics(),
        this.getSubscriptionMetrics(),
        this.getGrowthMetrics()
      ]);

      return {
        ...userMetrics,
        ...contentMetrics,
        ...aiMetrics,
        ...revenueMetrics,
        ...subscriptionMetrics,
        ...growthMetrics
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get user-related metrics
   */
  private async getUserMetrics() {
    const supabase = createClient();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total users
    const { count: total_users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active users (7 days)
    const { count: active_users_7d } = await supabase
      .from('activity_log')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('user_id', 'is', null);

    // Active users (30 days)
    const { count: active_users_30d } = await supabase
      .from('activity_log')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('user_id', 'is', null);

    // New registrations
    const { count: new_registrations_today } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: new_registrations_7d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: new_registrations_30d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      total_users: total_users || 0,
      active_users_7d: active_users_7d || 0,
      active_users_30d: active_users_30d || 0,
      new_registrations_today: new_registrations_today || 0,
      new_registrations_7d: new_registrations_7d || 0,
      new_registrations_30d: new_registrations_30d || 0
    };
  }

  /**
   * Get content-related metrics
   */
  private async getContentMetrics() {
    const supabase = createClient();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Lessons
    const { count: total_lessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    const { count: lessons_created_today } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: lessons_created_7d } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: lessons_created_30d } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Slides
    const { count: total_slides } = await supabase
      .from('slides')
      .select('*', { count: 'exact', head: true });

    const { count: slides_generated_today } = await supabase
      .from('slides')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: slides_generated_7d } = await supabase
      .from('slides')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Worksheets
    const { count: total_worksheets } = await supabase
      .from('worksheets')
      .select('*', { count: 'exact', head: true });

    const { count: worksheets_created_today } = await supabase
      .from('worksheets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: worksheets_created_7d } = await supabase
      .from('worksheets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return {
      total_lessons: total_lessons || 0,
      lessons_created_today: lessons_created_today || 0,
      lessons_created_7d: lessons_created_7d || 0,
      lessons_created_30d: lessons_created_30d || 0,
      total_slides: total_slides || 0,
      slides_generated_today: slides_generated_today || 0,
      slides_generated_7d: slides_generated_7d || 0,
      total_worksheets: total_worksheets || 0,
      worksheets_created_today: worksheets_created_today || 0,
      worksheets_created_7d: worksheets_created_7d || 0
    };
  }

  /**
   * Get AI usage metrics
   */
  private async getAIMetrics() {
    const supabase = createClient();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: ai_requests_today } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .in('action', ['lesson_created', 'slide_generated'])
      .gte('created_at', today.toISOString());

    const { count: ai_requests_7d } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .in('action', ['lesson_created', 'slide_generated'])
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: ai_requests_30d } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .in('action', ['lesson_created', 'slide_generated'])
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      ai_requests_today: ai_requests_today || 0,
      ai_requests_7d: ai_requests_7d || 0,
      ai_requests_30d: ai_requests_30d || 0
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics() {
    const supabase = createClient();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get payment events from activity log
    const { data: payments } = await supabase
      .from('activity_log')
      .select('metadata')
      .eq('action', 'payment_succeeded');

    const total_revenue = payments?.reduce((sum, p) => {
      return sum + (p.metadata?.amount || 0);
    }, 0) || 0;

    const revenue_today = payments?.filter(p => {
      const date = new Date(p.metadata?.created_at);
      return date >= today;
    }).reduce((sum, p) => sum + (p.metadata?.amount || 0), 0) || 0;

    const revenue_7d = payments?.filter(p => {
      const date = new Date(p.metadata?.created_at);
      return date >= sevenDaysAgo;
    }).reduce((sum, p) => sum + (p.metadata?.amount || 0), 0) || 0;

    const revenue_30d = payments?.filter(p => {
      const date = new Date(p.metadata?.created_at);
      return date >= thirtyDaysAgo;
    }).reduce((sum, p) => sum + (p.metadata?.amount || 0), 0) || 0;

    // Calculate MRR (Monthly Recurring Revenue)
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('price')
      .eq('status', 'active');

    const mrr = activeSubscriptions?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    return {
      total_revenue,
      revenue_today,
      revenue_7d,
      revenue_30d,
      mrr
    };
  }

  /**
   * Get subscription metrics
   */
  private async getSubscriptionMetrics() {
    const supabase = createClient();

    const { count: total_subscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: active_subscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: trial_users } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trialing');

    const { count: paid_users } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .not('trial_end', 'is', null);

    return {
      total_subscriptions: total_subscriptions || 0,
      active_subscriptions: active_subscriptions || 0,
      trial_users: trial_users || 0,
      paid_users: paid_users || 0
    };
  }

  /**
   * Get growth rate metrics
   */
  private async getGrowthMetrics() {
    const supabase = createClient();
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // User growth
    const { count: users_7d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: users_prev_7d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString());

    const user_growth_rate_7d = users_prev_7d 
      ? ((users_7d || 0) - (users_prev_7d || 0)) / users_prev_7d * 100
      : 0;

    const { count: users_30d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: users_prev_30d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    const user_growth_rate_30d = users_prev_30d
      ? ((users_30d || 0) - (users_prev_30d || 0)) / users_prev_30d * 100
      : 0;

    // Revenue growth (placeholder - implement based on actual payment data)
    const revenue_growth_rate_30d = 0;

    return {
      user_growth_rate_7d,
      user_growth_rate_30d,
      revenue_growth_rate_30d
    };
  }

  /**
   * Get chart data for dashboard visualizations
   */
  async getChartsData(days: number = 30): Promise<MetricsChartData> {
    const supabase = createClient();
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const [
        userGrowth,
        lessonCreation,
        revenue,
        aiUsage
      ] = await Promise.all([
        this.getUserGrowthTrend(startDate, endDate),
        this.getLessonCreationTrend(startDate, endDate),
        this.getRevenueTrend(startDate, endDate),
        this.getAIUsageTrend(startDate, endDate)
      ]);

      return {
        user_growth: userGrowth,
        lesson_creation: lessonCreation,
        revenue,
        ai_usage: aiUsage
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  /**
   * Get user growth trend
   */
  private async getUserGrowthTrend(startDate: Date, endDate: Date): Promise<MetricTrend[]> {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    return this.aggregateByDate(data || [], 'created_at');
  }

  /**
   * Get lesson creation trend
   */
  private async getLessonCreationTrend(startDate: Date, endDate: Date): Promise<MetricTrend[]> {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('lessons')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    return this.aggregateByDate(data || [], 'created_at');
  }

  /**
   * Get revenue trend
   */
  private async getRevenueTrend(startDate: Date, endDate: Date): Promise<MetricTrend[]> {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('activity_log')
      .select('created_at, metadata')
      .eq('action', 'payment_succeeded')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    const dailyRevenue = (data || []).reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const amount = item.metadata?.amount || 0;
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyRevenue).map(([date, value]) => ({
      date,
      value
    }));
  }

  /**
   * Get AI usage trend
   */
  private async getAIUsageTrend(startDate: Date, endDate: Date): Promise<MetricTrend[]> {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('activity_log')
      .select('created_at')
      .in('action', ['lesson_created', 'slide_generated'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    return this.aggregateByDate(data || [], 'created_at');
  }

  /**
   * Helper: Aggregate data by date
   */
  private aggregateByDate(data: any[], dateField: string): MetricTrend[] {
    const dailyCounts = data.reduce((acc, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyCounts).map(([date, value]) => ({
      date,
      value
    }));
  }
}

// Export singleton instance
export const metricsService = new MetricsService();

