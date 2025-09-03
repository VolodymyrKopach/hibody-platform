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

    // Resend email verification using Supabase
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/login?verified=true`
      }
    })

    if (error) {
      // This should not happen as Supabase throws exceptions, but keep for safety
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Error in resend-verification POST:', error)
    
    // Handle specific Supabase errors in catch block
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || 
          error.message.includes('can only request this after') ||
          (error as any).code === 'over_email_send_rate_limit') {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Too many attempts. Please try again later',
            code: 'RATE_LIMIT'
          }
        }, { status: 429 })
      }

      if (error.message.includes('already confirmed')) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Email is already verified',
            code: 'ALREADY_VERIFIED'
          }
        }, { status: 400 })
      }

      if (error.message.includes('User not found')) {
        // For security reasons, don't reveal if user exists
        return NextResponse.json({
          success: true,
          message: 'If a user with this email exists, a verification email will be sent'
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
