#!/usr/bin/env node

// Test Claude Sonnet 4 API connection
// Перевіряємо змінну середовища напряму
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment');
  console.log('💡 Set it with:');
  console.log('export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here');
  process.exit(1);
}

async function testClaudeSonnet4() {
  console.log('🧪 Testing Claude Sonnet 4 API...');
  console.log('🔐 API Key present:', API_KEY ? 'Yes' : 'No');
  console.log('🔐 API Key length:', API_KEY?.length || 0);
  console.log('🔐 API Key preview:', API_KEY?.substring(0, 15) + '...');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: 'Привіт! Ти працюєш?' }
        ]
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ Error details:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      return;
    }

    const data = await response.json();
    console.log('✅ Claude Sonnet 4 response:', data.content[0]?.text);
    console.log('📊 Token usage:', data.usage);

  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

testClaudeSonnet4(); 