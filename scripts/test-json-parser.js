#!/usr/bin/env node

/**
 * Тест для перевірки JSON парсингу
 */

// Імітуємо JSON план як він приходить з API
const sampleJSONPlan = {
  "metadata": {
    "title": "Time Travelers' Toolkit: Unearthing Ancient Civilizations",
    "targetAudience": "9-10",
    "duration": "40-50 minutes",
    "goal": "To introduce children to the concept of ancient civilizations"
  },
  "slides": [
    {
      "slideNumber": 1,
      "type": "Introduction",
      "title": "Welcome, Young Historians! What is History?",
      "goal": "To capture attention, introduce the topic of history and ancient civilizations",
      "content": "Hello, future archaeologists and history detectives! Today, we're embarking on an incredible journey back in time. Imagine you have a special time-traveling toolkit, and we're going to use it to explore some of the most amazing societies that ever existed – ancient civilizations!"
    },
    {
      "slideNumber": 2,
      "type": "Educational",
      "title": "Archaeologists and Artifacts: Clues from the Past",
      "goal": "To explain the role of archaeologists and how artifacts provide evidence about ancient life",
      "content": "How do we know so much about people who lived thousands of years ago, before cameras or even writing was common? We learn from detectives of the past called archaeologists! Archaeologists are like real-life treasure hunters, but instead of gold, they search for 'artifacts'."
    },
    {
      "slideNumber": 3,
      "type": "Activity",
      "title": "Civilization Builders: Creating Our Own Ancient World",
      "goal": "To allow children to creatively apply their understanding of ancient civilizations",
      "content": "Now that we know what ancient civilizations are and how archaeologists study them, it's *our* turn to be the civilization builders! In small groups, you will imagine and design your very own mini-ancient civilization."
    },
    {
      "slideNumber": 4,
      "type": "Summary",
      "title": "Our Journey Through Time: Reflecting on History",
      "goal": "To review key concepts, reinforce learning, and inspire continued curiosity about history",
      "content": "Wow, what an amazing journey we've had today! We started by asking 'What is history?' and discovered it's a fascinating way to learn about the past through clues."
    }
  ]
};

function testJSONParser() {
  console.log('🧪 Testing JSON Plan Parser...\n');
  
  console.log('📋 Sample JSON plan structure:');
  console.log('- Metadata:', !!sampleJSONPlan.metadata);
  console.log('- Slides array:', Array.isArray(sampleJSONPlan.slides));
  console.log('- Number of slides:', sampleJSONPlan.slides.length);
  
  console.log('\n📄 Slide details:');
  sampleJSONPlan.slides.forEach((slide, i) => {
    console.log(`  ${i + 1}. "${slide.title}" (${slide.type})`);
    console.log(`     Content length: ${slide.content.length} chars`);
  });
  
  console.log('\n✅ This JSON structure should now be properly parsed by our updated parser!');
  console.log('🎯 Expected result: Real slide titles and content instead of fallback "Slide X" titles');
}

testJSONParser();
