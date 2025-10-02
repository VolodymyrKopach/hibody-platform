/**
 * Test script for ContentPaginationService
 * Tests if pagination correctly distributes elements across pages
 */

import { ContentPaginationService, PAGE_CONFIGS } from '../src/services/worksheet/ContentPaginationService';
import { GeneratedElement } from '../src/types/worksheet-generation';

// Create test elements
const createTestElements = (count: number): GeneratedElement[] => {
  const elements: GeneratedElement[] = [];
  
  // Add title
  elements.push({
    type: 'title-block',
    properties: {
      text: 'Test Worksheet',
      level: 'main',
      align: 'center',
    },
  });
  
  // Add various exercise types
  const exerciseTypes = [
    'fill-blank',
    'multiple-choice',
    'true-false',
    'short-answer',
    'match-pairs',
    'word-bank',
  ];
  
  for (let i = 1; i < count; i++) {
    const type = exerciseTypes[i % exerciseTypes.length];
    elements.push({
      type,
      properties: {
        question: `Test question ${i}`,
        items: Array(3).fill(null).map((_, idx) => ({
          number: idx + 1,
          text: `Item ${idx + 1}`,
        })),
      },
    });
  }
  
  return elements;
};

// Test pagination
const testPagination = (ageGroup: string, elementCount: number) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: Age ${ageGroup}, ${elementCount} elements`);
  console.log('='.repeat(60));
  
  const service = new ContentPaginationService(PAGE_CONFIGS.A4);
  service.setAgeRange(ageGroup);
  
  const elements = createTestElements(elementCount);
  const result = service.paginateContent(elements, `Test Worksheet`);
  
  console.log(`\n📊 RESULTS:`);
  console.log(`  Total Pages: ${result.totalPages}`);
  console.log(`  Elements per Page: ${result.elementsPerPage.join(', ')}`);
  console.log(`  Overflow Elements: ${result.overflowElements}`);
  
  // Verify no elements were lost
  const totalElementsInPages = result.elementsPerPage.reduce((sum, count) => sum + count, 0);
  if (totalElementsInPages === elementCount) {
    console.log(`  ✅ All ${elementCount} elements accounted for`);
  } else {
    console.log(`  ❌ ERROR: Expected ${elementCount} elements, got ${totalElementsInPages}`);
  }
  
  return result;
};

// Run tests
console.log('🧪 Testing ContentPaginationService\n');

// Test 1: Preschool (3-5) with many elements
testPagination('3-5', 10);

// Test 2: Elementary (8-9) with standard amount
testPagination('8-9', 20);

// Test 3: Adults (26-35) with many elements
testPagination('26-35', 50);

// Test 4: Seniors (50+) with moderate amount
testPagination('50+', 37);

console.log(`\n${'='.repeat(60)}`);
console.log('✅ All tests completed');
console.log(`${'='.repeat(60)}\n`);

