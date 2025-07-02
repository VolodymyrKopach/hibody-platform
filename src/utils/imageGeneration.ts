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

export async function generateImage(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to generate image'
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