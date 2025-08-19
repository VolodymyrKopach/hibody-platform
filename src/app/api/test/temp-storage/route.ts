import { NextRequest, NextResponse } from 'next/server';
import { TemporaryImageService } from '@/services/images/TemporaryImageService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Starting temporary storage test...');

    // Перевіряємо аутентифікацію
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated', details: authError?.message },
        { status: 401 }
      );
    }

    console.log(`👤 Testing with user: ${user.id}`);

    // Створюємо сервіс
    const tempService = new TemporaryImageService();

    // Тестуємо завантаження
    const testResult = await tempService.testUpload();

    if (testResult) {
      console.log('✅ Temporary storage test passed');
      
      return NextResponse.json({
        success: true,
        message: 'Temporary storage is working correctly',
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Temporary storage test failed');
      
      return NextResponse.json(
        { error: 'Temporary storage test failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 Test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Temporary storage test endpoint',
    usage: 'POST to this endpoint to test temporary storage functionality'
  });
}
