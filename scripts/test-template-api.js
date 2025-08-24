#!/usr/bin/env node

/**
 * Тест для перевірки Template Slide Generation API
 */

const API_BASE = 'http://localhost:3000';

async function testTemplateSlideAPI() {
  console.log('🧪 Testing Template Slide Generation API...\n');

  // Тестові дані
  const testSlideData = {
    slideNumber: 1,
    title: 'Introduction to Animals',
    description: 'Welcome children! Today we will learn about different animals and their homes.',
    type: 'introduction',
    templateData: {
      topic: 'Animals',
      ageGroup: '4-6',
      slideCount: 4,
      hasAdditionalInfo: false
    },
    sessionId: `test_${Date.now()}`
  };

  try {
    console.log('📤 Sending request to API...');
    console.log('Request data:', JSON.stringify(testSlideData, null, 2));

    const response = await fetch(`${API_BASE}/api/templates/slides/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSlideData)
    });

    console.log(`\n📥 Response status: ${response.status} ${response.statusText}`);

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API call successful!');
      console.log('\n📊 Response data:');
      console.log('- Success:', result.success);
      console.log('- Slide ID:', result.slide?.id);
      console.log('- Slide Title:', result.slide?.title);
      console.log('- Slide Status:', result.slide?.status);
      console.log('- Slide Number:', result.slideNumber);
      
      if (result.slide?.htmlContent) {
        console.log('- HTML Content Length:', result.slide.htmlContent.length, 'characters');
      }
      
      console.log('\n🎉 Template Slide Generation API is working correctly!');
      return true;
    } else {
      console.log('❌ API call failed!');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Запускаємо тест
testTemplateSlideAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
