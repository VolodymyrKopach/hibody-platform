import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('Reset password API called')

    // Password validation
    if (!password || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'New password is required',
          code: 'MISSING_PASSWORD'
        }
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Password must be at least 6 characters long',
          code: 'PASSWORD_TOO_SHORT'
        }
      }, { status: 400 })
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Password must contain at least one lowercase letter',
          code: 'PASSWORD_MISSING_LOWERCASE'
        }
      }, { status: 400 })
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Password must contain at least one uppercase letter',
          code: 'PASSWORD_MISSING_UPPERCASE'
        }
      }, { status: 400 })
    }

    if (!/(?=.*\d)/.test(password)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Password must contain at least one digit',
          code: 'PASSWORD_MISSING_NUMBER'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('User not authenticated for password reset')
      return NextResponse.json({
        success: false,
        error: { 
          message: 'User not authenticated. Please try the link from email again.',
          code: 'USER_NOT_AUTHENTICATED'
        }
      }, { status: 401 })
    }

    console.log('User authenticated for password reset:', user.email)

    // Update password for the authenticated user
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('Password update failed:', updateError)
        
        // Supabase specific errors
        if (updateError.message.includes('same as the old password')) {
          return NextResponse.json({
            success: false,
            error: { 
              message: 'New password must be different from the current one',
              code: 'SAME_PASSWORD'
            }
          }, { status: 400 })
        }

        return NextResponse.json({
          success: false,
          error: { 
            message: 'Error updating password: ' + updateError.message,
            code: 'PASSWORD_UPDATE_ERROR'
          }
        }, { status: 500 })
      }

      console.log('Password reset successful for user:', user.email)
      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      })

    } catch (updateErr) {
      console.error('Password update error:', updateErr)
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Error updating password',
          code: 'PASSWORD_UPDATE_ERROR'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in reset-password POST:', error)
    
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
} 