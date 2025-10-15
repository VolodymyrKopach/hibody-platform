/**
 * Make Admin API
 * Only super admins can assign admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSuperAdminServer } from '@/lib/supabase/adminHelpers';

export async function POST(request: NextRequest) {
  try {
    // Only super admins can make other users admin
    const isSuperAdmin = await isSuperAdminServer();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super admins can assign admin roles' },
        { status: 403 }
      );
    }

    const { userId, role } = await request.json();

    // Validate
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    if (!role || !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "super_admin"' },
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

    // Check if user exists (using admin client)
    const { data: { user: targetAuthUser }, error: authUserError } = await adminSupabase.auth.admin.getUserById(userId);

    if (authUserError || !targetAuthUser) {
      console.error('User not found:', { userId, error: authUserError });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert or update admin_users (using admin client to bypass RLS)
    const { data: upsertData, error } = await adminSupabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        role,
        created_by: currentUser.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('Error creating admin:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Return more specific error for debugging
      return NextResponse.json(
        { 
          error: 'Failed to assign admin role',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('Admin created successfully:', upsertData);

    // Track activity
    await supabase.from('activity_log').insert({
      user_id: currentUser.id,
      action: 'admin_created',
      entity_type: 'user',
      entity_id: userId,
      metadata: { 
        role, 
        target_user_id: userId,
        target_user_email: targetAuthUser.email,
        target_user_name: targetAuthUser.user_metadata?.full_name || null
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully assigned ${role} role to ${targetAuthUser.email}`
    });

  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

