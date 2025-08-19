const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testEnhancedImageProcessor() {
  try {
    console.log('🧪 Testing Enhanced Image Processor with Temporary Storage');
    console.log('=========================================================');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase credentials');
      return;
    }

    // Test different configurations
    const testConfigs = [
      {
        name: 'Full Temporary Storage',
        useTemporaryStorage: true,
        fallbackToBase64: false
      },
      {
        name: 'Temporary Storage with Base64 Fallback',
        useTemporaryStorage: true,
        fallbackToBase64: true
      },
      {
        name: 'Base64 Only (Original Behavior)',
        useTemporaryStorage: false,
        fallbackToBase64: true
      }
    ];

    console.log(`🔄 Testing ${testConfigs.length} configurations...\n`);

    for (let i = 0; i < testConfigs.length; i++) {
      const config = testConfigs[i];
      
      console.log(`📋 Test ${i + 1}/${testConfigs.length}: ${config.name}`);
      console.log(`   useTemporaryStorage: ${config.useTemporaryStorage}`);
      console.log(`   fallbackToBase64: ${config.fallbackToBase64}`);

      try {
        const response = await fetch('http://localhost:3000/api/test/image-processor-temp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          console.log('✅ Test passed');
          console.log(`   Session ID: ${result.results.sessionId}`);
          console.log(`   Processing Time: ${result.results.processingTime}`);
          console.log(`   Images: ${result.results.images.successful}/${result.results.images.total} successful`);
          console.log(`   Temp Storage: ${result.results.images.tempStored} files`);
          console.log(`   Size Savings: ${result.results.performance.sizeSavings}`);
          
          if (result.results.errors.length > 0) {
            console.log(`   ⚠️ Errors: ${result.results.errors.length}`);
            result.results.errors.forEach((error, idx) => {
              console.log(`     ${idx + 1}. ${error}`);
            });
          }
        } else {
          console.log('❌ Test failed');
          console.log(`   Error: ${result.error || 'Unknown error'}`);
          if (result.details) {
            console.log(`   Details: ${result.details}`);
          }
        }

      } catch (error) {
        console.log('💥 Test exception');
        console.log(`   Error: ${error.message}`);
      }

      console.log(''); // Empty line between tests
    }

    console.log('🎯 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:3000/test in your browser');
    console.log('2. Go to "🔄 Image Processor" tab');
    console.log('3. Configure test options and click "Run Enhanced Test"');
    console.log('4. Check browser console for detailed logs');

  } catch (error) {
    console.error('💥 Test script error:', error);
  }
}

// Test individual components
async function testComponents() {
  console.log('\n🔧 Component Tests');
  console.log('==================');

  // Test basic temp storage first
  console.log('1. Testing basic temporary storage...');
  try {
    const response = await fetch('http://localhost:3000/api/test/temp-storage', {
      method: 'POST'
    });
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Basic temp storage works');
    } else {
      console.log('❌ Basic temp storage failed:', result.error);
    }
  } catch (error) {
    console.log('💥 Basic temp storage error:', error.message);
  }

  // Test endpoint accessibility
  console.log('\n2. Testing enhanced processor endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/test/image-processor-temp');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Enhanced processor endpoint accessible');
      console.log(`   Description: ${result.description}`);
    } else {
      console.log('❌ Enhanced processor endpoint failed');
    }
  } catch (error) {
    console.log('💥 Enhanced processor endpoint error:', error.message);
  }
}

if (require.main === module) {
  testComponents()
    .then(() => testEnhancedImageProcessor())
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedImageProcessor, testComponents };
