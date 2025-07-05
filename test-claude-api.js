#!/usr/bin/env node

// Simple test script for Claude API
// Use global fetch (Node.js 18+) or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function testClaudeHaiku(message) {
  const prompt = `
Ти система детекції намірів для платформи створення навчальних уроків.

Аналізуй повідомлення користувача та визначай:
1. НАМІР (intent) - одне з: CREATE_LESSON, EDIT_PLAN, GENERATE_SLIDE, HELP, FREE_CHAT
2. ВПЕВНЕНІСТЬ (confidence) - число від 0 до 1
3. ПАРАМЕТРИ - витягни topic, age, slideNumber, targetElement
4. ДОСТАТНІСТЬ ДАНИХ - чи є всі потрібні параметри
5. ВІДСУТНІ ДАНІ - що потрібно ще запитати

Повідомлення: "${message}"

Відповідай JSON:
{
  "intent": "CREATE_LESSON",
  "confidence": 0.95,
  "parameters": {
    "topic": "динозаври",
    "age": "8 років"
  },
  "isDataSufficient": true/false,
  "missingData": ["age"],
  "suggestedQuestion": "Для якого віку створити урок?"
}`;

  try {
    console.log('🔍 Testing Claude Haiku API...');
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Claude API Error:', data);
      return null;
    }

    console.log('✅ Claude Haiku Response:');
    console.log(data.content[0].text);
    
    try {
      const parsed = JSON.parse(data.content[0].text);
      console.log('✅ Parsed JSON:', JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return null;
  }
}

async function testClaudeSonnet(topic, age) {
  const prompt = `
Створи детальний план уроку для дітей на українській мові.

Тема: ${topic}
Вік: ${age}

Структура плану:
- Заголовок уроку (цікавий, дитячий)
- Тривалість (адаптована під вік)
- Мета уроку
- 5 слайдів з описом кожного:
  * Тип слайду (вступний, навчальний, активність, summary)
  * Зміст
  * Інтерактивні елементи
  * Мета слайду

Адаптуй складність та мову під вказаний вік.`;

  try {
    console.log('🎨 Testing Claude Sonnet API...');
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Claude API Error:', data);
      return null;
    }

    console.log('✅ Claude Sonnet Response:');
    console.log(data.content[0].text);
    return data.content[0].text;
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Claude API Test Script');
  console.log('==========================\n');
  
  if (!CLAUDE_API_KEY) {
    console.error('❌ CLAUDE_API_KEY environment variable not set');
    console.log('💡 Set it with: export CLAUDE_API_KEY=your_key_here');
    process.exit(1);
  }
  
  console.log('✅ Claude API key found');
  console.log('📝 API Key preview:', CLAUDE_API_KEY.substring(0, 15) + '...\n');
  
  // Test 1: Complete message
  console.log('🧪 Test 1: Complete message with all data');
  const result1 = await testClaudeHaiku('створи урок про динозаврів для дитини 8 років');
  
  if (result1 && result1.isDataSufficient) {
    console.log('\n🎨 Test 1.1: Generate lesson plan with Sonnet');
    await testClaudeSonnet(result1.parameters.topic, result1.parameters.age);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Incomplete message
  console.log('🧪 Test 2: Incomplete message (missing age)');
  const result2 = await testClaudeHaiku('хочу урок про тварин');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Unclear message
  console.log('🧪 Test 3: Unclear message');
  const result3 = await testClaudeHaiku('можна щось цікаве?');
  
  console.log('\n🎉 Tests completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testClaudeHaiku, testClaudeSonnet }; 