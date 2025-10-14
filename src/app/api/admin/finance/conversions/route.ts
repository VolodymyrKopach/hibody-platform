/**
 * Admin Finance API - Conversion Metrics
 * GET /api/admin/finance/conversions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total free users
    const { count: totalFreeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_type', 'free');

    // Get conversions to professional in last 30 days
    const { data: conversions30d } = await supabase
      .from('activity_log')
      .select('user_id, metadata, created_at')
      .eq('action', 'subscription_started')
      .gte('created_at', last30Days.toISOString());

    const { data: conversions7d } = await supabase
      .from('activity_log')
      .select('user_id, metadata, created_at')
      .eq('action', 'subscription_started')
      .gte('created_at', last7Days.toISOString());

    // Calculate conversion counts
    const conversions30dCount = conversions30d?.length || 0;
    const conversions7dCount = conversions7d?.length || 0;

    // For this MVP, we don't have trial system, so:
    // - free_to_paid = direct conversions
    // - trial_to_paid = 0 (no trials yet)
    const freeToPaidCount = conversions30dCount;
    const trialToPaidCount = 0;

    // Calculate rates
    const freeToPaidRate = totalFreeUsers && totalFreeUsers > 0 
      ? (freeToPaidCount / totalFreeUsers) * 100 
      : 0;

    // Conversions by plan
    const conversionsByPlan: Array<{ plan: string; conversions: number }> = [];
    const planMap = new Map<string, number>();

    conversions30d?.forEach((conversion) => {
      const plan = conversion.metadata?.to || 'professional';
      const current = planMap.get(plan) || 0;
      planMap.set(plan, current + 1);
    });

    planMap.forEach((conversions, plan) => {
      conversionsByPlan.push({
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        conversions,
      });
    });

    const metrics = {
      trial_to_paid_rate: 0, // No trials in MVP
      free_to_trial_rate: 0, // No trials in MVP
      free_to_paid_rate: Number(freeToPaidRate.toFixed(1)),
      trial_conversions_30d: 0,
      trial_conversions_7d: 0,
      conversions_by_plan: conversionsByPlan,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching conversion metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

