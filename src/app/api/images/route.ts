import { NextRequest, NextResponse } from 'next/server';

// Function to enhance educational prompts
function enhanceEducationalPrompt(originalPrompt: string): string {
  // Basic modifiers for educational images
  const educationalModifiers = [
    'educational content',
    'child-friendly',
    'safe for children',
    'bright and engaging',
    'high quality illustration',
    'clear and detailed',
    'positive learning environment'
  ];
  
  // Technical modifiers for FLUX
  const technicalModifiers = [
    'professional digital art',
    'vibrant colors',
    'sharp focus',
    'well-lit',
    'clean composition',
    'highly detailed'
  ];
  
  // Check if the prompt already contains educational elements
  const hasEducationalTerms = educationalModifiers.some(term => 
    originalPrompt.toLowerCase().includes(term.toLowerCase())
  );
  
  // If it already contains educational terms, add only technical ones
  if (hasEducationalTerms) {
    return `${originalPrompt}, ${technicalModifiers.slice(0, 3).join(', ')}`;
  }
  
  // Otherwise, add both educational and technical modifiers
  const selectedEducational = educationalModifiers.slice(0, 3);
  const selectedTechnical = technicalModifiers.slice(0, 2);
  
  return `${originalPrompt}, ${[...selectedEducational, ...selectedTechnical].join(', ')}`;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = '16:9', width = 1024, height = 768 } = await request.json();

    console.log('📝 [Images API] Received request:', { 
      prompt: prompt?.substring(0, 50) + '...', 
      width, 
      height,
      hasApiKey: !!process.env.TOGETHER_API_KEY,
      apiKeyLength: process.env.TOGETHER_API_KEY?.length || 0
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.TOGETHER_API_KEY) {
      console.error('❌ [Images API] TOGETHER_API_KEY is missing!');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Validate and correct dimensions for FLUX API
    // FLUX requires dimensions to be multiples of 16
    const adjustedWidth = Math.round(width / 16) * 16;
    const adjustedHeight = Math.round(height / 16) * 16;
    
    // Minimum and maximum dimensions for FLUX
    const finalWidth = Math.max(256, Math.min(2048, adjustedWidth));
    const finalHeight = Math.max(256, Math.min(2048, adjustedHeight));
    
    console.log('📐 [Images API] Dimensions adjusted:', {
      original: `${width}x${height}`,
      adjusted: `${finalWidth}x${finalHeight}`
    });

    // Enhance prompt for educational content
    const enhancedPrompt = enhanceEducationalPrompt(prompt);
    
    console.log('📤 [Images API] Calling FLUX API...');
    console.log('🎨 [Images API] Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
    
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: enhancedPrompt,
        width: finalWidth,
        height: finalHeight,
        steps: 4, // Fast generation
        n: 1,
        response_format: 'b64_json',
        // Additional parameters for better quality educational images
        guidance_scale: 3.5, // Moderate adherence to prompt
        seed: Math.floor(Math.random() * 1000000), // Random seed for diversity
      }),
    });

    console.log('📥 [Images API] FLUX Response:', { 
      status: response.status, 
      ok: response.ok 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Images API] FLUX API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Images API] FLUX Success:', { 
      hasData: !!data, 
      dataLength: data?.data?.length || 0,
      hasImage: !!data?.data?.[0]?.b64_json,
      imageLength: data?.data?.[0]?.b64_json?.length || 0
    });

    return NextResponse.json({
      success: true,
      image: data.data[0].b64_json,
      dimensions: {
        width: finalWidth,
        height: finalHeight,
        originalWidth: width,
        originalHeight: height
      }
    });

  } catch (error) {
    console.error('❌ [Images API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 