import { NextRequest, NextResponse } from 'next/server';
import { geminiSvgService } from '@/services/images/GeminiSvgGenerationService';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateSvgRequest {
  prompt: string;
  width?: number;
  height?: number;
  complexity?: 'simple' | 'medium' | 'detailed';
  style?: 'cartoon' | 'outline' | 'geometric' | 'realistic';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSvgRequest = await request.json();
    const { prompt, width, height, complexity, style } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('📝 [SVG API] Received request:', {
      prompt: prompt.substring(0, 100),
      width,
      height,
      complexity,
      style
    });

    // Generate SVG using Gemini
    const result = await geminiSvgService.generateSvg({
      prompt,
      width: width || 1000,
      height: height || 1000,
      complexity: complexity || 'medium',
      style: style || 'outline'
    });

    if (!result.success || !result.svg) {
      console.error('❌ [SVG API] Generation failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate SVG' },
        { status: 500 }
      );
    }

    // Clean SVG for use in constructor
    const cleanedSvg = geminiSvgService.cleanSvgForConstructor(result.svg);

    console.log('✅ [SVG API] SVG generated successfully', {
      svgLength: cleanedSvg.length,
      promptLength: prompt.length
    });

    return NextResponse.json({
      success: true,
      svg: cleanedSvg,
      prompt: prompt
    });

  } catch (error) {
    console.error('❌ [SVG API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

