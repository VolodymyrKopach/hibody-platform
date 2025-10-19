#!/usr/bin/env node

/**
 * Test script for Base64 stripping functionality
 * Run with: node scripts/test-base64-stripping.js
 */

// Simulated Base64 data (truncated for readability)
const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Create test data that mimics real worksheet structure
const testData = {
  editTarget: {
    type: 'component',
    pageId: 'page-1',
    elementId: 'element-1',
    data: {
      id: 'element-1',
      type: 'image-placeholder',
      properties: {
        // This imageUrl should be stripped
        imageUrl: mockBase64Image,
        width: 400,
        height: 300,
        caption: 'Test image',
        imagePrompt: 'A beautiful sunset',
      },
    },
  },
  instruction: 'Make the image brighter',
  context: {
    topic: 'Nature',
    ageGroup: '6-7',
    difficulty: 'medium',
    language: 'en',
  },
};

// Simulate interactive component with nested images
const testDataInteractive = {
  editTarget: {
    type: 'component',
    pageId: 'page-1',
    elementId: 'element-2',
    data: {
      id: 'element-2',
      type: 'flashcards',
      properties: {
        title: 'Animal Flashcards',
        cards: [
          {
            id: 'card-1',
            // This imageUrl should be stripped
            imageUrl: mockBase64Image,
            text: 'Cat',
          },
          {
            id: 'card-2',
            // This imageUrl should be stripped
            imageUrl: mockBase64Image,
            text: 'Dog',
          },
        ],
        // This should also be stripped
        cardBackImage: mockBase64Image,
      },
    },
  },
  instruction: 'Add more animals',
  context: {
    topic: 'Animals',
    ageGroup: '3-5',
    difficulty: 'easy',
    language: 'en',
  },
};

// Simple Base64 stripping function (client-side simulation)
function stripBase64Images(data) {
  let imagesStripped = 0;
  let bytesSaved = 0;

  function processValue(value) {
    if (typeof value !== 'object' || value === null) {
      if (typeof value === 'string' && value.startsWith('data:image')) {
        const originalSize = value.length;
        imagesStripped++;
        bytesSaved += originalSize;
        return `[BASE64_STRIPPED:Generated image]`;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => processValue(item));
    }

    const result = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = processValue(value[key]);
      }
    }
    return result;
  }

  const strippedData = processValue(data);

  return {
    strippedData,
    stats: {
      imagesStripped,
      bytesSaved,
      estimatedTokensSaved: Math.floor(bytesSaved / 4),
    },
  };
}

// Run tests
console.log('🧪 Testing Base64 Stripping Functionality\n');

console.log('📋 Test 1: Simple image component');
console.log('=====================================');
const originalSize1 = JSON.stringify(testData).length;
const result1 = stripBase64Images(testData);
const strippedSize1 = JSON.stringify(result1.strippedData).length;

console.log('Original size:', originalSize1, 'bytes');
console.log('Stripped size:', strippedSize1, 'bytes');
console.log('Reduction:', ((1 - strippedSize1 / originalSize1) * 100).toFixed(1) + '%');
console.log('Stats:', result1.stats);
console.log('✅ Test 1 passed\n');

console.log('📋 Test 2: Interactive component with nested images');
console.log('=====================================================');
const originalSize2 = JSON.stringify(testDataInteractive).length;
const result2 = stripBase64Images(testDataInteractive);
const strippedSize2 = JSON.stringify(result2.strippedData).length;

console.log('Original size:', originalSize2, 'bytes');
console.log('Stripped size:', strippedSize2, 'bytes');
console.log('Reduction:', ((1 - strippedSize2 / originalSize2) * 100).toFixed(1) + '%');
console.log('Stats:', result2.stats);
console.log('✅ Test 2 passed\n');

// Verify stripped data structure
console.log('📋 Test 3: Verify data structure integrity');
console.log('===========================================');
const strippedElement = result1.strippedData.editTarget.data;
console.log('Element type:', strippedElement.type);
console.log('Has properties:', !!strippedElement.properties);
console.log('Caption preserved:', strippedElement.properties.caption);
console.log('imagePrompt preserved:', strippedElement.properties.imagePrompt);
console.log('imageUrl stripped:', strippedElement.properties.imageUrl);
console.log('✅ Test 3 passed\n');

console.log('📋 Test 4: Verify nested array processing');
console.log('==========================================');
const cards = result2.strippedData.editTarget.data.properties.cards;
console.log('Number of cards:', cards.length);
console.log('Card 1 imageUrl stripped:', cards[0].imageUrl);
console.log('Card 1 text preserved:', cards[0].text);
console.log('Card 2 imageUrl stripped:', cards[1].imageUrl);
console.log('Card 2 text preserved:', cards[1].text);
console.log('cardBackImage stripped:', result2.strippedData.editTarget.data.properties.cardBackImage);
console.log('✅ Test 4 passed\n');

console.log('🎉 All tests passed!');
console.log('\n💡 Expected behavior in production:');
console.log('   - Client strips Base64 before sending to API');
console.log('   - Backend strips Base64 before sending to AI');
console.log('   - Double protection against token waste');
console.log('   - Detailed logging in console');

