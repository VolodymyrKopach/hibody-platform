import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Function to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user;
}

// GET /api/user/profile - get user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();

    // Get full user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Error fetching profile',
          code: 'PROFILE_FETCH_ERROR'
        }
      }, { status: 500 });
    }

    // Add basic auth information
    const fullProfile = {
      ...profile,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
    };

    return NextResponse.json({
      success: true,
      profile: fullProfile,
      message: 'Profile loaded'
    });

  } catch (error) {
    console.error('Error in profile GET:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/user/profile - update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();
    const body = await request.json();

    // Validate input data
    const allowedFields = ['full_name', 'avatar_url'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 1) { // only updated_at
      return NextResponse.json({
        success: false,
        error: { 
          message: 'No data to update',
          code: 'NO_DATA_TO_UPDATE'
        }
      }, { status: 400 });
    }

    // Update profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Error updating profile',
          code: 'PROFILE_UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error in profile PUT:', error);
    
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 });
  }
} 