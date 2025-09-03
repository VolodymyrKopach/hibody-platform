import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input data
    if (!email || typeof email !== 'string') {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        }
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Dynamically get host from request
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    console.log('Password reset redirect URL:', `${baseUrl}/auth/reset-password`)

    // Send password reset request via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) {
      console.error('Error sending reset password email:', error)
      
      // Supabase specific errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Too many attempts. Please try again later',
            code: 'RATE_LIMIT'
          }
        }, { status: 429 })
      }

      if (error.message.includes('User not found')) {
        // For security reasons, do not inform if user is not found
        return NextResponse.json({
          success: true,
          message: 'If a user with this email exists, a reset link will be sent'
        })
      }

      return NextResponse.json({
        success: false,
        error: { 
          message: 'Error sending email',
          code: 'EMAIL_SEND_ERROR'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent'
    })

  } catch (error) {
    console.error('Error in forgot-password POST:', error)
    
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
} 