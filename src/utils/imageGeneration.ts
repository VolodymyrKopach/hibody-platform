export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  image?: string; // base64 encoded image
  prompt?: string;
  model?: string;
  error?: string;
}

// Функція для отримання базового URL
function getBaseUrl(): string {
  // Якщо ми в браузері, використовуємо window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Якщо ми на сервері, використовуємо змінні середовища або localhost
  const vercelUrl = process.env.VERCEL_URL;
  const nextPublicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  
  if (nextPublicUrl) {
    return nextPublicUrl;
  }
  
  // Fallback для локальної розробки
  return 'http://localhost:3000';
}

export async function generateImage(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const baseUrl = getBaseUrl();
    const apiUrl = `${baseUrl}/api/images`;
    
    console.log(`🔗 Generating image via: ${apiUrl}`);
    console.log(`📝 Request params:`, JSON.stringify(params, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Failed to generate image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Якщо не можемо парсити JSON, використовуємо status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed to parse error response as JSON:', parseError);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: 'Network error while generating image'
    };
  }
}

// Освітні теми та їх характеристики
const educationalTopics = {
  math: {
    keywords: ['numbers', 'counting', 'shapes', 'addition', 'subtraction', 'geometry'],
    style: 'colorful mathematical symbols, friendly number characters, geometric patterns'
  },
  science: {
    keywords: ['nature', 'animals', 'plants', 'experiments', 'discovery', 'exploration'],
    style: 'scientific illustrations, nature scenes, laboratory equipment, discovery elements'
  },
  language: {
    keywords: ['letters', 'alphabet', 'reading', 'writing', 'books', 'stories'],
    style: 'playful typography, book illustrations, storytelling scenes, letter characters'
  },
  history: {
    keywords: ['past', 'timeline', 'culture', 'traditions', 'ancient', 'historical'],
    style: 'historical illustrations, cultural elements, timeline graphics, period-appropriate'
  },
  art: {
    keywords: ['colors', 'creativity', 'drawing', 'painting', 'crafts', 'design'],
    style: 'artistic elements, paint brushes, color palettes, creative compositions'
  },
  default: {
    keywords: ['learning', 'education', 'knowledge', 'discovery', 'fun'],
    style: 'educational elements, learning materials, knowledge symbols'
  }
};

// Вікові групи та їх характеристики
const ageGroupStyles = {
  '2-3': 'very simple shapes, large elements, primary colors, minimal detail, baby-friendly',
  '4-6': 'cartoon style, bright primary colors, simple characters, playful elements',
  '7-8': 'detailed illustrations, educational focus, clear learning elements, engaging design',
  '9-10': 'sophisticated illustrations, complex concepts, detailed graphics, academic style',
  '11-13': 'realistic illustrations, advanced concepts, detailed educational content',
  '14+': 'professional educational graphics, complex visual information, mature design'
};

// Функція для створення освітніх промптів для дітей
export function createEducationalImagePrompt(
  topic: string, 
  ageGroup: string, 
  style: 'cartoon' | 'realistic' | 'illustration' = 'cartoon'
): string {
  // Визначаємо тематику
  const topicLower = topic.toLowerCase();
  let topicInfo = educationalTopics.default;
  
  for (const [key, value] of Object.entries(educationalTopics)) {
    if (value.keywords.some(keyword => topicLower.includes(keyword))) {
      topicInfo = value;
      break;
    }
  }
  
  // Визначаємо стиль для вікової групи
  const ageStyle = ageGroupStyles[ageGroup as keyof typeof ageGroupStyles] || ageGroupStyles['7-8'];
  
  // Базовий промпт
  const basePrompt = `Educational ${style} illustration for children aged ${ageGroup}`;
  
  // Стильові модифікатори
  const styleModifiers = {
    cartoon: 'cartoon style, animated characters, fun and playful',
    realistic: 'realistic but child-friendly, clear and detailed',
    illustration: 'digital art illustration, vibrant and engaging'
  };
  
  // Формуємо фінальний промпт
  const finalPrompt = [
    basePrompt,
    `about "${topic}"`,
    styleModifiers[style],
    topicInfo.style,
    ageStyle,
    'high quality, professional educational content',
    'safe for children, positive atmosphere',
    'clear and engaging visual learning',
    'bright lighting, sharp focus'
  ].join(', ');
  
  return finalPrompt;
}

// Функція для визначення оптимальних розмірів зображення для освітнього контенту
export function getOptimalImageSize(purpose: 'slide' | 'thumbnail' | 'hero' | 'activity') {
  const sizes = {
    slide: { width: 1024, height: 768 }, // стандартний розмір для слайдів
    thumbnail: { width: 512, height: 512 }, // квадратне для мініатюр
    hero: { width: 1200, height: 630 }, // широкий формат для заголовків
    activity: { width: 800, height: 600 } // для інтерактивних завдань
  };

  return sizes[purpose] || sizes.slide;
} 