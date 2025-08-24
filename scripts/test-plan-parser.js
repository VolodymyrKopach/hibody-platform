#!/usr/bin/env node

/**
 * Тест для перевірки Plan Parser
 */

// Імітуємо типовий markdown план
const sampleMarkdownPlan = `# Lesson Plan: Animals for Children (Age 4-6)

## Overview
This lesson introduces children to different animals and their habitats.

## Slide 1: Welcome to Animal World
**Goal:** Welcome children and introduce the topic
**Content:** 
- Greet the children warmly
- Show excitement about learning animals
- Ask what animals they already know

## Slide 2: Farm Animals
**Goal:** Learn about animals that live on farms
**Content:**
- Show pictures of cows, pigs, chickens
- Talk about what sounds they make
- Discuss what they give us (milk, eggs, etc.)

## Slide 3: Wild Animals
**Goal:** Discover animals in the wild
**Content:**
- Lions, elephants, monkeys
- Where they live (jungle, savanna)
- How they are different from farm animals

## Slide 4: Let's Review!
**Goal:** Summarize what we learned
**Content:**
- Quick review of all animals
- Ask children to name their favorite
- Encourage them to observe animals around them
`;

// Простий тест парсера
function testPlanParser() {
  console.log('🧪 Testing Plan Parser...\n');
  
  console.log('📄 Sample markdown plan:');
  console.log(sampleMarkdownPlan);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Імітуємо парсинг (без імпорту модуля)
  console.log('🔍 Parsing analysis:');
  
  // Перевіряємо наявність заголовків
  const hasH1 = sampleMarkdownPlan.includes('# ');
  const hasH2 = sampleMarkdownPlan.includes('## ');
  const hasH3 = sampleMarkdownPlan.includes('### ');
  
  console.log('- Has # headers:', hasH1);
  console.log('- Has ## headers:', hasH2);
  console.log('- Has ### headers:', hasH3);
  
  // Розділяємо по ## заголовках
  const sections = sampleMarkdownPlan.split(/##\s+/).filter(s => s.trim());
  console.log('- Sections found:', sections.length);
  
  sections.forEach((section, i) => {
    const lines = section.split('\n').filter(l => l.trim());
    const title = lines[0] || `Section ${i + 1}`;
    console.log(`  ${i + 1}. "${title.replace(/[#*]/g, '').trim()}"`);
  });
  
  console.log('\n✅ Parser should be able to extract slide information from this format!');
}

testPlanParser();
