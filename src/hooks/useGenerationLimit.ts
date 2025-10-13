import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const FREE_GENERATION_LIMIT = 3;
const PRO_GENERATION_LIMIT = 20;

interface GenerationLimitStatus {
  count: number;
  limit: number;
  isPro: boolean;
  canGenerate: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useGenerationLimit = () => {
  const [status, setStatus] = useState<GenerationLimitStatus>({
    count: 0,
    limit: FREE_GENERATION_LIMIT,
    isPro: false,
    canGenerate: true,
    isLoading: true,
    error: null,
  });

  const supabase = createClient();

  // Load current status
  const loadStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('generation_count, subscription_type, subscription_expires_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const isPro = data?.subscription_type === 'pro' && 
        (!data?.subscription_expires_at || new Date(data.subscription_expires_at) > new Date());

      const count = data?.generation_count || 0;
      const limit = isPro ? PRO_GENERATION_LIMIT : FREE_GENERATION_LIMIT;
      const canGenerate = count < limit;

      setStatus({
        count,
        limit,
        isPro,
        canGenerate,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load generation limit:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [supabase]);

  // Increment generation count
  const incrementCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('increment_generation_count', {
        user_id: user.id,
      });

      if (error) throw error;

      await loadStatus();
    } catch (error) {
      console.error('Failed to increment generation count:', error);
      throw error;
    }
  }, [supabase, loadStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    ...status,
    incrementCount,
    refreshStatus: loadStatus,
  };
};

