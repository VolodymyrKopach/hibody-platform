import { NextRequest, NextResponse } from 'next/server';
import { createEducationalImagePrompt, getOptimalImageSize } from '@/utils/imageGeneration';

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      ageGroup, 
      slideContent, 
      imageType = 'illustration',
      style = 'cartoon',
      autoPrompt = true 
    } = await request.json();

    if (!topic && !slideContent) {
      return NextResponse.json(
        { error: 'Topic or slide content is required' },
        { status: 400 }
      );
    }

    // Автоматичне створення промпту на основі контенту слайду
    let imagePrompt: string;
    
    if (autoPrompt && slideContent) {
      // Витягуємо ключові слова з контенту слайду для створення промпту
      const keywords = extractKeywords(slideContent);
      imagePrompt = createEducationalImagePrompt(
        keywords.join(', ') || topic,
        ageGroup || '6-12',
        style
      );
    } else {
      imagePrompt = createEducationalImagePrompt(
        topic,
        ageGroup || '6-12',
        style
      );
    }

    // Додаємо контекстні модифікатори залежно від типу зображення
    const contextualPrompt = addContextualModifiers(imagePrompt, imageType, ageGroup);

    // Отримуємо оптимальний розмір для типу зображення
    const { width, height } = getOptimalImageSize(imageType as any);

    // Генерація зображення через FLUX.1 schnell
    const fluxResponse = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: contextualPrompt,
        width: width,
        height: height,
        steps: 4,
        n: 1,
        response_format: 'b64_json'
      }),
    });

    if (!fluxResponse.ok) {
      const errorData = await fluxResponse.json();
      console.error('FLUX API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate educational image' },
        { status: fluxResponse.status }
      );
    }

    const fluxData = await fluxResponse.json();
    
    if (!fluxData.data || !fluxData.data[0]) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: fluxData.data[0].b64_json,
      prompt: contextualPrompt,
      originalPrompt: imagePrompt,
      metadata: {
        topic,
        ageGroup,
        style,
        imageType,
        width,
        height,
        model: 'FLUX.1-schnell',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Slide image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Функція для витягування ключових слів з контенту слайду
function extractKeywords(content: string): string[] {
  // Прибираємо HTML теги та форматування
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/[^\w\s]/g, ' ');
  
  // Ключові слова української мови для освітнього контенту
  const educationalKeywords = [
    'математика', 'додавання', 'віднімання', 'числа', 'рахунок',
    'українська', 'літери', 'слова', 'читання', 'письмо',
    'природознавство', 'тварини', 'рослини', 'погода', 'сезони',
    'історія', 'географія', 'мистецтво', 'музика', 'спорт',
    'кольори', 'форми', 'розміри', 'порівняння'
  ];

  // Знаходимо збіги з освітніми ключовими словами
  const foundKeywords = educationalKeywords.filter(keyword => 
    cleanContent.toLowerCase().includes(keyword)
  );

  // Якщо немає збігів, витягуємо загальні іменники
  if (foundKeywords.length === 0) {
    const words = cleanContent.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3);
    return words;
  }

  return foundKeywords.slice(0, 3);
}

// Функція для додавання контекстних модифікаторів
function addContextualModifiers(prompt: string, imageType: string, ageGroup?: string): string {
  const age = ageGroup || '6-12';
  
  const typeModifiers = {
    hero: 'Large, prominent central illustration, banner style, eye-catching composition',
    illustration: 'Detailed educational illustration, informative and engaging',
    activity: 'Interactive elements visible, hands-on learning depicted, engaging activity scene',
    decoration: 'Simple decorative elements, background pattern, subtle and supportive'
  };

  const ageModifiers = {
    '3-6': 'Very simple shapes, large elements, basic colors, toddler-friendly',
    '6-12': 'Clear details, bright colors, age-appropriate complexity, school-age friendly',
    '12-18': 'More sophisticated design, detailed illustrations, teen-appropriate style'
  };

  let contextualPrompt = prompt;

  // Додаємо модифікатори типу зображення
  if (typeModifiers[imageType as keyof typeof typeModifiers]) {
    contextualPrompt += `. ${typeModifiers[imageType as keyof typeof typeModifiers]}`;
  }

  // Додаємо модифікатори віку
  const ageKey = Object.keys(ageModifiers).find(range => {
    const [min, max] = range.split('-').map(Number);
    const userAge = parseInt(age.split('-')[0]) || 8;
    return userAge >= min && userAge <= max;
  });

  if (ageKey) {
    contextualPrompt += `. ${ageModifiers[ageKey as keyof typeof ageModifiers]}`;
  }

  // Додаємо базові вимоги безпеки для дітей
  contextualPrompt += '. Child-safe content, no violence, positive atmosphere, educational value, high quality digital art.';

  return contextualPrompt;
} 