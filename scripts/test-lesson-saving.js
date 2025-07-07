const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLessonSaving() {
  console.log('🧪 Testing lesson saving functionality...\n');

  try {
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('lessons').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Test lesson creation API endpoint
    console.log('2. Testing lesson creation API...');
    const testLesson = {
      title: 'Test Lesson from Script',
      description: 'This is a test lesson created to verify saving functionality',
      subject: 'Тестування',
      targetAge: '8-9 років',
      duration: 30,
      slides: [
        {
          title: 'Test Slide 1',
          description: 'First test slide',
          htmlContent: '<h1>Test Slide 1</h1><p>This is a test slide</p>',
          type: 'content'
        },
        {
          title: 'Test Slide 2',
          description: 'Second test slide',
          htmlContent: '<h1>Test Slide 2</h1><p>This is another test slide</p>',
          type: 'activity'
        }
      ]
    };

    const response = await fetch('http://localhost:3000/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLesson)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API request failed:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Lesson created successfully:', result.lesson.title);
    console.log('📊 Lesson ID:', result.lesson.id);
    console.log('📊 Slides count:', result.lesson.slides?.length || 0);

    // Test 3: Verify lesson exists in database
    console.log('\n3. Verifying lesson in database...');
    const { data: savedLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*, slides(*)')
      .eq('id', result.lesson.id)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch saved lesson:', fetchError.message);
      return;
    }

    console.log('✅ Lesson verified in database:');
    console.log('   Title:', savedLesson.title);
    console.log('   Subject:', savedLesson.subject);
    console.log('   Age Group:', savedLesson.age_group);
    console.log('   Slides count:', savedLesson.slides?.length || 0);

    // Test 4: Clean up - delete test lesson
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', result.lesson.id);

    if (deleteError) {
      console.error('⚠️  Warning: Failed to delete test lesson:', deleteError.message);
    } else {
      console.log('✅ Test lesson deleted successfully');
    }

    console.log('\n🎉 All tests passed! Lesson saving functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLessonSaving(); 