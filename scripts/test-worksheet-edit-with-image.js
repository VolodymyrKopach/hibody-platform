/**
 * Test script for worksheet editing with automatic image generation
 * Tests the flow when AI adds a new image to a worksheet page
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Test Case 1: Edit component - add image
 */
async function testComponentEditWithImage() {
  console.log('\n🧪 TEST 1: Edit component (add image via imagePrompt)\n');

  const mockElement = {
    id: 'test-element-1',
    type: 'image-placeholder',
    position: { x: 100, y: 100 },
    size: { width: 300, height: 300 },
    properties: {
      caption: 'Test image',
      width: 512,
      height: 512,
      // No url - should trigger generation
    },
    zIndex: 1,
    locked: false,
    visible: true,
  };

  const requestBody = {
    editTarget: {
      type: 'component',
      pageId: 'test-page-1',
      elementId: 'test-element-1',
      data: mockElement,
    },
    instruction: 'Add an image of a friendly dinosaur for children',
    context: {
      topic: 'Dinosaurs',
      ageGroup: '6-8',
      difficulty: 'easy',
      language: 'en',
    },
  };

  try {
    console.log('📤 Sending edit request...');
    const response = await fetch(`${BASE_URL}/api/worksheet/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed:', data);
      return false;
    }

    console.log('\n📥 Response received:');
    console.log('- Success:', data.success);
    console.log('- Changes count:', data.changes?.length || 0);
    console.log('- Patch keys:', Object.keys(data.patch || {}));

    if (data.patch?.properties) {
      console.log('- Has imagePrompt:', !!data.patch.properties.imagePrompt);
      console.log('- Has url:', !!data.patch.properties.url);
      
      if (data.patch.properties.url) {
        const urlPreview = data.patch.properties.url.substring(0, 50);
        console.log('- URL preview:', urlPreview + '...');
        console.log('✅ Image was generated automatically!');
      } else if (data.patch.properties.imagePrompt) {
        console.log('⚠️ ImagePrompt exists but image was not generated');
        console.log('- ImagePrompt:', data.patch.properties.imagePrompt);
        return false;
      }
    }

    return data.success && data.patch?.properties?.url;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test Case 2: Edit page - add multiple images
 */
async function testPageEditWithMultipleImages() {
  console.log('\n🧪 TEST 2: Edit page (add multiple images)\n');

  const mockPage = {
    title: 'Test Page',
    elements: [
      {
        id: 'text-1',
        type: 'text-box',
        position: { x: 50, y: 50 },
        size: { width: 200, height: 100 },
        properties: {
          text: 'Dinosaurs',
          fontSize: 24,
        },
        zIndex: 1,
        locked: false,
        visible: true,
      },
    ],
  };

  const requestBody = {
    editTarget: {
      type: 'page',
      pageId: 'test-page-2',
      data: mockPage,
    },
    instruction: 'Add two images: a T-Rex and a Triceratops',
    context: {
      topic: 'Dinosaurs',
      ageGroup: '6-8',
      difficulty: 'easy',
      language: 'en',
    },
  };

  try {
    console.log('📤 Sending edit request...');
    const response = await fetch(`${BASE_URL}/api/worksheet/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed:', data);
      return false;
    }

    console.log('\n📥 Response received:');
    console.log('- Success:', data.success);
    console.log('- Changes count:', data.changes?.length || 0);

    if (data.patch?.elements) {
      console.log('- Total elements:', data.patch.elements.length);
      
      const imageElements = data.patch.elements.filter(
        el => el.type === 'image-placeholder'
      );
      
      console.log('- Image elements:', imageElements.length);
      
      const imagesWithUrls = imageElements.filter(
        el => el.properties?.url
      );
      
      console.log('- Images with URLs:', imagesWithUrls.length);
      
      if (imagesWithUrls.length > 0) {
        console.log('✅ Images were generated automatically!');
        imagesWithUrls.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img.properties?.caption || 'Unnamed'}`);
        });
      } else {
        console.log('⚠️ No images with URLs found');
        return false;
      }
    }

    return data.success && data.patch?.elements?.some(
      el => el.type === 'image-placeholder' && el.properties?.url
    );

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test Case 3: Edit existing image (change prompt)
 */
async function testEditExistingImage() {
  console.log('\n🧪 TEST 3: Edit existing image (change imagePrompt)\n');

  const mockElement = {
    id: 'test-element-3',
    type: 'image-placeholder',
    position: { x: 100, y: 100 },
    size: { width: 300, height: 300 },
    properties: {
      caption: 'Old dinosaur',
      imagePrompt: 'A scary T-Rex',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANS...', // existing image
      width: 512,
      height: 512,
    },
    zIndex: 1,
    locked: false,
    visible: true,
  };

  const requestBody = {
    editTarget: {
      type: 'component',
      pageId: 'test-page-3',
      elementId: 'test-element-3',
      data: mockElement,
    },
    instruction: 'Make the dinosaur friendly and smiling instead',
    context: {
      topic: 'Dinosaurs',
      ageGroup: '6-8',
      difficulty: 'easy',
      language: 'en',
    },
  };

  try {
    console.log('📤 Sending edit request...');
    const response = await fetch(`${BASE_URL}/api/worksheet/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed:', data);
      return false;
    }

    console.log('\n📥 Response received:');
    console.log('- Success:', data.success);
    console.log('- Changes count:', data.changes?.length || 0);

    if (data.patch?.properties) {
      const oldPrompt = mockElement.properties.imagePrompt;
      const newPrompt = data.patch.properties.imagePrompt;
      const newUrl = data.patch.properties.url;
      
      console.log('- Old prompt:', oldPrompt);
      console.log('- New prompt:', newPrompt);
      console.log('- URL changed:', newUrl !== mockElement.properties.url);
      
      if (newPrompt && newPrompt !== oldPrompt && newUrl && newUrl !== mockElement.properties.url) {
        console.log('✅ Image prompt changed and new image generated!');
        return true;
      } else if (newPrompt && !newUrl) {
        console.log('⚠️ Prompt changed but image was not regenerated');
        return false;
      }
    }

    return false;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Worksheet Edit with Image Generation Tests');
  console.log('=' .repeat(60));

  const results = {
    componentEdit: false,
    pageEdit: false,
    editExisting: false,
  };

  // Test 1: Component edit with image
  results.componentEdit = await testComponentEditWithImage();
  
  // Test 2: Page edit with multiple images
  results.pageEdit = await testPageEditWithMultipleImages();
  
  // Test 3: Edit existing image
  results.editExisting = await testEditExistingImage();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY\n');
  console.log(`1. Component edit with image:     ${results.componentEdit ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2. Page edit with multiple images: ${results.pageEdit ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`3. Edit existing image:           ${results.editExisting ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\nTotal: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }

  return passCount === totalCount;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });

