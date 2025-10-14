/**
 * Admin Finance API - Revenue Metrics
 * GET /api/admin/finance/revenue
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

    // Calculate revenue metrics
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Get total revenue for different periods
    const { data: revenue30d } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', last30Days.toISOString());

    const { data: revenue7d } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', last7Days.toISOString());

    const { data: revenueToday } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    // Calculate totals
    const total30d = revenue30d?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const total7d = revenue7d?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalToday = revenueToday?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Calculate MRR (Monthly Recurring Revenue)
    // For simplicity, using last 30 days revenue
    const mrr = total30d;
    const arr = mrr * 12; // Annual Recurring Revenue

    // Get revenue by plan
    const { data: paymentsByPlan } = await supabase
      .from('payments')
      .select('plan_type, amount')
      .eq('status', 'completed')
      .gte('created_at', last30Days.toISOString());

    const revenueByPlan: Array<{ plan: string; revenue: number }> = [];
    const planMap = new Map<string, number>();

    paymentsByPlan?.forEach((payment) => {
      const plan = payment.plan_type || 'unknown';
      const current = planMap.get(plan) || 0;
      planMap.set(plan, current + Number(payment.amount));
    });

    planMap.forEach((revenue, plan) => {
      revenueByPlan.push({
        plan: plan === 'professional' ? 'Professional' : plan.charAt(0).toUpperCase() + plan.slice(1),
        revenue,
      });
    });

    // Calculate growth rate (compare with previous 30 days)
    const previous60to30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const { data: revenuePrevious30d } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', previous60to30Days.toISOString())
      .lt('created_at', last30Days.toISOString());

    const totalPrevious30d = revenuePrevious30d?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    let mrrGrowthRate = 0;
    let revenueGrowthRate30d = 0;

    if (totalPrevious30d > 0) {
      mrrGrowthRate = ((mrr - totalPrevious30d) / totalPrevious30d) * 100;
      revenueGrowthRate30d = mrrGrowthRate;
    }

    // Projected MRR (simple projection based on current growth)
    const projectedMrr = mrr * (1 + mrrGrowthRate / 100);
    const projectedArr = projectedMrr * 12;

    const metrics = {
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      total_revenue_30d: Math.round(total30d),
      total_revenue_7d: Math.round(total7d),
      revenue_today: Math.round(totalToday),
      mrr_growth_rate: Number(mrrGrowthRate.toFixed(1)),
      revenue_growth_rate_30d: Number(revenueGrowthRate30d.toFixed(1)),
      revenue_by_plan: revenueByPlan,
      projected_mrr: Math.round(projectedMrr),
      projected_arr: Math.round(projectedArr),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

