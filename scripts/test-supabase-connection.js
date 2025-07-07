const { createClient } = require('@supabase/supabase-js');

// Завантажуємо environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not found!');
  console.error('Make sure .env.local file exists with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing basic connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test table existence
    console.log('\n🔍 Checking database tables...');
    const expectedTables = [
      'user_profiles',
      'lessons',
      'slides',
      'slide_images',
      'chat_sessions',
      'chat_messages',
      'subscription_usage',
      'lesson_shares',
      'lesson_ratings'
    ];
    
    const tableResults = [];
    for (const table of expectedTables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        tableResults.push({
          table,
          exists: !tableError,
          error: tableError?.message
        });
      } catch (err) {
        tableResults.push({
          table,
          exists: false,
          error: err.message
        });
      }
    }
    
    const existingTables = tableResults.filter(t => t.exists);
    const missingTables = tableResults.filter(t => !t.exists);
    
    console.log(`✅ Found ${existingTables.length} tables:`);
    existingTables.forEach(t => console.log(`  - ${t.table}`));
    
    if (missingTables.length > 0) {
      console.log(`❌ Missing ${missingTables.length} tables:`);
      missingTables.forEach(t => console.log(`  - ${t.table}: ${t.error}`));
    }
    
    return missingTables.length === 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Database is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  process.exit(success ? 0 : 1);
}); 