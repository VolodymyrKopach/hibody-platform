#!/usr/bin/env node

/**
 * Тест парсингу реального lesson plan
 */

async function testRealPlanParsing() {
  console.log('🧪 Testing Real Lesson Plan Parsing...\n');

  // Спочатку отримаємо реальний план з API
  try {
    console.log('📤 Generating real lesson plan via API...');
    
    const response = await fetch('http://localhost:3000/api/templates/lesson-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ageGroup: '4-6',
        topic: 'Animals',
        slideCount: 4,
        language: 'en'
      })
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', errorData);
      return;
    }

    const result = await response.json();
    
    if (!result.success || !result.plan) {
      console.error('❌ Invalid API response:', result);
      return;
    }

    const plan = result.plan;
    console.log('✅ Generated plan successfully!');
    console.log('📄 Plan length:', plan.length, 'characters');
    console.log('\n📋 Plan preview (first 1000 chars):');
    console.log('='.repeat(50));
    console.log(plan.substring(0, 1000));
    console.log('='.repeat(50));
    
    // Тепер аналізуємо структуру
    console.log('\n🔍 Analyzing plan structure:');
    
    const hasH1 = plan.includes('# ');
    const hasH2 = plan.includes('## ');
    const hasH3 = plan.includes('### ');
    
    console.log('- Has # headers:', hasH1);
    console.log('- Has ## headers:', hasH2);
    console.log('- Has ### headers:', hasH3);
    
    // Пробуємо різні способи розділення
    if (hasH2) {
      const sections = plan.split(/##\s+/).filter(s => s.trim());
      console.log('- Sections by ##:', sections.length);
      
      sections.slice(0, 5).forEach((section, i) => {
        const lines = section.split('\n').filter(l => l.trim());
        const title = lines[0] || `Section ${i + 1}`;
        console.log(`  ${i + 1}. "${title.replace(/[#*]/g, '').trim().substring(0, 50)}..."`);
      });
    }
    
    if (hasH3) {
      const sections = plan.split(/###\s+/).filter(s => s.trim());
      console.log('- Sections by ###:', sections.length);
      
      sections.slice(0, 5).forEach((section, i) => {
        const lines = section.split('\n').filter(l => l.trim());
        const title = lines[0] || `Section ${i + 1}`;
        console.log(`  ${i + 1}. "${title.replace(/[#*]/g, '').trim().substring(0, 50)}..."`);
      });
    }
    
    console.log('\n✅ Analysis complete! Check if parser can handle this format.');

  } catch (error) {
    console.error('❌ Error testing plan parsing:', error.message);
  }
}

testRealPlanParsing();
