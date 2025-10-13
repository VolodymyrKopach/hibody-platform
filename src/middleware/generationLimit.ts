/**
 * Generation Limit Middleware
 * 
 * Server-side validation for lesson generation limits.
 * Prevents bypassing frontend checks through direct API calls.
 * 
 * Limits:
 * - Free users: 3 lessons total (no reset)
 * - Pro users: 20 lessons per month (resets monthly)
 * 
 * Usage:
 * ```typescript
 * const limitCheck = await checkGenerationLimit(request);
 * if (!limitCheck.allowed) {
 *   return NextResponse.json({ error: limitCheck.error }, { status: limitCheck.status });
 * }
 * ```
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Generation limits
const FREE_GENERATION_LIMIT = 3;
const PRO_GENERATION_LIMIT = 20;

/**
 * Result of generation limit check
 */
export interface GenerationLimitResult {
  allowed: boolean;
  error?: string;
  status?: number;
  limit: number;
  current: number;
  remaining: number;
  isPro: boolean;
  subscriptionActive: boolean;
  resetDate?: string | null;
}

/**
 * Check if user can generate a new lesson based on their subscription and current usage
 * 
 * @param request - Next.js request object
 * @returns GenerationLimitResult with allowed status and details
 */
export async function checkGenerationLimit(
  request: NextRequest
): Promise<GenerationLimitResult> {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        allowed: false,
        error: 'Authentication required',
        status: 401,
        limit: 0,
        current: 0,
        remaining: 0,
        isPro: false,
        subscriptionActive: false
      };
    }

    // 2. Get user profile with generation data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('generation_count, subscription_type, subscription_expires_at, last_generation_reset')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch user profile:', profileError);
      return {
        allowed: false,
        error: 'User profile not found',
        status: 404,
        limit: 0,
        current: 0,
        remaining: 0,
        isPro: false,
        subscriptionActive: false
      };
    }

    // 3. Check if Pro subscription is active
    const now = new Date();
    const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
    const subscriptionActive = profile.subscription_type === 'pro' && (!expiresAt || expiresAt > now);
    const isPro = subscriptionActive;

    // 4. Determine limit based on subscription
    const limit = isPro ? PRO_GENERATION_LIMIT : FREE_GENERATION_LIMIT;
    const current = profile.generation_count || 0;
    const remaining = Math.max(0, limit - current);

    // 5. Check if limit is reached
    if (current >= limit) {
      // Different messages for Pro vs Free
      const error = isPro
        ? `You've reached your monthly limit of ${limit} lessons. Your limit will reset at the beginning of next month.`
        : `You've reached the free limit of ${limit} lessons. Upgrade to Pro for 20 lessons per month.`;

      return {
        allowed: false,
        error,
        status: 403,
        limit,
        current,
        remaining: 0,
        isPro,
        subscriptionActive,
        resetDate: profile.last_generation_reset
      };
    }

    // 6. All checks passed - user can generate
    return {
      allowed: true,
      limit,
      current,
      remaining,
      isPro,
      subscriptionActive,
      resetDate: profile.last_generation_reset
    };

  } catch (error) {
    console.error('Error checking generation limit:', error);
    return {
      allowed: false,
      error: 'Internal server error while checking generation limit',
      status: 500,
      limit: 0,
      current: 0,
      remaining: 0,
      isPro: false,
      subscriptionActive: false
    };
  }
}

/**
 * Increment generation count for a user
 * Should be called after successful lesson generation
 * 
 * @param userId - User ID to increment count for
 */
export async function incrementGenerationCount(userId: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.rpc('increment_generation_count', {
      user_id: userId
    });

    if (error) {
      console.error('Failed to increment generation count:', error);
      throw error;
    }

    console.log(`✅ Generation count incremented for user ${userId}`);
  } catch (error) {
    console.error('Error incrementing generation count:', error);
    throw error;
  }
}

/**
 * Get current generation usage for a user
 * Useful for analytics and monitoring
 * 
 * @param userId - User ID to get usage for
 */
export async function getGenerationUsage(userId: string) {
  try {
    const supabase = await createClient();
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('generation_count, subscription_type, subscription_expires_at, last_generation_reset')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw error || new Error('Profile not found');
    }

    const isPro = profile.subscription_type === 'pro' && 
      (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
    
    const limit = isPro ? PRO_GENERATION_LIMIT : FREE_GENERATION_LIMIT;
    const current = profile.generation_count || 0;

    return {
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isPro,
      lastReset: profile.last_generation_reset
    };
  } catch (error) {
    console.error('Error getting generation usage:', error);
    throw error;
  }
}

