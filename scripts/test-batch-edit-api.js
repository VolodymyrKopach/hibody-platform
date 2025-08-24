/**
 * Test script for batch edit API endpoint
 */

const testSlideEditAPI = async () => {
  const testSlideId = 'test-slide-1';
  const testData = {
    instruction: 'збільш розмір тайтлів в двічі',
    slideContent: `
      <div class="slide">
        <h1>Test Title</h1>
        <p>Test content</p>
      </div>
    `,
    topic: 'shapes',
    age: '4 роки',
    batchId: 'test-batch-123',
    slideIndex: 1
  };

  try {
    console.log('🧪 Testing slide edit API...');
    console.log('📝 Test data:', testData);

    const response = await fetch(`http://localhost:3000/api/slides/${testSlideId}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    const data = await response.json();
    console.log('📊 Response data:', data);

    if (data.success) {
      console.log('✅ API test successful!');
      console.log('📏 Edited content length:', data.editedContent?.length);
      console.log('⏱️ Editing time:', data.editingTime, 'ms');
    } else {
      console.log('❌ API test failed:', data.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testSlideEditAPI();
} else {
  // Browser environment
  console.log('🌐 Run this in browser console:');
  console.log('testSlideEditAPI()');
  window.testSlideEditAPI = testSlideEditAPI;
}
