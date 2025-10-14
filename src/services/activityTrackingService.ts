/**
 * Activity Tracking Service
 * Client-side service for tracking user actions
 */

import { createClient } from '@/lib/supabase/client';

export interface TrackActivityParams {
  action: string;
  entityType?: string;
  entityId?: string; // TEXT in database (not UUID)
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export type ActivityAction =
  | 'lesson_created'
  | 'lesson_updated'
  | 'lesson_deleted'
  | 'slide_generated'
  | 'slide_updated'
  | 'slide_deleted'
  | 'worksheet_created'
  | 'worksheet_updated'
  | 'worksheet_deleted'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'subscription_renewed'
  | 'login'
  | 'logout'
  | 'registration'
  | 'chat_message_sent'
  | 'ai_request_completed';

export type EntityType = 
  | 'lesson'
  | 'slide'
  | 'worksheet'
  | 'payment'
  | 'subscription'
  | 'chat_session'
  | 'user';

class ActivityTrackingService {
  /**
   * Track a user action
   */
  async trackAction(params: TrackActivityParams): Promise<string | null> {
    const supabase = createClient();

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn('No user found for activity tracking');
        return null;
      }

      // Get request metadata
      const ipAddress = params.ipAddress || this.getClientIP();
      const userAgent = params.userAgent || this.getUserAgent();

      // Insert activity log
      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action: params.action,
          entity_type: params.entityType || null,
          entity_id: params.entityId || null,
          metadata: params.metadata || {},
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking activity:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in trackAction:', error);
      return null;
    }
  }

  /**
   * Track lesson creation
   */
  async trackLessonCreated(
    lessonId: string,
    metadata: {
      subject: string;
      ageGroup: string;
      duration?: number;
      title: string;
    }
  ): Promise<void> {
    await this.trackAction({
      action: 'lesson_created',
      entityType: 'lesson',
      entityId: lessonId,
      metadata,
    });
  }

  /**
   * Track slide generation
   */
  async trackSlideGenerated(
    slideId: string,
    metadata: {
      lessonId: string;
      type: string;
      title: string;
      slideNumber: number;
    }
  ): Promise<void> {
    await this.trackAction({
      action: 'slide_generated',
      entityType: 'slide',
      entityId: slideId,
      metadata,
    });
  }

  /**
   * Track worksheet creation
   */
  async trackWorksheetCreated(
    worksheetId: string,
    metadata: {
      type: string;
      ageGroup: string;
      title: string;
    }
  ): Promise<void> {
    await this.trackAction({
      action: 'worksheet_created',
      entityType: 'worksheet',
      entityId: worksheetId,
      metadata,
    });
  }

  /**
   * Track chat message
   */
  async trackChatMessage(
    sessionId: string,
    metadata: {
      messageLength: number;
      sender: 'user' | 'ai';
    }
  ): Promise<void> {
    await this.trackAction({
      action: 'chat_message_sent',
      entityType: 'chat_session',
      entityId: sessionId,
      metadata,
    });
  }

  /**
   * Track AI request
   */
  async trackAIRequest(metadata: {
    model: string;
    tokensUsed?: number;
    responseTimeMs?: number;
    requestType: string;
  }): Promise<void> {
    await this.trackAction({
      action: 'ai_request_completed',
      metadata,
    });
  }

  /**
   * Track payment
   */
  async trackPayment(
    paymentId: string,
    metadata: {
      amount: number;
      currency: string;
      plan: string;
      generations: number;
    }
  ): Promise<void> {
    await this.trackAction({
      action: 'payment_succeeded',
      entityType: 'payment',
      entityId: paymentId,
      metadata,
    });
  }

  /**
   * Track subscription change
   */
  async trackSubscriptionChange(metadata: {
    from: string;
    to: string;
    reason: string;
  }): Promise<void> {
    await this.trackAction({
      action: 'subscription_started',
      entityType: 'subscription',
      metadata,
    });
  }

  /**
   * Track user login
   */
  async trackLogin(): Promise<void> {
    await this.trackAction({
      action: 'login',
      entityType: 'user',
    });
  }

  /**
   * Track user logout
   */
  async trackLogout(): Promise<void> {
    await this.trackAction({
      action: 'logout',
      entityType: 'user',
    });
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(limit: number = 20) {
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserActivity:', error);
      return [];
    }
  }

  /**
   * Get activity stats for current user
   */
  async getUserStats(periodType: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_activity_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', periodType)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }

  /**
   * Helper: Get client IP (best effort)
   */
  private getClientIP(): string {
    // This is client-side, so we can't reliably get IP
    // IP will be captured on server-side API calls
    return 'client-unknown';
  }

  /**
   * Helper: Get user agent
   */
  private getUserAgent(): string {
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.userAgent;
    }
    return 'unknown';
  }
}

export const activityTrackingService = new ActivityTrackingService();


