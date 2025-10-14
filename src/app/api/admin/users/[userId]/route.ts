/**
 * Admin User Detail API
 * Get detailed information about a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.userId;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target user is admin
    const { data: targetAdminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    // Get counts
    const [
      { count: lessonsCount },
      { count: slidesCount },
      { count: worksheetsCount },
    ] = await Promise.all([
      supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('slides').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase
        .from('worksheets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    // Get recent activities
    const { data: activities } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get payment info
    const { data: payments } = await supabase
      .from('activity_log')
      .select('metadata, created_at')
      .eq('user_id', userId)
      .eq('action', 'payment_succeeded')
      .order('created_at', { ascending: false });

    const totalPaid =
      payments?.reduce((sum, p) => {
        return sum + (p.metadata?.amount || 0);
      }, 0) || 0;

    const lastPayment = payments?.[0]?.created_at || null;

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const userDetail = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || null,
      phone: null, // TODO: Add phone field to user_profiles if needed
      avatar_url: profile.avatar_url || null,
      created_at: profile.created_at,
      last_sign_in_at: null, // TODO: Track last sign in
      is_admin: !!targetAdminData,
      admin_role: targetAdminData?.role || null,
      lessons_count: lessonsCount || 0,
      slides_count: slidesCount || 0,
      worksheets_count: worksheetsCount || 0,
      last_activity_at: lastActivity?.created_at || null,
      subscription_status: profile.subscription_type || 'free',
      subscription_plan: profile.subscription_type || null,
      total_ai_requests: 0, // TODO: Implement tracking
      generation_limit_used: 0, // TODO: Get from generation_limits table
      generation_limit_total: 10, // TODO: Get from generation_limits table or config
      recent_activities: activities || [],
      total_paid: totalPaid,
      last_payment_at: lastPayment,
    };

    return NextResponse.json(userDetail);
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

