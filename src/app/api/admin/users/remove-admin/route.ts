/**
 * Remove Admin API
 * Only super admins can remove admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdminServer } from '@/lib/supabase/adminHelpers';

export async function POST(request: NextRequest) {
  try {
    // Only super admins can remove admin roles
    const isSuperAdmin = await isSuperAdminServer();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super admins can remove admin roles' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    // Validate
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Use admin client to bypass RLS for admin operations
    const adminSupabase = createAdminClient();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Prevent removing yourself as super admin
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      );
    }

    // Get admin info before deleting (using admin client)
    const { data: adminToRemove } = await adminSupabase
      .from('admin_users')
      .select('role, user_id')
      .eq('user_id', userId)
      .single();

    if (!adminToRemove) {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 404 }
      );
    }

    // Get user info for logging (using admin client)
    const { data: { user: targetAuthUser } } = await adminSupabase.auth.admin.getUserById(userId);

    // Delete from admin_users (using admin client to bypass RLS)
    const { error } = await adminSupabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing admin:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to remove admin role',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Track activity
    await supabase.from('activity_log').insert({
      user_id: currentUser.id,
      action: 'admin_deleted',
      entity_type: 'user',
      entity_id: userId,
      metadata: { 
        target_user_id: userId,
        target_user_email: targetAuthUser?.email,
        target_user_name: targetAuthUser?.user_metadata?.full_name,
        previous_role: adminToRemove.role
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully removed admin role from ${targetAuthUser?.email || 'user'}`
    });

  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

