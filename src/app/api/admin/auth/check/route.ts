/**
 * Admin Auth Check API
 * Endpoint for checking if current user has admin access
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { isAdmin: false, isSuperAdmin: false, user: null },
        { status: 200 }
      );
    }

    // Check if user is admin
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, role, user_id, created_at')
      .eq('user_id', user.id)
      .single();

    if (error || !adminUser) {
      return NextResponse.json(
        { isAdmin: false, isSuperAdmin: false, user: null },
        { status: 200 }
      );
    }

    // Return admin info
    return NextResponse.json({
      isAdmin: true,
      isSuperAdmin: adminUser.role === 'super_admin',
      user: {
        id: adminUser.id,
        user_id: adminUser.user_id,
        role: adminUser.role,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        created_at: adminUser.created_at
      }
    });

  } catch (error) {
    console.error('Error checking admin auth:', error);
    return NextResponse.json(
      { isAdmin: false, isSuperAdmin: false, user: null },
      { status: 500 }
    );
  }
}

