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

// Функція для створення освітніх промптів для дітей
export function createEducationalImagePrompt(
  topic: string, 
  ageGroup: string, 
  style: 'cartoon' | 'realistic' | 'illustration' = 'cartoon'
): string {
  const basePrompt = `High-quality ${style} style educational illustration for children (age ${ageGroup}) about ${topic}.`;
  
  const styleModifiers = {
    cartoon: 'Bright colors, friendly characters, simple shapes, child-friendly design',
    realistic: 'Photorealistic but appropriate for children, clear details, educational focus',
    illustration: 'Digital art style, vibrant colors, educational elements, engaging composition'
  };

  return `${basePrompt} ${styleModifiers[style]}. Safe for children, educational content, no scary elements, positive and engaging atmosphere.`;
}

// Функція для визначення оптимальних розмірів зображення для освітнього контенту
export function getOptimalImageSize(purpose: 'slide' | 'thumbnail' | 'hero' | 'activity') {
  const sizes = {
    slide: { width: 1024, height: 768 }, // 4:3 для слайдів
    thumbnail: { width: 512, height: 512 }, // квадратне для мініатюр
    hero: { width: 1200, height: 630 }, // широкий формат для заголовків
    activity: { width: 800, height: 600 } // для інтерактивних завдань
  };

  return sizes[purpose] || sizes.slide;
} 