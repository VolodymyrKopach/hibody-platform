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

// POST /api/user/change-password - change user password
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const supabase = await createClient();
    const body = await request.json();

    // Validate input data
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'New password is required',
          code: 'MISSING_PASSWORD'
        }
      }, { status: 400 });
    }

    // Validate password complexity
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long',
        error: { 
          message: 'Password must be at least 8 characters long',
          code: 'PASSWORD_TOO_SHORT'
        }
      }, { status: 400 });
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one lowercase letter',
        error: { 
          message: 'Password must contain at least one lowercase letter',
          code: 'PASSWORD_MISSING_LOWERCASE'
        }
      }, { status: 400 });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one uppercase letter',
        error: { 
          message: 'Password must contain at least one uppercase letter',
          code: 'PASSWORD_MISSING_UPPERCASE'
        }
      }, { status: 400 });
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one number',
        error: { 
          message: 'Password must contain at least one number',
          code: 'PASSWORD_MISSING_NUMBER'
        }
      }, { status: 400 });
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one special character',
        error: { 
          message: 'Password must contain at least one special character (!@#$%^&*...)',
          code: 'PASSWORD_MISSING_SPECIAL'
        }
      }, { status: 400 });
    }

    // Change password via Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error changing password:', error);
      
      // Supabase specific errors
      if (error.message.includes('same as the old password')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'New password must be different from the current one',
            code: 'SAME_PASSWORD'
          }
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: { 
          message: 'Error changing password',
          code: 'PASSWORD_UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully changed'
    });

  } catch (error) {
    console.error('Error in change-password POST:', error);
    
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