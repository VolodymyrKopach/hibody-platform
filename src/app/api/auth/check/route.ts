import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return NextResponse.json({
        authenticated: false,
        error: error.message
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth check server error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Server error'
    }, { status: 500 });
  }
}
