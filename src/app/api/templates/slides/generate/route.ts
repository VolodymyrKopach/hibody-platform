import { NextRequest, NextResponse } from 'next/server';
import { SlideGenerationService } from '@/services/chat/services/SlideGenerationService';
import { SimpleSlide } from '@/types/chat';
import { createClient } from '@/lib/supabase/server';

interface TemplateSlideGenerationRequest {
  slideNumber: number;
  title: string;
  description: string;
  type: 'introduction' | 'content' | 'activity' | 'summary';
  templateData: {
    topic: string;
    ageGroup: string;
    slideCount: number;
    hasAdditionalInfo: boolean;
    additionalInfo?: string;
  };
  sessionId?: string;
  language?: 'uk' | 'en';
}

interface TemplateSlideGenerationResponse {
  success: boolean;
  slide?: SimpleSlide;
  error?: string;
  details?: string;
  slideNumber?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      slideNumber, 
      title, 
      description, 
      type, 
      templateData, 
      sessionId,
      language 
    }: TemplateSlideGenerationRequest = await request.json();

    console.log(`🎨 TEMPLATE SLIDE API: Starting slide ${slideNumber} generation...`);
    console.log('📋 TEMPLATE SLIDE API: Request details:', {
      slideNumber,
      title,
      description: description?.substring(0, 100) + '...',
      type,
      topic: templateData.topic,
      ageGroup: templateData.ageGroup,
      sessionId
    });

    // Validate required fields
    if (!slideNumber || !title || !description || !type || !templateData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: 'slideNumber, title, description, type, and templateData are required',
          slideNumber
        },
        { status: 400 }
      );
    }

    if (!templateData.topic || !templateData.ageGroup) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid template data',
          details: 'templateData must include topic and ageGroup',
          slideNumber
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Gemini API key not configured',
          slideNumber
        },
        { status: 500 }
      );
    }

    // Get authenticated Supabase client for temporary storage
    const supabase = await createClient();
    
    // Create slide generation service
    const slideGenerationService = new SlideGenerationService();
    
    try {
      console.log(`🎯 TEMPLATE SLIDE API: Generating slide ${slideNumber} with AI...`);
      
      // Enhance description with template context
      const enhancedDescription = `
${description}

Context:
- Topic: ${templateData.topic}
- Age Group: ${templateData.ageGroup}
- Slide Type: ${type}
- Slide ${slideNumber} of ${templateData.slideCount}
${templateData.hasAdditionalInfo && templateData.additionalInfo ? `- Additional Info: ${templateData.additionalInfo}` : ''}

Please create educational content appropriate for ${templateData.ageGroup} year olds about ${templateData.topic}.
      `.trim();

      // Generate the slide using existing service with language support
      const generatedSlide = await slideGenerationService.generateSlideWithLanguage(
        enhancedDescription,
        title,
        templateData.topic,
        templateData.ageGroup,
        supabase,
        language || 'en'
      );

      // Use generated slide as-is
      const templateSlide: SimpleSlide = {
        ...generatedSlide
      };

      console.log(`✅ TEMPLATE SLIDE API: Successfully generated slide ${slideNumber}:`, {
        id: templateSlide.id,
        title: templateSlide.title,
        status: templateSlide.status,
        slideNumber
      });

      const response: TemplateSlideGenerationResponse = {
        success: true,
        slide: templateSlide,
        slideNumber
      };

      return NextResponse.json(response);

    } catch (generationError) {
      console.error(`❌ TEMPLATE SLIDE API: Error during slide ${slideNumber} generation:`, generationError);
      
      const response: TemplateSlideGenerationResponse = {
        success: false,
        error: 'Failed to generate slide',
        details: generationError instanceof Error ? generationError.message : 'Unknown error',
        slideNumber
      };

      return NextResponse.json(response, { status: 500 });
    }

  } catch (error) {
    console.error('❌ TEMPLATE SLIDE API: Request error:', error);
    
    const response: TemplateSlideGenerationResponse = {
      success: false,
      error: 'Invalid request',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(response, { status: 400 });
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'Template Slide Generation API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: 'Generate a single slide from template data'
    },
    requiredFields: ['slideNumber', 'title', 'description', 'type', 'templateData'],
    optionalFields: ['sessionId'],
    templateDataFields: ['topic', 'ageGroup', 'slideCount', 'hasAdditionalInfo', 'additionalInfo?']
  });
}
