/**
 * Admin Analytics API - Engagement Metrics
 * GET /api/admin/analytics/engagement
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
    const today = new Date(now.setHours(0, 0, 0, 0));
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate DAU (Daily Active Users)
    const { data: dauData } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', today.toISOString());

    const dau = new Set(dauData?.map(d => d.user_id)).size;

    // Calculate WAU (Weekly Active Users)
    const { data: wauData } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', last7Days.toISOString());

    const wau = new Set(wauData?.map(d => d.user_id)).size;

    // Calculate MAU (Monthly Active Users)
    const { data: mauData } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', last30Days.toISOString());

    const mau = new Set(mauData?.map(d => d.user_id)).size;

    // Calculate ratios
    const dauWauRatio = wau > 0 ? dau / wau : 0;
    const wauMauRatio = mau > 0 ? wau / mau : 0;

    // Get DAU trend (last 30 days)
    const dauTrend = await getDailyTrend(supabase, 30);

    // Get WAU trend (last 12 weeks)
    const wauTrend = await getWeeklyTrend(supabase, 12);

    // Get MAU trend (last 6 months)
    const mauTrend = await getMonthlyTrend(supabase, 6);

    const metrics = {
      dau,
      wau,
      mau,
      dau_wau_ratio: Number(dauWauRatio.toFixed(3)),
      wau_mau_ratio: Number(wauMauRatio.toFixed(3)),
      dau_trend: dauTrend,
      wau_trend: wauTrend,
      mau_trend: mauTrend,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: Get daily active users trend
async function getDailyTrend(supabase: any, days: number) {
  const trend = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const { data } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', date.toISOString())
      .lt('created_at', nextDate.toISOString());

    trend.push({
      date: date.toISOString().split('T')[0],
      value: new Set(data?.map((d: any) => d.user_id)).size,
    });
  }

  return trend;
}

// Helper: Get weekly active users trend
async function getWeeklyTrend(supabase: any, weeks: number) {
  const trend = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7) - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());

    trend.push({
      date: weekStart.toISOString().split('T')[0],
      value: new Set(data?.map((d: any) => d.user_id)).size,
    });
  }

  return trend;
}

// Helper: Get monthly active users trend
async function getMonthlyTrend(supabase: any, months: number) {
  const trend = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const { data } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString());

    trend.push({
      date: monthStart.toISOString().split('T')[0],
      value: new Set(data?.map((d: any) => d.user_id)).size,
    });
  }

  return trend;
}

