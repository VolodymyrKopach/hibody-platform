/**
 * Token Tracking Service
 * Track AI token usage and calculate costs based on pricing table
 */

import { createClient } from '@/lib/supabase/client';

export interface TokenUsageData {
  userId: string;
  serviceName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  metadata?: Record<string, any>;
}

export interface TokenStats {
  totalTokens: number;
  totalCost: number;
}

class TokenTrackingService {
  /**
   * Track token usage for an AI API call
   */
  async trackTokenUsage(data: TokenUsageData): Promise<void> {
    try {
      const supabase = createClient();

      // Get pricing for the model
      const { data: pricing, error: pricingError } = await supabase
        .from('ai_model_pricing')
        .select('input_price_per_1m, output_price_per_1m')
        .eq('model_name', data.model)
        .eq('is_active', true)
        .order('valid_from', { ascending: false })
        .limit(1)
        .single();

      if (pricingError || !pricing) {
        console.error('No pricing found for model:', data.model, pricingError);
        // Still track tokens even without pricing
        const { error } = await supabase
          .from('token_usage')
          .insert({
            user_id: data.userId,
            service_name: data.serviceName,
            model: data.model,
            input_tokens: data.inputTokens,
            output_tokens: data.outputTokens,
            input_cost: 0,
            output_cost: 0,
            request_metadata: data.metadata || {}
          });

        if (error) {
          console.error('Error tracking token usage (no pricing):', error);
        }
        return;
      }

      // Calculate costs (pricing is per 1M tokens)
      const inputCost = (data.inputTokens / 1_000_000) * pricing.input_price_per_1m;
      const outputCost = (data.outputTokens / 1_000_000) * pricing.output_price_per_1m;

      // Insert token usage
      const { error } = await supabase
        .from('token_usage')
        .insert({
          user_id: data.userId,
          service_name: data.serviceName,
          model: data.model,
          input_tokens: data.inputTokens,
          output_tokens: data.outputTokens,
          input_cost: inputCost,
          output_cost: outputCost,
          request_metadata: data.metadata || {}
        });

      if (error) {
        console.error('Error tracking token usage:', error);
      } else {
        console.log('✅ Token usage tracked:', {
          service: data.serviceName,
          tokens: data.inputTokens + data.outputTokens,
          cost: (inputCost + outputCost).toFixed(6)
        });
      }
    } catch (error) {
      console.error('Error in trackTokenUsage:', error);
    }
  }

  /**
   * Get token usage statistics for a user
   */
  async getUserTokenStats(userId: string): Promise<TokenStats> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('token_usage')
        .select('total_tokens, total_cost')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user token stats:', error);
        return { totalTokens: 0, totalCost: 0 };
      }

      const totalTokens = data?.reduce((sum, row) => sum + (row.total_tokens || 0), 0) || 0;
      const totalCost = data?.reduce((sum, row) => sum + (row.total_cost || 0), 0) || 0;

      return { totalTokens, totalCost };
    } catch (error) {
      console.error('Error in getUserTokenStats:', error);
      return { totalTokens: 0, totalCost: 0 };
    }
  }

  /**
   * Get token usage breakdown by service for a user
   */
  async getUserTokenBreakdown(userId: string): Promise<Record<string, TokenStats>> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('token_usage')
        .select('service_name, total_tokens, total_cost')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching token breakdown:', error);
        return {};
      }

      const breakdown: Record<string, TokenStats> = {};

      data?.forEach((row) => {
        const serviceName = row.service_name;
        if (!breakdown[serviceName]) {
          breakdown[serviceName] = { totalTokens: 0, totalCost: 0 };
        }
        breakdown[serviceName].totalTokens += row.total_tokens || 0;
        breakdown[serviceName].totalCost += row.total_cost || 0;
      });

      return breakdown;
    } catch (error) {
      console.error('Error in getUserTokenBreakdown:', error);
      return {};
    }
  }

  /**
   * Get platform-wide token usage statistics
   */
  async getPlatformTokenStats(): Promise<TokenStats> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('token_usage')
        .select('total_tokens, total_cost');

      if (error) {
        console.error('Error fetching platform token stats:', error);
        return { totalTokens: 0, totalCost: 0 };
      }

      const totalTokens = data?.reduce((sum, row) => sum + (row.total_tokens || 0), 0) || 0;
      const totalCost = data?.reduce((sum, row) => sum + (row.total_cost || 0), 0) || 0;

      return { totalTokens, totalCost };
    } catch (error) {
      console.error('Error in getPlatformTokenStats:', error);
      return { totalTokens: 0, totalCost: 0 };
    }
  }
}

// Export singleton instance
export const tokenTrackingService = new TokenTrackingService();

