/**
 * Test JSON Repair functionality
 * Tests the repairIncompleteJSON method that handles truncated Gemini responses
 */

import { geminiWorksheetGenerationService } from '@/services/worksheet/GeminiWorksheetGenerationService';

describe('JSON Repair', () => {
  // Access private method for testing
  const service = geminiWorksheetGenerationService as any;

  test('repairs unterminated string', () => {
    const incomplete = `{
  "topic": "present perfect",
  "ageGroup": "36-50",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Mastering the Present Perfect",
        "level": "main"
      }
    },
    {
      "type": "instructions-box",
      "properties": {
        "text": "Welcome! This worksheet will help you understand`;
    
    const repaired = service.repairIncompleteJSON(incomplete);
    
    // Should close the string, array, and objects
    expect(() => JSON.parse(repaired)).not.toThrow();
    
    const parsed = JSON.parse(repaired);
    expect(parsed.elements).toBeInstanceOf(Array);
    expect(parsed.elements.length).toBeGreaterThan(0);
  });

  test('repairs missing closing brackets', () => {
    const incomplete = `{
  "topic": "test",
  "ageGroup": "6-7",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Title"
      }
    }
  `;
    
    const repaired = service.repairIncompleteJSON(incomplete);
    
    expect(() => JSON.parse(repaired)).not.toThrow();
    
    const parsed = JSON.parse(repaired);
    expect(parsed.elements).toBeInstanceOf(Array);
  });

  test('handles trailing comma', () => {
    const incomplete = `{
  "topic": "test",
  "ageGroup": "6-7",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Title"
      }
    },
  `;
    
    const repaired = service.repairIncompleteJSON(incomplete);
    
    // Should remove trailing comma and close properly
    expect(() => JSON.parse(repaired)).not.toThrow();
  });

  test('handles complex nested incomplete JSON', () => {
    const incomplete = `{
  "topic": "grammar",
  "ageGroup": "10-11",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Grammar Rules"
      }
    },
    {
      "type": "fill-blank",
      "properties": {
        "items": [
          {
            "number": 1,
            "text": "She _____ to school`,
    
    const repaired = service.repairIncompleteJSON(incomplete);
    
    // Should handle deep nesting
    expect(() => JSON.parse(repaired)).not.toThrow();
    
    const parsed = JSON.parse(repaired);
    expect(parsed.elements).toBeInstanceOf(Array);
    expect(parsed.elements[1].type).toBe('fill-blank');
  });

  test('already complete JSON passes through', () => {
    const complete = `{
  "topic": "test",
  "ageGroup": "6-7",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Title"
      }
    }
  ]
}`;
    
    const repaired = service.repairIncompleteJSON(complete);
    
    expect(() => JSON.parse(repaired)).not.toThrow();
    
    // Should not corrupt valid JSON
    const parsed = JSON.parse(repaired);
    expect(parsed.topic).toBe('test');
  });
});

/**
 * Manual test for the actual error case
 */
export function testActualErrorCase() {
  console.log('🧪 Testing actual error case...');
  
  const incompleteResponse = `{
  "topic": "present perfect for 5 class",
  "ageGroup": "36-50",
  "elements": [
    {
      "type": "title-block",
      "properties": {
        "text": "Mastering the Present Perfect",
        "level": "main",
        "align": "center",
        "color": "#1F2937"
      }
    },
    {
      "type": "instructions-box",
      "properties": {
        "text": "Welcome! This worksheet will help you understand and practice the Present Perfect tense. Read explanations carefully and complete`;

  const service = geminiWorksheetGenerationService as any;
  
  try {
    const repaired = service.repairIncompleteJSON(incompleteResponse);
    console.log('✅ Repair successful');
    console.log('Repaired JSON:', repaired);
    
    const parsed = JSON.parse(repaired);
    console.log('✅ Parse successful');
    console.log('Parsed object:', JSON.stringify(parsed, null, 2));
    
    return { success: true, repaired, parsed };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

