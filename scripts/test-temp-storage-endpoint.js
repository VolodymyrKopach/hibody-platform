const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testTempStorageEndpoint() {
  try {
    console.log('🧪 Testing temporary storage endpoint...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Спробуємо увійти як тестовий користувач (якщо є)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

    console.log(`🔐 Attempting to sign in with: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      console.log('⚠️  Authentication failed, testing without auth:', authError.message);
      
      // Тестуємо без аутентифікації
      const response = await fetch('http://localhost:3000/api/test/temp-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Test passed without auth:', result);
      } else {
        console.log('❌ Test failed without auth:', result);
        console.log('This is expected - endpoint requires authentication');
      }
      
      return;
    }

    console.log('✅ Authentication successful');
    console.log('👤 User:', authData.user?.email);

    // Тестуємо з аутентифікацією
    const session = authData.session;
    
    const response = await fetch('http://localhost:3000/api/test/temp-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test passed with auth:', result);
    } else {
      console.log('❌ Test failed with auth:', result);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Альтернативний тест - прямо через TemporaryImageService
async function testTemporaryImageServiceDirectly() {
  try {
    console.log('\n🔬 Testing TemporaryImageService directly...');
    
    // Імпортуємо сервіс (потрібно буде адаптувати для Node.js)
    // const { TemporaryImageService } = require('../src/services/images/TemporaryImageService');
    
    console.log('⚠️  Direct service test requires browser environment');
    console.log('   Use the web interface at http://localhost:3000/test instead');
    
  } catch (error) {
    console.error('💥 Direct test error:', error);
  }
}

if (require.main === module) {
  console.log('🧪 Temporary Storage Endpoint Test');
  console.log('===================================');
  
  testTempStorageEndpoint()
    .then(() => testTemporaryImageServiceDirectly())
    .then(() => {
      console.log('\n🎯 Test completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Open http://localhost:3000/test in your browser');
      console.log('2. Go to "☁️ Temp Storage" tab');
      console.log('3. Click "Run Test" button');
      console.log('4. Check browser console for detailed logs');
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}
