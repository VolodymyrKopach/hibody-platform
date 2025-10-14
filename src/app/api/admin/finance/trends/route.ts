/**
 * Admin Finance API - Financial Trends
 * GET /api/admin/finance/trends?days=30
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

    // Get days parameter from query
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all payments in the period
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get subscription changes per day
    const { data: subscriptions } = await supabase
      .from('activity_log')
      .select('action, created_at')
      .in('action', ['subscription_started', 'subscription_cancelled'])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const trends = new Map<string, any>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      trends.set(dateStr, {
        date: dateStr,
        mrr: 0,
        revenue: 0,
        new_subscriptions: 0,
        cancelled_subscriptions: 0,
        net_revenue: 0,
      });
    }

    // Add payment data
    payments?.forEach((payment) => {
      const dateStr = payment.created_at.split('T')[0];
      const trend = trends.get(dateStr);
      
      if (trend) {
        trend.revenue += Number(payment.amount);
        trend.net_revenue += Number(payment.amount);
      }
    });

    // Add subscription data
    subscriptions?.forEach((sub) => {
      const dateStr = sub.created_at.split('T')[0];
      const trend = trends.get(dateStr);
      
      if (trend) {
        if (sub.action === 'subscription_started') {
          trend.new_subscriptions++;
          trend.mrr += 9; // $9 per subscription
        } else if (sub.action === 'subscription_cancelled') {
          trend.cancelled_subscriptions++;
          trend.mrr -= 9;
        }
      }
    });

    // Calculate cumulative MRR
    let cumulativeMrr = 0;
    const trendsArray = Array.from(trends.values());

    trendsArray.forEach((trend) => {
      cumulativeMrr += trend.mrr;
      trend.mrr = Math.round(cumulativeMrr);
      trend.revenue = Math.round(trend.revenue);
      trend.net_revenue = Math.round(trend.net_revenue);
    });

    return NextResponse.json(trendsArray);
  } catch (error) {
    console.error('Error fetching financial trends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

