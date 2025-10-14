/**
 * Admin Finance Service
 * Service for financial analytics and revenue tracking
 */

import { createClient } from '@/lib/supabase/client';
import type {
  RevenueMetrics,
  ChurnMetrics,
  ConversionMetrics,
  SubscriptionMetrics,
  FailedPayment,
  FinancialTrend,
  AdminApiResponse,
} from '@/types/admin';

class FinanceService {
  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      const response = await fetch('/api/admin/finance/revenue');
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      throw error;
    }
  }

  /**
   * Get churn metrics
   */
  async getChurnMetrics(): Promise<ChurnMetrics> {
    try {
      const response = await fetch('/api/admin/finance/churn');
      
      if (!response.ok) {
        throw new Error('Failed to fetch churn metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching churn metrics:', error);
      throw error;
    }
  }

  /**
   * Get conversion metrics
   */
  async getConversionMetrics(): Promise<ConversionMetrics> {
    try {
      const response = await fetch('/api/admin/finance/conversions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversion metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw error;
    }
  }

  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const response = await fetch('/api/admin/finance/subscriptions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription metrics:', error);
      throw error;
    }
  }

  /**
   * Get failed payments
   */
  async getFailedPayments(): Promise<FailedPayment[]> {
    // TODO: Implement with actual payment data
    return [];
  }

  /**
   * Get financial trends
   */
  async getFinancialTrends(days: number = 30): Promise<FinancialTrend[]> {
    try {
      const response = await fetch(`/api/admin/finance/trends?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial trends');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching financial trends:', error);
      throw error;
    }
  }

  /**
   * Retry failed payment
   */
  async retryFailedPayment(paymentId: string): Promise<AdminApiResponse> {
    // TODO: Implement payment retry logic
    return {
      success: true,
      message: 'Payment retry initiated',
    };
  }
}

export const financeService = new FinanceService();

