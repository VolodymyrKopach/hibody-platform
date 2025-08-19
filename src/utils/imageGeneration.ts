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

// Note: getBaseUrl() function removed - we now use direct function calls instead of HTTP requests

export async function generateImage(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    // Always use direct function call - faster and more reliable
    console.log(`🔗 Direct function call to images handler`);
    console.log(`📝 Request params:`, JSON.stringify(params, null, 2));
    
    // Import and call the API handler directly
    const { POST } = await import('@/app/api/images/route');
    const mockRequest = new Request('http://localhost:3000/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    const response = await POST(mockRequest as any);
    const result = await response.json();
    
    console.log(`📥 Direct call result:`, { success: result.success, hasImage: !!result.image });
    
    return result;
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: 'Network error while generating image'
    };
  }
}

// Educational topics and their characteristics
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

// Age groups and their characteristics
const ageGroupStyles = {
  '2-3': 'very simple shapes, large elements, primary colors, minimal detail, baby-friendly',
  '4-6': 'cartoon style, bright primary colors, simple characters, playful elements',
  '7-8': 'detailed illustrations, educational focus, clear learning elements, engaging design',
  '9-10': 'sophisticated illustrations, complex concepts, detailed graphics, academic style',
  '11-13': 'realistic illustrations, advanced concepts, detailed educational content',
  '14+': 'professional educational graphics, complex visual information, mature design'
};

// Function to create educational prompts for children
export function createEducationalImagePrompt(
  topic: string, 
  ageGroup: string, 
  style: 'cartoon' | 'realistic' | 'illustration' = 'cartoon'
): string {
  // Determine the topic
  const topicLower = topic.toLowerCase();
  let topicInfo = educationalTopics.default;
  
  for (const [key, value] of Object.entries(educationalTopics)) {
    if (value.keywords.some(keyword => topicLower.includes(keyword))) {
      topicInfo = value;
      break;
    }
  }
  
  // Determine the style for the age group
  const ageStyle = ageGroupStyles[ageGroup as keyof typeof ageGroupStyles] || ageGroupStyles['7-8'];
  
  // Base prompt
  const basePrompt = `Educational ${style} illustration for children aged ${ageGroup}`;
  
  // Style modifiers
  const styleModifiers = {
    cartoon: 'cartoon style, animated characters, fun and playful',
    realistic: 'realistic but child-friendly, clear and detailed',
    illustration: 'digital art illustration, vibrant and engaging'
  };
  
  // Form the final prompt
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

// Function to determine optimal image sizes for educational content
export function getOptimalImageSize(purpose: 'slide' | 'thumbnail' | 'hero' | 'activity') {
  const sizes = {
    slide: { width: 1024, height: 768 }, // standard size for slides
    thumbnail: { width: 512, height: 512 }, // square for thumbnails
    hero: { width: 1200, height: 630 }, // wide format for headers
    activity: { width: 800, height: 600 } // for interactive tasks
  };

  return sizes[purpose] || sizes.slide;
} 